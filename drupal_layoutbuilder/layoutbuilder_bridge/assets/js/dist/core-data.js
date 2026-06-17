 (() => { 
 	"use strict";
 	var __webpack_modules__ = ({
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
 }),
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
  EntityProvider: () => ( EntityProvider),
  __experimentalFetchLinkSuggestions: () => ( fetchLinkSuggestions),
  __experimentalFetchUrlData: () => ( _experimental_fetch_url_data),
  __experimentalUseEntityRecord: () => ( __experimentalUseEntityRecord),
  __experimentalUseEntityRecords: () => ( __experimentalUseEntityRecords),
  __experimentalUseResourcePermissions: () => ( __experimentalUseResourcePermissions),
  fetchBlockPatterns: () => ( fetchBlockPatterns),
  privateApis: () => ( privateApis),
  store: () => ( store),
  useEntityBlockEditor: () => ( useEntityBlockEditor),
  useEntityId: () => ( useEntityId),
  useEntityProp: () => ( useEntityProp),
  useEntityRecord: () => ( useEntityRecord),
  useEntityRecords: () => ( useEntityRecords),
  useResourcePermissions: () => ( use_resource_permissions)
});
var build_module_selectors_namespaceObject = {};
__webpack_require__.r(build_module_selectors_namespaceObject);
__webpack_require__.d(build_module_selectors_namespaceObject, {
  __experimentalGetCurrentGlobalStylesId: () => (__experimentalGetCurrentGlobalStylesId),
  __experimentalGetCurrentThemeBaseGlobalStyles: () => (__experimentalGetCurrentThemeBaseGlobalStyles),
  __experimentalGetCurrentThemeGlobalStylesVariations: () => (__experimentalGetCurrentThemeGlobalStylesVariations),
  __experimentalGetDirtyEntityRecords: () => (__experimentalGetDirtyEntityRecords),
  __experimentalGetEntitiesBeingSaved: () => (__experimentalGetEntitiesBeingSaved),
  __experimentalGetEntityRecordNoResolver: () => (__experimentalGetEntityRecordNoResolver),
  canUser: () => (canUser),
  canUserEditEntityRecord: () => (canUserEditEntityRecord),
  getAuthors: () => (getAuthors),
  getAutosave: () => (getAutosave),
  getAutosaves: () => (getAutosaves),
  getBlockPatternCategories: () => (getBlockPatternCategories),
  getBlockPatterns: () => (getBlockPatterns),
  getCurrentTheme: () => (getCurrentTheme),
  getCurrentThemeGlobalStylesRevisions: () => (getCurrentThemeGlobalStylesRevisions),
  getCurrentUser: () => (getCurrentUser),
  getDefaultTemplateId: () => (getDefaultTemplateId),
  getEditedEntityRecord: () => (getEditedEntityRecord),
  getEmbedPreview: () => (getEmbedPreview),
  getEntitiesByKind: () => (getEntitiesByKind),
  getEntitiesConfig: () => (getEntitiesConfig),
  getEntity: () => (getEntity),
  getEntityConfig: () => (getEntityConfig),
  getEntityRecord: () => (getEntityRecord),
  getEntityRecordEdits: () => (getEntityRecordEdits),
  getEntityRecordNonTransientEdits: () => (getEntityRecordNonTransientEdits),
  getEntityRecords: () => (getEntityRecords),
  getEntityRecordsTotalItems: () => (getEntityRecordsTotalItems),
  getEntityRecordsTotalPages: () => (getEntityRecordsTotalPages),
  getLastEntityDeleteError: () => (getLastEntityDeleteError),
  getLastEntitySaveError: () => (getLastEntitySaveError),
  getRawEntityRecord: () => (getRawEntityRecord),
  getRedoEdit: () => (getRedoEdit),
  getReferenceByDistinctEdits: () => (getReferenceByDistinctEdits),
  getRevision: () => (getRevision),
  getRevisions: () => (getRevisions),
  getThemeSupports: () => (getThemeSupports),
  getUndoEdit: () => (getUndoEdit),
  getUserPatternCategories: () => (getUserPatternCategories),
  getUserQueryResults: () => (getUserQueryResults),
  hasEditsForEntityRecord: () => (hasEditsForEntityRecord),
  hasEntityRecords: () => (hasEntityRecords),
  hasFetchedAutosaves: () => (hasFetchedAutosaves),
  hasRedo: () => (hasRedo),
  hasUndo: () => (hasUndo),
  isAutosavingEntityRecord: () => (isAutosavingEntityRecord),
  isDeletingEntityRecord: () => (isDeletingEntityRecord),
  isPreviewEmbedFallback: () => (isPreviewEmbedFallback),
  isRequestingEmbedPreview: () => (isRequestingEmbedPreview),
  isSavingEntityRecord: () => (isSavingEntityRecord)
});
var private_selectors_namespaceObject = {};
__webpack_require__.r(private_selectors_namespaceObject);
__webpack_require__.d(private_selectors_namespaceObject, {
  getBlockPatternsForPostType: () => (getBlockPatternsForPostType),
  getEntityRecordPermissions: () => (getEntityRecordPermissions),
  getEntityRecordsPermissions: () => (getEntityRecordsPermissions),
  getHomePage: () => (getHomePage),
  getNavigationFallbackId: () => (getNavigationFallbackId),
  getPostsPageId: () => (getPostsPageId),
  getRegisteredPostMeta: () => (getRegisteredPostMeta),
  getTemplateId: () => (getTemplateId),
  getUndoManager: () => (getUndoManager)
});
var build_module_actions_namespaceObject = {};
__webpack_require__.r(build_module_actions_namespaceObject);
__webpack_require__.d(build_module_actions_namespaceObject, {
  __experimentalBatch: () => (__experimentalBatch),
  __experimentalReceiveCurrentGlobalStylesId: () => (__experimentalReceiveCurrentGlobalStylesId),
  __experimentalReceiveThemeBaseGlobalStyles: () => (__experimentalReceiveThemeBaseGlobalStyles),
  __experimentalReceiveThemeGlobalStyleVariations: () => (__experimentalReceiveThemeGlobalStyleVariations),
  __experimentalSaveSpecifiedEntityEdits: () => (__experimentalSaveSpecifiedEntityEdits),
  __unstableCreateUndoLevel: () => (__unstableCreateUndoLevel),
  addEntities: () => (addEntities),
  deleteEntityRecord: () => (deleteEntityRecord),
  editEntityRecord: () => (editEntityRecord),
  receiveAutosaves: () => (receiveAutosaves),
  receiveCurrentTheme: () => (receiveCurrentTheme),
  receiveCurrentUser: () => (receiveCurrentUser),
  receiveDefaultTemplateId: () => (receiveDefaultTemplateId),
  receiveEmbedPreview: () => (receiveEmbedPreview),
  receiveEntityRecords: () => (receiveEntityRecords),
  receiveNavigationFallbackId: () => (receiveNavigationFallbackId),
  receiveRevisions: () => (receiveRevisions),
  receiveThemeGlobalStyleRevisions: () => (receiveThemeGlobalStyleRevisions),
  receiveThemeSupports: () => (receiveThemeSupports),
  receiveUploadPermissions: () => (receiveUploadPermissions),
  receiveUserPermission: () => (receiveUserPermission),
  receiveUserPermissions: () => (receiveUserPermissions),
  receiveUserQuery: () => (receiveUserQuery),
  redo: () => (redo),
  saveEditedEntityRecord: () => (saveEditedEntityRecord),
  saveEntityRecord: () => (saveEntityRecord),
  undo: () => (undo)
});
var private_actions_namespaceObject = {};
__webpack_require__.r(private_actions_namespaceObject);
__webpack_require__.d(private_actions_namespaceObject, {
  receiveRegisteredPostMeta: () => (receiveRegisteredPostMeta)
});
var resolvers_namespaceObject = {};
__webpack_require__.r(resolvers_namespaceObject);
__webpack_require__.d(resolvers_namespaceObject, {
  __experimentalGetCurrentGlobalStylesId: () => (resolvers_experimentalGetCurrentGlobalStylesId),
  __experimentalGetCurrentThemeBaseGlobalStyles: () => (resolvers_experimentalGetCurrentThemeBaseGlobalStyles),
  __experimentalGetCurrentThemeGlobalStylesVariations: () => (resolvers_experimentalGetCurrentThemeGlobalStylesVariations),
  canUser: () => (resolvers_canUser),
  canUserEditEntityRecord: () => (resolvers_canUserEditEntityRecord),
  getAuthors: () => (resolvers_getAuthors),
  getAutosave: () => (resolvers_getAutosave),
  getAutosaves: () => (resolvers_getAutosaves),
  getBlockPatternCategories: () => (resolvers_getBlockPatternCategories),
  getBlockPatterns: () => (resolvers_getBlockPatterns),
  getCurrentTheme: () => (resolvers_getCurrentTheme),
  getCurrentThemeGlobalStylesRevisions: () => (resolvers_getCurrentThemeGlobalStylesRevisions),
  getCurrentUser: () => (resolvers_getCurrentUser),
  getDefaultTemplateId: () => (resolvers_getDefaultTemplateId),
  getEditedEntityRecord: () => (resolvers_getEditedEntityRecord),
  getEmbedPreview: () => (resolvers_getEmbedPreview),
  getEntitiesConfig: () => (resolvers_getEntitiesConfig),
  getEntityRecord: () => (resolvers_getEntityRecord),
  getEntityRecords: () => (resolvers_getEntityRecords),
  getNavigationFallbackId: () => (resolvers_getNavigationFallbackId),
  getRawEntityRecord: () => (resolvers_getRawEntityRecord),
  getRegisteredPostMeta: () => (resolvers_getRegisteredPostMeta),
  getRevision: () => (resolvers_getRevision),
  getRevisions: () => (resolvers_getRevisions),
  getThemeSupports: () => (resolvers_getThemeSupports),
  getUserPatternCategories: () => (resolvers_getUserPatternCategories)
});
;
const external_wp_data_namespaceObject = window["wp"]["data"];
var es6 = __webpack_require__(7734);
var es6_default = __webpack_require__.n(es6);
;
const external_wp_compose_namespaceObject = window["wp"]["compose"];
;
const external_wp_isShallowEqual_namespaceObject = window["wp"]["isShallowEqual"];
var external_wp_isShallowEqual_default = __webpack_require__.n(external_wp_isShallowEqual_namespaceObject);
;
function mergeHistoryChanges(changes1, changes2) {
  const newChanges = {
    ...changes1
  };
  Object.entries(changes2).forEach(([key, value]) => {
    if (newChanges[key]) {
      newChanges[key] = {
        ...newChanges[key],
        to: value.to
      };
    } else {
      newChanges[key] = value;
    }
  });
  return newChanges;
}
const addHistoryChangesIntoRecord = (record, changes) => {
  const existingChangesIndex = record?.findIndex(({
    id: recordIdentifier
  }) => {
    return typeof recordIdentifier === 'string' ? recordIdentifier === changes.id : external_wp_isShallowEqual_default()(recordIdentifier, changes.id);
  });
  const nextRecord = [...record];
  if (existingChangesIndex !== -1) {
    nextRecord[existingChangesIndex] = {
      id: changes.id,
      changes: mergeHistoryChanges(nextRecord[existingChangesIndex].changes, changes.changes)
    };
  } else {
    nextRecord.push(changes);
  }
  return nextRecord;
};
function createUndoManager() {
  let history = [];
  let stagedRecord = [];
  let offset = 0;
  const dropPendingRedos = () => {
    history = history.slice(0, offset || undefined);
    offset = 0;
  };
  const appendStagedRecordToLatestHistoryRecord = () => {
    var _history$index;
    const index = history.length === 0 ? 0 : history.length - 1;
    let latestRecord = (_history$index = history[index]) !== null && _history$index !== void 0 ? _history$index : [];
    stagedRecord.forEach(changes => {
      latestRecord = addHistoryChangesIntoRecord(latestRecord, changes);
    });
    stagedRecord = [];
    history[index] = latestRecord;
  };
  const isRecordEmpty = record => {
    const filteredRecord = record.filter(({
      changes
    }) => {
      return Object.values(changes).some(({
        from,
        to
      }) => typeof from !== 'function' && typeof to !== 'function' && !external_wp_isShallowEqual_default()(from, to));
    });
    return !filteredRecord.length;
  };
  return {
    addRecord(record, isStaged = false) {
      const isEmpty = !record || isRecordEmpty(record);
      if (isStaged) {
        if (isEmpty) {
          return;
        }
        record.forEach(changes => {
          stagedRecord = addHistoryChangesIntoRecord(stagedRecord, changes);
        });
      } else {
        dropPendingRedos();
        if (stagedRecord.length) {
          appendStagedRecordToLatestHistoryRecord();
        }
        if (isEmpty) {
          return;
        }
        history.push(record);
      }
    },
    undo() {
      if (stagedRecord.length) {
        dropPendingRedos();
        appendStagedRecordToLatestHistoryRecord();
      }
      const undoRecord = history[history.length - 1 + offset];
      if (!undoRecord) {
        return;
      }
      offset -= 1;
      return undoRecord;
    },
    redo() {
      const redoRecord = history[history.length + offset];
      if (!redoRecord) {
        return;
      }
      offset += 1;
      return redoRecord;
    },
    hasUndo() {
      return !!history[history.length - 1 + offset];
    },
    hasRedo() {
      return !!history[history.length + offset];
    }
  };
}
;
const ifMatchingAction = isMatch => reducer => (state, action) => {
  if (state === undefined || isMatch(action)) {
    return reducer(state, action);
  }
  return state;
};
 const if_matching_action = (ifMatchingAction);
;
const replaceAction = replacer => reducer => (state, action) => {
  return reducer(state, replacer(action));
};
 const replace_action = (replaceAction);
;
function conservativeMapItem(item, nextItem) {
  if (!item) {
    return nextItem;
  }
  let hasChanges = false;
  const result = {};
  for (const key in nextItem) {
    if (es6_default()(item[key], nextItem[key])) {
      result[key] = item[key];
    } else {
      hasChanges = true;
      result[key] = nextItem[key];
    }
  }
  if (!hasChanges) {
    return item;
  }
  for (const key in item) {
    if (!result.hasOwnProperty(key)) {
      result[key] = item[key];
    }
  }
  return result;
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
 const on_sub_key = (onSubKey);
;
var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
  return extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function() {
  __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
  }
  return __assign.apply(this, arguments);
}
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
}
function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __param(paramIndex, decorator) {
  return function (target, key) { decorator(target, key, paramIndex); }
}
function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
          if (result === void 0) continue;
          if (result === null || typeof result !== "object") throw new TypeError("Object expected");
          if (_ = accept(result.get)) descriptor.get = _;
          if (_ = accept(result.set)) descriptor.set = _;
          if (_ = accept(result.init)) initializers.unshift(_);
      }
      else if (_ = accept(result)) {
          if (kind === "field") initializers.unshift(_);
          else descriptor[key] = _;
      }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};
function __runInitializers(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x);
};
function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
              case 0: case 1: t = op; break;
              case 4: _.label++; return { value: op[1], done: false };
              case 5: _.label++; y = op[1]; op = [0]; continue;
              case 7: op = _.ops.pop(); _.trys.pop(); continue;
              default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                  if (t[2]) _.ops.pop();
                  _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
}
var __createBinding = Object.create ? (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
  }
  Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
function __exportStar(m, o) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
      next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
      }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  }
  catch (error) { e = { error: error }; }
  finally {
      try {
          if (r && !r.done && (m = i["return"])) m.call(i);
      }
      finally { if (e) throw e.error; }
  }
  return ar;
}
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
  return ar;
}
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
  return r;
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
      }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
  function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
  function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
  function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
  function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
  function fulfill(value) { resume("next", value); }
  function reject(value) { resume("throw", value); }
  function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}
