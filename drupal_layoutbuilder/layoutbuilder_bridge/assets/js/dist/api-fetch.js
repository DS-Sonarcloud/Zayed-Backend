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
  "default": () => ( build_module)
});
;
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;
function createNonceMiddleware(nonce) {
  const middleware = (options, next) => {
    const {
      headers = {}
    } = options;
    for (const headerName in headers) {
      if (headerName.toLowerCase() === 'x-wp-nonce' && headers[headerName] === middleware.nonce) {
        return next(options);
      }
    }
    return next({
      ...options,
      headers: {
        ...headers,
        'X-WP-Nonce': middleware.nonce
      }
    });
  };
  middleware.nonce = nonce;
  return middleware;
}
 const nonce = (createNonceMiddleware);
;
const namespaceAndEndpointMiddleware = (options, next) => {
  let path = options.path;
  let namespaceTrimmed, endpointTrimmed;
  if (typeof options.namespace === 'string' && typeof options.endpoint === 'string') {
    namespaceTrimmed = options.namespace.replace(/^\/|\/$/g, '');
    endpointTrimmed = options.endpoint.replace(/^\//, '');
    if (endpointTrimmed) {
      path = namespaceTrimmed + '/' + endpointTrimmed;
    } else {
      path = namespaceTrimmed;
    }
  }
  delete options.namespace;
  delete options.endpoint;
  return next({
    ...options,
    path
  });
};
 const namespace_endpoint = (namespaceAndEndpointMiddleware);
;
const createRootURLMiddleware = rootURL => (options, next) => {
  return namespace_endpoint(options, optionsWithPath => {
    let url = optionsWithPath.url;
    let path = optionsWithPath.path;
    let apiRoot;
    if (typeof path === 'string') {
      apiRoot = rootURL;
      if (-1 !== rootURL.indexOf('?')) {
        path = path.replace('?', '&');
      }
      path = path.replace(/^\//, '');
      if ('string' === typeof apiRoot && -1 !== apiRoot.indexOf('?')) {
        path = path.replace('?', '&');
      }
      url = apiRoot + path;
    }
    return next({
      ...optionsWithPath,
      url
    });
  });
};
 const root_url = (createRootURLMiddleware);
;
const external_wp_url_namespaceObject = window["wp"]["url"];
;
function createPreloadingMiddleware(preloadedData) {
  const cache = Object.fromEntries(Object.entries(preloadedData).map(([path, data]) => [(0,external_wp_url_namespaceObject.normalizePath)(path), data]));
  return (options, next) => {
    const {
      parse = true
    } = options;
    let rawPath = options.path;
    if (!rawPath && options.url) {
      const {
        rest_route: pathFromQuery,
        ...queryArgs
      } = (0,external_wp_url_namespaceObject.getQueryArgs)(options.url);
      if (typeof pathFromQuery === 'string') {
        rawPath = (0,external_wp_url_namespaceObject.addQueryArgs)(pathFromQuery, queryArgs);
      }
    }
    if (typeof rawPath !== 'string') {
      return next(options);
    }
    const method = options.method || 'GET';
    const path = (0,external_wp_url_namespaceObject.normalizePath)(rawPath);
    if ('GET' === method && cache[path]) {
      const cacheData = cache[path];
      delete cache[path];
      return prepareResponse(cacheData, !!parse);
    } else if ('OPTIONS' === method && cache[method] && cache[method][path]) {
      const cacheData = cache[method][path];
      delete cache[method][path];
      return prepareResponse(cacheData, !!parse);
    }
    return next(options);
  };
}
function prepareResponse(responseData, parse) {
  if (parse) {
    return Promise.resolve(responseData.body);
  }
  try {
    return Promise.resolve(new window.Response(JSON.stringify(responseData.body), {
      status: 200,
      statusText: 'OK',
      headers: responseData.headers
    }));
  } catch {
    Object.entries(responseData.headers).forEach(([key, value]) => {
      if (key.toLowerCase() === 'link') {
        responseData.headers[key] = value.replace(/<([^>]+)>/, (_, url) => `<${encodeURI(url)}>`);
      }
    });
    return Promise.resolve(parse ? responseData.body : new window.Response(JSON.stringify(responseData.body), {
      status: 200,
      statusText: 'OK',
      headers: responseData.headers
    }));
  }
}
 const preloading = (createPreloadingMiddleware);
;
const modifyQuery = ({
  path,
  url,
  ...options
}, queryArgs) => ({
  ...options,
  url: url && (0,external_wp_url_namespaceObject.addQueryArgs)(url, queryArgs),
  path: path && (0,external_wp_url_namespaceObject.addQueryArgs)(path, queryArgs)
});
const parseResponse = response => response.json ? response.json() : Promise.reject(response);
const parseLinkHeader = linkHeader => {
  if (!linkHeader) {
    return {};
  }
  const match = linkHeader.match(/<([^>]+)>; rel="next"/);
  return match ? {
    next: match[1]
  } : {};
};
const getNextPageUrl = response => {
  const {
    next
  } = parseLinkHeader(response.headers.get('link'));
  return next;
};
const requestContainsUnboundedQuery = options => {
  const pathIsUnbounded = !!options.path && options.path.indexOf('per_page=-1') !== -1;
  const urlIsUnbounded = !!options.url && options.url.indexOf('per_page=-1') !== -1;
  return pathIsUnbounded || urlIsUnbounded;
};
const fetchAllMiddleware = async (options, next) => {
  if (options.parse === false) {
    return next(options);
  }
  if (!requestContainsUnboundedQuery(options)) {
    return next(options);
  }
  const response = await build_module({
    ...modifyQuery(options, {
      per_page: 100
    }),
    parse: false
  });
  const results = await parseResponse(response);
  if (!Array.isArray(results)) {
    return results;
  }
  let nextPage = getNextPageUrl(response);
  if (!nextPage) {
    return results;
  }
  let mergedResults = [].concat(results);
  while (nextPage) {
    const nextResponse = await build_module({
      ...options,
      path: undefined,
      url: nextPage,
      parse: false
    });
    const nextResults = await parseResponse(nextResponse);
    mergedResults = mergedResults.concat(nextResults);
    nextPage = getNextPageUrl(nextResponse);
  }
  return mergedResults;
};
 const fetch_all_middleware = (fetchAllMiddleware);
;
const OVERRIDE_METHODS = new Set(['PATCH', 'PUT', 'DELETE']);
const DEFAULT_METHOD = 'GET';
const httpV1Middleware = (options, next) => {
  const {
    method = DEFAULT_METHOD
  } = options;
  if (OVERRIDE_METHODS.has(method.toUpperCase())) {
    options = {
      ...options,
      headers: {
        ...options.headers,
        'X-HTTP-Method-Override': method,
        'Content-Type': 'application/json'
      },
      method: 'POST'
    };
  }
  return next(options);
};
 const http_v1 = (httpV1Middleware);
;
const userLocaleMiddleware = (options, next) => {
  if (typeof options.url === 'string' && !(0,external_wp_url_namespaceObject.hasQueryArg)(options.url, '_locale')) {
    options.url = (0,external_wp_url_namespaceObject.addQueryArgs)(options.url, {
      _locale: 'user'
    });
  }
  if (typeof options.path === 'string' && !(0,external_wp_url_namespaceObject.hasQueryArg)(options.path, '_locale')) {
    options.path = (0,external_wp_url_namespaceObject.addQueryArgs)(options.path, {
      _locale: 'user'
    });
  }
  return next(options);
};
 const user_locale = (userLocaleMiddleware);
;
const response_parseResponse = (response, shouldParseResponse = true) => {
  if (shouldParseResponse) {
    if (response.status === 204) {
      return null;
    }
    return response.json ? response.json() : Promise.reject(response);
  }
  return response;
};
const parseJsonAndNormalizeError = response => {
  const invalidJsonError = {
    code: 'invalid_json',
    message: (0,external_wp_i18n_namespaceObject.__)('The response is not a valid JSON response.')
  };
  if (!response || !response.json) {
    throw invalidJsonError;
  }
  return response.json().catch(() => {
    throw invalidJsonError;
  });
};
const parseResponseAndNormalizeError = (response, shouldParseResponse = true) => {
  return Promise.resolve(response_parseResponse(response, shouldParseResponse)).catch(res => parseAndThrowError(res, shouldParseResponse));
};
function parseAndThrowError(response, shouldParseResponse = true) {
  if (!shouldParseResponse) {
    throw response;
  }
  return parseJsonAndNormalizeError(response).then(error => {
    const unknownError = {
      code: 'unknown_error',
      message: (0,external_wp_i18n_namespaceObject.__)('An unknown error occurred.')
    };
    throw error || unknownError;
  });
}
;
function isMediaUploadRequest(options) {
  const isCreateMethod = !!options.method && options.method === 'POST';
  const isMediaEndpoint = !!options.path && options.path.indexOf('/wp/v2/media') !== -1 || !!options.url && options.url.indexOf('/wp/v2/media') !== -1;
  return isMediaEndpoint && isCreateMethod;
}
const mediaUploadMiddleware = (options, next) => {
  if (!isMediaUploadRequest(options)) {
    return next(options);
  }
  let retries = 0;
  const maxRetries = 5;
  const postProcess = attachmentId => {
    retries++;
    return next({
      path: `/wp/v2/media/${attachmentId}/post-process`,
      method: 'POST',
      data: {
        action: 'create-image-subsizes'
      },
      parse: false
    }).catch(() => {
      if (retries < maxRetries) {
        return postProcess(attachmentId);
      }
      next({
        path: `/wp/v2/media/${attachmentId}?force=true`,
        method: 'DELETE'
      });
      return Promise.reject();
    });
  };
  return next({
    ...options,
    parse: false
  }).catch(response => {
    if (!response.headers) {
      return Promise.reject(response);
    }
    const attachmentId = response.headers.get('x-wp-upload-attachment-id');
    if (response.status >= 500 && response.status < 600 && attachmentId) {
      return postProcess(attachmentId).catch(() => {
        if (options.parse !== false) {
          return Promise.reject({
            code: 'post_process',
            message: (0,external_wp_i18n_namespaceObject.__)('Media upload failed. If this is a photo or a large image, please scale it down and try again.')
          });
        }
        return Promise.reject(response);
      });
    }
    return parseAndThrowError(response, options.parse);
  }).then(response => parseResponseAndNormalizeError(response, options.parse));
};
 const media_upload = (mediaUploadMiddleware);
;
const createThemePreviewMiddleware = themePath => (options, next) => {
  if (typeof options.url === 'string') {
    const wpThemePreview = (0,external_wp_url_namespaceObject.getQueryArg)(options.url, 'wp_theme_preview');
    if (wpThemePreview === undefined) {
      options.url = (0,external_wp_url_namespaceObject.addQueryArgs)(options.url, {
        wp_theme_preview: themePath
      });
    } else if (wpThemePreview === '') {
      options.url = (0,external_wp_url_namespaceObject.removeQueryArgs)(options.url, 'wp_theme_preview');
    }
  }
  if (typeof options.path === 'string') {
    const wpThemePreview = (0,external_wp_url_namespaceObject.getQueryArg)(options.path, 'wp_theme_preview');
    if (wpThemePreview === undefined) {
      options.path = (0,external_wp_url_namespaceObject.addQueryArgs)(options.path, {
        wp_theme_preview: themePath
      });
    } else if (wpThemePreview === '') {
      options.path = (0,external_wp_url_namespaceObject.removeQueryArgs)(options.path, 'wp_theme_preview');
    }
  }
  return next(options);
};
 const theme_preview = (createThemePreviewMiddleware);
;
const DEFAULT_HEADERS = {
  Accept: 'application/json, */*;q=0.1'
};
const DEFAULT_OPTIONS = {
  credentials: 'include'
};
const middlewares = [user_locale, namespace_endpoint, http_v1, fetch_all_middleware];
function registerMiddleware(middleware) {
  middlewares.unshift(middleware);
}
const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  throw response;
};
const defaultFetchHandler = nextOptions => {
  const {
    url,
    path,
    data,
    parse = true,
    ...remainingOptions
  } = nextOptions;
  let {
    body,
    headers
  } = nextOptions;
  headers = {
    ...DEFAULT_HEADERS,
    ...headers
  };
  if (data) {
    body = JSON.stringify(data);
    headers['Content-Type'] = 'application/json';
  }
  const responsePromise = window.fetch(
  url || path || window.location.href, {
    ...DEFAULT_OPTIONS,
    ...remainingOptions,
    body,
    headers
  });
  return responsePromise.then(value => Promise.resolve(value).then(checkStatus).catch(response => parseAndThrowError(response, parse)).then(response => parseResponseAndNormalizeError(response, parse)), err => {
    if (err && err.name === 'AbortError') {
      throw err;
    }
    throw {
      code: 'fetch_error',
      message: (0,external_wp_i18n_namespaceObject.__)('You are probably offline.')
    };
  });
};
let fetchHandler = defaultFetchHandler;
function setFetchHandler(newFetchHandler) {
  fetchHandler = newFetchHandler;
}
function apiFetch(options) {
  const enhancedHandler = middlewares.reduceRight((next, middleware) => {
    return workingOptions => middleware(workingOptions, next);
  }, fetchHandler);
  return enhancedHandler(options).catch(error => {
    if (error.code !== 'rest_cookie_invalid_nonce') {
      return Promise.reject(error);
    }
    return window
    .fetch(apiFetch.nonceEndpoint).then(checkStatus).then(data => data.text()).then(text => {
      apiFetch.nonceMiddleware.nonce = text;
      return apiFetch(options);
    });
  });
}
apiFetch.use = registerMiddleware;
apiFetch.setFetchHandler = setFetchHandler;
apiFetch.createNonceMiddleware = nonce;
apiFetch.createPreloadingMiddleware = preloading;
apiFetch.createRootURLMiddleware = root_url;
apiFetch.fetchAllMiddleware = fetch_all_middleware;
apiFetch.mediaUploadMiddleware = media_upload;
apiFetch.createThemePreviewMiddleware = theme_preview;
 const build_module = (apiFetch);
(window.wp = window.wp || {}).apiFetch = __webpack_exports__["default"];
 })()
;