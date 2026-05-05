if ( 'undefined' === typeof window.wp ) {
	window.wp = {};
}
if ( 'undefined' === typeof window.wp.codeEditor ) {
	window.wp.codeEditor = {};
}
( function( $, wp ) {
	'use strict';
	wp.codeEditor.defaultSettings = {
		codemirror: {},
		csslint: {},
		htmlhint: {},
		jshint: {},
		onTabNext: function() {},
		onTabPrevious: function() {},
		onChangeLintingErrors: function() {},
		onUpdateErrorNotice: function() {}
	};
	function configureLinting( editor, settings ) { 
		var currentErrorAnnotations = [], previouslyShownErrorAnnotations = [];
		function updateErrorNotice() {
			if ( settings.onUpdateErrorNotice && ! _.isEqual( currentErrorAnnotations, previouslyShownErrorAnnotations ) ) {
				settings.onUpdateErrorNotice( currentErrorAnnotations, editor );
				previouslyShownErrorAnnotations = currentErrorAnnotations;
			}
		}
		function getLintOptions() { 
			var options = editor.getOption( 'lint' );
			if ( ! options ) {
				return false;
			}
			if ( true === options ) {
				options = {};
			} else if ( _.isObject( options ) ) {
				options = $.extend( {}, options );
			}
			if ( ! options.options ) {
				options.options = {};
			}
			if ( 'javascript' === settings.codemirror.mode && settings.jshint ) {
				$.extend( options.options, settings.jshint );
			}
			if ( 'css' === settings.codemirror.mode && settings.csslint ) {
				$.extend( options.options, settings.csslint );
			}
			if ( 'htmlmixed' === settings.codemirror.mode && settings.htmlhint ) {
				options.options.rules = $.extend( {}, settings.htmlhint );
				if ( settings.jshint ) {
					options.options.rules.jshint = settings.jshint;
				}
				if ( settings.csslint ) {
					options.options.rules.csslint = settings.csslint;
				}
			}
			options.onUpdateLinting = (function( onUpdateLintingOverridden ) {
				return function( annotations, annotationsSorted, cm ) {
					var errorAnnotations = _.filter( annotations, function( annotation ) {
						return 'error' === annotation.severity;
					} );
					if ( onUpdateLintingOverridden ) {
						onUpdateLintingOverridden.apply( annotations, annotationsSorted, cm );
					}
					if ( _.isEqual( errorAnnotations, currentErrorAnnotations ) ) {
						return;
					}
					currentErrorAnnotations = errorAnnotations;
					if ( settings.onChangeLintingErrors ) {
						settings.onChangeLintingErrors( errorAnnotations, annotations, annotationsSorted, cm );
					}
					if ( ! editor.state.focused || 0 === currentErrorAnnotations.length || previouslyShownErrorAnnotations.length > 0 ) {
						updateErrorNotice();
					}
				};
			})( options.onUpdateLinting );
			return options;
		}
		editor.setOption( 'lint', getLintOptions() );
		editor.on( 'optionChange', function( cm, option ) {
			var options, gutters, gutterName = 'CodeMirror-lint-markers';
			if ( 'lint' !== option ) {
				return;
			}
			gutters = editor.getOption( 'gutters' ) || [];
			options = editor.getOption( 'lint' );
			if ( true === options ) {
				if ( ! _.contains( gutters, gutterName ) ) {
					editor.setOption( 'gutters', [ gutterName ].concat( gutters ) );
				}
				editor.setOption( 'lint', getLintOptions() ); 
			} else if ( ! options ) {
				editor.setOption( 'gutters', _.without( gutters, gutterName ) );
			}
			if ( editor.getOption( 'lint' ) ) {
				editor.performLint();
			} else {
				currentErrorAnnotations = [];
				updateErrorNotice();
			}
		} );
		editor.on( 'blur', updateErrorNotice );
		editor.on( 'startCompletion', function() {
			editor.off( 'blur', updateErrorNotice );
		} );
		editor.on( 'endCompletion', function() {
			var editorRefocusWait = 500;
			editor.on( 'blur', updateErrorNotice );
			_.delay( function() {
				if ( ! editor.state.focused ) {
					updateErrorNotice();
				}
			}, editorRefocusWait );
		});
		$( document.body ).on( 'mousedown', function( event ) {
			if ( editor.state.focused && ! $.contains( editor.display.wrapper, event.target ) && ! $( event.target ).hasClass( 'CodeMirror-hint' ) ) {
				updateErrorNotice();
			}
		});
	}
	function configureTabbing( codemirror, settings ) {
		var $textarea = $( codemirror.getTextArea() );
		codemirror.on( 'blur', function() {
			$textarea.data( 'next-tab-blurs', false );
		});
		codemirror.on( 'keydown', function onKeydown( editor, event ) {
			var tabKeyCode = 9, escKeyCode = 27;
			if ( escKeyCode === event.keyCode ) {
				$textarea.data( 'next-tab-blurs', true );
				return;
			}
			if ( tabKeyCode !== event.keyCode || ! $textarea.data( 'next-tab-blurs' ) ) {
				return;
			}
			if ( event.shiftKey ) {
				settings.onTabPrevious( codemirror, event );
			} else {
				settings.onTabNext( codemirror, event );
			}
			$textarea.data( 'next-tab-blurs', false );
			event.preventDefault();
		});
	}
	wp.codeEditor.initialize = function initialize( textarea, settings ) {
		var $textarea, codemirror, instanceSettings, instance;
		if ( 'string' === typeof textarea ) {
			$textarea = $( '#' + textarea );
		} else {
			$textarea = $( textarea );
		}
		instanceSettings = $.extend( {}, wp.codeEditor.defaultSettings, settings );
		instanceSettings.codemirror = $.extend( {}, instanceSettings.codemirror );
		codemirror = wp.CodeMirror.fromTextArea( $textarea[0], instanceSettings.codemirror );
		configureLinting( codemirror, instanceSettings );
		instance = {
			settings: instanceSettings,
			codemirror: codemirror
		};
		if ( codemirror.showHint ) {
			codemirror.on( 'keyup', function( editor, event ) { 
				var shouldAutocomplete, isAlphaKey = /^[a-zA-Z]$/.test( event.key ), lineBeforeCursor, innerMode, token;
				if ( codemirror.state.completionActive && isAlphaKey ) {
					return;
				}
				token = codemirror.getTokenAt( codemirror.getCursor() );
				if ( 'string' === token.type || 'comment' === token.type ) {
					return;
				}
				innerMode = wp.CodeMirror.innerMode( codemirror.getMode(), token.state ).mode.name;
				lineBeforeCursor = codemirror.doc.getLine( codemirror.doc.getCursor().line ).substr( 0, codemirror.doc.getCursor().ch );
				if ( 'html' === innerMode || 'xml' === innerMode ) {
					shouldAutocomplete =
						'<' === event.key ||
						'/' === event.key && 'tag' === token.type ||
						isAlphaKey && 'tag' === token.type ||
						isAlphaKey && 'attribute' === token.type ||
						'=' === token.string && token.state.htmlState && token.state.htmlState.tagName;
				} else if ( 'css' === innerMode ) {
					shouldAutocomplete =
						isAlphaKey ||
						':' === event.key ||
						' ' === event.key && /:\s+$/.test( lineBeforeCursor );
				} else if ( 'javascript' === innerMode ) {
					shouldAutocomplete = isAlphaKey || '.' === event.key;
				} else if ( 'clike' === innerMode && 'application/x-httpd-php' === codemirror.options.mode ) {
					shouldAutocomplete = 'keyword' === token.type || 'variable' === token.type;
				}
				if ( shouldAutocomplete ) {
					codemirror.showHint( { completeSingle: false } );
				}
			});
		}
		configureTabbing( codemirror, settings );
		return instance;
	};
})( window.jQuery, window.wp );
