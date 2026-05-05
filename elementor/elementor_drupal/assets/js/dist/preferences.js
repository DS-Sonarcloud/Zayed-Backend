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
  PreferenceToggleMenuItem: () => ( PreferenceToggleMenuItem),
  privateApis: () => ( privateApis),
  store: () => ( store)
});
var actions_namespaceObject = {};
__webpack_require__.r(actions_namespaceObject);
__webpack_require__.d(actions_namespaceObject, {
  set: () => (set),
  setDefaults: () => (setDefaults),
  setPersistenceLayer: () => (setPersistenceLayer),
  toggle: () => (toggle)
});
var selectors_namespaceObject = {};
__webpack_require__.r(selectors_namespaceObject);
__webpack_require__.d(selectors_namespaceObject, {
  get: () => (get)
});
;
const external_wp_data_namespaceObject = window["wp"]["data"];
;
const external_wp_components_namespaceObject = window["wp"]["components"];
;
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;
const external_wp_primitives_namespaceObject = window["wp"]["primitives"];
;
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;
const check = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M16.7 7.1l-6.3 8.5-3.3-2.5-.9 1.2 4.5 3.4L17.9 8z"
  })
});
 const library_check = (check);
;
const external_wp_a11y_namespaceObject = window["wp"]["a11y"];
;
function defaults(state = {}, action) {
  if (action.type === 'SET_PREFERENCE_DEFAULTS') {
    const {
      scope,
      defaults: values
    } = action;
    return {
      ...state,
      [scope]: {
        ...state[scope],
        ...values
      }
    };
  }
  return state;
}
function withPersistenceLayer(reducer) {
  let persistenceLayer;
  return (state, action) => {
    if (action.type === 'SET_PERSISTENCE_LAYER') {
      const {
        persistenceLayer: persistence,
        persistedData
      } = action;
      persistenceLayer = persistence;
      return persistedData;
    }
    const nextState = reducer(state, action);
    if (action.type === 'SET_PREFERENCE_VALUE') {
      persistenceLayer?.set(nextState);
    }
    return nextState;
  };
}
const preferences = withPersistenceLayer((state = {}, action) => {
  if (action.type === 'SET_PREFERENCE_VALUE') {
    const {
      scope,
      name,
      value
    } = action;
    return {
      ...state,
      [scope]: {
        ...state[scope],
        [name]: value
      }
    };
  }
  return state;
});
 const reducer = ((0,external_wp_data_namespaceObject.combineReducers)({
  defaults,
  preferences
}));
;
function toggle(scope, name) {
  return function ({
    select,
    dispatch
  }) {
    const currentValue = select.get(scope, name);
    dispatch.set(scope, name, !currentValue);
  };
}
function set(scope, name, value) {
  return {
    type: 'SET_PREFERENCE_VALUE',
    scope,
    name,
    value
  };
}
function setDefaults(scope, defaults) {
  return {
    type: 'SET_PREFERENCE_DEFAULTS',
    scope,
    defaults
  };
}
async function setPersistenceLayer(persistenceLayer) {
  const persistedData = await persistenceLayer.get();
  return {
    type: 'SET_PERSISTENCE_LAYER',
    persistenceLayer,
    persistedData
  };
}
;
const external_wp_deprecated_namespaceObject = window["wp"]["deprecated"];
var external_wp_deprecated_default = __webpack_require__.n(external_wp_deprecated_namespaceObject);
;
const withDeprecatedKeys = originalGet => (state, scope, name) => {
  const settingsToMoveToCore = ['allowRightClickOverrides', 'distractionFree', 'editorMode', 'fixedToolbar', 'focusMode', 'hiddenBlockTypes', 'inactivePanels', 'keepCaretInsideBlock', 'mostUsedBlocks', 'openPanels', 'showBlockBreadcrumbs', 'showIconLabels', 'showListViewByDefault', 'isPublishSidebarEnabled', 'isComplementaryAreaVisible', 'pinnedItems'];
  if (settingsToMoveToCore.includes(name) && ['core/edit-post', 'core/edit-site'].includes(scope)) {
    external_wp_deprecated_default()(`wp.data.select( 'core/preferences' ).get( '${scope}', '${name}' )`, {
      since: '6.5',
      alternative: `wp.data.select( 'core/preferences' ).get( 'core', '${name}' )`
    });
    return originalGet(state, 'core', name);
  }
  return originalGet(state, scope, name);
};
const get = withDeprecatedKeys((state, scope, name) => {
  const value = state.preferences[scope]?.[name];
  return value !== undefined ? value : state.defaults[scope]?.[name];
});
;
const STORE_NAME = 'core/preferences';
;
const store = (0,external_wp_data_namespaceObject.createReduxStore)(STORE_NAME, {
  reducer: reducer,
  actions: actions_namespaceObject,
  selectors: selectors_namespaceObject
});
(0,external_wp_data_namespaceObject.register)(store);
;
function PreferenceToggleMenuItem({
  scope,
  name,
  label,
  info,
  messageActivated,
  messageDeactivated,
  shortcut,
  handleToggling = true,
  onToggle = () => null,
  disabled = false
}) {
  const isActive = (0,external_wp_data_namespaceObject.useSelect)(select => !!select(store).get(scope, name), [scope, name]);
  const {
    toggle
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const speakMessage = () => {
    if (isActive) {
      const message = messageDeactivated || (0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject.__)('Preference deactivated - %s'), label);
      (0,external_wp_a11y_namespaceObject.speak)(message);
    } else {
      const message = messageActivated || (0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject.__)('Preference activated - %s'), label);
      (0,external_wp_a11y_namespaceObject.speak)(message);
    }
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
    icon: isActive && library_check,
    isSelected: isActive,
    onClick: () => {
      onToggle();
      if (handleToggling) {
        toggle(scope, name);
      }
      speakMessage();
    },
    role: "menuitemcheckbox",
    info: info,
    shortcut: shortcut,
    disabled: disabled,
    children: label
  });
}
;
;
function BaseOption({
  help,
  label,
  isChecked,
  onChange,
  children
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "preference-base-option",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToggleControl, {
      __nextHasNoMarginBottom: true,
      help: help,
      label: label,
      checked: isChecked,
      onChange: onChange
    }), children]
  });
}
 const preference_base_option = (BaseOption);