function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
  function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
}
function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}
function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
  return cooked;
};
var __setModuleDefault = Object.create ? (function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
  o["default"] = v;
};
var ownKeys = function(o) {
  ownKeys = Object.getOwnPropertyNames || function (o) {
    var ar = [];
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
    return ar;
  };
  return ownKeys(o);
};
function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
  __setModuleDefault(result, mod);
  return result;
}
function __importDefault(mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
}
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}
function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof state === "function" ? receiver === state : state.has(receiver);
}
function __addDisposableResource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
    env.stack.push({ value: value, dispose: dispose, async: async });
  }
  else if (async) {
    env.stack.push({ async: true });
  }
  return value;
}
var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
    env.hasError = true;
  }
  var r, s = 0;
  function next() {
    while (r = env.stack.pop()) {
      try {
        if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
        if (r.dispose) {
          var result = r.dispose.call(r.value);
          if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
        }
        else s |= 1;
      }
      catch (e) {
        fail(e);
      }
    }
    if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
    if (env.hasError) throw env.error;
  }
  return next();
}
function __rewriteRelativeImportExtension(path, preserveJsx) {
  if (typeof path === "string" && /^\.\.?\//.test(path)) {
      return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
          return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
      });
  }
  return path;
}
 const tslib_es6 = ({
  __extends,
  __assign,
  __rest,
  __decorate,
  __param,
  __esDecorate,
  __runInitializers,
  __propKey,
  __setFunctionName,
  __metadata,
  __awaiter,
  __generator,
  __createBinding,
  __exportStar,
  __values,
  __read,
  __spread,
  __spreadArrays,
  __spreadArray,
  __await,
  __asyncGenerator,
  __asyncDelegator,
  __asyncValues,
  __makeTemplateObject,
  __importStar,
  __importDefault,
  __classPrivateFieldGet,
  __classPrivateFieldSet,
  __classPrivateFieldIn,
  __addDisposableResource,
  __disposeResources,
  __rewriteRelativeImportExtension,
});
;
var SUPPORTED_LOCALE = {
    tr: {
        regexp: /\u0130|\u0049|\u0049\u0307/g,
        map: {
            İ: "\u0069",
            I: "\u0131",
            İ: "\u0069",
        },
    },
    az: {
        regexp: /\u0130/g,
        map: {
            İ: "\u0069",
            I: "\u0131",
            İ: "\u0069",
        },
    },
    lt: {
        regexp: /\u0049|\u004A|\u012E|\u00CC|\u00CD|\u0128/g,
        map: {
            I: "\u0069\u0307",
            J: "\u006A\u0307",
            Į: "\u012F\u0307",
            Ì: "\u0069\u0307\u0300",
            Í: "\u0069\u0307\u0301",
            Ĩ: "\u0069\u0307\u0303",
        },
    },
};
function localeLowerCase(str, locale) {
    var lang = SUPPORTED_LOCALE[locale.toLowerCase()];
    if (lang)
        return lowerCase(str.replace(lang.regexp, function (m) { return lang.map[m]; }));
    return lowerCase(str);
}
function lowerCase(str) {
    return str.toLowerCase();
}
;
var DEFAULT_SPLIT_REGEXP = [/([a-z0-9])([A-Z])/g, /([A-Z])([A-Z][a-z])/g];
var DEFAULT_STRIP_REGEXP = /[^A-Z0-9]+/gi;
function noCase(input, options) {
    if (options === void 0) { options = {}; }
    var _a = options.splitRegexp, splitRegexp = _a === void 0 ? DEFAULT_SPLIT_REGEXP : _a, _b = options.stripRegexp, stripRegexp = _b === void 0 ? DEFAULT_STRIP_REGEXP : _b, _c = options.transform, transform = _c === void 0 ? lowerCase : _c, _d = options.delimiter, delimiter = _d === void 0 ? " " : _d;
    var result = replace(replace(input, splitRegexp, "$1\0$2"), stripRegexp, "\0");
    var start = 0;
    var end = result.length;
    while (result.charAt(start) === "\0")
        start++;
    while (result.charAt(end - 1) === "\0")
        end--;
    return result.slice(start, end).split("\0").map(transform).join(delimiter);
}
function replace(input, re, value) {
    if (re instanceof RegExp)
        return input.replace(re, value);
    return re.reduce(function (input, re) { return input.replace(re, value); }, input);
}
;
function upperCaseFirst(input) {
    return input.charAt(0).toUpperCase() + input.substr(1);
}
;
function capitalCaseTransform(input) {
    return upperCaseFirst(input.toLowerCase());
}
function capitalCase(input, options) {
    if (options === void 0) { options = {}; }
    return noCase(input, __assign({ delimiter: " ", transform: capitalCaseTransform }, options));
}
;
function pascalCaseTransform(input, index) {
    var firstChar = input.charAt(0);
    var lowerChars = input.substr(1).toLowerCase();
    if (index > 0 && firstChar >= "0" && firstChar <= "9") {
        return "_" + firstChar + lowerChars;
    }
    return "" + firstChar.toUpperCase() + lowerChars;
}
function dist_es2015_pascalCaseTransformMerge(input) {
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}
function pascalCase(input, options) {
    if (options === void 0) { options = {}; }
    return noCase(input, __assign({ delimiter: "", transform: pascalCaseTransform }, options));
}
;
const external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
var external_wp_apiFetch_default = __webpack_require__.n(external_wp_apiFetch_namespaceObject);
;
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;
const external_wp_richText_namespaceObject = window["wp"]["richText"];
;
const DEFAULT_ENTITY_KEY = 'id';
const POST_RAW_ATTRIBUTES = ['title', 'excerpt', 'content'];
const rootEntitiesConfig = [{
  label: (0,external_wp_i18n_namespaceObject.__)('Base'),
  kind: 'root',
  name: '__unstableBase',
  baseURL: '/',
  baseURLParams: {
    _fields: ['description', 'gmt_offset', 'home', 'name', 'site_icon', 'site_icon_url', 'site_logo', 'timezone_string', 'url', 'page_for_posts', 'page_on_front', 'show_on_front'].join(',')
  },
  plural: '__unstableBases',
  syncConfig: {
    fetch: async () => {
      return external_wp_apiFetch_default()({
        path: '/'
      });
    },
    applyChangesToDoc: (doc, changes) => {
      const document = doc.getMap('document');
      Object.entries(changes).forEach(([key, value]) => {
        if (document.get(key) !== value) {
          document.set(key, value);
        }
      });
    },
    fromCRDTDoc: doc => {
      return doc.getMap('document').toJSON();
    }
  },
  syncObjectType: 'root/base',
  getSyncObjectId: () => 'index'
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Post Type'),
  name: 'postType',
  kind: 'root',
  key: 'slug',
  baseURL: '/wp/v2/types',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'postTypes',
  syncConfig: {
    fetch: async id => {
      return external_wp_apiFetch_default()({
        path: `/wp/v2/types/${id}?context=edit`
      });
    },
    applyChangesToDoc: (doc, changes) => {
      const document = doc.getMap('document');
      Object.entries(changes).forEach(([key, value]) => {
        if (document.get(key) !== value) {
          document.set(key, value);
        }
      });
    },
    fromCRDTDoc: doc => {
      return doc.getMap('document').toJSON();
    }
  },
  syncObjectType: 'root/postType',
  getSyncObjectId: id => id
}, {
  name: 'media',
  kind: 'root',
  baseURL: '/wp/v2/media',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'mediaItems',
  label: (0,external_wp_i18n_namespaceObject.__)('Media'),
  rawAttributes: ['caption', 'title', 'description'],
  supportsPagination: true
}, {
  name: 'taxonomy',
  kind: 'root',
  key: 'slug',
  baseURL: '/wp/v2/taxonomies',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'taxonomies',
  label: (0,external_wp_i18n_namespaceObject.__)('Taxonomy')
}, {
  name: 'sidebar',
  kind: 'root',
  baseURL: '/wp/v2/sidebars',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'sidebars',
  transientEdits: {
    blocks: true
  },
  label: (0,external_wp_i18n_namespaceObject.__)('Widget areas')
}, {
  name: 'widget',
  kind: 'root',
  baseURL: '/wp/v2/widgets',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'widgets',
  transientEdits: {
    blocks: true
  },
  label: (0,external_wp_i18n_namespaceObject.__)('Widgets')
}, {
  name: 'widgetType',
  kind: 'root',
  baseURL: '/wp/v2/widget-types',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'widgetTypes',
  label: (0,external_wp_i18n_namespaceObject.__)('Widget types')
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('User'),
  name: 'user',
  kind: 'root',
  baseURL: '/wp/v2/users',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'users'
}, {
  name: 'comment',
  kind: 'root',
  baseURL: '/wp/v2/comments',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'comments',
  label: (0,external_wp_i18n_namespaceObject.__)('Comment')
}, {
  name: 'menu',
  kind: 'root',
  baseURL: '/wp/v2/menus',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'menus',
  label: (0,external_wp_i18n_namespaceObject.__)('Menu')
}, {
  name: 'menuItem',
  kind: 'root',
  baseURL: '/wp/v2/menu-items',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'menuItems',
  label: (0,external_wp_i18n_namespaceObject.__)('Menu Item'),
  rawAttributes: ['title']
}, {
  name: 'menuLocation',
  kind: 'root',
  baseURL: '/wp/v2/menu-locations',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'menuLocations',
  label: (0,external_wp_i18n_namespaceObject.__)('Menu Location'),
  key: 'name'
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Global Styles'),
  name: 'globalStyles',
  kind: 'root',
  baseURL: '/wp/v2/global-styles',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'globalStylesVariations',
  getTitle: record => record?.title?.rendered || record?.title,
  getRevisionsUrl: (parentId, revisionId) => `/wp/v2/global-styles/${parentId}/revisions${revisionId ? '/' + revisionId : ''}`,
  supportsPagination: true
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Themes'),
  name: 'theme',
  kind: 'root',
  baseURL: '/wp/v2/themes',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'themes',
  key: 'stylesheet'
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Plugins'),
  name: 'plugin',
  kind: 'root',
  baseURL: '/wp/v2/plugins',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'plugins',
  key: 'plugin'
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Status'),
  name: 'status',
  kind: 'root',
  baseURL: '/wp/v2/statuses',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'statuses',
  key: 'slug'
}];
const additionalEntityConfigLoaders = [{
  kind: 'postType',
  loadEntities: loadPostTypeEntities
}, {
  kind: 'taxonomy',
  loadEntities: loadTaxonomyEntities
}, {
  kind: 'root',
  name: 'site',
  plural: 'sites',
  loadEntities: loadSiteEntity
}];
const prePersistPostType = (persistedRecord, edits) => {
  const newEdits = {};
  if (persistedRecord?.status === 'auto-draft') {
    if (!edits.status && !newEdits.status) {
      newEdits.status = 'draft';
    }
    if ((!edits.title || edits.title === 'Auto Draft') && !newEdits.title && (!persistedRecord?.title || persistedRecord?.title === 'Auto Draft')) {
      newEdits.title = '';
    }
  }
  return newEdits;
};
const serialisableBlocksCache = new WeakMap();
function makeBlockAttributesSerializable(attributes) {
  const newAttributes = {
    ...attributes
  };
  for (const [key, value] of Object.entries(attributes)) {
    if (value instanceof external_wp_richText_namespaceObject.RichTextData) {
      newAttributes[key] = value.valueOf();
    }
  }
  return newAttributes;
}
function makeBlocksSerializable(blocks) {
  return blocks.map(block => {
    const {
      innerBlocks,
      attributes,
      ...rest
    } = block;
    return {
      ...rest,
      attributes: makeBlockAttributesSerializable(attributes),
      innerBlocks: makeBlocksSerializable(innerBlocks)
    };
  });
}
async function loadPostTypeEntities() {
  const postTypes = await external_wp_apiFetch_default()({
    path: '/wp/v2/types?context=view'
  });
  return Object.entries(postTypes !== null && postTypes !== void 0 ? postTypes : {}).map(([name, postType]) => {
    var _postType$rest_namesp;
    const isTemplate = ['wp_template', 'wp_template_part'].includes(name);
    const namespace = (_postType$rest_namesp = postType?.rest_namespace) !== null && _postType$rest_namesp !== void 0 ? _postType$rest_namesp : 'wp/v2';
    return {
      kind: 'postType',
      baseURL: `/${namespace}/${postType.rest_base}`,
      baseURLParams: {
        context: 'edit'
      },
      name,
      label: postType.name,
      transientEdits: {
        blocks: true,
        selection: true
      },
      mergedEdits: {
        meta: true
      },
      rawAttributes: POST_RAW_ATTRIBUTES,
      getTitle: record => {
        var _record$slug;
        return record?.title?.rendered || record?.title || (isTemplate ? capitalCase((_record$slug = record.slug) !== null && _record$slug !== void 0 ? _record$slug : '') : String(record.id));
      },
      __unstablePrePersist: isTemplate ? undefined : prePersistPostType,
      __unstable_rest_base: postType.rest_base,
      syncConfig: {
        fetch: async id => {
          return external_wp_apiFetch_default()({
            path: `/${namespace}/${postType.rest_base}/${id}?context=edit`
          });
        },
        applyChangesToDoc: (doc, changes) => {
          const document = doc.getMap('document');
          Object.entries(changes).forEach(([key, value]) => {
            if (typeof value !== 'function') {
              if (key === 'blocks') {
                if (!serialisableBlocksCache.has(value)) {
                  serialisableBlocksCache.set(value, makeBlocksSerializable(value));
                }
                value = serialisableBlocksCache.get(value);
              }
              if (document.get(key) !== value) {
                document.set(key, value);
              }
            }
          });
        },
        fromCRDTDoc: doc => {
          return doc.getMap('document').toJSON();
        }
      },
      syncObjectType: 'postType/' + postType.name,
      getSyncObjectId: id => id,
      supportsPagination: true,
      getRevisionsUrl: (parentId, revisionId) => `/${namespace}/${postType.rest_base}/${parentId}/revisions${revisionId ? '/' + revisionId : ''}`,
      revisionKey: isTemplate ? 'wp_id' : DEFAULT_ENTITY_KEY
    };
  });
}
async function loadTaxonomyEntities() {
  const taxonomies = await external_wp_apiFetch_default()({
    path: '/wp/v2/taxonomies?context=view'
  });
  return Object.entries(taxonomies !== null && taxonomies !== void 0 ? taxonomies : {}).map(([name, taxonomy]) => {
    var _taxonomy$rest_namesp;
    const namespace = (_taxonomy$rest_namesp = taxonomy?.rest_namespace) !== null && _taxonomy$rest_namesp !== void 0 ? _taxonomy$rest_namesp : 'wp/v2';
    return {
      kind: 'taxonomy',
      baseURL: `/${namespace}/${taxonomy.rest_base}`,
      baseURLParams: {
        context: 'edit'
      },
      name,
      label: taxonomy.name
    };
  });
}
async function loadSiteEntity() {
  var _site$schema$properti;
  const entity = {
    label: (0,external_wp_i18n_namespaceObject.__)('Site'),
    name: 'site',
    kind: 'root',
    baseURL: '/wp/v2/settings',
    syncConfig: {
      fetch: async () => {
        return external_wp_apiFetch_default()({
          path: '/wp/v2/settings'
        });
      },
      applyChangesToDoc: (doc, changes) => {
        const document = doc.getMap('document');
        Object.entries(changes).forEach(([key, value]) => {
          if (document.get(key) !== value) {
            document.set(key, value);
          }
        });
      },
      fromCRDTDoc: doc => {
        return doc.getMap('document').toJSON();
      }
    },
    syncObjectType: 'root/site',
    getSyncObjectId: () => 'index',
    meta: {}
  };
  const site = await external_wp_apiFetch_default()({
    path: entity.baseURL,
    method: 'OPTIONS'
  });
  const labels = {};
  Object.entries((_site$schema$properti = site?.schema?.properties) !== null && _site$schema$properti !== void 0 ? _site$schema$properti : {}).forEach(([key, value]) => {
    if (typeof value === 'object' && value.title) {
      labels[key] = value.title;
    }
  });
  return [{
    ...entity,
    meta: {
      labels
    }
  }];
}
const getMethodName = (kind, name, prefix = 'get') => {
  const kindPrefix = kind === 'root' ? '' : pascalCase(kind);
  const suffix = pascalCase(name);
  return `${prefix}${kindPrefix}${suffix}`;
};
;
const external_wp_url_namespaceObject = window["wp"]["url"];
;
function getNormalizedCommaSeparable(value) {
  if (typeof value === 'string') {
    return value.split(',');
  } else if (Array.isArray(value)) {
    return value;
  }
  return null;
}
 const get_normalized_comma_separable = (getNormalizedCommaSeparable);
;
function withWeakMapCache(fn) {
  const cache = new WeakMap();
  return key => {
    let value;
    if (cache.has(key)) {
      value = cache.get(key);
    } else {
      value = fn(key);
      if (key !== null && typeof key === 'object') {
        cache.set(key, value);
      }
    }
    return value;
  };
}
 const with_weak_map_cache = (withWeakMapCache);
;
function getQueryParts(query) {
  const parts = {
    stableKey: '',
    page: 1,
    perPage: 10,
    fields: null,
    include: null,
    context: 'default'
  };
  const keys = Object.keys(query).sort();
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let value = query[key];
    switch (key) {
      case 'page':
        parts[key] = Number(value);
        break;
      case 'per_page':
        parts.perPage = Number(value);
        break;
      case 'context':
        parts.context = value;
        break;
      default:
        if (key === '_fields') {
          var _getNormalizedCommaSe;
          parts.fields = (_getNormalizedCommaSe = get_normalized_comma_separable(value)) !== null && _getNormalizedCommaSe !== void 0 ? _getNormalizedCommaSe : [];
          value = parts.fields.join();
        }
        if (key === 'include') {
          var _getNormalizedCommaSe2;
          if (typeof value === 'number') {
            value = value.toString();
          }
          parts.include = ((_getNormalizedCommaSe2 = get_normalized_comma_separable(value)) !== null && _getNormalizedCommaSe2 !== void 0 ? _getNormalizedCommaSe2 : []).map(Number);
          value = parts.include.join();
        }
        parts.stableKey += (parts.stableKey ? '&' : '') + (0,external_wp_url_namespaceObject.addQueryArgs)('', {
          [key]: value
        }).slice(1);
    }
  }
  return parts;
}
 const get_query_parts = (with_weak_map_cache(getQueryParts));
