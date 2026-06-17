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
  store: () => ( store)
});
var actions_namespaceObject = {};
__webpack_require__.r(actions_namespaceObject);
__webpack_require__.d(actions_namespaceObject, {
  createErrorNotice: () => (createErrorNotice),
  createInfoNotice: () => (createInfoNotice),
  createNotice: () => (createNotice),
  createSuccessNotice: () => (createSuccessNotice),
  createWarningNotice: () => (createWarningNotice),
  removeAllNotices: () => (removeAllNotices),
  removeNotice: () => (removeNotice),
  removeNotices: () => (removeNotices)
});
var selectors_namespaceObject = {};
__webpack_require__.r(selectors_namespaceObject);
__webpack_require__.d(selectors_namespaceObject, {
  getNotices: () => (getNotices)
});
;
const external_wp_data_namespaceObject = window["wp"]["data"];
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
 const on_sub_key = (onSubKey);
;
const notices = on_sub_key('context')((state = [], action) => {
  switch (action.type) {
    case 'CREATE_NOTICE':
      return [...state.filter(({
        id
      }) => id !== action.notice.id), action.notice];
    case 'REMOVE_NOTICE':
      return state.filter(({
        id
      }) => id !== action.id);
    case 'REMOVE_NOTICES':
      return state.filter(({
        id
      }) => !action.ids.includes(id));
    case 'REMOVE_ALL_NOTICES':
      return state.filter(({
        type
      }) => type !== action.noticeType);
  }
  return state;
});
 const reducer = (notices);
;
const DEFAULT_CONTEXT = 'global';
const DEFAULT_STATUS = 'info';
;
let uniqueId = 0;
function createNotice(status = DEFAULT_STATUS, content, options = {}) {
  const {
    speak = true,
    isDismissible = true,
    context = DEFAULT_CONTEXT,
    id = `${context}${++uniqueId}`,
    actions = [],
    type = 'default',
    __unstableHTML,
    icon = null,
    explicitDismiss = false,
    onDismiss
  } = options;
  content = String(content);
  return {
    type: 'CREATE_NOTICE',
    context,
    notice: {
      id,
      status,
      content,
      spokenMessage: speak ? content : null,
      __unstableHTML,
      isDismissible,
      actions,
      type,
      icon,
      explicitDismiss,
      onDismiss
    }
  };
}
function createSuccessNotice(content, options) {
  return createNotice('success', content, options);
}
function createInfoNotice(content, options) {
  return createNotice('info', content, options);
}
function createErrorNotice(content, options) {
  return createNotice('error', content, options);
}
function createWarningNotice(content, options) {
  return createNotice('warning', content, options);
}
function removeNotice(id, context = DEFAULT_CONTEXT) {
  return {
    type: 'REMOVE_NOTICE',
    id,
    context
  };
}
function removeAllNotices(noticeType = 'default', context = DEFAULT_CONTEXT) {
  return {
    type: 'REMOVE_ALL_NOTICES',
    noticeType,
    context
  };
}
function removeNotices(ids, context = DEFAULT_CONTEXT) {
  return {
    type: 'REMOVE_NOTICES',
    ids,
    context
  };
}
;
const DEFAULT_NOTICES = [];
function getNotices(state, context = DEFAULT_CONTEXT) {
  return state[context] || DEFAULT_NOTICES;
}
;
const store = (0,external_wp_data_namespaceObject.createReduxStore)('core/notices', {
  reducer: reducer,
  actions: actions_namespaceObject,
  selectors: selectors_namespaceObject
});
(0,external_wp_data_namespaceObject.register)(store);
;
(window.wp = window.wp || {}).notices = __webpack_exports__;
 })()
;