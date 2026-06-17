/**
 * @file
 * Contains drupal-asset.js
 */
(function(window) {
  window['drupal-asset'] = (editor, opts = {}) => {
    const assetManager = editor.AssetManager;

    const normalizeUploadedAssets = (response) => {
      if (!response) {
        return [];
      }
      if (Array.isArray(response)) {
        return response;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    };

    const moveAssetsToTop = (assets) => {
      if (!assets || !assets.length) {
        return;
      }

      const collection = assetManager.getAll && assetManager.getAll();
      if (!collection) {
        return;
      }

      for (let i = assets.length - 1; i >= 0; i--) {
        const assetData = assets[i];
        const src = typeof assetData === 'string' ? assetData : assetData && assetData.src;
        if (!src) {
          continue;
        }

        const assetModel = assetManager.get(src);
        if (!assetModel) {
          continue;
        }

        collection.remove(assetModel, { silent: true });
        collection.add(assetModel, { at: 0 });
      }
    };

    editor.on('asset:upload:response', (response) => {
      const assets = normalizeUploadedAssets(response);
      if (!assets.length) {
        return;
      }

      // Wait for GrapesJS to add new assets, then reorder.
      setTimeout(() => moveAssetsToTop(assets), 0);
    });

    /* Add data attributes to track Drupal files */
    editor.on('component:update:src', (component) => {
      if (component.is('image')) {
        const componentAttrs = component.getAttributes();
        const asset = assetManager.get(componentAttrs.src);
        const assetData = asset && asset.attributes && asset.attributes.data;

        if (assetData) {
          const attrs = Object.keys(assetData).reduce((accumulator, key) => {
            if (!componentAttrs[`data-${key}`] || componentAttrs[`data-${key}`] !== assetData[key]) {
              accumulator[`data-${key}`] = assetData[key];
            }
            return accumulator;
          }, {});

          if (Object.keys(attrs).length > 0) {
             component.addAttributes(attrs);
          }
        }
      }
    });
  };
})(window);