;
function PreferenceToggleControl(props) {
  const {
    scope,
    featureName,
    onToggle = () => {},
    ...remainingProps
  } = props;
  const isChecked = (0,external_wp_data_namespaceObject.useSelect)(select => !!select(store).get(scope, featureName), [scope, featureName]);
  const {
    toggle
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const onChange = () => {
    onToggle();
    toggle(scope, featureName);
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(preference_base_option, {
    onChange: onChange,
    isChecked: isChecked,
    ...remainingProps
  });
}
 const preference_toggle_control = (PreferenceToggleControl);
;
function PreferencesModal({
  closeModal,
  children
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Modal, {
    className: "preferences-modal",
    title: (0,external_wp_i18n_namespaceObject.__)('Preferences'),
    onRequestClose: closeModal,
    children: children
  });
}
;
const Section = ({
  description,
  title,
  children
}) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)("fieldset", {
  className: "preferences-modal__section",
  children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)("legend", {
    className: "preferences-modal__section-legend",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("h2", {
      className: "preferences-modal__section-title",
      children: title
    }), description && (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
      className: "preferences-modal__section-description",
      children: description
    })]
  }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    className: "preferences-modal__section-content",
    children: children
  })]
});
 const preferences_modal_section = (Section);
;
const external_wp_compose_namespaceObject = window["wp"]["compose"];
;
const external_wp_element_namespaceObject = window["wp"]["element"];
;
function Icon({
  icon,
  size = 24,
  ...props
}, ref) {
  return (0,external_wp_element_namespaceObject.cloneElement)(icon, {
    width: size,
    height: size,
    ...props,
    ref
  });
}
 const icon = ((0,external_wp_element_namespaceObject.forwardRef)(Icon));
;
const chevronLeft = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M14.6 7l-1.2-1L8 12l5.4 6 1.2-1-4.6-5z"
  })
});
 const chevron_left = (chevronLeft);
;
const chevronRight = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M10.6 6L9.4 7l4.6 5-4.6 5 1.2 1 5.4-6z"
  })
});
 const chevron_right = (chevronRight);
