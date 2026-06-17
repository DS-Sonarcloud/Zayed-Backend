
(function( component ) {
	'use strict';
	var AudioWidgetModel, AudioWidgetControl, AudioDetailsMediaFrame;
	AudioDetailsMediaFrame = wp.media.view.MediaFrame.AudioDetails.extend({
		createStates: function createStates() {
			this.states.add([
				new wp.media.controller.AudioDetails({
					media: this.media
				}),
				new wp.media.controller.MediaLibrary({
					type: 'audio',
					id: 'add-audio-source',
					title: wp.media.view.l10n.audioAddSourceTitle,
					toolbar: 'add-audio-source',
					media: this.media,
					menu: false
				})
			]);
		}
	});
	AudioWidgetModel = component.MediaWidgetModel.extend({});
	AudioWidgetControl = component.MediaWidgetControl.extend({
		showDisplaySettings: false,
		mapModelToMediaFrameProps: function mapModelToMediaFrameProps( modelProps ) {
			var control = this, mediaFrameProps;
			mediaFrameProps = component.MediaWidgetControl.prototype.mapModelToMediaFrameProps.call( control, modelProps );
			mediaFrameProps.link = 'embed';
			return mediaFrameProps;
		},
		renderPreview: function renderPreview() {
			var control = this, previewContainer, previewTemplate, attachmentId, attachmentUrl;
			attachmentId = control.model.get( 'attachment_id' );
			attachmentUrl = control.model.get( 'url' );
			if ( ! attachmentId && ! attachmentUrl ) {
				return;
			}
			previewContainer = control.$el.find( '.media-widget-preview' );
			previewTemplate = wp.template( 'wp-media-widget-audio-preview' );
			previewContainer.html( previewTemplate({
				model: {
					attachment_id: control.model.get( 'attachment_id' ),
					src: attachmentUrl
				},
				error: control.model.get( 'error' )
			}));
			wp.mediaelement.initialize();
		},
		editMedia: function editMedia() {
			var control = this, mediaFrame, metadata, updateCallback;
			metadata = control.mapModelToMediaFrameProps( control.model.toJSON() );
			mediaFrame = new AudioDetailsMediaFrame({
				frame: 'audio',
				state: 'audio-details',
				metadata: metadata
			});
			wp.media.frame = mediaFrame;
			mediaFrame.$el.addClass( 'media-widget' );
			updateCallback = function( mediaFrameProps ) {
				control.selectedAttachment.set( mediaFrameProps );
				control.model.set( _.extend(
					control.model.defaults(),
					control.mapMediaToModelProps( mediaFrameProps ),
					{ error: false }
				) );
			};
			mediaFrame.state( 'audio-details' ).on( 'update', updateCallback );
			mediaFrame.state( 'replace-audio' ).on( 'replace', updateCallback );
			mediaFrame.on( 'close', function() {
				mediaFrame.detach();
			});
			mediaFrame.open();
		}
	});
	component.controlConstructors.media_audio = AudioWidgetControl;
	component.modelConstructors.media_audio = AudioWidgetModel;
})( wp.mediaWidgets );