;
function getContextFromAction(action) {
  const {
    query
  } = action;
  if (!query) {
    return 'default';
  }
  const queryParts = get_query_parts(query);
  return queryParts.context;
}
function getMergedItemIds(itemIds, nextItemIds, page, perPage) {
  var _itemIds$length;
  const receivedAllIds = page === 1 && perPage === -1;
  if (receivedAllIds) {
    return nextItemIds;
  }
  const nextItemIdsStartIndex = (page - 1) * perPage;
  const size = Math.max((_itemIds$length = itemIds?.length) !== null && _itemIds$length !== void 0 ? _itemIds$length : 0, nextItemIdsStartIndex + nextItemIds.length);
  const mergedItemIds = new Array(size);
  for (let i = 0; i < size; i++) {
    const isInNextItemsRange = i >= nextItemIdsStartIndex && i < nextItemIdsStartIndex + perPage;
    mergedItemIds[i] = isInNextItemsRange ? nextItemIds[i - nextItemIdsStartIndex] : itemIds?.[i];
  }
  return mergedItemIds;
}
function removeEntitiesById(entities, ids) {
  return Object.fromEntries(Object.entries(entities).filter(([id]) => !ids.some(itemId => {
    if (Number.isInteger(itemId)) {
      return itemId === +id;
    }
    return itemId === id;
  })));
}
function items(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_ITEMS':
      {
        const context = getContextFromAction(action);
        const key = action.key || DEFAULT_ENTITY_KEY;
        return {
          ...state,
          [context]: {
            ...state[context],
            ...action.items.reduce((accumulator, value) => {
              const itemId = value?.[key];
              accumulator[itemId] = conservativeMapItem(state?.[context]?.[itemId], value);
              return accumulator;
            }, {})
          }
        };
      }
    case 'REMOVE_ITEMS':
      return Object.fromEntries(Object.entries(state).map(([itemId, contextState]) => [itemId, removeEntitiesById(contextState, action.itemIds)]));
  }
  return state;
}
function itemIsComplete(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_ITEMS':
      {
        const context = getContextFromAction(action);
        const {
          query,
          key = DEFAULT_ENTITY_KEY
        } = action;
        const queryParts = query ? get_query_parts(query) : {};
        const isCompleteQuery = !query || !Array.isArray(queryParts.fields);
        return {
          ...state,
          [context]: {
            ...state[context],
            ...action.items.reduce((result, item) => {
              const itemId = item?.[key];
              result[itemId] = state?.[context]?.[itemId] || isCompleteQuery;
              return result;
            }, {})
          }
        };
      }
    case 'REMOVE_ITEMS':
      return Object.fromEntries(Object.entries(state).map(([itemId, contextState]) => [itemId, removeEntitiesById(contextState, action.itemIds)]));
  }
  return state;
}
const receiveQueries = (0,external_wp_compose_namespaceObject.compose)([
if_matching_action(action => 'query' in action),
replace_action(action => {
  if (action.query) {
    return {
      ...action,
      ...get_query_parts(action.query)
    };
  }
  return action;
}), on_sub_key('context'),
on_sub_key('stableKey')])((state = {}, action) => {
  const {
    type,
    page,
    perPage,
    key = DEFAULT_ENTITY_KEY
  } = action;
  if (type !== 'RECEIVE_ITEMS') {
    return state;
  }
  return {
    itemIds: getMergedItemIds(state?.itemIds || [], action.items.map(item => item?.[key]).filter(Boolean), page, perPage),
    meta: action.meta
  };
});
const queries = (state = {}, action) => {
  switch (action.type) {
    case 'RECEIVE_ITEMS':
      return receiveQueries(state, action);
    case 'REMOVE_ITEMS':
      const removedItems = action.itemIds.reduce((result, itemId) => {
        result[itemId] = true;
        return result;
      }, {});
      return Object.fromEntries(Object.entries(state).map(([queryGroup, contextQueries]) => [queryGroup, Object.fromEntries(Object.entries(contextQueries).map(([query, queryItems]) => [query, {
        ...queryItems,
        itemIds: queryItems.itemIds.filter(queryId => !removedItems[queryId])
      }]))]));
    default:
      return state;
  }
};
 const reducer = ((0,external_wp_data_namespaceObject.combineReducers)({
  items,
  itemIsComplete,
  queries
}));
;
function terms(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_TERMS':
      return {
        ...state,
        [action.taxonomy]: action.terms
      };
  }
  return state;
}
function users(state = {
  byId: {},
  queries: {}
}, action) {
  switch (action.type) {
    case 'RECEIVE_USER_QUERY':
      return {
        byId: {
          ...state.byId,
          ...action.users.reduce((newUsers, user) => ({
            ...newUsers,
            [user.id]: user
          }), {})
        },
        queries: {
          ...state.queries,
          [action.queryID]: action.users.map(user => user.id)
        }
      };
  }
  return state;
}
function currentUser(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_CURRENT_USER':
      return action.currentUser;
  }
  return state;
}
function taxonomies(state = [], action) {
  switch (action.type) {
    case 'RECEIVE_TAXONOMIES':
      return action.taxonomies;
  }
  return state;
}
function currentTheme(state = undefined, action) {
  switch (action.type) {
    case 'RECEIVE_CURRENT_THEME':
      return action.currentTheme.stylesheet;
  }
  return state;
}
function currentGlobalStylesId(state = undefined, action) {
  switch (action.type) {
    case 'RECEIVE_CURRENT_GLOBAL_STYLES_ID':
      return action.id;
  }
  return state;
}
function themeBaseGlobalStyles(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_THEME_GLOBAL_STYLES':
      return {
        ...state,
        [action.stylesheet]: action.globalStyles
      };
  }
  return state;
}
function themeGlobalStyleVariations(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_THEME_GLOBAL_STYLE_VARIATIONS':
      return {
        ...state,
        [action.stylesheet]: action.variations
      };
  }
  return state;
}
const withMultiEntityRecordEdits = reducer => (state, action) => {
  if (action.type === 'UNDO' || action.type === 'REDO') {
    const {
      record
    } = action;
    let newState = state;
    record.forEach(({
      id: {
        kind,
        name,
        recordId
      },
      changes
    }) => {
      newState = reducer(newState, {
        type: 'EDIT_ENTITY_RECORD',
        kind,
        name,
        recordId,
        edits: Object.entries(changes).reduce((acc, [key, value]) => {
          acc[key] = action.type === 'UNDO' ? value.from : value.to;
          return acc;
        }, {})
      });
    });
    return newState;
  }
  return reducer(state, action);
};
function entity(entityConfig) {
  return (0,external_wp_compose_namespaceObject.compose)([withMultiEntityRecordEdits,
  if_matching_action(action => action.name && action.kind && action.name === entityConfig.name && action.kind === entityConfig.kind),
  replace_action(action => {
    return {
      key: entityConfig.key || DEFAULT_ENTITY_KEY,
      ...action
    };
  })])((0,external_wp_data_namespaceObject.combineReducers)({
    queriedData: reducer,
    edits: (state = {}, action) => {
      var _action$query$context;
      switch (action.type) {
        case 'RECEIVE_ITEMS':
          const context = (_action$query$context = action?.query?.context) !== null && _action$query$context !== void 0 ? _action$query$context : 'default';
          if (context !== 'default') {
            return state;
          }
          const nextState = {
            ...state
          };
          for (const record of action.items) {
            const recordId = record?.[action.key];
            const edits = nextState[recordId];
            if (!edits) {
              continue;
            }
            const nextEdits = Object.keys(edits).reduce((acc, key) => {
              var _record$key$raw;
              if (
              !es6_default()(edits[key], (_record$key$raw = record[key]?.raw) !== null && _record$key$raw !== void 0 ? _record$key$raw : record[key]) && (
              !action.persistedEdits || !es6_default()(edits[key], action.persistedEdits[key]))) {
                acc[key] = edits[key];
              }
              return acc;
            }, {});
            if (Object.keys(nextEdits).length) {
              nextState[recordId] = nextEdits;
            } else {
              delete nextState[recordId];
            }
          }
          return nextState;
        case 'EDIT_ENTITY_RECORD':
          const nextEdits = {
            ...state[action.recordId],
            ...action.edits
          };
          Object.keys(nextEdits).forEach(key => {
            if (nextEdits[key] === undefined) {
              delete nextEdits[key];
            }
          });
          return {
            ...state,
            [action.recordId]: nextEdits
          };
      }
      return state;
    },
    saving: (state = {}, action) => {
      switch (action.type) {
        case 'SAVE_ENTITY_RECORD_START':
        case 'SAVE_ENTITY_RECORD_FINISH':
          return {
            ...state,
            [action.recordId]: {
              pending: action.type === 'SAVE_ENTITY_RECORD_START',
              error: action.error,
              isAutosave: action.isAutosave
            }
          };
      }
      return state;
    },
    deleting: (state = {}, action) => {
      switch (action.type) {
        case 'DELETE_ENTITY_RECORD_START':
        case 'DELETE_ENTITY_RECORD_FINISH':
          return {
            ...state,
            [action.recordId]: {
              pending: action.type === 'DELETE_ENTITY_RECORD_START',
              error: action.error
            }
          };
      }
      return state;
    },
    revisions: (state = {}, action) => {
      if (action.type === 'RECEIVE_ITEM_REVISIONS') {
        const recordKey = action.recordKey;
        delete action.recordKey;
        const newState = reducer(state[recordKey], {
          ...action,
          type: 'RECEIVE_ITEMS'
        });
        return {
          ...state,
          [recordKey]: newState
        };
      }
      if (action.type === 'REMOVE_ITEMS') {
        return Object.fromEntries(Object.entries(state).filter(([id]) => !action.itemIds.some(itemId => {
          if (Number.isInteger(itemId)) {
            return itemId === +id;
          }
          return itemId === id;
        })));
      }
      return state;
    }
  }));
}
function entitiesConfig(state = rootEntitiesConfig, action) {
  switch (action.type) {
    case 'ADD_ENTITIES':
      return [...state, ...action.entities];
  }
  return state;
}
const entities = (state = {}, action) => {
  const newConfig = entitiesConfig(state.config, action);
  let entitiesDataReducer = state.reducer;
  if (!entitiesDataReducer || newConfig !== state.config) {
    const entitiesByKind = newConfig.reduce((acc, record) => {
      const {
        kind
      } = record;
      if (!acc[kind]) {
        acc[kind] = [];
      }
      acc[kind].push(record);
      return acc;
    }, {});
    entitiesDataReducer = (0,external_wp_data_namespaceObject.combineReducers)(Object.entries(entitiesByKind).reduce((memo, [kind, subEntities]) => {
      const kindReducer = (0,external_wp_data_namespaceObject.combineReducers)(subEntities.reduce((kindMemo, entityConfig) => ({
        ...kindMemo,
        [entityConfig.name]: entity(entityConfig)
      }), {}));
      memo[kind] = kindReducer;
      return memo;
    }, {}));
  }
  const newData = entitiesDataReducer(state.records, action);
  if (newData === state.records && newConfig === state.config && entitiesDataReducer === state.reducer) {
    return state;
  }
  return {
    reducer: entitiesDataReducer,
    records: newData,
    config: newConfig
  };
};
function undoManager(state = createUndoManager()) {
  return state;
}
function editsReference(state = {}, action) {
  switch (action.type) {
    case 'EDIT_ENTITY_RECORD':
    case 'UNDO':
    case 'REDO':
      return {};
  }
  return state;
}
function embedPreviews(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_EMBED_PREVIEW':
      const {
        url,
        preview
      } = action;
      return {
        ...state,
        [url]: preview
      };
  }
  return state;
}
function userPermissions(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_USER_PERMISSION':
      return {
        ...state,
        [action.key]: action.isAllowed
      };
    case 'RECEIVE_USER_PERMISSIONS':
      return {
        ...state,
        ...action.permissions
      };
  }
  return state;
}
function autosaves(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_AUTOSAVES':
      const {
        postId,
        autosaves: autosavesData
      } = action;
      return {
        ...state,
        [postId]: autosavesData
      };
  }
  return state;
}
function blockPatterns(state = [], action) {
  switch (action.type) {
    case 'RECEIVE_BLOCK_PATTERNS':
      return action.patterns;
  }
  return state;
}
function blockPatternCategories(state = [], action) {
  switch (action.type) {
    case 'RECEIVE_BLOCK_PATTERN_CATEGORIES':
      return action.categories;
  }
  return state;
}
function userPatternCategories(state = [], action) {
  switch (action.type) {
    case 'RECEIVE_USER_PATTERN_CATEGORIES':
      return action.patternCategories;
  }
  return state;
}
function navigationFallbackId(state = null, action) {
  switch (action.type) {
    case 'RECEIVE_NAVIGATION_FALLBACK_ID':
      return action.fallbackId;
  }
  return state;
}
function themeGlobalStyleRevisions(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_THEME_GLOBAL_STYLE_REVISIONS':
      return {
        ...state,
        [action.currentId]: action.revisions
      };
  }
  return state;
}
function defaultTemplates(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_DEFAULT_TEMPLATE':
      return {
        ...state,
        [JSON.stringify(action.query)]: action.templateId
      };
  }
  return state;
}
function registeredPostMeta(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_REGISTERED_POST_META':
      return {
        ...state,
        [action.postType]: action.registeredPostMeta
      };
  }
  return state;
}
 const build_module_reducer = ((0,external_wp_data_namespaceObject.combineReducers)({
  terms,
  users,
  currentTheme,
  currentGlobalStylesId,
  currentUser,
  themeGlobalStyleVariations,
  themeBaseGlobalStyles,
  themeGlobalStyleRevisions,
  taxonomies,
  entities,
  editsReference,
  undoManager,
  embedPreviews,
  userPermissions,
  autosaves,
  blockPatterns,
  blockPatternCategories,
  userPatternCategories,
  navigationFallbackId,
  defaultTemplates,
  registeredPostMeta
}));
;
const external_wp_deprecated_namespaceObject = window["wp"]["deprecated"];
var external_wp_deprecated_default = __webpack_require__.n(external_wp_deprecated_namespaceObject);
;
const STORE_NAME = 'core';
var equivalent_key_map = __webpack_require__(3249);
var equivalent_key_map_default = __webpack_require__.n(equivalent_key_map);
;
function setNestedValue(object, path, value) {
  if (!object || typeof object !== 'object') {
    return object;
  }
  const normalizedPath = Array.isArray(path) ? path : path.split('.');
  normalizedPath.reduce((acc, key, idx) => {
    if (acc[key] === undefined) {
      if (Number.isInteger(normalizedPath[idx + 1])) {
        acc[key] = [];
      } else {
        acc[key] = {};
      }
    }
    if (idx === normalizedPath.length - 1) {
      acc[key] = value;
    }
    return acc[key];
  }, object);
  return object;
}
;
const queriedItemsCacheByState = new WeakMap();
function getQueriedItemsUncached(state, query) {
  const {
    stableKey,
    page,
    perPage,
    include,
    fields,
    context
  } = get_query_parts(query);
  let itemIds;
  if (state.queries?.[context]?.[stableKey]) {
    itemIds = state.queries[context][stableKey].itemIds;
  }
  if (!itemIds) {
    return null;
  }
  const startOffset = perPage === -1 ? 0 : (page - 1) * perPage;
  const endOffset = perPage === -1 ? itemIds.length : Math.min(startOffset + perPage, itemIds.length);
  const items = [];
  for (let i = startOffset; i < endOffset; i++) {
    const itemId = itemIds[i];
    if (Array.isArray(include) && !include.includes(itemId)) {
      continue;
    }
    if (itemId === undefined) {
      continue;
    }
    if (!state.items[context]?.hasOwnProperty(itemId)) {
      return null;
    }
    const item = state.items[context][itemId];
    let filteredItem;
    if (Array.isArray(fields)) {
      filteredItem = {};
      for (let f = 0; f < fields.length; f++) {
        const field = fields[f].split('.');
        let value = item;
        field.forEach(fieldName => {
          value = value?.[fieldName];
        });
        setNestedValue(filteredItem, field, value);
      }
    } else {
      if (!state.itemIsComplete[context]?.[itemId]) {
        return null;
      }
      filteredItem = item;
    }
    items.push(filteredItem);
  }
  return items;
}
const getQueriedItems = (0,external_wp_data_namespaceObject.createSelector)((state, query = {}) => {
  let queriedItemsCache = queriedItemsCacheByState.get(state);
  if (queriedItemsCache) {
    const queriedItems = queriedItemsCache.get(query);
    if (queriedItems !== undefined) {
      return queriedItems;
    }
  } else {
    queriedItemsCache = new (equivalent_key_map_default())();
    queriedItemsCacheByState.set(state, queriedItemsCache);
  }
  const items = getQueriedItemsUncached(state, query);
  queriedItemsCache.set(query, items);
  return items;
});
function getQueriedTotalItems(state, query = {}) {
  var _state$queries$contex;
  const {
    stableKey,
    context
  } = get_query_parts(query);
  return (_state$queries$contex = state.queries?.[context]?.[stableKey]?.meta?.totalItems) !== null && _state$queries$contex !== void 0 ? _state$queries$contex : null;
}
function getQueriedTotalPages(state, query = {}) {
  var _state$queries$contex2;
  const {
    stableKey,
    context
  } = get_query_parts(query);
  return (_state$queries$contex2 = state.queries?.[context]?.[stableKey]?.meta?.totalPages) !== null && _state$queries$contex2 !== void 0 ? _state$queries$contex2 : null;
}
;
function isNumericID(id) {
  return /^\s*\d+\s*$/.test(id);
}
;
function isRawAttribute(entity, attribute) {
  return (entity.rawAttributes || []).includes(attribute);
}
;
const ALLOWED_RESOURCE_ACTIONS = ['create', 'read', 'update', 'delete'];
function getUserPermissionsFromAllowHeader(allowedMethods) {
  const permissions = {};
  if (!allowedMethods) {
    return permissions;
  }
  const methods = {
    create: 'POST',
    read: 'GET',
    update: 'PUT',
    delete: 'DELETE'
  };
  for (const [actionName, methodName] of Object.entries(methods)) {
    permissions[actionName] = allowedMethods.includes(methodName);
  }
  return permissions;
}
function getUserPermissionCacheKey(action, resource, id) {
  const key = (typeof resource === 'object' ? [action, resource.kind, resource.name, resource.id] : [action, resource, id]).filter(Boolean).join('/');
  return key;
}
;
const EMPTY_OBJECT = {};
const isRequestingEmbedPreview = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, url) => {
  return select(STORE_NAME).isResolving('getEmbedPreview', [url]);
});
function getAuthors(state, query) {
  external_wp_deprecated_default()("select( 'core' ).getAuthors()", {
    since: '5.9',
    alternative: "select( 'core' ).getUsers({ who: 'authors' })"
  });
  const path = (0,external_wp_url_namespaceObject.addQueryArgs)('/wp/v2/users/?who=authors&per_page=100', query);
  return getUserQueryResults(state, path);
}
function getCurrentUser(state) {
  return state.currentUser;
}
const getUserQueryResults = (0,external_wp_data_namespaceObject.createSelector)((state, queryID) => {
  var _state$users$queries$;
  const queryResults = (_state$users$queries$ = state.users.queries[queryID]) !== null && _state$users$queries$ !== void 0 ? _state$users$queries$ : [];
  return queryResults.map(id => state.users.byId[id]);
}, (state, queryID) => [state.users.queries[queryID], state.users.byId]);
function getEntitiesByKind(state, kind) {
  external_wp_deprecated_default()("wp.data.select( 'core' ).getEntitiesByKind()", {
    since: '6.0',
    alternative: "wp.data.select( 'core' ).getEntitiesConfig()"
  });
  return getEntitiesConfig(state, kind);
}
const getEntitiesConfig = (0,external_wp_data_namespaceObject.createSelector)((state, kind) => state.entities.config.filter(entity => entity.kind === kind), 
(state, kind) => state.entities.config
);
function getEntity(state, kind, name) {
  external_wp_deprecated_default()("wp.data.select( 'core' ).getEntity()", {
    since: '6.0',
    alternative: "wp.data.select( 'core' ).getEntityConfig()"
  });
  return getEntityConfig(state, kind, name);
}
function getEntityConfig(state, kind, name) {
  return state.entities.config?.find(config => config.kind === kind && config.name === name);
}
const getEntityRecord = (0,external_wp_data_namespaceObject.createSelector)((state, kind, name, key, query) => {
  var _query$context;
  const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
  if (!queriedState) {
    return undefined;
  }
  const context = (_query$context = query?.context) !== null && _query$context !== void 0 ? _query$context : 'default';
  if (query === undefined) {
    if (!queriedState.itemIsComplete[context]?.[key]) {
      return undefined;
    }
    return queriedState.items[context][key];
  }
  const item = queriedState.items[context]?.[key];
  if (item && query._fields) {
    var _getNormalizedCommaSe;
    const filteredItem = {};
    const fields = (_getNormalizedCommaSe = get_normalized_comma_separable(query._fields)) !== null && _getNormalizedCommaSe !== void 0 ? _getNormalizedCommaSe : [];
    for (let f = 0; f < fields.length; f++) {
      const field = fields[f].split('.');
      let value = item;
      field.forEach(fieldName => {
        value = value?.[fieldName];
      });
      setNestedValue(filteredItem, field, value);
    }
    return filteredItem;
  }
  return item;
}, (state, kind, name, recordId, query) => {
  var _query$context2;
  const context = (_query$context2 = query?.context) !== null && _query$context2 !== void 0 ? _query$context2 : 'default';
  return [state.entities.records?.[kind]?.[name]?.queriedData?.items[context]?.[recordId], state.entities.records?.[kind]?.[name]?.queriedData?.itemIsComplete[context]?.[recordId]];
});
getEntityRecord.__unstableNormalizeArgs = args => {
  const newArgs = [...args];
  const recordKey = newArgs?.[2];
  newArgs[2] = isNumericID(recordKey) ? Number(recordKey) : recordKey;
  return newArgs;
};
function __experimentalGetEntityRecordNoResolver(state, kind, name, key) {
  return getEntityRecord(state, kind, name, key);
}
const getRawEntityRecord = (0,external_wp_data_namespaceObject.createSelector)((state, kind, name, key) => {
  const record = getEntityRecord(state, kind, name, key);
  return record && Object.keys(record).reduce((accumulator, _key) => {
    if (isRawAttribute(getEntityConfig(state, kind, name), _key)) {
      accumulator[_key] = record[_key]?.raw !== undefined ? record[_key]?.raw : record[_key];
    } else {
      accumulator[_key] = record[_key];
    }
    return accumulator;
  }, {});
}, (state, kind, name, recordId, query) => {
  var _query$context3;
  const context = (_query$context3 = query?.context) !== null && _query$context3 !== void 0 ? _query$context3 : 'default';
  return [state.entities.config, state.entities.records?.[kind]?.[name]?.queriedData?.items[context]?.[recordId], state.entities.records?.[kind]?.[name]?.queriedData?.itemIsComplete[context]?.[recordId]];
});
function hasEntityRecords(state, kind, name, query) {
  return Array.isArray(getEntityRecords(state, kind, name, query));
}
const getEntityRecords = (state, kind, name, query) => {
  const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
  if (!queriedState) {
    return null;
  }
  return getQueriedItems(queriedState, query);
};
const getEntityRecordsTotalItems = (state, kind, name, query) => {
  const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
  if (!queriedState) {
    return null;
  }
  return getQueriedTotalItems(queriedState, query);
};
const getEntityRecordsTotalPages = (state, kind, name, query) => {
  const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
  if (!queriedState) {
    return null;
  }
  if (query.per_page === -1) {
    return 1;
  }
  const totalItems = getQueriedTotalItems(queriedState, query);
  if (!totalItems) {
    return totalItems;
  }
  if (!query.per_page) {
    return getQueriedTotalPages(queriedState, query);
  }
  return Math.ceil(totalItems / query.per_page);
};
const __experimentalGetDirtyEntityRecords = (0,external_wp_data_namespaceObject.createSelector)(state => {
  const {
    entities: {
      records
    }
  } = state;
  const dirtyRecords = [];
  Object.keys(records).forEach(kind => {
    Object.keys(records[kind]).forEach(name => {
      const primaryKeys = Object.keys(records[kind][name].edits).filter(primaryKey =>
      getEntityRecord(state, kind, name, primaryKey) && hasEditsForEntityRecord(state, kind, name, primaryKey));
      if (primaryKeys.length) {
        const entityConfig = getEntityConfig(state, kind, name);
        primaryKeys.forEach(primaryKey => {
          const entityRecord = getEditedEntityRecord(state, kind, name, primaryKey);
          dirtyRecords.push({
            key: entityRecord ? entityRecord[entityConfig.key || DEFAULT_ENTITY_KEY] : undefined,
            title: entityConfig?.getTitle?.(entityRecord) || '',
            name,
            kind
          });
        });
      }
    });
  });
  return dirtyRecords;
}, state => [state.entities.records]);
const __experimentalGetEntitiesBeingSaved = (0,external_wp_data_namespaceObject.createSelector)(state => {
  const {
    entities: {
      records
    }
  } = state;
  const recordsBeingSaved = [];
  Object.keys(records).forEach(kind => {
    Object.keys(records[kind]).forEach(name => {
      const primaryKeys = Object.keys(records[kind][name].saving).filter(primaryKey => isSavingEntityRecord(state, kind, name, primaryKey));
      if (primaryKeys.length) {
        const entityConfig = getEntityConfig(state, kind, name);
        primaryKeys.forEach(primaryKey => {
          const entityRecord = getEditedEntityRecord(state, kind, name, primaryKey);
          recordsBeingSaved.push({
            key: entityRecord ? entityRecord[entityConfig.key || DEFAULT_ENTITY_KEY] : undefined,
            title: entityConfig?.getTitle?.(entityRecord) || '',
            name,
            kind
          });
        });
      }
    });
  });
  return recordsBeingSaved;
}, state => [state.entities.records]);
function getEntityRecordEdits(state, kind, name, recordId) {
  return state.entities.records?.[kind]?.[name]?.edits?.[recordId];
}
const getEntityRecordNonTransientEdits = (0,external_wp_data_namespaceObject.createSelector)((state, kind, name, recordId) => {
  const {
    transientEdits
  } = getEntityConfig(state, kind, name) || {};
  const edits = getEntityRecordEdits(state, kind, name, recordId) || {};
  if (!transientEdits) {
    return edits;
  }
  return Object.keys(edits).reduce((acc, key) => {
    if (!transientEdits[key]) {
      acc[key] = edits[key];
    }
    return acc;
  }, {});
}, (state, kind, name, recordId) => [state.entities.config, state.entities.records?.[kind]?.[name]?.edits?.[recordId]]);
function hasEditsForEntityRecord(state, kind, name, recordId) {
  return isSavingEntityRecord(state, kind, name, recordId) || Object.keys(getEntityRecordNonTransientEdits(state, kind, name, recordId)).length > 0;
}
const getEditedEntityRecord = (0,external_wp_data_namespaceObject.createSelector)((state, kind, name, recordId) => {
  const raw = getRawEntityRecord(state, kind, name, recordId);
  const edited = getEntityRecordEdits(state, kind, name, recordId);
  if (!raw && !edited) {
    return false;
  }
  return {
    ...raw,
    ...edited
  };
}, (state, kind, name, recordId, query) => {
  var _query$context4;
  const context = (_query$context4 = query?.context) !== null && _query$context4 !== void 0 ? _query$context4 : 'default';
  return [state.entities.config, state.entities.records?.[kind]?.[name]?.queriedData.items[context]?.[recordId], state.entities.records?.[kind]?.[name]?.queriedData.itemIsComplete[context]?.[recordId], state.entities.records?.[kind]?.[name]?.edits?.[recordId]];
});
function isAutosavingEntityRecord(state, kind, name, recordId) {
  var _state$entities$recor;
  const {
    pending,
    isAutosave
  } = (_state$entities$recor = state.entities.records?.[kind]?.[name]?.saving?.[recordId]) !== null && _state$entities$recor !== void 0 ? _state$entities$recor : {};
  return Boolean(pending && isAutosave);
}
function isSavingEntityRecord(state, kind, name, recordId) {
  var _state$entities$recor2;
  return (_state$entities$recor2 = state.entities.records?.[kind]?.[name]?.saving?.[recordId]?.pending) !== null && _state$entities$recor2 !== void 0 ? _state$entities$recor2 : false;
}
function isDeletingEntityRecord(state, kind, name, recordId) {
  var _state$entities$recor3;
  return (_state$entities$recor3 = state.entities.records?.[kind]?.[name]?.deleting?.[recordId]?.pending) !== null && _state$entities$recor3 !== void 0 ? _state$entities$recor3 : false;
}
function getLastEntitySaveError(state, kind, name, recordId) {
  return state.entities.records?.[kind]?.[name]?.saving?.[recordId]?.error;
}
function getLastEntityDeleteError(state, kind, name, recordId) {
  return state.entities.records?.[kind]?.[name]?.deleting?.[recordId]?.error;
}
function getUndoEdit(state) {
  external_wp_deprecated_default()("select( 'core' ).getUndoEdit()", {
    since: '6.3'
  });
  return undefined;
}
function getRedoEdit(state) {
  external_wp_deprecated_default()("select( 'core' ).getRedoEdit()", {
    since: '6.3'
  });
  return undefined;
}
function hasUndo(state) {
  return state.undoManager.hasUndo();
}
function hasRedo(state) {
  return state.undoManager.hasRedo();
}
function getCurrentTheme(state) {
  if (!state.currentTheme) {
    return null;
  }
  return getEntityRecord(state, 'root', 'theme', state.currentTheme);
}
function __experimentalGetCurrentGlobalStylesId(state) {
  return state.currentGlobalStylesId;
}
function getThemeSupports(state) {
  var _getCurrentTheme$them;
  return (_getCurrentTheme$them = getCurrentTheme(state)?.theme_supports) !== null && _getCurrentTheme$them !== void 0 ? _getCurrentTheme$them : EMPTY_OBJECT;
}
function getEmbedPreview(state, url) {
  return state.embedPreviews[url];
}
function isPreviewEmbedFallback(state, url) {
  const preview = state.embedPreviews[url];
  const oEmbedLinkCheck = '<a href="' + url + '">' + url + '</a>';
  if (!preview) {
    return false;
  }
  return preview.html === oEmbedLinkCheck;
}
function canUser(state, action, resource, id) {
  const isEntity = typeof resource === 'object';
  if (isEntity && (!resource.kind || !resource.name)) {
    return false;
  }
  const key = getUserPermissionCacheKey(action, resource, id);
  return state.userPermissions[key];
}
function canUserEditEntityRecord(state, kind, name, recordId) {
  external_wp_deprecated_default()(`wp.data.select( 'core' ).canUserEditEntityRecord()`, {
    since: '6.7',
    alternative: `wp.data.select( 'core' ).canUser( 'update', { kind, name, id } )`
  });
  return canUser(state, 'update', {
    kind,
    name,
    id: recordId
  });
}
function getAutosaves(state, postType, postId) {
  return state.autosaves[postId];
}
function getAutosave(state, postType, postId, authorId) {
  if (authorId === undefined) {
    return;
  }
  const autosaves = state.autosaves[postId];
  return autosaves?.find(autosave => autosave.author === authorId);
}
const hasFetchedAutosaves = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, postType, postId) => {
  return select(STORE_NAME).hasFinishedResolution('getAutosaves', [postType, postId]);
});
function getReferenceByDistinctEdits(state) {
  return state.editsReference;
}
function __experimentalGetCurrentThemeBaseGlobalStyles(state) {
  const currentTheme = getCurrentTheme(state);
  if (!currentTheme) {
    return null;
  }
  return state.themeBaseGlobalStyles[currentTheme.stylesheet];
}
function __experimentalGetCurrentThemeGlobalStylesVariations(state) {
  const currentTheme = getCurrentTheme(state);
  if (!currentTheme) {
    return null;
  }
  return state.themeGlobalStyleVariations[currentTheme.stylesheet];
}
function getBlockPatterns(state) {
  return state.blockPatterns;
}
function getBlockPatternCategories(state) {
  return state.blockPatternCategories;
}
function getUserPatternCategories(state) {
  return state.userPatternCategories;
}
function getCurrentThemeGlobalStylesRevisions(state) {
  external_wp_deprecated_default()("select( 'core' ).getCurrentThemeGlobalStylesRevisions()", {
    since: '6.5.0',
    alternative: "select( 'core' ).getRevisions( 'root', 'globalStyles', ${ recordKey } )"
  });
  const currentGlobalStylesId = __experimentalGetCurrentGlobalStylesId(state);
  if (!currentGlobalStylesId) {
    return null;
  }
  return state.themeGlobalStyleRevisions[currentGlobalStylesId];
}
function getDefaultTemplateId(state, query) {
  return state.defaultTemplates[JSON.stringify(query)];
}
const getRevisions = (state, kind, name, recordKey, query) => {
  const queriedStateRevisions = state.entities.records?.[kind]?.[name]?.revisions?.[recordKey];
  if (!queriedStateRevisions) {
    return null;
  }
  return getQueriedItems(queriedStateRevisions, query);
};
const getRevision = (0,external_wp_data_namespaceObject.createSelector)((state, kind, name, recordKey, revisionKey, query) => {
  var _query$context5;
  const queriedState = state.entities.records?.[kind]?.[name]?.revisions?.[recordKey];
  if (!queriedState) {
    return undefined;
  }
  const context = (_query$context5 = query?.context) !== null && _query$context5 !== void 0 ? _query$context5 : 'default';
  if (query === undefined) {
    if (!queriedState.itemIsComplete[context]?.[revisionKey]) {
      return undefined;
    }
    return queriedState.items[context][revisionKey];
  }
  const item = queriedState.items[context]?.[revisionKey];
  if (item && query._fields) {
    var _getNormalizedCommaSe2;
    const filteredItem = {};
    const fields = (_getNormalizedCommaSe2 = get_normalized_comma_separable(query._fields)) !== null && _getNormalizedCommaSe2 !== void 0 ? _getNormalizedCommaSe2 : [];
    for (let f = 0; f < fields.length; f++) {
      const field = fields[f].split('.');
      let value = item;
      field.forEach(fieldName => {
        value = value?.[fieldName];
      });
      setNestedValue(filteredItem, field, value);
    }
    return filteredItem;
  }
  return item;
}, (state, kind, name, recordKey, revisionKey, query) => {
  var _query$context6;
  const context = (_query$context6 = query?.context) !== null && _query$context6 !== void 0 ? _query$context6 : 'default';
  return [state.entities.records?.[kind]?.[name]?.revisions?.[recordKey]?.items?.[context]?.[revisionKey], state.entities.records?.[kind]?.[name]?.revisions?.[recordKey]?.itemIsComplete?.[context]?.[revisionKey]];
});
;
const external_wp_privateApis_namespaceObject = window["wp"]["privateApis"];
;
const {
  lock,
  unlock
} = (0,external_wp_privateApis_namespaceObject.__dangerousOptInToUnstableAPIsOnlyForCoreModules)('I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.', '@wordpress/core-data');
;
function getUndoManager(state) {
  return state.undoManager;
}
function getNavigationFallbackId(state) {
  return state.navigationFallbackId;
}
const getBlockPatternsForPostType = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (0,external_wp_data_namespaceObject.createSelector)((state, postType) => select(STORE_NAME).getBlockPatterns().filter(({
  postTypes
}) => !postTypes || Array.isArray(postTypes) && postTypes.includes(postType)), () => [select(STORE_NAME).getBlockPatterns()]));
const getEntityRecordsPermissions = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (0,external_wp_data_namespaceObject.createSelector)((state, kind, name, ids) => {
  const normalizedIds = Array.isArray(ids) ? ids : [ids];
  return normalizedIds.map(id => ({
    delete: select(STORE_NAME).canUser('delete', {
      kind,
      name,
      id
    }),
    update: select(STORE_NAME).canUser('update', {
      kind,
      name,
      id
    })
  }));
}, state => [state.userPermissions]));
function getEntityRecordPermissions(state, kind, name, id) {
  return getEntityRecordsPermissions(state, kind, name, id)[0];
}
function getRegisteredPostMeta(state, postType) {
  var _state$registeredPost;
  return (_state$registeredPost = state.registeredPostMeta?.[postType]) !== null && _state$registeredPost !== void 0 ? _state$registeredPost : {};
}
function normalizePageId(value) {
  if (!value || !['number', 'string'].includes(typeof value)) {
    return null;
  }
  if (Number(value) === 0) {
    return null;
  }
  return value.toString();
}
const getHomePage = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (0,external_wp_data_namespaceObject.createSelector)(() => {
  const siteData = select(STORE_NAME).getEntityRecord('root', '__unstableBase');
  if (!siteData) {
    return null;
  }
  const homepageId = siteData?.show_on_front === 'page' ? normalizePageId(siteData.page_on_front) : null;
  if (homepageId) {
    return {
      postType: 'page',
      postId: homepageId
    };
  }
  const frontPageTemplateId = select(STORE_NAME).getDefaultTemplateId({
    slug: 'front-page'
  });
  return {
    postType: 'wp_template',
    postId: frontPageTemplateId
  };
}, state => [getEntityRecord(state, 'root', '__unstableBase'), getDefaultTemplateId(state, {
  slug: 'front-page'
})]));
const getPostsPageId = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => () => {
  const siteData = select(STORE_NAME).getEntityRecord('root', '__unstableBase');
  return siteData?.show_on_front === 'page' ? normalizePageId(siteData.page_for_posts) : null;
});
const getTemplateId = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, postType, postId) => {
  const homepage = unlock(select(STORE_NAME)).getHomePage();
  if (!homepage) {
    return;
  }
  if (postType === 'page' && postType === homepage?.postType && postId.toString() === homepage?.postId) {
    const templates = select(STORE_NAME).getEntityRecords('postType', 'wp_template', {
      per_page: -1
    });
    if (!templates) {
      return;
    }
    const id = templates.find(({
      slug
    }) => slug === 'front-page')?.id;
    if (id) {
      return id;
    }
  }
  const editedEntity = select(STORE_NAME).getEditedEntityRecord('postType', postType, postId);
  if (!editedEntity) {
    return;
  }
  const postsPageId = unlock(select(STORE_NAME)).getPostsPageId();
  if (postType === 'page' && postsPageId === postId.toString()) {
    return select(STORE_NAME).getDefaultTemplateId({
      slug: 'home'
    });
  }
  const currentTemplateSlug = editedEntity.template;
  if (currentTemplateSlug) {
    const currentTemplate = select(STORE_NAME).getEntityRecords('postType', 'wp_template', {
      per_page: -1
    })?.find(({
      slug
    }) => slug === currentTemplateSlug);
    if (currentTemplate) {
      return currentTemplate.id;
    }
  }
  let slugToCheck;
  if (editedEntity.slug) {
    slugToCheck = postType === 'page' ? `${postType}-${editedEntity.slug}` : `single-${postType}-${editedEntity.slug}`;
  } else {
    slugToCheck = postType === 'page' ? 'page' : `single-${postType}`;
  }
  return select(STORE_NAME).getDefaultTemplateId({
    slug: slugToCheck
  });
});
;
const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
 const esm_browser_native = ({
  randomUUID
});
;
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }
  return getRandomValues(rnds8);
}
;
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset); 
  if (!validate(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }
  return uuid;
}
 const esm_browser_stringify = (( null && (stringify)));
