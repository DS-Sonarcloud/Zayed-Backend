 (() => { 
 	"use strict";
 	var __webpack_require__ = {};
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
  __dangerousOptInToUnstableAPIsOnlyForCoreModules: () => ( __dangerousOptInToUnstableAPIsOnlyForCoreModules)
});
;
const CORE_MODULES_USING_PRIVATE_APIS = ['@wordpress/block-directory', '@wordpress/block-editor', '@wordpress/block-library', '@wordpress/blocks', '@wordpress/commands', '@wordpress/components', '@wordpress/core-commands', '@wordpress/core-data', '@wordpress/customize-widgets', '@wordpress/data', '@wordpress/edit-post', '@wordpress/edit-site', '@wordpress/edit-widgets', '@wordpress/editor', '@wordpress/format-library', '@wordpress/patterns', '@wordpress/preferences', '@wordpress/reusable-blocks', '@wordpress/router', '@wordpress/dataviews', '@wordpress/fields', '@wordpress/media-utils', '@wordpress/upload-media'];
const registeredPrivateApis = [];
const requiredConsent = 'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.';
const allowReRegistration =  true ? false : 0;
const __dangerousOptInToUnstableAPIsOnlyForCoreModules = (consent, moduleName) => {
  if (!CORE_MODULES_USING_PRIVATE_APIS.includes(moduleName)) {
    throw new Error(`You tried to opt-in to unstable APIs as module "${moduleName}". ` + 'This feature is only for JavaScript modules shipped with WordPress core. ' + 'Please do not use it in plugins and themes as the unstable APIs will be removed ' + 'without a warning. If you ignore this error and depend on unstable features, ' + 'your product will inevitably break on one of the next WordPress releases.');
  }
  if (!allowReRegistration && registeredPrivateApis.includes(moduleName)) {
    throw new Error(`You tried to opt-in to unstable APIs as module "${moduleName}" which is already registered. ` + 'This feature is only for JavaScript modules shipped with WordPress core. ' + 'Please do not use it in plugins and themes as the unstable APIs will be removed ' + 'without a warning. If you ignore this error and depend on unstable features, ' + 'your product will inevitably break on one of the next WordPress releases.');
  }
  if (consent !== requiredConsent) {
    throw new Error(`You tried to opt-in to unstable APIs without confirming you know the consequences. ` + 'This feature is only for JavaScript modules shipped with WordPress core. ' + 'Please do not use it in plugins and themes as the unstable APIs will removed ' + 'without a warning. If you ignore this error and depend on unstable features, ' + 'your product will inevitably break on the next WordPress release.');
  }
  registeredPrivateApis.push(moduleName);
  return {
    lock,
    unlock
  };
};
function lock(object, privateData) {
  if (!object) {
    throw new Error('Cannot lock an undefined object.');
  }
  const _object = object;
  if (!(__private in _object)) {
    _object[__private] = {};
  }
  lockedData.set(_object[__private], privateData);
}
function unlock(object) {
  if (!object) {
    throw new Error('Cannot unlock an undefined object.');
  }
  const _object = object;
  if (!(__private in _object)) {
    throw new Error('Cannot unlock an object that was not locked before. ');
  }
  return lockedData.get(_object[__private]);
}
const lockedData = new WeakMap();
const __private = Symbol('Private API ID');
function allowCoreModule(name) {
  CORE_MODULES_USING_PRIVATE_APIS.push(name);
}
function resetAllowedCoreModules() {
  while (CORE_MODULES_USING_PRIVATE_APIS.length) {
    CORE_MODULES_USING_PRIVATE_APIS.pop();
  }
}
function resetRegisteredPrivateApis() {
  while (registeredPrivateApis.length) {
    registeredPrivateApis.pop();
  }
}
;
(window.wp = window.wp || {}).privateApis = __webpack_exports__;
 })()
;