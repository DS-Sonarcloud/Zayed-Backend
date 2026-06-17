
(function( component ) {
	'use strict';
	var VideoWidgetModel, VideoWidgetControl, VideoDetailsMediaFrame;
	VideoDetailsMediaFrame = wp.media.view.MediaFrame.VideoDetails.extend({
		createStates: function createStates() {
			this.states.add([
				new wp.media.controller.VideoDetails({
					media: this.media
				}),
				new wp.media.controller.MediaLibrary({
					type: 'video',
					id: 'add-video-source',
					title: wp.media.view.l10n.videoAddSourceTitle,
					toolbar: 'add-video-source',
					media: this.media,
					menu: false
				}),
				new wp.media.controller.MediaLibrary({
					type: 'text',
					id: 'add-track',
					title: wp.media.view.l10n.videoAddTrackTitle,
					toolbar: 'add-track',
					media: this.media,
					menu: 'video-details'
				})
			]);
		}
	});
	VideoWidgetModel = component.MediaWidgetModel.extend({});
	VideoWidgetControl = component.MediaWidgetControl.extend({
		showDisplaySettings: false,
		oembedResponses: {},
		mapModelToMediaFrameProps: function mapModelToMediaFrameProps( modelProps ) {
			var control = this, mediaFrameProps;
			mediaFrameProps = component.MediaWidgetControl.prototype.mapModelToMediaFrameProps.call( control, modelProps );
			mediaFrameProps.link = 'embed';
			return mediaFrameProps;
		},
		fetchEmbed: function fetchEmbed() {
			var control = this, url;
			url = control.model.get( 'url' );
			if ( control.oembedResponses[ url ] ) {
				return;
			}
			if ( control.fetchEmbedDfd && 'pending' === control.fetchEmbedDfd.state() ) {
				control.fetchEmbedDfd.abort();
			}
			control.fetchEmbedDfd = wp.apiRequest({
				url: wp.media.view.settings.oEmbedProxyUrl,
				data: {
					url: control.model.get( 'url' ),
					maxwidth: control.model.get( 'width' ),
					maxheight: control.model.get( 'height' ),
					discover: false
				},
				type: 'GET',
				dataType: 'json',
				context: control
			});
			control.fetchEmbedDfd.done( function( response ) {
				control.oembedResponses[ url ] = response;
				control.renderPreview();
			});
			control.fetchEmbedDfd.fail( function() {
				control.oembedResponses[ url ] = null;
			});
		},
		isHostedVideo: function isHostedVideo() {
			return true;
		},
		renderPreview: function renderPreview() {
			var control = this, previewContainer, previewTemplate, attachmentId, attachmentUrl, poster, html = '', isOEmbed = false, mime, error, urlParser, matches;
			attachmentId = control.model.get( 'attachment_id' );
			attachmentUrl = control.model.get( 'url' );
			error = control.model.get( 'error' );
			if ( ! attachmentId && ! attachmentUrl ) {
				return;
			}
			mime = control.selectedAttachment.get( 'mime' );
			if ( mime && attachmentId ) {
				if ( ! _.contains( _.values( wp.media.view.settings.embedMimes ), mime ) ) {
					error = 'unsupported_file_type';
				}
			} else if ( ! attachmentId ) {
				urlParser = document.createElement( 'a' );
				urlParser.href = attachmentUrl;
				matches = urlParser.pathname.toLowerCase().match( /\.(\w+)$/ );
				if ( matches ) {
					if ( ! _.contains( _.keys( wp.media.view.settings.embedMimes ), matches[1] ) ) {
						error = 'unsupported_file_type';
					}
				} else {
					isOEmbed = true;
				}
			}
			if ( isOEmbed ) {
				control.fetchEmbed();
				if ( control.oembedResponses[ attachmentUrl ] ) {
					poster = control.oembedResponses[ attachmentUrl ].thumbnail_url;
					html = control.oembedResponses[ attachmentUrl ].html.replace( /\swidth="\d+"/, ' width="100%"' ).replace( /\sheight="\d+"/, '' );
				}
			}
			previewContainer = control.$el.find( '.media-widget-preview' );
			previewTemplate = wp.template( 'wp-media-widget-video-preview' );
			previewContainer.html( previewTemplate({
				model: {
					attachment_id: attachmentId,
					html: html,
					src: attachmentUrl,
					poster: poster
				},
				is_oembed: isOEmbed,
				error: error
			}));
			wp.mediaelement.initialize();
		},
		editMedia: function editMedia() {
			var control = this, mediaFrame, metadata, updateCallback;
			metadata = control.mapModelToMediaFrameProps( control.model.toJSON() );
			mediaFrame = new VideoDetailsMediaFrame({
				frame: 'video',
				state: 'video-details',
				metadata: metadata
			});
			wp.media.frame = mediaFrame;
			mediaFrame.$el.addClass( 'media-widget' );
			updateCallback = function( mediaFrameProps ) {
				control.selectedAttachment.set( mediaFrameProps );
				control.model.set( _.extend(
					_.omit( control.model.defaults(), 'title' ),
					control.mapMediaToModelProps( mediaFrameProps ),
					{ error: false }
				) );
			};
			mediaFrame.state( 'video-details' ).on( 'update', updateCallback );
			mediaFrame.state( 'replace-video' ).on( 'replace', updateCallback );
			mediaFrame.on( 'close', function() {
				mediaFrame.detach();
			});
			mediaFrame.open();
		}
	});
	component.controlConstructors.media_video = VideoWidgetControl;
	component.modelConstructors.media_video = VideoWidgetModel;
})( wp.mediaWidgets );
