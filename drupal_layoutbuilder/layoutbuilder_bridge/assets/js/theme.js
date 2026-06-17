
window.wp = window.wp || {};
( function($) {
var themes, l10n;
themes = wp.themes = wp.themes || {};
themes.data = _wpThemeSettings;
l10n = themes.data.l10n;
themes.isInstall = !! themes.data.settings.isInstall;
_.extend( themes, { model: {}, view: {}, routes: {}, router: {}, template: wp.template });
themes.Model = Backbone.Model.extend({
	initialize: function() {
		var description;
		if ( _.indexOf( themes.data.installedThemes, this.get( 'slug' ) ) !== -1 ) {
			this.set({ installed: true });
		}
		this.set({
			id: this.get( 'slug' ) || this.get( 'id' )
		});
		if ( this.has( 'sections' ) ) {
			description = this.get( 'sections' ).description;
			this.set({ description: description });
		}
	}
});
themes.view.Appearance = wp.Backbone.View.extend({
	el: '#wpbody-content .wrap .theme-browser',
	window: $( window ),
	page: 0,
	initialize: function( options ) {
		_.bindAll( this, 'scroller' );
		this.SearchView = options.SearchView ? options.SearchView : themes.view.Search;
		this.window.bind( 'scroll', _.throttle( this.scroller, 300 ) );
	},
	render: function() {
		this.view = new themes.view.Themes({
			collection: this.collection,
			parent: this
		});
		this.search();
		this.$el.removeClass( 'search-loading' );
		this.view.render();
		this.$el.empty().append( this.view.el ).addClass( 'rendered' );
	},
	searchContainer: $( '.search-form' ),
	search: function() {
		var view,
			self = this;
		if ( themes.data.themes.length === 1 ) {
			return;
		}
		view = new this.SearchView({
			collection: self.collection,
			parent: this
		});
		self.SearchView = view;
		view.render();
		this.searchContainer
			.append( $.parseHTML( '<label class="screen-reader-text" for="wp-filter-search-input">' + l10n.search + '</label>' ) )
			.append( view.el )
			.on( 'submit', function( event ) {
				event.preventDefault();
			});
	},
	scroller: function() {
		var self = this,
			bottom, threshold;
		bottom = this.window.scrollTop() + self.window.height();
		threshold = self.$el.offset().top + self.$el.outerHeight( false ) - self.window.height();
		threshold = Math.round( threshold * 0.9 );
		if ( bottom > threshold ) {
			this.trigger( 'theme:scroll' );
		}
	}
});
themes.Collection = Backbone.Collection.extend({
	model: themes.Model,
	terms: '',
	doSearch: function( value ) {
		if ( this.terms === value ) {
			return;
		}
		this.terms = value;
		if ( this.terms.length > 0 ) {
			this.search( this.terms );
		}
		if ( this.terms === '' ) {
			this.reset( themes.data.themes );
			$( 'body' ).removeClass( 'no-results' );
		}
		this.trigger( 'themes:update' );
	},
	search: function( term ) {
		var match, results, haystack, name, description, author;
		this.reset( themes.data.themes, { silent: true } );
		term = term.replace( /[-\/\\^$*+?.()|[\]{}]/g, '\\$&' );
		term = term.replace( / /g, ')(?=.*' );
		match = new RegExp( '^(?=.*' + term + ').+', 'i' );
		results = this.filter( function( data ) {
			name        = data.get( 'name' ).replace( /(<([^>]+)>)/ig, '' );
			description = data.get( 'description' ).replace( /(<([^>]+)>)/ig, '' );
			author      = data.get( 'author' ).replace( /(<([^>]+)>)/ig, '' );
			haystack = _.union( [ name, data.get( 'id' ), description, author, data.get( 'tags' ) ] );
			if ( match.test( data.get( 'author' ) ) && term.length > 2 ) {
				data.set( 'displayAuthor', true );
			}
			return match.test( haystack );
		});
		if ( results.length === 0 ) {
			this.trigger( 'query:empty' );
		} else {
			$( 'body' ).removeClass( 'no-results' );
		}
		this.reset( results );
	},
	paginate: function( instance ) {
		var collection = this;
		instance = instance || 0;
		collection = _( collection.rest( 20 * instance ) );
		collection = _( collection.first( 20 ) );
		return collection;
	},
	count: false,
	query: function( request ) {
		var queries = this.queries,
			self = this,
			query, isPaginated, count;
		this.currentQuery.request = request;
		query = _.find( queries, function( query ) {
			return _.isEqual( query.request, request );
		});
		isPaginated = _.has( request, 'page' );
		if ( ! isPaginated ) {
			this.currentQuery.page = 1;
		}
		if ( ! query && ! isPaginated ) {
			query = this.apiCall( request ).done( function( data ) {
				if ( data.themes ) {
					self.reset( data.themes );
					count = data.info.results;
					queries.push( { themes: data.themes, request: request, total: count } );
				}
				self.trigger( 'themes:update' );
				self.trigger( 'query:success', count );
				if ( data.themes && data.themes.length === 0 ) {
					self.trigger( 'query:empty' );
				}
			}).fail( function() {
				self.trigger( 'query:fail' );
			});
		} else {
			if ( isPaginated ) {
				return this.apiCall( request, isPaginated ).done( function( data ) {
					self.add( data.themes );
					self.trigger( 'query:success' );
					self.loadingThemes = false;
				}).fail( function() {
					self.trigger( 'query:fail' );
				});
			}
			if ( query.themes.length === 0 ) {
				self.trigger( 'query:empty' );
			} else {
				$( 'body' ).removeClass( 'no-results' );
			}
			if ( _.isNumber( query.total ) ) {
				this.count = query.total;
			}
			this.reset( query.themes );
			if ( ! query.total ) {
				this.count = this.length;
			}
			this.trigger( 'themes:update' );
			this.trigger( 'query:success', this.count );
		}
	},
	queries: [],
	currentQuery: {
		page: 1,
		request: {}
	},
	apiCall: function( request, paginated ) {
		return wp.ajax.send( 'query-themes', {
			data: {
				request: _.extend({
					per_page: 100,
					fields: {
						description: true,
						tested: true,
						requires: true,
						rating: true,
						downloaded: true,
						downloadLink: true,
						last_updated: true,
						homepage: true,
						num_ratings: true
					}
				}, request)
			},
			beforeSend: function() {
				if ( ! paginated ) {
					$( 'body' ).addClass( 'loading-content' ).removeClass( 'no-results' );
				}
			}
		});
	},
	loadingThemes: false
});
themes.view.Theme = wp.Backbone.View.extend({
	className: 'theme',
	state: 'grid',
	html: themes.template( 'theme' ),
	events: {
		'click': themes.isInstall ? 'preview': 'expand',
		'keydown': themes.isInstall ? 'preview': 'expand',
		'touchend': themes.isInstall ? 'preview': 'expand',
		'keyup': 'addFocus',
		'touchmove': 'preventExpand',
		'click .theme-install': 'installTheme',
		'click .update-message': 'updateTheme'
	},
	touchDrag: false,
	initialize: function() {
		this.model.on( 'change', this.render, this );
	},
	render: function() {
		var data = this.model.toJSON();
		this.$el.html( this.html( data ) ).attr({
			tabindex: 0,
			'aria-describedby' : data.id + '-action ' + data.id + '-name',
			'data-slug': data.id
		});
		this.activeTheme();
		if ( this.model.get( 'displayAuthor' ) ) {
			this.$el.addClass( 'display-author' );
		}
	},
	activeTheme: function() {
		if ( this.model.get( 'active' ) ) {
			this.$el.addClass( 'active' );
		}
	},
	addFocus: function() {
		var $themeToFocus = ( $( ':focus' ).hasClass( 'theme' ) ) ? $( ':focus' ) : $(':focus').parents('.theme');
		$('.theme.focus').removeClass('focus');
		$themeToFocus.addClass('focus');
	},
	expand: function( event ) {
		var self = this;
		event = event || window.event;
		if ( event.type === 'keydown' && ( event.which !== 13 && event.which !== 32 ) ) {
			return;
		}
		if ( this.touchDrag === true ) {
			return this.touchDrag = false;
		}
		if ( $( event.target ).is( '.theme-actions a' ) ) {
			return;
		}
		if ( $( event.target ).is( '.theme-actions a, .update-message, .button-link, .notice-dismiss' ) ) {
			return;
		}
		themes.focusedTheme = this.$el;
		this.trigger( 'theme:expand', self.model.cid );
	},
	preventExpand: function() {
		this.touchDrag = true;
	},
	preview: function( event ) {
		var self = this,
			current, preview;
		event = event || window.event;
		if ( this.touchDrag === true ) {
			return this.touchDrag = false;
		}
		if ( $( event.target ).not( '.install-theme-preview' ).parents( '.theme-actions' ).length ) {
			return;
		}
		if ( event.type === 'keydown' && ( event.which !== 13 && event.which !== 32 ) ) {
			return;
		}
		if ( event.type === 'keydown' && event.which !== 13 && $( ':focus' ).hasClass( 'button' ) ) {
			return;
		}
		event.preventDefault();
		event = event || window.event;
		themes.focusedTheme = this.$el;
		themes.preview = preview = new themes.view.Preview({
			model: this.model
		});
		preview.render();
		this.setNavButtonsState();
		if ( this.model.collection.length === 1 ) {
			preview.$el.addClass( 'no-navigation' );
		} else {
			preview.$el.removeClass( 'no-navigation' );
		}
		$( 'div.wrap' ).append( preview.el );
		this.listenTo( preview, 'theme:next', function() {
			current = self.model;
			if ( ! _.isUndefined( self.current ) ) {
				current = self.current;
			}
			self.current = self.model.collection.at( self.model.collection.indexOf( current ) + 1 );
			if ( _.isUndefined( self.current ) ) {
				self.options.parent.parent.trigger( 'theme:end' );
				return self.current = current;
			}
			preview.model = self.current;
			preview.render();
			this.setNavButtonsState();
			$( '.next-theme' ).focus();
		})
		.listenTo( preview, 'theme:previous', function() {
			current = self.model;
			if ( self.model.collection.indexOf( self.current ) === 0 ) {
				return;
			}
			if ( ! _.isUndefined( self.current ) ) {
				current = self.current;
			}
			self.current = self.model.collection.at( self.model.collection.indexOf( current ) - 1 );
			if ( _.isUndefined( self.current ) ) {
				return;
			}
			preview.model = self.current;
			preview.render();
			this.setNavButtonsState();
			$( '.previous-theme' ).focus();
		});
		this.listenTo( preview, 'preview:close', function() {
			self.current = self.model;
		});
	},
	setNavButtonsState: function() {
		var $themeInstaller = $( '.theme-install-overlay' ),
			current = _.isUndefined( this.current ) ? this.model : this.current;
		if ( 0 === this.model.collection.indexOf( current ) ) {
			$themeInstaller.find( '.previous-theme' ).addClass( 'disabled' );
		}
		if ( _.isUndefined( this.model.collection.at( this.model.collection.indexOf( current ) + 1 ) ) ) {
			$themeInstaller.find( '.next-theme' ).addClass( 'disabled' );
		}
	},
	installTheme: function( event ) {
		var _this = this;
		event.preventDefault();
		wp.updates.maybeRequestFilesystemCredentials( event );
		$( document ).on( 'wp-theme-install-success', function( event, response ) {
			if ( _this.model.get( 'id' ) === response.slug ) {
				_this.model.set( { 'installed': true } );
			}
		} );
		wp.updates.installTheme( {
			slug: $( event.target ).data( 'slug' )
		} );
	},
	updateTheme: function( event ) {
		var _this = this;
		if ( ! this.model.get( 'hasPackage' ) ) {
			return;
		}
		event.preventDefault();
		wp.updates.maybeRequestFilesystemCredentials( event );
		$( document ).on( 'wp-theme-update-success', function( event, response ) {
			_this.model.off( 'change', _this.render, _this );
			if ( _this.model.get( 'id' ) === response.slug ) {
				_this.model.set( {
					hasUpdate: false,
					version: response.newVersion
				} );
			}
			_this.model.on( 'change', _this.render, _this );
		} );
		wp.updates.updateTheme( {
			slug: $( event.target ).parents( 'div.theme' ).first().data( 'slug' )
		} );
	}
});
themes.view.Details = wp.Backbone.View.extend({
	className: 'theme-overlay',
	events: {
		'click': 'collapse',
		'click .delete-theme': 'deleteTheme',
		'click .left': 'previousTheme',
		'click .right': 'nextTheme',
		'click #update-theme': 'updateTheme'
	},
	html: themes.template( 'theme-single' ),
	render: function() {
		var data = this.model.toJSON();
		this.$el.html( this.html( data ) );
		this.activeTheme();
		this.navigation();
		this.screenshotCheck( this.$el );
		this.containFocus( this.$el );
	},
	activeTheme: function() {
		this.$el.toggleClass( 'active', this.model.get( 'active' ) );
	},
	containFocus: function( $el ) {
		_.delay( function() {
			$( '.theme-overlay' ).focus();
		}, 100 );
		$el.on( 'keydown.wp-themes', function( event ) {
			var $firstFocusable = $el.find( '.theme-header button:not(.disabled)' ).first(),
				$lastFocusable = $el.find( '.theme-actions a:visible' ).last();
			if ( 9 === event.which ) {
				if ( $firstFocusable[0] === event.target && event.shiftKey ) {
					$lastFocusable.focus();
					event.preventDefault();
				} else if ( $lastFocusable[0] === event.target && ! event.shiftKey ) {
					$firstFocusable.focus();
					event.preventDefault();
				}
			}
		});
	},
	collapse: function( event ) {
		var self = this,
			scroll;
		event = event || window.event;
		if ( themes.data.themes.length === 1 ) {
			return;
		}
		if ( $( event.target ).is( '.theme-backdrop' ) || $( event.target ).is( '.close' ) || event.keyCode === 27 ) {
			$( 'body' ).addClass( 'closing-overlay' );
			this.$el.fadeOut( 130, function() {
				$( 'body' ).removeClass( 'closing-overlay' );
				self.closeOverlay();
				scroll = document.body.scrollTop;
				themes.router.navigate( themes.router.baseUrl( '' ) );
				document.body.scrollTop = scroll;
				if ( themes.focusedTheme ) {
					themes.focusedTheme.focus();
				}
			});
		}
	},
	navigation: function() {
		if ( this.model.cid === this.model.collection.at(0).cid ) {
			this.$el.find( '.left' )
				.addClass( 'disabled' )
				.prop( 'disabled', true );
		}
		if ( this.model.cid === this.model.collection.at( this.model.collection.length - 1 ).cid ) {
			this.$el.find( '.right' )
				.addClass( 'disabled' )
				.prop( 'disabled', true );
		}
	},
	closeOverlay: function() {
		$( 'body' ).removeClass( 'modal-open' );
		this.remove();
		this.unbind();
		this.trigger( 'theme:collapse' );
	},
	updateTheme: function( event ) {
		var _this = this;
		event.preventDefault();
		wp.updates.maybeRequestFilesystemCredentials( event );
		$( document ).on( 'wp-theme-update-success', function( event, response ) {
			if ( _this.model.get( 'id' ) === response.slug ) {
				_this.model.set( {
					hasUpdate: false,
					version: response.newVersion
				} );
			}
			_this.render();
		} );
		wp.updates.updateTheme( {
			slug: $( event.target ).data( 'slug' )
		} );
	},
	deleteTheme: function( event ) {
		var _this = this,
		    _collection = _this.model.collection,
		    _themes = themes;
		event.preventDefault();
		if ( ! window.confirm( wp.themes.data.settings.confirmDelete ) ) {
			return;
		}
		wp.updates.maybeRequestFilesystemCredentials( event );
		$( document ).one( 'wp-theme-delete-success', function( event, response ) {
			_this.$el.find( '.close' ).trigger( 'click' );
			$( '[data-slug="' + response.slug + '"]' ).css( { backgroundColor:'#faafaa' } ).fadeOut( 350, function() {
				$( this ).remove();
				_themes.data.themes = _.without( _themes.data.themes, _.findWhere( _themes.data.themes, { id: response.slug } ) );
				$( '.wp-filter-search' ).val( '' );
				_collection.doSearch( '' );
				_collection.remove( _this.model );
				_collection.trigger( 'themes:update' );
			} );
		} );
		wp.updates.deleteTheme( {
			slug: this.model.get( 'id' )
		} );
	},
	nextTheme: function() {
		var self = this;
		self.trigger( 'theme:next', self.model.cid );
		return false;
	},
	previousTheme: function() {
		var self = this;
		self.trigger( 'theme:previous', self.model.cid );
		return false;
	},
	screenshotCheck: function( el ) {
		var screenshot, image;
		screenshot = el.find( '.screenshot img' );
		image = new Image();
		image.src = screenshot.attr( 'src' );
		if ( image.width && image.width <= 300 ) {
			el.addClass( 'small-screenshot' );
		}
	}
});
themes.view.Preview = themes.view.Details.extend({
	className: 'wp-full-overlay expanded',
	el: '.theme-install-overlay',
	events: {
		'click .close-full-overlay': 'close',
		'click .collapse-sidebar': 'collapse',
		'click .devices button': 'previewDevice',
		'click .previous-theme': 'previousTheme',
		'click .next-theme': 'nextTheme',
		'keyup': 'keyEvent',
		'click .theme-install': 'installTheme'
	},
	html: themes.template( 'theme-preview' ),
	render: function() {
		var self = this,
			currentPreviewDevice,
			data = this.model.toJSON(),
			$body = $( document.body );
		$body.attr( 'aria-busy', 'true' );
		this.$el.removeClass( 'iframe-ready' ).html( this.html( data ) );
		currentPreviewDevice = this.$el.data( 'current-preview-device' );
		if ( currentPreviewDevice ) {
			self.tooglePreviewDeviceButtons( currentPreviewDevice );
		}
		themes.router.navigate( themes.router.baseUrl( themes.router.themePath + this.model.get( 'id' ) ), { replace: false } );
		this.$el.fadeIn( 200, function() {
			$body.addClass( 'theme-installer-active full-overlay-active' );
		});
		this.$el.find( 'iframe' ).one( 'load', function() {
			self.iframeLoaded();
		});
	},
	iframeLoaded: function() {
		this.$el.addClass( 'iframe-ready' );
		$( document.body ).attr( 'aria-busy', 'false' );
	},
	close: function() {
		this.$el.fadeOut( 200, function() {
			$( 'body' ).removeClass( 'theme-installer-active full-overlay-active' );
			if ( themes.focusedTheme ) {
				themes.focusedTheme.focus();
			}
		}).removeClass( 'iframe-ready' );
		if ( themes.router.selectedTab ) {
			themes.router.navigate( themes.router.baseUrl( '?browse=' + themes.router.selectedTab ) );
			themes.router.selectedTab = false;
		} else {
			themes.router.navigate( themes.router.baseUrl( '' ) );
		}
		this.trigger( 'preview:close' );
		this.undelegateEvents();
		this.unbind();
		return false;
	},
	collapse: function( event ) {
		var $button = $( event.currentTarget );
		if ( 'true' === $button.attr( 'aria-expanded' ) ) {
			$button.attr({ 'aria-expanded': 'false', 'aria-label': l10n.expandSidebar });
		} else {
			$button.attr({ 'aria-expanded': 'true', 'aria-label': l10n.collapseSidebar });
		}
		this.$el.toggleClass( 'collapsed' ).toggleClass( 'expanded' );
		return false;
	},
	previewDevice: function( event ) {
		var device = $( event.currentTarget ).data( 'device' );
		this.$el
			.removeClass( 'preview-desktop preview-tablet preview-mobile' )
			.addClass( 'preview-' + device )
			.data( 'current-preview-device', device );
		this.tooglePreviewDeviceButtons( device );
	},
	tooglePreviewDeviceButtons: function( newDevice ) {
		var $devices = $( '.wp-full-overlay-footer .devices' );
		$devices.find( 'button' )
			.removeClass( 'active' )
			.attr( 'aria-pressed', false );
		$devices.find( 'button.preview-' + newDevice )
			.addClass( 'active' )
			.attr( 'aria-pressed', true );
	},
	keyEvent: function( event ) {
		if ( event.keyCode === 27 ) {
			this.undelegateEvents();
			this.close();
		}
		if ( event.keyCode === 39 ) {
			_.once( this.nextTheme() );
		}
		if ( event.keyCode === 37 ) {
			this.previousTheme();
		}
	},
	installTheme: function( event ) {
		var _this   = this,
		    $target = $( event.target );
		event.preventDefault();
		if ( $target.hasClass( 'disabled' ) ) {
			return;
		}
		wp.updates.maybeRequestFilesystemCredentials( event );
		$( document ).on( 'wp-theme-install-success', function() {
			_this.model.set( { 'installed': true } );
		} );
		wp.updates.installTheme( {
			slug: $target.data( 'slug' )
		} );
	}
});
themes.view.Themes = wp.Backbone.View.extend({
	className: 'themes wp-clearfix',
	$overlay: $( 'div.theme-overlay' ),
	index: 0,
	count: $( '.wrap .theme-count' ),
	liveThemeCount: 0,
	initialize: function( options ) {
		var self = this;
		this.parent = options.parent;
		this.setView( 'grid' );
		self.currentTheme();
		this.listenTo( self.collection, 'themes:update', function() {
			self.parent.page = 0;
			self.currentTheme();
			self.render( this );
		} );
		this.listenTo( self.collection, 'query:success', function( count ) {
			if ( _.isNumber( count ) ) {
				self.count.text( count );
				self.announceSearchResults( count );
			} else {
				self.count.text( self.collection.length );
				self.announceSearchResults( self.collection.length );
			}
		});
		this.listenTo( self.collection, 'query:empty', function() {
			$( 'body' ).addClass( 'no-results' );
		});
		this.listenTo( this.parent, 'theme:scroll', function() {
			self.renderThemes( self.parent.page );
		});
		this.listenTo( this.parent, 'theme:close', function() {
			if ( self.overlay ) {
				self.overlay.closeOverlay();
			}
		} );
		$( 'body' ).on( 'keyup', function( event ) {
			if ( ! self.overlay ) {
				return;
			}
			if ( $( '#request-filesystem-credentials-dialog' ).is( ':visible' ) ) {
				return;
			}
			if ( event.keyCode === 39 ) {
				self.overlay.nextTheme();
			}
			if ( event.keyCode === 37 ) {
				self.overlay.previousTheme();
			}
			if ( event.keyCode === 27 ) {
				self.overlay.collapse( event );
			}
		});
	},
	render: function() {
		this.$el.empty();
		if ( themes.data.themes.length === 1 ) {
			this.singleTheme = new themes.view.Details({
				model: this.collection.models[0]
			});
			this.singleTheme.render();
			this.$el.addClass( 'single-theme' );
			this.$el.append( this.singleTheme.el );
		}
		if ( this.options.collection.size() > 0 ) {
			this.renderThemes( this.parent.page );
		}
		this.liveThemeCount = this.collection.count ? this.collection.count : this.collection.length;
		this.count.text( this.liveThemeCount );
		if ( ! themes.isInstall ) {
			this.announceSearchResults( this.liveThemeCount );
		}
	},
	renderThemes: function( page ) {
		var self = this;
		self.instance = self.collection.paginate( page );
		if ( self.instance.size() === 0 ) {
			this.parent.trigger( 'theme:end' );
			return;
		}
		if ( ! themes.isInstall && page >= 1 ) {
			$( '.add-new-theme' ).remove();
		}
		self.instance.each( function( theme ) {
			self.theme = new themes.view.Theme({
				model: theme,
				parent: self
			});
			self.theme.render();
			self.$el.append( self.theme.el );
			self.listenTo( self.theme, 'theme:expand', self.expand, self );
		});
		if ( ! themes.isInstall && themes.data.settings.canInstall ) {
			this.$el.append( '<div class="theme add-new-theme"><a href="' + themes.data.settings.installURI + '"><div class="theme-screenshot"><span></span></div><h2 class="theme-name">' + l10n.addNew + '</h2></a></div>' );
		}
		this.parent.page++;
	},
	currentTheme: function() {
		var self = this,
			current;
		current = self.collection.findWhere({ active: true });
		if ( current ) {
			self.collection.remove( current );
			self.collection.add( current, { at:0 } );
		}
	},
	setView: function( view ) {
		return view;
	},
	expand: function( id ) {
		var self = this, $card, $modal;
		this.model = self.collection.get( id );
		themes.router.navigate( themes.router.baseUrl( themes.router.themePath + this.model.id ) );
		this.setView( 'detail' );
		$( 'body' ).addClass( 'modal-open' );
		this.overlay = new themes.view.Details({
			model: self.model
		});
		this.overlay.render();
		if ( this.model.get( 'hasUpdate' ) ) {
			$card  = $( '[data-slug="' + this.model.id + '"]' );
			$modal = $( this.overlay.el );
			if ( $card.find( '.updating-message' ).length ) {
				$modal.find( '.notice-warning h3' ).remove();
				$modal.find( '.notice-warning' )
					.removeClass( 'notice-large' )
					.addClass( 'updating-message' )
					.find( 'p' ).text( wp.updates.l10n.updating );
			} else if ( $card.find( '.notice-error' ).length ) {
				$modal.find( '.notice-warning' ).remove();
			}
		}
		this.$overlay.html( this.overlay.el );
		this.listenTo( this.overlay, 'theme:next', function() {
			self.next( [ self.model.cid ] );
		})
		.listenTo( this.overlay, 'theme:previous', function() {
			self.previous( [ self.model.cid ] );
		});
	},
	next: function( args ) {
		var self = this,
			model, nextModel;
		model = self.collection.get( args[0] );
		nextModel = self.collection.at( self.collection.indexOf( model ) + 1 );
		if ( nextModel !== undefined ) {
			this.overlay.closeOverlay();
			self.theme.trigger( 'theme:expand', nextModel.cid );
		}
	},
	previous: function( args ) {
		var self = this,
			model, previousModel;
		model = self.collection.get( args[0] );
		previousModel = self.collection.at( self.collection.indexOf( model ) - 1 );
		if ( previousModel !== undefined ) {
			this.overlay.closeOverlay();
			self.theme.trigger( 'theme:expand', previousModel.cid );
		}
	},
	announceSearchResults: function( count ) {
		if ( 0 === count ) {
			wp.a11y.speak( l10n.noThemesFound );
		} else {
			wp.a11y.speak( l10n.themesFound.replace( '%d', count ) );
		}
	}
});
themes.view.Search = wp.Backbone.View.extend({
	tagName: 'input',
	className: 'wp-filter-search',
	id: 'wp-filter-search-input',
	searching: false,
	attributes: {
		placeholder: l10n.searchPlaceholder,
		type: 'search',
		'aria-describedby': 'live-search-desc'
	},
	events: {
		'input': 'search',
		'keyup': 'search',
		'blur': 'pushState'
	},
	initialize: function( options ) {
		this.parent = options.parent;
		this.listenTo( this.parent, 'theme:close', function() {
			this.searching = false;
		} );
	},
	search: function( event ) {
		if ( event.type === 'keyup' && event.which === 27 ) {
			event.target.value = '';
		}
		this.doSearch( event );
	},
	doSearch: function( event ) {
		var options = {};
		this.collection.doSearch( event.target.value.replace( /\+/g, ' ' ) );
		if ( this.searching && event.which !== 13 ) {
			options.replace = true;
		} else {
			this.searching = true;
		}
		if ( event.target.value ) {
			themes.router.navigate( themes.router.baseUrl( themes.router.searchPath + event.target.value ), options );
		} else {
			themes.router.navigate( themes.router.baseUrl( '' ) );
		}
	},
	pushState: function( event ) {
		var url = themes.router.baseUrl( '' );
		if ( event.target.value ) {
			url = themes.router.baseUrl( themes.router.searchPath + encodeURIComponent( event.target.value ) );
		}
		this.searching = false;
		themes.router.navigate( url );
	}
});
function navigateRouter( url, state ) {
	var router = this;
	if ( Backbone.history._hasPushState ) {
		Backbone.Router.prototype.navigate.call( router, url, state );
	}
}
themes.Router = Backbone.Router.extend({
	routes: {
		'themes.php?theme=:slug': 'theme',
		'themes.php?search=:query': 'search',
		'themes.php?s=:query': 'search',
		'themes.php': 'themes',
		'': 'themes'
	},
	baseUrl: function( url ) {
		return 'themes.php' + url;
	},
	themePath: '?theme=',
	searchPath: '?search=',
	search: function( query ) {
		$( '.wp-filter-search' ).val( query.replace( /\+/g, ' ' ) );
	},
	themes: function() {
		$( '.wp-filter-search' ).val( '' );
	},
	navigate: navigateRouter
});
themes.Run = {
	init: function() {
		this.themes = new themes.Collection( themes.data.themes );
		this.view = new themes.view.Appearance({
			collection: this.themes
		});
		this.render();
		this.view.SearchView.doSearch = _.debounce( this.view.SearchView.doSearch, 500 );
	},
	render: function() {
		this.view.render();
		this.routes();
		if ( Backbone.History.started ) {
			Backbone.history.stop();
		}
		Backbone.history.start({
			root: themes.data.settings.adminUrl,
			pushState: true,
			hashChange: false
		});
	},
	routes: function() {
		var self = this;
		themes.router = new themes.Router();
		themes.router.on( 'route:theme', function( slug ) {
			self.view.view.expand( slug );
		});
		themes.router.on( 'route:themes', function() {
			self.themes.doSearch( '' );
			self.view.trigger( 'theme:close' );
		});
		themes.router.on( 'route:search', function() {
			$( '.wp-filter-search' ).trigger( 'keyup' );
		});
		this.extraRoutes();
	},
	extraRoutes: function() {
		return false;
	}
};
themes.view.InstallerSearch =  themes.view.Search.extend({
	events: {
		'input': 'search',
		'keyup': 'search'
	},
	terms: '',
	search: function( event ) {
		if ( event.type === 'keyup' && ( event.which === 9 || event.which === 16 ) ) {
			return;
		}
		this.collection = this.options.parent.view.collection;
		if ( event.type === 'keyup' && event.which === 27 ) {
			event.target.value = '';
		}
		this.doSearch( event.target.value );
	},
	doSearch: function( value ) {
		var request = {};
		if ( this.terms === value ) {
			return;
		}
		this.terms = value;
		request.search = value;
		if ( value.substring( 0, 7 ) === 'author:' ) {
			request.search = '';
			request.author = value.slice( 7 );
		}
		if ( value.substring( 0, 4 ) === 'tag:' ) {
			request.search = '';
			request.tag = [ value.slice( 4 ) ];
		}
		$( '.filter-links li > a.current' )
			.removeClass( 'current' )
			.removeAttr( 'aria-current' );
		$( 'body' ).removeClass( 'show-filters filters-applied show-favorites-form' );
		$( '.drawer-toggle' ).attr( 'aria-expanded', 'false' );
		this.collection.query( request );
		themes.router.navigate( themes.router.baseUrl( themes.router.searchPath + encodeURIComponent( value ) ), { replace: true } );
	}
});
themes.view.Installer = themes.view.Appearance.extend({
	el: '#wpbody-content .wrap',
	events: {
		'click .filter-links li > a': 'onSort',
		'click .theme-filter': 'onFilter',
		'click .drawer-toggle': 'moreFilters',
		'click .filter-drawer .apply-filters': 'applyFilters',
		'click .filter-group [type="checkbox"]': 'addFilter',
		'click .filter-drawer .clear-filters': 'clearFilters',
		'click .edit-filters': 'backToFilters',
		'click .favorites-form-submit' : 'saveUsername',
		'keyup #wporg-username-input': 'saveUsername'
	},
	render: function() {
		var self = this;
		this.search();
		this.uploader();
		this.collection = new themes.Collection();
		this.listenTo( this, 'theme:end', function() {
			if ( self.collection.loadingThemes ) {
				return;
			}
			self.collection.loadingThemes = true;
			self.collection.currentQuery.page++;
			_.extend( self.collection.currentQuery.request, { page: self.collection.currentQuery.page } );
			self.collection.query( self.collection.currentQuery.request );
		});
		this.listenTo( this.collection, 'query:success', function() {
			$( 'body' ).removeClass( 'loading-content' );
			$( '.theme-browser' ).find( 'div.error' ).remove();
		});
		this.listenTo( this.collection, 'query:fail', function() {
			$( 'body' ).removeClass( 'loading-content' );
			$( '.theme-browser' ).find( 'div.error' ).remove();
			$( '.theme-browser' ).find( 'div.themes' ).before( '<div class="error"><p>' + l10n.error + '</p><p><button class="button try-again">' + l10n.tryAgain + '</button></p></div>' );
			$( '.theme-browser .error .try-again' ).on( 'click', function( e ) {
				e.preventDefault();
				$( 'input.wp-filter-search' ).trigger( 'input' );
			} );
		});
		if ( this.view ) {
			this.view.remove();
		}
		this.view = new themes.view.Themes({
			collection: this.collection,
			parent: this
		});
		this.page = 0;
		this.$el.find( '.themes' ).remove();
		this.view.render();
		this.$el.find( '.theme-browser' ).append( this.view.el ).addClass( 'rendered' );
	},
	browse: function( section ) {
		this.collection.query( { browse: section } );
	},
	onSort: function( event ) {
		var $el = $( event.target ),
			sort = $el.data( 'sort' );
		event.preventDefault();
		$( 'body' ).removeClass( 'filters-applied show-filters' );
		$( '.drawer-toggle' ).attr( 'aria-expanded', 'false' );
		if ( $el.hasClass( this.activeClass ) ) {
			return;
		}
		this.sort( sort );
		themes.router.navigate( themes.router.baseUrl( themes.router.browsePath + sort ) );
	},
	sort: function( sort ) {
		this.clearSearch();
		themes.router.selectedTab = sort;
		$( '.filter-links li > a, .theme-filter' )
			.removeClass( this.activeClass )
			.removeAttr( 'aria-current' );
		$( '[data-sort="' + sort + '"]' )
			.addClass( this.activeClass )
			.attr( 'aria-current', 'page' );
		if ( 'favorites' === sort ) {
			$( 'body' ).addClass( 'show-favorites-form' );
		} else {
			$( 'body' ).removeClass( 'show-favorites-form' );
		}
		this.browse( sort );
	},
	onFilter: function( event ) {
		var request,
			$el = $( event.target ),
			filter = $el.data( 'filter' );
		if ( $el.hasClass( this.activeClass ) ) {
			return;
		}
		$( '.filter-links li > a, .theme-section' )
			.removeClass( this.activeClass )
			.removeAttr( 'aria-current' );
		$el
			.addClass( this.activeClass )
			.attr( 'aria-current', 'page' );
		if ( ! filter ) {
			return;
		}
		filter = _.union( [ filter, this.filtersChecked() ] );
		request = { tag: [ filter ] };
		this.collection.query( request );
	},
	addFilter: function() {
		this.filtersChecked();
	},
	applyFilters: function( event ) {
		var name,
			tags = this.filtersChecked(),
			request = { tag: tags },
			filteringBy = $( '.filtered-by .tags' );
		if ( event ) {
			event.preventDefault();
		}
		if ( ! tags ) {
			wp.a11y.speak( l10n.selectFeatureFilter );
			return;
		}
		$( 'body' ).addClass( 'filters-applied' );
		$( '.filter-links li > a.current' )
			.removeClass( 'current' )
			.removeAttr( 'aria-current' );
		filteringBy.empty();
		_.each( tags, function( tag ) {
			name = $( 'label[for="filter-id-' + tag + '"]' ).text();
			filteringBy.append( '<span class="tag">' + name + '</span>' );
		});
		this.collection.query( request );
	},
	saveUsername: function ( event ) {
		var username = $( '#wporg-username-input' ).val(),
			nonce = $( '#wporg-username-nonce' ).val(),
			request = { browse: 'favorites', user: username },
			that = this;
		if ( event ) {
			event.preventDefault();
		}
		if ( event.type === 'keyup' && event.which !== 13 ) {
			return;
		}
		return wp.ajax.send( 'save-wporg-username', {
			data: {
				_wpnonce: nonce,
				username: username
			},
			success: function () {
				that.collection.query( request );
			}
		} );
	},
	filtersChecked: function() {
		var items = $( '.filter-group' ).find( ':checkbox' ),
			tags = [];
		_.each( items.filter( ':checked' ), function( item ) {
			tags.push( $( item ).prop( 'value' ) );
		});
		if ( tags.length === 0 ) {
			$( '.filter-drawer .apply-filters' ).find( 'span' ).text( '' );
			$( '.filter-drawer .clear-filters' ).hide();
			$( 'body' ).removeClass( 'filters-applied' );
			return false;
		}
		$( '.filter-drawer .apply-filters' ).find( 'span' ).text( tags.length );
		$( '.filter-drawer .clear-filters' ).css( 'display', 'inline-block' );
		return tags;
	},
	activeClass: 'current',
	uploader: function() {
		var uploadViewToggle = $( '.upload-view-toggle' ),
			$body = $( document.body );
		uploadViewToggle.on( 'click', function() {
			$body.toggleClass( 'show-upload-view' );
			uploadViewToggle.attr( 'aria-expanded', $body.hasClass( 'show-upload-view' ) );
		});
	},
	moreFilters: function( event ) {
		var $body = $( 'body' ),
			$toggleButton = $( '.drawer-toggle' );
		event.preventDefault();
		if ( $body.hasClass( 'filters-applied' ) ) {
			return this.backToFilters();
		}
		this.clearSearch();
		themes.router.navigate( themes.router.baseUrl( '' ) );
		$body.toggleClass( 'show-filters' );
		$toggleButton.attr( 'aria-expanded', $body.hasClass( 'show-filters' ) );
	},
	clearFilters: function( event ) {
		var items = $( '.filter-group' ).find( ':checkbox' ),
			self = this;
		event.preventDefault();
		_.each( items.filter( ':checked' ), function( item ) {
			$( item ).prop( 'checked', false );
			return self.filtersChecked();
		});
	},
	backToFilters: function( event ) {
		if ( event ) {
			event.preventDefault();
		}
		$( 'body' ).removeClass( 'filters-applied' );
	},
	clearSearch: function() {
		$( '#wp-filter-search-input').val( '' );
	}
});
themes.InstallerRouter = Backbone.Router.extend({
	routes: {
		'theme-install.php?theme=:slug': 'preview',
		'theme-install.php?browse=:sort': 'sort',
		'theme-install.php?search=:query': 'search',
		'theme-install.php': 'sort'
	},
	baseUrl: function( url ) {
		return 'theme-install.php' + url;
	},
	themePath: '?theme=',
	browsePath: '?browse=',
	searchPath: '?search=',
	search: function( query ) {
		$( '.wp-filter-search' ).val( query.replace( /\+/g, ' ' ) );
	},
	navigate: navigateRouter
});
themes.RunInstaller = {
	init: function() {
		this.view = new themes.view.Installer({
			section: 'featured',
			SearchView: themes.view.InstallerSearch
		});
		this.render();
		this.view.SearchView.doSearch = _.debounce( this.view.SearchView.doSearch, 500 );
	},
	render: function() {
		this.view.render();
		this.routes();
		if ( Backbone.History.started ) {
			Backbone.history.stop();
		}
		Backbone.history.start({
			root: themes.data.settings.adminUrl,
			pushState: true,
			hashChange: false
		});
	},
	routes: function() {
		var self = this,
			request = {};
		themes.router = new themes.InstallerRouter();
		themes.router.on( 'route:preview', function( slug ) {
			if ( themes.preview ) {
				themes.preview.undelegateEvents();
				themes.preview.unbind();
			}
			if ( self.view.view.theme && self.view.view.theme.preview ) {
				self.view.view.theme.model = self.view.collection.findWhere( { 'slug': slug } );
				self.view.view.theme.preview();
			} else {
				request.theme = slug;
				self.view.collection.query( request );
				self.view.collection.trigger( 'update' );
				self.view.collection.once( 'query:success', function() {
					$( 'div[data-slug="' + slug + '"]' ).trigger( 'click' );
				});
			}
		});
		themes.router.on( 'route:sort', function( sort ) {
			if ( ! sort ) {
				sort = 'featured';
				themes.router.navigate( themes.router.baseUrl( '?browse=featured' ), { replace: true } );
			}
			self.view.sort( sort );
			if ( themes.preview ) {
				themes.preview.close();
			}
		});
		themes.router.on( 'route:search', function() {
			$( '.wp-filter-search' ).focus().trigger( 'keyup' );
		});
		this.extraRoutes();
	},
	extraRoutes: function() {
		return false;
	}
};
$( document ).ready(function() {
	if ( themes.isInstall ) {
		themes.RunInstaller.init();
	} else {
		themes.Run.init();
	}
	$( document.body ).on( 'click', '.load-customize', function() {
		var link = $( this ), urlParser = document.createElement( 'a' );
		urlParser.href = link.prop( 'href' );
		urlParser.search = $.param( _.extend(
			wp.customize.utils.parseQueryString( urlParser.search.substr( 1 ) ),
			{
				'return': window.location.href
			}
		) );
		link.prop( 'href', urlParser.href );
	});
	$( '.broken-themes .delete-theme' ).on( 'click', function() {
		return confirm( _wpThemeSettings.settings.confirmDelete );
	});
});
})( jQuery );
var tb_position;
jQuery(document).ready( function($) {
	tb_position = function() {
		var tbWindow = $('#TB_window'),
			width = $(window).width(),
			H = $(window).height(),
			W = ( 1040 < width ) ? 1040 : width,
			adminbar_height = 0;
		if ( $('#wpadminbar').length ) {
			adminbar_height = parseInt( $('#wpadminbar').css('height'), 10 );
		}
		if ( tbWindow.size() ) {
			tbWindow.width( W - 50 ).height( H - 45 - adminbar_height );
			$('#TB_iframeContent').width( W - 50 ).height( H - 75 - adminbar_height );
			tbWindow.css({'margin-left': '-' + parseInt( ( ( W - 50 ) / 2 ), 10 ) + 'px'});
			if ( typeof document.body.style.maxWidth !== 'undefined' ) {
				tbWindow.css({'top': 20 + adminbar_height + 'px', 'margin-top': '0'});
			}
		}
	};
	$(window).resize(function(){ tb_position(); });
});
