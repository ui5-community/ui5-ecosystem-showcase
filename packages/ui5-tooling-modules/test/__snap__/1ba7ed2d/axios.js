sap.ui.define(['exports'], (function (exports) { 'use strict';

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
  var platform$2 = 'browser';
  var browser$1 = true;
  var env = {};
  var argv = [];
  var version = ''; // empty string to avoid regexp issues
  var versions = {};
  var release = {};
  var config = {};

  function noop$2() {}

  var on = noop$2;
  var addListener = noop$2;
  var once = noop$2;
  var off = noop$2;
  var removeListener = noop$2;
  var removeAllListeners = noop$2;
  var emit = noop$2;

  function binding$1(name) {
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
    version: version,
    versions: versions,
    on: on,
    addListener: addListener,
    once: once,
    off: off,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners,
    emit: emit,
    binding: binding$1,
    cwd: cwd,
    chdir: chdir,
    umask: umask,
    hrtime: hrtime,
    platform: platform$2,
    release: release,
    config: config,
    uptime: uptime
  };

  function bind(fn, thisArg) {
    return function wrap() {
      return fn.apply(thisArg, arguments);
    };
  }

  // utils is a library of generic helper functions non-specific to axios

  const {toString: toString$1} = Object.prototype;
  const {getPrototypeOf} = Object;

  const kindOf = (cache => thing => {
      const str = toString$1.call(thing);
      return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
  })(Object.create(null));

  const kindOfTest = (type) => {
    type = type.toLowerCase();
    return (thing) => kindOf(thing) === type
  };

  const typeOfTest = type => thing => typeof thing === type;

  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   *
   * @returns {boolean} True if value is an Array, otherwise false
   */
  const {isArray: isArray$3} = Array;

  /**
   * Determine if a value is undefined
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  const isUndefined$1 = typeOfTest('undefined');

  /**
   * Determine if a value is a Buffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Buffer, otherwise false
   */
  function isBuffer$3(val) {
    return val !== null && !isUndefined$1(val) && val.constructor !== null && !isUndefined$1(val.constructor)
      && isFunction$3(val.constructor.isBuffer) && val.constructor.isBuffer(val);
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  const isArrayBuffer = kindOfTest('ArrayBuffer');


  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    let result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
      result = ArrayBuffer.isView(val);
    } else {
      result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a String, otherwise false
   */
  const isString$2 = typeOfTest('string');

  /**
   * Determine if a value is a Function
   *
   * @param {*} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  const isFunction$3 = typeOfTest('function');

  /**
   * Determine if a value is a Number
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Number, otherwise false
   */
  const isNumber$1 = typeOfTest('number');

  /**
   * Determine if a value is an Object
   *
   * @param {*} thing The value to test
   *
   * @returns {boolean} True if value is an Object, otherwise false
   */
  const isObject$1 = (thing) => thing !== null && typeof thing === 'object';

  /**
   * Determine if a value is a Boolean
   *
   * @param {*} thing The value to test
   * @returns {boolean} True if value is a Boolean, otherwise false
   */
  const isBoolean$1 = thing => thing === true || thing === false;

  /**
   * Determine if a value is a plain Object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a plain Object, otherwise false
   */
  const isPlainObject = (val) => {
    if (kindOf(val) !== 'object') {
      return false;
    }

    const prototype = getPrototypeOf(val);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
  };

  /**
   * Determine if a value is a Date
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Date, otherwise false
   */
  const isDate$1 = kindOfTest('Date');

  /**
   * Determine if a value is a File
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a File, otherwise false
   */
  const isFile = kindOfTest('File');

  /**
   * Determine if a value is a Blob
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  const isBlob = kindOfTest('Blob');

  /**
   * Determine if a value is a FileList
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a File, otherwise false
   */
  const isFileList = kindOfTest('FileList');

  /**
   * Determine if a value is a Stream
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  const isStream = (val) => isObject$1(val) && isFunction$3(val.pipe);

  /**
   * Determine if a value is a FormData
   *
   * @param {*} thing The value to test
   *
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  const isFormData = (thing) => {
    let kind;
    return thing && (
      (typeof FormData === 'function' && thing instanceof FormData) || (
        isFunction$3(thing.append) && (
          (kind = kindOf(thing)) === 'formdata' ||
          // detect form-data instance
          (kind === 'object' && isFunction$3(thing.toString) && thing.toString() === '[object FormData]')
        )
      )
    )
  };

  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  const isURLSearchParams = kindOfTest('URLSearchParams');

  const [isReadableStream, isRequest, isResponse, isHeaders] = ['ReadableStream', 'Request', 'Response', 'Headers'].map(kindOfTest);

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   *
   * @returns {String} The String freed of excess whitespace
   */
  const trim = (str) => str.trim ?
    str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   *
   * @param {Boolean} [allOwnKeys = false]
   * @returns {any}
   */
  function forEach$1(obj, fn, {allOwnKeys = false} = {}) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    let i;
    let l;

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (isArray$3(obj)) {
      // Iterate over array values
      for (i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
      const len = keys.length;
      let key;

      for (i = 0; i < len; i++) {
        key = keys[i];
        fn.call(null, obj[key], key, obj);
      }
    }
  }

  function findKey(obj, key) {
    key = key.toLowerCase();
    const keys = Object.keys(obj);
    let i = keys.length;
    let _key;
    while (i-- > 0) {
      _key = keys[i];
      if (key === _key.toLowerCase()) {
        return _key;
      }
    }
    return null;
  }

  const _global = (() => {
    /*eslint no-undef:0*/
    if (typeof globalThis !== "undefined") return globalThis;
    return typeof self !== "undefined" ? self : (typeof window !== 'undefined' ? window : global$1)
  })();

  const isContextDefined = (context) => !isUndefined$1(context) && context !== _global;

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   *
   * @returns {Object} Result of all merge properties
   */
  function merge(/* obj1, obj2, obj3, ... */) {
    const {caseless} = isContextDefined(this) && this || {};
    const result = {};
    const assignValue = (val, key) => {
      const targetKey = caseless && findKey(result, key) || key;
      if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
        result[targetKey] = merge(result[targetKey], val);
      } else if (isPlainObject(val)) {
        result[targetKey] = merge({}, val);
      } else if (isArray$3(val)) {
        result[targetKey] = val.slice();
      } else {
        result[targetKey] = val;
      }
    };

    for (let i = 0, l = arguments.length; i < l; i++) {
      arguments[i] && forEach$1(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   *
   * @param {Boolean} [allOwnKeys]
   * @returns {Object} The resulting value of object a
   */
  const extend = (a, b, thisArg, {allOwnKeys}= {}) => {
    forEach$1(b, (val, key) => {
      if (thisArg && isFunction$3(val)) {
        a[key] = bind(val, thisArg);
      } else {
        a[key] = val;
      }
    }, {allOwnKeys});
    return a;
  };

  /**
   * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
   *
   * @param {string} content with BOM
   *
   * @returns {string} content value without BOM
   */
  const stripBOM = (content) => {
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return content;
  };

  /**
   * Inherit the prototype methods from one constructor into another
   * @param {function} constructor
   * @param {function} superConstructor
   * @param {object} [props]
   * @param {object} [descriptors]
   *
   * @returns {void}
   */
  const inherits$1 = (constructor, superConstructor, props, descriptors) => {
    constructor.prototype = Object.create(superConstructor.prototype, descriptors);
    constructor.prototype.constructor = constructor;
    Object.defineProperty(constructor, 'super', {
      value: superConstructor.prototype
    });
    props && Object.assign(constructor.prototype, props);
  };

  /**
   * Resolve object with deep prototype chain to a flat object
   * @param {Object} sourceObj source object
   * @param {Object} [destObj]
   * @param {Function|Boolean} [filter]
   * @param {Function} [propFilter]
   *
   * @returns {Object}
   */
  const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
    let props;
    let i;
    let prop;
    const merged = {};

    destObj = destObj || {};
    // eslint-disable-next-line no-eq-null,eqeqeq
    if (sourceObj == null) return destObj;

    do {
      props = Object.getOwnPropertyNames(sourceObj);
      i = props.length;
      while (i-- > 0) {
        prop = props[i];
        if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
          destObj[prop] = sourceObj[prop];
          merged[prop] = true;
        }
      }
      sourceObj = filter !== false && getPrototypeOf(sourceObj);
    } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

    return destObj;
  };

  /**
   * Determines whether a string ends with the characters of a specified string
   *
   * @param {String} str
   * @param {String} searchString
   * @param {Number} [position= 0]
   *
   * @returns {boolean}
   */
  const endsWith = (str, searchString, position) => {
    str = String(str);
    if (position === undefined || position > str.length) {
      position = str.length;
    }
    position -= searchString.length;
    const lastIndex = str.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };


  /**
   * Returns new array from array like object or null if failed
   *
   * @param {*} [thing]
   *
   * @returns {?Array}
   */
  const toArray = (thing) => {
    if (!thing) return null;
    if (isArray$3(thing)) return thing;
    let i = thing.length;
    if (!isNumber$1(i)) return null;
    const arr = new Array(i);
    while (i-- > 0) {
      arr[i] = thing[i];
    }
    return arr;
  };

  /**
   * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
   * thing passed in is an instance of Uint8Array
   *
   * @param {TypedArray}
   *
   * @returns {Array}
   */
  // eslint-disable-next-line func-names
  const isTypedArray = (TypedArray => {
    // eslint-disable-next-line func-names
    return thing => {
      return TypedArray && thing instanceof TypedArray;
    };
  })(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

  /**
   * For each entry in the object, call the function with the key and value.
   *
   * @param {Object<any, any>} obj - The object to iterate over.
   * @param {Function} fn - The function to call for each entry.
   *
   * @returns {void}
   */
  const forEachEntry = (obj, fn) => {
    const generator = obj && obj[Symbol.iterator];

    const iterator = generator.call(obj);

    let result;

    while ((result = iterator.next()) && !result.done) {
      const pair = result.value;
      fn.call(obj, pair[0], pair[1]);
    }
  };

  /**
   * It takes a regular expression and a string, and returns an array of all the matches
   *
   * @param {string} regExp - The regular expression to match against.
   * @param {string} str - The string to search.
   *
   * @returns {Array<boolean>}
   */
  const matchAll = (regExp, str) => {
    let matches;
    const arr = [];

    while ((matches = regExp.exec(str)) !== null) {
      arr.push(matches);
    }

    return arr;
  };

  /* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
  const isHTMLForm = kindOfTest('HTMLFormElement');

  const toCamelCase = str => {
    return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,
      function replacer(m, p1, p2) {
        return p1.toUpperCase() + p2;
      }
    );
  };

  /* Creating a function that will check if an object has a property. */
  const hasOwnProperty$2 = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);

  /**
   * Determine if a value is a RegExp object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a RegExp object, otherwise false
   */
  const isRegExp$1 = kindOfTest('RegExp');

  const reduceDescriptors = (obj, reducer) => {
    const descriptors = Object.getOwnPropertyDescriptors(obj);
    const reducedDescriptors = {};

    forEach$1(descriptors, (descriptor, name) => {
      let ret;
      if ((ret = reducer(descriptor, name, obj)) !== false) {
        reducedDescriptors[name] = ret || descriptor;
      }
    });

    Object.defineProperties(obj, reducedDescriptors);
  };

  /**
   * Makes all methods read-only
   * @param {Object} obj
   */

  const freezeMethods = (obj) => {
    reduceDescriptors(obj, (descriptor, name) => {
      // skip restricted props in strict mode
      if (isFunction$3(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
        return false;
      }

      const value = obj[name];

      if (!isFunction$3(value)) return;

      descriptor.enumerable = false;

      if ('writable' in descriptor) {
        descriptor.writable = false;
        return;
      }

      if (!descriptor.set) {
        descriptor.set = () => {
          throw Error('Can not rewrite read-only method \'' + name + '\'');
        };
      }
    });
  };

  const toObjectSet = (arrayOrString, delimiter) => {
    const obj = {};

    const define = (arr) => {
      arr.forEach(value => {
        obj[value] = true;
      });
    };

    isArray$3(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

    return obj;
  };

  const noop$1 = () => {};

  const toFiniteNumber = (value, defaultValue) => {
    return value != null && Number.isFinite(value = +value) ? value : defaultValue;
  };

  const ALPHA = 'abcdefghijklmnopqrstuvwxyz';

  const DIGIT = '0123456789';

  const ALPHABET = {
    DIGIT,
    ALPHA,
    ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
  };

  const generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
    let str = '';
    const {length} = alphabet;
    while (size--) {
      str += alphabet[Math.random() * length|0];
    }

    return str;
  };

  /**
   * If the thing is a FormData object, return true, otherwise return false.
   *
   * @param {unknown} thing - The thing to check.
   *
   * @returns {boolean}
   */
  function isSpecCompliantForm(thing) {
    return !!(thing && isFunction$3(thing.append) && thing[Symbol.toStringTag] === 'FormData' && thing[Symbol.iterator]);
  }

  const toJSONObject = (obj) => {
    const stack = new Array(10);

    const visit = (source, i) => {

      if (isObject$1(source)) {
        if (stack.indexOf(source) >= 0) {
          return;
        }

        if(!('toJSON' in source)) {
          stack[i] = source;
          const target = isArray$3(source) ? [] : {};

          forEach$1(source, (value, key) => {
            const reducedValue = visit(value, i + 1);
            !isUndefined$1(reducedValue) && (target[key] = reducedValue);
          });

          stack[i] = undefined;

          return target;
        }
      }

      return source;
    };

    return visit(obj, 0);
  };

  const isAsyncFn = kindOfTest('AsyncFunction');

  const isThenable = (thing) =>
    thing && (isObject$1(thing) || isFunction$3(thing)) && isFunction$3(thing.then) && isFunction$3(thing.catch);

  // original code
  // https://github.com/DigitalBrainJS/AxiosPromise/blob/16deab13710ec09779922131f3fa5954320f83ab/lib/utils.js#L11-L34

  const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
    if (setImmediateSupported) {
      return setImmediate;
    }

    return postMessageSupported ? ((token, callbacks) => {
      _global.addEventListener("message", ({source, data}) => {
        if (source === _global && data === token) {
          callbacks.length && callbacks.shift()();
        }
      }, false);

      return (cb) => {
        callbacks.push(cb);
        _global.postMessage(token, "*");
      }
    })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
  })(
    typeof setImmediate === 'function',
    isFunction$3(_global.postMessage)
  );

  const asap = typeof queueMicrotask !== 'undefined' ?
    queueMicrotask.bind(_global) : ( typeof browser$1$1 !== 'undefined' && browser$1$1.nextTick || _setImmediate);

  // *********************

  var utils$1 = {
    isArray: isArray$3,
    isArrayBuffer,
    isBuffer: isBuffer$3,
    isFormData,
    isArrayBufferView,
    isString: isString$2,
    isNumber: isNumber$1,
    isBoolean: isBoolean$1,
    isObject: isObject$1,
    isPlainObject,
    isReadableStream,
    isRequest,
    isResponse,
    isHeaders,
    isUndefined: isUndefined$1,
    isDate: isDate$1,
    isFile,
    isBlob,
    isRegExp: isRegExp$1,
    isFunction: isFunction$3,
    isStream,
    isURLSearchParams,
    isTypedArray,
    isFileList,
    forEach: forEach$1,
    merge,
    extend,
    trim,
    stripBOM,
    inherits: inherits$1,
    toFlatObject,
    kindOf,
    kindOfTest,
    endsWith,
    toArray,
    forEachEntry,
    matchAll,
    isHTMLForm,
    hasOwnProperty: hasOwnProperty$2,
    hasOwnProp: hasOwnProperty$2, // an alias to avoid ESLint no-prototype-builtins detection
    reduceDescriptors,
    freezeMethods,
    toObjectSet,
    toCamelCase,
    noop: noop$1,
    toFiniteNumber,
    findKey,
    global: _global,
    isContextDefined,
    ALPHABET,
    generateString,
    isSpecCompliantForm,
    toJSONObject,
    isAsyncFn,
    isThenable,
    setImmediate: _setImmediate,
    asap
  };

  var lookup = [];
  var revLookup = [];
  var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
  var inited = false;
  function init() {
  	inited = true;
  	var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  	for (var i = 0, len = code.length; i < len; ++i) {
  		lookup[i] = code[i];
  		revLookup[code.charCodeAt(i)] = i;
  	}

  	revLookup["-".charCodeAt(0)] = 62;
  	revLookup["_".charCodeAt(0)] = 63;
  }

  function toByteArray(b64) {
  	if (!inited) {
  		init();
  	}
  	var i, j, l, tmp, placeHolders, arr;
  	var len = b64.length;

  	if (len % 4 > 0) {
  		throw new Error("Invalid string. Length must be a multiple of 4");
  	}

  	// the number of equal signs (place holders)
  	// if there are two placeholders, than the two characters before it
  	// represent one byte
  	// if there is only one, then the three characters before it represent 2 bytes
  	// this is just a cheap hack to not do indexOf twice
  	placeHolders = b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;

  	// base64 is 4/3 + up to two characters of the original data
  	arr = new Arr((len * 3) / 4 - placeHolders);

  	// if there are placeholders, only get up to the last complete 4 chars
  	l = placeHolders > 0 ? len - 4 : len;

  	var L = 0;

  	for (i = 0, j = 0; i < l; i += 4, j += 3) {
  		tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
  		arr[L++] = (tmp >> 16) & 0xff;
  		arr[L++] = (tmp >> 8) & 0xff;
  		arr[L++] = tmp & 0xff;
  	}

  	if (placeHolders === 2) {
  		tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
  		arr[L++] = tmp & 0xff;
  	} else if (placeHolders === 1) {
  		tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
  		arr[L++] = (tmp >> 8) & 0xff;
  		arr[L++] = tmp & 0xff;
  	}

  	return arr;
  }

  function tripletToBase64(num) {
  	return lookup[(num >> 18) & 0x3f] + lookup[(num >> 12) & 0x3f] + lookup[(num >> 6) & 0x3f] + lookup[num & 0x3f];
  }

  function encodeChunk(uint8, start, end) {
  	var tmp;
  	var output = [];
  	for (var i = start; i < end; i += 3) {
  		tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
  		output.push(tripletToBase64(tmp));
  	}
  	return output.join("");
  }

  function fromByteArray(uint8) {
  	if (!inited) {
  		init();
  	}
  	var tmp;
  	var len = uint8.length;
  	var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  	var output = "";
  	var parts = [];
  	var maxChunkLength = 16383; // must be multiple of 3

  	// go through the array every three bytes, we'll deal with trailing stuff later
  	for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
  		parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
  	}

  	// pad the end with zeros, but make sure to not forget the extra bytes
  	if (extraBytes === 1) {
  		tmp = uint8[len - 1];
  		output += lookup[tmp >> 2];
  		output += lookup[(tmp << 4) & 0x3f];
  		output += "==";
  	} else if (extraBytes === 2) {
  		tmp = (uint8[len - 2] << 8) + uint8[len - 1];
  		output += lookup[tmp >> 10];
  		output += lookup[(tmp >> 4) & 0x3f];
  		output += lookup[(tmp << 2) & 0x3f];
  		output += "=";
  	}

  	parts.push(output);

  	return parts.join("");
  }

  function read(buffer, offset, isLE, mLen, nBytes) {
  	var e, m;
  	var eLen = nBytes * 8 - mLen - 1;
  	var eMax = (1 << eLen) - 1;
  	var eBias = eMax >> 1;
  	var nBits = -7;
  	var i = isLE ? nBytes - 1 : 0;
  	var d = isLE ? -1 : 1;
  	var s = buffer[offset + i];

  	i += d;

  	e = s & ((1 << -nBits) - 1);
  	s >>= -nBits;
  	nBits += eLen;
  	for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  	m = e & ((1 << -nBits) - 1);
  	e >>= -nBits;
  	nBits += mLen;
  	for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  	if (e === 0) {
  		e = 1 - eBias;
  	} else if (e === eMax) {
  		return m ? NaN : (s ? -1 : 1) * Infinity;
  	} else {
  		m = m + Math.pow(2, mLen);
  		e = e - eBias;
  	}
  	return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
  }

  function write(buffer, value, offset, isLE, mLen, nBytes) {
  	var e, m, c;
  	var eLen = nBytes * 8 - mLen - 1;
  	var eMax = (1 << eLen) - 1;
  	var eBias = eMax >> 1;
  	var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  	var i = isLE ? 0 : nBytes - 1;
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

  var isArray$2 =
  	Array.isArray ||
  	function (arr) {
  		return toString.call(arr) == "[object Array]";
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
  Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined ? global$1.TYPED_ARRAY_SUPPORT : true;

  /*
   * Export kMaxLength after typed array support is determined.
   */
  kMaxLength();

  function kMaxLength() {
  	return Buffer.TYPED_ARRAY_SUPPORT ? 0x7fffffff : 0x3fffffff;
  }

  function createBuffer(that, length) {
  	if (kMaxLength() < length) {
  		throw new RangeError("Invalid typed array length");
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

  	return that;
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

  function Buffer(arg, encodingOrOffset, length) {
  	if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
  		return new Buffer(arg, encodingOrOffset, length);
  	}

  	// Common case.
  	if (typeof arg === "number") {
  		if (typeof encodingOrOffset === "string") {
  			throw new Error("If encoding is specified then the first argument must be a string");
  		}
  		return allocUnsafe(this, arg);
  	}
  	return from(this, arg, encodingOrOffset, length);
  }

  Buffer.poolSize = 8192; // not used by this implementation

  // TODO: Legacy, not needed anymore. Remove in next major version.
  Buffer._augment = function (arr) {
  	arr.__proto__ = Buffer.prototype;
  	return arr;
  };

  function from(that, value, encodingOrOffset, length) {
  	if (typeof value === "number") {
  		throw new TypeError('"value" argument must not be a number');
  	}

  	if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
  		return fromArrayBuffer(that, value, encodingOrOffset, length);
  	}

  	if (typeof value === "string") {
  		return fromString(that, value, encodingOrOffset);
  	}

  	return fromObject(that, value);
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
  	return from(null, value, encodingOrOffset, length);
  };

  if (Buffer.TYPED_ARRAY_SUPPORT) {
  	Buffer.prototype.__proto__ = Uint8Array.prototype;
  	Buffer.__proto__ = Uint8Array;
  	if (typeof Symbol !== "undefined" && Symbol.species && Buffer[Symbol.species] === Buffer);
  }

  function assertSize(size) {
  	if (typeof size !== "number") {
  		throw new TypeError('"size" argument must be a number');
  	} else if (size < 0) {
  		throw new RangeError('"size" argument must not be negative');
  	}
  }

  function alloc(that, size, fill, encoding) {
  	assertSize(size);
  	if (size <= 0) {
  		return createBuffer(that, size);
  	}
  	if (fill !== undefined) {
  		// Only pay attention to encoding if it's a string. This
  		// prevents accidentally sending in a number that would
  		// be interpretted as a start offset.
  		return typeof encoding === "string" ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
  	}
  	return createBuffer(that, size);
  }

  /**
   * Creates a new filled Buffer instance.
   * alloc(size[, fill[, encoding]])
   **/
  Buffer.alloc = function (size, fill, encoding) {
  	return alloc(null, size, fill, encoding);
  };

  function allocUnsafe(that, size) {
  	assertSize(size);
  	that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  	if (!Buffer.TYPED_ARRAY_SUPPORT) {
  		for (var i = 0; i < size; ++i) {
  			that[i] = 0;
  		}
  	}
  	return that;
  }

  /**
   * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
   * */
  Buffer.allocUnsafe = function (size) {
  	return allocUnsafe(null, size);
  };
  /**
   * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
   */
  Buffer.allocUnsafeSlow = function (size) {
  	return allocUnsafe(null, size);
  };

  function fromString(that, string, encoding) {
  	if (typeof encoding !== "string" || encoding === "") {
  		encoding = "utf8";
  	}

  	if (!Buffer.isEncoding(encoding)) {
  		throw new TypeError('"encoding" must be a valid string encoding');
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

  	return that;
  }

  function fromArrayLike(that, array) {
  	var length = array.length < 0 ? 0 : checked(array.length) | 0;
  	that = createBuffer(that, length);
  	for (var i = 0; i < length; i += 1) {
  		that[i] = array[i] & 255;
  	}
  	return that;
  }

  function fromArrayBuffer(that, array, byteOffset, length) {
  	array.byteLength; // this throws if `array` is not a valid ArrayBuffer

  	if (byteOffset < 0 || array.byteLength < byteOffset) {
  		throw new RangeError("'offset' is out of bounds");
  	}

  	if (array.byteLength < byteOffset + (length || 0)) {
  		throw new RangeError("'length' is out of bounds");
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
  	return that;
  }

  function fromObject(that, obj) {
  	if (internalIsBuffer(obj)) {
  		var len = checked(obj.length) | 0;
  		that = createBuffer(that, len);

  		if (that.length === 0) {
  			return that;
  		}

  		obj.copy(that, 0, 0, len);
  		return that;
  	}

  	if (obj) {
  		if ((typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer) || "length" in obj) {
  			if (typeof obj.length !== "number" || isnan(obj.length)) {
  				return createBuffer(that, 0);
  			}
  			return fromArrayLike(that, obj);
  		}

  		if (obj.type === "Buffer" && isArray$2(obj.data)) {
  			return fromArrayLike(that, obj.data);
  		}
  	}

  	throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
  }

  function checked(length) {
  	// Note: cannot use `length < kMaxLength()` here because that fails when
  	// length is NaN (which is otherwise coerced to zero.)
  	if (length >= kMaxLength()) {
  		throw new RangeError("Attempt to allocate Buffer larger than maximum " + "size: 0x" + kMaxLength().toString(16) + " bytes");
  	}
  	return length | 0;
  }
  Buffer.isBuffer = isBuffer$2;
  function internalIsBuffer(b) {
  	return !!(b != null && b._isBuffer);
  }

  Buffer.compare = function compare(a, b) {
  	if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
  		throw new TypeError("Arguments must be Buffers");
  	}

  	if (a === b) return 0;

  	var x = a.length;
  	var y = b.length;

  	for (var i = 0, len = Math.min(x, y); i < len; ++i) {
  		if (a[i] !== b[i]) {
  			x = a[i];
  			y = b[i];
  			break;
  		}
  	}

  	if (x < y) return -1;
  	if (y < x) return 1;
  	return 0;
  };

  Buffer.isEncoding = function isEncoding(encoding) {
  	switch (String(encoding).toLowerCase()) {
  		case "hex":
  		case "utf8":
  		case "utf-8":
  		case "ascii":
  		case "latin1":
  		case "binary":
  		case "base64":
  		case "ucs2":
  		case "ucs-2":
  		case "utf16le":
  		case "utf-16le":
  			return true;
  		default:
  			return false;
  	}
  };

  Buffer.concat = function concat(list, length) {
  	if (!isArray$2(list)) {
  		throw new TypeError('"list" argument must be an Array of Buffers');
  	}

  	if (list.length === 0) {
  		return Buffer.alloc(0);
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
  			throw new TypeError('"list" argument must be an Array of Buffers');
  		}
  		buf.copy(buffer, pos);
  		pos += buf.length;
  	}
  	return buffer;
  };

  function byteLength(string, encoding) {
  	if (internalIsBuffer(string)) {
  		return string.length;
  	}
  	if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
  		return string.byteLength;
  	}
  	if (typeof string !== "string") {
  		string = "" + string;
  	}

  	var len = string.length;
  	if (len === 0) return 0;

  	// Use a for loop to avoid recursion
  	var loweredCase = false;
  	for (;;) {
  		switch (encoding) {
  			case "ascii":
  			case "latin1":
  			case "binary":
  				return len;
  			case "utf8":
  			case "utf-8":
  			case undefined:
  				return utf8ToBytes(string).length;
  			case "ucs2":
  			case "ucs-2":
  			case "utf16le":
  			case "utf-16le":
  				return len * 2;
  			case "hex":
  				return len >>> 1;
  			case "base64":
  				return base64ToBytes(string).length;
  			default:
  				if (loweredCase) return utf8ToBytes(string).length; // assume utf8
  				encoding = ("" + encoding).toLowerCase();
  				loweredCase = true;
  		}
  	}
  }
  Buffer.byteLength = byteLength;

  function slowToString(encoding, start, end) {
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
  		return "";
  	}

  	if (end === undefined || end > this.length) {
  		end = this.length;
  	}

  	if (end <= 0) {
  		return "";
  	}

  	// Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  	end >>>= 0;
  	start >>>= 0;

  	if (end <= start) {
  		return "";
  	}

  	if (!encoding) encoding = "utf8";

  	while (true) {
  		switch (encoding) {
  			case "hex":
  				return hexSlice(this, start, end);

  			case "utf8":
  			case "utf-8":
  				return utf8Slice(this, start, end);

  			case "ascii":
  				return asciiSlice(this, start, end);

  			case "latin1":
  			case "binary":
  				return latin1Slice(this, start, end);

  			case "base64":
  				return base64Slice(this, start, end);

  			case "ucs2":
  			case "ucs-2":
  			case "utf16le":
  			case "utf-16le":
  				return utf16leSlice(this, start, end);

  			default:
  				if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
  				encoding = (encoding + "").toLowerCase();
  				loweredCase = true;
  		}
  	}
  }

  // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
  // Buffer instances.
  Buffer.prototype._isBuffer = true;

  function swap(b, n, m) {
  	var i = b[n];
  	b[n] = b[m];
  	b[m] = i;
  }

  Buffer.prototype.swap16 = function swap16() {
  	var len = this.length;
  	if (len % 2 !== 0) {
  		throw new RangeError("Buffer size must be a multiple of 16-bits");
  	}
  	for (var i = 0; i < len; i += 2) {
  		swap(this, i, i + 1);
  	}
  	return this;
  };

  Buffer.prototype.swap32 = function swap32() {
  	var len = this.length;
  	if (len % 4 !== 0) {
  		throw new RangeError("Buffer size must be a multiple of 32-bits");
  	}
  	for (var i = 0; i < len; i += 4) {
  		swap(this, i, i + 3);
  		swap(this, i + 1, i + 2);
  	}
  	return this;
  };

  Buffer.prototype.swap64 = function swap64() {
  	var len = this.length;
  	if (len % 8 !== 0) {
  		throw new RangeError("Buffer size must be a multiple of 64-bits");
  	}
  	for (var i = 0; i < len; i += 8) {
  		swap(this, i, i + 7);
  		swap(this, i + 1, i + 6);
  		swap(this, i + 2, i + 5);
  		swap(this, i + 3, i + 4);
  	}
  	return this;
  };

  Buffer.prototype.toString = function toString() {
  	var length = this.length | 0;
  	if (length === 0) return "";
  	if (arguments.length === 0) return utf8Slice(this, 0, length);
  	return slowToString.apply(this, arguments);
  };

  Buffer.prototype.equals = function equals(b) {
  	if (!internalIsBuffer(b)) throw new TypeError("Argument must be a Buffer");
  	if (this === b) return true;
  	return Buffer.compare(this, b) === 0;
  };

  Buffer.prototype.inspect = function inspect() {
  	var str = "";
  	var max = INSPECT_MAX_BYTES;
  	if (this.length > 0) {
  		str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
  		if (this.length > max) str += " ... ";
  	}
  	return "<Buffer " + str + ">";
  };

  Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
  	if (!internalIsBuffer(target)) {
  		throw new TypeError("Argument must be a Buffer");
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
  		throw new RangeError("out of range index");
  	}

  	if (thisStart >= thisEnd && start >= end) {
  		return 0;
  	}
  	if (thisStart >= thisEnd) {
  		return -1;
  	}
  	if (start >= end) {
  		return 1;
  	}

  	start >>>= 0;
  	end >>>= 0;
  	thisStart >>>= 0;
  	thisEnd >>>= 0;

  	if (this === target) return 0;

  	var x = thisEnd - thisStart;
  	var y = end - start;
  	var len = Math.min(x, y);

  	var thisCopy = this.slice(thisStart, thisEnd);
  	var targetCopy = target.slice(start, end);

  	for (var i = 0; i < len; ++i) {
  		if (thisCopy[i] !== targetCopy[i]) {
  			x = thisCopy[i];
  			y = targetCopy[i];
  			break;
  		}
  	}

  	if (x < y) return -1;
  	if (y < x) return 1;
  	return 0;
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
  function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
  	// Empty buffer means no match
  	if (buffer.length === 0) return -1;

  	// Normalize byteOffset
  	if (typeof byteOffset === "string") {
  		encoding = byteOffset;
  		byteOffset = 0;
  	} else if (byteOffset > 0x7fffffff) {
  		byteOffset = 0x7fffffff;
  	} else if (byteOffset < -0x80000000) {
  		byteOffset = -0x80000000;
  	}
  	byteOffset = +byteOffset; // Coerce to Number.
  	if (isNaN(byteOffset)) {
  		// byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
  		byteOffset = dir ? 0 : buffer.length - 1;
  	}

  	// Normalize byteOffset: negative offsets start from the end of the buffer
  	if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  	if (byteOffset >= buffer.length) {
  		if (dir) return -1;
  		else byteOffset = buffer.length - 1;
  	} else if (byteOffset < 0) {
  		if (dir) byteOffset = 0;
  		else return -1;
  	}

  	// Normalize val
  	if (typeof val === "string") {
  		val = Buffer.from(val, encoding);
  	}

  	// Finally, search either indexOf (if dir is true) or lastIndexOf
  	if (internalIsBuffer(val)) {
  		// Special case: looking for empty string/buffer always fails
  		if (val.length === 0) {
  			return -1;
  		}
  		return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  	} else if (typeof val === "number") {
  		val = val & 0xff; // Search for a byte value [0-255]
  		if (Buffer.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === "function") {
  			if (dir) {
  				return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
  			} else {
  				return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
  			}
  		}
  		return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  	}

  	throw new TypeError("val must be string, number or Buffer");
  }

  function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
  	var indexSize = 1;
  	var arrLength = arr.length;
  	var valLength = val.length;

  	if (encoding !== undefined) {
  		encoding = String(encoding).toLowerCase();
  		if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
  			if (arr.length < 2 || val.length < 2) {
  				return -1;
  			}
  			indexSize = 2;
  			arrLength /= 2;
  			valLength /= 2;
  			byteOffset /= 2;
  		}
  	}

  	function read(buf, i) {
  		if (indexSize === 1) {
  			return buf[i];
  		} else {
  			return buf.readUInt16BE(i * indexSize);
  		}
  	}

  	var i;
  	if (dir) {
  		var foundIndex = -1;
  		for (i = byteOffset; i < arrLength; i++) {
  			if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
  				if (foundIndex === -1) foundIndex = i;
  				if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
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
  					break;
  				}
  			}
  			if (found) return i;
  		}
  	}

  	return -1;
  }

  Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
  	return this.indexOf(val, byteOffset, encoding) !== -1;
  };

  Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
  	return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
  };

  Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
  	return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
  };

  function hexWrite(buf, string, offset, length) {
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
  	if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");

  	if (length > strLen / 2) {
  		length = strLen / 2;
  	}
  	for (var i = 0; i < length; ++i) {
  		var parsed = parseInt(string.substr(i * 2, 2), 16);
  		if (isNaN(parsed)) return i;
  		buf[offset + i] = parsed;
  	}
  	return i;
  }

  function utf8Write(buf, string, offset, length) {
  	return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
  }

  function asciiWrite(buf, string, offset, length) {
  	return blitBuffer(asciiToBytes(string), buf, offset, length);
  }

  function latin1Write(buf, string, offset, length) {
  	return asciiWrite(buf, string, offset, length);
  }

  function base64Write(buf, string, offset, length) {
  	return blitBuffer(base64ToBytes(string), buf, offset, length);
  }

  function ucs2Write(buf, string, offset, length) {
  	return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
  }

  Buffer.prototype.write = function write(string, offset, length, encoding) {
  	// Buffer#write(string)
  	if (offset === undefined) {
  		encoding = "utf8";
  		length = this.length;
  		offset = 0;
  		// Buffer#write(string, encoding)
  	} else if (length === undefined && typeof offset === "string") {
  		encoding = offset;
  		length = this.length;
  		offset = 0;
  		// Buffer#write(string, offset[, length][, encoding])
  	} else if (isFinite(offset)) {
  		offset = offset | 0;
  		if (isFinite(length)) {
  			length = length | 0;
  			if (encoding === undefined) encoding = "utf8";
  		} else {
  			encoding = length;
  			length = undefined;
  		}
  		// legacy write(string, encoding, offset, length) - remove in v0.13
  	} else {
  		throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
  	}

  	var remaining = this.length - offset;
  	if (length === undefined || length > remaining) length = remaining;

  	if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
  		throw new RangeError("Attempt to write outside buffer bounds");
  	}

  	if (!encoding) encoding = "utf8";

  	var loweredCase = false;
  	for (;;) {
  		switch (encoding) {
  			case "hex":
  				return hexWrite(this, string, offset, length);

  			case "utf8":
  			case "utf-8":
  				return utf8Write(this, string, offset, length);

  			case "ascii":
  				return asciiWrite(this, string, offset, length);

  			case "latin1":
  			case "binary":
  				return latin1Write(this, string, offset, length);

  			case "base64":
  				// Warning: maxLength not taken into account in base64Write
  				return base64Write(this, string, offset, length);

  			case "ucs2":
  			case "ucs-2":
  			case "utf16le":
  			case "utf-16le":
  				return ucs2Write(this, string, offset, length);

  			default:
  				if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
  				encoding = ("" + encoding).toLowerCase();
  				loweredCase = true;
  		}
  	}
  };

  Buffer.prototype.toJSON = function toJSON() {
  	return {
  		type: "Buffer",
  		data: Array.prototype.slice.call(this._arr || this, 0),
  	};
  };

  function base64Slice(buf, start, end) {
  	if (start === 0 && end === buf.length) {
  		return fromByteArray(buf);
  	} else {
  		return fromByteArray(buf.slice(start, end));
  	}
  }

  function utf8Slice(buf, start, end) {
  	end = Math.min(buf.length, end);
  	var res = [];

  	var i = start;
  	while (i < end) {
  		var firstByte = buf[i];
  		var codePoint = null;
  		var bytesPerSequence = firstByte > 0xef ? 4 : firstByte > 0xdf ? 3 : firstByte > 0xbf ? 2 : 1;

  		if (i + bytesPerSequence <= end) {
  			var secondByte, thirdByte, fourthByte, tempCodePoint;

  			switch (bytesPerSequence) {
  				case 1:
  					if (firstByte < 0x80) {
  						codePoint = firstByte;
  					}
  					break;
  				case 2:
  					secondByte = buf[i + 1];
  					if ((secondByte & 0xc0) === 0x80) {
  						tempCodePoint = ((firstByte & 0x1f) << 0x6) | (secondByte & 0x3f);
  						if (tempCodePoint > 0x7f) {
  							codePoint = tempCodePoint;
  						}
  					}
  					break;
  				case 3:
  					secondByte = buf[i + 1];
  					thirdByte = buf[i + 2];
  					if ((secondByte & 0xc0) === 0x80 && (thirdByte & 0xc0) === 0x80) {
  						tempCodePoint = ((firstByte & 0xf) << 0xc) | ((secondByte & 0x3f) << 0x6) | (thirdByte & 0x3f);
  						if (tempCodePoint > 0x7ff && (tempCodePoint < 0xd800 || tempCodePoint > 0xdfff)) {
  							codePoint = tempCodePoint;
  						}
  					}
  					break;
  				case 4:
  					secondByte = buf[i + 1];
  					thirdByte = buf[i + 2];
  					fourthByte = buf[i + 3];
  					if ((secondByte & 0xc0) === 0x80 && (thirdByte & 0xc0) === 0x80 && (fourthByte & 0xc0) === 0x80) {
  						tempCodePoint = ((firstByte & 0xf) << 0x12) | ((secondByte & 0x3f) << 0xc) | ((thirdByte & 0x3f) << 0x6) | (fourthByte & 0x3f);
  						if (tempCodePoint > 0xffff && tempCodePoint < 0x110000) {
  							codePoint = tempCodePoint;
  						}
  					}
  			}
  		}

  		if (codePoint === null) {
  			// we did not generate a valid codePoint so insert a
  			// replacement char (U+FFFD) and advance only 1 byte
  			codePoint = 0xfffd;
  			bytesPerSequence = 1;
  		} else if (codePoint > 0xffff) {
  			// encode to utf16 (surrogate pair dance)
  			codePoint -= 0x10000;
  			res.push(((codePoint >>> 10) & 0x3ff) | 0xd800);
  			codePoint = 0xdc00 | (codePoint & 0x3ff);
  		}

  		res.push(codePoint);
  		i += bytesPerSequence;
  	}

  	return decodeCodePointsArray(res);
  }

  // Based on http://stackoverflow.com/a/22747272/680742, the browser with
  // the lowest limit is Chrome, with 0x10000 args.
  // We go 1 magnitude less, for safety
  var MAX_ARGUMENTS_LENGTH = 0x1000;

  function decodeCodePointsArray(codePoints) {
  	var len = codePoints.length;
  	if (len <= MAX_ARGUMENTS_LENGTH) {
  		return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
  	}

  	// Decode in chunks to avoid "call stack size exceeded".
  	var res = "";
  	var i = 0;
  	while (i < len) {
  		res += String.fromCharCode.apply(String, codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH)));
  	}
  	return res;
  }

  function asciiSlice(buf, start, end) {
  	var ret = "";
  	end = Math.min(buf.length, end);

  	for (var i = start; i < end; ++i) {
  		ret += String.fromCharCode(buf[i] & 0x7f);
  	}
  	return ret;
  }

  function latin1Slice(buf, start, end) {
  	var ret = "";
  	end = Math.min(buf.length, end);

  	for (var i = start; i < end; ++i) {
  		ret += String.fromCharCode(buf[i]);
  	}
  	return ret;
  }

  function hexSlice(buf, start, end) {
  	var len = buf.length;

  	if (!start || start < 0) start = 0;
  	if (!end || end < 0 || end > len) end = len;

  	var out = "";
  	for (var i = start; i < end; ++i) {
  		out += toHex(buf[i]);
  	}
  	return out;
  }

  function utf16leSlice(buf, start, end) {
  	var bytes = buf.slice(start, end);
  	var res = "";
  	for (var i = 0; i < bytes.length; i += 2) {
  		res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  	}
  	return res;
  }

  Buffer.prototype.slice = function slice(start, end) {
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

  	return newBuf;
  };

  /*
   * Need to make sure that buffer isn't trying to write out of bounds.
   */
  function checkOffset(offset, ext, length) {
  	if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
  	if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
  }

  Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
  	offset = offset | 0;
  	byteLength = byteLength | 0;
  	if (!noAssert) checkOffset(offset, byteLength, this.length);

  	var val = this[offset];
  	var mul = 1;
  	var i = 0;
  	while (++i < byteLength && (mul *= 0x100)) {
  		val += this[offset + i] * mul;
  	}

  	return val;
  };

  Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
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

  	return val;
  };

  Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
  	if (!noAssert) checkOffset(offset, 1, this.length);
  	return this[offset];
  };

  Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
  	if (!noAssert) checkOffset(offset, 2, this.length);
  	return this[offset] | (this[offset + 1] << 8);
  };

  Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
  	if (!noAssert) checkOffset(offset, 2, this.length);
  	return (this[offset] << 8) | this[offset + 1];
  };

  Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
  	if (!noAssert) checkOffset(offset, 4, this.length);

  	return (this[offset] | (this[offset + 1] << 8) | (this[offset + 2] << 16)) + this[offset + 3] * 0x1000000;
  };

  Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
  	if (!noAssert) checkOffset(offset, 4, this.length);

  	return this[offset] * 0x1000000 + ((this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3]);
  };

  Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
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

  	return val;
  };

  Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
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

  	return val;
  };

  Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
  	if (!noAssert) checkOffset(offset, 1, this.length);
  	if (!(this[offset] & 0x80)) return this[offset];
  	return (0xff - this[offset] + 1) * -1;
  };

  Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
  	if (!noAssert) checkOffset(offset, 2, this.length);
  	var val = this[offset] | (this[offset + 1] << 8);
  	return val & 0x8000 ? val | 0xffff0000 : val;
  };

  Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
  	if (!noAssert) checkOffset(offset, 2, this.length);
  	var val = this[offset + 1] | (this[offset] << 8);
  	return val & 0x8000 ? val | 0xffff0000 : val;
  };

  Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
  	if (!noAssert) checkOffset(offset, 4, this.length);

  	return this[offset] | (this[offset + 1] << 8) | (this[offset + 2] << 16) | (this[offset + 3] << 24);
  };

  Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
  	if (!noAssert) checkOffset(offset, 4, this.length);

  	return (this[offset] << 24) | (this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3];
  };

  Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
  	if (!noAssert) checkOffset(offset, 4, this.length);
  	return read(this, offset, true, 23, 4);
  };

  Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
  	if (!noAssert) checkOffset(offset, 4, this.length);
  	return read(this, offset, false, 23, 4);
  };

  Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
  	if (!noAssert) checkOffset(offset, 8, this.length);
  	return read(this, offset, true, 52, 8);
  };

  Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
  	if (!noAssert) checkOffset(offset, 8, this.length);
  	return read(this, offset, false, 52, 8);
  };

  function checkInt(buf, value, offset, ext, max, min) {
  	if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
  	if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
  	if (offset + ext > buf.length) throw new RangeError("Index out of range");
  }

  Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
  	value = +value;
  	offset = offset | 0;
  	byteLength = byteLength | 0;
  	if (!noAssert) {
  		var maxBytes = Math.pow(2, 8 * byteLength) - 1;
  		checkInt(this, value, offset, byteLength, maxBytes, 0);
  	}

  	var mul = 1;
  	var i = 0;
  	this[offset] = value & 0xff;
  	while (++i < byteLength && (mul *= 0x100)) {
  		this[offset + i] = (value / mul) & 0xff;
  	}

  	return offset + byteLength;
  };

  Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
  	value = +value;
  	offset = offset | 0;
  	byteLength = byteLength | 0;
  	if (!noAssert) {
  		var maxBytes = Math.pow(2, 8 * byteLength) - 1;
  		checkInt(this, value, offset, byteLength, maxBytes, 0);
  	}

  	var i = byteLength - 1;
  	var mul = 1;
  	this[offset + i] = value & 0xff;
  	while (--i >= 0 && (mul *= 0x100)) {
  		this[offset + i] = (value / mul) & 0xff;
  	}

  	return offset + byteLength;
  };

  Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
  	value = +value;
  	offset = offset | 0;
  	if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  	if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  	this[offset] = value & 0xff;
  	return offset + 1;
  };

  function objectWriteUInt16(buf, value, offset, littleEndian) {
  	if (value < 0) value = 0xffff + value + 1;
  	for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
  		buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>> ((littleEndian ? i : 1 - i) * 8);
  	}
  }

  Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
  	value = +value;
  	offset = offset | 0;
  	if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  	if (Buffer.TYPED_ARRAY_SUPPORT) {
  		this[offset] = value & 0xff;
  		this[offset + 1] = value >>> 8;
  	} else {
  		objectWriteUInt16(this, value, offset, true);
  	}
  	return offset + 2;
  };

  Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
  	value = +value;
  	offset = offset | 0;
  	if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  	if (Buffer.TYPED_ARRAY_SUPPORT) {
  		this[offset] = value >>> 8;
  		this[offset + 1] = value & 0xff;
  	} else {
  		objectWriteUInt16(this, value, offset, false);
  	}
  	return offset + 2;
  };

  function objectWriteUInt32(buf, value, offset, littleEndian) {
  	if (value < 0) value = 0xffffffff + value + 1;
  	for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
  		buf[offset + i] = (value >>> ((littleEndian ? i : 3 - i) * 8)) & 0xff;
  	}
  }

  Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
  	value = +value;
  	offset = offset | 0;
  	if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  	if (Buffer.TYPED_ARRAY_SUPPORT) {
  		this[offset + 3] = value >>> 24;
  		this[offset + 2] = value >>> 16;
  		this[offset + 1] = value >>> 8;
  		this[offset] = value & 0xff;
  	} else {
  		objectWriteUInt32(this, value, offset, true);
  	}
  	return offset + 4;
  };

  Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
  	value = +value;
  	offset = offset | 0;
  	if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  	if (Buffer.TYPED_ARRAY_SUPPORT) {
  		this[offset] = value >>> 24;
  		this[offset + 1] = value >>> 16;
  		this[offset + 2] = value >>> 8;
  		this[offset + 3] = value & 0xff;
  	} else {
  		objectWriteUInt32(this, value, offset, false);
  	}
  	return offset + 4;
  };

  Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
  	value = +value;
  	offset = offset | 0;
  	if (!noAssert) {
  		var limit = Math.pow(2, 8 * byteLength - 1);

  		checkInt(this, value, offset, byteLength, limit - 1, -limit);
  	}

  	var i = 0;
  	var mul = 1;
  	var sub = 0;
  	this[offset] = value & 0xff;
  	while (++i < byteLength && (mul *= 0x100)) {
  		if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
  			sub = 1;
  		}
  		this[offset + i] = (((value / mul) >> 0) - sub) & 0xff;
  	}

  	return offset + byteLength;
  };

  Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
  	value = +value;
  	offset = offset | 0;
  	if (!noAssert) {
  		var limit = Math.pow(2, 8 * byteLength - 1);

  		checkInt(this, value, offset, byteLength, limit - 1, -limit);
  	}

  	var i = byteLength - 1;
  	var mul = 1;
  	var sub = 0;
  	this[offset + i] = value & 0xff;
  	while (--i >= 0 && (mul *= 0x100)) {
  		if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
  			sub = 1;
  		}
  		this[offset + i] = (((value / mul) >> 0) - sub) & 0xff;
  	}

  	return offset + byteLength;
  };

  Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
  	value = +value;
  	offset = offset | 0;
  	if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  	if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  	if (value < 0) value = 0xff + value + 1;
  	this[offset] = value & 0xff;
  	return offset + 1;
  };

  Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
  	value = +value;
  	offset = offset | 0;
  	if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  	if (Buffer.TYPED_ARRAY_SUPPORT) {
  		this[offset] = value & 0xff;
  		this[offset + 1] = value >>> 8;
  	} else {
  		objectWriteUInt16(this, value, offset, true);
  	}
  	return offset + 2;
  };

  Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
  	value = +value;
  	offset = offset | 0;
  	if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  	if (Buffer.TYPED_ARRAY_SUPPORT) {
  		this[offset] = value >>> 8;
  		this[offset + 1] = value & 0xff;
  	} else {
  		objectWriteUInt16(this, value, offset, false);
  	}
  	return offset + 2;
  };

  Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
  	value = +value;
  	offset = offset | 0;
  	if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  	if (Buffer.TYPED_ARRAY_SUPPORT) {
  		this[offset] = value & 0xff;
  		this[offset + 1] = value >>> 8;
  		this[offset + 2] = value >>> 16;
  		this[offset + 3] = value >>> 24;
  	} else {
  		objectWriteUInt32(this, value, offset, true);
  	}
  	return offset + 4;
  };

  Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
  	value = +value;
  	offset = offset | 0;
  	if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  	if (value < 0) value = 0xffffffff + value + 1;
  	if (Buffer.TYPED_ARRAY_SUPPORT) {
  		this[offset] = value >>> 24;
  		this[offset + 1] = value >>> 16;
  		this[offset + 2] = value >>> 8;
  		this[offset + 3] = value & 0xff;
  	} else {
  		objectWriteUInt32(this, value, offset, false);
  	}
  	return offset + 4;
  };

  function checkIEEE754(buf, value, offset, ext, max, min) {
  	if (offset + ext > buf.length) throw new RangeError("Index out of range");
  	if (offset < 0) throw new RangeError("Index out of range");
  }

  function writeFloat(buf, value, offset, littleEndian, noAssert) {
  	if (!noAssert) {
  		checkIEEE754(buf, value, offset, 4);
  	}
  	write(buf, value, offset, littleEndian, 23, 4);
  	return offset + 4;
  }

  Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
  	return writeFloat(this, value, offset, true, noAssert);
  };

  Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
  	return writeFloat(this, value, offset, false, noAssert);
  };

  function writeDouble(buf, value, offset, littleEndian, noAssert) {
  	if (!noAssert) {
  		checkIEEE754(buf, value, offset, 8);
  	}
  	write(buf, value, offset, littleEndian, 52, 8);
  	return offset + 8;
  }

  Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
  	return writeDouble(this, value, offset, true, noAssert);
  };

  Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
  	return writeDouble(this, value, offset, false, noAssert);
  };

  // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
  Buffer.prototype.copy = function copy(target, targetStart, start, end) {
  	if (!start) start = 0;
  	if (!end && end !== 0) end = this.length;
  	if (targetStart >= target.length) targetStart = target.length;
  	if (!targetStart) targetStart = 0;
  	if (end > 0 && end < start) end = start;

  	// Copy 0 bytes; we're done
  	if (end === start) return 0;
  	if (target.length === 0 || this.length === 0) return 0;

  	// Fatal error conditions
  	if (targetStart < 0) {
  		throw new RangeError("targetStart out of bounds");
  	}
  	if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
  	if (end < 0) throw new RangeError("sourceEnd out of bounds");

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
  		Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
  	}

  	return len;
  };

  // Usage:
  //    buffer.fill(number[, offset[, end]])
  //    buffer.fill(buffer[, offset[, end]])
  //    buffer.fill(string[, offset[, end]][, encoding])
  Buffer.prototype.fill = function fill(val, start, end, encoding) {
  	// Handle string cases:
  	if (typeof val === "string") {
  		if (typeof start === "string") {
  			encoding = start;
  			start = 0;
  			end = this.length;
  		} else if (typeof end === "string") {
  			encoding = end;
  			end = this.length;
  		}
  		if (val.length === 1) {
  			var code = val.charCodeAt(0);
  			if (code < 256) {
  				val = code;
  			}
  		}
  		if (encoding !== undefined && typeof encoding !== "string") {
  			throw new TypeError("encoding must be a string");
  		}
  		if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
  			throw new TypeError("Unknown encoding: " + encoding);
  		}
  	} else if (typeof val === "number") {
  		val = val & 255;
  	}

  	// Invalid ranges are not set to a default, so can range check early.
  	if (start < 0 || this.length < start || this.length < end) {
  		throw new RangeError("Out of range index");
  	}

  	if (end <= start) {
  		return this;
  	}

  	start = start >>> 0;
  	end = end === undefined ? this.length : end >>> 0;

  	if (!val) val = 0;

  	var i;
  	if (typeof val === "number") {
  		for (i = start; i < end; ++i) {
  			this[i] = val;
  		}
  	} else {
  		var bytes = internalIsBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
  		var len = bytes.length;
  		for (i = 0; i < end - start; ++i) {
  			this[i + start] = bytes[i % len];
  		}
  	}

  	return this;
  };

  // HELPER FUNCTIONS
  // ================

  var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

  function base64clean(str) {
  	// Node strips out invalid characters like \n and \t from the string, base64-js does not
  	str = stringtrim(str).replace(INVALID_BASE64_RE, "");
  	// Node converts strings with length < 2 to ''
  	if (str.length < 2) return "";
  	// Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  	while (str.length % 4 !== 0) {
  		str = str + "=";
  	}
  	return str;
  }

  function stringtrim(str) {
  	if (str.trim) return str.trim();
  	return str.replace(/^\s+|\s+$/g, "");
  }

  function toHex(n) {
  	if (n < 16) return "0" + n.toString(16);
  	return n.toString(16);
  }

  function utf8ToBytes(string, units) {
  	units = units || Infinity;
  	var codePoint;
  	var length = string.length;
  	var leadSurrogate = null;
  	var bytes = [];

  	for (var i = 0; i < length; ++i) {
  		codePoint = string.charCodeAt(i);

  		// is surrogate component
  		if (codePoint > 0xd7ff && codePoint < 0xe000) {
  			// last char was a lead
  			if (!leadSurrogate) {
  				// no lead yet
  				if (codePoint > 0xdbff) {
  					// unexpected trail
  					if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
  					continue;
  				} else if (i + 1 === length) {
  					// unpaired lead
  					if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
  					continue;
  				}

  				// valid lead
  				leadSurrogate = codePoint;

  				continue;
  			}

  			// 2 leads in a row
  			if (codePoint < 0xdc00) {
  				if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
  				leadSurrogate = codePoint;
  				continue;
  			}

  			// valid surrogate pair
  			codePoint = (((leadSurrogate - 0xd800) << 10) | (codePoint - 0xdc00)) + 0x10000;
  		} else if (leadSurrogate) {
  			// valid bmp char, but last char was a lead
  			if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
  		}

  		leadSurrogate = null;

  		// encode utf8
  		if (codePoint < 0x80) {
  			if ((units -= 1) < 0) break;
  			bytes.push(codePoint);
  		} else if (codePoint < 0x800) {
  			if ((units -= 2) < 0) break;
  			bytes.push((codePoint >> 0x6) | 0xc0, (codePoint & 0x3f) | 0x80);
  		} else if (codePoint < 0x10000) {
  			if ((units -= 3) < 0) break;
  			bytes.push((codePoint >> 0xc) | 0xe0, ((codePoint >> 0x6) & 0x3f) | 0x80, (codePoint & 0x3f) | 0x80);
  		} else if (codePoint < 0x110000) {
  			if ((units -= 4) < 0) break;
  			bytes.push((codePoint >> 0x12) | 0xf0, ((codePoint >> 0xc) & 0x3f) | 0x80, ((codePoint >> 0x6) & 0x3f) | 0x80, (codePoint & 0x3f) | 0x80);
  		} else {
  			throw new Error("Invalid code point");
  		}
  	}

  	return bytes;
  }

  function asciiToBytes(str) {
  	var byteArray = [];
  	for (var i = 0; i < str.length; ++i) {
  		// Node's code seems to be doing this and not & 0x7F..
  		byteArray.push(str.charCodeAt(i) & 0xff);
  	}
  	return byteArray;
  }

  function utf16leToBytes(str, units) {
  	var c, hi, lo;
  	var byteArray = [];
  	for (var i = 0; i < str.length; ++i) {
  		if ((units -= 2) < 0) break;

  		c = str.charCodeAt(i);
  		hi = c >> 8;
  		lo = c % 256;
  		byteArray.push(lo);
  		byteArray.push(hi);
  	}

  	return byteArray;
  }

  function base64ToBytes(str) {
  	return toByteArray(base64clean(str));
  }

  function blitBuffer(src, dst, offset, length) {
  	for (var i = 0; i < length; ++i) {
  		if (i + offset >= dst.length || i >= src.length) break;
  		dst[i + offset] = src[i];
  	}
  	return i;
  }

  function isnan(val) {
  	return val !== val; // eslint-disable-line no-self-compare
  }

  // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
  // The _isBuffer check is for Safari 5-7 support, because it's missing
  // Object.prototype.constructor. Remove this eventually
  function isBuffer$2(obj) {
  	return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj));
  }

  function isFastBuffer(obj) {
  	return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
  }

  // For Node v0.10 support. Remove this eventually.
  function isSlowBuffer(obj) {
  	return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isFastBuffer(obj.slice(0, 0));
  }

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [config] The config.
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   *
   * @returns {Error} The created error.
   */
  function AxiosError$1(message, code, config, request, response) {
    Error.call(this);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error()).stack;
    }

    this.message = message;
    this.name = 'AxiosError';
    code && (this.code = code);
    config && (this.config = config);
    request && (this.request = request);
    if (response) {
      this.response = response;
      this.status = response.status ? response.status : null;
    }
  }

  utils$1.inherits(AxiosError$1, Error, {
    toJSON: function toJSON() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: utils$1.toJSONObject(this.config),
        code: this.code,
        status: this.status
      };
    }
  });

  const prototype$1 = AxiosError$1.prototype;
  const descriptors = {};

  [
    'ERR_BAD_OPTION_VALUE',
    'ERR_BAD_OPTION',
    'ECONNABORTED',
    'ETIMEDOUT',
    'ERR_NETWORK',
    'ERR_FR_TOO_MANY_REDIRECTS',
    'ERR_DEPRECATED',
    'ERR_BAD_RESPONSE',
    'ERR_BAD_REQUEST',
    'ERR_CANCELED',
    'ERR_NOT_SUPPORT',
    'ERR_INVALID_URL'
  // eslint-disable-next-line func-names
  ].forEach(code => {
    descriptors[code] = {value: code};
  });

  Object.defineProperties(AxiosError$1, descriptors);
  Object.defineProperty(prototype$1, 'isAxiosError', {value: true});

  // eslint-disable-next-line func-names
  AxiosError$1.from = (error, code, config, request, response, customProps) => {
    const axiosError = Object.create(prototype$1);

    utils$1.toFlatObject(error, axiosError, function filter(obj) {
      return obj !== Error.prototype;
    }, prop => {
      return prop !== 'isAxiosError';
    });

    AxiosError$1.call(axiosError, error.message, code, config, request, response);

    axiosError.cause = error;

    axiosError.name = error.name;

    customProps && Object.assign(axiosError, customProps);

    return axiosError;
  };

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
  	if (!isString$1(f)) {
  		var objects = [];
  		for (var i = 0; i < arguments.length; i++) {
  			objects.push(inspect$1(arguments[i]));
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
  			str += " " + inspect$1(x);
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

  	if (browser$1$1.noDeprecation === true) {
  		return fn;
  	}

  	var warned = false;
  	function deprecated() {
  		if (!warned) {
  			if (browser$1$1.throwDeprecation) {
  				throw new Error(msg);
  			} else if (browser$1$1.traceDeprecation) {
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
  	if (isUndefined(debugEnviron)) debugEnviron = browser$1$1.env.NODE_DEBUG || "";
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
  function inspect$1(obj, opts) {
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
  inspect$1.colors = {
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
  inspect$1.styles = {
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
  	var style = inspect$1.styles[styleType];

  	if (style) {
  		return "\u001b[" + inspect$1.colors[style][0] + "m" + str + "\u001b[" + inspect$1.colors[style][1] + "m";
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
  		isFunction$2(value.inspect) &&
  		// Filter out the util module, it's inspect function is special
  		value.inspect !== inspect$1 &&
  		// Also filter out any prototype objects using the circular check.
  		!(value.constructor && value.constructor.prototype === value)
  	) {
  		var ret = value.inspect(recurseTimes, ctx);
  		if (!isString$1(ret)) {
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
  		if (isFunction$2(value)) {
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
  	if (isFunction$2(value)) {
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
  	if (isString$1(value)) {
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

  function isString$1(arg) {
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

  function isFunction$2(arg) {
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

  function isBuffer$1(maybeBuf) {
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

  function callbackify$1(original) {
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
  				browser$1$1.nextTick(cb.bind(null, null, ret));
  			},
  			function (rej) {
  				browser$1$1.nextTick(callbackifyOnRejected.bind(null, rej, cb));
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
  	isBuffer: isBuffer$1,
  	isPrimitive: isPrimitive,
  	isFunction: isFunction$2,
  	isError: isError,
  	isDate: isDate,
  	isObject: isObject,
  	isRegExp: isRegExp,
  	isUndefined: isUndefined,
  	isSymbol: isSymbol,
  	isString: isString$1,
  	isNumber: isNumber,
  	isNullOrUndefined: isNullOrUndefined,
  	isNull: isNull,
  	isBoolean: isBoolean,
  	isArray: isArray$1,
  	inspect: inspect$1,
  	deprecate: deprecate,
  	format: format$1,
  	debuglog: debuglog,
  	promisify: promisify,
  	callbackify: callbackify$1,
  	isPromise: isPromise,
  };

  const TextEncoder$1 = (function () {
  	return globalThis.TextEncoder || require("util").TextEncoder;
  })(); // ### MODIFIED ###
  const TextDecoder = (function () {
  	return globalThis.TextDecoder || require("util").TextDecoder;
  })(); // ### MODIFIED ###

  var _polyfillNode_util = /*#__PURE__*/Object.freeze({
    __proto__: null,
    TextDecoder: TextDecoder,
    TextEncoder: TextEncoder$1,
    _extend: _extend,
    callbackify: callbackify$1,
    debuglog: debuglog,
    default: types,
    deprecate: deprecate,
    format: format$1,
    inherits: inherits,
    inspect: inspect$1,
    isArray: isArray$1,
    isBoolean: isBoolean,
    isBuffer: isBuffer$1,
    isDate: isDate,
    isError: isError,
    isFunction: isFunction$2,
    isNull: isNull,
    isNullOrUndefined: isNullOrUndefined,
    isNumber: isNumber,
    isObject: isObject,
    isPrimitive: isPrimitive,
    isPromise: isPromise,
    isRegExp: isRegExp,
    isString: isString$1,
    isSymbol: isSymbol,
    isUndefined: isUndefined,
    log: log,
    promisify: promisify,
    types: types
  });

  var require$$1$1 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_util);

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
      if (domain.active) ;
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

  var debug$2 = debuglog('stream');
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
    debug$2('read', n);
    n = parseInt(n, 10);
    var state = this._readableState;
    var nOrig = n;

    if (n !== 0) state.emittedReadable = false;

    // if we're doing read(0) to trigger a readable event, but we
    // already have a bunch of data in the buffer, then just trigger
    // the 'readable' event and move on.
    if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
      debug$2('read: emitReadable', state.length, state.ended);
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
    debug$2('need readable', doRead);

    // if we currently have less than the highWaterMark, then also read some
    if (state.length === 0 || state.length - n < state.highWaterMark) {
      doRead = true;
      debug$2('length less than watermark', doRead);
    }

    // however, if we've ended, then there's no point, and if we're already
    // reading, then it's unnecessary.
    if (state.ended || state.reading) {
      doRead = false;
      debug$2('reading or ended', doRead);
    } else if (doRead) {
      debug$2('do read');
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
      debug$2('emitReadable', state.flowing);
      state.emittedReadable = true;
      if (state.sync) nextTick(emitReadable_, stream);else emitReadable_(stream);
    }
  }

  function emitReadable_(stream) {
    debug$2('emit readable');
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
      debug$2('maybeReadMore read 0');
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
    debug$2('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

    var doEnd = (!pipeOpts || pipeOpts.end !== false);

    var endFn = doEnd ? onend : cleanup;
    if (state.endEmitted) nextTick(endFn);else src.once('end', endFn);

    dest.on('unpipe', onunpipe);
    function onunpipe(readable) {
      debug$2('onunpipe');
      if (readable === src) {
        cleanup();
      }
    }

    function onend() {
      debug$2('onend');
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
      debug$2('cleanup');
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
      debug$2('ondata');
      increasedAwaitDrain = false;
      var ret = dest.write(chunk);
      if (false === ret && !increasedAwaitDrain) {
        // If the user unpiped during `dest.write()`, it is possible
        // to get stuck in a permanently paused state if that write
        // also returned false.
        // => Check whether `dest` is still a piping destination.
        if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
          debug$2('false write response, pause', src._readableState.awaitDrain);
          src._readableState.awaitDrain++;
          increasedAwaitDrain = true;
        }
        src.pause();
      }
    }

    // if the dest has an error, then stop piping into it.
    // however, don't suppress the throwing behavior for this.
    function onerror(er) {
      debug$2('onerror', er);
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
      debug$2('onfinish');
      dest.removeListener('close', onclose);
      unpipe();
    }
    dest.once('finish', onfinish);

    function unpipe() {
      debug$2('unpipe');
      src.unpipe(dest);
    }

    // tell the dest that it's being piped to
    dest.emit('pipe', src);

    // start the flow if it hasn't been started already.
    if (!state.flowing) {
      debug$2('pipe resume');
      src.resume();
    }

    return dest;
  };

  function pipeOnDrain(src) {
    return function () {
      var state = src._readableState;
      debug$2('pipeOnDrain', state.awaitDrain);
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
    debug$2('readable nexttick read 0');
    self.read(0);
  }

  // pause() and resume() are remnants of the legacy readable stream API
  // If the user uses them, then switch into old mode.
  Readable.prototype.resume = function () {
    var state = this._readableState;
    if (!state.flowing) {
      debug$2('resume');
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
      debug$2('resume read 0');
      stream.read(0);
    }

    state.resumeScheduled = false;
    state.awaitDrain = 0;
    stream.emit('resume');
    flow(stream);
    if (state.flowing && !state.reading) stream.read(0);
  }

  Readable.prototype.pause = function () {
    debug$2('call pause flowing=%j', this._readableState.flowing);
    if (false !== this._readableState.flowing) {
      debug$2('pause');
      this._readableState.flowing = false;
      this.emit('pause');
    }
    return this;
  };

  function flow(stream) {
    var state = stream._readableState;
    debug$2('flow', state.flowing);
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
      debug$2('wrapped end');
      if (state.decoder && !state.ended) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length) self.push(chunk);
      }

      self.push(null);
    });

    stream.on('data', function (chunk) {
      debug$2('wrapped data');
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
      debug$2('wrapped _read', n);
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

  Writable$1.WritableState = WritableState;
  inherits(Writable$1, EventEmitter);

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
  function Writable$1(options) {

    // Writable ctor is applied to Duplexes, though they're not
    // instanceof Writable, they're instanceof Readable.
    if (!(this instanceof Writable$1) && !(this instanceof Duplex)) return new Writable$1(options);

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
  Writable$1.prototype.pipe = function () {
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

  Writable$1.prototype.write = function (chunk, encoding, cb) {
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

  Writable$1.prototype.cork = function () {
    var state = this._writableState;

    state.corked++;
  };

  Writable$1.prototype.uncork = function () {
    var state = this._writableState;

    if (state.corked) {
      state.corked--;

      if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
    }
  };

  Writable$1.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
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

  Writable$1.prototype._write = function (chunk, encoding, cb) {
    cb(new Error('not implemented'));
  };

  Writable$1.prototype._writev = null;

  Writable$1.prototype.end = function (chunk, encoding, cb) {
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

  var keys = Object.keys(Writable$1.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable$1.prototype[method];
  }
  function Duplex(options) {
    if (!(this instanceof Duplex)) return new Duplex(options);

    Readable.call(this, options);
    Writable$1.call(this, options);

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

  inherits(Stream$3, EventEmitter);
  Stream$3.Readable = Readable;
  Stream$3.Writable = Writable$1;
  Stream$3.Duplex = Duplex;
  Stream$3.Transform = Transform;
  Stream$3.PassThrough = PassThrough;

  // Backwards-compat with node 0.4.x
  Stream$3.Stream = Stream$3;

  // old-style streams.  Note that the pipe method (the only relevant
  // part of this class) is overridden in the Readable class.

  function Stream$3() {
    EventEmitter.call(this);
  }

  Stream$3.prototype.pipe = function(dest, options) {
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
    Stream: Stream$3,
    Transform: Transform,
    Writable: Writable$1,
    default: Stream$3
  });

  var require$$3 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_stream);

  var Stream$2 = require$$3.Stream;
  var util$2 = require$$1$1;

  var delayed_stream = DelayedStream$1;
  function DelayedStream$1() {
    this.source = null;
    this.dataSize = 0;
    this.maxDataSize = 1024 * 1024;
    this.pauseStream = true;

    this._maxDataSizeExceeded = false;
    this._released = false;
    this._bufferedEvents = [];
  }
  util$2.inherits(DelayedStream$1, Stream$2);

  DelayedStream$1.create = function(source, options) {
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

  Object.defineProperty(DelayedStream$1.prototype, 'readable', {
    configurable: true,
    enumerable: true,
    get: function() {
      return this.source.readable;
    }
  });

  DelayedStream$1.prototype.setEncoding = function() {
    return this.source.setEncoding.apply(this.source, arguments);
  };

  DelayedStream$1.prototype.resume = function() {
    if (!this._released) {
      this.release();
    }

    this.source.resume();
  };

  DelayedStream$1.prototype.pause = function() {
    this.source.pause();
  };

  DelayedStream$1.prototype.release = function() {
    this._released = true;

    this._bufferedEvents.forEach(function(args) {
      this.emit.apply(this, args);
    }.bind(this));
    this._bufferedEvents = [];
  };

  DelayedStream$1.prototype.pipe = function() {
    var r = Stream$2.prototype.pipe.apply(this, arguments);
    this.resume();
    return r;
  };

  DelayedStream$1.prototype._handleEmit = function(args) {
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

  DelayedStream$1.prototype._checkIfMaxDataSizeExceeded = function() {
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

  var util$1 = require$$1$1;
  var Stream$1 = require$$3.Stream;
  var DelayedStream = delayed_stream;

  var combined_stream = CombinedStream$1;
  function CombinedStream$1() {
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
  util$1.inherits(CombinedStream$1, Stream$1);

  CombinedStream$1.create = function(options) {
    var combinedStream = new this();

    options = options || {};
    for (var option in options) {
      combinedStream[option] = options[option];
    }

    return combinedStream;
  };

  CombinedStream$1.isStreamLike = function(stream) {
    return (typeof stream !== 'function')
      && (typeof stream !== 'string')
      && (typeof stream !== 'boolean')
      && (typeof stream !== 'number')
      && (!Buffer.isBuffer(stream));
  };

  CombinedStream$1.prototype.append = function(stream) {
    var isStreamLike = CombinedStream$1.isStreamLike(stream);

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

  CombinedStream$1.prototype.pipe = function(dest, options) {
    Stream$1.prototype.pipe.call(this, dest, options);
    this.resume();
    return dest;
  };

  CombinedStream$1.prototype._getNext = function() {
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

  CombinedStream$1.prototype._realGetNext = function() {
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
      var isStreamLike = CombinedStream$1.isStreamLike(stream);
      if (isStreamLike) {
        stream.on('data', this._checkDataSize.bind(this));
        this._handleErrors(stream);
      }

      this._pipeNext(stream);
    }.bind(this));
  };

  CombinedStream$1.prototype._pipeNext = function(stream) {
    this._currentStream = stream;

    var isStreamLike = CombinedStream$1.isStreamLike(stream);
    if (isStreamLike) {
      stream.on('end', this._getNext.bind(this));
      stream.pipe(this, {end: false});
      return;
    }

    var value = stream;
    this.write(value);
    this._getNext();
  };

  CombinedStream$1.prototype._handleErrors = function(stream) {
    var self = this;
    stream.on('error', function(err) {
      self._emitError(err);
    });
  };

  CombinedStream$1.prototype.write = function(data) {
    this.emit('data', data);
  };

  CombinedStream$1.prototype.pause = function() {
    if (!this.pauseStreams) {
      return;
    }

    if(this.pauseStreams && this._currentStream && typeof(this._currentStream.pause) == 'function') this._currentStream.pause();
    this.emit('pause');
  };

  CombinedStream$1.prototype.resume = function() {
    if (!this._released) {
      this._released = true;
      this.writable = true;
      this._getNext();
    }

    if(this.pauseStreams && this._currentStream && typeof(this._currentStream.resume) == 'function') this._currentStream.resume();
    this.emit('resume');
  };

  CombinedStream$1.prototype.end = function() {
    this._reset();
    this.emit('end');
  };

  CombinedStream$1.prototype.destroy = function() {
    this._reset();
    this.emit('close');
  };

  CombinedStream$1.prototype._reset = function() {
    this.writable = false;
    this._streams = [];
    this._currentStream = null;
  };

  CombinedStream$1.prototype._checkDataSize = function() {
    this._updateDataSize();
    if (this.dataSize <= this.maxDataSize) {
      return;
    }

    var message =
      'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
    this._emitError(new Error(message));
  };

  CombinedStream$1.prototype._updateDataSize = function() {
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

  CombinedStream$1.prototype._emitError = function(err) {
    this._reset();
    this.emit('error', err);
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

  var require$$2$1 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_path$1);

  var hasFetch = isFunction$1(global$1.fetch) && isFunction$1(global$1.ReadableStream);

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
  var haveSlice = haveArrayBuffer && isFunction$1(global$1.ArrayBuffer.prototype.slice);

  var arraybuffer = haveArrayBuffer && checkTypeSupport('arraybuffer');
    // These next two tests unavoidably show warnings in Chrome. Since fetch will always
    // be used if it's available, just return false for these to avoid the warnings.
  var msstream = !hasFetch && haveSlice && checkTypeSupport('ms-stream');
  var mozchunkedarraybuffer = !hasFetch && haveArrayBuffer &&
    checkTypeSupport('moz-chunked-arraybuffer');
  var overrideMimeType = isFunction$1(xhr.overrideMimeType);
  var vbArray = isFunction$1(global$1.VBArray);

  function isFunction$1(value) {
    return typeof value === 'function'
  }

  xhr = null; // Help gc

  var rStates = {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
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
      browser$1$1.nextTick(function() {
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

    if (isBuffer$2(buf)) {
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
    Writable$1.call(self);

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

  inherits(ClientRequest, Writable$1);
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
        browser$1$1.nextTick(function() {
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
        browser$1$1.nextTick(function() {
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

    Writable$1.prototype.end.call(self, data, encoding, cb);
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
  function encode$2(input) {
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
        'xn--' + encode$2(string) :
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
      return map(objectKeys$1(obj), function(k) {
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

  var objectKeys$1 = Object.keys || function (obj) {
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
  const URL$2 = global$1.URL;
  const URLSearchParams$1 = global$1.URLSearchParams;
  var url$1 = {
    parse: urlParse,
    resolve: urlResolve,
    resolveObject: urlResolveObject,
    fileURLToPath: urlFileURLToPath,
    format: urlFormat,
    Url: Url,

    // WHATWG API
    URL: URL$2,
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
    if (!isString$1(url)) {
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
    if (isString$1(obj)) obj = parse({}, obj);
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
    if (isString$1(relative)) {
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

  var _polyfillNode_url = /*#__PURE__*/Object.freeze({
    __proto__: null,
    URL: URL$2,
    URLSearchParams: URLSearchParams$1,
    Url: Url,
    default: url$1,
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

  var http$2 = {
    request: request$1,
    get: get$1,
    Agent: Agent$1,
    METHODS: METHODS$1,
    STATUS_CODES: STATUS_CODES$1
  };

  var _polyfillNode_http = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Agent: Agent$1,
    METHODS: METHODS$1,
    STATUS_CODES: STATUS_CODES$1,
    default: http$2,
    get: get$1,
    request: request$1
  });

  var require$$1 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_http);

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

  var https$2 = {
    request,
    get,
    Agent,
    METHODS,
    STATUS_CODES
  };

  var _polyfillNode_https = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Agent: Agent,
    METHODS: METHODS,
    STATUS_CODES: STATUS_CODES,
    default: https$2,
    get: get,
    request: request
  });

  var require$$2 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_https);

  var require$$0$1 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_url);

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
  	"application/activemessage": {
  	source: "iana"
  },
  	"application/activity+json": {
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
  	"application/applefile": {
  	source: "iana"
  },
  	"application/applixware": {
  	source: "apache",
  	extensions: [
  		"aw"
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
  	"application/city+json": {
  	source: "iana",
  	compressible: true
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
  	source: "iana"
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
  	"application/ecmascript": {
  	source: "iana",
  	compressible: true,
  	extensions: [
  		"es",
  		"ecma"
  	]
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
  	"application/gpx+xml": {
  	source: "apache",
  	compressible: true,
  	extensions: [
  		"gpx"
  	]
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
  	source: "apache",
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
  	source: "iana",
  	charset: "UTF-8",
  	compressible: true,
  	extensions: [
  		"js",
  		"mjs"
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
  	"application/jwk+json": {
  	source: "iana",
  	compressible: true
  },
  	"application/jwk-set+json": {
  	source: "iana",
  	compressible: true
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
  	"application/load-control+xml": {
  	source: "iana",
  	compressible: true
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
  	compressible: false,
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
  		"onepkg"
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
  		"asc",
  		"sig"
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
  	"application/prs.nprend": {
  	source: "iana"
  },
  	"application/prs.plucker": {
  	source: "iana"
  },
  	"application/prs.rdf-xml-crypt": {
  	source: "iana"
  },
  	"application/prs.xsf+xml": {
  	source: "iana",
  	compressible: true
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
  	source: "iana"
  },
  	"application/reputon+json": {
  	source: "iana",
  	compressible: true
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
  	source: "iana"
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
  	source: "iana"
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
  	"application/ssml+xml": {
  	source: "iana",
  	compressible: true,
  	extensions: [
  		"ssml"
  	]
  },
  	"application/stix+json": {
  	source: "iana",
  	compressible: true
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
  	"application/tnauthlist": {
  	source: "iana"
  },
  	"application/token-introspection+jwt": {
  	source: "iana"
  },
  	"application/toml": {
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
  	"application/vnd.3gpp-prose+xml": {
  	source: "iana",
  	compressible: true
  },
  	"application/vnd.3gpp-prose-pc3ch+xml": {
  	source: "iana",
  	compressible: true
  },
  	"application/vnd.3gpp-v2x-local-service-information": {
  	source: "iana"
  },
  	"application/vnd.3gpp.5gnas": {
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
  	"application/vnd.3gpp.mcdata-payload": {
  	source: "iana"
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
  	"application/vnd.3gpp.mcvideo-affiliation-info+xml": {
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
  	"application/vnd.3gpp.s1ap": {
  	source: "iana"
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
  	source: "iana",
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
  	source: "iana"
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
  	"application/vnd.apache.thrift.binary": {
  	source: "iana"
  },
  	"application/vnd.apache.thrift.compact": {
  	source: "iana"
  },
  	"application/vnd.apache.thrift.json": {
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
  	source: "iana"
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
  	source: "iana",
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
  	"application/vnd.frogans.fnc": {
  	source: "iana",
  	extensions: [
  		"fnc"
  	]
  },
  	"application/vnd.frogans.ltf": {
  	source: "iana",
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
  	"application/vnd.genomatix.tuxedo": {
  	source: "iana",
  	extensions: [
  		"txd"
  	]
  },
  	"application/vnd.gentics.grd+json": {
  	source: "iana",
  	compressible: true
  },
  	"application/vnd.geo+json": {
  	source: "iana",
  	compressible: true
  },
  	"application/vnd.geocube+xml": {
  	source: "iana",
  	compressible: true
  },
  	"application/vnd.geogebra.file": {
  	source: "iana",
  	extensions: [
  		"ggb"
  	]
  },
  	"application/vnd.geogebra.slides": {
  	source: "iana"
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
  	"application/vnd.google-apps.document": {
  	compressible: false,
  	extensions: [
  		"gdoc"
  	]
  },
  	"application/vnd.google-apps.presentation": {
  	compressible: false,
  	extensions: [
  		"gslides"
  	]
  },
  	"application/vnd.google-apps.spreadsheet": {
  	compressible: false,
  	extensions: [
  		"gsheet"
  	]
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
  	source: "iana",
  	compressible: true
  },
  	"application/vnd.gov.sk.e-form+zip": {
  	source: "iana",
  	compressible: false
  },
  	"application/vnd.gov.sk.xmldatacontainer+xml": {
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
  	"application/vnd.hl7cda+xml": {
  	source: "iana",
  	charset: "UTF-8",
  	compressible: true
  },
  	"application/vnd.hl7v2+xml": {
  	source: "iana",
  	charset: "UTF-8",
  	compressible: true
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
  	source: "iana"
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
  	source: "iana",
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
  	source: "iana"
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
  	"application/vnd.kenameaapp": {
  	source: "iana",
  	extensions: [
  		"htke"
  	]
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
  	"application/vnd.meridian-slingshot": {
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
  	source: "iana",
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
  	source: "iana",
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
  	source: "iana",
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
  	source: "iana",
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
  	"application/vnd.proteus.magazine": {
  	source: "iana",
  	extensions: [
  		"mgz"
  	]
  },
  	"application/vnd.psfs": {
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
  	compressible: true
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
  		"uoml"
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
  		"vsw"
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
  	"application/vnd.youtube.yt": {
  	source: "iana"
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
  	"application/yang": {
  	source: "iana",
  	extensions: [
  		"yang"
  	]
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
  	source: "iana"
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
  		"mp4a"
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
  	source: "iana"
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
  		"bmp"
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
  	"image/hsj2": {
  	source: "iana",
  	extensions: [
  		"hsj2"
  	]
  },
  	"image/ief": {
  	source: "iana",
  	extensions: [
  		"ief"
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
  		"jpeg",
  		"jpg",
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
  		"jpm"
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
  	compressible: false
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
  		"btif"
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
  	source: "apache",
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
  	"message/news": {
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
  		"mime"
  	]
  },
  	"message/s-http": {
  	source: "iana"
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
  	source: "iana"
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
  	"model/step": {
  	source: "iana"
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
  	source: "iana"
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
  	source: "iana"
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
  	compressible: true
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
  		"markdown",
  		"md"
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
  	source: "iana"
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
  	"text/vtt": {
  	source: "iana",
  	charset: "UTF-8",
  	compressible: true,
  	extensions: [
  		"vtt"
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
  		"ts"
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
  	"video/vnd.radgamettools.bink": {
  	source: "iana"
  },
  	"video/vnd.radgamettools.smacker": {
  	source: "iana"
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

  /**
   * Module exports.
   */

  var mimeDb = require$$0;

  /*!
   * mime-types
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   */

  (function (exports) {

  	/**
  	 * Module dependencies.
  	 * @private
  	 */

  	var db = mimeDb;
  	var extname = require$$2$1.extname;

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

  	  var mime = str.indexOf('/') === -1
  	    ? exports.lookup(str)
  	    : str;

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
  	    .substr(1);

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
  	  // source preference (least -> most)
  	  var preference = ['nginx', 'apache', undefined, 'iana'];

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

  	      if (types[extension]) {
  	        var from = preference.indexOf(db[types[extension]].source);
  	        var to = preference.indexOf(mime.source);

  	        if (types[extension] !== 'application/octet-stream' &&
  	          (from > to || (from === to && types[extension].substr(0, 12) === 'application/'))) {
  	          // skip the remapping
  	          continue
  	        }
  	      }

  	      // set the extension -> mime
  	      types[extension] = type;
  	    }
  	  });
  	} 
  } (mimeTypes));

  var defer_1 = defer$1;

  /**
   * Runs provided function on next iteration of the event loop
   *
   * @param {function} fn - function to run
   */
  function defer$1(fn)
  {
    var nextTick = typeof setImmediate == 'function'
      ? setImmediate
      : (
        typeof browser$1$1 == 'object' && typeof browser$1$1.nextTick == 'function'
        ? browser$1$1.nextTick
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

  var defer = defer_1;

  // API
  var async_1 = async$2;

  /**
   * Runs provided callback asynchronously
   * even if callback itself is not
   *
   * @param   {function} callback - callback to invoke
   * @returns {function} - augmented callback
   */
  function async$2(callback)
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

  // API
  var abort_1 = abort$2;

  /**
   * Aborts leftover active jobs
   *
   * @param {object} state - current state object
   */
  function abort$2(state)
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

  var async$1 = async_1
    , abort$1 = abort_1
    ;

  // API
  var iterate_1 = iterate$2;

  /**
   * Iterates over each job object
   *
   * @param {array|object} list - array or object (named list) to iterate over
   * @param {function} iterator - iterator to run
   * @param {object} state - current job status
   * @param {function} callback - invoked when all elements processed
   */
  function iterate$2(list, iterator, state, callback)
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
        abort$1(state);
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
      aborter = iterator(item, async$1(callback));
    }
    // otherwise go with full three arguments
    else
    {
      aborter = iterator(item, key, async$1(callback));
    }

    return aborter;
  }

  // API
  var state_1 = state;

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

  var abort = abort_1
    , async = async_1
    ;

  // API
  var terminator_1 = terminator$2;

  /**
   * Terminates jobs in the attached state context
   *
   * @this  AsyncKitState#
   * @param {function} callback - final callback to invoke after termination
   */
  function terminator$2(callback)
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

  var iterate$1    = iterate_1
    , initState$1  = state_1
    , terminator$1 = terminator_1
    ;

  // Public API
  var parallel_1 = parallel;

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
    var state = initState$1(list);

    while (state.index < (state['keyedList'] || list).length)
    {
      iterate$1(list, iterator, state, function(error, result)
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

    return terminator$1.bind(state, callback);
  }

  var serialOrdered$2 = {exports: {}};

  var iterate    = iterate_1
    , initState  = state_1
    , terminator = terminator_1
    ;

  // Public API
  serialOrdered$2.exports = serialOrdered$1;
  // sorting helpers
  serialOrdered$2.exports.ascending  = ascending;
  serialOrdered$2.exports.descending = descending;

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

  var serialOrderedExports = serialOrdered$2.exports;

  var serialOrdered = serialOrderedExports;

  // Public API
  var serial_1 = serial;

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

  var asynckit$1 =
  {
    parallel      : parallel_1,
    serial        : serial_1,
    serialOrdered : serialOrderedExports
  };

  // populates missing values
  var populate$1 = function(dst, src) {

    Object.keys(src).forEach(function(prop)
    {
      dst[prop] = dst[prop] || src[prop];
    });

    return dst;
  };

  var CombinedStream = combined_stream;
  var util = require$$1$1;
  var path = require$$2$1;
  var http$1 = require$$1;
  var https$1 = require$$2;
  var parseUrl$2 = require$$0$1.parse;
  var fs = require$$6;
  var Stream = require$$3.Stream;
  var mime = mimeTypes;
  var asynckit = asynckit$1;
  var populate = populate$1;

  // Public API
  var form_data = FormData$1;

  // make it a Stream
  util.inherits(FormData$1, CombinedStream);

  /**
   * Create readable "multipart/form-data" streams.
   * Can be used to submit forms
   * and file uploads to other web applications.
   *
   * @constructor
   * @param {Object} options - Properties to be added/overriden for FormData and CombinedStream
   */
  function FormData$1(options) {
    if (!(this instanceof FormData$1)) {
      return new FormData$1(options);
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

  FormData$1.LINE_BREAK = '\r\n';
  FormData$1.DEFAULT_CONTENT_TYPE = 'application/octet-stream';

  FormData$1.prototype.append = function(field, value, options) {

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

  FormData$1.prototype._trackLength = function(header, value, options) {
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
      FormData$1.LINE_BREAK.length;

    // empty or either doesn't have path or not an http response or not a stream
    if (!value || ( !value.path && !(value.readable && value.hasOwnProperty('httpVersion')) && !(value instanceof Stream))) {
      return;
    }

    // no need to bother with the length
    if (!options.knownLength) {
      this._valuesToMeasure.push(value);
    }
  };

  FormData$1.prototype._lengthRetriever = function(value, callback) {

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

  FormData$1.prototype._multiPartHeader = function(field, value, options) {
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
        contents += prop + ': ' + header.join('; ') + FormData$1.LINE_BREAK;
      }
    }

    return '--' + this.getBoundary() + FormData$1.LINE_BREAK + contents + FormData$1.LINE_BREAK;
  };

  FormData$1.prototype._getContentDisposition = function(value, options) {

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

  FormData$1.prototype._getContentType = function(value, options) {

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
      contentType = FormData$1.DEFAULT_CONTENT_TYPE;
    }

    return contentType;
  };

  FormData$1.prototype._multiPartFooter = function() {
    return function(next) {
      var footer = FormData$1.LINE_BREAK;

      var lastPart = (this._streams.length === 0);
      if (lastPart) {
        footer += this._lastBoundary();
      }

      next(footer);
    }.bind(this);
  };

  FormData$1.prototype._lastBoundary = function() {
    return '--' + this.getBoundary() + '--' + FormData$1.LINE_BREAK;
  };

  FormData$1.prototype.getHeaders = function(userHeaders) {
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

  FormData$1.prototype.setBoundary = function(boundary) {
    this._boundary = boundary;
  };

  FormData$1.prototype.getBoundary = function() {
    if (!this._boundary) {
      this._generateBoundary();
    }

    return this._boundary;
  };

  FormData$1.prototype.getBuffer = function() {
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
          dataBuffer = Buffer.concat( [dataBuffer, Buffer.from(FormData$1.LINE_BREAK)] );
        }
      }
    }

    // Add the footer and return the Buffer object.
    return Buffer.concat( [dataBuffer, Buffer.from(this._lastBoundary())] );
  };

  FormData$1.prototype._generateBoundary = function() {
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
  FormData$1.prototype.getLengthSync = function() {
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
  FormData$1.prototype.hasKnownLength = function() {
    var hasKnownLength = true;

    if (this._valuesToMeasure.length) {
      hasKnownLength = false;
    }

    return hasKnownLength;
  };

  FormData$1.prototype.getLength = function(cb) {
    var knownLength = this._overheadLength + this._valueLength;

    if (this._streams.length) {
      knownLength += this._lastBoundary().length;
    }

    if (!this._valuesToMeasure.length) {
      browser$1$1.nextTick(cb.bind(this, null, knownLength));
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

  FormData$1.prototype.submit = function(params, cb) {
    var request
      , options
      , defaults = {method: 'post'}
      ;

    // parse provided url if it's string
    // or treat it as options object
    if (typeof params == 'string') {

      params = parseUrl$2(params);
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
      request = https$1.request(options);
    } else {
      request = http$1.request(options);
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

  FormData$1.prototype._error = function(err) {
    if (!this.error) {
      this.error = err;
      this.pause();
      this.emit('error', err);
    }
  };

  FormData$1.prototype.toString = function () {
    return '[object FormData]';
  };

  function isVisitable(thing) {
    return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
  }
  function removeBrackets(key) {
    return utils$1.endsWith(key, "[]") ? key.slice(0, -2) : key;
  }
  function renderKey(path, key, dots) {
    if (!path) return key;
    return path.concat(key).map(function each(token, i) {
      token = removeBrackets(token);
      return !dots && i ? "[" + token + "]" : token;
    }).join(dots ? "." : "");
  }
  function isFlatArray(arr) {
    return utils$1.isArray(arr) && !arr.some(isVisitable);
  }
  const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
    return (/^is[A-Z]/).test(prop);
  });
  function toFormData$1(obj, formData, options) {
    if (!utils$1.isObject(obj)) {
      throw new TypeError("target must be an object");
    }
    formData = formData || new (form_data || FormData)();
    options = utils$1.toFlatObject(options, {
      metaTokens: true,
      dots: false,
      indexes: false
    }, false, function defined(option, source) {
      return !utils$1.isUndefined(source[option]);
    });
    const metaTokens = options.metaTokens;
    const visitor = options.visitor || defaultVisitor;
    const dots = options.dots;
    const indexes = options.indexes;
    const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
    const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);
    if (!utils$1.isFunction(visitor)) {
      throw new TypeError("visitor must be a function");
    }
    function convertValue(value) {
      if (value === null) return "";
      if (utils$1.isDate(value)) {
        return value.toISOString();
      }
      if (!useBlob && utils$1.isBlob(value)) {
        throw new AxiosError$1("Blob is not supported. Use a Buffer instead.");
      }
      if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
        return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
      }
      return value;
    }
    function defaultVisitor(value, key, path) {
      let arr = value;
      if (value && !path && typeof value === "object") {
        if (utils$1.endsWith(key, "{}")) {
          key = metaTokens ? key : key.slice(0, -2);
          value = JSON.stringify(value);
        } else if (utils$1.isArray(value) && isFlatArray(value) || (utils$1.isFileList(value) || utils$1.endsWith(key, "[]")) && (arr = utils$1.toArray(value))) {
          key = removeBrackets(key);
          arr.forEach(function each(el, index) {
            !(utils$1.isUndefined(el) || el === null) && formData.append(indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]", convertValue(el));
          });
          return false;
        }
      }
      if (isVisitable(value)) {
        return true;
      }
      formData.append(renderKey(path, key, dots), convertValue(value));
      return false;
    }
    const stack = [];
    const exposedHelpers = Object.assign(predicates, {
      defaultVisitor,
      convertValue,
      isVisitable
    });
    function build(value, path) {
      if (utils$1.isUndefined(value)) return;
      if (stack.indexOf(value) !== -1) {
        throw Error("Circular reference detected in " + path.join("."));
      }
      stack.push(value);
      utils$1.forEach(value, function each(el, key) {
        const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(formData, el, utils$1.isString(key) ? key.trim() : key, path, exposedHelpers);
        if (result === true) {
          build(el, path ? path.concat(key) : [key]);
        }
      });
      stack.pop();
    }
    if (!utils$1.isObject(obj)) {
      throw new TypeError("data must be an object");
    }
    build(obj);
    return formData;
  }

  /**
   * It encodes a string by replacing all characters that are not in the unreserved set with
   * their percent-encoded equivalents
   *
   * @param {string} str - The string to encode.
   *
   * @returns {string} The encoded string.
   */
  function encode$1(str) {
    const charMap = {
      '!': '%21',
      "'": '%27',
      '(': '%28',
      ')': '%29',
      '~': '%7E',
      '%20': '+',
      '%00': '\x00'
    };
    return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
      return charMap[match];
    });
  }

  /**
   * It takes a params object and converts it to a FormData object
   *
   * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
   * @param {Object<string, any>} options - The options object passed to the Axios constructor.
   *
   * @returns {void}
   */
  function AxiosURLSearchParams(params, options) {
    this._pairs = [];

    params && toFormData$1(params, this, options);
  }

  const prototype = AxiosURLSearchParams.prototype;

  prototype.append = function append(name, value) {
    this._pairs.push([name, value]);
  };

  prototype.toString = function toString(encoder) {
    const _encode = encoder ? function(value) {
      return encoder.call(this, value, encode$1);
    } : encode$1;

    return this._pairs.map(function each(pair) {
      return _encode(pair[0]) + '=' + _encode(pair[1]);
    }, '').join('&');
  };

  /**
   * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
   * URI encoded counterparts
   *
   * @param {string} val The value to be encoded.
   *
   * @returns {string} The encoded value.
   */
  function encode(val) {
    return encodeURIComponent(val).
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, '+').
      replace(/%5B/gi, '[').
      replace(/%5D/gi, ']');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @param {?object} options
   *
   * @returns {string} The formatted url
   */
  function buildURL(url, params, options) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }
    
    const _encode = options && options.encode || encode;

    const serializeFn = options && options.serialize;

    let serializedParams;

    if (serializeFn) {
      serializedParams = serializeFn(params, options);
    } else {
      serializedParams = utils$1.isURLSearchParams(params) ?
        params.toString() :
        new AxiosURLSearchParams(params, options).toString(_encode);
    }

    if (serializedParams) {
      const hashmarkIndex = url.indexOf("#");

      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }
      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  }

  class InterceptorManager {
    constructor() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled,
        rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    }

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     *
     * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
     */
    eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    }

    /**
     * Clear all interceptors from the stack
     *
     * @returns {void}
     */
    clear() {
      if (this.handlers) {
        this.handlers = [];
      }
    }

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     *
     * @returns {void}
     */
    forEach(fn) {
      utils$1.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    }
  }

  var transitionalDefaults = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  };

  var URLSearchParams = url$1.URLSearchParams;

  var platform$1 = {
    isNode: true,
    classes: {
      URLSearchParams,
      FormData: form_data,
      Blob: typeof Blob !== 'undefined' && Blob || null
    },
    protocols: [ 'http', 'https', 'file', 'data' ]
  };

  const hasBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined';

  const _navigator = typeof navigator === 'object' && navigator || undefined;

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   * nativescript
   *  navigator.product -> 'NativeScript' or 'NS'
   *
   * @returns {boolean}
   */
  const hasStandardBrowserEnv = hasBrowserEnv &&
    (!_navigator || ['ReactNative', 'NativeScript', 'NS'].indexOf(_navigator.product) < 0);

  /**
   * Determine if we're running in a standard browser webWorker environment
   *
   * Although the `isStandardBrowserEnv` method indicates that
   * `allows axios to run in a web worker`, the WebWorker will still be
   * filtered out due to its judgment standard
   * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
   * This leads to a problem when axios post `FormData` in webWorker
   */
  const hasStandardBrowserWebWorkerEnv = (() => {
    return (
      typeof WorkerGlobalScope !== 'undefined' &&
      // eslint-disable-next-line no-undef
      self instanceof WorkerGlobalScope &&
      typeof self.importScripts === 'function'
    );
  })();

  const origin = hasBrowserEnv && window.location.href || 'http://localhost';

  var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    hasBrowserEnv: hasBrowserEnv,
    hasStandardBrowserEnv: hasStandardBrowserEnv,
    hasStandardBrowserWebWorkerEnv: hasStandardBrowserWebWorkerEnv,
    navigator: _navigator,
    origin: origin
  });

  var platform = {
    ...utils,
    ...platform$1
  };

  function toURLEncodedForm(data, options) {
    return toFormData$1(data, new platform.classes.URLSearchParams(), Object.assign({
      visitor: function(value, key, path, helpers) {
        if (platform.isNode && utils$1.isBuffer(value)) {
          this.append(key, value.toString('base64'));
          return false;
        }

        return helpers.defaultVisitor.apply(this, arguments);
      }
    }, options));
  }

  /**
   * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
   *
   * @param {string} name - The name of the property to get.
   *
   * @returns An array of strings.
   */
  function parsePropPath(name) {
    // foo[x][y][z]
    // foo.x.y.z
    // foo-x-y-z
    // foo x y z
    return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map(match => {
      return match[0] === '[]' ? '' : match[1] || match[0];
    });
  }

  /**
   * Convert an array to an object.
   *
   * @param {Array<any>} arr - The array to convert to an object.
   *
   * @returns An object with the same keys and values as the array.
   */
  function arrayToObject(arr) {
    const obj = {};
    const keys = Object.keys(arr);
    let i;
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      obj[key] = arr[key];
    }
    return obj;
  }

  /**
   * It takes a FormData object and returns a JavaScript object
   *
   * @param {string} formData The FormData object to convert to JSON.
   *
   * @returns {Object<string, any> | null} The converted object.
   */
  function formDataToJSON(formData) {
    function buildPath(path, value, target, index) {
      let name = path[index++];

      if (name === '__proto__') return true;

      const isNumericKey = Number.isFinite(+name);
      const isLast = index >= path.length;
      name = !name && utils$1.isArray(target) ? target.length : name;

      if (isLast) {
        if (utils$1.hasOwnProp(target, name)) {
          target[name] = [target[name], value];
        } else {
          target[name] = value;
        }

        return !isNumericKey;
      }

      if (!target[name] || !utils$1.isObject(target[name])) {
        target[name] = [];
      }

      const result = buildPath(path, value, target[name], index);

      if (result && utils$1.isArray(target[name])) {
        target[name] = arrayToObject(target[name]);
      }

      return !isNumericKey;
    }

    if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
      const obj = {};

      utils$1.forEachEntry(formData, (name, value) => {
        buildPath(parsePropPath(name), value, obj, 0);
      });

      return obj;
    }

    return null;
  }

  /**
   * It takes a string, tries to parse it, and if it fails, it returns the stringified version
   * of the input
   *
   * @param {any} rawValue - The value to be stringified.
   * @param {Function} parser - A function that parses a string into a JavaScript object.
   * @param {Function} encoder - A function that takes a value and returns a string.
   *
   * @returns {string} A stringified version of the rawValue.
   */
  function stringifySafely(rawValue, parser, encoder) {
    if (utils$1.isString(rawValue)) {
      try {
        (parser || JSON.parse)(rawValue);
        return utils$1.trim(rawValue);
      } catch (e) {
        if (e.name !== 'SyntaxError') {
          throw e;
        }
      }
    }

    return (0, JSON.stringify)(rawValue);
  }

  const defaults = {

    transitional: transitionalDefaults,

    adapter: ['xhr', 'http', 'fetch'],

    transformRequest: [function transformRequest(data, headers) {
      const contentType = headers.getContentType() || '';
      const hasJSONContentType = contentType.indexOf('application/json') > -1;
      const isObjectPayload = utils$1.isObject(data);

      if (isObjectPayload && utils$1.isHTMLForm(data)) {
        data = new FormData(data);
      }

      const isFormData = utils$1.isFormData(data);

      if (isFormData) {
        return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
      }

      if (utils$1.isArrayBuffer(data) ||
        utils$1.isBuffer(data) ||
        utils$1.isStream(data) ||
        utils$1.isFile(data) ||
        utils$1.isBlob(data) ||
        utils$1.isReadableStream(data)
      ) {
        return data;
      }
      if (utils$1.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils$1.isURLSearchParams(data)) {
        headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
        return data.toString();
      }

      let isFileList;

      if (isObjectPayload) {
        if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
          return toURLEncodedForm(data, this.formSerializer).toString();
        }

        if ((isFileList = utils$1.isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
          const _FormData = this.env && this.env.FormData;

          return toFormData$1(
            isFileList ? {'files[]': data} : data,
            _FormData && new _FormData(),
            this.formSerializer
          );
        }
      }

      if (isObjectPayload || hasJSONContentType ) {
        headers.setContentType('application/json', false);
        return stringifySafely(data);
      }

      return data;
    }],

    transformResponse: [function transformResponse(data) {
      const transitional = this.transitional || defaults.transitional;
      const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
      const JSONRequested = this.responseType === 'json';

      if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
        return data;
      }

      if (data && utils$1.isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
        const silentJSONParsing = transitional && transitional.silentJSONParsing;
        const strictJSONParsing = !silentJSONParsing && JSONRequested;

        try {
          return JSON.parse(data);
        } catch (e) {
          if (strictJSONParsing) {
            if (e.name === 'SyntaxError') {
              throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
            }
            throw e;
          }
        }
      }

      return data;
    }],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,
    maxBodyLength: -1,

    env: {
      FormData: platform.classes.FormData,
      Blob: platform.classes.Blob
    },

    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    },

    headers: {
      common: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': undefined
      }
    }
  };

  utils$1.forEach(['delete', 'get', 'head', 'post', 'put', 'patch'], (method) => {
    defaults.headers[method] = {};
  });

  // RawAxiosHeaders whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  const ignoreDuplicateOf = utils$1.toObjectSet([
    'age', 'authorization', 'content-length', 'content-type', 'etag',
    'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
    'last-modified', 'location', 'max-forwards', 'proxy-authorization',
    'referer', 'retry-after', 'user-agent'
  ]);

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} rawHeaders Headers needing to be parsed
   *
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders = rawHeaders => {
    const parsed = {};
    let key;
    let val;
    let i;

    rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
      i = line.indexOf(':');
      key = line.substring(0, i).trim().toLowerCase();
      val = line.substring(i + 1).trim();

      if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
        return;
      }

      if (key === 'set-cookie') {
        if (parsed[key]) {
          parsed[key].push(val);
        } else {
          parsed[key] = [val];
        }
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    });

    return parsed;
  };

  const $internals = Symbol('internals');

  function normalizeHeader(header) {
    return header && String(header).trim().toLowerCase();
  }

  function normalizeValue(value) {
    if (value === false || value == null) {
      return value;
    }

    return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
  }

  function parseTokens(str) {
    const tokens = Object.create(null);
    const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
    let match;

    while ((match = tokensRE.exec(str))) {
      tokens[match[1]] = match[2];
    }

    return tokens;
  }

  const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

  function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
    if (utils$1.isFunction(filter)) {
      return filter.call(this, value, header);
    }

    if (isHeaderNameFilter) {
      value = header;
    }

    if (!utils$1.isString(value)) return;

    if (utils$1.isString(filter)) {
      return value.indexOf(filter) !== -1;
    }

    if (utils$1.isRegExp(filter)) {
      return filter.test(value);
    }
  }

  function formatHeader(header) {
    return header.trim()
      .toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
        return char.toUpperCase() + str;
      });
  }

  function buildAccessors(obj, header) {
    const accessorName = utils$1.toCamelCase(' ' + header);

    ['get', 'set', 'has'].forEach(methodName => {
      Object.defineProperty(obj, methodName + accessorName, {
        value: function(arg1, arg2, arg3) {
          return this[methodName].call(this, header, arg1, arg2, arg3);
        },
        configurable: true
      });
    });
  }

  let AxiosHeaders$1 = class AxiosHeaders {
    constructor(headers) {
      headers && this.set(headers);
    }

    set(header, valueOrRewrite, rewrite) {
      const self = this;

      function setHeader(_value, _header, _rewrite) {
        const lHeader = normalizeHeader(_header);

        if (!lHeader) {
          throw new Error('header name must be a non-empty string');
        }

        const key = utils$1.findKey(self, lHeader);

        if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
          self[key || _header] = normalizeValue(_value);
        }
      }

      const setHeaders = (headers, _rewrite) =>
        utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

      if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
        setHeaders(header, valueOrRewrite);
      } else if(utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
        setHeaders(parseHeaders(header), valueOrRewrite);
      } else if (utils$1.isHeaders(header)) {
        for (const [key, value] of header.entries()) {
          setHeader(value, key, rewrite);
        }
      } else {
        header != null && setHeader(valueOrRewrite, header, rewrite);
      }

      return this;
    }

    get(header, parser) {
      header = normalizeHeader(header);

      if (header) {
        const key = utils$1.findKey(this, header);

        if (key) {
          const value = this[key];

          if (!parser) {
            return value;
          }

          if (parser === true) {
            return parseTokens(value);
          }

          if (utils$1.isFunction(parser)) {
            return parser.call(this, value, key);
          }

          if (utils$1.isRegExp(parser)) {
            return parser.exec(value);
          }

          throw new TypeError('parser must be boolean|regexp|function');
        }
      }
    }

    has(header, matcher) {
      header = normalizeHeader(header);

      if (header) {
        const key = utils$1.findKey(this, header);

        return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
      }

      return false;
    }

    delete(header, matcher) {
      const self = this;
      let deleted = false;

      function deleteHeader(_header) {
        _header = normalizeHeader(_header);

        if (_header) {
          const key = utils$1.findKey(self, _header);

          if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
            delete self[key];

            deleted = true;
          }
        }
      }

      if (utils$1.isArray(header)) {
        header.forEach(deleteHeader);
      } else {
        deleteHeader(header);
      }

      return deleted;
    }

    clear(matcher) {
      const keys = Object.keys(this);
      let i = keys.length;
      let deleted = false;

      while (i--) {
        const key = keys[i];
        if(!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
          delete this[key];
          deleted = true;
        }
      }

      return deleted;
    }

    normalize(format) {
      const self = this;
      const headers = {};

      utils$1.forEach(this, (value, header) => {
        const key = utils$1.findKey(headers, header);

        if (key) {
          self[key] = normalizeValue(value);
          delete self[header];
          return;
        }

        const normalized = format ? formatHeader(header) : String(header).trim();

        if (normalized !== header) {
          delete self[header];
        }

        self[normalized] = normalizeValue(value);

        headers[normalized] = true;
      });

      return this;
    }

    concat(...targets) {
      return this.constructor.concat(this, ...targets);
    }

    toJSON(asStrings) {
      const obj = Object.create(null);

      utils$1.forEach(this, (value, header) => {
        value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(', ') : value);
      });

      return obj;
    }

    [Symbol.iterator]() {
      return Object.entries(this.toJSON())[Symbol.iterator]();
    }

    toString() {
      return Object.entries(this.toJSON()).map(([header, value]) => header + ': ' + value).join('\n');
    }

    get [Symbol.toStringTag]() {
      return 'AxiosHeaders';
    }

    static from(thing) {
      return thing instanceof this ? thing : new this(thing);
    }

    static concat(first, ...targets) {
      const computed = new this(first);

      targets.forEach((target) => computed.set(target));

      return computed;
    }

    static accessor(header) {
      const internals = this[$internals] = (this[$internals] = {
        accessors: {}
      });

      const accessors = internals.accessors;
      const prototype = this.prototype;

      function defineAccessor(_header) {
        const lHeader = normalizeHeader(_header);

        if (!accessors[lHeader]) {
          buildAccessors(prototype, _header);
          accessors[lHeader] = true;
        }
      }

      utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

      return this;
    }
  };

  AxiosHeaders$1.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);

  // reserved names hotfix
  utils$1.reduceDescriptors(AxiosHeaders$1.prototype, ({value}, key) => {
    let mapped = key[0].toUpperCase() + key.slice(1); // map `set` => `Set`
    return {
      get: () => value,
      set(headerValue) {
        this[mapped] = headerValue;
      }
    }
  });

  utils$1.freezeMethods(AxiosHeaders$1);

  /**
   * Transform the data for a request or a response
   *
   * @param {Array|Function} fns A single function or Array of functions
   * @param {?Object} response The response object
   *
   * @returns {*} The resulting transformed data
   */
  function transformData(fns, response) {
    const config = this || defaults;
    const context = response || config;
    const headers = AxiosHeaders$1.from(context.headers);
    let data = context.data;

    utils$1.forEach(fns, function transform(fn) {
      data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
    });

    headers.normalize();

    return data;
  }

  function isCancel$1(value) {
    return !!(value && value.__CANCEL__);
  }

  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  function CanceledError$1(message, config, request) {
    // eslint-disable-next-line no-eq-null,eqeqeq
    AxiosError$1.call(this, message == null ? 'canceled' : message, AxiosError$1.ERR_CANCELED, config, request);
    this.name = 'CanceledError';
  }

  utils$1.inherits(CanceledError$1, AxiosError$1, {
    __CANCEL__: true
  });

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   *
   * @returns {object} The response.
   */
  function settle(resolve, reject, response) {
    const validateStatus = response.config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(new AxiosError$1(
        'Request failed with status code ' + response.status,
        [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
        response.config,
        response.request,
        response
      ));
    }
  }

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   *
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */
  function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
  }

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   *
   * @returns {string} The combined URL
   */
  function combineURLs(baseURL, relativeURL) {
    return relativeURL
      ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '')
      : baseURL;
  }

  /**
   * Creates a new URL by combining the baseURL with the requestedURL,
   * only when the requestedURL is not already an absolute URL.
   * If the requestURL is absolute, this function returns the requestedURL untouched.
   *
   * @param {string} baseURL The base URL
   * @param {string} requestedURL Absolute or relative URL to combine
   *
   * @returns {string} The combined full path
   */
  function buildFullPath(baseURL, requestedURL) {
    if (baseURL && !isAbsoluteURL(requestedURL)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  }

  var parseUrl$1 = require$$0$1.parse;

  var DEFAULT_PORTS = {
    ftp: 21,
    gopher: 70,
    http: 80,
    https: 443,
    ws: 80,
    wss: 443,
  };

  var stringEndsWith = String.prototype.endsWith || function(s) {
    return s.length <= this.length &&
      this.indexOf(s, this.length - s.length) !== -1;
  };

  /**
   * @param {string|object} url - The URL, or the result from url.parse.
   * @return {string} The URL of the proxy that should handle the request to the
   *  given URL. If no proxy is set, this will be an empty string.
   */
  function getProxyForUrl(url) {
    var parsedUrl = typeof url === 'string' ? parseUrl$1(url) : url || {};
    var proto = parsedUrl.protocol;
    var hostname = parsedUrl.host;
    var port = parsedUrl.port;
    if (typeof hostname !== 'string' || !hostname || typeof proto !== 'string') {
      return '';  // Don't proxy URLs without a valid scheme or host.
    }

    proto = proto.split(':', 1)[0];
    // Stripping ports in this way instead of using parsedUrl.hostname to make
    // sure that the brackets around IPv6 addresses are kept.
    hostname = hostname.replace(/:\d*$/, '');
    port = parseInt(port) || DEFAULT_PORTS[proto] || 0;
    if (!shouldProxy(hostname, port)) {
      return '';  // Don't proxy URLs that match NO_PROXY.
    }

    var proxy =
      getEnv('npm_config_' + proto + '_proxy') ||
      getEnv(proto + '_proxy') ||
      getEnv('npm_config_proxy') ||
      getEnv('all_proxy');
    if (proxy && proxy.indexOf('://') === -1) {
      // Missing scheme in proxy, default to the requested URL's scheme.
      proxy = proto + '://' + proxy;
    }
    return proxy;
  }

  /**
   * Determines whether a given URL should be proxied.
   *
   * @param {string} hostname - The host name of the URL.
   * @param {number} port - The effective port of the URL.
   * @returns {boolean} Whether the given URL should be proxied.
   * @private
   */
  function shouldProxy(hostname, port) {
    var NO_PROXY =
      (getEnv('npm_config_no_proxy') || getEnv('no_proxy')).toLowerCase();
    if (!NO_PROXY) {
      return true;  // Always proxy if NO_PROXY is not set.
    }
    if (NO_PROXY === '*') {
      return false;  // Never proxy if wildcard is set.
    }

    return NO_PROXY.split(/[,\s]/).every(function(proxy) {
      if (!proxy) {
        return true;  // Skip zero-length hosts.
      }
      var parsedProxy = proxy.match(/^(.+):(\d+)$/);
      var parsedProxyHostname = parsedProxy ? parsedProxy[1] : proxy;
      var parsedProxyPort = parsedProxy ? parseInt(parsedProxy[2]) : 0;
      if (parsedProxyPort && parsedProxyPort !== port) {
        return true;  // Skip if ports don't match.
      }

      if (!/^[.*]/.test(parsedProxyHostname)) {
        // No wildcards, so stop proxying if there is an exact match.
        return hostname !== parsedProxyHostname;
      }

      if (parsedProxyHostname.charAt(0) === '*') {
        // Remove leading wildcard.
        parsedProxyHostname = parsedProxyHostname.slice(1);
      }
      // Stop proxying if the hostname ends with the no_proxy host.
      return !stringEndsWith.call(hostname, parsedProxyHostname);
    });
  }

  /**
   * Get the value for an environment variable.
   *
   * @param {string} key - The name of the environment variable.
   * @return {string} The value of the environment variable.
   * @private
   */
  function getEnv(key) {
    return browser$1$1.env[key.toLowerCase()] || browser$1$1.env[key.toUpperCase()] || '';
  }

  var getProxyForUrl_1 = getProxyForUrl;

  var followRedirects = {exports: {}};

  function compare(a, b) {
    if (a === b) {
      return 0;
    }

    var x = a.length;
    var y = b.length;

    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
      if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break;
      }
    }

    if (x < y) {
      return -1;
    }
    if (y < x) {
      return 1;
    }
    return 0;
  }
  var hasOwn = Object.prototype.hasOwnProperty;

  var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) {
      if (hasOwn.call(obj, key)) keys.push(key);
    }
    return keys;
  };
  var pSlice = Array.prototype.slice;
  var _functionsHaveNames;
  function functionsHaveNames() {
    if (typeof _functionsHaveNames !== 'undefined') {
      return _functionsHaveNames;
    }
    return _functionsHaveNames = (function () {
      return function foo() {}.name === 'foo';
    }());
  }
  function pToString (obj) {
    return Object.prototype.toString.call(obj);
  }
  function isView(arrbuf) {
    if (isBuffer$2(arrbuf)) {
      return false;
    }
    if (typeof global$1.ArrayBuffer !== 'function') {
      return false;
    }
    if (typeof ArrayBuffer.isView === 'function') {
      return ArrayBuffer.isView(arrbuf);
    }
    if (!arrbuf) {
      return false;
    }
    if (arrbuf instanceof DataView) {
      return true;
    }
    if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
      return true;
    }
    return false;
  }
  // 1. The assert module provides functions that throw
  // AssertionError's when particular conditions are not met. The
  // assert module must conform to the following interface.

  function assert$2(value, message) {
    if (!value) fail(value, true, message, '==', ok);
  }

  // 2. The AssertionError is defined in assert.
  // new assert.AssertionError({ message: message,
  //                             actual: actual,
  //                             expected: expected })

  var regex = /\s*function\s+([^\(\s]*)\s*/;
  // based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
  function getName(func) {
    if (!isFunction$2(func)) {
      return;
    }
    if (functionsHaveNames()) {
      return func.name;
    }
    var str = func.toString();
    var match = str.match(regex);
    return match && match[1];
  }
  assert$2.AssertionError = AssertionError;
  function AssertionError(options) {
    this.name = 'AssertionError';
    this.actual = options.actual;
    this.expected = options.expected;
    this.operator = options.operator;
    if (options.message) {
      this.message = options.message;
      this.generatedMessage = false;
    } else {
      this.message = getMessage(this);
      this.generatedMessage = true;
    }
    var stackStartFunction = options.stackStartFunction || fail;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, stackStartFunction);
    } else {
      // non v8 browsers so we can have a stacktrace
      var err = new Error();
      if (err.stack) {
        var out = err.stack;

        // try to strip useless frames
        var fn_name = getName(stackStartFunction);
        var idx = out.indexOf('\n' + fn_name);
        if (idx >= 0) {
          // once we have located the function frame
          // we need to strip out everything before it (and its line)
          var next_line = out.indexOf('\n', idx + 1);
          out = out.substring(next_line + 1);
        }

        this.stack = out;
      }
    }
  }

  // assert.AssertionError instanceof Error
  inherits(AssertionError, Error);

  function truncate(s, n) {
    if (typeof s === 'string') {
      return s.length < n ? s : s.slice(0, n);
    } else {
      return s;
    }
  }
  function inspect(something) {
    if (functionsHaveNames() || !isFunction$2(something)) {
      return inspect$1(something);
    }
    var rawname = getName(something);
    var name = rawname ? ': ' + rawname : '';
    return '[Function' +  name + ']';
  }
  function getMessage(self) {
    return truncate(inspect(self.actual), 128) + ' ' +
           self.operator + ' ' +
           truncate(inspect(self.expected), 128);
  }

  // At present only the three keys mentioned above are used and
  // understood by the spec. Implementations or sub modules can pass
  // other keys to the AssertionError's constructor - they will be
  // ignored.

  // 3. All of the following functions must throw an AssertionError
  // when a corresponding condition is not met, with a message that
  // may be undefined if not provided.  All assertion methods provide
  // both the actual and expected values to the assertion error for
  // display purposes.

  function fail(actual, expected, message, operator, stackStartFunction) {
    throw new AssertionError({
      message: message,
      actual: actual,
      expected: expected,
      operator: operator,
      stackStartFunction: stackStartFunction
    });
  }

  // EXTENSION! allows for well behaved errors defined elsewhere.
  assert$2.fail = fail;

  // 4. Pure assertion tests whether a value is truthy, as determined
  // by !!guard.
  // assert.ok(guard, message_opt);
  // This statement is equivalent to assert.equal(true, !!guard,
  // message_opt);. To test strictly for the value true, use
  // assert.strictEqual(true, guard, message_opt);.

  function ok(value, message) {
    if (!value) fail(value, true, message, '==', ok);
  }
  assert$2.ok = ok;

  // 5. The equality assertion tests shallow, coercive equality with
  // ==.
  // assert.equal(actual, expected, message_opt);
  assert$2.equal = equal;
  function equal(actual, expected, message) {
    if (actual != expected) fail(actual, expected, message, '==', equal);
  }

  // 6. The non-equality assertion tests for whether two objects are not equal
  // with != assert.notEqual(actual, expected, message_opt);
  assert$2.notEqual = notEqual;
  function notEqual(actual, expected, message) {
    if (actual == expected) {
      fail(actual, expected, message, '!=', notEqual);
    }
  }

  // 7. The equivalence assertion tests a deep equality relation.
  // assert.deepEqual(actual, expected, message_opt);
  assert$2.deepEqual = deepEqual;
  function deepEqual(actual, expected, message) {
    if (!_deepEqual(actual, expected, false)) {
      fail(actual, expected, message, 'deepEqual', deepEqual);
    }
  }
  assert$2.deepStrictEqual = deepStrictEqual;
  function deepStrictEqual(actual, expected, message) {
    if (!_deepEqual(actual, expected, true)) {
      fail(actual, expected, message, 'deepStrictEqual', deepStrictEqual);
    }
  }

  function _deepEqual(actual, expected, strict, memos) {
    // 7.1. All identical values are equivalent, as determined by ===.
    if (actual === expected) {
      return true;
    } else if (isBuffer$2(actual) && isBuffer$2(expected)) {
      return compare(actual, expected) === 0;

    // 7.2. If the expected value is a Date object, the actual value is
    // equivalent if it is also a Date object that refers to the same time.
    } else if (isDate(actual) && isDate(expected)) {
      return actual.getTime() === expected.getTime();

    // 7.3 If the expected value is a RegExp object, the actual value is
    // equivalent if it is also a RegExp object with the same source and
    // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
    } else if (isRegExp(actual) && isRegExp(expected)) {
      return actual.source === expected.source &&
             actual.global === expected.global &&
             actual.multiline === expected.multiline &&
             actual.lastIndex === expected.lastIndex &&
             actual.ignoreCase === expected.ignoreCase;

    // 7.4. Other pairs that do not both pass typeof value == 'object',
    // equivalence is determined by ==.
    } else if ((actual === null || typeof actual !== 'object') &&
               (expected === null || typeof expected !== 'object')) {
      return strict ? actual === expected : actual == expected;

    // If both values are instances of typed arrays, wrap their underlying
    // ArrayBuffers in a Buffer each to increase performance
    // This optimization requires the arrays to have the same type as checked by
    // Object.prototype.toString (aka pToString). Never perform binary
    // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
    // bit patterns are not identical.
    } else if (isView(actual) && isView(expected) &&
               pToString(actual) === pToString(expected) &&
               !(actual instanceof Float32Array ||
                 actual instanceof Float64Array)) {
      return compare(new Uint8Array(actual.buffer),
                     new Uint8Array(expected.buffer)) === 0;

    // 7.5 For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical 'prototype' property. Note: this
    // accounts for both named and indexed properties on Arrays.
    } else if (isBuffer$2(actual) !== isBuffer$2(expected)) {
      return false;
    } else {
      memos = memos || {actual: [], expected: []};

      var actualIndex = memos.actual.indexOf(actual);
      if (actualIndex !== -1) {
        if (actualIndex === memos.expected.indexOf(expected)) {
          return true;
        }
      }

      memos.actual.push(actual);
      memos.expected.push(expected);

      return objEquiv(actual, expected, strict, memos);
    }
  }

  function isArguments(object) {
    return Object.prototype.toString.call(object) == '[object Arguments]';
  }

  function objEquiv(a, b, strict, actualVisitedObjects) {
    if (a === null || a === undefined || b === null || b === undefined)
      return false;
    // if one is a primitive, the other must be same
    if (isPrimitive(a) || isPrimitive(b))
      return a === b;
    if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
      return false;
    var aIsArgs = isArguments(a);
    var bIsArgs = isArguments(b);
    if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
      return false;
    if (aIsArgs) {
      a = pSlice.call(a);
      b = pSlice.call(b);
      return _deepEqual(a, b, strict);
    }
    var ka = objectKeys(a);
    var kb = objectKeys(b);
    var key, i;
    // having the same number of owned properties (keys incorporates
    // hasOwnProperty)
    if (ka.length !== kb.length)
      return false;
    //the same set of keys (although not necessarily the same order),
    ka.sort();
    kb.sort();
    //~~~cheap key test
    for (i = ka.length - 1; i >= 0; i--) {
      if (ka[i] !== kb[i])
        return false;
    }
    //equivalent values for every corresponding key, and
    //~~~possibly expensive deep test
    for (i = ka.length - 1; i >= 0; i--) {
      key = ka[i];
      if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
        return false;
    }
    return true;
  }

  // 8. The non-equivalence assertion tests for any deep inequality.
  // assert.notDeepEqual(actual, expected, message_opt);
  assert$2.notDeepEqual = notDeepEqual;
  function notDeepEqual(actual, expected, message) {
    if (_deepEqual(actual, expected, false)) {
      fail(actual, expected, message, 'notDeepEqual', notDeepEqual);
    }
  }

  assert$2.notDeepStrictEqual = notDeepStrictEqual;
  function notDeepStrictEqual(actual, expected, message) {
    if (_deepEqual(actual, expected, true)) {
      fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
    }
  }


  // 9. The strict equality assertion tests strict equality, as determined by ===.
  // assert.strictEqual(actual, expected, message_opt);
  assert$2.strictEqual = strictEqual;
  function strictEqual(actual, expected, message) {
    if (actual !== expected) {
      fail(actual, expected, message, '===', strictEqual);
    }
  }

  // 10. The strict non-equality assertion tests for strict inequality, as
  // determined by !==.  assert.notStrictEqual(actual, expected, message_opt);
  assert$2.notStrictEqual = notStrictEqual;
  function notStrictEqual(actual, expected, message) {
    if (actual === expected) {
      fail(actual, expected, message, '!==', notStrictEqual);
    }
  }

  function expectedException(actual, expected) {
    if (!actual || !expected) {
      return false;
    }

    if (Object.prototype.toString.call(expected) == '[object RegExp]') {
      return expected.test(actual);
    }

    try {
      if (actual instanceof expected) {
        return true;
      }
    } catch (e) {
      // Ignore.  The instanceof check doesn't work for arrow functions.
    }

    if (Error.isPrototypeOf(expected)) {
      return false;
    }

    return expected.call({}, actual) === true;
  }

  function _tryBlock(block) {
    var error;
    try {
      block();
    } catch (e) {
      error = e;
    }
    return error;
  }

  function _throws(shouldThrow, block, expected, message) {
    var actual;

    if (typeof block !== 'function') {
      throw new TypeError('"block" argument must be a function');
    }

    if (typeof expected === 'string') {
      message = expected;
      expected = null;
    }

    actual = _tryBlock(block);

    message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
              (message ? ' ' + message : '.');

    if (shouldThrow && !actual) {
      fail(actual, expected, 'Missing expected exception' + message);
    }

    var userProvidedMessage = typeof message === 'string';
    var isUnwantedException = !shouldThrow && isError(actual);
    var isUnexpectedException = !shouldThrow && actual && !expected;

    if ((isUnwantedException &&
        userProvidedMessage &&
        expectedException(actual, expected)) ||
        isUnexpectedException) {
      fail(actual, expected, 'Got unwanted exception' + message);
    }

    if ((shouldThrow && actual && expected &&
        !expectedException(actual, expected)) || (!shouldThrow && actual)) {
      throw actual;
    }
  }

  // 11. Expected to throw an error:
  // assert.throws(block, Error_opt, message_opt);
  assert$2.throws = throws;
  function throws(block, /*optional*/error, /*optional*/message) {
    _throws(true, block, error, message);
  }

  // EXTENSION! This is annoying to write outside this module.
  assert$2.doesNotThrow = doesNotThrow;
  function doesNotThrow(block, /*optional*/error, /*optional*/message) {
    _throws(false, block, error, message);
  }

  assert$2.ifError = ifError;
  function ifError(err) {
    if (err) throw err;
  }

  var _polyfillNode_assert = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AssertionError: AssertionError,
    assert: ok,
    deepEqual: deepEqual,
    deepStrictEqual: deepStrictEqual,
    default: assert$2,
    doesNotThrow: doesNotThrow,
    equal: equal,
    fail: fail,
    ifError: ifError,
    notDeepEqual: notDeepEqual,
    notDeepStrictEqual: notDeepStrictEqual,
    notEqual: notEqual,
    notStrictEqual: notStrictEqual,
    ok: ok,
    strictEqual: strictEqual,
    throws: throws
  });

  var require$$4 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_assert);

  var browser = {exports: {}};

  /**
   * Helpers.
   */

  var ms;
  var hasRequiredMs;

  function requireMs () {
  	if (hasRequiredMs) return ms;
  	hasRequiredMs = 1;
  	var s = 1000;
  	var m = s * 60;
  	var h = m * 60;
  	var d = h * 24;
  	var w = d * 7;
  	var y = d * 365.25;

  	/**
  	 * Parse or format the given `val`.
  	 *
  	 * Options:
  	 *
  	 *  - `long` verbose formatting [false]
  	 *
  	 * @param {String|Number} val
  	 * @param {Object} [options]
  	 * @throws {Error} throw an error if val is not a non-empty string or a number
  	 * @return {String|Number}
  	 * @api public
  	 */

  	ms = function (val, options) {
  	  options = options || {};
  	  var type = typeof val;
  	  if (type === 'string' && val.length > 0) {
  	    return parse(val);
  	  } else if (type === 'number' && isFinite(val)) {
  	    return options.long ? fmtLong(val) : fmtShort(val);
  	  }
  	  throw new Error(
  	    'val is not a non-empty string or a valid number. val=' +
  	      JSON.stringify(val)
  	  );
  	};

  	/**
  	 * Parse the given `str` and return milliseconds.
  	 *
  	 * @param {String} str
  	 * @return {Number}
  	 * @api private
  	 */

  	function parse(str) {
  	  str = String(str);
  	  if (str.length > 100) {
  	    return;
  	  }
  	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
  	    str
  	  );
  	  if (!match) {
  	    return;
  	  }
  	  var n = parseFloat(match[1]);
  	  var type = (match[2] || 'ms').toLowerCase();
  	  switch (type) {
  	    case 'years':
  	    case 'year':
  	    case 'yrs':
  	    case 'yr':
  	    case 'y':
  	      return n * y;
  	    case 'weeks':
  	    case 'week':
  	    case 'w':
  	      return n * w;
  	    case 'days':
  	    case 'day':
  	    case 'd':
  	      return n * d;
  	    case 'hours':
  	    case 'hour':
  	    case 'hrs':
  	    case 'hr':
  	    case 'h':
  	      return n * h;
  	    case 'minutes':
  	    case 'minute':
  	    case 'mins':
  	    case 'min':
  	    case 'm':
  	      return n * m;
  	    case 'seconds':
  	    case 'second':
  	    case 'secs':
  	    case 'sec':
  	    case 's':
  	      return n * s;
  	    case 'milliseconds':
  	    case 'millisecond':
  	    case 'msecs':
  	    case 'msec':
  	    case 'ms':
  	      return n;
  	    default:
  	      return undefined;
  	  }
  	}

  	/**
  	 * Short format for `ms`.
  	 *
  	 * @param {Number} ms
  	 * @return {String}
  	 * @api private
  	 */

  	function fmtShort(ms) {
  	  var msAbs = Math.abs(ms);
  	  if (msAbs >= d) {
  	    return Math.round(ms / d) + 'd';
  	  }
  	  if (msAbs >= h) {
  	    return Math.round(ms / h) + 'h';
  	  }
  	  if (msAbs >= m) {
  	    return Math.round(ms / m) + 'm';
  	  }
  	  if (msAbs >= s) {
  	    return Math.round(ms / s) + 's';
  	  }
  	  return ms + 'ms';
  	}

  	/**
  	 * Long format for `ms`.
  	 *
  	 * @param {Number} ms
  	 * @return {String}
  	 * @api private
  	 */

  	function fmtLong(ms) {
  	  var msAbs = Math.abs(ms);
  	  if (msAbs >= d) {
  	    return plural(ms, msAbs, d, 'day');
  	  }
  	  if (msAbs >= h) {
  	    return plural(ms, msAbs, h, 'hour');
  	  }
  	  if (msAbs >= m) {
  	    return plural(ms, msAbs, m, 'minute');
  	  }
  	  if (msAbs >= s) {
  	    return plural(ms, msAbs, s, 'second');
  	  }
  	  return ms + ' ms';
  	}

  	/**
  	 * Pluralization helper.
  	 */

  	function plural(ms, msAbs, n, name) {
  	  var isPlural = msAbs >= n * 1.5;
  	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
  	}
  	return ms;
  }

  var common;
  var hasRequiredCommon;

  function requireCommon () {
  	if (hasRequiredCommon) return common;
  	hasRequiredCommon = 1;
  	/**
  	 * This is the common logic for both the Node.js and web browser
  	 * implementations of `debug()`.
  	 */

  	function setup(env) {
  		createDebug.debug = createDebug;
  		createDebug.default = createDebug;
  		createDebug.coerce = coerce;
  		createDebug.disable = disable;
  		createDebug.enable = enable;
  		createDebug.enabled = enabled;
  		createDebug.humanize = requireMs();
  		createDebug.destroy = destroy;

  		Object.keys(env).forEach(key => {
  			createDebug[key] = env[key];
  		});

  		/**
  		* The currently active debug mode names, and names to skip.
  		*/

  		createDebug.names = [];
  		createDebug.skips = [];

  		/**
  		* Map of special "%n" handling functions, for the debug "format" argument.
  		*
  		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
  		*/
  		createDebug.formatters = {};

  		/**
  		* Selects a color for a debug namespace
  		* @param {String} namespace The namespace string for the debug instance to be colored
  		* @return {Number|String} An ANSI color code for the given namespace
  		* @api private
  		*/
  		function selectColor(namespace) {
  			let hash = 0;

  			for (let i = 0; i < namespace.length; i++) {
  				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
  				hash |= 0; // Convert to 32bit integer
  			}

  			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  		}
  		createDebug.selectColor = selectColor;

  		/**
  		* Create a debugger with the given `namespace`.
  		*
  		* @param {String} namespace
  		* @return {Function}
  		* @api public
  		*/
  		function createDebug(namespace) {
  			let prevTime;
  			let enableOverride = null;
  			let namespacesCache;
  			let enabledCache;

  			function debug(...args) {
  				// Disabled?
  				if (!debug.enabled) {
  					return;
  				}

  				const self = debug;

  				// Set `diff` timestamp
  				const curr = Number(new Date());
  				const ms = curr - (prevTime || curr);
  				self.diff = ms;
  				self.prev = prevTime;
  				self.curr = curr;
  				prevTime = curr;

  				args[0] = createDebug.coerce(args[0]);

  				if (typeof args[0] !== 'string') {
  					// Anything else let's inspect with %O
  					args.unshift('%O');
  				}

  				// Apply any `formatters` transformations
  				let index = 0;
  				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
  					// If we encounter an escaped % then don't increase the array index
  					if (match === '%%') {
  						return '%';
  					}
  					index++;
  					const formatter = createDebug.formatters[format];
  					if (typeof formatter === 'function') {
  						const val = args[index];
  						match = formatter.call(self, val);

  						// Now we need to remove `args[index]` since it's inlined in the `format`
  						args.splice(index, 1);
  						index--;
  					}
  					return match;
  				});

  				// Apply env-specific formatting (colors, etc.)
  				createDebug.formatArgs.call(self, args);

  				const logFn = self.log || createDebug.log;
  				logFn.apply(self, args);
  			}

  			debug.namespace = namespace;
  			debug.useColors = createDebug.useColors();
  			debug.color = createDebug.selectColor(namespace);
  			debug.extend = extend;
  			debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

  			Object.defineProperty(debug, 'enabled', {
  				enumerable: true,
  				configurable: false,
  				get: () => {
  					if (enableOverride !== null) {
  						return enableOverride;
  					}
  					if (namespacesCache !== createDebug.namespaces) {
  						namespacesCache = createDebug.namespaces;
  						enabledCache = createDebug.enabled(namespace);
  					}

  					return enabledCache;
  				},
  				set: v => {
  					enableOverride = v;
  				}
  			});

  			// Env-specific initialization logic for debug instances
  			if (typeof createDebug.init === 'function') {
  				createDebug.init(debug);
  			}

  			return debug;
  		}

  		function extend(namespace, delimiter) {
  			const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
  			newDebug.log = this.log;
  			return newDebug;
  		}

  		/**
  		* Enables a debug mode by namespaces. This can include modes
  		* separated by a colon and wildcards.
  		*
  		* @param {String} namespaces
  		* @api public
  		*/
  		function enable(namespaces) {
  			createDebug.save(namespaces);
  			createDebug.namespaces = namespaces;

  			createDebug.names = [];
  			createDebug.skips = [];

  			let i;
  			const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  			const len = split.length;

  			for (i = 0; i < len; i++) {
  				if (!split[i]) {
  					// ignore empty strings
  					continue;
  				}

  				namespaces = split[i].replace(/\*/g, '.*?');

  				if (namespaces[0] === '-') {
  					createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
  				} else {
  					createDebug.names.push(new RegExp('^' + namespaces + '$'));
  				}
  			}
  		}

  		/**
  		* Disable debug output.
  		*
  		* @return {String} namespaces
  		* @api public
  		*/
  		function disable() {
  			const namespaces = [
  				...createDebug.names.map(toNamespace),
  				...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
  			].join(',');
  			createDebug.enable('');
  			return namespaces;
  		}

  		/**
  		* Returns true if the given mode name is enabled, false otherwise.
  		*
  		* @param {String} name
  		* @return {Boolean}
  		* @api public
  		*/
  		function enabled(name) {
  			if (name[name.length - 1] === '*') {
  				return true;
  			}

  			let i;
  			let len;

  			for (i = 0, len = createDebug.skips.length; i < len; i++) {
  				if (createDebug.skips[i].test(name)) {
  					return false;
  				}
  			}

  			for (i = 0, len = createDebug.names.length; i < len; i++) {
  				if (createDebug.names[i].test(name)) {
  					return true;
  				}
  			}

  			return false;
  		}

  		/**
  		* Convert regexp to namespace
  		*
  		* @param {RegExp} regxep
  		* @return {String} namespace
  		* @api private
  		*/
  		function toNamespace(regexp) {
  			return regexp.toString()
  				.substring(2, regexp.toString().length - 2)
  				.replace(/\.\*\?$/, '*');
  		}

  		/**
  		* Coerce `val`.
  		*
  		* @param {Mixed} val
  		* @return {Mixed}
  		* @api private
  		*/
  		function coerce(val) {
  			if (val instanceof Error) {
  				return val.stack || val.message;
  			}
  			return val;
  		}

  		/**
  		* XXX DO NOT USE. This is a temporary stub function.
  		* XXX It WILL be removed in the next major release.
  		*/
  		function destroy() {
  			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
  		}

  		createDebug.enable(createDebug.load());

  		return createDebug;
  	}

  	common = setup;
  	return common;
  }

  var hasRequiredBrowser;

  function requireBrowser () {
  	if (hasRequiredBrowser) return browser.exports;
  	hasRequiredBrowser = 1;
  	(function (module, exports) {
  		/**
  		 * This is the web browser implementation of `debug()`.
  		 */

  		exports.formatArgs = formatArgs;
  		exports.save = save;
  		exports.load = load;
  		exports.useColors = useColors;
  		exports.storage = localstorage();
  		exports.destroy = (() => {
  			let warned = false;

  			return () => {
  				if (!warned) {
  					warned = true;
  					console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
  				}
  			};
  		})();

  		/**
  		 * Colors.
  		 */

  		exports.colors = [
  			'#0000CC',
  			'#0000FF',
  			'#0033CC',
  			'#0033FF',
  			'#0066CC',
  			'#0066FF',
  			'#0099CC',
  			'#0099FF',
  			'#00CC00',
  			'#00CC33',
  			'#00CC66',
  			'#00CC99',
  			'#00CCCC',
  			'#00CCFF',
  			'#3300CC',
  			'#3300FF',
  			'#3333CC',
  			'#3333FF',
  			'#3366CC',
  			'#3366FF',
  			'#3399CC',
  			'#3399FF',
  			'#33CC00',
  			'#33CC33',
  			'#33CC66',
  			'#33CC99',
  			'#33CCCC',
  			'#33CCFF',
  			'#6600CC',
  			'#6600FF',
  			'#6633CC',
  			'#6633FF',
  			'#66CC00',
  			'#66CC33',
  			'#9900CC',
  			'#9900FF',
  			'#9933CC',
  			'#9933FF',
  			'#99CC00',
  			'#99CC33',
  			'#CC0000',
  			'#CC0033',
  			'#CC0066',
  			'#CC0099',
  			'#CC00CC',
  			'#CC00FF',
  			'#CC3300',
  			'#CC3333',
  			'#CC3366',
  			'#CC3399',
  			'#CC33CC',
  			'#CC33FF',
  			'#CC6600',
  			'#CC6633',
  			'#CC9900',
  			'#CC9933',
  			'#CCCC00',
  			'#CCCC33',
  			'#FF0000',
  			'#FF0033',
  			'#FF0066',
  			'#FF0099',
  			'#FF00CC',
  			'#FF00FF',
  			'#FF3300',
  			'#FF3333',
  			'#FF3366',
  			'#FF3399',
  			'#FF33CC',
  			'#FF33FF',
  			'#FF6600',
  			'#FF6633',
  			'#FF9900',
  			'#FF9933',
  			'#FFCC00',
  			'#FFCC33'
  		];

  		/**
  		 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
  		 * and the Firebug extension (any Firefox version) are known
  		 * to support "%c" CSS customizations.
  		 *
  		 * TODO: add a `localStorage` variable to explicitly enable/disable colors
  		 */

  		// eslint-disable-next-line complexity
  		function useColors() {
  			// NB: In an Electron preload script, document will be defined but not fully
  			// initialized. Since we know we're in Chrome, we'll just detect this case
  			// explicitly
  			if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
  				return true;
  			}

  			// Internet Explorer and Edge do not support colors.
  			if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
  				return false;
  			}

  			let m;

  			// Is webkit? http://stackoverflow.com/a/16459606/376773
  			// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  			return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
  				// Is firebug? http://stackoverflow.com/a/398120/376773
  				(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
  				// Is firefox >= v31?
  				// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  				(typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31) ||
  				// Double check webkit in userAgent just in case we are in a worker
  				(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
  		}

  		/**
  		 * Colorize log arguments if enabled.
  		 *
  		 * @api public
  		 */

  		function formatArgs(args) {
  			args[0] = (this.useColors ? '%c' : '') +
  				this.namespace +
  				(this.useColors ? ' %c' : ' ') +
  				args[0] +
  				(this.useColors ? '%c ' : ' ') +
  				'+' + module.exports.humanize(this.diff);

  			if (!this.useColors) {
  				return;
  			}

  			const c = 'color: ' + this.color;
  			args.splice(1, 0, c, 'color: inherit');

  			// The final "%c" is somewhat tricky, because there could be other
  			// arguments passed either before or after the %c, so we need to
  			// figure out the correct index to insert the CSS into
  			let index = 0;
  			let lastC = 0;
  			args[0].replace(/%[a-zA-Z%]/g, match => {
  				if (match === '%%') {
  					return;
  				}
  				index++;
  				if (match === '%c') {
  					// We only are interested in the *last* %c
  					// (the user may have provided their own)
  					lastC = index;
  				}
  			});

  			args.splice(lastC, 0, c);
  		}

  		/**
  		 * Invokes `console.debug()` when available.
  		 * No-op when `console.debug` is not a "function".
  		 * If `console.debug` is not available, falls back
  		 * to `console.log`.
  		 *
  		 * @api public
  		 */
  		exports.log = console.debug || console.log || (() => {});

  		/**
  		 * Save `namespaces`.
  		 *
  		 * @param {String} namespaces
  		 * @api private
  		 */
  		function save(namespaces) {
  			try {
  				if (namespaces) {
  					exports.storage.setItem('debug', namespaces);
  				} else {
  					exports.storage.removeItem('debug');
  				}
  			} catch (error) {
  				// Swallow
  				// XXX (@Qix-) should we be logging these?
  			}
  		}

  		/**
  		 * Load `namespaces`.
  		 *
  		 * @return {String} returns the previously persisted debug modes
  		 * @api private
  		 */
  		function load() {
  			let r;
  			try {
  				r = exports.storage.getItem('debug');
  			} catch (error) {
  				// Swallow
  				// XXX (@Qix-) should we be logging these?
  			}

  			// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  			if (!r && typeof browser$1$1 !== 'undefined' && 'env' in browser$1$1) {
  				r = browser$1$1.env.DEBUG;
  			}

  			return r;
  		}

  		/**
  		 * Localstorage attempts to return the localstorage.
  		 *
  		 * This is necessary because safari throws
  		 * when a user disables cookies/localstorage
  		 * and you attempt to access it.
  		 *
  		 * @return {LocalStorage}
  		 * @api private
  		 */

  		function localstorage() {
  			try {
  				// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
  				// The Browser also has localStorage in the global context.
  				return localStorage;
  			} catch (error) {
  				// Swallow
  				// XXX (@Qix-) should we be logging these?
  			}
  		}

  		module.exports = requireCommon()(exports);

  		const {formatters} = module.exports;

  		/**
  		 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
  		 */

  		formatters.j = function (v) {
  			try {
  				return JSON.stringify(v);
  			} catch (error) {
  				return '[UnexpectedJSONParseError]: ' + error.message;
  			}
  		}; 
  	} (browser, browser.exports));
  	return browser.exports;
  }

  var debug$1;

  var debug_1 = function () {
    if (!debug$1) {
      try {
        /* eslint global-require: off */
        debug$1 = requireBrowser()("follow-redirects");
      }
      catch (error) { /* */ }
      if (typeof debug$1 !== "function") {
        debug$1 = function () { /* */ };
      }
    }
    debug$1.apply(null, arguments);
  };

  var url = require$$0$1;
  var URL$1 = url.URL;
  var http = require$$1;
  var https = require$$2;
  var Writable = require$$3.Writable;
  var assert$1 = require$$4;
  var debug = debug_1;

  // Whether to use the native URL object or the legacy url module
  var useNativeURL = false;
  try {
    assert$1(new URL$1());
  }
  catch (error) {
    useNativeURL = error.code === "ERR_INVALID_URL";
  }

  // URL fields to preserve in copy operations
  var preservedUrlFields = [
    "auth",
    "host",
    "hostname",
    "href",
    "path",
    "pathname",
    "port",
    "protocol",
    "query",
    "search",
    "hash",
  ];

  // Create handlers that pass events from native requests
  var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
  var eventHandlers = Object.create(null);
  events.forEach(function (event) {
    eventHandlers[event] = function (arg1, arg2, arg3) {
      this._redirectable.emit(event, arg1, arg2, arg3);
    };
  });

  // Error types with codes
  var InvalidUrlError = createErrorType(
    "ERR_INVALID_URL",
    "Invalid URL",
    TypeError
  );
  var RedirectionError = createErrorType(
    "ERR_FR_REDIRECTION_FAILURE",
    "Redirected request failed"
  );
  var TooManyRedirectsError = createErrorType(
    "ERR_FR_TOO_MANY_REDIRECTS",
    "Maximum number of redirects exceeded",
    RedirectionError
  );
  var MaxBodyLengthExceededError = createErrorType(
    "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
    "Request body larger than maxBodyLength limit"
  );
  var WriteAfterEndError = createErrorType(
    "ERR_STREAM_WRITE_AFTER_END",
    "write after end"
  );

  // istanbul ignore next
  var destroy = Writable.prototype.destroy || noop;

  // An HTTP(S) request that can be redirected
  function RedirectableRequest(options, responseCallback) {
    // Initialize the request
    Writable.call(this);
    this._sanitizeOptions(options);
    this._options = options;
    this._ended = false;
    this._ending = false;
    this._redirectCount = 0;
    this._redirects = [];
    this._requestBodyLength = 0;
    this._requestBodyBuffers = [];

    // Attach a callback if passed
    if (responseCallback) {
      this.on("response", responseCallback);
    }

    // React to responses of native requests
    var self = this;
    this._onNativeResponse = function (response) {
      try {
        self._processResponse(response);
      }
      catch (cause) {
        self.emit("error", cause instanceof RedirectionError ?
          cause : new RedirectionError({ cause: cause }));
      }
    };

    // Perform the first request
    this._performRequest();
  }
  RedirectableRequest.prototype = Object.create(Writable.prototype);

  RedirectableRequest.prototype.abort = function () {
    destroyRequest(this._currentRequest);
    this._currentRequest.abort();
    this.emit("abort");
  };

  RedirectableRequest.prototype.destroy = function (error) {
    destroyRequest(this._currentRequest, error);
    destroy.call(this, error);
    return this;
  };

  // Writes buffered data to the current native request
  RedirectableRequest.prototype.write = function (data, encoding, callback) {
    // Writing is not allowed if end has been called
    if (this._ending) {
      throw new WriteAfterEndError();
    }

    // Validate input and shift parameters if necessary
    if (!isString(data) && !isBuffer(data)) {
      throw new TypeError("data should be a string, Buffer or Uint8Array");
    }
    if (isFunction(encoding)) {
      callback = encoding;
      encoding = null;
    }

    // Ignore empty buffers, since writing them doesn't invoke the callback
    // https://github.com/nodejs/node/issues/22066
    if (data.length === 0) {
      if (callback) {
        callback();
      }
      return;
    }
    // Only write when we don't exceed the maximum body length
    if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
      this._requestBodyLength += data.length;
      this._requestBodyBuffers.push({ data: data, encoding: encoding });
      this._currentRequest.write(data, encoding, callback);
    }
    // Error when we exceed the maximum body length
    else {
      this.emit("error", new MaxBodyLengthExceededError());
      this.abort();
    }
  };

  // Ends the current native request
  RedirectableRequest.prototype.end = function (data, encoding, callback) {
    // Shift parameters if necessary
    if (isFunction(data)) {
      callback = data;
      data = encoding = null;
    }
    else if (isFunction(encoding)) {
      callback = encoding;
      encoding = null;
    }

    // Write data if needed and end
    if (!data) {
      this._ended = this._ending = true;
      this._currentRequest.end(null, null, callback);
    }
    else {
      var self = this;
      var currentRequest = this._currentRequest;
      this.write(data, encoding, function () {
        self._ended = true;
        currentRequest.end(null, null, callback);
      });
      this._ending = true;
    }
  };

  // Sets a header value on the current native request
  RedirectableRequest.prototype.setHeader = function (name, value) {
    this._options.headers[name] = value;
    this._currentRequest.setHeader(name, value);
  };

  // Clears a header value on the current native request
  RedirectableRequest.prototype.removeHeader = function (name) {
    delete this._options.headers[name];
    this._currentRequest.removeHeader(name);
  };

  // Global timeout for all underlying requests
  RedirectableRequest.prototype.setTimeout = function (msecs, callback) {
    var self = this;

    // Destroys the socket on timeout
    function destroyOnTimeout(socket) {
      socket.setTimeout(msecs);
      socket.removeListener("timeout", socket.destroy);
      socket.addListener("timeout", socket.destroy);
    }

    // Sets up a timer to trigger a timeout event
    function startTimer(socket) {
      if (self._timeout) {
        clearTimeout(self._timeout);
      }
      self._timeout = setTimeout(function () {
        self.emit("timeout");
        clearTimer();
      }, msecs);
      destroyOnTimeout(socket);
    }

    // Stops a timeout from triggering
    function clearTimer() {
      // Clear the timeout
      if (self._timeout) {
        clearTimeout(self._timeout);
        self._timeout = null;
      }

      // Clean up all attached listeners
      self.removeListener("abort", clearTimer);
      self.removeListener("error", clearTimer);
      self.removeListener("response", clearTimer);
      self.removeListener("close", clearTimer);
      if (callback) {
        self.removeListener("timeout", callback);
      }
      if (!self.socket) {
        self._currentRequest.removeListener("socket", startTimer);
      }
    }

    // Attach callback if passed
    if (callback) {
      this.on("timeout", callback);
    }

    // Start the timer if or when the socket is opened
    if (this.socket) {
      startTimer(this.socket);
    }
    else {
      this._currentRequest.once("socket", startTimer);
    }

    // Clean up on events
    this.on("socket", destroyOnTimeout);
    this.on("abort", clearTimer);
    this.on("error", clearTimer);
    this.on("response", clearTimer);
    this.on("close", clearTimer);

    return this;
  };

  // Proxy all other public ClientRequest methods
  [
    "flushHeaders", "getHeader",
    "setNoDelay", "setSocketKeepAlive",
  ].forEach(function (method) {
    RedirectableRequest.prototype[method] = function (a, b) {
      return this._currentRequest[method](a, b);
    };
  });

  // Proxy all public ClientRequest properties
  ["aborted", "connection", "socket"].forEach(function (property) {
    Object.defineProperty(RedirectableRequest.prototype, property, {
      get: function () { return this._currentRequest[property]; },
    });
  });

  RedirectableRequest.prototype._sanitizeOptions = function (options) {
    // Ensure headers are always present
    if (!options.headers) {
      options.headers = {};
    }

    // Since http.request treats host as an alias of hostname,
    // but the url module interprets host as hostname plus port,
    // eliminate the host property to avoid confusion.
    if (options.host) {
      // Use hostname if set, because it has precedence
      if (!options.hostname) {
        options.hostname = options.host;
      }
      delete options.host;
    }

    // Complete the URL object when necessary
    if (!options.pathname && options.path) {
      var searchPos = options.path.indexOf("?");
      if (searchPos < 0) {
        options.pathname = options.path;
      }
      else {
        options.pathname = options.path.substring(0, searchPos);
        options.search = options.path.substring(searchPos);
      }
    }
  };


  // Executes the next native request (initial or redirect)
  RedirectableRequest.prototype._performRequest = function () {
    // Load the native protocol
    var protocol = this._options.protocol;
    var nativeProtocol = this._options.nativeProtocols[protocol];
    if (!nativeProtocol) {
      throw new TypeError("Unsupported protocol " + protocol);
    }

    // If specified, use the agent corresponding to the protocol
    // (HTTP and HTTPS use different types of agents)
    if (this._options.agents) {
      var scheme = protocol.slice(0, -1);
      this._options.agent = this._options.agents[scheme];
    }

    // Create the native request and set up its event handlers
    var request = this._currentRequest =
          nativeProtocol.request(this._options, this._onNativeResponse);
    request._redirectable = this;
    for (var event of events) {
      request.on(event, eventHandlers[event]);
    }

    // RFC7230§5.3.1: When making a request directly to an origin server, […]
    // a client MUST send only the absolute path […] as the request-target.
    this._currentUrl = /^\//.test(this._options.path) ?
      url.format(this._options) :
      // When making a request to a proxy, […]
      // a client MUST send the target URI in absolute-form […].
      this._options.path;

    // End a redirected request
    // (The first request must be ended explicitly with RedirectableRequest#end)
    if (this._isRedirect) {
      // Write the request entity and end
      var i = 0;
      var self = this;
      var buffers = this._requestBodyBuffers;
      (function writeNext(error) {
        // Only write if this request has not been redirected yet
        /* istanbul ignore else */
        if (request === self._currentRequest) {
          // Report any write errors
          /* istanbul ignore if */
          if (error) {
            self.emit("error", error);
          }
          // Write the next buffer if there are still left
          else if (i < buffers.length) {
            var buffer = buffers[i++];
            /* istanbul ignore else */
            if (!request.finished) {
              request.write(buffer.data, buffer.encoding, writeNext);
            }
          }
          // End the request if `end` has been called on us
          else if (self._ended) {
            request.end();
          }
        }
      }());
    }
  };

  // Processes a response from the current native request
  RedirectableRequest.prototype._processResponse = function (response) {
    // Store the redirected response
    var statusCode = response.statusCode;
    if (this._options.trackRedirects) {
      this._redirects.push({
        url: this._currentUrl,
        headers: response.headers,
        statusCode: statusCode,
      });
    }

    // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
    // that further action needs to be taken by the user agent in order to
    // fulfill the request. If a Location header field is provided,
    // the user agent MAY automatically redirect its request to the URI
    // referenced by the Location field value,
    // even if the specific status code is not understood.

    // If the response is not a redirect; return it as-is
    var location = response.headers.location;
    if (!location || this._options.followRedirects === false ||
        statusCode < 300 || statusCode >= 400) {
      response.responseUrl = this._currentUrl;
      response.redirects = this._redirects;
      this.emit("response", response);

      // Clean up
      this._requestBodyBuffers = [];
      return;
    }

    // The response is a redirect, so abort the current request
    destroyRequest(this._currentRequest);
    // Discard the remainder of the response to avoid waiting for data
    response.destroy();

    // RFC7231§6.4: A client SHOULD detect and intervene
    // in cyclical redirections (i.e., "infinite" redirection loops).
    if (++this._redirectCount > this._options.maxRedirects) {
      throw new TooManyRedirectsError();
    }

    // Store the request headers if applicable
    var requestHeaders;
    var beforeRedirect = this._options.beforeRedirect;
    if (beforeRedirect) {
      requestHeaders = Object.assign({
        // The Host header was set by nativeProtocol.request
        Host: response.req.getHeader("host"),
      }, this._options.headers);
    }

    // RFC7231§6.4: Automatic redirection needs to done with
    // care for methods not known to be safe, […]
    // RFC7231§6.4.2–3: For historical reasons, a user agent MAY change
    // the request method from POST to GET for the subsequent request.
    var method = this._options.method;
    if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" ||
        // RFC7231§6.4.4: The 303 (See Other) status code indicates that
        // the server is redirecting the user agent to a different resource […]
        // A user agent can perform a retrieval request targeting that URI
        // (a GET or HEAD request if using HTTP) […]
        (statusCode === 303) && !/^(?:GET|HEAD)$/.test(this._options.method)) {
      this._options.method = "GET";
      // Drop a possible entity and headers related to it
      this._requestBodyBuffers = [];
      removeMatchingHeaders(/^content-/i, this._options.headers);
    }

    // Drop the Host header, as the redirect might lead to a different host
    var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);

    // If the redirect is relative, carry over the host of the last request
    var currentUrlParts = parseUrl(this._currentUrl);
    var currentHost = currentHostHeader || currentUrlParts.host;
    var currentUrl = /^\w+:/.test(location) ? this._currentUrl :
      url.format(Object.assign(currentUrlParts, { host: currentHost }));

    // Create the redirected request
    var redirectUrl = resolveUrl(location, currentUrl);
    debug("redirecting to", redirectUrl.href);
    this._isRedirect = true;
    spreadUrlObject(redirectUrl, this._options);

    // Drop confidential headers when redirecting to a less secure protocol
    // or to a different domain that is not a superdomain
    if (redirectUrl.protocol !== currentUrlParts.protocol &&
       redirectUrl.protocol !== "https:" ||
       redirectUrl.host !== currentHost &&
       !isSubdomain(redirectUrl.host, currentHost)) {
      removeMatchingHeaders(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers);
    }

    // Evaluate the beforeRedirect callback
    if (isFunction(beforeRedirect)) {
      var responseDetails = {
        headers: response.headers,
        statusCode: statusCode,
      };
      var requestDetails = {
        url: currentUrl,
        method: method,
        headers: requestHeaders,
      };
      beforeRedirect(this._options, responseDetails, requestDetails);
      this._sanitizeOptions(this._options);
    }

    // Perform the redirected request
    this._performRequest();
  };

  // Wraps the key/value object of protocols with redirect functionality
  function wrap(protocols) {
    // Default settings
    var exports = {
      maxRedirects: 21,
      maxBodyLength: 10 * 1024 * 1024,
    };

    // Wrap each protocol
    var nativeProtocols = {};
    Object.keys(protocols).forEach(function (scheme) {
      var protocol = scheme + ":";
      var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
      var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

      // Executes a request, following redirects
      function request(input, options, callback) {
        // Parse parameters, ensuring that input is an object
        if (isURL(input)) {
          input = spreadUrlObject(input);
        }
        else if (isString(input)) {
          input = spreadUrlObject(parseUrl(input));
        }
        else {
          callback = options;
          options = validateUrl(input);
          input = { protocol: protocol };
        }
        if (isFunction(options)) {
          callback = options;
          options = null;
        }

        // Set defaults
        options = Object.assign({
          maxRedirects: exports.maxRedirects,
          maxBodyLength: exports.maxBodyLength,
        }, input, options);
        options.nativeProtocols = nativeProtocols;
        if (!isString(options.host) && !isString(options.hostname)) {
          options.hostname = "::1";
        }

        assert$1.equal(options.protocol, protocol, "protocol mismatch");
        debug("options", options);
        return new RedirectableRequest(options, callback);
      }

      // Executes a GET request, following redirects
      function get(input, options, callback) {
        var wrappedRequest = wrappedProtocol.request(input, options, callback);
        wrappedRequest.end();
        return wrappedRequest;
      }

      // Expose the properties on the wrapped protocol
      Object.defineProperties(wrappedProtocol, {
        request: { value: request, configurable: true, enumerable: true, writable: true },
        get: { value: get, configurable: true, enumerable: true, writable: true },
      });
    });
    return exports;
  }

  function noop() { /* empty */ }

  function parseUrl(input) {
    var parsed;
    /* istanbul ignore else */
    if (useNativeURL) {
      parsed = new URL$1(input);
    }
    else {
      // Ensure the URL is valid and absolute
      parsed = validateUrl(url.parse(input));
      if (!isString(parsed.protocol)) {
        throw new InvalidUrlError({ input });
      }
    }
    return parsed;
  }

  function resolveUrl(relative, base) {
    /* istanbul ignore next */
    return useNativeURL ? new URL$1(relative, base) : parseUrl(url.resolve(base, relative));
  }

  function validateUrl(input) {
    if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) {
      throw new InvalidUrlError({ input: input.href || input });
    }
    if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) {
      throw new InvalidUrlError({ input: input.href || input });
    }
    return input;
  }

  function spreadUrlObject(urlObject, target) {
    var spread = target || {};
    for (var key of preservedUrlFields) {
      spread[key] = urlObject[key];
    }

    // Fix IPv6 hostname
    if (spread.hostname.startsWith("[")) {
      spread.hostname = spread.hostname.slice(1, -1);
    }
    // Ensure port is a number
    if (spread.port !== "") {
      spread.port = Number(spread.port);
    }
    // Concatenate path
    spread.path = spread.search ? spread.pathname + spread.search : spread.pathname;

    return spread;
  }

  function removeMatchingHeaders(regex, headers) {
    var lastValue;
    for (var header in headers) {
      if (regex.test(header)) {
        lastValue = headers[header];
        delete headers[header];
      }
    }
    return (lastValue === null || typeof lastValue === "undefined") ?
      undefined : String(lastValue).trim();
  }

  function createErrorType(code, message, baseClass) {
    // Create constructor
    function CustomError(properties) {
      Error.captureStackTrace(this, this.constructor);
      Object.assign(this, properties || {});
      this.code = code;
      this.message = this.cause ? message + ": " + this.cause.message : message;
    }

    // Attach constructor and set default properties
    CustomError.prototype = new (baseClass || Error)();
    Object.defineProperties(CustomError.prototype, {
      constructor: {
        value: CustomError,
        enumerable: false,
      },
      name: {
        value: "Error [" + code + "]",
        enumerable: false,
      },
    });
    return CustomError;
  }

  function destroyRequest(request, error) {
    for (var event of events) {
      request.removeListener(event, eventHandlers[event]);
    }
    request.on("error", noop);
    request.destroy(error);
  }

  function isSubdomain(subdomain, domain) {
    assert$1(isString(subdomain) && isString(domain));
    var dot = subdomain.length - domain.length - 1;
    return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
  }

  function isString(value) {
    return typeof value === "string" || value instanceof String;
  }

  function isFunction(value) {
    return typeof value === "function";
  }

  function isBuffer(value) {
    return typeof value === "object" && ("length" in value);
  }

  function isURL(value) {
    return URL$1 && value instanceof URL$1;
  }

  // Exports
  followRedirects.exports = wrap({ http: http, https: https });
  followRedirects.exports.wrap = wrap;

  var followRedirectsExports = followRedirects.exports;

  var msg = {
    2:      'need dictionary',     /* Z_NEED_DICT       2  */
    1:      'stream end',          /* Z_STREAM_END      1  */
    0:      '',                    /* Z_OK              0  */
    '-1':   'file error',          /* Z_ERRNO         (-1) */
    '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
    '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
    '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
    '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
    '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
  };

  function ZStream() {
    /* next input byte */
    this.input = null; // JS specific, because we have no pointers
    this.next_in = 0;
    /* number of bytes available at input */
    this.avail_in = 0;
    /* total number of input bytes read so far */
    this.total_in = 0;
    /* next output byte should be put there */
    this.output = null; // JS specific, because we have no pointers
    this.next_out = 0;
    /* remaining free space at output */
    this.avail_out = 0;
    /* total number of bytes output so far */
    this.total_out = 0;
    /* last error message, NULL if no error */
    this.msg = ''/*Z_NULL*/;
    /* not visible by applications */
    this.state = null;
    /* best guess about the data type: binary or text */
    this.data_type = 2/*Z_UNKNOWN*/;
    /* adler32 value of the uncompressed data */
    this.adler = 0;
  }

  function arraySet(dest, src, src_offs, len, dest_offs) {
    if (src.subarray && dest.subarray) {
      dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
      return;
    }
    // Fallback to ordinary array
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  }


  var Buf8 = Uint8Array;
  var Buf16 = Uint16Array;
  var Buf32 = Int32Array;
  // Enable/Disable typed arrays use, for testing
  //

  /* Public constants ==========================================================*/
  /* ===========================================================================*/


  //var Z_FILTERED          = 1;
  //var Z_HUFFMAN_ONLY      = 2;
  //var Z_RLE               = 3;
  var Z_FIXED$2 = 4;
  //var Z_DEFAULT_STRATEGY  = 0;

  /* Possible values of the data_type field (though see inflate()) */
  var Z_BINARY$1 = 0;
  var Z_TEXT$1 = 1;
  //var Z_ASCII             = 1; // = Z_TEXT
  var Z_UNKNOWN$2 = 2;

  /*============================================================================*/


  function zero$1(buf) {
    var len = buf.length;
    while (--len >= 0) {
      buf[len] = 0;
    }
  }

  // From zutil.h

  var STORED_BLOCK = 0;
  var STATIC_TREES = 1;
  var DYN_TREES = 2;
  /* The three kinds of block type */

  var MIN_MATCH$1 = 3;
  var MAX_MATCH$1 = 258;
  /* The minimum and maximum match lengths */

  // From deflate.h
  /* ===========================================================================
   * Internal compression state.
   */

  var LENGTH_CODES$1 = 29;
  /* number of length codes, not counting the special END_BLOCK code */

  var LITERALS$1 = 256;
  /* number of literal bytes 0..255 */

  var L_CODES$1 = LITERALS$1 + 1 + LENGTH_CODES$1;
  /* number of Literal or Length codes, including the END_BLOCK code */

  var D_CODES$1 = 30;
  /* number of distance codes */

  var BL_CODES$1 = 19;
  /* number of codes used to transfer the bit lengths */

  var HEAP_SIZE$1 = 2 * L_CODES$1 + 1;
  /* maximum heap size */

  var MAX_BITS$1 = 15;
  /* All codes must not exceed MAX_BITS bits */

  var Buf_size = 16;
  /* size of bit buffer in bi_buf */


  /* ===========================================================================
   * Constants
   */

  var MAX_BL_BITS = 7;
  /* Bit length codes must not exceed MAX_BL_BITS bits */

  var END_BLOCK = 256;
  /* end of block literal code */

  var REP_3_6 = 16;
  /* repeat previous bit length 3-6 times (2 bits of repeat count) */

  var REPZ_3_10 = 17;
  /* repeat a zero length 3-10 times  (3 bits of repeat count) */

  var REPZ_11_138 = 18;
  /* repeat a zero length 11-138 times  (7 bits of repeat count) */

  /* eslint-disable comma-spacing,array-bracket-spacing */
  var extra_lbits = /* extra bits for each length code */ [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];

  var extra_dbits = /* extra bits for each distance code */ [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];

  var extra_blbits = /* extra bits for each bit length code */ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7];

  var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
  /* eslint-enable comma-spacing,array-bracket-spacing */

  /* The lengths of the bit length codes are sent in order of decreasing
   * probability, to avoid transmitting the lengths for unused bit length codes.
   */

  /* ===========================================================================
   * Local data. These are initialized only once.
   */

  // We pre-fill arrays with 0 to avoid uninitialized gaps

  var DIST_CODE_LEN = 512; /* see definition of array dist_code below */

  // !!!! Use flat array insdead of structure, Freq = i*2, Len = i*2+1
  var static_ltree = new Array((L_CODES$1 + 2) * 2);
  zero$1(static_ltree);
  /* The static literal tree. Since the bit lengths are imposed, there is no
   * need for the L_CODES extra codes used during heap construction. However
   * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
   * below).
   */

  var static_dtree = new Array(D_CODES$1 * 2);
  zero$1(static_dtree);
  /* The static distance tree. (Actually a trivial tree since all codes use
   * 5 bits.)
   */

  var _dist_code = new Array(DIST_CODE_LEN);
  zero$1(_dist_code);
  /* Distance codes. The first 256 values correspond to the distances
   * 3 .. 258, the last 256 values correspond to the top 8 bits of
   * the 15 bit distances.
   */

  var _length_code = new Array(MAX_MATCH$1 - MIN_MATCH$1 + 1);
  zero$1(_length_code);
  /* length code for each normalized match length (0 == MIN_MATCH) */

  var base_length = new Array(LENGTH_CODES$1);
  zero$1(base_length);
  /* First normalized length for each code (0 = MIN_MATCH) */

  var base_dist = new Array(D_CODES$1);
  zero$1(base_dist);
  /* First normalized distance for each code (0 = distance of 1) */


  function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

    this.static_tree = static_tree; /* static tree or NULL */
    this.extra_bits = extra_bits; /* extra bits for each code or NULL */
    this.extra_base = extra_base; /* base index for extra_bits */
    this.elems = elems; /* max number of elements in the tree */
    this.max_length = max_length; /* max bit length for the codes */

    // show if `static_tree` has data or dummy - needed for monomorphic objects
    this.has_stree = static_tree && static_tree.length;
  }


  var static_l_desc;
  var static_d_desc;
  var static_bl_desc;


  function TreeDesc(dyn_tree, stat_desc) {
    this.dyn_tree = dyn_tree; /* the dynamic tree */
    this.max_code = 0; /* largest code with non zero frequency */
    this.stat_desc = stat_desc; /* the corresponding static tree */
  }



  function d_code(dist) {
    return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
  }


  /* ===========================================================================
   * Output a short LSB first on the stream.
   * IN assertion: there is enough room in pendingBuf.
   */
  function put_short(s, w) {
    //    put_byte(s, (uch)((w) & 0xff));
    //    put_byte(s, (uch)((ush)(w) >> 8));
    s.pending_buf[s.pending++] = (w) & 0xff;
    s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
  }


  /* ===========================================================================
   * Send a value on a given number of bits.
   * IN assertion: length <= 16 and value fits in length bits.
   */
  function send_bits(s, value, length) {
    if (s.bi_valid > (Buf_size - length)) {
      s.bi_buf |= (value << s.bi_valid) & 0xffff;
      put_short(s, s.bi_buf);
      s.bi_buf = value >> (Buf_size - s.bi_valid);
      s.bi_valid += length - Buf_size;
    } else {
      s.bi_buf |= (value << s.bi_valid) & 0xffff;
      s.bi_valid += length;
    }
  }


  function send_code(s, c, tree) {
    send_bits(s, tree[c * 2] /*.Code*/ , tree[c * 2 + 1] /*.Len*/ );
  }


  /* ===========================================================================
   * Reverse the first len bits of a code, using straightforward code (a faster
   * method would use a table)
   * IN assertion: 1 <= len <= 15
   */
  function bi_reverse(code, len) {
    var res = 0;
    do {
      res |= code & 1;
      code >>>= 1;
      res <<= 1;
    } while (--len > 0);
    return res >>> 1;
  }


  /* ===========================================================================
   * Flush the bit buffer, keeping at most 7 bits in it.
   */
  function bi_flush(s) {
    if (s.bi_valid === 16) {
      put_short(s, s.bi_buf);
      s.bi_buf = 0;
      s.bi_valid = 0;

    } else if (s.bi_valid >= 8) {
      s.pending_buf[s.pending++] = s.bi_buf & 0xff;
      s.bi_buf >>= 8;
      s.bi_valid -= 8;
    }
  }


  /* ===========================================================================
   * Compute the optimal bit lengths for a tree and update the total bit length
   * for the current block.
   * IN assertion: the fields freq and dad are set, heap[heap_max] and
   *    above are the tree nodes sorted by increasing frequency.
   * OUT assertions: the field len is set to the optimal bit length, the
   *     array bl_count contains the frequencies for each bit length.
   *     The length opt_len is updated; static_len is also updated if stree is
   *     not null.
   */
  function gen_bitlen(s, desc) {
  //    deflate_state *s;
  //    tree_desc *desc;    /* the tree descriptor */
    var tree = desc.dyn_tree;
    var max_code = desc.max_code;
    var stree = desc.stat_desc.static_tree;
    var has_stree = desc.stat_desc.has_stree;
    var extra = desc.stat_desc.extra_bits;
    var base = desc.stat_desc.extra_base;
    var max_length = desc.stat_desc.max_length;
    var h; /* heap index */
    var n, m; /* iterate over the tree elements */
    var bits; /* bit length */
    var xbits; /* extra bits */
    var f; /* frequency */
    var overflow = 0; /* number of elements with bit length too large */

    for (bits = 0; bits <= MAX_BITS$1; bits++) {
      s.bl_count[bits] = 0;
    }

    /* In a first pass, compute the optimal bit lengths (which may
     * overflow in the case of the bit length tree).
     */
    tree[s.heap[s.heap_max] * 2 + 1] /*.Len*/ = 0; /* root of the heap */

    for (h = s.heap_max + 1; h < HEAP_SIZE$1; h++) {
      n = s.heap[h];
      bits = tree[tree[n * 2 + 1] /*.Dad*/ * 2 + 1] /*.Len*/ + 1;
      if (bits > max_length) {
        bits = max_length;
        overflow++;
      }
      tree[n * 2 + 1] /*.Len*/ = bits;
      /* We overwrite tree[n].Dad which is no longer needed */

      if (n > max_code) {
        continue;
      } /* not a leaf node */

      s.bl_count[bits]++;
      xbits = 0;
      if (n >= base) {
        xbits = extra[n - base];
      }
      f = tree[n * 2] /*.Freq*/ ;
      s.opt_len += f * (bits + xbits);
      if (has_stree) {
        s.static_len += f * (stree[n * 2 + 1] /*.Len*/ + xbits);
      }
    }
    if (overflow === 0) {
      return;
    }

    // Trace((stderr,"\nbit length overflow\n"));
    /* This happens for example on obj2 and pic of the Calgary corpus */

    /* Find the first bit length which could increase: */
    do {
      bits = max_length - 1;
      while (s.bl_count[bits] === 0) {
        bits--;
      }
      s.bl_count[bits]--; /* move one leaf down the tree */
      s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
      s.bl_count[max_length]--;
      /* The brother of the overflow item also moves one step up,
       * but this does not affect bl_count[max_length]
       */
      overflow -= 2;
    } while (overflow > 0);

    /* Now recompute all bit lengths, scanning in increasing frequency.
     * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
     * lengths instead of fixing only the wrong ones. This idea is taken
     * from 'ar' written by Haruhiko Okumura.)
     */
    for (bits = max_length; bits !== 0; bits--) {
      n = s.bl_count[bits];
      while (n !== 0) {
        m = s.heap[--h];
        if (m > max_code) {
          continue;
        }
        if (tree[m * 2 + 1] /*.Len*/ !== bits) {
          // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
          s.opt_len += (bits - tree[m * 2 + 1] /*.Len*/ ) * tree[m * 2] /*.Freq*/ ;
          tree[m * 2 + 1] /*.Len*/ = bits;
        }
        n--;
      }
    }
  }


  /* ===========================================================================
   * Generate the codes for a given tree and bit counts (which need not be
   * optimal).
   * IN assertion: the array bl_count contains the bit length statistics for
   * the given tree and the field len is set for all tree elements.
   * OUT assertion: the field code is set for all tree elements of non
   *     zero code length.
   */
  function gen_codes(tree, max_code, bl_count) {
  //    ct_data *tree;             /* the tree to decorate */
  //    int max_code;              /* largest code with non zero frequency */
  //    ushf *bl_count;            /* number of codes at each bit length */

    var next_code = new Array(MAX_BITS$1 + 1); /* next code value for each bit length */
    var code = 0; /* running code value */
    var bits; /* bit index */
    var n; /* code index */

    /* The distribution counts are first used to generate the code values
     * without bit reversal.
     */
    for (bits = 1; bits <= MAX_BITS$1; bits++) {
      next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
    }
    /* Check that the bit counts in bl_count are consistent. The last code
     * must be all ones.
     */
    //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
    //        "inconsistent bit counts");
    //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

    for (n = 0; n <= max_code; n++) {
      var len = tree[n * 2 + 1] /*.Len*/ ;
      if (len === 0) {
        continue;
      }
      /* Now reverse the bits */
      tree[n * 2] /*.Code*/ = bi_reverse(next_code[len]++, len);

      //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
      //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
    }
  }


  /* ===========================================================================
   * Initialize the various 'constant' tables.
   */
  function tr_static_init() {
    var n; /* iterates over tree elements */
    var bits; /* bit counter */
    var length; /* length value */
    var code; /* code value */
    var dist; /* distance index */
    var bl_count = new Array(MAX_BITS$1 + 1);
    /* number of codes at each bit length for an optimal tree */

    // do check in _tr_init()
    //if (static_init_done) return;

    /* For some embedded targets, global variables are not initialized: */
    /*#ifdef NO_INIT_GLOBAL_POINTERS
      static_l_desc.static_tree = static_ltree;
      static_l_desc.extra_bits = extra_lbits;
      static_d_desc.static_tree = static_dtree;
      static_d_desc.extra_bits = extra_dbits;
      static_bl_desc.extra_bits = extra_blbits;
    #endif*/

    /* Initialize the mapping length (0..255) -> length code (0..28) */
    length = 0;
    for (code = 0; code < LENGTH_CODES$1 - 1; code++) {
      base_length[code] = length;
      for (n = 0; n < (1 << extra_lbits[code]); n++) {
        _length_code[length++] = code;
      }
    }
    //Assert (length == 256, "tr_static_init: length != 256");
    /* Note that the length 255 (match length 258) can be represented
     * in two different ways: code 284 + 5 bits or code 285, so we
     * overwrite length_code[255] to use the best encoding:
     */
    _length_code[length - 1] = code;

    /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
    dist = 0;
    for (code = 0; code < 16; code++) {
      base_dist[code] = dist;
      for (n = 0; n < (1 << extra_dbits[code]); n++) {
        _dist_code[dist++] = code;
      }
    }
    //Assert (dist == 256, "tr_static_init: dist != 256");
    dist >>= 7; /* from now on, all distances are divided by 128 */
    for (; code < D_CODES$1; code++) {
      base_dist[code] = dist << 7;
      for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
        _dist_code[256 + dist++] = code;
      }
    }
    //Assert (dist == 256, "tr_static_init: 256+dist != 512");

    /* Construct the codes of the static literal tree */
    for (bits = 0; bits <= MAX_BITS$1; bits++) {
      bl_count[bits] = 0;
    }

    n = 0;
    while (n <= 143) {
      static_ltree[n * 2 + 1] /*.Len*/ = 8;
      n++;
      bl_count[8]++;
    }
    while (n <= 255) {
      static_ltree[n * 2 + 1] /*.Len*/ = 9;
      n++;
      bl_count[9]++;
    }
    while (n <= 279) {
      static_ltree[n * 2 + 1] /*.Len*/ = 7;
      n++;
      bl_count[7]++;
    }
    while (n <= 287) {
      static_ltree[n * 2 + 1] /*.Len*/ = 8;
      n++;
      bl_count[8]++;
    }
    /* Codes 286 and 287 do not exist, but we must include them in the
     * tree construction to get a canonical Huffman tree (longest code
     * all ones)
     */
    gen_codes(static_ltree, L_CODES$1 + 1, bl_count);

    /* The static distance tree is trivial: */
    for (n = 0; n < D_CODES$1; n++) {
      static_dtree[n * 2 + 1] /*.Len*/ = 5;
      static_dtree[n * 2] /*.Code*/ = bi_reverse(n, 5);
    }

    // Now data ready and we can init static trees
    static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS$1 + 1, L_CODES$1, MAX_BITS$1);
    static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES$1, MAX_BITS$1);
    static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES$1, MAX_BL_BITS);

    //static_init_done = true;
  }


  /* ===========================================================================
   * Initialize a new block.
   */
  function init_block(s) {
    var n; /* iterates over tree elements */

    /* Initialize the trees. */
    for (n = 0; n < L_CODES$1; n++) {
      s.dyn_ltree[n * 2] /*.Freq*/ = 0;
    }
    for (n = 0; n < D_CODES$1; n++) {
      s.dyn_dtree[n * 2] /*.Freq*/ = 0;
    }
    for (n = 0; n < BL_CODES$1; n++) {
      s.bl_tree[n * 2] /*.Freq*/ = 0;
    }

    s.dyn_ltree[END_BLOCK * 2] /*.Freq*/ = 1;
    s.opt_len = s.static_len = 0;
    s.last_lit = s.matches = 0;
  }


  /* ===========================================================================
   * Flush the bit buffer and align the output on a byte boundary
   */
  function bi_windup(s) {
    if (s.bi_valid > 8) {
      put_short(s, s.bi_buf);
    } else if (s.bi_valid > 0) {
      //put_byte(s, (Byte)s->bi_buf);
      s.pending_buf[s.pending++] = s.bi_buf;
    }
    s.bi_buf = 0;
    s.bi_valid = 0;
  }

  /* ===========================================================================
   * Copy a stored block, storing first the length and its
   * one's complement if requested.
   */
  function copy_block(s, buf, len, header) {
  //DeflateState *s;
  //charf    *buf;    /* the input data */
  //unsigned len;     /* its length */
  //int      header;  /* true if block header must be written */

    bi_windup(s); /* align on byte boundary */

    {
      put_short(s, len);
      put_short(s, ~len);
    }
    //  while (len--) {
    //    put_byte(s, *buf++);
    //  }
    arraySet(s.pending_buf, s.window, buf, len, s.pending);
    s.pending += len;
  }

  /* ===========================================================================
   * Compares to subtrees, using the tree depth as tie breaker when
   * the subtrees have equal frequency. This minimizes the worst case length.
   */
  function smaller(tree, n, m, depth) {
    var _n2 = n * 2;
    var _m2 = m * 2;
    return (tree[_n2] /*.Freq*/ < tree[_m2] /*.Freq*/ ||
      (tree[_n2] /*.Freq*/ === tree[_m2] /*.Freq*/ && depth[n] <= depth[m]));
  }

  /* ===========================================================================
   * Restore the heap property by moving down the tree starting at node k,
   * exchanging a node with the smallest of its two sons if necessary, stopping
   * when the heap property is re-established (each father smaller than its
   * two sons).
   */
  function pqdownheap(s, tree, k)
  //    deflate_state *s;
  //    ct_data *tree;  /* the tree to restore */
  //    int k;               /* node to move down */
  {
    var v = s.heap[k];
    var j = k << 1; /* left son of k */
    while (j <= s.heap_len) {
      /* Set j to the smallest of the two sons: */
      if (j < s.heap_len &&
        smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
        j++;
      }
      /* Exit if v is smaller than both sons */
      if (smaller(tree, v, s.heap[j], s.depth)) {
        break;
      }

      /* Exchange v with the smallest son */
      s.heap[k] = s.heap[j];
      k = j;

      /* And continue down the tree, setting j to the left son of k */
      j <<= 1;
    }
    s.heap[k] = v;
  }


  // inlined manually
  // var SMALLEST = 1;

  /* ===========================================================================
   * Send the block data compressed using the given Huffman trees
   */
  function compress_block(s, ltree, dtree)
  //    deflate_state *s;
  //    const ct_data *ltree; /* literal tree */
  //    const ct_data *dtree; /* distance tree */
  {
    var dist; /* distance of matched string */
    var lc; /* match length or unmatched char (if dist == 0) */
    var lx = 0; /* running index in l_buf */
    var code; /* the code to send */
    var extra; /* number of extra bits to send */

    if (s.last_lit !== 0) {
      do {
        dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
        lc = s.pending_buf[s.l_buf + lx];
        lx++;

        if (dist === 0) {
          send_code(s, lc, ltree); /* send a literal byte */
          //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
        } else {
          /* Here, lc is the match length - MIN_MATCH */
          code = _length_code[lc];
          send_code(s, code + LITERALS$1 + 1, ltree); /* send the length code */
          extra = extra_lbits[code];
          if (extra !== 0) {
            lc -= base_length[code];
            send_bits(s, lc, extra); /* send the extra length bits */
          }
          dist--; /* dist is now the match distance - 1 */
          code = d_code(dist);
          //Assert (code < D_CODES, "bad d_code");

          send_code(s, code, dtree); /* send the distance code */
          extra = extra_dbits[code];
          if (extra !== 0) {
            dist -= base_dist[code];
            send_bits(s, dist, extra); /* send the extra distance bits */
          }
        } /* literal or match pair ? */

        /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
        //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
        //       "pendingBuf overflow");

      } while (lx < s.last_lit);
    }

    send_code(s, END_BLOCK, ltree);
  }


  /* ===========================================================================
   * Construct one Huffman tree and assigns the code bit strings and lengths.
   * Update the total bit length for the current block.
   * IN assertion: the field freq is set for all tree elements.
   * OUT assertions: the fields len and code are set to the optimal bit length
   *     and corresponding code. The length opt_len is updated; static_len is
   *     also updated if stree is not null. The field max_code is set.
   */
  function build_tree(s, desc)
  //    deflate_state *s;
  //    tree_desc *desc; /* the tree descriptor */
  {
    var tree = desc.dyn_tree;
    var stree = desc.stat_desc.static_tree;
    var has_stree = desc.stat_desc.has_stree;
    var elems = desc.stat_desc.elems;
    var n, m; /* iterate over heap elements */
    var max_code = -1; /* largest code with non zero frequency */
    var node; /* new node being created */

    /* Construct the initial heap, with least frequent element in
     * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
     * heap[0] is not used.
     */
    s.heap_len = 0;
    s.heap_max = HEAP_SIZE$1;

    for (n = 0; n < elems; n++) {
      if (tree[n * 2] /*.Freq*/ !== 0) {
        s.heap[++s.heap_len] = max_code = n;
        s.depth[n] = 0;

      } else {
        tree[n * 2 + 1] /*.Len*/ = 0;
      }
    }

    /* The pkzip format requires that at least one distance code exists,
     * and that at least one bit should be sent even if there is only one
     * possible code. So to avoid special checks later on we force at least
     * two codes of non zero frequency.
     */
    while (s.heap_len < 2) {
      node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
      tree[node * 2] /*.Freq*/ = 1;
      s.depth[node] = 0;
      s.opt_len--;

      if (has_stree) {
        s.static_len -= stree[node * 2 + 1] /*.Len*/ ;
      }
      /* node is 0 or 1 so it does not have extra bits */
    }
    desc.max_code = max_code;

    /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
     * establish sub-heaps of increasing lengths:
     */
    for (n = (s.heap_len >> 1 /*int /2*/ ); n >= 1; n--) {
      pqdownheap(s, tree, n);
    }

    /* Construct the Huffman tree by repeatedly combining the least two
     * frequent nodes.
     */
    node = elems; /* next internal node of the tree */
    do {
      //pqremove(s, tree, n);  /* n = node of least frequency */
      /*** pqremove ***/
      n = s.heap[1 /*SMALLEST*/ ];
      s.heap[1 /*SMALLEST*/ ] = s.heap[s.heap_len--];
      pqdownheap(s, tree, 1 /*SMALLEST*/ );
      /***/

      m = s.heap[1 /*SMALLEST*/ ]; /* m = node of next least frequency */

      s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
      s.heap[--s.heap_max] = m;

      /* Create a new node father of n and m */
      tree[node * 2] /*.Freq*/ = tree[n * 2] /*.Freq*/ + tree[m * 2] /*.Freq*/ ;
      s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
      tree[n * 2 + 1] /*.Dad*/ = tree[m * 2 + 1] /*.Dad*/ = node;

      /* and insert the new node in the heap */
      s.heap[1 /*SMALLEST*/ ] = node++;
      pqdownheap(s, tree, 1 /*SMALLEST*/ );

    } while (s.heap_len >= 2);

    s.heap[--s.heap_max] = s.heap[1 /*SMALLEST*/ ];

    /* At this point, the fields freq and dad are set. We can now
     * generate the bit lengths.
     */
    gen_bitlen(s, desc);

    /* The field len is now set, we can generate the bit codes */
    gen_codes(tree, max_code, s.bl_count);
  }


  /* ===========================================================================
   * Scan a literal or distance tree to determine the frequencies of the codes
   * in the bit length tree.
   */
  function scan_tree(s, tree, max_code)
  //    deflate_state *s;
  //    ct_data *tree;   /* the tree to be scanned */
  //    int max_code;    /* and its largest code of non zero frequency */
  {
    var n; /* iterates over all tree elements */
    var prevlen = -1; /* last emitted length */
    var curlen; /* length of current code */

    var nextlen = tree[0 * 2 + 1] /*.Len*/ ; /* length of next code */

    var count = 0; /* repeat count of the current code */
    var max_count = 7; /* max repeat count */
    var min_count = 4; /* min repeat count */

    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    }
    tree[(max_code + 1) * 2 + 1] /*.Len*/ = 0xffff; /* guard */

    for (n = 0; n <= max_code; n++) {
      curlen = nextlen;
      nextlen = tree[(n + 1) * 2 + 1] /*.Len*/ ;

      if (++count < max_count && curlen === nextlen) {
        continue;

      } else if (count < min_count) {
        s.bl_tree[curlen * 2] /*.Freq*/ += count;

      } else if (curlen !== 0) {

        if (curlen !== prevlen) {
          s.bl_tree[curlen * 2] /*.Freq*/ ++;
        }
        s.bl_tree[REP_3_6 * 2] /*.Freq*/ ++;

      } else if (count <= 10) {
        s.bl_tree[REPZ_3_10 * 2] /*.Freq*/ ++;

      } else {
        s.bl_tree[REPZ_11_138 * 2] /*.Freq*/ ++;
      }

      count = 0;
      prevlen = curlen;

      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;

      } else if (curlen === nextlen) {
        max_count = 6;
        min_count = 3;

      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  }


  /* ===========================================================================
   * Send a literal or distance tree in compressed form, using the codes in
   * bl_tree.
   */
  function send_tree(s, tree, max_code)
  //    deflate_state *s;
  //    ct_data *tree; /* the tree to be scanned */
  //    int max_code;       /* and its largest code of non zero frequency */
  {
    var n; /* iterates over all tree elements */
    var prevlen = -1; /* last emitted length */
    var curlen; /* length of current code */

    var nextlen = tree[0 * 2 + 1] /*.Len*/ ; /* length of next code */

    var count = 0; /* repeat count of the current code */
    var max_count = 7; /* max repeat count */
    var min_count = 4; /* min repeat count */

    /* tree[max_code+1].Len = -1; */
    /* guard already set */
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    }

    for (n = 0; n <= max_code; n++) {
      curlen = nextlen;
      nextlen = tree[(n + 1) * 2 + 1] /*.Len*/ ;

      if (++count < max_count && curlen === nextlen) {
        continue;

      } else if (count < min_count) {
        do {
          send_code(s, curlen, s.bl_tree);
        } while (--count !== 0);

      } else if (curlen !== 0) {
        if (curlen !== prevlen) {
          send_code(s, curlen, s.bl_tree);
          count--;
        }
        //Assert(count >= 3 && count <= 6, " 3_6?");
        send_code(s, REP_3_6, s.bl_tree);
        send_bits(s, count - 3, 2);

      } else if (count <= 10) {
        send_code(s, REPZ_3_10, s.bl_tree);
        send_bits(s, count - 3, 3);

      } else {
        send_code(s, REPZ_11_138, s.bl_tree);
        send_bits(s, count - 11, 7);
      }

      count = 0;
      prevlen = curlen;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;

      } else if (curlen === nextlen) {
        max_count = 6;
        min_count = 3;

      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  }


  /* ===========================================================================
   * Construct the Huffman tree for the bit lengths and return the index in
   * bl_order of the last bit length code to send.
   */
  function build_bl_tree(s) {
    var max_blindex; /* index of last bit length code of non zero freq */

    /* Determine the bit length frequencies for literal and distance trees */
    scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
    scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

    /* Build the bit length tree: */
    build_tree(s, s.bl_desc);
    /* opt_len now includes the length of the tree representations, except
     * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
     */

    /* Determine the number of bit length codes to send. The pkzip format
     * requires that at least 4 bit length codes be sent. (appnote.txt says
     * 3 but the actual value used is 4.)
     */
    for (max_blindex = BL_CODES$1 - 1; max_blindex >= 3; max_blindex--) {
      if (s.bl_tree[bl_order[max_blindex] * 2 + 1] /*.Len*/ !== 0) {
        break;
      }
    }
    /* Update opt_len to include the bit length tree and counts */
    s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
    //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
    //        s->opt_len, s->static_len));

    return max_blindex;
  }


  /* ===========================================================================
   * Send the header for a block using dynamic Huffman trees: the counts, the
   * lengths of the bit length codes, the literal tree and the distance tree.
   * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
   */
  function send_all_trees(s, lcodes, dcodes, blcodes)
  //    deflate_state *s;
  //    int lcodes, dcodes, blcodes; /* number of codes for each tree */
  {
    var rank; /* index in bl_order */

    //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
    //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
    //        "too many codes");
    //Tracev((stderr, "\nbl counts: "));
    send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
    send_bits(s, dcodes - 1, 5);
    send_bits(s, blcodes - 4, 4); /* not -3 as stated in appnote.txt */
    for (rank = 0; rank < blcodes; rank++) {
      //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
      send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1] /*.Len*/ , 3);
    }
    //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

    send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
    //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

    send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
    //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
  }


  /* ===========================================================================
   * Check if the data type is TEXT or BINARY, using the following algorithm:
   * - TEXT if the two conditions below are satisfied:
   *    a) There are no non-portable control characters belonging to the
   *       "black list" (0..6, 14..25, 28..31).
   *    b) There is at least one printable character belonging to the
   *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
   * - BINARY otherwise.
   * - The following partially-portable control characters form a
   *   "gray list" that is ignored in this detection algorithm:
   *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
   * IN assertion: the fields Freq of dyn_ltree are set.
   */
  function detect_data_type(s) {
    /* black_mask is the bit mask of black-listed bytes
     * set bits 0..6, 14..25, and 28..31
     * 0xf3ffc07f = binary 11110011111111111100000001111111
     */
    var black_mask = 0xf3ffc07f;
    var n;

    /* Check for non-textual ("black-listed") bytes. */
    for (n = 0; n <= 31; n++, black_mask >>>= 1) {
      if ((black_mask & 1) && (s.dyn_ltree[n * 2] /*.Freq*/ !== 0)) {
        return Z_BINARY$1;
      }
    }

    /* Check for textual ("white-listed") bytes. */
    if (s.dyn_ltree[9 * 2] /*.Freq*/ !== 0 || s.dyn_ltree[10 * 2] /*.Freq*/ !== 0 ||
      s.dyn_ltree[13 * 2] /*.Freq*/ !== 0) {
      return Z_TEXT$1;
    }
    for (n = 32; n < LITERALS$1; n++) {
      if (s.dyn_ltree[n * 2] /*.Freq*/ !== 0) {
        return Z_TEXT$1;
      }
    }

    /* There are no "black-listed" or "white-listed" bytes:
     * this stream either is empty or has tolerated ("gray-listed") bytes only.
     */
    return Z_BINARY$1;
  }


  var static_init_done = false;

  /* ===========================================================================
   * Initialize the tree data structures for a new zlib stream.
   */
  function _tr_init(s) {

    if (!static_init_done) {
      tr_static_init();
      static_init_done = true;
    }

    s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
    s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
    s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

    s.bi_buf = 0;
    s.bi_valid = 0;

    /* Initialize the first block of the first file: */
    init_block(s);
  }


  /* ===========================================================================
   * Send a stored block
   */
  function _tr_stored_block(s, buf, stored_len, last)
  //DeflateState *s;
  //charf *buf;       /* input block */
  //ulg stored_len;   /* length of input block */
  //int last;         /* one if this is the last block for a file */
  {
    send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3); /* send block type */
    copy_block(s, buf, stored_len); /* with header */
  }


  /* ===========================================================================
   * Send one empty static block to give enough lookahead for inflate.
   * This takes 10 bits, of which 7 may remain in the bit buffer.
   */
  function _tr_align(s) {
    send_bits(s, STATIC_TREES << 1, 3);
    send_code(s, END_BLOCK, static_ltree);
    bi_flush(s);
  }


  /* ===========================================================================
   * Determine the best encoding for the current block: dynamic trees, static
   * trees or store, and output the encoded block to the zip file.
   */
  function _tr_flush_block(s, buf, stored_len, last)
  //DeflateState *s;
  //charf *buf;       /* input block, or NULL if too old */
  //ulg stored_len;   /* length of input block */
  //int last;         /* one if this is the last block for a file */
  {
    var opt_lenb, static_lenb; /* opt_len and static_len in bytes */
    var max_blindex = 0; /* index of last bit length code of non zero freq */

    /* Build the Huffman trees unless a stored block is forced */
    if (s.level > 0) {

      /* Check if the file is binary or text */
      if (s.strm.data_type === Z_UNKNOWN$2) {
        s.strm.data_type = detect_data_type(s);
      }

      /* Construct the literal and distance trees */
      build_tree(s, s.l_desc);
      // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
      //        s->static_len));

      build_tree(s, s.d_desc);
      // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
      //        s->static_len));
      /* At this point, opt_len and static_len are the total bit lengths of
       * the compressed block data, excluding the tree representations.
       */

      /* Build the bit length tree for the above two trees, and get the index
       * in bl_order of the last bit length code to send.
       */
      max_blindex = build_bl_tree(s);

      /* Determine the best encoding. Compute the block lengths in bytes. */
      opt_lenb = (s.opt_len + 3 + 7) >>> 3;
      static_lenb = (s.static_len + 3 + 7) >>> 3;

      // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
      //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
      //        s->last_lit));

      if (static_lenb <= opt_lenb) {
        opt_lenb = static_lenb;
      }

    } else {
      // Assert(buf != (char*)0, "lost buf");
      opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
    }

    if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
      /* 4: two words for the lengths */

      /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
       * Otherwise we can't have processed more than WSIZE input bytes since
       * the last block flush, because compression would have been
       * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
       * transform a block into a stored block.
       */
      _tr_stored_block(s, buf, stored_len, last);

    } else if (s.strategy === Z_FIXED$2 || static_lenb === opt_lenb) {

      send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
      compress_block(s, static_ltree, static_dtree);

    } else {
      send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
      send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
      compress_block(s, s.dyn_ltree, s.dyn_dtree);
    }
    // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
    /* The above check is made mod 2^32, for files larger than 512 MB
     * and uLong implemented on 32 bits.
     */
    init_block(s);

    if (last) {
      bi_windup(s);
    }
    // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
    //       s->compressed_len-7*last));
  }

  /* ===========================================================================
   * Save the match info and tally the frequency counts. Return true if
   * the current block must be flushed.
   */
  function _tr_tally(s, dist, lc)
  //    deflate_state *s;
  //    unsigned dist;  /* distance of matched string */
  //    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
  {
    //var out_length, in_length, dcode;

    s.pending_buf[s.d_buf + s.last_lit * 2] = (dist >>> 8) & 0xff;
    s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

    s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
    s.last_lit++;

    if (dist === 0) {
      /* lc is the unmatched char */
      s.dyn_ltree[lc * 2] /*.Freq*/ ++;
    } else {
      s.matches++;
      /* Here, lc is the match length - MIN_MATCH */
      dist--; /* dist = match distance - 1 */
      //Assert((ush)dist < (ush)MAX_DIST(s) &&
      //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
      //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

      s.dyn_ltree[(_length_code[lc] + LITERALS$1 + 1) * 2] /*.Freq*/ ++;
      s.dyn_dtree[d_code(dist) * 2] /*.Freq*/ ++;
    }

    // (!) This block is disabled in zlib defailts,
    // don't enable it for binary compatibility

    //#ifdef TRUNCATE_BLOCK
    //  /* Try to guess if it is profitable to stop the current block here */
    //  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
    //    /* Compute an upper bound for the compressed length */
    //    out_length = s.last_lit*8;
    //    in_length = s.strstart - s.block_start;
    //
    //    for (dcode = 0; dcode < D_CODES; dcode++) {
    //      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
    //    }
    //    out_length >>>= 3;
    //    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
    //    //       s->last_lit, in_length, out_length,
    //    //       100L - out_length*100L/in_length));
    //    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
    //      return true;
    //    }
    //  }
    //#endif

    return (s.last_lit === s.lit_bufsize - 1);
    /* We avoid equality with lit_bufsize because of wraparound at 64K
     * on 16 bit machines and because stored blocks are restricted to
     * 64K-1 bytes.
     */
  }

  // Note: adler32 takes 12% for level 0 and 2% for level 6.
  // It doesn't worth to make additional optimizationa as in original.
  // Small size is preferable.

  function adler32(adler, buf, len, pos) {
    var s1 = (adler & 0xffff) |0,
        s2 = ((adler >>> 16) & 0xffff) |0,
        n = 0;

    while (len !== 0) {
      // Set limit ~ twice less than 5552, to keep
      // s2 in 31-bits, because we force signed ints.
      // in other case %= will fail.
      n = len > 2000 ? 2000 : len;
      len -= n;

      do {
        s1 = (s1 + buf[pos++]) |0;
        s2 = (s2 + s1) |0;
      } while (--n);

      s1 %= 65521;
      s2 %= 65521;
    }

    return (s1 | (s2 << 16)) |0;
  }

  // Note: we can't get significant speed boost here.
  // So write code to minimize size - no pregenerated tables
  // and array tools dependencies.


  // Use ordinary array, since untyped makes no boost here
  function makeTable() {
    var c, table = [];

    for (var n = 0; n < 256; n++) {
      c = n;
      for (var k = 0; k < 8; k++) {
        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      }
      table[n] = c;
    }

    return table;
  }

  // Create table on load. Just 255 signed longs. Not a problem.
  var crcTable = makeTable();


  function crc32(crc, buf, len, pos) {
    var t = crcTable,
        end = pos + len;

    crc ^= -1;

    for (var i = pos; i < end; i++) {
      crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
    }

    return (crc ^ (-1)); // >>> 0;
  }

  /* Public constants ==========================================================*/
  /* ===========================================================================*/


  /* Allowed flush values; see deflate() and inflate() below for details */
  var Z_NO_FLUSH$1 = 0;
  var Z_PARTIAL_FLUSH$1 = 1;
  //var Z_SYNC_FLUSH    = 2;
  var Z_FULL_FLUSH$1 = 3;
  var Z_FINISH$2 = 4;
  var Z_BLOCK$2 = 5;
  //var Z_TREES         = 6;


  /* Return codes for the compression/decompression functions. Negative values
   * are errors, positive values are used for special but normal events.
   */
  var Z_OK$2 = 0;
  var Z_STREAM_END$2 = 1;
  //var Z_NEED_DICT     = 2;
  //var Z_ERRNO         = -1;
  var Z_STREAM_ERROR$2 = -2;
  var Z_DATA_ERROR$2 = -3;
  //var Z_MEM_ERROR     = -4;
  var Z_BUF_ERROR$2 = -5;
  //var Z_VERSION_ERROR = -6;


  /* compression levels */
  //var Z_NO_COMPRESSION      = 0;
  //var Z_BEST_SPEED          = 1;
  //var Z_BEST_COMPRESSION    = 9;
  var Z_DEFAULT_COMPRESSION$1 = -1;


  var Z_FILTERED$1 = 1;
  var Z_HUFFMAN_ONLY$1 = 2;
  var Z_RLE$1 = 3;
  var Z_FIXED$1 = 4;

  /* Possible values of the data_type field (though see inflate()) */
  //var Z_BINARY              = 0;
  //var Z_TEXT                = 1;
  //var Z_ASCII               = 1; // = Z_TEXT
  var Z_UNKNOWN$1 = 2;


  /* The deflate compression method */
  var Z_DEFLATED$2 = 8;

  /*============================================================================*/


  var MAX_MEM_LEVEL = 9;


  var LENGTH_CODES = 29;
  /* number of length codes, not counting the special END_BLOCK code */
  var LITERALS = 256;
  /* number of literal bytes 0..255 */
  var L_CODES = LITERALS + 1 + LENGTH_CODES;
  /* number of Literal or Length codes, including the END_BLOCK code */
  var D_CODES = 30;
  /* number of distance codes */
  var BL_CODES = 19;
  /* number of codes used to transfer the bit lengths */
  var HEAP_SIZE = 2 * L_CODES + 1;
  /* maximum heap size */
  var MAX_BITS = 15;
  /* All codes must not exceed MAX_BITS bits */

  var MIN_MATCH = 3;
  var MAX_MATCH = 258;
  var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

  var PRESET_DICT = 0x20;

  var INIT_STATE = 42;
  var EXTRA_STATE = 69;
  var NAME_STATE = 73;
  var COMMENT_STATE = 91;
  var HCRC_STATE = 103;
  var BUSY_STATE = 113;
  var FINISH_STATE = 666;

  var BS_NEED_MORE = 1; /* block not completed, need more input or more output */
  var BS_BLOCK_DONE = 2; /* block flush performed */
  var BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
  var BS_FINISH_DONE = 4; /* finish done, accept no more input or output */

  var OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

  function err(strm, errorCode) {
    strm.msg = msg[errorCode];
    return errorCode;
  }

  function rank(f) {
    return ((f) << 1) - ((f) > 4 ? 9 : 0);
  }

  function zero(buf) {
    var len = buf.length;
    while (--len >= 0) {
      buf[len] = 0;
    }
  }


  /* =========================================================================
   * Flush as much pending output as possible. All deflate() output goes
   * through this function so some applications may wish to modify it
   * to avoid allocating a large strm->output buffer and copying into it.
   * (See also read_buf()).
   */
  function flush_pending(strm) {
    var s = strm.state;

    //_tr_flush_bits(s);
    var len = s.pending;
    if (len > strm.avail_out) {
      len = strm.avail_out;
    }
    if (len === 0) {
      return;
    }

    arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
    strm.next_out += len;
    s.pending_out += len;
    strm.total_out += len;
    strm.avail_out -= len;
    s.pending -= len;
    if (s.pending === 0) {
      s.pending_out = 0;
    }
  }


  function flush_block_only(s, last) {
    _tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
    s.block_start = s.strstart;
    flush_pending(s.strm);
  }


  function put_byte(s, b) {
    s.pending_buf[s.pending++] = b;
  }


  /* =========================================================================
   * Put a short in the pending buffer. The 16-bit value is put in MSB order.
   * IN assertion: the stream state is correct and there is enough room in
   * pending_buf.
   */
  function putShortMSB(s, b) {
    //  put_byte(s, (Byte)(b >> 8));
    //  put_byte(s, (Byte)(b & 0xff));
    s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
    s.pending_buf[s.pending++] = b & 0xff;
  }


  /* ===========================================================================
   * Read a new buffer from the current input stream, update the adler32
   * and total number of bytes read.  All deflate() input goes through
   * this function so some applications may wish to modify it to avoid
   * allocating a large strm->input buffer and copying from it.
   * (See also flush_pending()).
   */
  function read_buf(strm, buf, start, size) {
    var len = strm.avail_in;

    if (len > size) {
      len = size;
    }
    if (len === 0) {
      return 0;
    }

    strm.avail_in -= len;

    // zmemcpy(buf, strm->next_in, len);
    arraySet(buf, strm.input, strm.next_in, len, start);
    if (strm.state.wrap === 1) {
      strm.adler = adler32(strm.adler, buf, len, start);
    } else if (strm.state.wrap === 2) {
      strm.adler = crc32(strm.adler, buf, len, start);
    }

    strm.next_in += len;
    strm.total_in += len;

    return len;
  }


  /* ===========================================================================
   * Set match_start to the longest match starting at the given string and
   * return its length. Matches shorter or equal to prev_length are discarded,
   * in which case the result is equal to prev_length and match_start is
   * garbage.
   * IN assertions: cur_match is the head of the hash chain for the current
   *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
   * OUT assertion: the match length is not greater than s->lookahead.
   */
  function longest_match(s, cur_match) {
    var chain_length = s.max_chain_length; /* max hash chain length */
    var scan = s.strstart; /* current string */
    var match; /* matched string */
    var len; /* length of current match */
    var best_len = s.prev_length; /* best match length so far */
    var nice_match = s.nice_match; /* stop if match long enough */
    var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0 /*NIL*/ ;

    var _win = s.window; // shortcut

    var wmask = s.w_mask;
    var prev = s.prev;

    /* Stop when cur_match becomes <= limit. To simplify the code,
     * we prevent matches with the string of window index 0.
     */

    var strend = s.strstart + MAX_MATCH;
    var scan_end1 = _win[scan + best_len - 1];
    var scan_end = _win[scan + best_len];

    /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
     * It is easy to get rid of this optimization if necessary.
     */
    // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

    /* Do not waste too much time if we already have a good match: */
    if (s.prev_length >= s.good_match) {
      chain_length >>= 2;
    }
    /* Do not look for matches beyond the end of the input. This is necessary
     * to make deflate deterministic.
     */
    if (nice_match > s.lookahead) {
      nice_match = s.lookahead;
    }

    // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

    do {
      // Assert(cur_match < s->strstart, "no future");
      match = cur_match;

      /* Skip to next match if the match length cannot increase
       * or if the match length is less than 2.  Note that the checks below
       * for insufficient lookahead only occur occasionally for performance
       * reasons.  Therefore uninitialized memory will be accessed, and
       * conditional jumps will be made that depend on those values.
       * However the length of the match is limited to the lookahead, so
       * the output of deflate is not affected by the uninitialized values.
       */

      if (_win[match + best_len] !== scan_end ||
        _win[match + best_len - 1] !== scan_end1 ||
        _win[match] !== _win[scan] ||
        _win[++match] !== _win[scan + 1]) {
        continue;
      }

      /* The check at best_len-1 can be removed because it will be made
       * again later. (This heuristic is not always a win.)
       * It is not necessary to compare scan[2] and match[2] since they
       * are always equal when the other bytes match, given that
       * the hash keys are equal and that HASH_BITS >= 8.
       */
      scan += 2;
      match++;
      // Assert(*scan == *match, "match[2]?");

      /* We check for insufficient lookahead only every 8th comparison;
       * the 256th check will be made at strstart+258.
       */
      do {
        /*jshint noempty:false*/
      } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
        _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
        _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
        _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
        scan < strend);

      // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

      len = MAX_MATCH - (strend - scan);
      scan = strend - MAX_MATCH;

      if (len > best_len) {
        s.match_start = cur_match;
        best_len = len;
        if (len >= nice_match) {
          break;
        }
        scan_end1 = _win[scan + best_len - 1];
        scan_end = _win[scan + best_len];
      }
    } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

    if (best_len <= s.lookahead) {
      return best_len;
    }
    return s.lookahead;
  }


  /* ===========================================================================
   * Fill the window when the lookahead becomes insufficient.
   * Updates strstart and lookahead.
   *
   * IN assertion: lookahead < MIN_LOOKAHEAD
   * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
   *    At least one byte has been read, or avail_in == 0; reads are
   *    performed for at least two bytes (required for the zip translate_eol
   *    option -- not supported here).
   */
  function fill_window(s) {
    var _w_size = s.w_size;
    var p, n, m, more, str;

    //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

    do {
      more = s.window_size - s.lookahead - s.strstart;

      // JS ints have 32 bit, block below not needed
      /* Deal with !@#$% 64K limit: */
      //if (sizeof(int) <= 2) {
      //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
      //        more = wsize;
      //
      //  } else if (more == (unsigned)(-1)) {
      //        /* Very unlikely, but possible on 16 bit machine if
      //         * strstart == 0 && lookahead == 1 (input done a byte at time)
      //         */
      //        more--;
      //    }
      //}


      /* If the window is almost full and there is insufficient lookahead,
       * move the upper half to the lower one to make room in the upper half.
       */
      if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

        arraySet(s.window, s.window, _w_size, _w_size, 0);
        s.match_start -= _w_size;
        s.strstart -= _w_size;
        /* we now have strstart >= MAX_DIST */
        s.block_start -= _w_size;

        /* Slide the hash table (could be avoided with 32 bit values
         at the expense of memory usage). We slide even when level == 0
         to keep the hash table consistent if we switch back to level > 0
         later. (Using level 0 permanently is not an optimal usage of
         zlib, so we don't care about this pathological case.)
         */

        n = s.hash_size;
        p = n;
        do {
          m = s.head[--p];
          s.head[p] = (m >= _w_size ? m - _w_size : 0);
        } while (--n);

        n = _w_size;
        p = n;
        do {
          m = s.prev[--p];
          s.prev[p] = (m >= _w_size ? m - _w_size : 0);
          /* If n is not on any hash chain, prev[n] is garbage but
           * its value will never be used.
           */
        } while (--n);

        more += _w_size;
      }
      if (s.strm.avail_in === 0) {
        break;
      }

      /* If there was no sliding:
       *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
       *    more == window_size - lookahead - strstart
       * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
       * => more >= window_size - 2*WSIZE + 2
       * In the BIG_MEM or MMAP case (not yet supported),
       *   window_size == input_size + MIN_LOOKAHEAD  &&
       *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
       * Otherwise, window_size == 2*WSIZE so more >= 2.
       * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
       */
      //Assert(more >= 2, "more < 2");
      n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
      s.lookahead += n;

      /* Initialize the hash value now that we have some input: */
      if (s.lookahead + s.insert >= MIN_MATCH) {
        str = s.strstart - s.insert;
        s.ins_h = s.window[str];

        /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
        //#if MIN_MATCH != 3
        //        Call update_hash() MIN_MATCH-3 more times
        //#endif
        while (s.insert) {
          /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

          s.prev[str & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = str;
          str++;
          s.insert--;
          if (s.lookahead + s.insert < MIN_MATCH) {
            break;
          }
        }
      }
      /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
       * but this is not important since only literal bytes will be emitted.
       */

    } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

    /* If the WIN_INIT bytes after the end of the current data have never been
     * written, then zero those bytes in order to avoid memory check reports of
     * the use of uninitialized (or uninitialised as Julian writes) bytes by
     * the longest match routines.  Update the high water mark for the next
     * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
     * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
     */
    //  if (s.high_water < s.window_size) {
    //    var curr = s.strstart + s.lookahead;
    //    var init = 0;
    //
    //    if (s.high_water < curr) {
    //      /* Previous high water mark below current data -- zero WIN_INIT
    //       * bytes or up to end of window, whichever is less.
    //       */
    //      init = s.window_size - curr;
    //      if (init > WIN_INIT)
    //        init = WIN_INIT;
    //      zmemzero(s->window + curr, (unsigned)init);
    //      s->high_water = curr + init;
    //    }
    //    else if (s->high_water < (ulg)curr + WIN_INIT) {
    //      /* High water mark at or above current data, but below current data
    //       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
    //       * to end of window, whichever is less.
    //       */
    //      init = (ulg)curr + WIN_INIT - s->high_water;
    //      if (init > s->window_size - s->high_water)
    //        init = s->window_size - s->high_water;
    //      zmemzero(s->window + s->high_water, (unsigned)init);
    //      s->high_water += init;
    //    }
    //  }
    //
    //  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
    //    "not enough room for search");
  }

  /* ===========================================================================
   * Copy without compression as much as possible from the input stream, return
   * the current block state.
   * This function does not insert new strings in the dictionary since
   * uncompressible data is probably not useful. This function is used
   * only for the level=0 compression option.
   * NOTE: this function should be optimized to avoid extra copying from
   * window to pending_buf.
   */
  function deflate_stored(s, flush) {
    /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
     * to pending_buf_size, and each stored block has a 5 byte header:
     */
    var max_block_size = 0xffff;

    if (max_block_size > s.pending_buf_size - 5) {
      max_block_size = s.pending_buf_size - 5;
    }

    /* Copy as much as possible from input to output: */
    for (;;) {
      /* Fill the window as much as possible: */
      if (s.lookahead <= 1) {

        //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
        //  s->block_start >= (long)s->w_size, "slide too late");
        //      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
        //        s.block_start >= s.w_size)) {
        //        throw  new Error("slide too late");
        //      }

        fill_window(s);
        if (s.lookahead === 0 && flush === Z_NO_FLUSH$1) {
          return BS_NEED_MORE;
        }

        if (s.lookahead === 0) {
          break;
        }
        /* flush the current block */
      }
      //Assert(s->block_start >= 0L, "block gone");
      //    if (s.block_start < 0) throw new Error("block gone");

      s.strstart += s.lookahead;
      s.lookahead = 0;

      /* Emit a stored block if pending_buf will be full: */
      var max_start = s.block_start + max_block_size;

      if (s.strstart === 0 || s.strstart >= max_start) {
        /* strstart == 0 is possible when wraparound on 16-bit machine */
        s.lookahead = s.strstart - max_start;
        s.strstart = max_start;
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/


      }
      /* Flush if we may have to slide, otherwise block_start may become
       * negative and the data will be gone:
       */
      if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }
    }

    s.insert = 0;

    if (flush === Z_FINISH$2) {
      /*** FLUSH_BLOCK(s, 1); ***/
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      /***/
      return BS_FINISH_DONE;
    }

    if (s.strstart > s.block_start) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }

    return BS_NEED_MORE;
  }

  /* ===========================================================================
   * Compress as much as possible from the input stream, return the current
   * block state.
   * This function does not perform lazy evaluation of matches and inserts
   * new strings in the dictionary only for unmatched strings or for short
   * matches. It is used only for the fast compression options.
   */
  function deflate_fast(s, flush) {
    var hash_head; /* head of the hash chain */
    var bflush; /* set if current block must be flushed */

    for (;;) {
      /* Make sure that we always have enough lookahead, except
       * at the end of the input file. We need MAX_MATCH bytes
       * for the next match, plus MIN_MATCH bytes to insert the
       * string following the next match.
       */
      if (s.lookahead < MIN_LOOKAHEAD) {
        fill_window(s);
        if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$1) {
          return BS_NEED_MORE;
        }
        if (s.lookahead === 0) {
          break; /* flush the current block */
        }
      }

      /* Insert the string window[strstart .. strstart+2] in the
       * dictionary, and set hash_head to the head of the hash chain:
       */
      hash_head = 0 /*NIL*/ ;
      if (s.lookahead >= MIN_MATCH) {
        /*** INSERT_STRING(s, s.strstart, hash_head); ***/
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
        hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = s.strstart;
        /***/
      }

      /* Find the longest match, discarding those <= prev_length.
       * At this point we have always match_length < MIN_MATCH
       */
      if (hash_head !== 0 /*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
        /* To simplify the code, we prevent matches with the string
         * of window index 0 (in particular we have to avoid a match
         * of the string with itself at the start of the input file).
         */
        s.match_length = longest_match(s, hash_head);
        /* longest_match() sets match_start */
      }
      if (s.match_length >= MIN_MATCH) {
        // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

        /*** _tr_tally_dist(s, s.strstart - s.match_start,
                       s.match_length - MIN_MATCH, bflush); ***/
        bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

        s.lookahead -= s.match_length;

        /* Insert new strings in the hash table only if the match length
         * is not too large. This saves time but degrades compression.
         */
        if (s.match_length <= s.max_lazy_match /*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
          s.match_length--; /* string at strstart already in table */
          do {
            s.strstart++;
            /*** INSERT_STRING(s, s.strstart, hash_head); ***/
            s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
            /***/
            /* strstart never exceeds WSIZE-MAX_MATCH, so there are
             * always MIN_MATCH bytes ahead.
             */
          } while (--s.match_length !== 0);
          s.strstart++;
        } else {
          s.strstart += s.match_length;
          s.match_length = 0;
          s.ins_h = s.window[s.strstart];
          /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;

          //#if MIN_MATCH != 3
          //                Call UPDATE_HASH() MIN_MATCH-3 more times
          //#endif
          /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
           * matter since it will be recomputed at next deflate call.
           */
        }
      } else {
        /* No match, output a literal byte */
        //Tracevv((stderr,"%c", s.window[s.strstart]));
        /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
        bflush = _tr_tally(s, 0, s.window[s.strstart]);

        s.lookahead--;
        s.strstart++;
      }
      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }
    }
    s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
    if (flush === Z_FINISH$2) {
      /*** FLUSH_BLOCK(s, 1); ***/
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      /***/
      return BS_FINISH_DONE;
    }
    if (s.last_lit) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
    return BS_BLOCK_DONE;
  }

  /* ===========================================================================
   * Same as above, but achieves better compression. We use a lazy
   * evaluation for matches: a match is finally adopted only if there is
   * no better match at the next window position.
   */
  function deflate_slow(s, flush) {
    var hash_head; /* head of hash chain */
    var bflush; /* set if current block must be flushed */

    var max_insert;

    /* Process the input block. */
    for (;;) {
      /* Make sure that we always have enough lookahead, except
       * at the end of the input file. We need MAX_MATCH bytes
       * for the next match, plus MIN_MATCH bytes to insert the
       * string following the next match.
       */
      if (s.lookahead < MIN_LOOKAHEAD) {
        fill_window(s);
        if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$1) {
          return BS_NEED_MORE;
        }
        if (s.lookahead === 0) {
          break;
        } /* flush the current block */
      }

      /* Insert the string window[strstart .. strstart+2] in the
       * dictionary, and set hash_head to the head of the hash chain:
       */
      hash_head = 0 /*NIL*/ ;
      if (s.lookahead >= MIN_MATCH) {
        /*** INSERT_STRING(s, s.strstart, hash_head); ***/
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
        hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = s.strstart;
        /***/
      }

      /* Find the longest match, discarding those <= prev_length.
       */
      s.prev_length = s.match_length;
      s.prev_match = s.match_start;
      s.match_length = MIN_MATCH - 1;

      if (hash_head !== 0 /*NIL*/ && s.prev_length < s.max_lazy_match &&
        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD) /*MAX_DIST(s)*/ ) {
        /* To simplify the code, we prevent matches with the string
         * of window index 0 (in particular we have to avoid a match
         * of the string with itself at the start of the input file).
         */
        s.match_length = longest_match(s, hash_head);
        /* longest_match() sets match_start */

        if (s.match_length <= 5 &&
          (s.strategy === Z_FILTERED$1 || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096 /*TOO_FAR*/ ))) {

          /* If prev_match is also MIN_MATCH, match_start is garbage
           * but we will ignore the current match anyway.
           */
          s.match_length = MIN_MATCH - 1;
        }
      }
      /* If there was a match at the previous step and the current
       * match is not better, output the previous match:
       */
      if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
        max_insert = s.strstart + s.lookahead - MIN_MATCH;
        /* Do not insert strings in hash table beyond this. */

        //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

        /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                       s.prev_length - MIN_MATCH, bflush);***/
        bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
        /* Insert in hash table all strings up to the end of the match.
         * strstart-1 and strstart are already inserted. If there is not
         * enough lookahead, the last two strings are not inserted in
         * the hash table.
         */
        s.lookahead -= s.prev_length - 1;
        s.prev_length -= 2;
        do {
          if (++s.strstart <= max_insert) {
            /*** INSERT_STRING(s, s.strstart, hash_head); ***/
            s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
            /***/
          }
        } while (--s.prev_length !== 0);
        s.match_available = 0;
        s.match_length = MIN_MATCH - 1;
        s.strstart++;

        if (bflush) {
          /*** FLUSH_BLOCK(s, 0); ***/
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
          /***/
        }

      } else if (s.match_available) {
        /* If there was no match at the previous position, output a
         * single literal. If there was a match but the current match
         * is longer, truncate the previous match to a single literal.
         */
        //Tracevv((stderr,"%c", s->window[s->strstart-1]));
        /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
        bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

        if (bflush) {
          /*** FLUSH_BLOCK_ONLY(s, 0) ***/
          flush_block_only(s, false);
          /***/
        }
        s.strstart++;
        s.lookahead--;
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      } else {
        /* There is no previous match to compare with, wait for
         * the next step to decide.
         */
        s.match_available = 1;
        s.strstart++;
        s.lookahead--;
      }
    }
    //Assert (flush != Z_NO_FLUSH, "no flush?");
    if (s.match_available) {
      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
      bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

      s.match_available = 0;
    }
    s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
    if (flush === Z_FINISH$2) {
      /*** FLUSH_BLOCK(s, 1); ***/
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      /***/
      return BS_FINISH_DONE;
    }
    if (s.last_lit) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }

    return BS_BLOCK_DONE;
  }


  /* ===========================================================================
   * For Z_RLE, simply look for runs of bytes, generate matches only of distance
   * one.  Do not maintain a hash table.  (It will be regenerated if this run of
   * deflate switches away from Z_RLE.)
   */
  function deflate_rle(s, flush) {
    var bflush; /* set if current block must be flushed */
    var prev; /* byte at distance one to match */
    var scan, strend; /* scan goes up to strend for length of run */

    var _win = s.window;

    for (;;) {
      /* Make sure that we always have enough lookahead, except
       * at the end of the input file. We need MAX_MATCH bytes
       * for the longest run, plus one for the unrolled loop.
       */
      if (s.lookahead <= MAX_MATCH) {
        fill_window(s);
        if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH$1) {
          return BS_NEED_MORE;
        }
        if (s.lookahead === 0) {
          break;
        } /* flush the current block */
      }

      /* See how many times the previous byte repeats */
      s.match_length = 0;
      if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
        scan = s.strstart - 1;
        prev = _win[scan];
        if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
          strend = s.strstart + MAX_MATCH;
          do {
            /*jshint noempty:false*/
          } while (prev === _win[++scan] && prev === _win[++scan] &&
            prev === _win[++scan] && prev === _win[++scan] &&
            prev === _win[++scan] && prev === _win[++scan] &&
            prev === _win[++scan] && prev === _win[++scan] &&
            scan < strend);
          s.match_length = MAX_MATCH - (strend - scan);
          if (s.match_length > s.lookahead) {
            s.match_length = s.lookahead;
          }
        }
        //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
      }

      /* Emit match if have run of MIN_MATCH or longer, else emit literal */
      if (s.match_length >= MIN_MATCH) {
        //check_match(s, s.strstart, s.strstart - 1, s.match_length);

        /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
        bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);

        s.lookahead -= s.match_length;
        s.strstart += s.match_length;
        s.match_length = 0;
      } else {
        /* No match, output a literal byte */
        //Tracevv((stderr,"%c", s->window[s->strstart]));
        /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
        bflush = _tr_tally(s, 0, s.window[s.strstart]);

        s.lookahead--;
        s.strstart++;
      }
      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }
    }
    s.insert = 0;
    if (flush === Z_FINISH$2) {
      /*** FLUSH_BLOCK(s, 1); ***/
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      /***/
      return BS_FINISH_DONE;
    }
    if (s.last_lit) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
    return BS_BLOCK_DONE;
  }

  /* ===========================================================================
   * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
   * (It will be regenerated if this run of deflate switches away from Huffman.)
   */
  function deflate_huff(s, flush) {
    var bflush; /* set if current block must be flushed */

    for (;;) {
      /* Make sure that we have a literal to write. */
      if (s.lookahead === 0) {
        fill_window(s);
        if (s.lookahead === 0) {
          if (flush === Z_NO_FLUSH$1) {
            return BS_NEED_MORE;
          }
          break; /* flush the current block */
        }
      }

      /* Output a literal byte */
      s.match_length = 0;
      //Tracevv((stderr,"%c", s->window[s->strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = _tr_tally(s, 0, s.window[s.strstart]);
      s.lookahead--;
      s.strstart++;
      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }
    }
    s.insert = 0;
    if (flush === Z_FINISH$2) {
      /*** FLUSH_BLOCK(s, 1); ***/
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      /***/
      return BS_FINISH_DONE;
    }
    if (s.last_lit) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
    return BS_BLOCK_DONE;
  }

  /* Values for max_lazy_match, good_match and max_chain_length, depending on
   * the desired pack level (0..9). The values given below have been tuned to
   * exclude worst case performance for pathological files. Better values may be
   * found for specific files.
   */
  function Config(good_length, max_lazy, nice_length, max_chain, func) {
    this.good_length = good_length;
    this.max_lazy = max_lazy;
    this.nice_length = nice_length;
    this.max_chain = max_chain;
    this.func = func;
  }

  var configuration_table;

  configuration_table = [
    /*      good lazy nice chain */
    new Config(0, 0, 0, 0, deflate_stored), /* 0 store only */
    new Config(4, 4, 8, 4, deflate_fast), /* 1 max speed, no lazy matches */
    new Config(4, 5, 16, 8, deflate_fast), /* 2 */
    new Config(4, 6, 32, 32, deflate_fast), /* 3 */

    new Config(4, 4, 16, 16, deflate_slow), /* 4 lazy matches */
    new Config(8, 16, 32, 32, deflate_slow), /* 5 */
    new Config(8, 16, 128, 128, deflate_slow), /* 6 */
    new Config(8, 32, 128, 256, deflate_slow), /* 7 */
    new Config(32, 128, 258, 1024, deflate_slow), /* 8 */
    new Config(32, 258, 258, 4096, deflate_slow) /* 9 max compression */
  ];


  /* ===========================================================================
   * Initialize the "longest match" routines for a new zlib stream
   */
  function lm_init(s) {
    s.window_size = 2 * s.w_size;

    /*** CLEAR_HASH(s); ***/
    zero(s.head); // Fill with NIL (= 0);

    /* Set the default configuration parameters:
     */
    s.max_lazy_match = configuration_table[s.level].max_lazy;
    s.good_match = configuration_table[s.level].good_length;
    s.nice_match = configuration_table[s.level].nice_length;
    s.max_chain_length = configuration_table[s.level].max_chain;

    s.strstart = 0;
    s.block_start = 0;
    s.lookahead = 0;
    s.insert = 0;
    s.match_length = s.prev_length = MIN_MATCH - 1;
    s.match_available = 0;
    s.ins_h = 0;
  }


  function DeflateState() {
    this.strm = null; /* pointer back to this zlib stream */
    this.status = 0; /* as the name implies */
    this.pending_buf = null; /* output still pending */
    this.pending_buf_size = 0; /* size of pending_buf */
    this.pending_out = 0; /* next pending byte to output to the stream */
    this.pending = 0; /* nb of bytes in the pending buffer */
    this.wrap = 0; /* bit 0 true for zlib, bit 1 true for gzip */
    this.gzhead = null; /* gzip header information to write */
    this.gzindex = 0; /* where in extra, name, or comment */
    this.method = Z_DEFLATED$2; /* can only be DEFLATED */
    this.last_flush = -1; /* value of flush param for previous deflate call */

    this.w_size = 0; /* LZ77 window size (32K by default) */
    this.w_bits = 0; /* log2(w_size)  (8..16) */
    this.w_mask = 0; /* w_size - 1 */

    this.window = null;
    /* Sliding window. Input bytes are read into the second half of the window,
     * and move to the first half later to keep a dictionary of at least wSize
     * bytes. With this organization, matches are limited to a distance of
     * wSize-MAX_MATCH bytes, but this ensures that IO is always
     * performed with a length multiple of the block size.
     */

    this.window_size = 0;
    /* Actual size of window: 2*wSize, except when the user input buffer
     * is directly used as sliding window.
     */

    this.prev = null;
    /* Link to older string with same hash index. To limit the size of this
     * array to 64K, this link is maintained only for the last 32K strings.
     * An index in this array is thus a window index modulo 32K.
     */

    this.head = null; /* Heads of the hash chains or NIL. */

    this.ins_h = 0; /* hash index of string to be inserted */
    this.hash_size = 0; /* number of elements in hash table */
    this.hash_bits = 0; /* log2(hash_size) */
    this.hash_mask = 0; /* hash_size-1 */

    this.hash_shift = 0;
    /* Number of bits by which ins_h must be shifted at each input
     * step. It must be such that after MIN_MATCH steps, the oldest
     * byte no longer takes part in the hash key, that is:
     *   hash_shift * MIN_MATCH >= hash_bits
     */

    this.block_start = 0;
    /* Window position at the beginning of the current output block. Gets
     * negative when the window is moved backwards.
     */

    this.match_length = 0; /* length of best match */
    this.prev_match = 0; /* previous match */
    this.match_available = 0; /* set if previous match exists */
    this.strstart = 0; /* start of string to insert */
    this.match_start = 0; /* start of matching string */
    this.lookahead = 0; /* number of valid bytes ahead in window */

    this.prev_length = 0;
    /* Length of the best match at previous step. Matches not greater than this
     * are discarded. This is used in the lazy match evaluation.
     */

    this.max_chain_length = 0;
    /* To speed up deflation, hash chains are never searched beyond this
     * length.  A higher limit improves compression ratio but degrades the
     * speed.
     */

    this.max_lazy_match = 0;
    /* Attempt to find a better match only when the current match is strictly
     * smaller than this value. This mechanism is used only for compression
     * levels >= 4.
     */
    // That's alias to max_lazy_match, don't use directly
    //this.max_insert_length = 0;
    /* Insert new strings in the hash table only if the match length is not
     * greater than this length. This saves time but degrades compression.
     * max_insert_length is used only for compression levels <= 3.
     */

    this.level = 0; /* compression level (1..9) */
    this.strategy = 0; /* favor or force Huffman coding*/

    this.good_match = 0;
    /* Use a faster search when the previous match is longer than this */

    this.nice_match = 0; /* Stop searching when current match exceeds this */

    /* used by c: */

    /* Didn't use ct_data typedef below to suppress compiler warning */

    // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
    // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
    // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

    // Use flat array of DOUBLE size, with interleaved fata,
    // because JS does not support effective
    this.dyn_ltree = new Buf16(HEAP_SIZE * 2);
    this.dyn_dtree = new Buf16((2 * D_CODES + 1) * 2);
    this.bl_tree = new Buf16((2 * BL_CODES + 1) * 2);
    zero(this.dyn_ltree);
    zero(this.dyn_dtree);
    zero(this.bl_tree);

    this.l_desc = null; /* desc. for literal tree */
    this.d_desc = null; /* desc. for distance tree */
    this.bl_desc = null; /* desc. for bit length tree */

    //ush bl_count[MAX_BITS+1];
    this.bl_count = new Buf16(MAX_BITS + 1);
    /* number of codes at each bit length for an optimal tree */

    //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
    this.heap = new Buf16(2 * L_CODES + 1); /* heap used to build the Huffman trees */
    zero(this.heap);

    this.heap_len = 0; /* number of elements in the heap */
    this.heap_max = 0; /* element of largest frequency */
    /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
     * The same heap array is used to build all
     */

    this.depth = new Buf16(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
    zero(this.depth);
    /* Depth of each subtree used as tie breaker for trees of equal frequency
     */

    this.l_buf = 0; /* buffer index for literals or lengths */

    this.lit_bufsize = 0;
    /* Size of match buffer for literals/lengths.  There are 4 reasons for
     * limiting lit_bufsize to 64K:
     *   - frequencies can be kept in 16 bit counters
     *   - if compression is not successful for the first block, all input
     *     data is still in the window so we can still emit a stored block even
     *     when input comes from standard input.  (This can also be done for
     *     all blocks if lit_bufsize is not greater than 32K.)
     *   - if compression is not successful for a file smaller than 64K, we can
     *     even emit a stored file instead of a stored block (saving 5 bytes).
     *     This is applicable only for zip (not gzip or zlib).
     *   - creating new Huffman trees less frequently may not provide fast
     *     adaptation to changes in the input data statistics. (Take for
     *     example a binary file with poorly compressible code followed by
     *     a highly compressible string table.) Smaller buffer sizes give
     *     fast adaptation but have of course the overhead of transmitting
     *     trees more frequently.
     *   - I can't count above 4
     */

    this.last_lit = 0; /* running index in l_buf */

    this.d_buf = 0;
    /* Buffer index for distances. To simplify the code, d_buf and l_buf have
     * the same number of elements. To use different lengths, an extra flag
     * array would be necessary.
     */

    this.opt_len = 0; /* bit length of current block with optimal trees */
    this.static_len = 0; /* bit length of current block with static trees */
    this.matches = 0; /* number of string matches in current block */
    this.insert = 0; /* bytes at end of window left to insert */


    this.bi_buf = 0;
    /* Output buffer. bits are inserted starting at the bottom (least
     * significant bits).
     */
    this.bi_valid = 0;
    /* Number of valid bits in bi_buf.  All bits above the last valid bit
     * are always zero.
     */

    // Used for window memory init. We safely ignore it for JS. That makes
    // sense only for pointers and memory check tools.
    //this.high_water = 0;
    /* High water mark offset in window for initialized bytes -- bytes above
     * this are set to zero in order to avoid memory check warnings when
     * longest match routines access bytes past the input.  This is then
     * updated to the new high water mark.
     */
  }


  function deflateResetKeep(strm) {
    var s;

    if (!strm || !strm.state) {
      return err(strm, Z_STREAM_ERROR$2);
    }

    strm.total_in = strm.total_out = 0;
    strm.data_type = Z_UNKNOWN$1;

    s = strm.state;
    s.pending = 0;
    s.pending_out = 0;

    if (s.wrap < 0) {
      s.wrap = -s.wrap;
      /* was made negative by deflate(..., Z_FINISH); */
    }
    s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
    strm.adler = (s.wrap === 2) ?
      0 // crc32(0, Z_NULL, 0)
      :
      1; // adler32(0, Z_NULL, 0)
    s.last_flush = Z_NO_FLUSH$1;
    _tr_init(s);
    return Z_OK$2;
  }


  function deflateReset(strm) {
    var ret = deflateResetKeep(strm);
    if (ret === Z_OK$2) {
      lm_init(strm.state);
    }
    return ret;
  }


  function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
    if (!strm) { // === Z_NULL
      return Z_STREAM_ERROR$2;
    }
    var wrap = 1;

    if (level === Z_DEFAULT_COMPRESSION$1) {
      level = 6;
    }

    if (windowBits < 0) { /* suppress zlib wrapper */
      wrap = 0;
      windowBits = -windowBits;
    } else if (windowBits > 15) {
      wrap = 2; /* write gzip wrapper instead */
      windowBits -= 16;
    }


    if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED$2 ||
      windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
      strategy < 0 || strategy > Z_FIXED$1) {
      return err(strm, Z_STREAM_ERROR$2);
    }


    if (windowBits === 8) {
      windowBits = 9;
    }
    /* until 256-byte window bug fixed */

    var s = new DeflateState();

    strm.state = s;
    s.strm = strm;

    s.wrap = wrap;
    s.gzhead = null;
    s.w_bits = windowBits;
    s.w_size = 1 << s.w_bits;
    s.w_mask = s.w_size - 1;

    s.hash_bits = memLevel + 7;
    s.hash_size = 1 << s.hash_bits;
    s.hash_mask = s.hash_size - 1;
    s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

    s.window = new Buf8(s.w_size * 2);
    s.head = new Buf16(s.hash_size);
    s.prev = new Buf16(s.w_size);

    // Don't need mem init magic for JS.
    //s.high_water = 0;  /* nothing written to s->window yet */

    s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

    s.pending_buf_size = s.lit_bufsize * 4;

    //overlay = (ushf *) ZALLOC(strm, s->lit_bufsize, sizeof(ush)+2);
    //s->pending_buf = (uchf *) overlay;
    s.pending_buf = new Buf8(s.pending_buf_size);

    // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
    //s->d_buf = overlay + s->lit_bufsize/sizeof(ush);
    s.d_buf = 1 * s.lit_bufsize;

    //s->l_buf = s->pending_buf + (1+sizeof(ush))*s->lit_bufsize;
    s.l_buf = (1 + 2) * s.lit_bufsize;

    s.level = level;
    s.strategy = strategy;
    s.method = method;

    return deflateReset(strm);
  }


  function deflate$1(strm, flush) {
    var old_flush, s;
    var beg, val; // for gzip header write only

    if (!strm || !strm.state ||
      flush > Z_BLOCK$2 || flush < 0) {
      return strm ? err(strm, Z_STREAM_ERROR$2) : Z_STREAM_ERROR$2;
    }

    s = strm.state;

    if (!strm.output ||
      (!strm.input && strm.avail_in !== 0) ||
      (s.status === FINISH_STATE && flush !== Z_FINISH$2)) {
      return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR$2 : Z_STREAM_ERROR$2);
    }

    s.strm = strm; /* just in case */
    old_flush = s.last_flush;
    s.last_flush = flush;

    /* Write the header */
    if (s.status === INIT_STATE) {
      if (s.wrap === 2) {
        // GZIP header
        strm.adler = 0; //crc32(0L, Z_NULL, 0);
        put_byte(s, 31);
        put_byte(s, 139);
        put_byte(s, 8);
        if (!s.gzhead) { // s->gzhead == Z_NULL
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, s.level === 9 ? 2 :
            (s.strategy >= Z_HUFFMAN_ONLY$1 || s.level < 2 ?
              4 : 0));
          put_byte(s, OS_CODE);
          s.status = BUSY_STATE;
        } else {
          put_byte(s, (s.gzhead.text ? 1 : 0) +
            (s.gzhead.hcrc ? 2 : 0) +
            (!s.gzhead.extra ? 0 : 4) +
            (!s.gzhead.name ? 0 : 8) +
            (!s.gzhead.comment ? 0 : 16)
          );
          put_byte(s, s.gzhead.time & 0xff);
          put_byte(s, (s.gzhead.time >> 8) & 0xff);
          put_byte(s, (s.gzhead.time >> 16) & 0xff);
          put_byte(s, (s.gzhead.time >> 24) & 0xff);
          put_byte(s, s.level === 9 ? 2 :
            (s.strategy >= Z_HUFFMAN_ONLY$1 || s.level < 2 ?
              4 : 0));
          put_byte(s, s.gzhead.os & 0xff);
          if (s.gzhead.extra && s.gzhead.extra.length) {
            put_byte(s, s.gzhead.extra.length & 0xff);
            put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
          }
          if (s.gzhead.hcrc) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
          }
          s.gzindex = 0;
          s.status = EXTRA_STATE;
        }
      } else // DEFLATE header
      {
        var header = (Z_DEFLATED$2 + ((s.w_bits - 8) << 4)) << 8;
        var level_flags = -1;

        if (s.strategy >= Z_HUFFMAN_ONLY$1 || s.level < 2) {
          level_flags = 0;
        } else if (s.level < 6) {
          level_flags = 1;
        } else if (s.level === 6) {
          level_flags = 2;
        } else {
          level_flags = 3;
        }
        header |= (level_flags << 6);
        if (s.strstart !== 0) {
          header |= PRESET_DICT;
        }
        header += 31 - (header % 31);

        s.status = BUSY_STATE;
        putShortMSB(s, header);

        /* Save the adler32 of the preset dictionary: */
        if (s.strstart !== 0) {
          putShortMSB(s, strm.adler >>> 16);
          putShortMSB(s, strm.adler & 0xffff);
        }
        strm.adler = 1; // adler32(0L, Z_NULL, 0);
      }
    }

    //#ifdef GZIP
    if (s.status === EXTRA_STATE) {
      if (s.gzhead.extra /* != Z_NULL*/ ) {
        beg = s.pending; /* start of bytes to update crc */

        while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            flush_pending(strm);
            beg = s.pending;
            if (s.pending === s.pending_buf_size) {
              break;
            }
          }
          put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
          s.gzindex++;
        }
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        if (s.gzindex === s.gzhead.extra.length) {
          s.gzindex = 0;
          s.status = NAME_STATE;
        }
      } else {
        s.status = NAME_STATE;
      }
    }
    if (s.status === NAME_STATE) {
      if (s.gzhead.name /* != Z_NULL*/ ) {
        beg = s.pending; /* start of bytes to update crc */
        //int val;

        do {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            flush_pending(strm);
            beg = s.pending;
            if (s.pending === s.pending_buf_size) {
              val = 1;
              break;
            }
          }
          // JS specific: little magic to add zero terminator to end of string
          if (s.gzindex < s.gzhead.name.length) {
            val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
          } else {
            val = 0;
          }
          put_byte(s, val);
        } while (val !== 0);

        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        if (val === 0) {
          s.gzindex = 0;
          s.status = COMMENT_STATE;
        }
      } else {
        s.status = COMMENT_STATE;
      }
    }
    if (s.status === COMMENT_STATE) {
      if (s.gzhead.comment /* != Z_NULL*/ ) {
        beg = s.pending; /* start of bytes to update crc */
        //int val;

        do {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            flush_pending(strm);
            beg = s.pending;
            if (s.pending === s.pending_buf_size) {
              val = 1;
              break;
            }
          }
          // JS specific: little magic to add zero terminator to end of string
          if (s.gzindex < s.gzhead.comment.length) {
            val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
          } else {
            val = 0;
          }
          put_byte(s, val);
        } while (val !== 0);

        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        if (val === 0) {
          s.status = HCRC_STATE;
        }
      } else {
        s.status = HCRC_STATE;
      }
    }
    if (s.status === HCRC_STATE) {
      if (s.gzhead.hcrc) {
        if (s.pending + 2 > s.pending_buf_size) {
          flush_pending(strm);
        }
        if (s.pending + 2 <= s.pending_buf_size) {
          put_byte(s, strm.adler & 0xff);
          put_byte(s, (strm.adler >> 8) & 0xff);
          strm.adler = 0; //crc32(0L, Z_NULL, 0);
          s.status = BUSY_STATE;
        }
      } else {
        s.status = BUSY_STATE;
      }
    }
    //#endif

    /* Flush as much pending output as possible */
    if (s.pending !== 0) {
      flush_pending(strm);
      if (strm.avail_out === 0) {
        /* Since avail_out is 0, deflate will be called again with
         * more output space, but possibly with both pending and
         * avail_in equal to zero. There won't be anything to do,
         * but this is not an error situation so make sure we
         * return OK instead of BUF_ERROR at next call of deflate:
         */
        s.last_flush = -1;
        return Z_OK$2;
      }

      /* Make sure there is something to do and avoid duplicate consecutive
       * flushes. For repeated and useless calls with Z_FINISH, we keep
       * returning Z_STREAM_END instead of Z_BUF_ERROR.
       */
    } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
      flush !== Z_FINISH$2) {
      return err(strm, Z_BUF_ERROR$2);
    }

    /* User must not provide more input after the first FINISH: */
    if (s.status === FINISH_STATE && strm.avail_in !== 0) {
      return err(strm, Z_BUF_ERROR$2);
    }

    /* Start a new block or continue the current one.
     */
    if (strm.avail_in !== 0 || s.lookahead !== 0 ||
      (flush !== Z_NO_FLUSH$1 && s.status !== FINISH_STATE)) {
      var bstate = (s.strategy === Z_HUFFMAN_ONLY$1) ? deflate_huff(s, flush) :
        (s.strategy === Z_RLE$1 ? deflate_rle(s, flush) :
          configuration_table[s.level].func(s, flush));

      if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
        s.status = FINISH_STATE;
      }
      if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
        if (strm.avail_out === 0) {
          s.last_flush = -1;
          /* avoid BUF_ERROR next call, see above */
        }
        return Z_OK$2;
        /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
         * of deflate should use the same flush parameter to make sure
         * that the flush is complete. So we don't have to output an
         * empty block here, this will be done at next call. This also
         * ensures that for a very small output buffer, we emit at most
         * one empty block.
         */
      }
      if (bstate === BS_BLOCK_DONE) {
        if (flush === Z_PARTIAL_FLUSH$1) {
          _tr_align(s);
        } else if (flush !== Z_BLOCK$2) { /* FULL_FLUSH or SYNC_FLUSH */

          _tr_stored_block(s, 0, 0, false);
          /* For a full flush, this empty block will be recognized
           * as a special marker by inflate_sync().
           */
          if (flush === Z_FULL_FLUSH$1) {
            /*** CLEAR_HASH(s); ***/
            /* forget history */
            zero(s.head); // Fill with NIL (= 0);

            if (s.lookahead === 0) {
              s.strstart = 0;
              s.block_start = 0;
              s.insert = 0;
            }
          }
        }
        flush_pending(strm);
        if (strm.avail_out === 0) {
          s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
          return Z_OK$2;
        }
      }
    }
    //Assert(strm->avail_out > 0, "bug2");
    //if (strm.avail_out <= 0) { throw new Error("bug2");}

    if (flush !== Z_FINISH$2) {
      return Z_OK$2;
    }
    if (s.wrap <= 0) {
      return Z_STREAM_END$2;
    }

    /* Write the trailer */
    if (s.wrap === 2) {
      put_byte(s, strm.adler & 0xff);
      put_byte(s, (strm.adler >> 8) & 0xff);
      put_byte(s, (strm.adler >> 16) & 0xff);
      put_byte(s, (strm.adler >> 24) & 0xff);
      put_byte(s, strm.total_in & 0xff);
      put_byte(s, (strm.total_in >> 8) & 0xff);
      put_byte(s, (strm.total_in >> 16) & 0xff);
      put_byte(s, (strm.total_in >> 24) & 0xff);
    } else {
      putShortMSB(s, strm.adler >>> 16);
      putShortMSB(s, strm.adler & 0xffff);
    }

    flush_pending(strm);
    /* If avail_out is zero, the application will call deflate again
     * to flush the rest.
     */
    if (s.wrap > 0) {
      s.wrap = -s.wrap;
    }
    /* write the trailer only once! */
    return s.pending !== 0 ? Z_OK$2 : Z_STREAM_END$2;
  }

  function deflateEnd(strm) {
    var status;

    if (!strm /*== Z_NULL*/ || !strm.state /*== Z_NULL*/ ) {
      return Z_STREAM_ERROR$2;
    }

    status = strm.state.status;
    if (status !== INIT_STATE &&
      status !== EXTRA_STATE &&
      status !== NAME_STATE &&
      status !== COMMENT_STATE &&
      status !== HCRC_STATE &&
      status !== BUSY_STATE &&
      status !== FINISH_STATE
    ) {
      return err(strm, Z_STREAM_ERROR$2);
    }

    strm.state = null;

    return status === BUSY_STATE ? err(strm, Z_DATA_ERROR$2) : Z_OK$2;
  }

  /* Not implemented
  exports.deflateBound = deflateBound;
  exports.deflateCopy = deflateCopy;
  exports.deflateParams = deflateParams;
  exports.deflatePending = deflatePending;
  exports.deflatePrime = deflatePrime;
  exports.deflateTune = deflateTune;
  */

  // See state defs from inflate.js
  var BAD$1 = 30;       /* got a data error -- remain here until reset */
  var TYPE$1 = 12;      /* i: waiting for type bits, including last-flag bit */

  /*
     Decode literal, length, and distance codes and write out the resulting
     literal and match bytes until either not enough input or output is
     available, an end-of-block is encountered, or a data error is encountered.
     When large enough input and output buffers are supplied to inflate(), for
     example, a 16K input buffer and a 64K output buffer, more than 95% of the
     inflate execution time is spent in this routine.

     Entry assumptions:

          state.mode === LEN
          strm.avail_in >= 6
          strm.avail_out >= 258
          start >= strm.avail_out
          state.bits < 8

     On return, state.mode is one of:

          LEN -- ran out of enough output space or enough available input
          TYPE -- reached end of block code, inflate() to interpret next block
          BAD -- error in block data

     Notes:

      - The maximum input bits used by a length/distance pair is 15 bits for the
        length code, 5 bits for the length extra, 15 bits for the distance code,
        and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
        Therefore if strm.avail_in >= 6, then there is enough input to avoid
        checking for available input while decoding.

      - The maximum bytes that a single length/distance pair can output is 258
        bytes, which is the maximum length that can be coded.  inflate_fast()
        requires strm.avail_out >= 258 for each loop to avoid checking for
        output space.
   */
  function inflate_fast(strm, start) {
    var state;
    var _in;                    /* local strm.input */
    var last;                   /* have enough input while in < last */
    var _out;                   /* local strm.output */
    var beg;                    /* inflate()'s initial strm.output */
    var end;                    /* while out < end, enough space available */
  //#ifdef INFLATE_STRICT
    var dmax;                   /* maximum distance from zlib header */
  //#endif
    var wsize;                  /* window size or zero if not using window */
    var whave;                  /* valid bytes in the window */
    var wnext;                  /* window write index */
    // Use `s_window` instead `window`, avoid conflict with instrumentation tools
    var s_window;               /* allocated sliding window, if wsize != 0 */
    var hold;                   /* local strm.hold */
    var bits;                   /* local strm.bits */
    var lcode;                  /* local strm.lencode */
    var dcode;                  /* local strm.distcode */
    var lmask;                  /* mask for first level of length codes */
    var dmask;                  /* mask for first level of distance codes */
    var here;                   /* retrieved table entry */
    var op;                     /* code bits, operation, extra bits, or */
                                /*  window position, window bytes to copy */
    var len;                    /* match length, unused bytes */
    var dist;                   /* match distance */
    var from;                   /* where to copy match from */
    var from_source;


    var input, output; // JS specific, because we have no pointers

    /* copy state to local variables */
    state = strm.state;
    //here = state.here;
    _in = strm.next_in;
    input = strm.input;
    last = _in + (strm.avail_in - 5);
    _out = strm.next_out;
    output = strm.output;
    beg = _out - (start - strm.avail_out);
    end = _out + (strm.avail_out - 257);
  //#ifdef INFLATE_STRICT
    dmax = state.dmax;
  //#endif
    wsize = state.wsize;
    whave = state.whave;
    wnext = state.wnext;
    s_window = state.window;
    hold = state.hold;
    bits = state.bits;
    lcode = state.lencode;
    dcode = state.distcode;
    lmask = (1 << state.lenbits) - 1;
    dmask = (1 << state.distbits) - 1;


    /* decode literals and length/distances until end-of-block or not enough
       input data or output space */

    top:
    do {
      if (bits < 15) {
        hold += input[_in++] << bits;
        bits += 8;
        hold += input[_in++] << bits;
        bits += 8;
      }

      here = lcode[hold & lmask];

      dolen:
      for (;;) { // Goto emulation
        op = here >>> 24/*here.bits*/;
        hold >>>= op;
        bits -= op;
        op = (here >>> 16) & 0xff/*here.op*/;
        if (op === 0) {                          /* literal */
          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
          //        "inflate:         literal '%c'\n" :
          //        "inflate:         literal 0x%02x\n", here.val));
          output[_out++] = here & 0xffff/*here.val*/;
        }
        else if (op & 16) {                     /* length base */
          len = here & 0xffff/*here.val*/;
          op &= 15;                           /* number of extra bits */
          if (op) {
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
            }
            len += hold & ((1 << op) - 1);
            hold >>>= op;
            bits -= op;
          }
          //Tracevv((stderr, "inflate:         length %u\n", len));
          if (bits < 15) {
            hold += input[_in++] << bits;
            bits += 8;
            hold += input[_in++] << bits;
            bits += 8;
          }
          here = dcode[hold & dmask];

          dodist:
          for (;;) { // goto emulation
            op = here >>> 24/*here.bits*/;
            hold >>>= op;
            bits -= op;
            op = (here >>> 16) & 0xff/*here.op*/;

            if (op & 16) {                      /* distance base */
              dist = here & 0xffff/*here.val*/;
              op &= 15;                       /* number of extra bits */
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
                if (bits < op) {
                  hold += input[_in++] << bits;
                  bits += 8;
                }
              }
              dist += hold & ((1 << op) - 1);
  //#ifdef INFLATE_STRICT
              if (dist > dmax) {
                strm.msg = 'invalid distance too far back';
                state.mode = BAD$1;
                break top;
              }
  //#endif
              hold >>>= op;
              bits -= op;
              //Tracevv((stderr, "inflate:         distance %u\n", dist));
              op = _out - beg;                /* max distance in output */
              if (dist > op) {                /* see if copy from window */
                op = dist - op;               /* distance back in window */
                if (op > whave) {
                  if (state.sane) {
                    strm.msg = 'invalid distance too far back';
                    state.mode = BAD$1;
                    break top;
                  }

  // (!) This block is disabled in zlib defailts,
  // don't enable it for binary compatibility
  //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
  //                if (len <= op - whave) {
  //                  do {
  //                    output[_out++] = 0;
  //                  } while (--len);
  //                  continue top;
  //                }
  //                len -= op - whave;
  //                do {
  //                  output[_out++] = 0;
  //                } while (--op > whave);
  //                if (op === 0) {
  //                  from = _out - dist;
  //                  do {
  //                    output[_out++] = output[from++];
  //                  } while (--len);
  //                  continue top;
  //                }
  //#endif
                }
                from = 0; // window index
                from_source = s_window;
                if (wnext === 0) {           /* very common case */
                  from += wsize - op;
                  if (op < len) {         /* some from window */
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;  /* rest from output */
                    from_source = output;
                  }
                }
                else if (wnext < op) {      /* wrap around window */
                  from += wsize + wnext - op;
                  op -= wnext;
                  if (op < len) {         /* some from end of window */
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = 0;
                    if (wnext < len) {  /* some from start of window */
                      op = wnext;
                      len -= op;
                      do {
                        output[_out++] = s_window[from++];
                      } while (--op);
                      from = _out - dist;      /* rest from output */
                      from_source = output;
                    }
                  }
                }
                else {                      /* contiguous in window */
                  from += wnext - op;
                  if (op < len) {         /* some from window */
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;  /* rest from output */
                    from_source = output;
                  }
                }
                while (len > 2) {
                  output[_out++] = from_source[from++];
                  output[_out++] = from_source[from++];
                  output[_out++] = from_source[from++];
                  len -= 3;
                }
                if (len) {
                  output[_out++] = from_source[from++];
                  if (len > 1) {
                    output[_out++] = from_source[from++];
                  }
                }
              }
              else {
                from = _out - dist;          /* copy direct from output */
                do {                        /* minimum length is three */
                  output[_out++] = output[from++];
                  output[_out++] = output[from++];
                  output[_out++] = output[from++];
                  len -= 3;
                } while (len > 2);
                if (len) {
                  output[_out++] = output[from++];
                  if (len > 1) {
                    output[_out++] = output[from++];
                  }
                }
              }
            }
            else if ((op & 64) === 0) {          /* 2nd level distance code */
              here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
              continue dodist;
            }
            else {
              strm.msg = 'invalid distance code';
              state.mode = BAD$1;
              break top;
            }

            break; // need to emulate goto via "continue"
          }
        }
        else if ((op & 64) === 0) {              /* 2nd level length code */
          here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
          continue dolen;
        }
        else if (op & 32) {                     /* end-of-block */
          //Tracevv((stderr, "inflate:         end of block\n"));
          state.mode = TYPE$1;
          break top;
        }
        else {
          strm.msg = 'invalid literal/length code';
          state.mode = BAD$1;
          break top;
        }

        break; // need to emulate goto via "continue"
      }
    } while (_in < last && _out < end);

    /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
    len = bits >> 3;
    _in -= len;
    bits -= len << 3;
    hold &= (1 << bits) - 1;

    /* update state and return */
    strm.next_in = _in;
    strm.next_out = _out;
    strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
    strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
    state.hold = hold;
    state.bits = bits;
    return;
  }

  var MAXBITS = 15;
  var ENOUGH_LENS$1 = 852;
  var ENOUGH_DISTS$1 = 592;
  //var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

  var CODES$1 = 0;
  var LENS$1 = 1;
  var DISTS$1 = 2;

  var lbase = [ /* Length codes 257..285 base */
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
    35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
  ];

  var lext = [ /* Length codes 257..285 extra */
    16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
    19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
  ];

  var dbase = [ /* Distance codes 0..29 base */
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
    257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
    8193, 12289, 16385, 24577, 0, 0
  ];

  var dext = [ /* Distance codes 0..29 extra */
    16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
    23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
    28, 28, 29, 29, 64, 64
  ];

  function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
    var bits = opts.bits;
    //here = opts.here; /* table entry for duplication */

    var len = 0; /* a code's length in bits */
    var sym = 0; /* index of code symbols */
    var min = 0,
      max = 0; /* minimum and maximum code lengths */
    var root = 0; /* number of index bits for root table */
    var curr = 0; /* number of index bits for current table */
    var drop = 0; /* code bits to drop for sub-table */
    var left = 0; /* number of prefix codes available */
    var used = 0; /* code entries in table used */
    var huff = 0; /* Huffman code */
    var incr; /* for incrementing code, index */
    var fill; /* index for replicating entries */
    var low; /* low bits for current root entry */
    var mask; /* mask for low root bits */
    var next; /* next available space in table */
    var base = null; /* base value table to use */
    var base_index = 0;
    //  var shoextra;    /* extra bits table to use */
    var end; /* use base and extra for symbol > end */
    var count = new Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
    var offs = new Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
    var extra = null;
    var extra_index = 0;

    var here_bits, here_op, here_val;

    /*
     Process a set of code lengths to create a canonical Huffman code.  The
     code lengths are lens[0..codes-1].  Each length corresponds to the
     symbols 0..codes-1.  The Huffman code is generated by first sorting the
     symbols by length from short to long, and retaining the symbol order
     for codes with equal lengths.  Then the code starts with all zero bits
     for the first code of the shortest length, and the codes are integer
     increments for the same length, and zeros are appended as the length
     increases.  For the deflate format, these bits are stored backwards
     from their more natural integer increment ordering, and so when the
     decoding tables are built in the large loop below, the integer codes
     are incremented backwards.

     This routine assumes, but does not check, that all of the entries in
     lens[] are in the range 0..MAXBITS.  The caller must assure this.
     1..MAXBITS is interpreted as that code length.  zero means that that
     symbol does not occur in this code.

     The codes are sorted by computing a count of codes for each length,
     creating from that a table of starting indices for each length in the
     sorted table, and then entering the symbols in order in the sorted
     table.  The sorted table is work[], with that space being provided by
     the caller.

     The length counts are used for other purposes as well, i.e. finding
     the minimum and maximum length codes, determining if there are any
     codes at all, checking for a valid set of lengths, and looking ahead
     at length counts to determine sub-table sizes when building the
     decoding tables.
     */

    /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
    for (len = 0; len <= MAXBITS; len++) {
      count[len] = 0;
    }
    for (sym = 0; sym < codes; sym++) {
      count[lens[lens_index + sym]]++;
    }

    /* bound code lengths, force root to be within code lengths */
    root = bits;
    for (max = MAXBITS; max >= 1; max--) {
      if (count[max] !== 0) {
        break;
      }
    }
    if (root > max) {
      root = max;
    }
    if (max === 0) { /* no symbols to code at all */
      //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
      //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
      //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
      table[table_index++] = (1 << 24) | (64 << 16) | 0;


      //table.op[opts.table_index] = 64;
      //table.bits[opts.table_index] = 1;
      //table.val[opts.table_index++] = 0;
      table[table_index++] = (1 << 24) | (64 << 16) | 0;

      opts.bits = 1;
      return 0; /* no symbols, but wait for decoding to report error */
    }
    for (min = 1; min < max; min++) {
      if (count[min] !== 0) {
        break;
      }
    }
    if (root < min) {
      root = min;
    }

    /* check for an over-subscribed or incomplete set of lengths */
    left = 1;
    for (len = 1; len <= MAXBITS; len++) {
      left <<= 1;
      left -= count[len];
      if (left < 0) {
        return -1;
      } /* over-subscribed */
    }
    if (left > 0 && (type === CODES$1 || max !== 1)) {
      return -1; /* incomplete set */
    }

    /* generate offsets into symbol table for each length for sorting */
    offs[1] = 0;
    for (len = 1; len < MAXBITS; len++) {
      offs[len + 1] = offs[len] + count[len];
    }

    /* sort symbols by length, by symbol order within each length */
    for (sym = 0; sym < codes; sym++) {
      if (lens[lens_index + sym] !== 0) {
        work[offs[lens[lens_index + sym]]++] = sym;
      }
    }

    /*
     Create and fill in decoding tables.  In this loop, the table being
     filled is at next and has curr index bits.  The code being used is huff
     with length len.  That code is converted to an index by dropping drop
     bits off of the bottom.  For codes where len is less than drop + curr,
     those top drop + curr - len bits are incremented through all values to
     fill the table with replicated entries.

     root is the number of index bits for the root table.  When len exceeds
     root, sub-tables are created pointed to by the root entry with an index
     of the low root bits of huff.  This is saved in low to check for when a
     new sub-table should be started.  drop is zero when the root table is
     being filled, and drop is root when sub-tables are being filled.

     When a new sub-table is needed, it is necessary to look ahead in the
     code lengths to determine what size sub-table is needed.  The length
     counts are used for this, and so count[] is decremented as codes are
     entered in the tables.

     used keeps track of how many table entries have been allocated from the
     provided *table space.  It is checked for LENS and DIST tables against
     the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
     the initial root table size constants.  See the comments in inftrees.h
     for more information.

     sym increments through all symbols, and the loop terminates when
     all codes of length max, i.e. all codes, have been processed.  This
     routine permits incomplete codes, so another loop after this one fills
     in the rest of the decoding tables with invalid code markers.
     */

    /* set up for code type */
    // poor man optimization - use if-else instead of switch,
    // to avoid deopts in old v8
    if (type === CODES$1) {
      base = extra = work; /* dummy value--not used */
      end = 19;

    } else if (type === LENS$1) {
      base = lbase;
      base_index -= 257;
      extra = lext;
      extra_index -= 257;
      end = 256;

    } else { /* DISTS */
      base = dbase;
      extra = dext;
      end = -1;
    }

    /* initialize opts for loop */
    huff = 0; /* starting code */
    sym = 0; /* starting code symbol */
    len = min; /* starting code length */
    next = table_index; /* current table to fill in */
    curr = root; /* current table index bits */
    drop = 0; /* current bits to drop from code for index */
    low = -1; /* trigger new sub-table when len > root */
    used = 1 << root; /* use root table entries */
    mask = used - 1; /* mask for comparing low */

    /* check available table space */
    if ((type === LENS$1 && used > ENOUGH_LENS$1) ||
      (type === DISTS$1 && used > ENOUGH_DISTS$1)) {
      return 1;
    }
    /* process all codes and make table entries */
    for (;;) {
      /* create table entry */
      here_bits = len - drop;
      if (work[sym] < end) {
        here_op = 0;
        here_val = work[sym];
      } else if (work[sym] > end) {
        here_op = extra[extra_index + work[sym]];
        here_val = base[base_index + work[sym]];
      } else {
        here_op = 32 + 64; /* end of block */
        here_val = 0;
      }

      /* replicate for those indices with low len bits equal to huff */
      incr = 1 << (len - drop);
      fill = 1 << curr;
      min = fill; /* save offset to next table */
      do {
        fill -= incr;
        table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val | 0;
      } while (fill !== 0);

      /* backwards increment the len-bit code huff */
      incr = 1 << (len - 1);
      while (huff & incr) {
        incr >>= 1;
      }
      if (incr !== 0) {
        huff &= incr - 1;
        huff += incr;
      } else {
        huff = 0;
      }

      /* go to next symbol, update count, len */
      sym++;
      if (--count[len] === 0) {
        if (len === max) {
          break;
        }
        len = lens[lens_index + work[sym]];
      }

      /* create new sub-table if needed */
      if (len > root && (huff & mask) !== low) {
        /* if first time, transition to sub-tables */
        if (drop === 0) {
          drop = root;
        }

        /* increment past last table */
        next += min; /* here min is 1 << curr */

        /* determine length of next table */
        curr = len - drop;
        left = 1 << curr;
        while (curr + drop < max) {
          left -= count[curr + drop];
          if (left <= 0) {
            break;
          }
          curr++;
          left <<= 1;
        }

        /* check for enough space */
        used += 1 << curr;
        if ((type === LENS$1 && used > ENOUGH_LENS$1) ||
          (type === DISTS$1 && used > ENOUGH_DISTS$1)) {
          return 1;
        }

        /* point entry in root table to sub-table */
        low = huff & mask;
        /*table.op[low] = curr;
        table.bits[low] = root;
        table.val[low] = next - opts.table_index;*/
        table[low] = (root << 24) | (curr << 16) | (next - table_index) | 0;
      }
    }

    /* fill in remaining table entry if code is incomplete (guaranteed to have
     at most one remaining entry, since if the code is incomplete, the
     maximum code length that was allowed to get this far is one bit) */
    if (huff !== 0) {
      //table.op[next + huff] = 64;            /* invalid code marker */
      //table.bits[next + huff] = len - drop;
      //table.val[next + huff] = 0;
      table[next + huff] = ((len - drop) << 24) | (64 << 16) | 0;
    }

    /* set return parameters */
    //opts.table_index += used;
    opts.bits = root;
    return 0;
  }

  var CODES = 0;
  var LENS = 1;
  var DISTS = 2;

  /* Public constants ==========================================================*/
  /* ===========================================================================*/


  /* Allowed flush values; see deflate() and inflate() below for details */
  //var Z_NO_FLUSH      = 0;
  //var Z_PARTIAL_FLUSH = 1;
  //var Z_SYNC_FLUSH    = 2;
  //var Z_FULL_FLUSH    = 3;
  var Z_FINISH$1 = 4;
  var Z_BLOCK$1 = 5;
  var Z_TREES$1 = 6;


  /* Return codes for the compression/decompression functions. Negative values
   * are errors, positive values are used for special but normal events.
   */
  var Z_OK$1 = 0;
  var Z_STREAM_END$1 = 1;
  var Z_NEED_DICT$1 = 2;
  //var Z_ERRNO         = -1;
  var Z_STREAM_ERROR$1 = -2;
  var Z_DATA_ERROR$1 = -3;
  var Z_MEM_ERROR = -4;
  var Z_BUF_ERROR$1 = -5;
  //var Z_VERSION_ERROR = -6;

  /* The deflate compression method */
  var Z_DEFLATED$1 = 8;


  /* STATES ====================================================================*/
  /* ===========================================================================*/


  var HEAD = 1; /* i: waiting for magic header */
  var FLAGS = 2; /* i: waiting for method and flags (gzip) */
  var TIME = 3; /* i: waiting for modification time (gzip) */
  var OS = 4; /* i: waiting for extra flags and operating system (gzip) */
  var EXLEN = 5; /* i: waiting for extra length (gzip) */
  var EXTRA = 6; /* i: waiting for extra bytes (gzip) */
  var NAME = 7; /* i: waiting for end of file name (gzip) */
  var COMMENT = 8; /* i: waiting for end of comment (gzip) */
  var HCRC = 9; /* i: waiting for header crc (gzip) */
  var DICTID = 10; /* i: waiting for dictionary check value */
  var DICT = 11; /* waiting for inflateSetDictionary() call */
  var TYPE = 12; /* i: waiting for type bits, including last-flag bit */
  var TYPEDO = 13; /* i: same, but skip check to exit inflate on new block */
  var STORED = 14; /* i: waiting for stored size (length and complement) */
  var COPY_ = 15; /* i/o: same as COPY below, but only first time in */
  var COPY = 16; /* i/o: waiting for input or output to copy stored block */
  var TABLE = 17; /* i: waiting for dynamic block table lengths */
  var LENLENS = 18; /* i: waiting for code length code lengths */
  var CODELENS = 19; /* i: waiting for length/lit and distance code lengths */
  var LEN_ = 20; /* i: same as LEN below, but only first time in */
  var LEN = 21; /* i: waiting for length/lit/eob code */
  var LENEXT = 22; /* i: waiting for length extra bits */
  var DIST = 23; /* i: waiting for distance code */
  var DISTEXT = 24; /* i: waiting for distance extra bits */
  var MATCH = 25; /* o: waiting for output space to copy string */
  var LIT = 26; /* o: waiting for output space to write literal */
  var CHECK = 27; /* i: waiting for 32-bit check value */
  var LENGTH = 28; /* i: waiting for 32-bit length (gzip) */
  var DONE = 29; /* finished check, done -- remain here until reset */
  var BAD = 30; /* got a data error -- remain here until reset */
  var MEM = 31; /* got an inflate() memory error -- remain here until reset */
  var SYNC = 32; /* looking for synchronization bytes to restart inflate() */

  /* ===========================================================================*/



  var ENOUGH_LENS = 852;
  var ENOUGH_DISTS = 592;


  function zswap32(q) {
    return (((q >>> 24) & 0xff) +
      ((q >>> 8) & 0xff00) +
      ((q & 0xff00) << 8) +
      ((q & 0xff) << 24));
  }


  function InflateState() {
    this.mode = 0; /* current inflate mode */
    this.last = false; /* true if processing last block */
    this.wrap = 0; /* bit 0 true for zlib, bit 1 true for gzip */
    this.havedict = false; /* true if dictionary provided */
    this.flags = 0; /* gzip header method and flags (0 if zlib) */
    this.dmax = 0; /* zlib header max distance (INFLATE_STRICT) */
    this.check = 0; /* protected copy of check value */
    this.total = 0; /* protected copy of output count */
    // TODO: may be {}
    this.head = null; /* where to save gzip header information */

    /* sliding window */
    this.wbits = 0; /* log base 2 of requested window size */
    this.wsize = 0; /* window size or zero if not using window */
    this.whave = 0; /* valid bytes in the window */
    this.wnext = 0; /* window write index */
    this.window = null; /* allocated sliding window, if needed */

    /* bit accumulator */
    this.hold = 0; /* input bit accumulator */
    this.bits = 0; /* number of bits in "in" */

    /* for string and stored block copying */
    this.length = 0; /* literal or length of data to copy */
    this.offset = 0; /* distance back to copy string from */

    /* for table and code decoding */
    this.extra = 0; /* extra bits needed */

    /* fixed and dynamic code tables */
    this.lencode = null; /* starting table for length/literal codes */
    this.distcode = null; /* starting table for distance codes */
    this.lenbits = 0; /* index bits for lencode */
    this.distbits = 0; /* index bits for distcode */

    /* dynamic table building */
    this.ncode = 0; /* number of code length code lengths */
    this.nlen = 0; /* number of length code lengths */
    this.ndist = 0; /* number of distance code lengths */
    this.have = 0; /* number of code lengths in lens[] */
    this.next = null; /* next available space in codes[] */

    this.lens = new Buf16(320); /* temporary storage for code lengths */
    this.work = new Buf16(288); /* work area for code table building */

    /*
     because we don't have pointers in js, we use lencode and distcode directly
     as buffers so we don't need codes
    */
    //this.codes = new Buf32(ENOUGH);       /* space for code tables */
    this.lendyn = null; /* dynamic table for length/literal codes (JS specific) */
    this.distdyn = null; /* dynamic table for distance codes (JS specific) */
    this.sane = 0; /* if false, allow invalid distance too far */
    this.back = 0; /* bits back of last unprocessed length/lit */
    this.was = 0; /* initial length of match */
  }

  function inflateResetKeep(strm) {
    var state;

    if (!strm || !strm.state) {
      return Z_STREAM_ERROR$1;
    }
    state = strm.state;
    strm.total_in = strm.total_out = state.total = 0;
    strm.msg = ''; /*Z_NULL*/
    if (state.wrap) { /* to support ill-conceived Java test suite */
      strm.adler = state.wrap & 1;
    }
    state.mode = HEAD;
    state.last = 0;
    state.havedict = 0;
    state.dmax = 32768;
    state.head = null /*Z_NULL*/ ;
    state.hold = 0;
    state.bits = 0;
    //state.lencode = state.distcode = state.next = state.codes;
    state.lencode = state.lendyn = new Buf32(ENOUGH_LENS);
    state.distcode = state.distdyn = new Buf32(ENOUGH_DISTS);

    state.sane = 1;
    state.back = -1;
    //Tracev((stderr, "inflate: reset\n"));
    return Z_OK$1;
  }

  function inflateReset(strm) {
    var state;

    if (!strm || !strm.state) {
      return Z_STREAM_ERROR$1;
    }
    state = strm.state;
    state.wsize = 0;
    state.whave = 0;
    state.wnext = 0;
    return inflateResetKeep(strm);

  }

  function inflateReset2(strm, windowBits) {
    var wrap;
    var state;

    /* get the state */
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR$1;
    }
    state = strm.state;

    /* extract wrap request from windowBits parameter */
    if (windowBits < 0) {
      wrap = 0;
      windowBits = -windowBits;
    } else {
      wrap = (windowBits >> 4) + 1;
      if (windowBits < 48) {
        windowBits &= 15;
      }
    }

    /* set number of window bits, free window if different */
    if (windowBits && (windowBits < 8 || windowBits > 15)) {
      return Z_STREAM_ERROR$1;
    }
    if (state.window !== null && state.wbits !== windowBits) {
      state.window = null;
    }

    /* update state and reset the rest of it */
    state.wrap = wrap;
    state.wbits = windowBits;
    return inflateReset(strm);
  }

  function inflateInit2(strm, windowBits) {
    var ret;
    var state;

    if (!strm) {
      return Z_STREAM_ERROR$1;
    }
    //strm.msg = Z_NULL;                 /* in case we return an error */

    state = new InflateState();

    //if (state === Z_NULL) return Z_MEM_ERROR;
    //Tracev((stderr, "inflate: allocated\n"));
    strm.state = state;
    state.window = null /*Z_NULL*/ ;
    ret = inflateReset2(strm, windowBits);
    if (ret !== Z_OK$1) {
      strm.state = null /*Z_NULL*/ ;
    }
    return ret;
  }


  /*
   Return state with length and distance decoding tables and index sizes set to
   fixed code decoding.  Normally this returns fixed tables from inffixed.h.
   If BUILDFIXED is defined, then instead this routine builds the tables the
   first time it's called, and returns those tables the first time and
   thereafter.  This reduces the size of the code by about 2K bytes, in
   exchange for a little execution time.  However, BUILDFIXED should not be
   used for threaded applications, since the rewriting of the tables and virgin
   may not be thread-safe.
   */
  var virgin = true;

  var lenfix, distfix; // We have no pointers in JS, so keep tables separate

  function fixedtables(state) {
    /* build fixed huffman tables if first call (may not be thread safe) */
    if (virgin) {
      var sym;

      lenfix = new Buf32(512);
      distfix = new Buf32(32);

      /* literal/length table */
      sym = 0;
      while (sym < 144) {
        state.lens[sym++] = 8;
      }
      while (sym < 256) {
        state.lens[sym++] = 9;
      }
      while (sym < 280) {
        state.lens[sym++] = 7;
      }
      while (sym < 288) {
        state.lens[sym++] = 8;
      }

      inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, {
        bits: 9
      });

      /* distance table */
      sym = 0;
      while (sym < 32) {
        state.lens[sym++] = 5;
      }

      inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, {
        bits: 5
      });

      /* do this just once */
      virgin = false;
    }

    state.lencode = lenfix;
    state.lenbits = 9;
    state.distcode = distfix;
    state.distbits = 5;
  }


  /*
   Update the window with the last wsize (normally 32K) bytes written before
   returning.  If window does not exist yet, create it.  This is only called
   when a window is already in use, or when output has been written during this
   inflate call, but the end of the deflate stream has not been reached yet.
   It is also called to create a window for dictionary data when a dictionary
   is loaded.

   Providing output buffers larger than 32K to inflate() should provide a speed
   advantage, since only the last 32K of output is copied to the sliding window
   upon return from inflate(), and since all distances after the first 32K of
   output will fall in the output data, making match copies simpler and faster.
   The advantage may be dependent on the size of the processor's data caches.
   */
  function updatewindow(strm, src, end, copy) {
    var dist;
    var state = strm.state;

    /* if it hasn't been done already, allocate space for the window */
    if (state.window === null) {
      state.wsize = 1 << state.wbits;
      state.wnext = 0;
      state.whave = 0;

      state.window = new Buf8(state.wsize);
    }

    /* copy state->wsize or less output bytes into the circular window */
    if (copy >= state.wsize) {
      arraySet(state.window, src, end - state.wsize, state.wsize, 0);
      state.wnext = 0;
      state.whave = state.wsize;
    } else {
      dist = state.wsize - state.wnext;
      if (dist > copy) {
        dist = copy;
      }
      //zmemcpy(state->window + state->wnext, end - copy, dist);
      arraySet(state.window, src, end - copy, dist, state.wnext);
      copy -= dist;
      if (copy) {
        //zmemcpy(state->window, end - copy, copy);
        arraySet(state.window, src, end - copy, copy, 0);
        state.wnext = copy;
        state.whave = state.wsize;
      } else {
        state.wnext += dist;
        if (state.wnext === state.wsize) {
          state.wnext = 0;
        }
        if (state.whave < state.wsize) {
          state.whave += dist;
        }
      }
    }
    return 0;
  }

  function inflate$1(strm, flush) {
    var state;
    var input, output; // input/output buffers
    var next; /* next input INDEX */
    var put; /* next output INDEX */
    var have, left; /* available input and output */
    var hold; /* bit buffer */
    var bits; /* bits in bit buffer */
    var _in, _out; /* save starting available input and output */
    var copy; /* number of stored or match bytes to copy */
    var from; /* where to copy match bytes from */
    var from_source;
    var here = 0; /* current decoding table entry */
    var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
    //var last;                   /* parent table entry */
    var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
    var len; /* length to copy for repeats, bits to drop */
    var ret; /* return code */
    var hbuf = new Buf8(4); /* buffer for gzip header crc calculation */
    var opts;

    var n; // temporary var for NEED_BITS

    var order = /* permutation of code lengths */ [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];


    if (!strm || !strm.state || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
      return Z_STREAM_ERROR$1;
    }

    state = strm.state;
    if (state.mode === TYPE) {
      state.mode = TYPEDO;
    } /* skip check */


    //--- LOAD() ---
    put = strm.next_out;
    output = strm.output;
    left = strm.avail_out;
    next = strm.next_in;
    input = strm.input;
    have = strm.avail_in;
    hold = state.hold;
    bits = state.bits;
    //---

    _in = have;
    _out = left;
    ret = Z_OK$1;

    inf_leave: // goto emulation
      for (;;) {
        switch (state.mode) {
        case HEAD:
          if (state.wrap === 0) {
            state.mode = TYPEDO;
            break;
          }
          //=== NEEDBITS(16);
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if ((state.wrap & 2) && hold === 0x8b1f) { /* gzip header */
            state.check = 0 /*crc32(0L, Z_NULL, 0)*/ ;
            //=== CRC2(state.check, hold);
            hbuf[0] = hold & 0xff;
            hbuf[1] = (hold >>> 8) & 0xff;
            state.check = crc32(state.check, hbuf, 2, 0);
            //===//

            //=== INITBITS();
            hold = 0;
            bits = 0;
            //===//
            state.mode = FLAGS;
            break;
          }
          state.flags = 0; /* expect zlib header */
          if (state.head) {
            state.head.done = false;
          }
          if (!(state.wrap & 1) || /* check if zlib header allowed */
            (((hold & 0xff) /*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
            strm.msg = 'incorrect header check';
            state.mode = BAD;
            break;
          }
          if ((hold & 0x0f) /*BITS(4)*/ !== Z_DEFLATED$1) {
            strm.msg = 'unknown compression method';
            state.mode = BAD;
            break;
          }
          //--- DROPBITS(4) ---//
          hold >>>= 4;
          bits -= 4;
          //---//
          len = (hold & 0x0f) /*BITS(4)*/ + 8;
          if (state.wbits === 0) {
            state.wbits = len;
          } else if (len > state.wbits) {
            strm.msg = 'invalid window size';
            state.mode = BAD;
            break;
          }
          state.dmax = 1 << len;
          //Tracev((stderr, "inflate:   zlib header ok\n"));
          strm.adler = state.check = 1 /*adler32(0L, Z_NULL, 0)*/ ;
          state.mode = hold & 0x200 ? DICTID : TYPE;
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          break;
        case FLAGS:
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.flags = hold;
          if ((state.flags & 0xff) !== Z_DEFLATED$1) {
            strm.msg = 'unknown compression method';
            state.mode = BAD;
            break;
          }
          if (state.flags & 0xe000) {
            strm.msg = 'unknown header flags set';
            state.mode = BAD;
            break;
          }
          if (state.head) {
            state.head.text = ((hold >> 8) & 1);
          }
          if (state.flags & 0x0200) {
            //=== CRC2(state.check, hold);
            hbuf[0] = hold & 0xff;
            hbuf[1] = (hold >>> 8) & 0xff;
            state.check = crc32(state.check, hbuf, 2, 0);
            //===//
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = TIME;
          /* falls through */
        case TIME:
          //=== NEEDBITS(32); */
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (state.head) {
            state.head.time = hold;
          }
          if (state.flags & 0x0200) {
            //=== CRC4(state.check, hold)
            hbuf[0] = hold & 0xff;
            hbuf[1] = (hold >>> 8) & 0xff;
            hbuf[2] = (hold >>> 16) & 0xff;
            hbuf[3] = (hold >>> 24) & 0xff;
            state.check = crc32(state.check, hbuf, 4, 0);
            //===
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = OS;
          /* falls through */
        case OS:
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (state.head) {
            state.head.xflags = (hold & 0xff);
            state.head.os = (hold >> 8);
          }
          if (state.flags & 0x0200) {
            //=== CRC2(state.check, hold);
            hbuf[0] = hold & 0xff;
            hbuf[1] = (hold >>> 8) & 0xff;
            state.check = crc32(state.check, hbuf, 2, 0);
            //===//
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = EXLEN;
          /* falls through */
        case EXLEN:
          if (state.flags & 0x0400) {
            //=== NEEDBITS(16); */
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            state.length = hold;
            if (state.head) {
              state.head.extra_len = hold;
            }
            if (state.flags & 0x0200) {
              //=== CRC2(state.check, hold);
              hbuf[0] = hold & 0xff;
              hbuf[1] = (hold >>> 8) & 0xff;
              state.check = crc32(state.check, hbuf, 2, 0);
              //===//
            }
            //=== INITBITS();
            hold = 0;
            bits = 0;
            //===//
          } else if (state.head) {
            state.head.extra = null /*Z_NULL*/ ;
          }
          state.mode = EXTRA;
          /* falls through */
        case EXTRA:
          if (state.flags & 0x0400) {
            copy = state.length;
            if (copy > have) {
              copy = have;
            }
            if (copy) {
              if (state.head) {
                len = state.head.extra_len - state.length;
                if (!state.head.extra) {
                  // Use untyped array for more conveniend processing later
                  state.head.extra = new Array(state.head.extra_len);
                }
                arraySet(
                  state.head.extra,
                  input,
                  next,
                  // extra field is limited to 65536 bytes
                  // - no need for additional size check
                  copy,
                  /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                  len
                );
                //zmemcpy(state.head.extra + len, next,
                //        len + copy > state.head.extra_max ?
                //        state.head.extra_max - len : copy);
              }
              if (state.flags & 0x0200) {
                state.check = crc32(state.check, input, copy, next);
              }
              have -= copy;
              next += copy;
              state.length -= copy;
            }
            if (state.length) {
              break inf_leave;
            }
          }
          state.length = 0;
          state.mode = NAME;
          /* falls through */
        case NAME:
          if (state.flags & 0x0800) {
            if (have === 0) {
              break inf_leave;
            }
            copy = 0;
            do {
              // TODO: 2 or 1 bytes?
              len = input[next + copy++];
              /* use constant limit because in js we should not preallocate memory */
              if (state.head && len &&
                (state.length < 65536 /*state.head.name_max*/ )) {
                state.head.name += String.fromCharCode(len);
              }
            } while (len && copy < have);

            if (state.flags & 0x0200) {
              state.check = crc32(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            if (len) {
              break inf_leave;
            }
          } else if (state.head) {
            state.head.name = null;
          }
          state.length = 0;
          state.mode = COMMENT;
          /* falls through */
        case COMMENT:
          if (state.flags & 0x1000) {
            if (have === 0) {
              break inf_leave;
            }
            copy = 0;
            do {
              len = input[next + copy++];
              /* use constant limit because in js we should not preallocate memory */
              if (state.head && len &&
                (state.length < 65536 /*state.head.comm_max*/ )) {
                state.head.comment += String.fromCharCode(len);
              }
            } while (len && copy < have);
            if (state.flags & 0x0200) {
              state.check = crc32(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            if (len) {
              break inf_leave;
            }
          } else if (state.head) {
            state.head.comment = null;
          }
          state.mode = HCRC;
          /* falls through */
        case HCRC:
          if (state.flags & 0x0200) {
            //=== NEEDBITS(16); */
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            if (hold !== (state.check & 0xffff)) {
              strm.msg = 'header crc mismatch';
              state.mode = BAD;
              break;
            }
            //=== INITBITS();
            hold = 0;
            bits = 0;
            //===//
          }
          if (state.head) {
            state.head.hcrc = ((state.flags >> 9) & 1);
            state.head.done = true;
          }
          strm.adler = state.check = 0;
          state.mode = TYPE;
          break;
        case DICTID:
          //=== NEEDBITS(32); */
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          strm.adler = state.check = zswap32(hold);
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = DICT;
          /* falls through */
        case DICT:
          if (state.havedict === 0) {
            //--- RESTORE() ---
            strm.next_out = put;
            strm.avail_out = left;
            strm.next_in = next;
            strm.avail_in = have;
            state.hold = hold;
            state.bits = bits;
            //---
            return Z_NEED_DICT$1;
          }
          strm.adler = state.check = 1 /*adler32(0L, Z_NULL, 0)*/ ;
          state.mode = TYPE;
          /* falls through */
        case TYPE:
          if (flush === Z_BLOCK$1 || flush === Z_TREES$1) {
            break inf_leave;
          }
          /* falls through */
        case TYPEDO:
          if (state.last) {
            //--- BYTEBITS() ---//
            hold >>>= bits & 7;
            bits -= bits & 7;
            //---//
            state.mode = CHECK;
            break;
          }
          //=== NEEDBITS(3); */
          while (bits < 3) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.last = (hold & 0x01) /*BITS(1)*/ ;
          //--- DROPBITS(1) ---//
          hold >>>= 1;
          bits -= 1;
          //---//

          switch ((hold & 0x03) /*BITS(2)*/ ) {
          case 0:
            /* stored block */
            //Tracev((stderr, "inflate:     stored block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = STORED;
            break;
          case 1:
            /* fixed block */
            fixedtables(state);
            //Tracev((stderr, "inflate:     fixed codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = LEN_; /* decode codes */
            if (flush === Z_TREES$1) {
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
              break inf_leave;
            }
            break;
          case 2:
            /* dynamic block */
            //Tracev((stderr, "inflate:     dynamic codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = TABLE;
            break;
          case 3:
            strm.msg = 'invalid block type';
            state.mode = BAD;
          }
          //--- DROPBITS(2) ---//
          hold >>>= 2;
          bits -= 2;
          //---//
          break;
        case STORED:
          //--- BYTEBITS() ---// /* go to byte boundary */
          hold >>>= bits & 7;
          bits -= bits & 7;
          //---//
          //=== NEEDBITS(32); */
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
            strm.msg = 'invalid stored block lengths';
            state.mode = BAD;
            break;
          }
          state.length = hold & 0xffff;
          //Tracev((stderr, "inflate:       stored length %u\n",
          //        state.length));
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = COPY_;
          if (flush === Z_TREES$1) {
            break inf_leave;
          }
          /* falls through */
        case COPY_:
          state.mode = COPY;
          /* falls through */
        case COPY:
          copy = state.length;
          if (copy) {
            if (copy > have) {
              copy = have;
            }
            if (copy > left) {
              copy = left;
            }
            if (copy === 0) {
              break inf_leave;
            }
            //--- zmemcpy(put, next, copy); ---
            arraySet(output, input, next, copy, put);
            //---//
            have -= copy;
            next += copy;
            left -= copy;
            put += copy;
            state.length -= copy;
            break;
          }
          //Tracev((stderr, "inflate:       stored end\n"));
          state.mode = TYPE;
          break;
        case TABLE:
          //=== NEEDBITS(14); */
          while (bits < 14) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.nlen = (hold & 0x1f) /*BITS(5)*/ + 257;
          //--- DROPBITS(5) ---//
          hold >>>= 5;
          bits -= 5;
          //---//
          state.ndist = (hold & 0x1f) /*BITS(5)*/ + 1;
          //--- DROPBITS(5) ---//
          hold >>>= 5;
          bits -= 5;
          //---//
          state.ncode = (hold & 0x0f) /*BITS(4)*/ + 4;
          //--- DROPBITS(4) ---//
          hold >>>= 4;
          bits -= 4;
          //---//
          //#ifndef PKZIP_BUG_WORKAROUND
          if (state.nlen > 286 || state.ndist > 30) {
            strm.msg = 'too many length or distance symbols';
            state.mode = BAD;
            break;
          }
          //#endif
          //Tracev((stderr, "inflate:       table sizes ok\n"));
          state.have = 0;
          state.mode = LENLENS;
          /* falls through */
        case LENLENS:
          while (state.have < state.ncode) {
            //=== NEEDBITS(3);
            while (bits < 3) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            state.lens[order[state.have++]] = (hold & 0x07); //BITS(3);
            //--- DROPBITS(3) ---//
            hold >>>= 3;
            bits -= 3;
            //---//
          }
          while (state.have < 19) {
            state.lens[order[state.have++]] = 0;
          }
          // We have separate tables & no pointers. 2 commented lines below not needed.
          //state.next = state.codes;
          //state.lencode = state.next;
          // Switch to use dynamic table
          state.lencode = state.lendyn;
          state.lenbits = 7;

          opts = {
            bits: state.lenbits
          };
          ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
          state.lenbits = opts.bits;

          if (ret) {
            strm.msg = 'invalid code lengths set';
            state.mode = BAD;
            break;
          }
          //Tracev((stderr, "inflate:       code lengths ok\n"));
          state.have = 0;
          state.mode = CODELENS;
          /* falls through */
        case CODELENS:
          while (state.have < state.nlen + state.ndist) {
            for (;;) {
              here = state.lencode[hold & ((1 << state.lenbits) - 1)]; /*BITS(state.lenbits)*/
              here_bits = here >>> 24;
              here_op = (here >>> 16) & 0xff;
              here_val = here & 0xffff;

              if ((here_bits) <= bits) {
                break;
              }
              //--- PULLBYTE() ---//
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
              //---//
            }
            if (here_val < 16) {
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              state.lens[state.have++] = here_val;
            } else {
              if (here_val === 16) {
                //=== NEEDBITS(here.bits + 2);
                n = here_bits + 2;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                //--- DROPBITS(here.bits) ---//
                hold >>>= here_bits;
                bits -= here_bits;
                //---//
                if (state.have === 0) {
                  strm.msg = 'invalid bit length repeat';
                  state.mode = BAD;
                  break;
                }
                len = state.lens[state.have - 1];
                copy = 3 + (hold & 0x03); //BITS(2);
                //--- DROPBITS(2) ---//
                hold >>>= 2;
                bits -= 2;
                //---//
              } else if (here_val === 17) {
                //=== NEEDBITS(here.bits + 3);
                n = here_bits + 3;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                //--- DROPBITS(here.bits) ---//
                hold >>>= here_bits;
                bits -= here_bits;
                //---//
                len = 0;
                copy = 3 + (hold & 0x07); //BITS(3);
                //--- DROPBITS(3) ---//
                hold >>>= 3;
                bits -= 3;
                //---//
              } else {
                //=== NEEDBITS(here.bits + 7);
                n = here_bits + 7;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                //--- DROPBITS(here.bits) ---//
                hold >>>= here_bits;
                bits -= here_bits;
                //---//
                len = 0;
                copy = 11 + (hold & 0x7f); //BITS(7);
                //--- DROPBITS(7) ---//
                hold >>>= 7;
                bits -= 7;
                //---//
              }
              if (state.have + copy > state.nlen + state.ndist) {
                strm.msg = 'invalid bit length repeat';
                state.mode = BAD;
                break;
              }
              while (copy--) {
                state.lens[state.have++] = len;
              }
            }
          }

          /* handle error breaks in while */
          if (state.mode === BAD) {
            break;
          }

          /* check for end-of-block code (better have one) */
          if (state.lens[256] === 0) {
            strm.msg = 'invalid code -- missing end-of-block';
            state.mode = BAD;
            break;
          }

          /* build code tables -- note: do not change the lenbits or distbits
             values here (9 and 6) without reading the comments in inftrees.h
             concerning the ENOUGH constants, which depend on those values */
          state.lenbits = 9;

          opts = {
            bits: state.lenbits
          };
          ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
          // We have separate tables & no pointers. 2 commented lines below not needed.
          // state.next_index = opts.table_index;
          state.lenbits = opts.bits;
          // state.lencode = state.next;

          if (ret) {
            strm.msg = 'invalid literal/lengths set';
            state.mode = BAD;
            break;
          }

          state.distbits = 6;
          //state.distcode.copy(state.codes);
          // Switch to use dynamic table
          state.distcode = state.distdyn;
          opts = {
            bits: state.distbits
          };
          ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
          // We have separate tables & no pointers. 2 commented lines below not needed.
          // state.next_index = opts.table_index;
          state.distbits = opts.bits;
          // state.distcode = state.next;

          if (ret) {
            strm.msg = 'invalid distances set';
            state.mode = BAD;
            break;
          }
          //Tracev((stderr, 'inflate:       codes ok\n'));
          state.mode = LEN_;
          if (flush === Z_TREES$1) {
            break inf_leave;
          }
          /* falls through */
        case LEN_:
          state.mode = LEN;
          /* falls through */
        case LEN:
          if (have >= 6 && left >= 258) {
            //--- RESTORE() ---
            strm.next_out = put;
            strm.avail_out = left;
            strm.next_in = next;
            strm.avail_in = have;
            state.hold = hold;
            state.bits = bits;
            //---
            inflate_fast(strm, _out);
            //--- LOAD() ---
            put = strm.next_out;
            output = strm.output;
            left = strm.avail_out;
            next = strm.next_in;
            input = strm.input;
            have = strm.avail_in;
            hold = state.hold;
            bits = state.bits;
            //---

            if (state.mode === TYPE) {
              state.back = -1;
            }
            break;
          }
          state.back = 0;
          for (;;) {
            here = state.lencode[hold & ((1 << state.lenbits) - 1)]; /*BITS(state.lenbits)*/
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if (here_bits <= bits) {
              break;
            }
            //--- PULLBYTE() ---//
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          if (here_op && (here_op & 0xf0) === 0) {
            last_bits = here_bits;
            last_op = here_op;
            last_val = here_val;
            for (;;) {
              here = state.lencode[last_val +
                ((hold & ((1 << (last_bits + last_op)) - 1)) /*BITS(last.bits + last.op)*/ >> last_bits)];
              here_bits = here >>> 24;
              here_op = (here >>> 16) & 0xff;
              here_val = here & 0xffff;

              if ((last_bits + here_bits) <= bits) {
                break;
              }
              //--- PULLBYTE() ---//
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
              //---//
            }
            //--- DROPBITS(last.bits) ---//
            hold >>>= last_bits;
            bits -= last_bits;
            //---//
            state.back += last_bits;
          }
          //--- DROPBITS(here.bits) ---//
          hold >>>= here_bits;
          bits -= here_bits;
          //---//
          state.back += here_bits;
          state.length = here_val;
          if (here_op === 0) {
            //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
            //        "inflate:         literal '%c'\n" :
            //        "inflate:         literal 0x%02x\n", here.val));
            state.mode = LIT;
            break;
          }
          if (here_op & 32) {
            //Tracevv((stderr, "inflate:         end of block\n"));
            state.back = -1;
            state.mode = TYPE;
            break;
          }
          if (here_op & 64) {
            strm.msg = 'invalid literal/length code';
            state.mode = BAD;
            break;
          }
          state.extra = here_op & 15;
          state.mode = LENEXT;
          /* falls through */
        case LENEXT:
          if (state.extra) {
            //=== NEEDBITS(state.extra);
            n = state.extra;
            while (bits < n) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            state.length += hold & ((1 << state.extra) - 1) /*BITS(state.extra)*/ ;
            //--- DROPBITS(state.extra) ---//
            hold >>>= state.extra;
            bits -= state.extra;
            //---//
            state.back += state.extra;
          }
          //Tracevv((stderr, "inflate:         length %u\n", state.length));
          state.was = state.length;
          state.mode = DIST;
          /* falls through */
        case DIST:
          for (;;) {
            here = state.distcode[hold & ((1 << state.distbits) - 1)]; /*BITS(state.distbits)*/
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((here_bits) <= bits) {
              break;
            }
            //--- PULLBYTE() ---//
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          if ((here_op & 0xf0) === 0) {
            last_bits = here_bits;
            last_op = here_op;
            last_val = here_val;
            for (;;) {
              here = state.distcode[last_val +
                ((hold & ((1 << (last_bits + last_op)) - 1)) /*BITS(last.bits + last.op)*/ >> last_bits)];
              here_bits = here >>> 24;
              here_op = (here >>> 16) & 0xff;
              here_val = here & 0xffff;

              if ((last_bits + here_bits) <= bits) {
                break;
              }
              //--- PULLBYTE() ---//
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
              //---//
            }
            //--- DROPBITS(last.bits) ---//
            hold >>>= last_bits;
            bits -= last_bits;
            //---//
            state.back += last_bits;
          }
          //--- DROPBITS(here.bits) ---//
          hold >>>= here_bits;
          bits -= here_bits;
          //---//
          state.back += here_bits;
          if (here_op & 64) {
            strm.msg = 'invalid distance code';
            state.mode = BAD;
            break;
          }
          state.offset = here_val;
          state.extra = (here_op) & 15;
          state.mode = DISTEXT;
          /* falls through */
        case DISTEXT:
          if (state.extra) {
            //=== NEEDBITS(state.extra);
            n = state.extra;
            while (bits < n) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            state.offset += hold & ((1 << state.extra) - 1) /*BITS(state.extra)*/ ;
            //--- DROPBITS(state.extra) ---//
            hold >>>= state.extra;
            bits -= state.extra;
            //---//
            state.back += state.extra;
          }
          //#ifdef INFLATE_STRICT
          if (state.offset > state.dmax) {
            strm.msg = 'invalid distance too far back';
            state.mode = BAD;
            break;
          }
          //#endif
          //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
          state.mode = MATCH;
          /* falls through */
        case MATCH:
          if (left === 0) {
            break inf_leave;
          }
          copy = _out - left;
          if (state.offset > copy) { /* copy from window */
            copy = state.offset - copy;
            if (copy > state.whave) {
              if (state.sane) {
                strm.msg = 'invalid distance too far back';
                state.mode = BAD;
                break;
              }
              // (!) This block is disabled in zlib defailts,
              // don't enable it for binary compatibility
              //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
              //          Trace((stderr, "inflate.c too far\n"));
              //          copy -= state.whave;
              //          if (copy > state.length) { copy = state.length; }
              //          if (copy > left) { copy = left; }
              //          left -= copy;
              //          state.length -= copy;
              //          do {
              //            output[put++] = 0;
              //          } while (--copy);
              //          if (state.length === 0) { state.mode = LEN; }
              //          break;
              //#endif
            }
            if (copy > state.wnext) {
              copy -= state.wnext;
              from = state.wsize - copy;
            } else {
              from = state.wnext - copy;
            }
            if (copy > state.length) {
              copy = state.length;
            }
            from_source = state.window;
          } else { /* copy from output */
            from_source = output;
            from = put - state.offset;
            copy = state.length;
          }
          if (copy > left) {
            copy = left;
          }
          left -= copy;
          state.length -= copy;
          do {
            output[put++] = from_source[from++];
          } while (--copy);
          if (state.length === 0) {
            state.mode = LEN;
          }
          break;
        case LIT:
          if (left === 0) {
            break inf_leave;
          }
          output[put++] = state.length;
          left--;
          state.mode = LEN;
          break;
        case CHECK:
          if (state.wrap) {
            //=== NEEDBITS(32);
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              // Use '|' insdead of '+' to make sure that result is signed
              hold |= input[next++] << bits;
              bits += 8;
            }
            //===//
            _out -= left;
            strm.total_out += _out;
            state.total += _out;
            if (_out) {
              strm.adler = state.check =
                /*UPDATE(state.check, put - _out, _out);*/
                (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));

            }
            _out = left;
            // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
            if ((state.flags ? hold : zswap32(hold)) !== state.check) {
              strm.msg = 'incorrect data check';
              state.mode = BAD;
              break;
            }
            //=== INITBITS();
            hold = 0;
            bits = 0;
            //===//
            //Tracev((stderr, "inflate:   check matches trailer\n"));
          }
          state.mode = LENGTH;
          /* falls through */
        case LENGTH:
          if (state.wrap && state.flags) {
            //=== NEEDBITS(32);
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            if (hold !== (state.total & 0xffffffff)) {
              strm.msg = 'incorrect length check';
              state.mode = BAD;
              break;
            }
            //=== INITBITS();
            hold = 0;
            bits = 0;
            //===//
            //Tracev((stderr, "inflate:   length matches trailer\n"));
          }
          state.mode = DONE;
          /* falls through */
        case DONE:
          ret = Z_STREAM_END$1;
          break inf_leave;
        case BAD:
          ret = Z_DATA_ERROR$1;
          break inf_leave;
        case MEM:
          return Z_MEM_ERROR;
        case SYNC:
          /* falls through */
        default:
          return Z_STREAM_ERROR$1;
        }
      }

    // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

    /*
       Return from inflate(), updating the total counts and the check value.
       If there was no progress during the inflate() call, return a buffer
       error.  Call updatewindow() to create and/or update the window state.
       Note: a memory error from inflate() is non-recoverable.
     */

    //--- RESTORE() ---
    strm.next_out = put;
    strm.avail_out = left;
    strm.next_in = next;
    strm.avail_in = have;
    state.hold = hold;
    state.bits = bits;
    //---

    if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
        (state.mode < CHECK || flush !== Z_FINISH$1))) {
      if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) ;
    }
    _in -= strm.avail_in;
    _out -= strm.avail_out;
    strm.total_in += _in;
    strm.total_out += _out;
    state.total += _out;
    if (state.wrap && _out) {
      strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
        (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
    }
    strm.data_type = state.bits + (state.last ? 64 : 0) +
      (state.mode === TYPE ? 128 : 0) +
      (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
    if (((_in === 0 && _out === 0) || flush === Z_FINISH$1) && ret === Z_OK$1) {
      ret = Z_BUF_ERROR$1;
    }
    return ret;
  }

  function inflateEnd(strm) {

    if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/ ) {
      return Z_STREAM_ERROR$1;
    }

    var state = strm.state;
    if (state.window) {
      state.window = null;
    }
    strm.state = null;
    return Z_OK$1;
  }

  /* Not implemented
  exports.inflateCopy = inflateCopy;
  exports.inflateGetDictionary = inflateGetDictionary;
  exports.inflateMark = inflateMark;
  exports.inflatePrime = inflatePrime;
  exports.inflateSync = inflateSync;
  exports.inflateSyncPoint = inflateSyncPoint;
  exports.inflateUndermine = inflateUndermine;
  */

  // import constants from './constants';


  // zlib modes
  var NONE = 0;
  var DEFLATE = 1;
  var INFLATE = 2;
  var GZIP = 3;
  var GUNZIP = 4;
  var DEFLATERAW = 5;
  var INFLATERAW = 6;
  var UNZIP = 7;
  var Z_NO_FLUSH=         0,
    Z_PARTIAL_FLUSH=    1,
    Z_SYNC_FLUSH=    2,
    Z_FULL_FLUSH=       3,
    Z_FINISH=       4,
    Z_BLOCK=           5,
    Z_TREES=            6,

    /* Return codes for the compression/decompression functions. Negative values
    * are errors, positive values are used for special but normal events.
    */
    Z_OK=               0,
    Z_STREAM_END=       1,
    Z_NEED_DICT=      2,
    Z_ERRNO=       -1,
    Z_STREAM_ERROR=   -2,
    Z_DATA_ERROR=    -3,
    //Z_MEM_ERROR:     -4,
    Z_BUF_ERROR=    -5,
    //Z_VERSION_ERROR: -6,

    /* compression levels */
    Z_NO_COMPRESSION=         0,
    Z_BEST_SPEED=             1,
    Z_BEST_COMPRESSION=       9,
    Z_DEFAULT_COMPRESSION=   -1,


    Z_FILTERED=               1,
    Z_HUFFMAN_ONLY=           2,
    Z_RLE=                    3,
    Z_FIXED=                  4,
    Z_DEFAULT_STRATEGY=       0,

    /* Possible values of the data_type field (though see inflate()) */
    Z_BINARY=                 0,
    Z_TEXT=                   1,
    //Z_ASCII:                1, // = Z_TEXT (deprecated)
    Z_UNKNOWN=                2,

    /* The deflate compression method */
    Z_DEFLATED=               8;
  function Zlib$1(mode) {
    if (mode < DEFLATE || mode > UNZIP)
      throw new TypeError('Bad argument');

    this.mode = mode;
    this.init_done = false;
    this.write_in_progress = false;
    this.pending_close = false;
    this.windowBits = 0;
    this.level = 0;
    this.memLevel = 0;
    this.strategy = 0;
    this.dictionary = null;
  }

  Zlib$1.prototype.init = function(windowBits, level, memLevel, strategy, dictionary) {
    this.windowBits = windowBits;
    this.level = level;
    this.memLevel = memLevel;
    this.strategy = strategy;
    // dictionary not supported.

    if (this.mode === GZIP || this.mode === GUNZIP)
      this.windowBits += 16;

    if (this.mode === UNZIP)
      this.windowBits += 32;

    if (this.mode === DEFLATERAW || this.mode === INFLATERAW)
      this.windowBits = -this.windowBits;

    this.strm = new ZStream();
    var status;
    switch (this.mode) {
    case DEFLATE:
    case GZIP:
    case DEFLATERAW:
      status = deflateInit2(
        this.strm,
        this.level,
        Z_DEFLATED,
        this.windowBits,
        this.memLevel,
        this.strategy
      );
      break;
    case INFLATE:
    case GUNZIP:
    case INFLATERAW:
    case UNZIP:
      status  = inflateInit2(
        this.strm,
        this.windowBits
      );
      break;
    default:
      throw new Error('Unknown mode ' + this.mode);
    }

    if (status !== Z_OK) {
      this._error(status);
      return;
    }

    this.write_in_progress = false;
    this.init_done = true;
  };

  Zlib$1.prototype.params = function() {
    throw new Error('deflateParams Not supported');
  };

  Zlib$1.prototype._writeCheck = function() {
    if (!this.init_done)
      throw new Error('write before init');

    if (this.mode === NONE)
      throw new Error('already finalized');

    if (this.write_in_progress)
      throw new Error('write already in progress');

    if (this.pending_close)
      throw new Error('close is pending');
  };

  Zlib$1.prototype.write = function(flush, input, in_off, in_len, out, out_off, out_len) {
    this._writeCheck();
    this.write_in_progress = true;

    var self = this;
    browser$1$1.nextTick(function() {
      self.write_in_progress = false;
      var res = self._write(flush, input, in_off, in_len, out, out_off, out_len);
      self.callback(res[0], res[1]);

      if (self.pending_close)
        self.close();
    });

    return this;
  };

  // set method for Node buffers, used by pako
  function bufferSet(data, offset) {
    for (var i = 0; i < data.length; i++) {
      this[offset + i] = data[i];
    }
  }

  Zlib$1.prototype.writeSync = function(flush, input, in_off, in_len, out, out_off, out_len) {
    this._writeCheck();
    return this._write(flush, input, in_off, in_len, out, out_off, out_len);
  };

  Zlib$1.prototype._write = function(flush, input, in_off, in_len, out, out_off, out_len) {
    this.write_in_progress = true;

    if (flush !== Z_NO_FLUSH &&
        flush !== Z_PARTIAL_FLUSH &&
        flush !== Z_SYNC_FLUSH &&
        flush !== Z_FULL_FLUSH &&
        flush !== Z_FINISH &&
        flush !== Z_BLOCK) {
      throw new Error('Invalid flush value');
    }

    if (input == null) {
      input = new Buffer(0);
      in_len = 0;
      in_off = 0;
    }

    if (out._set)
      out.set = out._set;
    else
      out.set = bufferSet;

    var strm = this.strm;
    strm.avail_in = in_len;
    strm.input = input;
    strm.next_in = in_off;
    strm.avail_out = out_len;
    strm.output = out;
    strm.next_out = out_off;
    var status;
    switch (this.mode) {
    case DEFLATE:
    case GZIP:
    case DEFLATERAW:
      status = deflate$1(strm, flush);
      break;
    case UNZIP:
    case INFLATE:
    case GUNZIP:
    case INFLATERAW:
      status = inflate$1(strm, flush);
      break;
    default:
      throw new Error('Unknown mode ' + this.mode);
    }

    if (!this._checkError(status, strm, flush)) {
      this._error(status);
    }

    this.write_in_progress = false;
    return [strm.avail_in, strm.avail_out];
  };

  Zlib$1.prototype._checkError = function (status, strm, flush) {
    // Acceptable error states depend on the type of zlib stream.
    switch (status) {
      case Z_OK:
      case Z_BUF_ERROR:
        if (strm.avail_out !== 0 && flush === Z_FINISH) {
          return false
        }
        break
      case Z_STREAM_END:
        // normal statuses, not fatal
        break
      case Z_NEED_DICT:
        return false
      default:
        return false
    }

    return true
  };

  Zlib$1.prototype.close = function() {
    if (this.write_in_progress) {
      this.pending_close = true;
      return;
    }

    this.pending_close = false;

    if (this.mode === DEFLATE || this.mode === GZIP || this.mode === DEFLATERAW) {
      deflateEnd(this.strm);
    } else {
      inflateEnd(this.strm);
    }

    this.mode = NONE;
  };
  var status;
  Zlib$1.prototype.reset = function() {
    switch (this.mode) {
    case DEFLATE:
    case DEFLATERAW:
      status = deflateReset(this.strm);
      break;
    case INFLATE:
    case INFLATERAW:
      status = inflateReset(this.strm);
      break;
    }

    if (status !== Z_OK) {
      this._error(status);
    }
  };

  Zlib$1.prototype._error = function(status) {
    this.onerror(msg[status] + ': ' + this.strm.msg, status);

    this.write_in_progress = false;
    if (this.pending_close)
      this.close();
  };

  var _binding = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DEFLATE: DEFLATE,
    DEFLATERAW: DEFLATERAW,
    GUNZIP: GUNZIP,
    GZIP: GZIP,
    INFLATE: INFLATE,
    INFLATERAW: INFLATERAW,
    NONE: NONE,
    UNZIP: UNZIP,
    Z_BEST_COMPRESSION: Z_BEST_COMPRESSION,
    Z_BEST_SPEED: Z_BEST_SPEED,
    Z_BINARY: Z_BINARY,
    Z_BLOCK: Z_BLOCK,
    Z_BUF_ERROR: Z_BUF_ERROR,
    Z_DATA_ERROR: Z_DATA_ERROR,
    Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION,
    Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY,
    Z_DEFLATED: Z_DEFLATED,
    Z_ERRNO: Z_ERRNO,
    Z_FILTERED: Z_FILTERED,
    Z_FINISH: Z_FINISH,
    Z_FIXED: Z_FIXED,
    Z_FULL_FLUSH: Z_FULL_FLUSH,
    Z_HUFFMAN_ONLY: Z_HUFFMAN_ONLY,
    Z_NEED_DICT: Z_NEED_DICT,
    Z_NO_COMPRESSION: Z_NO_COMPRESSION,
    Z_NO_FLUSH: Z_NO_FLUSH,
    Z_OK: Z_OK,
    Z_PARTIAL_FLUSH: Z_PARTIAL_FLUSH,
    Z_RLE: Z_RLE,
    Z_STREAM_END: Z_STREAM_END,
    Z_STREAM_ERROR: Z_STREAM_ERROR,
    Z_SYNC_FLUSH: Z_SYNC_FLUSH,
    Z_TEXT: Z_TEXT,
    Z_TREES: Z_TREES,
    Z_UNKNOWN: Z_UNKNOWN,
    Zlib: Zlib$1
  });

  function assert(a, msg) {
  	if (!a) {
  		throw new Error(msg);
  	}
  }
  var binding = {};
  Object.keys(_binding).forEach(function (key) {
  	binding[key] = _binding[key];
  });
  // zlib doesn't provide these, so kludge them in following the same
  // const naming scheme zlib uses.
  binding.Z_MIN_WINDOWBITS = 8;
  binding.Z_MAX_WINDOWBITS = 15;
  binding.Z_DEFAULT_WINDOWBITS = 15;

  // fewer than 64 bytes per chunk is stupid.
  // technically it could work with as few as 8, but even 64 bytes
  // is absurdly low.  Usually a MB or more is best.
  binding.Z_MIN_CHUNK = 64;
  binding.Z_MAX_CHUNK = Infinity;
  binding.Z_DEFAULT_CHUNK = 16 * 1024;

  binding.Z_MIN_MEMLEVEL = 1;
  binding.Z_MAX_MEMLEVEL = 9;
  binding.Z_DEFAULT_MEMLEVEL = 8;

  binding.Z_MIN_LEVEL = -1;
  binding.Z_MAX_LEVEL = 9;
  binding.Z_DEFAULT_LEVEL = binding.Z_DEFAULT_COMPRESSION;

  // translation table for return codes.
  var codes = {
  	Z_OK: binding.Z_OK,
  	Z_STREAM_END: binding.Z_STREAM_END,
  	Z_NEED_DICT: binding.Z_NEED_DICT,
  	Z_ERRNO: binding.Z_ERRNO,
  	Z_STREAM_ERROR: binding.Z_STREAM_ERROR,
  	Z_DATA_ERROR: binding.Z_DATA_ERROR,
  	Z_MEM_ERROR: binding.Z_MEM_ERROR,
  	Z_BUF_ERROR: binding.Z_BUF_ERROR,
  	Z_VERSION_ERROR: binding.Z_VERSION_ERROR,
  };

  Object.keys(codes).forEach(function (k) {
  	codes[codes[k]] = k;
  });

  function createDeflate(o) {
  	return new Deflate(o);
  }

  function createInflate(o) {
  	return new Inflate(o);
  }

  function createDeflateRaw(o) {
  	return new DeflateRaw(o);
  }

  function createInflateRaw(o) {
  	return new InflateRaw(o);
  }

  function createGzip(o) {
  	return new Gzip(o);
  }

  function createGunzip(o) {
  	return new Gunzip(o);
  }

  function createUnzip(o) {
  	return new Unzip(o);
  }

  // Convenience methods.
  // compress/decompress a string or buffer in one step.
  function deflate(buffer, opts, callback) {
  	if (typeof opts === "function") {
  		callback = opts;
  		opts = {};
  	}
  	return zlibBuffer(new Deflate(opts), buffer, callback);
  }

  function deflateSync(buffer, opts) {
  	return zlibBufferSync(new Deflate(opts), buffer);
  }

  function gzip(buffer, opts, callback) {
  	if (typeof opts === "function") {
  		callback = opts;
  		opts = {};
  	}
  	return zlibBuffer(new Gzip(opts), buffer, callback);
  }

  function gzipSync(buffer, opts) {
  	return zlibBufferSync(new Gzip(opts), buffer);
  }

  function deflateRaw(buffer, opts, callback) {
  	if (typeof opts === "function") {
  		callback = opts;
  		opts = {};
  	}
  	return zlibBuffer(new DeflateRaw(opts), buffer, callback);
  }

  function deflateRawSync(buffer, opts) {
  	return zlibBufferSync(new DeflateRaw(opts), buffer);
  }

  function unzip(buffer, opts, callback) {
  	if (typeof opts === "function") {
  		callback = opts;
  		opts = {};
  	}
  	return zlibBuffer(new Unzip(opts), buffer, callback);
  }

  function unzipSync(buffer, opts) {
  	return zlibBufferSync(new Unzip(opts), buffer);
  }

  function inflate(buffer, opts, callback) {
  	if (typeof opts === "function") {
  		callback = opts;
  		opts = {};
  	}
  	return zlibBuffer(new Inflate(opts), buffer, callback);
  }

  function inflateSync(buffer, opts) {
  	return zlibBufferSync(new Inflate(opts), buffer);
  }

  function gunzip(buffer, opts, callback) {
  	if (typeof opts === "function") {
  		callback = opts;
  		opts = {};
  	}
  	return zlibBuffer(new Gunzip(opts), buffer, callback);
  }

  function gunzipSync(buffer, opts) {
  	return zlibBufferSync(new Gunzip(opts), buffer);
  }

  function inflateRaw(buffer, opts, callback) {
  	if (typeof opts === "function") {
  		callback = opts;
  		opts = {};
  	}
  	return zlibBuffer(new InflateRaw(opts), buffer, callback);
  }

  function inflateRawSync(buffer, opts) {
  	return zlibBufferSync(new InflateRaw(opts), buffer);
  }

  function zlibBuffer(engine, buffer, callback) {
  	var buffers = [];
  	var nread = 0;

  	engine.on("error", onError);
  	engine.on("end", onEnd);

  	engine.end(buffer);
  	flow();

  	function flow() {
  		var chunk;
  		while (null !== (chunk = engine.read())) {
  			buffers.push(chunk);
  			nread += chunk.length;
  		}
  		engine.once("readable", flow);
  	}

  	function onError(err) {
  		engine.removeListener("end", onEnd);
  		engine.removeListener("readable", flow);
  		callback(err);
  	}

  	function onEnd() {
  		var buf = Buffer.concat(buffers, nread);
  		buffers = [];
  		callback(null, buf);
  		engine.close();
  	}
  }

  function zlibBufferSync(engine, buffer) {
  	if (typeof buffer === "string") buffer = new Buffer(buffer);
  	if (!Buffer.isBuffer(buffer)) throw new TypeError("Not a string or buffer");

  	var flushFlag = binding.Z_FINISH;

  	return engine._processChunk(buffer, flushFlag);
  }

  // generic zlib
  // minimal 2-byte header
  function Deflate(opts) {
  	if (!(this instanceof Deflate)) return new Deflate(opts);
  	Zlib.call(this, opts, binding.DEFLATE);
  }

  function Inflate(opts) {
  	if (!(this instanceof Inflate)) return new Inflate(opts);
  	Zlib.call(this, opts, binding.INFLATE);
  }

  // gzip - bigger header, same deflate compression
  function Gzip(opts) {
  	if (!(this instanceof Gzip)) return new Gzip(opts);
  	Zlib.call(this, opts, binding.GZIP);
  }

  function Gunzip(opts) {
  	if (!(this instanceof Gunzip)) return new Gunzip(opts);
  	Zlib.call(this, opts, binding.GUNZIP);
  }

  // raw - no header
  function DeflateRaw(opts) {
  	if (!(this instanceof DeflateRaw)) return new DeflateRaw(opts);
  	Zlib.call(this, opts, binding.DEFLATERAW);
  }

  function InflateRaw(opts) {
  	if (!(this instanceof InflateRaw)) return new InflateRaw(opts);
  	Zlib.call(this, opts, binding.INFLATERAW);
  }

  // auto-detect header.
  function Unzip(opts) {
  	if (!(this instanceof Unzip)) return new Unzip(opts);
  	Zlib.call(this, opts, binding.UNZIP);
  }

  // the Zlib class they all inherit from
  // This thing manages the queue of requests, and returns
  // true or false if there is anything in the queue when
  // you call the .write() method.

  function Zlib(opts, mode) {
  	this._opts = opts = opts || {};
  	this._chunkSize = opts.chunkSize || binding.Z_DEFAULT_CHUNK;

  	Transform.call(this, opts);

  	if (opts.flush) {
  		if (
  			opts.flush !== binding.Z_NO_FLUSH &&
  			opts.flush !== binding.Z_PARTIAL_FLUSH &&
  			opts.flush !== binding.Z_SYNC_FLUSH &&
  			opts.flush !== binding.Z_FULL_FLUSH &&
  			opts.flush !== binding.Z_FINISH &&
  			opts.flush !== binding.Z_BLOCK
  		) {
  			throw new Error("Invalid flush flag: " + opts.flush);
  		}
  	}
  	this._flushFlag = opts.flush || binding.Z_NO_FLUSH;

  	if (opts.chunkSize) {
  		if (opts.chunkSize < binding.Z_MIN_CHUNK || opts.chunkSize > binding.Z_MAX_CHUNK) {
  			throw new Error("Invalid chunk size: " + opts.chunkSize);
  		}
  	}

  	if (opts.windowBits) {
  		if (opts.windowBits < binding.Z_MIN_WINDOWBITS || opts.windowBits > binding.Z_MAX_WINDOWBITS) {
  			throw new Error("Invalid windowBits: " + opts.windowBits);
  		}
  	}

  	if (opts.level) {
  		if (opts.level < binding.Z_MIN_LEVEL || opts.level > binding.Z_MAX_LEVEL) {
  			throw new Error("Invalid compression level: " + opts.level);
  		}
  	}

  	if (opts.memLevel) {
  		if (opts.memLevel < binding.Z_MIN_MEMLEVEL || opts.memLevel > binding.Z_MAX_MEMLEVEL) {
  			throw new Error("Invalid memLevel: " + opts.memLevel);
  		}
  	}

  	if (opts.strategy) {
  		if (
  			opts.strategy != binding.Z_FILTERED &&
  			opts.strategy != binding.Z_HUFFMAN_ONLY &&
  			opts.strategy != binding.Z_RLE &&
  			opts.strategy != binding.Z_FIXED &&
  			opts.strategy != binding.Z_DEFAULT_STRATEGY
  		) {
  			throw new Error("Invalid strategy: " + opts.strategy);
  		}
  	}

  	if (opts.dictionary) {
  		if (!Buffer.isBuffer(opts.dictionary)) {
  			throw new Error("Invalid dictionary: it should be a Buffer instance");
  		}
  	}

  	this._binding = new binding.Zlib(mode);

  	var self = this;
  	this._hadError = false;
  	this._binding.onerror = function (message, errno) {
  		// there is no way to cleanly recover.
  		// continuing only obscures problems.
  		self._binding = null;
  		self._hadError = true;

  		var error = new Error(message);
  		error.errno = errno;
  		error.code = codes[errno];
  		self.emit("error", error);
  	};

  	var level = binding.Z_DEFAULT_COMPRESSION;
  	if (typeof opts.level === "number") level = opts.level;

  	var strategy = binding.Z_DEFAULT_STRATEGY;
  	if (typeof opts.strategy === "number") strategy = opts.strategy;

  	this._binding.init(opts.windowBits || binding.Z_DEFAULT_WINDOWBITS, level, opts.memLevel || binding.Z_DEFAULT_MEMLEVEL, strategy, opts.dictionary);

  	this._buffer = new Buffer(this._chunkSize);
  	this._offset = 0;
  	this._closed = false;
  	this._level = level;
  	this._strategy = strategy;

  	this.once("end", this.close);
  }

  inherits(Zlib, Transform);

  Zlib.prototype.params = function (level, strategy, callback) {
  	if (level < binding.Z_MIN_LEVEL || level > binding.Z_MAX_LEVEL) {
  		throw new RangeError("Invalid compression level: " + level);
  	}
  	if (strategy != binding.Z_FILTERED && strategy != binding.Z_HUFFMAN_ONLY && strategy != binding.Z_RLE && strategy != binding.Z_FIXED && strategy != binding.Z_DEFAULT_STRATEGY) {
  		throw new TypeError("Invalid strategy: " + strategy);
  	}

  	if (this._level !== level || this._strategy !== strategy) {
  		var self = this;
  		this.flush(binding.Z_SYNC_FLUSH, function () {
  			self._binding.params(level, strategy);
  			if (!self._hadError) {
  				self._level = level;
  				self._strategy = strategy;
  				if (callback) callback();
  			}
  		});
  	} else {
  		browser$1$1.nextTick(callback);
  	}
  };

  Zlib.prototype.reset = function () {
  	return this._binding.reset();
  };

  // This is the _flush function called by the transform class,
  // internally, when the last chunk has been written.
  Zlib.prototype._flush = function (callback) {
  	this._transform(new Buffer(0), "", callback);
  };

  Zlib.prototype.flush = function (kind, callback) {
  	var ws = this._writableState;

  	if (typeof kind === "function" || (kind === void 0 && !callback)) {
  		callback = kind;
  		kind = binding.Z_FULL_FLUSH;
  	}

  	if (ws.ended) {
  		if (callback) browser$1$1.nextTick(callback);
  	} else if (ws.ending) {
  		if (callback) this.once("end", callback);
  	} else if (ws.needDrain) {
  		var self = this;
  		this.once("drain", function () {
  			self.flush(callback);
  		});
  	} else {
  		this._flushFlag = kind;
  		this.write(new Buffer(0), "", callback);
  	}
  };

  Zlib.prototype.close = function (callback) {
  	if (callback) browser$1$1.nextTick(callback);

  	if (this._closed) return;

  	this._closed = true;

  	this._binding.close();

  	var self = this;
  	browser$1$1.nextTick(function () {
  		self.emit("close");
  	});
  };

  Zlib.prototype._transform = function (chunk, encoding, cb) {
  	var flushFlag;
  	var ws = this._writableState;
  	var ending = ws.ending || ws.ended;
  	var last = ending && (!chunk || ws.length === chunk.length);

  	if (!chunk === null && !Buffer.isBuffer(chunk)) return cb(new Error("invalid input"));

  	// If it's the last chunk, or a final flush, we use the Z_FINISH flush flag.
  	// If it's explicitly flushing at some other time, then we use
  	// Z_FULL_FLUSH. Otherwise, use Z_NO_FLUSH for maximum compression
  	// goodness.
  	if (last) flushFlag = binding.Z_FINISH;
  	else {
  		flushFlag = this._flushFlag;
  		// once we've flushed the last of the queue, stop flushing and
  		// go back to the normal behavior.
  		if (chunk.length >= ws.length) {
  			this._flushFlag = this._opts.flush || binding.Z_NO_FLUSH;
  		}
  	}

  	this._processChunk(chunk, flushFlag, cb);
  };

  Zlib.prototype._processChunk = function (chunk, flushFlag, cb) {
  	var availInBefore = chunk && chunk.length;
  	var availOutBefore = this._chunkSize - this._offset;
  	var inOff = 0;

  	var self = this;

  	var async = typeof cb === "function";

  	if (!async) {
  		var buffers = [];
  		var nread = 0;

  		var error;
  		this.on("error", function (er) {
  			error = er;
  		});

  		do {
  			var res = this._binding.writeSync(
  				flushFlag,
  				chunk, // in
  				inOff, // in_off
  				availInBefore, // in_len
  				this._buffer, // out
  				this._offset, //out_off
  				availOutBefore
  			); // out_len
  		} while (!this._hadError && callback(res[0], res[1]));

  		if (this._hadError) {
  			throw error;
  		}

  		var buf = Buffer.concat(buffers, nread);
  		this.close();

  		return buf;
  	}

  	var req = this._binding.write(
  		flushFlag,
  		chunk, // in
  		inOff, // in_off
  		availInBefore, // in_len
  		this._buffer, // out
  		this._offset, //out_off
  		availOutBefore
  	); // out_len

  	req.buffer = chunk;
  	req.callback = callback;

  	function callback(availInAfter, availOutAfter) {
  		if (self._hadError) return;

  		var have = availOutBefore - availOutAfter;
  		assert(have >= 0, "have should not go down");

  		if (have > 0) {
  			var out = self._buffer.slice(self._offset, self._offset + have);
  			self._offset += have;
  			// serve some output to the consumer.
  			if (async) {
  				self.push(out);
  			} else {
  				buffers.push(out);
  				nread += out.length;
  			}
  		}

  		// exhausted the output buffer, or used all the input create a new one.
  		if (availOutAfter === 0 || self._offset >= self._chunkSize) {
  			availOutBefore = self._chunkSize;
  			self._offset = 0;
  			self._buffer = new Buffer(self._chunkSize);
  		}

  		if (availOutAfter === 0) {
  			// Not actually done.  Need to reprocess.
  			// Also, update the availInBefore to the availInAfter value,
  			// so that if we have to hit it a third (fourth, etc.) time,
  			// it'll have the correct byte counts.
  			inOff += availInBefore - availInAfter;
  			availInBefore = availInAfter;

  			if (!async) return true;

  			var newReq = self._binding.write(flushFlag, chunk, inOff, availInBefore, self._buffer, self._offset, self._chunkSize);
  			newReq.callback = callback; // this same function
  			newReq.buffer = chunk;
  			return;
  		}

  		if (!async) return false;

  		// finished with the chunk.
  		cb();
  	}
  };

  inherits(Deflate, Zlib);
  inherits(Inflate, Zlib);
  inherits(Gzip, Zlib);
  inherits(Gunzip, Zlib);
  inherits(DeflateRaw, Zlib);
  inherits(InflateRaw, Zlib);
  inherits(Unzip, Zlib);
  var zlib = {
  	codes: codes,
  	createDeflate: createDeflate,
  	createInflate: createInflate,
  	createDeflateRaw: createDeflateRaw,
  	createInflateRaw: createInflateRaw,
  	createGzip: createGzip,
  	createGunzip: createGunzip,
  	createUnzip: createUnzip,
  	deflate: deflate,
  	deflateSync: deflateSync,
  	gzip: gzip,
  	gzipSync: gzipSync,
  	deflateRaw: deflateRaw,
  	deflateRawSync: deflateRawSync,
  	unzip: unzip,
  	unzipSync: unzipSync,
  	inflate: inflate,
  	inflateSync: inflateSync,
  	gunzip: gunzip,
  	gunzipSync: gunzipSync,
  	inflateRaw: inflateRaw,
  	inflateRawSync: inflateRawSync,
  	Deflate: Deflate,
  	Inflate: Inflate,
  	Gzip: Gzip,
  	Gunzip: Gunzip,
  	DeflateRaw: DeflateRaw,
  	InflateRaw: InflateRaw,
  	Unzip: Unzip,
  	Zlib: Zlib,
  	constants: binding, // ### MODIFIED ###
  };

  const VERSION$1 = "1.7.7";

  function parseProtocol(url) {
    const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
    return match && match[1] || '';
  }

  const DATA_URL_PATTERN = /^(?:([^;]+);)?(?:[^;]+;)?(base64|),([\s\S]*)$/;

  /**
   * Parse data uri to a Buffer or Blob
   *
   * @param {String} uri
   * @param {?Boolean} asBlob
   * @param {?Object} options
   * @param {?Function} options.Blob
   *
   * @returns {Buffer|Blob}
   */
  function fromDataURI(uri, asBlob, options) {
    const _Blob = options && options.Blob || platform.classes.Blob;
    const protocol = parseProtocol(uri);

    if (asBlob === undefined && _Blob) {
      asBlob = true;
    }

    if (protocol === 'data') {
      uri = protocol.length ? uri.slice(protocol.length + 1) : uri;

      const match = DATA_URL_PATTERN.exec(uri);

      if (!match) {
        throw new AxiosError$1('Invalid URL', AxiosError$1.ERR_INVALID_URL);
      }

      const mime = match[1];
      const isBase64 = match[2];
      const body = match[3];
      const buffer = Buffer.from(decodeURIComponent(body), isBase64 ? 'base64' : 'utf8');

      if (asBlob) {
        if (!_Blob) {
          throw new AxiosError$1('Blob is not supported', AxiosError$1.ERR_NOT_SUPPORT);
        }

        return new _Blob([buffer], {type: mime});
      }

      return buffer;
    }

    throw new AxiosError$1('Unsupported protocol ' + protocol, AxiosError$1.ERR_NOT_SUPPORT);
  }

  const kInternals = Symbol('internals');

  class AxiosTransformStream extends Stream$3.Transform{
    constructor(options) {
      options = utils$1.toFlatObject(options, {
        maxRate: 0,
        chunkSize: 64 * 1024,
        minChunkSize: 100,
        timeWindow: 500,
        ticksRate: 2,
        samplesCount: 15
      }, null, (prop, source) => {
        return !utils$1.isUndefined(source[prop]);
      });

      super({
        readableHighWaterMark: options.chunkSize
      });

      const internals = this[kInternals] = {
        timeWindow: options.timeWindow,
        chunkSize: options.chunkSize,
        maxRate: options.maxRate,
        minChunkSize: options.minChunkSize,
        bytesSeen: 0,
        isCaptured: false,
        notifiedBytesLoaded: 0,
        ts: Date.now(),
        bytes: 0,
        onReadCallback: null
      };

      this.on('newListener', event => {
        if (event === 'progress') {
          if (!internals.isCaptured) {
            internals.isCaptured = true;
          }
        }
      });
    }

    _read(size) {
      const internals = this[kInternals];

      if (internals.onReadCallback) {
        internals.onReadCallback();
      }

      return super._read(size);
    }

    _transform(chunk, encoding, callback) {
      const internals = this[kInternals];
      const maxRate = internals.maxRate;

      const readableHighWaterMark = this.readableHighWaterMark;

      const timeWindow = internals.timeWindow;

      const divider = 1000 / timeWindow;
      const bytesThreshold = (maxRate / divider);
      const minChunkSize = internals.minChunkSize !== false ? Math.max(internals.minChunkSize, bytesThreshold * 0.01) : 0;

      const pushChunk = (_chunk, _callback) => {
        const bytes = Buffer.byteLength(_chunk);
        internals.bytesSeen += bytes;
        internals.bytes += bytes;

        internals.isCaptured && this.emit('progress', internals.bytesSeen);

        if (this.push(_chunk)) {
          browser$1$1.nextTick(_callback);
        } else {
          internals.onReadCallback = () => {
            internals.onReadCallback = null;
            browser$1$1.nextTick(_callback);
          };
        }
      };

      const transformChunk = (_chunk, _callback) => {
        const chunkSize = Buffer.byteLength(_chunk);
        let chunkRemainder = null;
        let maxChunkSize = readableHighWaterMark;
        let bytesLeft;
        let passed = 0;

        if (maxRate) {
          const now = Date.now();

          if (!internals.ts || (passed = (now - internals.ts)) >= timeWindow) {
            internals.ts = now;
            bytesLeft = bytesThreshold - internals.bytes;
            internals.bytes = bytesLeft < 0 ? -bytesLeft : 0;
            passed = 0;
          }

          bytesLeft = bytesThreshold - internals.bytes;
        }

        if (maxRate) {
          if (bytesLeft <= 0) {
            // next time window
            return setTimeout(() => {
              _callback(null, _chunk);
            }, timeWindow - passed);
          }

          if (bytesLeft < maxChunkSize) {
            maxChunkSize = bytesLeft;
          }
        }

        if (maxChunkSize && chunkSize > maxChunkSize && (chunkSize - maxChunkSize) > minChunkSize) {
          chunkRemainder = _chunk.subarray(maxChunkSize);
          _chunk = _chunk.subarray(0, maxChunkSize);
        }

        pushChunk(_chunk, chunkRemainder ? () => {
          browser$1$1.nextTick(_callback, null, chunkRemainder);
        } : _callback);
      };

      transformChunk(chunk, function transformNextChunk(err, _chunk) {
        if (err) {
          return callback(err);
        }

        if (_chunk) {
          transformChunk(_chunk, transformNextChunk);
        } else {
          callback(null);
        }
      });
    }
  }

  const {asyncIterator} = Symbol;

  const readBlob = async function* (blob) {
    if (blob.stream) {
      yield* blob.stream();
    } else if (blob.arrayBuffer) {
      yield await blob.arrayBuffer();
    } else if (blob[asyncIterator]) {
      yield* blob[asyncIterator]();
    } else {
      yield blob;
    }
  };

  const BOUNDARY_ALPHABET = utils$1.ALPHABET.ALPHA_DIGIT + '-_';

  const textEncoder = new TextEncoder$1();

  const CRLF = '\r\n';
  const CRLF_BYTES = textEncoder.encode(CRLF);
  const CRLF_BYTES_COUNT = 2;

  class FormDataPart {
    constructor(name, value) {
      const {escapeName} = this.constructor;
      const isStringValue = utils$1.isString(value);

      let headers = `Content-Disposition: form-data; name="${escapeName(name)}"${
      !isStringValue && value.name ? `; filename="${escapeName(value.name)}"` : ''
    }${CRLF}`;

      if (isStringValue) {
        value = textEncoder.encode(String(value).replace(/\r?\n|\r\n?/g, CRLF));
      } else {
        headers += `Content-Type: ${value.type || "application/octet-stream"}${CRLF}`;
      }

      this.headers = textEncoder.encode(headers + CRLF);

      this.contentLength = isStringValue ? value.byteLength : value.size;

      this.size = this.headers.byteLength + this.contentLength + CRLF_BYTES_COUNT;

      this.name = name;
      this.value = value;
    }

    async *encode(){
      yield this.headers;

      const {value} = this;

      if(utils$1.isTypedArray(value)) {
        yield value;
      } else {
        yield* readBlob(value);
      }

      yield CRLF_BYTES;
    }

    static escapeName(name) {
        return String(name).replace(/[\r\n"]/g, (match) => ({
          '\r' : '%0D',
          '\n' : '%0A',
          '"' : '%22',
        }[match]));
    }
  }

  const formDataToStream = (form, headersHandler, options) => {
    const {
      tag = 'form-data-boundary',
      size = 25,
      boundary = tag + '-' + utils$1.generateString(size, BOUNDARY_ALPHABET)
    } = options || {};

    if(!utils$1.isFormData(form)) {
      throw TypeError('FormData instance required');
    }

    if (boundary.length < 1 || boundary.length > 70) {
      throw Error('boundary must be 10-70 characters long')
    }

    const boundaryBytes = textEncoder.encode('--' + boundary + CRLF);
    const footerBytes = textEncoder.encode('--' + boundary + '--' + CRLF + CRLF);
    let contentLength = footerBytes.byteLength;

    const parts = Array.from(form.entries()).map(([name, value]) => {
      const part = new FormDataPart(name, value);
      contentLength += part.size;
      return part;
    });

    contentLength += boundaryBytes.byteLength * parts.length;

    contentLength = utils$1.toFiniteNumber(contentLength);

    const computedHeaders = {
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    };

    if (Number.isFinite(contentLength)) {
      computedHeaders['Content-Length'] = contentLength;
    }

    headersHandler && headersHandler(computedHeaders);

    return Readable.from((async function *() {
      for(const part of parts) {
        yield boundaryBytes;
        yield* part.encode();
      }

      yield footerBytes;
    })());
  };

  class ZlibHeaderTransformStream extends Stream$3.Transform {
    __transform(chunk, encoding, callback) {
      this.push(chunk);
      callback();
    }

    _transform(chunk, encoding, callback) {
      if (chunk.length !== 0) {
        this._transform = this.__transform;

        // Add Default Compression headers if no zlib headers are present
        if (chunk[0] !== 120) { // Hex: 78
          const header = Buffer.alloc(2);
          header[0] = 120; // Hex: 78
          header[1] = 156; // Hex: 9C 
          this.push(header, encoding);
        }
      }

      this.__transform(chunk, encoding, callback);
    }
  }

  const callbackify = (fn, reducer) => {
    return utils$1.isAsyncFn(fn) ? function (...args) {
      const cb = args.pop();
      fn.apply(this, args).then((value) => {
        try {
          reducer ? cb(null, ...reducer(value)) : cb(null, value);
        } catch (err) {
          cb(err);
        }
      }, cb);
    } : fn;
  };

  /**
   * Calculate data maxRate
   * @param {Number} [samplesCount= 10]
   * @param {Number} [min= 1000]
   * @returns {Function}
   */
  function speedometer(samplesCount, min) {
    samplesCount = samplesCount || 10;
    const bytes = new Array(samplesCount);
    const timestamps = new Array(samplesCount);
    let head = 0;
    let tail = 0;
    let firstSampleTS;

    min = min !== undefined ? min : 1000;

    return function push(chunkLength) {
      const now = Date.now();

      const startedAt = timestamps[tail];

      if (!firstSampleTS) {
        firstSampleTS = now;
      }

      bytes[head] = chunkLength;
      timestamps[head] = now;

      let i = tail;
      let bytesCount = 0;

      while (i !== head) {
        bytesCount += bytes[i++];
        i = i % samplesCount;
      }

      head = (head + 1) % samplesCount;

      if (head === tail) {
        tail = (tail + 1) % samplesCount;
      }

      if (now - firstSampleTS < min) {
        return;
      }

      const passed = startedAt && now - startedAt;

      return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
    };
  }

  /**
   * Throttle decorator
   * @param {Function} fn
   * @param {Number} freq
   * @return {Function}
   */
  function throttle(fn, freq) {
    let timestamp = 0;
    let threshold = 1000 / freq;
    let lastArgs;
    let timer;

    const invoke = (args, now = Date.now()) => {
      timestamp = now;
      lastArgs = null;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      fn.apply(null, args);
    };

    const throttled = (...args) => {
      const now = Date.now();
      const passed = now - timestamp;
      if ( passed >= threshold) {
        invoke(args, now);
      } else {
        lastArgs = args;
        if (!timer) {
          timer = setTimeout(() => {
            timer = null;
            invoke(lastArgs);
          }, threshold - passed);
        }
      }
    };

    const flush = () => lastArgs && invoke(lastArgs);

    return [throttled, flush];
  }

  const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
    let bytesNotified = 0;
    const _speedometer = speedometer(50, 250);

    return throttle(e => {
      const loaded = e.loaded;
      const total = e.lengthComputable ? e.total : undefined;
      const progressBytes = loaded - bytesNotified;
      const rate = _speedometer(progressBytes);
      const inRange = loaded <= total;

      bytesNotified = loaded;

      const data = {
        loaded,
        total,
        progress: total ? (loaded / total) : undefined,
        bytes: progressBytes,
        rate: rate ? rate : undefined,
        estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
        event: e,
        lengthComputable: total != null,
        [isDownloadStream ? 'download' : 'upload']: true
      };

      listener(data);
    }, freq);
  };

  const progressEventDecorator = (total, throttled) => {
    const lengthComputable = total != null;

    return [(loaded) => throttled[0]({
      lengthComputable,
      total,
      loaded
    }), throttled[1]];
  };

  const asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));

  const zlibOptions = {
    flush: zlib.constants.Z_SYNC_FLUSH,
    finishFlush: zlib.constants.Z_SYNC_FLUSH
  };

  const brotliOptions = {
    flush: zlib.constants.BROTLI_OPERATION_FLUSH,
    finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH
  };

  const isBrotliSupported = utils$1.isFunction(zlib.createBrotliDecompress);

  const {http: httpFollow, https: httpsFollow} = followRedirectsExports;

  const isHttps = /https:?/;

  const supportedProtocols = platform.protocols.map(protocol => {
    return protocol + ':';
  });

  const flushOnFinish = (stream, [throttled, flush]) => {
    stream
      .on('end', flush)
      .on('error', flush);

    return throttled;
  };

  /**
   * If the proxy or config beforeRedirects functions are defined, call them with the options
   * object.
   *
   * @param {Object<string, any>} options - The options object that was passed to the request.
   *
   * @returns {Object<string, any>}
   */
  function dispatchBeforeRedirect(options, responseDetails) {
    if (options.beforeRedirects.proxy) {
      options.beforeRedirects.proxy(options);
    }
    if (options.beforeRedirects.config) {
      options.beforeRedirects.config(options, responseDetails);
    }
  }

  /**
   * If the proxy or config afterRedirects functions are defined, call them with the options
   *
   * @param {http.ClientRequestArgs} options
   * @param {AxiosProxyConfig} configProxy configuration from Axios options object
   * @param {string} location
   *
   * @returns {http.ClientRequestArgs}
   */
  function setProxy(options, configProxy, location) {
    let proxy = configProxy;
    if (!proxy && proxy !== false) {
      const proxyUrl = getProxyForUrl_1(location);
      if (proxyUrl) {
        proxy = new URL(proxyUrl);
      }
    }
    if (proxy) {
      // Basic proxy authorization
      if (proxy.username) {
        proxy.auth = (proxy.username || '') + ':' + (proxy.password || '');
      }

      if (proxy.auth) {
        // Support proxy auth object form
        if (proxy.auth.username || proxy.auth.password) {
          proxy.auth = (proxy.auth.username || '') + ':' + (proxy.auth.password || '');
        }
        const base64 = Buffer
          .from(proxy.auth, 'utf8')
          .toString('base64');
        options.headers['Proxy-Authorization'] = 'Basic ' + base64;
      }

      options.headers.host = options.hostname + (options.port ? ':' + options.port : '');
      const proxyHost = proxy.hostname || proxy.host;
      options.hostname = proxyHost;
      // Replace 'host' since options is not a URL object
      options.host = proxyHost;
      options.port = proxy.port;
      options.path = location;
      if (proxy.protocol) {
        options.protocol = proxy.protocol.includes(':') ? proxy.protocol : `${proxy.protocol}:`;
      }
    }

    options.beforeRedirects.proxy = function beforeRedirect(redirectOptions) {
      // Configure proxy for redirected request, passing the original config proxy to apply
      // the exact same logic as if the redirected request was performed by axios directly.
      setProxy(redirectOptions, configProxy, redirectOptions.href);
    };
  }

  const isHttpAdapterSupported = typeof browser$1$1 !== 'undefined' && utils$1.kindOf(browser$1$1) === 'process';

  // temporary hotfix

  const wrapAsync = (asyncExecutor) => {
    return new Promise((resolve, reject) => {
      let onDone;
      let isDone;

      const done = (value, isRejected) => {
        if (isDone) return;
        isDone = true;
        onDone && onDone(value, isRejected);
      };

      const _resolve = (value) => {
        done(value);
        resolve(value);
      };

      const _reject = (reason) => {
        done(reason, true);
        reject(reason);
      };

      asyncExecutor(_resolve, _reject, (onDoneHandler) => (onDone = onDoneHandler)).catch(_reject);
    })
  };

  const resolveFamily = ({address, family}) => {
    if (!utils$1.isString(address)) {
      throw TypeError('address must be a string');
    }
    return ({
      address,
      family: family || (address.indexOf('.') < 0 ? 6 : 4)
    });
  };

  const buildAddressEntry = (address, family) => resolveFamily(utils$1.isObject(address) ? address : {address, family});

  /*eslint consistent-return:0*/
  var httpAdapter = isHttpAdapterSupported && function httpAdapter(config) {
    return wrapAsync(async function dispatchHttpRequest(resolve, reject, onDone) {
      let {data, lookup, family} = config;
      const {responseType, responseEncoding} = config;
      const method = config.method.toUpperCase();
      let isDone;
      let rejected = false;
      let req;

      if (lookup) {
        const _lookup = callbackify(lookup, (value) => utils$1.isArray(value) ? value : [value]);
        // hotfix to support opt.all option which is required for node 20.x
        lookup = (hostname, opt, cb) => {
          _lookup(hostname, opt, (err, arg0, arg1) => {
            if (err) {
              return cb(err);
            }

            const addresses = utils$1.isArray(arg0) ? arg0.map(addr => buildAddressEntry(addr)) : [buildAddressEntry(arg0, arg1)];

            opt.all ? cb(err, addresses) : cb(err, addresses[0].address, addresses[0].family);
          });
        };
      }

      // temporary internal emitter until the AxiosRequest class will be implemented
      const emitter = new EventEmitter();

      const onFinished = () => {
        if (config.cancelToken) {
          config.cancelToken.unsubscribe(abort);
        }

        if (config.signal) {
          config.signal.removeEventListener('abort', abort);
        }

        emitter.removeAllListeners();
      };

      onDone((value, isRejected) => {
        isDone = true;
        if (isRejected) {
          rejected = true;
          onFinished();
        }
      });

      function abort(reason) {
        emitter.emit('abort', !reason || reason.type ? new CanceledError$1(null, config, req) : reason);
      }

      emitter.once('abort', reject);

      if (config.cancelToken || config.signal) {
        config.cancelToken && config.cancelToken.subscribe(abort);
        if (config.signal) {
          config.signal.aborted ? abort() : config.signal.addEventListener('abort', abort);
        }
      }

      // Parse url
      const fullPath = buildFullPath(config.baseURL, config.url);
      const parsed = new URL(fullPath, platform.hasBrowserEnv ? platform.origin : undefined);
      const protocol = parsed.protocol || supportedProtocols[0];

      if (protocol === 'data:') {
        let convertedData;

        if (method !== 'GET') {
          return settle(resolve, reject, {
            status: 405,
            statusText: 'method not allowed',
            headers: {},
            config
          });
        }

        try {
          convertedData = fromDataURI(config.url, responseType === 'blob', {
            Blob: config.env && config.env.Blob
          });
        } catch (err) {
          throw AxiosError$1.from(err, AxiosError$1.ERR_BAD_REQUEST, config);
        }

        if (responseType === 'text') {
          convertedData = convertedData.toString(responseEncoding);

          if (!responseEncoding || responseEncoding === 'utf8') {
            convertedData = utils$1.stripBOM(convertedData);
          }
        } else if (responseType === 'stream') {
          convertedData = Stream$3.Readable.from(convertedData);
        }

        return settle(resolve, reject, {
          data: convertedData,
          status: 200,
          statusText: 'OK',
          headers: new AxiosHeaders$1(),
          config
        });
      }

      if (supportedProtocols.indexOf(protocol) === -1) {
        return reject(new AxiosError$1(
          'Unsupported protocol ' + protocol,
          AxiosError$1.ERR_BAD_REQUEST,
          config
        ));
      }

      const headers = AxiosHeaders$1.from(config.headers).normalize();

      // Set User-Agent (required by some servers)
      // See https://github.com/axios/axios/issues/69
      // User-Agent is specified; handle case where no UA header is desired
      // Only set header if it hasn't been set in config
      headers.set('User-Agent', 'axios/' + VERSION$1, false);

      const {onUploadProgress, onDownloadProgress} = config;
      const maxRate = config.maxRate;
      let maxUploadRate = undefined;
      let maxDownloadRate = undefined;

      // support for spec compliant FormData objects
      if (utils$1.isSpecCompliantForm(data)) {
        const userBoundary = headers.getContentType(/boundary=([-_\w\d]{10,70})/i);

        data = formDataToStream(data, (formHeaders) => {
          headers.set(formHeaders);
        }, {
          tag: `axios-${VERSION$1}-boundary`,
          boundary: userBoundary && userBoundary[1] || undefined
        });
        // support for https://www.npmjs.com/package/form-data api
      } else if (utils$1.isFormData(data) && utils$1.isFunction(data.getHeaders)) {
        headers.set(data.getHeaders());

        if (!headers.hasContentLength()) {
          try {
            const knownLength = await types.promisify(data.getLength).call(data);
            Number.isFinite(knownLength) && knownLength >= 0 && headers.setContentLength(knownLength);
            /*eslint no-empty:0*/
          } catch (e) {
          }
        }
      } else if (utils$1.isBlob(data)) {
        data.size && headers.setContentType(data.type || 'application/octet-stream');
        headers.setContentLength(data.size || 0);
        data = Stream$3.Readable.from(readBlob(data));
      } else if (data && !utils$1.isStream(data)) {
        if (Buffer.isBuffer(data)) ; else if (utils$1.isArrayBuffer(data)) {
          data = Buffer.from(new Uint8Array(data));
        } else if (utils$1.isString(data)) {
          data = Buffer.from(data, 'utf-8');
        } else {
          return reject(new AxiosError$1(
            'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
            AxiosError$1.ERR_BAD_REQUEST,
            config
          ));
        }

        // Add Content-Length header if data exists
        headers.setContentLength(data.length, false);

        if (config.maxBodyLength > -1 && data.length > config.maxBodyLength) {
          return reject(new AxiosError$1(
            'Request body larger than maxBodyLength limit',
            AxiosError$1.ERR_BAD_REQUEST,
            config
          ));
        }
      }

      const contentLength = utils$1.toFiniteNumber(headers.getContentLength());

      if (utils$1.isArray(maxRate)) {
        maxUploadRate = maxRate[0];
        maxDownloadRate = maxRate[1];
      } else {
        maxUploadRate = maxDownloadRate = maxRate;
      }

      if (data && (onUploadProgress || maxUploadRate)) {
        if (!utils$1.isStream(data)) {
          data = Stream$3.Readable.from(data, {objectMode: false});
        }

        data = Stream$3.pipeline([data, new AxiosTransformStream({
          maxRate: utils$1.toFiniteNumber(maxUploadRate)
        })], utils$1.noop);

        onUploadProgress && data.on('progress', flushOnFinish(
          data,
          progressEventDecorator(
            contentLength,
            progressEventReducer(asyncDecorator(onUploadProgress), false, 3)
          )
        ));
      }

      // HTTP basic authentication
      let auth = undefined;
      if (config.auth) {
        const username = config.auth.username || '';
        const password = config.auth.password || '';
        auth = username + ':' + password;
      }

      if (!auth && parsed.username) {
        const urlUsername = parsed.username;
        const urlPassword = parsed.password;
        auth = urlUsername + ':' + urlPassword;
      }

      auth && headers.delete('authorization');

      let path;

      try {
        path = buildURL(
          parsed.pathname + parsed.search,
          config.params,
          config.paramsSerializer
        ).replace(/^\?/, '');
      } catch (err) {
        const customErr = new Error(err.message);
        customErr.config = config;
        customErr.url = config.url;
        customErr.exists = true;
        return reject(customErr);
      }

      headers.set(
        'Accept-Encoding',
        'gzip, compress, deflate' + (isBrotliSupported ? ', br' : ''), false
        );

      const options = {
        path,
        method: method,
        headers: headers.toJSON(),
        agents: { http: config.httpAgent, https: config.httpsAgent },
        auth,
        protocol,
        family,
        beforeRedirect: dispatchBeforeRedirect,
        beforeRedirects: {}
      };

      // cacheable-lookup integration hotfix
      !utils$1.isUndefined(lookup) && (options.lookup = lookup);

      if (config.socketPath) {
        options.socketPath = config.socketPath;
      } else {
        options.hostname = parsed.hostname.startsWith("[") ? parsed.hostname.slice(1, -1) : parsed.hostname;
        options.port = parsed.port;
        setProxy(options, config.proxy, protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path);
      }

      let transport;
      const isHttpsRequest = isHttps.test(options.protocol);
      options.agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;
      if (config.transport) {
        transport = config.transport;
      } else if (config.maxRedirects === 0) {
        transport = isHttpsRequest ? https$2 : http$2;
      } else {
        if (config.maxRedirects) {
          options.maxRedirects = config.maxRedirects;
        }
        if (config.beforeRedirect) {
          options.beforeRedirects.config = config.beforeRedirect;
        }
        transport = isHttpsRequest ? httpsFollow : httpFollow;
      }

      if (config.maxBodyLength > -1) {
        options.maxBodyLength = config.maxBodyLength;
      } else {
        // follow-redirects does not skip comparison, so it should always succeed for axios -1 unlimited
        options.maxBodyLength = Infinity;
      }

      if (config.insecureHTTPParser) {
        options.insecureHTTPParser = config.insecureHTTPParser;
      }

      // Create the request
      req = transport.request(options, function handleResponse(res) {
        if (req.destroyed) return;

        const streams = [res];

        const responseLength = +res.headers['content-length'];

        if (onDownloadProgress || maxDownloadRate) {
          const transformStream = new AxiosTransformStream({
            maxRate: utils$1.toFiniteNumber(maxDownloadRate)
          });

          onDownloadProgress && transformStream.on('progress', flushOnFinish(
            transformStream,
            progressEventDecorator(
              responseLength,
              progressEventReducer(asyncDecorator(onDownloadProgress), true, 3)
            )
          ));

          streams.push(transformStream);
        }

        // decompress the response body transparently if required
        let responseStream = res;

        // return the last request in case of redirects
        const lastRequest = res.req || req;

        // if decompress disabled we should not decompress
        if (config.decompress !== false && res.headers['content-encoding']) {
          // if no content, but headers still say that it is encoded,
          // remove the header not confuse downstream operations
          if (method === 'HEAD' || res.statusCode === 204) {
            delete res.headers['content-encoding'];
          }

          switch ((res.headers['content-encoding'] || '').toLowerCase()) {
          /*eslint default-case:0*/
          case 'gzip':
          case 'x-gzip':
          case 'compress':
          case 'x-compress':
            // add the unzipper to the body stream processing pipeline
            streams.push(zlib.createUnzip(zlibOptions));

            // remove the content-encoding in order to not confuse downstream operations
            delete res.headers['content-encoding'];
            break;
          case 'deflate':
            streams.push(new ZlibHeaderTransformStream());

            // add the unzipper to the body stream processing pipeline
            streams.push(zlib.createUnzip(zlibOptions));

            // remove the content-encoding in order to not confuse downstream operations
            delete res.headers['content-encoding'];
            break;
          case 'br':
            if (isBrotliSupported) {
              streams.push(zlib.createBrotliDecompress(brotliOptions));
              delete res.headers['content-encoding'];
            }
          }
        }

        responseStream = streams.length > 1 ? Stream$3.pipeline(streams, utils$1.noop) : streams[0];

        const offListeners = Stream$3.finished(responseStream, () => {
          offListeners();
          onFinished();
        });

        const response = {
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: new AxiosHeaders$1(res.headers),
          config,
          request: lastRequest
        };

        if (responseType === 'stream') {
          response.data = responseStream;
          settle(resolve, reject, response);
        } else {
          const responseBuffer = [];
          let totalResponseBytes = 0;

          responseStream.on('data', function handleStreamData(chunk) {
            responseBuffer.push(chunk);
            totalResponseBytes += chunk.length;

            // make sure the content length is not over the maxContentLength if specified
            if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
              // stream.destroy() emit aborted event before calling reject() on Node.js v16
              rejected = true;
              responseStream.destroy();
              reject(new AxiosError$1('maxContentLength size of ' + config.maxContentLength + ' exceeded',
                AxiosError$1.ERR_BAD_RESPONSE, config, lastRequest));
            }
          });

          responseStream.on('aborted', function handlerStreamAborted() {
            if (rejected) {
              return;
            }

            const err = new AxiosError$1(
              'maxContentLength size of ' + config.maxContentLength + ' exceeded',
              AxiosError$1.ERR_BAD_RESPONSE,
              config,
              lastRequest
            );
            responseStream.destroy(err);
            reject(err);
          });

          responseStream.on('error', function handleStreamError(err) {
            if (req.destroyed) return;
            reject(AxiosError$1.from(err, null, config, lastRequest));
          });

          responseStream.on('end', function handleStreamEnd() {
            try {
              let responseData = responseBuffer.length === 1 ? responseBuffer[0] : Buffer.concat(responseBuffer);
              if (responseType !== 'arraybuffer') {
                responseData = responseData.toString(responseEncoding);
                if (!responseEncoding || responseEncoding === 'utf8') {
                  responseData = utils$1.stripBOM(responseData);
                }
              }
              response.data = responseData;
            } catch (err) {
              return reject(AxiosError$1.from(err, null, config, response.request, response));
            }
            settle(resolve, reject, response);
          });
        }

        emitter.once('abort', err => {
          if (!responseStream.destroyed) {
            responseStream.emit('error', err);
            responseStream.destroy();
          }
        });
      });

      emitter.once('abort', err => {
        reject(err);
        req.destroy(err);
      });

      // Handle errors
      req.on('error', function handleRequestError(err) {
        // @todo remove
        // if (req.aborted && err.code !== AxiosError.ERR_FR_TOO_MANY_REDIRECTS) return;
        reject(AxiosError$1.from(err, null, config, req));
      });

      // set tcp keep alive to prevent drop connection by peer
      req.on('socket', function handleRequestSocket(socket) {
        // default interval of sending ack packet is 1 minute
        socket.setKeepAlive(true, 1000 * 60);
      });

      // Handle request timeout
      if (config.timeout) {
        // This is forcing a int timeout to avoid problems if the `req` interface doesn't handle other types.
        const timeout = parseInt(config.timeout, 10);

        if (Number.isNaN(timeout)) {
          reject(new AxiosError$1(
            'error trying to parse `config.timeout` to int',
            AxiosError$1.ERR_BAD_OPTION_VALUE,
            config,
            req
          ));

          return;
        }

        // Sometime, the response will be very slow, and does not respond, the connect event will be block by event loop system.
        // And timer callback will be fired, and abort() will be invoked before connection, then get "socket hang up" and code ECONNRESET.
        // At this time, if we have a large number of request, nodejs will hang up some socket on background. and the number will up and up.
        // And then these socket which be hang up will devouring CPU little by little.
        // ClientRequest.setTimeout will be fired on the specify milliseconds, and can make sure that abort() will be fired after connect.
        req.setTimeout(timeout, function handleRequestTimeout() {
          if (isDone) return;
          let timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          const transitional = config.transitional || transitionalDefaults;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(new AxiosError$1(
            timeoutErrorMessage,
            transitional.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
            config,
            req
          ));
          abort();
        });
      }


      // Send the request
      if (utils$1.isStream(data)) {
        let ended = false;
        let errored = false;

        data.on('end', () => {
          ended = true;
        });

        data.once('error', err => {
          errored = true;
          req.destroy(err);
        });

        data.on('close', () => {
          if (!ended && !errored) {
            abort(new CanceledError$1('Request stream has been aborted', config, req));
          }
        });

        data.pipe(req);
      } else {
        req.end(data);
      }
    });
  };

  var isURLSameOrigin = platform.hasStandardBrowserEnv ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      const msie = platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent);
      const urlParsingNode = document.createElement('a');
      let originURL;

      /**
      * Parse a URL to discover its components
      *
      * @param {String} url The URL to be parsed
      * @returns {Object}
      */
      function resolveURL(url) {
        let href = url;

        if (msie) {
          // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
      * Determine if a URL shares the same origin as the current location
      *
      * @param {String} requestURL The URL to test
      * @returns {boolean} True if URL shares the same origin, otherwise false
      */
      return function isURLSameOrigin(requestURL) {
        const parsed = (utils$1.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

    // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })();

  var cookies = platform.hasStandardBrowserEnv ?

    // Standard browser envs support document.cookie
    {
      write(name, value, expires, path, domain, secure) {
        const cookie = [name + '=' + encodeURIComponent(value)];

        utils$1.isNumber(expires) && cookie.push('expires=' + new Date(expires).toGMTString());

        utils$1.isString(path) && cookie.push('path=' + path);

        utils$1.isString(domain) && cookie.push('domain=' + domain);

        secure === true && cookie.push('secure');

        document.cookie = cookie.join('; ');
      },

      read(name) {
        const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    }

    :

    // Non-standard browser env (web workers, react-native) lack needed support.
    {
      write() {},
      read() {
        return null;
      },
      remove() {}
    };

  const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? { ...thing } : thing;

  /**
   * Config-specific merge-function which creates a new config-object
   * by merging two configuration objects together.
   *
   * @param {Object} config1
   * @param {Object} config2
   *
   * @returns {Object} New object resulting from merging config2 to config1
   */
  function mergeConfig$1(config1, config2) {
    // eslint-disable-next-line no-param-reassign
    config2 = config2 || {};
    const config = {};

    function getMergedValue(target, source, caseless) {
      if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
        return utils$1.merge.call({caseless}, target, source);
      } else if (utils$1.isPlainObject(source)) {
        return utils$1.merge({}, source);
      } else if (utils$1.isArray(source)) {
        return source.slice();
      }
      return source;
    }

    // eslint-disable-next-line consistent-return
    function mergeDeepProperties(a, b, caseless) {
      if (!utils$1.isUndefined(b)) {
        return getMergedValue(a, b, caseless);
      } else if (!utils$1.isUndefined(a)) {
        return getMergedValue(undefined, a, caseless);
      }
    }

    // eslint-disable-next-line consistent-return
    function valueFromConfig2(a, b) {
      if (!utils$1.isUndefined(b)) {
        return getMergedValue(undefined, b);
      }
    }

    // eslint-disable-next-line consistent-return
    function defaultToConfig2(a, b) {
      if (!utils$1.isUndefined(b)) {
        return getMergedValue(undefined, b);
      } else if (!utils$1.isUndefined(a)) {
        return getMergedValue(undefined, a);
      }
    }

    // eslint-disable-next-line consistent-return
    function mergeDirectKeys(a, b, prop) {
      if (prop in config2) {
        return getMergedValue(a, b);
      } else if (prop in config1) {
        return getMergedValue(undefined, a);
      }
    }

    const mergeMap = {
      url: valueFromConfig2,
      method: valueFromConfig2,
      data: valueFromConfig2,
      baseURL: defaultToConfig2,
      transformRequest: defaultToConfig2,
      transformResponse: defaultToConfig2,
      paramsSerializer: defaultToConfig2,
      timeout: defaultToConfig2,
      timeoutMessage: defaultToConfig2,
      withCredentials: defaultToConfig2,
      withXSRFToken: defaultToConfig2,
      adapter: defaultToConfig2,
      responseType: defaultToConfig2,
      xsrfCookieName: defaultToConfig2,
      xsrfHeaderName: defaultToConfig2,
      onUploadProgress: defaultToConfig2,
      onDownloadProgress: defaultToConfig2,
      decompress: defaultToConfig2,
      maxContentLength: defaultToConfig2,
      maxBodyLength: defaultToConfig2,
      beforeRedirect: defaultToConfig2,
      transport: defaultToConfig2,
      httpAgent: defaultToConfig2,
      httpsAgent: defaultToConfig2,
      cancelToken: defaultToConfig2,
      socketPath: defaultToConfig2,
      responseEncoding: defaultToConfig2,
      validateStatus: mergeDirectKeys,
      headers: (a, b) => mergeDeepProperties(headersToObject(a), headersToObject(b), true)
    };

    utils$1.forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
      const merge = mergeMap[prop] || mergeDeepProperties;
      const configValue = merge(config1[prop], config2[prop], prop);
      (utils$1.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
    });

    return config;
  }

  var resolveConfig = (config) => {
    const newConfig = mergeConfig$1({}, config);

    let {data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth} = newConfig;

    newConfig.headers = headers = AxiosHeaders$1.from(headers);

    newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url), config.params, config.paramsSerializer);

    // HTTP basic authentication
    if (auth) {
      headers.set('Authorization', 'Basic ' +
        btoa((auth.username || '') + ':' + (auth.password ? unescape(encodeURIComponent(auth.password)) : ''))
      );
    }

    let contentType;

    if (utils$1.isFormData(data)) {
      if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
        headers.setContentType(undefined); // Let the browser set it
      } else if ((contentType = headers.getContentType()) !== false) {
        // fix semicolon duplication issue for ReactNative FormData implementation
        const [type, ...tokens] = contentType ? contentType.split(';').map(token => token.trim()).filter(Boolean) : [];
        headers.setContentType([type || 'multipart/form-data', ...tokens].join('; '));
      }
    }

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.

    if (platform.hasStandardBrowserEnv) {
      withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));

      if (withXSRFToken || (withXSRFToken !== false && isURLSameOrigin(newConfig.url))) {
        // Add xsrf header
        const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);

        if (xsrfValue) {
          headers.set(xsrfHeaderName, xsrfValue);
        }
      }
    }

    return newConfig;
  };

  const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

  var xhrAdapter = isXHRAdapterSupported && function (config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      const _config = resolveConfig(config);
      let requestData = _config.data;
      const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
      let {responseType, onUploadProgress, onDownloadProgress} = _config;
      let onCanceled;
      let uploadThrottled, downloadThrottled;
      let flushUpload, flushDownload;

      function done() {
        flushUpload && flushUpload(); // flush events
        flushDownload && flushDownload(); // flush events

        _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);

        _config.signal && _config.signal.removeEventListener('abort', onCanceled);
      }

      let request = new XMLHttpRequest();

      request.open(_config.method.toUpperCase(), _config.url, true);

      // Set the request timeout in MS
      request.timeout = _config.timeout;

      function onloadend() {
        if (!request) {
          return;
        }
        // Prepare the response
        const responseHeaders = AxiosHeaders$1.from(
          'getAllResponseHeaders' in request && request.getAllResponseHeaders()
        );
        const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
          request.responseText : request.response;
        const response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        };

        settle(function _resolve(value) {
          resolve(value);
          done();
        }, function _reject(err) {
          reject(err);
          done();
        }, response);

        // Clean up request
        request = null;
      }

      if ('onloadend' in request) {
        // Use onloadend if available
        request.onloadend = onloadend;
      } else {
        // Listen for ready state to emulate onloadend
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }
          // readystate handler is calling before onerror or ontimeout handlers,
          // so we should call onloadend on the next 'tick'
          setTimeout(onloadend);
        };
      }

      // Handle browser request cancellation (as opposed to a manual cancellation)
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }

        reject(new AxiosError$1('Request aborted', AxiosError$1.ECONNABORTED, config, request));

        // Clean up request
        request = null;
      };

      // Handle low level network errors
      request.onerror = function handleError() {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(new AxiosError$1('Network Error', AxiosError$1.ERR_NETWORK, config, request));

        // Clean up request
        request = null;
      };

      // Handle timeout
      request.ontimeout = function handleTimeout() {
        let timeoutErrorMessage = _config.timeout ? 'timeout of ' + _config.timeout + 'ms exceeded' : 'timeout exceeded';
        const transitional = _config.transitional || transitionalDefaults;
        if (_config.timeoutErrorMessage) {
          timeoutErrorMessage = _config.timeoutErrorMessage;
        }
        reject(new AxiosError$1(
          timeoutErrorMessage,
          transitional.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
          config,
          request));

        // Clean up request
        request = null;
      };

      // Remove Content-Type if data is undefined
      requestData === undefined && requestHeaders.setContentType(null);

      // Add headers to the request
      if ('setRequestHeader' in request) {
        utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
          request.setRequestHeader(key, val);
        });
      }

      // Add withCredentials to request if needed
      if (!utils$1.isUndefined(_config.withCredentials)) {
        request.withCredentials = !!_config.withCredentials;
      }

      // Add responseType to request if needed
      if (responseType && responseType !== 'json') {
        request.responseType = _config.responseType;
      }

      // Handle progress if needed
      if (onDownloadProgress) {
        ([downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true));
        request.addEventListener('progress', downloadThrottled);
      }

      // Not all browsers support upload events
      if (onUploadProgress && request.upload) {
        ([uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress));

        request.upload.addEventListener('progress', uploadThrottled);

        request.upload.addEventListener('loadend', flushUpload);
      }

      if (_config.cancelToken || _config.signal) {
        // Handle cancellation
        // eslint-disable-next-line func-names
        onCanceled = cancel => {
          if (!request) {
            return;
          }
          reject(!cancel || cancel.type ? new CanceledError$1(null, config, request) : cancel);
          request.abort();
          request = null;
        };

        _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
        if (_config.signal) {
          _config.signal.aborted ? onCanceled() : _config.signal.addEventListener('abort', onCanceled);
        }
      }

      const protocol = parseProtocol(_config.url);

      if (protocol && platform.protocols.indexOf(protocol) === -1) {
        reject(new AxiosError$1('Unsupported protocol ' + protocol + ':', AxiosError$1.ERR_BAD_REQUEST, config));
        return;
      }


      // Send the request
      request.send(requestData || null);
    });
  };

  const composeSignals = (signals, timeout) => {
    const {length} = (signals = signals ? signals.filter(Boolean) : []);

    if (timeout || length) {
      let controller = new AbortController();

      let aborted;

      const onabort = function (reason) {
        if (!aborted) {
          aborted = true;
          unsubscribe();
          const err = reason instanceof Error ? reason : this.reason;
          controller.abort(err instanceof AxiosError$1 ? err : new CanceledError$1(err instanceof Error ? err.message : err));
        }
      };

      let timer = timeout && setTimeout(() => {
        timer = null;
        onabort(new AxiosError$1(`timeout ${timeout} of ms exceeded`, AxiosError$1.ETIMEDOUT));
      }, timeout);

      const unsubscribe = () => {
        if (signals) {
          timer && clearTimeout(timer);
          timer = null;
          signals.forEach(signal => {
            signal.unsubscribe ? signal.unsubscribe(onabort) : signal.removeEventListener('abort', onabort);
          });
          signals = null;
        }
      };

      signals.forEach((signal) => signal.addEventListener('abort', onabort));

      const {signal} = controller;

      signal.unsubscribe = () => utils$1.asap(unsubscribe);

      return signal;
    }
  };

  const streamChunk = function* (chunk, chunkSize) {
    let len = chunk.byteLength;

    if (len < chunkSize) {
      yield chunk;
      return;
    }

    let pos = 0;
    let end;

    while (pos < len) {
      end = pos + chunkSize;
      yield chunk.slice(pos, end);
      pos = end;
    }
  };

  const readBytes = async function* (iterable, chunkSize) {
    for await (const chunk of readStream(iterable)) {
      yield* streamChunk(chunk, chunkSize);
    }
  };

  const readStream = async function* (stream) {
    if (stream[Symbol.asyncIterator]) {
      yield* stream;
      return;
    }

    const reader = stream.getReader();
    try {
      for (;;) {
        const {done, value} = await reader.read();
        if (done) {
          break;
        }
        yield value;
      }
    } finally {
      await reader.cancel();
    }
  };

  const trackStream = (stream, chunkSize, onProgress, onFinish) => {
    const iterator = readBytes(stream, chunkSize);

    let bytes = 0;
    let done;
    let _onFinish = (e) => {
      if (!done) {
        done = true;
        onFinish && onFinish(e);
      }
    };

    return new ReadableStream({
      async pull(controller) {
        try {
          const {done, value} = await iterator.next();

          if (done) {
           _onFinish();
            controller.close();
            return;
          }

          let len = value.byteLength;
          if (onProgress) {
            let loadedBytes = bytes += len;
            onProgress(loadedBytes);
          }
          controller.enqueue(new Uint8Array(value));
        } catch (err) {
          _onFinish(err);
          throw err;
        }
      },
      cancel(reason) {
        _onFinish(reason);
        return iterator.return();
      }
    }, {
      highWaterMark: 2
    })
  };

  const isFetchSupported = typeof fetch === 'function' && typeof Request === 'function' && typeof Response === 'function';
  const isReadableStreamSupported = isFetchSupported && typeof ReadableStream === 'function';

  // used only inside the fetch adapter
  const encodeText = isFetchSupported && (typeof TextEncoder === 'function' ?
      ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) :
      async (str) => new Uint8Array(await new Response(str).arrayBuffer())
  );

  const test = (fn, ...args) => {
    try {
      return !!fn(...args);
    } catch (e) {
      return false
    }
  };

  const supportsRequestStream = isReadableStreamSupported && test(() => {
    let duplexAccessed = false;

    const hasContentType = new Request(platform.origin, {
      body: new ReadableStream(),
      method: 'POST',
      get duplex() {
        duplexAccessed = true;
        return 'half';
      },
    }).headers.has('Content-Type');

    return duplexAccessed && !hasContentType;
  });

  const DEFAULT_CHUNK_SIZE = 64 * 1024;

  const supportsResponseStream = isReadableStreamSupported &&
    test(() => utils$1.isReadableStream(new Response('').body));


  const resolvers = {
    stream: supportsResponseStream && ((res) => res.body)
  };

  isFetchSupported && (((res) => {
    ['text', 'arrayBuffer', 'blob', 'formData', 'stream'].forEach(type => {
      !resolvers[type] && (resolvers[type] = utils$1.isFunction(res[type]) ? (res) => res[type]() :
        (_, config) => {
          throw new AxiosError$1(`Response type '${type}' is not supported`, AxiosError$1.ERR_NOT_SUPPORT, config);
        });
    });
  })(new Response));

  const getBodyLength = async (body) => {
    if (body == null) {
      return 0;
    }

    if(utils$1.isBlob(body)) {
      return body.size;
    }

    if(utils$1.isSpecCompliantForm(body)) {
      const _request = new Request(platform.origin, {
        method: 'POST',
        body,
      });
      return (await _request.arrayBuffer()).byteLength;
    }

    if(utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
      return body.byteLength;
    }

    if(utils$1.isURLSearchParams(body)) {
      body = body + '';
    }

    if(utils$1.isString(body)) {
      return (await encodeText(body)).byteLength;
    }
  };

  const resolveBodyLength = async (headers, body) => {
    const length = utils$1.toFiniteNumber(headers.getContentLength());

    return length == null ? getBodyLength(body) : length;
  };

  var fetchAdapter = isFetchSupported && (async (config) => {
    let {
      url,
      method,
      data,
      signal,
      cancelToken,
      timeout,
      onDownloadProgress,
      onUploadProgress,
      responseType,
      headers,
      withCredentials = 'same-origin',
      fetchOptions
    } = resolveConfig(config);

    responseType = responseType ? (responseType + '').toLowerCase() : 'text';

    let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);

    let request;

    const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
        composedSignal.unsubscribe();
    });

    let requestContentLength;

    try {
      if (
        onUploadProgress && supportsRequestStream && method !== 'get' && method !== 'head' &&
        (requestContentLength = await resolveBodyLength(headers, data)) !== 0
      ) {
        let _request = new Request(url, {
          method: 'POST',
          body: data,
          duplex: "half"
        });

        let contentTypeHeader;

        if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get('content-type'))) {
          headers.setContentType(contentTypeHeader);
        }

        if (_request.body) {
          const [onProgress, flush] = progressEventDecorator(
            requestContentLength,
            progressEventReducer(asyncDecorator(onUploadProgress))
          );

          data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
        }
      }

      if (!utils$1.isString(withCredentials)) {
        withCredentials = withCredentials ? 'include' : 'omit';
      }

      // Cloudflare Workers throws when credentials are defined
      // see https://github.com/cloudflare/workerd/issues/902
      const isCredentialsSupported = "credentials" in Request.prototype;
      request = new Request(url, {
        ...fetchOptions,
        signal: composedSignal,
        method: method.toUpperCase(),
        headers: headers.normalize().toJSON(),
        body: data,
        duplex: "half",
        credentials: isCredentialsSupported ? withCredentials : undefined
      });

      let response = await fetch(request);

      const isStreamResponse = supportsResponseStream && (responseType === 'stream' || responseType === 'response');

      if (supportsResponseStream && (onDownloadProgress || (isStreamResponse && unsubscribe))) {
        const options = {};

        ['status', 'statusText', 'headers'].forEach(prop => {
          options[prop] = response[prop];
        });

        const responseContentLength = utils$1.toFiniteNumber(response.headers.get('content-length'));

        const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
          responseContentLength,
          progressEventReducer(asyncDecorator(onDownloadProgress), true)
        ) || [];

        response = new Response(
          trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
            flush && flush();
            unsubscribe && unsubscribe();
          }),
          options
        );
      }

      responseType = responseType || 'text';

      let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || 'text'](response, config);

      !isStreamResponse && unsubscribe && unsubscribe();

      return await new Promise((resolve, reject) => {
        settle(resolve, reject, {
          data: responseData,
          headers: AxiosHeaders$1.from(response.headers),
          status: response.status,
          statusText: response.statusText,
          config,
          request
        });
      })
    } catch (err) {
      unsubscribe && unsubscribe();

      if (err && err.name === 'TypeError' && /fetch/i.test(err.message)) {
        throw Object.assign(
          new AxiosError$1('Network Error', AxiosError$1.ERR_NETWORK, config, request),
          {
            cause: err.cause || err
          }
        )
      }

      throw AxiosError$1.from(err, err && err.code, config, request);
    }
  });

  const knownAdapters = {
    http: httpAdapter,
    xhr: xhrAdapter,
    fetch: fetchAdapter
  };

  utils$1.forEach(knownAdapters, (fn, value) => {
    if (fn) {
      try {
        Object.defineProperty(fn, 'name', {value});
      } catch (e) {
        // eslint-disable-next-line no-empty
      }
      Object.defineProperty(fn, 'adapterName', {value});
    }
  });

  const renderReason = (reason) => `- ${reason}`;

  const isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;

  var adapters = {
    getAdapter: (adapters) => {
      adapters = utils$1.isArray(adapters) ? adapters : [adapters];

      const {length} = adapters;
      let nameOrAdapter;
      let adapter;

      const rejectedReasons = {};

      for (let i = 0; i < length; i++) {
        nameOrAdapter = adapters[i];
        let id;

        adapter = nameOrAdapter;

        if (!isResolvedHandle(nameOrAdapter)) {
          adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];

          if (adapter === undefined) {
            throw new AxiosError$1(`Unknown adapter '${id}'`);
          }
        }

        if (adapter) {
          break;
        }

        rejectedReasons[id || '#' + i] = adapter;
      }

      if (!adapter) {

        const reasons = Object.entries(rejectedReasons)
          .map(([id, state]) => `adapter ${id} ` +
            (state === false ? 'is not supported by the environment' : 'is not available in the build')
          );

        let s = length ?
          (reasons.length > 1 ? 'since :\n' + reasons.map(renderReason).join('\n') : ' ' + renderReason(reasons[0])) :
          'as no adapter specified';

        throw new AxiosError$1(
          `There is no suitable adapter to dispatch the request ` + s,
          'ERR_NOT_SUPPORT'
        );
      }

      return adapter;
    },
    adapters: knownAdapters
  };

  /**
   * Throws a `CanceledError` if cancellation has been requested.
   *
   * @param {Object} config The config that is to be used for the request
   *
   * @returns {void}
   */
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }

    if (config.signal && config.signal.aborted) {
      throw new CanceledError$1(null, config);
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  function dispatchRequest(config) {
    throwIfCancellationRequested(config);

    config.headers = AxiosHeaders$1.from(config.headers);

    // Transform request data
    config.data = transformData.call(
      config,
      config.transformRequest
    );

    if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
      config.headers.setContentType('application/x-www-form-urlencoded', false);
    }

    const adapter = adapters.getAdapter(config.adapter || defaults.adapter);

    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      response.data = transformData.call(
        config,
        config.transformResponse,
        response
      );

      response.headers = AxiosHeaders$1.from(response.headers);

      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel$1(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && reason.response) {
          reason.response.data = transformData.call(
            config,
            config.transformResponse,
            reason.response
          );
          reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
        }
      }

      return Promise.reject(reason);
    });
  }

  const validators$1 = {};

  // eslint-disable-next-line func-names
  ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
    validators$1[type] = function validator(thing) {
      return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
    };
  });

  const deprecatedWarnings = {};

  /**
   * Transitional option validator
   *
   * @param {function|boolean?} validator - set to false if the transitional option has been removed
   * @param {string?} version - deprecated version / removed since version
   * @param {string?} message - some message with additional info
   *
   * @returns {function}
   */
  validators$1.transitional = function transitional(validator, version, message) {
    function formatMessage(opt, desc) {
      return '[Axios v' + VERSION$1 + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
    }

    // eslint-disable-next-line func-names
    return (value, opt, opts) => {
      if (validator === false) {
        throw new AxiosError$1(
          formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
          AxiosError$1.ERR_DEPRECATED
        );
      }

      if (version && !deprecatedWarnings[opt]) {
        deprecatedWarnings[opt] = true;
        // eslint-disable-next-line no-console
        console.warn(
          formatMessage(
            opt,
            ' has been deprecated since v' + version + ' and will be removed in the near future'
          )
        );
      }

      return validator ? validator(value, opt, opts) : true;
    };
  };

  /**
   * Assert object's properties type
   *
   * @param {object} options
   * @param {object} schema
   * @param {boolean?} allowUnknown
   *
   * @returns {object}
   */

  function assertOptions(options, schema, allowUnknown) {
    if (typeof options !== 'object') {
      throw new AxiosError$1('options must be an object', AxiosError$1.ERR_BAD_OPTION_VALUE);
    }
    const keys = Object.keys(options);
    let i = keys.length;
    while (i-- > 0) {
      const opt = keys[i];
      const validator = schema[opt];
      if (validator) {
        const value = options[opt];
        const result = value === undefined || validator(value, opt, options);
        if (result !== true) {
          throw new AxiosError$1('option ' + opt + ' must be ' + result, AxiosError$1.ERR_BAD_OPTION_VALUE);
        }
        continue;
      }
      if (allowUnknown !== true) {
        throw new AxiosError$1('Unknown option ' + opt, AxiosError$1.ERR_BAD_OPTION);
      }
    }
  }

  var validator = {
    assertOptions,
    validators: validators$1
  };

  const validators = validator.validators;

  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   *
   * @return {Axios} A new instance of Axios
   */
  let Axios$1 = class Axios {
    constructor(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
     * @param {?Object} config
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    async request(configOrUrl, config) {
      try {
        return await this._request(configOrUrl, config);
      } catch (err) {
        if (err instanceof Error) {
          let dummy;

          Error.captureStackTrace ? Error.captureStackTrace(dummy = {}) : (dummy = new Error());

          // slice off the Error: ... line
          const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, '') : '';
          try {
            if (!err.stack) {
              err.stack = stack;
              // match without the 2 top stack lines
            } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ''))) {
              err.stack += '\n' + stack;
            }
          } catch (e) {
            // ignore the case where "stack" is an un-writable property
          }
        }

        throw err;
      }
    }

    _request(configOrUrl, config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof configOrUrl === 'string') {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }

      config = mergeConfig$1(this.defaults, config);

      const {transitional, paramsSerializer, headers} = config;

      if (transitional !== undefined) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators.transitional(validators.boolean),
          forcedJSONParsing: validators.transitional(validators.boolean),
          clarifyTimeoutError: validators.transitional(validators.boolean)
        }, false);
      }

      if (paramsSerializer != null) {
        if (utils$1.isFunction(paramsSerializer)) {
          config.paramsSerializer = {
            serialize: paramsSerializer
          };
        } else {
          validator.assertOptions(paramsSerializer, {
            encode: validators.function,
            serialize: validators.function
          }, true);
        }
      }

      // Set config.method
      config.method = (config.method || this.defaults.method || 'get').toLowerCase();

      // Flatten headers
      let contextHeaders = headers && utils$1.merge(
        headers.common,
        headers[config.method]
      );

      headers && utils$1.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        (method) => {
          delete headers[method];
        }
      );

      config.headers = AxiosHeaders$1.concat(contextHeaders, headers);

      // filter out skipped interceptors
      const requestInterceptorChain = [];
      let synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      const responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      let promise;
      let i = 0;
      let len;

      if (!synchronousRequestInterceptors) {
        const chain = [dispatchRequest.bind(this), undefined];
        chain.unshift.apply(chain, requestInterceptorChain);
        chain.push.apply(chain, responseInterceptorChain);
        len = chain.length;

        promise = Promise.resolve(config);

        while (i < len) {
          promise = promise.then(chain[i++], chain[i++]);
        }

        return promise;
      }

      len = requestInterceptorChain.length;

      let newConfig = config;

      i = 0;

      while (i < len) {
        const onFulfilled = requestInterceptorChain[i++];
        const onRejected = requestInterceptorChain[i++];
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected.call(this, error);
          break;
        }
      }

      try {
        promise = dispatchRequest.call(this, newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      i = 0;
      len = responseInterceptorChain.length;

      while (i < len) {
        promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
      }

      return promise;
    }

    getUri(config) {
      config = mergeConfig$1(this.defaults, config);
      const fullPath = buildFullPath(config.baseURL, config.url);
      return buildURL(fullPath, config.params, config.paramsSerializer);
    }
  };

  // Provide aliases for supported request methods
  utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios$1.prototype[method] = function(url, config) {
      return this.request(mergeConfig$1(config || {}, {
        method,
        url,
        data: (config || {}).data
      }));
    };
  });

  utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/

    function generateHTTPMethod(isForm) {
      return function httpMethod(url, data, config) {
        return this.request(mergeConfig$1(config || {}, {
          method,
          headers: isForm ? {
            'Content-Type': 'multipart/form-data'
          } : {},
          url,
          data
        }));
      };
    }

    Axios$1.prototype[method] = generateHTTPMethod();

    Axios$1.prototype[method + 'Form'] = generateHTTPMethod(true);
  });

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @param {Function} executor The executor function.
   *
   * @returns {CancelToken}
   */
  let CancelToken$1 = class CancelToken {
    constructor(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      let resolvePromise;

      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      const token = this;

      // eslint-disable-next-line func-names
      this.promise.then(cancel => {
        if (!token._listeners) return;

        let i = token._listeners.length;

        while (i-- > 0) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });

      // eslint-disable-next-line func-names
      this.promise.then = onfulfilled => {
        let _resolve;
        // eslint-disable-next-line func-names
        const promise = new Promise(resolve => {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);

        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };

        return promise;
      };

      executor(function cancel(message, config, request) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new CanceledError$1(message, config, request);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    }

    /**
     * Subscribe to the cancel signal
     */

    subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }

      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    }

    /**
     * Unsubscribe from the cancel signal
     */

    unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      const index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    }

    toAbortSignal() {
      const controller = new AbortController();

      const abort = (err) => {
        controller.abort(err);
      };

      this.subscribe(abort);

      controller.signal.unsubscribe = () => this.unsubscribe(abort);

      return controller.signal;
    }

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    static source() {
      let cancel;
      const token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token,
        cancel
      };
    }
  };

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  var args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   *
   * @returns {Function}
   */
  function spread$1(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  }

  /**
   * Determines whether the payload is an error thrown by Axios
   *
   * @param {*} payload The value to test
   *
   * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
   */
  function isAxiosError$1(payload) {
    return utils$1.isObject(payload) && (payload.isAxiosError === true);
  }

  const HttpStatusCode$1 = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511,
  };

  Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
    HttpStatusCode$1[value] = key;
  });

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   *
   * @returns {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    const context = new Axios$1(defaultConfig);
    const instance = bind(Axios$1.prototype.request, context);

    // Copy axios.prototype to instance
    utils$1.extend(instance, Axios$1.prototype, context, {allOwnKeys: true});

    // Copy context to instance
    utils$1.extend(instance, context, null, {allOwnKeys: true});

    // Factory for creating new instances
    instance.create = function create(instanceConfig) {
      return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
    };

    return instance;
  }

  // Create the default instance to be exported
  const axios = createInstance(defaults);

  // Expose Axios class to allow class inheritance
  axios.Axios = Axios$1;

  // Expose Cancel & CancelToken
  axios.CanceledError = CanceledError$1;
  axios.CancelToken = CancelToken$1;
  axios.isCancel = isCancel$1;
  axios.VERSION = VERSION$1;
  axios.toFormData = toFormData$1;

  // Expose AxiosError class
  axios.AxiosError = AxiosError$1;

  // alias for CanceledError for backward compatibility
  axios.Cancel = axios.CanceledError;

  // Expose all/spread
  axios.all = function all(promises) {
    return Promise.all(promises);
  };

  axios.spread = spread$1;

  // Expose isAxiosError
  axios.isAxiosError = isAxiosError$1;

  // Expose mergeConfig
  axios.mergeConfig = mergeConfig$1;

  axios.AxiosHeaders = AxiosHeaders$1;

  axios.formToJSON = thing => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);

  axios.getAdapter = adapters.getAdapter;

  axios.HttpStatusCode = HttpStatusCode$1;

  axios.default = axios;

  // This module is intended to unwrap Axios default export as named.
  // Keep top-level export same with static properties
  // so that it can keep same with es module or cjs
  const {
    Axios,
    AxiosError,
    CanceledError,
    isCancel,
    CancelToken,
    VERSION,
    all,
    Cancel,
    isAxiosError,
    spread,
    toFormData,
    AxiosHeaders,
    HttpStatusCode,
    formToJSON,
    getAdapter,
    mergeConfig
  } = axios;

  try { Object.defineProperty(axios, "__" + "esModule", { value: true }); axios.default = axios; } catch (ex) {}

  exports.Axios = Axios;
  exports.AxiosError = AxiosError;
  exports.AxiosHeaders = AxiosHeaders;
  exports.Cancel = Cancel;
  exports.CancelToken = CancelToken;
  exports.CanceledError = CanceledError;
  exports.HttpStatusCode = HttpStatusCode;
  exports.VERSION = VERSION;
  exports.all = all;
  exports.default = axios;
  exports.formToJSON = formToJSON;
  exports.getAdapter = getAdapter;
  exports.isAxiosError = isAxiosError;
  exports.isCancel = isCancel;
  exports.mergeConfig = mergeConfig;
  exports.spread = spread;
  exports.toFormData = toFormData;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
