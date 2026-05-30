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
      return `Node.js/${browser$1.version.substr(1)} (${browser$1.platform}; ${
      browser$1.arch
    })`;
    }

    return "<environment undetectable>";
  }

  // @ts-check

  function register(state, name, method, options) {
    if (typeof method !== "function") {
      throw new Error("method for before hook must be a function");
    }

    if (!options) {
      options = {};
    }

    if (Array.isArray(name)) {
      return name.reverse().reduce((callback, name) => {
        return register.bind(null, state, name, callback, options);
      }, method)();
    }

    return Promise.resolve().then(() => {
      if (!state.registry[name]) {
        return method(options);
      }

      return state.registry[name].reduce((method, registered) => {
        return registered.hook.bind(null, method, options);
      }, method)();
    });
  }

  // @ts-check

  function addHook(state, kind, name, hook) {
    const orig = hook;
    if (!state.registry[name]) {
      state.registry[name] = [];
    }

    if (kind === "before") {
      hook = (method, options) => {
        return Promise.resolve()
          .then(orig.bind(null, options))
          .then(method.bind(null, options));
      };
    }

    if (kind === "after") {
      hook = (method, options) => {
        let result;
        return Promise.resolve()
          .then(method.bind(null, options))
          .then((result_) => {
            result = result_;
            return orig(result, options);
          })
          .then(() => {
            return result;
          });
      };
    }

    if (kind === "error") {
      hook = (method, options) => {
        return Promise.resolve()
          .then(method.bind(null, options))
          .catch((error) => {
            return orig(error, options);
          });
      };
    }

    state.registry[name].push({
      hook: hook,
      orig: orig,
    });
  }

  // @ts-check

  function removeHook(state, name, method) {
    if (!state.registry[name]) {
      return;
    }

    const index = state.registry[name]
      .map((registered) => {
        return registered.orig;
      })
      .indexOf(method);

    if (index === -1) {
      return;
    }

    state.registry[name].splice(index, 1);
  }

  // @ts-check


  // bind with array of arguments: https://stackoverflow.com/a/21792913
  const bind = Function.bind;
  const bindable = bind.bind(bind);

  function bindApi(hook, state, name) {
    const removeHookRef = bindable(removeHook, null).apply(
      null,
      [state]
    );
    hook.api = { remove: removeHookRef };
    hook.remove = removeHookRef;
    ["before", "error", "after", "wrap"].forEach((kind) => {
      const args = [state, kind];
      hook[kind] = hook.api[kind] = bindable(addHook, null).apply(null, args);
    });
  }

  function Collection() {
    const state = {
      registry: {},
    };

    const hook = register.bind(null, state);
    bindApi(hook, state);

    return hook;
  }

  var Hook = { Collection };

  // pkg/dist-src/defaults.js

  // pkg/dist-src/version.js
  var VERSION$3 = "0.0.0-development";

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
      format: ""
    }
  };

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

  // pkg/dist-src/util/is-plain-object.js
  function isPlainObject$1(value) {
    if (typeof value !== "object" || value === null) return false;
    if (Object.prototype.toString.call(value) !== "[object Object]") return false;
    const proto = Object.getPrototypeOf(value);
    if (proto === null) return true;
    const Ctor = Object.prototype.hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return typeof Ctor === "function" && Ctor instanceof Ctor && Function.prototype.call(Ctor) === Function.prototype.call(value);
  }

  // pkg/dist-src/util/merge-deep.js
  function mergeDeep(defaults, options) {
    const result = Object.assign({}, defaults);
    Object.keys(options).forEach((key) => {
      if (isPlainObject$1(options[key])) {
        if (!(key in defaults)) Object.assign(result, { [key]: options[key] });
        else result[key] = mergeDeep(defaults[key], options[key]);
      } else {
        Object.assign(result, { [key]: options[key] });
      }
    });
    return result;
  }

  // pkg/dist-src/util/remove-undefined-properties.js
  function removeUndefinedProperties(obj) {
    for (const key in obj) {
      if (obj[key] === void 0) {
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
    if (options.url === "/graphql") {
      if (defaults && defaults.mediaType.previews?.length) {
        mergedOptions.mediaType.previews = defaults.mediaType.previews.filter(
          (preview) => !mergedOptions.mediaType.previews.includes(preview)
        ).concat(mergedOptions.mediaType.previews);
      }
      mergedOptions.mediaType.previews = (mergedOptions.mediaType.previews || []).map((preview) => preview.replace(/-preview/, ""));
    }
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
  var urlVariableRegex = /\{[^{}}]+\}/g;
  function removeNonChars(variableName) {
    return variableName.replace(/(?:^\W+)|(?:(?<!\W)\W+$)/g, "").split(/,/);
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
    const result = { __proto__: null };
    for (const key of Object.keys(object)) {
      if (keysToOmit.indexOf(key) === -1) {
        result[key] = object[key];
      }
    }
    return result;
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
    return value !== void 0 && value !== null;
  }
  function isKeyOperator(operator) {
    return operator === ";" || operator === "&" || operator === "?";
  }
  function getValues(context, operator, key, modifier) {
    var value = context[key], result = [];
    if (isDefined(value) && value !== "") {
      if (typeof value === "string" || typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
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
    template = template.replace(
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
    if (template === "/") {
      return template;
    } else {
      return template.replace(/\/$/, "");
    }
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
          (format) => format.replace(
            /application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/,
            `application/vnd$1$2.${options.mediaType.format}`
          )
        ).join(",");
      }
      if (url.endsWith("/graphql")) {
        if (options.mediaType.previews?.length) {
          const previewsFromAcceptHeader = headers.accept.match(/(?<![\w-])[\w-]+(?=-preview)/g) || [];
          headers.accept = previewsFromAcceptHeader.concat(options.mediaType.previews).map((preview) => {
            const format = options.mediaType.format ? `.${options.mediaType.format}` : "+json";
            return `application/vnd.github.${preview}-preview${format}`;
          }).join(",");
        }
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

  // pkg/dist-src/index.js
  var endpoint = withDefaults$2(null, DEFAULTS);

  var dist = {};

  var hasRequiredDist;

  function requireDist () {
  	if (hasRequiredDist) return dist;
  	hasRequiredDist = 1;
  	/*!
  	 * content-type
  	 * Copyright(c) 2015 Douglas Christopher Wilson
  	 * MIT Licensed
  	 */
  	Object.defineProperty(dist, "__esModule", { value: true });
  	dist.format = format;
  	dist.parse = parse;
  	const TEXT_REGEXP = /^[\u0009\u0020-\u007e\u0080-\u00ff]*$/;
  	const TOKEN_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
  	/**
  	 * RegExp to match chars that must be quoted-pair in RFC 9110 sec 5.6.4
  	 */
  	const QUOTE_REGEXP = /[\\"]/g;
  	/**
  	 * RegExp to match type in RFC 9110 sec 8.3.1
  	 *
  	 * media-type = type "/" subtype
  	 * type       = token
  	 * subtype    = token
  	 */
  	const TYPE_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
  	/**
  	 * Null object perf optimization. Faster than `Object.create(null)` and `{ __proto__: null }`.
  	 */
  	const NullObject = /* @__PURE__ */ (() => {
  	    const C = function () { };
  	    C.prototype = Object.create(null);
  	    return C;
  	})();
  	/**
  	 * Format an object into a `Content-Type` header.
  	 */
  	function format(obj) {
  	    const { type, parameters } = obj;
  	    if (!type || !TYPE_REGEXP.test(type)) {
  	        throw new TypeError(`Invalid type: ${type}`);
  	    }
  	    let result = type;
  	    if (parameters) {
  	        for (const param of Object.keys(parameters)) {
  	            if (!TOKEN_REGEXP.test(param)) {
  	                throw new TypeError(`Invalid parameter name: ${param}`);
  	            }
  	            result += `; ${param}=${qstring(parameters[param])}`;
  	        }
  	    }
  	    return result;
  	}
  	/**
  	 * Parse a `Content-Type` header.
  	 */
  	function parse(header, options) {
  	    const len = header.length;
  	    let index = skipOWS(header, 0, len);
  	    const valueStart = index;
  	    index = skipValue(header, index, len);
  	    const valueEnd = trailingOWS(header, valueStart, index);
  	    const type = header.slice(valueStart, valueEnd).toLowerCase();
  	    const parameters = options?.parameters === false
  	        ? new NullObject()
  	        : parseParameters(header, index, len);
  	    return { type, parameters };
  	}
  	const SP = 32; // " "
  	const HTAB = 9; // "\t"
  	const SEMI = 59; // ";"
  	const EQ = 61; // "="
  	const DQUOTE = 34; // '"'
  	const BSLASH = 92; // "\\"
  	/**
  	 * Parses the parameters of a `Content-Type` header starting at the given index.
  	 */
  	function parseParameters(header, index, len) {
  	    const parameters = new NullObject();
  	    parameter: while (index < len) {
  	        index = skipOWS(header, index + 1 /* Skip over ; */, len);
  	        const keyStart = index;
  	        while (index < len) {
  	            const code = header.charCodeAt(index);
  	            if (code === SEMI)
  	                continue parameter;
  	            if (code === EQ) {
  	                const keyEnd = trailingOWS(header, keyStart, index);
  	                const key = header.slice(keyStart, keyEnd).toLowerCase();
  	                index = skipOWS(header, index + 1, len);
  	                if (index < len && header.charCodeAt(index) === DQUOTE) {
  	                    index++;
  	                    let value = "";
  	                    while (index < len) {
  	                        const code = header.charCodeAt(index++);
  	                        if (code === DQUOTE) {
  	                            index = skipValue(header, index, len);
  	                            if (parameters[key] === undefined)
  	                                parameters[key] = value;
  	                            break;
  	                        }
  	                        if (code === BSLASH && index < len) {
  	                            value += header[index++];
  	                            continue;
  	                        }
  	                        value += String.fromCharCode(code);
  	                    }
  	                    continue parameter;
  	                }
  	                const valueStart = index;
  	                index = skipValue(header, index, len);
  	                if (parameters[key] === undefined) {
  	                    const valueEnd = trailingOWS(header, valueStart, index);
  	                    parameters[key] = header.slice(valueStart, valueEnd);
  	                }
  	                continue parameter;
  	            }
  	            index++;
  	        }
  	    }
  	    return parameters;
  	}
  	/**
  	 * Skip over characters until a semicolon.
  	 */
  	function skipValue(str, index, len) {
  	    while (index < len) {
  	        const char = str.charCodeAt(index);
  	        if (char === SEMI)
  	            break;
  	        index++;
  	    }
  	    return index;
  	}
  	/**
  	 * Skip optional whitespace (OWS) in an HTTP header value.
  	 *
  	 * OWS is defined in RFC 9110 sec 5.6.3 as SP (" ") or HTAB ("\t").
  	 */
  	function skipOWS(header, index, len) {
  	    while (index < len) {
  	        const char = header.charCodeAt(index);
  	        if (char !== SP && char !== HTAB)
  	            break;
  	        index++;
  	    }
  	    return index;
  	}
  	/**
  	 * Trim optional whitespace (OWS) from the end of a substring.
  	 *
  	 * OWS is defined in RFC 9110 sec 5.6.3 as SP (" ") or HTAB ("\t").
  	 */
  	function trailingOWS(header, start, end) {
  	    while (end > start) {
  	        const char = header.charCodeAt(end - 1);
  	        if (char !== SP && char !== HTAB)
  	            break;
  	        end--;
  	    }
  	    return end;
  	}
  	/**
  	 * Serialize a parameter value.
  	 */
  	function qstring(str) {
  	    if (TOKEN_REGEXP.test(str))
  	        return str;
  	    if (TEXT_REGEXP.test(str))
  	        return `"${str.replace(QUOTE_REGEXP, "\\$&")}"`;
  	    throw new TypeError(`Invalid parameter value: ${str}`);
  	}

  	return dist;
  }

  var distExports = requireDist();

  const intRegex = /^-?\d+$/;
  const noiseValue = /^-?\d+n+$/; // Noise - strings that match the custom format before being converted to it
  const originalStringify = JSON.stringify;
  const originalParse = JSON.parse;
  const customFormat = /^-?\d+n$/;

  const bigIntsStringify = /([\[:])?"(-?\d+)n"($|([\\n]|\s)*(\s|[\\n])*[,\}\]])/g;
  const noiseStringify =
    /([\[:])?("-?\d+n+)n("$|"([\\n]|\s)*(\s|[\\n])*[,\}\]])/g;

  /**
   * @typedef {(this: any, key: string | number | undefined, value: any) => any} Replacer
   * @typedef {(key: string | number | undefined, value: any, context?: { source: string }) => any} Reviver
   */

  /**
   * Converts a JavaScript value to a JSON string.
   *
   * Supports serialization of BigInt values using two strategies:
   * 1. Custom format "123n" → "123" (universal fallback)
   * 2. Native JSON.rawJSON() (Node.js 22+, fastest) when available
   *
   * All other values are serialized exactly like native JSON.stringify().
   *
   * @param {*} value The value to convert to a JSON string.
   * @param {Replacer | Array<string | number> | null} [replacer]
   *   A function that alters the behavior of the stringification process,
   *   or an array of strings/numbers to indicate properties to exclude.
   * @param {string | number} [space]
   *   A string or number to specify indentation or pretty-printing.
   * @returns {string} The JSON string representation.
   */
  const JSONStringify = (value, replacer, space) => {
    if ("rawJSON" in JSON) {
      return originalStringify(
        value,
        (key, value) => {
          if (typeof value === "bigint") return JSON.rawJSON(value.toString());

          if (Array.isArray(replacer) && replacer.includes(key)) return value;

          return value;
        },
        space,
      );
    }

    if (!value) return originalStringify(value, replacer, space);

    const convertedToCustomJSON = originalStringify(
      value,
      (key, value) => {
        const isNoise = typeof value === "string" && noiseValue.test(value);

        if (isNoise) return value.toString() + "n"; // Mark noise values with additional "n" to offset the deletion of one "n" during the processing

        if (typeof value === "bigint") return value.toString() + "n";

        if (Array.isArray(replacer) && replacer.includes(key)) return value;

        return value;
      },
      space,
    );
    const processedJSON = convertedToCustomJSON.replace(
      bigIntsStringify,
      "$1$2$3",
    ); // Delete one "n" off the end of every BigInt value
    const denoisedJSON = processedJSON.replace(noiseStringify, "$1$2$3"); // Remove one "n" off the end of every noisy string

    return denoisedJSON;
  };

  const featureCache = new Map();

  /**
   * Detects if the current JSON.parse implementation supports the context.source feature.
   *
   * Uses toString() fingerprinting to cache results and automatically detect runtime
   * replacements of JSON.parse (polyfills, mocks, etc.).
   *
   * @returns {boolean} true if context.source is supported, false otherwise.
   */
  const isContextSourceSupported = () => {
    const parseFingerprint = JSON.parse.toString();

    if (featureCache.has(parseFingerprint)) {
      return featureCache.get(parseFingerprint);
    }

    try {
      const result = JSON.parse(
        "1",
        (_, __, context) => !!context?.source && context.source === "1",
      );
      featureCache.set(parseFingerprint, result);

      return result;
    } catch {
      featureCache.set(parseFingerprint, false);

      return false;
    }
  };

  /**
   * Reviver function that converts custom-format BigInt strings back to BigInt values.
   * Also handles "noise" strings that accidentally match the BigInt format.
   *
   * @param {string | number | undefined} key The object key.
   * @param {*} value The value being parsed.
   * @param {object} [context] Parse context (if supported by JSON.parse).
   * @param {Reviver} [userReviver] User's custom reviver function.
   * @returns {any} The transformed value.
   */
  const convertMarkedBigIntsReviver = (key, value, context, userReviver) => {
    const isCustomFormatBigInt =
      typeof value === "string" && customFormat.test(value);
    if (isCustomFormatBigInt) return BigInt(value.slice(0, -1));

    const isNoiseValue = typeof value === "string" && noiseValue.test(value);
    if (isNoiseValue) return value.slice(0, -1);

    return value;
  };

  /**
   * Fast JSON.parse implementation (~2x faster than classic fallback).
   * Uses JSON.parse's context.source feature to detect integers and convert
   * large numbers directly to BigInt without string manipulation.
   *
   * Does not support legacy custom format from v1 of this library.
   *
   * @param {string} text JSON string to parse.
   * @param {Reviver} [reviver] Transform function to apply to each value.
   * @returns {any} Parsed JavaScript value.
   */
  const JSONParseV2 = (text, reviver) => {
    return JSON.parse(text, (key, value, context) => {
      const isBigNumber =
        typeof value === "number" &&
        (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER);
      const isInt = context && intRegex.test(context.source);
      const isBigInt = isBigNumber && isInt;

      if (isBigInt) return BigInt(context.source);

      return value;
    });
  };

  const MAX_INT = Number.MAX_SAFE_INTEGER.toString();
  const MAX_DIGITS = MAX_INT.length;
  const stringsOrLargeNumbers =
    /"(?:\\.|[^"])*"|-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?/g;
  const noiseValueWithQuotes = /^"-?\d+n+"$/; // Noise - strings that match the custom format before being converted to it

  /**
   * Converts a JSON string into a JavaScript value.
   *
   * Supports parsing of large integers using two strategies:
   * 1. Classic fallback: Marks large numbers with "123n" format, then converts to BigInt
   * 2. Fast path (JSONParseV2): Uses context.source feature (~2x faster) when available
   *
   * All other JSON values are parsed exactly like native JSON.parse().
   *
   * @param {string} text A valid JSON string.
   * @param {Reviver} [reviver]
   *   A function that transforms the results. This function is called for each member
   *   of the object. If a member contains nested objects, the nested objects are
   *   transformed before the parent object is.
   * @returns {any} The parsed JavaScript value.
   * @throws {SyntaxError} If text is not valid JSON.
   */
  const JSONParse = (text, reviver) => {
    if (!text) return originalParse(text, reviver);

    if (isContextSourceSupported()) return JSONParseV2(text); // Shortcut to a faster (2x) and simpler version

    // Find and mark big numbers with "n"
    const serializedData = text.replace(
      stringsOrLargeNumbers,
      (text, digits, fractional, exponential) => {
        const isString = text[0] === '"';
        const isNoise = isString && noiseValueWithQuotes.test(text);

        if (isNoise) return text.substring(0, text.length - 1) + 'n"'; // Mark noise values with additional "n" to offset the deletion of one "n" during the processing

        const isFractionalOrExponential = fractional || exponential;
        const isLessThanMaxSafeInt =
          digits &&
          (digits.length < MAX_DIGITS ||
            (digits.length === MAX_DIGITS && digits <= MAX_INT)); // With a fixed number of digits, we can correctly use lexicographical comparison to do a numeric comparison

        if (isString || isFractionalOrExponential || isLessThanMaxSafeInt)
          return text;

        return '"' + text + 'n"';
      },
    );

    return originalParse(serializedData, (key, value, context) =>
      convertMarkedBigIntsReviver(key, value),
    );
  };

  class RequestError extends Error {
    name;
    /**
     * http status code
     */
    status;
    /**
     * Request options that lead to the error.
     */
    request;
    /**
     * Response object if a response was received
     */
    response;
    constructor(message, statusCode, options) {
      super(message, { cause: options.cause });
      this.name = "HttpError";
      this.status = Number.parseInt(statusCode);
      if (Number.isNaN(this.status)) {
        this.status = 0;
      }
      /* v8 ignore else -- @preserve -- Bug with vitest coverage where it sees an else branch that doesn't exist */
      if ("response" in options) {
        this.response = options.response;
      }
      const requestCopy = Object.assign({}, options.request);
      if (options.request.headers.authorization) {
        requestCopy.headers = Object.assign({}, options.request.headers, {
          authorization: options.request.headers.authorization.replace(
            /(?<! ) .*$/,
            " [REDACTED]"
          )
        });
      }
      requestCopy.url = requestCopy.url.replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]").replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
      this.request = requestCopy;
    }
  }

  // pkg/dist-src/index.js

  // pkg/dist-src/version.js
  var VERSION$2 = "10.0.10";

  // pkg/dist-src/defaults.js
  var defaults_default = {
    headers: {
      "user-agent": `octokit-request.js/${VERSION$2} ${getUserAgent()}`
    }
  };

  // pkg/dist-src/is-plain-object.js
  function isPlainObject(value) {
    if (typeof value !== "object" || value === null) return false;
    if (Object.prototype.toString.call(value) !== "[object Object]") return false;
    const proto = Object.getPrototypeOf(value);
    if (proto === null) return true;
    const Ctor = Object.prototype.hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return typeof Ctor === "function" && Ctor instanceof Ctor && Function.prototype.call(Ctor) === Function.prototype.call(value);
  }
  var noop$1 = () => "";
  async function fetchWrapper(requestOptions) {
    const fetch = requestOptions.request?.fetch || globalThis.fetch;
    if (!fetch) {
      throw new Error(
        "fetch is not set. Please pass a fetch implementation as new Octokit({ request: { fetch }}). Learn more at https://github.com/octokit/octokit.js/#fetch-missing"
      );
    }
    const log = requestOptions.request?.log || console;
    const parseSuccessResponseBody = requestOptions.request?.parseSuccessResponseBody !== false;
    const body = isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body) ? JSONStringify(requestOptions.body) : requestOptions.body;
    const requestHeaders = Object.fromEntries(
      Object.entries(requestOptions.headers).map(([name, value]) => [
        name,
        String(value)
      ])
    );
    let fetchResponse;
    try {
      fetchResponse = await fetch(requestOptions.url, {
        method: requestOptions.method,
        body,
        redirect: requestOptions.request?.redirect,
        headers: requestHeaders,
        signal: requestOptions.request?.signal,
        // duplex must be set if request.body is ReadableStream or Async Iterables.
        // See https://fetch.spec.whatwg.org/#dom-requestinit-duplex.
        ...requestOptions.body && { duplex: "half" }
      });
    } catch (error) {
      let message = "Unknown Error";
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          error.status = 500;
          throw error;
        }
        message = error.message;
        if (error.name === "TypeError" && "cause" in error) {
          if (error.cause instanceof Error) {
            message = error.cause.message;
          } else if (typeof error.cause === "string") {
            message = error.cause;
          }
        }
      }
      const requestError = new RequestError(message, 500, {
        request: requestOptions
      });
      requestError.cause = error;
      throw requestError;
    }
    const status = fetchResponse.status;
    const url = fetchResponse.url;
    const responseHeaders = {};
    for (const [key, value] of fetchResponse.headers) {
      responseHeaders[key] = value;
    }
    const octokitResponse = {
      url,
      status,
      headers: responseHeaders,
      data: ""
    };
    if ("deprecation" in responseHeaders) {
      const matches = responseHeaders.link && responseHeaders.link.match(/<([^<>]+)>; rel="deprecation"/);
      const deprecationLink = matches && matches.pop();
      log.warn(
        `[@octokit/request] "${requestOptions.method} ${requestOptions.url}" is deprecated. It is scheduled to be removed on ${responseHeaders.sunset}${deprecationLink ? `. See ${deprecationLink}` : ""}`
      );
    }
    if (status === 204 || status === 205) {
      return octokitResponse;
    }
    if (requestOptions.method === "HEAD") {
      if (status < 400) {
        return octokitResponse;
      }
      throw new RequestError(fetchResponse.statusText, status, {
        response: octokitResponse,
        request: requestOptions
      });
    }
    if (status === 304) {
      octokitResponse.data = await getResponseData(fetchResponse);
      throw new RequestError("Not modified", status, {
        response: octokitResponse,
        request: requestOptions
      });
    }
    if (status >= 400) {
      octokitResponse.data = await getResponseData(fetchResponse);
      throw new RequestError(toErrorMessage(octokitResponse.data), status, {
        response: octokitResponse,
        request: requestOptions
      });
    }
    octokitResponse.data = parseSuccessResponseBody ? await getResponseData(fetchResponse) : fetchResponse.body;
    return octokitResponse;
  }
  async function getResponseData(response) {
    const contentType = response.headers.get("content-type");
    if (!contentType) {
      return response.text().catch(noop$1);
    }
    const mimetype = distExports.parse(contentType);
    if (isJSONResponse(mimetype)) {
      let text = "";
      try {
        text = await response.text();
        return JSONParse(text);
      } catch (err) {
        return text;
      }
    } else if (mimetype.type.startsWith("text/") || mimetype.parameters.charset?.toLowerCase() === "utf-8") {
      return response.text().catch(noop$1);
    } else {
      return response.arrayBuffer().catch(
        /* v8 ignore next -- @preserve */
        () => new ArrayBuffer(0)
      );
    }
  }
  function isJSONResponse(mimetype) {
    return mimetype.type === "application/json" || mimetype.type === "application/scim+json";
  }
  function toErrorMessage(data) {
    if (typeof data === "string") {
      return data;
    }
    if (data instanceof ArrayBuffer) {
      return "Unknown error";
    }
    if ("message" in data) {
      const suffix = "documentation_url" in data ? ` - ${data.documentation_url}` : "";
      return Array.isArray(data.errors) ? `${data.message}: ${data.errors.map((v) => JSON.stringify(v)).join(", ")}${suffix}` : `${data.message}${suffix}`;
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
  var request = withDefaults$1(endpoint, defaults_default);
  /* v8 ignore next -- @preserve */
  /* v8 ignore else -- @preserve */

  // pkg/dist-src/index.js

  // pkg/dist-src/version.js
  var VERSION$1 = "0.0.0-development";

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
      this.errors = response.errors;
      this.data = response.data;
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
    name = "GraphqlResponseError";
    errors;
    data;
  };

  // pkg/dist-src/graphql.js
  var NON_VARIABLE_OPTIONS = [
    "method",
    "baseUrl",
    "url",
    "headers",
    "request",
    "query",
    "mediaType",
    "operationName"
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
        if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key)) continue;
        return Promise.reject(
          new Error(
            `[@octokit/graphql] "${key}" cannot be used as variable name`
          )
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

  // pkg/dist-src/is-jwt.js
  var b64url = "(?:[a-zA-Z0-9_-]+)";
  var sep = "\\.";
  var jwtRE = new RegExp(`^${b64url}${sep}${b64url}${sep}${b64url}$`);
  var isJWT = jwtRE.test.bind(jwtRE);

  // pkg/dist-src/auth.js
  async function auth(token) {
    const isApp = isJWT(token);
    const isInstallation = token.startsWith("v1.") || token.startsWith("ghs_");
    const isUserToServer = token.startsWith("ghu_");
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

  const VERSION = "7.0.6";

  const noop = () => {
  };
  const consoleWarn = console.warn.bind(console);
  const consoleError = console.error.bind(console);
  function createLogger(logger = {}) {
    if (typeof logger.debug !== "function") {
      logger.debug = noop;
    }
    if (typeof logger.info !== "function") {
      logger.info = noop;
    }
    if (typeof logger.warn !== "function") {
      logger.warn = consoleWarn;
    }
    if (typeof logger.error !== "function") {
      logger.error = consoleError;
    }
    return logger;
  }
  const userAgentTrail = `octokit-core.js/${VERSION} ${getUserAgent()}`;
  class Octokit {
    static VERSION = VERSION;
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
    static plugins = [];
    /**
     * Attach a plugin (or many) to your Octokit instance.
     *
     * @example
     * const API = Octokit.plugin(plugin1, plugin2, plugin3, ...)
     */
    static plugin(...newPlugins) {
      const currentPlugins = this.plugins;
      const NewOctokit = class extends this {
        static plugins = currentPlugins.concat(
          newPlugins.filter((plugin) => !currentPlugins.includes(plugin))
        );
      };
      return NewOctokit;
    }
    constructor(options = {}) {
      const hook = new Hook.Collection();
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
      requestDefaults.headers["user-agent"] = options.userAgent ? `${options.userAgent} ${userAgentTrail}` : userAgentTrail;
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
      this.log = createLogger(options.log);
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
      for (let i = 0; i < classConstructor.plugins.length; ++i) {
        Object.assign(this, classConstructor.plugins[i](this, options));
      }
    }
    // assigned during constructor
    request;
    graphql;
    log;
    hook;
    // TODO: type `octokit.auth` based on passed options.authStrategy
    auth;
  }

  const __esModule = true ;

  exports.Octokit = Octokit;
  exports.__esModule = __esModule;

}));
