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
  privateApis: () => ( privateApis),
  store: () => ( store)
});
var actions_namespaceObject = {};
__webpack_require__.r(actions_namespaceObject);
__webpack_require__.d(actions_namespaceObject, {
  convertSyncedPatternToStatic: () => (convertSyncedPatternToStatic),
  createPattern: () => (createPattern),
  createPatternFromFile: () => (createPatternFromFile),
  setEditingPattern: () => (setEditingPattern)
});
var selectors_namespaceObject = {};
__webpack_require__.r(selectors_namespaceObject);
__webpack_require__.d(selectors_namespaceObject, {
  isEditingPattern: () => (selectors_isEditingPattern)
});
;
const external_wp_data_namespaceObject = window["wp"]["data"];
;
function isEditingPattern(state = {}, action) {
  if (action?.type === 'SET_EDITING_PATTERN') {
    return {
      ...state,
      [action.clientId]: action.isEditing
    };
  }
  return state;
}
 const reducer = ((0,external_wp_data_namespaceObject.combineReducers)({
  isEditingPattern
}));
;
const external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;
const external_wp_coreData_namespaceObject = window["wp"]["coreData"];
;
const external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;
const PATTERN_TYPES = {
  theme: 'pattern',
  user: 'wp_block'
};
const PATTERN_DEFAULT_CATEGORY = 'all-patterns';
const PATTERN_USER_CATEGORY = 'my-patterns';
const EXCLUDED_PATTERN_SOURCES = ['core', 'pattern-directory/core', 'pattern-directory/featured'];
const PATTERN_SYNC_TYPES = {
  full: 'fully',
  unsynced: 'unsynced'
};
const PARTIAL_SYNCING_SUPPORTED_BLOCKS = {
  'core/paragraph': ['content'],
  'core/heading': ['content'],
  'core/button': ['text', 'url', 'linkTarget', 'rel'],
  'core/image': ['id', 'url', 'title', 'alt']
};
const PATTERN_OVERRIDES_BINDING_SOURCE = 'core/pattern-overrides';
;
const createPattern = (title, syncType, content, categories) => async ({
  registry
}) => {
  const meta = syncType === PATTERN_SYNC_TYPES.unsynced ? {
    wp_pattern_sync_status: syncType
  } : undefined;
  const reusableBlock = {
    title,
    content,
    status: 'publish',
    meta,
    wp_pattern_category: categories
  };
  const updatedRecord = await registry.dispatch(external_wp_coreData_namespaceObject.store).saveEntityRecord('postType', 'wp_block', reusableBlock);
  return updatedRecord;
};
const createPatternFromFile = (file, categories) => async ({
  dispatch
}) => {
  const fileContent = await file.text();
  let parsedContent;
  try {
    parsedContent = JSON.parse(fileContent);
  } catch (e) {
    throw new Error('Invalid JSON file');
  }
  if (parsedContent.__file !== 'wp_block' || !parsedContent.title || !parsedContent.content || typeof parsedContent.title !== 'string' || typeof parsedContent.content !== 'string' || parsedContent.syncStatus && typeof parsedContent.syncStatus !== 'string') {
    throw new Error('Invalid pattern JSON file');
  }
  const pattern = await dispatch.createPattern(parsedContent.title, parsedContent.syncStatus, parsedContent.content, categories);
  return pattern;
};
const convertSyncedPatternToStatic = clientId => ({
  registry
}) => {
  const patternBlock = registry.select(external_wp_blockEditor_namespaceObject.store).getBlock(clientId);
  const existingOverrides = patternBlock.attributes?.content;
  function cloneBlocksAndRemoveBindings(blocks) {
    return blocks.map(block => {
      let metadata = block.attributes.metadata;
      if (metadata) {
        metadata = {
          ...metadata
        };
        delete metadata.id;
        delete metadata.bindings;
        if (existingOverrides?.[metadata.name]) {
          for (const [attributeName, value] of Object.entries(existingOverrides[metadata.name])) {
            if (!(0,external_wp_blocks_namespaceObject.getBlockType)(block.name)?.attributes[attributeName]) {
              continue;
            }
            block.attributes[attributeName] = value;
          }
        }
      }
      return (0,external_wp_blocks_namespaceObject.cloneBlock)(block, {
        metadata: metadata && Object.keys(metadata).length > 0 ? metadata : undefined
      }, cloneBlocksAndRemoveBindings(block.innerBlocks));
    });
  }
  const patternInnerBlocks = registry.select(external_wp_blockEditor_namespaceObject.store).getBlocks(patternBlock.clientId);
  registry.dispatch(external_wp_blockEditor_namespaceObject.store).replaceBlocks(patternBlock.clientId, cloneBlocksAndRemoveBindings(patternInnerBlocks));
};
function setEditingPattern(clientId, isEditing) {
  return {
    type: 'SET_EDITING_PATTERN',
    clientId,
    isEditing
  };
}
;
const STORE_NAME = 'core/patterns';
;
function selectors_isEditingPattern(state, clientId) {
  return state.isEditingPattern[clientId];
}
;
const external_wp_privateApis_namespaceObject = window["wp"]["privateApis"];
;
const {
  lock,
  unlock
} = (0,external_wp_privateApis_namespaceObject.__dangerousOptInToUnstableAPIsOnlyForCoreModules)('I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.', '@wordpress/patterns');
;
const storeConfig = {
  reducer: reducer
};
const store = (0,external_wp_data_namespaceObject.createReduxStore)(STORE_NAME, {
  ...storeConfig
});
(0,external_wp_data_namespaceObject.register)(store);
unlock(store).registerPrivateActions(actions_namespaceObject);
unlock(store).registerPrivateSelectors(selectors_namespaceObject);
;
const external_wp_components_namespaceObject = window["wp"]["components"];
;
const external_wp_element_namespaceObject = window["wp"]["element"];
;
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;
function isOverridableBlock(block) {
  return Object.keys(PARTIAL_SYNCING_SUPPORTED_BLOCKS).includes(block.name) && !!block.attributes.metadata?.name && !!block.attributes.metadata?.bindings && Object.values(block.attributes.metadata.bindings).some(binding => binding.source === 'core/pattern-overrides');
}
function hasOverridableBlocks(blocks) {
  return blocks.some(block => {
    if (isOverridableBlock(block)) {
      return true;
    }
    return hasOverridableBlocks(block.innerBlocks);
  });
}
;
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;
const {
  BlockQuickNavigation
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
function OverridesPanel() {
  const allClientIds = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_blockEditor_namespaceObject.store).getClientIdsWithDescendants(), []);
  const {
    getBlock
  } = (0,external_wp_data_namespaceObject.useSelect)(external_wp_blockEditor_namespaceObject.store);
  const clientIdsWithOverrides = (0,external_wp_element_namespaceObject.useMemo)(() => allClientIds.filter(clientId => {
    const block = getBlock(clientId);
    return isOverridableBlock(block);
  }), [allClientIds, getBlock]);
  if (!clientIdsWithOverrides?.length) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
    title: (0,external_wp_i18n_namespaceObject.__)('Overrides'),
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(BlockQuickNavigation, {
      clientIds: clientIdsWithOverrides
    })
  });
}
;
const external_wp_notices_namespaceObject = window["wp"]["notices"];
;
const external_wp_compose_namespaceObject = window["wp"]["compose"];
;
const external_wp_htmlEntities_namespaceObject = window["wp"]["htmlEntities"];
;
const unescapeString = arg => {
  return (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(arg);
};
const CATEGORY_SLUG = 'wp_pattern_category';
function CategorySelector({
  categoryTerms,
  onChange,
  categoryMap
}) {
  const [search, setSearch] = (0,external_wp_element_namespaceObject.useState)('');
  const debouncedSearch = (0,external_wp_compose_namespaceObject.useDebounce)(setSearch, 500);
  const suggestions = (0,external_wp_element_namespaceObject.useMemo)(() => {
    return Array.from(categoryMap.values()).map(category => unescapeString(category.label)).filter(category => {
      if (search !== '') {
        return category.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    }).sort((a, b) => a.localeCompare(b));
  }, [search, categoryMap]);
  function handleChange(termNames) {
    const uniqueTerms = termNames.reduce((terms, newTerm) => {
      if (!terms.some(term => term.toLowerCase() === newTerm.toLowerCase())) {
        terms.push(newTerm);
      }
      return terms;
    }, []);
    onChange(uniqueTerms);
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.FormTokenField, {
    className: "patterns-menu-items__convert-modal-categories",
    value: categoryTerms,
    suggestions: suggestions,
    onChange: handleChange,
    onInputChange: debouncedSearch,
    label: (0,external_wp_i18n_namespaceObject.__)('Categories'),
    tokenizeOnBlur: true,
    __experimentalExpandOnFocus: true,
    __next40pxDefaultSize: true,
    __nextHasNoMarginBottom: true
  });
}
;
function useAddPatternCategory() {
  const {
    saveEntityRecord,
    invalidateResolution
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const {
    corePatternCategories,
    userPatternCategories
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getUserPatternCategories,
      getBlockPatternCategories
    } = select(external_wp_coreData_namespaceObject.store);
    return {
      corePatternCategories: getBlockPatternCategories(),
      userPatternCategories: getUserPatternCategories()
    };
  }, []);
  const categoryMap = (0,external_wp_element_namespaceObject.useMemo)(() => {
    const uniqueCategories = new Map();
    userPatternCategories.forEach(category => {
      uniqueCategories.set(category.label.toLowerCase(), {
        label: category.label,
        name: category.name,
        id: category.id
      });
    });
    corePatternCategories.forEach(category => {
      if (!uniqueCategories.has(category.label.toLowerCase()) &&
      category.name !== 'query') {
        uniqueCategories.set(category.label.toLowerCase(), {
          label: category.label,
          name: category.name
        });
      }
    });
    return uniqueCategories;
  }, [userPatternCategories, corePatternCategories]);
  async function findOrCreateTerm(term) {
    try {
      const existingTerm = categoryMap.get(term.toLowerCase());
      if (existingTerm?.id) {
        return existingTerm.id;
      }
      const termData = existingTerm ? {
        name: existingTerm.label,
        slug: existingTerm.name
      } : {
        name: term
      };
      const newTerm = await saveEntityRecord('taxonomy', CATEGORY_SLUG, termData, {
        throwOnError: true
      });
      invalidateResolution('getUserPatternCategories');
      return newTerm.id;
    } catch (error) {
      if (error.code !== 'term_exists') {
        throw error;
      }
      return error.data.term_id;
    }
  }
  return {
    categoryMap,
    findOrCreateTerm
  };
}
;
function CreatePatternModal({
  className = 'patterns-menu-items__convert-modal',
  modalTitle,
  ...restProps
}) {
  const defaultModalTitle = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_coreData_namespaceObject.store).getPostType(PATTERN_TYPES.user)?.labels?.add_new_item, []);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Modal, {
    title: modalTitle || defaultModalTitle,
    onRequestClose: restProps.onClose,
    overlayClassName: className,
    focusOnMount: "firstContentElement",
    size: "small",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(CreatePatternModalContents, {
      ...restProps
    })
  });
}
function CreatePatternModalContents({
  confirmLabel = (0,external_wp_i18n_namespaceObject.__)('Add'),
  defaultCategories = [],
  content,
  onClose,
  onError,
  onSuccess,
  defaultSyncType = PATTERN_SYNC_TYPES.full,
  defaultTitle = ''
}) {
  const [syncType, setSyncType] = (0,external_wp_element_namespaceObject.useState)(defaultSyncType);
  const [categoryTerms, setCategoryTerms] = (0,external_wp_element_namespaceObject.useState)(defaultCategories);
  const [title, setTitle] = (0,external_wp_element_namespaceObject.useState)(defaultTitle);
  const [isSaving, setIsSaving] = (0,external_wp_element_namespaceObject.useState)(false);
  const {
    createPattern
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(store));
  const {
    createErrorNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const {
    categoryMap,
    findOrCreateTerm
  } = useAddPatternCategory();
  async function onCreate(patternTitle, sync) {
    if (!title || isSaving) {
      return;
    }
    try {
      setIsSaving(true);
      const categories = await Promise.all(categoryTerms.map(termName => findOrCreateTerm(termName)));
      const newPattern = await createPattern(patternTitle, sync, typeof content === 'function' ? content() : content, categories);
      onSuccess({
        pattern: newPattern,
        categoryId: PATTERN_DEFAULT_CATEGORY
      });
    } catch (error) {
      createErrorNotice(error.message, {
        type: 'snackbar',
        id: 'pattern-create'
      });
      onError?.();
    } finally {
      setIsSaving(false);
      setCategoryTerms([]);
      setTitle('');
    }
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
    onSubmit: event => {
      event.preventDefault();
      onCreate(title, syncType);
    },
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      spacing: "5",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
        label: (0,external_wp_i18n_namespaceObject.__)('Name'),
        value: title,
        onChange: setTitle,
        placeholder: (0,external_wp_i18n_namespaceObject.__)('My pattern'),
        className: "patterns-create-modal__name-input",
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(CategorySelector, {
        categoryTerms: categoryTerms,
        onChange: setCategoryTerms,
        categoryMap: categoryMap
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToggleControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_namespaceObject._x)('Synced', 'pattern (singular)'),
        help: (0,external_wp_i18n_namespaceObject.__)('Sync this pattern across multiple locations.'),
        checked: syncType === PATTERN_SYNC_TYPES.full,
        onChange: () => {
          setSyncType(syncType === PATTERN_SYNC_TYPES.full ? PATTERN_SYNC_TYPES.unsynced : PATTERN_SYNC_TYPES.full);
        }
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
        justify: "right",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "tertiary",
          onClick: () => {
            onClose();
            setTitle('');
          },
          children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "primary",
          type: "submit",
          "aria-disabled": !title || isSaving,
          isBusy: isSaving,
          children: confirmLabel
        })]
      })]
    })
  });
}
;
function getTermLabels(pattern, categories) {
  if (pattern.type !== PATTERN_TYPES.user) {
    return categories.core?.filter(category => pattern.categories?.includes(category.name)).map(category => category.label);
  }
  return categories.user?.filter(category => pattern.wp_pattern_category?.includes(category.id)).map(category => category.label);
}
function useDuplicatePatternProps({
  pattern,
  onSuccess
}) {
  const {
    createSuccessNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const categories = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getUserPatternCategories,
      getBlockPatternCategories
    } = select(external_wp_coreData_namespaceObject.store);
    return {
      core: getBlockPatternCategories(),
      user: getUserPatternCategories()
    };
  });
  if (!pattern) {
    return null;
  }
  return {
    content: pattern.content,
    defaultCategories: getTermLabels(pattern, categories),
    defaultSyncType: pattern.type !== PATTERN_TYPES.user 
    ? PATTERN_SYNC_TYPES.unsynced : pattern.wp_pattern_sync_status || PATTERN_SYNC_TYPES.full,
    defaultTitle: (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject._x)('%s (Copy)', 'pattern'), typeof pattern.title === 'string' ? pattern.title : pattern.title.raw),
    onSuccess: ({
      pattern: newPattern
    }) => {
      createSuccessNotice((0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject._x)('"%s" duplicated.', 'pattern'), newPattern.title.raw), {
        type: 'snackbar',
        id: 'patterns-create'
      });
      onSuccess?.({
        pattern: newPattern
      });
    }
  };
}
function DuplicatePatternModal({
  pattern,
  onClose,
  onSuccess
}) {
  const duplicatedProps = useDuplicatePatternProps({
    pattern,
    onSuccess
  });
  if (!pattern) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(CreatePatternModal, {
    modalTitle: (0,external_wp_i18n_namespaceObject.__)('Duplicate pattern'),
    confirmLabel: (0,external_wp_i18n_namespaceObject.__)('Duplicate'),
    onClose: onClose,
    onError: onClose,
    ...duplicatedProps
  });
}
;
function RenamePatternModal({
  onClose,
  onError,
  onSuccess,
  pattern,
  ...props
}) {
  const originalName = (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(pattern.title);
  const [name, setName] = (0,external_wp_element_namespaceObject.useState)(originalName);
  const [isSaving, setIsSaving] = (0,external_wp_element_namespaceObject.useState)(false);
  const {
    editEntityRecord,
    __experimentalSaveSpecifiedEntityEdits: saveSpecifiedEntityEdits
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const {
    createSuccessNotice,
    createErrorNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const onRename = async event => {
    event.preventDefault();
    if (!name || name === pattern.title || isSaving) {
      return;
    }
    try {
      await editEntityRecord('postType', pattern.type, pattern.id, {
        title: name
      });
      setIsSaving(true);
      setName('');
      onClose?.();
      const savedRecord = await saveSpecifiedEntityEdits('postType', pattern.type, pattern.id, ['title'], {
        throwOnError: true
      });
      onSuccess?.(savedRecord);
      createSuccessNotice((0,external_wp_i18n_namespaceObject.__)('Pattern renamed'), {
        type: 'snackbar',
        id: 'pattern-update'
      });
    } catch (error) {
      onError?.();
      const errorMessage = error.message && error.code !== 'unknown_error' ? error.message : (0,external_wp_i18n_namespaceObject.__)('An error occurred while renaming the pattern.');
      createErrorNotice(errorMessage, {
        type: 'snackbar',
        id: 'pattern-update'
      });
    } finally {
      setIsSaving(false);
      setName('');
    }
  };
  const onRequestClose = () => {
    onClose?.();
    setName('');
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Modal, {
    title: (0,external_wp_i18n_namespaceObject.__)('Rename'),
    ...props,
    onRequestClose: onClose,
    focusOnMount: "firstContentElement",
    size: "small",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
      onSubmit: onRename,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
        spacing: "5",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_namespaceObject.__)('Name'),
          value: name,
          onChange: setName,
          required: true
        }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
          justify: "right",
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            variant: "tertiary",
            onClick: onRequestClose,
            children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            variant: "primary",
            type: "submit",
            children: (0,external_wp_i18n_namespaceObject.__)('Save')
          })]
        })]
      })
    })
  });
}
;
const external_wp_primitives_namespaceObject = window["wp"]["primitives"];
;
const symbol = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M21.3 10.8l-5.6-5.6c-.7-.7-1.8-.7-2.5 0l-5.6 5.6c-.7.7-.7 1.8 0 2.5l5.6 5.6c.3.3.8.5 1.2.5s.9-.2 1.2-.5l5.6-5.6c.8-.7.8-1.9.1-2.5zm-1 1.4l-5.6 5.6c-.1.1-.3.1-.4 0l-5.6-5.6c-.1-.1-.1-.3 0-.4l5.6-5.6s.1-.1.2-.1.1 0 .2.1l5.6 5.6c.1.1.1.3 0 .4zm-16.6-.4L10 5.5l-1-1-6.3 6.3c-.7.7-.7 1.8 0 2.5L9 19.5l1.1-1.1-6.3-6.3c-.2 0-.2-.2-.1-.3z"
  })
});
 const library_symbol = (symbol);
