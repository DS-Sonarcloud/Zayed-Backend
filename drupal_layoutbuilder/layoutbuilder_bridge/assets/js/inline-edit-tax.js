
window.wp = window.wp || {};
var inlineEditTax;
( function( $, wp ) {
inlineEditTax = {
	init : function() {
		var t = this, row = $('#inline-edit');
		t.type = $('#the-list').attr('data-wp-lists').substr(5);
		t.what = '#'+t.type+'-';
		$('#the-list').on('click', 'a.editinline', function(){
			inlineEditTax.edit(this);
			return false;
		});
		row.keyup( function( e ) {
			if ( e.which === 27 ) {
				return inlineEditTax.revert();
			}
		});
		$( '.cancel', row ).click( function() {
			return inlineEditTax.revert();
		});
		$( '.save', row ).click( function() {
			return inlineEditTax.save(this);
		});
		$( 'input, select', row ).keydown( function( e ) {
			if ( e.which === 13 ) {
				return inlineEditTax.save( this );
			}
		});
		$( '#posts-filter input[type="submit"]' ).mousedown( function() {
			t.revert();
		});
	},
	toggle : function(el) {
		var t = this;
		$(t.what+t.getId(el)).css('display') === 'none' ? t.revert() : t.edit(el);
	},
	edit : function(id) {
		var editRow, rowData, val,
			t = this;
		t.revert();
		if ( typeof(id) === 'object' ) {
			id = t.getId(id);
		}
		editRow = $('#inline-edit').clone(true), rowData = $('#inline_'+id);
		$( 'td', editRow ).attr( 'colspan', $( 'th:visible, td:visible', '.wp-list-table.widefat:first thead' ).length );
		$(t.what+id).hide().after(editRow).after('<tr class="hidden"></tr>');
		val = $('.name', rowData);
		val.find( 'img' ).replaceWith( function() { return this.alt; } );
		val = val.text();
		$(':input[name="name"]', editRow).val( val );
		val = $('.slug', rowData);
		val.find( 'img' ).replaceWith( function() { return this.alt; } );
		val = val.text();
		$(':input[name="slug"]', editRow).val( val );
		$(editRow).attr('id', 'edit-'+id).addClass('inline-editor').show();
		$('.ptitle', editRow).eq(0).focus();
		return false;
	},
	save : function(id) {
		var params, fields, tax = $('input[name="taxonomy"]').val() || '';
		if( typeof(id) === 'object' ) {
			id = this.getId(id);
		}
		$( 'table.widefat .spinner' ).addClass( 'is-active' );
		params = {
			action: 'inline-save-tax',
			tax_type: this.type,
			tax_ID: id,
			taxonomy: tax
		};
		fields = $('#edit-'+id).find(':input').serialize();
		params = fields + '&' + $.param(params);
		$.post( ajaxurl, params,
			function(r) {
				var row, new_id, option_value,
					$errorNotice = $( '#edit-' + id + ' .inline-edit-save .notice-error' ),
					$error = $errorNotice.find( '.error' );
				$( 'table.widefat .spinner' ).removeClass( 'is-active' );
				if (r) {
					if ( -1 !== r.indexOf( '<tr' ) ) {
						$(inlineEditTax.what+id).siblings('tr.hidden').addBack().remove();
						new_id = $(r).attr('id');
						$('#edit-'+id).before(r).remove();
						if ( new_id ) {
							option_value = new_id.replace( inlineEditTax.type + '-', '' );
							row = $( '#' + new_id );
						} else {
							option_value = id;
							row = $( inlineEditTax.what + id );
						}
						$( '#parent' ).find( 'option[value=' + option_value + ']' ).text( row.find( '.row-title' ).text() );
						row.hide().fadeIn( 400, function() {
							row.find( '.editinline' ).focus();
							wp.a11y.speak( inlineEditL10n.saved );
						});
					} else {
						$errorNotice.removeClass( 'hidden' );
						$error.html( r );
						wp.a11y.speak( $error.text() );
					}
				} else {
					$errorNotice.removeClass( 'hidden' );
					$error.html( inlineEditL10n.error );
					wp.a11y.speak( inlineEditL10n.error );
				}
			}
		);
		return false;
	},
	revert : function() {
		var id = $('table.widefat tr.inline-editor').attr('id');
		if ( id ) {
			$( 'table.widefat .spinner' ).removeClass( 'is-active' );
			$('#'+id).siblings('tr.hidden').addBack().remove();
			id = id.substr( id.lastIndexOf('-') + 1 );
			$( this.what + id ).show().find( '.editinline' ).focus();
		}
	},
	getId : function(o) {
		var id = o.tagName === 'TR' ? o.id : $(o).parents('tr').attr('id'), parts = id.split('-');
		return parts[parts.length - 1];
	}
};
$(document).ready(function(){inlineEditTax.init();});
})( jQuery, window.wp );
