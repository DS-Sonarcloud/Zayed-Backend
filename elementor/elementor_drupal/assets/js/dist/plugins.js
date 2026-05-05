 (() => { 
 	"use strict";
 	var __webpack_require__ = {};
 	(() => {
 		__webpack_require__.n = (module) => {
 			var getter = module && module.__esModule ?
 				() => (module['default']) :
 				() => (module);
 			__webpack_require__.d(getter, { a: getter });
 			return getter;
 		};
 	})();
 	(() => {
 		__webpack_require__.d = (exports, definition) => {
 			for(var key in definition) {
 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
 				}
 			}
 		};
 	})();
 	(() => {
 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
 	})();
 	(() => {
 		__webpack_require__.r = (exports) => {
 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
 			}
 			Object.defineProperty(exports, '__esModule', { value: true });
 		};
 	})();
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  PluginArea: () => ( plugin_area),
  getPlugin: () => ( getPlugin),
  getPlugins: () => ( getPlugins),
  registerPlugin: () => ( registerPlugin),
  unregisterPlugin: () => ( unregisterPlugin),
  usePluginContext: () => ( usePluginContext),
  withPluginContext: () => ( withPluginContext)
});
;
function memize(fn, options) {
	var size = 0;
	var head;
	var tail;
	options = options || {};
	function memoized() {
		var node = head,
			len = arguments.length,
			args,
			i;
		searchCache: while (node) {
			if (node.args.length !== arguments.length) {
				node = node.next;
				continue;
			}
			for (i = 0; i < len; i++) {
				if (node.args[i] !== arguments[i]) {
					node = node.next;
					continue searchCache;
				}
			}
			if (node !== head) {
				if (node === tail) {
					tail = node.prev;
				}
				 (node.prev).next = node.next;
				if (node.next) {
					node.next.prev = node.prev;
				}
				node.next = head;
				node.prev = null;
				 (head).prev = node;
				head = node;
			}
			return node.val;
		}
		args = new Array(len);
		for (i = 0; i < len; i++) {
			args[i] = arguments[i];
		}
		node = {
			args: args,
			val: fn.apply(null, args),
		};
		if (head) {
			head.prev = node;
			node.next = head;
		} else {
			tail = node;
		}
		if (size ===  (options).maxSize) {
			tail =  (tail).prev;
			 (tail).next = null;
		} else {
			size++;
		}
		head = node;
		return node.val;
	}
	memoized.clear = function () {
		head = null;
		tail = null;
		size = 0;
	};
	return memoized;
}
;
const external_wp_element_namespaceObject = window["wp"]["element"];
;
const external_wp_hooks_namespaceObject = window["wp"]["hooks"];
;
const external_wp_isShallowEqual_namespaceObject = window["wp"]["isShallowEqual"];
var external_wp_isShallowEqual_default = __webpack_require__.n(external_wp_isShallowEqual_namespaceObject);
;
const external_wp_compose_namespaceObject = window["wp"]["compose"];
;
const external_wp_deprecated_namespaceObject = window["wp"]["deprecated"];
var external_wp_deprecated_default = __webpack_require__.n(external_wp_deprecated_namespaceObject);
;
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;
const Context = (0,external_wp_element_namespaceObject.createContext)({
  name: null,
  icon: null
});
const PluginContextProvider = Context.Provider;
function usePluginContext() {
  return (0,external_wp_element_namespaceObject.useContext)(Context);
}
const withPluginContext = mapContextToProps => (0,external_wp_compose_namespaceObject.createHigherOrderComponent)(OriginalComponent => {
  external_wp_deprecated_default()('wp.plugins.withPluginContext', {
    since: '6.8.0',
    alternative: 'wp.plugins.usePluginContext'
  });
  return props => (0,external_ReactJSXRuntime_namespaceObject.jsx)(Context.Consumer, {
    children: context => (0,external_ReactJSXRuntime_namespaceObject.jsx)(OriginalComponent, {
      ...props,
      ...mapContextToProps(context, props)
    })
  });
}, 'withPluginContext');
;
class PluginErrorBoundary extends external_wp_element_namespaceObject.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
  }
  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }
  componentDidCatch(error) {
    const {
      name,
      onError
    } = this.props;
    if (onError) {
      onError(name, error);
    }
  }
  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return null;
  }
}
;
const external_wp_primitives_namespaceObject = window["wp"]["primitives"];
;
const plugins = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M10.5 4v4h3V4H15v4h1.5a1 1 0 011 1v4l-3 4v2a1 1 0 01-1 1h-3a1 1 0 01-1-1v-2l-3-4V9a1 1 0 011-1H9V4h1.5zm.5 12.5v2h2v-2l3-4v-3H8v3l3 4z"
  })
});
 const library_plugins = (plugins);