;
function PatternConvertButton({
  clientIds,
  rootClientId,
  closeBlockSettingsMenu
}) {
  const {
    createSuccessNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const {
    replaceBlocks
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  const {
    setEditingPattern
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(store));
  const [isModalOpen, setIsModalOpen] = (0,external_wp_element_namespaceObject.useState)(false);
  const canConvert = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _getBlocksByClientId;
    const {
      canUser
    } = select(external_wp_coreData_namespaceObject.store);
    const {
      getBlocksByClientId,
      canInsertBlockType,
      getBlockRootClientId
    } = select(external_wp_blockEditor_namespaceObject.store);
    const rootId = rootClientId || (clientIds.length > 0 ? getBlockRootClientId(clientIds[0]) : undefined);
    const blocks = (_getBlocksByClientId = getBlocksByClientId(clientIds)) !== null && _getBlocksByClientId !== void 0 ? _getBlocksByClientId : [];
    const hasReusableBlockSupport = blockName => {
      const blockType = (0,external_wp_blocks_namespaceObject.getBlockType)(blockName);
      const hasParent = blockType && 'parent' in blockType;
      return (0,external_wp_blocks_namespaceObject.hasBlockSupport)(blockName, 'reusable', !hasParent);
    };
    const isReusable = blocks.length === 1 && blocks[0] && (0,external_wp_blocks_namespaceObject.isReusableBlock)(blocks[0]) && !!select(external_wp_coreData_namespaceObject.store).getEntityRecord('postType', 'wp_block', blocks[0].attributes.ref);
    const _canConvert =
    !isReusable &&
    canInsertBlockType('core/block', rootId) && blocks.every(block =>
    !!block &&
    block.isValid &&
    hasReusableBlockSupport(block.name)) &&
    !!canUser('create', {
      kind: 'postType',
      name: 'wp_block'
    });
    return _canConvert;
  }, [clientIds, rootClientId]);
  const {
    getBlocksByClientId
  } = (0,external_wp_data_namespaceObject.useSelect)(external_wp_blockEditor_namespaceObject.store);
  const getContent = (0,external_wp_element_namespaceObject.useCallback)(() => (0,external_wp_blocks_namespaceObject.serialize)(getBlocksByClientId(clientIds)), [getBlocksByClientId, clientIds]);
  if (!canConvert) {
    return null;
  }
  const handleSuccess = ({
    pattern
  }) => {
    if (pattern.wp_pattern_sync_status !== PATTERN_SYNC_TYPES.unsynced) {
      const newBlock = (0,external_wp_blocks_namespaceObject.createBlock)('core/block', {
        ref: pattern.id
      });
      replaceBlocks(clientIds, newBlock);
      setEditingPattern(newBlock.clientId, true);
      closeBlockSettingsMenu();
    }
    createSuccessNotice(pattern.wp_pattern_sync_status === PATTERN_SYNC_TYPES.unsynced ? (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('Unsynced pattern created: %s'), pattern.title.raw) : (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('Synced pattern created: %s'), pattern.title.raw), {
      type: 'snackbar',
      id: 'convert-to-pattern-success'
    });
    setIsModalOpen(false);
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
      icon: library_symbol,
      onClick: () => setIsModalOpen(true),
      "aria-expanded": isModalOpen,
      "aria-haspopup": "dialog",
      children: (0,external_wp_i18n_namespaceObject.__)('Create pattern')
    }), isModalOpen && (0,external_ReactJSXRuntime_namespaceObject.jsx)(CreatePatternModal, {
      content: getContent,
      onSuccess: pattern => {
        handleSuccess(pattern);
      },
      onError: () => {
        setIsModalOpen(false);
      },
      onClose: () => {
        setIsModalOpen(false);
      }
    })]
  });
}
;
const external_wp_url_namespaceObject = window["wp"]["url"];
;
function PatternsManageButton({
  clientId
}) {
  const {
    canRemove,
    isVisible,
    managePatternsUrl
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getBlock,
      canRemoveBlock,
      getBlockCount
    } = select(external_wp_blockEditor_namespaceObject.store);
    const {
      canUser
    } = select(external_wp_coreData_namespaceObject.store);
    const reusableBlock = getBlock(clientId);
    return {
      canRemove: canRemoveBlock(clientId),
      isVisible: !!reusableBlock && (0,external_wp_blocks_namespaceObject.isReusableBlock)(reusableBlock) && !!canUser('update', {
        kind: 'postType',
        name: 'wp_block',
        id: reusableBlock.attributes.ref
      }),
      innerBlockCount: getBlockCount(clientId),
      managePatternsUrl: canUser('create', {
        kind: 'postType',
        name: 'wp_template'
      }) ? (0,external_wp_url_namespaceObject.addQueryArgs)('site-editor.php', {
        path: '/patterns'
      }) : (0,external_wp_url_namespaceObject.addQueryArgs)('edit.php', {
        post_type: 'wp_block'
      })
    };
  }, [clientId]);
  const {
    convertSyncedPatternToStatic
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(store));
  if (!isVisible) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [canRemove && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
      onClick: () => convertSyncedPatternToStatic(clientId),
      children: (0,external_wp_i18n_namespaceObject.__)('Detach')
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
      href: managePatternsUrl,
      children: (0,external_wp_i18n_namespaceObject.__)('Manage patterns')
    })]
  });
}
 const patterns_manage_button = (PatternsManageButton);
