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
  __unstableAwaitPromise: () => ( __unstableAwaitPromise),
  apiFetch: () => ( apiFetch),
  controls: () => ( controls),
  dispatch: () => ( dispatch),
  select: () => ( build_module_select),
  syncSelect: () => ( syncSelect)
});
;
const external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
var external_wp_apiFetch_default = __webpack_require__.n(external_wp_apiFetch_namespaceObject);
;
const external_wp_data_namespaceObject = window["wp"]["data"];
;
const external_wp_deprecated_namespaceObject = window["wp"]["deprecated"];
var external_wp_deprecated_default = __webpack_require__.n(external_wp_deprecated_namespaceObject);
;
function apiFetch(request) {
  return {
    type: 'API_FETCH',
    request
  };
}
function build_module_select(storeNameOrDescriptor, selectorName, ...args) {
  external_wp_deprecated_default()('`select` control in `@wordpress/data-controls`', {
    since: '5.7',
    alternative: 'built-in `resolveSelect` control in `@wordpress/data`'
  });
  return external_wp_data_namespaceObject.controls.resolveSelect(storeNameOrDescriptor, selectorName, ...args);
}
function syncSelect(storeNameOrDescriptor, selectorName, ...args) {
  external_wp_deprecated_default()('`syncSelect` control in `@wordpress/data-controls`', {
    since: '5.7',
    alternative: 'built-in `select` control in `@wordpress/data`'
  });
  return external_wp_data_namespaceObject.controls.select(storeNameOrDescriptor, selectorName, ...args);
}
function dispatch(storeNameOrDescriptor, actionName, ...args) {
  external_wp_deprecated_default()('`dispatch` control in `@wordpress/data-controls`', {
    since: '5.7',
    alternative: 'built-in `dispatch` control in `@wordpress/data`'
  });
  return external_wp_data_namespaceObject.controls.dispatch(storeNameOrDescriptor, actionName, ...args);
}
const __unstableAwaitPromise = function (promise) {
  return {
    type: 'AWAIT_PROMISE',
    promise
  };
};
const controls = {
  AWAIT_PROMISE({
    promise
  }) {
    return promise;
  },
  API_FETCH({
    request
  }) {
    return external_wp_apiFetch_default()(request);
  }
};
(window.wp = window.wp || {}).dataControls = __webpack_exports__;
 })()
;