;
function v4(options, buf, offset) {
  if (esm_browser_native.randomUUID && !buf && !options) {
    return esm_browser_native.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)(); 
  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; 
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
 const esm_browser_v4 = (v4);
;
function getNestedValue(object, path, defaultValue) {
  if (!object || typeof object !== 'object' || typeof path !== 'string' && !Array.isArray(path)) {
    return object;
  }
  const normalizedPath = Array.isArray(path) ? path : path.split('.');
  let value = object;
  normalizedPath.forEach(fieldName => {
    value = value?.[fieldName];
  });
  return value !== undefined ? value : defaultValue;
}
;
function receiveItems(items, edits, meta) {
  return {
    type: 'RECEIVE_ITEMS',
    items: Array.isArray(items) ? items : [items],
    persistedEdits: edits,
    meta
  };
}
function removeItems(kind, name, records, invalidateCache = false) {
  return {
    type: 'REMOVE_ITEMS',
    itemIds: Array.isArray(records) ? records : [records],
    kind,
    name,
    invalidateCache
  };
}
function receiveQueriedItems(items, query = {}, edits, meta) {
  return {
    ...receiveItems(items, edits, meta),
    query
  };
}
;
let maxItems = null;
function chunk(arr, chunkSize) {
  const tmp = [...arr];
  const cache = [];
  while (tmp.length) {
    cache.push(tmp.splice(0, chunkSize));
  }
  return cache;
}
async function defaultProcessor(requests) {
  if (maxItems === null) {
    const preflightResponse = await external_wp_apiFetch_default()({
      path: '/batch/v1',
      method: 'OPTIONS'
    });
    maxItems = preflightResponse.endpoints[0].args.requests.maxItems;
  }
  const results = [];
  for (const batchRequests of chunk(requests, maxItems)) {
    const batchResponse = await external_wp_apiFetch_default()({
      path: '/batch/v1',
      method: 'POST',
      data: {
        validation: 'require-all-validate',
        requests: batchRequests.map(request => ({
          path: request.path,
          body: request.data,
          method: request.method,
          headers: request.headers
        }))
      }
    });
    let batchResults;
    if (batchResponse.failed) {
      batchResults = batchResponse.responses.map(response => ({
        error: response?.body
      }));
    } else {
      batchResults = batchResponse.responses.map(response => {
        const result = {};
        if (response.status >= 200 && response.status < 300) {
          result.output = response.body;
        } else {
          result.error = response.body;
        }
        return result;
      });
    }
    results.push(...batchResults);
  }
  return results;
}
;
function createBatch(processor = defaultProcessor) {
  let lastId = 0;
  let queue = [];
  const pending = new ObservableSet();
  return {
    add(inputOrThunk) {
      const id = ++lastId;
      pending.add(id);
      const add = input => new Promise((resolve, reject) => {
        queue.push({
          input,
          resolve,
          reject
        });
        pending.delete(id);
      });
      if (typeof inputOrThunk === 'function') {
        return Promise.resolve(inputOrThunk(add)).finally(() => {
          pending.delete(id);
        });
      }
      return add(inputOrThunk);
    },
    async run() {
      if (pending.size) {
        await new Promise(resolve => {
          const unsubscribe = pending.subscribe(() => {
            if (!pending.size) {
              unsubscribe();
              resolve(undefined);
            }
          });
        });
      }
      let results;
      try {
        results = await processor(queue.map(({
          input
        }) => input));
        if (results.length !== queue.length) {
          throw new Error('run: Array returned by processor must be same size as input array.');
        }
      } catch (error) {
        for (const {
          reject
        } of queue) {
          reject(error);
        }
        throw error;
      }
      let isSuccess = true;
      results.forEach((result, key) => {
        const queueItem = queue[key];
        if (result?.error) {
          queueItem?.reject(result.error);
          isSuccess = false;
        } else {
          var _result$output;
          queueItem?.resolve((_result$output = result?.output) !== null && _result$output !== void 0 ? _result$output : result);
        }
      });
      queue = [];
      return isSuccess;
    }
  };
}
class ObservableSet {
  constructor(...args) {
    this.set = new Set(...args);
    this.subscribers = new Set();
  }
  get size() {
    return this.set.size;
  }
  add(value) {
    this.set.add(value);
    this.subscribers.forEach(subscriber => subscriber());
    return this;
  }
  delete(value) {
    const isSuccess = this.set.delete(value);
    this.subscribers.forEach(subscriber => subscriber());
    return isSuccess;
  }
  subscribe(subscriber) {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }
}
;
function receiveUserQuery(queryID, users) {
  return {
    type: 'RECEIVE_USER_QUERY',
    users: Array.isArray(users) ? users : [users],
    queryID
  };
}
function receiveCurrentUser(currentUser) {
  return {
    type: 'RECEIVE_CURRENT_USER',
    currentUser
  };
}
function addEntities(entities) {
  return {
    type: 'ADD_ENTITIES',
    entities
  };
}
function receiveEntityRecords(kind, name, records, query, invalidateCache = false, edits, meta) {
  if (kind === 'postType') {
    records = (Array.isArray(records) ? records : [records]).map(record => record.status === 'auto-draft' ? {
      ...record,
      title: ''
    } : record);
  }
  let action;
  if (query) {
    action = receiveQueriedItems(records, query, edits, meta);
  } else {
    action = receiveItems(records, edits, meta);
  }
  return {
    ...action,
    kind,
    name,
    invalidateCache
  };
}
function receiveCurrentTheme(currentTheme) {
  return {
    type: 'RECEIVE_CURRENT_THEME',
    currentTheme
  };
}
function __experimentalReceiveCurrentGlobalStylesId(currentGlobalStylesId) {
  return {
    type: 'RECEIVE_CURRENT_GLOBAL_STYLES_ID',
    id: currentGlobalStylesId
  };
}
function __experimentalReceiveThemeBaseGlobalStyles(stylesheet, globalStyles) {
  return {
    type: 'RECEIVE_THEME_GLOBAL_STYLES',
    stylesheet,
    globalStyles
  };
}
function __experimentalReceiveThemeGlobalStyleVariations(stylesheet, variations) {
  return {
    type: 'RECEIVE_THEME_GLOBAL_STYLE_VARIATIONS',
    stylesheet,
    variations
  };
}
function receiveThemeSupports() {
  external_wp_deprecated_default()("wp.data.dispatch( 'core' ).receiveThemeSupports", {
    since: '5.9'
  });
  return {
    type: 'DO_NOTHING'
  };
}
function receiveThemeGlobalStyleRevisions(currentId, revisions) {
  external_wp_deprecated_default()("wp.data.dispatch( 'core' ).receiveThemeGlobalStyleRevisions()", {
    since: '6.5.0',
    alternative: "wp.data.dispatch( 'core' ).receiveRevisions"
  });
  return {
    type: 'RECEIVE_THEME_GLOBAL_STYLE_REVISIONS',
    currentId,
    revisions
  };
}
function receiveEmbedPreview(url, preview) {
  return {
    type: 'RECEIVE_EMBED_PREVIEW',
    url,
    preview
  };
}
const deleteEntityRecord = (kind, name, recordId, query, {
  __unstableFetch = (external_wp_apiFetch_default()),
  throwOnError = false
} = {}) => async ({
  dispatch,
  resolveSelect
}) => {
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.kind === kind && config.name === name);
  let error;
  let deletedRecord = false;
  if (!entityConfig) {
    return;
  }
  const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, ['entities', 'records', kind, name, recordId], {
    exclusive: true
  });
  try {
    dispatch({
      type: 'DELETE_ENTITY_RECORD_START',
      kind,
      name,
      recordId
    });
    let hasError = false;
    try {
      let path = `${entityConfig.baseURL}/${recordId}`;
      if (query) {
        path = (0,external_wp_url_namespaceObject.addQueryArgs)(path, query);
      }
      deletedRecord = await __unstableFetch({
        path,
        method: 'DELETE'
      });
      await dispatch(removeItems(kind, name, recordId, true));
    } catch (_error) {
      hasError = true;
      error = _error;
    }
    dispatch({
      type: 'DELETE_ENTITY_RECORD_FINISH',
      kind,
      name,
      recordId,
      error
    });
    if (hasError && throwOnError) {
      throw error;
    }
    return deletedRecord;
  } finally {
    dispatch.__unstableReleaseStoreLock(lock);
  }
};
const editEntityRecord = (kind, name, recordId, edits, options = {}) => ({
  select,
  dispatch
}) => {
  const entityConfig = select.getEntityConfig(kind, name);
  if (!entityConfig) {
    throw new Error(`The entity being edited (${kind}, ${name}) does not have a loaded config.`);
  }
  const {
    mergedEdits = {}
  } = entityConfig;
  const record = select.getRawEntityRecord(kind, name, recordId);
  const editedRecord = select.getEditedEntityRecord(kind, name, recordId);
  const edit = {
    kind,
    name,
    recordId,
    edits: Object.keys(edits).reduce((acc, key) => {
      const recordValue = record[key];
      const editedRecordValue = editedRecord[key];
      const value = mergedEdits[key] ? {
        ...editedRecordValue,
        ...edits[key]
      } : edits[key];
      acc[key] = es6_default()(recordValue, value) ? undefined : value;
      return acc;
    }, {})
  };
  if (window.__experimentalEnableSync && entityConfig.syncConfig) {
    if (false) {}
  } else {
    if (!options.undoIgnore) {
      select.getUndoManager().addRecord([{
        id: {
          kind,
          name,
          recordId
        },
        changes: Object.keys(edits).reduce((acc, key) => {
          acc[key] = {
            from: editedRecord[key],
            to: edits[key]
          };
          return acc;
        }, {})
      }], options.isCached);
    }
    dispatch({
      type: 'EDIT_ENTITY_RECORD',
      ...edit
    });
  }
};
const undo = () => ({
  select,
  dispatch
}) => {
  const undoRecord = select.getUndoManager().undo();
  if (!undoRecord) {
    return;
  }
  dispatch({
    type: 'UNDO',
    record: undoRecord
  });
};
const redo = () => ({
  select,
  dispatch
}) => {
  const redoRecord = select.getUndoManager().redo();
  if (!redoRecord) {
    return;
  }
  dispatch({
    type: 'REDO',
    record: redoRecord
  });
};
const __unstableCreateUndoLevel = () => ({
  select
}) => {
  select.getUndoManager().addRecord();
};
const saveEntityRecord = (kind, name, record, {
  isAutosave = false,
  __unstableFetch = (external_wp_apiFetch_default()),
  throwOnError = false
} = {}) => async ({
  select,
  resolveSelect,
  dispatch
}) => {
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.kind === kind && config.name === name);
  if (!entityConfig) {
    return;
  }
  const entityIdKey = entityConfig.key || DEFAULT_ENTITY_KEY;
  const recordId = record[entityIdKey];
  const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, ['entities', 'records', kind, name, recordId || esm_browser_v4()], {
    exclusive: true
  });
  try {
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'function') {
        const evaluatedValue = value(select.getEditedEntityRecord(kind, name, recordId));
        dispatch.editEntityRecord(kind, name, recordId, {
          [key]: evaluatedValue
        }, {
          undoIgnore: true
        });
        record[key] = evaluatedValue;
      }
    }
    dispatch({
      type: 'SAVE_ENTITY_RECORD_START',
      kind,
      name,
      recordId,
      isAutosave
    });
    let updatedRecord;
    let error;
    let hasError = false;
    try {
      const path = `${entityConfig.baseURL}${recordId ? '/' + recordId : ''}`;
      const persistedRecord = select.getRawEntityRecord(kind, name, recordId);
      if (isAutosave) {
        const currentUser = select.getCurrentUser();
        const currentUserId = currentUser ? currentUser.id : undefined;
        const autosavePost = await resolveSelect.getAutosave(persistedRecord.type, persistedRecord.id, currentUserId);
        let data = {
          ...persistedRecord,
          ...autosavePost,
          ...record
        };
        data = Object.keys(data).reduce((acc, key) => {
          if (['title', 'excerpt', 'content', 'meta'].includes(key)) {
            acc[key] = data[key];
          }
          return acc;
        }, {
          status: data.status === 'auto-draft' ? 'draft' : undefined
        });
        updatedRecord = await __unstableFetch({
          path: `${path}/autosaves`,
          method: 'POST',
          data
        });
        if (persistedRecord.id === updatedRecord.id) {
          let newRecord = {
            ...persistedRecord,
            ...data,
            ...updatedRecord
          };
          newRecord = Object.keys(newRecord).reduce((acc, key) => {
            if (['title', 'excerpt', 'content'].includes(key)) {
              acc[key] = newRecord[key];
            } else if (key === 'status') {
              acc[key] = persistedRecord.status === 'auto-draft' && newRecord.status === 'draft' ? newRecord.status : persistedRecord.status;
            } else {
              acc[key] = persistedRecord[key];
            }
            return acc;
          }, {});
          dispatch.receiveEntityRecords(kind, name, newRecord, undefined, true);
        } else {
          dispatch.receiveAutosaves(persistedRecord.id, updatedRecord);
        }
      } else {
        let edits = record;
        if (entityConfig.__unstablePrePersist) {
          edits = {
            ...edits,
            ...entityConfig.__unstablePrePersist(persistedRecord, edits)
          };
        }
        updatedRecord = await __unstableFetch({
          path,
          method: recordId ? 'PUT' : 'POST',
          data: edits
        });
        dispatch.receiveEntityRecords(kind, name, updatedRecord, undefined, true, edits);
      }
    } catch (_error) {
      hasError = true;
      error = _error;
    }
    dispatch({
      type: 'SAVE_ENTITY_RECORD_FINISH',
      kind,
      name,
      recordId,
      error,
      isAutosave
    });
    if (hasError && throwOnError) {
      throw error;
    }
    return updatedRecord;
  } finally {
    dispatch.__unstableReleaseStoreLock(lock);
  }
};
const __experimentalBatch = requests => async ({
  dispatch
}) => {
  const batch = createBatch();
  const api = {
    saveEntityRecord(kind, name, record, options) {
      return batch.add(add => dispatch.saveEntityRecord(kind, name, record, {
        ...options,
        __unstableFetch: add
      }));
    },
    saveEditedEntityRecord(kind, name, recordId, options) {
      return batch.add(add => dispatch.saveEditedEntityRecord(kind, name, recordId, {
        ...options,
        __unstableFetch: add
      }));
    },
    deleteEntityRecord(kind, name, recordId, query, options) {
      return batch.add(add => dispatch.deleteEntityRecord(kind, name, recordId, query, {
        ...options,
        __unstableFetch: add
      }));
    }
  };
  const resultPromises = requests.map(request => request(api));
  const [, ...results] = await Promise.all([batch.run(), ...resultPromises]);
  return results;
};
const saveEditedEntityRecord = (kind, name, recordId, options) => async ({
  select,
  dispatch,
  resolveSelect
}) => {
  if (!select.hasEditsForEntityRecord(kind, name, recordId)) {
    return;
  }
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.kind === kind && config.name === name);
  if (!entityConfig) {
    return;
  }
  const entityIdKey = entityConfig.key || DEFAULT_ENTITY_KEY;
  const edits = select.getEntityRecordNonTransientEdits(kind, name, recordId);
  const record = {
    [entityIdKey]: recordId,
    ...edits
  };
  return await dispatch.saveEntityRecord(kind, name, record, options);
};
const __experimentalSaveSpecifiedEntityEdits = (kind, name, recordId, itemsToSave, options) => async ({
  select,
  dispatch,
  resolveSelect
}) => {
  if (!select.hasEditsForEntityRecord(kind, name, recordId)) {
    return;
  }
  const edits = select.getEntityRecordNonTransientEdits(kind, name, recordId);
  const editsToSave = {};
  for (const item of itemsToSave) {
    setNestedValue(editsToSave, item, getNestedValue(edits, item));
  }
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.kind === kind && config.name === name);
  const entityIdKey = entityConfig?.key || DEFAULT_ENTITY_KEY;
  if (recordId) {
    editsToSave[entityIdKey] = recordId;
  }
  return await dispatch.saveEntityRecord(kind, name, editsToSave, options);
};
function receiveUploadPermissions(hasUploadPermissions) {
  external_wp_deprecated_default()("wp.data.dispatch( 'core' ).receiveUploadPermissions", {
    since: '5.9',
    alternative: 'receiveUserPermission'
  });
  return receiveUserPermission('create/media', hasUploadPermissions);
}
function receiveUserPermission(key, isAllowed) {
  return {
    type: 'RECEIVE_USER_PERMISSION',
    key,
    isAllowed
  };
}
function receiveUserPermissions(permissions) {
  return {
    type: 'RECEIVE_USER_PERMISSIONS',
    permissions
  };
}
function receiveAutosaves(postId, autosaves) {
  return {
    type: 'RECEIVE_AUTOSAVES',
    postId,
    autosaves: Array.isArray(autosaves) ? autosaves : [autosaves]
  };
}
function receiveNavigationFallbackId(fallbackId) {
  return {
    type: 'RECEIVE_NAVIGATION_FALLBACK_ID',
    fallbackId
  };
}
function receiveDefaultTemplateId(query, templateId) {
  return {
    type: 'RECEIVE_DEFAULT_TEMPLATE',
    query,
    templateId
  };
}
const receiveRevisions = (kind, name, recordKey, records, query, invalidateCache = false, meta) => async ({
  dispatch,
  resolveSelect
}) => {
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.kind === kind && config.name === name);
  const key = entityConfig && entityConfig?.revisionKey ? entityConfig.revisionKey : DEFAULT_ENTITY_KEY;
  dispatch({
    type: 'RECEIVE_ITEM_REVISIONS',
    key,
    items: Array.isArray(records) ? records : [records],
    recordKey,
    meta,
    query,
    kind,
    name,
    invalidateCache
  });
};
;
function receiveRegisteredPostMeta(postType, registeredPostMeta) {
  return {
    type: 'RECEIVE_REGISTERED_POST_META',
    postType,
    registeredPostMeta
  };
}
;
function camelCaseTransform(input, index) {
    if (index === 0)
        return input.toLowerCase();
    return pascalCaseTransform(input, index);
}
function camelCaseTransformMerge(input, index) {
    if (index === 0)
        return input.toLowerCase();
    return pascalCaseTransformMerge(input);
}
function camelCase(input, options) {
    if (options === void 0) { options = {}; }
    return pascalCase(input, __assign({ transform: camelCaseTransform }, options));
}
;
const external_wp_htmlEntities_namespaceObject = window["wp"]["htmlEntities"];
;
const forwardResolver = resolverName => (...args) => async ({
  resolveSelect
}) => {
  await resolveSelect[resolverName](...args);
};
 const forward_resolver = (forwardResolver);
