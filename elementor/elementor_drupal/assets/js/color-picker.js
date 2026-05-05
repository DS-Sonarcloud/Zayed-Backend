
( function( $, undef ) {
	var ColorPicker,
		_before = '<button type="button" class="button wp-color-result" aria-expanded="false"><span class="wp-color-result-text"></span></button>',
		_after = '<div class="wp-picker-holder" />',
		_wrap = '<div class="wp-picker-container" />',
		_button = '<input type="button" class="button button-small" />',
		_wrappingLabel = '<label></label>',
		_wrappingLabelText = '<span class="screen-reader-text"></span>';
	ColorPicker = {
		options: {
			defaultColor: false,
			change: false,
			clear: false,
			hide: true,
			palettes: true,
			width: 255,
			mode: 'hsv',
			type: 'full',
			slider: 'horizontal'
		},
		_createHueOnly: function() {
			var self = this,
				el = self.element,
				color;
			el.hide();
			color = 'hsl(' + el.val() + ', 100, 50)';
			el.iris( {
				mode: 'hsl',
				type: 'hue',
				hide: false,
				color: color,
				change: function( event, ui ) {
					if ( $.isFunction( self.options.change ) ) {
						self.options.change.call( this, event, ui );
					}
				},
				width: self.options.width,
				slider: self.options.slider
			} );
		},
		_create: function() {
			if ( ! $.support.iris ) {
				return;
			}
			var self = this,
				el = self.element;
			$.extend( self.options, el.data() );
			if ( self.options.type === 'hue' ) {
				return self._createHueOnly();
			}
			self.close = $.proxy( self.close, self );
			self.initialValue = el.val();
			el.addClass( 'wp-color-picker' );
			if ( ! el.parent( 'label' ).length ) {
				el.wrap( _wrappingLabel );
				self.wrappingLabelText = $( _wrappingLabelText )
					.insertBefore( el )
					.text( wpColorPickerL10n.defaultLabel );
			}
			self.wrappingLabel = el.parent();
			self.wrappingLabel.wrap( _wrap );
			self.wrap = self.wrappingLabel.parent();
			self.toggler = $( _before )
				.insertBefore( self.wrappingLabel )
				.css( { backgroundColor: self.initialValue } );
			self.toggler.find( '.wp-color-result-text' ).text( wpColorPickerL10n.pick );
			self.pickerContainer = $( _after ).insertAfter( self.wrappingLabel );
			self.button = $( _button );
			if ( self.options.defaultColor ) {
				self.button
					.addClass( 'wp-picker-default' )
					.val( wpColorPickerL10n.defaultString )
					.attr( 'aria-label', wpColorPickerL10n.defaultAriaLabel );
			} else {
				self.button
					.addClass( 'wp-picker-clear' )
					.val( wpColorPickerL10n.clear )
					.attr( 'aria-label', wpColorPickerL10n.clearAriaLabel );
			}
			self.wrappingLabel
				.wrap( '<span class="wp-picker-input-wrap hidden" />' )
				.after( self.button );
			self.inputWrapper = el.closest( '.wp-picker-input-wrap' );
			el.iris( {
				target: self.pickerContainer,
				hide: self.options.hide,
				width: self.options.width,
				mode: self.options.mode,
				palettes: self.options.palettes,
				change: function( event, ui ) {
					self.toggler.css( { backgroundColor: ui.color.toString() } );
					if ( $.isFunction( self.options.change ) ) {
						self.options.change.call( this, event, ui );
					}
				}
			} );
			el.val( self.initialValue );
			self._addListeners();
			if ( ! self.options.hide ) {
				self.toggler.click();
			}
		},
		_addListeners: function() {
			var self = this;
			self.wrap.on( 'click.wpcolorpicker', function( event ) {
				event.stopPropagation();
			});
			self.toggler.click( function(){
				if ( self.toggler.hasClass( 'wp-picker-open' ) ) {
					self.close();
				} else {
					self.open();
				}
			});
			self.element.change( function( event ) {
				var me = $( this ),
					val = me.val();
				if ( val === '' || val === '#' ) {
					self.toggler.css( 'backgroundColor', '' );
					if ( $.isFunction( self.options.clear ) ) {
						self.options.clear.call( this, event );
					}
				}
			});
			self.button.click( function( event ) {
				var me = $( this );
				if ( me.hasClass( 'wp-picker-clear' ) ) {
					self.element.val( '' );
					self.toggler.css( 'backgroundColor', '' );
					if ( $.isFunction( self.options.clear ) ) {
						self.options.clear.call( this, event );
					}
				} else if ( me.hasClass( 'wp-picker-default' ) ) {
					self.element.val( self.options.defaultColor ).change();
				}
			});
		},
		open: function() {
			this.element.iris( 'toggle' );
			this.inputWrapper.removeClass( 'hidden' );
			this.wrap.addClass( 'wp-picker-active' );
			this.toggler
				.addClass( 'wp-picker-open' )
				.attr( 'aria-expanded', 'true' );
			$( 'body' ).trigger( 'click.wpcolorpicker' ).on( 'click.wpcolorpicker', this.close );
		},
		close: function() {
			this.element.iris( 'toggle' );
			this.inputWrapper.addClass( 'hidden' );
			this.wrap.removeClass( 'wp-picker-active' );
			this.toggler
				.removeClass( 'wp-picker-open' )
				.attr( 'aria-expanded', 'false' );
			$( 'body' ).off( 'click.wpcolorpicker', this.close );
		},
		color: function( newColor ) {
			if ( newColor === undef ) {
				return this.element.iris( 'option', 'color' );
			}
			this.element.iris( 'option', 'color', newColor );
		},
		defaultColor: function( newDefaultColor ) {
			if ( newDefaultColor === undef ) {
				return this.options.defaultColor;
			}
			this.options.defaultColor = newDefaultColor;
		}
	};
	$.widget( 'wp.wpColorPicker', ColorPicker );
}( jQuery ) );