;
const external_wp_privateApis_namespaceObject = window["wp"]["privateApis"];
;
const {
  lock,
  unlock
} = (0,external_wp_privateApis_namespaceObject.__dangerousOptInToUnstableAPIsOnlyForCoreModules)('I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.', '@wordpress/preferences');
;
const {
  Tabs
} = unlock(external_wp_components_namespaceObject.privateApis);
const PREFERENCES_MENU = 'preferences-menu';
function PreferencesModalTabs({
  sections
}) {
  const isLargeViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('medium');
  const [activeMenu, setActiveMenu] = (0,external_wp_element_namespaceObject.useState)(PREFERENCES_MENU);
  const {
    tabs,
    sectionsContentMap
  } = (0,external_wp_element_namespaceObject.useMemo)(() => {
    let mappedTabs = {
      tabs: [],
      sectionsContentMap: {}
    };
    if (sections.length) {
      mappedTabs = sections.reduce((accumulator, {
        name,
        tabLabel: title,
        content
      }) => {
        accumulator.tabs.push({
          name,
          title
        });
        accumulator.sectionsContentMap[name] = content;
        return accumulator;
      }, {
        tabs: [],
        sectionsContentMap: {}
      });
    }
    return mappedTabs;
  }, [sections]);
  let modalContent;
  if (isLargeViewport) {
    modalContent = (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "preferences__tabs",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(Tabs, {
        defaultTabId: activeMenu !== PREFERENCES_MENU ? activeMenu : undefined,
        onSelect: setActiveMenu,
        orientation: "vertical",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(Tabs.TabList, {
          className: "preferences__tabs-tablist",
          children: tabs.map(tab => (0,external_ReactJSXRuntime_namespaceObject.jsx)(Tabs.Tab, {
            tabId: tab.name,
            className: "preferences__tabs-tab",
            children: tab.title
          }, tab.name))
        }), tabs.map(tab => (0,external_ReactJSXRuntime_namespaceObject.jsx)(Tabs.TabPanel, {
          tabId: tab.name,
          className: "preferences__tabs-tabpanel",
          focusable: false,
          children: sectionsContentMap[tab.name] || null
        }, tab.name))]
      })
    });
  } else {
    modalContent = (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.Navigator, {
      initialPath: "/",
      className: "preferences__provider",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Navigator.Screen, {
        path: "/",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Card, {
          isBorderless: true,
          size: "small",
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.CardBody, {
            children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalItemGroup, {
              children: tabs.map(tab => {
                return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Navigator.Button, {
                  path: `/${tab.name}`,
                  as: external_wp_components_namespaceObject.__experimentalItem,
                  isAction: true,
                  children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
                    justify: "space-between",
                    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.FlexItem, {
                      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalTruncate, {
                        children: tab.title
                      })
                    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.FlexItem, {
                      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(icon, {
                        icon: (0,external_wp_i18n_namespaceObject.isRTL)() ? chevron_left : chevron_right
                      })
                    })]
                  })
                }, tab.name);
              })
            })
          })
        })
      }), sections.length && sections.map(section => {
        return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Navigator.Screen, {
          path: `/${section.name}`,
          children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.Card, {
            isBorderless: true,
            size: "large",
            children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.CardHeader, {
              isBorderless: false,
              justify: "left",
              size: "small",
              gap: "6",
              children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Navigator.BackButton, {
                icon: (0,external_wp_i18n_namespaceObject.isRTL)() ? chevron_right : chevron_left,
                label: (0,external_wp_i18n_namespaceObject.__)('Back')
              }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
                size: "16",
                children: section.tabLabel
              })]
            }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.CardBody, {
              children: section.content
            })]
          })
        }, `${section.name}-menu`);
      })]
    });
  }
  return modalContent;
}
;
const privateApis = {};
lock(privateApis, {
  PreferenceBaseOption: preference_base_option,
  PreferenceToggleControl: preference_toggle_control,
  PreferencesModal: PreferencesModal,
  PreferencesModalSection: preferences_modal_section,
  PreferencesModalTabs: PreferencesModalTabs
});
;
(window.wp = window.wp || {}).preferences = __webpack_exports__;
 })()
;