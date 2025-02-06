sap.ui.define(['exports'], (function (exports) { 'use strict';

  var global$1 = (typeof global !== "undefined" ? global :
    typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window : {});

  var platform = 'browser';
  var version = ''; // empty string to avoid regexp issues

  // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
  var performance = global$1.performance || {};
  performance.now        ||
    performance.mozNow     ||
    performance.msNow      ||
    performance.oNow       ||
    performance.webkitNow  ||
    function(){ return (new Date()).getTime() };

  var browser$1 = {
    version: version,
    platform: platform};

  function getUserAgent() {
      if (typeof navigator === "object" && "userAgent" in navigator) {
          return navigator.userAgent;
      }
      if (typeof browser$1 === "object" && browser$1.version !== undefined) {
          return `Node.js/${browser$1.version.substr(1)} (${browser$1.platform}; ${browser$1.arch})`;
      }
      return "<environment undetectable>";
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var beforeAfterHook = {exports: {}};

  var register_1;
  var hasRequiredRegister;

  function requireRegister () {
  	if (hasRequiredRegister) return register_1;
  	hasRequiredRegister = 1;
  	register_1 = register;

  	function register(state, name, method, options) {
  	  if (typeof method !== "function") {
  	    throw new Error("method for before hook must be a function");
  	  }

  	  if (!options) {
  	    options = {};
  	  }

  	  if (Array.isArray(name)) {
  	    return name.reverse().reduce(function (callback, name) {
  	      return register.bind(null, state, name, callback, options);
  	    }, method)();
  	  }

  	  return Promise.resolve().then(function () {
  	    if (!state.registry[name]) {
  	      return method(options);
  	    }

  	    return state.registry[name].reduce(function (method, registered) {
  	      return registered.hook.bind(null, method, options);
  	    }, method)();
  	  });
  	}
  	return register_1;
  }

  var add;
  var hasRequiredAdd;

  function requireAdd () {
  	if (hasRequiredAdd) return add;
  	hasRequiredAdd = 1;
  	add = addHook;

  	function addHook(state, kind, name, hook) {
  	  var orig = hook;
  	  if (!state.registry[name]) {
  	    state.registry[name] = [];
  	  }

  	  if (kind === "before") {
  	    hook = function (method, options) {
  	      return Promise.resolve()
  	        .then(orig.bind(null, options))
  	        .then(method.bind(null, options));
  	    };
  	  }

  	  if (kind === "after") {
  	    hook = function (method, options) {
  	      var result;
  	      return Promise.resolve()
  	        .then(method.bind(null, options))
  	        .then(function (result_) {
  	          result = result_;
  	          return orig(result, options);
  	        })
  	        .then(function () {
  	          return result;
  	        });
  	    };
  	  }

  	  if (kind === "error") {
  	    hook = function (method, options) {
  	      return Promise.resolve()
  	        .then(method.bind(null, options))
  	        .catch(function (error) {
  	          return orig(error, options);
  	        });
  	    };
  	  }

  	  state.registry[name].push({
  	    hook: hook,
  	    orig: orig,
  	  });
  	}
  	return add;
  }

  var remove;
  var hasRequiredRemove;

  function requireRemove () {
  	if (hasRequiredRemove) return remove;
  	hasRequiredRemove = 1;
  	remove = removeHook;

  	function removeHook(state, name, method) {
  	  if (!state.registry[name]) {
  	    return;
  	  }

  	  var index = state.registry[name]
  	    .map(function (registered) {
  	      return registered.orig;
  	    })
  	    .indexOf(method);

  	  if (index === -1) {
  	    return;
  	  }

  	  state.registry[name].splice(index, 1);
  	}
  	return remove;
  }

  var hasRequiredBeforeAfterHook;

  function requireBeforeAfterHook () {
  	if (hasRequiredBeforeAfterHook) return beforeAfterHook.exports;
  	hasRequiredBeforeAfterHook = 1;
  	var register = requireRegister();
  	var addHook = requireAdd();
  	var removeHook = requireRemove();

  	// bind with array of arguments: https://stackoverflow.com/a/21792913
  	var bind = Function.bind;
  	var bindable = bind.bind(bind);

  	function bindApi(hook, state, name) {
  	  var removeHookRef = bindable(removeHook, null).apply(
  	    null,
  	    name ? [state, name] : [state]
  	  );
  	  hook.api = { remove: removeHookRef };
  	  hook.remove = removeHookRef;
  	  ["before", "error", "after", "wrap"].forEach(function (kind) {
  	    var args = name ? [state, kind, name] : [state, kind];
  	    hook[kind] = hook.api[kind] = bindable(addHook, null).apply(null, args);
  	  });
  	}

  	function HookSingular() {
  	  var singularHookName = "h";
  	  var singularHookState = {
  	    registry: {},
  	  };
  	  var singularHook = register.bind(null, singularHookState, singularHookName);
  	  bindApi(singularHook, singularHookState, singularHookName);
  	  return singularHook;
  	}

  	function HookCollection() {
  	  var state = {
  	    registry: {},
  	  };

  	  var hook = register.bind(null, state);
  	  bindApi(hook, state);

  	  return hook;
  	}

  	var collectionHookDeprecationMessageDisplayed = false;
  	function Hook() {
  	  if (!collectionHookDeprecationMessageDisplayed) {
  	    console.warn(
  	      '[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4'
  	    );
  	    collectionHookDeprecationMessageDisplayed = true;
  	  }
  	  return HookCollection();
  	}

  	Hook.Singular = HookSingular.bind();
  	Hook.Collection = HookCollection.bind();

  	beforeAfterHook.exports = Hook;
  	// expose constructors as a named property for TypeScript
  	beforeAfterHook.exports.Hook = Hook;
  	beforeAfterHook.exports.Singular = Hook.Singular;
  	beforeAfterHook.exports.Collection = Hook.Collection;
  	return beforeAfterHook.exports;
  }

  var beforeAfterHookExports = requireBeforeAfterHook();

  /*!
   * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   */

  function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
  }

  function isPlainObject(o) {
    var ctor,prot;

    if (isObject(o) === false) return false;

    // If has modified constructor
    ctor = o.constructor;
    if (ctor === undefined) return true;

    // If has modified prototype
    prot = ctor.prototype;
    if (isObject(prot) === false) return false;

    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false) {
      return false;
    }

    // Most likely a plain Object
    return true;
  }

  // pkg/dist-src/util/lowercase-keys.js
  function lowercaseKeys(object) {
    if (!object) {
      return {};
    }
    return Object.keys(object).reduce((newObj, key) => {
      newObj[key.toLowerCase()] = object[key];
      return newObj;
    }, {});
  }
  function mergeDeep(defaults, options) {
    const result = Object.assign({}, defaults);
    Object.keys(options).forEach((key) => {
      if (isPlainObject(options[key])) {
        if (!(key in defaults))
          Object.assign(result, { [key]: options[key] });
        else
          result[key] = mergeDeep(defaults[key], options[key]);
      } else {
        Object.assign(result, { [key]: options[key] });
      }
    });
    return result;
  }

  // pkg/dist-src/util/remove-undefined-properties.js
  function removeUndefinedProperties(obj) {
    for (const key in obj) {
      if (obj[key] === undefined) {
        delete obj[key];
      }
    }
    return obj;
  }

  // pkg/dist-src/merge.js
  function merge(defaults, route, options) {
    if (typeof route === "string") {
      let [method, url] = route.split(" ");
      options = Object.assign(url ? { method, url } : { url: method }, options);
    } else {
      options = Object.assign({}, route);
    }
    options.headers = lowercaseKeys(options.headers);
    removeUndefinedProperties(options);
    removeUndefinedProperties(options.headers);
    const mergedOptions = mergeDeep(defaults || {}, options);
    if (defaults && defaults.mediaType.previews.length) {
      mergedOptions.mediaType.previews = defaults.mediaType.previews.filter((preview) => !mergedOptions.mediaType.previews.includes(preview)).concat(mergedOptions.mediaType.previews);
    }
    mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map(
      (preview) => preview.replace(/-preview/, "")
    );
    return mergedOptions;
  }

  // pkg/dist-src/util/add-query-parameters.js
  function addQueryParameters(url, parameters) {
    const separator = /\?/.test(url) ? "&" : "?";
    const names = Object.keys(parameters);
    if (names.length === 0) {
      return url;
    }
    return url + separator + names.map((name) => {
      if (name === "q") {
        return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
      }
      return `${name}=${encodeURIComponent(parameters[name])}`;
    }).join("&");
  }

  // pkg/dist-src/util/extract-url-variable-names.js
  var urlVariableRegex = /\{[^}]+\}/g;
  function removeNonChars(variableName) {
    return variableName.replace(/^\W+|\W+$/g, "").split(/,/);
  }
  function extractUrlVariableNames(url) {
    const matches = url.match(urlVariableRegex);
    if (!matches) {
      return [];
    }
    return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
  }

  // pkg/dist-src/util/omit.js
  function omit(object, keysToOmit) {
    return Object.keys(object).filter((option) => !keysToOmit.includes(option)).reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
  }

  // pkg/dist-src/util/url-template.js
  function encodeReserved(str) {
    return str.split(/(%[0-9A-Fa-f]{2})/g).map(function(part) {
      if (!/%[0-9A-Fa-f]/.test(part)) {
        part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
      }
      return part;
    }).join("");
  }
  function encodeUnreserved(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
      return "%" + c.charCodeAt(0).toString(16).toUpperCase();
    });
  }
  function encodeValue(operator, value, key) {
    value = operator === "+" || operator === "#" ? encodeReserved(value) : encodeUnreserved(value);
    if (key) {
      return encodeUnreserved(key) + "=" + value;
    } else {
      return value;
    }
  }
  function isDefined(value) {
    return value !== undefined && value !== null;
  }
  function isKeyOperator(operator) {
    return operator === ";" || operator === "&" || operator === "?";
  }
  function getValues(context, operator, key, modifier) {
    var value = context[key], result = [];
    if (isDefined(value) && value !== "") {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        value = value.toString();
        if (modifier && modifier !== "*") {
          value = value.substring(0, parseInt(modifier, 10));
        }
        result.push(
          encodeValue(operator, value, isKeyOperator(operator) ? key : "")
        );
      } else {
        if (modifier === "*") {
          if (Array.isArray(value)) {
            value.filter(isDefined).forEach(function(value2) {
              result.push(
                encodeValue(operator, value2, isKeyOperator(operator) ? key : "")
              );
            });
          } else {
            Object.keys(value).forEach(function(k) {
              if (isDefined(value[k])) {
                result.push(encodeValue(operator, value[k], k));
              }
            });
          }
        } else {
          const tmp = [];
          if (Array.isArray(value)) {
            value.filter(isDefined).forEach(function(value2) {
              tmp.push(encodeValue(operator, value2));
            });
          } else {
            Object.keys(value).forEach(function(k) {
              if (isDefined(value[k])) {
                tmp.push(encodeUnreserved(k));
                tmp.push(encodeValue(operator, value[k].toString()));
              }
            });
          }
          if (isKeyOperator(operator)) {
            result.push(encodeUnreserved(key) + "=" + tmp.join(","));
          } else if (tmp.length !== 0) {
            result.push(tmp.join(","));
          }
        }
      }
    } else {
      if (operator === ";") {
        if (isDefined(value)) {
          result.push(encodeUnreserved(key));
        }
      } else if (value === "" && (operator === "&" || operator === "?")) {
        result.push(encodeUnreserved(key) + "=");
      } else if (value === "") {
        result.push("");
      }
    }
    return result;
  }
  function parseUrl(template) {
    return {
      expand: expand.bind(null, template)
    };
  }
  function expand(template, context) {
    var operators = ["+", "#", ".", "/", ";", "?", "&"];
    return template.replace(
      /\{([^\{\}]+)\}|([^\{\}]+)/g,
      function(_, expression, literal) {
        if (expression) {
          let operator = "";
          const values = [];
          if (operators.indexOf(expression.charAt(0)) !== -1) {
            operator = expression.charAt(0);
            expression = expression.substr(1);
          }
          expression.split(/,/g).forEach(function(variable) {
            var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
            values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
          });
          if (operator && operator !== "+") {
            var separator = ",";
            if (operator === "?") {
              separator = "&";
            } else if (operator !== "#") {
              separator = operator;
            }
            return (values.length !== 0 ? operator : "") + values.join(separator);
          } else {
            return values.join(",");
          }
        } else {
          return encodeReserved(literal);
        }
      }
    );
  }

  // pkg/dist-src/parse.js
  function parse(options) {
    let method = options.method.toUpperCase();
    let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
    let headers = Object.assign({}, options.headers);
    let body;
    let parameters = omit(options, [
      "method",
      "baseUrl",
      "url",
      "headers",
      "request",
      "mediaType"
    ]);
    const urlVariableNames = extractUrlVariableNames(url);
    url = parseUrl(url).expand(parameters);
    if (!/^http/.test(url)) {
      url = options.baseUrl + url;
    }
    const omittedParameters = Object.keys(options).filter((option) => urlVariableNames.includes(option)).concat("baseUrl");
    const remainingParameters = omit(parameters, omittedParameters);
    const isBinaryRequest = /application\/octet-stream/i.test(headers.accept);
    if (!isBinaryRequest) {
      if (options.mediaType.format) {
        headers.accept = headers.accept.split(/,/).map(
          (preview) => preview.replace(
            /application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/,
            `application/vnd$1$2.${options.mediaType.format}`
          )
        ).join(",");
      }
      if (options.mediaType.previews.length) {
        const previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
        headers.accept = previewsFromAcceptHeader.concat(options.mediaType.previews).map((preview) => {
          const format = options.mediaType.format ? `.${options.mediaType.format}` : "+json";
          return `application/vnd.github.${preview}-preview${format}`;
        }).join(",");
      }
    }
    if (["GET", "HEAD"].includes(method)) {
      url = addQueryParameters(url, remainingParameters);
    } else {
      if ("data" in remainingParameters) {
        body = remainingParameters.data;
      } else {
        if (Object.keys(remainingParameters).length) {
          body = remainingParameters;
        }
      }
    }
    if (!headers["content-type"] && typeof body !== "undefined") {
      headers["content-type"] = "application/json; charset=utf-8";
    }
    if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
      body = "";
    }
    return Object.assign(
      { method, url, headers },
      typeof body !== "undefined" ? { body } : null,
      options.request ? { request: options.request } : null
    );
  }

  // pkg/dist-src/endpoint-with-defaults.js
  function endpointWithDefaults(defaults, route, options) {
    return parse(merge(defaults, route, options));
  }

  // pkg/dist-src/with-defaults.js
  function withDefaults$2(oldDefaults, newDefaults) {
    const DEFAULTS2 = merge(oldDefaults, newDefaults);
    const endpoint2 = endpointWithDefaults.bind(null, DEFAULTS2);
    return Object.assign(endpoint2, {
      DEFAULTS: DEFAULTS2,
      defaults: withDefaults$2.bind(null, DEFAULTS2),
      merge: merge.bind(null, DEFAULTS2),
      parse
    });
  }

  // pkg/dist-src/version.js
  var VERSION$3 = "7.0.6";

  // pkg/dist-src/defaults.js
  var userAgent = `octokit-endpoint.js/${VERSION$3} ${getUserAgent()}`;
  var DEFAULTS = {
    method: "GET",
    baseUrl: "https://api.github.com",
    headers: {
      accept: "application/vnd.github.v3+json",
      "user-agent": userAgent
    },
    mediaType: {
      format: "",
      previews: []
    }
  };

  // pkg/dist-src/index.js
  var endpoint = withDefaults$2(null, DEFAULTS);

  var browser = {exports: {}};

  var hasRequiredBrowser;

  function requireBrowser () {
  	if (hasRequiredBrowser) return browser.exports;
  	hasRequiredBrowser = 1;
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
  	} (browser, browser.exports));
  	return browser.exports;
  }

  var browserExports = requireBrowser();

  class Deprecation extends Error {
    constructor(message) {
      super(message); // Maintains proper stack trace (only available on V8)

      /* istanbul ignore next */

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }

      this.name = 'Deprecation';
    }

  }

  var once = {exports: {}};

  var wrappy_1;
  var hasRequiredWrappy;

  function requireWrappy () {
  	if (hasRequiredWrappy) return wrappy_1;
  	hasRequiredWrappy = 1;
  	// Returns a wrapper function that returns a wrapped callback
  	// The wrapper function should do some stuff, and return a
  	// presumably different callback function.
  	// This makes sure that own properties are retained, so that
  	// decorations and such are not lost along the way.
  	wrappy_1 = wrappy;
  	function wrappy (fn, cb) {
  	  if (fn && cb) return wrappy(fn)(cb)

  	  if (typeof fn !== 'function')
  	    throw new TypeError('need wrapper function')

  	  Object.keys(fn).forEach(function (k) {
  	    wrapper[k] = fn[k];
  	  });

  	  return wrapper

  	  function wrapper() {
  	    var args = new Array(arguments.length);
  	    for (var i = 0; i < args.length; i++) {
  	      args[i] = arguments[i];
  	    }
  	    var ret = fn.apply(this, args);
  	    var cb = args[args.length-1];
  	    if (typeof ret === 'function' && ret !== cb) {
  	      Object.keys(cb).forEach(function (k) {
  	        ret[k] = cb[k];
  	      });
  	    }
  	    return ret
  	  }
  	}
  	return wrappy_1;
  }

  var hasRequiredOnce;

  function requireOnce () {
  	if (hasRequiredOnce) return once.exports;
  	hasRequiredOnce = 1;
  	var wrappy = requireWrappy();
  	once.exports = wrappy(once$1);
  	once.exports.strict = wrappy(onceStrict);

  	once$1.proto = once$1(function () {
  	  Object.defineProperty(Function.prototype, 'once', {
  	    value: function () {
  	      return once$1(this)
  	    },
  	    configurable: true
  	  });

  	  Object.defineProperty(Function.prototype, 'onceStrict', {
  	    value: function () {
  	      return onceStrict(this)
  	    },
  	    configurable: true
  	  });
  	});

  	function once$1 (fn) {
  	  var f = function () {
  	    if (f.called) return f.value
  	    f.called = true;
  	    return f.value = fn.apply(this, arguments)
  	  };
  	  f.called = false;
  	  return f
  	}

  	function onceStrict (fn) {
  	  var f = function () {
  	    if (f.called)
  	      throw new Error(f.onceError)
  	    f.called = true;
  	    return f.value = fn.apply(this, arguments)
  	  };
  	  var name = fn.name || 'Function wrapped with `once`';
  	  f.onceError = name + " shouldn't be called more than once";
  	  f.called = false;
  	  return f
  	}
  	return once.exports;
  }

  var onceExports = requireOnce();

  const logOnceCode = onceExports((deprecation) => console.warn(deprecation));
  const logOnceHeaders = onceExports((deprecation) => console.warn(deprecation));
  /**
   * Error with extra properties to help with debugging
   */
  class RequestError extends Error {
      constructor(message, statusCode, options) {
          super(message);
          // Maintains proper stack trace (only available on V8)
          /* istanbul ignore next */
          if (Error.captureStackTrace) {
              Error.captureStackTrace(this, this.constructor);
          }
          this.name = "HttpError";
          this.status = statusCode;
          let headers;
          if ("headers" in options && typeof options.headers !== "undefined") {
              headers = options.headers;
          }
          if ("response" in options) {
              this.response = options.response;
              headers = options.response.headers;
          }
          // redact request credentials without mutating original request options
          const requestCopy = Object.assign({}, options.request);
          if (options.request.headers.authorization) {
              requestCopy.headers = Object.assign({}, options.request.headers, {
                  authorization: options.request.headers.authorization.replace(/ .*$/, " [REDACTED]"),
              });
          }
          requestCopy.url = requestCopy.url
              // client_id & client_secret can be passed as URL query parameters to increase rate limit
              // see https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
              .replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]")
              // OAuth tokens can be passed as URL query parameters, although it is not recommended
              // see https://developer.github.com/v3/#oauth2-token-sent-in-a-header
              .replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
          this.request = requestCopy;
          // deprecations
          Object.defineProperty(this, "code", {
              get() {
                  logOnceCode(new Deprecation("[@octokit/request-error] `error.code` is deprecated, use `error.status`."));
                  return statusCode;
              },
          });
          Object.defineProperty(this, "headers", {
              get() {
                  logOnceHeaders(new Deprecation("[@octokit/request-error] `error.headers` is deprecated, use `error.response.headers`."));
                  return headers || {};
              },
          });
      }
  }

  // pkg/dist-src/index.js

  // pkg/dist-src/version.js
  var VERSION$2 = "6.2.8";

  // pkg/dist-src/get-buffer-response.js
  function getBufferResponse(response) {
    return response.arrayBuffer();
  }

  // pkg/dist-src/fetch-wrapper.js
  function fetchWrapper(requestOptions) {
    const log = requestOptions.request && requestOptions.request.log ? requestOptions.request.log : console;
    if (isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body)) {
      requestOptions.body = JSON.stringify(requestOptions.body);
    }
    let headers = {};
    let status;
    let url;
    const fetch = requestOptions.request && requestOptions.request.fetch || globalThis.fetch || /* istanbul ignore next */
    browserExports;
    return fetch(
      requestOptions.url,
      Object.assign(
        {
          method: requestOptions.method,
          body: requestOptions.body,
          headers: requestOptions.headers,
          redirect: requestOptions.redirect,
          // duplex must be set if request.body is ReadableStream or Async Iterables.
          // See https://fetch.spec.whatwg.org/#dom-requestinit-duplex.
          ...requestOptions.body && { duplex: "half" }
        },
        // `requestOptions.request.agent` type is incompatible
        // see https://github.com/octokit/types.ts/pull/264
        requestOptions.request
      )
    ).then(async (response) => {
      url = response.url;
      status = response.status;
      for (const keyAndValue of response.headers) {
        headers[keyAndValue[0]] = keyAndValue[1];
      }
      if ("deprecation" in headers) {
        const matches = headers.link && headers.link.match(/<([^>]+)>; rel="deprecation"/);
        const deprecationLink = matches && matches.pop();
        log.warn(
          `[@octokit/request] "${requestOptions.method} ${requestOptions.url}" is deprecated. It is scheduled to be removed on ${headers.sunset}${deprecationLink ? `. See ${deprecationLink}` : ""}`
        );
      }
      if (status === 204 || status === 205) {
        return;
      }
      if (requestOptions.method === "HEAD") {
        if (status < 400) {
          return;
        }
        throw new RequestError(response.statusText, status, {
          response: {
            url,
            status,
            headers,
            data: undefined
          },
          request: requestOptions
        });
      }
      if (status === 304) {
        throw new RequestError("Not modified", status, {
          response: {
            url,
            status,
            headers,
            data: await getResponseData(response)
          },
          request: requestOptions
        });
      }
      if (status >= 400) {
        const data = await getResponseData(response);
        const error = new RequestError(toErrorMessage(data), status, {
          response: {
            url,
            status,
            headers,
            data
          },
          request: requestOptions
        });
        throw error;
      }
      return getResponseData(response);
    }).then((data) => {
      return {
        status,
        url,
        headers,
        data
      };
    }).catch((error) => {
      if (error instanceof RequestError)
        throw error;
      else if (error.name === "AbortError")
        throw error;
      throw new RequestError(error.message, 500, {
        request: requestOptions
      });
    });
  }
  async function getResponseData(response) {
    const contentType = response.headers.get("content-type");
    if (/application\/json/.test(contentType)) {
      return response.json();
    }
    if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
      return response.text();
    }
    return getBufferResponse(response);
  }
  function toErrorMessage(data) {
    if (typeof data === "string")
      return data;
    if ("message" in data) {
      if (Array.isArray(data.errors)) {
        return `${data.message}: ${data.errors.map(JSON.stringify).join(", ")}`;
      }
      return data.message;
    }
    return `Unknown error: ${JSON.stringify(data)}`;
  }

  // pkg/dist-src/with-defaults.js
  function withDefaults$1(oldEndpoint, newDefaults) {
    const endpoint2 = oldEndpoint.defaults(newDefaults);
    const newApi = function(route, parameters) {
      const endpointOptions = endpoint2.merge(route, parameters);
      if (!endpointOptions.request || !endpointOptions.request.hook) {
        return fetchWrapper(endpoint2.parse(endpointOptions));
      }
      const request2 = (route2, parameters2) => {
        return fetchWrapper(
          endpoint2.parse(endpoint2.merge(route2, parameters2))
        );
      };
      Object.assign(request2, {
        endpoint: endpoint2,
        defaults: withDefaults$1.bind(null, endpoint2)
      });
      return endpointOptions.request.hook(request2, endpointOptions);
    };
    return Object.assign(newApi, {
      endpoint: endpoint2,
      defaults: withDefaults$1.bind(null, endpoint2)
    });
  }

  // pkg/dist-src/index.js
  var request = withDefaults$1(endpoint, {
    headers: {
      "user-agent": `octokit-request.js/${VERSION$2} ${getUserAgent()}`
    }
  });

  // pkg/dist-src/index.js

  // pkg/dist-src/version.js
  var VERSION$1 = "5.0.6";

  // pkg/dist-src/error.js
  function _buildMessageForResponseErrors(data) {
    return `Request failed due to following response errors:
` + data.errors.map((e) => ` - ${e.message}`).join("\n");
  }
  var GraphqlResponseError = class extends Error {
    constructor(request2, headers, response) {
      super(_buildMessageForResponseErrors(response));
      this.request = request2;
      this.headers = headers;
      this.response = response;
      this.name = "GraphqlResponseError";
      this.errors = response.errors;
      this.data = response.data;
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  };

  // pkg/dist-src/graphql.js
  var NON_VARIABLE_OPTIONS = [
    "method",
    "baseUrl",
    "url",
    "headers",
    "request",
    "query",
    "mediaType"
  ];
  var FORBIDDEN_VARIABLE_OPTIONS = ["query", "method", "url"];
  var GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
  function graphql(request2, query, options) {
    if (options) {
      if (typeof query === "string" && "query" in options) {
        return Promise.reject(
          new Error(`[@octokit/graphql] "query" cannot be used as variable name`)
        );
      }
      for (const key in options) {
        if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key))
          continue;
        return Promise.reject(
          new Error(`[@octokit/graphql] "${key}" cannot be used as variable name`)
        );
      }
    }
    const parsedOptions = typeof query === "string" ? Object.assign({ query }, options) : query;
    const requestOptions = Object.keys(
      parsedOptions
    ).reduce((result, key) => {
      if (NON_VARIABLE_OPTIONS.includes(key)) {
        result[key] = parsedOptions[key];
        return result;
      }
      if (!result.variables) {
        result.variables = {};
      }
      result.variables[key] = parsedOptions[key];
      return result;
    }, {});
    const baseUrl = parsedOptions.baseUrl || request2.endpoint.DEFAULTS.baseUrl;
    if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
      requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql");
    }
    return request2(requestOptions).then((response) => {
      if (response.data.errors) {
        const headers = {};
        for (const key of Object.keys(response.headers)) {
          headers[key] = response.headers[key];
        }
        throw new GraphqlResponseError(
          requestOptions,
          headers,
          response.data
        );
      }
      return response.data.data;
    });
  }

  // pkg/dist-src/with-defaults.js
  function withDefaults(request2, newDefaults) {
    const newRequest = request2.defaults(newDefaults);
    const newApi = (query, options) => {
      return graphql(newRequest, query, options);
    };
    return Object.assign(newApi, {
      defaults: withDefaults.bind(null, newRequest),
      endpoint: newRequest.endpoint
    });
  }

  // pkg/dist-src/index.js
  withDefaults(request, {
    headers: {
      "user-agent": `octokit-graphql.js/${VERSION$1} ${getUserAgent()}`
    },
    method: "POST",
    url: "/graphql"
  });
  function withCustomRequest(customRequest) {
    return withDefaults(customRequest, {
      method: "POST",
      url: "/graphql"
    });
  }

  // pkg/dist-src/auth.js
  var REGEX_IS_INSTALLATION_LEGACY = /^v1\./;
  var REGEX_IS_INSTALLATION = /^ghs_/;
  var REGEX_IS_USER_TO_SERVER = /^ghu_/;
  async function auth(token) {
    const isApp = token.split(/\./).length === 3;
    const isInstallation = REGEX_IS_INSTALLATION_LEGACY.test(token) || REGEX_IS_INSTALLATION.test(token);
    const isUserToServer = REGEX_IS_USER_TO_SERVER.test(token);
    const tokenType = isApp ? "app" : isInstallation ? "installation" : isUserToServer ? "user-to-server" : "oauth";
    return {
      type: "token",
      token,
      tokenType
    };
  }

  // pkg/dist-src/with-authorization-prefix.js
  function withAuthorizationPrefix(token) {
    if (token.split(/\./).length === 3) {
      return `bearer ${token}`;
    }
    return `token ${token}`;
  }

  // pkg/dist-src/hook.js
  async function hook(token, request, route, parameters) {
    const endpoint = request.endpoint.merge(
      route,
      parameters
    );
    endpoint.headers.authorization = withAuthorizationPrefix(token);
    return request(endpoint);
  }

  // pkg/dist-src/index.js
  var createTokenAuth = function createTokenAuth2(token) {
    if (!token) {
      throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
    }
    if (typeof token !== "string") {
      throw new Error(
        "[@octokit/auth-token] Token passed to createTokenAuth is not a string"
      );
    }
    token = token.replace(/^(token|bearer) +/i, "");
    return Object.assign(auth.bind(null, token), {
      hook: hook.bind(null, token)
    });
  };

  // pkg/dist-src/index.js

  // pkg/dist-src/version.js
  var VERSION = "4.2.4";

  // pkg/dist-src/index.js
  var Octokit = class {
    static defaults(defaults) {
      const OctokitWithDefaults = class extends this {
        constructor(...args) {
          const options = args[0] || {};
          if (typeof defaults === "function") {
            super(defaults(options));
            return;
          }
          super(
            Object.assign(
              {},
              defaults,
              options,
              options.userAgent && defaults.userAgent ? {
                userAgent: `${options.userAgent} ${defaults.userAgent}`
              } : null
            )
          );
        }
      };
      return OctokitWithDefaults;
    }
    /**
     * Attach a plugin (or many) to your Octokit instance.
     *
     * @example
     * const API = Octokit.plugin(plugin1, plugin2, plugin3, ...)
     */
    static plugin(...newPlugins) {
      var _a;
      const currentPlugins = this.plugins;
      const NewOctokit = (_a = class extends this {
      }, _a.plugins = currentPlugins.concat(
        newPlugins.filter((plugin) => !currentPlugins.includes(plugin))
      ), _a);
      return NewOctokit;
    }
    constructor(options = {}) {
      const hook = new beforeAfterHookExports.Collection();
      const requestDefaults = {
        baseUrl: request.endpoint.DEFAULTS.baseUrl,
        headers: {},
        request: Object.assign({}, options.request, {
          // @ts-ignore internal usage only, no need to type
          hook: hook.bind(null, "request")
        }),
        mediaType: {
          previews: [],
          format: ""
        }
      };
      requestDefaults.headers["user-agent"] = [
        options.userAgent,
        `octokit-core.js/${VERSION} ${getUserAgent()}`
      ].filter(Boolean).join(" ");
      if (options.baseUrl) {
        requestDefaults.baseUrl = options.baseUrl;
      }
      if (options.previews) {
        requestDefaults.mediaType.previews = options.previews;
      }
      if (options.timeZone) {
        requestDefaults.headers["time-zone"] = options.timeZone;
      }
      this.request = request.defaults(requestDefaults);
      this.graphql = withCustomRequest(this.request).defaults(requestDefaults);
      this.log = Object.assign(
        {
          debug: () => {
          },
          info: () => {
          },
          warn: console.warn.bind(console),
          error: console.error.bind(console)
        },
        options.log
      );
      this.hook = hook;
      if (!options.authStrategy) {
        if (!options.auth) {
          this.auth = async () => ({
            type: "unauthenticated"
          });
        } else {
          const auth = createTokenAuth(options.auth);
          hook.wrap("request", auth.hook);
          this.auth = auth;
        }
      } else {
        const { authStrategy, ...otherOptions } = options;
        const auth = authStrategy(
          Object.assign(
            {
              request: this.request,
              log: this.log,
              // we pass the current octokit instance as well as its constructor options
              // to allow for authentication strategies that return a new octokit instance
              // that shares the same internal state as the current one. The original
              // requirement for this was the "event-octokit" authentication strategy
              // of https://github.com/probot/octokit-auth-probot.
              octokit: this,
              octokitOptions: otherOptions
            },
            options.auth
          )
        );
        hook.wrap("request", auth.hook);
        this.auth = auth;
      }
      const classConstructor = this.constructor;
      classConstructor.plugins.forEach((plugin) => {
        Object.assign(this, plugin(this, options));
      });
    }
  };
  Octokit.VERSION = VERSION;
  Octokit.plugins = [];

  const __esModule = true ;

  exports.Octokit = Octokit;
  exports.__esModule = __esModule;

}));