;
function PatternsMenuItems({
  rootClientId
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockSettingsMenuControls, {
    children: ({
      selectedClientIds,
      onClose
    }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(PatternConvertButton, {
        clientIds: selectedClientIds,
        rootClientId: rootClientId,
        closeBlockSettingsMenu: onClose
      }), selectedClientIds.length === 1 && (0,external_ReactJSXRuntime_namespaceObject.jsx)(patterns_manage_button, {
        clientId: selectedClientIds[0]
      })]
    })
  });
}
;
const external_wp_a11y_namespaceObject = window["wp"]["a11y"];
;
function RenamePatternCategoryModal({
  category,
  existingCategories,
  onClose,
  onError,
  onSuccess,
  ...props
}) {
  const id = (0,external_wp_element_namespaceObject.useId)();
  const textControlRef = (0,external_wp_element_namespaceObject.useRef)();
  const [name, setName] = (0,external_wp_element_namespaceObject.useState)((0,external_wp_htmlEntities_namespaceObject.decodeEntities)(category.name));
  const [isSaving, setIsSaving] = (0,external_wp_element_namespaceObject.useState)(false);
  const [validationMessage, setValidationMessage] = (0,external_wp_element_namespaceObject.useState)(false);
  const validationMessageId = validationMessage ? `patterns-rename-pattern-category-modal__validation-message-${id}` : undefined;
  const {
    saveEntityRecord,
    invalidateResolution
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const {
    createErrorNotice,
    createSuccessNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const onChange = newName => {
    if (validationMessage) {
      setValidationMessage(undefined);
    }
    setName(newName);
  };
  const onSave = async event => {
    event.preventDefault();
    if (isSaving) {
      return;
    }
    if (!name || name === category.name) {
      const message = (0,external_wp_i18n_namespaceObject.__)('Please enter a new name for this category.');
      (0,external_wp_a11y_namespaceObject.speak)(message, 'assertive');
      setValidationMessage(message);
      textControlRef.current?.focus();
      return;
    }
    if (existingCategories.patternCategories.find(existingCategory => {
      return existingCategory.id !== category.id && existingCategory.label.toLowerCase() === name.toLowerCase();
    })) {
      const message = (0,external_wp_i18n_namespaceObject.__)('This category already exists. Please use a different name.');
      (0,external_wp_a11y_namespaceObject.speak)(message, 'assertive');
      setValidationMessage(message);
      textControlRef.current?.focus();
      return;
    }
    try {
      setIsSaving(true);
      const savedRecord = await saveEntityRecord('taxonomy', CATEGORY_SLUG, {
        id: category.id,
        slug: category.slug,
        name
      });
      invalidateResolution('getUserPatternCategories');
      onSuccess?.(savedRecord);
      onClose();
      createSuccessNotice((0,external_wp_i18n_namespaceObject.__)('Pattern category renamed.'), {
        type: 'snackbar',
        id: 'pattern-category-update'
      });
    } catch (error) {
      onError?.();
      createErrorNotice(error.message, {
        type: 'snackbar',
        id: 'pattern-category-update'
      });
    } finally {
      setIsSaving(false);
      setName('');
    }
  };
  const onRequestClose = () => {
    onClose();
    setName('');
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Modal, {
    title: (0,external_wp_i18n_namespaceObject.__)('Rename'),
    onRequestClose: onRequestClose,
    ...props,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
      onSubmit: onSave,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
        spacing: "5",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
          spacing: "2",
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
            ref: textControlRef,
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true,
            label: (0,external_wp_i18n_namespaceObject.__)('Name'),
            value: name,
            onChange: onChange,
            "aria-describedby": validationMessageId,
            required: true
          }), validationMessage && (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
            className: "patterns-rename-pattern-category-modal__validation-message",
            id: validationMessageId,
            children: validationMessage
          })]
        }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
          justify: "right",
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            variant: "tertiary",
            onClick: onRequestClose,
            children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            variant: "primary",
            type: "submit",
            "aria-disabled": !name || name === category.name || isSaving,
            isBusy: isSaving,
            children: (0,external_wp_i18n_namespaceObject.__)('Save')
          })]
        })]
      })
    })
  });
}
;
function AllowOverridesModal({
  placeholder,
  initialName = '',
  onClose,
  onSave
}) {
  const [editedBlockName, setEditedBlockName] = (0,external_wp_element_namespaceObject.useState)(initialName);
  const descriptionId = (0,external_wp_element_namespaceObject.useId)();
  const isNameValid = !!editedBlockName.trim();
  const handleSubmit = () => {
    if (editedBlockName !== initialName) {
      const message = (0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject.__)('Block name changed to: "%s".'), editedBlockName);
      (0,external_wp_a11y_namespaceObject.speak)(message, 'assertive');
    }
    onSave(editedBlockName);
    onClose();
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Modal, {
    title: (0,external_wp_i18n_namespaceObject.__)('Enable overrides'),
    onRequestClose: onClose,
    focusOnMount: "firstContentElement",
    aria: {
      describedby: descriptionId
    },
    size: "small",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
      onSubmit: event => {
        event.preventDefault();
        if (!isNameValid) {
          return;
        }
        handleSubmit();
      },
      children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
        spacing: "6",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
          id: descriptionId,
          children: (0,external_wp_i18n_namespaceObject.__)('Overrides are changes you make to a block within a synced pattern instance. Use overrides to customize a synced pattern instance to suit its new context. Name this block to specify an override.')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          value: editedBlockName,
          label: (0,external_wp_i18n_namespaceObject.__)('Name'),
          help: (0,external_wp_i18n_namespaceObject.__)('For example, if you are creating a recipe pattern, you use "Recipe Title", "Recipe Description", etc.'),
          placeholder: placeholder,
          onChange: setEditedBlockName
        }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
          justify: "right",
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            variant: "tertiary",
            onClick: onClose,
            children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            "aria-disabled": !isNameValid,
            variant: "primary",
            type: "submit",
            children: (0,external_wp_i18n_namespaceObject.__)('Enable')
          })]
        })]
      })
    })
  });
}
function DisallowOverridesModal({
  onClose,
  onSave
}) {
  const descriptionId = (0,external_wp_element_namespaceObject.useId)();
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Modal, {
    title: (0,external_wp_i18n_namespaceObject.__)('Disable overrides'),
    onRequestClose: onClose,
    aria: {
      describedby: descriptionId
    },
    size: "small",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
      onSubmit: event => {
        event.preventDefault();
        onSave();
        onClose();
      },
      children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
        spacing: "6",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
          id: descriptionId,
          children: (0,external_wp_i18n_namespaceObject.__)('Are you sure you want to disable overrides? Disabling overrides will revert all applied overrides for this block throughout instances of this pattern.')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
          justify: "right",
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            variant: "tertiary",
            onClick: onClose,
            children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            variant: "primary",
            type: "submit",
            children: (0,external_wp_i18n_namespaceObject.__)('Disable')
          })]
        })]
      })
    })
  });
}
;
function PatternOverridesControls({
  attributes,
  setAttributes,
  name: blockName
}) {
  const controlId = (0,external_wp_element_namespaceObject.useId)();
  const [showAllowOverridesModal, setShowAllowOverridesModal] = (0,external_wp_element_namespaceObject.useState)(false);
  const [showDisallowOverridesModal, setShowDisallowOverridesModal] = (0,external_wp_element_namespaceObject.useState)(false);
  const hasName = !!attributes.metadata?.name;
  const defaultBindings = attributes.metadata?.bindings?.__default;
  const hasOverrides = hasName && defaultBindings?.source === PATTERN_OVERRIDES_BINDING_SOURCE;
  const isConnectedToOtherSources = defaultBindings?.source && defaultBindings.source !== PATTERN_OVERRIDES_BINDING_SOURCE;
  const {
    updateBlockBindings
  } = (0,external_wp_blockEditor_namespaceObject.useBlockBindingsUtils)();
  function updateBindings(isChecked, customName) {
    if (customName) {
      setAttributes({
        metadata: {
          ...attributes.metadata,
          name: customName
        }
      });
    }
    updateBlockBindings({
      __default: isChecked ? {
        source: PATTERN_OVERRIDES_BINDING_SOURCE
      } : undefined
    });
  }
  if (isConnectedToOtherSources) {
    return null;
  }
  const hasUnsupportedImageAttributes = blockName === 'core/image' && (!!attributes.caption?.length || !!attributes.href?.length);
  const helpText = !hasOverrides && hasUnsupportedImageAttributes ? (0,external_wp_i18n_namespaceObject.__)(`Overrides currently don't support image captions or links. Remove the caption or link first before enabling overrides.`) : (0,external_wp_i18n_namespaceObject.__)('Allow changes to this block throughout instances of this pattern.');
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.InspectorControls, {
      group: "advanced",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.BaseControl, {
        __nextHasNoMarginBottom: true,
        id: controlId,
        label: (0,external_wp_i18n_namespaceObject.__)('Overrides'),
        help: helpText,
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          className: "pattern-overrides-control__allow-overrides-button",
          variant: "secondary",
          "aria-haspopup": "dialog",
          onClick: () => {
            if (hasOverrides) {
              setShowDisallowOverridesModal(true);
            } else {
              setShowAllowOverridesModal(true);
            }
          },
          disabled: !hasOverrides && hasUnsupportedImageAttributes,
          accessibleWhenDisabled: true,
          children: hasOverrides ? (0,external_wp_i18n_namespaceObject.__)('Disable overrides') : (0,external_wp_i18n_namespaceObject.__)('Enable overrides')
        })
      })
    }), showAllowOverridesModal && (0,external_ReactJSXRuntime_namespaceObject.jsx)(AllowOverridesModal, {
      initialName: attributes.metadata?.name,
      onClose: () => setShowAllowOverridesModal(false),
      onSave: newName => {
        updateBindings(true, newName);
      }
    }), showDisallowOverridesModal && (0,external_ReactJSXRuntime_namespaceObject.jsx)(DisallowOverridesModal, {
      onClose: () => setShowDisallowOverridesModal(false),
      onSave: () => updateBindings(false)
    })]
  });
}
 const pattern_overrides_controls = (PatternOverridesControls);
