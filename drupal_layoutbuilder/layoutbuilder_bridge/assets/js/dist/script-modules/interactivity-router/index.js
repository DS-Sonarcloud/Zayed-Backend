import * as __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__ from "@wordpress/interactivity";
 var __webpack_modules__ = ({
 317:
 ((module) => {
module.exports = import("@wordpress/a11y");;
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
  o: () => ( actions),
  w: () => ( state)
});
;
var x = (y) => {
	var x = {}; __webpack_require__.d(x, y); return x
} 
var y = (x) => (() => (x))
const interactivity_namespaceObject = x({ ["getConfig"]: () => (__WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__.getConfig), ["privateApis"]: () => (__WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__.privateApis), ["store"]: () => (__WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__.store) });
;
const headElements = new Map();
const updateHead = async newHead => {
  const getTagId = tag => tag.id || tag.outerHTML;
  const newHeadMap = new Map();
  for (const child of newHead) {
    newHeadMap.set(getTagId(child), child);
  }
  const toRemove = [];
  for (const child of document.head.children) {
    const id = getTagId(child);
    if (child.nodeName === 'LINK' || child.nodeName === 'STYLE') {
      toRemove.push(child);
    } else if (newHeadMap.has(id)) {
      newHeadMap.delete(id);
    } else if (child.nodeName !== 'SCRIPT' && child.nodeName !== 'META') {
      toRemove.push(child);
    }
  }
  await Promise.all([...headElements.entries()].filter(([, {
    tag
  }]) => tag.nodeName === 'SCRIPT').map(async ([url]) => {
    await import(url);
  }));
  const toAppend = [...newHeadMap.values()];
  toRemove.forEach(n => n.remove());
  document.head.append(...toAppend);
};
const fetchHeadAssets = async doc => {
  const headTags = [];
  const scripts = doc.querySelectorAll('script[type="module"][src]');
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (!headElements.has(src)) {
      const link = doc.createElement('link');
      link.rel = 'modulepreload';
      link.href = src;
      document.head.append(link);
      headElements.set(src, {
        tag: script
      });
    }
  });
  const stylesheets = doc.querySelectorAll('link[rel=stylesheet]');
  await Promise.all(Array.from(stylesheets).map(async tag => {
    const href = tag.getAttribute('href');
    if (!href) {
      return;
    }
    if (!headElements.has(href)) {
      try {
        const response = await fetch(href);
        const text = await response.text();
        headElements.set(href, {
          tag,
          text
        });
      } catch (e) {
        console.error(e);
      }
    }
    const headElement = headElements.get(href);
    const styleElement = doc.createElement('style');
    styleElement.textContent = headElement.text;
    headTags.push(styleElement);
  }));
  return [doc.querySelector('title'), ...doc.querySelectorAll('style'), ...headTags];
};
;
var _getConfig$navigation;
const {
  directivePrefix,
  getRegionRootFragment,
  initialVdom,
  toVdom,
  render,
  parseServerData,
  populateServerData,
  batch
} = (0,interactivity_namespaceObject.privateApis)('I acknowledge that using private APIs means my theme or plugin will inevitably break in the next version of WordPress.');
const navigationMode = (_getConfig$navigation = (0,interactivity_namespaceObject.getConfig)('core/router').navigationMode) !== null && _getConfig$navigation !== void 0 ? _getConfig$navigation : 'regionBased';
const pages = new Map();
const getPagePath = url => {
  const u = new URL(url, window.location.href);
  return u.pathname + u.search;
};
const fetchPage = async (url, {
  html
}) => {
  try {
    if (!html) {
      const res = await window.fetch(url);
      if (res.status !== 200) {
        return false;
      }
      html = await res.text();
    }
    const dom = new window.DOMParser().parseFromString(html, 'text/html');
    return regionsToVdom(dom);
  } catch (e) {
    return false;
  }
};
const regionsToVdom = async (dom, {
  vdom
} = {}) => {
  const regions = {
    body: undefined
  };
  let head;
  if (false) {}
  if (navigationMode === 'regionBased') {
    const attrName = `data-${directivePrefix}-router-region`;
    dom.querySelectorAll(`[${attrName}]`).forEach(region => {
      const id = region.getAttribute(attrName);
      regions[id] = vdom?.has(region) ? vdom.get(region) : toVdom(region);
    });
  }
  const title = dom.querySelector('title')?.innerText;
  const initialData = parseServerData(dom);
  return {
    regions,
    head,
    title,
    initialData
  };
};
const renderRegions = async page => {
  if (false) {}
  if (navigationMode === 'regionBased') {
    const attrName = `data-${directivePrefix}-router-region`;
    batch(() => {
      populateServerData(page.initialData);
      document.querySelectorAll(`[${attrName}]`).forEach(region => {
        const id = region.getAttribute(attrName);
        const fragment = getRegionRootFragment(region);
        render(page.regions[id], fragment);
      });
    });
  }
  if (page.title) {
    document.title = page.title;
  }
};
const forcePageReload = href => {
  window.location.assign(href);
  return new Promise(() => {});
};
window.addEventListener('popstate', async () => {
  const pagePath = getPagePath(window.location.href); 
  const page = pages.has(pagePath) && (await pages.get(pagePath));
  if (page) {
    await renderRegions(page);
    state.url = window.location.href;
  } else {
    window.location.reload();
  }
});
if (false) {}
pages.set(getPagePath(window.location.href), Promise.resolve(regionsToVdom(document, {
  vdom: initialVdom
})));
const isValidLink = ref => ref && ref instanceof window.HTMLAnchorElement && ref.href && (!ref.target || ref.target === '_self') && ref.origin === window.location.origin && !ref.pathname.startsWith('/wp-admin') && !ref.pathname.startsWith('/wp-login.php') && !ref.getAttribute('href').startsWith('#') && !new URL(ref.href).searchParams.has('_wpnonce');
const isValidEvent = event => event && event.button === 0 &&
!event.metaKey &&
!event.ctrlKey &&
!event.altKey &&
!event.shiftKey && !event.defaultPrevented;
let navigatingTo = '';
let hasLoadedNavigationTextsData = false;
const navigationTexts = {
  loading: 'Loading page, please wait.',
  loaded: 'Page Loaded.'
};
const {
  state,
  actions
} = (0,interactivity_namespaceObject.store)('core/router', {
  state: {
    url: window.location.href,
    navigation: {
      hasStarted: false,
      hasFinished: false
    }
  },
  actions: {
    *navigate(href, options = {}) {
      const {
        clientNavigationDisabled
      } = (0,interactivity_namespaceObject.getConfig)();
      if (clientNavigationDisabled) {
        yield forcePageReload(href);
      }
      const pagePath = getPagePath(href);
      const {
        navigation
      } = state;
      const {
        loadingAnimation = true,
        screenReaderAnnouncement = true,
        timeout = 10000
      } = options;
      navigatingTo = href;
      actions.prefetch(pagePath, options);
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, timeout));
      const loadingTimeout = setTimeout(() => {
        if (navigatingTo !== href) {
          return;
        }
        if (loadingAnimation) {
          navigation.hasStarted = true;
          navigation.hasFinished = false;
        }
        if (screenReaderAnnouncement) {
          a11ySpeak('loading');
        }
      }, 400);
      const page = yield Promise.race([pages.get(pagePath), timeoutPromise]);
      clearTimeout(loadingTimeout);
      if (navigatingTo !== href) {
        return;
      }
      if (page && !page.initialData?.config?.['core/router']?.clientNavigationDisabled) {
        yield renderRegions(page);
        window.history[options.replace ? 'replaceState' : 'pushState']({}, '', href);
        state.url = href;
        if (loadingAnimation) {
          navigation.hasStarted = false;
          navigation.hasFinished = true;
        }
        if (screenReaderAnnouncement) {
          a11ySpeak('loaded');
        }
        const {
          hash
        } = new URL(href, window.location.href);
        if (hash) {
          document.querySelector(hash)?.scrollIntoView();
        }
      } else {
        yield forcePageReload(href);
      }
    },
    prefetch(url, options = {}) {
      const {
        clientNavigationDisabled
      } = (0,interactivity_namespaceObject.getConfig)();
      if (clientNavigationDisabled) {
        return;
      }
      const pagePath = getPagePath(url);
      if (options.force || !pages.has(pagePath)) {
        pages.set(pagePath, fetchPage(pagePath, {
          html: options.html
        }));
      }
    }
  }
});
function a11ySpeak(messageKey) {
  if (!hasLoadedNavigationTextsData) {
    hasLoadedNavigationTextsData = true;
    const content = document.getElementById('wp-script-module-data-@wordpress/interactivity-router')?.textContent;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        if (typeof parsed?.i18n?.loading === 'string') {
          navigationTexts.loading = parsed.i18n.loading;
        }
        if (typeof parsed?.i18n?.loaded === 'string') {
          navigationTexts.loaded = parsed.i18n.loaded;
        }
      } catch {}
    } else {
      if (state.navigation.texts?.loading) {
        navigationTexts.loading = state.navigation.texts.loading;
      }
      if (state.navigation.texts?.loaded) {
        navigationTexts.loaded = state.navigation.texts.loaded;
      }
    }
  }
  const message = navigationTexts[messageKey];
  Promise.resolve().then(__webpack_require__.bind(__webpack_require__, 317)).then(({
    speak
  }) => speak(message),
  () => {});
}
if (false) {}
var __webpack_exports__actions = __webpack_exports__.o;
var __webpack_exports__state = __webpack_exports__.w;
export { __webpack_exports__actions as actions, __webpack_exports__state as state };
