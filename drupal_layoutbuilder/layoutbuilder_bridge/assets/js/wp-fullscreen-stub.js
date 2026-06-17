
( function() {
	var noop = function(){};
	window.wp = window.wp || {};
	window.wp.editor = window.wp.editor || {};
	window.wp.editor.fullscreen = {
		bind_resize: noop,
		dfwWidth: noop,
		off: noop,
		on: noop,
		refreshButtons: noop,
		resizeTextarea: noop,
		save: noop,
		switchmode: noop,
		toggleUI: noop,
		settings: {},
		pubsub: {
			publish: noop,
			subscribe: noop,
			unsubscribe: noop,
			topics: {}
		},
		fade: {
			In: noop,
			Out: noop
		},
		ui: {
			fade: noop,
			init: noop
		}
	};
}());
