
window.wp = window.wp || {};
(function($) {
	var revisions;
	revisions = wp.revisions = { model: {}, view: {}, controller: {} };
	revisions.settings = window._wpRevisionsSettings || {};
	revisions.debug = false;
	revisions.log = function() {
		if ( window.console && revisions.debug ) {
			window.console.log.apply( window.console, arguments );
		}
	};
	$.fn.allOffsets = function() {
		var offset = this.offset() || {top: 0, left: 0}, win = $(window);
		return _.extend( offset, {
			right:  win.width()  - offset.left - this.outerWidth(),
			bottom: win.height() - offset.top  - this.outerHeight()
		});
	};
	$.fn.allPositions = function() {
		var position = this.position() || {top: 0, left: 0}, parent = this.parent();
		return _.extend( position, {
			right:  parent.outerWidth()  - position.left - this.outerWidth(),
			bottom: parent.outerHeight() - position.top  - this.outerHeight()
		});
	};
	revisions.model.Slider = Backbone.Model.extend({
		defaults: {
			value: null,
			values: null,
			min: 0,
			max: 1,
			step: 1,
			range: false,
			compareTwoMode: false
		},
		initialize: function( options ) {
			this.frame = options.frame;
			this.revisions = options.revisions;
			this.listenTo( this.frame, 'update:revisions', this.receiveRevisions );
			this.listenTo( this.frame, 'change:compareTwoMode', this.updateMode );
			this.on( 'change:from', this.handleLocalChanges );
			this.on( 'change:to', this.handleLocalChanges );
			this.on( 'change:compareTwoMode', this.updateSliderSettings );
			this.on( 'update:revisions', this.updateSliderSettings );
			this.on( 'change:hoveredRevision', this.hoverRevision );
			this.set({
				max:   this.revisions.length - 1,
				compareTwoMode: this.frame.get('compareTwoMode'),
				from: this.frame.get('from'),
				to: this.frame.get('to')
			});
			this.updateSliderSettings();
		},
		getSliderValue: function( a, b ) {
			return isRtl ? this.revisions.length - this.revisions.indexOf( this.get(a) ) - 1 : this.revisions.indexOf( this.get(b) );
		},
		updateSliderSettings: function() {
			if ( this.get('compareTwoMode') ) {
				this.set({
					values: [
						this.getSliderValue( 'to', 'from' ),
						this.getSliderValue( 'from', 'to' )
					],
					value: null,
					range: true 
				});
			} else {
				this.set({
					value: this.getSliderValue( 'to', 'to' ),
					values: null,
					range: false
				});
			}
			this.trigger( 'update:slider' );
		},
		hoverRevision: function( model, value ) {
			this.trigger( 'hovered:revision', value );
		},
		updateMode: function( model, value ) {
			this.set({ compareTwoMode: value });
		},
		handleLocalChanges: function() {
			this.frame.set({
				from: this.get('from'),
				to: this.get('to')
			});
		},
		receiveRevisions: function( from, to ) {
			if ( this.get('from') === from && this.get('to') === to ) {
				return;
			}
			this.set({ from: from, to: to }, { silent: true });
			this.trigger( 'update:revisions', from, to );
		}
	});
	revisions.model.Tooltip = Backbone.Model.extend({
		defaults: {
			revision: null,
			offset: {},
			hovering: false, 
			scrubbing: false 
		},
		initialize: function( options ) {
			this.frame = options.frame;
			this.revisions = options.revisions;
			this.slider = options.slider;
			this.listenTo( this.slider, 'hovered:revision', this.updateRevision );
			this.listenTo( this.slider, 'change:hovering', this.setHovering );
			this.listenTo( this.slider, 'change:scrubbing', this.setScrubbing );
		},
		updateRevision: function( revision ) {
			this.set({ revision: revision });
		},
		setHovering: function( model, value ) {
			this.set({ hovering: value });
		},
		setScrubbing: function( model, value ) {
			this.set({ scrubbing: value });
		}
	});
	revisions.model.Revision = Backbone.Model.extend({});
	revisions.model.Revisions = Backbone.Collection.extend({
		model: revisions.model.Revision,
		initialize: function() {
			_.bindAll( this, 'next', 'prev' );
		},
		next: function( revision ) {
			var index = this.indexOf( revision );
			if ( index !== -1 && index !== this.length - 1 ) {
				return this.at( index + 1 );
			}
		},
		prev: function( revision ) {
			var index = this.indexOf( revision );
			if ( index !== -1 && index !== 0 ) {
				return this.at( index - 1 );
			}
		}
	});
	revisions.model.Field = Backbone.Model.extend({});
	revisions.model.Fields = Backbone.Collection.extend({
		model: revisions.model.Field
	});
	revisions.model.Diff = Backbone.Model.extend({
		initialize: function() {
			var fields = this.get('fields');
			this.unset('fields');
			this.fields = new revisions.model.Fields( fields );
		}
	});
	revisions.model.Diffs = Backbone.Collection.extend({
		initialize: function( models, options ) {
			_.bindAll( this, 'getClosestUnloaded' );
			this.loadAll = _.once( this._loadAll );
			this.revisions = options.revisions;
			this.postId = options.postId;
			this.requests  = {};
		},
		model: revisions.model.Diff,
		ensure: function( id, context ) {
			var diff     = this.get( id ),
				request  = this.requests[ id ],
				deferred = $.Deferred(),
				ids      = {},
				from     = id.split(':')[0],
				to       = id.split(':')[1];
			ids[id] = true;
			wp.revisions.log( 'ensure', id );
			this.trigger( 'ensure', ids, from, to, deferred.promise() );
			if ( diff ) {
				deferred.resolveWith( context, [ diff ] );
			} else {
				this.trigger( 'ensure:load', ids, from, to, deferred.promise() );
				_.each( ids, _.bind( function( id ) {
					if ( this.requests[ id ] ) {
						delete ids[ id ];
					}
					if ( this.get( id ) ) {
						delete ids[ id ];
					}
				}, this ) );
				if ( ! request ) {
					ids[ id ] = true;
					request   = this.load( _.keys( ids ) );
				}
				request.done( _.bind( function() {
					deferred.resolveWith( context, [ this.get( id ) ] );
				}, this ) ).fail( _.bind( function() {
					deferred.reject();
				}) );
			}
			return deferred.promise();
		},
		getClosestUnloaded: function( ids, centerId ) {
			var self = this;
			return _.chain([0].concat( ids )).initial().zip( ids ).sortBy( function( pair ) {
				return Math.abs( centerId - pair[1] );
			}).map( function( pair ) {
				return pair.join(':');
			}).filter( function( diffId ) {
				return _.isUndefined( self.get( diffId ) ) && ! self.requests[ diffId ];
			}).value();
		},
		_loadAll: function( allRevisionIds, centerId, num ) {
			var self = this, deferred = $.Deferred(),
				diffs = _.first( this.getClosestUnloaded( allRevisionIds, centerId ), num );
			if ( _.size( diffs ) > 0 ) {
				this.load( diffs ).done( function() {
					self._loadAll( allRevisionIds, centerId, num ).done( function() {
						deferred.resolve();
					});
				}).fail( function() {
					if ( 1 === num ) { 
						deferred.reject();
					} else { 
						self._loadAll( allRevisionIds, centerId, Math.ceil( num / 2 ) ).done( function() {
							deferred.resolve();
						});
					}
				});
			} else {
				deferred.resolve();
			}
			return deferred;
		},
		load: function( comparisons ) {
			wp.revisions.log( 'load', comparisons );
			return this.fetch({ data: { compare: comparisons }, remove: false }).done( function() {
				wp.revisions.log( 'load:complete', comparisons );
			});
		},
		sync: function( method, model, options ) {
			if ( 'read' === method ) {
				options = options || {};
				options.context = this;
				options.data = _.extend( options.data || {}, {
					action: 'get-revision-diffs',
					post_id: this.postId
				});
				var deferred = wp.ajax.send( options ),
					requests = this.requests;
				if ( options.data.compare ) {
					_.each( options.data.compare, function( id ) {
						requests[ id ] = deferred;
					});
				}
				deferred.always( function() {
					if ( options.data.compare ) {
						_.each( options.data.compare, function( id ) {
							delete requests[ id ];
						});
					}
				});
				return deferred;
			} else {
				return Backbone.Model.prototype.sync.apply( this, arguments );
			}
		}
	});
	revisions.model.FrameState = Backbone.Model.extend({
		defaults: {
			loading: false,
			error: false,
			compareTwoMode: false
		},
		initialize: function( attributes, options ) {
			var state = this.get( 'initialDiffState' );
			_.bindAll( this, 'receiveDiff' );
			this._debouncedEnsureDiff = _.debounce( this._ensureDiff, 200 );
			this.revisions = options.revisions;
			this.diffs = new revisions.model.Diffs( [], {
				revisions: this.revisions,
				postId: this.get( 'postId' )
			} );
			this.diffs.set( this.get( 'diffData' ) );
			this.listenTo( this, 'change:from', this.changeRevisionHandler );
			this.listenTo( this, 'change:to', this.changeRevisionHandler );
			this.listenTo( this, 'change:compareTwoMode', this.changeMode );
			this.listenTo( this, 'update:revisions', this.updatedRevisions );
			this.listenTo( this.diffs, 'ensure:load', this.updateLoadingStatus );
			this.listenTo( this, 'update:diff', this.updateLoadingStatus );
			this.set( {
				to : this.revisions.get( state.to ),
				from : this.revisions.get( state.from ),
				compareTwoMode : state.compareTwoMode
			} );
			if ( window.history && window.history.pushState ) {
				this.router = new revisions.Router({ model: this });
				if ( Backbone.History.started ) {
					Backbone.history.stop();
				}
				Backbone.history.start({ pushState: true });
			}
		},
		updateLoadingStatus: function() {
			this.set( 'error', false );
			this.set( 'loading', ! this.diff() );
		},
		changeMode: function( model, value ) {
			var toIndex = this.revisions.indexOf( this.get( 'to' ) );
			if ( value && 0 === toIndex ) {
				this.set({
					from: this.revisions.at( toIndex ),
					to:   this.revisions.at( toIndex + 1 )
				});
			}
			if ( ! value && 0 !== toIndex ) { 
				this.set({
					from: this.revisions.at( toIndex - 1 ),
					to:   this.revisions.at( toIndex )
				});
			}
		},
		updatedRevisions: function( from, to ) {
			if ( this.get( 'compareTwoMode' ) ) {
			} else {
				this.diffs.loadAll( this.revisions.pluck('id'), to.id, 40 );
			}
		},
		diff: function() {
			return this.diffs.get( this._diffId );
		},
		updateDiff: function( options ) {
			var from, to, diffId, diff;
			options = options || {};
			from = this.get('from');
			to = this.get('to');
			diffId = ( from ? from.id : 0 ) + ':' + to.id;
			if ( this._diffId === diffId ) {
				return $.Deferred().reject().promise();
			}
			this._diffId = diffId;
			this.trigger( 'update:revisions', from, to );
			diff = this.diffs.get( diffId );
			if ( diff ) {
				this.receiveDiff( diff );
				return $.Deferred().resolve().promise();
			} else {
				if ( options.immediate ) {
					return this._ensureDiff();
				} else {
					this._debouncedEnsureDiff();
					return $.Deferred().reject().promise();
				}
			}
		},
		changeRevisionHandler: function() {
			this.updateDiff();
		},
		receiveDiff: function( diff ) {
			if ( _.isUndefined( diff ) || _.isUndefined( diff.id ) ) {
				this.set({
					loading: false,
					error: true
				});
			} else if ( this._diffId === diff.id ) { 
				this.trigger( 'update:diff', diff );
			}
		},
		_ensureDiff: function() {
			return this.diffs.ensure( this._diffId, this ).always( this.receiveDiff );
		}
	});
	revisions.view.Frame = wp.Backbone.View.extend({
		className: 'revisions',
		template: wp.template('revisions-frame'),
		initialize: function() {
			this.listenTo( this.model, 'update:diff', this.renderDiff );
			this.listenTo( this.model, 'change:compareTwoMode', this.updateCompareTwoMode );
			this.listenTo( this.model, 'change:loading', this.updateLoadingStatus );
			this.listenTo( this.model, 'change:error', this.updateErrorStatus );
			this.views.set( '.revisions-control-frame', new revisions.view.Controls({
				model: this.model
			}) );
		},
		render: function() {
			wp.Backbone.View.prototype.render.apply( this, arguments );
			$('html').css( 'overflow-y', 'scroll' );
			$('#wpbody-content .wrap').append( this.el );
			this.updateCompareTwoMode();
			this.renderDiff( this.model.diff() );
			this.views.ready();
			return this;
		},
		renderDiff: function( diff ) {
			this.views.set( '.revisions-diff-frame', new revisions.view.Diff({
				model: diff
			}) );
		},
		updateLoadingStatus: function() {
			this.$el.toggleClass( 'loading', this.model.get('loading') );
		},
		updateErrorStatus: function() {
			this.$el.toggleClass( 'diff-error', this.model.get('error') );
		},
		updateCompareTwoMode: function() {
			this.$el.toggleClass( 'comparing-two-revisions', this.model.get('compareTwoMode') );
		}
	});
	revisions.view.Controls = wp.Backbone.View.extend({
		className: 'revisions-controls',
		initialize: function() {
			_.bindAll( this, 'setWidth' );
			this.views.add( new revisions.view.Buttons({
				model: this.model
			}) );
			this.views.add( new revisions.view.Checkbox({
				model: this.model
			}) );
			var slider = new revisions.model.Slider({
				frame: this.model,
				revisions: this.model.revisions
			}),
			tooltip = new revisions.model.Tooltip({
				frame: this.model,
				revisions: this.model.revisions,
				slider: slider
			});
			this.views.add( new revisions.view.Tooltip({
				model: tooltip
			}) );
			this.views.add( new revisions.view.Tickmarks({
				model: tooltip
			}) );
			this.views.add( new revisions.view.Slider({
				model: slider
			}) );
			this.views.add( new revisions.view.Metabox({
				model: this.model
			}) );
		},
		ready: function() {
			this.top = this.$el.offset().top;
			this.window = $(window);
			this.window.on( 'scroll.wp.revisions', {controls: this}, function(e) {
				var controls  = e.data.controls,
					container = controls.$el.parent(),
					scrolled  = controls.window.scrollTop(),
					frame     = controls.views.parent;
				if ( scrolled >= controls.top ) {
					if ( ! frame.$el.hasClass('pinned') ) {
						controls.setWidth();
						container.css('height', container.height() + 'px' );
						controls.window.on('resize.wp.revisions.pinning click.wp.revisions.pinning', {controls: controls}, function(e) {
							e.data.controls.setWidth();
						});
					}
					frame.$el.addClass('pinned');
				} else if ( frame.$el.hasClass('pinned') ) {
					controls.window.off('.wp.revisions.pinning');
					controls.$el.css('width', 'auto');
					frame.$el.removeClass('pinned');
					container.css('height', 'auto');
					controls.top = controls.$el.offset().top;
				} else {
					controls.top = controls.$el.offset().top;
				}
			});
		},
		setWidth: function() {
			this.$el.css('width', this.$el.parent().width() + 'px');
		}
	});
	revisions.view.Tickmarks = wp.Backbone.View.extend({
		className: 'revisions-tickmarks',
		direction: isRtl ? 'right' : 'left',
		initialize: function() {
			this.listenTo( this.model, 'change:revision', this.reportTickPosition );
		},
		reportTickPosition: function( model, revision ) {
			var offset, thisOffset, parentOffset, tick, index = this.model.revisions.indexOf( revision );
			thisOffset = this.$el.allOffsets();
			parentOffset = this.$el.parent().allOffsets();
			if ( index === this.model.revisions.length - 1 ) {
				offset = {
					rightPlusWidth: thisOffset.left - parentOffset.left + 1,
					leftPlusWidth: thisOffset.right - parentOffset.right + 1
				};
			} else {
				tick = this.$('div:nth-of-type(' + (index + 1) + ')');
				offset = tick.allPositions();
				_.extend( offset, {
					left: offset.left + thisOffset.left - parentOffset.left,
					right: offset.right + thisOffset.right - parentOffset.right
				});
				_.extend( offset, {
					leftPlusWidth: offset.left + tick.outerWidth(),
					rightPlusWidth: offset.right + tick.outerWidth()
				});
			}
			this.model.set({ offset: offset });
		},
		ready: function() {
			var tickCount, tickWidth;
			tickCount = this.model.revisions.length - 1;
			tickWidth = 1 / tickCount;
			this.$el.css('width', ( this.model.revisions.length * 50 ) + 'px');
			_(tickCount).times( function( index ){
				this.$el.append( '<div style="' + this.direction + ': ' + ( 100 * tickWidth * index ) + '%"></div>' );
			}, this );
		}
	});
	revisions.view.Metabox = wp.Backbone.View.extend({
		className: 'revisions-meta',
		initialize: function() {
			this.views.add( new revisions.view.MetaFrom({
				model: this.model,
				className: 'diff-meta diff-meta-from'
			}) );
			this.views.add( new revisions.view.MetaTo({
				model: this.model
			}) );
		}
	});
	revisions.view.Meta = wp.Backbone.View.extend({
		template: wp.template('revisions-meta'),
		events: {
			'click .restore-revision': 'restoreRevision'
		},
		initialize: function() {
			this.listenTo( this.model, 'update:revisions', this.render );
		},
		prepare: function() {
			return _.extend( this.model.toJSON()[this.type] || {}, {
				type: this.type
			});
		},
		restoreRevision: function() {
			document.location = this.model.get('to').attributes.restoreUrl;
		}
	});
	revisions.view.MetaFrom = revisions.view.Meta.extend({
		className: 'diff-meta diff-meta-from',
		type: 'from'
	});
	revisions.view.MetaTo = revisions.view.Meta.extend({
		className: 'diff-meta diff-meta-to',
		type: 'to'
	});
	revisions.view.Checkbox = wp.Backbone.View.extend({
		className: 'revisions-checkbox',
		template: wp.template('revisions-checkbox'),
		events: {
			'click .compare-two-revisions': 'compareTwoToggle'
		},
		initialize: function() {
			this.listenTo( this.model, 'change:compareTwoMode', this.updateCompareTwoMode );
		},
		ready: function() {
			if ( this.model.revisions.length < 3 ) {
				$('.revision-toggle-compare-mode').hide();
			}
		},
		updateCompareTwoMode: function() {
			this.$('.compare-two-revisions').prop( 'checked', this.model.get('compareTwoMode') );
		},
		compareTwoToggle: function() {
			this.model.set({ compareTwoMode: $('.compare-two-revisions').prop('checked') });
		}
	});
	revisions.view.Tooltip = wp.Backbone.View.extend({
		className: 'revisions-tooltip',
		template: wp.template('revisions-meta'),
		initialize: function() {
			this.listenTo( this.model, 'change:offset', this.render );
			this.listenTo( this.model, 'change:hovering', this.toggleVisibility );
			this.listenTo( this.model, 'change:scrubbing', this.toggleVisibility );
		},
		prepare: function() {
			if ( _.isNull( this.model.get('revision') ) ) {
				return;
			} else {
				return _.extend( { type: 'tooltip' }, {
					attributes: this.model.get('revision').toJSON()
				});
			}
		},
		render: function() {
			var otherDirection,
				direction,
				directionVal,
				flipped,
				css      = {},
				position = this.model.revisions.indexOf( this.model.get('revision') ) + 1;
			flipped = ( position / this.model.revisions.length ) > 0.5;
			if ( isRtl ) {
				direction = flipped ? 'left' : 'right';
				directionVal = flipped ? 'leftPlusWidth' : direction;
			} else {
				direction = flipped ? 'right' : 'left';
				directionVal = flipped ? 'rightPlusWidth' : direction;
			}
			otherDirection = 'right' === direction ? 'left': 'right';
			wp.Backbone.View.prototype.render.apply( this, arguments );
			css[direction] = this.model.get('offset')[directionVal] + 'px';
			css[otherDirection] = '';
			this.$el.toggleClass( 'flipped', flipped ).css( css );
		},
		visible: function() {
			return this.model.get( 'scrubbing' ) || this.model.get( 'hovering' );
		},
		toggleVisibility: function() {
			if ( this.visible() ) {
				this.$el.stop().show().fadeTo( 100 - this.el.style.opacity * 100, 1 );
			} else {
				this.$el.stop().fadeTo( this.el.style.opacity * 300, 0, function(){ $(this).hide(); } );
			}
			return;
		}
	});
	revisions.view.Buttons = wp.Backbone.View.extend({
		className: 'revisions-buttons',
		template: wp.template('revisions-buttons'),
		events: {
			'click .revisions-next .button': 'nextRevision',
			'click .revisions-previous .button': 'previousRevision'
		},
		initialize: function() {
			this.listenTo( this.model, 'update:revisions', this.disabledButtonCheck );
		},
		ready: function() {
			this.disabledButtonCheck();
		},
		gotoModel: function( toIndex ) {
			var attributes = {
				to: this.model.revisions.at( toIndex )
			};
			if ( toIndex ) {
				attributes.from = this.model.revisions.at( toIndex - 1 );
			} else {
				this.model.unset('from', { silent: true });
			}
			this.model.set( attributes );
		},
		nextRevision: function() {
			var toIndex = this.model.revisions.indexOf( this.model.get('to') ) + 1;
			this.gotoModel( toIndex );
		},
		previousRevision: function() {
			var toIndex = this.model.revisions.indexOf( this.model.get('to') ) - 1;
			this.gotoModel( toIndex );
		},
		disabledButtonCheck: function() {
			var maxVal   = this.model.revisions.length - 1,
				minVal   = 0,
				next     = $('.revisions-next .button'),
				previous = $('.revisions-previous .button'),
				val      = this.model.revisions.indexOf( this.model.get('to') );
			next.prop( 'disabled', ( maxVal === val ) );
			previous.prop( 'disabled', ( minVal === val ) );
		}
	});
	revisions.view.Slider = wp.Backbone.View.extend({
		className: 'wp-slider',
		direction: isRtl ? 'right' : 'left',
		events: {
			'mousemove' : 'mouseMove'
		},
		initialize: function() {
			_.bindAll( this, 'start', 'slide', 'stop', 'mouseMove', 'mouseEnter', 'mouseLeave' );
			this.listenTo( this.model, 'update:slider', this.applySliderSettings );
		},
		ready: function() {
			this.$el.css('width', ( this.model.revisions.length * 50 ) + 'px');
			this.$el.slider( _.extend( this.model.toJSON(), {
				start: this.start,
				slide: this.slide,
				stop:  this.stop
			}) );
			this.$el.hoverIntent({
				over: this.mouseEnter,
				out: this.mouseLeave,
				timeout: 800
			});
			this.applySliderSettings();
		},
		mouseMove: function( e ) {
			var zoneCount         = this.model.revisions.length - 1, 
				sliderFrom        = this.$el.allOffsets()[this.direction], 
				sliderWidth       = this.$el.width(), 
				tickWidth         = sliderWidth / zoneCount, 
				actualX           = ( isRtl ? $(window).width() - e.pageX : e.pageX ) - sliderFrom, 
				currentModelIndex = Math.floor( ( actualX  + ( tickWidth / 2 )  ) / tickWidth ); 
			if ( currentModelIndex < 0 ) {
				currentModelIndex = 0;
			} else if ( currentModelIndex >= this.model.revisions.length ) {
				currentModelIndex = this.model.revisions.length - 1;
			}
			this.model.set({ hoveredRevision: this.model.revisions.at( currentModelIndex ) });
		},
		mouseLeave: function() {
			this.model.set({ hovering: false });
		},
		mouseEnter: function() {
			this.model.set({ hovering: true });
		},
		applySliderSettings: function() {
			this.$el.slider( _.pick( this.model.toJSON(), 'value', 'values', 'range' ) );
			var handles = this.$('a.ui-slider-handle');
			if ( this.model.get('compareTwoMode') ) {
				handles.first()
					.toggleClass( 'to-handle', !! isRtl )
					.toggleClass( 'from-handle', ! isRtl );
				handles.last()
					.toggleClass( 'from-handle', !! isRtl )
					.toggleClass( 'to-handle', ! isRtl );
			} else {
				handles.removeClass('from-handle to-handle');
			}
		},
		start: function( event, ui ) {
			this.model.set({ scrubbing: true });
			$( window ).on( 'mousemove.wp.revisions', { view: this }, function( e ) {
				var handles,
					view              = e.data.view,
					leftDragBoundary  = view.$el.offset().left,
					sliderOffset      = leftDragBoundary,
					sliderRightEdge   = leftDragBoundary + view.$el.width(),
					rightDragBoundary = sliderRightEdge,
					leftDragReset     = '0',
					rightDragReset    = '100%',
					handle            = $( ui.handle );
				if ( view.model.get('compareTwoMode') ) {
					handles = handle.parent().find('.ui-slider-handle');
					if ( handle.is( handles.first() ) ) { 
						rightDragBoundary = handles.last().offset().left;
						rightDragReset    = rightDragBoundary - sliderOffset;
					} else { 
						leftDragBoundary = handles.first().offset().left + handles.first().width();
						leftDragReset    = leftDragBoundary - sliderOffset;
					}
				}
				if ( e.pageX < leftDragBoundary ) {
					handle.css( 'left', leftDragReset ); 
				} else if ( e.pageX > rightDragBoundary ) {
					handle.css( 'left', rightDragReset ); 
				} else {
					handle.css( 'left', e.pageX - sliderOffset ); 
				}
			} );
		},
		getPosition: function( position ) {
			return isRtl ? this.model.revisions.length - position - 1: position;
		},
		slide: function( event, ui ) {
			var attributes, movedRevision;
			if ( this.model.get('compareTwoMode') ) {
				if ( ui.values[1] === ui.values[0] ) {
					return false;
				}
				if ( isRtl ) {
					ui.values.reverse();
				}
				attributes = {
					from: this.model.revisions.at( this.getPosition( ui.values[0] ) ),
					to: this.model.revisions.at( this.getPosition( ui.values[1] ) )
				};
			} else {
				attributes = {
					to: this.model.revisions.at( this.getPosition( ui.value ) )
				};
				if ( this.getPosition( ui.value ) > 0 ) {
					attributes.from = this.model.revisions.at( this.getPosition( ui.value ) - 1 );
				} else {
					attributes.from = undefined;
				}
			}
			movedRevision = this.model.revisions.at( this.getPosition( ui.value ) );
			if ( this.model.get('scrubbing') ) {
				attributes.hoveredRevision = movedRevision;
			}
			this.model.set( attributes );
		},
		stop: function() {
			$( window ).off('mousemove.wp.revisions');
			this.model.updateSliderSettings(); 
			this.model.set({ scrubbing: false });
		}
	});
	revisions.view.Diff = wp.Backbone.View.extend({
		className: 'revisions-diff',
		template:  wp.template('revisions-diff'),
		prepare: function() {
			return _.extend({ fields: this.model.fields.toJSON() }, this.options );
		}
	});
	revisions.Router = Backbone.Router.extend({
		initialize: function( options ) {
			this.model = options.model;
			this.listenTo( this.model, 'update:diff', _.debounce( this.updateUrl, 250 ) );
			this.listenTo( this.model, 'change:compareTwoMode', this.updateUrl );
		},
		baseUrl: function( url ) {
			return this.model.get('baseUrl') + url;
		},
		updateUrl: function() {
			var from = this.model.has('from') ? this.model.get('from').id : 0,
				to   = this.model.get('to').id;
			if ( this.model.get('compareTwoMode' ) ) {
				this.navigate( this.baseUrl( '?from=' + from + '&to=' + to ), { replace: true } );
			} else {
				this.navigate( this.baseUrl( '?revision=' + to ), { replace: true } );
			}
		},
		handleRoute: function( a, b ) {
			var compareTwo = _.isUndefined( b );
			if ( ! compareTwo ) {
				b = this.model.revisions.get( a );
				a = this.model.revisions.prev( b );
				b = b ? b.id : 0;
				a = a ? a.id : 0;
			}
		}
	});
	revisions.init = function() {
		var state;
		if ( ! window.adminpage || 'revision-php' !== window.adminpage ) {
			return;
		}
		state = new revisions.model.FrameState({
			initialDiffState: {
				to: parseInt( revisions.settings.to, 10 ),
				from: parseInt( revisions.settings.from, 10 ),
				compareTwoMode: ( revisions.settings.compareTwoMode === '1' )
			},
			diffData: revisions.settings.diffData,
			baseUrl: revisions.settings.baseUrl,
			postId: parseInt( revisions.settings.postId, 10 )
		}, {
			revisions: new revisions.model.Revisions( revisions.settings.revisionData )
		});
		revisions.view.frame = new revisions.view.Frame({
			model: state
		}).render();
	};
	$( revisions.init );
}(jQuery));