;
const api_plugins = {};
function registerPlugin(name, settings) {
  if (typeof settings !== 'object') {
    console.error('No settings object provided!');
    return null;
  }
  if (typeof name !== 'string') {
    console.error('Plugin name must be string.');
    return null;
  }
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    console.error('Plugin name must include only lowercase alphanumeric characters or dashes, and start with a letter. Example: "my-plugin".');
    return null;
  }
  if (api_plugins[name]) {
    console.error(`Plugin "${name}" is already registered.`);
  }
  settings = (0,external_wp_hooks_namespaceObject.applyFilters)('plugins.registerPlugin', settings, name);
  const {
    render,
    scope
  } = settings;
  if (typeof render !== 'function') {
    console.error('The "render" property must be specified and must be a valid function.');
    return null;
  }
  if (scope) {
    if (typeof scope !== 'string') {
      console.error('Plugin scope must be string.');
      return null;
    }
    if (!/^[a-z][a-z0-9-]*$/.test(scope)) {
      console.error('Plugin scope must include only lowercase alphanumeric characters or dashes, and start with a letter. Example: "my-page".');
      return null;
    }
  }
  api_plugins[name] = {
    name,
    icon: library_plugins,
    ...settings
  };
  (0,external_wp_hooks_namespaceObject.doAction)('plugins.pluginRegistered', settings, name);
  return settings;
}
function unregisterPlugin(name) {
  if (!api_plugins[name]) {
    console.error('Plugin "' + name + '" is not registered.');
    return;
  }
  const oldPlugin = api_plugins[name];
  delete api_plugins[name];
  (0,external_wp_hooks_namespaceObject.doAction)('plugins.pluginUnregistered', oldPlugin, name);
  return oldPlugin;
}
function getPlugin(name) {
  return api_plugins[name];
}
function getPlugins(scope) {
  return Object.values(api_plugins).filter(plugin => plugin.scope === scope);
}
;
const getPluginContext = memize((icon, name) => ({
  icon,
  name
}));
function PluginArea({
  scope,
  onError
}) {
  const store = (0,external_wp_element_namespaceObject.useMemo)(() => {
    let lastValue = [];
    return {
      subscribe(listener) {
        (0,external_wp_hooks_namespaceObject.addAction)('plugins.pluginRegistered', 'core/plugins/plugin-area/plugins-registered', listener);
        (0,external_wp_hooks_namespaceObject.addAction)('plugins.pluginUnregistered', 'core/plugins/plugin-area/plugins-unregistered', listener);
        return () => {
          (0,external_wp_hooks_namespaceObject.removeAction)('plugins.pluginRegistered', 'core/plugins/plugin-area/plugins-registered');
          (0,external_wp_hooks_namespaceObject.removeAction)('plugins.pluginUnregistered', 'core/plugins/plugin-area/plugins-unregistered');
        };
      },
      getValue() {
        const nextValue = getPlugins(scope);
        if (!external_wp_isShallowEqual_default()(lastValue, nextValue)) {
          lastValue = nextValue;
        }
        return lastValue;
      }
    };
  }, [scope]);
  const plugins = (0,external_wp_element_namespaceObject.useSyncExternalStore)(store.subscribe, store.getValue, store.getValue);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    style: {
      display: 'none'
    },
    children: plugins.map(({
      icon,
      name,
      render: Plugin
    }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(PluginContextProvider, {
      value: getPluginContext(icon, name),
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PluginErrorBoundary, {
        name: name,
        onError: onError,
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(Plugin, {})
      })
    }, name))
  });
}
 const plugin_area = (PluginArea);
;
;
(window.wp = window.wp || {}).plugins = __webpack_exports__;
 })()
;