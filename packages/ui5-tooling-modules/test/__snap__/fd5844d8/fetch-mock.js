sap.ui.define((function () { 'use strict';

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

	var cjs = {};

	var FetchMock = {};

	var Router$1 = {};

	var Route$1 = {};

	var Matchers = {};

	var globToRegexp = function (glob, opts) {
	  if (typeof glob !== 'string') {
	    throw new TypeError('Expected a string');
	  }

	  var str = String(glob);

	  // The regexp we are building, as a string.
	  var reStr = "";

	  // Whether we are matching so called "extended" globs (like bash) and should
	  // support single character matching, matching ranges of characters, group
	  // matching, etc.
	  var extended = opts ? !!opts.extended : false;

	  // When globstar is _false_ (default), '/foo/*' is translated a regexp like
	  // '^\/foo\/.*$' which will match any string beginning with '/foo/'
	  // When globstar is _true_, '/foo/*' is translated to regexp like
	  // '^\/foo\/[^/]*$' which will match any string beginning with '/foo/' BUT
	  // which does not have a '/' to the right of it.
	  // E.g. with '/foo/*' these will match: '/foo/bar', '/foo/bar.txt' but
	  // these will not '/foo/bar/baz', '/foo/bar/baz.txt'
	  // Lastely, when globstar is _true_, '/foo/**' is equivelant to '/foo/*' when
	  // globstar is _false_
	  var globstar = opts ? !!opts.globstar : false;

	  // If we are doing extended matching, this boolean is true when we are inside
	  // a group (eg {*.html,*.js}), and false otherwise.
	  var inGroup = false;

	  // RegExp flags (eg "i" ) to pass in to RegExp constructor.
	  var flags = opts && typeof( opts.flags ) === "string" ? opts.flags : "";

	  var c;
	  for (var i = 0, len = str.length; i < len; i++) {
	    c = str[i];

	    switch (c) {
	    case "/":
	    case "$":
	    case "^":
	    case "+":
	    case ".":
	    case "(":
	    case ")":
	    case "=":
	    case "!":
	    case "|":
	      reStr += "\\" + c;
	      break;

	    case "?":
	      if (extended) {
	        reStr += ".";
		    break;
	      }

	    case "[":
	    case "]":
	      if (extended) {
	        reStr += c;
		    break;
	      }

	    case "{":
	      if (extended) {
	        inGroup = true;
		    reStr += "(";
		    break;
	      }

	    case "}":
	      if (extended) {
	        inGroup = false;
		    reStr += ")";
		    break;
	      }

	    case ",":
	      if (inGroup) {
	        reStr += "|";
		    break;
	      }
	      reStr += "\\" + c;
	      break;

	    case "*":
	      // Move over all consecutive "*"'s.
	      // Also store the previous and next characters
	      var prevChar = str[i - 1];
	      var starCount = 1;
	      while(str[i + 1] === "*") {
	        starCount++;
	        i++;
	      }
	      var nextChar = str[i + 1];

	      if (!globstar) {
	        // globstar is disabled, so treat any number of "*" as one
	        reStr += ".*";
	      } else {
	        // globstar is enabled, so determine if this is a globstar segment
	        var isGlobstar = starCount > 1                      // multiple "*"'s
	          && (prevChar === "/" || prevChar === undefined)   // from the start of the segment
	          && (nextChar === "/" || nextChar === undefined);   // to the end of the segment

	        if (isGlobstar) {
	          // it's a globstar, so match zero or more path segments
	          reStr += "((?:[^/]*(?:\/|$))*)";
	          i++; // move over the "/"
	        } else {
	          // it's not a globstar, so only match one path segment
	          reStr += "([^/]*)";
	        }
	      }
	      break;

	    default:
	      reStr += c;
	    }
	  }

	  // When regexp 'g' flag is specified don't
	  // constrain the regular expression with ^ & $
	  if (!flags || !~flags.indexOf('g')) {
	    reStr = "^" + reStr + "$";
	  }

	  return new RegExp(reStr, flags);
	};

	/**
	 * @param {string|RegExp} input The route pattern
	 * @param {boolean} [loose] Allow open-ended matching. Ignored with `RegExp` input.
	 */
	function parse(input, loose) {
		if (input instanceof RegExp) return { keys:false, pattern:input };
		var c, o, tmp, ext, keys=[], pattern='', arr = input.split('/');
		arr[0] || arr.shift();

		while (tmp = arr.shift()) {
			c = tmp[0];
			if (c === '*') {
				keys.push(c);
				pattern += tmp[1] === '?' ? '(?:/(.*))?' : '/(.*)';
			} else if (c === ':') {
				o = tmp.indexOf('?', 1);
				ext = tmp.indexOf('.', 1);
				keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
				pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
				if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
			} else {
				pattern += '/' + tmp;
			}
		}

		return {
			keys: keys,
			pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
		};
	}

	var RGX = /(\/|^)([:*][^/]*?)(\?)?(?=[/.]|$)/g;

	// error if key missing?
	function inject(route, values) {
		return route.replace(RGX, (x, lead, key, optional) => {
			x = values[key=='*' ? key : key.substring(1)];
			return x ? '/'+x : (optional || key=='*') ? '' : '/' + key;
		});
	}

	var dist$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		inject: inject,
		parse: parse
	});

	var require$$1 = /*@__PURE__*/getAugmentedNamespace(dist$1);

	var isSubsetOf$1 = {};

	var TypeDescriptor$1 = {};

	Object.defineProperty(TypeDescriptor$1, "__esModule", { value: true });
	TypeDescriptor$1.Type = void 0;
	const valueTypes = new Set(['boolean', 'number', 'null', 'string', 'undefined']);
	const referenceTypes = new Set(['array', 'function', 'object', 'symbol']);
	const detectableTypes = new Set(['boolean', 'function', 'number', 'string', 'symbol']);
	const typeConstructors = new Set([Boolean, Number, String]);
	class TypeDescriptor {
	    constructor(value) {
	        this.name = TypeDescriptor.of(value);
	        this.isValueType = TypeDescriptor.isValueType(value);
	        this.isReferenceType = TypeDescriptor.isReferenceType(value);
	        this.isArray = TypeDescriptor.isArray(value);
	        this.isBoolean = TypeDescriptor.isBoolean(value);
	        this.isFunction = TypeDescriptor.isFunction(value);
	        this.isNull = TypeDescriptor.isNull(value);
	        this.isNumber = TypeDescriptor.isNumber(value);
	        this.isObject = TypeDescriptor.isObject(value);
	        this.isString = TypeDescriptor.isString(value);
	        this.isSymbol = TypeDescriptor.isSymbol(value);
	        this.isUndefined = TypeDescriptor.isUndefined(value);
	    }
	    static of(value) {
	        if (value === null) {
	            return 'null';
	        }
	        if (value === undefined) {
	            return 'undefined';
	        }
	        const detectedType = typeof value;
	        if (detectableTypes.has(detectedType)) {
	            return detectedType;
	        }
	        if (detectedType === 'object') {
	            if (Array.isArray(value)) {
	                return 'array';
	            }
	            if (typeConstructors.has(value.constructor)) {
	                return value.constructor.name.toLowerCase();
	            }
	            return detectedType;
	        }
	        throw new Error('Failed due to an unknown type.');
	    }
	    static from(value) {
	        return new TypeDescriptor(value);
	    }
	    static isValueType(value) {
	        return valueTypes.has(TypeDescriptor.of(value));
	    }
	    // eslint-disable-next-line @typescript-eslint/ban-types
	    static isReferenceType(value) {
	        return referenceTypes.has(TypeDescriptor.of(value));
	    }
	    static isArray(value) {
	        return TypeDescriptor.of(value) === 'array';
	    }
	    static isBoolean(value) {
	        return TypeDescriptor.of(value) === 'boolean';
	    }
	    // eslint-disable-next-line @typescript-eslint/ban-types
	    static isFunction(value) {
	        return TypeDescriptor.of(value) === 'function';
	    }
	    static isNull(value) {
	        return TypeDescriptor.of(value) === 'null';
	    }
	    static isNumber(value) {
	        return TypeDescriptor.of(value) === 'number';
	    }
	    // eslint-disable-next-line @typescript-eslint/ban-types
	    static isObject(value) {
	        return TypeDescriptor.of(value) === 'object';
	    }
	    static isString(value) {
	        return TypeDescriptor.of(value) === 'string';
	    }
	    static isSymbol(value) {
	        return TypeDescriptor.of(value) === 'symbol';
	    }
	    static isUndefined(value) {
	        return TypeDescriptor.of(value) === 'undefined';
	    }
	}
	TypeDescriptor$1.Type = TypeDescriptor;

	Object.defineProperty(isSubsetOf$1, "__esModule", { value: true });
	isSubsetOf$1.isSubsetOf = void 0;
	const typedescriptor_1 = TypeDescriptor$1;
	const allowedTypes = new Set(['array', 'object', 'function', 'null']);
	const isSubsetOf = function (subset, superset, visited = []) {
	    const subsetType = typedescriptor_1.Type.of(subset);
	    const supersetType = typedescriptor_1.Type.of(superset);
	    if (!allowedTypes.has(subsetType)) {
	        throw new Error(`Type '${subsetType}' is not supported.`);
	    }
	    if (!allowedTypes.has(supersetType)) {
	        throw new Error(`Type '${supersetType}' is not supported.`);
	    }
	    if (typedescriptor_1.Type.isFunction(subset)) {
	        if (!typedescriptor_1.Type.isFunction(superset)) {
	            throw new Error(`Types '${subsetType}' and '${supersetType}' do not match.`);
	        }
	        return subset.toString() === superset.toString();
	    }
	    if (typedescriptor_1.Type.isArray(subset)) {
	        if (!typedescriptor_1.Type.isArray(superset)) {
	            throw new Error(`Types '${subsetType}' and '${supersetType}' do not match.`);
	        }
	        if (subset.length > superset.length) {
	            return false;
	        }
	        for (const subsetItem of subset) {
	            const subsetItemType = typedescriptor_1.Type.of(subsetItem);
	            let isItemInSuperset;
	            switch (subsetItemType) {
	                case 'array':
	                case 'object':
	                case 'function': {
	                    if (visited.includes(subsetItem)) {
	                        continue;
	                    }
	                    visited.push(subsetItem);
	                    isItemInSuperset = superset.some((supersetItem) => {
	                        try {
	                            return isSubsetOf(subsetItem, supersetItem, visited);
	                        }
	                        catch {
	                            return false;
	                        }
	                    });
	                    break;
	                }
	                default: {
	                    isItemInSuperset = superset.includes(subsetItem);
	                }
	            }
	            if (!isItemInSuperset) {
	                return false;
	            }
	        }
	        return true;
	    }
	    if (typedescriptor_1.Type.isObject(subset)) {
	        if (!typedescriptor_1.Type.isObject(superset) || typedescriptor_1.Type.isArray(superset)) {
	            throw new Error(`Types '${subsetType}' and '${supersetType}' do not match.`);
	        }
	        if (Object.keys(subset).length > Object.keys(superset).length) {
	            return false;
	        }
	        for (const [subsetKey, subsetValue] of Object.entries(subset)) {
	            const supersetValue = superset[subsetKey];
	            const subsetValueType = typedescriptor_1.Type.of(subsetValue);
	            switch (subsetValueType) {
	                case 'array':
	                case 'object':
	                case 'function': {
	                    if (visited.includes(subsetValue)) {
	                        continue;
	                    }
	                    visited.push(subsetValue);
	                    try {
	                        const isInSuperset = isSubsetOf(subsetValue, supersetValue, visited);
	                        if (!isInSuperset) {
	                            return false;
	                        }
	                    }
	                    catch {
	                        return false;
	                    }
	                    break;
	                }
	                default: {
	                    if (subsetValue !== supersetValue) {
	                        return false;
	                    }
	                }
	            }
	        }
	        return true;
	    }
	    if (typedescriptor_1.Type.isNull(subset)) {
	        if (!typedescriptor_1.Type.isNull(superset)) {
	            throw new Error(`Types '${subsetType}' and '${supersetType}' do not match.`);
	        }
	        return true;
	    }
	    throw new Error('Invalid operation.');
	};
	isSubsetOf$1.isSubsetOf = isSubsetOf;
	isSubsetOf.structural = function (subset, superset, visited = []) {
	    if (!typedescriptor_1.Type.isObject(subset)) {
	        throw new Error(`Type '${typedescriptor_1.Type.of(subset)}' is not supported.`);
	    }
	    if (!typedescriptor_1.Type.isObject(superset)) {
	        throw new Error(`Type '${typedescriptor_1.Type.of(superset)}' is not supported.`);
	    }
	    for (const [subsetKey, subsetValue] of Object.entries(subset)) {
	        if (superset[subsetKey] === undefined) {
	            return false;
	        }
	        const subsetValueType = typedescriptor_1.Type.of(subsetValue);
	        const supersetValue = superset[subsetKey];
	        if (subsetValueType === 'object') {
	            if (visited.includes(subsetValue)) {
	                continue;
	            }
	            visited.push(subsetValue);
	            try {
	                const isInSuperset = isSubsetOf.structural(subsetValue, supersetValue, visited);
	                if (!isInSuperset) {
	                    return false;
	                }
	            }
	            catch {
	                return false;
	            }
	        }
	    }
	    return true;
	};

	var has = Object.prototype.hasOwnProperty;

	function find(iter, tar, key) {
		for (key of iter.keys()) {
			if (dequal(key, tar)) return key;
		}
	}

	function dequal(foo, bar) {
		var ctor, len, tmp;
		if (foo === bar) return true;

		if (foo && bar && (ctor=foo.constructor) === bar.constructor) {
			if (ctor === Date) return foo.getTime() === bar.getTime();
			if (ctor === RegExp) return foo.toString() === bar.toString();

			if (ctor === Array) {
				if ((len=foo.length) === bar.length) {
					while (len-- && dequal(foo[len], bar[len]));
				}
				return len === -1;
			}

			if (ctor === Set) {
				if (foo.size !== bar.size) {
					return false;
				}
				for (len of foo) {
					tmp = len;
					if (tmp && typeof tmp === 'object') {
						tmp = find(bar, tmp);
						if (!tmp) return false;
					}
					if (!bar.has(tmp)) return false;
				}
				return true;
			}

			if (ctor === Map) {
				if (foo.size !== bar.size) {
					return false;
				}
				for (len of foo) {
					tmp = len[0];
					if (tmp && typeof tmp === 'object') {
						tmp = find(bar, tmp);
						if (!tmp) return false;
					}
					if (!dequal(len[1], bar.get(tmp))) {
						return false;
					}
				}
				return true;
			}

			if (ctor === ArrayBuffer) {
				foo = new Uint8Array(foo);
				bar = new Uint8Array(bar);
			} else if (ctor === DataView) {
				if ((len=foo.byteLength) === bar.byteLength) {
					while (len-- && foo.getInt8(len) === bar.getInt8(len));
				}
				return len === -1;
			}

			if (ArrayBuffer.isView(foo)) {
				if ((len=foo.byteLength) === bar.byteLength) {
					while (len-- && foo[len] === bar[len]);
				}
				return len === -1;
			}

			if (!ctor || typeof foo === 'object') {
				len = 0;
				for (ctor in foo) {
					if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
					if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor])) return false;
				}
				return Object.keys(bar).length === len;
			}
		}

		return foo !== foo && bar !== bar;
	}

	var dist = /*#__PURE__*/Object.freeze({
		__proto__: null,
		dequal: dequal
	});

	var require$$3 = /*@__PURE__*/getAugmentedNamespace(dist);

	var RequestUtils = {};

	Object.defineProperty(RequestUtils, "__esModule", {
	  value: true
	});
	RequestUtils.hasCredentialsInUrl = hasCredentialsInUrl;
	RequestUtils.normalizeUrl = normalizeUrl;
	RequestUtils.createCallLogFromUrlAndOptions = createCallLogFromUrlAndOptions;
	RequestUtils.createCallLogFromRequest = createCallLogFromRequest;
	RequestUtils.getPath = getPath;
	RequestUtils.getQuery = getQuery;
	RequestUtils.normalizeHeaders = normalizeHeaders;
	const absoluteUrlRX = new RegExp("^[a-z]+://|^data:", "i");
	const protocolRelativeUrlRX = new RegExp("^//", "i");
	function hasCredentialsInUrl(url) {
	  const urlObject = new URL(url, protocolRelativeUrlRX.test(url) ? "http://dummy" : undefined);
	  return Boolean(urlObject.username || urlObject.password);
	}
	function normalizeUrl(url, allowRelativeUrls) {
	  if (url instanceof URL) {
	    return url.href;
	  }
	  const primitiveUrl = String(url).valueOf();
	  if (absoluteUrlRX.test(primitiveUrl)) {
	    return new URL(primitiveUrl).href;
	  }
	  if (protocolRelativeUrlRX.test(primitiveUrl)) {
	    return new URL(primitiveUrl, "http://dummy").href.replace(/^[a-z]+:/, "");
	  }
	  if (("location" in globalThis)) {
	    if (primitiveUrl.startsWith("/")) {
	      return `${globalThis.location.origin}${primitiveUrl}`;
	    } else {
	      return `${globalThis.location.href}/${primitiveUrl}`;
	    }
	  } else if (allowRelativeUrls) {
	    const urlInstance = new URL(primitiveUrl, "http://dummy");
	    return urlInstance.pathname + urlInstance.search;
	  } else {
	    throw new Error("Relative urls are not support by default in node.js tests. Either use a utility such as jsdom to define globalThis.location or set `fetchMock.config.allowRelativeUrls = true`");
	  }
	}
	function createCallLogFromUrlAndOptions(url, options) {
	  const pendingPromises = [];
	  if (typeof url === "string" || url instanceof String || url instanceof URL) {
	    const normalizedUrl = normalizeUrl(url, true);
	    const derivedOptions = options ? {
	      ...options
	    } : {};
	    if (derivedOptions.headers) {
	      derivedOptions.headers = normalizeHeaders(derivedOptions.headers);
	    }
	    derivedOptions.method = derivedOptions.method ? derivedOptions.method.toLowerCase() : "get";
	    return {
	      args: [url, options],
	      url: normalizedUrl,
	      queryParams: new URLSearchParams(getQuery(normalizedUrl)),
	      options: derivedOptions,
	      signal: derivedOptions.signal,
	      pendingPromises
	    };
	  }
	  if (typeof url === "object") {
	    throw new TypeError("fetch-mock: Unrecognised Request object. Read the Config and Installation sections of the docs");
	  } else {
	    throw new TypeError("fetch-mock: Invalid arguments passed to fetch");
	  }
	}
	async function createCallLogFromRequest(request, options) {
	  const pendingPromises = [];
	  const derivedOptions = {
	    method: request.method
	  };
	  try {
	    derivedOptions.body = await request.clone().text();
	  } catch {}
	  if (request.headers) {
	    derivedOptions.headers = normalizeHeaders(request.headers);
	  }
	  const url = normalizeUrl(request.url, true);
	  const callLog = {
	    args: [request, options],
	    url,
	    queryParams: new URLSearchParams(getQuery(url)),
	    options: Object.assign(derivedOptions, options || ({})),
	    request: request,
	    signal: options && options.signal || request.signal,
	    pendingPromises
	  };
	  return callLog;
	}
	function getPath(url) {
	  const u = absoluteUrlRX.test(url) ? new URL(url) : new URL(url, "http://dummy");
	  return u.pathname;
	}
	function getQuery(url) {
	  const u = absoluteUrlRX.test(url) ? new URL(url) : new URL(url, "http://dummy");
	  return u.search ? u.search.substr(1) : "";
	}
	function normalizeHeaders(headers) {
	  let entries;
	  if (headers instanceof Headers) {
	    entries = [...headers.entries()];
	  } else if (Array.isArray(headers)) {
	    entries = headers;
	  } else {
	    entries = Object.entries(headers);
	  }
	  return Object.fromEntries(entries.map(([key, val]) => [key.toLowerCase(), String(val).valueOf()]));
	}

	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	var __importDefault$3 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(Matchers, "__esModule", { value: true });
	Matchers.builtInMatchers = Matchers.isFunctionMatcher = Matchers.isUrlMatcher = void 0;
	const glob_to_regexp_1 = __importDefault$3(globToRegexp);
	const regexparam = __importStar(require$$1);
	const is_subset_of_1 = isSubsetOf$1;
	const dequal_1 = require$$3;
	const RequestUtils_js_1$2 = RequestUtils;
	const isUrlMatcher = (matcher) => matcher instanceof RegExp ||
	    typeof matcher === 'string' ||
	    (typeof matcher === 'object' && 'href' in matcher);
	Matchers.isUrlMatcher = isUrlMatcher;
	const isFunctionMatcher = (matcher) => typeof matcher === 'function';
	Matchers.isFunctionMatcher = isFunctionMatcher;
	const stringMatchers = {
	    begin: (targetString) => ({ url }) => url.indexOf(targetString) === 0,
	    end: (targetString) => ({ url }) => url.substr(-targetString.length) === targetString,
	    glob: (targetString) => {
	        const urlRX = (0, glob_to_regexp_1.default)(targetString);
	        return ({ url }) => urlRX.test(url);
	    },
	    express: (targetString) => {
	        const urlRX = regexparam.parse(targetString);
	        return (callLog) => {
	            const vals = urlRX.pattern.exec((0, RequestUtils_js_1$2.getPath)(callLog.url));
	            if (!vals) {
	                callLog.expressParams = {};
	                return false;
	            }
	            vals.shift();
	            callLog.expressParams = urlRX.keys.reduce((map, paramName, i) => vals[i] ? Object.assign(map, { [paramName]: vals[i] }) : map, {});
	            return true;
	        };
	    },
	    path: (targetString) => {
	        const dotlessTargetString = (0, RequestUtils_js_1$2.getPath)(targetString);
	        return ({ url }) => {
	            const path = (0, RequestUtils_js_1$2.getPath)(url);
	            return path === targetString || path === dotlessTargetString;
	        };
	    },
	};
	const getHeaderMatcher = ({ headers: expectedHeaders }) => {
	    if (!expectedHeaders) {
	        return;
	    }
	    const expectation = (0, RequestUtils_js_1$2.normalizeHeaders)(expectedHeaders);
	    return ({ options: { headers = {} } }) => {
	        const lowerCaseHeaders = (0, RequestUtils_js_1$2.normalizeHeaders)(headers);
	        return Object.keys(expectation).every((headerName) => lowerCaseHeaders[headerName] === expectation[headerName]);
	    };
	};
	const getMissingHeaderMatcher = ({ missingHeaders: expectedMissingHeaders, }) => {
	    if (!expectedMissingHeaders) {
	        return;
	    }
	    const expectation = expectedMissingHeaders.map((header) => header.toLowerCase());
	    return ({ options: { headers = {} } }) => {
	        const lowerCaseHeaders = (0, RequestUtils_js_1$2.normalizeHeaders)(headers);
	        return expectation.every((headerName) => !(headerName in lowerCaseHeaders));
	    };
	};
	const getMethodMatcher = ({ method: expectedMethod }) => {
	    if (!expectedMethod) {
	        return;
	    }
	    return ({ options: { method } = {} }) => {
	        const actualMethod = method ? method.toLowerCase() : 'get';
	        return expectedMethod === actualMethod;
	    };
	};
	const getQueryParamsMatcher = ({ query: passedQuery }) => {
	    if (!passedQuery) {
	        return;
	    }
	    const expectedQuery = new URLSearchParams();
	    for (const [key, value] of Object.entries(passedQuery)) {
	        if (Array.isArray(value)) {
	            for (const item of value) {
	                expectedQuery.append(key, typeof item === 'object' || typeof item === 'undefined'
	                    ? ''
	                    : item.toString());
	            }
	        }
	        else {
	            expectedQuery.append(key, typeof value === 'object' || typeof value === 'undefined'
	                ? ''
	                : value.toString());
	        }
	    }
	    const keys = Array.from(expectedQuery.keys());
	    return ({ queryParams }) => {
	        return keys.every((key) => {
	            const expectedValues = expectedQuery.getAll(key).sort();
	            const actualValues = queryParams.getAll(key).sort();
	            if (expectedValues.length !== actualValues.length) {
	                return false;
	            }
	            if (Array.isArray(passedQuery[key])) {
	                return expectedValues.every((expected, index) => expected === actualValues[index]);
	            }
	            return (0, dequal_1.dequal)(actualValues, expectedValues);
	        });
	    };
	};
	const getExpressParamsMatcher = ({ params: expectedParams, url, }) => {
	    if (!expectedParams) {
	        return;
	    }
	    if (!(typeof url === 'string' && /express:/.test(url))) {
	        throw new Error('fetch-mock: matching on params is only possible when using an express: matcher');
	    }
	    const expectedKeys = Object.keys(expectedParams);
	    return ({ expressParams = {} }) => {
	        return expectedKeys.every((key) => expressParams[key] === expectedParams[key]);
	    };
	};
	const getBodyMatcher = (route) => {
	    const { body: expectedBody } = route;
	    if (!expectedBody) {
	        return;
	    }
	    return ({ options: { body, method = 'get' } }) => {
	        if (['get', 'head', 'delete'].includes(method.toLowerCase())) {
	            return false;
	        }
	        let sentBody;
	        try {
	            if (typeof body === 'string') {
	                sentBody = JSON.parse(body);
	            }
	        }
	        catch { }
	        return (sentBody &&
	            (route.matchPartialBody
	                ? (0, is_subset_of_1.isSubsetOf)(expectedBody, sentBody)
	                : (0, dequal_1.dequal)(expectedBody, sentBody)));
	    };
	};
	const getFunctionMatcher = ({ matcherFunction }) => matcherFunction;
	const getRegexpMatcher = (regexp) => ({ url }) => regexp.test(url);
	const getFullUrlMatcher = (route, matcherUrl, query) => {
	    const expectedUrl = (0, RequestUtils_js_1$2.normalizeUrl)(matcherUrl, route.allowRelativeUrls);
	    if (route.url === matcherUrl) {
	        route.url = expectedUrl;
	    }
	    return ({ url }) => {
	        if (query && expectedUrl.indexOf('?')) {
	            return (0, RequestUtils_js_1$2.getPath)(url) === (0, RequestUtils_js_1$2.getPath)(expectedUrl);
	        }
	        return (0, RequestUtils_js_1$2.normalizeUrl)(url, true) === expectedUrl;
	    };
	};
	const getUrlMatcher = (route) => {
	    const { url: matcherUrl, query } = route;
	    if (matcherUrl === '*') {
	        return () => true;
	    }
	    if (matcherUrl instanceof RegExp) {
	        return getRegexpMatcher(matcherUrl);
	    }
	    if (matcherUrl instanceof URL) {
	        if (matcherUrl.href) {
	            return getFullUrlMatcher(route, matcherUrl.href, query);
	        }
	    }
	    if (typeof matcherUrl === 'string') {
	        for (const shorthand in stringMatchers) {
	            if (matcherUrl.indexOf(`${shorthand}:`) === 0) {
	                const urlFragment = matcherUrl.replace(new RegExp(`^${shorthand}:`), '');
	                return stringMatchers[shorthand](urlFragment);
	            }
	        }
	        return getFullUrlMatcher(route, matcherUrl, query);
	    }
	    if (typeof matcherUrl === 'object') {
	        const matchers = Object.entries(matcherUrl).map(([key, pattern]) => {
	            if (key === 'regexp') {
	                return getRegexpMatcher(pattern);
	            }
	            else if (key in stringMatchers) {
	                return stringMatchers[key](pattern);
	            }
	            else {
	                throw new Error(`unrecognised url matching pattern: ${key}`);
	            }
	        });
	        return (route) => matchers.every((matcher) => matcher(route));
	    }
	};
	Matchers.builtInMatchers = [
	    { name: 'url', matcher: getUrlMatcher },
	    { name: 'query', matcher: getQueryParamsMatcher },
	    { name: 'method', matcher: getMethodMatcher },
	    { name: 'headers', matcher: getHeaderMatcher },
	    { name: 'missingHeaders', matcher: getMissingHeaderMatcher },
	    { name: 'params', matcher: getExpressParamsMatcher },
	    { name: 'body', matcher: getBodyMatcher, usesBody: true },
	    { name: 'matcherFunction', matcher: getFunctionMatcher },
	];

	var StatusTextMap = {};

	Object.defineProperty(StatusTextMap, "__esModule", { value: true });
	const statusTextMap = {
	    100: 'Continue',
	    101: 'Switching Protocols',
	    102: 'Processing',
	    200: 'OK',
	    201: 'Created',
	    202: 'Accepted',
	    203: 'Non-Authoritative Information',
	    204: 'No Content',
	    205: 'Reset Content',
	    206: 'Partial Content',
	    207: 'Multi-Status',
	    208: 'Already Reported',
	    226: 'IM Used',
	    300: 'Multiple Choices',
	    301: 'Moved Permanently',
	    302: 'Found',
	    303: 'See Other',
	    304: 'Not Modified',
	    305: 'Use Proxy',
	    307: 'Temporary Redirect',
	    308: 'Permanent Redirect',
	    400: 'Bad Request',
	    401: 'Unauthorized',
	    402: 'Payment Required',
	    403: 'Forbidden',
	    404: 'Not Found',
	    405: 'Method Not Allowed',
	    406: 'Not Acceptable',
	    407: 'Proxy Authentication Required',
	    408: 'Request Timeout',
	    409: 'Conflict',
	    410: 'Gone',
	    411: 'Length Required',
	    412: 'Precondition Failed',
	    413: 'Payload Too Large',
	    414: 'URI Too Long',
	    415: 'Unsupported Media Type',
	    416: 'Range Not Satisfiable',
	    417: 'Expectation Failed',
	    418: "I'm a teapot",
	    421: 'Misdirected Request',
	    422: 'Unprocessable Entity',
	    423: 'Locked',
	    424: 'Failed Dependency',
	    425: 'Unordered Collection',
	    426: 'Upgrade Required',
	    428: 'Precondition Required',
	    429: 'Too Many Requests',
	    431: 'Request Header Fields Too Large',
	    451: 'Unavailable For Legal Reasons',
	    500: 'Internal Server Error',
	    501: 'Not Implemented',
	    502: 'Bad Gateway',
	    503: 'Service Unavailable',
	    504: 'Gateway Timeout',
	    505: 'HTTP Version Not Supported',
	    506: 'Variant Also Negotiates',
	    507: 'Insufficient Storage',
	    508: 'Loop Detected',
	    509: 'Bandwidth Limit Exceeded',
	    510: 'Not Extended',
	    511: 'Network Authentication Required',
	};
	StatusTextMap.default = statusTextMap;

	var __classPrivateFieldGet = commonjsGlobal && commonjsGlobal.__classPrivateFieldGet || (function (receiver, state, kind, f) {
	  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
	  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
	  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	});
	var __importDefault$2 = commonjsGlobal && commonjsGlobal.__importDefault || (function (mod) {
	  return mod && mod.__esModule ? mod : {
	    "default": mod
	  };
	});
	var _Route_instances, _a, _Route_validate, _Route_sanitize, _Route_generateMatcher, _Route_limit, _Route_delayResponse;
	Object.defineProperty(Route$1, "__esModule", {
	  value: true
	});
	const Matchers_js_1$2 = Matchers;
	const StatusTextMap_js_1 = __importDefault$2(StatusTextMap);
	function isBodyInit(body) {
	  return body instanceof Blob || body instanceof ArrayBuffer || ArrayBuffer.isView(body) || body instanceof DataView || body instanceof FormData || body instanceof ReadableStream || body instanceof URLSearchParams || body instanceof String || typeof body === "string" || body === null;
	}
	function sanitizeStatus(status) {
	  if (status === 0) {
	    return 200;
	  }
	  if (!status) {
	    return 200;
	  }
	  if (typeof status === "number" && parseInt(String(status), 10) !== status && status >= 200 || status < 600) {
	    return status;
	  }
	  throw new TypeError(`fetch-mock: Invalid status ${status} passed on response object.
To respond with a JSON object that has status as a property assign the object to body
e.g. {"body": {"status: "registered"}}`);
	}
	class Route {
	  constructor(config) {
	    _Route_instances.add(this);
	    this.config = config;
	    __classPrivateFieldGet(this, _Route_instances, "m", _Route_sanitize).call(this);
	    __classPrivateFieldGet(this, _Route_instances, "m", _Route_validate).call(this);
	    __classPrivateFieldGet(this, _Route_instances, "m", _Route_generateMatcher).call(this);
	    __classPrivateFieldGet(this, _Route_instances, "m", _Route_limit).call(this);
	    __classPrivateFieldGet(this, _Route_instances, "m", _Route_delayResponse).call(this);
	  }
	  reset() {}
	  constructResponse(responseInput) {
	    const responseOptions = this.constructResponseOptions(responseInput);
	    const body = this.constructResponseBody(responseInput, responseOptions);
	    return {
	      response: new this.config.Response(body, responseOptions),
	      responseOptions,
	      responseInput
	    };
	  }
	  constructResponseOptions(responseInput) {
	    const options = responseInput.options || ({});
	    options.status = sanitizeStatus(responseInput.status);
	    options.statusText = StatusTextMap_js_1.default[options.status];
	    options.headers = new this.config.Headers(responseInput.headers);
	    return options;
	  }
	  constructResponseBody(responseInput, responseOptions) {
	    let body = responseInput.body;
	    const bodyIsBodyInit = isBodyInit(body);
	    if (!bodyIsBodyInit) {
	      if (typeof body === "undefined") {
	        body = null;
	      } else if (typeof body === "object") {
	        body = JSON.stringify(body);
	        if (!responseOptions.headers.has("Content-Type")) {
	          responseOptions.headers.set("Content-Type", "application/json");
	        }
	      } else {
	        throw new TypeError("Invalid body provided to construct response");
	      }
	    }
	    if (this.config.includeContentLength && !responseOptions.headers.has("Content-Length") && !(body instanceof ReadableStream) && !(body instanceof FormData)) {
	      let length = 0;
	      if (body instanceof Blob) {
	        length = body.size;
	      } else if (body instanceof ArrayBuffer || ArrayBuffer.isView(body) || body instanceof DataView) {
	        length = body.byteLength;
	      } else if (body instanceof URLSearchParams) {
	        length = body.toString().length;
	      } else if (typeof body === "string" || body instanceof String) {
	        length = body.length;
	      }
	      responseOptions.headers.set("Content-Length", length.toString());
	    }
	    return body;
	  }
	  static defineMatcher(matcher) {
	    _a.registeredMatchers.push(matcher);
	  }
	}
	(_a = Route, _Route_instances = new WeakSet(), _Route_validate = function _Route_validate() {
	  if (["matched", "unmatched"].includes(this.config.name)) {
	    throw new Error(`fetch-mock: Routes cannot use the reserved name \`${this.config.name}\``);
	  }
	  if (!(("response" in this.config))) {
	    throw new Error("fetch-mock: Each route must define a response");
	  }
	  if (!_a.registeredMatchers.some(({name}) => (name in this.config))) {
	    throw new Error("fetch-mock: Each route must specify some criteria for matching calls to fetch. To match all calls use '*'");
	  }
	}, _Route_sanitize = function _Route_sanitize() {
	  if (this.config.method) {
	    this.config.method = this.config.method.toLowerCase();
	  }
	}, _Route_generateMatcher = function _Route_generateMatcher() {
	  const activeMatchers = _a.registeredMatchers.filter(({name}) => (name in this.config)).map(({matcher, usesBody}) => ({
	    matcher: matcher(this.config),
	    usesBody
	  }));
	  this.config.usesBody = activeMatchers.some(({usesBody}) => usesBody);
	  this.matcher = normalizedRequest => activeMatchers.every(({matcher}) => matcher(normalizedRequest));
	}, _Route_limit = function _Route_limit() {
	  if (!this.config.repeat) {
	    return;
	  }
	  const originalMatcher = this.matcher;
	  let timesLeft = this.config.repeat;
	  this.matcher = callLog => {
	    const match = timesLeft && originalMatcher(callLog);
	    if (match) {
	      timesLeft--;
	      return true;
	    }
	  };
	  this.reset = () => {
	    timesLeft = this.config.repeat;
	  };
	}, _Route_delayResponse = function _Route_delayResponse() {
	  if (this.config.delay) {
	    const {response} = this.config;
	    this.config.response = () => {
	      return new Promise(res => setTimeout(() => res(response), this.config.delay));
	    };
	  }
	});
	Route.registeredMatchers = [];
	Matchers_js_1$2.builtInMatchers.forEach(Route.defineMatcher);
	Route$1.default = Route;

	var __importDefault$1 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(Router$1, "__esModule", { value: true });
	const Route_js_1$1 = __importDefault$1(Route$1);
	const Matchers_js_1$1 = Matchers;
	const RequestUtils_js_1$1 = RequestUtils;
	const responseConfigProps = [
	    'body',
	    'headers',
	    'throws',
	    'status',
	    'redirectUrl',
	];
	function nameToOptions(options) {
	    return typeof options === 'string' ? { name: options } : options;
	}
	function isPromise(response) {
	    return typeof response.then === 'function';
	}
	function normalizeResponseInput(responseInput) {
	    if (typeof responseInput === 'number') {
	        return {
	            status: responseInput,
	        };
	    }
	    else if (typeof responseInput === 'string' ||
	        shouldSendAsObject(responseInput)) {
	        return {
	            body: responseInput,
	        };
	    }
	    return responseInput;
	}
	function shouldSendAsObject(responseInput) {
	    if (responseConfigProps.some((prop) => prop in responseInput)) {
	        if (Object.keys(responseInput).every((key) => responseConfigProps.includes(key))) {
	            return false;
	        }
	        return true;
	    }
	    return true;
	}
	function throwSpecExceptions({ url, options: { headers, method, body }, }) {
	    if (headers) {
	        Object.entries(headers).forEach(([key]) => {
	            if (/\s/.test(key)) {
	                throw new TypeError('Invalid name');
	            }
	        });
	    }
	    if ((0, RequestUtils_js_1$1.hasCredentialsInUrl)(url)) {
	        throw new TypeError(`Request cannot be constructed from a URL that includes credentials: ${url}`);
	    }
	    if (['get', 'head'].includes(method) && body) {
	        throw new TypeError('Request with GET/HEAD method cannot have body.');
	    }
	}
	const resolveUntilResponseConfig = async (callLog) => {
	    let response = callLog.route.config.response;
	    while (true) {
	        if (typeof response === 'function') {
	            response = response(callLog);
	        }
	        else if (isPromise(response)) {
	            response = await response;
	        }
	        else {
	            return response;
	        }
	    }
	};
	class Router {
	    constructor(fetchMockConfig, { routes, fallbackRoute } = {}) {
	        this.config = fetchMockConfig;
	        this.routes = routes || [];
	        this.fallbackRoute = fallbackRoute;
	    }
	    needsToReadBody(request) {
	        return Boolean(request && this.routes.some((route) => route.config.usesBody));
	    }
	    execute(callLog) {
	        throwSpecExceptions(callLog);
	        return new Promise(async (resolve, reject) => {
	            const { url, options, request, pendingPromises } = callLog;
	            if (callLog.signal) {
	                const abort = () => {
	                    const error = new DOMException('The operation was aborted.', 'AbortError');
	                    const requestBody = request?.body || options?.body;
	                    if (requestBody instanceof ReadableStream) {
	                        requestBody.cancel(error);
	                    }
	                    if (callLog?.response?.body) {
	                        callLog.response.body.cancel(error);
	                    }
	                    reject(error);
	                };
	                if (callLog.signal.aborted) {
	                    abort();
	                }
	                callLog.signal.addEventListener('abort', abort);
	            }
	            if (this.needsToReadBody(request)) {
	                options.body = await options.body;
	            }
	            const routesToTry = this.fallbackRoute
	                ? [...this.routes, this.fallbackRoute]
	                : this.routes;
	            const route = routesToTry.find((route) => route.matcher(callLog));
	            if (route) {
	                try {
	                    callLog.route = route;
	                    const { response, responseOptions, responseInput } = await this.generateResponse(callLog);
	                    const observableResponse = this.createObservableResponse(response, responseOptions, responseInput, url, pendingPromises);
	                    callLog.response = response;
	                    resolve(observableResponse);
	                }
	                catch (err) {
	                    reject(err);
	                }
	            }
	            else {
	                reject(new Error(`fetch-mock: No response or fallback rule to cover ${(options && options.method) || 'GET'} to ${url}`));
	            }
	        });
	    }
	    async generateResponse(callLog) {
	        const responseInput = await resolveUntilResponseConfig(callLog);
	        if (responseInput instanceof Response) {
	            return {
	                response: responseInput,
	                responseOptions: {},
	                responseInput: {},
	            };
	        }
	        const responseConfig = normalizeResponseInput(responseInput);
	        if (responseConfig.throws) {
	            throw responseConfig.throws;
	        }
	        return callLog.route.constructResponse(responseConfig);
	    }
	    createObservableResponse(response, responseConfig, responseInput, responseUrl, pendingPromises) {
	        return new Proxy(response, {
	            get: (originalResponse, name) => {
	                if (responseInput.redirectUrl) {
	                    if (name === 'url') {
	                        return responseInput.redirectUrl;
	                    }
	                    if (name === 'redirected') {
	                        return true;
	                    }
	                }
	                else {
	                    if (name === 'url') {
	                        return responseUrl;
	                    }
	                    if (name === 'redirected') {
	                        return false;
	                    }
	                }
	                if (responseInput.status === 0) {
	                    if (name === 'status')
	                        return 0;
	                    if (name === 'statusText')
	                        return '';
	                }
	                if (typeof response[name] === 'function') {
	                    return new Proxy(response[name], {
	                        apply: (func, thisArg, args) => {
	                            const result = func.apply(response, args);
	                            if (result.then) {
	                                pendingPromises.push(result.catch(() => undefined));
	                            }
	                            return result;
	                        },
	                    });
	                }
	                return originalResponse[name];
	            },
	        });
	    }
	    addRoute(matcher, response, nameOrOptions) {
	        const config = {};
	        if ((0, Matchers_js_1$1.isUrlMatcher)(matcher)) {
	            config.url = matcher;
	        }
	        else if ((0, Matchers_js_1$1.isFunctionMatcher)(matcher)) {
	            config.matcherFunction = matcher;
	        }
	        else {
	            Object.assign(config, matcher);
	        }
	        if (typeof response !== 'undefined') {
	            config.response = response;
	        }
	        if (nameOrOptions) {
	            Object.assign(config, typeof nameOrOptions === 'string'
	                ? nameToOptions(nameOrOptions)
	                : nameOrOptions);
	        }
	        const route = new Route_js_1$1.default({
	            ...this.config,
	            ...config,
	        });
	        if (route.config.name &&
	            this.routes.some(({ config: { name: existingName } }) => route.config.name === existingName)) {
	            throw new Error('fetch-mock: Adding route with same name as existing route.');
	        }
	        this.routes.push(route);
	    }
	    setFallback(response) {
	        if (this.fallbackRoute) {
	            console.warn('calling fetchMock.catch() twice - are you sure you want to overwrite the previous fallback response');
	        }
	        this.fallbackRoute = new Route_js_1$1.default({
	            matcherFunction: () => true,
	            response: response || 'ok',
	            ...this.config,
	        });
	        this.fallbackRoute.config.isFallback = true;
	    }
	    removeRoutes({ names, includeSticky, includeFallback, } = {}) {
	        includeFallback = includeFallback ?? true;
	        this.routes = this.routes.filter(({ config: { sticky, name } }) => {
	            if (sticky && !includeSticky) {
	                return true;
	            }
	            if (!names) {
	                return false;
	            }
	            return !names.includes(name);
	        });
	        if (includeFallback) {
	            delete this.fallbackRoute;
	        }
	    }
	}
	Router$1.default = Router;

	var CallHistory$1 = {};

	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(CallHistory$1, "__esModule", { value: true });
	const RequestUtils_js_1 = RequestUtils;
	const Matchers_js_1 = Matchers;
	const Route_js_1 = __importDefault(Route$1);
	const isName = (filter) => typeof filter === 'string' &&
	    /^[\da-zA-Z-]+$/.test(filter) &&
	    !['matched', 'unmatched'].includes(filter);
	const isMatchedOrUnmatched = (filter) => typeof filter === 'boolean' ||
	    ['matched', 'unmatched'].includes(filter);
	class CallHistory {
	    constructor(config, router) {
	        this.callLogs = [];
	        this.config = config;
	        this.router = router;
	    }
	    recordCall(callLog) {
	        this.callLogs.push(callLog);
	    }
	    clear() {
	        this.callLogs.forEach(({ route }) => {
	            if (route) {
	                route.reset();
	            }
	        });
	        this.callLogs = [];
	    }
	    async flush(waitForResponseMethods) {
	        const queuedPromises = this.callLogs.flatMap((call) => call.pendingPromises);
	        await Promise.allSettled(queuedPromises);
	        if (waitForResponseMethods) {
	            await Promise.resolve();
	            await this.flush();
	        }
	    }
	    calls(filter, options) {
	        let calls = [...this.callLogs];
	        if (typeof filter === 'undefined' && !options) {
	            return calls;
	        }
	        if (isMatchedOrUnmatched(filter)) {
	            if ([true, 'matched'].includes(filter)) {
	                calls = calls.filter(({ route }) => !route.config.isFallback);
	            }
	            else if ([false, 'unmatched'].includes(filter)) {
	                calls = calls.filter(({ route }) => Boolean(route.config.isFallback));
	            }
	            if (!options) {
	                return calls;
	            }
	        }
	        else if (isName(filter)) {
	            calls = calls.filter(({ route: { config: { name }, }, }) => name === filter);
	            if (!options) {
	                return calls;
	            }
	        }
	        else {
	            if ((0, Matchers_js_1.isUrlMatcher)(filter)) {
	                options = { url: filter, ...(options || {}) };
	            }
	            else {
	                options = { ...filter, ...(options || {}) };
	            }
	        }
	        const { matcher } = new Route_js_1.default({
	            response: 'ok',
	            ...options,
	        });
	        calls = calls.filter(({ url, options }) => {
	            return matcher((0, RequestUtils_js_1.createCallLogFromUrlAndOptions)(url, options));
	        });
	        return calls;
	    }
	    called(filter, options) {
	        return Boolean(this.calls(filter, options).length);
	    }
	    lastCall(filter, options) {
	        return this.calls(filter, options).pop();
	    }
	    done(routeNames) {
	        let routesToCheck = this.router.routes;
	        if (routeNames) {
	            routeNames = Array.isArray(routeNames) ? routeNames : [routeNames];
	            routesToCheck = this.router.routes.filter(({ config: { name } }) => routeNames.includes(name));
	        }
	        return routesToCheck
	            .map((route) => {
	            const calls = this.callLogs.filter(({ route: routeApplied }) => routeApplied === route);
	            if (!calls.length) {
	                console.warn(`Warning: ${route.config.name} not called`);
	                return false;
	            }
	            const expectedTimes = route.config.repeat;
	            if (!expectedTimes) {
	                return true;
	            }
	            const actualTimes = calls.length;
	            if (expectedTimes > actualTimes) {
	                console.warn(`Warning: ${route.config.name} only called ${actualTimes} times, but ${expectedTimes} expected`);
	                return false;
	            }
	            return true;
	        })
	            .every((isDone) => isDone);
	    }
	}
	CallHistory$1.default = CallHistory;

	(function (exports) {
		var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
		    Object.defineProperty(o, "default", { enumerable: true, value: v });
		}) : function(o, v) {
		    o["default"] = v;
		});
		var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
		    if (mod && mod.__esModule) return mod;
		    var result = {};
		    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		    __setModuleDefault(result, mod);
		    return result;
		};
		var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.FetchMock = exports.defaultFetchMockConfig = void 0;
		const Router_js_1 = __importDefault(Router$1);
		const Route_js_1 = __importDefault(Route$1);
		const CallHistory_js_1 = __importDefault(CallHistory$1);
		const requestUtils = __importStar(RequestUtils);
		exports.defaultFetchMockConfig = {
		    includeContentLength: true,
		    matchPartialBody: false,
		    Request: globalThis.Request,
		    Response: globalThis.Response,
		    Headers: globalThis.Headers,
		    fetch: globalThis.fetch,
		};
		const defineShorthand = (shorthandOptions) => {
		    function shorthand(matcher, response, options) {
		        return this.route(matcher, response, Object.assign(options || {}, shorthandOptions));
		    }
		    return shorthand;
		};
		const defineGreedyShorthand = (shorthandOptions) => {
		    return function (response, options) {
		        return this.route('*', response, Object.assign(options || {}, shorthandOptions));
		    };
		};
		class FetchMock {
		    constructor(config, router) {
		        this.sticky = defineShorthand({ sticky: true });
		        this.once = defineShorthand({ repeat: 1 });
		        this.any = defineGreedyShorthand({});
		        this.anyOnce = defineGreedyShorthand({ repeat: 1 });
		        this.get = defineShorthand({ method: 'get' });
		        this.getOnce = defineShorthand({ method: 'get', repeat: 1 });
		        this.post = defineShorthand({ method: 'post' });
		        this.postOnce = defineShorthand({ method: 'post', repeat: 1 });
		        this.put = defineShorthand({ method: 'put' });
		        this.putOnce = defineShorthand({ method: 'put', repeat: 1 });
		        this.delete = defineShorthand({ method: 'delete' });
		        this.deleteOnce = defineShorthand({ method: 'delete', repeat: 1 });
		        this.head = defineShorthand({ method: 'head' });
		        this.headOnce = defineShorthand({ method: 'head', repeat: 1 });
		        this.patch = defineShorthand({ method: 'patch' });
		        this.patchOnce = defineShorthand({ method: 'patch', repeat: 1 });
		        this.config = config;
		        this.router = new Router_js_1.default(this.config, {
		            routes: router ? [...router.routes] : [],
		            fallbackRoute: router ? router.fallbackRoute : null,
		        });
		        this.callHistory = new CallHistory_js_1.default(this.config, this.router);
		        this.fetchHandler = this.fetchHandler.bind(this);
		        Object.assign(this.fetchHandler, { fetchMock: this });
		    }
		    createInstance() {
		        return new FetchMock({ ...this.config }, this.router);
		    }
		    async fetchHandler(requestInput, requestInit) {
		        let callLog;
		        if (requestInput instanceof this.config.Request) {
		            callLog = await requestUtils.createCallLogFromRequest(requestInput, requestInit);
		        }
		        else {
		            callLog = requestUtils.createCallLogFromUrlAndOptions(requestInput, requestInit);
		        }
		        this.callHistory.recordCall(callLog);
		        const responsePromise = this.router.execute(callLog);
		        callLog.pendingPromises.push(responsePromise);
		        return responsePromise;
		    }
		    route(matcher, response, options) {
		        this.router.addRoute(matcher, response, options);
		        return this;
		    }
		    catch(response) {
		        this.router.setFallback(response);
		        return this;
		    }
		    defineMatcher(matcher) {
		        Route_js_1.default.defineMatcher(matcher);
		    }
		    removeRoutes(options) {
		        this.router.removeRoutes(options);
		        return this;
		    }
		    clearHistory() {
		        this.callHistory.clear();
		        return this;
		    }
		    mockGlobal() {
		        globalThis.fetch = this.fetchHandler;
		        return this;
		    }
		    unmockGlobal() {
		        globalThis.fetch = this.config.fetch;
		        return this;
		    }
		    spy(matcher, name) {
		        if (matcher) {
		            this.route(matcher, ({ args }) => this.config.fetch(...args), name);
		        }
		        else {
		            this.catch(({ args }) => this.config.fetch(...args));
		        }
		        return this;
		    }
		    spyGlobal() {
		        this.mockGlobal();
		        return this.spy();
		    }
		}
		exports.FetchMock = FetchMock;
		const fetchMock = new FetchMock({
		    ...exports.defaultFetchMockConfig,
		});
		exports.default = fetchMock; 
	} (FetchMock));

	(function (exports) {
		var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.defaultFetchMockConfig = exports.FetchMock = void 0;
		var FetchMock_js_1 = FetchMock;
		Object.defineProperty(exports, "FetchMock", { enumerable: true, get: function () { return FetchMock_js_1.FetchMock; } });
		Object.defineProperty(exports, "defaultFetchMockConfig", { enumerable: true, get: function () { return FetchMock_js_1.defaultFetchMockConfig; } });
		const FetchMock_js_2 = __importDefault(FetchMock);
		exports.default = FetchMock_js_2.default; 
	} (cjs));

	let exp = cjs?.default || cjs || { __emptyModule: true };try { Object.defineProperty(exp, "__" + "esModule", { value: true }); exp.default = exp; } catch (ex) {}

	return exp;

}));
