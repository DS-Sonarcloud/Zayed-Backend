
(function( component ) {
	'use strict';
	var GalleryWidgetModel, GalleryWidgetControl, GalleryDetailsMediaFrame;
	GalleryDetailsMediaFrame = wp.media.view.MediaFrame.Post.extend( {
		createStates: function createStates() {
			this.states.add([
				new wp.media.controller.Library({
					id:         'gallery',
					title:      wp.media.view.l10n.createGalleryTitle,
					priority:   40,
					toolbar:    'main-gallery',
					filterable: 'uploaded',
					multiple:   'add',
					editable:   true,
					library:  wp.media.query( _.defaults({
						type: 'image'
					}, this.options.library ) )
				}),
				new wp.media.controller.GalleryEdit({
					library: this.options.selection,
					editing: this.options.editing,
					menu:    'gallery'
				}),
				new wp.media.controller.GalleryAdd()
			]);
		}
	} );
	GalleryWidgetModel = component.MediaWidgetModel.extend( {} );
	GalleryWidgetControl = component.MediaWidgetControl.extend( {
		events: _.extend( {}, component.MediaWidgetControl.prototype.events, {
			'click .media-widget-gallery-preview': 'editMedia'
		} ),
		initialize: function initialize( options ) {
			var control = this;
			component.MediaWidgetControl.prototype.initialize.call( control, options );
			_.bindAll( control, 'updateSelectedAttachments', 'handleAttachmentDestroy' );
			control.selectedAttachments = new wp.media.model.Attachments();
			control.model.on( 'change:ids', control.updateSelectedAttachments );
			control.selectedAttachments.on( 'change', control.renderPreview );
			control.selectedAttachments.on( 'reset', control.renderPreview );
			control.updateSelectedAttachments();
			if ( wp.customize && wp.customize.previewer ) {
				control.selectedAttachments.on( 'change', function() {
					wp.customize.previewer.send( 'refresh-widget-partial', control.model.get( 'widget_id' ) );
				} );
			}
		},
		updateSelectedAttachments: function updateSelectedAttachments() {
			var control = this, newIds, oldIds, removedIds, addedIds, addedQuery;
			newIds = control.model.get( 'ids' );
			oldIds = _.pluck( control.selectedAttachments.models, 'id' );
			removedIds = _.difference( oldIds, newIds );
			_.each( removedIds, function( removedId ) {
				control.selectedAttachments.remove( control.selectedAttachments.get( removedId ) );
			});
			addedIds = _.difference( newIds, oldIds );
			if ( addedIds.length ) {
				addedQuery = wp.media.query({
					order: 'ASC',
					orderby: 'post__in',
					perPage: -1,
					post__in: newIds,
					query: true,
					type: 'image'
				});
				addedQuery.more().done( function() {
					control.selectedAttachments.reset( addedQuery.models );
				});
			}
		},
		renderPreview: function renderPreview() {
			var control = this, previewContainer, previewTemplate, data;
			previewContainer = control.$el.find( '.media-widget-preview' );
			previewTemplate = wp.template( 'wp-media-widget-gallery-preview' );
			data = control.previewTemplateProps.toJSON();
			data.attachments = {};
			control.selectedAttachments.each( function( attachment ) {
				data.attachments[ attachment.id ] = attachment.toJSON();
			} );
			previewContainer.html( previewTemplate( data ) );
		},
		isSelected: function isSelected() {
			var control = this;
			if ( control.model.get( 'error' ) ) {
				return false;
			}
			return control.model.get( 'ids' ).length > 0;
		},
		editMedia: function editMedia() {
			var control = this, selection, mediaFrame, mediaFrameProps;
			selection = new wp.media.model.Selection( control.selectedAttachments.models, {
				multiple: true
			});
			mediaFrameProps = control.mapModelToMediaFrameProps( control.model.toJSON() );
			selection.gallery = new Backbone.Model( mediaFrameProps );
			if ( mediaFrameProps.size ) {
				control.displaySettings.set( 'size', mediaFrameProps.size );
			}
			mediaFrame = new GalleryDetailsMediaFrame({
				frame: 'manage',
				text: control.l10n.add_to_widget,
				selection: selection,
				mimeType: control.mime_type,
				selectedDisplaySettings: control.displaySettings,
				showDisplaySettings: control.showDisplaySettings,
				metadata: mediaFrameProps,
				editing:   true,
				multiple:  true,
				state: 'gallery-edit'
			});
			wp.media.frame = mediaFrame; 
			mediaFrame.on( 'update', function onUpdate( newSelection ) {
				var state = mediaFrame.state(), resultSelection;
				resultSelection = newSelection || state.get( 'selection' );
				if ( ! resultSelection ) {
					return;
				}
				if ( resultSelection.gallery ) {
					control.model.set( control.mapMediaToModelProps( resultSelection.gallery.toJSON() ) );
				}
				control.selectedAttachments.reset( resultSelection.models );
				control.model.set( {
					ids: _.pluck( resultSelection.models, 'id' )
				} );
			} );
			mediaFrame.$el.addClass( 'media-widget' );
			mediaFrame.open();
			if ( selection ) {
				selection.on( 'destroy', control.handleAttachmentDestroy );
			}
		},
		selectMedia: function selectMedia() {
			var control = this, selection, mediaFrame, mediaFrameProps;
			selection = new wp.media.model.Selection( control.selectedAttachments.models, {
				multiple: true
			});
			mediaFrameProps = control.mapModelToMediaFrameProps( control.model.toJSON() );
			if ( mediaFrameProps.size ) {
				control.displaySettings.set( 'size', mediaFrameProps.size );
			}
			mediaFrame = new GalleryDetailsMediaFrame({
				frame: 'select',
				text: control.l10n.add_to_widget,
				selection: selection,
				mimeType: control.mime_type,
				selectedDisplaySettings: control.displaySettings,
				showDisplaySettings: control.showDisplaySettings,
				metadata: mediaFrameProps,
				state: 'gallery'
			});
			wp.media.frame = mediaFrame; 
			mediaFrame.on( 'update', function onUpdate( newSelection ) {
				var state = mediaFrame.state(), resultSelection;
				resultSelection = newSelection || state.get( 'selection' );
				if ( ! resultSelection ) {
					return;
				}
				if ( resultSelection.gallery ) {
					control.model.set( control.mapMediaToModelProps( resultSelection.gallery.toJSON() ) );
				}
				control.selectedAttachments.reset( resultSelection.models );
				control.model.set( {
					ids: _.pluck( resultSelection.models, 'id' )
				} );
			} );
			mediaFrame.$el.addClass( 'media-widget' );
			mediaFrame.open();
			if ( selection ) {
				selection.on( 'destroy', control.handleAttachmentDestroy );
			}
			mediaFrame.$el.find( ':focusable:first' ).focus();
		},
		handleAttachmentDestroy: function handleAttachmentDestroy( attachment ) {
			var control = this;
			control.model.set( {
				ids: _.difference(
					control.model.get( 'ids' ),
					[ attachment.id ]
				)
			} );
		}
	} );
	component.controlConstructors.media_gallery = GalleryWidgetControl;
	component.modelConstructors.media_gallery = GalleryWidgetModel;
})( wp.mediaWidgets );