;
const RECEIVE_INTERMEDIATE_RESULTS = Symbol('RECEIVE_INTERMEDIATE_RESULTS');
;
async function fetchLinkSuggestions(search, searchOptions = {}, editorSettings = {}) {
  const searchOptionsToUse = searchOptions.isInitialSuggestions && searchOptions.initialSuggestionsSearchOptions ? {
    ...searchOptions,
    ...searchOptions.initialSuggestionsSearchOptions
  } : searchOptions;
  const {
    type,
    subtype,
    page,
    perPage = searchOptions.isInitialSuggestions ? 3 : 20
  } = searchOptionsToUse;
  const {
    disablePostFormats = false
  } = editorSettings;
  const queries = [];
  if (!type || type === 'post') {
    queries.push(external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)('/wp/v2/search', {
        search,
        page,
        per_page: perPage,
        type: 'post',
        subtype
      })
    }).then(results => {
      return results.map(result => {
        return {
          id: result.id,
          url: result.url,
          title: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(result.title || '') || (0,external_wp_i18n_namespaceObject.__)('(no title)'),
          type: result.subtype || result.type,
          kind: 'post-type'
        };
      });
    }).catch(() => []) 
    );
  }
  if (!type || type === 'term') {
    queries.push(external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)('/wp/v2/search', {
        search,
        page,
        per_page: perPage,
        type: 'term',
        subtype
      })
    }).then(results => {
      return results.map(result => {
        return {
          id: result.id,
          url: result.url,
          title: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(result.title || '') || (0,external_wp_i18n_namespaceObject.__)('(no title)'),
          type: result.subtype || result.type,
          kind: 'taxonomy'
        };
      });
    }).catch(() => []) 
    );
  }
  if (!disablePostFormats && (!type || type === 'post-format')) {
    queries.push(external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)('/wp/v2/search', {
        search,
        page,
        per_page: perPage,
        type: 'post-format',
        subtype
      })
    }).then(results => {
      return results.map(result => {
        return {
          id: result.id,
          url: result.url,
          title: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(result.title || '') || (0,external_wp_i18n_namespaceObject.__)('(no title)'),
          type: result.subtype || result.type,
          kind: 'taxonomy'
        };
      });
    }).catch(() => []) 
    );
  }
  if (!type || type === 'attachment') {
    queries.push(external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)('/wp/v2/media', {
        search,
        page,
        per_page: perPage
      })
    }).then(results => {
      return results.map(result => {
        return {
          id: result.id,
          url: result.source_url,
          title: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(result.title.rendered || '') || (0,external_wp_i18n_namespaceObject.__)('(no title)'),
          type: result.type,
          kind: 'media'
        };
      });
    }).catch(() => []) 
    );
  }
  const responses = await Promise.all(queries);
  let results = responses.flat();
  results = results.filter(result => !!result.id);
  results = sortResults(results, search);
  results = results.slice(0, perPage);
  return results;
}
function sortResults(results, search) {
  const searchTokens = tokenize(search);
  const scores = {};
  for (const result of results) {
    if (result.title) {
      const titleTokens = tokenize(result.title);
      const exactMatchingTokens = titleTokens.filter(titleToken => searchTokens.some(searchToken => titleToken === searchToken));
      const subMatchingTokens = titleTokens.filter(titleToken => searchTokens.some(searchToken => titleToken !== searchToken && titleToken.includes(searchToken)));
      const exactMatchScore = exactMatchingTokens.length / titleTokens.length * 10;
      const subMatchScore = subMatchingTokens.length / titleTokens.length;
      scores[result.id] = exactMatchScore + subMatchScore;
    } else {
      scores[result.id] = 0;
    }
  }
  return results.sort((a, b) => scores[b.id] - scores[a.id]);
}
function tokenize(text) {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}
;
const CACHE = new Map();
const fetchUrlData = async (url, options = {}) => {
  const endpoint = '/wp-block-editor/v1/url-details';
  const args = {
    url: (0,external_wp_url_namespaceObject.prependHTTP)(url)
  };
  if (!(0,external_wp_url_namespaceObject.isURL)(url)) {
    return Promise.reject(`${url} is not a valid URL.`);
  }
  const protocol = (0,external_wp_url_namespaceObject.getProtocol)(url);
  if (!protocol || !(0,external_wp_url_namespaceObject.isValidProtocol)(protocol) || !protocol.startsWith('http') || !/^https?:\/\/[^\/\s]/i.test(url)) {
    return Promise.reject(`${url} does not have a valid protocol. URLs must be "http" based`);
  }
  if (CACHE.has(url)) {
    return CACHE.get(url);
  }
  return external_wp_apiFetch_default()({
    path: (0,external_wp_url_namespaceObject.addQueryArgs)(endpoint, args),
    ...options
  }).then(res => {
    CACHE.set(url, res);
    return res;
  });
};
 const _experimental_fetch_url_data = (fetchUrlData);
