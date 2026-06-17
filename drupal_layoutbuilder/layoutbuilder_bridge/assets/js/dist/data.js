 (() => { 
 	"use strict";
 	var __webpack_modules__ = ({
 66:
 ((module) => {
var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};
function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}
function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);
	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;
function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}
function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}
function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}
function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}
function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}
	var customMerge = options.customMerge(key);
	return typeof customMerge === 'function' ? customMerge : deepmerge
}
function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return Object.propertyIsEnumerable.call(target, symbol)
		})
		: []
}
function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}
function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch(_) {
		return false
	}
}
function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) 
		&& !(Object.hasOwnProperty.call(target, key) 
			&& Object.propertyIsEnumerable.call(target, key)) 
}
function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	getKeys(source).forEach(function(key) {
		if (propertyIsUnsafe(target, key)) {
			return
		}
		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		}
	});
	return destination
}
function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}
deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}
	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};
var deepmerge_1 = deepmerge;
module.exports = deepmerge_1;
 }),
 3249:
 ((module) => {
function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }
  return _typeof(obj);
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}
function getValuePair(instance, key) {
  var _map = instance._map,
      _arrayTreeMap = instance._arrayTreeMap,
      _objectTreeMap = instance._objectTreeMap; 
  if (_map.has(key)) {
    return _map.get(key);
  } 
  var properties = Object.keys(key).sort(); 
  var map = Array.isArray(key) ? _arrayTreeMap : _objectTreeMap;
  for (var i = 0; i < properties.length; i++) {
    var property = properties[i];
    map = map.get(property);
    if (map === undefined) {
      return;
    }
    var propertyValue = key[property];
    map = map.get(propertyValue);
    if (map === undefined) {
      return;
    }
  }
  var valuePair = map.get('_ekm_value');
  if (!valuePair) {
    return;
  } 
  _map.delete(valuePair[0]);
  valuePair[0] = key;
  map.set('_ekm_value', valuePair);
  _map.set(key, valuePair);
  return valuePair;
}
var EquivalentKeyMap =
function () {
  function EquivalentKeyMap(iterable) {
    _classCallCheck(this, EquivalentKeyMap);
    this.clear();
    if (iterable instanceof EquivalentKeyMap) {
      var iterablePairs = [];
      iterable.forEach(function (value, key) {
        iterablePairs.push([key, value]);
      });
      iterable = iterablePairs;
    }
    if (iterable != null) {
      for (var i = 0; i < iterable.length; i++) {
        this.set(iterable[i][0], iterable[i][1]);
      }
    }
  }
  _createClass(EquivalentKeyMap, [{
    key: "set",
    value: function set(key, value) {
      if (key === null || _typeof(key) !== 'object') {
        this._map.set(key, value);
        return this;
      } 
      var properties = Object.keys(key).sort();
      var valuePair = [key, value]; 
      var map = Array.isArray(key) ? this._arrayTreeMap : this._objectTreeMap;
      for (var i = 0; i < properties.length; i++) {
        var property = properties[i];
        if (!map.has(property)) {
          map.set(property, new EquivalentKeyMap());
        }
        map = map.get(property);
        var propertyValue = key[property];
        if (!map.has(propertyValue)) {
          map.set(propertyValue, new EquivalentKeyMap());
        }
        map = map.get(propertyValue);
      } 
      var previousValuePair = map.get('_ekm_value');
      if (previousValuePair) {
        this._map.delete(previousValuePair[0]);
      }
      map.set('_ekm_value', valuePair);
      this._map.set(key, valuePair);
      return this;
    }
  }, {
    key: "get",
    value: function get(key) {
      if (key === null || _typeof(key) !== 'object') {
        return this._map.get(key);
      }
      var valuePair = getValuePair(this, key);
      if (valuePair) {
        return valuePair[1];
      }
    }
  }, {
    key: "has",
    value: function has(key) {
      if (key === null || _typeof(key) !== 'object') {
        return this._map.has(key);
      } 
      return getValuePair(this, key) !== undefined;
    }
  }, {
    key: "delete",
    value: function _delete(key) {
      if (!this.has(key)) {
        return false;
      } 
      this.set(key, undefined);
      return true;
    }
  }, {
    key: "forEach",
    value: function forEach(callback) {
      var _this = this;
      var thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this;
      this._map.forEach(function (value, key) {
        if (key !== null && _typeof(key) === 'object') {
          value = value[1];
        }
        callback.call(thisArg, value, key, _this);
      });
    }
  }, {
    key: "clear",
    value: function clear() {
      this._map = new Map();
      this._arrayTreeMap = new Map();
      this._objectTreeMap = new Map();
    }
  }, {
    key: "size",
    get: function get() {
      return this._map.size;
    }
  }]);
  return EquivalentKeyMap;
}();
module.exports = EquivalentKeyMap;
 })
 	});
 	var __webpack_module_cache__ = {};
 	function __webpack_require__(moduleId) {
 		var cachedModule = __webpack_module_cache__[moduleId];
 		if (cachedModule !== undefined) {
 			return cachedModule.exports;
 		}
 		var module = __webpack_module_cache__[moduleId] = {
 			exports: {}
 		};
 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
 		return module.exports;
 	}
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
  AsyncModeProvider: () => ( async_mode_provider_context),
  RegistryConsumer: () => ( RegistryConsumer),
  RegistryProvider: () => ( context),
  combineReducers: () => ( build_module_combineReducers),
  controls: () => ( controls),
  createReduxStore: () => ( createReduxStore),
  createRegistry: () => ( createRegistry),
  createRegistryControl: () => ( createRegistryControl),
  createRegistrySelector: () => ( createRegistrySelector),
  createSelector: () => ( rememo),
  dispatch: () => ( dispatch_dispatch),
  plugins: () => ( plugins_namespaceObject),
  register: () => ( register),
  registerGenericStore: () => ( registerGenericStore),
  registerStore: () => ( registerStore),
  resolveSelect: () => ( build_module_resolveSelect),
  select: () => ( select_select),
  subscribe: () => ( subscribe),
  suspendSelect: () => ( suspendSelect),
  use: () => ( use),
  useDispatch: () => ( use_dispatch),
  useRegistry: () => ( useRegistry),
  useSelect: () => ( useSelect),
  useSuspenseSelect: () => ( useSuspenseSelect),
  withDispatch: () => ( with_dispatch),
  withRegistry: () => ( with_registry),
  withSelect: () => ( with_select)
});
var selectors_namespaceObject = {};
__webpack_require__.r(selectors_namespaceObject);
__webpack_require__.d(selectors_namespaceObject, {
  countSelectorsByStatus: () => (countSelectorsByStatus),
  getCachedResolvers: () => (getCachedResolvers),
  getIsResolving: () => (getIsResolving),
  getResolutionError: () => (getResolutionError),
  getResolutionState: () => (getResolutionState),
  hasFinishedResolution: () => (hasFinishedResolution),
  hasResolutionFailed: () => (hasResolutionFailed),
  hasResolvingSelectors: () => (hasResolvingSelectors),
  hasStartedResolution: () => (hasStartedResolution),
  isResolving: () => (isResolving)
});
var actions_namespaceObject = {};
__webpack_require__.r(actions_namespaceObject);
__webpack_require__.d(actions_namespaceObject, {
  failResolution: () => (failResolution),
  failResolutions: () => (failResolutions),
  finishResolution: () => (finishResolution),
  finishResolutions: () => (finishResolutions),
  invalidateResolution: () => (invalidateResolution),
  invalidateResolutionForStore: () => (invalidateResolutionForStore),
  invalidateResolutionForStoreSelector: () => (invalidateResolutionForStoreSelector),
  startResolution: () => (startResolution),
  startResolutions: () => (startResolutions)
});
var plugins_namespaceObject = {};
__webpack_require__.r(plugins_namespaceObject);
__webpack_require__.d(plugins_namespaceObject, {
  persistence: () => (persistence)
});
;
const external_wp_deprecated_namespaceObject = window["wp"]["deprecated"];
var external_wp_deprecated_default = __webpack_require__.n(external_wp_deprecated_namespaceObject);
;
function formatProdErrorMessage(code) {
  return `Minified Redux error #${code}; visit https://redux.js.org/Errors?code=${code} for the full message or use the non-minified dev environment for full errors. `;
}
var $$observable =  (() => typeof Symbol === "function" && Symbol.observable || "@@observable")();
var symbol_observable_default = $$observable;
var randomString = () => Math.random().toString(36).substring(7).split("").join(".");
var ActionTypes = {
  INIT: `@@redux/INIT${/* @__PURE__ */ randomString()}`,
  REPLACE: `@@redux/REPLACE${/* @__PURE__ */ randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
};
var actionTypes_default = ActionTypes;
function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null)
    return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto || Object.getPrototypeOf(obj) === null;
}
function miniKindOf(val) {
  if (val === void 0)
    return "undefined";
  if (val === null)
    return "null";
  const type = typeof val;
  switch (type) {
    case "boolean":
    case "string":
    case "number":
    case "symbol":
    case "function": {
      return type;
    }
  }
  if (Array.isArray(val))
    return "array";
  if (isDate(val))
    return "date";
  if (isError(val))
    return "error";
  const constructorName = ctorName(val);
  switch (constructorName) {
    case "Symbol":
    case "Promise":
    case "WeakMap":
    case "WeakSet":
    case "Map":
    case "Set":
      return constructorName;
  }
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase().replace(/\s/g, "");
}
function ctorName(val) {
  return typeof val.constructor === "function" ? val.constructor.name : null;
}
function isError(val) {
  return val instanceof Error || typeof val.message === "string" && val.constructor && typeof val.constructor.stackTraceLimit === "number";
}
function isDate(val) {
  if (val instanceof Date)
    return true;
  return typeof val.toDateString === "function" && typeof val.getDate === "function" && typeof val.setDate === "function";
}
function kindOf(val) {
  let typeOfVal = typeof val;
  if (false) {}
  return typeOfVal;
}
function createStore(reducer, preloadedState, enhancer) {
  if (typeof reducer !== "function") {
    throw new Error( true ? formatProdErrorMessage(2) : 0);
  }
  if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function" && typeof arguments[3] === "function") {
    throw new Error( true ? formatProdErrorMessage(0) : 0);
  }
  if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
    enhancer = preloadedState;
    preloadedState = void 0;
  }
  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error( true ? formatProdErrorMessage(1) : 0);
    }
    return enhancer(createStore)(reducer, preloadedState);
  }
  let currentReducer = reducer;
  let currentState = preloadedState;
  let currentListeners =  new Map();
  let nextListeners = currentListeners;
  let listenerIdCounter = 0;
  let isDispatching = false;
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners =  new Map();
      currentListeners.forEach((listener, key) => {
        nextListeners.set(key, listener);
      });
    }
  }
  function getState() {
    if (isDispatching) {
      throw new Error( true ? formatProdErrorMessage(3) : 0);
    }
    return currentState;
  }
  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error( true ? formatProdErrorMessage(4) : 0);
    }
    if (isDispatching) {
      throw new Error( true ? formatProdErrorMessage(5) : 0);
    }
    let isSubscribed = true;
    ensureCanMutateNextListeners();
    const listenerId = listenerIdCounter++;
    nextListeners.set(listenerId, listener);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }
      if (isDispatching) {
        throw new Error( true ? formatProdErrorMessage(6) : 0);
      }
      isSubscribed = false;
      ensureCanMutateNextListeners();
      nextListeners.delete(listenerId);
      currentListeners = null;
    };
  }
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error( true ? formatProdErrorMessage(7) : 0);
    }
    if (typeof action.type === "undefined") {
      throw new Error( true ? formatProdErrorMessage(8) : 0);
    }
    if (typeof action.type !== "string") {
      throw new Error( true ? formatProdErrorMessage(17) : 0);
    }
    if (isDispatching) {
      throw new Error( true ? formatProdErrorMessage(9) : 0);
    }
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }
    const listeners = currentListeners = nextListeners;
    listeners.forEach((listener) => {
      listener();
    });
    return action;
  }
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== "function") {
      throw new Error( true ? formatProdErrorMessage(10) : 0);
    }
    currentReducer = nextReducer;
    dispatch({
      type: actionTypes_default.REPLACE
    });
  }
  function observable() {
    const outerSubscribe = subscribe;
    return {
      subscribe(observer) {
        if (typeof observer !== "object" || observer === null) {
          throw new Error( true ? formatProdErrorMessage(11) : 0);
        }
        function observeState() {
          const observerAsObserver = observer;
          if (observerAsObserver.next) {
            observerAsObserver.next(getState());
          }
        }
        observeState();
        const unsubscribe = outerSubscribe(observeState);
        return {
          unsubscribe
        };
      },
      [symbol_observable_default]() {
        return this;
      }
    };
  }
  dispatch({
    type: actionTypes_default.INIT
  });
  const store = {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [symbol_observable_default]: observable
  };
  return store;
}
function legacy_createStore(reducer, preloadedState, enhancer) {
  return createStore(reducer, preloadedState, enhancer);
}
function warning(message) {
  if (typeof console !== "undefined" && typeof console.error === "function") {
    console.error(message);
  }
  try {
    throw new Error(message);
  } catch (e) {
  }
}
function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  const reducerKeys = Object.keys(reducers);
  const argumentName = action && action.type === actionTypes_default.INIT ? "preloadedState argument passed to createStore" : "previous state received by the reducer";
  if (reducerKeys.length === 0) {
    return "Store does not have a valid reducer. Make sure the argument passed to combineReducers is an object whose values are reducers.";
  }
  if (!isPlainObject(inputState)) {
    return `The ${argumentName} has unexpected type of "${kindOf(inputState)}". Expected argument to be an object with the following keys: "${reducerKeys.join('", "')}"`;
  }
  const unexpectedKeys = Object.keys(inputState).filter((key) => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]);
  unexpectedKeys.forEach((key) => {
    unexpectedKeyCache[key] = true;
  });
  if (action && action.type === actionTypes_default.REPLACE)
    return;
  if (unexpectedKeys.length > 0) {
    return `Unexpected ${unexpectedKeys.length > 1 ? "keys" : "key"} "${unexpectedKeys.join('", "')}" found in ${argumentName}. Expected to find one of the known reducer keys instead: "${reducerKeys.join('", "')}". Unexpected keys will be ignored.`;
  }
}
function assertReducerShape(reducers) {
  Object.keys(reducers).forEach((key) => {
    const reducer = reducers[key];
    const initialState = reducer(void 0, {
      type: actionTypes_default.INIT
    });
    if (typeof initialState === "undefined") {
      throw new Error( true ? formatProdErrorMessage(12) : 0);
    }
    if (typeof reducer(void 0, {
      type: actionTypes_default.PROBE_UNKNOWN_ACTION()
    }) === "undefined") {
      throw new Error( true ? formatProdErrorMessage(13) : 0);
    }
  });
}
function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    if (false) {}
    if (typeof reducers[key] === "function") {
      finalReducers[key] = reducers[key];
    }
  }
  const finalReducerKeys = Object.keys(finalReducers);
  let unexpectedKeyCache;
  if (false) {}
  let shapeAssertionError;
  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }
  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError;
    }
    if (false) {}
    let hasChanged = false;
    const nextState = {};
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === "undefined") {
        const actionType = action && action.type;
        throw new Error( true ? formatProdErrorMessage(14) : 0);
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  };
}
function bindActionCreator(actionCreator, dispatch) {
  return function(...args) {
    return dispatch(actionCreator.apply(this, args));
  };
}
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === "function") {
    return bindActionCreator(actionCreators, dispatch);
  }
  if (typeof actionCreators !== "object" || actionCreators === null) {
    throw new Error( true ? formatProdErrorMessage(16) : 0);
  }
  const boundActionCreators = {};
  for (const key in actionCreators) {
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === "function") {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}
function compose(...funcs) {
  if (funcs.length === 0) {
    return (arg) => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
function applyMiddleware(...middlewares) {
  return (createStore2) => (reducer, preloadedState) => {
    const store = createStore2(reducer, preloadedState);
    let dispatch = () => {
      throw new Error( true ? formatProdErrorMessage(15) : 0);
    };
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args)
    };
    const chain = middlewares.map((middleware) => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);
    return {
      ...store,
      dispatch
    };
  };
}
function isAction(action) {
  return isPlainObject(action) && "type" in action && typeof action.type === "string";
}
var equivalent_key_map = __webpack_require__(3249);
var equivalent_key_map_default = __webpack_require__.n(equivalent_key_map);
;
const external_wp_reduxRoutine_namespaceObject = window["wp"]["reduxRoutine"];
var external_wp_reduxRoutine_default = __webpack_require__.n(external_wp_reduxRoutine_namespaceObject);
;
const external_wp_compose_namespaceObject = window["wp"]["compose"];
;
function combine_reducers_combineReducers(reducers) {
  const keys = Object.keys(reducers);
  return function combinedReducer(state = {}, action) {
    const nextState = {};
    let hasChanged = false;
    for (const key of keys) {
      const reducer = reducers[key];
      const prevStateForKey = state[key];
      const nextStateForKey = reducer(prevStateForKey, action);
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== prevStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
;
function createRegistrySelector(registrySelector) {
  const selectorsByRegistry = new WeakMap();
  const wrappedSelector = (...args) => {
    let selector = selectorsByRegistry.get(wrappedSelector.registry);
    if (!selector) {
      selector = registrySelector(wrappedSelector.registry.select);
      selectorsByRegistry.set(wrappedSelector.registry, selector);
    }
    return selector(...args);
  };
  wrappedSelector.isRegistrySelector = true;
  return wrappedSelector;
}
function createRegistryControl(registryControl) {
  registryControl.isRegistryControl = true;
  return registryControl;
}
;
const SELECT = '@@data/SELECT';
const RESOLVE_SELECT = '@@data/RESOLVE_SELECT';
const DISPATCH = '@@data/DISPATCH';
function isObject(object) {
  return object !== null && typeof object === 'object';
}
function controls_select(storeNameOrDescriptor, selectorName, ...args) {
  return {
    type: SELECT,
    storeKey: isObject(storeNameOrDescriptor) ? storeNameOrDescriptor.name : storeNameOrDescriptor,
    selectorName,
    args
  };
}
function resolveSelect(storeNameOrDescriptor, selectorName, ...args) {
  return {
    type: RESOLVE_SELECT,
    storeKey: isObject(storeNameOrDescriptor) ? storeNameOrDescriptor.name : storeNameOrDescriptor,
    selectorName,
    args
  };
}
function dispatch(storeNameOrDescriptor, actionName, ...args) {
  return {
    type: DISPATCH,
    storeKey: isObject(storeNameOrDescriptor) ? storeNameOrDescriptor.name : storeNameOrDescriptor,
    actionName,
    args
  };
}
const controls = {
  select: controls_select,
  resolveSelect,
  dispatch
};
const builtinControls = {
  [SELECT]: createRegistryControl(registry => ({
    storeKey,
    selectorName,
    args
  }) => registry.select(storeKey)[selectorName](...args)),
  [RESOLVE_SELECT]: createRegistryControl(registry => ({
    storeKey,
    selectorName,
    args
  }) => {
    const method = registry.select(storeKey)[selectorName].hasResolver ? 'resolveSelect' : 'select';
    return registry[method](storeKey)[selectorName](...args);
  }),
  [DISPATCH]: createRegistryControl(registry => ({
    storeKey,
    actionName,
    args
  }) => registry.dispatch(storeKey)[actionName](...args))
};
;
const external_wp_privateApis_namespaceObject = window["wp"]["privateApis"];
;
const {
  lock,
  unlock
} = (0,external_wp_privateApis_namespaceObject.__dangerousOptInToUnstableAPIsOnlyForCoreModules)('I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.', '@wordpress/data');
;
function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}
;
const promiseMiddleware = () => next => action => {
  if (isPromise(action)) {
    return action.then(resolvedAction => {
      if (resolvedAction) {
        return next(resolvedAction);
      }
    });
  }
  return next(action);
};
 const promise_middleware = (promiseMiddleware);
;
const createResolversCacheMiddleware = (registry, storeName) => () => next => action => {
  const resolvers = registry.select(storeName).getCachedResolvers();
  const resolverEntries = Object.entries(resolvers);
  resolverEntries.forEach(([selectorName, resolversByArgs]) => {
    const resolver = registry.stores[storeName]?.resolvers?.[selectorName];
    if (!resolver || !resolver.shouldInvalidate) {
      return;
    }
    resolversByArgs.forEach((value, args) => {
      if (value === undefined) {
        return;
      }
      if (value.status !== 'finished' && value.status !== 'error') {
        return;
      }
      if (!resolver.shouldInvalidate(action, ...args)) {
        return;
      }
      registry.dispatch(storeName).invalidateResolution(selectorName, args);
    });
  });
  return next(action);
};
 const resolvers_cache_middleware = (createResolversCacheMiddleware);
;
function createThunkMiddleware(args) {
  return () => next => action => {
    if (typeof action === 'function') {
      return action(args);
    }
    return next(action);
  };
}
;
const onSubKey = actionProperty => reducer => (state = {}, action) => {
  const key = action[actionProperty];
  if (key === undefined) {
    return state;
  }
  const nextKeyState = reducer(state[key], action);
  if (nextKeyState === state[key]) {
    return state;
  }
  return {
    ...state,
    [key]: nextKeyState
  };
};
function selectorArgsToStateKey(args) {
  if (args === undefined || args === null) {
    return [];
  }
  const len = args.length;
  let idx = len;
  while (idx > 0 && args[idx - 1] === undefined) {
    idx--;
  }
  return idx === len ? args : args.slice(0, idx);
}
;
const subKeysIsResolved = onSubKey('selectorName')((state = new (equivalent_key_map_default())(), action) => {
  switch (action.type) {
    case 'START_RESOLUTION':
      {
        const nextState = new (equivalent_key_map_default())(state);
        nextState.set(selectorArgsToStateKey(action.args), {
          status: 'resolving'
        });
        return nextState;
      }
    case 'FINISH_RESOLUTION':
      {
        const nextState = new (equivalent_key_map_default())(state);
        nextState.set(selectorArgsToStateKey(action.args), {
          status: 'finished'
        });
        return nextState;
      }
    case 'FAIL_RESOLUTION':
      {
        const nextState = new (equivalent_key_map_default())(state);
        nextState.set(selectorArgsToStateKey(action.args), {
          status: 'error',
          error: action.error
        });
        return nextState;
      }
    case 'START_RESOLUTIONS':
      {
        const nextState = new (equivalent_key_map_default())(state);
        for (const resolutionArgs of action.args) {
          nextState.set(selectorArgsToStateKey(resolutionArgs), {
            status: 'resolving'
          });
        }
        return nextState;
      }
    case 'FINISH_RESOLUTIONS':
      {
        const nextState = new (equivalent_key_map_default())(state);
        for (const resolutionArgs of action.args) {
          nextState.set(selectorArgsToStateKey(resolutionArgs), {
            status: 'finished'
          });
        }
        return nextState;
      }
    case 'FAIL_RESOLUTIONS':
      {
        const nextState = new (equivalent_key_map_default())(state);
        action.args.forEach((resolutionArgs, idx) => {
          const resolutionState = {
            status: 'error',
            error: undefined
          };
          const error = action.errors[idx];
          if (error) {
            resolutionState.error = error;
          }
          nextState.set(selectorArgsToStateKey(resolutionArgs), resolutionState);
        });
        return nextState;
      }
    case 'INVALIDATE_RESOLUTION':
      {
        const nextState = new (equivalent_key_map_default())(state);
        nextState.delete(selectorArgsToStateKey(action.args));
        return nextState;
      }
  }
  return state;
});
const isResolved = (state = {}, action) => {
  switch (action.type) {
    case 'INVALIDATE_RESOLUTION_FOR_STORE':
      return {};
    case 'INVALIDATE_RESOLUTION_FOR_STORE_SELECTOR':
      {
        if (action.selectorName in state) {
          const {
            [action.selectorName]: removedSelector,
            ...restState
          } = state;
          return restState;
        }
        return state;
      }
    case 'START_RESOLUTION':
    case 'FINISH_RESOLUTION':
    case 'FAIL_RESOLUTION':
    case 'START_RESOLUTIONS':
    case 'FINISH_RESOLUTIONS':
    case 'FAIL_RESOLUTIONS':
    case 'INVALIDATE_RESOLUTION':
      return subKeysIsResolved(state, action);
  }
  return state;
};
 const metadata_reducer = (isResolved);
;
var LEAF_KEY = {};
function arrayOf(value) {
	return [value];
}
function isObjectLike(value) {
	return !!value && 'object' === typeof value;
}
function createCache() {
	var cache = {
		clear: function () {
			cache.head = null;
		},
	};
	return cache;
}
function isShallowEqual(a, b, fromIndex) {
	var i;
	if (a.length !== b.length) {
		return false;
	}
	for (i = fromIndex; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
}
 function rememo(selector, getDependants) {
	var rootCache;
	var normalizedGetDependants = getDependants ? getDependants : arrayOf;
	function getCache(dependants) {
		var caches = rootCache,
			isUniqueByDependants = true,
			i,
			dependant,
			map,
			cache;
		for (i = 0; i < dependants.length; i++) {
			dependant = dependants[i];
			if (!isObjectLike(dependant)) {
				isUniqueByDependants = false;
				break;
			}
			if (caches.has(dependant)) {
				caches = caches.get(dependant);
			} else {
				map = new WeakMap();
				caches.set(dependant, map);
				caches = map;
			}
		}
		if (!caches.has(LEAF_KEY)) {
			cache = createCache();
			cache.isUniqueByDependants = isUniqueByDependants;
			caches.set(LEAF_KEY, cache);
		}
		return caches.get(LEAF_KEY);
	}
	function clear() {
		rootCache = new WeakMap();
	}
	function callSelector() {
		var len = arguments.length,
			cache,
			node,
			i,
			args,
			dependants;
		args = new Array(len);
		for (i = 0; i < len; i++) {
			args[i] = arguments[i];
		}
		dependants = normalizedGetDependants.apply(null, args);
		cache = getCache(dependants);
		if (!cache.isUniqueByDependants) {
			if (
				cache.lastDependants &&
				!isShallowEqual(dependants, cache.lastDependants, 0)
			) {
				cache.clear();
			}
			cache.lastDependants = dependants;
		}
		node = cache.head;
		while (node) {
			if (!isShallowEqual(node.args, args, 1)) {
				node = node.next;
				continue;
			}
			if (node !== cache.head) {
				 (node.prev).next = node.next;
				if (node.next) {
					node.next.prev = node.prev;
				}
				node.next = cache.head;
				node.prev = null;
				 (cache.head).prev = node;
				cache.head = node;
			}
			return node.val;
		}
		node =  ({
			val: selector.apply(null, args),
		});
		args[0] = null;
		node.args = args;
		if (cache.head) {
			cache.head.prev = node;
			node.next = cache.head;
		}
		cache.head = node;
		return node.val;
	}
	callSelector.getDependants = normalizedGetDependants;
	callSelector.clear = clear;
	clear();
	return  (callSelector);
}
;
function getResolutionState(state, selectorName, args) {
  const map = state[selectorName];
  if (!map) {
    return;
  }
  return map.get(selectorArgsToStateKey(args));
}
function getIsResolving(state, selectorName, args) {
  external_wp_deprecated_default()('wp.data.select( store ).getIsResolving', {
    since: '6.6',
    version: '6.8',
    alternative: 'wp.data.select( store ).getResolutionState'
  });
  const resolutionState = getResolutionState(state, selectorName, args);
  return resolutionState && resolutionState.status === 'resolving';
}
function hasStartedResolution(state, selectorName, args) {
  return getResolutionState(state, selectorName, args) !== undefined;
}
function hasFinishedResolution(state, selectorName, args) {
  const status = getResolutionState(state, selectorName, args)?.status;
  return status === 'finished' || status === 'error';
}
function hasResolutionFailed(state, selectorName, args) {
  return getResolutionState(state, selectorName, args)?.status === 'error';
}
function getResolutionError(state, selectorName, args) {
  const resolutionState = getResolutionState(state, selectorName, args);
  return resolutionState?.status === 'error' ? resolutionState.error : null;
}
function isResolving(state, selectorName, args) {
  return getResolutionState(state, selectorName, args)?.status === 'resolving';
}
function getCachedResolvers(state) {
  return state;
}
function hasResolvingSelectors(state) {
  return Object.values(state).some(selectorState =>
  Array.from(selectorState._map.values()).some(resolution => resolution[1]?.status === 'resolving'));
}
const countSelectorsByStatus = rememo(state => {
  const selectorsByStatus = {};
  Object.values(state).forEach(selectorState =>
  Array.from(selectorState._map.values()).forEach(resolution => {
    var _resolution$1$status;
    const currentStatus = (_resolution$1$status = resolution[1]?.status) !== null && _resolution$1$status !== void 0 ? _resolution$1$status : 'error';
    if (!selectorsByStatus[currentStatus]) {
      selectorsByStatus[currentStatus] = 0;
    }
    selectorsByStatus[currentStatus]++;
  }));
  return selectorsByStatus;
}, state => [state]);
;
function startResolution(selectorName, args) {
  return {
    type: 'START_RESOLUTION',
    selectorName,
    args
  };
}
function finishResolution(selectorName, args) {
  return {
    type: 'FINISH_RESOLUTION',
    selectorName,
    args
  };
}
function failResolution(selectorName, args, error) {
  return {
    type: 'FAIL_RESOLUTION',
    selectorName,
    args,
    error
  };
}
function startResolutions(selectorName, args) {
  return {
    type: 'START_RESOLUTIONS',
    selectorName,
    args
  };
}
function finishResolutions(selectorName, args) {
  return {
    type: 'FINISH_RESOLUTIONS',
    selectorName,
    args
  };
}
function failResolutions(selectorName, args, errors) {
  return {
    type: 'FAIL_RESOLUTIONS',
    selectorName,
    args,
    errors
  };
}
function invalidateResolution(selectorName, args) {
  return {
    type: 'INVALIDATE_RESOLUTION',
    selectorName,
    args
  };
}
function invalidateResolutionForStore() {
  return {
    type: 'INVALIDATE_RESOLUTION_FOR_STORE'
  };
}
function invalidateResolutionForStoreSelector(selectorName) {
  return {
    type: 'INVALIDATE_RESOLUTION_FOR_STORE_SELECTOR',
    selectorName
  };
}
;
const trimUndefinedValues = array => {
  const result = [...array];
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i] === undefined) {
      result.splice(i, 1);
    }
  }
  return result;
};
const mapValues = (obj, callback) => Object.fromEntries(Object.entries(obj !== null && obj !== void 0 ? obj : {}).map(([key, value]) => [key, callback(value, key)]));
const devToolsReplacer = (key, state) => {
  if (state instanceof Map) {
    return Object.fromEntries(state);
  }
  if (state instanceof window.HTMLElement) {
    return null;
  }
  return state;
};
function createResolversCache() {
  const cache = {};
  return {
    isRunning(selectorName, args) {
      return cache[selectorName] && cache[selectorName].get(trimUndefinedValues(args));
    },
    clear(selectorName, args) {
      if (cache[selectorName]) {
        cache[selectorName].delete(trimUndefinedValues(args));
      }
    },
    markAsRunning(selectorName, args) {
      if (!cache[selectorName]) {
        cache[selectorName] = new (equivalent_key_map_default())();
      }
      cache[selectorName].set(trimUndefinedValues(args), true);
    }
  };
}
function createBindingCache(bind) {
  const cache = new WeakMap();
  return {
    get(item, itemName) {
      let boundItem = cache.get(item);
      if (!boundItem) {
        boundItem = bind(item, itemName);
        cache.set(item, boundItem);
      }
      return boundItem;
    }
  };
}
function createReduxStore(key, options) {
  const privateActions = {};
  const privateSelectors = {};
  const privateRegistrationFunctions = {
    privateActions,
    registerPrivateActions: actions => {
      Object.assign(privateActions, actions);
    },
    privateSelectors,
    registerPrivateSelectors: selectors => {
      Object.assign(privateSelectors, selectors);
    }
  };
  const storeDescriptor = {
    name: key,
    instantiate: registry => {
      const listeners = new Set();
      const reducer = options.reducer;
      const thunkArgs = {
        registry,
        get dispatch() {
          return thunkActions;
        },
        get select() {
          return thunkSelectors;
        },
        get resolveSelect() {
          return getResolveSelectors();
        }
      };
      const store = instantiateReduxStore(key, options, registry, thunkArgs);
      lock(store, privateRegistrationFunctions);
      const resolversCache = createResolversCache();
      function bindAction(action) {
        return (...args) => Promise.resolve(store.dispatch(action(...args)));
      }
      const actions = {
        ...mapValues(actions_namespaceObject, bindAction),
        ...mapValues(options.actions, bindAction)
      };
      const boundPrivateActions = createBindingCache(bindAction);
      const allActions = new Proxy(() => {}, {
        get: (target, prop) => {
          const privateAction = privateActions[prop];
          return privateAction ? boundPrivateActions.get(privateAction, prop) : actions[prop];
        }
      });
      const thunkActions = new Proxy(allActions, {
        apply: (target, thisArg, [action]) => store.dispatch(action)
      });
      lock(actions, allActions);
      const resolvers = options.resolvers ? mapResolvers(options.resolvers) : {};
      function bindSelector(selector, selectorName) {
        if (selector.isRegistrySelector) {
          selector.registry = registry;
        }
        const boundSelector = (...args) => {
          args = normalize(selector, args);
          const state = store.__unstableOriginalGetState();
          if (selector.isRegistrySelector) {
            selector.registry = registry;
          }
          return selector(state.root, ...args);
        };
        boundSelector.__unstableNormalizeArgs = selector.__unstableNormalizeArgs;
        const resolver = resolvers[selectorName];
        if (!resolver) {
          boundSelector.hasResolver = false;
          return boundSelector;
        }
        return mapSelectorWithResolver(boundSelector, selectorName, resolver, store, resolversCache);
      }
      function bindMetadataSelector(metaDataSelector) {
        const boundSelector = (...args) => {
          const state = store.__unstableOriginalGetState();
          const originalSelectorName = args && args[0];
          const originalSelectorArgs = args && args[1];
          const targetSelector = options?.selectors?.[originalSelectorName];
          if (originalSelectorName && targetSelector) {
            args[1] = normalize(targetSelector, originalSelectorArgs);
          }
          return metaDataSelector(state.metadata, ...args);
        };
        boundSelector.hasResolver = false;
        return boundSelector;
      }
      const selectors = {
        ...mapValues(selectors_namespaceObject, bindMetadataSelector),
        ...mapValues(options.selectors, bindSelector)
      };
      const boundPrivateSelectors = createBindingCache(bindSelector);
      for (const [selectorName, selector] of Object.entries(privateSelectors)) {
        boundPrivateSelectors.get(selector, selectorName);
      }
      const allSelectors = new Proxy(() => {}, {
        get: (target, prop) => {
          const privateSelector = privateSelectors[prop];
          return privateSelector ? boundPrivateSelectors.get(privateSelector, prop) : selectors[prop];
        }
      });
      const thunkSelectors = new Proxy(allSelectors, {
        apply: (target, thisArg, [selector]) => selector(store.__unstableOriginalGetState())
      });
      lock(selectors, allSelectors);
      const resolveSelectors = mapResolveSelectors(selectors, store);
      const suspendSelectors = mapSuspendSelectors(selectors, store);
      const getSelectors = () => selectors;
      const getActions = () => actions;
      const getResolveSelectors = () => resolveSelectors;
      const getSuspendSelectors = () => suspendSelectors;
      store.__unstableOriginalGetState = store.getState;
      store.getState = () => store.__unstableOriginalGetState().root;
      const subscribe = store && (listener => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      });
      let lastState = store.__unstableOriginalGetState();
      store.subscribe(() => {
        const state = store.__unstableOriginalGetState();
        const hasChanged = state !== lastState;
        lastState = state;
        if (hasChanged) {
          for (const listener of listeners) {
            listener();
          }
        }
      });
      return {
        reducer,
        store,
        actions,
        selectors,
        resolvers,
        getSelectors,
        getResolveSelectors,
        getSuspendSelectors,
        getActions,
        subscribe
      };
    }
  };
  lock(storeDescriptor, privateRegistrationFunctions);
  return storeDescriptor;
}
function instantiateReduxStore(key, options, registry, thunkArgs) {
  const controls = {
    ...options.controls,
    ...builtinControls
  };
  const normalizedControls = mapValues(controls, control => control.isRegistryControl ? control(registry) : control);
  const middlewares = [resolvers_cache_middleware(registry, key), promise_middleware, external_wp_reduxRoutine_default()(normalizedControls), createThunkMiddleware(thunkArgs)];
  const enhancers = [applyMiddleware(...middlewares)];
  if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__({
      name: key,
      instanceId: key,
      serialize: {
        replacer: devToolsReplacer
      }
    }));
  }
  const {
    reducer,
    initialState
  } = options;
  const enhancedReducer = combine_reducers_combineReducers({
    metadata: metadata_reducer,
    root: reducer
  });
  return createStore(enhancedReducer, {
    root: initialState
  }, (0,external_wp_compose_namespaceObject.compose)(enhancers));
}
function mapResolveSelectors(selectors, store) {
  const {
    getIsResolving,
    hasStartedResolution,
    hasFinishedResolution,
    hasResolutionFailed,
    isResolving,
    getCachedResolvers,
    getResolutionState,
    getResolutionError,
    hasResolvingSelectors,
    countSelectorsByStatus,
    ...storeSelectors
  } = selectors;
  return mapValues(storeSelectors, (selector, selectorName) => {
    if (!selector.hasResolver) {
      return async (...args) => selector.apply(null, args);
    }
    return (...args) => {
      return new Promise((resolve, reject) => {
        const hasFinished = () => selectors.hasFinishedResolution(selectorName, args);
        const finalize = result => {
          const hasFailed = selectors.hasResolutionFailed(selectorName, args);
          if (hasFailed) {
            const error = selectors.getResolutionError(selectorName, args);
            reject(error);
          } else {
            resolve(result);
          }
        };
        const getResult = () => selector.apply(null, args);
        const result = getResult();
        if (hasFinished()) {
          return finalize(result);
        }
        const unsubscribe = store.subscribe(() => {
          if (hasFinished()) {
            unsubscribe();
            finalize(getResult());
          }
        });
      });
    };
  });
}
function mapSuspendSelectors(selectors, store) {
  return mapValues(selectors, (selector, selectorName) => {
    if (!selector.hasResolver) {
      return selector;
    }
    return (...args) => {
      const result = selector.apply(null, args);
      if (selectors.hasFinishedResolution(selectorName, args)) {
        if (selectors.hasResolutionFailed(selectorName, args)) {
          throw selectors.getResolutionError(selectorName, args);
        }
        return result;
      }
      throw new Promise(resolve => {
        const unsubscribe = store.subscribe(() => {
          if (selectors.hasFinishedResolution(selectorName, args)) {
            resolve();
            unsubscribe();
          }
        });
      });
    };
  });
}
function mapResolvers(resolvers) {
  return mapValues(resolvers, resolver => {
    if (resolver.fulfill) {
      return resolver;
    }
    return {
      ...resolver,
      fulfill: resolver 
    };
  });
}
function mapSelectorWithResolver(selector, selectorName, resolver, store, resolversCache) {
  function fulfillSelector(args) {
    const state = store.getState();
    if (resolversCache.isRunning(selectorName, args) || typeof resolver.isFulfilled === 'function' && resolver.isFulfilled(state, ...args)) {
      return;
    }
    const {
      metadata
    } = store.__unstableOriginalGetState();
    if (hasStartedResolution(metadata, selectorName, args)) {
      return;
    }
    resolversCache.markAsRunning(selectorName, args);
    setTimeout(async () => {
      resolversCache.clear(selectorName, args);
      store.dispatch(startResolution(selectorName, args));
      try {
        const action = resolver.fulfill(...args);
        if (action) {
          await store.dispatch(action);
        }
        store.dispatch(finishResolution(selectorName, args));
      } catch (error) {
        store.dispatch(failResolution(selectorName, args, error));
      }
    }, 0);
  }
  const selectorResolver = (...args) => {
    args = normalize(selector, args);
    fulfillSelector(args);
    return selector(...args);
  };
  selectorResolver.hasResolver = true;
  return selectorResolver;
}
function normalize(selector, args) {
  if (selector.__unstableNormalizeArgs && typeof selector.__unstableNormalizeArgs === 'function' && args?.length) {
    return selector.__unstableNormalizeArgs(args);
  }
  return args;
}
;
const coreDataStore = {
  name: 'core/data',
  instantiate(registry) {
    const getCoreDataSelector = selectorName => (key, ...args) => {
      return registry.select(key)[selectorName](...args);
    };
    const getCoreDataAction = actionName => (key, ...args) => {
      return registry.dispatch(key)[actionName](...args);
    };
    return {
      getSelectors() {
        return Object.fromEntries(['getIsResolving', 'hasStartedResolution', 'hasFinishedResolution', 'isResolving', 'getCachedResolvers'].map(selectorName => [selectorName, getCoreDataSelector(selectorName)]));
      },
      getActions() {
        return Object.fromEntries(['startResolution', 'finishResolution', 'invalidateResolution', 'invalidateResolutionForStore', 'invalidateResolutionForStoreSelector'].map(actionName => [actionName, getCoreDataAction(actionName)]));
      },
      subscribe() {
        return () => () => {};
      }
    };
  }
};
 const store = (coreDataStore);
;
function createEmitter() {
  let isPaused = false;
  let isPending = false;
  const listeners = new Set();
  const notifyListeners = () =>
  Array.from(listeners).forEach(listener => listener());
  return {
    get isPaused() {
      return isPaused;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    pause() {
      isPaused = true;
    },
    resume() {
      isPaused = false;
      if (isPending) {
        isPending = false;
        notifyListeners();
      }
    },
    emit() {
      if (isPaused) {
        isPending = true;
        return;
      }
      notifyListeners();
    }
  };
}
;
function getStoreName(storeNameOrDescriptor) {
  return typeof storeNameOrDescriptor === 'string' ? storeNameOrDescriptor : storeNameOrDescriptor.name;
}
function createRegistry(storeConfigs = {}, parent = null) {
  const stores = {};
  const emitter = createEmitter();
  let listeningStores = null;
  function globalListener() {
    emitter.emit();
  }
  const subscribe = (listener, storeNameOrDescriptor) => {
    if (!storeNameOrDescriptor) {
      return emitter.subscribe(listener);
    }
    const storeName = getStoreName(storeNameOrDescriptor);
    const store = stores[storeName];
    if (store) {
      return store.subscribe(listener);
    }
    if (!parent) {
      return emitter.subscribe(listener);
    }
    return parent.subscribe(listener, storeNameOrDescriptor);
  };
  function select(storeNameOrDescriptor) {
    const storeName = getStoreName(storeNameOrDescriptor);
    listeningStores?.add(storeName);
    const store = stores[storeName];
    if (store) {
      return store.getSelectors();
    }
    return parent?.select(storeName);
  }
  function __unstableMarkListeningStores(callback, ref) {
    listeningStores = new Set();
    try {
      return callback.call(this);
    } finally {
      ref.current = Array.from(listeningStores);
      listeningStores = null;
    }
  }
  function resolveSelect(storeNameOrDescriptor) {
    const storeName = getStoreName(storeNameOrDescriptor);
    listeningStores?.add(storeName);
    const store = stores[storeName];
    if (store) {
      return store.getResolveSelectors();
    }
    return parent && parent.resolveSelect(storeName);
  }
  function suspendSelect(storeNameOrDescriptor) {
    const storeName = getStoreName(storeNameOrDescriptor);
    listeningStores?.add(storeName);
    const store = stores[storeName];
    if (store) {
      return store.getSuspendSelectors();
    }
    return parent && parent.suspendSelect(storeName);
  }
  function dispatch(storeNameOrDescriptor) {
    const storeName = getStoreName(storeNameOrDescriptor);
    const store = stores[storeName];
    if (store) {
      return store.getActions();
    }
    return parent && parent.dispatch(storeName);
  }
  function withPlugins(attributes) {
    return Object.fromEntries(Object.entries(attributes).map(([key, attribute]) => {
      if (typeof attribute !== 'function') {
        return [key, attribute];
      }
      return [key, function () {
        return registry[key].apply(null, arguments);
      }];
    }));
  }
  function registerStoreInstance(name, createStore) {
    if (stores[name]) {
      console.error('Store "' + name + '" is already registered.');
      return stores[name];
    }
    const store = createStore();
    if (typeof store.getSelectors !== 'function') {
      throw new TypeError('store.getSelectors must be a function');
    }
    if (typeof store.getActions !== 'function') {
      throw new TypeError('store.getActions must be a function');
    }
    if (typeof store.subscribe !== 'function') {
      throw new TypeError('store.subscribe must be a function');
    }
    store.emitter = createEmitter();
    const currentSubscribe = store.subscribe;
    store.subscribe = listener => {
      const unsubscribeFromEmitter = store.emitter.subscribe(listener);
      const unsubscribeFromStore = currentSubscribe(() => {
        if (store.emitter.isPaused) {
          store.emitter.emit();
          return;
        }
        listener();
      });
      return () => {
        unsubscribeFromStore?.();
        unsubscribeFromEmitter?.();
      };
    };
    stores[name] = store;
    store.subscribe(globalListener);
    if (parent) {
      try {
        unlock(store.store).registerPrivateActions(unlock(parent).privateActionsOf(name));
        unlock(store.store).registerPrivateSelectors(unlock(parent).privateSelectorsOf(name));
      } catch (e) {
      }
    }
    return store;
  }
  function register(store) {
    registerStoreInstance(store.name, () => store.instantiate(registry));
  }
  function registerGenericStore(name, store) {
    external_wp_deprecated_default()('wp.data.registerGenericStore', {
      since: '5.9',
      alternative: 'wp.data.register( storeDescriptor )'
    });
    registerStoreInstance(name, () => store);
  }
  function registerStore(storeName, options) {
    if (!options.reducer) {
      throw new TypeError('Must specify store reducer');
    }
    const store = registerStoreInstance(storeName, () => createReduxStore(storeName, options).instantiate(registry));
    return store.store;
  }
  function batch(callback) {
    if (emitter.isPaused) {
      callback();
      return;
    }
    emitter.pause();
    Object.values(stores).forEach(store => store.emitter.pause());
    try {
      callback();
    } finally {
      emitter.resume();
      Object.values(stores).forEach(store => store.emitter.resume());
    }
  }
  let registry = {
    batch,
    stores,
    namespaces: stores,
    subscribe,
    select,
    resolveSelect,
    suspendSelect,
    dispatch,
    use,
    register,
    registerGenericStore,
    registerStore,
    __unstableMarkListeningStores
  };
  function use(plugin, options) {
    if (!plugin) {
      return;
    }
    registry = {
      ...registry,
      ...plugin(registry, options)
    };
    return registry;
  }
  registry.register(store);
  for (const [name, config] of Object.entries(storeConfigs)) {
    registry.register(createReduxStore(name, config));
  }
  if (parent) {
    parent.subscribe(globalListener);
  }
  const registryWithPlugins = withPlugins(registry);
  lock(registryWithPlugins, {
    privateActionsOf: name => {
      try {
        return unlock(stores[name].store).privateActions;
      } catch (e) {
        return {};
      }
    },
    privateSelectorsOf: name => {
      try {
        return unlock(stores[name].store).privateSelectors;
      } catch (e) {
        return {};
      }
    }
  });
  return registryWithPlugins;
}
;
 const default_registry = (createRegistry());
;
function is_plain_object_isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}
function is_plain_object_isPlainObject(o) {
  var ctor,prot;
  if (is_plain_object_isObject(o) === false) return false;
  ctor = o.constructor;
  if (ctor === undefined) return true;
  prot = ctor.prototype;
  if (is_plain_object_isObject(prot) === false) return false;
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }
  return true;
}
var cjs = __webpack_require__(66);
var cjs_default = __webpack_require__.n(cjs);
;
let objectStorage;
const storage = {
  getItem(key) {
    if (!objectStorage || !objectStorage[key]) {
      return null;
    }
    return objectStorage[key];
  },
  setItem(key, value) {
    if (!objectStorage) {
      storage.clear();
    }
    objectStorage[key] = String(value);
  },
  clear() {
    objectStorage = Object.create(null);
  }
};
 const object = (storage);
;
let default_storage;
try {
  default_storage = window.localStorage;
  default_storage.setItem('__wpDataTestLocalStorage', '');
  default_storage.removeItem('__wpDataTestLocalStorage');
} catch (error) {
  default_storage = object;
}
 const storage_default = (default_storage);
;
const DEFAULT_STORAGE = storage_default;
const DEFAULT_STORAGE_KEY = 'WP_DATA';
const withLazySameState = reducer => (state, action) => {
  if (action.nextState === state) {
    return state;
  }
  return reducer(state, action);
};
function createPersistenceInterface(options) {
  const {
    storage = DEFAULT_STORAGE,
    storageKey = DEFAULT_STORAGE_KEY
  } = options;
  let data;
  function getData() {
    if (data === undefined) {
      const persisted = storage.getItem(storageKey);
      if (persisted === null) {
        data = {};
      } else {
        try {
          data = JSON.parse(persisted);
        } catch (error) {
          data = {};
        }
      }
    }
    return data;
  }
  function setData(key, value) {
    data = {
      ...data,
      [key]: value
    };
    storage.setItem(storageKey, JSON.stringify(data));
  }
  return {
    get: getData,
    set: setData
  };
}
function persistencePlugin(registry, pluginOptions) {
  const persistence = createPersistenceInterface(pluginOptions);
  function createPersistOnChange(getState, storeName, keys) {
    let getPersistedState;
    if (Array.isArray(keys)) {
      const reducers = keys.reduce((accumulator, key) => Object.assign(accumulator, {
        [key]: (state, action) => action.nextState[key]
      }), {});
      getPersistedState = withLazySameState(build_module_combineReducers(reducers));
    } else {
      getPersistedState = (state, action) => action.nextState;
    }
    let lastState = getPersistedState(undefined, {
      nextState: getState()
    });
    return () => {
      const state = getPersistedState(lastState, {
        nextState: getState()
      });
      if (state !== lastState) {
        persistence.set(storeName, state);
        lastState = state;
      }
    };
  }
  return {
    registerStore(storeName, options) {
      if (!options.persist) {
        return registry.registerStore(storeName, options);
      }
      const persistedState = persistence.get()[storeName];
      if (persistedState !== undefined) {
        let initialState = options.reducer(options.initialState, {
          type: '@@WP/PERSISTENCE_RESTORE'
        });
        if (is_plain_object_isPlainObject(initialState) && is_plain_object_isPlainObject(persistedState)) {
          initialState = cjs_default()(initialState, persistedState, {
            isMergeableObject: is_plain_object_isPlainObject
          });
        } else {
          initialState = persistedState;
        }
        options = {
          ...options,
          initialState
        };
      }
      const store = registry.registerStore(storeName, options);
      store.subscribe(createPersistOnChange(store.getState, storeName, options.persist));
      return store;
    }
  };
}
persistencePlugin.__unstableMigrate = () => {};
 const persistence = (persistencePlugin);
;
;
const external_wp_priorityQueue_namespaceObject = window["wp"]["priorityQueue"];
;
const external_wp_element_namespaceObject = window["wp"]["element"];
;
const external_wp_isShallowEqual_namespaceObject = window["wp"]["isShallowEqual"];
var external_wp_isShallowEqual_default = __webpack_require__.n(external_wp_isShallowEqual_namespaceObject);
;
const Context = (0,external_wp_element_namespaceObject.createContext)(default_registry);
const {
  Consumer,
  Provider
} = Context;
const RegistryConsumer = Consumer;
 const context = (Provider);
;
function useRegistry() {
  return (0,external_wp_element_namespaceObject.useContext)(Context);
}
;
const context_Context = (0,external_wp_element_namespaceObject.createContext)(false);
const {
  Consumer: context_Consumer,
  Provider: context_Provider
} = context_Context;
const AsyncModeConsumer = ( null && (context_Consumer));
 const async_mode_provider_context = (context_Provider);
;
function useAsyncMode() {
  return (0,external_wp_element_namespaceObject.useContext)(context_Context);
}
;
const renderQueue = (0,external_wp_priorityQueue_namespaceObject.createQueue)();
function warnOnUnstableReference(a, b) {
  if (!a || !b) {
    return;
  }
  const keys = typeof a === 'object' && typeof b === 'object' ? Object.keys(a).filter(k => a[k] !== b[k]) : [];
  console.warn('The `useSelect` hook returns different values when called with the same state and parameters.\n' + 'This can lead to unnecessary re-renders and performance issues if not fixed.\n\n' + 'Non-equal value keys: %s\n\n', keys.join(', '));
}
function Store(registry, suspense) {
  const select = suspense ? registry.suspendSelect : registry.select;
  const queueContext = {};
  let lastMapSelect;
  let lastMapResult;
  let lastMapResultValid = false;
  let lastIsAsync;
  let subscriber;
  let didWarnUnstableReference;
  const storeStatesOnMount = new Map();
  function getStoreState(name) {
    var _registry$stores$name;
    return (_registry$stores$name = registry.stores[name]?.store?.getState?.()) !== null && _registry$stores$name !== void 0 ? _registry$stores$name : {};
  }
  const createSubscriber = stores => {
    const activeStores = [...stores];
    const activeSubscriptions = new Set();
    function subscribe(listener) {
      if (lastMapResultValid) {
        for (const name of activeStores) {
          if (storeStatesOnMount.get(name) !== getStoreState(name)) {
            lastMapResultValid = false;
          }
        }
      }
      storeStatesOnMount.clear();
      const onStoreChange = () => {
        lastMapResultValid = false;
        listener();
      };
      const onChange = () => {
        if (lastIsAsync) {
          renderQueue.add(queueContext, onStoreChange);
        } else {
          onStoreChange();
        }
      };
      const unsubs = [];
      function subscribeStore(storeName) {
        unsubs.push(registry.subscribe(onChange, storeName));
      }
      for (const storeName of activeStores) {
        subscribeStore(storeName);
      }
      activeSubscriptions.add(subscribeStore);
      return () => {
        activeSubscriptions.delete(subscribeStore);
        for (const unsub of unsubs.values()) {
          unsub?.();
        }
        renderQueue.cancel(queueContext);
      };
    }
    function updateStores(newStores) {
      for (const newStore of newStores) {
        if (activeStores.includes(newStore)) {
          continue;
        }
        activeStores.push(newStore);
        for (const subscription of activeSubscriptions) {
          subscription(newStore);
        }
      }
    }
    return {
      subscribe,
      updateStores
    };
  };
  return (mapSelect, isAsync) => {
    function updateValue() {
      if (lastMapResultValid && mapSelect === lastMapSelect) {
        return lastMapResult;
      }
      const listeningStores = {
        current: null
      };
      const mapResult = registry.__unstableMarkListeningStores(() => mapSelect(select, registry), listeningStores);
      if (true) {
        if (!didWarnUnstableReference) {
          const secondMapResult = mapSelect(select, registry);
          if (!external_wp_isShallowEqual_default()(mapResult, secondMapResult)) {
            warnOnUnstableReference(mapResult, secondMapResult);
            didWarnUnstableReference = true;
          }
        }
      }
      if (!subscriber) {
        for (const name of listeningStores.current) {
          storeStatesOnMount.set(name, getStoreState(name));
        }
        subscriber = createSubscriber(listeningStores.current);
      } else {
        subscriber.updateStores(listeningStores.current);
      }
      if (!external_wp_isShallowEqual_default()(lastMapResult, mapResult)) {
        lastMapResult = mapResult;
      }
      lastMapSelect = mapSelect;
      lastMapResultValid = true;
    }
    function getValue() {
      updateValue();
      return lastMapResult;
    }
    if (lastIsAsync && !isAsync) {
      lastMapResultValid = false;
      renderQueue.cancel(queueContext);
    }
    updateValue();
    lastIsAsync = isAsync;
    return {
      subscribe: subscriber.subscribe,
      getValue
    };
  };
}
function _useStaticSelect(storeName) {
  return useRegistry().select(storeName);
}
function _useMappingSelect(suspense, mapSelect, deps) {
  const registry = useRegistry();
  const isAsync = useAsyncMode();
  const store = (0,external_wp_element_namespaceObject.useMemo)(() => Store(registry, suspense), [registry, suspense]);
  const selector = (0,external_wp_element_namespaceObject.useCallback)(mapSelect, deps);
  const {
    subscribe,
    getValue
  } = store(selector, isAsync);
  const result = (0,external_wp_element_namespaceObject.useSyncExternalStore)(subscribe, getValue, getValue);
  (0,external_wp_element_namespaceObject.useDebugValue)(result);
  return result;
}
function useSelect(mapSelect, deps) {
  const staticSelectMode = typeof mapSelect !== 'function';
  const staticSelectModeRef = (0,external_wp_element_namespaceObject.useRef)(staticSelectMode);
  if (staticSelectMode !== staticSelectModeRef.current) {
    const prevMode = staticSelectModeRef.current ? 'static' : 'mapping';
    const nextMode = staticSelectMode ? 'static' : 'mapping';
    throw new Error(`Switching useSelect from ${prevMode} to ${nextMode} is not allowed`);
  }
  return staticSelectMode ? _useStaticSelect(mapSelect) : _useMappingSelect(false, mapSelect, deps);
}
function useSuspenseSelect(mapSelect, deps) {
  return _useMappingSelect(true, mapSelect, deps);
}
;
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;
const withSelect = mapSelectToProps => (0,external_wp_compose_namespaceObject.createHigherOrderComponent)(WrappedComponent => (0,external_wp_compose_namespaceObject.pure)(ownProps => {
  const mapSelect = (select, registry) => mapSelectToProps(select, ownProps, registry);
  const mergeProps = useSelect(mapSelect);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(WrappedComponent, {
    ...ownProps,
    ...mergeProps
  });
}), 'withSelect');
 const with_select = (withSelect);
;
const useDispatchWithMap = (dispatchMap, deps) => {
  const registry = useRegistry();
  const currentDispatchMapRef = (0,external_wp_element_namespaceObject.useRef)(dispatchMap);
  (0,external_wp_compose_namespaceObject.useIsomorphicLayoutEffect)(() => {
    currentDispatchMapRef.current = dispatchMap;
  });
  return (0,external_wp_element_namespaceObject.useMemo)(() => {
    const currentDispatchProps = currentDispatchMapRef.current(registry.dispatch, registry);
    return Object.fromEntries(Object.entries(currentDispatchProps).map(([propName, dispatcher]) => {
      if (typeof dispatcher !== 'function') {
        console.warn(`Property ${propName} returned from dispatchMap in useDispatchWithMap must be a function.`);
      }
      return [propName, (...args) => currentDispatchMapRef.current(registry.dispatch, registry)[propName](...args)];
    }));
  }, [registry, ...deps]);
};
 const use_dispatch_with_map = (useDispatchWithMap);
;
const withDispatch = mapDispatchToProps => (0,external_wp_compose_namespaceObject.createHigherOrderComponent)(WrappedComponent => ownProps => {
  const mapDispatch = (dispatch, registry) => mapDispatchToProps(dispatch, ownProps, registry);
  const dispatchProps = use_dispatch_with_map(mapDispatch, []);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(WrappedComponent, {
    ...ownProps,
    ...dispatchProps
  });
}, 'withDispatch');
 const with_dispatch = (withDispatch);
;
const withRegistry = (0,external_wp_compose_namespaceObject.createHigherOrderComponent)(OriginalComponent => props => (0,external_ReactJSXRuntime_namespaceObject.jsx)(RegistryConsumer, {
  children: registry => (0,external_ReactJSXRuntime_namespaceObject.jsx)(OriginalComponent, {
    ...props,
    registry: registry
  })
}), 'withRegistry');
 const with_registry = (withRegistry);
;
const useDispatch = storeNameOrDescriptor => {
  const {
    dispatch
  } = useRegistry();
  return storeNameOrDescriptor === void 0 ? dispatch : dispatch(storeNameOrDescriptor);
};
 const use_dispatch = (useDispatch);
;
function dispatch_dispatch(storeNameOrDescriptor) {
  return default_registry.dispatch(storeNameOrDescriptor);
}
;
function select_select(storeNameOrDescriptor) {
  return default_registry.select(storeNameOrDescriptor);
}
;
const build_module_combineReducers = combine_reducers_combineReducers;
const build_module_resolveSelect = default_registry.resolveSelect;
const suspendSelect = default_registry.suspendSelect;
const subscribe = default_registry.subscribe;
const registerGenericStore = default_registry.registerGenericStore;
const registerStore = default_registry.registerStore;
const use = default_registry.use;
const register = default_registry.register;
(window.wp = window.wp || {}).data = __webpack_exports__;
 })()
;