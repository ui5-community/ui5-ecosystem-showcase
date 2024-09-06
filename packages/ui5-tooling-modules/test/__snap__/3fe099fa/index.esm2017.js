sap.ui.define(['exports'], (function (exports) { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getAugmentedNamespace(n) {
	  if (n.__esModule) return n;
	  var f = n.default;
		if (typeof f == "function") {
			var a = function a () {
				if (this instanceof a) {
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

	var global$1 = (typeof global !== "undefined" ? global :
	  typeof self !== "undefined" ? self :
	  typeof window !== "undefined" ? window : {});

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
	var browser$1 = true;
	var env = {};
	var argv = [];
	var version$2 = ''; // empty string to avoid regexp issues
	var versions = {};
	var release = {};
	var config = {};

	function noop$1() {}

	var on = noop$1;
	var addListener = noop$1;
	var once = noop$1;
	var off = noop$1;
	var removeListener = noop$1;
	var removeAllListeners = noop$1;
	var emit = noop$1;

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

	var browser$1$1 = {
	  nextTick: nextTick,
	  title: title,
	  browser: browser$1,
	  env: env,
	  argv: argv,
	  version: version$2,
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

	const CONSTANTS = {
	  NODE_CLIENT: false,
	  NODE_ADMIN: false,
	  SDK_VERSION: "${JSCORE_VERSION}"
	};
	const assert = function (assertion, message) {
	  if (!assertion) {
	    throw assertionError(message);
	  }
	};
	const assertionError = function (message) {
	  return new Error("Firebase Database (" + CONSTANTS.SDK_VERSION + ") INTERNAL ASSERT FAILED: " + message);
	};
	const stringToByteArray$1 = function (str) {
	  const out = [];
	  let p = 0;
	  for (let i = 0; i < str.length; i++) {
	    let c = str.charCodeAt(i);
	    if (c < 128) {
	      out[p++] = c;
	    } else if (c < 2048) {
	      out[p++] = c >> 6 | 192;
	      out[p++] = c & 63 | 128;
	    } else if ((c & 64512) === 55296 && i + 1 < str.length && (str.charCodeAt(i + 1) & 64512) === 56320) {
	      c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023);
	      out[p++] = c >> 18 | 240;
	      out[p++] = c >> 12 & 63 | 128;
	      out[p++] = c >> 6 & 63 | 128;
	      out[p++] = c & 63 | 128;
	    } else {
	      out[p++] = c >> 12 | 224;
	      out[p++] = c >> 6 & 63 | 128;
	      out[p++] = c & 63 | 128;
	    }
	  }
	  return out;
	};
	const byteArrayToString = function (bytes) {
	  const out = [];
	  let pos = 0, c = 0;
	  while (pos < bytes.length) {
	    const c1 = bytes[pos++];
	    if (c1 < 128) {
	      out[c++] = String.fromCharCode(c1);
	    } else if (c1 > 191 && c1 < 224) {
	      const c2 = bytes[pos++];
	      out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
	    } else if (c1 > 239 && c1 < 365) {
	      const c2 = bytes[pos++];
	      const c3 = bytes[pos++];
	      const c4 = bytes[pos++];
	      const u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 65536;
	      out[c++] = String.fromCharCode(55296 + (u >> 10));
	      out[c++] = String.fromCharCode(56320 + (u & 1023));
	    } else {
	      const c2 = bytes[pos++];
	      const c3 = bytes[pos++];
	      out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
	    }
	  }
	  return out.join("");
	};
	const base64 = {
	  byteToCharMap_: null,
	  charToByteMap_: null,
	  byteToCharMapWebSafe_: null,
	  charToByteMapWebSafe_: null,
	  ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz" + "0123456789",
	  get ENCODED_VALS() {
	    return this.ENCODED_VALS_BASE + "+/=";
	  },
	  get ENCODED_VALS_WEBSAFE() {
	    return this.ENCODED_VALS_BASE + "-_.";
	  },
	  HAS_NATIVE_SUPPORT: typeof atob === "function",
	  encodeByteArray(input, webSafe) {
	    if (!Array.isArray(input)) {
	      throw Error("encodeByteArray takes an array as a parameter");
	    }
	    this.init_();
	    const byteToCharMap = webSafe ? this.byteToCharMapWebSafe_ : this.byteToCharMap_;
	    const output = [];
	    for (let i = 0; i < input.length; i += 3) {
	      const byte1 = input[i];
	      const haveByte2 = i + 1 < input.length;
	      const byte2 = haveByte2 ? input[i + 1] : 0;
	      const haveByte3 = i + 2 < input.length;
	      const byte3 = haveByte3 ? input[i + 2] : 0;
	      const outByte1 = byte1 >> 2;
	      const outByte2 = (byte1 & 3) << 4 | byte2 >> 4;
	      let outByte3 = (byte2 & 15) << 2 | byte3 >> 6;
	      let outByte4 = byte3 & 63;
	      if (!haveByte3) {
	        outByte4 = 64;
	        if (!haveByte2) {
	          outByte3 = 64;
	        }
	      }
	      output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
	    }
	    return output.join("");
	  },
	  encodeString(input, webSafe) {
	    if (this.HAS_NATIVE_SUPPORT && !webSafe) {
	      return btoa(input);
	    }
	    return this.encodeByteArray(stringToByteArray$1(input), webSafe);
	  },
	  decodeString(input, webSafe) {
	    if (this.HAS_NATIVE_SUPPORT && !webSafe) {
	      return atob(input);
	    }
	    return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
	  },
	  decodeStringToByteArray(input, webSafe) {
	    this.init_();
	    const charToByteMap = webSafe ? this.charToByteMapWebSafe_ : this.charToByteMap_;
	    const output = [];
	    for (let i = 0; i < input.length; ) {
	      const byte1 = charToByteMap[input.charAt(i++)];
	      const haveByte2 = i < input.length;
	      const byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
	      ++i;
	      const haveByte3 = i < input.length;
	      const byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
	      ++i;
	      const haveByte4 = i < input.length;
	      const byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
	      ++i;
	      if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
	        throw new DecodeBase64StringError();
	      }
	      const outByte1 = byte1 << 2 | byte2 >> 4;
	      output.push(outByte1);
	      if (byte3 !== 64) {
	        const outByte2 = byte2 << 4 & 240 | byte3 >> 2;
	        output.push(outByte2);
	        if (byte4 !== 64) {
	          const outByte3 = byte3 << 6 & 192 | byte4;
	          output.push(outByte3);
	        }
	      }
	    }
	    return output;
	  },
	  init_() {
	    if (!this.byteToCharMap_) {
	      this.byteToCharMap_ = {};
	      this.charToByteMap_ = {};
	      this.byteToCharMapWebSafe_ = {};
	      this.charToByteMapWebSafe_ = {};
	      for (let i = 0; i < this.ENCODED_VALS.length; i++) {
	        this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
	        this.charToByteMap_[this.byteToCharMap_[i]] = i;
	        this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
	        this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
	        if (i >= this.ENCODED_VALS_BASE.length) {
	          this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
	          this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
	        }
	      }
	    }
	  }
	};
	class DecodeBase64StringError extends Error {
	  constructor() {
	    super(...arguments);
	    this.name = "DecodeBase64StringError";
	  }
	}
	const base64Encode = function (str) {
	  const utf8Bytes = stringToByteArray$1(str);
	  return base64.encodeByteArray(utf8Bytes, true);
	};
	const base64urlEncodeWithoutPadding = function (str) {
	  return base64Encode(str).replace(/\./g, "");
	};
	const base64Decode = function (str) {
	  try {
	    return base64.decodeString(str, true);
	  } catch (e) {
	    console.error("base64Decode failed: ", e);
	  }
	  return null;
	};
	function deepCopy(value) {
	  return deepExtend(undefined, value);
	}
	function deepExtend(target, source) {
	  if (!(source instanceof Object)) {
	    return source;
	  }
	  switch (source.constructor) {
	    case Date:
	      const dateValue = source;
	      return new Date(dateValue.getTime());
	    case Object:
	      if (target === undefined) {
	        target = {};
	      }
	      break;
	    case Array:
	      target = [];
	      break;
	    default:
	      return source;
	  }
	  for (const prop in source) {
	    if (!source.hasOwnProperty(prop) || !isValidKey(prop)) {
	      continue;
	    }
	    target[prop] = deepExtend(target[prop], source[prop]);
	  }
	  return target;
	}
	function isValidKey(key) {
	  return key !== "__proto__";
	}
	function getGlobal() {
	  if (typeof self !== "undefined") {
	    return self;
	  }
	  if (typeof window !== "undefined") {
	    return window;
	  }
	  if (typeof global$1 !== "undefined") {
	    return global$1;
	  }
	  throw new Error("Unable to locate global object.");
	}
	const getDefaultsFromGlobal = () => getGlobal().__FIREBASE_DEFAULTS__;
	const getDefaultsFromEnvVariable = () => {
	  if (typeof browser$1$1 === "undefined" || typeof browser$1$1.env === "undefined") {
	    return;
	  }
	  const defaultsJsonString = browser$1$1.env.__FIREBASE_DEFAULTS__;
	  if (defaultsJsonString) {
	    return JSON.parse(defaultsJsonString);
	  }
	};
	const getDefaultsFromCookie = () => {
	  if (typeof document === "undefined") {
	    return;
	  }
	  let match;
	  try {
	    match = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
	  } catch (e) {
	    return;
	  }
	  const decoded = match && base64Decode(match[1]);
	  return decoded && JSON.parse(decoded);
	};
	const getDefaults = () => {
	  try {
	    return getDefaultsFromGlobal() || getDefaultsFromEnvVariable() || getDefaultsFromCookie();
	  } catch (e) {
	    console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
	    return;
	  }
	};
	const getDefaultEmulatorHost = productName => {
	  var _a, _b;
	  return (_b = (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.emulatorHosts) === null || _b === void 0 ? void 0 : _b[productName];
	};
	const getDefaultEmulatorHostnameAndPort = productName => {
	  const host = getDefaultEmulatorHost(productName);
	  if (!host) {
	    return undefined;
	  }
	  const separatorIndex = host.lastIndexOf(":");
	  if (separatorIndex <= 0 || separatorIndex + 1 === host.length) {
	    throw new Error(`Invalid host ${host} with no separate hostname and port!`);
	  }
	  const port = parseInt(host.substring(separatorIndex + 1), 10);
	  if (host[0] === "[") {
	    return [host.substring(1, separatorIndex - 1), port];
	  } else {
	    return [host.substring(0, separatorIndex), port];
	  }
	};
	const getDefaultAppConfig = () => {
	  var _a;
	  return (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.config;
	};
	const getExperimentalSetting = name => {
	  var _a;
	  return (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a[`_${name}`];
	};
	class Deferred {
	  constructor() {
	    this.reject = () => {};
	    this.resolve = () => {};
	    this.promise = new Promise((resolve, reject) => {
	      this.resolve = resolve;
	      this.reject = reject;
	    });
	  }
	  wrapCallback(callback) {
	    return (error, value) => {
	      if (error) {
	        this.reject(error);
	      } else {
	        this.resolve(value);
	      }
	      if (typeof callback === "function") {
	        this.promise.catch(() => {});
	        if (callback.length === 1) {
	          callback(error);
	        } else {
	          callback(error, value);
	        }
	      }
	    };
	  }
	}
	function createMockUserToken(token, projectId) {
	  if (token.uid) {
	    throw new Error("The \"uid\" field is no longer supported by mockUserToken. Please use \"sub\" instead for Firebase Auth User ID.");
	  }
	  const header = {
	    alg: "none",
	    type: "JWT"
	  };
	  const project = projectId || "demo-project";
	  const iat = token.iat || 0;
	  const sub = token.sub || token.user_id;
	  if (!sub) {
	    throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");
	  }
	  const payload = Object.assign({
	    iss: `https://securetoken.google.com/${project}`,
	    aud: project,
	    iat,
	    exp: iat + 3600,
	    auth_time: iat,
	    sub,
	    user_id: sub,
	    firebase: {
	      sign_in_provider: "custom",
	      identities: {}
	    }
	  }, token);
	  const signature = "";
	  return [base64urlEncodeWithoutPadding(JSON.stringify(header)), base64urlEncodeWithoutPadding(JSON.stringify(payload)), signature].join(".");
	}
	function getUA() {
	  if (typeof navigator !== "undefined" && typeof navigator["userAgent"] === "string") {
	    return navigator["userAgent"];
	  } else {
	    return "";
	  }
	}
	function isMobileCordova() {
	  return typeof window !== "undefined" && !!(window["cordova"] || window["phonegap"] || window["PhoneGap"]) && (/ios|iphone|ipod|ipad|android|blackberry|iemobile/i).test(getUA());
	}
	function isNode() {
	  var _a;
	  const forceEnvironment = (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.forceEnvironment;
	  if (forceEnvironment === "node") {
	    return true;
	  } else if (forceEnvironment === "browser") {
	    return false;
	  }
	  try {
	    return Object.prototype.toString.call(global$1.process) === "[object process]";
	  } catch (e) {
	    return false;
	  }
	}
	function isBrowser() {
	  return typeof window !== "undefined" || isWebWorker();
	}
	function isWebWorker() {
	  return typeof WorkerGlobalScope !== "undefined" && typeof self !== "undefined" && self instanceof WorkerGlobalScope;
	}
	function isBrowserExtension() {
	  const runtime = typeof chrome === "object" ? chrome.runtime : typeof browser === "object" ? browser.runtime : undefined;
	  return typeof runtime === "object" && runtime.id !== undefined;
	}
	function isReactNative() {
	  return typeof navigator === "object" && navigator["product"] === "ReactNative";
	}
	function isElectron() {
	  return getUA().indexOf("Electron/") >= 0;
	}
	function isIE() {
	  const ua = getUA();
	  return ua.indexOf("MSIE ") >= 0 || ua.indexOf("Trident/") >= 0;
	}
	function isUWP() {
	  return getUA().indexOf("MSAppHost/") >= 0;
	}
	function isNodeSdk() {
	  return CONSTANTS.NODE_CLIENT === true || CONSTANTS.NODE_ADMIN === true;
	}
	function isSafari() {
	  return !isNode() && !!navigator.userAgent && navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome");
	}
	function isIndexedDBAvailable() {
	  try {
	    return typeof indexedDB === "object";
	  } catch (e) {
	    return false;
	  }
	}
	function validateIndexedDBOpenable() {
	  return new Promise((resolve, reject) => {
	    try {
	      let preExist = true;
	      const DB_CHECK_NAME = "validate-browser-context-for-indexeddb-analytics-module";
	      const request = self.indexedDB.open(DB_CHECK_NAME);
	      request.onsuccess = () => {
	        request.result.close();
	        if (!preExist) {
	          self.indexedDB.deleteDatabase(DB_CHECK_NAME);
	        }
	        resolve(true);
	      };
	      request.onupgradeneeded = () => {
	        preExist = false;
	      };
	      request.onerror = () => {
	        var _a;
	        reject(((_a = request.error) === null || _a === void 0 ? void 0 : _a.message) || "");
	      };
	    } catch (error) {
	      reject(error);
	    }
	  });
	}
	function areCookiesEnabled() {
	  if (typeof navigator === "undefined" || !navigator.cookieEnabled) {
	    return false;
	  }
	  return true;
	}
	const ERROR_NAME = "FirebaseError";
	class FirebaseError extends Error {
	  constructor(code, message, customData) {
	    super(message);
	    this.code = code;
	    this.customData = customData;
	    this.name = ERROR_NAME;
	    Object.setPrototypeOf(this, FirebaseError.prototype);
	    if (Error.captureStackTrace) {
	      Error.captureStackTrace(this, ErrorFactory.prototype.create);
	    }
	  }
	}
	class ErrorFactory {
	  constructor(service, serviceName, errors) {
	    this.service = service;
	    this.serviceName = serviceName;
	    this.errors = errors;
	  }
	  create(code, ...data) {
	    const customData = data[0] || ({});
	    const fullCode = `${this.service}/${code}`;
	    const template = this.errors[code];
	    const message = template ? replaceTemplate(template, customData) : "Error";
	    const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
	    const error = new FirebaseError(fullCode, fullMessage, customData);
	    return error;
	  }
	}
	function replaceTemplate(template, data) {
	  return template.replace(PATTERN, (_, key) => {
	    const value = data[key];
	    return value != null ? String(value) : `<${key}?>`;
	  });
	}
	const PATTERN = /\{\$([^}]+)}/g;
	function jsonEval(str) {
	  return JSON.parse(str);
	}
	function stringify(data) {
	  return JSON.stringify(data);
	}
	const decode = function (token) {
	  let header = {}, claims = {}, data = {}, signature = "";
	  try {
	    const parts = token.split(".");
	    header = jsonEval(base64Decode(parts[0]) || "");
	    claims = jsonEval(base64Decode(parts[1]) || "");
	    signature = parts[2];
	    data = claims["d"] || ({});
	    delete claims["d"];
	  } catch (e) {}
	  return {
	    header,
	    claims,
	    data,
	    signature
	  };
	};
	const isValidTimestamp = function (token) {
	  const claims = decode(token).claims;
	  const now = Math.floor(new Date().getTime() / 1000);
	  let validSince = 0, validUntil = 0;
	  if (typeof claims === "object") {
	    if (claims.hasOwnProperty("nbf")) {
	      validSince = claims["nbf"];
	    } else if (claims.hasOwnProperty("iat")) {
	      validSince = claims["iat"];
	    }
	    if (claims.hasOwnProperty("exp")) {
	      validUntil = claims["exp"];
	    } else {
	      validUntil = validSince + 86400;
	    }
	  }
	  return !!now && !!validSince && !!validUntil && now >= validSince && now <= validUntil;
	};
	const issuedAtTime = function (token) {
	  const claims = decode(token).claims;
	  if (typeof claims === "object" && claims.hasOwnProperty("iat")) {
	    return claims["iat"];
	  }
	  return null;
	};
	const isValidFormat = function (token) {
	  const decoded = decode(token), claims = decoded.claims;
	  return !!claims && typeof claims === "object" && claims.hasOwnProperty("iat");
	};
	const isAdmin = function (token) {
	  const claims = decode(token).claims;
	  return typeof claims === "object" && claims["admin"] === true;
	};
	function contains(obj, key) {
	  return Object.prototype.hasOwnProperty.call(obj, key);
	}
	function safeGet(obj, key) {
	  if (Object.prototype.hasOwnProperty.call(obj, key)) {
	    return obj[key];
	  } else {
	    return undefined;
	  }
	}
	function isEmpty(obj) {
	  for (const key in obj) {
	    if (Object.prototype.hasOwnProperty.call(obj, key)) {
	      return false;
	    }
	  }
	  return true;
	}
	function map(obj, fn, contextObj) {
	  const res = {};
	  for (const key in obj) {
	    if (Object.prototype.hasOwnProperty.call(obj, key)) {
	      res[key] = fn.call(contextObj, obj[key], key, obj);
	    }
	  }
	  return res;
	}
	function deepEqual(a, b) {
	  if (a === b) {
	    return true;
	  }
	  const aKeys = Object.keys(a);
	  const bKeys = Object.keys(b);
	  for (const k of aKeys) {
	    if (!bKeys.includes(k)) {
	      return false;
	    }
	    const aProp = a[k];
	    const bProp = b[k];
	    if (isObject(aProp) && isObject(bProp)) {
	      if (!deepEqual(aProp, bProp)) {
	        return false;
	      }
	    } else if (aProp !== bProp) {
	      return false;
	    }
	  }
	  for (const k of bKeys) {
	    if (!aKeys.includes(k)) {
	      return false;
	    }
	  }
	  return true;
	}
	function isObject(thing) {
	  return thing !== null && typeof thing === "object";
	}
	function promiseWithTimeout(promise, timeInMS = 2000) {
	  const deferredPromise = new Deferred();
	  setTimeout(() => deferredPromise.reject("timeout!"), timeInMS);
	  promise.then(deferredPromise.resolve, deferredPromise.reject);
	  return deferredPromise.promise;
	}
	function querystring(querystringParams) {
	  const params = [];
	  for (const [key, value] of Object.entries(querystringParams)) {
	    if (Array.isArray(value)) {
	      value.forEach(arrayVal => {
	        params.push(encodeURIComponent(key) + "=" + encodeURIComponent(arrayVal));
	      });
	    } else {
	      params.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
	    }
	  }
	  return params.length ? "&" + params.join("&") : "";
	}
	function querystringDecode(querystring) {
	  const obj = {};
	  const tokens = querystring.replace(/^\?/, "").split("&");
	  tokens.forEach(token => {
	    if (token) {
	      const [key, value] = token.split("=");
	      obj[decodeURIComponent(key)] = decodeURIComponent(value);
	    }
	  });
	  return obj;
	}
	function extractQuerystring(url) {
	  const queryStart = url.indexOf("?");
	  if (!queryStart) {
	    return "";
	  }
	  const fragmentStart = url.indexOf("#", queryStart);
	  return url.substring(queryStart, fragmentStart > 0 ? fragmentStart : undefined);
	}
	class Sha1 {
	  constructor() {
	    this.chain_ = [];
	    this.buf_ = [];
	    this.W_ = [];
	    this.pad_ = [];
	    this.inbuf_ = 0;
	    this.total_ = 0;
	    this.blockSize = 512 / 8;
	    this.pad_[0] = 128;
	    for (let i = 1; i < this.blockSize; ++i) {
	      this.pad_[i] = 0;
	    }
	    this.reset();
	  }
	  reset() {
	    this.chain_[0] = 1732584193;
	    this.chain_[1] = 4023233417;
	    this.chain_[2] = 2562383102;
	    this.chain_[3] = 271733878;
	    this.chain_[4] = 3285377520;
	    this.inbuf_ = 0;
	    this.total_ = 0;
	  }
	  compress_(buf, offset) {
	    if (!offset) {
	      offset = 0;
	    }
	    const W = this.W_;
	    if (typeof buf === "string") {
	      for (let i = 0; i < 16; i++) {
	        W[i] = buf.charCodeAt(offset) << 24 | buf.charCodeAt(offset + 1) << 16 | buf.charCodeAt(offset + 2) << 8 | buf.charCodeAt(offset + 3);
	        offset += 4;
	      }
	    } else {
	      for (let i = 0; i < 16; i++) {
	        W[i] = buf[offset] << 24 | buf[offset + 1] << 16 | buf[offset + 2] << 8 | buf[offset + 3];
	        offset += 4;
	      }
	    }
	    for (let i = 16; i < 80; i++) {
	      const t = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
	      W[i] = (t << 1 | t >>> 31) & 4294967295;
	    }
	    let a = this.chain_[0];
	    let b = this.chain_[1];
	    let c = this.chain_[2];
	    let d = this.chain_[3];
	    let e = this.chain_[4];
	    let f, k;
	    for (let i = 0; i < 80; i++) {
	      if (i < 40) {
	        if (i < 20) {
	          f = d ^ b & (c ^ d);
	          k = 1518500249;
	        } else {
	          f = b ^ c ^ d;
	          k = 1859775393;
	        }
	      } else {
	        if (i < 60) {
	          f = b & c | d & (b | c);
	          k = 2400959708;
	        } else {
	          f = b ^ c ^ d;
	          k = 3395469782;
	        }
	      }
	      const t = (a << 5 | a >>> 27) + f + e + k + W[i] & 4294967295;
	      e = d;
	      d = c;
	      c = (b << 30 | b >>> 2) & 4294967295;
	      b = a;
	      a = t;
	    }
	    this.chain_[0] = this.chain_[0] + a & 4294967295;
	    this.chain_[1] = this.chain_[1] + b & 4294967295;
	    this.chain_[2] = this.chain_[2] + c & 4294967295;
	    this.chain_[3] = this.chain_[3] + d & 4294967295;
	    this.chain_[4] = this.chain_[4] + e & 4294967295;
	  }
	  update(bytes, length) {
	    if (bytes == null) {
	      return;
	    }
	    if (length === undefined) {
	      length = bytes.length;
	    }
	    const lengthMinusBlock = length - this.blockSize;
	    let n = 0;
	    const buf = this.buf_;
	    let inbuf = this.inbuf_;
	    while (n < length) {
	      if (inbuf === 0) {
	        while (n <= lengthMinusBlock) {
	          this.compress_(bytes, n);
	          n += this.blockSize;
	        }
	      }
	      if (typeof bytes === "string") {
	        while (n < length) {
	          buf[inbuf] = bytes.charCodeAt(n);
	          ++inbuf;
	          ++n;
	          if (inbuf === this.blockSize) {
	            this.compress_(buf);
	            inbuf = 0;
	            break;
	          }
	        }
	      } else {
	        while (n < length) {
	          buf[inbuf] = bytes[n];
	          ++inbuf;
	          ++n;
	          if (inbuf === this.blockSize) {
	            this.compress_(buf);
	            inbuf = 0;
	            break;
	          }
	        }
	      }
	    }
	    this.inbuf_ = inbuf;
	    this.total_ += length;
	  }
	  digest() {
	    const digest = [];
	    let totalBits = this.total_ * 8;
	    if (this.inbuf_ < 56) {
	      this.update(this.pad_, 56 - this.inbuf_);
	    } else {
	      this.update(this.pad_, this.blockSize - (this.inbuf_ - 56));
	    }
	    for (let i = this.blockSize - 1; i >= 56; i--) {
	      this.buf_[i] = totalBits & 255;
	      totalBits /= 256;
	    }
	    this.compress_(this.buf_);
	    let n = 0;
	    for (let i = 0; i < 5; i++) {
	      for (let j = 24; j >= 0; j -= 8) {
	        digest[n] = this.chain_[i] >> j & 255;
	        ++n;
	      }
	    }
	    return digest;
	  }
	}
	function createSubscribe(executor, onNoObservers) {
	  const proxy = new ObserverProxy(executor, onNoObservers);
	  return proxy.subscribe.bind(proxy);
	}
	class ObserverProxy {
	  constructor(executor, onNoObservers) {
	    this.observers = [];
	    this.unsubscribes = [];
	    this.observerCount = 0;
	    this.task = Promise.resolve();
	    this.finalized = false;
	    this.onNoObservers = onNoObservers;
	    this.task.then(() => {
	      executor(this);
	    }).catch(e => {
	      this.error(e);
	    });
	  }
	  next(value) {
	    this.forEachObserver(observer => {
	      observer.next(value);
	    });
	  }
	  error(error) {
	    this.forEachObserver(observer => {
	      observer.error(error);
	    });
	    this.close(error);
	  }
	  complete() {
	    this.forEachObserver(observer => {
	      observer.complete();
	    });
	    this.close();
	  }
	  subscribe(nextOrObserver, error, complete) {
	    let observer;
	    if (nextOrObserver === undefined && error === undefined && complete === undefined) {
	      throw new Error("Missing Observer.");
	    }
	    if (implementsAnyMethods(nextOrObserver, ["next", "error", "complete"])) {
	      observer = nextOrObserver;
	    } else {
	      observer = {
	        next: nextOrObserver,
	        error,
	        complete
	      };
	    }
	    if (observer.next === undefined) {
	      observer.next = noop;
	    }
	    if (observer.error === undefined) {
	      observer.error = noop;
	    }
	    if (observer.complete === undefined) {
	      observer.complete = noop;
	    }
	    const unsub = this.unsubscribeOne.bind(this, this.observers.length);
	    if (this.finalized) {
	      this.task.then(() => {
	        try {
	          if (this.finalError) {
	            observer.error(this.finalError);
	          } else {
	            observer.complete();
	          }
	        } catch (e) {}
	        return;
	      });
	    }
	    this.observers.push(observer);
	    return unsub;
	  }
	  unsubscribeOne(i) {
	    if (this.observers === undefined || this.observers[i] === undefined) {
	      return;
	    }
	    delete this.observers[i];
	    this.observerCount -= 1;
	    if (this.observerCount === 0 && this.onNoObservers !== undefined) {
	      this.onNoObservers(this);
	    }
	  }
	  forEachObserver(fn) {
	    if (this.finalized) {
	      return;
	    }
	    for (let i = 0; i < this.observers.length; i++) {
	      this.sendOne(i, fn);
	    }
	  }
	  sendOne(i, fn) {
	    this.task.then(() => {
	      if (this.observers !== undefined && this.observers[i] !== undefined) {
	        try {
	          fn(this.observers[i]);
	        } catch (e) {
	          if (typeof console !== "undefined" && console.error) {
	            console.error(e);
	          }
	        }
	      }
	    });
	  }
	  close(err) {
	    if (this.finalized) {
	      return;
	    }
	    this.finalized = true;
	    if (err !== undefined) {
	      this.finalError = err;
	    }
	    this.task.then(() => {
	      this.observers = undefined;
	      this.onNoObservers = undefined;
	    });
	  }
	}
	function async(fn, onError) {
	  return (...args) => {
	    Promise.resolve(true).then(() => {
	      fn(...args);
	    }).catch(error => {
	      if (onError) {
	        onError(error);
	      }
	    });
	  };
	}
	function implementsAnyMethods(obj, methods) {
	  if (typeof obj !== "object" || obj === null) {
	    return false;
	  }
	  for (const method of methods) {
	    if ((method in obj) && typeof obj[method] === "function") {
	      return true;
	    }
	  }
	  return false;
	}
	function noop() {}
	const validateArgCount = function (fnName, minCount, maxCount, argCount) {
	  let argError;
	  if (argCount < minCount) {
	    argError = "at least " + minCount;
	  } else if (argCount > maxCount) {
	    argError = maxCount === 0 ? "none" : "no more than " + maxCount;
	  }
	  if (argError) {
	    const error = fnName + " failed: Was called with " + argCount + (argCount === 1 ? " argument." : " arguments.") + " Expects " + argError + ".";
	    throw new Error(error);
	  }
	};
	function errorPrefix(fnName, argName) {
	  return `${fnName} failed: ${argName} argument `;
	}
	function validateNamespace(fnName, namespace, optional) {
	  if (optional && !namespace) {
	    return;
	  }
	  if (typeof namespace !== "string") {
	    throw new Error(errorPrefix(fnName, "namespace") + "must be a valid firebase namespace.");
	  }
	}
	function validateCallback(fnName, argumentName, callback, optional) {
	  if (optional && !callback) {
	    return;
	  }
	  if (typeof callback !== "function") {
	    throw new Error(errorPrefix(fnName, argumentName) + "must be a valid function.");
	  }
	}
	function validateContextObject(fnName, argumentName, context, optional) {
	  if (optional && !context) {
	    return;
	  }
	  if (typeof context !== "object" || context === null) {
	    throw new Error(errorPrefix(fnName, argumentName) + "must be a valid context object.");
	  }
	}
	const stringToByteArray = function (str) {
	  const out = [];
	  let p = 0;
	  for (let i = 0; i < str.length; i++) {
	    let c = str.charCodeAt(i);
	    if (c >= 55296 && c <= 56319) {
	      const high = c - 55296;
	      i++;
	      assert(i < str.length, "Surrogate pair missing trail surrogate.");
	      const low = str.charCodeAt(i) - 56320;
	      c = 65536 + (high << 10) + low;
	    }
	    if (c < 128) {
	      out[p++] = c;
	    } else if (c < 2048) {
	      out[p++] = c >> 6 | 192;
	      out[p++] = c & 63 | 128;
	    } else if (c < 65536) {
	      out[p++] = c >> 12 | 224;
	      out[p++] = c >> 6 & 63 | 128;
	      out[p++] = c & 63 | 128;
	    } else {
	      out[p++] = c >> 18 | 240;
	      out[p++] = c >> 12 & 63 | 128;
	      out[p++] = c >> 6 & 63 | 128;
	      out[p++] = c & 63 | 128;
	    }
	  }
	  return out;
	};
	const stringLength = function (str) {
	  let p = 0;
	  for (let i = 0; i < str.length; i++) {
	    const c = str.charCodeAt(i);
	    if (c < 128) {
	      p++;
	    } else if (c < 2048) {
	      p += 2;
	    } else if (c >= 55296 && c <= 56319) {
	      p += 4;
	      i++;
	    } else {
	      p += 3;
	    }
	  }
	  return p;
	};
	const uuidv4 = function () {
	  return ("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx").replace(/[xy]/g, c => {
	    const r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
	    return v.toString(16);
	  });
	};
	const DEFAULT_INTERVAL_MILLIS = 1000;
	const DEFAULT_BACKOFF_FACTOR = 2;
	const MAX_VALUE_MILLIS = 4 * 60 * 60 * 1000;
	const RANDOM_FACTOR = 0.5;
	function calculateBackoffMillis(backoffCount, intervalMillis = DEFAULT_INTERVAL_MILLIS, backoffFactor = DEFAULT_BACKOFF_FACTOR) {
	  const currBaseValue = intervalMillis * Math.pow(backoffFactor, backoffCount);
	  const randomWait = Math.round(RANDOM_FACTOR * currBaseValue * (Math.random() - 0.5) * 2);
	  return Math.min(MAX_VALUE_MILLIS, currBaseValue + randomWait);
	}
	function ordinal(i) {
	  if (!Number.isFinite(i)) {
	    return `${i}`;
	  }
	  return i + indicator(i);
	}
	function indicator(i) {
	  i = Math.abs(i);
	  const cent = i % 100;
	  if (cent >= 10 && cent <= 20) {
	    return "th";
	  }
	  const dec = i % 10;
	  if (dec === 1) {
	    return "st";
	  }
	  if (dec === 2) {
	    return "nd";
	  }
	  if (dec === 3) {
	    return "rd";
	  }
	  return "th";
	}
	function getModularInstance(service) {
	  if (service && service._delegate) {
	    return service._delegate;
	  } else {
	    return service;
	  }
	}

	var index_esm2017$2 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		CONSTANTS: CONSTANTS,
		DecodeBase64StringError: DecodeBase64StringError,
		Deferred: Deferred,
		ErrorFactory: ErrorFactory,
		FirebaseError: FirebaseError,
		MAX_VALUE_MILLIS: MAX_VALUE_MILLIS,
		RANDOM_FACTOR: RANDOM_FACTOR,
		Sha1: Sha1,
		areCookiesEnabled: areCookiesEnabled,
		assert: assert,
		assertionError: assertionError,
		async: async,
		base64: base64,
		base64Decode: base64Decode,
		base64Encode: base64Encode,
		base64urlEncodeWithoutPadding: base64urlEncodeWithoutPadding,
		calculateBackoffMillis: calculateBackoffMillis,
		contains: contains,
		createMockUserToken: createMockUserToken,
		createSubscribe: createSubscribe,
		decode: decode,
		deepCopy: deepCopy,
		deepEqual: deepEqual,
		deepExtend: deepExtend,
		errorPrefix: errorPrefix,
		extractQuerystring: extractQuerystring,
		getDefaultAppConfig: getDefaultAppConfig,
		getDefaultEmulatorHost: getDefaultEmulatorHost,
		getDefaultEmulatorHostnameAndPort: getDefaultEmulatorHostnameAndPort,
		getDefaults: getDefaults,
		getExperimentalSetting: getExperimentalSetting,
		getGlobal: getGlobal,
		getModularInstance: getModularInstance,
		getUA: getUA,
		isAdmin: isAdmin,
		isBrowser: isBrowser,
		isBrowserExtension: isBrowserExtension,
		isElectron: isElectron,
		isEmpty: isEmpty,
		isIE: isIE,
		isIndexedDBAvailable: isIndexedDBAvailable,
		isMobileCordova: isMobileCordova,
		isNode: isNode,
		isNodeSdk: isNodeSdk,
		isReactNative: isReactNative,
		isSafari: isSafari,
		isUWP: isUWP,
		isValidFormat: isValidFormat,
		isValidTimestamp: isValidTimestamp,
		isWebWorker: isWebWorker,
		issuedAtTime: issuedAtTime,
		jsonEval: jsonEval,
		map: map,
		ordinal: ordinal,
		promiseWithTimeout: promiseWithTimeout,
		querystring: querystring,
		querystringDecode: querystringDecode,
		safeGet: safeGet,
		stringLength: stringLength,
		stringToByteArray: stringToByteArray,
		stringify: stringify,
		uuidv4: uuidv4,
		validateArgCount: validateArgCount,
		validateCallback: validateCallback,
		validateContextObject: validateContextObject,
		validateIndexedDBOpenable: validateIndexedDBOpenable,
		validateNamespace: validateNamespace
	});

	/**
	 * Component for service name T, e.g. `auth`, `auth-internal`
	 */
	class Component {
	    /**
	     *
	     * @param name The public service name, e.g. app, auth, firestore, database
	     * @param instanceFactory Service factory responsible for creating the public interface
	     * @param type whether the service provided by the component is public or private
	     */
	    constructor(name, instanceFactory, type) {
	        this.name = name;
	        this.instanceFactory = instanceFactory;
	        this.type = type;
	        this.multipleInstances = false;
	        /**
	         * Properties to be added to the service namespace
	         */
	        this.serviceProps = {};
	        this.instantiationMode = "LAZY" /* InstantiationMode.LAZY */;
	        this.onInstanceCreated = null;
	    }
	    setInstantiationMode(mode) {
	        this.instantiationMode = mode;
	        return this;
	    }
	    setMultipleInstances(multipleInstances) {
	        this.multipleInstances = multipleInstances;
	        return this;
	    }
	    setServiceProps(props) {
	        this.serviceProps = props;
	        return this;
	    }
	    setInstanceCreatedCallback(callback) {
	        this.onInstanceCreated = callback;
	        return this;
	    }
	}

	/**
	 * @license
	 * Copyright 2019 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	const DEFAULT_ENTRY_NAME$1 = '[DEFAULT]';

	/**
	 * @license
	 * Copyright 2019 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Provider for instance for service name T, e.g. 'auth', 'auth-internal'
	 * NameServiceMapping[T] is an alias for the type of the instance
	 */
	class Provider {
	    constructor(name, container) {
	        this.name = name;
	        this.container = container;
	        this.component = null;
	        this.instances = new Map();
	        this.instancesDeferred = new Map();
	        this.instancesOptions = new Map();
	        this.onInitCallbacks = new Map();
	    }
	    /**
	     * @param identifier A provider can provide mulitple instances of a service
	     * if this.component.multipleInstances is true.
	     */
	    get(identifier) {
	        // if multipleInstances is not supported, use the default name
	        const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
	        if (!this.instancesDeferred.has(normalizedIdentifier)) {
	            const deferred = new Deferred();
	            this.instancesDeferred.set(normalizedIdentifier, deferred);
	            if (this.isInitialized(normalizedIdentifier) ||
	                this.shouldAutoInitialize()) {
	                // initialize the service if it can be auto-initialized
	                try {
	                    const instance = this.getOrInitializeService({
	                        instanceIdentifier: normalizedIdentifier
	                    });
	                    if (instance) {
	                        deferred.resolve(instance);
	                    }
	                }
	                catch (e) {
	                    // when the instance factory throws an exception during get(), it should not cause
	                    // a fatal error. We just return the unresolved promise in this case.
	                }
	            }
	        }
	        return this.instancesDeferred.get(normalizedIdentifier).promise;
	    }
	    getImmediate(options) {
	        var _a;
	        // if multipleInstances is not supported, use the default name
	        const normalizedIdentifier = this.normalizeInstanceIdentifier(options === null || options === void 0 ? void 0 : options.identifier);
	        const optional = (_a = options === null || options === void 0 ? void 0 : options.optional) !== null && _a !== void 0 ? _a : false;
	        if (this.isInitialized(normalizedIdentifier) ||
	            this.shouldAutoInitialize()) {
	            try {
	                return this.getOrInitializeService({
	                    instanceIdentifier: normalizedIdentifier
	                });
	            }
	            catch (e) {
	                if (optional) {
	                    return null;
	                }
	                else {
	                    throw e;
	                }
	            }
	        }
	        else {
	            // In case a component is not initialized and should/can not be auto-initialized at the moment, return null if the optional flag is set, or throw
	            if (optional) {
	                return null;
	            }
	            else {
	                throw Error(`Service ${this.name} is not available`);
	            }
	        }
	    }
	    getComponent() {
	        return this.component;
	    }
	    setComponent(component) {
	        if (component.name !== this.name) {
	            throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
	        }
	        if (this.component) {
	            throw Error(`Component for ${this.name} has already been provided`);
	        }
	        this.component = component;
	        // return early without attempting to initialize the component if the component requires explicit initialization (calling `Provider.initialize()`)
	        if (!this.shouldAutoInitialize()) {
	            return;
	        }
	        // if the service is eager, initialize the default instance
	        if (isComponentEager(component)) {
	            try {
	                this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME$1 });
	            }
	            catch (e) {
	                // when the instance factory for an eager Component throws an exception during the eager
	                // initialization, it should not cause a fatal error.
	                // TODO: Investigate if we need to make it configurable, because some component may want to cause
	                // a fatal error in this case?
	            }
	        }
	        // Create service instances for the pending promises and resolve them
	        // NOTE: if this.multipleInstances is false, only the default instance will be created
	        // and all promises with resolve with it regardless of the identifier.
	        for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
	            const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
	            try {
	                // `getOrInitializeService()` should always return a valid instance since a component is guaranteed. use ! to make typescript happy.
	                const instance = this.getOrInitializeService({
	                    instanceIdentifier: normalizedIdentifier
	                });
	                instanceDeferred.resolve(instance);
	            }
	            catch (e) {
	                // when the instance factory throws an exception, it should not cause
	                // a fatal error. We just leave the promise unresolved.
	            }
	        }
	    }
	    clearInstance(identifier = DEFAULT_ENTRY_NAME$1) {
	        this.instancesDeferred.delete(identifier);
	        this.instancesOptions.delete(identifier);
	        this.instances.delete(identifier);
	    }
	    // app.delete() will call this method on every provider to delete the services
	    // TODO: should we mark the provider as deleted?
	    async delete() {
	        const services = Array.from(this.instances.values());
	        await Promise.all([
	            ...services
	                .filter(service => 'INTERNAL' in service) // legacy services
	                // eslint-disable-next-line @typescript-eslint/no-explicit-any
	                .map(service => service.INTERNAL.delete()),
	            ...services
	                .filter(service => '_delete' in service) // modularized services
	                // eslint-disable-next-line @typescript-eslint/no-explicit-any
	                .map(service => service._delete())
	        ]);
	    }
	    isComponentSet() {
	        return this.component != null;
	    }
	    isInitialized(identifier = DEFAULT_ENTRY_NAME$1) {
	        return this.instances.has(identifier);
	    }
	    getOptions(identifier = DEFAULT_ENTRY_NAME$1) {
	        return this.instancesOptions.get(identifier) || {};
	    }
	    initialize(opts = {}) {
	        const { options = {} } = opts;
	        const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
	        if (this.isInitialized(normalizedIdentifier)) {
	            throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
	        }
	        if (!this.isComponentSet()) {
	            throw Error(`Component ${this.name} has not been registered yet`);
	        }
	        const instance = this.getOrInitializeService({
	            instanceIdentifier: normalizedIdentifier,
	            options
	        });
	        // resolve any pending promise waiting for the service instance
	        for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
	            const normalizedDeferredIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
	            if (normalizedIdentifier === normalizedDeferredIdentifier) {
	                instanceDeferred.resolve(instance);
	            }
	        }
	        return instance;
	    }
	    /**
	     *
	     * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
	     * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
	     *
	     * @param identifier An optional instance identifier
	     * @returns a function to unregister the callback
	     */
	    onInit(callback, identifier) {
	        var _a;
	        const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
	        const existingCallbacks = (_a = this.onInitCallbacks.get(normalizedIdentifier)) !== null && _a !== void 0 ? _a : new Set();
	        existingCallbacks.add(callback);
	        this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
	        const existingInstance = this.instances.get(normalizedIdentifier);
	        if (existingInstance) {
	            callback(existingInstance, normalizedIdentifier);
	        }
	        return () => {
	            existingCallbacks.delete(callback);
	        };
	    }
	    /**
	     * Invoke onInit callbacks synchronously
	     * @param instance the service instance`
	     */
	    invokeOnInitCallbacks(instance, identifier) {
	        const callbacks = this.onInitCallbacks.get(identifier);
	        if (!callbacks) {
	            return;
	        }
	        for (const callback of callbacks) {
	            try {
	                callback(instance, identifier);
	            }
	            catch (_a) {
	                // ignore errors in the onInit callback
	            }
	        }
	    }
	    getOrInitializeService({ instanceIdentifier, options = {} }) {
	        let instance = this.instances.get(instanceIdentifier);
	        if (!instance && this.component) {
	            instance = this.component.instanceFactory(this.container, {
	                instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
	                options
	            });
	            this.instances.set(instanceIdentifier, instance);
	            this.instancesOptions.set(instanceIdentifier, options);
	            /**
	             * Invoke onInit listeners.
	             * Note this.component.onInstanceCreated is different, which is used by the component creator,
	             * while onInit listeners are registered by consumers of the provider.
	             */
	            this.invokeOnInitCallbacks(instance, instanceIdentifier);
	            /**
	             * Order is important
	             * onInstanceCreated() should be called after this.instances.set(instanceIdentifier, instance); which
	             * makes `isInitialized()` return true.
	             */
	            if (this.component.onInstanceCreated) {
	                try {
	                    this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
	                }
	                catch (_a) {
	                    // ignore errors in the onInstanceCreatedCallback
	                }
	            }
	        }
	        return instance || null;
	    }
	    normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME$1) {
	        if (this.component) {
	            return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME$1;
	        }
	        else {
	            return identifier; // assume multiple instances are supported before the component is provided.
	        }
	    }
	    shouldAutoInitialize() {
	        return (!!this.component &&
	            this.component.instantiationMode !== "EXPLICIT" /* InstantiationMode.EXPLICIT */);
	    }
	}
	// undefined should be passed to the service factory for the default instance
	function normalizeIdentifierForFactory(identifier) {
	    return identifier === DEFAULT_ENTRY_NAME$1 ? undefined : identifier;
	}
	function isComponentEager(component) {
	    return component.instantiationMode === "EAGER" /* InstantiationMode.EAGER */;
	}

	/**
	 * @license
	 * Copyright 2019 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * ComponentContainer that provides Providers for service name T, e.g. `auth`, `auth-internal`
	 */
	class ComponentContainer {
	    constructor(name) {
	        this.name = name;
	        this.providers = new Map();
	    }
	    /**
	     *
	     * @param component Component being added
	     * @param overwrite When a component with the same name has already been registered,
	     * if overwrite is true: overwrite the existing component with the new component and create a new
	     * provider with the new component. It can be useful in tests where you want to use different mocks
	     * for different tests.
	     * if overwrite is false: throw an exception
	     */
	    addComponent(component) {
	        const provider = this.getProvider(component.name);
	        if (provider.isComponentSet()) {
	            throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
	        }
	        provider.setComponent(component);
	    }
	    addOrOverwriteComponent(component) {
	        const provider = this.getProvider(component.name);
	        if (provider.isComponentSet()) {
	            // delete the existing provider from the container, so we can register the new component
	            this.providers.delete(component.name);
	        }
	        this.addComponent(component);
	    }
	    /**
	     * getProvider provides a type safe interface where it can only be called with a field name
	     * present in NameServiceMapping interface.
	     *
	     * Firebase SDKs providing services should extend NameServiceMapping interface to register
	     * themselves.
	     */
	    getProvider(name) {
	        if (this.providers.has(name)) {
	            return this.providers.get(name);
	        }
	        // create a Provider for a service that hasn't registered with Firebase
	        const provider = new Provider(name, this);
	        this.providers.set(name, provider);
	        return provider;
	    }
	    getProviders() {
	        return Array.from(this.providers.values());
	    }
	}

	var index_esm2017$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		Component: Component,
		ComponentContainer: ComponentContainer,
		Provider: Provider
	});

	var index_cjs = {};

	var tslib = {exports: {}};

	(function (module) {
	  var __extends;
	  var __assign;
	  var __rest;
	  var __decorate;
	  var __param;
	  var __esDecorate;
	  var __runInitializers;
	  var __propKey;
	  var __setFunctionName;
	  var __metadata;
	  var __awaiter;
	  var __generator;
	  var __exportStar;
	  var __values;
	  var __read;
	  var __spread;
	  var __spreadArrays;
	  var __spreadArray;
	  var __await;
	  var __asyncGenerator;
	  var __asyncDelegator;
	  var __asyncValues;
	  var __makeTemplateObject;
	  var __importStar;
	  var __importDefault;
	  var __classPrivateFieldGet;
	  var __classPrivateFieldSet;
	  var __classPrivateFieldIn;
	  var __createBinding;
	  var __addDisposableResource;
	  var __disposeResources;
	  (function (factory) {
	    var root = typeof commonjsGlobal === "object" ? commonjsGlobal : typeof self === "object" ? self : typeof this === "object" ? this : {};
	    {
	      factory(createExporter(root, createExporter(module.exports)));
	    }
	    function createExporter(exports, previous) {
	      if (exports !== root) {
	        if (typeof Object.create === "function") {
	          Object.defineProperty(exports, "__esModule", {
	            value: true
	          });
	        } else {
	          exports.__esModule = true;
	        }
	      }
	      return function (id, v) {
	        return exports[id] = previous ? previous(id, v) : v;
	      };
	    }
	  })(function (exporter) {
	    var extendStatics = Object.setPrototypeOf || ({
	      __proto__: []
	    }) instanceof Array && (function (d, b) {
	      d.__proto__ = b;
	    }) || (function (d, b) {
	      for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	    });
	    __extends = function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	      extendStatics(d, b);
	      function __() {
	        this.constructor = d;
	      }
	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	    __assign = Object.assign || (function (t) {
	      for (var s, i = 1, n = arguments.length; i < n; i++) {
	        s = arguments[i];
	        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	      }
	      return t;
	    });
	    __rest = function (s, e) {
	      var t = {};
	      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
	      if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
	        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
	      }
	      return t;
	    };
	    __decorate = function (decorators, target, key, desc) {
	      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	      return (c > 3 && r && Object.defineProperty(target, key, r), r);
	    };
	    __param = function (paramIndex, decorator) {
	      return function (target, key) {
	        decorator(target, key, paramIndex);
	      };
	    };
	    __esDecorate = function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	      function accept(f) {
	        if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
	        return f;
	      }
	      var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	      var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	      var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	      var _, done = false;
	      for (var i = decorators.length - 1; i >= 0; i--) {
	        var context = {};
	        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
	        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
	        context.addInitializer = function (f) {
	          if (done) throw new TypeError("Cannot add initializers after decoration has completed");
	          extraInitializers.push(accept(f || null));
	        };
	        var result = (0, decorators[i])(kind === "accessor" ? {
	          get: descriptor.get,
	          set: descriptor.set
	        } : descriptor[key], context);
	        if (kind === "accessor") {
	          if (result === void 0) continue;
	          if (result === null || typeof result !== "object") throw new TypeError("Object expected");
	          if (_ = accept(result.get)) descriptor.get = _;
	          if (_ = accept(result.set)) descriptor.set = _;
	          if (_ = accept(result.init)) initializers.unshift(_);
	        } else if (_ = accept(result)) {
	          if (kind === "field") initializers.unshift(_); else descriptor[key] = _;
	        }
	      }
	      if (target) Object.defineProperty(target, contextIn.name, descriptor);
	      done = true;
	    };
	    __runInitializers = function (thisArg, initializers, value) {
	      var useValue = arguments.length > 2;
	      for (var i = 0; i < initializers.length; i++) {
	        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	      }
	      return useValue ? value : void 0;
	    };
	    __propKey = function (x) {
	      return typeof x === "symbol" ? x : ("").concat(x);
	    };
	    __setFunctionName = function (f, name, prefix) {
	      if (typeof name === "symbol") name = name.description ? ("[").concat(name.description, "]") : "";
	      return Object.defineProperty(f, "name", {
	        configurable: true,
	        value: prefix ? ("").concat(prefix, " ", name) : name
	      });
	    };
	    __metadata = function (metadataKey, metadataValue) {
	      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
	    };
	    __awaiter = function (thisArg, _arguments, P, generator) {
	      function adopt(value) {
	        return value instanceof P ? value : new P(function (resolve) {
	          resolve(value);
	        });
	      }
	      return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) {
	          try {
	            step(generator.next(value));
	          } catch (e) {
	            reject(e);
	          }
	        }
	        function rejected(value) {
	          try {
	            step(generator["throw"](value));
	          } catch (e) {
	            reject(e);
	          }
	        }
	        function step(result) {
	          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
	        }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	      });
	    };
	    __generator = function (thisArg, body) {
	      var _ = {
	        label: 0,
	        sent: function () {
	          if (t[0] & 1) throw t[1];
	          return t[1];
	        },
	        trys: [],
	        ops: []
	      }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
	      return (g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () {
	        return this;
	      }), g);
	      function verb(n) {
	        return function (v) {
	          return step([n, v]);
	        };
	      }
	      function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while ((g && (g = 0, op[0] && (_ = 0)), _)) try {
	          if ((f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)) return t;
	          if ((y = 0, t)) op = [op[0] & 2, t.value];
	          switch (op[0]) {
	            case 0:
	            case 1:
	              t = op;
	              break;
	            case 4:
	              _.label++;
	              return {
	                value: op[1],
	                done: false
	              };
	            case 5:
	              _.label++;
	              y = op[1];
	              op = [0];
	              continue;
	            case 7:
	              op = _.ops.pop();
	              _.trys.pop();
	              continue;
	            default:
	              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
	                _ = 0;
	                continue;
	              }
	              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
	                _.label = op[1];
	                break;
	              }
	              if (op[0] === 6 && _.label < t[1]) {
	                _.label = t[1];
	                t = op;
	                break;
	              }
	              if (t && _.label < t[2]) {
	                _.label = t[2];
	                _.ops.push(op);
	                break;
	              }
	              if (t[2]) _.ops.pop();
	              _.trys.pop();
	              continue;
	          }
	          op = body.call(thisArg, _);
	        } catch (e) {
	          op = [6, e];
	          y = 0;
	        } finally {
	          f = t = 0;
	        }
	        if (op[0] & 5) throw op[1];
	        return {
	          value: op[0] ? op[1] : void 0,
	          done: true
	        };
	      }
	    };
	    __exportStar = function (m, o) {
	      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
	    };
	    __createBinding = Object.create ? function (o, m, k, k2) {
	      if (k2 === undefined) k2 = k;
	      var desc = Object.getOwnPropertyDescriptor(m, k);
	      if (!desc || (("get" in desc) ? !m.__esModule : desc.writable || desc.configurable)) {
	        desc = {
	          enumerable: true,
	          get: function () {
	            return m[k];
	          }
	        };
	      }
	      Object.defineProperty(o, k2, desc);
	    } : function (o, m, k, k2) {
	      if (k2 === undefined) k2 = k;
	      o[k2] = m[k];
	    };
	    __values = function (o) {
	      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
	      if (m) return m.call(o);
	      if (o && typeof o.length === "number") return {
	        next: function () {
	          if (o && i >= o.length) o = void 0;
	          return {
	            value: o && o[i++],
	            done: !o
	          };
	        }
	      };
	      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
	    };
	    __read = function (o, n) {
	      var m = typeof Symbol === "function" && o[Symbol.iterator];
	      if (!m) return o;
	      var i = m.call(o), r, ar = [], e;
	      try {
	        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
	      } catch (error) {
	        e = {
	          error: error
	        };
	      } finally {
	        try {
	          if (r && !r.done && (m = i["return"])) m.call(i);
	        } finally {
	          if (e) throw e.error;
	        }
	      }
	      return ar;
	    };
	    __spread = function () {
	      for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
	      return ar;
	    };
	    __spreadArrays = function () {
	      for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
	      for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; (j++, k++)) r[k] = a[j];
	      return r;
	    };
	    __spreadArray = function (to, from, pack) {
	      if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
	        if (ar || !((i in from))) {
	          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
	          ar[i] = from[i];
	        }
	      }
	      return to.concat(ar || Array.prototype.slice.call(from));
	    };
	    __await = function (v) {
	      return this instanceof __await ? (this.v = v, this) : new __await(v);
	    };
	    __asyncGenerator = function (thisArg, _arguments, generator) {
	      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
	      var g = generator.apply(thisArg, _arguments || []), i, q = [];
	      return (i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () {
	        return this;
	      }, i);
	      function awaitReturn(f) {
	        return function (v) {
	          return Promise.resolve(v).then(f, reject);
	        };
	      }
	      function verb(n, f) {
	        if (g[n]) {
	          i[n] = function (v) {
	            return new Promise(function (a, b) {
	              q.push([n, v, a, b]) > 1 || resume(n, v);
	            });
	          };
	          if (f) i[n] = f(i[n]);
	        }
	      }
	      function resume(n, v) {
	        try {
	          step(g[n](v));
	        } catch (e) {
	          settle(q[0][3], e);
	        }
	      }
	      function step(r) {
	        r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
	      }
	      function fulfill(value) {
	        resume("next", value);
	      }
	      function reject(value) {
	        resume("throw", value);
	      }
	      function settle(f, v) {
	        if ((f(v), q.shift(), q.length)) resume(q[0][0], q[0][1]);
	      }
	    };
	    __asyncDelegator = function (o) {
	      var i, p;
	      return (i = {}, verb("next"), verb("throw", function (e) {
	        throw e;
	      }), verb("return"), i[Symbol.iterator] = function () {
	        return this;
	      }, i);
	      function verb(n, f) {
	        i[n] = o[n] ? function (v) {
	          return (p = !p) ? {
	            value: __await(o[n](v)),
	            done: false
	          } : f ? f(v) : v;
	        } : f;
	      }
	    };
	    __asyncValues = function (o) {
	      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
	      var m = o[Symbol.asyncIterator], i;
	      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () {
	        return this;
	      }, i);
	      function verb(n) {
	        i[n] = o[n] && (function (v) {
	          return new Promise(function (resolve, reject) {
	            (v = o[n](v), settle(resolve, reject, v.done, v.value));
	          });
	        });
	      }
	      function settle(resolve, reject, d, v) {
	        Promise.resolve(v).then(function (v) {
	          resolve({
	            value: v,
	            done: d
	          });
	        }, reject);
	      }
	    };
	    __makeTemplateObject = function (cooked, raw) {
	      if (Object.defineProperty) {
	        Object.defineProperty(cooked, "raw", {
	          value: raw
	        });
	      } else {
	        cooked.raw = raw;
	      }
	      return cooked;
	    };
	    var __setModuleDefault = Object.create ? function (o, v) {
	      Object.defineProperty(o, "default", {
	        enumerable: true,
	        value: v
	      });
	    } : function (o, v) {
	      o["default"] = v;
	    };
	    __importStar = function (mod) {
	      if (mod && mod.__esModule) return mod;
	      var result = {};
	      if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	      __setModuleDefault(result, mod);
	      return result;
	    };
	    __importDefault = function (mod) {
	      return mod && mod.__esModule ? mod : {
	        "default": mod
	      };
	    };
	    __classPrivateFieldGet = function (receiver, state, kind, f) {
	      if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
	      if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
	      return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	    };
	    __classPrivateFieldSet = function (receiver, state, value, kind, f) {
	      if (kind === "m") throw new TypeError("Private method is not writable");
	      if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
	      if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
	      return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value);
	    };
	    __classPrivateFieldIn = function (state, receiver) {
	      if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
	      return typeof state === "function" ? receiver === state : state.has(receiver);
	    };
	    __addDisposableResource = function (env, value, async) {
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
	        if (inner) dispose = function () {
	          try {
	            inner.call(this);
	          } catch (e) {
	            return Promise.reject(e);
	          }
	        };
	        env.stack.push({
	          value: value,
	          dispose: dispose,
	          async: async
	        });
	      } else if (async) {
	        env.stack.push({
	          async: true
	        });
	      }
	      return value;
	    };
	    var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
	      var e = new Error(message);
	      return (e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e);
	    };
	    __disposeResources = function (env) {
	      function fail(e) {
	        env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
	        env.hasError = true;
	      }
	      var r, s = 0;
	      function next() {
	        while (r = env.stack.pop()) {
	          try {
	            if (!r.async && s === 1) return (s = 0, env.stack.push(r), Promise.resolve().then(next));
	            if (r.dispose) {
	              var result = r.dispose.call(r.value);
	              if (r.async) return (s |= 2, Promise.resolve(result).then(next, function (e) {
	                fail(e);
	                return next();
	              }));
	            } else s |= 1;
	          } catch (e) {
	            fail(e);
	          }
	        }
	        if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
	        if (env.hasError) throw env.error;
	      }
	      return next();
	    };
	    exporter("__extends", __extends);
	    exporter("__assign", __assign);
	    exporter("__rest", __rest);
	    exporter("__decorate", __decorate);
	    exporter("__param", __param);
	    exporter("__esDecorate", __esDecorate);
	    exporter("__runInitializers", __runInitializers);
	    exporter("__propKey", __propKey);
	    exporter("__setFunctionName", __setFunctionName);
	    exporter("__metadata", __metadata);
	    exporter("__awaiter", __awaiter);
	    exporter("__generator", __generator);
	    exporter("__exportStar", __exportStar);
	    exporter("__createBinding", __createBinding);
	    exporter("__values", __values);
	    exporter("__read", __read);
	    exporter("__spread", __spread);
	    exporter("__spreadArrays", __spreadArrays);
	    exporter("__spreadArray", __spreadArray);
	    exporter("__await", __await);
	    exporter("__asyncGenerator", __asyncGenerator);
	    exporter("__asyncDelegator", __asyncDelegator);
	    exporter("__asyncValues", __asyncValues);
	    exporter("__makeTemplateObject", __makeTemplateObject);
	    exporter("__importStar", __importStar);
	    exporter("__importDefault", __importDefault);
	    exporter("__classPrivateFieldGet", __classPrivateFieldGet);
	    exporter("__classPrivateFieldSet", __classPrivateFieldSet);
	    exporter("__classPrivateFieldIn", __classPrivateFieldIn);
	    exporter("__addDisposableResource", __addDisposableResource);
	    exporter("__disposeResources", __disposeResources);
	  });
	})(tslib);
	var tslibExports = tslib.exports;

	(function (exports) {

		Object.defineProperty(exports, '__esModule', { value: true });

		var tslib = tslibExports;

		/**
		 * @license
		 * Copyright 2017 Google LLC
		 *
		 * Licensed under the Apache License, Version 2.0 (the "License");
		 * you may not use this file except in compliance with the License.
		 * You may obtain a copy of the License at
		 *
		 *   http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */
		var _a;
		/**
		 * A container for all of the Logger instances
		 */
		var instances = [];
		/**
		 * The JS SDK supports 5 log levels and also allows a user the ability to
		 * silence the logs altogether.
		 *
		 * The order is a follows:
		 * DEBUG < VERBOSE < INFO < WARN < ERROR
		 *
		 * All of the log types above the current log level will be captured (i.e. if
		 * you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
		 * `VERBOSE` logs will not)
		 */
		exports.LogLevel = void 0;
		(function (LogLevel) {
		    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
		    LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
		    LogLevel[LogLevel["INFO"] = 2] = "INFO";
		    LogLevel[LogLevel["WARN"] = 3] = "WARN";
		    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
		    LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
		})(exports.LogLevel || (exports.LogLevel = {}));
		var levelStringToEnum = {
		    'debug': exports.LogLevel.DEBUG,
		    'verbose': exports.LogLevel.VERBOSE,
		    'info': exports.LogLevel.INFO,
		    'warn': exports.LogLevel.WARN,
		    'error': exports.LogLevel.ERROR,
		    'silent': exports.LogLevel.SILENT
		};
		/**
		 * The default log level
		 */
		var defaultLogLevel = exports.LogLevel.INFO;
		/**
		 * By default, `console.debug` is not displayed in the developer console (in
		 * chrome). To avoid forcing users to have to opt-in to these logs twice
		 * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
		 * logs to the `console.log` function.
		 */
		var ConsoleMethod = (_a = {},
		    _a[exports.LogLevel.DEBUG] = 'log',
		    _a[exports.LogLevel.VERBOSE] = 'log',
		    _a[exports.LogLevel.INFO] = 'info',
		    _a[exports.LogLevel.WARN] = 'warn',
		    _a[exports.LogLevel.ERROR] = 'error',
		    _a);
		/**
		 * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
		 * messages on to their corresponding console counterparts (if the log method
		 * is supported by the current log level)
		 */
		var defaultLogHandler = function (instance, logType) {
		    var args = [];
		    for (var _i = 2; _i < arguments.length; _i++) {
		        args[_i - 2] = arguments[_i];
		    }
		    if (logType < instance.logLevel) {
		        return;
		    }
		    var now = new Date().toISOString();
		    var method = ConsoleMethod[logType];
		    if (method) {
		        console[method].apply(console, tslib.__spreadArray(["[".concat(now, "]  ").concat(instance.name, ":")], args, false));
		    }
		    else {
		        throw new Error("Attempted to log a message with an invalid logType (value: ".concat(logType, ")"));
		    }
		};
		var Logger = /** @class */ (function () {
		    /**
		     * Gives you an instance of a Logger to capture messages according to
		     * Firebase's logging scheme.
		     *
		     * @param name The name that the logs will be associated with
		     */
		    function Logger(name) {
		        this.name = name;
		        /**
		         * The log level of the given Logger instance.
		         */
		        this._logLevel = defaultLogLevel;
		        /**
		         * The main (internal) log handler for the Logger instance.
		         * Can be set to a new function in internal package code but not by user.
		         */
		        this._logHandler = defaultLogHandler;
		        /**
		         * The optional, additional, user-defined log handler for the Logger instance.
		         */
		        this._userLogHandler = null;
		        /**
		         * Capture the current instance for later use
		         */
		        instances.push(this);
		    }
		    Object.defineProperty(Logger.prototype, "logLevel", {
		        get: function () {
		            return this._logLevel;
		        },
		        set: function (val) {
		            if (!(val in exports.LogLevel)) {
		                throw new TypeError("Invalid value \"".concat(val, "\" assigned to `logLevel`"));
		            }
		            this._logLevel = val;
		        },
		        enumerable: false,
		        configurable: true
		    });
		    // Workaround for setter/getter having to be the same type.
		    Logger.prototype.setLogLevel = function (val) {
		        this._logLevel = typeof val === 'string' ? levelStringToEnum[val] : val;
		    };
		    Object.defineProperty(Logger.prototype, "logHandler", {
		        get: function () {
		            return this._logHandler;
		        },
		        set: function (val) {
		            if (typeof val !== 'function') {
		                throw new TypeError('Value assigned to `logHandler` must be a function');
		            }
		            this._logHandler = val;
		        },
		        enumerable: false,
		        configurable: true
		    });
		    Object.defineProperty(Logger.prototype, "userLogHandler", {
		        get: function () {
		            return this._userLogHandler;
		        },
		        set: function (val) {
		            this._userLogHandler = val;
		        },
		        enumerable: false,
		        configurable: true
		    });
		    /**
		     * The functions below are all based on the `console` interface
		     */
		    Logger.prototype.debug = function () {
		        var args = [];
		        for (var _i = 0; _i < arguments.length; _i++) {
		            args[_i] = arguments[_i];
		        }
		        this._userLogHandler && this._userLogHandler.apply(this, tslib.__spreadArray([this, exports.LogLevel.DEBUG], args, false));
		        this._logHandler.apply(this, tslib.__spreadArray([this, exports.LogLevel.DEBUG], args, false));
		    };
		    Logger.prototype.log = function () {
		        var args = [];
		        for (var _i = 0; _i < arguments.length; _i++) {
		            args[_i] = arguments[_i];
		        }
		        this._userLogHandler && this._userLogHandler.apply(this, tslib.__spreadArray([this, exports.LogLevel.VERBOSE], args, false));
		        this._logHandler.apply(this, tslib.__spreadArray([this, exports.LogLevel.VERBOSE], args, false));
		    };
		    Logger.prototype.info = function () {
		        var args = [];
		        for (var _i = 0; _i < arguments.length; _i++) {
		            args[_i] = arguments[_i];
		        }
		        this._userLogHandler && this._userLogHandler.apply(this, tslib.__spreadArray([this, exports.LogLevel.INFO], args, false));
		        this._logHandler.apply(this, tslib.__spreadArray([this, exports.LogLevel.INFO], args, false));
		    };
		    Logger.prototype.warn = function () {
		        var args = [];
		        for (var _i = 0; _i < arguments.length; _i++) {
		            args[_i] = arguments[_i];
		        }
		        this._userLogHandler && this._userLogHandler.apply(this, tslib.__spreadArray([this, exports.LogLevel.WARN], args, false));
		        this._logHandler.apply(this, tslib.__spreadArray([this, exports.LogLevel.WARN], args, false));
		    };
		    Logger.prototype.error = function () {
		        var args = [];
		        for (var _i = 0; _i < arguments.length; _i++) {
		            args[_i] = arguments[_i];
		        }
		        this._userLogHandler && this._userLogHandler.apply(this, tslib.__spreadArray([this, exports.LogLevel.ERROR], args, false));
		        this._logHandler.apply(this, tslib.__spreadArray([this, exports.LogLevel.ERROR], args, false));
		    };
		    return Logger;
		}());
		function setLogLevel(level) {
		    instances.forEach(function (inst) {
		        inst.setLogLevel(level);
		    });
		}
		function setUserLogHandler(logCallback, options) {
		    var _loop_1 = function (instance) {
		        var customLogLevel = null;
		        if (options && options.level) {
		            customLogLevel = levelStringToEnum[options.level];
		        }
		        if (logCallback === null) {
		            instance.userLogHandler = null;
		        }
		        else {
		            instance.userLogHandler = function (instance, level) {
		                var args = [];
		                for (var _i = 2; _i < arguments.length; _i++) {
		                    args[_i - 2] = arguments[_i];
		                }
		                var message = args
		                    .map(function (arg) {
		                    if (arg == null) {
		                        return null;
		                    }
		                    else if (typeof arg === 'string') {
		                        return arg;
		                    }
		                    else if (typeof arg === 'number' || typeof arg === 'boolean') {
		                        return arg.toString();
		                    }
		                    else if (arg instanceof Error) {
		                        return arg.message;
		                    }
		                    else {
		                        try {
		                            return JSON.stringify(arg);
		                        }
		                        catch (ignored) {
		                            return null;
		                        }
		                    }
		                })
		                    .filter(function (arg) { return arg; })
		                    .join(' ');
		                if (level >= (customLogLevel !== null && customLogLevel !== void 0 ? customLogLevel : instance.logLevel)) {
		                    logCallback({
		                        level: exports.LogLevel[level].toLowerCase(),
		                        message: message,
		                        args: args,
		                        type: instance.name
		                    });
		                }
		            };
		        }
		    };
		    for (var _i = 0, instances_1 = instances; _i < instances_1.length; _i++) {
		        var instance = instances_1[_i];
		        _loop_1(instance);
		    }
		}

		exports.Logger = Logger;
		exports.setLogLevel = setLogLevel;
		exports.setUserLogHandler = setUserLogHandler;
		
	} (index_cjs));

	var build = {};

	var wrapIdbValue$1 = {};

	const instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);

	let idbProxyableTypes;
	let cursorAdvanceMethods;
	// This is a function to prevent it throwing up in node environments.
	function getIdbProxyableTypes() {
	    return (idbProxyableTypes ||
	        (idbProxyableTypes = [
	            IDBDatabase,
	            IDBObjectStore,
	            IDBIndex,
	            IDBCursor,
	            IDBTransaction,
	        ]));
	}
	// This is a function to prevent it throwing up in node environments.
	function getCursorAdvanceMethods() {
	    return (cursorAdvanceMethods ||
	        (cursorAdvanceMethods = [
	            IDBCursor.prototype.advance,
	            IDBCursor.prototype.continue,
	            IDBCursor.prototype.continuePrimaryKey,
	        ]));
	}
	const cursorRequestMap = new WeakMap();
	const transactionDoneMap = new WeakMap();
	const transactionStoreNamesMap = new WeakMap();
	const transformCache = new WeakMap();
	const reverseTransformCache = new WeakMap();
	function promisifyRequest(request) {
	    const promise = new Promise((resolve, reject) => {
	        const unlisten = () => {
	            request.removeEventListener('success', success);
	            request.removeEventListener('error', error);
	        };
	        const success = () => {
	            resolve(wrap(request.result));
	            unlisten();
	        };
	        const error = () => {
	            reject(request.error);
	            unlisten();
	        };
	        request.addEventListener('success', success);
	        request.addEventListener('error', error);
	    });
	    promise
	        .then((value) => {
	        // Since cursoring reuses the IDBRequest (*sigh*), we cache it for later retrieval
	        // (see wrapFunction).
	        if (value instanceof IDBCursor) {
	            cursorRequestMap.set(value, request);
	        }
	        // Catching to avoid "Uncaught Promise exceptions"
	    })
	        .catch(() => { });
	    // This mapping exists in reverseTransformCache but doesn't doesn't exist in transformCache. This
	    // is because we create many promises from a single IDBRequest.
	    reverseTransformCache.set(promise, request);
	    return promise;
	}
	function cacheDonePromiseForTransaction(tx) {
	    // Early bail if we've already created a done promise for this transaction.
	    if (transactionDoneMap.has(tx))
	        return;
	    const done = new Promise((resolve, reject) => {
	        const unlisten = () => {
	            tx.removeEventListener('complete', complete);
	            tx.removeEventListener('error', error);
	            tx.removeEventListener('abort', error);
	        };
	        const complete = () => {
	            resolve();
	            unlisten();
	        };
	        const error = () => {
	            reject(tx.error || new DOMException('AbortError', 'AbortError'));
	            unlisten();
	        };
	        tx.addEventListener('complete', complete);
	        tx.addEventListener('error', error);
	        tx.addEventListener('abort', error);
	    });
	    // Cache it for later retrieval.
	    transactionDoneMap.set(tx, done);
	}
	let idbProxyTraps = {
	    get(target, prop, receiver) {
	        if (target instanceof IDBTransaction) {
	            // Special handling for transaction.done.
	            if (prop === 'done')
	                return transactionDoneMap.get(target);
	            // Polyfill for objectStoreNames because of Edge.
	            if (prop === 'objectStoreNames') {
	                return target.objectStoreNames || transactionStoreNamesMap.get(target);
	            }
	            // Make tx.store return the only store in the transaction, or undefined if there are many.
	            if (prop === 'store') {
	                return receiver.objectStoreNames[1]
	                    ? undefined
	                    : receiver.objectStore(receiver.objectStoreNames[0]);
	            }
	        }
	        // Else transform whatever we get back.
	        return wrap(target[prop]);
	    },
	    set(target, prop, value) {
	        target[prop] = value;
	        return true;
	    },
	    has(target, prop) {
	        if (target instanceof IDBTransaction &&
	            (prop === 'done' || prop === 'store')) {
	            return true;
	        }
	        return prop in target;
	    },
	};
	function replaceTraps(callback) {
	    idbProxyTraps = callback(idbProxyTraps);
	}
	function wrapFunction(func) {
	    // Due to expected object equality (which is enforced by the caching in `wrap`), we
	    // only create one new func per func.
	    // Edge doesn't support objectStoreNames (booo), so we polyfill it here.
	    if (func === IDBDatabase.prototype.transaction &&
	        !('objectStoreNames' in IDBTransaction.prototype)) {
	        return function (storeNames, ...args) {
	            const tx = func.call(unwrap(this), storeNames, ...args);
	            transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
	            return wrap(tx);
	        };
	    }
	    // Cursor methods are special, as the behaviour is a little more different to standard IDB. In
	    // IDB, you advance the cursor and wait for a new 'success' on the IDBRequest that gave you the
	    // cursor. It's kinda like a promise that can resolve with many values. That doesn't make sense
	    // with real promises, so each advance methods returns a new promise for the cursor object, or
	    // undefined if the end of the cursor has been reached.
	    if (getCursorAdvanceMethods().includes(func)) {
	        return function (...args) {
	            // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
	            // the original object.
	            func.apply(unwrap(this), args);
	            return wrap(cursorRequestMap.get(this));
	        };
	    }
	    return function (...args) {
	        // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
	        // the original object.
	        return wrap(func.apply(unwrap(this), args));
	    };
	}
	function transformCachableValue(value) {
	    if (typeof value === 'function')
	        return wrapFunction(value);
	    // This doesn't return, it just creates a 'done' promise for the transaction,
	    // which is later returned for transaction.done (see idbObjectHandler).
	    if (value instanceof IDBTransaction)
	        cacheDonePromiseForTransaction(value);
	    if (instanceOfAny(value, getIdbProxyableTypes()))
	        return new Proxy(value, idbProxyTraps);
	    // Return the same value back if we're not going to transform it.
	    return value;
	}
	function wrap(value) {
	    // We sometimes generate multiple promises from a single IDBRequest (eg when cursoring), because
	    // IDB is weird and a single IDBRequest can yield many responses, so these can't be cached.
	    if (value instanceof IDBRequest)
	        return promisifyRequest(value);
	    // If we've already transformed this value before, reuse the transformed value.
	    // This is faster, but it also provides object equality.
	    if (transformCache.has(value))
	        return transformCache.get(value);
	    const newValue = transformCachableValue(value);
	    // Not all types are transformed.
	    // These may be primitive types, so they can't be WeakMap keys.
	    if (newValue !== value) {
	        transformCache.set(value, newValue);
	        reverseTransformCache.set(newValue, value);
	    }
	    return newValue;
	}
	const unwrap = (value) => reverseTransformCache.get(value);

	wrapIdbValue$1.instanceOfAny = instanceOfAny;
	wrapIdbValue$1.replaceTraps = replaceTraps;
	wrapIdbValue$1.reverseTransformCache = reverseTransformCache;
	wrapIdbValue$1.unwrap = unwrap;
	wrapIdbValue$1.wrap = wrap;

	Object.defineProperty(build, '__esModule', { value: true });

	var wrapIdbValue = wrapIdbValue$1;

	/**
	 * Open a database.
	 *
	 * @param name Name of the database.
	 * @param version Schema version.
	 * @param callbacks Additional callbacks.
	 */
	function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
	    const request = indexedDB.open(name, version);
	    const openPromise = wrapIdbValue.wrap(request);
	    if (upgrade) {
	        request.addEventListener('upgradeneeded', (event) => {
	            upgrade(wrapIdbValue.wrap(request.result), event.oldVersion, event.newVersion, wrapIdbValue.wrap(request.transaction), event);
	        });
	    }
	    if (blocked) {
	        request.addEventListener('blocked', (event) => blocked(
	        // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
	        event.oldVersion, event.newVersion, event));
	    }
	    openPromise
	        .then((db) => {
	        if (terminated)
	            db.addEventListener('close', () => terminated());
	        if (blocking) {
	            db.addEventListener('versionchange', (event) => blocking(event.oldVersion, event.newVersion, event));
	        }
	    })
	        .catch(() => { });
	    return openPromise;
	}
	/**
	 * Delete a database.
	 *
	 * @param name Name of the database.
	 */
	function deleteDB(name, { blocked } = {}) {
	    const request = indexedDB.deleteDatabase(name);
	    if (blocked) {
	        request.addEventListener('blocked', (event) => blocked(
	        // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
	        event.oldVersion, event));
	    }
	    return wrapIdbValue.wrap(request).then(() => undefined);
	}

	const readMethods = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'];
	const writeMethods = ['put', 'add', 'delete', 'clear'];
	const cachedMethods = new Map();
	function getMethod(target, prop) {
	    if (!(target instanceof IDBDatabase &&
	        !(prop in target) &&
	        typeof prop === 'string')) {
	        return;
	    }
	    if (cachedMethods.get(prop))
	        return cachedMethods.get(prop);
	    const targetFuncName = prop.replace(/FromIndex$/, '');
	    const useIndex = prop !== targetFuncName;
	    const isWrite = writeMethods.includes(targetFuncName);
	    if (
	    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
	    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) ||
	        !(isWrite || readMethods.includes(targetFuncName))) {
	        return;
	    }
	    const method = async function (storeName, ...args) {
	        // isWrite ? 'readwrite' : undefined gzipps better, but fails in Edge :(
	        const tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
	        let target = tx.store;
	        if (useIndex)
	            target = target.index(args.shift());
	        // Must reject if op rejects.
	        // If it's a write operation, must reject if tx.done rejects.
	        // Must reject with op rejection first.
	        // Must resolve with op value.
	        // Must handle both promises (no unhandled rejections)
	        return (await Promise.all([
	            target[targetFuncName](...args),
	            isWrite && tx.done,
	        ]))[0];
	    };
	    cachedMethods.set(prop, method);
	    return method;
	}
	wrapIdbValue.replaceTraps((oldTraps) => ({
	    ...oldTraps,
	    get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
	    has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop),
	}));

	build.unwrap = wrapIdbValue.unwrap;
	build.wrap = wrapIdbValue.wrap;
	build.deleteDB = deleteDB;
	var openDB_1 = build.openDB = openDB;

	/**
	 * @license
	 * Copyright 2019 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	class PlatformLoggerServiceImpl {
	    constructor(container) {
	        this.container = container;
	    }
	    // In initial implementation, this will be called by installations on
	    // auth token refresh, and installations will send this string.
	    getPlatformInfoString() {
	        const providers = this.container.getProviders();
	        // Loop through providers and get library/version pairs from any that are
	        // version components.
	        return providers
	            .map(provider => {
	            if (isVersionServiceProvider(provider)) {
	                const service = provider.getImmediate();
	                return `${service.library}/${service.version}`;
	            }
	            else {
	                return null;
	            }
	        })
	            .filter(logString => logString)
	            .join(' ');
	    }
	}
	/**
	 *
	 * @param provider check if this provider provides a VersionService
	 *
	 * NOTE: Using Provider<'app-version'> is a hack to indicate that the provider
	 * provides VersionService. The provider is not necessarily a 'app-version'
	 * provider.
	 */
	function isVersionServiceProvider(provider) {
	    const component = provider.getComponent();
	    return (component === null || component === void 0 ? void 0 : component.type) === "VERSION" /* ComponentType.VERSION */;
	}

	const name$p = "@firebase/app";
	const version$1 = "0.10.10";

	/**
	 * @license
	 * Copyright 2019 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	const logger = new index_cjs.Logger('@firebase/app');

	const name$o = "@firebase/app-compat";

	const name$n = "@firebase/analytics-compat";

	const name$m = "@firebase/analytics";

	const name$l = "@firebase/app-check-compat";

	const name$k = "@firebase/app-check";

	const name$j = "@firebase/auth";

	const name$i = "@firebase/auth-compat";

	const name$h = "@firebase/database";

	const name$g = "@firebase/database-compat";

	const name$f = "@firebase/functions";

	const name$e = "@firebase/functions-compat";

	const name$d = "@firebase/installations";

	const name$c = "@firebase/installations-compat";

	const name$b = "@firebase/messaging";

	const name$a = "@firebase/messaging-compat";

	const name$9 = "@firebase/performance";

	const name$8 = "@firebase/performance-compat";

	const name$7 = "@firebase/remote-config";

	const name$6 = "@firebase/remote-config-compat";

	const name$5 = "@firebase/storage";

	const name$4 = "@firebase/storage-compat";

	const name$3 = "@firebase/firestore";

	const name$2 = "@firebase/vertexai-preview";

	const name$1 = "@firebase/firestore-compat";

	const name = "firebase";
	const version = "10.13.1";

	/**
	 * @license
	 * Copyright 2019 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * The default app name
	 *
	 * @internal
	 */
	const DEFAULT_ENTRY_NAME = '[DEFAULT]';
	const PLATFORM_LOG_STRING = {
	    [name$p]: 'fire-core',
	    [name$o]: 'fire-core-compat',
	    [name$m]: 'fire-analytics',
	    [name$n]: 'fire-analytics-compat',
	    [name$k]: 'fire-app-check',
	    [name$l]: 'fire-app-check-compat',
	    [name$j]: 'fire-auth',
	    [name$i]: 'fire-auth-compat',
	    [name$h]: 'fire-rtdb',
	    [name$g]: 'fire-rtdb-compat',
	    [name$f]: 'fire-fn',
	    [name$e]: 'fire-fn-compat',
	    [name$d]: 'fire-iid',
	    [name$c]: 'fire-iid-compat',
	    [name$b]: 'fire-fcm',
	    [name$a]: 'fire-fcm-compat',
	    [name$9]: 'fire-perf',
	    [name$8]: 'fire-perf-compat',
	    [name$7]: 'fire-rc',
	    [name$6]: 'fire-rc-compat',
	    [name$5]: 'fire-gcs',
	    [name$4]: 'fire-gcs-compat',
	    [name$3]: 'fire-fst',
	    [name$1]: 'fire-fst-compat',
	    [name$2]: 'fire-vertex',
	    'fire-js': 'fire-js',
	    [name]: 'fire-js-all'
	};

	/**
	 * @license
	 * Copyright 2019 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * @internal
	 */
	const _apps = new Map();
	/**
	 * @internal
	 */
	const _serverApps = new Map();
	/**
	 * Registered components.
	 *
	 * @internal
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const _components = new Map();
	/**
	 * @param component - the component being added to this app's container
	 *
	 * @internal
	 */
	function _addComponent(app, component) {
	    try {
	        app.container.addComponent(component);
	    }
	    catch (e) {
	        logger.debug(`Component ${component.name} failed to register with FirebaseApp ${app.name}`, e);
	    }
	}
	/**
	 *
	 * @internal
	 */
	function _addOrOverwriteComponent(app, component) {
	    app.container.addOrOverwriteComponent(component);
	}
	/**
	 *
	 * @param component - the component to register
	 * @returns whether or not the component is registered successfully
	 *
	 * @internal
	 */
	function _registerComponent(component) {
	    const componentName = component.name;
	    if (_components.has(componentName)) {
	        logger.debug(`There were multiple attempts to register component ${componentName}.`);
	        return false;
	    }
	    _components.set(componentName, component);
	    // add the component to existing app instances
	    for (const app of _apps.values()) {
	        _addComponent(app, component);
	    }
	    for (const serverApp of _serverApps.values()) {
	        _addComponent(serverApp, component);
	    }
	    return true;
	}
	/**
	 *
	 * @param app - FirebaseApp instance
	 * @param name - service name
	 *
	 * @returns the provider for the service with the matching name
	 *
	 * @internal
	 */
	function _getProvider(app, name) {
	    const heartbeatController = app.container
	        .getProvider('heartbeat')
	        .getImmediate({ optional: true });
	    if (heartbeatController) {
	        void heartbeatController.triggerHeartbeat();
	    }
	    return app.container.getProvider(name);
	}
	/**
	 *
	 * @param app - FirebaseApp instance
	 * @param name - service name
	 * @param instanceIdentifier - service instance identifier in case the service supports multiple instances
	 *
	 * @internal
	 */
	function _removeServiceInstance(app, name, instanceIdentifier = DEFAULT_ENTRY_NAME) {
	    _getProvider(app, name).clearInstance(instanceIdentifier);
	}
	/**
	 *
	 * @param obj - an object of type FirebaseApp or FirebaseOptions.
	 *
	 * @returns true if the provide object is of type FirebaseApp.
	 *
	 * @internal
	 */
	function _isFirebaseApp(obj) {
	    return obj.options !== undefined;
	}
	/**
	 *
	 * @param obj - an object of type FirebaseApp.
	 *
	 * @returns true if the provided object is of type FirebaseServerAppImpl.
	 *
	 * @internal
	 */
	function _isFirebaseServerApp(obj) {
	    return obj.settings !== undefined;
	}
	/**
	 * Test only
	 *
	 * @internal
	 */
	function _clearComponents() {
	    _components.clear();
	}

	/**
	 * @license
	 * Copyright 2019 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	const ERRORS = {
	    ["no-app" /* AppError.NO_APP */]: "No Firebase App '{$appName}' has been created - " +
	        'call initializeApp() first',
	    ["bad-app-name" /* AppError.BAD_APP_NAME */]: "Illegal App name: '{$appName}'",
	    ["duplicate-app" /* AppError.DUPLICATE_APP */]: "Firebase App named '{$appName}' already exists with different options or config",
	    ["app-deleted" /* AppError.APP_DELETED */]: "Firebase App named '{$appName}' already deleted",
	    ["server-app-deleted" /* AppError.SERVER_APP_DELETED */]: 'Firebase Server App has been deleted',
	    ["no-options" /* AppError.NO_OPTIONS */]: 'Need to provide options, when not being deployed to hosting via source.',
	    ["invalid-app-argument" /* AppError.INVALID_APP_ARGUMENT */]: 'firebase.{$appName}() takes either no argument or a ' +
	        'Firebase App instance.',
	    ["invalid-log-argument" /* AppError.INVALID_LOG_ARGUMENT */]: 'First argument to `onLog` must be null or a function.',
	    ["idb-open" /* AppError.IDB_OPEN */]: 'Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.',
	    ["idb-get" /* AppError.IDB_GET */]: 'Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.',
	    ["idb-set" /* AppError.IDB_WRITE */]: 'Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.',
	    ["idb-delete" /* AppError.IDB_DELETE */]: 'Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.',
	    ["finalization-registry-not-supported" /* AppError.FINALIZATION_REGISTRY_NOT_SUPPORTED */]: 'FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.',
	    ["invalid-server-app-environment" /* AppError.INVALID_SERVER_APP_ENVIRONMENT */]: 'FirebaseServerApp is not for use in browser environments.'
	};
	const ERROR_FACTORY = new ErrorFactory('app', 'Firebase', ERRORS);

	/**
	 * @license
	 * Copyright 2019 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	class FirebaseAppImpl {
	    constructor(options, config, container) {
	        this._isDeleted = false;
	        this._options = Object.assign({}, options);
	        this._config = Object.assign({}, config);
	        this._name = config.name;
	        this._automaticDataCollectionEnabled =
	            config.automaticDataCollectionEnabled;
	        this._container = container;
	        this.container.addComponent(new Component('app', () => this, "PUBLIC" /* ComponentType.PUBLIC */));
	    }
	    get automaticDataCollectionEnabled() {
	        this.checkDestroyed();
	        return this._automaticDataCollectionEnabled;
	    }
	    set automaticDataCollectionEnabled(val) {
	        this.checkDestroyed();
	        this._automaticDataCollectionEnabled = val;
	    }
	    get name() {
	        this.checkDestroyed();
	        return this._name;
	    }
	    get options() {
	        this.checkDestroyed();
	        return this._options;
	    }
	    get config() {
	        this.checkDestroyed();
	        return this._config;
	    }
	    get container() {
	        return this._container;
	    }
	    get isDeleted() {
	        return this._isDeleted;
	    }
	    set isDeleted(val) {
	        this._isDeleted = val;
	    }
	    /**
	     * This function will throw an Error if the App has already been deleted -
	     * use before performing API actions on the App.
	     */
	    checkDestroyed() {
	        if (this.isDeleted) {
	            throw ERROR_FACTORY.create("app-deleted" /* AppError.APP_DELETED */, { appName: this._name });
	        }
	    }
	}

	/**
	 * @license
	 * Copyright 2023 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	class FirebaseServerAppImpl extends FirebaseAppImpl {
	    constructor(options, serverConfig, name, container) {
	        // Build configuration parameters for the FirebaseAppImpl base class.
	        const automaticDataCollectionEnabled = serverConfig.automaticDataCollectionEnabled !== undefined
	            ? serverConfig.automaticDataCollectionEnabled
	            : false;
	        // Create the FirebaseAppSettings object for the FirebaseAppImp constructor.
	        const config = {
	            name,
	            automaticDataCollectionEnabled
	        };
	        if (options.apiKey !== undefined) {
	            // Construct the parent FirebaseAppImp object.
	            super(options, config, container);
	        }
	        else {
	            const appImpl = options;
	            super(appImpl.options, config, container);
	        }
	        // Now construct the data for the FirebaseServerAppImpl.
	        this._serverConfig = Object.assign({ automaticDataCollectionEnabled }, serverConfig);
	        this._finalizationRegistry = null;
	        if (typeof FinalizationRegistry !== 'undefined') {
	            this._finalizationRegistry = new FinalizationRegistry(() => {
	                this.automaticCleanup();
	            });
	        }
	        this._refCount = 0;
	        this.incRefCount(this._serverConfig.releaseOnDeref);
	        // Do not retain a hard reference to the dref object, otherwise the FinalizationRegistry
	        // will never trigger.
	        this._serverConfig.releaseOnDeref = undefined;
	        serverConfig.releaseOnDeref = undefined;
	        registerVersion(name$p, version$1, 'serverapp');
	    }
	    toJSON() {
	        return undefined;
	    }
	    get refCount() {
	        return this._refCount;
	    }
	    // Increment the reference count of this server app. If an object is provided, register it
	    // with the finalization registry.
	    incRefCount(obj) {
	        if (this.isDeleted) {
	            return;
	        }
	        this._refCount++;
	        if (obj !== undefined && this._finalizationRegistry !== null) {
	            this._finalizationRegistry.register(obj, this);
	        }
	    }
	    // Decrement the reference count.
	    decRefCount() {
	        if (this.isDeleted) {
	            return 0;
	        }
	        return --this._refCount;
	    }
	    // Invoked by the FinalizationRegistry callback to note that this app should go through its
	    // reference counts and delete itself if no reference count remain. The coordinating logic that
	    // handles this is in deleteApp(...).
	    automaticCleanup() {
	        void deleteApp(this);
	    }
	    get settings() {
	        this.checkDestroyed();
	        return this._serverConfig;
	    }
	    /**
	     * This function will throw an Error if the App has already been deleted -
	     * use before performing API actions on the App.
	     */
	    checkDestroyed() {
	        if (this.isDeleted) {
	            throw ERROR_FACTORY.create("server-app-deleted" /* AppError.SERVER_APP_DELETED */);
	        }
	    }
	}

	/**
	 * @license
	 * Copyright 2019 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * The current SDK version.
	 *
	 * @public
	 */
	const SDK_VERSION = version;
	function initializeApp(_options, rawConfig = {}) {
	    let options = _options;
	    if (typeof rawConfig !== 'object') {
	        const name = rawConfig;
	        rawConfig = { name };
	    }
	    const config = Object.assign({ name: DEFAULT_ENTRY_NAME, automaticDataCollectionEnabled: false }, rawConfig);
	    const name = config.name;
	    if (typeof name !== 'string' || !name) {
	        throw ERROR_FACTORY.create("bad-app-name" /* AppError.BAD_APP_NAME */, {
	            appName: String(name)
	        });
	    }
	    options || (options = getDefaultAppConfig());
	    if (!options) {
	        throw ERROR_FACTORY.create("no-options" /* AppError.NO_OPTIONS */);
	    }
	    const existingApp = _apps.get(name);
	    if (existingApp) {
	        // return the existing app if options and config deep equal the ones in the existing app.
	        if (deepEqual(options, existingApp.options) &&
	            deepEqual(config, existingApp.config)) {
	            return existingApp;
	        }
	        else {
	            throw ERROR_FACTORY.create("duplicate-app" /* AppError.DUPLICATE_APP */, { appName: name });
	        }
	    }
	    const container = new ComponentContainer(name);
	    for (const component of _components.values()) {
	        container.addComponent(component);
	    }
	    const newApp = new FirebaseAppImpl(options, config, container);
	    _apps.set(name, newApp);
	    return newApp;
	}
	function initializeServerApp(_options, _serverAppConfig) {
	    if (isBrowser() && !isWebWorker()) {
	        // FirebaseServerApp isn't designed to be run in browsers.
	        throw ERROR_FACTORY.create("invalid-server-app-environment" /* AppError.INVALID_SERVER_APP_ENVIRONMENT */);
	    }
	    if (_serverAppConfig.automaticDataCollectionEnabled === undefined) {
	        _serverAppConfig.automaticDataCollectionEnabled = false;
	    }
	    let appOptions;
	    if (_isFirebaseApp(_options)) {
	        appOptions = _options.options;
	    }
	    else {
	        appOptions = _options;
	    }
	    // Build an app name based on a hash of the configuration options.
	    const nameObj = Object.assign(Object.assign({}, _serverAppConfig), appOptions);
	    // However, Do not mangle the name based on releaseOnDeref, since it will vary between the
	    // construction of FirebaseServerApp instances. For example, if the object is the request headers.
	    if (nameObj.releaseOnDeref !== undefined) {
	        delete nameObj.releaseOnDeref;
	    }
	    const hashCode = (s) => {
	        return [...s].reduce((hash, c) => (Math.imul(31, hash) + c.charCodeAt(0)) | 0, 0);
	    };
	    if (_serverAppConfig.releaseOnDeref !== undefined) {
	        if (typeof FinalizationRegistry === 'undefined') {
	            throw ERROR_FACTORY.create("finalization-registry-not-supported" /* AppError.FINALIZATION_REGISTRY_NOT_SUPPORTED */, {});
	        }
	    }
	    const nameString = '' + hashCode(JSON.stringify(nameObj));
	    const existingApp = _serverApps.get(nameString);
	    if (existingApp) {
	        existingApp.incRefCount(_serverAppConfig.releaseOnDeref);
	        return existingApp;
	    }
	    const container = new ComponentContainer(nameString);
	    for (const component of _components.values()) {
	        container.addComponent(component);
	    }
	    const newApp = new FirebaseServerAppImpl(appOptions, _serverAppConfig, nameString, container);
	    _serverApps.set(nameString, newApp);
	    return newApp;
	}
	/**
	 * Retrieves a {@link @firebase/app#FirebaseApp} instance.
	 *
	 * When called with no arguments, the default app is returned. When an app name
	 * is provided, the app corresponding to that name is returned.
	 *
	 * An exception is thrown if the app being retrieved has not yet been
	 * initialized.
	 *
	 * @example
	 * ```javascript
	 * // Return the default app
	 * const app = getApp();
	 * ```
	 *
	 * @example
	 * ```javascript
	 * // Return a named app
	 * const otherApp = getApp("otherApp");
	 * ```
	 *
	 * @param name - Optional name of the app to return. If no name is
	 *   provided, the default is `"[DEFAULT]"`.
	 *
	 * @returns The app corresponding to the provided app name.
	 *   If no app name is provided, the default app is returned.
	 *
	 * @public
	 */
	function getApp(name = DEFAULT_ENTRY_NAME) {
	    const app = _apps.get(name);
	    if (!app && name === DEFAULT_ENTRY_NAME && getDefaultAppConfig()) {
	        return initializeApp();
	    }
	    if (!app) {
	        throw ERROR_FACTORY.create("no-app" /* AppError.NO_APP */, { appName: name });
	    }
	    return app;
	}
	/**
	 * A (read-only) array of all initialized apps.
	 * @public
	 */
	function getApps() {
	    return Array.from(_apps.values());
	}
	/**
	 * Renders this app unusable and frees the resources of all associated
	 * services.
	 *
	 * @example
	 * ```javascript
	 * deleteApp(app)
	 *   .then(function() {
	 *     console.log("App deleted successfully");
	 *   })
	 *   .catch(function(error) {
	 *     console.log("Error deleting app:", error);
	 *   });
	 * ```
	 *
	 * @public
	 */
	async function deleteApp(app) {
	    let cleanupProviders = false;
	    const name = app.name;
	    if (_apps.has(name)) {
	        cleanupProviders = true;
	        _apps.delete(name);
	    }
	    else if (_serverApps.has(name)) {
	        const firebaseServerApp = app;
	        if (firebaseServerApp.decRefCount() <= 0) {
	            _serverApps.delete(name);
	            cleanupProviders = true;
	        }
	    }
	    if (cleanupProviders) {
	        await Promise.all(app.container
	            .getProviders()
	            .map(provider => provider.delete()));
	        app.isDeleted = true;
	    }
	}
	/**
	 * Registers a library's name and version for platform logging purposes.
	 * @param library - Name of 1p or 3p library (e.g. firestore, angularfire)
	 * @param version - Current version of that library.
	 * @param variant - Bundle variant, e.g., node, rn, etc.
	 *
	 * @public
	 */
	function registerVersion(libraryKeyOrName, version, variant) {
	    var _a;
	    // TODO: We can use this check to whitelist strings when/if we set up
	    // a good whitelist system.
	    let library = (_a = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a !== void 0 ? _a : libraryKeyOrName;
	    if (variant) {
	        library += `-${variant}`;
	    }
	    const libraryMismatch = library.match(/\s|\//);
	    const versionMismatch = version.match(/\s|\//);
	    if (libraryMismatch || versionMismatch) {
	        const warning = [
	            `Unable to register library "${library}" with version "${version}":`
	        ];
	        if (libraryMismatch) {
	            warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
	        }
	        if (libraryMismatch && versionMismatch) {
	            warning.push('and');
	        }
	        if (versionMismatch) {
	            warning.push(`version name "${version}" contains illegal characters (whitespace or "/")`);
	        }
	        logger.warn(warning.join(' '));
	        return;
	    }
	    _registerComponent(new Component(`${library}-version`, () => ({ library, version }), "VERSION" /* ComponentType.VERSION */));
	}
	/**
	 * Sets log handler for all Firebase SDKs.
	 * @param logCallback - An optional custom log handler that executes user code whenever
	 * the Firebase SDK makes a logging call.
	 *
	 * @public
	 */
	function onLog(logCallback, options) {
	    if (logCallback !== null && typeof logCallback !== 'function') {
	        throw ERROR_FACTORY.create("invalid-log-argument" /* AppError.INVALID_LOG_ARGUMENT */);
	    }
	    index_cjs.setUserLogHandler(logCallback, options);
	}
	/**
	 * Sets log level for all Firebase SDKs.
	 *
	 * All of the log types above the current log level are captured (i.e. if
	 * you set the log level to `info`, errors are logged, but `debug` and
	 * `verbose` logs are not).
	 *
	 * @public
	 */
	function setLogLevel(logLevel) {
	    index_cjs.setLogLevel(logLevel);
	}

	/**
	 * @license
	 * Copyright 2021 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	const DB_NAME = 'firebase-heartbeat-database';
	const DB_VERSION = 1;
	const STORE_NAME = 'firebase-heartbeat-store';
	let dbPromise = null;
	function getDbPromise() {
	    if (!dbPromise) {
	        dbPromise = openDB_1(DB_NAME, DB_VERSION, {
	            upgrade: (db, oldVersion) => {
	                // We don't use 'break' in this switch statement, the fall-through
	                // behavior is what we want, because if there are multiple versions between
	                // the old version and the current version, we want ALL the migrations
	                // that correspond to those versions to run, not only the last one.
	                // eslint-disable-next-line default-case
	                switch (oldVersion) {
	                    case 0:
	                        try {
	                            db.createObjectStore(STORE_NAME);
	                        }
	                        catch (e) {
	                            // Safari/iOS browsers throw occasional exceptions on
	                            // db.createObjectStore() that may be a bug. Avoid blocking
	                            // the rest of the app functionality.
	                            console.warn(e);
	                        }
	                }
	            }
	        }).catch(e => {
	            throw ERROR_FACTORY.create("idb-open" /* AppError.IDB_OPEN */, {
	                originalErrorMessage: e.message
	            });
	        });
	    }
	    return dbPromise;
	}
	async function readHeartbeatsFromIndexedDB(app) {
	    try {
	        const db = await getDbPromise();
	        const tx = db.transaction(STORE_NAME);
	        const result = await tx.objectStore(STORE_NAME).get(computeKey(app));
	        // We already have the value but tx.done can throw,
	        // so we need to await it here to catch errors
	        await tx.done;
	        return result;
	    }
	    catch (e) {
	        if (e instanceof FirebaseError) {
	            logger.warn(e.message);
	        }
	        else {
	            const idbGetError = ERROR_FACTORY.create("idb-get" /* AppError.IDB_GET */, {
	                originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
	            });
	            logger.warn(idbGetError.message);
	        }
	    }
	}
	async function writeHeartbeatsToIndexedDB(app, heartbeatObject) {
	    try {
	        const db = await getDbPromise();
	        const tx = db.transaction(STORE_NAME, 'readwrite');
	        const objectStore = tx.objectStore(STORE_NAME);
	        await objectStore.put(heartbeatObject, computeKey(app));
	        await tx.done;
	    }
	    catch (e) {
	        if (e instanceof FirebaseError) {
	            logger.warn(e.message);
	        }
	        else {
	            const idbGetError = ERROR_FACTORY.create("idb-set" /* AppError.IDB_WRITE */, {
	                originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
	            });
	            logger.warn(idbGetError.message);
	        }
	    }
	}
	function computeKey(app) {
	    return `${app.name}!${app.options.appId}`;
	}

	/**
	 * @license
	 * Copyright 2021 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	const MAX_HEADER_BYTES = 1024;
	// 30 days
	const STORED_HEARTBEAT_RETENTION_MAX_MILLIS = 30 * 24 * 60 * 60 * 1000;
	class HeartbeatServiceImpl {
	    constructor(container) {
	        this.container = container;
	        /**
	         * In-memory cache for heartbeats, used by getHeartbeatsHeader() to generate
	         * the header string.
	         * Stores one record per date. This will be consolidated into the standard
	         * format of one record per user agent string before being sent as a header.
	         * Populated from indexedDB when the controller is instantiated and should
	         * be kept in sync with indexedDB.
	         * Leave public for easier testing.
	         */
	        this._heartbeatsCache = null;
	        const app = this.container.getProvider('app').getImmediate();
	        this._storage = new HeartbeatStorageImpl(app);
	        this._heartbeatsCachePromise = this._storage.read().then(result => {
	            this._heartbeatsCache = result;
	            return result;
	        });
	    }
	    /**
	     * Called to report a heartbeat. The function will generate
	     * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
	     * to IndexedDB.
	     * Note that we only store one heartbeat per day. So if a heartbeat for today is
	     * already logged, subsequent calls to this function in the same day will be ignored.
	     */
	    async triggerHeartbeat() {
	        var _a, _b;
	        try {
	            const platformLogger = this.container
	                .getProvider('platform-logger')
	                .getImmediate();
	            // This is the "Firebase user agent" string from the platform logger
	            // service, not the browser user agent.
	            const agent = platformLogger.getPlatformInfoString();
	            const date = getUTCDateString();
	            if (((_a = this._heartbeatsCache) === null || _a === void 0 ? void 0 : _a.heartbeats) == null) {
	                this._heartbeatsCache = await this._heartbeatsCachePromise;
	                // If we failed to construct a heartbeats cache, then return immediately.
	                if (((_b = this._heartbeatsCache) === null || _b === void 0 ? void 0 : _b.heartbeats) == null) {
	                    return;
	                }
	            }
	            // Do not store a heartbeat if one is already stored for this day
	            // or if a header has already been sent today.
	            if (this._heartbeatsCache.lastSentHeartbeatDate === date ||
	                this._heartbeatsCache.heartbeats.some(singleDateHeartbeat => singleDateHeartbeat.date === date)) {
	                return;
	            }
	            else {
	                // There is no entry for this date. Create one.
	                this._heartbeatsCache.heartbeats.push({ date, agent });
	            }
	            // Remove entries older than 30 days.
	            this._heartbeatsCache.heartbeats =
	                this._heartbeatsCache.heartbeats.filter(singleDateHeartbeat => {
	                    const hbTimestamp = new Date(singleDateHeartbeat.date).valueOf();
	                    const now = Date.now();
	                    return now - hbTimestamp <= STORED_HEARTBEAT_RETENTION_MAX_MILLIS;
	                });
	            return this._storage.overwrite(this._heartbeatsCache);
	        }
	        catch (e) {
	            logger.warn(e);
	        }
	    }
	    /**
	     * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
	     * It also clears all heartbeats from memory as well as in IndexedDB.
	     *
	     * NOTE: Consuming product SDKs should not send the header if this method
	     * returns an empty string.
	     */
	    async getHeartbeatsHeader() {
	        var _a;
	        try {
	            if (this._heartbeatsCache === null) {
	                await this._heartbeatsCachePromise;
	            }
	            // If it's still null or the array is empty, there is no data to send.
	            if (((_a = this._heartbeatsCache) === null || _a === void 0 ? void 0 : _a.heartbeats) == null ||
	                this._heartbeatsCache.heartbeats.length === 0) {
	                return '';
	            }
	            const date = getUTCDateString();
	            // Extract as many heartbeats from the cache as will fit under the size limit.
	            const { heartbeatsToSend, unsentEntries } = extractHeartbeatsForHeader(this._heartbeatsCache.heartbeats);
	            const headerString = base64urlEncodeWithoutPadding(JSON.stringify({ version: 2, heartbeats: heartbeatsToSend }));
	            // Store last sent date to prevent another being logged/sent for the same day.
	            this._heartbeatsCache.lastSentHeartbeatDate = date;
	            if (unsentEntries.length > 0) {
	                // Store any unsent entries if they exist.
	                this._heartbeatsCache.heartbeats = unsentEntries;
	                // This seems more likely than emptying the array (below) to lead to some odd state
	                // since the cache isn't empty and this will be called again on the next request,
	                // and is probably safest if we await it.
	                await this._storage.overwrite(this._heartbeatsCache);
	            }
	            else {
	                this._heartbeatsCache.heartbeats = [];
	                // Do not wait for this, to reduce latency.
	                void this._storage.overwrite(this._heartbeatsCache);
	            }
	            return headerString;
	        }
	        catch (e) {
	            logger.warn(e);
	            return '';
	        }
	    }
	}
	function getUTCDateString() {
	    const today = new Date();
	    // Returns date format 'YYYY-MM-DD'
	    return today.toISOString().substring(0, 10);
	}
	function extractHeartbeatsForHeader(heartbeatsCache, maxSize = MAX_HEADER_BYTES) {
	    // Heartbeats grouped by user agent in the standard format to be sent in
	    // the header.
	    const heartbeatsToSend = [];
	    // Single date format heartbeats that are not sent.
	    let unsentEntries = heartbeatsCache.slice();
	    for (const singleDateHeartbeat of heartbeatsCache) {
	        // Look for an existing entry with the same user agent.
	        const heartbeatEntry = heartbeatsToSend.find(hb => hb.agent === singleDateHeartbeat.agent);
	        if (!heartbeatEntry) {
	            // If no entry for this user agent exists, create one.
	            heartbeatsToSend.push({
	                agent: singleDateHeartbeat.agent,
	                dates: [singleDateHeartbeat.date]
	            });
	            if (countBytes(heartbeatsToSend) > maxSize) {
	                // If the header would exceed max size, remove the added heartbeat
	                // entry and stop adding to the header.
	                heartbeatsToSend.pop();
	                break;
	            }
	        }
	        else {
	            heartbeatEntry.dates.push(singleDateHeartbeat.date);
	            // If the header would exceed max size, remove the added date
	            // and stop adding to the header.
	            if (countBytes(heartbeatsToSend) > maxSize) {
	                heartbeatEntry.dates.pop();
	                break;
	            }
	        }
	        // Pop unsent entry from queue. (Skipped if adding the entry exceeded
	        // quota and the loop breaks early.)
	        unsentEntries = unsentEntries.slice(1);
	    }
	    return {
	        heartbeatsToSend,
	        unsentEntries
	    };
	}
	class HeartbeatStorageImpl {
	    constructor(app) {
	        this.app = app;
	        this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
	    }
	    async runIndexedDBEnvironmentCheck() {
	        if (!isIndexedDBAvailable()) {
	            return false;
	        }
	        else {
	            return validateIndexedDBOpenable()
	                .then(() => true)
	                .catch(() => false);
	        }
	    }
	    /**
	     * Read all heartbeats.
	     */
	    async read() {
	        const canUseIndexedDB = await this._canUseIndexedDBPromise;
	        if (!canUseIndexedDB) {
	            return { heartbeats: [] };
	        }
	        else {
	            const idbHeartbeatObject = await readHeartbeatsFromIndexedDB(this.app);
	            if (idbHeartbeatObject === null || idbHeartbeatObject === void 0 ? void 0 : idbHeartbeatObject.heartbeats) {
	                return idbHeartbeatObject;
	            }
	            else {
	                return { heartbeats: [] };
	            }
	        }
	    }
	    // overwrite the storage with the provided heartbeats
	    async overwrite(heartbeatsObject) {
	        var _a;
	        const canUseIndexedDB = await this._canUseIndexedDBPromise;
	        if (!canUseIndexedDB) {
	            return;
	        }
	        else {
	            const existingHeartbeatsObject = await this.read();
	            return writeHeartbeatsToIndexedDB(this.app, {
	                lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
	                heartbeats: heartbeatsObject.heartbeats
	            });
	        }
	    }
	    // add heartbeats
	    async add(heartbeatsObject) {
	        var _a;
	        const canUseIndexedDB = await this._canUseIndexedDBPromise;
	        if (!canUseIndexedDB) {
	            return;
	        }
	        else {
	            const existingHeartbeatsObject = await this.read();
	            return writeHeartbeatsToIndexedDB(this.app, {
	                lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
	                heartbeats: [
	                    ...existingHeartbeatsObject.heartbeats,
	                    ...heartbeatsObject.heartbeats
	                ]
	            });
	        }
	    }
	}
	/**
	 * Calculate bytes of a HeartbeatsByUserAgent array after being wrapped
	 * in a platform logging header JSON object, stringified, and converted
	 * to base 64.
	 */
	function countBytes(heartbeatsCache) {
	    // base64 has a restricted set of characters, all of which should be 1 byte.
	    return base64urlEncodeWithoutPadding(
	    // heartbeatsCache wrapper properties
	    JSON.stringify({ version: 2, heartbeats: heartbeatsCache })).length;
	}

	/**
	 * @license
	 * Copyright 2019 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	function registerCoreComponents(variant) {
	    _registerComponent(new Component('platform-logger', container => new PlatformLoggerServiceImpl(container), "PRIVATE" /* ComponentType.PRIVATE */));
	    _registerComponent(new Component('heartbeat', container => new HeartbeatServiceImpl(container), "PRIVATE" /* ComponentType.PRIVATE */));
	    // Register `app` package.
	    registerVersion(name$p, version$1, variant);
	    // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
	    registerVersion(name$p, version$1, 'esm2017');
	    // Register platform SDK identifier (no version).
	    registerVersion('fire-js', '');
	}

	/**
	 * Firebase App
	 *
	 * @remarks This package coordinates the communication between the different Firebase components
	 * @packageDocumentation
	 */
	registerCoreComponents('');

	var index_esm2017 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		FirebaseError: FirebaseError,
		SDK_VERSION: SDK_VERSION,
		_DEFAULT_ENTRY_NAME: DEFAULT_ENTRY_NAME,
		_addComponent: _addComponent,
		_addOrOverwriteComponent: _addOrOverwriteComponent,
		_apps: _apps,
		_clearComponents: _clearComponents,
		_components: _components,
		_getProvider: _getProvider,
		_isFirebaseApp: _isFirebaseApp,
		_isFirebaseServerApp: _isFirebaseServerApp,
		_registerComponent: _registerComponent,
		_removeServiceInstance: _removeServiceInstance,
		_serverApps: _serverApps,
		deleteApp: deleteApp,
		getApp: getApp,
		getApps: getApps,
		initializeApp: initializeApp,
		initializeServerApp: initializeServerApp,
		onLog: onLog,
		registerVersion: registerVersion,
		setLogLevel: setLogLevel
	});

	var require$$0 = /*@__PURE__*/getAugmentedNamespace(index_esm2017);

	exports.browser$1 = browser$1$1;
	exports.commonjsGlobal = commonjsGlobal;
	exports.getAugmentedNamespace = getAugmentedNamespace;
	exports.global = global$1;
	exports.index_cjs = index_cjs;
	exports.index_esm2017 = index_esm2017$1;
	exports.index_esm2017$1 = index_esm2017$2;
	exports.nextTick = nextTick;
	exports.require$$0 = require$$0;

}));
