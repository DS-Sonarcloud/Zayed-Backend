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
  ifViewportMatches: () => ( if_viewport_matches),
  store: () => ( store),
  withViewportMatch: () => ( with_viewport_match)
});
var actions_namespaceObject = {};
__webpack_require__.r(actions_namespaceObject);
__webpack_require__.d(actions_namespaceObject, {
  setIsMatching: () => (setIsMatching)
});
var selectors_namespaceObject = {};
__webpack_require__.r(selectors_namespaceObject);
__webpack_require__.d(selectors_namespaceObject, {
  isViewportMatch: () => (isViewportMatch)
});
;
const external_wp_compose_namespaceObject = window["wp"]["compose"];
;
const external_wp_data_namespaceObject = window["wp"]["data"];
;
function reducer(state = {}, action) {
  switch (action.type) {
    case 'SET_IS_MATCHING':
      return action.values;
  }
  return state;
}
 const store_reducer = (reducer);
;
function setIsMatching(values) {
  return {
    type: 'SET_IS_MATCHING',
    values
  };
}
;
function isViewportMatch(state, query) {
  if (query.indexOf(' ') === -1) {
    query = '>= ' + query;
  }
  return !!state[query];
}
;
const STORE_NAME = 'core/viewport';
const store = (0,external_wp_data_namespaceObject.createReduxStore)(STORE_NAME, {
  reducer: store_reducer,
  actions: actions_namespaceObject,
  selectors: selectors_namespaceObject
});
(0,external_wp_data_namespaceObject.register)(store);
;
const addDimensionsEventListener = (breakpoints, operators) => {
  const setIsMatching = (0,external_wp_compose_namespaceObject.debounce)(() => {
    const values = Object.fromEntries(queries.map(([key, query]) => [key, query.matches]));
    (0,external_wp_data_namespaceObject.dispatch)(store).setIsMatching(values);
  }, 0, {
    leading: true
  });
  const operatorEntries = Object.entries(operators);
  const queries = Object.entries(breakpoints).flatMap(([name, width]) => {
    return operatorEntries.map(([operator, condition]) => {
      const list = window.matchMedia(`(${condition}: ${width}px)`);
      list.addEventListener('change', setIsMatching);
      return [`${operator} ${name}`, list];
    });
  });
  window.addEventListener('orientationchange', setIsMatching);
  setIsMatching();
  setIsMatching.flush();
};
 const listener = (addDimensionsEventListener);
;
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;
const withViewportMatch = queries => {
  const queryEntries = Object.entries(queries);
  const useViewPortQueriesResult = () => Object.fromEntries(queryEntries.map(([key, query]) => {
    let [operator, breakpointName] = query.split(' ');
    if (breakpointName === undefined) {
      breakpointName = operator;
      operator = '>=';
    }
    return [key, (0,external_wp_compose_namespaceObject.useViewportMatch)(breakpointName, operator)];
  }));
  return (0,external_wp_compose_namespaceObject.createHigherOrderComponent)(WrappedComponent => {
    return (0,external_wp_compose_namespaceObject.pure)(props => {
      const queriesResult = useViewPortQueriesResult();
      return (0,external_ReactJSXRuntime_namespaceObject.jsx)(WrappedComponent, {
        ...props,
        ...queriesResult
      });
    });
  }, 'withViewportMatch');
};
 const with_viewport_match = (withViewportMatch);
;
const ifViewportMatches = query => (0,external_wp_compose_namespaceObject.createHigherOrderComponent)((0,external_wp_compose_namespaceObject.compose)([with_viewport_match({
  isViewportMatch: query
}), (0,external_wp_compose_namespaceObject.ifCondition)(props => props.isViewportMatch)]), 'ifViewportMatches');
 const if_viewport_matches = (ifViewportMatches);
;
const BREAKPOINTS = {
  huge: 1440,
  wide: 1280,
  large: 960,
  medium: 782,
  small: 600,
  mobile: 480
};
const OPERATORS = {
  '<': 'max-width',
  '>=': 'min-width'
};
listener(BREAKPOINTS, OPERATORS);
(window.wp = window.wp || {}).viewport = __webpack_exports__;
 })()
;