;
const CONTENT = 'content';
function ResetOverridesControl(props) {
  const name = props.attributes.metadata?.name;
  const registry = (0,external_wp_data_namespaceObject.useRegistry)();
  const isOverridden = (0,external_wp_data_namespaceObject.useSelect)(select => {
    if (!name) {
      return;
    }
    const {
      getBlockAttributes,
      getBlockParentsByBlockName
    } = select(external_wp_blockEditor_namespaceObject.store);
    const [patternClientId] = getBlockParentsByBlockName(props.clientId, 'core/block', true);
    if (!patternClientId) {
      return;
    }
    const overrides = getBlockAttributes(patternClientId)[CONTENT];
    if (!overrides) {
      return;
    }
    return overrides.hasOwnProperty(name);
  }, [props.clientId, name]);
  function onClick() {
    const {
      getBlockAttributes,
      getBlockParentsByBlockName
    } = registry.select(external_wp_blockEditor_namespaceObject.store);
    const [patternClientId] = getBlockParentsByBlockName(props.clientId, 'core/block', true);
    if (!patternClientId) {
      return;
    }
    const overrides = getBlockAttributes(patternClientId)[CONTENT];
    if (!overrides.hasOwnProperty(name)) {
      return;
    }
    const {
      updateBlockAttributes,
      __unstableMarkLastChangeAsPersistent
    } = registry.dispatch(external_wp_blockEditor_namespaceObject.store);
    __unstableMarkLastChangeAsPersistent();
    let newOverrides = {
      ...overrides
    };
    delete newOverrides[name];
    if (!Object.keys(newOverrides).length) {
      newOverrides = undefined;
    }
    updateBlockAttributes(patternClientId, {
      [CONTENT]: newOverrides
    });
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__unstableBlockToolbarLastItem, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToolbarGroup, {
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToolbarButton, {
        onClick: onClick,
        disabled: !isOverridden,
        children: (0,external_wp_i18n_namespaceObject.__)('Reset')
      })
    })
  });
}
;
const copy = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M5 4.5h11a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5ZM3 5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm17 3v10.75c0 .69-.56 1.25-1.25 1.25H6v1.5h12.75a2.75 2.75 0 0 0 2.75-2.75V8H20Z"
  })
});
 const library_copy = (copy);
