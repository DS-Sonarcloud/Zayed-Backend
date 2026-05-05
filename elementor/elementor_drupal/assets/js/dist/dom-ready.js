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
var __webpack_exports__ = {};
 __webpack_require__.d(__webpack_exports__, {
   "default": () => ( domReady)
 });
function domReady(callback) {
  if (typeof document === 'undefined') {
    return;
  }
  if (document.readyState === 'complete' ||
  document.readyState === 'interactive' 
  ) {
    return void callback();
  }
  document.addEventListener('DOMContentLoaded', callback);
}
(window.wp = window.wp || {}).domReady = __webpack_exports__["default"];
 })()
;