;
async function fetchBlockPatterns() {
  const restPatterns = await external_wp_apiFetch_default()({
    path: '/wp/v2/block-patterns/patterns'
  });
  if (!restPatterns) {
    return [];
  }
  return restPatterns.map(pattern => Object.fromEntries(Object.entries(pattern).map(([key, value]) => [camelCase(key), value])));
}
;
const resolvers_getAuthors = query => async ({
  dispatch
}) => {
  const path = (0,external_wp_url_namespaceObject.addQueryArgs)('/wp/v2/users/?who=authors&per_page=100', query);
  const users = await external_wp_apiFetch_default()({
    path
  });
  dispatch.receiveUserQuery(path, users);
};
const resolvers_getCurrentUser = () => async ({
  dispatch
}) => {
  const currentUser = await external_wp_apiFetch_default()({
    path: '/wp/v2/users/me'
  });
  dispatch.receiveCurrentUser(currentUser);
};
const resolvers_getEntityRecord = (kind, name, key = '', query) => async ({
  select,
  dispatch,
  registry,
  resolveSelect
}) => {
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.name === name && config.kind === kind);
  if (!entityConfig) {
    return;
  }
  const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, ['entities', 'records', kind, name, key], {
    exclusive: false
  });
  try {
    if (window.__experimentalEnableSync && entityConfig.syncConfig && !query) {
      if (false) {}
    } else {
      if (query !== undefined && query._fields) {
        query = {
          ...query,
          _fields: [...new Set([...(get_normalized_comma_separable(query._fields) || []), entityConfig.key || DEFAULT_ENTITY_KEY])].join()
        };
      }
      const path = (0,external_wp_url_namespaceObject.addQueryArgs)(entityConfig.baseURL + (key ? '/' + key : ''), {
        ...entityConfig.baseURLParams,
        ...query
      });
      if (query !== undefined && query._fields) {
        query = {
          ...query,
          include: [key]
        };
        const hasRecords = select.hasEntityRecords(kind, name, query);
        if (hasRecords) {
          return;
        }
      }
      const response = await external_wp_apiFetch_default()({
        path,
        parse: false
      });
      const record = await response.json();
      const permissions = getUserPermissionsFromAllowHeader(response.headers?.get('allow'));
      const canUserResolutionsArgs = [];
      const receiveUserPermissionArgs = {};
      for (const action of ALLOWED_RESOURCE_ACTIONS) {
        receiveUserPermissionArgs[getUserPermissionCacheKey(action, {
          kind,
          name,
          id: key
        })] = permissions[action];
        canUserResolutionsArgs.push([action, {
          kind,
          name,
          id: key
        }]);
      }
      registry.batch(() => {
        dispatch.receiveEntityRecords(kind, name, record, query);
        dispatch.receiveUserPermissions(receiveUserPermissionArgs);
        dispatch.finishResolutions('canUser', canUserResolutionsArgs);
      });
    }
  } finally {
    dispatch.__unstableReleaseStoreLock(lock);
  }
};
const resolvers_getRawEntityRecord = forward_resolver('getEntityRecord');
const resolvers_getEditedEntityRecord = forward_resolver('getEntityRecord');
const resolvers_getEntityRecords = (kind, name, query = {}) => async ({
  dispatch,
  registry,
  resolveSelect
}) => {
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.name === name && config.kind === kind);
  if (!entityConfig) {
    return;
  }
  const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, ['entities', 'records', kind, name], {
    exclusive: false
  });
  const key = entityConfig.key || DEFAULT_ENTITY_KEY;
  function getResolutionsArgs(records) {
    return records.filter(record => record?.[key]).map(record => [kind, name, record[key]]);
  }
  try {
    if (query._fields) {
      query = {
        ...query,
        _fields: [...new Set([...(get_normalized_comma_separable(query._fields) || []), entityConfig.key || DEFAULT_ENTITY_KEY])].join()
      };
    }
    const path = (0,external_wp_url_namespaceObject.addQueryArgs)(entityConfig.baseURL, {
      ...entityConfig.baseURLParams,
      ...query
    });
    let records = [],
      meta;
    if (entityConfig.supportsPagination && query.per_page !== -1) {
      const response = await external_wp_apiFetch_default()({
        path,
        parse: false
      });
      records = Object.values(await response.json());
      meta = {
        totalItems: parseInt(response.headers.get('X-WP-Total')),
        totalPages: parseInt(response.headers.get('X-WP-TotalPages'))
      };
    } else if (query.per_page === -1 && query[RECEIVE_INTERMEDIATE_RESULTS] === true) {
      let page = 1;
      let totalPages;
      do {
        const response = await external_wp_apiFetch_default()({
          path: (0,external_wp_url_namespaceObject.addQueryArgs)(path, {
            page,
            per_page: 100
          }),
          parse: false
        });
        const pageRecords = Object.values(await response.json());
        totalPages = parseInt(response.headers.get('X-WP-TotalPages'));
        records.push(...pageRecords);
        registry.batch(() => {
          dispatch.receiveEntityRecords(kind, name, records, query);
          dispatch.finishResolutions('getEntityRecord', getResolutionsArgs(pageRecords));
        });
        page++;
      } while (page <= totalPages);
      meta = {
        totalItems: records.length,
        totalPages: 1
      };
    } else {
      records = Object.values(await external_wp_apiFetch_default()({
        path
      }));
      meta = {
        totalItems: records.length,
        totalPages: 1
      };
    }
    if (query._fields) {
      records = records.map(record => {
        query._fields.split(',').forEach(field => {
          if (!record.hasOwnProperty(field)) {
            record[field] = undefined;
          }
        });
        return record;
      });
    }
    registry.batch(() => {
      dispatch.receiveEntityRecords(kind, name, records, query, false, undefined, meta);
      if (!query?._fields && !query.context) {
        const targetHints = records.filter(record => record?.[key]).map(record => ({
          id: record[key],
          permissions: getUserPermissionsFromAllowHeader(record?._links?.self?.[0].targetHints.allow)
        }));
        const canUserResolutionsArgs = [];
        const receiveUserPermissionArgs = {};
        for (const targetHint of targetHints) {
          for (const action of ALLOWED_RESOURCE_ACTIONS) {
            canUserResolutionsArgs.push([action, {
              kind,
              name,
              id: targetHint.id
            }]);
            receiveUserPermissionArgs[getUserPermissionCacheKey(action, {
              kind,
              name,
              id: targetHint.id
            })] = targetHint.permissions[action];
          }
        }
        dispatch.receiveUserPermissions(receiveUserPermissionArgs);
        dispatch.finishResolutions('getEntityRecord', getResolutionsArgs(records));
        dispatch.finishResolutions('canUser', canUserResolutionsArgs);
      }
      dispatch.__unstableReleaseStoreLock(lock);
    });
  } catch (e) {
    dispatch.__unstableReleaseStoreLock(lock);
  }
};
resolvers_getEntityRecords.shouldInvalidate = (action, kind, name) => {
  return (action.type === 'RECEIVE_ITEMS' || action.type === 'REMOVE_ITEMS') && action.invalidateCache && kind === action.kind && name === action.name;
};
const resolvers_getCurrentTheme = () => async ({
  dispatch,
  resolveSelect
}) => {
  const activeThemes = await resolveSelect.getEntityRecords('root', 'theme', {
    status: 'active'
  });
  dispatch.receiveCurrentTheme(activeThemes[0]);
};
const resolvers_getThemeSupports = forward_resolver('getCurrentTheme');
const resolvers_getEmbedPreview = url => async ({
  dispatch
}) => {
  try {
    const embedProxyResponse = await external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)('/oembed/1.0/proxy', {
        url
      })
    });
    dispatch.receiveEmbedPreview(url, embedProxyResponse);
  } catch (error) {
    dispatch.receiveEmbedPreview(url, false);
  }
};
const resolvers_canUser = (requestedAction, resource, id) => async ({
  dispatch,
  registry,
  resolveSelect
}) => {
  if (!ALLOWED_RESOURCE_ACTIONS.includes(requestedAction)) {
    throw new Error(`'${requestedAction}' is not a valid action.`);
  }
  const {
    hasStartedResolution
  } = registry.select(STORE_NAME);
  for (const relatedAction of ALLOWED_RESOURCE_ACTIONS) {
    if (relatedAction === requestedAction) {
      continue;
    }
    const isAlreadyResolving = hasStartedResolution('canUser', [relatedAction, resource, id]);
    if (isAlreadyResolving) {
      return;
    }
  }
  let resourcePath = null;
  if (typeof resource === 'object') {
    if (!resource.kind || !resource.name) {
      throw new Error('The entity resource object is not valid.');
    }
    const configs = await resolveSelect.getEntitiesConfig(resource.kind);
    const entityConfig = configs.find(config => config.name === resource.name && config.kind === resource.kind);
    if (!entityConfig) {
      return;
    }
    resourcePath = entityConfig.baseURL + (resource.id ? '/' + resource.id : '');
  } else {
    resourcePath = `/wp/v2/${resource}` + (id ? '/' + id : '');
  }
  let response;
  try {
    response = await external_wp_apiFetch_default()({
      path: resourcePath,
      method: 'OPTIONS',
      parse: false
    });
  } catch (error) {
    return;
  }
  const permissions = getUserPermissionsFromAllowHeader(response.headers?.get('allow'));
  registry.batch(() => {
    for (const action of ALLOWED_RESOURCE_ACTIONS) {
      const key = getUserPermissionCacheKey(action, resource, id);
      dispatch.receiveUserPermission(key, permissions[action]);
      if (action !== requestedAction) {
        dispatch.finishResolution('canUser', [action, resource, id]);
      }
    }
  });
};
const resolvers_canUserEditEntityRecord = (kind, name, recordId) => async ({
  dispatch
}) => {
  await dispatch(resolvers_canUser('update', {
    kind,
    name,
    id: recordId
  }));
};
const resolvers_getAutosaves = (postType, postId) => async ({
  dispatch,
  resolveSelect
}) => {
  const {
    rest_base: restBase,
    rest_namespace: restNamespace = 'wp/v2',
    supports
  } = await resolveSelect.getPostType(postType);
  if (!supports?.autosave) {
    return;
  }
  const autosaves = await external_wp_apiFetch_default()({
    path: `/${restNamespace}/${restBase}/${postId}/autosaves?context=edit`
  });
  if (autosaves && autosaves.length) {
    dispatch.receiveAutosaves(postId, autosaves);
  }
};
const resolvers_getAutosave = (postType, postId) => async ({
  resolveSelect
}) => {
  await resolveSelect.getAutosaves(postType, postId);
};
const resolvers_experimentalGetCurrentGlobalStylesId = () => async ({
  dispatch,
  resolveSelect
}) => {
  const activeThemes = await resolveSelect.getEntityRecords('root', 'theme', {
    status: 'active'
  });
  const globalStylesURL = activeThemes?.[0]?._links?.['wp:user-global-styles']?.[0]?.href;
  if (!globalStylesURL) {
    return;
  }
  const matches = globalStylesURL.match(/\/(\d+)(?:\?|$)/);
  const id = matches ? Number(matches[1]) : null;
  if (id) {
    dispatch.__experimentalReceiveCurrentGlobalStylesId(id);
  }
};
const resolvers_experimentalGetCurrentThemeBaseGlobalStyles = () => async ({
  resolveSelect,
  dispatch
}) => {
  const currentTheme = await resolveSelect.getCurrentTheme();
  const themeGlobalStyles = await external_wp_apiFetch_default()({
    path: `/wp/v2/global-styles/themes/${currentTheme.stylesheet}?context=view`
  });
  dispatch.__experimentalReceiveThemeBaseGlobalStyles(currentTheme.stylesheet, themeGlobalStyles);
};
const resolvers_experimentalGetCurrentThemeGlobalStylesVariations = () => async ({
  resolveSelect,
  dispatch
}) => {
  const currentTheme = await resolveSelect.getCurrentTheme();
  const variations = await external_wp_apiFetch_default()({
    path: `/wp/v2/global-styles/themes/${currentTheme.stylesheet}/variations?context=view`
  });
  dispatch.__experimentalReceiveThemeGlobalStyleVariations(currentTheme.stylesheet, variations);
};
const resolvers_getCurrentThemeGlobalStylesRevisions = () => async ({
  resolveSelect,
  dispatch
}) => {
  const globalStylesId = await resolveSelect.__experimentalGetCurrentGlobalStylesId();
  const record = globalStylesId ? await resolveSelect.getEntityRecord('root', 'globalStyles', globalStylesId) : undefined;
  const revisionsURL = record?._links?.['version-history']?.[0]?.href;
  if (revisionsURL) {
    const resetRevisions = await external_wp_apiFetch_default()({
      url: revisionsURL
    });
    const revisions = resetRevisions?.map(revision => Object.fromEntries(Object.entries(revision).map(([key, value]) => [camelCase(key), value])));
    dispatch.receiveThemeGlobalStyleRevisions(globalStylesId, revisions);
  }
};
resolvers_getCurrentThemeGlobalStylesRevisions.shouldInvalidate = action => {
  return action.type === 'SAVE_ENTITY_RECORD_FINISH' && action.kind === 'root' && !action.error && action.name === 'globalStyles';
};
const resolvers_getBlockPatterns = () => async ({
  dispatch
}) => {
  const patterns = await fetchBlockPatterns();
  dispatch({
    type: 'RECEIVE_BLOCK_PATTERNS',
    patterns
  });
};
const resolvers_getBlockPatternCategories = () => async ({
  dispatch
}) => {
  const categories = await external_wp_apiFetch_default()({
    path: '/wp/v2/block-patterns/categories'
  });
  dispatch({
    type: 'RECEIVE_BLOCK_PATTERN_CATEGORIES',
    categories
  });
};
const resolvers_getUserPatternCategories = () => async ({
  dispatch,
  resolveSelect
}) => {
  const patternCategories = await resolveSelect.getEntityRecords('taxonomy', 'wp_pattern_category', {
    per_page: -1,
    _fields: 'id,name,description,slug',
    context: 'view'
  });
  const mappedPatternCategories = patternCategories?.map(userCategory => ({
    ...userCategory,
    label: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(userCategory.name),
    name: userCategory.slug
  })) || [];
  dispatch({
    type: 'RECEIVE_USER_PATTERN_CATEGORIES',
    patternCategories: mappedPatternCategories
  });
};
const resolvers_getNavigationFallbackId = () => async ({
  dispatch,
  select,
  registry
}) => {
  const fallback = await external_wp_apiFetch_default()({
    path: (0,external_wp_url_namespaceObject.addQueryArgs)('/wp-block-editor/v1/navigation-fallback', {
      _embed: true
    })
  });
  const record = fallback?._embedded?.self;
  registry.batch(() => {
    dispatch.receiveNavigationFallbackId(fallback?.id);
    if (!record) {
      return;
    }
    const existingFallbackEntityRecord = select.getEntityRecord('postType', 'wp_navigation', fallback.id);
    const invalidateNavigationQueries = !existingFallbackEntityRecord;
    dispatch.receiveEntityRecords('postType', 'wp_navigation', record, undefined, invalidateNavigationQueries);
    dispatch.finishResolution('getEntityRecord', ['postType', 'wp_navigation', fallback.id]);
  });
};
const resolvers_getDefaultTemplateId = query => async ({
  dispatch,
  registry,
  resolveSelect
}) => {
  const template = await external_wp_apiFetch_default()({
    path: (0,external_wp_url_namespaceObject.addQueryArgs)('/wp/v2/templates/lookup', query)
  });
  await resolveSelect.getEntitiesConfig('postType');
  if (template?.id) {
    registry.batch(() => {
      dispatch.receiveDefaultTemplateId(query, template.id);
      dispatch.receiveEntityRecords('postType', 'wp_template', [template]);
      dispatch.finishResolution('getEntityRecord', ['postType', 'wp_template', template.id]);
    });
  }
};
const resolvers_getRevisions = (kind, name, recordKey, query = {}) => async ({
  dispatch,
  registry,
  resolveSelect
}) => {
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.name === name && config.kind === kind);
  if (!entityConfig) {
    return;
  }
  if (query._fields) {
    query = {
      ...query,
      _fields: [...new Set([...(get_normalized_comma_separable(query._fields) || []), entityConfig.revisionKey || DEFAULT_ENTITY_KEY])].join()
    };
  }
  const path = (0,external_wp_url_namespaceObject.addQueryArgs)(entityConfig.getRevisionsUrl(recordKey), query);
  let records, response;
  const meta = {};
  const isPaginated = entityConfig.supportsPagination && query.per_page !== -1;
  try {
    response = await external_wp_apiFetch_default()({
      path,
      parse: !isPaginated
    });
  } catch (error) {
    return;
  }
  if (response) {
    if (isPaginated) {
      records = Object.values(await response.json());
      meta.totalItems = parseInt(response.headers.get('X-WP-Total'));
    } else {
      records = Object.values(response);
    }
    if (query._fields) {
      records = records.map(record => {
        query._fields.split(',').forEach(field => {
          if (!record.hasOwnProperty(field)) {
            record[field] = undefined;
          }
        });
        return record;
      });
    }
    registry.batch(() => {
      dispatch.receiveRevisions(kind, name, recordKey, records, query, false, meta);
      if (!query?._fields && !query.context) {
        const key = entityConfig.key || DEFAULT_ENTITY_KEY;
        const resolutionsArgs = records.filter(record => record[key]).map(record => [kind, name, recordKey, record[key]]);
        dispatch.finishResolutions('getRevision', resolutionsArgs);
      }
    });
  }
};
resolvers_getRevisions.shouldInvalidate = (action, kind, name, recordKey) => action.type === 'SAVE_ENTITY_RECORD_FINISH' && name === action.name && kind === action.kind && !action.error && recordKey === action.recordId;
const resolvers_getRevision = (kind, name, recordKey, revisionKey, query) => async ({
  dispatch,
  resolveSelect
}) => {
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.name === name && config.kind === kind);
  if (!entityConfig) {
    return;
  }
  if (query !== undefined && query._fields) {
    query = {
      ...query,
      _fields: [...new Set([...(get_normalized_comma_separable(query._fields) || []), entityConfig.revisionKey || DEFAULT_ENTITY_KEY])].join()
    };
  }
  const path = (0,external_wp_url_namespaceObject.addQueryArgs)(entityConfig.getRevisionsUrl(recordKey, revisionKey), query);
  let record;
  try {
    record = await external_wp_apiFetch_default()({
      path
    });
  } catch (error) {
    return;
  }
  if (record) {
    dispatch.receiveRevisions(kind, name, recordKey, record, query);
  }
};
const resolvers_getRegisteredPostMeta = postType => async ({
  dispatch,
  resolveSelect
}) => {
  let options;
  try {
    const {
      rest_namespace: restNamespace = 'wp/v2',
      rest_base: restBase
    } = (await resolveSelect.getPostType(postType)) || {};
    options = await external_wp_apiFetch_default()({
      path: `${restNamespace}/${restBase}/?context=edit`,
      method: 'OPTIONS'
    });
  } catch (error) {
    return;
  }
  if (options) {
    dispatch.receiveRegisteredPostMeta(postType, options?.schema?.properties?.meta?.properties);
  }
};
const resolvers_getEntitiesConfig = kind => async ({
  dispatch
}) => {
  const loader = additionalEntityConfigLoaders.find(l => l.kind === kind);
  if (!loader) {
    return;
  }
  try {
    const configs = await loader.loadEntities();
    if (!configs.length) {
      return;
    }
    dispatch.addEntities(configs);
  } catch {
  }
};
;
function deepCopyLocksTreePath(tree, path) {
  const newTree = {
    ...tree
  };
  let currentNode = newTree;
  for (const branchName of path) {
    currentNode.children = {
      ...currentNode.children,
      [branchName]: {
        locks: [],
        children: {},
        ...currentNode.children[branchName]
      }
    };
    currentNode = currentNode.children[branchName];
  }
  return newTree;
}
function getNode(tree, path) {
  let currentNode = tree;
  for (const branchName of path) {
    const nextNode = currentNode.children[branchName];
    if (!nextNode) {
      return null;
    }
    currentNode = nextNode;
  }
  return currentNode;
}
function* iteratePath(tree, path) {
  let currentNode = tree;
  yield currentNode;
  for (const branchName of path) {
    const nextNode = currentNode.children[branchName];
    if (!nextNode) {
      break;
    }
    yield nextNode;
    currentNode = nextNode;
  }
}
function* iterateDescendants(node) {
  const stack = Object.values(node.children);
  while (stack.length) {
    const childNode = stack.pop();
    yield childNode;
    stack.push(...Object.values(childNode.children));
  }
}
function hasConflictingLock({
  exclusive
}, locks) {
  if (exclusive && locks.length) {
    return true;
  }
  if (!exclusive && locks.filter(lock => lock.exclusive).length) {
    return true;
  }
  return false;
}
;
const DEFAULT_STATE = {
  requests: [],
  tree: {
    locks: [],
    children: {}
  }
};
function locks(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case 'ENQUEUE_LOCK_REQUEST':
      {
        const {
          request
        } = action;
        return {
          ...state,
          requests: [request, ...state.requests]
        };
      }
    case 'GRANT_LOCK_REQUEST':
      {
        const {
          lock,
          request
        } = action;
        const {
          store,
          path
        } = request;
        const storePath = [store, ...path];
        const newTree = deepCopyLocksTreePath(state.tree, storePath);
        const node = getNode(newTree, storePath);
        node.locks = [...node.locks, lock];
        return {
          ...state,
          requests: state.requests.filter(r => r !== request),
          tree: newTree
        };
      }
    case 'RELEASE_LOCK':
      {
        const {
          lock
        } = action;
        const storePath = [lock.store, ...lock.path];
        const newTree = deepCopyLocksTreePath(state.tree, storePath);
        const node = getNode(newTree, storePath);
        node.locks = node.locks.filter(l => l !== lock);
        return {
          ...state,
          tree: newTree
        };
      }
  }
  return state;
}
;
function getPendingLockRequests(state) {
  return state.requests;
}
function isLockAvailable(state, store, path, {
  exclusive
}) {
  const storePath = [store, ...path];
  const locks = state.tree;
  for (const node of iteratePath(locks, storePath)) {
    if (hasConflictingLock({
      exclusive
    }, node.locks)) {
      return false;
    }
  }
  const node = getNode(locks, storePath);
  if (!node) {
    return true;
  }
  for (const descendant of iterateDescendants(node)) {
    if (hasConflictingLock({
      exclusive
    }, descendant.locks)) {
      return false;
    }
  }
  return true;
}
;
function createLocks() {
  let state = locks(undefined, {
    type: '@@INIT'
  });
  function processPendingLockRequests() {
    for (const request of getPendingLockRequests(state)) {
      const {
        store,
        path,
        exclusive,
        notifyAcquired
      } = request;
      if (isLockAvailable(state, store, path, {
        exclusive
      })) {
        const lock = {
          store,
          path,
          exclusive
        };
        state = locks(state, {
          type: 'GRANT_LOCK_REQUEST',
          lock,
          request
        });
        notifyAcquired(lock);
      }
    }
  }
  function acquire(store, path, exclusive) {
    return new Promise(resolve => {
      state = locks(state, {
        type: 'ENQUEUE_LOCK_REQUEST',
        request: {
          store,
          path,
          exclusive,
          notifyAcquired: resolve
        }
      });
      processPendingLockRequests();
    });
  }
  function release(lock) {
    state = locks(state, {
      type: 'RELEASE_LOCK',
      lock
    });
    processPendingLockRequests();
  }
  return {
    acquire,
    release
  };
}
;
function createLocksActions() {
  const locks = createLocks();
  function __unstableAcquireStoreLock(store, path, {
    exclusive
  }) {
    return () => locks.acquire(store, path, exclusive);
  }
  function __unstableReleaseStoreLock(lock) {
    return () => locks.release(lock);
  }
  return {
    __unstableAcquireStoreLock,
    __unstableReleaseStoreLock
  };
}
;
let dynamicActions;
let dynamicSelectors;
;
const external_wp_element_namespaceObject = window["wp"]["element"];
;
const EntityContext = (0,external_wp_element_namespaceObject.createContext)({});
;
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;
function EntityProvider({
  kind,
  type: name,
  id,
  children
}) {
  const parent = (0,external_wp_element_namespaceObject.useContext)(EntityContext);
  const childContext = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    ...parent,
    [kind]: {
      ...parent?.[kind],
      [name]: id
    }
  }), [parent, kind, name, id]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(EntityContext.Provider, {
    value: childContext,
    children: children
  });
}
;
function memize(fn, options) {
	var size = 0;
	var head;
	var tail;
	options = options || {};
	function memoized() {
		var node = head,
			len = arguments.length,
			args,
			i;
		searchCache: while (node) {
			if (node.args.length !== arguments.length) {
				node = node.next;
				continue;
			}
			for (i = 0; i < len; i++) {
				if (node.args[i] !== arguments[i]) {
					node = node.next;
					continue searchCache;
				}
			}
			if (node !== head) {
				if (node === tail) {
					tail = node.prev;
				}
				 (node.prev).next = node.next;
				if (node.next) {
					node.next.prev = node.prev;
				}
				node.next = head;
				node.prev = null;
				 (head).prev = node;
				head = node;
			}
			return node.val;
		}
		args = new Array(len);
		for (i = 0; i < len; i++) {
			args[i] = arguments[i];
		}
		node = {
			args: args,
			val: fn.apply(null, args),
		};
		if (head) {
			head.prev = node;
			node.next = head;
		} else {
			tail = node;
		}
		if (size ===  (options).maxSize) {
			tail =  (tail).prev;
			 (tail).next = null;
		} else {
			size++;
		}
		head = node;
		return node.val;
	}
	memoized.clear = function () {
		head = null;
		tail = null;
		size = 0;
	};
	return memoized;
}
;
 const memoize = (memize);