;
const {
  useBlockDisplayTitle
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
function PatternOverridesToolbarIndicator({
  clientIds
}) {
  const isSingleBlockSelected = clientIds.length === 1;
  const {
    icon,
    firstBlockName
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getBlockAttributes,
      getBlockNamesByClientId
    } = select(external_wp_blockEditor_namespaceObject.store);
    const {
      getBlockType,
      getActiveBlockVariation
    } = select(external_wp_blocks_namespaceObject.store);
    const blockTypeNames = getBlockNamesByClientId(clientIds);
    const _firstBlockTypeName = blockTypeNames[0];
    const firstBlockType = getBlockType(_firstBlockTypeName);
    let _icon;
    if (isSingleBlockSelected) {
      const match = getActiveBlockVariation(_firstBlockTypeName, getBlockAttributes(clientIds[0]));
      _icon = match?.icon || firstBlockType.icon;
    } else {
      const isSelectionOfSameType = new Set(blockTypeNames).size === 1;
      _icon = isSelectionOfSameType ? firstBlockType.icon : library_copy;
    }
    return {
      icon: _icon,
      firstBlockName: getBlockAttributes(clientIds[0]).metadata.name
    };
  }, [clientIds, isSingleBlockSelected]);
  const firstBlockTitle = useBlockDisplayTitle({
    clientId: clientIds[0],
    maximumLength: 35
  });
  const blockDescription = isSingleBlockSelected ? (0,external_wp_i18n_namespaceObject.sprintf)(
  (0,external_wp_i18n_namespaceObject.__)('This %1$s is editable using the "%2$s" override.'), firstBlockTitle.toLowerCase(), firstBlockName) : (0,external_wp_i18n_namespaceObject.__)('These blocks are editable using overrides.');
  const descriptionId = (0,external_wp_element_namespaceObject.useId)();
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToolbarItem, {
    children: toggleProps => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.DropdownMenu, {
      className: "patterns-pattern-overrides-toolbar-indicator",
      label: firstBlockTitle,
      popoverProps: {
        placement: 'bottom-start',
        className: 'patterns-pattern-overrides-toolbar-indicator__popover'
      },
      icon: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_ReactJSXRuntime_namespaceObject.Fragment, {
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockIcon, {
          icon: icon,
          className: "patterns-pattern-overrides-toolbar-indicator-icon",
          showColors: true
        })
      }),
      toggleProps: {
        description: blockDescription,
        ...toggleProps
      },
      menuProps: {
        orientation: 'both',
        'aria-describedby': descriptionId
      },
      children: () => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
        id: descriptionId,
        children: blockDescription
      })
    })
  });
}
function PatternOverridesBlockControls() {
  const {
    clientIds,
    hasPatternOverrides,
    hasParentPattern
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getBlockAttributes,
      getSelectedBlockClientIds,
      getBlockParentsByBlockName
    } = select(external_wp_blockEditor_namespaceObject.store);
    const selectedClientIds = getSelectedBlockClientIds();
    const _hasPatternOverrides = selectedClientIds.every(clientId => {
      var _getBlockAttributes$m;
      return Object.values((_getBlockAttributes$m = getBlockAttributes(clientId)?.metadata?.bindings) !== null && _getBlockAttributes$m !== void 0 ? _getBlockAttributes$m : {}).some(binding => binding?.source === PATTERN_OVERRIDES_BINDING_SOURCE);
    });
    const _hasParentPattern = selectedClientIds.every(clientId => getBlockParentsByBlockName(clientId, 'core/block', true).length > 0);
    return {
      clientIds: selectedClientIds,
      hasPatternOverrides: _hasPatternOverrides,
      hasParentPattern: _hasParentPattern
    };
  }, []);
  return hasPatternOverrides && hasParentPattern ? (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockControls, {
    group: "parent",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PatternOverridesToolbarIndicator, {
      clientIds: clientIds
    })
  }) : null;
}
;
const privateApis = {};
lock(privateApis, {
  OverridesPanel: OverridesPanel,
  CreatePatternModal: CreatePatternModal,
  CreatePatternModalContents: CreatePatternModalContents,
  DuplicatePatternModal: DuplicatePatternModal,
  isOverridableBlock: isOverridableBlock,
  hasOverridableBlocks: hasOverridableBlocks,
  useDuplicatePatternProps: useDuplicatePatternProps,
  RenamePatternModal: RenamePatternModal,
  PatternsMenuItems: PatternsMenuItems,
  RenamePatternCategoryModal: RenamePatternCategoryModal,
  PatternOverridesControls: pattern_overrides_controls,
  ResetOverridesControl: ResetOverridesControl,
  PatternOverridesBlockControls: PatternOverridesBlockControls,
  useAddPatternCategory: useAddPatternCategory,
  PATTERN_TYPES: PATTERN_TYPES,
  PATTERN_DEFAULT_CATEGORY: PATTERN_DEFAULT_CATEGORY,
  PATTERN_USER_CATEGORY: PATTERN_USER_CATEGORY,
  EXCLUDED_PATTERN_SOURCES: EXCLUDED_PATTERN_SOURCES,
  PATTERN_SYNC_TYPES: PATTERN_SYNC_TYPES,
  PARTIAL_SYNCING_SUPPORTED_BLOCKS: PARTIAL_SYNCING_SUPPORTED_BLOCKS
});
;
(window.wp = window.wp || {}).patterns = __webpack_exports__;
 })()
;