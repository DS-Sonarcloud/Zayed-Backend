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
   "default": () => ( TokenList)
 });
class TokenList {
  constructor(initialValue = '') {
    this._currentValue = '';
    this._valueAsArray = [];
    this.value = initialValue;
  }
  entries(...args) {
    return this._valueAsArray.entries(...args);
  }
  forEach(...args) {
    return this._valueAsArray.forEach(...args);
  }
  keys(...args) {
    return this._valueAsArray.keys(...args);
  }
  values(...args) {
    return this._valueAsArray.values(...args);
  }
  get value() {
    return this._currentValue;
  }
  set value(value) {
    value = String(value);
    this._valueAsArray = [...new Set(value.split(/\s+/g).filter(Boolean))];
    this._currentValue = this._valueAsArray.join(' ');
  }
  get length() {
    return this._valueAsArray.length;
  }
  toString() {
    return this.value;
  }
  *[Symbol.iterator]() {
    return yield* this._valueAsArray;
  }
  item(index) {
    return this._valueAsArray[index];
  }
  contains(item) {
    return this._valueAsArray.indexOf(item) !== -1;
  }
  add(...items) {
    this.value += ' ' + items.join(' ');
  }
  remove(...items) {
    this.value = this._valueAsArray.filter(val => !items.includes(val)).join(' ');
  }
  toggle(token, force) {
    if (undefined === force) {
      force = !this.contains(token);
    }
    if (force) {
      this.add(token);
    } else {
      this.remove(token);
    }
    return force;
  }
  replace(token, newToken) {
    if (!this.contains(token)) {
      return false;
    }
    this.remove(token);
    this.add(newToken);
    return true;
  }
  supports(_token) {
    return true;
  }
}
(window.wp = window.wp || {}).tokenList = __webpack_exports__["default"];
 })()
;