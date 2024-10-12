sap.ui.define((function () { 'use strict';

	var cjs = {};

	(function (exports) {
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  const FetchMock$3 = {};
	  FetchMock$3.mock = function (...args) {
	    if (args.length) {
	      this.addRoute(args);
	    }
	    return this._mock();
	  };
	  FetchMock$3.addRoute = function (uncompiledRoute) {
	    const route = this.compileRoute(uncompiledRoute);
	    const clashes = this.routes.filter(({identifier, method}) => {
	      const isMatch = typeof identifier === "function" ? identifier === route.identifier : String(identifier) === String(route.identifier);
	      return isMatch && (!method || !route.method || method === route.method);
	    });
	    if (this.getOption("overwriteRoutes", route) === false || !clashes.length) {
	      this._uncompiledRoutes.push(uncompiledRoute);
	      return this.routes.push(route);
	    }
	    if (this.getOption("overwriteRoutes", route) === true) {
	      clashes.forEach(clash => {
	        const index = this.routes.indexOf(clash);
	        this._uncompiledRoutes.splice(index, 1, uncompiledRoute);
	        this.routes.splice(index, 1, route);
	      });
	      return this.routes;
	    }
	    if (clashes.length) {
	      throw new Error("fetch-mock: Adding route with same name or matcher as existing route. See `overwriteRoutes` option.");
	    }
	    this._uncompiledRoutes.push(uncompiledRoute);
	    this.routes.push(route);
	  };
	  FetchMock$3._mock = function () {
	    if (!this.isSandbox) {
	      this.realFetch = this.realFetch || globalThis.fetch;
	      globalThis.fetch = this.fetchHandler;
	    }
	    return this;
	  };
	  FetchMock$3.catch = function (response) {
	    if (this.fallbackResponse) {
	      console.warn("calling fetchMock.catch() twice - are you sure you want to overwrite the previous fallback response");
	    }
	    this.fallbackResponse = response || "ok";
	    return this._mock();
	  };
	  FetchMock$3.spy = function (route) {
	    this._mock();
	    return route ? this.mock(route, this.getNativeFetch()) : this.catch(this.getNativeFetch());
	  };
	  const defineShorthand = (methodName, underlyingMethod, shorthandOptions) => {
	    FetchMock$3[methodName] = function (matcher, response, options) {
	      return this[underlyingMethod](matcher, response, Object.assign(options || ({}), shorthandOptions));
	    };
	  };
	  const defineGreedyShorthand = (methodName, underlyingMethod) => {
	    FetchMock$3[methodName] = function (response, options) {
	      return this[underlyingMethod]({}, response, options);
	    };
	  };
	  defineShorthand("sticky", "mock", {
	    sticky: true
	  });
	  defineShorthand("once", "mock", {
	    repeat: 1
	  });
	  defineGreedyShorthand("any", "mock");
	  defineGreedyShorthand("anyOnce", "once");
	  ["get", "post", "put", "delete", "head", "patch"].forEach(method => {
	    defineShorthand(method, "mock", {
	      method
	    });
	    defineShorthand(`${method}Once`, "once", {
	      method
	    });
	    defineGreedyShorthand(`${method}Any`, method);
	    defineGreedyShorthand(`${method}AnyOnce`, `${method}Once`);
	  });
	  const getRouteRemover = ({sticky: removeStickyRoutes}) => routes => removeStickyRoutes ? [] : routes.filter(({sticky}) => sticky);
	  FetchMock$3.resetBehavior = function (options = {}) {
	    const removeRoutes = getRouteRemover(options);
	    this.routes = removeRoutes(this.routes);
	    this._uncompiledRoutes = removeRoutes(this._uncompiledRoutes);
	    if (this.realFetch && !this.routes.length) {
	      globalThis.fetch = this.realFetch;
	      this.realFetch = undefined;
	    }
	    this.fallbackResponse = undefined;
	    return this;
	  };
	  FetchMock$3.resetHistory = function () {
	    this._calls = [];
	    this._holdingPromises = [];
	    this.routes.forEach(route => route.reset && route.reset());
	    return this;
	  };
	  FetchMock$3.restore = FetchMock$3.reset = function (options) {
	    this.resetBehavior(options);
	    this.resetHistory();
	    return this;
	  };
	  const responseConfigProps = ["body", "headers", "throws", "status", "redirectUrl"];
	  class ResponseBuilder {
	    constructor(options) {
	      Object.assign(this, options);
	    }
	    exec() {
	      this.normalizeResponseConfig();
	      this.constructFetchOpts();
	      this.constructResponseBody();
	      const realResponse = new this.fetchMock.config.Response(this.body, this.options);
	      const proxyResponse = this.buildObservableResponse(realResponse);
	      return [realResponse, proxyResponse];
	    }
	    sendAsObject() {
	      if (responseConfigProps.some(prop => this.responseConfig[prop])) {
	        if (Object.keys(this.responseConfig).every(key => responseConfigProps.includes(key))) {
	          return false;
	        }
	        return true;
	      }
	      return true;
	    }
	    normalizeResponseConfig() {
	      if (typeof this.responseConfig === "number") {
	        this.responseConfig = {
	          status: this.responseConfig
	        };
	      } else if (typeof this.responseConfig === "string" || this.sendAsObject()) {
	        this.responseConfig = {
	          body: this.responseConfig
	        };
	      }
	    }
	    validateStatus(status) {
	      if (!status) {
	        return 200;
	      }
	      if (typeof status === "number" && parseInt(status, 10) !== status && status >= 200 || status < 600) {
	        return status;
	      }
	      throw new TypeError(`fetch-mock: Invalid status ${status} passed on response object.
To respond with a JSON object that has status as a property assign the object to body
e.g. {"body": {"status: "registered"}}`);
	    }
	    constructFetchOpts() {
	      this.options = this.responseConfig.options || ({});
	      this.options.url = this.responseConfig.redirectUrl || this.url;
	      this.options.status = this.validateStatus(this.responseConfig.status);
	      this.options.statusText = this.fetchMock.statusTextMap[String(this.options.status)];
	      this.options.headers = new this.fetchMock.config.Headers(this.responseConfig.headers || ({}));
	    }
	    getOption(name) {
	      return this.fetchMock.getOption(name, this.route);
	    }
	    convertToJson() {
	      if (this.getOption("sendAsJson") && this.responseConfig.body != null && typeof this.body === "object") {
	        this.body = JSON.stringify(this.body);
	        if (!this.options.headers.has("Content-Type")) {
	          this.options.headers.set("Content-Type", "application/json");
	        }
	      }
	    }
	    setContentLength() {
	      if (this.getOption("includeContentLength") && typeof this.body === "string" && !this.options.headers.has("Content-Length")) {
	        this.options.headers.set("Content-Length", this.body.length.toString());
	      }
	    }
	    constructResponseBody() {
	      this.body = this.responseConfig.body;
	      this.convertToJson();
	      this.setContentLength();
	    }
	    buildObservableResponse(response) {
	      const {fetchMock} = this;
	      response._fmResults = {};
	      return new Proxy(response, {
	        get: (originalResponse, name) => {
	          if (this.responseConfig.redirectUrl) {
	            if (name === "url") {
	              return this.responseConfig.redirectUrl;
	            }
	            if (name === "redirected") {
	              return true;
	            }
	          }
	          if (typeof originalResponse[name] === "function") {
	            return new Proxy(originalResponse[name], {
	              apply: (func, thisArg, args) => {
	                const result = func.apply(response, args);
	                if (result.then) {
	                  fetchMock._holdingPromises.push(result.catch(() => null));
	                  originalResponse._fmResults[name] = result;
	                }
	                return result;
	              }
	            });
	          }
	          return originalResponse[name];
	        }
	      });
	    }
	  }
	  var responseBuilder = options => new ResponseBuilder(options).exec();
	  const absoluteUrlRX = new RegExp("^[a-z]+://|^data:", "i");
	  const protocolRelativeUrlRX = new RegExp("^//", "i");
	  const headersToArray = headers => {
	    if (typeof headers.raw === "function") {
	      return Object.entries(headers.raw());
	    }
	    if (headers[Symbol.iterator]) {
	      return [...headers];
	    }
	    return Object.entries(headers);
	  };
	  const zipObject = entries => entries.reduce((obj, [key, val]) => Object.assign(obj, {
	    [key]: val
	  }), {});
	  function normalizeUrl(url) {
	    if (typeof url === "function" || url instanceof RegExp || (/^(begin|end|glob|express|path):/).test(url)) {
	      return url;
	    }
	    if (absoluteUrlRX.test(url)) {
	      const u = new URL(url);
	      return u.href;
	    }
	    if (protocolRelativeUrlRX.test(url)) {
	      const u = new URL(url, "http://dummy");
	      return u.href;
	    }
	    const u = new URL(url, "http://dummy");
	    return u.pathname + u.search;
	  }
	  function normalizeRequest(url, options, Request) {
	    if (Request.prototype.isPrototypeOf(url)) {
	      const derivedOptions = {
	        method: url.method
	      };
	      try {
	        derivedOptions.body = url.clone().text();
	      } catch {}
	      const normalizedRequestObject = {
	        url: normalizeUrl(url.url),
	        options: Object.assign(derivedOptions, options),
	        request: url,
	        signal: options && options.signal || url.signal
	      };
	      const headers = headersToArray(url.headers);
	      if (headers.length) {
	        normalizedRequestObject.options.headers = zipObject(headers);
	      }
	      return normalizedRequestObject;
	    }
	    if (typeof url === "string" || url instanceof String || typeof url === "object" && ("href" in url)) {
	      return {
	        url: normalizeUrl(url),
	        options,
	        signal: options && options.signal
	      };
	    }
	    if (typeof url === "object") {
	      throw new TypeError("fetch-mock: Unrecognised Request object. Read the Config and Installation sections of the docs");
	    } else {
	      throw new TypeError("fetch-mock: Invalid arguments passed to fetch");
	    }
	  }
	  function getPath(url) {
	    const u = absoluteUrlRX.test(url) ? new URL(url) : new URL(url, "http://dummy");
	    return u.pathname;
	  }
	  function getQuery(url) {
	    const u = absoluteUrlRX.test(url) ? new URL(url) : new URL(url, "http://dummy");
	    return u.search ? u.search.substr(1) : "";
	  }
	  const headers = {
	    normalize: headers => zipObject(headersToArray(headers)),
	    toLowerCase: headers => Object.keys(headers).reduce((obj, k) => {
	      obj[k.toLowerCase()] = headers[k];
	      return obj;
	    }, {}),
	    equal: (actualHeader, expectedHeader) => {
	      actualHeader = Array.isArray(actualHeader) ? actualHeader : [actualHeader];
	      expectedHeader = Array.isArray(expectedHeader) ? expectedHeader : [expectedHeader];
	      if (actualHeader.length !== expectedHeader.length) {
	        return false;
	      }
	      return actualHeader.every((val, i) => val === expectedHeader[i]);
	    }
	  };
	  const FetchMock$2 = {};
	  const resolve = async ({response, responseIsFetch = false}, url, options, request) => {
	    while (true) {
	      if (typeof response === "function") {
	        if (responseIsFetch) {
	          if (request) {
	            return response(request);
	          }
	          return response(url, options);
	        }
	        response = response(url, options, request);
	      } else if (typeof response.then === "function") {
	        response = await response;
	      } else {
	        return response;
	      }
	    }
	  };
	  FetchMock$2.needsAsyncBodyExtraction = function ({request}) {
	    return request && this.routes.some(({usesBody}) => usesBody);
	  };
	  FetchMock$2.fetchHandler = function (url, options) {
	    const normalizedRequest = normalizeRequest(url, options, this.config.Request);
	    if (this.needsAsyncBodyExtraction(normalizedRequest)) {
	      return this._extractBodyThenHandle(normalizedRequest);
	    }
	    return this._fetchHandler(normalizedRequest);
	  };
	  FetchMock$2._extractBodyThenHandle = async function (normalizedRequest) {
	    normalizedRequest.options.body = await normalizedRequest.options.body;
	    return this._fetchHandler(normalizedRequest);
	  };
	  FetchMock$2._fetchHandler = function ({url, options, request, signal}) {
	    const {route, callLog} = this.executeRouter(url, options, request);
	    this.recordCall(callLog);
	    let done;
	    this._holdingPromises.push(new Promise(res => {
	      done = res;
	    }));
	    return new Promise((res, rej) => {
	      if (signal) {
	        const abort = () => {
	          rej(new DOMException("The operation was aborted.", "AbortError"));
	          done();
	        };
	        if (signal.aborted) {
	          abort();
	        }
	        signal.addEventListener("abort", abort);
	      }
	      this.generateResponse({
	        route,
	        url,
	        options,
	        request,
	        callLog
	      }).then(res, rej).then(done, done);
	    });
	  };
	  FetchMock$2.fetchHandler.isMock = true;
	  FetchMock$2.executeRouter = function (url, options, request) {
	    const callLog = {
	      url,
	      options,
	      request,
	      isUnmatched: true
	    };
	    if (this.getOption("fallbackToNetwork") === "always") {
	      return {
	        route: {
	          response: this.getNativeFetch(),
	          responseIsFetch: true
	        }
	      };
	    }
	    const route = this.router(url, options, request);
	    if (route) {
	      return {
	        route,
	        callLog: {
	          url,
	          options,
	          request,
	          identifier: route.identifier
	        }
	      };
	    }
	    if (this.getOption("warnOnFallback")) {
	      console.warn(`Unmatched ${options && options.method || "GET"} to ${url}`);
	    }
	    if (this.fallbackResponse) {
	      return {
	        route: {
	          response: this.fallbackResponse
	        },
	        callLog
	      };
	    }
	    if (!this.getOption("fallbackToNetwork")) {
	      throw new Error(`fetch-mock: No fallback response defined for ${options && options.method || "GET"} to ${url}`);
	    }
	    return {
	      route: {
	        response: this.getNativeFetch(),
	        responseIsFetch: true
	      },
	      callLog
	    };
	  };
	  FetchMock$2.generateResponse = async function ({route, url, options, request, callLog = {}}) {
	    const response = await resolve(route, url, options, request);
	    if (response.throws && typeof response !== "function") {
	      throw response.throws;
	    }
	    if (this.config.Response.prototype.isPrototypeOf(response)) {
	      callLog.response = response;
	      return response;
	    }
	    const [realResponse, finalResponse] = responseBuilder({
	      url,
	      responseConfig: response,
	      fetchMock: this,
	      route
	    });
	    callLog.response = realResponse;
	    return finalResponse;
	  };
	  FetchMock$2.router = function (url, options, request) {
	    const route = this.routes.find(route => {
	      return route.matcher(url, options, request);
	    });
	    if (route) {
	      return route;
	    }
	  };
	  FetchMock$2.getNativeFetch = function () {
	    const func = this.realFetch || this.isSandbox && this.config.fetch;
	    if (!func) {
	      throw new Error("fetch-mock: Falling back to network only available on global fetch-mock, or by setting config.fetch on sandboxed fetch-mock");
	    }
	    return func;
	  };
	  FetchMock$2.recordCall = function (obj) {
	    if (obj) {
	      this._calls.push(obj);
	    }
	  };
	  function getDefaultExportFromCjs(x) {
	    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
	  }
	  var globToRegexp = function (glob, opts) {
	    if (typeof glob !== "string") {
	      throw new TypeError("Expected a string");
	    }
	    var str = String(glob);
	    var reStr = "";
	    var extended = opts ? !!opts.extended : false;
	    var globstar = opts ? !!opts.globstar : false;
	    var inGroup = false;
	    var flags = opts && typeof opts.flags === "string" ? opts.flags : "";
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
	          var prevChar = str[i - 1];
	          var starCount = 1;
	          while (str[i + 1] === "*") {
	            starCount++;
	            i++;
	          }
	          var nextChar = str[i + 1];
	          if (!globstar) {
	            reStr += ".*";
	          } else {
	            var isGlobstar = starCount > 1 && (prevChar === "/" || prevChar === undefined) && (nextChar === "/" || nextChar === undefined);
	            if (isGlobstar) {
	              reStr += "((?:[^/]*(?:/|$))*)";
	              i++;
	            } else {
	              reStr += "([^/]*)";
	            }
	          }
	          break;
	        default:
	          reStr += c;
	      }
	    }
	    if (!flags || !~flags.indexOf("g")) {
	      reStr = "^" + reStr + "$";
	    }
	    return new RegExp(reStr, flags);
	  };
	  var glob = getDefaultExportFromCjs(globToRegexp);
	  function parse(input, loose) {
	    if (input instanceof RegExp) return {
	      keys: false,
	      pattern: input
	    };
	    var c, o, tmp, ext, keys = [], pattern = "", arr = input.split("/");
	    arr[0] || arr.shift();
	    while (tmp = arr.shift()) {
	      c = tmp[0];
	      if (c === "*") {
	        keys.push(c);
	        pattern += tmp[1] === "?" ? "(?:/(.*))?" : "/(.*)";
	      } else if (c === ":") {
	        o = tmp.indexOf("?", 1);
	        ext = tmp.indexOf(".", 1);
	        keys.push(tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length));
	        pattern += !!~o && !~ext ? "(?:/([^/]+?))?" : "/([^/]+?)";
	        if (!!~ext) pattern += (!!~o ? "?" : "") + "\\" + tmp.substring(ext);
	      } else {
	        pattern += "/" + tmp;
	      }
	    }
	    return {
	      keys: keys,
	      pattern: new RegExp("^" + pattern + "/?$", "i")
	    };
	  }
	  var isSubset$1 = {
	    exports: {}
	  };
	  (function (module, exports) {
	    Object.defineProperty(exports, "__esModule", {
	      value: true
	    });
	    var isSubset = (function (_isSubset) {
	      function isSubset(_x, _x2) {
	        return _isSubset.apply(this, arguments);
	      }
	      isSubset.toString = function () {
	        return _isSubset.toString();
	      };
	      return isSubset;
	    })(function (superset, subset) {
	      if (typeof superset !== "object" || superset === null || (typeof subset !== "object" || subset === null)) return false;
	      return Object.keys(subset).every(function (key) {
	        if (!superset.propertyIsEnumerable(key)) return false;
	        var subsetItem = subset[key];
	        var supersetItem = superset[key];
	        if (typeof subsetItem === "object" && subsetItem !== null ? !isSubset(supersetItem, subsetItem) : supersetItem !== subsetItem) return false;
	        return true;
	      });
	    });
	    exports["default"] = isSubset;
	    module.exports = exports["default"];
	  })(isSubset$1, isSubset$1.exports);
	  var isSubsetExports = isSubset$1.exports;
	  var isSubset = getDefaultExportFromCjs(isSubsetExports);
	  var has = Object.prototype.hasOwnProperty;
	  function find(iter, tar, key) {
	    for (key of iter.keys()) {
	      if (dequal(key, tar)) return key;
	    }
	  }
	  function dequal(foo, bar) {
	    var ctor, len, tmp;
	    if (foo === bar) return true;
	    if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
	      if (ctor === Date) return foo.getTime() === bar.getTime();
	      if (ctor === RegExp) return foo.toString() === bar.toString();
	      if (ctor === Array) {
	        if ((len = foo.length) === bar.length) {
	          while (len-- && dequal(foo[len], bar[len])) ;
	        }
	        return len === -1;
	      }
	      if (ctor === Set) {
	        if (foo.size !== bar.size) {
	          return false;
	        }
	        for (len of foo) {
	          tmp = len;
	          if (tmp && typeof tmp === "object") {
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
	          if (tmp && typeof tmp === "object") {
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
	        if ((len = foo.byteLength) === bar.byteLength) {
	          while (len-- && foo.getInt8(len) === bar.getInt8(len)) ;
	        }
	        return len === -1;
	      }
	      if (ArrayBuffer.isView(foo)) {
	        if ((len = foo.byteLength) === bar.byteLength) {
	          while (len-- && foo[len] === bar[len]) ;
	        }
	        return len === -1;
	      }
	      if (!ctor || typeof foo === "object") {
	        len = 0;
	        for (ctor in foo) {
	          if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
	          if (!((ctor in bar)) || !dequal(foo[ctor], bar[ctor])) return false;
	        }
	        return Object.keys(bar).length === len;
	      }
	    }
	    return foo !== foo && bar !== bar;
	  }
	  const debuggableUrlFunc = func => url => {
	    return func(url);
	  };
	  const stringMatchers = {
	    begin: targetString => debuggableUrlFunc(url => url.indexOf(targetString) === 0),
	    end: targetString => debuggableUrlFunc(url => url.substr(-targetString.length) === targetString),
	    glob: targetString => {
	      const urlRX = glob(targetString);
	      return debuggableUrlFunc(url => urlRX.test(url));
	    },
	    express: targetString => {
	      const urlRX = parse(targetString);
	      return debuggableUrlFunc(url => urlRX.pattern.test(getPath(url)));
	    },
	    path: targetString => debuggableUrlFunc(url => getPath(url) === targetString)
	  };
	  const getHeaderMatcher = ({headers: expectedHeaders}) => {
	    if (!expectedHeaders) {
	      return;
	    }
	    const expectation = headers.toLowerCase(expectedHeaders);
	    return (url, {headers: headers$1 = {}}) => {
	      const lowerCaseHeaders = headers.toLowerCase(headers.normalize(headers$1));
	      return Object.keys(expectation).every(headerName => headers.equal(lowerCaseHeaders[headerName], expectation[headerName]));
	    };
	  };
	  const getMethodMatcher = ({method: expectedMethod}) => {
	    if (!expectedMethod) {
	      return;
	    }
	    return (url, {method}) => {
	      const actualMethod = method ? method.toLowerCase() : "get";
	      return expectedMethod === actualMethod;
	    };
	  };
	  const getQueryStringMatcher = ({query: passedQuery}) => {
	    if (!passedQuery) {
	      return;
	    }
	    const expectedQuery = new URLSearchParams();
	    for (const [key, value] of Object.entries(passedQuery)) {
	      if (Array.isArray(value)) {
	        for (const item of value) {
	          expectedQuery.append(key, typeof item === "object" || typeof item === "undefined" ? "" : item.toString());
	        }
	      } else {
	        expectedQuery.append(key, typeof value === "object" || typeof value === "undefined" ? "" : value.toString());
	      }
	    }
	    const keys = Array.from(expectedQuery.keys());
	    return url => {
	      const queryString = getQuery(url);
	      const query = new URLSearchParams(queryString);
	      return keys.every(key => {
	        const expectedValues = expectedQuery.getAll(key).sort();
	        const actualValues = query.getAll(key).sort();
	        if (expectedValues.length !== actualValues.length) {
	          return false;
	        }
	        if (Array.isArray(passedQuery[key])) {
	          return expectedValues.every((expected, index) => expected === actualValues[index]);
	        }
	        return dequal(actualValues, expectedValues);
	      });
	    };
	  };
	  const getParamsMatcher = ({params: expectedParams, url: matcherUrl}) => {
	    if (!expectedParams) {
	      return;
	    }
	    if (!(/express:/).test(matcherUrl)) {
	      throw new Error("fetch-mock: matching on params is only possible when using an express: matcher");
	    }
	    const expectedKeys = Object.keys(expectedParams);
	    const re = parse(matcherUrl.replace(/^express:/, ""));
	    return url => {
	      const vals = re.pattern.exec(getPath(url)) || [];
	      vals.shift();
	      const params = re.keys.reduce((map, paramName, i) => vals[i] ? Object.assign(map, {
	        [paramName]: vals[i]
	      }) : map, {});
	      return expectedKeys.every(key => params[key] === expectedParams[key]);
	    };
	  };
	  const getBodyMatcher = (route, fetchMock) => {
	    const matchPartialBody = fetchMock.getOption("matchPartialBody", route);
	    const {body: expectedBody} = route;
	    return (url, {body, method = "get"}) => {
	      if (method.toLowerCase() === "get") {
	        return true;
	      }
	      let sentBody;
	      try {
	        sentBody = JSON.parse(body);
	      } catch {}
	      return sentBody && (matchPartialBody ? isSubset(sentBody, expectedBody) : dequal(sentBody, expectedBody));
	    };
	  };
	  const getFullUrlMatcher = (route, matcherUrl, query) => {
	    const expectedUrl = normalizeUrl(matcherUrl);
	    if (route.identifier === matcherUrl) {
	      route.identifier = expectedUrl;
	    }
	    return matcherUrl => {
	      if (query && expectedUrl.indexOf("?")) {
	        return matcherUrl.indexOf(expectedUrl) === 0;
	      }
	      return normalizeUrl(matcherUrl) === expectedUrl;
	    };
	  };
	  const getFunctionMatcher = ({functionMatcher}) => {
	    return (...args) => {
	      return functionMatcher(...args);
	    };
	  };
	  const getUrlMatcher = route => {
	    const {url: matcherUrl, query} = route;
	    if (matcherUrl === "*") {
	      return () => true;
	    }
	    if (matcherUrl instanceof RegExp) {
	      return url => matcherUrl.test(url);
	    }
	    if (matcherUrl.href) {
	      return getFullUrlMatcher(route, matcherUrl.href, query);
	    }
	    for (const shorthand in stringMatchers) {
	      if (matcherUrl.indexOf(`${shorthand}:`) === 0) {
	        const urlFragment = matcherUrl.replace(new RegExp(`^${shorthand}:`), "");
	        return stringMatchers[shorthand](urlFragment);
	      }
	    }
	    return getFullUrlMatcher(route, matcherUrl, query);
	  };
	  var builtInMatchers = [{
	    name: "query",
	    matcher: getQueryStringMatcher
	  }, {
	    name: "method",
	    matcher: getMethodMatcher
	  }, {
	    name: "headers",
	    matcher: getHeaderMatcher
	  }, {
	    name: "params",
	    matcher: getParamsMatcher
	  }, {
	    name: "body",
	    matcher: getBodyMatcher,
	    usesBody: true
	  }, {
	    name: "functionMatcher",
	    matcher: getFunctionMatcher
	  }, {
	    name: "url",
	    matcher: getUrlMatcher
	  }];
	  const isUrlMatcher = matcher => matcher instanceof RegExp || typeof matcher === "string" || typeof matcher === "object" && ("href" in matcher);
	  const isFunctionMatcher = matcher => typeof matcher === "function";
	  const nameToOptions = options => typeof options === "string" ? {
	    name: options
	  } : options;
	  class Route {
	    constructor(args, fetchMock) {
	      this.fetchMock = fetchMock;
	      this.init(args);
	      this.sanitize();
	      this.validate();
	      this.generateMatcher();
	      this.limit();
	      this.delayResponse();
	    }
	    validate() {
	      if (!(("response" in this))) {
	        throw new Error("fetch-mock: Each route must define a response");
	      }
	      if (!Route.registeredMatchers.some(({name}) => (name in this))) {
	        throw new Error("fetch-mock: Each route must specify some criteria for matching calls to fetch. To match all calls use '*'");
	      }
	    }
	    init(args) {
	      const [matcher, response, nameOrOptions = {}] = args;
	      const routeConfig = {};
	      if (isUrlMatcher(matcher) || isFunctionMatcher(matcher)) {
	        routeConfig.matcher = matcher;
	      } else {
	        Object.assign(routeConfig, matcher);
	      }
	      if (typeof response !== "undefined") {
	        routeConfig.response = response;
	      }
	      if (nameOrOptions) {
	        Object.assign(routeConfig, typeof nameOrOptions === "string" ? nameToOptions(nameOrOptions) : nameOrOptions);
	      }
	      Object.assign(this, routeConfig);
	    }
	    sanitize() {
	      if (this.method) {
	        this.method = this.method.toLowerCase();
	      }
	      if (isUrlMatcher(this.matcher)) {
	        this.url = this.matcher;
	        delete this.matcher;
	      }
	      this.functionMatcher = this.matcher || this.functionMatcher;
	      this.identifier = this.name || this.url || this.functionMatcher;
	    }
	    generateMatcher() {
	      const activeMatchers = Route.registeredMatchers.map(({name, matcher, usesBody}) => this[name] && ({
	        matcher: matcher(this, this.fetchMock),
	        usesBody
	      })).filter(matcher => Boolean(matcher));
	      this.usesBody = activeMatchers.some(({usesBody}) => usesBody);
	      this.matcher = (url, options = {}, request) => activeMatchers.every(({matcher}) => matcher(url, options, request));
	    }
	    limit() {
	      if (!this.repeat) {
	        return;
	      }
	      const {matcher} = this;
	      let timesLeft = this.repeat;
	      this.matcher = (url, options) => {
	        const match = timesLeft && matcher(url, options);
	        if (match) {
	          timesLeft--;
	          return true;
	        }
	      };
	      this.reset = () => {
	        timesLeft = this.repeat;
	      };
	    }
	    delayResponse() {
	      if (this.delay) {
	        const {response} = this;
	        this.response = () => {
	          return new Promise(res => setTimeout(() => res(response), this.delay));
	        };
	      }
	    }
	    static addMatcher(matcher) {
	      Route.registeredMatchers.push(matcher);
	    }
	  }
	  Route.registeredMatchers = [];
	  builtInMatchers.forEach(Route.addMatcher);
	  const FetchMock$1 = {};
	  const isName = nameOrMatcher => typeof nameOrMatcher === "string" && (/^[\da-zA-Z-]+$/).test(nameOrMatcher);
	  const filterCallsWithMatcher = function (matcher, options = {}, calls) {
	    ({matcher} = new Route([{
	      matcher,
	      response: "ok",
	      ...options
	    }], this));
	    return calls.filter(({url, options}) => matcher(normalizeUrl(url), options));
	  };
	  const formatDebug = func => function (...args) {
	    const result = func.call(this, ...args);
	    return result;
	  };
	  const callObjToArray = obj => {
	    if (!obj) {
	      return undefined;
	    }
	    const {url, options, request, identifier, isUnmatched, response} = obj;
	    const arr = [url, options];
	    arr.request = request;
	    arr.identifier = identifier;
	    arr.isUnmatched = isUnmatched;
	    arr.response = response;
	    return arr;
	  };
	  FetchMock$1.filterCalls = function (nameOrMatcher, options) {
	    let calls = this._calls;
	    let matcher = "*";
	    if ([true, "matched"].includes(nameOrMatcher)) {
	      calls = calls.filter(({isUnmatched}) => !isUnmatched);
	    } else if ([false, "unmatched"].includes(nameOrMatcher)) {
	      calls = calls.filter(({isUnmatched}) => isUnmatched);
	    } else if (isName(nameOrMatcher)) {
	      calls = calls.filter(({identifier}) => identifier === nameOrMatcher);
	    } else if (typeof nameOrMatcher !== "undefined") {
	      matcher = nameOrMatcher === "*" ? "*" : normalizeUrl(nameOrMatcher);
	      if (this.routes.some(({identifier}) => identifier === matcher)) {
	        calls = calls.filter(call => call.identifier === matcher);
	      }
	    }
	    if ((options || matcher !== "*") && calls.length) {
	      if (typeof options === "string") {
	        options = {
	          method: options
	        };
	      }
	      calls = filterCallsWithMatcher.call(this, matcher, options, calls);
	    }
	    return calls.map(callObjToArray);
	  };
	  FetchMock$1.calls = formatDebug(function (nameOrMatcher, options) {
	    return this.filterCalls(nameOrMatcher, options);
	  });
	  FetchMock$1.lastCall = formatDebug(function (nameOrMatcher, options) {
	    return [...this.filterCalls(nameOrMatcher, options)].pop();
	  });
	  FetchMock$1.lastUrl = formatDebug(function (nameOrMatcher, options) {
	    return (this.lastCall(nameOrMatcher, options) || [])[0];
	  });
	  FetchMock$1.lastOptions = formatDebug(function (nameOrMatcher, options) {
	    return (this.lastCall(nameOrMatcher, options) || [])[1];
	  });
	  FetchMock$1.lastResponse = formatDebug(function (nameOrMatcher, options) {
	    const {response} = this.lastCall(nameOrMatcher, options) || [];
	    try {
	      const clonedResponse = response.clone();
	      return clonedResponse;
	    } catch {
	      Object.entries(response._fmResults).forEach(([name, result]) => {
	        response[name] = () => result;
	      });
	      return response;
	    }
	  });
	  FetchMock$1.called = formatDebug(function (nameOrMatcher, options) {
	    return Boolean(this.filterCalls(nameOrMatcher, options).length);
	  });
	  FetchMock$1.flush = formatDebug(async function (waitForResponseMethods) {
	    const queuedPromises = this._holdingPromises;
	    this._holdingPromises = [];
	    await Promise.all(queuedPromises);
	    if (waitForResponseMethods && this._holdingPromises.length) {
	      await this.flush(waitForResponseMethods);
	    }
	  });
	  FetchMock$1.done = formatDebug(function (nameOrMatcher) {
	    let routesToCheck;
	    if (nameOrMatcher && typeof nameOrMatcher !== "boolean") {
	      routesToCheck = [{
	        identifier: nameOrMatcher
	      }];
	    } else {
	      routesToCheck = this.routes;
	    }
	    const result = routesToCheck.map(({identifier}) => {
	      if (!this.called(identifier)) {
	        console.warn(`Warning: ${identifier} not called`);
	        return false;
	      }
	      const expectedTimes = (this.routes.find(r => r.identifier === identifier) || ({})).repeat;
	      if (!expectedTimes) {
	        return true;
	      }
	      const actualTimes = this.filterCalls(identifier).length;
	      if (expectedTimes > actualTimes) {
	        console.warn(`Warning: ${identifier} only called ${actualTimes} times, but ${expectedTimes} expected`);
	        return false;
	      }
	      return true;
	    }).every(isDone => isDone);
	    return result;
	  });
	  const FetchMock = {
	    ...FetchMock$2,
	    ...FetchMock$3,
	    ...FetchMock$1
	  };
	  FetchMock.addMatcher = function (matcher) {
	    Route.addMatcher(matcher);
	  };
	  FetchMock.config = {
	    fallbackToNetwork: false,
	    includeContentLength: true,
	    sendAsJson: true,
	    warnOnFallback: true,
	    overwriteRoutes: undefined
	  };
	  FetchMock.createInstance = function () {
	    const instance = Object.create(FetchMock);
	    instance._uncompiledRoutes = (this._uncompiledRoutes || []).slice();
	    instance.routes = instance._uncompiledRoutes.map(config => this.compileRoute(config));
	    instance.fallbackResponse = this.fallbackResponse || undefined;
	    instance.config = {
	      ...this.config || FetchMock.config
	    };
	    instance._calls = [];
	    instance._holdingPromises = [];
	    instance.bindMethods();
	    return instance;
	  };
	  FetchMock.compileRoute = function (config) {
	    return new Route(config, this);
	  };
	  FetchMock.bindMethods = function () {
	    this.fetchHandler = FetchMock.fetchHandler.bind(this);
	    this.reset = this.restore = FetchMock.reset.bind(this);
	    this.resetHistory = FetchMock.resetHistory.bind(this);
	    this.resetBehavior = FetchMock.resetBehavior.bind(this);
	  };
	  FetchMock.sandbox = function () {
	    const fetchMockProxy = (url, options) => sandbox.fetchHandler(url, options);
	    const sandbox = Object.assign(fetchMockProxy, FetchMock, this.createInstance(), {
	      Headers: this.config.Headers,
	      Request: this.config.Request,
	      Response: this.config.Response
	    });
	    sandbox.bindMethods();
	    sandbox.isSandbox = true;
	    sandbox.default = sandbox;
	    return sandbox;
	  };
	  FetchMock.getOption = function (name, route = {}) {
	    return (name in route) ? route[name] : this.config[name];
	  };
	  const statusTextMap = {
	    100: "Continue",
	    101: "Switching Protocols",
	    102: "Processing",
	    200: "OK",
	    201: "Created",
	    202: "Accepted",
	    203: "Non-Authoritative Information",
	    204: "No Content",
	    205: "Reset Content",
	    206: "Partial Content",
	    207: "Multi-Status",
	    208: "Already Reported",
	    226: "IM Used",
	    300: "Multiple Choices",
	    301: "Moved Permanently",
	    302: "Found",
	    303: "See Other",
	    304: "Not Modified",
	    305: "Use Proxy",
	    307: "Temporary Redirect",
	    308: "Permanent Redirect",
	    400: "Bad Request",
	    401: "Unauthorized",
	    402: "Payment Required",
	    403: "Forbidden",
	    404: "Not Found",
	    405: "Method Not Allowed",
	    406: "Not Acceptable",
	    407: "Proxy Authentication Required",
	    408: "Request Timeout",
	    409: "Conflict",
	    410: "Gone",
	    411: "Length Required",
	    412: "Precondition Failed",
	    413: "Payload Too Large",
	    414: "URI Too Long",
	    415: "Unsupported Media Type",
	    416: "Range Not Satisfiable",
	    417: "Expectation Failed",
	    418: "I'm a teapot",
	    421: "Misdirected Request",
	    422: "Unprocessable Entity",
	    423: "Locked",
	    424: "Failed Dependency",
	    425: "Unordered Collection",
	    426: "Upgrade Required",
	    428: "Precondition Required",
	    429: "Too Many Requests",
	    431: "Request Header Fields Too Large",
	    451: "Unavailable For Legal Reasons",
	    500: "Internal Server Error",
	    501: "Not Implemented",
	    502: "Bad Gateway",
	    503: "Service Unavailable",
	    504: "Gateway Timeout",
	    505: "HTTP Version Not Supported",
	    506: "Variant Also Negotiates",
	    507: "Insufficient Storage",
	    508: "Loop Detected",
	    509: "Bandwidth Limit Exceeded",
	    510: "Not Extended",
	    511: "Network Authentication Required"
	  };
	  FetchMock.statusTextMap = statusTextMap;
	  FetchMock.config = Object.assign(FetchMock.config, {
	    Request: globalThis.Request,
	    Response: globalThis.Response,
	    Headers: globalThis.Headers,
	    fetch: globalThis.fetch
	  });
	  var index = FetchMock.createInstance();
	  exports.default = index;
	})(cjs);

	let exp = cjs?.default || cjs || { __emptyModule: true };try { Object.defineProperty(exp, "__" + "esModule", { value: true }); exp.default = exp; } catch (ex) {}

	return exp;

}));
