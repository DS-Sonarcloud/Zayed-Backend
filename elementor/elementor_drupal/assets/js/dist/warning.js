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
  "default": () => ( warning)
});
;
const logged = new Set();
;
function isDev() {
  return true === true;
}
function warning(message) {
  if (!isDev()) {
    return;
  }
  if (logged.has(message)) {
    return;
  }
  console.warn(message);
  try {
    throw Error(message);
  } catch (x) {
  }
  logged.add(message);
}
(window.wp = window.wp || {}).warning = __webpack_exports__["default"];
 })()
;