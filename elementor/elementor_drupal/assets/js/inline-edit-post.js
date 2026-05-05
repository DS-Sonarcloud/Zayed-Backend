
window.wp = window.wp || {};
var inlineEditPost;
( function( $, wp ) {
	inlineEditPost = {
	init : function(){
		var t = this, qeRow = $('#inline-edit'), bulkRow = $('#bulk-edit');
		t.type = $('table.widefat').hasClass('pages') ? 'page' : 'post';
		t.what = '#post-';
		qeRow.keyup(function(e){
			if ( e.which === 27 ) {
				return inlineEditPost.revert();
			}
		});
		bulkRow.keyup(function(e){
			if ( e.which === 27 ) {
				return inlineEditPost.revert();
			}
		});
		$( '.cancel', qeRow ).click( function() {
			return inlineEditPost.revert();
		});
		$( '.save', qeRow ).click( function() {
			return inlineEditPost.save(this);
		});
		$('td', qeRow).keydown(function(e){
			if ( e.which === 13 && ! $( e.target ).hasClass( 'cancel' ) ) {
				return inlineEditPost.save(this);
			}
		});
		$( '.cancel', bulkRow ).click( function() {
			return inlineEditPost.revert();
		});
		$('#inline-edit .inline-edit-private input[value="private"]').click( function(){
			var pw = $('input.inline-edit-password-input');
			if ( $(this).prop('checked') ) {
				pw.val('').prop('disabled', true);
			} else {
				pw.prop('disabled', false);
			}
		});
		$('#the-list').on( 'click', 'a.editinline', function( e ) {
			e.preventDefault();
			inlineEditPost.edit(this);
		});
		$('#bulk-edit').find('fieldset:first').after(
			$('#inline-edit fieldset.inline-edit-categories').clone()
		).siblings( 'fieldset:last' ).prepend(
			$('#inline-edit label.inline-edit-tags').clone()
		);
		$('select[name="_status"] option[value="future"]', bulkRow).remove();
		$('#doaction, #doaction2').click(function(e){
			var n;
			t.whichBulkButtonId = $( this ).attr( 'id' );
			n = t.whichBulkButtonId.substr( 2 );
			if ( 'edit' === $( 'select[name="' + n + '"]' ).val() ) {
				e.preventDefault();
				t.setBulk();
			} else if ( $('form#posts-filter tr.inline-editor').length > 0 ) {
				t.revert();
			}
		});
	},
	toggle : function(el){
		var t = this;
		$( t.what + t.getId( el ) ).css( 'display' ) === 'none' ? t.revert() : t.edit( el );
	},
	setBulk : function(){
		var te = '', type = this.type, c = true;
		this.revert();
		$( '#bulk-edit td' ).attr( 'colspan', $( 'th:visible, td:visible', '.widefat:first thead' ).length );
		$('table.widefat tbody').prepend( $('#bulk-edit') ).prepend('<tr class="hidden"></tr>');
		$('#bulk-edit').addClass('inline-editor').show();
		$( 'tbody th.check-column input[type="checkbox"]' ).each( function() {
			if ( $(this).prop('checked') ) {
				c = false;
				var id = $(this).val(), theTitle;
				theTitle = $('#inline_'+id+' .post_title').html() || inlineEditL10n.notitle;
				te += '<div id="ttle'+id+'"><a id="_'+id+'" class="ntdelbutton" title="'+inlineEditL10n.ntdeltitle+'">X</a>'+theTitle+'</div>';
			}
		});
		if ( c ) {
			return this.revert();
		}
		$('#bulk-titles').html(te);
		$('#bulk-titles a').click(function(){
			var id = $(this).attr('id').substr(1);
			$('table.widefat input[value="' + id + '"]').prop('checked', false);
			$('#ttle'+id).remove();
		});
		if ( 'post' === type ) {
			$( 'tr.inline-editor textarea[data-wp-taxonomy]' ).each( function ( i, element ) {
				if ( $( element ).autocomplete( 'instance' ) ) {
					return;
				}
				$( element ).wpTagsSuggest();
			} );
		}
		$('html, body').animate( { scrollTop: 0 }, 'fast' );
	},
	edit : function(id) {
		var t = this, fields, editRow, rowData, status, pageOpt, pageLevel, nextPage, pageLoop = true, nextLevel, f, val, pw;
		t.revert();
		if ( typeof(id) === 'object' ) {
			id = t.getId(id);
		}
		fields = ['post_title', 'post_name', 'post_author', '_status', 'jj', 'mm', 'aa', 'hh', 'mn', 'ss', 'post_password', 'post_format', 'menu_order', 'page_template'];
		if ( t.type === 'page' ) {
			fields.push('post_parent');
		}
		editRow = $('#inline-edit').clone(true);
		$( 'td', editRow ).attr( 'colspan', $( 'th:visible, td:visible', '.widefat:first thead' ).length );
		$(t.what+id).removeClass('is-expanded').hide().after(editRow).after('<tr class="hidden"></tr>');
		rowData = $('#inline_'+id);
		if ( !$(':input[name="post_author"] option[value="' + $('.post_author', rowData).text() + '"]', editRow).val() ) {
			$(':input[name="post_author"]', editRow).prepend('<option value="' + $('.post_author', rowData).text() + '">' + $('#' + t.type + '-' + id + ' .author').text() + '</option>');
		}
		if ( $( ':input[name="post_author"] option', editRow ).length === 1 ) {
			$('label.inline-edit-author', editRow).hide();
		}
		for ( f = 0; f < fields.length; f++ ) {
			val = $('.'+fields[f], rowData);
			val.find( 'img' ).replaceWith( function() { return this.alt; } );
			val = val.text();
			$(':input[name="' + fields[f] + '"]', editRow).val( val );
		}
		if ( $( '.comment_status', rowData ).text() === 'open' ) {
			$( 'input[name="comment_status"]', editRow ).prop( 'checked', true );
		}
		if ( $( '.ping_status', rowData ).text() === 'open' ) {
			$( 'input[name="ping_status"]', editRow ).prop( 'checked', true );
		}
		if ( $( '.sticky', rowData ).text() === 'sticky' ) {
			$( 'input[name="sticky"]', editRow ).prop( 'checked', true );
		}
		$('.post_category', rowData).each(function(){
			var taxname,
				term_ids = $(this).text();
			if ( term_ids ) {
				taxname = $(this).attr('id').replace('_'+id, '');
				$('ul.'+taxname+'-checklist :checkbox', editRow).val(term_ids.split(','));
			}
		});
		$('.tags_input', rowData).each(function(){
			var terms = $(this),
				taxname = $(this).attr('id').replace('_' + id, ''),
				textarea = $('textarea.tax_input_' + taxname, editRow),
				comma = inlineEditL10n.comma;
			terms.find( 'img' ).replaceWith( function() { return this.alt; } );
			terms = terms.text();
			if ( terms ) {
				if ( ',' !== comma ) {
					terms = terms.replace(/,/g, comma);
				}
				textarea.val(terms);
			}
			textarea.wpTagsSuggest();
		});
		status = $('._status', rowData).text();
		if ( 'future' !== status ) {
			$('select[name="_status"] option[value="future"]', editRow).remove();
		}
		pw = $( '.inline-edit-password-input' ).prop( 'disabled', false );
		if ( 'private' === status ) {
			$('input[name="keep_private"]', editRow).prop('checked', true);
			pw.val( '' ).prop( 'disabled', true );
		}
		pageOpt = $('select[name="post_parent"] option[value="' + id + '"]', editRow);
		if ( pageOpt.length > 0 ) {
			pageLevel = pageOpt[0].className.split('-')[1];
			nextPage = pageOpt;
			while ( pageLoop ) {
				nextPage = nextPage.next('option');
				if ( nextPage.length === 0 ) {
					break;
				}
				nextLevel = nextPage[0].className.split('-')[1];
				if ( nextLevel <= pageLevel ) {
					pageLoop = false;
				} else {
					nextPage.remove();
					nextPage = pageOpt;
				}
			}
			pageOpt.remove();
		}
		$(editRow).attr('id', 'edit-'+id).addClass('inline-editor').show();
		$('.ptitle', editRow).focus();
		return false;
	},
	save : function(id) {
		var params, fields, page = $('.post_status_page').val() || '';
		if ( typeof(id) === 'object' ) {
			id = this.getId(id);
		}
		$( 'table.widefat .spinner' ).addClass( 'is-active' );
		params = {
			action: 'inline-save',
			post_type: typenow,
			post_ID: id,
			edit_date: 'true',
			post_status: page
		};
		fields = $('#edit-'+id).find(':input').serialize();
		params = fields + '&' + $.param(params);
		$.post( ajaxurl, params,
			function(r) {
				var $errorNotice = $( '#edit-' + id + ' .inline-edit-save .notice-error' ),
					$error = $errorNotice.find( '.error' );
				$( 'table.widefat .spinner' ).removeClass( 'is-active' );
				$( '.ac_results' ).hide();
				if (r) {
					if ( -1 !== r.indexOf( '<tr' ) ) {
						$(inlineEditPost.what+id).siblings('tr.hidden').addBack().remove();
						$('#edit-'+id).before(r).remove();
						$( inlineEditPost.what + id ).hide().fadeIn( 400, function() {
							$( this ).find( '.editinline' ).focus();
							wp.a11y.speak( inlineEditL10n.saved );
						});
					} else {
						r = r.replace( /<.[^<>]*?>/g, '' );
						$errorNotice.removeClass( 'hidden' );
						$error.html( r );
						wp.a11y.speak( $error.text() );
					}
				} else {
					$errorNotice.removeClass( 'hidden' );
					$error.html( inlineEditL10n.error );
					wp.a11y.speak( inlineEditL10n.error );
				}
			},
		'html');
		return false;
	},
	revert : function(){
		var $tableWideFat = $( '.widefat' ),
			id = $( '.inline-editor', $tableWideFat ).attr( 'id' );
		if ( id ) {
			$( '.spinner', $tableWideFat ).removeClass( 'is-active' );
			$( '.ac_results' ).hide();
			if ( 'bulk-edit' === id ) {
				$( '#bulk-edit', $tableWideFat ).removeClass( 'inline-editor' ).hide().siblings( '.hidden' ).remove();
				$('#bulk-titles').empty();
				$('#inlineedit').append( $('#bulk-edit') );
				$( '#' + inlineEditPost.whichBulkButtonId ).focus();
			} else {
				$('#'+id).siblings('tr.hidden').addBack().remove();
				id = id.substr( id.lastIndexOf('-') + 1 );
				$( this.what + id ).show().find( '.editinline' ).focus();
			}
		}
		return false;
	},
	getId : function(o) {
		var id = $(o).closest('tr').attr('id'),
			parts = id.split('-');
		return parts[parts.length - 1];
	}
};
$( document ).ready( function(){ inlineEditPost.init(); } );
$( document ).on( 'heartbeat-tick.wp-check-locked-posts', function( e, data ) {
	var locked = data['wp-check-locked-posts'] || {};
	$('#the-list tr').each( function(i, el) {
		var key = el.id, row = $(el), lock_data, avatar;
		if ( locked.hasOwnProperty( key ) ) {
			if ( ! row.hasClass('wp-locked') ) {
				lock_data = locked[key];
				row.find('.column-title .locked-text').text( lock_data.text );
				row.find('.check-column checkbox').prop('checked', false);
				if ( lock_data.avatar_src ) {
					avatar = $( '<img class="avatar avatar-18 photo" width="18" height="18" alt="" />' ).attr( 'src', lock_data.avatar_src.replace( /&amp;/g, '&' ) );
					row.find('.column-title .locked-avatar').empty().append( avatar );
				}
				row.addClass('wp-locked');
			}
		} else if ( row.hasClass('wp-locked') ) {
			row.removeClass('wp-locked').delay(1000).find('.locked-info span').empty();
		}
	});
}).on( 'heartbeat-send.wp-check-locked-posts', function( e, data ) {
	var check = [];
	$('#the-list tr').each( function(i, el) {
		if ( el.id ) {
			check.push( el.id );
		}
	});
	if ( check.length ) {
		data['wp-check-locked-posts'] = check;
	}
}).ready( function() {
	if ( typeof wp !== 'undefined' && wp.heartbeat ) {
		wp.heartbeat.interval( 15 );
	}
});
})( jQuery, window.wp );
