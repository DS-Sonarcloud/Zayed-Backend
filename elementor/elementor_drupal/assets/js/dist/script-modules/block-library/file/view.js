import * as __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__ from "@wordpress/interactivity";
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
;
var x = (y) => {
	var x = {}; __webpack_require__.d(x, y); return x
} 
var y = (x) => (() => (x))
const interactivity_namespaceObject = x({ ["store"]: () => (__WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__.store) });
;
const browserSupportsPdfs = () => {
  if (window.navigator.userAgent.indexOf('Mobi') > -1) {
    return false;
  }
  if (window.navigator.userAgent.indexOf('Android') > -1) {
    return false;
  }
  if (window.navigator.userAgent.indexOf('Macintosh') > -1 && window.navigator.maxTouchPoints && window.navigator.maxTouchPoints > 2) {
    return false;
  }
  if (!!(window.ActiveXObject || 'ActiveXObject' in window) && !(createActiveXObject('AcroPDF.PDF') || createActiveXObject('PDF.PdfCtrl'))) {
    return false;
  }
  return true;
};
const createActiveXObject = type => {
  let ax;
  try {
    ax = new window.ActiveXObject(type);
  } catch (e) {
    ax = undefined;
  }
  return ax;
};
;
(0,interactivity_namespaceObject.store)('core/file', {
  state: {
    get hasPdfPreview() {
      return browserSupportsPdfs();
    }
  }
}, {
  lock: true
});
