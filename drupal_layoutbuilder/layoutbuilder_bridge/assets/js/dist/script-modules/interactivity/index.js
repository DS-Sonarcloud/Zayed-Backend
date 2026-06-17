 var __webpack_modules__ = ({
 622:
 ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
 __webpack_require__.d(__webpack_exports__, {
   Ob: () => ( J),
   Qv: () => ( G),
   XX: () => ( E),
   fF: () => ( l),
   h: () => ( _),
   q6: () => ( K),
   uA: () => ( x),
   zO: () => ( u)
 });
var n,l,t,u,i,r,o,e,f,c,s,a,h,p={},v=[],y=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,d=Array.isArray;function w(n,l){for(var t in l)n[t]=l[t];return n}function g(n){n&&n.parentNode&&n.parentNode.removeChild(n)}function _(l,t,u){var i,r,o,e={};for(o in t)"key"==o?i=t[o]:"ref"==o?r=t[o]:e[o]=t[o];if(arguments.length>2&&(e.children=arguments.length>3?n.call(arguments,2):u),"function"==typeof l&&null!=l.defaultProps)for(o in l.defaultProps)void 0===e[o]&&(e[o]=l.defaultProps[o]);return m(l,e,i,r,null)}function m(n,u,i,r,o){var e={type:n,props:u,key:i,ref:r,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:null==o?++t:o,__i:-1,__u:0};return null==o&&null!=l.vnode&&l.vnode(e),e}function b(){return{current:null}}function k(n){return n.children}function x(n,l){this.props=n,this.context=l}function S(n,l){if(null==l)return n.__?S(n.__,n.__i+1):null;for(var t;l<n.__k.length;l++)if(null!=(t=n.__k[l])&&null!=t.__e)return t.__e;return"function"==typeof n.type?S(n):null}function C(n){var l,t;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(t=n.__k[l])&&null!=t.__e){n.__e=n.__c.base=t.__e;break}return C(n)}}function M(n){(!n.__d&&(n.__d=!0)&&i.push(n)&&!$.__r++||r!==l.debounceRendering)&&((r=l.debounceRendering)||o)($)}function $(){for(var n,t,u,r,o,f,c,s=1;i.length;)i.length>s&&i.sort(e),n=i.shift(),s=i.length,n.__d&&(u=void 0,o=(r=(t=n).__v).__e,f=[],c=[],t.__P&&((u=w({},r)).__v=r.__v+1,l.vnode&&l.vnode(u),O(t.__P,u,r,t.__n,t.__P.namespaceURI,32&r.__u?[o]:null,f,null==o?S(r):o,!!(32&r.__u),c),u.__v=r.__v,u.__.__k[u.__i]=u,z(f,u,c),u.__e!=o&&C(u)));$.__r=0}function I(n,l,t,u,i,r,o,e,f,c,s){var a,h,y,d,w,g,_=u&&u.__k||v,m=l.length;for(f=P(t,l,_,f,m),a=0;a<m;a++)null!=(y=t.__k[a])&&(h=-1===y.__i?p:_[y.__i]||p,y.__i=a,g=O(n,y,h,i,r,o,e,f,c,s),d=y.__e,y.ref&&h.ref!=y.ref&&(h.ref&&q(h.ref,null,y),s.push(y.ref,y.__c||d,y)),null==w&&null!=d&&(w=d),4&y.__u||h.__k===y.__k?f=A(y,f,n):"function"==typeof y.type&&void 0!==g?f=g:d&&(f=d.nextSibling),y.__u&=-7);return t.__e=w,f}function P(n,l,t,u,i){var r,o,e,f,c,s=t.length,a=s,h=0;for(n.__k=new Array(i),r=0;r<i;r++)null!=(o=l[r])&&"boolean"!=typeof o&&"function"!=typeof o?(f=r+h,(o=n.__k[r]="string"==typeof o||"number"==typeof o||"bigint"==typeof o||o.constructor==String?m(null,o,null,null,null):d(o)?m(k,{children:o},null,null,null):void 0===o.constructor&&o.__b>0?m(o.type,o.props,o.key,o.ref?o.ref:null,o.__v):o).__=n,o.__b=n.__b+1,e=null,-1!==(c=o.__i=L(o,t,f,a))&&(a--,(e=t[c])&&(e.__u|=2)),null==e||null===e.__v?(-1==c&&(i>s?h--:i<s&&h++),"function"!=typeof o.type&&(o.__u|=4)):c!=f&&(c==f-1?h--:c==f+1?h++:(c>f?h--:h++,o.__u|=4))):n.__k[r]=null;if(a)for(r=0;r<s;r++)null!=(e=t[r])&&0==(2&e.__u)&&(e.__e==u&&(u=S(e)),B(e,e));return u}function A(n,l,t){var u,i;if("function"==typeof n.type){for(u=n.__k,i=0;u&&i<u.length;i++)u[i]&&(u[i].__=n,l=A(u[i],l,t));return l}n.__e!=l&&(l&&n.type&&!t.contains(l)&&(l=S(n)),t.insertBefore(n.__e,l||null),l=n.__e);do{l=l&&l.nextSibling}while(null!=l&&8==l.nodeType);return l}function H(n,l){return l=l||[],null==n||"boolean"==typeof n||(d(n)?n.some(function(n){H(n,l)}):l.push(n)),l}function L(n,l,t,u){var i,r,o=n.key,e=n.type,f=l[t];if(null===f&&null==n.key||f&&o==f.key&&e===f.type&&0==(2&f.__u))return t;if(u>(null!=f&&0==(2&f.__u)?1:0))for(i=t-1,r=t+1;i>=0||r<l.length;){if(i>=0){if((f=l[i])&&0==(2&f.__u)&&o==f.key&&e===f.type)return i;i--}if(r<l.length){if((f=l[r])&&0==(2&f.__u)&&o==f.key&&e===f.type)return r;r++}}return-1}function T(n,l,t){"-"==l[0]?n.setProperty(l,null==t?"":t):n[l]=null==t?"":"number"!=typeof t||y.test(l)?t:t+"px"}function j(n,l,t,u,i){var r;n:if("style"==l)if("string"==typeof t)n.style.cssText=t;else{if("string"==typeof u&&(n.style.cssText=u=""),u)for(l in u)t&&l in t||T(n.style,l,"");if(t)for(l in t)u&&t[l]===u[l]||T(n.style,l,t[l])}else if("o"==l[0]&&"n"==l[1])r=l!=(l=l.replace(f,"$1")),l=l.toLowerCase()in n||"onFocusOut"==l||"onFocusIn"==l?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+r]=t,t?u?t.t=u.t:(t.t=c,n.addEventListener(l,r?a:s,r)):n.removeEventListener(l,r?a:s,r);else{if("http://www.w3.org/2000/svg"==i)l=l.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if("width"!=l&&"height"!=l&&"href"!=l&&"list"!=l&&"form"!=l&&"tabIndex"!=l&&"download"!=l&&"rowSpan"!=l&&"colSpan"!=l&&"role"!=l&&"popover"!=l&&l in n)try{n[l]=null==t?"":t;break n}catch(n){}"function"==typeof t||(null==t||!1===t&&"-"!=l[4]?n.removeAttribute(l):n.setAttribute(l,"popover"==l&&1==t?"":t))}}function F(n){return function(t){if(this.l){var u=this.l[t.type+n];if(null==t.u)t.u=c++;else if(t.u<u.t)return;return u(l.event?l.event(t):t)}}}function O(n,t,u,i,r,o,e,f,c,s){var a,h,p,v,y,_,m,b,S,C,M,$,P,A,H,L,T,j=t.type;if(void 0!==t.constructor)return null;128&u.__u&&(c=!!(32&u.__u),o=[f=t.__e=u.__e]),(a=l.__b)&&a(t);n:if("function"==typeof j)try{if(b=t.props,S="prototype"in j&&j.prototype.render,C=(a=j.contextType)&&i[a.__c],M=a?C?C.props.value:a.__:i,u.__c?m=(h=t.__c=u.__c).__=h.__E:(S?t.__c=h=new j(b,M):(t.__c=h=new x(b,M),h.constructor=j,h.render=D),C&&C.sub(h),h.props=b,h.state||(h.state={}),h.context=M,h.__n=i,p=h.__d=!0,h.__h=[],h._sb=[]),S&&null==h.__s&&(h.__s=h.state),S&&null!=j.getDerivedStateFromProps&&(h.__s==h.state&&(h.__s=w({},h.__s)),w(h.__s,j.getDerivedStateFromProps(b,h.__s))),v=h.props,y=h.state,h.__v=t,p)S&&null==j.getDerivedStateFromProps&&null!=h.componentWillMount&&h.componentWillMount(),S&&null!=h.componentDidMount&&h.__h.push(h.componentDidMount);else{if(S&&null==j.getDerivedStateFromProps&&b!==v&&null!=h.componentWillReceiveProps&&h.componentWillReceiveProps(b,M),!h.__e&&(null!=h.shouldComponentUpdate&&!1===h.shouldComponentUpdate(b,h.__s,M)||t.__v==u.__v)){for(t.__v!=u.__v&&(h.props=b,h.state=h.__s,h.__d=!1),t.__e=u.__e,t.__k=u.__k,t.__k.some(function(n){n&&(n.__=t)}),$=0;$<h._sb.length;$++)h.__h.push(h._sb[$]);h._sb=[],h.__h.length&&e.push(h);break n}null!=h.componentWillUpdate&&h.componentWillUpdate(b,h.__s,M),S&&null!=h.componentDidUpdate&&h.__h.push(function(){h.componentDidUpdate(v,y,_)})}if(h.context=M,h.props=b,h.__P=n,h.__e=!1,P=l.__r,A=0,S){for(h.state=h.__s,h.__d=!1,P&&P(t),a=h.render(h.props,h.state,h.context),H=0;H<h._sb.length;H++)h.__h.push(h._sb[H]);h._sb=[]}else do{h.__d=!1,P&&P(t),a=h.render(h.props,h.state,h.context),h.state=h.__s}while(h.__d&&++A<25);h.state=h.__s,null!=h.getChildContext&&(i=w(w({},i),h.getChildContext())),S&&!p&&null!=h.getSnapshotBeforeUpdate&&(_=h.getSnapshotBeforeUpdate(v,y)),L=a,null!=a&&a.type===k&&null==a.key&&(L=N(a.props.children)),f=I(n,d(L)?L:[L],t,u,i,r,o,e,f,c,s),h.base=t.__e,t.__u&=-161,h.__h.length&&e.push(h),m&&(h.__E=h.__=null)}catch(n){if(t.__v=null,c||null!=o)if(n.then){for(t.__u|=c?160:128;f&&8==f.nodeType&&f.nextSibling;)f=f.nextSibling;o[o.indexOf(f)]=null,t.__e=f}else for(T=o.length;T--;)g(o[T]);else t.__e=u.__e,t.__k=u.__k;l.__e(n,t,u)}else null==o&&t.__v==u.__v?(t.__k=u.__k,t.__e=u.__e):f=t.__e=V(u.__e,t,u,i,r,o,e,c,s);return(a=l.diffed)&&a(t),128&t.__u?void 0:f}function z(n,t,u){for(var i=0;i<u.length;i++)q(u[i],u[++i],u[++i]);l.__c&&l.__c(t,n),n.some(function(t){try{n=t.__h,t.__h=[],n.some(function(n){n.call(t)})}catch(n){l.__e(n,t.__v)}})}function N(n){return"object"!=typeof n||null==n?n:d(n)?n.map(N):w({},n)}function V(t,u,i,r,o,e,f,c,s){var a,h,v,y,w,_,m,b=i.props,k=u.props,x=u.type;if("svg"==x?o="http://www.w3.org/2000/svg":"math"==x?o="http://www.w3.org/1998/Math/MathML":o||(o="http://www.w3.org/1999/xhtml"),null!=e)for(a=0;a<e.length;a++)if((w=e[a])&&"setAttribute"in w==!!x&&(x?w.localName==x:3==w.nodeType)){t=w,e[a]=null;break}if(null==t){if(null==x)return document.createTextNode(k);t=document.createElementNS(o,x,k.is&&k),c&&(l.__m&&l.__m(u,e),c=!1),e=null}if(null===x)b===k||c&&t.data===k||(t.data=k);else{if(e=e&&n.call(t.childNodes),b=i.props||p,!c&&null!=e)for(b={},a=0;a<t.attributes.length;a++)b[(w=t.attributes[a]).name]=w.value;for(a in b)if(w=b[a],"children"==a);else if("dangerouslySetInnerHTML"==a)v=w;else if(!(a in k)){if("value"==a&&"defaultValue"in k||"checked"==a&&"defaultChecked"in k)continue;j(t,a,null,w,o)}for(a in k)w=k[a],"children"==a?y=w:"dangerouslySetInnerHTML"==a?h=w:"value"==a?_=w:"checked"==a?m=w:c&&"function"!=typeof w||b[a]===w||j(t,a,w,b[a],o);if(h)c||v&&(h.__html===v.__html||h.__html===t.innerHTML)||(t.innerHTML=h.__html),u.__k=[];else if(v&&(t.innerHTML=""),I("template"===u.type?t.content:t,d(y)?y:[y],u,i,r,"foreignObject"==x?"http://www.w3.org/1999/xhtml":o,e,f,e?e[0]:i.__k&&S(i,0),c,s),null!=e)for(a=e.length;a--;)g(e[a]);c||(a="value","progress"==x&&null==_?t.removeAttribute("value"):void 0!==_&&(_!==t[a]||"progress"==x&&!_||"option"==x&&_!==b[a])&&j(t,a,_,b[a],o),a="checked",void 0!==m&&m!==t[a]&&j(t,a,m,b[a],o))}return t}function q(n,t,u){try{if("function"==typeof n){var i="function"==typeof n.__u;i&&n.__u(),i&&null==t||(n.__u=n(t))}else n.current=t}catch(n){l.__e(n,u)}}function B(n,t,u){var i,r;if(l.unmount&&l.unmount(n),(i=n.ref)&&(i.current&&i.current!==n.__e||q(i,null,t)),null!=(i=n.__c)){if(i.componentWillUnmount)try{i.componentWillUnmount()}catch(n){l.__e(n,t)}i.base=i.__P=null}if(i=n.__k)for(r=0;r<i.length;r++)i[r]&&B(i[r],t,u||"function"!=typeof n.type);u||g(n.__e),n.__c=n.__=n.__e=void 0}function D(n,l,t){return this.constructor(n,t)}function E(t,u,i){var r,o,e,f;u==document&&(u=document.documentElement),l.__&&l.__(t,u),o=(r="function"==typeof i)?null:i&&i.__k||u.__k,e=[],f=[],O(u,t=(!r&&i||u).__k=_(k,null,[t]),o||p,p,u.namespaceURI,!r&&i?[i]:o?null:u.firstChild?n.call(u.childNodes):null,e,!r&&i?i:o?o.__e:u.firstChild,r,f),z(e,t,f)}function G(n,l){E(n,l,G)}function J(l,t,u){var i,r,o,e,f=w({},l.props);for(o in l.type&&l.type.defaultProps&&(e=l.type.defaultProps),t)"key"==o?i=t[o]:"ref"==o?r=t[o]:f[o]=void 0===t[o]&&void 0!==e?e[o]:t[o];return arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):u),m(l.type,f,i||l.key,r||l.ref,null)}function K(n){function l(n){var t,u;return this.getChildContext||(t=new Set,(u={})[l.__c]=this,this.getChildContext=function(){return u},this.componentWillUnmount=function(){t=null},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&t.forEach(function(n){n.__e=!0,M(n)})},this.sub=function(n){t.add(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){t&&t.delete(n),l&&l.call(n)}}),n.children}return l.__c="__cC"+h++,l.__=n,l.Provider=l.__l=(l.Consumer=function(n,l){return n.children(l)}).contextType=l,l}n=v.slice,l={__e:function(n,l,t,u){for(var i,r,o;l=l.__;)if((i=l.__c)&&!i.__)try{if((r=i.constructor)&&null!=r.getDerivedStateFromError&&(i.setState(r.getDerivedStateFromError(n)),o=i.__d),null!=i.componentDidCatch&&(i.componentDidCatch(n,u||{}),o=i.__d),o)return i.__E=i}catch(l){n=l}throw n}},t=0,u=function(n){return null!=n&&null==n.constructor},x.prototype.setState=function(n,l){var t;t=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=w({},this.state),"function"==typeof n&&(n=n(w({},t),this.props)),n&&w(t,n),null!=n&&this.__v&&(l&&this._sb.push(l),M(this))},x.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),M(this))},x.prototype.render=k,i=[],o="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,e=function(n,l){return n.__v.__b-l.__v.__b},$.__r=0,f=/(PointerCapture)$|Capture$/i,c=0,s=F(!1),a=F(!0),h=0;
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
  zj: () => ( getConfig),
  SD: () => ( getContext),
  V6: () => ( getElement),
  $K: () => ( getServerContext),
  vT: () => ( getServerState),
  jb: () => ( privateApis),
  yT: () => ( splitTask),
  M_: () => ( store),
  hb: () => ( useCallback),
  vJ: () => ( useEffect),
  ip: () => ( useInit),
  Nf: () => ( useLayoutEffect),
  Kr: () => ( useMemo),
  li: () => ( A),
  J0: () => ( d),
  FH: () => ( useWatch),
  v4: () => ( withScope),
  mh: () => ( withSyncEvent)
});
var preact_module = __webpack_require__(622);
;
var hooks_module_t,r,hooks_module_u,i,hooks_module_o=0,hooks_module_f=[],hooks_module_c=preact_module.fF,e=hooks_module_c.__b,a=hooks_module_c.__r,v=hooks_module_c.diffed,l=hooks_module_c.__c,m=hooks_module_c.unmount,s=hooks_module_c.__;function p(n,t){hooks_module_c.__h&&hooks_module_c.__h(r,n,hooks_module_o||t),hooks_module_o=0;var u=r.__H||(r.__H={__:[],__h:[]});return n>=u.__.length&&u.__.push({}),u.__[n]}function d(n){return hooks_module_o=1,h(D,n)}function h(n,u,i){var o=p(hooks_module_t++,2);if(o.t=n,!o.__c&&(o.__=[i?i(u):D(void 0,u),function(n){var t=o.__N?o.__N[0]:o.__[0],r=o.t(t,n);t!==r&&(o.__N=[r,o.__[1]],o.__c.setState({}))}],o.__c=r,!r.__f)){var f=function(n,t,r){if(!o.__c.__H)return!0;var u=o.__c.__H.__.filter(function(n){return!!n.__c});if(u.every(function(n){return!n.__N}))return!c||c.call(this,n,t,r);var i=o.__c.props!==n;return u.forEach(function(n){if(n.__N){var t=n.__[0];n.__=n.__N,n.__N=void 0,t!==n.__[0]&&(i=!0)}}),c&&c.call(this,n,t,r)||i};r.__f=!0;var c=r.shouldComponentUpdate,e=r.componentWillUpdate;r.componentWillUpdate=function(n,t,r){if(this.__e){var u=c;c=void 0,f(n,t,r),c=u}e&&e.call(this,n,t,r)},r.shouldComponentUpdate=f}return o.__N||o.__}function y(n,u){var i=p(hooks_module_t++,3);!hooks_module_c.__s&&C(i.__H,u)&&(i.__=n,i.u=u,r.__H.__h.push(i))}function _(n,u){var i=p(hooks_module_t++,4);!hooks_module_c.__s&&C(i.__H,u)&&(i.__=n,i.u=u,r.__h.push(i))}function A(n){return hooks_module_o=5,T(function(){return{current:n}},[])}function F(n,t,r){hooks_module_o=6,_(function(){if("function"==typeof n){var r=n(t());return function(){n(null),r&&"function"==typeof r&&r()}}if(n)return n.current=t(),function(){return n.current=null}},null==r?r:r.concat(n))}function T(n,r){var u=p(hooks_module_t++,7);return C(u.__H,r)&&(u.__=n(),u.__H=r,u.__h=n),u.__}function q(n,t){return hooks_module_o=8,T(function(){return n},t)}function x(n){var u=r.context[n.__c],i=p(hooks_module_t++,9);return i.c=n,u?(null==i.__&&(i.__=!0,u.sub(r)),u.props.value):n.__}function P(n,t){hooks_module_c.useDebugValue&&hooks_module_c.useDebugValue(t?t(n):n)}function b(n){var u=p(hooks_module_t++,10),i=d();return u.__=n,r.componentDidCatch||(r.componentDidCatch=function(n,t){u.__&&u.__(n,t),i[1](n)}),[i[0],function(){i[1](void 0)}]}function g(){var n=p(hooks_module_t++,11);if(!n.__){for(var u=r.__v;null!==u&&!u.__m&&null!==u.__;)u=u.__;var i=u.__m||(u.__m=[0,0]);n.__="P"+i[0]+"-"+i[1]++}return n.__}function j(){for(var n;n=hooks_module_f.shift();)if(n.__P&&n.__H)try{n.__H.__h.forEach(z),n.__H.__h.forEach(B),n.__H.__h=[]}catch(t){n.__H.__h=[],hooks_module_c.__e(t,n.__v)}}hooks_module_c.__b=function(n){r=null,e&&e(n)},hooks_module_c.__=function(n,t){n&&t.__k&&t.__k.__m&&(n.__m=t.__k.__m),s&&s(n,t)},hooks_module_c.__r=function(n){a&&a(n),hooks_module_t=0;var i=(r=n.__c).__H;i&&(hooks_module_u===r?(i.__h=[],r.__h=[],i.__.forEach(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(i.__h.forEach(z),i.__h.forEach(B),i.__h=[],hooks_module_t=0)),hooks_module_u=r},hooks_module_c.diffed=function(n){v&&v(n);var t=n.__c;t&&t.__H&&(t.__H.__h.length&&(1!==hooks_module_f.push(t)&&i===hooks_module_c.requestAnimationFrame||((i=hooks_module_c.requestAnimationFrame)||w)(j)),t.__H.__.forEach(function(n){n.u&&(n.__H=n.u),n.u=void 0})),hooks_module_u=r=null},hooks_module_c.__c=function(n,t){t.some(function(n){try{n.__h.forEach(z),n.__h=n.__h.filter(function(n){return!n.__||B(n)})}catch(r){t.some(function(n){n.__h&&(n.__h=[])}),t=[],hooks_module_c.__e(r,n.__v)}}),l&&l(n,t)},hooks_module_c.unmount=function(n){m&&m(n);var t,r=n.__c;r&&r.__H&&(r.__H.__.forEach(function(n){try{z(n)}catch(n){t=n}}),r.__H=void 0,t&&hooks_module_c.__e(t,r.__v))};var k="function"==typeof requestAnimationFrame;function w(n){var t,r=function(){clearTimeout(u),k&&cancelAnimationFrame(t),setTimeout(n)},u=setTimeout(r,100);k&&(t=requestAnimationFrame(r))}function z(n){var t=r,u=n.__c;"function"==typeof u&&(n.__c=void 0,u()),r=t}function B(n){var t=r;n.__c=n.__(),r=t}function C(n,t){return!n||n.length!==t.length||t.some(function(t,r){return t!==n[r]})}function D(n,t){return"function"==typeof t?t(n):t}
;
var signals_core_module_i=Symbol.for("preact-signals");function signals_core_module_t(){if(!(signals_core_module_s>1)){var i,t=!1;while(void 0!==signals_core_module_h){var r=signals_core_module_h;signals_core_module_h=void 0;signals_core_module_f++;while(void 0!==r){var o=r.o;r.o=void 0;r.f&=-3;if(!(8&r.f)&&signals_core_module_c(r))try{r.c()}catch(r){if(!t){i=r;t=!0}}r=o}}signals_core_module_f=0;signals_core_module_s--;if(t)throw i}else signals_core_module_s--}function signals_core_module_r(i){if(signals_core_module_s>0)return i();signals_core_module_s++;try{return i()}finally{signals_core_module_t()}}var signals_core_module_o=void 0;function n(i){var t=signals_core_module_o;signals_core_module_o=void 0;try{return i()}finally{signals_core_module_o=t}}var signals_core_module_h=void 0,signals_core_module_s=0,signals_core_module_f=0,signals_core_module_v=0;function signals_core_module_e(i){if(void 0!==signals_core_module_o){var t=i.n;if(void 0===t||t.t!==signals_core_module_o){t={i:0,S:i,p:signals_core_module_o.s,n:void 0,t:signals_core_module_o,e:void 0,x:void 0,r:t};if(void 0!==signals_core_module_o.s)signals_core_module_o.s.n=t;signals_core_module_o.s=t;i.n=t;if(32&signals_core_module_o.f)i.S(t);return t}else if(-1===t.i){t.i=0;if(void 0!==t.n){t.n.p=t.p;if(void 0!==t.p)t.p.n=t.n;t.p=signals_core_module_o.s;t.n=void 0;signals_core_module_o.s.n=t;signals_core_module_o.s=t}return t}}}function signals_core_module_u(i){this.v=i;this.i=0;this.n=void 0;this.t=void 0}signals_core_module_u.prototype.brand=signals_core_module_i;signals_core_module_u.prototype.h=function(){return!0};signals_core_module_u.prototype.S=function(i){if(this.t!==i&&void 0===i.e){i.x=this.t;if(void 0!==this.t)this.t.e=i;this.t=i}};signals_core_module_u.prototype.U=function(i){if(void 0!==this.t){var t=i.e,r=i.x;if(void 0!==t){t.x=r;i.e=void 0}if(void 0!==r){r.e=t;i.x=void 0}if(i===this.t)this.t=r}};signals_core_module_u.prototype.subscribe=function(i){var t=this;return E(function(){var r=t.value,n=signals_core_module_o;signals_core_module_o=void 0;try{i(r)}finally{signals_core_module_o=n}})};signals_core_module_u.prototype.valueOf=function(){return this.value};signals_core_module_u.prototype.toString=function(){return this.value+""};signals_core_module_u.prototype.toJSON=function(){return this.value};signals_core_module_u.prototype.peek=function(){var i=signals_core_module_o;signals_core_module_o=void 0;try{return this.value}finally{signals_core_module_o=i}};Object.defineProperty(signals_core_module_u.prototype,"value",{get:function(){var i=signals_core_module_e(this);if(void 0!==i)i.i=this.i;return this.v},set:function(i){if(i!==this.v){if(signals_core_module_f>100)throw new Error("Cycle detected");this.v=i;this.i++;signals_core_module_v++;signals_core_module_s++;try{for(var r=this.t;void 0!==r;r=r.x)r.t.N()}finally{signals_core_module_t()}}}});function signals_core_module_d(i){return new signals_core_module_u(i)}function signals_core_module_c(i){for(var t=i.s;void 0!==t;t=t.n)if(t.S.i!==t.i||!t.S.h()||t.S.i!==t.i)return!0;return!1}function signals_core_module_a(i){for(var t=i.s;void 0!==t;t=t.n){var r=t.S.n;if(void 0!==r)t.r=r;t.S.n=t;t.i=-1;if(void 0===t.n){i.s=t;break}}}function signals_core_module_l(i){var t=i.s,r=void 0;while(void 0!==t){var o=t.p;if(-1===t.i){t.S.U(t);if(void 0!==o)o.n=t.n;if(void 0!==t.n)t.n.p=o}else r=t;t.S.n=t.r;if(void 0!==t.r)t.r=void 0;t=o}i.s=r}function signals_core_module_y(i){signals_core_module_u.call(this,void 0);this.x=i;this.s=void 0;this.g=signals_core_module_v-1;this.f=4}(signals_core_module_y.prototype=new signals_core_module_u).h=function(){this.f&=-3;if(1&this.f)return!1;if(32==(36&this.f))return!0;this.f&=-5;if(this.g===signals_core_module_v)return!0;this.g=signals_core_module_v;this.f|=1;if(this.i>0&&!signals_core_module_c(this)){this.f&=-2;return!0}var i=signals_core_module_o;try{signals_core_module_a(this);signals_core_module_o=this;var t=this.x();if(16&this.f||this.v!==t||0===this.i){this.v=t;this.f&=-17;this.i++}}catch(i){this.v=i;this.f|=16;this.i++}signals_core_module_o=i;signals_core_module_l(this);this.f&=-2;return!0};signals_core_module_y.prototype.S=function(i){if(void 0===this.t){this.f|=36;for(var t=this.s;void 0!==t;t=t.n)t.S.S(t)}signals_core_module_u.prototype.S.call(this,i)};signals_core_module_y.prototype.U=function(i){if(void 0!==this.t){signals_core_module_u.prototype.U.call(this,i);if(void 0===this.t){this.f&=-33;for(var t=this.s;void 0!==t;t=t.n)t.S.U(t)}}};signals_core_module_y.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var i=this.t;void 0!==i;i=i.x)i.t.N()}};Object.defineProperty(signals_core_module_y.prototype,"value",{get:function(){if(1&this.f)throw new Error("Cycle detected");var i=signals_core_module_e(this);this.h();if(void 0!==i)i.i=this.i;if(16&this.f)throw this.v;return this.v}});function signals_core_module_w(i){return new signals_core_module_y(i)}function signals_core_module_(i){var r=i.u;i.u=void 0;if("function"==typeof r){signals_core_module_s++;var n=signals_core_module_o;signals_core_module_o=void 0;try{r()}catch(t){i.f&=-2;i.f|=8;signals_core_module_g(i);throw t}finally{signals_core_module_o=n;signals_core_module_t()}}}function signals_core_module_g(i){for(var t=i.s;void 0!==t;t=t.n)t.S.U(t);i.x=void 0;i.s=void 0;signals_core_module_(i)}function signals_core_module_p(i){if(signals_core_module_o!==this)throw new Error("Out-of-order effect");signals_core_module_l(this);signals_core_module_o=i;this.f&=-2;if(8&this.f)signals_core_module_g(this);signals_core_module_t()}function signals_core_module_b(i){this.x=i;this.u=void 0;this.s=void 0;this.o=void 0;this.f=32}signals_core_module_b.prototype.c=function(){var i=this.S();try{if(8&this.f)return;if(void 0===this.x)return;var t=this.x();if("function"==typeof t)this.u=t}finally{i()}};signals_core_module_b.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1;this.f&=-9;signals_core_module_(this);signals_core_module_a(this);signals_core_module_s++;var i=signals_core_module_o;signals_core_module_o=this;return signals_core_module_p.bind(this,i)};signals_core_module_b.prototype.N=function(){if(!(2&this.f)){this.f|=2;this.o=signals_core_module_h;signals_core_module_h=this}};signals_core_module_b.prototype.d=function(){this.f|=8;if(!(1&this.f))signals_core_module_g(this)};function E(i){var t=new signals_core_module_b(i);try{t.c()}catch(i){t.d();throw i}return t.d.bind(t)}
;
var signals_module_v,signals_module_s;function signals_module_l(i,n){preact_module.fF[i]=n.bind(null,preact_module.fF[i]||function(){})}function signals_module_d(i){if(signals_module_s)signals_module_s();signals_module_s=i&&i.S()}function signals_module_h(i){var r=this,f=i.data,o=useSignal(f);o.value=f;var e=T(function(){var i=r.__v;while(i=i.__)if(i.__c){i.__c.__$f|=4;break}r.__$u.c=function(){var i,t=r.__$u.S(),f=e.value;t();if((0,preact_module.zO)(f)||3!==(null==(i=r.base)?void 0:i.nodeType)){r.__$f|=1;r.setState({})}else r.base.data=f};return signals_core_module_w(function(){var i=o.value.value;return 0===i?0:!0===i?"":i||""})},[]);return e.value}signals_module_h.displayName="_st";Object.defineProperties(signals_core_module_u.prototype,{constructor:{configurable:!0,value:void 0},type:{configurable:!0,value:signals_module_h},props:{configurable:!0,get:function(){return{data:this}}},__b:{configurable:!0,value:1}});signals_module_l("__b",function(i,r){if("string"==typeof r.type){var n,t=r.props;for(var f in t)if("children"!==f){var o=t[f];if(o instanceof signals_core_module_u){if(!n)r.__np=n={};n[f]=o;t[f]=o.peek()}}}i(r)});signals_module_l("__r",function(i,r){signals_module_d();var n,t=r.__c;if(t){t.__$f&=-2;if(void 0===(n=t.__$u))t.__$u=n=function(i){var r;E(function(){r=this});r.c=function(){t.__$f|=1;t.setState({})};return r}()}signals_module_v=t;signals_module_d(n);i(r)});signals_module_l("__e",function(i,r,n,t){signals_module_d();signals_module_v=void 0;i(r,n,t)});signals_module_l("diffed",function(i,r){signals_module_d();signals_module_v=void 0;var n;if("string"==typeof r.type&&(n=r.__e)){var t=r.__np,f=r.props;if(t){var o=n.U;if(o)for(var e in o){var u=o[e];if(void 0!==u&&!(e in t)){u.d();o[e]=void 0}}else n.U=o={};for(var a in t){var c=o[a],s=t[a];if(void 0===c){c=signals_module_p(n,a,s,f);o[a]=c}else c.o(s,f)}}}i(r)});function signals_module_p(i,r,n,t){var f=r in i&&void 0===i.ownerSVGElement,o=signals_core_module_d(n);return{o:function(i,r){o.value=i;t=r},d:E(function(){var n=o.value.value;if(t[r]!==n){t[r]=n;if(f)i[r]=n;else if(n)i.setAttribute(r,n);else i.removeAttribute(r)}})}}signals_module_l("unmount",function(i,r){if("string"==typeof r.type){var n=r.__e;if(n){var t=n.U;if(t){n.U=void 0;for(var f in t){var o=t[f];if(o)o.d()}}}}else{var e=r.__c;if(e){var u=e.__$u;if(u){e.__$u=void 0;u.d()}}}i(r)});signals_module_l("__h",function(i,r,n,t){if(t<3||9===t)r.__$f|=2;i(r,n,t)});preact_module.uA.prototype.shouldComponentUpdate=function(i,r){var n=this.__$u,t=n&&void 0!==n.s;for(var f in r)return!0;if(this.__f||"boolean"==typeof this.u&&!0===this.u){if(!(t||2&this.__$f||4&this.__$f))return!0;if(1&this.__$f)return!0}else{if(!(t||4&this.__$f))return!0;if(3&this.__$f)return!0}for(var o in i)if("__source"!==o&&i[o]!==this.props[o])return!0;for(var e in this.props)if(!(e in i))return!0;return!1};function useSignal(i){return T(function(){return signals_core_module_d(i)},[])}function useComputed(i){var r=f(i);r.current=i;signals_module_v.__$f|=4;return t(function(){return u(function(){return r.current()})},[])}function useSignalEffect(i){var r=f(i);r.current=i;o(function(){return c(function(){return r.current()})},[])}
;
const namespaceStack = [];
const getNamespace = () => namespaceStack.slice(-1)[0];
const setNamespace = namespace => {
  namespaceStack.push(namespace);
};
const resetNamespace = () => {
  namespaceStack.pop();
};
;
const scopeStack = [];
const getScope = () => scopeStack.slice(-1)[0];
const setScope = scope => {
  scopeStack.push(scope);
};
const resetScope = () => {
  scopeStack.pop();
};
const immutableMap = new WeakMap();
const immutableError = () => {
  throw new Error('Please use `data-wp-bind` to modify the attributes of an element.');
};
const immutableHandlers = {
  get(target, key, receiver) {
    const value = Reflect.get(target, key, receiver);
    return !!value && typeof value === 'object' ? deepImmutable(value) : value;
  },
  set: immutableError,
  deleteProperty: immutableError
};
const deepImmutable = target => {
  if (!immutableMap.has(target)) {
    immutableMap.set(target, new Proxy(target, immutableHandlers));
  }
  return immutableMap.get(target);
};
const getContext = namespace => {
  const scope = getScope();
  if (true) {
    if (!scope) {
      throw Error('Cannot call `getContext()` when there is no scope. If you are using an async function, please consider using a generator instead. If you are using some sort of async callbacks, like `setTimeout`, please wrap the callback with `withScope(callback)`.');
    }
  }
  return scope.context[namespace || getNamespace()];
};
const getElement = () => {
  const scope = getScope();
  if (true) {
    if (!scope) {
      throw Error('Cannot call `getElement()` when there is no scope. If you are using an async function, please consider using a generator instead. If you are using some sort of async callbacks, like `setTimeout`, please wrap the callback with `withScope(callback)`.');
    }
  }
  const {
    ref,
    attributes
  } = scope;
  return Object.freeze({
    ref: ref.current,
    attributes: deepImmutable(attributes)
  });
};
const getServerContext = namespace => {
  const scope = getScope();
  if (true) {
    if (!scope) {
      throw Error('Cannot call `getServerContext()` when there is no scope. If you are using an async function, please consider using a generator instead. If you are using some sort of async callbacks, like `setTimeout`, please wrap the callback with `withScope(callback)`.');
    }
  }
  return scope.serverContext[namespace || getNamespace()];
};
;
const afterNextFrame = callback => {
  return new Promise(resolve => {
    const done = () => {
      clearTimeout(timeout);
      window.cancelAnimationFrame(raf);
      setTimeout(() => {
        callback();
        resolve();
      });
    };
    const timeout = setTimeout(done, 100);
    const raf = window.requestAnimationFrame(done);
  });
};
const splitTask = typeof window.scheduler?.yield === 'function' ? window.scheduler.yield.bind(window.scheduler) : () => {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
};
function createFlusher(compute, notify) {
  let flush = () => undefined;
  const dispose = E(function () {
    flush = this.c.bind(this);
    this.x = compute;
    this.c = notify;
    return compute();
  });
  return {
    flush,
    dispose
  };
}
function utils_useSignalEffect(callback) {
  y(() => {
    let eff = null;
    let isExecuting = false;
    const notify = async () => {
      if (eff && !isExecuting) {
        isExecuting = true;
        await afterNextFrame(eff.flush);
        isExecuting = false;
      }
    };
    eff = createFlusher(callback, notify);
    return eff.dispose;
  }, []);
}
function withScope(func) {
  const scope = getScope();
  const ns = getNamespace();
  let wrapped;
  if (func?.constructor?.name === 'GeneratorFunction') {
    wrapped = async (...args) => {
      const gen = func(...args);
      let value;
      let it;
      while (true) {
        setNamespace(ns);
        setScope(scope);
        try {
          it = gen.next(value);
        } finally {
          resetScope();
          resetNamespace();
        }
        try {
          value = await it.value;
        } catch (e) {
          setNamespace(ns);
          setScope(scope);
          gen.throw(e);
        } finally {
          resetScope();
          resetNamespace();
        }
        if (it.done) {
          break;
        }
      }
      return value;
    };
  } else {
    wrapped = (...args) => {
      setNamespace(ns);
      setScope(scope);
      try {
        return func(...args);
      } finally {
        resetNamespace();
        resetScope();
      }
    };
  }
  const syncAware = func;
  if (syncAware.sync) {
    const syncAwareWrapped = wrapped;
    syncAwareWrapped.sync = true;
    return syncAwareWrapped;
  }
  return wrapped;
}
function useWatch(callback) {
  utils_useSignalEffect(withScope(callback));
}
function useInit(callback) {
  y(withScope(callback), []);
}
function useEffect(callback, inputs) {
  y(withScope(callback), inputs);
}
function useLayoutEffect(callback, inputs) {
  _(withScope(callback), inputs);
}
function useCallback(callback, inputs) {
  return q(withScope(callback), inputs);
}
function useMemo(factory, inputs) {
  return T(withScope(factory), inputs);
}
const createRootFragment = (parent, replaceNode) => {
  replaceNode = [].concat(replaceNode);
  const sibling = replaceNode[replaceNode.length - 1].nextSibling;
  function insert(child, root) {
    parent.insertBefore(child, root || sibling);
  }
  return parent.__k = {
    nodeType: 1,
    parentNode: parent,
    firstChild: replaceNode[0],
    childNodes: replaceNode,
    insertBefore: insert,
    appendChild: insert,
    removeChild(c) {
      parent.removeChild(c);
    }
  };
};
function kebabToCamelCase(str) {
  return str.replace(/^-+|-+$/g, '').toLowerCase().replace(/-([a-z])/g, function (_match, group1) {
    return group1.toUpperCase();
  });
}
const logged = new Set();
const warn = message => {
  if (true) {
    if (logged.has(message)) {
      return;
    }
    console.warn(message);
    try {
      throw Error(message);
    } catch (e) {
    }
    logged.add(message);
  }
};
const isPlainObject = candidate => Boolean(candidate && typeof candidate === 'object' && candidate.constructor === Object);
function withSyncEvent(callback) {
  const syncAware = callback;
  syncAware.sync = true;
  return syncAware;
}
;
const objToProxy = new WeakMap();
const proxyToObj = new WeakMap();
const proxyToNs = new WeakMap();
const supported = new Set([Object, Array]);
const createProxy = (namespace, obj, handlers) => {
  if (!shouldProxy(obj)) {
    throw Error('This object cannot be proxified.');
  }
  if (!objToProxy.has(obj)) {
    const proxy = new Proxy(obj, handlers);
    objToProxy.set(obj, proxy);
    proxyToObj.set(proxy, obj);
    proxyToNs.set(proxy, namespace);
  }
  return objToProxy.get(obj);
};
const getProxyFromObject = obj => objToProxy.get(obj);
const getNamespaceFromProxy = proxy => proxyToNs.get(proxy);
const shouldProxy = candidate => {
  if (typeof candidate !== 'object' || candidate === null) {
    return false;
  }
  return !proxyToNs.has(candidate) && supported.has(candidate.constructor);
};
const getObjectFromProxy = proxy => proxyToObj.get(proxy);
;
const NO_SCOPE = {};
class PropSignal {
  constructor(owner) {
    this.owner = owner;
    this.computedsByScope = new WeakMap();
  }
  setValue(value) {
    this.update({
      value
    });
  }
  setGetter(getter) {
    this.update({
      get: getter
    });
  }
  getComputed() {
    const scope = getScope() || NO_SCOPE;
    if (!this.valueSignal && !this.getterSignal) {
      this.update({});
    }
    if (!this.computedsByScope.has(scope)) {
      const callback = () => {
        const getter = this.getterSignal?.value;
        return getter ? getter.call(this.owner) : this.valueSignal?.value;
      };
      setNamespace(getNamespaceFromProxy(this.owner));
      this.computedsByScope.set(scope, signals_core_module_w(withScope(callback)));
      resetNamespace();
    }
    return this.computedsByScope.get(scope);
  }
  update({
    get,
    value
  }) {
    if (!this.valueSignal) {
      this.valueSignal = signals_core_module_d(value);
      this.getterSignal = signals_core_module_d(get);
    } else if (value !== this.valueSignal.peek() || get !== this.getterSignal.peek()) {
      signals_core_module_r(() => {
        this.valueSignal.value = value;
        this.getterSignal.value = get;
      });
    }
  }
}
;
const wellKnownSymbols = new Set(Object.getOwnPropertyNames(Symbol).map(key => Symbol[key]).filter(value => typeof value === 'symbol'));
const proxyToProps = new WeakMap();
const hasPropSignal = (proxy, key) => proxyToProps.has(proxy) && proxyToProps.get(proxy).has(key);
const readOnlyProxies = new WeakSet();
const getPropSignal = (proxy, key, initial) => {
  if (!proxyToProps.has(proxy)) {
    proxyToProps.set(proxy, new Map());
  }
  key = typeof key === 'number' ? `${key}` : key;
  const props = proxyToProps.get(proxy);
  if (!props.has(key)) {
    const ns = getNamespaceFromProxy(proxy);
    const prop = new PropSignal(proxy);
    props.set(key, prop);
    if (initial) {
      const {
        get,
        value
      } = initial;
      if (get) {
        prop.setGetter(get);
      } else {
        const readOnly = readOnlyProxies.has(proxy);
        prop.setValue(shouldProxy(value) ? proxifyState(ns, value, {
          readOnly
        }) : value);
      }
    }
  }
  return props.get(key);
};
const objToIterable = new WeakMap();
let peeking = false;
const stateHandlers = {
  get(target, key, receiver) {
    if (peeking || !target.hasOwnProperty(key) && key in target || typeof key === 'symbol' && wellKnownSymbols.has(key)) {
      return Reflect.get(target, key, receiver);
    }
    const desc = Object.getOwnPropertyDescriptor(target, key);
    const prop = getPropSignal(receiver, key, desc);
    const result = prop.getComputed().value;
    if (typeof result === 'function') {
      const ns = getNamespaceFromProxy(receiver);
      return (...args) => {
        setNamespace(ns);
        try {
          return result.call(receiver, ...args);
        } finally {
          resetNamespace();
        }
      };
    }
    return result;
  },
  set(target, key, value, receiver) {
    if (readOnlyProxies.has(receiver)) {
      return false;
    }
    setNamespace(getNamespaceFromProxy(receiver));
    try {
      return Reflect.set(target, key, value, receiver);
    } finally {
      resetNamespace();
    }
  },
  defineProperty(target, key, desc) {
    if (readOnlyProxies.has(getProxyFromObject(target))) {
      return false;
    }
    const isNew = !(key in target);
    const result = Reflect.defineProperty(target, key, desc);
    if (result) {
      const receiver = getProxyFromObject(target);
      const prop = getPropSignal(receiver, key);
      const {
        get,
        value
      } = desc;
      if (get) {
        prop.setGetter(get);
      } else {
        const ns = getNamespaceFromProxy(receiver);
        prop.setValue(shouldProxy(value) ? proxifyState(ns, value) : value);
      }
      if (isNew && objToIterable.has(target)) {
        objToIterable.get(target).value++;
      }
      if (Array.isArray(target) && proxyToProps.get(receiver)?.has('length')) {
        const length = getPropSignal(receiver, 'length');
        length.setValue(target.length);
      }
    }
    return result;
  },
  deleteProperty(target, key) {
    if (readOnlyProxies.has(getProxyFromObject(target))) {
      return false;
    }
    const result = Reflect.deleteProperty(target, key);
    if (result) {
      const prop = getPropSignal(getProxyFromObject(target), key);
      prop.setValue(undefined);
      if (objToIterable.has(target)) {
        objToIterable.get(target).value++;
      }
    }
    return result;
  },
  ownKeys(target) {
    if (!objToIterable.has(target)) {
      objToIterable.set(target, signals_core_module_d(0));
    }
    objToIterable._ = objToIterable.get(target).value;
    return Reflect.ownKeys(target);
  }
};
const proxifyState = (namespace, obj, options) => {
  const proxy = createProxy(namespace, obj, stateHandlers);
  if (options?.readOnly) {
    readOnlyProxies.add(proxy);
  }
  return proxy;
};
const peek = (obj, key) => {
  peeking = true;
  try {
    return obj[key];
  } finally {
    peeking = false;
  }
};
const deepMergeRecursive = (target, source, override = true) => {
  if (!(isPlainObject(target) && isPlainObject(source))) {
    return;
  }
  let hasNewKeys = false;
  for (const key in source) {
    const isNew = !(key in target);
    hasNewKeys = hasNewKeys || isNew;
    const desc = Object.getOwnPropertyDescriptor(source, key);
    const proxy = getProxyFromObject(target);
    const propSignal = !!proxy && hasPropSignal(proxy, key) && getPropSignal(proxy, key);
    if (typeof desc.get === 'function' || typeof desc.set === 'function') {
      if (override || isNew) {
        Object.defineProperty(target, key, {
          ...desc,
          configurable: true,
          enumerable: true
        });
        if (desc.get && propSignal) {
          propSignal.setGetter(desc.get);
        }
      }
    } else if (isPlainObject(source[key])) {
      const targetValue = Object.getOwnPropertyDescriptor(target, key)?.value;
      if (isNew || override && !isPlainObject(targetValue)) {
        target[key] = {};
        if (propSignal) {
          const ns = getNamespaceFromProxy(proxy);
          propSignal.setValue(proxifyState(ns, target[key]));
        }
        deepMergeRecursive(target[key], source[key], override);
      }
      else if (isPlainObject(targetValue)) {
        deepMergeRecursive(target[key], source[key], override);
      }
    } else if (override || isNew) {
      Object.defineProperty(target, key, desc);
      if (propSignal) {
        const {
          value
        } = desc;
        const ns = getNamespaceFromProxy(proxy);
        propSignal.setValue(shouldProxy(value) ? proxifyState(ns, value) : value);
      }
    }
  }
  if (hasNewKeys && objToIterable.has(target)) {
    objToIterable.get(target).value++;
  }
};
const deepMerge = (target, source, override = true) => signals_core_module_r(() => deepMergeRecursive(getObjectFromProxy(target) || target, source, override));
;
const storeRoots = new WeakSet();
const storeHandlers = {
  get: (target, key, receiver) => {
    const result = Reflect.get(target, key);
    const ns = getNamespaceFromProxy(receiver);
    if (typeof result === 'undefined' && storeRoots.has(receiver)) {
      const obj = {};
      Reflect.set(target, key, obj);
      return proxifyStore(ns, obj, false);
    }
    if (typeof result === 'function') {
      setNamespace(ns);
      const scoped = withScope(result);
      resetNamespace();
      return scoped;
    }
    if (isPlainObject(result) && shouldProxy(result)) {
      return proxifyStore(ns, result, false);
    }
    return result;
  }
};
const proxifyStore = (namespace, obj, isRoot = true) => {
  const proxy = createProxy(namespace, obj, storeHandlers);
  if (proxy && isRoot) {
    storeRoots.add(proxy);
  }
  return proxy;
};
;
const contextObjectToProxy = new WeakMap();
const contextObjectToFallback = new WeakMap();
const contextProxies = new WeakSet();
const descriptor = Reflect.getOwnPropertyDescriptor;
const contextHandlers = {
  get: (target, key) => {
    const fallback = contextObjectToFallback.get(target);
    const currentProp = target[key];
    return key in target ? currentProp : fallback[key];
  },
  set: (target, key, value) => {
    const fallback = contextObjectToFallback.get(target);
    const obj = key in target || !(key in fallback) ? target : fallback;
    obj[key] = value;
    return true;
  },
  ownKeys: target => [...new Set([...Object.keys(contextObjectToFallback.get(target)), ...Object.keys(target)])],
  getOwnPropertyDescriptor: (target, key) => descriptor(target, key) || descriptor(contextObjectToFallback.get(target), key),
  has: (target, key) => Reflect.has(target, key) || Reflect.has(contextObjectToFallback.get(target), key)
};
const proxifyContext = (current, inherited = {}) => {
  if (contextProxies.has(current)) {
    throw Error('This object cannot be proxified.');
  }
  contextObjectToFallback.set(current, inherited);
  if (!contextObjectToProxy.has(current)) {
    const proxy = new Proxy(current, contextHandlers);
    contextObjectToProxy.set(current, proxy);
    contextProxies.add(proxy);
  }
  return contextObjectToProxy.get(current);
};
;
;
const stores = new Map();
const rawStores = new Map();
const storeLocks = new Map();
const storeConfigs = new Map();
const serverStates = new Map();
const getConfig = namespace => storeConfigs.get(namespace || getNamespace()) || {};
const getServerState = namespace => {
  const ns = namespace || getNamespace();
  if (!serverStates.has(ns)) {
    serverStates.set(ns, proxifyState(ns, {}, {
      readOnly: true
    }));
  }
  return serverStates.get(ns);
};
const universalUnlock = 'I acknowledge that using a private store means my plugin will inevitably break on the next store release.';
function store(namespace, {
  state = {},
  ...block
} = {}, {
  lock = false
} = {}) {
  if (!stores.has(namespace)) {
    if (lock !== universalUnlock) {
      storeLocks.set(namespace, lock);
    }
    const rawStore = {
      state: proxifyState(namespace, isPlainObject(state) ? state : {}),
      ...block
    };
    const proxifiedStore = proxifyStore(namespace, rawStore);
    rawStores.set(namespace, rawStore);
    stores.set(namespace, proxifiedStore);
  } else {
    if (lock !== universalUnlock && !storeLocks.has(namespace)) {
      storeLocks.set(namespace, lock);
    } else {
      const storeLock = storeLocks.get(namespace);
      const isLockValid = lock === universalUnlock || lock !== true && lock === storeLock;
      if (!isLockValid) {
        if (!storeLock) {
          throw Error('Cannot lock a public store');
        } else {
          throw Error('Cannot unlock a private store with an invalid lock code');
        }
      }
    }
    const target = rawStores.get(namespace);
    deepMerge(target, block);
    deepMerge(target.state, state);
  }
  return stores.get(namespace);
}
const parseServerData = (dom = document) => {
  var _dom$getElementById;
  const jsonDataScriptTag = 
  (_dom$getElementById = dom.getElementById('wp-script-module-data-@wordpress/interactivity')) !== null && _dom$getElementById !== void 0 ? _dom$getElementById :
  dom.getElementById('wp-interactivity-data');
  if (jsonDataScriptTag?.textContent) {
    try {
      return JSON.parse(jsonDataScriptTag.textContent);
    } catch {}
  }
  return {};
};
const populateServerData = data => {
  if (isPlainObject(data?.state)) {
    Object.entries(data.state).forEach(([namespace, state]) => {
      const st = store(namespace, {}, {
        lock: universalUnlock
      });
      deepMerge(st.state, state, false);
      deepMerge(getServerState(namespace), state);
    });
  }
  if (isPlainObject(data?.config)) {
    Object.entries(data.config).forEach(([namespace, config]) => {
      storeConfigs.set(namespace, config);
    });
  }
};
const data = parseServerData();
populateServerData(data);
;
function isNonDefaultDirectiveSuffix(entry) {
  return entry.suffix !== null;
}
function isDefaultDirectiveSuffix(entry) {
  return entry.suffix === null;
}
const context = (0,preact_module.q6)({
  client: {},
  server: {}
});
const directiveCallbacks = {};
const directivePriorities = {};
const directive = (name, callback, {
  priority = 10
} = {}) => {
  directiveCallbacks[name] = callback;
  directivePriorities[name] = priority;
};
const resolve = (path, namespace) => {
  if (!namespace) {
    warn(`Namespace missing for "${path}". The value for that path won't be resolved.`);
    return;
  }
  let resolvedStore = stores.get(namespace);
  if (typeof resolvedStore === 'undefined') {
    resolvedStore = store(namespace, {}, {
      lock: universalUnlock
    });
  }
  const current = {
    ...resolvedStore,
    context: getScope().context[namespace]
  };
  try {
    return path.split('.').reduce((acc, key) => acc[key], current);
  } catch (e) {}
};
const getEvaluate = ({
  scope
}) =>
(entry, ...args) => {
  let {
    value: path,
    namespace
  } = entry;
  if (typeof path !== 'string') {
    throw new Error('The `value` prop should be a string path');
  }
  const hasNegationOperator = path[0] === '!' && !!(path = path.slice(1));
  setScope(scope);
  const value = resolve(path, namespace);
  if (typeof value === 'function') {
    if (hasNegationOperator) {
      warn('Using a function with a negation operator is deprecated and will stop working in WordPress 6.9. Please use derived state instead.');
      const functionResult = !value(...args);
      resetScope();
      return functionResult;
    }
    resetScope();
    return (...functionArgs) => {
      setScope(scope);
      const functionResult = value(...functionArgs);
      resetScope();
      return functionResult;
    };
  }
  const result = value;
  resetScope();
  return hasNegationOperator ? !result : result;
};
const getPriorityLevels = directives => {
  const byPriority = Object.keys(directives).reduce((obj, name) => {
    if (directiveCallbacks[name]) {
      const priority = directivePriorities[name];
      (obj[priority] = obj[priority] || []).push(name);
    }
    return obj;
  }, {});
  return Object.entries(byPriority).sort(([p1], [p2]) => parseInt(p1) - parseInt(p2)).map(([, arr]) => arr);
};
const Directives = ({
  directives,
  priorityLevels: [currentPriorityLevel, ...nextPriorityLevels],
  element,
  originalProps,
  previousScope
}) => {
  const scope = A({}).current;
  scope.evaluate = q(getEvaluate({
    scope
  }), []);
  const {
    client,
    server
  } = x(context);
  scope.context = client;
  scope.serverContext = server;
  scope.ref = previousScope?.ref || A(null);
  element = (0,preact_module.Ob)(element, {
    ref: scope.ref
  });
  scope.attributes = element.props;
  const children = nextPriorityLevels.length > 0 ? (0,preact_module.h)(Directives, {
    directives,
    priorityLevels: nextPriorityLevels,
    element,
    originalProps,
    previousScope: scope
  }) : element;
  const props = {
    ...originalProps,
    children
  };
  const directiveArgs = {
    directives,
    props,
    element,
    context,
    evaluate: scope.evaluate
  };
  setScope(scope);
  for (const directiveName of currentPriorityLevel) {
    const wrapper = directiveCallbacks[directiveName]?.(directiveArgs);
    if (wrapper !== undefined) {
      props.children = wrapper;
    }
  }
  resetScope();
  return props.children;
};
const old = preact_module.fF.vnode;
preact_module.fF.vnode = vnode => {
  if (vnode.props.__directives) {
    const props = vnode.props;
    const directives = props.__directives;
    if (directives.key) {
      vnode.key = directives.key.find(isDefaultDirectiveSuffix).value;
    }
    delete props.__directives;
    const priorityLevels = getPriorityLevels(directives);
    if (priorityLevels.length > 0) {
      vnode.props = {
        directives,
        priorityLevels,
        originalProps: props,
        type: vnode.type,
        element: (0,preact_module.h)(vnode.type, props),
        top: true
      };
      vnode.type = Directives;
    }
  }
  if (old) {
    old(vnode);
  }
};
;
function deepClone(source) {
  if (isPlainObject(source)) {
    return Object.fromEntries(Object.entries(source).map(([key, value]) => [key, deepClone(value)]));
  }
  if (Array.isArray(source)) {
    return source.map(i => deepClone(i));
  }
  return source;
}
function wrapEventAsync(event) {
  const handler = {
    get(target, prop, receiver) {
      const value = target[prop];
      switch (prop) {
        case 'currentTarget':
          warn(`Accessing the synchronous event.${prop} property in a store action without wrapping it in withSyncEvent() is deprecated and will stop working in WordPress 6.9. Please wrap the store action in withSyncEvent().`);
          break;
        case 'preventDefault':
        case 'stopImmediatePropagation':
        case 'stopPropagation':
          warn(`Using the synchronous event.${prop}() function in a store action without wrapping it in withSyncEvent() is deprecated and will stop working in WordPress 6.9. Please wrap the store action in withSyncEvent().`);
          break;
      }
      if (value instanceof Function) {
        return function (...args) {
          return value.apply(this === receiver ? target : this, args);
        };
      }
      return value;
    }
  };
  return new Proxy(event, handler);
}
const newRule = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g;
const ruleClean = /\/\*[^]*?\*\/|  +/g;
const ruleNewline = /\n+/g;
const empty = ' ';
const cssStringToObject = val => {
  const tree = [{}];
  let block, left;
  while (block = newRule.exec(val.replace(ruleClean, ''))) {
    if (block[4]) {
      tree.shift();
    } else if (block[3]) {
      left = block[3].replace(ruleNewline, empty).trim();
      tree.unshift(tree[0][left] = tree[0][left] || {});
    } else {
      tree[0][block[1]] = block[2].replace(ruleNewline, empty).trim();
    }
  }
  return tree[0];
};
const getGlobalEventDirective = type => {
  return ({
    directives,
    evaluate
  }) => {
    directives[`on-${type}`].filter(isNonDefaultDirectiveSuffix).forEach(entry => {
      const eventName = entry.suffix.split('--', 1)[0];
      useInit(() => {
        const cb = event => {
          const result = evaluate(entry);
          if (typeof result === 'function') {
            if (!result?.sync) {
              event = wrapEventAsync(event);
            }
            result(event);
          }
        };
        const globalVar = type === 'window' ? window : document;
        globalVar.addEventListener(eventName, cb);
        return () => globalVar.removeEventListener(eventName, cb);
      });
    });
  };
};
const getGlobalAsyncEventDirective = type => {
  return ({
    directives,
    evaluate
  }) => {
    directives[`on-async-${type}`].filter(isNonDefaultDirectiveSuffix).forEach(entry => {
      const eventName = entry.suffix.split('--', 1)[0];
      useInit(() => {
        const cb = async event => {
          await splitTask();
          const result = evaluate(entry);
          if (typeof result === 'function') {
            result(event);
          }
        };
        const globalVar = type === 'window' ? window : document;
        globalVar.addEventListener(eventName, cb, {
          passive: true
        });
        return () => globalVar.removeEventListener(eventName, cb);
      });
    });
  };
};
 const directives = (() => {
  directive('context', ({
    directives: {
      context
    },
    props: {
      children
    },
    context: inheritedContext
  }) => {
    const {
      Provider
    } = inheritedContext;
    const defaultEntry = context.find(isDefaultDirectiveSuffix);
    const {
      client: inheritedClient,
      server: inheritedServer
    } = x(inheritedContext);
    const ns = defaultEntry.namespace;
    const client = A(proxifyState(ns, {}));
    const server = A(proxifyState(ns, {}, {
      readOnly: true
    }));
    const contextStack = T(() => {
      const result = {
        client: {
          ...inheritedClient
        },
        server: {
          ...inheritedServer
        }
      };
      if (defaultEntry) {
        const {
          namespace,
          value
        } = defaultEntry;
        if (!isPlainObject(value)) {
          warn(`The value of data-wp-context in "${namespace}" store must be a valid stringified JSON object.`);
        }
        deepMerge(client.current, deepClone(value), false);
        deepMerge(server.current, deepClone(value));
        result.client[namespace] = proxifyContext(client.current, inheritedClient[namespace]);
        result.server[namespace] = proxifyContext(server.current, inheritedServer[namespace]);
      }
      return result;
    }, [defaultEntry, inheritedClient, inheritedServer]);
    return (0,preact_module.h)(Provider, {
      value: contextStack
    }, children);
  }, {
    priority: 5
  });
  directive('watch', ({
    directives: {
      watch
    },
    evaluate
  }) => {
    watch.forEach(entry => {
      useWatch(() => {
        let start;
        if (false) {}
        let result = evaluate(entry);
        if (typeof result === 'function') {
          result = result();
        }
        if (false) {}
        return result;
      });
    });
  });
  directive('init', ({
    directives: {
      init
    },
    evaluate
  }) => {
    init.forEach(entry => {
      useInit(() => {
        let start;
        if (false) {}
        let result = evaluate(entry);
        if (typeof result === 'function') {
          result = result();
        }
        if (false) {}
        return result;
      });
    });
  });
  directive('on', ({
    directives: {
      on
    },
    element,
    evaluate
  }) => {
    const events = new Map();
    on.filter(isNonDefaultDirectiveSuffix).forEach(entry => {
      const event = entry.suffix.split('--')[0];
      if (!events.has(event)) {
        events.set(event, new Set());
      }
      events.get(event).add(entry);
    });
    events.forEach((entries, eventType) => {
      const existingHandler = element.props[`on${eventType}`];
      element.props[`on${eventType}`] = event => {
        entries.forEach(entry => {
          if (existingHandler) {
            existingHandler(event);
          }
          let start;
          if (false) {}
          const result = evaluate(entry);
          if (typeof result === 'function') {
            if (!result?.sync) {
              event = wrapEventAsync(event);
            }
            result(event);
          }
          if (false) {}
        });
      };
    });
  });
  directive('on-async', ({
    directives: {
      'on-async': onAsync
    },
    element,
    evaluate
  }) => {
    const events = new Map();
    onAsync.filter(isNonDefaultDirectiveSuffix).forEach(entry => {
      const event = entry.suffix.split('--')[0];
      if (!events.has(event)) {
        events.set(event, new Set());
      }
      events.get(event).add(entry);
    });
    events.forEach((entries, eventType) => {
      const existingHandler = element.props[`on${eventType}`];
      element.props[`on${eventType}`] = event => {
        if (existingHandler) {
          existingHandler(event);
        }
        entries.forEach(async entry => {
          await splitTask();
          const result = evaluate(entry);
          if (typeof result === 'function') {
            result(event);
          }
        });
      };
    });
  });
  directive('on-window', getGlobalEventDirective('window'));
  directive('on-document', getGlobalEventDirective('document'));
  directive('on-async-window', getGlobalAsyncEventDirective('window'));
  directive('on-async-document', getGlobalAsyncEventDirective('document'));
  directive('class', ({
    directives: {
      class: classNames
    },
    element,
    evaluate
  }) => {
    classNames.filter(isNonDefaultDirectiveSuffix).forEach(entry => {
      const className = entry.suffix;
      let result = evaluate(entry);
      if (typeof result === 'function') {
        result = result();
      }
      const currentClass = element.props.class || '';
      const classFinder = new RegExp(`(^|\\s)${className}(\\s|$)`, 'g');
      if (!result) {
        element.props.class = currentClass.replace(classFinder, ' ').trim();
      } else if (!classFinder.test(currentClass)) {
        element.props.class = currentClass ? `${currentClass} ${className}` : className;
      }
      useInit(() => {
        if (!result) {
          element.ref.current.classList.remove(className);
        } else {
          element.ref.current.classList.add(className);
        }
      });
    });
  });
  directive('style', ({
    directives: {
      style
    },
    element,
    evaluate
  }) => {
    style.filter(isNonDefaultDirectiveSuffix).forEach(entry => {
      const styleProp = entry.suffix;
      let result = evaluate(entry);
      if (typeof result === 'function') {
        result = result();
      }
      element.props.style = element.props.style || {};
      if (typeof element.props.style === 'string') {
        element.props.style = cssStringToObject(element.props.style);
      }
      if (!result) {
        delete element.props.style[styleProp];
      } else {
        element.props.style[styleProp] = result;
      }
      useInit(() => {
        if (!result) {
          element.ref.current.style.removeProperty(styleProp);
        } else {
          element.ref.current.style[styleProp] = result;
        }
      });
    });
  });
  directive('bind', ({
    directives: {
      bind
    },
    element,
    evaluate
  }) => {
    bind.filter(isNonDefaultDirectiveSuffix).forEach(entry => {
      const attribute = entry.suffix;
      let result = evaluate(entry);
      if (typeof result === 'function') {
        result = result();
      }
      element.props[attribute] = result;
      useInit(() => {
        const el = element.ref.current;
        if (attribute === 'style') {
          if (typeof result === 'string') {
            el.style.cssText = result;
          }
          return;
        } else if (attribute !== 'width' && attribute !== 'height' && attribute !== 'href' && attribute !== 'list' && attribute !== 'form' &&
        attribute !== 'tabIndex' && attribute !== 'download' && attribute !== 'rowSpan' && attribute !== 'colSpan' && attribute !== 'role' && attribute in el) {
          try {
            el[attribute] = result === null || result === undefined ? '' : result;
            return;
          } catch (err) {}
        }
        if (result !== null && result !== undefined && (result !== false || attribute[4] === '-')) {
          el.setAttribute(attribute, result);
        } else {
          el.removeAttribute(attribute);
        }
      });
    });
  });
  directive('ignore', ({
    element: {
      type: Type,
      props: {
        innerHTML,
        ...rest
      }
    }
  }) => {
    const cached = T(() => innerHTML, []);
    return (0,preact_module.h)(Type, {
      dangerouslySetInnerHTML: {
        __html: cached
      },
      ...rest
    });
  });
  directive('text', ({
    directives: {
      text
    },
    element,
    evaluate
  }) => {
    const entry = text.find(isDefaultDirectiveSuffix);
    if (!entry) {
      element.props.children = null;
      return;
    }
    try {
      let result = evaluate(entry);
      if (typeof result === 'function') {
        result = result();
      }
      element.props.children = typeof result === 'object' ? null : result.toString();
    } catch (e) {
      element.props.children = null;
    }
  });
  directive('run', ({
    directives: {
      run
    },
    evaluate
  }) => {
    run.forEach(entry => {
      let result = evaluate(entry);
      if (typeof result === 'function') {
        result = result();
      }
      return result;
    });
  });
  directive('each', ({
    directives: {
      each,
      'each-key': eachKey
    },
    context: inheritedContext,
    element,
    evaluate
  }) => {
    if (element.type !== 'template') {
      return;
    }
    const {
      Provider
    } = inheritedContext;
    const inheritedValue = x(inheritedContext);
    const [entry] = each;
    const {
      namespace
    } = entry;
    let iterable = evaluate(entry);
    if (typeof iterable === 'function') {
      iterable = iterable();
    }
    if (typeof iterable?.[Symbol.iterator] !== 'function') {
      return;
    }
    const itemProp = isNonDefaultDirectiveSuffix(entry) ? kebabToCamelCase(entry.suffix) : 'item';
    const result = [];
    for (const item of iterable) {
      const itemContext = proxifyContext(proxifyState(namespace, {}), inheritedValue.client[namespace]);
      const mergedContext = {
        client: {
          ...inheritedValue.client,
          [namespace]: itemContext
        },
        server: {
          ...inheritedValue.server
        }
      };
      mergedContext.client[namespace][itemProp] = item;
      const scope = {
        ...getScope(),
        context: mergedContext.client,
        serverContext: mergedContext.server
      };
      const key = eachKey ? getEvaluate({
        scope
      })(eachKey[0]) : item;
      result.push((0,preact_module.h)(Provider, {
        value: mergedContext,
        key
      }, element.props.content));
    }
    return result;
  }, {
    priority: 20
  });
  directive('each-child', () => null, {
    priority: 1
  });
});
;
const directivePrefix = 'wp';
;
const ignoreAttr = `data-${directivePrefix}-ignore`;
const islandAttr = `data-${directivePrefix}-interactive`;
const fullPrefix = `data-${directivePrefix}-`;
const namespaces = [];
const currentNamespace = () => {
  var _namespaces;
  return (_namespaces = namespaces[namespaces.length - 1]) !== null && _namespaces !== void 0 ? _namespaces : null;
};
const isObject = item => Boolean(item && typeof item === 'object' && item.constructor === Object);
const directiveParser = new RegExp(`^data-${directivePrefix}-` +
'([a-z0-9]+(?:-[a-z0-9]+)*)' +
'(?:--([a-z0-9_-]+))?$', 'i' 
);
const nsPathRegExp = /^([\w_\/-]+)::(.+)$/;
const hydratedIslands = new WeakSet();
function toVdom(root) {
  const treeWalker = document.createTreeWalker(root, 205 
  );
  function walk(node) {
    const {
      nodeType
    } = node;
    if (nodeType === 3) {
      return [node.data];
    }
    if (nodeType === 4) {
      var _nodeValue;
      const next = treeWalker.nextSibling();
      node.replaceWith(new window.Text((_nodeValue = node.nodeValue) !== null && _nodeValue !== void 0 ? _nodeValue : ''));
      return [node.nodeValue, next];
    }
    if (nodeType === 8 || nodeType === 7) {
      const next = treeWalker.nextSibling();
      node.remove();
      return [null, next];
    }
    const elementNode = node;
    const {
      attributes
    } = elementNode;
    const localName = elementNode.localName;
    const props = {};
    const children = [];
    const directives = [];
    let ignore = false;
    let island = false;
    for (let i = 0; i < attributes.length; i++) {
      const attributeName = attributes[i].name;
      const attributeValue = attributes[i].value;
      if (attributeName[fullPrefix.length] && attributeName.slice(0, fullPrefix.length) === fullPrefix) {
        if (attributeName === ignoreAttr) {
          ignore = true;
        } else {
          var _regexResult$, _regexResult$2;
          const regexResult = nsPathRegExp.exec(attributeValue);
          const namespace = (_regexResult$ = regexResult?.[1]) !== null && _regexResult$ !== void 0 ? _regexResult$ : null;
          let value = (_regexResult$2 = regexResult?.[2]) !== null && _regexResult$2 !== void 0 ? _regexResult$2 : attributeValue;
          try {
            const parsedValue = JSON.parse(value);
            value = isObject(parsedValue) ? parsedValue : value;
          } catch {}
          if (attributeName === islandAttr) {
            island = true;
            const islandNamespace =
            typeof value === 'string' ? value : typeof value?.namespace === 'string' ? value.namespace : null;
            namespaces.push(islandNamespace);
          } else {
            directives.push([attributeName, namespace, value]);
          }
        }
      } else if (attributeName === 'ref') {
        continue;
      }
      props[attributeName] = attributeValue;
    }
    if (ignore && !island) {
      return [(0,preact_module.h)(localName, {
        ...props,
        innerHTML: elementNode.innerHTML,
        __directives: {
          ignore: true
        }
      })];
    }
    if (island) {
      hydratedIslands.add(elementNode);
    }
    if (directives.length) {
      props.__directives = directives.reduce((obj, [name, ns, value]) => {
        const directiveMatch = directiveParser.exec(name);
        if (directiveMatch === null) {
          warn(`Found malformed directive name: ${name}.`);
          return obj;
        }
        const prefix = directiveMatch[1] || '';
        const suffix = directiveMatch[2] || null;
        obj[prefix] = obj[prefix] || [];
        obj[prefix].push({
          namespace: ns !== null && ns !== void 0 ? ns : currentNamespace(),
          value: value,
          suffix
        });
        return obj;
      }, {});
    }
    if (localName === 'template') {
      props.content = [...elementNode.content.childNodes].map(childNode => toVdom(childNode));
    } else {
      let child = treeWalker.firstChild();
      if (child) {
        while (child) {
          const [vnode, nextChild] = walk(child);
          if (vnode) {
            children.push(vnode);
          }
          child = nextChild || treeWalker.nextSibling();
        }
        treeWalker.parentNode();
      }
    }
    if (island) {
      namespaces.pop();
    }
    return [(0,preact_module.h)(localName, props, children)];
  }
  return walk(treeWalker.currentNode);
}
;
const regionRootFragments = new WeakMap();
const getRegionRootFragment = region => {
  if (!region.parentElement) {
    throw Error('The passed region should be an element with a parent.');
  }
  if (!regionRootFragments.has(region)) {
    regionRootFragments.set(region, createRootFragment(region.parentElement, region));
  }
  return regionRootFragments.get(region);
};
const initialVdom = new WeakMap();
const init = async () => {
  const nodes = document.querySelectorAll(`[data-${directivePrefix}-interactive]`);
  await new Promise(resolve => {
    setTimeout(resolve, 0);
  });
  for (const node of nodes) {
    if (!hydratedIslands.has(node)) {
      await splitTask();
      const fragment = getRegionRootFragment(node);
      const vdom = toVdom(node);
      initialVdom.set(node, vdom);
      await splitTask();
      (0,preact_module.Qv)(vdom, fragment);
    }
  }
};
;
const requiredConsent = 'I acknowledge that using private APIs means my theme or plugin will inevitably break in the next version of WordPress.';
const privateApis = lock => {
  if (lock === requiredConsent) {
    return {
      directivePrefix: directivePrefix,
      getRegionRootFragment: getRegionRootFragment,
      initialVdom: initialVdom,
      toVdom: toVdom,
      directive: directive,
      getNamespace: getNamespace,
      h: preact_module.h,
      cloneElement: preact_module.Ob,
      render: preact_module.XX,
      proxifyState: proxifyState,
      parseServerData: parseServerData,
      populateServerData: populateServerData,
      batch: signals_core_module_r
    };
  }
  throw new Error('Forbidden access.');
};
directives();
init();
var __webpack_exports__getConfig = __webpack_exports__.zj;
var __webpack_exports__getContext = __webpack_exports__.SD;
var __webpack_exports__getElement = __webpack_exports__.V6;
var __webpack_exports__getServerContext = __webpack_exports__.$K;
var __webpack_exports__getServerState = __webpack_exports__.vT;
var __webpack_exports__privateApis = __webpack_exports__.jb;
var __webpack_exports__splitTask = __webpack_exports__.yT;
var __webpack_exports__store = __webpack_exports__.M_;
var __webpack_exports__useCallback = __webpack_exports__.hb;
var __webpack_exports__useEffect = __webpack_exports__.vJ;
var __webpack_exports__useInit = __webpack_exports__.ip;
var __webpack_exports__useLayoutEffect = __webpack_exports__.Nf;
var __webpack_exports__useMemo = __webpack_exports__.Kr;
var __webpack_exports__useRef = __webpack_exports__.li;
var __webpack_exports__useState = __webpack_exports__.J0;
var __webpack_exports__useWatch = __webpack_exports__.FH;
var __webpack_exports__withScope = __webpack_exports__.v4;
var __webpack_exports__withSyncEvent = __webpack_exports__.mh;
export { __webpack_exports__getConfig as getConfig, __webpack_exports__getContext as getContext, __webpack_exports__getElement as getElement, __webpack_exports__getServerContext as getServerContext, __webpack_exports__getServerState as getServerState, __webpack_exports__privateApis as privateApis, __webpack_exports__splitTask as splitTask, __webpack_exports__store as store, __webpack_exports__useCallback as useCallback, __webpack_exports__useEffect as useEffect, __webpack_exports__useInit as useInit, __webpack_exports__useLayoutEffect as useLayoutEffect, __webpack_exports__useMemo as useMemo, __webpack_exports__useRef as useRef, __webpack_exports__useState as useState, __webpack_exports__useWatch as useWatch, __webpack_exports__withScope as withScope, __webpack_exports__withSyncEvent as withSyncEvent };
