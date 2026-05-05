
if ( ! window.wp ) {
	window.wp = {};
}
wp.themePluginEditor = (function( $ ) {
	'use strict';
	var component, TreeLinks;
	component = {
		l10n: {
			lintError: {
				singular: '',
				plural: ''
			},
			saveAlert: '',
			saveError: ''
		},
		codeEditor: {},
		instance: null,
		noticeElements: {},
		dirty: false,
		lintErrors: []
	};
	component.init = function init( form, settings ) {
		component.form = form;
		if ( settings ) {
			$.extend( component, settings );
		}
		component.noticeTemplate = wp.template( 'wp-file-editor-notice' );
		component.noticesContainer = component.form.find( '.editor-notices' );
		component.submitButton = component.form.find( ':input[name=submit]' );
		component.spinner = component.form.find( '.submit .spinner' );
		component.form.on( 'submit', component.submit );
		component.textarea = component.form.find( '#newcontent' );
		component.textarea.on( 'change', component.onChange );
		component.warning = $( '.file-editor-warning' );
		if ( component.warning.length > 0 ) {
			component.showWarning();
		}
		if ( false !== component.codeEditor ) {
			_.defer( function() {
				component.initCodeEditor();
			} );
		}
		$( component.initFileBrowser );
		$( window ).on( 'beforeunload', function() {
			if ( component.dirty ) {
				return component.l10n.saveAlert;
			}
			return undefined;
		} );
	};
	component.showWarning = function() {
		var rawMessage = component.warning.find( '.file-editor-warning-message' ).text();
		$( '#wpwrap' ).attr( 'aria-hidden', 'true' );
		$( document.body )
			.addClass( 'modal-open' )
			.append( component.warning.detach() );
		component.warning
			.removeClass( 'hidden' )
			.find( '.file-editor-warning-go-back' ).focus();
		component.warningTabbables = component.warning.find( 'a, button' );
		component.warningTabbables.on( 'keydown', component.constrainTabbing );
		component.warning.on( 'click', '.file-editor-warning-dismiss', component.dismissWarning );
		setTimeout( function() {
			wp.a11y.speak( wp.sanitize.stripTags( rawMessage.replace( /\s+/g, ' ' ) ), 'assertive' );
		}, 1000 );
	};
	component.constrainTabbing = function( event ) {
		var firstTabbable, lastTabbable;
		if ( 9 !== event.which ) {
			return;
		}
		firstTabbable = component.warningTabbables.first()[0];
		lastTabbable = component.warningTabbables.last()[0];
		if ( lastTabbable === event.target && ! event.shiftKey ) {
			firstTabbable.focus();
			event.preventDefault();
		} else if ( firstTabbable === event.target && event.shiftKey ) {
			lastTabbable.focus();
			event.preventDefault();
		}
	};
	component.dismissWarning = function() {
		wp.ajax.post( 'dismiss-wp-pointer', {
			pointer: component.themeOrPlugin + '_editor_notice'
		});
		component.warning.remove();
		$( '#wpwrap' ).removeAttr( 'aria-hidden' );
		$( 'body' ).removeClass( 'modal-open' );
	};
	component.onChange = function() {
		component.dirty = true;
		component.removeNotice( 'file_saved' );
	};
	component.submit = function( event ) {
		var data = {}, request;
		event.preventDefault(); 
		$.each( component.form.serializeArray(), function() {
			data[ this.name ] = this.value;
		} );
		if ( component.instance ) {
			data.newcontent = component.instance.codemirror.getValue();
		}
		if ( component.isSaving ) {
			return;
		}
		if ( component.lintErrors.length ) {
			component.instance.codemirror.setCursor( component.lintErrors[0].from.line );
			return;
		}
		component.isSaving = true;
		component.textarea.prop( 'readonly', true );
		if ( component.instance ) {
			component.instance.codemirror.setOption( 'readOnly', true );
		}
		component.spinner.addClass( 'is-active' );
		request = wp.ajax.post( 'edit-theme-plugin-file', data );
		if ( component.lastSaveNoticeCode ) {
			component.removeNotice( component.lastSaveNoticeCode );
		}
		request.done( function( response ) {
			component.lastSaveNoticeCode = 'file_saved';
			component.addNotice({
				code: component.lastSaveNoticeCode,
				type: 'success',
				message: response.message,
				dismissible: true
			});
			component.dirty = false;
		} );
		request.fail( function( response ) {
			var notice = $.extend(
				{
					code: 'save_error',
					message: component.l10n.saveError
				},
				response,
				{
					type: 'error',
					dismissible: true
				}
			);
			component.lastSaveNoticeCode = notice.code;
			component.addNotice( notice );
		} );
		request.always( function() {
			component.spinner.removeClass( 'is-active' );
			component.isSaving = false;
			component.textarea.prop( 'readonly', false );
			if ( component.instance ) {
				component.instance.codemirror.setOption( 'readOnly', false );
			}
		} );
	};
	component.addNotice = function( notice ) {
		var noticeElement;
		if ( ! notice.code ) {
			throw new Error( 'Missing code.' );
		}
		component.removeNotice( notice.code );
		noticeElement = $( component.noticeTemplate( notice ) );
		noticeElement.hide();
		noticeElement.find( '.notice-dismiss' ).on( 'click', function() {
			component.removeNotice( notice.code );
			if ( notice.onDismiss ) {
				notice.onDismiss( notice );
			}
		} );
		wp.a11y.speak( notice.message );
		component.noticesContainer.append( noticeElement );
		noticeElement.slideDown( 'fast' );
		component.noticeElements[ notice.code ] = noticeElement;
		return noticeElement;
	};
	component.removeNotice = function( code ) {
		if ( component.noticeElements[ code ] ) {
			component.noticeElements[ code ].slideUp( 'fast', function() {
				$( this ).remove();
			} );
			delete component.noticeElements[ code ];
			return true;
		}
		return false;
	};
	component.initCodeEditor = function initCodeEditor() {
		var codeEditorSettings, editor;
		codeEditorSettings = $.extend( {}, component.codeEditor );
		codeEditorSettings.onTabPrevious = function() {
			$( '#templateside' ).find( ':tabbable' ).last().focus();
		};
		codeEditorSettings.onTabNext = function() {
			$( '#template' ).find( ':tabbable:not(.CodeMirror-code)' ).first().focus();
		};
		codeEditorSettings.onChangeLintingErrors = function( errors ) {
			component.lintErrors = errors;
			if ( 0 === errors.length ) {
				component.submitButton.toggleClass( 'disabled', false );
			}
		};
		codeEditorSettings.onUpdateErrorNotice = function onUpdateErrorNotice( errorAnnotations ) {
			var message, noticeElement;
			component.submitButton.toggleClass( 'disabled', errorAnnotations.length > 0 );
			if ( 0 !== errorAnnotations.length ) {
				if ( 1 === errorAnnotations.length ) {
					message = component.l10n.lintError.singular.replace( '%d', '1' );
				} else {
					message = component.l10n.lintError.plural.replace( '%d', String( errorAnnotations.length ) );
				}
				noticeElement = component.addNotice({
					code: 'lint_errors',
					type: 'error',
					message: message,
					dismissible: false
				});
				noticeElement.find( 'input[type=checkbox]' ).on( 'click', function() {
					codeEditorSettings.onChangeLintingErrors( [] );
					component.removeNotice( 'lint_errors' );
				} );
			} else {
				component.removeNotice( 'lint_errors' );
			}
		};
		editor = wp.codeEditor.initialize( $( '#newcontent' ), codeEditorSettings );
		editor.codemirror.on( 'change', component.onChange );
		$( editor.codemirror.display.lineDiv )
			.attr({
				role: 'textbox',
				'aria-multiline': 'true',
				'aria-labelledby': 'theme-plugin-editor-label',
				'aria-describedby': 'editor-keyboard-trap-help-1 editor-keyboard-trap-help-2 editor-keyboard-trap-help-3 editor-keyboard-trap-help-4'
			});
		$( '#theme-plugin-editor-label' ).on( 'click', function() {
			editor.codemirror.focus();
		});
		component.instance = editor;
	};
	component.initFileBrowser = function initFileBrowser() {
		var $templateside = $( '#templateside' );
		$templateside.find( '[role="group"]' ).parent().attr( 'aria-expanded', false );
		$templateside.find( '.notice' ).parents( '[aria-expanded]' ).attr( 'aria-expanded', true );
		$templateside.find( '[role="tree"]' ).each( function() {
			var treeLinks = new TreeLinks( this );
			treeLinks.init();
		} );
		$templateside.find( '.current-file:first' ).each( function() {
			if ( this.scrollIntoViewIfNeeded ) {
				this.scrollIntoViewIfNeeded();
			} else {
				this.scrollIntoView( false );
			}
		} );
	};
	var TreeitemLink = (function () {
		var TreeitemLink = function (node, treeObj, group) {
			if (typeof node !== 'object') {
				return;
			}
			node.tabIndex = -1;
			this.tree = treeObj;
			this.groupTreeitem = group;
			this.domNode = node;
			this.label = node.textContent.trim();
			this.stopDefaultClick = false;
			if (node.getAttribute('aria-label')) {
				this.label = node.getAttribute('aria-label').trim();
			}
			this.isExpandable = false;
			this.isVisible = false;
			this.inGroup = false;
			if (group) {
				this.inGroup = true;
			}
			var elem = node.firstElementChild;
			while (elem) {
				if (elem.tagName.toLowerCase() == 'ul') {
					elem.setAttribute('role', 'group');
					this.isExpandable = true;
					break;
				}
				elem = elem.nextElementSibling;
			}
			this.keyCode = Object.freeze({
				RETURN: 13,
				SPACE: 32,
				PAGEUP: 33,
				PAGEDOWN: 34,
				END: 35,
				HOME: 36,
				LEFT: 37,
				UP: 38,
				RIGHT: 39,
				DOWN: 40
			});
		};
		TreeitemLink.prototype.init = function () {
			this.domNode.tabIndex = -1;
			if (!this.domNode.getAttribute('role')) {
				this.domNode.setAttribute('role', 'treeitem');
			}
			this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
			this.domNode.addEventListener('click', this.handleClick.bind(this));
			this.domNode.addEventListener('focus', this.handleFocus.bind(this));
			this.domNode.addEventListener('blur', this.handleBlur.bind(this));
			if (this.isExpandable) {
				this.domNode.firstElementChild.addEventListener('mouseover', this.handleMouseOver.bind(this));
				this.domNode.firstElementChild.addEventListener('mouseout', this.handleMouseOut.bind(this));
			}
			else {
				this.domNode.addEventListener('mouseover', this.handleMouseOver.bind(this));
				this.domNode.addEventListener('mouseout', this.handleMouseOut.bind(this));
			}
		};
		TreeitemLink.prototype.isExpanded = function () {
			if (this.isExpandable) {
				return this.domNode.getAttribute('aria-expanded') === 'true';
			}
			return false;
		};
		TreeitemLink.prototype.handleKeydown = function (event) {
			var tgt = event.currentTarget,
				flag = false,
				_char = event.key,
				clickEvent;
			function isPrintableCharacter(str) {
				return str.length === 1 && str.match(/\S/);
			}
			function printableCharacter(item) {
				if (_char == '*') {
					item.tree.expandAllSiblingItems(item);
					flag = true;
				}
				else {
					if (isPrintableCharacter(_char)) {
						item.tree.setFocusByFirstCharacter(item, _char);
						flag = true;
					}
				}
			}
			this.stopDefaultClick = false;
			if (event.altKey || event.ctrlKey || event.metaKey) {
				return;
			}
			if (event.shift) {
				if (event.keyCode == this.keyCode.SPACE || event.keyCode == this.keyCode.RETURN) {
					event.stopPropagation();
					this.stopDefaultClick = true;
				}
				else {
					if (isPrintableCharacter(_char)) {
						printableCharacter(this);
					}
				}
			}
			else {
				switch (event.keyCode) {
					case this.keyCode.SPACE:
					case this.keyCode.RETURN:
						if (this.isExpandable) {
							if (this.isExpanded()) {
								this.tree.collapseTreeitem(this);
							}
							else {
								this.tree.expandTreeitem(this);
							}
							flag = true;
						}
						else {
							event.stopPropagation();
							this.stopDefaultClick = true;
						}
						break;
					case this.keyCode.UP:
						this.tree.setFocusToPreviousItem(this);
						flag = true;
						break;
					case this.keyCode.DOWN:
						this.tree.setFocusToNextItem(this);
						flag = true;
						break;
					case this.keyCode.RIGHT:
						if (this.isExpandable) {
							if (this.isExpanded()) {
								this.tree.setFocusToNextItem(this);
							}
							else {
								this.tree.expandTreeitem(this);
							}
						}
						flag = true;
						break;
					case this.keyCode.LEFT:
						if (this.isExpandable && this.isExpanded()) {
							this.tree.collapseTreeitem(this);
							flag = true;
						}
						else {
							if (this.inGroup) {
								this.tree.setFocusToParentItem(this);
								flag = true;
							}
						}
						break;
					case this.keyCode.HOME:
						this.tree.setFocusToFirstItem();
						flag = true;
						break;
					case this.keyCode.END:
						this.tree.setFocusToLastItem();
						flag = true;
						break;
					default:
						if (isPrintableCharacter(_char)) {
							printableCharacter(this);
						}
						break;
				}
			}
			if (flag) {
				event.stopPropagation();
				event.preventDefault();
			}
		};
		TreeitemLink.prototype.handleClick = function (event) {
			if (event.target !== this.domNode && event.target !== this.domNode.firstElementChild) {
				return;
			}
			if (this.isExpandable) {
				if (this.isExpanded()) {
					this.tree.collapseTreeitem(this);
				}
				else {
					this.tree.expandTreeitem(this);
				}
				event.stopPropagation();
			}
		};
		TreeitemLink.prototype.handleFocus = function (event) {
			var node = this.domNode;
			if (this.isExpandable) {
				node = node.firstElementChild;
			}
			node.classList.add('focus');
		};
		TreeitemLink.prototype.handleBlur = function (event) {
			var node = this.domNode;
			if (this.isExpandable) {
				node = node.firstElementChild;
			}
			node.classList.remove('focus');
		};
		TreeitemLink.prototype.handleMouseOver = function (event) {
			event.currentTarget.classList.add('hover');
		};
		TreeitemLink.prototype.handleMouseOut = function (event) {
			event.currentTarget.classList.remove('hover');
		};
		return TreeitemLink;
	})();
	TreeLinks = (function () {
		var TreeLinks = function (node) {
			if (typeof node !== 'object') {
				return;
			}
			this.domNode = node;
			this.treeitems = [];
			this.firstChars = [];
			this.firstTreeitem = null;
			this.lastTreeitem = null;
		};
		TreeLinks.prototype.init = function () {
			function findTreeitems(node, tree, group) {
				var elem = node.firstElementChild;
				var ti = group;
				while (elem) {
					if ((elem.tagName.toLowerCase() === 'li' && elem.firstElementChild.tagName.toLowerCase() === 'span') || elem.tagName.toLowerCase() === 'a') {
						ti = new TreeitemLink(elem, tree, group);
						ti.init();
						tree.treeitems.push(ti);
						tree.firstChars.push(ti.label.substring(0, 1).toLowerCase());
					}
					if (elem.firstElementChild) {
						findTreeitems(elem, tree, ti);
					}
					elem = elem.nextElementSibling;
				}
			}
			if (!this.domNode.getAttribute('role')) {
				this.domNode.setAttribute('role', 'tree');
			}
			findTreeitems(this.domNode, this, false);
			this.updateVisibleTreeitems();
			this.firstTreeitem.domNode.tabIndex = 0;
		};
		TreeLinks.prototype.setFocusToItem = function (treeitem) {
			for (var i = 0; i < this.treeitems.length; i++) {
				var ti = this.treeitems[i];
				if (ti === treeitem) {
					ti.domNode.tabIndex = 0;
					ti.domNode.focus();
				}
				else {
					ti.domNode.tabIndex = -1;
				}
			}
		};
		TreeLinks.prototype.setFocusToNextItem = function (currentItem) {
			var nextItem = false;
			for (var i = (this.treeitems.length - 1); i >= 0; i--) {
				var ti = this.treeitems[i];
				if (ti === currentItem) {
					break;
				}
				if (ti.isVisible) {
					nextItem = ti;
				}
			}
			if (nextItem) {
				this.setFocusToItem(nextItem);
			}
		};
		TreeLinks.prototype.setFocusToPreviousItem = function (currentItem) {
			var prevItem = false;
			for (var i = 0; i < this.treeitems.length; i++) {
				var ti = this.treeitems[i];
				if (ti === currentItem) {
					break;
				}
				if (ti.isVisible) {
					prevItem = ti;
				}
			}
			if (prevItem) {
				this.setFocusToItem(prevItem);
			}
		};
		TreeLinks.prototype.setFocusToParentItem = function (currentItem) {
			if (currentItem.groupTreeitem) {
				this.setFocusToItem(currentItem.groupTreeitem);
			}
		};
		TreeLinks.prototype.setFocusToFirstItem = function () {
			this.setFocusToItem(this.firstTreeitem);
		};
		TreeLinks.prototype.setFocusToLastItem = function () {
			this.setFocusToItem(this.lastTreeitem);
		};
		TreeLinks.prototype.expandTreeitem = function (currentItem) {
			if (currentItem.isExpandable) {
				currentItem.domNode.setAttribute('aria-expanded', true);
				this.updateVisibleTreeitems();
			}
		};
		TreeLinks.prototype.expandAllSiblingItems = function (currentItem) {
			for (var i = 0; i < this.treeitems.length; i++) {
				var ti = this.treeitems[i];
				if ((ti.groupTreeitem === currentItem.groupTreeitem) && ti.isExpandable) {
					this.expandTreeitem(ti);
				}
			}
		};
		TreeLinks.prototype.collapseTreeitem = function (currentItem) {
			var groupTreeitem = false;
			if (currentItem.isExpanded()) {
				groupTreeitem = currentItem;
			}
			else {
				groupTreeitem = currentItem.groupTreeitem;
			}
			if (groupTreeitem) {
				groupTreeitem.domNode.setAttribute('aria-expanded', false);
				this.updateVisibleTreeitems();
				this.setFocusToItem(groupTreeitem);
			}
		};
		TreeLinks.prototype.updateVisibleTreeitems = function () {
			this.firstTreeitem = this.treeitems[0];
			for (var i = 0; i < this.treeitems.length; i++) {
				var ti = this.treeitems[i];
				var parent = ti.domNode.parentNode;
				ti.isVisible = true;
				while (parent && (parent !== this.domNode)) {
					if (parent.getAttribute('aria-expanded') == 'false') {
						ti.isVisible = false;
					}
					parent = parent.parentNode;
				}
				if (ti.isVisible) {
					this.lastTreeitem = ti;
				}
			}
		};
		TreeLinks.prototype.setFocusByFirstCharacter = function (currentItem, _char) {
			var start, index;
			_char = _char.toLowerCase();
			start = this.treeitems.indexOf(currentItem) + 1;
			if (start === this.treeitems.length) {
				start = 0;
			}
			index = this.getIndexFirstChars(start, _char);
			if (index === -1) {
				index = this.getIndexFirstChars(0, _char);
			}
			if (index > -1) {
				this.setFocusToItem(this.treeitems[index]);
			}
		};
		TreeLinks.prototype.getIndexFirstChars = function (startIndex, _char) {
			for (var i = startIndex; i < this.firstChars.length; i++) {
				if (this.treeitems[i].isVisible) {
					if (_char === this.firstChars[i]) {
						return i;
					}
				}
			}
			return -1;
		};
		return TreeLinks;
	})();
	return component;
})( jQuery );
