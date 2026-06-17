 (() => { 
 	"use strict";
 	var __webpack_modules__ = ({
 7734:
 ((module) => {
  var envHasBigInt64Array = typeof BigInt64Array !== 'undefined';
module.exports = function equal(a, b) {
  if (a === b) return true;
  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;
    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }
    if ((a instanceof Map) && (b instanceof Map)) {
      if (a.size !== b.size) return false;
      for (i of a.entries())
        if (!b.has(i[0])) return false;
      for (i of a.entries())
        if (!equal(i[1], b.get(i[0]))) return false;
      return true;
    }
    if ((a instanceof Set) && (b instanceof Set)) {
      if (a.size !== b.size) return false;
      for (i of a.entries())
        if (!b.has(i[0])) return false;
      return true;
    }
    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (a[i] !== b[i]) return false;
      return true;
    }
    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;
    for (i = length; i-- !== 0;)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
    for (i = length; i-- !== 0;) {
      var key = keys[i];
      if (!equal(a[key], b[key])) return false;
    }
    return true;
  }
  return a!==a && b!==b;
};
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
var __webpack_exports__ = {};
__webpack_require__.d(__webpack_exports__, {
  "default": () => ( build_module)
});
;
const external_wp_element_namespaceObject = window["wp"]["element"];
;
const external_wp_data_namespaceObject = window["wp"]["data"];
var es6 = __webpack_require__(7734);
var es6_default = __webpack_require__.n(es6);
;
const external_wp_compose_namespaceObject = window["wp"]["compose"];
;
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;
const external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
var external_wp_apiFetch_default = __webpack_require__.n(external_wp_apiFetch_namespaceObject);
;
const external_wp_url_namespaceObject = window["wp"]["url"];
;
const external_wp_components_namespaceObject = window["wp"]["components"];
;
const external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;
const EMPTY_OBJECT = {};
function rendererPath(block, attributes = null, urlQueryArgs = {}) {
  return (0,external_wp_url_namespaceObject.addQueryArgs)(`/wp/v2/block-renderer/${block}`, {
    context: 'edit',
    ...(null !== attributes ? {
      attributes
    } : {}),
    ...urlQueryArgs
  });
}
function removeBlockSupportAttributes(attributes) {
  const {
    backgroundColor,
    borderColor,
    fontFamily,
    fontSize,
    gradient,
    textColor,
    className,
    ...restAttributes
  } = attributes;
  const {
    border,
    color,
    elements,
    spacing,
    typography,
    ...restStyles
  } = attributes?.style || EMPTY_OBJECT;
  return {
    ...restAttributes,
    style: restStyles
  };
}
function DefaultEmptyResponsePlaceholder({
  className
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Placeholder, {
    className: className,
    children: (0,external_wp_i18n_namespaceObject.__)('Block rendered as empty.')
  });
}
function DefaultErrorResponsePlaceholder({
  response,
  className
}) {
  const errorMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
  (0,external_wp_i18n_namespaceObject.__)('Error loading block: %s'), response.errorMsg);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Placeholder, {
    className: className,
    children: errorMessage
  });
}
function DefaultLoadingResponsePlaceholder({
  children,
  showLoader
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    style: {
      position: 'relative'
    },
    children: [showLoader && (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      style: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: '-9px',
        marginLeft: '-9px'
      },
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {})
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      style: {
        opacity: showLoader ? '0.3' : 1
      },
      children: children
    })]
  });
}
function ServerSideRender(props) {
  const {
    attributes,
    block,
    className,
    httpMethod = 'GET',
    urlQueryArgs,
    skipBlockSupportAttributes = false,
    EmptyResponsePlaceholder = DefaultEmptyResponsePlaceholder,
    ErrorResponsePlaceholder = DefaultErrorResponsePlaceholder,
    LoadingResponsePlaceholder = DefaultLoadingResponsePlaceholder
  } = props;
  const isMountedRef = (0,external_wp_element_namespaceObject.useRef)(false);
  const [showLoader, setShowLoader] = (0,external_wp_element_namespaceObject.useState)(false);
  const fetchRequestRef = (0,external_wp_element_namespaceObject.useRef)();
  const [response, setResponse] = (0,external_wp_element_namespaceObject.useState)(null);
  const prevProps = (0,external_wp_compose_namespaceObject.usePrevious)(props);
  const [isLoading, setIsLoading] = (0,external_wp_element_namespaceObject.useState)(false);
  function fetchData() {
    var _sanitizedAttributes, _sanitizedAttributes2;
    if (!isMountedRef.current) {
      return;
    }
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setShowLoader(true);
    }, 1000);
    let sanitizedAttributes = attributes && (0,external_wp_blocks_namespaceObject.__experimentalSanitizeBlockAttributes)(block, attributes);
    if (skipBlockSupportAttributes) {
      sanitizedAttributes = removeBlockSupportAttributes(sanitizedAttributes);
    }
    const isPostRequest = 'POST' === httpMethod;
    const urlAttributes = isPostRequest ? null : (_sanitizedAttributes = sanitizedAttributes) !== null && _sanitizedAttributes !== void 0 ? _sanitizedAttributes : null;
    const path = rendererPath(block, urlAttributes, urlQueryArgs);
    const data = isPostRequest ? {
      attributes: (_sanitizedAttributes2 = sanitizedAttributes) !== null && _sanitizedAttributes2 !== void 0 ? _sanitizedAttributes2 : null
    } : null;
    const fetchRequest = fetchRequestRef.current = external_wp_apiFetch_default()({
      path,
      data,
      method: isPostRequest ? 'POST' : 'GET'
    }).then(fetchResponse => {
      if (isMountedRef.current && fetchRequest === fetchRequestRef.current && fetchResponse) {
        setResponse(fetchResponse.rendered);
      }
    }).catch(error => {
      if (isMountedRef.current && fetchRequest === fetchRequestRef.current) {
        setResponse({
          error: true,
          errorMsg: error.message
        });
      }
    }).finally(() => {
      if (isMountedRef.current && fetchRequest === fetchRequestRef.current) {
        setIsLoading(false);
        setShowLoader(false);
        clearTimeout(timeout);
      }
    });
    return fetchRequest;
  }
  const debouncedFetchData = (0,external_wp_compose_namespaceObject.useDebounce)(fetchData, 500);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (prevProps === undefined) {
      fetchData();
    } else if (!es6_default()(prevProps, props)) {
      debouncedFetchData();
    }
  });
  const hasResponse = !!response;
  const hasEmptyResponse = response === '';
  const hasError = response?.error;
  if (isLoading) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(LoadingResponsePlaceholder, {
      ...props,
      showLoader: showLoader,
      children: hasResponse && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_element_namespaceObject.RawHTML, {
        className: className,
        children: response
      })
    });
  }
  if (hasEmptyResponse || !hasResponse) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(EmptyResponsePlaceholder, {
      ...props
    });
  }
  if (hasError) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(ErrorResponsePlaceholder, {
      response: response,
      ...props
    });
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_element_namespaceObject.RawHTML, {
    className: className,
    children: response
  });
}
;
const build_module_EMPTY_OBJECT = {};
const ExportedServerSideRender = (0,external_wp_data_namespaceObject.withSelect)(select => {
  const coreEditorSelect = select('core/editor');
  if (coreEditorSelect) {
    const currentPostId = coreEditorSelect.getCurrentPostId();
    if (currentPostId && typeof currentPostId === 'number') {
      return {
        currentPostId
      };
    }
  }
  return build_module_EMPTY_OBJECT;
})(({
  urlQueryArgs = build_module_EMPTY_OBJECT,
  currentPostId,
  ...props
}) => {
  const newUrlQueryArgs = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (!currentPostId) {
      return urlQueryArgs;
    }
    return {
      post_id: currentPostId,
      ...urlQueryArgs
    };
  }, [currentPostId, urlQueryArgs]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(ServerSideRender, {
    urlQueryArgs: newUrlQueryArgs,
    ...props
  });
});
 const build_module = (ExportedServerSideRender);
(window.wp = window.wp || {}).serverSideRender = __webpack_exports__["default"];
 })()
;