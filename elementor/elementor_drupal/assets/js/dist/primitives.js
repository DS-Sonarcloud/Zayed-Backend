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
  BlockQuotation: () => ( BlockQuotation),
  Circle: () => ( Circle),
  Defs: () => ( Defs),
  G: () => ( G),
  HorizontalRule: () => ( HorizontalRule),
  Line: () => ( Line),
  LinearGradient: () => ( LinearGradient),
  Path: () => ( Path),
  Polygon: () => ( Polygon),
  RadialGradient: () => ( RadialGradient),
  Rect: () => ( Rect),
  SVG: () => ( SVG),
  Stop: () => ( Stop),
  View: () => ( View)
});
;
function r(e){var t,f,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(f=r(e[t]))&&(n&&(n+=" "),n+=f)}else for(f in e)e[f]&&(n&&(n+=" "),n+=f);return n}function clsx(){for(var e,t,f=0,n="",o=arguments.length;f<o;f++)(e=arguments[f])&&(t=r(e))&&(n&&(n+=" "),n+=t);return n} const dist_clsx = (clsx);
;
const external_wp_element_namespaceObject = window["wp"]["element"];
;
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;
const Circle = props => (0,external_wp_element_namespaceObject.createElement)('circle', props);
const G = props => (0,external_wp_element_namespaceObject.createElement)('g', props);
const Line = props => (0,external_wp_element_namespaceObject.createElement)('line', props);
const Path = props => (0,external_wp_element_namespaceObject.createElement)('path', props);
const Polygon = props => (0,external_wp_element_namespaceObject.createElement)('polygon', props);
const Rect = props => (0,external_wp_element_namespaceObject.createElement)('rect', props);
const Defs = props => (0,external_wp_element_namespaceObject.createElement)('defs', props);
const RadialGradient = props => (0,external_wp_element_namespaceObject.createElement)('radialGradient', props);
const LinearGradient = props => (0,external_wp_element_namespaceObject.createElement)('linearGradient', props);
const Stop = props => (0,external_wp_element_namespaceObject.createElement)('stop', props);
const SVG = (0,external_wp_element_namespaceObject.forwardRef)(
({
  className,
  isPressed,
  ...props
}, ref) => {
  const appliedProps = {
    ...props,
    className: dist_clsx(className, {
      'is-pressed': isPressed
    }) || undefined,
    'aria-hidden': true,
    focusable: false
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("svg", {
    ...appliedProps,
    ref: ref
  });
});
SVG.displayName = 'SVG';
;
const HorizontalRule = 'hr';
;
const BlockQuotation = 'blockquote';
;
const View = 'div';
;
(window.wp = window.wp || {}).primitives = __webpack_exports__;
 })()
;