;
let Status = function (Status) {
  Status["Idle"] = "IDLE";
  Status["Resolving"] = "RESOLVING";
  Status["Error"] = "ERROR";
  Status["Success"] = "SUCCESS";
  return Status;
}({});
;
const META_SELECTORS = ['getIsResolving', 'hasStartedResolution', 'hasFinishedResolution', 'isResolving', 'getCachedResolvers'];
function useQuerySelect(mapQuerySelect, deps) {
  return (0,external_wp_data_namespaceObject.useSelect)((select, registry) => {
    const resolve = store => enrichSelectors(select(store));
    return mapQuerySelect(resolve, registry);
  }, deps);
}
const enrichSelectors = memoize(selectors => {
  const resolvers = {};
  for (const selectorName in selectors) {
    if (META_SELECTORS.includes(selectorName)) {
      continue;
    }
    Object.defineProperty(resolvers, selectorName, {
      get: () => (...args) => {
        const data = selectors[selectorName](...args);
        const resolutionStatus = selectors.getResolutionState(selectorName, args)?.status;
        let status;
        switch (resolutionStatus) {
          case 'resolving':
            status = Status.Resolving;
            break;
          case 'finished':
            status = Status.Success;
            break;
          case 'error':
            status = Status.Error;
            break;
          case undefined:
            status = Status.Idle;
            break;
        }
        return {
          data,
          status,
          isResolving: status === Status.Resolving,
          hasStarted: status !== Status.Idle,
          hasResolved: status === Status.Success || status === Status.Error
        };
      }
    });
  }
  return resolvers;
});
;
const use_entity_record_EMPTY_OBJECT = {};
function useEntityRecord(kind, name, recordId, options = {
  enabled: true
}) {
  const {
    editEntityRecord,
    saveEditedEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const mutations = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    edit: (record, editOptions = {}) => editEntityRecord(kind, name, recordId, record, editOptions),
    save: (saveOptions = {}) => saveEditedEntityRecord(kind, name, recordId, {
      throwOnError: true,
      ...saveOptions
    })
  }), [editEntityRecord, kind, name, recordId, saveEditedEntityRecord]);
  const {
    editedRecord,
    hasEdits,
    edits
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    if (!options.enabled) {
      return {
        editedRecord: use_entity_record_EMPTY_OBJECT,
        hasEdits: false,
        edits: use_entity_record_EMPTY_OBJECT
      };
    }
    return {
      editedRecord: select(store).getEditedEntityRecord(kind, name, recordId),
      hasEdits: select(store).hasEditsForEntityRecord(kind, name, recordId),
      edits: select(store).getEntityRecordNonTransientEdits(kind, name, recordId)
    };
  }, [kind, name, recordId, options.enabled]);
  const {
    data: record,
    ...querySelectRest
  } = useQuerySelect(query => {
    if (!options.enabled) {
      return {
        data: null
      };
    }
    return query(store).getEntityRecord(kind, name, recordId);
  }, [kind, name, recordId, options.enabled]);
  return {
    record,
    editedRecord,
    hasEdits,
    edits,
    ...querySelectRest,
    ...mutations
  };
}
function __experimentalUseEntityRecord(kind, name, recordId, options) {
  external_wp_deprecated_default()(`wp.data.__experimentalUseEntityRecord`, {
    alternative: 'wp.data.useEntityRecord',
    since: '6.1'
  });
  return useEntityRecord(kind, name, recordId, options);
}
;
const EMPTY_ARRAY = [];
function useEntityRecords(kind, name, queryArgs = {}, options = {
  enabled: true
}) {
  const queryAsString = (0,external_wp_url_namespaceObject.addQueryArgs)('', queryArgs);
  const {
    data: records,
    ...rest
  } = useQuerySelect(query => {
    if (!options.enabled) {
      return {
        data: EMPTY_ARRAY
      };
    }
    return query(store).getEntityRecords(kind, name, queryArgs);
  }, [kind, name, queryAsString, options.enabled]);
  const {
    totalItems,
    totalPages
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    if (!options.enabled) {
      return {
        totalItems: null,
        totalPages: null
      };
    }
    return {
      totalItems: select(store).getEntityRecordsTotalItems(kind, name, queryArgs),
      totalPages: select(store).getEntityRecordsTotalPages(kind, name, queryArgs)
    };
  }, [kind, name, queryAsString, options.enabled]);
  return {
    records,
    totalItems,
    totalPages,
    ...rest
  };
}
function __experimentalUseEntityRecords(kind, name, queryArgs, options) {
  external_wp_deprecated_default()(`wp.data.__experimentalUseEntityRecords`, {
    alternative: 'wp.data.useEntityRecords',
    since: '6.1'
  });
  return useEntityRecords(kind, name, queryArgs, options);
}
function useEntityRecordsWithPermissions(kind, name, queryArgs = {}, options = {
  enabled: true
}) {
  const entityConfig = (0,external_wp_data_namespaceObject.useSelect)(select => select(store).getEntityConfig(kind, name), [kind, name]);
  const {
    records: data,
    ...ret
  } = useEntityRecords(kind, name, queryArgs, options);
  const ids = (0,external_wp_element_namespaceObject.useMemo)(() => {
    var _data$map;
    return (_data$map = data?.map(
    record => {
      var _entityConfig$key;
      return record[(_entityConfig$key = entityConfig?.key) !== null && _entityConfig$key !== void 0 ? _entityConfig$key : 'id'];
    })) !== null && _data$map !== void 0 ? _data$map : [];
  }, [data, entityConfig?.key]);
  const permissions = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecordsPermissions
    } = unlock(select(store));
    return getEntityRecordsPermissions(kind, name, ids);
  }, [ids, kind, name]);
  const dataWithPermissions = (0,external_wp_element_namespaceObject.useMemo)(() => {
    var _data$map2;
    return (_data$map2 = data?.map((record, index) => ({
      ...record,
      permissions: permissions[index]
    }))) !== null && _data$map2 !== void 0 ? _data$map2 : [];
  }, [data, permissions]);
  return {
    records: dataWithPermissions,
    ...ret
  };
}
;
const external_wp_warning_namespaceObject = window["wp"]["warning"];
var external_wp_warning_default = __webpack_require__.n(external_wp_warning_namespaceObject);
;
function useResourcePermissions(resource, id) {
  const isEntity = typeof resource === 'object';
  const resourceAsString = isEntity ? JSON.stringify(resource) : resource;
  if (isEntity && typeof id !== 'undefined') {
     true ? external_wp_warning_default()(`When 'resource' is an entity object, passing 'id' as a separate argument isn't supported.`) : 0;
  }
  return useQuerySelect(resolve => {
    const hasId = isEntity ? !!resource.id : !!id;
    const {
      canUser
    } = resolve(store);
    const create = canUser('create', isEntity ? {
      kind: resource.kind,
      name: resource.name
    } : resource);
    if (!hasId) {
      const read = canUser('read', resource);
      const isResolving = create.isResolving || read.isResolving;
      const hasResolved = create.hasResolved && read.hasResolved;
      let status = Status.Idle;
      if (isResolving) {
        status = Status.Resolving;
      } else if (hasResolved) {
        status = Status.Success;
      }
      return {
        status,
        isResolving,
        hasResolved,
        canCreate: create.hasResolved && create.data,
        canRead: read.hasResolved && read.data
      };
    }
    const read = canUser('read', resource, id);
    const update = canUser('update', resource, id);
    const _delete = canUser('delete', resource, id);
    const isResolving = read.isResolving || create.isResolving || update.isResolving || _delete.isResolving;
    const hasResolved = read.hasResolved && create.hasResolved && update.hasResolved && _delete.hasResolved;
    let status = Status.Idle;
    if (isResolving) {
      status = Status.Resolving;
    } else if (hasResolved) {
      status = Status.Success;
    }
    return {
      status,
      isResolving,
      hasResolved,
      canRead: hasResolved && read.data,
      canCreate: hasResolved && create.data,
      canUpdate: hasResolved && update.data,
      canDelete: hasResolved && _delete.data
    };
  }, [resourceAsString, id]);
}
 const use_resource_permissions = (useResourcePermissions);
