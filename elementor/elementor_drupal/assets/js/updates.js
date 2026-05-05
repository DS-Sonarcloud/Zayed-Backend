
(function( $, wp, settings ) {
	var $document = $( document );
	wp = wp || {};
	wp.updates = {};
	wp.updates.ajaxNonce = settings.ajax_nonce;
	wp.updates.l10n = settings.l10n;
	wp.updates.searchTerm = '';
	wp.updates.shouldRequestFilesystemCredentials = false;
	wp.updates.filesystemCredentials = {
		ftp:       {
			host:           '',
			username:       '',
			password:       '',
			connectionType: ''
		},
		ssh:       {
			publicKey:  '',
			privateKey: ''
		},
		fsNonce: '',
		available: false
	};
	wp.updates.ajaxLocked = false;
	wp.updates.adminNotice = wp.template( 'wp-updates-admin-notice' );
	wp.updates.queue = [];
	wp.updates.$elToReturnFocusToFromCredentialsModal = undefined;
	wp.updates.addAdminNotice = function( data ) {
		var $notice = $( data.selector ), $adminNotice;
		delete data.selector;
		$adminNotice = wp.updates.adminNotice( data );
		if ( ! $notice.length ) {
			$notice = $( '#' + data.id );
		}
		if ( $notice.length ) {
			$notice.replaceWith( $adminNotice );
		} else {
			if ( 'customize' === pagenow ) {
				$( '.customize-themes-notifications' ).append( $adminNotice );
			} else {
				$( '.wrap' ).find( '> h1' ).after( $adminNotice );
			}
		}
		$document.trigger( 'wp-updates-notice-added' );
	};
	wp.updates.ajax = function( action, data ) {
		var options = {};
		if ( wp.updates.ajaxLocked ) {
			wp.updates.queue.push( {
				action: action,
				data:   data
			} );
			return $.Deferred();
		}
		wp.updates.ajaxLocked = true;
		if ( data.success ) {
			options.success = data.success;
			delete data.success;
		}
		if ( data.error ) {
			options.error = data.error;
			delete data.error;
		}
		options.data = _.extend( data, {
			action:          action,
			_ajax_nonce:     wp.updates.ajaxNonce,
			_fs_nonce:       wp.updates.filesystemCredentials.fsNonce,
			username:        wp.updates.filesystemCredentials.ftp.username,
			password:        wp.updates.filesystemCredentials.ftp.password,
			hostname:        wp.updates.filesystemCredentials.ftp.hostname,
			connection_type: wp.updates.filesystemCredentials.ftp.connectionType,
			public_key:      wp.updates.filesystemCredentials.ssh.publicKey,
			private_key:     wp.updates.filesystemCredentials.ssh.privateKey
		} );
		return wp.ajax.send( options ).always( wp.updates.ajaxAlways );
	};
	wp.updates.ajaxAlways = function( response ) {
		if ( ! response.errorCode || 'unable_to_connect_to_filesystem' !== response.errorCode ) {
			wp.updates.ajaxLocked = false;
			wp.updates.queueChecker();
		}
		if ( 'undefined' !== typeof response.debug && window.console && window.console.log ) {
			_.map( response.debug, function( message ) {
				window.console.log( $( '<p />' ).html( message ).text() );
			} );
		}
	};
	wp.updates.refreshCount = function() {
		var $adminBarUpdates              = $( '#wp-admin-bar-updates' ),
			$dashboardNavMenuUpdateCount  = $( 'a[href="update-core.php"] .update-plugins' ),
			$pluginsNavMenuUpdateCount    = $( 'a[href="plugins.php"] .update-plugins' ),
			$appearanceNavMenuUpdateCount = $( 'a[href="themes.php"] .update-plugins' ),
			itemCount;
		$adminBarUpdates.find( '.ab-item' ).removeAttr( 'title' );
		$adminBarUpdates.find( '.ab-label' ).text( settings.totals.counts.total );
		if ( 0 === settings.totals.counts.total ) {
			$adminBarUpdates.find( '.ab-label' ).parents( 'li' ).remove();
		}
		$dashboardNavMenuUpdateCount.each( function( index, element ) {
			element.className = element.className.replace( /count-\d+/, 'count-' + settings.totals.counts.total );
		} );
		if ( settings.totals.counts.total > 0 ) {
			$dashboardNavMenuUpdateCount.find( '.update-count' ).text( settings.totals.counts.total );
		} else {
			$dashboardNavMenuUpdateCount.remove();
		}
		$pluginsNavMenuUpdateCount.each( function( index, element ) {
			element.className = element.className.replace( /count-\d+/, 'count-' + settings.totals.counts.plugins );
		} );
		if ( settings.totals.counts.total > 0 ) {
			$pluginsNavMenuUpdateCount.find( '.plugin-count' ).text( settings.totals.counts.plugins );
		} else {
			$pluginsNavMenuUpdateCount.remove();
		}
		$appearanceNavMenuUpdateCount.each( function( index, element ) {
			element.className = element.className.replace( /count-\d+/, 'count-' + settings.totals.counts.themes );
		} );
		if ( settings.totals.counts.total > 0 ) {
			$appearanceNavMenuUpdateCount.find( '.theme-count' ).text( settings.totals.counts.themes );
		} else {
			$appearanceNavMenuUpdateCount.remove();
		}
		if ( 'plugins' === pagenow || 'plugins-network' === pagenow ) {
			itemCount = settings.totals.counts.plugins;
		} else if ( 'themes' === pagenow || 'themes-network' === pagenow ) {
			itemCount = settings.totals.counts.themes;
		}
		if ( itemCount > 0 ) {
			$( '.subsubsub .upgrade .count' ).text( '(' + itemCount + ')' );
		} else {
			$( '.subsubsub .upgrade' ).remove();
			$( '.subsubsub li:last' ).html( function() { return $( this ).children(); } );
		}
	};
	wp.updates.decrementCount = function( type ) {
		settings.totals.counts.total = Math.max( --settings.totals.counts.total, 0 );
		if ( 'plugin' === type ) {
			settings.totals.counts.plugins = Math.max( --settings.totals.counts.plugins, 0 );
		} else if ( 'theme' === type ) {
			settings.totals.counts.themes = Math.max( --settings.totals.counts.themes, 0 );
		}
		wp.updates.refreshCount( type );
	};
	wp.updates.updatePlugin = function( args ) {
		var $updateRow, $card, $message, message;
		args = _.extend( {
			success: wp.updates.updatePluginSuccess,
			error: wp.updates.updatePluginError
		}, args );
		if ( 'plugins' === pagenow || 'plugins-network' === pagenow ) {
			$updateRow = $( 'tr[data-plugin="' + args.plugin + '"]' );
			$message   = $updateRow.find( '.update-message' ).removeClass( 'notice-error' ).addClass( 'updating-message notice-warning' ).find( 'p' );
			message    = wp.updates.l10n.pluginUpdatingLabel.replace( '%s', $updateRow.find( '.plugin-title strong' ).text() );
		} else if ( 'plugin-install' === pagenow || 'plugin-install-network' === pagenow ) {
			$card    = $( '.plugin-card-' + args.slug );
			$message = $card.find( '.update-now' ).addClass( 'updating-message' );
			message  = wp.updates.l10n.pluginUpdatingLabel.replace( '%s', $message.data( 'name' ) );
			$card.removeClass( 'plugin-card-update-failed' ).find( '.notice.notice-error' ).remove();
		}
		if ( $message.html() !== wp.updates.l10n.updating ) {
			$message.data( 'originaltext', $message.html() );
		}
		$message
			.attr( 'aria-label', message )
			.text( wp.updates.l10n.updating );
		$document.trigger( 'wp-plugin-updating', args );
		return wp.updates.ajax( 'update-plugin', args );
	};
	wp.updates.updatePluginSuccess = function( response ) {
		var $pluginRow, $updateMessage, newText;
		if ( 'plugins' === pagenow || 'plugins-network' === pagenow ) {
			$pluginRow     = $( 'tr[data-plugin="' + response.plugin + '"]' )
				.removeClass( 'update' )
				.addClass( 'updated' );
			$updateMessage = $pluginRow.find( '.update-message' )
				.removeClass( 'updating-message notice-warning' )
				.addClass( 'updated-message notice-success' ).find( 'p' );
			newText = $pluginRow.find( '.plugin-version-author-uri' ).html().replace( response.oldVersion, response.newVersion );
			$pluginRow.find( '.plugin-version-author-uri' ).html( newText );
		} else if ( 'plugin-install' === pagenow || 'plugin-install-network' === pagenow ) {
			$updateMessage = $( '.plugin-card-' + response.slug ).find( '.update-now' )
				.removeClass( 'updating-message' )
				.addClass( 'button-disabled updated-message' );
		}
		$updateMessage
			.attr( 'aria-label', wp.updates.l10n.pluginUpdatedLabel.replace( '%s', response.pluginName ) )
			.text( wp.updates.l10n.pluginUpdated );
		wp.a11y.speak( wp.updates.l10n.updatedMsg, 'polite' );
		wp.updates.decrementCount( 'plugin' );
		$document.trigger( 'wp-plugin-update-success', response );
	};
	wp.updates.updatePluginError = function( response ) {
		var $card, $message, errorMessage;
		if ( ! wp.updates.isValidResponse( response, 'update' ) ) {
			return;
		}
		if ( wp.updates.maybeHandleCredentialError( response, 'update-plugin' ) ) {
			return;
		}
		errorMessage = wp.updates.l10n.updateFailed.replace( '%s', response.errorMessage );
		if ( 'plugins' === pagenow || 'plugins-network' === pagenow ) {
			if ( response.plugin ) {
				$message = $( 'tr[data-plugin="' + response.plugin + '"]' ).find( '.update-message' );
			} else {
				$message = $( 'tr[data-slug="' + response.slug + '"]' ).find( '.update-message' );
			}
			$message.removeClass( 'updating-message notice-warning' ).addClass( 'notice-error' ).find( 'p' ).html( errorMessage );
			if ( response.pluginName ) {
				$message.find( 'p' )
					.attr( 'aria-label', wp.updates.l10n.pluginUpdateFailedLabel.replace( '%s', response.pluginName ) );
			} else {
				$message.find( 'p' ).removeAttr( 'aria-label' );
			}
		} else if ( 'plugin-install' === pagenow || 'plugin-install-network' === pagenow ) {
			$card = $( '.plugin-card-' + response.slug )
				.addClass( 'plugin-card-update-failed' )
				.append( wp.updates.adminNotice( {
					className: 'update-message notice-error notice-alt is-dismissible',
					message:   errorMessage
				} ) );
			$card.find( '.update-now' )
				.text( wp.updates.l10n.updateFailedShort ).removeClass( 'updating-message' );
			if ( response.pluginName ) {
				$card.find( '.update-now' )
					.attr( 'aria-label', wp.updates.l10n.pluginUpdateFailedLabel.replace( '%s', response.pluginName ) );
			} else {
				$card.find( '.update-now' ).removeAttr( 'aria-label' );
			}
			$card.on( 'click', '.notice.is-dismissible .notice-dismiss', function() {
				setTimeout( function() {
					$card
						.removeClass( 'plugin-card-update-failed' )
						.find( '.column-name a' ).focus();
					$card.find( '.update-now' )
						.attr( 'aria-label', false )
						.text( wp.updates.l10n.updateNow );
				}, 200 );
			} );
		}
		wp.a11y.speak( errorMessage, 'assertive' );
		$document.trigger( 'wp-plugin-update-error', response );
	};
	wp.updates.installPlugin = function( args ) {
		var $card    = $( '.plugin-card-' + args.slug ),
			$message = $card.find( '.install-now' );
		args = _.extend( {
			success: wp.updates.installPluginSuccess,
			error: wp.updates.installPluginError
		}, args );
		if ( 'import' === pagenow ) {
			$message = $( '[data-slug="' + args.slug + '"]' );
		}
		if ( $message.html() !== wp.updates.l10n.installing ) {
			$message.data( 'originaltext', $message.html() );
		}
		$message
			.addClass( 'updating-message' )
			.attr( 'aria-label', wp.updates.l10n.pluginInstallingLabel.replace( '%s', $message.data( 'name' ) ) )
			.text( wp.updates.l10n.installing );
		wp.a11y.speak( wp.updates.l10n.installingMsg, 'polite' );
		$card.removeClass( 'plugin-card-install-failed' ).find( '.notice.notice-error' ).remove();
		$document.trigger( 'wp-plugin-installing', args );
		return wp.updates.ajax( 'install-plugin', args );
	};
	wp.updates.installPluginSuccess = function( response ) {
		var $message = $( '.plugin-card-' + response.slug ).find( '.install-now' );
		$message
			.removeClass( 'updating-message' )
			.addClass( 'updated-message installed button-disabled' )
			.attr( 'aria-label', wp.updates.l10n.pluginInstalledLabel.replace( '%s', response.pluginName ) )
			.text( wp.updates.l10n.pluginInstalled );
		wp.a11y.speak( wp.updates.l10n.installedMsg, 'polite' );
		$document.trigger( 'wp-plugin-install-success', response );
		if ( response.activateUrl ) {
			setTimeout( function() {
				$message.removeClass( 'install-now installed button-disabled updated-message' ).addClass( 'activate-now button-primary' )
					.attr( 'href', response.activateUrl )
					.attr( 'aria-label', wp.updates.l10n.activatePluginLabel.replace( '%s', response.pluginName ) )
					.text( wp.updates.l10n.activatePlugin );
			}, 1000 );
		}
	};
	wp.updates.installPluginError = function( response ) {
		var $card   = $( '.plugin-card-' + response.slug ),
			$button = $card.find( '.install-now' ),
			errorMessage;
		if ( ! wp.updates.isValidResponse( response, 'install' ) ) {
			return;
		}
		if ( wp.updates.maybeHandleCredentialError( response, 'install-plugin' ) ) {
			return;
		}
		errorMessage = wp.updates.l10n.installFailed.replace( '%s', response.errorMessage );
		$card
			.addClass( 'plugin-card-update-failed' )
			.append( '<div class="notice notice-error notice-alt is-dismissible"><p>' + errorMessage + '</p></div>' );
		$card.on( 'click', '.notice.is-dismissible .notice-dismiss', function() {
			setTimeout( function() {
				$card
					.removeClass( 'plugin-card-update-failed' )
					.find( '.column-name a' ).focus();
			}, 200 );
		} );
		$button
			.removeClass( 'updating-message' ).addClass( 'button-disabled' )
			.attr( 'aria-label', wp.updates.l10n.pluginInstallFailedLabel.replace( '%s', $button.data( 'name' ) ) )
			.text( wp.updates.l10n.installFailedShort );
		wp.a11y.speak( errorMessage, 'assertive' );
		$document.trigger( 'wp-plugin-install-error', response );
	};
	wp.updates.installImporterSuccess = function( response ) {
		wp.updates.addAdminNotice( {
			id:        'install-success',
			className: 'notice-success is-dismissible',
			message:   wp.updates.l10n.importerInstalledMsg.replace( '%s', response.activateUrl + '&from=import' )
		} );
		$( '[data-slug="' + response.slug + '"]' )
			.removeClass( 'install-now updating-message' )
			.addClass( 'activate-now' )
			.attr({
				'href': response.activateUrl + '&from=import',
				'aria-label': wp.updates.l10n.activateImporterLabel.replace( '%s', response.pluginName )
			})
			.text( wp.updates.l10n.activateImporter );
		wp.a11y.speak( wp.updates.l10n.installedMsg, 'polite' );
		$document.trigger( 'wp-importer-install-success', response );
	};
	wp.updates.installImporterError = function( response ) {
		var errorMessage = wp.updates.l10n.installFailed.replace( '%s', response.errorMessage ),
			$installLink = $( '[data-slug="' + response.slug + '"]' ),
			pluginName = $installLink.data( 'name' );
		if ( ! wp.updates.isValidResponse( response, 'install' ) ) {
			return;
		}
		if ( wp.updates.maybeHandleCredentialError( response, 'install-plugin' ) ) {
			return;
		}
		wp.updates.addAdminNotice( {
			id:        response.errorCode,
			className: 'notice-error is-dismissible',
			message:   errorMessage
		} );
		$installLink
			.removeClass( 'updating-message' )
			.text( wp.updates.l10n.installNow )
			.attr( 'aria-label', wp.updates.l10n.installNowLabel.replace( '%s', pluginName ) );
		wp.a11y.speak( errorMessage, 'assertive' );
		$document.trigger( 'wp-importer-install-error', response );
	};
	wp.updates.deletePlugin = function( args ) {
		var $link = $( '[data-plugin="' + args.plugin + '"]' ).find( '.row-actions a.delete' );
		args = _.extend( {
			success: wp.updates.deletePluginSuccess,
			error: wp.updates.deletePluginError
		}, args );
		if ( $link.html() !== wp.updates.l10n.deleting ) {
			$link
				.data( 'originaltext', $link.html() )
				.text( wp.updates.l10n.deleting );
		}
		wp.a11y.speak( wp.updates.l10n.deleting, 'polite' );
		$document.trigger( 'wp-plugin-deleting', args );
		return wp.updates.ajax( 'delete-plugin', args );
	};
	wp.updates.deletePluginSuccess = function( response ) {
		$( '[data-plugin="' + response.plugin + '"]' ).css( { backgroundColor: '#faafaa' } ).fadeOut( 350, function() {
			var $form            = $( '#bulk-action-form' ),
				$views           = $( '.subsubsub' ),
				$pluginRow       = $( this ),
				columnCount      = $form.find( 'thead th:not(.hidden), thead td' ).length,
				pluginDeletedRow = wp.template( 'item-deleted-row' ),
				plugins          = settings.plugins;
			if ( ! $pluginRow.hasClass( 'plugin-update-tr' ) ) {
				$pluginRow.after(
					pluginDeletedRow( {
						slug:    response.slug,
						plugin:  response.plugin,
						colspan: columnCount,
						name:    response.pluginName
					} )
				);
			}
			$pluginRow.remove();
			if ( -1 !== _.indexOf( plugins.upgrade, response.plugin ) ) {
				plugins.upgrade = _.without( plugins.upgrade, response.plugin );
				wp.updates.decrementCount( 'plugin' );
			}
			if ( -1 !== _.indexOf( plugins.inactive, response.plugin ) ) {
				plugins.inactive = _.without( plugins.inactive, response.plugin );
				if ( plugins.inactive.length ) {
					$views.find( '.inactive .count' ).text( '(' + plugins.inactive.length + ')' );
				} else {
					$views.find( '.inactive' ).remove();
				}
			}
			if ( -1 !== _.indexOf( plugins.active, response.plugin ) ) {
				plugins.active = _.without( plugins.active, response.plugin );
				if ( plugins.active.length ) {
					$views.find( '.active .count' ).text( '(' + plugins.active.length + ')' );
				} else {
					$views.find( '.active' ).remove();
				}
			}
			if ( -1 !== _.indexOf( plugins.recently_activated, response.plugin ) ) {
				plugins.recently_activated = _.without( plugins.recently_activated, response.plugin );
				if ( plugins.recently_activated.length ) {
					$views.find( '.recently_activated .count' ).text( '(' + plugins.recently_activated.length + ')' );
				} else {
					$views.find( '.recently_activated' ).remove();
				}
			}
			plugins.all = _.without( plugins.all, response.plugin );
			if ( plugins.all.length ) {
				$views.find( '.all .count' ).text( '(' + plugins.all.length + ')' );
			} else {
				$form.find( '.tablenav' ).css( { visibility: 'hidden' } );
				$views.find( '.all' ).remove();
				if ( ! $form.find( 'tr.no-items' ).length ) {
					$form.find( '#the-list' ).append( '<tr class="no-items"><td class="colspanchange" colspan="' + columnCount + '">' + wp.updates.l10n.noPlugins + '</td></tr>' );
				}
			}
		} );
		wp.a11y.speak( wp.updates.l10n.pluginDeleted, 'polite' );
		$document.trigger( 'wp-plugin-delete-success', response );
	};
	wp.updates.deletePluginError = function( response ) {
		var $plugin, $pluginUpdateRow,
			pluginUpdateRow  = wp.template( 'item-update-row' ),
			noticeContent    = wp.updates.adminNotice( {
				className: 'update-message notice-error notice-alt',
				message:   response.errorMessage
			} );
		if ( response.plugin ) {
			$plugin          = $( 'tr.inactive[data-plugin="' + response.plugin + '"]' );
			$pluginUpdateRow = $plugin.siblings( '[data-plugin="' + response.plugin + '"]' );
		} else {
			$plugin          = $( 'tr.inactive[data-slug="' + response.slug + '"]' );
			$pluginUpdateRow = $plugin.siblings( '[data-slug="' + response.slug + '"]' );
		}
		if ( ! wp.updates.isValidResponse( response, 'delete' ) ) {
			return;
		}
		if ( wp.updates.maybeHandleCredentialError( response, 'delete-plugin' ) ) {
			return;
		}
		if ( ! $pluginUpdateRow.length ) {
			$plugin.addClass( 'update' ).after(
				pluginUpdateRow( {
					slug:    response.slug,
					plugin:  response.plugin || response.slug,
					colspan: $( '#bulk-action-form' ).find( 'thead th:not(.hidden), thead td' ).length,
					content: noticeContent
				} )
			);
		} else {
			$pluginUpdateRow.find( '.notice-error' ).remove();
			$pluginUpdateRow.find( '.plugin-update' ).append( noticeContent );
		}
		$document.trigger( 'wp-plugin-delete-error', response );
	};
	wp.updates.updateTheme = function( args ) {
		var $notice;
		args = _.extend( {
			success: wp.updates.updateThemeSuccess,
			error: wp.updates.updateThemeError
		}, args );
		if ( 'themes-network' === pagenow ) {
			$notice = $( '[data-slug="' + args.slug + '"]' ).find( '.update-message' ).removeClass( 'notice-error' ).addClass( 'updating-message notice-warning' ).find( 'p' );
		} else if ( 'customize' === pagenow ) {
			$notice = $( '[data-slug="' + args.slug + '"].notice' ).removeClass( 'notice-large' );
			$notice.find( 'h3' ).remove();
			$notice = $notice.add( $( '#customize-control-installed_theme_' + args.slug ).find( '.update-message' ) );
			$notice = $notice.addClass( 'updating-message' ).find( 'p' );
		} else {
			$notice = $( '#update-theme' ).closest( '.notice' ).removeClass( 'notice-large' );
			$notice.find( 'h3' ).remove();
			$notice = $notice.add( $( '[data-slug="' + args.slug + '"]' ).find( '.update-message' ) );
			$notice = $notice.addClass( 'updating-message' ).find( 'p' );
		}
		if ( $notice.html() !== wp.updates.l10n.updating ) {
			$notice.data( 'originaltext', $notice.html() );
		}
		wp.a11y.speak( wp.updates.l10n.updatingMsg, 'polite' );
		$notice.text( wp.updates.l10n.updating );
		$document.trigger( 'wp-theme-updating', args );
		return wp.updates.ajax( 'update-theme', args );
	};
	wp.updates.updateThemeSuccess = function( response ) {
		var isModalOpen    = $( 'body.modal-open' ).length,
			$theme         = $( '[data-slug="' + response.slug + '"]' ),
			updatedMessage = {
				className: 'updated-message notice-success notice-alt',
				message:   wp.updates.l10n.themeUpdated
			},
			$notice, newText;
		if ( 'customize' === pagenow ) {
			$theme = $( '.updating-message' ).siblings( '.theme-name' );
			if ( $theme.length ) {
				newText = $theme.html().replace( response.oldVersion, response.newVersion );
				$theme.html( newText );
			}
			$notice = $( '.theme-info .notice' ).add( wp.customize.control( 'installed_theme_' + response.slug ).container.find( '.theme' ).find( '.update-message' ) );
		} else if ( 'themes-network' === pagenow ) {
			$notice = $theme.find( '.update-message' );
			newText = $theme.find( '.theme-version-author-uri' ).html().replace( response.oldVersion, response.newVersion );
			$theme.find( '.theme-version-author-uri' ).html( newText );
		} else {
			$notice = $( '.theme-info .notice' ).add( $theme.find( '.update-message' ) );
			if ( isModalOpen ) {
				$( '.load-customize:visible' ).focus();
			} else {
				$theme.find( '.load-customize' ).focus();
			}
		}
		wp.updates.addAdminNotice( _.extend( { selector: $notice }, updatedMessage ) );
		wp.a11y.speak( wp.updates.l10n.updatedMsg, 'polite' );
		wp.updates.decrementCount( 'theme' );
		$document.trigger( 'wp-theme-update-success', response );
		if ( isModalOpen && 'customize' !== pagenow ) {
			$( '.theme-info .theme-author' ).after( wp.updates.adminNotice( updatedMessage ) );
		}
	};
	wp.updates.updateThemeError = function( response ) {
		var $theme       = $( '[data-slug="' + response.slug + '"]' ),
			errorMessage = wp.updates.l10n.updateFailed.replace( '%s', response.errorMessage ),
			$notice;
		if ( ! wp.updates.isValidResponse( response, 'update' ) ) {
			return;
		}
		if ( wp.updates.maybeHandleCredentialError( response, 'update-theme' ) ) {
			return;
		}
		if ( 'customize' === pagenow ) {
			$theme = wp.customize.control( 'installed_theme_' + response.slug ).container.find( '.theme' );
		}
		if ( 'themes-network' === pagenow ) {
			$notice = $theme.find( '.update-message ' );
		} else {
			$notice = $( '.theme-info .notice' ).add( $theme.find( '.notice' ) );
			$( 'body.modal-open' ).length ? $( '.load-customize:visible' ).focus() : $theme.find( '.load-customize' ).focus();
		}
		wp.updates.addAdminNotice( {
			selector:  $notice,
			className: 'update-message notice-error notice-alt is-dismissible',
			message:   errorMessage
		} );
		wp.a11y.speak( errorMessage, 'polite' );
		$document.trigger( 'wp-theme-update-error', response );
	};
	wp.updates.installTheme = function( args ) {
		var $message = $( '.theme-install[data-slug="' + args.slug + '"]' );
		args = _.extend( {
			success: wp.updates.installThemeSuccess,
			error: wp.updates.installThemeError
		}, args );
		$message.addClass( 'updating-message' );
		$message.parents( '.theme' ).addClass( 'focus' );
		if ( $message.html() !== wp.updates.l10n.installing ) {
			$message.data( 'originaltext', $message.html() );
		}
		$message
			.text( wp.updates.l10n.installing )
			.attr( 'aria-label', wp.updates.l10n.themeInstallingLabel.replace( '%s', $message.data( 'name' ) ) );
		wp.a11y.speak( wp.updates.l10n.installingMsg, 'polite' );
		$( '.install-theme-info, [data-slug="' + args.slug + '"]' ).removeClass( 'theme-install-failed' ).find( '.notice.notice-error' ).remove();
		$document.trigger( 'wp-theme-installing', args );
		return wp.updates.ajax( 'install-theme', args );
	};
	wp.updates.installThemeSuccess = function( response ) {
		var $card = $( '.wp-full-overlay-header, [data-slug=' + response.slug + ']' ),
			$message;
		$document.trigger( 'wp-theme-install-success', response );
		$message = $card.find( '.button-primary' )
			.removeClass( 'updating-message' )
			.addClass( 'updated-message disabled' )
			.attr( 'aria-label', wp.updates.l10n.themeInstalledLabel.replace( '%s', response.themeName ) )
			.text( wp.updates.l10n.themeInstalled );
		wp.a11y.speak( wp.updates.l10n.installedMsg, 'polite' );
		setTimeout( function() {
			if ( response.activateUrl ) {
				$message
					.attr( 'href', response.activateUrl )
					.removeClass( 'theme-install updated-message disabled' )
					.addClass( 'activate' )
					.attr( 'aria-label', wp.updates.l10n.activateThemeLabel.replace( '%s', response.themeName ) )
					.text( wp.updates.l10n.activateTheme );
			}
			if ( response.customizeUrl ) {
				$message.siblings( '.preview' ).replaceWith( function () {
					return $( '<a>' )
						.attr( 'href', response.customizeUrl )
						.addClass( 'button load-customize' )
						.text( wp.updates.l10n.livePreview );
				} );
			}
		}, 1000 );
	};
	wp.updates.installThemeError = function( response ) {
		var $card, $button,
			errorMessage = wp.updates.l10n.installFailed.replace( '%s', response.errorMessage ),
			$message     = wp.updates.adminNotice( {
				className: 'update-message notice-error notice-alt',
				message:   errorMessage
			} );
		if ( ! wp.updates.isValidResponse( response, 'install' ) ) {
			return;
		}
		if ( wp.updates.maybeHandleCredentialError( response, 'install-theme' ) ) {
			return;
		}
		if ( 'customize' === pagenow ) {
			if ( $document.find( 'body' ).hasClass( 'modal-open' ) ) {
				$button = $( '.theme-install[data-slug="' + response.slug + '"]' );
				$card   = $( '.theme-overlay .theme-info' ).prepend( $message );
			} else {
				$button = $( '.theme-install[data-slug="' + response.slug + '"]' );
				$card   = $button.closest( '.theme' ).addClass( 'theme-install-failed' ).append( $message );
			}
			wp.customize.notifications.remove( 'theme_installing' );
		} else {
			if ( $document.find( 'body' ).hasClass( 'full-overlay-active' ) ) {
				$button = $( '.theme-install[data-slug="' + response.slug + '"]' );
				$card   = $( '.install-theme-info' ).prepend( $message );
			} else {
				$card   = $( '[data-slug="' + response.slug + '"]' ).removeClass( 'focus' ).addClass( 'theme-install-failed' ).append( $message );
				$button = $card.find( '.theme-install' );
			}
		}
		$button
			.removeClass( 'updating-message' )
			.attr( 'aria-label', wp.updates.l10n.themeInstallFailedLabel.replace( '%s', $button.data( 'name' ) ) )
			.text( wp.updates.l10n.installFailedShort );
		wp.a11y.speak( errorMessage, 'assertive' );
		$document.trigger( 'wp-theme-install-error', response );
	};
	wp.updates.deleteTheme = function( args ) {
		var $button;
		if ( 'themes' === pagenow ) {
			$button = $( '.theme-actions .delete-theme' );
		} else if ( 'themes-network' === pagenow ) {
			$button = $( '[data-slug="' + args.slug + '"]' ).find( '.row-actions a.delete' );
		}
		args = _.extend( {
			success: wp.updates.deleteThemeSuccess,
			error: wp.updates.deleteThemeError
		}, args );
		if ( $button && $button.html() !== wp.updates.l10n.deleting ) {
			$button
				.data( 'originaltext', $button.html() )
				.text( wp.updates.l10n.deleting );
		}
		wp.a11y.speak( wp.updates.l10n.deleting, 'polite' );
		$( '.theme-info .update-message' ).remove();
		$document.trigger( 'wp-theme-deleting', args );
		return wp.updates.ajax( 'delete-theme', args );
	};
	wp.updates.deleteThemeSuccess = function( response ) {
		var $themeRows = $( '[data-slug="' + response.slug + '"]' );
		if ( 'themes-network' === pagenow ) {
			$themeRows.css( { backgroundColor: '#faafaa' } ).fadeOut( 350, function() {
				var $views     = $( '.subsubsub' ),
					$themeRow  = $( this ),
					totals     = settings.themes,
					deletedRow = wp.template( 'item-deleted-row' );
				if ( ! $themeRow.hasClass( 'plugin-update-tr' ) ) {
					$themeRow.after(
						deletedRow( {
							slug:    response.slug,
							colspan: $( '#bulk-action-form' ).find( 'thead th:not(.hidden), thead td' ).length,
							name:    $themeRow.find( '.theme-title strong' ).text()
						} )
					);
				}
				$themeRow.remove();
				if ( $themeRow.hasClass( 'update' ) ) {
					totals.upgrade--;
					wp.updates.decrementCount( 'theme' );
				}
				if ( $themeRow.hasClass( 'inactive' ) ) {
					totals.disabled--;
					if ( totals.disabled ) {
						$views.find( '.disabled .count' ).text( '(' + totals.disabled + ')' );
					} else {
						$views.find( '.disabled' ).remove();
					}
				}
				$views.find( '.all .count' ).text( '(' + --totals.all + ')' );
			} );
		}
		wp.a11y.speak( wp.updates.l10n.themeDeleted, 'polite' );
		$document.trigger( 'wp-theme-delete-success', response );
	};
	wp.updates.deleteThemeError = function( response ) {
		var $themeRow    = $( 'tr.inactive[data-slug="' + response.slug + '"]' ),
			$button      = $( '.theme-actions .delete-theme' ),
			updateRow    = wp.template( 'item-update-row' ),
			$updateRow   = $themeRow.siblings( '#' + response.slug + '-update' ),
			errorMessage = wp.updates.l10n.deleteFailed.replace( '%s', response.errorMessage ),
			$message     = wp.updates.adminNotice( {
				className: 'update-message notice-error notice-alt',
				message:   errorMessage
			} );
		if ( wp.updates.maybeHandleCredentialError( response, 'delete-theme' ) ) {
			return;
		}
		if ( 'themes-network' === pagenow ) {
			if ( ! $updateRow.length ) {
				$themeRow.addClass( 'update' ).after(
					updateRow( {
						slug: response.slug,
						colspan: $( '#bulk-action-form' ).find( 'thead th:not(.hidden), thead td' ).length,
						content: $message
					} )
				);
			} else {
				$updateRow.find( '.notice-error' ).remove();
				$updateRow.find( '.plugin-update' ).append( $message );
			}
		} else {
			$( '.theme-info .theme-description' ).before( $message );
		}
		$button.html( $button.data( 'originaltext' ) );
		wp.a11y.speak( errorMessage, 'assertive' );
		$document.trigger( 'wp-theme-delete-error', response );
	};
	wp.updates._addCallbacks = function( data, action ) {
		if ( 'import' === pagenow && 'install-plugin' === action ) {
			data.success = wp.updates.installImporterSuccess;
			data.error   = wp.updates.installImporterError;
		}
		return data;
	};
	wp.updates.queueChecker = function() {
		var job;
		if ( wp.updates.ajaxLocked || ! wp.updates.queue.length ) {
			return;
		}
		job = wp.updates.queue.shift();
		switch ( job.action ) {
			case 'install-plugin':
				wp.updates.installPlugin( job.data );
				break;
			case 'update-plugin':
				wp.updates.updatePlugin( job.data );
				break;
			case 'delete-plugin':
				wp.updates.deletePlugin( job.data );
				break;
			case 'install-theme':
				wp.updates.installTheme( job.data );
				break;
			case 'update-theme':
				wp.updates.updateTheme( job.data );
				break;
			case 'delete-theme':
				wp.updates.deleteTheme( job.data );
				break;
			default:
				break;
		}
	};
	wp.updates.requestFilesystemCredentials = function( event ) {
		if ( false === wp.updates.filesystemCredentials.available ) {
			if ( event && ! wp.updates.$elToReturnFocusToFromCredentialsModal ) {
				wp.updates.$elToReturnFocusToFromCredentialsModal = $( event.target );
			}
			wp.updates.ajaxLocked = true;
			wp.updates.requestForCredentialsModalOpen();
		}
	};
	wp.updates.maybeRequestFilesystemCredentials = function( event ) {
		if ( wp.updates.shouldRequestFilesystemCredentials && ! wp.updates.ajaxLocked ) {
			wp.updates.requestFilesystemCredentials( event );
		}
	};
	wp.updates.keydown = function( event ) {
		if ( 27 === event.keyCode ) {
			wp.updates.requestForCredentialsModalCancel();
		} else if ( 9 === event.keyCode ) {
			if ( 'upgrade' === event.target.id && ! event.shiftKey ) {
				$( '#hostname' ).focus();
				event.preventDefault();
			} else if ( 'hostname' === event.target.id && event.shiftKey ) {
				$( '#upgrade' ).focus();
				event.preventDefault();
			}
		}
	};
	wp.updates.requestForCredentialsModalOpen = function() {
		var $modal = $( '#request-filesystem-credentials-dialog' );
		$( 'body' ).addClass( 'modal-open' );
		$modal.show();
		$modal.find( 'input:enabled:first' ).focus();
		$modal.on( 'keydown', wp.updates.keydown );
	};
	wp.updates.requestForCredentialsModalClose = function() {
		$( '#request-filesystem-credentials-dialog' ).hide();
		$( 'body' ).removeClass( 'modal-open' );
		if ( wp.updates.$elToReturnFocusToFromCredentialsModal ) {
			wp.updates.$elToReturnFocusToFromCredentialsModal.focus();
		}
	};
	wp.updates.requestForCredentialsModalCancel = function() {
		if ( ! wp.updates.ajaxLocked && ! wp.updates.queue.length ) {
			return;
		}
		_.each( wp.updates.queue, function( job ) {
			$document.trigger( 'credential-modal-cancel', job );
		} );
		wp.updates.ajaxLocked = false;
		wp.updates.queue = [];
		wp.updates.requestForCredentialsModalClose();
	};
	wp.updates.showErrorInCredentialsForm = function( message ) {
		var $filesystemForm = $( '#request-filesystem-credentials-form' );
		$filesystemForm.find( '.notice' ).remove();
		$filesystemForm.find( '#request-filesystem-credentials-title' ).after( '<div class="notice notice-alt notice-error"><p>' + message + '</p></div>' );
	};
	wp.updates.credentialError = function( response, action ) {
		response = wp.updates._addCallbacks( response, action );
		wp.updates.queue.unshift( {
			action: action,
			data: response
		} );
		wp.updates.filesystemCredentials.available = false;
		wp.updates.showErrorInCredentialsForm( response.errorMessage );
		wp.updates.requestFilesystemCredentials();
	};
	wp.updates.maybeHandleCredentialError = function( response, action ) {
		if ( wp.updates.shouldRequestFilesystemCredentials && response.errorCode && 'unable_to_connect_to_filesystem' === response.errorCode ) {
			wp.updates.credentialError( response, action );
			return true;
		}
		return false;
	};
	wp.updates.isValidResponse = function( response, action ) {
		var error = wp.updates.l10n.unknownError,
		    errorMessage;
		if ( _.isObject( response ) && ! _.isFunction( response.always ) ) {
			return true;
		}
		if ( _.isString( response ) && '-1' === response ) {
			error = wp.updates.l10n.nonceError;
		} else if ( _.isString( response ) ) {
			error = response;
		} else if ( 'undefined' !== typeof response.readyState && 0 === response.readyState ) {
			error = wp.updates.l10n.connectionError;
		} else if ( _.isString( response.responseText ) && '' !== response.responseText ) {
			error = response.responseText;
		} else if ( _.isString( response.statusText ) ) {
			error = response.statusText;
		}
		switch ( action ) {
			case 'update':
				errorMessage = wp.updates.l10n.updateFailed;
				break;
			case 'install':
				errorMessage = wp.updates.l10n.installFailed;
				break;
			case 'delete':
				errorMessage = wp.updates.l10n.deleteFailed;
				break;
		}
		error = error.replace( /<[\/a-z][^<>]*>/gi, '' );
		errorMessage = errorMessage.replace( '%s', error );
		wp.updates.addAdminNotice( {
			id:        'unknown_error',
			className: 'notice-error is-dismissible',
			message:   _.escape( errorMessage )
		} );
		wp.updates.ajaxLocked = false;
		wp.updates.queue      = [];
		$( '.button.updating-message' )
			.removeClass( 'updating-message' )
			.removeAttr( 'aria-label' )
			.prop( 'disabled', true )
			.text( wp.updates.l10n.updateFailedShort );
		$( '.updating-message:not(.button):not(.thickbox)' )
			.removeClass( 'updating-message notice-warning' )
			.addClass( 'notice-error' )
			.find( 'p' )
				.removeAttr( 'aria-label' )
				.text( errorMessage );
		wp.a11y.speak( errorMessage, 'assertive' );
		return false;
	};
	wp.updates.beforeunload = function() {
		if ( wp.updates.ajaxLocked ) {
			return wp.updates.l10n.beforeunload;
		}
	};
	$( function() {
		var $pluginFilter        = $( '#plugin-filter' ),
			$bulkActionForm      = $( '#bulk-action-form' ),
			$filesystemForm      = $( '#request-filesystem-credentials-form' ),
			$filesystemModal     = $( '#request-filesystem-credentials-dialog' ),
			$pluginSearch        = $( '.plugins-php .wp-filter-search' ),
			$pluginInstallSearch = $( '.plugin-install-php .wp-filter-search' );
		settings = _.extend( settings, window._wpUpdatesItemCounts || {} );
		if ( settings.totals ) {
			wp.updates.refreshCount();
		}
		wp.updates.shouldRequestFilesystemCredentials = $filesystemModal.length > 0;
		$filesystemModal.on( 'submit', 'form', function( event ) {
			event.preventDefault();
			wp.updates.filesystemCredentials.ftp.hostname       = $( '#hostname' ).val();
			wp.updates.filesystemCredentials.ftp.username       = $( '#username' ).val();
			wp.updates.filesystemCredentials.ftp.password       = $( '#password' ).val();
			wp.updates.filesystemCredentials.ftp.connectionType = $( 'input[name="connection_type"]:checked' ).val();
			wp.updates.filesystemCredentials.ssh.publicKey      = $( '#public_key' ).val();
			wp.updates.filesystemCredentials.ssh.privateKey     = $( '#private_key' ).val();
			wp.updates.filesystemCredentials.fsNonce            = $( '#_fs_nonce' ).val();
			wp.updates.filesystemCredentials.available          = true;
			wp.updates.ajaxLocked = false;
			wp.updates.queueChecker();
			wp.updates.requestForCredentialsModalClose();
		} );
		$filesystemModal.on( 'click', '[data-js-action="close"], .notification-dialog-background', wp.updates.requestForCredentialsModalCancel );
		$filesystemForm.on( 'change', 'input[name="connection_type"]', function() {
			$( '#ssh-keys' ).toggleClass( 'hidden', ( 'ssh' !== $( this ).val() ) );
		} ).change();
		$document.on( 'credential-modal-cancel', function( event, job ) {
			var $updatingMessage = $( '.updating-message' ),
				$message, originalText;
			if ( 'import' === pagenow ) {
				$updatingMessage.removeClass( 'updating-message' );
			} else if ( 'plugins' === pagenow || 'plugins-network' === pagenow ) {
				if ( 'update-plugin' === job.action ) {
					$message = $( 'tr[data-plugin="' + job.data.plugin + '"]' ).find( '.update-message' );
				} else if ( 'delete-plugin' === job.action ) {
					$message = $( '[data-plugin="' + job.data.plugin + '"]' ).find( '.row-actions a.delete' );
				}
			} else if ( 'themes' === pagenow || 'themes-network' === pagenow ) {
				if ( 'update-theme' === job.action ) {
					$message = $( '[data-slug="' + job.data.slug + '"]' ).find( '.update-message' );
				} else if ( 'delete-theme' === job.action && 'themes-network' === pagenow ) {
					$message = $( '[data-slug="' + job.data.slug + '"]' ).find( '.row-actions a.delete' );
				} else if ( 'delete-theme' === job.action && 'themes' === pagenow ) {
					$message = $( '.theme-actions .delete-theme' );
				}
			} else {
				$message = $updatingMessage;
			}
			if ( $message && $message.hasClass( 'updating-message' ) ) {
				originalText = $message.data( 'originaltext' );
				if ( 'undefined' === typeof originalText ) {
					originalText = $( '<p>' ).html( $message.find( 'p' ).data( 'originaltext' ) );
				}
				$message
					.removeClass( 'updating-message' )
					.html( originalText );
				if ( 'plugin-install' === pagenow || 'plugin-install-network' === pagenow ) {
					if ( 'update-plugin' === job.action ) {
						$message.attr( 'aria-label', wp.updates.l10n.pluginUpdateNowLabel.replace( '%s', $message.data( 'name' ) ) );
					} else if ( 'install-plugin' === job.action ) {
						$message.attr( 'aria-label', wp.updates.l10n.pluginInstallNowLabel.replace( '%s', $message.data( 'name' ) ) );
					}
				}
			}
			wp.a11y.speak( wp.updates.l10n.updateCancel, 'polite' );
		} );
		$bulkActionForm.on( 'click', '[data-plugin] .update-link', function( event ) {
			var $message   = $( event.target ),
				$pluginRow = $message.parents( 'tr' );
			event.preventDefault();
			if ( $message.hasClass( 'updating-message' ) || $message.hasClass( 'button-disabled' ) ) {
				return;
			}
			wp.updates.maybeRequestFilesystemCredentials( event );
			wp.updates.$elToReturnFocusToFromCredentialsModal = $pluginRow.find( '.check-column input' );
			wp.updates.updatePlugin( {
				plugin: $pluginRow.data( 'plugin' ),
				slug:   $pluginRow.data( 'slug' )
			} );
		} );
		$pluginFilter.on( 'click', '.update-now', function( event ) {
			var $button = $( event.target );
			event.preventDefault();
			if ( $button.hasClass( 'updating-message' ) || $button.hasClass( 'button-disabled' ) ) {
				return;
			}
			wp.updates.maybeRequestFilesystemCredentials( event );
			wp.updates.updatePlugin( {
				plugin: $button.data( 'plugin' ),
				slug:   $button.data( 'slug' )
			} );
		} );
		$pluginFilter.on( 'click', '.install-now', function( event ) {
			var $button = $( event.target );
			event.preventDefault();
			if ( $button.hasClass( 'updating-message' ) || $button.hasClass( 'button-disabled' ) ) {
				return;
			}
			if ( wp.updates.shouldRequestFilesystemCredentials && ! wp.updates.ajaxLocked ) {
				wp.updates.requestFilesystemCredentials( event );
				$document.on( 'credential-modal-cancel', function() {
					var $message = $( '.install-now.updating-message' );
					$message
						.removeClass( 'updating-message' )
						.text( wp.updates.l10n.installNow );
					wp.a11y.speak( wp.updates.l10n.updateCancel, 'polite' );
				} );
			}
			wp.updates.installPlugin( {
				slug: $button.data( 'slug' )
			} );
		} );
		$document.on( 'click', '.importer-item .install-now', function( event ) {
			var $button = $( event.target ),
				pluginName = $( this ).data( 'name' );
			event.preventDefault();
			if ( $button.hasClass( 'updating-message' ) ) {
				return;
			}
			if ( wp.updates.shouldRequestFilesystemCredentials && ! wp.updates.ajaxLocked ) {
				wp.updates.requestFilesystemCredentials( event );
				$document.on( 'credential-modal-cancel', function() {
					$button
						.removeClass( 'updating-message' )
						.text( wp.updates.l10n.installNow )
						.attr( 'aria-label', wp.updates.l10n.installNowLabel.replace( '%s', pluginName ) );
					wp.a11y.speak( wp.updates.l10n.updateCancel, 'polite' );
				} );
			}
			wp.updates.installPlugin( {
				slug:    $button.data( 'slug' ),
				pagenow: pagenow,
				success: wp.updates.installImporterSuccess,
				error:   wp.updates.installImporterError
			} );
		} );
		$bulkActionForm.on( 'click', '[data-plugin] a.delete', function( event ) {
			var $pluginRow = $( event.target ).parents( 'tr' );
			event.preventDefault();
			if ( ! window.confirm( wp.updates.l10n.aysDeleteUninstall.replace( '%s', $pluginRow.find( '.plugin-title strong' ).text() ) ) ) {
				return;
			}
			wp.updates.maybeRequestFilesystemCredentials( event );
			wp.updates.deletePlugin( {
				plugin: $pluginRow.data( 'plugin' ),
				slug:   $pluginRow.data( 'slug' )
			} );
		} );
		$document.on( 'click', '.themes-php.network-admin .update-link', function( event ) {
			var $message  = $( event.target ),
				$themeRow = $message.parents( 'tr' );
			event.preventDefault();
			if ( $message.hasClass( 'updating-message' ) || $message.hasClass( 'button-disabled' ) ) {
				return;
			}
			wp.updates.maybeRequestFilesystemCredentials( event );
			wp.updates.$elToReturnFocusToFromCredentialsModal = $themeRow.find( '.check-column input' );
			wp.updates.updateTheme( {
				slug: $themeRow.data( 'slug' )
			} );
		} );
		$document.on( 'click', '.themes-php.network-admin a.delete', function( event ) {
			var $themeRow = $( event.target ).parents( 'tr' );
			event.preventDefault();
			if ( ! window.confirm( wp.updates.l10n.aysDelete.replace( '%s', $themeRow.find( '.theme-title strong' ).text() ) ) ) {
				return;
			}
			wp.updates.maybeRequestFilesystemCredentials( event );
			wp.updates.deleteTheme( {
				slug: $themeRow.data( 'slug' )
			} );
		} );
		$bulkActionForm.on( 'click', '[type="submit"]:not([name="clear-recent-list"])', function( event ) {
			var bulkAction    = $( event.target ).siblings( 'select' ).val(),
				itemsSelected = $bulkActionForm.find( 'input[name="checked[]"]:checked' ),
				success       = 0,
				error         = 0,
				errorMessages = [],
				type, action;
			switch ( pagenow ) {
				case 'plugins':
				case 'plugins-network':
					type = 'plugin';
					break;
				case 'themes-network':
					type = 'theme';
					break;
				default:
					return;
			}
			if ( ! itemsSelected.length ) {
				event.preventDefault();
				$( 'html, body' ).animate( { scrollTop: 0 } );
				return wp.updates.addAdminNotice( {
					id:        'no-items-selected',
					className: 'notice-error is-dismissible',
					message:   wp.updates.l10n.noItemsSelected
				} );
			}
			switch ( bulkAction ) {
				case 'update-selected':
					action = bulkAction.replace( 'selected', type );
					break;
				case 'delete-selected':
					if ( ! window.confirm( 'plugin' === type ? wp.updates.l10n.aysBulkDelete : wp.updates.l10n.aysBulkDeleteThemes ) ) {
						event.preventDefault();
						return;
					}
					action = bulkAction.replace( 'selected', type );
					break;
				default:
					return;
			}
			wp.updates.maybeRequestFilesystemCredentials( event );
			event.preventDefault();
			$bulkActionForm.find( '.manage-column [type="checkbox"]' ).prop( 'checked', false );
			$document.trigger( 'wp-' + type + '-bulk-' + bulkAction, itemsSelected );
			itemsSelected.each( function( index, element ) {
				var $checkbox = $( element ),
					$itemRow = $checkbox.parents( 'tr' );
				if ( 'update-selected' === bulkAction && ( ! $itemRow.hasClass( 'update' ) || $itemRow.find( 'notice-error' ).length ) ) {
					$checkbox.prop( 'checked', false );
					return;
				}
				wp.updates.queue.push( {
					action: action,
					data:   {
						plugin: $itemRow.data( 'plugin' ),
						slug:   $itemRow.data( 'slug' )
					}
				} );
			} );
			$document.on( 'wp-plugin-update-success wp-plugin-update-error wp-theme-update-success wp-theme-update-error', function( event, response ) {
				var $itemRow = $( '[data-slug="' + response.slug + '"]' ),
					$bulkActionNotice, itemName;
				if ( 'wp-' + response.update + '-update-success' === event.type ) {
					success++;
				} else {
					itemName = response.pluginName ? response.pluginName : $itemRow.find( '.column-primary strong' ).text();
					error++;
					errorMessages.push( itemName + ': ' + response.errorMessage );
				}
				$itemRow.find( 'input[name="checked[]"]:checked' ).prop( 'checked', false );
				wp.updates.adminNotice = wp.template( 'wp-bulk-updates-admin-notice' );
				wp.updates.addAdminNotice( {
					id:            'bulk-action-notice',
					className:     'bulk-action-notice',
					successes:     success,
					errors:        error,
					errorMessages: errorMessages,
					type:          response.update
				} );
				$bulkActionNotice = $( '#bulk-action-notice' ).on( 'click', 'button', function() {
					$( this )
						.toggleClass( 'bulk-action-errors-collapsed' )
						.attr( 'aria-expanded', ! $( this ).hasClass( 'bulk-action-errors-collapsed' ) );
					$bulkActionNotice.find( '.bulk-action-errors' ).toggleClass( 'hidden' );
				} );
				if ( error > 0 && ! wp.updates.queue.length ) {
					$( 'html, body' ).animate( { scrollTop: 0 } );
				}
			} );
			$document.on( 'wp-updates-notice-added', function() {
				wp.updates.adminNotice = wp.template( 'wp-updates-admin-notice' );
			} );
			wp.updates.queueChecker();
		} );
		if ( $pluginInstallSearch.length ) {
			$pluginInstallSearch.attr( 'aria-describedby', 'live-search-desc' );
		}
		$pluginInstallSearch.on( 'keyup input', _.debounce( function( event, eventtype ) {
			var $searchTab = $( '.plugin-install-search' ), data, searchLocation;
			data = {
				_ajax_nonce: wp.updates.ajaxNonce,
				s:           event.target.value,
				tab:         'search',
				type:        $( '#typeselector' ).val(),
				pagenow:     pagenow
			};
			searchLocation = location.href.split( '?' )[ 0 ] + '?' + $.param( _.omit( data, [ '_ajax_nonce', 'pagenow' ] ) );
			if ( 'keyup' === event.type && 27 === event.which ) {
				event.target.value = '';
			}
			if ( wp.updates.searchTerm === data.s && 'typechange' !== eventtype ) {
				return;
			} else {
				$pluginFilter.empty();
				wp.updates.searchTerm = data.s;
			}
			if ( window.history && window.history.replaceState ) {
				window.history.replaceState( null, '', searchLocation );
			}
			if ( ! $searchTab.length ) {
				$searchTab = $( '<li class="plugin-install-search" />' )
					.append( $( '<a />', {
						'class': 'current',
						'href': searchLocation,
						'text': wp.updates.l10n.searchResultsLabel
					} ) );
				$( '.wp-filter .filter-links .current' )
					.removeClass( 'current' )
					.parents( '.filter-links' )
					.prepend( $searchTab );
				$pluginFilter.prev( 'p' ).remove();
				$( '.plugins-popular-tags-wrapper' ).remove();
			}
			if ( 'undefined' !== typeof wp.updates.searchRequest ) {
				wp.updates.searchRequest.abort();
			}
			$( 'body' ).addClass( 'loading-content' );
			wp.updates.searchRequest = wp.ajax.post( 'search-install-plugins', data ).done( function( response ) {
				$( 'body' ).removeClass( 'loading-content' );
				$pluginFilter.append( response.items );
				delete wp.updates.searchRequest;
				if ( 0 === response.count ) {
					wp.a11y.speak( wp.updates.l10n.noPluginsFound );
				} else {
					wp.a11y.speak( wp.updates.l10n.pluginsFound.replace( '%d', response.count ) );
				}
			} );
		}, 500 ) );
		if ( $pluginSearch.length ) {
			$pluginSearch.attr( 'aria-describedby', 'live-search-desc' );
		}
		$pluginSearch.on( 'keyup input', _.debounce( function( event ) {
			var data = {
				_ajax_nonce:   wp.updates.ajaxNonce,
				s:             event.target.value,
				pagenow:       pagenow,
				plugin_status: 'all'
			},
			queryArgs;
			if ( 'keyup' === event.type && 27 === event.which ) {
				event.target.value = '';
			}
			if ( wp.updates.searchTerm === data.s ) {
				return;
			} else {
				wp.updates.searchTerm = data.s;
			}
			queryArgs = _.object( _.compact( _.map( location.search.slice( 1 ).split( '&' ), function( item ) {
				if ( item ) return item.split( '=' );
			} ) ) );
			data.plugin_status = queryArgs.plugin_status || 'all';
			if ( window.history && window.history.replaceState ) {
				window.history.replaceState( null, '', location.href.split( '?' )[ 0 ] + '?s=' + data.s + '&plugin_status=' + data.plugin_status );
			}
			if ( 'undefined' !== typeof wp.updates.searchRequest ) {
				wp.updates.searchRequest.abort();
			}
			$bulkActionForm.empty();
			$( 'body' ).addClass( 'loading-content' );
			$( '.subsubsub .current' ).removeClass( 'current' );
			wp.updates.searchRequest = wp.ajax.post( 'search-plugins', data ).done( function( response ) {
				var $subTitle    = $( '<span />' ).addClass( 'subtitle' ).html( wp.updates.l10n.searchResults.replace( '%s', _.escape( data.s ) ) ),
					$oldSubTitle = $( '.wrap .subtitle' );
				if ( ! data.s.length ) {
					$oldSubTitle.remove();
					$( '.subsubsub .' + data.plugin_status + ' a' ).addClass( 'current' );
				} else if ( $oldSubTitle.length ) {
					$oldSubTitle.replaceWith( $subTitle );
				} else {
					$( '.wp-header-end' ).before( $subTitle );
				}
				$( 'body' ).removeClass( 'loading-content' );
				$bulkActionForm.append( response.items );
				delete wp.updates.searchRequest;
				if ( 0 === response.count ) {
					wp.a11y.speak( wp.updates.l10n.noPluginsFound );
				} else {
					wp.a11y.speak( wp.updates.l10n.pluginsFound.replace( '%d', response.count ) );
				}
			} );
		}, 500 ) );
		$document.on( 'submit', '.search-plugins', function( event ) {
			event.preventDefault();
			$( 'input.wp-filter-search' ).trigger( 'input' );
		} );
		$document.on( 'click', '.try-again', function( event ) { 
			event.preventDefault(); 
			$pluginInstallSearch.trigger( 'input' ); 
		} );
		$( '#typeselector' ).on( 'change', function() {
			var $search = $( 'input[name="s"]' );
			if ( $search.val().length ) {
				$search.trigger( 'input', 'typechange' );
			}
		} );
		$( '#plugin_update_from_iframe' ).on( 'click', function( event ) {
			var target = window.parent === window ? null : window.parent,
				update;
			$.support.postMessage = !! window.postMessage;
			if ( false === $.support.postMessage || null === target || -1 !== window.parent.location.pathname.indexOf( 'update-core.php' ) ) {
				return;
			}
			event.preventDefault();
			update = {
				action: 'update-plugin',
				data:   {
					plugin: $( this ).data( 'plugin' ),
					slug:   $( this ).data( 'slug' )
				}
			};
			target.postMessage( JSON.stringify( update ), window.location.origin );
		} );
		$( '#plugin_install_from_iframe' ).on( 'click', function( event ) {
			var target = window.parent === window ? null : window.parent,
				install;
			$.support.postMessage = !! window.postMessage;
			if ( false === $.support.postMessage || null === target || -1 !== window.parent.location.pathname.indexOf( 'index.php' ) ) {
				return;
			}
			event.preventDefault();
			install = {
				action: 'install-plugin',
				data:   {
					slug: $( this ).data( 'slug' )
				}
			};
			target.postMessage( JSON.stringify( install ), window.location.origin );
		} );
		$( window ).on( 'message', function( event ) {
			var originalEvent  = event.originalEvent,
				expectedOrigin = document.location.protocol + '//' + document.location.hostname,
				message;
			if ( originalEvent.origin !== expectedOrigin ) {
				return;
			}
			try {
				message = $.parseJSON( originalEvent.data );
			} catch ( e ) {
				return;
			}
			if ( ! message || 'undefined' === typeof message.action ) {
				return;
			}
			switch ( message.action ) {
				case 'decrementUpdateCount':
					wp.updates.decrementCount( message.upgradeType );
					break;
				case 'install-plugin':
				case 'update-plugin':
					window.tb_remove();
					message.data = wp.updates._addCallbacks( message.data, message.action );
					wp.updates.queue.push( message );
					wp.updates.queueChecker();
					break;
			}
		} );
		$( window ).on( 'beforeunload', wp.updates.beforeunload );
	} );
})( jQuery, window.wp, window._wpUpdatesSettings );
