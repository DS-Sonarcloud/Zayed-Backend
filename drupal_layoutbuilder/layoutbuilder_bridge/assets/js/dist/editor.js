 (() => { 
 	var __webpack_modules__ = ({
 66:
 ((module) => {
"use strict";
var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};
function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}
function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);
	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;
function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}
function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}
function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}
function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}
function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}
	var customMerge = options.customMerge(key);
	return typeof customMerge === 'function' ? customMerge : deepmerge
}
function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return Object.propertyIsEnumerable.call(target, symbol)
		})
		: []
}
function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}
function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch(_) {
		return false
	}
}
function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) 
		&& !(Object.hasOwnProperty.call(target, key) 
			&& Object.propertyIsEnumerable.call(target, key)) 
}
function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	getKeys(source).forEach(function(key) {
		if (propertyIsUnsafe(target, key)) {
			return
		}
		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		}
	});
	return destination
}
function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}
deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}
	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};
var deepmerge_1 = deepmerge;
module.exports = deepmerge_1;
 }),
 461:
 ((module, __unused_webpack_exports, __webpack_require__) => {
var computedStyle = __webpack_require__(6109);
function lineHeight(node) {
  var lnHeightStr = computedStyle(node, 'line-height');
  var lnHeight = parseFloat(lnHeightStr, 10);
  if (lnHeightStr === lnHeight + '') {
    var _lnHeightStyle = node.style.lineHeight;
    node.style.lineHeight = lnHeightStr + 'em';
    lnHeightStr = computedStyle(node, 'line-height');
    lnHeight = parseFloat(lnHeightStr, 10);
    if (_lnHeightStyle) {
      node.style.lineHeight = _lnHeightStyle;
    } else {
      delete node.style.lineHeight;
    }
  }
  if (lnHeightStr.indexOf('pt') !== -1) {
    lnHeight *= 4;
    lnHeight /= 3;
  } else if (lnHeightStr.indexOf('mm') !== -1) {
    lnHeight *= 96;
    lnHeight /= 25.4;
  } else if (lnHeightStr.indexOf('cm') !== -1) {
    lnHeight *= 96;
    lnHeight /= 2.54;
  } else if (lnHeightStr.indexOf('in') !== -1) {
    lnHeight *= 96;
  } else if (lnHeightStr.indexOf('pc') !== -1) {
    lnHeight *= 16;
  }
  lnHeight = Math.round(lnHeight);
  if (lnHeightStr === 'normal') {
    var nodeName = node.nodeName;
    var _node = document.createElement(nodeName);
    _node.innerHTML = '&nbsp;';
    if (nodeName.toUpperCase() === 'TEXTAREA') {
      _node.setAttribute('rows', '1');
    }
    var fontSizeStr = computedStyle(node, 'font-size');
    _node.style.fontSize = fontSizeStr;
    _node.style.padding = '0px';
    _node.style.border = '0px';
    var body = document.body;
    body.appendChild(_node);
    var height = _node.offsetHeight;
    lnHeight = height;
    body.removeChild(_node);
  }
  return lnHeight;
}
module.exports = lineHeight;
 }),
 628:
 ((module, __unused_webpack_exports, __webpack_require__) => {
"use strict";
var ReactPropTypesSecret = __webpack_require__(4067);
function emptyFunction() {}
function emptyFunctionWithReset() {}
emptyFunctionWithReset.resetWarningCache = emptyFunction;
module.exports = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      return;
    }
    var err = new Error(
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
    err.name = 'Invariant Violation';
    throw err;
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  var ReactPropTypes = {
    array: shim,
    bigint: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,
    any: shim,
    arrayOf: getShim,
    element: shim,
    elementType: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim,
    exact: getShim,
    checkPropTypes: emptyFunctionWithReset,
    resetWarningCache: emptyFunction
  };
  ReactPropTypes.PropTypes = ReactPropTypes;
  return ReactPropTypes;
};
 }),
 1609:
 ((module) => {
"use strict";
module.exports = window["React"];
 }),
 4067:
 ((module) => {
"use strict";
var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
module.exports = ReactPropTypesSecret;
 }),
 4132:
 ((__unused_webpack_module, exports, __webpack_require__) => {
"use strict";
var __webpack_unused_export__;
__webpack_unused_export__ = true;
var TextareaAutosize_1 = __webpack_require__(4462);
exports.A = TextareaAutosize_1.TextareaAutosize;
 }),
 4306:
 (function(module, exports) {
var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
(function (global, factory) {
	if (true) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else { var mod; }
})(this, function (module, exports) {
	'use strict';
	var map = typeof Map === "function" ? new Map() : function () {
		var keys = [];
		var values = [];
		return {
			has: function has(key) {
				return keys.indexOf(key) > -1;
			},
			get: function get(key) {
				return values[keys.indexOf(key)];
			},
			set: function set(key, value) {
				if (keys.indexOf(key) === -1) {
					keys.push(key);
					values.push(value);
				}
			},
			delete: function _delete(key) {
				var index = keys.indexOf(key);
				if (index > -1) {
					keys.splice(index, 1);
					values.splice(index, 1);
				}
			}
		};
	}();
	var createEvent = function createEvent(name) {
		return new Event(name, { bubbles: true });
	};
	try {
		new Event('test');
	} catch (e) {
		createEvent = function createEvent(name) {
			var evt = document.createEvent('Event');
			evt.initEvent(name, true, false);
			return evt;
		};
	}
	function assign(ta) {
		if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || map.has(ta)) return;
		var heightOffset = null;
		var clientWidth = null;
		var cachedHeight = null;
		function init() {
			var style = window.getComputedStyle(ta, null);
			if (style.resize === 'vertical') {
				ta.style.resize = 'none';
			} else if (style.resize === 'both') {
				ta.style.resize = 'horizontal';
			}
			if (style.boxSizing === 'content-box') {
				heightOffset = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
			} else {
				heightOffset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
			}
			if (isNaN(heightOffset)) {
				heightOffset = 0;
			}
			update();
		}
		function changeOverflow(value) {
			{
				var width = ta.style.width;
				ta.style.width = '0px';
				ta.offsetWidth;
				ta.style.width = width;
			}
			ta.style.overflowY = value;
		}
		function getParentOverflows(el) {
			var arr = [];
			while (el && el.parentNode && el.parentNode instanceof Element) {
				if (el.parentNode.scrollTop) {
					arr.push({
						node: el.parentNode,
						scrollTop: el.parentNode.scrollTop
					});
				}
				el = el.parentNode;
			}
			return arr;
		}
		function resize() {
			if (ta.scrollHeight === 0) {
				return;
			}
			var overflows = getParentOverflows(ta);
			var docTop = document.documentElement && document.documentElement.scrollTop; 
			ta.style.height = '';
			ta.style.height = ta.scrollHeight + heightOffset + 'px';
			clientWidth = ta.clientWidth;
			overflows.forEach(function (el) {
				el.node.scrollTop = el.scrollTop;
			});
			if (docTop) {
				document.documentElement.scrollTop = docTop;
			}
		}
		function update() {
			resize();
			var styleHeight = Math.round(parseFloat(ta.style.height));
			var computed = window.getComputedStyle(ta, null);
			var actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(computed.height)) : ta.offsetHeight;
			if (actualHeight < styleHeight) {
				if (computed.overflowY === 'hidden') {
					changeOverflow('scroll');
					resize();
					actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
				}
			} else {
				if (computed.overflowY !== 'hidden') {
					changeOverflow('hidden');
					resize();
					actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
				}
			}
			if (cachedHeight !== actualHeight) {
				cachedHeight = actualHeight;
				var evt = createEvent('autosize:resized');
				try {
					ta.dispatchEvent(evt);
				} catch (err) {
				}
			}
		}
		var pageResize = function pageResize() {
			if (ta.clientWidth !== clientWidth) {
				update();
			}
		};
		var destroy = function (style) {
			window.removeEventListener('resize', pageResize, false);
			ta.removeEventListener('input', update, false);
			ta.removeEventListener('keyup', update, false);
			ta.removeEventListener('autosize:destroy', destroy, false);
			ta.removeEventListener('autosize:update', update, false);
			Object.keys(style).forEach(function (key) {
				ta.style[key] = style[key];
			});
			map.delete(ta);
		}.bind(ta, {
			height: ta.style.height,
			resize: ta.style.resize,
			overflowY: ta.style.overflowY,
			overflowX: ta.style.overflowX,
			wordWrap: ta.style.wordWrap
		});
		ta.addEventListener('autosize:destroy', destroy, false);
		if ('onpropertychange' in ta && 'oninput' in ta) {
			ta.addEventListener('keyup', update, false);
		}
		window.addEventListener('resize', pageResize, false);
		ta.addEventListener('input', update, false);
		ta.addEventListener('autosize:update', update, false);
		ta.style.overflowX = 'hidden';
		ta.style.wordWrap = 'break-word';
		map.set(ta, {
			destroy: destroy,
			update: update
		});
		init();
	}
	function destroy(ta) {
		var methods = map.get(ta);
		if (methods) {
			methods.destroy();
		}
	}
	function update(ta) {
		var methods = map.get(ta);
		if (methods) {
			methods.update();
		}
	}
	var autosize = null;
	if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
		autosize = function autosize(el) {
			return el;
		};
		autosize.destroy = function (el) {
			return el;
		};
		autosize.update = function (el) {
			return el;
		};
	} else {
		autosize = function autosize(el, options) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], function (x) {
					return assign(x, options);
				});
			}
			return el;
		};
		autosize.destroy = function (el) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], destroy);
			}
			return el;
		};
		autosize.update = function (el) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], update);
			}
			return el;
		};
	}
	exports.default = autosize;
	module.exports = exports['default'];
});
 }),
 4462:
 (function(__unused_webpack_module, exports, __webpack_require__) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
exports.__esModule = true;
var React = __webpack_require__(1609);
var PropTypes = __webpack_require__(5826);
var autosize = __webpack_require__(4306);
var _getLineHeight = __webpack_require__(461);
var getLineHeight = _getLineHeight;
var RESIZED = "autosize:resized";
var TextareaAutosizeClass =  (function (_super) {
    __extends(TextareaAutosizeClass, _super);
    function TextareaAutosizeClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            lineHeight: null
        };
        _this.textarea = null;
        _this.onResize = function (e) {
            if (_this.props.onResize) {
                _this.props.onResize(e);
            }
        };
        _this.updateLineHeight = function () {
            if (_this.textarea) {
                _this.setState({
                    lineHeight: getLineHeight(_this.textarea)
                });
            }
        };
        _this.onChange = function (e) {
            var onChange = _this.props.onChange;
            _this.currentValue = e.currentTarget.value;
            onChange && onChange(e);
        };
        return _this;
    }
    TextareaAutosizeClass.prototype.componentDidMount = function () {
        var _this = this;
        var _a = this.props, maxRows = _a.maxRows, async = _a.async;
        if (typeof maxRows === "number") {
            this.updateLineHeight();
        }
        if (typeof maxRows === "number" || async) {
            setTimeout(function () { return _this.textarea && autosize(_this.textarea); });
        }
        else {
            this.textarea && autosize(this.textarea);
        }
        if (this.textarea) {
            this.textarea.addEventListener(RESIZED, this.onResize);
        }
    };
    TextareaAutosizeClass.prototype.componentWillUnmount = function () {
        if (this.textarea) {
            this.textarea.removeEventListener(RESIZED, this.onResize);
            autosize.destroy(this.textarea);
        }
    };
    TextareaAutosizeClass.prototype.render = function () {
        var _this = this;
        var _a = this, _b = _a.props, onResize = _b.onResize, maxRows = _b.maxRows, onChange = _b.onChange, style = _b.style, innerRef = _b.innerRef, children = _b.children, props = __rest(_b, ["onResize", "maxRows", "onChange", "style", "innerRef", "children"]), lineHeight = _a.state.lineHeight;
        var maxHeight = maxRows && lineHeight ? lineHeight * maxRows : null;
        return (React.createElement("textarea", __assign({}, props, { onChange: this.onChange, style: maxHeight ? __assign({}, style, { maxHeight: maxHeight }) : style, ref: function (element) {
                _this.textarea = element;
                if (typeof _this.props.innerRef === 'function') {
                    _this.props.innerRef(element);
                }
                else if (_this.props.innerRef) {
                    _this.props.innerRef.current = element;
                }
            } }), children));
    };
    TextareaAutosizeClass.prototype.componentDidUpdate = function () {
        this.textarea && autosize.update(this.textarea);
    };
    TextareaAutosizeClass.defaultProps = {
        rows: 1,
        async: false
    };
    TextareaAutosizeClass.propTypes = {
        rows: PropTypes.number,
        maxRows: PropTypes.number,
        onResize: PropTypes.func,
        innerRef: PropTypes.any,
        async: PropTypes.bool
    };
    return TextareaAutosizeClass;
}(React.Component));
exports.TextareaAutosize = React.forwardRef(function (props, ref) {
    return React.createElement(TextareaAutosizeClass, __assign({}, props, { innerRef: ref }));
});
 }),
 5215:
 ((module) => {
"use strict";
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
 }),
 5826:
 ((module, __unused_webpack_exports, __webpack_require__) => {
if (false) { var throwOnDirectAccess, ReactIs; } else {
  module.exports = __webpack_require__(628)();
}
 }),
 6109:
 ((module) => {
var computedStyle = function (el, prop, getComputedStyle) {
  getComputedStyle = window.getComputedStyle;
  return (
    getComputedStyle ?
      getComputedStyle(el) :
      el.currentStyle
  )[
    prop.replace(/-(\w)/gi, function (word, letter) {
      return letter.toUpperCase();
    })
  ];
};
module.exports = computedStyle;
 }),
 9681:
 ((module) => {
var characterMap = {
	"À": "A",
	"Á": "A",
	"Â": "A",
	"Ã": "A",
	"Ä": "A",
	"Å": "A",
	"Ấ": "A",
	"Ắ": "A",
	"Ẳ": "A",
	"Ẵ": "A",
	"Ặ": "A",
	"Æ": "AE",
	"Ầ": "A",
	"Ằ": "A",
	"Ȃ": "A",
	"Ả": "A",
	"Ạ": "A",
	"Ẩ": "A",
	"Ẫ": "A",
	"Ậ": "A",
	"Ç": "C",
	"Ḉ": "C",
	"È": "E",
	"É": "E",
	"Ê": "E",
	"Ë": "E",
	"Ế": "E",
	"Ḗ": "E",
	"Ề": "E",
	"Ḕ": "E",
	"Ḝ": "E",
	"Ȇ": "E",
	"Ẻ": "E",
	"Ẽ": "E",
	"Ẹ": "E",
	"Ể": "E",
	"Ễ": "E",
	"Ệ": "E",
	"Ì": "I",
	"Í": "I",
	"Î": "I",
	"Ï": "I",
	"Ḯ": "I",
	"Ȋ": "I",
	"Ỉ": "I",
	"Ị": "I",
	"Ð": "D",
	"Ñ": "N",
	"Ò": "O",
	"Ó": "O",
	"Ô": "O",
	"Õ": "O",
	"Ö": "O",
	"Ø": "O",
	"Ố": "O",
	"Ṍ": "O",
	"Ṓ": "O",
	"Ȏ": "O",
	"Ỏ": "O",
	"Ọ": "O",
	"Ổ": "O",
	"Ỗ": "O",
	"Ộ": "O",
	"Ờ": "O",
	"Ở": "O",
	"Ỡ": "O",
	"Ớ": "O",
	"Ợ": "O",
	"Ù": "U",
	"Ú": "U",
	"Û": "U",
	"Ü": "U",
	"Ủ": "U",
	"Ụ": "U",
	"Ử": "U",
	"Ữ": "U",
	"Ự": "U",
	"Ý": "Y",
	"à": "a",
	"á": "a",
	"â": "a",
	"ã": "a",
	"ä": "a",
	"å": "a",
	"ấ": "a",
	"ắ": "a",
	"ẳ": "a",
	"ẵ": "a",
	"ặ": "a",
	"æ": "ae",
	"ầ": "a",
	"ằ": "a",
	"ȃ": "a",
	"ả": "a",
	"ạ": "a",
	"ẩ": "a",
	"ẫ": "a",
	"ậ": "a",
	"ç": "c",
	"ḉ": "c",
	"è": "e",
	"é": "e",
	"ê": "e",
	"ë": "e",
	"ế": "e",
	"ḗ": "e",
	"ề": "e",
	"ḕ": "e",
	"ḝ": "e",
	"ȇ": "e",
	"ẻ": "e",
	"ẽ": "e",
	"ẹ": "e",
	"ể": "e",
	"ễ": "e",
	"ệ": "e",
	"ì": "i",
	"í": "i",
	"î": "i",
	"ï": "i",
	"ḯ": "i",
	"ȋ": "i",
	"ỉ": "i",
	"ị": "i",
	"ð": "d",
	"ñ": "n",
	"ò": "o",
	"ó": "o",
	"ô": "o",
	"õ": "o",
	"ö": "o",
	"ø": "o",
	"ố": "o",
	"ṍ": "o",
	"ṓ": "o",
	"ȏ": "o",
	"ỏ": "o",
	"ọ": "o",
	"ổ": "o",
	"ỗ": "o",
	"ộ": "o",
	"ờ": "o",
	"ở": "o",
	"ỡ": "o",
	"ớ": "o",
	"ợ": "o",
	"ù": "u",
	"ú": "u",
	"û": "u",
	"ü": "u",
	"ủ": "u",
	"ụ": "u",
	"ử": "u",
	"ữ": "u",
	"ự": "u",
	"ý": "y",
	"ÿ": "y",
	"Ā": "A",
	"ā": "a",
	"Ă": "A",
	"ă": "a",
	"Ą": "A",
	"ą": "a",
	"Ć": "C",
	"ć": "c",
	"Ĉ": "C",
	"ĉ": "c",
	"Ċ": "C",
	"ċ": "c",
	"Č": "C",
	"č": "c",
	"C̆": "C",
	"c̆": "c",
	"Ď": "D",
	"ď": "d",
	"Đ": "D",
	"đ": "d",
	"Ē": "E",
	"ē": "e",
	"Ĕ": "E",
	"ĕ": "e",
	"Ė": "E",
	"ė": "e",
	"Ę": "E",
	"ę": "e",
	"Ě": "E",
	"ě": "e",
	"Ĝ": "G",
	"Ǵ": "G",
	"ĝ": "g",
	"ǵ": "g",
	"Ğ": "G",
	"ğ": "g",
	"Ġ": "G",
	"ġ": "g",
	"Ģ": "G",
	"ģ": "g",
	"Ĥ": "H",
	"ĥ": "h",
	"Ħ": "H",
	"ħ": "h",
	"Ḫ": "H",
	"ḫ": "h",
	"Ĩ": "I",
	"ĩ": "i",
	"Ī": "I",
	"ī": "i",
	"Ĭ": "I",
	"ĭ": "i",
	"Į": "I",
	"į": "i",
	"İ": "I",
	"ı": "i",
	"Ĳ": "IJ",
	"ĳ": "ij",
	"Ĵ": "J",
	"ĵ": "j",
	"Ķ": "K",
	"ķ": "k",
	"Ḱ": "K",
	"ḱ": "k",
	"K̆": "K",
	"k̆": "k",
	"Ĺ": "L",
	"ĺ": "l",
	"Ļ": "L",
	"ļ": "l",
	"Ľ": "L",
	"ľ": "l",
	"Ŀ": "L",
	"ŀ": "l",
	"Ł": "l",
	"ł": "l",
	"Ḿ": "M",
	"ḿ": "m",
	"M̆": "M",
	"m̆": "m",
	"Ń": "N",
	"ń": "n",
	"Ņ": "N",
	"ņ": "n",
	"Ň": "N",
	"ň": "n",
	"ŉ": "n",
	"N̆": "N",
	"n̆": "n",
	"Ō": "O",
	"ō": "o",
	"Ŏ": "O",
	"ŏ": "o",
	"Ő": "O",
	"ő": "o",
	"Œ": "OE",
	"œ": "oe",
	"P̆": "P",
	"p̆": "p",
	"Ŕ": "R",
	"ŕ": "r",
	"Ŗ": "R",
	"ŗ": "r",
	"Ř": "R",
	"ř": "r",
	"R̆": "R",
	"r̆": "r",
	"Ȓ": "R",
	"ȓ": "r",
	"Ś": "S",
	"ś": "s",
	"Ŝ": "S",
	"ŝ": "s",
	"Ş": "S",
	"Ș": "S",
	"ș": "s",
	"ş": "s",
	"Š": "S",
	"š": "s",
	"Ţ": "T",
	"ţ": "t",
	"ț": "t",
	"Ț": "T",
	"Ť": "T",
	"ť": "t",
	"Ŧ": "T",
	"ŧ": "t",
	"T̆": "T",
	"t̆": "t",
	"Ũ": "U",
	"ũ": "u",
	"Ū": "U",
	"ū": "u",
	"Ŭ": "U",
	"ŭ": "u",
	"Ů": "U",
	"ů": "u",
	"Ű": "U",
	"ű": "u",
	"Ų": "U",
	"ų": "u",
	"Ȗ": "U",
	"ȗ": "u",
	"V̆": "V",
	"v̆": "v",
	"Ŵ": "W",
	"ŵ": "w",
	"Ẃ": "W",
	"ẃ": "w",
	"X̆": "X",
	"x̆": "x",
	"Ŷ": "Y",
	"ŷ": "y",
	"Ÿ": "Y",
	"Y̆": "Y",
	"y̆": "y",
	"Ź": "Z",
	"ź": "z",
	"Ż": "Z",
	"ż": "z",
	"Ž": "Z",
	"ž": "z",
	"ſ": "s",
	"ƒ": "f",
	"Ơ": "O",
	"ơ": "o",
	"Ư": "U",
	"ư": "u",
	"Ǎ": "A",
	"ǎ": "a",
	"Ǐ": "I",
	"ǐ": "i",
	"Ǒ": "O",
	"ǒ": "o",
	"Ǔ": "U",
	"ǔ": "u",
	"Ǖ": "U",
	"ǖ": "u",
	"Ǘ": "U",
	"ǘ": "u",
	"Ǚ": "U",
	"ǚ": "u",
	"Ǜ": "U",
	"ǜ": "u",
	"Ứ": "U",
	"ứ": "u",
	"Ṹ": "U",
	"ṹ": "u",
	"Ǻ": "A",
	"ǻ": "a",
	"Ǽ": "AE",
	"ǽ": "ae",
	"Ǿ": "O",
	"ǿ": "o",
	"Þ": "TH",
	"þ": "th",
	"Ṕ": "P",
	"ṕ": "p",
	"Ṥ": "S",
	"ṥ": "s",
	"X́": "X",
	"x́": "x",
	"Ѓ": "Г",
	"ѓ": "г",
	"Ќ": "К",
	"ќ": "к",
	"A̋": "A",
	"a̋": "a",
	"E̋": "E",
	"e̋": "e",
	"I̋": "I",
	"i̋": "i",
	"Ǹ": "N",
	"ǹ": "n",
	"Ồ": "O",
	"ồ": "o",
	"Ṑ": "O",
	"ṑ": "o",
	"Ừ": "U",
	"ừ": "u",
	"Ẁ": "W",
	"ẁ": "w",
	"Ỳ": "Y",
	"ỳ": "y",
	"Ȁ": "A",
	"ȁ": "a",
	"Ȅ": "E",
	"ȅ": "e",
	"Ȉ": "I",
	"ȉ": "i",
	"Ȍ": "O",
	"ȍ": "o",
	"Ȑ": "R",
	"ȑ": "r",
	"Ȕ": "U",
	"ȕ": "u",
	"B̌": "B",
	"b̌": "b",
	"Č̣": "C",
	"č̣": "c",
	"Ê̌": "E",
	"ê̌": "e",
	"F̌": "F",
	"f̌": "f",
	"Ǧ": "G",
	"ǧ": "g",
	"Ȟ": "H",
	"ȟ": "h",
	"J̌": "J",
	"ǰ": "j",
	"Ǩ": "K",
	"ǩ": "k",
	"M̌": "M",
	"m̌": "m",
	"P̌": "P",
	"p̌": "p",
	"Q̌": "Q",
	"q̌": "q",
	"Ř̩": "R",
	"ř̩": "r",
	"Ṧ": "S",
	"ṧ": "s",
	"V̌": "V",
	"v̌": "v",
	"W̌": "W",
	"w̌": "w",
	"X̌": "X",
	"x̌": "x",
	"Y̌": "Y",
	"y̌": "y",
	"A̧": "A",
	"a̧": "a",
	"B̧": "B",
	"b̧": "b",
	"Ḑ": "D",
	"ḑ": "d",
	"Ȩ": "E",
	"ȩ": "e",
	"Ɛ̧": "E",
	"ɛ̧": "e",
	"Ḩ": "H",
	"ḩ": "h",
	"I̧": "I",
	"i̧": "i",
	"Ɨ̧": "I",
	"ɨ̧": "i",
	"M̧": "M",
	"m̧": "m",
	"O̧": "O",
	"o̧": "o",
	"Q̧": "Q",
	"q̧": "q",
	"U̧": "U",
	"u̧": "u",
	"X̧": "X",
	"x̧": "x",
	"Z̧": "Z",
	"z̧": "z",
	"й":"и",
	"Й":"И",
	"ё":"е",
	"Ё":"Е",
};
var chars = Object.keys(characterMap).join('|');
var allAccents = new RegExp(chars, 'g');
var firstAccent = new RegExp(chars, '');
function matcher(match) {
	return characterMap[match];
}
var removeAccents = function(string) {
	return string.replace(allAccents, matcher);
};
var hasAccents = function(string) {
	return !!string.match(firstAccent);
};
module.exports = removeAccents;
module.exports.has = hasAccents;
module.exports.remove = removeAccents;
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
 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  AlignmentToolbar: () => ( AlignmentToolbar),
  Autocomplete: () => ( Autocomplete),
  AutosaveMonitor: () => ( autosave_monitor),
  BlockAlignmentToolbar: () => ( BlockAlignmentToolbar),
  BlockControls: () => ( BlockControls),
  BlockEdit: () => ( BlockEdit),
  BlockEditorKeyboardShortcuts: () => ( BlockEditorKeyboardShortcuts),
  BlockFormatControls: () => ( BlockFormatControls),
  BlockIcon: () => ( BlockIcon),
  BlockInspector: () => ( BlockInspector),
  BlockList: () => ( BlockList),
  BlockMover: () => ( BlockMover),
  BlockNavigationDropdown: () => ( BlockNavigationDropdown),
  BlockSelectionClearer: () => ( BlockSelectionClearer),
  BlockSettingsMenu: () => ( BlockSettingsMenu),
  BlockTitle: () => ( BlockTitle),
  BlockToolbar: () => ( BlockToolbar),
  CharacterCount: () => ( CharacterCount),
  ColorPalette: () => ( ColorPalette),
  ContrastChecker: () => ( ContrastChecker),
  CopyHandler: () => ( CopyHandler),
  DefaultBlockAppender: () => ( DefaultBlockAppender),
  DocumentBar: () => ( DocumentBar),
  DocumentOutline: () => ( DocumentOutline),
  DocumentOutlineCheck: () => ( DocumentOutlineCheck),
  EditorHistoryRedo: () => ( editor_history_redo),
  EditorHistoryUndo: () => ( editor_history_undo),
  EditorKeyboardShortcuts: () => ( EditorKeyboardShortcuts),
  EditorKeyboardShortcutsRegister: () => ( register_shortcuts),
  EditorNotices: () => ( editor_notices),
  EditorProvider: () => ( provider),
  EditorSnackbars: () => ( EditorSnackbars),
  EntitiesSavedStates: () => ( EntitiesSavedStates),
  ErrorBoundary: () => ( error_boundary),
  FontSizePicker: () => ( FontSizePicker),
  InnerBlocks: () => ( InnerBlocks),
  Inserter: () => ( Inserter),
  InspectorAdvancedControls: () => ( InspectorAdvancedControls),
  InspectorControls: () => ( InspectorControls),
  LocalAutosaveMonitor: () => ( local_autosave_monitor),
  MediaPlaceholder: () => ( MediaPlaceholder),
  MediaUpload: () => ( MediaUpload),
  MediaUploadCheck: () => ( MediaUploadCheck),
  MultiSelectScrollIntoView: () => ( MultiSelectScrollIntoView),
  NavigableToolbar: () => ( NavigableToolbar),
  ObserveTyping: () => ( ObserveTyping),
  PageAttributesCheck: () => ( page_attributes_check),
  PageAttributesOrder: () => ( PageAttributesOrderWithChecks),
  PageAttributesPanel: () => ( PageAttributesPanel),
  PageAttributesParent: () => ( page_attributes_parent),
  PageTemplate: () => ( classic_theme),
  PanelColorSettings: () => ( PanelColorSettings),
  PlainText: () => ( PlainText),
  PluginBlockSettingsMenuItem: () => ( plugin_block_settings_menu_item),
  PluginDocumentSettingPanel: () => ( plugin_document_setting_panel),
  PluginMoreMenuItem: () => ( PluginMoreMenuItem),
  PluginPostPublishPanel: () => ( plugin_post_publish_panel),
  PluginPostStatusInfo: () => ( plugin_post_status_info),
  PluginPrePublishPanel: () => ( plugin_pre_publish_panel),
  PluginPreviewMenuItem: () => ( PluginPreviewMenuItem),
  PluginSidebar: () => ( PluginSidebar),
  PluginSidebarMoreMenuItem: () => ( PluginSidebarMoreMenuItem),
  PostAuthor: () => ( post_author),
  PostAuthorCheck: () => ( PostAuthorCheck),
  PostAuthorPanel: () => ( panel),
  PostComments: () => ( post_comments),
  PostDiscussionPanel: () => ( PostDiscussionPanel),
  PostExcerpt: () => ( PostExcerpt),
  PostExcerptCheck: () => ( post_excerpt_check),
  PostExcerptPanel: () => ( PostExcerptPanel),
  PostFeaturedImage: () => ( post_featured_image),
  PostFeaturedImageCheck: () => ( post_featured_image_check),
  PostFeaturedImagePanel: () => ( PostFeaturedImagePanel),
  PostFormat: () => ( PostFormat),
  PostFormatCheck: () => ( PostFormatCheck),
  PostLastRevision: () => ( post_last_revision),
  PostLastRevisionCheck: () => ( post_last_revision_check),
  PostLastRevisionPanel: () => ( post_last_revision_panel),
  PostLockedModal: () => ( PostLockedModal),
  PostPendingStatus: () => ( post_pending_status),
  PostPendingStatusCheck: () => ( post_pending_status_check),
  PostPingbacks: () => ( post_pingbacks),
  PostPreviewButton: () => ( PostPreviewButton),
  PostPublishButton: () => ( post_publish_button),
  PostPublishButtonLabel: () => ( PublishButtonLabel),
  PostPublishPanel: () => ( post_publish_panel),
  PostSavedState: () => ( PostSavedState),
  PostSchedule: () => ( PostSchedule),
  PostScheduleCheck: () => ( PostScheduleCheck),
  PostScheduleLabel: () => ( PostScheduleLabel),
  PostSchedulePanel: () => ( PostSchedulePanel),
  PostSticky: () => ( PostSticky),
  PostStickyCheck: () => ( PostStickyCheck),
  PostSwitchToDraftButton: () => ( PostSwitchToDraftButton),
  PostSyncStatus: () => ( PostSyncStatus),
  PostTaxonomies: () => ( post_taxonomies),
  PostTaxonomiesCheck: () => ( PostTaxonomiesCheck),
  PostTaxonomiesFlatTermSelector: () => ( FlatTermSelector),
  PostTaxonomiesHierarchicalTermSelector: () => ( HierarchicalTermSelector),
  PostTaxonomiesPanel: () => ( panel_PostTaxonomies),
  PostTemplatePanel: () => ( PostTemplatePanel),
  PostTextEditor: () => ( PostTextEditor),
  PostTitle: () => ( post_title),
  PostTitleRaw: () => ( post_title_raw),
  PostTrash: () => ( PostTrash),
  PostTrashCheck: () => ( PostTrashCheck),
  PostTypeSupportCheck: () => ( post_type_support_check),
  PostURL: () => ( PostURL),
  PostURLCheck: () => ( PostURLCheck),
  PostURLLabel: () => ( PostURLLabel),
  PostURLPanel: () => ( PostURLPanel),
  PostVisibility: () => ( PostVisibility),
  PostVisibilityCheck: () => ( PostVisibilityCheck),
  PostVisibilityLabel: () => ( PostVisibilityLabel),
  RichText: () => ( RichText),
  RichTextShortcut: () => ( RichTextShortcut),
  RichTextToolbarButton: () => ( RichTextToolbarButton),
  ServerSideRender: () => ( (external_wp_serverSideRender_default())),
  SkipToSelectedBlock: () => ( SkipToSelectedBlock),
  TableOfContents: () => ( table_of_contents),
  TextEditorGlobalKeyboardShortcuts: () => ( TextEditorGlobalKeyboardShortcuts),
  ThemeSupportCheck: () => ( ThemeSupportCheck),
  TimeToRead: () => ( TimeToRead),
  URLInput: () => ( URLInput),
  URLInputButton: () => ( URLInputButton),
  URLPopover: () => ( URLPopover),
  UnsavedChangesWarning: () => ( UnsavedChangesWarning),
  VisualEditorGlobalKeyboardShortcuts: () => ( VisualEditorGlobalKeyboardShortcuts),
  Warning: () => ( Warning),
  WordCount: () => ( WordCount),
  WritingFlow: () => ( WritingFlow),
  __unstableRichTextInputEvent: () => ( __unstableRichTextInputEvent),
  cleanForSlug: () => ( cleanForSlug),
  createCustomColorsHOC: () => ( createCustomColorsHOC),
  getColorClassName: () => ( getColorClassName),
  getColorObjectByAttributeValues: () => ( getColorObjectByAttributeValues),
  getColorObjectByColorValue: () => ( getColorObjectByColorValue),
  getFontSize: () => ( getFontSize),
  getFontSizeClass: () => ( getFontSizeClass),
  getTemplatePartIcon: () => ( getTemplatePartIcon),
  mediaUpload: () => ( mediaUpload),
  privateApis: () => ( privateApis),
  registerEntityAction: () => ( api_registerEntityAction),
  registerEntityField: () => ( api_registerEntityField),
  store: () => ( store_store),
  storeConfig: () => ( storeConfig),
  transformStyles: () => ( external_wp_blockEditor_namespaceObject.transformStyles),
  unregisterEntityAction: () => ( api_unregisterEntityAction),
  unregisterEntityField: () => ( api_unregisterEntityField),
  useEntitiesSavedStatesIsDirty: () => ( useIsDirty),
  usePostScheduleLabel: () => ( usePostScheduleLabel),
  usePostURLLabel: () => ( usePostURLLabel),
  usePostVisibilityLabel: () => ( usePostVisibilityLabel),
  userAutocompleter: () => ( user),
  withColorContext: () => ( withColorContext),
  withColors: () => ( withColors),
  withFontSizes: () => ( withFontSizes)
});
var selectors_namespaceObject = {};
__webpack_require__.r(selectors_namespaceObject);
__webpack_require__.d(selectors_namespaceObject, {
  __experimentalGetDefaultTemplatePartAreas: () => (__experimentalGetDefaultTemplatePartAreas),
  __experimentalGetDefaultTemplateType: () => (__experimentalGetDefaultTemplateType),
  __experimentalGetDefaultTemplateTypes: () => (__experimentalGetDefaultTemplateTypes),
  __experimentalGetTemplateInfo: () => (__experimentalGetTemplateInfo),
  __unstableIsEditorReady: () => (__unstableIsEditorReady),
  canInsertBlockType: () => (canInsertBlockType),
  canUserUseUnfilteredHTML: () => (canUserUseUnfilteredHTML),
  didPostSaveRequestFail: () => (didPostSaveRequestFail),
  didPostSaveRequestSucceed: () => (didPostSaveRequestSucceed),
  getActivePostLock: () => (getActivePostLock),
  getAdjacentBlockClientId: () => (getAdjacentBlockClientId),
  getAutosaveAttribute: () => (getAutosaveAttribute),
  getBlock: () => (getBlock),
  getBlockAttributes: () => (getBlockAttributes),
  getBlockCount: () => (getBlockCount),
  getBlockHierarchyRootClientId: () => (getBlockHierarchyRootClientId),
  getBlockIndex: () => (getBlockIndex),
  getBlockInsertionPoint: () => (getBlockInsertionPoint),
  getBlockListSettings: () => (getBlockListSettings),
  getBlockMode: () => (getBlockMode),
  getBlockName: () => (getBlockName),
  getBlockOrder: () => (getBlockOrder),
  getBlockRootClientId: () => (getBlockRootClientId),
  getBlockSelectionEnd: () => (getBlockSelectionEnd),
  getBlockSelectionStart: () => (getBlockSelectionStart),
  getBlocks: () => (getBlocks),
  getBlocksByClientId: () => (getBlocksByClientId),
  getClientIdsOfDescendants: () => (getClientIdsOfDescendants),
  getClientIdsWithDescendants: () => (getClientIdsWithDescendants),
  getCurrentPost: () => (getCurrentPost),
  getCurrentPostAttribute: () => (getCurrentPostAttribute),
  getCurrentPostId: () => (getCurrentPostId),
  getCurrentPostLastRevisionId: () => (getCurrentPostLastRevisionId),
  getCurrentPostRevisionsCount: () => (getCurrentPostRevisionsCount),
  getCurrentPostType: () => (getCurrentPostType),
  getCurrentTemplateId: () => (getCurrentTemplateId),
  getDeviceType: () => (getDeviceType),
  getEditedPostAttribute: () => (getEditedPostAttribute),
  getEditedPostContent: () => (getEditedPostContent),
  getEditedPostPreviewLink: () => (getEditedPostPreviewLink),
  getEditedPostSlug: () => (getEditedPostSlug),
  getEditedPostVisibility: () => (getEditedPostVisibility),
  getEditorBlocks: () => (getEditorBlocks),
  getEditorMode: () => (getEditorMode),
  getEditorSelection: () => (getEditorSelection),
  getEditorSelectionEnd: () => (getEditorSelectionEnd),
  getEditorSelectionStart: () => (getEditorSelectionStart),
  getEditorSettings: () => (getEditorSettings),
  getFirstMultiSelectedBlockClientId: () => (getFirstMultiSelectedBlockClientId),
  getGlobalBlockCount: () => (getGlobalBlockCount),
  getInserterItems: () => (getInserterItems),
  getLastMultiSelectedBlockClientId: () => (getLastMultiSelectedBlockClientId),
  getMultiSelectedBlockClientIds: () => (getMultiSelectedBlockClientIds),
  getMultiSelectedBlocks: () => (getMultiSelectedBlocks),
  getMultiSelectedBlocksEndClientId: () => (getMultiSelectedBlocksEndClientId),
  getMultiSelectedBlocksStartClientId: () => (getMultiSelectedBlocksStartClientId),
  getNextBlockClientId: () => (getNextBlockClientId),
  getPermalink: () => (getPermalink),
  getPermalinkParts: () => (getPermalinkParts),
  getPostEdits: () => (getPostEdits),
  getPostLockUser: () => (getPostLockUser),
  getPostTypeLabel: () => (getPostTypeLabel),
  getPreviousBlockClientId: () => (getPreviousBlockClientId),
  getRenderingMode: () => (getRenderingMode),
  getSelectedBlock: () => (getSelectedBlock),
  getSelectedBlockClientId: () => (getSelectedBlockClientId),
  getSelectedBlockCount: () => (getSelectedBlockCount),
  getSelectedBlocksInitialCaretPosition: () => (getSelectedBlocksInitialCaretPosition),
  getStateBeforeOptimisticTransaction: () => (getStateBeforeOptimisticTransaction),
  getSuggestedPostFormat: () => (getSuggestedPostFormat),
  getTemplate: () => (getTemplate),
  getTemplateLock: () => (getTemplateLock),
  hasChangedContent: () => (hasChangedContent),
  hasEditorRedo: () => (hasEditorRedo),
  hasEditorUndo: () => (hasEditorUndo),
  hasInserterItems: () => (hasInserterItems),
  hasMultiSelection: () => (hasMultiSelection),
  hasNonPostEntityChanges: () => (hasNonPostEntityChanges),
  hasSelectedBlock: () => (hasSelectedBlock),
  hasSelectedInnerBlock: () => (hasSelectedInnerBlock),
  inSomeHistory: () => (inSomeHistory),
  isAncestorMultiSelected: () => (isAncestorMultiSelected),
  isAutosavingPost: () => (isAutosavingPost),
  isBlockInsertionPointVisible: () => (isBlockInsertionPointVisible),
  isBlockMultiSelected: () => (isBlockMultiSelected),
  isBlockSelected: () => (isBlockSelected),
  isBlockValid: () => (isBlockValid),
  isBlockWithinSelection: () => (isBlockWithinSelection),
  isCaretWithinFormattedText: () => (isCaretWithinFormattedText),
  isCleanNewPost: () => (isCleanNewPost),
  isCurrentPostPending: () => (isCurrentPostPending),
  isCurrentPostPublished: () => (isCurrentPostPublished),
  isCurrentPostScheduled: () => (isCurrentPostScheduled),
  isDeletingPost: () => (isDeletingPost),
  isEditedPostAutosaveable: () => (isEditedPostAutosaveable),
  isEditedPostBeingScheduled: () => (isEditedPostBeingScheduled),
  isEditedPostDateFloating: () => (isEditedPostDateFloating),
  isEditedPostDirty: () => (isEditedPostDirty),
  isEditedPostEmpty: () => (isEditedPostEmpty),
  isEditedPostNew: () => (isEditedPostNew),
  isEditedPostPublishable: () => (isEditedPostPublishable),
  isEditedPostSaveable: () => (isEditedPostSaveable),
  isEditorPanelEnabled: () => (isEditorPanelEnabled),
  isEditorPanelOpened: () => (isEditorPanelOpened),
  isEditorPanelRemoved: () => (isEditorPanelRemoved),
  isFirstMultiSelectedBlock: () => (isFirstMultiSelectedBlock),
  isInserterOpened: () => (isInserterOpened),
  isListViewOpened: () => (isListViewOpened),
  isMultiSelecting: () => (isMultiSelecting),
  isPermalinkEditable: () => (isPermalinkEditable),
  isPostAutosavingLocked: () => (isPostAutosavingLocked),
  isPostLockTakeover: () => (isPostLockTakeover),
  isPostLocked: () => (isPostLocked),
  isPostSavingLocked: () => (isPostSavingLocked),
  isPreviewingPost: () => (isPreviewingPost),
  isPublishSidebarEnabled: () => (isPublishSidebarEnabled),
  isPublishSidebarOpened: () => (isPublishSidebarOpened),
  isPublishingPost: () => (isPublishingPost),
  isSavingNonPostEntityChanges: () => (isSavingNonPostEntityChanges),
  isSavingPost: () => (isSavingPost),
  isSelectionEnabled: () => (isSelectionEnabled),
  isTyping: () => (isTyping),
  isValidTemplate: () => (isValidTemplate)
});
var actions_namespaceObject = {};
__webpack_require__.r(actions_namespaceObject);
__webpack_require__.d(actions_namespaceObject, {
  __experimentalTearDownEditor: () => (__experimentalTearDownEditor),
  __unstableSaveForPreview: () => (__unstableSaveForPreview),
  autosave: () => (autosave),
  clearSelectedBlock: () => (clearSelectedBlock),
  closePublishSidebar: () => (closePublishSidebar),
  createUndoLevel: () => (createUndoLevel),
  disablePublishSidebar: () => (disablePublishSidebar),
  editPost: () => (editPost),
  enablePublishSidebar: () => (enablePublishSidebar),
  enterFormattedText: () => (enterFormattedText),
  exitFormattedText: () => (exitFormattedText),
  hideInsertionPoint: () => (hideInsertionPoint),
  insertBlock: () => (insertBlock),
  insertBlocks: () => (insertBlocks),
  insertDefaultBlock: () => (insertDefaultBlock),
  lockPostAutosaving: () => (lockPostAutosaving),
  lockPostSaving: () => (lockPostSaving),
  mergeBlocks: () => (mergeBlocks),
  moveBlockToPosition: () => (moveBlockToPosition),
  moveBlocksDown: () => (moveBlocksDown),
  moveBlocksUp: () => (moveBlocksUp),
  multiSelect: () => (multiSelect),
  openPublishSidebar: () => (openPublishSidebar),
  receiveBlocks: () => (receiveBlocks),
  redo: () => (redo),
  refreshPost: () => (refreshPost),
  removeBlock: () => (removeBlock),
  removeBlocks: () => (removeBlocks),
  removeEditorPanel: () => (removeEditorPanel),
  replaceBlock: () => (replaceBlock),
  replaceBlocks: () => (replaceBlocks),
  resetBlocks: () => (resetBlocks),
  resetEditorBlocks: () => (resetEditorBlocks),
  resetPost: () => (resetPost),
  savePost: () => (savePost),
  selectBlock: () => (selectBlock),
  setDeviceType: () => (setDeviceType),
  setEditedPost: () => (setEditedPost),
  setIsInserterOpened: () => (setIsInserterOpened),
  setIsListViewOpened: () => (setIsListViewOpened),
  setRenderingMode: () => (setRenderingMode),
  setTemplateValidity: () => (setTemplateValidity),
  setupEditor: () => (setupEditor),
  setupEditorState: () => (setupEditorState),
  showInsertionPoint: () => (showInsertionPoint),
  startMultiSelect: () => (startMultiSelect),
  startTyping: () => (startTyping),
  stopMultiSelect: () => (stopMultiSelect),
  stopTyping: () => (stopTyping),
  switchEditorMode: () => (switchEditorMode),
  synchronizeTemplate: () => (synchronizeTemplate),
  toggleBlockMode: () => (toggleBlockMode),
  toggleDistractionFree: () => (toggleDistractionFree),
  toggleEditorPanelEnabled: () => (toggleEditorPanelEnabled),
  toggleEditorPanelOpened: () => (toggleEditorPanelOpened),
  togglePublishSidebar: () => (togglePublishSidebar),
  toggleSelection: () => (toggleSelection),
  toggleSpotlightMode: () => (toggleSpotlightMode),
  toggleTopToolbar: () => (toggleTopToolbar),
  trashPost: () => (trashPost),
  undo: () => (undo),
  unlockPostAutosaving: () => (unlockPostAutosaving),
  unlockPostSaving: () => (unlockPostSaving),
  updateBlock: () => (updateBlock),
  updateBlockAttributes: () => (updateBlockAttributes),
  updateBlockListSettings: () => (updateBlockListSettings),
  updateEditorSettings: () => (updateEditorSettings),
  updatePost: () => (updatePost),
  updatePostLock: () => (updatePostLock)
});
var store_actions_namespaceObject = {};
__webpack_require__.r(store_actions_namespaceObject);
__webpack_require__.d(store_actions_namespaceObject, {
  closeModal: () => (closeModal),
  disableComplementaryArea: () => (disableComplementaryArea),
  enableComplementaryArea: () => (enableComplementaryArea),
  openModal: () => (openModal),
  pinItem: () => (pinItem),
  setDefaultComplementaryArea: () => (setDefaultComplementaryArea),
  setFeatureDefaults: () => (setFeatureDefaults),
  setFeatureValue: () => (setFeatureValue),
  toggleFeature: () => (toggleFeature),
  unpinItem: () => (unpinItem)
});
var store_selectors_namespaceObject = {};
__webpack_require__.r(store_selectors_namespaceObject);
__webpack_require__.d(store_selectors_namespaceObject, {
  getActiveComplementaryArea: () => (getActiveComplementaryArea),
  isComplementaryAreaLoading: () => (isComplementaryAreaLoading),
  isFeatureActive: () => (isFeatureActive),
  isItemPinned: () => (isItemPinned),
  isModalActive: () => (isModalActive)
});
var build_module_namespaceObject = {};
__webpack_require__.r(build_module_namespaceObject);
__webpack_require__.d(build_module_namespaceObject, {
  ActionItem: () => (action_item),
  ComplementaryArea: () => (complementary_area),
  ComplementaryAreaMoreMenuItem: () => (ComplementaryAreaMoreMenuItem),
  FullscreenMode: () => (fullscreen_mode),
  InterfaceSkeleton: () => (interface_skeleton),
  NavigableRegion: () => (navigable_region),
  PinnedItems: () => (pinned_items),
  store: () => (store)
});
var store_private_actions_namespaceObject = {};
__webpack_require__.r(store_private_actions_namespaceObject);
__webpack_require__.d(store_private_actions_namespaceObject, {
  createTemplate: () => (createTemplate),
  hideBlockTypes: () => (hideBlockTypes),
  registerEntityAction: () => (registerEntityAction),
  registerEntityField: () => (registerEntityField),
  registerPostTypeSchema: () => (registerPostTypeSchema),
  removeTemplates: () => (removeTemplates),
  revertTemplate: () => (private_actions_revertTemplate),
  saveDirtyEntities: () => (saveDirtyEntities),
  setCurrentTemplateId: () => (setCurrentTemplateId),
  setDefaultRenderingMode: () => (setDefaultRenderingMode),
  setIsReady: () => (setIsReady),
  showBlockTypes: () => (showBlockTypes),
  unregisterEntityAction: () => (unregisterEntityAction),
  unregisterEntityField: () => (unregisterEntityField)
});
var store_private_selectors_namespaceObject = {};
__webpack_require__.r(store_private_selectors_namespaceObject);
__webpack_require__.d(store_private_selectors_namespaceObject, {
  getDefaultRenderingMode: () => (getDefaultRenderingMode),
  getEntityActions: () => (private_selectors_getEntityActions),
  getEntityFields: () => (private_selectors_getEntityFields),
  getInserter: () => (getInserter),
  getInserterSidebarToggleRef: () => (getInserterSidebarToggleRef),
  getListViewToggleRef: () => (getListViewToggleRef),
  getPostBlocksByName: () => (getPostBlocksByName),
  getPostIcon: () => (getPostIcon),
  hasPostMetaChanges: () => (hasPostMetaChanges),
  isEntityReady: () => (private_selectors_isEntityReady)
});
;
const external_wp_data_namespaceObject = window["wp"]["data"];
;
const external_wp_coreData_namespaceObject = window["wp"]["coreData"];
;
const external_wp_element_namespaceObject = window["wp"]["element"];
;
const external_wp_compose_namespaceObject = window["wp"]["compose"];
;
const external_wp_hooks_namespaceObject = window["wp"]["hooks"];
;
const external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;
const EDITOR_SETTINGS_DEFAULTS = {
  ...external_wp_blockEditor_namespaceObject.SETTINGS_DEFAULTS,
  richEditingEnabled: true,
  codeEditingEnabled: true,
  fontLibraryEnabled: true,
  enableCustomFields: undefined,
  defaultRenderingMode: 'post-only'
};
;
function isReady(state = {}, action) {
  switch (action.type) {
    case 'SET_IS_READY':
      return {
        ...state,
        [action.kind]: {
          ...state[action.kind],
          [action.name]: true
        }
      };
  }
  return state;
}
function actions(state = {}, action) {
  var _state$action$kind$ac;
  switch (action.type) {
    case 'REGISTER_ENTITY_ACTION':
      return {
        ...state,
        [action.kind]: {
          ...state[action.kind],
          [action.name]: [...((_state$action$kind$ac = state[action.kind]?.[action.name]) !== null && _state$action$kind$ac !== void 0 ? _state$action$kind$ac : []).filter(_action => _action.id !== action.config.id), action.config]
        }
      };
    case 'UNREGISTER_ENTITY_ACTION':
      {
        var _state$action$kind$ac2;
        return {
          ...state,
          [action.kind]: {
            ...state[action.kind],
            [action.name]: ((_state$action$kind$ac2 = state[action.kind]?.[action.name]) !== null && _state$action$kind$ac2 !== void 0 ? _state$action$kind$ac2 : []).filter(_action => _action.id !== action.actionId)
          }
        };
      }
  }
  return state;
}
function fields(state = {}, action) {
  var _state$action$kind$ac3, _state$action$kind$ac4;
  switch (action.type) {
    case 'REGISTER_ENTITY_FIELD':
      return {
        ...state,
        [action.kind]: {
          ...state[action.kind],
          [action.name]: [...((_state$action$kind$ac3 = state[action.kind]?.[action.name]) !== null && _state$action$kind$ac3 !== void 0 ? _state$action$kind$ac3 : []).filter(_field => _field.id !== action.config.id), action.config]
        }
      };
    case 'UNREGISTER_ENTITY_FIELD':
      return {
        ...state,
        [action.kind]: {
          ...state[action.kind],
          [action.name]: ((_state$action$kind$ac4 = state[action.kind]?.[action.name]) !== null && _state$action$kind$ac4 !== void 0 ? _state$action$kind$ac4 : []).filter(_field => _field.id !== action.fieldId)
        }
      };
  }
  return state;
}
 const reducer = ((0,external_wp_data_namespaceObject.combineReducers)({
  actions,
  fields,
  isReady
}));
;
function getPostRawValue(value) {
  if (value && 'object' === typeof value && 'raw' in value) {
    return value.raw;
  }
  return value;
}
function hasSameKeys(a, b) {
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  return keysA.length === keysB.length && keysA.every((key, index) => keysB[index] === key);
}
function isUpdatingSamePostProperty(action, previousAction) {
  return action.type === 'EDIT_POST' && hasSameKeys(action.edits, previousAction.edits);
}
function shouldOverwriteState(action, previousAction) {
  if (action.type === 'RESET_EDITOR_BLOCKS') {
    return !action.shouldCreateUndoLevel;
  }
  if (!previousAction || action.type !== previousAction.type) {
    return false;
  }
  return isUpdatingSamePostProperty(action, previousAction);
}
function postId(state = null, action) {
  switch (action.type) {
    case 'SET_EDITED_POST':
      return action.postId;
  }
  return state;
}
function templateId(state = null, action) {
  switch (action.type) {
    case 'SET_CURRENT_TEMPLATE_ID':
      return action.id;
  }
  return state;
}
function postType(state = null, action) {
  switch (action.type) {
    case 'SET_EDITED_POST':
      return action.postType;
  }
  return state;
}
function template(state = {
  isValid: true
}, action) {
  switch (action.type) {
    case 'SET_TEMPLATE_VALIDITY':
      return {
        ...state,
        isValid: action.isValid
      };
  }
  return state;
}
function saving(state = {}, action) {
  switch (action.type) {
    case 'REQUEST_POST_UPDATE_START':
    case 'REQUEST_POST_UPDATE_FINISH':
      return {
        pending: action.type === 'REQUEST_POST_UPDATE_START',
        options: action.options || {}
      };
  }
  return state;
}
function deleting(state = {}, action) {
  switch (action.type) {
    case 'REQUEST_POST_DELETE_START':
    case 'REQUEST_POST_DELETE_FINISH':
      return {
        pending: action.type === 'REQUEST_POST_DELETE_START'
      };
  }
  return state;
}
function postLock(state = {
  isLocked: false
}, action) {
  switch (action.type) {
    case 'UPDATE_POST_LOCK':
      return action.lock;
  }
  return state;
}
function postSavingLock(state = {}, action) {
  switch (action.type) {
    case 'LOCK_POST_SAVING':
      return {
        ...state,
        [action.lockName]: true
      };
    case 'UNLOCK_POST_SAVING':
      {
        const {
          [action.lockName]: removedLockName,
          ...restState
        } = state;
        return restState;
      }
  }
  return state;
}
function postAutosavingLock(state = {}, action) {
  switch (action.type) {
    case 'LOCK_POST_AUTOSAVING':
      return {
        ...state,
        [action.lockName]: true
      };
    case 'UNLOCK_POST_AUTOSAVING':
      {
        const {
          [action.lockName]: removedLockName,
          ...restState
        } = state;
        return restState;
      }
  }
  return state;
}
function editorSettings(state = EDITOR_SETTINGS_DEFAULTS, action) {
  switch (action.type) {
    case 'UPDATE_EDITOR_SETTINGS':
      return {
        ...state,
        ...action.settings
      };
  }
  return state;
}
function renderingMode(state = 'post-only', action) {
  switch (action.type) {
    case 'SET_RENDERING_MODE':
      return action.mode;
  }
  return state;
}
function deviceType(state = 'Desktop', action) {
  switch (action.type) {
    case 'SET_DEVICE_TYPE':
      return action.deviceType;
  }
  return state;
}
function removedPanels(state = [], action) {
  switch (action.type) {
    case 'REMOVE_PANEL':
      if (!state.includes(action.panelName)) {
        return [...state, action.panelName];
      }
  }
  return state;
}
function blockInserterPanel(state = false, action) {
  switch (action.type) {
    case 'SET_IS_LIST_VIEW_OPENED':
      return action.isOpen ? false : state;
    case 'SET_IS_INSERTER_OPENED':
      return action.value;
  }
  return state;
}
function listViewPanel(state = false, action) {
  switch (action.type) {
    case 'SET_IS_INSERTER_OPENED':
      return action.value ? false : state;
    case 'SET_IS_LIST_VIEW_OPENED':
      return action.isOpen;
  }
  return state;
}
function listViewToggleRef(state = {
  current: null
}) {
  return state;
}
function inserterSidebarToggleRef(state = {
  current: null
}) {
  return state;
}
function publishSidebarActive(state = false, action) {
  switch (action.type) {
    case 'OPEN_PUBLISH_SIDEBAR':
      return true;
    case 'CLOSE_PUBLISH_SIDEBAR':
      return false;
    case 'TOGGLE_PUBLISH_SIDEBAR':
      return !state;
  }
  return state;
}
 const store_reducer = ((0,external_wp_data_namespaceObject.combineReducers)({
  postId,
  postType,
  templateId,
  saving,
  deleting,
  postLock,
  template,
  postSavingLock,
  editorSettings,
  postAutosavingLock,
  renderingMode,
  deviceType,
  removedPanels,
  blockInserterPanel,
  inserterSidebarToggleRef,
  listViewPanel,
  listViewToggleRef,
  publishSidebarActive,
  dataviews: reducer
}));
;
const external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;
const external_wp_date_namespaceObject = window["wp"]["date"];
;
const external_wp_url_namespaceObject = window["wp"]["url"];
;
const external_wp_deprecated_namespaceObject = window["wp"]["deprecated"];
var external_wp_deprecated_default = __webpack_require__.n(external_wp_deprecated_namespaceObject);
;
const external_wp_preferences_namespaceObject = window["wp"]["preferences"];
;
const EDIT_MERGE_PROPERTIES = new Set(['meta']);
const STORE_NAME = 'core/editor';
const PERMALINK_POSTNAME_REGEX = /%(?:postname|pagename)%/;
const ONE_MINUTE_IN_MS = 60 * 1000;
const AUTOSAVE_PROPERTIES = ['title', 'excerpt', 'content'];
const TEMPLATE_PART_AREA_DEFAULT_CATEGORY = 'uncategorized';
const TEMPLATE_POST_TYPE = 'wp_template';
const TEMPLATE_PART_POST_TYPE = 'wp_template_part';
const PATTERN_POST_TYPE = 'wp_block';
const NAVIGATION_POST_TYPE = 'wp_navigation';
const TEMPLATE_ORIGINS = {
  custom: 'custom',
  theme: 'theme',
  plugin: 'plugin'
};
const TEMPLATE_POST_TYPES = ['wp_template', 'wp_template_part'];
const GLOBAL_POST_TYPES = [...TEMPLATE_POST_TYPES, 'wp_block', 'wp_navigation'];
;
const external_wp_primitives_namespaceObject = window["wp"]["primitives"];
;
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;
const header = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M18.5 10.5H10v8h8a.5.5 0 00.5-.5v-7.5zm-10 0h-3V18a.5.5 0 00.5.5h2.5v-8zM6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
  })
});
 const library_header = (header);
;
const footer = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    d: "M18 5.5h-8v8h8.5V6a.5.5 0 00-.5-.5zm-9.5 8h-3V6a.5.5 0 01.5-.5h2.5v8zM6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
  })
});
 const library_footer = (footer);
;
const sidebar = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M18 5.5H6a.5.5 0 00-.5.5v3h13V6a.5.5 0 00-.5-.5zm.5 5H10v8h8a.5.5 0 00.5-.5v-7.5zM6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
  })
});
 const library_sidebar = (sidebar);
;
const symbolFilled = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M21.3 10.8l-5.6-5.6c-.7-.7-1.8-.7-2.5 0l-5.6 5.6c-.7.7-.7 1.8 0 2.5l5.6 5.6c.3.3.8.5 1.2.5s.9-.2 1.2-.5l5.6-5.6c.8-.7.8-1.9.1-2.5zm-17.6 1L10 5.5l-1-1-6.3 6.3c-.7.7-.7 1.8 0 2.5L9 19.5l1.1-1.1-6.3-6.3c-.2 0-.2-.2-.1-.3z"
  })
});
 const symbol_filled = (symbolFilled);
;
function getTemplatePartIcon(iconName) {
  if ('header' === iconName) {
    return library_header;
  } else if ('footer' === iconName) {
    return library_footer;
  } else if ('sidebar' === iconName) {
    return library_sidebar;
  }
  return symbol_filled;
}
;
const external_wp_privateApis_namespaceObject = window["wp"]["privateApis"];
;
const {
  lock,
  unlock
} = (0,external_wp_privateApis_namespaceObject.__dangerousOptInToUnstableAPIsOnlyForCoreModules)('I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.', '@wordpress/editor');
;
const layout = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M18 5.5H6a.5.5 0 00-.5.5v3h13V6a.5.5 0 00-.5-.5zm.5 5H10v8h8a.5.5 0 00.5-.5v-7.5zm-10 0h-3V18a.5.5 0 00.5.5h2.5v-8zM6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
  })
});
 const library_layout = (layout);
;
const EMPTY_OBJECT = {};
const getTemplateInfo = params => {
  var _Object$values$find;
  if (!params) {
    return EMPTY_OBJECT;
  }
  const {
    templateTypes,
    templateAreas,
    template
  } = params;
  const {
    description,
    slug,
    title,
    area
  } = template;
  const {
    title: defaultTitle,
    description: defaultDescription
  } = (_Object$values$find = Object.values(templateTypes).find(type => type.slug === slug)) !== null && _Object$values$find !== void 0 ? _Object$values$find : EMPTY_OBJECT;
  const templateTitle = typeof title === 'string' ? title : title?.rendered;
  const templateDescription = typeof description === 'string' ? description : description?.raw;
  const templateAreasWithIcon = templateAreas?.map(item => ({
    ...item,
    icon: getTemplatePartIcon(item.icon)
  }));
  const templateIcon = templateAreasWithIcon?.find(item => area === item.area)?.icon || library_layout;
  return {
    title: templateTitle && templateTitle !== slug ? templateTitle : defaultTitle || slug,
    description: templateDescription || defaultDescription,
    icon: templateIcon
  };
};
;
const selectors_EMPTY_OBJECT = {};
const hasEditorUndo = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => () => {
  return select(external_wp_coreData_namespaceObject.store).hasUndo();
});
const hasEditorRedo = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => () => {
  return select(external_wp_coreData_namespaceObject.store).hasRedo();
});
function isEditedPostNew(state) {
  return getCurrentPost(state).status === 'auto-draft';
}
function hasChangedContent(state) {
  const edits = getPostEdits(state);
  return 'content' in edits;
}
const isEditedPostDirty = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => state => {
  const postType = getCurrentPostType(state);
  const postId = getCurrentPostId(state);
  return select(external_wp_coreData_namespaceObject.store).hasEditsForEntityRecord('postType', postType, postId);
});
const hasNonPostEntityChanges = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => state => {
  const dirtyEntityRecords = select(external_wp_coreData_namespaceObject.store).__experimentalGetDirtyEntityRecords();
  const {
    type,
    id
  } = getCurrentPost(state);
  return dirtyEntityRecords.some(entityRecord => entityRecord.kind !== 'postType' || entityRecord.name !== type || entityRecord.key !== id);
});
function isCleanNewPost(state) {
  return !isEditedPostDirty(state) && isEditedPostNew(state);
}
const getCurrentPost = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => state => {
  const postId = getCurrentPostId(state);
  const postType = getCurrentPostType(state);
  const post = select(external_wp_coreData_namespaceObject.store).getRawEntityRecord('postType', postType, postId);
  if (post) {
    return post;
  }
  return selectors_EMPTY_OBJECT;
});
function getCurrentPostType(state) {
  return state.postType;
}
function getCurrentPostId(state) {
  return state.postId;
}
function getCurrentTemplateId(state) {
  return state.templateId;
}
function getCurrentPostRevisionsCount(state) {
  var _getCurrentPost$_link;
  return (_getCurrentPost$_link = getCurrentPost(state)._links?.['version-history']?.[0]?.count) !== null && _getCurrentPost$_link !== void 0 ? _getCurrentPost$_link : 0;
}
function getCurrentPostLastRevisionId(state) {
  var _getCurrentPost$_link2;
  return (_getCurrentPost$_link2 = getCurrentPost(state)._links?.['predecessor-version']?.[0]?.id) !== null && _getCurrentPost$_link2 !== void 0 ? _getCurrentPost$_link2 : null;
}
const getPostEdits = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => state => {
  const postType = getCurrentPostType(state);
  const postId = getCurrentPostId(state);
  return select(external_wp_coreData_namespaceObject.store).getEntityRecordEdits('postType', postType, postId) || selectors_EMPTY_OBJECT;
});
function getCurrentPostAttribute(state, attributeName) {
  switch (attributeName) {
    case 'type':
      return getCurrentPostType(state);
    case 'id':
      return getCurrentPostId(state);
    default:
      const post = getCurrentPost(state);
      if (!post.hasOwnProperty(attributeName)) {
        break;
      }
      return getPostRawValue(post[attributeName]);
  }
}
const getNestedEditedPostProperty = (0,external_wp_data_namespaceObject.createSelector)((state, attributeName) => {
  const edits = getPostEdits(state);
  if (!edits.hasOwnProperty(attributeName)) {
    return getCurrentPostAttribute(state, attributeName);
  }
  return {
    ...getCurrentPostAttribute(state, attributeName),
    ...edits[attributeName]
  };
}, (state, attributeName) => [getCurrentPostAttribute(state, attributeName), getPostEdits(state)[attributeName]]);
function getEditedPostAttribute(state, attributeName) {
  switch (attributeName) {
    case 'content':
      return getEditedPostContent(state);
  }
  const edits = getPostEdits(state);
  if (!edits.hasOwnProperty(attributeName)) {
    return getCurrentPostAttribute(state, attributeName);
  }
  if (EDIT_MERGE_PROPERTIES.has(attributeName)) {
    return getNestedEditedPostProperty(state, attributeName);
  }
  return edits[attributeName];
}
const getAutosaveAttribute = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, attributeName) => {
  if (!AUTOSAVE_PROPERTIES.includes(attributeName) && attributeName !== 'preview_link') {
    return;
  }
  const postType = getCurrentPostType(state);
  if (postType === 'wp_template') {
    return false;
  }
  const postId = getCurrentPostId(state);
  const currentUserId = select(external_wp_coreData_namespaceObject.store).getCurrentUser()?.id;
  const autosave = select(external_wp_coreData_namespaceObject.store).getAutosave(postType, postId, currentUserId);
  if (autosave) {
    return getPostRawValue(autosave[attributeName]);
  }
});
function getEditedPostVisibility(state) {
  const status = getEditedPostAttribute(state, 'status');
  if (status === 'private') {
    return 'private';
  }
  const password = getEditedPostAttribute(state, 'password');
  if (password) {
    return 'password';
  }
  return 'public';
}
function isCurrentPostPending(state) {
  return getCurrentPost(state).status === 'pending';
}
function isCurrentPostPublished(state, currentPost) {
  const post = currentPost || getCurrentPost(state);
  return ['publish', 'private'].indexOf(post.status) !== -1 || post.status === 'future' && !(0,external_wp_date_namespaceObject.isInTheFuture)(new Date(Number((0,external_wp_date_namespaceObject.getDate)(post.date)) - ONE_MINUTE_IN_MS));
}
function isCurrentPostScheduled(state) {
  return getCurrentPost(state).status === 'future' && !isCurrentPostPublished(state);
}
function isEditedPostPublishable(state) {
  const post = getCurrentPost(state);
  return isEditedPostDirty(state) || ['publish', 'private', 'future'].indexOf(post.status) === -1;
}
function isEditedPostSaveable(state) {
  if (isSavingPost(state)) {
    return false;
  }
  return !!getEditedPostAttribute(state, 'title') || !!getEditedPostAttribute(state, 'excerpt') || !isEditedPostEmpty(state) || external_wp_element_namespaceObject.Platform.OS === 'native';
}
const isEditedPostEmpty = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => state => {
  const postId = getCurrentPostId(state);
  const postType = getCurrentPostType(state);
  const record = select(external_wp_coreData_namespaceObject.store).getEditedEntityRecord('postType', postType, postId);
  if (typeof record.content !== 'function') {
    return !record.content;
  }
  const blocks = getEditedPostAttribute(state, 'blocks');
  if (blocks.length === 0) {
    return true;
  }
  if (blocks.length > 1) {
    return false;
  }
  const blockName = blocks[0].name;
  if (blockName !== (0,external_wp_blocks_namespaceObject.getDefaultBlockName)() && blockName !== (0,external_wp_blocks_namespaceObject.getFreeformContentHandlerName)()) {
    return false;
  }
  return !getEditedPostContent(state);
});
const isEditedPostAutosaveable = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => state => {
  if (!isEditedPostSaveable(state)) {
    return false;
  }
  if (isPostAutosavingLocked(state)) {
    return false;
  }
  const postType = getCurrentPostType(state);
  if (postType === 'wp_template') {
    return false;
  }
  const postId = getCurrentPostId(state);
  const hasFetchedAutosave = select(external_wp_coreData_namespaceObject.store).hasFetchedAutosaves(postType, postId);
  const currentUserId = select(external_wp_coreData_namespaceObject.store).getCurrentUser()?.id;
  const autosave = select(external_wp_coreData_namespaceObject.store).getAutosave(postType, postId, currentUserId);
  if (!hasFetchedAutosave) {
    return false;
  }
  if (!autosave) {
    return true;
  }
  if (hasChangedContent(state)) {
    return true;
  }
  return ['title', 'excerpt', 'meta'].some(field => getPostRawValue(autosave[field]) !== getEditedPostAttribute(state, field));
});
function isEditedPostBeingScheduled(state) {
  const date = getEditedPostAttribute(state, 'date');
  const checkedDate = new Date(Number((0,external_wp_date_namespaceObject.getDate)(date)) - ONE_MINUTE_IN_MS);
  return (0,external_wp_date_namespaceObject.isInTheFuture)(checkedDate);
}
function isEditedPostDateFloating(state) {
  const date = getEditedPostAttribute(state, 'date');
  const modified = getEditedPostAttribute(state, 'modified');
  const status = getCurrentPost(state).status;
  if (status === 'draft' || status === 'auto-draft' || status === 'pending') {
    return date === modified || date === null;
  }
  return false;
}
function isDeletingPost(state) {
  return !!state.deleting.pending;
}
function isSavingPost(state) {
  return !!state.saving.pending;
}
const isSavingNonPostEntityChanges = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => state => {
  const entitiesBeingSaved = select(external_wp_coreData_namespaceObject.store).__experimentalGetEntitiesBeingSaved();
  const {
    type,
    id
  } = getCurrentPost(state);
  return entitiesBeingSaved.some(entityRecord => entityRecord.kind !== 'postType' || entityRecord.name !== type || entityRecord.key !== id);
});
const didPostSaveRequestSucceed = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => state => {
  const postType = getCurrentPostType(state);
  const postId = getCurrentPostId(state);
  return !select(external_wp_coreData_namespaceObject.store).getLastEntitySaveError('postType', postType, postId);
});
const didPostSaveRequestFail = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => state => {
  const postType = getCurrentPostType(state);
  const postId = getCurrentPostId(state);
  return !!select(external_wp_coreData_namespaceObject.store).getLastEntitySaveError('postType', postType, postId);
});
function isAutosavingPost(state) {
  return isSavingPost(state) && Boolean(state.saving.options?.isAutosave);
}
function isPreviewingPost(state) {
  return isSavingPost(state) && Boolean(state.saving.options?.isPreview);
}
function getEditedPostPreviewLink(state) {
  if (state.saving.pending || isSavingPost(state)) {
    return;
  }
  let previewLink = getAutosaveAttribute(state, 'preview_link');
  if (!previewLink || 'draft' === getCurrentPost(state).status) {
    previewLink = getEditedPostAttribute(state, 'link');
    if (previewLink) {
      previewLink = (0,external_wp_url_namespaceObject.addQueryArgs)(previewLink, {
        preview: true
      });
    }
  }
  const featuredImageId = getEditedPostAttribute(state, 'featured_media');
  if (previewLink && featuredImageId) {
    return (0,external_wp_url_namespaceObject.addQueryArgs)(previewLink, {
      _thumbnail_id: featuredImageId
    });
  }
  return previewLink;
}
const getSuggestedPostFormat = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => () => {
  const blocks = select(external_wp_blockEditor_namespaceObject.store).getBlocks();
  if (blocks.length > 2) {
    return null;
  }
  let name;
  if (blocks.length === 1) {
    name = blocks[0].name;
    if (name === 'core/embed') {
      const provider = blocks[0].attributes?.providerNameSlug;
      if (['youtube', 'vimeo'].includes(provider)) {
        name = 'core/video';
      } else if (['spotify', 'soundcloud'].includes(provider)) {
        name = 'core/audio';
      }
    }
  }
  if (blocks.length === 2 && blocks[1].name === 'core/paragraph') {
    name = blocks[0].name;
  }
  switch (name) {
    case 'core/image':
      return 'image';
    case 'core/quote':
    case 'core/pullquote':
      return 'quote';
    case 'core/gallery':
      return 'gallery';
    case 'core/video':
      return 'video';
    case 'core/audio':
      return 'audio';
    default:
      return null;
  }
});
const getEditedPostContent = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => state => {
  const postId = getCurrentPostId(state);
  const postType = getCurrentPostType(state);
  const record = select(external_wp_coreData_namespaceObject.store).getEditedEntityRecord('postType', postType, postId);
  if (record) {
    if (typeof record.content === 'function') {
      return record.content(record);
    } else if (record.blocks) {
      return (0,external_wp_blocks_namespaceObject.__unstableSerializeAndClean)(record.blocks);
    } else if (record.content) {
      return record.content;
    }
  }
  return '';
});
function isPublishingPost(state) {
  return isSavingPost(state) && !isCurrentPostPublished(state) && getEditedPostAttribute(state, 'status') === 'publish';
}
function isPermalinkEditable(state) {
  const permalinkTemplate = getEditedPostAttribute(state, 'permalink_template');
  return PERMALINK_POSTNAME_REGEX.test(permalinkTemplate);
}
function getPermalink(state) {
  const permalinkParts = getPermalinkParts(state);
  if (!permalinkParts) {
    return null;
  }
  const {
    prefix,
    postName,
    suffix
  } = permalinkParts;
  if (isPermalinkEditable(state)) {
    return prefix + postName + suffix;
  }
  return prefix;
}
function getEditedPostSlug(state) {
  return getEditedPostAttribute(state, 'slug') || (0,external_wp_url_namespaceObject.cleanForSlug)(getEditedPostAttribute(state, 'title')) || getCurrentPostId(state);
}
function getPermalinkParts(state) {
  const permalinkTemplate = getEditedPostAttribute(state, 'permalink_template');
  if (!permalinkTemplate) {
    return null;
  }
  const postName = getEditedPostAttribute(state, 'slug') || getEditedPostAttribute(state, 'generated_slug');
  const [prefix, suffix] = permalinkTemplate.split(PERMALINK_POSTNAME_REGEX);
  return {
    prefix,
    postName,
    suffix
  };
}
function isPostLocked(state) {
  return state.postLock.isLocked;
}
function isPostSavingLocked(state) {
  return Object.keys(state.postSavingLock).length > 0;
}
function isPostAutosavingLocked(state) {
  return Object.keys(state.postAutosavingLock).length > 0;
}
function isPostLockTakeover(state) {
  return state.postLock.isTakeover;
}
function getPostLockUser(state) {
  return state.postLock.user;
}
function getActivePostLock(state) {
  return state.postLock.activePostLock;
}
function canUserUseUnfilteredHTML(state) {
  return Boolean(getCurrentPost(state)._links?.hasOwnProperty('wp:action-unfiltered-html'));
}
const isPublishSidebarEnabled = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => () => !!select(external_wp_preferences_namespaceObject.store).get('core', 'isPublishSidebarEnabled'));
const getEditorBlocks = (0,external_wp_data_namespaceObject.createSelector)(state => {
  return getEditedPostAttribute(state, 'blocks') || (0,external_wp_blocks_namespaceObject.parse)(getEditedPostContent(state));
}, state => [getEditedPostAttribute(state, 'blocks'), getEditedPostContent(state)]);
function isEditorPanelRemoved(state, panelName) {
  return state.removedPanels.includes(panelName);
}
const isEditorPanelEnabled = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, panelName) => {
  const inactivePanels = select(external_wp_preferences_namespaceObject.store).get('core', 'inactivePanels');
  return !isEditorPanelRemoved(state, panelName) && !inactivePanels?.includes(panelName);
});
const isEditorPanelOpened = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, panelName) => {
  const openPanels = select(external_wp_preferences_namespaceObject.store).get('core', 'openPanels');
  return !!openPanels?.includes(panelName);
});
function getEditorSelectionStart(state) {
  external_wp_deprecated_default()("select('core/editor').getEditorSelectionStart", {
    since: '5.8',
    alternative: "select('core/editor').getEditorSelection"
  });
  return getEditedPostAttribute(state, 'selection')?.selectionStart;
}
function getEditorSelectionEnd(state) {
  external_wp_deprecated_default()("select('core/editor').getEditorSelectionStart", {
    since: '5.8',
    alternative: "select('core/editor').getEditorSelection"
  });
  return getEditedPostAttribute(state, 'selection')?.selectionEnd;
}
function getEditorSelection(state) {
  return getEditedPostAttribute(state, 'selection');
}
function __unstableIsEditorReady(state) {
  return !!state.postId;
}
function getEditorSettings(state) {
  return state.editorSettings;
}
function getRenderingMode(state) {
  return state.renderingMode;
}
const getDeviceType = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => state => {
  const isZoomOut = unlock(select(external_wp_blockEditor_namespaceObject.store)).isZoomOut();
  if (isZoomOut) {
    return 'Desktop';
  }
  return state.deviceType;
});
function isListViewOpened(state) {
  return state.listViewPanel;
}
function isInserterOpened(state) {
  return !!state.blockInserterPanel;
}
const getEditorMode = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => () => {
  var _select$get;
  return (_select$get = select(external_wp_preferences_namespaceObject.store).get('core', 'editorMode')) !== null && _select$get !== void 0 ? _select$get : 'visual';
});
function getStateBeforeOptimisticTransaction() {
  external_wp_deprecated_default()("select('core/editor').getStateBeforeOptimisticTransaction", {
    since: '5.7',
    hint: 'No state history is kept on this store anymore'
  });
  return null;
}
function inSomeHistory() {
  external_wp_deprecated_default()("select('core/editor').inSomeHistory", {
    since: '5.7',
    hint: 'No state history is kept on this store anymore'
  });
  return false;
}
function getBlockEditorSelector(name) {
  return (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, ...args) => {
    external_wp_deprecated_default()("`wp.data.select( 'core/editor' )." + name + '`', {
      since: '5.3',
      alternative: "`wp.data.select( 'core/block-editor' )." + name + '`',
      version: '6.2'
    });
    return select(external_wp_blockEditor_namespaceObject.store)[name](...args);
  });
}
const getBlockName = getBlockEditorSelector('getBlockName');
const isBlockValid = getBlockEditorSelector('isBlockValid');
const getBlockAttributes = getBlockEditorSelector('getBlockAttributes');
const getBlock = getBlockEditorSelector('getBlock');
const getBlocks = getBlockEditorSelector('getBlocks');
const getClientIdsOfDescendants = getBlockEditorSelector('getClientIdsOfDescendants');
const getClientIdsWithDescendants = getBlockEditorSelector('getClientIdsWithDescendants');
const getGlobalBlockCount = getBlockEditorSelector('getGlobalBlockCount');
const getBlocksByClientId = getBlockEditorSelector('getBlocksByClientId');
const getBlockCount = getBlockEditorSelector('getBlockCount');
const getBlockSelectionStart = getBlockEditorSelector('getBlockSelectionStart');
const getBlockSelectionEnd = getBlockEditorSelector('getBlockSelectionEnd');
const getSelectedBlockCount = getBlockEditorSelector('getSelectedBlockCount');
const hasSelectedBlock = getBlockEditorSelector('hasSelectedBlock');
const getSelectedBlockClientId = getBlockEditorSelector('getSelectedBlockClientId');
const getSelectedBlock = getBlockEditorSelector('getSelectedBlock');
const getBlockRootClientId = getBlockEditorSelector('getBlockRootClientId');
const getBlockHierarchyRootClientId = getBlockEditorSelector('getBlockHierarchyRootClientId');
const getAdjacentBlockClientId = getBlockEditorSelector('getAdjacentBlockClientId');
const getPreviousBlockClientId = getBlockEditorSelector('getPreviousBlockClientId');
const getNextBlockClientId = getBlockEditorSelector('getNextBlockClientId');
const getSelectedBlocksInitialCaretPosition = getBlockEditorSelector('getSelectedBlocksInitialCaretPosition');
const getMultiSelectedBlockClientIds = getBlockEditorSelector('getMultiSelectedBlockClientIds');
const getMultiSelectedBlocks = getBlockEditorSelector('getMultiSelectedBlocks');
const getFirstMultiSelectedBlockClientId = getBlockEditorSelector('getFirstMultiSelectedBlockClientId');
const getLastMultiSelectedBlockClientId = getBlockEditorSelector('getLastMultiSelectedBlockClientId');
const isFirstMultiSelectedBlock = getBlockEditorSelector('isFirstMultiSelectedBlock');
const isBlockMultiSelected = getBlockEditorSelector('isBlockMultiSelected');
const isAncestorMultiSelected = getBlockEditorSelector('isAncestorMultiSelected');
const getMultiSelectedBlocksStartClientId = getBlockEditorSelector('getMultiSelectedBlocksStartClientId');
const getMultiSelectedBlocksEndClientId = getBlockEditorSelector('getMultiSelectedBlocksEndClientId');
const getBlockOrder = getBlockEditorSelector('getBlockOrder');
const getBlockIndex = getBlockEditorSelector('getBlockIndex');
const isBlockSelected = getBlockEditorSelector('isBlockSelected');
const hasSelectedInnerBlock = getBlockEditorSelector('hasSelectedInnerBlock');
const isBlockWithinSelection = getBlockEditorSelector('isBlockWithinSelection');
const hasMultiSelection = getBlockEditorSelector('hasMultiSelection');
const isMultiSelecting = getBlockEditorSelector('isMultiSelecting');
const isSelectionEnabled = getBlockEditorSelector('isSelectionEnabled');
const getBlockMode = getBlockEditorSelector('getBlockMode');
const isTyping = getBlockEditorSelector('isTyping');
const isCaretWithinFormattedText = getBlockEditorSelector('isCaretWithinFormattedText');
const getBlockInsertionPoint = getBlockEditorSelector('getBlockInsertionPoint');
const isBlockInsertionPointVisible = getBlockEditorSelector('isBlockInsertionPointVisible');
const isValidTemplate = getBlockEditorSelector('isValidTemplate');
const getTemplate = getBlockEditorSelector('getTemplate');
const getTemplateLock = getBlockEditorSelector('getTemplateLock');
const canInsertBlockType = getBlockEditorSelector('canInsertBlockType');
const getInserterItems = getBlockEditorSelector('getInserterItems');
const hasInserterItems = getBlockEditorSelector('hasInserterItems');
const getBlockListSettings = getBlockEditorSelector('getBlockListSettings');
const __experimentalGetDefaultTemplateTypes = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => () => {
  external_wp_deprecated_default()("select('core/editor').__experimentalGetDefaultTemplateTypes", {
    since: '6.8',
    alternative: "select('core/core-data').getCurrentTheme()?.default_template_types"
  });
  return select(external_wp_coreData_namespaceObject.store).getCurrentTheme()?.default_template_types;
});
const __experimentalGetDefaultTemplatePartAreas = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (0,external_wp_data_namespaceObject.createSelector)(() => {
  external_wp_deprecated_default()("select('core/editor').__experimentalGetDefaultTemplatePartAreas", {
    since: '6.8',
    alternative: "select('core/core-data').getCurrentTheme()?.default_template_part_areas"
  });
  const areas = select(external_wp_coreData_namespaceObject.store).getCurrentTheme()?.default_template_part_areas || [];
  return areas.map(item => {
    return {
      ...item,
      icon: getTemplatePartIcon(item.icon)
    };
  });
}));
const __experimentalGetDefaultTemplateType = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (0,external_wp_data_namespaceObject.createSelector)((state, slug) => {
  var _Object$values$find;
  external_wp_deprecated_default()("select('core/editor').__experimentalGetDefaultTemplateType", {
    since: '6.8'
  });
  const templateTypes = select(external_wp_coreData_namespaceObject.store).getCurrentTheme()?.default_template_types;
  if (!templateTypes) {
    return selectors_EMPTY_OBJECT;
  }
  return (_Object$values$find = Object.values(templateTypes).find(type => type.slug === slug)) !== null && _Object$values$find !== void 0 ? _Object$values$find : selectors_EMPTY_OBJECT;
}));
const __experimentalGetTemplateInfo = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (0,external_wp_data_namespaceObject.createSelector)((state, template) => {
  external_wp_deprecated_default()("select('core/editor').__experimentalGetTemplateInfo", {
    since: '6.8'
  });
  if (!template) {
    return selectors_EMPTY_OBJECT;
  }
  const currentTheme = select(external_wp_coreData_namespaceObject.store).getCurrentTheme();
  const templateTypes = currentTheme?.default_template_types || [];
  const templateAreas = currentTheme?.default_template_part_areas || [];
  return getTemplateInfo({
    template,
    templateAreas,
    templateTypes
  });
}));
const getPostTypeLabel = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => state => {
  const currentPostType = getCurrentPostType(state);
  const postType = select(external_wp_coreData_namespaceObject.store).getPostType(currentPostType);
  return postType?.labels?.singular_name;
});
function isPublishSidebarOpened(state) {
  return state.publishSidebarActive;
}
;
const external_wp_a11y_namespaceObject = window["wp"]["a11y"];
;
const external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
var external_wp_apiFetch_default = __webpack_require__.n(external_wp_apiFetch_namespaceObject);
;
const external_wp_notices_namespaceObject = window["wp"]["notices"];
;
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;
function postKey(postId, isPostNew) {
  return `wp-autosave-block-editor-post-${isPostNew ? 'auto-draft' : postId}`;
}
function localAutosaveGet(postId, isPostNew) {
  return window.sessionStorage.getItem(postKey(postId, isPostNew));
}
function localAutosaveSet(postId, isPostNew, title, content, excerpt) {
  window.sessionStorage.setItem(postKey(postId, isPostNew), JSON.stringify({
    post_title: title,
    content,
    excerpt
  }));
}
function localAutosaveClear(postId, isPostNew) {
  window.sessionStorage.removeItem(postKey(postId, isPostNew));
}
;
function getNotificationArgumentsForSaveSuccess(data) {
  var _postType$viewable;
  const {
    previousPost,
    post,
    postType
  } = data;
  if (data.options?.isAutosave) {
    return [];
  }
  const publishStatus = ['publish', 'private', 'future'];
  const isPublished = publishStatus.includes(previousPost.status);
  const willPublish = publishStatus.includes(post.status);
  const willTrash = post.status === 'trash' && previousPost.status !== 'trash';
  let noticeMessage;
  let shouldShowLink = (_postType$viewable = postType?.viewable) !== null && _postType$viewable !== void 0 ? _postType$viewable : false;
  let isDraft;
  if (willTrash) {
    noticeMessage = postType.labels.item_trashed;
    shouldShowLink = false;
  } else if (!isPublished && !willPublish) {
    noticeMessage = (0,external_wp_i18n_namespaceObject.__)('Draft saved.');
    isDraft = true;
  } else if (isPublished && !willPublish) {
    noticeMessage = postType.labels.item_reverted_to_draft;
    shouldShowLink = false;
  } else if (!isPublished && willPublish) {
    noticeMessage = {
      publish: postType.labels.item_published,
      private: postType.labels.item_published_privately,
      future: postType.labels.item_scheduled
    }[post.status];
  } else {
    noticeMessage = postType.labels.item_updated;
  }
  const actions = [];
  if (shouldShowLink) {
    actions.push({
      label: isDraft ? (0,external_wp_i18n_namespaceObject.__)('View Preview') : postType.labels.view_item,
      url: post.link
    });
  }
  return [noticeMessage, {
    id: 'editor-save',
    type: 'snackbar',
    actions
  }];
}
function getNotificationArgumentsForSaveFail(data) {
  const {
    post,
    edits,
    error
  } = data;
  if (error && 'rest_autosave_no_changes' === error.code) {
    return [];
  }
  const publishStatus = ['publish', 'private', 'future'];
  const isPublished = publishStatus.indexOf(post.status) !== -1;
  const messages = {
    publish: (0,external_wp_i18n_namespaceObject.__)('Publishing failed.'),
    private: (0,external_wp_i18n_namespaceObject.__)('Publishing failed.'),
    future: (0,external_wp_i18n_namespaceObject.__)('Scheduling failed.')
  };
  let noticeMessage = !isPublished && publishStatus.indexOf(edits.status) !== -1 ? messages[edits.status] : (0,external_wp_i18n_namespaceObject.__)('Updating failed.');
  if (error.message && !/<\/?[^>]*>/.test(error.message)) {
    noticeMessage = [noticeMessage, error.message].join(' ');
  }
  return [noticeMessage, {
    id: 'editor-save'
  }];
}
function getNotificationArgumentsForTrashFail(data) {
  return [data.error.message && data.error.code !== 'unknown_error' ? data.error.message : (0,external_wp_i18n_namespaceObject.__)('Trashing failed'), {
    id: 'editor-trash-fail'
  }];
}
;
const setupEditor = (post, edits, template) => ({
  dispatch
}) => {
  dispatch.setEditedPost(post.type, post.id);
  const isNewPost = post.status === 'auto-draft';
  if (isNewPost && template) {
    let content;
    if ('content' in edits) {
      content = edits.content;
    } else {
      content = post.content.raw;
    }
    let blocks = (0,external_wp_blocks_namespaceObject.parse)(content);
    blocks = (0,external_wp_blocks_namespaceObject.synchronizeBlocksWithTemplate)(blocks, template);
    dispatch.resetEditorBlocks(blocks, {
      __unstableShouldCreateUndoLevel: false
    });
  }
  if (edits && Object.values(edits).some(([key, edit]) => {
    var _post$key$raw;
    return edit !== ((_post$key$raw = post[key]?.raw) !== null && _post$key$raw !== void 0 ? _post$key$raw : post[key]);
  })) {
    dispatch.editPost(edits);
  }
};
function __experimentalTearDownEditor() {
  external_wp_deprecated_default()("wp.data.dispatch( 'core/editor' ).__experimentalTearDownEditor", {
    since: '6.5'
  });
  return {
    type: 'DO_NOTHING'
  };
}
function resetPost() {
  external_wp_deprecated_default()("wp.data.dispatch( 'core/editor' ).resetPost", {
    since: '6.0',
    version: '6.3',
    alternative: 'Initialize the editor with the setupEditorState action'
  });
  return {
    type: 'DO_NOTHING'
  };
}
function updatePost() {
  external_wp_deprecated_default()("wp.data.dispatch( 'core/editor' ).updatePost", {
    since: '5.7',
    alternative: 'Use the core entities store instead'
  });
  return {
    type: 'DO_NOTHING'
  };
}
function setupEditorState(post) {
  external_wp_deprecated_default()("wp.data.dispatch( 'core/editor' ).setupEditorState", {
    since: '6.5',
    alternative: "wp.data.dispatch( 'core/editor' ).setEditedPost"
  });
  return setEditedPost(post.type, post.id);
}
function setEditedPost(postType, postId) {
  return {
    type: 'SET_EDITED_POST',
    postType,
    postId
  };
}
const editPost = (edits, options) => ({
  select,
  registry
}) => {
  const {
    id,
    type
  } = select.getCurrentPost();
  registry.dispatch(external_wp_coreData_namespaceObject.store).editEntityRecord('postType', type, id, edits, options);
};
const savePost = (options = {}) => async ({
  select,
  dispatch,
  registry
}) => {
  if (!select.isEditedPostSaveable()) {
    return;
  }
  const content = select.getEditedPostContent();
  if (!options.isAutosave) {
    dispatch.editPost({
      content
    }, {
      undoIgnore: true
    });
  }
  const previousRecord = select.getCurrentPost();
  let edits = {
    id: previousRecord.id,
    ...registry.select(external_wp_coreData_namespaceObject.store).getEntityRecordNonTransientEdits('postType', previousRecord.type, previousRecord.id),
    content
  };
  dispatch({
    type: 'REQUEST_POST_UPDATE_START',
    options
  });
  let error = false;
  try {
    edits = await (0,external_wp_hooks_namespaceObject.applyFiltersAsync)('editor.preSavePost', edits, options);
  } catch (err) {
    error = err;
  }
  if (!error) {
    try {
      await registry.dispatch(external_wp_coreData_namespaceObject.store).saveEntityRecord('postType', previousRecord.type, edits, options);
    } catch (err) {
      error = err.message && err.code !== 'unknown_error' ? err.message : (0,external_wp_i18n_namespaceObject.__)('An error occurred while updating.');
    }
  }
  if (!error) {
    error = registry.select(external_wp_coreData_namespaceObject.store).getLastEntitySaveError('postType', previousRecord.type, previousRecord.id);
  }
  if (!error) {
    try {
      await (0,external_wp_hooks_namespaceObject.applyFilters)('editor.__unstableSavePost', Promise.resolve(), options);
    } catch (err) {
      error = err;
    }
  }
  if (!error) {
    try {
      await (0,external_wp_hooks_namespaceObject.doActionAsync)('editor.savePost', {
        id: previousRecord.id
      }, options);
    } catch (err) {
      error = err;
    }
  }
  dispatch({
    type: 'REQUEST_POST_UPDATE_FINISH',
    options
  });
  if (error) {
    const args = getNotificationArgumentsForSaveFail({
      post: previousRecord,
      edits,
      error
    });
    if (args.length) {
      registry.dispatch(external_wp_notices_namespaceObject.store).createErrorNotice(...args);
    }
  } else {
    const updatedRecord = select.getCurrentPost();
    const args = getNotificationArgumentsForSaveSuccess({
      previousPost: previousRecord,
      post: updatedRecord,
      postType: await registry.resolveSelect(external_wp_coreData_namespaceObject.store).getPostType(updatedRecord.type),
      options
    });
    if (args.length) {
      registry.dispatch(external_wp_notices_namespaceObject.store).createSuccessNotice(...args);
    }
    if (!options.isAutosave) {
      registry.dispatch(external_wp_blockEditor_namespaceObject.store).__unstableMarkLastChangeAsPersistent();
    }
  }
};
function refreshPost() {
  external_wp_deprecated_default()("wp.data.dispatch( 'core/editor' ).refreshPost", {
    since: '6.0',
    version: '6.3',
    alternative: 'Use the core entities store instead'
  });
  return {
    type: 'DO_NOTHING'
  };
}
const trashPost = () => async ({
  select,
  dispatch,
  registry
}) => {
  const postTypeSlug = select.getCurrentPostType();
  const postType = await registry.resolveSelect(external_wp_coreData_namespaceObject.store).getPostType(postTypeSlug);
  const {
    rest_base: restBase,
    rest_namespace: restNamespace = 'wp/v2'
  } = postType;
  dispatch({
    type: 'REQUEST_POST_DELETE_START'
  });
  try {
    const post = select.getCurrentPost();
    await external_wp_apiFetch_default()({
      path: `/${restNamespace}/${restBase}/${post.id}`,
      method: 'DELETE'
    });
    await dispatch.savePost();
  } catch (error) {
    registry.dispatch(external_wp_notices_namespaceObject.store).createErrorNotice(...getNotificationArgumentsForTrashFail({
      error
    }));
  }
  dispatch({
    type: 'REQUEST_POST_DELETE_FINISH'
  });
};
const autosave = ({
  local = false,
  ...options
} = {}) => async ({
  select,
  dispatch
}) => {
  const post = select.getCurrentPost();
  if (post.type === 'wp_template') {
    return;
  }
  if (local) {
    const isPostNew = select.isEditedPostNew();
    const title = select.getEditedPostAttribute('title');
    const content = select.getEditedPostAttribute('content');
    const excerpt = select.getEditedPostAttribute('excerpt');
    localAutosaveSet(post.id, isPostNew, title, content, excerpt);
  } else {
    await dispatch.savePost({
      isAutosave: true,
      ...options
    });
  }
};
const __unstableSaveForPreview = ({
  forceIsAutosaveable
} = {}) => async ({
  select,
  dispatch
}) => {
  if ((forceIsAutosaveable || select.isEditedPostAutosaveable()) && !select.isPostLocked()) {
    const isDraft = ['draft', 'auto-draft'].includes(select.getEditedPostAttribute('status'));
    if (isDraft) {
      await dispatch.savePost({
        isPreview: true
      });
    } else {
      await dispatch.autosave({
        isPreview: true
      });
    }
  }
  return select.getEditedPostPreviewLink();
};
const redo = () => ({
  registry
}) => {
  registry.dispatch(external_wp_coreData_namespaceObject.store).redo();
};
const undo = () => ({
  registry
}) => {
  registry.dispatch(external_wp_coreData_namespaceObject.store).undo();
};
function createUndoLevel() {
  external_wp_deprecated_default()("wp.data.dispatch( 'core/editor' ).createUndoLevel", {
    since: '6.0',
    version: '6.3',
    alternative: 'Use the core entities store instead'
  });
  return {
    type: 'DO_NOTHING'
  };
}
function updatePostLock(lock) {
  return {
    type: 'UPDATE_POST_LOCK',
    lock
  };
}
const enablePublishSidebar = () => ({
  registry
}) => {
  registry.dispatch(external_wp_preferences_namespaceObject.store).set('core', 'isPublishSidebarEnabled', true);
};
const disablePublishSidebar = () => ({
  registry
}) => {
  registry.dispatch(external_wp_preferences_namespaceObject.store).set('core', 'isPublishSidebarEnabled', false);
};
function lockPostSaving(lockName) {
  return {
    type: 'LOCK_POST_SAVING',
    lockName
  };
}
function unlockPostSaving(lockName) {
  return {
    type: 'UNLOCK_POST_SAVING',
    lockName
  };
}
function lockPostAutosaving(lockName) {
  return {
    type: 'LOCK_POST_AUTOSAVING',
    lockName
  };
}
function unlockPostAutosaving(lockName) {
  return {
    type: 'UNLOCK_POST_AUTOSAVING',
    lockName
  };
}
const resetEditorBlocks = (blocks, options = {}) => ({
  select,
  dispatch,
  registry
}) => {
  const {
    __unstableShouldCreateUndoLevel,
    selection
  } = options;
  const edits = {
    blocks,
    selection
  };
  if (__unstableShouldCreateUndoLevel !== false) {
    const {
      id,
      type
    } = select.getCurrentPost();
    const noChange = registry.select(external_wp_coreData_namespaceObject.store).getEditedEntityRecord('postType', type, id).blocks === edits.blocks;
    if (noChange) {
      registry.dispatch(external_wp_coreData_namespaceObject.store).__unstableCreateUndoLevel('postType', type, id);
      return;
    }
    edits.content = ({
      blocks: blocksForSerialization = []
    }) => (0,external_wp_blocks_namespaceObject.__unstableSerializeAndClean)(blocksForSerialization);
  }
  dispatch.editPost(edits);
};
function updateEditorSettings(settings) {
  return {
    type: 'UPDATE_EDITOR_SETTINGS',
    settings
  };
}
const setRenderingMode = mode => ({
  dispatch,
  registry,
  select
}) => {
  if (select.__unstableIsEditorReady()) {
    registry.dispatch(external_wp_blockEditor_namespaceObject.store).clearSelectedBlock();
    dispatch.editPost({
      selection: undefined
    }, {
      undoIgnore: true
    });
  }
  dispatch({
    type: 'SET_RENDERING_MODE',
    mode
  });
};
function setDeviceType(deviceType) {
  return {
    type: 'SET_DEVICE_TYPE',
    deviceType
  };
}
const toggleEditorPanelEnabled = panelName => ({
  registry
}) => {
  var _registry$select$get;
  const inactivePanels = (_registry$select$get = registry.select(external_wp_preferences_namespaceObject.store).get('core', 'inactivePanels')) !== null && _registry$select$get !== void 0 ? _registry$select$get : [];
  const isPanelInactive = !!inactivePanels?.includes(panelName);
  let updatedInactivePanels;
  if (isPanelInactive) {
    updatedInactivePanels = inactivePanels.filter(invactivePanelName => invactivePanelName !== panelName);
  } else {
    updatedInactivePanels = [...inactivePanels, panelName];
  }
  registry.dispatch(external_wp_preferences_namespaceObject.store).set('core', 'inactivePanels', updatedInactivePanels);
};
const toggleEditorPanelOpened = panelName => ({
  registry
}) => {
  var _registry$select$get2;
  const openPanels = (_registry$select$get2 = registry.select(external_wp_preferences_namespaceObject.store).get('core', 'openPanels')) !== null && _registry$select$get2 !== void 0 ? _registry$select$get2 : [];
  const isPanelOpen = !!openPanels?.includes(panelName);
  let updatedOpenPanels;
  if (isPanelOpen) {
    updatedOpenPanels = openPanels.filter(openPanelName => openPanelName !== panelName);
  } else {
    updatedOpenPanels = [...openPanels, panelName];
  }
  registry.dispatch(external_wp_preferences_namespaceObject.store).set('core', 'openPanels', updatedOpenPanels);
};
function removeEditorPanel(panelName) {
  return {
    type: 'REMOVE_PANEL',
    panelName
  };
}
const setIsInserterOpened = value => ({
  dispatch,
  registry
}) => {
  if (typeof value === 'object' && value.hasOwnProperty('rootClientId') && value.hasOwnProperty('insertionIndex')) {
    unlock(registry.dispatch(external_wp_blockEditor_namespaceObject.store)).setInsertionPoint({
      rootClientId: value.rootClientId,
      index: value.insertionIndex
    });
  }
  dispatch({
    type: 'SET_IS_INSERTER_OPENED',
    value
  });
};
function setIsListViewOpened(isOpen) {
  return {
    type: 'SET_IS_LIST_VIEW_OPENED',
    isOpen
  };
}
const toggleDistractionFree = ({
  createNotice = true
} = {}) => ({
  dispatch,
  registry
}) => {
  const isDistractionFree = registry.select(external_wp_preferences_namespaceObject.store).get('core', 'distractionFree');
  if (isDistractionFree) {
    registry.dispatch(external_wp_preferences_namespaceObject.store).set('core', 'fixedToolbar', false);
  }
  if (!isDistractionFree) {
    registry.batch(() => {
      registry.dispatch(external_wp_preferences_namespaceObject.store).set('core', 'fixedToolbar', true);
      dispatch.setIsInserterOpened(false);
      dispatch.setIsListViewOpened(false);
      unlock(registry.dispatch(external_wp_blockEditor_namespaceObject.store)).resetZoomLevel();
    });
  }
  registry.batch(() => {
    registry.dispatch(external_wp_preferences_namespaceObject.store).set('core', 'distractionFree', !isDistractionFree);
    if (createNotice) {
      registry.dispatch(external_wp_notices_namespaceObject.store).createInfoNotice(isDistractionFree ? (0,external_wp_i18n_namespaceObject.__)('Distraction free mode deactivated.') : (0,external_wp_i18n_namespaceObject.__)('Distraction free mode activated.'), {
        id: 'core/editor/distraction-free-mode/notice',
        type: 'snackbar',
        actions: [{
          label: (0,external_wp_i18n_namespaceObject.__)('Undo'),
          onClick: () => {
            registry.batch(() => {
              registry.dispatch(external_wp_preferences_namespaceObject.store).set('core', 'fixedToolbar', isDistractionFree);
              registry.dispatch(external_wp_preferences_namespaceObject.store).toggle('core', 'distractionFree');
            });
          }
        }]
      });
    }
  });
};
const toggleSpotlightMode = () => ({
  registry
}) => {
  registry.dispatch(external_wp_preferences_namespaceObject.store).toggle('core', 'focusMode');
  const isFocusMode = registry.select(external_wp_preferences_namespaceObject.store).get('core', 'focusMode');
  registry.dispatch(external_wp_notices_namespaceObject.store).createInfoNotice(isFocusMode ? (0,external_wp_i18n_namespaceObject.__)('Spotlight mode activated.') : (0,external_wp_i18n_namespaceObject.__)('Spotlight mode deactivated.'), {
    id: 'core/editor/toggle-spotlight-mode/notice',
    type: 'snackbar',
    actions: [{
      label: (0,external_wp_i18n_namespaceObject.__)('Undo'),
      onClick: () => {
        registry.dispatch(external_wp_preferences_namespaceObject.store).toggle('core', 'focusMode');
      }
    }]
  });
};
const toggleTopToolbar = () => ({
  registry
}) => {
  registry.dispatch(external_wp_preferences_namespaceObject.store).toggle('core', 'fixedToolbar');
  const isTopToolbar = registry.select(external_wp_preferences_namespaceObject.store).get('core', 'fixedToolbar');
  registry.dispatch(external_wp_notices_namespaceObject.store).createInfoNotice(isTopToolbar ? (0,external_wp_i18n_namespaceObject.__)('Top toolbar activated.') : (0,external_wp_i18n_namespaceObject.__)('Top toolbar deactivated.'), {
    id: 'core/editor/toggle-top-toolbar/notice',
    type: 'snackbar',
    actions: [{
      label: (0,external_wp_i18n_namespaceObject.__)('Undo'),
      onClick: () => {
        registry.dispatch(external_wp_preferences_namespaceObject.store).toggle('core', 'fixedToolbar');
      }
    }]
  });
};
const switchEditorMode = mode => ({
  dispatch,
  registry
}) => {
  registry.dispatch(external_wp_preferences_namespaceObject.store).set('core', 'editorMode', mode);
  if (mode !== 'visual') {
    registry.dispatch(external_wp_blockEditor_namespaceObject.store).clearSelectedBlock();
    unlock(registry.dispatch(external_wp_blockEditor_namespaceObject.store)).resetZoomLevel();
  }
  if (mode === 'visual') {
    (0,external_wp_a11y_namespaceObject.speak)((0,external_wp_i18n_namespaceObject.__)('Visual editor selected'), 'assertive');
  } else if (mode === 'text') {
    const isDistractionFree = registry.select(external_wp_preferences_namespaceObject.store).get('core', 'distractionFree');
    if (isDistractionFree) {
      dispatch.toggleDistractionFree();
    }
    (0,external_wp_a11y_namespaceObject.speak)((0,external_wp_i18n_namespaceObject.__)('Code editor selected'), 'assertive');
  }
};
function openPublishSidebar() {
  return {
    type: 'OPEN_PUBLISH_SIDEBAR'
  };
}
function closePublishSidebar() {
  return {
    type: 'CLOSE_PUBLISH_SIDEBAR'
  };
}
function togglePublishSidebar() {
  return {
    type: 'TOGGLE_PUBLISH_SIDEBAR'
  };
}
const getBlockEditorAction = name => (...args) => ({
  registry
}) => {
  external_wp_deprecated_default()("`wp.data.dispatch( 'core/editor' )." + name + '`', {
    since: '5.3',
    alternative: "`wp.data.dispatch( 'core/block-editor' )." + name + '`',
    version: '6.2'
  });
  registry.dispatch(external_wp_blockEditor_namespaceObject.store)[name](...args);
};
const resetBlocks = getBlockEditorAction('resetBlocks');
const receiveBlocks = getBlockEditorAction('receiveBlocks');
const updateBlock = getBlockEditorAction('updateBlock');
const updateBlockAttributes = getBlockEditorAction('updateBlockAttributes');
const selectBlock = getBlockEditorAction('selectBlock');
const startMultiSelect = getBlockEditorAction('startMultiSelect');
const stopMultiSelect = getBlockEditorAction('stopMultiSelect');
const multiSelect = getBlockEditorAction('multiSelect');
const clearSelectedBlock = getBlockEditorAction('clearSelectedBlock');
const toggleSelection = getBlockEditorAction('toggleSelection');
const replaceBlocks = getBlockEditorAction('replaceBlocks');
const replaceBlock = getBlockEditorAction('replaceBlock');
const moveBlocksDown = getBlockEditorAction('moveBlocksDown');
const moveBlocksUp = getBlockEditorAction('moveBlocksUp');
const moveBlockToPosition = getBlockEditorAction('moveBlockToPosition');
const insertBlock = getBlockEditorAction('insertBlock');
const insertBlocks = getBlockEditorAction('insertBlocks');
const showInsertionPoint = getBlockEditorAction('showInsertionPoint');
const hideInsertionPoint = getBlockEditorAction('hideInsertionPoint');
const setTemplateValidity = getBlockEditorAction('setTemplateValidity');
const synchronizeTemplate = getBlockEditorAction('synchronizeTemplate');
const mergeBlocks = getBlockEditorAction('mergeBlocks');
const removeBlocks = getBlockEditorAction('removeBlocks');
const removeBlock = getBlockEditorAction('removeBlock');
const toggleBlockMode = getBlockEditorAction('toggleBlockMode');
const startTyping = getBlockEditorAction('startTyping');
const stopTyping = getBlockEditorAction('stopTyping');
const enterFormattedText = getBlockEditorAction('enterFormattedText');
const exitFormattedText = getBlockEditorAction('exitFormattedText');
const insertDefaultBlock = getBlockEditorAction('insertDefaultBlock');
const updateBlockListSettings = getBlockEditorAction('updateBlockListSettings');
;
const external_wp_htmlEntities_namespaceObject = window["wp"]["htmlEntities"];
;
function isTemplateRevertable(templateOrTemplatePart) {
  if (!templateOrTemplatePart) {
    return false;
  }
  return templateOrTemplatePart.source === TEMPLATE_ORIGINS.custom && (Boolean(templateOrTemplatePart?.plugin) || templateOrTemplatePart?.has_theme_file);
}
;
const external = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M19.5 4.5h-7V6h4.44l-5.97 5.97 1.06 1.06L18 7.06v4.44h1.5v-7Zm-13 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3H17v3a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h3V5.5h-3Z"
  })
});
 const library_external = (external);
;
const viewPost = {
  id: 'view-post',
  label: (0,external_wp_i18n_namespaceObject._x)('View', 'verb'),
  isPrimary: true,
  icon: library_external,
  isEligible(post) {
    return post.status !== 'trash';
  },
  callback(posts, {
    onActionPerformed
  }) {
    const post = posts[0];
    window.open(post?.link, '_blank');
    if (onActionPerformed) {
      onActionPerformed(posts);
    }
  }
};
 const view_post = (viewPost);
;
const viewPostRevisions = {
  id: 'view-post-revisions',
  context: 'list',
  label(items) {
    var _items$0$_links$versi;
    const revisionsCount = (_items$0$_links$versi = items[0]._links?.['version-history']?.[0]?.count) !== null && _items$0$_links$versi !== void 0 ? _items$0$_links$versi : 0;
    return (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('View revisions (%s)'), revisionsCount);
  },
  isEligible(post) {
    var _post$_links$predeces, _post$_links$version;
    if (post.status === 'trash') {
      return false;
    }
    const lastRevisionId = (_post$_links$predeces = post?._links?.['predecessor-version']?.[0]?.id) !== null && _post$_links$predeces !== void 0 ? _post$_links$predeces : null;
    const revisionsCount = (_post$_links$version = post?._links?.['version-history']?.[0]?.count) !== null && _post$_links$version !== void 0 ? _post$_links$version : 0;
    return !!lastRevisionId && revisionsCount > 1;
  },
  callback(posts, {
    onActionPerformed
  }) {
    const post = posts[0];
    const href = (0,external_wp_url_namespaceObject.addQueryArgs)('revision.php', {
      revision: post?._links?.['predecessor-version']?.[0]?.id
    });
    document.location.href = href;
    if (onActionPerformed) {
      onActionPerformed(posts);
    }
  }
};
 const view_post_revisions = (viewPostRevisions);
;
const external_wp_components_namespaceObject = window["wp"]["components"];
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
function dotCase(input, options) {
    if (options === void 0) { options = {}; }
    return noCase(input, __assign({ delimiter: "." }, options));
}
;
function paramCase(input, options) {
    if (options === void 0) { options = {}; }
    return dotCase(input, __assign({ delimiter: "-" }, options));
}
;
const useExistingTemplateParts = () => {
  var _useSelect;
  return (_useSelect = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_coreData_namespaceObject.store).getEntityRecords('postType', 'wp_template_part', {
    per_page: -1
  }), [])) !== null && _useSelect !== void 0 ? _useSelect : [];
};
const getUniqueTemplatePartTitle = (title, templateParts) => {
  const lowercaseTitle = title.toLowerCase();
  const existingTitles = templateParts.map(templatePart => templatePart.title.rendered.toLowerCase());
  if (!existingTitles.includes(lowercaseTitle)) {
    return title;
  }
  let suffix = 2;
  while (existingTitles.includes(`${lowercaseTitle} ${suffix}`)) {
    suffix++;
  }
  return `${title} ${suffix}`;
};
const getCleanTemplatePartSlug = title => {
  return paramCase(title).replace(/[^\w-]+/g, '') || 'wp-custom-part';
};
;
function getAreaRadioId(value, instanceId) {
  return `fields-create-template-part-modal__area-option-${value}-${instanceId}`;
}
function getAreaRadioDescriptionId(value, instanceId) {
  return `fields-create-template-part-modal__area-option-description-${value}-${instanceId}`;
}
function CreateTemplatePartModal({
  modalTitle,
  ...restProps
}) {
  const defaultModalTitle = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_coreData_namespaceObject.store).getPostType('wp_template_part')?.labels?.add_new_item, []);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Modal, {
    title: modalTitle || defaultModalTitle,
    onRequestClose: restProps.closeModal,
    overlayClassName: "fields-create-template-part-modal",
    focusOnMount: "firstContentElement",
    size: "medium",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(CreateTemplatePartModalContents, {
      ...restProps
    })
  });
}
const create_template_part_modal_getTemplatePartIcon = iconName => {
  if ('header' === iconName) {
    return library_header;
  } else if ('footer' === iconName) {
    return library_footer;
  } else if ('sidebar' === iconName) {
    return library_sidebar;
  }
  return symbol_filled;
};
function CreateTemplatePartModalContents({
  defaultArea = 'uncategorized',
  blocks = [],
  confirmLabel = (0,external_wp_i18n_namespaceObject.__)('Add'),
  closeModal,
  onCreate,
  onError,
  defaultTitle = ''
}) {
  const {
    createErrorNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const {
    saveEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const existingTemplateParts = useExistingTemplateParts();
  const [title, setTitle] = (0,external_wp_element_namespaceObject.useState)(defaultTitle);
  const [area, setArea] = (0,external_wp_element_namespaceObject.useState)(defaultArea);
  const [isSubmitting, setIsSubmitting] = (0,external_wp_element_namespaceObject.useState)(false);
  const instanceId = (0,external_wp_compose_namespaceObject.useInstanceId)(CreateTemplatePartModal);
  const defaultTemplatePartAreas = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_coreData_namespaceObject.store).getCurrentTheme()?.default_template_part_areas, []);
  async function createTemplatePart() {
    if (!title || isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
      const uniqueTitle = getUniqueTemplatePartTitle(title, existingTemplateParts);
      const cleanSlug = getCleanTemplatePartSlug(uniqueTitle);
      const templatePart = await saveEntityRecord('postType', 'wp_template_part', {
        slug: cleanSlug,
        title: uniqueTitle,
        content: (0,external_wp_blocks_namespaceObject.serialize)(blocks),
        area
      }, {
        throwOnError: true
      });
      await onCreate(templatePart);
    } catch (error) {
      const errorMessage = error instanceof Error && 'code' in error && error.message && error.code !== 'unknown_error' ? error.message : (0,external_wp_i18n_namespaceObject.__)('An error occurred while creating the template part.');
      createErrorNotice(errorMessage, {
        type: 'snackbar'
      });
      onError?.();
    } finally {
      setIsSubmitting(false);
    }
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
    onSubmit: async event => {
      event.preventDefault();
      await createTemplatePart();
    },
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      spacing: "4",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_namespaceObject.__)('Name'),
        value: title,
        onChange: setTitle,
        required: true
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("fieldset", {
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.BaseControl.VisualLabel, {
          as: "legend",
          children: (0,external_wp_i18n_namespaceObject.__)('Area')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "fields-create-template-part-modal__area-radio-group",
          children: (defaultTemplatePartAreas !== null && defaultTemplatePartAreas !== void 0 ? defaultTemplatePartAreas : []).map(item => {
            const icon = create_template_part_modal_getTemplatePartIcon(item.icon);
            return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
              className: "fields-create-template-part-modal__area-radio-wrapper",
              children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("input", {
                type: "radio",
                id: getAreaRadioId(item.area, instanceId),
                name: `fields-create-template-part-modal__area-${instanceId}`,
                value: item.area,
                checked: area === item.area,
                onChange: () => {
                  setArea(item.area);
                },
                "aria-describedby": getAreaRadioDescriptionId(item.area, instanceId)
              }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
                icon: icon,
                className: "fields-create-template-part-modal__area-radio-icon"
              }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("label", {
                htmlFor: getAreaRadioId(item.area, instanceId),
                className: "fields-create-template-part-modal__area-radio-label",
                children: item.label
              }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
                icon: library_check,
                className: "fields-create-template-part-modal__area-radio-checkmark"
              }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
                className: "fields-create-template-part-modal__area-radio-description",
                id: getAreaRadioDescriptionId(item.area, instanceId),
                children: item.description
              })]
            }, item.area);
          })
        })]
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
        justify: "right",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "tertiary",
          onClick: () => {
            closeModal();
          },
          children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "primary",
          type: "submit",
          "aria-disabled": !title || isSubmitting,
          isBusy: isSubmitting,
          children: confirmLabel
        })]
      })]
    })
  });
}
;
function isTemplate(post) {
  return post.type === 'wp_template';
}
function isTemplatePart(post) {
  return post.type === 'wp_template_part';
}
function isTemplateOrTemplatePart(p) {
  return p.type === 'wp_template' || p.type === 'wp_template_part';
}
function getItemTitle(item) {
  if (typeof item.title === 'string') {
    return (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(item.title);
  }
  if (item.title && 'rendered' in item.title) {
    return (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(item.title.rendered);
  }
  if (item.title && 'raw' in item.title) {
    return (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(item.title.raw);
  }
  return '';
}
function isTemplateRemovable(template) {
  if (!template) {
    return false;
  }
  return [template.source, template.source].includes('custom') && !Boolean(template.type === 'wp_template' && template?.plugin) && !template.has_theme_file;
}
;
const duplicateTemplatePart = {
  id: 'duplicate-template-part',
  label: (0,external_wp_i18n_namespaceObject._x)('Duplicate', 'action label'),
  isEligible: item => item.type === 'wp_template_part',
  modalHeader: (0,external_wp_i18n_namespaceObject._x)('Duplicate template part', 'action label'),
  RenderModal: ({
    items,
    closeModal
  }) => {
    const [item] = items;
    const blocks = (0,external_wp_element_namespaceObject.useMemo)(() => {
      var _item$blocks;
      return (_item$blocks = item.blocks) !== null && _item$blocks !== void 0 ? _item$blocks : (0,external_wp_blocks_namespaceObject.parse)(typeof item.content === 'string' ? item.content : item.content.raw, {
        __unstableSkipMigrationLogs: true
      });
    }, [item.content, item.blocks]);
    const {
      createSuccessNotice
    } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
    function onTemplatePartSuccess(templatePart) {
      createSuccessNotice((0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject._x)('"%s" duplicated.', 'template part'), getItemTitle(templatePart)), {
        type: 'snackbar',
        id: 'edit-site-patterns-success'
      });
      closeModal?.();
    }
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(CreateTemplatePartModalContents, {
      blocks: blocks,
      defaultArea: item.area,
      defaultTitle: (0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject._x)('%s (Copy)', 'template part'), getItemTitle(item)),
      onCreate: onTemplatePartSuccess,
      onError: closeModal,
      confirmLabel: (0,external_wp_i18n_namespaceObject._x)('Duplicate', 'action label'),
      closeModal: closeModal !== null && closeModal !== void 0 ? closeModal : () => {}
    });
  }
};
 const duplicate_template_part = (duplicateTemplatePart);
;
const external_wp_patterns_namespaceObject = window["wp"]["patterns"];
;
const {
  lock: lock_unlock_lock,
  unlock: lock_unlock_unlock
} = (0,external_wp_privateApis_namespaceObject.__dangerousOptInToUnstableAPIsOnlyForCoreModules)('I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.', '@wordpress/fields');
;
const {
  CreatePatternModalContents,
  useDuplicatePatternProps
} = lock_unlock_unlock(external_wp_patterns_namespaceObject.privateApis);
const duplicatePattern = {
  id: 'duplicate-pattern',
  label: (0,external_wp_i18n_namespaceObject._x)('Duplicate', 'action label'),
  isEligible: item => item.type !== 'wp_template_part',
  modalHeader: (0,external_wp_i18n_namespaceObject._x)('Duplicate pattern', 'action label'),
  RenderModal: ({
    items,
    closeModal
  }) => {
    const [item] = items;
    const duplicatedProps = useDuplicatePatternProps({
      pattern: item,
      onSuccess: () => closeModal?.()
    });
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(CreatePatternModalContents, {
      onClose: closeModal,
      confirmLabel: (0,external_wp_i18n_namespaceObject._x)('Duplicate', 'action label'),
      ...duplicatedProps
    });
  }
};
 const duplicate_pattern = (duplicatePattern);
;
const {
  PATTERN_TYPES
} = lock_unlock_unlock(external_wp_patterns_namespaceObject.privateApis);
const renamePost = {
  id: 'rename-post',
  label: (0,external_wp_i18n_namespaceObject.__)('Rename'),
  isEligible(post) {
    if (post.status === 'trash') {
      return false;
    }
    if (!['wp_template', 'wp_template_part', ...Object.values(PATTERN_TYPES)].includes(post.type)) {
      return post.permissions?.update;
    }
    if (isTemplate(post)) {
      return isTemplateRemovable(post) && post.is_custom && post.permissions?.update;
    }
    if (isTemplatePart(post)) {
      return post.source === 'custom' && !post?.has_theme_file && post.permissions?.update;
    }
    return post.type === PATTERN_TYPES.user && post.permissions?.update;
  },
  RenderModal: ({
    items,
    closeModal,
    onActionPerformed
  }) => {
    const [item] = items;
    const [title, setTitle] = (0,external_wp_element_namespaceObject.useState)(() => getItemTitle(item));
    const {
      editEntityRecord,
      saveEditedEntityRecord
    } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
    const {
      createSuccessNotice,
      createErrorNotice
    } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
    async function onRename(event) {
      event.preventDefault();
      try {
        await editEntityRecord('postType', item.type, item.id, {
          title
        });
        setTitle('');
        closeModal?.();
        await saveEditedEntityRecord('postType', item.type, item.id, {
          throwOnError: true
        });
        createSuccessNotice((0,external_wp_i18n_namespaceObject.__)('Name updated'), {
          type: 'snackbar'
        });
        onActionPerformed?.(items);
      } catch (error) {
        const typedError = error;
        const errorMessage = typedError.message && typedError.code !== 'unknown_error' ? typedError.message : (0,external_wp_i18n_namespaceObject.__)('An error occurred while updating the name');
        createErrorNotice(errorMessage, {
          type: 'snackbar'
        });
      }
    }
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
      onSubmit: onRename,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
        spacing: "5",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
          __nextHasNoMarginBottom: true,
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_namespaceObject.__)('Name'),
          value: title,
          onChange: setTitle,
          required: true
        }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
          justify: "right",
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            variant: "tertiary",
            onClick: () => {
              closeModal?.();
            },
            children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            variant: "primary",
            type: "submit",
            children: (0,external_wp_i18n_namespaceObject.__)('Save')
          })]
        })]
      })
    });
  }
};
 const rename_post = (renamePost);
;
function sort(a, b, direction) {
  return direction === 'asc' ? a - b : b - a;
}
function isValid(value, context) {
  if (value === '') {
    return false;
  }
  if (!Number.isInteger(Number(value))) {
    return false;
  }
  if (context?.elements) {
    const validValues = context?.elements.map(f => f.value);
    if (!validValues.includes(Number(value))) {
      return false;
    }
  }
  return true;
}
 const integer = ({
  sort,
  isValid,
  Edit: 'integer'
});
;
function text_sort(valueA, valueB, direction) {
  return direction === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
}
function text_isValid(value, context) {
  if (context?.elements) {
    const validValues = context?.elements?.map(f => f.value);
    if (!validValues.includes(value)) {
      return false;
    }
  }
  return true;
}
 const field_types_text = ({
  sort: text_sort,
  isValid: text_isValid,
  Edit: 'text'
});
;
function datetime_sort(a, b, direction) {
  const timeA = new Date(a).getTime();
  const timeB = new Date(b).getTime();
  return direction === 'asc' ? timeA - timeB : timeB - timeA;
}
function datetime_isValid(value, context) {
  if (context?.elements) {
    const validValues = context?.elements.map(f => f.value);
    if (!validValues.includes(value)) {
      return false;
    }
  }
  return true;
}
 const datetime = ({
  sort: datetime_sort,
  isValid: datetime_isValid,
  Edit: 'datetime'
});
;
function getFieldTypeDefinition(type) {
  if ('integer' === type) {
    return integer;
  }
  if ('text' === type) {
    return field_types_text;
  }
  if ('datetime' === type) {
    return datetime;
  }
  return {
    sort: (a, b, direction) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return direction === 'asc' ? a - b : b - a;
      }
      return direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
    },
    isValid: (value, context) => {
      if (context?.elements) {
        const validValues = context?.elements?.map(f => f.value);
        if (!validValues.includes(value)) {
          return false;
        }
      }
      return true;
    },
    Edit: () => null
  };
}
;
function DateTime({
  data,
  field,
  onChange,
  hideLabelFromVision
}) {
  const {
    id,
    label
  } = field;
  const value = field.getValue({
    item: data
  });
  const onChangeControl = (0,external_wp_element_namespaceObject.useCallback)(newValue => onChange({
    [id]: newValue
  }), [id, onChange]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("fieldset", {
    className: "dataviews-controls__datetime",
    children: [!hideLabelFromVision && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.BaseControl.VisualLabel, {
      as: "legend",
      children: label
    }), hideLabelFromVision && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.VisuallyHidden, {
      as: "legend",
      children: label
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TimePicker, {
      currentTime: value,
      onChange: onChangeControl,
      hideLabelFromVision: true
    })]
  });
}
;
function Integer({
  data,
  field,
  onChange,
  hideLabelFromVision
}) {
  var _field$getValue;
  const {
    id,
    label,
    description
  } = field;
  const value = (_field$getValue = field.getValue({
    item: data
  })) !== null && _field$getValue !== void 0 ? _field$getValue : '';
  const onChangeControl = (0,external_wp_element_namespaceObject.useCallback)(newValue => onChange({
    [id]: Number(newValue)
  }), [id, onChange]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalNumberControl, {
    label: label,
    help: description,
    value: value,
    onChange: onChangeControl,
    __next40pxDefaultSize: true,
    hideLabelFromVision: hideLabelFromVision
  });
}
;
function Radio({
  data,
  field,
  onChange,
  hideLabelFromVision
}) {
  const {
    id,
    label
  } = field;
  const value = field.getValue({
    item: data
  });
  const onChangeControl = (0,external_wp_element_namespaceObject.useCallback)(newValue => onChange({
    [id]: newValue
  }), [id, onChange]);
  if (field.elements) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.RadioControl, {
      label: label,
      onChange: onChangeControl,
      options: field.elements,
      selected: value,
      hideLabelFromVision: hideLabelFromVision
    });
  }
  return null;
}
;
function Select({
  data,
  field,
  onChange,
  hideLabelFromVision
}) {
  var _field$getValue, _field$elements;
  const {
    id,
    label
  } = field;
  const value = (_field$getValue = field.getValue({
    item: data
  })) !== null && _field$getValue !== void 0 ? _field$getValue : '';
  const onChangeControl = (0,external_wp_element_namespaceObject.useCallback)(newValue => onChange({
    [id]: newValue
  }), [id, onChange]);
  const elements = [
  {
    label: (0,external_wp_i18n_namespaceObject.__)('Select item'),
    value: ''
  }, ...((_field$elements = field?.elements) !== null && _field$elements !== void 0 ? _field$elements : [])];
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
    label: label,
    value: value,
    options: elements,
    onChange: onChangeControl,
    __next40pxDefaultSize: true,
    __nextHasNoMarginBottom: true,
    hideLabelFromVision: hideLabelFromVision
  });
}
;
function Text({
  data,
  field,
  onChange,
  hideLabelFromVision
}) {
  const {
    id,
    label,
    placeholder
  } = field;
  const value = field.getValue({
    item: data
  });
  const onChangeControl = (0,external_wp_element_namespaceObject.useCallback)(newValue => onChange({
    [id]: newValue
  }), [id, onChange]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
    label: label,
    placeholder: placeholder,
    value: value !== null && value !== void 0 ? value : '',
    onChange: onChangeControl,
    __next40pxDefaultSize: true,
    __nextHasNoMarginBottom: true,
    hideLabelFromVision: hideLabelFromVision
  });
}
;
const FORM_CONTROLS = {
  datetime: DateTime,
  integer: Integer,
  radio: Radio,
  select: Select,
  text: Text
};
function getControl(field, fieldTypeDefinition) {
  if (typeof field.Edit === 'function') {
    return field.Edit;
  }
  if (typeof field.Edit === 'string') {
    return getControlByType(field.Edit);
  }
  if (field.elements) {
    return getControlByType('select');
  }
  if (typeof fieldTypeDefinition.Edit === 'string') {
    return getControlByType(fieldTypeDefinition.Edit);
  }
  return fieldTypeDefinition.Edit;
}
function getControlByType(type) {
  if (Object.keys(FORM_CONTROLS).includes(type)) {
    return FORM_CONTROLS[type];
  }
  throw 'Control ' + type + ' not found';
}
;
const getValueFromId = id => ({
  item
}) => {
  const path = id.split('.');
  let value = item;
  for (const segment of path) {
    if (value.hasOwnProperty(segment)) {
      value = value[segment];
    } else {
      value = undefined;
    }
  }
  return value;
};
function normalizeFields(fields) {
  return fields.map(field => {
    var _field$sort, _field$isValid, _field$enableHiding, _field$enableSorting;
    const fieldTypeDefinition = getFieldTypeDefinition(field.type);
    const getValue = field.getValue || getValueFromId(field.id);
    const sort = (_field$sort = field.sort) !== null && _field$sort !== void 0 ? _field$sort : function sort(a, b, direction) {
      return fieldTypeDefinition.sort(getValue({
        item: a
      }), getValue({
        item: b
      }), direction);
    };
    const isValid = (_field$isValid = field.isValid) !== null && _field$isValid !== void 0 ? _field$isValid : function isValid(item, context) {
      return fieldTypeDefinition.isValid(getValue({
        item
      }), context);
    };
    const Edit = getControl(field, fieldTypeDefinition);
    const renderFromElements = ({
      item
    }) => {
      const value = getValue({
        item
      });
      return field?.elements?.find(element => element.value === value)?.label || getValue({
        item
      });
    };
    const render = field.render || (field.elements ? renderFromElements : getValue);
    return {
      ...field,
      label: field.label || field.id,
      header: field.header || field.label || field.id,
      getValue,
      render,
      sort,
      isValid,
      Edit,
      enableHiding: (_field$enableHiding = field.enableHiding) !== null && _field$enableHiding !== void 0 ? _field$enableHiding : true,
      enableSorting: (_field$enableSorting = field.enableSorting) !== null && _field$enableSorting !== void 0 ? _field$enableSorting : true
    };
  });
}
;
function isItemValid(item, fields, form) {
  const _fields = normalizeFields(fields.filter(({
    id
  }) => !!form.fields?.includes(id)));
  return _fields.every(field => {
    return field.isValid(item, {
      elements: field.elements
    });
  });
}
;
const DataFormContext = (0,external_wp_element_namespaceObject.createContext)({
  fields: []
});
function DataFormProvider({
  fields,
  children
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(DataFormContext.Provider, {
    value: {
      fields
    },
    children: children
  });
}
 const dataform_context = (DataFormContext);
;
function isCombinedField(field) {
  return field.children !== undefined;
}
;
function Header({
  title
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalVStack, {
    className: "dataforms-layouts-regular__header",
    spacing: 4,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
      alignment: "center",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalHeading, {
        level: 2,
        size: 13,
        children: title
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalSpacer, {})]
    })
  });
}
function FormRegularField({
  data,
  field,
  onChange,
  hideLabelFromVision
}) {
  var _field$labelPosition;
  const {
    fields
  } = (0,external_wp_element_namespaceObject.useContext)(dataform_context);
  const form = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (isCombinedField(field)) {
      return {
        fields: field.children.map(child => {
          if (typeof child === 'string') {
            return {
              id: child
            };
          }
          return child;
        }),
        type: 'regular'
      };
    }
    return {
      type: 'regular',
      fields: []
    };
  }, [field]);
  if (isCombinedField(field)) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [!hideLabelFromVision && field.label && (0,external_ReactJSXRuntime_namespaceObject.jsx)(Header, {
        title: field.label
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(DataFormLayout, {
        data: data,
        form: form,
        onChange: onChange
      })]
    });
  }
  const labelPosition = (_field$labelPosition = field.labelPosition) !== null && _field$labelPosition !== void 0 ? _field$labelPosition : 'top';
  const fieldDefinition = fields.find(fieldDef => fieldDef.id === field.id);
  if (!fieldDefinition) {
    return null;
  }
  if (labelPosition === 'side') {
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
      className: "dataforms-layouts-regular__field",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "dataforms-layouts-regular__field-label",
        children: fieldDefinition.label
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "dataforms-layouts-regular__field-control",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(fieldDefinition.Edit, {
          data: data,
          field: fieldDefinition,
          onChange: onChange,
          hideLabelFromVision: true
        }, fieldDefinition.id)
      })]
    });
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    className: "dataforms-layouts-regular__field",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(fieldDefinition.Edit, {
      data: data,
      field: fieldDefinition,
      onChange: onChange,
      hideLabelFromVision: labelPosition === 'none' ? true : hideLabelFromVision
    })
  });
}
;
const closeSmall = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M12 13.06l3.712 3.713 1.061-1.06L13.061 12l3.712-3.712-1.06-1.06L12 10.938 8.288 7.227l-1.061 1.06L10.939 12l-3.712 3.712 1.06 1.061L12 13.061z"
  })
});
 const close_small = (closeSmall);
;
function DropdownHeader({
  title,
  onClose
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalVStack, {
    className: "dataforms-layouts-panel__dropdown-header",
    spacing: 4,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
      alignment: "center",
      children: [title && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalHeading, {
        level: 2,
        size: 13,
        children: title
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalSpacer, {}), onClose && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        label: (0,external_wp_i18n_namespaceObject.__)('Close'),
        icon: close_small,
        onClick: onClose,
        size: "small"
      })]
    })
  });
}
function PanelDropdown({
  fieldDefinition,
  popoverAnchor,
  labelPosition = 'side',
  data,
  onChange,
  field
}) {
  const fieldLabel = isCombinedField(field) ? field.label : fieldDefinition?.label;
  const form = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (isCombinedField(field)) {
      return {
        type: 'regular',
        fields: field.children.map(child => {
          if (typeof child === 'string') {
            return {
              id: child
            };
          }
          return child;
        })
      };
    }
    return {
      type: 'regular',
      fields: [{
        id: field.id
      }]
    };
  }, [field]);
  const popoverProps = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    anchor: popoverAnchor,
    placement: 'left-start',
    offset: 36,
    shift: true
  }), [popoverAnchor]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
    contentClassName: "dataforms-layouts-panel__field-dropdown",
    popoverProps: popoverProps,
    focusOnMount: true,
    toggleProps: {
      size: 'compact',
      variant: 'tertiary',
      tooltipPosition: 'middle left'
    },
    renderToggle: ({
      isOpen,
      onToggle
    }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
      className: "dataforms-layouts-panel__field-control",
      size: "compact",
      variant: ['none', 'top'].includes(labelPosition) ? 'link' : 'tertiary',
      "aria-expanded": isOpen,
      "aria-label": (0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject._x)('Edit %s', 'field'), fieldLabel),
      onClick: onToggle,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(fieldDefinition.render, {
        item: data
      })
    }),
    renderContent: ({
      onClose
    }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(DropdownHeader, {
        title: fieldLabel,
        onClose: onClose
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(DataFormLayout, {
        data: data,
        form: form,
        onChange: onChange,
        children: (FieldLayout, nestedField) => {
          var _form$fields;
          return (0,external_ReactJSXRuntime_namespaceObject.jsx)(FieldLayout, {
            data: data,
            field: nestedField,
            onChange: onChange,
            hideLabelFromVision: ((_form$fields = form?.fields) !== null && _form$fields !== void 0 ? _form$fields : []).length < 2
          }, nestedField.id);
        }
      })]
    })
  });
}
function FormPanelField({
  data,
  field,
  onChange
}) {
  var _field$labelPosition;
  const {
    fields
  } = (0,external_wp_element_namespaceObject.useContext)(dataform_context);
  const fieldDefinition = fields.find(fieldDef => {
    if (isCombinedField(field)) {
      const children = field.children.filter(child => typeof child === 'string' || !isCombinedField(child));
      const firstChildFieldId = typeof children[0] === 'string' ? children[0] : children[0].id;
      return fieldDef.id === firstChildFieldId;
    }
    return fieldDef.id === field.id;
  });
  const labelPosition = (_field$labelPosition = field.labelPosition) !== null && _field$labelPosition !== void 0 ? _field$labelPosition : 'side';
  const [popoverAnchor, setPopoverAnchor] = (0,external_wp_element_namespaceObject.useState)(null);
  if (!fieldDefinition) {
    return null;
  }
  const fieldLabel = isCombinedField(field) ? field.label : fieldDefinition?.label;
  if (labelPosition === 'top') {
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      className: "dataforms-layouts-panel__field",
      spacing: 0,
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "dataforms-layouts-panel__field-label",
        style: {
          paddingBottom: 0
        },
        children: fieldLabel
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "dataforms-layouts-panel__field-control",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PanelDropdown, {
          field: field,
          popoverAnchor: popoverAnchor,
          fieldDefinition: fieldDefinition,
          data: data,
          onChange: onChange,
          labelPosition: labelPosition
        })
      })]
    });
  }
  if (labelPosition === 'none') {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "dataforms-layouts-panel__field",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PanelDropdown, {
        field: field,
        popoverAnchor: popoverAnchor,
        fieldDefinition: fieldDefinition,
        data: data,
        onChange: onChange,
        labelPosition: labelPosition
      })
    });
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
    ref: setPopoverAnchor,
    className: "dataforms-layouts-panel__field",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "dataforms-layouts-panel__field-label",
      children: fieldLabel
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "dataforms-layouts-panel__field-control",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PanelDropdown, {
        field: field,
        popoverAnchor: popoverAnchor,
        fieldDefinition: fieldDefinition,
        data: data,
        onChange: onChange,
        labelPosition: labelPosition
      })
    })]
  });
}
;
const FORM_FIELD_LAYOUTS = [{
  type: 'regular',
  component: FormRegularField
}, {
  type: 'panel',
  component: FormPanelField
}];
function getFormFieldLayout(type) {
  return FORM_FIELD_LAYOUTS.find(layout => layout.type === type);
}
;
function normalizeFormFields(form) {
  var _form$type, _form$labelPosition, _form$fields;
  let layout = 'regular';
  if (['regular', 'panel'].includes((_form$type = form.type) !== null && _form$type !== void 0 ? _form$type : '')) {
    layout = form.type;
  }
  const labelPosition = (_form$labelPosition = form.labelPosition) !== null && _form$labelPosition !== void 0 ? _form$labelPosition : layout === 'regular' ? 'top' : 'side';
  return ((_form$fields = form.fields) !== null && _form$fields !== void 0 ? _form$fields : []).map(field => {
    var _field$layout, _field$labelPosition;
    if (typeof field === 'string') {
      return {
        id: field,
        layout,
        labelPosition
      };
    }
    const fieldLayout = (_field$layout = field.layout) !== null && _field$layout !== void 0 ? _field$layout : layout;
    const fieldLabelPosition = (_field$labelPosition = field.labelPosition) !== null && _field$labelPosition !== void 0 ? _field$labelPosition : fieldLayout === 'regular' ? 'top' : 'side';
    return {
      ...field,
      layout: fieldLayout,
      labelPosition: fieldLabelPosition
    };
  });
}
;
function DataFormLayout({
  data,
  form,
  onChange,
  children
}) {
  const {
    fields: fieldDefinitions
  } = (0,external_wp_element_namespaceObject.useContext)(dataform_context);
  function getFieldDefinition(field) {
    const fieldId = typeof field === 'string' ? field : field.id;
    return fieldDefinitions.find(fieldDefinition => fieldDefinition.id === fieldId);
  }
  const normalizedFormFields = (0,external_wp_element_namespaceObject.useMemo)(() => normalizeFormFields(form), [form]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalVStack, {
    spacing: 2,
    children: normalizedFormFields.map(formField => {
      const FieldLayout = getFormFieldLayout(formField.layout)?.component;
      if (!FieldLayout) {
        return null;
      }
      const fieldDefinition = !isCombinedField(formField) ? getFieldDefinition(formField) : undefined;
      if (fieldDefinition && fieldDefinition.isVisible && !fieldDefinition.isVisible(data)) {
        return null;
      }
      if (children) {
        return children(FieldLayout, formField);
      }
      return (0,external_ReactJSXRuntime_namespaceObject.jsx)(FieldLayout, {
        data: data,
        field: formField,
        onChange: onChange
      }, formField.id);
    })
  });
}
;
function DataForm({
  data,
  form,
  fields,
  onChange
}) {
  const normalizedFields = (0,external_wp_element_namespaceObject.useMemo)(() => normalizeFields(fields), [fields]);
  if (!form.fields) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(DataFormProvider, {
    fields: normalizedFields,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(DataFormLayout, {
      data: data,
      form: form,
      onChange: onChange
    })
  });
}
;
const orderField = {
  id: 'menu_order',
  type: 'integer',
  label: (0,external_wp_i18n_namespaceObject.__)('Order'),
  description: (0,external_wp_i18n_namespaceObject.__)('Determines the order of pages.')
};
 const order = (orderField);
;
const reorder_page_fields = [order];
const formOrderAction = {
  fields: ['menu_order']
};
function ReorderModal({
  items,
  closeModal,
  onActionPerformed
}) {
  const [item, setItem] = (0,external_wp_element_namespaceObject.useState)(items[0]);
  const orderInput = item.menu_order;
  const {
    editEntityRecord,
    saveEditedEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const {
    createSuccessNotice,
    createErrorNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  async function onOrder(event) {
    event.preventDefault();
    if (!isItemValid(item, reorder_page_fields, formOrderAction)) {
      return;
    }
    try {
      await editEntityRecord('postType', item.type, item.id, {
        menu_order: orderInput
      });
      closeModal?.();
      await saveEditedEntityRecord('postType', item.type, item.id, {
        throwOnError: true
      });
      createSuccessNotice((0,external_wp_i18n_namespaceObject.__)('Order updated.'), {
        type: 'snackbar'
      });
      onActionPerformed?.(items);
    } catch (error) {
      const typedError = error;
      const errorMessage = typedError.message && typedError.code !== 'unknown_error' ? typedError.message : (0,external_wp_i18n_namespaceObject.__)('An error occurred while updating the order');
      createErrorNotice(errorMessage, {
        type: 'snackbar'
      });
    }
  }
  const isSaveDisabled = !isItemValid(item, reorder_page_fields, formOrderAction);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
    onSubmit: onOrder,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      spacing: "5",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        children: (0,external_wp_i18n_namespaceObject.__)('Determines the order of pages. Pages with the same order value are sorted alphabetically. Negative order values are supported.')
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(DataForm, {
        data: item,
        fields: reorder_page_fields,
        form: formOrderAction,
        onChange: changes => setItem({
          ...item,
          ...changes
        })
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
        justify: "right",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "tertiary",
          onClick: () => {
            closeModal?.();
          },
          children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "primary",
          type: "submit",
          accessibleWhenDisabled: true,
          disabled: isSaveDisabled,
          children: (0,external_wp_i18n_namespaceObject.__)('Save')
        })]
      })]
    })
  });
}
const reorderPage = {
  id: 'order-pages',
  label: (0,external_wp_i18n_namespaceObject.__)('Order'),
  isEligible({
    status
  }) {
    return status !== 'trash';
  },
  RenderModal: ReorderModal
};
 const reorder_page = (reorderPage);
;
"stream"in Blob.prototype||Object.defineProperty(Blob.prototype,"stream",{value(){return new Response(this).body}}),"setBigUint64"in DataView.prototype||Object.defineProperty(DataView.prototype,"setBigUint64",{value(e,n,t){const i=Number(0xffffffffn&n),r=Number(n>>32n);this.setUint32(e+(t?0:4),i,t),this.setUint32(e+(t?4:0),r,t)}});var e=e=>new DataView(new ArrayBuffer(e)),n=e=>new Uint8Array(e.buffer||e),t=e=>(new TextEncoder).encode(String(e)),i=e=>Math.min(4294967295,Number(e)),r=e=>Math.min(65535,Number(e));function o(e,i,r){void 0===i||i instanceof Date||(i=new Date(i));const o=void 0!==e;if(r||(r=o?436:509),e instanceof File)return{isFile:o,t:i||new Date(e.lastModified),bytes:e.stream(),mode:r};if(e instanceof Response)return{isFile:o,t:i||new Date(e.headers.get("Last-Modified")||Date.now()),bytes:e.body,mode:r};if(void 0===i)i=new Date;else if(isNaN(i))throw new Error("Invalid modification date.");if(!o)return{isFile:o,t:i,mode:r};if("string"==typeof e)return{isFile:o,t:i,bytes:t(e),mode:r};if(e instanceof Blob)return{isFile:o,t:i,bytes:e.stream(),mode:r};if(e instanceof Uint8Array||e instanceof ReadableStream)return{isFile:o,t:i,bytes:e,mode:r};if(e instanceof ArrayBuffer||ArrayBuffer.isView(e))return{isFile:o,t:i,bytes:n(e),mode:r};if(Symbol.asyncIterator in e)return{isFile:o,t:i,bytes:f(e[Symbol.asyncIterator]()),mode:r};throw new TypeError("Unsupported input format.")}function f(e,n=e){return new ReadableStream({async pull(n){let t=0;for(;n.desiredSize>t;){const i=await e.next();if(!i.value){n.close();break}{const e=a(i.value);n.enqueue(e),t+=e.byteLength}}},cancel(e){n.throw?.(e)}})}function a(e){return"string"==typeof e?t(e):e instanceof Uint8Array?e:n(e)}function s(e,i,r){let[o,f]=function(e){return e?e instanceof Uint8Array?[e,1]:ArrayBuffer.isView(e)||e instanceof ArrayBuffer?[n(e),1]:[t(e),0]:[void 0,0]}(i);if(e instanceof File)return{i:d(o||t(e.name)),o:BigInt(e.size),u:f};if(e instanceof Response){const n=e.headers.get("content-disposition"),i=n&&n.match(/;\s*filename\*?\s*=\s*(?:UTF-\d+''|)["']?([^;"'\r\n]*)["']?(?:;|$)/i),a=i&&i[1]||e.url&&new URL(e.url).pathname.split("/").findLast(Boolean),s=a&&decodeURIComponent(a),u=r||+e.headers.get("content-length");return{i:d(o||t(s)),o:BigInt(u),u:f}}return o=d(o,void 0!==e||void 0!==r),"string"==typeof e?{i:o,o:BigInt(t(e).length),u:f}:e instanceof Blob?{i:o,o:BigInt(e.size),u:f}:e instanceof ArrayBuffer||ArrayBuffer.isView(e)?{i:o,o:BigInt(e.byteLength),u:f}:{i:o,o:u(e,r),u:f}}function u(e,n){return n>-1?BigInt(n):e?void 0:0n}function d(e,n=1){if(!e||e.every((c=>47===c)))throw new Error("The file must have a name.");if(n)for(;47===e[e.length-1];)e=e.subarray(0,-1);else 47!==e[e.length-1]&&(e=new Uint8Array([...e,47]));return e}var l=new Uint32Array(256);for(let e=0;e<256;++e){let n=e;for(let e=0;e<8;++e)n=n>>>1^(1&n&&3988292384);l[e]=n}function y(e,n=0){n=~n;for(var t=0,i=e.length;t<i;t++)n=n>>>8^l[255&n^e[t]];return~n>>>0}function w(e,n,t=0){const i=e.getSeconds()>>1|e.getMinutes()<<5|e.getHours()<<11,r=e.getDate()|e.getMonth()+1<<5|e.getFullYear()-1980<<9;n.setUint16(t,i,1),n.setUint16(t+2,r,1)}function B({i:e,u:n},t){return 8*(!n||(t??function(e){try{b.decode(e)}catch{return 0}return 1}(e)))}var b=new TextDecoder("utf8",{fatal:1});function p(t,i=0){const r=e(30);return r.setUint32(0,1347093252),r.setUint32(4,754976768|i),w(t.t,r,10),r.setUint16(26,t.i.length,1),n(r)}async function*g(e){let{bytes:n}=e;if("then"in n&&(n=await n),n instanceof Uint8Array)yield n,e.l=y(n,0),e.o=BigInt(n.length);else{e.o=0n;const t=n.getReader();for(;;){const{value:n,done:i}=await t.read();if(i)break;e.l=y(n,e.l),e.o+=BigInt(n.length),yield n}}}function I(t,r){const o=e(16+(r?8:0));return o.setUint32(0,1347094280),o.setUint32(4,t.isFile?t.l:0,1),r?(o.setBigUint64(8,t.o,1),o.setBigUint64(16,t.o,1)):(o.setUint32(8,i(t.o),1),o.setUint32(12,i(t.o),1)),n(o)}function v(t,r,o=0,f=0){const a=e(46);return a.setUint32(0,1347092738),a.setUint32(4,755182848),a.setUint16(8,2048|o),w(t.t,a,12),a.setUint32(16,t.isFile?t.l:0,1),a.setUint32(20,i(t.o),1),a.setUint32(24,i(t.o),1),a.setUint16(28,t.i.length,1),a.setUint16(30,f,1),a.setUint16(40,t.mode|(t.isFile?32768:16384),1),a.setUint32(42,i(r),1),n(a)}function h(t,i,r){const o=e(r);return o.setUint16(0,1,1),o.setUint16(2,r-4,1),16&r&&(o.setBigUint64(4,t.o,1),o.setBigUint64(12,t.o,1)),o.setBigUint64(r-8,i,1),n(o)}function D(e){return e instanceof File||e instanceof Response?[[e],[e]]:[[e.input,e.name,e.size],[e.input,e.lastModified,e.mode]]}var S=e=>function(e){let n=BigInt(22),t=0n,i=0;for(const r of e){if(!r.i)throw new Error("Every file must have a non-empty name.");if(void 0===r.o)throw new Error(`Missing size for file "${(new TextDecoder).decode(r.i)}".`);const e=r.o>=0xffffffffn,o=t>=0xffffffffn;t+=BigInt(46+r.i.length+(e&&8))+r.o,n+=BigInt(r.i.length+46+(12*o|28*e)),i||(i=e)}return(i||t>=0xffffffffn)&&(n+=BigInt(76)),n+t}(function*(e){for(const n of e)yield s(...D(n)[0])}(e));function A(e,n={}){const t={"Content-Type":"application/zip","Content-Disposition":"attachment"};return("bigint"==typeof n.length||Number.isInteger(n.length))&&n.length>0&&(t["Content-Length"]=String(n.length)),n.metadata&&(t["Content-Length"]=String(S(n.metadata))),new Response(N(e,n),{headers:t})}function N(t,a={}){const u=function(e){const n=e[Symbol.iterator in e?Symbol.iterator:Symbol.asyncIterator]();return{async next(){const e=await n.next();if(e.done)return e;const[t,i]=D(e.value);return{done:0,value:Object.assign(o(...i),s(...t))}},throw:n.throw?.bind(n),[Symbol.asyncIterator](){return this}}}(t);return f(async function*(t,o){const f=[];let a=0n,s=0n,u=0;for await(const e of t){const n=B(e,o.buffersAreUTF8);yield p(e,n),yield new Uint8Array(e.i),e.isFile&&(yield*g(e));const t=e.o>=0xffffffffn,i=12*(a>=0xffffffffn)|28*t;yield I(e,t),f.push(v(e,a,n,i)),f.push(e.i),i&&f.push(h(e,a,i)),t&&(a+=8n),s++,a+=BigInt(46+e.i.length)+e.o,u||(u=t)}let d=0n;for(const e of f)yield e,d+=BigInt(e.length);if(u||a>=0xffffffffn){const t=e(76);t.setUint32(0,1347094022),t.setBigUint64(4,BigInt(44),1),t.setUint32(12,755182848),t.setBigUint64(24,s,1),t.setBigUint64(32,s,1),t.setBigUint64(40,d,1),t.setBigUint64(48,a,1),t.setUint32(56,1347094023),t.setBigUint64(64,a+d,1),t.setUint32(72,1,1),yield n(t)}const l=e(22);l.setUint32(0,1347093766),l.setUint16(8,r(s),1),l.setUint16(10,r(s),1),l.setUint32(12,i(d),1),l.setUint32(16,i(a),1),yield n(l)}(u,a),u)}
;
const external_wp_blob_namespaceObject = window["wp"]["blob"];
;
const download = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z"
  })
});
 const library_download = (download);
;
function getJsonFromItem(item) {
  return JSON.stringify({
    __file: item.type,
    title: getItemTitle(item),
    content: typeof item.content === 'string' ? item.content : item.content?.raw,
    syncStatus: item.wp_pattern_sync_status
  }, null, 2);
}
const exportPattern = {
  id: 'export-pattern',
  label: (0,external_wp_i18n_namespaceObject.__)('Export as JSON'),
  icon: library_download,
  supportsBulk: true,
  isEligible: item => item.type === 'wp_block',
  callback: async items => {
    if (items.length === 1) {
      return (0,external_wp_blob_namespaceObject.downloadBlob)(`${paramCase(getItemTitle(items[0]) || items[0].slug)}.json`, getJsonFromItem(items[0]), 'application/json');
    }
    const nameCount = {};
    const filesToZip = items.map(item => {
      const name = paramCase(getItemTitle(item) || item.slug);
      nameCount[name] = (nameCount[name] || 0) + 1;
      return {
        name: `${name + (nameCount[name] > 1 ? '-' + (nameCount[name] - 1) : '')}.json`,
        lastModified: new Date(),
        input: getJsonFromItem(item)
      };
    });
    return (0,external_wp_blob_namespaceObject.downloadBlob)((0,external_wp_i18n_namespaceObject.__)('patterns-export') + '.zip', await A(filesToZip).blob(), 'application/zip');
  }
};
 const export_pattern = (exportPattern);
;
const backup = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M5.5 12h1.75l-2.5 3-2.5-3H4a8 8 0 113.134 6.35l.907-1.194A6.5 6.5 0 105.5 12zm9.53 1.97l-2.28-2.28V8.5a.75.75 0 00-1.5 0V12a.747.747 0 00.218.529l1.282-.84-1.28.842 2.5 2.5a.75.75 0 101.06-1.061z"
  })
});
 const library_backup = (backup);
;
const restorePost = {
  id: 'restore',
  label: (0,external_wp_i18n_namespaceObject.__)('Restore'),
  isPrimary: true,
  icon: library_backup,
  supportsBulk: true,
  isEligible(item) {
    return !isTemplateOrTemplatePart(item) && item.type !== 'wp_block' && item.status === 'trash' && item.permissions?.update;
  },
  async callback(posts, {
    registry,
    onActionPerformed
  }) {
    const {
      createSuccessNotice,
      createErrorNotice
    } = registry.dispatch(external_wp_notices_namespaceObject.store);
    const {
      editEntityRecord,
      saveEditedEntityRecord
    } = registry.dispatch(external_wp_coreData_namespaceObject.store);
    await Promise.allSettled(posts.map(post => {
      return editEntityRecord('postType', post.type, post.id, {
        status: 'draft'
      });
    }));
    const promiseResult = await Promise.allSettled(posts.map(post => {
      return saveEditedEntityRecord('postType', post.type, post.id, {
        throwOnError: true
      });
    }));
    if (promiseResult.every(({
      status
    }) => status === 'fulfilled')) {
      let successMessage;
      if (posts.length === 1) {
        successMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject.__)('"%s" has been restored.'), getItemTitle(posts[0]));
      } else if (posts[0].type === 'page') {
        successMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject.__)('%d pages have been restored.'), posts.length);
      } else {
        successMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject.__)('%d posts have been restored.'), posts.length);
      }
      createSuccessNotice(successMessage, {
        type: 'snackbar',
        id: 'restore-post-action'
      });
      if (onActionPerformed) {
        onActionPerformed(posts);
      }
    } else {
      let errorMessage;
      if (promiseResult.length === 1) {
        const typedError = promiseResult[0];
        if (typedError.reason?.message) {
          errorMessage = typedError.reason.message;
        } else {
          errorMessage = (0,external_wp_i18n_namespaceObject.__)('An error occurred while restoring the post.');
        }
      } else {
        const errorMessages = new Set();
        const failedPromises = promiseResult.filter(({
          status
        }) => status === 'rejected');
        for (const failedPromise of failedPromises) {
          const typedError = failedPromise;
          if (typedError.reason?.message) {
            errorMessages.add(typedError.reason.message);
          }
        }
        if (errorMessages.size === 0) {
          errorMessage = (0,external_wp_i18n_namespaceObject.__)('An error occurred while restoring the posts.');
        } else if (errorMessages.size === 1) {
          errorMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
          (0,external_wp_i18n_namespaceObject.__)('An error occurred while restoring the posts: %s'), [...errorMessages][0]);
        } else {
          errorMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
          (0,external_wp_i18n_namespaceObject.__)('Some errors occurred while restoring the posts: %s'), [...errorMessages].join(','));
        }
      }
      createErrorNotice(errorMessage, {
        type: 'snackbar'
      });
    }
  }
};
 const restore_post = (restorePost);
;
const reset_post_isTemplateRevertable = templateOrTemplatePart => {
  if (!templateOrTemplatePart) {
    return false;
  }
  return templateOrTemplatePart.source === 'custom' && (Boolean(templateOrTemplatePart?.plugin) || templateOrTemplatePart?.has_theme_file);
};
const revertTemplate = async (template, {
  allowUndo = true
} = {}) => {
  const noticeId = 'edit-site-template-reverted';
  (0,external_wp_data_namespaceObject.dispatch)(external_wp_notices_namespaceObject.store).removeNotice(noticeId);
  if (!reset_post_isTemplateRevertable(template)) {
    (0,external_wp_data_namespaceObject.dispatch)(external_wp_notices_namespaceObject.store).createErrorNotice((0,external_wp_i18n_namespaceObject.__)('This template is not revertable.'), {
      type: 'snackbar'
    });
    return;
  }
  try {
    const templateEntityConfig = (0,external_wp_data_namespaceObject.select)(external_wp_coreData_namespaceObject.store).getEntityConfig('postType', template.type);
    if (!templateEntityConfig) {
      (0,external_wp_data_namespaceObject.dispatch)(external_wp_notices_namespaceObject.store).createErrorNotice((0,external_wp_i18n_namespaceObject.__)('The editor has encountered an unexpected error. Please reload.'), {
        type: 'snackbar'
      });
      return;
    }
    const fileTemplatePath = (0,external_wp_url_namespaceObject.addQueryArgs)(`${templateEntityConfig.baseURL}/${template.id}`, {
      context: 'edit',
      source: template.origin
    });
    const fileTemplate = await external_wp_apiFetch_default()({
      path: fileTemplatePath
    });
    if (!fileTemplate) {
      (0,external_wp_data_namespaceObject.dispatch)(external_wp_notices_namespaceObject.store).createErrorNotice((0,external_wp_i18n_namespaceObject.__)('The editor has encountered an unexpected error. Please reload.'), {
        type: 'snackbar'
      });
      return;
    }
    const serializeBlocks = ({
      blocks: blocksForSerialization = []
    }) => (0,external_wp_blocks_namespaceObject.__unstableSerializeAndClean)(blocksForSerialization);
    const edited = (0,external_wp_data_namespaceObject.select)(external_wp_coreData_namespaceObject.store).getEditedEntityRecord('postType', template.type, template.id);
    (0,external_wp_data_namespaceObject.dispatch)(external_wp_coreData_namespaceObject.store).editEntityRecord('postType', template.type, template.id, {
      content: serializeBlocks,
      blocks: edited.blocks,
      source: 'custom' 
    }, {
      undoIgnore: true 
    });
    const blocks = (0,external_wp_blocks_namespaceObject.parse)(fileTemplate?.content?.raw);
    (0,external_wp_data_namespaceObject.dispatch)(external_wp_coreData_namespaceObject.store).editEntityRecord('postType', template.type, fileTemplate.id, {
      content: serializeBlocks,
      blocks,
      source: 'theme'
    });
    if (allowUndo) {
      const undoRevert = () => {
        (0,external_wp_data_namespaceObject.dispatch)(external_wp_coreData_namespaceObject.store).editEntityRecord('postType', template.type, edited.id, {
          content: serializeBlocks,
          blocks: edited.blocks,
          source: 'custom'
        });
      };
      (0,external_wp_data_namespaceObject.dispatch)(external_wp_notices_namespaceObject.store).createSuccessNotice((0,external_wp_i18n_namespaceObject.__)('Template reset.'), {
        type: 'snackbar',
        id: noticeId,
        actions: [{
          label: (0,external_wp_i18n_namespaceObject.__)('Undo'),
          onClick: undoRevert
        }]
      });
    }
  } catch (error) {
    const errorMessage = error.message && error.code !== 'unknown_error' ? error.message : (0,external_wp_i18n_namespaceObject.__)('Template revert failed. Please reload.');
    (0,external_wp_data_namespaceObject.dispatch)(external_wp_notices_namespaceObject.store).createErrorNotice(errorMessage, {
      type: 'snackbar'
    });
  }
};
const resetPostAction = {
  id: 'reset-post',
  label: (0,external_wp_i18n_namespaceObject.__)('Reset'),
  isEligible: item => {
    return isTemplateOrTemplatePart(item) && item?.source === 'custom' && (Boolean(item.type === 'wp_template' && item?.plugin) || item?.has_theme_file);
  },
  icon: library_backup,
  supportsBulk: true,
  hideModalHeader: true,
  RenderModal: ({
    items,
    closeModal,
    onActionPerformed
  }) => {
    const [isBusy, setIsBusy] = (0,external_wp_element_namespaceObject.useState)(false);
    const {
      saveEditedEntityRecord
    } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
    const {
      createSuccessNotice,
      createErrorNotice
    } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
    const onConfirm = async () => {
      try {
        for (const template of items) {
          await revertTemplate(template, {
            allowUndo: false
          });
          await saveEditedEntityRecord('postType', template.type, template.id);
        }
        createSuccessNotice(items.length > 1 ? (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject.__)('%s items reset.'), items.length) : (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject.__)('"%s" reset.'), getItemTitle(items[0])), {
          type: 'snackbar',
          id: 'revert-template-action'
        });
      } catch (error) {
        let fallbackErrorMessage;
        if (items[0].type === 'wp_template') {
          fallbackErrorMessage = items.length === 1 ? (0,external_wp_i18n_namespaceObject.__)('An error occurred while reverting the template.') : (0,external_wp_i18n_namespaceObject.__)('An error occurred while reverting the templates.');
        } else {
          fallbackErrorMessage = items.length === 1 ? (0,external_wp_i18n_namespaceObject.__)('An error occurred while reverting the template part.') : (0,external_wp_i18n_namespaceObject.__)('An error occurred while reverting the template parts.');
        }
        const typedError = error;
        const errorMessage = typedError.message && typedError.code !== 'unknown_error' ? typedError.message : fallbackErrorMessage;
        createErrorNotice(errorMessage, {
          type: 'snackbar'
        });
      }
    };
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      spacing: "5",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
        children: (0,external_wp_i18n_namespaceObject.__)('Reset to default and clear all customizations?')
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
        justify: "right",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "tertiary",
          onClick: closeModal,
          disabled: isBusy,
          accessibleWhenDisabled: true,
          children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "primary",
          onClick: async () => {
            setIsBusy(true);
            await onConfirm();
            onActionPerformed?.(items);
            setIsBusy(false);
            closeModal?.();
          },
          isBusy: isBusy,
          disabled: isBusy,
          accessibleWhenDisabled: true,
          children: (0,external_wp_i18n_namespaceObject.__)('Reset')
        })]
      })]
    });
  }
};
 const reset_post = (resetPostAction);
;
const trash = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 5.5A2.25 2.25 0 0 0 9.878 7h4.244A2.251 2.251 0 0 0 12 5.5ZM12 4a3.751 3.751 0 0 0-3.675 3H5v1.5h1.27l.818 8.997a2.75 2.75 0 0 0 2.739 2.501h4.347a2.75 2.75 0 0 0 2.738-2.5L17.73 8.5H19V7h-3.325A3.751 3.751 0 0 0 12 4Zm4.224 4.5H7.776l.806 8.861a1.25 1.25 0 0 0 1.245 1.137h4.347a1.25 1.25 0 0 0 1.245-1.137l.805-8.861Z"
  })
});
 const library_trash = (trash);
;
function getErrorMessagesFromPromises(allSettledResults) {
  const errorMessages = new Set();
  if (allSettledResults.length === 1) {
    const typedError = allSettledResults[0];
    if (typedError.reason?.message) {
      errorMessages.add(typedError.reason.message);
    }
  } else {
    const failedPromises = allSettledResults.filter(({
      status
    }) => status === 'rejected');
    for (const failedPromise of failedPromises) {
      const typedError = failedPromise;
      if (typedError.reason?.message) {
        errorMessages.add(typedError.reason.message);
      }
    }
  }
  return errorMessages;
}
const deletePostWithNotices = async (posts, notice, callbacks) => {
  const {
    createSuccessNotice,
    createErrorNotice
  } = (0,external_wp_data_namespaceObject.dispatch)(external_wp_notices_namespaceObject.store);
  const {
    deleteEntityRecord
  } = (0,external_wp_data_namespaceObject.dispatch)(external_wp_coreData_namespaceObject.store);
  const allSettledResults = await Promise.allSettled(posts.map(post => {
    return deleteEntityRecord('postType', post.type, post.id, {
      force: true
    }, {
      throwOnError: true
    });
  }));
  if (allSettledResults.every(({
    status
  }) => status === 'fulfilled')) {
    var _notice$success$type;
    let successMessage;
    if (allSettledResults.length === 1) {
      successMessage = notice.success.messages.getMessage(posts[0]);
    } else {
      successMessage = notice.success.messages.getBatchMessage(posts);
    }
    createSuccessNotice(successMessage, {
      type: (_notice$success$type = notice.success.type) !== null && _notice$success$type !== void 0 ? _notice$success$type : 'snackbar',
      id: notice.success.id
    });
    callbacks.onActionPerformed?.(posts);
  } else {
    var _notice$error$type;
    const errorMessages = getErrorMessagesFromPromises(allSettledResults);
    let errorMessage = '';
    if (allSettledResults.length === 1) {
      errorMessage = notice.error.messages.getMessage(errorMessages);
    } else {
      errorMessage = notice.error.messages.getBatchMessage(errorMessages);
    }
    createErrorNotice(errorMessage, {
      type: (_notice$error$type = notice.error.type) !== null && _notice$error$type !== void 0 ? _notice$error$type : 'snackbar',
      id: notice.error.id
    });
    callbacks.onActionError?.();
  }
};
const editPostWithNotices = async (postsWithUpdates, notice, callbacks) => {
  const {
    createSuccessNotice,
    createErrorNotice
  } = dispatch(noticesStore);
  const {
    editEntityRecord,
    saveEditedEntityRecord
  } = dispatch(coreStore);
  await Promise.allSettled(postsWithUpdates.map(post => {
    return editEntityRecord('postType', post.originalPost.type, post.originalPost.id, {
      ...post.changes
    });
  }));
  const allSettledResults = await Promise.allSettled(postsWithUpdates.map(post => {
    return saveEditedEntityRecord('postType', post.originalPost.type, post.originalPost.id, {
      throwOnError: true
    });
  }));
  if (allSettledResults.every(({
    status
  }) => status === 'fulfilled')) {
    var _notice$success$type2;
    let successMessage;
    if (allSettledResults.length === 1) {
      successMessage = notice.success.messages.getMessage(postsWithUpdates[0].originalPost);
    } else {
      successMessage = notice.success.messages.getBatchMessage(postsWithUpdates.map(post => post.originalPost));
    }
    createSuccessNotice(successMessage, {
      type: (_notice$success$type2 = notice.success.type) !== null && _notice$success$type2 !== void 0 ? _notice$success$type2 : 'snackbar',
      id: notice.success.id
    });
    callbacks.onActionPerformed?.(postsWithUpdates.map(post => post.originalPost));
  } else {
    var _notice$error$type2;
    const errorMessages = getErrorMessagesFromPromises(allSettledResults);
    let errorMessage = '';
    if (allSettledResults.length === 1) {
      errorMessage = notice.error.messages.getMessage(errorMessages);
    } else {
      errorMessage = notice.error.messages.getBatchMessage(errorMessages);
    }
    createErrorNotice(errorMessage, {
      type: (_notice$error$type2 = notice.error.type) !== null && _notice$error$type2 !== void 0 ? _notice$error$type2 : 'snackbar',
      id: notice.error.id
    });
    callbacks.onActionError?.();
  }
};
;
const {
  PATTERN_TYPES: delete_post_PATTERN_TYPES
} = lock_unlock_unlock(external_wp_patterns_namespaceObject.privateApis);
const deletePostAction = {
  id: 'delete-post',
  label: (0,external_wp_i18n_namespaceObject.__)('Delete'),
  isPrimary: true,
  icon: library_trash,
  isEligible(post) {
    if (isTemplateOrTemplatePart(post)) {
      return isTemplateRemovable(post);
    }
    return post.type === delete_post_PATTERN_TYPES.user;
  },
  supportsBulk: true,
  hideModalHeader: true,
  RenderModal: ({
    items,
    closeModal,
    onActionPerformed
  }) => {
    const [isBusy, setIsBusy] = (0,external_wp_element_namespaceObject.useState)(false);
    const isResetting = items.every(item => isTemplateOrTemplatePart(item) && item?.has_theme_file);
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      spacing: "5",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
        children: items.length > 1 ? (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject._n)('Delete %d item?', 'Delete %d items?', items.length), items.length) : (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject._x)('Delete "%s"?', 'template part'), getItemTitle(items[0]))
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
        justify: "right",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          variant: "tertiary",
          onClick: closeModal,
          disabled: isBusy,
          accessibleWhenDisabled: true,
          __next40pxDefaultSize: true,
          children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          variant: "primary",
          onClick: async () => {
            setIsBusy(true);
            const notice = {
              success: {
                messages: {
                  getMessage: item => {
                    return isResetting ? (0,external_wp_i18n_namespaceObject.sprintf)(
                    (0,external_wp_i18n_namespaceObject.__)('"%s" reset.'), (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(getItemTitle(item))) : (0,external_wp_i18n_namespaceObject.sprintf)(
                    (0,external_wp_i18n_namespaceObject._x)('"%s" deleted.', 'template part'), (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(getItemTitle(item)));
                  },
                  getBatchMessage: () => {
                    return isResetting ? (0,external_wp_i18n_namespaceObject.__)('Items reset.') : (0,external_wp_i18n_namespaceObject.__)('Items deleted.');
                  }
                }
              },
              error: {
                messages: {
                  getMessage: error => {
                    if (error.size === 1) {
                      return [...error][0];
                    }
                    return isResetting ? (0,external_wp_i18n_namespaceObject.__)('An error occurred while reverting the item.') : (0,external_wp_i18n_namespaceObject.__)('An error occurred while deleting the item.');
                  },
                  getBatchMessage: errors => {
                    if (errors.size === 0) {
                      return isResetting ? (0,external_wp_i18n_namespaceObject.__)('An error occurred while reverting the items.') : (0,external_wp_i18n_namespaceObject.__)('An error occurred while deleting the items.');
                    }
                    if (errors.size === 1) {
                      return isResetting ? (0,external_wp_i18n_namespaceObject.sprintf)(
                      (0,external_wp_i18n_namespaceObject.__)('An error occurred while reverting the items: %s'), [...errors][0]) : (0,external_wp_i18n_namespaceObject.sprintf)(
                      (0,external_wp_i18n_namespaceObject.__)('An error occurred while deleting the items: %s'), [...errors][0]);
                    }
                    return isResetting ? (0,external_wp_i18n_namespaceObject.sprintf)(
                    (0,external_wp_i18n_namespaceObject.__)('Some errors occurred while reverting the items: %s'), [...errors].join(',')) : (0,external_wp_i18n_namespaceObject.sprintf)(
                    (0,external_wp_i18n_namespaceObject.__)('Some errors occurred while deleting the items: %s'), [...errors].join(','));
                  }
                }
              }
            };
            await deletePostWithNotices(items, notice, {
              onActionPerformed
            });
            setIsBusy(false);
            closeModal?.();
          },
          isBusy: isBusy,
          disabled: isBusy,
          accessibleWhenDisabled: true,
          __next40pxDefaultSize: true,
          children: (0,external_wp_i18n_namespaceObject.__)('Delete')
        })]
      })]
    });
  }
};
 const delete_post = (deletePostAction);
;
const trash_post_trashPost = {
  id: 'move-to-trash',
  label: (0,external_wp_i18n_namespaceObject.__)('Move to trash'),
  isPrimary: true,
  icon: library_trash,
  isEligible(item) {
    if (isTemplateOrTemplatePart(item) || item.type === 'wp_block') {
      return false;
    }
    return !!item.status && !['auto-draft', 'trash'].includes(item.status) && item.permissions?.delete;
  },
  supportsBulk: true,
  hideModalHeader: true,
  RenderModal: ({
    items,
    closeModal,
    onActionPerformed
  }) => {
    const [isBusy, setIsBusy] = (0,external_wp_element_namespaceObject.useState)(false);
    const {
      createSuccessNotice,
      createErrorNotice
    } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
    const {
      deleteEntityRecord
    } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      spacing: "5",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
        children: items.length === 1 ? (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject.__)('Are you sure you want to move "%s" to the trash?'), getItemTitle(items[0])) : (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject._n)('Are you sure you want to move %d item to the trash ?', 'Are you sure you want to move %d items to the trash ?', items.length), items.length)
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
        justify: "right",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "tertiary",
          onClick: closeModal,
          disabled: isBusy,
          accessibleWhenDisabled: true,
          children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "primary",
          onClick: async () => {
            setIsBusy(true);
            const promiseResult = await Promise.allSettled(items.map(item => deleteEntityRecord('postType', item.type, item.id.toString(), {}, {
              throwOnError: true
            })));
            if (promiseResult.every(({
              status
            }) => status === 'fulfilled')) {
              let successMessage;
              if (promiseResult.length === 1) {
                successMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
                (0,external_wp_i18n_namespaceObject.__)('"%s" moved to the trash.'), getItemTitle(items[0]));
              } else {
                successMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
                (0,external_wp_i18n_namespaceObject._n)('%s item moved to the trash.', '%s items moved to the trash.', items.length), items.length);
              }
              createSuccessNotice(successMessage, {
                type: 'snackbar',
                id: 'move-to-trash-action'
              });
            } else {
              let errorMessage;
              if (promiseResult.length === 1) {
                const typedError = promiseResult[0];
                if (typedError.reason?.message) {
                  errorMessage = typedError.reason.message;
                } else {
                  errorMessage = (0,external_wp_i18n_namespaceObject.__)('An error occurred while moving the item to the trash.');
                }
              } else {
                const errorMessages = new Set();
                const failedPromises = promiseResult.filter(({
                  status
                }) => status === 'rejected');
                for (const failedPromise of failedPromises) {
                  const typedError = failedPromise;
                  if (typedError.reason?.message) {
                    errorMessages.add(typedError.reason.message);
                  }
                }
                if (errorMessages.size === 0) {
                  errorMessage = (0,external_wp_i18n_namespaceObject.__)('An error occurred while moving the items to the trash.');
                } else if (errorMessages.size === 1) {
                  errorMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
                  (0,external_wp_i18n_namespaceObject.__)('An error occurred while moving the item to the trash: %s'), [...errorMessages][0]);
                } else {
                  errorMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
                  (0,external_wp_i18n_namespaceObject.__)('Some errors occurred while moving the items to the trash: %s'), [...errorMessages].join(','));
                }
              }
              createErrorNotice(errorMessage, {
                type: 'snackbar'
              });
            }
            if (onActionPerformed) {
              onActionPerformed(items);
            }
            setIsBusy(false);
            closeModal?.();
          },
          isBusy: isBusy,
          disabled: isBusy,
          accessibleWhenDisabled: true,
          children: (0,external_wp_i18n_namespaceObject._x)('Trash', 'verb')
        })]
      })]
    });
  }
};
 const trash_post = (trash_post_trashPost);
;
const permanentlyDeletePost = {
  id: 'permanently-delete',
  label: (0,external_wp_i18n_namespaceObject.__)('Permanently delete'),
  supportsBulk: true,
  icon: library_trash,
  isEligible(item) {
    if (isTemplateOrTemplatePart(item) || item.type === 'wp_block') {
      return false;
    }
    const {
      status,
      permissions
    } = item;
    return status === 'trash' && permissions?.delete;
  },
  hideModalHeader: true,
  RenderModal: ({
    items,
    closeModal,
    onActionPerformed
  }) => {
    const [isBusy, setIsBusy] = (0,external_wp_element_namespaceObject.useState)(false);
    const {
      createSuccessNotice,
      createErrorNotice
    } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
    const {
      deleteEntityRecord
    } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      spacing: "5",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
        children: items.length > 1 ? (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject._n)('Are you sure you want to permanently delete %d item?', 'Are you sure you want to permanently delete %d items?', items.length), items.length) : (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject.__)('Are you sure you want to permanently delete "%s"?'), (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(getItemTitle(items[0])))
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
        justify: "right",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          variant: "tertiary",
          onClick: closeModal,
          disabled: isBusy,
          accessibleWhenDisabled: true,
          __next40pxDefaultSize: true,
          children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          variant: "primary",
          onClick: async () => {
            setIsBusy(true);
            const promiseResult = await Promise.allSettled(items.map(post => deleteEntityRecord('postType', post.type, post.id, {
              force: true
            }, {
              throwOnError: true
            })));
            if (promiseResult.every(({
              status
            }) => status === 'fulfilled')) {
              let successMessage;
              if (promiseResult.length === 1) {
                successMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
                (0,external_wp_i18n_namespaceObject.__)('"%s" permanently deleted.'), getItemTitle(items[0]));
              } else {
                successMessage = (0,external_wp_i18n_namespaceObject.__)('The items were permanently deleted.');
              }
              createSuccessNotice(successMessage, {
                type: 'snackbar',
                id: 'permanently-delete-post-action'
              });
              onActionPerformed?.(items);
            } else {
              let errorMessage;
              if (promiseResult.length === 1) {
                const typedError = promiseResult[0];
                if (typedError.reason?.message) {
                  errorMessage = typedError.reason.message;
                } else {
                  errorMessage = (0,external_wp_i18n_namespaceObject.__)('An error occurred while permanently deleting the item.');
                }
              } else {
                const errorMessages = new Set();
                const failedPromises = promiseResult.filter(({
                  status
                }) => status === 'rejected');
                for (const failedPromise of failedPromises) {
                  const typedError = failedPromise;
                  if (typedError.reason?.message) {
                    errorMessages.add(typedError.reason.message);
                  }
                }
                if (errorMessages.size === 0) {
                  errorMessage = (0,external_wp_i18n_namespaceObject.__)('An error occurred while permanently deleting the items.');
                } else if (errorMessages.size === 1) {
                  errorMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
                  (0,external_wp_i18n_namespaceObject.__)('An error occurred while permanently deleting the items: %s'), [...errorMessages][0]);
                } else {
                  errorMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
                  (0,external_wp_i18n_namespaceObject.__)('Some errors occurred while permanently deleting the items: %s'), [...errorMessages].join(','));
                }
              }
              createErrorNotice(errorMessage, {
                type: 'snackbar'
              });
            }
            setIsBusy(false);
            closeModal?.();
          },
          isBusy: isBusy,
          disabled: isBusy,
          accessibleWhenDisabled: true,
          __next40pxDefaultSize: true,
          children: (0,external_wp_i18n_namespaceObject.__)('Delete permanently')
        })]
      })]
    });
  }
};
 const permanently_delete_post = (permanentlyDeletePost);
;
const external_wp_mediaUtils_namespaceObject = window["wp"]["mediaUtils"];
;
const lineSolid = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M5 11.25h14v1.5H5z"
  })
});
 const line_solid = (lineSolid);
;
const FeaturedImageEdit = ({
  data,
  field,
  onChange
}) => {
  const {
    id
  } = field;
  const value = field.getValue({
    item: data
  });
  const media = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    return getEntityRecord('root', 'media', value);
  }, [value]);
  const onChangeControl = (0,external_wp_element_namespaceObject.useCallback)(newValue => onChange({
    [id]: newValue
  }), [id, onChange]);
  const url = media?.source_url;
  const title = media?.title?.rendered;
  const ref = (0,external_wp_element_namespaceObject.useRef)(null);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("fieldset", {
    className: "fields-controls__featured-image",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "fields-controls__featured-image-container",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_mediaUtils_namespaceObject.MediaUpload, {
        onSelect: selectedMedia => {
          onChangeControl(selectedMedia.id);
        },
        allowedTypes: ['image'],
        render: ({
          open
        }) => {
          return (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
            ref: ref,
            role: "button",
            tabIndex: -1,
            onClick: () => {
              open();
            },
            onKeyDown: open,
            children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalGrid, {
              rowGap: 0,
              columnGap: 8,
              templateColumns: "24px 1fr 24px",
              children: [url && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
                children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
                  className: "fields-controls__featured-image-image",
                  alt: "",
                  width: 24,
                  height: 24,
                  src: url
                }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
                  className: "fields-controls__featured-image-title",
                  children: title
                })]
              }), !url && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
                children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
                  className: "fields-controls__featured-image-placeholder",
                  style: {
                    width: '24px',
                    height: '24px'
                  }
                }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
                  className: "fields-controls__featured-image-title",
                  children: (0,external_wp_i18n_namespaceObject.__)('Choose an image…')
                })]
              }), url && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_ReactJSXRuntime_namespaceObject.Fragment, {
                children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
                  size: "small",
                  className: "fields-controls__featured-image-remove-button",
                  icon: line_solid,
                  onClick: event => {
                    event.stopPropagation();
                    onChangeControl(0);
                  }
                })
              })]
            })
          });
        }
      })
    })
  });
};
;
const FeaturedImageView = ({
  item
}) => {
  const mediaId = item.featured_media;
  const media = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    return mediaId ? getEntityRecord('root', 'media', mediaId) : null;
  }, [mediaId]);
  const url = media?.source_url;
  if (url) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
      className: "fields-controls__featured-image-image",
      src: url,
      alt: ""
    });
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
    className: "fields-controls__featured-image-placeholder"
  });
};
;
const featuredImageField = {
  id: 'featured_media',
  type: 'media',
  label: (0,external_wp_i18n_namespaceObject.__)('Featured Image'),
  Edit: FeaturedImageEdit,
  render: FeaturedImageView,
  enableSorting: false
};
 const featured_image = (featuredImageField);
;
function clsx_r(e){var t,f,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(f=clsx_r(e[t]))&&(n&&(n+=" "),n+=f)}else for(f in e)e[f]&&(n&&(n+=" "),n+=f);return n}function clsx(){for(var e,t,f=0,n="",o=arguments.length;f<o;f++)(e=arguments[f])&&(t=clsx_r(e))&&(n&&(n+=" "),n+=t);return n} const dist_clsx = (clsx);
;
const commentAuthorAvatar = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    d: "M7.25 16.437a6.5 6.5 0 1 1 9.5 0V16A2.75 2.75 0 0 0 14 13.25h-4A2.75 2.75 0 0 0 7.25 16v.437Zm1.5 1.193a6.47 6.47 0 0 0 3.25.87 6.47 6.47 0 0 0 3.25-.87V16c0-.69-.56-1.25-1.25-1.25h-4c-.69 0-1.25.56-1.25 1.25v1.63ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm10-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
    clipRule: "evenodd"
  })
});
 const comment_author_avatar = (commentAuthorAvatar);
;
function AuthorView({
  item
}) {
  const {
    text,
    imageUrl
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    let user;
    if (!!item.author) {
      user = getEntityRecord('root', 'user', item.author);
    }
    return {
      imageUrl: user?.avatar_urls?.[48],
      text: user?.name
    };
  }, [item]);
  const [isImageLoaded, setIsImageLoaded] = (0,external_wp_element_namespaceObject.useState)(false);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
    alignment: "left",
    spacing: 0,
    children: [!!imageUrl && (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: dist_clsx('page-templates-author-field__avatar', {
        'is-loaded': isImageLoaded
      }),
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
        onLoad: () => setIsImageLoaded(true),
        alt: (0,external_wp_i18n_namespaceObject.__)('Author avatar'),
        src: imageUrl
      })
    }), !imageUrl && (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "page-templates-author-field__icon",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
        icon: comment_author_avatar
      })
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
      className: "page-templates-author-field__name",
      children: text
    })]
  });
}
 const author_view = (AuthorView);
;
const authorField = {
  label: (0,external_wp_i18n_namespaceObject.__)('Author'),
  id: 'author',
  type: 'integer',
  elements: [],
  render: author_view,
  sort: (a, b, direction) => {
    const nameA = a._embedded?.author?.[0]?.name || '';
    const nameB = b._embedded?.author?.[0]?.name || '';
    return direction === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  }
};
 const author = (authorField);
;
const drafts = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 18.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm8 4a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4Z"
  })
});
 const library_drafts = (drafts);
;
const scheduled = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 18.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm9 1V8h-1.5v3.5h-2V13H13Z"
  })
});
 const library_scheduled = (scheduled);
;
const pending = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 18.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm8 4a4 4 0 0 1-4-4h4V8a4 4 0 0 1 0 8Z"
  })
});
 const library_pending = (pending);
;
const notAllowed = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 18.5A6.5 6.5 0 0 1 6.93 7.931l9.139 9.138A6.473 6.473 0 0 1 12 18.5Zm5.123-2.498a6.5 6.5 0 0 0-9.124-9.124l9.124 9.124ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z"
  })
});
 const not_allowed = (notAllowed);
;
const published = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 18.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm11.53-1.47-1.06-1.06L11 12.94l-1.47-1.47-1.06 1.06L11 15.06l4.53-4.53Z"
  })
});
 const library_published = (published);
;
const STATUSES = [{
  value: 'draft',
  label: (0,external_wp_i18n_namespaceObject.__)('Draft'),
  icon: library_drafts,
  description: (0,external_wp_i18n_namespaceObject.__)('Not ready to publish.')
}, {
  value: 'future',
  label: (0,external_wp_i18n_namespaceObject.__)('Scheduled'),
  icon: library_scheduled,
  description: (0,external_wp_i18n_namespaceObject.__)('Publish automatically on a chosen date.')
}, {
  value: 'pending',
  label: (0,external_wp_i18n_namespaceObject.__)('Pending Review'),
  icon: library_pending,
  description: (0,external_wp_i18n_namespaceObject.__)('Waiting for review before publishing.')
}, {
  value: 'private',
  label: (0,external_wp_i18n_namespaceObject.__)('Private'),
  icon: not_allowed,
  description: (0,external_wp_i18n_namespaceObject.__)('Only visible to site admins and editors.')
}, {
  value: 'publish',
  label: (0,external_wp_i18n_namespaceObject.__)('Published'),
  icon: library_published,
  description: (0,external_wp_i18n_namespaceObject.__)('Visible to everyone.')
}, {
  value: 'trash',
  label: (0,external_wp_i18n_namespaceObject.__)('Trash'),
  icon: library_trash
}];
 const status_elements = (STATUSES);
;
function StatusView({
  item
}) {
  const status = status_elements.find(({
    value
  }) => value === item.status);
  const label = status?.label || item.status;
  const icon = status?.icon;
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
    alignment: "left",
    spacing: 0,
    children: [icon && (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "edit-site-post-list__status-icon",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
        icon: icon
      })
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
      children: label
    })]
  });
}
 const status_view = (StatusView);
;
const OPERATOR_IS_ANY = 'isAny';
const statusField = {
  label: (0,external_wp_i18n_namespaceObject.__)('Status'),
  id: 'status',
  type: 'text',
  elements: status_elements,
  render: status_view,
  Edit: 'radio',
  enableSorting: false,
  filterBy: {
    operators: [OPERATOR_IS_ANY]
  }
};
 const fields_status = (statusField);
;
const getFormattedDate = dateToDisplay => (0,external_wp_date_namespaceObject.dateI18n)((0,external_wp_date_namespaceObject.getSettings)().formats.datetimeAbbreviated, (0,external_wp_date_namespaceObject.getDate)(dateToDisplay));
const DateView = ({
  item
}) => {
  var _item$status, _item$modified, _item$date4, _item$date5;
  const isDraftOrPrivate = ['draft', 'private'].includes((_item$status = item.status) !== null && _item$status !== void 0 ? _item$status : '');
  if (isDraftOrPrivate) {
    var _item$date;
    return (0,external_wp_element_namespaceObject.createInterpolateElement)((0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('<span>Modified: <time>%s</time></span>'), getFormattedDate((_item$date = item.date) !== null && _item$date !== void 0 ? _item$date : null)), {
      span: (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {}),
      time: (0,external_ReactJSXRuntime_namespaceObject.jsx)("time", {})
    });
  }
  const isScheduled = item.status === 'future';
  if (isScheduled) {
    var _item$date2;
    return (0,external_wp_element_namespaceObject.createInterpolateElement)((0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('<span>Scheduled: <time>%s</time></span>'), getFormattedDate((_item$date2 = item.date) !== null && _item$date2 !== void 0 ? _item$date2 : null)), {
      span: (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {}),
      time: (0,external_ReactJSXRuntime_namespaceObject.jsx)("time", {})
    });
  }
  const isPublished = item.status === 'publish';
  if (isPublished) {
    var _item$date3;
    return (0,external_wp_element_namespaceObject.createInterpolateElement)((0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('<span>Published: <time>%s</time></span>'), getFormattedDate((_item$date3 = item.date) !== null && _item$date3 !== void 0 ? _item$date3 : null)), {
      span: (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {}),
      time: (0,external_ReactJSXRuntime_namespaceObject.jsx)("time", {})
    });
  }
  const dateToDisplay = (0,external_wp_date_namespaceObject.getDate)((_item$modified = item.modified) !== null && _item$modified !== void 0 ? _item$modified : null) > (0,external_wp_date_namespaceObject.getDate)((_item$date4 = item.date) !== null && _item$date4 !== void 0 ? _item$date4 : null) ? item.modified : item.date;
  const isPending = item.status === 'pending';
  if (isPending) {
    return (0,external_wp_element_namespaceObject.createInterpolateElement)((0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('<span>Modified: <time>%s</time></span>'), getFormattedDate(dateToDisplay !== null && dateToDisplay !== void 0 ? dateToDisplay : null)), {
      span: (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {}),
      time: (0,external_ReactJSXRuntime_namespaceObject.jsx)("time", {})
    });
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("time", {
    children: getFormattedDate((_item$date5 = item.date) !== null && _item$date5 !== void 0 ? _item$date5 : null)
  });
};
 const date_view = (DateView);
;
const dateField = {
  id: 'date',
  type: 'datetime',
  label: (0,external_wp_i18n_namespaceObject.__)('Date'),
  render: date_view
};
 const date = (dateField);
;
const copySmall = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M5.625 5.5h9.75c.069 0 .125.056.125.125v9.75a.125.125 0 0 1-.125.125h-9.75a.125.125 0 0 1-.125-.125v-9.75c0-.069.056-.125.125-.125ZM4 5.625C4 4.728 4.728 4 5.625 4h9.75C16.273 4 17 4.728 17 5.625v9.75c0 .898-.727 1.625-1.625 1.625h-9.75A1.625 1.625 0 0 1 4 15.375v-9.75Zm14.5 11.656v-9H20v9C20 18.8 18.77 20 17.251 20H6.25v-1.5h11.001c.69 0 1.249-.528 1.249-1.219Z"
  })
});
 const copy_small = (copySmall);
;
const getSlug = item => {
  if (typeof item !== 'object') {
    return '';
  }
  return item.slug || (0,external_wp_url_namespaceObject.cleanForSlug)(getItemTitle(item)) || item.id.toString();
};
;
const SlugEdit = ({
  field,
  onChange,
  data
}) => {
  const {
    id
  } = field;
  const slug = field.getValue({
    item: data
  }) || getSlug(data);
  const permalinkTemplate = data.permalink_template || '';
  const PERMALINK_POSTNAME_REGEX = /%(?:postname|pagename)%/;
  const [prefix, suffix] = permalinkTemplate.split(PERMALINK_POSTNAME_REGEX);
  const permalinkPrefix = prefix;
  const permalinkSuffix = suffix;
  const isEditable = PERMALINK_POSTNAME_REGEX.test(permalinkTemplate);
  const originalSlugRef = (0,external_wp_element_namespaceObject.useRef)(slug);
  const slugToDisplay = slug || originalSlugRef.current;
  const permalink = isEditable ? `${permalinkPrefix}${slugToDisplay}${permalinkSuffix}` : (0,external_wp_url_namespaceObject.safeDecodeURIComponent)(data.link || '');
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (slug && originalSlugRef.current === undefined) {
      originalSlugRef.current = slug;
    }
  }, [slug]);
  const onChangeControl = (0,external_wp_element_namespaceObject.useCallback)(newValue => onChange({
    [id]: newValue
  }), [id, onChange]);
  const {
    createNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const copyButtonRef = (0,external_wp_compose_namespaceObject.useCopyToClipboard)(permalink, () => {
    createNotice('info', (0,external_wp_i18n_namespaceObject.__)('Copied Permalink to clipboard.'), {
      isDismissible: true,
      type: 'snackbar'
    });
  });
  const postUrlSlugDescriptionId = 'editor-post-url__slug-description-' + (0,external_wp_compose_namespaceObject.useInstanceId)(SlugEdit);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("fieldset", {
    className: "fields-controls__slug",
    children: [isEditable && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
        spacing: "0px",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
          children: (0,external_wp_i18n_namespaceObject.__)('Customize the last part of the Permalink.')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ExternalLink, {
          href: "https://wordpress.org/documentation/article/page-post-settings-sidebar/#permalink",
          children: (0,external_wp_i18n_namespaceObject.__)('Learn more')
        })]
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalInputControl, {
        __next40pxDefaultSize: true,
        prefix: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalInputControlPrefixWrapper, {
          children: "/"
        }),
        suffix: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          icon: copy_small,
          ref: copyButtonRef,
          label: (0,external_wp_i18n_namespaceObject.__)('Copy')
        }),
        label: (0,external_wp_i18n_namespaceObject.__)('Link'),
        hideLabelFromVision: true,
        value: slug,
        autoComplete: "off",
        spellCheck: "false",
        type: "text",
        className: "fields-controls__slug-input",
        onChange: newValue => {
          onChangeControl(newValue);
        },
        onBlur: () => {
          if (slug === '') {
            onChangeControl(originalSlugRef.current);
          }
        },
        "aria-describedby": postUrlSlugDescriptionId
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "fields-controls__slug-help",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
          className: "fields-controls__slug-help-visual-label",
          children: (0,external_wp_i18n_namespaceObject.__)('Permalink:')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.ExternalLink, {
          className: "fields-controls__slug-help-link",
          href: permalink,
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
            className: "fields-controls__slug-help-prefix",
            children: permalinkPrefix
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
            className: "fields-controls__slug-help-slug",
            children: slugToDisplay
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
            className: "fields-controls__slug-help-suffix",
            children: permalinkSuffix
          })]
        })]
      })]
    }), !isEditable && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ExternalLink, {
      className: "fields-controls__slug-help",
      href: permalink,
      children: permalink
    })]
  });
};
 const slug_edit = (SlugEdit);
;
const SlugView = ({
  item
}) => {
  const slug = getSlug(item);
  const originalSlugRef = (0,external_wp_element_namespaceObject.useRef)(slug);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (slug && originalSlugRef.current === undefined) {
      originalSlugRef.current = slug;
    }
  }, [slug]);
  const slugToDisplay = slug || originalSlugRef.current;
  return `${slugToDisplay}`;
};
 const slug_view = (SlugView);
;
const slugField = {
  id: 'slug',
  type: 'text',
  label: (0,external_wp_i18n_namespaceObject.__)('Slug'),
  Edit: slug_edit,
  render: slug_view
};
 const slug = (slugField);
var remove_accents = __webpack_require__(9681);
var remove_accents_default = __webpack_require__.n(remove_accents);
;
function getTitleWithFallbackName(post) {
  return typeof post.title === 'object' && 'rendered' in post.title && post.title.rendered ? (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(post.title.rendered) : `#${post?.id} (${(0,external_wp_i18n_namespaceObject.__)('no title')})`;
}
;
function buildTermsTree(flatTerms) {
  const flatTermsWithParentAndChildren = flatTerms.map(term => {
    return {
      children: [],
      ...term
    };
  });
  if (flatTermsWithParentAndChildren.some(({
    parent
  }) => parent === null || parent === undefined)) {
    return flatTermsWithParentAndChildren;
  }
  const termsByParent = flatTermsWithParentAndChildren.reduce((acc, term) => {
    const {
      parent
    } = term;
    if (!acc[parent]) {
      acc[parent] = [];
    }
    acc[parent].push(term);
    return acc;
  }, {});
  const fillWithChildren = terms => {
    return terms.map(term => {
      const children = termsByParent[term.id];
      return {
        ...term,
        children: children && children.length ? fillWithChildren(children) : []
      };
    });
  };
  return fillWithChildren(termsByParent['0'] || []);
}
const getItemPriority = (name, searchValue) => {
  const normalizedName = remove_accents_default()(name || '').toLowerCase();
  const normalizedSearch = remove_accents_default()(searchValue || '').toLowerCase();
  if (normalizedName === normalizedSearch) {
    return 0;
  }
  if (normalizedName.startsWith(normalizedSearch)) {
    return normalizedName.length;
  }
  return Infinity;
};
function PageAttributesParent({
  data,
  onChangeControl
}) {
  const [fieldValue, setFieldValue] = (0,external_wp_element_namespaceObject.useState)(null);
  const pageId = data.parent;
  const postId = data.id;
  const postTypeSlug = data.type;
  const {
    parentPostTitle,
    pageItems,
    isHierarchical
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord,
      getEntityRecords,
      getPostType
    } = select(external_wp_coreData_namespaceObject.store);
    const postTypeInfo = getPostType(postTypeSlug);
    const postIsHierarchical = postTypeInfo?.hierarchical && postTypeInfo.viewable;
    const parentPost = pageId ? getEntityRecord('postType', postTypeSlug, pageId) : null;
    const query = {
      per_page: 100,
      exclude: postId,
      parent_exclude: postId,
      orderby: 'menu_order',
      order: 'asc',
      _fields: 'id,title,parent',
      ...(fieldValue !== null && {
        search: fieldValue
      })
    };
    return {
      isHierarchical: postIsHierarchical,
      parentPostTitle: parentPost ? getTitleWithFallbackName(parentPost) : '',
      pageItems: postIsHierarchical ? getEntityRecords('postType', postTypeSlug, query) : null
    };
  }, [fieldValue, pageId, postId, postTypeSlug]);
  const parentOptions = (0,external_wp_element_namespaceObject.useMemo)(() => {
    const getOptionsFromTree = (tree, level = 0) => {
      const mappedNodes = tree.map(treeNode => [{
        value: treeNode.id,
        label: '— '.repeat(level) + (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(treeNode.name),
        rawName: treeNode.name
      }, ...getOptionsFromTree(treeNode.children || [], level + 1)]);
      const sortedNodes = mappedNodes.sort(([a], [b]) => {
        const priorityA = getItemPriority(a.rawName, fieldValue !== null && fieldValue !== void 0 ? fieldValue : '');
        const priorityB = getItemPriority(b.rawName, fieldValue !== null && fieldValue !== void 0 ? fieldValue : '');
        return priorityA >= priorityB ? 1 : -1;
      });
      return sortedNodes.flat();
    };
    if (!pageItems) {
      return [];
    }
    let tree = pageItems.map(item => {
      var _item$parent;
      return {
        id: item.id,
        parent: (_item$parent = item.parent) !== null && _item$parent !== void 0 ? _item$parent : null,
        name: getTitleWithFallbackName(item)
      };
    });
    if (!fieldValue) {
      tree = buildTermsTree(tree);
    }
    const opts = getOptionsFromTree(tree);
    const optsHasParent = opts.find(item => item.value === pageId);
    if (pageId && parentPostTitle && !optsHasParent) {
      opts.unshift({
        value: pageId,
        label: parentPostTitle,
        rawName: ''
      });
    }
    return opts.map(option => ({
      ...option,
      value: option.value.toString()
    }));
  }, [pageItems, fieldValue, parentPostTitle, pageId]);
  if (!isHierarchical) {
    return null;
  }
  const handleKeydown = inputValue => {
    setFieldValue(inputValue);
  };
  const handleChange = selectedPostId => {
    if (selectedPostId) {
      var _parseInt;
      return onChangeControl((_parseInt = parseInt(selectedPostId, 10)) !== null && _parseInt !== void 0 ? _parseInt : 0);
    }
    onChangeControl(0);
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ComboboxControl, {
    __nextHasNoMarginBottom: true,
    __next40pxDefaultSize: true,
    label: (0,external_wp_i18n_namespaceObject.__)('Parent'),
    help: (0,external_wp_i18n_namespaceObject.__)('Choose a parent page.'),
    value: pageId?.toString(),
    options: parentOptions,
    onFilterValueChange: (0,external_wp_compose_namespaceObject.debounce)(value => handleKeydown(value), 300),
    onChange: handleChange,
    hideLabelFromVision: true
  });
}
const ParentEdit = ({
  data,
  field,
  onChange
}) => {
  const {
    id
  } = field;
  const homeUrl = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return select(external_wp_coreData_namespaceObject.store).getEntityRecord('root', '__unstableBase')?.home;
  }, []);
  const onChangeControl = (0,external_wp_element_namespaceObject.useCallback)(newValue => onChange({
    [id]: newValue
  }), [id, onChange]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("fieldset", {
    className: "fields-controls__parent",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      children: [(0,external_wp_element_namespaceObject.createInterpolateElement)((0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject.__)('Child pages inherit characteristics from their parent, such as URL structure. For instance, if "Pricing" is a child of "Services", its URL would be %1$s<wbr />/services<wbr />/pricing.'), (0,external_wp_url_namespaceObject.filterURLForDisplay)(homeUrl).replace(/([/.])/g, '<wbr />$1')), {
        wbr: (0,external_ReactJSXRuntime_namespaceObject.jsx)("wbr", {})
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
        children: (0,external_wp_element_namespaceObject.createInterpolateElement)((0,external_wp_i18n_namespaceObject.__)('They also show up as sub-items in the default navigation menu. <a>Learn more.</a>'), {
          a: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ExternalLink, {
            href: (0,external_wp_i18n_namespaceObject.__)('https://wordpress.org/documentation/article/page-post-settings-sidebar/#page-attributes'),
            children: undefined
          })
        })
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PageAttributesParent, {
        data: data,
        onChangeControl: onChangeControl
      })]
    })
  });
};
;
const ParentView = ({
  item
}) => {
  const parent = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    return item?.parent ? getEntityRecord('postType', item.type, item.parent) : null;
  }, [item.parent, item.type]);
  if (parent) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: getTitleWithFallbackName(parent)
    });
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: (0,external_wp_i18n_namespaceObject.__)('None')
  });
};
;
const parentField = {
  id: 'parent',
  type: 'text',
  label: (0,external_wp_i18n_namespaceObject.__)('Parent'),
  Edit: ParentEdit,
  render: ParentView,
  enableSorting: true
};
 const fields_parent = (parentField);
;
const commentStatusField = {
  id: 'comment_status',
  label: (0,external_wp_i18n_namespaceObject.__)('Discussion'),
  type: 'text',
  Edit: 'radio',
  enableSorting: false,
  filterBy: {
    operators: []
  },
  elements: [{
    value: 'open',
    label: (0,external_wp_i18n_namespaceObject.__)('Open'),
    description: (0,external_wp_i18n_namespaceObject.__)('Visitors can add new comments and replies.')
  }, {
    value: 'closed',
    label: (0,external_wp_i18n_namespaceObject.__)('Closed'),
    description: (0,external_wp_i18n_namespaceObject.__)('Visitors cannot add new comments or replies. Existing comments remain visible.')
  }]
};
 const comment_status = (commentStatusField);
;
const EMPTY_ARRAY = [];
const TemplateEdit = ({
  data,
  field,
  onChange
}) => {
  const {
    id
  } = field;
  const postType = data.type;
  const postId = typeof data.id === 'number' ? data.id : parseInt(data.id, 10);
  const slug = data.slug;
  const {
    canSwitchTemplate,
    templates
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$getEntityReco;
    const allTemplates = (_select$getEntityReco = select(external_wp_coreData_namespaceObject.store).getEntityRecords('postType', 'wp_template', {
      per_page: -1,
      post_type: postType
    })) !== null && _select$getEntityReco !== void 0 ? _select$getEntityReco : EMPTY_ARRAY;
    const {
      getHomePage,
      getPostsPageId
    } = lock_unlock_unlock(select(external_wp_coreData_namespaceObject.store));
    const isPostsPage = getPostsPageId() === +postId;
    const isFrontPage = postType === 'page' && getHomePage()?.postId === +postId;
    const allowSwitchingTemplate = !isPostsPage && !isFrontPage;
    return {
      templates: allTemplates,
      canSwitchTemplate: allowSwitchingTemplate
    };
  }, [postId, postType]);
  const templatesAsPatterns = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (!canSwitchTemplate) {
      return [];
    }
    return templates.filter(template => template.is_custom && template.slug !== data.template &&
    !!template.content.raw).map(template => ({
      name: template.slug,
      blocks: (0,external_wp_blocks_namespaceObject.parse)(template.content.raw),
      title: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(template.title.rendered),
      id: template.id
    }));
  }, [canSwitchTemplate, data.template, templates]);
  const shownTemplates = (0,external_wp_compose_namespaceObject.useAsyncList)(templatesAsPatterns);
  const value = field.getValue({
    item: data
  });
  const foundTemplate = templates.find(template => template.slug === value);
  const currentTemplate = (0,external_wp_data_namespaceObject.useSelect)(select => {
    if (foundTemplate) {
      return foundTemplate;
    }
    let slugToCheck;
    if (slug) {
      slugToCheck = postType === 'page' ? `${postType}-${slug}` : `single-${postType}-${slug}`;
    } else {
      slugToCheck = postType === 'page' ? 'page' : `single-${postType}`;
    }
    if (postType) {
      const templateId = select(external_wp_coreData_namespaceObject.store).getDefaultTemplateId({
        slug: slugToCheck
      });
      return select(external_wp_coreData_namespaceObject.store).getEntityRecord('postType', 'wp_template', templateId);
    }
  }, [foundTemplate, postType, slug]);
  const [showModal, setShowModal] = (0,external_wp_element_namespaceObject.useState)(false);
  const onChangeControl = (0,external_wp_element_namespaceObject.useCallback)(newValue => onChange({
    [id]: newValue
  }), [id, onChange]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("fieldset", {
    className: "fields-controls__template",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
      popoverProps: {
        placement: 'bottom-start'
      },
      renderToggle: ({
        onToggle
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        __next40pxDefaultSize: true,
        variant: "tertiary",
        size: "compact",
        onClick: onToggle,
        children: currentTemplate ? getItemTitle(currentTemplate) : ''
      }),
      renderContent: ({
        onToggle
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.MenuGroup, {
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
          onClick: () => {
            setShowModal(true);
            onToggle();
          },
          children: (0,external_wp_i18n_namespaceObject.__)('Change template')
        }),
        value !== '' && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
          onClick: () => {
            onChangeControl('');
            onToggle();
          },
          children: (0,external_wp_i18n_namespaceObject.__)('Use default template')
        })]
      })
    }), showModal && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Modal, {
      title: (0,external_wp_i18n_namespaceObject.__)('Choose a template'),
      onRequestClose: () => setShowModal(false),
      overlayClassName: "fields-controls__template-modal",
      isFullScreen: true,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "fields-controls__template-content",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalBlockPatternsList, {
          label: (0,external_wp_i18n_namespaceObject.__)('Templates'),
          blockPatterns: templatesAsPatterns,
          shownPatterns: shownTemplates,
          onClickPattern: template => {
            onChangeControl(template.name);
            setShowModal(false);
          }
        })
      })
    })]
  });
};
;
const templateField = {
  id: 'template',
  type: 'text',
  label: (0,external_wp_i18n_namespaceObject.__)('Template'),
  Edit: TemplateEdit,
  enableSorting: false
};
 const fields_template = (templateField);
;
function PasswordEdit({
  data,
  onChange,
  field
}) {
  const [showPassword, setShowPassword] = (0,external_wp_element_namespaceObject.useState)(!!field.getValue({
    item: data
  }));
  const handleTogglePassword = value => {
    setShowPassword(value);
    if (!value) {
      onChange({
        password: ''
      });
    }
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
    as: "fieldset",
    spacing: 4,
    className: "fields-controls__password",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.CheckboxControl, {
      __nextHasNoMarginBottom: true,
      label: (0,external_wp_i18n_namespaceObject.__)('Password protected'),
      help: (0,external_wp_i18n_namespaceObject.__)('Only visible to those who know the password'),
      checked: showPassword,
      onChange: handleTogglePassword
    }), showPassword && (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "fields-controls__password-input",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
        label: (0,external_wp_i18n_namespaceObject.__)('Password'),
        onChange: value => onChange({
          password: value
        }),
        value: field.getValue({
          item: data
        }) || '',
        placeholder: (0,external_wp_i18n_namespaceObject.__)('Use a secure password'),
        type: "text",
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        maxLength: 255
      })
    })]
  });
}
 const edit = (PasswordEdit);
;
const passwordField = {
  id: 'password',
  type: 'text',
  Edit: edit,
  enableSorting: false,
  enableHiding: false,
  isVisible: item => item.status !== 'private'
};
 const fields_password = (passwordField);
;
function BaseTitleView({
  item,
  className,
  children
}) {
  const renderedTitle = getItemTitle(item);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
    className: dist_clsx('fields-field__title', className),
    alignment: "center",
    justify: "flex-start",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
      children: renderedTitle || (0,external_wp_i18n_namespaceObject.__)('(no title)')
    }), children]
  });
}
function TitleView({
  item
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(BaseTitleView, {
    item: item
  });
}
;
const {
  Badge
} = lock_unlock_unlock(external_wp_components_namespaceObject.privateApis);
function PageTitleView({
  item
}) {
  const {
    frontPageId,
    postsPageId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    const siteSettings = getEntityRecord('root', 'site');
    return {
      frontPageId: siteSettings?.page_on_front,
      postsPageId: siteSettings?.page_for_posts
    };
  }, []);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(BaseTitleView, {
    item: item,
    className: "fields-field__page-title",
    children: [frontPageId, postsPageId].includes(item.id) && (0,external_ReactJSXRuntime_namespaceObject.jsx)(Badge, {
      children: item.id === frontPageId ? (0,external_wp_i18n_namespaceObject.__)('Homepage') : (0,external_wp_i18n_namespaceObject.__)('Posts Page')
    })
  });
}
;
const pageTitleField = {
  type: 'text',
  id: 'title',
  label: (0,external_wp_i18n_namespaceObject.__)('Title'),
  placeholder: (0,external_wp_i18n_namespaceObject.__)('No title'),
  getValue: ({
    item
  }) => getItemTitle(item),
  render: PageTitleView,
  enableHiding: false,
  enableGlobalSearch: true
};
 const page_title = (pageTitleField);
;
const templateTitleField = {
  type: 'text',
  label: (0,external_wp_i18n_namespaceObject.__)('Template'),
  placeholder: (0,external_wp_i18n_namespaceObject.__)('No title'),
  id: 'title',
  getValue: ({
    item
  }) => getItemTitle(item),
  render: TitleView,
  enableHiding: false,
  enableGlobalSearch: true
};
 const template_title = (templateTitleField);
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
const lockSmall = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M15 11h-.2V9c0-1.5-1.2-2.8-2.8-2.8S9.2 7.5 9.2 9v2H9c-.6 0-1 .4-1 1v4c0 .6.4 1 1 1h6c.6 0 1-.4 1-1v-4c0-.6-.4-1-1-1zm-1.8 0h-2.5V9c0-.7.6-1.2 1.2-1.2s1.2.6 1.2 1.2v2z"
  })
});
 const lock_small = (lockSmall);
;
const {
  PATTERN_TYPES: view_PATTERN_TYPES
} = lock_unlock_unlock(external_wp_patterns_namespaceObject.privateApis);
function PatternTitleView({
  item
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(BaseTitleView, {
    item: item,
    className: "fields-field__pattern-title",
    children: item.type === view_PATTERN_TYPES.theme && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Tooltip, {
      placement: "top",
      text: (0,external_wp_i18n_namespaceObject.__)('This pattern cannot be edited.'),
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(icon, {
        icon: lock_small,
        size: 24
      })
    })
  });
}
;
const patternTitleField = {
  type: 'text',
  id: 'title',
  label: (0,external_wp_i18n_namespaceObject.__)('Title'),
  placeholder: (0,external_wp_i18n_namespaceObject.__)('No title'),
  getValue: ({
    item
  }) => getItemTitle(item),
  render: PatternTitleView,
  enableHiding: false,
  enableGlobalSearch: true
};
 const pattern_title = (patternTitleField);
;
const titleField = {
  type: 'text',
  id: 'title',
  label: (0,external_wp_i18n_namespaceObject.__)('Title'),
  placeholder: (0,external_wp_i18n_namespaceObject.__)('No title'),
  getValue: ({
    item
  }) => getItemTitle(item),
  render: TitleView,
  enableHiding: false,
  enableGlobalSearch: true
};
 const title = (titleField);
;
function getSubRegistry(subRegistries, registry, useSubRegistry) {
  if (!useSubRegistry) {
    return registry;
  }
  let subRegistry = subRegistries.get(registry);
  if (!subRegistry) {
    subRegistry = (0,external_wp_data_namespaceObject.createRegistry)({
      'core/block-editor': external_wp_blockEditor_namespaceObject.storeConfig
    }, registry);
    subRegistry.registerStore('core/editor', storeConfig);
    subRegistries.set(registry, subRegistry);
  }
  return subRegistry;
}
const withRegistryProvider = (0,external_wp_compose_namespaceObject.createHigherOrderComponent)(WrappedComponent => ({
  useSubRegistry = true,
  ...props
}) => {
  const registry = (0,external_wp_data_namespaceObject.useRegistry)();
  const [subRegistries] = (0,external_wp_element_namespaceObject.useState)(() => new WeakMap());
  const subRegistry = getSubRegistry(subRegistries, registry, useSubRegistry);
  if (subRegistry === registry) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(WrappedComponent, {
      registry: registry,
      ...props
    });
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_data_namespaceObject.RegistryProvider, {
    value: subRegistry,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(WrappedComponent, {
      registry: subRegistry,
      ...props
    })
  });
}, 'withRegistryProvider');
 const with_registry_provider = (withRegistryProvider);
;
const getExternalLink = (url, text) => `<a ${getExternalLinkAttributes(url)}>${text}</a>`;
const getExternalLinkAttributes = url => `href="${url}" target="_blank" rel="noreferrer noopener"`;
const getOpenverseLicense = (license, licenseVersion) => {
  let licenseName = license.trim();
  if (license !== 'pdm') {
    licenseName = license.toUpperCase().replace('SAMPLING', 'Sampling');
  }
  if (licenseVersion) {
    licenseName += ` ${licenseVersion}`;
  }
  if (!['pdm', 'cc0'].includes(license)) {
    licenseName = `CC ${licenseName}`;
  }
  return licenseName;
};
const getOpenverseCaption = item => {
  const {
    title,
    foreign_landing_url: foreignLandingUrl,
    creator,
    creator_url: creatorUrl,
    license,
    license_version: licenseVersion,
    license_url: licenseUrl
  } = item;
  const fullLicense = getOpenverseLicense(license, licenseVersion);
  const _creator = (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(creator);
  let _caption;
  if (_creator) {
    _caption = title ? (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject._x)('"%1$s" by %2$s/ %3$s', 'caption'), getExternalLink(foreignLandingUrl, (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(title)), creatorUrl ? getExternalLink(creatorUrl, _creator) : _creator, licenseUrl ? getExternalLink(`${licenseUrl}?ref=openverse`, fullLicense) : fullLicense) : (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject._x)('<a %1$s>Work</a> by %2$s/ %3$s', 'caption'), getExternalLinkAttributes(foreignLandingUrl), creatorUrl ? getExternalLink(creatorUrl, _creator) : _creator, licenseUrl ? getExternalLink(`${licenseUrl}?ref=openverse`, fullLicense) : fullLicense);
  } else {
    _caption = title ? (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject._x)('"%1$s"/ %2$s', 'caption'), getExternalLink(foreignLandingUrl, (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(title)), licenseUrl ? getExternalLink(`${licenseUrl}?ref=openverse`, fullLicense) : fullLicense) : (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject._x)('<a %1$s>Work</a>/ %2$s', 'caption'), getExternalLinkAttributes(foreignLandingUrl), licenseUrl ? getExternalLink(`${licenseUrl}?ref=openverse`, fullLicense) : fullLicense);
  }
  return _caption.replace(/\s{2}/g, ' ');
};
const coreMediaFetch = async (query = {}) => {
  const mediaItems = await (0,external_wp_data_namespaceObject.resolveSelect)(external_wp_coreData_namespaceObject.store).getMediaItems({
    ...query,
    orderBy: !!query?.search ? 'relevance' : 'date'
  });
  return mediaItems.map(mediaItem => ({
    ...mediaItem,
    alt: mediaItem.alt_text,
    url: mediaItem.source_url,
    previewUrl: mediaItem.media_details?.sizes?.medium?.source_url,
    caption: mediaItem.caption?.raw
  }));
};
const inserterMediaCategories = [{
  name: 'images',
  labels: {
    name: (0,external_wp_i18n_namespaceObject.__)('Images'),
    search_items: (0,external_wp_i18n_namespaceObject.__)('Search images')
  },
  mediaType: 'image',
  async fetch(query = {}) {
    return coreMediaFetch({
      ...query,
      media_type: 'image'
    });
  }
}, {
  name: 'videos',
  labels: {
    name: (0,external_wp_i18n_namespaceObject.__)('Videos'),
    search_items: (0,external_wp_i18n_namespaceObject.__)('Search videos')
  },
  mediaType: 'video',
  async fetch(query = {}) {
    return coreMediaFetch({
      ...query,
      media_type: 'video'
    });
  }
}, {
  name: 'audio',
  labels: {
    name: (0,external_wp_i18n_namespaceObject.__)('Audio'),
    search_items: (0,external_wp_i18n_namespaceObject.__)('Search audio')
  },
  mediaType: 'audio',
  async fetch(query = {}) {
    return coreMediaFetch({
      ...query,
      media_type: 'audio'
    });
  }
}, {
  name: 'openverse',
  labels: {
    name: (0,external_wp_i18n_namespaceObject.__)('Openverse'),
    search_items: (0,external_wp_i18n_namespaceObject.__)('Search Openverse')
  },
  mediaType: 'image',
  async fetch(query = {}) {
    const defaultArgs = {
      mature: false,
      excluded_source: 'flickr,inaturalist,wikimedia',
      license: 'pdm,cc0'
    };
    const finalQuery = {
      ...query,
      ...defaultArgs
    };
    const mapFromInserterMediaRequest = {
      per_page: 'page_size',
      search: 'q'
    };
    const url = new URL('https://api.openverse.org/v1/images/');
    Object.entries(finalQuery).forEach(([key, value]) => {
      const queryKey = mapFromInserterMediaRequest[key] || key;
      url.searchParams.set(queryKey, value);
    });
    const response = await window.fetch(url, {
      headers: {
        'User-Agent': 'WordPress/inserter-media-fetch'
      }
    });
    const jsonResponse = await response.json();
    const results = jsonResponse.results;
    return results.map(result => ({
      ...result,
      title: result.title?.toLowerCase().startsWith('file:') ? result.title.slice(5) : result.title,
      sourceId: result.id,
      id: undefined,
      caption: getOpenverseCaption(result),
      previewUrl: result.thumbnail
    }));
  },
  getReportUrl: ({
    sourceId
  }) => `https://wordpress.org/openverse/image/${sourceId}/report/`,
  isExternalResource: true
}];
 const media_categories = (inserterMediaCategories);
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
const noop = () => {};
function mediaUpload({
  additionalData = {},
  allowedTypes,
  filesList,
  maxUploadFileSize,
  onError = noop,
  onFileChange,
  onSuccess,
  multiple = true
}) {
  const {
    getCurrentPost,
    getEditorSettings
  } = (0,external_wp_data_namespaceObject.select)(store_store);
  const {
    lockPostAutosaving,
    unlockPostAutosaving,
    lockPostSaving,
    unlockPostSaving
  } = (0,external_wp_data_namespaceObject.dispatch)(store_store);
  const wpAllowedMimeTypes = getEditorSettings().allowedMimeTypes;
  const lockKey = `image-upload-${esm_browser_v4()}`;
  let imageIsUploading = false;
  maxUploadFileSize = maxUploadFileSize || getEditorSettings().maxUploadFileSize;
  const currentPost = getCurrentPost();
  const currentPostId = typeof currentPost?.id === 'number' ? currentPost.id : currentPost?.wp_id;
  const setSaveLock = () => {
    lockPostSaving(lockKey);
    lockPostAutosaving(lockKey);
    imageIsUploading = true;
  };
  const postData = currentPostId ? {
    post: currentPostId
  } : {};
  const clearSaveLock = () => {
    unlockPostSaving(lockKey);
    unlockPostAutosaving(lockKey);
    imageIsUploading = false;
  };
  (0,external_wp_mediaUtils_namespaceObject.uploadMedia)({
    allowedTypes,
    filesList,
    onFileChange: file => {
      if (!imageIsUploading) {
        setSaveLock();
      } else {
        clearSaveLock();
      }
      onFileChange?.(file);
    },
    onSuccess,
    additionalData: {
      ...postData,
      ...additionalData
    },
    maxUploadFileSize,
    onError: ({
      message
    }) => {
      clearSaveLock();
      onError(message);
    },
    wpAllowedMimeTypes,
    multiple
  });
}
;
const {
  sideloadMedia: mediaSideload
} = unlock(external_wp_mediaUtils_namespaceObject.privateApis);
 const media_sideload = (mediaSideload);
var cjs = __webpack_require__(66);
var cjs_default = __webpack_require__.n(cjs);
;
function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}
function isPlainObject(o) {
  var ctor,prot;
  if (isObject(o) === false) return false;
  ctor = o.constructor;
  if (ctor === undefined) return true;
  prot = ctor.prototype;
  if (isObject(prot) === false) return false;
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }
  return true;
}
;
const {
  GlobalStylesContext,
  cleanEmptyObject
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
function mergeBaseAndUserConfigs(base, user) {
  return cjs_default()(base, user, {
    isMergeableObject: isPlainObject,
    customMerge: key => {
      if (key === 'backgroundImage') {
        return (baseConfig, userConfig) => userConfig;
      }
      return undefined;
    }
  });
}
function useGlobalStylesUserConfig() {
  const {
    globalStylesId,
    isReady,
    settings,
    styles,
    _links
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord,
      getEditedEntityRecord,
      hasFinishedResolution,
      canUser
    } = select(external_wp_coreData_namespaceObject.store);
    const _globalStylesId = select(external_wp_coreData_namespaceObject.store).__experimentalGetCurrentGlobalStylesId();
    let record;
    const userCanEditGlobalStyles = _globalStylesId ? canUser('update', {
      kind: 'root',
      name: 'globalStyles',
      id: _globalStylesId
    }) : null;
    if (_globalStylesId &&
    typeof userCanEditGlobalStyles === 'boolean') {
      if (userCanEditGlobalStyles) {
        record = getEditedEntityRecord('root', 'globalStyles', _globalStylesId);
      } else {
        record = getEntityRecord('root', 'globalStyles', _globalStylesId, {
          context: 'view'
        });
      }
    }
    let hasResolved = false;
    if (hasFinishedResolution('__experimentalGetCurrentGlobalStylesId')) {
      if (_globalStylesId) {
        hasResolved = userCanEditGlobalStyles ? hasFinishedResolution('getEditedEntityRecord', ['root', 'globalStyles', _globalStylesId]) : hasFinishedResolution('getEntityRecord', ['root', 'globalStyles', _globalStylesId, {
          context: 'view'
        }]);
      } else {
        hasResolved = true;
      }
    }
    return {
      globalStylesId: _globalStylesId,
      isReady: hasResolved,
      settings: record?.settings,
      styles: record?.styles,
      _links: record?._links
    };
  }, []);
  const {
    getEditedEntityRecord
  } = (0,external_wp_data_namespaceObject.useSelect)(external_wp_coreData_namespaceObject.store);
  const {
    editEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const config = (0,external_wp_element_namespaceObject.useMemo)(() => {
    return {
      settings: settings !== null && settings !== void 0 ? settings : {},
      styles: styles !== null && styles !== void 0 ? styles : {},
      _links: _links !== null && _links !== void 0 ? _links : {}
    };
  }, [settings, styles, _links]);
  const setConfig = (0,external_wp_element_namespaceObject.useCallback)(
  (callbackOrObject, options = {}) => {
    var _record$styles, _record$settings, _record$_links;
    const record = getEditedEntityRecord('root', 'globalStyles', globalStylesId);
    const currentConfig = {
      styles: (_record$styles = record?.styles) !== null && _record$styles !== void 0 ? _record$styles : {},
      settings: (_record$settings = record?.settings) !== null && _record$settings !== void 0 ? _record$settings : {},
      _links: (_record$_links = record?._links) !== null && _record$_links !== void 0 ? _record$_links : {}
    };
    const updatedConfig = typeof callbackOrObject === 'function' ? callbackOrObject(currentConfig) : callbackOrObject;
    editEntityRecord('root', 'globalStyles', globalStylesId, {
      styles: cleanEmptyObject(updatedConfig.styles) || {},
      settings: cleanEmptyObject(updatedConfig.settings) || {},
      _links: cleanEmptyObject(updatedConfig._links) || {}
    }, options);
  }, [globalStylesId, editEntityRecord, getEditedEntityRecord]);
  return [isReady, config, setConfig];
}
function useGlobalStylesBaseConfig() {
  const baseConfig = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_coreData_namespaceObject.store).__experimentalGetCurrentThemeBaseGlobalStyles(), []);
  return [!!baseConfig, baseConfig];
}
function useGlobalStylesContext() {
  const [isUserConfigReady, userConfig, setUserConfig] = useGlobalStylesUserConfig();
  const [isBaseConfigReady, baseConfig] = useGlobalStylesBaseConfig();
  const mergedConfig = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (!baseConfig || !userConfig) {
      return {};
    }
    return mergeBaseAndUserConfigs(baseConfig, userConfig);
  }, [userConfig, baseConfig]);
  const context = (0,external_wp_element_namespaceObject.useMemo)(() => {
    return {
      isReady: isUserConfigReady && isBaseConfigReady,
      user: userConfig,
      base: baseConfig,
      merged: mergedConfig,
      setUserConfig
    };
  }, [mergedConfig, userConfig, baseConfig, setUserConfig, isUserConfigReady, isBaseConfigReady]);
  return context;
}
function GlobalStylesProvider({
  children
}) {
  const context = useGlobalStylesContext();
  if (!context.isReady) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(GlobalStylesContext.Provider, {
    value: context,
    children: children
  });
}
;
const use_block_editor_settings_EMPTY_OBJECT = {};
function __experimentalReusableBlocksSelect(select) {
  const {
    RECEIVE_INTERMEDIATE_RESULTS
  } = unlock(external_wp_coreData_namespaceObject.privateApis);
  const {
    getEntityRecords
  } = select(external_wp_coreData_namespaceObject.store);
  return getEntityRecords('postType', 'wp_block', {
    per_page: -1,
    [RECEIVE_INTERMEDIATE_RESULTS]: true
  });
}
const BLOCK_EDITOR_SETTINGS = ['__experimentalBlockDirectory', '__experimentalDiscussionSettings', '__experimentalFeatures', '__experimentalGlobalStylesBaseStyles', 'alignWide', 'blockInspectorTabs', 'maxUploadFileSize', 'allowedMimeTypes', 'bodyPlaceholder', 'canLockBlocks', 'canUpdateBlockBindings', 'capabilities', 'clearBlockSelection', 'codeEditingEnabled', 'colors', 'disableCustomColors', 'disableCustomFontSizes', 'disableCustomSpacingSizes', 'disableCustomGradients', 'disableLayoutStyles', 'enableCustomLineHeight', 'enableCustomSpacing', 'enableCustomUnits', 'enableOpenverseMediaCategory', 'fontSizes', 'gradients', 'generateAnchors', 'onNavigateToEntityRecord', 'imageDefaultSize', 'imageDimensions', 'imageEditing', 'imageSizes', 'isPreviewMode', 'isRTL', 'locale', 'maxWidth', 'postContentAttributes', 'postsPerPage', 'readOnly', 'styles', 'titlePlaceholder', 'supportsLayout', 'widgetTypesToHideFromLegacyWidgetBlock', '__unstableHasCustomAppender', '__unstableResolvedAssets', '__unstableIsBlockBasedTheme'];
const {
  globalStylesDataKey,
  globalStylesLinksDataKey,
  selectBlockPatternsKey,
  reusableBlocksSelectKey,
  sectionRootClientIdKey
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
function useBlockEditorSettings(settings, postType, postId, renderingMode) {
  var _mergedGlobalStyles$s, _mergedGlobalStyles$_, _settings$__experimen, _settings$__experimen2;
  const isLargeViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('medium');
  const {
    allowRightClickOverrides,
    blockTypes,
    focusMode,
    hasFixedToolbar,
    isDistractionFree,
    keepCaretInsideBlock,
    hasUploadPermissions,
    hiddenBlockTypes,
    canUseUnfilteredHTML,
    userCanCreatePages,
    pageOnFront,
    pageForPosts,
    userPatternCategories,
    restBlockPatternCategories,
    sectionRootClientId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _canUser;
    const {
      canUser,
      getRawEntityRecord,
      getEntityRecord,
      getUserPatternCategories,
      getBlockPatternCategories
    } = select(external_wp_coreData_namespaceObject.store);
    const {
      get
    } = select(external_wp_preferences_namespaceObject.store);
    const {
      getBlockTypes
    } = select(external_wp_blocks_namespaceObject.store);
    const {
      getBlocksByName,
      getBlockAttributes
    } = select(external_wp_blockEditor_namespaceObject.store);
    const siteSettings = canUser('read', {
      kind: 'root',
      name: 'site'
    }) ? getEntityRecord('root', 'site') : undefined;
    function getSectionRootBlock() {
      var _getBlocksByName$find;
      if (renderingMode === 'template-locked') {
        var _getBlocksByName$;
        return (_getBlocksByName$ = getBlocksByName('core/post-content')?.[0]) !== null && _getBlocksByName$ !== void 0 ? _getBlocksByName$ : '';
      }
      return (_getBlocksByName$find = getBlocksByName('core/group').find(clientId => getBlockAttributes(clientId)?.tagName === 'main')) !== null && _getBlocksByName$find !== void 0 ? _getBlocksByName$find : '';
    }
    return {
      allowRightClickOverrides: get('core', 'allowRightClickOverrides'),
      blockTypes: getBlockTypes(),
      canUseUnfilteredHTML: getRawEntityRecord('postType', postType, postId)?._links?.hasOwnProperty('wp:action-unfiltered-html'),
      focusMode: get('core', 'focusMode'),
      hasFixedToolbar: get('core', 'fixedToolbar') || !isLargeViewport,
      hiddenBlockTypes: get('core', 'hiddenBlockTypes'),
      isDistractionFree: get('core', 'distractionFree'),
      keepCaretInsideBlock: get('core', 'keepCaretInsideBlock'),
      hasUploadPermissions: (_canUser = canUser('create', {
        kind: 'root',
        name: 'media'
      })) !== null && _canUser !== void 0 ? _canUser : true,
      userCanCreatePages: canUser('create', {
        kind: 'postType',
        name: 'page'
      }),
      pageOnFront: siteSettings?.page_on_front,
      pageForPosts: siteSettings?.page_for_posts,
      userPatternCategories: getUserPatternCategories(),
      restBlockPatternCategories: getBlockPatternCategories(),
      sectionRootClientId: getSectionRootBlock()
    };
  }, [postType, postId, isLargeViewport, renderingMode]);
  const {
    merged: mergedGlobalStyles
  } = useGlobalStylesContext();
  const globalStylesData = (_mergedGlobalStyles$s = mergedGlobalStyles.styles) !== null && _mergedGlobalStyles$s !== void 0 ? _mergedGlobalStyles$s : use_block_editor_settings_EMPTY_OBJECT;
  const globalStylesLinksData = (_mergedGlobalStyles$_ = mergedGlobalStyles._links) !== null && _mergedGlobalStyles$_ !== void 0 ? _mergedGlobalStyles$_ : use_block_editor_settings_EMPTY_OBJECT;
  const settingsBlockPatterns = (_settings$__experimen = settings.__experimentalAdditionalBlockPatterns) !== null && _settings$__experimen !== void 0 ? _settings$__experimen :
  settings.__experimentalBlockPatterns; 
  const settingsBlockPatternCategories = (_settings$__experimen2 = settings.__experimentalAdditionalBlockPatternCategories) !== null && _settings$__experimen2 !== void 0 ? _settings$__experimen2 :
  settings.__experimentalBlockPatternCategories; 
  const blockPatterns = (0,external_wp_element_namespaceObject.useMemo)(() => [...(settingsBlockPatterns || [])].filter(({
    postTypes
  }) => {
    return !postTypes || Array.isArray(postTypes) && postTypes.includes(postType);
  }), [settingsBlockPatterns, postType]);
  const blockPatternCategories = (0,external_wp_element_namespaceObject.useMemo)(() => [...(settingsBlockPatternCategories || []), ...(restBlockPatternCategories || [])].filter((x, index, arr) => index === arr.findIndex(y => x.name === y.name)), [settingsBlockPatternCategories, restBlockPatternCategories]);
  const {
    undo,
    setIsInserterOpened
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    saveEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const createPageEntity = (0,external_wp_element_namespaceObject.useCallback)(options => {
    if (!userCanCreatePages) {
      return Promise.reject({
        message: (0,external_wp_i18n_namespaceObject.__)('You do not have permission to create Pages.')
      });
    }
    return saveEntityRecord('postType', 'page', options);
  }, [saveEntityRecord, userCanCreatePages]);
  const allowedBlockTypes = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (hiddenBlockTypes && hiddenBlockTypes.length > 0) {
      const defaultAllowedBlockTypes = true === settings.allowedBlockTypes ? blockTypes.map(({
        name
      }) => name) : settings.allowedBlockTypes || [];
      return defaultAllowedBlockTypes.filter(type => !hiddenBlockTypes.includes(type));
    }
    return settings.allowedBlockTypes;
  }, [settings.allowedBlockTypes, hiddenBlockTypes, blockTypes]);
  const forceDisableFocusMode = settings.focusMode === false;
  return (0,external_wp_element_namespaceObject.useMemo)(() => {
    const blockEditorSettings = {
      ...Object.fromEntries(Object.entries(settings).filter(([key]) => BLOCK_EDITOR_SETTINGS.includes(key))),
      [globalStylesDataKey]: globalStylesData,
      [globalStylesLinksDataKey]: globalStylesLinksData,
      allowedBlockTypes,
      allowRightClickOverrides,
      focusMode: focusMode && !forceDisableFocusMode,
      hasFixedToolbar,
      isDistractionFree,
      keepCaretInsideBlock,
      mediaUpload: hasUploadPermissions ? mediaUpload : undefined,
      mediaSideload: hasUploadPermissions ? media_sideload : undefined,
      __experimentalBlockPatterns: blockPatterns,
      [selectBlockPatternsKey]: select => {
        const {
          hasFinishedResolution,
          getBlockPatternsForPostType
        } = unlock(select(external_wp_coreData_namespaceObject.store));
        const patterns = getBlockPatternsForPostType(postType);
        return hasFinishedResolution('getBlockPatterns') ? patterns : undefined;
      },
      [reusableBlocksSelectKey]: __experimentalReusableBlocksSelect,
      __experimentalBlockPatternCategories: blockPatternCategories,
      __experimentalUserPatternCategories: userPatternCategories,
      __experimentalFetchLinkSuggestions: (search, searchOptions) => (0,external_wp_coreData_namespaceObject.__experimentalFetchLinkSuggestions)(search, searchOptions, settings),
      inserterMediaCategories: media_categories,
      __experimentalFetchRichUrlData: external_wp_coreData_namespaceObject.__experimentalFetchUrlData,
      __experimentalCanUserUseUnfilteredHTML: canUseUnfilteredHTML,
      __experimentalUndo: undo,
      outlineMode: !isDistractionFree && postType === 'wp_template',
      __experimentalCreatePageEntity: createPageEntity,
      __experimentalUserCanCreatePages: userCanCreatePages,
      pageOnFront,
      pageForPosts,
      __experimentalPreferPatternsOnRoot: postType === 'wp_template',
      templateLock: postType === 'wp_navigation' ? 'insert' : settings.templateLock,
      template: postType === 'wp_navigation' ? [['core/navigation', {}, []]] : settings.template,
      __experimentalSetIsInserterOpened: setIsInserterOpened,
      [sectionRootClientIdKey]: sectionRootClientId,
      editorTool: renderingMode === 'post-only' && postType !== 'wp_template' ? 'edit' : undefined
    };
    return blockEditorSettings;
  }, [allowedBlockTypes, allowRightClickOverrides, focusMode, forceDisableFocusMode, hasFixedToolbar, isDistractionFree, keepCaretInsideBlock, settings, hasUploadPermissions, userPatternCategories, blockPatterns, blockPatternCategories, canUseUnfilteredHTML, undo, createPageEntity, userCanCreatePages, pageOnFront, pageForPosts, postType, setIsInserterOpened, sectionRootClientId, globalStylesData, globalStylesLinksData, renderingMode]);
}
 const use_block_editor_settings = (useBlockEditorSettings);
;
const POST_CONTENT_BLOCK_TYPES = ['core/post-title', 'core/post-featured-image', 'core/post-content'];
function usePostContentBlocks() {
  const contentOnlyBlockTypes = (0,external_wp_element_namespaceObject.useMemo)(() => [...(0,external_wp_hooks_namespaceObject.applyFilters)('editor.postContentBlockTypes', POST_CONTENT_BLOCK_TYPES)], []);
  const contentOnlyIds = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getPostBlocksByName
    } = unlock(select(store_store));
    return getPostBlocksByName(contentOnlyBlockTypes);
  }, [contentOnlyBlockTypes]);
  return contentOnlyIds;
}
;
function DisableNonPageContentBlocks() {
  const contentOnlyIds = usePostContentBlocks();
  const {
    templateParts,
    isNavigationMode
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getBlocksByName,
      isNavigationMode: _isNavigationMode
    } = select(external_wp_blockEditor_namespaceObject.store);
    return {
      templateParts: getBlocksByName('core/template-part'),
      isNavigationMode: _isNavigationMode()
    };
  }, []);
  const disabledIds = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getBlockOrder
    } = select(external_wp_blockEditor_namespaceObject.store);
    return templateParts.flatMap(clientId => getBlockOrder(clientId));
  }, [templateParts]);
  const registry = (0,external_wp_data_namespaceObject.useRegistry)();
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    const {
      setBlockEditingMode,
      unsetBlockEditingMode
    } = registry.dispatch(external_wp_blockEditor_namespaceObject.store);
    setBlockEditingMode('', 'disabled');
    return () => {
      unsetBlockEditingMode('');
    };
  }, [registry]);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    const {
      setBlockEditingMode,
      unsetBlockEditingMode
    } = registry.dispatch(external_wp_blockEditor_namespaceObject.store);
    registry.batch(() => {
      for (const clientId of contentOnlyIds) {
        setBlockEditingMode(clientId, 'contentOnly');
      }
    });
    return () => {
      registry.batch(() => {
        for (const clientId of contentOnlyIds) {
          unsetBlockEditingMode(clientId);
        }
      });
    };
  }, [contentOnlyIds, registry]);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    const {
      setBlockEditingMode,
      unsetBlockEditingMode
    } = registry.dispatch(external_wp_blockEditor_namespaceObject.store);
    registry.batch(() => {
      if (!isNavigationMode) {
        for (const clientId of templateParts) {
          setBlockEditingMode(clientId, 'contentOnly');
        }
      }
    });
    return () => {
      registry.batch(() => {
        if (!isNavigationMode) {
          for (const clientId of templateParts) {
            unsetBlockEditingMode(clientId);
          }
        }
      });
    };
  }, [templateParts, isNavigationMode, registry]);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    const {
      setBlockEditingMode,
      unsetBlockEditingMode
    } = registry.dispatch(external_wp_blockEditor_namespaceObject.store);
    registry.batch(() => {
      for (const clientId of disabledIds) {
        setBlockEditingMode(clientId, 'disabled');
      }
    });
    return () => {
      registry.batch(() => {
        for (const clientId of disabledIds) {
          unsetBlockEditingMode(clientId);
        }
      });
    };
  }, [disabledIds, registry]);
  return null;
}
;
function NavigationBlockEditingMode() {
  const blockClientId = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_blockEditor_namespaceObject.store).getBlockOrder()?.[0], []);
  const {
    setBlockEditingMode,
    unsetBlockEditingMode
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (!blockClientId) {
      return;
    }
    setBlockEditingMode(blockClientId, 'contentOnly');
    return () => {
      unsetBlockEditingMode(blockClientId);
    };
  }, [blockClientId, unsetBlockEditingMode, setBlockEditingMode]);
}
;
const POST_TYPES_ALLOWING_POST_CONTENT_TEMPLATE_PART = ['wp_block', 'wp_template', 'wp_template_part'];
function useHideBlocksFromInserter(postType, mode) {
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    (0,external_wp_hooks_namespaceObject.addFilter)('blockEditor.__unstableCanInsertBlockType', 'removeTemplatePartsFromInserter', (canInsert, blockType) => {
      if (!POST_TYPES_ALLOWING_POST_CONTENT_TEMPLATE_PART.includes(postType) && blockType.name === 'core/template-part' && mode === 'post-only') {
        return false;
      }
      return canInsert;
    });
    (0,external_wp_hooks_namespaceObject.addFilter)('blockEditor.__unstableCanInsertBlockType', 'removePostContentFromInserter', (canInsert, blockType, rootClientId, {
      getBlockParentsByBlockName
    }) => {
      if (!POST_TYPES_ALLOWING_POST_CONTENT_TEMPLATE_PART.includes(postType) && blockType.name === 'core/post-content') {
        return getBlockParentsByBlockName(rootClientId, 'core/query').length > 0;
      }
      return canInsert;
    });
    return () => {
      (0,external_wp_hooks_namespaceObject.removeFilter)('blockEditor.__unstableCanInsertBlockType', 'removeTemplatePartsFromInserter');
      (0,external_wp_hooks_namespaceObject.removeFilter)('blockEditor.__unstableCanInsertBlockType', 'removePostContentFromInserter');
    };
  }, [postType, mode]);
}
;
const keyboard = (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "m16 15.5h-8v-1.5h8zm-7.5-2.5h-2v-2h2zm3 0h-2v-2h2zm3 0h-2v-2h2zm3 0h-2v-2h2zm-9-3h-2v-2h2zm3 0h-2v-2h2zm3 0h-2v-2h2zm3 0h-2v-2h2z"
  }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "m18.5 6.5h-13a.5.5 0 0 0 -.5.5v9.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9.5a.5.5 0 0 0 -.5-.5zm-13-1.5h13a2 2 0 0 1 2 2v9.5a2 2 0 0 1 -2 2h-13a2 2 0 0 1 -2-2v-9.5a2 2 0 0 1 2-2z"
  })]
});
 const library_keyboard = (keyboard);
;
const listView = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M3 6h11v1.5H3V6Zm3.5 5.5h11V13h-11v-1.5ZM21 17H10v1.5h11V17Z"
  })
});
 const list_view = (listView);
;
const code = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M20.8 10.7l-4.3-4.3-1.1 1.1 4.3 4.3c.1.1.1.3 0 .4l-4.3 4.3 1.1 1.1 4.3-4.3c.7-.8.7-1.9 0-2.6zM4.2 11.8l4.3-4.3-1-1-4.3 4.3c-.7.7-.7 1.8 0 2.5l4.3 4.3 1.1-1.1-4.3-4.3c-.2-.1-.2-.3-.1-.4z"
  })
});
 const library_code = (code);
;
const drawerLeft = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  width: "24",
  height: "24",
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM8.5 18.5H6c-.3 0-.5-.2-.5-.5V6c0-.3.2-.5.5-.5h2.5v13zm10-.5c0 .3-.2.5-.5.5h-8v-13h8c.3 0 .5.2.5.5v12z"
  })
});
 const drawer_left = (drawerLeft);
;
const drawerRight = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  width: "24",
  height: "24",
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-4 14.5H6c-.3 0-.5-.2-.5-.5V6c0-.3.2-.5.5-.5h8v13zm4.5-.5c0 .3-.2.5-.5.5h-2.5v-13H18c.3 0 .5.2.5.5v12z"
  })
});
 const drawer_right = (drawerRight);
;
const blockDefault = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M19 8h-1V6h-5v2h-2V6H6v2H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm.5 10c0 .3-.2.5-.5.5H5c-.3 0-.5-.2-.5-.5v-8c0-.3.2-.5.5-.5h14c.3 0 .5.2.5.5v8z"
  })
});
 const block_default = (blockDefault);
;
const formatListBullets = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M11.1 15.8H20v-1.5h-8.9v1.5zm0-8.6v1.5H20V7.2h-8.9zM6 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
  })
});
 const format_list_bullets = (formatListBullets);
;
const pencil = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "m19 7-3-3-8.5 8.5-1 4 4-1L19 7Zm-7 11.5H5V20h7v-1.5Z"
  })
});
 const library_pencil = (pencil);
;
 const library_edit = (library_pencil);
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
const page = (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M15.5 7.5h-7V9h7V7.5Zm-7 3.5h7v1.5h-7V11Zm7 3.5h-7V16h7v-1.5Z"
  }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M17 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM7 5.5h10a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5Z"
  })]
});
 const library_page = (page);
;
const rotateRight = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M15.1 4.8l-3-2.5V4c-4.4 0-8 3.6-8 8 0 3.7 2.5 6.9 6 7.7.3.1.6.1 1 .2l.2-1.5c-.4 0-.7-.1-1.1-.2l-.1.2v-.2c-2.6-.8-4.5-3.3-4.5-6.2 0-3.6 2.9-6.5 6.5-6.5v1.8l3-2.5zM20 11c-.2-1.4-.7-2.7-1.6-3.8l-1.2.8c.7.9 1.1 2 1.3 3.1L20 11zm-1.5 1.8c-.1.5-.2 1.1-.4 1.6s-.5 1-.8 1.5l1.2.9c.4-.5.8-1.1 1-1.8s.5-1.3.5-2l-1.5-.2zm-5.6 5.6l.2 1.5c1.4-.2 2.7-.7 3.8-1.6l-.9-1.1c-.9.7-2 1.1-3.1 1.2z"
  })
});
 const rotate_right = (rotateRight);
;
const rotateLeft = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M12 4V2.2L9 4.8l3 2.5V5.5c3.6 0 6.5 2.9 6.5 6.5 0 2.9-1.9 5.3-4.5 6.2v.2l-.1-.2c-.4.1-.7.2-1.1.2l.2 1.5c.3 0 .6-.1 1-.2 3.5-.9 6-4 6-7.7 0-4.4-3.6-8-8-8zm-7.9 7l1.5.2c.1-1.2.5-2.3 1.2-3.2l-1.1-.9C4.8 8.2 4.3 9.6 4.1 11zm1.5 1.8l-1.5.2c.1.7.3 1.4.5 2 .3.7.6 1.3 1 1.8l1.2-.8c-.3-.5-.6-1-.8-1.5s-.4-1.1-.4-1.7zm1.5 5.5c1.1.9 2.4 1.4 3.8 1.6l.2-1.5c-1.1-.1-2.2-.5-3.1-1.2l-.9 1.1z"
  })
});
 const rotate_left = (rotateLeft);
;
const external_wp_commands_namespaceObject = window["wp"]["commands"];
;
const starFilled = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M11.776 4.454a.25.25 0 01.448 0l2.069 4.192a.25.25 0 00.188.137l4.626.672a.25.25 0 01.139.426l-3.348 3.263a.25.25 0 00-.072.222l.79 4.607a.25.25 0 01-.362.263l-4.138-2.175a.25.25 0 00-.232 0l-4.138 2.175a.25.25 0 01-.363-.263l.79-4.607a.25.25 0 00-.071-.222L4.754 9.881a.25.25 0 01.139-.426l4.626-.672a.25.25 0 00.188-.137l2.069-4.192z"
  })
});
 const star_filled = (starFilled);
;
const starEmpty = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    d: "M9.706 8.646a.25.25 0 01-.188.137l-4.626.672a.25.25 0 00-.139.427l3.348 3.262a.25.25 0 01.072.222l-.79 4.607a.25.25 0 00.362.264l4.138-2.176a.25.25 0 01.233 0l4.137 2.175a.25.25 0 00.363-.263l-.79-4.607a.25.25 0 01.072-.222l3.347-3.262a.25.25 0 00-.139-.427l-4.626-.672a.25.25 0 01-.188-.137l-2.069-4.192a.25.25 0 00-.448 0L9.706 8.646zM12 7.39l-.948 1.921a1.75 1.75 0 01-1.317.957l-2.12.308 1.534 1.495c.412.402.6.982.503 1.55l-.362 2.11 1.896-.997a1.75 1.75 0 011.629 0l1.895.997-.362-2.11a1.75 1.75 0 01.504-1.55l1.533-1.495-2.12-.308a1.75 1.75 0 01-1.317-.957L12 7.39z",
    clipRule: "evenodd"
  })
});
 const star_empty = (starEmpty);
;
const external_wp_viewport_namespaceObject = window["wp"]["viewport"];
;
const external_wp_plugins_namespaceObject = window["wp"]["plugins"];
;
function normalizeComplementaryAreaScope(scope) {
  if (['core/edit-post', 'core/edit-site'].includes(scope)) {
    external_wp_deprecated_default()(`${scope} interface scope`, {
      alternative: 'core interface scope',
      hint: 'core/edit-post and core/edit-site are merging.',
      version: '6.6'
    });
    return 'core';
  }
  return scope;
}
function normalizeComplementaryAreaName(scope, name) {
  if (scope === 'core' && name === 'edit-site/template') {
    external_wp_deprecated_default()(`edit-site/template sidebar`, {
      alternative: 'edit-post/document',
      version: '6.6'
    });
    return 'edit-post/document';
  }
  if (scope === 'core' && name === 'edit-site/block-inspector') {
    external_wp_deprecated_default()(`edit-site/block-inspector sidebar`, {
      alternative: 'edit-post/block',
      version: '6.6'
    });
    return 'edit-post/block';
  }
  return name;
}
;
const setDefaultComplementaryArea = (scope, area) => {
  scope = normalizeComplementaryAreaScope(scope);
  area = normalizeComplementaryAreaName(scope, area);
  return {
    type: 'SET_DEFAULT_COMPLEMENTARY_AREA',
    scope,
    area
  };
};
const enableComplementaryArea = (scope, area) => ({
  registry,
  dispatch
}) => {
  if (!area) {
    return;
  }
  scope = normalizeComplementaryAreaScope(scope);
  area = normalizeComplementaryAreaName(scope, area);
  const isComplementaryAreaVisible = registry.select(external_wp_preferences_namespaceObject.store).get(scope, 'isComplementaryAreaVisible');
  if (!isComplementaryAreaVisible) {
    registry.dispatch(external_wp_preferences_namespaceObject.store).set(scope, 'isComplementaryAreaVisible', true);
  }
  dispatch({
    type: 'ENABLE_COMPLEMENTARY_AREA',
    scope,
    area
  });
};
const disableComplementaryArea = scope => ({
  registry
}) => {
  scope = normalizeComplementaryAreaScope(scope);
  const isComplementaryAreaVisible = registry.select(external_wp_preferences_namespaceObject.store).get(scope, 'isComplementaryAreaVisible');
  if (isComplementaryAreaVisible) {
    registry.dispatch(external_wp_preferences_namespaceObject.store).set(scope, 'isComplementaryAreaVisible', false);
  }
};
const pinItem = (scope, item) => ({
  registry
}) => {
  if (!item) {
    return;
  }
  scope = normalizeComplementaryAreaScope(scope);
  item = normalizeComplementaryAreaName(scope, item);
  const pinnedItems = registry.select(external_wp_preferences_namespaceObject.store).get(scope, 'pinnedItems');
  if (pinnedItems?.[item] === true) {
    return;
  }
  registry.dispatch(external_wp_preferences_namespaceObject.store).set(scope, 'pinnedItems', {
    ...pinnedItems,
    [item]: true
  });
};
const unpinItem = (scope, item) => ({
  registry
}) => {
  if (!item) {
    return;
  }
  scope = normalizeComplementaryAreaScope(scope);
  item = normalizeComplementaryAreaName(scope, item);
  const pinnedItems = registry.select(external_wp_preferences_namespaceObject.store).get(scope, 'pinnedItems');
  registry.dispatch(external_wp_preferences_namespaceObject.store).set(scope, 'pinnedItems', {
    ...pinnedItems,
    [item]: false
  });
};
function toggleFeature(scope, featureName) {
  return function ({
    registry
  }) {
    external_wp_deprecated_default()(`dispatch( 'core/interface' ).toggleFeature`, {
      since: '6.0',
      alternative: `dispatch( 'core/preferences' ).toggle`
    });
    registry.dispatch(external_wp_preferences_namespaceObject.store).toggle(scope, featureName);
  };
}
function setFeatureValue(scope, featureName, value) {
  return function ({
    registry
  }) {
    external_wp_deprecated_default()(`dispatch( 'core/interface' ).setFeatureValue`, {
      since: '6.0',
      alternative: `dispatch( 'core/preferences' ).set`
    });
    registry.dispatch(external_wp_preferences_namespaceObject.store).set(scope, featureName, !!value);
  };
}
function setFeatureDefaults(scope, defaults) {
  return function ({
    registry
  }) {
    external_wp_deprecated_default()(`dispatch( 'core/interface' ).setFeatureDefaults`, {
      since: '6.0',
      alternative: `dispatch( 'core/preferences' ).setDefaults`
    });
    registry.dispatch(external_wp_preferences_namespaceObject.store).setDefaults(scope, defaults);
  };
}
function openModal(name) {
  return {
    type: 'OPEN_MODAL',
    name
  };
}
function closeModal() {
  return {
    type: 'CLOSE_MODAL'
  };
}
;
const getActiveComplementaryArea = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, scope) => {
  scope = normalizeComplementaryAreaScope(scope);
  const isComplementaryAreaVisible = select(external_wp_preferences_namespaceObject.store).get(scope, 'isComplementaryAreaVisible');
  if (isComplementaryAreaVisible === undefined) {
    return undefined;
  }
  if (isComplementaryAreaVisible === false) {
    return null;
  }
  return state?.complementaryAreas?.[scope];
});
const isComplementaryAreaLoading = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, scope) => {
  scope = normalizeComplementaryAreaScope(scope);
  const isVisible = select(external_wp_preferences_namespaceObject.store).get(scope, 'isComplementaryAreaVisible');
  const identifier = state?.complementaryAreas?.[scope];
  return isVisible && identifier === undefined;
});
const isItemPinned = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, scope, item) => {
  var _pinnedItems$item;
  scope = normalizeComplementaryAreaScope(scope);
  item = normalizeComplementaryAreaName(scope, item);
  const pinnedItems = select(external_wp_preferences_namespaceObject.store).get(scope, 'pinnedItems');
  return (_pinnedItems$item = pinnedItems?.[item]) !== null && _pinnedItems$item !== void 0 ? _pinnedItems$item : true;
});
const isFeatureActive = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, scope, featureName) => {
  external_wp_deprecated_default()(`select( 'core/interface' ).isFeatureActive( scope, featureName )`, {
    since: '6.0',
    alternative: `select( 'core/preferences' ).get( scope, featureName )`
  });
  return !!select(external_wp_preferences_namespaceObject.store).get(scope, featureName);
});
function isModalActive(state, modalName) {
  return state.activeModal === modalName;
}
;
function complementaryAreas(state = {}, action) {
  switch (action.type) {
    case 'SET_DEFAULT_COMPLEMENTARY_AREA':
      {
        const {
          scope,
          area
        } = action;
        if (state[scope]) {
          return state;
        }
        return {
          ...state,
          [scope]: area
        };
      }
    case 'ENABLE_COMPLEMENTARY_AREA':
      {
        const {
          scope,
          area
        } = action;
        return {
          ...state,
          [scope]: area
        };
      }
  }
  return state;
}
function activeModal(state = null, action) {
  switch (action.type) {
    case 'OPEN_MODAL':
      return action.name;
    case 'CLOSE_MODAL':
      return null;
  }
  return state;
}
 const build_module_store_reducer = ((0,external_wp_data_namespaceObject.combineReducers)({
  complementaryAreas,
  activeModal
}));
;
const constants_STORE_NAME = 'core/interface';
;
const store = (0,external_wp_data_namespaceObject.createReduxStore)(constants_STORE_NAME, {
  reducer: build_module_store_reducer,
  actions: store_actions_namespaceObject,
  selectors: store_selectors_namespaceObject
});
(0,external_wp_data_namespaceObject.register)(store);
;
function roleSupportsCheckedState(role) {
  return ['checkbox', 'option', 'radio', 'switch', 'menuitemcheckbox', 'menuitemradio', 'treeitem'].includes(role);
}
function ComplementaryAreaToggle({
  as = external_wp_components_namespaceObject.Button,
  scope,
  identifier: identifierProp,
  icon: iconProp,
  selectedIcon,
  name,
  shortcut,
  ...props
}) {
  const ComponentToUse = as;
  const context = (0,external_wp_plugins_namespaceObject.usePluginContext)();
  const icon = iconProp || context.icon;
  const identifier = identifierProp || `${context.name}/${name}`;
  const isSelected = (0,external_wp_data_namespaceObject.useSelect)(select => select(store).getActiveComplementaryArea(scope) === identifier, [identifier, scope]);
  const {
    enableComplementaryArea,
    disableComplementaryArea
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(ComponentToUse, {
    icon: selectedIcon && isSelected ? selectedIcon : icon,
    "aria-controls": identifier.replace('/', ':')
    ,
    "aria-checked": roleSupportsCheckedState(props.role) ? isSelected : undefined,
    onClick: () => {
      if (isSelected) {
        disableComplementaryArea(scope);
      } else {
        enableComplementaryArea(scope, identifier);
      }
    },
    shortcut: shortcut,
    ...props
  });
}
;
const ComplementaryAreaHeader = ({
  children,
  className,
  toggleButtonProps
}) => {
  const toggleButton = (0,external_ReactJSXRuntime_namespaceObject.jsx)(ComplementaryAreaToggle, {
    icon: close_small,
    ...toggleButtonProps
  });
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: dist_clsx('components-panel__header', 'interface-complementary-area-header', className),
    tabIndex: -1,
    children: [children, toggleButton]
  });
};
 const complementary_area_header = (ComplementaryAreaHeader);
;
const action_item_noop = () => {};
function ActionItemSlot({
  name,
  as: Component = external_wp_components_namespaceObject.MenuGroup,
  fillProps = {},
  bubblesVirtually,
  ...props
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Slot, {
    name: name,
    bubblesVirtually: bubblesVirtually,
    fillProps: fillProps,
    children: fills => {
      if (!external_wp_element_namespaceObject.Children.toArray(fills).length) {
        return null;
      }
      const initializedByPlugins = [];
      external_wp_element_namespaceObject.Children.forEach(fills, ({
        props: {
          __unstableExplicitMenuItem,
          __unstableTarget
        }
      }) => {
        if (__unstableTarget && __unstableExplicitMenuItem) {
          initializedByPlugins.push(__unstableTarget);
        }
      });
      const children = external_wp_element_namespaceObject.Children.map(fills, child => {
        if (!child.props.__unstableExplicitMenuItem && initializedByPlugins.includes(child.props.__unstableTarget)) {
          return null;
        }
        return child;
      });
      return (0,external_ReactJSXRuntime_namespaceObject.jsx)(Component, {
        ...props,
        children: children
      });
    }
  });
}
function ActionItem({
  name,
  as: Component = external_wp_components_namespaceObject.Button,
  onClick,
  ...props
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Fill, {
    name: name,
    children: ({
      onClick: fpOnClick
    }) => {
      return (0,external_ReactJSXRuntime_namespaceObject.jsx)(Component, {
        onClick: onClick || fpOnClick ? (...args) => {
          (onClick || action_item_noop)(...args);
          (fpOnClick || action_item_noop)(...args);
        } : undefined,
        ...props
      });
    }
  });
}
ActionItem.Slot = ActionItemSlot;
 const action_item = (ActionItem);
;
const PluginsMenuItem = ({
  __unstableExplicitMenuItem,
  __unstableTarget,
  ...restProps
}) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
  ...restProps
});
function ComplementaryAreaMoreMenuItem({
  scope,
  target,
  __unstableExplicitMenuItem,
  ...props
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(ComplementaryAreaToggle, {
    as: toggleProps => {
      return (0,external_ReactJSXRuntime_namespaceObject.jsx)(action_item, {
        __unstableExplicitMenuItem: __unstableExplicitMenuItem,
        __unstableTarget: `${scope}/${target}`,
        as: PluginsMenuItem,
        name: `${scope}/plugin-more-menu`,
        ...toggleProps
      });
    },
    role: "menuitemcheckbox",
    selectedIcon: library_check,
    name: target,
    scope: scope,
    ...props
  });
}
;
function PinnedItems({
  scope,
  ...props
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Fill, {
    name: `PinnedItems/${scope}`,
    ...props
  });
}
function PinnedItemsSlot({
  scope,
  className,
  ...props
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Slot, {
    name: `PinnedItems/${scope}`,
    ...props,
    children: fills => fills?.length > 0 && (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: dist_clsx(className, 'interface-pinned-items'),
      children: fills
    })
  });
}
PinnedItems.Slot = PinnedItemsSlot;
 const pinned_items = (PinnedItems);
;
const ANIMATION_DURATION = 0.3;
function ComplementaryAreaSlot({
  scope,
  ...props
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Slot, {
    name: `ComplementaryArea/${scope}`,
    ...props
  });
}
const SIDEBAR_WIDTH = 280;
const variants = {
  open: {
    width: SIDEBAR_WIDTH
  },
  closed: {
    width: 0
  },
  mobileOpen: {
    width: '100vw'
  }
};
function ComplementaryAreaFill({
  activeArea,
  isActive,
  scope,
  children,
  className,
  id
}) {
  const disableMotion = (0,external_wp_compose_namespaceObject.useReducedMotion)();
  const isMobileViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('medium', '<');
  const previousActiveArea = (0,external_wp_compose_namespaceObject.usePrevious)(activeArea);
  const previousIsActive = (0,external_wp_compose_namespaceObject.usePrevious)(isActive);
  const [, setState] = (0,external_wp_element_namespaceObject.useState)({});
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    setState({});
  }, [isActive]);
  const transition = {
    type: 'tween',
    duration: disableMotion || isMobileViewport || !!previousActiveArea && !!activeArea && activeArea !== previousActiveArea ? 0 : ANIMATION_DURATION,
    ease: [0.6, 0, 0.4, 1]
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Fill, {
    name: `ComplementaryArea/${scope}`,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__unstableAnimatePresence, {
      initial: false,
      children: (previousIsActive || isActive) && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__unstableMotion.div, {
        variants: variants,
        initial: "closed",
        animate: isMobileViewport ? 'mobileOpen' : 'open',
        exit: "closed",
        transition: transition,
        className: "interface-complementary-area__fill",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          id: id,
          className: className,
          style: {
            width: isMobileViewport ? '100vw' : SIDEBAR_WIDTH
          },
          children: children
        })
      })
    })
  });
}
function useAdjustComplementaryListener(scope, identifier, activeArea, isActive, isSmall) {
  const previousIsSmallRef = (0,external_wp_element_namespaceObject.useRef)(false);
  const shouldOpenWhenNotSmallRef = (0,external_wp_element_namespaceObject.useRef)(false);
  const {
    enableComplementaryArea,
    disableComplementaryArea
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (isActive && isSmall && !previousIsSmallRef.current) {
      disableComplementaryArea(scope);
      shouldOpenWhenNotSmallRef.current = true;
    } else if (
    shouldOpenWhenNotSmallRef.current && !isSmall && previousIsSmallRef.current) {
      shouldOpenWhenNotSmallRef.current = false;
      enableComplementaryArea(scope, identifier);
    } else if (
    shouldOpenWhenNotSmallRef.current && activeArea && activeArea !== identifier) {
      shouldOpenWhenNotSmallRef.current = false;
    }
    if (isSmall !== previousIsSmallRef.current) {
      previousIsSmallRef.current = isSmall;
    }
  }, [isActive, isSmall, scope, identifier, activeArea, disableComplementaryArea, enableComplementaryArea]);
}
function ComplementaryArea({
  children,
  className,
  closeLabel = (0,external_wp_i18n_namespaceObject.__)('Close plugin'),
  identifier: identifierProp,
  header,
  headerClassName,
  icon: iconProp,
  isPinnable = true,
  panelClassName,
  scope,
  name,
  title,
  toggleShortcut,
  isActiveByDefault
}) {
  const context = (0,external_wp_plugins_namespaceObject.usePluginContext)();
  const icon = iconProp || context.icon;
  const identifier = identifierProp || `${context.name}/${name}`;
  const [isReady, setIsReady] = (0,external_wp_element_namespaceObject.useState)(false);
  const {
    isLoading,
    isActive,
    isPinned,
    activeArea,
    isSmall,
    isLarge,
    showIconLabels
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getActiveComplementaryArea,
      isComplementaryAreaLoading,
      isItemPinned
    } = select(store);
    const {
      get
    } = select(external_wp_preferences_namespaceObject.store);
    const _activeArea = getActiveComplementaryArea(scope);
    return {
      isLoading: isComplementaryAreaLoading(scope),
      isActive: _activeArea === identifier,
      isPinned: isItemPinned(scope, identifier),
      activeArea: _activeArea,
      isSmall: select(external_wp_viewport_namespaceObject.store).isViewportMatch('< medium'),
      isLarge: select(external_wp_viewport_namespaceObject.store).isViewportMatch('large'),
      showIconLabels: get('core', 'showIconLabels')
    };
  }, [identifier, scope]);
  const isMobileViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('medium', '<');
  useAdjustComplementaryListener(scope, identifier, activeArea, isActive, isSmall);
  const {
    enableComplementaryArea,
    disableComplementaryArea,
    pinItem,
    unpinItem
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (isActiveByDefault && activeArea === undefined && !isSmall) {
      enableComplementaryArea(scope, identifier);
    } else if (activeArea === undefined && isSmall) {
      disableComplementaryArea(scope, identifier);
    }
    setIsReady(true);
  }, [activeArea, isActiveByDefault, scope, identifier, isSmall, enableComplementaryArea, disableComplementaryArea]);
  if (!isReady) {
    return;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [isPinnable && (0,external_ReactJSXRuntime_namespaceObject.jsx)(pinned_items, {
      scope: scope,
      children: isPinned && (0,external_ReactJSXRuntime_namespaceObject.jsx)(ComplementaryAreaToggle, {
        scope: scope,
        identifier: identifier,
        isPressed: isActive && (!showIconLabels || isLarge),
        "aria-expanded": isActive,
        "aria-disabled": isLoading,
        label: title,
        icon: showIconLabels ? library_check : icon,
        showTooltip: !showIconLabels,
        variant: showIconLabels ? 'tertiary' : undefined,
        size: "compact",
        shortcut: toggleShortcut
      })
    }), name && isPinnable && (0,external_ReactJSXRuntime_namespaceObject.jsx)(ComplementaryAreaMoreMenuItem, {
      target: name,
      scope: scope,
      icon: icon,
      children: title
    }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(ComplementaryAreaFill, {
      activeArea: activeArea,
      isActive: isActive,
      className: dist_clsx('interface-complementary-area', className),
      scope: scope,
      id: identifier.replace('/', ':'),
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(complementary_area_header, {
        className: headerClassName,
        closeLabel: closeLabel,
        onClose: () => disableComplementaryArea(scope),
        toggleButtonProps: {
          label: closeLabel,
          size: 'compact',
          shortcut: toggleShortcut,
          scope,
          identifier
        },
        children: header || (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("h2", {
            className: "interface-complementary-area-header__title",
            children: title
          }), isPinnable && !isMobileViewport && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            className: "interface-complementary-area__pin-unpin-item",
            icon: isPinned ? star_filled : star_empty,
            label: isPinned ? (0,external_wp_i18n_namespaceObject.__)('Unpin from toolbar') : (0,external_wp_i18n_namespaceObject.__)('Pin to toolbar'),
            onClick: () => (isPinned ? unpinItem : pinItem)(scope, identifier),
            isPressed: isPinned,
            "aria-expanded": isPinned,
            size: "compact"
          })]
        })
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Panel, {
        className: panelClassName,
        children: children
      })]
    })]
  });
}
ComplementaryArea.Slot = ComplementaryAreaSlot;
 const complementary_area = (ComplementaryArea);
;
const FullscreenMode = ({
  isActive
}) => {
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    let isSticky = false;
    if (document.body.classList.contains('sticky-menu')) {
      isSticky = true;
      document.body.classList.remove('sticky-menu');
    }
    return () => {
      if (isSticky) {
        document.body.classList.add('sticky-menu');
      }
    };
  }, []);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (isActive) {
      document.body.classList.add('is-fullscreen-mode');
    } else {
      document.body.classList.remove('is-fullscreen-mode');
    }
    return () => {
      if (isActive) {
        document.body.classList.remove('is-fullscreen-mode');
      }
    };
  }, [isActive]);
  return null;
};
 const fullscreen_mode = (FullscreenMode);
;
const NavigableRegion = (0,external_wp_element_namespaceObject.forwardRef)(({
  children,
  className,
  ariaLabel,
  as: Tag = 'div',
  ...props
}, ref) => {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(Tag, {
    ref: ref,
    className: dist_clsx('interface-navigable-region', className),
    "aria-label": ariaLabel,
    role: "region",
    tabIndex: "-1",
    ...props,
    children: children
  });
});
NavigableRegion.displayName = 'NavigableRegion';
 const navigable_region = (NavigableRegion);
;
const interface_skeleton_ANIMATION_DURATION = 0.25;
const commonTransition = {
  type: 'tween',
  duration: interface_skeleton_ANIMATION_DURATION,
  ease: [0.6, 0, 0.4, 1]
};
function useHTMLClass(className) {
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    const element = document && document.querySelector(`html:not(.${className})`);
    if (!element) {
      return;
    }
    element.classList.toggle(className);
    return () => {
      element.classList.toggle(className);
    };
  }, [className]);
}
const headerVariants = {
  hidden: {
    opacity: 1,
    marginTop: -60
  },
  visible: {
    opacity: 1,
    marginTop: 0
  },
  distractionFreeHover: {
    opacity: 1,
    marginTop: 0,
    transition: {
      ...commonTransition,
      delay: 0.2,
      delayChildren: 0.2
    }
  },
  distractionFreeHidden: {
    opacity: 0,
    marginTop: -60
  },
  distractionFreeDisabled: {
    opacity: 0,
    marginTop: 0,
    transition: {
      ...commonTransition,
      delay: 0.8,
      delayChildren: 0.8
    }
  }
};
function InterfaceSkeleton({
  isDistractionFree,
  footer,
  header,
  editorNotices,
  sidebar,
  secondarySidebar,
  content,
  actions,
  labels,
  className
}, ref) {
  const [secondarySidebarResizeListener, secondarySidebarSize] = (0,external_wp_compose_namespaceObject.useResizeObserver)();
  const isMobileViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('medium', '<');
  const disableMotion = (0,external_wp_compose_namespaceObject.useReducedMotion)();
  const defaultTransition = {
    type: 'tween',
    duration: disableMotion ? 0 : interface_skeleton_ANIMATION_DURATION,
    ease: [0.6, 0, 0.4, 1]
  };
  useHTMLClass('interface-interface-skeleton__html-container');
  const defaultLabels = {
    header: (0,external_wp_i18n_namespaceObject._x)('Header', 'header landmark area'),
    body: (0,external_wp_i18n_namespaceObject.__)('Content'),
    secondarySidebar: (0,external_wp_i18n_namespaceObject.__)('Block Library'),
    sidebar: (0,external_wp_i18n_namespaceObject._x)('Settings', 'settings landmark area'),
    actions: (0,external_wp_i18n_namespaceObject.__)('Publish'),
    footer: (0,external_wp_i18n_namespaceObject.__)('Footer')
  };
  const mergedLabels = {
    ...defaultLabels,
    ...labels
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    ref: ref,
    className: dist_clsx(className, 'interface-interface-skeleton', !!footer && 'has-footer'),
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "interface-interface-skeleton__editor",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__unstableAnimatePresence, {
        initial: false,
        children: !!header && (0,external_ReactJSXRuntime_namespaceObject.jsx)(navigable_region, {
          as: external_wp_components_namespaceObject.__unstableMotion.div,
          className: "interface-interface-skeleton__header",
          "aria-label": mergedLabels.header,
          initial: isDistractionFree && !isMobileViewport ? 'distractionFreeHidden' : 'hidden',
          whileHover: isDistractionFree && !isMobileViewport ? 'distractionFreeHover' : 'visible',
          animate: isDistractionFree && !isMobileViewport ? 'distractionFreeDisabled' : 'visible',
          exit: isDistractionFree && !isMobileViewport ? 'distractionFreeHidden' : 'hidden',
          variants: headerVariants,
          transition: defaultTransition,
          children: header
        })
      }), isDistractionFree && (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "interface-interface-skeleton__header",
        children: editorNotices
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "interface-interface-skeleton__body",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__unstableAnimatePresence, {
          initial: false,
          children: !!secondarySidebar && (0,external_ReactJSXRuntime_namespaceObject.jsx)(navigable_region, {
            className: "interface-interface-skeleton__secondary-sidebar",
            ariaLabel: mergedLabels.secondarySidebar,
            as: external_wp_components_namespaceObject.__unstableMotion.div,
            initial: "closed",
            animate: "open",
            exit: "closed",
            variants: {
              open: {
                width: secondarySidebarSize.width
              },
              closed: {
                width: 0
              }
            },
            transition: defaultTransition,
            children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__unstableMotion.div, {
              style: {
                position: 'absolute',
                width: isMobileViewport ? '100vw' : 'fit-content',
                height: '100%',
                left: 0
              },
              variants: {
                open: {
                  x: 0
                },
                closed: {
                  x: '-100%'
                }
              },
              transition: defaultTransition,
              children: [secondarySidebarResizeListener, secondarySidebar]
            })
          })
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(navigable_region, {
          className: "interface-interface-skeleton__content",
          ariaLabel: mergedLabels.body,
          children: content
        }), !!sidebar && (0,external_ReactJSXRuntime_namespaceObject.jsx)(navigable_region, {
          className: "interface-interface-skeleton__sidebar",
          ariaLabel: mergedLabels.sidebar,
          children: sidebar
        }), !!actions && (0,external_ReactJSXRuntime_namespaceObject.jsx)(navigable_region, {
          className: "interface-interface-skeleton__actions",
          ariaLabel: mergedLabels.actions,
          children: actions
        })]
      })]
    }), !!footer && (0,external_ReactJSXRuntime_namespaceObject.jsx)(navigable_region, {
      className: "interface-interface-skeleton__footer",
      ariaLabel: mergedLabels.footer,
      children: footer
    })]
  });
}
 const interface_skeleton = ((0,external_wp_element_namespaceObject.forwardRef)(InterfaceSkeleton));
;
;
;
const {
  RenamePatternModal
} = unlock(external_wp_patterns_namespaceObject.privateApis);
const modalName = 'editor/pattern-rename';
function PatternRenameModal() {
  const {
    record,
    postType
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostType,
      getCurrentPostId
    } = select(store_store);
    const {
      getEditedEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    const _postType = getCurrentPostType();
    return {
      record: getEditedEntityRecord('postType', _postType, getCurrentPostId()),
      postType: _postType
    };
  }, []);
  const {
    closeModal
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const isActive = (0,external_wp_data_namespaceObject.useSelect)(select => select(store).isModalActive(modalName));
  if (!isActive || postType !== PATTERN_POST_TYPE) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(RenamePatternModal, {
    onClose: closeModal,
    pattern: record
  });
}
;
const {
  DuplicatePatternModal
} = unlock(external_wp_patterns_namespaceObject.privateApis);
const pattern_duplicate_modal_modalName = 'editor/pattern-duplicate';
function PatternDuplicateModal() {
  const {
    record,
    postType
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostType,
      getCurrentPostId
    } = select(store_store);
    const {
      getEditedEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    const _postType = getCurrentPostType();
    return {
      record: getEditedEntityRecord('postType', _postType, getCurrentPostId()),
      postType: _postType
    };
  }, []);
  const {
    closeModal
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const isActive = (0,external_wp_data_namespaceObject.useSelect)(select => select(store).isModalActive(pattern_duplicate_modal_modalName));
  if (!isActive || postType !== PATTERN_POST_TYPE) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(DuplicatePatternModal, {
    onClose: closeModal,
    onSuccess: () => closeModal(),
    pattern: record
  });
}
;
const getEditorCommandLoader = () => function useEditorCommandLoader() {
  const {
    editorMode,
    isListViewOpen,
    showBlockBreadcrumbs,
    isDistractionFree,
    isFocusMode,
    isPreviewMode,
    isViewable,
    isCodeEditingEnabled,
    isRichEditingEnabled,
    isPublishSidebarEnabled
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _get, _getPostType$viewable;
    const {
      get
    } = select(external_wp_preferences_namespaceObject.store);
    const {
      isListViewOpened,
      getCurrentPostType,
      getEditorSettings
    } = select(store_store);
    const {
      getSettings
    } = select(external_wp_blockEditor_namespaceObject.store);
    const {
      getPostType
    } = select(external_wp_coreData_namespaceObject.store);
    return {
      editorMode: (_get = get('core', 'editorMode')) !== null && _get !== void 0 ? _get : 'visual',
      isListViewOpen: isListViewOpened(),
      showBlockBreadcrumbs: get('core', 'showBlockBreadcrumbs'),
      isDistractionFree: get('core', 'distractionFree'),
      isFocusMode: get('core', 'focusMode'),
      isPreviewMode: getSettings().isPreviewMode,
      isViewable: (_getPostType$viewable = getPostType(getCurrentPostType())?.viewable) !== null && _getPostType$viewable !== void 0 ? _getPostType$viewable : false,
      isCodeEditingEnabled: getEditorSettings().codeEditingEnabled,
      isRichEditingEnabled: getEditorSettings().richEditingEnabled,
      isPublishSidebarEnabled: select(store_store).isPublishSidebarEnabled()
    };
  }, []);
  const {
    getActiveComplementaryArea
  } = (0,external_wp_data_namespaceObject.useSelect)(store);
  const {
    toggle
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_preferences_namespaceObject.store);
  const {
    createInfoNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const {
    __unstableSaveForPreview,
    setIsListViewOpened,
    switchEditorMode,
    toggleDistractionFree,
    toggleSpotlightMode,
    toggleTopToolbar
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    openModal,
    enableComplementaryArea,
    disableComplementaryArea
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const {
    getCurrentPostId
  } = (0,external_wp_data_namespaceObject.useSelect)(store_store);
  const {
    isBlockBasedTheme,
    canCreateTemplate
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return {
      isBlockBasedTheme: select(external_wp_coreData_namespaceObject.store).getCurrentTheme()?.is_block_theme,
      canCreateTemplate: select(external_wp_coreData_namespaceObject.store).canUser('create', {
        kind: 'postType',
        name: 'wp_template'
      })
    };
  }, []);
  const allowSwitchEditorMode = isCodeEditingEnabled && isRichEditingEnabled;
  if (isPreviewMode) {
    return {
      commands: [],
      isLoading: false
    };
  }
  const commands = [];
  commands.push({
    name: 'core/open-shortcut-help',
    label: (0,external_wp_i18n_namespaceObject.__)('Keyboard shortcuts'),
    icon: library_keyboard,
    callback: ({
      close
    }) => {
      close();
      openModal('editor/keyboard-shortcut-help');
    }
  });
  commands.push({
    name: 'core/toggle-distraction-free',
    label: isDistractionFree ? (0,external_wp_i18n_namespaceObject.__)('Exit Distraction free') : (0,external_wp_i18n_namespaceObject.__)('Enter Distraction free'),
    callback: ({
      close
    }) => {
      toggleDistractionFree();
      close();
    }
  });
  commands.push({
    name: 'core/open-preferences',
    label: (0,external_wp_i18n_namespaceObject.__)('Editor preferences'),
    callback: ({
      close
    }) => {
      close();
      openModal('editor/preferences');
    }
  });
  commands.push({
    name: 'core/toggle-spotlight-mode',
    label: isFocusMode ? (0,external_wp_i18n_namespaceObject.__)('Exit Spotlight mode') : (0,external_wp_i18n_namespaceObject.__)('Enter Spotlight mode'),
    callback: ({
      close
    }) => {
      toggleSpotlightMode();
      close();
    }
  });
  commands.push({
    name: 'core/toggle-list-view',
    label: isListViewOpen ? (0,external_wp_i18n_namespaceObject.__)('Close List View') : (0,external_wp_i18n_namespaceObject.__)('Open List View'),
    icon: list_view,
    callback: ({
      close
    }) => {
      setIsListViewOpened(!isListViewOpen);
      close();
      createInfoNotice(isListViewOpen ? (0,external_wp_i18n_namespaceObject.__)('List View off.') : (0,external_wp_i18n_namespaceObject.__)('List View on.'), {
        id: 'core/editor/toggle-list-view/notice',
        type: 'snackbar'
      });
    }
  });
  commands.push({
    name: 'core/toggle-top-toolbar',
    label: (0,external_wp_i18n_namespaceObject.__)('Top toolbar'),
    callback: ({
      close
    }) => {
      toggleTopToolbar();
      close();
    }
  });
  if (allowSwitchEditorMode) {
    commands.push({
      name: 'core/toggle-code-editor',
      label: editorMode === 'visual' ? (0,external_wp_i18n_namespaceObject.__)('Open code editor') : (0,external_wp_i18n_namespaceObject.__)('Exit code editor'),
      icon: library_code,
      callback: ({
        close
      }) => {
        switchEditorMode(editorMode === 'visual' ? 'text' : 'visual');
        close();
      }
    });
  }
  commands.push({
    name: 'core/toggle-breadcrumbs',
    label: showBlockBreadcrumbs ? (0,external_wp_i18n_namespaceObject.__)('Hide block breadcrumbs') : (0,external_wp_i18n_namespaceObject.__)('Show block breadcrumbs'),
    callback: ({
      close
    }) => {
      toggle('core', 'showBlockBreadcrumbs');
      close();
      createInfoNotice(showBlockBreadcrumbs ? (0,external_wp_i18n_namespaceObject.__)('Breadcrumbs hidden.') : (0,external_wp_i18n_namespaceObject.__)('Breadcrumbs visible.'), {
        id: 'core/editor/toggle-breadcrumbs/notice',
        type: 'snackbar'
      });
    }
  });
  commands.push({
    name: 'core/open-settings-sidebar',
    label: (0,external_wp_i18n_namespaceObject.__)('Show or hide the Settings panel.'),
    icon: (0,external_wp_i18n_namespaceObject.isRTL)() ? drawer_left : drawer_right,
    callback: ({
      close
    }) => {
      const activeSidebar = getActiveComplementaryArea('core');
      close();
      if (activeSidebar === 'edit-post/document') {
        disableComplementaryArea('core');
      } else {
        enableComplementaryArea('core', 'edit-post/document');
      }
    }
  });
  commands.push({
    name: 'core/open-block-inspector',
    label: (0,external_wp_i18n_namespaceObject.__)('Show or hide the Block settings panel'),
    icon: block_default,
    callback: ({
      close
    }) => {
      const activeSidebar = getActiveComplementaryArea('core');
      close();
      if (activeSidebar === 'edit-post/block') {
        disableComplementaryArea('core');
      } else {
        enableComplementaryArea('core', 'edit-post/block');
      }
    }
  });
  commands.push({
    name: 'core/toggle-publish-sidebar',
    label: isPublishSidebarEnabled ? (0,external_wp_i18n_namespaceObject.__)('Disable pre-publish checks') : (0,external_wp_i18n_namespaceObject.__)('Enable pre-publish checks'),
    icon: format_list_bullets,
    callback: ({
      close
    }) => {
      close();
      toggle('core', 'isPublishSidebarEnabled');
      createInfoNotice(isPublishSidebarEnabled ? (0,external_wp_i18n_namespaceObject.__)('Pre-publish checks disabled.') : (0,external_wp_i18n_namespaceObject.__)('Pre-publish checks enabled.'), {
        id: 'core/editor/publish-sidebar/notice',
        type: 'snackbar'
      });
    }
  });
  if (isViewable) {
    commands.push({
      name: 'core/preview-link',
      label: (0,external_wp_i18n_namespaceObject.__)('Preview in a new tab'),
      icon: library_external,
      callback: async ({
        close
      }) => {
        close();
        const postId = getCurrentPostId();
        const link = await __unstableSaveForPreview();
        window.open(link, `wp-preview-${postId}`);
      }
    });
  }
  if (canCreateTemplate && isBlockBasedTheme) {
    const isSiteEditor = (0,external_wp_url_namespaceObject.getPath)(window.location.href)?.includes('site-editor.php');
    if (!isSiteEditor) {
      commands.push({
        name: 'core/go-to-site-editor',
        label: (0,external_wp_i18n_namespaceObject.__)('Open Site Editor'),
        callback: ({
          close
        }) => {
          close();
          document.location = 'site-editor.php';
        }
      });
    }
  }
  return {
    commands,
    isLoading: false
  };
};
const getEditedEntityContextualCommands = () => function useEditedEntityContextualCommands() {
  const {
    postType
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostType
    } = select(store_store);
    return {
      postType: getCurrentPostType()
    };
  }, []);
  const {
    openModal
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const commands = [];
  if (postType === PATTERN_POST_TYPE) {
    commands.push({
      name: 'core/rename-pattern',
      label: (0,external_wp_i18n_namespaceObject.__)('Rename pattern'),
      icon: library_edit,
      callback: ({
        close
      }) => {
        openModal(modalName);
        close();
      }
    });
    commands.push({
      name: 'core/duplicate-pattern',
      label: (0,external_wp_i18n_namespaceObject.__)('Duplicate pattern'),
      icon: library_symbol,
      callback: ({
        close
      }) => {
        openModal(pattern_duplicate_modal_modalName);
        close();
      }
    });
  }
  return {
    isLoading: false,
    commands
  };
};
const getPageContentFocusCommands = () => function usePageContentFocusCommands() {
  const {
    onNavigateToEntityRecord,
    goBack,
    templateId,
    isPreviewMode
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getRenderingMode,
      getEditorSettings: _getEditorSettings,
      getCurrentTemplateId
    } = unlock(select(store_store));
    const editorSettings = _getEditorSettings();
    return {
      isTemplateHidden: getRenderingMode() === 'post-only',
      onNavigateToEntityRecord: editorSettings.onNavigateToEntityRecord,
      getEditorSettings: _getEditorSettings,
      goBack: editorSettings.onNavigateToPreviousEntityRecord,
      templateId: getCurrentTemplateId(),
      isPreviewMode: editorSettings.isPreviewMode
    };
  }, []);
  const {
    editedRecord: template,
    hasResolved
  } = (0,external_wp_coreData_namespaceObject.useEntityRecord)('postType', 'wp_template', templateId);
  if (isPreviewMode) {
    return {
      isLoading: false,
      commands: []
    };
  }
  const commands = [];
  if (templateId && hasResolved) {
    commands.push({
      name: 'core/switch-to-template-focus',
      label: (0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject.__)('Edit template: %s'), (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(template.title)),
      icon: library_layout,
      callback: ({
        close
      }) => {
        onNavigateToEntityRecord({
          postId: templateId,
          postType: 'wp_template'
        });
        close();
      }
    });
  }
  if (!!goBack) {
    commands.push({
      name: 'core/switch-to-previous-entity',
      label: (0,external_wp_i18n_namespaceObject.__)('Go back'),
      icon: library_page,
      callback: ({
        close
      }) => {
        goBack();
        close();
      }
    });
  }
  return {
    isLoading: false,
    commands
  };
};
const getManipulateDocumentCommands = () => function useManipulateDocumentCommands() {
  const {
    postType,
    postId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostId,
      getCurrentPostType
    } = select(store_store);
    return {
      postType: getCurrentPostType(),
      postId: getCurrentPostId()
    };
  }, []);
  const {
    editedRecord: template,
    hasResolved
  } = (0,external_wp_coreData_namespaceObject.useEntityRecord)('postType', postType, postId);
  const {
    revertTemplate
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(store_store));
  if (!hasResolved || ![TEMPLATE_PART_POST_TYPE, TEMPLATE_POST_TYPE].includes(postType)) {
    return {
      isLoading: true,
      commands: []
    };
  }
  const commands = [];
  if (isTemplateRevertable(template)) {
    const label = template.type === TEMPLATE_POST_TYPE ? (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('Reset template: %s'), (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(template.title)) : (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('Reset template part: %s'), (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(template.title));
    commands.push({
      name: 'core/reset-template',
      label,
      icon: (0,external_wp_i18n_namespaceObject.isRTL)() ? rotate_right : rotate_left,
      callback: ({
        close
      }) => {
        revertTemplate(template);
        close();
      }
    });
  }
  return {
    isLoading: !hasResolved,
    commands
  };
};
function useCommands() {
  (0,external_wp_commands_namespaceObject.useCommandLoader)({
    name: 'core/editor/edit-ui',
    hook: getEditorCommandLoader()
  });
  (0,external_wp_commands_namespaceObject.useCommandLoader)({
    name: 'core/editor/contextual-commands',
    hook: getEditedEntityContextualCommands(),
    context: 'entity-edit'
  });
  (0,external_wp_commands_namespaceObject.useCommandLoader)({
    name: 'core/editor/page-content-focus',
    hook: getPageContentFocusCommands(),
    context: 'entity-edit'
  });
  (0,external_wp_commands_namespaceObject.useCommandLoader)({
    name: 'core/edit-site/manipulate-document',
    hook: getManipulateDocumentCommands()
  });
}
;
const {
  BlockRemovalWarningModal
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
const TEMPLATE_BLOCKS = ['core/post-content', 'core/post-template', 'core/query'];
const BLOCK_REMOVAL_RULES = [{
  postTypes: ['wp_template', 'wp_template_part'],
  callback(removedBlocks) {
    const removedTemplateBlocks = removedBlocks.filter(({
      name
    }) => TEMPLATE_BLOCKS.includes(name));
    if (removedTemplateBlocks.length) {
      return (0,external_wp_i18n_namespaceObject._n)('Deleting this block will stop your post or page content from displaying on this template. It is not recommended.', 'Some of the deleted blocks will stop your post or page content from displaying on this template. It is not recommended.', removedBlocks.length);
    }
  }
}, {
  postTypes: ['wp_block'],
  callback(removedBlocks) {
    const removedBlocksWithOverrides = removedBlocks.filter(({
      attributes
    }) => attributes?.metadata?.bindings && Object.values(attributes.metadata.bindings).some(binding => binding.source === 'core/pattern-overrides'));
    if (removedBlocksWithOverrides.length) {
      return (0,external_wp_i18n_namespaceObject._n)('The deleted block allows instance overrides. Removing it may result in content not displaying where this pattern is used. Are you sure you want to proceed?', 'Some of the deleted blocks allow instance overrides. Removing them may result in content not displaying where this pattern is used. Are you sure you want to proceed?', removedBlocks.length);
    }
  }
}];
function BlockRemovalWarnings() {
  const currentPostType = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).getCurrentPostType(), []);
  const removalRulesForPostType = (0,external_wp_element_namespaceObject.useMemo)(() => BLOCK_REMOVAL_RULES.filter(rule => rule.postTypes.includes(currentPostType)), [currentPostType]);
  if (!BlockRemovalWarningModal) {
    return null;
  }
  if (!removalRulesForPostType) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(BlockRemovalWarningModal, {
    rules: removalRulesForPostType
  });
}
;
function useStartPatterns() {
  const {
    blockPatternsWithPostContentBlockType,
    postType
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getPatternsByBlockTypes,
      getBlocksByName
    } = select(external_wp_blockEditor_namespaceObject.store);
    const {
      getCurrentPostType,
      getRenderingMode
    } = select(store_store);
    const rootClientId = getRenderingMode() === 'post-only' ? '' : getBlocksByName('core/post-content')?.[0];
    return {
      blockPatternsWithPostContentBlockType: getPatternsByBlockTypes('core/post-content', rootClientId),
      postType: getCurrentPostType()
    };
  }, []);
  return (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (!blockPatternsWithPostContentBlockType?.length) {
      return [];
    }
    return blockPatternsWithPostContentBlockType.filter(pattern => {
      return postType === 'page' && !pattern.postTypes || Array.isArray(pattern.postTypes) && pattern.postTypes.includes(postType);
    });
  }, [postType, blockPatternsWithPostContentBlockType]);
}
function PatternSelection({
  blockPatterns,
  onChoosePattern
}) {
  const {
    editEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const {
    postType,
    postId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostType,
      getCurrentPostId
    } = select(store_store);
    return {
      postType: getCurrentPostType(),
      postId: getCurrentPostId()
    };
  }, []);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalBlockPatternsList, {
    blockPatterns: blockPatterns,
    onClickPattern: (_pattern, blocks) => {
      editEntityRecord('postType', postType, postId, {
        blocks,
        content: ({
          blocks: blocksForSerialization = []
        }) => (0,external_wp_blocks_namespaceObject.__unstableSerializeAndClean)(blocksForSerialization)
      });
      onChoosePattern();
    }
  });
}
function StartPageOptionsModal({
  onClose
}) {
  const [showStartPatterns, setShowStartPatterns] = (0,external_wp_element_namespaceObject.useState)(true);
  const {
    set: setPreference
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_preferences_namespaceObject.store);
  const startPatterns = useStartPatterns();
  const hasStartPattern = startPatterns.length > 0;
  if (!hasStartPattern) {
    return null;
  }
  function handleClose() {
    onClose();
    setPreference('core', 'enableChoosePatternModal', showStartPatterns);
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.Modal, {
    className: "editor-start-page-options__modal",
    title: (0,external_wp_i18n_namespaceObject.__)('Choose a pattern'),
    isFullScreen: true,
    onRequestClose: handleClose,
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "editor-start-page-options__modal-content",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PatternSelection, {
        blockPatterns: startPatterns,
        onChoosePattern: handleClose
      })
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Flex, {
      className: "editor-start-page-options__modal__actions",
      justify: "flex-end",
      expanded: false,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.FlexItem, {
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToggleControl, {
          __nextHasNoMarginBottom: true,
          checked: showStartPatterns,
          label: (0,external_wp_i18n_namespaceObject.__)('Show starter patterns'),
          help: (0,external_wp_i18n_namespaceObject.__)('Shows starter patterns when creating a new page.'),
          onChange: newValue => {
            setShowStartPatterns(newValue);
          }
        })
      })
    })]
  });
}
function StartPageOptions() {
  const [isOpen, setIsOpen] = (0,external_wp_element_namespaceObject.useState)(false);
  const {
    isEditedPostDirty,
    isEditedPostEmpty
  } = (0,external_wp_data_namespaceObject.useSelect)(store_store);
  const {
    isModalActive
  } = (0,external_wp_data_namespaceObject.useSelect)(store);
  const {
    enabled,
    postId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostId,
      getCurrentPostType
    } = select(store_store);
    const choosePatternModalEnabled = select(external_wp_preferences_namespaceObject.store).get('core', 'enableChoosePatternModal');
    return {
      postId: getCurrentPostId(),
      enabled: choosePatternModalEnabled && TEMPLATE_POST_TYPE !== getCurrentPostType()
    };
  }, []);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    const isFreshPage = !isEditedPostDirty() && isEditedPostEmpty();
    const isPreferencesModalActive = isModalActive('editor/preferences');
    if (!enabled || !isFreshPage || isPreferencesModalActive) {
      return;
    }
    setIsOpen(true);
  }, [enabled, postId, isEditedPostDirty, isEditedPostEmpty, isModalActive]);
  if (!isOpen) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(StartPageOptionsModal, {
    onClose: () => setIsOpen(false)
  });
}
;
const external_wp_keyboardShortcuts_namespaceObject = window["wp"]["keyboardShortcuts"];
;
const textFormattingShortcuts = [{
  keyCombination: {
    modifier: 'primary',
    character: 'b'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Make the selected text bold.')
}, {
  keyCombination: {
    modifier: 'primary',
    character: 'i'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Make the selected text italic.')
}, {
  keyCombination: {
    modifier: 'primary',
    character: 'k'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Convert the selected text into a link.')
}, {
  keyCombination: {
    modifier: 'primaryShift',
    character: 'k'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Remove a link.')
}, {
  keyCombination: {
    character: '[['
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Insert a link to a post or page.')
}, {
  keyCombination: {
    modifier: 'primary',
    character: 'u'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Underline the selected text.')
}, {
  keyCombination: {
    modifier: 'access',
    character: 'd'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Strikethrough the selected text.')
}, {
  keyCombination: {
    modifier: 'access',
    character: 'x'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Make the selected text inline code.')
}, {
  keyCombination: {
    modifier: 'access',
    character: '0'
  },
  aliases: [{
    modifier: 'access',
    character: '7'
  }],
  description: (0,external_wp_i18n_namespaceObject.__)('Convert the current heading to a paragraph.')
}, {
  keyCombination: {
    modifier: 'access',
    character: '1-6'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Convert the current paragraph or heading to a heading of level 1 to 6.')
}, {
  keyCombination: {
    modifier: 'primaryShift',
    character: 'SPACE'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Add non breaking space.')
}];
;
const external_wp_keycodes_namespaceObject = window["wp"]["keycodes"];
;
function KeyCombination({
  keyCombination,
  forceAriaLabel
}) {
  const shortcut = keyCombination.modifier ? external_wp_keycodes_namespaceObject.displayShortcutList[keyCombination.modifier](keyCombination.character) : keyCombination.character;
  const ariaLabel = keyCombination.modifier ? external_wp_keycodes_namespaceObject.shortcutAriaLabel[keyCombination.modifier](keyCombination.character) : keyCombination.character;
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("kbd", {
    className: "editor-keyboard-shortcut-help-modal__shortcut-key-combination",
    "aria-label": forceAriaLabel || ariaLabel,
    children: (Array.isArray(shortcut) ? shortcut : [shortcut]).map((character, index) => {
      if (character === '+') {
        return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_element_namespaceObject.Fragment, {
          children: character
        }, index);
      }
      return (0,external_ReactJSXRuntime_namespaceObject.jsx)("kbd", {
        className: "editor-keyboard-shortcut-help-modal__shortcut-key",
        children: character
      }, index);
    })
  });
}
function Shortcut({
  description,
  keyCombination,
  aliases = [],
  ariaLabel
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "editor-keyboard-shortcut-help-modal__shortcut-description",
      children: description
    }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "editor-keyboard-shortcut-help-modal__shortcut-term",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(KeyCombination, {
        keyCombination: keyCombination,
        forceAriaLabel: ariaLabel
      }), aliases.map((alias, index) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(KeyCombination, {
        keyCombination: alias,
        forceAriaLabel: ariaLabel
      }, index))]
    })]
  });
}
 const keyboard_shortcut_help_modal_shortcut = (Shortcut);
;
function DynamicShortcut({
  name
}) {
  const {
    keyCombination,
    description,
    aliases
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getShortcutKeyCombination,
      getShortcutDescription,
      getShortcutAliases
    } = select(external_wp_keyboardShortcuts_namespaceObject.store);
    return {
      keyCombination: getShortcutKeyCombination(name),
      aliases: getShortcutAliases(name),
      description: getShortcutDescription(name)
    };
  }, [name]);
  if (!keyCombination) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(keyboard_shortcut_help_modal_shortcut, {
    keyCombination: keyCombination,
    description: description,
    aliases: aliases
  });
}
 const dynamic_shortcut = (DynamicShortcut);
;
const KEYBOARD_SHORTCUT_HELP_MODAL_NAME = 'editor/keyboard-shortcut-help';
const ShortcutList = ({
  shortcuts
}) =>
(0,external_ReactJSXRuntime_namespaceObject.jsx)("ul", {
  className: "editor-keyboard-shortcut-help-modal__shortcut-list",
  role: "list",
  children: shortcuts.map((shortcut, index) => (0,external_ReactJSXRuntime_namespaceObject.jsx)("li", {
    className: "editor-keyboard-shortcut-help-modal__shortcut",
    children: typeof shortcut === 'string' ? (0,external_ReactJSXRuntime_namespaceObject.jsx)(dynamic_shortcut, {
      name: shortcut
    }) : (0,external_ReactJSXRuntime_namespaceObject.jsx)(keyboard_shortcut_help_modal_shortcut, {
      ...shortcut
    })
  }, index))
})
;
const ShortcutSection = ({
  title,
  shortcuts,
  className
}) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)("section", {
  className: dist_clsx('editor-keyboard-shortcut-help-modal__section', className),
  children: [!!title && (0,external_ReactJSXRuntime_namespaceObject.jsx)("h2", {
    className: "editor-keyboard-shortcut-help-modal__section-title",
    children: title
  }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(ShortcutList, {
    shortcuts: shortcuts
  })]
});
const ShortcutCategorySection = ({
  title,
  categoryName,
  additionalShortcuts = []
}) => {
  const categoryShortcuts = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return select(external_wp_keyboardShortcuts_namespaceObject.store).getCategoryShortcuts(categoryName);
  }, [categoryName]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(ShortcutSection, {
    title: title,
    shortcuts: categoryShortcuts.concat(additionalShortcuts)
  });
};
function KeyboardShortcutHelpModal() {
  const isModalActive = (0,external_wp_data_namespaceObject.useSelect)(select => select(store).isModalActive(KEYBOARD_SHORTCUT_HELP_MODAL_NAME), []);
  const {
    openModal,
    closeModal
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const toggleModal = () => {
    if (isModalActive) {
      closeModal();
    } else {
      openModal(KEYBOARD_SHORTCUT_HELP_MODAL_NAME);
    }
  };
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/editor/keyboard-shortcuts', toggleModal);
  if (!isModalActive) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.Modal, {
    className: "editor-keyboard-shortcut-help-modal",
    title: (0,external_wp_i18n_namespaceObject.__)('Keyboard shortcuts'),
    closeButtonLabel: (0,external_wp_i18n_namespaceObject.__)('Close'),
    onRequestClose: toggleModal,
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(ShortcutSection, {
      className: "editor-keyboard-shortcut-help-modal__main-shortcuts",
      shortcuts: ['core/editor/keyboard-shortcuts']
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(ShortcutCategorySection, {
      title: (0,external_wp_i18n_namespaceObject.__)('Global shortcuts'),
      categoryName: "global"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(ShortcutCategorySection, {
      title: (0,external_wp_i18n_namespaceObject.__)('Selection shortcuts'),
      categoryName: "selection"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(ShortcutCategorySection, {
      title: (0,external_wp_i18n_namespaceObject.__)('Block shortcuts'),
      categoryName: "block",
      additionalShortcuts: [{
        keyCombination: {
          character: '/'
        },
        description: (0,external_wp_i18n_namespaceObject.__)('Change the block type after adding a new paragraph.'),
        ariaLabel: (0,external_wp_i18n_namespaceObject.__)('Forward-slash')
      }]
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(ShortcutSection, {
      title: (0,external_wp_i18n_namespaceObject.__)('Text formatting'),
      shortcuts: textFormattingShortcuts
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(ShortcutCategorySection, {
      title: (0,external_wp_i18n_namespaceObject.__)('List View shortcuts'),
      categoryName: "list-view"
    })]
  });
}
 const keyboard_shortcut_help_modal = (KeyboardShortcutHelpModal);
;
function ContentOnlySettingsMenuItems({
  clientId,
  onClose
}) {
  const postContentBlocks = usePostContentBlocks();
  const {
    entity,
    onNavigateToEntityRecord,
    canEditTemplates
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getBlockParentsByBlockName,
      getSettings,
      getBlockAttributes,
      getBlockParents
    } = select(external_wp_blockEditor_namespaceObject.store);
    const {
      getCurrentTemplateId,
      getRenderingMode
    } = select(store_store);
    const patternParent = getBlockParentsByBlockName(clientId, 'core/block', true)[0];
    let record;
    if (patternParent) {
      record = select(external_wp_coreData_namespaceObject.store).getEntityRecord('postType', 'wp_block', getBlockAttributes(patternParent).ref);
    } else if (getRenderingMode() === 'template-locked' && !getBlockParents(clientId).some(parent => postContentBlocks.includes(parent))) {
      record = select(external_wp_coreData_namespaceObject.store).getEntityRecord('postType', 'wp_template', getCurrentTemplateId());
    }
    if (!record) {
      return {};
    }
    const _canEditTemplates = select(external_wp_coreData_namespaceObject.store).canUser('create', {
      kind: 'postType',
      name: 'wp_template'
    });
    return {
      canEditTemplates: _canEditTemplates,
      entity: record,
      onNavigateToEntityRecord: getSettings().onNavigateToEntityRecord
    };
  }, [clientId, postContentBlocks]);
  if (!entity) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(TemplateLockContentOnlyMenuItems, {
      clientId: clientId,
      onClose: onClose
    });
  }
  const isPattern = entity.type === 'wp_block';
  let helpText = isPattern ? (0,external_wp_i18n_namespaceObject.__)('Edit the pattern to move, delete, or make further changes to this block.') : (0,external_wp_i18n_namespaceObject.__)('Edit the template to move, delete, or make further changes to this block.');
  if (!canEditTemplates) {
    helpText = (0,external_wp_i18n_namespaceObject.__)('Only users with permissions to edit the template can move or delete this block');
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__unstableBlockSettingsMenuFirstItem, {
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
        onClick: () => {
          onNavigateToEntityRecord({
            postId: entity.id,
            postType: entity.type
          });
        },
        disabled: !canEditTemplates,
        children: isPattern ? (0,external_wp_i18n_namespaceObject.__)('Edit pattern') : (0,external_wp_i18n_namespaceObject.__)('Edit template')
      })
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
      variant: "muted",
      as: "p",
      className: "editor-content-only-settings-menu__description",
      children: helpText
    })]
  });
}
function TemplateLockContentOnlyMenuItems({
  clientId,
  onClose
}) {
  const {
    contentLockingParent
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getContentLockingParent
    } = unlock(select(external_wp_blockEditor_namespaceObject.store));
    return {
      contentLockingParent: getContentLockingParent(clientId)
    };
  }, [clientId]);
  const blockDisplayInformation = (0,external_wp_blockEditor_namespaceObject.useBlockDisplayInformation)(contentLockingParent);
  const blockEditorActions = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  if (!blockDisplayInformation?.title) {
    return null;
  }
  const {
    modifyContentLockBlock
  } = unlock(blockEditorActions);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__unstableBlockSettingsMenuFirstItem, {
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
        onClick: () => {
          modifyContentLockBlock(contentLockingParent);
          onClose();
        },
        children: (0,external_wp_i18n_namespaceObject._x)('Unlock', 'Unlock content locked blocks')
      })
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
      variant: "muted",
      as: "p",
      className: "editor-content-only-settings-menu__description",
      children: (0,external_wp_i18n_namespaceObject.__)('Temporarily unlock the parent block to edit, delete or make further changes to this block.')
    })]
  });
}
function ContentOnlySettingsMenu() {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockSettingsMenuControls, {
    children: ({
      selectedClientIds,
      onClose
    }) => selectedClientIds.length === 1 && (0,external_ReactJSXRuntime_namespaceObject.jsx)(ContentOnlySettingsMenuItems, {
      clientId: selectedClientIds[0],
      onClose: onClose
    })
  });
}
;
function useFallbackTemplateContent(slug, isCustom = false) {
  return (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord,
      getDefaultTemplateId
    } = select(external_wp_coreData_namespaceObject.store);
    const templateId = getDefaultTemplateId({
      slug,
      is_custom: isCustom,
      ignore_empty: true
    });
    return templateId ? getEntityRecord('postType', TEMPLATE_POST_TYPE, templateId)?.content?.raw : undefined;
  }, [slug, isCustom]);
}
function start_template_options_useStartPatterns(fallbackContent) {
  const {
    slug,
    patterns
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostType,
      getCurrentPostId
    } = select(store_store);
    const {
      getEntityRecord,
      getBlockPatterns
    } = select(external_wp_coreData_namespaceObject.store);
    const postId = getCurrentPostId();
    const postType = getCurrentPostType();
    const record = getEntityRecord('postType', postType, postId);
    return {
      slug: record.slug,
      patterns: getBlockPatterns()
    };
  }, []);
  const currentThemeStylesheet = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_coreData_namespaceObject.store).getCurrentTheme().stylesheet);
  function injectThemeAttributeInBlockTemplateContent(block) {
    if (block.innerBlocks.find(innerBlock => innerBlock.name === 'core/template-part')) {
      block.innerBlocks = block.innerBlocks.map(innerBlock => {
        if (innerBlock.name === 'core/template-part' && innerBlock.attributes.theme === undefined) {
          innerBlock.attributes.theme = currentThemeStylesheet;
        }
        return innerBlock;
      });
    }
    if (block.name === 'core/template-part' && block.attributes.theme === undefined) {
      block.attributes.theme = currentThemeStylesheet;
    }
    return block;
  }
  return (0,external_wp_element_namespaceObject.useMemo)(() => {
    return [{
      name: 'fallback',
      blocks: (0,external_wp_blocks_namespaceObject.parse)(fallbackContent),
      title: (0,external_wp_i18n_namespaceObject.__)('Fallback content')
    }, ...patterns.filter(pattern => {
      return Array.isArray(pattern.templateTypes) && pattern.templateTypes.some(templateType => slug.startsWith(templateType));
    }).map(pattern => {
      return {
        ...pattern,
        blocks: (0,external_wp_blocks_namespaceObject.parse)(pattern.content).map(block => injectThemeAttributeInBlockTemplateContent(block))
      };
    })];
  }, [fallbackContent, slug, patterns]);
}
function start_template_options_PatternSelection({
  fallbackContent,
  onChoosePattern,
  postType
}) {
  const [,, onChange] = (0,external_wp_coreData_namespaceObject.useEntityBlockEditor)('postType', postType);
  const blockPatterns = start_template_options_useStartPatterns(fallbackContent);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalBlockPatternsList, {
    blockPatterns: blockPatterns,
    onClickPattern: (pattern, blocks) => {
      onChange(blocks, {
        selection: undefined
      });
      onChoosePattern();
    }
  });
}
function StartModal({
  slug,
  isCustom,
  onClose,
  postType
}) {
  const fallbackContent = useFallbackTemplateContent(slug, isCustom);
  if (!fallbackContent) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.Modal, {
    className: "editor-start-template-options__modal",
    title: (0,external_wp_i18n_namespaceObject.__)('Choose a pattern'),
    closeLabel: (0,external_wp_i18n_namespaceObject.__)('Cancel'),
    focusOnMount: "firstElement",
    onRequestClose: onClose,
    isFullScreen: true,
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "editor-start-template-options__modal-content",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(start_template_options_PatternSelection, {
        fallbackContent: fallbackContent,
        slug: slug,
        isCustom: isCustom,
        postType: postType,
        onChoosePattern: () => {
          onClose();
        }
      })
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Flex, {
      className: "editor-start-template-options__modal__actions",
      justify: "flex-end",
      expanded: false,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.FlexItem, {
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "tertiary",
          onClick: onClose,
          children: (0,external_wp_i18n_namespaceObject.__)('Skip')
        })
      })
    })]
  });
}
function StartTemplateOptions() {
  const [isClosed, setIsClosed] = (0,external_wp_element_namespaceObject.useState)(false);
  const {
    shouldOpenModal,
    slug,
    isCustom,
    postType,
    postId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostType,
      getCurrentPostId
    } = select(store_store);
    const _postType = getCurrentPostType();
    const _postId = getCurrentPostId();
    const {
      getEditedEntityRecord,
      hasEditsForEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    const templateRecord = getEditedEntityRecord('postType', _postType, _postId);
    const hasEdits = hasEditsForEntityRecord('postType', _postType, _postId);
    return {
      shouldOpenModal: !hasEdits && '' === templateRecord.content && TEMPLATE_POST_TYPE === _postType,
      slug: templateRecord.slug,
      isCustom: templateRecord.is_custom,
      postType: _postType,
      postId: _postId
    };
  }, []);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    setIsClosed(false);
  }, [postType, postId]);
  if (!shouldOpenModal || isClosed) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(StartModal, {
    slug: slug,
    isCustom: isCustom,
    postType: postType,
    onClose: () => setIsClosed(true)
  });
}
;
function EditorKeyboardShortcuts() {
  const isModeToggleDisabled = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      richEditingEnabled,
      codeEditingEnabled
    } = select(store_store).getEditorSettings();
    return !richEditingEnabled || !codeEditingEnabled;
  }, []);
  const {
    getBlockSelectionStart
  } = (0,external_wp_data_namespaceObject.useSelect)(external_wp_blockEditor_namespaceObject.store);
  const {
    getActiveComplementaryArea
  } = (0,external_wp_data_namespaceObject.useSelect)(store);
  const {
    enableComplementaryArea,
    disableComplementaryArea
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const {
    redo,
    undo,
    savePost,
    setIsListViewOpened,
    switchEditorMode,
    toggleDistractionFree
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    isEditedPostDirty,
    isPostSavingLocked,
    isListViewOpened,
    getEditorMode
  } = (0,external_wp_data_namespaceObject.useSelect)(store_store);
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/editor/toggle-mode', () => {
    switchEditorMode(getEditorMode() === 'visual' ? 'text' : 'visual');
  }, {
    isDisabled: isModeToggleDisabled
  });
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/editor/toggle-distraction-free', () => {
    toggleDistractionFree();
  });
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/editor/undo', event => {
    undo();
    event.preventDefault();
  });
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/editor/redo', event => {
    redo();
    event.preventDefault();
  });
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/editor/save', event => {
    event.preventDefault();
    if (isPostSavingLocked()) {
      return;
    }
    if (!isEditedPostDirty()) {
      return;
    }
    savePost();
  });
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/editor/toggle-list-view', event => {
    if (!isListViewOpened()) {
      event.preventDefault();
      setIsListViewOpened(true);
    }
  });
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/editor/toggle-sidebar', event => {
    event.preventDefault();
    const isEditorSidebarOpened = ['edit-post/document', 'edit-post/block'].includes(getActiveComplementaryArea('core'));
    if (isEditorSidebarOpened) {
      disableComplementaryArea('core');
    } else {
      const sidebarToOpen = getBlockSelectionStart() ? 'edit-post/block' : 'edit-post/document';
      enableComplementaryArea('core', sidebarToOpen);
    }
  });
  return null;
}
;
function ConvertToRegularBlocks({
  clientId,
  onClose
}) {
  const {
    getBlocks
  } = (0,external_wp_data_namespaceObject.useSelect)(external_wp_blockEditor_namespaceObject.store);
  const {
    replaceBlocks
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  const canRemove = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_blockEditor_namespaceObject.store).canRemoveBlock(clientId), [clientId]);
  if (!canRemove) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
    onClick: () => {
      replaceBlocks(clientId, getBlocks(clientId));
      onClose();
    },
    children: (0,external_wp_i18n_namespaceObject.__)('Detach')
  });
}
;
function ConvertToTemplatePart({
  clientIds,
  blocks
}) {
  const [isModalOpen, setIsModalOpen] = (0,external_wp_element_namespaceObject.useState)(false);
  const {
    replaceBlocks
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  const {
    createSuccessNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const {
    canCreate
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return {
      canCreate: select(external_wp_blockEditor_namespaceObject.store).canInsertBlockType('core/template-part')
    };
  }, []);
  if (!canCreate) {
    return null;
  }
  const onConvert = async templatePart => {
    replaceBlocks(clientIds, (0,external_wp_blocks_namespaceObject.createBlock)('core/template-part', {
      slug: templatePart.slug,
      theme: templatePart.theme
    }));
    createSuccessNotice((0,external_wp_i18n_namespaceObject.__)('Template part created.'), {
      type: 'snackbar'
    });
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
      icon: symbol_filled,
      onClick: () => {
        setIsModalOpen(true);
      },
      "aria-expanded": isModalOpen,
      "aria-haspopup": "dialog",
      children: (0,external_wp_i18n_namespaceObject.__)('Create template part')
    }), isModalOpen && (0,external_ReactJSXRuntime_namespaceObject.jsx)(CreateTemplatePartModal, {
      closeModal: () => {
        setIsModalOpen(false);
      },
      blocks: blocks,
      onCreate: onConvert
    })]
  });
}
;
function TemplatePartMenuItems() {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockSettingsMenuControls, {
    children: ({
      selectedClientIds,
      onClose
    }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(TemplatePartConverterMenuItem, {
      clientIds: selectedClientIds,
      onClose: onClose
    })
  });
}
function TemplatePartConverterMenuItem({
  clientIds,
  onClose
}) {
  const {
    blocks
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getBlocksByClientId
    } = select(external_wp_blockEditor_namespaceObject.store);
    return {
      blocks: getBlocksByClientId(clientIds)
    };
  }, [clientIds]);
  if (blocks.length === 1 && blocks[0]?.name === 'core/template-part') {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(ConvertToRegularBlocks, {
      clientId: clientIds[0],
      onClose: onClose
    });
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(ConvertToTemplatePart, {
    clientIds: clientIds,
    blocks: blocks
  });
}
;
const {
  ExperimentalBlockEditorProvider
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
const {
  PatternsMenuItems
} = unlock(external_wp_patterns_namespaceObject.privateApis);
const provider_noop = () => {};
const NON_CONTEXTUAL_POST_TYPES = ['wp_block', 'wp_navigation', 'wp_template_part'];
function useBlockEditorProps(post, template, mode) {
  const rootLevelPost = mode === 'template-locked' ? 'template' : 'post';
  const [postBlocks, onInput, onChange] = (0,external_wp_coreData_namespaceObject.useEntityBlockEditor)('postType', post.type, {
    id: post.id
  });
  const [templateBlocks, onInputTemplate, onChangeTemplate] = (0,external_wp_coreData_namespaceObject.useEntityBlockEditor)('postType', template?.type, {
    id: template?.id
  });
  const maybeNavigationBlocks = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (post.type === 'wp_navigation') {
      return [(0,external_wp_blocks_namespaceObject.createBlock)('core/navigation', {
        ref: post.id,
        templateLock: false
      })];
    }
  }, [post.type, post.id]);
  const blocks = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (maybeNavigationBlocks) {
      return maybeNavigationBlocks;
    }
    if (rootLevelPost === 'template') {
      return templateBlocks;
    }
    return postBlocks;
  }, [maybeNavigationBlocks, rootLevelPost, templateBlocks, postBlocks]);
  const disableRootLevelChanges = !!template && mode === 'template-locked' || post.type === 'wp_navigation';
  if (disableRootLevelChanges) {
    return [blocks, provider_noop, provider_noop];
  }
  return [blocks, rootLevelPost === 'post' ? onInput : onInputTemplate, rootLevelPost === 'post' ? onChange : onChangeTemplate];
}
const ExperimentalEditorProvider = with_registry_provider(({
  post,
  settings,
  recovery,
  initialEdits,
  children,
  BlockEditorProviderComponent = ExperimentalBlockEditorProvider,
  __unstableTemplate: template
}) => {
  const hasTemplate = !!template;
  const {
    editorSettings,
    selection,
    isReady,
    mode,
    defaultMode,
    postTypeEntities
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditorSettings,
      getEditorSelection,
      getRenderingMode,
      __unstableIsEditorReady,
      getDefaultRenderingMode
    } = unlock(select(store_store));
    const {
      getEntitiesConfig
    } = select(external_wp_coreData_namespaceObject.store);
    const _mode = getRenderingMode();
    const _defaultMode = getDefaultRenderingMode(post.type);
    const hasResolvedDefaultMode = _defaultMode === 'template-locked' ? hasTemplate : _defaultMode !== undefined;
    const isRenderingModeReady = _defaultMode !== undefined;
    return {
      editorSettings: getEditorSettings(),
      isReady: __unstableIsEditorReady(),
      mode: isRenderingModeReady ? _mode : undefined,
      defaultMode: hasResolvedDefaultMode ? _defaultMode : undefined,
      selection: getEditorSelection(),
      postTypeEntities: post.type === 'wp_template' ? getEntitiesConfig('postType') : null
    };
  }, [post.type, hasTemplate]);
  const shouldRenderTemplate = hasTemplate && mode !== 'post-only';
  const rootLevelPost = shouldRenderTemplate ? template : post;
  const defaultBlockContext = (0,external_wp_element_namespaceObject.useMemo)(() => {
    const postContext = {};
    if (post.type === 'wp_template') {
      if (post.slug === 'page') {
        postContext.postType = 'page';
      } else if (post.slug === 'single') {
        postContext.postType = 'post';
      } else if (post.slug.split('-')[0] === 'single') {
        const postTypeNames = postTypeEntities?.map(entity => entity.name) || [];
        const match = post.slug.match(`^single-(${postTypeNames.join('|')})(?:-.+)?$`);
        if (match) {
          postContext.postType = match[1];
        }
      }
    } else if (!NON_CONTEXTUAL_POST_TYPES.includes(rootLevelPost.type) || shouldRenderTemplate) {
      postContext.postId = post.id;
      postContext.postType = post.type;
    }
    return {
      ...postContext,
      templateSlug: rootLevelPost.type === 'wp_template' ? rootLevelPost.slug : undefined
    };
  }, [shouldRenderTemplate, post.id, post.type, post.slug, rootLevelPost.type, rootLevelPost.slug, postTypeEntities]);
  const {
    id,
    type
  } = rootLevelPost;
  const blockEditorSettings = use_block_editor_settings(editorSettings, type, id, mode);
  const [blocks, onInput, onChange] = useBlockEditorProps(post, template, mode);
  const {
    updatePostLock,
    setupEditor,
    updateEditorSettings,
    setCurrentTemplateId,
    setEditedPost,
    setRenderingMode
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(store_store));
  const {
    createWarningNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  (0,external_wp_element_namespaceObject.useLayoutEffect)(() => {
    if (recovery) {
      return;
    }
    updatePostLock(settings.postLock);
    setupEditor(post, initialEdits, settings.template);
    if (settings.autosave) {
      createWarningNotice((0,external_wp_i18n_namespaceObject.__)('There is an autosave of this post that is more recent than the version below.'), {
        id: 'autosave-exists',
        actions: [{
          label: (0,external_wp_i18n_namespaceObject.__)('View the autosave'),
          url: settings.autosave.editLink
        }]
      });
    }
  }, []);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    setEditedPost(post.type, post.id);
  }, [post.type, post.id, setEditedPost]);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    updateEditorSettings(settings);
  }, [settings, updateEditorSettings]);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    setCurrentTemplateId(template?.id);
  }, [template?.id, setCurrentTemplateId]);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (defaultMode) {
      setRenderingMode(defaultMode);
    }
  }, [defaultMode, setRenderingMode]);
  useHideBlocksFromInserter(post.type, mode);
  useCommands();
  if (!isReady || !mode) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_coreData_namespaceObject.EntityProvider, {
    kind: "root",
    type: "site",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_coreData_namespaceObject.EntityProvider, {
      kind: "postType",
      type: post.type,
      id: post.id,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockContextProvider, {
        value: defaultBlockContext,
        children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(BlockEditorProviderComponent, {
          value: blocks,
          onChange: onChange,
          onInput: onInput,
          selection: selection,
          settings: blockEditorSettings,
          useSubRegistry: false,
          children: [children, !settings.isPreviewMode && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
            children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(PatternsMenuItems, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(TemplatePartMenuItems, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(ContentOnlySettingsMenu, {}), mode === 'template-locked' && (0,external_ReactJSXRuntime_namespaceObject.jsx)(DisableNonPageContentBlocks, {}), type === 'wp_navigation' && (0,external_ReactJSXRuntime_namespaceObject.jsx)(NavigationBlockEditingMode, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(EditorKeyboardShortcuts, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(keyboard_shortcut_help_modal, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(BlockRemovalWarnings, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(StartPageOptions, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(StartTemplateOptions, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PatternRenameModal, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PatternDuplicateModal, {})]
          })]
        })
      })
    })
  });
});
function EditorProvider(props) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(ExperimentalEditorProvider, {
    ...props,
    BlockEditorProviderComponent: external_wp_blockEditor_namespaceObject.BlockEditorProvider,
    children: props.children
  });
}
 const provider = (EditorProvider);
;
const {
  useGlobalStyle
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
function PostPreviewContainer({
  template,
  post
}) {
  const [backgroundColor = 'white'] = useGlobalStyle('color.background');
  const [postBlocks] = (0,external_wp_coreData_namespaceObject.useEntityBlockEditor)('postType', post.type, {
    id: post.id
  });
  const [templateBlocks] = (0,external_wp_coreData_namespaceObject.useEntityBlockEditor)('postType', template?.type, {
    id: template?.id
  });
  const blocks = template && templateBlocks ? templateBlocks : postBlocks;
  const isEmpty = !blocks?.length;
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "editor-fields-content-preview",
    style: {
      backgroundColor
    },
    children: [isEmpty && (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
      className: "editor-fields-content-preview__empty",
      children: (0,external_wp_i18n_namespaceObject.__)('Empty content')
    }), !isEmpty && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockPreview.Async, {
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockPreview, {
        blocks: blocks
      })
    })]
  });
}
function PostPreviewView({
  item
}) {
  const {
    settings,
    template
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _getPostType$viewable;
    const {
      canUser,
      getPostType,
      getTemplateId,
      getEntityRecord
    } = unlock(select(external_wp_coreData_namespaceObject.store));
    const canViewTemplate = canUser('read', {
      kind: 'postType',
      name: 'wp_template'
    });
    const _settings = select(store_store).getEditorSettings();
    const supportsTemplateMode = _settings.supportsTemplateMode;
    const isViewable = (_getPostType$viewable = getPostType(item.type)?.viewable) !== null && _getPostType$viewable !== void 0 ? _getPostType$viewable : false;
    const templateId = supportsTemplateMode && isViewable && canViewTemplate ? getTemplateId(item.type, item.id) : null;
    return {
      settings: _settings,
      template: templateId ? getEntityRecord('postType', 'wp_template', templateId) : undefined
    };
  }, [item.type, item.id]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(EditorProvider, {
    post: item,
    settings: settings,
    __unstableTemplate: template,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostPreviewContainer, {
      template: template,
      post: item
    })
  });
}
;
const postPreviewField = {
  type: 'media',
  id: 'content-preview',
  label: (0,external_wp_i18n_namespaceObject.__)('Content preview'),
  render: PostPreviewView,
  enableSorting: false
};
 const content_preview = (postPreviewField);
;
function registerEntityAction(kind, name, config) {
  return {
    type: 'REGISTER_ENTITY_ACTION',
    kind,
    name,
    config
  };
}
function unregisterEntityAction(kind, name, actionId) {
  return {
    type: 'UNREGISTER_ENTITY_ACTION',
    kind,
    name,
    actionId
  };
}
function registerEntityField(kind, name, config) {
  return {
    type: 'REGISTER_ENTITY_FIELD',
    kind,
    name,
    config
  };
}
function unregisterEntityField(kind, name, fieldId) {
  return {
    type: 'UNREGISTER_ENTITY_FIELD',
    kind,
    name,
    fieldId
  };
}
function setIsReady(kind, name) {
  return {
    type: 'SET_IS_READY',
    kind,
    name
  };
}
const registerPostTypeSchema = postType => async ({
  registry
}) => {
  const isReady = unlock(registry.select(store_store)).isEntityReady('postType', postType);
  if (isReady) {
    return;
  }
  unlock(registry.dispatch(store_store)).setIsReady('postType', postType);
  const postTypeConfig = await registry.resolveSelect(external_wp_coreData_namespaceObject.store).getPostType(postType);
  const canCreate = await registry.resolveSelect(external_wp_coreData_namespaceObject.store).canUser('create', {
    kind: 'postType',
    name: postType
  });
  const currentTheme = await registry.resolveSelect(external_wp_coreData_namespaceObject.store).getCurrentTheme();
  const actions = [postTypeConfig.viewable ? view_post : undefined, !!postTypeConfig.supports?.revisions ? view_post_revisions : undefined,
   false ? 0 : undefined, postTypeConfig.slug === 'wp_template_part' && canCreate && currentTheme?.is_block_theme ? duplicate_template_part : undefined, canCreate && postTypeConfig.slug === 'wp_block' ? duplicate_pattern : undefined, postTypeConfig.supports?.title ? rename_post : undefined, postTypeConfig.supports?.['page-attributes'] ? reorder_page : undefined, postTypeConfig.slug === 'wp_block' ? export_pattern : undefined, restore_post, reset_post, delete_post, trash_post, permanently_delete_post].filter(Boolean);
  const fields = [postTypeConfig.supports?.thumbnail && currentTheme?.theme_supports?.['post-thumbnails'] && featured_image, postTypeConfig.supports?.author && author, fields_status, date, slug, postTypeConfig.supports?.['page-attributes'] && fields_parent, postTypeConfig.supports?.comments && comment_status, fields_template, fields_password, postTypeConfig.supports?.editor && postTypeConfig.viewable && content_preview].filter(Boolean);
  if (postTypeConfig.supports?.title) {
    let _titleField;
    if (postType === 'page') {
      _titleField = page_title;
    } else if (postType === 'wp_template') {
      _titleField = template_title;
    } else if (postType === 'wp_block') {
      _titleField = pattern_title;
    } else {
      _titleField = title;
    }
    fields.push(_titleField);
  }
  registry.batch(() => {
    actions.forEach(action => {
      unlock(registry.dispatch(store_store)).registerEntityAction('postType', postType, action);
    });
    fields.forEach(field => {
      unlock(registry.dispatch(store_store)).registerEntityField('postType', postType, field);
    });
  });
  (0,external_wp_hooks_namespaceObject.doAction)('core.registerPostTypeSchema', postType);
};
;
function setCurrentTemplateId(id) {
  return {
    type: 'SET_CURRENT_TEMPLATE_ID',
    id
  };
}
const createTemplate = template => async ({
  select,
  dispatch,
  registry
}) => {
  const savedTemplate = await registry.dispatch(external_wp_coreData_namespaceObject.store).saveEntityRecord('postType', 'wp_template', template);
  registry.dispatch(external_wp_coreData_namespaceObject.store).editEntityRecord('postType', select.getCurrentPostType(), select.getCurrentPostId(), {
    template: savedTemplate.slug
  });
  registry.dispatch(external_wp_notices_namespaceObject.store).createSuccessNotice((0,external_wp_i18n_namespaceObject.__)("Custom template created. You're in template mode now."), {
    type: 'snackbar',
    actions: [{
      label: (0,external_wp_i18n_namespaceObject.__)('Go back'),
      onClick: () => dispatch.setRenderingMode(select.getEditorSettings().defaultRenderingMode)
    }]
  });
  return savedTemplate;
};
const showBlockTypes = blockNames => ({
  registry
}) => {
  var _registry$select$get;
  const existingBlockNames = (_registry$select$get = registry.select(external_wp_preferences_namespaceObject.store).get('core', 'hiddenBlockTypes')) !== null && _registry$select$get !== void 0 ? _registry$select$get : [];
  const newBlockNames = existingBlockNames.filter(type => !(Array.isArray(blockNames) ? blockNames : [blockNames]).includes(type));
  registry.dispatch(external_wp_preferences_namespaceObject.store).set('core', 'hiddenBlockTypes', newBlockNames);
};
const hideBlockTypes = blockNames => ({
  registry
}) => {
  var _registry$select$get2;
  const existingBlockNames = (_registry$select$get2 = registry.select(external_wp_preferences_namespaceObject.store).get('core', 'hiddenBlockTypes')) !== null && _registry$select$get2 !== void 0 ? _registry$select$get2 : [];
  const mergedBlockNames = new Set([...existingBlockNames, ...(Array.isArray(blockNames) ? blockNames : [blockNames])]);
  registry.dispatch(external_wp_preferences_namespaceObject.store).set('core', 'hiddenBlockTypes', [...mergedBlockNames]);
};
const saveDirtyEntities = ({
  onSave,
  dirtyEntityRecords = [],
  entitiesToSkip = [],
  close
} = {}) => ({
  registry
}) => {
  const PUBLISH_ON_SAVE_ENTITIES = [{
    kind: 'postType',
    name: 'wp_navigation'
  }];
  const saveNoticeId = 'site-editor-save-success';
  const homeUrl = registry.select(external_wp_coreData_namespaceObject.store).getEntityRecord('root', '__unstableBase')?.home;
  registry.dispatch(external_wp_notices_namespaceObject.store).removeNotice(saveNoticeId);
  const entitiesToSave = dirtyEntityRecords.filter(({
    kind,
    name,
    key,
    property
  }) => {
    return !entitiesToSkip.some(elt => elt.kind === kind && elt.name === name && elt.key === key && elt.property === property);
  });
  close?.(entitiesToSave);
  const siteItemsToSave = [];
  const pendingSavedRecords = [];
  entitiesToSave.forEach(({
    kind,
    name,
    key,
    property
  }) => {
    if ('root' === kind && 'site' === name) {
      siteItemsToSave.push(property);
    } else {
      if (PUBLISH_ON_SAVE_ENTITIES.some(typeToPublish => typeToPublish.kind === kind && typeToPublish.name === name)) {
        registry.dispatch(external_wp_coreData_namespaceObject.store).editEntityRecord(kind, name, key, {
          status: 'publish'
        });
      }
      pendingSavedRecords.push(registry.dispatch(external_wp_coreData_namespaceObject.store).saveEditedEntityRecord(kind, name, key));
    }
  });
  if (siteItemsToSave.length) {
    pendingSavedRecords.push(registry.dispatch(external_wp_coreData_namespaceObject.store).__experimentalSaveSpecifiedEntityEdits('root', 'site', undefined, siteItemsToSave));
  }
  registry.dispatch(external_wp_blockEditor_namespaceObject.store).__unstableMarkLastChangeAsPersistent();
  Promise.all(pendingSavedRecords).then(values => {
    return onSave ? onSave(values) : values;
  }).then(values => {
    if (values.some(value => typeof value === 'undefined')) {
      registry.dispatch(external_wp_notices_namespaceObject.store).createErrorNotice((0,external_wp_i18n_namespaceObject.__)('Saving failed.'));
    } else {
      registry.dispatch(external_wp_notices_namespaceObject.store).createSuccessNotice((0,external_wp_i18n_namespaceObject.__)('Site updated.'), {
        type: 'snackbar',
        id: saveNoticeId,
        actions: [{
          label: (0,external_wp_i18n_namespaceObject.__)('View site'),
          url: homeUrl
        }]
      });
    }
  }).catch(error => registry.dispatch(external_wp_notices_namespaceObject.store).createErrorNotice(`${(0,external_wp_i18n_namespaceObject.__)('Saving failed.')} ${error}`));
};
const private_actions_revertTemplate = (template, {
  allowUndo = true
} = {}) => async ({
  registry
}) => {
  const noticeId = 'edit-site-template-reverted';
  registry.dispatch(external_wp_notices_namespaceObject.store).removeNotice(noticeId);
  if (!isTemplateRevertable(template)) {
    registry.dispatch(external_wp_notices_namespaceObject.store).createErrorNotice((0,external_wp_i18n_namespaceObject.__)('This template is not revertable.'), {
      type: 'snackbar'
    });
    return;
  }
  try {
    const templateEntityConfig = registry.select(external_wp_coreData_namespaceObject.store).getEntityConfig('postType', template.type);
    if (!templateEntityConfig) {
      registry.dispatch(external_wp_notices_namespaceObject.store).createErrorNotice((0,external_wp_i18n_namespaceObject.__)('The editor has encountered an unexpected error. Please reload.'), {
        type: 'snackbar'
      });
      return;
    }
    const fileTemplatePath = (0,external_wp_url_namespaceObject.addQueryArgs)(`${templateEntityConfig.baseURL}/${template.id}`, {
      context: 'edit',
      source: template.origin
    });
    const fileTemplate = await external_wp_apiFetch_default()({
      path: fileTemplatePath
    });
    if (!fileTemplate) {
      registry.dispatch(external_wp_notices_namespaceObject.store).createErrorNotice((0,external_wp_i18n_namespaceObject.__)('The editor has encountered an unexpected error. Please reload.'), {
        type: 'snackbar'
      });
      return;
    }
    const serializeBlocks = ({
      blocks: blocksForSerialization = []
    }) => (0,external_wp_blocks_namespaceObject.__unstableSerializeAndClean)(blocksForSerialization);
    const edited = registry.select(external_wp_coreData_namespaceObject.store).getEditedEntityRecord('postType', template.type, template.id);
    registry.dispatch(external_wp_coreData_namespaceObject.store).editEntityRecord('postType', template.type, template.id, {
      content: serializeBlocks,
      blocks: edited.blocks,
      source: 'custom' 
    }, {
      undoIgnore: true 
    });
    const blocks = (0,external_wp_blocks_namespaceObject.parse)(fileTemplate?.content?.raw);
    registry.dispatch(external_wp_coreData_namespaceObject.store).editEntityRecord('postType', template.type, fileTemplate.id, {
      content: serializeBlocks,
      blocks,
      source: 'theme'
    });
    if (allowUndo) {
      const undoRevert = () => {
        registry.dispatch(external_wp_coreData_namespaceObject.store).editEntityRecord('postType', template.type, edited.id, {
          content: serializeBlocks,
          blocks: edited.blocks,
          source: 'custom'
        });
      };
      registry.dispatch(external_wp_notices_namespaceObject.store).createSuccessNotice((0,external_wp_i18n_namespaceObject.__)('Template reset.'), {
        type: 'snackbar',
        id: noticeId,
        actions: [{
          label: (0,external_wp_i18n_namespaceObject.__)('Undo'),
          onClick: undoRevert
        }]
      });
    }
  } catch (error) {
    const errorMessage = error.message && error.code !== 'unknown_error' ? error.message : (0,external_wp_i18n_namespaceObject.__)('Template revert failed. Please reload.');
    registry.dispatch(external_wp_notices_namespaceObject.store).createErrorNotice(errorMessage, {
      type: 'snackbar'
    });
  }
};
const removeTemplates = items => async ({
  registry
}) => {
  const isResetting = items.every(item => item?.has_theme_file);
  const promiseResult = await Promise.allSettled(items.map(item => {
    return registry.dispatch(external_wp_coreData_namespaceObject.store).deleteEntityRecord('postType', item.type, item.id, {
      force: true
    }, {
      throwOnError: true
    });
  }));
  if (promiseResult.every(({
    status
  }) => status === 'fulfilled')) {
    let successMessage;
    if (items.length === 1) {
      let title;
      if (typeof items[0].title === 'string') {
        title = items[0].title;
      } else if (typeof items[0].title?.rendered === 'string') {
        title = items[0].title?.rendered;
      } else if (typeof items[0].title?.raw === 'string') {
        title = items[0].title?.raw;
      }
      successMessage = isResetting ? (0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject.__)('"%s" reset.'), (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(title)) : (0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject._x)('"%s" deleted.', 'template part'), (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(title));
    } else {
      successMessage = isResetting ? (0,external_wp_i18n_namespaceObject.__)('Items reset.') : (0,external_wp_i18n_namespaceObject.__)('Items deleted.');
    }
    registry.dispatch(external_wp_notices_namespaceObject.store).createSuccessNotice(successMessage, {
      type: 'snackbar',
      id: 'editor-template-deleted-success'
    });
  } else {
    let errorMessage;
    if (promiseResult.length === 1) {
      if (promiseResult[0].reason?.message) {
        errorMessage = promiseResult[0].reason.message;
      } else {
        errorMessage = isResetting ? (0,external_wp_i18n_namespaceObject.__)('An error occurred while reverting the item.') : (0,external_wp_i18n_namespaceObject.__)('An error occurred while deleting the item.');
      }
    } else {
      const errorMessages = new Set();
      const failedPromises = promiseResult.filter(({
        status
      }) => status === 'rejected');
      for (const failedPromise of failedPromises) {
        if (failedPromise.reason?.message) {
          errorMessages.add(failedPromise.reason.message);
        }
      }
      if (errorMessages.size === 0) {
        errorMessage = (0,external_wp_i18n_namespaceObject.__)('An error occurred while deleting the items.');
      } else if (errorMessages.size === 1) {
        errorMessage = isResetting ? (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject.__)('An error occurred while reverting the items: %s'), [...errorMessages][0]) : (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject.__)('An error occurred while deleting the items: %s'), [...errorMessages][0]);
      } else {
        errorMessage = isResetting ? (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject.__)('Some errors occurred while reverting the items: %s'), [...errorMessages].join(',')) : (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject.__)('Some errors occurred while deleting the items: %s'), [...errorMessages].join(','));
      }
    }
    registry.dispatch(external_wp_notices_namespaceObject.store).createErrorNotice(errorMessage, {
      type: 'snackbar'
    });
  }
};
const setDefaultRenderingMode = mode => ({
  select,
  registry
}) => {
  var _registry$select$get$;
  const postType = select.getCurrentPostType();
  const theme = registry.select(external_wp_coreData_namespaceObject.store).getCurrentTheme()?.stylesheet;
  const renderingModes = (_registry$select$get$ = registry.select(external_wp_preferences_namespaceObject.store).get('core', 'renderingModes')?.[theme]) !== null && _registry$select$get$ !== void 0 ? _registry$select$get$ : {};
  if (renderingModes[postType] === mode) {
    return;
  }
  const newModes = {
    [theme]: {
      ...renderingModes,
      [postType]: mode
    }
  };
  registry.dispatch(external_wp_preferences_namespaceObject.store).set('core', 'renderingModes', newModes);
};
var fast_deep_equal = __webpack_require__(5215);
var fast_deep_equal_default = __webpack_require__.n(fast_deep_equal);
;
const navigation = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14.5c-3.6 0-6.5-2.9-6.5-6.5S8.4 5.5 12 5.5s6.5 2.9 6.5 6.5-2.9 6.5-6.5 6.5zM9 16l4.5-3L15 8.4l-4.5 3L9 16z"
  })
});
 const library_navigation = (navigation);
;
const verse = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M17.8 2l-.9.3c-.1 0-3.6 1-5.2 2.1C10 5.5 9.3 6.5 8.9 7.1c-.6.9-1.7 4.7-1.7 6.3l-.9 2.3c-.2.4 0 .8.4 1 .1 0 .2.1.3.1.3 0 .6-.2.7-.5l.6-1.5c.3 0 .7-.1 1.2-.2.7-.1 1.4-.3 2.2-.5.8-.2 1.6-.5 2.4-.8.7-.3 1.4-.7 1.9-1.2s.8-1.2 1-1.9c.2-.7.3-1.6.4-2.4.1-.8.1-1.7.2-2.5 0-.8.1-1.5.2-2.1V2zm-1.9 5.6c-.1.8-.2 1.5-.3 2.1-.2.6-.4 1-.6 1.3-.3.3-.8.6-1.4.9-.7.3-1.4.5-2.2.8-.6.2-1.3.3-1.8.4L15 7.5c.3-.3.6-.7 1-1.1 0 .4 0 .8-.1 1.2zM6 20h8v-1.5H6V20z"
  })
});
 const library_verse = (verse);
;
const private_selectors_EMPTY_ARRAY = [];
function getEntityActions(state, kind, name) {
  var _state$actions$kind$n;
  return (_state$actions$kind$n = state.actions[kind]?.[name]) !== null && _state$actions$kind$n !== void 0 ? _state$actions$kind$n : private_selectors_EMPTY_ARRAY;
}
function getEntityFields(state, kind, name) {
  var _state$fields$kind$na;
  return (_state$fields$kind$na = state.fields[kind]?.[name]) !== null && _state$fields$kind$na !== void 0 ? _state$fields$kind$na : private_selectors_EMPTY_ARRAY;
}
function isEntityReady(state, kind, name) {
  return state.isReady[kind]?.[name];
}
;
const EMPTY_INSERTION_POINT = {
  rootClientId: undefined,
  insertionIndex: undefined,
  filterValue: undefined
};
const RENDERING_MODES = ['post-only', 'template-locked'];
const getInserter = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (0,external_wp_data_namespaceObject.createSelector)(state => {
  if (typeof state.blockInserterPanel === 'object') {
    return state.blockInserterPanel;
  }
  if (getRenderingMode(state) === 'template-locked') {
    const [postContentClientId] = select(external_wp_blockEditor_namespaceObject.store).getBlocksByName('core/post-content');
    if (postContentClientId) {
      return {
        rootClientId: postContentClientId,
        insertionIndex: undefined,
        filterValue: undefined
      };
    }
  }
  return EMPTY_INSERTION_POINT;
}, state => {
  const [postContentClientId] = select(external_wp_blockEditor_namespaceObject.store).getBlocksByName('core/post-content');
  return [state.blockInserterPanel, getRenderingMode(state), postContentClientId];
}));
function getListViewToggleRef(state) {
  return state.listViewToggleRef;
}
function getInserterSidebarToggleRef(state) {
  return state.inserterSidebarToggleRef;
}
const CARD_ICONS = {
  wp_block: library_symbol,
  wp_navigation: library_navigation,
  page: library_page,
  post: library_verse
};
const getPostIcon = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, postType, options) => {
  {
    if (postType === 'wp_template_part' || postType === 'wp_template') {
      const templateAreas = select(external_wp_coreData_namespaceObject.store).getCurrentTheme()?.default_template_part_areas || [];
      const areaData = templateAreas.find(item => options.area === item.area);
      if (areaData?.icon) {
        return getTemplatePartIcon(areaData.icon);
      }
      return library_layout;
    }
    if (CARD_ICONS[postType]) {
      return CARD_ICONS[postType];
    }
    const postTypeEntity = select(external_wp_coreData_namespaceObject.store).getPostType(postType);
    if (typeof postTypeEntity?.icon === 'string' && postTypeEntity.icon.startsWith('dashicons-')) {
      return postTypeEntity.icon.slice(10);
    }
    return library_page;
  }
});
const hasPostMetaChanges = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, postType, postId) => {
  const {
    type: currentPostType,
    id: currentPostId
  } = getCurrentPost(state);
  const edits = select(external_wp_coreData_namespaceObject.store).getEntityRecordNonTransientEdits('postType', postType || currentPostType, postId || currentPostId);
  if (!edits?.meta) {
    return false;
  }
  const originalPostMeta = select(external_wp_coreData_namespaceObject.store).getEntityRecord('postType', postType || currentPostType, postId || currentPostId)?.meta;
  return !fast_deep_equal_default()({
    ...originalPostMeta,
    footnotes: undefined
  }, {
    ...edits.meta,
    footnotes: undefined
  });
});
function private_selectors_getEntityActions(state, ...args) {
  return getEntityActions(state.dataviews, ...args);
}
function private_selectors_isEntityReady(state, ...args) {
  return isEntityReady(state.dataviews, ...args);
}
function private_selectors_getEntityFields(state, ...args) {
  return getEntityFields(state.dataviews, ...args);
}
const getPostBlocksByName = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (0,external_wp_data_namespaceObject.createSelector)((state, blockNames) => {
  blockNames = Array.isArray(blockNames) ? blockNames : [blockNames];
  const {
    getBlocksByName,
    getBlockParents,
    getBlockName
  } = select(external_wp_blockEditor_namespaceObject.store);
  return getBlocksByName(blockNames).filter(clientId => getBlockParents(clientId).every(parentClientId => {
    const parentBlockName = getBlockName(parentClientId);
    return (
      parentBlockName !== 'core/query' &&
      !blockNames.includes(parentBlockName)
    );
  }));
}, () => [select(external_wp_blockEditor_namespaceObject.store).getBlocks()]));
const getDefaultRenderingMode = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, postType) => {
  const {
    getPostType,
    getCurrentTheme,
    hasFinishedResolution
  } = select(external_wp_coreData_namespaceObject.store);
  const currentTheme = getCurrentTheme();
  const postTypeEntity = getPostType(postType);
  if (!hasFinishedResolution('getPostType', [postType]) || !hasFinishedResolution('getCurrentTheme')) {
    return undefined;
  }
  const theme = currentTheme?.stylesheet;
  const defaultModePreference = select(external_wp_preferences_namespaceObject.store).get('core', 'renderingModes')?.[theme]?.[postType];
  const postTypeDefaultMode = Array.isArray(postTypeEntity?.supports?.editor) ? postTypeEntity.supports.editor.find(features => 'default-mode' in features)?.['default-mode'] : undefined;
  const defaultMode = defaultModePreference || postTypeDefaultMode;
  if (!RENDERING_MODES.includes(defaultMode)) {
    return 'post-only';
  }
  return defaultMode;
});
;
const storeConfig = {
  reducer: store_reducer,
  selectors: selectors_namespaceObject,
  actions: actions_namespaceObject
};
const store_store = (0,external_wp_data_namespaceObject.createReduxStore)(STORE_NAME, {
  ...storeConfig
});
(0,external_wp_data_namespaceObject.register)(store_store);
unlock(store_store).registerPrivateActions(store_private_actions_namespaceObject);
unlock(store_store).registerPrivateSelectors(store_private_selectors_namespaceObject);
;
const createWithMetaAttributeSource = metaAttributes => (0,external_wp_compose_namespaceObject.createHigherOrderComponent)(BlockEdit => ({
  attributes,
  setAttributes,
  ...props
}) => {
  const postType = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).getCurrentPostType(), []);
  const [meta, setMeta] = (0,external_wp_coreData_namespaceObject.useEntityProp)('postType', postType, 'meta');
  const mergedAttributes = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    ...attributes,
    ...Object.fromEntries(Object.entries(metaAttributes).map(([attributeKey, metaKey]) => [attributeKey, meta[metaKey]]))
  }), [attributes, meta]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(BlockEdit, {
    attributes: mergedAttributes,
    setAttributes: nextAttributes => {
      const nextMeta = Object.fromEntries(Object.entries(nextAttributes !== null && nextAttributes !== void 0 ? nextAttributes : {}).filter(
      ([key]) => key in metaAttributes).map(([attributeKey, value]) => [
      metaAttributes[attributeKey], value]));
      if (Object.entries(nextMeta).length) {
        setMeta(nextMeta);
      }
      setAttributes(nextAttributes);
    },
    ...props
  });
}, 'withMetaAttributeSource');
function shimAttributeSource(settings) {
  var _settings$attributes;
  const metaAttributes = Object.fromEntries(Object.entries((_settings$attributes = settings.attributes) !== null && _settings$attributes !== void 0 ? _settings$attributes : {}).filter(([, {
    source
  }]) => source === 'meta').map(([attributeKey, {
    meta
  }]) => [attributeKey, meta]));
  if (Object.entries(metaAttributes).length) {
    settings.edit = createWithMetaAttributeSource(metaAttributes)(settings.edit);
  }
  return settings;
}
(0,external_wp_hooks_namespaceObject.addFilter)('blocks.registerBlockType', 'core/editor/custom-sources-backwards-compatibility/shim-attribute-source', shimAttributeSource);
;
function getUserLabel(user) {
  const avatar = user.avatar_urls && user.avatar_urls[24] ? (0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
    className: "editor-autocompleters__user-avatar",
    alt: "",
    src: user.avatar_urls[24]
  }) : (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
    className: "editor-autocompleters__no-avatar"
  });
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [avatar, (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
      className: "editor-autocompleters__user-name",
      children: user.name
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
      className: "editor-autocompleters__user-slug",
      children: user.slug
    })]
  });
}
 const user = ({
  name: 'users',
  className: 'editor-autocompleters__user',
  triggerPrefix: '@',
  useItems(filterValue) {
    const users = (0,external_wp_data_namespaceObject.useSelect)(select => {
      const {
        getUsers
      } = select(external_wp_coreData_namespaceObject.store);
      return getUsers({
        context: 'view',
        search: encodeURIComponent(filterValue)
      });
    }, [filterValue]);
    const options = (0,external_wp_element_namespaceObject.useMemo)(() => users ? users.map(user => ({
      key: `user-${user.slug}`,
      value: user,
      label: getUserLabel(user)
    })) : [], [users]);
    return [options];
  },
  getOptionCompletion(user) {
    return `@${user.slug}`;
  }
});
;
function setDefaultCompleters(completers = []) {
  completers.push({
    ...user
  });
  return completers;
}
(0,external_wp_hooks_namespaceObject.addFilter)('editor.Autocomplete.completers', 'editor/autocompleters/set-default-completers', setDefaultCompleters);
;
(0,external_wp_hooks_namespaceObject.addFilter)('editor.MediaUpload', 'core/editor/components/media-upload', () => external_wp_mediaUtils_namespaceObject.MediaUpload);
;
const {
  PatternOverridesControls,
  ResetOverridesControl,
  PatternOverridesBlockControls,
  PATTERN_TYPES: pattern_overrides_PATTERN_TYPES,
  PARTIAL_SYNCING_SUPPORTED_BLOCKS,
  PATTERN_SYNC_TYPES
} = unlock(external_wp_patterns_namespaceObject.privateApis);
const withPatternOverrideControls = (0,external_wp_compose_namespaceObject.createHigherOrderComponent)(BlockEdit => props => {
  const isSupportedBlock = !!PARTIAL_SYNCING_SUPPORTED_BLOCKS[props.name];
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(BlockEdit, {
      ...props
    }, "edit"), props.isSelected && isSupportedBlock && (0,external_ReactJSXRuntime_namespaceObject.jsx)(ControlsWithStoreSubscription, {
      ...props
    }), isSupportedBlock && (0,external_ReactJSXRuntime_namespaceObject.jsx)(PatternOverridesBlockControls, {})]
  });
}, 'withPatternOverrideControls');
function ControlsWithStoreSubscription(props) {
  const blockEditingMode = (0,external_wp_blockEditor_namespaceObject.useBlockEditingMode)();
  const {
    hasPatternOverridesSource,
    isEditingSyncedPattern
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostType,
      getEditedPostAttribute
    } = select(store_store);
    return {
      hasPatternOverridesSource: !!(0,external_wp_blocks_namespaceObject.getBlockBindingsSource)('core/pattern-overrides'),
      isEditingSyncedPattern: getCurrentPostType() === pattern_overrides_PATTERN_TYPES.user && getEditedPostAttribute('meta')?.wp_pattern_sync_status !== PATTERN_SYNC_TYPES.unsynced && getEditedPostAttribute('wp_pattern_sync_status') !== PATTERN_SYNC_TYPES.unsynced
    };
  }, []);
  const bindings = props.attributes.metadata?.bindings;
  const hasPatternBindings = !!bindings && Object.values(bindings).some(binding => binding.source === 'core/pattern-overrides');
  const shouldShowPatternOverridesControls = isEditingSyncedPattern && blockEditingMode === 'default';
  const shouldShowResetOverridesControl = !isEditingSyncedPattern && !!props.attributes.metadata?.name && blockEditingMode !== 'disabled' && hasPatternBindings;
  if (!hasPatternOverridesSource) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [shouldShowPatternOverridesControls && (0,external_ReactJSXRuntime_namespaceObject.jsx)(PatternOverridesControls, {
      ...props
    }), shouldShowResetOverridesControl && (0,external_ReactJSXRuntime_namespaceObject.jsx)(ResetOverridesControl, {
      ...props
    })]
  });
}
(0,external_wp_hooks_namespaceObject.addFilter)('editor.BlockEdit', 'core/editor/with-pattern-override-controls', withPatternOverrideControls);
;
;
;
class AutosaveMonitor extends external_wp_element_namespaceObject.Component {
  constructor(props) {
    super(props);
    this.needsAutosave = !!(props.isDirty && props.isAutosaveable);
  }
  componentDidMount() {
    if (!this.props.disableIntervalChecks) {
      this.setAutosaveTimer();
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.disableIntervalChecks) {
      if (this.props.editsReference !== prevProps.editsReference) {
        this.props.autosave();
      }
      return;
    }
    if (this.props.interval !== prevProps.interval) {
      clearTimeout(this.timerId);
      this.setAutosaveTimer();
    }
    if (!this.props.isDirty) {
      this.needsAutosave = false;
      return;
    }
    if (this.props.isAutosaving && !prevProps.isAutosaving) {
      this.needsAutosave = false;
      return;
    }
    if (this.props.editsReference !== prevProps.editsReference) {
      this.needsAutosave = true;
    }
  }
  componentWillUnmount() {
    clearTimeout(this.timerId);
  }
  setAutosaveTimer(timeout = this.props.interval * 1000) {
    this.timerId = setTimeout(() => {
      this.autosaveTimerHandler();
    }, timeout);
  }
  autosaveTimerHandler() {
    if (!this.props.isAutosaveable) {
      this.setAutosaveTimer(1000);
      return;
    }
    if (this.needsAutosave) {
      this.needsAutosave = false;
      this.props.autosave();
    }
    this.setAutosaveTimer();
  }
  render() {
    return null;
  }
}
 const autosave_monitor = ((0,external_wp_compose_namespaceObject.compose)([(0,external_wp_data_namespaceObject.withSelect)((select, ownProps) => {
  const {
    getReferenceByDistinctEdits
  } = select(external_wp_coreData_namespaceObject.store);
  const {
    isEditedPostDirty,
    isEditedPostAutosaveable,
    isAutosavingPost,
    getEditorSettings
  } = select(store_store);
  const {
    interval = getEditorSettings().autosaveInterval
  } = ownProps;
  return {
    editsReference: getReferenceByDistinctEdits(),
    isDirty: isEditedPostDirty(),
    isAutosaveable: isEditedPostAutosaveable(),
    isAutosaving: isAutosavingPost(),
    interval
  };
}), (0,external_wp_data_namespaceObject.withDispatch)((dispatch, ownProps) => ({
  autosave() {
    const {
      autosave = dispatch(store_store).autosave
    } = ownProps;
    autosave();
  }
}))])(AutosaveMonitor));
;
const chevronRightSmall = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M10.8622 8.04053L14.2805 12.0286L10.8622 16.0167L9.72327 15.0405L12.3049 12.0286L9.72327 9.01672L10.8622 8.04053Z"
  })
});
 const chevron_right_small = (chevronRightSmall);
;
const chevronLeftSmall = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "m13.1 16-3.4-4 3.4-4 1.1 1-2.6 3 2.6 3-1.1 1z"
  })
});
 const chevron_left_small = (chevronLeftSmall);
;
const external_wp_dom_namespaceObject = window["wp"]["dom"];
;
function usePageTypeBadge(postId) {
  const {
    isFrontPage,
    isPostsPage
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      canUser,
      getEditedEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    const siteSettings = canUser('read', {
      kind: 'root',
      name: 'site'
    }) ? getEditedEntityRecord('root', 'site') : undefined;
    const _postId = parseInt(postId, 10);
    return {
      isFrontPage: siteSettings?.page_on_front === _postId,
      isPostsPage: siteSettings?.page_for_posts === _postId
    };
  });
  if (isFrontPage) {
    return (0,external_wp_i18n_namespaceObject.__)('Homepage');
  } else if (isPostsPage) {
    return (0,external_wp_i18n_namespaceObject.__)('Posts Page');
  }
  return false;
}
;
const MotionButton = (0,external_wp_components_namespaceObject.__unstableMotion)(external_wp_components_namespaceObject.Button);
function DocumentBar(props) {
  const {
    postId,
    postType,
    postTypeLabel,
    documentTitle,
    isNotFound,
    templateTitle,
    onNavigateToPreviousEntityRecord,
    isTemplatePreview
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _getCurrentTheme;
    const {
      getCurrentPostType,
      getCurrentPostId,
      getEditorSettings,
      getRenderingMode
    } = select(store_store);
    const {
      getEditedEntityRecord,
      getPostType,
      getCurrentTheme,
      isResolving: isResolvingSelector
    } = select(external_wp_coreData_namespaceObject.store);
    const _postType = getCurrentPostType();
    const _postId = getCurrentPostId();
    const _document = getEditedEntityRecord('postType', _postType, _postId);
    const {
      default_template_types: templateTypes = []
    } = (_getCurrentTheme = getCurrentTheme()) !== null && _getCurrentTheme !== void 0 ? _getCurrentTheme : {};
    const _templateInfo = getTemplateInfo({
      templateTypes,
      template: _document
    });
    const _postTypeLabel = getPostType(_postType)?.labels?.singular_name;
    return {
      postId: _postId,
      postType: _postType,
      postTypeLabel: _postTypeLabel,
      documentTitle: _document.title,
      isNotFound: !_document && !isResolvingSelector('getEditedEntityRecord', 'postType', _postType, _postId),
      templateTitle: _templateInfo.title,
      onNavigateToPreviousEntityRecord: getEditorSettings().onNavigateToPreviousEntityRecord,
      isTemplatePreview: getRenderingMode() === 'template-locked'
    };
  }, []);
  const {
    open: openCommandCenter
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_commands_namespaceObject.store);
  const isReducedMotion = (0,external_wp_compose_namespaceObject.useReducedMotion)();
  const isTemplate = TEMPLATE_POST_TYPES.includes(postType);
  const hasBackButton = !!onNavigateToPreviousEntityRecord;
  const entityTitle = isTemplate ? templateTitle : documentTitle;
  const title = props.title || entityTitle;
  const icon = props.icon;
  const pageTypeBadge = usePageTypeBadge(postId);
  const mountedRef = (0,external_wp_element_namespaceObject.useRef)(false);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    mountedRef.current = true;
  }, []);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: dist_clsx('editor-document-bar', {
      'has-back-button': hasBackButton
    }),
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__unstableAnimatePresence, {
      children: hasBackButton && (0,external_ReactJSXRuntime_namespaceObject.jsx)(MotionButton, {
        className: "editor-document-bar__back",
        icon: (0,external_wp_i18n_namespaceObject.isRTL)() ? chevron_right_small : chevron_left_small,
        onClick: event => {
          event.stopPropagation();
          onNavigateToPreviousEntityRecord();
        },
        size: "compact",
        initial: mountedRef.current ? {
          opacity: 0,
          transform: 'translateX(15%)'
        } : false 
        ,
        animate: {
          opacity: 1,
          transform: 'translateX(0%)'
        },
        exit: {
          opacity: 0,
          transform: 'translateX(15%)'
        },
        transition: isReducedMotion ? {
          duration: 0
        } : undefined,
        children: (0,external_wp_i18n_namespaceObject.__)('Back')
      })
    }), !isTemplate && isTemplatePreview && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockIcon, {
      icon: library_layout,
      className: "editor-document-bar__icon-layout"
    }), isNotFound ? (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
      children: (0,external_wp_i18n_namespaceObject.__)('Document not found')
    }) : (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.Button, {
      className: "editor-document-bar__command",
      onClick: () => openCommandCenter(),
      size: "compact",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__unstableMotion.div, {
        className: "editor-document-bar__title"
        ,
        initial: mountedRef.current ? {
          opacity: 0,
          transform: hasBackButton ? 'translateX(15%)' : 'translateX(-15%)'
        } : false 
        ,
        animate: {
          opacity: 1,
          transform: 'translateX(0%)'
        },
        transition: isReducedMotion ? {
          duration: 0
        } : undefined,
        children: [icon && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockIcon, {
          icon: icon
        }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalText, {
          size: "body",
          as: "h1",
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
            className: "editor-document-bar__post-title",
            children: title ? (0,external_wp_dom_namespaceObject.__unstableStripHTML)(title) : (0,external_wp_i18n_namespaceObject.__)('No title')
          }), pageTypeBadge && (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
            className: "editor-document-bar__post-type-label",
            children: `· ${pageTypeBadge}`
          }), postTypeLabel && !props.title && !pageTypeBadge && (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
            className: "editor-document-bar__post-type-label",
            children: `· ${(0,external_wp_htmlEntities_namespaceObject.decodeEntities)(postTypeLabel)}`
          })]
        })]
      }, hasBackButton), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
        className: "editor-document-bar__shortcut",
        children: external_wp_keycodes_namespaceObject.displayShortcut.primary('k')
      })]
    })]
  });
}
;
const external_wp_richText_namespaceObject = window["wp"]["richText"];
;
const TableOfContentsItem = ({
  children,
  isValid,
  isDisabled,
  level,
  href,
  onSelect
}) => {
  function handleClick(event) {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onSelect();
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("li", {
    className: dist_clsx('document-outline__item', `is-${level.toLowerCase()}`, {
      'is-invalid': !isValid,
      'is-disabled': isDisabled
    }),
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)("a", {
      href: href,
      className: "document-outline__button",
      "aria-disabled": isDisabled,
      onClick: handleClick,
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
        className: "document-outline__emdash",
        "aria-hidden": "true"
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("strong", {
        className: "document-outline__level",
        children: level
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
        className: "document-outline__item-content",
        children: children
      })]
    })
  });
};
 const document_outline_item = (TableOfContentsItem);
;
const emptyHeadingContent = (0,external_ReactJSXRuntime_namespaceObject.jsx)("em", {
  children: (0,external_wp_i18n_namespaceObject.__)('(Empty heading)')
});
const incorrectLevelContent = [(0,external_ReactJSXRuntime_namespaceObject.jsx)("br", {}, "incorrect-break"), (0,external_ReactJSXRuntime_namespaceObject.jsx)("em", {
  children: (0,external_wp_i18n_namespaceObject.__)('(Incorrect heading level)')
}, "incorrect-message")];
const singleH1Headings = [(0,external_ReactJSXRuntime_namespaceObject.jsx)("br", {}, "incorrect-break-h1"), (0,external_ReactJSXRuntime_namespaceObject.jsx)("em", {
  children: (0,external_wp_i18n_namespaceObject.__)('(Your theme may already use a H1 for the post title)')
}, "incorrect-message-h1")];
const multipleH1Headings = [(0,external_ReactJSXRuntime_namespaceObject.jsx)("br", {}, "incorrect-break-multiple-h1"), (0,external_ReactJSXRuntime_namespaceObject.jsx)("em", {
  children: (0,external_wp_i18n_namespaceObject.__)('(Multiple H1 headings are not recommended)')
}, "incorrect-message-multiple-h1")];
function EmptyOutlineIllustration() {
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.SVG, {
    width: "138",
    height: "148",
    viewBox: "0 0 138 148",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Rect, {
      width: "138",
      height: "148",
      rx: "4",
      fill: "#F0F6FC"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Line, {
      x1: "44",
      y1: "28",
      x2: "24",
      y2: "28",
      stroke: "#DDDDDD"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Rect, {
      x: "48",
      y: "16",
      width: "27",
      height: "23",
      rx: "4",
      fill: "#DDDDDD"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Path, {
      d: "M54.7585 32V23.2727H56.6037V26.8736H60.3494V23.2727H62.1903V32H60.3494V28.3949H56.6037V32H54.7585ZM67.4574 23.2727V32H65.6122V25.0241H65.5611L63.5625 26.277V24.6406L65.723 23.2727H67.4574Z",
      fill: "black"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Line, {
      x1: "55",
      y1: "59",
      x2: "24",
      y2: "59",
      stroke: "#DDDDDD"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Rect, {
      x: "59",
      y: "47",
      width: "29",
      height: "23",
      rx: "4",
      fill: "#DDDDDD"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Path, {
      d: "M65.7585 63V54.2727H67.6037V57.8736H71.3494V54.2727H73.1903V63H71.3494V59.3949H67.6037V63H65.7585ZM74.6605 63V61.6705L77.767 58.794C78.0313 58.5384 78.2528 58.3082 78.4318 58.1037C78.6136 57.8991 78.7514 57.6989 78.8452 57.5028C78.9389 57.304 78.9858 57.0895 78.9858 56.8594C78.9858 56.6037 78.9276 56.3835 78.8111 56.1989C78.6946 56.0114 78.5355 55.8679 78.3338 55.7685C78.1321 55.6662 77.9034 55.6151 77.6477 55.6151C77.3807 55.6151 77.1477 55.669 76.9489 55.777C76.75 55.8849 76.5966 56.0398 76.4886 56.2415C76.3807 56.4432 76.3267 56.6832 76.3267 56.9616H74.5753C74.5753 56.3906 74.7045 55.8949 74.9631 55.4744C75.2216 55.054 75.5838 54.7287 76.0497 54.4986C76.5156 54.2685 77.0526 54.1534 77.6605 54.1534C78.2855 54.1534 78.8295 54.2642 79.2926 54.4858C79.7585 54.7045 80.1207 55.0085 80.3793 55.3977C80.6378 55.7869 80.767 56.233 80.767 56.7358C80.767 57.0653 80.7017 57.3906 80.571 57.7116C80.4432 58.0327 80.2145 58.3892 79.8849 58.7812C79.5554 59.1705 79.0909 59.6378 78.4915 60.1832L77.2173 61.4318V61.4915H80.8821V63H74.6605Z",
      fill: "black"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Line, {
      x1: "80",
      y1: "90",
      x2: "24",
      y2: "90",
      stroke: "#DDDDDD"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Rect, {
      x: "84",
      y: "78",
      width: "30",
      height: "23",
      rx: "4",
      fill: "#F0B849"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Path, {
      d: "M90.7585 94V85.2727H92.6037V88.8736H96.3494V85.2727H98.1903V94H96.3494V90.3949H92.6037V94H90.7585ZM99.5284 92.4659V91.0128L103.172 85.2727H104.425V87.2841H103.683L101.386 90.919V90.9872H106.564V92.4659H99.5284ZM103.717 94V92.0227L103.751 91.3793V85.2727H105.482V94H103.717Z",
      fill: "black"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Line, {
      x1: "66",
      y1: "121",
      x2: "24",
      y2: "121",
      stroke: "#DDDDDD"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Rect, {
      x: "70",
      y: "109",
      width: "29",
      height: "23",
      rx: "4",
      fill: "#DDDDDD"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Path, {
      d: "M76.7585 125V116.273H78.6037V119.874H82.3494V116.273H84.1903V125H82.3494V121.395H78.6037V125H76.7585ZM88.8864 125.119C88.25 125.119 87.6832 125.01 87.1861 124.791C86.6918 124.57 86.3011 124.266 86.0142 123.879C85.7301 123.49 85.5838 123.041 85.5753 122.533H87.4332C87.4446 122.746 87.5142 122.933 87.642 123.095C87.7727 123.254 87.946 123.378 88.1619 123.466C88.3778 123.554 88.6207 123.598 88.8906 123.598C89.1719 123.598 89.4205 123.548 89.6364 123.449C89.8523 123.349 90.0213 123.212 90.1435 123.036C90.2656 122.859 90.3267 122.656 90.3267 122.426C90.3267 122.193 90.2614 121.987 90.1307 121.808C90.0028 121.626 89.8182 121.484 89.5767 121.382C89.3381 121.28 89.054 121.229 88.7244 121.229H87.9105V119.874H88.7244C89.0028 119.874 89.2486 119.825 89.4616 119.729C89.6776 119.632 89.8452 119.499 89.9645 119.328C90.0838 119.155 90.1435 118.953 90.1435 118.723C90.1435 118.504 90.0909 118.312 89.9858 118.148C89.8835 117.98 89.7386 117.849 89.5511 117.756C89.3665 117.662 89.1506 117.615 88.9034 117.615C88.6534 117.615 88.4247 117.661 88.2173 117.751C88.0099 117.839 87.8438 117.966 87.7188 118.131C87.5938 118.295 87.527 118.489 87.5185 118.71H85.75C85.7585 118.207 85.902 117.764 86.1804 117.381C86.4588 116.997 86.8338 116.697 87.3054 116.482C87.7798 116.263 88.3153 116.153 88.9119 116.153C89.5142 116.153 90.0412 116.263 90.4929 116.482C90.9446 116.7 91.2955 116.996 91.5455 117.368C91.7983 117.737 91.9233 118.152 91.9205 118.612C91.9233 119.101 91.7713 119.509 91.4645 119.835C91.1605 120.162 90.7642 120.369 90.2756 120.457V120.526C90.9176 120.608 91.4063 120.831 91.7415 121.195C92.0795 121.555 92.2472 122.007 92.2443 122.55C92.2472 123.047 92.1037 123.489 91.8139 123.875C91.527 124.261 91.1307 124.565 90.625 124.787C90.1193 125.009 89.5398 125.119 88.8864 125.119Z",
      fill: "black"
    })]
  });
}
const computeOutlineHeadings = (blocks = []) => {
  return blocks.filter(block => block.name === 'core/heading').map(block => ({
    ...block,
    level: block.attributes.level,
    isEmpty: isEmptyHeading(block)
  }));
};
const isEmptyHeading = heading => !heading.attributes.content || heading.attributes.content.trim().length === 0;
function DocumentOutline({
  onSelect,
  hasOutlineItemsDisabled
}) {
  const {
    selectBlock
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  const {
    title,
    isTitleSupported
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _postType$supports$ti;
    const {
      getEditedPostAttribute
    } = select(store_store);
    const {
      getPostType
    } = select(external_wp_coreData_namespaceObject.store);
    const postType = getPostType(getEditedPostAttribute('type'));
    return {
      title: getEditedPostAttribute('title'),
      isTitleSupported: (_postType$supports$ti = postType?.supports?.title) !== null && _postType$supports$ti !== void 0 ? _postType$supports$ti : false
    };
  });
  const blocks = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getClientIdsWithDescendants,
      getBlock
    } = select(external_wp_blockEditor_namespaceObject.store);
    const clientIds = getClientIdsWithDescendants();
    return clientIds.map(id => getBlock(id));
  });
  const contentBlocks = (0,external_wp_data_namespaceObject.useSelect)(select => {
    if (select(store_store).getRenderingMode() === 'post-only') {
      return undefined;
    }
    const {
      getBlocksByName,
      getClientIdsOfDescendants
    } = select(external_wp_blockEditor_namespaceObject.store);
    const [postContentClientId] = getBlocksByName('core/post-content');
    if (!postContentClientId) {
      return undefined;
    }
    return getClientIdsOfDescendants(postContentClientId);
  }, []);
  const prevHeadingLevelRef = (0,external_wp_element_namespaceObject.useRef)(1);
  const headings = (0,external_wp_element_namespaceObject.useMemo)(() => computeOutlineHeadings(blocks), [blocks]);
  if (headings.length < 1) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "editor-document-outline has-no-headings",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(EmptyOutlineIllustration, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
        children: (0,external_wp_i18n_namespaceObject.__)('Navigate the structure of your document and address issues like empty or incorrect heading levels.')
      })]
    });
  }
  const titleNode = document.querySelector('.editor-post-title__input');
  const hasTitle = isTitleSupported && title && titleNode;
  const countByLevel = headings.reduce((acc, heading) => ({
    ...acc,
    [heading.level]: (acc[heading.level] || 0) + 1
  }), {});
  const hasMultipleH1 = countByLevel[1] > 1;
  function isContentBlock(clientId) {
    return Array.isArray(contentBlocks) ? contentBlocks.includes(clientId) : true;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    className: "document-outline",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)("ul", {
      children: [hasTitle && (0,external_ReactJSXRuntime_namespaceObject.jsx)(document_outline_item, {
        level: (0,external_wp_i18n_namespaceObject.__)('Title'),
        isValid: true,
        onSelect: onSelect,
        href: `#${titleNode.id}`,
        isDisabled: hasOutlineItemsDisabled,
        children: title
      }), headings.map(item => {
        const isIncorrectLevel = item.level > prevHeadingLevelRef.current + 1;
        const isValid = !item.isEmpty && !isIncorrectLevel && !!item.level && (item.level !== 1 || !hasMultipleH1 && !hasTitle);
        prevHeadingLevelRef.current = item.level;
        return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(document_outline_item, {
          level: `H${item.level}`,
          isValid: isValid,
          isDisabled: hasOutlineItemsDisabled || !isContentBlock(item.clientId),
          href: `#block-${item.clientId}`,
          onSelect: () => {
            selectBlock(item.clientId);
            onSelect?.();
          },
          children: [item.isEmpty ? emptyHeadingContent : (0,external_wp_richText_namespaceObject.getTextContent)((0,external_wp_richText_namespaceObject.create)({
            html: item.attributes.content
          })), isIncorrectLevel && incorrectLevelContent, item.level === 1 && hasMultipleH1 && multipleH1Headings, hasTitle && item.level === 1 && !hasMultipleH1 && singleH1Headings]
        }, item.clientId);
      })]
    })
  });
}
;
function DocumentOutlineCheck({
  children
}) {
  const hasHeadings = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getGlobalBlockCount
    } = select(external_wp_blockEditor_namespaceObject.store);
    return getGlobalBlockCount('core/heading') > 0;
  });
  if (!hasHeadings) {
    return null;
  }
  return children;
}
;
function EditorKeyboardShortcutsRegister() {
  const {
    registerShortcut
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_keyboardShortcuts_namespaceObject.store);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    registerShortcut({
      name: 'core/editor/toggle-mode',
      category: 'global',
      description: (0,external_wp_i18n_namespaceObject.__)('Switch between visual editor and code editor.'),
      keyCombination: {
        modifier: 'secondary',
        character: 'm'
      }
    });
    registerShortcut({
      name: 'core/editor/save',
      category: 'global',
      description: (0,external_wp_i18n_namespaceObject.__)('Save your changes.'),
      keyCombination: {
        modifier: 'primary',
        character: 's'
      }
    });
    registerShortcut({
      name: 'core/editor/undo',
      category: 'global',
      description: (0,external_wp_i18n_namespaceObject.__)('Undo your last changes.'),
      keyCombination: {
        modifier: 'primary',
        character: 'z'
      }
    });
    registerShortcut({
      name: 'core/editor/redo',
      category: 'global',
      description: (0,external_wp_i18n_namespaceObject.__)('Redo your last undo.'),
      keyCombination: {
        modifier: 'primaryShift',
        character: 'z'
      },
      aliases: (0,external_wp_keycodes_namespaceObject.isAppleOS)() ? [] : [{
        modifier: 'primary',
        character: 'y'
      }]
    });
    registerShortcut({
      name: 'core/editor/toggle-list-view',
      category: 'global',
      description: (0,external_wp_i18n_namespaceObject.__)('Show or hide the List View.'),
      keyCombination: {
        modifier: 'access',
        character: 'o'
      }
    });
    registerShortcut({
      name: 'core/editor/toggle-distraction-free',
      category: 'global',
      description: (0,external_wp_i18n_namespaceObject.__)('Enter or exit distraction free mode.'),
      keyCombination: {
        modifier: 'primaryShift',
        character: '\\'
      }
    });
    registerShortcut({
      name: 'core/editor/toggle-sidebar',
      category: 'global',
      description: (0,external_wp_i18n_namespaceObject.__)('Show or hide the Settings panel.'),
      keyCombination: {
        modifier: 'primaryShift',
        character: ','
      }
    });
    registerShortcut({
      name: 'core/editor/keyboard-shortcuts',
      category: 'main',
      description: (0,external_wp_i18n_namespaceObject.__)('Display these keyboard shortcuts.'),
      keyCombination: {
        modifier: 'access',
        character: 'h'
      }
    });
    registerShortcut({
      name: 'core/editor/next-region',
      category: 'global',
      description: (0,external_wp_i18n_namespaceObject.__)('Navigate to the next part of the editor.'),
      keyCombination: {
        modifier: 'ctrl',
        character: '`'
      },
      aliases: [{
        modifier: 'access',
        character: 'n'
      }]
    });
    registerShortcut({
      name: 'core/editor/previous-region',
      category: 'global',
      description: (0,external_wp_i18n_namespaceObject.__)('Navigate to the previous part of the editor.'),
      keyCombination: {
        modifier: 'ctrlShift',
        character: '`'
      },
      aliases: [{
        modifier: 'access',
        character: 'p'
      }, {
        modifier: 'ctrlShift',
        character: '~'
      }]
    });
  }, [registerShortcut]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockEditorKeyboardShortcuts.Register, {});
}
 const register_shortcuts = (EditorKeyboardShortcutsRegister);
;
const redo_redo = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M15.6 6.5l-1.1 1 2.9 3.3H8c-.9 0-1.7.3-2.3.9-1.4 1.5-1.4 4.2-1.4 5.6v.2h1.5v-.3c0-1.1 0-3.5 1-4.5.3-.3.7-.5 1.3-.5h9.2L14.5 15l1.1 1.1 4.6-4.6-4.6-5z"
  })
});
 const library_redo = (redo_redo);
;
const undo_undo = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M18.3 11.7c-.6-.6-1.4-.9-2.3-.9H6.7l2.9-3.3-1.1-1-4.5 5L8.5 16l1-1-2.7-2.7H16c.5 0 .9.2 1.3.5 1 1 1 3.4 1 4.5v.3h1.5v-.2c0-1.5 0-4.3-1.5-5.7z"
  })
});
 const library_undo = (undo_undo);
;
function EditorHistoryRedo(props, ref) {
  const shortcut = (0,external_wp_keycodes_namespaceObject.isAppleOS)() ? external_wp_keycodes_namespaceObject.displayShortcut.primaryShift('z') : external_wp_keycodes_namespaceObject.displayShortcut.primary('y');
  const hasRedo = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).hasEditorRedo(), []);
  const {
    redo
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
    __next40pxDefaultSize: true,
    ...props,
    ref: ref,
    icon: !(0,external_wp_i18n_namespaceObject.isRTL)() ? library_redo : library_undo
    ,
    label: (0,external_wp_i18n_namespaceObject.__)('Redo'),
    shortcut: shortcut
    ,
    "aria-disabled": !hasRedo,
    onClick: hasRedo ? redo : undefined,
    className: "editor-history__redo"
  });
}
 const editor_history_redo = ((0,external_wp_element_namespaceObject.forwardRef)(EditorHistoryRedo));
;
function EditorHistoryUndo(props, ref) {
  const hasUndo = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).hasEditorUndo(), []);
  const {
    undo
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
    __next40pxDefaultSize: true,
    ...props,
    ref: ref,
    icon: !(0,external_wp_i18n_namespaceObject.isRTL)() ? library_undo : library_redo
    ,
    label: (0,external_wp_i18n_namespaceObject.__)('Undo'),
    shortcut: external_wp_keycodes_namespaceObject.displayShortcut.primary('z')
    ,
    "aria-disabled": !hasUndo,
    onClick: hasUndo ? undo : undefined,
    className: "editor-history__undo"
  });
}
 const editor_history_undo = ((0,external_wp_element_namespaceObject.forwardRef)(EditorHistoryUndo));
;
function TemplateValidationNotice() {
  const [showConfirmDialog, setShowConfirmDialog] = (0,external_wp_element_namespaceObject.useState)(false);
  const isValid = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return select(external_wp_blockEditor_namespaceObject.store).isValidTemplate();
  }, []);
  const {
    setTemplateValidity,
    synchronizeTemplate
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  if (isValid) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Notice, {
      className: "editor-template-validation-notice",
      isDismissible: false,
      status: "warning",
      actions: [{
        label: (0,external_wp_i18n_namespaceObject.__)('Keep it as is'),
        onClick: () => setTemplateValidity(true)
      }, {
        label: (0,external_wp_i18n_namespaceObject.__)('Reset the template'),
        onClick: () => setShowConfirmDialog(true)
      }],
      children: (0,external_wp_i18n_namespaceObject.__)('The content of your post doesn’t match the template assigned to your post type.')
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalConfirmDialog, {
      isOpen: showConfirmDialog,
      confirmButtonText: (0,external_wp_i18n_namespaceObject.__)('Reset'),
      onConfirm: () => {
        setShowConfirmDialog(false);
        synchronizeTemplate();
      },
      onCancel: () => setShowConfirmDialog(false),
      size: "medium",
      children: (0,external_wp_i18n_namespaceObject.__)('Resetting the template may result in loss of content, do you want to continue?')
    })]
  });
}
;
function EditorNotices() {
  const {
    notices
  } = (0,external_wp_data_namespaceObject.useSelect)(select => ({
    notices: select(external_wp_notices_namespaceObject.store).getNotices()
  }), []);
  const {
    removeNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const dismissibleNotices = notices.filter(({
    isDismissible,
    type
  }) => isDismissible && type === 'default');
  const nonDismissibleNotices = notices.filter(({
    isDismissible,
    type
  }) => !isDismissible && type === 'default');
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.NoticeList, {
      notices: nonDismissibleNotices,
      className: "components-editor-notices__pinned"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.NoticeList, {
      notices: dismissibleNotices,
      className: "components-editor-notices__dismissible",
      onRemove: removeNotice,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(TemplateValidationNotice, {})
    })]
  });
}
 const editor_notices = (EditorNotices);
;
const MAX_VISIBLE_NOTICES = -3;
function EditorSnackbars() {
  const notices = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_notices_namespaceObject.store).getNotices(), []);
  const {
    removeNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const snackbarNotices = notices.filter(({
    type
  }) => type === 'snackbar').slice(MAX_VISIBLE_NOTICES);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SnackbarList, {
    notices: snackbarNotices,
    className: "components-editor-notices__snackbar",
    onRemove: removeNotice
  });
}
;
function EntityRecordItem({
  record,
  checked,
  onChange
}) {
  const {
    name,
    kind,
    title,
    key
  } = record;
  const {
    entityRecordTitle,
    hasPostMetaChanges
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$getCurrentThe;
    if ('postType' !== kind || 'wp_template' !== name) {
      return {
        entityRecordTitle: title,
        hasPostMetaChanges: unlock(select(store_store)).hasPostMetaChanges(name, key)
      };
    }
    const template = select(external_wp_coreData_namespaceObject.store).getEditedEntityRecord(kind, name, key);
    const {
      default_template_types: templateTypes = []
    } = (_select$getCurrentThe = select(external_wp_coreData_namespaceObject.store).getCurrentTheme()) !== null && _select$getCurrentThe !== void 0 ? _select$getCurrentThe : {};
    return {
      entityRecordTitle: getTemplateInfo({
        template,
        templateTypes
      }).title,
      hasPostMetaChanges: unlock(select(store_store)).hasPostMetaChanges(name, key)
    };
  }, [name, kind, title, key]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelRow, {
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.CheckboxControl, {
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(entityRecordTitle) || (0,external_wp_i18n_namespaceObject.__)('Untitled'),
        checked: checked,
        onChange: onChange,
        className: "entities-saved-states__change-control"
      })
    }), hasPostMetaChanges && (0,external_ReactJSXRuntime_namespaceObject.jsx)("ul", {
      className: "entities-saved-states__changes",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("li", {
        children: (0,external_wp_i18n_namespaceObject.__)('Post Meta.')
      })
    })]
  });
}
;
const {
  getGlobalStylesChanges,
  GlobalStylesContext: entity_type_list_GlobalStylesContext
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
function getEntityDescription(entity, count) {
  switch (entity) {
    case 'site':
      return 1 === count ? (0,external_wp_i18n_namespaceObject.__)('This change will affect your whole site.') : (0,external_wp_i18n_namespaceObject.__)('These changes will affect your whole site.');
    case 'wp_template':
      return (0,external_wp_i18n_namespaceObject.__)('This change will affect other parts of your site that use this template.');
    case 'page':
    case 'post':
      return (0,external_wp_i18n_namespaceObject.__)('The following has been modified.');
  }
}
function GlobalStylesDescription({
  record
}) {
  const {
    user: currentEditorGlobalStyles
  } = (0,external_wp_element_namespaceObject.useContext)(entity_type_list_GlobalStylesContext);
  const savedRecord = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_coreData_namespaceObject.store).getEntityRecord(record.kind, record.name, record.key), [record.kind, record.name, record.key]);
  const globalStylesChanges = getGlobalStylesChanges(currentEditorGlobalStyles, savedRecord, {
    maxResults: 10
  });
  return globalStylesChanges.length ? (0,external_ReactJSXRuntime_namespaceObject.jsx)("ul", {
    className: "entities-saved-states__changes",
    children: globalStylesChanges.map(change => (0,external_ReactJSXRuntime_namespaceObject.jsx)("li", {
      children: change
    }, change))
  }) : null;
}
function EntityDescription({
  record,
  count
}) {
  if ('globalStyles' === record?.name) {
    return null;
  }
  const description = getEntityDescription(record?.name, count);
  return description ? (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelRow, {
    children: description
  }) : null;
}
function EntityTypeList({
  list,
  unselectedEntities,
  setUnselectedEntities
}) {
  const count = list.length;
  const firstRecord = list[0];
  const entityConfig = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_coreData_namespaceObject.store).getEntityConfig(firstRecord.kind, firstRecord.name), [firstRecord.kind, firstRecord.name]);
  let entityLabel = entityConfig.label;
  if (firstRecord?.name === 'wp_template_part') {
    entityLabel = 1 === count ? (0,external_wp_i18n_namespaceObject.__)('Template Part') : (0,external_wp_i18n_namespaceObject.__)('Template Parts');
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
    title: entityLabel,
    initialOpen: true,
    className: "entities-saved-states__panel-body",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(EntityDescription, {
      record: firstRecord,
      count: count
    }), list.map(record => {
      return (0,external_ReactJSXRuntime_namespaceObject.jsx)(EntityRecordItem, {
        record: record,
        checked: !unselectedEntities.some(elt => elt.kind === record.kind && elt.name === record.name && elt.key === record.key && elt.property === record.property),
        onChange: value => setUnselectedEntities(record, value)
      }, record.key || record.property);
    }), 'globalStyles' === firstRecord?.name && (0,external_ReactJSXRuntime_namespaceObject.jsx)(GlobalStylesDescription, {
      record: firstRecord
    })]
  });
}
;
const useIsDirty = () => {
  const {
    editedEntities,
    siteEdits,
    siteEntityConfig
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      __experimentalGetDirtyEntityRecords,
      getEntityRecordEdits,
      getEntityConfig
    } = select(external_wp_coreData_namespaceObject.store);
    return {
      editedEntities: __experimentalGetDirtyEntityRecords(),
      siteEdits: getEntityRecordEdits('root', 'site'),
      siteEntityConfig: getEntityConfig('root', 'site')
    };
  }, []);
  const dirtyEntityRecords = (0,external_wp_element_namespaceObject.useMemo)(() => {
    var _siteEntityConfig$met;
    const editedEntitiesWithoutSite = editedEntities.filter(record => !(record.kind === 'root' && record.name === 'site'));
    const siteEntityLabels = (_siteEntityConfig$met = siteEntityConfig?.meta?.labels) !== null && _siteEntityConfig$met !== void 0 ? _siteEntityConfig$met : {};
    const editedSiteEntities = [];
    for (const property in siteEdits) {
      editedSiteEntities.push({
        kind: 'root',
        name: 'site',
        title: siteEntityLabels[property] || property,
        property
      });
    }
    return [...editedEntitiesWithoutSite, ...editedSiteEntities];
  }, [editedEntities, siteEdits, siteEntityConfig]);
  const [unselectedEntities, _setUnselectedEntities] = (0,external_wp_element_namespaceObject.useState)([]);
  const setUnselectedEntities = ({
    kind,
    name,
    key,
    property
  }, checked) => {
    if (checked) {
      _setUnselectedEntities(unselectedEntities.filter(elt => elt.kind !== kind || elt.name !== name || elt.key !== key || elt.property !== property));
    } else {
      _setUnselectedEntities([...unselectedEntities, {
        kind,
        name,
        key,
        property
      }]);
    }
  };
  const isDirty = dirtyEntityRecords.length - unselectedEntities.length > 0;
  return {
    dirtyEntityRecords,
    isDirty,
    setUnselectedEntities,
    unselectedEntities
  };
};
;
function identity(values) {
  return values;
}
function EntitiesSavedStates({
  close,
  renderDialog,
  variant
}) {
  const isDirtyProps = useIsDirty();
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(EntitiesSavedStatesExtensible, {
    close: close,
    renderDialog: renderDialog,
    variant: variant,
    ...isDirtyProps
  });
}
function EntitiesSavedStatesExtensible({
  additionalPrompt = undefined,
  close,
  onSave = identity,
  saveEnabled: saveEnabledProp = undefined,
  saveLabel = (0,external_wp_i18n_namespaceObject.__)('Save'),
  renderDialog,
  dirtyEntityRecords,
  isDirty,
  setUnselectedEntities,
  unselectedEntities,
  variant = 'default'
}) {
  const saveButtonRef = (0,external_wp_element_namespaceObject.useRef)();
  const {
    saveDirtyEntities
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(store_store));
  const partitionedSavables = dirtyEntityRecords.reduce((acc, record) => {
    const {
      name
    } = record;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(record);
    return acc;
  }, {});
  const {
    site: siteSavables,
    wp_template: templateSavables,
    wp_template_part: templatePartSavables,
    ...contentSavables
  } = partitionedSavables;
  const sortedPartitionedSavables = [siteSavables, templateSavables, templatePartSavables, ...Object.values(contentSavables)].filter(Array.isArray);
  const saveEnabled = saveEnabledProp !== null && saveEnabledProp !== void 0 ? saveEnabledProp : isDirty;
  const dismissPanel = (0,external_wp_element_namespaceObject.useCallback)(() => close(), [close]);
  const [saveDialogRef, saveDialogProps] = (0,external_wp_compose_namespaceObject.__experimentalUseDialog)({
    onClose: () => dismissPanel()
  });
  const dialogLabelId = (0,external_wp_compose_namespaceObject.useInstanceId)(EntitiesSavedStatesExtensible, 'entities-saved-states__panel-label');
  const dialogDescriptionId = (0,external_wp_compose_namespaceObject.useInstanceId)(EntitiesSavedStatesExtensible, 'entities-saved-states__panel-description');
  const selectItemsToSaveDescription = !!dirtyEntityRecords.length ? (0,external_wp_i18n_namespaceObject.__)('Select the items you want to save.') : undefined;
  const isInline = variant === 'inline';
  const actionButtons = (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.FlexItem, {
      isBlock: isInline ? false : true,
      as: external_wp_components_namespaceObject.Button,
      variant: isInline ? 'tertiary' : 'secondary',
      size: isInline ? undefined : 'compact',
      onClick: dismissPanel,
      children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.FlexItem, {
      isBlock: isInline ? false : true,
      as: external_wp_components_namespaceObject.Button,
      ref: saveButtonRef,
      variant: "primary",
      size: isInline ? undefined : 'compact',
      disabled: !saveEnabled,
      accessibleWhenDisabled: true,
      onClick: () => saveDirtyEntities({
        onSave,
        dirtyEntityRecords,
        entitiesToSkip: unselectedEntities,
        close
      }),
      className: "editor-entities-saved-states__save-button",
      children: saveLabel
    })]
  });
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    ref: renderDialog ? saveDialogRef : undefined,
    ...(renderDialog && saveDialogProps),
    className: dist_clsx('entities-saved-states__panel', {
      'is-inline': isInline
    }),
    role: renderDialog ? 'dialog' : undefined,
    "aria-labelledby": renderDialog ? dialogLabelId : undefined,
    "aria-describedby": renderDialog ? dialogDescriptionId : undefined,
    children: [!isInline && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Flex, {
      className: "entities-saved-states__panel-header",
      gap: 2,
      children: actionButtons
    }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "entities-saved-states__text-prompt",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "entities-saved-states__text-prompt--header-wrapper",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("strong", {
          id: renderDialog ? dialogLabelId : undefined,
          className: "entities-saved-states__text-prompt--header",
          children: (0,external_wp_i18n_namespaceObject.__)('Are you ready to save?')
        })
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        id: renderDialog ? dialogDescriptionId : undefined,
        children: [additionalPrompt, (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
          className: "entities-saved-states__text-prompt--changes-count",
          children: isDirty ? (0,external_wp_element_namespaceObject.createInterpolateElement)((0,external_wp_i18n_namespaceObject.sprintf)(
          (0,external_wp_i18n_namespaceObject._n)('There is <strong>%d site change</strong> waiting to be saved.', 'There are <strong>%d site changes</strong> waiting to be saved.', dirtyEntityRecords.length), dirtyEntityRecords.length), {
            strong: (0,external_ReactJSXRuntime_namespaceObject.jsx)("strong", {})
          }) : selectItemsToSaveDescription
        })]
      })]
    }), sortedPartitionedSavables.map(list => {
      return (0,external_ReactJSXRuntime_namespaceObject.jsx)(EntityTypeList, {
        list: list,
        unselectedEntities: unselectedEntities,
        setUnselectedEntities: setUnselectedEntities
      }, list[0].name);
    }), isInline && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Flex, {
      direction: "row",
      justify: "flex-end",
      className: "entities-saved-states__panel-footer",
      children: actionButtons
    })]
  });
}
;
function getContent() {
  try {
    return (0,external_wp_data_namespaceObject.select)(store_store).getEditedPostContent();
  } catch (error) {}
}
function CopyButton({
  text,
  children,
  variant = 'secondary'
}) {
  const ref = (0,external_wp_compose_namespaceObject.useCopyToClipboard)(text);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
    __next40pxDefaultSize: true,
    variant: variant,
    ref: ref,
    children: children
  });
}
class ErrorBoundary extends external_wp_element_namespaceObject.Component {
  constructor() {
    super(...arguments);
    this.state = {
      error: null
    };
  }
  componentDidCatch(error) {
    (0,external_wp_hooks_namespaceObject.doAction)('editor.ErrorBoundary.errorLogged', error);
  }
  static getDerivedStateFromError(error) {
    return {
      error
    };
  }
  render() {
    const {
      error
    } = this.state;
    const {
      canCopyContent = false
    } = this.props;
    if (!error) {
      return this.props.children;
    }
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
      className: "editor-error-boundary",
      alignment: "baseline",
      spacing: 4,
      justify: "space-between",
      expanded: false,
      wrap: true,
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
        as: "p",
        children: (0,external_wp_i18n_namespaceObject.__)('The editor has encountered an unexpected error.')
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
        expanded: false,
        children: [canCopyContent && (0,external_ReactJSXRuntime_namespaceObject.jsx)(CopyButton, {
          text: getContent,
          children: (0,external_wp_i18n_namespaceObject.__)('Copy contents')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(CopyButton, {
          variant: "primary",
          text: error?.stack,
          children: (0,external_wp_i18n_namespaceObject.__)('Copy error')
        })]
      })]
    });
  }
}
 const error_boundary = (ErrorBoundary);
;
const requestIdleCallback = window.requestIdleCallback ? window.requestIdleCallback : window.requestAnimationFrame;
let hasStorageSupport;
const hasSessionStorageSupport = () => {
  if (hasStorageSupport !== undefined) {
    return hasStorageSupport;
  }
  try {
    window.sessionStorage.setItem('__wpEditorTestSessionStorage', '');
    window.sessionStorage.removeItem('__wpEditorTestSessionStorage');
    hasStorageSupport = true;
  } catch {
    hasStorageSupport = false;
  }
  return hasStorageSupport;
};
function useAutosaveNotice() {
  const {
    postId,
    isEditedPostNew,
    hasRemoteAutosave
  } = (0,external_wp_data_namespaceObject.useSelect)(select => ({
    postId: select(store_store).getCurrentPostId(),
    isEditedPostNew: select(store_store).isEditedPostNew(),
    hasRemoteAutosave: !!select(store_store).getEditorSettings().autosave
  }), []);
  const {
    getEditedPostAttribute
  } = (0,external_wp_data_namespaceObject.useSelect)(store_store);
  const {
    createWarningNotice,
    removeNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const {
    editPost,
    resetEditorBlocks
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    let localAutosave = localAutosaveGet(postId, isEditedPostNew);
    if (!localAutosave) {
      return;
    }
    try {
      localAutosave = JSON.parse(localAutosave);
    } catch {
      return;
    }
    const {
      post_title: title,
      content,
      excerpt
    } = localAutosave;
    const edits = {
      title,
      content,
      excerpt
    };
    {
      const hasDifference = Object.keys(edits).some(key => {
        return edits[key] !== getEditedPostAttribute(key);
      });
      if (!hasDifference) {
        localAutosaveClear(postId, isEditedPostNew);
        return;
      }
    }
    if (hasRemoteAutosave) {
      return;
    }
    const id = 'wpEditorAutosaveRestore';
    createWarningNotice((0,external_wp_i18n_namespaceObject.__)('The backup of this post in your browser is different from the version below.'), {
      id,
      actions: [{
        label: (0,external_wp_i18n_namespaceObject.__)('Restore the backup'),
        onClick() {
          const {
            content: editsContent,
            ...editsWithoutContent
          } = edits;
          editPost(editsWithoutContent);
          resetEditorBlocks((0,external_wp_blocks_namespaceObject.parse)(edits.content));
          removeNotice(id);
        }
      }]
    });
  }, [isEditedPostNew, postId]);
}
function useAutosavePurge() {
  const {
    postId,
    isEditedPostNew,
    isDirty,
    isAutosaving,
    didError
  } = (0,external_wp_data_namespaceObject.useSelect)(select => ({
    postId: select(store_store).getCurrentPostId(),
    isEditedPostNew: select(store_store).isEditedPostNew(),
    isDirty: select(store_store).isEditedPostDirty(),
    isAutosaving: select(store_store).isAutosavingPost(),
    didError: select(store_store).didPostSaveRequestFail()
  }), []);
  const lastIsDirtyRef = (0,external_wp_element_namespaceObject.useRef)(isDirty);
  const lastIsAutosavingRef = (0,external_wp_element_namespaceObject.useRef)(isAutosaving);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (!didError && (lastIsAutosavingRef.current && !isAutosaving || lastIsDirtyRef.current && !isDirty)) {
      localAutosaveClear(postId, isEditedPostNew);
    }
    lastIsDirtyRef.current = isDirty;
    lastIsAutosavingRef.current = isAutosaving;
  }, [isDirty, isAutosaving, didError]);
  const wasEditedPostNew = (0,external_wp_compose_namespaceObject.usePrevious)(isEditedPostNew);
  const prevPostId = (0,external_wp_compose_namespaceObject.usePrevious)(postId);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (prevPostId === postId && wasEditedPostNew && !isEditedPostNew) {
      localAutosaveClear(postId, true);
    }
  }, [isEditedPostNew, postId]);
}
function LocalAutosaveMonitor() {
  const {
    autosave
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const deferredAutosave = (0,external_wp_element_namespaceObject.useCallback)(() => {
    requestIdleCallback(() => autosave({
      local: true
    }));
  }, []);
  useAutosaveNotice();
  useAutosavePurge();
  const localAutosaveInterval = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).getEditorSettings().localAutosaveInterval, []);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(autosave_monitor, {
    interval: localAutosaveInterval,
    autosave: deferredAutosave
  });
}
 const local_autosave_monitor = ((0,external_wp_compose_namespaceObject.ifCondition)(hasSessionStorageSupport)(LocalAutosaveMonitor));
;
function PageAttributesCheck({
  children
}) {
  const supportsPageAttributes = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedPostAttribute
    } = select(store_store);
    const {
      getPostType
    } = select(external_wp_coreData_namespaceObject.store);
    const postType = getPostType(getEditedPostAttribute('type'));
    return !!postType?.supports?.['page-attributes'];
  }, []);
  if (!supportsPageAttributes) {
    return null;
  }
  return children;
}
 const page_attributes_check = (PageAttributesCheck);
;
function PostTypeSupportCheck({
  children,
  supportKeys
}) {
  const postType = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedPostAttribute
    } = select(store_store);
    const {
      getPostType
    } = select(external_wp_coreData_namespaceObject.store);
    return getPostType(getEditedPostAttribute('type'));
  }, []);
  let isSupported = !!postType;
  if (postType) {
    isSupported = (Array.isArray(supportKeys) ? supportKeys : [supportKeys]).some(key => !!postType.supports[key]);
  }
  if (!isSupported) {
    return null;
  }
  return children;
}
 const post_type_support_check = (PostTypeSupportCheck);
;
function PageAttributesOrder() {
  const order = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$getEditedPost;
    return (_select$getEditedPost = select(store_store).getEditedPostAttribute('menu_order')) !== null && _select$getEditedPost !== void 0 ? _select$getEditedPost : 0;
  }, []);
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const [orderInput, setOrderInput] = (0,external_wp_element_namespaceObject.useState)(null);
  const setUpdatedOrder = value => {
    setOrderInput(value);
    const newOrder = Number(value);
    if (Number.isInteger(newOrder) && value.trim?.() !== '') {
      editPost({
        menu_order: newOrder
      });
    }
  };
  const value = orderInput !== null && orderInput !== void 0 ? orderInput : order;
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Flex, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.FlexBlock, {
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalNumberControl, {
        __next40pxDefaultSize: true,
        label: (0,external_wp_i18n_namespaceObject.__)('Order'),
        help: (0,external_wp_i18n_namespaceObject.__)('Set the page order.'),
        value: value,
        onChange: setUpdatedOrder,
        hideLabelFromVision: true,
        onBlur: () => {
          setOrderInput(null);
        }
      })
    })
  });
}
function PageAttributesOrderWithChecks() {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_type_support_check, {
    supportKeys: "page-attributes",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PageAttributesOrder, {})
  });
}
;
const PostPanelRow = (0,external_wp_element_namespaceObject.forwardRef)(({
  className,
  label,
  children
}, ref) => {
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
    className: dist_clsx('editor-post-panel__row', className),
    ref: ref,
    children: [label && (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "editor-post-panel__row-label",
      children: label
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "editor-post-panel__row-control",
      children: children
    })]
  });
});
 const post_panel_row = (PostPanelRow);
;
function terms_buildTermsTree(flatTerms) {
  const flatTermsWithParentAndChildren = flatTerms.map(term => {
    return {
      children: [],
      parent: undefined,
      ...term
    };
  });
  if (flatTermsWithParentAndChildren.some(({
    parent
  }) => parent === undefined)) {
    return flatTermsWithParentAndChildren;
  }
  const termsByParent = flatTermsWithParentAndChildren.reduce((acc, term) => {
    const {
      parent
    } = term;
    if (!acc[parent]) {
      acc[parent] = [];
    }
    acc[parent].push(term);
    return acc;
  }, {});
  const fillWithChildren = terms => {
    return terms.map(term => {
      const children = termsByParent[term.id];
      return {
        ...term,
        children: children && children.length ? fillWithChildren(children) : []
      };
    });
  };
  return fillWithChildren(termsByParent['0'] || []);
}
const unescapeString = arg => {
  return (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(arg);
};
const unescapeTerm = term => {
  return {
    ...term,
    name: unescapeString(term.name)
  };
};
const unescapeTerms = terms => {
  return (terms !== null && terms !== void 0 ? terms : []).map(unescapeTerm);
};
;
function getTitle(post) {
  return post?.title?.rendered ? (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(post.title.rendered) : `#${post.id} (${(0,external_wp_i18n_namespaceObject.__)('no title')})`;
}
const parent_getItemPriority = (name, searchValue) => {
  const normalizedName = remove_accents_default()(name || '').toLowerCase();
  const normalizedSearch = remove_accents_default()(searchValue || '').toLowerCase();
  if (normalizedName === normalizedSearch) {
    return 0;
  }
  if (normalizedName.startsWith(normalizedSearch)) {
    return normalizedName.length;
  }
  return Infinity;
};
function parent_PageAttributesParent() {
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const [fieldValue, setFieldValue] = (0,external_wp_element_namespaceObject.useState)(false);
  const {
    isHierarchical,
    parentPostId,
    parentPostTitle,
    pageItems,
    isLoading
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _pType$hierarchical;
    const {
      getPostType,
      getEntityRecords,
      getEntityRecord,
      isResolving
    } = select(external_wp_coreData_namespaceObject.store);
    const {
      getCurrentPostId,
      getEditedPostAttribute
    } = select(store_store);
    const postTypeSlug = getEditedPostAttribute('type');
    const pageId = getEditedPostAttribute('parent');
    const pType = getPostType(postTypeSlug);
    const postId = getCurrentPostId();
    const postIsHierarchical = (_pType$hierarchical = pType?.hierarchical) !== null && _pType$hierarchical !== void 0 ? _pType$hierarchical : false;
    const query = {
      per_page: 100,
      exclude: postId,
      parent_exclude: postId,
      orderby: 'menu_order',
      order: 'asc',
      _fields: 'id,title,parent'
    };
    if (!!fieldValue) {
      query.search = fieldValue;
    }
    const parentPost = pageId ? getEntityRecord('postType', postTypeSlug, pageId) : null;
    return {
      isHierarchical: postIsHierarchical,
      parentPostId: pageId,
      parentPostTitle: parentPost ? getTitle(parentPost) : '',
      pageItems: postIsHierarchical ? getEntityRecords('postType', postTypeSlug, query) : null,
      isLoading: postIsHierarchical ? isResolving('getEntityRecords', ['postType', postTypeSlug, query]) : false
    };
  }, [fieldValue]);
  const parentOptions = (0,external_wp_element_namespaceObject.useMemo)(() => {
    const getOptionsFromTree = (tree, level = 0) => {
      const mappedNodes = tree.map(treeNode => [{
        value: treeNode.id,
        label: '— '.repeat(level) + (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(treeNode.name),
        rawName: treeNode.name
      }, ...getOptionsFromTree(treeNode.children || [], level + 1)]);
      const sortedNodes = mappedNodes.sort(([a], [b]) => {
        const priorityA = parent_getItemPriority(a.rawName, fieldValue);
        const priorityB = parent_getItemPriority(b.rawName, fieldValue);
        return priorityA >= priorityB ? 1 : -1;
      });
      return sortedNodes.flat();
    };
    if (!pageItems) {
      return [];
    }
    let tree = pageItems.map(item => ({
      id: item.id,
      parent: item.parent,
      name: getTitle(item)
    }));
    if (!fieldValue) {
      tree = terms_buildTermsTree(tree);
    }
    const opts = getOptionsFromTree(tree);
    const optsHasParent = opts.find(item => item.value === parentPostId);
    if (parentPostTitle && !optsHasParent) {
      opts.unshift({
        value: parentPostId,
        label: parentPostTitle
      });
    }
    return opts;
  }, [pageItems, fieldValue, parentPostTitle, parentPostId]);
  if (!isHierarchical) {
    return null;
  }
  const handleKeydown = inputValue => {
    setFieldValue(inputValue);
  };
  const handleChange = selectedPostId => {
    editPost({
      parent: selectedPostId
    });
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ComboboxControl, {
    __nextHasNoMarginBottom: true,
    __next40pxDefaultSize: true,
    className: "editor-page-attributes__parent",
    label: (0,external_wp_i18n_namespaceObject.__)('Parent'),
    help: (0,external_wp_i18n_namespaceObject.__)('Choose a parent page.'),
    value: parentPostId,
    options: parentOptions,
    onFilterValueChange: (0,external_wp_compose_namespaceObject.debounce)(handleKeydown, 300),
    onChange: handleChange,
    hideLabelFromVision: true,
    isLoading: isLoading
  });
}
function PostParentToggle({
  isOpen,
  onClick
}) {
  const parentPost = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedPostAttribute
    } = select(store_store);
    const parentPostId = getEditedPostAttribute('parent');
    if (!parentPostId) {
      return null;
    }
    const {
      getEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    const postTypeSlug = getEditedPostAttribute('type');
    return getEntityRecord('postType', postTypeSlug, parentPostId);
  }, []);
  const parentTitle = (0,external_wp_element_namespaceObject.useMemo)(() => !parentPost ? (0,external_wp_i18n_namespaceObject.__)('None') : getTitle(parentPost), [parentPost]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
    size: "compact",
    className: "editor-post-parent__panel-toggle",
    variant: "tertiary",
    "aria-expanded": isOpen,
    "aria-label":
    (0,external_wp_i18n_namespaceObject.sprintf)((0,external_wp_i18n_namespaceObject.__)('Change parent: %s'), parentTitle),
    onClick: onClick,
    children: parentTitle
  });
}
function ParentRow() {
  const homeUrl = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return select(external_wp_coreData_namespaceObject.store).getEntityRecord('root', '__unstableBase')?.home;
  }, []);
  const [popoverAnchor, setPopoverAnchor] = (0,external_wp_element_namespaceObject.useState)(null);
  const popoverProps = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    anchor: popoverAnchor,
    placement: 'left-start',
    offset: 36,
    shift: true
  }), [popoverAnchor]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_panel_row, {
    label: (0,external_wp_i18n_namespaceObject.__)('Parent'),
    ref: setPopoverAnchor,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
      popoverProps: popoverProps,
      className: "editor-post-parent__panel-dropdown",
      contentClassName: "editor-post-parent__panel-dialog",
      focusOnMount: true,
      renderToggle: ({
        isOpen,
        onToggle
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostParentToggle, {
        isOpen: isOpen,
        onClick: onToggle
      }),
      renderContent: ({
        onClose
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "editor-post-parent",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalInspectorPopoverHeader, {
          title: (0,external_wp_i18n_namespaceObject.__)('Parent'),
          onClose: onClose
        }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
          children: [(0,external_wp_element_namespaceObject.createInterpolateElement)((0,external_wp_i18n_namespaceObject.sprintf)(
          (0,external_wp_i18n_namespaceObject.__)('Child pages inherit characteristics from their parent, such as URL structure. For instance, if "Pricing" is a child of "Services", its URL would be %s<wbr />/services<wbr />/pricing.'), (0,external_wp_url_namespaceObject.filterURLForDisplay)(homeUrl).replace(/([/.])/g, '<wbr />$1')), {
            wbr: (0,external_ReactJSXRuntime_namespaceObject.jsx)("wbr", {})
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
            children: (0,external_wp_element_namespaceObject.createInterpolateElement)((0,external_wp_i18n_namespaceObject.__)('They also show up as sub-items in the default navigation menu. <a>Learn more.</a>'), {
              a: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ExternalLink, {
                href: (0,external_wp_i18n_namespaceObject.__)('https://wordpress.org/documentation/article/page-post-settings-sidebar/#page-attributes')
              })
            })
          })]
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(parent_PageAttributesParent, {})]
      })
    })
  });
}
 const page_attributes_parent = (parent_PageAttributesParent);
;
const PANEL_NAME = 'page-attributes';
function AttributesPanel() {
  const {
    isEnabled,
    postType
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedPostAttribute,
      isEditorPanelEnabled
    } = select(store_store);
    const {
      getPostType
    } = select(external_wp_coreData_namespaceObject.store);
    return {
      isEnabled: isEditorPanelEnabled(PANEL_NAME),
      postType: getPostType(getEditedPostAttribute('type'))
    };
  }, []);
  if (!isEnabled || !postType) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(ParentRow, {});
}
function PageAttributesPanel() {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(page_attributes_check, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(AttributesPanel, {})
  });
}
;
const addTemplate = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M18.5 5.5V8H20V5.5H22.5V4H20V1.5H18.5V4H16V5.5H18.5ZM13.9624 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V10.0391H18.5V18C18.5 18.2761 18.2761 18.5 18 18.5H10L10 10.4917L16.4589 10.5139L16.4641 9.01389L5.5 8.97618V6C5.5 5.72386 5.72386 5.5 6 5.5H13.9624V4ZM5.5 10.4762V18C5.5 18.2761 5.72386 18.5 6 18.5H8.5L8.5 10.4865L5.5 10.4762Z"
  })
});
 const add_template = (addTemplate);
;
const DEFAULT_TITLE = (0,external_wp_i18n_namespaceObject.__)('Custom Template');
function CreateNewTemplateModal({
  onClose
}) {
  const {
    defaultBlockTemplate,
    onNavigateToEntityRecord
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditorSettings,
      getCurrentTemplateId
    } = select(store_store);
    return {
      defaultBlockTemplate: getEditorSettings().defaultBlockTemplate,
      onNavigateToEntityRecord: getEditorSettings().onNavigateToEntityRecord,
      getTemplateId: getCurrentTemplateId
    };
  });
  const {
    createTemplate
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(store_store));
  const [title, setTitle] = (0,external_wp_element_namespaceObject.useState)('');
  const [isBusy, setIsBusy] = (0,external_wp_element_namespaceObject.useState)(false);
  const cancel = () => {
    setTitle('');
    onClose();
  };
  const submit = async event => {
    event.preventDefault();
    if (isBusy) {
      return;
    }
    setIsBusy(true);
    const newTemplateContent = defaultBlockTemplate !== null && defaultBlockTemplate !== void 0 ? defaultBlockTemplate : (0,external_wp_blocks_namespaceObject.serialize)([(0,external_wp_blocks_namespaceObject.createBlock)('core/group', {
      tagName: 'header',
      layout: {
        inherit: true
      }
    }, [(0,external_wp_blocks_namespaceObject.createBlock)('core/site-title'), (0,external_wp_blocks_namespaceObject.createBlock)('core/site-tagline')]), (0,external_wp_blocks_namespaceObject.createBlock)('core/separator'), (0,external_wp_blocks_namespaceObject.createBlock)('core/group', {
      tagName: 'main'
    }, [(0,external_wp_blocks_namespaceObject.createBlock)('core/group', {
      layout: {
        inherit: true
      }
    }, [(0,external_wp_blocks_namespaceObject.createBlock)('core/post-title')]), (0,external_wp_blocks_namespaceObject.createBlock)('core/post-content', {
      layout: {
        inherit: true
      }
    })])]);
    const newTemplate = await createTemplate({
      slug: (0,external_wp_url_namespaceObject.cleanForSlug)(title || DEFAULT_TITLE),
      content: newTemplateContent,
      title: title || DEFAULT_TITLE
    });
    setIsBusy(false);
    onNavigateToEntityRecord({
      postId: newTemplate.id,
      postType: 'wp_template'
    });
    cancel();
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Modal, {
    title: (0,external_wp_i18n_namespaceObject.__)('Create custom template'),
    onRequestClose: cancel,
    focusOnMount: "firstContentElement",
    size: "small",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
      className: "editor-post-template__create-form",
      onSubmit: submit,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
        spacing: "3",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_namespaceObject.__)('Name'),
          value: title,
          onChange: setTitle,
          placeholder: DEFAULT_TITLE,
          disabled: isBusy,
          help: (0,external_wp_i18n_namespaceObject.__)(
          'Describe the template, e.g. "Post with sidebar". A custom template can be manually applied to any post or page.')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
          justify: "right",
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            variant: "tertiary",
            onClick: cancel,
            children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            variant: "primary",
            type: "submit",
            isBusy: isBusy,
            "aria-disabled": isBusy,
            children: (0,external_wp_i18n_namespaceObject.__)('Create')
          })]
        })]
      })
    })
  });
}
;
function useEditedPostContext() {
  return (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostId,
      getCurrentPostType
    } = select(store_store);
    return {
      postId: getCurrentPostId(),
      postType: getCurrentPostType()
    };
  }, []);
}
function useAllowSwitchingTemplates() {
  const {
    postType,
    postId
  } = useEditedPostContext();
  return (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      canUser,
      getEntityRecord,
      getEntityRecords
    } = select(external_wp_coreData_namespaceObject.store);
    const siteSettings = canUser('read', {
      kind: 'root',
      name: 'site'
    }) ? getEntityRecord('root', 'site') : undefined;
    const templates = getEntityRecords('postType', 'wp_template', {
      per_page: -1
    });
    const isPostsPage = +postId === siteSettings?.page_for_posts;
    const isFrontPage = postType === 'page' && +postId === siteSettings?.page_on_front && templates?.some(({
      slug
    }) => slug === 'front-page');
    return !isPostsPage && !isFrontPage;
  }, [postId, postType]);
}
function useTemplates(postType) {
  return (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_coreData_namespaceObject.store).getEntityRecords('postType', 'wp_template', {
    per_page: -1,
    post_type: postType
  }), [postType]);
}
function useAvailableTemplates(postType) {
  const currentTemplateSlug = useCurrentTemplateSlug();
  const allowSwitchingTemplate = useAllowSwitchingTemplates();
  const templates = useTemplates(postType);
  return (0,external_wp_element_namespaceObject.useMemo)(() => allowSwitchingTemplate && templates?.filter(template => template.is_custom && template.slug !== currentTemplateSlug && !!template.content.raw 
  ), [templates, currentTemplateSlug, allowSwitchingTemplate]);
}
function useCurrentTemplateSlug() {
  const {
    postType,
    postId
  } = useEditedPostContext();
  const templates = useTemplates(postType);
  const entityTemplate = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const post = select(external_wp_coreData_namespaceObject.store).getEditedEntityRecord('postType', postType, postId);
    return post?.template;
  }, [postType, postId]);
  if (!entityTemplate) {
    return;
  }
  return templates?.find(template => template.slug === entityTemplate)?.slug;
}
;
function PostTemplateToggle({
  isOpen,
  onClick
}) {
  const templateTitle = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const templateSlug = select(store_store).getEditedPostAttribute('template');
    const {
      supportsTemplateMode,
      availableTemplates
    } = select(store_store).getEditorSettings();
    if (!supportsTemplateMode && availableTemplates[templateSlug]) {
      return availableTemplates[templateSlug];
    }
    const template = select(external_wp_coreData_namespaceObject.store).canUser('create', {
      kind: 'postType',
      name: 'wp_template'
    }) && select(store_store).getCurrentTemplateId();
    return template?.title || template?.slug || availableTemplates?.[templateSlug];
  }, []);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
    __next40pxDefaultSize: true,
    variant: "tertiary",
    "aria-expanded": isOpen,
    "aria-label": (0,external_wp_i18n_namespaceObject.__)('Template options'),
    onClick: onClick,
    children: templateTitle !== null && templateTitle !== void 0 ? templateTitle : (0,external_wp_i18n_namespaceObject.__)('Default template')
  });
}
function PostTemplateDropdownContent({
  onClose
}) {
  var _options$find, _selectedOption$value;
  const allowSwitchingTemplate = useAllowSwitchingTemplates();
  const {
    availableTemplates,
    fetchedTemplates,
    selectedTemplateSlug,
    canCreate,
    canEdit,
    currentTemplateId,
    onNavigateToEntityRecord,
    getEditorSettings
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      canUser,
      getEntityRecords
    } = select(external_wp_coreData_namespaceObject.store);
    const editorSettings = select(store_store).getEditorSettings();
    const canCreateTemplates = canUser('create', {
      kind: 'postType',
      name: 'wp_template'
    });
    const _currentTemplateId = select(store_store).getCurrentTemplateId();
    return {
      availableTemplates: editorSettings.availableTemplates,
      fetchedTemplates: canCreateTemplates ? getEntityRecords('postType', 'wp_template', {
        post_type: select(store_store).getCurrentPostType(),
        per_page: -1
      }) : undefined,
      selectedTemplateSlug: select(store_store).getEditedPostAttribute('template'),
      canCreate: allowSwitchingTemplate && canCreateTemplates && editorSettings.supportsTemplateMode,
      canEdit: allowSwitchingTemplate && canCreateTemplates && editorSettings.supportsTemplateMode && !!_currentTemplateId,
      currentTemplateId: _currentTemplateId,
      onNavigateToEntityRecord: editorSettings.onNavigateToEntityRecord,
      getEditorSettings: select(store_store).getEditorSettings
    };
  }, [allowSwitchingTemplate]);
  const options = (0,external_wp_element_namespaceObject.useMemo)(() => Object.entries({
    ...availableTemplates,
    ...Object.fromEntries((fetchedTemplates !== null && fetchedTemplates !== void 0 ? fetchedTemplates : []).map(({
      slug,
      title
    }) => [slug, title.rendered]))
  }).map(([slug, title]) => ({
    value: slug,
    label: title
  })), [availableTemplates, fetchedTemplates]);
  const selectedOption = (_options$find = options.find(option => option.value === selectedTemplateSlug)) !== null && _options$find !== void 0 ? _options$find : options.find(option => !option.value); 
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    createSuccessNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const [isCreateModalOpen, setIsCreateModalOpen] = (0,external_wp_element_namespaceObject.useState)(false);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "editor-post-template__classic-theme-dropdown",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalInspectorPopoverHeader, {
      title: (0,external_wp_i18n_namespaceObject.__)('Template'),
      help: (0,external_wp_i18n_namespaceObject.__)('Templates define the way content is displayed when viewing your site.'),
      actions: canCreate ? [{
        icon: add_template,
        label: (0,external_wp_i18n_namespaceObject.__)('Add template'),
        onClick: () => setIsCreateModalOpen(true)
      }] : [],
      onClose: onClose
    }), !allowSwitchingTemplate ? (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Notice, {
      status: "warning",
      isDismissible: false,
      children: (0,external_wp_i18n_namespaceObject.__)('The posts page template cannot be changed.')
    }) : (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true,
      hideLabelFromVision: true,
      label: (0,external_wp_i18n_namespaceObject.__)('Template'),
      value: (_selectedOption$value = selectedOption?.value) !== null && _selectedOption$value !== void 0 ? _selectedOption$value : '',
      options: options,
      onChange: slug => editPost({
        template: slug || ''
      })
    }), canEdit && onNavigateToEntityRecord && (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        __next40pxDefaultSize: true,
        variant: "link",
        onClick: () => {
          onNavigateToEntityRecord({
            postId: currentTemplateId,
            postType: 'wp_template'
          });
          onClose();
          createSuccessNotice((0,external_wp_i18n_namespaceObject.__)('Editing template. Changes made here affect all posts and pages that use the template.'), {
            type: 'snackbar',
            actions: [{
              label: (0,external_wp_i18n_namespaceObject.__)('Go back'),
              onClick: () => getEditorSettings().onNavigateToPreviousEntityRecord()
            }]
          });
        },
        children: (0,external_wp_i18n_namespaceObject.__)('Edit template')
      })
    }), isCreateModalOpen && (0,external_ReactJSXRuntime_namespaceObject.jsx)(CreateNewTemplateModal, {
      onClose: () => setIsCreateModalOpen(false)
    })]
  });
}
function ClassicThemeControl() {
  const [popoverAnchor, setPopoverAnchor] = (0,external_wp_element_namespaceObject.useState)(null);
  const popoverProps = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    anchor: popoverAnchor,
    className: 'editor-post-template__dropdown',
    placement: 'left-start',
    offset: 36,
    shift: true
  }), [popoverAnchor]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_panel_row, {
    label: (0,external_wp_i18n_namespaceObject.__)('Template'),
    ref: setPopoverAnchor,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
      popoverProps: popoverProps,
      focusOnMount: true,
      renderToggle: ({
        isOpen,
        onToggle
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostTemplateToggle, {
        isOpen: isOpen,
        onClick: onToggle
      }),
      renderContent: ({
        onClose
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostTemplateDropdownContent, {
        onClose: onClose
      })
    })
  });
}
 const classic_theme = (ClassicThemeControl);
;
const external_wp_warning_namespaceObject = window["wp"]["warning"];
var external_wp_warning_default = __webpack_require__.n(external_wp_warning_namespaceObject);
;
const {
  PreferenceBaseOption
} = unlock(external_wp_preferences_namespaceObject.privateApis);
function EnablePanelOption(props) {
  const {
    toggleEditorPanelEnabled
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    isChecked,
    isRemoved
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      isEditorPanelEnabled,
      isEditorPanelRemoved
    } = select(store_store);
    return {
      isChecked: isEditorPanelEnabled(props.panelName),
      isRemoved: isEditorPanelRemoved(props.panelName)
    };
  }, [props.panelName]);
  if (isRemoved) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferenceBaseOption, {
    isChecked: isChecked,
    onChange: () => toggleEditorPanelEnabled(props.panelName),
    ...props
  });
}
;
const {
  Fill,
  Slot
} = (0,external_wp_components_namespaceObject.createSlotFill)('EnablePluginDocumentSettingPanelOption');
const EnablePluginDocumentSettingPanelOption = ({
  label,
  panelName
}) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(Fill, {
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(EnablePanelOption, {
    label: label,
    panelName: panelName
  })
});
EnablePluginDocumentSettingPanelOption.Slot = Slot;
 const enable_plugin_document_setting_panel = (EnablePluginDocumentSettingPanelOption);
;
const {
  Fill: plugin_document_setting_panel_Fill,
  Slot: plugin_document_setting_panel_Slot
} = (0,external_wp_components_namespaceObject.createSlotFill)('PluginDocumentSettingPanel');
const PluginDocumentSettingPanel = ({
  name,
  className,
  title,
  icon,
  children
}) => {
  const {
    name: pluginName
  } = (0,external_wp_plugins_namespaceObject.usePluginContext)();
  const panelName = `${pluginName}/${name}`;
  const {
    opened,
    isEnabled
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      isEditorPanelOpened,
      isEditorPanelEnabled
    } = select(store_store);
    return {
      opened: isEditorPanelOpened(panelName),
      isEnabled: isEditorPanelEnabled(panelName)
    };
  }, [panelName]);
  const {
    toggleEditorPanelOpened
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  if (undefined === name) {
     true ? external_wp_warning_default()('PluginDocumentSettingPanel requires a name property.') : 0;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(enable_plugin_document_setting_panel, {
      label: title,
      panelName: panelName
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(plugin_document_setting_panel_Fill, {
      children: isEnabled && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
        className: className,
        title: title,
        icon: icon,
        opened: opened,
        onToggle: () => toggleEditorPanelOpened(panelName),
        children: children
      })
    })]
  });
};
PluginDocumentSettingPanel.Slot = plugin_document_setting_panel_Slot;
 const plugin_document_setting_panel = (PluginDocumentSettingPanel);
;
const isEverySelectedBlockAllowed = (selected, allowed) => selected.filter(id => !allowed.includes(id)).length === 0;
const shouldRenderItem = (selectedBlocks, allowedBlocks) => !Array.isArray(allowedBlocks) || isEverySelectedBlockAllowed(selectedBlocks, allowedBlocks);
const PluginBlockSettingsMenuItem = ({
  allowedBlocks,
  icon,
  label,
  onClick,
  small,
  role
}) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockSettingsMenuControls, {
  children: ({
    selectedBlocks,
    onClose
  }) => {
    if (!shouldRenderItem(selectedBlocks, allowedBlocks)) {
      return null;
    }
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
      onClick: (0,external_wp_compose_namespaceObject.compose)(onClick, onClose),
      icon: icon,
      label: small ? label : undefined,
      role: role,
      children: !small && label
    });
  }
});
 const plugin_block_settings_menu_item = (PluginBlockSettingsMenuItem);
;
function PluginMoreMenuItem(props) {
  var _props$as;
  const context = (0,external_wp_plugins_namespaceObject.usePluginContext)();
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(action_item, {
    name: "core/plugin-more-menu",
    as: (_props$as = props.as) !== null && _props$as !== void 0 ? _props$as : external_wp_components_namespaceObject.MenuItem,
    icon: props.icon || context.icon,
    ...props
  });
}
;
const {
  Fill: plugin_post_publish_panel_Fill,
  Slot: plugin_post_publish_panel_Slot
} = (0,external_wp_components_namespaceObject.createSlotFill)('PluginPostPublishPanel');
const PluginPostPublishPanel = ({
  children,
  className,
  title,
  initialOpen = false,
  icon
}) => {
  const {
    icon: pluginIcon
  } = (0,external_wp_plugins_namespaceObject.usePluginContext)();
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(plugin_post_publish_panel_Fill, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
      className: className,
      initialOpen: initialOpen || !title,
      title: title,
      icon: icon !== null && icon !== void 0 ? icon : pluginIcon,
      children: children
    })
  });
};
PluginPostPublishPanel.Slot = plugin_post_publish_panel_Slot;
 const plugin_post_publish_panel = (PluginPostPublishPanel);
;
const {
  Fill: plugin_post_status_info_Fill,
  Slot: plugin_post_status_info_Slot
} = (0,external_wp_components_namespaceObject.createSlotFill)('PluginPostStatusInfo');
const PluginPostStatusInfo = ({
  children,
  className
}) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(plugin_post_status_info_Fill, {
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelRow, {
    className: className,
    children: children
  })
});
PluginPostStatusInfo.Slot = plugin_post_status_info_Slot;
 const plugin_post_status_info = (PluginPostStatusInfo);
;
const {
  Fill: plugin_pre_publish_panel_Fill,
  Slot: plugin_pre_publish_panel_Slot
} = (0,external_wp_components_namespaceObject.createSlotFill)('PluginPrePublishPanel');
const PluginPrePublishPanel = ({
  children,
  className,
  title,
  initialOpen = false,
  icon
}) => {
  const {
    icon: pluginIcon
  } = (0,external_wp_plugins_namespaceObject.usePluginContext)();
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(plugin_pre_publish_panel_Fill, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
      className: className,
      initialOpen: initialOpen || !title,
      title: title,
      icon: icon !== null && icon !== void 0 ? icon : pluginIcon,
      children: children
    })
  });
};
PluginPrePublishPanel.Slot = plugin_pre_publish_panel_Slot;
 const plugin_pre_publish_panel = (PluginPrePublishPanel);
;
function PluginPreviewMenuItem(props) {
  var _props$as;
  const context = (0,external_wp_plugins_namespaceObject.usePluginContext)();
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(action_item, {
    name: "core/plugin-preview-menu",
    as: (_props$as = props.as) !== null && _props$as !== void 0 ? _props$as : external_wp_components_namespaceObject.MenuItem,
    icon: props.icon || context.icon,
    ...props
  });
}
;
function PluginSidebar({
  className,
  ...props
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(complementary_area, {
    panelClassName: className,
    className: "editor-sidebar",
    scope: "core",
    ...props
  });
}
;
function PluginSidebarMoreMenuItem(props) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(ComplementaryAreaMoreMenuItem
  , {
    __unstableExplicitMenuItem: true,
    scope: "core",
    ...props
  });
}
;
function SwapTemplateButton({
  onClick
}) {
  const [showModal, setShowModal] = (0,external_wp_element_namespaceObject.useState)(false);
  const {
    postType,
    postId
  } = useEditedPostContext();
  const availableTemplates = useAvailableTemplates(postType);
  const {
    editEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  if (!availableTemplates?.length) {
    return null;
  }
  const onTemplateSelect = async template => {
    editEntityRecord('postType', postType, postId, {
      template: template.name
    }, {
      undoIgnore: true
    });
    setShowModal(false); 
    onClick();
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
      onClick: () => setShowModal(true),
      children: (0,external_wp_i18n_namespaceObject.__)('Change template')
    }), showModal && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Modal, {
      title: (0,external_wp_i18n_namespaceObject.__)('Choose a template'),
      onRequestClose: () => setShowModal(false),
      overlayClassName: "editor-post-template__swap-template-modal",
      isFullScreen: true,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "editor-post-template__swap-template-modal-content",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(TemplatesList, {
          postType: postType,
          onSelect: onTemplateSelect
        })
      })
    })]
  });
}
function TemplatesList({
  postType,
  onSelect
}) {
  const availableTemplates = useAvailableTemplates(postType);
  const templatesAsPatterns = (0,external_wp_element_namespaceObject.useMemo)(() => availableTemplates.map(template => ({
    name: template.slug,
    blocks: (0,external_wp_blocks_namespaceObject.parse)(template.content.raw),
    title: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(template.title.rendered),
    id: template.id
  })), [availableTemplates]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalBlockPatternsList, {
    label: (0,external_wp_i18n_namespaceObject.__)('Templates'),
    blockPatterns: templatesAsPatterns,
    onClickPattern: onSelect
  });
}
;
function ResetDefaultTemplate({
  onClick
}) {
  const currentTemplateSlug = useCurrentTemplateSlug();
  const allowSwitchingTemplate = useAllowSwitchingTemplates();
  const {
    postType,
    postId
  } = useEditedPostContext();
  const {
    editEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  if (!currentTemplateSlug || !allowSwitchingTemplate) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
    onClick: () => {
      editEntityRecord('postType', postType, postId, {
        template: ''
      }, {
        undoIgnore: true
      });
      onClick();
    },
    children: (0,external_wp_i18n_namespaceObject.__)('Use default template')
  });
}
;
function CreateNewTemplate({
  onClick
}) {
  const {
    canCreateTemplates
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      canUser
    } = select(external_wp_coreData_namespaceObject.store);
    return {
      canCreateTemplates: canUser('create', {
        kind: 'postType',
        name: 'wp_template'
      })
    };
  }, []);
  const [isCreateModalOpen, setIsCreateModalOpen] = (0,external_wp_element_namespaceObject.useState)(false);
  const allowSwitchingTemplate = useAllowSwitchingTemplates();
  if (!canCreateTemplates || !allowSwitchingTemplate) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
      onClick: () => {
        setIsCreateModalOpen(true);
      },
      children: (0,external_wp_i18n_namespaceObject.__)('Create new template')
    }), isCreateModalOpen && (0,external_ReactJSXRuntime_namespaceObject.jsx)(CreateNewTemplateModal, {
      onClose: () => {
        setIsCreateModalOpen(false);
        onClick();
      }
    })]
  });
}
;
function BlockThemeControl({
  id
}) {
  const {
    isTemplateHidden,
    onNavigateToEntityRecord,
    getEditorSettings,
    hasGoBack
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getRenderingMode,
      getEditorSettings: _getEditorSettings
    } = unlock(select(store_store));
    const editorSettings = _getEditorSettings();
    return {
      isTemplateHidden: getRenderingMode() === 'post-only',
      onNavigateToEntityRecord: editorSettings.onNavigateToEntityRecord,
      getEditorSettings: _getEditorSettings,
      hasGoBack: editorSettings.hasOwnProperty('onNavigateToPreviousEntityRecord')
    };
  }, []);
  const {
    get: getPreference
  } = (0,external_wp_data_namespaceObject.useSelect)(external_wp_preferences_namespaceObject.store);
  const {
    editedRecord: template,
    hasResolved
  } = (0,external_wp_coreData_namespaceObject.useEntityRecord)('postType', 'wp_template', id);
  const {
    createSuccessNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const {
    setRenderingMode,
    setDefaultRenderingMode
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(store_store));
  const canCreateTemplate = (0,external_wp_data_namespaceObject.useSelect)(select => !!select(external_wp_coreData_namespaceObject.store).canUser('create', {
    kind: 'postType',
    name: 'wp_template'
  }), []);
  const [popoverAnchor, setPopoverAnchor] = (0,external_wp_element_namespaceObject.useState)(null);
  const popoverProps = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    anchor: popoverAnchor,
    className: 'editor-post-template__dropdown',
    placement: 'left-start',
    offset: 36,
    shift: true
  }), [popoverAnchor]);
  if (!hasResolved) {
    return null;
  }
  const notificationAction = hasGoBack ? [{
    label: (0,external_wp_i18n_namespaceObject.__)('Go back'),
    onClick: () => getEditorSettings().onNavigateToPreviousEntityRecord()
  }] : undefined;
  const mayShowTemplateEditNotice = () => {
    if (!getPreference('core/edit-site', 'welcomeGuideTemplate')) {
      createSuccessNotice((0,external_wp_i18n_namespaceObject.__)('Editing template. Changes made here affect all posts and pages that use the template.'), {
        type: 'snackbar',
        actions: notificationAction
      });
    }
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_panel_row, {
    label: (0,external_wp_i18n_namespaceObject.__)('Template'),
    ref: setPopoverAnchor,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.DropdownMenu, {
      popoverProps: popoverProps,
      focusOnMount: true,
      toggleProps: {
        size: 'compact',
        variant: 'tertiary',
        tooltipPosition: 'middle left'
      },
      label: (0,external_wp_i18n_namespaceObject.__)('Template options'),
      text: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(template.title),
      icon: null,
      children: ({
        onClose
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.MenuGroup, {
          children: [canCreateTemplate && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
            onClick: () => {
              onNavigateToEntityRecord({
                postId: template.id,
                postType: 'wp_template'
              });
              onClose();
              mayShowTemplateEditNotice();
            },
            children: (0,external_wp_i18n_namespaceObject.__)('Edit template')
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(SwapTemplateButton, {
            onClick: onClose
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(ResetDefaultTemplate, {
            onClick: onClose
          }), canCreateTemplate && (0,external_ReactJSXRuntime_namespaceObject.jsx)(CreateNewTemplate, {
            onClick: onClose
          })]
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuGroup, {
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
            icon: !isTemplateHidden ? library_check : undefined,
            isSelected: !isTemplateHidden,
            role: "menuitemcheckbox",
            onClick: () => {
              const newRenderingMode = isTemplateHidden ? 'template-locked' : 'post-only';
              setRenderingMode(newRenderingMode);
              setDefaultRenderingMode(newRenderingMode);
            },
            children: (0,external_wp_i18n_namespaceObject.__)('Show template')
          })
        })]
      })
    })
  });
}
;
function PostTemplatePanel() {
  const {
    templateId,
    isBlockTheme
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentTemplateId,
      getEditorSettings
    } = select(store_store);
    return {
      templateId: getCurrentTemplateId(),
      isBlockTheme: getEditorSettings().__unstableIsBlockBasedTheme
    };
  }, []);
  const isVisible = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$canUser;
    const postTypeSlug = select(store_store).getCurrentPostType();
    const postType = select(external_wp_coreData_namespaceObject.store).getPostType(postTypeSlug);
    if (!postType?.viewable) {
      return false;
    }
    const settings = select(store_store).getEditorSettings();
    const hasTemplates = !!settings.availableTemplates && Object.keys(settings.availableTemplates).length > 0;
    if (hasTemplates) {
      return true;
    }
    if (!settings.supportsTemplateMode) {
      return false;
    }
    const canCreateTemplates = (_select$canUser = select(external_wp_coreData_namespaceObject.store).canUser('create', {
      kind: 'postType',
      name: 'wp_template'
    })) !== null && _select$canUser !== void 0 ? _select$canUser : false;
    return canCreateTemplates;
  }, []);
  const canViewTemplates = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$canUser2;
    return (_select$canUser2 = select(external_wp_coreData_namespaceObject.store).canUser('read', {
      kind: 'postType',
      name: 'wp_template'
    })) !== null && _select$canUser2 !== void 0 ? _select$canUser2 : false;
  }, []);
  if ((!isBlockTheme || !canViewTemplates) && isVisible) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(classic_theme, {});
  }
  if (isBlockTheme && !!templateId) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(BlockThemeControl, {
      id: templateId
    });
  }
  return null;
}
;
const BASE_QUERY = {
  _fields: 'id,name',
  context: 'view' 
};
const AUTHORS_QUERY = {
  who: 'authors',
  per_page: 100,
  ...BASE_QUERY
};
;
function useAuthorsQuery(search) {
  const {
    authorId,
    authors,
    postAuthor,
    isLoading
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getUser,
      getUsers,
      isResolving
    } = select(external_wp_coreData_namespaceObject.store);
    const {
      getEditedPostAttribute
    } = select(store_store);
    const _authorId = getEditedPostAttribute('author');
    const query = {
      ...AUTHORS_QUERY
    };
    if (search) {
      query.search = search;
      query.search_columns = ['name'];
    }
    return {
      authorId: _authorId,
      authors: getUsers(query),
      postAuthor: getUser(_authorId, BASE_QUERY),
      isLoading: isResolving('getUsers', [query])
    };
  }, [search]);
  const authorOptions = (0,external_wp_element_namespaceObject.useMemo)(() => {
    const fetchedAuthors = (authors !== null && authors !== void 0 ? authors : []).map(author => {
      return {
        value: author.id,
        label: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(author.name)
      };
    });
    const foundAuthor = fetchedAuthors.findIndex(({
      value
    }) => postAuthor?.id === value);
    let currentAuthor = [];
    if (foundAuthor < 0 && postAuthor) {
      currentAuthor = [{
        value: postAuthor.id,
        label: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(postAuthor.name)
      }];
    } else if (foundAuthor < 0 && !postAuthor) {
      currentAuthor = [{
        value: 0,
        label: (0,external_wp_i18n_namespaceObject.__)('(No author)')
      }];
    }
    return [...currentAuthor, ...fetchedAuthors];
  }, [authors, postAuthor]);
  return {
    authorId,
    authorOptions,
    postAuthor,
    isLoading
  };
}
;
function PostAuthorCombobox() {
  const [fieldValue, setFieldValue] = (0,external_wp_element_namespaceObject.useState)();
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    authorId,
    authorOptions,
    isLoading
  } = useAuthorsQuery(fieldValue);
  const handleSelect = postAuthorId => {
    if (!postAuthorId) {
      return;
    }
    editPost({
      author: postAuthorId
    });
  };
  const handleKeydown = inputValue => {
    setFieldValue(inputValue);
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ComboboxControl, {
    __nextHasNoMarginBottom: true,
    __next40pxDefaultSize: true,
    label: (0,external_wp_i18n_namespaceObject.__)('Author'),
    options: authorOptions,
    value: authorId,
    onFilterValueChange: (0,external_wp_compose_namespaceObject.debounce)(handleKeydown, 300),
    onChange: handleSelect,
    allowReset: false,
    hideLabelFromVision: true,
    isLoading: isLoading
  });
}
;
function PostAuthorSelect() {
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    authorId,
    authorOptions
  } = useAuthorsQuery();
  const setAuthorId = value => {
    const author = Number(value);
    editPost({
      author
    });
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
    __next40pxDefaultSize: true,
    __nextHasNoMarginBottom: true,
    className: "post-author-selector",
    label: (0,external_wp_i18n_namespaceObject.__)('Author'),
    options: authorOptions,
    onChange: setAuthorId,
    value: authorId,
    hideLabelFromVision: true
  });
}
;
const minimumUsersForCombobox = 25;
function PostAuthor() {
  const showCombobox = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const authors = select(external_wp_coreData_namespaceObject.store).getUsers(AUTHORS_QUERY);
    return authors?.length >= minimumUsersForCombobox;
  }, []);
  if (showCombobox) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostAuthorCombobox, {});
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostAuthorSelect, {});
}
 const post_author = (PostAuthor);
;
function PostAuthorCheck({
  children
}) {
  const {
    hasAssignAuthorAction,
    hasAuthors
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const post = select(store_store).getCurrentPost();
    const canAssignAuthor = post?._links?.['wp:action-assign-author'] ? true : false;
    return {
      hasAssignAuthorAction: canAssignAuthor,
      hasAuthors: canAssignAuthor ? select(external_wp_coreData_namespaceObject.store).getUsers(AUTHORS_QUERY)?.length >= 1 : false
    };
  }, []);
  if (!hasAssignAuthorAction || !hasAuthors) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_type_support_check, {
    supportKeys: "author",
    children: children
  });
}
;
function PostAuthorToggle({
  isOpen,
  onClick
}) {
  const {
    postAuthor
  } = useAuthorsQuery();
  const authorName = (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(postAuthor?.name) || (0,external_wp_i18n_namespaceObject.__)('(No author)');
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
    size: "compact",
    className: "editor-post-author__panel-toggle",
    variant: "tertiary",
    "aria-expanded": isOpen,
    "aria-label":
    (0,external_wp_i18n_namespaceObject.sprintf)((0,external_wp_i18n_namespaceObject.__)('Change author: %s'), authorName),
    onClick: onClick,
    children: authorName
  });
}
function panel_PostAuthor() {
  const [popoverAnchor, setPopoverAnchor] = (0,external_wp_element_namespaceObject.useState)(null);
  const popoverProps = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    anchor: popoverAnchor,
    placement: 'left-start',
    offset: 36,
    shift: true
  }), [popoverAnchor]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostAuthorCheck, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_panel_row, {
      label: (0,external_wp_i18n_namespaceObject.__)('Author'),
      ref: setPopoverAnchor,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
        popoverProps: popoverProps,
        contentClassName: "editor-post-author__panel-dialog",
        focusOnMount: true,
        renderToggle: ({
          isOpen,
          onToggle
        }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostAuthorToggle, {
          isOpen: isOpen,
          onClick: onToggle
        }),
        renderContent: ({
          onClose
        }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
          className: "editor-post-author",
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalInspectorPopoverHeader, {
            title: (0,external_wp_i18n_namespaceObject.__)('Author'),
            onClose: onClose
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_author, {
            onClose: onClose
          })]
        })
      })
    })
  });
}
 const panel = (panel_PostAuthor);
;
const COMMENT_OPTIONS = [{
  label: (0,external_wp_i18n_namespaceObject._x)('Open', 'Adjective: e.g. "Comments are open"'),
  value: 'open',
  description: (0,external_wp_i18n_namespaceObject.__)('Visitors can add new comments and replies.')
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Closed'),
  value: 'closed',
  description: [(0,external_wp_i18n_namespaceObject.__)('Visitors cannot add new comments or replies.'), (0,external_wp_i18n_namespaceObject.__)('Existing comments remain visible.')].join(' ')
}];
function PostComments() {
  const commentStatus = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$getEditedPost;
    return (_select$getEditedPost = select(store_store).getEditedPostAttribute('comment_status')) !== null && _select$getEditedPost !== void 0 ? _select$getEditedPost : 'open';
  }, []);
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const handleStatus = newCommentStatus => editPost({
    comment_status: newCommentStatus
  });
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalVStack, {
      spacing: 4,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.RadioControl, {
        className: "editor-change-status__options",
        hideLabelFromVision: true,
        label: (0,external_wp_i18n_namespaceObject.__)('Comment status'),
        options: COMMENT_OPTIONS,
        onChange: handleStatus,
        selected: commentStatus
      })
    })
  });
}
 const post_comments = (PostComments);
;
function PostPingbacks() {
  const pingStatus = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$getEditedPost;
    return (_select$getEditedPost = select(store_store).getEditedPostAttribute('ping_status')) !== null && _select$getEditedPost !== void 0 ? _select$getEditedPost : 'open';
  }, []);
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const onTogglePingback = () => editPost({
    ping_status: pingStatus === 'open' ? 'closed' : 'open'
  });
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.CheckboxControl, {
    __nextHasNoMarginBottom: true,
    label: (0,external_wp_i18n_namespaceObject.__)('Enable pingbacks & trackbacks'),
    checked: pingStatus === 'open',
    onChange: onTogglePingback,
    help: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ExternalLink, {
      href: (0,external_wp_i18n_namespaceObject.__)('https://wordpress.org/documentation/article/trackbacks-and-pingbacks/'),
      children: (0,external_wp_i18n_namespaceObject.__)('Learn more about pingbacks & trackbacks')
    })
  });
}
 const post_pingbacks = (PostPingbacks);
;
const panel_PANEL_NAME = 'discussion-panel';
function ModalContents({
  onClose
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "editor-post-discussion",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalInspectorPopoverHeader, {
      title: (0,external_wp_i18n_namespaceObject.__)('Discussion'),
      onClose: onClose
    }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      spacing: 4,
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(post_type_support_check, {
        supportKeys: "comments",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_comments, {})
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_type_support_check, {
        supportKeys: "trackbacks",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_pingbacks, {})
      })]
    })]
  });
}
function PostDiscussionToggle({
  isOpen,
  onClick
}) {
  const {
    commentStatus,
    pingStatus,
    commentsSupported,
    trackbacksSupported
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _getEditedPostAttribu, _getEditedPostAttribu2;
    const {
      getEditedPostAttribute
    } = select(store_store);
    const {
      getPostType
    } = select(external_wp_coreData_namespaceObject.store);
    const postType = getPostType(getEditedPostAttribute('type'));
    return {
      commentStatus: (_getEditedPostAttribu = getEditedPostAttribute('comment_status')) !== null && _getEditedPostAttribu !== void 0 ? _getEditedPostAttribu : 'open',
      pingStatus: (_getEditedPostAttribu2 = getEditedPostAttribute('ping_status')) !== null && _getEditedPostAttribu2 !== void 0 ? _getEditedPostAttribu2 : 'open',
      commentsSupported: !!postType.supports.comments,
      trackbacksSupported: !!postType.supports.trackbacks
    };
  }, []);
  let label;
  if (commentStatus === 'open') {
    if (pingStatus === 'open') {
      label = (0,external_wp_i18n_namespaceObject._x)('Open', 'Adjective: e.g. "Comments are open"');
    } else {
      label = trackbacksSupported ? (0,external_wp_i18n_namespaceObject.__)('Comments only') : (0,external_wp_i18n_namespaceObject._x)('Open', 'Adjective: e.g. "Comments are open"');
    }
  } else if (pingStatus === 'open') {
    label = commentsSupported ? (0,external_wp_i18n_namespaceObject.__)('Pings only') : (0,external_wp_i18n_namespaceObject.__)('Pings enabled');
  } else {
    label = (0,external_wp_i18n_namespaceObject.__)('Closed');
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
    size: "compact",
    className: "editor-post-discussion__panel-toggle",
    variant: "tertiary",
    "aria-label": (0,external_wp_i18n_namespaceObject.__)('Change discussion options'),
    "aria-expanded": isOpen,
    onClick: onClick,
    children: label
  });
}
function PostDiscussionPanel() {
  const {
    isEnabled
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      isEditorPanelEnabled
    } = select(store_store);
    return {
      isEnabled: isEditorPanelEnabled(panel_PANEL_NAME)
    };
  }, []);
  const [popoverAnchor, setPopoverAnchor] = (0,external_wp_element_namespaceObject.useState)(null);
  const popoverProps = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    anchor: popoverAnchor,
    placement: 'left-start',
    offset: 36,
    shift: true
  }), [popoverAnchor]);
  if (!isEnabled) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_type_support_check, {
    supportKeys: ['comments', 'trackbacks'],
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_panel_row, {
      label: (0,external_wp_i18n_namespaceObject.__)('Discussion'),
      ref: setPopoverAnchor,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
        popoverProps: popoverProps,
        className: "editor-post-discussion__panel-dropdown",
        contentClassName: "editor-post-discussion__panel-dialog",
        focusOnMount: true,
        renderToggle: ({
          isOpen,
          onToggle
        }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostDiscussionToggle, {
          isOpen: isOpen,
          onClick: onToggle
        }),
        renderContent: ({
          onClose
        }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(ModalContents, {
          onClose: onClose
        })
      })
    })
  });
}
;
function PostExcerpt({
  hideLabelFromVision = false,
  updateOnBlur = false
}) {
  const {
    excerpt,
    shouldUseDescriptionLabel,
    usedAttribute
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostType,
      getEditedPostAttribute
    } = select(store_store);
    const postType = getCurrentPostType();
    const _usedAttribute = ['wp_template', 'wp_template_part'].includes(postType) ? 'description' : 'excerpt';
    return {
      excerpt: getEditedPostAttribute(_usedAttribute),
      shouldUseDescriptionLabel: ['wp_template', 'wp_template_part', 'wp_block'].includes(postType),
      usedAttribute: _usedAttribute
    };
  }, []);
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const [localExcerpt, setLocalExcerpt] = (0,external_wp_element_namespaceObject.useState)((0,external_wp_htmlEntities_namespaceObject.decodeEntities)(excerpt));
  const updatePost = value => {
    editPost({
      [usedAttribute]: value
    });
  };
  const label = shouldUseDescriptionLabel ? (0,external_wp_i18n_namespaceObject.__)('Write a description (optional)') : (0,external_wp_i18n_namespaceObject.__)('Write an excerpt (optional)');
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    className: "editor-post-excerpt",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextareaControl, {
      __nextHasNoMarginBottom: true,
      label: label,
      hideLabelFromVision: hideLabelFromVision,
      className: "editor-post-excerpt__textarea",
      onChange: updateOnBlur ? setLocalExcerpt : updatePost,
      onBlur: updateOnBlur ? () => updatePost(localExcerpt) : undefined,
      value: updateOnBlur ? localExcerpt : excerpt,
      help: !shouldUseDescriptionLabel ? (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ExternalLink, {
        href: (0,external_wp_i18n_namespaceObject.__)('https://wordpress.org/documentation/article/page-post-settings-sidebar/#excerpt'),
        children: (0,external_wp_i18n_namespaceObject.__)('Learn more about manual excerpts')
      }) : (0,external_wp_i18n_namespaceObject.__)('Write a description')
    })
  });
}
;
function PostExcerptCheck({
  children
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_type_support_check, {
    supportKeys: "excerpt",
    children: children
  });
}
 const post_excerpt_check = (PostExcerptCheck);
;
const {
  Fill: plugin_Fill,
  Slot: plugin_Slot
} = (0,external_wp_components_namespaceObject.createSlotFill)('PluginPostExcerpt');
const PluginPostExcerpt = ({
  children,
  className
}) => {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(plugin_Fill, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelRow, {
      className: className,
      children: children
    })
  });
};
PluginPostExcerpt.Slot = plugin_Slot;
 const post_excerpt_plugin = (PluginPostExcerpt);
;
const post_excerpt_panel_PANEL_NAME = 'post-excerpt';
function ExcerptPanel() {
  const {
    isOpened,
    isEnabled,
    postType
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      isEditorPanelOpened,
      isEditorPanelEnabled,
      getCurrentPostType
    } = select(store_store);
    return {
      isOpened: isEditorPanelOpened(post_excerpt_panel_PANEL_NAME),
      isEnabled: isEditorPanelEnabled(post_excerpt_panel_PANEL_NAME),
      postType: getCurrentPostType()
    };
  }, []);
  const {
    toggleEditorPanelOpened
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const toggleExcerptPanel = () => toggleEditorPanelOpened(post_excerpt_panel_PANEL_NAME);
  if (!isEnabled) {
    return null;
  }
  const shouldUseDescriptionLabel = ['wp_template', 'wp_template_part', 'wp_block'].includes(postType);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
    title: shouldUseDescriptionLabel ? (0,external_wp_i18n_namespaceObject.__)('Description') : (0,external_wp_i18n_namespaceObject.__)('Excerpt'),
    opened: isOpened,
    onToggle: toggleExcerptPanel,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_excerpt_plugin.Slot, {
      children: fills => (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(PostExcerpt, {}), fills]
      })
    })
  });
}
function PostExcerptPanel() {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_excerpt_check, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(ExcerptPanel, {})
  });
}
function PrivatePostExcerptPanel() {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_excerpt_check, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PrivateExcerpt, {})
  });
}
function PrivateExcerpt() {
  const {
    shouldRender,
    excerpt,
    shouldBeUsedAsDescription,
    allowEditing
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostType,
      getCurrentPostId,
      getEditedPostAttribute,
      isEditorPanelEnabled
    } = select(store_store);
    const postType = getCurrentPostType();
    const isTemplateOrTemplatePart = ['wp_template', 'wp_template_part'].includes(postType);
    const isPattern = postType === 'wp_block';
    const _shouldBeUsedAsDescription = isTemplateOrTemplatePart || isPattern;
    const _usedAttribute = isTemplateOrTemplatePart ? 'description' : 'excerpt';
    const template = isTemplateOrTemplatePart && select(external_wp_coreData_namespaceObject.store).getEntityRecord('postType', postType, getCurrentPostId());
    const _shouldRender = isEditorPanelEnabled(post_excerpt_panel_PANEL_NAME) || _shouldBeUsedAsDescription;
    return {
      excerpt: getEditedPostAttribute(_usedAttribute),
      shouldRender: _shouldRender,
      shouldBeUsedAsDescription: _shouldBeUsedAsDescription,
      allowEditing: _shouldRender && (!_shouldBeUsedAsDescription || isPattern || template && template.source === TEMPLATE_ORIGINS.custom && !template.has_theme_file && template.is_custom)
    };
  }, []);
  const [popoverAnchor, setPopoverAnchor] = (0,external_wp_element_namespaceObject.useState)(null);
  const label = shouldBeUsedAsDescription ? (0,external_wp_i18n_namespaceObject.__)('Description') : (0,external_wp_i18n_namespaceObject.__)('Excerpt');
  const popoverProps = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    anchor: popoverAnchor,
    'aria-label': label,
    headerTitle: label,
    placement: 'left-start',
    offset: 36,
    shift: true
  }), [popoverAnchor, label]);
  if (!shouldRender) {
    return false;
  }
  const excerptText = !!excerpt && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
    align: "left",
    numberOfLines: 4,
    truncate: allowEditing,
    children: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(excerpt)
  });
  if (!allowEditing) {
    return excerptText;
  }
  const excerptPlaceholder = shouldBeUsedAsDescription ? (0,external_wp_i18n_namespaceObject.__)('Add a description…') : (0,external_wp_i18n_namespaceObject.__)('Add an excerpt…');
  const triggerEditLabel = shouldBeUsedAsDescription ? (0,external_wp_i18n_namespaceObject.__)('Edit description') : (0,external_wp_i18n_namespaceObject.__)('Edit excerpt');
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
    children: [excerptText, (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
      className: "editor-post-excerpt__dropdown",
      contentClassName: "editor-post-excerpt__dropdown__content",
      popoverProps: popoverProps,
      focusOnMount: true,
      ref: setPopoverAnchor,
      renderToggle: ({
        onToggle
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        __next40pxDefaultSize: true,
        onClick: onToggle,
        variant: "link",
        children: excerptText ? triggerEditLabel : excerptPlaceholder
      }),
      renderContent: ({
        onClose
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalInspectorPopoverHeader, {
          title: label,
          onClose: onClose
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalVStack, {
          spacing: 4,
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_excerpt_plugin.Slot, {
            children: fills => (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
              children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(PostExcerpt, {
                hideLabelFromVision: true,
                updateOnBlur: true
              }), fills]
            })
          })
        })]
      })
    })]
  });
}
;
function ThemeSupportCheck({
  children,
  supportKeys
}) {
  const {
    postType,
    themeSupports
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return {
      postType: select(store_store).getEditedPostAttribute('type'),
      themeSupports: select(external_wp_coreData_namespaceObject.store).getThemeSupports()
    };
  }, []);
  const isSupported = (Array.isArray(supportKeys) ? supportKeys : [supportKeys]).some(key => {
    var _themeSupports$key;
    const supported = (_themeSupports$key = themeSupports?.[key]) !== null && _themeSupports$key !== void 0 ? _themeSupports$key : false;
    if ('post-thumbnails' === key && Array.isArray(supported)) {
      return supported.includes(postType);
    }
    return supported;
  });
  if (!isSupported) {
    return null;
  }
  return children;
}
;
function PostFeaturedImageCheck({
  children
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(ThemeSupportCheck, {
    supportKeys: "post-thumbnails",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_type_support_check, {
      supportKeys: "thumbnail",
      children: children
    })
  });
}
 const post_featured_image_check = (PostFeaturedImageCheck);
;
const ALLOWED_MEDIA_TYPES = ['image'];
const DEFAULT_FEATURE_IMAGE_LABEL = (0,external_wp_i18n_namespaceObject.__)('Featured image');
const DEFAULT_SET_FEATURE_IMAGE_LABEL = (0,external_wp_i18n_namespaceObject.__)('Add a featured image');
const instructions = (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
  children: (0,external_wp_i18n_namespaceObject.__)('To edit the featured image, you need permission to upload media.')
});
function getMediaDetails(media, postId) {
  var _media$media_details$, _media$media_details$2;
  if (!media) {
    return {};
  }
  const defaultSize = (0,external_wp_hooks_namespaceObject.applyFilters)('editor.PostFeaturedImage.imageSize', 'large', media.id, postId);
  if (defaultSize in ((_media$media_details$ = media?.media_details?.sizes) !== null && _media$media_details$ !== void 0 ? _media$media_details$ : {})) {
    return {
      mediaWidth: media.media_details.sizes[defaultSize].width,
      mediaHeight: media.media_details.sizes[defaultSize].height,
      mediaSourceUrl: media.media_details.sizes[defaultSize].source_url
    };
  }
  const fallbackSize = (0,external_wp_hooks_namespaceObject.applyFilters)('editor.PostFeaturedImage.imageSize', 'thumbnail', media.id, postId);
  if (fallbackSize in ((_media$media_details$2 = media?.media_details?.sizes) !== null && _media$media_details$2 !== void 0 ? _media$media_details$2 : {})) {
    return {
      mediaWidth: media.media_details.sizes[fallbackSize].width,
      mediaHeight: media.media_details.sizes[fallbackSize].height,
      mediaSourceUrl: media.media_details.sizes[fallbackSize].source_url
    };
  }
  return {
    mediaWidth: media.media_details.width,
    mediaHeight: media.media_details.height,
    mediaSourceUrl: media.source_url
  };
}
function PostFeaturedImage({
  currentPostId,
  featuredImageId,
  onUpdateImage,
  onRemoveImage,
  media,
  postType,
  noticeUI,
  noticeOperations,
  isRequestingFeaturedImageMedia
}) {
  const returnsFocusRef = (0,external_wp_element_namespaceObject.useRef)(false);
  const [isLoading, setIsLoading] = (0,external_wp_element_namespaceObject.useState)(false);
  const {
    getSettings
  } = (0,external_wp_data_namespaceObject.useSelect)(external_wp_blockEditor_namespaceObject.store);
  const {
    mediaSourceUrl
  } = getMediaDetails(media, currentPostId);
  function onDropFiles(filesList) {
    getSettings().mediaUpload({
      allowedTypes: ALLOWED_MEDIA_TYPES,
      filesList,
      onFileChange([image]) {
        if ((0,external_wp_blob_namespaceObject.isBlobURL)(image?.url)) {
          setIsLoading(true);
          return;
        }
        if (image) {
          onUpdateImage(image);
        }
        setIsLoading(false);
      },
      onError(message) {
        noticeOperations.removeAllNotices();
        noticeOperations.createErrorNotice(message);
      },
      multiple: false
    });
  }
  function getImageDescription(imageMedia) {
    if (imageMedia.alt_text) {
      return (0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject.__)('Current image: %s'), imageMedia.alt_text);
    }
    return (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('The current image has no alternative text. The file name is: %s'), imageMedia.media_details.sizes?.full?.file || imageMedia.slug);
  }
  function returnFocus(node) {
    if (returnsFocusRef.current && node) {
      node.focus();
      returnsFocusRef.current = false;
    }
  }
  const isMissingMedia = !isRequestingFeaturedImageMedia && !!featuredImageId && !media;
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(post_featured_image_check, {
    children: [noticeUI, (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "editor-post-featured-image",
      children: [media && (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        id: `editor-post-featured-image-${featuredImageId}-describedby`,
        className: "hidden",
        children: getImageDescription(media)
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.MediaUploadCheck, {
        fallback: instructions,
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.MediaUpload, {
          title: postType?.labels?.featured_image || DEFAULT_FEATURE_IMAGE_LABEL,
          onSelect: onUpdateImage,
          unstableFeaturedImageFlow: true,
          allowedTypes: ALLOWED_MEDIA_TYPES,
          modalClass: "editor-post-featured-image__media-modal",
          render: ({
            open
          }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
            className: "editor-post-featured-image__container",
            children: [isMissingMedia ? (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Notice, {
              status: "warning",
              isDismissible: false,
              children: (0,external_wp_i18n_namespaceObject.__)('Could not retrieve the featured image data.')
            }) : (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.Button, {
              __next40pxDefaultSize: true,
              ref: returnFocus,
              className: !featuredImageId ? 'editor-post-featured-image__toggle' : 'editor-post-featured-image__preview',
              onClick: open,
              "aria-label": !featuredImageId ? null : (0,external_wp_i18n_namespaceObject.__)('Edit or replace the featured image'),
              "aria-describedby": !featuredImageId ? null : `editor-post-featured-image-${featuredImageId}-describedby`,
              "aria-haspopup": "dialog",
              disabled: isLoading,
              accessibleWhenDisabled: true,
              children: [!!featuredImageId && media && (0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
                className: "editor-post-featured-image__preview-image",
                src: mediaSourceUrl,
                alt: getImageDescription(media)
              }), (isLoading || isRequestingFeaturedImageMedia) && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {}), !featuredImageId && !isLoading && (postType?.labels?.set_featured_image || DEFAULT_SET_FEATURE_IMAGE_LABEL)]
            }), !!featuredImageId && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
              className: dist_clsx('editor-post-featured-image__actions', {
                'editor-post-featured-image__actions-missing-image': isMissingMedia,
                'editor-post-featured-image__actions-is-requesting-image': isRequestingFeaturedImageMedia
              }),
              children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
                __next40pxDefaultSize: true,
                className: "editor-post-featured-image__action",
                onClick: open,
                "aria-haspopup": "dialog",
                variant: isMissingMedia ? 'secondary' : undefined,
                children: (0,external_wp_i18n_namespaceObject.__)('Replace')
              }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
                __next40pxDefaultSize: true,
                className: "editor-post-featured-image__action",
                onClick: () => {
                  onRemoveImage();
                  returnsFocusRef.current = true;
                },
                variant: isMissingMedia ? 'secondary' : undefined,
                isDestructive: isMissingMedia,
                children: (0,external_wp_i18n_namespaceObject.__)('Remove')
              })]
            }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.DropZone, {
              onFilesDrop: onDropFiles
            })]
          }),
          value: featuredImageId
        })
      })]
    })]
  });
}
const applyWithSelect = (0,external_wp_data_namespaceObject.withSelect)(select => {
  const {
    getMedia,
    getPostType,
    hasFinishedResolution
  } = select(external_wp_coreData_namespaceObject.store);
  const {
    getCurrentPostId,
    getEditedPostAttribute
  } = select(store_store);
  const featuredImageId = getEditedPostAttribute('featured_media');
  return {
    media: featuredImageId ? getMedia(featuredImageId, {
      context: 'view'
    }) : null,
    currentPostId: getCurrentPostId(),
    postType: getPostType(getEditedPostAttribute('type')),
    featuredImageId,
    isRequestingFeaturedImageMedia: !!featuredImageId && !hasFinishedResolution('getMedia', [featuredImageId, {
      context: 'view'
    }])
  };
});
const applyWithDispatch = (0,external_wp_data_namespaceObject.withDispatch)((dispatch, {
  noticeOperations
}, {
  select
}) => {
  const {
    editPost
  } = dispatch(store_store);
  return {
    onUpdateImage(image) {
      editPost({
        featured_media: image.id
      });
    },
    onDropImage(filesList) {
      select(external_wp_blockEditor_namespaceObject.store).getSettings().mediaUpload({
        allowedTypes: ['image'],
        filesList,
        onFileChange([image]) {
          editPost({
            featured_media: image.id
          });
        },
        onError(message) {
          noticeOperations.removeAllNotices();
          noticeOperations.createErrorNotice(message);
        },
        multiple: false
      });
    },
    onRemoveImage() {
      editPost({
        featured_media: 0
      });
    }
  };
});
 const post_featured_image = ((0,external_wp_compose_namespaceObject.compose)(external_wp_components_namespaceObject.withNotices, applyWithSelect, applyWithDispatch, (0,external_wp_components_namespaceObject.withFilters)('editor.PostFeaturedImage'))(PostFeaturedImage));
;
const post_featured_image_panel_PANEL_NAME = 'featured-image';
function PostFeaturedImagePanel({
  withPanelBody = true
}) {
  var _postType$labels$feat;
  const {
    postType,
    isEnabled,
    isOpened
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedPostAttribute,
      isEditorPanelEnabled,
      isEditorPanelOpened
    } = select(store_store);
    const {
      getPostType
    } = select(external_wp_coreData_namespaceObject.store);
    return {
      postType: getPostType(getEditedPostAttribute('type')),
      isEnabled: isEditorPanelEnabled(post_featured_image_panel_PANEL_NAME),
      isOpened: isEditorPanelOpened(post_featured_image_panel_PANEL_NAME)
    };
  }, []);
  const {
    toggleEditorPanelOpened
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  if (!isEnabled) {
    return null;
  }
  if (!withPanelBody) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_featured_image_check, {
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_featured_image, {})
    });
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_featured_image_check, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
      title: (_postType$labels$feat = postType?.labels?.featured_image) !== null && _postType$labels$feat !== void 0 ? _postType$labels$feat : (0,external_wp_i18n_namespaceObject.__)('Featured image'),
      opened: isOpened,
      onToggle: () => toggleEditorPanelOpened(post_featured_image_panel_PANEL_NAME),
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_featured_image, {})
    })
  });
}
;
function PostFormatCheck({
  children
}) {
  const disablePostFormats = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).getEditorSettings().disablePostFormats, []);
  if (disablePostFormats) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_type_support_check, {
    supportKeys: "post-formats",
    children: children
  });
}
;
const POST_FORMATS = [{
  id: 'aside',
  caption: (0,external_wp_i18n_namespaceObject.__)('Aside')
}, {
  id: 'audio',
  caption: (0,external_wp_i18n_namespaceObject.__)('Audio')
}, {
  id: 'chat',
  caption: (0,external_wp_i18n_namespaceObject.__)('Chat')
}, {
  id: 'gallery',
  caption: (0,external_wp_i18n_namespaceObject.__)('Gallery')
}, {
  id: 'image',
  caption: (0,external_wp_i18n_namespaceObject.__)('Image')
}, {
  id: 'link',
  caption: (0,external_wp_i18n_namespaceObject.__)('Link')
}, {
  id: 'quote',
  caption: (0,external_wp_i18n_namespaceObject.__)('Quote')
}, {
  id: 'standard',
  caption: (0,external_wp_i18n_namespaceObject.__)('Standard')
}, {
  id: 'status',
  caption: (0,external_wp_i18n_namespaceObject.__)('Status')
}, {
  id: 'video',
  caption: (0,external_wp_i18n_namespaceObject.__)('Video')
}].sort((a, b) => {
  const normalizedA = a.caption.toUpperCase();
  const normalizedB = b.caption.toUpperCase();
  if (normalizedA < normalizedB) {
    return -1;
  }
  if (normalizedA > normalizedB) {
    return 1;
  }
  return 0;
});
function PostFormat() {
  const instanceId = (0,external_wp_compose_namespaceObject.useInstanceId)(PostFormat);
  const postFormatSelectorId = `post-format-selector-${instanceId}`;
  const {
    postFormat,
    suggestedFormat,
    supportedFormats
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedPostAttribute,
      getSuggestedPostFormat
    } = select(store_store);
    const _postFormat = getEditedPostAttribute('format');
    const themeSupports = select(external_wp_coreData_namespaceObject.store).getThemeSupports();
    return {
      postFormat: _postFormat !== null && _postFormat !== void 0 ? _postFormat : 'standard',
      suggestedFormat: getSuggestedPostFormat(),
      supportedFormats: themeSupports.formats
    };
  }, []);
  const formats = POST_FORMATS.filter(format => {
    return supportedFormats?.includes(format.id) || postFormat === format.id;
  });
  const suggestion = formats.find(format => format.id === suggestedFormat);
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const onUpdatePostFormat = format => editPost({
    format
  });
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostFormatCheck, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "editor-post-format",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.RadioControl, {
        className: "editor-post-format__options",
        label: (0,external_wp_i18n_namespaceObject.__)('Post Format'),
        selected: postFormat,
        onChange: format => onUpdatePostFormat(format),
        id: postFormatSelectorId,
        options: formats.map(format => ({
          label: format.caption,
          value: format.id
        })),
        hideLabelFromVision: true
      }), suggestion && suggestion.id !== postFormat && (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
        className: "editor-post-format__suggestion",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "link",
          onClick: () => onUpdatePostFormat(suggestion.id),
          children: (0,external_wp_i18n_namespaceObject.sprintf)(
          (0,external_wp_i18n_namespaceObject.__)('Apply suggested format: %s'), suggestion.caption)
        })
      })]
    })
  });
}
;
function PostLastRevisionCheck({
  children
}) {
  const {
    lastRevisionId,
    revisionsCount
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostLastRevisionId,
      getCurrentPostRevisionsCount
    } = select(store_store);
    return {
      lastRevisionId: getCurrentPostLastRevisionId(),
      revisionsCount: getCurrentPostRevisionsCount()
    };
  }, []);
  if (!lastRevisionId || revisionsCount < 2) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_type_support_check, {
    supportKeys: "revisions",
    children: children
  });
}
 const post_last_revision_check = (PostLastRevisionCheck);
;
function usePostLastRevisionInfo() {
  return (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostLastRevisionId,
      getCurrentPostRevisionsCount
    } = select(store_store);
    return {
      lastRevisionId: getCurrentPostLastRevisionId(),
      revisionsCount: getCurrentPostRevisionsCount()
    };
  }, []);
}
function PostLastRevision() {
  const {
    lastRevisionId,
    revisionsCount
  } = usePostLastRevisionInfo();
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_last_revision_check, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
      __next40pxDefaultSize: true,
      href: (0,external_wp_url_namespaceObject.addQueryArgs)('revision.php', {
        revision: lastRevisionId
      }),
      className: "editor-post-last-revision__title",
      icon: library_backup,
      iconPosition: "right",
      text: (0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject.__)('Revisions (%s)'), revisionsCount)
    })
  });
}
function PrivatePostLastRevision() {
  const {
    lastRevisionId,
    revisionsCount
  } = usePostLastRevisionInfo();
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_last_revision_check, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_panel_row, {
      label: (0,external_wp_i18n_namespaceObject.__)('Revisions'),
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        href: (0,external_wp_url_namespaceObject.addQueryArgs)('revision.php', {
          revision: lastRevisionId
        }),
        className: "editor-private-post-last-revision__button",
        text: revisionsCount,
        variant: "tertiary",
        size: "compact"
      })
    })
  });
}
 const post_last_revision = (PostLastRevision);
;
function PostLastRevisionPanel() {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_last_revision_check, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
      className: "editor-post-last-revision__panel",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_last_revision, {})
    })
  });
}
 const post_last_revision_panel = (PostLastRevisionPanel);
;
function PostLockedModal() {
  const instanceId = (0,external_wp_compose_namespaceObject.useInstanceId)(PostLockedModal);
  const hookName = 'core/editor/post-locked-modal-' + instanceId;
  const {
    autosave,
    updatePostLock
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    isLocked,
    isTakeover,
    user,
    postId,
    postLockUtils,
    activePostLock,
    postType,
    previewLink
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      isPostLocked,
      isPostLockTakeover,
      getPostLockUser,
      getCurrentPostId,
      getActivePostLock,
      getEditedPostAttribute,
      getEditedPostPreviewLink,
      getEditorSettings
    } = select(store_store);
    const {
      getPostType
    } = select(external_wp_coreData_namespaceObject.store);
    return {
      isLocked: isPostLocked(),
      isTakeover: isPostLockTakeover(),
      user: getPostLockUser(),
      postId: getCurrentPostId(),
      postLockUtils: getEditorSettings().postLockUtils,
      activePostLock: getActivePostLock(),
      postType: getPostType(getEditedPostAttribute('type')),
      previewLink: getEditedPostPreviewLink()
    };
  }, []);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    function sendPostLock(data) {
      if (isLocked) {
        return;
      }
      data['wp-refresh-post-lock'] = {
        lock: activePostLock,
        post_id: postId
      };
    }
    function receivePostLock(data) {
      if (!data['wp-refresh-post-lock']) {
        return;
      }
      const received = data['wp-refresh-post-lock'];
      if (received.lock_error) {
        autosave();
        updatePostLock({
          isLocked: true,
          isTakeover: true,
          user: {
            name: received.lock_error.name,
            avatar: received.lock_error.avatar_src_2x
          }
        });
      } else if (received.new_lock) {
        updatePostLock({
          isLocked: false,
          activePostLock: received.new_lock
        });
      }
    }
    function releasePostLock() {
      if (isLocked || !activePostLock) {
        return;
      }
      const data = new window.FormData();
      data.append('action', 'wp-remove-post-lock');
      data.append('_wpnonce', postLockUtils.unlockNonce);
      data.append('post_ID', postId);
      data.append('active_post_lock', activePostLock);
      if (window.navigator.sendBeacon) {
        window.navigator.sendBeacon(postLockUtils.ajaxUrl, data);
      } else {
        const xhr = new window.XMLHttpRequest();
        xhr.open('POST', postLockUtils.ajaxUrl, false);
        xhr.send(data);
      }
    }
    (0,external_wp_hooks_namespaceObject.addAction)('heartbeat.send', hookName, sendPostLock);
    (0,external_wp_hooks_namespaceObject.addAction)('heartbeat.tick', hookName, receivePostLock);
    window.addEventListener('beforeunload', releasePostLock);
    return () => {
      (0,external_wp_hooks_namespaceObject.removeAction)('heartbeat.send', hookName);
      (0,external_wp_hooks_namespaceObject.removeAction)('heartbeat.tick', hookName);
      window.removeEventListener('beforeunload', releasePostLock);
    };
  }, []);
  if (!isLocked) {
    return null;
  }
  const userDisplayName = user.name;
  const userAvatar = user.avatar;
  const unlockUrl = (0,external_wp_url_namespaceObject.addQueryArgs)('post.php', {
    'get-post-lock': '1',
    lockKey: true,
    post: postId,
    action: 'edit',
    _wpnonce: postLockUtils.nonce
  });
  const allPostsUrl = (0,external_wp_url_namespaceObject.addQueryArgs)('edit.php', {
    post_type: postType?.slug
  });
  const allPostsLabel = (0,external_wp_i18n_namespaceObject.__)('Exit editor');
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Modal, {
    title: isTakeover ? (0,external_wp_i18n_namespaceObject.__)('Someone else has taken over this post') : (0,external_wp_i18n_namespaceObject.__)('This post is already being edited'),
    focusOnMount: true,
    shouldCloseOnClickOutside: false,
    shouldCloseOnEsc: false,
    isDismissible: false
    ,
    className: "editor-post-locked-modal",
    size: "medium",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
      alignment: "top",
      spacing: 6,
      children: [!!userAvatar && (0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
        src: userAvatar,
        alt: (0,external_wp_i18n_namespaceObject.__)('Avatar'),
        className: "editor-post-locked-modal__avatar",
        width: 64,
        height: 64
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        children: [!!isTakeover && (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
          children: (0,external_wp_element_namespaceObject.createInterpolateElement)(userDisplayName ? (0,external_wp_i18n_namespaceObject.sprintf)(
          (0,external_wp_i18n_namespaceObject.__)('<strong>%s</strong> now has editing control of this post (<PreviewLink />). Don’t worry, your changes up to this moment have been saved.'), userDisplayName) : (0,external_wp_i18n_namespaceObject.__)('Another user now has editing control of this post (<PreviewLink />). Don’t worry, your changes up to this moment have been saved.'), {
            strong: (0,external_ReactJSXRuntime_namespaceObject.jsx)("strong", {}),
            PreviewLink: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ExternalLink, {
              href: previewLink,
              children: (0,external_wp_i18n_namespaceObject.__)('preview')
            })
          })
        }), !isTakeover && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
            children: (0,external_wp_element_namespaceObject.createInterpolateElement)(userDisplayName ? (0,external_wp_i18n_namespaceObject.sprintf)(
            (0,external_wp_i18n_namespaceObject.__)('<strong>%s</strong> is currently working on this post (<PreviewLink />), which means you cannot make changes, unless you take over.'), userDisplayName) : (0,external_wp_i18n_namespaceObject.__)('Another user is currently working on this post (<PreviewLink />), which means you cannot make changes, unless you take over.'), {
              strong: (0,external_ReactJSXRuntime_namespaceObject.jsx)("strong", {}),
              PreviewLink: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ExternalLink, {
                href: previewLink,
                children: (0,external_wp_i18n_namespaceObject.__)('preview')
              })
            })
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
            children: (0,external_wp_i18n_namespaceObject.__)('If you take over, the other user will lose editing control to the post, but their changes will be saved.')
          })]
        }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
          className: "editor-post-locked-modal__buttons",
          justify: "flex-end",
          children: [!isTakeover && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            variant: "tertiary",
            href: unlockUrl,
            children: (0,external_wp_i18n_namespaceObject.__)('Take over')
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            variant: "primary",
            href: allPostsUrl,
            children: allPostsLabel
          })]
        })]
      })]
    })
  });
}
;
function PostPendingStatusCheck({
  children
}) {
  const {
    hasPublishAction,
    isPublished
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _getCurrentPost$_link;
    const {
      isCurrentPostPublished,
      getCurrentPost
    } = select(store_store);
    return {
      hasPublishAction: (_getCurrentPost$_link = getCurrentPost()._links?.['wp:action-publish']) !== null && _getCurrentPost$_link !== void 0 ? _getCurrentPost$_link : false,
      isPublished: isCurrentPostPublished()
    };
  }, []);
  if (isPublished || !hasPublishAction) {
    return null;
  }
  return children;
}
 const post_pending_status_check = (PostPendingStatusCheck);
;
function PostPendingStatus() {
  const status = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).getEditedPostAttribute('status'), []);
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const togglePendingStatus = () => {
    const updatedStatus = status === 'pending' ? 'draft' : 'pending';
    editPost({
      status: updatedStatus
    });
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_pending_status_check, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.CheckboxControl, {
      __nextHasNoMarginBottom: true,
      label: (0,external_wp_i18n_namespaceObject.__)('Pending review'),
      checked: status === 'pending',
      onChange: togglePendingStatus
    })
  });
}
 const post_pending_status = (PostPendingStatus);
;
function writeInterstitialMessage(targetDocument) {
  let markup = (0,external_wp_element_namespaceObject.renderToString)((0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "editor-post-preview-button__interstitial-message",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.SVG, {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 96 96",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Path, {
        className: "outer",
        d: "M48 12c19.9 0 36 16.1 36 36S67.9 84 48 84 12 67.9 12 48s16.1-36 36-36",
        fill: "none"
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Path, {
        className: "inner",
        d: "M69.5 46.4c0-3.9-1.4-6.7-2.6-8.8-1.6-2.6-3.1-4.9-3.1-7.5 0-2.9 2.2-5.7 5.4-5.7h.4C63.9 19.2 56.4 16 48 16c-11.2 0-21 5.7-26.7 14.4h2.1c3.3 0 8.5-.4 8.5-.4 1.7-.1 1.9 2.4.2 2.6 0 0-1.7.2-3.7.3L40 67.5l7-20.9L42 33c-1.7-.1-3.3-.3-3.3-.3-1.7-.1-1.5-2.7.2-2.6 0 0 5.3.4 8.4.4 3.3 0 8.5-.4 8.5-.4 1.7-.1 1.9 2.4.2 2.6 0 0-1.7.2-3.7.3l11.5 34.3 3.3-10.4c1.6-4.5 2.4-7.8 2.4-10.5zM16.1 48c0 12.6 7.3 23.5 18 28.7L18.8 35c-1.7 4-2.7 8.4-2.7 13zm32.5 2.8L39 78.6c2.9.8 5.9 1.3 9 1.3 3.7 0 7.3-.6 10.6-1.8-.1-.1-.2-.3-.2-.4l-9.8-26.9zM76.2 36c0 3.2-.6 6.9-2.4 11.4L64 75.6c9.5-5.5 15.9-15.8 15.9-27.6 0-5.5-1.4-10.8-3.9-15.3.1 1 .2 2.1.2 3.3z",
        fill: "none"
      })]
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
      children: (0,external_wp_i18n_namespaceObject.__)('Generating preview…')
    })]
  }));
  markup += `
		<style>
			body {
				margin: 0;
			}
			.editor-post-preview-button__interstitial-message {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				height: 100vh;
				width: 100vw;
			}
			@-webkit-keyframes paint {
				0% {
					stroke-dashoffset: 0;
				}
			}
			@-moz-keyframes paint {
				0% {
					stroke-dashoffset: 0;
				}
			}
			@-o-keyframes paint {
				0% {
					stroke-dashoffset: 0;
				}
			}
			@keyframes paint {
				0% {
					stroke-dashoffset: 0;
				}
			}
			.editor-post-preview-button__interstitial-message svg {
				width: 192px;
				height: 192px;
				stroke: #555d66;
				stroke-width: 0.75;
			}
			.editor-post-preview-button__interstitial-message svg .outer,
			.editor-post-preview-button__interstitial-message svg .inner {
				stroke-dasharray: 280;
				stroke-dashoffset: 280;
				-webkit-animation: paint 1.5s ease infinite alternate;
				-moz-animation: paint 1.5s ease infinite alternate;
				-o-animation: paint 1.5s ease infinite alternate;
				animation: paint 1.5s ease infinite alternate;
			}
			p {
				text-align: center;
				font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
			}
		</style>
	`;
  markup = (0,external_wp_hooks_namespaceObject.applyFilters)('editor.PostPreview.interstitialMarkup', markup);
  targetDocument.write(markup);
  targetDocument.title = (0,external_wp_i18n_namespaceObject.__)('Generating preview…');
  targetDocument.close();
}
function PostPreviewButton({
  className,
  textContent,
  forceIsAutosaveable,
  role,
  onPreview
}) {
  const {
    postId,
    currentPostLink,
    previewLink,
    isSaveable,
    isViewable
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _postType$viewable;
    const editor = select(store_store);
    const core = select(external_wp_coreData_namespaceObject.store);
    const postType = core.getPostType(editor.getCurrentPostType('type'));
    const canView = (_postType$viewable = postType?.viewable) !== null && _postType$viewable !== void 0 ? _postType$viewable : false;
    if (!canView) {
      return {
        isViewable: canView
      };
    }
    return {
      postId: editor.getCurrentPostId(),
      currentPostLink: editor.getCurrentPostAttribute('link'),
      previewLink: editor.getEditedPostPreviewLink(),
      isSaveable: editor.isEditedPostSaveable(),
      isViewable: canView
    };
  }, []);
  const {
    __unstableSaveForPreview
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  if (!isViewable) {
    return null;
  }
  const targetId = `wp-preview-${postId}`;
  const openPreviewWindow = async event => {
    event.preventDefault();
    const previewWindow = window.open('', targetId);
    previewWindow.focus();
    writeInterstitialMessage(previewWindow.document);
    const link = await __unstableSaveForPreview({
      forceIsAutosaveable
    });
    previewWindow.location = link;
    onPreview?.();
  };
  const href = previewLink || currentPostLink;
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
    variant: !className ? 'tertiary' : undefined,
    className: className || 'editor-post-preview',
    href: href,
    target: targetId,
    accessibleWhenDisabled: true,
    disabled: !isSaveable,
    onClick: openPreviewWindow,
    role: role,
    size: "compact",
    children: textContent || (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [(0,external_wp_i18n_namespaceObject._x)('Preview', 'imperative verb'), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.VisuallyHidden, {
        as: "span",
        children: 
        (0,external_wp_i18n_namespaceObject.__)('(opens in a new tab)')
      })]
    })
  });
}
;
function PublishButtonLabel() {
  const isSmallerThanMediumViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('medium', '<');
  const {
    isPublished,
    isBeingScheduled,
    isSaving,
    isPublishing,
    hasPublishAction,
    isAutosaving,
    hasNonPostEntityChanges,
    postStatusHasChanged,
    postStatus
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _getCurrentPost$_link;
    const {
      isCurrentPostPublished,
      isEditedPostBeingScheduled,
      isSavingPost,
      isPublishingPost,
      getCurrentPost,
      getCurrentPostType,
      isAutosavingPost,
      getPostEdits,
      getEditedPostAttribute
    } = select(store_store);
    return {
      isPublished: isCurrentPostPublished(),
      isBeingScheduled: isEditedPostBeingScheduled(),
      isSaving: isSavingPost(),
      isPublishing: isPublishingPost(),
      hasPublishAction: (_getCurrentPost$_link = getCurrentPost()._links?.['wp:action-publish']) !== null && _getCurrentPost$_link !== void 0 ? _getCurrentPost$_link : false,
      postType: getCurrentPostType(),
      isAutosaving: isAutosavingPost(),
      hasNonPostEntityChanges: select(store_store).hasNonPostEntityChanges(),
      postStatusHasChanged: !!getPostEdits()?.status,
      postStatus: getEditedPostAttribute('status')
    };
  }, []);
  if (isPublishing) {
    return (0,external_wp_i18n_namespaceObject.__)('Publishing…');
  } else if ((isPublished || isBeingScheduled) && isSaving && !isAutosaving) {
    return (0,external_wp_i18n_namespaceObject.__)('Saving…');
  }
  if (!hasPublishAction) {
    return isSmallerThanMediumViewport ? (0,external_wp_i18n_namespaceObject.__)('Publish') : (0,external_wp_i18n_namespaceObject.__)('Submit for Review');
  }
  if (hasNonPostEntityChanges || isPublished || postStatusHasChanged && !['future', 'publish'].includes(postStatus) || !postStatusHasChanged && postStatus === 'future') {
    return (0,external_wp_i18n_namespaceObject.__)('Save');
  }
  if (isBeingScheduled) {
    return (0,external_wp_i18n_namespaceObject.__)('Schedule');
  }
  return (0,external_wp_i18n_namespaceObject.__)('Publish');
}
;
const post_publish_button_noop = () => {};
class PostPublishButton extends external_wp_element_namespaceObject.Component {
  constructor(props) {
    super(props);
    this.createOnClick = this.createOnClick.bind(this);
    this.closeEntitiesSavedStates = this.closeEntitiesSavedStates.bind(this);
    this.state = {
      entitiesSavedStatesCallback: false
    };
  }
  createOnClick(callback) {
    return (...args) => {
      const {
        hasNonPostEntityChanges,
        setEntitiesSavedStatesCallback
      } = this.props;
      if (hasNonPostEntityChanges && setEntitiesSavedStatesCallback) {
        this.setState({
          entitiesSavedStatesCallback: () => callback(...args)
        });
        setEntitiesSavedStatesCallback(() => this.closeEntitiesSavedStates);
        return post_publish_button_noop;
      }
      return callback(...args);
    };
  }
  closeEntitiesSavedStates(savedEntities) {
    const {
      postType,
      postId
    } = this.props;
    const {
      entitiesSavedStatesCallback
    } = this.state;
    this.setState({
      entitiesSavedStatesCallback: false
    }, () => {
      if (savedEntities && savedEntities.some(elt => elt.kind === 'postType' && elt.name === postType && elt.key === postId)) {
        entitiesSavedStatesCallback();
      }
    });
  }
  render() {
    const {
      forceIsDirty,
      hasPublishAction,
      isBeingScheduled,
      isOpen,
      isPostSavingLocked,
      isPublishable,
      isPublished,
      isSaveable,
      isSaving,
      isAutoSaving,
      isToggle,
      savePostStatus,
      onSubmit = post_publish_button_noop,
      onToggle,
      visibility,
      hasNonPostEntityChanges,
      isSavingNonPostEntityChanges,
      postStatus,
      postStatusHasChanged
    } = this.props;
    const isButtonDisabled = (isSaving || !isSaveable || isPostSavingLocked || !isPublishable && !forceIsDirty) && (!hasNonPostEntityChanges || isSavingNonPostEntityChanges);
    const isToggleDisabled = (isPublished || isSaving || !isSaveable || !isPublishable && !forceIsDirty) && (!hasNonPostEntityChanges || isSavingNonPostEntityChanges);
    let publishStatus = 'publish';
    if (postStatusHasChanged) {
      publishStatus = postStatus;
    } else if (!hasPublishAction) {
      publishStatus = 'pending';
    } else if (visibility === 'private') {
      publishStatus = 'private';
    } else if (isBeingScheduled) {
      publishStatus = 'future';
    }
    const onClickButton = () => {
      if (isButtonDisabled) {
        return;
      }
      onSubmit();
      savePostStatus(publishStatus);
    };
    const onClickToggle = () => {
      if (isToggleDisabled) {
        return;
      }
      onToggle();
    };
    const buttonProps = {
      'aria-disabled': isButtonDisabled,
      className: 'editor-post-publish-button',
      isBusy: !isAutoSaving && isSaving,
      variant: 'primary',
      onClick: this.createOnClick(onClickButton),
      'aria-haspopup': hasNonPostEntityChanges ? 'dialog' : undefined
    };
    const toggleProps = {
      'aria-disabled': isToggleDisabled,
      'aria-expanded': isOpen,
      className: 'editor-post-publish-panel__toggle',
      isBusy: isSaving && isPublished,
      variant: 'primary',
      size: 'compact',
      onClick: this.createOnClick(onClickToggle),
      'aria-haspopup': hasNonPostEntityChanges ? 'dialog' : undefined
    };
    const componentProps = isToggle ? toggleProps : buttonProps;
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        ...componentProps,
        className: `${componentProps.className} editor-post-publish-button__button`,
        size: "compact",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PublishButtonLabel, {})
      })
    });
  }
}
 const post_publish_button = ((0,external_wp_compose_namespaceObject.compose)([(0,external_wp_data_namespaceObject.withSelect)(select => {
  var _getCurrentPost$_link;
  const {
    isSavingPost,
    isAutosavingPost,
    isEditedPostBeingScheduled,
    getEditedPostVisibility,
    isCurrentPostPublished,
    isEditedPostSaveable,
    isEditedPostPublishable,
    isPostSavingLocked,
    getCurrentPost,
    getCurrentPostType,
    getCurrentPostId,
    hasNonPostEntityChanges,
    isSavingNonPostEntityChanges,
    getEditedPostAttribute,
    getPostEdits
  } = select(store_store);
  return {
    isSaving: isSavingPost(),
    isAutoSaving: isAutosavingPost(),
    isBeingScheduled: isEditedPostBeingScheduled(),
    visibility: getEditedPostVisibility(),
    isSaveable: isEditedPostSaveable(),
    isPostSavingLocked: isPostSavingLocked(),
    isPublishable: isEditedPostPublishable(),
    isPublished: isCurrentPostPublished(),
    hasPublishAction: (_getCurrentPost$_link = getCurrentPost()._links?.['wp:action-publish']) !== null && _getCurrentPost$_link !== void 0 ? _getCurrentPost$_link : false,
    postType: getCurrentPostType(),
    postId: getCurrentPostId(),
    postStatus: getEditedPostAttribute('status'),
    postStatusHasChanged: getPostEdits()?.status,
    hasNonPostEntityChanges: hasNonPostEntityChanges(),
    isSavingNonPostEntityChanges: isSavingNonPostEntityChanges()
  };
}), (0,external_wp_data_namespaceObject.withDispatch)(dispatch => {
  const {
    editPost,
    savePost
  } = dispatch(store_store);
  return {
    savePostStatus: status => {
      editPost({
        status
      }, {
        undoIgnore: true
      });
      savePost();
    }
  };
})])(PostPublishButton));
;
const wordpress = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "-2 -2 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M20 10c0-5.51-4.49-10-10-10C4.48 0 0 4.49 0 10c0 5.52 4.48 10 10 10 5.51 0 10-4.48 10-10zM7.78 15.37L4.37 6.22c.55-.02 1.17-.08 1.17-.08.5-.06.44-1.13-.06-1.11 0 0-1.45.11-2.37.11-.18 0-.37 0-.58-.01C4.12 2.69 6.87 1.11 10 1.11c2.33 0 4.45.87 6.05 2.34-.68-.11-1.65.39-1.65 1.58 0 .74.45 1.36.9 2.1.35.61.55 1.36.55 2.46 0 1.49-1.4 5-1.4 5l-3.03-8.37c.54-.02.82-.17.82-.17.5-.05.44-1.25-.06-1.22 0 0-1.44.12-2.38.12-.87 0-2.33-.12-2.33-.12-.5-.03-.56 1.2-.06 1.22l.92.08 1.26 3.41zM17.41 10c.24-.64.74-1.87.43-4.25.7 1.29 1.05 2.71 1.05 4.25 0 3.29-1.73 6.24-4.4 7.78.97-2.59 1.94-5.2 2.92-7.78zM6.1 18.09C3.12 16.65 1.11 13.53 1.11 10c0-1.3.23-2.48.72-3.59C3.25 10.3 4.67 14.2 6.1 18.09zm4.03-6.63l2.58 6.98c-.86.29-1.76.45-2.71.45-.79 0-1.57-.11-2.29-.33.81-2.38 1.62-4.74 2.42-7.1z"
  })
});
 const library_wordpress = (wordpress);
;
const visibilityOptions = {
  public: {
    label: (0,external_wp_i18n_namespaceObject.__)('Public'),
    info: (0,external_wp_i18n_namespaceObject.__)('Visible to everyone.')
  },
  private: {
    label: (0,external_wp_i18n_namespaceObject.__)('Private'),
    info: (0,external_wp_i18n_namespaceObject.__)('Only visible to site admins and editors.')
  },
  password: {
    label: (0,external_wp_i18n_namespaceObject.__)('Password protected'),
    info: (0,external_wp_i18n_namespaceObject.__)('Only those with the password can view this post.')
  }
};
;
function PostVisibility({
  onClose
}) {
  const instanceId = (0,external_wp_compose_namespaceObject.useInstanceId)(PostVisibility);
  const {
    status,
    visibility,
    password
  } = (0,external_wp_data_namespaceObject.useSelect)(select => ({
    status: select(store_store).getEditedPostAttribute('status'),
    visibility: select(store_store).getEditedPostVisibility(),
    password: select(store_store).getEditedPostAttribute('password')
  }));
  const {
    editPost,
    savePost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const [hasPassword, setHasPassword] = (0,external_wp_element_namespaceObject.useState)(!!password);
  const [showPrivateConfirmDialog, setShowPrivateConfirmDialog] = (0,external_wp_element_namespaceObject.useState)(false);
  const setPublic = () => {
    editPost({
      status: visibility === 'private' ? 'draft' : status,
      password: ''
    });
    setHasPassword(false);
  };
  const setPrivate = () => {
    setShowPrivateConfirmDialog(true);
  };
  const confirmPrivate = () => {
    editPost({
      status: 'private',
      password: ''
    });
    setHasPassword(false);
    setShowPrivateConfirmDialog(false);
    savePost();
  };
  const handleDialogCancel = () => {
    setShowPrivateConfirmDialog(false);
  };
  const setPasswordProtected = () => {
    editPost({
      status: visibility === 'private' ? 'draft' : status,
      password: password || ''
    });
    setHasPassword(true);
  };
  const updatePassword = event => {
    editPost({
      password: event.target.value
    });
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "editor-post-visibility",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalInspectorPopoverHeader, {
      title: (0,external_wp_i18n_namespaceObject.__)('Visibility'),
      help: (0,external_wp_i18n_namespaceObject.__)('Control how this post is viewed.'),
      onClose: onClose
    }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("fieldset", {
      className: "editor-post-visibility__fieldset",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.VisuallyHidden, {
        as: "legend",
        children: (0,external_wp_i18n_namespaceObject.__)('Visibility')
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostVisibilityChoice, {
        instanceId: instanceId,
        value: "public",
        label: visibilityOptions.public.label,
        info: visibilityOptions.public.info,
        checked: visibility === 'public' && !hasPassword,
        onChange: setPublic
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostVisibilityChoice, {
        instanceId: instanceId,
        value: "private",
        label: visibilityOptions.private.label,
        info: visibilityOptions.private.info,
        checked: visibility === 'private',
        onChange: setPrivate
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostVisibilityChoice, {
        instanceId: instanceId,
        value: "password",
        label: visibilityOptions.password.label,
        info: visibilityOptions.password.info,
        checked: hasPassword,
        onChange: setPasswordProtected
      }), hasPassword && (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "editor-post-visibility__password",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.VisuallyHidden, {
          as: "label",
          htmlFor: `editor-post-visibility__password-input-${instanceId}`,
          children: (0,external_wp_i18n_namespaceObject.__)('Create password')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("input", {
          className: "editor-post-visibility__password-input",
          id: `editor-post-visibility__password-input-${instanceId}`,
          type: "text",
          onChange: updatePassword,
          value: password,
          placeholder: (0,external_wp_i18n_namespaceObject.__)('Use a secure password')
        })]
      })]
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalConfirmDialog, {
      isOpen: showPrivateConfirmDialog,
      onConfirm: confirmPrivate,
      onCancel: handleDialogCancel,
      confirmButtonText: (0,external_wp_i18n_namespaceObject.__)('Publish'),
      size: "medium",
      children: (0,external_wp_i18n_namespaceObject.__)('Would you like to privately publish this post now?')
    })]
  });
}
function PostVisibilityChoice({
  instanceId,
  value,
  label,
  info,
  ...props
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "editor-post-visibility__choice",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("input", {
      type: "radio",
      name: `editor-post-visibility__setting-${instanceId}`,
      value: value,
      id: `editor-post-${value}-${instanceId}`,
      "aria-describedby": `editor-post-${value}-${instanceId}-description`,
      className: "editor-post-visibility__radio",
      ...props
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("label", {
      htmlFor: `editor-post-${value}-${instanceId}`,
      className: "editor-post-visibility__label",
      children: label
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
      id: `editor-post-${value}-${instanceId}-description`,
      className: "editor-post-visibility__info",
      children: info
    })]
  });
}
;
function PostVisibilityLabel() {
  return usePostVisibilityLabel();
}
function usePostVisibilityLabel() {
  const visibility = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).getEditedPostVisibility());
  return visibilityOptions[visibility]?.label;
}
;
function toDate(argument) {
  const argStr = Object.prototype.toString.call(argument);
  if (
    argument instanceof Date ||
    (typeof argument === "object" && argStr === "[object Date]")
  ) {
    return new argument.constructor(+argument);
  } else if (
    typeof argument === "number" ||
    argStr === "[object Number]" ||
    typeof argument === "string" ||
    argStr === "[object String]"
  ) {
    return new Date(argument);
  } else {
    return new Date(NaN);
  }
}
 const date_fns_toDate = (( null && (toDate)));
;
function startOfMonth(date) {
  const _date = toDate(date);
  _date.setDate(1);
  _date.setHours(0, 0, 0, 0);
  return _date;
}
 const date_fns_startOfMonth = (( null && (startOfMonth)));
;
function endOfMonth(date) {
  const _date = toDate(date);
  const month = _date.getMonth();
  _date.setFullYear(_date.getFullYear(), month + 1, 0);
  _date.setHours(23, 59, 59, 999);
  return _date;
}
 const date_fns_endOfMonth = (( null && (endOfMonth)));
;
const daysInWeek = 7;
const daysInYear = 365.2425;
const maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1000;
const minTime = -maxTime;
const millisecondsInWeek = 604800000;
const millisecondsInDay = 86400000;
const millisecondsInMinute = 60000;
const millisecondsInHour = 3600000;
const millisecondsInSecond = 1000;
const minutesInYear = 525600;
const minutesInMonth = 43200;
const minutesInDay = 1440;
const minutesInHour = 60;
const monthsInQuarter = 3;
const monthsInYear = 12;
const quartersInYear = 4;
const secondsInHour = 3600;
const secondsInMinute = 60;
const secondsInDay = secondsInHour * 24;
const secondsInWeek = secondsInDay * 7;
const secondsInYear = secondsInDay * daysInYear;
const secondsInMonth = secondsInYear / 12;
const secondsInQuarter = secondsInMonth * 3;
;
function parseISO(argument, options) {
  const additionalDigits = options?.additionalDigits ?? 2;
  const dateStrings = splitDateString(argument);
  let date;
  if (dateStrings.date) {
    const parseYearResult = parseYear(dateStrings.date, additionalDigits);
    date = parseDate(parseYearResult.restDateString, parseYearResult.year);
  }
  if (!date || isNaN(date.getTime())) {
    return new Date(NaN);
  }
  const timestamp = date.getTime();
  let time = 0;
  let offset;
  if (dateStrings.time) {
    time = parseTime(dateStrings.time);
    if (isNaN(time)) {
      return new Date(NaN);
    }
  }
  if (dateStrings.timezone) {
    offset = parseTimezone(dateStrings.timezone);
    if (isNaN(offset)) {
      return new Date(NaN);
    }
  } else {
    const dirtyDate = new Date(timestamp + time);
    const result = new Date(0);
    result.setFullYear(
      dirtyDate.getUTCFullYear(),
      dirtyDate.getUTCMonth(),
      dirtyDate.getUTCDate(),
    );
    result.setHours(
      dirtyDate.getUTCHours(),
      dirtyDate.getUTCMinutes(),
      dirtyDate.getUTCSeconds(),
      dirtyDate.getUTCMilliseconds(),
    );
    return result;
  }
  return new Date(timestamp + time + offset);
}
const patterns = {
  dateTimeDelimiter: /[T ]/,
  timeZoneDelimiter: /[Z ]/i,
  timezone: /([Z+-].*)$/,
};
const dateRegex =
  /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/;
const timeRegex =
  /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/;
const timezoneRegex = /^([+-])(\d{2})(?::?(\d{2}))?$/;
function splitDateString(dateString) {
  const dateStrings = {};
  const array = dateString.split(patterns.dateTimeDelimiter);
  let timeString;
  if (array.length > 2) {
    return dateStrings;
  }
  if (/:/.test(array[0])) {
    timeString = array[0];
  } else {
    dateStrings.date = array[0];
    timeString = array[1];
    if (patterns.timeZoneDelimiter.test(dateStrings.date)) {
      dateStrings.date = dateString.split(patterns.timeZoneDelimiter)[0];
      timeString = dateString.substr(
        dateStrings.date.length,
        dateString.length,
      );
    }
  }
  if (timeString) {
    const token = patterns.timezone.exec(timeString);
    if (token) {
      dateStrings.time = timeString.replace(token[1], "");
      dateStrings.timezone = token[1];
    } else {
      dateStrings.time = timeString;
    }
  }
  return dateStrings;
}
function parseYear(dateString, additionalDigits) {
  const regex = new RegExp(
    "^(?:(\\d{4}|[+-]\\d{" +
      (4 + additionalDigits) +
      "})|(\\d{2}|[+-]\\d{" +
      (2 + additionalDigits) +
      "})$)",
  );
  const captures = dateString.match(regex);
  if (!captures) return { year: NaN, restDateString: "" };
  const year = captures[1] ? parseInt(captures[1]) : null;
  const century = captures[2] ? parseInt(captures[2]) : null;
  return {
    year: century === null ? year : century * 100,
    restDateString: dateString.slice((captures[1] || captures[2]).length),
  };
}
function parseDate(dateString, year) {
  if (year === null) return new Date(NaN);
  const captures = dateString.match(dateRegex);
  if (!captures) return new Date(NaN);
  const isWeekDate = !!captures[4];
  const dayOfYear = parseDateUnit(captures[1]);
  const month = parseDateUnit(captures[2]) - 1;
  const day = parseDateUnit(captures[3]);
  const week = parseDateUnit(captures[4]);
  const dayOfWeek = parseDateUnit(captures[5]) - 1;
  if (isWeekDate) {
    if (!validateWeekDate(year, week, dayOfWeek)) {
      return new Date(NaN);
    }
    return dayOfISOWeekYear(year, week, dayOfWeek);
  } else {
    const date = new Date(0);
    if (
      !validateDate(year, month, day) ||
      !validateDayOfYearDate(year, dayOfYear)
    ) {
      return new Date(NaN);
    }
    date.setUTCFullYear(year, month, Math.max(dayOfYear, day));
    return date;
  }
}
function parseDateUnit(value) {
  return value ? parseInt(value) : 1;
}
function parseTime(timeString) {
  const captures = timeString.match(timeRegex);
  if (!captures) return NaN; 
  const hours = parseTimeUnit(captures[1]);
  const minutes = parseTimeUnit(captures[2]);
  const seconds = parseTimeUnit(captures[3]);
  if (!validateTime(hours, minutes, seconds)) {
    return NaN;
  }
  return (
    hours * millisecondsInHour + minutes * millisecondsInMinute + seconds * 1000
  );
}
function parseTimeUnit(value) {
  return (value && parseFloat(value.replace(",", "."))) || 0;
}
function parseTimezone(timezoneString) {
  if (timezoneString === "Z") return 0;
  const captures = timezoneString.match(timezoneRegex);
  if (!captures) return 0;
  const sign = captures[1] === "+" ? -1 : 1;
  const hours = parseInt(captures[2]);
  const minutes = (captures[3] && parseInt(captures[3])) || 0;
  if (!validateTimezone(hours, minutes)) {
    return NaN;
  }
  return sign * (hours * millisecondsInHour + minutes * millisecondsInMinute);
}
function dayOfISOWeekYear(isoWeekYear, week, day) {
  const date = new Date(0);
  date.setUTCFullYear(isoWeekYear, 0, 4);
  const fourthOfJanuaryDay = date.getUTCDay() || 7;
  const diff = (week - 1) * 7 + day + 1 - fourthOfJanuaryDay;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}
const daysInMonths = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function isLeapYearIndex(year) {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}
function validateDate(year, month, date) {
  return (
    month >= 0 &&
    month <= 11 &&
    date >= 1 &&
    date <= (daysInMonths[month] || (isLeapYearIndex(year) ? 29 : 28))
  );
}
function validateDayOfYearDate(year, dayOfYear) {
  return dayOfYear >= 1 && dayOfYear <= (isLeapYearIndex(year) ? 366 : 365);
}
function validateWeekDate(_year, week, day) {
  return week >= 1 && week <= 53 && day >= 0 && day <= 6;
}
function validateTime(hours, minutes, seconds) {
  if (hours === 24) {
    return minutes === 0 && seconds === 0;
  }
  return (
    seconds >= 0 &&
    seconds < 60 &&
    minutes >= 0 &&
    minutes < 60 &&
    hours >= 0 &&
    hours < 25
  );
}
function validateTimezone(_hours, minutes) {
  return minutes >= 0 && minutes <= 59;
}
 const date_fns_parseISO = (( null && (parseISO)));
;
const {
  PrivatePublishDateTimePicker
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
function PostSchedule(props) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PrivatePostSchedule, {
    ...props,
    showPopoverHeaderActions: true,
    isCompact: false
  });
}
function PrivatePostSchedule({
  onClose,
  showPopoverHeaderActions,
  isCompact
}) {
  const {
    postDate,
    postType
  } = (0,external_wp_data_namespaceObject.useSelect)(select => ({
    postDate: select(store_store).getEditedPostAttribute('date'),
    postType: select(store_store).getCurrentPostType()
  }), []);
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const onUpdateDate = date => editPost({
    date
  });
  const [previewedMonth, setPreviewedMonth] = (0,external_wp_element_namespaceObject.useState)(startOfMonth(new Date(postDate)));
  const eventsByPostType = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_coreData_namespaceObject.store).getEntityRecords('postType', postType, {
    status: 'publish,future',
    after: startOfMonth(previewedMonth).toISOString(),
    before: endOfMonth(previewedMonth).toISOString(),
    exclude: [select(store_store).getCurrentPostId()],
    per_page: 100,
    _fields: 'id,date'
  }), [previewedMonth, postType]);
  const events = (0,external_wp_element_namespaceObject.useMemo)(() => (eventsByPostType || []).map(({
    date: eventDate
  }) => ({
    date: new Date(eventDate)
  })), [eventsByPostType]);
  const settings = (0,external_wp_date_namespaceObject.getSettings)();
  const is12HourTime = /a(?!\\)/i.test(settings.formats.time.toLowerCase() 
  .replace(/\\\\/g, '') 
  .split('').reverse().join('') 
  );
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PrivatePublishDateTimePicker, {
    currentDate: postDate,
    onChange: onUpdateDate,
    is12Hour: is12HourTime,
    dateOrder: 
    (0,external_wp_i18n_namespaceObject._x)('dmy', 'date order'),
    events: events,
    onMonthPreviewed: date => setPreviewedMonth(parseISO(date)),
    onClose: onClose,
    isCompact: isCompact,
    showPopoverHeaderActions: showPopoverHeaderActions
  });
}
;
function PostScheduleLabel(props) {
  return usePostScheduleLabel(props);
}
function usePostScheduleLabel({
  full = false
} = {}) {
  const {
    date,
    isFloating
  } = (0,external_wp_data_namespaceObject.useSelect)(select => ({
    date: select(store_store).getEditedPostAttribute('date'),
    isFloating: select(store_store).isEditedPostDateFloating()
  }), []);
  return full ? getFullPostScheduleLabel(date) : getPostScheduleLabel(date, {
    isFloating
  });
}
function getFullPostScheduleLabel(dateAttribute) {
  const date = (0,external_wp_date_namespaceObject.getDate)(dateAttribute);
  const timezoneAbbreviation = getTimezoneAbbreviation();
  const formattedDate = (0,external_wp_date_namespaceObject.dateI18n)(
  (0,external_wp_i18n_namespaceObject._x)('F j, Y g:i\xa0a', 'post schedule full date format'), date);
  return (0,external_wp_i18n_namespaceObject.isRTL)() ? `${timezoneAbbreviation} ${formattedDate}` : `${formattedDate} ${timezoneAbbreviation}`;
}
function getPostScheduleLabel(dateAttribute, {
  isFloating = false,
  now = new Date()
} = {}) {
  if (!dateAttribute || isFloating) {
    return (0,external_wp_i18n_namespaceObject.__)('Immediately');
  }
  if (!isTimezoneSameAsSiteTimezone(now)) {
    return getFullPostScheduleLabel(dateAttribute);
  }
  const date = (0,external_wp_date_namespaceObject.getDate)(dateAttribute);
  if (isSameDay(date, now)) {
    return (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('Today at %s'),
    (0,external_wp_date_namespaceObject.dateI18n)((0,external_wp_i18n_namespaceObject._x)('g:i\xa0a', 'post schedule time format'), date));
  }
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameDay(date, tomorrow)) {
    return (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('Tomorrow at %s'),
    (0,external_wp_date_namespaceObject.dateI18n)((0,external_wp_i18n_namespaceObject._x)('g:i\xa0a', 'post schedule time format'), date));
  }
  if (date.getFullYear() === now.getFullYear()) {
    return (0,external_wp_date_namespaceObject.dateI18n)(
    (0,external_wp_i18n_namespaceObject._x)('F j g:i\xa0a', 'post schedule date format without year'), date);
  }
  return (0,external_wp_date_namespaceObject.dateI18n)(
  (0,external_wp_i18n_namespaceObject._x)('F j, Y g:i\xa0a', 'post schedule full date format'), date);
}
function getTimezoneAbbreviation() {
  const {
    timezone
  } = (0,external_wp_date_namespaceObject.getSettings)();
  if (timezone.abbr && isNaN(Number(timezone.abbr))) {
    return timezone.abbr;
  }
  const symbol = timezone.offset < 0 ? '' : '+';
  return `UTC${symbol}${timezone.offsetFormatted}`;
}
function isTimezoneSameAsSiteTimezone(date) {
  const {
    timezone
  } = (0,external_wp_date_namespaceObject.getSettings)();
  const siteOffset = Number(timezone.offset);
  const dateOffset = -1 * (date.getTimezoneOffset() / 60);
  return siteOffset === dateOffset;
}
function isSameDay(left, right) {
  return left.getDate() === right.getDate() && left.getMonth() === right.getMonth() && left.getFullYear() === right.getFullYear();
}
;
const MIN_MOST_USED_TERMS = 3;
const DEFAULT_QUERY = {
  per_page: 10,
  orderby: 'count',
  order: 'desc',
  hide_empty: true,
  _fields: 'id,name,count',
  context: 'view'
};
function MostUsedTerms({
  onSelect,
  taxonomy
}) {
  const {
    _terms,
    showTerms
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const mostUsedTerms = select(external_wp_coreData_namespaceObject.store).getEntityRecords('taxonomy', taxonomy.slug, DEFAULT_QUERY);
    return {
      _terms: mostUsedTerms,
      showTerms: mostUsedTerms?.length >= MIN_MOST_USED_TERMS
    };
  }, [taxonomy.slug]);
  if (!showTerms) {
    return null;
  }
  const terms = unescapeTerms(_terms);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "editor-post-taxonomies__flat-term-most-used",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.BaseControl.VisualLabel, {
      as: "h3",
      className: "editor-post-taxonomies__flat-term-most-used-label",
      children: taxonomy.labels.most_used
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("ul", {
      role: "list",
      className: "editor-post-taxonomies__flat-term-most-used-list",
      children: terms.map(term => (0,external_ReactJSXRuntime_namespaceObject.jsx)("li", {
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "link",
          onClick: () => onSelect(term),
          children: term.name
        })
      }, term.id))
    })]
  });
}
;
const flat_term_selector_EMPTY_ARRAY = [];
const MAX_TERMS_SUGGESTIONS = 100;
const flat_term_selector_DEFAULT_QUERY = {
  per_page: MAX_TERMS_SUGGESTIONS,
  _fields: 'id,name',
  context: 'view'
};
const isSameTermName = (termA, termB) => unescapeString(termA).toLowerCase() === unescapeString(termB).toLowerCase();
const termNamesToIds = (names, terms) => {
  return names.map(termName => terms.find(term => isSameTermName(term.name, termName))?.id).filter(id => id !== undefined);
};
const Wrapper = ({
  children,
  __nextHasNoMarginBottom
}) => __nextHasNoMarginBottom ? (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalVStack, {
  spacing: 4,
  children: children
}) : (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_element_namespaceObject.Fragment, {
  children: children
});
function FlatTermSelector({
  slug,
  __nextHasNoMarginBottom
}) {
  var _taxonomy$labels$add_, _taxonomy$labels$sing2;
  const [values, setValues] = (0,external_wp_element_namespaceObject.useState)([]);
  const [search, setSearch] = (0,external_wp_element_namespaceObject.useState)('');
  const debouncedSearch = (0,external_wp_compose_namespaceObject.useDebounce)(setSearch, 500);
  if (!__nextHasNoMarginBottom) {
    external_wp_deprecated_default()('Bottom margin styles for wp.editor.PostTaxonomiesFlatTermSelector', {
      since: '6.7',
      version: '7.0',
      hint: 'Set the `__nextHasNoMarginBottom` prop to true to start opting into the new styles, which will become the default in a future version.'
    });
  }
  const {
    terms,
    termIds,
    taxonomy,
    hasAssignAction,
    hasCreateAction,
    hasResolvedTerms
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _post$_links, _post$_links2;
    const {
      getCurrentPost,
      getEditedPostAttribute
    } = select(store_store);
    const {
      getEntityRecords,
      getEntityRecord,
      hasFinishedResolution
    } = select(external_wp_coreData_namespaceObject.store);
    const post = getCurrentPost();
    const _taxonomy = getEntityRecord('root', 'taxonomy', slug);
    const _termIds = _taxonomy ? getEditedPostAttribute(_taxonomy.rest_base) : flat_term_selector_EMPTY_ARRAY;
    const query = {
      ...flat_term_selector_DEFAULT_QUERY,
      include: _termIds?.join(','),
      per_page: -1
    };
    return {
      hasCreateAction: _taxonomy ? (_post$_links = post._links?.['wp:action-create-' + _taxonomy.rest_base]) !== null && _post$_links !== void 0 ? _post$_links : false : false,
      hasAssignAction: _taxonomy ? (_post$_links2 = post._links?.['wp:action-assign-' + _taxonomy.rest_base]) !== null && _post$_links2 !== void 0 ? _post$_links2 : false : false,
      taxonomy: _taxonomy,
      termIds: _termIds,
      terms: _termIds?.length ? getEntityRecords('taxonomy', slug, query) : flat_term_selector_EMPTY_ARRAY,
      hasResolvedTerms: hasFinishedResolution('getEntityRecords', ['taxonomy', slug, query])
    };
  }, [slug]);
  const {
    searchResults
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecords
    } = select(external_wp_coreData_namespaceObject.store);
    return {
      searchResults: !!search ? getEntityRecords('taxonomy', slug, {
        ...flat_term_selector_DEFAULT_QUERY,
        search
      }) : flat_term_selector_EMPTY_ARRAY
    };
  }, [search, slug]);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (hasResolvedTerms) {
      const newValues = (terms !== null && terms !== void 0 ? terms : []).map(term => unescapeString(term.name));
      setValues(newValues);
    }
  }, [terms, hasResolvedTerms]);
  const suggestions = (0,external_wp_element_namespaceObject.useMemo)(() => {
    return (searchResults !== null && searchResults !== void 0 ? searchResults : []).map(term => unescapeString(term.name));
  }, [searchResults]);
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    saveEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const {
    createErrorNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  if (!hasAssignAction) {
    return null;
  }
  async function findOrCreateTerm(term) {
    try {
      const newTerm = await saveEntityRecord('taxonomy', slug, term, {
        throwOnError: true
      });
      return unescapeTerm(newTerm);
    } catch (error) {
      if (error.code !== 'term_exists') {
        throw error;
      }
      return {
        id: error.data.term_id,
        name: term.name
      };
    }
  }
  function onUpdateTerms(newTermIds) {
    editPost({
      [taxonomy.rest_base]: newTermIds
    });
  }
  function onChange(termNames) {
    const availableTerms = [...(terms !== null && terms !== void 0 ? terms : []), ...(searchResults !== null && searchResults !== void 0 ? searchResults : [])];
    const uniqueTerms = termNames.reduce((acc, name) => {
      if (!acc.some(n => n.toLowerCase() === name.toLowerCase())) {
        acc.push(name);
      }
      return acc;
    }, []);
    const newTermNames = uniqueTerms.filter(termName => !availableTerms.find(term => isSameTermName(term.name, termName)));
    setValues(uniqueTerms);
    if (newTermNames.length === 0) {
      onUpdateTerms(termNamesToIds(uniqueTerms, availableTerms));
      return;
    }
    if (!hasCreateAction) {
      return;
    }
    Promise.all(newTermNames.map(termName => findOrCreateTerm({
      name: termName
    }))).then(newTerms => {
      const newAvailableTerms = availableTerms.concat(newTerms);
      onUpdateTerms(termNamesToIds(uniqueTerms, newAvailableTerms));
    }).catch(error => {
      createErrorNotice(error.message, {
        type: 'snackbar'
      });
      onUpdateTerms(termNamesToIds(uniqueTerms, availableTerms));
    });
  }
  function appendTerm(newTerm) {
    var _taxonomy$labels$sing;
    if (termIds.includes(newTerm.id)) {
      return;
    }
    const newTermIds = [...termIds, newTerm.id];
    const defaultName = slug === 'post_tag' ? (0,external_wp_i18n_namespaceObject.__)('Tag') : (0,external_wp_i18n_namespaceObject.__)('Term');
    const termAddedMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject._x)('%s added', 'term'), (_taxonomy$labels$sing = taxonomy?.labels?.singular_name) !== null && _taxonomy$labels$sing !== void 0 ? _taxonomy$labels$sing : defaultName);
    (0,external_wp_a11y_namespaceObject.speak)(termAddedMessage, 'assertive');
    onUpdateTerms(newTermIds);
  }
  const newTermLabel = (_taxonomy$labels$add_ = taxonomy?.labels?.add_new_item) !== null && _taxonomy$labels$add_ !== void 0 ? _taxonomy$labels$add_ : slug === 'post_tag' ? (0,external_wp_i18n_namespaceObject.__)('Add new tag') : (0,external_wp_i18n_namespaceObject.__)('Add new Term');
  const singularName = (_taxonomy$labels$sing2 = taxonomy?.labels?.singular_name) !== null && _taxonomy$labels$sing2 !== void 0 ? _taxonomy$labels$sing2 : slug === 'post_tag' ? (0,external_wp_i18n_namespaceObject.__)('Tag') : (0,external_wp_i18n_namespaceObject.__)('Term');
  const termAddedLabel = (0,external_wp_i18n_namespaceObject.sprintf)(
  (0,external_wp_i18n_namespaceObject._x)('%s added', 'term'), singularName);
  const termRemovedLabel = (0,external_wp_i18n_namespaceObject.sprintf)(
  (0,external_wp_i18n_namespaceObject._x)('%s removed', 'term'), singularName);
  const removeTermLabel = (0,external_wp_i18n_namespaceObject.sprintf)(
  (0,external_wp_i18n_namespaceObject._x)('Remove %s', 'term'), singularName);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(Wrapper, {
    __nextHasNoMarginBottom: __nextHasNoMarginBottom,
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.FormTokenField, {
      __next40pxDefaultSize: true,
      value: values,
      suggestions: suggestions,
      onChange: onChange,
      onInputChange: debouncedSearch,
      maxSuggestions: MAX_TERMS_SUGGESTIONS,
      label: newTermLabel,
      messages: {
        added: termAddedLabel,
        removed: termRemovedLabel,
        remove: removeTermLabel
      },
      __nextHasNoMarginBottom: __nextHasNoMarginBottom
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(MostUsedTerms, {
      taxonomy: taxonomy,
      onSelect: appendTerm
    })]
  });
}
 const flat_term_selector = ((0,external_wp_components_namespaceObject.withFilters)('editor.PostTaxonomyType')(FlatTermSelector));
;
const TagsPanel = () => {
  const panelBodyTitle = [(0,external_wp_i18n_namespaceObject.__)('Suggestion:'), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
    className: "editor-post-publish-panel__link",
    children: (0,external_wp_i18n_namespaceObject.__)('Add tags')
  }, "label")];
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
    initialOpen: false,
    title: panelBodyTitle,
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
      children: (0,external_wp_i18n_namespaceObject.__)('Tags help users and search engines navigate your site and find your content. Add a few keywords to describe your post.')
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(flat_term_selector, {
      slug: "post_tag",
      __nextHasNoMarginBottom: true
    })]
  });
};
const MaybeTagsPanel = () => {
  const {
    hasTags,
    isPostTypeSupported
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const postType = select(store_store).getCurrentPostType();
    const tagsTaxonomy = select(external_wp_coreData_namespaceObject.store).getEntityRecord('root', 'taxonomy', 'post_tag');
    const _isPostTypeSupported = tagsTaxonomy?.types?.includes(postType);
    const areTagsFetched = tagsTaxonomy !== undefined;
    const tags = tagsTaxonomy && select(store_store).getEditedPostAttribute(tagsTaxonomy.rest_base);
    return {
      hasTags: !!tags?.length,
      isPostTypeSupported: areTagsFetched && _isPostTypeSupported
    };
  }, []);
  const [hadTagsWhenOpeningThePanel] = (0,external_wp_element_namespaceObject.useState)(hasTags);
  if (!isPostTypeSupported) {
    return null;
  }
  if (!hadTagsWhenOpeningThePanel) {
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(TagsPanel, {});
  }
  return null;
};
 const maybe_tags_panel = (MaybeTagsPanel);
;
const getSuggestion = (supportedFormats, suggestedPostFormat) => {
  const formats = POST_FORMATS.filter(format => supportedFormats?.includes(format.id));
  return formats.find(format => format.id === suggestedPostFormat);
};
const PostFormatSuggestion = ({
  suggestedPostFormat,
  suggestionText,
  onUpdatePostFormat
}) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
  __next40pxDefaultSize: true,
  variant: "link",
  onClick: () => onUpdatePostFormat(suggestedPostFormat),
  children: suggestionText
});
function PostFormatPanel() {
  const {
    currentPostFormat,
    suggestion
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$getThemeSuppo;
    const {
      getEditedPostAttribute,
      getSuggestedPostFormat
    } = select(store_store);
    const supportedFormats = (_select$getThemeSuppo = select(external_wp_coreData_namespaceObject.store).getThemeSupports().formats) !== null && _select$getThemeSuppo !== void 0 ? _select$getThemeSuppo : [];
    return {
      currentPostFormat: getEditedPostAttribute('format'),
      suggestion: getSuggestion(supportedFormats, getSuggestedPostFormat())
    };
  }, []);
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const onUpdatePostFormat = format => editPost({
    format
  });
  const panelBodyTitle = [(0,external_wp_i18n_namespaceObject.__)('Suggestion:'), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
    className: "editor-post-publish-panel__link",
    children: (0,external_wp_i18n_namespaceObject.__)('Use a post format')
  }, "label")];
  if (!suggestion || suggestion.id === currentPostFormat) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
    initialOpen: false,
    title: panelBodyTitle,
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
      children: (0,external_wp_i18n_namespaceObject.__)('Your theme uses post formats to highlight different kinds of content, like images or videos. Apply a post format to see this special styling.')
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostFormatSuggestion, {
        onUpdatePostFormat: onUpdatePostFormat,
        suggestedPostFormat: suggestion.id,
        suggestionText: (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject.__)('Apply the "%1$s" format.'), suggestion.caption)
      })
    })]
  });
}
;
const hierarchical_term_selector_DEFAULT_QUERY = {
  per_page: -1,
  orderby: 'name',
  order: 'asc',
  _fields: 'id,name,parent',
  context: 'view'
};
const MIN_TERMS_COUNT_FOR_FILTER = 8;
const hierarchical_term_selector_EMPTY_ARRAY = [];
function sortBySelected(termsTree, terms) {
  const treeHasSelection = termTree => {
    if (terms.indexOf(termTree.id) !== -1) {
      return true;
    }
    if (undefined === termTree.children) {
      return false;
    }
    return termTree.children.map(treeHasSelection).filter(child => child).length > 0;
  };
  const termOrChildIsSelected = (termA, termB) => {
    const termASelected = treeHasSelection(termA);
    const termBSelected = treeHasSelection(termB);
    if (termASelected === termBSelected) {
      return 0;
    }
    if (termASelected && !termBSelected) {
      return -1;
    }
    if (!termASelected && termBSelected) {
      return 1;
    }
    return 0;
  };
  const newTermTree = [...termsTree];
  newTermTree.sort(termOrChildIsSelected);
  return newTermTree;
}
function findTerm(terms, parent, name) {
  return terms.find(term => {
    return (!term.parent && !parent || parseInt(term.parent) === parseInt(parent)) && term.name.toLowerCase() === name.toLowerCase();
  });
}
function getFilterMatcher(filterValue) {
  const matchTermsForFilter = originalTerm => {
    if ('' === filterValue) {
      return originalTerm;
    }
    const term = {
      ...originalTerm
    };
    if (term.children.length > 0) {
      term.children = term.children.map(matchTermsForFilter).filter(child => child);
    }
    if (-1 !== term.name.toLowerCase().indexOf(filterValue.toLowerCase()) || term.children.length > 0) {
      return term;
    }
    return false;
  };
  return matchTermsForFilter;
}
function HierarchicalTermSelector({
  slug
}) {
  var _taxonomy$labels$sear, _taxonomy$name;
  const [adding, setAdding] = (0,external_wp_element_namespaceObject.useState)(false);
  const [formName, setFormName] = (0,external_wp_element_namespaceObject.useState)('');
  const [formParent, setFormParent] = (0,external_wp_element_namespaceObject.useState)('');
  const [showForm, setShowForm] = (0,external_wp_element_namespaceObject.useState)(false);
  const [filterValue, setFilterValue] = (0,external_wp_element_namespaceObject.useState)('');
  const [filteredTermsTree, setFilteredTermsTree] = (0,external_wp_element_namespaceObject.useState)([]);
  const debouncedSpeak = (0,external_wp_compose_namespaceObject.useDebounce)(external_wp_a11y_namespaceObject.speak, 500);
  const {
    hasCreateAction,
    hasAssignAction,
    terms,
    loading,
    availableTerms,
    taxonomy
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _post$_links, _post$_links2;
    const {
      getCurrentPost,
      getEditedPostAttribute
    } = select(store_store);
    const {
      getEntityRecord,
      getEntityRecords,
      isResolving
    } = select(external_wp_coreData_namespaceObject.store);
    const _taxonomy = getEntityRecord('root', 'taxonomy', slug);
    const post = getCurrentPost();
    return {
      hasCreateAction: _taxonomy ? (_post$_links = post._links?.['wp:action-create-' + _taxonomy.rest_base]) !== null && _post$_links !== void 0 ? _post$_links : false : false,
      hasAssignAction: _taxonomy ? (_post$_links2 = post._links?.['wp:action-assign-' + _taxonomy.rest_base]) !== null && _post$_links2 !== void 0 ? _post$_links2 : false : false,
      terms: _taxonomy ? getEditedPostAttribute(_taxonomy.rest_base) : hierarchical_term_selector_EMPTY_ARRAY,
      loading: isResolving('getEntityRecords', ['taxonomy', slug, hierarchical_term_selector_DEFAULT_QUERY]),
      availableTerms: getEntityRecords('taxonomy', slug, hierarchical_term_selector_DEFAULT_QUERY) || hierarchical_term_selector_EMPTY_ARRAY,
      taxonomy: _taxonomy
    };
  }, [slug]);
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    saveEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const availableTermsTree = (0,external_wp_element_namespaceObject.useMemo)(() => sortBySelected(terms_buildTermsTree(availableTerms), terms),
  [availableTerms]);
  const {
    createErrorNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  if (!hasAssignAction) {
    return null;
  }
  const addTerm = term => {
    return saveEntityRecord('taxonomy', slug, term, {
      throwOnError: true
    });
  };
  const onUpdateTerms = termIds => {
    editPost({
      [taxonomy.rest_base]: termIds
    });
  };
  const onChange = termId => {
    const hasTerm = terms.includes(termId);
    const newTerms = hasTerm ? terms.filter(id => id !== termId) : [...terms, termId];
    onUpdateTerms(newTerms);
  };
  const onChangeFormName = value => {
    setFormName(value);
  };
  const onChangeFormParent = parentId => {
    setFormParent(parentId);
  };
  const onToggleForm = () => {
    setShowForm(!showForm);
  };
  const onAddTerm = async event => {
    var _taxonomy$labels$sing;
    event.preventDefault();
    if (formName === '' || adding) {
      return;
    }
    const existingTerm = findTerm(availableTerms, formParent, formName);
    if (existingTerm) {
      if (!terms.some(term => term === existingTerm.id)) {
        onUpdateTerms([...terms, existingTerm.id]);
      }
      setFormName('');
      setFormParent('');
      return;
    }
    setAdding(true);
    let newTerm;
    try {
      newTerm = await addTerm({
        name: formName,
        parent: formParent ? formParent : undefined
      });
    } catch (error) {
      createErrorNotice(error.message, {
        type: 'snackbar'
      });
      return;
    }
    const defaultName = slug === 'category' ? (0,external_wp_i18n_namespaceObject.__)('Category') : (0,external_wp_i18n_namespaceObject.__)('Term');
    const termAddedMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject._x)('%s added', 'term'), (_taxonomy$labels$sing = taxonomy?.labels?.singular_name) !== null && _taxonomy$labels$sing !== void 0 ? _taxonomy$labels$sing : defaultName);
    (0,external_wp_a11y_namespaceObject.speak)(termAddedMessage, 'assertive');
    setAdding(false);
    setFormName('');
    setFormParent('');
    onUpdateTerms([...terms, newTerm.id]);
  };
  const setFilter = value => {
    const newFilteredTermsTree = availableTermsTree.map(getFilterMatcher(value)).filter(term => term);
    const getResultCount = termsTree => {
      let count = 0;
      for (let i = 0; i < termsTree.length; i++) {
        count++;
        if (undefined !== termsTree[i].children) {
          count += getResultCount(termsTree[i].children);
        }
      }
      return count;
    };
    setFilterValue(value);
    setFilteredTermsTree(newFilteredTermsTree);
    const resultCount = getResultCount(newFilteredTermsTree);
    const resultsFoundMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject._n)('%d result found.', '%d results found.', resultCount), resultCount);
    debouncedSpeak(resultsFoundMessage, 'assertive');
  };
  const renderTerms = renderedTerms => {
    return renderedTerms.map(term => {
      return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "editor-post-taxonomies__hierarchical-terms-choice",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.CheckboxControl, {
          __nextHasNoMarginBottom: true,
          checked: terms.indexOf(term.id) !== -1,
          onChange: () => {
            const termId = parseInt(term.id, 10);
            onChange(termId);
          },
          label: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(term.name)
        }), !!term.children.length && (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "editor-post-taxonomies__hierarchical-terms-subchoices",
          children: renderTerms(term.children)
        })]
      }, term.id);
    });
  };
  const labelWithFallback = (labelProperty, fallbackIsCategory, fallbackIsNotCategory) => {
    var _taxonomy$labels$labe;
    return (_taxonomy$labels$labe = taxonomy?.labels?.[labelProperty]) !== null && _taxonomy$labels$labe !== void 0 ? _taxonomy$labels$labe : slug === 'category' ? fallbackIsCategory : fallbackIsNotCategory;
  };
  const newTermButtonLabel = labelWithFallback('add_new_item', (0,external_wp_i18n_namespaceObject.__)('Add new category'), (0,external_wp_i18n_namespaceObject.__)('Add new term'));
  const newTermLabel = labelWithFallback('new_item_name', (0,external_wp_i18n_namespaceObject.__)('Add new category'), (0,external_wp_i18n_namespaceObject.__)('Add new term'));
  const parentSelectLabel = labelWithFallback('parent_item', (0,external_wp_i18n_namespaceObject.__)('Parent Category'), (0,external_wp_i18n_namespaceObject.__)('Parent Term'));
  const noParentOption = `— ${parentSelectLabel} —`;
  const newTermSubmitLabel = newTermButtonLabel;
  const filterLabel = (_taxonomy$labels$sear = taxonomy?.labels?.search_items) !== null && _taxonomy$labels$sear !== void 0 ? _taxonomy$labels$sear : (0,external_wp_i18n_namespaceObject.__)('Search Terms');
  const groupLabel = (_taxonomy$name = taxonomy?.name) !== null && _taxonomy$name !== void 0 ? _taxonomy$name : (0,external_wp_i18n_namespaceObject.__)('Terms');
  const showFilter = availableTerms.length >= MIN_TERMS_COUNT_FOR_FILTER;
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.Flex, {
    direction: "column",
    gap: "4",
    children: [showFilter && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SearchControl, {
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true,
      label: filterLabel,
      placeholder: filterLabel,
      value: filterValue,
      onChange: setFilter
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "editor-post-taxonomies__hierarchical-terms-list",
      tabIndex: "0",
      role: "group",
      "aria-label": groupLabel,
      children: renderTerms('' !== filterValue ? filteredTermsTree : availableTermsTree)
    }), !loading && hasCreateAction && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.FlexItem, {
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        __next40pxDefaultSize: true,
        onClick: onToggleForm,
        className: "editor-post-taxonomies__hierarchical-terms-add",
        "aria-expanded": showForm,
        variant: "link",
        children: newTermButtonLabel
      })
    }), showForm && (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
      onSubmit: onAddTerm,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.Flex, {
        direction: "column",
        gap: "4",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true,
          className: "editor-post-taxonomies__hierarchical-terms-input",
          label: newTermLabel,
          value: formName,
          onChange: onChangeFormName,
          required: true
        }), !!availableTerms.length && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TreeSelect, {
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true,
          label: parentSelectLabel,
          noOptionLabel: noParentOption,
          onChange: onChangeFormParent,
          selectedId: formParent,
          tree: availableTermsTree
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.FlexItem, {
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            __next40pxDefaultSize: true,
            variant: "secondary",
            type: "submit",
            className: "editor-post-taxonomies__hierarchical-terms-submit",
            children: newTermSubmitLabel
          })
        })]
      })
    })]
  });
}
 const hierarchical_term_selector = ((0,external_wp_components_namespaceObject.withFilters)('editor.PostTaxonomyType')(HierarchicalTermSelector));
;
function MaybeCategoryPanel() {
  const hasNoCategory = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const postType = select(store_store).getCurrentPostType();
    const {
      canUser,
      getEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    const categoriesTaxonomy = getEntityRecord('root', 'taxonomy', 'category');
    const defaultCategoryId = canUser('read', {
      kind: 'root',
      name: 'site'
    }) ? getEntityRecord('root', 'site')?.default_category : undefined;
    const defaultCategory = defaultCategoryId ? getEntityRecord('taxonomy', 'category', defaultCategoryId) : undefined;
    const postTypeSupportsCategories = categoriesTaxonomy && categoriesTaxonomy.types.some(type => type === postType);
    const categories = categoriesTaxonomy && select(store_store).getEditedPostAttribute(categoriesTaxonomy.rest_base);
    return !!categoriesTaxonomy && !!defaultCategory && postTypeSupportsCategories && (categories?.length === 0 || categories?.length === 1 && defaultCategory?.id === categories[0]);
  }, []);
  const [shouldShowPanel, setShouldShowPanel] = (0,external_wp_element_namespaceObject.useState)(false);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (hasNoCategory) {
      setShouldShowPanel(true);
    }
  }, [hasNoCategory]);
  if (!shouldShowPanel) {
    return null;
  }
  const panelBodyTitle = [(0,external_wp_i18n_namespaceObject.__)('Suggestion:'), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
    className: "editor-post-publish-panel__link",
    children: (0,external_wp_i18n_namespaceObject.__)('Assign a category')
  }, "label")];
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
    initialOpen: false,
    title: panelBodyTitle,
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
      children: (0,external_wp_i18n_namespaceObject.__)('Categories provide a helpful way to group related posts together and to quickly tell readers what a post is about.')
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(hierarchical_term_selector, {
      slug: "category"
    })]
  });
}
 const maybe_category_panel = (MaybeCategoryPanel);
;
function generateUniqueBasenames(urls) {
  const basenames = new Set();
  return Object.fromEntries(urls.map(url => {
    const filename = (0,external_wp_url_namespaceObject.getFilename)(url);
    let basename = '';
    if (filename) {
      const parts = filename.split('.');
      if (parts.length > 1) {
        parts.pop();
      }
      basename = parts.join('.');
    }
    if (!basename) {
      basename = esm_browser_v4();
    }
    if (basenames.has(basename)) {
      basename = `${basename}-${esm_browser_v4()}`;
    }
    basenames.add(basename);
    return [url, basename];
  }));
}
function fetchMedia(urls) {
  return Object.fromEntries(Object.entries(generateUniqueBasenames(urls)).map(([url, basename]) => {
    const filePromise = window.fetch(url.includes('?') ? url : url + '?').then(response => response.blob()).then(blob => {
      return new File([blob], `${basename}.png`, {
        type: blob.type
      });
    });
    return [url, filePromise];
  }));
}
;
function flattenBlocks(blocks) {
  const result = [];
  blocks.forEach(block => {
    result.push(block);
    result.push(...flattenBlocks(block.innerBlocks));
  });
  return result;
}
function hasExternalMedia(block) {
  if (block.name === 'core/image' || block.name === 'core/cover') {
    return block.attributes.url && !block.attributes.id;
  }
  if (block.name === 'core/media-text') {
    return block.attributes.mediaUrl && !block.attributes.mediaId;
  }
  return undefined;
}
function getMediaInfo(block) {
  if (block.name === 'core/image' || block.name === 'core/cover') {
    const {
      url,
      alt,
      id
    } = block.attributes;
    return {
      url,
      alt,
      id
    };
  }
  if (block.name === 'core/media-text') {
    const {
      mediaUrl: url,
      mediaAlt: alt,
      mediaId: id
    } = block.attributes;
    return {
      url,
      alt,
      id
    };
  }
  return {};
}
function Image({
  clientId,
  alt,
  url
}) {
  const {
    selectBlock
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__unstableMotion.img, {
    tabIndex: 0,
    role: "button",
    "aria-label": (0,external_wp_i18n_namespaceObject.__)('Select image block.'),
    onClick: () => {
      selectBlock(clientId);
    },
    onKeyDown: event => {
      if (event.key === 'Enter' || event.key === ' ') {
        selectBlock(clientId);
        event.preventDefault();
      }
    },
    alt: alt,
    src: url,
    animate: {
      opacity: 1
    },
    exit: {
      opacity: 0,
      scale: 0
    },
    style: {
      width: '32px',
      height: '32px',
      objectFit: 'cover',
      borderRadius: '2px',
      cursor: 'pointer'
    },
    whileHover: {
      scale: 1.08
    }
  }, clientId);
}
function MaybeUploadMediaPanel() {
  const [isUploading, setIsUploading] = (0,external_wp_element_namespaceObject.useState)(false);
  const [isAnimating, setIsAnimating] = (0,external_wp_element_namespaceObject.useState)(false);
  const [hadUploadError, setHadUploadError] = (0,external_wp_element_namespaceObject.useState)(false);
  const {
    editorBlocks,
    mediaUpload
  } = (0,external_wp_data_namespaceObject.useSelect)(select => ({
    editorBlocks: select(external_wp_blockEditor_namespaceObject.store).getBlocks(),
    mediaUpload: select(external_wp_blockEditor_namespaceObject.store).getSettings().mediaUpload
  }), []);
  const blocksWithExternalMedia = flattenBlocks(editorBlocks).filter(block => hasExternalMedia(block));
  const {
    updateBlockAttributes
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  if (!mediaUpload || !blocksWithExternalMedia.length) {
    return null;
  }
  const panelBodyTitle = [(0,external_wp_i18n_namespaceObject.__)('Suggestion:'), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
    className: "editor-post-publish-panel__link",
    children: (0,external_wp_i18n_namespaceObject.__)('External media')
  }, "label")];
  function updateBlockWithUploadedMedia(block, media) {
    if (block.name === 'core/image' || block.name === 'core/cover') {
      updateBlockAttributes(block.clientId, {
        id: media.id,
        url: media.url
      });
    }
    if (block.name === 'core/media-text') {
      updateBlockAttributes(block.clientId, {
        mediaId: media.id,
        mediaUrl: media.url
      });
    }
  }
  function uploadImages() {
    setIsUploading(true);
    setHadUploadError(false);
    const mediaUrls = new Set(blocksWithExternalMedia.map(block => {
      const {
        url
      } = getMediaInfo(block);
      return url;
    }));
    const uploadPromises = Object.fromEntries(Object.entries(fetchMedia([...mediaUrls])).map(([url, filePromise]) => {
      const uploadPromise = filePromise.then(blob => new Promise((resolve, reject) => {
        mediaUpload({
          filesList: [blob],
          onFileChange: ([media]) => {
            if ((0,external_wp_blob_namespaceObject.isBlobURL)(media.url)) {
              return;
            }
            resolve(media);
          },
          onError() {
            reject();
          }
        });
      }));
      return [url, uploadPromise];
    }));
    Promise.allSettled(blocksWithExternalMedia.map(block => {
      const {
        url
      } = getMediaInfo(block);
      return uploadPromises[url].then(media => updateBlockWithUploadedMedia(block, media)).then(() => setIsAnimating(true)).catch(() => setHadUploadError(true));
    })).finally(() => {
      setIsUploading(false);
    });
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
    initialOpen: true,
    title: panelBodyTitle,
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
      children: (0,external_wp_i18n_namespaceObject.__)('Upload external images to the Media Library. Images from different domains may load slowly, display incorrectly, or be removed unexpectedly.')
    }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      style: {
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: '8px'
      },
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__unstableAnimatePresence, {
        onExitComplete: () => setIsAnimating(false),
        children: blocksWithExternalMedia.map(block => {
          const {
            url,
            alt
          } = getMediaInfo(block);
          return (0,external_ReactJSXRuntime_namespaceObject.jsx)(Image, {
            clientId: block.clientId,
            url: url,
            alt: alt
          }, block.clientId);
        })
      }), isUploading || isAnimating ? (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {}) : (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        size: "compact",
        variant: "primary",
        onClick: uploadImages,
        children: (0,external_wp_i18n_namespaceObject._x)('Upload', 'verb')
      })]
    }), hadUploadError && (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
      children: (0,external_wp_i18n_namespaceObject.__)('Upload failed, try again.')
    })]
  });
}
;
function PostPublishPanelPrepublish({
  children
}) {
  const {
    isBeingScheduled,
    isRequestingSiteIcon,
    hasPublishAction,
    siteIconUrl,
    siteTitle,
    siteHome
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _getCurrentPost$_link;
    const {
      getCurrentPost,
      isEditedPostBeingScheduled
    } = select(store_store);
    const {
      getEntityRecord,
      isResolving
    } = select(external_wp_coreData_namespaceObject.store);
    const siteData = getEntityRecord('root', '__unstableBase', undefined) || {};
    return {
      hasPublishAction: (_getCurrentPost$_link = getCurrentPost()._links?.['wp:action-publish']) !== null && _getCurrentPost$_link !== void 0 ? _getCurrentPost$_link : false,
      isBeingScheduled: isEditedPostBeingScheduled(),
      isRequestingSiteIcon: isResolving('getEntityRecord', ['root', '__unstableBase', undefined]),
      siteIconUrl: siteData.site_icon_url,
      siteTitle: siteData.name,
      siteHome: siteData.home && (0,external_wp_url_namespaceObject.filterURLForDisplay)(siteData.home)
    };
  }, []);
  let siteIcon = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
    className: "components-site-icon",
    size: "36px",
    icon: library_wordpress
  });
  if (siteIconUrl) {
    siteIcon = (0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
      alt: (0,external_wp_i18n_namespaceObject.__)('Site Icon'),
      className: "components-site-icon",
      src: siteIconUrl
    });
  }
  if (isRequestingSiteIcon) {
    siteIcon = null;
  }
  let prePublishTitle, prePublishBodyText;
  if (!hasPublishAction) {
    prePublishTitle = (0,external_wp_i18n_namespaceObject.__)('Are you ready to submit for review?');
    prePublishBodyText = (0,external_wp_i18n_namespaceObject.__)('Your work will be reviewed and then approved.');
  } else if (isBeingScheduled) {
    prePublishTitle = (0,external_wp_i18n_namespaceObject.__)('Are you ready to schedule?');
    prePublishBodyText = (0,external_wp_i18n_namespaceObject.__)('Your work will be published at the specified date and time.');
  } else {
    prePublishTitle = (0,external_wp_i18n_namespaceObject.__)('Are you ready to publish?');
    prePublishBodyText = (0,external_wp_i18n_namespaceObject.__)('Double-check your settings before publishing.');
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "editor-post-publish-panel__prepublish",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("strong", {
        children: prePublishTitle
      })
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
      children: prePublishBodyText
    }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "components-site-card",
      children: [siteIcon, (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "components-site-info",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
          className: "components-site-name",
          children: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(siteTitle) || (0,external_wp_i18n_namespaceObject.__)('(Untitled)')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
          className: "components-site-home",
          children: siteHome
        })]
      })]
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(MaybeUploadMediaPanel, {}), hasPublishAction && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
        initialOpen: false,
        title: [(0,external_wp_i18n_namespaceObject.__)('Visibility:'), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
          className: "editor-post-publish-panel__link",
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostVisibilityLabel, {})
        }, "label")],
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostVisibility, {})
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
        initialOpen: false,
        title: [(0,external_wp_i18n_namespaceObject.__)('Publish:'), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
          className: "editor-post-publish-panel__link",
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostScheduleLabel, {})
        }, "label")],
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostSchedule, {})
      })]
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostFormatPanel, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(maybe_tags_panel, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(maybe_category_panel, {}), children]
  });
}
 const prepublish = (PostPublishPanelPrepublish);
;
const POSTNAME = '%postname%';
const PAGENAME = '%pagename%';
const getFuturePostUrl = post => {
  const {
    slug
  } = post;
  if (post.permalink_template.includes(POSTNAME)) {
    return post.permalink_template.replace(POSTNAME, slug);
  }
  if (post.permalink_template.includes(PAGENAME)) {
    return post.permalink_template.replace(PAGENAME, slug);
  }
  return post.permalink_template;
};
function postpublish_CopyButton({
  text
}) {
  const [showCopyConfirmation, setShowCopyConfirmation] = (0,external_wp_element_namespaceObject.useState)(false);
  const timeoutIdRef = (0,external_wp_element_namespaceObject.useRef)();
  const ref = (0,external_wp_compose_namespaceObject.useCopyToClipboard)(text, () => {
    setShowCopyConfirmation(true);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(() => {
      setShowCopyConfirmation(false);
    }, 4000);
  });
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
    __next40pxDefaultSize: true,
    variant: "secondary",
    ref: ref,
    children: showCopyConfirmation ? (0,external_wp_i18n_namespaceObject.__)('Copied!') : (0,external_wp_i18n_namespaceObject.__)('Copy')
  });
}
function PostPublishPanelPostpublish({
  focusOnMount,
  children
}) {
  const {
    post,
    postType,
    isScheduled
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedPostAttribute,
      getCurrentPost,
      isCurrentPostScheduled
    } = select(store_store);
    const {
      getPostType
    } = select(external_wp_coreData_namespaceObject.store);
    return {
      post: getCurrentPost(),
      postType: getPostType(getEditedPostAttribute('type')),
      isScheduled: isCurrentPostScheduled()
    };
  }, []);
  const postLabel = postType?.labels?.singular_name;
  const viewPostLabel = postType?.labels?.view_item;
  const addNewPostLabel = postType?.labels?.add_new_item;
  const link = post.status === 'future' ? getFuturePostUrl(post) : post.link;
  const addLink = (0,external_wp_url_namespaceObject.addQueryArgs)('post-new.php', {
    post_type: post.type
  });
  const postLinkRef = (0,external_wp_element_namespaceObject.useCallback)(node => {
    if (focusOnMount && node) {
      node.focus();
    }
  }, [focusOnMount]);
  const postPublishNonLinkHeader = isScheduled ? (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_wp_i18n_namespaceObject.__)('is now scheduled. It will go live on'), ' ', (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostScheduleLabel, {}), "."]
  }) : (0,external_wp_i18n_namespaceObject.__)('is now live.');
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "post-publish-panel__postpublish",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
      className: "post-publish-panel__postpublish-header",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("a", {
        ref: postLinkRef,
        href: link,
        children: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(post.title) || (0,external_wp_i18n_namespaceObject.__)('(no title)')
      }), ' ', postPublishNonLinkHeader]
    }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.PanelBody, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
        className: "post-publish-panel__postpublish-subheader",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("strong", {
          children: (0,external_wp_i18n_namespaceObject.__)('What’s next?')
        })
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "post-publish-panel__postpublish-post-address-container",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true,
          className: "post-publish-panel__postpublish-post-address",
          readOnly: true,
          label: (0,external_wp_i18n_namespaceObject.sprintf)(
          (0,external_wp_i18n_namespaceObject.__)('%s address'), postLabel),
          value: (0,external_wp_url_namespaceObject.safeDecodeURIComponent)(link),
          onFocus: event => event.target.select()
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: "post-publish-panel__postpublish-post-address__copy-button-wrap",
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(postpublish_CopyButton, {
            text: link
          })
        })]
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "post-publish-panel__postpublish-buttons",
        children: [!isScheduled && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          variant: "primary",
          href: link,
          __next40pxDefaultSize: true,
          children: viewPostLabel
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          variant: isScheduled ? 'primary' : 'secondary',
          __next40pxDefaultSize: true,
          href: addLink,
          children: addNewPostLabel
        })]
      })]
    }), children]
  });
}
;
class PostPublishPanel extends external_wp_element_namespaceObject.Component {
  constructor() {
    super(...arguments);
    this.onSubmit = this.onSubmit.bind(this);
    this.cancelButtonNode = (0,external_wp_element_namespaceObject.createRef)();
  }
  componentDidMount() {
    this.timeoutID = setTimeout(() => {
      this.cancelButtonNode.current.focus();
    }, 0);
  }
  componentWillUnmount() {
    clearTimeout(this.timeoutID);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isPublished && !this.props.isSaving && this.props.isDirty || this.props.currentPostId !== prevProps.currentPostId) {
      this.props.onClose();
    }
  }
  onSubmit() {
    const {
      onClose,
      hasPublishAction,
      isPostTypeViewable
    } = this.props;
    if (!hasPublishAction || !isPostTypeViewable) {
      onClose();
    }
  }
  render() {
    const {
      forceIsDirty,
      isBeingScheduled,
      isPublished,
      isPublishSidebarEnabled,
      isScheduled,
      isSaving,
      isSavingNonPostEntityChanges,
      onClose,
      onTogglePublishSidebar,
      PostPublishExtension,
      PrePublishExtension,
      currentPostId,
      ...additionalProps
    } = this.props;
    const {
      hasPublishAction,
      isDirty,
      isPostTypeViewable,
      ...propsForPanel
    } = additionalProps;
    const isPublishedOrScheduled = isPublished || isScheduled && isBeingScheduled;
    const isPrePublish = !isPublishedOrScheduled && !isSaving;
    const isPostPublish = isPublishedOrScheduled && !isSaving;
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "editor-post-publish-panel",
      ...propsForPanel,
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "editor-post-publish-panel__header",
        children: isPostPublish ? (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          size: "compact",
          onClick: onClose,
          icon: close_small,
          label: (0,external_wp_i18n_namespaceObject.__)('Close panel')
        }) : (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
            className: "editor-post-publish-panel__header-cancel-button",
            children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
              ref: this.cancelButtonNode,
              accessibleWhenDisabled: true,
              disabled: isSavingNonPostEntityChanges,
              onClick: onClose,
              variant: "secondary",
              size: "compact",
              children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
            })
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
            className: "editor-post-publish-panel__header-publish-button",
            children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_publish_button, {
              onSubmit: this.onSubmit,
              forceIsDirty: forceIsDirty
            })
          })]
        })
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "editor-post-publish-panel__content",
        children: [isPrePublish && (0,external_ReactJSXRuntime_namespaceObject.jsx)(prepublish, {
          children: PrePublishExtension && (0,external_ReactJSXRuntime_namespaceObject.jsx)(PrePublishExtension, {})
        }), isPostPublish && (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostPublishPanelPostpublish, {
          focusOnMount: true,
          children: PostPublishExtension && (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostPublishExtension, {})
        }), isSaving && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {})]
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "editor-post-publish-panel__footer",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.CheckboxControl, {
          __nextHasNoMarginBottom: true,
          label: (0,external_wp_i18n_namespaceObject.__)('Always show pre-publish checks.'),
          checked: isPublishSidebarEnabled,
          onChange: onTogglePublishSidebar
        })
      })]
    });
  }
}
 const post_publish_panel = ((0,external_wp_compose_namespaceObject.compose)([(0,external_wp_data_namespaceObject.withSelect)(select => {
  var _getCurrentPost$_link;
  const {
    getPostType
  } = select(external_wp_coreData_namespaceObject.store);
  const {
    getCurrentPost,
    getCurrentPostId,
    getEditedPostAttribute,
    isCurrentPostPublished,
    isCurrentPostScheduled,
    isEditedPostBeingScheduled,
    isEditedPostDirty,
    isAutosavingPost,
    isSavingPost,
    isSavingNonPostEntityChanges
  } = select(store_store);
  const {
    isPublishSidebarEnabled
  } = select(store_store);
  const postType = getPostType(getEditedPostAttribute('type'));
  return {
    hasPublishAction: (_getCurrentPost$_link = getCurrentPost()._links?.['wp:action-publish']) !== null && _getCurrentPost$_link !== void 0 ? _getCurrentPost$_link : false,
    isPostTypeViewable: postType?.viewable,
    isBeingScheduled: isEditedPostBeingScheduled(),
    isDirty: isEditedPostDirty(),
    isPublished: isCurrentPostPublished(),
    isPublishSidebarEnabled: isPublishSidebarEnabled(),
    isSaving: isSavingPost() && !isAutosavingPost(),
    isSavingNonPostEntityChanges: isSavingNonPostEntityChanges(),
    isScheduled: isCurrentPostScheduled(),
    currentPostId: getCurrentPostId()
  };
}), (0,external_wp_data_namespaceObject.withDispatch)((dispatch, {
  isPublishSidebarEnabled
}) => {
  const {
    disablePublishSidebar,
    enablePublishSidebar
  } = dispatch(store_store);
  return {
    onTogglePublishSidebar: () => {
      if (isPublishSidebarEnabled) {
        disablePublishSidebar();
      } else {
        enablePublishSidebar();
      }
    }
  };
}), external_wp_components_namespaceObject.withFocusReturn, external_wp_components_namespaceObject.withConstrainedTabbing])(PostPublishPanel));
;
const cloudUpload = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M17.3 10.1C17.3 7.60001 15.2 5.70001 12.5 5.70001C10.3 5.70001 8.4 7.10001 7.9 9.00001H7.7C5.7 9.00001 4 10.7 4 12.8C4 14.9 5.7 16.6 7.7 16.6H9.5V15.2H7.7C6.5 15.2 5.5 14.1 5.5 12.9C5.5 11.7 6.5 10.5 7.7 10.5H9L9.3 9.40001C9.7 8.10001 11 7.20001 12.5 7.20001C14.3 7.20001 15.8 8.50001 15.8 10.1V11.4L17.1 11.6C17.9 11.7 18.5 12.5 18.5 13.4C18.5 14.4 17.7 15.2 16.8 15.2H14.5V16.6H16.7C18.5 16.6 19.9 15.1 19.9 13.3C20 11.7 18.8 10.4 17.3 10.1Z M14.1245 14.2426L15.1852 13.182L12.0032 10L8.82007 13.1831L9.88072 14.2438L11.25 12.8745V18H12.75V12.8681L14.1245 14.2426Z"
  })
});
 const cloud_upload = (cloudUpload);
;
const cloud = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M17.3 10.1c0-2.5-2.1-4.4-4.8-4.4-2.2 0-4.1 1.4-4.6 3.3h-.2C5.7 9 4 10.7 4 12.8c0 2.1 1.7 3.8 3.7 3.8h9c1.8 0 3.2-1.5 3.2-3.3.1-1.6-1.1-2.9-2.6-3.2zm-.5 5.1h-9c-1.2 0-2.2-1.1-2.2-2.3s1-2.4 2.2-2.4h1.3l.3-1.1c.4-1.3 1.7-2.2 3.2-2.2 1.8 0 3.3 1.3 3.3 2.9v1.3l1.3.2c.8.1 1.4.9 1.4 1.8-.1 1-.9 1.8-1.8 1.8z"
  })
});
 const library_cloud = (cloud);
;
function PostStickyCheck({
  children
}) {
  const {
    hasStickyAction,
    postType
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _post$_links$wpActio;
    const post = select(store_store).getCurrentPost();
    return {
      hasStickyAction: (_post$_links$wpActio = post._links?.['wp:action-sticky']) !== null && _post$_links$wpActio !== void 0 ? _post$_links$wpActio : false,
      postType: select(store_store).getCurrentPostType()
    };
  }, []);
  if (postType !== 'post' || !hasStickyAction) {
    return null;
  }
  return children;
}
;
function PostSticky() {
  const postSticky = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$getEditedPost;
    return (_select$getEditedPost = select(store_store).getEditedPostAttribute('sticky')) !== null && _select$getEditedPost !== void 0 ? _select$getEditedPost : false;
  }, []);
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostStickyCheck, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.CheckboxControl, {
      className: "editor-post-sticky__checkbox-control",
      label: (0,external_wp_i18n_namespaceObject.__)('Sticky'),
      help: (0,external_wp_i18n_namespaceObject.__)('Pin this post to the top of the blog'),
      checked: postSticky,
      onChange: () => editPost({
        sticky: !postSticky
      }),
      __nextHasNoMarginBottom: true
    })
  });
}
;
const postStatusesInfo = {
  'auto-draft': {
    label: (0,external_wp_i18n_namespaceObject.__)('Draft'),
    icon: library_drafts
  },
  draft: {
    label: (0,external_wp_i18n_namespaceObject.__)('Draft'),
    icon: library_drafts
  },
  pending: {
    label: (0,external_wp_i18n_namespaceObject.__)('Pending'),
    icon: library_pending
  },
  private: {
    label: (0,external_wp_i18n_namespaceObject.__)('Private'),
    icon: not_allowed
  },
  future: {
    label: (0,external_wp_i18n_namespaceObject.__)('Scheduled'),
    icon: library_scheduled
  },
  publish: {
    label: (0,external_wp_i18n_namespaceObject.__)('Published'),
    icon: library_published
  }
};
const STATUS_OPTIONS = [{
  label: (0,external_wp_i18n_namespaceObject.__)('Draft'),
  value: 'draft',
  description: (0,external_wp_i18n_namespaceObject.__)('Not ready to publish.')
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Pending'),
  value: 'pending',
  description: (0,external_wp_i18n_namespaceObject.__)('Waiting for review before publishing.')
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Private'),
  value: 'private',
  description: (0,external_wp_i18n_namespaceObject.__)('Only visible to site admins and editors.')
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Scheduled'),
  value: 'future',
  description: (0,external_wp_i18n_namespaceObject.__)('Publish automatically on a chosen date.')
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Published'),
  value: 'publish',
  description: (0,external_wp_i18n_namespaceObject.__)('Visible to everyone.')
}];
const DESIGN_POST_TYPES = [TEMPLATE_POST_TYPE, TEMPLATE_PART_POST_TYPE, PATTERN_POST_TYPE, NAVIGATION_POST_TYPE];
function PostStatus() {
  const {
    status,
    date,
    password,
    postId,
    postType,
    canEdit
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _getCurrentPost$_link;
    const {
      getEditedPostAttribute,
      getCurrentPostId,
      getCurrentPostType,
      getCurrentPost
    } = select(store_store);
    return {
      status: getEditedPostAttribute('status'),
      date: getEditedPostAttribute('date'),
      password: getEditedPostAttribute('password'),
      postId: getCurrentPostId(),
      postType: getCurrentPostType(),
      canEdit: (_getCurrentPost$_link = getCurrentPost()._links?.['wp:action-publish']) !== null && _getCurrentPost$_link !== void 0 ? _getCurrentPost$_link : false
    };
  }, []);
  const [showPassword, setShowPassword] = (0,external_wp_element_namespaceObject.useState)(!!password);
  const passwordInputId = (0,external_wp_compose_namespaceObject.useInstanceId)(PostStatus, 'editor-change-status__password-input');
  const {
    editEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const [popoverAnchor, setPopoverAnchor] = (0,external_wp_element_namespaceObject.useState)(null);
  const popoverProps = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    anchor: popoverAnchor,
    'aria-label': (0,external_wp_i18n_namespaceObject.__)('Status & visibility'),
    headerTitle: (0,external_wp_i18n_namespaceObject.__)('Status & visibility'),
    placement: 'left-start',
    offset: 36,
    shift: true
  }), [popoverAnchor]);
  if (DESIGN_POST_TYPES.includes(postType)) {
    return null;
  }
  const updatePost = ({
    status: newStatus = status,
    password: newPassword = password,
    date: newDate = date
  }) => {
    editEntityRecord('postType', postType, postId, {
      status: newStatus,
      date: newDate,
      password: newPassword
    });
  };
  const handleTogglePassword = value => {
    setShowPassword(value);
    if (!value) {
      updatePost({
        password: ''
      });
    }
  };
  const handleStatus = value => {
    let newDate = date;
    let newPassword = password;
    if (status === 'future' && new Date(date) > new Date()) {
      newDate = null;
    }
    if (value === 'private' && password) {
      newPassword = '';
    }
    updatePost({
      status: value,
      date: newDate,
      password: newPassword
    });
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_panel_row, {
    label: (0,external_wp_i18n_namespaceObject.__)('Status'),
    ref: setPopoverAnchor,
    children: canEdit ? (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
      className: "editor-post-status",
      contentClassName: "editor-change-status__content",
      popoverProps: popoverProps,
      focusOnMount: true,
      renderToggle: ({
        onToggle,
        isOpen
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        className: "editor-post-status__toggle",
        variant: "tertiary",
        size: "compact",
        onClick: onToggle,
        icon: postStatusesInfo[status]?.icon,
        "aria-label": (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject.__)('Change status: %s'), postStatusesInfo[status]?.label),
        "aria-expanded": isOpen,
        children: postStatusesInfo[status]?.label
      }),
      renderContent: ({
        onClose
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalInspectorPopoverHeader, {
          title: (0,external_wp_i18n_namespaceObject.__)('Status & visibility'),
          onClose: onClose
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
          children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
            spacing: 4,
            children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.RadioControl, {
              className: "editor-change-status__options",
              hideLabelFromVision: true,
              label: (0,external_wp_i18n_namespaceObject.__)('Status'),
              options: STATUS_OPTIONS,
              onChange: handleStatus,
              selected: status === 'auto-draft' ? 'draft' : status
            }), status === 'future' && (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
              className: "editor-change-status__publish-date-wrapper",
              children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PrivatePostSchedule, {
                showPopoverHeaderActions: false,
                isCompact: true
              })
            }), status !== 'private' && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
              as: "fieldset",
              spacing: 4,
              className: "editor-change-status__password-fieldset",
              children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.CheckboxControl, {
                __nextHasNoMarginBottom: true,
                label: (0,external_wp_i18n_namespaceObject.__)('Password protected'),
                help: (0,external_wp_i18n_namespaceObject.__)('Only visible to those who know the password'),
                checked: showPassword,
                onChange: handleTogglePassword
              }), showPassword && (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
                className: "editor-change-status__password-input",
                children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
                  label: (0,external_wp_i18n_namespaceObject.__)('Password'),
                  onChange: value => updatePost({
                    password: value
                  }),
                  value: password,
                  placeholder: (0,external_wp_i18n_namespaceObject.__)('Use a secure password'),
                  type: "text",
                  id: passwordInputId,
                  __next40pxDefaultSize: true,
                  __nextHasNoMarginBottom: true,
                  maxLength: 255
                })
              })]
            }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostSticky, {})]
          })
        })]
      })
    }) : (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "editor-post-status is-read-only",
      children: postStatusesInfo[status]?.label
    })
  });
}
;
function PostSavedState({
  forceIsDirty
}) {
  const [forceSavedMessage, setForceSavedMessage] = (0,external_wp_element_namespaceObject.useState)(false);
  const isLargeViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('small');
  const {
    isAutosaving,
    isDirty,
    isNew,
    isPublished,
    isSaveable,
    isSaving,
    isScheduled,
    hasPublishAction,
    showIconLabels,
    postStatus,
    postStatusHasChanged
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _getCurrentPost$_link;
    const {
      isEditedPostNew,
      isCurrentPostPublished,
      isCurrentPostScheduled,
      isEditedPostDirty,
      isSavingPost,
      isEditedPostSaveable,
      getCurrentPost,
      isAutosavingPost,
      getEditedPostAttribute,
      getPostEdits
    } = select(store_store);
    const {
      get
    } = select(external_wp_preferences_namespaceObject.store);
    return {
      isAutosaving: isAutosavingPost(),
      isDirty: forceIsDirty || isEditedPostDirty(),
      isNew: isEditedPostNew(),
      isPublished: isCurrentPostPublished(),
      isSaving: isSavingPost(),
      isSaveable: isEditedPostSaveable(),
      isScheduled: isCurrentPostScheduled(),
      hasPublishAction: (_getCurrentPost$_link = getCurrentPost()?._links?.['wp:action-publish']) !== null && _getCurrentPost$_link !== void 0 ? _getCurrentPost$_link : false,
      showIconLabels: get('core', 'showIconLabels'),
      postStatus: getEditedPostAttribute('status'),
      postStatusHasChanged: !!getPostEdits()?.status
    };
  }, [forceIsDirty]);
  const isPending = postStatus === 'pending';
  const {
    savePost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const wasSaving = (0,external_wp_compose_namespaceObject.usePrevious)(isSaving);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    let timeoutId;
    if (wasSaving && !isSaving) {
      setForceSavedMessage(true);
      timeoutId = setTimeout(() => {
        setForceSavedMessage(false);
      }, 1000);
    }
    return () => clearTimeout(timeoutId);
  }, [isSaving]);
  if (!hasPublishAction && isPending) {
    return null;
  }
  const isIneligibleStatus = !['pending', 'draft', 'auto-draft'].includes(postStatus) && STATUS_OPTIONS.map(({
    value
  }) => value).includes(postStatus);
  if (isPublished || isScheduled || isIneligibleStatus || postStatusHasChanged && ['pending', 'draft'].includes(postStatus)) {
    return null;
  }
  const label = isPending ? (0,external_wp_i18n_namespaceObject.__)('Save as pending') : (0,external_wp_i18n_namespaceObject.__)('Save draft');
  const shortLabel = (0,external_wp_i18n_namespaceObject.__)('Save');
  const isSaved = forceSavedMessage || !isNew && !isDirty;
  const isSavedState = isSaving || isSaved;
  const isDisabled = isSaving || isSaved || !isSaveable;
  let text;
  if (isSaving) {
    text = isAutosaving ? (0,external_wp_i18n_namespaceObject.__)('Autosaving') : (0,external_wp_i18n_namespaceObject.__)('Saving');
  } else if (isSaved) {
    text = (0,external_wp_i18n_namespaceObject.__)('Saved');
  } else if (isLargeViewport) {
    text = label;
  } else if (showIconLabels) {
    text = shortLabel;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.Button, {
    className: isSaveable || isSaving ? dist_clsx({
      'editor-post-save-draft': !isSavedState,
      'editor-post-saved-state': isSavedState,
      'is-saving': isSaving,
      'is-autosaving': isAutosaving,
      'is-saved': isSaved,
      [(0,external_wp_components_namespaceObject.__unstableGetAnimateClassName)({
        type: 'loading'
      })]: isSaving
    }) : undefined,
    onClick: isDisabled ? undefined : () => savePost()
,
    shortcut: isDisabled ? undefined : external_wp_keycodes_namespaceObject.displayShortcut.primary('s'),
    variant: "tertiary",
    size: "compact",
    icon: isLargeViewport ? undefined : cloud_upload,
    label: text || label,
    "aria-disabled": isDisabled,
    children: [isSavedState && (0,external_ReactJSXRuntime_namespaceObject.jsx)(icon, {
      icon: isSaved ? library_check : library_cloud
    }), text]
  });
}
;
function PostScheduleCheck({
  children
}) {
  const hasPublishAction = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$getCurrentPos;
    return (_select$getCurrentPos = select(store_store).getCurrentPost()._links?.['wp:action-publish']) !== null && _select$getCurrentPos !== void 0 ? _select$getCurrentPos : false;
  }, []);
  if (!hasPublishAction) {
    return null;
  }
  return children;
}
;
const panel_DESIGN_POST_TYPES = [TEMPLATE_POST_TYPE, TEMPLATE_PART_POST_TYPE, PATTERN_POST_TYPE, NAVIGATION_POST_TYPE];
function PostSchedulePanel() {
  const [popoverAnchor, setPopoverAnchor] = (0,external_wp_element_namespaceObject.useState)(null);
  const postType = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).getCurrentPostType(), []);
  const popoverProps = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    anchor: popoverAnchor,
    'aria-label': (0,external_wp_i18n_namespaceObject.__)('Change publish date'),
    placement: 'left-start',
    offset: 36,
    shift: true
  }), [popoverAnchor]);
  const label = usePostScheduleLabel();
  const fullLabel = usePostScheduleLabel({
    full: true
  });
  if (panel_DESIGN_POST_TYPES.includes(postType)) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostScheduleCheck, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_panel_row, {
      label: (0,external_wp_i18n_namespaceObject.__)('Publish'),
      ref: setPopoverAnchor,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
        popoverProps: popoverProps,
        focusOnMount: true,
        className: "editor-post-schedule__panel-dropdown",
        contentClassName: "editor-post-schedule__dialog",
        renderToggle: ({
          onToggle,
          isOpen
        }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          size: "compact",
          className: "editor-post-schedule__dialog-toggle",
          variant: "tertiary",
          tooltipPosition: "middle left",
          onClick: onToggle,
          "aria-label": (0,external_wp_i18n_namespaceObject.sprintf)(
          (0,external_wp_i18n_namespaceObject.__)('Change date: %s'), label),
          label: fullLabel,
          showTooltip: label !== fullLabel,
          "aria-expanded": isOpen,
          children: label
        }),
        renderContent: ({
          onClose
        }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostSchedule, {
          onClose: onClose
        })
      })
    })
  });
}
;
function PostSwitchToDraftButton() {
  external_wp_deprecated_default()('wp.editor.PostSwitchToDraftButton', {
    since: '6.7',
    version: '6.9'
  });
  const [showConfirmDialog, setShowConfirmDialog] = (0,external_wp_element_namespaceObject.useState)(false);
  const {
    editPost,
    savePost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    isSaving,
    isPublished,
    isScheduled
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      isSavingPost,
      isCurrentPostPublished,
      isCurrentPostScheduled
    } = select(store_store);
    return {
      isSaving: isSavingPost(),
      isPublished: isCurrentPostPublished(),
      isScheduled: isCurrentPostScheduled()
    };
  }, []);
  const isDisabled = isSaving || !isPublished && !isScheduled;
  let alertMessage;
  let confirmButtonText;
  if (isPublished) {
    alertMessage = (0,external_wp_i18n_namespaceObject.__)('Are you sure you want to unpublish this post?');
    confirmButtonText = (0,external_wp_i18n_namespaceObject.__)('Unpublish');
  } else if (isScheduled) {
    alertMessage = (0,external_wp_i18n_namespaceObject.__)('Are you sure you want to unschedule this post?');
    confirmButtonText = (0,external_wp_i18n_namespaceObject.__)('Unschedule');
  }
  const handleConfirm = () => {
    setShowConfirmDialog(false);
    editPost({
      status: 'draft'
    });
    savePost();
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
      __next40pxDefaultSize: true,
      className: "editor-post-switch-to-draft",
      onClick: () => {
        if (!isDisabled) {
          setShowConfirmDialog(true);
        }
      },
      "aria-disabled": isDisabled,
      variant: "secondary",
      style: {
        flexGrow: '1',
        justifyContent: 'center'
      },
      children: (0,external_wp_i18n_namespaceObject.__)('Switch to draft')
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalConfirmDialog, {
      isOpen: showConfirmDialog,
      onConfirm: handleConfirm,
      onCancel: () => setShowConfirmDialog(false),
      confirmButtonText: confirmButtonText,
      children: alertMessage
    })]
  });
}
;
function PostSyncStatus() {
  const {
    syncStatus,
    postType
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedPostAttribute
    } = select(store_store);
    const meta = getEditedPostAttribute('meta');
    const currentSyncStatus = meta?.wp_pattern_sync_status === 'unsynced' ? 'unsynced' : getEditedPostAttribute('wp_pattern_sync_status');
    return {
      syncStatus: currentSyncStatus,
      postType: getEditedPostAttribute('type')
    };
  });
  if (postType !== 'wp_block') {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_panel_row, {
    label: (0,external_wp_i18n_namespaceObject.__)('Sync status'),
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "editor-post-sync-status__value",
      children: syncStatus === 'unsynced' ? (0,external_wp_i18n_namespaceObject._x)('Not synced', 'pattern (singular)') : (0,external_wp_i18n_namespaceObject._x)('Synced', 'pattern (singular)')
    })
  });
}
;
const post_taxonomies_identity = x => x;
function PostTaxonomies({
  taxonomyWrapper = post_taxonomies_identity
}) {
  const {
    postType,
    taxonomies
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return {
      postType: select(store_store).getCurrentPostType(),
      taxonomies: select(external_wp_coreData_namespaceObject.store).getEntityRecords('root', 'taxonomy', {
        per_page: -1
      })
    };
  }, []);
  const visibleTaxonomies = (taxonomies !== null && taxonomies !== void 0 ? taxonomies : []).filter(taxonomy =>
  taxonomy.types.includes(postType) && taxonomy.visibility?.show_ui);
  return visibleTaxonomies.map(taxonomy => {
    const TaxonomyComponent = taxonomy.hierarchical ? hierarchical_term_selector : flat_term_selector;
    const taxonomyComponentProps = {
      slug: taxonomy.slug,
      ...(taxonomy.hierarchical ? {} : {
        __nextHasNoMarginBottom: true
      })
    };
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_element_namespaceObject.Fragment, {
      children: taxonomyWrapper((0,external_ReactJSXRuntime_namespaceObject.jsx)(TaxonomyComponent, {
        ...taxonomyComponentProps
      }), taxonomy)
    }, `taxonomy-${taxonomy.slug}`);
  });
}
 const post_taxonomies = (PostTaxonomies);
;
function PostTaxonomiesCheck({
  children
}) {
  const hasTaxonomies = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const postType = select(store_store).getCurrentPostType();
    const taxonomies = select(external_wp_coreData_namespaceObject.store).getEntityRecords('root', 'taxonomy', {
      per_page: -1
    });
    return taxonomies?.some(taxonomy => taxonomy.types.includes(postType));
  }, []);
  if (!hasTaxonomies) {
    return null;
  }
  return children;
}
;
function TaxonomyPanel({
  taxonomy,
  children
}) {
  const slug = taxonomy?.slug;
  const panelName = slug ? `taxonomy-panel-${slug}` : '';
  const {
    isEnabled,
    isOpened
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      isEditorPanelEnabled,
      isEditorPanelOpened
    } = select(store_store);
    return {
      isEnabled: slug ? isEditorPanelEnabled(panelName) : false,
      isOpened: slug ? isEditorPanelOpened(panelName) : false
    };
  }, [panelName, slug]);
  const {
    toggleEditorPanelOpened
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  if (!isEnabled) {
    return null;
  }
  const taxonomyMenuName = taxonomy?.labels?.menu_name;
  if (!taxonomyMenuName) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
    title: taxonomyMenuName,
    opened: isOpened,
    onToggle: () => toggleEditorPanelOpened(panelName),
    children: children
  });
}
function panel_PostTaxonomies() {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostTaxonomiesCheck, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_taxonomies, {
      taxonomyWrapper: (content, taxonomy) => {
        return (0,external_ReactJSXRuntime_namespaceObject.jsx)(TaxonomyPanel, {
          taxonomy: taxonomy,
          children: content
        });
      }
    })
  });
}
var lib = __webpack_require__(4132);
;
function PostTextEditor() {
  const instanceId = (0,external_wp_compose_namespaceObject.useInstanceId)(PostTextEditor);
  const {
    content,
    blocks,
    type,
    id
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    const {
      getCurrentPostType,
      getCurrentPostId
    } = select(store_store);
    const _type = getCurrentPostType();
    const _id = getCurrentPostId();
    const editedRecord = getEditedEntityRecord('postType', _type, _id);
    return {
      content: editedRecord?.content,
      blocks: editedRecord?.blocks,
      type: _type,
      id: _id
    };
  }, []);
  const {
    editEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const value = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (content instanceof Function) {
      return content({
        blocks
      });
    } else if (blocks) {
      return (0,external_wp_blocks_namespaceObject.__unstableSerializeAndClean)(blocks);
    }
    return content;
  }, [content, blocks]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.VisuallyHidden, {
      as: "label",
      htmlFor: `post-content-${instanceId}`,
      children: (0,external_wp_i18n_namespaceObject.__)('Type text or HTML')
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(lib.A, {
      autoComplete: "off",
      dir: "auto",
      value: value,
      onChange: event => {
        editEntityRecord('postType', type, id, {
          content: event.target.value,
          blocks: undefined,
          selection: undefined
        });
      },
      className: "editor-post-text-editor",
      id: `post-content-${instanceId}`,
      placeholder: (0,external_wp_i18n_namespaceObject.__)('Start writing with text or HTML')
    })]
  });
}
;
const DEFAULT_CLASSNAMES = 'wp-block wp-block-post-title block-editor-block-list__block editor-post-title editor-post-title__input rich-text';
const REGEXP_NEWLINES = /[\r\n]+/g;
;
function usePostTitleFocus(forwardedRef) {
  const ref = (0,external_wp_element_namespaceObject.useRef)();
  const {
    isCleanNewPost
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      isCleanNewPost: _isCleanNewPost
    } = select(store_store);
    return {
      isCleanNewPost: _isCleanNewPost()
    };
  }, []);
  (0,external_wp_element_namespaceObject.useImperativeHandle)(forwardedRef, () => ({
    focus: () => {
      ref?.current?.focus();
    }
  }));
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (!ref.current) {
      return;
    }
    const {
      defaultView
    } = ref.current.ownerDocument;
    const {
      name,
      parent
    } = defaultView;
    const ownerDocument = name === 'editor-canvas' ? parent.document : defaultView.document;
    const {
      activeElement,
      body
    } = ownerDocument;
    if (isCleanNewPost && (!activeElement || body === activeElement)) {
      ref.current.focus();
    }
  }, [isCleanNewPost]);
  return {
    ref
  };
}
;
function usePostTitle() {
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    title
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedPostAttribute
    } = select(store_store);
    return {
      title: getEditedPostAttribute('title')
    };
  }, []);
  function updateTitle(newTitle) {
    editPost({
      title: newTitle
    });
  }
  return {
    title,
    setTitle: updateTitle
  };
}
;
const PostTitle = (0,external_wp_element_namespaceObject.forwardRef)((_, forwardedRef) => {
  const {
    placeholder
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getSettings
    } = select(external_wp_blockEditor_namespaceObject.store);
    const {
      titlePlaceholder
    } = getSettings();
    return {
      placeholder: titlePlaceholder
    };
  }, []);
  const [isSelected, setIsSelected] = (0,external_wp_element_namespaceObject.useState)(false);
  const {
    ref: focusRef
  } = usePostTitleFocus(forwardedRef);
  const {
    title,
    setTitle: onUpdate
  } = usePostTitle();
  const [selection, setSelection] = (0,external_wp_element_namespaceObject.useState)({});
  const {
    clearSelectedBlock,
    insertBlocks,
    insertDefaultBlock
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  const decodedPlaceholder = (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(placeholder) || (0,external_wp_i18n_namespaceObject.__)('Add title');
  const {
    value,
    onChange,
    ref: richTextRef
  } = (0,external_wp_richText_namespaceObject.__unstableUseRichText)({
    value: title,
    onChange(newValue) {
      onUpdate(newValue.replace(REGEXP_NEWLINES, ' '));
    },
    placeholder: decodedPlaceholder,
    selectionStart: selection.start,
    selectionEnd: selection.end,
    onSelectionChange(newStart, newEnd) {
      setSelection(sel => {
        const {
          start,
          end
        } = sel;
        if (start === newStart && end === newEnd) {
          return sel;
        }
        return {
          start: newStart,
          end: newEnd
        };
      });
    },
    __unstableDisableFormats: false
  });
  function onInsertBlockAfter(blocks) {
    insertBlocks(blocks, 0);
  }
  function onSelect() {
    setIsSelected(true);
    clearSelectedBlock();
  }
  function onUnselect() {
    setIsSelected(false);
    setSelection({});
  }
  function onEnterPress() {
    insertDefaultBlock(undefined, undefined, 0);
  }
  function onKeyDown(event) {
    if (event.keyCode === external_wp_keycodes_namespaceObject.ENTER) {
      event.preventDefault();
      onEnterPress();
    }
  }
  function onPaste(event) {
    const clipboardData = event.clipboardData;
    let plainText = '';
    let html = '';
    try {
      plainText = clipboardData.getData('text/plain');
      html = clipboardData.getData('text/html');
    } catch (error) {
      return;
    }
    window.console.log('Received HTML:\n\n', html);
    window.console.log('Received plain text:\n\n', plainText);
    const content = (0,external_wp_blocks_namespaceObject.pasteHandler)({
      HTML: html,
      plainText
    });
    event.preventDefault();
    if (!content.length) {
      return;
    }
    if (typeof content !== 'string') {
      const [firstBlock] = content;
      if (!title && (firstBlock.name === 'core/heading' || firstBlock.name === 'core/paragraph')) {
        const contentNoHTML = (0,external_wp_dom_namespaceObject.__unstableStripHTML)(firstBlock.attributes.content);
        onUpdate(contentNoHTML);
        onInsertBlockAfter(content.slice(1));
      } else {
        onInsertBlockAfter(content);
      }
    } else {
      const contentNoHTML = (0,external_wp_dom_namespaceObject.__unstableStripHTML)(content);
      onChange((0,external_wp_richText_namespaceObject.insert)(value, (0,external_wp_richText_namespaceObject.create)({
        html: contentNoHTML
      })));
    }
  }
  const className = dist_clsx(DEFAULT_CLASSNAMES, {
    'is-selected': isSelected
  });
  return  (0,external_ReactJSXRuntime_namespaceObject.jsx)("h1", {
    ref: (0,external_wp_compose_namespaceObject.useMergeRefs)([richTextRef, focusRef]),
    contentEditable: true,
    className: className,
    "aria-label": decodedPlaceholder,
    role: "textbox",
    "aria-multiline": "true",
    onFocus: onSelect,
    onBlur: onUnselect,
    onKeyDown: onKeyDown,
    onPaste: onPaste
  })
  ;
});
 const post_title = ((0,external_wp_element_namespaceObject.forwardRef)((_, forwardedRef) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_type_support_check, {
  supportKeys: "title",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostTitle, {
    ref: forwardedRef
  })
})));
;
function PostTitleRaw(_, forwardedRef) {
  const {
    placeholder
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getSettings
    } = select(external_wp_blockEditor_namespaceObject.store);
    const {
      titlePlaceholder
    } = getSettings();
    return {
      placeholder: titlePlaceholder
    };
  }, []);
  const [isSelected, setIsSelected] = (0,external_wp_element_namespaceObject.useState)(false);
  const {
    title,
    setTitle: onUpdate
  } = usePostTitle();
  const {
    ref: focusRef
  } = usePostTitleFocus(forwardedRef);
  function onChange(value) {
    onUpdate(value.replace(REGEXP_NEWLINES, ' '));
  }
  function onSelect() {
    setIsSelected(true);
  }
  function onUnselect() {
    setIsSelected(false);
  }
  const className = dist_clsx(DEFAULT_CLASSNAMES, {
    'is-selected': isSelected,
    'is-raw-text': true
  });
  const decodedPlaceholder = (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(placeholder) || (0,external_wp_i18n_namespaceObject.__)('Add title');
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextareaControl, {
    ref: focusRef,
    value: title,
    onChange: onChange,
    onFocus: onSelect,
    onBlur: onUnselect,
    label: placeholder,
    className: className,
    placeholder: decodedPlaceholder,
    hideLabelFromVision: true,
    autoComplete: "off",
    dir: "auto",
    rows: 1,
    __nextHasNoMarginBottom: true
  });
}
 const post_title_raw = ((0,external_wp_element_namespaceObject.forwardRef)(PostTitleRaw));
;
function PostTrashCheck({
  children
}) {
  const {
    canTrashPost
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      isEditedPostNew,
      getCurrentPostId,
      getCurrentPostType
    } = select(store_store);
    const {
      canUser
    } = select(external_wp_coreData_namespaceObject.store);
    const postType = getCurrentPostType();
    const postId = getCurrentPostId();
    const isNew = isEditedPostNew();
    const canUserDelete = !!postId ? canUser('delete', {
      kind: 'postType',
      name: postType,
      id: postId
    }) : false;
    return {
      canTrashPost: (!isNew || postId) && canUserDelete && !GLOBAL_POST_TYPES.includes(postType)
    };
  }, []);
  if (!canTrashPost) {
    return null;
  }
  return children;
}
;
function PostTrash({
  onActionPerformed
}) {
  const registry = (0,external_wp_data_namespaceObject.useRegistry)();
  const {
    isNew,
    isDeleting,
    postId,
    title
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const store = select(store_store);
    return {
      isNew: store.isEditedPostNew(),
      isDeleting: store.isDeletingPost(),
      postId: store.getCurrentPostId(),
      title: store.getCurrentPostAttribute('title')
    };
  }, []);
  const {
    trashPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const [showConfirmDialog, setShowConfirmDialog] = (0,external_wp_element_namespaceObject.useState)(false);
  if (isNew || !postId) {
    return null;
  }
  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    await trashPost();
    const item = await registry.resolveSelect(store_store).getCurrentPost();
    onActionPerformed?.('move-to-trash', [item]);
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(PostTrashCheck, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
      __next40pxDefaultSize: true,
      className: "editor-post-trash",
      isDestructive: true,
      variant: "secondary",
      isBusy: isDeleting,
      "aria-disabled": isDeleting,
      onClick: isDeleting ? undefined : () => setShowConfirmDialog(true),
      children: (0,external_wp_i18n_namespaceObject.__)('Move to trash')
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalConfirmDialog, {
      isOpen: showConfirmDialog,
      onConfirm: handleConfirm,
      onCancel: () => setShowConfirmDialog(false),
      confirmButtonText: (0,external_wp_i18n_namespaceObject.__)('Move to trash'),
      size: "small",
      children: (0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject.__)('Are you sure you want to move "%s" to the trash?'), title)
    })]
  });
}
;
function PostURL({
  onClose
}) {
  const {
    isEditable,
    postSlug,
    postLink,
    permalinkPrefix,
    permalinkSuffix,
    permalink
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _post$_links$wpActio;
    const post = select(store_store).getCurrentPost();
    const postTypeSlug = select(store_store).getCurrentPostType();
    const postType = select(external_wp_coreData_namespaceObject.store).getPostType(postTypeSlug);
    const permalinkParts = select(store_store).getPermalinkParts();
    const hasPublishAction = (_post$_links$wpActio = post?._links?.['wp:action-publish']) !== null && _post$_links$wpActio !== void 0 ? _post$_links$wpActio : false;
    return {
      isEditable: select(store_store).isPermalinkEditable() && hasPublishAction,
      postSlug: (0,external_wp_url_namespaceObject.safeDecodeURIComponent)(select(store_store).getEditedPostSlug()),
      viewPostLabel: postType?.labels.view_item,
      postLink: post.link,
      permalinkPrefix: permalinkParts?.prefix,
      permalinkSuffix: permalinkParts?.suffix,
      permalink: (0,external_wp_url_namespaceObject.safeDecodeURIComponent)(select(store_store).getPermalink())
    };
  }, []);
  const {
    editPost
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    createNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const [forceEmptyField, setForceEmptyField] = (0,external_wp_element_namespaceObject.useState)(false);
  const copyButtonRef = (0,external_wp_compose_namespaceObject.useCopyToClipboard)(permalink, () => {
    createNotice('info', (0,external_wp_i18n_namespaceObject.__)('Copied Permalink to clipboard.'), {
      isDismissible: true,
      type: 'snackbar'
    });
  });
  const postUrlSlugDescriptionId = 'editor-post-url__slug-description-' + (0,external_wp_compose_namespaceObject.useInstanceId)(PostURL);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "editor-post-url",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalInspectorPopoverHeader, {
      title: (0,external_wp_i18n_namespaceObject.__)('Slug'),
      onClose: onClose
    }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      spacing: 3,
      children: [isEditable && (0,external_ReactJSXRuntime_namespaceObject.jsx)("p", {
        className: "editor-post-url__intro",
        children: (0,external_wp_element_namespaceObject.createInterpolateElement)((0,external_wp_i18n_namespaceObject.__)('<span>Customize the last part of the Permalink.</span> <a>Learn more.</a>'), {
          span: (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
            id: postUrlSlugDescriptionId
          }),
          a: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ExternalLink, {
            href: (0,external_wp_i18n_namespaceObject.__)('https://wordpress.org/documentation/article/page-post-settings-sidebar/#permalink')
          })
        })
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        children: [isEditable && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalInputControl, {
            __next40pxDefaultSize: true,
            prefix: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalInputControlPrefixWrapper, {
              children: "/"
            }),
            suffix: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalInputControlSuffixWrapper, {
              variant: "control",
              children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
                icon: copy_small,
                ref: copyButtonRef,
                size: "small",
                label: "Copy"
              })
            }),
            label: (0,external_wp_i18n_namespaceObject.__)('Slug'),
            hideLabelFromVision: true,
            value: forceEmptyField ? '' : postSlug,
            autoComplete: "off",
            spellCheck: "false",
            type: "text",
            className: "editor-post-url__input",
            onChange: newValue => {
              editPost({
                slug: newValue
              });
              if (!newValue) {
                if (!forceEmptyField) {
                  setForceEmptyField(true);
                }
                return;
              }
              if (forceEmptyField) {
                setForceEmptyField(false);
              }
            },
            onBlur: event => {
              editPost({
                slug: (0,external_wp_url_namespaceObject.cleanForSlug)(event.target.value)
              });
              if (forceEmptyField) {
                setForceEmptyField(false);
              }
            },
            "aria-describedby": postUrlSlugDescriptionId
          }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("p", {
            className: "editor-post-url__permalink",
            children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
              className: "editor-post-url__permalink-visual-label",
              children: (0,external_wp_i18n_namespaceObject.__)('Permalink:')
            }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.ExternalLink, {
              className: "editor-post-url__link",
              href: postLink,
              target: "_blank",
              children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
                className: "editor-post-url__link-prefix",
                children: permalinkPrefix
              }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
                className: "editor-post-url__link-slug",
                children: postSlug
              }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
                className: "editor-post-url__link-suffix",
                children: permalinkSuffix
              })]
            })]
          })]
        }), !isEditable && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ExternalLink, {
          className: "editor-post-url__link",
          href: postLink,
          target: "_blank",
          children: postLink
        })]
      })]
    })]
  });
}
;
function PostURLCheck({
  children
}) {
  const isVisible = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const postTypeSlug = select(store_store).getCurrentPostType();
    const postType = select(external_wp_coreData_namespaceObject.store).getPostType(postTypeSlug);
    if (!postType?.viewable) {
      return false;
    }
    const post = select(store_store).getCurrentPost();
    if (!post.link) {
      return false;
    }
    const permalinkParts = select(store_store).getPermalinkParts();
    if (!permalinkParts) {
      return false;
    }
    return true;
  }, []);
  if (!isVisible) {
    return null;
  }
  return children;
}
;
function PostURLLabel() {
  return usePostURLLabel();
}
function usePostURLLabel() {
  const postLink = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).getPermalink(), []);
  return (0,external_wp_url_namespaceObject.filterURLForDisplay)((0,external_wp_url_namespaceObject.safeDecodeURIComponent)(postLink));
}
;
function PostURLPanel() {
  const {
    isFrontPage
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostId
    } = select(store_store);
    const {
      getEditedEntityRecord,
      canUser
    } = select(external_wp_coreData_namespaceObject.store);
    const siteSettings = canUser('read', {
      kind: 'root',
      name: 'site'
    }) ? getEditedEntityRecord('root', 'site') : undefined;
    const _id = getCurrentPostId();
    return {
      isFrontPage: siteSettings?.page_on_front === _id
    };
  }, []);
  const [popoverAnchor, setPopoverAnchor] = (0,external_wp_element_namespaceObject.useState)(null);
  const popoverProps = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    anchor: popoverAnchor,
    placement: 'left-start',
    offset: 36,
    shift: true
  }), [popoverAnchor]);
  const label = isFrontPage ? (0,external_wp_i18n_namespaceObject.__)('Link') : (0,external_wp_i18n_namespaceObject.__)('Slug');
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostURLCheck, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(post_panel_row, {
      label: label,
      ref: setPopoverAnchor,
      children: [!isFrontPage && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
        popoverProps: popoverProps,
        className: "editor-post-url__panel-dropdown",
        contentClassName: "editor-post-url__panel-dialog",
        focusOnMount: true,
        renderToggle: ({
          isOpen,
          onToggle
        }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostURLToggle, {
          isOpen: isOpen,
          onClick: onToggle
        }),
        renderContent: ({
          onClose
        }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostURL, {
          onClose: onClose
        })
      }), isFrontPage && (0,external_ReactJSXRuntime_namespaceObject.jsx)(FrontPageLink, {})]
    })
  });
}
function PostURLToggle({
  isOpen,
  onClick
}) {
  const {
    slug
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return {
      slug: select(store_store).getEditedPostSlug()
    };
  }, []);
  const decodedSlug = (0,external_wp_url_namespaceObject.safeDecodeURIComponent)(slug);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
    size: "compact",
    className: "editor-post-url__panel-toggle",
    variant: "tertiary",
    "aria-expanded": isOpen,
    "aria-label":
    (0,external_wp_i18n_namespaceObject.sprintf)((0,external_wp_i18n_namespaceObject.__)('Change link: %s'), decodedSlug),
    onClick: onClick,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: decodedSlug
    })
  });
}
function FrontPageLink() {
  const {
    postLink
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPost
    } = select(store_store);
    return {
      postLink: getCurrentPost()?.link
    };
  }, []);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ExternalLink, {
    className: "editor-post-url__front-page-link",
    href: postLink,
    target: "_blank",
    children: postLink
  });
}
;
function PostVisibilityCheck({
  render
}) {
  const canEdit = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$getCurrentPos;
    return (_select$getCurrentPos = select(store_store).getCurrentPost()._links?.['wp:action-publish']) !== null && _select$getCurrentPos !== void 0 ? _select$getCurrentPos : false;
  });
  return render({
    canEdit
  });
}
;
const info = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M5.5 12a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0ZM12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.75 4v1.5h-1.5V8h1.5Zm0 8v-5h-1.5v5h1.5Z"
  })
});
 const library_info = (info);
;
const external_wp_wordcount_namespaceObject = window["wp"]["wordcount"];
;
function WordCount() {
  const content = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).getEditedPostAttribute('content'), []);
  const wordCountType = (0,external_wp_i18n_namespaceObject._x)('words', 'Word count type. Do not translate!');
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
    className: "word-count",
    children: (0,external_wp_wordcount_namespaceObject.count)(content, wordCountType)
  });
}
;
const AVERAGE_READING_RATE = 189;
function TimeToRead() {
  const content = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).getEditedPostAttribute('content'), []);
  const wordCountType = (0,external_wp_i18n_namespaceObject._x)('words', 'Word count type. Do not translate!');
  const minutesToRead = Math.round((0,external_wp_wordcount_namespaceObject.count)(content, wordCountType) / AVERAGE_READING_RATE);
  const minutesToReadString = minutesToRead === 0 ? (0,external_wp_element_namespaceObject.createInterpolateElement)((0,external_wp_i18n_namespaceObject.__)('<span>< 1</span> minute'), {
    span: (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {})
  }) : (0,external_wp_element_namespaceObject.createInterpolateElement)((0,external_wp_i18n_namespaceObject.sprintf)(
  (0,external_wp_i18n_namespaceObject._n)('<span>%s</span> minute', '<span>%s</span> minutes', minutesToRead), minutesToRead), {
    span: (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {})
  });
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
    className: "time-to-read",
    children: minutesToReadString
  });
}
;
function CharacterCount() {
  const content = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).getEditedPostAttribute('content'), []);
  return (0,external_wp_wordcount_namespaceObject.count)(content, 'characters_including_spaces');
}
;
function TableOfContentsPanel({
  hasOutlineItemsDisabled,
  onRequestClose
}) {
  const {
    headingCount,
    paragraphCount,
    numberOfBlocks
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getGlobalBlockCount
    } = select(external_wp_blockEditor_namespaceObject.store);
    return {
      headingCount: getGlobalBlockCount('core/heading'),
      paragraphCount: getGlobalBlockCount('core/paragraph'),
      numberOfBlocks: getGlobalBlockCount()
    };
  }, []);
  return (
    (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
        className: "table-of-contents__wrapper",
        role: "note",
        "aria-label": (0,external_wp_i18n_namespaceObject.__)('Document Statistics'),
        tabIndex: "0",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)("ul", {
          role: "list",
          className: "table-of-contents__counts",
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)("li", {
            className: "table-of-contents__count",
            children: [(0,external_wp_i18n_namespaceObject.__)('Words'), (0,external_ReactJSXRuntime_namespaceObject.jsx)(WordCount, {})]
          }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("li", {
            className: "table-of-contents__count",
            children: [(0,external_wp_i18n_namespaceObject.__)('Characters'), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
              className: "table-of-contents__number",
              children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(CharacterCount, {})
            })]
          }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("li", {
            className: "table-of-contents__count",
            children: [(0,external_wp_i18n_namespaceObject.__)('Time to read'), (0,external_ReactJSXRuntime_namespaceObject.jsx)(TimeToRead, {})]
          }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("li", {
            className: "table-of-contents__count",
            children: [(0,external_wp_i18n_namespaceObject.__)('Headings'), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
              className: "table-of-contents__number",
              children: headingCount
            })]
          }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("li", {
            className: "table-of-contents__count",
            children: [(0,external_wp_i18n_namespaceObject.__)('Paragraphs'), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
              className: "table-of-contents__number",
              children: paragraphCount
            })]
          }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("li", {
            className: "table-of-contents__count",
            children: [(0,external_wp_i18n_namespaceObject.__)('Blocks'), (0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
              className: "table-of-contents__number",
              children: numberOfBlocks
            })]
          })]
        })
      }), headingCount > 0 && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("hr", {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)("h2", {
          className: "table-of-contents__title",
          children: (0,external_wp_i18n_namespaceObject.__)('Document Outline')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(DocumentOutline, {
          onSelect: onRequestClose,
          hasOutlineItemsDisabled: hasOutlineItemsDisabled
        })]
      })]
    })
  );
}
 const table_of_contents_panel = (TableOfContentsPanel);
;
function TableOfContents({
  hasOutlineItemsDisabled,
  repositionDropdown,
  ...props
}, ref) {
  const hasBlocks = (0,external_wp_data_namespaceObject.useSelect)(select => !!select(external_wp_blockEditor_namespaceObject.store).getBlockCount(), []);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
    popoverProps: {
      placement: repositionDropdown ? 'right' : 'bottom'
    },
    className: "table-of-contents",
    contentClassName: "table-of-contents__popover",
    renderToggle: ({
      isOpen,
      onToggle
    }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
      __next40pxDefaultSize: true,
      ...props,
      ref: ref,
      onClick: hasBlocks ? onToggle : undefined,
      icon: library_info,
      "aria-expanded": isOpen,
      "aria-haspopup": "true"
      ,
      label: (0,external_wp_i18n_namespaceObject.__)('Details'),
      tooltipPosition: "bottom",
      "aria-disabled": !hasBlocks
    }),
    renderContent: ({
      onClose
    }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(table_of_contents_panel, {
      onRequestClose: onClose,
      hasOutlineItemsDisabled: hasOutlineItemsDisabled
    })
  });
}
 const table_of_contents = ((0,external_wp_element_namespaceObject.forwardRef)(TableOfContents));
;
function UnsavedChangesWarning() {
  const {
    __experimentalGetDirtyEntityRecords
  } = (0,external_wp_data_namespaceObject.useSelect)(external_wp_coreData_namespaceObject.store);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    const warnIfUnsavedChanges = event => {
      const dirtyEntityRecords = __experimentalGetDirtyEntityRecords();
      if (dirtyEntityRecords.length > 0) {
        event.returnValue = (0,external_wp_i18n_namespaceObject.__)('You have unsaved changes. If you proceed, they will be lost.');
        return event.returnValue;
      }
    };
    window.addEventListener('beforeunload', warnIfUnsavedChanges);
    return () => {
      window.removeEventListener('beforeunload', warnIfUnsavedChanges);
    };
  }, [__experimentalGetDirtyEntityRecords]);
  return null;
}
;
const external_wp_serverSideRender_namespaceObject = window["wp"]["serverSideRender"];
var external_wp_serverSideRender_default = __webpack_require__.n(external_wp_serverSideRender_namespaceObject);
;
function deprecateComponent(name, Wrapped, staticsToHoist = []) {
  const Component = (0,external_wp_element_namespaceObject.forwardRef)((props, ref) => {
    external_wp_deprecated_default()('wp.editor.' + name, {
      since: '5.3',
      alternative: 'wp.blockEditor.' + name,
      version: '6.2'
    });
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(Wrapped, {
      ref: ref,
      ...props
    });
  });
  staticsToHoist.forEach(staticName => {
    Component[staticName] = deprecateComponent(name + '.' + staticName, Wrapped[staticName]);
  });
  return Component;
}
function deprecateFunction(name, func) {
  return (...args) => {
    external_wp_deprecated_default()('wp.editor.' + name, {
      since: '5.3',
      alternative: 'wp.blockEditor.' + name,
      version: '6.2'
    });
    return func(...args);
  };
}
const RichText = deprecateComponent('RichText', external_wp_blockEditor_namespaceObject.RichText, ['Content']);
RichText.isEmpty = deprecateFunction('RichText.isEmpty', external_wp_blockEditor_namespaceObject.RichText.isEmpty);
const Autocomplete = deprecateComponent('Autocomplete', external_wp_blockEditor_namespaceObject.Autocomplete);
const AlignmentToolbar = deprecateComponent('AlignmentToolbar', external_wp_blockEditor_namespaceObject.AlignmentToolbar);
const BlockAlignmentToolbar = deprecateComponent('BlockAlignmentToolbar', external_wp_blockEditor_namespaceObject.BlockAlignmentToolbar);
const BlockControls = deprecateComponent('BlockControls', external_wp_blockEditor_namespaceObject.BlockControls, ['Slot']);
const BlockEdit = deprecateComponent('BlockEdit', external_wp_blockEditor_namespaceObject.BlockEdit);
const BlockEditorKeyboardShortcuts = deprecateComponent('BlockEditorKeyboardShortcuts', external_wp_blockEditor_namespaceObject.BlockEditorKeyboardShortcuts);
const BlockFormatControls = deprecateComponent('BlockFormatControls', external_wp_blockEditor_namespaceObject.BlockFormatControls, ['Slot']);
const BlockIcon = deprecateComponent('BlockIcon', external_wp_blockEditor_namespaceObject.BlockIcon);
const BlockInspector = deprecateComponent('BlockInspector', external_wp_blockEditor_namespaceObject.BlockInspector);
const BlockList = deprecateComponent('BlockList', external_wp_blockEditor_namespaceObject.BlockList);
const BlockMover = deprecateComponent('BlockMover', external_wp_blockEditor_namespaceObject.BlockMover);
const BlockNavigationDropdown = deprecateComponent('BlockNavigationDropdown', external_wp_blockEditor_namespaceObject.BlockNavigationDropdown);
const BlockSelectionClearer = deprecateComponent('BlockSelectionClearer', external_wp_blockEditor_namespaceObject.BlockSelectionClearer);
const BlockSettingsMenu = deprecateComponent('BlockSettingsMenu', external_wp_blockEditor_namespaceObject.BlockSettingsMenu);
const BlockTitle = deprecateComponent('BlockTitle', external_wp_blockEditor_namespaceObject.BlockTitle);
const BlockToolbar = deprecateComponent('BlockToolbar', external_wp_blockEditor_namespaceObject.BlockToolbar);
const ColorPalette = deprecateComponent('ColorPalette', external_wp_blockEditor_namespaceObject.ColorPalette);
const ContrastChecker = deprecateComponent('ContrastChecker', external_wp_blockEditor_namespaceObject.ContrastChecker);
const CopyHandler = deprecateComponent('CopyHandler', external_wp_blockEditor_namespaceObject.CopyHandler);
const DefaultBlockAppender = deprecateComponent('DefaultBlockAppender', external_wp_blockEditor_namespaceObject.DefaultBlockAppender);
const FontSizePicker = deprecateComponent('FontSizePicker', external_wp_blockEditor_namespaceObject.FontSizePicker);
const Inserter = deprecateComponent('Inserter', external_wp_blockEditor_namespaceObject.Inserter);
const InnerBlocks = deprecateComponent('InnerBlocks', external_wp_blockEditor_namespaceObject.InnerBlocks, ['ButtonBlockAppender', 'DefaultBlockAppender', 'Content']);
const InspectorAdvancedControls = deprecateComponent('InspectorAdvancedControls', external_wp_blockEditor_namespaceObject.InspectorAdvancedControls, ['Slot']);
const InspectorControls = deprecateComponent('InspectorControls', external_wp_blockEditor_namespaceObject.InspectorControls, ['Slot']);
const PanelColorSettings = deprecateComponent('PanelColorSettings', external_wp_blockEditor_namespaceObject.PanelColorSettings);
const PlainText = deprecateComponent('PlainText', external_wp_blockEditor_namespaceObject.PlainText);
const RichTextShortcut = deprecateComponent('RichTextShortcut', external_wp_blockEditor_namespaceObject.RichTextShortcut);
const RichTextToolbarButton = deprecateComponent('RichTextToolbarButton', external_wp_blockEditor_namespaceObject.RichTextToolbarButton);
const __unstableRichTextInputEvent = deprecateComponent('__unstableRichTextInputEvent', external_wp_blockEditor_namespaceObject.__unstableRichTextInputEvent);
const MediaPlaceholder = deprecateComponent('MediaPlaceholder', external_wp_blockEditor_namespaceObject.MediaPlaceholder);
const MediaUpload = deprecateComponent('MediaUpload', external_wp_blockEditor_namespaceObject.MediaUpload);
const MediaUploadCheck = deprecateComponent('MediaUploadCheck', external_wp_blockEditor_namespaceObject.MediaUploadCheck);
const MultiSelectScrollIntoView = deprecateComponent('MultiSelectScrollIntoView', external_wp_blockEditor_namespaceObject.MultiSelectScrollIntoView);
const NavigableToolbar = deprecateComponent('NavigableToolbar', external_wp_blockEditor_namespaceObject.NavigableToolbar);
const ObserveTyping = deprecateComponent('ObserveTyping', external_wp_blockEditor_namespaceObject.ObserveTyping);
const SkipToSelectedBlock = deprecateComponent('SkipToSelectedBlock', external_wp_blockEditor_namespaceObject.SkipToSelectedBlock);
const URLInput = deprecateComponent('URLInput', external_wp_blockEditor_namespaceObject.URLInput);
const URLInputButton = deprecateComponent('URLInputButton', external_wp_blockEditor_namespaceObject.URLInputButton);
const URLPopover = deprecateComponent('URLPopover', external_wp_blockEditor_namespaceObject.URLPopover);
const Warning = deprecateComponent('Warning', external_wp_blockEditor_namespaceObject.Warning);
const WritingFlow = deprecateComponent('WritingFlow', external_wp_blockEditor_namespaceObject.WritingFlow);
const createCustomColorsHOC = deprecateFunction('createCustomColorsHOC', external_wp_blockEditor_namespaceObject.createCustomColorsHOC);
const getColorClassName = deprecateFunction('getColorClassName', external_wp_blockEditor_namespaceObject.getColorClassName);
const getColorObjectByAttributeValues = deprecateFunction('getColorObjectByAttributeValues', external_wp_blockEditor_namespaceObject.getColorObjectByAttributeValues);
const getColorObjectByColorValue = deprecateFunction('getColorObjectByColorValue', external_wp_blockEditor_namespaceObject.getColorObjectByColorValue);
const getFontSize = deprecateFunction('getFontSize', external_wp_blockEditor_namespaceObject.getFontSize);
const getFontSizeClass = deprecateFunction('getFontSizeClass', external_wp_blockEditor_namespaceObject.getFontSizeClass);
const withColorContext = deprecateFunction('withColorContext', external_wp_blockEditor_namespaceObject.withColorContext);
const withColors = deprecateFunction('withColors', external_wp_blockEditor_namespaceObject.withColors);
const withFontSizes = deprecateFunction('withFontSizes', external_wp_blockEditor_namespaceObject.withFontSizes);
;
const VisualEditorGlobalKeyboardShortcuts = EditorKeyboardShortcuts;
const TextEditorGlobalKeyboardShortcuts = EditorKeyboardShortcuts;
;
function cleanForSlug(string) {
  external_wp_deprecated_default()('wp.editor.cleanForSlug', {
    since: '12.7',
    plugin: 'Gutenberg',
    alternative: 'wp.url.cleanForSlug'
  });
  return (0,external_wp_url_namespaceObject.cleanForSlug)(string);
}
;
;
const EditorContentSlotFill = (0,external_wp_components_namespaceObject.createSlotFill)(Symbol('EditCanvasContainerSlot'));
 const content_slot_fill = (EditorContentSlotFill);
;
const slotName = '__experimentalMainDashboardButton';
const useHasBackButton = () => {
  const fills = (0,external_wp_components_namespaceObject.__experimentalUseSlotFills)(slotName);
  return Boolean(fills && fills.length);
};
const {
  Fill: back_button_Fill,
  Slot: back_button_Slot
} = (0,external_wp_components_namespaceObject.createSlotFill)(slotName);
const BackButton = back_button_Fill;
const BackButtonSlot = () => {
  const fills = (0,external_wp_components_namespaceObject.__experimentalUseSlotFills)(slotName);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(back_button_Slot, {
    bubblesVirtually: true,
    fillProps: {
      length: !fills ? 0 : fills.length
    }
  });
};
BackButton.Slot = BackButtonSlot;
 const back_button = (BackButton);
;
const comment = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M18 4H6c-1.1 0-2 .9-2 2v12.9c0 .6.5 1.1 1.1 1.1.3 0 .5-.1.8-.3L8.5 17H18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm.5 11c0 .3-.2.5-.5.5H7.9l-2.4 2.4V6c0-.3.2-.5.5-.5h12c.3 0 .5.2.5.5v9z"
  })
});
 const library_comment = (comment);
;
const collabHistorySidebarName = 'edit-post/collab-history-sidebar';
const collabSidebarName = 'edit-post/collab-sidebar';
;
const moreVertical = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z"
  })
});
 const more_vertical = (moreVertical);
;
function CommentAuthorInfo({
  avatar,
  name,
  date
}) {
  const dateSettings = (0,external_wp_date_namespaceObject.getSettings)();
  const [dateTimeFormat = dateSettings.formats.time] = (0,external_wp_coreData_namespaceObject.useEntityProp)('root', 'site', 'time_format');
  const {
    currentUserAvatar,
    currentUserName
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _userData$avatar_urls;
    const userData = select(external_wp_coreData_namespaceObject.store).getCurrentUser();
    const {
      getSettings
    } = select(external_wp_blockEditor_namespaceObject.store);
    const {
      __experimentalDiscussionSettings
    } = getSettings();
    const defaultAvatar = __experimentalDiscussionSettings?.avatarURL;
    return {
      currentUserAvatar: (_userData$avatar_urls = userData?.avatar_urls[48]) !== null && _userData$avatar_urls !== void 0 ? _userData$avatar_urls : defaultAvatar,
      currentUserName: userData?.name
    };
  }, []);
  const currentDate = new Date();
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("img", {
      src: avatar !== null && avatar !== void 0 ? avatar : currentUserAvatar,
      className: "editor-collab-sidebar-panel__user-avatar"
      ,
      alt: (0,external_wp_i18n_namespaceObject.__)('User avatar'),
      width: 32,
      height: 32
    }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      spacing: "0",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
        className: "editor-collab-sidebar-panel__user-name",
        children: name !== null && name !== void 0 ? name : currentUserName
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("time", {
        dateTime: (0,external_wp_date_namespaceObject.dateI18n)('c', date !== null && date !== void 0 ? date : currentDate),
        className: "editor-collab-sidebar-panel__user-time",
        children: (0,external_wp_date_namespaceObject.dateI18n)(dateTimeFormat, date !== null && date !== void 0 ? date : currentDate)
      })]
    })]
  });
}
 const comment_author_info = (CommentAuthorInfo);
;
function sanitizeCommentString(str) {
  return str.trim();
}
function getCommentIdsFromBlocks(blocks) {
  const extractCommentIds = items => {
    return items.reduce((commentIds, block) => {
      if (block.attributes && block.attributes.blockCommentId && !commentIds.includes(block.attributes.blockCommentId)) {
        commentIds.push(block.attributes.blockCommentId);
      }
      if (block.innerBlocks && block.innerBlocks.length > 0) {
        const innerCommentIds = extractCommentIds(block.innerBlocks);
        commentIds.push(...innerCommentIds);
      }
      return commentIds;
    }, []);
  };
  return extractCommentIds(blocks);
}
;
function CommentForm({
  onSubmit,
  onCancel,
  thread,
  submitButtonText
}) {
  var _thread$content$raw;
  const [inputComment, setInputComment] = (0,external_wp_element_namespaceObject.useState)((_thread$content$raw = thread?.content?.raw) !== null && _thread$content$raw !== void 0 ? _thread$content$raw : '');
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextareaControl, {
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true,
      value: inputComment !== null && inputComment !== void 0 ? inputComment : '',
      onChange: setInputComment
    }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
      alignment: "left",
      spacing: "3",
      justify: "flex-start",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        __next40pxDefaultSize: true,
        accessibleWhenDisabled: true,
        variant: "primary",
        onClick: () => {
          onSubmit(inputComment);
          setInputComment('');
        },
        disabled: 0 === sanitizeCommentString(inputComment).length,
        text: submitButtonText
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        __next40pxDefaultSize: true,
        variant: "tertiary",
        onClick: onCancel,
        text: (0,external_wp_i18n_namespaceObject._x)('Cancel', 'Cancel comment button')
      })]
    })]
  });
}
 const comment_form = (CommentForm);
;
function Comments({
  threads,
  onEditComment,
  onAddReply,
  onCommentDelete,
  onCommentResolve,
  showCommentBoard,
  setShowCommentBoard
}) {
  const {
    blockCommentId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getBlockAttributes,
      getSelectedBlockClientId
    } = select(external_wp_blockEditor_namespaceObject.store);
    const _clientId = getSelectedBlockClientId();
    return {
      blockCommentId: _clientId ? getBlockAttributes(_clientId)?.blockCommentId : null
    };
  }, []);
  const [focusThread, setFocusThread] = (0,external_wp_element_namespaceObject.useState)(showCommentBoard && blockCommentId ? blockCommentId : null);
  const clearThreadFocus = () => {
    setFocusThread(null);
    setShowCommentBoard(false);
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [
    (!Array.isArray(threads) || threads.length === 0) && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalVStack, {
      alignment: "left",
      className: "editor-collab-sidebar-panel__thread",
      justify: "flex-start",
      spacing: "3",
      children:
      (0,external_wp_i18n_namespaceObject.__)('No comments available')
    }), Array.isArray(threads) && threads.length > 0 && threads.map(thread => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalVStack, {
      className: dist_clsx('editor-collab-sidebar-panel__thread', {
        'editor-collab-sidebar-panel__active-thread': blockCommentId && blockCommentId === thread.id,
        'editor-collab-sidebar-panel__focus-thread': focusThread && focusThread === thread.id
      }),
      id: thread.id,
      spacing: "3",
      onClick: () => setFocusThread(thread.id),
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(Thread, {
        thread: thread,
        onAddReply: onAddReply,
        onCommentDelete: onCommentDelete,
        onCommentResolve: onCommentResolve,
        onEditComment: onEditComment,
        isFocused: focusThread === thread.id,
        clearThreadFocus: clearThreadFocus
      })
    }, thread.id))]
  });
}
function Thread({
  thread,
  onEditComment,
  onAddReply,
  onCommentDelete,
  onCommentResolve,
  isFocused,
  clearThreadFocus
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(CommentBoard, {
      thread: thread,
      onResolve: onCommentResolve,
      onEdit: onEditComment,
      onDelete: onCommentDelete,
      status: thread.status
    }), 0 < thread?.reply?.length && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [!isFocused && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalVStack, {
        className: "editor-collab-sidebar-panel__show-more-reply",
        children: (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject._x)('%s more replies..', 'Show replies button'), thread?.reply?.length)
      }), isFocused && thread.reply.map(reply => (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
        className: "editor-collab-sidebar-panel__child-thread",
        id: reply.id,
        spacing: "2",
        children: ['approved' !== thread.status && (0,external_ReactJSXRuntime_namespaceObject.jsx)(CommentBoard, {
          thread: reply,
          onEdit: onEditComment,
          onDelete: onCommentDelete
        }), 'approved' === thread.status && (0,external_ReactJSXRuntime_namespaceObject.jsx)(CommentBoard, {
          thread: reply
        })]
      }, reply.id))]
    }), 'approved' !== thread.status && isFocused && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      className: "editor-collab-sidebar-panel__child-thread",
      spacing: "2",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalHStack, {
        alignment: "left",
        spacing: "3",
        justify: "flex-start",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(comment_author_info, {})
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalVStack, {
        spacing: "3",
        className: "editor-collab-sidebar-panel__comment-field",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(comment_form, {
          onSubmit: inputComment => {
            onAddReply(inputComment, thread.id);
          },
          onCancel: event => {
            event.stopPropagation(); 
            clearThreadFocus();
          },
          submitButtonText: (0,external_wp_i18n_namespaceObject._x)('Reply', 'Add reply comment')
        })
      })]
    })]
  });
}
const CommentBoard = ({
  thread,
  onResolve,
  onEdit,
  onDelete,
  status
}) => {
  const [actionState, setActionState] = (0,external_wp_element_namespaceObject.useState)(false);
  const [showConfirmDialog, setShowConfirmDialog] = (0,external_wp_element_namespaceObject.useState)(false);
  const handleConfirmDelete = () => {
    onDelete(thread.id);
    setActionState(false);
    setShowConfirmDialog(false);
  };
  const handleConfirmResolve = () => {
    onResolve(thread.id);
    setActionState(false);
    setShowConfirmDialog(false);
  };
  const handleCancel = () => {
    setActionState(false);
    setShowConfirmDialog(false);
  };
  const actions = [onEdit && {
    title: (0,external_wp_i18n_namespaceObject._x)('Edit', 'Edit comment'),
    onClick: () => {
      setActionState('edit');
    }
  }, onDelete && {
    title: (0,external_wp_i18n_namespaceObject._x)('Delete', 'Delete comment'),
    onClick: () => {
      setActionState('delete');
      setShowConfirmDialog(true);
    }
  }];
  const moreActions = actions.filter(item => item?.onClick);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
      alignment: "left",
      spacing: "3",
      justify: "flex-start",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(comment_author_info, {
        avatar: thread?.author_avatar_urls?.[48],
        name: thread?.author_name,
        date: thread?.date
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("span", {
        className: "editor-collab-sidebar-panel__comment-status",
        children: [status !== 'approved' && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
          alignment: "right",
          justify: "flex-end",
          spacing: "0",
          children: [0 === thread?.parent && onResolve && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            label: (0,external_wp_i18n_namespaceObject._x)('Resolve', 'Mark comment as resolved'),
            __next40pxDefaultSize: true,
            icon: library_published,
            onClick: () => {
              setActionState('resolve');
              setShowConfirmDialog(true);
            },
            showTooltip: true
          }), 0 < moreActions.length && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.DropdownMenu, {
            icon: more_vertical,
            label: (0,external_wp_i18n_namespaceObject._x)('Select an action', 'Select comment action'),
            className: "editor-collab-sidebar-panel__comment-dropdown-menu",
            controls: moreActions
          })]
        }), status === 'approved' &&
        (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Tooltip, {
          text: (0,external_wp_i18n_namespaceObject.__)('Resolved'),
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(icon, {
            icon: library_check
          })
        })]
      })]
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalHStack, {
      alignment: "left",
      spacing: "3",
      justify: "flex-start",
      className: "editor-collab-sidebar-panel__user-comment",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
        spacing: "3",
        className: "editor-collab-sidebar-panel__comment-field",
        children: ['edit' === actionState && (0,external_ReactJSXRuntime_namespaceObject.jsx)(comment_form, {
          onSubmit: value => {
            onEdit(thread.id, value);
            setActionState(false);
          },
          onCancel: () => handleCancel(),
          thread: thread,
          submitButtonText: (0,external_wp_i18n_namespaceObject._x)('Update', 'verb')
        }), 'edit' !== actionState && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_element_namespaceObject.RawHTML, {
          children: thread?.content?.raw
        })]
      })
    }), 'resolve' === actionState && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalConfirmDialog, {
      isOpen: showConfirmDialog,
      onConfirm: handleConfirmResolve,
      onCancel: handleCancel,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      children:
      (0,external_wp_i18n_namespaceObject.__)('Are you sure you want to mark this comment as resolved?')
    }), 'delete' === actionState && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalConfirmDialog, {
      isOpen: showConfirmDialog,
      onConfirm: handleConfirmDelete,
      onCancel: handleCancel,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      children:
      (0,external_wp_i18n_namespaceObject.__)('Are you sure you want to delete this comment?')
    })]
  });
};
;
function AddComment({
  onSubmit,
  showCommentBoard,
  setShowCommentBoard
}) {
  const {
    clientId,
    blockCommentId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getSelectedBlock
    } = select(external_wp_blockEditor_namespaceObject.store);
    const selectedBlock = getSelectedBlock();
    return {
      clientId: selectedBlock?.clientId,
      blockCommentId: selectedBlock?.attributes?.blockCommentId
    };
  });
  if (!showCommentBoard || !clientId || undefined !== blockCommentId) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
    spacing: "3",
    className: "editor-collab-sidebar-panel__thread editor-collab-sidebar-panel__active-thread editor-collab-sidebar-panel__focus-thread",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalHStack, {
      alignment: "left",
      spacing: "3",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(comment_author_info, {})
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(comment_form, {
      onSubmit: inputComment => {
        onSubmit(inputComment);
      },
      onCancel: () => {
        setShowCommentBoard(false);
      },
      submitButtonText: (0,external_wp_i18n_namespaceObject._x)('Comment', 'Add comment button')
    })]
  });
}
;
const {
  CommentIconSlotFill
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
const AddCommentButton = ({
  onClick
}) => {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(CommentIconSlotFill.Fill, {
    children: ({
      onClose
    }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
      icon: library_comment,
      onClick: () => {
        onClick();
        onClose();
      },
      "aria-haspopup": "dialog",
      children: (0,external_wp_i18n_namespaceObject._x)('Comment', 'Add comment button')
    })
  });
};
 const comment_button = (AddCommentButton);
;
const {
  CommentIconToolbarSlotFill
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
const AddCommentToolbarButton = ({
  onClick
}) => {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(CommentIconToolbarSlotFill.Fill, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToolbarButton, {
      accessibleWhenDisabled: true,
      icon: library_comment,
      label: (0,external_wp_i18n_namespaceObject._x)('Comment', 'View comment'),
      onClick: onClick
    })
  });
};
 const comment_button_toolbar = (AddCommentToolbarButton);
;
const modifyBlockCommentAttributes = settings => {
  if (!settings.attributes.blockCommentId) {
    settings.attributes = {
      ...settings.attributes,
      blockCommentId: {
        type: 'number'
      }
    };
  }
  return settings;
};
(0,external_wp_hooks_namespaceObject.addFilter)('blocks.registerBlockType', 'block-comment/modify-core-block-attributes', modifyBlockCommentAttributes);
function CollabSidebarContent({
  showCommentBoard,
  setShowCommentBoard,
  styles,
  comments
}) {
  const {
    createNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const {
    saveEntityRecord,
    deleteEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const {
    getEntityRecord
  } = (0,external_wp_data_namespaceObject.resolveSelect)(external_wp_coreData_namespaceObject.store);
  const {
    postId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostId
    } = select(store_store);
    const _postId = getCurrentPostId();
    return {
      postId: _postId
    };
  }, []);
  const {
    getSelectedBlockClientId
  } = (0,external_wp_data_namespaceObject.useSelect)(external_wp_blockEditor_namespaceObject.store);
  const {
    updateBlockAttributes
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  const addNewComment = async (comment, parentCommentId) => {
    const args = {
      post: postId,
      content: comment,
      comment_type: 'block_comment',
      comment_approved: 0
    };
    const updatedArgs = {
      ...args,
      ...(parentCommentId ? {
        parent: parentCommentId
      } : {})
    };
    const savedRecord = await saveEntityRecord('root', 'comment', updatedArgs);
    if (savedRecord) {
      if (!parentCommentId) {
        updateBlockAttributes(getSelectedBlockClientId(), {
          blockCommentId: savedRecord?.id
        });
      }
      createNotice('snackbar', parentCommentId ?
      (0,external_wp_i18n_namespaceObject.__)('Reply added successfully.') :
      (0,external_wp_i18n_namespaceObject.__)('Comment added successfully.'), {
        type: 'snackbar',
        isDismissible: true
      });
    } else {
      onError();
    }
  };
  const onCommentResolve = async commentId => {
    const savedRecord = await saveEntityRecord('root', 'comment', {
      id: commentId,
      status: 'approved'
    });
    if (savedRecord) {
      createNotice('snackbar', (0,external_wp_i18n_namespaceObject.__)('Comment marked as resolved.'), {
        type: 'snackbar',
        isDismissible: true
      });
    } else {
      onError();
    }
  };
  const onEditComment = async (commentId, comment) => {
    const savedRecord = await saveEntityRecord('root', 'comment', {
      id: commentId,
      content: comment
    });
    if (savedRecord) {
      createNotice('snackbar',
      (0,external_wp_i18n_namespaceObject.__)('Comment edited successfully.'), {
        type: 'snackbar',
        isDismissible: true
      });
    } else {
      onError();
    }
  };
  const onError = () => {
    createNotice('error',
    (0,external_wp_i18n_namespaceObject.__)('Something went wrong. Please try publishing the post, or you may have already submitted your comment earlier.'), {
      isDismissible: true
    });
  };
  const onCommentDelete = async commentId => {
    const childComment = await getEntityRecord('root', 'comment', commentId);
    await deleteEntityRecord('root', 'comment', commentId);
    if (childComment && !childComment.parent) {
      updateBlockAttributes(getSelectedBlockClientId(), {
        blockCommentId: undefined
      });
    }
    createNotice('snackbar',
    (0,external_wp_i18n_namespaceObject.__)('Comment deleted successfully.'), {
      type: 'snackbar',
      isDismissible: true
    });
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "editor-collab-sidebar-panel",
    style: styles,
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(AddComment, {
      onSubmit: addNewComment,
      showCommentBoard: showCommentBoard,
      setShowCommentBoard: setShowCommentBoard
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(Comments, {
      threads: comments,
      onEditComment: onEditComment,
      onAddReply: addNewComment,
      onCommentDelete: onCommentDelete,
      onCommentResolve: onCommentResolve,
      showCommentBoard: showCommentBoard,
      setShowCommentBoard: setShowCommentBoard
    }, getSelectedBlockClientId())]
  });
}
function CollabSidebar() {
  const [showCommentBoard, setShowCommentBoard] = (0,external_wp_element_namespaceObject.useState)(false);
  const {
    enableComplementaryArea
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const {
    getActiveComplementaryArea
  } = (0,external_wp_data_namespaceObject.useSelect)(store);
  const {
    postId,
    postType,
    postStatus,
    threads
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostId,
      getCurrentPostType
    } = select(store_store);
    const _postId = getCurrentPostId();
    const data = !!_postId && typeof _postId === 'number' ? select(external_wp_coreData_namespaceObject.store).getEntityRecords('root', 'comment', {
      post: _postId,
      type: 'block_comment',
      status: 'any',
      per_page: 100
    }) : null;
    return {
      postId: _postId,
      postType: getCurrentPostType(),
      postStatus: select(store_store).getEditedPostAttribute('status'),
      threads: data
    };
  }, []);
  const {
    blockCommentId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getBlockAttributes,
      getSelectedBlockClientId
    } = select(external_wp_blockEditor_namespaceObject.store);
    const _clientId = getSelectedBlockClientId();
    return {
      blockCommentId: _clientId ? getBlockAttributes(_clientId)?.blockCommentId : null
    };
  }, []);
  const openCollabBoard = () => {
    setShowCommentBoard(true);
    enableComplementaryArea('core', 'edit-post/collab-sidebar');
  };
  const [blocks] = (0,external_wp_coreData_namespaceObject.useEntityBlockEditor)('postType', postType, {
    id: postId
  });
  const {
    resultComments,
    sortedThreads
  } = (0,external_wp_element_namespaceObject.useMemo)(() => {
    const compare = {};
    const result = [];
    const filteredComments = (threads !== null && threads !== void 0 ? threads : []).filter(comment => comment.status !== 'trash');
    filteredComments.forEach(item => {
      compare[item.id] = {
        ...item,
        reply: []
      };
    });
    filteredComments.forEach(item => {
      if (item.parent === 0) {
        result.push(compare[item.id]);
      } else if (compare[item.parent]) {
        compare[item.parent].reply.push(compare[item.id]);
      }
    });
    if (0 === result?.length) {
      return {
        resultComments: [],
        sortedThreads: []
      };
    }
    const updatedResult = result.map(item => ({
      ...item,
      reply: [...item.reply].reverse()
    }));
    const blockCommentIds = getCommentIdsFromBlocks(blocks);
    const threadIdMap = new Map(updatedResult.map(thread => [thread.id, thread]));
    const sortedComments = blockCommentIds.map(id => threadIdMap.get(id)).filter(thread => thread !== undefined);
    return {
      resultComments: updatedResult,
      sortedThreads: sortedComments
    };
  }, [threads, blocks]);
  const {
    merged: GlobalStyles
  } = useGlobalStylesContext();
  const backgroundColor = GlobalStyles?.styles?.color?.background;
  if (0 < resultComments.length) {
    const unsubscribe = (0,external_wp_data_namespaceObject.subscribe)(() => {
      const activeSidebar = getActiveComplementaryArea('core');
      if (!activeSidebar) {
        enableComplementaryArea('core', collabSidebarName);
        unsubscribe();
      }
    });
  }
  if (postStatus === 'publish') {
    return null; 
  }
  const AddCommentComponent = blockCommentId ? comment_button_toolbar : comment_button;
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(AddCommentComponent, {
      onClick: openCollabBoard
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PluginSidebar, {
      identifier: collabHistorySidebarName
      ,
      title: (0,external_wp_i18n_namespaceObject.__)('Comments'),
      icon: library_comment,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(CollabSidebarContent, {
        comments: resultComments,
        showCommentBoard: showCommentBoard,
        setShowCommentBoard: setShowCommentBoard
      })
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PluginSidebar, {
      isPinnable: false,
      header: false,
      identifier: collabSidebarName,
      className: "editor-collab-sidebar",
      headerClassName: "editor-collab-sidebar__header",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(CollabSidebarContent, {
        comments: sortedThreads,
        showCommentBoard: showCommentBoard,
        setShowCommentBoard: setShowCommentBoard,
        styles: {
          backgroundColor
        }
      })
    })]
  });
}
;
const next = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M6.6 6L5.4 7l4.5 5-4.5 5 1.1 1 5.5-6-5.4-6zm6 0l-1.1 1 4.5 5-4.5 5 1.1 1 5.5-6-5.5-6z"
  })
});
 const library_next = (next);
;
const previous = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M11.6 7l-1.1-1L5 12l5.5 6 1.1-1L7 12l4.6-5zm6 0l-1.1-1-5.5 6 5.5 6 1.1-1-4.6-5 4.6-5z"
  })
});
 const library_previous = (previous);
;
const {
  useHasBlockToolbar
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
function CollapsibleBlockToolbar({
  isCollapsed,
  onToggle
}) {
  const {
    blockSelectionStart
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return {
      blockSelectionStart: select(external_wp_blockEditor_namespaceObject.store).getBlockSelectionStart()
    };
  }, []);
  const hasBlockToolbar = useHasBlockToolbar();
  const hasBlockSelection = !!blockSelectionStart;
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (blockSelectionStart) {
      onToggle(false);
    }
  }, [blockSelectionStart, onToggle]);
  if (!hasBlockToolbar) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: dist_clsx('editor-collapsible-block-toolbar', {
        'is-collapsed': isCollapsed || !hasBlockSelection
      }),
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockToolbar, {
        hideDragHandle: true
      })
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Popover.Slot, {
      name: "block-toolbar"
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
      className: "editor-collapsible-block-toolbar__toggle",
      icon: isCollapsed ? library_next : library_previous,
      onClick: () => {
        onToggle(!isCollapsed);
      },
      label: isCollapsed ? (0,external_wp_i18n_namespaceObject.__)('Show block tools') : (0,external_wp_i18n_namespaceObject.__)('Hide block tools'),
      size: "compact"
    })]
  });
}
;
const plus = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z"
  })
});
 const library_plus = (plus);
;
function DocumentTools({
  className,
  disableBlockTools = false
}) {
  const {
    setIsInserterOpened,
    setIsListViewOpened
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    isDistractionFree,
    isInserterOpened,
    isListViewOpen,
    listViewShortcut,
    inserterSidebarToggleRef,
    listViewToggleRef,
    showIconLabels,
    showTools
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      get
    } = select(external_wp_preferences_namespaceObject.store);
    const {
      isListViewOpened,
      getEditorMode,
      getInserterSidebarToggleRef,
      getListViewToggleRef,
      getRenderingMode,
      getCurrentPostType
    } = unlock(select(store_store));
    const {
      getShortcutRepresentation
    } = select(external_wp_keyboardShortcuts_namespaceObject.store);
    return {
      isInserterOpened: select(store_store).isInserterOpened(),
      isListViewOpen: isListViewOpened(),
      listViewShortcut: getShortcutRepresentation('core/editor/toggle-list-view'),
      inserterSidebarToggleRef: getInserterSidebarToggleRef(),
      listViewToggleRef: getListViewToggleRef(),
      showIconLabels: get('core', 'showIconLabels'),
      isDistractionFree: get('core', 'distractionFree'),
      isVisualMode: getEditorMode() === 'visual',
      showTools: !!window?.__experimentalEditorWriteMode && (getRenderingMode() !== 'post-only' || getCurrentPostType() === 'wp_template')
    };
  }, []);
  const preventDefault = event => {
    if (isInserterOpened) {
      event.preventDefault();
    }
  };
  const isLargeViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('medium');
  const isWideViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('wide');
  const toolbarAriaLabel = (0,external_wp_i18n_namespaceObject.__)('Document tools');
  const toggleListView = (0,external_wp_element_namespaceObject.useCallback)(() => setIsListViewOpened(!isListViewOpen), [setIsListViewOpened, isListViewOpen]);
  const toggleInserter = (0,external_wp_element_namespaceObject.useCallback)(() => setIsInserterOpened(!isInserterOpened), [isInserterOpened, setIsInserterOpened]);
  const longLabel = (0,external_wp_i18n_namespaceObject._x)('Block Inserter', 'Generic label for block inserter button');
  const shortLabel = !isInserterOpened ? (0,external_wp_i18n_namespaceObject.__)('Add') : (0,external_wp_i18n_namespaceObject.__)('Close');
  return (
    (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.NavigableToolbar, {
      className: dist_clsx('editor-document-tools', 'edit-post-header-toolbar', className),
      "aria-label": toolbarAriaLabel,
      variant: "unstyled",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        className: "editor-document-tools__left",
        children: [!isDistractionFree && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToolbarButton, {
          ref: inserterSidebarToggleRef,
          className: "editor-document-tools__inserter-toggle",
          variant: "primary",
          isPressed: isInserterOpened,
          onMouseDown: preventDefault,
          onClick: toggleInserter,
          disabled: disableBlockTools,
          icon: library_plus,
          label: showIconLabels ? shortLabel : longLabel,
          showTooltip: !showIconLabels,
          "aria-expanded": isInserterOpened
        }), (isWideViewport || !showIconLabels) && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
          children: [showTools && isLargeViewport && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToolbarItem, {
            as: external_wp_blockEditor_namespaceObject.ToolSelector,
            showTooltip: !showIconLabels,
            variant: showIconLabels ? 'tertiary' : undefined,
            disabled: disableBlockTools,
            size: "compact"
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToolbarItem, {
            as: editor_history_undo,
            showTooltip: !showIconLabels,
            variant: showIconLabels ? 'tertiary' : undefined,
            size: "compact"
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToolbarItem, {
            as: editor_history_redo,
            showTooltip: !showIconLabels,
            variant: showIconLabels ? 'tertiary' : undefined,
            size: "compact"
          }), !isDistractionFree && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ToolbarButton, {
            className: "editor-document-tools__document-overview-toggle",
            icon: list_view,
            disabled: disableBlockTools,
            isPressed: isListViewOpen
            ,
            label: (0,external_wp_i18n_namespaceObject.__)('Document Overview'),
            onClick: toggleListView,
            shortcut: listViewShortcut,
            showTooltip: !showIconLabels,
            variant: showIconLabels ? 'tertiary' : undefined,
            "aria-expanded": isListViewOpen,
            ref: listViewToggleRef
          })]
        })]
      })
    })
  );
}
 const document_tools = (DocumentTools);
;
function CopyContentMenuItem() {
  const {
    createNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  const {
    getCurrentPostId,
    getCurrentPostType
  } = (0,external_wp_data_namespaceObject.useSelect)(store_store);
  const {
    getEditedEntityRecord
  } = (0,external_wp_data_namespaceObject.useSelect)(external_wp_coreData_namespaceObject.store);
  function getText() {
    const record = getEditedEntityRecord('postType', getCurrentPostType(), getCurrentPostId());
    if (!record) {
      return '';
    }
    if (typeof record.content === 'function') {
      return record.content(record);
    } else if (record.blocks) {
      return (0,external_wp_blocks_namespaceObject.__unstableSerializeAndClean)(record.blocks);
    } else if (record.content) {
      return record.content;
    }
  }
  function onSuccess() {
    createNotice('info', (0,external_wp_i18n_namespaceObject.__)('All content copied.'), {
      isDismissible: true,
      type: 'snackbar'
    });
  }
  const ref = (0,external_wp_compose_namespaceObject.useCopyToClipboard)(getText, onSuccess);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
    ref: ref,
    children: (0,external_wp_i18n_namespaceObject.__)('Copy all blocks')
  });
}
;
const MODES = [{
  value: 'visual',
  label: (0,external_wp_i18n_namespaceObject.__)('Visual editor')
}, {
  value: 'text',
  label: (0,external_wp_i18n_namespaceObject.__)('Code editor')
}];
function ModeSwitcher() {
  const {
    shortcut,
    isRichEditingEnabled,
    isCodeEditingEnabled,
    mode
  } = (0,external_wp_data_namespaceObject.useSelect)(select => ({
    shortcut: select(external_wp_keyboardShortcuts_namespaceObject.store).getShortcutRepresentation('core/editor/toggle-mode'),
    isRichEditingEnabled: select(store_store).getEditorSettings().richEditingEnabled,
    isCodeEditingEnabled: select(store_store).getEditorSettings().codeEditingEnabled,
    mode: select(store_store).getEditorMode()
  }), []);
  const {
    switchEditorMode
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  let selectedMode = mode;
  if (!isRichEditingEnabled && mode === 'visual') {
    selectedMode = 'text';
  }
  if (!isCodeEditingEnabled && mode === 'text') {
    selectedMode = 'visual';
  }
  const choices = MODES.map(choice => {
    if (!isCodeEditingEnabled && choice.value === 'text') {
      choice = {
        ...choice,
        disabled: true
      };
    }
    if (!isRichEditingEnabled && choice.value === 'visual') {
      choice = {
        ...choice,
        disabled: true,
        info: (0,external_wp_i18n_namespaceObject.__)('You can enable the visual editor in your profile settings.')
      };
    }
    if (choice.value !== selectedMode && !choice.disabled) {
      return {
        ...choice,
        shortcut
      };
    }
    return choice;
  });
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuGroup, {
    label: (0,external_wp_i18n_namespaceObject.__)('Editor'),
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItemsChoice, {
      choices: choices,
      value: selectedMode,
      onSelect: switchEditorMode
    })
  });
}
 const mode_switcher = (ModeSwitcher);
;
const {
  Fill: ToolsMoreMenuGroup,
  Slot: tools_more_menu_group_Slot
} = (0,external_wp_components_namespaceObject.createSlotFill)('ToolsMoreMenuGroup');
ToolsMoreMenuGroup.Slot = ({
  fillProps
}) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(tools_more_menu_group_Slot, {
  fillProps: fillProps
});
 const tools_more_menu_group = (ToolsMoreMenuGroup);
;
const {
  Fill: ViewMoreMenuGroup,
  Slot: view_more_menu_group_Slot
} = (0,external_wp_components_namespaceObject.createSlotFill)(external_wp_element_namespaceObject.Platform.OS === 'web' ? Symbol('ViewMoreMenuGroup') : 'ViewMoreMenuGroup');
ViewMoreMenuGroup.Slot = ({
  fillProps
}) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(view_more_menu_group_Slot, {
  fillProps: fillProps
});
 const view_more_menu_group = (ViewMoreMenuGroup);
;
function MoreMenu() {
  const {
    openModal
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const {
    set: setPreference
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_preferences_namespaceObject.store);
  const {
    toggleDistractionFree
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const showIconLabels = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_preferences_namespaceObject.store).get('core', 'showIconLabels'), []);
  const turnOffDistractionFree = () => {
    setPreference('core', 'distractionFree', false);
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.DropdownMenu, {
      icon: more_vertical,
      label: (0,external_wp_i18n_namespaceObject.__)('Options'),
      popoverProps: {
        placement: 'bottom-end',
        className: 'more-menu-dropdown__content'
      },
      toggleProps: {
        showTooltip: !showIconLabels,
        ...(showIconLabels && {
          variant: 'tertiary'
        }),
        tooltipPosition: 'bottom',
        size: 'compact'
      },
      children: ({
        onClose
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.MenuGroup, {
          label: (0,external_wp_i18n_namespaceObject._x)('View', 'noun'),
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_preferences_namespaceObject.PreferenceToggleMenuItem, {
            scope: "core",
            name: "fixedToolbar",
            onToggle: turnOffDistractionFree,
            label: (0,external_wp_i18n_namespaceObject.__)('Top toolbar'),
            info: (0,external_wp_i18n_namespaceObject.__)('Access all block and document tools in a single place'),
            messageActivated: (0,external_wp_i18n_namespaceObject.__)('Top toolbar activated.'),
            messageDeactivated: (0,external_wp_i18n_namespaceObject.__)('Top toolbar deactivated.')
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_preferences_namespaceObject.PreferenceToggleMenuItem, {
            scope: "core",
            name: "distractionFree",
            label: (0,external_wp_i18n_namespaceObject.__)('Distraction free'),
            info: (0,external_wp_i18n_namespaceObject.__)('Write with calmness'),
            handleToggling: false,
            onToggle: () => toggleDistractionFree({
              createNotice: false
            }),
            messageActivated: (0,external_wp_i18n_namespaceObject.__)('Distraction free mode activated.'),
            messageDeactivated: (0,external_wp_i18n_namespaceObject.__)('Distraction free mode deactivated.'),
            shortcut: external_wp_keycodes_namespaceObject.displayShortcut.primaryShift('\\')
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_preferences_namespaceObject.PreferenceToggleMenuItem, {
            scope: "core",
            name: "focusMode",
            label: (0,external_wp_i18n_namespaceObject.__)('Spotlight mode'),
            info: (0,external_wp_i18n_namespaceObject.__)('Focus on one block at a time'),
            messageActivated: (0,external_wp_i18n_namespaceObject.__)('Spotlight mode activated.'),
            messageDeactivated: (0,external_wp_i18n_namespaceObject.__)('Spotlight mode deactivated.')
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(view_more_menu_group.Slot, {
            fillProps: {
              onClose
            }
          })]
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(mode_switcher, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(action_item.Slot, {
          name: "core/plugin-more-menu",
          label: (0,external_wp_i18n_namespaceObject.__)('Plugins'),
          fillProps: {
            onClick: onClose
          }
        }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.MenuGroup, {
          label: (0,external_wp_i18n_namespaceObject.__)('Tools'),
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
            onClick: () => openModal('editor/keyboard-shortcut-help'),
            shortcut: external_wp_keycodes_namespaceObject.displayShortcut.access('h'),
            children: (0,external_wp_i18n_namespaceObject.__)('Keyboard shortcuts')
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(CopyContentMenuItem, {}), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.MenuItem, {
            icon: library_external,
            href: (0,external_wp_i18n_namespaceObject.__)('https://wordpress.org/documentation/article/wordpress-block-editor/'),
            target: "_blank",
            rel: "noopener noreferrer",
            children: [(0,external_wp_i18n_namespaceObject.__)('Help'), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.VisuallyHidden, {
              as: "span",
              children: 
              (0,external_wp_i18n_namespaceObject.__)('(opens in a new tab)')
            })]
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(tools_more_menu_group.Slot, {
            fillProps: {
              onClose
            }
          })]
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuGroup, {
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
            onClick: () => openModal('editor/preferences'),
            children: (0,external_wp_i18n_namespaceObject.__)('Preferences')
          })
        })]
      })
    })
  });
}
;
const IS_TOGGLE = 'toggle';
const IS_BUTTON = 'button';
function PostPublishButtonOrToggle({
  forceIsDirty,
  setEntitiesSavedStatesCallback
}) {
  let component;
  const isSmallerThanMediumViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('medium', '<');
  const {
    togglePublishSidebar
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    hasPublishAction,
    isBeingScheduled,
    isPending,
    isPublished,
    isPublishSidebarEnabled,
    isPublishSidebarOpened,
    isScheduled,
    postStatus,
    postStatusHasChanged
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$getCurrentPos;
    return {
      hasPublishAction: (_select$getCurrentPos = !!select(store_store).getCurrentPost()?._links?.['wp:action-publish']) !== null && _select$getCurrentPos !== void 0 ? _select$getCurrentPos : false,
      isBeingScheduled: select(store_store).isEditedPostBeingScheduled(),
      isPending: select(store_store).isCurrentPostPending(),
      isPublished: select(store_store).isCurrentPostPublished(),
      isPublishSidebarEnabled: select(store_store).isPublishSidebarEnabled(),
      isPublishSidebarOpened: select(store_store).isPublishSidebarOpened(),
      isScheduled: select(store_store).isCurrentPostScheduled(),
      postStatus: select(store_store).getEditedPostAttribute('status'),
      postStatusHasChanged: select(store_store).getPostEdits()?.status
    };
  }, []);
  if (isPublished || postStatusHasChanged && !['future', 'publish'].includes(postStatus) || isScheduled && isBeingScheduled || isPending && !hasPublishAction && !isSmallerThanMediumViewport) {
    component = IS_BUTTON;
  } else if (isSmallerThanMediumViewport || isPublishSidebarEnabled) {
    component = IS_TOGGLE;
  } else {
    component = IS_BUTTON;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_publish_button, {
    forceIsDirty: forceIsDirty,
    isOpen: isPublishSidebarOpened,
    isToggle: component === IS_TOGGLE,
    onToggle: togglePublishSidebar,
    setEntitiesSavedStatesCallback: setEntitiesSavedStatesCallback
  });
}
;
function PostViewLink() {
  const {
    hasLoaded,
    permalink,
    isPublished,
    label,
    showIconLabels
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const postTypeSlug = select(store_store).getCurrentPostType();
    const postType = select(external_wp_coreData_namespaceObject.store).getPostType(postTypeSlug);
    const {
      get
    } = select(external_wp_preferences_namespaceObject.store);
    return {
      permalink: select(store_store).getPermalink(),
      isPublished: select(store_store).isCurrentPostPublished(),
      label: postType?.labels.view_item,
      hasLoaded: !!postType,
      showIconLabels: get('core', 'showIconLabels')
    };
  }, []);
  if (!isPublished || !permalink || !hasLoaded) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
    icon: library_external,
    label: label || (0,external_wp_i18n_namespaceObject.__)('View post'),
    href: permalink,
    target: "_blank",
    showTooltip: !showIconLabels,
    size: "compact"
  });
}
;
const desktop = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M20.5 16h-.7V8c0-1.1-.9-2-2-2H6.2c-1.1 0-2 .9-2 2v8h-.7c-.8 0-1.5.7-1.5 1.5h20c0-.8-.7-1.5-1.5-1.5zM5.7 8c0-.3.2-.5.5-.5h11.6c.3 0 .5.2.5.5v7.6H5.7V8z"
  })
});
 const library_desktop = (desktop);
;
const mobile = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M15 4H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm.5 14c0 .3-.2.5-.5.5H9c-.3 0-.5-.2-.5-.5V6c0-.3.2-.5.5-.5h6c.3 0 .5.2.5.5v12zm-4.5-.5h2V16h-2v1.5z"
  })
});
 const library_mobile = (mobile);
;
const tablet = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M17 4H7c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm.5 14c0 .3-.2.5-.5.5H7c-.3 0-.5-.2-.5-.5V6c0-.3.2-.5.5-.5h10c.3 0 .5.2.5.5v12zm-7.5-.5h4V16h-4v1.5z"
  })
});
 const library_tablet = (tablet);
;
function PreviewDropdown({
  forceIsAutosaveable,
  disabled
}) {
  const {
    deviceType,
    homeUrl,
    isTemplate,
    isViewable,
    showIconLabels,
    isTemplateHidden,
    templateId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _getPostType$viewable;
    const {
      getDeviceType,
      getCurrentPostType,
      getCurrentTemplateId
    } = select(store_store);
    const {
      getRenderingMode
    } = unlock(select(store_store));
    const {
      getEntityRecord,
      getPostType
    } = select(external_wp_coreData_namespaceObject.store);
    const {
      get
    } = select(external_wp_preferences_namespaceObject.store);
    const _currentPostType = getCurrentPostType();
    return {
      deviceType: getDeviceType(),
      homeUrl: getEntityRecord('root', '__unstableBase')?.home,
      isTemplate: _currentPostType === 'wp_template',
      isViewable: (_getPostType$viewable = getPostType(_currentPostType)?.viewable) !== null && _getPostType$viewable !== void 0 ? _getPostType$viewable : false,
      showIconLabels: get('core', 'showIconLabels'),
      isTemplateHidden: getRenderingMode() === 'post-only',
      templateId: getCurrentTemplateId()
    };
  }, []);
  const {
    setDeviceType,
    setRenderingMode,
    setDefaultRenderingMode
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(store_store));
  const {
    resetZoomLevel
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store));
  const handleDevicePreviewChange = newDeviceType => {
    setDeviceType(newDeviceType);
    resetZoomLevel();
  };
  const isMobile = (0,external_wp_compose_namespaceObject.useViewportMatch)('medium', '<');
  if (isMobile) {
    return null;
  }
  const popoverProps = {
    placement: 'bottom-end'
  };
  const toggleProps = {
    className: 'editor-preview-dropdown__toggle',
    iconPosition: 'right',
    size: 'compact',
    showTooltip: !showIconLabels,
    disabled,
    accessibleWhenDisabled: disabled
  };
  const menuProps = {
    'aria-label': (0,external_wp_i18n_namespaceObject.__)('View options')
  };
  const deviceIcons = {
    desktop: library_desktop,
    mobile: library_mobile,
    tablet: library_tablet
  };
  const choices = [{
    value: 'Desktop',
    label: (0,external_wp_i18n_namespaceObject.__)('Desktop'),
    icon: library_desktop
  }, {
    value: 'Tablet',
    label: (0,external_wp_i18n_namespaceObject.__)('Tablet'),
    icon: library_tablet
  }, {
    value: 'Mobile',
    label: (0,external_wp_i18n_namespaceObject.__)('Mobile'),
    icon: library_mobile
  }];
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.DropdownMenu, {
    className: dist_clsx('editor-preview-dropdown', `editor-preview-dropdown--${deviceType.toLowerCase()}`),
    popoverProps: popoverProps,
    toggleProps: toggleProps,
    menuProps: menuProps,
    icon: deviceIcons[deviceType.toLowerCase()],
    label: (0,external_wp_i18n_namespaceObject.__)('View'),
    disableOpenOnArrowDown: disabled,
    children: ({
      onClose
    }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuGroup, {
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItemsChoice, {
          choices: choices,
          value: deviceType,
          onSelect: handleDevicePreviewChange
        })
      }), isTemplate && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuGroup, {
        children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.MenuItem, {
          href: homeUrl,
          target: "_blank",
          icon: library_external,
          onClick: onClose,
          children: [(0,external_wp_i18n_namespaceObject.__)('View site'), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.VisuallyHidden, {
            as: "span",
            children: 
            (0,external_wp_i18n_namespaceObject.__)('(opens in a new tab)')
          })]
        })
      }), !isTemplate && !!templateId && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuGroup, {
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuItem, {
          icon: !isTemplateHidden ? library_check : undefined,
          isSelected: !isTemplateHidden,
          role: "menuitemcheckbox",
          onClick: () => {
            const newRenderingMode = isTemplateHidden ? 'template-locked' : 'post-only';
            setRenderingMode(newRenderingMode);
            setDefaultRenderingMode(newRenderingMode);
          },
          children: (0,external_wp_i18n_namespaceObject.__)('Show template')
        })
      }), isViewable && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.MenuGroup, {
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostPreviewButton, {
          className: "editor-preview-dropdown__button-external",
          role: "menuitem",
          forceIsAutosaveable: forceIsAutosaveable,
          "aria-label": (0,external_wp_i18n_namespaceObject.__)('Preview in new tab'),
          textContent: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
            children: [(0,external_wp_i18n_namespaceObject.__)('Preview in new tab'), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
              icon: library_external
            })]
          }),
          onPreview: onClose
        })
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(action_item.Slot, {
        name: "core/plugin-preview-menu",
        fillProps: {
          onClick: onClose
        }
      })]
    })
  });
}
;
const square = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    fill: "none",
    d: "M5.75 12.75V18.25H11.25M12.75 5.75H18.25V11.25",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "square"
  })
});
 const library_square = (square);
;
const ZoomOutToggle = ({
  disabled
}) => {
  const {
    isZoomOut,
    showIconLabels,
    isDistractionFree
  } = (0,external_wp_data_namespaceObject.useSelect)(select => ({
    isZoomOut: unlock(select(external_wp_blockEditor_namespaceObject.store)).isZoomOut(),
    showIconLabels: select(external_wp_preferences_namespaceObject.store).get('core', 'showIconLabels'),
    isDistractionFree: select(external_wp_preferences_namespaceObject.store).get('core', 'distractionFree')
  }));
  const {
    resetZoomLevel,
    setZoomLevel
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store));
  const {
    registerShortcut,
    unregisterShortcut
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_keyboardShortcuts_namespaceObject.store);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    registerShortcut({
      name: 'core/editor/zoom',
      category: 'global',
      description: (0,external_wp_i18n_namespaceObject.__)('Enter or exit zoom out.'),
      keyCombination: {
        modifier: (0,external_wp_keycodes_namespaceObject.isAppleOS)() ? 'primaryShift' : 'secondary',
        character: '0'
      }
    });
    return () => {
      unregisterShortcut('core/editor/zoom');
    };
  }, [registerShortcut, unregisterShortcut]);
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/editor/zoom', () => {
    if (isZoomOut) {
      resetZoomLevel();
    } else {
      setZoomLevel('auto-scaled');
    }
  }, {
    isDisabled: isDistractionFree
  });
  const handleZoomOut = () => {
    if (isZoomOut) {
      resetZoomLevel();
    } else {
      setZoomLevel('auto-scaled');
    }
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
    accessibleWhenDisabled: true,
    disabled: disabled,
    onClick: handleZoomOut,
    icon: library_square,
    label: (0,external_wp_i18n_namespaceObject.__)('Zoom Out'),
    isPressed: isZoomOut,
    size: "compact",
    showTooltip: !showIconLabels,
    className: "editor-zoom-out-toggle"
  });
};
 const zoom_out_toggle = (ZoomOutToggle);
;
const isBlockCommentExperimentEnabled = window?.__experimentalEnableBlockComment;
const toolbarVariations = {
  distractionFreeDisabled: {
    y: '-50px'
  },
  distractionFreeHover: {
    y: 0
  },
  distractionFreeHidden: {
    y: '-50px'
  },
  visible: {
    y: 0
  },
  hidden: {
    y: 0
  }
};
const backButtonVariations = {
  distractionFreeDisabled: {
    x: '-100%'
  },
  distractionFreeHover: {
    x: 0
  },
  distractionFreeHidden: {
    x: '-100%'
  },
  visible: {
    x: 0
  },
  hidden: {
    x: 0
  }
};
function header_Header({
  customSaveButton,
  forceIsDirty,
  forceDisableBlockTools,
  setEntitiesSavedStatesCallback,
  title
}) {
  const isWideViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('large');
  const isLargeViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('medium');
  const isTooNarrowForDocumentBar = (0,external_wp_compose_namespaceObject.useMediaQuery)('(max-width: 403px)');
  const {
    postType,
    isTextEditor,
    isPublishSidebarOpened,
    showIconLabels,
    hasFixedToolbar,
    hasBlockSelection,
    hasSectionRootClientId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      get: getPreference
    } = select(external_wp_preferences_namespaceObject.store);
    const {
      getEditorMode,
      getCurrentPostType,
      isPublishSidebarOpened: _isPublishSidebarOpened
    } = select(store_store);
    const {
      getBlockSelectionStart,
      getSectionRootClientId
    } = unlock(select(external_wp_blockEditor_namespaceObject.store));
    return {
      postType: getCurrentPostType(),
      isTextEditor: getEditorMode() === 'text',
      isPublishSidebarOpened: _isPublishSidebarOpened(),
      showIconLabels: getPreference('core', 'showIconLabels'),
      hasFixedToolbar: getPreference('core', 'fixedToolbar'),
      hasBlockSelection: !!getBlockSelectionStart(),
      hasSectionRootClientId: !!getSectionRootClientId()
    };
  }, []);
  const canBeZoomedOut = ['post', 'page', 'wp_template'].includes(postType) && hasSectionRootClientId;
  const disablePreviewOption = [NAVIGATION_POST_TYPE, TEMPLATE_PART_POST_TYPE, PATTERN_POST_TYPE].includes(postType) || forceDisableBlockTools;
  const [isBlockToolsCollapsed, setIsBlockToolsCollapsed] = (0,external_wp_element_namespaceObject.useState)(true);
  const hasCenter = !isTooNarrowForDocumentBar && (!hasFixedToolbar || hasFixedToolbar && (!hasBlockSelection || isBlockToolsCollapsed));
  const hasBackButton = useHasBackButton();
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "editor-header edit-post-header",
    children: [hasBackButton && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__unstableMotion.div, {
      className: "editor-header__back-button",
      variants: backButtonVariations,
      transition: {
        type: 'tween'
      },
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(back_button.Slot, {})
    }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__unstableMotion.div, {
      variants: toolbarVariations,
      className: "editor-header__toolbar",
      transition: {
        type: 'tween'
      },
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(document_tools, {
        disableBlockTools: forceDisableBlockTools || isTextEditor
      }), hasFixedToolbar && isLargeViewport && (0,external_ReactJSXRuntime_namespaceObject.jsx)(CollapsibleBlockToolbar, {
        isCollapsed: isBlockToolsCollapsed,
        onToggle: setIsBlockToolsCollapsed
      })]
    }), hasCenter && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__unstableMotion.div, {
      className: "editor-header__center",
      variants: toolbarVariations,
      transition: {
        type: 'tween'
      },
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(DocumentBar, {
        title: title
      })
    }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__unstableMotion.div, {
      variants: toolbarVariations,
      transition: {
        type: 'tween'
      },
      className: "editor-header__settings",
      children: [!customSaveButton && !isPublishSidebarOpened &&
      (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostSavedState, {
        forceIsDirty: forceIsDirty
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostViewLink, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreviewDropdown, {
        forceIsAutosaveable: forceIsDirty,
        disabled: disablePreviewOption
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostPreviewButton, {
        className: "editor-header__post-preview-button",
        forceIsAutosaveable: forceIsDirty
      }), isWideViewport && canBeZoomedOut && (0,external_ReactJSXRuntime_namespaceObject.jsx)(zoom_out_toggle, {
        disabled: forceDisableBlockTools
      }), (isWideViewport || !showIconLabels) && (0,external_ReactJSXRuntime_namespaceObject.jsx)(pinned_items.Slot, {
        scope: "core"
      }), !customSaveButton && (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostPublishButtonOrToggle, {
        forceIsDirty: forceIsDirty,
        setEntitiesSavedStatesCallback: setEntitiesSavedStatesCallback
      }), isBlockCommentExperimentEnabled ? (0,external_ReactJSXRuntime_namespaceObject.jsx)(CollabSidebar, {}) : undefined, customSaveButton, (0,external_ReactJSXRuntime_namespaceObject.jsx)(MoreMenu, {})]
    })]
  });
}
 const components_header = (header_Header);
;
const {
  PrivateInserterLibrary
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
function InserterSidebar() {
  const {
    blockSectionRootClientId,
    inserterSidebarToggleRef,
    inserter,
    showMostUsedBlocks,
    sidebarIsOpened
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getInserterSidebarToggleRef,
      getInserter,
      isPublishSidebarOpened
    } = unlock(select(store_store));
    const {
      getBlockRootClientId,
      isZoomOut,
      getSectionRootClientId
    } = unlock(select(external_wp_blockEditor_namespaceObject.store));
    const {
      get
    } = select(external_wp_preferences_namespaceObject.store);
    const {
      getActiveComplementaryArea
    } = select(store);
    const getBlockSectionRootClientId = () => {
      if (isZoomOut()) {
        const sectionRootClientId = getSectionRootClientId();
        if (sectionRootClientId) {
          return sectionRootClientId;
        }
      }
      return getBlockRootClientId();
    };
    return {
      inserterSidebarToggleRef: getInserterSidebarToggleRef(),
      inserter: getInserter(),
      showMostUsedBlocks: get('core', 'mostUsedBlocks'),
      blockSectionRootClientId: getBlockSectionRootClientId(),
      sidebarIsOpened: !!(getActiveComplementaryArea('core') || isPublishSidebarOpened())
    };
  }, []);
  const {
    setIsInserterOpened
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    disableComplementaryArea
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const isMobileViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('medium', '<');
  const libraryRef = (0,external_wp_element_namespaceObject.useRef)();
  const closeInserterSidebar = (0,external_wp_element_namespaceObject.useCallback)(() => {
    setIsInserterOpened(false);
    inserterSidebarToggleRef.current?.focus();
  }, [inserterSidebarToggleRef, setIsInserterOpened]);
  const closeOnEscape = (0,external_wp_element_namespaceObject.useCallback)(event => {
    if (event.keyCode === external_wp_keycodes_namespaceObject.ESCAPE && !event.defaultPrevented) {
      event.preventDefault();
      closeInserterSidebar();
    }
  }, [closeInserterSidebar]);
  const inserterContents = (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    className: "editor-inserter-sidebar__content",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PrivateInserterLibrary, {
      showMostUsedBlocks: showMostUsedBlocks,
      showInserterHelpPanel: true,
      shouldFocusBlock: isMobileViewport,
      rootClientId: blockSectionRootClientId,
      onSelect: inserter.onSelect,
      __experimentalInitialTab: inserter.tab,
      __experimentalInitialCategory: inserter.category,
      __experimentalFilterValue: inserter.filterValue,
      onPatternCategorySelection: sidebarIsOpened ? () => disableComplementaryArea('core') : undefined,
      ref: libraryRef,
      onClose: closeInserterSidebar
    })
  });
  return (
    (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      onKeyDown: closeOnEscape,
      className: "editor-inserter-sidebar",
      children: inserterContents
    })
  );
}
;
function ListViewOutline() {
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "editor-list-view-sidebar__outline",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
          children: (0,external_wp_i18n_namespaceObject.__)('Characters:')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(CharacterCount, {})
        })]
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
          children: (0,external_wp_i18n_namespaceObject.__)('Words:')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(WordCount, {})]
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
          children: (0,external_wp_i18n_namespaceObject.__)('Time to read:')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(TimeToRead, {})]
      })]
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(DocumentOutline, {})]
  });
}
;
const {
  TabbedSidebar
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
function ListViewSidebar() {
  const {
    setIsListViewOpened
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    getListViewToggleRef
  } = unlock((0,external_wp_data_namespaceObject.useSelect)(store_store));
  const focusOnMountRef = (0,external_wp_compose_namespaceObject.useFocusOnMount)('firstElement');
  const closeListView = (0,external_wp_element_namespaceObject.useCallback)(() => {
    setIsListViewOpened(false);
    getListViewToggleRef().current?.focus();
  }, [getListViewToggleRef, setIsListViewOpened]);
  const closeOnEscape = (0,external_wp_element_namespaceObject.useCallback)(event => {
    if (event.keyCode === external_wp_keycodes_namespaceObject.ESCAPE && !event.defaultPrevented) {
      event.preventDefault();
      closeListView();
    }
  }, [closeListView]);
  const [dropZoneElement, setDropZoneElement] = (0,external_wp_element_namespaceObject.useState)(null);
  const [tab, setTab] = (0,external_wp_element_namespaceObject.useState)('list-view');
  const sidebarRef = (0,external_wp_element_namespaceObject.useRef)();
  const tabsRef = (0,external_wp_element_namespaceObject.useRef)();
  const listViewRef = (0,external_wp_element_namespaceObject.useRef)();
  const listViewContainerRef = (0,external_wp_compose_namespaceObject.useMergeRefs)([focusOnMountRef, listViewRef, setDropZoneElement]);
  function handleSidebarFocus(currentTab) {
    const tabPanelFocus = external_wp_dom_namespaceObject.focus.tabbable.find(tabsRef.current)[0];
    if (currentTab === 'list-view') {
      const listViewApplicationFocus = external_wp_dom_namespaceObject.focus.tabbable.find(listViewRef.current)[0];
      const listViewFocusArea = sidebarRef.current.contains(listViewApplicationFocus) ? listViewApplicationFocus : tabPanelFocus;
      listViewFocusArea.focus();
    } else {
      tabPanelFocus.focus();
    }
  }
  const handleToggleListViewShortcut = (0,external_wp_element_namespaceObject.useCallback)(() => {
    if (sidebarRef.current.contains(sidebarRef.current.ownerDocument.activeElement)) {
      closeListView();
    } else {
      handleSidebarFocus(tab);
    }
  }, [closeListView, tab]);
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/editor/toggle-list-view', handleToggleListViewShortcut);
  return (
    (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "editor-list-view-sidebar",
      onKeyDown: closeOnEscape,
      ref: sidebarRef,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(TabbedSidebar, {
        tabs: [{
          name: 'list-view',
          title: (0,external_wp_i18n_namespaceObject._x)('List View', 'Post overview'),
          panel: (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
            className: "editor-list-view-sidebar__list-view-container",
            children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
              className: "editor-list-view-sidebar__list-view-panel-content",
              children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalListView, {
                dropZoneElement: dropZoneElement
              })
            })
          }),
          panelRef: listViewContainerRef
        }, {
          name: 'outline',
          title: (0,external_wp_i18n_namespaceObject._x)('Outline', 'Post overview'),
          panel: (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
            className: "editor-list-view-sidebar__list-view-container",
            children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(ListViewOutline, {})
          })
        }],
        onClose: closeListView,
        onSelect: tabName => setTab(tabName),
        defaultTabId: "list-view",
        ref: tabsRef,
        closeButtonLabel: (0,external_wp_i18n_namespaceObject.__)('Close')
      })
    })
  );
}
;
const {
  Fill: save_publish_panels_Fill,
  Slot: save_publish_panels_Slot
} = (0,external_wp_components_namespaceObject.createSlotFill)('ActionsPanel');
const ActionsPanelFill = ( null && (save_publish_panels_Fill));
function SavePublishPanels({
  setEntitiesSavedStatesCallback,
  closeEntitiesSavedStates,
  isEntitiesSavedStatesOpen,
  forceIsDirtyPublishPanel
}) {
  const {
    closePublishSidebar,
    togglePublishSidebar
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    publishSidebarOpened,
    isPublishable,
    isDirty,
    hasOtherEntitiesChanges
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      isPublishSidebarOpened,
      isEditedPostPublishable,
      isCurrentPostPublished,
      isEditedPostDirty,
      hasNonPostEntityChanges
    } = select(store_store);
    const _hasOtherEntitiesChanges = hasNonPostEntityChanges();
    return {
      publishSidebarOpened: isPublishSidebarOpened(),
      isPublishable: !isCurrentPostPublished() && isEditedPostPublishable(),
      isDirty: _hasOtherEntitiesChanges || isEditedPostDirty(),
      hasOtherEntitiesChanges: _hasOtherEntitiesChanges
    };
  }, []);
  const openEntitiesSavedStates = (0,external_wp_element_namespaceObject.useCallback)(() => setEntitiesSavedStatesCallback(true), []);
  let unmountableContent;
  if (publishSidebarOpened) {
    unmountableContent = (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_publish_panel, {
      onClose: closePublishSidebar,
      forceIsDirty: forceIsDirtyPublishPanel,
      PrePublishExtension: plugin_pre_publish_panel.Slot,
      PostPublishExtension: plugin_post_publish_panel.Slot
    });
  } else if (isPublishable && !hasOtherEntitiesChanges) {
    unmountableContent = (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "editor-layout__toggle-publish-panel",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        __next40pxDefaultSize: true,
        variant: "secondary",
        onClick: togglePublishSidebar,
        "aria-expanded": false,
        children: (0,external_wp_i18n_namespaceObject.__)('Open publish panel')
      })
    });
  } else {
    unmountableContent = (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      className: "editor-layout__toggle-entities-saved-states-panel",
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        __next40pxDefaultSize: true,
        variant: "secondary",
        onClick: openEntitiesSavedStates,
        "aria-expanded": false,
        "aria-haspopup": "dialog",
        disabled: !isDirty,
        accessibleWhenDisabled: true,
        children: (0,external_wp_i18n_namespaceObject.__)('Open save panel')
      })
    });
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [isEntitiesSavedStatesOpen && (0,external_ReactJSXRuntime_namespaceObject.jsx)(EntitiesSavedStates, {
      close: closeEntitiesSavedStates,
      renderDialog: true
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(save_publish_panels_Slot, {
      bubblesVirtually: true
    }), !isEntitiesSavedStatesOpen && unmountableContent]
  });
}
;
function TextEditor({
  autoFocus = false
}) {
  const {
    switchEditorMode
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    shortcut,
    isRichEditingEnabled
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditorSettings
    } = select(store_store);
    const {
      getShortcutRepresentation
    } = select(external_wp_keyboardShortcuts_namespaceObject.store);
    return {
      shortcut: getShortcutRepresentation('core/editor/toggle-mode'),
      isRichEditingEnabled: getEditorSettings().richEditingEnabled
    };
  }, []);
  const titleRef = (0,external_wp_element_namespaceObject.useRef)();
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (autoFocus) {
      return;
    }
    titleRef?.current?.focus();
  }, [autoFocus]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    className: "editor-text-editor",
    children: [isRichEditingEnabled && (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "editor-text-editor__toolbar",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("h2", {
        children: (0,external_wp_i18n_namespaceObject.__)('Editing code')
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        __next40pxDefaultSize: true,
        variant: "tertiary",
        onClick: () => switchEditorMode('visual'),
        shortcut: shortcut,
        children: (0,external_wp_i18n_namespaceObject.__)('Exit code editor')
      })]
    }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
      className: "editor-text-editor__body",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(post_title_raw, {
        ref: titleRef
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostTextEditor, {})]
    })]
  });
}
;
function EditTemplateBlocksNotification({
  contentRef
}) {
  const {
    onNavigateToEntityRecord,
    templateId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditorSettings,
      getCurrentTemplateId
    } = select(store_store);
    return {
      onNavigateToEntityRecord: getEditorSettings().onNavigateToEntityRecord,
      templateId: getCurrentTemplateId()
    };
  }, []);
  const canEditTemplate = (0,external_wp_data_namespaceObject.useSelect)(select => !!select(external_wp_coreData_namespaceObject.store).canUser('create', {
    kind: 'postType',
    name: 'wp_template'
  }), []);
  const [isDialogOpen, setIsDialogOpen] = (0,external_wp_element_namespaceObject.useState)(false);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    const handleDblClick = event => {
      if (!canEditTemplate) {
        return;
      }
      if (!event.target.classList.contains('is-root-container') || event.target.dataset?.type === 'core/template-part') {
        return;
      }
      if (!event.defaultPrevented) {
        event.preventDefault();
        setIsDialogOpen(true);
      }
    };
    const canvas = contentRef.current;
    canvas?.addEventListener('dblclick', handleDblClick);
    return () => {
      canvas?.removeEventListener('dblclick', handleDblClick);
    };
  }, [contentRef, canEditTemplate]);
  if (!canEditTemplate) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalConfirmDialog, {
    isOpen: isDialogOpen,
    confirmButtonText: (0,external_wp_i18n_namespaceObject.__)('Edit template'),
    onConfirm: () => {
      setIsDialogOpen(false);
      onNavigateToEntityRecord({
        postId: templateId,
        postType: 'wp_template'
      });
    },
    onCancel: () => setIsDialogOpen(false),
    size: "medium",
    children: (0,external_wp_i18n_namespaceObject.__)('You’ve tried to select a block that is part of a template that may be used elsewhere on your site. Would you like to edit the template?')
  });
}
;
const DELTA_DISTANCE = 20; 
function ResizeHandle({
  direction,
  resizeWidthBy
}) {
  function handleKeyDown(event) {
    const {
      keyCode
    } = event;
    if (keyCode !== external_wp_keycodes_namespaceObject.LEFT && keyCode !== external_wp_keycodes_namespaceObject.RIGHT) {
      return;
    }
    event.preventDefault();
    if (direction === 'left' && keyCode === external_wp_keycodes_namespaceObject.LEFT || direction === 'right' && keyCode === external_wp_keycodes_namespaceObject.RIGHT) {
      resizeWidthBy(DELTA_DISTANCE);
    } else if (direction === 'left' && keyCode === external_wp_keycodes_namespaceObject.RIGHT || direction === 'right' && keyCode === external_wp_keycodes_namespaceObject.LEFT) {
      resizeWidthBy(-DELTA_DISTANCE);
    }
  }
  const resizeHandleVariants = {
    active: {
      opacity: 1,
      scaleY: 1.3
    }
  };
  const resizableHandleHelpId = `resizable-editor__resize-help-${direction}`;
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Tooltip, {
      text: (0,external_wp_i18n_namespaceObject.__)('Drag to resize'),
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__unstableMotion.button, {
        className: `editor-resizable-editor__resize-handle is-${direction}`,
        "aria-label": (0,external_wp_i18n_namespaceObject.__)('Drag to resize'),
        "aria-describedby": resizableHandleHelpId,
        onKeyDown: handleKeyDown,
        variants: resizeHandleVariants,
        whileFocus: "active",
        whileHover: "active",
        whileTap: "active",
        role: "separator",
        "aria-orientation": "vertical"
      }, "handle")
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.VisuallyHidden, {
      id: resizableHandleHelpId,
      children: (0,external_wp_i18n_namespaceObject.__)('Use left and right arrow keys to resize the canvas.')
    })]
  });
}
;
const HANDLE_STYLES_OVERRIDE = {
  position: undefined,
  userSelect: undefined,
  cursor: undefined,
  width: undefined,
  height: undefined,
  top: undefined,
  right: undefined,
  bottom: undefined,
  left: undefined
};
function ResizableEditor({
  className,
  enableResizing,
  height,
  children
}) {
  const [width, setWidth] = (0,external_wp_element_namespaceObject.useState)('100%');
  const resizableRef = (0,external_wp_element_namespaceObject.useRef)();
  const resizeWidthBy = (0,external_wp_element_namespaceObject.useCallback)(deltaPixels => {
    if (resizableRef.current) {
      setWidth(resizableRef.current.offsetWidth + deltaPixels);
    }
  }, []);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ResizableBox, {
    className: dist_clsx('editor-resizable-editor', className, {
      'is-resizable': enableResizing
    }),
    ref: api => {
      resizableRef.current = api?.resizable;
    },
    size: {
      width: enableResizing ? width : '100%',
      height: enableResizing && height ? height : '100%'
    },
    onResizeStop: (event, direction, element) => {
      setWidth(element.style.width);
    },
    minWidth: 300,
    maxWidth: "100%",
    maxHeight: "100%",
    enable: {
      left: enableResizing,
      right: enableResizing
    },
    showHandle: enableResizing
    ,
    resizeRatio: 2,
    handleComponent: {
      left: (0,external_ReactJSXRuntime_namespaceObject.jsx)(ResizeHandle, {
        direction: "left",
        resizeWidthBy: resizeWidthBy
      }),
      right: (0,external_ReactJSXRuntime_namespaceObject.jsx)(ResizeHandle, {
        direction: "right",
        resizeWidthBy: resizeWidthBy
      })
    },
    handleClasses: undefined,
    handleStyles: {
      left: HANDLE_STYLES_OVERRIDE,
      right: HANDLE_STYLES_OVERRIDE
    },
    children: children
  });
}
 const resizable_editor = (ResizableEditor);
;
const DISTANCE_THRESHOLD = 500;
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function distanceFromRect(x, y, rect) {
  const dx = x - clamp(x, rect.left, rect.right);
  const dy = y - clamp(y, rect.top, rect.bottom);
  return Math.sqrt(dx * dx + dy * dy);
}
function useSelectNearestEditableBlock({
  isEnabled = true
} = {}) {
  const {
    getEnabledClientIdsTree,
    getBlockName,
    getBlockOrder
  } = unlock((0,external_wp_data_namespaceObject.useSelect)(external_wp_blockEditor_namespaceObject.store));
  const {
    selectBlock
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  return (0,external_wp_compose_namespaceObject.useRefEffect)(element => {
    if (!isEnabled) {
      return;
    }
    const selectNearestEditableBlock = (x, y) => {
      const editableBlockClientIds = getEnabledClientIdsTree().flatMap(({
        clientId
      }) => {
        const blockName = getBlockName(clientId);
        if (blockName === 'core/template-part') {
          return [];
        }
        if (blockName === 'core/post-content') {
          const innerBlocks = getBlockOrder(clientId);
          if (innerBlocks.length) {
            return innerBlocks;
          }
        }
        return [clientId];
      });
      let nearestDistance = Infinity,
        nearestClientId = null;
      for (const clientId of editableBlockClientIds) {
        const block = element.querySelector(`[data-block="${clientId}"]`);
        if (!block) {
          continue;
        }
        const rect = block.getBoundingClientRect();
        const distance = distanceFromRect(x, y, rect);
        if (distance < nearestDistance && distance < DISTANCE_THRESHOLD) {
          nearestDistance = distance;
          nearestClientId = clientId;
        }
      }
      if (nearestClientId) {
        selectBlock(nearestClientId);
      }
    };
    const handleClick = event => {
      const shouldSelect = event.target === element || event.target.classList.contains('is-root-container');
      if (shouldSelect) {
        selectNearestEditableBlock(event.clientX, event.clientY);
      }
    };
    element.addEventListener('click', handleClick);
    return () => element.removeEventListener('click', handleClick);
  }, [isEnabled]);
}
;
function useZoomOutModeExit() {
  const {
    getSettings,
    isZoomOut
  } = unlock((0,external_wp_data_namespaceObject.useSelect)(external_wp_blockEditor_namespaceObject.store));
  const {
    resetZoomLevel
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store));
  return (0,external_wp_compose_namespaceObject.useRefEffect)(node => {
    function onDoubleClick(event) {
      if (!isZoomOut()) {
        return;
      }
      if (!event.defaultPrevented) {
        event.preventDefault();
        const {
          __experimentalSetIsInserterOpened
        } = getSettings();
        if (typeof __experimentalSetIsInserterOpened === 'function') {
          __experimentalSetIsInserterOpened(false);
        }
        resetZoomLevel();
      }
    }
    node.addEventListener('dblclick', onDoubleClick);
    return () => {
      node.removeEventListener('dblclick', onDoubleClick);
    };
  }, [getSettings, isZoomOut, resetZoomLevel]);
}
;
const {
  LayoutStyle,
  useLayoutClasses,
  useLayoutStyles,
  ExperimentalBlockCanvas: BlockCanvas,
  useFlashEditableBlocks
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
const visual_editor_DESIGN_POST_TYPES = [PATTERN_POST_TYPE, TEMPLATE_POST_TYPE, NAVIGATION_POST_TYPE, TEMPLATE_PART_POST_TYPE];
function getPostContentAttributes(blocks) {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].name === 'core/post-content') {
      return blocks[i].attributes;
    }
    if (blocks[i].innerBlocks.length) {
      const nestedPostContent = getPostContentAttributes(blocks[i].innerBlocks);
      if (nestedPostContent) {
        return nestedPostContent;
      }
    }
  }
}
function checkForPostContentAtRootLevel(blocks) {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].name === 'core/post-content') {
      return true;
    }
  }
  return false;
}
function VisualEditor({
  autoFocus,
  styles,
  disableIframe = false,
  iframeProps,
  contentRef,
  className
}) {
  const [contentHeight, setContentHeight] = (0,external_wp_element_namespaceObject.useState)('');
  const effectContentHeight = (0,external_wp_compose_namespaceObject.useResizeObserver)(([entry]) => {
    setContentHeight(entry.borderBoxSize[0].blockSize);
  });
  const isMobileViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('small', '<');
  const {
    renderingMode,
    postContentAttributes,
    editedPostTemplate = {},
    wrapperBlockName,
    wrapperUniqueId,
    deviceType,
    isFocusedEntity,
    isDesignPostType,
    postType,
    isPreview
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostId,
      getCurrentPostType,
      getCurrentTemplateId,
      getEditorSettings,
      getRenderingMode,
      getDeviceType
    } = select(store_store);
    const {
      getPostType,
      getEditedEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    const postTypeSlug = getCurrentPostType();
    const _renderingMode = getRenderingMode();
    let _wrapperBlockName;
    if (postTypeSlug === PATTERN_POST_TYPE) {
      _wrapperBlockName = 'core/block';
    } else if (_renderingMode === 'post-only') {
      _wrapperBlockName = 'core/post-content';
    }
    const editorSettings = getEditorSettings();
    const supportsTemplateMode = editorSettings.supportsTemplateMode;
    const postTypeObject = getPostType(postTypeSlug);
    const currentTemplateId = getCurrentTemplateId();
    const template = currentTemplateId ? getEditedEntityRecord('postType', TEMPLATE_POST_TYPE, currentTemplateId) : undefined;
    return {
      renderingMode: _renderingMode,
      postContentAttributes: editorSettings.postContentAttributes,
      isDesignPostType: visual_editor_DESIGN_POST_TYPES.includes(postTypeSlug),
      editedPostTemplate: postTypeObject?.viewable && supportsTemplateMode ? template : undefined,
      wrapperBlockName: _wrapperBlockName,
      wrapperUniqueId: getCurrentPostId(),
      deviceType: getDeviceType(),
      isFocusedEntity: !!editorSettings.onNavigateToPreviousEntityRecord,
      postType: postTypeSlug,
      isPreview: editorSettings.isPreviewMode
    };
  }, []);
  const {
    isCleanNewPost
  } = (0,external_wp_data_namespaceObject.useSelect)(store_store);
  const {
    hasRootPaddingAwareAlignments,
    themeHasDisabledLayoutStyles,
    themeSupportsLayout,
    isZoomedOut
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getSettings,
      isZoomOut: _isZoomOut
    } = unlock(select(external_wp_blockEditor_namespaceObject.store));
    const _settings = getSettings();
    return {
      themeHasDisabledLayoutStyles: _settings.disableLayoutStyles,
      themeSupportsLayout: _settings.supportsLayout,
      hasRootPaddingAwareAlignments: _settings.__experimentalFeatures?.useRootPaddingAwareAlignments,
      isZoomedOut: _isZoomOut()
    };
  }, []);
  const deviceStyles = (0,external_wp_blockEditor_namespaceObject.__experimentalUseResizeCanvas)(deviceType);
  const [globalLayoutSettings] = (0,external_wp_blockEditor_namespaceObject.useSettings)('layout');
  const fallbackLayout = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (renderingMode !== 'post-only' || isDesignPostType) {
      return {
        type: 'default'
      };
    }
    if (themeSupportsLayout) {
      return {
        ...globalLayoutSettings,
        type: 'constrained'
      };
    }
    return {
      type: 'default'
    };
  }, [renderingMode, themeSupportsLayout, globalLayoutSettings, isDesignPostType]);
  const newestPostContentAttributes = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (!editedPostTemplate?.content && !editedPostTemplate?.blocks && postContentAttributes) {
      return postContentAttributes;
    }
    if (editedPostTemplate?.blocks) {
      return getPostContentAttributes(editedPostTemplate?.blocks);
    }
    const parseableContent = typeof editedPostTemplate?.content === 'string' ? editedPostTemplate?.content : '';
    return getPostContentAttributes((0,external_wp_blocks_namespaceObject.parse)(parseableContent)) || {};
  }, [editedPostTemplate?.content, editedPostTemplate?.blocks, postContentAttributes]);
  const hasPostContentAtRootLevel = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (!editedPostTemplate?.content && !editedPostTemplate?.blocks) {
      return false;
    }
    if (editedPostTemplate?.blocks) {
      return checkForPostContentAtRootLevel(editedPostTemplate?.blocks);
    }
    const parseableContent = typeof editedPostTemplate?.content === 'string' ? editedPostTemplate?.content : '';
    return checkForPostContentAtRootLevel((0,external_wp_blocks_namespaceObject.parse)(parseableContent)) || false;
  }, [editedPostTemplate?.content, editedPostTemplate?.blocks]);
  const {
    layout = {},
    align = ''
  } = newestPostContentAttributes || {};
  const postContentLayoutClasses = useLayoutClasses(newestPostContentAttributes, 'core/post-content');
  const blockListLayoutClass = dist_clsx({
    'is-layout-flow': !themeSupportsLayout
  }, themeSupportsLayout && postContentLayoutClasses, align && `align${align}`);
  const postContentLayoutStyles = useLayoutStyles(newestPostContentAttributes, 'core/post-content', '.block-editor-block-list__layout.is-root-container');
  const postContentLayout = (0,external_wp_element_namespaceObject.useMemo)(() => {
    return layout && (layout?.type === 'constrained' || layout?.inherit || layout?.contentSize || layout?.wideSize) ? {
      ...globalLayoutSettings,
      ...layout,
      type: 'constrained'
    } : {
      ...globalLayoutSettings,
      ...layout,
      type: 'default'
    };
  }, [layout?.type, layout?.inherit, layout?.contentSize, layout?.wideSize, globalLayoutSettings]);
  const blockListLayout = postContentAttributes ? postContentLayout : fallbackLayout;
  const postEditorLayout = blockListLayout?.type === 'default' && !hasPostContentAtRootLevel ? fallbackLayout : blockListLayout;
  const observeTypingRef = (0,external_wp_blockEditor_namespaceObject.__unstableUseTypingObserver)();
  const titleRef = (0,external_wp_element_namespaceObject.useRef)();
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (!autoFocus || !isCleanNewPost()) {
      return;
    }
    titleRef?.current?.focus();
  }, [autoFocus, isCleanNewPost]);
  const alignCSS = `.is-root-container.alignwide { max-width: var(--wp--style--global--wide-size); margin-left: auto; margin-right: auto;}
		.is-root-container.alignwide:where(.is-layout-flow) > :not(.alignleft):not(.alignright) { max-width: var(--wp--style--global--wide-size);}
		.is-root-container.alignfull { max-width: none; margin-left: auto; margin-right: auto;}
		.is-root-container.alignfull:where(.is-layout-flow) > :not(.alignleft):not(.alignright) { max-width: none;}`;
  const forceFullHeight = postType === NAVIGATION_POST_TYPE;
  const enableResizing = [NAVIGATION_POST_TYPE, TEMPLATE_PART_POST_TYPE, PATTERN_POST_TYPE].includes(postType) &&
  !isPreview &&
  !isMobileViewport &&
  !isZoomedOut;
  const iframeStyles = (0,external_wp_element_namespaceObject.useMemo)(() => {
    return [...(styles !== null && styles !== void 0 ? styles : []), {
      css: `:where(.block-editor-iframe__body){display:flow-root;}.is-root-container{display:flow-root;${
      // Some themes will have `min-height: 100vh` for the root container,
      // which isn't a requirement in auto resize mode.
      enableResizing ? 'min-height:0!important;' : ''}}`
    }];
  }, [styles, enableResizing]);
  const localRef = (0,external_wp_element_namespaceObject.useRef)();
  const typewriterRef = (0,external_wp_blockEditor_namespaceObject.__unstableUseTypewriter)();
  contentRef = (0,external_wp_compose_namespaceObject.useMergeRefs)([localRef, contentRef, renderingMode === 'post-only' ? typewriterRef : null, useFlashEditableBlocks({
    isEnabled: renderingMode === 'template-locked'
  }), useSelectNearestEditableBlock({
    isEnabled: renderingMode === 'template-locked'
  }), useZoomOutModeExit(),
  enableResizing ? effectContentHeight : null]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    className: dist_clsx('editor-visual-editor',
    'edit-post-visual-editor', className, {
      'has-padding': isFocusedEntity || enableResizing,
      'is-resizable': enableResizing,
      'is-iframed': !disableIframe
    }),
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(resizable_editor, {
      enableResizing: enableResizing,
      height: contentHeight && !forceFullHeight ? contentHeight : '100%',
      children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(BlockCanvas, {
        shouldIframe: !disableIframe,
        contentRef: contentRef,
        styles: iframeStyles,
        height: "100%",
        iframeProps: {
          ...iframeProps,
          style: {
            ...iframeProps?.style,
            ...deviceStyles
          }
        },
        children: [themeSupportsLayout && !themeHasDisabledLayoutStyles && renderingMode === 'post-only' && !isDesignPostType && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(LayoutStyle, {
            selector: ".editor-visual-editor__post-title-wrapper",
            layout: fallbackLayout
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(LayoutStyle, {
            selector: ".block-editor-block-list__layout.is-root-container",
            layout: postEditorLayout
          }), align && (0,external_ReactJSXRuntime_namespaceObject.jsx)(LayoutStyle, {
            css: alignCSS
          }), postContentLayoutStyles && (0,external_ReactJSXRuntime_namespaceObject.jsx)(LayoutStyle, {
            layout: postContentLayout,
            css: postContentLayoutStyles
          })]
        }), renderingMode === 'post-only' && !isDesignPostType && (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
          className: dist_clsx('editor-visual-editor__post-title-wrapper',
          'edit-post-visual-editor__post-title-wrapper', {
            'has-global-padding': hasRootPaddingAwareAlignments
          }),
          contentEditable: false,
          ref: observeTypingRef,
          style: {
            marginTop: '4rem'
          },
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_title, {
            ref: titleRef
          })
        }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_blockEditor_namespaceObject.RecursionProvider, {
          blockName: wrapperBlockName,
          uniqueId: wrapperUniqueId,
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockList, {
            className: dist_clsx('is-' + deviceType.toLowerCase() + '-preview', renderingMode !== 'post-only' || isDesignPostType ? 'wp-site-blocks' : `${blockListLayoutClass} wp-block-post-content`,
            {
              'has-global-padding': renderingMode === 'post-only' && !isDesignPostType && hasRootPaddingAwareAlignments
            }),
            layout: blockListLayout,
            dropZoneElement:
            disableIframe ? localRef.current : localRef.current?.parentNode,
            __unstableDisableDropZone:
            renderingMode === 'template-locked' ? true : false
          }), renderingMode === 'template-locked' && (0,external_ReactJSXRuntime_namespaceObject.jsx)(EditTemplateBlocksNotification, {
            contentRef: localRef
          })]
        })]
      })
    })
  });
}
 const visual_editor = (VisualEditor);
;
const interfaceLabels = {
  header: (0,external_wp_i18n_namespaceObject.__)('Editor top bar'),
  body: (0,external_wp_i18n_namespaceObject.__)('Editor content'),
  sidebar: (0,external_wp_i18n_namespaceObject.__)('Editor settings'),
  actions: (0,external_wp_i18n_namespaceObject.__)('Editor publish'),
  footer: (0,external_wp_i18n_namespaceObject.__)('Editor footer')
};
function EditorInterface({
  className,
  styles,
  children,
  forceIsDirty,
  contentRef,
  disableIframe,
  autoFocus,
  customSaveButton,
  customSavePanel,
  forceDisableBlockTools,
  title,
  iframeProps
}) {
  const {
    mode,
    isRichEditingEnabled,
    isInserterOpened,
    isListViewOpened,
    isDistractionFree,
    isPreviewMode,
    showBlockBreadcrumbs,
    documentLabel
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      get
    } = select(external_wp_preferences_namespaceObject.store);
    const {
      getEditorSettings,
      getPostTypeLabel
    } = select(store_store);
    const editorSettings = getEditorSettings();
    const postTypeLabel = getPostTypeLabel();
    return {
      mode: select(store_store).getEditorMode(),
      isRichEditingEnabled: editorSettings.richEditingEnabled,
      isInserterOpened: select(store_store).isInserterOpened(),
      isListViewOpened: select(store_store).isListViewOpened(),
      isDistractionFree: get('core', 'distractionFree'),
      isPreviewMode: editorSettings.isPreviewMode,
      showBlockBreadcrumbs: get('core', 'showBlockBreadcrumbs'),
      documentLabel:
      postTypeLabel || (0,external_wp_i18n_namespaceObject._x)('Document', 'noun, breadcrumb')
    };
  }, []);
  const isLargeViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('medium');
  const secondarySidebarLabel = isListViewOpened ? (0,external_wp_i18n_namespaceObject.__)('Document Overview') : (0,external_wp_i18n_namespaceObject.__)('Block Library');
  const [entitiesSavedStatesCallback, setEntitiesSavedStatesCallback] = (0,external_wp_element_namespaceObject.useState)(false);
  const closeEntitiesSavedStates = (0,external_wp_element_namespaceObject.useCallback)(arg => {
    if (typeof entitiesSavedStatesCallback === 'function') {
      entitiesSavedStatesCallback(arg);
    }
    setEntitiesSavedStatesCallback(false);
  }, [entitiesSavedStatesCallback]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(interface_skeleton, {
    isDistractionFree: isDistractionFree,
    className: dist_clsx('editor-editor-interface', className, {
      'is-entity-save-view-open': !!entitiesSavedStatesCallback,
      'is-distraction-free': isDistractionFree && !isPreviewMode
    }),
    labels: {
      ...interfaceLabels,
      secondarySidebar: secondarySidebarLabel
    },
    header: !isPreviewMode && (0,external_ReactJSXRuntime_namespaceObject.jsx)(components_header, {
      forceIsDirty: forceIsDirty,
      setEntitiesSavedStatesCallback: setEntitiesSavedStatesCallback,
      customSaveButton: customSaveButton,
      forceDisableBlockTools: forceDisableBlockTools,
      title: title
    }),
    editorNotices: (0,external_ReactJSXRuntime_namespaceObject.jsx)(editor_notices, {}),
    secondarySidebar: !isPreviewMode && mode === 'visual' && (isInserterOpened && (0,external_ReactJSXRuntime_namespaceObject.jsx)(InserterSidebar, {}) || isListViewOpened && (0,external_ReactJSXRuntime_namespaceObject.jsx)(ListViewSidebar, {})),
    sidebar: !isPreviewMode && !isDistractionFree && (0,external_ReactJSXRuntime_namespaceObject.jsx)(complementary_area.Slot, {
      scope: "core"
    }),
    content: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [!isDistractionFree && !isPreviewMode && (0,external_ReactJSXRuntime_namespaceObject.jsx)(editor_notices, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(content_slot_fill.Slot, {
        children: ([editorCanvasView]) => editorCanvasView ? editorCanvasView : (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
          children: [!isPreviewMode && (mode === 'text' || !isRichEditingEnabled) && (0,external_ReactJSXRuntime_namespaceObject.jsx)(TextEditor
          , {
            autoFocus: autoFocus
          }), !isPreviewMode && !isLargeViewport && mode === 'visual' && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockToolbar, {
            hideDragHandle: true
          }), (isPreviewMode || isRichEditingEnabled && mode === 'visual') && (0,external_ReactJSXRuntime_namespaceObject.jsx)(visual_editor, {
            styles: styles,
            contentRef: contentRef,
            disableIframe: disableIframe
            ,
            autoFocus: autoFocus,
            iframeProps: iframeProps
          }), children]
        })
      })]
    }),
    footer: !isPreviewMode && !isDistractionFree && isLargeViewport && showBlockBreadcrumbs && isRichEditingEnabled && mode === 'visual' && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockBreadcrumb, {
      rootLabelText: documentLabel
    }),
    actions: !isPreviewMode ? customSavePanel || (0,external_ReactJSXRuntime_namespaceObject.jsx)(SavePublishPanels, {
      closeEntitiesSavedStates: closeEntitiesSavedStates,
      isEntitiesSavedStatesOpen: entitiesSavedStatesCallback,
      setEntitiesSavedStatesCallback: setEntitiesSavedStatesCallback,
      forceIsDirtyPublishPanel: forceIsDirty
    }) : undefined
  });
}
;
const {
  OverridesPanel
} = unlock(external_wp_patterns_namespaceObject.privateApis);
function PatternOverridesPanel() {
  const supportsPatternOverridesPanel = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).getCurrentPostType() === 'wp_block', []);
  if (!supportsPatternOverridesPanel) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(OverridesPanel, {});
}
;
function get_item_title_getItemTitle(item) {
  if (typeof item.title === 'string') {
    return (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(item.title);
  }
  if (item.title && 'rendered' in item.title) {
    return (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(item.title.rendered);
  }
  if (item.title && 'raw' in item.title) {
    return (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(item.title.raw);
  }
  return '';
}
;
const SetAsHomepageModal = ({
  items,
  closeModal
}) => {
  const [item] = items;
  const pageTitle = get_item_title_getItemTitle(item);
  const {
    showOnFront,
    currentHomePage,
    isSaving
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord,
      isSavingEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    const siteSettings = getEntityRecord('root', 'site');
    const currentHomePageItem = getEntityRecord('postType', 'page', siteSettings?.page_on_front);
    return {
      showOnFront: siteSettings?.show_on_front,
      currentHomePage: currentHomePageItem,
      isSaving: isSavingEntityRecord('root', 'site')
    };
  });
  const {
    saveEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const {
    createSuccessNotice,
    createErrorNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  async function onSetPageAsHomepage(event) {
    event.preventDefault();
    try {
      await saveEntityRecord('root', 'site', {
        page_on_front: item.id,
        show_on_front: 'page'
      });
      createSuccessNotice((0,external_wp_i18n_namespaceObject.__)('Homepage updated.'), {
        type: 'snackbar'
      });
    } catch (error) {
      const errorMessage = error.message && error.code !== 'unknown_error' ? error.message : (0,external_wp_i18n_namespaceObject.__)('An error occurred while setting the homepage.');
      createErrorNotice(errorMessage, {
        type: 'snackbar'
      });
    } finally {
      closeModal?.();
    }
  }
  let modalWarning = '';
  if ('posts' === showOnFront) {
    modalWarning = (0,external_wp_i18n_namespaceObject.__)('This will replace the current homepage which is set to display latest posts.');
  } else if (currentHomePage) {
    modalWarning = (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('This will replace the current homepage: "%s"'), get_item_title_getItemTitle(currentHomePage));
  }
  const modalText = (0,external_wp_i18n_namespaceObject.sprintf)(
  (0,external_wp_i18n_namespaceObject.__)('Set "%1$s" as the site homepage? %2$s'), pageTitle, modalWarning).trim();
  const modalButtonLabel = (0,external_wp_i18n_namespaceObject.__)('Set homepage');
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
    onSubmit: onSetPageAsHomepage,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      spacing: "5",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
        children: modalText
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
        justify: "right",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "tertiary",
          onClick: () => {
            closeModal?.();
          },
          disabled: isSaving,
          accessibleWhenDisabled: true,
          children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "primary",
          type: "submit",
          disabled: isSaving,
          accessibleWhenDisabled: true,
          children: modalButtonLabel
        })]
      })]
    })
  });
};
const useSetAsHomepageAction = () => {
  const {
    pageOnFront,
    pageForPosts
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord,
      canUser
    } = select(external_wp_coreData_namespaceObject.store);
    const siteSettings = canUser('read', {
      kind: 'root',
      name: 'site'
    }) ? getEntityRecord('root', 'site') : undefined;
    return {
      pageOnFront: siteSettings?.page_on_front,
      pageForPosts: siteSettings?.page_for_posts
    };
  });
  return (0,external_wp_element_namespaceObject.useMemo)(() => ({
    id: 'set-as-homepage',
    label: (0,external_wp_i18n_namespaceObject.__)('Set as homepage'),
    isEligible(post) {
      if (post.status !== 'publish') {
        return false;
      }
      if (post.type !== 'page') {
        return false;
      }
      if (pageOnFront === post.id) {
        return false;
      }
      if (pageForPosts === post.id) {
        return false;
      }
      return true;
    },
    RenderModal: SetAsHomepageModal
  }), [pageForPosts, pageOnFront]);
};
;
const SetAsPostsPageModal = ({
  items,
  closeModal
}) => {
  const [item] = items;
  const pageTitle = get_item_title_getItemTitle(item);
  const {
    currentPostsPage,
    isPageForPostsSet,
    isSaving
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord,
      isSavingEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    const siteSettings = getEntityRecord('root', 'site');
    const currentPostsPageItem = getEntityRecord('postType', 'page', siteSettings?.page_for_posts);
    return {
      currentPostsPage: currentPostsPageItem,
      isPageForPostsSet: siteSettings?.page_for_posts !== 0,
      isSaving: isSavingEntityRecord('root', 'site')
    };
  });
  const {
    saveEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const {
    createSuccessNotice,
    createErrorNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  async function onSetPageAsPostsPage(event) {
    event.preventDefault();
    try {
      await saveEntityRecord('root', 'site', {
        page_for_posts: item.id,
        show_on_front: 'page'
      });
      createSuccessNotice((0,external_wp_i18n_namespaceObject.__)('Posts page updated.'), {
        type: 'snackbar'
      });
    } catch (error) {
      const errorMessage = error.message && error.code !== 'unknown_error' ? error.message : (0,external_wp_i18n_namespaceObject.__)('An error occurred while setting the posts page.');
      createErrorNotice(errorMessage, {
        type: 'snackbar'
      });
    } finally {
      closeModal?.();
    }
  }
  const modalWarning = isPageForPostsSet && currentPostsPage ? (0,external_wp_i18n_namespaceObject.sprintf)(
  (0,external_wp_i18n_namespaceObject.__)('This will replace the current posts page: "%s"'), get_item_title_getItemTitle(currentPostsPage)) : (0,external_wp_i18n_namespaceObject.__)('This page will show the latest posts.');
  const modalText = (0,external_wp_i18n_namespaceObject.sprintf)(
  (0,external_wp_i18n_namespaceObject.__)('Set "%1$s" as the posts page? %2$s'), pageTitle, modalWarning);
  const modalButtonLabel = (0,external_wp_i18n_namespaceObject.__)('Set posts page');
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
    onSubmit: onSetPageAsPostsPage,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      spacing: "5",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
        children: modalText
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
        justify: "right",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "tertiary",
          onClick: () => {
            closeModal?.();
          },
          disabled: isSaving,
          accessibleWhenDisabled: true,
          children: (0,external_wp_i18n_namespaceObject.__)('Cancel')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "primary",
          type: "submit",
          disabled: isSaving,
          accessibleWhenDisabled: true,
          children: modalButtonLabel
        })]
      })]
    })
  });
};
const useSetAsPostsPageAction = () => {
  const {
    pageOnFront,
    pageForPosts
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord,
      canUser
    } = select(external_wp_coreData_namespaceObject.store);
    const siteSettings = canUser('read', {
      kind: 'root',
      name: 'site'
    }) ? getEntityRecord('root', 'site') : undefined;
    return {
      pageOnFront: siteSettings?.page_on_front,
      pageForPosts: siteSettings?.page_for_posts
    };
  });
  return (0,external_wp_element_namespaceObject.useMemo)(() => ({
    id: 'set-as-posts-page',
    label: (0,external_wp_i18n_namespaceObject.__)('Set as posts page'),
    isEligible(post) {
      if (post.status !== 'publish') {
        return false;
      }
      if (post.type !== 'page') {
        return false;
      }
      if (pageOnFront === post.id) {
        return false;
      }
      if (pageForPosts === post.id) {
        return false;
      }
      return true;
    },
    RenderModal: SetAsPostsPageModal
  }), [pageForPosts, pageOnFront]);
};
;
function usePostActions({
  postType,
  onActionPerformed,
  context
}) {
  const {
    defaultActions
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityActions
    } = unlock(select(store_store));
    return {
      defaultActions: getEntityActions('postType', postType)
    };
  }, [postType]);
  const {
    canManageOptions,
    hasFrontPageTemplate
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecords
    } = select(external_wp_coreData_namespaceObject.store);
    const templates = getEntityRecords('postType', 'wp_template', {
      per_page: -1
    });
    return {
      canManageOptions: select(external_wp_coreData_namespaceObject.store).canUser('update', {
        kind: 'root',
        name: 'site'
      }),
      hasFrontPageTemplate: !!templates?.find(template => template?.slug === 'front-page')
    };
  });
  const setAsHomepageAction = useSetAsHomepageAction();
  const setAsPostsPageAction = useSetAsPostsPageAction();
  const shouldShowHomepageActions = canManageOptions && !hasFrontPageTemplate;
  const {
    registerPostTypeSchema
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(store_store));
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    registerPostTypeSchema(postType);
  }, [registerPostTypeSchema, postType]);
  return (0,external_wp_element_namespaceObject.useMemo)(() => {
    let actions = [...defaultActions];
    if (shouldShowHomepageActions) {
      actions.push(setAsHomepageAction, setAsPostsPageAction);
    }
    actions = actions.sort((a, b) => b.id === 'move-to-trash' ? -1 : 0);
    actions = actions.filter(action => {
      if (!action.context) {
        return true;
      }
      return action.context === context;
    });
    if (onActionPerformed) {
      for (let i = 0; i < actions.length; ++i) {
        if (actions[i].callback) {
          const existingCallback = actions[i].callback;
          actions[i] = {
            ...actions[i],
            callback: (items, argsObject) => {
              existingCallback(items, {
                ...argsObject,
                onActionPerformed: _items => {
                  if (argsObject?.onActionPerformed) {
                    argsObject.onActionPerformed(_items);
                  }
                  onActionPerformed(actions[i].id, _items);
                }
              });
            }
          };
        }
        if (actions[i].RenderModal) {
          const ExistingRenderModal = actions[i].RenderModal;
          actions[i] = {
            ...actions[i],
            RenderModal: props => {
              return (0,external_ReactJSXRuntime_namespaceObject.jsx)(ExistingRenderModal, {
                ...props,
                onActionPerformed: _items => {
                  if (props.onActionPerformed) {
                    props.onActionPerformed(_items);
                  }
                  onActionPerformed(actions[i].id, _items);
                }
              });
            }
          };
        }
      }
    }
    return actions;
  }, [context, defaultActions, onActionPerformed, setAsHomepageAction, setAsPostsPageAction, shouldShowHomepageActions]);
}
;
const {
  Menu,
  kebabCase
} = unlock(external_wp_components_namespaceObject.privateApis);
function PostActions({
  postType,
  postId,
  onActionPerformed
}) {
  const [activeModalAction, setActiveModalAction] = (0,external_wp_element_namespaceObject.useState)(null);
  const {
    item,
    permissions
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedEntityRecord,
      getEntityRecordPermissions
    } = unlock(select(external_wp_coreData_namespaceObject.store));
    return {
      item: getEditedEntityRecord('postType', postType, postId),
      permissions: getEntityRecordPermissions('postType', postType, postId)
    };
  }, [postId, postType]);
  const itemWithPermissions = (0,external_wp_element_namespaceObject.useMemo)(() => {
    return {
      ...item,
      permissions
    };
  }, [item, permissions]);
  const allActions = usePostActions({
    postType,
    onActionPerformed
  });
  const actions = (0,external_wp_element_namespaceObject.useMemo)(() => {
    return allActions.filter(action => {
      return !action.isEligible || action.isEligible(itemWithPermissions);
    });
  }, [allActions, itemWithPermissions]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)(Menu, {
      placement: "bottom-end",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(Menu.TriggerButton, {
        render: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          size: "small",
          icon: more_vertical,
          label: (0,external_wp_i18n_namespaceObject.__)('Actions'),
          disabled: !actions.length,
          accessibleWhenDisabled: true,
          className: "editor-all-actions-button"
        })
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(Menu.Popover, {
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(ActionsDropdownMenuGroup, {
          actions: actions,
          items: [itemWithPermissions],
          setActiveModalAction: setActiveModalAction
        })
      })]
    }), !!activeModalAction && (0,external_ReactJSXRuntime_namespaceObject.jsx)(ActionModal, {
      action: activeModalAction,
      items: [itemWithPermissions],
      closeModal: () => setActiveModalAction(null)
    })]
  });
}
function DropdownMenuItemTrigger({
  action,
  onClick,
  items
}) {
  const label = typeof action.label === 'string' ? action.label : action.label(items);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(Menu.Item, {
    onClick: onClick,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(Menu.ItemLabel, {
      children: label
    })
  });
}
function ActionModal({
  action,
  items,
  closeModal
}) {
  const label = typeof action.label === 'string' ? action.label : action.label(items);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Modal, {
    title: action.modalHeader || label,
    __experimentalHideHeader: !!action.hideModalHeader,
    onRequestClose: closeModal !== null && closeModal !== void 0 ? closeModal : () => {},
    focusOnMount: "firstContentElement",
    size: "medium",
    overlayClassName: `editor-action-modal editor-action-modal__${kebabCase(action.id)}`,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(action.RenderModal, {
      items: items,
      closeModal: closeModal
    })
  });
}
function ActionsDropdownMenuGroup({
  actions,
  items,
  setActiveModalAction
}) {
  const registry = (0,external_wp_data_namespaceObject.useRegistry)();
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(Menu.Group, {
    children: actions.map(action => {
      return (0,external_ReactJSXRuntime_namespaceObject.jsx)(DropdownMenuItemTrigger, {
        action: action,
        onClick: () => {
          if ('RenderModal' in action) {
            setActiveModalAction(action);
            return;
          }
          action.callback(items, {
            registry
          });
        },
        items: items
      }, action.id);
    })
  });
}
;
const {
  Badge: post_card_panel_Badge
} = unlock(external_wp_components_namespaceObject.privateApis);
function PostCardPanel({
  postType,
  postId,
  onActionPerformed
}) {
  const postIds = (0,external_wp_element_namespaceObject.useMemo)(() => Array.isArray(postId) ? postId : [postId], [postId]);
  const {
    postTitle,
    icon,
    labels
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedEntityRecord,
      getCurrentTheme,
      getPostType
    } = select(external_wp_coreData_namespaceObject.store);
    const {
      getPostIcon
    } = unlock(select(store_store));
    let _title = '';
    const _record = getEditedEntityRecord('postType', postType, postIds[0]);
    if (postIds.length === 1) {
      var _getCurrentTheme;
      const {
        default_template_types: templateTypes = []
      } = (_getCurrentTheme = getCurrentTheme()) !== null && _getCurrentTheme !== void 0 ? _getCurrentTheme : {};
      const _templateInfo = [TEMPLATE_POST_TYPE, TEMPLATE_PART_POST_TYPE].includes(postType) ? getTemplateInfo({
        template: _record,
        templateTypes
      }) : {};
      _title = _templateInfo?.title || _record?.title;
    }
    return {
      postTitle: _title,
      icon: getPostIcon(postType, {
        area: _record?.area
      }),
      labels: getPostType(postType)?.labels
    };
  }, [postIds, postType]);
  const pageTypeBadge = usePageTypeBadge(postId);
  let title = (0,external_wp_i18n_namespaceObject.__)('No title');
  if (labels?.name && postIds.length > 1) {
    title = (0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('%i %s'), postId.length, labels?.name);
  } else if (postTitle) {
    title = (0,external_wp_dom_namespaceObject.__unstableStripHTML)(postTitle);
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
    spacing: 1,
    className: "editor-post-card-panel",
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalHStack, {
      spacing: 2,
      className: "editor-post-card-panel__header",
      align: "flex-start",
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Icon, {
        className: "editor-post-card-panel__icon",
        icon: icon
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalText, {
        numberOfLines: 2,
        truncate: true,
        className: "editor-post-card-panel__title",
        as: "h2",
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)("span", {
          className: "editor-post-card-panel__title-name",
          children: title
        }), pageTypeBadge && postIds.length === 1 && (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_card_panel_Badge, {
          children: pageTypeBadge
        })]
      }), postIds.length === 1 && (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostActions, {
        postType: postType,
        postId: postIds[0],
        onActionPerformed: onActionPerformed
      })]
    }), postIds.length > 1 && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
      className: "editor-post-card-panel__description",
      children: (0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject.__)('Changes will be applied to all selected %s.'), labels?.name.toLowerCase())
    })]
  });
}
;
const post_content_information_AVERAGE_READING_RATE = 189;
function PostContentInformation() {
  const {
    postContent
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedPostAttribute,
      getCurrentPostType,
      getCurrentPostId
    } = select(store_store);
    const {
      canUser
    } = select(external_wp_coreData_namespaceObject.store);
    const {
      getEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    const siteSettings = canUser('read', {
      kind: 'root',
      name: 'site'
    }) ? getEntityRecord('root', 'site') : undefined;
    const postType = getCurrentPostType();
    const _id = getCurrentPostId();
    const isPostsPage = +_id === siteSettings?.page_for_posts;
    const showPostContentInfo = !isPostsPage && ![TEMPLATE_POST_TYPE, TEMPLATE_PART_POST_TYPE].includes(postType);
    return {
      postContent: showPostContentInfo && getEditedPostAttribute('content')
    };
  }, []);
  const wordCountType = (0,external_wp_i18n_namespaceObject._x)('words', 'Word count type. Do not translate!');
  const wordsCounted = (0,external_wp_element_namespaceObject.useMemo)(() => postContent ? (0,external_wp_wordcount_namespaceObject.count)(postContent, wordCountType) : 0, [postContent, wordCountType]);
  if (!wordsCounted) {
    return null;
  }
  const readingTime = Math.round(wordsCounted / post_content_information_AVERAGE_READING_RATE);
  const wordsCountText = (0,external_wp_i18n_namespaceObject.sprintf)(
  (0,external_wp_i18n_namespaceObject._n)('%s word', '%s words', wordsCounted), wordsCounted.toLocaleString());
  const minutesText = readingTime <= 1 ? (0,external_wp_i18n_namespaceObject.__)('1 minute') : (0,external_wp_i18n_namespaceObject.sprintf)(
  (0,external_wp_i18n_namespaceObject._n)('%s minute', '%s minutes', readingTime), readingTime.toLocaleString());
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    className: "editor-post-content-information",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
      children: (0,external_wp_i18n_namespaceObject.sprintf)(
      (0,external_wp_i18n_namespaceObject.__)('%1$s, %2$s read time.'), wordsCountText, minutesText)
    })
  });
}
;
function panel_PostFormat() {
  const {
    postFormat
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedPostAttribute
    } = select(store_store);
    const _postFormat = getEditedPostAttribute('format');
    return {
      postFormat: _postFormat !== null && _postFormat !== void 0 ? _postFormat : 'standard'
    };
  }, []);
  const activeFormat = POST_FORMATS.find(format => format.id === postFormat);
  const [popoverAnchor, setPopoverAnchor] = (0,external_wp_element_namespaceObject.useState)(null);
  const popoverProps = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    anchor: popoverAnchor,
    placement: 'left-start',
    offset: 36,
    shift: true
  }), [popoverAnchor]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostFormatCheck, {
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_panel_row, {
      label: (0,external_wp_i18n_namespaceObject.__)('Format'),
      ref: setPopoverAnchor,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
        popoverProps: popoverProps,
        contentClassName: "editor-post-format__dialog",
        focusOnMount: true,
        renderToggle: ({
          isOpen,
          onToggle
        }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          size: "compact",
          variant: "tertiary",
          "aria-expanded": isOpen,
          "aria-label": (0,external_wp_i18n_namespaceObject.sprintf)(
          (0,external_wp_i18n_namespaceObject.__)('Change format: %s'), activeFormat?.caption),
          onClick: onToggle,
          children: activeFormat?.caption
        }),
        renderContent: ({
          onClose
        }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
          className: "editor-post-format__dialog-content",
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalInspectorPopoverHeader, {
            title: (0,external_wp_i18n_namespaceObject.__)('Format'),
            onClose: onClose
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostFormat, {})]
        })
      })
    })
  });
}
 const post_format_panel = (panel_PostFormat);
;
function PostLastEditedPanel() {
  const modified = (0,external_wp_data_namespaceObject.useSelect)(select => select(store_store).getEditedPostAttribute('modified'), []);
  const lastEditedText = modified && (0,external_wp_i18n_namespaceObject.sprintf)(
  (0,external_wp_i18n_namespaceObject.__)('Last edited %s.'), (0,external_wp_date_namespaceObject.humanTimeDiff)(modified));
  if (!lastEditedText) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
    className: "editor-post-last-edited-panel",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
      children: lastEditedText
    })
  });
}
;
function PostPanelSection({
  className,
  children
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalVStack, {
    className: dist_clsx('editor-post-panel__section', className),
    children: children
  });
}
 const post_panel_section = (PostPanelSection);
;
const blog_title_EMPTY_OBJECT = {};
function BlogTitle() {
  const {
    editEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const {
    postsPageTitle,
    postsPageId,
    isTemplate,
    postSlug
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord,
      getEditedEntityRecord,
      canUser
    } = select(external_wp_coreData_namespaceObject.store);
    const siteSettings = canUser('read', {
      kind: 'root',
      name: 'site'
    }) ? getEntityRecord('root', 'site') : undefined;
    const _postsPageRecord = siteSettings?.page_for_posts ? getEditedEntityRecord('postType', 'page', siteSettings?.page_for_posts) : blog_title_EMPTY_OBJECT;
    const {
      getEditedPostAttribute,
      getCurrentPostType
    } = select(store_store);
    return {
      postsPageId: _postsPageRecord?.id,
      postsPageTitle: _postsPageRecord?.title,
      isTemplate: getCurrentPostType() === TEMPLATE_POST_TYPE,
      postSlug: getEditedPostAttribute('slug')
    };
  }, []);
  const [popoverAnchor, setPopoverAnchor] = (0,external_wp_element_namespaceObject.useState)(null);
  const popoverProps = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    anchor: popoverAnchor,
    placement: 'left-start',
    offset: 36,
    shift: true
  }), [popoverAnchor]);
  if (!isTemplate || !['home', 'index'].includes(postSlug) || !postsPageId) {
    return null;
  }
  const setPostsPageTitle = newValue => {
    editEntityRecord('postType', 'page', postsPageId, {
      title: newValue
    });
  };
  const decodedTitle = (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(postsPageTitle);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_panel_row, {
    label: (0,external_wp_i18n_namespaceObject.__)('Blog title'),
    ref: setPopoverAnchor,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
      popoverProps: popoverProps,
      contentClassName: "editor-blog-title-dropdown__content",
      focusOnMount: true,
      renderToggle: ({
        isOpen,
        onToggle
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        size: "compact",
        variant: "tertiary",
        "aria-expanded": isOpen,
        "aria-label": (0,external_wp_i18n_namespaceObject.sprintf)(
        (0,external_wp_i18n_namespaceObject.__)('Change blog title: %s'), decodedTitle),
        onClick: onToggle,
        children: decodedTitle
      }),
      renderContent: ({
        onClose
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalInspectorPopoverHeader, {
          title: (0,external_wp_i18n_namespaceObject.__)('Blog title'),
          onClose: onClose
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalInputControl, {
          placeholder: (0,external_wp_i18n_namespaceObject.__)('No title'),
          size: "__unstable-large",
          value: postsPageTitle,
          onChange: (0,external_wp_compose_namespaceObject.debounce)(setPostsPageTitle, 300),
          label: (0,external_wp_i18n_namespaceObject.__)('Blog title'),
          help: (0,external_wp_i18n_namespaceObject.__)('Set the Posts Page title. Appears in search results, and when the page is shared on social media.'),
          hideLabelFromVision: true
        })]
      })
    })
  });
}
;
function PostsPerPage() {
  const {
    editEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const {
    postsPerPage,
    isTemplate,
    postSlug
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedPostAttribute,
      getCurrentPostType
    } = select(store_store);
    const {
      getEditedEntityRecord,
      canUser
    } = select(external_wp_coreData_namespaceObject.store);
    const siteSettings = canUser('read', {
      kind: 'root',
      name: 'site'
    }) ? getEditedEntityRecord('root', 'site') : undefined;
    return {
      isTemplate: getCurrentPostType() === TEMPLATE_POST_TYPE,
      postSlug: getEditedPostAttribute('slug'),
      postsPerPage: siteSettings?.posts_per_page || 1
    };
  }, []);
  const [popoverAnchor, setPopoverAnchor] = (0,external_wp_element_namespaceObject.useState)(null);
  const popoverProps = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    anchor: popoverAnchor,
    placement: 'left-start',
    offset: 36,
    shift: true
  }), [popoverAnchor]);
  if (!isTemplate || !['home', 'index'].includes(postSlug)) {
    return null;
  }
  const setPostsPerPage = newValue => {
    editEntityRecord('root', 'site', undefined, {
      posts_per_page: newValue
    });
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_panel_row, {
    label: (0,external_wp_i18n_namespaceObject.__)('Posts per page'),
    ref: setPopoverAnchor,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
      popoverProps: popoverProps,
      contentClassName: "editor-posts-per-page-dropdown__content",
      focusOnMount: true,
      renderToggle: ({
        isOpen,
        onToggle
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        size: "compact",
        variant: "tertiary",
        "aria-expanded": isOpen,
        "aria-label": (0,external_wp_i18n_namespaceObject.__)('Change posts per page'),
        onClick: onToggle,
        children: postsPerPage
      }),
      renderContent: ({
        onClose
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalInspectorPopoverHeader, {
          title: (0,external_wp_i18n_namespaceObject.__)('Posts per page'),
          onClose: onClose
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalNumberControl, {
          placeholder: 0,
          value: postsPerPage,
          size: "__unstable-large",
          spinControls: "custom",
          step: "1",
          min: "1",
          onChange: setPostsPerPage,
          label: (0,external_wp_i18n_namespaceObject.__)('Posts per page'),
          help: (0,external_wp_i18n_namespaceObject.__)('Set the default number of posts to display on blog pages, including categories and tags. Some templates may override this setting.'),
          hideLabelFromVision: true
        })]
      })
    })
  });
}
;
const site_discussion_COMMENT_OPTIONS = [{
  label: (0,external_wp_i18n_namespaceObject._x)('Open', 'Adjective: e.g. "Comments are open"'),
  value: 'open',
  description: (0,external_wp_i18n_namespaceObject.__)('Visitors can add new comments and replies.')
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Closed'),
  value: '',
  description: [(0,external_wp_i18n_namespaceObject.__)('Visitors cannot add new comments or replies.'), (0,external_wp_i18n_namespaceObject.__)('Existing comments remain visible.')].join(' ')
}];
function SiteDiscussion() {
  const {
    editEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const {
    allowCommentsOnNewPosts,
    isTemplate,
    postSlug
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditedPostAttribute,
      getCurrentPostType
    } = select(store_store);
    const {
      getEditedEntityRecord,
      canUser
    } = select(external_wp_coreData_namespaceObject.store);
    const siteSettings = canUser('read', {
      kind: 'root',
      name: 'site'
    }) ? getEditedEntityRecord('root', 'site') : undefined;
    return {
      isTemplate: getCurrentPostType() === TEMPLATE_POST_TYPE,
      postSlug: getEditedPostAttribute('slug'),
      allowCommentsOnNewPosts: siteSettings?.default_comment_status || ''
    };
  }, []);
  const [popoverAnchor, setPopoverAnchor] = (0,external_wp_element_namespaceObject.useState)(null);
  const popoverProps = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    anchor: popoverAnchor,
    placement: 'left-start',
    offset: 36,
    shift: true
  }), [popoverAnchor]);
  if (!isTemplate || !['home', 'index'].includes(postSlug)) {
    return null;
  }
  const setAllowCommentsOnNewPosts = newValue => {
    editEntityRecord('root', 'site', undefined, {
      default_comment_status: newValue ? 'open' : null
    });
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_panel_row, {
    label: (0,external_wp_i18n_namespaceObject.__)('Discussion'),
    ref: setPopoverAnchor,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Dropdown, {
      popoverProps: popoverProps,
      contentClassName: "editor-site-discussion-dropdown__content",
      focusOnMount: true,
      renderToggle: ({
        isOpen,
        onToggle
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
        size: "compact",
        variant: "tertiary",
        "aria-expanded": isOpen,
        "aria-label": (0,external_wp_i18n_namespaceObject.__)('Change discussion settings'),
        onClick: onToggle,
        children: allowCommentsOnNewPosts ? (0,external_wp_i18n_namespaceObject.__)('Comments open') : (0,external_wp_i18n_namespaceObject.__)('Comments closed')
      }),
      renderContent: ({
        onClose
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalInspectorPopoverHeader, {
          title: (0,external_wp_i18n_namespaceObject.__)('Discussion'),
          onClose: onClose
        }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
          spacing: 3,
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalText, {
            children: (0,external_wp_i18n_namespaceObject.__)('Changes will apply to new posts only. Individual posts may override these settings.')
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.RadioControl, {
            className: "editor-site-discussion__options",
            hideLabelFromVision: true,
            label: (0,external_wp_i18n_namespaceObject.__)('Comment status'),
            options: site_discussion_COMMENT_OPTIONS,
            onChange: setAllowCommentsOnNewPosts,
            selected: allowCommentsOnNewPosts
          })]
        })]
      })
    })
  });
}
;
const post_summary_PANEL_NAME = 'post-status';
function PostSummary({
  onActionPerformed
}) {
  const {
    isRemovedPostStatusPanel,
    postType,
    postId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      isEditorPanelRemoved,
      getCurrentPostType,
      getCurrentPostId
    } = select(store_store);
    return {
      isRemovedPostStatusPanel: isEditorPanelRemoved(post_summary_PANEL_NAME),
      postType: getCurrentPostType(),
      postId: getCurrentPostId()
    };
  }, []);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_panel_section, {
    className: "editor-post-summary",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(plugin_post_status_info.Slot, {
      children: fills => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_ReactJSXRuntime_namespaceObject.Fragment, {
        children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
          spacing: 4,
          children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(PostCardPanel, {
            postType: postType,
            postId: postId,
            onActionPerformed: onActionPerformed
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostFeaturedImagePanel, {
            withPanelBody: false
          }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PrivatePostExcerptPanel, {}), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
            spacing: 1,
            children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(PostContentInformation, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostLastEditedPanel, {})]
          }), !isRemovedPostStatusPanel && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
            spacing: 4,
            children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
              spacing: 1,
              children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(PostStatus, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostSchedulePanel, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostURLPanel, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(panel, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostTemplatePanel, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostDiscussionPanel, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PrivatePostLastRevision, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PageAttributesPanel, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostSyncStatus, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(BlogTitle, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostsPerPage, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(SiteDiscussion, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_format_panel, {}), fills]
            }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostTrash, {
              onActionPerformed: onActionPerformed
            })]
          })]
        })
      })
    })
  });
}
;
const {
  EXCLUDED_PATTERN_SOURCES,
  PATTERN_TYPES: hooks_PATTERN_TYPES
} = unlock(external_wp_patterns_namespaceObject.privateApis);
function injectThemeAttributeInBlockTemplateContent(block, currentThemeStylesheet) {
  block.innerBlocks = block.innerBlocks.map(innerBlock => {
    return injectThemeAttributeInBlockTemplateContent(innerBlock, currentThemeStylesheet);
  });
  if (block.name === 'core/template-part' && block.attributes.theme === undefined) {
    block.attributes.theme = currentThemeStylesheet;
  }
  return block;
}
function filterPatterns(patterns, template) {
  const filterOutDuplicatesByName = (currentItem, index, items) => index === items.findIndex(item => currentItem.name === item.name);
  const filterOutExcludedPatternSources = pattern => !EXCLUDED_PATTERN_SOURCES.includes(pattern.source);
  const filterCompatiblePatterns = pattern => pattern.templateTypes?.includes(template.slug) || pattern.blockTypes?.includes('core/template-part/' + template.area);
  return patterns.filter((pattern, index, items) => {
    return filterOutDuplicatesByName(pattern, index, items) && filterOutExcludedPatternSources(pattern) && filterCompatiblePatterns(pattern);
  });
}
function preparePatterns(patterns, currentThemeStylesheet) {
  return patterns.map(pattern => ({
    ...pattern,
    keywords: pattern.keywords || [],
    type: hooks_PATTERN_TYPES.theme,
    blocks: (0,external_wp_blocks_namespaceObject.parse)(pattern.content, {
      __unstableSkipMigrationLogs: true
    }).map(block => injectThemeAttributeInBlockTemplateContent(block, currentThemeStylesheet))
  }));
}
function useAvailablePatterns(template) {
  const {
    blockPatterns,
    restBlockPatterns,
    currentThemeStylesheet
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _settings$__experimen;
    const {
      getEditorSettings
    } = select(store_store);
    const settings = getEditorSettings();
    return {
      blockPatterns: (_settings$__experimen = settings.__experimentalAdditionalBlockPatterns) !== null && _settings$__experimen !== void 0 ? _settings$__experimen : settings.__experimentalBlockPatterns,
      restBlockPatterns: select(external_wp_coreData_namespaceObject.store).getBlockPatterns(),
      currentThemeStylesheet: select(external_wp_coreData_namespaceObject.store).getCurrentTheme().stylesheet
    };
  }, []);
  return (0,external_wp_element_namespaceObject.useMemo)(() => {
    const mergedPatterns = [...(blockPatterns || []), ...(restBlockPatterns || [])];
    const filteredPatterns = filterPatterns(mergedPatterns, template);
    return preparePatterns(filteredPatterns, template, currentThemeStylesheet);
  }, [blockPatterns, restBlockPatterns, template, currentThemeStylesheet]);
}
;
function post_transform_panel_TemplatesList({
  availableTemplates,
  onSelect
}) {
  if (!availableTemplates || availableTemplates?.length === 0) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__experimentalBlockPatternsList, {
    label: (0,external_wp_i18n_namespaceObject.__)('Templates'),
    blockPatterns: availableTemplates,
    onClickPattern: onSelect,
    showTitlesAsTooltip: true
  });
}
function PostTransform() {
  const {
    record,
    postType,
    postId
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostType,
      getCurrentPostId
    } = select(store_store);
    const {
      getEditedEntityRecord
    } = select(external_wp_coreData_namespaceObject.store);
    const type = getCurrentPostType();
    const id = getCurrentPostId();
    return {
      postType: type,
      postId: id,
      record: getEditedEntityRecord('postType', type, id)
    };
  }, []);
  const {
    editEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_coreData_namespaceObject.store);
  const availablePatterns = useAvailablePatterns(record);
  const onTemplateSelect = async selectedTemplate => {
    await editEntityRecord('postType', postType, postId, {
      blocks: selectedTemplate.blocks,
      content: (0,external_wp_blocks_namespaceObject.serialize)(selectedTemplate.blocks)
    });
  };
  if (!availablePatterns?.length) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
    title: (0,external_wp_i18n_namespaceObject.__)('Design'),
    initialOpen: record.type === TEMPLATE_PART_POST_TYPE,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_transform_panel_TemplatesList, {
      availableTemplates: availablePatterns,
      onSelect: onTemplateSelect
    })
  });
}
function PostTransformPanel() {
  const {
    postType
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostType
    } = select(store_store);
    return {
      postType: getCurrentPostType()
    };
  }, []);
  if (![TEMPLATE_PART_POST_TYPE, TEMPLATE_POST_TYPE].includes(postType)) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostTransform, {});
}
;
const sidebars = {
  document: 'edit-post/document',
  block: 'edit-post/block'
};
;
const {
  Tabs
} = unlock(external_wp_components_namespaceObject.privateApis);
const SidebarHeader = (_, ref) => {
  const {
    documentLabel
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getPostTypeLabel
    } = select(store_store);
    return {
      documentLabel:
      getPostTypeLabel() || (0,external_wp_i18n_namespaceObject._x)('Document', 'noun, panel')
    };
  }, []);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(Tabs.TabList, {
    ref: ref,
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(Tabs.Tab, {
      tabId: sidebars.document
      ,
      "data-tab-id": sidebars.document,
      children: documentLabel
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(Tabs.Tab, {
      tabId: sidebars.block
      ,
      "data-tab-id": sidebars.block,
      children: (0,external_wp_i18n_namespaceObject.__)('Block')
    })]
  });
};
 const sidebar_header = ((0,external_wp_element_namespaceObject.forwardRef)(SidebarHeader));
;
const {
  BlockQuickNavigation
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
const template_content_panel_POST_CONTENT_BLOCK_TYPES = ['core/post-title', 'core/post-featured-image', 'core/post-content'];
const TEMPLATE_PART_BLOCK = 'core/template-part';
function TemplateContentPanel() {
  const postContentBlockTypes = (0,external_wp_element_namespaceObject.useMemo)(() => (0,external_wp_hooks_namespaceObject.applyFilters)('editor.postContentBlockTypes', template_content_panel_POST_CONTENT_BLOCK_TYPES), []);
  const {
    clientIds,
    postType,
    renderingMode
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostType,
      getPostBlocksByName,
      getRenderingMode
    } = unlock(select(store_store));
    const _postType = getCurrentPostType();
    return {
      postType: _postType,
      clientIds: getPostBlocksByName(TEMPLATE_POST_TYPE === _postType ? TEMPLATE_PART_BLOCK : postContentBlockTypes),
      renderingMode: getRenderingMode()
    };
  }, [postContentBlockTypes]);
  const {
    enableComplementaryArea
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  if (renderingMode === 'post-only' && postType !== TEMPLATE_POST_TYPE || clientIds.length === 0) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
    title: (0,external_wp_i18n_namespaceObject.__)('Content'),
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(BlockQuickNavigation, {
      clientIds: clientIds,
      onSelect: () => {
        enableComplementaryArea('core', 'edit-post/document');
      }
    })
  });
}
;
const {
  BlockQuickNavigation: template_part_content_panel_BlockQuickNavigation
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
function TemplatePartContentPanelInner() {
  const blockTypes = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getBlockTypes
    } = select(external_wp_blocks_namespaceObject.store);
    return getBlockTypes();
  }, []);
  const themeBlockNames = (0,external_wp_element_namespaceObject.useMemo)(() => {
    return blockTypes.filter(blockType => {
      return blockType.category === 'theme';
    }).map(({
      name
    }) => name);
  }, [blockTypes]);
  const themeBlocks = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getBlocksByName
    } = select(external_wp_blockEditor_namespaceObject.store);
    return getBlocksByName(themeBlockNames);
  }, [themeBlockNames]);
  if (themeBlocks.length === 0) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.PanelBody, {
    title: (0,external_wp_i18n_namespaceObject.__)('Content'),
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(template_part_content_panel_BlockQuickNavigation, {
      clientIds: themeBlocks
    })
  });
}
function TemplatePartContentPanel() {
  const postType = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getCurrentPostType
    } = select(store_store);
    return getCurrentPostType();
  }, []);
  if (postType !== TEMPLATE_PART_POST_TYPE) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(TemplatePartContentPanelInner, {});
}
;
function useAutoSwitchEditorSidebars() {
  const {
    hasBlockSelection
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return {
      hasBlockSelection: !!select(external_wp_blockEditor_namespaceObject.store).getBlockSelectionStart()
    };
  }, []);
  const {
    getActiveComplementaryArea
  } = (0,external_wp_data_namespaceObject.useSelect)(store);
  const {
    enableComplementaryArea
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const {
    get: getPreference
  } = (0,external_wp_data_namespaceObject.useSelect)(external_wp_preferences_namespaceObject.store);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    const activeGeneralSidebar = getActiveComplementaryArea('core');
    const isEditorSidebarOpened = ['edit-post/document', 'edit-post/block'].includes(activeGeneralSidebar);
    const isDistractionFree = getPreference('core', 'distractionFree');
    if (!isEditorSidebarOpened || isDistractionFree) {
      return;
    }
    if (hasBlockSelection) {
      enableComplementaryArea('core', 'edit-post/block');
    } else {
      enableComplementaryArea('core', 'edit-post/document');
    }
  }, [hasBlockSelection, getActiveComplementaryArea, enableComplementaryArea, getPreference]);
}
 const use_auto_switch_editor_sidebars = (useAutoSwitchEditorSidebars);
;
const {
  Tabs: sidebar_Tabs
} = unlock(external_wp_components_namespaceObject.privateApis);
const SIDEBAR_ACTIVE_BY_DEFAULT = external_wp_element_namespaceObject.Platform.select({
  web: true,
  native: false
});
const SidebarContent = ({
  tabName,
  keyboardShortcut,
  onActionPerformed,
  extraPanels
}) => {
  const tabListRef = (0,external_wp_element_namespaceObject.useRef)(null);
  const tabsContextValue = (0,external_wp_element_namespaceObject.useContext)(sidebar_Tabs.Context);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    const tabsElements = Array.from(tabListRef.current?.querySelectorAll('[role="tab"]') || []);
    const selectedTabElement = tabsElements.find(
    element => element.getAttribute('data-tab-id') === tabName);
    const activeElement = selectedTabElement?.ownerDocument.activeElement;
    const tabsHasFocus = tabsElements.some(element => {
      return activeElement && activeElement.id === element.id;
    });
    if (tabsHasFocus && selectedTabElement && selectedTabElement.id !== activeElement?.id) {
      selectedTabElement?.focus();
    }
  }, [tabName]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PluginSidebar, {
    identifier: tabName,
    header: (0,external_ReactJSXRuntime_namespaceObject.jsx)(sidebar_Tabs.Context.Provider, {
      value: tabsContextValue,
      children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(sidebar_header, {
        ref: tabListRef
      })
    }),
    closeLabel: (0,external_wp_i18n_namespaceObject.__)('Close Settings')
    ,
    className: "editor-sidebar__panel",
    headerClassName: "editor-sidebar__panel-tabs",
    title: 
    (0,external_wp_i18n_namespaceObject._x)('Settings', 'panel button label'),
    toggleShortcut: keyboardShortcut,
    icon: (0,external_wp_i18n_namespaceObject.isRTL)() ? drawer_left : drawer_right,
    isActiveByDefault: SIDEBAR_ACTIVE_BY_DEFAULT,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(sidebar_Tabs.Context.Provider, {
      value: tabsContextValue,
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)(sidebar_Tabs.TabPanel, {
        tabId: sidebars.document,
        focusable: false,
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(PostSummary, {
          onActionPerformed: onActionPerformed
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(plugin_document_setting_panel.Slot, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(TemplateContentPanel, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(TemplatePartContentPanel, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PostTransformPanel, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(panel_PostTaxonomies, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PatternOverridesPanel, {}), extraPanels]
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(sidebar_Tabs.TabPanel, {
        tabId: sidebars.block,
        focusable: false,
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.BlockInspector, {})
      })]
    })
  });
};
const Sidebar = ({
  extraPanels,
  onActionPerformed
}) => {
  use_auto_switch_editor_sidebars();
  const {
    tabName,
    keyboardShortcut,
    showSummary
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const shortcut = select(external_wp_keyboardShortcuts_namespaceObject.store).getShortcutRepresentation('core/editor/toggle-sidebar');
    const sidebar = select(store).getActiveComplementaryArea('core');
    const _isEditorSidebarOpened = [sidebars.block, sidebars.document].includes(sidebar);
    let _tabName = sidebar;
    if (!_isEditorSidebarOpened) {
      _tabName = !!select(external_wp_blockEditor_namespaceObject.store).getBlockSelectionStart() ? sidebars.block : sidebars.document;
    }
    return {
      tabName: _tabName,
      keyboardShortcut: shortcut,
      showSummary: ![TEMPLATE_POST_TYPE, TEMPLATE_PART_POST_TYPE, NAVIGATION_POST_TYPE].includes(select(store_store).getCurrentPostType())
    };
  }, []);
  const {
    enableComplementaryArea
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const onTabSelect = (0,external_wp_element_namespaceObject.useCallback)(newSelectedTabId => {
    if (!!newSelectedTabId) {
      enableComplementaryArea('core', newSelectedTabId);
    }
  }, [enableComplementaryArea]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(sidebar_Tabs, {
    selectedTabId: tabName,
    onSelect: onTabSelect,
    selectOnMove: false,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(SidebarContent, {
      tabName: tabName,
      keyboardShortcut: keyboardShortcut,
      showSummary: showSummary,
      onActionPerformed: onActionPerformed,
      extraPanels: extraPanels
    })
  });
};
 const components_sidebar = (Sidebar);
;
function Editor({
  postType,
  postId,
  templateId,
  settings,
  children,
  initialEdits,
  onActionPerformed,
  extraContent,
  extraSidebarPanels,
  ...props
}) {
  const {
    post,
    template,
    hasLoadedPost,
    error
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord,
      getResolutionError,
      hasFinishedResolution
    } = select(external_wp_coreData_namespaceObject.store);
    const postArgs = ['postType', postType, postId];
    return {
      post: getEntityRecord(...postArgs),
      template: templateId ? getEntityRecord('postType', TEMPLATE_POST_TYPE, templateId) : undefined,
      hasLoadedPost: hasFinishedResolution('getEntityRecord', postArgs),
      error: getResolutionError('getEntityRecord', postArgs)?.message
    };
  }, [postType, postId, templateId]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [hasLoadedPost && !post && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Notice, {
      status: !!error ? 'error' : 'warning',
      isDismissible: false,
      children: !error ? (0,external_wp_i18n_namespaceObject.__)("You attempted to edit an item that doesn't exist. Perhaps it was deleted?") : error
    }), !!post && (0,external_ReactJSXRuntime_namespaceObject.jsxs)(ExperimentalEditorProvider, {
      post: post,
      __unstableTemplate: template,
      settings: settings,
      initialEdits: initialEdits,
      useSubRegistry: false,
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(EditorInterface, {
        ...props,
        children: extraContent
      }), children, (0,external_ReactJSXRuntime_namespaceObject.jsx)(components_sidebar, {
        onActionPerformed: onActionPerformed,
        extraPanels: extraSidebarPanels
      })]
    })]
  });
}
 const editor = (Editor);
;
const {
  PreferenceBaseOption: enable_publish_sidebar_PreferenceBaseOption
} = unlock(external_wp_preferences_namespaceObject.privateApis);
function EnablePublishSidebarOption(props) {
  const isChecked = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return select(store_store).isPublishSidebarEnabled();
  }, []);
  const {
    enablePublishSidebar,
    disablePublishSidebar
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(enable_publish_sidebar_PreferenceBaseOption, {
    isChecked: isChecked,
    onChange: isEnabled => isEnabled ? enablePublishSidebar() : disablePublishSidebar(),
    ...props
  });
}
;
const {
  BlockManager
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
const block_visibility_EMPTY_ARRAY = [];
function BlockVisibility() {
  const {
    showBlockTypes,
    hideBlockTypes
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(store_store));
  const {
    blockTypes,
    allowedBlockTypes: _allowedBlockTypes,
    hiddenBlockTypes: _hiddenBlockTypes
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$get;
    return {
      blockTypes: select(external_wp_blocks_namespaceObject.store).getBlockTypes(),
      allowedBlockTypes: select(store_store).getEditorSettings().allowedBlockTypes,
      hiddenBlockTypes: (_select$get = select(external_wp_preferences_namespaceObject.store).get('core', 'hiddenBlockTypes')) !== null && _select$get !== void 0 ? _select$get : block_visibility_EMPTY_ARRAY
    };
  }, []);
  const allowedBlockTypes = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (_allowedBlockTypes === true) {
      return blockTypes;
    }
    return blockTypes.filter(({
      name
    }) => {
      return _allowedBlockTypes?.includes(name);
    });
  }, [_allowedBlockTypes, blockTypes]);
  const filteredBlockTypes = allowedBlockTypes.filter(blockType => (0,external_wp_blocks_namespaceObject.hasBlockSupport)(blockType, 'inserter', true) && (!blockType.parent || blockType.parent.includes('core/post-content')));
  const hiddenBlockTypes = _hiddenBlockTypes.filter(hiddenBlock => {
    return filteredBlockTypes.some(registeredBlock => registeredBlock.name === hiddenBlock);
  });
  const selectedBlockTypes = filteredBlockTypes.filter(blockType => !hiddenBlockTypes.includes(blockType.name));
  const onChangeSelectedBlockTypes = newSelectedBlockTypes => {
    if (selectedBlockTypes.length > newSelectedBlockTypes.length) {
      const blockTypesToHide = selectedBlockTypes.filter(blockType => !newSelectedBlockTypes.find(({
        name
      }) => name === blockType.name));
      hideBlockTypes(blockTypesToHide.map(({
        name
      }) => name));
    } else if (selectedBlockTypes.length < newSelectedBlockTypes.length) {
      const blockTypesToShow = newSelectedBlockTypes.filter(blockType => !selectedBlockTypes.find(({
        name
      }) => name === blockType.name));
      showBlockTypes(blockTypesToShow.map(({
        name
      }) => name));
    }
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(BlockManager, {
    blockTypes: filteredBlockTypes,
    selectedBlockTypes: selectedBlockTypes,
    onChange: onChangeSelectedBlockTypes
  });
}
;
const {
  PreferencesModal,
  PreferencesModalTabs,
  PreferencesModalSection,
  PreferenceToggleControl
} = unlock(external_wp_preferences_namespaceObject.privateApis);
function EditorPreferencesModal({
  extraSections = {}
}) {
  const isActive = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return select(store).isModalActive('editor/preferences');
  }, []);
  const {
    closeModal
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  if (!isActive) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferencesModal, {
    closeModal: closeModal,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferencesModalContents, {
      extraSections: extraSections
    })
  });
}
function PreferencesModalContents({
  extraSections = {}
}) {
  const isLargeViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('medium');
  const showBlockBreadcrumbsOption = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEditorSettings
    } = select(store_store);
    const {
      get
    } = select(external_wp_preferences_namespaceObject.store);
    const isRichEditingEnabled = getEditorSettings().richEditingEnabled;
    const isDistractionFreeEnabled = get('core', 'distractionFree');
    return !isDistractionFreeEnabled && isLargeViewport && isRichEditingEnabled;
  }, [isLargeViewport]);
  const {
    setIsListViewOpened,
    setIsInserterOpened
  } = (0,external_wp_data_namespaceObject.useDispatch)(store_store);
  const {
    set: setPreference
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_preferences_namespaceObject.store);
  const sections = (0,external_wp_element_namespaceObject.useMemo)(() => [{
    name: 'general',
    tabLabel: (0,external_wp_i18n_namespaceObject.__)('General'),
    content: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsxs)(PreferencesModalSection, {
        title: (0,external_wp_i18n_namespaceObject.__)('Interface'),
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferenceToggleControl, {
          scope: "core",
          featureName: "showListViewByDefault",
          help: (0,external_wp_i18n_namespaceObject.__)('Opens the List View panel by default.'),
          label: (0,external_wp_i18n_namespaceObject.__)('Always open List View')
        }), showBlockBreadcrumbsOption && (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferenceToggleControl, {
          scope: "core",
          featureName: "showBlockBreadcrumbs",
          help: (0,external_wp_i18n_namespaceObject.__)('Display the block hierarchy trail at the bottom of the editor.'),
          label: (0,external_wp_i18n_namespaceObject.__)('Show block breadcrumbs')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferenceToggleControl, {
          scope: "core",
          featureName: "allowRightClickOverrides",
          help: (0,external_wp_i18n_namespaceObject.__)('Allows contextual List View menus via right-click, overriding browser defaults.'),
          label: (0,external_wp_i18n_namespaceObject.__)('Allow right-click contextual menus')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferenceToggleControl, {
          scope: "core",
          featureName: "enableChoosePatternModal",
          help: (0,external_wp_i18n_namespaceObject.__)('Shows starter patterns when creating a new page.'),
          label: (0,external_wp_i18n_namespaceObject.__)('Show starter patterns')
        })]
      }), (0,external_ReactJSXRuntime_namespaceObject.jsxs)(PreferencesModalSection, {
        title: (0,external_wp_i18n_namespaceObject.__)('Document settings'),
        description: (0,external_wp_i18n_namespaceObject.__)('Select what settings are shown in the document panel.'),
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(enable_plugin_document_setting_panel.Slot, {}), (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_taxonomies, {
          taxonomyWrapper: (content, taxonomy) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(EnablePanelOption, {
            label: taxonomy.labels.menu_name,
            panelName: `taxonomy-panel-${taxonomy.slug}`
          })
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_featured_image_check, {
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(EnablePanelOption, {
            label: (0,external_wp_i18n_namespaceObject.__)('Featured image'),
            panelName: "featured-image"
          })
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_excerpt_check, {
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(EnablePanelOption, {
            label: (0,external_wp_i18n_namespaceObject.__)('Excerpt'),
            panelName: "post-excerpt"
          })
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(post_type_support_check, {
          supportKeys: ['comments', 'trackbacks'],
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(EnablePanelOption, {
            label: (0,external_wp_i18n_namespaceObject.__)('Discussion'),
            panelName: "discussion-panel"
          })
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(page_attributes_check, {
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(EnablePanelOption, {
            label: (0,external_wp_i18n_namespaceObject.__)('Page attributes'),
            panelName: "page-attributes"
          })
        })]
      }), isLargeViewport && (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferencesModalSection, {
        title: (0,external_wp_i18n_namespaceObject.__)('Publishing'),
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(EnablePublishSidebarOption, {
          help: (0,external_wp_i18n_namespaceObject.__)('Review settings, such as visibility and tags.'),
          label: (0,external_wp_i18n_namespaceObject.__)('Enable pre-publish checks')
        })
      }), extraSections?.general]
    })
  }, {
    name: 'appearance',
    tabLabel: (0,external_wp_i18n_namespaceObject.__)('Appearance'),
    content: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(PreferencesModalSection, {
      title: (0,external_wp_i18n_namespaceObject.__)('Appearance'),
      description: (0,external_wp_i18n_namespaceObject.__)('Customize the editor interface to suit your needs.'),
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferenceToggleControl, {
        scope: "core",
        featureName: "fixedToolbar",
        onToggle: () => setPreference('core', 'distractionFree', false),
        help: (0,external_wp_i18n_namespaceObject.__)('Access all block and document tools in a single place.'),
        label: (0,external_wp_i18n_namespaceObject.__)('Top toolbar')
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferenceToggleControl, {
        scope: "core",
        featureName: "distractionFree",
        onToggle: () => {
          setPreference('core', 'fixedToolbar', true);
          setIsInserterOpened(false);
          setIsListViewOpened(false);
        },
        help: (0,external_wp_i18n_namespaceObject.__)('Reduce visual distractions by hiding the toolbar and other elements to focus on writing.'),
        label: (0,external_wp_i18n_namespaceObject.__)('Distraction free')
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferenceToggleControl, {
        scope: "core",
        featureName: "focusMode",
        help: (0,external_wp_i18n_namespaceObject.__)('Highlights the current block and fades other content.'),
        label: (0,external_wp_i18n_namespaceObject.__)('Spotlight mode')
      }), extraSections?.appearance]
    })
  }, {
    name: 'accessibility',
    tabLabel: (0,external_wp_i18n_namespaceObject.__)('Accessibility'),
    content: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferencesModalSection, {
        title: (0,external_wp_i18n_namespaceObject.__)('Navigation'),
        description: (0,external_wp_i18n_namespaceObject.__)('Optimize the editing experience for enhanced control.'),
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferenceToggleControl, {
          scope: "core",
          featureName: "keepCaretInsideBlock",
          help: (0,external_wp_i18n_namespaceObject.__)('Keeps the text cursor within blocks while navigating with arrow keys, preventing it from moving to other blocks and enhancing accessibility for keyboard users.'),
          label: (0,external_wp_i18n_namespaceObject.__)('Contain text cursor inside block')
        })
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferencesModalSection, {
        title: (0,external_wp_i18n_namespaceObject.__)('Interface'),
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferenceToggleControl, {
          scope: "core",
          featureName: "showIconLabels",
          label: (0,external_wp_i18n_namespaceObject.__)('Show button text labels'),
          help: (0,external_wp_i18n_namespaceObject.__)('Show text instead of icons on buttons across the interface.')
        })
      })]
    })
  }, {
    name: 'blocks',
    tabLabel: (0,external_wp_i18n_namespaceObject.__)('Blocks'),
    content: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferencesModalSection, {
        title: (0,external_wp_i18n_namespaceObject.__)('Inserter'),
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferenceToggleControl, {
          scope: "core",
          featureName: "mostUsedBlocks",
          help: (0,external_wp_i18n_namespaceObject.__)('Adds a category with the most frequently used blocks in the inserter.'),
          label: (0,external_wp_i18n_namespaceObject.__)('Show most used blocks')
        })
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferencesModalSection, {
        title: (0,external_wp_i18n_namespaceObject.__)('Manage block visibility'),
        description: (0,external_wp_i18n_namespaceObject.__)("Disable blocks that you don't want to appear in the inserter. They can always be toggled back on later."),
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(BlockVisibility, {})
      })]
    })
  }, window.__experimentalMediaProcessing && {
    name: 'media',
    tabLabel: (0,external_wp_i18n_namespaceObject.__)('Media'),
    content: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(PreferencesModalSection, {
        title: (0,external_wp_i18n_namespaceObject.__)('General'),
        description: (0,external_wp_i18n_namespaceObject.__)('Customize options related to the media upload flow.'),
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferenceToggleControl, {
          scope: "core/media",
          featureName: "optimizeOnUpload",
          help: (0,external_wp_i18n_namespaceObject.__)('Compress media items before uploading to the server.'),
          label: (0,external_wp_i18n_namespaceObject.__)('Pre-upload compression')
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferenceToggleControl, {
          scope: "core/media",
          featureName: "requireApproval",
          help: (0,external_wp_i18n_namespaceObject.__)('Require approval step when optimizing existing media.'),
          label: (0,external_wp_i18n_namespaceObject.__)('Approval step')
        })]
      })
    })
  }].filter(Boolean), [showBlockBreadcrumbsOption, extraSections, setIsInserterOpened, setIsListViewOpened, setPreference, isLargeViewport]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(PreferencesModalTabs, {
    sections: sections
  });
}
;
function usePostFields({
  postType
}) {
  const {
    registerPostTypeSchema
  } = unlock((0,external_wp_data_namespaceObject.useDispatch)(store_store));
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    registerPostTypeSchema(postType);
  }, [registerPostTypeSchema, postType]);
  const {
    defaultFields
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityFields
    } = unlock(select(store_store));
    return {
      defaultFields: getEntityFields('postType', postType)
    };
  }, [postType]);
  const {
    records: authors,
    isResolving: isLoadingAuthors
  } = (0,external_wp_coreData_namespaceObject.useEntityRecords)('root', 'user', {
    per_page: -1
  });
  const fields = (0,external_wp_element_namespaceObject.useMemo)(() => defaultFields.map(field => {
    if (field.id === 'author') {
      return {
        ...field,
        elements: authors?.map(({
          id,
          name
        }) => ({
          value: id,
          label: name
        }))
      };
    }
    return field;
  }), [authors, defaultFields]);
  return {
    isLoading: isLoadingAuthors,
    fields
  };
}
 const post_fields = (usePostFields);
;
const CONTENT = 'content';
 const pattern_overrides = ({
  name: 'core/pattern-overrides',
  getValues({
    select,
    clientId,
    context,
    bindings
  }) {
    const patternOverridesContent = context['pattern/overrides'];
    const {
      getBlockAttributes
    } = select(external_wp_blockEditor_namespaceObject.store);
    const currentBlockAttributes = getBlockAttributes(clientId);
    const overridesValues = {};
    for (const attributeName of Object.keys(bindings)) {
      const overridableValue = patternOverridesContent?.[currentBlockAttributes?.metadata?.name]?.[attributeName];
      if (overridableValue === undefined) {
        overridesValues[attributeName] = currentBlockAttributes[attributeName];
        continue;
      } else {
        overridesValues[attributeName] = overridableValue === '' ? undefined : overridableValue;
      }
    }
    return overridesValues;
  },
  setValues({
    select,
    dispatch,
    clientId,
    bindings
  }) {
    const {
      getBlockAttributes,
      getBlockParentsByBlockName,
      getBlocks
    } = select(external_wp_blockEditor_namespaceObject.store);
    const currentBlockAttributes = getBlockAttributes(clientId);
    const blockName = currentBlockAttributes?.metadata?.name;
    if (!blockName) {
      return;
    }
    const [patternClientId] = getBlockParentsByBlockName(clientId, 'core/block', true);
    const attributes = Object.entries(bindings).reduce((attrs, [key, {
      newValue
    }]) => {
      attrs[key] = newValue;
      return attrs;
    }, {});
    if (!patternClientId) {
      const syncBlocksWithSameName = blocks => {
        for (const block of blocks) {
          if (block.attributes?.metadata?.name === blockName) {
            dispatch(external_wp_blockEditor_namespaceObject.store).updateBlockAttributes(block.clientId, attributes);
          }
          syncBlocksWithSameName(block.innerBlocks);
        }
      };
      syncBlocksWithSameName(getBlocks());
      return;
    }
    const currentBindingValue = getBlockAttributes(patternClientId)?.[CONTENT];
    dispatch(external_wp_blockEditor_namespaceObject.store).updateBlockAttributes(patternClientId, {
      [CONTENT]: {
        ...currentBindingValue,
        [blockName]: {
          ...currentBindingValue?.[blockName],
          ...Object.entries(attributes).reduce((acc, [key, value]) => {
            acc[key] = value === undefined ? '' : value;
            return acc;
          }, {})
        }
      }
    });
  },
  canUserEditValue: () => true
});
;
function getPostMetaFields(select, context) {
  const {
    getEditedEntityRecord
  } = select(external_wp_coreData_namespaceObject.store);
  const {
    getRegisteredPostMeta
  } = unlock(select(external_wp_coreData_namespaceObject.store));
  let entityMetaValues;
  if (context?.postType && context?.postId) {
    entityMetaValues = getEditedEntityRecord('postType', context?.postType, context?.postId).meta;
  }
  const registeredFields = getRegisteredPostMeta(context?.postType);
  const metaFields = {};
  Object.entries(registeredFields || {}).forEach(([key, props]) => {
    if (key !== 'footnotes' && key.charAt(0) !== '_') {
      var _entityMetaValues$key;
      metaFields[key] = {
        label: props.title || key,
        value: 
        (_entityMetaValues$key = entityMetaValues?.[key]) !== null && _entityMetaValues$key !== void 0 ? _entityMetaValues$key :
        props.default || undefined,
        type: props.type
      };
    }
  });
  if (!Object.keys(metaFields || {}).length) {
    return null;
  }
  return metaFields;
}
 const post_meta = ({
  name: 'core/post-meta',
  getValues({
    select,
    context,
    bindings
  }) {
    const metaFields = getPostMetaFields(select, context);
    const newValues = {};
    for (const [attributeName, source] of Object.entries(bindings)) {
      var _ref;
      const fieldKey = source.args.key;
      const {
        value: fieldValue,
        label: fieldLabel
      } = metaFields?.[fieldKey] || {};
      newValues[attributeName] = (_ref = fieldValue !== null && fieldValue !== void 0 ? fieldValue : fieldLabel) !== null && _ref !== void 0 ? _ref : fieldKey;
    }
    return newValues;
  },
  setValues({
    dispatch,
    context,
    bindings
  }) {
    const newMeta = {};
    Object.values(bindings).forEach(({
      args,
      newValue
    }) => {
      newMeta[args.key] = newValue;
    });
    dispatch(external_wp_coreData_namespaceObject.store).editEntityRecord('postType', context?.postType, context?.postId, {
      meta: newMeta
    });
  },
  canUserEditValue({
    select,
    context,
    args
  }) {
    if (context?.query || context?.queryId) {
      return false;
    }
    if (!context?.postType) {
      return false;
    }
    const fieldValue = getPostMetaFields(select, context)?.[args.key]?.value;
    if (fieldValue === undefined) {
      return false;
    }
    const areCustomFieldsEnabled = select(store_store).getEditorSettings().enableCustomFields;
    if (areCustomFieldsEnabled) {
      return false;
    }
    const canUserEdit = select(external_wp_coreData_namespaceObject.store).canUser('update', {
      kind: 'postType',
      name: context?.postType,
      id: context?.postId
    });
    if (!canUserEdit) {
      return false;
    }
    return true;
  },
  getFieldsList({
    select,
    context
  }) {
    return getPostMetaFields(select, context);
  }
});
;
function registerCoreBlockBindingsSources() {
  (0,external_wp_blocks_namespaceObject.registerBlockBindingsSource)(pattern_overrides);
  (0,external_wp_blocks_namespaceObject.registerBlockBindingsSource)(post_meta);
}
;
const {
  store: interfaceStore,
  ...remainingInterfaceApis
} = build_module_namespaceObject;
const privateApis = {};
lock(privateApis, {
  CreateTemplatePartModal: CreateTemplatePartModal,
  patternTitleField: pattern_title,
  templateTitleField: template_title,
  BackButton: back_button,
  EntitiesSavedStatesExtensible: EntitiesSavedStatesExtensible,
  Editor: editor,
  EditorContentSlotFill: content_slot_fill,
  GlobalStylesProvider: GlobalStylesProvider,
  mergeBaseAndUserConfigs: mergeBaseAndUserConfigs,
  PluginPostExcerpt: post_excerpt_plugin,
  PostCardPanel: PostCardPanel,
  PreferencesModal: EditorPreferencesModal,
  usePostActions: usePostActions,
  usePostFields: post_fields,
  ToolsMoreMenuGroup: tools_more_menu_group,
  ViewMoreMenuGroup: view_more_menu_group,
  ResizableEditor: resizable_editor,
  registerCoreBlockBindingsSources: registerCoreBlockBindingsSources,
  getTemplateInfo: getTemplateInfo,
  interfaceStore,
  ...remainingInterfaceApis
});
;
function api_registerEntityAction(kind, name, config) {
  const {
    registerEntityAction: _registerEntityAction
  } = unlock((0,external_wp_data_namespaceObject.dispatch)(store_store));
  if (false) {}
}
function api_unregisterEntityAction(kind, name, actionId) {
  const {
    unregisterEntityAction: _unregisterEntityAction
  } = unlock((0,external_wp_data_namespaceObject.dispatch)(store_store));
  if (false) {}
}
function api_registerEntityField(kind, name, config) {
  const {
    registerEntityField: _registerEntityField
  } = unlock((0,external_wp_data_namespaceObject.dispatch)(store_store));
  if (false) {}
}
function api_unregisterEntityField(kind, name, fieldId) {
  const {
    unregisterEntityField: _unregisterEntityField
  } = unlock((0,external_wp_data_namespaceObject.dispatch)(store_store));
  if (false) {}
}
;
})();
(window.wp = window.wp || {}).editor = __webpack_exports__;
 })()
;