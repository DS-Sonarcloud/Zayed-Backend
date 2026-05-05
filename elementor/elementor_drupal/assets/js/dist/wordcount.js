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
  count: () => ( count)
});
;
const defaultSettings = {
  HTMLRegExp: /<\/?[a-z][^>]*?>/gi,
  HTMLcommentRegExp: /<!--[\s\S]*?-->/g,
  spaceRegExp: /&nbsp;|&#160;/gi,
  HTMLEntityRegExp: /&\S+?;/g,
  connectorRegExp: /--|\u2014/g,
  removeRegExp: new RegExp(['[',
  '\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E',
  '\u0080-\u00BF\u00D7\u00F7',
  '\u2000-\u2BFF',
  '\u2E00-\u2E7F', ']'].join(''), 'g'),
  astralRegExp: /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
  wordsRegExp: /\S\s+/g,
  characters_excluding_spacesRegExp: /\S/g,
  characters_including_spacesRegExp: /[^\f\n\r\t\v\u00AD\u2028\u2029]/g,
  l10n: {
    type: 'words'
  }
};
;
function stripTags(settings, text) {
  return text.replace(settings.HTMLRegExp, '\n');
}
;
function transposeAstralsToCountableChar(settings, text) {
  return text.replace(settings.astralRegExp, 'a');
}
;
function stripHTMLEntities(settings, text) {
  return text.replace(settings.HTMLEntityRegExp, '');
}
;
function stripConnectors(settings, text) {
  return text.replace(settings.connectorRegExp, ' ');
}
;
function stripRemovables(settings, text) {
  return text.replace(settings.removeRegExp, '');
}
;
function stripHTMLComments(settings, text) {
  return text.replace(settings.HTMLcommentRegExp, '');
}
;
function stripShortcodes(settings, text) {
  if (settings.shortcodesRegExp) {
    return text.replace(settings.shortcodesRegExp, '\n');
  }
  return text;
}
;
function stripSpaces(settings, text) {
  return text.replace(settings.spaceRegExp, ' ');
}
;
function transposeHTMLEntitiesToCountableChars(settings, text) {
  return text.replace(settings.HTMLEntityRegExp, 'a');
}
;
function loadSettings(type, userSettings) {
  var _settings$l10n$shortc;
  const settings = Object.assign({}, defaultSettings, userSettings);
  settings.shortcodes = (_settings$l10n$shortc = settings.l10n?.shortcodes) !== null && _settings$l10n$shortc !== void 0 ? _settings$l10n$shortc : [];
  if (settings.shortcodes && settings.shortcodes.length) {
    settings.shortcodesRegExp = new RegExp('\\[\\/?(?:' + settings.shortcodes.join('|') + ')[^\\]]*?\\]', 'g');
  }
  settings.type = type;
  if (settings.type !== 'characters_excluding_spaces' && settings.type !== 'characters_including_spaces') {
    settings.type = 'words';
  }
  return settings;
}
function countWords(text, regex, settings) {
  var _text$match$length;
  text = [stripTags.bind(null, settings), stripHTMLComments.bind(null, settings), stripShortcodes.bind(null, settings), stripSpaces.bind(null, settings), stripHTMLEntities.bind(null, settings), stripConnectors.bind(null, settings), stripRemovables.bind(null, settings)].reduce((result, fn) => fn(result), text);
  text = text + '\n';
  return (_text$match$length = text.match(regex)?.length) !== null && _text$match$length !== void 0 ? _text$match$length : 0;
}
function countCharacters(text, regex, settings) {
  var _text$match$length2;
  text = [stripTags.bind(null, settings), stripHTMLComments.bind(null, settings), stripShortcodes.bind(null, settings), transposeAstralsToCountableChar.bind(null, settings), stripSpaces.bind(null, settings), transposeHTMLEntitiesToCountableChars.bind(null, settings)].reduce((result, fn) => fn(result), text);
  text = text + '\n';
  return (_text$match$length2 = text.match(regex)?.length) !== null && _text$match$length2 !== void 0 ? _text$match$length2 : 0;
}
function count(text, type, userSettings) {
  const settings = loadSettings(type, userSettings);
  let matchRegExp;
  switch (settings.type) {
    case 'words':
      matchRegExp = settings.wordsRegExp;
      return countWords(text, matchRegExp, settings);
    case 'characters_including_spaces':
      matchRegExp = settings.characters_including_spacesRegExp;
      return countCharacters(text, matchRegExp, settings);
    case 'characters_excluding_spaces':
      matchRegExp = settings.characters_excluding_spacesRegExp;
      return countCharacters(text, matchRegExp, settings);
    default:
      return 0;
  }
}
(window.wp = window.wp || {}).wordcount = __webpack_exports__;
 })()
;