function __experimentalUseResourcePermissions(resource, id) {
  external_wp_deprecated_default()(`wp.data.__experimentalUseResourcePermissions`, {
    alternative: 'wp.data.useResourcePermissions',
    since: '6.1'
  });
  return useResourcePermissions(resource, id);
}
;
const external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;
function useEntityId(kind, name) {
  const context = (0,external_wp_element_namespaceObject.useContext)(EntityContext);
  return context?.[kind]?.[name];
}
;
const external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;
let unlockedApis;
const cache = new WeakMap();
function getRichTextValuesCached(block) {
  if (!unlockedApis) {
    unlockedApis = unlock(external_wp_blockEditor_namespaceObject.privateApis);
  }
  if (!cache.has(block)) {
    const values = unlockedApis.getRichTextValues([block]);
    cache.set(block, values);
  }
  return cache.get(block);
}
;
const get_footnotes_order_cache = new WeakMap();
function getBlockFootnotesOrder(block) {
  if (!get_footnotes_order_cache.has(block)) {
    const order = [];
    for (const value of getRichTextValuesCached(block)) {
      if (!value) {
        continue;
      }
      value.replacements.forEach(({
        type,
        attributes
      }) => {
        if (type === 'core/footnote') {
          order.push(attributes['data-fn']);
        }
      });
    }
    get_footnotes_order_cache.set(block, order);
  }
  return get_footnotes_order_cache.get(block);
}
function getFootnotesOrder(blocks) {
  return blocks.flatMap(getBlockFootnotesOrder);
}
;
let oldFootnotes = {};
function updateFootnotesFromMeta(blocks, meta) {
  const output = {
    blocks
  };
  if (!meta) {
    return output;
  }
  if (meta.footnotes === undefined) {
    return output;
  }
  const newOrder = getFootnotesOrder(blocks);
  const footnotes = meta.footnotes ? JSON.parse(meta.footnotes) : [];
  const currentOrder = footnotes.map(fn => fn.id);
  if (currentOrder.join('') === newOrder.join('')) {
    return output;
  }
  const newFootnotes = newOrder.map(fnId => footnotes.find(fn => fn.id === fnId) || oldFootnotes[fnId] || {
    id: fnId,
    content: ''
  });
  function updateAttributes(attributes) {
    if (!attributes || Array.isArray(attributes) || typeof attributes !== 'object') {
      return attributes;
    }
    attributes = {
      ...attributes
    };
    for (const key in attributes) {
      const value = attributes[key];
      if (Array.isArray(value)) {
        attributes[key] = value.map(updateAttributes);
        continue;
      }
      if (typeof value !== 'string' && !(value instanceof external_wp_richText_namespaceObject.RichTextData)) {
        continue;
      }
      const richTextValue = typeof value === 'string' ? external_wp_richText_namespaceObject.RichTextData.fromHTMLString(value) : new external_wp_richText_namespaceObject.RichTextData(value);
      let hasFootnotes = false;
      richTextValue.replacements.forEach(replacement => {
        if (replacement.type === 'core/footnote') {
          const id = replacement.attributes['data-fn'];
          const index = newOrder.indexOf(id);
          const countValue = (0,external_wp_richText_namespaceObject.create)({
            html: replacement.innerHTML
          });
          countValue.text = String(index + 1);
          countValue.formats = Array.from({
            length: countValue.text.length
          }, () => countValue.formats[0]);
          countValue.replacements = Array.from({
            length: countValue.text.length
          }, () => countValue.replacements[0]);
          replacement.innerHTML = (0,external_wp_richText_namespaceObject.toHTMLString)({
            value: countValue
          });
          hasFootnotes = true;
        }
      });
      if (hasFootnotes) {
        attributes[key] = typeof value === 'string' ? richTextValue.toHTMLString() : richTextValue;
      }
    }
    return attributes;
  }
  function updateBlocksAttributes(__blocks) {
    return __blocks.map(block => {
      return {
        ...block,
        attributes: updateAttributes(block.attributes),
        innerBlocks: updateBlocksAttributes(block.innerBlocks)
      };
    });
  }
  const newBlocks = updateBlocksAttributes(blocks);
  oldFootnotes = {
    ...oldFootnotes,
    ...footnotes.reduce((acc, fn) => {
      if (!newOrder.includes(fn.id)) {
        acc[fn.id] = fn;
      }
      return acc;
    }, {})
  };
  return {
    meta: {
      ...meta,
      footnotes: JSON.stringify(newFootnotes)
    },
    blocks: newBlocks
  };
}
;
const use_entity_block_editor_EMPTY_ARRAY = [];
const parsedBlocksCache = new WeakMap();
function useEntityBlockEditor(kind, name, {
  id: _id
} = {}) {
  const providerId = useEntityId(kind, name);
  const id = _id !== null && _id !== void 0 ? _id : providerId;
  const {
    getEntityRecord,
    getEntityRecordEdits
  } = (0,external_wp_data_namespaceObject.useSelect)(STORE_NAME);
  const {
    content,
    editedBlocks,
    meta
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    if (!id) {
      return {};
    }
    const {
      getEditedEntityRecord
    } = select(STORE_NAME);
    const editedRecord = getEditedEntityRecord(kind, name, id);
    return {
      editedBlocks: editedRecord.blocks,
      content: editedRecord.content,
      meta: editedRecord.meta
    };
  }, [kind, name, id]);
  const {
    __unstableCreateUndoLevel,
    editEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(STORE_NAME);
  const blocks = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (!id) {
      return undefined;
    }
    if (editedBlocks) {
      return editedBlocks;
    }
    if (!content || typeof content !== 'string') {
      return use_entity_block_editor_EMPTY_ARRAY;
    }
    const edits = getEntityRecordEdits(kind, name, id);
    const isUnedited = !edits || !Object.keys(edits).length;
    const cackeKey = isUnedited ? getEntityRecord(kind, name, id) : edits;
    let _blocks = parsedBlocksCache.get(cackeKey);
    if (!_blocks) {
      _blocks = (0,external_wp_blocks_namespaceObject.parse)(content);
      parsedBlocksCache.set(cackeKey, _blocks);
    }
    return _blocks;
  }, [kind, name, id, editedBlocks, content, getEntityRecord, getEntityRecordEdits]);
  const onChange = (0,external_wp_element_namespaceObject.useCallback)((newBlocks, options) => {
    const noChange = blocks === newBlocks;
    if (noChange) {
      return __unstableCreateUndoLevel(kind, name, id);
    }
    const {
      selection,
      ...rest
    } = options;
    const edits = {
      selection,
      content: ({
        blocks: blocksForSerialization = []
      }) => (0,external_wp_blocks_namespaceObject.__unstableSerializeAndClean)(blocksForSerialization),
      ...updateFootnotesFromMeta(newBlocks, meta)
    };
    editEntityRecord(kind, name, id, edits, {
      isCached: false,
      ...rest
    });
  }, [kind, name, id, blocks, meta, __unstableCreateUndoLevel, editEntityRecord]);
  const onInput = (0,external_wp_element_namespaceObject.useCallback)((newBlocks, options) => {
    const {
      selection,
      ...rest
    } = options;
    const footnotesChanges = updateFootnotesFromMeta(newBlocks, meta);
    const edits = {
      selection,
      ...footnotesChanges
    };
    editEntityRecord(kind, name, id, edits, {
      isCached: true,
      ...rest
    });
  }, [kind, name, id, meta, editEntityRecord]);
  return [blocks, onInput, onChange];
}
;
function useEntityProp(kind, name, prop, _id) {
  const providerId = useEntityId(kind, name);
  const id = _id !== null && _id !== void 0 ? _id : providerId;
  const {
    value,
    fullValue
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord,
      getEditedEntityRecord
    } = select(STORE_NAME);
    const record = getEntityRecord(kind, name, id); 
    const editedRecord = getEditedEntityRecord(kind, name, id);
    return record && editedRecord ? {
      value: editedRecord[prop],
      fullValue: record[prop]
    } : {};
  }, [kind, name, id, prop]);
  const {
    editEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(STORE_NAME);
  const setValue = (0,external_wp_element_namespaceObject.useCallback)(newValue => {
    editEntityRecord(kind, name, id, {
      [prop]: newValue
    });
  }, [editEntityRecord, kind, name, id, prop]);
  return [value, setValue, fullValue];
}
;
;
const privateApis = {};
lock(privateApis, {
  useEntityRecordsWithPermissions: useEntityRecordsWithPermissions,
  RECEIVE_INTERMEDIATE_RESULTS: RECEIVE_INTERMEDIATE_RESULTS
});
;
const build_module_entitiesConfig = [...rootEntitiesConfig, ...additionalEntityConfigLoaders.filter(config => !!config.name)];
const entitySelectors = build_module_entitiesConfig.reduce((result, entity) => {
  const {
    kind,
    name,
    plural
  } = entity;
  result[getMethodName(kind, name)] = (state, key, query) => getEntityRecord(state, kind, name, key, query);
  if (plural) {
    result[getMethodName(kind, plural, 'get')] = (state, query) => getEntityRecords(state, kind, name, query);
  }
  return result;
}, {});
const entityResolvers = build_module_entitiesConfig.reduce((result, entity) => {
  const {
    kind,
    name,
    plural
  } = entity;
  result[getMethodName(kind, name)] = (key, query) => resolvers_getEntityRecord(kind, name, key, query);
  if (plural) {
    const pluralMethodName = getMethodName(kind, plural, 'get');
    result[pluralMethodName] = (...args) => resolvers_getEntityRecords(kind, name, ...args);
    result[pluralMethodName].shouldInvalidate = action => resolvers_getEntityRecords.shouldInvalidate(action, kind, name);
  }
  return result;
}, {});
const entityActions = build_module_entitiesConfig.reduce((result, entity) => {
  const {
    kind,
    name
  } = entity;
  result[getMethodName(kind, name, 'save')] = (record, options) => saveEntityRecord(kind, name, record, options);
  result[getMethodName(kind, name, 'delete')] = (key, query, options) => deleteEntityRecord(kind, name, key, query, options);
  return result;
}, {});
const storeConfig = () => ({
  reducer: build_module_reducer,
  actions: {
    ...dynamicActions,
    ...build_module_actions_namespaceObject,
    ...entityActions,
    ...createLocksActions()
  },
  selectors: {
    ...dynamicSelectors,
    ...build_module_selectors_namespaceObject,
    ...entitySelectors
  },
  resolvers: {
    ...resolvers_namespaceObject,
    ...entityResolvers
  }
});
const store = (0,external_wp_data_namespaceObject.createReduxStore)(STORE_NAME, storeConfig());
unlock(store).registerPrivateSelectors(private_selectors_namespaceObject);
unlock(store).registerPrivateActions(private_actions_namespaceObject);
(0,external_wp_data_namespaceObject.register)(store); 
(window.wp = window.wp || {}).coreData = __webpack_exports__;
 })()
;