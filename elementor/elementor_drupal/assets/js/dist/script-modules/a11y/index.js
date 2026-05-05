 
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
  m: () => ( setup),
  L: () => ( speak)
});
;
function clear() {
  const regions = document.getElementsByClassName('a11y-speak-region');
  const introText = document.getElementById('a11y-speak-intro-text');
  for (let i = 0; i < regions.length; i++) {
    regions[i].textContent = '';
  }
  if (introText) {
    introText.setAttribute('hidden', 'hidden');
  }
}
;
let previousMessage = '';
function filterMessage(message) {
  message = message.replace(/<[^<>]+>/g, ' ');
  if (previousMessage === message) {
    message += '\u00A0';
  }
  previousMessage = message;
  return message;
}
;
function speak(message, ariaLive) {
  clear();
  message = filterMessage(message);
  const introText = document.getElementById('a11y-speak-intro-text');
  const containerAssertive = document.getElementById('a11y-speak-assertive');
  const containerPolite = document.getElementById('a11y-speak-polite');
  if (containerAssertive && ariaLive === 'assertive') {
    containerAssertive.textContent = message;
  } else if (containerPolite) {
    containerPolite.textContent = message;
  }
  if (introText) {
    introText.removeAttribute('hidden');
  }
}
;
const setup = () => {};
var __webpack_exports__setup = __webpack_exports__.m;
var __webpack_exports__speak = __webpack_exports__.L;
export { __webpack_exports__setup as setup, __webpack_exports__speak as speak };
