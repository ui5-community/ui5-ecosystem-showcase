sap.ui.define((function () { 'use strict';

	var exports = exports || {};

	function _mergeNamespaces(n, m) {
		m.forEach(function (e) {
			e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
				if (k !== 'default' && !(k in n)) {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () { return e[k]; }
					});
				}
			});
		});
		return Object.freeze(n);
	}

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function getAugmentedNamespace(n) {
	  if (Object.prototype.hasOwnProperty.call(n, '__esModule')) return n;
	  var f = n.default;
		if (typeof f == "function") {
			var a = function a () {
				var isInstance = false;
	      try {
	        isInstance = this instanceof a;
	      } catch {}
				if (isInstance) {
	        return Reflect.construct(f, arguments, this.constructor);
				}
				return f.apply(this, arguments);
			};
			a.prototype = f.prototype;
	  } else a = {};
	  Object.defineProperty(a, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	var cmis$1 = {};

	var cmis = {};

	var nodePolyfill = {};

	var browser$3 = {exports: {}};

	var hasRequiredBrowser$1;

	function requireBrowser$1 () {
		if (hasRequiredBrowser$1) return browser$3.exports;
		hasRequiredBrowser$1 = 1;
		(function (module, exports) {

			// ref: https://github.com/tc39/proposal-global
			var getGlobal = function () {
				// the only reliable means to get the global object is
				// `Function('return this')()`
				// However, this causes CSP violations in Chrome apps.
				if (typeof self !== 'undefined') { return self; }
				if (typeof window !== 'undefined') { return window; }
				if (typeof commonjsGlobal !== 'undefined') { return commonjsGlobal; }
				throw new Error('unable to locate global object');
			};

			var globalObject = getGlobal();

			module.exports = exports = globalObject.fetch;

			// Needed for TypeScript and Webpack.
			if (globalObject.fetch) {
				exports.default = globalObject.fetch.bind(globalObject);
			}

			exports.Headers = globalObject.Headers;
			exports.Request = globalObject.Request;
			exports.Response = globalObject.Response; 
		} (browser$3, browser$3.exports));
		return browser$3.exports;
	}

	var node;
	var hasRequiredNode;

	function requireNode () {
		if (hasRequiredNode) return node;
		hasRequiredNode = 1;
		var realFetch = requireBrowser$1();

		var fetch = function (url, options) {
		  // Support schemaless URIs on the server for parity with the browser.
		  // Ex: //github.com/ -> https://github.com/
		  if (/^\/\//.test(url)) {
		    url = 'https:' + url;
		  }
		  return realFetch.call(this, url, options);
		};

		fetch.fetch = fetch;
		fetch.Response = realFetch.Response,
		fetch.Headers = realFetch.Headers,
		fetch.Request = realFetch.Request,
		fetch.polyfill = false;

		node = fetch;
		return node;
	}

	var hasRequiredNodePolyfill;

	function requireNodePolyfill () {
		if (hasRequiredNodePolyfill) return nodePolyfill;
		hasRequiredNodePolyfill = 1;
		var fetchNode = requireNode();
		var fetch = fetchNode.fetch.bind({});

		fetch.polyfill = true;

		if (!commonjsGlobal.fetch) {
		  commonjsGlobal.fetch = fetch;
		  commonjsGlobal.Response = fetchNode.Response;
		  commonjsGlobal.Headers = fetchNode.Headers;
		  commonjsGlobal.Request = fetchNode.Request;
		}
		return nodePolyfill;
	}

	var browser$2 = {};

	var hasRequiredBrowser;

	function requireBrowser () {
		if (hasRequiredBrowser) return browser$2;
		hasRequiredBrowser = 1;

		browser$2.atob = self.atob.bind(self);
		browser$2.btoa = self.btoa.bind(self);
		return browser$2;
	}

	var lib = {exports: {}};

	var global$1 = (typeof global !== "undefined" ? global :
	  typeof self !== "undefined" ? self :
	  typeof window !== "undefined" ? window : {});

	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
	var inited = false;
	function init () {
	  inited = true;
	  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	  for (var i = 0, len = code.length; i < len; ++i) {
	    lookup[i] = code[i];
	    revLookup[code.charCodeAt(i)] = i;
	  }

	  revLookup['-'.charCodeAt(0)] = 62;
	  revLookup['_'.charCodeAt(0)] = 63;
	}

	function toByteArray (b64) {
	  if (!inited) {
	    init();
	  }
	  var i, j, l, tmp, placeHolders, arr;
	  var len = b64.length;

	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }

	  // the number of equal signs (place holders)
	  // if there are two placeholders, than the two characters before it
	  // represent one byte
	  // if there is only one, then the three characters before it represent 2 bytes
	  // this is just a cheap hack to not do indexOf twice
	  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

	  // base64 is 4/3 + up to two characters of the original data
	  arr = new Arr(len * 3 / 4 - placeHolders);

	  // if there are placeholders, only get up to the last complete 4 chars
	  l = placeHolders > 0 ? len - 4 : len;

	  var L = 0;

	  for (i = 0, j = 0; i < l; i += 4, j += 3) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
	    arr[L++] = (tmp >> 16) & 0xFF;
	    arr[L++] = (tmp >> 8) & 0xFF;
	    arr[L++] = tmp & 0xFF;
	  }

	  if (placeHolders === 2) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
	    arr[L++] = tmp & 0xFF;
	  } else if (placeHolders === 1) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
	    arr[L++] = (tmp >> 8) & 0xFF;
	    arr[L++] = tmp & 0xFF;
	  }

	  return arr
	}

	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	  var tmp;
	  var output = [];
	  for (var i = start; i < end; i += 3) {
	    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
	    output.push(tripletToBase64(tmp));
	  }
	  return output.join('')
	}

	function fromByteArray (uint8) {
	  if (!inited) {
	    init();
	  }
	  var tmp;
	  var len = uint8.length;
	  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
	  var output = '';
	  var parts = [];
	  var maxChunkLength = 16383; // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1];
	    output += lookup[tmp >> 2];
	    output += lookup[(tmp << 4) & 0x3F];
	    output += '==';
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
	    output += lookup[tmp >> 10];
	    output += lookup[(tmp >> 4) & 0x3F];
	    output += lookup[(tmp << 2) & 0x3F];
	    output += '=';
	  }

	  parts.push(output);

	  return parts.join('')
	}

	function read (buffer, offset, isLE, mLen, nBytes) {
	  var e, m;
	  var eLen = nBytes * 8 - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var nBits = -7;
	  var i = isLE ? (nBytes - 1) : 0;
	  var d = isLE ? -1 : 1;
	  var s = buffer[offset + i];

	  i += d;

	  e = s & ((1 << (-nBits)) - 1);
	  s >>= (-nBits);
	  nBits += eLen;
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1);
	  e >>= (-nBits);
	  nBits += mLen;
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen);
	    e = e - eBias;
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	function write (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c;
	  var eLen = nBytes * 8 - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
	  var i = isLE ? 0 : (nBytes - 1);
	  var d = isLE ? 1 : -1;
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

	  value = Math.abs(value);

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0;
	    e = eMax;
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2);
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * Math.pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }

	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
	      e = 0;
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128;
	}

	var toString = {}.toString;

	var isArray$2 = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};

	/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */


	var INSPECT_MAX_BYTES = 50;

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
	  ? global$1.TYPED_ARRAY_SUPPORT
	  : true;

	/*
	 * Export kMaxLength after typed array support is determined.
	 */
	kMaxLength();

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	function createBuffer (that, length) {
	  if (kMaxLength() < length) {
	    throw new RangeError('Invalid typed array length')
	  }
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(length);
	    that.__proto__ = Buffer.prototype;
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    if (that === null) {
	      that = new Buffer(length);
	    }
	    that.length = length;
	  }

	  return that
	}

	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */

	function Buffer (arg, encodingOrOffset, length) {
	  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
	    return new Buffer(arg, encodingOrOffset, length)
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new Error(
	        'If encoding is specified then the first argument must be a string'
	      )
	    }
	    return allocUnsafe(this, arg)
	  }
	  return from(this, arg, encodingOrOffset, length)
	}

	Buffer.poolSize = 8192; // not used by this implementation

	// TODO: Legacy, not needed anymore. Remove in next major version.
	Buffer._augment = function (arr) {
	  arr.__proto__ = Buffer.prototype;
	  return arr
	};

	function from (that, value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }

	  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
	    return fromArrayBuffer(that, value, encodingOrOffset, length)
	  }

	  if (typeof value === 'string') {
	    return fromString(that, value, encodingOrOffset)
	  }

	  return fromObject(that, value)
	}

	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	  return from(null, value, encodingOrOffset, length)
	};

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype;
	  Buffer.__proto__ = Uint8Array;
	  if (typeof Symbol !== 'undefined' && Symbol.species &&
	      Buffer[Symbol.species] === Buffer) ;
	}

	function assertSize (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be a number')
	  } else if (size < 0) {
	    throw new RangeError('"size" argument must not be negative')
	  }
	}

	function alloc (that, size, fill, encoding) {
	  assertSize(size);
	  if (size <= 0) {
	    return createBuffer(that, size)
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpretted as a start offset.
	    return typeof encoding === 'string'
	      ? createBuffer(that, size).fill(fill, encoding)
	      : createBuffer(that, size).fill(fill)
	  }
	  return createBuffer(that, size)
	}

	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	  return alloc(null, size, fill, encoding)
	};

	function allocUnsafe (that, size) {
	  assertSize(size);
	  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < size; ++i) {
	      that[i] = 0;
	    }
	  }
	  return that
	}

	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	  return allocUnsafe(null, size)
	};
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	  return allocUnsafe(null, size)
	};

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8';
	  }

	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }

	  var length = byteLength(string, encoding) | 0;
	  that = createBuffer(that, length);

	  var actual = that.write(string, encoding);

	  if (actual !== length) {
	    // Writing a hex string, for example, that contains invalid characters will
	    // cause everything after the first invalid character to be ignored. (e.g.
	    // 'abxxcd' will be treated as 'ab')
	    that = that.slice(0, actual);
	  }

	  return that
	}

	function fromArrayLike (that, array) {
	  var length = array.length < 0 ? 0 : checked(array.length) | 0;
	  that = createBuffer(that, length);
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255;
	  }
	  return that
	}

	function fromArrayBuffer (that, array, byteOffset, length) {
	  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('\'offset\' is out of bounds')
	  }

	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('\'length\' is out of bounds')
	  }

	  if (byteOffset === undefined && length === undefined) {
	    array = new Uint8Array(array);
	  } else if (length === undefined) {
	    array = new Uint8Array(array, byteOffset);
	  } else {
	    array = new Uint8Array(array, byteOffset, length);
	  }

	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = array;
	    that.__proto__ = Buffer.prototype;
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromArrayLike(that, array);
	  }
	  return that
	}

	function fromObject (that, obj) {
	  if (internalIsBuffer(obj)) {
	    var len = checked(obj.length) | 0;
	    that = createBuffer(that, len);

	    if (that.length === 0) {
	      return that
	    }

	    obj.copy(that, 0, 0, len);
	    return that
	  }

	  if (obj) {
	    if ((typeof ArrayBuffer !== 'undefined' &&
	        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
	      if (typeof obj.length !== 'number' || isnan(obj.length)) {
	        return createBuffer(that, 0)
	      }
	      return fromArrayLike(that, obj)
	    }

	    if (obj.type === 'Buffer' && isArray$2(obj.data)) {
	      return fromArrayLike(that, obj.data)
	    }
	  }

	  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength()` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}
	Buffer.isBuffer = isBuffer$1;
	function internalIsBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length;
	  var y = b.length;

	  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i];
	      y = b[i];
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	};

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'latin1':
	    case 'binary':
	    case 'base64':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	};

	Buffer.concat = function concat (list, length) {
	  if (!isArray$2(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers')
	  }

	  if (list.length === 0) {
	    return Buffer.alloc(0)
	  }

	  var i;
	  if (length === undefined) {
	    length = 0;
	    for (i = 0; i < list.length; ++i) {
	      length += list[i].length;
	    }
	  }

	  var buffer = Buffer.allocUnsafe(length);
	  var pos = 0;
	  for (i = 0; i < list.length; ++i) {
	    var buf = list[i];
	    if (!internalIsBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers')
	    }
	    buf.copy(buffer, pos);
	    pos += buf.length;
	  }
	  return buffer
	};

	function byteLength (string, encoding) {
	  if (internalIsBuffer(string)) {
	    return string.length
	  }
	  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
	      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
	    return string.byteLength
	  }
	  if (typeof string !== 'string') {
	    string = '' + string;
	  }

	  var len = string.length;
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false;
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return len
	      case 'utf8':
	      case 'utf-8':
	      case undefined:
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase();
	        loweredCase = true;
	    }
	  }
	}
	Buffer.byteLength = byteLength;

	function slowToString (encoding, start, end) {
	  var loweredCase = false;

	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.

	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0;
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return ''
	  }

	  if (end === undefined || end > this.length) {
	    end = this.length;
	  }

	  if (end <= 0) {
	    return ''
	  }

	  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0;
	  start >>>= 0;

	  if (end <= start) {
	    return ''
	  }

	  if (!encoding) encoding = 'utf8';

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'latin1':
	      case 'binary':
	        return latin1Slice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase();
	        loweredCase = true;
	    }
	  }
	}

	// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
	// Buffer instances.
	Buffer.prototype._isBuffer = true;

	function swap (b, n, m) {
	  var i = b[n];
	  b[n] = b[m];
	  b[m] = i;
	}

	Buffer.prototype.swap16 = function swap16 () {
	  var len = this.length;
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits')
	  }
	  for (var i = 0; i < len; i += 2) {
	    swap(this, i, i + 1);
	  }
	  return this
	};

	Buffer.prototype.swap32 = function swap32 () {
	  var len = this.length;
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits')
	  }
	  for (var i = 0; i < len; i += 4) {
	    swap(this, i, i + 3);
	    swap(this, i + 1, i + 2);
	  }
	  return this
	};

	Buffer.prototype.swap64 = function swap64 () {
	  var len = this.length;
	  if (len % 8 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 64-bits')
	  }
	  for (var i = 0; i < len; i += 8) {
	    swap(this, i, i + 7);
	    swap(this, i + 1, i + 6);
	    swap(this, i + 2, i + 5);
	    swap(this, i + 3, i + 4);
	  }
	  return this
	};

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0;
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	};

	Buffer.prototype.equals = function equals (b) {
	  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	};

	Buffer.prototype.inspect = function inspect () {
	  var str = '';
	  var max = INSPECT_MAX_BYTES;
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
	    if (this.length > max) str += ' ... ';
	  }
	  return '<Buffer ' + str + '>'
	};

	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	  if (!internalIsBuffer(target)) {
	    throw new TypeError('Argument must be a Buffer')
	  }

	  if (start === undefined) {
	    start = 0;
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0;
	  }
	  if (thisStart === undefined) {
	    thisStart = 0;
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length;
	  }

	  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	    throw new RangeError('out of range index')
	  }

	  if (thisStart >= thisEnd && start >= end) {
	    return 0
	  }
	  if (thisStart >= thisEnd) {
	    return -1
	  }
	  if (start >= end) {
	    return 1
	  }

	  start >>>= 0;
	  end >>>= 0;
	  thisStart >>>= 0;
	  thisEnd >>>= 0;

	  if (this === target) return 0

	  var x = thisEnd - thisStart;
	  var y = end - start;
	  var len = Math.min(x, y);

	  var thisCopy = this.slice(thisStart, thisEnd);
	  var targetCopy = target.slice(start, end);

	  for (var i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i];
	      y = targetCopy[i];
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	};

	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	//
	// Arguments:
	// - buffer - a Buffer to search
	// - val - a string, Buffer, or number
	// - byteOffset - an index into `buffer`; will be clamped to an int32
	// - encoding - an optional encoding, relevant is val is a string
	// - dir - true for indexOf, false for lastIndexOf
	function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
	  // Empty buffer means no match
	  if (buffer.length === 0) return -1

	  // Normalize byteOffset
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset;
	    byteOffset = 0;
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff;
	  } else if (byteOffset < -2147483648) {
	    byteOffset = -2147483648;
	  }
	  byteOffset = +byteOffset;  // Coerce to Number.
	  if (isNaN(byteOffset)) {
	    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	    byteOffset = dir ? 0 : (buffer.length - 1);
	  }

	  // Normalize byteOffset: negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
	  if (byteOffset >= buffer.length) {
	    if (dir) return -1
	    else byteOffset = buffer.length - 1;
	  } else if (byteOffset < 0) {
	    if (dir) byteOffset = 0;
	    else return -1
	  }

	  // Normalize val
	  if (typeof val === 'string') {
	    val = Buffer.from(val, encoding);
	  }

	  // Finally, search either indexOf (if dir is true) or lastIndexOf
	  if (internalIsBuffer(val)) {
	    // Special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1
	    }
	    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
	  } else if (typeof val === 'number') {
	    val = val & 0xFF; // Search for a byte value [0-255]
	    if (Buffer.TYPED_ARRAY_SUPPORT &&
	        typeof Uint8Array.prototype.indexOf === 'function') {
	      if (dir) {
	        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
	      } else {
	        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
	      }
	    }
	    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
	  var indexSize = 1;
	  var arrLength = arr.length;
	  var valLength = val.length;

	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase();
	    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	        encoding === 'utf16le' || encoding === 'utf-16le') {
	      if (arr.length < 2 || val.length < 2) {
	        return -1
	      }
	      indexSize = 2;
	      arrLength /= 2;
	      valLength /= 2;
	      byteOffset /= 2;
	    }
	  }

	  function read (buf, i) {
	    if (indexSize === 1) {
	      return buf[i]
	    } else {
	      return buf.readUInt16BE(i * indexSize)
	    }
	  }

	  var i;
	  if (dir) {
	    var foundIndex = -1;
	    for (i = byteOffset; i < arrLength; i++) {
	      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	        if (foundIndex === -1) foundIndex = i;
	        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
	      } else {
	        if (foundIndex !== -1) i -= i - foundIndex;
	        foundIndex = -1;
	      }
	    }
	  } else {
	    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
	    for (i = byteOffset; i >= 0; i--) {
	      var found = true;
	      for (var j = 0; j < valLength; j++) {
	        if (read(arr, i + j) !== read(val, j)) {
	          found = false;
	          break
	        }
	      }
	      if (found) return i
	    }
	  }

	  return -1
	}

	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1
	};

	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
	};

	Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
	};

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0;
	  var remaining = buf.length - offset;
	  if (!length) {
	    length = remaining;
	  } else {
	    length = Number(length);
	    if (length > remaining) {
	      length = remaining;
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length;
	  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2;
	  }
	  for (var i = 0; i < length; ++i) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16);
	    if (isNaN(parsed)) return i
	    buf[offset + i] = parsed;
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function latin1Write (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8';
	    length = this.length;
	    offset = 0;
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset;
	    length = this.length;
	    offset = 0;
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0;
	    if (isFinite(length)) {
	      length = length | 0;
	      if (encoding === undefined) encoding = 'utf8';
	    } else {
	      encoding = length;
	      length = undefined;
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    )
	  }

	  var remaining = this.length - offset;
	  if (length === undefined || length > remaining) length = remaining;

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('Attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8';

	  var loweredCase = false;
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'latin1':
	      case 'binary':
	        return latin1Write(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase();
	        loweredCase = true;
	    }
	  }
	};

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	};

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return fromByteArray(buf)
	  } else {
	    return fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end);
	  var res = [];

	  var i = start;
	  while (i < end) {
	    var firstByte = buf[i];
	    var codePoint = null;
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1;

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint;

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte;
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1];
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint;
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1];
	          thirdByte = buf[i + 2];
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint;
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1];
	          thirdByte = buf[i + 2];
	          fourthByte = buf[i + 3];
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint;
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD;
	      bytesPerSequence = 1;
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000;
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
	      codePoint = 0xDC00 | codePoint & 0x3FF;
	    }

	    res.push(codePoint);
	    i += bytesPerSequence;
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000;

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length;
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = '';
	  var i = 0;
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    );
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = '';
	  end = Math.min(buf.length, end);

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i] & 0x7F);
	  }
	  return ret
	}

	function latin1Slice (buf, start, end) {
	  var ret = '';
	  end = Math.min(buf.length, end);

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i]);
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length;

	  if (!start || start < 0) start = 0;
	  if (!end || end < 0 || end > len) end = len;

	  var out = '';
	  for (var i = start; i < end; ++i) {
	    out += toHex(buf[i]);
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end);
	  var res = '';
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length;
	  start = ~~start;
	  end = end === undefined ? len : ~~end;

	  if (start < 0) {
	    start += len;
	    if (start < 0) start = 0;
	  } else if (start > len) {
	    start = len;
	  }

	  if (end < 0) {
	    end += len;
	    if (end < 0) end = 0;
	  } else if (end > len) {
	    end = len;
	  }

	  if (end < start) end = start;

	  var newBuf;
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = this.subarray(start, end);
	    newBuf.__proto__ = Buffer.prototype;
	  } else {
	    var sliceLen = end - start;
	    newBuf = new Buffer(sliceLen, undefined);
	    for (var i = 0; i < sliceLen; ++i) {
	      newBuf[i] = this[i + start];
	    }
	  }

	  return newBuf
	};

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  var val = this[offset];
	  var mul = 1;
	  var i = 0;
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul;
	  }

	  return val
	};

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length);
	  }

	  var val = this[offset + --byteLength];
	  var mul = 1;
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul;
	  }

	  return val
	};

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length);
	  return this[offset]
	};

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  return this[offset] | (this[offset + 1] << 8)
	};

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  return (this[offset] << 8) | this[offset + 1]
	};

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	};

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	};

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  var val = this[offset];
	  var mul = 1;
	  var i = 0;
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul;
	  }
	  mul *= 0x80;

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

	  return val
	};

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  var i = byteLength;
	  var mul = 1;
	  var val = this[offset + --i];
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul;
	  }
	  mul *= 0x80;

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

	  return val
	};

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length);
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	};

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  var val = this[offset] | (this[offset + 1] << 8);
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	};

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  var val = this[offset + 1] | (this[offset] << 8);
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	};

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	};

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	};

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);
	  return read(this, offset, true, 23, 4)
	};

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);
	  return read(this, offset, false, 23, 4)
	};

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length);
	  return read(this, offset, true, 52, 8)
	};

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length);
	  return read(this, offset, false, 52, 8)
	};

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
	    checkInt(this, value, offset, byteLength, maxBytes, 0);
	  }

	  var mul = 1;
	  var i = 0;
	  this[offset] = value & 0xFF;
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
	    checkInt(this, value, offset, byteLength, maxBytes, 0);
	  }

	  var i = byteLength - 1;
	  var mul = 1;
	  this[offset + i] = value & 0xFF;
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
	  this[offset] = (value & 0xff);
	  return offset + 1
	};

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1;
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8;
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff);
	    this[offset + 1] = (value >>> 8);
	  } else {
	    objectWriteUInt16(this, value, offset, true);
	  }
	  return offset + 2
	};

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8);
	    this[offset + 1] = (value & 0xff);
	  } else {
	    objectWriteUInt16(this, value, offset, false);
	  }
	  return offset + 2
	};

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1;
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24);
	    this[offset + 2] = (value >>> 16);
	    this[offset + 1] = (value >>> 8);
	    this[offset] = (value & 0xff);
	  } else {
	    objectWriteUInt32(this, value, offset, true);
	  }
	  return offset + 4
	};

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24);
	    this[offset + 1] = (value >>> 16);
	    this[offset + 2] = (value >>> 8);
	    this[offset + 3] = (value & 0xff);
	  } else {
	    objectWriteUInt32(this, value, offset, false);
	  }
	  return offset + 4
	};

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1);

	    checkInt(this, value, offset, byteLength, limit - 1, -limit);
	  }

	  var i = 0;
	  var mul = 1;
	  var sub = 0;
	  this[offset] = value & 0xFF;
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1;
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1);

	    checkInt(this, value, offset, byteLength, limit - 1, -limit);
	  }

	  var i = byteLength - 1;
	  var mul = 1;
	  var sub = 0;
	  this[offset + i] = value & 0xFF;
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1;
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -128);
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
	  if (value < 0) value = 0xff + value + 1;
	  this[offset] = (value & 0xff);
	  return offset + 1
	};

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -32768);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff);
	    this[offset + 1] = (value >>> 8);
	  } else {
	    objectWriteUInt16(this, value, offset, true);
	  }
	  return offset + 2
	};

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -32768);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8);
	    this[offset + 1] = (value & 0xff);
	  } else {
	    objectWriteUInt16(this, value, offset, false);
	  }
	  return offset + 2
	};

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff);
	    this[offset + 1] = (value >>> 8);
	    this[offset + 2] = (value >>> 16);
	    this[offset + 3] = (value >>> 24);
	  } else {
	    objectWriteUInt32(this, value, offset, true);
	  }
	  return offset + 4
	};

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
	  if (value < 0) value = 0xffffffff + value + 1;
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24);
	    this[offset + 1] = (value >>> 16);
	    this[offset + 2] = (value >>> 8);
	    this[offset + 3] = (value & 0xff);
	  } else {
	    objectWriteUInt32(this, value, offset, false);
	  }
	  return offset + 4
	};

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	  if (offset < 0) throw new RangeError('Index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4);
	  }
	  write(buf, value, offset, littleEndian, 23, 4);
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	};

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	};

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8);
	  }
	  write(buf, value, offset, littleEndian, 52, 8);
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	};

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	};

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0;
	  if (!end && end !== 0) end = this.length;
	  if (targetStart >= target.length) targetStart = target.length;
	  if (!targetStart) targetStart = 0;
	  if (end > 0 && end < start) end = start;

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length;
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start;
	  }

	  var len = end - start;
	  var i;

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; --i) {
	      target[i + targetStart] = this[i + start];
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; ++i) {
	      target[i + targetStart] = this[i + start];
	    }
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, start + len),
	      targetStart
	    );
	  }

	  return len
	};

	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill (val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start;
	      start = 0;
	      end = this.length;
	    } else if (typeof end === 'string') {
	      encoding = end;
	      end = this.length;
	    }
	    if (val.length === 1) {
	      var code = val.charCodeAt(0);
	      if (code < 256) {
	        val = code;
	      }
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string')
	    }
	    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding)
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255;
	  }

	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index')
	  }

	  if (end <= start) {
	    return this
	  }

	  start = start >>> 0;
	  end = end === undefined ? this.length : end >>> 0;

	  if (!val) val = 0;

	  var i;
	  if (typeof val === 'number') {
	    for (i = start; i < end; ++i) {
	      this[i] = val;
	    }
	  } else {
	    var bytes = internalIsBuffer(val)
	      ? val
	      : utf8ToBytes(new Buffer(val, encoding).toString());
	    var len = bytes.length;
	    for (i = 0; i < end - start; ++i) {
	      this[i + start] = bytes[i % len];
	    }
	  }

	  return this
	};

	// HELPER FUNCTIONS
	// ================

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '=';
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity;
	  var codePoint;
	  var length = string.length;
	  var leadSurrogate = null;
	  var bytes = [];

	  for (var i = 0; i < length; ++i) {
	    codePoint = string.charCodeAt(i);

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint;

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	        leadSurrogate = codePoint;
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	    }

	    leadSurrogate = null;

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint);
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      );
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      );
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      );
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = [];
	  for (var i = 0; i < str.length; ++i) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF);
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo;
	  var byteArray = [];
	  for (var i = 0; i < str.length; ++i) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i);
	    hi = c >> 8;
	    lo = c % 256;
	    byteArray.push(lo);
	    byteArray.push(hi);
	  }

	  return byteArray
	}


	function base64ToBytes (str) {
	  return toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; ++i) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i];
	  }
	  return i
	}

	function isnan (val) {
	  return val !== val // eslint-disable-line no-self-compare
	}


	// the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
	// The _isBuffer check is for Safari 5-7 support, because it's missing
	// Object.prototype.constructor. Remove this eventually
	function isBuffer$1(obj) {
	  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
	}

	function isFastBuffer (obj) {
	  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
	}

	// For Node v0.10 support. Remove this eventually.
	function isSlowBuffer (obj) {
	  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
	}

	// shim for using process in browser
	// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	var cachedSetTimeout = defaultSetTimout;
	var cachedClearTimeout = defaultClearTimeout;
	if (typeof global$1.setTimeout === 'function') {
	    cachedSetTimeout = setTimeout;
	}
	if (typeof global$1.clearTimeout === 'function') {
	    cachedClearTimeout = clearTimeout;
	}

	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	function nextTick(fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	}
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	var title = 'browser';
	var platform = 'browser';
	var browser = true;
	var env = {};
	var argv = [];
	var version = ''; // empty string to avoid regexp issues
	var versions = {};
	var release = {};
	var config = {};

	function noop() {}

	var on = noop;
	var addListener = noop;
	var once = noop;
	var off = noop;
	var removeListener = noop;
	var removeAllListeners = noop;
	var emit = noop;

	function binding(name) {
	    throw new Error('process.binding is not supported');
	}

	function cwd () { return '/' }
	function chdir (dir) {
	    throw new Error('process.chdir is not supported');
	}function umask() { return 0; }

	// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
	var performance = global$1.performance || {};
	var performanceNow =
	  performance.now        ||
	  performance.mozNow     ||
	  performance.msNow      ||
	  performance.oNow       ||
	  performance.webkitNow  ||
	  function(){ return (new Date()).getTime() };

	// generate timestamp or delta
	// see http://nodejs.org/api/process.html#process_process_hrtime
	function hrtime(previousTimestamp){
	  var clocktime = performanceNow.call(performance)*1e-3;
	  var seconds = Math.floor(clocktime);
	  var nanoseconds = Math.floor((clocktime%1)*1e9);
	  if (previousTimestamp) {
	    seconds = seconds - previousTimestamp[0];
	    nanoseconds = nanoseconds - previousTimestamp[1];
	    if (nanoseconds<0) {
	      seconds--;
	      nanoseconds += 1e9;
	    }
	  }
	  return [seconds,nanoseconds]
	}

	var startTime = new Date();
	function uptime() {
	  var currentTime = new Date();
	  var dif = currentTime - startTime;
	  return dif / 1000;
	}

	var browser$1 = {
	  nextTick: nextTick,
	  title: title,
	  browser: browser,
	  env: env,
	  argv: argv,
	  version: version,
	  versions: versions,
	  on: on,
	  addListener: addListener,
	  once: once,
	  off: off,
	  removeListener: removeListener,
	  removeAllListeners: removeAllListeners,
	  emit: emit,
	  binding: binding,
	  cwd: cwd,
	  chdir: chdir,
	  umask: umask,
	  hrtime: hrtime,
	  platform: platform,
	  release: release,
	  config: config,
	  uptime: uptime
	};

	var inherits;
	if (typeof Object.create === 'function'){
	  inherits = function inherits(ctor, superCtor) {
	    // implementation from standard node.js 'util' module
	    ctor.super_ = superCtor;
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  inherits = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor;
	    var TempCtor = function () {};
	    TempCtor.prototype = superCtor.prototype;
	    ctor.prototype = new TempCtor();
	    ctor.prototype.constructor = ctor;
	  };
	}

	var getOwnPropertyDescriptors =
		Object.getOwnPropertyDescriptors ||
		function getOwnPropertyDescriptors(obj) {
			var keys = Object.keys(obj);
			var descriptors = {};
			for (var i = 0; i < keys.length; i++) {
				descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
			}
			return descriptors;
		};

	var formatRegExp = /%[sdj%]/g;
	function format$1(f) {
		if (!isString(f)) {
			var objects = [];
			for (var i = 0; i < arguments.length; i++) {
				objects.push(inspect(arguments[i]));
			}
			return objects.join(" ");
		}

		var i = 1;
		var args = arguments;
		var len = args.length;
		var str = String(f).replace(formatRegExp, function (x) {
			if (x === "%%") return "%";
			if (i >= len) return x;
			switch (x) {
				case "%s":
					return String(args[i++]);
				case "%d":
					return Number(args[i++]);
				case "%j":
					try {
						return JSON.stringify(args[i++]);
					} catch (_) {
						return "[Circular]";
					}
				default:
					return x;
			}
		});
		for (var x = args[i]; i < len; x = args[++i]) {
			if (isNull(x) || !isObject(x)) {
				str += " " + x;
			} else {
				str += " " + inspect(x);
			}
		}
		return str;
	}

	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	function deprecate(fn, msg) {
		// Allow for deprecating things in the process of starting up.
		if (isUndefined(global$1.process)) {
			return function () {
				return deprecate(fn, msg).apply(this, arguments);
			};
		}

		if (browser$1.noDeprecation === true) {
			return fn;
		}

		var warned = false;
		function deprecated() {
			if (!warned) {
				if (browser$1.throwDeprecation) {
					throw new Error(msg);
				} else if (browser$1.traceDeprecation) {
					console.trace(msg);
				} else {
					console.error(msg);
				}
				warned = true;
			}
			return fn.apply(this, arguments);
		}

		return deprecated;
	}

	var debugs = {};
	var debugEnviron;
	function debuglog(set) {
		if (isUndefined(debugEnviron)) debugEnviron = browser$1.env.NODE_DEBUG || "";
		set = set.toUpperCase();
		if (!debugs[set]) {
			if (new RegExp("\\b" + set + "\\b", "i").test(debugEnviron)) {
				var pid = 0;
				debugs[set] = function () {
					var msg = format$1.apply(null, arguments);
					console.error("%s %d: %s", set, pid, msg);
				};
			} else {
				debugs[set] = function () {};
			}
		}
		return debugs[set];
	}

	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
		// default options
		var ctx = {
			seen: [],
			stylize: stylizeNoColor,
		};
		// legacy...
		if (arguments.length >= 3) ctx.depth = arguments[2];
		if (arguments.length >= 4) ctx.colors = arguments[3];
		if (isBoolean(opts)) {
			// legacy...
			ctx.showHidden = opts;
		} else if (opts) {
			// got an "options" object
			_extend(ctx, opts);
		}
		// set default options
		if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
		if (isUndefined(ctx.depth)) ctx.depth = 2;
		if (isUndefined(ctx.colors)) ctx.colors = false;
		if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
		if (ctx.colors) ctx.stylize = stylizeWithColor;
		return formatValue(ctx, obj, ctx.depth);
	}

	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
		bold: [1, 22],
		italic: [3, 23],
		underline: [4, 24],
		inverse: [7, 27],
		white: [37, 39],
		grey: [90, 39],
		black: [30, 39],
		blue: [34, 39],
		cyan: [36, 39],
		green: [32, 39],
		magenta: [35, 39],
		red: [31, 39],
		yellow: [33, 39],
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
		special: "cyan",
		number: "yellow",
		boolean: "yellow",
		undefined: "grey",
		null: "bold",
		string: "green",
		date: "magenta",
		// "name": intentionally not styling
		regexp: "red",
	};

	function stylizeWithColor(str, styleType) {
		var style = inspect.styles[styleType];

		if (style) {
			return "\u001b[" + inspect.colors[style][0] + "m" + str + "\u001b[" + inspect.colors[style][1] + "m";
		} else {
			return str;
		}
	}

	function stylizeNoColor(str, styleType) {
		return str;
	}

	function arrayToHash(array) {
		var hash = {};

		array.forEach(function (val, idx) {
			hash[val] = true;
		});

		return hash;
	}

	function formatValue(ctx, value, recurseTimes) {
		// Provide a hook for user-specified inspect functions.
		// Check that value is an object with an inspect function on it
		if (
			ctx.customInspect &&
			value &&
			isFunction$1(value.inspect) &&
			// Filter out the util module, it's inspect function is special
			value.inspect !== inspect &&
			// Also filter out any prototype objects using the circular check.
			!(value.constructor && value.constructor.prototype === value)
		) {
			var ret = value.inspect(recurseTimes, ctx);
			if (!isString(ret)) {
				ret = formatValue(ctx, ret, recurseTimes);
			}
			return ret;
		}

		// Primitive types cannot have properties
		var primitive = formatPrimitive(ctx, value);
		if (primitive) {
			return primitive;
		}

		// Look up the keys of the object.
		var keys = Object.keys(value);
		var visibleKeys = arrayToHash(keys);

		if (ctx.showHidden) {
			keys = Object.getOwnPropertyNames(value);
		}

		// IE doesn't make error fields non-enumerable
		// http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
		if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
			return formatError(value);
		}

		// Some type of object without properties can be shortcutted.
		if (keys.length === 0) {
			if (isFunction$1(value)) {
				var name = value.name ? ": " + value.name : "";
				return ctx.stylize("[Function" + name + "]", "special");
			}
			if (isRegExp(value)) {
				return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
			}
			if (isDate(value)) {
				return ctx.stylize(Date.prototype.toString.call(value), "date");
			}
			if (isError(value)) {
				return formatError(value);
			}
		}

		var base = "",
			array = false,
			braces = ["{", "}"];

		// Make Array say that they are Array
		if (isArray$1(value)) {
			array = true;
			braces = ["[", "]"];
		}

		// Make functions say that they are functions
		if (isFunction$1(value)) {
			var n = value.name ? ": " + value.name : "";
			base = " [Function" + n + "]";
		}

		// Make RegExps say that they are RegExps
		if (isRegExp(value)) {
			base = " " + RegExp.prototype.toString.call(value);
		}

		// Make dates with properties first say the date
		if (isDate(value)) {
			base = " " + Date.prototype.toUTCString.call(value);
		}

		// Make error with message first say the error
		if (isError(value)) {
			base = " " + formatError(value);
		}

		if (keys.length === 0 && (!array || value.length == 0)) {
			return braces[0] + base + braces[1];
		}

		if (recurseTimes < 0) {
			if (isRegExp(value)) {
				return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
			} else {
				return ctx.stylize("[Object]", "special");
			}
		}

		ctx.seen.push(value);

		var output;
		if (array) {
			output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
		} else {
			output = keys.map(function (key) {
				return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
			});
		}

		ctx.seen.pop();

		return reduceToSingleString(output, base, braces);
	}

	function formatPrimitive(ctx, value) {
		if (isUndefined(value)) return ctx.stylize("undefined", "undefined");
		if (isString(value)) {
			var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
			return ctx.stylize(simple, "string");
		}
		if (isNumber(value)) return ctx.stylize("" + value, "number");
		if (isBoolean(value)) return ctx.stylize("" + value, "boolean");
		// For some reason typeof null is "object", so special case here.
		if (isNull(value)) return ctx.stylize("null", "null");
	}

	function formatError(value) {
		return "[" + Error.prototype.toString.call(value) + "]";
	}

	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
		var output = [];
		for (var i = 0, l = value.length; i < l; ++i) {
			if (hasOwnProperty$1(value, String(i))) {
				output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
			} else {
				output.push("");
			}
		}
		keys.forEach(function (key) {
			if (!key.match(/^\d+$/)) {
				output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
			}
		});
		return output;
	}

	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
		var name, str, desc;
		desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
		if (desc.get) {
			if (desc.set) {
				str = ctx.stylize("[Getter/Setter]", "special");
			} else {
				str = ctx.stylize("[Getter]", "special");
			}
		} else {
			if (desc.set) {
				str = ctx.stylize("[Setter]", "special");
			}
		}
		if (!hasOwnProperty$1(visibleKeys, key)) {
			name = "[" + key + "]";
		}
		if (!str) {
			if (ctx.seen.indexOf(desc.value) < 0) {
				if (isNull(recurseTimes)) {
					str = formatValue(ctx, desc.value, null);
				} else {
					str = formatValue(ctx, desc.value, recurseTimes - 1);
				}
				if (str.indexOf("\n") > -1) {
					if (array) {
						str = str
							.split("\n")
							.map(function (line) {
								return "  " + line;
							})
							.join("\n")
							.substr(2);
					} else {
						str =
							"\n" +
							str
								.split("\n")
								.map(function (line) {
									return "   " + line;
								})
								.join("\n");
					}
				}
			} else {
				str = ctx.stylize("[Circular]", "special");
			}
		}
		if (isUndefined(name)) {
			if (array && key.match(/^\d+$/)) {
				return str;
			}
			name = JSON.stringify("" + key);
			if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
				name = name.substr(1, name.length - 2);
				name = ctx.stylize(name, "name");
			} else {
				name = name
					.replace(/'/g, "\\'")
					.replace(/\\"/g, '"')
					.replace(/(^"|"$)/g, "'");
				name = ctx.stylize(name, "string");
			}
		}

		return name + ": " + str;
	}

	function reduceToSingleString(output, base, braces) {
		var length = output.reduce(function (prev, cur) {
			if (cur.indexOf("\n") >= 0) ;
			return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
		}, 0);

		if (length > 60) {
			return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1];
		}

		return braces[0] + base + " " + output.join(", ") + " " + braces[1];
	}

	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray$1(ar) {
		return Array.isArray(ar);
	}

	function isBoolean(arg) {
		return typeof arg === "boolean";
	}

	function isNull(arg) {
		return arg === null;
	}

	function isNullOrUndefined(arg) {
		return arg == null;
	}

	function isNumber(arg) {
		return typeof arg === "number";
	}

	function isString(arg) {
		return typeof arg === "string";
	}

	function isSymbol(arg) {
		return typeof arg === "symbol";
	}

	function isUndefined(arg) {
		return arg === void 0;
	}

	function isRegExp(re) {
		return isObject(re) && objectToString(re) === "[object RegExp]";
	}

	function isObject(arg) {
		return typeof arg === "object" && arg !== null;
	}

	function isDate(d) {
		return isObject(d) && objectToString(d) === "[object Date]";
	}

	function isError(e) {
		return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error);
	}

	function isFunction$1(arg) {
		return typeof arg === "function";
	}

	function isPrimitive(arg) {
		return (
			arg === null ||
			typeof arg === "boolean" ||
			typeof arg === "number" ||
			typeof arg === "string" ||
			typeof arg === "symbol" || // ES6 symbol
			typeof arg === "undefined"
		);
	}

	function isBuffer(maybeBuf) {
		return Buffer.isBuffer(maybeBuf);
	}

	function objectToString(o) {
		return Object.prototype.toString.call(o);
	}

	function pad(n) {
		return n < 10 ? "0" + n.toString(10) : n.toString(10);
	}

	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	// 26 Feb 16:19:34
	function timestamp() {
		var d = new Date();
		var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(":");
		return [d.getDate(), months[d.getMonth()], time].join(" ");
	}

	// log is just a thin wrapper to console.log that prepends a timestamp
	function log() {
		console.log("%s - %s", timestamp(), format$1.apply(null, arguments));
	}

	function _extend(origin, add) {
		// Don't do anything if add isn't an object
		if (!add || !isObject(add)) return origin;

		var keys = Object.keys(add);
		var i = keys.length;
		while (i--) {
			origin[keys[i]] = add[keys[i]];
		}
		return origin;
	}

	function hasOwnProperty$1(obj, prop) {
		return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	var kCustomPromisifiedSymbol = typeof Symbol !== "undefined" ? Symbol("util.promisify.custom") : undefined;

	function promisify(original) {
		if (typeof original !== "function") throw new TypeError('The "original" argument must be of type Function');

		if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
			var fn = original[kCustomPromisifiedSymbol];
			if (typeof fn !== "function") {
				throw new TypeError('The "util.promisify.custom" argument must be of type Function');
			}
			Object.defineProperty(fn, kCustomPromisifiedSymbol, {
				value: fn,
				enumerable: false,
				writable: false,
				configurable: true,
			});
			return fn;
		}

		function fn() {
			var promiseResolve, promiseReject;
			var promise = new Promise(function (resolve, reject) {
				promiseResolve = resolve;
				promiseReject = reject;
			});

			var args = [];
			for (var i = 0; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
			args.push(function (err, value) {
				if (err) {
					promiseReject(err);
				} else {
					promiseResolve(value);
				}
			});

			try {
				original.apply(this, args);
			} catch (err) {
				promiseReject(err);
			}

			return promise;
		}

		Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

		if (kCustomPromisifiedSymbol)
			Object.defineProperty(fn, kCustomPromisifiedSymbol, {
				value: fn,
				enumerable: false,
				writable: false,
				configurable: true,
			});
		return Object.defineProperties(fn, getOwnPropertyDescriptors(original));
	}

	promisify.custom = kCustomPromisifiedSymbol;

	function callbackifyOnRejected(reason, cb) {
		// `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
		// Because `null` is a special error value in callbacks which means "no error
		// occurred", we error-wrap so the callback consumer can distinguish between
		// "the promise rejected with null" or "the promise fulfilled with undefined".
		if (!reason) {
			var newReason = new Error("Promise was rejected with a falsy value");
			newReason.reason = reason;
			reason = newReason;
		}
		return cb(reason);
	}

	function callbackify(original) {
		if (typeof original !== "function") {
			throw new TypeError('The "original" argument must be of type Function');
		}

		// We DO NOT return the promise as it gives the user a false sense that
		// the promise is actually somehow related to the callback's execution
		// and that the callback throwing will reject the promise.
		function callbackified() {
			var args = [];
			for (var i = 0; i < arguments.length; i++) {
				args.push(arguments[i]);
			}

			var maybeCb = args.pop();
			if (typeof maybeCb !== "function") {
				throw new TypeError("The last argument must be of type Function");
			}
			var self = this;
			var cb = function () {
				return maybeCb.apply(self, arguments);
			};
			// In true node style we process the callback on `nextTick` with all the
			// implications (stack, `uncaughtException`, `async_hooks`)
			original.apply(this, args).then(
				function (ret) {
					browser$1.nextTick(cb.bind(null, null, ret));
				},
				function (rej) {
					browser$1.nextTick(callbackifyOnRejected.bind(null, rej, cb));
				}
			);
		}

		Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
		Object.defineProperties(callbackified, getOwnPropertyDescriptors(original));
		return callbackified;
	}

	function isPromise(obj) {
		return obj && typeof obj.then === "function";
	}

	const types = {
		inherits: inherits,
		_extend: _extend,
		log: log,
		isBuffer: isBuffer,
		isPrimitive: isPrimitive,
		isFunction: isFunction$1,
		isError: isError,
		isDate: isDate,
		isObject: isObject,
		isRegExp: isRegExp,
		isUndefined: isUndefined,
		isSymbol: isSymbol,
		isString: isString,
		isNumber: isNumber,
		isNullOrUndefined: isNullOrUndefined,
		isNull: isNull,
		isBoolean: isBoolean,
		isArray: isArray$1,
		inspect: inspect,
		deprecate: deprecate,
		format: format$1,
		debuglog: debuglog,
		promisify: promisify,
		callbackify: callbackify,
		isPromise: isPromise,
	};

	const TextEncoder = (function () {
		return globalThis.TextEncoder || require("util").TextEncoder;
	})(); // ### MODIFIED ###
	const TextDecoder = (function () {
		return globalThis.TextDecoder || require("util").TextDecoder;
	})(); // ### MODIFIED ###

	var _polyfillNode_util = /*#__PURE__*/Object.freeze({
		__proto__: null,
		TextDecoder: TextDecoder,
		TextEncoder: TextEncoder,
		_extend: _extend,
		callbackify: callbackify,
		debuglog: debuglog,
		default: types,
		deprecate: deprecate,
		format: format$1,
		inherits: inherits,
		inspect: inspect,
		isArray: isArray$1,
		isBoolean: isBoolean,
		isBuffer: isBuffer,
		isDate: isDate,
		isError: isError,
		isFunction: isFunction$1,
		isNull: isNull,
		isNullOrUndefined: isNullOrUndefined,
		isNumber: isNumber,
		isObject: isObject,
		isPrimitive: isPrimitive,
		isPromise: isPromise,
		isRegExp: isRegExp,
		isString: isString,
		isSymbol: isSymbol,
		isUndefined: isUndefined,
		log: log,
		promisify: promisify,
		types: types
	});

	var require$$1 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_util);

	var domain;

	// This constructor is used to store event handlers. Instantiating this is
	// faster than explicitly calling `Object.create(null)` to get a "clean" empty
	// object (tested with v8 v4.9).
	function EventHandlers() {}
	EventHandlers.prototype = Object.create(null);

	function EventEmitter() {
	  EventEmitter.init.call(this);
	}

	// nodejs oddity
	// require('events') === require('events').EventEmitter
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.usingDomains = false;

	EventEmitter.prototype.domain = undefined;
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	EventEmitter.init = function() {
	  this.domain = null;
	  if (EventEmitter.usingDomains) {
	    // if there is an active domain, then attach to it.
	    if (domain.active && !(this instanceof domain.Domain)) {
	      this.domain = domain.active;
	    }
	  }

	  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
	    this._events = new EventHandlers();
	    this._eventsCount = 0;
	  }

	  this._maxListeners = this._maxListeners || undefined;
	};

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
	  if (typeof n !== 'number' || n < 0 || isNaN(n))
	    throw new TypeError('"n" argument must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	function $getMaxListeners(that) {
	  if (that._maxListeners === undefined)
	    return EventEmitter.defaultMaxListeners;
	  return that._maxListeners;
	}

	EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
	  return $getMaxListeners(this);
	};

	// These standalone emit* functions are used to optimize calling of event
	// handlers for fast cases because emit() itself often has a variable number of
	// arguments and can be deoptimized because of that. These functions always have
	// the same number of arguments and thus do not get deoptimized, so the code
	// inside them can execute faster.
	function emitNone(handler, isFn, self) {
	  if (isFn)
	    handler.call(self);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self);
	  }
	}
	function emitOne(handler, isFn, self, arg1) {
	  if (isFn)
	    handler.call(self, arg1);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1);
	  }
	}
	function emitTwo(handler, isFn, self, arg1, arg2) {
	  if (isFn)
	    handler.call(self, arg1, arg2);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1, arg2);
	  }
	}
	function emitThree(handler, isFn, self, arg1, arg2, arg3) {
	  if (isFn)
	    handler.call(self, arg1, arg2, arg3);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1, arg2, arg3);
	  }
	}

	function emitMany(handler, isFn, self, args) {
	  if (isFn)
	    handler.apply(self, args);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].apply(self, args);
	  }
	}

	EventEmitter.prototype.emit = function emit(type) {
	  var er, handler, len, args, i, events, domain;
	  var doError = (type === 'error');

	  events = this._events;
	  if (events)
	    doError = (doError && events.error == null);
	  else if (!doError)
	    return false;

	  domain = this.domain;

	  // If there is no 'error' event listener then throw.
	  if (doError) {
	    er = arguments[1];
	    if (domain) {
	      if (!er)
	        er = new Error('Uncaught, unspecified "error" event');
	      er.domainEmitter = this;
	      er.domain = domain;
	      er.domainThrown = false;
	      domain.emit('error', er);
	    } else if (er instanceof Error) {
	      throw er; // Unhandled 'error' event
	    } else {
	      // At least give some kind of context to the user
	      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	      err.context = er;
	      throw err;
	    }
	    return false;
	  }

	  handler = events[type];

	  if (!handler)
	    return false;

	  var isFn = typeof handler === 'function';
	  len = arguments.length;
	  switch (len) {
	    // fast cases
	    case 1:
	      emitNone(handler, isFn, this);
	      break;
	    case 2:
	      emitOne(handler, isFn, this, arguments[1]);
	      break;
	    case 3:
	      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
	      break;
	    case 4:
	      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
	      break;
	    // slower
	    default:
	      args = new Array(len - 1);
	      for (i = 1; i < len; i++)
	        args[i - 1] = arguments[i];
	      emitMany(handler, isFn, this, args);
	  }

	  return true;
	};

	function _addListener(target, type, listener, prepend) {
	  var m;
	  var events;
	  var existing;

	  if (typeof listener !== 'function')
	    throw new TypeError('"listener" argument must be a function');

	  events = target._events;
	  if (!events) {
	    events = target._events = new EventHandlers();
	    target._eventsCount = 0;
	  } else {
	    // To avoid recursion in the case that type === "newListener"! Before
	    // adding it to the listeners, first emit "newListener".
	    if (events.newListener) {
	      target.emit('newListener', type,
	                  listener.listener ? listener.listener : listener);

	      // Re-assign `events` because a newListener handler could have caused the
	      // this._events to be assigned to a new object
	      events = target._events;
	    }
	    existing = events[type];
	  }

	  if (!existing) {
	    // Optimize the case of one listener. Don't need the extra array object.
	    existing = events[type] = listener;
	    ++target._eventsCount;
	  } else {
	    if (typeof existing === 'function') {
	      // Adding the second element, need to change to array.
	      existing = events[type] = prepend ? [listener, existing] :
	                                          [existing, listener];
	    } else {
	      // If we've already got an array, just append.
	      if (prepend) {
	        existing.unshift(listener);
	      } else {
	        existing.push(listener);
	      }
	    }

	    // Check for listener leak
	    if (!existing.warned) {
	      m = $getMaxListeners(target);
	      if (m && m > 0 && existing.length > m) {
	        existing.warned = true;
	        var w = new Error('Possible EventEmitter memory leak detected. ' +
	                            existing.length + ' ' + type + ' listeners added. ' +
	                            'Use emitter.setMaxListeners() to increase limit');
	        w.name = 'MaxListenersExceededWarning';
	        w.emitter = target;
	        w.type = type;
	        w.count = existing.length;
	        emitWarning(w);
	      }
	    }
	  }

	  return target;
	}
	function emitWarning(e) {
	  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
	}
	EventEmitter.prototype.addListener = function addListener(type, listener) {
	  return _addListener(this, type, listener, false);
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.prependListener =
	    function prependListener(type, listener) {
	      return _addListener(this, type, listener, true);
	    };

	function _onceWrap(target, type, listener) {
	  var fired = false;
	  function g() {
	    target.removeListener(type, g);
	    if (!fired) {
	      fired = true;
	      listener.apply(target, arguments);
	    }
	  }
	  g.listener = listener;
	  return g;
	}

	EventEmitter.prototype.once = function once(type, listener) {
	  if (typeof listener !== 'function')
	    throw new TypeError('"listener" argument must be a function');
	  this.on(type, _onceWrap(this, type, listener));
	  return this;
	};

	EventEmitter.prototype.prependOnceListener =
	    function prependOnceListener(type, listener) {
	      if (typeof listener !== 'function')
	        throw new TypeError('"listener" argument must be a function');
	      this.prependListener(type, _onceWrap(this, type, listener));
	      return this;
	    };

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener =
	    function removeListener(type, listener) {
	      var list, events, position, i, originalListener;

	      if (typeof listener !== 'function')
	        throw new TypeError('"listener" argument must be a function');

	      events = this._events;
	      if (!events)
	        return this;

	      list = events[type];
	      if (!list)
	        return this;

	      if (list === listener || (list.listener && list.listener === listener)) {
	        if (--this._eventsCount === 0)
	          this._events = new EventHandlers();
	        else {
	          delete events[type];
	          if (events.removeListener)
	            this.emit('removeListener', type, list.listener || listener);
	        }
	      } else if (typeof list !== 'function') {
	        position = -1;

	        for (i = list.length; i-- > 0;) {
	          if (list[i] === listener ||
	              (list[i].listener && list[i].listener === listener)) {
	            originalListener = list[i].listener;
	            position = i;
	            break;
	          }
	        }

	        if (position < 0)
	          return this;

	        if (list.length === 1) {
	          list[0] = undefined;
	          if (--this._eventsCount === 0) {
	            this._events = new EventHandlers();
	            return this;
	          } else {
	            delete events[type];
	          }
	        } else {
	          spliceOne(list, position);
	        }

	        if (events.removeListener)
	          this.emit('removeListener', type, originalListener || listener);
	      }

	      return this;
	    };
	    
	// Alias for removeListener added in NodeJS 10.0
	// https://nodejs.org/api/events.html#events_emitter_off_eventname_listener
	EventEmitter.prototype.off = function(type, listener){
	    return this.removeListener(type, listener);
	};

	EventEmitter.prototype.removeAllListeners =
	    function removeAllListeners(type) {
	      var listeners, events;

	      events = this._events;
	      if (!events)
	        return this;

	      // not listening for removeListener, no need to emit
	      if (!events.removeListener) {
	        if (arguments.length === 0) {
	          this._events = new EventHandlers();
	          this._eventsCount = 0;
	        } else if (events[type]) {
	          if (--this._eventsCount === 0)
	            this._events = new EventHandlers();
	          else
	            delete events[type];
	        }
	        return this;
	      }

	      // emit removeListener for all listeners on all events
	      if (arguments.length === 0) {
	        var keys = Object.keys(events);
	        for (var i = 0, key; i < keys.length; ++i) {
	          key = keys[i];
	          if (key === 'removeListener') continue;
	          this.removeAllListeners(key);
	        }
	        this.removeAllListeners('removeListener');
	        this._events = new EventHandlers();
	        this._eventsCount = 0;
	        return this;
	      }

	      listeners = events[type];

	      if (typeof listeners === 'function') {
	        this.removeListener(type, listeners);
	      } else if (listeners) {
	        // LIFO order
	        do {
	          this.removeListener(type, listeners[listeners.length - 1]);
	        } while (listeners[0]);
	      }

	      return this;
	    };

	EventEmitter.prototype.listeners = function listeners(type) {
	  var evlistener;
	  var ret;
	  var events = this._events;

	  if (!events)
	    ret = [];
	  else {
	    evlistener = events[type];
	    if (!evlistener)
	      ret = [];
	    else if (typeof evlistener === 'function')
	      ret = [evlistener.listener || evlistener];
	    else
	      ret = unwrapListeners(evlistener);
	  }

	  return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  if (typeof emitter.listenerCount === 'function') {
	    return emitter.listenerCount(type);
	  } else {
	    return listenerCount$1.call(emitter, type);
	  }
	};

	EventEmitter.prototype.listenerCount = listenerCount$1;
	function listenerCount$1(type) {
	  var events = this._events;

	  if (events) {
	    var evlistener = events[type];

	    if (typeof evlistener === 'function') {
	      return 1;
	    } else if (evlistener) {
	      return evlistener.length;
	    }
	  }

	  return 0;
	}

	EventEmitter.prototype.eventNames = function eventNames() {
	  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
	};

	// About 1.5x faster than the two-arg version of Array#splice().
	function spliceOne(list, index) {
	  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
	    list[i] = list[k];
	  list.pop();
	}

	function arrayClone(arr, i) {
	  var copy = new Array(i);
	  while (i--)
	    copy[i] = arr[i];
	  return copy;
	}

	function unwrapListeners(arr) {
	  var ret = new Array(arr.length);
	  for (var i = 0; i < ret.length; ++i) {
	    ret[i] = arr[i].listener || arr[i];
	  }
	  return ret;
	}

	function BufferList() {
	  this.head = null;
	  this.tail = null;
	  this.length = 0;
	}

	BufferList.prototype.push = function (v) {
	  var entry = { data: v, next: null };
	  if (this.length > 0) this.tail.next = entry;else this.head = entry;
	  this.tail = entry;
	  ++this.length;
	};

	BufferList.prototype.unshift = function (v) {
	  var entry = { data: v, next: this.head };
	  if (this.length === 0) this.tail = entry;
	  this.head = entry;
	  ++this.length;
	};

	BufferList.prototype.shift = function () {
	  if (this.length === 0) return;
	  var ret = this.head.data;
	  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
	  --this.length;
	  return ret;
	};

	BufferList.prototype.clear = function () {
	  this.head = this.tail = null;
	  this.length = 0;
	};

	BufferList.prototype.join = function (s) {
	  if (this.length === 0) return '';
	  var p = this.head;
	  var ret = '' + p.data;
	  while (p = p.next) {
	    ret += s + p.data;
	  }return ret;
	};

	BufferList.prototype.concat = function (n) {
	  if (this.length === 0) return Buffer.alloc(0);
	  if (this.length === 1) return this.head.data;
	  var ret = Buffer.allocUnsafe(n >>> 0);
	  var p = this.head;
	  var i = 0;
	  while (p) {
	    p.data.copy(ret, i);
	    i += p.data.length;
	    p = p.next;
	  }
	  return ret;
	};

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var isBufferEncoding = Buffer.isEncoding
	  || function(encoding) {
	       switch (encoding && encoding.toLowerCase()) {
	         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
	         default: return false;
	       }
	     };


	function assertEncoding(encoding) {
	  if (encoding && !isBufferEncoding(encoding)) {
	    throw new Error('Unknown encoding: ' + encoding);
	  }
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters. CESU-8 is handled as part of the UTF-8 encoding.
	//
	// @TODO Handling all encodings inside a single object makes it very difficult
	// to reason about this code, so it should be split up in the future.
	// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
	// points as used by CESU-8.
	function StringDecoder(encoding) {
	  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
	  assertEncoding(encoding);
	  switch (this.encoding) {
	    case 'utf8':
	      // CESU-8 represents each of Surrogate Pair by 3-bytes
	      this.surrogateSize = 3;
	      break;
	    case 'ucs2':
	    case 'utf16le':
	      // UTF-16 represents each of Surrogate Pair by 2-bytes
	      this.surrogateSize = 2;
	      this.detectIncompleteChar = utf16DetectIncompleteChar;
	      break;
	    case 'base64':
	      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
	      this.surrogateSize = 3;
	      this.detectIncompleteChar = base64DetectIncompleteChar;
	      break;
	    default:
	      this.write = passThroughWrite;
	      return;
	  }

	  // Enough space to store all bytes of a single character. UTF-8 needs 4
	  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
	  this.charBuffer = new Buffer(6);
	  // Number of bytes received for the current incomplete multi-byte character.
	  this.charReceived = 0;
	  // Number of bytes expected for the current incomplete multi-byte character.
	  this.charLength = 0;
	}

	// write decodes the given buffer and returns it as JS string that is
	// guaranteed to not contain any partial multi-byte characters. Any partial
	// character found at the end of the buffer is buffered up, and will be
	// returned when calling write again with the remaining bytes.
	//
	// Note: Converting a Buffer containing an orphan surrogate to a String
	// currently works, but converting a String to a Buffer (via `new Buffer`, or
	// Buffer#write) will replace incomplete surrogates with the unicode
	// replacement character. See https://codereview.chromium.org/121173009/ .
	StringDecoder.prototype.write = function(buffer) {
	  var charStr = '';
	  // if our last write ended with an incomplete multibyte character
	  while (this.charLength) {
	    // determine how many remaining bytes this buffer has to offer for this char
	    var available = (buffer.length >= this.charLength - this.charReceived) ?
	        this.charLength - this.charReceived :
	        buffer.length;

	    // add the new bytes to the char buffer
	    buffer.copy(this.charBuffer, this.charReceived, 0, available);
	    this.charReceived += available;

	    if (this.charReceived < this.charLength) {
	      // still not enough chars in this buffer? wait for more ...
	      return '';
	    }

	    // remove bytes belonging to the current character from the buffer
	    buffer = buffer.slice(available, buffer.length);

	    // get the character that was split
	    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

	    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	    var charCode = charStr.charCodeAt(charStr.length - 1);
	    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	      this.charLength += this.surrogateSize;
	      charStr = '';
	      continue;
	    }
	    this.charReceived = this.charLength = 0;

	    // if there are no more bytes in this buffer, just emit our char
	    if (buffer.length === 0) {
	      return charStr;
	    }
	    break;
	  }

	  // determine and set charLength / charReceived
	  this.detectIncompleteChar(buffer);

	  var end = buffer.length;
	  if (this.charLength) {
	    // buffer the incomplete character bytes we got
	    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
	    end -= this.charReceived;
	  }

	  charStr += buffer.toString(this.encoding, 0, end);

	  var end = charStr.length - 1;
	  var charCode = charStr.charCodeAt(end);
	  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	    var size = this.surrogateSize;
	    this.charLength += size;
	    this.charReceived += size;
	    this.charBuffer.copy(this.charBuffer, size, 0, size);
	    buffer.copy(this.charBuffer, 0, 0, size);
	    return charStr.substring(0, end);
	  }

	  // or just emit the charStr
	  return charStr;
	};

	// detectIncompleteChar determines if there is an incomplete UTF-8 character at
	// the end of the given buffer. If so, it sets this.charLength to the byte
	// length that character, and sets this.charReceived to the number of bytes
	// that are available for this character.
	StringDecoder.prototype.detectIncompleteChar = function(buffer) {
	  // determine how many bytes we have to check at the end of this buffer
	  var i = (buffer.length >= 3) ? 3 : buffer.length;

	  // Figure out if one of the last i bytes of our buffer announces an
	  // incomplete char.
	  for (; i > 0; i--) {
	    var c = buffer[buffer.length - i];

	    // See http://en.wikipedia.org/wiki/UTF-8#Description

	    // 110XXXXX
	    if (i == 1 && c >> 5 == 0x06) {
	      this.charLength = 2;
	      break;
	    }

	    // 1110XXXX
	    if (i <= 2 && c >> 4 == 0x0E) {
	      this.charLength = 3;
	      break;
	    }

	    // 11110XXX
	    if (i <= 3 && c >> 3 == 0x1E) {
	      this.charLength = 4;
	      break;
	    }
	  }
	  this.charReceived = i;
	};

	StringDecoder.prototype.end = function(buffer) {
	  var res = '';
	  if (buffer && buffer.length)
	    res = this.write(buffer);

	  if (this.charReceived) {
	    var cr = this.charReceived;
	    var buf = this.charBuffer;
	    var enc = this.encoding;
	    res += buf.slice(0, cr).toString(enc);
	  }

	  return res;
	};

	function passThroughWrite(buffer) {
	  return buffer.toString(this.encoding);
	}

	function utf16DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 2;
	  this.charLength = this.charReceived ? 2 : 0;
	}

	function base64DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 3;
	  this.charLength = this.charReceived ? 3 : 0;
	}

	Readable.ReadableState = ReadableState;

	var debug = debuglog('stream');
	inherits(Readable, EventEmitter);

	function prependListener(emitter, event, fn) {
	  // Sadly this is not cacheable as some libraries bundle their own
	  // event emitter implementation with them.
	  if (typeof emitter.prependListener === 'function') {
	    return emitter.prependListener(event, fn);
	  } else {
	    // This is a hack to make sure that our error handler is attached before any
	    // userland ones.  NEVER DO THIS. This is here only because this code needs
	    // to continue to work with older versions of Node.js that do not include
	    // the prependListener() method. The goal is to eventually remove this hack.
	    if (!emitter._events || !emitter._events[event])
	      emitter.on(event, fn);
	    else if (Array.isArray(emitter._events[event]))
	      emitter._events[event].unshift(fn);
	    else
	      emitter._events[event] = [fn, emitter._events[event]];
	  }
	}
	function listenerCount (emitter, type) {
	  return emitter.listeners(type).length;
	}
	function ReadableState(options, stream) {

	  options = options || {};

	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

	  // cast to ints.
	  this.highWaterMark = ~ ~this.highWaterMark;

	  // A linked list is used to store data chunks instead of an array because the
	  // linked list can remove elements from the beginning faster than
	  // array.shift()
	  this.buffer = new BufferList();
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;
	  this.resumeScheduled = false;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // when piping, we only care about 'readable' events that happen
	  // after read()ing all the bytes and not getting any pushback.
	  this.ranOut = false;

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}
	function Readable(options) {

	  if (!(this instanceof Readable)) return new Readable(options);

	  this._readableState = new ReadableState(options, this);

	  // legacy
	  this.readable = true;

	  if (options && typeof options.read === 'function') this._read = options.read;

	  EventEmitter.call(this);
	}

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function (chunk, encoding) {
	  var state = this._readableState;

	  if (!state.objectMode && typeof chunk === 'string') {
	    encoding = encoding || state.defaultEncoding;
	    if (encoding !== state.encoding) {
	      chunk = Buffer.from(chunk, encoding);
	      encoding = '';
	    }
	  }

	  return readableAddChunk(this, state, chunk, encoding, false);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function (chunk) {
	  var state = this._readableState;
	  return readableAddChunk(this, state, chunk, '', true);
	};

	Readable.prototype.isPaused = function () {
	  return this._readableState.flowing === false;
	};

	function readableAddChunk(stream, state, chunk, encoding, addToFront) {
	  var er = chunkInvalid(state, chunk);
	  if (er) {
	    stream.emit('error', er);
	  } else if (chunk === null) {
	    state.reading = false;
	    onEofChunk(stream, state);
	  } else if (state.objectMode || chunk && chunk.length > 0) {
	    if (state.ended && !addToFront) {
	      var e = new Error('stream.push() after EOF');
	      stream.emit('error', e);
	    } else if (state.endEmitted && addToFront) {
	      var _e = new Error('stream.unshift() after end event');
	      stream.emit('error', _e);
	    } else {
	      var skipAdd;
	      if (state.decoder && !addToFront && !encoding) {
	        chunk = state.decoder.write(chunk);
	        skipAdd = !state.objectMode && chunk.length === 0;
	      }

	      if (!addToFront) state.reading = false;

	      // Don't add to the buffer if we've decoded to an empty string chunk and
	      // we're not in object mode
	      if (!skipAdd) {
	        // if we want the data now, just emit it.
	        if (state.flowing && state.length === 0 && !state.sync) {
	          stream.emit('data', chunk);
	          stream.read(0);
	        } else {
	          // update the buffer info.
	          state.length += state.objectMode ? 1 : chunk.length;
	          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

	          if (state.needReadable) emitReadable(stream);
	        }
	      }

	      maybeReadMore(stream, state);
	    }
	  } else if (!addToFront) {
	    state.reading = false;
	  }

	  return needMoreData(state);
	}

	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
	  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
	}

	// backwards compatibility.
	Readable.prototype.setEncoding = function (enc) {
	  this._readableState.decoder = new StringDecoder(enc);
	  this._readableState.encoding = enc;
	  return this;
	};

	// Don't raise the hwm > 8MB
	var MAX_HWM = 0x800000;
	function computeNewHighWaterMark(n) {
	  if (n >= MAX_HWM) {
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2 to prevent increasing hwm excessively in
	    // tiny amounts
	    n--;
	    n |= n >>> 1;
	    n |= n >>> 2;
	    n |= n >>> 4;
	    n |= n >>> 8;
	    n |= n >>> 16;
	    n++;
	  }
	  return n;
	}

	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function howMuchToRead(n, state) {
	  if (n <= 0 || state.length === 0 && state.ended) return 0;
	  if (state.objectMode) return 1;
	  if (n !== n) {
	    // Only flow one buffer at a time
	    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
	  }
	  // If we're asking for more than the current hwm, then raise the hwm.
	  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
	  if (n <= state.length) return n;
	  // Don't have enough
	  if (!state.ended) {
	    state.needReadable = true;
	    return 0;
	  }
	  return state.length;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function (n) {
	  debug('read', n);
	  n = parseInt(n, 10);
	  var state = this._readableState;
	  var nOrig = n;

	  if (n !== 0) state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
	    debug('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
	    return null;
	  }

	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0) endReadable(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug('reading or ended', doRead);
	  } else if (doRead) {
	    debug('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0) state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	    // If _read pushed data synchronously, then `reading` will be false,
	    // and we need to re-evaluate how much data we can return to the user.
	    if (!state.reading) n = howMuchToRead(nOrig, state);
	  }

	  var ret;
	  if (n > 0) ret = fromList(n, state);else ret = null;

	  if (ret === null) {
	    state.needReadable = true;
	    n = 0;
	  } else {
	    state.length -= n;
	  }

	  if (state.length === 0) {
	    // If we have nothing in the buffer, then we want to know
	    // as soon as we *do* get something into the buffer.
	    if (!state.ended) state.needReadable = true;

	    // If we tried to read() past the EOF, then emit end on the next tick.
	    if (nOrig !== n && state.ended) endReadable(this);
	  }

	  if (ret !== null) this.emit('data', ret);

	  return ret;
	};

	function chunkInvalid(state, chunk) {
	  var er = null;
	  if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}

	function onEofChunk(stream, state) {
	  if (state.ended) return;
	  if (state.decoder) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // emit 'readable' now to make sure it gets picked up.
	  emitReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    if (state.sync) nextTick(emitReadable_, stream);else emitReadable_(stream);
	  }
	}

	function emitReadable_(stream) {
	  debug('emit readable');
	  stream.emit('readable');
	  flow(stream);
	}

	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    nextTick(maybeReadMore_, stream, state);
	  }
	}

	function maybeReadMore_(stream, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
	    debug('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;else len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function (n) {
	  this.emit('error', new Error('not implemented'));
	};

	Readable.prototype.pipe = function (dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

	  var doEnd = (!pipeOpts || pipeOpts.end !== false);

	  var endFn = doEnd ? onend : cleanup;
	  if (state.endEmitted) nextTick(endFn);else src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable) {
	    debug('onunpipe');
	    if (readable === src) {
	      cleanup();
	    }
	  }

	  function onend() {
	    debug('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);

	  var cleanedUp = false;
	  function cleanup() {
	    debug('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', cleanup);
	    src.removeListener('data', ondata);

	    cleanedUp = true;

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
	  }

	  // If the user pushes more data while we're writing to dest then we'll end up
	  // in ondata again. However, we only want to increase awaitDrain once because
	  // dest will only emit one 'drain' event for the multiple writes.
	  // => Introduce a guard on increasing awaitDrain.
	  var increasedAwaitDrain = false;
	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug('ondata');
	    increasedAwaitDrain = false;
	    var ret = dest.write(chunk);
	    if (false === ret && !increasedAwaitDrain) {
	      // If the user unpiped during `dest.write()`, it is possible
	      // to get stuck in a permanently paused state if that write
	      // also returned false.
	      // => Check whether `dest` is still a piping destination.
	      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
	        debug('false write response, pause', src._readableState.awaitDrain);
	        src._readableState.awaitDrain++;
	        increasedAwaitDrain = true;
	      }
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (listenerCount(dest, 'error') === 0) dest.emit('error', er);
	  }

	  // Make sure our error handler is attached before userland ones.
	  prependListener(dest, 'error', onerror);

	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    debug('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug('pipe resume');
	    src.resume();
	  }

	  return dest;
	};

	function pipeOnDrain(src) {
	  return function () {
	    var state = src._readableState;
	    debug('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain) state.awaitDrain--;
	    if (state.awaitDrain === 0 && src.listeners('data').length) {
	      state.flowing = true;
	      flow(src);
	    }
	  };
	}

	Readable.prototype.unpipe = function (dest) {
	  var state = this._readableState;

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0) return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes) return this;

	    if (!dest) dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest) dest.emit('unpipe', this);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;

	    for (var _i = 0; _i < len; _i++) {
	      dests[_i].emit('unpipe', this);
	    }return this;
	  }

	  // try to find the right one.
	  var i = indexOf(state.pipes, dest);
	  if (i === -1) return this;

	  state.pipes.splice(i, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1) state.pipes = state.pipes[0];

	  dest.emit('unpipe', this);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function (ev, fn) {
	  var res = EventEmitter.prototype.on.call(this, ev, fn);

	  if (ev === 'data') {
	    // Start flowing on next tick if stream isn't explicitly paused
	    if (this._readableState.flowing !== false) this.resume();
	  } else if (ev === 'readable') {
	    var state = this._readableState;
	    if (!state.endEmitted && !state.readableListening) {
	      state.readableListening = state.needReadable = true;
	      state.emittedReadable = false;
	      if (!state.reading) {
	        nextTick(nReadingNextTick, this);
	      } else if (state.length) {
	        emitReadable(this);
	      }
	    }
	  }

	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	function nReadingNextTick(self) {
	  debug('readable nexttick read 0');
	  self.read(0);
	}

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function () {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug('resume');
	    state.flowing = true;
	    resume(this, state);
	  }
	  return this;
	};

	function resume(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    nextTick(resume_, stream, state);
	  }
	}

	function resume_(stream, state) {
	  if (!state.reading) {
	    debug('resume read 0');
	    stream.read(0);
	  }

	  state.resumeScheduled = false;
	  state.awaitDrain = 0;
	  stream.emit('resume');
	  flow(stream);
	  if (state.flowing && !state.reading) stream.read(0);
	}

	Readable.prototype.pause = function () {
	  debug('call pause flowing=%j', this._readableState.flowing);
	  if (false !== this._readableState.flowing) {
	    debug('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  return this;
	};

	function flow(stream) {
	  var state = stream._readableState;
	  debug('flow', state.flowing);
	  while (state.flowing && stream.read() !== null) {}
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function (stream) {
	  var state = this._readableState;
	  var paused = false;

	  var self = this;
	  stream.on('end', function () {
	    debug('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length) self.push(chunk);
	    }

	    self.push(null);
	  });

	  stream.on('data', function (chunk) {
	    debug('wrapped data');
	    if (state.decoder) chunk = state.decoder.write(chunk);

	    // don't skip over falsy values in objectMode
	    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

	    var ret = self.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (this[i] === undefined && typeof stream[i] === 'function') {
	      this[i] = function (method) {
	        return function () {
	          return stream[method].apply(stream, arguments);
	        };
	      }(i);
	    }
	  }

	  // proxy certain important events.
	  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
	  forEach(events, function (ev) {
	    stream.on(ev, self.emit.bind(self, ev));
	  });

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  self._read = function (n) {
	    debug('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return self;
	};

	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromList(n, state) {
	  // nothing buffered
	  if (state.length === 0) return null;

	  var ret;
	  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
	    // read it all, truncate the list
	    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
	    state.buffer.clear();
	  } else {
	    // read part of list
	    ret = fromListPartial(n, state.buffer, state.decoder);
	  }

	  return ret;
	}

	// Extracts only enough buffered data to satisfy the amount requested.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromListPartial(n, list, hasStrings) {
	  var ret;
	  if (n < list.head.data.length) {
	    // slice is the same for buffers and strings
	    ret = list.head.data.slice(0, n);
	    list.head.data = list.head.data.slice(n);
	  } else if (n === list.head.data.length) {
	    // first chunk is a perfect match
	    ret = list.shift();
	  } else {
	    // result spans more than one buffer
	    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
	  }
	  return ret;
	}

	// Copies a specified amount of characters from the list of buffered data
	// chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBufferString(n, list) {
	  var p = list.head;
	  var c = 1;
	  var ret = p.data;
	  n -= ret.length;
	  while (p = p.next) {
	    var str = p.data;
	    var nb = n > str.length ? str.length : n;
	    if (nb === str.length) ret += str;else ret += str.slice(0, n);
	    n -= nb;
	    if (n === 0) {
	      if (nb === str.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = str.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	// Copies a specified amount of bytes from the list of buffered data chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBuffer(n, list) {
	  var ret = Buffer.allocUnsafe(n);
	  var p = list.head;
	  var c = 1;
	  p.data.copy(ret);
	  n -= p.data.length;
	  while (p = p.next) {
	    var buf = p.data;
	    var nb = n > buf.length ? buf.length : n;
	    buf.copy(ret, ret.length - n, 0, nb);
	    n -= nb;
	    if (n === 0) {
	      if (nb === buf.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = buf.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	function endReadable(stream) {
	  var state = stream._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

	  if (!state.endEmitted) {
	    state.ended = true;
	    nextTick(endReadableNT, state, stream);
	  }
	}

	function endReadableNT(state, stream) {
	  // Check that we didn't get one last unshift.
	  if (!state.endEmitted && state.length === 0) {
	    state.endEmitted = true;
	    stream.readable = false;
	    stream.emit('end');
	  }
	}

	function forEach(xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	function indexOf(xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}

	// A bit simpler than readable streams.
	// Implement an async ._write(chunk, encoding, cb), and it'll handle all
	// the drain event emission and buffering.

	Writable.WritableState = WritableState;
	inherits(Writable, EventEmitter);

	function nop() {}

	function WriteReq(chunk, encoding, cb) {
	  this.chunk = chunk;
	  this.encoding = encoding;
	  this.callback = cb;
	  this.next = null;
	}

	function WritableState(options, stream) {
	  Object.defineProperty(this, 'buffer', {
	    get: deprecate(function () {
	      return this.getBuffer();
	    }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
	  });
	  options = options || {};

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

	  // cast to ints.
	  this.highWaterMark = ~ ~this.highWaterMark;

	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function (er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.bufferedRequest = null;
	  this.lastBufferedRequest = null;

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;

	  // count buffered requests
	  this.bufferedRequestCount = 0;

	  // allocate the first CorkedRequest, there is always
	  // one allocated and free to use, and we maintain at most two
	  this.corkedRequestsFree = new CorkedRequest(this);
	}

	WritableState.prototype.getBuffer = function writableStateGetBuffer() {
	  var current = this.bufferedRequest;
	  var out = [];
	  while (current) {
	    out.push(current);
	    current = current.next;
	  }
	  return out;
	};
	function Writable(options) {

	  // Writable ctor is applied to Duplexes, though they're not
	  // instanceof Writable, they're instanceof Readable.
	  if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);

	  this._writableState = new WritableState(options, this);

	  // legacy.
	  this.writable = true;

	  if (options) {
	    if (typeof options.write === 'function') this._write = options.write;

	    if (typeof options.writev === 'function') this._writev = options.writev;
	  }

	  EventEmitter.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function () {
	  this.emit('error', new Error('Cannot pipe, not readable'));
	};

	function writeAfterEnd(stream, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream.emit('error', er);
	  nextTick(cb, er);
	}

	// If we get something that is not a buffer, string, null, or undefined,
	// and we're not in objectMode, then that's an error.
	// Otherwise stream chunks are all considered to be of length=1, and the
	// watermarks determine how many objects to keep in the buffer, rather than
	// how many bytes or characters.
	function validChunk(stream, state, chunk, cb) {
	  var valid = true;
	  var er = false;
	  // Always throw error if a null is written
	  // if we are not in object mode then throw
	  // if it is not a buffer, string, or undefined.
	  if (chunk === null) {
	    er = new TypeError('May not write null values to stream');
	  } else if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  if (er) {
	    stream.emit('error', er);
	    nextTick(cb, er);
	    valid = false;
	  }
	  return valid;
	}

	Writable.prototype.write = function (chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;

	  if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (Buffer.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

	  if (typeof cb !== 'function') cb = nop;

	  if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer(this, state, chunk, encoding, cb);
	  }

	  return ret;
	};

	Writable.prototype.cork = function () {
	  var state = this._writableState;

	  state.corked++;
	};

	Writable.prototype.uncork = function () {
	  var state = this._writableState;

	  if (state.corked) {
	    state.corked--;

	    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
	  }
	};

	Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
	  // node::ParseEncoding() requires lower case.
	  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
	  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
	  this._writableState.defaultEncoding = encoding;
	  return this;
	};

	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
	    chunk = Buffer.from(chunk, encoding);
	  }
	  return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, chunk, encoding, cb) {
	  chunk = decodeChunk(state, chunk, encoding);

	  if (Buffer.isBuffer(chunk)) encoding = 'buffer';
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret) state.needDrain = true;

	  if (state.writing || state.corked) {
	    var last = state.lastBufferedRequest;
	    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
	    if (last) {
	      last.next = state.lastBufferedRequest;
	    } else {
	      state.bufferedRequest = state.lastBufferedRequest;
	    }
	    state.bufferedRequestCount += 1;
	  } else {
	    doWrite(stream, state, false, len, chunk, encoding, cb);
	  }

	  return ret;
	}

	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
	  --state.pendingcb;
	  if (sync) nextTick(cb, er);else cb(er);

	  stream._writableState.errorEmitted = true;
	  stream.emit('error', er);
	}

	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate(state);

	  if (er) onwriteError(stream, state, sync, er, cb);else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(state);

	    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
	      clearBuffer(stream, state);
	    }

	    if (sync) {
	      /*<replacement>*/
	        nextTick(afterWrite, stream, state, finished, cb);
	      /*</replacement>*/
	    } else {
	        afterWrite(stream, state, finished, cb);
	      }
	  }
	}

	function afterWrite(stream, state, finished, cb) {
	  if (!finished) onwriteDrain(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}

	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;
	  var entry = state.bufferedRequest;

	  if (stream._writev && entry && entry.next) {
	    // Fast case, write everything using _writev()
	    var l = state.bufferedRequestCount;
	    var buffer = new Array(l);
	    var holder = state.corkedRequestsFree;
	    holder.entry = entry;

	    var count = 0;
	    while (entry) {
	      buffer[count] = entry;
	      entry = entry.next;
	      count += 1;
	    }

	    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

	    // doWrite is almost always async, defer these to save a bit of time
	    // as the hot path ends with doWrite
	    state.pendingcb++;
	    state.lastBufferedRequest = null;
	    if (holder.next) {
	      state.corkedRequestsFree = holder.next;
	      holder.next = null;
	    } else {
	      state.corkedRequestsFree = new CorkedRequest(state);
	    }
	  } else {
	    // Slow case, write chunks one-by-one
	    while (entry) {
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;

	      doWrite(stream, state, false, len, chunk, encoding, cb);
	      entry = entry.next;
	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        break;
	      }
	    }

	    if (entry === null) state.lastBufferedRequest = null;
	  }

	  state.bufferedRequestCount = 0;
	  state.bufferedRequest = entry;
	  state.bufferProcessing = false;
	}

	Writable.prototype._write = function (chunk, encoding, cb) {
	  cb(new Error('not implemented'));
	};

	Writable.prototype._writev = null;

	Writable.prototype.end = function (chunk, encoding, cb) {
	  var state = this._writableState;

	  if (typeof chunk === 'function') {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending && !state.finished) endWritable(this, state, cb);
	};

	function needFinish(state) {
	  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
	}

	function prefinish(stream, state) {
	  if (!state.prefinished) {
	    state.prefinished = true;
	    stream.emit('prefinish');
	  }
	}

	function finishMaybe(stream, state) {
	  var need = needFinish(state);
	  if (need) {
	    if (state.pendingcb === 0) {
	      prefinish(stream, state);
	      state.finished = true;
	      stream.emit('finish');
	    } else {
	      prefinish(stream, state);
	    }
	  }
	  return need;
	}

	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished) nextTick(cb);else stream.once('finish', cb);
	  }
	  state.ended = true;
	  stream.writable = false;
	}

	// It seems a linked list but it is not
	// there will be only 2 of these for each stream
	function CorkedRequest(state) {
	  var _this = this;

	  this.next = null;
	  this.entry = null;

	  this.finish = function (err) {
	    var entry = _this.entry;
	    _this.entry = null;
	    while (entry) {
	      var cb = entry.callback;
	      state.pendingcb--;
	      cb(err);
	      entry = entry.next;
	    }
	    if (state.corkedRequestsFree) {
	      state.corkedRequestsFree.next = _this;
	    } else {
	      state.corkedRequestsFree = _this;
	    }
	  };
	}

	inherits(Duplex, Readable);

	var keys = Object.keys(Writable.prototype);
	for (var v = 0; v < keys.length; v++) {
	  var method = keys[v];
	  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
	}
	function Duplex(options) {
	  if (!(this instanceof Duplex)) return new Duplex(options);

	  Readable.call(this, options);
	  Writable.call(this, options);

	  if (options && options.readable === false) this.readable = false;

	  if (options && options.writable === false) this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

	  this.once('end', onend);
	}

	// the no-half-open enforcer
	function onend() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended) return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  nextTick(onEndNT, this);
	}

	function onEndNT(self) {
	  self.end();
	}

	// a transform stream is a readable/writable stream where you do
	// something with the data.  Sometimes it's called a "filter",
	// but that's not a great name for it, since that implies a thing where
	// some bits pass through, and others are simply ignored.  (That would
	// be a valid example of a transform, of course.)
	//
	// While the output is causally related to the input, it's not a
	// necessarily symmetric or synchronous transformation.  For example,
	// a zlib stream might take multiple plain-text writes(), and then
	// emit a single compressed chunk some time in the future.
	//
	// Here's how this works:
	//
	// The Transform stream has all the aspects of the readable and writable
	// stream classes.  When you write(chunk), that calls _write(chunk,cb)
	// internally, and returns false if there's a lot of pending writes
	// buffered up.  When you call read(), that calls _read(n) until
	// there's enough pending readable data buffered up.
	//
	// In a transform stream, the written data is placed in a buffer.  When
	// _read(n) is called, it transforms the queued up data, calling the
	// buffered _write cb's as it consumes chunks.  If consuming a single
	// written chunk would result in multiple output chunks, then the first
	// outputted bit calls the readcb, and subsequent chunks just go into
	// the read buffer, and will cause it to emit 'readable' if necessary.
	//
	// This way, back-pressure is actually determined by the reading side,
	// since _read has to be called to start processing a new chunk.  However,
	// a pathological inflate type of transform can cause excessive buffering
	// here.  For example, imagine a stream where every byte of input is
	// interpreted as an integer from 0-255, and then results in that many
	// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
	// 1kb of data being output.  In this case, you could write a very small
	// amount of input, and end up with a very large amount of output.  In
	// such a pathological inflating mechanism, there'd be no way to tell
	// the system to stop doing the transform.  A single 4MB write could
	// cause the system to run out of memory.
	//
	// However, even in such a pathological case, only a single written chunk
	// would be consumed, and then the rest would wait (un-transformed) until
	// the results of the previous transformed chunk were consumed.

	inherits(Transform, Duplex);

	function TransformState(stream) {
	  this.afterTransform = function (er, data) {
	    return afterTransform(stream, er, data);
	  };

	  this.needTransform = false;
	  this.transforming = false;
	  this.writecb = null;
	  this.writechunk = null;
	  this.writeencoding = null;
	}

	function afterTransform(stream, er, data) {
	  var ts = stream._transformState;
	  ts.transforming = false;

	  var cb = ts.writecb;

	  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

	  ts.writechunk = null;
	  ts.writecb = null;

	  if (data !== null && data !== undefined) stream.push(data);

	  cb(er);

	  var rs = stream._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    stream._read(rs.highWaterMark);
	  }
	}
	function Transform(options) {
	  if (!(this instanceof Transform)) return new Transform(options);

	  Duplex.call(this, options);

	  this._transformState = new TransformState(this);

	  // when the writable side finishes, then flush out anything remaining.
	  var stream = this;

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;

	  if (options) {
	    if (typeof options.transform === 'function') this._transform = options.transform;

	    if (typeof options.flush === 'function') this._flush = options.flush;
	  }

	  this.once('prefinish', function () {
	    if (typeof this._flush === 'function') this._flush(function (er) {
	      done(stream, er);
	    });else done(stream);
	  });
	}

	Transform.prototype.push = function (chunk, encoding) {
	  this._transformState.needTransform = false;
	  return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function (chunk, encoding, cb) {
	  throw new Error('Not implemented');
	};

	Transform.prototype._write = function (chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function (n) {
	  var ts = this._transformState;

	  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};

	function done(stream, er) {
	  if (er) return stream.emit('error', er);

	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  var ws = stream._writableState;
	  var ts = stream._transformState;

	  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

	  if (ts.transforming) throw new Error('Calling transform done when still transforming');

	  return stream.push(null);
	}

	inherits(PassThrough, Transform);
	function PassThrough(options) {
	  if (!(this instanceof PassThrough)) return new PassThrough(options);

	  Transform.call(this, options);
	}

	PassThrough.prototype._transform = function (chunk, encoding, cb) {
	  cb(null, chunk);
	};

	inherits(Stream, EventEmitter);
	Stream.Readable = Readable;
	Stream.Writable = Writable;
	Stream.Duplex = Duplex;
	Stream.Transform = Transform;
	Stream.PassThrough = PassThrough;

	// Backwards-compat with node 0.4.x
	Stream.Stream = Stream;

	// old-style streams.  Note that the pipe method (the only relevant
	// part of this class) is overridden in the Readable class.

	function Stream() {
	  EventEmitter.call(this);
	}

	Stream.prototype.pipe = function(dest, options) {
	  var source = this;

	  function ondata(chunk) {
	    if (dest.writable) {
	      if (false === dest.write(chunk) && source.pause) {
	        source.pause();
	      }
	    }
	  }

	  source.on('data', ondata);

	  function ondrain() {
	    if (source.readable && source.resume) {
	      source.resume();
	    }
	  }

	  dest.on('drain', ondrain);

	  // If the 'end' option is not supplied, dest.end() will be called when
	  // source gets the 'end' or 'close' events.  Only dest.end() once.
	  if (!dest._isStdio && (!options || options.end !== false)) {
	    source.on('end', onend);
	    source.on('close', onclose);
	  }

	  var didOnEnd = false;
	  function onend() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    dest.end();
	  }


	  function onclose() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    if (typeof dest.destroy === 'function') dest.destroy();
	  }

	  // don't leave dangling pipes when there are errors.
	  function onerror(er) {
	    cleanup();
	    if (EventEmitter.listenerCount(this, 'error') === 0) {
	      throw er; // Unhandled stream error in pipe.
	    }
	  }

	  source.on('error', onerror);
	  dest.on('error', onerror);

	  // remove all the event listeners that were added.
	  function cleanup() {
	    source.removeListener('data', ondata);
	    dest.removeListener('drain', ondrain);

	    source.removeListener('end', onend);
	    source.removeListener('close', onclose);

	    source.removeListener('error', onerror);
	    dest.removeListener('error', onerror);

	    source.removeListener('end', cleanup);
	    source.removeListener('close', cleanup);

	    dest.removeListener('close', cleanup);
	  }

	  source.on('end', cleanup);
	  source.on('close', cleanup);

	  dest.on('close', cleanup);

	  dest.emit('pipe', source);

	  // Allow for unix-like usage: A.pipe(B).pipe(C)
	  return dest;
	};

	var _polyfillNode_stream = /*#__PURE__*/Object.freeze({
		__proto__: null,
		Duplex: Duplex,
		PassThrough: PassThrough,
		Readable: Readable,
		Stream: Stream,
		Transform: Transform,
		Writable: Writable,
		default: Stream
	});

	var require$$7 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_stream);

	var delayed_stream;
	var hasRequiredDelayed_stream;

	function requireDelayed_stream () {
		if (hasRequiredDelayed_stream) return delayed_stream;
		hasRequiredDelayed_stream = 1;
		var Stream = require$$7.Stream;
		var util = require$$1;

		delayed_stream = DelayedStream;
		function DelayedStream() {
		  this.source = null;
		  this.dataSize = 0;
		  this.maxDataSize = 1024 * 1024;
		  this.pauseStream = true;

		  this._maxDataSizeExceeded = false;
		  this._released = false;
		  this._bufferedEvents = [];
		}
		util.inherits(DelayedStream, Stream);

		DelayedStream.create = function(source, options) {
		  var delayedStream = new this();

		  options = options || {};
		  for (var option in options) {
		    delayedStream[option] = options[option];
		  }

		  delayedStream.source = source;

		  var realEmit = source.emit;
		  source.emit = function() {
		    delayedStream._handleEmit(arguments);
		    return realEmit.apply(source, arguments);
		  };

		  source.on('error', function() {});
		  if (delayedStream.pauseStream) {
		    source.pause();
		  }

		  return delayedStream;
		};

		Object.defineProperty(DelayedStream.prototype, 'readable', {
		  configurable: true,
		  enumerable: true,
		  get: function() {
		    return this.source.readable;
		  }
		});

		DelayedStream.prototype.setEncoding = function() {
		  return this.source.setEncoding.apply(this.source, arguments);
		};

		DelayedStream.prototype.resume = function() {
		  if (!this._released) {
		    this.release();
		  }

		  this.source.resume();
		};

		DelayedStream.prototype.pause = function() {
		  this.source.pause();
		};

		DelayedStream.prototype.release = function() {
		  this._released = true;

		  this._bufferedEvents.forEach(function(args) {
		    this.emit.apply(this, args);
		  }.bind(this));
		  this._bufferedEvents = [];
		};

		DelayedStream.prototype.pipe = function() {
		  var r = Stream.prototype.pipe.apply(this, arguments);
		  this.resume();
		  return r;
		};

		DelayedStream.prototype._handleEmit = function(args) {
		  if (this._released) {
		    this.emit.apply(this, args);
		    return;
		  }

		  if (args[0] === 'data') {
		    this.dataSize += args[1].length;
		    this._checkIfMaxDataSizeExceeded();
		  }

		  this._bufferedEvents.push(args);
		};

		DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
		  if (this._maxDataSizeExceeded) {
		    return;
		  }

		  if (this.dataSize <= this.maxDataSize) {
		    return;
		  }

		  this._maxDataSizeExceeded = true;
		  var message =
		    'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
		  this.emit('error', new Error(message));
		};
		return delayed_stream;
	}

	var combined_stream;
	var hasRequiredCombined_stream;

	function requireCombined_stream () {
		if (hasRequiredCombined_stream) return combined_stream;
		hasRequiredCombined_stream = 1;
		var util = require$$1;
		var Stream = require$$7.Stream;
		var DelayedStream = requireDelayed_stream();

		combined_stream = CombinedStream;
		function CombinedStream() {
		  this.writable = false;
		  this.readable = true;
		  this.dataSize = 0;
		  this.maxDataSize = 2 * 1024 * 1024;
		  this.pauseStreams = true;

		  this._released = false;
		  this._streams = [];
		  this._currentStream = null;
		  this._insideLoop = false;
		  this._pendingNext = false;
		}
		util.inherits(CombinedStream, Stream);

		CombinedStream.create = function(options) {
		  var combinedStream = new this();

		  options = options || {};
		  for (var option in options) {
		    combinedStream[option] = options[option];
		  }

		  return combinedStream;
		};

		CombinedStream.isStreamLike = function(stream) {
		  return (typeof stream !== 'function')
		    && (typeof stream !== 'string')
		    && (typeof stream !== 'boolean')
		    && (typeof stream !== 'number')
		    && (!Buffer.isBuffer(stream));
		};

		CombinedStream.prototype.append = function(stream) {
		  var isStreamLike = CombinedStream.isStreamLike(stream);

		  if (isStreamLike) {
		    if (!(stream instanceof DelayedStream)) {
		      var newStream = DelayedStream.create(stream, {
		        maxDataSize: Infinity,
		        pauseStream: this.pauseStreams,
		      });
		      stream.on('data', this._checkDataSize.bind(this));
		      stream = newStream;
		    }

		    this._handleErrors(stream);

		    if (this.pauseStreams) {
		      stream.pause();
		    }
		  }

		  this._streams.push(stream);
		  return this;
		};

		CombinedStream.prototype.pipe = function(dest, options) {
		  Stream.prototype.pipe.call(this, dest, options);
		  this.resume();
		  return dest;
		};

		CombinedStream.prototype._getNext = function() {
		  this._currentStream = null;

		  if (this._insideLoop) {
		    this._pendingNext = true;
		    return; // defer call
		  }

		  this._insideLoop = true;
		  try {
		    do {
		      this._pendingNext = false;
		      this._realGetNext();
		    } while (this._pendingNext);
		  } finally {
		    this._insideLoop = false;
		  }
		};

		CombinedStream.prototype._realGetNext = function() {
		  var stream = this._streams.shift();


		  if (typeof stream == 'undefined') {
		    this.end();
		    return;
		  }

		  if (typeof stream !== 'function') {
		    this._pipeNext(stream);
		    return;
		  }

		  var getStream = stream;
		  getStream(function(stream) {
		    var isStreamLike = CombinedStream.isStreamLike(stream);
		    if (isStreamLike) {
		      stream.on('data', this._checkDataSize.bind(this));
		      this._handleErrors(stream);
		    }

		    this._pipeNext(stream);
		  }.bind(this));
		};

		CombinedStream.prototype._pipeNext = function(stream) {
		  this._currentStream = stream;

		  var isStreamLike = CombinedStream.isStreamLike(stream);
		  if (isStreamLike) {
		    stream.on('end', this._getNext.bind(this));
		    stream.pipe(this, {end: false});
		    return;
		  }

		  var value = stream;
		  this.write(value);
		  this._getNext();
		};

		CombinedStream.prototype._handleErrors = function(stream) {
		  var self = this;
		  stream.on('error', function(err) {
		    self._emitError(err);
		  });
		};

		CombinedStream.prototype.write = function(data) {
		  this.emit('data', data);
		};

		CombinedStream.prototype.pause = function() {
		  if (!this.pauseStreams) {
		    return;
		  }

		  if(this.pauseStreams && this._currentStream && typeof(this._currentStream.pause) == 'function') this._currentStream.pause();
		  this.emit('pause');
		};

		CombinedStream.prototype.resume = function() {
		  if (!this._released) {
		    this._released = true;
		    this.writable = true;
		    this._getNext();
		  }

		  if(this.pauseStreams && this._currentStream && typeof(this._currentStream.resume) == 'function') this._currentStream.resume();
		  this.emit('resume');
		};

		CombinedStream.prototype.end = function() {
		  this._reset();
		  this.emit('end');
		};

		CombinedStream.prototype.destroy = function() {
		  this._reset();
		  this.emit('close');
		};

		CombinedStream.prototype._reset = function() {
		  this.writable = false;
		  this._streams = [];
		  this._currentStream = null;
		};

		CombinedStream.prototype._checkDataSize = function() {
		  this._updateDataSize();
		  if (this.dataSize <= this.maxDataSize) {
		    return;
		  }

		  var message =
		    'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
		  this._emitError(new Error(message));
		};

		CombinedStream.prototype._updateDataSize = function() {
		  this.dataSize = 0;

		  var self = this;
		  this._streams.forEach(function(stream) {
		    if (!stream.dataSize) {
		      return;
		    }

		    self.dataSize += stream.dataSize;
		  });

		  if (this._currentStream && this._currentStream.dataSize) {
		    this.dataSize += this._currentStream.dataSize;
		  }
		};

		CombinedStream.prototype._emitError = function(err) {
		  this._reset();
		  this.emit('error', err);
		};
		return combined_stream;
	}

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }

	  return parts;
	}

	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe =
	    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};

	// path.resolve([from ...], to)
	// posix version
	function resolve() {
	  var resolvedPath = '',
	      resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = (i >= 0) ? arguments[i] : '/';

	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }

	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }

	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)

	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');

	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	}
	// path.normalize(path)
	// posix version
	function normalize(path) {
	  var isPathAbsolute = isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';

	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function(p) {
	    return !!p;
	  }), !isPathAbsolute).join('/');

	  if (!path && !isPathAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }

	  return (isPathAbsolute ? '/' : '') + path;
	}
	// posix version
	function isAbsolute(path) {
	  return path.charAt(0) === '/';
	}

	// posix version
	function join() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return normalize(filter(paths, function(p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	}


	// path.relative(from, to)
	// posix version
	function relative(from, to) {
	  from = resolve(from).substr(1);
	  to = resolve(to).substr(1);

	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }

	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }

	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }

	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));

	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }

	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }

	  outputParts = outputParts.concat(toParts.slice(samePartsLength));

	  return outputParts.join('/');
	}

	var sep = '/';
	var delimiter$1 = ':';

	function dirname(path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];

	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }

	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }

	  return root + dir;
	}

	function basename(path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	}


	function extname(path) {
	  return splitPath(path)[3];
	}
	var _polyfillNode_path = {
	  extname: extname,
	  basename: basename,
	  dirname: dirname,
	  sep: sep,
	  delimiter: delimiter$1,
	  relative: relative,
	  join: join,
	  isAbsolute: isAbsolute,
	  normalize: normalize,
	  resolve: resolve
	};
	function filter (xs, f) {
	    if (xs.filter) return xs.filter(f);
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        if (f(xs[i], i, xs)) res.push(xs[i]);
	    }
	    return res;
	}

	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b' ?
	    function (str, start, len) { return str.substr(start, len) } :
	    function (str, start, len) {
	        if (start < 0) start = str.length + start;
	        return str.substr(start, len);
	    }
	;

	var _polyfillNode_path$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		basename: basename,
		default: _polyfillNode_path,
		delimiter: delimiter$1,
		dirname: dirname,
		extname: extname,
		isAbsolute: isAbsolute,
		join: join,
		normalize: normalize,
		relative: relative,
		resolve: resolve,
		sep: sep
	});

	var require$$2 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_path$1);

	var hasFetch = isFunction(global$1.fetch) && isFunction(global$1.ReadableStream);

	var _blobConstructor;
	function blobConstructor() {
	  if (typeof _blobConstructor !== 'undefined') {
	    return _blobConstructor;
	  }
	  try {
	    new global$1.Blob([new ArrayBuffer(1)]);
	    _blobConstructor = true;
	  } catch (e) {
	    _blobConstructor = false;
	  }
	  return _blobConstructor
	}
	var xhr;

	function checkTypeSupport(type) {
	  if (!xhr) {
	    xhr = new global$1.XMLHttpRequest();
	    // If location.host is empty, e.g. if this page/worker was loaded
	    // from a Blob, then use example.com to avoid an error
	    xhr.open('GET', global$1.location.host ? '/' : 'https://example.com');
	  }
	  try {
	    xhr.responseType = type;
	    return xhr.responseType === type
	  } catch (e) {
	    return false
	  }

	}

	// For some strange reason, Safari 7.0 reports typeof global.ArrayBuffer === 'object'.
	// Safari 7.1 appears to have fixed this bug.
	var haveArrayBuffer = typeof global$1.ArrayBuffer !== 'undefined';
	var haveSlice = haveArrayBuffer && isFunction(global$1.ArrayBuffer.prototype.slice);

	var arraybuffer = haveArrayBuffer && checkTypeSupport('arraybuffer');
	  // These next two tests unavoidably show warnings in Chrome. Since fetch will always
	  // be used if it's available, just return false for these to avoid the warnings.
	var msstream = !hasFetch && haveSlice && checkTypeSupport('ms-stream');
	var mozchunkedarraybuffer = !hasFetch && haveArrayBuffer &&
	  checkTypeSupport('moz-chunked-arraybuffer');
	var overrideMimeType = isFunction(xhr.overrideMimeType);
	var vbArray = isFunction(global$1.VBArray);

	function isFunction(value) {
	  return typeof value === 'function'
	}

	xhr = null; // Help gc

	var rStates = {
	  LOADING: 3,
	  DONE: 4
	};
	function IncomingMessage(xhr, response, mode) {
	  var self = this;
	  Readable.call(self);

	  self._mode = mode;
	  self.headers = {};
	  self.rawHeaders = [];
	  self.trailers = {};
	  self.rawTrailers = [];

	  // Fake the 'close' event, but only once 'end' fires
	  self.on('end', function() {
	    // The nextTick is necessary to prevent the 'request' module from causing an infinite loop
	    browser$1.nextTick(function() {
	      self.emit('close');
	    });
	  });
	  var read;
	  if (mode === 'fetch') {
	    self._fetchResponse = response;

	    self.url = response.url;
	    self.statusCode = response.status;
	    self.statusMessage = response.statusText;
	      // backwards compatible version of for (<item> of <iterable>):
	      // for (var <item>,_i,_it = <iterable>[Symbol.iterator](); <item> = (_i = _it.next()).value,!_i.done;)
	    for (var header, _i, _it = response.headers[Symbol.iterator](); header = (_i = _it.next()).value, !_i.done;) {
	      self.headers[header[0].toLowerCase()] = header[1];
	      self.rawHeaders.push(header[0], header[1]);
	    }

	    // TODO: this doesn't respect backpressure. Once WritableStream is available, this can be fixed
	    var reader = response.body.getReader();

	    read = function () {
	      reader.read().then(function(result) {
	        if (self._destroyed)
	          return
	        if (result.done) {
	          self.push(null);
	          return
	        }
	        self.push(new Buffer(result.value));
	        read();
	      });
	    };
	    read();

	  } else {
	    self._xhr = xhr;
	    self._pos = 0;

	    self.url = xhr.responseURL;
	    self.statusCode = xhr.status;
	    self.statusMessage = xhr.statusText;
	    var headers = xhr.getAllResponseHeaders().split(/\r?\n/);
	    headers.forEach(function(header) {
	      var matches = header.match(/^([^:]+):\s*(.*)/);
	      if (matches) {
	        var key = matches[1].toLowerCase();
	        if (key === 'set-cookie') {
	          if (self.headers[key] === undefined) {
	            self.headers[key] = [];
	          }
	          self.headers[key].push(matches[2]);
	        } else if (self.headers[key] !== undefined) {
	          self.headers[key] += ', ' + matches[2];
	        } else {
	          self.headers[key] = matches[2];
	        }
	        self.rawHeaders.push(matches[1], matches[2]);
	      }
	    });

	    self._charset = 'x-user-defined';
	    if (!overrideMimeType) {
	      var mimeType = self.rawHeaders['mime-type'];
	      if (mimeType) {
	        var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/);
	        if (charsetMatch) {
	          self._charset = charsetMatch[1].toLowerCase();
	        }
	      }
	      if (!self._charset)
	        self._charset = 'utf-8'; // best guess
	    }
	  }
	}

	inherits(IncomingMessage, Readable);

	IncomingMessage.prototype._read = function() {};

	IncomingMessage.prototype._onXHRProgress = function() {
	  var self = this;

	  var xhr = self._xhr;

	  var response = null;
	  switch (self._mode) {
	  case 'text:vbarray': // For IE9
	    if (xhr.readyState !== rStates.DONE)
	      break
	    try {
	      // This fails in IE8
	      response = new global$1.VBArray(xhr.responseBody).toArray();
	    } catch (e) {
	      // pass
	    }
	    if (response !== null) {
	      self.push(new Buffer(response));
	      break
	    }
	    // Falls through in IE8
	  case 'text':
	    try { // This will fail when readyState = 3 in IE9. Switch mode and wait for readyState = 4
	      response = xhr.responseText;
	    } catch (e) {
	      self._mode = 'text:vbarray';
	      break
	    }
	    if (response.length > self._pos) {
	      var newData = response.substr(self._pos);
	      if (self._charset === 'x-user-defined') {
	        var buffer = new Buffer(newData.length);
	        for (var i = 0; i < newData.length; i++)
	          buffer[i] = newData.charCodeAt(i) & 0xff;

	        self.push(buffer);
	      } else {
	        self.push(newData, self._charset);
	      }
	      self._pos = response.length;
	    }
	    break
	  case 'arraybuffer':
	    if (xhr.readyState !== rStates.DONE || !xhr.response)
	      break
	    response = xhr.response;
	    self.push(new Buffer(new Uint8Array(response)));
	    break
	  case 'moz-chunked-arraybuffer': // take whole
	    response = xhr.response;
	    if (xhr.readyState !== rStates.LOADING || !response)
	      break
	    self.push(new Buffer(new Uint8Array(response)));
	    break
	  case 'ms-stream':
	    response = xhr.response;
	    if (xhr.readyState !== rStates.LOADING)
	      break
	    var reader = new global$1.MSStreamReader();
	    reader.onprogress = function() {
	      if (reader.result.byteLength > self._pos) {
	        self.push(new Buffer(new Uint8Array(reader.result.slice(self._pos))));
	        self._pos = reader.result.byteLength;
	      }
	    };
	    reader.onload = function() {
	      self.push(null);
	    };
	      // reader.onerror = ??? // TODO: this
	    reader.readAsArrayBuffer(response);
	    break
	  }

	  // The ms-stream case handles end separately in reader.onload()
	  if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
	    self.push(null);
	  }
	};

	// from https://github.com/jhiesey/to-arraybuffer/blob/6502d9850e70ba7935a7df4ad86b358fc216f9f0/index.js

	function toArrayBuffer (buf) {
	  // If the buffer is backed by a Uint8Array, a faster version will work
	  if (buf instanceof Uint8Array) {
	    // If the buffer isn't a subarray, return the underlying ArrayBuffer
	    if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
	      return buf.buffer
	    } else if (typeof buf.buffer.slice === 'function') {
	      // Otherwise we need to get a proper copy
	      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
	    }
	  }

	  if (isBuffer$1(buf)) {
	    // This is the slow version that will work with any Buffer
	    // implementation (even in old browsers)
	    var arrayCopy = new Uint8Array(buf.length);
	    var len = buf.length;
	    for (var i = 0; i < len; i++) {
	      arrayCopy[i] = buf[i];
	    }
	    return arrayCopy.buffer
	  } else {
	    throw new Error('Argument must be a Buffer')
	  }
	}

	function decideMode(preferBinary, useFetch) {
	  if (hasFetch && useFetch) {
	    return 'fetch'
	  } else if (mozchunkedarraybuffer) {
	    return 'moz-chunked-arraybuffer'
	  } else if (msstream) {
	    return 'ms-stream'
	  } else if (arraybuffer && preferBinary) {
	    return 'arraybuffer'
	  } else if (vbArray && preferBinary) {
	    return 'text:vbarray'
	  } else {
	    return 'text'
	  }
	}

	function ClientRequest(opts) {
	  var self = this;
	  Writable.call(self);

	  self._opts = opts;
	  self._body = [];
	  self._headers = {};
	  if (opts.auth)
	    self.setHeader('Authorization', 'Basic ' + new Buffer(opts.auth).toString('base64'));
	  Object.keys(opts.headers).forEach(function(name) {
	    self.setHeader(name, opts.headers[name]);
	  });

	  var preferBinary;
	  var useFetch = true;
	  if (opts.mode === 'disable-fetch') {
	    // If the use of XHR should be preferred and includes preserving the 'content-type' header
	    useFetch = false;
	    preferBinary = true;
	  } else if (opts.mode === 'prefer-streaming') {
	    // If streaming is a high priority but binary compatibility and
	    // the accuracy of the 'content-type' header aren't
	    preferBinary = false;
	  } else if (opts.mode === 'allow-wrong-content-type') {
	    // If streaming is more important than preserving the 'content-type' header
	    preferBinary = !overrideMimeType;
	  } else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
	    // Use binary if text streaming may corrupt data or the content-type header, or for speed
	    preferBinary = true;
	  } else {
	    throw new Error('Invalid value for opts.mode')
	  }
	  self._mode = decideMode(preferBinary, useFetch);

	  self.on('finish', function() {
	    self._onFinish();
	  });
	}

	inherits(ClientRequest, Writable);
	// Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method
	var unsafeHeaders = [
	  'accept-charset',
	  'accept-encoding',
	  'access-control-request-headers',
	  'access-control-request-method',
	  'connection',
	  'content-length',
	  'cookie',
	  'cookie2',
	  'date',
	  'dnt',
	  'expect',
	  'host',
	  'keep-alive',
	  'origin',
	  'referer',
	  'te',
	  'trailer',
	  'transfer-encoding',
	  'upgrade',
	  'user-agent',
	  'via'
	];
	ClientRequest.prototype.setHeader = function(name, value) {
	  var self = this;
	  var lowerName = name.toLowerCase();
	    // This check is not necessary, but it prevents warnings from browsers about setting unsafe
	    // headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but
	    // http-browserify did it, so I will too.
	  if (unsafeHeaders.indexOf(lowerName) !== -1)
	    return

	  self._headers[lowerName] = {
	    name: name,
	    value: value
	  };
	};

	ClientRequest.prototype.getHeader = function(name) {
	  var self = this;
	  return self._headers[name.toLowerCase()].value
	};

	ClientRequest.prototype.removeHeader = function(name) {
	  var self = this;
	  delete self._headers[name.toLowerCase()];
	};

	ClientRequest.prototype._onFinish = function() {
	  var self = this;

	  if (self._destroyed)
	    return
	  var opts = self._opts;

	  var headersObj = self._headers;
	  var body;
	  if (opts.method === 'POST' || opts.method === 'PUT' || opts.method === 'PATCH') {
	    if (blobConstructor()) {
	      body = new global$1.Blob(self._body.map(function(buffer) {
	        return toArrayBuffer(buffer)
	      }), {
	        type: (headersObj['content-type'] || {}).value || ''
	      });
	    } else {
	      // get utf8 string
	      body = Buffer.concat(self._body).toString();
	    }
	  }

	  if (self._mode === 'fetch') {
	    var headers = Object.keys(headersObj).map(function(name) {
	      return [headersObj[name].name, headersObj[name].value]
	    });

	    global$1.fetch(self._opts.url, {
	      method: self._opts.method,
	      headers: headers,
	      body: body,
	      mode: 'cors',
	      credentials: opts.withCredentials ? 'include' : 'same-origin'
	    }).then(function(response) {
	      self._fetchResponse = response;
	      self._connect();
	    }, function(reason) {
	      self.emit('error', reason);
	    });
	  } else {
	    var xhr = self._xhr = new global$1.XMLHttpRequest();
	    try {
	      xhr.open(self._opts.method, self._opts.url, true);
	    } catch (err) {
	      browser$1.nextTick(function() {
	        self.emit('error', err);
	      });
	      return
	    }

	    // Can't set responseType on really old browsers
	    if ('responseType' in xhr)
	      xhr.responseType = self._mode.split(':')[0];

	    if ('withCredentials' in xhr)
	      xhr.withCredentials = !!opts.withCredentials;

	    if (self._mode === 'text' && 'overrideMimeType' in xhr)
	      xhr.overrideMimeType('text/plain; charset=x-user-defined');

	    Object.keys(headersObj).forEach(function(name) {
	      xhr.setRequestHeader(headersObj[name].name, headersObj[name].value);
	    });

	    self._response = null;
	    xhr.onreadystatechange = function() {
	      switch (xhr.readyState) {
	      case rStates.LOADING:
	      case rStates.DONE:
	        self._onXHRProgress();
	        break
	      }
	    };
	      // Necessary for streaming in Firefox, since xhr.response is ONLY defined
	      // in onprogress, not in onreadystatechange with xhr.readyState = 3
	    if (self._mode === 'moz-chunked-arraybuffer') {
	      xhr.onprogress = function() {
	        self._onXHRProgress();
	      };
	    }

	    xhr.onerror = function() {
	      if (self._destroyed)
	        return
	      self.emit('error', new Error('XHR error'));
	    };

	    try {
	      xhr.send(body);
	    } catch (err) {
	      browser$1.nextTick(function() {
	        self.emit('error', err);
	      });
	      return
	    }
	  }
	};

	/**
	 * Checks if xhr.status is readable and non-zero, indicating no error.
	 * Even though the spec says it should be available in readyState 3,
	 * accessing it throws an exception in IE8
	 */
	function statusValid(xhr) {
	  try {
	    var status = xhr.status;
	    return (status !== null && status !== 0)
	  } catch (e) {
	    return false
	  }
	}

	ClientRequest.prototype._onXHRProgress = function() {
	  var self = this;

	  if (!statusValid(self._xhr) || self._destroyed)
	    return

	  if (!self._response)
	    self._connect();

	  self._response._onXHRProgress();
	};

	ClientRequest.prototype._connect = function() {
	  var self = this;

	  if (self._destroyed)
	    return

	  self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode);
	  self.emit('response', self._response);
	};

	ClientRequest.prototype._write = function(chunk, encoding, cb) {
	  var self = this;

	  self._body.push(chunk);
	  cb();
	};

	ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function() {
	  var self = this;
	  self._destroyed = true;
	  if (self._response)
	    self._response._destroyed = true;
	  if (self._xhr)
	    self._xhr.abort();
	    // Currently, there isn't a way to truly abort a fetch.
	    // If you like bikeshedding, see https://github.com/whatwg/fetch/issues/27
	};

	ClientRequest.prototype.end = function(data, encoding, cb) {
	  var self = this;
	  if (typeof data === 'function') {
	    cb = data;
	    data = undefined;
	  }

	  Writable.prototype.end.call(self, data, encoding, cb);
	};

	ClientRequest.prototype.flushHeaders = function() {};
	ClientRequest.prototype.setTimeout = function() {};
	ClientRequest.prototype.setNoDelay = function() {};
	ClientRequest.prototype.setSocketKeepAlive = function() {};

	/*! https://mths.be/punycode v1.4.1 by @mathias */


	/** Highest positive signed 32-bit float value */
	var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128; // 0x80
	var delimiter = '-'; // '\x2D'
	var regexNonASCII = /[^\x20-\x7E]/; // unprintable ASCII chars + non-ASCII chars
	var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

	/** Error messages */
	var errors = {
	  'overflow': 'Overflow: input needs wider integers to process',
	  'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
	  'invalid-input': 'Invalid input'
	};

	/** Convenience shortcuts */
	var baseMinusTMin = base - tMin;
	var floor = Math.floor;
	var stringFromCharCode = String.fromCharCode;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
	  throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map$1(array, fn) {
	  var length = array.length;
	  var result = [];
	  while (length--) {
	    result[length] = fn(array[length]);
	  }
	  return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
	  var parts = string.split('@');
	  var result = '';
	  if (parts.length > 1) {
	    // In email addresses, only the domain name should be punycoded. Leave
	    // the local part (i.e. everything up to `@`) intact.
	    result = parts[0] + '@';
	    string = parts[1];
	  }
	  // Avoid `split(regex)` for IE8 compatibility. See #17.
	  string = string.replace(regexSeparators, '\x2E');
	  var labels = string.split('.');
	  var encoded = map$1(labels, fn).join('.');
	  return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
	  var output = [],
	    counter = 0,
	    length = string.length,
	    value,
	    extra;
	  while (counter < length) {
	    value = string.charCodeAt(counter++);
	    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	      // high surrogate, and there is a next character
	      extra = string.charCodeAt(counter++);
	      if ((extra & 0xFC00) == 0xDC00) { // low surrogate
	        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	      } else {
	        // unmatched surrogate; only append this code unit, in case the next
	        // code unit is the high surrogate of a surrogate pair
	        output.push(value);
	        counter--;
	      }
	    } else {
	      output.push(value);
	    }
	  }
	  return output;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
	  //  0..25 map to ASCII a..z or A..Z
	  // 26..35 map to ASCII 0..9
	  return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
	  var k = 0;
	  delta = firstTime ? floor(delta / damp) : delta >> 1;
	  delta += floor(delta / numPoints);
	  for ( /* no initialization */ ; delta > baseMinusTMin * tMax >> 1; k += base) {
	    delta = floor(delta / baseMinusTMin);
	  }
	  return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
	  var n,
	    delta,
	    handledCPCount,
	    basicLength,
	    bias,
	    j,
	    m,
	    q,
	    k,
	    t,
	    currentValue,
	    output = [],
	    /** `inputLength` will hold the number of code points in `input`. */
	    inputLength,
	    /** Cached calculation results */
	    handledCPCountPlusOne,
	    baseMinusT,
	    qMinusT;

	  // Convert the input in UCS-2 to Unicode
	  input = ucs2decode(input);

	  // Cache the length
	  inputLength = input.length;

	  // Initialize the state
	  n = initialN;
	  delta = 0;
	  bias = initialBias;

	  // Handle the basic code points
	  for (j = 0; j < inputLength; ++j) {
	    currentValue = input[j];
	    if (currentValue < 0x80) {
	      output.push(stringFromCharCode(currentValue));
	    }
	  }

	  handledCPCount = basicLength = output.length;

	  // `handledCPCount` is the number of code points that have been handled;
	  // `basicLength` is the number of basic code points.

	  // Finish the basic string - if it is not empty - with a delimiter
	  if (basicLength) {
	    output.push(delimiter);
	  }

	  // Main encoding loop:
	  while (handledCPCount < inputLength) {

	    // All non-basic code points < n have been handled already. Find the next
	    // larger one:
	    for (m = maxInt, j = 0; j < inputLength; ++j) {
	      currentValue = input[j];
	      if (currentValue >= n && currentValue < m) {
	        m = currentValue;
	      }
	    }

	    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
	    // but guard against overflow
	    handledCPCountPlusOne = handledCPCount + 1;
	    if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
	      error('overflow');
	    }

	    delta += (m - n) * handledCPCountPlusOne;
	    n = m;

	    for (j = 0; j < inputLength; ++j) {
	      currentValue = input[j];

	      if (currentValue < n && ++delta > maxInt) {
	        error('overflow');
	      }

	      if (currentValue == n) {
	        // Represent delta as a generalized variable-length integer
	        for (q = delta, k = base; /* no condition */ ; k += base) {
	          t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	          if (q < t) {
	            break;
	          }
	          qMinusT = q - t;
	          baseMinusT = base - t;
	          output.push(
	            stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
	          );
	          q = floor(qMinusT / baseMinusT);
	        }

	        output.push(stringFromCharCode(digitToBasic(q, 0)));
	        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
	        delta = 0;
	        ++handledCPCount;
	      }
	    }

	    ++delta;
	    ++n;

	  }
	  return output.join('');
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
	  return mapDomain(input, function(string) {
	    return regexNonASCII.test(string) ?
	      'xn--' + encode(string) :
	      string;
	  });
	}

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.


	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	var isArray = Array.isArray || function (xs) {
	  return Object.prototype.toString.call(xs) === '[object Array]';
	};
	function stringifyPrimitive(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;

	    case 'boolean':
	      return v ? 'true' : 'false';

	    case 'number':
	      return isFinite(v) ? v : '';

	    default:
	      return '';
	  }
	}

	function stringify (obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }

	  if (typeof obj === 'object') {
	    return map(objectKeys(obj), function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (isArray(obj[k])) {
	        return map(obj[k], function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);

	  }

	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	}
	function map (xs, f) {
	  if (xs.map) return xs.map(f);
	  var res = [];
	  for (var i = 0; i < xs.length; i++) {
	    res.push(f(xs[i], i));
	  }
	  return res;
	}

	var objectKeys = Object.keys || function (obj) {
	  var res = [];
	  for (var key in obj) {
	    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
	  }
	  return res;
	};

	function parse$1(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};

	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }

	  var regexp = /\+/g;
	  qs = qs.split(sep);

	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }

	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }

	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;

	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }

	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);

	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }

	  return obj;
	}

	// WHATWG API
	const URL = global$1.URL;
	const URLSearchParams$1 = global$1.URLSearchParams;
	var _polyfillNode_url = {
	  parse: urlParse,
	  resolve: urlResolve,
	  resolveObject: urlResolveObject,
	  fileURLToPath: urlFileURLToPath,
	  format: urlFormat,
	  Url: Url,

	  // WHATWG API
	  URL,
	  URLSearchParams: URLSearchParams$1,  
	};
	function Url() {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.host = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.query = null;
	  this.pathname = null;
	  this.path = null;
	  this.href = null;
	}

	// Reference: RFC 3986, RFC 1808, RFC 2396

	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i,
	  portPattern = /:[0-9]*$/,

	  // Special case for a simple path URL
	  simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

	  // RFC 2396: characters reserved for delimiting URLs.
	  // We actually just auto-escape these.
	  delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

	  // RFC 2396: characters not allowed for various reasons.
	  unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

	  // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	  autoEscape = ['\''].concat(unwise),
	  // Characters that are never ever allowed in a hostname.
	  // Note that any invalid chars are also handled, but these
	  // are the ones that are *expected* to be seen, so we fast-path
	  // them.
	  nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
	  hostEndingChars = ['/', '?', '#'],
	  hostnameMaxLen = 255,
	  hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
	  hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
	  // protocols that can allow "unsafe" and "unwise" chars.
	  unsafeProtocol = {
	    'javascript': true,
	    'javascript:': true
	  },
	  // protocols that never have a hostname.
	  hostlessProtocol = {
	    'javascript': true,
	    'javascript:': true
	  },
	  // protocols that always contain a // bit.
	  slashedProtocol = {
	    'http': true,
	    'https': true,
	    'ftp': true,
	    'gopher': true,
	    'file': true,
	    'http:': true,
	    'https:': true,
	    'ftp:': true,
	    'gopher:': true,
	    'file:': true
	  };

	function urlParse(url, parseQueryString, slashesDenoteHost) {
	  if (url && isObject(url) && url instanceof Url) return url;

	  var u = new Url;
	  u.parse(url, parseQueryString, slashesDenoteHost);
	  return u;
	}
	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
	  return parse(this, url, parseQueryString, slashesDenoteHost);
	};

	function parse(self, url, parseQueryString, slashesDenoteHost) {
	  if (!isString(url)) {
	    throw new TypeError('Parameter \'url\' must be a string, not ' + typeof url);
	  }

	  // Copy chrome, IE, opera backslash-handling behavior.
	  // Back slashes before the query string get converted to forward slashes
	  // See: https://code.google.com/p/chromium/issues/detail?id=25916
	  var queryIndex = url.indexOf('?'),
	    splitter =
	    (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
	    uSplit = url.split(splitter),
	    slashRegex = /\\/g;
	  uSplit[0] = uSplit[0].replace(slashRegex, '/');
	  url = uSplit.join(splitter);

	  var rest = url;

	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();

	  if (!slashesDenoteHost && url.split('#').length === 1) {
	    // Try fast path regexp
	    var simplePath = simplePathPattern.exec(rest);
	    if (simplePath) {
	      self.path = rest;
	      self.href = rest;
	      self.pathname = simplePath[1];
	      if (simplePath[2]) {
	        self.search = simplePath[2];
	        if (parseQueryString) {
	          self.query = parse$1(self.search.substr(1));
	        } else {
	          self.query = self.search.substr(1);
	        }
	      } else if (parseQueryString) {
	        self.search = '';
	        self.query = {};
	      }
	      return self;
	    }
	  }

	  var proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    var lowerProto = proto.toLowerCase();
	    self.protocol = lowerProto;
	    rest = rest.substr(proto.length);
	  }

	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    var slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      self.slashes = true;
	    }
	  }
	  var i, hec, l, p;
	  if (!hostlessProtocol[proto] &&
	    (slashes || (proto && !slashedProtocol[proto]))) {

	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c

	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.

	    // find the first instance of any hostEndingChars
	    var hostEnd = -1;
	    for (i = 0; i < hostEndingChars.length; i++) {
	      hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }

	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    var auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }

	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      self.auth = decodeURIComponent(auth);
	    }

	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (i = 0; i < nonHostChars.length; i++) {
	      hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1)
	      hostEnd = rest.length;

	    self.host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);

	    // pull out port.
	    parseHost(self);

	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    self.hostname = self.hostname || '';

	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    var ipv6Hostname = self.hostname[0] === '[' &&
	      self.hostname[self.hostname.length - 1] === ']';

	    // validate a little.
	    if (!ipv6Hostname) {
	      var hostparts = self.hostname.split(/\./);
	      for (i = 0, l = hostparts.length; i < l; i++) {
	        var part = hostparts[i];
	        if (!part) continue;
	        if (!part.match(hostnamePartPattern)) {
	          var newpart = '';
	          for (var j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            var validParts = hostparts.slice(0, i);
	            var notHost = hostparts.slice(i + 1);
	            var bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = '/' + notHost.join('.') + rest;
	            }
	            self.hostname = validParts.join('.');
	            break;
	          }
	        }
	      }
	    }

	    if (self.hostname.length > hostnameMaxLen) {
	      self.hostname = '';
	    } else {
	      // hostnames are always lower case.
	      self.hostname = self.hostname.toLowerCase();
	    }

	    if (!ipv6Hostname) {
	      // IDNA Support: Returns a punycoded representation of "domain".
	      // It only converts parts of the domain name that
	      // have non-ASCII characters, i.e. it doesn't matter if
	      // you call it with a domain that already is ASCII-only.
	      self.hostname = toASCII(self.hostname);
	    }

	    p = self.port ? ':' + self.port : '';
	    var h = self.hostname || '';
	    self.host = h + p;
	    self.href += self.host;

	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      self.hostname = self.hostname.substr(1, self.hostname.length - 2);
	      if (rest[0] !== '/') {
	        rest = '/' + rest;
	      }
	    }
	  }

	  // now rest is set to the post-host stuff.
	  // chop off any delim chars.
	  if (!unsafeProtocol[lowerProto]) {

	    // First, make 100% sure that any "autoEscape" chars get
	    // escaped, even if encodeURIComponent doesn't think they
	    // need to be.
	    for (i = 0, l = autoEscape.length; i < l; i++) {
	      var ae = autoEscape[i];
	      if (rest.indexOf(ae) === -1)
	        continue;
	      var esc = encodeURIComponent(ae);
	      if (esc === ae) {
	        esc = escape(ae);
	      }
	      rest = rest.split(ae).join(esc);
	    }
	  }


	  // chop off from the tail first.
	  var hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    self.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  var qm = rest.indexOf('?');
	  if (qm !== -1) {
	    self.search = rest.substr(qm);
	    self.query = rest.substr(qm + 1);
	    if (parseQueryString) {
	      self.query = parse$1(self.query);
	    }
	    rest = rest.slice(0, qm);
	  } else if (parseQueryString) {
	    // no query string, but parseQueryString still requested
	    self.search = '';
	    self.query = {};
	  }
	  if (rest) self.pathname = rest;
	  if (slashedProtocol[lowerProto] &&
	    self.hostname && !self.pathname) {
	    self.pathname = '/';
	  }

	  //to support http.request
	  if (self.pathname || self.search) {
	    p = self.pathname || '';
	    var s = self.search || '';
	    self.path = p + s;
	  }

	  // finally, reconstruct the href based on what has been validated.
	  self.href = format(self);
	  return self;
	}

	function urlFileURLToPath(path) {
	  if (typeof path === 'string')
	    path = new Url().parse(path);
	  else if (!(path instanceof Url))
	    throw new TypeError('The "path" argument must be of type string or an instance of URL. Received type ' + (typeof path) + String(path));
	  if (path.protocol !== 'file:')
	    throw new TypeError('The URL must be of scheme file');
	  return getPathFromURLPosix(path);
	}

	function getPathFromURLPosix(url) {
	  const pathname = url.pathname;
	  for (let n = 0; n < pathname.length; n++) {
	    if (pathname[n] === '%') {
	      const third = pathname.codePointAt(n + 2) | 0x20;
	      if (pathname[n + 1] === '2' && third === 102) {
	        throw new TypeError(
	          'must not include encoded / characters'
	        );
	      }
	    }
	  }
	  return decodeURIComponent(pathname);
	}

	// format a parsed object into a url string
	function urlFormat(obj) {
	  // ensure it's an object, and not a string url.
	  // If it's an obj, this is a no-op.
	  // this way, you can call url_format() on strings
	  // to clean up potentially wonky urls.
	  if (isString(obj)) obj = parse({}, obj);
	  return format(obj);
	}

	function format(self) {
	  var auth = self.auth || '';
	  if (auth) {
	    auth = encodeURIComponent(auth);
	    auth = auth.replace(/%3A/i, ':');
	    auth += '@';
	  }

	  var protocol = self.protocol || '',
	    pathname = self.pathname || '',
	    hash = self.hash || '',
	    host = false,
	    query = '';

	  if (self.host) {
	    host = auth + self.host;
	  } else if (self.hostname) {
	    host = auth + (self.hostname.indexOf(':') === -1 ?
	      self.hostname :
	      '[' + this.hostname + ']');
	    if (self.port) {
	      host += ':' + self.port;
	    }
	  }

	  if (self.query &&
	    isObject(self.query) &&
	    Object.keys(self.query).length) {
	    query = stringify(self.query);
	  }

	  var search = self.search || (query && ('?' + query)) || '';

	  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

	  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
	  // unless they had them to begin with.
	  if (self.slashes ||
	    (!protocol || slashedProtocol[protocol]) && host !== false) {
	    host = '//' + (host || '');
	    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
	  } else if (!host) {
	    host = '';
	  }

	  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
	  if (search && search.charAt(0) !== '?') search = '?' + search;

	  pathname = pathname.replace(/[?#]/g, function(match) {
	    return encodeURIComponent(match);
	  });
	  search = search.replace('#', '%23');

	  return protocol + host + pathname + search + hash;
	}

	Url.prototype.format = function() {
	  return format(this);
	};

	function urlResolve(source, relative) {
	  return urlParse(source, false, true).resolve(relative);
	}

	Url.prototype.resolve = function(relative) {
	  return this.resolveObject(urlParse(relative, false, true)).format();
	};

	function urlResolveObject(source, relative) {
	  if (!source) return relative;
	  return urlParse(source, false, true).resolveObject(relative);
	}

	Url.prototype.resolveObject = function(relative) {
	  if (isString(relative)) {
	    var rel = new Url();
	    rel.parse(relative, false, true);
	    relative = rel;
	  }

	  var result = new Url();
	  var tkeys = Object.keys(this);
	  for (var tk = 0; tk < tkeys.length; tk++) {
	    var tkey = tkeys[tk];
	    result[tkey] = this[tkey];
	  }

	  // hash is always overridden, no matter what.
	  // even href="" will remove it.
	  result.hash = relative.hash;

	  // if the relative url is empty, then there's nothing left to do here.
	  if (relative.href === '') {
	    result.href = result.format();
	    return result;
	  }

	  // hrefs like //foo/bar always cut to the protocol.
	  if (relative.slashes && !relative.protocol) {
	    // take everything except the protocol from relative
	    var rkeys = Object.keys(relative);
	    for (var rk = 0; rk < rkeys.length; rk++) {
	      var rkey = rkeys[rk];
	      if (rkey !== 'protocol')
	        result[rkey] = relative[rkey];
	    }

	    //urlParse appends trailing / to urls like http://www.example.com
	    if (slashedProtocol[result.protocol] &&
	      result.hostname && !result.pathname) {
	      result.path = result.pathname = '/';
	    }

	    result.href = result.format();
	    return result;
	  }
	  var relPath;
	  if (relative.protocol && relative.protocol !== result.protocol) {
	    // if it's a known url protocol, then changing
	    // the protocol does weird things
	    // first, if it's not file:, then we MUST have a host,
	    // and if there was a path
	    // to begin with, then we MUST have a path.
	    // if it is file:, then the host is dropped,
	    // because that's known to be hostless.
	    // anything else is assumed to be absolute.
	    if (!slashedProtocol[relative.protocol]) {
	      var keys = Object.keys(relative);
	      for (var v = 0; v < keys.length; v++) {
	        var k = keys[v];
	        result[k] = relative[k];
	      }
	      result.href = result.format();
	      return result;
	    }

	    result.protocol = relative.protocol;
	    if (!relative.host && !hostlessProtocol[relative.protocol]) {
	      relPath = (relative.pathname || '').split('/');
	      while (relPath.length && !(relative.host = relPath.shift()));
	      if (!relative.host) relative.host = '';
	      if (!relative.hostname) relative.hostname = '';
	      if (relPath[0] !== '') relPath.unshift('');
	      if (relPath.length < 2) relPath.unshift('');
	      result.pathname = relPath.join('/');
	    } else {
	      result.pathname = relative.pathname;
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    result.host = relative.host || '';
	    result.auth = relative.auth;
	    result.hostname = relative.hostname || relative.host;
	    result.port = relative.port;
	    // to support http.request
	    if (result.pathname || result.search) {
	      var p = result.pathname || '';
	      var s = result.search || '';
	      result.path = p + s;
	    }
	    result.slashes = result.slashes || relative.slashes;
	    result.href = result.format();
	    return result;
	  }

	  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
	    isRelAbs = (
	      relative.host ||
	      relative.pathname && relative.pathname.charAt(0) === '/'
	    ),
	    mustEndAbs = (isRelAbs || isSourceAbs ||
	      (result.host && relative.pathname)),
	    removeAllDots = mustEndAbs,
	    srcPath = result.pathname && result.pathname.split('/') || [],
	    psychotic = result.protocol && !slashedProtocol[result.protocol];
	  relPath = relative.pathname && relative.pathname.split('/') || [];
	  // if the url is a non-slashed url, then relative
	  // links like ../.. should be able
	  // to crawl up to the hostname, as well.  This is strange.
	  // result.protocol has already been set by now.
	  // Later on, put the first path part into the host field.
	  if (psychotic) {
	    result.hostname = '';
	    result.port = null;
	    if (result.host) {
	      if (srcPath[0] === '') srcPath[0] = result.host;
	      else srcPath.unshift(result.host);
	    }
	    result.host = '';
	    if (relative.protocol) {
	      relative.hostname = null;
	      relative.port = null;
	      if (relative.host) {
	        if (relPath[0] === '') relPath[0] = relative.host;
	        else relPath.unshift(relative.host);
	      }
	      relative.host = null;
	    }
	    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
	  }
	  var authInHost;
	  if (isRelAbs) {
	    // it's absolute.
	    result.host = (relative.host || relative.host === '') ?
	      relative.host : result.host;
	    result.hostname = (relative.hostname || relative.hostname === '') ?
	      relative.hostname : result.hostname;
	    result.search = relative.search;
	    result.query = relative.query;
	    srcPath = relPath;
	    // fall through to the dot-handling below.
	  } else if (relPath.length) {
	    // it's relative
	    // throw away the existing file, and take the new path instead.
	    if (!srcPath) srcPath = [];
	    srcPath.pop();
	    srcPath = srcPath.concat(relPath);
	    result.search = relative.search;
	    result.query = relative.query;
	  } else if (!isNullOrUndefined(relative.search)) {
	    // just pull out the search.
	    // like href='?foo'.
	    // Put this after the other two cases because it simplifies the booleans
	    if (psychotic) {
	      result.hostname = result.host = srcPath.shift();
	      //occationaly the auth can get stuck only in host
	      //this especially happens in cases like
	      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	      authInHost = result.host && result.host.indexOf('@') > 0 ?
	        result.host.split('@') : false;
	      if (authInHost) {
	        result.auth = authInHost.shift();
	        result.host = result.hostname = authInHost.shift();
	      }
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    //to support http.request
	    if (!isNull(result.pathname) || !isNull(result.search)) {
	      result.path = (result.pathname ? result.pathname : '') +
	        (result.search ? result.search : '');
	    }
	    result.href = result.format();
	    return result;
	  }

	  if (!srcPath.length) {
	    // no path at all.  easy.
	    // we've already handled the other stuff above.
	    result.pathname = null;
	    //to support http.request
	    if (result.search) {
	      result.path = '/' + result.search;
	    } else {
	      result.path = null;
	    }
	    result.href = result.format();
	    return result;
	  }

	  // if a url ENDs in . or .., then it must get a trailing slash.
	  // however, if it ends in anything else non-slashy,
	  // then it must NOT get a trailing slash.
	  var last = srcPath.slice(-1)[0];
	  var hasTrailingSlash = (
	    (result.host || relative.host || srcPath.length > 1) &&
	    (last === '.' || last === '..') || last === '');

	  // strip single dots, resolve double dots to parent dir
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = srcPath.length; i >= 0; i--) {
	    last = srcPath[i];
	    if (last === '.') {
	      srcPath.splice(i, 1);
	    } else if (last === '..') {
	      srcPath.splice(i, 1);
	      up++;
	    } else if (up) {
	      srcPath.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (!mustEndAbs && !removeAllDots) {
	    for (; up--; up) {
	      srcPath.unshift('..');
	    }
	  }

	  if (mustEndAbs && srcPath[0] !== '' &&
	    (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
	    srcPath.unshift('');
	  }

	  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
	    srcPath.push('');
	  }

	  var isAbsolute = srcPath[0] === '' ||
	    (srcPath[0] && srcPath[0].charAt(0) === '/');

	  // put the host back
	  if (psychotic) {
	    result.hostname = result.host = isAbsolute ? '' :
	      srcPath.length ? srcPath.shift() : '';
	    //occationaly the auth can get stuck only in host
	    //this especially happens in cases like
	    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	    authInHost = result.host && result.host.indexOf('@') > 0 ?
	      result.host.split('@') : false;
	    if (authInHost) {
	      result.auth = authInHost.shift();
	      result.host = result.hostname = authInHost.shift();
	    }
	  }

	  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

	  if (mustEndAbs && !isAbsolute) {
	    srcPath.unshift('');
	  }

	  if (!srcPath.length) {
	    result.pathname = null;
	    result.path = null;
	  } else {
	    result.pathname = srcPath.join('/');
	  }

	  //to support request.http
	  if (!isNull(result.pathname) || !isNull(result.search)) {
	    result.path = (result.pathname ? result.pathname : '') +
	      (result.search ? result.search : '');
	  }
	  result.auth = relative.auth || result.auth;
	  result.slashes = result.slashes || relative.slashes;
	  result.href = result.format();
	  return result;
	};

	Url.prototype.parseHost = function() {
	  return parseHost(this);
	};

	function parseHost(self) {
	  var host = self.host;
	  var port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      self.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) self.hostname = host;
	}

	var _polyfillNode_url$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		URL: URL,
		URLSearchParams: URLSearchParams$1,
		Url: Url,
		default: _polyfillNode_url,
		fileURLToPath: urlFileURLToPath,
		format: urlFormat,
		parse: urlParse,
		resolve: urlResolve,
		resolveObject: urlResolveObject
	});

	function request$1(opts, cb) {
	  if (typeof opts === 'string')
	    opts = urlParse(opts);


	  // Normally, the page is loaded from http or https, so not specifying a protocol
	  // will result in a (valid) protocol-relative url. However, this won't work if
	  // the protocol is something else, like 'file:'
	  var defaultProtocol = global$1.location.protocol.search(/^https?:$/) === -1 ? 'http:' : '';

	  var protocol = opts.protocol || defaultProtocol;
	  var host = opts.hostname || opts.host;
	  var port = opts.port;
	  var path = opts.path || '/';

	  // Necessary for IPv6 addresses
	  if (host && host.indexOf(':') !== -1)
	    host = '[' + host + ']';

	  // This may be a relative url. The browser should always be able to interpret it correctly.
	  opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path;
	  opts.method = (opts.method || 'GET').toUpperCase();
	  opts.headers = opts.headers || {};

	  // Also valid opts.auth, opts.mode

	  var req = new ClientRequest(opts);
	  if (cb)
	    req.on('response', cb);
	  return req
	}

	function get$1(opts, cb) {
	  var req = request$1(opts, cb);
	  req.end();
	  return req
	}

	function Agent$1() {}
	Agent$1.defaultMaxSockets = 4;

	var METHODS$1 = [
	  'CHECKOUT',
	  'CONNECT',
	  'COPY',
	  'DELETE',
	  'GET',
	  'HEAD',
	  'LOCK',
	  'M-SEARCH',
	  'MERGE',
	  'MKACTIVITY',
	  'MKCOL',
	  'MOVE',
	  'NOTIFY',
	  'OPTIONS',
	  'PATCH',
	  'POST',
	  'PROPFIND',
	  'PROPPATCH',
	  'PURGE',
	  'PUT',
	  'REPORT',
	  'SEARCH',
	  'SUBSCRIBE',
	  'TRACE',
	  'UNLOCK',
	  'UNSUBSCRIBE'
	];
	var STATUS_CODES$1 = {
	  100: 'Continue',
	  101: 'Switching Protocols',
	  102: 'Processing', // RFC 2518, obsoleted by RFC 4918
	  200: 'OK',
	  201: 'Created',
	  202: 'Accepted',
	  203: 'Non-Authoritative Information',
	  204: 'No Content',
	  205: 'Reset Content',
	  206: 'Partial Content',
	  207: 'Multi-Status', // RFC 4918
	  300: 'Multiple Choices',
	  301: 'Moved Permanently',
	  302: 'Moved Temporarily',
	  303: 'See Other',
	  304: 'Not Modified',
	  305: 'Use Proxy',
	  307: 'Temporary Redirect',
	  400: 'Bad Request',
	  401: 'Unauthorized',
	  402: 'Payment Required',
	  403: 'Forbidden',
	  404: 'Not Found',
	  405: 'Method Not Allowed',
	  406: 'Not Acceptable',
	  407: 'Proxy Authentication Required',
	  408: 'Request Time-out',
	  409: 'Conflict',
	  410: 'Gone',
	  411: 'Length Required',
	  412: 'Precondition Failed',
	  413: 'Request Entity Too Large',
	  414: 'Request-URI Too Large',
	  415: 'Unsupported Media Type',
	  416: 'Requested Range Not Satisfiable',
	  417: 'Expectation Failed',
	  418: 'I\'m a teapot', // RFC 2324
	  422: 'Unprocessable Entity', // RFC 4918
	  423: 'Locked', // RFC 4918
	  424: 'Failed Dependency', // RFC 4918
	  425: 'Unordered Collection', // RFC 4918
	  426: 'Upgrade Required', // RFC 2817
	  428: 'Precondition Required', // RFC 6585
	  429: 'Too Many Requests', // RFC 6585
	  431: 'Request Header Fields Too Large', // RFC 6585
	  500: 'Internal Server Error',
	  501: 'Not Implemented',
	  502: 'Bad Gateway',
	  503: 'Service Unavailable',
	  504: 'Gateway Time-out',
	  505: 'HTTP Version Not Supported',
	  506: 'Variant Also Negotiates', // RFC 2295
	  507: 'Insufficient Storage', // RFC 4918
	  509: 'Bandwidth Limit Exceeded',
	  510: 'Not Extended', // RFC 2774
	  511: 'Network Authentication Required' // RFC 6585
	};

	var _polyfillNode_http = {
	  request: request$1,
	  get: get$1,
	  Agent: Agent$1,
	  METHODS: METHODS$1,
	  STATUS_CODES: STATUS_CODES$1
	};

	var _polyfillNode_http$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		Agent: Agent$1,
		METHODS: METHODS$1,
		STATUS_CODES: STATUS_CODES$1,
		default: _polyfillNode_http,
		get: get$1,
		request: request$1
	});

	var require$$3 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_http$1);

	function request(opts, cb) {
	  if (typeof opts === 'string')
	    opts = urlParse(opts);


	  // Normally, the page is loaded from http or https, so not specifying a protocol
	  // will result in a (valid) protocol-relative url. However, this won't work if
	  // the protocol is something else, like 'file:'
	  var defaultProtocol = global$1.location.protocol.search(/^https?:$/) === -1 ? 'http:' : '';

	  var protocol = opts.protocol || defaultProtocol;
	  var host = opts.hostname || opts.host;
	  var port = opts.port;
	  var path = opts.path || '/';

	  // Necessary for IPv6 addresses
	  if (host && host.indexOf(':') !== -1)
	    host = '[' + host + ']';

	  // This may be a relative url. The browser should always be able to interpret it correctly.
	  opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path;
	  opts.method = (opts.method || 'GET').toUpperCase();
	  opts.headers = opts.headers || {};

	  // Also valid opts.auth, opts.mode

	  var req = new ClientRequest(opts);
	  if (cb)
	    req.on('response', cb);
	  return req
	}

	function get(opts, cb) {
	  var req = request(opts, cb);
	  req.end();
	  return req
	}

	function Agent() {}
	Agent.defaultMaxSockets = 4;

	var METHODS = [
	  'CHECKOUT',
	  'CONNECT',
	  'COPY',
	  'DELETE',
	  'GET',
	  'HEAD',
	  'LOCK',
	  'M-SEARCH',
	  'MERGE',
	  'MKACTIVITY',
	  'MKCOL',
	  'MOVE',
	  'NOTIFY',
	  'OPTIONS',
	  'PATCH',
	  'POST',
	  'PROPFIND',
	  'PROPPATCH',
	  'PURGE',
	  'PUT',
	  'REPORT',
	  'SEARCH',
	  'SUBSCRIBE',
	  'TRACE',
	  'UNLOCK',
	  'UNSUBSCRIBE'
	];
	var STATUS_CODES = {
	  100: 'Continue',
	  101: 'Switching Protocols',
	  102: 'Processing', // RFC 2518, obsoleted by RFC 4918
	  200: 'OK',
	  201: 'Created',
	  202: 'Accepted',
	  203: 'Non-Authoritative Information',
	  204: 'No Content',
	  205: 'Reset Content',
	  206: 'Partial Content',
	  207: 'Multi-Status', // RFC 4918
	  300: 'Multiple Choices',
	  301: 'Moved Permanently',
	  302: 'Moved Temporarily',
	  303: 'See Other',
	  304: 'Not Modified',
	  305: 'Use Proxy',
	  307: 'Temporary Redirect',
	  400: 'Bad Request',
	  401: 'Unauthorized',
	  402: 'Payment Required',
	  403: 'Forbidden',
	  404: 'Not Found',
	  405: 'Method Not Allowed',
	  406: 'Not Acceptable',
	  407: 'Proxy Authentication Required',
	  408: 'Request Time-out',
	  409: 'Conflict',
	  410: 'Gone',
	  411: 'Length Required',
	  412: 'Precondition Failed',
	  413: 'Request Entity Too Large',
	  414: 'Request-URI Too Large',
	  415: 'Unsupported Media Type',
	  416: 'Requested Range Not Satisfiable',
	  417: 'Expectation Failed',
	  418: 'I\'m a teapot', // RFC 2324
	  422: 'Unprocessable Entity', // RFC 4918
	  423: 'Locked', // RFC 4918
	  424: 'Failed Dependency', // RFC 4918
	  425: 'Unordered Collection', // RFC 4918
	  426: 'Upgrade Required', // RFC 2817
	  428: 'Precondition Required', // RFC 6585
	  429: 'Too Many Requests', // RFC 6585
	  431: 'Request Header Fields Too Large', // RFC 6585
	  500: 'Internal Server Error',
	  501: 'Not Implemented',
	  502: 'Bad Gateway',
	  503: 'Service Unavailable',
	  504: 'Gateway Time-out',
	  505: 'HTTP Version Not Supported',
	  506: 'Variant Also Negotiates', // RFC 2295
	  507: 'Insufficient Storage', // RFC 4918
	  509: 'Bandwidth Limit Exceeded',
	  510: 'Not Extended', // RFC 2774
	  511: 'Network Authentication Required' // RFC 6585
	};

	var _polyfillNode_https = {
	  request,
	  get,
	  Agent,
	  METHODS,
	  STATUS_CODES
	};

	var _polyfillNode_https$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		Agent: Agent,
		METHODS: METHODS,
		STATUS_CODES: STATUS_CODES,
		default: _polyfillNode_https,
		get: get,
		request: request
	});

	var require$$4 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_https$1);

	var require$$5 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_url$1);

	var _polyfillNode_fs = {};

	var _polyfillNode_fs$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		default: _polyfillNode_fs
	});

	var require$$6 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_fs$1);

	var mimeTypes = {};

	var require$$0 = {
		"application/1d-interleaved-parityfec": {
		source: "iana"
	},
		"application/3gpdash-qoe-report+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/3gpp-ims+xml": {
		source: "iana",
		compressible: true
	},
		"application/3gpphal+json": {
		source: "iana",
		compressible: true
	},
		"application/3gpphalforms+json": {
		source: "iana",
		compressible: true
	},
		"application/a2l": {
		source: "iana"
	},
		"application/ace+cbor": {
		source: "iana"
	},
		"application/ace+json": {
		source: "iana",
		compressible: true
	},
		"application/ace-groupcomm+cbor": {
		source: "iana"
	},
		"application/ace-trl+cbor": {
		source: "iana"
	},
		"application/activemessage": {
		source: "iana"
	},
		"application/activity+json": {
		source: "iana",
		compressible: true
	},
		"application/aif+cbor": {
		source: "iana"
	},
		"application/aif+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-cdni+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-cdnifilter+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-costmap+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-costmapfilter+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-directory+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-endpointcost+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-endpointcostparams+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-endpointprop+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-endpointpropparams+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-error+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-networkmap+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-networkmapfilter+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-propmap+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-propmapparams+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-tips+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-tipsparams+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-updatestreamcontrol+json": {
		source: "iana",
		compressible: true
	},
		"application/alto-updatestreamparams+json": {
		source: "iana",
		compressible: true
	},
		"application/aml": {
		source: "iana"
	},
		"application/andrew-inset": {
		source: "iana",
		extensions: [
			"ez"
		]
	},
		"application/appinstaller": {
		compressible: false,
		extensions: [
			"appinstaller"
		]
	},
		"application/applefile": {
		source: "iana"
	},
		"application/applixware": {
		source: "apache",
		extensions: [
			"aw"
		]
	},
		"application/appx": {
		compressible: false,
		extensions: [
			"appx"
		]
	},
		"application/appxbundle": {
		compressible: false,
		extensions: [
			"appxbundle"
		]
	},
		"application/at+jwt": {
		source: "iana"
	},
		"application/atf": {
		source: "iana"
	},
		"application/atfx": {
		source: "iana"
	},
		"application/atom+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"atom"
		]
	},
		"application/atomcat+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"atomcat"
		]
	},
		"application/atomdeleted+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"atomdeleted"
		]
	},
		"application/atomicmail": {
		source: "iana"
	},
		"application/atomsvc+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"atomsvc"
		]
	},
		"application/atsc-dwd+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"dwd"
		]
	},
		"application/atsc-dynamic-event-message": {
		source: "iana"
	},
		"application/atsc-held+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"held"
		]
	},
		"application/atsc-rdt+json": {
		source: "iana",
		compressible: true
	},
		"application/atsc-rsat+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"rsat"
		]
	},
		"application/atxml": {
		source: "iana"
	},
		"application/auth-policy+xml": {
		source: "iana",
		compressible: true
	},
		"application/automationml-aml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"aml"
		]
	},
		"application/automationml-amlx+zip": {
		source: "iana",
		compressible: false,
		extensions: [
			"amlx"
		]
	},
		"application/bacnet-xdd+zip": {
		source: "iana",
		compressible: false
	},
		"application/batch-smtp": {
		source: "iana"
	},
		"application/bdoc": {
		compressible: false,
		extensions: [
			"bdoc"
		]
	},
		"application/beep+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/bufr": {
		source: "iana"
	},
		"application/c2pa": {
		source: "iana"
	},
		"application/calendar+json": {
		source: "iana",
		compressible: true
	},
		"application/calendar+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xcs"
		]
	},
		"application/call-completion": {
		source: "iana"
	},
		"application/cals-1840": {
		source: "iana"
	},
		"application/captive+json": {
		source: "iana",
		compressible: true
	},
		"application/cbor": {
		source: "iana"
	},
		"application/cbor-seq": {
		source: "iana"
	},
		"application/cccex": {
		source: "iana"
	},
		"application/ccmp+xml": {
		source: "iana",
		compressible: true
	},
		"application/ccxml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"ccxml"
		]
	},
		"application/cda+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/cdfx+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"cdfx"
		]
	},
		"application/cdmi-capability": {
		source: "iana",
		extensions: [
			"cdmia"
		]
	},
		"application/cdmi-container": {
		source: "iana",
		extensions: [
			"cdmic"
		]
	},
		"application/cdmi-domain": {
		source: "iana",
		extensions: [
			"cdmid"
		]
	},
		"application/cdmi-object": {
		source: "iana",
		extensions: [
			"cdmio"
		]
	},
		"application/cdmi-queue": {
		source: "iana",
		extensions: [
			"cdmiq"
		]
	},
		"application/cdni": {
		source: "iana"
	},
		"application/ce+cbor": {
		source: "iana"
	},
		"application/cea": {
		source: "iana"
	},
		"application/cea-2018+xml": {
		source: "iana",
		compressible: true
	},
		"application/cellml+xml": {
		source: "iana",
		compressible: true
	},
		"application/cfw": {
		source: "iana"
	},
		"application/cid-edhoc+cbor-seq": {
		source: "iana"
	},
		"application/city+json": {
		source: "iana",
		compressible: true
	},
		"application/city+json-seq": {
		source: "iana"
	},
		"application/clr": {
		source: "iana"
	},
		"application/clue+xml": {
		source: "iana",
		compressible: true
	},
		"application/clue_info+xml": {
		source: "iana",
		compressible: true
	},
		"application/cms": {
		source: "iana"
	},
		"application/cnrp+xml": {
		source: "iana",
		compressible: true
	},
		"application/coap-eap": {
		source: "iana"
	},
		"application/coap-group+json": {
		source: "iana",
		compressible: true
	},
		"application/coap-payload": {
		source: "iana"
	},
		"application/commonground": {
		source: "iana"
	},
		"application/concise-problem-details+cbor": {
		source: "iana"
	},
		"application/conference-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/cose": {
		source: "iana"
	},
		"application/cose-key": {
		source: "iana"
	},
		"application/cose-key-set": {
		source: "iana"
	},
		"application/cose-x509": {
		source: "iana"
	},
		"application/cpl+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"cpl"
		]
	},
		"application/csrattrs": {
		source: "iana"
	},
		"application/csta+xml": {
		source: "iana",
		compressible: true
	},
		"application/cstadata+xml": {
		source: "iana",
		compressible: true
	},
		"application/csvm+json": {
		source: "iana",
		compressible: true
	},
		"application/cu-seeme": {
		source: "apache",
		extensions: [
			"cu"
		]
	},
		"application/cwl": {
		source: "iana",
		extensions: [
			"cwl"
		]
	},
		"application/cwl+json": {
		source: "iana",
		compressible: true
	},
		"application/cwl+yaml": {
		source: "iana"
	},
		"application/cwt": {
		source: "iana"
	},
		"application/cybercash": {
		source: "iana"
	},
		"application/dart": {
		compressible: true
	},
		"application/dash+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"mpd"
		]
	},
		"application/dash-patch+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"mpp"
		]
	},
		"application/dashdelta": {
		source: "iana"
	},
		"application/davmount+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"davmount"
		]
	},
		"application/dca-rft": {
		source: "iana"
	},
		"application/dcd": {
		source: "iana"
	},
		"application/dec-dx": {
		source: "iana"
	},
		"application/dialog-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/dicom": {
		source: "iana",
		extensions: [
			"dcm"
		]
	},
		"application/dicom+json": {
		source: "iana",
		compressible: true
	},
		"application/dicom+xml": {
		source: "iana",
		compressible: true
	},
		"application/dii": {
		source: "iana"
	},
		"application/dit": {
		source: "iana"
	},
		"application/dns": {
		source: "iana"
	},
		"application/dns+json": {
		source: "iana",
		compressible: true
	},
		"application/dns-message": {
		source: "iana"
	},
		"application/docbook+xml": {
		source: "apache",
		compressible: true,
		extensions: [
			"dbk"
		]
	},
		"application/dots+cbor": {
		source: "iana"
	},
		"application/dpop+jwt": {
		source: "iana"
	},
		"application/dskpp+xml": {
		source: "iana",
		compressible: true
	},
		"application/dssc+der": {
		source: "iana",
		extensions: [
			"dssc"
		]
	},
		"application/dssc+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xdssc"
		]
	},
		"application/dvcs": {
		source: "iana"
	},
		"application/eat+cwt": {
		source: "iana"
	},
		"application/eat+jwt": {
		source: "iana"
	},
		"application/eat-bun+cbor": {
		source: "iana"
	},
		"application/eat-bun+json": {
		source: "iana",
		compressible: true
	},
		"application/eat-ucs+cbor": {
		source: "iana"
	},
		"application/eat-ucs+json": {
		source: "iana",
		compressible: true
	},
		"application/ecmascript": {
		source: "apache",
		compressible: true,
		extensions: [
			"ecma"
		]
	},
		"application/edhoc+cbor-seq": {
		source: "iana"
	},
		"application/edi-consent": {
		source: "iana"
	},
		"application/edi-x12": {
		source: "iana",
		compressible: false
	},
		"application/edifact": {
		source: "iana",
		compressible: false
	},
		"application/efi": {
		source: "iana"
	},
		"application/elm+json": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/elm+xml": {
		source: "iana",
		compressible: true
	},
		"application/emergencycalldata.cap+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/emergencycalldata.comment+xml": {
		source: "iana",
		compressible: true
	},
		"application/emergencycalldata.control+xml": {
		source: "iana",
		compressible: true
	},
		"application/emergencycalldata.deviceinfo+xml": {
		source: "iana",
		compressible: true
	},
		"application/emergencycalldata.ecall.msd": {
		source: "iana"
	},
		"application/emergencycalldata.legacyesn+json": {
		source: "iana",
		compressible: true
	},
		"application/emergencycalldata.providerinfo+xml": {
		source: "iana",
		compressible: true
	},
		"application/emergencycalldata.serviceinfo+xml": {
		source: "iana",
		compressible: true
	},
		"application/emergencycalldata.subscriberinfo+xml": {
		source: "iana",
		compressible: true
	},
		"application/emergencycalldata.veds+xml": {
		source: "iana",
		compressible: true
	},
		"application/emma+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"emma"
		]
	},
		"application/emotionml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"emotionml"
		]
	},
		"application/encaprtp": {
		source: "iana"
	},
		"application/entity-statement+jwt": {
		source: "iana"
	},
		"application/epp+xml": {
		source: "iana",
		compressible: true
	},
		"application/epub+zip": {
		source: "iana",
		compressible: false,
		extensions: [
			"epub"
		]
	},
		"application/eshop": {
		source: "iana"
	},
		"application/exi": {
		source: "iana",
		extensions: [
			"exi"
		]
	},
		"application/expect-ct-report+json": {
		source: "iana",
		compressible: true
	},
		"application/express": {
		source: "iana",
		extensions: [
			"exp"
		]
	},
		"application/fastinfoset": {
		source: "iana"
	},
		"application/fastsoap": {
		source: "iana"
	},
		"application/fdf": {
		source: "iana",
		extensions: [
			"fdf"
		]
	},
		"application/fdt+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"fdt"
		]
	},
		"application/fhir+json": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/fhir+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/fido.trusted-apps+json": {
		compressible: true
	},
		"application/fits": {
		source: "iana"
	},
		"application/flexfec": {
		source: "iana"
	},
		"application/font-sfnt": {
		source: "iana"
	},
		"application/font-tdpfr": {
		source: "iana",
		extensions: [
			"pfr"
		]
	},
		"application/font-woff": {
		source: "iana",
		compressible: false
	},
		"application/framework-attributes+xml": {
		source: "iana",
		compressible: true
	},
		"application/geo+json": {
		source: "iana",
		compressible: true,
		extensions: [
			"geojson"
		]
	},
		"application/geo+json-seq": {
		source: "iana"
	},
		"application/geopackage+sqlite3": {
		source: "iana"
	},
		"application/geopose+json": {
		source: "iana",
		compressible: true
	},
		"application/geoxacml+json": {
		source: "iana",
		compressible: true
	},
		"application/geoxacml+xml": {
		source: "iana",
		compressible: true
	},
		"application/gltf-buffer": {
		source: "iana"
	},
		"application/gml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"gml"
		]
	},
		"application/gnap-binding-jws": {
		source: "iana"
	},
		"application/gnap-binding-jwsd": {
		source: "iana"
	},
		"application/gnap-binding-rotation-jws": {
		source: "iana"
	},
		"application/gnap-binding-rotation-jwsd": {
		source: "iana"
	},
		"application/gpx+xml": {
		source: "apache",
		compressible: true,
		extensions: [
			"gpx"
		]
	},
		"application/grib": {
		source: "iana"
	},
		"application/gxf": {
		source: "apache",
		extensions: [
			"gxf"
		]
	},
		"application/gzip": {
		source: "iana",
		compressible: false,
		extensions: [
			"gz"
		]
	},
		"application/h224": {
		source: "iana"
	},
		"application/held+xml": {
		source: "iana",
		compressible: true
	},
		"application/hjson": {
		extensions: [
			"hjson"
		]
	},
		"application/hl7v2+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/http": {
		source: "iana"
	},
		"application/hyperstudio": {
		source: "iana",
		extensions: [
			"stk"
		]
	},
		"application/ibe-key-request+xml": {
		source: "iana",
		compressible: true
	},
		"application/ibe-pkg-reply+xml": {
		source: "iana",
		compressible: true
	},
		"application/ibe-pp-data": {
		source: "iana"
	},
		"application/iges": {
		source: "iana"
	},
		"application/im-iscomposing+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/index": {
		source: "iana"
	},
		"application/index.cmd": {
		source: "iana"
	},
		"application/index.obj": {
		source: "iana"
	},
		"application/index.response": {
		source: "iana"
	},
		"application/index.vnd": {
		source: "iana"
	},
		"application/inkml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"ink",
			"inkml"
		]
	},
		"application/iotp": {
		source: "iana"
	},
		"application/ipfix": {
		source: "iana",
		extensions: [
			"ipfix"
		]
	},
		"application/ipp": {
		source: "iana"
	},
		"application/isup": {
		source: "iana"
	},
		"application/its+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"its"
		]
	},
		"application/java-archive": {
		source: "iana",
		compressible: false,
		extensions: [
			"jar",
			"war",
			"ear"
		]
	},
		"application/java-serialized-object": {
		source: "apache",
		compressible: false,
		extensions: [
			"ser"
		]
	},
		"application/java-vm": {
		source: "apache",
		compressible: false,
		extensions: [
			"class"
		]
	},
		"application/javascript": {
		source: "apache",
		charset: "UTF-8",
		compressible: true,
		extensions: [
			"js"
		]
	},
		"application/jf2feed+json": {
		source: "iana",
		compressible: true
	},
		"application/jose": {
		source: "iana"
	},
		"application/jose+json": {
		source: "iana",
		compressible: true
	},
		"application/jrd+json": {
		source: "iana",
		compressible: true
	},
		"application/jscalendar+json": {
		source: "iana",
		compressible: true
	},
		"application/jscontact+json": {
		source: "iana",
		compressible: true
	},
		"application/json": {
		source: "iana",
		charset: "UTF-8",
		compressible: true,
		extensions: [
			"json",
			"map"
		]
	},
		"application/json-patch+json": {
		source: "iana",
		compressible: true
	},
		"application/json-seq": {
		source: "iana"
	},
		"application/json5": {
		extensions: [
			"json5"
		]
	},
		"application/jsonml+json": {
		source: "apache",
		compressible: true,
		extensions: [
			"jsonml"
		]
	},
		"application/jsonpath": {
		source: "iana"
	},
		"application/jwk+json": {
		source: "iana",
		compressible: true
	},
		"application/jwk-set+json": {
		source: "iana",
		compressible: true
	},
		"application/jwk-set+jwt": {
		source: "iana"
	},
		"application/jwt": {
		source: "iana"
	},
		"application/kpml-request+xml": {
		source: "iana",
		compressible: true
	},
		"application/kpml-response+xml": {
		source: "iana",
		compressible: true
	},
		"application/ld+json": {
		source: "iana",
		compressible: true,
		extensions: [
			"jsonld"
		]
	},
		"application/lgr+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"lgr"
		]
	},
		"application/link-format": {
		source: "iana"
	},
		"application/linkset": {
		source: "iana"
	},
		"application/linkset+json": {
		source: "iana",
		compressible: true
	},
		"application/load-control+xml": {
		source: "iana",
		compressible: true
	},
		"application/logout+jwt": {
		source: "iana"
	},
		"application/lost+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"lostxml"
		]
	},
		"application/lostsync+xml": {
		source: "iana",
		compressible: true
	},
		"application/lpf+zip": {
		source: "iana",
		compressible: false
	},
		"application/lxf": {
		source: "iana"
	},
		"application/mac-binhex40": {
		source: "iana",
		extensions: [
			"hqx"
		]
	},
		"application/mac-compactpro": {
		source: "apache",
		extensions: [
			"cpt"
		]
	},
		"application/macwriteii": {
		source: "iana"
	},
		"application/mads+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"mads"
		]
	},
		"application/manifest+json": {
		source: "iana",
		charset: "UTF-8",
		compressible: true,
		extensions: [
			"webmanifest"
		]
	},
		"application/marc": {
		source: "iana",
		extensions: [
			"mrc"
		]
	},
		"application/marcxml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"mrcx"
		]
	},
		"application/mathematica": {
		source: "iana",
		extensions: [
			"ma",
			"nb",
			"mb"
		]
	},
		"application/mathml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"mathml"
		]
	},
		"application/mathml-content+xml": {
		source: "iana",
		compressible: true
	},
		"application/mathml-presentation+xml": {
		source: "iana",
		compressible: true
	},
		"application/mbms-associated-procedure-description+xml": {
		source: "iana",
		compressible: true
	},
		"application/mbms-deregister+xml": {
		source: "iana",
		compressible: true
	},
		"application/mbms-envelope+xml": {
		source: "iana",
		compressible: true
	},
		"application/mbms-msk+xml": {
		source: "iana",
		compressible: true
	},
		"application/mbms-msk-response+xml": {
		source: "iana",
		compressible: true
	},
		"application/mbms-protection-description+xml": {
		source: "iana",
		compressible: true
	},
		"application/mbms-reception-report+xml": {
		source: "iana",
		compressible: true
	},
		"application/mbms-register+xml": {
		source: "iana",
		compressible: true
	},
		"application/mbms-register-response+xml": {
		source: "iana",
		compressible: true
	},
		"application/mbms-schedule+xml": {
		source: "iana",
		compressible: true
	},
		"application/mbms-user-service-description+xml": {
		source: "iana",
		compressible: true
	},
		"application/mbox": {
		source: "iana",
		extensions: [
			"mbox"
		]
	},
		"application/media-policy-dataset+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"mpf"
		]
	},
		"application/media_control+xml": {
		source: "iana",
		compressible: true
	},
		"application/mediaservercontrol+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"mscml"
		]
	},
		"application/merge-patch+json": {
		source: "iana",
		compressible: true
	},
		"application/metalink+xml": {
		source: "apache",
		compressible: true,
		extensions: [
			"metalink"
		]
	},
		"application/metalink4+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"meta4"
		]
	},
		"application/mets+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"mets"
		]
	},
		"application/mf4": {
		source: "iana"
	},
		"application/mikey": {
		source: "iana"
	},
		"application/mipc": {
		source: "iana"
	},
		"application/missing-blocks+cbor-seq": {
		source: "iana"
	},
		"application/mmt-aei+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"maei"
		]
	},
		"application/mmt-usd+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"musd"
		]
	},
		"application/mods+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"mods"
		]
	},
		"application/moss-keys": {
		source: "iana"
	},
		"application/moss-signature": {
		source: "iana"
	},
		"application/mosskey-data": {
		source: "iana"
	},
		"application/mosskey-request": {
		source: "iana"
	},
		"application/mp21": {
		source: "iana",
		extensions: [
			"m21",
			"mp21"
		]
	},
		"application/mp4": {
		source: "iana",
		extensions: [
			"mp4",
			"mpg4",
			"mp4s",
			"m4p"
		]
	},
		"application/mpeg4-generic": {
		source: "iana"
	},
		"application/mpeg4-iod": {
		source: "iana"
	},
		"application/mpeg4-iod-xmt": {
		source: "iana"
	},
		"application/mrb-consumer+xml": {
		source: "iana",
		compressible: true
	},
		"application/mrb-publish+xml": {
		source: "iana",
		compressible: true
	},
		"application/msc-ivr+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/msc-mixer+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/msix": {
		compressible: false,
		extensions: [
			"msix"
		]
	},
		"application/msixbundle": {
		compressible: false,
		extensions: [
			"msixbundle"
		]
	},
		"application/msword": {
		source: "iana",
		compressible: false,
		extensions: [
			"doc",
			"dot"
		]
	},
		"application/mud+json": {
		source: "iana",
		compressible: true
	},
		"application/multipart-core": {
		source: "iana"
	},
		"application/mxf": {
		source: "iana",
		extensions: [
			"mxf"
		]
	},
		"application/n-quads": {
		source: "iana",
		extensions: [
			"nq"
		]
	},
		"application/n-triples": {
		source: "iana",
		extensions: [
			"nt"
		]
	},
		"application/nasdata": {
		source: "iana"
	},
		"application/news-checkgroups": {
		source: "iana",
		charset: "US-ASCII"
	},
		"application/news-groupinfo": {
		source: "iana",
		charset: "US-ASCII"
	},
		"application/news-transmission": {
		source: "iana"
	},
		"application/nlsml+xml": {
		source: "iana",
		compressible: true
	},
		"application/node": {
		source: "iana",
		extensions: [
			"cjs"
		]
	},
		"application/nss": {
		source: "iana"
	},
		"application/oauth-authz-req+jwt": {
		source: "iana"
	},
		"application/oblivious-dns-message": {
		source: "iana"
	},
		"application/ocsp-request": {
		source: "iana"
	},
		"application/ocsp-response": {
		source: "iana"
	},
		"application/octet-stream": {
		source: "iana",
		compressible: true,
		extensions: [
			"bin",
			"dms",
			"lrf",
			"mar",
			"so",
			"dist",
			"distz",
			"pkg",
			"bpk",
			"dump",
			"elc",
			"deploy",
			"exe",
			"dll",
			"deb",
			"dmg",
			"iso",
			"img",
			"msi",
			"msp",
			"msm",
			"buffer"
		]
	},
		"application/oda": {
		source: "iana",
		extensions: [
			"oda"
		]
	},
		"application/odm+xml": {
		source: "iana",
		compressible: true
	},
		"application/odx": {
		source: "iana"
	},
		"application/oebps-package+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"opf"
		]
	},
		"application/ogg": {
		source: "iana",
		compressible: false,
		extensions: [
			"ogx"
		]
	},
		"application/ohttp-keys": {
		source: "iana"
	},
		"application/omdoc+xml": {
		source: "apache",
		compressible: true,
		extensions: [
			"omdoc"
		]
	},
		"application/onenote": {
		source: "apache",
		extensions: [
			"onetoc",
			"onetoc2",
			"onetmp",
			"onepkg",
			"one",
			"onea"
		]
	},
		"application/opc-nodeset+xml": {
		source: "iana",
		compressible: true
	},
		"application/oscore": {
		source: "iana"
	},
		"application/oxps": {
		source: "iana",
		extensions: [
			"oxps"
		]
	},
		"application/p21": {
		source: "iana"
	},
		"application/p21+zip": {
		source: "iana",
		compressible: false
	},
		"application/p2p-overlay+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"relo"
		]
	},
		"application/parityfec": {
		source: "iana"
	},
		"application/passport": {
		source: "iana"
	},
		"application/patch-ops-error+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xer"
		]
	},
		"application/pdf": {
		source: "iana",
		compressible: false,
		extensions: [
			"pdf"
		]
	},
		"application/pdx": {
		source: "iana"
	},
		"application/pem-certificate-chain": {
		source: "iana"
	},
		"application/pgp-encrypted": {
		source: "iana",
		compressible: false,
		extensions: [
			"pgp"
		]
	},
		"application/pgp-keys": {
		source: "iana",
		extensions: [
			"asc"
		]
	},
		"application/pgp-signature": {
		source: "iana",
		extensions: [
			"sig",
			"asc"
		]
	},
		"application/pics-rules": {
		source: "apache",
		extensions: [
			"prf"
		]
	},
		"application/pidf+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/pidf-diff+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/pkcs10": {
		source: "iana",
		extensions: [
			"p10"
		]
	},
		"application/pkcs12": {
		source: "iana"
	},
		"application/pkcs7-mime": {
		source: "iana",
		extensions: [
			"p7m",
			"p7c"
		]
	},
		"application/pkcs7-signature": {
		source: "iana",
		extensions: [
			"p7s"
		]
	},
		"application/pkcs8": {
		source: "iana",
		extensions: [
			"p8"
		]
	},
		"application/pkcs8-encrypted": {
		source: "iana"
	},
		"application/pkix-attr-cert": {
		source: "iana",
		extensions: [
			"ac"
		]
	},
		"application/pkix-cert": {
		source: "iana",
		extensions: [
			"cer"
		]
	},
		"application/pkix-crl": {
		source: "iana",
		extensions: [
			"crl"
		]
	},
		"application/pkix-pkipath": {
		source: "iana",
		extensions: [
			"pkipath"
		]
	},
		"application/pkixcmp": {
		source: "iana",
		extensions: [
			"pki"
		]
	},
		"application/pls+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"pls"
		]
	},
		"application/poc-settings+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/postscript": {
		source: "iana",
		compressible: true,
		extensions: [
			"ai",
			"eps",
			"ps"
		]
	},
		"application/ppsp-tracker+json": {
		source: "iana",
		compressible: true
	},
		"application/private-token-issuer-directory": {
		source: "iana"
	},
		"application/private-token-request": {
		source: "iana"
	},
		"application/private-token-response": {
		source: "iana"
	},
		"application/problem+json": {
		source: "iana",
		compressible: true
	},
		"application/problem+xml": {
		source: "iana",
		compressible: true
	},
		"application/provenance+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"provx"
		]
	},
		"application/provided-claims+jwt": {
		source: "iana"
	},
		"application/prs.alvestrand.titrax-sheet": {
		source: "iana"
	},
		"application/prs.cww": {
		source: "iana",
		extensions: [
			"cww"
		]
	},
		"application/prs.cyn": {
		source: "iana",
		charset: "7-BIT"
	},
		"application/prs.hpub+zip": {
		source: "iana",
		compressible: false
	},
		"application/prs.implied-document+xml": {
		source: "iana",
		compressible: true
	},
		"application/prs.implied-executable": {
		source: "iana"
	},
		"application/prs.implied-object+json": {
		source: "iana",
		compressible: true
	},
		"application/prs.implied-object+json-seq": {
		source: "iana"
	},
		"application/prs.implied-object+yaml": {
		source: "iana"
	},
		"application/prs.implied-structure": {
		source: "iana"
	},
		"application/prs.mayfile": {
		source: "iana"
	},
		"application/prs.nprend": {
		source: "iana"
	},
		"application/prs.plucker": {
		source: "iana"
	},
		"application/prs.rdf-xml-crypt": {
		source: "iana"
	},
		"application/prs.vcfbzip2": {
		source: "iana"
	},
		"application/prs.xsf+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xsf"
		]
	},
		"application/pskc+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"pskcxml"
		]
	},
		"application/pvd+json": {
		source: "iana",
		compressible: true
	},
		"application/qsig": {
		source: "iana"
	},
		"application/raml+yaml": {
		compressible: true,
		extensions: [
			"raml"
		]
	},
		"application/raptorfec": {
		source: "iana"
	},
		"application/rdap+json": {
		source: "iana",
		compressible: true
	},
		"application/rdf+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"rdf",
			"owl"
		]
	},
		"application/reginfo+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"rif"
		]
	},
		"application/relax-ng-compact-syntax": {
		source: "iana",
		extensions: [
			"rnc"
		]
	},
		"application/remote-printing": {
		source: "apache"
	},
		"application/reputon+json": {
		source: "iana",
		compressible: true
	},
		"application/resolve-response+jwt": {
		source: "iana"
	},
		"application/resource-lists+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"rl"
		]
	},
		"application/resource-lists-diff+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"rld"
		]
	},
		"application/rfc+xml": {
		source: "iana",
		compressible: true
	},
		"application/riscos": {
		source: "iana"
	},
		"application/rlmi+xml": {
		source: "iana",
		compressible: true
	},
		"application/rls-services+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"rs"
		]
	},
		"application/route-apd+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"rapd"
		]
	},
		"application/route-s-tsid+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"sls"
		]
	},
		"application/route-usd+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"rusd"
		]
	},
		"application/rpki-checklist": {
		source: "iana"
	},
		"application/rpki-ghostbusters": {
		source: "iana",
		extensions: [
			"gbr"
		]
	},
		"application/rpki-manifest": {
		source: "iana",
		extensions: [
			"mft"
		]
	},
		"application/rpki-publication": {
		source: "iana"
	},
		"application/rpki-roa": {
		source: "iana",
		extensions: [
			"roa"
		]
	},
		"application/rpki-signed-tal": {
		source: "iana"
	},
		"application/rpki-updown": {
		source: "iana"
	},
		"application/rsd+xml": {
		source: "apache",
		compressible: true,
		extensions: [
			"rsd"
		]
	},
		"application/rss+xml": {
		source: "apache",
		compressible: true,
		extensions: [
			"rss"
		]
	},
		"application/rtf": {
		source: "iana",
		compressible: true,
		extensions: [
			"rtf"
		]
	},
		"application/rtploopback": {
		source: "iana"
	},
		"application/rtx": {
		source: "iana"
	},
		"application/samlassertion+xml": {
		source: "iana",
		compressible: true
	},
		"application/samlmetadata+xml": {
		source: "iana",
		compressible: true
	},
		"application/sarif+json": {
		source: "iana",
		compressible: true
	},
		"application/sarif-external-properties+json": {
		source: "iana",
		compressible: true
	},
		"application/sbe": {
		source: "iana"
	},
		"application/sbml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"sbml"
		]
	},
		"application/scaip+xml": {
		source: "iana",
		compressible: true
	},
		"application/scim+json": {
		source: "iana",
		compressible: true
	},
		"application/scvp-cv-request": {
		source: "iana",
		extensions: [
			"scq"
		]
	},
		"application/scvp-cv-response": {
		source: "iana",
		extensions: [
			"scs"
		]
	},
		"application/scvp-vp-request": {
		source: "iana",
		extensions: [
			"spq"
		]
	},
		"application/scvp-vp-response": {
		source: "iana",
		extensions: [
			"spp"
		]
	},
		"application/sdp": {
		source: "iana",
		extensions: [
			"sdp"
		]
	},
		"application/secevent+jwt": {
		source: "iana"
	},
		"application/senml+cbor": {
		source: "iana"
	},
		"application/senml+json": {
		source: "iana",
		compressible: true
	},
		"application/senml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"senmlx"
		]
	},
		"application/senml-etch+cbor": {
		source: "iana"
	},
		"application/senml-etch+json": {
		source: "iana",
		compressible: true
	},
		"application/senml-exi": {
		source: "iana"
	},
		"application/sensml+cbor": {
		source: "iana"
	},
		"application/sensml+json": {
		source: "iana",
		compressible: true
	},
		"application/sensml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"sensmlx"
		]
	},
		"application/sensml-exi": {
		source: "iana"
	},
		"application/sep+xml": {
		source: "iana",
		compressible: true
	},
		"application/sep-exi": {
		source: "iana"
	},
		"application/session-info": {
		source: "iana"
	},
		"application/set-payment": {
		source: "iana"
	},
		"application/set-payment-initiation": {
		source: "iana",
		extensions: [
			"setpay"
		]
	},
		"application/set-registration": {
		source: "iana"
	},
		"application/set-registration-initiation": {
		source: "iana",
		extensions: [
			"setreg"
		]
	},
		"application/sgml": {
		source: "iana"
	},
		"application/sgml-open-catalog": {
		source: "iana"
	},
		"application/shf+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"shf"
		]
	},
		"application/sieve": {
		source: "iana",
		extensions: [
			"siv",
			"sieve"
		]
	},
		"application/simple-filter+xml": {
		source: "iana",
		compressible: true
	},
		"application/simple-message-summary": {
		source: "iana"
	},
		"application/simplesymbolcontainer": {
		source: "iana"
	},
		"application/sipc": {
		source: "iana"
	},
		"application/slate": {
		source: "iana"
	},
		"application/smil": {
		source: "apache"
	},
		"application/smil+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"smi",
			"smil"
		]
	},
		"application/smpte336m": {
		source: "iana"
	},
		"application/soap+fastinfoset": {
		source: "iana"
	},
		"application/soap+xml": {
		source: "iana",
		compressible: true
	},
		"application/sparql-query": {
		source: "iana",
		extensions: [
			"rq"
		]
	},
		"application/sparql-results+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"srx"
		]
	},
		"application/spdx+json": {
		source: "iana",
		compressible: true
	},
		"application/spirits-event+xml": {
		source: "iana",
		compressible: true
	},
		"application/sql": {
		source: "iana",
		extensions: [
			"sql"
		]
	},
		"application/srgs": {
		source: "iana",
		extensions: [
			"gram"
		]
	},
		"application/srgs+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"grxml"
		]
	},
		"application/sru+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"sru"
		]
	},
		"application/ssdl+xml": {
		source: "apache",
		compressible: true,
		extensions: [
			"ssdl"
		]
	},
		"application/sslkeylogfile": {
		source: "iana"
	},
		"application/ssml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"ssml"
		]
	},
		"application/st2110-41": {
		source: "iana"
	},
		"application/stix+json": {
		source: "iana",
		compressible: true
	},
		"application/stratum": {
		source: "iana"
	},
		"application/swid+cbor": {
		source: "iana"
	},
		"application/swid+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"swidtag"
		]
	},
		"application/tamp-apex-update": {
		source: "iana"
	},
		"application/tamp-apex-update-confirm": {
		source: "iana"
	},
		"application/tamp-community-update": {
		source: "iana"
	},
		"application/tamp-community-update-confirm": {
		source: "iana"
	},
		"application/tamp-error": {
		source: "iana"
	},
		"application/tamp-sequence-adjust": {
		source: "iana"
	},
		"application/tamp-sequence-adjust-confirm": {
		source: "iana"
	},
		"application/tamp-status-query": {
		source: "iana"
	},
		"application/tamp-status-response": {
		source: "iana"
	},
		"application/tamp-update": {
		source: "iana"
	},
		"application/tamp-update-confirm": {
		source: "iana"
	},
		"application/tar": {
		compressible: true
	},
		"application/taxii+json": {
		source: "iana",
		compressible: true
	},
		"application/td+json": {
		source: "iana",
		compressible: true
	},
		"application/tei+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"tei",
			"teicorpus"
		]
	},
		"application/tetra_isi": {
		source: "iana"
	},
		"application/thraud+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"tfi"
		]
	},
		"application/timestamp-query": {
		source: "iana"
	},
		"application/timestamp-reply": {
		source: "iana"
	},
		"application/timestamped-data": {
		source: "iana",
		extensions: [
			"tsd"
		]
	},
		"application/tlsrpt+gzip": {
		source: "iana"
	},
		"application/tlsrpt+json": {
		source: "iana",
		compressible: true
	},
		"application/tm+json": {
		source: "iana",
		compressible: true
	},
		"application/tnauthlist": {
		source: "iana"
	},
		"application/toc+cbor": {
		source: "iana"
	},
		"application/token-introspection+jwt": {
		source: "iana"
	},
		"application/toml": {
		source: "iana",
		compressible: true,
		extensions: [
			"toml"
		]
	},
		"application/trickle-ice-sdpfrag": {
		source: "iana"
	},
		"application/trig": {
		source: "iana",
		extensions: [
			"trig"
		]
	},
		"application/trust-chain+json": {
		source: "iana",
		compressible: true
	},
		"application/trust-mark+jwt": {
		source: "iana"
	},
		"application/trust-mark-delegation+jwt": {
		source: "iana"
	},
		"application/ttml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"ttml"
		]
	},
		"application/tve-trigger": {
		source: "iana"
	},
		"application/tzif": {
		source: "iana"
	},
		"application/tzif-leap": {
		source: "iana"
	},
		"application/ubjson": {
		compressible: false,
		extensions: [
			"ubj"
		]
	},
		"application/uccs+cbor": {
		source: "iana"
	},
		"application/ujcs+json": {
		source: "iana",
		compressible: true
	},
		"application/ulpfec": {
		source: "iana"
	},
		"application/urc-grpsheet+xml": {
		source: "iana",
		compressible: true
	},
		"application/urc-ressheet+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"rsheet"
		]
	},
		"application/urc-targetdesc+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"td"
		]
	},
		"application/urc-uisocketdesc+xml": {
		source: "iana",
		compressible: true
	},
		"application/vc": {
		source: "iana"
	},
		"application/vc+cose": {
		source: "iana"
	},
		"application/vc+jwt": {
		source: "iana"
	},
		"application/vcard+json": {
		source: "iana",
		compressible: true
	},
		"application/vcard+xml": {
		source: "iana",
		compressible: true
	},
		"application/vemmi": {
		source: "iana"
	},
		"application/vividence.scriptfile": {
		source: "apache"
	},
		"application/vnd.1000minds.decision-model+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"1km"
		]
	},
		"application/vnd.1ob": {
		source: "iana"
	},
		"application/vnd.3gpp-prose+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp-prose-pc3a+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp-prose-pc3ach+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp-prose-pc3ch+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp-prose-pc8+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp-v2x-local-service-information": {
		source: "iana"
	},
		"application/vnd.3gpp.5gnas": {
		source: "iana"
	},
		"application/vnd.3gpp.5gsa2x": {
		source: "iana"
	},
		"application/vnd.3gpp.5gsa2x-local-service-information": {
		source: "iana"
	},
		"application/vnd.3gpp.5gsv2x": {
		source: "iana"
	},
		"application/vnd.3gpp.5gsv2x-local-service-information": {
		source: "iana"
	},
		"application/vnd.3gpp.access-transfer-events+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.bsf+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.crs+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.current-location-discovery+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.gmop+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.gtpc": {
		source: "iana"
	},
		"application/vnd.3gpp.interworking-data": {
		source: "iana"
	},
		"application/vnd.3gpp.lpp": {
		source: "iana"
	},
		"application/vnd.3gpp.mc-signalling-ear": {
		source: "iana"
	},
		"application/vnd.3gpp.mcdata-affiliation-command+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcdata-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcdata-msgstore-ctrl-request+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcdata-payload": {
		source: "iana"
	},
		"application/vnd.3gpp.mcdata-regroup+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcdata-service-config+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcdata-signalling": {
		source: "iana"
	},
		"application/vnd.3gpp.mcdata-ue-config+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcdata-user-profile+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcptt-affiliation-command+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcptt-floor-request+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcptt-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcptt-location-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcptt-regroup+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcptt-service-config+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcptt-signed+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcptt-ue-config+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcptt-ue-init-config+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcptt-user-profile+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcvideo-affiliation-command+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcvideo-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcvideo-location-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcvideo-regroup+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcvideo-service-config+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcvideo-transmission-request+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcvideo-ue-config+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mcvideo-user-profile+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.mid-call+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.ngap": {
		source: "iana"
	},
		"application/vnd.3gpp.pfcp": {
		source: "iana"
	},
		"application/vnd.3gpp.pic-bw-large": {
		source: "iana",
		extensions: [
			"plb"
		]
	},
		"application/vnd.3gpp.pic-bw-small": {
		source: "iana",
		extensions: [
			"psb"
		]
	},
		"application/vnd.3gpp.pic-bw-var": {
		source: "iana",
		extensions: [
			"pvb"
		]
	},
		"application/vnd.3gpp.pinapp-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.s1ap": {
		source: "iana"
	},
		"application/vnd.3gpp.seal-group-doc+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.seal-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.seal-location-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.seal-mbms-usage-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.seal-network-qos-management-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.seal-ue-config-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.seal-unicast-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.seal-user-profile-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.sms": {
		source: "iana"
	},
		"application/vnd.3gpp.sms+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.srvcc-ext+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.srvcc-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.state-and-event-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.ussd+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp.v2x": {
		source: "iana"
	},
		"application/vnd.3gpp.vae-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp2.bcmcsinfo+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.3gpp2.sms": {
		source: "iana"
	},
		"application/vnd.3gpp2.tcap": {
		source: "iana",
		extensions: [
			"tcap"
		]
	},
		"application/vnd.3lightssoftware.imagescal": {
		source: "iana"
	},
		"application/vnd.3m.post-it-notes": {
		source: "iana",
		extensions: [
			"pwn"
		]
	},
		"application/vnd.accpac.simply.aso": {
		source: "iana",
		extensions: [
			"aso"
		]
	},
		"application/vnd.accpac.simply.imp": {
		source: "iana",
		extensions: [
			"imp"
		]
	},
		"application/vnd.acm.addressxfer+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.acm.chatbot+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.acucobol": {
		source: "iana",
		extensions: [
			"acu"
		]
	},
		"application/vnd.acucorp": {
		source: "iana",
		extensions: [
			"atc",
			"acutc"
		]
	},
		"application/vnd.adobe.air-application-installer-package+zip": {
		source: "apache",
		compressible: false,
		extensions: [
			"air"
		]
	},
		"application/vnd.adobe.flash.movie": {
		source: "iana"
	},
		"application/vnd.adobe.formscentral.fcdt": {
		source: "iana",
		extensions: [
			"fcdt"
		]
	},
		"application/vnd.adobe.fxp": {
		source: "iana",
		extensions: [
			"fxp",
			"fxpl"
		]
	},
		"application/vnd.adobe.partial-upload": {
		source: "iana"
	},
		"application/vnd.adobe.xdp+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xdp"
		]
	},
		"application/vnd.adobe.xfdf": {
		source: "apache",
		extensions: [
			"xfdf"
		]
	},
		"application/vnd.aether.imp": {
		source: "iana"
	},
		"application/vnd.afpc.afplinedata": {
		source: "iana"
	},
		"application/vnd.afpc.afplinedata-pagedef": {
		source: "iana"
	},
		"application/vnd.afpc.cmoca-cmresource": {
		source: "iana"
	},
		"application/vnd.afpc.foca-charset": {
		source: "iana"
	},
		"application/vnd.afpc.foca-codedfont": {
		source: "iana"
	},
		"application/vnd.afpc.foca-codepage": {
		source: "iana"
	},
		"application/vnd.afpc.modca": {
		source: "iana"
	},
		"application/vnd.afpc.modca-cmtable": {
		source: "iana"
	},
		"application/vnd.afpc.modca-formdef": {
		source: "iana"
	},
		"application/vnd.afpc.modca-mediummap": {
		source: "iana"
	},
		"application/vnd.afpc.modca-objectcontainer": {
		source: "iana"
	},
		"application/vnd.afpc.modca-overlay": {
		source: "iana"
	},
		"application/vnd.afpc.modca-pagesegment": {
		source: "iana"
	},
		"application/vnd.age": {
		source: "iana",
		extensions: [
			"age"
		]
	},
		"application/vnd.ah-barcode": {
		source: "apache"
	},
		"application/vnd.ahead.space": {
		source: "iana",
		extensions: [
			"ahead"
		]
	},
		"application/vnd.airzip.filesecure.azf": {
		source: "iana",
		extensions: [
			"azf"
		]
	},
		"application/vnd.airzip.filesecure.azs": {
		source: "iana",
		extensions: [
			"azs"
		]
	},
		"application/vnd.amadeus+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.amazon.ebook": {
		source: "apache",
		extensions: [
			"azw"
		]
	},
		"application/vnd.amazon.mobi8-ebook": {
		source: "iana"
	},
		"application/vnd.americandynamics.acc": {
		source: "iana",
		extensions: [
			"acc"
		]
	},
		"application/vnd.amiga.ami": {
		source: "iana",
		extensions: [
			"ami"
		]
	},
		"application/vnd.amundsen.maze+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.android.ota": {
		source: "iana"
	},
		"application/vnd.android.package-archive": {
		source: "apache",
		compressible: false,
		extensions: [
			"apk"
		]
	},
		"application/vnd.anki": {
		source: "iana"
	},
		"application/vnd.anser-web-certificate-issue-initiation": {
		source: "iana",
		extensions: [
			"cii"
		]
	},
		"application/vnd.anser-web-funds-transfer-initiation": {
		source: "apache",
		extensions: [
			"fti"
		]
	},
		"application/vnd.antix.game-component": {
		source: "iana",
		extensions: [
			"atx"
		]
	},
		"application/vnd.apache.arrow.file": {
		source: "iana"
	},
		"application/vnd.apache.arrow.stream": {
		source: "iana"
	},
		"application/vnd.apache.parquet": {
		source: "iana"
	},
		"application/vnd.apache.thrift.binary": {
		source: "iana"
	},
		"application/vnd.apache.thrift.compact": {
		source: "iana"
	},
		"application/vnd.apache.thrift.json": {
		source: "iana"
	},
		"application/vnd.apexlang": {
		source: "iana"
	},
		"application/vnd.api+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.aplextor.warrp+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.apothekende.reservation+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.apple.installer+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"mpkg"
		]
	},
		"application/vnd.apple.keynote": {
		source: "iana",
		extensions: [
			"key"
		]
	},
		"application/vnd.apple.mpegurl": {
		source: "iana",
		extensions: [
			"m3u8"
		]
	},
		"application/vnd.apple.numbers": {
		source: "iana",
		extensions: [
			"numbers"
		]
	},
		"application/vnd.apple.pages": {
		source: "iana",
		extensions: [
			"pages"
		]
	},
		"application/vnd.apple.pkpass": {
		compressible: false,
		extensions: [
			"pkpass"
		]
	},
		"application/vnd.arastra.swi": {
		source: "apache"
	},
		"application/vnd.aristanetworks.swi": {
		source: "iana",
		extensions: [
			"swi"
		]
	},
		"application/vnd.artisan+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.artsquare": {
		source: "iana"
	},
		"application/vnd.astraea-software.iota": {
		source: "iana",
		extensions: [
			"iota"
		]
	},
		"application/vnd.audiograph": {
		source: "iana",
		extensions: [
			"aep"
		]
	},
		"application/vnd.autodesk.fbx": {
		extensions: [
			"fbx"
		]
	},
		"application/vnd.autopackage": {
		source: "iana"
	},
		"application/vnd.avalon+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.avistar+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.balsamiq.bmml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"bmml"
		]
	},
		"application/vnd.balsamiq.bmpr": {
		source: "iana"
	},
		"application/vnd.banana-accounting": {
		source: "iana"
	},
		"application/vnd.bbf.usp.error": {
		source: "iana"
	},
		"application/vnd.bbf.usp.msg": {
		source: "iana"
	},
		"application/vnd.bbf.usp.msg+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.bekitzur-stech+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.belightsoft.lhzd+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.belightsoft.lhzl+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.bint.med-content": {
		source: "iana"
	},
		"application/vnd.biopax.rdf+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.blink-idb-value-wrapper": {
		source: "iana"
	},
		"application/vnd.blueice.multipass": {
		source: "iana",
		extensions: [
			"mpm"
		]
	},
		"application/vnd.bluetooth.ep.oob": {
		source: "iana"
	},
		"application/vnd.bluetooth.le.oob": {
		source: "iana"
	},
		"application/vnd.bmi": {
		source: "iana",
		extensions: [
			"bmi"
		]
	},
		"application/vnd.bpf": {
		source: "iana"
	},
		"application/vnd.bpf3": {
		source: "iana"
	},
		"application/vnd.businessobjects": {
		source: "iana",
		extensions: [
			"rep"
		]
	},
		"application/vnd.byu.uapi+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.bzip3": {
		source: "iana"
	},
		"application/vnd.c3voc.schedule+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.cab-jscript": {
		source: "iana"
	},
		"application/vnd.canon-cpdl": {
		source: "iana"
	},
		"application/vnd.canon-lips": {
		source: "iana"
	},
		"application/vnd.capasystems-pg+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.cendio.thinlinc.clientconf": {
		source: "iana"
	},
		"application/vnd.century-systems.tcp_stream": {
		source: "iana"
	},
		"application/vnd.chemdraw+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"cdxml"
		]
	},
		"application/vnd.chess-pgn": {
		source: "iana"
	},
		"application/vnd.chipnuts.karaoke-mmd": {
		source: "iana",
		extensions: [
			"mmd"
		]
	},
		"application/vnd.ciedi": {
		source: "iana"
	},
		"application/vnd.cinderella": {
		source: "iana",
		extensions: [
			"cdy"
		]
	},
		"application/vnd.cirpack.isdn-ext": {
		source: "iana"
	},
		"application/vnd.citationstyles.style+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"csl"
		]
	},
		"application/vnd.claymore": {
		source: "iana",
		extensions: [
			"cla"
		]
	},
		"application/vnd.cloanto.rp9": {
		source: "iana",
		extensions: [
			"rp9"
		]
	},
		"application/vnd.clonk.c4group": {
		source: "iana",
		extensions: [
			"c4g",
			"c4d",
			"c4f",
			"c4p",
			"c4u"
		]
	},
		"application/vnd.cluetrust.cartomobile-config": {
		source: "iana",
		extensions: [
			"c11amc"
		]
	},
		"application/vnd.cluetrust.cartomobile-config-pkg": {
		source: "iana",
		extensions: [
			"c11amz"
		]
	},
		"application/vnd.cncf.helm.chart.content.v1.tar+gzip": {
		source: "iana"
	},
		"application/vnd.cncf.helm.chart.provenance.v1.prov": {
		source: "iana"
	},
		"application/vnd.cncf.helm.config.v1+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.coffeescript": {
		source: "iana"
	},
		"application/vnd.collabio.xodocuments.document": {
		source: "iana"
	},
		"application/vnd.collabio.xodocuments.document-template": {
		source: "iana"
	},
		"application/vnd.collabio.xodocuments.presentation": {
		source: "iana"
	},
		"application/vnd.collabio.xodocuments.presentation-template": {
		source: "iana"
	},
		"application/vnd.collabio.xodocuments.spreadsheet": {
		source: "iana"
	},
		"application/vnd.collabio.xodocuments.spreadsheet-template": {
		source: "iana"
	},
		"application/vnd.collection+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.collection.doc+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.collection.next+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.comicbook+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.comicbook-rar": {
		source: "iana"
	},
		"application/vnd.commerce-battelle": {
		source: "iana"
	},
		"application/vnd.commonspace": {
		source: "iana",
		extensions: [
			"csp"
		]
	},
		"application/vnd.contact.cmsg": {
		source: "iana",
		extensions: [
			"cdbcmsg"
		]
	},
		"application/vnd.coreos.ignition+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.cosmocaller": {
		source: "iana",
		extensions: [
			"cmc"
		]
	},
		"application/vnd.crick.clicker": {
		source: "iana",
		extensions: [
			"clkx"
		]
	},
		"application/vnd.crick.clicker.keyboard": {
		source: "iana",
		extensions: [
			"clkk"
		]
	},
		"application/vnd.crick.clicker.palette": {
		source: "iana",
		extensions: [
			"clkp"
		]
	},
		"application/vnd.crick.clicker.template": {
		source: "iana",
		extensions: [
			"clkt"
		]
	},
		"application/vnd.crick.clicker.wordbank": {
		source: "iana",
		extensions: [
			"clkw"
		]
	},
		"application/vnd.criticaltools.wbs+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"wbs"
		]
	},
		"application/vnd.cryptii.pipe+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.crypto-shade-file": {
		source: "iana"
	},
		"application/vnd.cryptomator.encrypted": {
		source: "iana"
	},
		"application/vnd.cryptomator.vault": {
		source: "iana"
	},
		"application/vnd.ctc-posml": {
		source: "iana",
		extensions: [
			"pml"
		]
	},
		"application/vnd.ctct.ws+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.cups-pdf": {
		source: "iana"
	},
		"application/vnd.cups-postscript": {
		source: "iana"
	},
		"application/vnd.cups-ppd": {
		source: "iana",
		extensions: [
			"ppd"
		]
	},
		"application/vnd.cups-raster": {
		source: "iana"
	},
		"application/vnd.cups-raw": {
		source: "iana"
	},
		"application/vnd.curl": {
		source: "iana"
	},
		"application/vnd.curl.car": {
		source: "apache",
		extensions: [
			"car"
		]
	},
		"application/vnd.curl.pcurl": {
		source: "apache",
		extensions: [
			"pcurl"
		]
	},
		"application/vnd.cyan.dean.root+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.cybank": {
		source: "iana"
	},
		"application/vnd.cyclonedx+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.cyclonedx+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.d2l.coursepackage1p0+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.d3m-dataset": {
		source: "iana"
	},
		"application/vnd.d3m-problem": {
		source: "iana"
	},
		"application/vnd.dart": {
		source: "iana",
		compressible: true,
		extensions: [
			"dart"
		]
	},
		"application/vnd.data-vision.rdz": {
		source: "iana",
		extensions: [
			"rdz"
		]
	},
		"application/vnd.datalog": {
		source: "iana"
	},
		"application/vnd.datapackage+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.dataresource+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.dbf": {
		source: "iana",
		extensions: [
			"dbf"
		]
	},
		"application/vnd.dcmp+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"dcmp"
		]
	},
		"application/vnd.debian.binary-package": {
		source: "iana"
	},
		"application/vnd.dece.data": {
		source: "iana",
		extensions: [
			"uvf",
			"uvvf",
			"uvd",
			"uvvd"
		]
	},
		"application/vnd.dece.ttml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"uvt",
			"uvvt"
		]
	},
		"application/vnd.dece.unspecified": {
		source: "iana",
		extensions: [
			"uvx",
			"uvvx"
		]
	},
		"application/vnd.dece.zip": {
		source: "iana",
		extensions: [
			"uvz",
			"uvvz"
		]
	},
		"application/vnd.denovo.fcselayout-link": {
		source: "iana",
		extensions: [
			"fe_launch"
		]
	},
		"application/vnd.desmume.movie": {
		source: "iana"
	},
		"application/vnd.dir-bi.plate-dl-nosuffix": {
		source: "iana"
	},
		"application/vnd.dm.delegation+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.dna": {
		source: "iana",
		extensions: [
			"dna"
		]
	},
		"application/vnd.document+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.dolby.mlp": {
		source: "apache",
		extensions: [
			"mlp"
		]
	},
		"application/vnd.dolby.mobile.1": {
		source: "iana"
	},
		"application/vnd.dolby.mobile.2": {
		source: "iana"
	},
		"application/vnd.doremir.scorecloud-binary-document": {
		source: "iana"
	},
		"application/vnd.dpgraph": {
		source: "iana",
		extensions: [
			"dpg"
		]
	},
		"application/vnd.dreamfactory": {
		source: "iana",
		extensions: [
			"dfac"
		]
	},
		"application/vnd.drive+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.ds-keypoint": {
		source: "apache",
		extensions: [
			"kpxx"
		]
	},
		"application/vnd.dtg.local": {
		source: "iana"
	},
		"application/vnd.dtg.local.flash": {
		source: "iana"
	},
		"application/vnd.dtg.local.html": {
		source: "iana"
	},
		"application/vnd.dvb.ait": {
		source: "iana",
		extensions: [
			"ait"
		]
	},
		"application/vnd.dvb.dvbisl+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.dvb.dvbj": {
		source: "iana"
	},
		"application/vnd.dvb.esgcontainer": {
		source: "iana"
	},
		"application/vnd.dvb.ipdcdftnotifaccess": {
		source: "iana"
	},
		"application/vnd.dvb.ipdcesgaccess": {
		source: "iana"
	},
		"application/vnd.dvb.ipdcesgaccess2": {
		source: "iana"
	},
		"application/vnd.dvb.ipdcesgpdd": {
		source: "iana"
	},
		"application/vnd.dvb.ipdcroaming": {
		source: "iana"
	},
		"application/vnd.dvb.iptv.alfec-base": {
		source: "iana"
	},
		"application/vnd.dvb.iptv.alfec-enhancement": {
		source: "iana"
	},
		"application/vnd.dvb.notif-aggregate-root+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.dvb.notif-container+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.dvb.notif-generic+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.dvb.notif-ia-msglist+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.dvb.notif-ia-registration-request+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.dvb.notif-ia-registration-response+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.dvb.notif-init+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.dvb.pfr": {
		source: "iana"
	},
		"application/vnd.dvb.service": {
		source: "iana",
		extensions: [
			"svc"
		]
	},
		"application/vnd.dxr": {
		source: "iana"
	},
		"application/vnd.dynageo": {
		source: "iana",
		extensions: [
			"geo"
		]
	},
		"application/vnd.dzr": {
		source: "iana"
	},
		"application/vnd.easykaraoke.cdgdownload": {
		source: "iana"
	},
		"application/vnd.ecdis-update": {
		source: "iana"
	},
		"application/vnd.ecip.rlp": {
		source: "iana"
	},
		"application/vnd.eclipse.ditto+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.ecowin.chart": {
		source: "iana",
		extensions: [
			"mag"
		]
	},
		"application/vnd.ecowin.filerequest": {
		source: "iana"
	},
		"application/vnd.ecowin.fileupdate": {
		source: "iana"
	},
		"application/vnd.ecowin.series": {
		source: "iana"
	},
		"application/vnd.ecowin.seriesrequest": {
		source: "iana"
	},
		"application/vnd.ecowin.seriesupdate": {
		source: "iana"
	},
		"application/vnd.efi.img": {
		source: "iana"
	},
		"application/vnd.efi.iso": {
		source: "iana"
	},
		"application/vnd.eln+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.emclient.accessrequest+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.enliven": {
		source: "iana",
		extensions: [
			"nml"
		]
	},
		"application/vnd.enphase.envoy": {
		source: "iana"
	},
		"application/vnd.eprints.data+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.epson.esf": {
		source: "iana",
		extensions: [
			"esf"
		]
	},
		"application/vnd.epson.msf": {
		source: "iana",
		extensions: [
			"msf"
		]
	},
		"application/vnd.epson.quickanime": {
		source: "iana",
		extensions: [
			"qam"
		]
	},
		"application/vnd.epson.salt": {
		source: "iana",
		extensions: [
			"slt"
		]
	},
		"application/vnd.epson.ssf": {
		source: "iana",
		extensions: [
			"ssf"
		]
	},
		"application/vnd.ericsson.quickcall": {
		source: "iana"
	},
		"application/vnd.erofs": {
		source: "iana"
	},
		"application/vnd.espass-espass+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.eszigno3+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"es3",
			"et3"
		]
	},
		"application/vnd.etsi.aoc+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.asic-e+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.etsi.asic-s+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.etsi.cug+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.iptvcommand+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.iptvdiscovery+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.iptvprofile+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.iptvsad-bc+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.iptvsad-cod+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.iptvsad-npvr+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.iptvservice+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.iptvsync+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.iptvueprofile+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.mcid+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.mheg5": {
		source: "iana"
	},
		"application/vnd.etsi.overload-control-policy-dataset+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.pstn+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.sci+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.simservs+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.timestamp-token": {
		source: "iana"
	},
		"application/vnd.etsi.tsl+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.etsi.tsl.der": {
		source: "iana"
	},
		"application/vnd.eu.kasparian.car+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.eudora.data": {
		source: "iana"
	},
		"application/vnd.evolv.ecig.profile": {
		source: "iana"
	},
		"application/vnd.evolv.ecig.settings": {
		source: "iana"
	},
		"application/vnd.evolv.ecig.theme": {
		source: "iana"
	},
		"application/vnd.exstream-empower+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.exstream-package": {
		source: "iana"
	},
		"application/vnd.ezpix-album": {
		source: "iana",
		extensions: [
			"ez2"
		]
	},
		"application/vnd.ezpix-package": {
		source: "iana",
		extensions: [
			"ez3"
		]
	},
		"application/vnd.f-secure.mobile": {
		source: "iana"
	},
		"application/vnd.familysearch.gedcom+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.fastcopy-disk-image": {
		source: "iana"
	},
		"application/vnd.fdf": {
		source: "apache",
		extensions: [
			"fdf"
		]
	},
		"application/vnd.fdsn.mseed": {
		source: "iana",
		extensions: [
			"mseed"
		]
	},
		"application/vnd.fdsn.seed": {
		source: "iana",
		extensions: [
			"seed",
			"dataless"
		]
	},
		"application/vnd.fdsn.stationxml+xml": {
		source: "iana",
		charset: "XML-BASED",
		compressible: true
	},
		"application/vnd.ffsns": {
		source: "iana"
	},
		"application/vnd.ficlab.flb+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.filmit.zfc": {
		source: "iana"
	},
		"application/vnd.fints": {
		source: "iana"
	},
		"application/vnd.firemonkeys.cloudcell": {
		source: "iana"
	},
		"application/vnd.flographit": {
		source: "iana",
		extensions: [
			"gph"
		]
	},
		"application/vnd.fluxtime.clip": {
		source: "iana",
		extensions: [
			"ftc"
		]
	},
		"application/vnd.font-fontforge-sfd": {
		source: "iana"
	},
		"application/vnd.framemaker": {
		source: "iana",
		extensions: [
			"fm",
			"frame",
			"maker",
			"book"
		]
	},
		"application/vnd.freelog.comic": {
		source: "iana"
	},
		"application/vnd.frogans.fnc": {
		source: "apache",
		extensions: [
			"fnc"
		]
	},
		"application/vnd.frogans.ltf": {
		source: "apache",
		extensions: [
			"ltf"
		]
	},
		"application/vnd.fsc.weblaunch": {
		source: "iana",
		extensions: [
			"fsc"
		]
	},
		"application/vnd.fujifilm.fb.docuworks": {
		source: "iana"
	},
		"application/vnd.fujifilm.fb.docuworks.binder": {
		source: "iana"
	},
		"application/vnd.fujifilm.fb.docuworks.container": {
		source: "iana"
	},
		"application/vnd.fujifilm.fb.jfi+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.fujitsu.oasys": {
		source: "iana",
		extensions: [
			"oas"
		]
	},
		"application/vnd.fujitsu.oasys2": {
		source: "iana",
		extensions: [
			"oa2"
		]
	},
		"application/vnd.fujitsu.oasys3": {
		source: "iana",
		extensions: [
			"oa3"
		]
	},
		"application/vnd.fujitsu.oasysgp": {
		source: "iana",
		extensions: [
			"fg5"
		]
	},
		"application/vnd.fujitsu.oasysprs": {
		source: "iana",
		extensions: [
			"bh2"
		]
	},
		"application/vnd.fujixerox.art-ex": {
		source: "iana"
	},
		"application/vnd.fujixerox.art4": {
		source: "iana"
	},
		"application/vnd.fujixerox.ddd": {
		source: "iana",
		extensions: [
			"ddd"
		]
	},
		"application/vnd.fujixerox.docuworks": {
		source: "iana",
		extensions: [
			"xdw"
		]
	},
		"application/vnd.fujixerox.docuworks.binder": {
		source: "iana",
		extensions: [
			"xbd"
		]
	},
		"application/vnd.fujixerox.docuworks.container": {
		source: "iana"
	},
		"application/vnd.fujixerox.hbpl": {
		source: "iana"
	},
		"application/vnd.fut-misnet": {
		source: "iana"
	},
		"application/vnd.futoin+cbor": {
		source: "iana"
	},
		"application/vnd.futoin+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.fuzzysheet": {
		source: "iana",
		extensions: [
			"fzs"
		]
	},
		"application/vnd.ga4gh.passport+jwt": {
		source: "iana"
	},
		"application/vnd.genomatix.tuxedo": {
		source: "iana",
		extensions: [
			"txd"
		]
	},
		"application/vnd.genozip": {
		source: "iana"
	},
		"application/vnd.gentics.grd+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.gentoo.catmetadata+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.gentoo.ebuild": {
		source: "iana"
	},
		"application/vnd.gentoo.eclass": {
		source: "iana"
	},
		"application/vnd.gentoo.gpkg": {
		source: "iana"
	},
		"application/vnd.gentoo.manifest": {
		source: "iana"
	},
		"application/vnd.gentoo.pkgmetadata+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.gentoo.xpak": {
		source: "iana"
	},
		"application/vnd.geo+json": {
		source: "apache",
		compressible: true
	},
		"application/vnd.geocube+xml": {
		source: "apache",
		compressible: true
	},
		"application/vnd.geogebra.file": {
		source: "iana",
		extensions: [
			"ggb"
		]
	},
		"application/vnd.geogebra.pinboard": {
		source: "iana"
	},
		"application/vnd.geogebra.slides": {
		source: "iana",
		extensions: [
			"ggs"
		]
	},
		"application/vnd.geogebra.tool": {
		source: "iana",
		extensions: [
			"ggt"
		]
	},
		"application/vnd.geometry-explorer": {
		source: "iana",
		extensions: [
			"gex",
			"gre"
		]
	},
		"application/vnd.geonext": {
		source: "iana",
		extensions: [
			"gxt"
		]
	},
		"application/vnd.geoplan": {
		source: "iana",
		extensions: [
			"g2w"
		]
	},
		"application/vnd.geospace": {
		source: "iana",
		extensions: [
			"g3w"
		]
	},
		"application/vnd.gerber": {
		source: "iana"
	},
		"application/vnd.globalplatform.card-content-mgt": {
		source: "iana"
	},
		"application/vnd.globalplatform.card-content-mgt-response": {
		source: "iana"
	},
		"application/vnd.gmx": {
		source: "iana",
		extensions: [
			"gmx"
		]
	},
		"application/vnd.gnu.taler.exchange+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.gnu.taler.merchant+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.google-apps.audio": {
	},
		"application/vnd.google-apps.document": {
		compressible: false,
		extensions: [
			"gdoc"
		]
	},
		"application/vnd.google-apps.drawing": {
		compressible: false,
		extensions: [
			"gdraw"
		]
	},
		"application/vnd.google-apps.drive-sdk": {
		compressible: false
	},
		"application/vnd.google-apps.file": {
	},
		"application/vnd.google-apps.folder": {
		compressible: false
	},
		"application/vnd.google-apps.form": {
		compressible: false,
		extensions: [
			"gform"
		]
	},
		"application/vnd.google-apps.fusiontable": {
	},
		"application/vnd.google-apps.jam": {
		compressible: false,
		extensions: [
			"gjam"
		]
	},
		"application/vnd.google-apps.mail-layout": {
	},
		"application/vnd.google-apps.map": {
		compressible: false,
		extensions: [
			"gmap"
		]
	},
		"application/vnd.google-apps.photo": {
	},
		"application/vnd.google-apps.presentation": {
		compressible: false,
		extensions: [
			"gslides"
		]
	},
		"application/vnd.google-apps.script": {
		compressible: false,
		extensions: [
			"gscript"
		]
	},
		"application/vnd.google-apps.shortcut": {
	},
		"application/vnd.google-apps.site": {
		compressible: false,
		extensions: [
			"gsite"
		]
	},
		"application/vnd.google-apps.spreadsheet": {
		compressible: false,
		extensions: [
			"gsheet"
		]
	},
		"application/vnd.google-apps.unknown": {
	},
		"application/vnd.google-apps.video": {
	},
		"application/vnd.google-earth.kml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"kml"
		]
	},
		"application/vnd.google-earth.kmz": {
		source: "iana",
		compressible: false,
		extensions: [
			"kmz"
		]
	},
		"application/vnd.gov.sk.e-form+xml": {
		source: "apache",
		compressible: true
	},
		"application/vnd.gov.sk.e-form+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.gov.sk.xmldatacontainer+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xdcf"
		]
	},
		"application/vnd.gpxsee.map+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.grafeq": {
		source: "iana",
		extensions: [
			"gqf",
			"gqs"
		]
	},
		"application/vnd.gridmp": {
		source: "iana"
	},
		"application/vnd.groove-account": {
		source: "iana",
		extensions: [
			"gac"
		]
	},
		"application/vnd.groove-help": {
		source: "iana",
		extensions: [
			"ghf"
		]
	},
		"application/vnd.groove-identity-message": {
		source: "iana",
		extensions: [
			"gim"
		]
	},
		"application/vnd.groove-injector": {
		source: "iana",
		extensions: [
			"grv"
		]
	},
		"application/vnd.groove-tool-message": {
		source: "iana",
		extensions: [
			"gtm"
		]
	},
		"application/vnd.groove-tool-template": {
		source: "iana",
		extensions: [
			"tpl"
		]
	},
		"application/vnd.groove-vcard": {
		source: "iana",
		extensions: [
			"vcg"
		]
	},
		"application/vnd.hal+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.hal+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"hal"
		]
	},
		"application/vnd.handheld-entertainment+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"zmm"
		]
	},
		"application/vnd.hbci": {
		source: "iana",
		extensions: [
			"hbci"
		]
	},
		"application/vnd.hc+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.hcl-bireports": {
		source: "iana"
	},
		"application/vnd.hdt": {
		source: "iana"
	},
		"application/vnd.heroku+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.hhe.lesson-player": {
		source: "iana",
		extensions: [
			"les"
		]
	},
		"application/vnd.hp-hpgl": {
		source: "iana",
		extensions: [
			"hpgl"
		]
	},
		"application/vnd.hp-hpid": {
		source: "iana",
		extensions: [
			"hpid"
		]
	},
		"application/vnd.hp-hps": {
		source: "iana",
		extensions: [
			"hps"
		]
	},
		"application/vnd.hp-jlyt": {
		source: "iana",
		extensions: [
			"jlt"
		]
	},
		"application/vnd.hp-pcl": {
		source: "iana",
		extensions: [
			"pcl"
		]
	},
		"application/vnd.hp-pclxl": {
		source: "iana",
		extensions: [
			"pclxl"
		]
	},
		"application/vnd.hsl": {
		source: "iana"
	},
		"application/vnd.httphone": {
		source: "iana"
	},
		"application/vnd.hydrostatix.sof-data": {
		source: "iana",
		extensions: [
			"sfd-hdstx"
		]
	},
		"application/vnd.hyper+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.hyper-item+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.hyperdrive+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.hzn-3d-crossword": {
		source: "iana"
	},
		"application/vnd.ibm.afplinedata": {
		source: "apache"
	},
		"application/vnd.ibm.electronic-media": {
		source: "iana"
	},
		"application/vnd.ibm.minipay": {
		source: "iana",
		extensions: [
			"mpy"
		]
	},
		"application/vnd.ibm.modcap": {
		source: "apache",
		extensions: [
			"afp",
			"listafp",
			"list3820"
		]
	},
		"application/vnd.ibm.rights-management": {
		source: "iana",
		extensions: [
			"irm"
		]
	},
		"application/vnd.ibm.secure-container": {
		source: "iana",
		extensions: [
			"sc"
		]
	},
		"application/vnd.iccprofile": {
		source: "iana",
		extensions: [
			"icc",
			"icm"
		]
	},
		"application/vnd.ieee.1905": {
		source: "iana"
	},
		"application/vnd.igloader": {
		source: "iana",
		extensions: [
			"igl"
		]
	},
		"application/vnd.imagemeter.folder+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.imagemeter.image+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.immervision-ivp": {
		source: "iana",
		extensions: [
			"ivp"
		]
	},
		"application/vnd.immervision-ivu": {
		source: "iana",
		extensions: [
			"ivu"
		]
	},
		"application/vnd.ims.imsccv1p1": {
		source: "iana"
	},
		"application/vnd.ims.imsccv1p2": {
		source: "iana"
	},
		"application/vnd.ims.imsccv1p3": {
		source: "iana"
	},
		"application/vnd.ims.lis.v2.result+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.ims.lti.v2.toolconsumerprofile+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.ims.lti.v2.toolproxy+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.ims.lti.v2.toolproxy.id+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.ims.lti.v2.toolsettings+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.ims.lti.v2.toolsettings.simple+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.informedcontrol.rms+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.informix-visionary": {
		source: "apache"
	},
		"application/vnd.infotech.project": {
		source: "iana"
	},
		"application/vnd.infotech.project+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.innopath.wamp.notification": {
		source: "iana"
	},
		"application/vnd.insors.igm": {
		source: "iana",
		extensions: [
			"igm"
		]
	},
		"application/vnd.intercon.formnet": {
		source: "iana",
		extensions: [
			"xpw",
			"xpx"
		]
	},
		"application/vnd.intergeo": {
		source: "iana",
		extensions: [
			"i2g"
		]
	},
		"application/vnd.intertrust.digibox": {
		source: "iana"
	},
		"application/vnd.intertrust.nncp": {
		source: "iana"
	},
		"application/vnd.intu.qbo": {
		source: "iana",
		extensions: [
			"qbo"
		]
	},
		"application/vnd.intu.qfx": {
		source: "iana",
		extensions: [
			"qfx"
		]
	},
		"application/vnd.ipfs.ipns-record": {
		source: "iana"
	},
		"application/vnd.ipld.car": {
		source: "iana"
	},
		"application/vnd.ipld.dag-cbor": {
		source: "iana"
	},
		"application/vnd.ipld.dag-json": {
		source: "iana"
	},
		"application/vnd.ipld.raw": {
		source: "iana"
	},
		"application/vnd.iptc.g2.catalogitem+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.iptc.g2.conceptitem+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.iptc.g2.knowledgeitem+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.iptc.g2.newsitem+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.iptc.g2.newsmessage+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.iptc.g2.packageitem+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.iptc.g2.planningitem+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.ipunplugged.rcprofile": {
		source: "iana",
		extensions: [
			"rcprofile"
		]
	},
		"application/vnd.irepository.package+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"irp"
		]
	},
		"application/vnd.is-xpr": {
		source: "iana",
		extensions: [
			"xpr"
		]
	},
		"application/vnd.isac.fcs": {
		source: "iana",
		extensions: [
			"fcs"
		]
	},
		"application/vnd.iso11783-10+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.jam": {
		source: "iana",
		extensions: [
			"jam"
		]
	},
		"application/vnd.japannet-directory-service": {
		source: "iana"
	},
		"application/vnd.japannet-jpnstore-wakeup": {
		source: "iana"
	},
		"application/vnd.japannet-payment-wakeup": {
		source: "iana"
	},
		"application/vnd.japannet-registration": {
		source: "iana"
	},
		"application/vnd.japannet-registration-wakeup": {
		source: "iana"
	},
		"application/vnd.japannet-setstore-wakeup": {
		source: "iana"
	},
		"application/vnd.japannet-verification": {
		source: "iana"
	},
		"application/vnd.japannet-verification-wakeup": {
		source: "iana"
	},
		"application/vnd.jcp.javame.midlet-rms": {
		source: "iana",
		extensions: [
			"rms"
		]
	},
		"application/vnd.jisp": {
		source: "iana",
		extensions: [
			"jisp"
		]
	},
		"application/vnd.joost.joda-archive": {
		source: "iana",
		extensions: [
			"joda"
		]
	},
		"application/vnd.jsk.isdn-ngn": {
		source: "iana"
	},
		"application/vnd.kahootz": {
		source: "iana",
		extensions: [
			"ktz",
			"ktr"
		]
	},
		"application/vnd.kde.karbon": {
		source: "iana",
		extensions: [
			"karbon"
		]
	},
		"application/vnd.kde.kchart": {
		source: "iana",
		extensions: [
			"chrt"
		]
	},
		"application/vnd.kde.kformula": {
		source: "iana",
		extensions: [
			"kfo"
		]
	},
		"application/vnd.kde.kivio": {
		source: "iana",
		extensions: [
			"flw"
		]
	},
		"application/vnd.kde.kontour": {
		source: "iana",
		extensions: [
			"kon"
		]
	},
		"application/vnd.kde.kpresenter": {
		source: "iana",
		extensions: [
			"kpr",
			"kpt"
		]
	},
		"application/vnd.kde.kspread": {
		source: "iana",
		extensions: [
			"ksp"
		]
	},
		"application/vnd.kde.kword": {
		source: "iana",
		extensions: [
			"kwd",
			"kwt"
		]
	},
		"application/vnd.kdl": {
		source: "iana"
	},
		"application/vnd.kenameaapp": {
		source: "iana",
		extensions: [
			"htke"
		]
	},
		"application/vnd.keyman.kmp+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.keyman.kmx": {
		source: "iana"
	},
		"application/vnd.kidspiration": {
		source: "iana",
		extensions: [
			"kia"
		]
	},
		"application/vnd.kinar": {
		source: "iana",
		extensions: [
			"kne",
			"knp"
		]
	},
		"application/vnd.koan": {
		source: "iana",
		extensions: [
			"skp",
			"skd",
			"skt",
			"skm"
		]
	},
		"application/vnd.kodak-descriptor": {
		source: "iana",
		extensions: [
			"sse"
		]
	},
		"application/vnd.las": {
		source: "iana"
	},
		"application/vnd.las.las+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.las.las+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"lasxml"
		]
	},
		"application/vnd.laszip": {
		source: "iana"
	},
		"application/vnd.ldev.productlicensing": {
		source: "iana"
	},
		"application/vnd.leap+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.liberty-request+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.llamagraphics.life-balance.desktop": {
		source: "iana",
		extensions: [
			"lbd"
		]
	},
		"application/vnd.llamagraphics.life-balance.exchange+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"lbe"
		]
	},
		"application/vnd.logipipe.circuit+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.loom": {
		source: "iana"
	},
		"application/vnd.lotus-1-2-3": {
		source: "iana",
		extensions: [
			"123"
		]
	},
		"application/vnd.lotus-approach": {
		source: "iana",
		extensions: [
			"apr"
		]
	},
		"application/vnd.lotus-freelance": {
		source: "iana",
		extensions: [
			"pre"
		]
	},
		"application/vnd.lotus-notes": {
		source: "iana",
		extensions: [
			"nsf"
		]
	},
		"application/vnd.lotus-organizer": {
		source: "iana",
		extensions: [
			"org"
		]
	},
		"application/vnd.lotus-screencam": {
		source: "iana",
		extensions: [
			"scm"
		]
	},
		"application/vnd.lotus-wordpro": {
		source: "iana",
		extensions: [
			"lwp"
		]
	},
		"application/vnd.macports.portpkg": {
		source: "iana",
		extensions: [
			"portpkg"
		]
	},
		"application/vnd.mapbox-vector-tile": {
		source: "iana",
		extensions: [
			"mvt"
		]
	},
		"application/vnd.marlin.drm.actiontoken+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.marlin.drm.conftoken+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.marlin.drm.license+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.marlin.drm.mdcf": {
		source: "iana"
	},
		"application/vnd.mason+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.maxar.archive.3tz+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.maxmind.maxmind-db": {
		source: "iana"
	},
		"application/vnd.mcd": {
		source: "iana",
		extensions: [
			"mcd"
		]
	},
		"application/vnd.mdl": {
		source: "iana"
	},
		"application/vnd.mdl-mbsdf": {
		source: "iana"
	},
		"application/vnd.medcalcdata": {
		source: "iana",
		extensions: [
			"mc1"
		]
	},
		"application/vnd.mediastation.cdkey": {
		source: "iana",
		extensions: [
			"cdkey"
		]
	},
		"application/vnd.medicalholodeck.recordxr": {
		source: "iana"
	},
		"application/vnd.meridian-slingshot": {
		source: "iana"
	},
		"application/vnd.mermaid": {
		source: "iana"
	},
		"application/vnd.mfer": {
		source: "iana",
		extensions: [
			"mwf"
		]
	},
		"application/vnd.mfmp": {
		source: "iana",
		extensions: [
			"mfm"
		]
	},
		"application/vnd.micro+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.micrografx.flo": {
		source: "iana",
		extensions: [
			"flo"
		]
	},
		"application/vnd.micrografx.igx": {
		source: "iana",
		extensions: [
			"igx"
		]
	},
		"application/vnd.microsoft.portable-executable": {
		source: "iana"
	},
		"application/vnd.microsoft.windows.thumbnail-cache": {
		source: "iana"
	},
		"application/vnd.miele+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.mif": {
		source: "iana",
		extensions: [
			"mif"
		]
	},
		"application/vnd.minisoft-hp3000-save": {
		source: "iana"
	},
		"application/vnd.mitsubishi.misty-guard.trustweb": {
		source: "iana"
	},
		"application/vnd.mobius.daf": {
		source: "iana",
		extensions: [
			"daf"
		]
	},
		"application/vnd.mobius.dis": {
		source: "iana",
		extensions: [
			"dis"
		]
	},
		"application/vnd.mobius.mbk": {
		source: "iana",
		extensions: [
			"mbk"
		]
	},
		"application/vnd.mobius.mqy": {
		source: "iana",
		extensions: [
			"mqy"
		]
	},
		"application/vnd.mobius.msl": {
		source: "iana",
		extensions: [
			"msl"
		]
	},
		"application/vnd.mobius.plc": {
		source: "iana",
		extensions: [
			"plc"
		]
	},
		"application/vnd.mobius.txf": {
		source: "iana",
		extensions: [
			"txf"
		]
	},
		"application/vnd.modl": {
		source: "iana"
	},
		"application/vnd.mophun.application": {
		source: "iana",
		extensions: [
			"mpn"
		]
	},
		"application/vnd.mophun.certificate": {
		source: "iana",
		extensions: [
			"mpc"
		]
	},
		"application/vnd.motorola.flexsuite": {
		source: "iana"
	},
		"application/vnd.motorola.flexsuite.adsi": {
		source: "iana"
	},
		"application/vnd.motorola.flexsuite.fis": {
		source: "iana"
	},
		"application/vnd.motorola.flexsuite.gotap": {
		source: "iana"
	},
		"application/vnd.motorola.flexsuite.kmr": {
		source: "iana"
	},
		"application/vnd.motorola.flexsuite.ttc": {
		source: "iana"
	},
		"application/vnd.motorola.flexsuite.wem": {
		source: "iana"
	},
		"application/vnd.motorola.iprm": {
		source: "iana"
	},
		"application/vnd.mozilla.xul+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xul"
		]
	},
		"application/vnd.ms-3mfdocument": {
		source: "iana"
	},
		"application/vnd.ms-artgalry": {
		source: "iana",
		extensions: [
			"cil"
		]
	},
		"application/vnd.ms-asf": {
		source: "iana"
	},
		"application/vnd.ms-cab-compressed": {
		source: "iana",
		extensions: [
			"cab"
		]
	},
		"application/vnd.ms-color.iccprofile": {
		source: "apache"
	},
		"application/vnd.ms-excel": {
		source: "iana",
		compressible: false,
		extensions: [
			"xls",
			"xlm",
			"xla",
			"xlc",
			"xlt",
			"xlw"
		]
	},
		"application/vnd.ms-excel.addin.macroenabled.12": {
		source: "iana",
		extensions: [
			"xlam"
		]
	},
		"application/vnd.ms-excel.sheet.binary.macroenabled.12": {
		source: "iana",
		extensions: [
			"xlsb"
		]
	},
		"application/vnd.ms-excel.sheet.macroenabled.12": {
		source: "iana",
		extensions: [
			"xlsm"
		]
	},
		"application/vnd.ms-excel.template.macroenabled.12": {
		source: "iana",
		extensions: [
			"xltm"
		]
	},
		"application/vnd.ms-fontobject": {
		source: "iana",
		compressible: true,
		extensions: [
			"eot"
		]
	},
		"application/vnd.ms-htmlhelp": {
		source: "iana",
		extensions: [
			"chm"
		]
	},
		"application/vnd.ms-ims": {
		source: "iana",
		extensions: [
			"ims"
		]
	},
		"application/vnd.ms-lrm": {
		source: "iana",
		extensions: [
			"lrm"
		]
	},
		"application/vnd.ms-office.activex+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.ms-officetheme": {
		source: "iana",
		extensions: [
			"thmx"
		]
	},
		"application/vnd.ms-opentype": {
		source: "apache",
		compressible: true
	},
		"application/vnd.ms-outlook": {
		compressible: false,
		extensions: [
			"msg"
		]
	},
		"application/vnd.ms-package.obfuscated-opentype": {
		source: "apache"
	},
		"application/vnd.ms-pki.seccat": {
		source: "apache",
		extensions: [
			"cat"
		]
	},
		"application/vnd.ms-pki.stl": {
		source: "apache",
		extensions: [
			"stl"
		]
	},
		"application/vnd.ms-playready.initiator+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.ms-powerpoint": {
		source: "iana",
		compressible: false,
		extensions: [
			"ppt",
			"pps",
			"pot"
		]
	},
		"application/vnd.ms-powerpoint.addin.macroenabled.12": {
		source: "iana",
		extensions: [
			"ppam"
		]
	},
		"application/vnd.ms-powerpoint.presentation.macroenabled.12": {
		source: "iana",
		extensions: [
			"pptm"
		]
	},
		"application/vnd.ms-powerpoint.slide.macroenabled.12": {
		source: "iana",
		extensions: [
			"sldm"
		]
	},
		"application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
		source: "iana",
		extensions: [
			"ppsm"
		]
	},
		"application/vnd.ms-powerpoint.template.macroenabled.12": {
		source: "iana",
		extensions: [
			"potm"
		]
	},
		"application/vnd.ms-printdevicecapabilities+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.ms-printing.printticket+xml": {
		source: "apache",
		compressible: true
	},
		"application/vnd.ms-printschematicket+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.ms-project": {
		source: "iana",
		extensions: [
			"mpp",
			"mpt"
		]
	},
		"application/vnd.ms-tnef": {
		source: "iana"
	},
		"application/vnd.ms-visio.viewer": {
		extensions: [
			"vdx"
		]
	},
		"application/vnd.ms-windows.devicepairing": {
		source: "iana"
	},
		"application/vnd.ms-windows.nwprinting.oob": {
		source: "iana"
	},
		"application/vnd.ms-windows.printerpairing": {
		source: "iana"
	},
		"application/vnd.ms-windows.wsd.oob": {
		source: "iana"
	},
		"application/vnd.ms-wmdrm.lic-chlg-req": {
		source: "iana"
	},
		"application/vnd.ms-wmdrm.lic-resp": {
		source: "iana"
	},
		"application/vnd.ms-wmdrm.meter-chlg-req": {
		source: "iana"
	},
		"application/vnd.ms-wmdrm.meter-resp": {
		source: "iana"
	},
		"application/vnd.ms-word.document.macroenabled.12": {
		source: "iana",
		extensions: [
			"docm"
		]
	},
		"application/vnd.ms-word.template.macroenabled.12": {
		source: "iana",
		extensions: [
			"dotm"
		]
	},
		"application/vnd.ms-works": {
		source: "iana",
		extensions: [
			"wps",
			"wks",
			"wcm",
			"wdb"
		]
	},
		"application/vnd.ms-wpl": {
		source: "iana",
		extensions: [
			"wpl"
		]
	},
		"application/vnd.ms-xpsdocument": {
		source: "iana",
		compressible: false,
		extensions: [
			"xps"
		]
	},
		"application/vnd.msa-disk-image": {
		source: "iana"
	},
		"application/vnd.mseq": {
		source: "iana",
		extensions: [
			"mseq"
		]
	},
		"application/vnd.msgpack": {
		source: "iana"
	},
		"application/vnd.msign": {
		source: "iana"
	},
		"application/vnd.multiad.creator": {
		source: "iana"
	},
		"application/vnd.multiad.creator.cif": {
		source: "iana"
	},
		"application/vnd.music-niff": {
		source: "iana"
	},
		"application/vnd.musician": {
		source: "iana",
		extensions: [
			"mus"
		]
	},
		"application/vnd.muvee.style": {
		source: "iana",
		extensions: [
			"msty"
		]
	},
		"application/vnd.mynfc": {
		source: "iana",
		extensions: [
			"taglet"
		]
	},
		"application/vnd.nacamar.ybrid+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.nato.bindingdataobject+cbor": {
		source: "iana"
	},
		"application/vnd.nato.bindingdataobject+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.nato.bindingdataobject+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"bdo"
		]
	},
		"application/vnd.nato.openxmlformats-package.iepd+zip": {
		source: "iana",
		compressible: false
	},
		"application/vnd.ncd.control": {
		source: "iana"
	},
		"application/vnd.ncd.reference": {
		source: "iana"
	},
		"application/vnd.nearst.inv+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.nebumind.line": {
		source: "iana"
	},
		"application/vnd.nervana": {
		source: "iana"
	},
		"application/vnd.netfpx": {
		source: "iana"
	},
		"application/vnd.neurolanguage.nlu": {
		source: "iana",
		extensions: [
			"nlu"
		]
	},
		"application/vnd.nimn": {
		source: "iana"
	},
		"application/vnd.nintendo.nitro.rom": {
		source: "iana"
	},
		"application/vnd.nintendo.snes.rom": {
		source: "iana"
	},
		"application/vnd.nitf": {
		source: "iana",
		extensions: [
			"ntf",
			"nitf"
		]
	},
		"application/vnd.noblenet-directory": {
		source: "iana",
		extensions: [
			"nnd"
		]
	},
		"application/vnd.noblenet-sealer": {
		source: "iana",
		extensions: [
			"nns"
		]
	},
		"application/vnd.noblenet-web": {
		source: "iana",
		extensions: [
			"nnw"
		]
	},
		"application/vnd.nokia.catalogs": {
		source: "iana"
	},
		"application/vnd.nokia.conml+wbxml": {
		source: "iana"
	},
		"application/vnd.nokia.conml+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.nokia.iptv.config+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.nokia.isds-radio-presets": {
		source: "iana"
	},
		"application/vnd.nokia.landmark+wbxml": {
		source: "iana"
	},
		"application/vnd.nokia.landmark+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.nokia.landmarkcollection+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.nokia.n-gage.ac+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"ac"
		]
	},
		"application/vnd.nokia.n-gage.data": {
		source: "iana",
		extensions: [
			"ngdat"
		]
	},
		"application/vnd.nokia.n-gage.symbian.install": {
		source: "apache",
		extensions: [
			"n-gage"
		]
	},
		"application/vnd.nokia.ncd": {
		source: "iana"
	},
		"application/vnd.nokia.pcd+wbxml": {
		source: "iana"
	},
		"application/vnd.nokia.pcd+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.nokia.radio-preset": {
		source: "iana",
		extensions: [
			"rpst"
		]
	},
		"application/vnd.nokia.radio-presets": {
		source: "iana",
		extensions: [
			"rpss"
		]
	},
		"application/vnd.novadigm.edm": {
		source: "iana",
		extensions: [
			"edm"
		]
	},
		"application/vnd.novadigm.edx": {
		source: "iana",
		extensions: [
			"edx"
		]
	},
		"application/vnd.novadigm.ext": {
		source: "iana",
		extensions: [
			"ext"
		]
	},
		"application/vnd.ntt-local.content-share": {
		source: "iana"
	},
		"application/vnd.ntt-local.file-transfer": {
		source: "iana"
	},
		"application/vnd.ntt-local.ogw_remote-access": {
		source: "iana"
	},
		"application/vnd.ntt-local.sip-ta_remote": {
		source: "iana"
	},
		"application/vnd.ntt-local.sip-ta_tcp_stream": {
		source: "iana"
	},
		"application/vnd.oai.workflows": {
		source: "iana"
	},
		"application/vnd.oai.workflows+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oai.workflows+yaml": {
		source: "iana"
	},
		"application/vnd.oasis.opendocument.base": {
		source: "iana"
	},
		"application/vnd.oasis.opendocument.chart": {
		source: "iana",
		extensions: [
			"odc"
		]
	},
		"application/vnd.oasis.opendocument.chart-template": {
		source: "iana",
		extensions: [
			"otc"
		]
	},
		"application/vnd.oasis.opendocument.database": {
		source: "apache",
		extensions: [
			"odb"
		]
	},
		"application/vnd.oasis.opendocument.formula": {
		source: "iana",
		extensions: [
			"odf"
		]
	},
		"application/vnd.oasis.opendocument.formula-template": {
		source: "iana",
		extensions: [
			"odft"
		]
	},
		"application/vnd.oasis.opendocument.graphics": {
		source: "iana",
		compressible: false,
		extensions: [
			"odg"
		]
	},
		"application/vnd.oasis.opendocument.graphics-template": {
		source: "iana",
		extensions: [
			"otg"
		]
	},
		"application/vnd.oasis.opendocument.image": {
		source: "iana",
		extensions: [
			"odi"
		]
	},
		"application/vnd.oasis.opendocument.image-template": {
		source: "iana",
		extensions: [
			"oti"
		]
	},
		"application/vnd.oasis.opendocument.presentation": {
		source: "iana",
		compressible: false,
		extensions: [
			"odp"
		]
	},
		"application/vnd.oasis.opendocument.presentation-template": {
		source: "iana",
		extensions: [
			"otp"
		]
	},
		"application/vnd.oasis.opendocument.spreadsheet": {
		source: "iana",
		compressible: false,
		extensions: [
			"ods"
		]
	},
		"application/vnd.oasis.opendocument.spreadsheet-template": {
		source: "iana",
		extensions: [
			"ots"
		]
	},
		"application/vnd.oasis.opendocument.text": {
		source: "iana",
		compressible: false,
		extensions: [
			"odt"
		]
	},
		"application/vnd.oasis.opendocument.text-master": {
		source: "iana",
		extensions: [
			"odm"
		]
	},
		"application/vnd.oasis.opendocument.text-master-template": {
		source: "iana"
	},
		"application/vnd.oasis.opendocument.text-template": {
		source: "iana",
		extensions: [
			"ott"
		]
	},
		"application/vnd.oasis.opendocument.text-web": {
		source: "iana",
		extensions: [
			"oth"
		]
	},
		"application/vnd.obn": {
		source: "iana"
	},
		"application/vnd.ocf+cbor": {
		source: "iana"
	},
		"application/vnd.oci.image.manifest.v1+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oftn.l10n+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oipf.contentaccessdownload+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oipf.contentaccessstreaming+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oipf.cspg-hexbinary": {
		source: "iana"
	},
		"application/vnd.oipf.dae.svg+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oipf.dae.xhtml+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oipf.mippvcontrolmessage+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oipf.pae.gem": {
		source: "iana"
	},
		"application/vnd.oipf.spdiscovery+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oipf.spdlist+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oipf.ueprofile+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oipf.userprofile+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.olpc-sugar": {
		source: "iana",
		extensions: [
			"xo"
		]
	},
		"application/vnd.oma-scws-config": {
		source: "iana"
	},
		"application/vnd.oma-scws-http-request": {
		source: "iana"
	},
		"application/vnd.oma-scws-http-response": {
		source: "iana"
	},
		"application/vnd.oma.bcast.associated-procedure-parameter+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.bcast.drm-trigger+xml": {
		source: "apache",
		compressible: true
	},
		"application/vnd.oma.bcast.imd+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.bcast.ltkm": {
		source: "iana"
	},
		"application/vnd.oma.bcast.notification+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.bcast.provisioningtrigger": {
		source: "iana"
	},
		"application/vnd.oma.bcast.sgboot": {
		source: "iana"
	},
		"application/vnd.oma.bcast.sgdd+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.bcast.sgdu": {
		source: "iana"
	},
		"application/vnd.oma.bcast.simple-symbol-container": {
		source: "iana"
	},
		"application/vnd.oma.bcast.smartcard-trigger+xml": {
		source: "apache",
		compressible: true
	},
		"application/vnd.oma.bcast.sprov+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.bcast.stkm": {
		source: "iana"
	},
		"application/vnd.oma.cab-address-book+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.cab-feature-handler+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.cab-pcc+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.cab-subs-invite+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.cab-user-prefs+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.dcd": {
		source: "iana"
	},
		"application/vnd.oma.dcdc": {
		source: "iana"
	},
		"application/vnd.oma.dd2+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"dd2"
		]
	},
		"application/vnd.oma.drm.risd+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.group-usage-list+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.lwm2m+cbor": {
		source: "iana"
	},
		"application/vnd.oma.lwm2m+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.lwm2m+tlv": {
		source: "iana"
	},
		"application/vnd.oma.pal+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.poc.detailed-progress-report+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.poc.final-report+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.poc.groups+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.poc.invocation-descriptor+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.poc.optimized-progress-report+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.push": {
		source: "iana"
	},
		"application/vnd.oma.scidm.messages+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oma.xcap-directory+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.omads-email+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/vnd.omads-file+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/vnd.omads-folder+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/vnd.omaloc-supl-init": {
		source: "iana"
	},
		"application/vnd.onepager": {
		source: "iana"
	},
		"application/vnd.onepagertamp": {
		source: "iana"
	},
		"application/vnd.onepagertamx": {
		source: "iana"
	},
		"application/vnd.onepagertat": {
		source: "iana"
	},
		"application/vnd.onepagertatp": {
		source: "iana"
	},
		"application/vnd.onepagertatx": {
		source: "iana"
	},
		"application/vnd.onvif.metadata": {
		source: "iana"
	},
		"application/vnd.openblox.game+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"obgx"
		]
	},
		"application/vnd.openblox.game-binary": {
		source: "iana"
	},
		"application/vnd.openeye.oeb": {
		source: "iana"
	},
		"application/vnd.openofficeorg.extension": {
		source: "apache",
		extensions: [
			"oxt"
		]
	},
		"application/vnd.openstreetmap.data+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"osm"
		]
	},
		"application/vnd.opentimestamps.ots": {
		source: "iana"
	},
		"application/vnd.openvpi.dspx+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.custom-properties+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.drawing+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.extended-properties+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": {
		source: "iana",
		compressible: false,
		extensions: [
			"pptx"
		]
	},
		"application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.slide": {
		source: "iana",
		extensions: [
			"sldx"
		]
	},
		"application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
		source: "iana",
		extensions: [
			"ppsx"
		]
	},
		"application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.template": {
		source: "iana",
		extensions: [
			"potx"
		]
	},
		"application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
		source: "iana",
		compressible: false,
		extensions: [
			"xlsx"
		]
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
		source: "iana",
		extensions: [
			"xltx"
		]
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.theme+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.themeoverride+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.vmldrawing": {
		source: "iana"
	},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
		source: "iana",
		compressible: false,
		extensions: [
			"docx"
		]
	},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
		source: "iana",
		extensions: [
			"dotx"
		]
	},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-package.core-properties+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.openxmlformats-package.relationships+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oracle.resource+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.orange.indata": {
		source: "iana"
	},
		"application/vnd.osa.netdeploy": {
		source: "iana"
	},
		"application/vnd.osgeo.mapguide.package": {
		source: "iana",
		extensions: [
			"mgp"
		]
	},
		"application/vnd.osgi.bundle": {
		source: "iana"
	},
		"application/vnd.osgi.dp": {
		source: "iana",
		extensions: [
			"dp"
		]
	},
		"application/vnd.osgi.subsystem": {
		source: "iana",
		extensions: [
			"esa"
		]
	},
		"application/vnd.otps.ct-kip+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.oxli.countgraph": {
		source: "iana"
	},
		"application/vnd.pagerduty+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.palm": {
		source: "iana",
		extensions: [
			"pdb",
			"pqa",
			"oprc"
		]
	},
		"application/vnd.panoply": {
		source: "iana"
	},
		"application/vnd.paos.xml": {
		source: "iana"
	},
		"application/vnd.patentdive": {
		source: "iana"
	},
		"application/vnd.patientecommsdoc": {
		source: "iana"
	},
		"application/vnd.pawaafile": {
		source: "iana",
		extensions: [
			"paw"
		]
	},
		"application/vnd.pcos": {
		source: "iana"
	},
		"application/vnd.pg.format": {
		source: "iana",
		extensions: [
			"str"
		]
	},
		"application/vnd.pg.osasli": {
		source: "iana",
		extensions: [
			"ei6"
		]
	},
		"application/vnd.piaccess.application-licence": {
		source: "iana"
	},
		"application/vnd.picsel": {
		source: "iana",
		extensions: [
			"efif"
		]
	},
		"application/vnd.pmi.widget": {
		source: "iana",
		extensions: [
			"wg"
		]
	},
		"application/vnd.poc.group-advertisement+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.pocketlearn": {
		source: "iana",
		extensions: [
			"plf"
		]
	},
		"application/vnd.powerbuilder6": {
		source: "iana",
		extensions: [
			"pbd"
		]
	},
		"application/vnd.powerbuilder6-s": {
		source: "iana"
	},
		"application/vnd.powerbuilder7": {
		source: "iana"
	},
		"application/vnd.powerbuilder7-s": {
		source: "iana"
	},
		"application/vnd.powerbuilder75": {
		source: "iana"
	},
		"application/vnd.powerbuilder75-s": {
		source: "iana"
	},
		"application/vnd.preminet": {
		source: "iana"
	},
		"application/vnd.previewsystems.box": {
		source: "iana",
		extensions: [
			"box"
		]
	},
		"application/vnd.procrate.brushset": {
		extensions: [
			"brushset"
		]
	},
		"application/vnd.procreate.brush": {
		extensions: [
			"brush"
		]
	},
		"application/vnd.procreate.dream": {
		extensions: [
			"drm"
		]
	},
		"application/vnd.proteus.magazine": {
		source: "iana",
		extensions: [
			"mgz"
		]
	},
		"application/vnd.psfs": {
		source: "iana"
	},
		"application/vnd.pt.mundusmundi": {
		source: "iana"
	},
		"application/vnd.publishare-delta-tree": {
		source: "iana",
		extensions: [
			"qps"
		]
	},
		"application/vnd.pvi.ptid1": {
		source: "iana",
		extensions: [
			"ptid"
		]
	},
		"application/vnd.pwg-multiplexed": {
		source: "iana"
	},
		"application/vnd.pwg-xhtml-print+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xhtm"
		]
	},
		"application/vnd.qualcomm.brew-app-res": {
		source: "iana"
	},
		"application/vnd.quarantainenet": {
		source: "iana"
	},
		"application/vnd.quark.quarkxpress": {
		source: "iana",
		extensions: [
			"qxd",
			"qxt",
			"qwd",
			"qwt",
			"qxl",
			"qxb"
		]
	},
		"application/vnd.quobject-quoxdocument": {
		source: "iana"
	},
		"application/vnd.radisys.moml+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.radisys.msml+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.radisys.msml-audit+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.radisys.msml-audit-conf+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.radisys.msml-audit-conn+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.radisys.msml-audit-dialog+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.radisys.msml-audit-stream+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.radisys.msml-conf+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.radisys.msml-dialog+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.radisys.msml-dialog-base+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.radisys.msml-dialog-fax-detect+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.radisys.msml-dialog-group+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.radisys.msml-dialog-speech+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.radisys.msml-dialog-transform+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.rainstor.data": {
		source: "iana"
	},
		"application/vnd.rapid": {
		source: "iana"
	},
		"application/vnd.rar": {
		source: "iana",
		extensions: [
			"rar"
		]
	},
		"application/vnd.realvnc.bed": {
		source: "iana",
		extensions: [
			"bed"
		]
	},
		"application/vnd.recordare.musicxml": {
		source: "iana",
		extensions: [
			"mxl"
		]
	},
		"application/vnd.recordare.musicxml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"musicxml"
		]
	},
		"application/vnd.relpipe": {
		source: "iana"
	},
		"application/vnd.renlearn.rlprint": {
		source: "iana"
	},
		"application/vnd.resilient.logic": {
		source: "iana"
	},
		"application/vnd.restful+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.rig.cryptonote": {
		source: "iana",
		extensions: [
			"cryptonote"
		]
	},
		"application/vnd.rim.cod": {
		source: "apache",
		extensions: [
			"cod"
		]
	},
		"application/vnd.rn-realmedia": {
		source: "apache",
		extensions: [
			"rm"
		]
	},
		"application/vnd.rn-realmedia-vbr": {
		source: "apache",
		extensions: [
			"rmvb"
		]
	},
		"application/vnd.route66.link66+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"link66"
		]
	},
		"application/vnd.rs-274x": {
		source: "iana"
	},
		"application/vnd.ruckus.download": {
		source: "iana"
	},
		"application/vnd.s3sms": {
		source: "iana"
	},
		"application/vnd.sailingtracker.track": {
		source: "iana",
		extensions: [
			"st"
		]
	},
		"application/vnd.sar": {
		source: "iana"
	},
		"application/vnd.sbm.cid": {
		source: "iana"
	},
		"application/vnd.sbm.mid2": {
		source: "iana"
	},
		"application/vnd.scribus": {
		source: "iana"
	},
		"application/vnd.sealed.3df": {
		source: "iana"
	},
		"application/vnd.sealed.csf": {
		source: "iana"
	},
		"application/vnd.sealed.doc": {
		source: "iana"
	},
		"application/vnd.sealed.eml": {
		source: "iana"
	},
		"application/vnd.sealed.mht": {
		source: "iana"
	},
		"application/vnd.sealed.net": {
		source: "iana"
	},
		"application/vnd.sealed.ppt": {
		source: "iana"
	},
		"application/vnd.sealed.tiff": {
		source: "iana"
	},
		"application/vnd.sealed.xls": {
		source: "iana"
	},
		"application/vnd.sealedmedia.softseal.html": {
		source: "iana"
	},
		"application/vnd.sealedmedia.softseal.pdf": {
		source: "iana"
	},
		"application/vnd.seemail": {
		source: "iana",
		extensions: [
			"see"
		]
	},
		"application/vnd.seis+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.sema": {
		source: "iana",
		extensions: [
			"sema"
		]
	},
		"application/vnd.semd": {
		source: "iana",
		extensions: [
			"semd"
		]
	},
		"application/vnd.semf": {
		source: "iana",
		extensions: [
			"semf"
		]
	},
		"application/vnd.shade-save-file": {
		source: "iana"
	},
		"application/vnd.shana.informed.formdata": {
		source: "iana",
		extensions: [
			"ifm"
		]
	},
		"application/vnd.shana.informed.formtemplate": {
		source: "iana",
		extensions: [
			"itp"
		]
	},
		"application/vnd.shana.informed.interchange": {
		source: "iana",
		extensions: [
			"iif"
		]
	},
		"application/vnd.shana.informed.package": {
		source: "iana",
		extensions: [
			"ipk"
		]
	},
		"application/vnd.shootproof+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.shopkick+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.shp": {
		source: "iana"
	},
		"application/vnd.shx": {
		source: "iana"
	},
		"application/vnd.sigrok.session": {
		source: "iana"
	},
		"application/vnd.simtech-mindmapper": {
		source: "iana",
		extensions: [
			"twd",
			"twds"
		]
	},
		"application/vnd.siren+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.sketchometry": {
		source: "iana"
	},
		"application/vnd.smaf": {
		source: "iana",
		extensions: [
			"mmf"
		]
	},
		"application/vnd.smart.notebook": {
		source: "iana"
	},
		"application/vnd.smart.teacher": {
		source: "iana",
		extensions: [
			"teacher"
		]
	},
		"application/vnd.smintio.portals.archive": {
		source: "iana"
	},
		"application/vnd.snesdev-page-table": {
		source: "iana"
	},
		"application/vnd.software602.filler.form+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"fo"
		]
	},
		"application/vnd.software602.filler.form-xml-zip": {
		source: "iana"
	},
		"application/vnd.solent.sdkm+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"sdkm",
			"sdkd"
		]
	},
		"application/vnd.spotfire.dxp": {
		source: "iana",
		extensions: [
			"dxp"
		]
	},
		"application/vnd.spotfire.sfs": {
		source: "iana",
		extensions: [
			"sfs"
		]
	},
		"application/vnd.sqlite3": {
		source: "iana"
	},
		"application/vnd.sss-cod": {
		source: "iana"
	},
		"application/vnd.sss-dtf": {
		source: "iana"
	},
		"application/vnd.sss-ntf": {
		source: "iana"
	},
		"application/vnd.stardivision.calc": {
		source: "apache",
		extensions: [
			"sdc"
		]
	},
		"application/vnd.stardivision.draw": {
		source: "apache",
		extensions: [
			"sda"
		]
	},
		"application/vnd.stardivision.impress": {
		source: "apache",
		extensions: [
			"sdd"
		]
	},
		"application/vnd.stardivision.math": {
		source: "apache",
		extensions: [
			"smf"
		]
	},
		"application/vnd.stardivision.writer": {
		source: "apache",
		extensions: [
			"sdw",
			"vor"
		]
	},
		"application/vnd.stardivision.writer-global": {
		source: "apache",
		extensions: [
			"sgl"
		]
	},
		"application/vnd.stepmania.package": {
		source: "iana",
		extensions: [
			"smzip"
		]
	},
		"application/vnd.stepmania.stepchart": {
		source: "iana",
		extensions: [
			"sm"
		]
	},
		"application/vnd.street-stream": {
		source: "iana"
	},
		"application/vnd.sun.wadl+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"wadl"
		]
	},
		"application/vnd.sun.xml.calc": {
		source: "apache",
		extensions: [
			"sxc"
		]
	},
		"application/vnd.sun.xml.calc.template": {
		source: "apache",
		extensions: [
			"stc"
		]
	},
		"application/vnd.sun.xml.draw": {
		source: "apache",
		extensions: [
			"sxd"
		]
	},
		"application/vnd.sun.xml.draw.template": {
		source: "apache",
		extensions: [
			"std"
		]
	},
		"application/vnd.sun.xml.impress": {
		source: "apache",
		extensions: [
			"sxi"
		]
	},
		"application/vnd.sun.xml.impress.template": {
		source: "apache",
		extensions: [
			"sti"
		]
	},
		"application/vnd.sun.xml.math": {
		source: "apache",
		extensions: [
			"sxm"
		]
	},
		"application/vnd.sun.xml.writer": {
		source: "apache",
		extensions: [
			"sxw"
		]
	},
		"application/vnd.sun.xml.writer.global": {
		source: "apache",
		extensions: [
			"sxg"
		]
	},
		"application/vnd.sun.xml.writer.template": {
		source: "apache",
		extensions: [
			"stw"
		]
	},
		"application/vnd.sus-calendar": {
		source: "iana",
		extensions: [
			"sus",
			"susp"
		]
	},
		"application/vnd.svd": {
		source: "iana",
		extensions: [
			"svd"
		]
	},
		"application/vnd.swiftview-ics": {
		source: "iana"
	},
		"application/vnd.sybyl.mol2": {
		source: "iana"
	},
		"application/vnd.sycle+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.syft+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.symbian.install": {
		source: "apache",
		extensions: [
			"sis",
			"sisx"
		]
	},
		"application/vnd.syncml+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true,
		extensions: [
			"xsm"
		]
	},
		"application/vnd.syncml.dm+wbxml": {
		source: "iana",
		charset: "UTF-8",
		extensions: [
			"bdm"
		]
	},
		"application/vnd.syncml.dm+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true,
		extensions: [
			"xdm"
		]
	},
		"application/vnd.syncml.dm.notification": {
		source: "iana"
	},
		"application/vnd.syncml.dmddf+wbxml": {
		source: "iana"
	},
		"application/vnd.syncml.dmddf+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true,
		extensions: [
			"ddf"
		]
	},
		"application/vnd.syncml.dmtnds+wbxml": {
		source: "iana"
	},
		"application/vnd.syncml.dmtnds+xml": {
		source: "iana",
		charset: "UTF-8",
		compressible: true
	},
		"application/vnd.syncml.ds.notification": {
		source: "iana"
	},
		"application/vnd.tableschema+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.tao.intent-module-archive": {
		source: "iana",
		extensions: [
			"tao"
		]
	},
		"application/vnd.tcpdump.pcap": {
		source: "iana",
		extensions: [
			"pcap",
			"cap",
			"dmp"
		]
	},
		"application/vnd.think-cell.ppttc+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.tmd.mediaflex.api+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.tml": {
		source: "iana"
	},
		"application/vnd.tmobile-livetv": {
		source: "iana",
		extensions: [
			"tmo"
		]
	},
		"application/vnd.tri.onesource": {
		source: "iana"
	},
		"application/vnd.trid.tpt": {
		source: "iana",
		extensions: [
			"tpt"
		]
	},
		"application/vnd.triscape.mxs": {
		source: "iana",
		extensions: [
			"mxs"
		]
	},
		"application/vnd.trueapp": {
		source: "iana",
		extensions: [
			"tra"
		]
	},
		"application/vnd.truedoc": {
		source: "iana"
	},
		"application/vnd.ubisoft.webplayer": {
		source: "iana"
	},
		"application/vnd.ufdl": {
		source: "iana",
		extensions: [
			"ufd",
			"ufdl"
		]
	},
		"application/vnd.uic.osdm+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.uiq.theme": {
		source: "iana",
		extensions: [
			"utz"
		]
	},
		"application/vnd.umajin": {
		source: "iana",
		extensions: [
			"umj"
		]
	},
		"application/vnd.unity": {
		source: "iana",
		extensions: [
			"unityweb"
		]
	},
		"application/vnd.uoml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"uoml",
			"uo"
		]
	},
		"application/vnd.uplanet.alert": {
		source: "iana"
	},
		"application/vnd.uplanet.alert-wbxml": {
		source: "iana"
	},
		"application/vnd.uplanet.bearer-choice": {
		source: "iana"
	},
		"application/vnd.uplanet.bearer-choice-wbxml": {
		source: "iana"
	},
		"application/vnd.uplanet.cacheop": {
		source: "iana"
	},
		"application/vnd.uplanet.cacheop-wbxml": {
		source: "iana"
	},
		"application/vnd.uplanet.channel": {
		source: "iana"
	},
		"application/vnd.uplanet.channel-wbxml": {
		source: "iana"
	},
		"application/vnd.uplanet.list": {
		source: "iana"
	},
		"application/vnd.uplanet.list-wbxml": {
		source: "iana"
	},
		"application/vnd.uplanet.listcmd": {
		source: "iana"
	},
		"application/vnd.uplanet.listcmd-wbxml": {
		source: "iana"
	},
		"application/vnd.uplanet.signal": {
		source: "iana"
	},
		"application/vnd.uri-map": {
		source: "iana"
	},
		"application/vnd.valve.source.material": {
		source: "iana"
	},
		"application/vnd.vcx": {
		source: "iana",
		extensions: [
			"vcx"
		]
	},
		"application/vnd.vd-study": {
		source: "iana"
	},
		"application/vnd.vectorworks": {
		source: "iana"
	},
		"application/vnd.vel+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.veraison.tsm-report+cbor": {
		source: "iana"
	},
		"application/vnd.veraison.tsm-report+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.verimatrix.vcas": {
		source: "iana"
	},
		"application/vnd.veritone.aion+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.veryant.thin": {
		source: "iana"
	},
		"application/vnd.ves.encrypted": {
		source: "iana"
	},
		"application/vnd.vidsoft.vidconference": {
		source: "iana"
	},
		"application/vnd.visio": {
		source: "iana",
		extensions: [
			"vsd",
			"vst",
			"vss",
			"vsw",
			"vsdx",
			"vtx"
		]
	},
		"application/vnd.visionary": {
		source: "iana",
		extensions: [
			"vis"
		]
	},
		"application/vnd.vividence.scriptfile": {
		source: "iana"
	},
		"application/vnd.vocalshaper.vsp4": {
		source: "iana"
	},
		"application/vnd.vsf": {
		source: "iana",
		extensions: [
			"vsf"
		]
	},
		"application/vnd.wap.sic": {
		source: "iana"
	},
		"application/vnd.wap.slc": {
		source: "iana"
	},
		"application/vnd.wap.wbxml": {
		source: "iana",
		charset: "UTF-8",
		extensions: [
			"wbxml"
		]
	},
		"application/vnd.wap.wmlc": {
		source: "iana",
		extensions: [
			"wmlc"
		]
	},
		"application/vnd.wap.wmlscriptc": {
		source: "iana",
		extensions: [
			"wmlsc"
		]
	},
		"application/vnd.wasmflow.wafl": {
		source: "iana"
	},
		"application/vnd.webturbo": {
		source: "iana",
		extensions: [
			"wtb"
		]
	},
		"application/vnd.wfa.dpp": {
		source: "iana"
	},
		"application/vnd.wfa.p2p": {
		source: "iana"
	},
		"application/vnd.wfa.wsc": {
		source: "iana"
	},
		"application/vnd.windows.devicepairing": {
		source: "iana"
	},
		"application/vnd.wmc": {
		source: "iana"
	},
		"application/vnd.wmf.bootstrap": {
		source: "iana"
	},
		"application/vnd.wolfram.mathematica": {
		source: "iana"
	},
		"application/vnd.wolfram.mathematica.package": {
		source: "iana"
	},
		"application/vnd.wolfram.player": {
		source: "iana",
		extensions: [
			"nbp"
		]
	},
		"application/vnd.wordlift": {
		source: "iana"
	},
		"application/vnd.wordperfect": {
		source: "iana",
		extensions: [
			"wpd"
		]
	},
		"application/vnd.wqd": {
		source: "iana",
		extensions: [
			"wqd"
		]
	},
		"application/vnd.wrq-hp3000-labelled": {
		source: "iana"
	},
		"application/vnd.wt.stf": {
		source: "iana",
		extensions: [
			"stf"
		]
	},
		"application/vnd.wv.csp+wbxml": {
		source: "iana"
	},
		"application/vnd.wv.csp+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.wv.ssp+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.xacml+json": {
		source: "iana",
		compressible: true
	},
		"application/vnd.xara": {
		source: "iana",
		extensions: [
			"xar"
		]
	},
		"application/vnd.xarin.cpj": {
		source: "iana"
	},
		"application/vnd.xecrets-encrypted": {
		source: "iana"
	},
		"application/vnd.xfdl": {
		source: "iana",
		extensions: [
			"xfdl"
		]
	},
		"application/vnd.xfdl.webform": {
		source: "iana"
	},
		"application/vnd.xmi+xml": {
		source: "iana",
		compressible: true
	},
		"application/vnd.xmpie.cpkg": {
		source: "iana"
	},
		"application/vnd.xmpie.dpkg": {
		source: "iana"
	},
		"application/vnd.xmpie.plan": {
		source: "iana"
	},
		"application/vnd.xmpie.ppkg": {
		source: "iana"
	},
		"application/vnd.xmpie.xlim": {
		source: "iana"
	},
		"application/vnd.yamaha.hv-dic": {
		source: "iana",
		extensions: [
			"hvd"
		]
	},
		"application/vnd.yamaha.hv-script": {
		source: "iana",
		extensions: [
			"hvs"
		]
	},
		"application/vnd.yamaha.hv-voice": {
		source: "iana",
		extensions: [
			"hvp"
		]
	},
		"application/vnd.yamaha.openscoreformat": {
		source: "iana",
		extensions: [
			"osf"
		]
	},
		"application/vnd.yamaha.openscoreformat.osfpvg+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"osfpvg"
		]
	},
		"application/vnd.yamaha.remote-setup": {
		source: "iana"
	},
		"application/vnd.yamaha.smaf-audio": {
		source: "iana",
		extensions: [
			"saf"
		]
	},
		"application/vnd.yamaha.smaf-phrase": {
		source: "iana",
		extensions: [
			"spf"
		]
	},
		"application/vnd.yamaha.through-ngn": {
		source: "iana"
	},
		"application/vnd.yamaha.tunnel-udpencap": {
		source: "iana"
	},
		"application/vnd.yaoweme": {
		source: "iana"
	},
		"application/vnd.yellowriver-custom-menu": {
		source: "iana",
		extensions: [
			"cmp"
		]
	},
		"application/vnd.zul": {
		source: "iana",
		extensions: [
			"zir",
			"zirz"
		]
	},
		"application/vnd.zzazz.deck+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"zaz"
		]
	},
		"application/voicexml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"vxml"
		]
	},
		"application/voucher-cms+json": {
		source: "iana",
		compressible: true
	},
		"application/voucher-jws+json": {
		source: "iana",
		compressible: true
	},
		"application/vp": {
		source: "iana"
	},
		"application/vp+cose": {
		source: "iana"
	},
		"application/vp+jwt": {
		source: "iana"
	},
		"application/vq-rtcpxr": {
		source: "iana"
	},
		"application/wasm": {
		source: "iana",
		compressible: true,
		extensions: [
			"wasm"
		]
	},
		"application/watcherinfo+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"wif"
		]
	},
		"application/webpush-options+json": {
		source: "iana",
		compressible: true
	},
		"application/whoispp-query": {
		source: "iana"
	},
		"application/whoispp-response": {
		source: "iana"
	},
		"application/widget": {
		source: "iana",
		extensions: [
			"wgt"
		]
	},
		"application/winhlp": {
		source: "apache",
		extensions: [
			"hlp"
		]
	},
		"application/wita": {
		source: "iana"
	},
		"application/wordperfect5.1": {
		source: "iana"
	},
		"application/wsdl+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"wsdl"
		]
	},
		"application/wspolicy+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"wspolicy"
		]
	},
		"application/x-7z-compressed": {
		source: "apache",
		compressible: false,
		extensions: [
			"7z"
		]
	},
		"application/x-abiword": {
		source: "apache",
		extensions: [
			"abw"
		]
	},
		"application/x-ace-compressed": {
		source: "apache",
		extensions: [
			"ace"
		]
	},
		"application/x-amf": {
		source: "apache"
	},
		"application/x-apple-diskimage": {
		source: "apache",
		extensions: [
			"dmg"
		]
	},
		"application/x-arj": {
		compressible: false,
		extensions: [
			"arj"
		]
	},
		"application/x-authorware-bin": {
		source: "apache",
		extensions: [
			"aab",
			"x32",
			"u32",
			"vox"
		]
	},
		"application/x-authorware-map": {
		source: "apache",
		extensions: [
			"aam"
		]
	},
		"application/x-authorware-seg": {
		source: "apache",
		extensions: [
			"aas"
		]
	},
		"application/x-bcpio": {
		source: "apache",
		extensions: [
			"bcpio"
		]
	},
		"application/x-bdoc": {
		compressible: false,
		extensions: [
			"bdoc"
		]
	},
		"application/x-bittorrent": {
		source: "apache",
		extensions: [
			"torrent"
		]
	},
		"application/x-blender": {
		extensions: [
			"blend"
		]
	},
		"application/x-blorb": {
		source: "apache",
		extensions: [
			"blb",
			"blorb"
		]
	},
		"application/x-bzip": {
		source: "apache",
		compressible: false,
		extensions: [
			"bz"
		]
	},
		"application/x-bzip2": {
		source: "apache",
		compressible: false,
		extensions: [
			"bz2",
			"boz"
		]
	},
		"application/x-cbr": {
		source: "apache",
		extensions: [
			"cbr",
			"cba",
			"cbt",
			"cbz",
			"cb7"
		]
	},
		"application/x-cdlink": {
		source: "apache",
		extensions: [
			"vcd"
		]
	},
		"application/x-cfs-compressed": {
		source: "apache",
		extensions: [
			"cfs"
		]
	},
		"application/x-chat": {
		source: "apache",
		extensions: [
			"chat"
		]
	},
		"application/x-chess-pgn": {
		source: "apache",
		extensions: [
			"pgn"
		]
	},
		"application/x-chrome-extension": {
		extensions: [
			"crx"
		]
	},
		"application/x-cocoa": {
		source: "nginx",
		extensions: [
			"cco"
		]
	},
		"application/x-compress": {
		source: "apache"
	},
		"application/x-compressed": {
		extensions: [
			"rar"
		]
	},
		"application/x-conference": {
		source: "apache",
		extensions: [
			"nsc"
		]
	},
		"application/x-cpio": {
		source: "apache",
		extensions: [
			"cpio"
		]
	},
		"application/x-csh": {
		source: "apache",
		extensions: [
			"csh"
		]
	},
		"application/x-deb": {
		compressible: false
	},
		"application/x-debian-package": {
		source: "apache",
		extensions: [
			"deb",
			"udeb"
		]
	},
		"application/x-dgc-compressed": {
		source: "apache",
		extensions: [
			"dgc"
		]
	},
		"application/x-director": {
		source: "apache",
		extensions: [
			"dir",
			"dcr",
			"dxr",
			"cst",
			"cct",
			"cxt",
			"w3d",
			"fgd",
			"swa"
		]
	},
		"application/x-doom": {
		source: "apache",
		extensions: [
			"wad"
		]
	},
		"application/x-dtbncx+xml": {
		source: "apache",
		compressible: true,
		extensions: [
			"ncx"
		]
	},
		"application/x-dtbook+xml": {
		source: "apache",
		compressible: true,
		extensions: [
			"dtb"
		]
	},
		"application/x-dtbresource+xml": {
		source: "apache",
		compressible: true,
		extensions: [
			"res"
		]
	},
		"application/x-dvi": {
		source: "apache",
		compressible: false,
		extensions: [
			"dvi"
		]
	},
		"application/x-envoy": {
		source: "apache",
		extensions: [
			"evy"
		]
	},
		"application/x-eva": {
		source: "apache",
		extensions: [
			"eva"
		]
	},
		"application/x-font-bdf": {
		source: "apache",
		extensions: [
			"bdf"
		]
	},
		"application/x-font-dos": {
		source: "apache"
	},
		"application/x-font-framemaker": {
		source: "apache"
	},
		"application/x-font-ghostscript": {
		source: "apache",
		extensions: [
			"gsf"
		]
	},
		"application/x-font-libgrx": {
		source: "apache"
	},
		"application/x-font-linux-psf": {
		source: "apache",
		extensions: [
			"psf"
		]
	},
		"application/x-font-pcf": {
		source: "apache",
		extensions: [
			"pcf"
		]
	},
		"application/x-font-snf": {
		source: "apache",
		extensions: [
			"snf"
		]
	},
		"application/x-font-speedo": {
		source: "apache"
	},
		"application/x-font-sunos-news": {
		source: "apache"
	},
		"application/x-font-type1": {
		source: "apache",
		extensions: [
			"pfa",
			"pfb",
			"pfm",
			"afm"
		]
	},
		"application/x-font-vfont": {
		source: "apache"
	},
		"application/x-freearc": {
		source: "apache",
		extensions: [
			"arc"
		]
	},
		"application/x-futuresplash": {
		source: "apache",
		extensions: [
			"spl"
		]
	},
		"application/x-gca-compressed": {
		source: "apache",
		extensions: [
			"gca"
		]
	},
		"application/x-glulx": {
		source: "apache",
		extensions: [
			"ulx"
		]
	},
		"application/x-gnumeric": {
		source: "apache",
		extensions: [
			"gnumeric"
		]
	},
		"application/x-gramps-xml": {
		source: "apache",
		extensions: [
			"gramps"
		]
	},
		"application/x-gtar": {
		source: "apache",
		extensions: [
			"gtar"
		]
	},
		"application/x-gzip": {
		source: "apache"
	},
		"application/x-hdf": {
		source: "apache",
		extensions: [
			"hdf"
		]
	},
		"application/x-httpd-php": {
		compressible: true,
		extensions: [
			"php"
		]
	},
		"application/x-install-instructions": {
		source: "apache",
		extensions: [
			"install"
		]
	},
		"application/x-ipynb+json": {
		compressible: true,
		extensions: [
			"ipynb"
		]
	},
		"application/x-iso9660-image": {
		source: "apache",
		extensions: [
			"iso"
		]
	},
		"application/x-iwork-keynote-sffkey": {
		extensions: [
			"key"
		]
	},
		"application/x-iwork-numbers-sffnumbers": {
		extensions: [
			"numbers"
		]
	},
		"application/x-iwork-pages-sffpages": {
		extensions: [
			"pages"
		]
	},
		"application/x-java-archive-diff": {
		source: "nginx",
		extensions: [
			"jardiff"
		]
	},
		"application/x-java-jnlp-file": {
		source: "apache",
		compressible: false,
		extensions: [
			"jnlp"
		]
	},
		"application/x-javascript": {
		compressible: true
	},
		"application/x-keepass2": {
		extensions: [
			"kdbx"
		]
	},
		"application/x-latex": {
		source: "apache",
		compressible: false,
		extensions: [
			"latex"
		]
	},
		"application/x-lua-bytecode": {
		extensions: [
			"luac"
		]
	},
		"application/x-lzh-compressed": {
		source: "apache",
		extensions: [
			"lzh",
			"lha"
		]
	},
		"application/x-makeself": {
		source: "nginx",
		extensions: [
			"run"
		]
	},
		"application/x-mie": {
		source: "apache",
		extensions: [
			"mie"
		]
	},
		"application/x-mobipocket-ebook": {
		source: "apache",
		extensions: [
			"prc",
			"mobi"
		]
	},
		"application/x-mpegurl": {
		compressible: false
	},
		"application/x-ms-application": {
		source: "apache",
		extensions: [
			"application"
		]
	},
		"application/x-ms-shortcut": {
		source: "apache",
		extensions: [
			"lnk"
		]
	},
		"application/x-ms-wmd": {
		source: "apache",
		extensions: [
			"wmd"
		]
	},
		"application/x-ms-wmz": {
		source: "apache",
		extensions: [
			"wmz"
		]
	},
		"application/x-ms-xbap": {
		source: "apache",
		extensions: [
			"xbap"
		]
	},
		"application/x-msaccess": {
		source: "apache",
		extensions: [
			"mdb"
		]
	},
		"application/x-msbinder": {
		source: "apache",
		extensions: [
			"obd"
		]
	},
		"application/x-mscardfile": {
		source: "apache",
		extensions: [
			"crd"
		]
	},
		"application/x-msclip": {
		source: "apache",
		extensions: [
			"clp"
		]
	},
		"application/x-msdos-program": {
		extensions: [
			"exe"
		]
	},
		"application/x-msdownload": {
		source: "apache",
		extensions: [
			"exe",
			"dll",
			"com",
			"bat",
			"msi"
		]
	},
		"application/x-msmediaview": {
		source: "apache",
		extensions: [
			"mvb",
			"m13",
			"m14"
		]
	},
		"application/x-msmetafile": {
		source: "apache",
		extensions: [
			"wmf",
			"wmz",
			"emf",
			"emz"
		]
	},
		"application/x-msmoney": {
		source: "apache",
		extensions: [
			"mny"
		]
	},
		"application/x-mspublisher": {
		source: "apache",
		extensions: [
			"pub"
		]
	},
		"application/x-msschedule": {
		source: "apache",
		extensions: [
			"scd"
		]
	},
		"application/x-msterminal": {
		source: "apache",
		extensions: [
			"trm"
		]
	},
		"application/x-mswrite": {
		source: "apache",
		extensions: [
			"wri"
		]
	},
		"application/x-netcdf": {
		source: "apache",
		extensions: [
			"nc",
			"cdf"
		]
	},
		"application/x-ns-proxy-autoconfig": {
		compressible: true,
		extensions: [
			"pac"
		]
	},
		"application/x-nzb": {
		source: "apache",
		extensions: [
			"nzb"
		]
	},
		"application/x-perl": {
		source: "nginx",
		extensions: [
			"pl",
			"pm"
		]
	},
		"application/x-pilot": {
		source: "nginx",
		extensions: [
			"prc",
			"pdb"
		]
	},
		"application/x-pkcs12": {
		source: "apache",
		compressible: false,
		extensions: [
			"p12",
			"pfx"
		]
	},
		"application/x-pkcs7-certificates": {
		source: "apache",
		extensions: [
			"p7b",
			"spc"
		]
	},
		"application/x-pkcs7-certreqresp": {
		source: "apache",
		extensions: [
			"p7r"
		]
	},
		"application/x-pki-message": {
		source: "iana"
	},
		"application/x-rar-compressed": {
		source: "apache",
		compressible: false,
		extensions: [
			"rar"
		]
	},
		"application/x-redhat-package-manager": {
		source: "nginx",
		extensions: [
			"rpm"
		]
	},
		"application/x-research-info-systems": {
		source: "apache",
		extensions: [
			"ris"
		]
	},
		"application/x-sea": {
		source: "nginx",
		extensions: [
			"sea"
		]
	},
		"application/x-sh": {
		source: "apache",
		compressible: true,
		extensions: [
			"sh"
		]
	},
		"application/x-shar": {
		source: "apache",
		extensions: [
			"shar"
		]
	},
		"application/x-shockwave-flash": {
		source: "apache",
		compressible: false,
		extensions: [
			"swf"
		]
	},
		"application/x-silverlight-app": {
		source: "apache",
		extensions: [
			"xap"
		]
	},
		"application/x-sql": {
		source: "apache",
		extensions: [
			"sql"
		]
	},
		"application/x-stuffit": {
		source: "apache",
		compressible: false,
		extensions: [
			"sit"
		]
	},
		"application/x-stuffitx": {
		source: "apache",
		extensions: [
			"sitx"
		]
	},
		"application/x-subrip": {
		source: "apache",
		extensions: [
			"srt"
		]
	},
		"application/x-sv4cpio": {
		source: "apache",
		extensions: [
			"sv4cpio"
		]
	},
		"application/x-sv4crc": {
		source: "apache",
		extensions: [
			"sv4crc"
		]
	},
		"application/x-t3vm-image": {
		source: "apache",
		extensions: [
			"t3"
		]
	},
		"application/x-tads": {
		source: "apache",
		extensions: [
			"gam"
		]
	},
		"application/x-tar": {
		source: "apache",
		compressible: true,
		extensions: [
			"tar"
		]
	},
		"application/x-tcl": {
		source: "apache",
		extensions: [
			"tcl",
			"tk"
		]
	},
		"application/x-tex": {
		source: "apache",
		extensions: [
			"tex"
		]
	},
		"application/x-tex-tfm": {
		source: "apache",
		extensions: [
			"tfm"
		]
	},
		"application/x-texinfo": {
		source: "apache",
		extensions: [
			"texinfo",
			"texi"
		]
	},
		"application/x-tgif": {
		source: "apache",
		extensions: [
			"obj"
		]
	},
		"application/x-ustar": {
		source: "apache",
		extensions: [
			"ustar"
		]
	},
		"application/x-virtualbox-hdd": {
		compressible: true,
		extensions: [
			"hdd"
		]
	},
		"application/x-virtualbox-ova": {
		compressible: true,
		extensions: [
			"ova"
		]
	},
		"application/x-virtualbox-ovf": {
		compressible: true,
		extensions: [
			"ovf"
		]
	},
		"application/x-virtualbox-vbox": {
		compressible: true,
		extensions: [
			"vbox"
		]
	},
		"application/x-virtualbox-vbox-extpack": {
		compressible: false,
		extensions: [
			"vbox-extpack"
		]
	},
		"application/x-virtualbox-vdi": {
		compressible: true,
		extensions: [
			"vdi"
		]
	},
		"application/x-virtualbox-vhd": {
		compressible: true,
		extensions: [
			"vhd"
		]
	},
		"application/x-virtualbox-vmdk": {
		compressible: true,
		extensions: [
			"vmdk"
		]
	},
		"application/x-wais-source": {
		source: "apache",
		extensions: [
			"src"
		]
	},
		"application/x-web-app-manifest+json": {
		compressible: true,
		extensions: [
			"webapp"
		]
	},
		"application/x-www-form-urlencoded": {
		source: "iana",
		compressible: true
	},
		"application/x-x509-ca-cert": {
		source: "iana",
		extensions: [
			"der",
			"crt",
			"pem"
		]
	},
		"application/x-x509-ca-ra-cert": {
		source: "iana"
	},
		"application/x-x509-next-ca-cert": {
		source: "iana"
	},
		"application/x-xfig": {
		source: "apache",
		extensions: [
			"fig"
		]
	},
		"application/x-xliff+xml": {
		source: "apache",
		compressible: true,
		extensions: [
			"xlf"
		]
	},
		"application/x-xpinstall": {
		source: "apache",
		compressible: false,
		extensions: [
			"xpi"
		]
	},
		"application/x-xz": {
		source: "apache",
		extensions: [
			"xz"
		]
	},
		"application/x-zip-compressed": {
		extensions: [
			"zip"
		]
	},
		"application/x-zmachine": {
		source: "apache",
		extensions: [
			"z1",
			"z2",
			"z3",
			"z4",
			"z5",
			"z6",
			"z7",
			"z8"
		]
	},
		"application/x400-bp": {
		source: "iana"
	},
		"application/xacml+xml": {
		source: "iana",
		compressible: true
	},
		"application/xaml+xml": {
		source: "apache",
		compressible: true,
		extensions: [
			"xaml"
		]
	},
		"application/xcap-att+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xav"
		]
	},
		"application/xcap-caps+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xca"
		]
	},
		"application/xcap-diff+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xdf"
		]
	},
		"application/xcap-el+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xel"
		]
	},
		"application/xcap-error+xml": {
		source: "iana",
		compressible: true
	},
		"application/xcap-ns+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xns"
		]
	},
		"application/xcon-conference-info+xml": {
		source: "iana",
		compressible: true
	},
		"application/xcon-conference-info-diff+xml": {
		source: "iana",
		compressible: true
	},
		"application/xenc+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xenc"
		]
	},
		"application/xfdf": {
		source: "iana",
		extensions: [
			"xfdf"
		]
	},
		"application/xhtml+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xhtml",
			"xht"
		]
	},
		"application/xhtml-voice+xml": {
		source: "apache",
		compressible: true
	},
		"application/xliff+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xlf"
		]
	},
		"application/xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xml",
			"xsl",
			"xsd",
			"rng"
		]
	},
		"application/xml-dtd": {
		source: "iana",
		compressible: true,
		extensions: [
			"dtd"
		]
	},
		"application/xml-external-parsed-entity": {
		source: "iana"
	},
		"application/xml-patch+xml": {
		source: "iana",
		compressible: true
	},
		"application/xmpp+xml": {
		source: "iana",
		compressible: true
	},
		"application/xop+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xop"
		]
	},
		"application/xproc+xml": {
		source: "apache",
		compressible: true,
		extensions: [
			"xpl"
		]
	},
		"application/xslt+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xsl",
			"xslt"
		]
	},
		"application/xspf+xml": {
		source: "apache",
		compressible: true,
		extensions: [
			"xspf"
		]
	},
		"application/xv+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"mxml",
			"xhvml",
			"xvml",
			"xvm"
		]
	},
		"application/yaml": {
		source: "iana"
	},
		"application/yang": {
		source: "iana",
		extensions: [
			"yang"
		]
	},
		"application/yang-data+cbor": {
		source: "iana"
	},
		"application/yang-data+json": {
		source: "iana",
		compressible: true
	},
		"application/yang-data+xml": {
		source: "iana",
		compressible: true
	},
		"application/yang-patch+json": {
		source: "iana",
		compressible: true
	},
		"application/yang-patch+xml": {
		source: "iana",
		compressible: true
	},
		"application/yang-sid+json": {
		source: "iana",
		compressible: true
	},
		"application/yin+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"yin"
		]
	},
		"application/zip": {
		source: "iana",
		compressible: false,
		extensions: [
			"zip"
		]
	},
		"application/zip+dotlottie": {
		extensions: [
			"lottie"
		]
	},
		"application/zlib": {
		source: "iana"
	},
		"application/zstd": {
		source: "iana"
	},
		"audio/1d-interleaved-parityfec": {
		source: "iana"
	},
		"audio/32kadpcm": {
		source: "iana"
	},
		"audio/3gpp": {
		source: "iana",
		compressible: false,
		extensions: [
			"3gpp"
		]
	},
		"audio/3gpp2": {
		source: "iana"
	},
		"audio/aac": {
		source: "iana",
		extensions: [
			"adts",
			"aac"
		]
	},
		"audio/ac3": {
		source: "iana"
	},
		"audio/adpcm": {
		source: "apache",
		extensions: [
			"adp"
		]
	},
		"audio/amr": {
		source: "iana",
		extensions: [
			"amr"
		]
	},
		"audio/amr-wb": {
		source: "iana"
	},
		"audio/amr-wb+": {
		source: "iana"
	},
		"audio/aptx": {
		source: "iana"
	},
		"audio/asc": {
		source: "iana"
	},
		"audio/atrac-advanced-lossless": {
		source: "iana"
	},
		"audio/atrac-x": {
		source: "iana"
	},
		"audio/atrac3": {
		source: "iana"
	},
		"audio/basic": {
		source: "iana",
		compressible: false,
		extensions: [
			"au",
			"snd"
		]
	},
		"audio/bv16": {
		source: "iana"
	},
		"audio/bv32": {
		source: "iana"
	},
		"audio/clearmode": {
		source: "iana"
	},
		"audio/cn": {
		source: "iana"
	},
		"audio/dat12": {
		source: "iana"
	},
		"audio/dls": {
		source: "iana"
	},
		"audio/dsr-es201108": {
		source: "iana"
	},
		"audio/dsr-es202050": {
		source: "iana"
	},
		"audio/dsr-es202211": {
		source: "iana"
	},
		"audio/dsr-es202212": {
		source: "iana"
	},
		"audio/dv": {
		source: "iana"
	},
		"audio/dvi4": {
		source: "iana"
	},
		"audio/eac3": {
		source: "iana"
	},
		"audio/encaprtp": {
		source: "iana"
	},
		"audio/evrc": {
		source: "iana"
	},
		"audio/evrc-qcp": {
		source: "iana"
	},
		"audio/evrc0": {
		source: "iana"
	},
		"audio/evrc1": {
		source: "iana"
	},
		"audio/evrcb": {
		source: "iana"
	},
		"audio/evrcb0": {
		source: "iana"
	},
		"audio/evrcb1": {
		source: "iana"
	},
		"audio/evrcnw": {
		source: "iana"
	},
		"audio/evrcnw0": {
		source: "iana"
	},
		"audio/evrcnw1": {
		source: "iana"
	},
		"audio/evrcwb": {
		source: "iana"
	},
		"audio/evrcwb0": {
		source: "iana"
	},
		"audio/evrcwb1": {
		source: "iana"
	},
		"audio/evs": {
		source: "iana"
	},
		"audio/flac": {
		source: "iana"
	},
		"audio/flexfec": {
		source: "iana"
	},
		"audio/fwdred": {
		source: "iana"
	},
		"audio/g711-0": {
		source: "iana"
	},
		"audio/g719": {
		source: "iana"
	},
		"audio/g722": {
		source: "iana"
	},
		"audio/g7221": {
		source: "iana"
	},
		"audio/g723": {
		source: "iana"
	},
		"audio/g726-16": {
		source: "iana"
	},
		"audio/g726-24": {
		source: "iana"
	},
		"audio/g726-32": {
		source: "iana"
	},
		"audio/g726-40": {
		source: "iana"
	},
		"audio/g728": {
		source: "iana"
	},
		"audio/g729": {
		source: "iana"
	},
		"audio/g7291": {
		source: "iana"
	},
		"audio/g729d": {
		source: "iana"
	},
		"audio/g729e": {
		source: "iana"
	},
		"audio/gsm": {
		source: "iana"
	},
		"audio/gsm-efr": {
		source: "iana"
	},
		"audio/gsm-hr-08": {
		source: "iana"
	},
		"audio/ilbc": {
		source: "iana"
	},
		"audio/ip-mr_v2.5": {
		source: "iana"
	},
		"audio/isac": {
		source: "apache"
	},
		"audio/l16": {
		source: "iana"
	},
		"audio/l20": {
		source: "iana"
	},
		"audio/l24": {
		source: "iana",
		compressible: false
	},
		"audio/l8": {
		source: "iana"
	},
		"audio/lpc": {
		source: "iana"
	},
		"audio/matroska": {
		source: "iana"
	},
		"audio/melp": {
		source: "iana"
	},
		"audio/melp1200": {
		source: "iana"
	},
		"audio/melp2400": {
		source: "iana"
	},
		"audio/melp600": {
		source: "iana"
	},
		"audio/mhas": {
		source: "iana"
	},
		"audio/midi": {
		source: "apache",
		extensions: [
			"mid",
			"midi",
			"kar",
			"rmi"
		]
	},
		"audio/midi-clip": {
		source: "iana"
	},
		"audio/mobile-xmf": {
		source: "iana",
		extensions: [
			"mxmf"
		]
	},
		"audio/mp3": {
		compressible: false,
		extensions: [
			"mp3"
		]
	},
		"audio/mp4": {
		source: "iana",
		compressible: false,
		extensions: [
			"m4a",
			"mp4a",
			"m4b"
		]
	},
		"audio/mp4a-latm": {
		source: "iana"
	},
		"audio/mpa": {
		source: "iana"
	},
		"audio/mpa-robust": {
		source: "iana"
	},
		"audio/mpeg": {
		source: "iana",
		compressible: false,
		extensions: [
			"mpga",
			"mp2",
			"mp2a",
			"mp3",
			"m2a",
			"m3a"
		]
	},
		"audio/mpeg4-generic": {
		source: "iana"
	},
		"audio/musepack": {
		source: "apache"
	},
		"audio/ogg": {
		source: "iana",
		compressible: false,
		extensions: [
			"oga",
			"ogg",
			"spx",
			"opus"
		]
	},
		"audio/opus": {
		source: "iana"
	},
		"audio/parityfec": {
		source: "iana"
	},
		"audio/pcma": {
		source: "iana"
	},
		"audio/pcma-wb": {
		source: "iana"
	},
		"audio/pcmu": {
		source: "iana"
	},
		"audio/pcmu-wb": {
		source: "iana"
	},
		"audio/prs.sid": {
		source: "iana"
	},
		"audio/qcelp": {
		source: "iana"
	},
		"audio/raptorfec": {
		source: "iana"
	},
		"audio/red": {
		source: "iana"
	},
		"audio/rtp-enc-aescm128": {
		source: "iana"
	},
		"audio/rtp-midi": {
		source: "iana"
	},
		"audio/rtploopback": {
		source: "iana"
	},
		"audio/rtx": {
		source: "iana"
	},
		"audio/s3m": {
		source: "apache",
		extensions: [
			"s3m"
		]
	},
		"audio/scip": {
		source: "iana"
	},
		"audio/silk": {
		source: "apache",
		extensions: [
			"sil"
		]
	},
		"audio/smv": {
		source: "iana"
	},
		"audio/smv-qcp": {
		source: "iana"
	},
		"audio/smv0": {
		source: "iana"
	},
		"audio/sofa": {
		source: "iana"
	},
		"audio/sp-midi": {
		source: "iana"
	},
		"audio/speex": {
		source: "iana"
	},
		"audio/t140c": {
		source: "iana"
	},
		"audio/t38": {
		source: "iana"
	},
		"audio/telephone-event": {
		source: "iana"
	},
		"audio/tetra_acelp": {
		source: "iana"
	},
		"audio/tetra_acelp_bb": {
		source: "iana"
	},
		"audio/tone": {
		source: "iana"
	},
		"audio/tsvcis": {
		source: "iana"
	},
		"audio/uemclip": {
		source: "iana"
	},
		"audio/ulpfec": {
		source: "iana"
	},
		"audio/usac": {
		source: "iana"
	},
		"audio/vdvi": {
		source: "iana"
	},
		"audio/vmr-wb": {
		source: "iana"
	},
		"audio/vnd.3gpp.iufp": {
		source: "iana"
	},
		"audio/vnd.4sb": {
		source: "iana"
	},
		"audio/vnd.audiokoz": {
		source: "iana"
	},
		"audio/vnd.celp": {
		source: "iana"
	},
		"audio/vnd.cisco.nse": {
		source: "iana"
	},
		"audio/vnd.cmles.radio-events": {
		source: "iana"
	},
		"audio/vnd.cns.anp1": {
		source: "iana"
	},
		"audio/vnd.cns.inf1": {
		source: "iana"
	},
		"audio/vnd.dece.audio": {
		source: "iana",
		extensions: [
			"uva",
			"uvva"
		]
	},
		"audio/vnd.digital-winds": {
		source: "iana",
		extensions: [
			"eol"
		]
	},
		"audio/vnd.dlna.adts": {
		source: "iana"
	},
		"audio/vnd.dolby.heaac.1": {
		source: "iana"
	},
		"audio/vnd.dolby.heaac.2": {
		source: "iana"
	},
		"audio/vnd.dolby.mlp": {
		source: "iana"
	},
		"audio/vnd.dolby.mps": {
		source: "iana"
	},
		"audio/vnd.dolby.pl2": {
		source: "iana"
	},
		"audio/vnd.dolby.pl2x": {
		source: "iana"
	},
		"audio/vnd.dolby.pl2z": {
		source: "iana"
	},
		"audio/vnd.dolby.pulse.1": {
		source: "iana"
	},
		"audio/vnd.dra": {
		source: "iana",
		extensions: [
			"dra"
		]
	},
		"audio/vnd.dts": {
		source: "iana",
		extensions: [
			"dts"
		]
	},
		"audio/vnd.dts.hd": {
		source: "iana",
		extensions: [
			"dtshd"
		]
	},
		"audio/vnd.dts.uhd": {
		source: "iana"
	},
		"audio/vnd.dvb.file": {
		source: "iana"
	},
		"audio/vnd.everad.plj": {
		source: "iana"
	},
		"audio/vnd.hns.audio": {
		source: "iana"
	},
		"audio/vnd.lucent.voice": {
		source: "iana",
		extensions: [
			"lvp"
		]
	},
		"audio/vnd.ms-playready.media.pya": {
		source: "iana",
		extensions: [
			"pya"
		]
	},
		"audio/vnd.nokia.mobile-xmf": {
		source: "iana"
	},
		"audio/vnd.nortel.vbk": {
		source: "iana"
	},
		"audio/vnd.nuera.ecelp4800": {
		source: "iana",
		extensions: [
			"ecelp4800"
		]
	},
		"audio/vnd.nuera.ecelp7470": {
		source: "iana",
		extensions: [
			"ecelp7470"
		]
	},
		"audio/vnd.nuera.ecelp9600": {
		source: "iana",
		extensions: [
			"ecelp9600"
		]
	},
		"audio/vnd.octel.sbc": {
		source: "iana"
	},
		"audio/vnd.presonus.multitrack": {
		source: "iana"
	},
		"audio/vnd.qcelp": {
		source: "apache"
	},
		"audio/vnd.rhetorex.32kadpcm": {
		source: "iana"
	},
		"audio/vnd.rip": {
		source: "iana",
		extensions: [
			"rip"
		]
	},
		"audio/vnd.rn-realaudio": {
		compressible: false
	},
		"audio/vnd.sealedmedia.softseal.mpeg": {
		source: "iana"
	},
		"audio/vnd.vmx.cvsd": {
		source: "iana"
	},
		"audio/vnd.wave": {
		compressible: false
	},
		"audio/vorbis": {
		source: "iana",
		compressible: false
	},
		"audio/vorbis-config": {
		source: "iana"
	},
		"audio/wav": {
		compressible: false,
		extensions: [
			"wav"
		]
	},
		"audio/wave": {
		compressible: false,
		extensions: [
			"wav"
		]
	},
		"audio/webm": {
		source: "apache",
		compressible: false,
		extensions: [
			"weba"
		]
	},
		"audio/x-aac": {
		source: "apache",
		compressible: false,
		extensions: [
			"aac"
		]
	},
		"audio/x-aiff": {
		source: "apache",
		extensions: [
			"aif",
			"aiff",
			"aifc"
		]
	},
		"audio/x-caf": {
		source: "apache",
		compressible: false,
		extensions: [
			"caf"
		]
	},
		"audio/x-flac": {
		source: "apache",
		extensions: [
			"flac"
		]
	},
		"audio/x-m4a": {
		source: "nginx",
		extensions: [
			"m4a"
		]
	},
		"audio/x-matroska": {
		source: "apache",
		extensions: [
			"mka"
		]
	},
		"audio/x-mpegurl": {
		source: "apache",
		extensions: [
			"m3u"
		]
	},
		"audio/x-ms-wax": {
		source: "apache",
		extensions: [
			"wax"
		]
	},
		"audio/x-ms-wma": {
		source: "apache",
		extensions: [
			"wma"
		]
	},
		"audio/x-pn-realaudio": {
		source: "apache",
		extensions: [
			"ram",
			"ra"
		]
	},
		"audio/x-pn-realaudio-plugin": {
		source: "apache",
		extensions: [
			"rmp"
		]
	},
		"audio/x-realaudio": {
		source: "nginx",
		extensions: [
			"ra"
		]
	},
		"audio/x-tta": {
		source: "apache"
	},
		"audio/x-wav": {
		source: "apache",
		extensions: [
			"wav"
		]
	},
		"audio/xm": {
		source: "apache",
		extensions: [
			"xm"
		]
	},
		"chemical/x-cdx": {
		source: "apache",
		extensions: [
			"cdx"
		]
	},
		"chemical/x-cif": {
		source: "apache",
		extensions: [
			"cif"
		]
	},
		"chemical/x-cmdf": {
		source: "apache",
		extensions: [
			"cmdf"
		]
	},
		"chemical/x-cml": {
		source: "apache",
		extensions: [
			"cml"
		]
	},
		"chemical/x-csml": {
		source: "apache",
		extensions: [
			"csml"
		]
	},
		"chemical/x-pdb": {
		source: "apache"
	},
		"chemical/x-xyz": {
		source: "apache",
		extensions: [
			"xyz"
		]
	},
		"font/collection": {
		source: "iana",
		extensions: [
			"ttc"
		]
	},
		"font/otf": {
		source: "iana",
		compressible: true,
		extensions: [
			"otf"
		]
	},
		"font/sfnt": {
		source: "iana"
	},
		"font/ttf": {
		source: "iana",
		compressible: true,
		extensions: [
			"ttf"
		]
	},
		"font/woff": {
		source: "iana",
		extensions: [
			"woff"
		]
	},
		"font/woff2": {
		source: "iana",
		extensions: [
			"woff2"
		]
	},
		"image/aces": {
		source: "iana",
		extensions: [
			"exr"
		]
	},
		"image/apng": {
		source: "iana",
		compressible: false,
		extensions: [
			"apng"
		]
	},
		"image/avci": {
		source: "iana",
		extensions: [
			"avci"
		]
	},
		"image/avcs": {
		source: "iana",
		extensions: [
			"avcs"
		]
	},
		"image/avif": {
		source: "iana",
		compressible: false,
		extensions: [
			"avif"
		]
	},
		"image/bmp": {
		source: "iana",
		compressible: true,
		extensions: [
			"bmp",
			"dib"
		]
	},
		"image/cgm": {
		source: "iana",
		extensions: [
			"cgm"
		]
	},
		"image/dicom-rle": {
		source: "iana",
		extensions: [
			"drle"
		]
	},
		"image/dpx": {
		source: "iana",
		extensions: [
			"dpx"
		]
	},
		"image/emf": {
		source: "iana",
		extensions: [
			"emf"
		]
	},
		"image/fits": {
		source: "iana",
		extensions: [
			"fits"
		]
	},
		"image/g3fax": {
		source: "iana",
		extensions: [
			"g3"
		]
	},
		"image/gif": {
		source: "iana",
		compressible: false,
		extensions: [
			"gif"
		]
	},
		"image/heic": {
		source: "iana",
		extensions: [
			"heic"
		]
	},
		"image/heic-sequence": {
		source: "iana",
		extensions: [
			"heics"
		]
	},
		"image/heif": {
		source: "iana",
		extensions: [
			"heif"
		]
	},
		"image/heif-sequence": {
		source: "iana",
		extensions: [
			"heifs"
		]
	},
		"image/hej2k": {
		source: "iana",
		extensions: [
			"hej2"
		]
	},
		"image/ief": {
		source: "iana",
		extensions: [
			"ief"
		]
	},
		"image/j2c": {
		source: "iana"
	},
		"image/jaii": {
		source: "iana",
		extensions: [
			"jaii"
		]
	},
		"image/jais": {
		source: "iana",
		extensions: [
			"jais"
		]
	},
		"image/jls": {
		source: "iana",
		extensions: [
			"jls"
		]
	},
		"image/jp2": {
		source: "iana",
		compressible: false,
		extensions: [
			"jp2",
			"jpg2"
		]
	},
		"image/jpeg": {
		source: "iana",
		compressible: false,
		extensions: [
			"jpg",
			"jpeg",
			"jpe"
		]
	},
		"image/jph": {
		source: "iana",
		extensions: [
			"jph"
		]
	},
		"image/jphc": {
		source: "iana",
		extensions: [
			"jhc"
		]
	},
		"image/jpm": {
		source: "iana",
		compressible: false,
		extensions: [
			"jpm",
			"jpgm"
		]
	},
		"image/jpx": {
		source: "iana",
		compressible: false,
		extensions: [
			"jpx",
			"jpf"
		]
	},
		"image/jxl": {
		source: "iana",
		extensions: [
			"jxl"
		]
	},
		"image/jxr": {
		source: "iana",
		extensions: [
			"jxr"
		]
	},
		"image/jxra": {
		source: "iana",
		extensions: [
			"jxra"
		]
	},
		"image/jxrs": {
		source: "iana",
		extensions: [
			"jxrs"
		]
	},
		"image/jxs": {
		source: "iana",
		extensions: [
			"jxs"
		]
	},
		"image/jxsc": {
		source: "iana",
		extensions: [
			"jxsc"
		]
	},
		"image/jxsi": {
		source: "iana",
		extensions: [
			"jxsi"
		]
	},
		"image/jxss": {
		source: "iana",
		extensions: [
			"jxss"
		]
	},
		"image/ktx": {
		source: "iana",
		extensions: [
			"ktx"
		]
	},
		"image/ktx2": {
		source: "iana",
		extensions: [
			"ktx2"
		]
	},
		"image/naplps": {
		source: "iana"
	},
		"image/pjpeg": {
		compressible: false,
		extensions: [
			"jfif"
		]
	},
		"image/png": {
		source: "iana",
		compressible: false,
		extensions: [
			"png"
		]
	},
		"image/prs.btif": {
		source: "iana",
		extensions: [
			"btif",
			"btf"
		]
	},
		"image/prs.pti": {
		source: "iana",
		extensions: [
			"pti"
		]
	},
		"image/pwg-raster": {
		source: "iana"
	},
		"image/sgi": {
		source: "apache",
		extensions: [
			"sgi"
		]
	},
		"image/svg+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"svg",
			"svgz"
		]
	},
		"image/t38": {
		source: "iana",
		extensions: [
			"t38"
		]
	},
		"image/tiff": {
		source: "iana",
		compressible: false,
		extensions: [
			"tif",
			"tiff"
		]
	},
		"image/tiff-fx": {
		source: "iana",
		extensions: [
			"tfx"
		]
	},
		"image/vnd.adobe.photoshop": {
		source: "iana",
		compressible: true,
		extensions: [
			"psd"
		]
	},
		"image/vnd.airzip.accelerator.azv": {
		source: "iana",
		extensions: [
			"azv"
		]
	},
		"image/vnd.clip": {
		source: "iana"
	},
		"image/vnd.cns.inf2": {
		source: "iana"
	},
		"image/vnd.dece.graphic": {
		source: "iana",
		extensions: [
			"uvi",
			"uvvi",
			"uvg",
			"uvvg"
		]
	},
		"image/vnd.djvu": {
		source: "iana",
		extensions: [
			"djvu",
			"djv"
		]
	},
		"image/vnd.dvb.subtitle": {
		source: "iana",
		extensions: [
			"sub"
		]
	},
		"image/vnd.dwg": {
		source: "iana",
		extensions: [
			"dwg"
		]
	},
		"image/vnd.dxf": {
		source: "iana",
		extensions: [
			"dxf"
		]
	},
		"image/vnd.fastbidsheet": {
		source: "iana",
		extensions: [
			"fbs"
		]
	},
		"image/vnd.fpx": {
		source: "iana",
		extensions: [
			"fpx"
		]
	},
		"image/vnd.fst": {
		source: "iana",
		extensions: [
			"fst"
		]
	},
		"image/vnd.fujixerox.edmics-mmr": {
		source: "iana",
		extensions: [
			"mmr"
		]
	},
		"image/vnd.fujixerox.edmics-rlc": {
		source: "iana",
		extensions: [
			"rlc"
		]
	},
		"image/vnd.globalgraphics.pgb": {
		source: "iana"
	},
		"image/vnd.microsoft.icon": {
		source: "iana",
		compressible: true,
		extensions: [
			"ico"
		]
	},
		"image/vnd.mix": {
		source: "iana"
	},
		"image/vnd.mozilla.apng": {
		source: "iana"
	},
		"image/vnd.ms-dds": {
		compressible: true,
		extensions: [
			"dds"
		]
	},
		"image/vnd.ms-modi": {
		source: "iana",
		extensions: [
			"mdi"
		]
	},
		"image/vnd.ms-photo": {
		source: "apache",
		extensions: [
			"wdp"
		]
	},
		"image/vnd.net-fpx": {
		source: "iana",
		extensions: [
			"npx"
		]
	},
		"image/vnd.pco.b16": {
		source: "iana",
		extensions: [
			"b16"
		]
	},
		"image/vnd.radiance": {
		source: "iana"
	},
		"image/vnd.sealed.png": {
		source: "iana"
	},
		"image/vnd.sealedmedia.softseal.gif": {
		source: "iana"
	},
		"image/vnd.sealedmedia.softseal.jpg": {
		source: "iana"
	},
		"image/vnd.svf": {
		source: "iana"
	},
		"image/vnd.tencent.tap": {
		source: "iana",
		extensions: [
			"tap"
		]
	},
		"image/vnd.valve.source.texture": {
		source: "iana",
		extensions: [
			"vtf"
		]
	},
		"image/vnd.wap.wbmp": {
		source: "iana",
		extensions: [
			"wbmp"
		]
	},
		"image/vnd.xiff": {
		source: "iana",
		extensions: [
			"xif"
		]
	},
		"image/vnd.zbrush.pcx": {
		source: "iana",
		extensions: [
			"pcx"
		]
	},
		"image/webp": {
		source: "iana",
		extensions: [
			"webp"
		]
	},
		"image/wmf": {
		source: "iana",
		extensions: [
			"wmf"
		]
	},
		"image/x-3ds": {
		source: "apache",
		extensions: [
			"3ds"
		]
	},
		"image/x-adobe-dng": {
		extensions: [
			"dng"
		]
	},
		"image/x-cmu-raster": {
		source: "apache",
		extensions: [
			"ras"
		]
	},
		"image/x-cmx": {
		source: "apache",
		extensions: [
			"cmx"
		]
	},
		"image/x-emf": {
		source: "iana"
	},
		"image/x-freehand": {
		source: "apache",
		extensions: [
			"fh",
			"fhc",
			"fh4",
			"fh5",
			"fh7"
		]
	},
		"image/x-icon": {
		source: "apache",
		compressible: true,
		extensions: [
			"ico"
		]
	},
		"image/x-jng": {
		source: "nginx",
		extensions: [
			"jng"
		]
	},
		"image/x-mrsid-image": {
		source: "apache",
		extensions: [
			"sid"
		]
	},
		"image/x-ms-bmp": {
		source: "nginx",
		compressible: true,
		extensions: [
			"bmp"
		]
	},
		"image/x-pcx": {
		source: "apache",
		extensions: [
			"pcx"
		]
	},
		"image/x-pict": {
		source: "apache",
		extensions: [
			"pic",
			"pct"
		]
	},
		"image/x-portable-anymap": {
		source: "apache",
		extensions: [
			"pnm"
		]
	},
		"image/x-portable-bitmap": {
		source: "apache",
		extensions: [
			"pbm"
		]
	},
		"image/x-portable-graymap": {
		source: "apache",
		extensions: [
			"pgm"
		]
	},
		"image/x-portable-pixmap": {
		source: "apache",
		extensions: [
			"ppm"
		]
	},
		"image/x-rgb": {
		source: "apache",
		extensions: [
			"rgb"
		]
	},
		"image/x-tga": {
		source: "apache",
		extensions: [
			"tga"
		]
	},
		"image/x-wmf": {
		source: "iana"
	},
		"image/x-xbitmap": {
		source: "apache",
		extensions: [
			"xbm"
		]
	},
		"image/x-xcf": {
		compressible: false
	},
		"image/x-xpixmap": {
		source: "apache",
		extensions: [
			"xpm"
		]
	},
		"image/x-xwindowdump": {
		source: "apache",
		extensions: [
			"xwd"
		]
	},
		"message/bhttp": {
		source: "iana"
	},
		"message/cpim": {
		source: "iana"
	},
		"message/delivery-status": {
		source: "iana"
	},
		"message/disposition-notification": {
		source: "iana",
		extensions: [
			"disposition-notification"
		]
	},
		"message/external-body": {
		source: "iana"
	},
		"message/feedback-report": {
		source: "iana"
	},
		"message/global": {
		source: "iana",
		extensions: [
			"u8msg"
		]
	},
		"message/global-delivery-status": {
		source: "iana",
		extensions: [
			"u8dsn"
		]
	},
		"message/global-disposition-notification": {
		source: "iana",
		extensions: [
			"u8mdn"
		]
	},
		"message/global-headers": {
		source: "iana",
		extensions: [
			"u8hdr"
		]
	},
		"message/http": {
		source: "iana",
		compressible: false
	},
		"message/imdn+xml": {
		source: "iana",
		compressible: true
	},
		"message/mls": {
		source: "iana"
	},
		"message/news": {
		source: "apache"
	},
		"message/ohttp-req": {
		source: "iana"
	},
		"message/ohttp-res": {
		source: "iana"
	},
		"message/partial": {
		source: "iana",
		compressible: false
	},
		"message/rfc822": {
		source: "iana",
		compressible: true,
		extensions: [
			"eml",
			"mime",
			"mht",
			"mhtml"
		]
	},
		"message/s-http": {
		source: "apache"
	},
		"message/sip": {
		source: "iana"
	},
		"message/sipfrag": {
		source: "iana"
	},
		"message/tracking-status": {
		source: "iana"
	},
		"message/vnd.si.simp": {
		source: "apache"
	},
		"message/vnd.wfa.wsc": {
		source: "iana",
		extensions: [
			"wsc"
		]
	},
		"model/3mf": {
		source: "iana",
		extensions: [
			"3mf"
		]
	},
		"model/e57": {
		source: "iana"
	},
		"model/gltf+json": {
		source: "iana",
		compressible: true,
		extensions: [
			"gltf"
		]
	},
		"model/gltf-binary": {
		source: "iana",
		compressible: true,
		extensions: [
			"glb"
		]
	},
		"model/iges": {
		source: "iana",
		compressible: false,
		extensions: [
			"igs",
			"iges"
		]
	},
		"model/jt": {
		source: "iana",
		extensions: [
			"jt"
		]
	},
		"model/mesh": {
		source: "iana",
		compressible: false,
		extensions: [
			"msh",
			"mesh",
			"silo"
		]
	},
		"model/mtl": {
		source: "iana",
		extensions: [
			"mtl"
		]
	},
		"model/obj": {
		source: "iana",
		extensions: [
			"obj"
		]
	},
		"model/prc": {
		source: "iana",
		extensions: [
			"prc"
		]
	},
		"model/step": {
		source: "iana",
		extensions: [
			"step",
			"stp",
			"stpnc",
			"p21",
			"210"
		]
	},
		"model/step+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"stpx"
		]
	},
		"model/step+zip": {
		source: "iana",
		compressible: false,
		extensions: [
			"stpz"
		]
	},
		"model/step-xml+zip": {
		source: "iana",
		compressible: false,
		extensions: [
			"stpxz"
		]
	},
		"model/stl": {
		source: "iana",
		extensions: [
			"stl"
		]
	},
		"model/u3d": {
		source: "iana",
		extensions: [
			"u3d"
		]
	},
		"model/vnd.bary": {
		source: "iana",
		extensions: [
			"bary"
		]
	},
		"model/vnd.cld": {
		source: "iana",
		extensions: [
			"cld"
		]
	},
		"model/vnd.collada+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"dae"
		]
	},
		"model/vnd.dwf": {
		source: "iana",
		extensions: [
			"dwf"
		]
	},
		"model/vnd.flatland.3dml": {
		source: "iana"
	},
		"model/vnd.gdl": {
		source: "iana",
		extensions: [
			"gdl"
		]
	},
		"model/vnd.gs-gdl": {
		source: "apache"
	},
		"model/vnd.gs.gdl": {
		source: "iana"
	},
		"model/vnd.gtw": {
		source: "iana",
		extensions: [
			"gtw"
		]
	},
		"model/vnd.moml+xml": {
		source: "iana",
		compressible: true
	},
		"model/vnd.mts": {
		source: "iana",
		extensions: [
			"mts"
		]
	},
		"model/vnd.opengex": {
		source: "iana",
		extensions: [
			"ogex"
		]
	},
		"model/vnd.parasolid.transmit.binary": {
		source: "iana",
		extensions: [
			"x_b"
		]
	},
		"model/vnd.parasolid.transmit.text": {
		source: "iana",
		extensions: [
			"x_t"
		]
	},
		"model/vnd.pytha.pyox": {
		source: "iana",
		extensions: [
			"pyo",
			"pyox"
		]
	},
		"model/vnd.rosette.annotated-data-model": {
		source: "iana"
	},
		"model/vnd.sap.vds": {
		source: "iana",
		extensions: [
			"vds"
		]
	},
		"model/vnd.usda": {
		source: "iana",
		extensions: [
			"usda"
		]
	},
		"model/vnd.usdz+zip": {
		source: "iana",
		compressible: false,
		extensions: [
			"usdz"
		]
	},
		"model/vnd.valve.source.compiled-map": {
		source: "iana",
		extensions: [
			"bsp"
		]
	},
		"model/vnd.vtu": {
		source: "iana",
		extensions: [
			"vtu"
		]
	},
		"model/vrml": {
		source: "iana",
		compressible: false,
		extensions: [
			"wrl",
			"vrml"
		]
	},
		"model/x3d+binary": {
		source: "apache",
		compressible: false,
		extensions: [
			"x3db",
			"x3dbz"
		]
	},
		"model/x3d+fastinfoset": {
		source: "iana",
		extensions: [
			"x3db"
		]
	},
		"model/x3d+vrml": {
		source: "apache",
		compressible: false,
		extensions: [
			"x3dv",
			"x3dvz"
		]
	},
		"model/x3d+xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"x3d",
			"x3dz"
		]
	},
		"model/x3d-vrml": {
		source: "iana",
		extensions: [
			"x3dv"
		]
	},
		"multipart/alternative": {
		source: "iana",
		compressible: false
	},
		"multipart/appledouble": {
		source: "iana"
	},
		"multipart/byteranges": {
		source: "iana"
	},
		"multipart/digest": {
		source: "iana"
	},
		"multipart/encrypted": {
		source: "iana",
		compressible: false
	},
		"multipart/form-data": {
		source: "iana",
		compressible: false
	},
		"multipart/header-set": {
		source: "iana"
	},
		"multipart/mixed": {
		source: "iana"
	},
		"multipart/multilingual": {
		source: "iana"
	},
		"multipart/parallel": {
		source: "iana"
	},
		"multipart/related": {
		source: "iana",
		compressible: false
	},
		"multipart/report": {
		source: "iana"
	},
		"multipart/signed": {
		source: "iana",
		compressible: false
	},
		"multipart/vnd.bint.med-plus": {
		source: "iana"
	},
		"multipart/voice-message": {
		source: "iana"
	},
		"multipart/x-mixed-replace": {
		source: "iana"
	},
		"text/1d-interleaved-parityfec": {
		source: "iana"
	},
		"text/cache-manifest": {
		source: "iana",
		compressible: true,
		extensions: [
			"appcache",
			"manifest"
		]
	},
		"text/calendar": {
		source: "iana",
		extensions: [
			"ics",
			"ifb"
		]
	},
		"text/calender": {
		compressible: true
	},
		"text/cmd": {
		compressible: true
	},
		"text/coffeescript": {
		extensions: [
			"coffee",
			"litcoffee"
		]
	},
		"text/cql": {
		source: "iana"
	},
		"text/cql-expression": {
		source: "iana"
	},
		"text/cql-identifier": {
		source: "iana"
	},
		"text/css": {
		source: "iana",
		charset: "UTF-8",
		compressible: true,
		extensions: [
			"css"
		]
	},
		"text/csv": {
		source: "iana",
		compressible: true,
		extensions: [
			"csv"
		]
	},
		"text/csv-schema": {
		source: "iana"
	},
		"text/directory": {
		source: "iana"
	},
		"text/dns": {
		source: "iana"
	},
		"text/ecmascript": {
		source: "apache"
	},
		"text/encaprtp": {
		source: "iana"
	},
		"text/enriched": {
		source: "iana"
	},
		"text/fhirpath": {
		source: "iana"
	},
		"text/flexfec": {
		source: "iana"
	},
		"text/fwdred": {
		source: "iana"
	},
		"text/gff3": {
		source: "iana"
	},
		"text/grammar-ref-list": {
		source: "iana"
	},
		"text/hl7v2": {
		source: "iana"
	},
		"text/html": {
		source: "iana",
		compressible: true,
		extensions: [
			"html",
			"htm",
			"shtml"
		]
	},
		"text/jade": {
		extensions: [
			"jade"
		]
	},
		"text/javascript": {
		source: "iana",
		charset: "UTF-8",
		compressible: true,
		extensions: [
			"js",
			"mjs"
		]
	},
		"text/jcr-cnd": {
		source: "iana"
	},
		"text/jsx": {
		compressible: true,
		extensions: [
			"jsx"
		]
	},
		"text/less": {
		compressible: true,
		extensions: [
			"less"
		]
	},
		"text/markdown": {
		source: "iana",
		compressible: true,
		extensions: [
			"md",
			"markdown"
		]
	},
		"text/mathml": {
		source: "nginx",
		extensions: [
			"mml"
		]
	},
		"text/mdx": {
		compressible: true,
		extensions: [
			"mdx"
		]
	},
		"text/mizar": {
		source: "iana"
	},
		"text/n3": {
		source: "iana",
		charset: "UTF-8",
		compressible: true,
		extensions: [
			"n3"
		]
	},
		"text/parameters": {
		source: "iana",
		charset: "UTF-8"
	},
		"text/parityfec": {
		source: "iana"
	},
		"text/plain": {
		source: "iana",
		compressible: true,
		extensions: [
			"txt",
			"text",
			"conf",
			"def",
			"list",
			"log",
			"in",
			"ini"
		]
	},
		"text/provenance-notation": {
		source: "iana",
		charset: "UTF-8"
	},
		"text/prs.fallenstein.rst": {
		source: "iana"
	},
		"text/prs.lines.tag": {
		source: "iana",
		extensions: [
			"dsc"
		]
	},
		"text/prs.prop.logic": {
		source: "iana"
	},
		"text/prs.texi": {
		source: "iana"
	},
		"text/raptorfec": {
		source: "iana"
	},
		"text/red": {
		source: "iana"
	},
		"text/rfc822-headers": {
		source: "iana"
	},
		"text/richtext": {
		source: "iana",
		compressible: true,
		extensions: [
			"rtx"
		]
	},
		"text/rtf": {
		source: "iana",
		compressible: true,
		extensions: [
			"rtf"
		]
	},
		"text/rtp-enc-aescm128": {
		source: "iana"
	},
		"text/rtploopback": {
		source: "iana"
	},
		"text/rtx": {
		source: "iana"
	},
		"text/sgml": {
		source: "iana",
		extensions: [
			"sgml",
			"sgm"
		]
	},
		"text/shaclc": {
		source: "iana"
	},
		"text/shex": {
		source: "iana",
		extensions: [
			"shex"
		]
	},
		"text/slim": {
		extensions: [
			"slim",
			"slm"
		]
	},
		"text/spdx": {
		source: "iana",
		extensions: [
			"spdx"
		]
	},
		"text/strings": {
		source: "iana"
	},
		"text/stylus": {
		extensions: [
			"stylus",
			"styl"
		]
	},
		"text/t140": {
		source: "iana"
	},
		"text/tab-separated-values": {
		source: "iana",
		compressible: true,
		extensions: [
			"tsv"
		]
	},
		"text/troff": {
		source: "iana",
		extensions: [
			"t",
			"tr",
			"roff",
			"man",
			"me",
			"ms"
		]
	},
		"text/turtle": {
		source: "iana",
		charset: "UTF-8",
		extensions: [
			"ttl"
		]
	},
		"text/ulpfec": {
		source: "iana"
	},
		"text/uri-list": {
		source: "iana",
		compressible: true,
		extensions: [
			"uri",
			"uris",
			"urls"
		]
	},
		"text/vcard": {
		source: "iana",
		compressible: true,
		extensions: [
			"vcard"
		]
	},
		"text/vnd.a": {
		source: "iana"
	},
		"text/vnd.abc": {
		source: "iana"
	},
		"text/vnd.ascii-art": {
		source: "iana"
	},
		"text/vnd.curl": {
		source: "iana",
		extensions: [
			"curl"
		]
	},
		"text/vnd.curl.dcurl": {
		source: "apache",
		extensions: [
			"dcurl"
		]
	},
		"text/vnd.curl.mcurl": {
		source: "apache",
		extensions: [
			"mcurl"
		]
	},
		"text/vnd.curl.scurl": {
		source: "apache",
		extensions: [
			"scurl"
		]
	},
		"text/vnd.debian.copyright": {
		source: "iana",
		charset: "UTF-8"
	},
		"text/vnd.dmclientscript": {
		source: "iana"
	},
		"text/vnd.dvb.subtitle": {
		source: "iana",
		extensions: [
			"sub"
		]
	},
		"text/vnd.esmertec.theme-descriptor": {
		source: "iana",
		charset: "UTF-8"
	},
		"text/vnd.exchangeable": {
		source: "iana"
	},
		"text/vnd.familysearch.gedcom": {
		source: "iana",
		extensions: [
			"ged"
		]
	},
		"text/vnd.ficlab.flt": {
		source: "iana"
	},
		"text/vnd.fly": {
		source: "iana",
		extensions: [
			"fly"
		]
	},
		"text/vnd.fmi.flexstor": {
		source: "iana",
		extensions: [
			"flx"
		]
	},
		"text/vnd.gml": {
		source: "iana"
	},
		"text/vnd.graphviz": {
		source: "iana",
		extensions: [
			"gv"
		]
	},
		"text/vnd.hans": {
		source: "iana"
	},
		"text/vnd.hgl": {
		source: "iana"
	},
		"text/vnd.in3d.3dml": {
		source: "iana",
		extensions: [
			"3dml"
		]
	},
		"text/vnd.in3d.spot": {
		source: "iana",
		extensions: [
			"spot"
		]
	},
		"text/vnd.iptc.newsml": {
		source: "iana"
	},
		"text/vnd.iptc.nitf": {
		source: "iana"
	},
		"text/vnd.latex-z": {
		source: "iana"
	},
		"text/vnd.motorola.reflex": {
		source: "iana"
	},
		"text/vnd.ms-mediapackage": {
		source: "iana"
	},
		"text/vnd.net2phone.commcenter.command": {
		source: "iana"
	},
		"text/vnd.radisys.msml-basic-layout": {
		source: "iana"
	},
		"text/vnd.senx.warpscript": {
		source: "iana"
	},
		"text/vnd.si.uricatalogue": {
		source: "apache"
	},
		"text/vnd.sosi": {
		source: "iana"
	},
		"text/vnd.sun.j2me.app-descriptor": {
		source: "iana",
		charset: "UTF-8",
		extensions: [
			"jad"
		]
	},
		"text/vnd.trolltech.linguist": {
		source: "iana",
		charset: "UTF-8"
	},
		"text/vnd.vcf": {
		source: "iana"
	},
		"text/vnd.wap.si": {
		source: "iana"
	},
		"text/vnd.wap.sl": {
		source: "iana"
	},
		"text/vnd.wap.wml": {
		source: "iana",
		extensions: [
			"wml"
		]
	},
		"text/vnd.wap.wmlscript": {
		source: "iana",
		extensions: [
			"wmls"
		]
	},
		"text/vnd.zoo.kcl": {
		source: "iana"
	},
		"text/vtt": {
		source: "iana",
		charset: "UTF-8",
		compressible: true,
		extensions: [
			"vtt"
		]
	},
		"text/wgsl": {
		source: "iana",
		extensions: [
			"wgsl"
		]
	},
		"text/x-asm": {
		source: "apache",
		extensions: [
			"s",
			"asm"
		]
	},
		"text/x-c": {
		source: "apache",
		extensions: [
			"c",
			"cc",
			"cxx",
			"cpp",
			"h",
			"hh",
			"dic"
		]
	},
		"text/x-component": {
		source: "nginx",
		extensions: [
			"htc"
		]
	},
		"text/x-fortran": {
		source: "apache",
		extensions: [
			"f",
			"for",
			"f77",
			"f90"
		]
	},
		"text/x-gwt-rpc": {
		compressible: true
	},
		"text/x-handlebars-template": {
		extensions: [
			"hbs"
		]
	},
		"text/x-java-source": {
		source: "apache",
		extensions: [
			"java"
		]
	},
		"text/x-jquery-tmpl": {
		compressible: true
	},
		"text/x-lua": {
		extensions: [
			"lua"
		]
	},
		"text/x-markdown": {
		compressible: true,
		extensions: [
			"mkd"
		]
	},
		"text/x-nfo": {
		source: "apache",
		extensions: [
			"nfo"
		]
	},
		"text/x-opml": {
		source: "apache",
		extensions: [
			"opml"
		]
	},
		"text/x-org": {
		compressible: true,
		extensions: [
			"org"
		]
	},
		"text/x-pascal": {
		source: "apache",
		extensions: [
			"p",
			"pas"
		]
	},
		"text/x-processing": {
		compressible: true,
		extensions: [
			"pde"
		]
	},
		"text/x-sass": {
		extensions: [
			"sass"
		]
	},
		"text/x-scss": {
		extensions: [
			"scss"
		]
	},
		"text/x-setext": {
		source: "apache",
		extensions: [
			"etx"
		]
	},
		"text/x-sfv": {
		source: "apache",
		extensions: [
			"sfv"
		]
	},
		"text/x-suse-ymp": {
		compressible: true,
		extensions: [
			"ymp"
		]
	},
		"text/x-uuencode": {
		source: "apache",
		extensions: [
			"uu"
		]
	},
		"text/x-vcalendar": {
		source: "apache",
		extensions: [
			"vcs"
		]
	},
		"text/x-vcard": {
		source: "apache",
		extensions: [
			"vcf"
		]
	},
		"text/xml": {
		source: "iana",
		compressible: true,
		extensions: [
			"xml"
		]
	},
		"text/xml-external-parsed-entity": {
		source: "iana"
	},
		"text/yaml": {
		compressible: true,
		extensions: [
			"yaml",
			"yml"
		]
	},
		"video/1d-interleaved-parityfec": {
		source: "iana"
	},
		"video/3gpp": {
		source: "iana",
		extensions: [
			"3gp",
			"3gpp"
		]
	},
		"video/3gpp-tt": {
		source: "iana"
	},
		"video/3gpp2": {
		source: "iana",
		extensions: [
			"3g2"
		]
	},
		"video/av1": {
		source: "iana"
	},
		"video/bmpeg": {
		source: "iana"
	},
		"video/bt656": {
		source: "iana"
	},
		"video/celb": {
		source: "iana"
	},
		"video/dv": {
		source: "iana"
	},
		"video/encaprtp": {
		source: "iana"
	},
		"video/evc": {
		source: "iana"
	},
		"video/ffv1": {
		source: "iana"
	},
		"video/flexfec": {
		source: "iana"
	},
		"video/h261": {
		source: "iana",
		extensions: [
			"h261"
		]
	},
		"video/h263": {
		source: "iana",
		extensions: [
			"h263"
		]
	},
		"video/h263-1998": {
		source: "iana"
	},
		"video/h263-2000": {
		source: "iana"
	},
		"video/h264": {
		source: "iana",
		extensions: [
			"h264"
		]
	},
		"video/h264-rcdo": {
		source: "iana"
	},
		"video/h264-svc": {
		source: "iana"
	},
		"video/h265": {
		source: "iana"
	},
		"video/h266": {
		source: "iana"
	},
		"video/iso.segment": {
		source: "iana",
		extensions: [
			"m4s"
		]
	},
		"video/jpeg": {
		source: "iana",
		extensions: [
			"jpgv"
		]
	},
		"video/jpeg2000": {
		source: "iana"
	},
		"video/jpm": {
		source: "apache",
		extensions: [
			"jpm",
			"jpgm"
		]
	},
		"video/jxsv": {
		source: "iana"
	},
		"video/lottie+json": {
		source: "iana",
		compressible: true
	},
		"video/matroska": {
		source: "iana"
	},
		"video/matroska-3d": {
		source: "iana"
	},
		"video/mj2": {
		source: "iana",
		extensions: [
			"mj2",
			"mjp2"
		]
	},
		"video/mp1s": {
		source: "iana"
	},
		"video/mp2p": {
		source: "iana"
	},
		"video/mp2t": {
		source: "iana",
		extensions: [
			"ts",
			"m2t",
			"m2ts",
			"mts"
		]
	},
		"video/mp4": {
		source: "iana",
		compressible: false,
		extensions: [
			"mp4",
			"mp4v",
			"mpg4"
		]
	},
		"video/mp4v-es": {
		source: "iana"
	},
		"video/mpeg": {
		source: "iana",
		compressible: false,
		extensions: [
			"mpeg",
			"mpg",
			"mpe",
			"m1v",
			"m2v"
		]
	},
		"video/mpeg4-generic": {
		source: "iana"
	},
		"video/mpv": {
		source: "iana"
	},
		"video/nv": {
		source: "iana"
	},
		"video/ogg": {
		source: "iana",
		compressible: false,
		extensions: [
			"ogv"
		]
	},
		"video/parityfec": {
		source: "iana"
	},
		"video/pointer": {
		source: "iana"
	},
		"video/quicktime": {
		source: "iana",
		compressible: false,
		extensions: [
			"qt",
			"mov"
		]
	},
		"video/raptorfec": {
		source: "iana"
	},
		"video/raw": {
		source: "iana"
	},
		"video/rtp-enc-aescm128": {
		source: "iana"
	},
		"video/rtploopback": {
		source: "iana"
	},
		"video/rtx": {
		source: "iana"
	},
		"video/scip": {
		source: "iana"
	},
		"video/smpte291": {
		source: "iana"
	},
		"video/smpte292m": {
		source: "iana"
	},
		"video/ulpfec": {
		source: "iana"
	},
		"video/vc1": {
		source: "iana"
	},
		"video/vc2": {
		source: "iana"
	},
		"video/vnd.cctv": {
		source: "iana"
	},
		"video/vnd.dece.hd": {
		source: "iana",
		extensions: [
			"uvh",
			"uvvh"
		]
	},
		"video/vnd.dece.mobile": {
		source: "iana",
		extensions: [
			"uvm",
			"uvvm"
		]
	},
		"video/vnd.dece.mp4": {
		source: "iana"
	},
		"video/vnd.dece.pd": {
		source: "iana",
		extensions: [
			"uvp",
			"uvvp"
		]
	},
		"video/vnd.dece.sd": {
		source: "iana",
		extensions: [
			"uvs",
			"uvvs"
		]
	},
		"video/vnd.dece.video": {
		source: "iana",
		extensions: [
			"uvv",
			"uvvv"
		]
	},
		"video/vnd.directv.mpeg": {
		source: "iana"
	},
		"video/vnd.directv.mpeg-tts": {
		source: "iana"
	},
		"video/vnd.dlna.mpeg-tts": {
		source: "iana"
	},
		"video/vnd.dvb.file": {
		source: "iana",
		extensions: [
			"dvb"
		]
	},
		"video/vnd.fvt": {
		source: "iana",
		extensions: [
			"fvt"
		]
	},
		"video/vnd.hns.video": {
		source: "iana"
	},
		"video/vnd.iptvforum.1dparityfec-1010": {
		source: "iana"
	},
		"video/vnd.iptvforum.1dparityfec-2005": {
		source: "iana"
	},
		"video/vnd.iptvforum.2dparityfec-1010": {
		source: "iana"
	},
		"video/vnd.iptvforum.2dparityfec-2005": {
		source: "iana"
	},
		"video/vnd.iptvforum.ttsavc": {
		source: "iana"
	},
		"video/vnd.iptvforum.ttsmpeg2": {
		source: "iana"
	},
		"video/vnd.motorola.video": {
		source: "iana"
	},
		"video/vnd.motorola.videop": {
		source: "iana"
	},
		"video/vnd.mpegurl": {
		source: "iana",
		extensions: [
			"mxu",
			"m4u"
		]
	},
		"video/vnd.ms-playready.media.pyv": {
		source: "iana",
		extensions: [
			"pyv"
		]
	},
		"video/vnd.nokia.interleaved-multimedia": {
		source: "iana"
	},
		"video/vnd.nokia.mp4vr": {
		source: "iana"
	},
		"video/vnd.nokia.videovoip": {
		source: "iana"
	},
		"video/vnd.objectvideo": {
		source: "iana"
	},
		"video/vnd.planar": {
		source: "iana"
	},
		"video/vnd.radgamettools.bink": {
		source: "iana"
	},
		"video/vnd.radgamettools.smacker": {
		source: "apache"
	},
		"video/vnd.sealed.mpeg1": {
		source: "iana"
	},
		"video/vnd.sealed.mpeg4": {
		source: "iana"
	},
		"video/vnd.sealed.swf": {
		source: "iana"
	},
		"video/vnd.sealedmedia.softseal.mov": {
		source: "iana"
	},
		"video/vnd.uvvu.mp4": {
		source: "iana",
		extensions: [
			"uvu",
			"uvvu"
		]
	},
		"video/vnd.vivo": {
		source: "iana",
		extensions: [
			"viv"
		]
	},
		"video/vnd.youtube.yt": {
		source: "iana"
	},
		"video/vp8": {
		source: "iana"
	},
		"video/vp9": {
		source: "iana"
	},
		"video/webm": {
		source: "apache",
		compressible: false,
		extensions: [
			"webm"
		]
	},
		"video/x-f4v": {
		source: "apache",
		extensions: [
			"f4v"
		]
	},
		"video/x-fli": {
		source: "apache",
		extensions: [
			"fli"
		]
	},
		"video/x-flv": {
		source: "apache",
		compressible: false,
		extensions: [
			"flv"
		]
	},
		"video/x-m4v": {
		source: "apache",
		extensions: [
			"m4v"
		]
	},
		"video/x-matroska": {
		source: "apache",
		compressible: false,
		extensions: [
			"mkv",
			"mk3d",
			"mks"
		]
	},
		"video/x-mng": {
		source: "apache",
		extensions: [
			"mng"
		]
	},
		"video/x-ms-asf": {
		source: "apache",
		extensions: [
			"asf",
			"asx"
		]
	},
		"video/x-ms-vob": {
		source: "apache",
		extensions: [
			"vob"
		]
	},
		"video/x-ms-wm": {
		source: "apache",
		extensions: [
			"wm"
		]
	},
		"video/x-ms-wmv": {
		source: "apache",
		compressible: false,
		extensions: [
			"wmv"
		]
	},
		"video/x-ms-wmx": {
		source: "apache",
		extensions: [
			"wmx"
		]
	},
		"video/x-ms-wvx": {
		source: "apache",
		extensions: [
			"wvx"
		]
	},
		"video/x-msvideo": {
		source: "apache",
		extensions: [
			"avi"
		]
	},
		"video/x-sgi-movie": {
		source: "apache",
		extensions: [
			"movie"
		]
	},
		"video/x-smv": {
		source: "apache",
		extensions: [
			"smv"
		]
	},
		"x-conference/x-cooltalk": {
		source: "apache",
		extensions: [
			"ice"
		]
	},
		"x-shader/x-fragment": {
		compressible: true
	},
		"x-shader/x-vertex": {
		compressible: true
	}
	};

	/*!
	 * mime-db
	 * Copyright(c) 2014 Jonathan Ong
	 * Copyright(c) 2015-2022 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	var mimeDb;
	var hasRequiredMimeDb;

	function requireMimeDb () {
		if (hasRequiredMimeDb) return mimeDb;
		hasRequiredMimeDb = 1;
		/**
		 * Module exports.
		 */

		mimeDb = require$$0;
		return mimeDb;
	}

	var mimeScore;
	var hasRequiredMimeScore;

	function requireMimeScore () {
		if (hasRequiredMimeScore) return mimeScore;
		hasRequiredMimeScore = 1;
		// 'mime-score' back-ported to CommonJS

		// Score RFC facets (see https://tools.ietf.org/html/rfc6838#section-3)
		var FACET_SCORES = {
		  'prs.': 100,
		  'x-': 200,
		  'x.': 300,
		  'vnd.': 400,
		  default: 900
		};

		// Score mime source (Logic originally from `jshttp/mime-types` module)
		var SOURCE_SCORES = {
		  nginx: 10,
		  apache: 20,
		  iana: 40,
		  default: 30 // definitions added by `jshttp/mime-db` project?
		};

		var TYPE_SCORES = {
		  // prefer application/xml over text/xml
		  // prefer application/rtf over text/rtf
		  application: 1,

		  // prefer font/woff over application/font-woff
		  font: 2,

		  default: 0
		};

		/**
		 * Get each component of the score for a mime type.  The sum of these is the
		 * total score.  The higher the score, the more "official" the type.
		 */
		mimeScore = function mimeScore (mimeType, source = 'default') {
		  if (mimeType === 'application/octet-stream') {
		    return 0
		  }

		  const [type, subtype] = mimeType.split('/');

		  const facet = subtype.replace(/(\.|x-).*/, '$1');

		  const facetScore = FACET_SCORES[facet] || FACET_SCORES.default;
		  const sourceScore = SOURCE_SCORES[source] || SOURCE_SCORES.default;
		  const typeScore = TYPE_SCORES[type] || TYPE_SCORES.default;

		  // All else being equal prefer shorter types
		  const lengthScore = 1 - mimeType.length / 100;

		  return facetScore + sourceScore + typeScore + lengthScore
		};
		return mimeScore;
	}

	/*!
	 * mime-types
	 * Copyright(c) 2014 Jonathan Ong
	 * Copyright(c) 2015 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	var hasRequiredMimeTypes;

	function requireMimeTypes () {
		if (hasRequiredMimeTypes) return mimeTypes;
		hasRequiredMimeTypes = 1;
		(function (exports) {

			/**
			 * Module dependencies.
			 * @private
			 */

			var db = requireMimeDb();
			var extname = require$$2.extname;
			var mimeScore = requireMimeScore();

			/**
			 * Module variables.
			 * @private
			 */

			var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
			var TEXT_TYPE_REGEXP = /^text\//i;

			/**
			 * Module exports.
			 * @public
			 */

			exports.charset = charset;
			exports.charsets = { lookup: charset };
			exports.contentType = contentType;
			exports.extension = extension;
			exports.extensions = Object.create(null);
			exports.lookup = lookup;
			exports.types = Object.create(null);
			exports._extensionConflicts = [];

			// Populate the extensions/types maps
			populateMaps(exports.extensions, exports.types);

			/**
			 * Get the default charset for a MIME type.
			 *
			 * @param {string} type
			 * @return {boolean|string}
			 */

			function charset (type) {
			  if (!type || typeof type !== 'string') {
			    return false
			  }

			  // TODO: use media-typer
			  var match = EXTRACT_TYPE_REGEXP.exec(type);
			  var mime = match && db[match[1].toLowerCase()];

			  if (mime && mime.charset) {
			    return mime.charset
			  }

			  // default text/* to utf-8
			  if (match && TEXT_TYPE_REGEXP.test(match[1])) {
			    return 'UTF-8'
			  }

			  return false
			}

			/**
			 * Create a full Content-Type header given a MIME type or extension.
			 *
			 * @param {string} str
			 * @return {boolean|string}
			 */

			function contentType (str) {
			  // TODO: should this even be in this module?
			  if (!str || typeof str !== 'string') {
			    return false
			  }

			  var mime = str.indexOf('/') === -1 ? exports.lookup(str) : str;

			  if (!mime) {
			    return false
			  }

			  // TODO: use content-type or other module
			  if (mime.indexOf('charset') === -1) {
			    var charset = exports.charset(mime);
			    if (charset) mime += '; charset=' + charset.toLowerCase();
			  }

			  return mime
			}

			/**
			 * Get the default extension for a MIME type.
			 *
			 * @param {string} type
			 * @return {boolean|string}
			 */

			function extension (type) {
			  if (!type || typeof type !== 'string') {
			    return false
			  }

			  // TODO: use media-typer
			  var match = EXTRACT_TYPE_REGEXP.exec(type);

			  // get extensions
			  var exts = match && exports.extensions[match[1].toLowerCase()];

			  if (!exts || !exts.length) {
			    return false
			  }

			  return exts[0]
			}

			/**
			 * Lookup the MIME type for a file path/extension.
			 *
			 * @param {string} path
			 * @return {boolean|string}
			 */

			function lookup (path) {
			  if (!path || typeof path !== 'string') {
			    return false
			  }

			  // get the extension ("ext" or ".ext" or full path)
			  var extension = extname('x.' + path)
			    .toLowerCase()
			    .slice(1);

			  if (!extension) {
			    return false
			  }

			  return exports.types[extension] || false
			}

			/**
			 * Populate the extensions and types maps.
			 * @private
			 */

			function populateMaps (extensions, types) {
			  Object.keys(db).forEach(function forEachMimeType (type) {
			    var mime = db[type];
			    var exts = mime.extensions;

			    if (!exts || !exts.length) {
			      return
			    }

			    // mime -> extensions
			    extensions[type] = exts;

			    // extension -> mime
			    for (var i = 0; i < exts.length; i++) {
			      var extension = exts[i];
			      types[extension] = _preferredType(extension, types[extension], type);

			      // DELETE (eventually): Capture extension->type maps that change as a
			      // result of switching to mime-score.  This is just to help make reviewing
			      // PR #119 easier, and can be removed once that PR is approved.
			      const legacyType = _preferredTypeLegacy(
			        extension,
			        types[extension],
			        type
			      );
			      if (legacyType !== types[extension]) {
			        exports._extensionConflicts.push([extension, legacyType, types[extension]]);
			      }
			    }
			  });
			}

			// Resolve type conflict using mime-score
			function _preferredType (ext, type0, type1) {
			  var score0 = type0 ? mimeScore(type0, db[type0].source) : 0;
			  var score1 = type1 ? mimeScore(type1, db[type1].source) : 0;

			  return score0 > score1 ? type0 : type1
			}

			// Resolve type conflict using pre-mime-score logic
			function _preferredTypeLegacy (ext, type0, type1) {
			  var SOURCE_RANK = ['nginx', 'apache', undefined, 'iana'];

			  var score0 = type0 ? SOURCE_RANK.indexOf(db[type0].source) : 0;
			  var score1 = type1 ? SOURCE_RANK.indexOf(db[type1].source) : 0;

			  if (
			    exports.types[extension] !== 'application/octet-stream' &&
			    (score0 > score1 ||
			      (score0 === score1 &&
			        exports.types[extension]?.slice(0, 12) === 'application/'))
			  ) {
			    return type0
			  }

			  return score0 > score1 ? type0 : type1
			} 
		} (mimeTypes));
		return mimeTypes;
	}

	var defer_1;
	var hasRequiredDefer;

	function requireDefer () {
		if (hasRequiredDefer) return defer_1;
		hasRequiredDefer = 1;
		defer_1 = defer;

		/**
		 * Runs provided function on next iteration of the event loop
		 *
		 * @param {function} fn - function to run
		 */
		function defer(fn)
		{
		  var nextTick = typeof setImmediate == 'function'
		    ? setImmediate
		    : (
		      typeof browser$1 == 'object' && typeof browser$1.nextTick == 'function'
		      ? browser$1.nextTick
		      : null
		    );

		  if (nextTick)
		  {
		    nextTick(fn);
		  }
		  else
		  {
		    setTimeout(fn, 0);
		  }
		}
		return defer_1;
	}

	var async_1;
	var hasRequiredAsync;

	function requireAsync () {
		if (hasRequiredAsync) return async_1;
		hasRequiredAsync = 1;
		var defer = requireDefer();

		// API
		async_1 = async;

		/**
		 * Runs provided callback asynchronously
		 * even if callback itself is not
		 *
		 * @param   {function} callback - callback to invoke
		 * @returns {function} - augmented callback
		 */
		function async(callback)
		{
		  var isAsync = false;

		  // check if async happened
		  defer(function() { isAsync = true; });

		  return function async_callback(err, result)
		  {
		    if (isAsync)
		    {
		      callback(err, result);
		    }
		    else
		    {
		      defer(function nextTick_callback()
		      {
		        callback(err, result);
		      });
		    }
		  };
		}
		return async_1;
	}

	var abort_1;
	var hasRequiredAbort;

	function requireAbort () {
		if (hasRequiredAbort) return abort_1;
		hasRequiredAbort = 1;
		// API
		abort_1 = abort;

		/**
		 * Aborts leftover active jobs
		 *
		 * @param {object} state - current state object
		 */
		function abort(state)
		{
		  Object.keys(state.jobs).forEach(clean.bind(state));

		  // reset leftover jobs
		  state.jobs = {};
		}

		/**
		 * Cleans up leftover job by invoking abort function for the provided job id
		 *
		 * @this  state
		 * @param {string|number} key - job id to abort
		 */
		function clean(key)
		{
		  if (typeof this.jobs[key] == 'function')
		  {
		    this.jobs[key]();
		  }
		}
		return abort_1;
	}

	var iterate_1;
	var hasRequiredIterate;

	function requireIterate () {
		if (hasRequiredIterate) return iterate_1;
		hasRequiredIterate = 1;
		var async = requireAsync()
		  , abort = requireAbort()
		  ;

		// API
		iterate_1 = iterate;

		/**
		 * Iterates over each job object
		 *
		 * @param {array|object} list - array or object (named list) to iterate over
		 * @param {function} iterator - iterator to run
		 * @param {object} state - current job status
		 * @param {function} callback - invoked when all elements processed
		 */
		function iterate(list, iterator, state, callback)
		{
		  // store current index
		  var key = state['keyedList'] ? state['keyedList'][state.index] : state.index;

		  state.jobs[key] = runJob(iterator, key, list[key], function(error, output)
		  {
		    // don't repeat yourself
		    // skip secondary callbacks
		    if (!(key in state.jobs))
		    {
		      return;
		    }

		    // clean up jobs
		    delete state.jobs[key];

		    if (error)
		    {
		      // don't process rest of the results
		      // stop still active jobs
		      // and reset the list
		      abort(state);
		    }
		    else
		    {
		      state.results[key] = output;
		    }

		    // return salvaged results
		    callback(error, state.results);
		  });
		}

		/**
		 * Runs iterator over provided job element
		 *
		 * @param   {function} iterator - iterator to invoke
		 * @param   {string|number} key - key/index of the element in the list of jobs
		 * @param   {mixed} item - job description
		 * @param   {function} callback - invoked after iterator is done with the job
		 * @returns {function|mixed} - job abort function or something else
		 */
		function runJob(iterator, key, item, callback)
		{
		  var aborter;

		  // allow shortcut if iterator expects only two arguments
		  if (iterator.length == 2)
		  {
		    aborter = iterator(item, async(callback));
		  }
		  // otherwise go with full three arguments
		  else
		  {
		    aborter = iterator(item, key, async(callback));
		  }

		  return aborter;
		}
		return iterate_1;
	}

	var state_1;
	var hasRequiredState;

	function requireState () {
		if (hasRequiredState) return state_1;
		hasRequiredState = 1;
		// API
		state_1 = state;

		/**
		 * Creates initial state object
		 * for iteration over list
		 *
		 * @param   {array|object} list - list to iterate over
		 * @param   {function|null} sortMethod - function to use for keys sort,
		 *                                     or `null` to keep them as is
		 * @returns {object} - initial state object
		 */
		function state(list, sortMethod)
		{
		  var isNamedList = !Array.isArray(list)
		    , initState =
		    {
		      index    : 0,
		      keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
		      jobs     : {},
		      results  : isNamedList ? {} : [],
		      size     : isNamedList ? Object.keys(list).length : list.length
		    }
		    ;

		  if (sortMethod)
		  {
		    // sort array keys based on it's values
		    // sort object's keys just on own merit
		    initState.keyedList.sort(isNamedList ? sortMethod : function(a, b)
		    {
		      return sortMethod(list[a], list[b]);
		    });
		  }

		  return initState;
		}
		return state_1;
	}

	var terminator_1;
	var hasRequiredTerminator;

	function requireTerminator () {
		if (hasRequiredTerminator) return terminator_1;
		hasRequiredTerminator = 1;
		var abort = requireAbort()
		  , async = requireAsync()
		  ;

		// API
		terminator_1 = terminator;

		/**
		 * Terminates jobs in the attached state context
		 *
		 * @this  AsyncKitState#
		 * @param {function} callback - final callback to invoke after termination
		 */
		function terminator(callback)
		{
		  if (!Object.keys(this.jobs).length)
		  {
		    return;
		  }

		  // fast forward iteration index
		  this.index = this.size;

		  // abort jobs
		  abort(this);

		  // send back results we have so far
		  async(callback)(null, this.results);
		}
		return terminator_1;
	}

	var parallel_1;
	var hasRequiredParallel;

	function requireParallel () {
		if (hasRequiredParallel) return parallel_1;
		hasRequiredParallel = 1;
		var iterate    = requireIterate()
		  , initState  = requireState()
		  , terminator = requireTerminator()
		  ;

		// Public API
		parallel_1 = parallel;

		/**
		 * Runs iterator over provided array elements in parallel
		 *
		 * @param   {array|object} list - array or object (named list) to iterate over
		 * @param   {function} iterator - iterator to run
		 * @param   {function} callback - invoked when all elements processed
		 * @returns {function} - jobs terminator
		 */
		function parallel(list, iterator, callback)
		{
		  var state = initState(list);

		  while (state.index < (state['keyedList'] || list).length)
		  {
		    iterate(list, iterator, state, function(error, result)
		    {
		      if (error)
		      {
		        callback(error, result);
		        return;
		      }

		      // looks like it's the last one
		      if (Object.keys(state.jobs).length === 0)
		      {
		        callback(null, state.results);
		        return;
		      }
		    });

		    state.index++;
		  }

		  return terminator.bind(state, callback);
		}
		return parallel_1;
	}

	var serialOrdered = {exports: {}};

	var hasRequiredSerialOrdered;

	function requireSerialOrdered () {
		if (hasRequiredSerialOrdered) return serialOrdered.exports;
		hasRequiredSerialOrdered = 1;
		var iterate    = requireIterate()
		  , initState  = requireState()
		  , terminator = requireTerminator()
		  ;

		// Public API
		serialOrdered.exports = serialOrdered$1;
		// sorting helpers
		serialOrdered.exports.ascending  = ascending;
		serialOrdered.exports.descending = descending;

		/**
		 * Runs iterator over provided sorted array elements in series
		 *
		 * @param   {array|object} list - array or object (named list) to iterate over
		 * @param   {function} iterator - iterator to run
		 * @param   {function} sortMethod - custom sort function
		 * @param   {function} callback - invoked when all elements processed
		 * @returns {function} - jobs terminator
		 */
		function serialOrdered$1(list, iterator, sortMethod, callback)
		{
		  var state = initState(list, sortMethod);

		  iterate(list, iterator, state, function iteratorHandler(error, result)
		  {
		    if (error)
		    {
		      callback(error, result);
		      return;
		    }

		    state.index++;

		    // are we there yet?
		    if (state.index < (state['keyedList'] || list).length)
		    {
		      iterate(list, iterator, state, iteratorHandler);
		      return;
		    }

		    // done here
		    callback(null, state.results);
		  });

		  return terminator.bind(state, callback);
		}

		/*
		 * -- Sort methods
		 */

		/**
		 * sort helper to sort array elements in ascending order
		 *
		 * @param   {mixed} a - an item to compare
		 * @param   {mixed} b - an item to compare
		 * @returns {number} - comparison result
		 */
		function ascending(a, b)
		{
		  return a < b ? -1 : a > b ? 1 : 0;
		}

		/**
		 * sort helper to sort array elements in descending order
		 *
		 * @param   {mixed} a - an item to compare
		 * @param   {mixed} b - an item to compare
		 * @returns {number} - comparison result
		 */
		function descending(a, b)
		{
		  return -1 * ascending(a, b);
		}
		return serialOrdered.exports;
	}

	var serial_1;
	var hasRequiredSerial;

	function requireSerial () {
		if (hasRequiredSerial) return serial_1;
		hasRequiredSerial = 1;
		var serialOrdered = requireSerialOrdered();

		// Public API
		serial_1 = serial;

		/**
		 * Runs iterator over provided array elements in series
		 *
		 * @param   {array|object} list - array or object (named list) to iterate over
		 * @param   {function} iterator - iterator to run
		 * @param   {function} callback - invoked when all elements processed
		 * @returns {function} - jobs terminator
		 */
		function serial(list, iterator, callback)
		{
		  return serialOrdered(list, iterator, null, callback);
		}
		return serial_1;
	}

	var asynckit;
	var hasRequiredAsynckit;

	function requireAsynckit () {
		if (hasRequiredAsynckit) return asynckit;
		hasRequiredAsynckit = 1;
		asynckit =
		{
		  parallel      : requireParallel(),
		  serial        : requireSerial(),
		  serialOrdered : requireSerialOrdered()
		};
		return asynckit;
	}

	var populate;
	var hasRequiredPopulate;

	function requirePopulate () {
		if (hasRequiredPopulate) return populate;
		hasRequiredPopulate = 1;
		// populates missing values
		populate = function(dst, src) {

		  Object.keys(src).forEach(function(prop)
		  {
		    dst[prop] = dst[prop] || src[prop];
		  });

		  return dst;
		};
		return populate;
	}

	var form_data;
	var hasRequiredForm_data;

	function requireForm_data () {
		if (hasRequiredForm_data) return form_data;
		hasRequiredForm_data = 1;
		var CombinedStream = requireCombined_stream();
		var util = require$$1;
		var path = require$$2;
		var http = require$$3;
		var https = require$$4;
		var parseUrl = require$$5.parse;
		var fs = require$$6;
		var Stream = require$$7.Stream;
		var mime = requireMimeTypes();
		var asynckit = requireAsynckit();
		var populate = requirePopulate();

		// Public API
		form_data = FormData;

		// make it a Stream
		util.inherits(FormData, CombinedStream);

		/**
		 * Create readable "multipart/form-data" streams.
		 * Can be used to submit forms
		 * and file uploads to other web applications.
		 *
		 * @constructor
		 * @param {Object} options - Properties to be added/overriden for FormData and CombinedStream
		 */
		function FormData(options) {
		  if (!(this instanceof FormData)) {
		    return new FormData(options);
		  }

		  this._overheadLength = 0;
		  this._valueLength = 0;
		  this._valuesToMeasure = [];

		  CombinedStream.call(this);

		  options = options || {};
		  for (var option in options) {
		    this[option] = options[option];
		  }
		}

		FormData.LINE_BREAK = '\r\n';
		FormData.DEFAULT_CONTENT_TYPE = 'application/octet-stream';

		FormData.prototype.append = function(field, value, options) {

		  options = options || {};

		  // allow filename as single option
		  if (typeof options == 'string') {
		    options = {filename: options};
		  }

		  var append = CombinedStream.prototype.append.bind(this);

		  // all that streamy business can't handle numbers
		  if (typeof value == 'number') {
		    value = '' + value;
		  }

		  // https://github.com/felixge/node-form-data/issues/38
		  if (util.isArray(value)) {
		    // Please convert your array into string
		    // the way web server expects it
		    this._error(new Error('Arrays are not supported.'));
		    return;
		  }

		  var header = this._multiPartHeader(field, value, options);
		  var footer = this._multiPartFooter();

		  append(header);
		  append(value);
		  append(footer);

		  // pass along options.knownLength
		  this._trackLength(header, value, options);
		};

		FormData.prototype._trackLength = function(header, value, options) {
		  var valueLength = 0;

		  // used w/ getLengthSync(), when length is known.
		  // e.g. for streaming directly from a remote server,
		  // w/ a known file a size, and not wanting to wait for
		  // incoming file to finish to get its size.
		  if (options.knownLength != null) {
		    valueLength += +options.knownLength;
		  } else if (Buffer.isBuffer(value)) {
		    valueLength = value.length;
		  } else if (typeof value === 'string') {
		    valueLength = Buffer.byteLength(value);
		  }

		  this._valueLength += valueLength;

		  // @check why add CRLF? does this account for custom/multiple CRLFs?
		  this._overheadLength +=
		    Buffer.byteLength(header) +
		    FormData.LINE_BREAK.length;

		  // empty or either doesn't have path or not an http response or not a stream
		  if (!value || ( !value.path && !(value.readable && value.hasOwnProperty('httpVersion')) && !(value instanceof Stream))) {
		    return;
		  }

		  // no need to bother with the length
		  if (!options.knownLength) {
		    this._valuesToMeasure.push(value);
		  }
		};

		FormData.prototype._lengthRetriever = function(value, callback) {

		  if (value.hasOwnProperty('fd')) {

		    // take read range into a account
		    // `end` = Infinity –> read file till the end
		    //
		    // TODO: Looks like there is bug in Node fs.createReadStream
		    // it doesn't respect `end` options without `start` options
		    // Fix it when node fixes it.
		    // https://github.com/joyent/node/issues/7819
		    if (value.end != undefined && value.end != Infinity && value.start != undefined) {

		      // when end specified
		      // no need to calculate range
		      // inclusive, starts with 0
		      callback(null, value.end + 1 - (value.start ? value.start : 0));

		    // not that fast snoopy
		    } else {
		      // still need to fetch file size from fs
		      fs.stat(value.path, function(err, stat) {

		        var fileSize;

		        if (err) {
		          callback(err);
		          return;
		        }

		        // update final size based on the range options
		        fileSize = stat.size - (value.start ? value.start : 0);
		        callback(null, fileSize);
		      });
		    }

		  // or http response
		  } else if (value.hasOwnProperty('httpVersion')) {
		    callback(null, +value.headers['content-length']);

		  // or request stream http://github.com/mikeal/request
		  } else if (value.hasOwnProperty('httpModule')) {
		    // wait till response come back
		    value.on('response', function(response) {
		      value.pause();
		      callback(null, +response.headers['content-length']);
		    });
		    value.resume();

		  // something else
		  } else {
		    callback('Unknown stream');
		  }
		};

		FormData.prototype._multiPartHeader = function(field, value, options) {
		  // custom header specified (as string)?
		  // it becomes responsible for boundary
		  // (e.g. to handle extra CRLFs on .NET servers)
		  if (typeof options.header == 'string') {
		    return options.header;
		  }

		  var contentDisposition = this._getContentDisposition(value, options);
		  var contentType = this._getContentType(value, options);

		  var contents = '';
		  var headers  = {
		    // add custom disposition as third element or keep it two elements if not
		    'Content-Disposition': ['form-data', 'name="' + field + '"'].concat(contentDisposition || []),
		    // if no content type. allow it to be empty array
		    'Content-Type': [].concat(contentType || [])
		  };

		  // allow custom headers.
		  if (typeof options.header == 'object') {
		    populate(headers, options.header);
		  }

		  var header;
		  for (var prop in headers) {
		    if (!headers.hasOwnProperty(prop)) continue;
		    header = headers[prop];

		    // skip nullish headers.
		    if (header == null) {
		      continue;
		    }

		    // convert all headers to arrays.
		    if (!Array.isArray(header)) {
		      header = [header];
		    }

		    // add non-empty headers.
		    if (header.length) {
		      contents += prop + ': ' + header.join('; ') + FormData.LINE_BREAK;
		    }
		  }

		  return '--' + this.getBoundary() + FormData.LINE_BREAK + contents + FormData.LINE_BREAK;
		};

		FormData.prototype._getContentDisposition = function(value, options) {

		  var filename
		    , contentDisposition
		    ;

		  if (typeof options.filepath === 'string') {
		    // custom filepath for relative paths
		    filename = path.normalize(options.filepath).replace(/\\/g, '/');
		  } else if (options.filename || value.name || value.path) {
		    // custom filename take precedence
		    // formidable and the browser add a name property
		    // fs- and request- streams have path property
		    filename = path.basename(options.filename || value.name || value.path);
		  } else if (value.readable && value.hasOwnProperty('httpVersion')) {
		    // or try http response
		    filename = path.basename(value.client._httpMessage.path || '');
		  }

		  if (filename) {
		    contentDisposition = 'filename="' + filename + '"';
		  }

		  return contentDisposition;
		};

		FormData.prototype._getContentType = function(value, options) {

		  // use custom content-type above all
		  var contentType = options.contentType;

		  // or try `name` from formidable, browser
		  if (!contentType && value.name) {
		    contentType = mime.lookup(value.name);
		  }

		  // or try `path` from fs-, request- streams
		  if (!contentType && value.path) {
		    contentType = mime.lookup(value.path);
		  }

		  // or if it's http-reponse
		  if (!contentType && value.readable && value.hasOwnProperty('httpVersion')) {
		    contentType = value.headers['content-type'];
		  }

		  // or guess it from the filepath or filename
		  if (!contentType && (options.filepath || options.filename)) {
		    contentType = mime.lookup(options.filepath || options.filename);
		  }

		  // fallback to the default content type if `value` is not simple value
		  if (!contentType && typeof value == 'object') {
		    contentType = FormData.DEFAULT_CONTENT_TYPE;
		  }

		  return contentType;
		};

		FormData.prototype._multiPartFooter = function() {
		  return function(next) {
		    var footer = FormData.LINE_BREAK;

		    var lastPart = (this._streams.length === 0);
		    if (lastPart) {
		      footer += this._lastBoundary();
		    }

		    next(footer);
		  }.bind(this);
		};

		FormData.prototype._lastBoundary = function() {
		  return '--' + this.getBoundary() + '--' + FormData.LINE_BREAK;
		};

		FormData.prototype.getHeaders = function(userHeaders) {
		  var header;
		  var formHeaders = {
		    'content-type': 'multipart/form-data; boundary=' + this.getBoundary()
		  };

		  for (header in userHeaders) {
		    if (userHeaders.hasOwnProperty(header)) {
		      formHeaders[header.toLowerCase()] = userHeaders[header];
		    }
		  }

		  return formHeaders;
		};

		FormData.prototype.setBoundary = function(boundary) {
		  this._boundary = boundary;
		};

		FormData.prototype.getBoundary = function() {
		  if (!this._boundary) {
		    this._generateBoundary();
		  }

		  return this._boundary;
		};

		FormData.prototype.getBuffer = function() {
		  var dataBuffer = new Buffer.alloc( 0 );
		  var boundary = this.getBoundary();

		  // Create the form content. Add Line breaks to the end of data.
		  for (var i = 0, len = this._streams.length; i < len; i++) {
		    if (typeof this._streams[i] !== 'function') {

		      // Add content to the buffer.
		      if(Buffer.isBuffer(this._streams[i])) {
		        dataBuffer = Buffer.concat( [dataBuffer, this._streams[i]]);
		      }else {
		        dataBuffer = Buffer.concat( [dataBuffer, Buffer.from(this._streams[i])]);
		      }

		      // Add break after content.
		      if (typeof this._streams[i] !== 'string' || this._streams[i].substring( 2, boundary.length + 2 ) !== boundary) {
		        dataBuffer = Buffer.concat( [dataBuffer, Buffer.from(FormData.LINE_BREAK)] );
		      }
		    }
		  }

		  // Add the footer and return the Buffer object.
		  return Buffer.concat( [dataBuffer, Buffer.from(this._lastBoundary())] );
		};

		FormData.prototype._generateBoundary = function() {
		  // This generates a 50 character boundary similar to those used by Firefox.
		  // They are optimized for boyer-moore parsing.
		  var boundary = '--------------------------';
		  for (var i = 0; i < 24; i++) {
		    boundary += Math.floor(Math.random() * 10).toString(16);
		  }

		  this._boundary = boundary;
		};

		// Note: getLengthSync DOESN'T calculate streams length
		// As workaround one can calculate file size manually
		// and add it as knownLength option
		FormData.prototype.getLengthSync = function() {
		  var knownLength = this._overheadLength + this._valueLength;

		  // Don't get confused, there are 3 "internal" streams for each keyval pair
		  // so it basically checks if there is any value added to the form
		  if (this._streams.length) {
		    knownLength += this._lastBoundary().length;
		  }

		  // https://github.com/form-data/form-data/issues/40
		  if (!this.hasKnownLength()) {
		    // Some async length retrievers are present
		    // therefore synchronous length calculation is false.
		    // Please use getLength(callback) to get proper length
		    this._error(new Error('Cannot calculate proper length in synchronous way.'));
		  }

		  return knownLength;
		};

		// Public API to check if length of added values is known
		// https://github.com/form-data/form-data/issues/196
		// https://github.com/form-data/form-data/issues/262
		FormData.prototype.hasKnownLength = function() {
		  var hasKnownLength = true;

		  if (this._valuesToMeasure.length) {
		    hasKnownLength = false;
		  }

		  return hasKnownLength;
		};

		FormData.prototype.getLength = function(cb) {
		  var knownLength = this._overheadLength + this._valueLength;

		  if (this._streams.length) {
		    knownLength += this._lastBoundary().length;
		  }

		  if (!this._valuesToMeasure.length) {
		    browser$1.nextTick(cb.bind(this, null, knownLength));
		    return;
		  }

		  asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
		    if (err) {
		      cb(err);
		      return;
		    }

		    values.forEach(function(length) {
		      knownLength += length;
		    });

		    cb(null, knownLength);
		  });
		};

		FormData.prototype.submit = function(params, cb) {
		  var request
		    , options
		    , defaults = {method: 'post'}
		    ;

		  // parse provided url if it's string
		  // or treat it as options object
		  if (typeof params == 'string') {

		    params = parseUrl(params);
		    options = populate({
		      port: params.port,
		      path: params.pathname,
		      host: params.hostname,
		      protocol: params.protocol
		    }, defaults);

		  // use custom params
		  } else {

		    options = populate(params, defaults);
		    // if no port provided use default one
		    if (!options.port) {
		      options.port = options.protocol == 'https:' ? 443 : 80;
		    }
		  }

		  // put that good code in getHeaders to some use
		  options.headers = this.getHeaders(params.headers);

		  // https if specified, fallback to http in any other case
		  if (options.protocol == 'https:') {
		    request = https.request(options);
		  } else {
		    request = http.request(options);
		  }

		  // get content length and fire away
		  this.getLength(function(err, length) {
		    if (err && err !== 'Unknown stream') {
		      this._error(err);
		      return;
		    }

		    // add content length
		    if (length) {
		      request.setHeader('Content-Length', length);
		    }

		    this.pipe(request);
		    if (cb) {
		      var onResponse;

		      var callback = function (error, responce) {
		        request.removeListener('error', callback);
		        request.removeListener('response', onResponse);

		        return cb.call(this, error, responce);
		      };

		      onResponse = callback.bind(this, null);

		      request.on('error', callback);
		      request.on('response', onResponse);
		    }
		  }.bind(this));

		  return request;
		};

		FormData.prototype._error = function(err) {
		  if (!this.error) {
		    this.error = err;
		    this.pause();
		    this.emit('error', err);
		  }
		};

		FormData.prototype.toString = function () {
		  return '[object FormData]';
		};
		return form_data;
	}

	var hasRequiredLib;

	function requireLib () {
		if (hasRequiredLib) return lib.exports;
		hasRequiredLib = 1;
		commonjsGlobal.FormData = lib.exports = requireForm_data();
		return lib.exports;
	}

	var urlSearchParamsPolyfill = {};

	/**
	 *
	 *
	 * @author Jerry Bendy <jerry@icewingcc.com>
	 * @licence MIT
	 *
	 */

	var hasRequiredUrlSearchParamsPolyfill;

	function requireUrlSearchParamsPolyfill () {
		if (hasRequiredUrlSearchParamsPolyfill) return urlSearchParamsPolyfill;
		hasRequiredUrlSearchParamsPolyfill = 1;
		(function(self) {

		    var nativeURLSearchParams = self.URLSearchParams ? self.URLSearchParams : null,
		        isSupportObjectConstructor = nativeURLSearchParams && (new nativeURLSearchParams({a: 1})).toString() === 'a=1',
		        // There is a bug in safari 10.1 (and earlier) that incorrectly decodes `%2B` as an empty space and not a plus.
		        decodesPlusesCorrectly = nativeURLSearchParams && (new nativeURLSearchParams('s=%2B').get('s') === '+'),
		        __URLSearchParams__ = "__URLSearchParams__",
		        prototype = URLSearchParamsPolyfill.prototype,
		        iterable = !!(self.Symbol && self.Symbol.iterator);

		    if (nativeURLSearchParams && isSupportObjectConstructor && decodesPlusesCorrectly) {
		        return;
		    }


		    /**
		     * Make a URLSearchParams instance
		     *
		     * @param {object|string|URLSearchParams} search
		     * @constructor
		     */
		    function URLSearchParamsPolyfill(search) {
		        search = search || "";

		        // support construct object with another URLSearchParams instance
		        if (search instanceof URLSearchParams || search instanceof URLSearchParamsPolyfill) {
		            search = search.toString();
		        }

		        this [__URLSearchParams__] = parseToDict(search);
		    }


		    /**
		     * Appends a specified key/value pair as a new search parameter.
		     *
		     * @param {string} name
		     * @param {string} value
		     */
		    prototype.append = function(name, value) {
		        appendTo(this [__URLSearchParams__], name, value);
		    };

		    /**
		     * Deletes the given search parameter, and its associated value,
		     * from the list of all search parameters.
		     *
		     * @param {string} name
		     */
		    prototype.delete = function(name) {
		        delete this [__URLSearchParams__] [name];
		    };

		    /**
		     * Returns the first value associated to the given search parameter.
		     *
		     * @param {string} name
		     * @returns {string|null}
		     */
		    prototype.get = function(name) {
		        var dict = this [__URLSearchParams__];
		        return name in dict ? dict[name][0] : null;
		    };

		    /**
		     * Returns all the values association with a given search parameter.
		     *
		     * @param {string} name
		     * @returns {Array}
		     */
		    prototype.getAll = function(name) {
		        var dict = this [__URLSearchParams__];
		        return name in dict ? dict [name].slice(0) : [];
		    };

		    /**
		     * Returns a Boolean indicating if such a search parameter exists.
		     *
		     * @param {string} name
		     * @returns {boolean}
		     */
		    prototype.has = function(name) {
		        return name in this [__URLSearchParams__];
		    };

		    /**
		     * Sets the value associated to a given search parameter to
		     * the given value. If there were several values, delete the
		     * others.
		     *
		     * @param {string} name
		     * @param {string} value
		     */
		    prototype.set = function set(name, value) {
		        this [__URLSearchParams__][name] = ['' + value];
		    };

		    /**
		     * Returns a string containg a query string suitable for use in a URL.
		     *
		     * @returns {string}
		     */
		    prototype.toString = function() {
		        var dict = this[__URLSearchParams__], query = [], i, key, name, value;
		        for (key in dict) {
		            name = encode(key);
		            for (i = 0, value = dict[key]; i < value.length; i++) {
		                query.push(name + '=' + encode(value[i]));
		            }
		        }
		        return query.join('&');
		    };

		    // There is a bug in Safari 10.1 and `Proxy`ing it is not enough.
		    var forSureUsePolyfill = !decodesPlusesCorrectly;
		    var useProxy = (!forSureUsePolyfill && nativeURLSearchParams && !isSupportObjectConstructor && self.Proxy);
		    /*
		     * Apply polifill to global object and append other prototype into it
		     */
		    self.URLSearchParams = useProxy ?
		        // Safari 10.0 doesn't support Proxy, so it won't extend URLSearchParams on safari 10.0
		        new Proxy(nativeURLSearchParams, {
		            construct: function(target, args) {
		                return new target((new URLSearchParamsPolyfill(args[0]).toString()));
		            }
		        }) :
		        URLSearchParamsPolyfill;


		    var USPProto = self.URLSearchParams.prototype;

		    USPProto.polyfill = true;

		    /**
		     *
		     * @param {function} callback
		     * @param {object} thisArg
		     */
		    USPProto.forEach = USPProto.forEach || function(callback, thisArg) {
		        var dict = parseToDict(this.toString());
		        Object.getOwnPropertyNames(dict).forEach(function(name) {
		            dict[name].forEach(function(value) {
		                callback.call(thisArg, value, name, this);
		            }, this);
		        }, this);
		    };

		    /**
		     * Sort all name-value pairs
		     */
		    USPProto.sort = USPProto.sort || function() {
		        var dict = parseToDict(this.toString()), keys = [], k, i, j;
		        for (k in dict) {
		            keys.push(k);
		        }
		        keys.sort();

		        for (i = 0; i < keys.length; i++) {
		            this.delete(keys[i]);
		        }
		        for (i = 0; i < keys.length; i++) {
		            var key = keys[i], values = dict[key];
		            for (j = 0; j < values.length; j++) {
		                this.append(key, values[j]);
		            }
		        }
		    };

		    /**
		     * Returns an iterator allowing to go through all keys of
		     * the key/value pairs contained in this object.
		     *
		     * @returns {function}
		     */
		    USPProto.keys = USPProto.keys || function() {
		        var items = [];
		        this.forEach(function(item, name) {
		            items.push([name]);
		        });
		        return makeIterator(items);
		    };

		    /**
		     * Returns an iterator allowing to go through all values of
		     * the key/value pairs contained in this object.
		     *
		     * @returns {function}
		     */
		    USPProto.values = USPProto.values || function() {
		        var items = [];
		        this.forEach(function(item) {
		            items.push([item]);
		        });
		        return makeIterator(items);
		    };

		    /**
		     * Returns an iterator allowing to go through all key/value
		     * pairs contained in this object.
		     *
		     * @returns {function}
		     */
		    USPProto.entries = USPProto.entries || function() {
		        var items = [];
		        this.forEach(function(item, name) {
		            items.push([name, item]);
		        });
		        return makeIterator(items);
		    };


		    if (iterable) {
		        USPProto[self.Symbol.iterator] = USPProto[self.Symbol.iterator] || USPProto.entries;
		    }


		    function encode(str) {
		        var replace = {
		            '!': '%21',
		            "'": '%27',
		            '(': '%28',
		            ')': '%29',
		            '~': '%7E',
		            '%20': '+',
		            '%00': '\x00'
		        };
		        return encodeURIComponent(str).replace(/[!'\(\)~]|%20|%00/g, function(match) {
		            return replace[match];
		        });
		    }

		    function decode(str) {
		        return decodeURIComponent(str.replace(/\+/g, ' '));
		    }

		    function makeIterator(arr) {
		        var iterator = {
		            next: function() {
		                var value = arr.shift();
		                return {done: value === undefined, value: value};
		            }
		        };

		        if (iterable) {
		            iterator[self.Symbol.iterator] = function() {
		                return iterator;
		            };
		        }

		        return iterator;
		    }

		    function parseToDict(search) {
		        var dict = {};

		        if (typeof search === "object") {
		            for (var i in search) {
		                if (search.hasOwnProperty(i)) {
		                    var str = typeof search [i] === 'string' ? search [i] : JSON.stringify(search [i]);
		                    appendTo(dict, i, str);
		                }
		            }

		        } else {
		            // remove first '?'
		            if (search.indexOf("?") === 0) {
		                search = search.slice(1);
		            }

		            var pairs = search.split("&");
		            for (var j = 0; j < pairs.length; j++) {
		                var value = pairs [j],
		                    index = value.indexOf('=');

		                if (-1 < index) {
		                    appendTo(dict, decode(value.slice(0, index)), decode(value.slice(index + 1)));

		                } else {
		                    if (value) {
		                        appendTo(dict, decode(value), '');
		                    }
		                }
		            }
		        }

		        return dict;
		    }

		    function appendTo(dict, name, value) {
		        if (name in dict) {
		            dict[name].push('' + value);
		        } else {
		            dict[name] = ['' + value];
		        }
		    }

		})(typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : (typeof window !== 'undefined' ? window : urlSearchParamsPolyfill));
		return urlSearchParamsPolyfill;
	}

	var hasRequiredCmis$1;

	function requireCmis$1 () {
		if (hasRequiredCmis$1) return cmis;
		hasRequiredCmis$1 = 1;
		(function (exports) {
			var __extends = (cmis && cmis.__extends) || (function () {
			    var extendStatics = Object.setPrototypeOf ||
			        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
			        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
			    return function (d, b) {
			        extendStatics(d, b);
			        function __() { this.constructor = d; }
			        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
			    };
			})();
			Object.defineProperty(exports, "__esModule", { value: true });
			requireNodePolyfill();
			var isomorphic_base64_1 = requireBrowser();
			requireLib();
			requireUrlSearchParamsPolyfill();
			(function (cmis) {
			    var Buffer = commonjsGlobal['Buffer'];
			    var Options = (function () {
			        function Options() {
			            this.succinct = true;
			        }
			        return Options;
			    }());
			    var HTTPError = (function (_super) {
			        __extends(HTTPError, _super);
			        function HTTPError(response) {
			            var _this = _super.call(this, response.statusText) || this;
			            _this.response = response;
			            return _this;
			        }
			        return HTTPError;
			    }(Error));
			    cmis.HTTPError = HTTPError;
			    var CmisSession = (function () {
			        function CmisSession(url) {
			            this.options = { succinct: true };
			            this.url = url;
			        }
			        CmisSession.prototype.setProperties = function (options, properties) {
			            var i = 0;
			            for (var id in properties) {
			                options['propertyId[' + i + ']'] = id;
			                var propertyValue = properties[id];
			                if (propertyValue !== null && propertyValue !== undefined) {
			                    if (Object.prototype.toString.apply(propertyValue) == '[object Array]') {
			                        var multiProperty = propertyValue;
			                        for (var j = 0; j < multiProperty.length; j++) {
			                            options['propertyValue[' + i + '][' + j + ']'] = multiProperty[j];
			                        }
			                    }
			                    else {
			                        options['propertyValue[' + i + ']'] = propertyValue;
			                    }
			                }
			                i++;
			            }
			        };
			        CmisSession.prototype.setPolicies = function (options, policies) {
			            for (var i = 0; i < policies.length; i++) {
			                options['policy[' + i + ']'] = policies[i];
			            }
			        };
			        CmisSession.prototype.setACEs = function (options, ACEs, action) {
			            var i = 0;
			            for (var id in ACEs) {
			                options[action + 'ACEPrincipal[' + i + ']'] = id;
			                var ace = ACEs[id];
			                for (var j = 0; j < ace.length; j++) {
			                    options[action + 'ACEPermission[' + i + '][' + j + ']'] = ACEs[id][j];
			                }
			                i++;
			            }
			        };
			        CmisSession.prototype.setSecondaryTypeIds = function (options, secondaryTypeIds, action) {
			            for (var i = 0; i < secondaryTypeIds.length; i++) {
			                options[action + 'SecondaryTypeId[' + i + ']'] = secondaryTypeIds[i];
			            }
			        };
			        CmisSession.prototype.http = function (method, url, options, multipartData) {
			            var _this = this;
			            var body = {};
			            for (var k in this.options) {
			                if (this.options[k] != null && this.options[k] !== undefined) {
			                    body[k] = this.options[k];
			                }
			            }
			            for (var k in options) {
			                if (options[k] != null && options[k] !== undefined) {
			                    body[k] = options[k];
			                }
			            }
			            var auth;
			            if (this.username && this.password) {
			                auth = 'Basic ' + isomorphic_base64_1.btoa(this.username + ":" + this.password);
			            }
			            else if (this.token) {
			                auth = "Bearer " + this.token;
			            }
			            var cfg = { method: method, headers: {} };
			            if (auth) {
			                cfg.headers['Authorization'] = auth;
			            }
			            else {
			                cfg.credentials = 'include';
			            }
			            if (multipartData) {
			                var formData = new FormData();
			                var content = multipartData.content;
			                if ('string' == typeof content) {
			                    if (typeof (Blob) !== 'undefined')
			                        content = new Blob([content]);
			                }
			                else if (typeof (Buffer) !== 'undefined') {
			                    content = new Buffer(content);
			                }
			                formData.append('content', content, multipartData.mimeTypeExtension ? multipartData.filename + '.' + multipartData.mimeTypeExtension : multipartData.filename);
			                for (var k in body) {
			                    formData.append(k, '' + body[k]);
			                }
			                if (this.charset) {
			                    formData.append('_charset_', this.charset);
			                }
			                cfg.body = formData;
			            }
			            else {
			                var usp = new URLSearchParams();
			                for (var k in body) {
			                    usp.set(k, body[k]);
			                }
			                if (method !== 'GET') {
			                    cfg.body = usp.toString();
			                    cfg.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
			                }
			                else {
			                    url = url + "?" + usp.toString();
			                }
			            }
			            var response = fetch(url, cfg).then(function (res) {
			                if (res.status < 200 || res.status > 299) {
			                    throw new HTTPError(res);
			                }
			                return res;
			            });
			            if (this.errorHandler) {
			                response.catch(function (err) { return _this.errorHandler(err); });
			            }
			            return response;
			        };
			        CmisSession.prototype.get = function (url, options) {
			            return this.http('GET', url, options);
			        };
			        CmisSession.prototype.post = function (url, options, multipartData) {
			            return this.http('POST', url, options, multipartData);
			        };
			        CmisSession.prototype.setToken = function (token) {
			            this.token = token;
			            return this;
			        };
			        CmisSession.prototype.setCredentials = function (username, password) {
			            this.username = username;
			            this.password = password;
			            return this;
			        };
			        CmisSession.prototype.setCharset = function (charset) {
			            this.charset = charset;
			            return this;
			        };
			        CmisSession.prototype.setErrorHandler = function (handler) {
			            this.errorHandler = handler;
			        };
			        CmisSession.prototype.loadRepositories = function () {
			            var _this = this;
			            return this.get(this.url, this.options).then(function (res) {
			                return res.json().then(function (data) {
			                    for (var repo in data) {
			                        _this.defaultRepository = data[repo];
			                        break;
			                    }
			                    _this.repositories = data;
			                    return;
			                });
			            });
			        };
			        CmisSession.prototype.getRepositoryInfo = function () {
			            return this.get(this.defaultRepository.repositoryUrl, { cmisselector: 'repositoryInfo' })
			                .then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getTypeChildren = function (typeId, includePropertyDefinitions, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.cmisselector = 'typeChildren';
			            o.typeId = typeId;
			            o.includePropertyDefinitions = includePropertyDefinitions;
			            return this.get(this.defaultRepository.repositoryUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getTypeDescendants = function (typeId, depth, includePropertyDefinitions) {
			            return this.get(this.defaultRepository.repositoryUrl, {
			                cmisselector: 'typeDescendants',
			                typeId: typeId,
			                includePropertyDefinitions: includePropertyDefinitions,
			                depth: depth
			            }).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getTypeDefinition = function (typeId) {
			            return this.get(this.defaultRepository.repositoryUrl, {
			                cmisselector: 'typeDefinition',
			                typeId: typeId,
			            }).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getCheckedOutDocs = function (objectId, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.cmisselector = 'checkedOut';
			            return this.get(this.defaultRepository.repositoryUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.query = function (statement, searchAllVersions, options) {
			            if (searchAllVersions === void 0) { searchAllVersions = false; }
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.cmisaction = 'query';
			            o.statement = statement;
			            o.searchAllVersions = searchAllVersions;
			            return this.post(this.defaultRepository.repositoryUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.createType = function (type) {
			            return this.post(this.defaultRepository.repositoryUrl, {
			                cmisaction: 'createType',
			                type: JSON.stringify(type)
			            }).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.updateType = function (type) {
			            return this.post(this.defaultRepository.repositoryUrl, {
			                cmisaction: 'updateType',
			                type: JSON.stringify(type)
			            }).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.deleteType = function (typeId) {
			            return this.post(this.defaultRepository.repositoryUrl, {
			                cmisaction: 'deleteType',
			                typeId: JSON.stringify(typeId)
			            }).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getObjectByPath = function (path, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.cmisselector = 'object';
			            var sp = path.split('/');
			            for (var i = sp.length - 1; i >= 0; i--) {
			                sp[i] = encodeURIComponent(sp[i]);
			            }
			            return this.get(this.defaultRepository.rootFolderUrl + sp.join('/'), o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getObject = function (objectId, returnVersion, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.cmisselector = 'object';
			            o.objectId = objectId;
			            o.returnVersion = returnVersion;
			            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.createFolder = function (parentId, name, type, policies, addACEs, removeACEs) {
			            if (type === void 0) { type = 'cmis:folder'; }
			            if (policies === void 0) { policies = []; }
			            if (addACEs === void 0) { addACEs = {}; }
			            if (removeACEs === void 0) { removeACEs = {}; }
			            var options = new Options();
			            options.objectId = parentId;
			            options.repositoryId = this.defaultRepository.repositoryId;
			            options.cmisaction = 'createFolder';
			            var properties = {
			                'cmis:name': name,
			                'cmis:objectTypeId': type
			            };
			            this.setProperties(options, properties);
			            this.setPolicies(options, policies);
			            this.setACEs(options, addACEs, 'add');
			            this.setACEs(options, removeACEs, 'remove');
			            return this.post(this.defaultRepository.rootFolderUrl, options).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getChildren = function (objectId, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.cmisselector = 'children';
			            o.objectId = objectId;
			            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getDescendants = function (folderId, depth, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.cmisselector = 'descendants';
			            if (depth) {
			                o.depth = depth;
			            }
			            o.objectId = folderId;
			            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getFolderTree = function (folderId, depth, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.cmisselector = 'folderTree';
			            if (depth) {
			                o.depth = depth;
			            }
			            o.objectId = folderId;
			            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getFolderParent = function (folderId, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.cmisselector = 'parent';
			            o.objectId = folderId;
			            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getParents = function (objectId, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.cmisselector = 'parents';
			            o.objectId = objectId;
			            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getAllowableActions = function (objectId, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.cmisselector = 'allowableActions';
			            o.objectId = objectId;
			            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getProperties = function (objectId, returnVersion, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.cmisselector = 'properties';
			            o.objectId = objectId;
			            o.returnVersion = returnVersion;
			            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.updateProperties = function (objectId, properties, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.objectId = objectId;
			            o.cmisaction = 'update';
			            this.setProperties(options, properties);
			            return this.post(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.moveObject = function (objectId, sourceFolderId, targetFolderId, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.objectId = objectId;
			            o.cmisaction = 'move';
			            o.targetFolderId = targetFolderId;
			            o.sourceFolderId = sourceFolderId;
			            return this.post(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.createDocument = function (parentId, content, input, mimeTypeExtension, versioningState, policies, addACEs, removeACEs, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            if ('string' == typeof input) {
			                input = {
			                    'cmis:name': input
			                };
			            }
			            var properties = input || {};
			            if (!properties['cmis:objectTypeId']) {
			                properties['cmis:objectTypeId'] = 'cmis:document';
			            }
			            if (versioningState) {
			                o.versioningState = versioningState;
			            }
			            o.objectId = parentId;
			            this.setProperties(o, properties);
			            if (policies) {
			                this.setPolicies(o, policies);
			            }
			            if (addACEs) {
			                this.setACEs(o, addACEs, 'add');
			            }
			            if (removeACEs) {
			                this.setACEs(o, removeACEs, 'remove');
			            }
			            o.repositoryId = this.defaultRepository.repositoryId;
			            o.cmisaction = 'createDocument';
			            return this.post(this.defaultRepository.rootFolderUrl, o, {
			                content: content,
			                filename: properties['cmis:name'],
			                mimeTypeExtension: mimeTypeExtension
			            }).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.bulkUpdateProperties = function (objectIds, properties, addSecondaryTypeIds, removeSecondaryTypeIds) {
			            if (properties === void 0) { properties = {}; }
			            if (addSecondaryTypeIds === void 0) { addSecondaryTypeIds = []; }
			            if (removeSecondaryTypeIds === void 0) { removeSecondaryTypeIds = []; }
			            var options = new Options();
			            for (var i = objectIds.length - 1; i >= 0; i--) {
			                options['objectId[' + i + ']'] = objectIds[i];
			            }
			            options.objectIds = objectIds;
			            this.setProperties(options, properties);
			            this.setSecondaryTypeIds(options, addSecondaryTypeIds, 'add');
			            this.setSecondaryTypeIds(options, removeSecondaryTypeIds, 'remove');
			            options.cmisaction = 'bulkUpdate';
			            return this.post(this.defaultRepository.repositoryUrl, options).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getContentStream = function (objectId, download, streamId) {
			            if (download === void 0) { download = 'inline'; }
			            var options = new Options();
			            options.cmisselector = 'content';
			            options.objectId = objectId;
			            options.download = download;
			            return this.get(this.defaultRepository.rootFolderUrl, options);
			        };
			        CmisSession.prototype.createDocumentFromSource = function (parentId, sourceId, content, input, mimeTypeExtension, versioningState, policies, addACEs, removeACEs, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            if ('string' == typeof input) {
			                input = {
			                    'cmis:name': input
			                };
			            }
			            var properties = input || {};
			            if (!properties['cmis:objectTypeId']) {
			                properties['cmis:objectTypeId'] = 'cmis:document';
			            }
			            if (versioningState) {
			                o.versioningState = versioningState;
			            }
			            o.objectId = parentId;
			            this.setProperties(o, properties);
			            if (policies) {
			                this.setPolicies(o, policies);
			            }
			            if (addACEs) {
			                this.setACEs(o, addACEs, 'add');
			            }
			            if (removeACEs) {
			                this.setACEs(o, removeACEs, 'remove');
			            }
			            o.repositoryId = this.defaultRepository.repositoryId;
			            o.sourceId = sourceId;
			            o.cmisaction = 'createDocumentFromSource';
			            var multipartData = null;
			            if (content) {
			                multipartData = {
			                    content: content,
			                    filename: properties['cmis:name'],
			                    mimeTypeExtension: mimeTypeExtension
			                };
			            }
			            return this.post(this.defaultRepository.rootFolderUrl, o, multipartData).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getContentStreamURL = function (objectId, download, streamId) {
			            if (download === void 0) { download = 'inline'; }
			            var options = new Options();
			            options.cmisselector = 'content';
			            options.objectId = objectId;
			            options.download = download;
			            options.streamId = streamId;
			            var usp = new URLSearchParams();
			            for (var k in options) {
			                if (options[k] != null && options[k] !== undefined) {
			                    usp.append(k, options[k]);
			                }
			            }
			            for (var k in this.options) {
			                if (!usp.has(k) && this.options[k] != null && this.options[k] !== undefined) {
			                    usp.append(k, this.options[k]);
			                }
			            }
			            return this.defaultRepository.rootFolderUrl + "?" + usp.toString();
			        };
			        CmisSession.prototype.getRenditions = function (objectId, options) {
			            if (options === void 0) { options = {
			                renditionFilter: '*'
			            }; }
			            var o = options;
			            o.cmisselector = 'renditions';
			            o.objectId = objectId;
			            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.checkOut = function (objectId, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.objectId = objectId;
			            o.cmisaction = 'checkOut';
			            return this.post(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.cancelCheckOut = function (objectId) {
			            var options = new Options();
			            options.objectId = objectId;
			            options.cmisaction = 'cancelCheckOut';
			            return this.post(this.defaultRepository.rootFolderUrl, options);
			        };
			        CmisSession.prototype.checkIn = function (objectId, major, input, content, mimeTypeExtension, comment, policies, addACEs, removeACEs, options) {
			            if (major === void 0) { major = false; }
			            if (options === void 0) { options = {}; }
			            var o = options;
			            if ('string' == typeof input) {
			                input = {
			                    'cmis:name': input
			                };
			            }
			            var properties = input || {};
			            if (comment) {
			                o.checkinComment = comment;
			            }
			            o.major = major;
			            o.objectId = objectId;
			            this.setProperties(o, properties);
			            if (policies) {
			                this.setPolicies(o, policies);
			            }
			            if (addACEs) {
			                this.setACEs(o, addACEs, 'add');
			            }
			            if (removeACEs) {
			                this.setACEs(o, removeACEs, 'remove');
			            }
			            o.cmisaction = 'checkIn';
			            return this.post(this.defaultRepository.rootFolderUrl, o, {
			                content: content,
			                mimeTypeExtension: mimeTypeExtension,
			                filename: properties['cmis:name']
			            }).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getObjectOfLatestVersion = function (versionSeriesId, options) {
			            if (options === void 0) { options = { major: false }; }
			            var o = options;
			            o.cmisselector = 'object';
			            o.objectId = versionSeriesId;
			            o.versionSeriesId = versionSeriesId;
			            o.major = options.major;
			            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.setContentStream = function (objectId, content, overwriteFlag, filename, options) {
			            if (overwriteFlag === void 0) { overwriteFlag = false; }
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.objectId = objectId;
			            o.overwriteFlag = overwriteFlag;
			            o.cmisaction = 'setContent';
			            return this.post(this.defaultRepository.rootFolderUrl, o, {
			                content: content,
			                filename: filename
			            }).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.appendContentStream = function (objectId, content, isLastChunk, filename, options) {
			            if (isLastChunk === void 0) { isLastChunk = false; }
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.objectId = objectId;
			            o.cmisaction = 'appendContent';
			            o.isLastChunk = isLastChunk;
			            return this.post(this.defaultRepository.rootFolderUrl, o, {
			                content: content,
			                filename: filename
			            }).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.deleteContentStream = function (objectId, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.objectId = objectId;
			            o.cmisaction = 'deleteContent';
			            return this.post(this.defaultRepository.rootFolderUrl, o);
			        };
			        CmisSession.prototype.getAllVersions = function (versionSeriesId, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.versionSeriesId = versionSeriesId;
			            o.cmisselector = 'versions';
			            return this.get(this.defaultRepository.rootFolderUrl, o);
			        };
			        CmisSession.prototype.getAppliedPolicies = function (objectId, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.objectId = objectId;
			            o.cmisselector = 'policies';
			            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getACL = function (objectId, onlyBasicPermissions) {
			            if (onlyBasicPermissions === void 0) { onlyBasicPermissions = false; }
			            var options = new Options();
			            options.objectId = objectId;
			            options.onlyBasicPermissions = onlyBasicPermissions;
			            options.cmisselector = 'acl';
			            return this.get(this.defaultRepository.rootFolderUrl, options).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.deleteObject = function (objectId, allVersions) {
			            if (allVersions === void 0) { allVersions = false; }
			            var options = new Options();
			            options.repositoryId = this.defaultRepository.repositoryId;
			            options.cmisaction = 'delete';
			            options.objectId = objectId;
			            options.allVersions = allVersions;
			            return this.post(this.defaultRepository.rootFolderUrl, options);
			        };
			        CmisSession.prototype.deleteTree = function (objectId, allVersions, unfileObjects, continueOnFailure) {
			            if (allVersions === void 0) { allVersions = false; }
			            if (continueOnFailure === void 0) { continueOnFailure = false; }
			            var options = new Options();
			            options.repositoryId = this.defaultRepository.repositoryId;
			            options.cmisaction = 'deleteTree';
			            options.objectId = objectId;
			            options.allVersions = !!allVersions;
			            if (unfileObjects) {
			                options.unfileObjects = unfileObjects;
			            }
			            options.continueOnFailure = continueOnFailure;
			            return this.post(this.defaultRepository.rootFolderUrl, options);
			        };
			        CmisSession.prototype.getContentChanges = function (changeLogToken, includeProperties, includePolicyIds, includeACL, options) {
			            if (includeProperties === void 0) { includeProperties = false; }
			            if (includePolicyIds === void 0) { includePolicyIds = false; }
			            if (includeACL === void 0) { includeACL = false; }
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.cmisselector = 'contentChanges';
			            if (changeLogToken) {
			                o.changeLogToken = changeLogToken;
			            }
			            o.includeProperties = includeProperties;
			            o.includePolicyIds = includePolicyIds;
			            o.includeACL = includeACL;
			            return this.get(this.defaultRepository.repositoryUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.createRelationship = function (properties, policies, addACEs, removeACEs, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            this.setProperties(o, properties);
			            if (policies) {
			                this.setPolicies(o, policies);
			            }
			            if (addACEs) {
			                this.setACEs(o, addACEs, 'add');
			            }
			            if (removeACEs) {
			                this.setACEs(o, removeACEs, 'remove');
			            }
			            o.cmisaction = 'createRelationship';
			            return this.post(this.defaultRepository.repositoryUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.createPolicy = function (folderId, properties, policies, addACEs, removeACEs, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.objectId = folderId;
			            this.setProperties(o, properties);
			            if (policies) {
			                this.setPolicies(o, policies);
			            }
			            if (addACEs) {
			                this.setACEs(o, addACEs, 'add');
			            }
			            if (removeACEs) {
			                this.setACEs(o, removeACEs, 'remove');
			            }
			            o.cmisaction = 'createPolicy';
			            return this.post(this.defaultRepository.repositoryUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.createItem = function (folderId, properties, policies, addACEs, removeACEs, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.objectId = folderId;
			            this.setProperties(o, properties);
			            if (policies) {
			                this.setPolicies(o, policies);
			            }
			            if (addACEs) {
			                this.setACEs(o, addACEs, 'add');
			            }
			            if (removeACEs) {
			                this.setACEs(o, removeACEs, 'remove');
			            }
			            o.cmisaction = 'createItem';
			            return this.post(this.defaultRepository.repositoryUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getLastResult = function () {
			            return this.post(this.defaultRepository.repositoryUrl, { cmisaction: 'lastResult' }).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.addObjectToFolder = function (objectId, folderId, allVersions, options) {
			            if (allVersions === void 0) { allVersions = false; }
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.objectId = objectId;
			            o.cmisaction = 'addObjectToFolder';
			            o.allVersions = allVersions;
			            o.folderId = folderId;
			            return this.post(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.removeObjectFromFolder = function (objectId, folderId, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.objectId = objectId;
			            o.cmisaction = 'removeObjectFromFolder';
			            o.folderId = folderId;
			            return this.post(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.getObjectRelationships = function (objectId, includeSubRelationshipTypes, relationshipDirection, typeId, options) {
			            if (includeSubRelationshipTypes === void 0) { includeSubRelationshipTypes = false; }
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.objectId = objectId;
			            o.includeSubRelationshipTypes = includeSubRelationshipTypes;
			            o.relationshipDirection = relationshipDirection || 'either';
			            if (typeId) {
			                o.typeId = typeId;
			            }
			            o.cmisselector = 'relationships';
			            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.applyPolicy = function (objectId, policyId, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.objectId = objectId;
			            o.policyId = policyId;
			            o.cmisaction = 'applyPolicy';
			            return this.post(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.removePolicy = function (objectId, policyId, options) {
			            if (options === void 0) { options = {}; }
			            var o = options;
			            o.objectId = objectId;
			            o.policyId = policyId;
			            o.cmisaction = 'removePolicy';
			            return this.post(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
			        };
			        CmisSession.prototype.applyACL = function (objectId, addACEs, removeACEs, propagation) {
			            var options = new Options();
			            options.objectId = objectId;
			            options.cmisaction = 'applyACL';
			            options.propagation = propagation;
			            if (addACEs) {
			                this.setACEs(options, addACEs, 'add');
			            }
			            if (removeACEs) {
			                this.setACEs(options, removeACEs, 'remove');
			            }
			            return this.post(this.defaultRepository.rootFolderUrl, options).then(function (res) { return res.json(); });
			        };
			        return CmisSession;
			    }());
			    cmis.CmisSession = CmisSession;
			})(exports.cmis || (exports.cmis = {}));
			
		} (cmis));
		return cmis;
	}

	var hasRequiredCmis;

	function requireCmis () {
		if (hasRequiredCmis) return cmis$1;
		hasRequiredCmis = 1;
		(function (exports) {
			var cmis = requireCmis$1().cmis;
			for (var ex in cmis){
			    exports[ex] = cmis[ex];
			} 
		} (cmis$1));
		return cmis$1;
	}

	var cmisExports = requireCmis();
	var defExp = /*@__PURE__*/getDefaultExportFromCjs(cmisExports);

	var namedExports = /*#__PURE__*/_mergeNamespaces({
		__proto__: null,
		default: defExp
	}, [cmisExports]);

	const defaultExports = Object.isFrozen(defExp) ? Object.assign({}, defExp?.default || defExp || { __emptyModule: true }) : defExp;
	Object.keys(namedExports || {}).filter((key) => !defaultExports[key]).forEach((key) => defaultExports[key] = namedExports[key]);
	Object.defineProperty(defaultExports, "__" + "esModule", { value: true });
	var index = Object.isFrozen(defExp) ? Object.freeze(defaultExports) : defaultExports;

	return index;

}));
