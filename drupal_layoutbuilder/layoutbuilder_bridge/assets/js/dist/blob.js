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
   createBlobURL: () => ( createBlobURL),
   downloadBlob: () => ( downloadBlob),
   getBlobByURL: () => ( getBlobByURL),
   getBlobTypeByURL: () => ( getBlobTypeByURL),
   isBlobURL: () => ( isBlobURL),
   revokeBlobURL: () => ( revokeBlobURL)
 });
const cache = {};
function createBlobURL(file) {
  const url = window.URL.createObjectURL(file);
  cache[url] = file;
  return url;
}
function getBlobByURL(url) {
  return cache[url];
}
function getBlobTypeByURL(url) {
  return getBlobByURL(url)?.type.split('/')[0]; 
}
function revokeBlobURL(url) {
  if (cache[url]) {
    window.URL.revokeObjectURL(url);
  }
  delete cache[url];
}
function isBlobURL(url) {
  if (!url || !url.indexOf) {
    return false;
  }
  return url.indexOf('blob:') === 0;
}
function downloadBlob(filename, content, contentType = '') {
  if (!filename || !content) {
    return;
  }
  const file = new window.Blob([content], {
    type: contentType
  });
  const url = window.URL.createObjectURL(file);
  const anchorElement = document.createElement('a');
  anchorElement.href = url;
  anchorElement.download = filename;
  anchorElement.style.display = 'none';
  document.body.appendChild(anchorElement);
  anchorElement.click();
  document.body.removeChild(anchorElement);
  window.URL.revokeObjectURL(url);
}
(window.wp = window.wp || {}).blob = __webpack_exports__;
 })()
;