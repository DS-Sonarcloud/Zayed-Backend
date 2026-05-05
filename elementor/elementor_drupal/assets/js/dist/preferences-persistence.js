 (() => { 
 	"use strict";
 	var __webpack_require__ = {};
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
  __unstableCreatePersistenceLayer: () => ( __unstableCreatePersistenceLayer),
  create: () => ( create)
});
;
const external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
var external_wp_apiFetch_default = __webpack_require__.n(external_wp_apiFetch_namespaceObject);
;
function debounceAsync(func, delayMS) {
  let timeoutId;
  let activePromise;
  return async function debounced(...args) {
    if (!activePromise && !timeoutId) {
      return new Promise((resolve, reject) => {
        activePromise = func(...args).then((...thenArgs) => {
          resolve(...thenArgs);
        }).catch(error => {
          reject(error);
        }).finally(() => {
          activePromise = null;
        });
      });
    }
    if (activePromise) {
      await activePromise;
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        activePromise = func(...args).then((...thenArgs) => {
          resolve(...thenArgs);
        }).catch(error => {
          reject(error);
        }).finally(() => {
          activePromise = null;
          timeoutId = null;
        });
      }, delayMS);
    });
  };
}
;
const EMPTY_OBJECT = {};
const localStorage = window.localStorage;
function create({
  preloadedData,
  localStorageRestoreKey = 'WP_PREFERENCES_RESTORE_DATA',
  requestDebounceMS = 2500
} = {}) {
  let cache = preloadedData;
  const debouncedApiFetch = debounceAsync((external_wp_apiFetch_default()), requestDebounceMS);
  async function get() {
    if (cache) {
      return cache;
    }
    const user = await external_wp_apiFetch_default()({
      path: '/wp/v2/users/me?context=edit'
    });
    const serverData = user?.meta?.persisted_preferences;
    const localData = JSON.parse(localStorage.getItem(localStorageRestoreKey));
    const serverTimestamp = Date.parse(serverData?._modified) || 0;
    const localTimestamp = Date.parse(localData?._modified) || 0;
    if (serverData && serverTimestamp >= localTimestamp) {
      cache = serverData;
    } else if (localData) {
      cache = localData;
    } else {
      cache = EMPTY_OBJECT;
    }
    return cache;
  }
  function set(newData) {
    const dataWithTimestamp = {
      ...newData,
      _modified: new Date().toISOString()
    };
    cache = dataWithTimestamp;
    localStorage.setItem(localStorageRestoreKey, JSON.stringify(dataWithTimestamp));
    debouncedApiFetch({
      path: '/wp/v2/users/me',
      method: 'PUT',
      keepalive: true,
      data: {
        meta: {
          persisted_preferences: dataWithTimestamp
        }
      }
    }).catch(() => {});
  }
  return {
    get,
    set
  };
}
;
function moveFeaturePreferences(state, sourceStoreName) {
  const preferencesStoreName = 'core/preferences';
  const interfaceStoreName = 'core/interface';
  const interfaceFeatures = state?.[interfaceStoreName]?.preferences?.features?.[sourceStoreName];
  const sourceFeatures = state?.[sourceStoreName]?.preferences?.features;
  const featuresToMigrate = interfaceFeatures ? interfaceFeatures : sourceFeatures;
  if (!featuresToMigrate) {
    return state;
  }
  const existingPreferences = state?.[preferencesStoreName]?.preferences;
  if (existingPreferences?.[sourceStoreName]) {
    return state;
  }
  let updatedInterfaceState;
  if (interfaceFeatures) {
    const otherInterfaceState = state?.[interfaceStoreName];
    const otherInterfaceScopes = state?.[interfaceStoreName]?.preferences?.features;
    updatedInterfaceState = {
      [interfaceStoreName]: {
        ...otherInterfaceState,
        preferences: {
          features: {
            ...otherInterfaceScopes,
            [sourceStoreName]: undefined
          }
        }
      }
    };
  }
  let updatedSourceState;
  if (sourceFeatures) {
    const otherSourceState = state?.[sourceStoreName];
    const sourcePreferences = state?.[sourceStoreName]?.preferences;
    updatedSourceState = {
      [sourceStoreName]: {
        ...otherSourceState,
        preferences: {
          ...sourcePreferences,
          features: undefined
        }
      }
    };
  }
  return {
    ...state,
    [preferencesStoreName]: {
      preferences: {
        ...existingPreferences,
        [sourceStoreName]: featuresToMigrate
      }
    },
    ...updatedInterfaceState,
    ...updatedSourceState
  };
}
;
function moveThirdPartyFeaturePreferencesToPreferences(state) {
  const interfaceStoreName = 'core/interface';
  const preferencesStoreName = 'core/preferences';
  const interfaceScopes = state?.[interfaceStoreName]?.preferences?.features;
  const interfaceScopeKeys = interfaceScopes ? Object.keys(interfaceScopes) : [];
  if (!interfaceScopeKeys?.length) {
    return state;
  }
  return interfaceScopeKeys.reduce(function (convertedState, scope) {
    if (scope.startsWith('core')) {
      return convertedState;
    }
    const featuresToMigrate = interfaceScopes?.[scope];
    if (!featuresToMigrate) {
      return convertedState;
    }
    const existingMigratedData = convertedState?.[preferencesStoreName]?.preferences?.[scope];
    if (existingMigratedData) {
      return convertedState;
    }
    const otherPreferencesScopes = convertedState?.[preferencesStoreName]?.preferences;
    const otherInterfaceState = convertedState?.[interfaceStoreName];
    const otherInterfaceScopes = convertedState?.[interfaceStoreName]?.preferences?.features;
    return {
      ...convertedState,
      [preferencesStoreName]: {
        preferences: {
          ...otherPreferencesScopes,
          [scope]: featuresToMigrate
        }
      },
      [interfaceStoreName]: {
        ...otherInterfaceState,
        preferences: {
          features: {
            ...otherInterfaceScopes,
            [scope]: undefined
          }
        }
      }
    };
  }, state);
}
;
const identity = arg => arg;
function moveIndividualPreferenceToPreferences(state, {
  from: sourceStoreName,
  to: scope
}, key, convert = identity) {
  const preferencesStoreName = 'core/preferences';
  const sourcePreference = state?.[sourceStoreName]?.preferences?.[key];
  if (sourcePreference === undefined) {
    return state;
  }
  const targetPreference = state?.[preferencesStoreName]?.preferences?.[scope]?.[key];
  if (targetPreference) {
    return state;
  }
  const otherScopes = state?.[preferencesStoreName]?.preferences;
  const otherPreferences = state?.[preferencesStoreName]?.preferences?.[scope];
  const otherSourceState = state?.[sourceStoreName];
  const allSourcePreferences = state?.[sourceStoreName]?.preferences;
  const convertedPreferences = convert({
    [key]: sourcePreference
  });
  return {
    ...state,
    [preferencesStoreName]: {
      preferences: {
        ...otherScopes,
        [scope]: {
          ...otherPreferences,
          ...convertedPreferences
        }
      }
    },
    [sourceStoreName]: {
      ...otherSourceState,
      preferences: {
        ...allSourcePreferences,
        [key]: undefined
      }
    }
  };
}
;
function moveInterfaceEnableItems(state) {
  var _state$preferencesSto, _sourceEnableItems$si, _sourceEnableItems$mu;
  const interfaceStoreName = 'core/interface';
  const preferencesStoreName = 'core/preferences';
  const sourceEnableItems = state?.[interfaceStoreName]?.enableItems;
  if (!sourceEnableItems) {
    return state;
  }
  const allPreferences = (_state$preferencesSto = state?.[preferencesStoreName]?.preferences) !== null && _state$preferencesSto !== void 0 ? _state$preferencesSto : {};
  const sourceComplementaryAreas = (_sourceEnableItems$si = sourceEnableItems?.singleEnableItems?.complementaryArea) !== null && _sourceEnableItems$si !== void 0 ? _sourceEnableItems$si : {};
  const preferencesWithConvertedComplementaryAreas = Object.keys(sourceComplementaryAreas).reduce((accumulator, scope) => {
    const data = sourceComplementaryAreas[scope];
    if (accumulator?.[scope]?.complementaryArea) {
      return accumulator;
    }
    return {
      ...accumulator,
      [scope]: {
        ...accumulator[scope],
        complementaryArea: data
      }
    };
  }, allPreferences);
  const sourcePinnedItems = (_sourceEnableItems$mu = sourceEnableItems?.multipleEnableItems?.pinnedItems) !== null && _sourceEnableItems$mu !== void 0 ? _sourceEnableItems$mu : {};
  const allConvertedData = Object.keys(sourcePinnedItems).reduce((accumulator, scope) => {
    const data = sourcePinnedItems[scope];
    if (accumulator?.[scope]?.pinnedItems) {
      return accumulator;
    }
    return {
      ...accumulator,
      [scope]: {
        ...accumulator[scope],
        pinnedItems: data
      }
    };
  }, preferencesWithConvertedComplementaryAreas);
  const otherInterfaceItems = state[interfaceStoreName];
  return {
    ...state,
    [preferencesStoreName]: {
      preferences: allConvertedData
    },
    [interfaceStoreName]: {
      ...otherInterfaceItems,
      enableItems: undefined
    }
  };
}
;
function convertEditPostPanels(preferences) {
  var _preferences$panels;
  const panels = (_preferences$panels = preferences?.panels) !== null && _preferences$panels !== void 0 ? _preferences$panels : {};
  return Object.keys(panels).reduce((convertedData, panelName) => {
    const panel = panels[panelName];
    if (panel?.enabled === false) {
      convertedData.inactivePanels.push(panelName);
    }
    if (panel?.opened === true) {
      convertedData.openPanels.push(panelName);
    }
    return convertedData;
  }, {
    inactivePanels: [],
    openPanels: []
  });
}
;
function getLegacyData(userId) {
  const key = `WP_DATA_USER_${userId}`;
  const unparsedData = window.localStorage.getItem(key);
  return JSON.parse(unparsedData);
}
function convertLegacyData(data) {
  if (!data) {
    return;
  }
  data = moveFeaturePreferences(data, 'core/edit-widgets');
  data = moveFeaturePreferences(data, 'core/customize-widgets');
  data = moveFeaturePreferences(data, 'core/edit-post');
  data = moveFeaturePreferences(data, 'core/edit-site');
  data = moveThirdPartyFeaturePreferencesToPreferences(data);
  data = moveInterfaceEnableItems(data);
  data = moveIndividualPreferenceToPreferences(data, {
    from: 'core/edit-post',
    to: 'core/edit-post'
  }, 'hiddenBlockTypes');
  data = moveIndividualPreferenceToPreferences(data, {
    from: 'core/edit-post',
    to: 'core/edit-post'
  }, 'editorMode');
  data = moveIndividualPreferenceToPreferences(data, {
    from: 'core/edit-post',
    to: 'core/edit-post'
  }, 'panels', convertEditPostPanels);
  data = moveIndividualPreferenceToPreferences(data, {
    from: 'core/editor',
    to: 'core'
  }, 'isPublishSidebarEnabled');
  data = moveIndividualPreferenceToPreferences(data, {
    from: 'core/edit-post',
    to: 'core'
  }, 'isPublishSidebarEnabled');
  data = moveIndividualPreferenceToPreferences(data, {
    from: 'core/edit-site',
    to: 'core/edit-site'
  }, 'editorMode');
  return data?.['core/preferences']?.preferences;
}
function convertLegacyLocalStorageData(userId) {
  const data = getLegacyData(userId);
  return convertLegacyData(data);
}
;
function convertComplementaryAreas(state) {
  return Object.keys(state).reduce((stateAccumulator, scope) => {
    const scopeData = state[scope];
    if (scopeData?.complementaryArea) {
      const updatedScopeData = {
        ...scopeData
      };
      delete updatedScopeData.complementaryArea;
      updatedScopeData.isComplementaryAreaVisible = true;
      stateAccumulator[scope] = updatedScopeData;
      return stateAccumulator;
    }
    return stateAccumulator;
  }, state);
}
;
function convertEditorSettings(data) {
  var _newData$coreEditPo, _newData$coreEditSi;
  let newData = data;
  const settingsToMoveToCore = ['allowRightClickOverrides', 'distractionFree', 'editorMode', 'fixedToolbar', 'focusMode', 'hiddenBlockTypes', 'inactivePanels', 'keepCaretInsideBlock', 'mostUsedBlocks', 'openPanels', 'showBlockBreadcrumbs', 'showIconLabels', 'showListViewByDefault', 'isPublishSidebarEnabled', 'isComplementaryAreaVisible', 'pinnedItems'];
  settingsToMoveToCore.forEach(setting => {
    if (data?.['core/edit-post']?.[setting] !== undefined) {
      newData = {
        ...newData,
        core: {
          ...newData?.core,
          [setting]: data['core/edit-post'][setting]
        }
      };
      delete newData['core/edit-post'][setting];
    }
    if (data?.['core/edit-site']?.[setting] !== undefined) {
      delete newData['core/edit-site'][setting];
    }
  });
  if (Object.keys((_newData$coreEditPo = newData?.['core/edit-post']) !== null && _newData$coreEditPo !== void 0 ? _newData$coreEditPo : {})?.length === 0) {
    delete newData['core/edit-post'];
  }
  if (Object.keys((_newData$coreEditSi = newData?.['core/edit-site']) !== null && _newData$coreEditSi !== void 0 ? _newData$coreEditSi : {})?.length === 0) {
    delete newData['core/edit-site'];
  }
  return newData;
}
;
function convertPreferencesPackageData(data) {
  let newData = convertComplementaryAreas(data);
  newData = convertEditorSettings(newData);
  return newData;
}
;
function __unstableCreatePersistenceLayer(serverData, userId) {
  const localStorageRestoreKey = `WP_PREFERENCES_USER_${userId}`;
  const localData = JSON.parse(window.localStorage.getItem(localStorageRestoreKey));
  const serverModified = Date.parse(serverData && serverData._modified) || 0;
  const localModified = Date.parse(localData && localData._modified) || 0;
  let preloadedData;
  if (serverData && serverModified >= localModified) {
    preloadedData = convertPreferencesPackageData(serverData);
  } else if (localData) {
    preloadedData = convertPreferencesPackageData(localData);
  } else {
    preloadedData = convertLegacyLocalStorageData(userId);
  }
  return create({
    preloadedData,
    localStorageRestoreKey
  });
}
(window.wp = window.wp || {}).preferencesPersistence = __webpack_exports__;
 })()
;