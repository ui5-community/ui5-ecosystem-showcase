sap.ui.define(['exports'], (function (exports) { 'use strict';

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

  var global$1 = (typeof global !== "undefined" ? global :
    typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window : {});

  var version$4 = ''; // empty string to avoid regexp issues
  var versions = {};

  // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
  var performance = global$1.performance || {};
  performance.now        ||
    performance.mozNow     ||
    performance.msNow      ||
    performance.oNow       ||
    performance.webkitNow  ||
    function(){ return (new Date()).getTime() };

  var browser$1 = {
    version: version$4,
    versions: versions};

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  /* global Reflect, Promise, SuppressedError, Symbol, Iterator */

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
    };
    return __assign.apply(this, arguments);
  };

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
  }
  function __runInitializers(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
  }
  function __propKey(x) {
    return typeof x === "symbol" ? x : "".concat(x);
  }
  function __setFunctionName(f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
  }
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

  /** @deprecated */
  function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
  }

  /** @deprecated */
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
  }
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

  var tslib_es6 = {
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
  };

  var tslib_es6$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    __addDisposableResource: __addDisposableResource,
    get __assign () { return __assign; },
    __asyncDelegator: __asyncDelegator,
    __asyncGenerator: __asyncGenerator,
    __asyncValues: __asyncValues,
    __await: __await,
    __awaiter: __awaiter,
    __classPrivateFieldGet: __classPrivateFieldGet,
    __classPrivateFieldIn: __classPrivateFieldIn,
    __classPrivateFieldSet: __classPrivateFieldSet,
    __createBinding: __createBinding,
    __decorate: __decorate,
    __disposeResources: __disposeResources,
    __esDecorate: __esDecorate,
    __exportStar: __exportStar,
    __extends: __extends,
    __generator: __generator,
    __importDefault: __importDefault,
    __importStar: __importStar,
    __makeTemplateObject: __makeTemplateObject,
    __metadata: __metadata,
    __param: __param,
    __propKey: __propKey,
    __read: __read,
    __rest: __rest,
    __rewriteRelativeImportExtension: __rewriteRelativeImportExtension,
    __runInitializers: __runInitializers,
    __setFunctionName: __setFunctionName,
    __spread: __spread,
    __spreadArray: __spreadArray,
    __spreadArrays: __spreadArrays,
    __values: __values,
    default: tslib_es6
  });

  const resolveFetch$4 = (customFetch) => {
      if (customFetch) {
          return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
  };

  /**
   * Base error for Supabase Edge Function invocations.
   *
   * @example
   * ```ts
   * import { FunctionsError } from '@supabase/functions-js'
   *
   * throw new FunctionsError('Unexpected error invoking function', 'FunctionsError', {
   *   requestId: 'abc123',
   * })
   * ```
   */
  class FunctionsError extends Error {
      constructor(message, name = 'FunctionsError', context) {
          super(message);
          this.name = name;
          this.context = context;
      }
  }
  /**
   * Error thrown when the network request to an Edge Function fails.
   *
   * @example
   * ```ts
   * import { FunctionsFetchError } from '@supabase/functions-js'
   *
   * throw new FunctionsFetchError({ requestId: 'abc123' })
   * ```
   */
  class FunctionsFetchError extends FunctionsError {
      constructor(context) {
          super('Failed to send a request to the Edge Function', 'FunctionsFetchError', context);
      }
  }
  /**
   * Error thrown when the Supabase relay cannot reach the Edge Function.
   *
   * @example
   * ```ts
   * import { FunctionsRelayError } from '@supabase/functions-js'
   *
   * throw new FunctionsRelayError({ region: 'us-east-1' })
   * ```
   */
  class FunctionsRelayError extends FunctionsError {
      constructor(context) {
          super('Relay Error invoking the Edge Function', 'FunctionsRelayError', context);
      }
  }
  /**
   * Error thrown when the Edge Function returns a non-2xx status code.
   *
   * @example
   * ```ts
   * import { FunctionsHttpError } from '@supabase/functions-js'
   *
   * throw new FunctionsHttpError({ status: 500 })
   * ```
   */
  class FunctionsHttpError extends FunctionsError {
      constructor(context) {
          super('Edge Function returned a non-2xx status code', 'FunctionsHttpError', context);
      }
  }
  // Define the enum for the 'region' property
  exports.FunctionRegion = void 0;
  (function (FunctionRegion) {
      FunctionRegion["Any"] = "any";
      FunctionRegion["ApNortheast1"] = "ap-northeast-1";
      FunctionRegion["ApNortheast2"] = "ap-northeast-2";
      FunctionRegion["ApSouth1"] = "ap-south-1";
      FunctionRegion["ApSoutheast1"] = "ap-southeast-1";
      FunctionRegion["ApSoutheast2"] = "ap-southeast-2";
      FunctionRegion["CaCentral1"] = "ca-central-1";
      FunctionRegion["EuCentral1"] = "eu-central-1";
      FunctionRegion["EuWest1"] = "eu-west-1";
      FunctionRegion["EuWest2"] = "eu-west-2";
      FunctionRegion["EuWest3"] = "eu-west-3";
      FunctionRegion["SaEast1"] = "sa-east-1";
      FunctionRegion["UsEast1"] = "us-east-1";
      FunctionRegion["UsWest1"] = "us-west-1";
      FunctionRegion["UsWest2"] = "us-west-2";
  })(exports.FunctionRegion || (exports.FunctionRegion = {}));

  /**
   * Client for invoking Supabase Edge Functions.
   */
  class FunctionsClient {
      /**
       * Creates a new Functions client bound to an Edge Functions URL.
       *
       * @example
       * ```ts
       * import { FunctionsClient, FunctionRegion } from '@supabase/functions-js'
       *
       * const functions = new FunctionsClient('https://xyzcompany.supabase.co/functions/v1', {
       *   headers: { apikey: 'public-anon-key' },
       *   region: FunctionRegion.UsEast1,
       * })
       * ```
       */
      constructor(url, { headers = {}, customFetch, region = exports.FunctionRegion.Any, } = {}) {
          this.url = url;
          this.headers = headers;
          this.region = region;
          this.fetch = resolveFetch$4(customFetch);
      }
      /**
       * Updates the authorization header
       * @param token - the new jwt token sent in the authorisation header
       * @example
       * ```ts
       * functions.setAuth(session.access_token)
       * ```
       */
      setAuth(token) {
          this.headers.Authorization = `Bearer ${token}`;
      }
      /**
       * Invokes a function
       * @param functionName - The name of the Function to invoke.
       * @param options - Options for invoking the Function.
       * @example
       * ```ts
       * const { data, error } = await functions.invoke('hello-world', {
       *   body: { name: 'Ada' },
       * })
       * ```
       */
      invoke(functionName_1) {
          return __awaiter(this, arguments, void 0, function* (functionName, options = {}) {
              var _a;
              let timeoutId;
              let timeoutController;
              try {
                  const { headers, method, body: functionArgs, signal, timeout } = options;
                  let _headers = {};
                  let { region } = options;
                  if (!region) {
                      region = this.region;
                  }
                  // Add region as query parameter using URL API
                  const url = new URL(`${this.url}/${functionName}`);
                  if (region && region !== 'any') {
                      _headers['x-region'] = region;
                      url.searchParams.set('forceFunctionRegion', region);
                  }
                  let body;
                  if (functionArgs &&
                      ((headers && !Object.prototype.hasOwnProperty.call(headers, 'Content-Type')) || !headers)) {
                      if ((typeof Blob !== 'undefined' && functionArgs instanceof Blob) ||
                          functionArgs instanceof ArrayBuffer) {
                          // will work for File as File inherits Blob
                          // also works for ArrayBuffer as it is the same underlying structure as a Blob
                          _headers['Content-Type'] = 'application/octet-stream';
                          body = functionArgs;
                      }
                      else if (typeof functionArgs === 'string') {
                          // plain string
                          _headers['Content-Type'] = 'text/plain';
                          body = functionArgs;
                      }
                      else if (typeof FormData !== 'undefined' && functionArgs instanceof FormData) {
                          // don't set content-type headers
                          // Request will automatically add the right boundary value
                          body = functionArgs;
                      }
                      else {
                          // default, assume this is JSON
                          _headers['Content-Type'] = 'application/json';
                          body = JSON.stringify(functionArgs);
                      }
                  }
                  else {
                      // if the Content-Type was supplied, simply set the body
                      body = functionArgs;
                  }
                  // Handle timeout by creating an AbortController
                  let effectiveSignal = signal;
                  if (timeout) {
                      timeoutController = new AbortController();
                      timeoutId = setTimeout(() => timeoutController.abort(), timeout);
                      // If user provided their own signal, we need to respect both
                      if (signal) {
                          effectiveSignal = timeoutController.signal;
                          // If the user's signal is aborted, abort our timeout controller too
                          signal.addEventListener('abort', () => timeoutController.abort());
                      }
                      else {
                          effectiveSignal = timeoutController.signal;
                      }
                  }
                  const response = yield this.fetch(url.toString(), {
                      method: method || 'POST',
                      // headers priority is (high to low):
                      // 1. invoke-level headers
                      // 2. client-level headers
                      // 3. default Content-Type header
                      headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
                      body,
                      signal: effectiveSignal,
                  }).catch((fetchError) => {
                      throw new FunctionsFetchError(fetchError);
                  });
                  const isRelayError = response.headers.get('x-relay-error');
                  if (isRelayError && isRelayError === 'true') {
                      throw new FunctionsRelayError(response);
                  }
                  if (!response.ok) {
                      throw new FunctionsHttpError(response);
                  }
                  let responseType = ((_a = response.headers.get('Content-Type')) !== null && _a !== void 0 ? _a : 'text/plain').split(';')[0].trim();
                  let data;
                  if (responseType === 'application/json') {
                      data = yield response.json();
                  }
                  else if (responseType === 'application/octet-stream' ||
                      responseType === 'application/pdf') {
                      data = yield response.blob();
                  }
                  else if (responseType === 'text/event-stream') {
                      data = response;
                  }
                  else if (responseType === 'multipart/form-data') {
                      data = yield response.formData();
                  }
                  else {
                      // default to text
                      data = yield response.text();
                  }
                  return { data, error: null, response };
              }
              catch (error) {
                  return {
                      data: null,
                      error,
                      response: error instanceof FunctionsHttpError || error instanceof FunctionsRelayError
                          ? error.context
                          : undefined,
                  };
              }
              finally {
                  // Clear the timeout if it was set
                  if (timeoutId) {
                      clearTimeout(timeoutId);
                  }
              }
          });
      }
  }

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

  var cjs = {};

  var require$$0 = /*@__PURE__*/getAugmentedNamespace(tslib_es6$1);

  var PostgrestClient$1 = {};

  var PostgrestQueryBuilder$1 = {};

  var PostgrestFilterBuilder$1 = {};

  var PostgrestTransformBuilder$1 = {};

  var PostgrestBuilder$1 = {};

  var PostgrestError$1 = {};

  var hasRequiredPostgrestError;

  function requirePostgrestError () {
  	if (hasRequiredPostgrestError) return PostgrestError$1;
  	hasRequiredPostgrestError = 1;
  	Object.defineProperty(PostgrestError$1, "__esModule", { value: true });
  	/**
  	 * Error format
  	 *
  	 * {@link https://postgrest.org/en/stable/api.html?highlight=options#errors-and-http-status-codes}
  	 */
  	class PostgrestError extends Error {
  	    /**
  	     * @example
  	     * ```ts
  	     * import PostgrestError from '@supabase/postgrest-js'
  	     *
  	     * throw new PostgrestError({
  	     *   message: 'Row level security prevented the request',
  	     *   details: 'RLS denied the insert',
  	     *   hint: 'Check your policies',
  	     *   code: 'PGRST301',
  	     * })
  	     * ```
  	     */
  	    constructor(context) {
  	        super(context.message);
  	        this.name = 'PostgrestError';
  	        this.details = context.details;
  	        this.hint = context.hint;
  	        this.code = context.code;
  	    }
  	}
  	PostgrestError$1.default = PostgrestError;

  	return PostgrestError$1;
  }

  var hasRequiredPostgrestBuilder;

  function requirePostgrestBuilder () {
  	if (hasRequiredPostgrestBuilder) return PostgrestBuilder$1;
  	hasRequiredPostgrestBuilder = 1;
  	Object.defineProperty(PostgrestBuilder$1, "__esModule", { value: true });
  	const tslib_1 = require$$0;
  	const PostgrestError_1 = tslib_1.__importDefault(requirePostgrestError());
  	class PostgrestBuilder {
  	    /**
  	     * Creates a builder configured for a specific PostgREST request.
  	     *
  	     * @example
  	     * ```ts
  	     * import PostgrestQueryBuilder from '@supabase/postgrest-js'
  	     *
  	     * const builder = new PostgrestQueryBuilder(
  	     *   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
  	     *   { headers: new Headers({ apikey: 'public-anon-key' }) }
  	     * )
  	     * ```
  	     */
  	    constructor(builder) {
  	        var _a, _b;
  	        this.shouldThrowOnError = false;
  	        this.method = builder.method;
  	        this.url = builder.url;
  	        this.headers = new Headers(builder.headers);
  	        this.schema = builder.schema;
  	        this.body = builder.body;
  	        this.shouldThrowOnError = (_a = builder.shouldThrowOnError) !== null && _a !== void 0 ? _a : false;
  	        this.signal = builder.signal;
  	        this.isMaybeSingle = (_b = builder.isMaybeSingle) !== null && _b !== void 0 ? _b : false;
  	        if (builder.fetch) {
  	            this.fetch = builder.fetch;
  	        }
  	        else {
  	            this.fetch = fetch;
  	        }
  	    }
  	    /**
  	     * If there's an error with the query, throwOnError will reject the promise by
  	     * throwing the error instead of returning it as part of a successful response.
  	     *
  	     * {@link https://github.com/supabase/supabase-js/issues/92}
  	     */
  	    throwOnError() {
  	        this.shouldThrowOnError = true;
  	        return this;
  	    }
  	    /**
  	     * Set an HTTP header for the request.
  	     */
  	    setHeader(name, value) {
  	        this.headers = new Headers(this.headers);
  	        this.headers.set(name, value);
  	        return this;
  	    }
  	    then(onfulfilled, onrejected) {
  	        // https://postgrest.org/en/stable/api.html#switching-schemas
  	        if (this.schema === undefined) ;
  	        else if (['GET', 'HEAD'].includes(this.method)) {
  	            this.headers.set('Accept-Profile', this.schema);
  	        }
  	        else {
  	            this.headers.set('Content-Profile', this.schema);
  	        }
  	        if (this.method !== 'GET' && this.method !== 'HEAD') {
  	            this.headers.set('Content-Type', 'application/json');
  	        }
  	        // NOTE: Invoke w/o `this` to avoid illegal invocation error.
  	        // https://github.com/supabase/postgrest-js/pull/247
  	        const _fetch = this.fetch;
  	        let res = _fetch(this.url.toString(), {
  	            method: this.method,
  	            headers: this.headers,
  	            body: JSON.stringify(this.body),
  	            signal: this.signal,
  	        }).then(async (res) => {
  	            var _a, _b, _c, _d;
  	            let error = null;
  	            let data = null;
  	            let count = null;
  	            let status = res.status;
  	            let statusText = res.statusText;
  	            if (res.ok) {
  	                if (this.method !== 'HEAD') {
  	                    const body = await res.text();
  	                    if (body === '') ;
  	                    else if (this.headers.get('Accept') === 'text/csv') {
  	                        data = body;
  	                    }
  	                    else if (this.headers.get('Accept') &&
  	                        ((_a = this.headers.get('Accept')) === null || _a === void 0 ? void 0 : _a.includes('application/vnd.pgrst.plan+text'))) {
  	                        data = body;
  	                    }
  	                    else {
  	                        data = JSON.parse(body);
  	                    }
  	                }
  	                const countHeader = (_b = this.headers.get('Prefer')) === null || _b === void 0 ? void 0 : _b.match(/count=(exact|planned|estimated)/);
  	                const contentRange = (_c = res.headers.get('content-range')) === null || _c === void 0 ? void 0 : _c.split('/');
  	                if (countHeader && contentRange && contentRange.length > 1) {
  	                    count = parseInt(contentRange[1]);
  	                }
  	                // Temporary partial fix for https://github.com/supabase/postgrest-js/issues/361
  	                // Issue persists e.g. for `.insert([...]).select().maybeSingle()`
  	                if (this.isMaybeSingle && this.method === 'GET' && Array.isArray(data)) {
  	                    if (data.length > 1) {
  	                        error = {
  	                            // https://github.com/PostgREST/postgrest/blob/a867d79c42419af16c18c3fb019eba8df992626f/src/PostgREST/Error.hs#L553
  	                            code: 'PGRST116',
  	                            details: `Results contain ${data.length} rows, application/vnd.pgrst.object+json requires 1 row`,
  	                            hint: null,
  	                            message: 'JSON object requested, multiple (or no) rows returned',
  	                        };
  	                        data = null;
  	                        count = null;
  	                        status = 406;
  	                        statusText = 'Not Acceptable';
  	                    }
  	                    else if (data.length === 1) {
  	                        data = data[0];
  	                    }
  	                    else {
  	                        data = null;
  	                    }
  	                }
  	            }
  	            else {
  	                const body = await res.text();
  	                try {
  	                    error = JSON.parse(body);
  	                    // Workaround for https://github.com/supabase/postgrest-js/issues/295
  	                    if (Array.isArray(error) && res.status === 404) {
  	                        data = [];
  	                        error = null;
  	                        status = 200;
  	                        statusText = 'OK';
  	                    }
  	                }
  	                catch (_e) {
  	                    // Workaround for https://github.com/supabase/postgrest-js/issues/295
  	                    if (res.status === 404 && body === '') {
  	                        status = 204;
  	                        statusText = 'No Content';
  	                    }
  	                    else {
  	                        error = {
  	                            message: body,
  	                        };
  	                    }
  	                }
  	                if (error && this.isMaybeSingle && ((_d = error === null || error === void 0 ? void 0 : error.details) === null || _d === void 0 ? void 0 : _d.includes('0 rows'))) {
  	                    error = null;
  	                    status = 200;
  	                    statusText = 'OK';
  	                }
  	                if (error && this.shouldThrowOnError) {
  	                    throw new PostgrestError_1.default(error);
  	                }
  	            }
  	            const postgrestResponse = {
  	                error,
  	                data,
  	                count,
  	                status,
  	                statusText,
  	            };
  	            return postgrestResponse;
  	        });
  	        if (!this.shouldThrowOnError) {
  	            res = res.catch((fetchError) => {
  	                var _a, _b, _c, _d, _e, _f;
  	                // Build detailed error information including cause if available
  	                // Note: We don't populate code/hint for client-side network errors since those
  	                // fields are meant for upstream service errors (PostgREST/PostgreSQL)
  	                let errorDetails = '';
  	                // Add cause information if available (e.g., DNS errors, network failures)
  	                const cause = fetchError === null || fetchError === void 0 ? void 0 : fetchError.cause;
  	                if (cause) {
  	                    const causeMessage = (_a = cause === null || cause === void 0 ? void 0 : cause.message) !== null && _a !== void 0 ? _a : '';
  	                    const causeCode = (_b = cause === null || cause === void 0 ? void 0 : cause.code) !== null && _b !== void 0 ? _b : '';
  	                    errorDetails = `${(_c = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _c !== void 0 ? _c : 'FetchError'}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`;
  	                    errorDetails += `\n\nCaused by: ${(_d = cause === null || cause === void 0 ? void 0 : cause.name) !== null && _d !== void 0 ? _d : 'Error'}: ${causeMessage}`;
  	                    if (causeCode) {
  	                        errorDetails += ` (${causeCode})`;
  	                    }
  	                    if (cause === null || cause === void 0 ? void 0 : cause.stack) {
  	                        errorDetails += `\n${cause.stack}`;
  	                    }
  	                }
  	                else {
  	                    // No cause available, just include the error stack
  	                    errorDetails = (_e = fetchError === null || fetchError === void 0 ? void 0 : fetchError.stack) !== null && _e !== void 0 ? _e : '';
  	                }
  	                return {
  	                    error: {
  	                        message: `${(_f = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _f !== void 0 ? _f : 'FetchError'}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`,
  	                        details: errorDetails,
  	                        hint: '',
  	                        code: '',
  	                    },
  	                    data: null,
  	                    count: null,
  	                    status: 0,
  	                    statusText: '',
  	                };
  	            });
  	        }
  	        return res.then(onfulfilled, onrejected);
  	    }
  	    /**
  	     * Override the type of the returned `data`.
  	     *
  	     * @typeParam NewResult - The new result type to override with
  	     * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
  	     */
  	    returns() {
  	        /* istanbul ignore next */
  	        return this;
  	    }
  	    /**
  	     * Override the type of the returned `data` field in the response.
  	     *
  	     * @typeParam NewResult - The new type to cast the response data to
  	     * @typeParam Options - Optional type configuration (defaults to { merge: true })
  	     * @typeParam Options.merge - When true, merges the new type with existing return type. When false, replaces the existing types entirely (defaults to true)
  	     * @example
  	     * ```typescript
  	     * // Merge with existing types (default behavior)
  	     * const query = supabase
  	     *   .from('users')
  	     *   .select()
  	     *   .overrideTypes<{ custom_field: string }>()
  	     *
  	     * // Replace existing types completely
  	     * const replaceQuery = supabase
  	     *   .from('users')
  	     *   .select()
  	     *   .overrideTypes<{ id: number; name: string }, { merge: false }>()
  	     * ```
  	     * @returns A PostgrestBuilder instance with the new type
  	     */
  	    overrideTypes() {
  	        return this;
  	    }
  	}
  	PostgrestBuilder$1.default = PostgrestBuilder;

  	return PostgrestBuilder$1;
  }

  var hasRequiredPostgrestTransformBuilder;

  function requirePostgrestTransformBuilder () {
  	if (hasRequiredPostgrestTransformBuilder) return PostgrestTransformBuilder$1;
  	hasRequiredPostgrestTransformBuilder = 1;
  	Object.defineProperty(PostgrestTransformBuilder$1, "__esModule", { value: true });
  	const tslib_1 = require$$0;
  	const PostgrestBuilder_1 = tslib_1.__importDefault(requirePostgrestBuilder());
  	class PostgrestTransformBuilder extends PostgrestBuilder_1.default {
  	    /**
  	     * Perform a SELECT on the query result.
  	     *
  	     * By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
  	     * return modified rows. By calling this method, modified rows are returned in
  	     * `data`.
  	     *
  	     * @param columns - The columns to retrieve, separated by commas
  	     */
  	    select(columns) {
  	        // Remove whitespaces except when quoted
  	        let quoted = false;
  	        const cleanedColumns = (columns !== null && columns !== void 0 ? columns : '*')
  	            .split('')
  	            .map((c) => {
  	            if (/\s/.test(c) && !quoted) {
  	                return '';
  	            }
  	            if (c === '"') {
  	                quoted = !quoted;
  	            }
  	            return c;
  	        })
  	            .join('');
  	        this.url.searchParams.set('select', cleanedColumns);
  	        this.headers.append('Prefer', 'return=representation');
  	        return this;
  	    }
  	    /**
  	     * Order the query result by `column`.
  	     *
  	     * You can call this method multiple times to order by multiple columns.
  	     *
  	     * You can order referenced tables, but it only affects the ordering of the
  	     * parent table if you use `!inner` in the query.
  	     *
  	     * @param column - The column to order by
  	     * @param options - Named parameters
  	     * @param options.ascending - If `true`, the result will be in ascending order
  	     * @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
  	     * `null`s appear last.
  	     * @param options.referencedTable - Set this to order a referenced table by
  	     * its columns
  	     * @param options.foreignTable - Deprecated, use `options.referencedTable`
  	     * instead
  	     */
  	    order(column, { ascending = true, nullsFirst, foreignTable, referencedTable = foreignTable, } = {}) {
  	        const key = referencedTable ? `${referencedTable}.order` : 'order';
  	        const existingOrder = this.url.searchParams.get(key);
  	        this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ''}${column}.${ascending ? 'asc' : 'desc'}${nullsFirst === undefined ? '' : nullsFirst ? '.nullsfirst' : '.nullslast'}`);
  	        return this;
  	    }
  	    /**
  	     * Limit the query result by `count`.
  	     *
  	     * @param count - The maximum number of rows to return
  	     * @param options - Named parameters
  	     * @param options.referencedTable - Set this to limit rows of referenced
  	     * tables instead of the parent table
  	     * @param options.foreignTable - Deprecated, use `options.referencedTable`
  	     * instead
  	     */
  	    limit(count, { foreignTable, referencedTable = foreignTable, } = {}) {
  	        const key = typeof referencedTable === 'undefined' ? 'limit' : `${referencedTable}.limit`;
  	        this.url.searchParams.set(key, `${count}`);
  	        return this;
  	    }
  	    /**
  	     * Limit the query result by starting at an offset `from` and ending at the offset `to`.
  	     * Only records within this range are returned.
  	     * This respects the query order and if there is no order clause the range could behave unexpectedly.
  	     * The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
  	     * and fourth rows of the query.
  	     *
  	     * @param from - The starting index from which to limit the result
  	     * @param to - The last index to which to limit the result
  	     * @param options - Named parameters
  	     * @param options.referencedTable - Set this to limit rows of referenced
  	     * tables instead of the parent table
  	     * @param options.foreignTable - Deprecated, use `options.referencedTable`
  	     * instead
  	     */
  	    range(from, to, { foreignTable, referencedTable = foreignTable, } = {}) {
  	        const keyOffset = typeof referencedTable === 'undefined' ? 'offset' : `${referencedTable}.offset`;
  	        const keyLimit = typeof referencedTable === 'undefined' ? 'limit' : `${referencedTable}.limit`;
  	        this.url.searchParams.set(keyOffset, `${from}`);
  	        // Range is inclusive, so add 1
  	        this.url.searchParams.set(keyLimit, `${to - from + 1}`);
  	        return this;
  	    }
  	    /**
  	     * Set the AbortSignal for the fetch request.
  	     *
  	     * @param signal - The AbortSignal to use for the fetch request
  	     */
  	    abortSignal(signal) {
  	        this.signal = signal;
  	        return this;
  	    }
  	    /**
  	     * Return `data` as a single object instead of an array of objects.
  	     *
  	     * Query result must be one row (e.g. using `.limit(1)`), otherwise this
  	     * returns an error.
  	     */
  	    single() {
  	        this.headers.set('Accept', 'application/vnd.pgrst.object+json');
  	        return this;
  	    }
  	    /**
  	     * Return `data` as a single object instead of an array of objects.
  	     *
  	     * Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
  	     * this returns an error.
  	     */
  	    maybeSingle() {
  	        // Temporary partial fix for https://github.com/supabase/postgrest-js/issues/361
  	        // Issue persists e.g. for `.insert([...]).select().maybeSingle()`
  	        if (this.method === 'GET') {
  	            this.headers.set('Accept', 'application/json');
  	        }
  	        else {
  	            this.headers.set('Accept', 'application/vnd.pgrst.object+json');
  	        }
  	        this.isMaybeSingle = true;
  	        return this;
  	    }
  	    /**
  	     * Return `data` as a string in CSV format.
  	     */
  	    csv() {
  	        this.headers.set('Accept', 'text/csv');
  	        return this;
  	    }
  	    /**
  	     * Return `data` as an object in [GeoJSON](https://geojson.org) format.
  	     */
  	    geojson() {
  	        this.headers.set('Accept', 'application/geo+json');
  	        return this;
  	    }
  	    /**
  	     * Return `data` as the EXPLAIN plan for the query.
  	     *
  	     * You need to enable the
  	     * [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
  	     * setting before using this method.
  	     *
  	     * @param options - Named parameters
  	     *
  	     * @param options.analyze - If `true`, the query will be executed and the
  	     * actual run time will be returned
  	     *
  	     * @param options.verbose - If `true`, the query identifier will be returned
  	     * and `data` will include the output columns of the query
  	     *
  	     * @param options.settings - If `true`, include information on configuration
  	     * parameters that affect query planning
  	     *
  	     * @param options.buffers - If `true`, include information on buffer usage
  	     *
  	     * @param options.wal - If `true`, include information on WAL record generation
  	     *
  	     * @param options.format - The format of the output, can be `"text"` (default)
  	     * or `"json"`
  	     */
  	    explain({ analyze = false, verbose = false, settings = false, buffers = false, wal = false, format = 'text', } = {}) {
  	        var _a;
  	        const options = [
  	            analyze ? 'analyze' : null,
  	            verbose ? 'verbose' : null,
  	            settings ? 'settings' : null,
  	            buffers ? 'buffers' : null,
  	            wal ? 'wal' : null,
  	        ]
  	            .filter(Boolean)
  	            .join('|');
  	        // An Accept header can carry multiple media types but postgrest-js always sends one
  	        const forMediatype = (_a = this.headers.get('Accept')) !== null && _a !== void 0 ? _a : 'application/json';
  	        this.headers.set('Accept', `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`);
  	        if (format === 'json') {
  	            return this;
  	        }
  	        else {
  	            return this;
  	        }
  	    }
  	    /**
  	     * Rollback the query.
  	     *
  	     * `data` will still be returned, but the query is not committed.
  	     */
  	    rollback() {
  	        this.headers.append('Prefer', 'tx=rollback');
  	        return this;
  	    }
  	    /**
  	     * Override the type of the returned `data`.
  	     *
  	     * @typeParam NewResult - The new result type to override with
  	     * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
  	     */
  	    returns() {
  	        return this;
  	    }
  	    /**
  	     * Set the maximum number of rows that can be affected by the query.
  	     * Only available in PostgREST v13+ and only works with PATCH and DELETE methods.
  	     *
  	     * @param value - The maximum number of rows that can be affected
  	     */
  	    maxAffected(value) {
  	        this.headers.append('Prefer', 'handling=strict');
  	        this.headers.append('Prefer', `max-affected=${value}`);
  	        return this;
  	    }
  	}
  	PostgrestTransformBuilder$1.default = PostgrestTransformBuilder;

  	return PostgrestTransformBuilder$1;
  }

  var hasRequiredPostgrestFilterBuilder;

  function requirePostgrestFilterBuilder () {
  	if (hasRequiredPostgrestFilterBuilder) return PostgrestFilterBuilder$1;
  	hasRequiredPostgrestFilterBuilder = 1;
  	Object.defineProperty(PostgrestFilterBuilder$1, "__esModule", { value: true });
  	const tslib_1 = require$$0;
  	const PostgrestTransformBuilder_1 = tslib_1.__importDefault(requirePostgrestTransformBuilder());
  	const PostgrestReservedCharsRegexp = new RegExp('[,()]');
  	class PostgrestFilterBuilder extends PostgrestTransformBuilder_1.default {
  	    /**
  	     * Match only rows where `column` is equal to `value`.
  	     *
  	     * To check if the value of `column` is NULL, you should use `.is()` instead.
  	     *
  	     * @param column - The column to filter on
  	     * @param value - The value to filter with
  	     */
  	    eq(column, value) {
  	        this.url.searchParams.append(column, `eq.${value}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` is not equal to `value`.
  	     *
  	     * @param column - The column to filter on
  	     * @param value - The value to filter with
  	     */
  	    neq(column, value) {
  	        this.url.searchParams.append(column, `neq.${value}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` is greater than `value`.
  	     *
  	     * @param column - The column to filter on
  	     * @param value - The value to filter with
  	     */
  	    gt(column, value) {
  	        this.url.searchParams.append(column, `gt.${value}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` is greater than or equal to `value`.
  	     *
  	     * @param column - The column to filter on
  	     * @param value - The value to filter with
  	     */
  	    gte(column, value) {
  	        this.url.searchParams.append(column, `gte.${value}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` is less than `value`.
  	     *
  	     * @param column - The column to filter on
  	     * @param value - The value to filter with
  	     */
  	    lt(column, value) {
  	        this.url.searchParams.append(column, `lt.${value}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` is less than or equal to `value`.
  	     *
  	     * @param column - The column to filter on
  	     * @param value - The value to filter with
  	     */
  	    lte(column, value) {
  	        this.url.searchParams.append(column, `lte.${value}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` matches `pattern` case-sensitively.
  	     *
  	     * @param column - The column to filter on
  	     * @param pattern - The pattern to match with
  	     */
  	    like(column, pattern) {
  	        this.url.searchParams.append(column, `like.${pattern}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` matches all of `patterns` case-sensitively.
  	     *
  	     * @param column - The column to filter on
  	     * @param patterns - The patterns to match with
  	     */
  	    likeAllOf(column, patterns) {
  	        this.url.searchParams.append(column, `like(all).{${patterns.join(',')}}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` matches any of `patterns` case-sensitively.
  	     *
  	     * @param column - The column to filter on
  	     * @param patterns - The patterns to match with
  	     */
  	    likeAnyOf(column, patterns) {
  	        this.url.searchParams.append(column, `like(any).{${patterns.join(',')}}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` matches `pattern` case-insensitively.
  	     *
  	     * @param column - The column to filter on
  	     * @param pattern - The pattern to match with
  	     */
  	    ilike(column, pattern) {
  	        this.url.searchParams.append(column, `ilike.${pattern}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` matches all of `patterns` case-insensitively.
  	     *
  	     * @param column - The column to filter on
  	     * @param patterns - The patterns to match with
  	     */
  	    ilikeAllOf(column, patterns) {
  	        this.url.searchParams.append(column, `ilike(all).{${patterns.join(',')}}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` matches any of `patterns` case-insensitively.
  	     *
  	     * @param column - The column to filter on
  	     * @param patterns - The patterns to match with
  	     */
  	    ilikeAnyOf(column, patterns) {
  	        this.url.searchParams.append(column, `ilike(any).{${patterns.join(',')}}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` matches the PostgreSQL regex `pattern`
  	     * case-sensitively (using the `~` operator).
  	     *
  	     * @param column - The column to filter on
  	     * @param pattern - The PostgreSQL regular expression pattern to match with
  	     */
  	    regexMatch(column, pattern) {
  	        this.url.searchParams.append(column, `match.${pattern}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` matches the PostgreSQL regex `pattern`
  	     * case-insensitively (using the `~*` operator).
  	     *
  	     * @param column - The column to filter on
  	     * @param pattern - The PostgreSQL regular expression pattern to match with
  	     */
  	    regexIMatch(column, pattern) {
  	        this.url.searchParams.append(column, `imatch.${pattern}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` IS `value`.
  	     *
  	     * For non-boolean columns, this is only relevant for checking if the value of
  	     * `column` is NULL by setting `value` to `null`.
  	     *
  	     * For boolean columns, you can also set `value` to `true` or `false` and it
  	     * will behave the same way as `.eq()`.
  	     *
  	     * @param column - The column to filter on
  	     * @param value - The value to filter with
  	     */
  	    is(column, value) {
  	        this.url.searchParams.append(column, `is.${value}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` IS DISTINCT FROM `value`.
  	     *
  	     * Unlike `.neq()`, this treats `NULL` as a comparable value. Two `NULL` values
  	     * are considered equal (not distinct), and comparing `NULL` with any non-NULL
  	     * value returns true (distinct).
  	     *
  	     * @param column - The column to filter on
  	     * @param value - The value to filter with
  	     */
  	    isDistinct(column, value) {
  	        this.url.searchParams.append(column, `isdistinct.${value}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where `column` is included in the `values` array.
  	     *
  	     * @param column - The column to filter on
  	     * @param values - The values array to filter with
  	     */
  	    in(column, values) {
  	        const cleanedValues = Array.from(new Set(values))
  	            .map((s) => {
  	            // handle postgrest reserved characters
  	            // https://postgrest.org/en/v7.0.0/api.html#reserved-characters
  	            if (typeof s === 'string' && PostgrestReservedCharsRegexp.test(s))
  	                return `"${s}"`;
  	            else
  	                return `${s}`;
  	        })
  	            .join(',');
  	        this.url.searchParams.append(column, `in.(${cleanedValues})`);
  	        return this;
  	    }
  	    /**
  	     * Only relevant for jsonb, array, and range columns. Match only rows where
  	     * `column` contains every element appearing in `value`.
  	     *
  	     * @param column - The jsonb, array, or range column to filter on
  	     * @param value - The jsonb, array, or range value to filter with
  	     */
  	    contains(column, value) {
  	        if (typeof value === 'string') {
  	            // range types can be inclusive '[', ']' or exclusive '(', ')' so just
  	            // keep it simple and accept a string
  	            this.url.searchParams.append(column, `cs.${value}`);
  	        }
  	        else if (Array.isArray(value)) {
  	            // array
  	            this.url.searchParams.append(column, `cs.{${value.join(',')}}`);
  	        }
  	        else {
  	            // json
  	            this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`);
  	        }
  	        return this;
  	    }
  	    /**
  	     * Only relevant for jsonb, array, and range columns. Match only rows where
  	     * every element appearing in `column` is contained by `value`.
  	     *
  	     * @param column - The jsonb, array, or range column to filter on
  	     * @param value - The jsonb, array, or range value to filter with
  	     */
  	    containedBy(column, value) {
  	        if (typeof value === 'string') {
  	            // range
  	            this.url.searchParams.append(column, `cd.${value}`);
  	        }
  	        else if (Array.isArray(value)) {
  	            // array
  	            this.url.searchParams.append(column, `cd.{${value.join(',')}}`);
  	        }
  	        else {
  	            // json
  	            this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`);
  	        }
  	        return this;
  	    }
  	    /**
  	     * Only relevant for range columns. Match only rows where every element in
  	     * `column` is greater than any element in `range`.
  	     *
  	     * @param column - The range column to filter on
  	     * @param range - The range to filter with
  	     */
  	    rangeGt(column, range) {
  	        this.url.searchParams.append(column, `sr.${range}`);
  	        return this;
  	    }
  	    /**
  	     * Only relevant for range columns. Match only rows where every element in
  	     * `column` is either contained in `range` or greater than any element in
  	     * `range`.
  	     *
  	     * @param column - The range column to filter on
  	     * @param range - The range to filter with
  	     */
  	    rangeGte(column, range) {
  	        this.url.searchParams.append(column, `nxl.${range}`);
  	        return this;
  	    }
  	    /**
  	     * Only relevant for range columns. Match only rows where every element in
  	     * `column` is less than any element in `range`.
  	     *
  	     * @param column - The range column to filter on
  	     * @param range - The range to filter with
  	     */
  	    rangeLt(column, range) {
  	        this.url.searchParams.append(column, `sl.${range}`);
  	        return this;
  	    }
  	    /**
  	     * Only relevant for range columns. Match only rows where every element in
  	     * `column` is either contained in `range` or less than any element in
  	     * `range`.
  	     *
  	     * @param column - The range column to filter on
  	     * @param range - The range to filter with
  	     */
  	    rangeLte(column, range) {
  	        this.url.searchParams.append(column, `nxr.${range}`);
  	        return this;
  	    }
  	    /**
  	     * Only relevant for range columns. Match only rows where `column` is
  	     * mutually exclusive to `range` and there can be no element between the two
  	     * ranges.
  	     *
  	     * @param column - The range column to filter on
  	     * @param range - The range to filter with
  	     */
  	    rangeAdjacent(column, range) {
  	        this.url.searchParams.append(column, `adj.${range}`);
  	        return this;
  	    }
  	    /**
  	     * Only relevant for array and range columns. Match only rows where
  	     * `column` and `value` have an element in common.
  	     *
  	     * @param column - The array or range column to filter on
  	     * @param value - The array or range value to filter with
  	     */
  	    overlaps(column, value) {
  	        if (typeof value === 'string') {
  	            // range
  	            this.url.searchParams.append(column, `ov.${value}`);
  	        }
  	        else {
  	            // array
  	            this.url.searchParams.append(column, `ov.{${value.join(',')}}`);
  	        }
  	        return this;
  	    }
  	    /**
  	     * Only relevant for text and tsvector columns. Match only rows where
  	     * `column` matches the query string in `query`.
  	     *
  	     * @param column - The text or tsvector column to filter on
  	     * @param query - The query text to match with
  	     * @param options - Named parameters
  	     * @param options.config - The text search configuration to use
  	     * @param options.type - Change how the `query` text is interpreted
  	     */
  	    textSearch(column, query, { config, type } = {}) {
  	        let typePart = '';
  	        if (type === 'plain') {
  	            typePart = 'pl';
  	        }
  	        else if (type === 'phrase') {
  	            typePart = 'ph';
  	        }
  	        else if (type === 'websearch') {
  	            typePart = 'w';
  	        }
  	        const configPart = config === undefined ? '' : `(${config})`;
  	        this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows where each column in `query` keys is equal to its
  	     * associated value. Shorthand for multiple `.eq()`s.
  	     *
  	     * @param query - The object to filter with, with column names as keys mapped
  	     * to their filter values
  	     */
  	    match(query) {
  	        Object.entries(query).forEach(([column, value]) => {
  	            this.url.searchParams.append(column, `eq.${value}`);
  	        });
  	        return this;
  	    }
  	    /**
  	     * Match only rows which doesn't satisfy the filter.
  	     *
  	     * Unlike most filters, `opearator` and `value` are used as-is and need to
  	     * follow [PostgREST
  	     * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
  	     * to make sure they are properly sanitized.
  	     *
  	     * @param column - The column to filter on
  	     * @param operator - The operator to be negated to filter with, following
  	     * PostgREST syntax
  	     * @param value - The value to filter with, following PostgREST syntax
  	     */
  	    not(column, operator, value) {
  	        this.url.searchParams.append(column, `not.${operator}.${value}`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows which satisfy at least one of the filters.
  	     *
  	     * Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
  	     * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
  	     * to make sure it's properly sanitized.
  	     *
  	     * It's currently not possible to do an `.or()` filter across multiple tables.
  	     *
  	     * @param filters - The filters to use, following PostgREST syntax
  	     * @param options - Named parameters
  	     * @param options.referencedTable - Set this to filter on referenced tables
  	     * instead of the parent table
  	     * @param options.foreignTable - Deprecated, use `referencedTable` instead
  	     */
  	    or(filters, { foreignTable, referencedTable = foreignTable, } = {}) {
  	        const key = referencedTable ? `${referencedTable}.or` : 'or';
  	        this.url.searchParams.append(key, `(${filters})`);
  	        return this;
  	    }
  	    /**
  	     * Match only rows which satisfy the filter. This is an escape hatch - you
  	     * should use the specific filter methods wherever possible.
  	     *
  	     * Unlike most filters, `opearator` and `value` are used as-is and need to
  	     * follow [PostgREST
  	     * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
  	     * to make sure they are properly sanitized.
  	     *
  	     * @param column - The column to filter on
  	     * @param operator - The operator to filter with, following PostgREST syntax
  	     * @param value - The value to filter with, following PostgREST syntax
  	     */
  	    filter(column, operator, value) {
  	        this.url.searchParams.append(column, `${operator}.${value}`);
  	        return this;
  	    }
  	}
  	PostgrestFilterBuilder$1.default = PostgrestFilterBuilder;

  	return PostgrestFilterBuilder$1;
  }

  var hasRequiredPostgrestQueryBuilder;

  function requirePostgrestQueryBuilder () {
  	if (hasRequiredPostgrestQueryBuilder) return PostgrestQueryBuilder$1;
  	hasRequiredPostgrestQueryBuilder = 1;
  	Object.defineProperty(PostgrestQueryBuilder$1, "__esModule", { value: true });
  	const tslib_1 = require$$0;
  	const PostgrestFilterBuilder_1 = tslib_1.__importDefault(requirePostgrestFilterBuilder());
  	class PostgrestQueryBuilder {
  	    /**
  	     * Creates a query builder scoped to a Postgres table or view.
  	     *
  	     * @example
  	     * ```ts
  	     * import PostgrestQueryBuilder from '@supabase/postgrest-js'
  	     *
  	     * const query = new PostgrestQueryBuilder(
  	     *   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
  	     *   { headers: { apikey: 'public-anon-key' } }
  	     * )
  	     * ```
  	     */
  	    constructor(url, { headers = {}, schema, fetch, }) {
  	        this.url = url;
  	        this.headers = new Headers(headers);
  	        this.schema = schema;
  	        this.fetch = fetch;
  	    }
  	    /**
  	     * Perform a SELECT query on the table or view.
  	     *
  	     * @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
  	     *
  	     * @param options - Named parameters
  	     *
  	     * @param options.head - When set to `true`, `data` will not be returned.
  	     * Useful if you only need the count.
  	     *
  	     * @param options.count - Count algorithm to use to count rows in the table or view.
  	     *
  	     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  	     * hood.
  	     *
  	     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  	     * statistics under the hood.
  	     *
  	     * `"estimated"`: Uses exact count for low numbers and planned count for high
  	     * numbers.
  	     */
  	    select(columns, options) {
  	        const { head = false, count } = options !== null && options !== void 0 ? options : {};
  	        const method = head ? 'HEAD' : 'GET';
  	        // Remove whitespaces except when quoted
  	        let quoted = false;
  	        const cleanedColumns = (columns !== null && columns !== void 0 ? columns : '*')
  	            .split('')
  	            .map((c) => {
  	            if (/\s/.test(c) && !quoted) {
  	                return '';
  	            }
  	            if (c === '"') {
  	                quoted = !quoted;
  	            }
  	            return c;
  	        })
  	            .join('');
  	        this.url.searchParams.set('select', cleanedColumns);
  	        if (count) {
  	            this.headers.append('Prefer', `count=${count}`);
  	        }
  	        return new PostgrestFilterBuilder_1.default({
  	            method,
  	            url: this.url,
  	            headers: this.headers,
  	            schema: this.schema,
  	            fetch: this.fetch,
  	        });
  	    }
  	    /**
  	     * Perform an INSERT into the table or view.
  	     *
  	     * By default, inserted rows are not returned. To return it, chain the call
  	     * with `.select()`.
  	     *
  	     * @param values - The values to insert. Pass an object to insert a single row
  	     * or an array to insert multiple rows.
  	     *
  	     * @param options - Named parameters
  	     *
  	     * @param options.count - Count algorithm to use to count inserted rows.
  	     *
  	     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  	     * hood.
  	     *
  	     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  	     * statistics under the hood.
  	     *
  	     * `"estimated"`: Uses exact count for low numbers and planned count for high
  	     * numbers.
  	     *
  	     * @param options.defaultToNull - Make missing fields default to `null`.
  	     * Otherwise, use the default value for the column. Only applies for bulk
  	     * inserts.
  	     */
  	    insert(values, { count, defaultToNull = true, } = {}) {
  	        var _a;
  	        const method = 'POST';
  	        if (count) {
  	            this.headers.append('Prefer', `count=${count}`);
  	        }
  	        if (!defaultToNull) {
  	            this.headers.append('Prefer', `missing=default`);
  	        }
  	        if (Array.isArray(values)) {
  	            const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
  	            if (columns.length > 0) {
  	                const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
  	                this.url.searchParams.set('columns', uniqueColumns.join(','));
  	            }
  	        }
  	        return new PostgrestFilterBuilder_1.default({
  	            method,
  	            url: this.url,
  	            headers: this.headers,
  	            schema: this.schema,
  	            body: values,
  	            fetch: (_a = this.fetch) !== null && _a !== void 0 ? _a : fetch,
  	        });
  	    }
  	    /**
  	   * Perform an UPSERT on the table or view. Depending on the column(s) passed
  	   * to `onConflict`, `.upsert()` allows you to perform the equivalent of
  	   * `.insert()` if a row with the corresponding `onConflict` columns doesn't
  	   * exist, or if it does exist, perform an alternative action depending on
  	   * `ignoreDuplicates`.
  	   *
  	   * By default, upserted rows are not returned. To return it, chain the call
  	   * with `.select()`.
  	   *
  	   * @param values - The values to upsert with. Pass an object to upsert a
  	   * single row or an array to upsert multiple rows.
  	   *
  	   * @param options - Named parameters
  	   *
  	   * @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
  	   * duplicate rows are determined. Two rows are duplicates if all the
  	   * `onConflict` columns are equal.
  	   *
  	   * @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
  	   * `false`, duplicate rows are merged with existing rows.
  	   *
  	   * @param options.count - Count algorithm to use to count upserted rows.
  	   *
  	   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  	   * hood.
  	   *
  	   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  	   * statistics under the hood.
  	   *
  	   * `"estimated"`: Uses exact count for low numbers and planned count for high
  	   * numbers.
  	   *
  	   * @param options.defaultToNull - Make missing fields default to `null`.
  	   * Otherwise, use the default value for the column. This only applies when
  	   * inserting new rows, not when merging with existing rows under
  	   * `ignoreDuplicates: false`. This also only applies when doing bulk upserts.
  	   *
  	   * @example Upsert a single row using a unique key
  	   * ```ts
  	   * // Upserting a single row, overwriting based on the 'username' unique column
  	   * const { data, error } = await supabase
  	   *   .from('users')
  	   *   .upsert({ username: 'supabot' }, { onConflict: 'username' })
  	   *
  	   * // Example response:
  	   * // {
  	   * //   data: [
  	   * //     { id: 4, message: 'bar', username: 'supabot' }
  	   * //   ],
  	   * //   error: null
  	   * // }
  	   * ```
  	   *
  	   * @example Upsert with conflict resolution and exact row counting
  	   * ```ts
  	   * // Upserting and returning exact count
  	   * const { data, error, count } = await supabase
  	   *   .from('users')
  	   *   .upsert(
  	   *     {
  	   *       id: 3,
  	   *       message: 'foo',
  	   *       username: 'supabot'
  	   *     },
  	   *     {
  	   *       onConflict: 'username',
  	   *       count: 'exact'
  	   *     }
  	   *   )
  	   *
  	   * // Example response:
  	   * // {
  	   * //   data: [
  	   * //     {
  	   * //       id: 42,
  	   * //       handle: "saoirse",
  	   * //       display_name: "Saoirse"
  	   * //     }
  	   * //   ],
  	   * //   count: 1,
  	   * //   error: null
  	   * // }
  	   * ```
  	   */
  	    upsert(values, { onConflict, ignoreDuplicates = false, count, defaultToNull = true, } = {}) {
  	        var _a;
  	        const method = 'POST';
  	        this.headers.append('Prefer', `resolution=${ignoreDuplicates ? 'ignore' : 'merge'}-duplicates`);
  	        if (onConflict !== undefined)
  	            this.url.searchParams.set('on_conflict', onConflict);
  	        if (count) {
  	            this.headers.append('Prefer', `count=${count}`);
  	        }
  	        if (!defaultToNull) {
  	            this.headers.append('Prefer', 'missing=default');
  	        }
  	        if (Array.isArray(values)) {
  	            const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
  	            if (columns.length > 0) {
  	                const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
  	                this.url.searchParams.set('columns', uniqueColumns.join(','));
  	            }
  	        }
  	        return new PostgrestFilterBuilder_1.default({
  	            method,
  	            url: this.url,
  	            headers: this.headers,
  	            schema: this.schema,
  	            body: values,
  	            fetch: (_a = this.fetch) !== null && _a !== void 0 ? _a : fetch,
  	        });
  	    }
  	    /**
  	     * Perform an UPDATE on the table or view.
  	     *
  	     * By default, updated rows are not returned. To return it, chain the call
  	     * with `.select()` after filters.
  	     *
  	     * @param values - The values to update with
  	     *
  	     * @param options - Named parameters
  	     *
  	     * @param options.count - Count algorithm to use to count updated rows.
  	     *
  	     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  	     * hood.
  	     *
  	     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  	     * statistics under the hood.
  	     *
  	     * `"estimated"`: Uses exact count for low numbers and planned count for high
  	     * numbers.
  	     */
  	    update(values, { count, } = {}) {
  	        var _a;
  	        const method = 'PATCH';
  	        if (count) {
  	            this.headers.append('Prefer', `count=${count}`);
  	        }
  	        return new PostgrestFilterBuilder_1.default({
  	            method,
  	            url: this.url,
  	            headers: this.headers,
  	            schema: this.schema,
  	            body: values,
  	            fetch: (_a = this.fetch) !== null && _a !== void 0 ? _a : fetch,
  	        });
  	    }
  	    /**
  	     * Perform a DELETE on the table or view.
  	     *
  	     * By default, deleted rows are not returned. To return it, chain the call
  	     * with `.select()` after filters.
  	     *
  	     * @param options - Named parameters
  	     *
  	     * @param options.count - Count algorithm to use to count deleted rows.
  	     *
  	     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  	     * hood.
  	     *
  	     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  	     * statistics under the hood.
  	     *
  	     * `"estimated"`: Uses exact count for low numbers and planned count for high
  	     * numbers.
  	     */
  	    delete({ count, } = {}) {
  	        var _a;
  	        const method = 'DELETE';
  	        if (count) {
  	            this.headers.append('Prefer', `count=${count}`);
  	        }
  	        return new PostgrestFilterBuilder_1.default({
  	            method,
  	            url: this.url,
  	            headers: this.headers,
  	            schema: this.schema,
  	            fetch: (_a = this.fetch) !== null && _a !== void 0 ? _a : fetch,
  	        });
  	    }
  	}
  	PostgrestQueryBuilder$1.default = PostgrestQueryBuilder;

  	return PostgrestQueryBuilder$1;
  }

  var hasRequiredPostgrestClient;

  function requirePostgrestClient () {
  	if (hasRequiredPostgrestClient) return PostgrestClient$1;
  	hasRequiredPostgrestClient = 1;
  	Object.defineProperty(PostgrestClient$1, "__esModule", { value: true });
  	const tslib_1 = require$$0;
  	const PostgrestQueryBuilder_1 = tslib_1.__importDefault(requirePostgrestQueryBuilder());
  	const PostgrestFilterBuilder_1 = tslib_1.__importDefault(requirePostgrestFilterBuilder());
  	/**
  	 * PostgREST client.
  	 *
  	 * @typeParam Database - Types for the schema from the [type
  	 * generator](https://supabase.com/docs/reference/javascript/next/typescript-support)
  	 *
  	 * @typeParam SchemaName - Postgres schema to switch to. Must be a string
  	 * literal, the same one passed to the constructor. If the schema is not
  	 * `"public"`, this must be supplied manually.
  	 */
  	class PostgrestClient {
  	    // TODO: Add back shouldThrowOnError once we figure out the typings
  	    /**
  	     * Creates a PostgREST client.
  	     *
  	     * @param url - URL of the PostgREST endpoint
  	     * @param options - Named parameters
  	     * @param options.headers - Custom headers
  	     * @param options.schema - Postgres schema to switch to
  	     * @param options.fetch - Custom fetch
  	     * @example
  	     * ```ts
  	     * import PostgrestClient from '@supabase/postgrest-js'
  	     *
  	     * const postgrest = new PostgrestClient('https://xyzcompany.supabase.co/rest/v1', {
  	     *   headers: { apikey: 'public-anon-key' },
  	     *   schema: 'public',
  	     * })
  	     * ```
  	     */
  	    constructor(url, { headers = {}, schema, fetch, } = {}) {
  	        this.url = url;
  	        this.headers = new Headers(headers);
  	        this.schemaName = schema;
  	        this.fetch = fetch;
  	    }
  	    /**
  	     * Perform a query on a table or a view.
  	     *
  	     * @param relation - The table or view name to query
  	     */
  	    from(relation) {
  	        if (!relation || typeof relation !== 'string' || relation.trim() === '') {
  	            throw new Error('Invalid relation name: relation must be a non-empty string.');
  	        }
  	        const url = new URL(`${this.url}/${relation}`);
  	        return new PostgrestQueryBuilder_1.default(url, {
  	            headers: new Headers(this.headers),
  	            schema: this.schemaName,
  	            fetch: this.fetch,
  	        });
  	    }
  	    /**
  	     * Select a schema to query or perform an function (rpc) call.
  	     *
  	     * The schema needs to be on the list of exposed schemas inside Supabase.
  	     *
  	     * @param schema - The schema to query
  	     */
  	    schema(schema) {
  	        return new PostgrestClient(this.url, {
  	            headers: this.headers,
  	            schema,
  	            fetch: this.fetch,
  	        });
  	    }
  	    /**
  	     * Perform a function call.
  	     *
  	     * @param fn - The function name to call
  	     * @param args - The arguments to pass to the function call
  	     * @param options - Named parameters
  	     * @param options.head - When set to `true`, `data` will not be returned.
  	     * Useful if you only need the count.
  	     * @param options.get - When set to `true`, the function will be called with
  	     * read-only access mode.
  	     * @param options.count - Count algorithm to use to count rows returned by the
  	     * function. Only applicable for [set-returning
  	     * functions](https://www.postgresql.org/docs/current/functions-srf.html).
  	     *
  	     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  	     * hood.
  	     *
  	     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  	     * statistics under the hood.
  	     *
  	     * `"estimated"`: Uses exact count for low numbers and planned count for high
  	     * numbers.
  	     */
  	    rpc(fn, args = {}, { head = false, get = false, count, } = {}) {
  	        var _a;
  	        let method;
  	        const url = new URL(`${this.url}/rpc/${fn}`);
  	        let body;
  	        if (head || get) {
  	            method = head ? 'HEAD' : 'GET';
  	            Object.entries(args)
  	                // params with undefined value needs to be filtered out, otherwise it'll
  	                // show up as `?param=undefined`
  	                .filter(([_, value]) => value !== undefined)
  	                // array values need special syntax
  	                .map(([name, value]) => [name, Array.isArray(value) ? `{${value.join(',')}}` : `${value}`])
  	                .forEach(([name, value]) => {
  	                url.searchParams.append(name, value);
  	            });
  	        }
  	        else {
  	            method = 'POST';
  	            body = args;
  	        }
  	        const headers = new Headers(this.headers);
  	        if (count) {
  	            headers.set('Prefer', `count=${count}`);
  	        }
  	        return new PostgrestFilterBuilder_1.default({
  	            method,
  	            url,
  	            headers,
  	            schema: this.schemaName,
  	            body,
  	            fetch: (_a = this.fetch) !== null && _a !== void 0 ? _a : fetch,
  	        });
  	    }
  	}
  	PostgrestClient$1.default = PostgrestClient;

  	return PostgrestClient$1;
  }

  var hasRequiredCjs;

  function requireCjs () {
  	if (hasRequiredCjs) return cjs;
  	hasRequiredCjs = 1;
  	Object.defineProperty(cjs, "__esModule", { value: true });
  	cjs.PostgrestError = cjs.PostgrestBuilder = cjs.PostgrestTransformBuilder = cjs.PostgrestFilterBuilder = cjs.PostgrestQueryBuilder = cjs.PostgrestClient = void 0;
  	const tslib_1 = require$$0;
  	// Always update wrapper.mjs when updating this file.
  	const PostgrestClient_1 = tslib_1.__importDefault(requirePostgrestClient());
  	cjs.PostgrestClient = PostgrestClient_1.default;
  	const PostgrestQueryBuilder_1 = tslib_1.__importDefault(requirePostgrestQueryBuilder());
  	cjs.PostgrestQueryBuilder = PostgrestQueryBuilder_1.default;
  	const PostgrestFilterBuilder_1 = tslib_1.__importDefault(requirePostgrestFilterBuilder());
  	cjs.PostgrestFilterBuilder = PostgrestFilterBuilder_1.default;
  	const PostgrestTransformBuilder_1 = tslib_1.__importDefault(requirePostgrestTransformBuilder());
  	cjs.PostgrestTransformBuilder = PostgrestTransformBuilder_1.default;
  	const PostgrestBuilder_1 = tslib_1.__importDefault(requirePostgrestBuilder());
  	cjs.PostgrestBuilder = PostgrestBuilder_1.default;
  	const PostgrestError_1 = tslib_1.__importDefault(requirePostgrestError());
  	cjs.PostgrestError = PostgrestError_1.default;
  	cjs.default = {
  	    PostgrestClient: PostgrestClient_1.default,
  	    PostgrestQueryBuilder: PostgrestQueryBuilder_1.default,
  	    PostgrestFilterBuilder: PostgrestFilterBuilder_1.default,
  	    PostgrestTransformBuilder: PostgrestTransformBuilder_1.default,
  	    PostgrestBuilder: PostgrestBuilder_1.default,
  	    PostgrestError: PostgrestError_1.default,
  	};

  	return cjs;
  }

  var cjsExports = requireCjs();
  var index = /*@__PURE__*/getDefaultExportFromCjs(cjsExports);

  var index$1 = /*#__PURE__*/_mergeNamespaces({
    __proto__: null,
    default: index
  }, [cjsExports]);

  const {
    PostgrestClient,
    PostgrestQueryBuilder,
    PostgrestFilterBuilder,
    PostgrestTransformBuilder,
    PostgrestBuilder,
    PostgrestError,
  } = index || index$1;

  /**
   * Utilities for creating WebSocket instances across runtimes.
   */
  class WebSocketFactory {
      /**
       * Static-only utility – prevent instantiation.
       */
      constructor() { }
      static detectEnvironment() {
          var _a;
          if (typeof WebSocket !== 'undefined') {
              return { type: 'native', constructor: WebSocket };
          }
          if (typeof globalThis !== 'undefined' && typeof globalThis.WebSocket !== 'undefined') {
              return { type: 'native', constructor: globalThis.WebSocket };
          }
          if (typeof global$1 !== 'undefined' && typeof global$1.WebSocket !== 'undefined') {
              return { type: 'native', constructor: global$1.WebSocket };
          }
          if (typeof globalThis !== 'undefined' &&
              typeof globalThis.WebSocketPair !== 'undefined' &&
              typeof globalThis.WebSocket === 'undefined') {
              return {
                  type: 'cloudflare',
                  error: 'Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.',
                  workaround: 'Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime.',
              };
          }
          if ((typeof globalThis !== 'undefined' && globalThis.EdgeRuntime) ||
              (typeof navigator !== 'undefined' && ((_a = navigator.userAgent) === null || _a === void 0 ? void 0 : _a.includes('Vercel-Edge')))) {
              return {
                  type: 'unsupported',
                  error: 'Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.',
                  workaround: 'Use serverless functions or a different deployment target for WebSocket functionality.',
              };
          }
          if (typeof browser$1 !== 'undefined') {
              // Use dynamic property access to avoid Next.js Edge Runtime static analysis warnings
              const processVersions = browser$1['versions'];
              if (processVersions && processVersions['node']) {
                  // Remove 'v' prefix if present and parse the major version
                  const versionString = processVersions['node'];
                  const nodeVersion = parseInt(versionString.replace(/^v/, '').split('.')[0]);
                  // Node.js 22+ should have native WebSocket
                  if (nodeVersion >= 22) {
                      // Check if native WebSocket is available (should be in Node.js 22+)
                      if (typeof globalThis.WebSocket !== 'undefined') {
                          return { type: 'native', constructor: globalThis.WebSocket };
                      }
                      // If not available, user needs to provide it
                      return {
                          type: 'unsupported',
                          error: `Node.js ${nodeVersion} detected but native WebSocket not found.`,
                          workaround: 'Provide a WebSocket implementation via the transport option.',
                      };
                  }
                  // Node.js < 22 doesn't have native WebSocket
                  return {
                      type: 'unsupported',
                      error: `Node.js ${nodeVersion} detected without native WebSocket support.`,
                      workaround: 'For Node.js < 22, install "ws" package and provide it via the transport option:\n' +
                          'import ws from "ws"\n' +
                          'new RealtimeClient(url, { transport: ws })',
                  };
              }
          }
          return {
              type: 'unsupported',
              error: 'Unknown JavaScript runtime without WebSocket support.',
              workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation.",
          };
      }
      /**
       * Returns the best available WebSocket constructor for the current runtime.
       *
       * @example
       * ```ts
       * const WS = WebSocketFactory.getWebSocketConstructor()
       * const socket = new WS('wss://realtime.supabase.co/socket')
       * ```
       */
      static getWebSocketConstructor() {
          const env = this.detectEnvironment();
          if (env.constructor) {
              return env.constructor;
          }
          let errorMessage = env.error || 'WebSocket not supported in this environment.';
          if (env.workaround) {
              errorMessage += `\n\nSuggested solution: ${env.workaround}`;
          }
          throw new Error(errorMessage);
      }
      /**
       * Creates a WebSocket using the detected constructor.
       *
       * @example
       * ```ts
       * const socket = WebSocketFactory.createWebSocket('wss://realtime.supabase.co/socket')
       * ```
       */
      static createWebSocket(url, protocols) {
          const WS = this.getWebSocketConstructor();
          return new WS(url, protocols);
      }
      /**
       * Detects whether the runtime can establish WebSocket connections.
       *
       * @example
       * ```ts
       * if (!WebSocketFactory.isWebSocketSupported()) {
       *   console.warn('Falling back to long polling')
       * }
       * ```
       */
      static isWebSocketSupported() {
          try {
              const env = this.detectEnvironment();
              return env.type === 'native' || env.type === 'ws';
          }
          catch (_a) {
              return false;
          }
      }
  }

  // Generated automatically during releases by scripts/update-version-files.ts
  // This file provides runtime access to the package version for:
  // - HTTP request headers (e.g., X-Client-Info header for API requests)
  // - Debugging and support (identifying which version is running)
  // - Telemetry and logging (version reporting in errors/analytics)
  // - Ensuring build artifacts match the published package version
  const version$3 = '2.86.0';

  const DEFAULT_VERSION = `realtime-js/${version$3}`;
  const VSN_1_0_0 = '1.0.0';
  const VSN_2_0_0 = '2.0.0';
  const DEFAULT_VSN = VSN_1_0_0;
  const DEFAULT_TIMEOUT = 10000;
  const WS_CLOSE_NORMAL = 1000;
  const MAX_PUSH_BUFFER_SIZE = 100;
  var SOCKET_STATES;
  (function (SOCKET_STATES) {
      SOCKET_STATES[SOCKET_STATES["connecting"] = 0] = "connecting";
      SOCKET_STATES[SOCKET_STATES["open"] = 1] = "open";
      SOCKET_STATES[SOCKET_STATES["closing"] = 2] = "closing";
      SOCKET_STATES[SOCKET_STATES["closed"] = 3] = "closed";
  })(SOCKET_STATES || (SOCKET_STATES = {}));
  var CHANNEL_STATES;
  (function (CHANNEL_STATES) {
      CHANNEL_STATES["closed"] = "closed";
      CHANNEL_STATES["errored"] = "errored";
      CHANNEL_STATES["joined"] = "joined";
      CHANNEL_STATES["joining"] = "joining";
      CHANNEL_STATES["leaving"] = "leaving";
  })(CHANNEL_STATES || (CHANNEL_STATES = {}));
  var CHANNEL_EVENTS;
  (function (CHANNEL_EVENTS) {
      CHANNEL_EVENTS["close"] = "phx_close";
      CHANNEL_EVENTS["error"] = "phx_error";
      CHANNEL_EVENTS["join"] = "phx_join";
      CHANNEL_EVENTS["reply"] = "phx_reply";
      CHANNEL_EVENTS["leave"] = "phx_leave";
      CHANNEL_EVENTS["access_token"] = "access_token";
  })(CHANNEL_EVENTS || (CHANNEL_EVENTS = {}));
  var TRANSPORTS;
  (function (TRANSPORTS) {
      TRANSPORTS["websocket"] = "websocket";
  })(TRANSPORTS || (TRANSPORTS = {}));
  var CONNECTION_STATE;
  (function (CONNECTION_STATE) {
      CONNECTION_STATE["Connecting"] = "connecting";
      CONNECTION_STATE["Open"] = "open";
      CONNECTION_STATE["Closing"] = "closing";
      CONNECTION_STATE["Closed"] = "closed";
  })(CONNECTION_STATE || (CONNECTION_STATE = {}));

  class Serializer {
      constructor(allowedMetadataKeys) {
          this.HEADER_LENGTH = 1;
          this.USER_BROADCAST_PUSH_META_LENGTH = 6;
          this.KINDS = { userBroadcastPush: 3, userBroadcast: 4 };
          this.BINARY_ENCODING = 0;
          this.JSON_ENCODING = 1;
          this.BROADCAST_EVENT = 'broadcast';
          this.allowedMetadataKeys = [];
          this.allowedMetadataKeys = allowedMetadataKeys !== null && allowedMetadataKeys !== void 0 ? allowedMetadataKeys : [];
      }
      encode(msg, callback) {
          if (msg.event === this.BROADCAST_EVENT &&
              !(msg.payload instanceof ArrayBuffer) &&
              typeof msg.payload.event === 'string') {
              return callback(this._binaryEncodeUserBroadcastPush(msg));
          }
          let payload = [msg.join_ref, msg.ref, msg.topic, msg.event, msg.payload];
          return callback(JSON.stringify(payload));
      }
      _binaryEncodeUserBroadcastPush(message) {
          var _a;
          if (this._isArrayBuffer((_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload)) {
              return this._encodeBinaryUserBroadcastPush(message);
          }
          else {
              return this._encodeJsonUserBroadcastPush(message);
          }
      }
      _encodeBinaryUserBroadcastPush(message) {
          var _a, _b;
          const userPayload = (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null && _b !== void 0 ? _b : new ArrayBuffer(0);
          return this._encodeUserBroadcastPush(message, this.BINARY_ENCODING, userPayload);
      }
      _encodeJsonUserBroadcastPush(message) {
          var _a, _b;
          const userPayload = (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null && _b !== void 0 ? _b : {};
          const encoder = new TextEncoder();
          const encodedUserPayload = encoder.encode(JSON.stringify(userPayload)).buffer;
          return this._encodeUserBroadcastPush(message, this.JSON_ENCODING, encodedUserPayload);
      }
      _encodeUserBroadcastPush(message, encodingType, encodedPayload) {
          var _a, _b;
          const topic = message.topic;
          const ref = (_a = message.ref) !== null && _a !== void 0 ? _a : '';
          const joinRef = (_b = message.join_ref) !== null && _b !== void 0 ? _b : '';
          const userEvent = message.payload.event;
          // Filter metadata based on allowed keys
          const rest = this.allowedMetadataKeys
              ? this._pick(message.payload, this.allowedMetadataKeys)
              : {};
          const metadata = Object.keys(rest).length === 0 ? '' : JSON.stringify(rest);
          // Validate lengths don't exceed uint8 max value (255)
          if (joinRef.length > 255) {
              throw new Error(`joinRef length ${joinRef.length} exceeds maximum of 255`);
          }
          if (ref.length > 255) {
              throw new Error(`ref length ${ref.length} exceeds maximum of 255`);
          }
          if (topic.length > 255) {
              throw new Error(`topic length ${topic.length} exceeds maximum of 255`);
          }
          if (userEvent.length > 255) {
              throw new Error(`userEvent length ${userEvent.length} exceeds maximum of 255`);
          }
          if (metadata.length > 255) {
              throw new Error(`metadata length ${metadata.length} exceeds maximum of 255`);
          }
          const metaLength = this.USER_BROADCAST_PUSH_META_LENGTH +
              joinRef.length +
              ref.length +
              topic.length +
              userEvent.length +
              metadata.length;
          const header = new ArrayBuffer(this.HEADER_LENGTH + metaLength);
          let view = new DataView(header);
          let offset = 0;
          view.setUint8(offset++, this.KINDS.userBroadcastPush); // kind
          view.setUint8(offset++, joinRef.length);
          view.setUint8(offset++, ref.length);
          view.setUint8(offset++, topic.length);
          view.setUint8(offset++, userEvent.length);
          view.setUint8(offset++, metadata.length);
          view.setUint8(offset++, encodingType);
          Array.from(joinRef, (char) => view.setUint8(offset++, char.charCodeAt(0)));
          Array.from(ref, (char) => view.setUint8(offset++, char.charCodeAt(0)));
          Array.from(topic, (char) => view.setUint8(offset++, char.charCodeAt(0)));
          Array.from(userEvent, (char) => view.setUint8(offset++, char.charCodeAt(0)));
          Array.from(metadata, (char) => view.setUint8(offset++, char.charCodeAt(0)));
          var combined = new Uint8Array(header.byteLength + encodedPayload.byteLength);
          combined.set(new Uint8Array(header), 0);
          combined.set(new Uint8Array(encodedPayload), header.byteLength);
          return combined.buffer;
      }
      decode(rawPayload, callback) {
          if (this._isArrayBuffer(rawPayload)) {
              let result = this._binaryDecode(rawPayload);
              return callback(result);
          }
          if (typeof rawPayload === 'string') {
              const jsonPayload = JSON.parse(rawPayload);
              const [join_ref, ref, topic, event, payload] = jsonPayload;
              return callback({ join_ref, ref, topic, event, payload });
          }
          return callback({});
      }
      _binaryDecode(buffer) {
          const view = new DataView(buffer);
          const kind = view.getUint8(0);
          const decoder = new TextDecoder();
          switch (kind) {
              case this.KINDS.userBroadcast:
                  return this._decodeUserBroadcast(buffer, view, decoder);
          }
      }
      _decodeUserBroadcast(buffer, view, decoder) {
          const topicSize = view.getUint8(1);
          const userEventSize = view.getUint8(2);
          const metadataSize = view.getUint8(3);
          const payloadEncoding = view.getUint8(4);
          let offset = this.HEADER_LENGTH + 4;
          const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
          offset = offset + topicSize;
          const userEvent = decoder.decode(buffer.slice(offset, offset + userEventSize));
          offset = offset + userEventSize;
          const metadata = decoder.decode(buffer.slice(offset, offset + metadataSize));
          offset = offset + metadataSize;
          const payload = buffer.slice(offset, buffer.byteLength);
          const parsedPayload = payloadEncoding === this.JSON_ENCODING ? JSON.parse(decoder.decode(payload)) : payload;
          const data = {
              type: this.BROADCAST_EVENT,
              event: userEvent,
              payload: parsedPayload,
          };
          // Metadata is optional and always JSON encoded
          if (metadataSize > 0) {
              data['meta'] = JSON.parse(metadata);
          }
          return { join_ref: null, ref: null, topic: topic, event: this.BROADCAST_EVENT, payload: data };
      }
      _isArrayBuffer(buffer) {
          var _a;
          return buffer instanceof ArrayBuffer || ((_a = buffer === null || buffer === void 0 ? void 0 : buffer.constructor) === null || _a === void 0 ? void 0 : _a.name) === 'ArrayBuffer';
      }
      _pick(obj, keys) {
          if (!obj || typeof obj !== 'object') {
              return {};
          }
          return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));
      }
  }

  /**
   * Creates a timer that accepts a `timerCalc` function to perform calculated timeout retries, such as exponential backoff.
   *
   * @example
   *    let reconnectTimer = new Timer(() => this.connect(), function(tries){
   *      return [1000, 5000, 10000][tries - 1] || 10000
   *    })
   *    reconnectTimer.scheduleTimeout() // fires after 1000
   *    reconnectTimer.scheduleTimeout() // fires after 5000
   *    reconnectTimer.reset()
   *    reconnectTimer.scheduleTimeout() // fires after 1000
   */
  class Timer {
      constructor(callback, timerCalc) {
          this.callback = callback;
          this.timerCalc = timerCalc;
          this.timer = undefined;
          this.tries = 0;
          this.callback = callback;
          this.timerCalc = timerCalc;
      }
      reset() {
          this.tries = 0;
          clearTimeout(this.timer);
          this.timer = undefined;
      }
      // Cancels any previous scheduleTimeout and schedules callback
      scheduleTimeout() {
          clearTimeout(this.timer);
          this.timer = setTimeout(() => {
              this.tries = this.tries + 1;
              this.callback();
          }, this.timerCalc(this.tries + 1));
      }
  }

  /**
   * Helpers to convert the change Payload into native JS types.
   */
  // Adapted from epgsql (src/epgsql_binary.erl), this module licensed under
  // 3-clause BSD found here: https://raw.githubusercontent.com/epgsql/epgsql/devel/LICENSE
  var PostgresTypes;
  (function (PostgresTypes) {
      PostgresTypes["abstime"] = "abstime";
      PostgresTypes["bool"] = "bool";
      PostgresTypes["date"] = "date";
      PostgresTypes["daterange"] = "daterange";
      PostgresTypes["float4"] = "float4";
      PostgresTypes["float8"] = "float8";
      PostgresTypes["int2"] = "int2";
      PostgresTypes["int4"] = "int4";
      PostgresTypes["int4range"] = "int4range";
      PostgresTypes["int8"] = "int8";
      PostgresTypes["int8range"] = "int8range";
      PostgresTypes["json"] = "json";
      PostgresTypes["jsonb"] = "jsonb";
      PostgresTypes["money"] = "money";
      PostgresTypes["numeric"] = "numeric";
      PostgresTypes["oid"] = "oid";
      PostgresTypes["reltime"] = "reltime";
      PostgresTypes["text"] = "text";
      PostgresTypes["time"] = "time";
      PostgresTypes["timestamp"] = "timestamp";
      PostgresTypes["timestamptz"] = "timestamptz";
      PostgresTypes["timetz"] = "timetz";
      PostgresTypes["tsrange"] = "tsrange";
      PostgresTypes["tstzrange"] = "tstzrange";
  })(PostgresTypes || (PostgresTypes = {}));
  /**
   * Takes an array of columns and an object of string values then converts each string value
   * to its mapped type.
   *
   * @param {{name: String, type: String}[]} columns
   * @param {Object} record
   * @param {Object} options The map of various options that can be applied to the mapper
   * @param {Array} options.skipTypes The array of types that should not be converted
   *
   * @example convertChangeData([{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age:'33'}, {})
   * //=>{ first_name: 'Paul', age: 33 }
   */
  const convertChangeData = (columns, record, options = {}) => {
      var _a;
      const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
      if (!record) {
          return {};
      }
      return Object.keys(record).reduce((acc, rec_key) => {
          acc[rec_key] = convertColumn(rec_key, columns, record, skipTypes);
          return acc;
      }, {});
  };
  /**
   * Converts the value of an individual column.
   *
   * @param {String} columnName The column that you want to convert
   * @param {{name: String, type: String}[]} columns All of the columns
   * @param {Object} record The map of string values
   * @param {Array} skipTypes An array of types that should not be converted
   * @return {object} Useless information
   *
   * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, [])
   * //=> 33
   * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, ['int4'])
   * //=> "33"
   */
  const convertColumn = (columnName, columns, record, skipTypes) => {
      const column = columns.find((x) => x.name === columnName);
      const colType = column === null || column === void 0 ? void 0 : column.type;
      const value = record[columnName];
      if (colType && !skipTypes.includes(colType)) {
          return convertCell(colType, value);
      }
      return noop$1(value);
  };
  /**
   * If the value of the cell is `null`, returns null.
   * Otherwise converts the string value to the correct type.
   * @param {String} type A postgres column type
   * @param {String} value The cell value
   *
   * @example convertCell('bool', 't')
   * //=> true
   * @example convertCell('int8', '10')
   * //=> 10
   * @example convertCell('_int4', '{1,2,3,4}')
   * //=> [1,2,3,4]
   */
  const convertCell = (type, value) => {
      // if data type is an array
      if (type.charAt(0) === '_') {
          const dataType = type.slice(1, type.length);
          return toArray(value, dataType);
      }
      // If not null, convert to correct type.
      switch (type) {
          case PostgresTypes.bool:
              return toBoolean(value);
          case PostgresTypes.float4:
          case PostgresTypes.float8:
          case PostgresTypes.int2:
          case PostgresTypes.int4:
          case PostgresTypes.int8:
          case PostgresTypes.numeric:
          case PostgresTypes.oid:
              return toNumber(value);
          case PostgresTypes.json:
          case PostgresTypes.jsonb:
              return toJson(value);
          case PostgresTypes.timestamp:
              return toTimestampString(value); // Format to be consistent with PostgREST
          case PostgresTypes.abstime: // To allow users to cast it based on Timezone
          case PostgresTypes.date: // To allow users to cast it based on Timezone
          case PostgresTypes.daterange:
          case PostgresTypes.int4range:
          case PostgresTypes.int8range:
          case PostgresTypes.money:
          case PostgresTypes.reltime: // To allow users to cast it based on Timezone
          case PostgresTypes.text:
          case PostgresTypes.time: // To allow users to cast it based on Timezone
          case PostgresTypes.timestamptz: // To allow users to cast it based on Timezone
          case PostgresTypes.timetz: // To allow users to cast it based on Timezone
          case PostgresTypes.tsrange:
          case PostgresTypes.tstzrange:
              return noop$1(value);
          default:
              // Return the value for remaining types
              return noop$1(value);
      }
  };
  const noop$1 = (value) => {
      return value;
  };
  const toBoolean = (value) => {
      switch (value) {
          case 't':
              return true;
          case 'f':
              return false;
          default:
              return value;
      }
  };
  const toNumber = (value) => {
      if (typeof value === 'string') {
          const parsedValue = parseFloat(value);
          if (!Number.isNaN(parsedValue)) {
              return parsedValue;
          }
      }
      return value;
  };
  const toJson = (value) => {
      if (typeof value === 'string') {
          try {
              return JSON.parse(value);
          }
          catch (error) {
              console.log(`JSON parse error: ${error}`);
              return value;
          }
      }
      return value;
  };
  /**
   * Converts a Postgres Array into a native JS array
   *
   * @example toArray('{}', 'int4')
   * //=> []
   * @example toArray('{"[2021-01-01,2021-12-31)","(2021-01-01,2021-12-32]"}', 'daterange')
   * //=> ['[2021-01-01,2021-12-31)', '(2021-01-01,2021-12-32]']
   * @example toArray([1,2,3,4], 'int4')
   * //=> [1,2,3,4]
   */
  const toArray = (value, type) => {
      if (typeof value !== 'string') {
          return value;
      }
      const lastIdx = value.length - 1;
      const closeBrace = value[lastIdx];
      const openBrace = value[0];
      // Confirm value is a Postgres array by checking curly brackets
      if (openBrace === '{' && closeBrace === '}') {
          let arr;
          const valTrim = value.slice(1, lastIdx);
          // TODO: find a better solution to separate Postgres array data
          try {
              arr = JSON.parse('[' + valTrim + ']');
          }
          catch (_) {
              // WARNING: splitting on comma does not cover all edge cases
              arr = valTrim ? valTrim.split(',') : [];
          }
          return arr.map((val) => convertCell(type, val));
      }
      return value;
  };
  /**
   * Fixes timestamp to be ISO-8601. Swaps the space between the date and time for a 'T'
   * See https://github.com/supabase/supabase/issues/18
   *
   * @example toTimestampString('2019-09-10 00:00:00')
   * //=> '2019-09-10T00:00:00'
   */
  const toTimestampString = (value) => {
      if (typeof value === 'string') {
          return value.replace(' ', 'T');
      }
      return value;
  };
  const httpEndpointURL = (socketUrl) => {
      const wsUrl = new URL(socketUrl);
      wsUrl.protocol = wsUrl.protocol.replace(/^ws/i, 'http');
      wsUrl.pathname = wsUrl.pathname
          .replace(/\/+$/, '') // remove all trailing slashes
          .replace(/\/socket\/websocket$/i, '') // remove the socket/websocket path
          .replace(/\/socket$/i, '') // remove the socket path
          .replace(/\/websocket$/i, ''); // remove the websocket path
      if (wsUrl.pathname === '' || wsUrl.pathname === '/') {
          wsUrl.pathname = '/api/broadcast';
      }
      else {
          wsUrl.pathname = wsUrl.pathname + '/api/broadcast';
      }
      return wsUrl.href;
  };

  class Push {
      /**
       * Initializes the Push
       *
       * @param channel The Channel
       * @param event The event, for example `"phx_join"`
       * @param payload The payload, for example `{user_id: 123}`
       * @param timeout The push timeout in milliseconds
       */
      constructor(channel, event, payload = {}, timeout = DEFAULT_TIMEOUT) {
          this.channel = channel;
          this.event = event;
          this.payload = payload;
          this.timeout = timeout;
          this.sent = false;
          this.timeoutTimer = undefined;
          this.ref = '';
          this.receivedResp = null;
          this.recHooks = [];
          this.refEvent = null;
      }
      resend(timeout) {
          this.timeout = timeout;
          this._cancelRefEvent();
          this.ref = '';
          this.refEvent = null;
          this.receivedResp = null;
          this.sent = false;
          this.send();
      }
      send() {
          if (this._hasReceived('timeout')) {
              return;
          }
          this.startTimeout();
          this.sent = true;
          this.channel.socket.push({
              topic: this.channel.topic,
              event: this.event,
              payload: this.payload,
              ref: this.ref,
              join_ref: this.channel._joinRef(),
          });
      }
      updatePayload(payload) {
          this.payload = Object.assign(Object.assign({}, this.payload), payload);
      }
      receive(status, callback) {
          var _a;
          if (this._hasReceived(status)) {
              callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
          }
          this.recHooks.push({ status, callback });
          return this;
      }
      startTimeout() {
          if (this.timeoutTimer) {
              return;
          }
          this.ref = this.channel.socket._makeRef();
          this.refEvent = this.channel._replyEventName(this.ref);
          const callback = (payload) => {
              this._cancelRefEvent();
              this._cancelTimeout();
              this.receivedResp = payload;
              this._matchReceive(payload);
          };
          this.channel._on(this.refEvent, {}, callback);
          this.timeoutTimer = setTimeout(() => {
              this.trigger('timeout', {});
          }, this.timeout);
      }
      trigger(status, response) {
          if (this.refEvent)
              this.channel._trigger(this.refEvent, { status, response });
      }
      destroy() {
          this._cancelRefEvent();
          this._cancelTimeout();
      }
      _cancelRefEvent() {
          if (!this.refEvent) {
              return;
          }
          this.channel._off(this.refEvent, {});
      }
      _cancelTimeout() {
          clearTimeout(this.timeoutTimer);
          this.timeoutTimer = undefined;
      }
      _matchReceive({ status, response }) {
          this.recHooks.filter((h) => h.status === status).forEach((h) => h.callback(response));
      }
      _hasReceived(status) {
          return this.receivedResp && this.receivedResp.status === status;
      }
  }

  /*
    This file draws heavily from https://github.com/phoenixframework/phoenix/blob/d344ec0a732ab4ee204215b31de69cf4be72e3bf/assets/js/phoenix/presence.js
    License: https://github.com/phoenixframework/phoenix/blob/d344ec0a732ab4ee204215b31de69cf4be72e3bf/LICENSE.md
  */
  exports.REALTIME_PRESENCE_LISTEN_EVENTS = void 0;
  (function (REALTIME_PRESENCE_LISTEN_EVENTS) {
      REALTIME_PRESENCE_LISTEN_EVENTS["SYNC"] = "sync";
      REALTIME_PRESENCE_LISTEN_EVENTS["JOIN"] = "join";
      REALTIME_PRESENCE_LISTEN_EVENTS["LEAVE"] = "leave";
  })(exports.REALTIME_PRESENCE_LISTEN_EVENTS || (exports.REALTIME_PRESENCE_LISTEN_EVENTS = {}));
  class RealtimePresence {
      /**
       * Creates a Presence helper that keeps the local presence state in sync with the server.
       *
       * @param channel - The realtime channel to bind to.
       * @param opts - Optional custom event names, e.g. `{ events: { state: 'state', diff: 'diff' } }`.
       *
       * @example
       * ```ts
       * const presence = new RealtimePresence(channel)
       *
       * channel.on('presence', ({ event, key }) => {
       *   console.log(`Presence ${event} on ${key}`)
       * })
       * ```
       */
      constructor(channel, opts) {
          this.channel = channel;
          this.state = {};
          this.pendingDiffs = [];
          this.joinRef = null;
          this.enabled = false;
          this.caller = {
              onJoin: () => { },
              onLeave: () => { },
              onSync: () => { },
          };
          const events = (opts === null || opts === void 0 ? void 0 : opts.events) || {
              state: 'presence_state',
              diff: 'presence_diff',
          };
          this.channel._on(events.state, {}, (newState) => {
              const { onJoin, onLeave, onSync } = this.caller;
              this.joinRef = this.channel._joinRef();
              this.state = RealtimePresence.syncState(this.state, newState, onJoin, onLeave);
              this.pendingDiffs.forEach((diff) => {
                  this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
              });
              this.pendingDiffs = [];
              onSync();
          });
          this.channel._on(events.diff, {}, (diff) => {
              const { onJoin, onLeave, onSync } = this.caller;
              if (this.inPendingSyncState()) {
                  this.pendingDiffs.push(diff);
              }
              else {
                  this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
                  onSync();
              }
          });
          this.onJoin((key, currentPresences, newPresences) => {
              this.channel._trigger('presence', {
                  event: 'join',
                  key,
                  currentPresences,
                  newPresences,
              });
          });
          this.onLeave((key, currentPresences, leftPresences) => {
              this.channel._trigger('presence', {
                  event: 'leave',
                  key,
                  currentPresences,
                  leftPresences,
              });
          });
          this.onSync(() => {
              this.channel._trigger('presence', { event: 'sync' });
          });
      }
      /**
       * Used to sync the list of presences on the server with the
       * client's state.
       *
       * An optional `onJoin` and `onLeave` callback can be provided to
       * react to changes in the client's local presences across
       * disconnects and reconnects with the server.
       *
       * @internal
       */
      static syncState(currentState, newState, onJoin, onLeave) {
          const state = this.cloneDeep(currentState);
          const transformedState = this.transformState(newState);
          const joins = {};
          const leaves = {};
          this.map(state, (key, presences) => {
              if (!transformedState[key]) {
                  leaves[key] = presences;
              }
          });
          this.map(transformedState, (key, newPresences) => {
              const currentPresences = state[key];
              if (currentPresences) {
                  const newPresenceRefs = newPresences.map((m) => m.presence_ref);
                  const curPresenceRefs = currentPresences.map((m) => m.presence_ref);
                  const joinedPresences = newPresences.filter((m) => curPresenceRefs.indexOf(m.presence_ref) < 0);
                  const leftPresences = currentPresences.filter((m) => newPresenceRefs.indexOf(m.presence_ref) < 0);
                  if (joinedPresences.length > 0) {
                      joins[key] = joinedPresences;
                  }
                  if (leftPresences.length > 0) {
                      leaves[key] = leftPresences;
                  }
              }
              else {
                  joins[key] = newPresences;
              }
          });
          return this.syncDiff(state, { joins, leaves }, onJoin, onLeave);
      }
      /**
       * Used to sync a diff of presence join and leave events from the
       * server, as they happen.
       *
       * Like `syncState`, `syncDiff` accepts optional `onJoin` and
       * `onLeave` callbacks to react to a user joining or leaving from a
       * device.
       *
       * @internal
       */
      static syncDiff(state, diff, onJoin, onLeave) {
          const { joins, leaves } = {
              joins: this.transformState(diff.joins),
              leaves: this.transformState(diff.leaves),
          };
          if (!onJoin) {
              onJoin = () => { };
          }
          if (!onLeave) {
              onLeave = () => { };
          }
          this.map(joins, (key, newPresences) => {
              var _a;
              const currentPresences = (_a = state[key]) !== null && _a !== void 0 ? _a : [];
              state[key] = this.cloneDeep(newPresences);
              if (currentPresences.length > 0) {
                  const joinedPresenceRefs = state[key].map((m) => m.presence_ref);
                  const curPresences = currentPresences.filter((m) => joinedPresenceRefs.indexOf(m.presence_ref) < 0);
                  state[key].unshift(...curPresences);
              }
              onJoin(key, currentPresences, newPresences);
          });
          this.map(leaves, (key, leftPresences) => {
              let currentPresences = state[key];
              if (!currentPresences)
                  return;
              const presenceRefsToRemove = leftPresences.map((m) => m.presence_ref);
              currentPresences = currentPresences.filter((m) => presenceRefsToRemove.indexOf(m.presence_ref) < 0);
              state[key] = currentPresences;
              onLeave(key, currentPresences, leftPresences);
              if (currentPresences.length === 0)
                  delete state[key];
          });
          return state;
      }
      /** @internal */
      static map(obj, func) {
          return Object.getOwnPropertyNames(obj).map((key) => func(key, obj[key]));
      }
      /**
       * Remove 'metas' key
       * Change 'phx_ref' to 'presence_ref'
       * Remove 'phx_ref' and 'phx_ref_prev'
       *
       * @example
       * // returns {
       *  abc123: [
       *    { presence_ref: '2', user_id: 1 },
       *    { presence_ref: '3', user_id: 2 }
       *  ]
       * }
       * RealtimePresence.transformState({
       *  abc123: {
       *    metas: [
       *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
       *      { phx_ref: '3', user_id: 2 }
       *    ]
       *  }
       * })
       *
       * @internal
       */
      static transformState(state) {
          state = this.cloneDeep(state);
          return Object.getOwnPropertyNames(state).reduce((newState, key) => {
              const presences = state[key];
              if ('metas' in presences) {
                  newState[key] = presences.metas.map((presence) => {
                      presence['presence_ref'] = presence['phx_ref'];
                      delete presence['phx_ref'];
                      delete presence['phx_ref_prev'];
                      return presence;
                  });
              }
              else {
                  newState[key] = presences;
              }
              return newState;
          }, {});
      }
      /** @internal */
      static cloneDeep(obj) {
          return JSON.parse(JSON.stringify(obj));
      }
      /** @internal */
      onJoin(callback) {
          this.caller.onJoin = callback;
      }
      /** @internal */
      onLeave(callback) {
          this.caller.onLeave = callback;
      }
      /** @internal */
      onSync(callback) {
          this.caller.onSync = callback;
      }
      /** @internal */
      inPendingSyncState() {
          return !this.joinRef || this.joinRef !== this.channel._joinRef();
      }
  }

  exports.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = void 0;
  (function (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT) {
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["ALL"] = "*";
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["INSERT"] = "INSERT";
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["UPDATE"] = "UPDATE";
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["DELETE"] = "DELETE";
  })(exports.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT || (exports.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {}));
  exports.REALTIME_LISTEN_TYPES = void 0;
  (function (REALTIME_LISTEN_TYPES) {
      REALTIME_LISTEN_TYPES["BROADCAST"] = "broadcast";
      REALTIME_LISTEN_TYPES["PRESENCE"] = "presence";
      REALTIME_LISTEN_TYPES["POSTGRES_CHANGES"] = "postgres_changes";
      REALTIME_LISTEN_TYPES["SYSTEM"] = "system";
  })(exports.REALTIME_LISTEN_TYPES || (exports.REALTIME_LISTEN_TYPES = {}));
  exports.REALTIME_SUBSCRIBE_STATES = void 0;
  (function (REALTIME_SUBSCRIBE_STATES) {
      REALTIME_SUBSCRIBE_STATES["SUBSCRIBED"] = "SUBSCRIBED";
      REALTIME_SUBSCRIBE_STATES["TIMED_OUT"] = "TIMED_OUT";
      REALTIME_SUBSCRIBE_STATES["CLOSED"] = "CLOSED";
      REALTIME_SUBSCRIBE_STATES["CHANNEL_ERROR"] = "CHANNEL_ERROR";
  })(exports.REALTIME_SUBSCRIBE_STATES || (exports.REALTIME_SUBSCRIBE_STATES = {}));
  const REALTIME_CHANNEL_STATES = CHANNEL_STATES;
  /** A channel is the basic building block of Realtime
   * and narrows the scope of data flow to subscribed clients.
   * You can think of a channel as a chatroom where participants are able to see who's online
   * and send and receive messages.
   */
  class RealtimeChannel {
      /**
       * Creates a channel that can broadcast messages, sync presence, and listen to Postgres changes.
       *
       * The topic determines which realtime stream you are subscribing to. Config options let you
       * enable acknowledgement for broadcasts, presence tracking, or private channels.
       *
       * @example
       * ```ts
       * import RealtimeClient from '@supabase/realtime-js'
       *
       * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
       *   params: { apikey: 'public-anon-key' },
       * })
       * const channel = new RealtimeChannel('realtime:public:messages', { config: {} }, client)
       * ```
       */
      constructor(
      /** Topic name can be any string. */
      topic, params = { config: {} }, socket) {
          var _a, _b;
          this.topic = topic;
          this.params = params;
          this.socket = socket;
          this.bindings = {};
          this.state = CHANNEL_STATES.closed;
          this.joinedOnce = false;
          this.pushBuffer = [];
          this.subTopic = topic.replace(/^realtime:/i, '');
          this.params.config = Object.assign({
              broadcast: { ack: false, self: false },
              presence: { key: '', enabled: false },
              private: false,
          }, params.config);
          this.timeout = this.socket.timeout;
          this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
          this.rejoinTimer = new Timer(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs);
          this.joinPush.receive('ok', () => {
              this.state = CHANNEL_STATES.joined;
              this.rejoinTimer.reset();
              this.pushBuffer.forEach((pushEvent) => pushEvent.send());
              this.pushBuffer = [];
          });
          this._onClose(() => {
              this.rejoinTimer.reset();
              this.socket.log('channel', `close ${this.topic} ${this._joinRef()}`);
              this.state = CHANNEL_STATES.closed;
              this.socket._remove(this);
          });
          this._onError((reason) => {
              if (this._isLeaving() || this._isClosed()) {
                  return;
              }
              this.socket.log('channel', `error ${this.topic}`, reason);
              this.state = CHANNEL_STATES.errored;
              this.rejoinTimer.scheduleTimeout();
          });
          this.joinPush.receive('timeout', () => {
              if (!this._isJoining()) {
                  return;
              }
              this.socket.log('channel', `timeout ${this.topic}`, this.joinPush.timeout);
              this.state = CHANNEL_STATES.errored;
              this.rejoinTimer.scheduleTimeout();
          });
          this.joinPush.receive('error', (reason) => {
              if (this._isLeaving() || this._isClosed()) {
                  return;
              }
              this.socket.log('channel', `error ${this.topic}`, reason);
              this.state = CHANNEL_STATES.errored;
              this.rejoinTimer.scheduleTimeout();
          });
          this._on(CHANNEL_EVENTS.reply, {}, (payload, ref) => {
              this._trigger(this._replyEventName(ref), payload);
          });
          this.presence = new RealtimePresence(this);
          this.broadcastEndpointURL = httpEndpointURL(this.socket.endPoint);
          this.private = this.params.config.private || false;
          if (!this.private && ((_b = (_a = this.params.config) === null || _a === void 0 ? void 0 : _a.broadcast) === null || _b === void 0 ? void 0 : _b.replay)) {
              throw `tried to use replay on public channel '${this.topic}'. It must be a private channel.`;
          }
      }
      /** Subscribe registers your client with the server */
      subscribe(callback, timeout = this.timeout) {
          var _a, _b, _c;
          if (!this.socket.isConnected()) {
              this.socket.connect();
          }
          if (this.state == CHANNEL_STATES.closed) {
              const { config: { broadcast, presence, private: isPrivate }, } = this.params;
              const postgres_changes = (_b = (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.map((r) => r.filter)) !== null && _b !== void 0 ? _b : [];
              const presence_enabled = (!!this.bindings[exports.REALTIME_LISTEN_TYPES.PRESENCE] &&
                  this.bindings[exports.REALTIME_LISTEN_TYPES.PRESENCE].length > 0) ||
                  ((_c = this.params.config.presence) === null || _c === void 0 ? void 0 : _c.enabled) === true;
              const accessTokenPayload = {};
              const config = {
                  broadcast,
                  presence: Object.assign(Object.assign({}, presence), { enabled: presence_enabled }),
                  postgres_changes,
                  private: isPrivate,
              };
              if (this.socket.accessTokenValue) {
                  accessTokenPayload.access_token = this.socket.accessTokenValue;
              }
              this._onError((e) => callback === null || callback === void 0 ? void 0 : callback(exports.REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, e));
              this._onClose(() => callback === null || callback === void 0 ? void 0 : callback(exports.REALTIME_SUBSCRIBE_STATES.CLOSED));
              this.updateJoinPayload(Object.assign({ config }, accessTokenPayload));
              this.joinedOnce = true;
              this._rejoin(timeout);
              this.joinPush
                  .receive('ok', async ({ postgres_changes }) => {
                  var _a;
                  this.socket.setAuth();
                  if (postgres_changes === undefined) {
                      callback === null || callback === void 0 ? void 0 : callback(exports.REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
                      return;
                  }
                  else {
                      const clientPostgresBindings = this.bindings.postgres_changes;
                      const bindingsLen = (_a = clientPostgresBindings === null || clientPostgresBindings === void 0 ? void 0 : clientPostgresBindings.length) !== null && _a !== void 0 ? _a : 0;
                      const newPostgresBindings = [];
                      for (let i = 0; i < bindingsLen; i++) {
                          const clientPostgresBinding = clientPostgresBindings[i];
                          const { filter: { event, schema, table, filter }, } = clientPostgresBinding;
                          const serverPostgresFilter = postgres_changes && postgres_changes[i];
                          if (serverPostgresFilter &&
                              serverPostgresFilter.event === event &&
                              serverPostgresFilter.schema === schema &&
                              serverPostgresFilter.table === table &&
                              serverPostgresFilter.filter === filter) {
                              newPostgresBindings.push(Object.assign(Object.assign({}, clientPostgresBinding), { id: serverPostgresFilter.id }));
                          }
                          else {
                              this.unsubscribe();
                              this.state = CHANNEL_STATES.errored;
                              callback === null || callback === void 0 ? void 0 : callback(exports.REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error('mismatch between server and client bindings for postgres changes'));
                              return;
                          }
                      }
                      this.bindings.postgres_changes = newPostgresBindings;
                      callback && callback(exports.REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
                      return;
                  }
              })
                  .receive('error', (error) => {
                  this.state = CHANNEL_STATES.errored;
                  callback === null || callback === void 0 ? void 0 : callback(exports.REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error(JSON.stringify(Object.values(error).join(', ') || 'error')));
                  return;
              })
                  .receive('timeout', () => {
                  callback === null || callback === void 0 ? void 0 : callback(exports.REALTIME_SUBSCRIBE_STATES.TIMED_OUT);
                  return;
              });
          }
          return this;
      }
      /**
       * Returns the current presence state for this channel.
       *
       * The shape is a map keyed by presence key (for example a user id) where each entry contains the
       * tracked metadata for that user.
       */
      presenceState() {
          return this.presence.state;
      }
      /**
       * Sends the supplied payload to the presence tracker so other subscribers can see that this
       * client is online. Use `untrack` to stop broadcasting presence for the same key.
       */
      async track(payload, opts = {}) {
          return await this.send({
              type: 'presence',
              event: 'track',
              payload,
          }, opts.timeout || this.timeout);
      }
      /**
       * Removes the current presence state for this client.
       */
      async untrack(opts = {}) {
          return await this.send({
              type: 'presence',
              event: 'untrack',
          }, opts);
      }
      on(type, filter, callback) {
          if (this.state === CHANNEL_STATES.joined && type === exports.REALTIME_LISTEN_TYPES.PRESENCE) {
              this.socket.log('channel', `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`);
              this.unsubscribe().then(() => this.subscribe());
          }
          return this._on(type, filter, callback);
      }
      /**
       * Sends a broadcast message explicitly via REST API.
       *
       * This method always uses the REST API endpoint regardless of WebSocket connection state.
       * Useful when you want to guarantee REST delivery or when gradually migrating from implicit REST fallback.
       *
       * @param event The name of the broadcast event
       * @param payload Payload to be sent (required)
       * @param opts Options including timeout
       * @returns Promise resolving to object with success status, and error details if failed
       */
      async httpSend(event, payload, opts = {}) {
          var _a;
          const authorization = this.socket.accessTokenValue
              ? `Bearer ${this.socket.accessTokenValue}`
              : '';
          if (payload === undefined || payload === null) {
              return Promise.reject('Payload is required for httpSend()');
          }
          const options = {
              method: 'POST',
              headers: {
                  Authorization: authorization,
                  apikey: this.socket.apiKey ? this.socket.apiKey : '',
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  messages: [
                      {
                          topic: this.subTopic,
                          event,
                          payload: payload,
                          private: this.private,
                      },
                  ],
              }),
          };
          const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
          if (response.status === 202) {
              return { success: true };
          }
          let errorMessage = response.statusText;
          try {
              const errorBody = await response.json();
              errorMessage = errorBody.error || errorBody.message || errorMessage;
          }
          catch (_b) { }
          return Promise.reject(new Error(errorMessage));
      }
      /**
       * Sends a message into the channel.
       *
       * @param args Arguments to send to channel
       * @param args.type The type of event to send
       * @param args.event The name of the event being sent
       * @param args.payload Payload to be sent
       * @param opts Options to be used during the send process
       */
      async send(args, opts = {}) {
          var _a, _b;
          if (!this._canPush() && args.type === 'broadcast') {
              console.warn('Realtime send() is automatically falling back to REST API. ' +
                  'This behavior will be deprecated in the future. ' +
                  'Please use httpSend() explicitly for REST delivery.');
              const { event, payload: endpoint_payload } = args;
              const authorization = this.socket.accessTokenValue
                  ? `Bearer ${this.socket.accessTokenValue}`
                  : '';
              const options = {
                  method: 'POST',
                  headers: {
                      Authorization: authorization,
                      apikey: this.socket.apiKey ? this.socket.apiKey : '',
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      messages: [
                          {
                              topic: this.subTopic,
                              event,
                              payload: endpoint_payload,
                              private: this.private,
                          },
                      ],
                  }),
              };
              try {
                  const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
                  await ((_b = response.body) === null || _b === void 0 ? void 0 : _b.cancel());
                  return response.ok ? 'ok' : 'error';
              }
              catch (error) {
                  if (error.name === 'AbortError') {
                      return 'timed out';
                  }
                  else {
                      return 'error';
                  }
              }
          }
          else {
              return new Promise((resolve) => {
                  var _a, _b, _c;
                  const push = this._push(args.type, args, opts.timeout || this.timeout);
                  if (args.type === 'broadcast' && !((_c = (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.broadcast) === null || _c === void 0 ? void 0 : _c.ack)) {
                      resolve('ok');
                  }
                  push.receive('ok', () => resolve('ok'));
                  push.receive('error', () => resolve('error'));
                  push.receive('timeout', () => resolve('timed out'));
              });
          }
      }
      /**
       * Updates the payload that will be sent the next time the channel joins (reconnects).
       * Useful for rotating access tokens or updating config without re-creating the channel.
       */
      updateJoinPayload(payload) {
          this.joinPush.updatePayload(payload);
      }
      /**
       * Leaves the channel.
       *
       * Unsubscribes from server events, and instructs channel to terminate on server.
       * Triggers onClose() hooks.
       *
       * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
       * channel.unsubscribe().receive("ok", () => alert("left!") )
       */
      unsubscribe(timeout = this.timeout) {
          this.state = CHANNEL_STATES.leaving;
          const onClose = () => {
              this.socket.log('channel', `leave ${this.topic}`);
              this._trigger(CHANNEL_EVENTS.close, 'leave', this._joinRef());
          };
          this.joinPush.destroy();
          let leavePush = null;
          return new Promise((resolve) => {
              leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
              leavePush
                  .receive('ok', () => {
                  onClose();
                  resolve('ok');
              })
                  .receive('timeout', () => {
                  onClose();
                  resolve('timed out');
              })
                  .receive('error', () => {
                  resolve('error');
              });
              leavePush.send();
              if (!this._canPush()) {
                  leavePush.trigger('ok', {});
              }
          }).finally(() => {
              leavePush === null || leavePush === void 0 ? void 0 : leavePush.destroy();
          });
      }
      /**
       * Teardown the channel.
       *
       * Destroys and stops related timers.
       */
      teardown() {
          this.pushBuffer.forEach((push) => push.destroy());
          this.pushBuffer = [];
          this.rejoinTimer.reset();
          this.joinPush.destroy();
          this.state = CHANNEL_STATES.closed;
          this.bindings = {};
      }
      /** @internal */
      async _fetchWithTimeout(url, options, timeout) {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), timeout);
          const response = await this.socket.fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
          clearTimeout(id);
          return response;
      }
      /** @internal */
      _push(event, payload, timeout = this.timeout) {
          if (!this.joinedOnce) {
              throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
          }
          let pushEvent = new Push(this, event, payload, timeout);
          if (this._canPush()) {
              pushEvent.send();
          }
          else {
              this._addToPushBuffer(pushEvent);
          }
          return pushEvent;
      }
      /** @internal */
      _addToPushBuffer(pushEvent) {
          pushEvent.startTimeout();
          this.pushBuffer.push(pushEvent);
          // Enforce buffer size limit
          if (this.pushBuffer.length > MAX_PUSH_BUFFER_SIZE) {
              const removedPush = this.pushBuffer.shift();
              if (removedPush) {
                  removedPush.destroy();
                  this.socket.log('channel', `discarded push due to buffer overflow: ${removedPush.event}`, removedPush.payload);
              }
          }
      }
      /**
       * Overridable message hook
       *
       * Receives all events for specialized message handling before dispatching to the channel callbacks.
       * Must return the payload, modified or unmodified.
       *
       * @internal
       */
      _onMessage(_event, payload, _ref) {
          return payload;
      }
      /** @internal */
      _isMember(topic) {
          return this.topic === topic;
      }
      /** @internal */
      _joinRef() {
          return this.joinPush.ref;
      }
      /** @internal */
      _trigger(type, payload, ref) {
          var _a, _b;
          const typeLower = type.toLocaleLowerCase();
          const { close, error, leave, join } = CHANNEL_EVENTS;
          const events = [close, error, leave, join];
          if (ref && events.indexOf(typeLower) >= 0 && ref !== this._joinRef()) {
              return;
          }
          let handledPayload = this._onMessage(typeLower, payload, ref);
          if (payload && !handledPayload) {
              throw 'channel onMessage callbacks must return the payload, modified or unmodified';
          }
          if (['insert', 'update', 'delete'].includes(typeLower)) {
              (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.filter((bind) => {
                  var _a, _b, _c;
                  return ((_a = bind.filter) === null || _a === void 0 ? void 0 : _a.event) === '*' || ((_c = (_b = bind.filter) === null || _b === void 0 ? void 0 : _b.event) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase()) === typeLower;
              }).map((bind) => bind.callback(handledPayload, ref));
          }
          else {
              (_b = this.bindings[typeLower]) === null || _b === void 0 ? void 0 : _b.filter((bind) => {
                  var _a, _b, _c, _d, _e, _f;
                  if (['broadcast', 'presence', 'postgres_changes'].includes(typeLower)) {
                      if ('id' in bind) {
                          const bindId = bind.id;
                          const bindEvent = (_a = bind.filter) === null || _a === void 0 ? void 0 : _a.event;
                          return (bindId &&
                              ((_b = payload.ids) === null || _b === void 0 ? void 0 : _b.includes(bindId)) &&
                              (bindEvent === '*' ||
                                  (bindEvent === null || bindEvent === void 0 ? void 0 : bindEvent.toLocaleLowerCase()) === ((_c = payload.data) === null || _c === void 0 ? void 0 : _c.type.toLocaleLowerCase())));
                      }
                      else {
                          const bindEvent = (_e = (_d = bind === null || bind === void 0 ? void 0 : bind.filter) === null || _d === void 0 ? void 0 : _d.event) === null || _e === void 0 ? void 0 : _e.toLocaleLowerCase();
                          return bindEvent === '*' || bindEvent === ((_f = payload === null || payload === void 0 ? void 0 : payload.event) === null || _f === void 0 ? void 0 : _f.toLocaleLowerCase());
                      }
                  }
                  else {
                      return bind.type.toLocaleLowerCase() === typeLower;
                  }
              }).map((bind) => {
                  if (typeof handledPayload === 'object' && 'ids' in handledPayload) {
                      const postgresChanges = handledPayload.data;
                      const { schema, table, commit_timestamp, type, errors } = postgresChanges;
                      const enrichedPayload = {
                          schema: schema,
                          table: table,
                          commit_timestamp: commit_timestamp,
                          eventType: type,
                          new: {},
                          old: {},
                          errors: errors,
                      };
                      handledPayload = Object.assign(Object.assign({}, enrichedPayload), this._getPayloadRecords(postgresChanges));
                  }
                  bind.callback(handledPayload, ref);
              });
          }
      }
      /** @internal */
      _isClosed() {
          return this.state === CHANNEL_STATES.closed;
      }
      /** @internal */
      _isJoined() {
          return this.state === CHANNEL_STATES.joined;
      }
      /** @internal */
      _isJoining() {
          return this.state === CHANNEL_STATES.joining;
      }
      /** @internal */
      _isLeaving() {
          return this.state === CHANNEL_STATES.leaving;
      }
      /** @internal */
      _replyEventName(ref) {
          return `chan_reply_${ref}`;
      }
      /** @internal */
      _on(type, filter, callback) {
          const typeLower = type.toLocaleLowerCase();
          const binding = {
              type: typeLower,
              filter: filter,
              callback: callback,
          };
          if (this.bindings[typeLower]) {
              this.bindings[typeLower].push(binding);
          }
          else {
              this.bindings[typeLower] = [binding];
          }
          return this;
      }
      /** @internal */
      _off(type, filter) {
          const typeLower = type.toLocaleLowerCase();
          if (this.bindings[typeLower]) {
              this.bindings[typeLower] = this.bindings[typeLower].filter((bind) => {
                  var _a;
                  return !(((_a = bind.type) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === typeLower &&
                      RealtimeChannel.isEqual(bind.filter, filter));
              });
          }
          return this;
      }
      /** @internal */
      static isEqual(obj1, obj2) {
          if (Object.keys(obj1).length !== Object.keys(obj2).length) {
              return false;
          }
          for (const k in obj1) {
              if (obj1[k] !== obj2[k]) {
                  return false;
              }
          }
          return true;
      }
      /** @internal */
      _rejoinUntilConnected() {
          this.rejoinTimer.scheduleTimeout();
          if (this.socket.isConnected()) {
              this._rejoin();
          }
      }
      /**
       * Registers a callback that will be executed when the channel closes.
       *
       * @internal
       */
      _onClose(callback) {
          this._on(CHANNEL_EVENTS.close, {}, callback);
      }
      /**
       * Registers a callback that will be executed when the channel encounteres an error.
       *
       * @internal
       */
      _onError(callback) {
          this._on(CHANNEL_EVENTS.error, {}, (reason) => callback(reason));
      }
      /**
       * Returns `true` if the socket is connected and the channel has been joined.
       *
       * @internal
       */
      _canPush() {
          return this.socket.isConnected() && this._isJoined();
      }
      /** @internal */
      _rejoin(timeout = this.timeout) {
          if (this._isLeaving()) {
              return;
          }
          this.socket._leaveOpenTopic(this.topic);
          this.state = CHANNEL_STATES.joining;
          this.joinPush.resend(timeout);
      }
      /** @internal */
      _getPayloadRecords(payload) {
          const records = {
              new: {},
              old: {},
          };
          if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
              records.new = convertChangeData(payload.columns, payload.record);
          }
          if (payload.type === 'UPDATE' || payload.type === 'DELETE') {
              records.old = convertChangeData(payload.columns, payload.old_record);
          }
          return records;
      }
  }

  const noop = () => { };
  // Connection-related constants
  const CONNECTION_TIMEOUTS = {
      HEARTBEAT_INTERVAL: 25000,
      RECONNECT_DELAY: 10,
      HEARTBEAT_TIMEOUT_FALLBACK: 100,
  };
  const RECONNECT_INTERVALS = [1000, 2000, 5000, 10000];
  const DEFAULT_RECONNECT_FALLBACK = 10000;
  const WORKER_SCRIPT = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
  class RealtimeClient {
      /**
       * Initializes the Socket.
       *
       * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
       * @param httpEndpoint The string HTTP endpoint, ie, "https://example.com", "/" (inherited host & protocol)
       * @param options.transport The Websocket Transport, for example WebSocket. This can be a custom implementation
       * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
       * @param options.params The optional params to pass when connecting.
       * @param options.headers Deprecated: headers cannot be set on websocket connections and this option will be removed in the future.
       * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
       * @param options.heartbeatCallback The optional function to handle heartbeat status.
       * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
       * @param options.logLevel Sets the log level for Realtime
       * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
       * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
       * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
       * @param options.worker Use Web Worker to set a side flow. Defaults to false.
       * @param options.workerUrl The URL of the worker script. Defaults to https://realtime.supabase.com/worker.js that includes a heartbeat event call to keep the connection alive.
       * @example
       * ```ts
       * import RealtimeClient from '@supabase/realtime-js'
       *
       * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
       *   params: { apikey: 'public-anon-key' },
       * })
       * client.connect()
       * ```
       */
      constructor(endPoint, options) {
          var _a;
          this.accessTokenValue = null;
          this.apiKey = null;
          this.channels = new Array();
          this.endPoint = '';
          this.httpEndpoint = '';
          /** @deprecated headers cannot be set on websocket connections */
          this.headers = {};
          this.params = {};
          this.timeout = DEFAULT_TIMEOUT;
          this.transport = null;
          this.heartbeatIntervalMs = CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
          this.heartbeatTimer = undefined;
          this.pendingHeartbeatRef = null;
          this.heartbeatCallback = noop;
          this.ref = 0;
          this.reconnectTimer = null;
          this.vsn = DEFAULT_VSN;
          this.logger = noop;
          this.conn = null;
          this.sendBuffer = [];
          this.serializer = new Serializer();
          this.stateChangeCallbacks = {
              open: [],
              close: [],
              error: [],
              message: [],
          };
          this.accessToken = null;
          this._connectionState = 'disconnected';
          this._wasManualDisconnect = false;
          this._authPromise = null;
          /**
           * Use either custom fetch, if provided, or default fetch to make HTTP requests
           *
           * @internal
           */
          this._resolveFetch = (customFetch) => {
              if (customFetch) {
                  return (...args) => customFetch(...args);
              }
              return (...args) => fetch(...args);
          };
          // Validate required parameters
          if (!((_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.apikey)) {
              throw new Error('API key is required to connect to Realtime');
          }
          this.apiKey = options.params.apikey;
          // Initialize endpoint URLs
          this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`;
          this.httpEndpoint = httpEndpointURL(endPoint);
          this._initializeOptions(options);
          this._setupReconnectionTimer();
          this.fetch = this._resolveFetch(options === null || options === void 0 ? void 0 : options.fetch);
      }
      /**
       * Connects the socket, unless already connected.
       */
      connect() {
          // Skip if already connecting, disconnecting, or connected
          if (this.isConnecting() ||
              this.isDisconnecting() ||
              (this.conn !== null && this.isConnected())) {
              return;
          }
          this._setConnectionState('connecting');
          // Trigger auth if needed and not already in progress
          // This ensures auth is called for standalone RealtimeClient usage
          // while avoiding race conditions with SupabaseClient's immediate setAuth call
          if (this.accessToken && !this._authPromise) {
              this._setAuthSafely('connect');
          }
          // Establish WebSocket connection
          if (this.transport) {
              // Use custom transport if provided
              this.conn = new this.transport(this.endpointURL());
          }
          else {
              // Try to use native WebSocket
              try {
                  this.conn = WebSocketFactory.createWebSocket(this.endpointURL());
              }
              catch (error) {
                  this._setConnectionState('disconnected');
                  const errorMessage = error.message;
                  // Provide helpful error message based on environment
                  if (errorMessage.includes('Node.js')) {
                      throw new Error(`${errorMessage}\n\n` +
                          'To use Realtime in Node.js, you need to provide a WebSocket implementation:\n\n' +
                          'Option 1: Use Node.js 22+ which has native WebSocket support\n' +
                          'Option 2: Install and provide the "ws" package:\n\n' +
                          '  npm install ws\n\n' +
                          '  import ws from "ws"\n' +
                          '  const client = new RealtimeClient(url, {\n' +
                          '    ...options,\n' +
                          '    transport: ws\n' +
                          '  })');
                  }
                  throw new Error(`WebSocket not available: ${errorMessage}`);
              }
          }
          this._setupConnectionHandlers();
      }
      /**
       * Returns the URL of the websocket.
       * @returns string The URL of the websocket.
       */
      endpointURL() {
          return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: this.vsn }));
      }
      /**
       * Disconnects the socket.
       *
       * @param code A numeric status code to send on disconnect.
       * @param reason A custom reason for the disconnect.
       */
      disconnect(code, reason) {
          if (this.isDisconnecting()) {
              return;
          }
          this._setConnectionState('disconnecting', true);
          if (this.conn) {
              // Setup fallback timer to prevent hanging in disconnecting state
              const fallbackTimer = setTimeout(() => {
                  this._setConnectionState('disconnected');
              }, 100);
              this.conn.onclose = () => {
                  clearTimeout(fallbackTimer);
                  this._setConnectionState('disconnected');
              };
              // Close the WebSocket connection if close method exists
              if (typeof this.conn.close === 'function') {
                  if (code) {
                      this.conn.close(code, reason !== null && reason !== void 0 ? reason : '');
                  }
                  else {
                      this.conn.close();
                  }
              }
              this._teardownConnection();
          }
          else {
              this._setConnectionState('disconnected');
          }
      }
      /**
       * Returns all created channels
       */
      getChannels() {
          return this.channels;
      }
      /**
       * Unsubscribes and removes a single channel
       * @param channel A RealtimeChannel instance
       */
      async removeChannel(channel) {
          const status = await channel.unsubscribe();
          if (this.channels.length === 0) {
              this.disconnect();
          }
          return status;
      }
      /**
       * Unsubscribes and removes all channels
       */
      async removeAllChannels() {
          const values_1 = await Promise.all(this.channels.map((channel) => channel.unsubscribe()));
          this.channels = [];
          this.disconnect();
          return values_1;
      }
      /**
       * Logs the message.
       *
       * For customized logging, `this.logger` can be overridden.
       */
      log(kind, msg, data) {
          this.logger(kind, msg, data);
      }
      /**
       * Returns the current state of the socket.
       */
      connectionState() {
          switch (this.conn && this.conn.readyState) {
              case SOCKET_STATES.connecting:
                  return CONNECTION_STATE.Connecting;
              case SOCKET_STATES.open:
                  return CONNECTION_STATE.Open;
              case SOCKET_STATES.closing:
                  return CONNECTION_STATE.Closing;
              default:
                  return CONNECTION_STATE.Closed;
          }
      }
      /**
       * Returns `true` is the connection is open.
       */
      isConnected() {
          return this.connectionState() === CONNECTION_STATE.Open;
      }
      /**
       * Returns `true` if the connection is currently connecting.
       */
      isConnecting() {
          return this._connectionState === 'connecting';
      }
      /**
       * Returns `true` if the connection is currently disconnecting.
       */
      isDisconnecting() {
          return this._connectionState === 'disconnecting';
      }
      /**
       * Creates (or reuses) a {@link RealtimeChannel} for the provided topic.
       *
       * Topics are automatically prefixed with `realtime:` to match the Realtime service.
       * If a channel with the same topic already exists it will be returned instead of creating
       * a duplicate connection.
       */
      channel(topic, params = { config: {} }) {
          const realtimeTopic = `realtime:${topic}`;
          const exists = this.getChannels().find((c) => c.topic === realtimeTopic);
          if (!exists) {
              const chan = new RealtimeChannel(`realtime:${topic}`, params, this);
              this.channels.push(chan);
              return chan;
          }
          else {
              return exists;
          }
      }
      /**
       * Push out a message if the socket is connected.
       *
       * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
       */
      push(data) {
          const { topic, event, payload, ref } = data;
          const callback = () => {
              this.encode(data, (result) => {
                  var _a;
                  (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
              });
          };
          this.log('push', `${topic} ${event} (${ref})`, payload);
          if (this.isConnected()) {
              callback();
          }
          else {
              this.sendBuffer.push(callback);
          }
      }
      /**
       * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
       *
       * If param is null it will use the `accessToken` callback function or the token set on the client.
       *
       * On callback used, it will set the value of the token internal to the client.
       *
       * @param token A JWT string to override the token set on the client.
       */
      async setAuth(token = null) {
          this._authPromise = this._performAuth(token);
          try {
              await this._authPromise;
          }
          finally {
              this._authPromise = null;
          }
      }
      /**
       * Sends a heartbeat message if the socket is connected.
       */
      async sendHeartbeat() {
          var _a;
          if (!this.isConnected()) {
              try {
                  this.heartbeatCallback('disconnected');
              }
              catch (e) {
                  this.log('error', 'error in heartbeat callback', e);
              }
              return;
          }
          // Handle heartbeat timeout and force reconnection if needed
          if (this.pendingHeartbeatRef) {
              this.pendingHeartbeatRef = null;
              this.log('transport', 'heartbeat timeout. Attempting to re-establish connection');
              try {
                  this.heartbeatCallback('timeout');
              }
              catch (e) {
                  this.log('error', 'error in heartbeat callback', e);
              }
              // Force reconnection after heartbeat timeout
              this._wasManualDisconnect = false;
              (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(WS_CLOSE_NORMAL, 'heartbeat timeout');
              setTimeout(() => {
                  var _a;
                  if (!this.isConnected()) {
                      (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.scheduleTimeout();
                  }
              }, CONNECTION_TIMEOUTS.HEARTBEAT_TIMEOUT_FALLBACK);
              return;
          }
          // Send heartbeat message to server
          this.pendingHeartbeatRef = this._makeRef();
          this.push({
              topic: 'phoenix',
              event: 'heartbeat',
              payload: {},
              ref: this.pendingHeartbeatRef,
          });
          try {
              this.heartbeatCallback('sent');
          }
          catch (e) {
              this.log('error', 'error in heartbeat callback', e);
          }
          this._setAuthSafely('heartbeat');
      }
      /**
       * Sets a callback that receives lifecycle events for internal heartbeat messages.
       * Useful for instrumenting connection health (e.g. sent/ok/timeout/disconnected).
       */
      onHeartbeat(callback) {
          this.heartbeatCallback = callback;
      }
      /**
       * Flushes send buffer
       */
      flushSendBuffer() {
          if (this.isConnected() && this.sendBuffer.length > 0) {
              this.sendBuffer.forEach((callback) => callback());
              this.sendBuffer = [];
          }
      }
      /**
       * Return the next message ref, accounting for overflows
       *
       * @internal
       */
      _makeRef() {
          let newRef = this.ref + 1;
          if (newRef === this.ref) {
              this.ref = 0;
          }
          else {
              this.ref = newRef;
          }
          return this.ref.toString();
      }
      /**
       * Unsubscribe from channels with the specified topic.
       *
       * @internal
       */
      _leaveOpenTopic(topic) {
          let dupChannel = this.channels.find((c) => c.topic === topic && (c._isJoined() || c._isJoining()));
          if (dupChannel) {
              this.log('transport', `leaving duplicate topic "${topic}"`);
              dupChannel.unsubscribe();
          }
      }
      /**
       * Removes a subscription from the socket.
       *
       * @param channel An open subscription.
       *
       * @internal
       */
      _remove(channel) {
          this.channels = this.channels.filter((c) => c.topic !== channel.topic);
      }
      /** @internal */
      _onConnMessage(rawMessage) {
          this.decode(rawMessage.data, (msg) => {
              // Handle heartbeat responses
              if (msg.topic === 'phoenix' && msg.event === 'phx_reply') {
                  try {
                      this.heartbeatCallback(msg.payload.status === 'ok' ? 'ok' : 'error');
                  }
                  catch (e) {
                      this.log('error', 'error in heartbeat callback', e);
                  }
              }
              // Handle pending heartbeat reference cleanup
              if (msg.ref && msg.ref === this.pendingHeartbeatRef) {
                  this.pendingHeartbeatRef = null;
              }
              // Log incoming message
              const { topic, event, payload, ref } = msg;
              const refString = ref ? `(${ref})` : '';
              const status = payload.status || '';
              this.log('receive', `${status} ${topic} ${event} ${refString}`.trim(), payload);
              // Route message to appropriate channels
              this.channels
                  .filter((channel) => channel._isMember(topic))
                  .forEach((channel) => channel._trigger(event, payload, ref));
              this._triggerStateCallbacks('message', msg);
          });
      }
      /**
       * Clear specific timer
       * @internal
       */
      _clearTimer(timer) {
          var _a;
          if (timer === 'heartbeat' && this.heartbeatTimer) {
              clearInterval(this.heartbeatTimer);
              this.heartbeatTimer = undefined;
          }
          else if (timer === 'reconnect') {
              (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.reset();
          }
      }
      /**
       * Clear all timers
       * @internal
       */
      _clearAllTimers() {
          this._clearTimer('heartbeat');
          this._clearTimer('reconnect');
      }
      /**
       * Setup connection handlers for WebSocket events
       * @internal
       */
      _setupConnectionHandlers() {
          if (!this.conn)
              return;
          // Set binary type if supported (browsers and most WebSocket implementations)
          if ('binaryType' in this.conn) {
              this.conn.binaryType = 'arraybuffer';
          }
          this.conn.onopen = () => this._onConnOpen();
          this.conn.onerror = (error) => this._onConnError(error);
          this.conn.onmessage = (event) => this._onConnMessage(event);
          this.conn.onclose = (event) => this._onConnClose(event);
      }
      /**
       * Teardown connection and cleanup resources
       * @internal
       */
      _teardownConnection() {
          if (this.conn) {
              if (this.conn.readyState === SOCKET_STATES.open ||
                  this.conn.readyState === SOCKET_STATES.connecting) {
                  try {
                      this.conn.close();
                  }
                  catch (e) {
                      this.log('error', 'Error closing connection', e);
                  }
              }
              this.conn.onopen = null;
              this.conn.onerror = null;
              this.conn.onmessage = null;
              this.conn.onclose = null;
              this.conn = null;
          }
          this._clearAllTimers();
          this.channels.forEach((channel) => channel.teardown());
      }
      /** @internal */
      _onConnOpen() {
          this._setConnectionState('connected');
          this.log('transport', `connected to ${this.endpointURL()}`);
          // Wait for any pending auth operations before flushing send buffer
          // This ensures channel join messages include the correct access token
          const authPromise = this._authPromise ||
              (this.accessToken && !this.accessTokenValue ? this.setAuth() : Promise.resolve());
          authPromise
              .then(() => {
              this.flushSendBuffer();
          })
              .catch((e) => {
              this.log('error', 'error waiting for auth on connect', e);
              // Proceed anyway to avoid hanging connections
              this.flushSendBuffer();
          });
          this._clearTimer('reconnect');
          if (!this.worker) {
              this._startHeartbeat();
          }
          else {
              if (!this.workerRef) {
                  this._startWorkerHeartbeat();
              }
          }
          this._triggerStateCallbacks('open');
      }
      /** @internal */
      _startHeartbeat() {
          this.heartbeatTimer && clearInterval(this.heartbeatTimer);
          this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
      }
      /** @internal */
      _startWorkerHeartbeat() {
          if (this.workerUrl) {
              this.log('worker', `starting worker for from ${this.workerUrl}`);
          }
          else {
              this.log('worker', `starting default worker`);
          }
          const objectUrl = this._workerObjectUrl(this.workerUrl);
          this.workerRef = new Worker(objectUrl);
          this.workerRef.onerror = (error) => {
              this.log('worker', 'worker error', error.message);
              this.workerRef.terminate();
          };
          this.workerRef.onmessage = (event) => {
              if (event.data.event === 'keepAlive') {
                  this.sendHeartbeat();
              }
          };
          this.workerRef.postMessage({
              event: 'start',
              interval: this.heartbeatIntervalMs,
          });
      }
      /** @internal */
      _onConnClose(event) {
          var _a;
          this._setConnectionState('disconnected');
          this.log('transport', 'close', event);
          this._triggerChanError();
          this._clearTimer('heartbeat');
          // Only schedule reconnection if it wasn't a manual disconnect
          if (!this._wasManualDisconnect) {
              (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.scheduleTimeout();
          }
          this._triggerStateCallbacks('close', event);
      }
      /** @internal */
      _onConnError(error) {
          this._setConnectionState('disconnected');
          this.log('transport', `${error}`);
          this._triggerChanError();
          this._triggerStateCallbacks('error', error);
      }
      /** @internal */
      _triggerChanError() {
          this.channels.forEach((channel) => channel._trigger(CHANNEL_EVENTS.error));
      }
      /** @internal */
      _appendParams(url, params) {
          if (Object.keys(params).length === 0) {
              return url;
          }
          const prefix = url.match(/\?/) ? '&' : '?';
          const query = new URLSearchParams(params);
          return `${url}${prefix}${query}`;
      }
      _workerObjectUrl(url) {
          let result_url;
          if (url) {
              result_url = url;
          }
          else {
              const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
              result_url = URL.createObjectURL(blob);
          }
          return result_url;
      }
      /**
       * Set connection state with proper state management
       * @internal
       */
      _setConnectionState(state, manual = false) {
          this._connectionState = state;
          if (state === 'connecting') {
              this._wasManualDisconnect = false;
          }
          else if (state === 'disconnecting') {
              this._wasManualDisconnect = manual;
          }
      }
      /**
       * Perform the actual auth operation
       * @internal
       */
      async _performAuth(token = null) {
          let tokenToSend;
          if (token) {
              tokenToSend = token;
          }
          else if (this.accessToken) {
              // Always call the accessToken callback to get fresh token
              tokenToSend = await this.accessToken();
          }
          else {
              tokenToSend = this.accessTokenValue;
          }
          if (this.accessTokenValue != tokenToSend) {
              this.accessTokenValue = tokenToSend;
              this.channels.forEach((channel) => {
                  const payload = {
                      access_token: tokenToSend,
                      version: DEFAULT_VERSION,
                  };
                  tokenToSend && channel.updateJoinPayload(payload);
                  if (channel.joinedOnce && channel._isJoined()) {
                      channel._push(CHANNEL_EVENTS.access_token, {
                          access_token: tokenToSend,
                      });
                  }
              });
          }
      }
      /**
       * Wait for any in-flight auth operations to complete
       * @internal
       */
      async _waitForAuthIfNeeded() {
          if (this._authPromise) {
              await this._authPromise;
          }
      }
      /**
       * Safely call setAuth with standardized error handling
       * @internal
       */
      _setAuthSafely(context = 'general') {
          this.setAuth().catch((e) => {
              this.log('error', `error setting auth in ${context}`, e);
          });
      }
      /**
       * Trigger state change callbacks with proper error handling
       * @internal
       */
      _triggerStateCallbacks(event, data) {
          try {
              this.stateChangeCallbacks[event].forEach((callback) => {
                  try {
                      callback(data);
                  }
                  catch (e) {
                      this.log('error', `error in ${event} callback`, e);
                  }
              });
          }
          catch (e) {
              this.log('error', `error triggering ${event} callbacks`, e);
          }
      }
      /**
       * Setup reconnection timer with proper configuration
       * @internal
       */
      _setupReconnectionTimer() {
          this.reconnectTimer = new Timer(async () => {
              setTimeout(async () => {
                  await this._waitForAuthIfNeeded();
                  if (!this.isConnected()) {
                      this.connect();
                  }
              }, CONNECTION_TIMEOUTS.RECONNECT_DELAY);
          }, this.reconnectAfterMs);
      }
      /**
       * Initialize client options with defaults
       * @internal
       */
      _initializeOptions(options) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
          // Set defaults
          this.transport = (_a = options === null || options === void 0 ? void 0 : options.transport) !== null && _a !== void 0 ? _a : null;
          this.timeout = (_b = options === null || options === void 0 ? void 0 : options.timeout) !== null && _b !== void 0 ? _b : DEFAULT_TIMEOUT;
          this.heartbeatIntervalMs =
              (_c = options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs) !== null && _c !== void 0 ? _c : CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
          this.worker = (_d = options === null || options === void 0 ? void 0 : options.worker) !== null && _d !== void 0 ? _d : false;
          this.accessToken = (_e = options === null || options === void 0 ? void 0 : options.accessToken) !== null && _e !== void 0 ? _e : null;
          this.heartbeatCallback = (_f = options === null || options === void 0 ? void 0 : options.heartbeatCallback) !== null && _f !== void 0 ? _f : noop;
          this.vsn = (_g = options === null || options === void 0 ? void 0 : options.vsn) !== null && _g !== void 0 ? _g : DEFAULT_VSN;
          // Handle special cases
          if (options === null || options === void 0 ? void 0 : options.params)
              this.params = options.params;
          if (options === null || options === void 0 ? void 0 : options.logger)
              this.logger = options.logger;
          if ((options === null || options === void 0 ? void 0 : options.logLevel) || (options === null || options === void 0 ? void 0 : options.log_level)) {
              this.logLevel = options.logLevel || options.log_level;
              this.params = Object.assign(Object.assign({}, this.params), { log_level: this.logLevel });
          }
          // Set up functions with defaults
          this.reconnectAfterMs =
              (_h = options === null || options === void 0 ? void 0 : options.reconnectAfterMs) !== null && _h !== void 0 ? _h : ((tries) => {
                  return RECONNECT_INTERVALS[tries - 1] || DEFAULT_RECONNECT_FALLBACK;
              });
          switch (this.vsn) {
              case VSN_1_0_0:
                  this.encode =
                      (_j = options === null || options === void 0 ? void 0 : options.encode) !== null && _j !== void 0 ? _j : ((payload, callback) => {
                          return callback(JSON.stringify(payload));
                      });
                  this.decode =
                      (_k = options === null || options === void 0 ? void 0 : options.decode) !== null && _k !== void 0 ? _k : ((payload, callback) => {
                          return callback(JSON.parse(payload));
                      });
                  break;
              case VSN_2_0_0:
                  this.encode = (_l = options === null || options === void 0 ? void 0 : options.encode) !== null && _l !== void 0 ? _l : this.serializer.encode.bind(this.serializer);
                  this.decode = (_m = options === null || options === void 0 ? void 0 : options.decode) !== null && _m !== void 0 ? _m : this.serializer.decode.bind(this.serializer);
                  break;
              default:
                  throw new Error(`Unsupported serializer version: ${this.vsn}`);
          }
          // Handle worker setup
          if (this.worker) {
              if (typeof window !== 'undefined' && !window.Worker) {
                  throw new Error('Web Worker is not supported');
              }
              this.workerUrl = options === null || options === void 0 ? void 0 : options.workerUrl;
          }
      }
  }

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

  var isArray = Array.isArray || function (arr) {
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

      if (obj.type === 'Buffer' && isArray(obj.data)) {
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
  Buffer.isBuffer = isBuffer;
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
    if (!isArray(list)) {
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
      out += toHex$1(buf[i]);
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

  function toHex$1 (n) {
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
  function isBuffer(obj) {
    return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
  }

  function isFastBuffer (obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
  }

  // For Node v0.10 support. Remove this eventually.
  function isSlowBuffer (obj) {
    return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
  }

  class StorageError extends Error {
      constructor(message) {
          super(message);
          this.__isStorageError = true;
          this.name = 'StorageError';
      }
  }
  function isStorageError(error) {
      return typeof error === 'object' && error !== null && '__isStorageError' in error;
  }
  class StorageApiError extends StorageError {
      constructor(message, status, statusCode) {
          super(message);
          this.name = 'StorageApiError';
          this.status = status;
          this.statusCode = statusCode;
      }
      toJSON() {
          return {
              name: this.name,
              message: this.message,
              status: this.status,
              statusCode: this.statusCode,
          };
      }
  }
  class StorageUnknownError extends StorageError {
      constructor(message, originalError) {
          super(message);
          this.name = 'StorageUnknownError';
          this.originalError = originalError;
      }
  }

  const resolveFetch$3 = (customFetch) => {
      if (customFetch) {
          return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
  };
  const resolveResponse = () => {
      return Response;
  };
  const recursiveToCamel = (item) => {
      if (Array.isArray(item)) {
          return item.map((el) => recursiveToCamel(el));
      }
      else if (typeof item === 'function' || item !== Object(item)) {
          return item;
      }
      const result = {};
      Object.entries(item).forEach(([key, value]) => {
          const newKey = key.replace(/([-_][a-z])/gi, (c) => c.toUpperCase().replace(/[-_]/g, ''));
          result[newKey] = recursiveToCamel(value);
      });
      return result;
  };
  /**
   * Determine if input is a plain object
   * An object is plain if it's created by either {}, new Object(), or Object.create(null)
   * source: https://github.com/sindresorhus/is-plain-obj
   */
  const isPlainObject$1 = (value) => {
      if (typeof value !== 'object' || value === null) {
          return false;
      }
      const prototype = Object.getPrototypeOf(value);
      return ((prototype === null ||
          prototype === Object.prototype ||
          Object.getPrototypeOf(prototype) === null) &&
          !(Symbol.toStringTag in value) &&
          !(Symbol.iterator in value));
  };
  /**
   * Validates if a given bucket name is valid according to Supabase Storage API rules
   * Mirrors backend validation from: storage/src/storage/limits.ts:isValidBucketName()
   *
   * Rules:
   * - Length: 1-100 characters
   * - Allowed characters: alphanumeric (a-z, A-Z, 0-9), underscore (_), and safe special characters
   * - Safe special characters: ! - . * ' ( ) space & $ @ = ; : + , ?
   * - Forbidden: path separators (/, \), path traversal (..), leading/trailing whitespace
   *
   * AWS S3 Reference: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
   *
   * @param bucketName - The bucket name to validate
   * @returns true if valid, false otherwise
   */
  const isValidBucketName = (bucketName) => {
      if (!bucketName || typeof bucketName !== 'string') {
          return false;
      }
      // Check length constraints (1-100 characters)
      if (bucketName.length === 0 || bucketName.length > 100) {
          return false;
      }
      // Check for leading/trailing whitespace
      if (bucketName.trim() !== bucketName) {
          return false;
      }
      // Explicitly reject path separators (security)
      // Note: Consecutive periods (..) are allowed by backend - the AWS restriction
      // on relative paths applies to object keys, not bucket names
      if (bucketName.includes('/') || bucketName.includes('\\')) {
          return false;
      }
      // Validate against allowed character set
      // Pattern matches backend regex: /^(\w|!|-|\.|\*|'|\(|\)| |&|\$|@|=|;|:|\+|,|\?)*$/
      // This explicitly excludes path separators (/, \) and other problematic characters
      const bucketNameRegex = /^[\w!.\*'() &$@=;:+,?-]+$/;
      return bucketNameRegex.test(bucketName);
  };

  const _getErrorMessage$2 = (err) => {
      var _a;
      return err.msg ||
          err.message ||
          err.error_description ||
          (typeof err.error === 'string' ? err.error : (_a = err.error) === null || _a === void 0 ? void 0 : _a.message) ||
          JSON.stringify(err);
  };
  const handleError$2 = (error, reject, options) => __awaiter(void 0, void 0, void 0, function* () {
      const Res = yield resolveResponse();
      if (error instanceof Res && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) {
          error
              .json()
              .then((err) => {
              const status = error.status || 500;
              const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || status + '';
              reject(new StorageApiError(_getErrorMessage$2(err), status, statusCode));
          })
              .catch((err) => {
              reject(new StorageUnknownError(_getErrorMessage$2(err), err));
          });
      }
      else {
          reject(new StorageUnknownError(_getErrorMessage$2(error), error));
      }
  });
  const _getRequestParams$2 = (method, options, parameters, body) => {
      const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
      if (method === 'GET' || !body) {
          return params;
      }
      if (isPlainObject$1(body)) {
          params.headers = Object.assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers);
          params.body = JSON.stringify(body);
      }
      else {
          params.body = body;
      }
      if (options === null || options === void 0 ? void 0 : options.duplex) {
          params.duplex = options.duplex;
      }
      return Object.assign(Object.assign({}, params), parameters);
  };
  function _handleRequest$2(fetcher, method, url, options, parameters, body) {
      return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => {
              fetcher(url, _getRequestParams$2(method, options, parameters, body))
                  .then((result) => {
                  if (!result.ok)
                      throw result;
                  if (options === null || options === void 0 ? void 0 : options.noResolveJson)
                      return result;
                  return result.json();
              })
                  .then((data) => resolve(data))
                  .catch((error) => handleError$2(error, reject, options));
          });
      });
  }
  function get(fetcher, url, options, parameters) {
      return __awaiter(this, void 0, void 0, function* () {
          return _handleRequest$2(fetcher, 'GET', url, options, parameters);
      });
  }
  function post$1(fetcher, url, body, options, parameters) {
      return __awaiter(this, void 0, void 0, function* () {
          return _handleRequest$2(fetcher, 'POST', url, options, parameters, body);
      });
  }
  function put(fetcher, url, body, options, parameters) {
      return __awaiter(this, void 0, void 0, function* () {
          return _handleRequest$2(fetcher, 'PUT', url, options, parameters, body);
      });
  }
  function head(fetcher, url, options, parameters) {
      return __awaiter(this, void 0, void 0, function* () {
          return _handleRequest$2(fetcher, 'HEAD', url, Object.assign(Object.assign({}, options), { noResolveJson: true }), parameters);
      });
  }
  function remove(fetcher, url, body, options, parameters) {
      return __awaiter(this, void 0, void 0, function* () {
          return _handleRequest$2(fetcher, 'DELETE', url, options, parameters, body);
      });
  }

  class StreamDownloadBuilder {
      constructor(downloadFn, shouldThrowOnError) {
          this.downloadFn = downloadFn;
          this.shouldThrowOnError = shouldThrowOnError;
      }
      then(onfulfilled, onrejected) {
          return this.execute().then(onfulfilled, onrejected);
      }
      execute() {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const result = yield this.downloadFn();
                  return {
                      data: result.body,
                      error: null,
                  };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
  }

  var _a;
  class BlobDownloadBuilder {
      constructor(downloadFn, shouldThrowOnError) {
          this.downloadFn = downloadFn;
          this.shouldThrowOnError = shouldThrowOnError;
          this[_a] = 'BlobDownloadBuilder';
          this.promise = null;
      }
      asStream() {
          return new StreamDownloadBuilder(this.downloadFn, this.shouldThrowOnError);
      }
      then(onfulfilled, onrejected) {
          return this.getPromise().then(onfulfilled, onrejected);
      }
      catch(onrejected) {
          return this.getPromise().catch(onrejected);
      }
      finally(onfinally) {
          return this.getPromise().finally(onfinally);
      }
      getPromise() {
          if (!this.promise) {
              this.promise = this.execute();
          }
          return this.promise;
      }
      execute() {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const result = yield this.downloadFn();
                  return {
                      data: yield result.blob(),
                      error: null,
                  };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
  }
  _a = Symbol.toStringTag;

  const DEFAULT_SEARCH_OPTIONS = {
      limit: 100,
      offset: 0,
      sortBy: {
          column: 'name',
          order: 'asc',
      },
  };
  const DEFAULT_FILE_OPTIONS = {
      cacheControl: '3600',
      contentType: 'text/plain;charset=UTF-8',
      upsert: false,
  };
  class StorageFileApi {
      constructor(url, headers = {}, bucketId, fetch) {
          this.shouldThrowOnError = false;
          this.url = url;
          this.headers = headers;
          this.bucketId = bucketId;
          this.fetch = resolveFetch$3(fetch);
      }
      /**
       * Enable throwing errors instead of returning them.
       *
       * @category File Buckets
       */
      throwOnError() {
          this.shouldThrowOnError = true;
          return this;
      }
      /**
       * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
       *
       * @param method HTTP method.
       * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
       * @param fileBody The body of the file to be stored in the bucket.
       */
      uploadOrUpdate(method, path, fileBody, fileOptions) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  let body;
                  const options = Object.assign(Object.assign({}, DEFAULT_FILE_OPTIONS), fileOptions);
                  let headers = Object.assign(Object.assign({}, this.headers), (method === 'POST' && { 'x-upsert': String(options.upsert) }));
                  const metadata = options.metadata;
                  if (typeof Blob !== 'undefined' && fileBody instanceof Blob) {
                      body = new FormData();
                      body.append('cacheControl', options.cacheControl);
                      if (metadata) {
                          body.append('metadata', this.encodeMetadata(metadata));
                      }
                      body.append('', fileBody);
                  }
                  else if (typeof FormData !== 'undefined' && fileBody instanceof FormData) {
                      body = fileBody;
                      // Only append if not already present
                      if (!body.has('cacheControl')) {
                          body.append('cacheControl', options.cacheControl);
                      }
                      if (metadata && !body.has('metadata')) {
                          body.append('metadata', this.encodeMetadata(metadata));
                      }
                  }
                  else {
                      body = fileBody;
                      headers['cache-control'] = `max-age=${options.cacheControl}`;
                      headers['content-type'] = options.contentType;
                      if (metadata) {
                          headers['x-metadata'] = this.toBase64(this.encodeMetadata(metadata));
                      }
                      // Node.js streams require duplex option for fetch in Node 20+
                      // Check for both web ReadableStream and Node.js streams
                      const isStream = (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream) ||
                          (body && typeof body === 'object' && 'pipe' in body && typeof body.pipe === 'function');
                      if (isStream && !options.duplex) {
                          options.duplex = 'half';
                      }
                  }
                  if (fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.headers) {
                      headers = Object.assign(Object.assign({}, headers), fileOptions.headers);
                  }
                  const cleanPath = this._removeEmptyFolders(path);
                  const _path = this._getFinalPath(cleanPath);
                  const data = yield (method == 'PUT' ? put : post$1)(this.fetch, `${this.url}/object/${_path}`, body, Object.assign({ headers }, ((options === null || options === void 0 ? void 0 : options.duplex) ? { duplex: options.duplex } : {})));
                  return {
                      data: { path: cleanPath, id: data.Id, fullPath: data.Key },
                      error: null,
                  };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * Uploads a file to an existing bucket.
       *
       * @category File Buckets
       * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
       * @param fileBody The body of the file to be stored in the bucket.
       * @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
       * @returns Promise with response containing file path, id, and fullPath or error
       *
       * @example Upload file
       * ```js
       * const avatarFile = event.target.files[0]
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .upload('public/avatar1.png', avatarFile, {
       *     cacheControl: '3600',
       *     upsert: false
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "path": "public/avatar1.png",
       *     "fullPath": "avatars/public/avatar1.png"
       *   },
       *   "error": null
       * }
       * ```
       *
       * @example Upload file using `ArrayBuffer` from base64 file data
       * ```js
       * import { decode } from 'base64-arraybuffer'
       *
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .upload('public/avatar1.png', decode('base64FileData'), {
       *     contentType: 'image/png'
       *   })
       * ```
       */
      upload(path, fileBody, fileOptions) {
          return __awaiter(this, void 0, void 0, function* () {
              return this.uploadOrUpdate('POST', path, fileBody, fileOptions);
          });
      }
      /**
       * Upload a file with a token generated from `createSignedUploadUrl`.
       *
       * @category File Buckets
       * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
       * @param token The token generated from `createSignedUploadUrl`
       * @param fileBody The body of the file to be stored in the bucket.
       * @param fileOptions Optional file upload options including cacheControl and contentType.
       * @returns Promise with response containing file path and fullPath or error
       *
       * @example Upload to a signed URL
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .uploadToSignedUrl('folder/cat.jpg', 'token-from-createSignedUploadUrl', file)
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "path": "folder/cat.jpg",
       *     "fullPath": "avatars/folder/cat.jpg"
       *   },
       *   "error": null
       * }
       * ```
       */
      uploadToSignedUrl(path, token, fileBody, fileOptions) {
          return __awaiter(this, void 0, void 0, function* () {
              const cleanPath = this._removeEmptyFolders(path);
              const _path = this._getFinalPath(cleanPath);
              const url = new URL(this.url + `/object/upload/sign/${_path}`);
              url.searchParams.set('token', token);
              try {
                  let body;
                  const options = Object.assign({ upsert: DEFAULT_FILE_OPTIONS.upsert }, fileOptions);
                  const headers = Object.assign(Object.assign({}, this.headers), { 'x-upsert': String(options.upsert) });
                  if (typeof Blob !== 'undefined' && fileBody instanceof Blob) {
                      body = new FormData();
                      body.append('cacheControl', options.cacheControl);
                      body.append('', fileBody);
                  }
                  else if (typeof FormData !== 'undefined' && fileBody instanceof FormData) {
                      body = fileBody;
                      body.append('cacheControl', options.cacheControl);
                  }
                  else {
                      body = fileBody;
                      headers['cache-control'] = `max-age=${options.cacheControl}`;
                      headers['content-type'] = options.contentType;
                  }
                  const data = yield put(this.fetch, url.toString(), body, { headers });
                  return {
                      data: { path: cleanPath, fullPath: data.Key },
                      error: null,
                  };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * Creates a signed upload URL.
       * Signed upload URLs can be used to upload files to the bucket without further authentication.
       * They are valid for 2 hours.
       *
       * @category File Buckets
       * @param path The file path, including the current file name. For example `folder/image.png`.
       * @param options.upsert If set to true, allows the file to be overwritten if it already exists.
       * @returns Promise with response containing signed upload URL, token, and path or error
       *
       * @example Create Signed Upload URL
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUploadUrl('folder/cat.jpg')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "signedUrl": "https://example.supabase.co/storage/v1/object/upload/sign/avatars/folder/cat.jpg?token=<TOKEN>",
       *     "path": "folder/cat.jpg",
       *     "token": "<TOKEN>"
       *   },
       *   "error": null
       * }
       * ```
       */
      createSignedUploadUrl(path, options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  let _path = this._getFinalPath(path);
                  const headers = Object.assign({}, this.headers);
                  if (options === null || options === void 0 ? void 0 : options.upsert) {
                      headers['x-upsert'] = 'true';
                  }
                  const data = yield post$1(this.fetch, `${this.url}/object/upload/sign/${_path}`, {}, { headers });
                  const url = new URL(this.url + data.url);
                  const token = url.searchParams.get('token');
                  if (!token) {
                      throw new StorageError('No token returned by API');
                  }
                  return { data: { signedUrl: url.toString(), path, token }, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * Replaces an existing file at the specified path with a new one.
       *
       * @category File Buckets
       * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
       * @param fileBody The body of the file to be stored in the bucket.
       * @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
       * @returns Promise with response containing file path, id, and fullPath or error
       *
       * @example Update file
       * ```js
       * const avatarFile = event.target.files[0]
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .update('public/avatar1.png', avatarFile, {
       *     cacheControl: '3600',
       *     upsert: true
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "path": "public/avatar1.png",
       *     "fullPath": "avatars/public/avatar1.png"
       *   },
       *   "error": null
       * }
       * ```
       *
       * @example Update file using `ArrayBuffer` from base64 file data
       * ```js
       * import {decode} from 'base64-arraybuffer'
       *
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .update('public/avatar1.png', decode('base64FileData'), {
       *     contentType: 'image/png'
       *   })
       * ```
       */
      update(path, fileBody, fileOptions) {
          return __awaiter(this, void 0, void 0, function* () {
              return this.uploadOrUpdate('PUT', path, fileBody, fileOptions);
          });
      }
      /**
       * Moves an existing file to a new path in the same bucket.
       *
       * @category File Buckets
       * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
       * @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
       * @param options The destination options.
       * @returns Promise with response containing success message or error
       *
       * @example Move file
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .move('public/avatar1.png', 'private/avatar2.png')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully moved"
       *   },
       *   "error": null
       * }
       * ```
       */
      move(fromPath, toPath, options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield post$1(this.fetch, `${this.url}/object/move`, {
                      bucketId: this.bucketId,
                      sourceKey: fromPath,
                      destinationKey: toPath,
                      destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket,
                  }, { headers: this.headers });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * Copies an existing file to a new path in the same bucket.
       *
       * @category File Buckets
       * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
       * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
       * @param options The destination options.
       * @returns Promise with response containing copied file path or error
       *
       * @example Copy file
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .copy('public/avatar1.png', 'private/avatar2.png')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "path": "avatars/private/avatar2.png"
       *   },
       *   "error": null
       * }
       * ```
       */
      copy(fromPath, toPath, options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield post$1(this.fetch, `${this.url}/object/copy`, {
                      bucketId: this.bucketId,
                      sourceKey: fromPath,
                      destinationKey: toPath,
                      destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket,
                  }, { headers: this.headers });
                  return { data: { path: data.Key }, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
       *
       * @category File Buckets
       * @param path The file path, including the current file name. For example `folder/image.png`.
       * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
       * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
       * @param options.transform Transform the asset before serving it to the client.
       * @returns Promise with response containing signed URL or error
       *
       * @example Create Signed URL
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUrl('folder/avatar1.png', 60)
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
       *   },
       *   "error": null
       * }
       * ```
       *
       * @example Create a signed URL for an asset with transformations
       * ```js
       * const { data } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUrl('folder/avatar1.png', 60, {
       *     transform: {
       *       width: 100,
       *       height: 100,
       *     }
       *   })
       * ```
       *
       * @example Create a signed URL which triggers the download of the asset
       * ```js
       * const { data } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUrl('folder/avatar1.png', 60, {
       *     download: true,
       *   })
       * ```
       */
      createSignedUrl(path, expiresIn, options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  let _path = this._getFinalPath(path);
                  let data = yield post$1(this.fetch, `${this.url}/object/sign/${_path}`, Object.assign({ expiresIn }, ((options === null || options === void 0 ? void 0 : options.transform) ? { transform: options.transform } : {})), { headers: this.headers });
                  const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download)
                      ? `&download=${options.download === true ? '' : options.download}`
                      : '';
                  const signedUrl = encodeURI(`${this.url}${data.signedURL}${downloadQueryParam}`);
                  data = { signedUrl };
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
       *
       * @category File Buckets
       * @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
       * @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
       * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
       * @returns Promise with response containing array of objects with signedUrl, path, and error or error
       *
       * @example Create Signed URLs
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .createSignedUrls(['folder/avatar1.png', 'folder/avatar2.png'], 60)
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": [
       *     {
       *       "error": null,
       *       "path": "folder/avatar1.png",
       *       "signedURL": "/object/sign/avatars/folder/avatar1.png?token=<TOKEN>",
       *       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
       *     },
       *     {
       *       "error": null,
       *       "path": "folder/avatar2.png",
       *       "signedURL": "/object/sign/avatars/folder/avatar2.png?token=<TOKEN>",
       *       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar2.png?token=<TOKEN>"
       *     }
       *   ],
       *   "error": null
       * }
       * ```
       */
      createSignedUrls(paths, expiresIn, options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield post$1(this.fetch, `${this.url}/object/sign/${this.bucketId}`, { expiresIn, paths }, { headers: this.headers });
                  const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download)
                      ? `&download=${options.download === true ? '' : options.download}`
                      : '';
                  return {
                      data: data.map((datum) => (Object.assign(Object.assign({}, datum), { signedUrl: datum.signedURL
                              ? encodeURI(`${this.url}${datum.signedURL}${downloadQueryParam}`)
                              : null }))),
                      error: null,
                  };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
       *
       * @category File Buckets
       * @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
       * @param options.transform Transform the asset before serving it to the client.
       * @returns BlobDownloadBuilder instance for downloading the file
       *
       * @example Download file
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .download('folder/avatar1.png')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": <BLOB>,
       *   "error": null
       * }
       * ```
       *
       * @example Download file with transformations
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .download('folder/avatar1.png', {
       *     transform: {
       *       width: 100,
       *       height: 100,
       *       quality: 80
       *     }
       *   })
       * ```
       */
      download(path, options) {
          const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== 'undefined';
          const renderPath = wantsTransformation ? 'render/image/authenticated' : 'object';
          const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
          const queryString = transformationQuery ? `?${transformationQuery}` : '';
          const _path = this._getFinalPath(path);
          const downloadFn = () => get(this.fetch, `${this.url}/${renderPath}/${_path}${queryString}`, {
              headers: this.headers,
              noResolveJson: true,
          });
          return new BlobDownloadBuilder(downloadFn, this.shouldThrowOnError);
      }
      /**
       * Retrieves the details of an existing file.
       *
       * @category File Buckets
       * @param path The file path, including the file name. For example `folder/image.png`.
       * @returns Promise with response containing file metadata or error
       *
       * @example Get file info
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .info('folder/avatar1.png')
       * ```
       */
      info(path) {
          return __awaiter(this, void 0, void 0, function* () {
              const _path = this._getFinalPath(path);
              try {
                  const data = yield get(this.fetch, `${this.url}/object/info/${_path}`, {
                      headers: this.headers,
                  });
                  return { data: recursiveToCamel(data), error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * Checks the existence of a file.
       *
       * @category File Buckets
       * @param path The file path, including the file name. For example `folder/image.png`.
       * @returns Promise with response containing boolean indicating file existence or error
       *
       * @example Check file existence
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .exists('folder/avatar1.png')
       * ```
       */
      exists(path) {
          return __awaiter(this, void 0, void 0, function* () {
              const _path = this._getFinalPath(path);
              try {
                  yield head(this.fetch, `${this.url}/object/${_path}`, {
                      headers: this.headers,
                  });
                  return { data: true, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error) && error instanceof StorageUnknownError) {
                      const originalError = error.originalError;
                      if ([400, 404].includes(originalError === null || originalError === void 0 ? void 0 : originalError.status)) {
                          return { data: false, error };
                      }
                  }
                  throw error;
              }
          });
      }
      /**
       * A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
       * This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
       *
       * @category File Buckets
       * @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
       * @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
       * @param options.transform Transform the asset before serving it to the client.
       * @returns Object with public URL
       *
       * @example Returns the URL for an asset in a public bucket
       * ```js
       * const { data } = supabase
       *   .storage
       *   .from('public-bucket')
       *   .getPublicUrl('folder/avatar1.png')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "publicUrl": "https://example.supabase.co/storage/v1/object/public/public-bucket/folder/avatar1.png"
       *   }
       * }
       * ```
       *
       * @example Returns the URL for an asset in a public bucket with transformations
       * ```js
       * const { data } = supabase
       *   .storage
       *   .from('public-bucket')
       *   .getPublicUrl('folder/avatar1.png', {
       *     transform: {
       *       width: 100,
       *       height: 100,
       *     }
       *   })
       * ```
       *
       * @example Returns the URL which triggers the download of an asset in a public bucket
       * ```js
       * const { data } = supabase
       *   .storage
       *   .from('public-bucket')
       *   .getPublicUrl('folder/avatar1.png', {
       *     download: true,
       *   })
       * ```
       */
      getPublicUrl(path, options) {
          const _path = this._getFinalPath(path);
          const _queryString = [];
          const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download)
              ? `download=${options.download === true ? '' : options.download}`
              : '';
          if (downloadQueryParam !== '') {
              _queryString.push(downloadQueryParam);
          }
          const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== 'undefined';
          const renderPath = wantsTransformation ? 'render/image' : 'object';
          const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
          if (transformationQuery !== '') {
              _queryString.push(transformationQuery);
          }
          let queryString = _queryString.join('&');
          if (queryString !== '') {
              queryString = `?${queryString}`;
          }
          return {
              data: { publicUrl: encodeURI(`${this.url}/${renderPath}/public/${_path}${queryString}`) },
          };
      }
      /**
       * Deletes files within the same bucket
       *
       * @category File Buckets
       * @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
       * @returns Promise with response containing array of deleted file objects or error
       *
       * @example Delete file
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .remove(['folder/avatar1.png'])
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": [],
       *   "error": null
       * }
       * ```
       */
      remove(paths) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield remove(this.fetch, `${this.url}/object/${this.bucketId}`, { prefixes: paths }, { headers: this.headers });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * Get file metadata
       * @param id the file id to retrieve metadata
       */
      // async getMetadata(
      //   id: string
      // ): Promise<
      //   | {
      //       data: Metadata
      //       error: null
      //     }
      //   | {
      //       data: null
      //       error: StorageError
      //     }
      // > {
      //   try {
      //     const data = await get(this.fetch, `${this.url}/metadata/${id}`, { headers: this.headers })
      //     return { data, error: null }
      //   } catch (error) {
      //     if (isStorageError(error)) {
      //       return { data: null, error }
      //     }
      //     throw error
      //   }
      // }
      /**
       * Update file metadata
       * @param id the file id to update metadata
       * @param meta the new file metadata
       */
      // async updateMetadata(
      //   id: string,
      //   meta: Metadata
      // ): Promise<
      //   | {
      //       data: Metadata
      //       error: null
      //     }
      //   | {
      //       data: null
      //       error: StorageError
      //     }
      // > {
      //   try {
      //     const data = await post(
      //       this.fetch,
      //       `${this.url}/metadata/${id}`,
      //       { ...meta },
      //       { headers: this.headers }
      //     )
      //     return { data, error: null }
      //   } catch (error) {
      //     if (isStorageError(error)) {
      //       return { data: null, error }
      //     }
      //     throw error
      //   }
      // }
      /**
       * Lists all the files and folders within a path of the bucket.
       *
       * @category File Buckets
       * @param path The folder path.
       * @param options Search options including limit (defaults to 100), offset, sortBy, and search
       * @param parameters Optional fetch parameters including signal for cancellation
       * @returns Promise with response containing array of files or error
       *
       * @example List files in a bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .list('folder', {
       *     limit: 100,
       *     offset: 0,
       *     sortBy: { column: 'name', order: 'asc' },
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": [
       *     {
       *       "name": "avatar1.png",
       *       "id": "e668cf7f-821b-4a2f-9dce-7dfa5dd1cfd2",
       *       "updated_at": "2024-05-22T23:06:05.580Z",
       *       "created_at": "2024-05-22T23:04:34.443Z",
       *       "last_accessed_at": "2024-05-22T23:04:34.443Z",
       *       "metadata": {
       *         "eTag": "\"c5e8c553235d9af30ef4f6e280790b92\"",
       *         "size": 32175,
       *         "mimetype": "image/png",
       *         "cacheControl": "max-age=3600",
       *         "lastModified": "2024-05-22T23:06:05.574Z",
       *         "contentLength": 32175,
       *         "httpStatusCode": 200
       *       }
       *     }
       *   ],
       *   "error": null
       * }
       * ```
       *
       * @example Search files in a bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .from('avatars')
       *   .list('folder', {
       *     limit: 100,
       *     offset: 0,
       *     sortBy: { column: 'name', order: 'asc' },
       *     search: 'jon'
       *   })
       * ```
       */
      list(path, options, parameters) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const body = Object.assign(Object.assign(Object.assign({}, DEFAULT_SEARCH_OPTIONS), options), { prefix: path || '' });
                  const data = yield post$1(this.fetch, `${this.url}/object/list/${this.bucketId}`, body, { headers: this.headers }, parameters);
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * @experimental this method signature might change in the future
       *
       * @category File Buckets
       * @param options search options
       * @param parameters
       */
      listV2(options, parameters) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const body = Object.assign({}, options);
                  const data = yield post$1(this.fetch, `${this.url}/object/list-v2/${this.bucketId}`, body, { headers: this.headers }, parameters);
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      encodeMetadata(metadata) {
          return JSON.stringify(metadata);
      }
      toBase64(data) {
          if (typeof Buffer !== 'undefined') {
              return Buffer.from(data).toString('base64');
          }
          return btoa(data);
      }
      _getFinalPath(path) {
          return `${this.bucketId}/${path.replace(/^\/+/, '')}`;
      }
      _removeEmptyFolders(path) {
          return path.replace(/^\/|\/$/g, '').replace(/\/+/g, '/');
      }
      transformOptsToQueryString(transform) {
          const params = [];
          if (transform.width) {
              params.push(`width=${transform.width}`);
          }
          if (transform.height) {
              params.push(`height=${transform.height}`);
          }
          if (transform.resize) {
              params.push(`resize=${transform.resize}`);
          }
          if (transform.format) {
              params.push(`format=${transform.format}`);
          }
          if (transform.quality) {
              params.push(`quality=${transform.quality}`);
          }
          return params.join('&');
      }
  }

  // Generated automatically during releases by scripts/update-version-files.ts
  // This file provides runtime access to the package version for:
  // - HTTP request headers (e.g., X-Client-Info header for API requests)
  // - Debugging and support (identifying which version is running)
  // - Telemetry and logging (version reporting in errors/analytics)
  // - Ensuring build artifacts match the published package version
  const version$2 = '2.86.0';

  const DEFAULT_HEADERS$3 = {
      'X-Client-Info': `storage-js/${version$2}`,
  };

  class StorageBucketApi {
      constructor(url, headers = {}, fetch, opts) {
          this.shouldThrowOnError = false;
          const baseUrl = new URL(url);
          // if legacy uri is used, replace with new storage host (disables request buffering to allow > 50GB uploads)
          // "project-ref.supabase.co" becomes "project-ref.storage.supabase.co"
          if (opts === null || opts === void 0 ? void 0 : opts.useNewHostname) {
              const isSupabaseHost = /supabase\.(co|in|red)$/.test(baseUrl.hostname);
              if (isSupabaseHost && !baseUrl.hostname.includes('storage.supabase.')) {
                  baseUrl.hostname = baseUrl.hostname.replace('supabase.', 'storage.supabase.');
              }
          }
          this.url = baseUrl.href.replace(/\/$/, '');
          this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$3), headers);
          this.fetch = resolveFetch$3(fetch);
      }
      /**
       * Enable throwing errors instead of returning them.
       *
       * @category File Buckets
       */
      throwOnError() {
          this.shouldThrowOnError = true;
          return this;
      }
      /**
       * Retrieves the details of all Storage buckets within an existing project.
       *
       * @category File Buckets
       * @param options Query parameters for listing buckets
       * @param options.limit Maximum number of buckets to return
       * @param options.offset Number of buckets to skip
       * @param options.sortColumn Column to sort by ('id', 'name', 'created_at', 'updated_at')
       * @param options.sortOrder Sort order ('asc' or 'desc')
       * @param options.search Search term to filter bucket names
       * @returns Promise with response containing array of buckets or error
       *
       * @example List buckets
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .listBuckets()
       * ```
       *
       * @example List buckets with options
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .listBuckets({
       *     limit: 10,
       *     offset: 0,
       *     sortColumn: 'created_at',
       *     sortOrder: 'desc',
       *     search: 'prod'
       *   })
       * ```
       */
      listBuckets(options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const queryString = this.listBucketOptionsToQueryString(options);
                  const data = yield get(this.fetch, `${this.url}/bucket${queryString}`, {
                      headers: this.headers,
                  });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * Retrieves the details of an existing Storage bucket.
       *
       * @category File Buckets
       * @param id The unique identifier of the bucket you would like to retrieve.
       * @returns Promise with response containing bucket details or error
       *
       * @example Get bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .getBucket('avatars')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "id": "avatars",
       *     "name": "avatars",
       *     "owner": "",
       *     "public": false,
       *     "file_size_limit": 1024,
       *     "allowed_mime_types": [
       *       "image/png"
       *     ],
       *     "created_at": "2024-05-22T22:26:05.100Z",
       *     "updated_at": "2024-05-22T22:26:05.100Z"
       *   },
       *   "error": null
       * }
       * ```
       */
      getBucket(id) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield get(this.fetch, `${this.url}/bucket/${id}`, { headers: this.headers });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * Creates a new Storage bucket
       *
       * @category File Buckets
       * @param id A unique identifier for the bucket you are creating.
       * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
       * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
       * The global file size limit takes precedence over this value.
       * The default value is null, which doesn't set a per bucket file size limit.
       * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
       * The default value is null, which allows files with all mime types to be uploaded.
       * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
       * @param options.type (private-beta) specifies the bucket type. see `BucketType` for more details.
       *   - default bucket type is `STANDARD`
       * @returns Promise with response containing newly created bucket name or error
       *
       * @example Create bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .createBucket('avatars', {
       *     public: false,
       *     allowedMimeTypes: ['image/png'],
       *     fileSizeLimit: 1024
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "name": "avatars"
       *   },
       *   "error": null
       * }
       * ```
       */
      createBucket(id_1) {
          return __awaiter(this, arguments, void 0, function* (id, options = {
              public: false,
          }) {
              try {
                  const data = yield post$1(this.fetch, `${this.url}/bucket`, {
                      id,
                      name: id,
                      type: options.type,
                      public: options.public,
                      file_size_limit: options.fileSizeLimit,
                      allowed_mime_types: options.allowedMimeTypes,
                  }, { headers: this.headers });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * Updates a Storage bucket
       *
       * @category File Buckets
       * @param id A unique identifier for the bucket you are updating.
       * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
       * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
       * The global file size limit takes precedence over this value.
       * The default value is null, which doesn't set a per bucket file size limit.
       * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
       * The default value is null, which allows files with all mime types to be uploaded.
       * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
       * @returns Promise with response containing success message or error
       *
       * @example Update bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .updateBucket('avatars', {
       *     public: false,
       *     allowedMimeTypes: ['image/png'],
       *     fileSizeLimit: 1024
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully updated"
       *   },
       *   "error": null
       * }
       * ```
       */
      updateBucket(id, options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield put(this.fetch, `${this.url}/bucket/${id}`, {
                      id,
                      name: id,
                      public: options.public,
                      file_size_limit: options.fileSizeLimit,
                      allowed_mime_types: options.allowedMimeTypes,
                  }, { headers: this.headers });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * Removes all objects inside a single bucket.
       *
       * @category File Buckets
       * @param id The unique identifier of the bucket you would like to empty.
       * @returns Promise with success message or error
       *
       * @example Empty bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .emptyBucket('avatars')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully emptied"
       *   },
       *   "error": null
       * }
       * ```
       */
      emptyBucket(id) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield post$1(this.fetch, `${this.url}/bucket/${id}/empty`, {}, { headers: this.headers });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
       * You must first `empty()` the bucket.
       *
       * @category File Buckets
       * @param id The unique identifier of the bucket you would like to delete.
       * @returns Promise with success message or error
       *
       * @example Delete bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .deleteBucket('avatars')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully deleted"
       *   },
       *   "error": null
       * }
       * ```
       */
      deleteBucket(id) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield remove(this.fetch, `${this.url}/bucket/${id}`, {}, { headers: this.headers });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      listBucketOptionsToQueryString(options) {
          const params = {};
          if (options) {
              if ('limit' in options) {
                  params.limit = String(options.limit);
              }
              if ('offset' in options) {
                  params.offset = String(options.offset);
              }
              if (options.search) {
                  params.search = options.search;
              }
              if (options.sortColumn) {
                  params.sortColumn = options.sortColumn;
              }
              if (options.sortOrder) {
                  params.sortOrder = options.sortOrder;
              }
          }
          return Object.keys(params).length > 0 ? '?' + new URLSearchParams(params).toString() : '';
      }
  }

  // src/errors/IcebergError.ts
  var IcebergError = class extends Error {
    constructor(message, opts) {
      super(message);
      this.name = "IcebergError";
      this.status = opts.status;
      this.icebergType = opts.icebergType;
      this.icebergCode = opts.icebergCode;
      this.details = opts.details;
      this.isCommitStateUnknown = opts.icebergType === "CommitStateUnknownException" || [500, 502, 504].includes(opts.status) && opts.icebergType?.includes("CommitState") === true;
    }
    /**
     * Returns true if the error is a 404 Not Found error.
     */
    isNotFound() {
      return this.status === 404;
    }
    /**
     * Returns true if the error is a 409 Conflict error.
     */
    isConflict() {
      return this.status === 409;
    }
    /**
     * Returns true if the error is a 419 Authentication Timeout error.
     */
    isAuthenticationTimeout() {
      return this.status === 419;
    }
  };

  // src/utils/url.ts
  function buildUrl(baseUrl, path, query) {
    const url = new URL(path, baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== void 0) {
          url.searchParams.set(key, value);
        }
      }
    }
    return url.toString();
  }

  // src/http/createFetchClient.ts
  async function buildAuthHeaders(auth) {
    if (!auth || auth.type === "none") {
      return {};
    }
    if (auth.type === "bearer") {
      return { Authorization: `Bearer ${auth.token}` };
    }
    if (auth.type === "header") {
      return { [auth.name]: auth.value };
    }
    if (auth.type === "custom") {
      return await auth.getHeaders();
    }
    return {};
  }
  function createFetchClient(options) {
    const fetchFn = options.fetchImpl ?? globalThis.fetch;
    return {
      async request({
        method,
        path,
        query,
        body,
        headers
      }) {
        const url = buildUrl(options.baseUrl, path, query);
        const authHeaders = await buildAuthHeaders(options.auth);
        const res = await fetchFn(url, {
          method,
          headers: {
            ...body ? { "Content-Type": "application/json" } : {},
            ...authHeaders,
            ...headers
          },
          body: body ? JSON.stringify(body) : void 0
        });
        const text = await res.text();
        const isJson = (res.headers.get("content-type") || "").includes("application/json");
        const data = isJson && text ? JSON.parse(text) : text;
        if (!res.ok) {
          const errBody = isJson ? data : void 0;
          const errorDetail = errBody?.error;
          throw new IcebergError(
            errorDetail?.message ?? `Request failed with status ${res.status}`,
            {
              status: res.status,
              icebergType: errorDetail?.type,
              icebergCode: errorDetail?.code,
              details: errBody
            }
          );
        }
        return { status: res.status, headers: res.headers, data };
      }
    };
  }

  // src/catalog/namespaces.ts
  function namespaceToPath(namespace) {
    return namespace.join("");
  }
  var NamespaceOperations = class {
    constructor(client, prefix = "") {
      this.client = client;
      this.prefix = prefix;
    }
    async listNamespaces(parent) {
      const query = parent ? { parent: namespaceToPath(parent.namespace) } : void 0;
      const response = await this.client.request({
        method: "GET",
        path: `${this.prefix}/namespaces`,
        query
      });
      return response.data.namespaces.map((ns) => ({ namespace: ns }));
    }
    async createNamespace(id, metadata) {
      const request = {
        namespace: id.namespace,
        properties: metadata?.properties
      };
      const response = await this.client.request({
        method: "POST",
        path: `${this.prefix}/namespaces`,
        body: request
      });
      return response.data;
    }
    async dropNamespace(id) {
      await this.client.request({
        method: "DELETE",
        path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
      });
    }
    async loadNamespaceMetadata(id) {
      const response = await this.client.request({
        method: "GET",
        path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
      });
      return {
        properties: response.data.properties
      };
    }
    async namespaceExists(id) {
      try {
        await this.client.request({
          method: "HEAD",
          path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
        });
        return true;
      } catch (error) {
        if (error instanceof IcebergError && error.status === 404) {
          return false;
        }
        throw error;
      }
    }
    async createNamespaceIfNotExists(id, metadata) {
      try {
        return await this.createNamespace(id, metadata);
      } catch (error) {
        if (error instanceof IcebergError && error.status === 409) {
          return;
        }
        throw error;
      }
    }
  };

  // src/catalog/tables.ts
  function namespaceToPath2(namespace) {
    return namespace.join("");
  }
  var TableOperations = class {
    constructor(client, prefix = "", accessDelegation) {
      this.client = client;
      this.prefix = prefix;
      this.accessDelegation = accessDelegation;
    }
    async listTables(namespace) {
      const response = await this.client.request({
        method: "GET",
        path: `${this.prefix}/namespaces/${namespaceToPath2(namespace.namespace)}/tables`
      });
      return response.data.identifiers;
    }
    async createTable(namespace, request) {
      const headers = {};
      if (this.accessDelegation) {
        headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
      }
      const response = await this.client.request({
        method: "POST",
        path: `${this.prefix}/namespaces/${namespaceToPath2(namespace.namespace)}/tables`,
        body: request,
        headers
      });
      return response.data.metadata;
    }
    async updateTable(id, request) {
      const response = await this.client.request({
        method: "POST",
        path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
        body: request
      });
      return {
        "metadata-location": response.data["metadata-location"],
        metadata: response.data.metadata
      };
    }
    async dropTable(id, options) {
      await this.client.request({
        method: "DELETE",
        path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
        query: { purgeRequested: String(options?.purge ?? false) }
      });
    }
    async loadTable(id) {
      const headers = {};
      if (this.accessDelegation) {
        headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
      }
      const response = await this.client.request({
        method: "GET",
        path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
        headers
      });
      return response.data.metadata;
    }
    async tableExists(id) {
      const headers = {};
      if (this.accessDelegation) {
        headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
      }
      try {
        await this.client.request({
          method: "HEAD",
          path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
          headers
        });
        return true;
      } catch (error) {
        if (error instanceof IcebergError && error.status === 404) {
          return false;
        }
        throw error;
      }
    }
    async createTableIfNotExists(namespace, request) {
      try {
        return await this.createTable(namespace, request);
      } catch (error) {
        if (error instanceof IcebergError && error.status === 409) {
          return await this.loadTable({ namespace: namespace.namespace, name: request.name });
        }
        throw error;
      }
    }
  };

  // src/catalog/IcebergRestCatalog.ts
  var IcebergRestCatalog = class {
    /**
     * Creates a new Iceberg REST Catalog client.
     *
     * @param options - Configuration options for the catalog client
     */
    constructor(options) {
      let prefix = "v1";
      if (options.catalogName) {
        prefix += `/${options.catalogName}`;
      }
      const baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl : `${options.baseUrl}/`;
      this.client = createFetchClient({
        baseUrl,
        auth: options.auth,
        fetchImpl: options.fetch
      });
      this.accessDelegation = options.accessDelegation?.join(",");
      this.namespaceOps = new NamespaceOperations(this.client, prefix);
      this.tableOps = new TableOperations(this.client, prefix, this.accessDelegation);
    }
    /**
     * Lists all namespaces in the catalog.
     *
     * @param parent - Optional parent namespace to list children under
     * @returns Array of namespace identifiers
     *
     * @example
     * ```typescript
     * // List all top-level namespaces
     * const namespaces = await catalog.listNamespaces();
     *
     * // List namespaces under a parent
     * const children = await catalog.listNamespaces({ namespace: ['analytics'] });
     * ```
     */
    async listNamespaces(parent) {
      return this.namespaceOps.listNamespaces(parent);
    }
    /**
     * Creates a new namespace in the catalog.
     *
     * @param id - Namespace identifier to create
     * @param metadata - Optional metadata properties for the namespace
     * @returns Response containing the created namespace and its properties
     *
     * @example
     * ```typescript
     * const response = await catalog.createNamespace(
     *   { namespace: ['analytics'] },
     *   { properties: { owner: 'data-team' } }
     * );
     * console.log(response.namespace); // ['analytics']
     * console.log(response.properties); // { owner: 'data-team', ... }
     * ```
     */
    async createNamespace(id, metadata) {
      return this.namespaceOps.createNamespace(id, metadata);
    }
    /**
     * Drops a namespace from the catalog.
     *
     * The namespace must be empty (contain no tables) before it can be dropped.
     *
     * @param id - Namespace identifier to drop
     *
     * @example
     * ```typescript
     * await catalog.dropNamespace({ namespace: ['analytics'] });
     * ```
     */
    async dropNamespace(id) {
      await this.namespaceOps.dropNamespace(id);
    }
    /**
     * Loads metadata for a namespace.
     *
     * @param id - Namespace identifier to load
     * @returns Namespace metadata including properties
     *
     * @example
     * ```typescript
     * const metadata = await catalog.loadNamespaceMetadata({ namespace: ['analytics'] });
     * console.log(metadata.properties);
     * ```
     */
    async loadNamespaceMetadata(id) {
      return this.namespaceOps.loadNamespaceMetadata(id);
    }
    /**
     * Lists all tables in a namespace.
     *
     * @param namespace - Namespace identifier to list tables from
     * @returns Array of table identifiers
     *
     * @example
     * ```typescript
     * const tables = await catalog.listTables({ namespace: ['analytics'] });
     * console.log(tables); // [{ namespace: ['analytics'], name: 'events' }, ...]
     * ```
     */
    async listTables(namespace) {
      return this.tableOps.listTables(namespace);
    }
    /**
     * Creates a new table in the catalog.
     *
     * @param namespace - Namespace to create the table in
     * @param request - Table creation request including name, schema, partition spec, etc.
     * @returns Table metadata for the created table
     *
     * @example
     * ```typescript
     * const metadata = await catalog.createTable(
     *   { namespace: ['analytics'] },
     *   {
     *     name: 'events',
     *     schema: {
     *       type: 'struct',
     *       fields: [
     *         { id: 1, name: 'id', type: 'long', required: true },
     *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
     *       ],
     *       'schema-id': 0
     *     },
     *     'partition-spec': {
     *       'spec-id': 0,
     *       fields: [
     *         { source_id: 2, field_id: 1000, name: 'ts_day', transform: 'day' }
     *       ]
     *     }
     *   }
     * );
     * ```
     */
    async createTable(namespace, request) {
      return this.tableOps.createTable(namespace, request);
    }
    /**
     * Updates an existing table's metadata.
     *
     * Can update the schema, partition spec, or properties of a table.
     *
     * @param id - Table identifier to update
     * @param request - Update request with fields to modify
     * @returns Response containing the metadata location and updated table metadata
     *
     * @example
     * ```typescript
     * const response = await catalog.updateTable(
     *   { namespace: ['analytics'], name: 'events' },
     *   {
     *     properties: { 'read.split.target-size': '134217728' }
     *   }
     * );
     * console.log(response['metadata-location']); // s3://...
     * console.log(response.metadata); // TableMetadata object
     * ```
     */
    async updateTable(id, request) {
      return this.tableOps.updateTable(id, request);
    }
    /**
     * Drops a table from the catalog.
     *
     * @param id - Table identifier to drop
     *
     * @example
     * ```typescript
     * await catalog.dropTable({ namespace: ['analytics'], name: 'events' });
     * ```
     */
    async dropTable(id, options) {
      await this.tableOps.dropTable(id, options);
    }
    /**
     * Loads metadata for a table.
     *
     * @param id - Table identifier to load
     * @returns Table metadata including schema, partition spec, location, etc.
     *
     * @example
     * ```typescript
     * const metadata = await catalog.loadTable({ namespace: ['analytics'], name: 'events' });
     * console.log(metadata.schema);
     * console.log(metadata.location);
     * ```
     */
    async loadTable(id) {
      return this.tableOps.loadTable(id);
    }
    /**
     * Checks if a namespace exists in the catalog.
     *
     * @param id - Namespace identifier to check
     * @returns True if the namespace exists, false otherwise
     *
     * @example
     * ```typescript
     * const exists = await catalog.namespaceExists({ namespace: ['analytics'] });
     * console.log(exists); // true or false
     * ```
     */
    async namespaceExists(id) {
      return this.namespaceOps.namespaceExists(id);
    }
    /**
     * Checks if a table exists in the catalog.
     *
     * @param id - Table identifier to check
     * @returns True if the table exists, false otherwise
     *
     * @example
     * ```typescript
     * const exists = await catalog.tableExists({ namespace: ['analytics'], name: 'events' });
     * console.log(exists); // true or false
     * ```
     */
    async tableExists(id) {
      return this.tableOps.tableExists(id);
    }
    /**
     * Creates a namespace if it does not exist.
     *
     * If the namespace already exists, returns void. If created, returns the response.
     *
     * @param id - Namespace identifier to create
     * @param metadata - Optional metadata properties for the namespace
     * @returns Response containing the created namespace and its properties, or void if it already exists
     *
     * @example
     * ```typescript
     * const response = await catalog.createNamespaceIfNotExists(
     *   { namespace: ['analytics'] },
     *   { properties: { owner: 'data-team' } }
     * );
     * if (response) {
     *   console.log('Created:', response.namespace);
     * } else {
     *   console.log('Already exists');
     * }
     * ```
     */
    async createNamespaceIfNotExists(id, metadata) {
      return this.namespaceOps.createNamespaceIfNotExists(id, metadata);
    }
    /**
     * Creates a table if it does not exist.
     *
     * If the table already exists, returns its metadata instead.
     *
     * @param namespace - Namespace to create the table in
     * @param request - Table creation request including name, schema, partition spec, etc.
     * @returns Table metadata for the created or existing table
     *
     * @example
     * ```typescript
     * const metadata = await catalog.createTableIfNotExists(
     *   { namespace: ['analytics'] },
     *   {
     *     name: 'events',
     *     schema: {
     *       type: 'struct',
     *       fields: [
     *         { id: 1, name: 'id', type: 'long', required: true },
     *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
     *       ],
     *       'schema-id': 0
     *     }
     *   }
     * );
     * ```
     */
    async createTableIfNotExists(namespace, request) {
      return this.tableOps.createTableIfNotExists(namespace, request);
    }
  };

  /**
   * Client class for managing Analytics Buckets using Iceberg tables
   * Provides methods for creating, listing, and deleting analytics buckets
   */
  class StorageAnalyticsClient {
      /**
       * @alpha
       *
       * Creates a new StorageAnalyticsClient instance
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @param url - The base URL for the storage API
       * @param headers - HTTP headers to include in requests
       * @param fetch - Optional custom fetch implementation
       *
       * @example
       * ```typescript
       * const client = new StorageAnalyticsClient(url, headers)
       * ```
       */
      constructor(url, headers = {}, fetch) {
          this.shouldThrowOnError = false;
          this.url = url.replace(/\/$/, '');
          this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$3), headers);
          this.fetch = resolveFetch$3(fetch);
      }
      /**
       * @alpha
       *
       * Enable throwing errors instead of returning them in the response
       * When enabled, failed operations will throw instead of returning { data: null, error }
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @returns This instance for method chaining
       */
      throwOnError() {
          this.shouldThrowOnError = true;
          return this;
      }
      /**
       * @alpha
       *
       * Creates a new analytics bucket using Iceberg tables
       * Analytics buckets are optimized for analytical queries and data processing
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @param name A unique name for the bucket you are creating
       * @returns Promise with response containing newly created analytics bucket or error
       *
       * @example Create analytics bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .analytics
       *   .createBucket('analytics-data')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "name": "analytics-data",
       *     "type": "ANALYTICS",
       *     "format": "iceberg",
       *     "created_at": "2024-05-22T22:26:05.100Z",
       *     "updated_at": "2024-05-22T22:26:05.100Z"
       *   },
       *   "error": null
       * }
       * ```
       */
      createBucket(name) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield post$1(this.fetch, `${this.url}/bucket`, { name }, { headers: this.headers });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * @alpha
       *
       * Retrieves the details of all Analytics Storage buckets within an existing project
       * Only returns buckets of type 'ANALYTICS'
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @param options Query parameters for listing buckets
       * @param options.limit Maximum number of buckets to return
       * @param options.offset Number of buckets to skip
       * @param options.sortColumn Column to sort by ('name', 'created_at', 'updated_at')
       * @param options.sortOrder Sort order ('asc' or 'desc')
       * @param options.search Search term to filter bucket names
       * @returns Promise with response containing array of analytics buckets or error
       *
       * @example List analytics buckets
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .analytics
       *   .listBuckets({
       *     limit: 10,
       *     offset: 0,
       *     sortColumn: 'created_at',
       *     sortOrder: 'desc'
       *   })
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": [
       *     {
       *       "name": "analytics-data",
       *       "type": "ANALYTICS",
       *       "format": "iceberg",
       *       "created_at": "2024-05-22T22:26:05.100Z",
       *       "updated_at": "2024-05-22T22:26:05.100Z"
       *     }
       *   ],
       *   "error": null
       * }
       * ```
       */
      listBuckets(options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  // Build query string from options
                  const queryParams = new URLSearchParams();
                  if ((options === null || options === void 0 ? void 0 : options.limit) !== undefined)
                      queryParams.set('limit', options.limit.toString());
                  if ((options === null || options === void 0 ? void 0 : options.offset) !== undefined)
                      queryParams.set('offset', options.offset.toString());
                  if (options === null || options === void 0 ? void 0 : options.sortColumn)
                      queryParams.set('sortColumn', options.sortColumn);
                  if (options === null || options === void 0 ? void 0 : options.sortOrder)
                      queryParams.set('sortOrder', options.sortOrder);
                  if (options === null || options === void 0 ? void 0 : options.search)
                      queryParams.set('search', options.search);
                  const queryString = queryParams.toString();
                  const url = queryString ? `${this.url}/bucket?${queryString}` : `${this.url}/bucket`;
                  const data = yield get(this.fetch, url, { headers: this.headers });
                  return { data: data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * @alpha
       *
       * Deletes an existing analytics bucket
       * A bucket can't be deleted with existing objects inside it
       * You must first empty the bucket before deletion
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @param bucketName The unique identifier of the bucket you would like to delete
       * @returns Promise with response containing success message or error
       *
       * @example Delete analytics bucket
       * ```js
       * const { data, error } = await supabase
       *   .storage
       *   .analytics
       *   .deleteBucket('analytics-data')
       * ```
       *
       * Response:
       * ```json
       * {
       *   "data": {
       *     "message": "Successfully deleted"
       *   },
       *   "error": null
       * }
       * ```
       */
      deleteBucket(bucketName) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield remove(this.fetch, `${this.url}/bucket/${bucketName}`, {}, { headers: this.headers });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /**
       * @alpha
       *
       * Get an Iceberg REST Catalog client configured for a specific analytics bucket
       * Use this to perform advanced table and namespace operations within the bucket
       * The returned client provides full access to the Apache Iceberg REST Catalog API
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @param bucketName - The name of the analytics bucket (warehouse) to connect to
       * @returns Configured IcebergRestCatalog instance for advanced Iceberg operations
       *
       * @example Get catalog and create table
       * ```js
       * // First, create an analytics bucket
       * const { data: bucket, error: bucketError } = await supabase
       *   .storage
       *   .analytics
       *   .createBucket('analytics-data')
       *
       * // Get the Iceberg catalog for that bucket
       * const catalog = supabase.storage.analytics.from('analytics-data')
       *
       * // Create a namespace
       * await catalog.createNamespace({ namespace: ['default'] })
       *
       * // Create a table with schema
       * await catalog.createTable(
       *   { namespace: ['default'] },
       *   {
       *     name: 'events',
       *     schema: {
       *       type: 'struct',
       *       fields: [
       *         { id: 1, name: 'id', type: 'long', required: true },
       *         { id: 2, name: 'timestamp', type: 'timestamp', required: true },
       *         { id: 3, name: 'user_id', type: 'string', required: false }
       *       ],
       *       'schema-id': 0,
       *       'identifier-field-ids': [1]
       *     },
       *     'partition-spec': {
       *       'spec-id': 0,
       *       fields: []
       *     },
       *     'write-order': {
       *       'order-id': 0,
       *       fields: []
       *     },
       *     properties: {
       *       'write.format.default': 'parquet'
       *     }
       *   }
       * )
       * ```
       *
       * @example List tables in namespace
       * ```js
       * const catalog = supabase.storage.analytics.from('analytics-data')
       *
       * // List all tables in the default namespace
       * const tables = await catalog.listTables({ namespace: ['default'] })
       * console.log(tables) // [{ namespace: ['default'], name: 'events' }]
       * ```
       *
       * @example Working with namespaces
       * ```js
       * const catalog = supabase.storage.analytics.from('analytics-data')
       *
       * // List all namespaces
       * const namespaces = await catalog.listNamespaces()
       *
       * // Create namespace with properties
       * await catalog.createNamespace(
       *   { namespace: ['production'] },
       *   { properties: { owner: 'data-team', env: 'prod' } }
       * )
       * ```
       *
       * @example Cleanup operations
       * ```js
       * const catalog = supabase.storage.analytics.from('analytics-data')
       *
       * // Drop table with purge option (removes all data)
       * await catalog.dropTable(
       *   { namespace: ['default'], name: 'events' },
       *   { purge: true }
       * )
       *
       * // Drop namespace (must be empty)
       * await catalog.dropNamespace({ namespace: ['default'] })
       * ```
       *
       * @example Error handling with catalog operations
       * ```js
       * import { IcebergError } from 'iceberg-js'
       *
       * const catalog = supabase.storage.analytics.from('analytics-data')
       *
       * try {
       *   await catalog.dropTable({ namespace: ['default'], name: 'events' }, { purge: true })
       * } catch (error) {
       *   // Handle 404 errors (resource not found)
       *   const is404 =
       *     (error instanceof IcebergError && error.status === 404) ||
       *     error?.status === 404 ||
       *     error?.details?.error?.code === 404
       *
       *   if (is404) {
       *     console.log('Table does not exist')
       *   } else {
       *     throw error // Re-throw other errors
       *   }
       * }
       * ```
       *
       * @remarks
       * This method provides a bridge between Supabase's bucket management and the standard
       * Apache Iceberg REST Catalog API. The bucket name maps to the Iceberg warehouse parameter.
       * All authentication and configuration is handled automatically using your Supabase credentials.
       *
       * **Error Handling**: Operations may throw `IcebergError` from the iceberg-js library.
       * Always handle 404 errors gracefully when checking for resource existence.
       *
       * **Cleanup Operations**: When using `dropTable`, the `purge: true` option permanently
       * deletes all table data. Without it, the table is marked as deleted but data remains.
       *
       * **Library Dependency**: The returned catalog is an instance of `IcebergRestCatalog`
       * from iceberg-js. For complete API documentation and advanced usage, refer to the
       * [iceberg-js documentation](https://supabase.github.io/iceberg-js/).
       *
       * For advanced Iceberg operations beyond bucket management, you can also install and use
       * the `iceberg-js` package directly with manual configuration.
       */
      from(bucketName) {
          // Validate bucket name using same rules as Supabase Storage API backend
          if (!isValidBucketName(bucketName)) {
              throw new StorageError('Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines ' +
                  'and should avoid the use of any other characters.');
          }
          // Construct the Iceberg REST Catalog URL
          // The base URL is /storage/v1/iceberg
          // Note: IcebergRestCatalog from iceberg-js automatically adds /v1/ prefix to API paths
          // so we should NOT append /v1 here (it would cause double /v1/v1/ in the URL)
          return new IcebergRestCatalog({
              baseUrl: this.url,
              catalogName: bucketName, // Maps to the warehouse parameter in Supabase's implementation
              auth: {
                  type: 'custom',
                  getHeaders: () => __awaiter(this, void 0, void 0, function* () { return this.headers; }),
              },
              fetch: this.fetch,
          });
      }
  }

  const DEFAULT_HEADERS$2 = {
      'X-Client-Info': `storage-js/${version$2}`,
      'Content-Type': 'application/json',
  };

  /**
   * Base error class for all Storage Vectors errors
   */
  class StorageVectorsError extends Error {
      constructor(message) {
          super(message);
          this.__isStorageVectorsError = true;
          this.name = 'StorageVectorsError';
      }
  }
  /**
   * Type guard to check if an error is a StorageVectorsError
   * @param error - The error to check
   * @returns True if the error is a StorageVectorsError
   */
  function isStorageVectorsError(error) {
      return typeof error === 'object' && error !== null && '__isStorageVectorsError' in error;
  }
  /**
   * API error returned from S3 Vectors service
   * Includes HTTP status code and service-specific error code
   */
  class StorageVectorsApiError extends StorageVectorsError {
      constructor(message, status, statusCode) {
          super(message);
          this.name = 'StorageVectorsApiError';
          this.status = status;
          this.statusCode = statusCode;
      }
      toJSON() {
          return {
              name: this.name,
              message: this.message,
              status: this.status,
              statusCode: this.statusCode,
          };
      }
  }
  /**
   * Unknown error that doesn't match expected error patterns
   * Wraps the original error for debugging
   */
  class StorageVectorsUnknownError extends StorageVectorsError {
      constructor(message, originalError) {
          super(message);
          this.name = 'StorageVectorsUnknownError';
          this.originalError = originalError;
      }
  }
  /**
   * Error codes specific to S3 Vectors API
   * Maps AWS service errors to application-friendly error codes
   */
  var StorageVectorsErrorCode;
  (function (StorageVectorsErrorCode) {
      /** Internal server fault (HTTP 500) */
      StorageVectorsErrorCode["InternalError"] = "InternalError";
      /** Resource already exists / conflict (HTTP 409) */
      StorageVectorsErrorCode["S3VectorConflictException"] = "S3VectorConflictException";
      /** Resource not found (HTTP 404) */
      StorageVectorsErrorCode["S3VectorNotFoundException"] = "S3VectorNotFoundException";
      /** Delete bucket while not empty (HTTP 400) */
      StorageVectorsErrorCode["S3VectorBucketNotEmpty"] = "S3VectorBucketNotEmpty";
      /** Exceeds bucket quota/limit (HTTP 400) */
      StorageVectorsErrorCode["S3VectorMaxBucketsExceeded"] = "S3VectorMaxBucketsExceeded";
      /** Exceeds index quota/limit (HTTP 400) */
      StorageVectorsErrorCode["S3VectorMaxIndexesExceeded"] = "S3VectorMaxIndexesExceeded";
  })(StorageVectorsErrorCode || (StorageVectorsErrorCode = {}));

  /**
   * Resolves the fetch implementation to use
   * Uses custom fetch if provided, otherwise uses native fetch
   *
   * @param customFetch - Optional custom fetch implementation
   * @returns Resolved fetch function
   */
  const resolveFetch$2 = (customFetch) => {
      if (customFetch) {
          return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
  };
  /**
   * Determine if input is a plain object
   * An object is plain if it's created by either {}, new Object(), or Object.create(null)
   *
   * @param value - Value to check
   * @returns True if value is a plain object
   * @source https://github.com/sindresorhus/is-plain-obj
   */
  const isPlainObject = (value) => {
      if (typeof value !== 'object' || value === null) {
          return false;
      }
      const prototype = Object.getPrototypeOf(value);
      return ((prototype === null ||
          prototype === Object.prototype ||
          Object.getPrototypeOf(prototype) === null) &&
          !(Symbol.toStringTag in value) &&
          !(Symbol.iterator in value));
  };

  /**
   * Extracts error message from various error response formats
   * @param err - Error object from API
   * @returns Human-readable error message
   */
  const _getErrorMessage$1 = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
  /**
   * Handles fetch errors and converts them to StorageVectors error types
   * @param error - The error caught from fetch
   * @param reject - Promise rejection function
   * @param options - Fetch options that may affect error handling
   */
  const handleError$1 = (error, reject, options) => __awaiter(void 0, void 0, void 0, function* () {
      // Check if error is a Response-like object (has status and ok properties)
      // This is more reliable than instanceof which can fail across realms
      const isResponseLike = error &&
          typeof error === 'object' &&
          'status' in error &&
          'ok' in error &&
          typeof error.status === 'number';
      if (isResponseLike && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) {
          const status = error.status || 500;
          const responseError = error;
          // Try to parse JSON body if available
          if (typeof responseError.json === 'function') {
              responseError
                  .json()
                  .then((err) => {
                  const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || (err === null || err === void 0 ? void 0 : err.code) || status + '';
                  reject(new StorageVectorsApiError(_getErrorMessage$1(err), status, statusCode));
              })
                  .catch(() => {
                  // If JSON parsing fails, create an ApiError with the HTTP status code
                  const statusCode = status + '';
                  const message = responseError.statusText || `HTTP ${status} error`;
                  reject(new StorageVectorsApiError(message, status, statusCode));
              });
          }
          else {
              // No json() method available, create error from status
              const statusCode = status + '';
              const message = responseError.statusText || `HTTP ${status} error`;
              reject(new StorageVectorsApiError(message, status, statusCode));
          }
      }
      else {
          reject(new StorageVectorsUnknownError(_getErrorMessage$1(error), error));
      }
  });
  /**
   * Builds request parameters for fetch calls
   * @param method - HTTP method
   * @param options - Custom fetch options
   * @param parameters - Additional fetch parameters like AbortSignal
   * @param body - Request body (will be JSON stringified if plain object)
   * @returns Complete fetch request parameters
   */
  const _getRequestParams$1 = (method, options, parameters, body) => {
      const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
      if (!body) {
          return params;
      }
      if (isPlainObject(body)) {
          params.headers = Object.assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers);
          params.body = JSON.stringify(body);
      }
      else {
          params.body = body;
      }
      return Object.assign(Object.assign({}, params), parameters);
  };
  /**
   * Internal request handler that wraps fetch with error handling
   * @param fetcher - Fetch function to use
   * @param method - HTTP method
   * @param url - Request URL
   * @param options - Custom fetch options
   * @param parameters - Additional fetch parameters
   * @param body - Request body
   * @returns Promise with parsed response or error
   */
  function _handleRequest$1(fetcher, method, url, options, parameters, body) {
      return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => {
              fetcher(url, _getRequestParams$1(method, options, parameters, body))
                  .then((result) => {
                  if (!result.ok)
                      throw result;
                  if (options === null || options === void 0 ? void 0 : options.noResolveJson)
                      return result;
                  // Handle empty responses (204, empty body)
                  const contentType = result.headers.get('content-type');
                  if (!contentType || !contentType.includes('application/json')) {
                      return {};
                  }
                  return result.json();
              })
                  .then((data) => resolve(data))
                  .catch((error) => handleError$1(error, reject, options));
          });
      });
  }
  /**
   * Performs a POST request
   * @param fetcher - Fetch function to use
   * @param url - Request URL
   * @param body - Request body to be JSON stringified
   * @param options - Custom fetch options
   * @param parameters - Additional fetch parameters
   * @returns Promise with parsed response
   */
  function post(fetcher, url, body, options, parameters) {
      return __awaiter(this, void 0, void 0, function* () {
          return _handleRequest$1(fetcher, 'POST', url, options, parameters, body);
      });
  }

  /**
   * @hidden
   * Base implementation for vector index operations.
   * Use {@link VectorBucketScope} via `supabase.storage.vectors.from('bucket')` instead.
   */
  class VectorIndexApi {
      /** Creates a new VectorIndexApi instance */
      constructor(url, headers = {}, fetch) {
          this.shouldThrowOnError = false;
          this.url = url.replace(/\/$/, '');
          this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$2), headers);
          this.fetch = resolveFetch$2(fetch);
      }
      /** Enable throwing errors instead of returning them in the response */
      throwOnError() {
          this.shouldThrowOnError = true;
          return this;
      }
      /** Creates a new vector index within a bucket */
      createIndex(options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield post(this.fetch, `${this.url}/CreateIndex`, options, {
                      headers: this.headers,
                  });
                  return { data: data || {}, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageVectorsError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /** Retrieves metadata for a specific vector index */
      getIndex(vectorBucketName, indexName) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield post(this.fetch, `${this.url}/GetIndex`, { vectorBucketName, indexName }, { headers: this.headers });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageVectorsError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /** Lists vector indexes within a bucket with optional filtering and pagination */
      listIndexes(options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield post(this.fetch, `${this.url}/ListIndexes`, options, {
                      headers: this.headers,
                  });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageVectorsError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /** Deletes a vector index and all its data */
      deleteIndex(vectorBucketName, indexName) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield post(this.fetch, `${this.url}/DeleteIndex`, { vectorBucketName, indexName }, { headers: this.headers });
                  return { data: data || {}, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageVectorsError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
  }

  /**
   * @hidden
   * Base implementation for vector data operations.
   * Use {@link VectorIndexScope} via `supabase.storage.vectors.from('bucket').index('idx')` instead.
   */
  class VectorDataApi {
      /** Creates a new VectorDataApi instance */
      constructor(url, headers = {}, fetch) {
          this.shouldThrowOnError = false;
          this.url = url.replace(/\/$/, '');
          this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$2), headers);
          this.fetch = resolveFetch$2(fetch);
      }
      /** Enable throwing errors instead of returning them in the response */
      throwOnError() {
          this.shouldThrowOnError = true;
          return this;
      }
      /** Inserts or updates vectors in batch (1-500 per request) */
      putVectors(options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  // Validate batch size
                  if (options.vectors.length < 1 || options.vectors.length > 500) {
                      throw new Error('Vector batch size must be between 1 and 500 items');
                  }
                  const data = yield post(this.fetch, `${this.url}/PutVectors`, options, {
                      headers: this.headers,
                  });
                  return { data: data || {}, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageVectorsError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /** Retrieves vectors by their keys in batch */
      getVectors(options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield post(this.fetch, `${this.url}/GetVectors`, options, {
                      headers: this.headers,
                  });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageVectorsError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /** Lists vectors in an index with pagination */
      listVectors(options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  // Validate segment configuration
                  if (options.segmentCount !== undefined) {
                      if (options.segmentCount < 1 || options.segmentCount > 16) {
                          throw new Error('segmentCount must be between 1 and 16');
                      }
                      if (options.segmentIndex !== undefined) {
                          if (options.segmentIndex < 0 || options.segmentIndex >= options.segmentCount) {
                              throw new Error(`segmentIndex must be between 0 and ${options.segmentCount - 1}`);
                          }
                      }
                  }
                  const data = yield post(this.fetch, `${this.url}/ListVectors`, options, {
                      headers: this.headers,
                  });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageVectorsError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /** Queries for similar vectors using approximate nearest neighbor search */
      queryVectors(options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield post(this.fetch, `${this.url}/QueryVectors`, options, {
                      headers: this.headers,
                  });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageVectorsError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /** Deletes vectors by their keys in batch (1-500 per request) */
      deleteVectors(options) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  // Validate batch size
                  if (options.keys.length < 1 || options.keys.length > 500) {
                      throw new Error('Keys batch size must be between 1 and 500 items');
                  }
                  const data = yield post(this.fetch, `${this.url}/DeleteVectors`, options, {
                      headers: this.headers,
                  });
                  return { data: data || {}, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageVectorsError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
  }

  /**
   * @hidden
   * Base implementation for vector bucket operations.
   * Use {@link StorageVectorsClient} via `supabase.storage.vectors` instead.
   */
  class VectorBucketApi {
      /** Creates a new VectorBucketApi instance */
      constructor(url, headers = {}, fetch) {
          this.shouldThrowOnError = false;
          this.url = url.replace(/\/$/, '');
          this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$2), headers);
          this.fetch = resolveFetch$2(fetch);
      }
      /** Enable throwing errors instead of returning them in the response */
      throwOnError() {
          this.shouldThrowOnError = true;
          return this;
      }
      /** Creates a new vector bucket */
      createBucket(vectorBucketName) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield post(this.fetch, `${this.url}/CreateVectorBucket`, { vectorBucketName }, { headers: this.headers });
                  return { data: data || {}, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageVectorsError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /** Retrieves metadata for a specific vector bucket */
      getBucket(vectorBucketName) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield post(this.fetch, `${this.url}/GetVectorBucket`, { vectorBucketName }, { headers: this.headers });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageVectorsError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /** Lists vector buckets with optional filtering and pagination */
      listBuckets() {
          return __awaiter(this, arguments, void 0, function* (options = {}) {
              try {
                  const data = yield post(this.fetch, `${this.url}/ListVectorBuckets`, options, {
                      headers: this.headers,
                  });
                  return { data, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageVectorsError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
      /** Deletes a vector bucket (must be empty first) */
      deleteBucket(vectorBucketName) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  const data = yield post(this.fetch, `${this.url}/DeleteVectorBucket`, { vectorBucketName }, { headers: this.headers });
                  return { data: data || {}, error: null };
              }
              catch (error) {
                  if (this.shouldThrowOnError) {
                      throw error;
                  }
                  if (isStorageVectorsError(error)) {
                      return { data: null, error };
                  }
                  throw error;
              }
          });
      }
  }

  /**
   *
   * @alpha
   *
   * Main client for interacting with S3 Vectors API
   * Provides access to bucket, index, and vector data operations
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * **Usage Patterns:**
   *
   * ```typescript
   * const { data, error } = await supabase
   *  .storage
   *  .vectors
   *  .createBucket('embeddings-prod')
   *
   * // Access index operations via buckets
   * const bucket = supabase.storage.vectors.from('embeddings-prod')
   * await bucket.createIndex({
   *   indexName: 'documents',
   *   dataType: 'float32',
   *   dimension: 1536,
   *   distanceMetric: 'cosine'
   * })
   *
   * // Access vector operations via index
   * const index = bucket.index('documents')
   * await index.putVectors({
   *   vectors: [
   *     { key: 'doc-1', data: { float32: [...] }, metadata: { title: 'Intro' } }
   *   ]
   * })
   *
   * // Query similar vectors
   * const { data } = await index.queryVectors({
   *   queryVector: { float32: [...] },
   *   topK: 5,
   *   returnDistance: true
   * })
   * ```
   */
  class StorageVectorsClient extends VectorBucketApi {
      /**
       * @alpha
       *
       * Creates a StorageVectorsClient that can manage buckets, indexes, and vectors.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param url - Base URL of the Storage Vectors REST API.
       * @param options.headers - Optional headers (for example `Authorization`) applied to every request.
       * @param options.fetch - Optional custom `fetch` implementation for non-browser runtimes.
       *
       * @example
       * ```typescript
       * const client = new StorageVectorsClient(url, options)
       * ```
       */
      constructor(url, options = {}) {
          super(url, options.headers || {}, options.fetch);
      }
      /**
       *
       * @alpha
       *
       * Access operations for a specific vector bucket
       * Returns a scoped client for index and vector operations within the bucket
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param vectorBucketName - Name of the vector bucket
       * @returns Bucket-scoped client with index and vector operations
       *
       * @example
       * ```typescript
       * const bucket = supabase.storage.vectors.from('embeddings-prod')
       * ```
       */
      from(vectorBucketName) {
          return new VectorBucketScope(this.url, this.headers, vectorBucketName, this.fetch);
      }
      /**
       *
       * @alpha
       *
       * Creates a new vector bucket
       * Vector buckets are containers for vector indexes and their data
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param vectorBucketName - Unique name for the vector bucket
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const { data, error } = await supabase
       *   .storage
       *   .vectors
       *   .createBucket('embeddings-prod')
       * ```
       */
      createBucket(vectorBucketName) {
          const _super = Object.create(null, {
              createBucket: { get: () => super.createBucket }
          });
          return __awaiter(this, void 0, void 0, function* () {
              return _super.createBucket.call(this, vectorBucketName);
          });
      }
      /**
       *
       * @alpha
       *
       * Retrieves metadata for a specific vector bucket
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param vectorBucketName - Name of the vector bucket
       * @returns Promise with bucket metadata or error
       *
       * @example
       * ```typescript
       * const { data, error } = await supabase
       *   .storage
       *   .vectors
       *   .getBucket('embeddings-prod')
       *
       * console.log('Bucket created:', data?.vectorBucket.creationTime)
       * ```
       */
      getBucket(vectorBucketName) {
          const _super = Object.create(null, {
              getBucket: { get: () => super.getBucket }
          });
          return __awaiter(this, void 0, void 0, function* () {
              return _super.getBucket.call(this, vectorBucketName);
          });
      }
      /**
       *
       * @alpha
       *
       * Lists all vector buckets with optional filtering and pagination
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Optional filters (prefix, maxResults, nextToken)
       * @returns Promise with list of buckets or error
       *
       * @example
       * ```typescript
       * const { data, error } = await supabase
       *   .storage
       *   .vectors
       *   .listBuckets({ prefix: 'embeddings-' })
       *
       * data?.vectorBuckets.forEach(bucket => {
       *   console.log(bucket.vectorBucketName)
       * })
       * ```
       */
      listBuckets() {
          const _super = Object.create(null, {
              listBuckets: { get: () => super.listBuckets }
          });
          return __awaiter(this, arguments, void 0, function* (options = {}) {
              return _super.listBuckets.call(this, options);
          });
      }
      /**
       *
       * @alpha
       *
       * Deletes a vector bucket (bucket must be empty)
       * All indexes must be deleted before deleting the bucket
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param vectorBucketName - Name of the vector bucket to delete
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const { data, error } = await supabase
       *   .storage
       *   .vectors
       *   .deleteBucket('embeddings-old')
       * ```
       */
      deleteBucket(vectorBucketName) {
          const _super = Object.create(null, {
              deleteBucket: { get: () => super.deleteBucket }
          });
          return __awaiter(this, void 0, void 0, function* () {
              return _super.deleteBucket.call(this, vectorBucketName);
          });
      }
  }
  /**
   *
   * @alpha
   *
   * Scoped client for operations within a specific vector bucket
   * Provides index management and access to vector operations
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   */
  class VectorBucketScope extends VectorIndexApi {
      /**
       * @alpha
       *
       * Creates a helper that automatically scopes all index operations to the provided bucket.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @example
       * ```typescript
       * const bucket = supabase.storage.vectors.from('embeddings-prod')
       * ```
       */
      constructor(url, headers, vectorBucketName, fetch) {
          super(url, headers, fetch);
          this.vectorBucketName = vectorBucketName;
      }
      /**
       *
       * @alpha
       *
       * Creates a new vector index in this bucket
       * Convenience method that automatically includes the bucket name
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Index configuration (vectorBucketName is automatically set)
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const bucket = supabase.storage.vectors.from('embeddings-prod')
       * await bucket.createIndex({
       *   indexName: 'documents-openai',
       *   dataType: 'float32',
       *   dimension: 1536,
       *   distanceMetric: 'cosine',
       *   metadataConfiguration: {
       *     nonFilterableMetadataKeys: ['raw_text']
       *   }
       * })
       * ```
       */
      createIndex(options) {
          const _super = Object.create(null, {
              createIndex: { get: () => super.createIndex }
          });
          return __awaiter(this, void 0, void 0, function* () {
              return _super.createIndex.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName }));
          });
      }
      /**
       *
       * @alpha
       *
       * Lists indexes in this bucket
       * Convenience method that automatically includes the bucket name
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Listing options (vectorBucketName is automatically set)
       * @returns Promise with response containing indexes array and pagination token or error
       *
       * @example
       * ```typescript
       * const bucket = supabase.storage.vectors.from('embeddings-prod')
       * const { data } = await bucket.listIndexes({ prefix: 'documents-' })
       * ```
       */
      listIndexes() {
          const _super = Object.create(null, {
              listIndexes: { get: () => super.listIndexes }
          });
          return __awaiter(this, arguments, void 0, function* (options = {}) {
              return _super.listIndexes.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName }));
          });
      }
      /**
       *
       * @alpha
       *
       * Retrieves metadata for a specific index in this bucket
       * Convenience method that automatically includes the bucket name
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param indexName - Name of the index to retrieve
       * @returns Promise with index metadata or error
       *
       * @example
       * ```typescript
       * const bucket = supabase.storage.vectors.from('embeddings-prod')
       * const { data } = await bucket.getIndex('documents-openai')
       * console.log('Dimension:', data?.index.dimension)
       * ```
       */
      getIndex(indexName) {
          const _super = Object.create(null, {
              getIndex: { get: () => super.getIndex }
          });
          return __awaiter(this, void 0, void 0, function* () {
              return _super.getIndex.call(this, this.vectorBucketName, indexName);
          });
      }
      /**
       *
       * @alpha
       *
       * Deletes an index from this bucket
       * Convenience method that automatically includes the bucket name
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param indexName - Name of the index to delete
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const bucket = supabase.storage.vectors.from('embeddings-prod')
       * await bucket.deleteIndex('old-index')
       * ```
       */
      deleteIndex(indexName) {
          const _super = Object.create(null, {
              deleteIndex: { get: () => super.deleteIndex }
          });
          return __awaiter(this, void 0, void 0, function* () {
              return _super.deleteIndex.call(this, this.vectorBucketName, indexName);
          });
      }
      /**
       *
       * @alpha
       *
       * Access operations for a specific index within this bucket
       * Returns a scoped client for vector data operations
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param indexName - Name of the index
       * @returns Index-scoped client with vector data operations
       *
       * @example
       * ```typescript
       * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
       *
       * // Insert vectors
       * await index.putVectors({
       *   vectors: [
       *     { key: 'doc-1', data: { float32: [...] }, metadata: { title: 'Intro' } }
       *   ]
       * })
       *
       * // Query similar vectors
       * const { data } = await index.queryVectors({
       *   queryVector: { float32: [...] },
       *   topK: 5
       * })
       * ```
       */
      index(indexName) {
          return new VectorIndexScope(this.url, this.headers, this.vectorBucketName, indexName, this.fetch);
      }
  }
  /**
   *
   * @alpha
   *
   * Scoped client for operations within a specific vector index
   * Provides vector data operations (put, get, list, query, delete)
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   */
  class VectorIndexScope extends VectorDataApi {
      /**
       *
       * @alpha
       *
       * Creates a helper that automatically scopes all vector operations to the provided bucket/index names.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @example
       * ```typescript
       * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
       * ```
       */
      constructor(url, headers, vectorBucketName, indexName, fetch) {
          super(url, headers, fetch);
          this.vectorBucketName = vectorBucketName;
          this.indexName = indexName;
      }
      /**
       *
       * @alpha
       *
       * Inserts or updates vectors in this index
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Vector insertion options (bucket and index names automatically set)
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
       * await index.putVectors({
       *   vectors: [
       *     {
       *       key: 'doc-1',
       *       data: { float32: [0.1, 0.2, ...] },
       *       metadata: { title: 'Introduction', page: 1 }
       *     }
       *   ]
       * })
       * ```
       */
      putVectors(options) {
          const _super = Object.create(null, {
              putVectors: { get: () => super.putVectors }
          });
          return __awaiter(this, void 0, void 0, function* () {
              return _super.putVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
          });
      }
      /**
       *
       * @alpha
       *
       * Retrieves vectors by keys from this index
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Vector retrieval options (bucket and index names automatically set)
       * @returns Promise with response containing vectors array or error
       *
       * @example
       * ```typescript
       * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
       * const { data } = await index.getVectors({
       *   keys: ['doc-1', 'doc-2'],
       *   returnMetadata: true
       * })
       * ```
       */
      getVectors(options) {
          const _super = Object.create(null, {
              getVectors: { get: () => super.getVectors }
          });
          return __awaiter(this, void 0, void 0, function* () {
              return _super.getVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
          });
      }
      /**
       *
       * @alpha
       *
       * Lists vectors in this index with pagination
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Listing options (bucket and index names automatically set)
       * @returns Promise with response containing vectors array and pagination token or error
       *
       * @example
       * ```typescript
       * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
       * const { data } = await index.listVectors({
       *   maxResults: 500,
       *   returnMetadata: true
       * })
       * ```
       */
      listVectors() {
          const _super = Object.create(null, {
              listVectors: { get: () => super.listVectors }
          });
          return __awaiter(this, arguments, void 0, function* (options = {}) {
              return _super.listVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
          });
      }
      /**
       *
       * @alpha
       *
       * Queries for similar vectors in this index
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Query options (bucket and index names automatically set)
       * @returns Promise with response containing matches array of similar vectors ordered by distance or error
       *
       * @example
       * ```typescript
       * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
       * const { data } = await index.queryVectors({
       *   queryVector: { float32: [0.1, 0.2, ...] },
       *   topK: 5,
       *   filter: { category: 'technical' },
       *   returnDistance: true,
       *   returnMetadata: true
       * })
       * ```
       */
      queryVectors(options) {
          const _super = Object.create(null, {
              queryVectors: { get: () => super.queryVectors }
          });
          return __awaiter(this, void 0, void 0, function* () {
              return _super.queryVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
          });
      }
      /**
       *
       * @alpha
       *
       * Deletes vectors by keys from this index
       * Convenience method that automatically includes bucket and index names
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @param options - Deletion options (bucket and index names automatically set)
       * @returns Promise with empty response on success or error
       *
       * @example
       * ```typescript
       * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
       * await index.deleteVectors({
       *   keys: ['doc-1', 'doc-2', 'doc-3']
       * })
       * ```
       */
      deleteVectors(options) {
          const _super = Object.create(null, {
              deleteVectors: { get: () => super.deleteVectors }
          });
          return __awaiter(this, void 0, void 0, function* () {
              return _super.deleteVectors.call(this, Object.assign(Object.assign({}, options), { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
          });
      }
  }

  class StorageClient extends StorageBucketApi {
      /**
       * Creates a client for Storage buckets, files, analytics, and vectors.
       *
       * @category File Buckets
       * @example
       * ```ts
       * import { StorageClient } from '@supabase/storage-js'
       *
       * const storage = new StorageClient('https://xyzcompany.supabase.co/storage/v1', {
       *   apikey: 'public-anon-key',
       * })
       * const avatars = storage.from('avatars')
       * ```
       */
      constructor(url, headers = {}, fetch, opts) {
          super(url, headers, fetch, opts);
      }
      /**
       * Perform file operation in a bucket.
       *
       * @category File Buckets
       * @param id The bucket id to operate on.
       *
       * @example
       * ```typescript
       * const avatars = supabase.storage.from('avatars')
       * ```
       */
      from(id) {
          return new StorageFileApi(this.url, this.headers, id, this.fetch);
      }
      /**
       *
       * @alpha
       *
       * Access vector storage operations.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Vector Buckets
       * @returns A StorageVectorsClient instance configured with the current storage settings.
       */
      get vectors() {
          return new StorageVectorsClient(this.url + '/vector', {
              headers: this.headers,
              fetch: this.fetch,
          });
      }
      /**
       *
       * @alpha
       *
       * Access analytics storage operations using Iceberg tables.
       *
       * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
       *
       * @category Analytics Buckets
       * @returns A StorageAnalyticsClient instance configured with the current storage settings.
       */
      get analytics() {
          return new StorageAnalyticsClient(this.url + '/iceberg', this.headers, this.fetch);
      }
  }

  // Generated automatically during releases by scripts/update-version-files.ts
  // This file provides runtime access to the package version for:
  // - HTTP request headers (e.g., X-Client-Info header for API requests)
  // - Debugging and support (identifying which version is running)
  // - Telemetry and logging (version reporting in errors/analytics)
  // - Ensuring build artifacts match the published package version
  const version$1 = '2.86.0';

  let JS_ENV = '';
  // @ts-ignore
  if (typeof Deno !== 'undefined') {
      JS_ENV = 'deno';
  }
  else if (typeof document !== 'undefined') {
      JS_ENV = 'web';
  }
  else if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      JS_ENV = 'react-native';
  }
  else {
      JS_ENV = 'node';
  }
  const DEFAULT_HEADERS$1 = { 'X-Client-Info': `supabase-js-${JS_ENV}/${version$1}` };
  const DEFAULT_GLOBAL_OPTIONS = {
      headers: DEFAULT_HEADERS$1,
  };
  const DEFAULT_DB_OPTIONS = {
      schema: 'public',
  };
  const DEFAULT_AUTH_OPTIONS = {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'implicit',
  };
  const DEFAULT_REALTIME_OPTIONS = {};

  const resolveFetch$1 = (customFetch) => {
      if (customFetch) {
          return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
  };
  const resolveHeadersConstructor = () => {
      return Headers;
  };
  const fetchWithAuth = (supabaseKey, getAccessToken, customFetch) => {
      const fetch = resolveFetch$1(customFetch);
      const HeadersConstructor = resolveHeadersConstructor();
      return async (input, init) => {
          var _a;
          const accessToken = (_a = (await getAccessToken())) !== null && _a !== void 0 ? _a : supabaseKey;
          let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
          if (!headers.has('apikey')) {
              headers.set('apikey', supabaseKey);
          }
          if (!headers.has('Authorization')) {
              headers.set('Authorization', `Bearer ${accessToken}`);
          }
          return fetch(input, Object.assign(Object.assign({}, init), { headers }));
      };
  };

  function ensureTrailingSlash(url) {
      return url.endsWith('/') ? url : url + '/';
  }
  function applySettingDefaults(options, defaults) {
      var _a, _b;
      const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions, } = options;
      const { db: DEFAULT_DB_OPTIONS, auth: DEFAULT_AUTH_OPTIONS, realtime: DEFAULT_REALTIME_OPTIONS, global: DEFAULT_GLOBAL_OPTIONS, } = defaults;
      const result = {
          db: Object.assign(Object.assign({}, DEFAULT_DB_OPTIONS), dbOptions),
          auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), authOptions),
          realtime: Object.assign(Object.assign({}, DEFAULT_REALTIME_OPTIONS), realtimeOptions),
          storage: {},
          global: Object.assign(Object.assign(Object.assign({}, DEFAULT_GLOBAL_OPTIONS), globalOptions), { headers: Object.assign(Object.assign({}, ((_a = DEFAULT_GLOBAL_OPTIONS === null || DEFAULT_GLOBAL_OPTIONS === void 0 ? void 0 : DEFAULT_GLOBAL_OPTIONS.headers) !== null && _a !== void 0 ? _a : {})), ((_b = globalOptions === null || globalOptions === void 0 ? void 0 : globalOptions.headers) !== null && _b !== void 0 ? _b : {})) }),
          accessToken: async () => '',
      };
      if (options.accessToken) {
          result.accessToken = options.accessToken;
      }
      else {
          // hack around Required<>
          delete result.accessToken;
      }
      return result;
  }
  /**
   * Validates a Supabase client URL
   *
   * @param {string} supabaseUrl - The Supabase client URL string.
   * @returns {URL} - The validated base URL.
   * @throws {Error}
   */
  function validateSupabaseUrl(supabaseUrl) {
      const trimmedUrl = supabaseUrl === null || supabaseUrl === void 0 ? void 0 : supabaseUrl.trim();
      if (!trimmedUrl) {
          throw new Error('supabaseUrl is required.');
      }
      if (!trimmedUrl.match(/^https?:\/\//i)) {
          throw new Error('Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.');
      }
      try {
          return new URL(ensureTrailingSlash(trimmedUrl));
      }
      catch (_a) {
          throw Error('Invalid supabaseUrl: Provided URL is malformed.');
      }
  }

  // Generated automatically during releases by scripts/update-version-files.ts
  // This file provides runtime access to the package version for:
  // - HTTP request headers (e.g., X-Client-Info header for API requests)
  // - Debugging and support (identifying which version is running)
  // - Telemetry and logging (version reporting in errors/analytics)
  // - Ensuring build artifacts match the published package version
  const version = '2.86.0';

  /** Current session will be checked for refresh at this interval. */
  const AUTO_REFRESH_TICK_DURATION_MS = 30 * 1000;
  /**
   * A token refresh will be attempted this many ticks before the current session expires. */
  const AUTO_REFRESH_TICK_THRESHOLD = 3;
  /*
   * Earliest time before an access token expires that the session should be refreshed.
   */
  const EXPIRY_MARGIN_MS = AUTO_REFRESH_TICK_THRESHOLD * AUTO_REFRESH_TICK_DURATION_MS;
  const GOTRUE_URL = 'http://localhost:9999';
  const STORAGE_KEY = 'supabase.auth.token';
  const DEFAULT_HEADERS = { 'X-Client-Info': `gotrue-js/${version}` };
  const API_VERSION_HEADER_NAME = 'X-Supabase-Api-Version';
  const API_VERSIONS = {
      '2024-01-01': {
          timestamp: Date.parse('2024-01-01T00:00:00.0Z'),
          name: '2024-01-01',
      },
  };
  const BASE64URL_REGEX = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i;
  const JWKS_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Base error thrown by Supabase Auth helpers.
   *
   * @example
   * ```ts
   * import { AuthError } from '@supabase/auth-js'
   *
   * throw new AuthError('Unexpected auth error', 500, 'unexpected')
   * ```
   */
  class AuthError extends Error {
      constructor(message, status, code) {
          super(message);
          this.__isAuthError = true;
          this.name = 'AuthError';
          this.status = status;
          this.code = code;
      }
  }
  function isAuthError(error) {
      return typeof error === 'object' && error !== null && '__isAuthError' in error;
  }
  /**
   * Error returned directly from the GoTrue REST API.
   *
   * @example
   * ```ts
   * import { AuthApiError } from '@supabase/auth-js'
   *
   * throw new AuthApiError('Invalid credentials', 400, 'invalid_credentials')
   * ```
   */
  class AuthApiError extends AuthError {
      constructor(message, status, code) {
          super(message, status, code);
          this.name = 'AuthApiError';
          this.status = status;
          this.code = code;
      }
  }
  function isAuthApiError(error) {
      return isAuthError(error) && error.name === 'AuthApiError';
  }
  /**
   * Wraps non-standard errors so callers can inspect the root cause.
   *
   * @example
   * ```ts
   * import { AuthUnknownError } from '@supabase/auth-js'
   *
   * try {
   *   await someAuthCall()
   * } catch (err) {
   *   throw new AuthUnknownError('Auth failed', err)
   * }
   * ```
   */
  class AuthUnknownError extends AuthError {
      constructor(message, originalError) {
          super(message);
          this.name = 'AuthUnknownError';
          this.originalError = originalError;
      }
  }
  /**
   * Flexible error class used to create named auth errors at runtime.
   *
   * @example
   * ```ts
   * import { CustomAuthError } from '@supabase/auth-js'
   *
   * throw new CustomAuthError('My custom auth error', 'MyAuthError', 400, 'custom_code')
   * ```
   */
  class CustomAuthError extends AuthError {
      constructor(message, name, status, code) {
          super(message, status, code);
          this.name = name;
          this.status = status;
      }
  }
  /**
   * Error thrown when an operation requires a session but none is present.
   *
   * @example
   * ```ts
   * import { AuthSessionMissingError } from '@supabase/auth-js'
   *
   * throw new AuthSessionMissingError()
   * ```
   */
  class AuthSessionMissingError extends CustomAuthError {
      constructor() {
          super('Auth session missing!', 'AuthSessionMissingError', 400, undefined);
      }
  }
  function isAuthSessionMissingError(error) {
      return isAuthError(error) && error.name === 'AuthSessionMissingError';
  }
  /**
   * Error thrown when the token response is malformed.
   *
   * @example
   * ```ts
   * import { AuthInvalidTokenResponseError } from '@supabase/auth-js'
   *
   * throw new AuthInvalidTokenResponseError()
   * ```
   */
  class AuthInvalidTokenResponseError extends CustomAuthError {
      constructor() {
          super('Auth session or user missing', 'AuthInvalidTokenResponseError', 500, undefined);
      }
  }
  /**
   * Error thrown when email/password credentials are invalid.
   *
   * @example
   * ```ts
   * import { AuthInvalidCredentialsError } from '@supabase/auth-js'
   *
   * throw new AuthInvalidCredentialsError('Email or password is incorrect')
   * ```
   */
  class AuthInvalidCredentialsError extends CustomAuthError {
      constructor(message) {
          super(message, 'AuthInvalidCredentialsError', 400, undefined);
      }
  }
  /**
   * Error thrown when implicit grant redirects contain an error.
   *
   * @example
   * ```ts
   * import { AuthImplicitGrantRedirectError } from '@supabase/auth-js'
   *
   * throw new AuthImplicitGrantRedirectError('OAuth redirect failed', {
   *   error: 'access_denied',
   *   code: 'oauth_error',
   * })
   * ```
   */
  class AuthImplicitGrantRedirectError extends CustomAuthError {
      constructor(message, details = null) {
          super(message, 'AuthImplicitGrantRedirectError', 500, undefined);
          this.details = null;
          this.details = details;
      }
      toJSON() {
          return {
              name: this.name,
              message: this.message,
              status: this.status,
              details: this.details,
          };
      }
  }
  function isAuthImplicitGrantRedirectError(error) {
      return isAuthError(error) && error.name === 'AuthImplicitGrantRedirectError';
  }
  /**
   * Error thrown during PKCE code exchanges.
   *
   * @example
   * ```ts
   * import { AuthPKCEGrantCodeExchangeError } from '@supabase/auth-js'
   *
   * throw new AuthPKCEGrantCodeExchangeError('PKCE exchange failed')
   * ```
   */
  class AuthPKCEGrantCodeExchangeError extends CustomAuthError {
      constructor(message, details = null) {
          super(message, 'AuthPKCEGrantCodeExchangeError', 500, undefined);
          this.details = null;
          this.details = details;
      }
      toJSON() {
          return {
              name: this.name,
              message: this.message,
              status: this.status,
              details: this.details,
          };
      }
  }
  /**
   * Error thrown when a transient fetch issue occurs.
   *
   * @example
   * ```ts
   * import { AuthRetryableFetchError } from '@supabase/auth-js'
   *
   * throw new AuthRetryableFetchError('Service temporarily unavailable', 503)
   * ```
   */
  class AuthRetryableFetchError extends CustomAuthError {
      constructor(message, status) {
          super(message, 'AuthRetryableFetchError', status, undefined);
      }
  }
  function isAuthRetryableFetchError(error) {
      return isAuthError(error) && error.name === 'AuthRetryableFetchError';
  }
  /**
   * This error is thrown on certain methods when the password used is deemed
   * weak. Inspect the reasons to identify what password strength rules are
   * inadequate.
   */
  /**
   * Error thrown when a supplied password is considered weak.
   *
   * @example
   * ```ts
   * import { AuthWeakPasswordError } from '@supabase/auth-js'
   *
   * throw new AuthWeakPasswordError('Password too short', 400, ['min_length'])
   * ```
   */
  class AuthWeakPasswordError extends CustomAuthError {
      constructor(message, status, reasons) {
          super(message, 'AuthWeakPasswordError', status, 'weak_password');
          this.reasons = reasons;
      }
  }
  function isAuthWeakPasswordError(error) {
      return isAuthError(error) && error.name === 'AuthWeakPasswordError';
  }
  /**
   * Error thrown when a JWT cannot be verified or parsed.
   *
   * @example
   * ```ts
   * import { AuthInvalidJwtError } from '@supabase/auth-js'
   *
   * throw new AuthInvalidJwtError('Token signature is invalid')
   * ```
   */
  class AuthInvalidJwtError extends CustomAuthError {
      constructor(message) {
          super(message, 'AuthInvalidJwtError', 400, 'invalid_jwt');
      }
  }

  /**
   * Avoid modifying this file. It's part of
   * https://github.com/supabase-community/base64url-js.  Submit all fixes on
   * that repo!
   */
  /**
   * An array of characters that encode 6 bits into a Base64-URL alphabet
   * character.
   */
  const TO_BASE64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split('');
  /**
   * An array of characters that can appear in a Base64-URL encoded string but
   * should be ignored.
   */
  const IGNORE_BASE64URL = ' \t\n\r='.split('');
  /**
   * An array of 128 numbers that map a Base64-URL character to 6 bits, or if -2
   * used to skip the character, or if -1 used to error out.
   */
  const FROM_BASE64URL = (() => {
      const charMap = new Array(128);
      for (let i = 0; i < charMap.length; i += 1) {
          charMap[i] = -1;
      }
      for (let i = 0; i < IGNORE_BASE64URL.length; i += 1) {
          charMap[IGNORE_BASE64URL[i].charCodeAt(0)] = -2;
      }
      for (let i = 0; i < TO_BASE64URL.length; i += 1) {
          charMap[TO_BASE64URL[i].charCodeAt(0)] = i;
      }
      return charMap;
  })();
  /**
   * Converts a byte to a Base64-URL string.
   *
   * @param byte The byte to convert, or null to flush at the end of the byte sequence.
   * @param state The Base64 conversion state. Pass an initial value of `{ queue: 0, queuedBits: 0 }`.
   * @param emit A function called with the next Base64 character when ready.
   */
  function byteToBase64URL(byte, state, emit) {
      if (byte !== null) {
          state.queue = (state.queue << 8) | byte;
          state.queuedBits += 8;
          while (state.queuedBits >= 6) {
              const pos = (state.queue >> (state.queuedBits - 6)) & 63;
              emit(TO_BASE64URL[pos]);
              state.queuedBits -= 6;
          }
      }
      else if (state.queuedBits > 0) {
          state.queue = state.queue << (6 - state.queuedBits);
          state.queuedBits = 6;
          while (state.queuedBits >= 6) {
              const pos = (state.queue >> (state.queuedBits - 6)) & 63;
              emit(TO_BASE64URL[pos]);
              state.queuedBits -= 6;
          }
      }
  }
  /**
   * Converts a String char code (extracted using `string.charCodeAt(position)`) to a sequence of Base64-URL characters.
   *
   * @param charCode The char code of the JavaScript string.
   * @param state The Base64 state. Pass an initial value of `{ queue: 0, queuedBits: 0 }`.
   * @param emit A function called with the next byte.
   */
  function byteFromBase64URL(charCode, state, emit) {
      const bits = FROM_BASE64URL[charCode];
      if (bits > -1) {
          // valid Base64-URL character
          state.queue = (state.queue << 6) | bits;
          state.queuedBits += 6;
          while (state.queuedBits >= 8) {
              emit((state.queue >> (state.queuedBits - 8)) & 0xff);
              state.queuedBits -= 8;
          }
      }
      else if (bits === -2) {
          // ignore spaces, tabs, newlines, =
          return;
      }
      else {
          throw new Error(`Invalid Base64-URL character "${String.fromCharCode(charCode)}"`);
      }
  }
  /**
   * Converts a Base64-URL encoded string into a JavaScript string. It is assumed
   * that the underlying string has been encoded as UTF-8.
   *
   * @param str The Base64-URL encoded string.
   */
  function stringFromBase64URL(str) {
      const conv = [];
      const utf8Emit = (codepoint) => {
          conv.push(String.fromCodePoint(codepoint));
      };
      const utf8State = {
          utf8seq: 0,
          codepoint: 0,
      };
      const b64State = { queue: 0, queuedBits: 0 };
      const byteEmit = (byte) => {
          stringFromUTF8(byte, utf8State, utf8Emit);
      };
      for (let i = 0; i < str.length; i += 1) {
          byteFromBase64URL(str.charCodeAt(i), b64State, byteEmit);
      }
      return conv.join('');
  }
  /**
   * Converts a Unicode codepoint to a multi-byte UTF-8 sequence.
   *
   * @param codepoint The Unicode codepoint.
   * @param emit      Function which will be called for each UTF-8 byte that represents the codepoint.
   */
  function codepointToUTF8(codepoint, emit) {
      if (codepoint <= 0x7f) {
          emit(codepoint);
          return;
      }
      else if (codepoint <= 0x7ff) {
          emit(0xc0 | (codepoint >> 6));
          emit(0x80 | (codepoint & 0x3f));
          return;
      }
      else if (codepoint <= 0xffff) {
          emit(0xe0 | (codepoint >> 12));
          emit(0x80 | ((codepoint >> 6) & 0x3f));
          emit(0x80 | (codepoint & 0x3f));
          return;
      }
      else if (codepoint <= 0x10ffff) {
          emit(0xf0 | (codepoint >> 18));
          emit(0x80 | ((codepoint >> 12) & 0x3f));
          emit(0x80 | ((codepoint >> 6) & 0x3f));
          emit(0x80 | (codepoint & 0x3f));
          return;
      }
      throw new Error(`Unrecognized Unicode codepoint: ${codepoint.toString(16)}`);
  }
  /**
   * Converts a JavaScript string to a sequence of UTF-8 bytes.
   *
   * @param str  The string to convert to UTF-8.
   * @param emit Function which will be called for each UTF-8 byte of the string.
   */
  function stringToUTF8(str, emit) {
      for (let i = 0; i < str.length; i += 1) {
          let codepoint = str.charCodeAt(i);
          if (codepoint > 0xd7ff && codepoint <= 0xdbff) {
              // most UTF-16 codepoints are Unicode codepoints, except values in this
              // range where the next UTF-16 codepoint needs to be combined with the
              // current one to get the Unicode codepoint
              const highSurrogate = ((codepoint - 0xd800) * 0x400) & 0xffff;
              const lowSurrogate = (str.charCodeAt(i + 1) - 0xdc00) & 0xffff;
              codepoint = (lowSurrogate | highSurrogate) + 0x10000;
              i += 1;
          }
          codepointToUTF8(codepoint, emit);
      }
  }
  /**
   * Converts a UTF-8 byte to a Unicode codepoint.
   *
   * @param byte  The UTF-8 byte next in the sequence.
   * @param state The shared state between consecutive UTF-8 bytes in the
   *              sequence, an object with the shape `{ utf8seq: 0, codepoint: 0 }`.
   * @param emit  Function which will be called for each codepoint.
   */
  function stringFromUTF8(byte, state, emit) {
      if (state.utf8seq === 0) {
          if (byte <= 0x7f) {
              emit(byte);
              return;
          }
          // count the number of 1 leading bits until you reach 0
          for (let leadingBit = 1; leadingBit < 6; leadingBit += 1) {
              if (((byte >> (7 - leadingBit)) & 1) === 0) {
                  state.utf8seq = leadingBit;
                  break;
              }
          }
          if (state.utf8seq === 2) {
              state.codepoint = byte & 31;
          }
          else if (state.utf8seq === 3) {
              state.codepoint = byte & 15;
          }
          else if (state.utf8seq === 4) {
              state.codepoint = byte & 7;
          }
          else {
              throw new Error('Invalid UTF-8 sequence');
          }
          state.utf8seq -= 1;
      }
      else if (state.utf8seq > 0) {
          if (byte <= 0x7f) {
              throw new Error('Invalid UTF-8 sequence');
          }
          state.codepoint = (state.codepoint << 6) | (byte & 63);
          state.utf8seq -= 1;
          if (state.utf8seq === 0) {
              emit(state.codepoint);
          }
      }
  }
  /**
   * Helper functions to convert different types of strings to Uint8Array
   */
  function base64UrlToUint8Array(str) {
      const result = [];
      const state = { queue: 0, queuedBits: 0 };
      const onByte = (byte) => {
          result.push(byte);
      };
      for (let i = 0; i < str.length; i += 1) {
          byteFromBase64URL(str.charCodeAt(i), state, onByte);
      }
      return new Uint8Array(result);
  }
  function stringToUint8Array(str) {
      const result = [];
      stringToUTF8(str, (byte) => result.push(byte));
      return new Uint8Array(result);
  }
  function bytesToBase64URL(bytes) {
      const result = [];
      const state = { queue: 0, queuedBits: 0 };
      const onChar = (char) => {
          result.push(char);
      };
      bytes.forEach((byte) => byteToBase64URL(byte, state, onChar));
      // always call with `null` after processing all bytes
      byteToBase64URL(null, state, onChar);
      return result.join('');
  }

  function expiresAt(expiresIn) {
      const timeNow = Math.round(Date.now() / 1000);
      return timeNow + expiresIn;
  }
  /**
   * Generates a unique identifier for internal callback subscriptions.
   *
   * This function uses JavaScript Symbols to create guaranteed-unique identifiers
   * for auth state change callbacks. Symbols are ideal for this use case because:
   * - They are guaranteed unique by the JavaScript runtime
   * - They work in all environments (browser, SSR, Node.js)
   * - They avoid issues with Next.js 16 deterministic rendering requirements
   * - They are perfect for internal, non-serializable identifiers
   *
   * Note: This function is only used for internal subscription management,
   * not for security-critical operations like session tokens.
   */
  function generateCallbackId() {
      return Symbol('auth-callback');
  }
  const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';
  const localStorageWriteTests = {
      tested: false,
      writable: false,
  };
  /**
   * Checks whether localStorage is supported on this browser.
   */
  const supportsLocalStorage = () => {
      if (!isBrowser()) {
          return false;
      }
      try {
          if (typeof globalThis.localStorage !== 'object') {
              return false;
          }
      }
      catch (e) {
          // DOM exception when accessing `localStorage`
          return false;
      }
      if (localStorageWriteTests.tested) {
          return localStorageWriteTests.writable;
      }
      const randomKey = `lswt-${Math.random()}${Math.random()}`;
      try {
          globalThis.localStorage.setItem(randomKey, randomKey);
          globalThis.localStorage.removeItem(randomKey);
          localStorageWriteTests.tested = true;
          localStorageWriteTests.writable = true;
      }
      catch (e) {
          // localStorage can't be written to
          // https://www.chromium.org/for-testers/bug-reporting-guidelines/uncaught-securityerror-failed-to-read-the-localstorage-property-from-window-access-is-denied-for-this-document
          localStorageWriteTests.tested = true;
          localStorageWriteTests.writable = false;
      }
      return localStorageWriteTests.writable;
  };
  /**
   * Extracts parameters encoded in the URL both in the query and fragment.
   */
  function parseParametersFromURL(href) {
      const result = {};
      const url = new URL(href);
      if (url.hash && url.hash[0] === '#') {
          try {
              const hashSearchParams = new URLSearchParams(url.hash.substring(1));
              hashSearchParams.forEach((value, key) => {
                  result[key] = value;
              });
          }
          catch (e) {
              // hash is not a query string
          }
      }
      // search parameters take precedence over hash parameters
      url.searchParams.forEach((value, key) => {
          result[key] = value;
      });
      return result;
  }
  const resolveFetch = (customFetch) => {
      if (customFetch) {
          return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
  };
  const looksLikeFetchResponse = (maybeResponse) => {
      return (typeof maybeResponse === 'object' &&
          maybeResponse !== null &&
          'status' in maybeResponse &&
          'ok' in maybeResponse &&
          'json' in maybeResponse &&
          typeof maybeResponse.json === 'function');
  };
  // Storage helpers
  const setItemAsync = async (storage, key, data) => {
      await storage.setItem(key, JSON.stringify(data));
  };
  const getItemAsync = async (storage, key) => {
      const value = await storage.getItem(key);
      if (!value) {
          return null;
      }
      try {
          return JSON.parse(value);
      }
      catch (_a) {
          return value;
      }
  };
  const removeItemAsync = async (storage, key) => {
      await storage.removeItem(key);
  };
  /**
   * A deferred represents some asynchronous work that is not yet finished, which
   * may or may not culminate in a value.
   * Taken from: https://github.com/mike-north/types/blob/master/src/async.ts
   */
  class Deferred {
      constructor() {
          this.promise = new Deferred.promiseConstructor((res, rej) => {
              this.resolve = res;
              this.reject = rej;
          });
      }
  }
  Deferred.promiseConstructor = Promise;
  function decodeJWT(token) {
      const parts = token.split('.');
      if (parts.length !== 3) {
          throw new AuthInvalidJwtError('Invalid JWT structure');
      }
      // Regex checks for base64url format
      for (let i = 0; i < parts.length; i++) {
          if (!BASE64URL_REGEX.test(parts[i])) {
              throw new AuthInvalidJwtError('JWT not in base64url format');
          }
      }
      const data = {
          // using base64url lib
          header: JSON.parse(stringFromBase64URL(parts[0])),
          payload: JSON.parse(stringFromBase64URL(parts[1])),
          signature: base64UrlToUint8Array(parts[2]),
          raw: {
              header: parts[0],
              payload: parts[1],
          },
      };
      return data;
  }
  /**
   * Creates a promise that resolves to null after some time.
   */
  async function sleep(time) {
      return await new Promise((accept) => {
          setTimeout(() => accept(null), time);
      });
  }
  /**
   * Converts the provided async function into a retryable function. Each result
   * or thrown error is sent to the isRetryable function which should return true
   * if the function should run again.
   */
  function retryable(fn, isRetryable) {
      const promise = new Promise((accept, reject) => {
          (async () => {
              for (let attempt = 0; attempt < Infinity; attempt++) {
                  try {
                      const result = await fn(attempt);
                      if (!isRetryable(attempt, null, result)) {
                          accept(result);
                          return;
                      }
                  }
                  catch (e) {
                      if (!isRetryable(attempt, e)) {
                          reject(e);
                          return;
                      }
                  }
              }
          })();
      });
      return promise;
  }
  function dec2hex(dec) {
      return ('0' + dec.toString(16)).substr(-2);
  }
  // Functions below taken from: https://stackoverflow.com/questions/63309409/creating-a-code-verifier-and-challenge-for-pkce-auth-on-spotify-api-in-reactjs
  function generatePKCEVerifier() {
      const verifierLength = 56;
      const array = new Uint32Array(verifierLength);
      if (typeof crypto === 'undefined') {
          const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
          const charSetLen = charSet.length;
          let verifier = '';
          for (let i = 0; i < verifierLength; i++) {
              verifier += charSet.charAt(Math.floor(Math.random() * charSetLen));
          }
          return verifier;
      }
      crypto.getRandomValues(array);
      return Array.from(array, dec2hex).join('');
  }
  async function sha256(randomString) {
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(randomString);
      const hash = await crypto.subtle.digest('SHA-256', encodedData);
      const bytes = new Uint8Array(hash);
      return Array.from(bytes)
          .map((c) => String.fromCharCode(c))
          .join('');
  }
  async function generatePKCEChallenge(verifier) {
      const hasCryptoSupport = typeof crypto !== 'undefined' &&
          typeof crypto.subtle !== 'undefined' &&
          typeof TextEncoder !== 'undefined';
      if (!hasCryptoSupport) {
          console.warn('WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.');
          return verifier;
      }
      const hashed = await sha256(verifier);
      return btoa(hashed).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  async function getCodeChallengeAndMethod(storage, storageKey, isPasswordRecovery = false) {
      const codeVerifier = generatePKCEVerifier();
      let storedCodeVerifier = codeVerifier;
      if (isPasswordRecovery) {
          storedCodeVerifier += '/PASSWORD_RECOVERY';
      }
      await setItemAsync(storage, `${storageKey}-code-verifier`, storedCodeVerifier);
      const codeChallenge = await generatePKCEChallenge(codeVerifier);
      const codeChallengeMethod = codeVerifier === codeChallenge ? 'plain' : 's256';
      return [codeChallenge, codeChallengeMethod];
  }
  /** Parses the API version which is 2YYY-MM-DD. */
  const API_VERSION_REGEX = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
  function parseResponseAPIVersion(response) {
      const apiVersion = response.headers.get(API_VERSION_HEADER_NAME);
      if (!apiVersion) {
          return null;
      }
      if (!apiVersion.match(API_VERSION_REGEX)) {
          return null;
      }
      try {
          const date = new Date(`${apiVersion}T00:00:00.0Z`);
          return date;
      }
      catch (e) {
          return null;
      }
  }
  function validateExp(exp) {
      if (!exp) {
          throw new Error('Missing exp claim');
      }
      const timeNow = Math.floor(Date.now() / 1000);
      if (exp <= timeNow) {
          throw new Error('JWT has expired');
      }
  }
  function getAlgorithm(alg) {
      switch (alg) {
          case 'RS256':
              return {
                  name: 'RSASSA-PKCS1-v1_5',
                  hash: { name: 'SHA-256' },
              };
          case 'ES256':
              return {
                  name: 'ECDSA',
                  namedCurve: 'P-256',
                  hash: { name: 'SHA-256' },
              };
          default:
              throw new Error('Invalid alg claim');
      }
  }
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  function validateUUID(str) {
      if (!UUID_REGEX.test(str)) {
          throw new Error('@supabase/auth-js: Expected parameter to be UUID but is not');
      }
  }
  function userNotAvailableProxy() {
      const proxyTarget = {};
      return new Proxy(proxyTarget, {
          get: (target, prop) => {
              if (prop === '__isUserNotAvailableProxy') {
                  return true;
              }
              // Preventative check for common problematic symbols during cloning/inspection
              // These symbols might be accessed by structuredClone or other internal mechanisms.
              if (typeof prop === 'symbol') {
                  const sProp = prop.toString();
                  if (sProp === 'Symbol(Symbol.toPrimitive)' ||
                      sProp === 'Symbol(Symbol.toStringTag)' ||
                      sProp === 'Symbol(util.inspect.custom)') {
                      // Node.js util.inspect
                      return undefined;
                  }
              }
              throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${prop}" property of the session object is not supported. Please use getUser() instead.`);
          },
          set: (_target, prop) => {
              throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
          },
          deleteProperty: (_target, prop) => {
              throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
          },
      });
  }
  /**
   * Creates a proxy around a user object that warns when properties are accessed on the server.
   * This is used to alert developers that using user data from getSession() on the server is insecure.
   *
   * @param user The actual user object to wrap
   * @param suppressWarningRef An object with a 'value' property that controls warning suppression
   * @returns A proxied user object that warns on property access
   */
  function insecureUserWarningProxy(user, suppressWarningRef) {
      return new Proxy(user, {
          get: (target, prop, receiver) => {
              // Allow internal checks without warning
              if (prop === '__isInsecureUserWarningProxy') {
                  return true;
              }
              // Preventative check for common problematic symbols during cloning/inspection
              // These symbols might be accessed by structuredClone or other internal mechanisms
              if (typeof prop === 'symbol') {
                  const sProp = prop.toString();
                  if (sProp === 'Symbol(Symbol.toPrimitive)' ||
                      sProp === 'Symbol(Symbol.toStringTag)' ||
                      sProp === 'Symbol(util.inspect.custom)' ||
                      sProp === 'Symbol(nodejs.util.inspect.custom)') {
                      // Return the actual value for these symbols to allow proper inspection
                      return Reflect.get(target, prop, receiver);
                  }
              }
              // Emit warning on first property access
              if (!suppressWarningRef.value && typeof prop === 'string') {
                  console.warn('Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.');
                  suppressWarningRef.value = true;
              }
              return Reflect.get(target, prop, receiver);
          },
      });
  }
  /**
   * Deep clones a JSON-serializable object using JSON.parse(JSON.stringify(obj)).
   * Note: Only works for JSON-safe data.
   */
  function deepClone(obj) {
      return JSON.parse(JSON.stringify(obj));
  }

  const _getErrorMessage = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
  const NETWORK_ERROR_CODES = [502, 503, 504];
  async function handleError(error) {
      var _a;
      if (!looksLikeFetchResponse(error)) {
          throw new AuthRetryableFetchError(_getErrorMessage(error), 0);
      }
      if (NETWORK_ERROR_CODES.includes(error.status)) {
          // status in 500...599 range - server had an error, request might be retryed.
          throw new AuthRetryableFetchError(_getErrorMessage(error), error.status);
      }
      let data;
      try {
          data = await error.json();
      }
      catch (e) {
          throw new AuthUnknownError(_getErrorMessage(e), e);
      }
      let errorCode = undefined;
      const responseAPIVersion = parseResponseAPIVersion(error);
      if (responseAPIVersion &&
          responseAPIVersion.getTime() >= API_VERSIONS['2024-01-01'].timestamp &&
          typeof data === 'object' &&
          data &&
          typeof data.code === 'string') {
          errorCode = data.code;
      }
      else if (typeof data === 'object' && data && typeof data.error_code === 'string') {
          errorCode = data.error_code;
      }
      if (!errorCode) {
          // Legacy support for weak password errors, when there were no error codes
          if (typeof data === 'object' &&
              data &&
              typeof data.weak_password === 'object' &&
              data.weak_password &&
              Array.isArray(data.weak_password.reasons) &&
              data.weak_password.reasons.length &&
              data.weak_password.reasons.reduce((a, i) => a && typeof i === 'string', true)) {
              throw new AuthWeakPasswordError(_getErrorMessage(data), error.status, data.weak_password.reasons);
          }
      }
      else if (errorCode === 'weak_password') {
          throw new AuthWeakPasswordError(_getErrorMessage(data), error.status, ((_a = data.weak_password) === null || _a === void 0 ? void 0 : _a.reasons) || []);
      }
      else if (errorCode === 'session_not_found') {
          // The `session_id` inside the JWT does not correspond to a row in the
          // `sessions` table. This usually means the user has signed out, has been
          // deleted, or their session has somehow been terminated.
          throw new AuthSessionMissingError();
      }
      throw new AuthApiError(_getErrorMessage(data), error.status || 500, errorCode);
  }
  const _getRequestParams = (method, options, parameters, body) => {
      const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
      if (method === 'GET') {
          return params;
      }
      params.headers = Object.assign({ 'Content-Type': 'application/json;charset=UTF-8' }, options === null || options === void 0 ? void 0 : options.headers);
      params.body = JSON.stringify(body);
      return Object.assign(Object.assign({}, params), parameters);
  };
  async function _request(fetcher, method, url, options) {
      var _a;
      const headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
      if (!headers[API_VERSION_HEADER_NAME]) {
          headers[API_VERSION_HEADER_NAME] = API_VERSIONS['2024-01-01'].name;
      }
      if (options === null || options === void 0 ? void 0 : options.jwt) {
          headers['Authorization'] = `Bearer ${options.jwt}`;
      }
      const qs = (_a = options === null || options === void 0 ? void 0 : options.query) !== null && _a !== void 0 ? _a : {};
      if (options === null || options === void 0 ? void 0 : options.redirectTo) {
          qs['redirect_to'] = options.redirectTo;
      }
      const queryString = Object.keys(qs).length ? '?' + new URLSearchParams(qs).toString() : '';
      const data = await _handleRequest(fetcher, method, url + queryString, {
          headers,
          noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson,
      }, {}, options === null || options === void 0 ? void 0 : options.body);
      return (options === null || options === void 0 ? void 0 : options.xform) ? options === null || options === void 0 ? void 0 : options.xform(data) : { data: Object.assign({}, data), error: null };
  }
  async function _handleRequest(fetcher, method, url, options, parameters, body) {
      const requestParams = _getRequestParams(method, options, parameters, body);
      let result;
      try {
          result = await fetcher(url, Object.assign({}, requestParams));
      }
      catch (e) {
          console.error(e);
          // fetch failed, likely due to a network or CORS error
          throw new AuthRetryableFetchError(_getErrorMessage(e), 0);
      }
      if (!result.ok) {
          await handleError(result);
      }
      if (options === null || options === void 0 ? void 0 : options.noResolveJson) {
          return result;
      }
      try {
          return await result.json();
      }
      catch (e) {
          await handleError(e);
      }
  }
  function _sessionResponse(data) {
      var _a;
      let session = null;
      if (hasSession(data)) {
          session = Object.assign({}, data);
          if (!data.expires_at) {
              session.expires_at = expiresAt(data.expires_in);
          }
      }
      const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
      return { data: { session, user }, error: null };
  }
  function _sessionResponsePassword(data) {
      const response = _sessionResponse(data);
      if (!response.error &&
          data.weak_password &&
          typeof data.weak_password === 'object' &&
          Array.isArray(data.weak_password.reasons) &&
          data.weak_password.reasons.length &&
          data.weak_password.message &&
          typeof data.weak_password.message === 'string' &&
          data.weak_password.reasons.reduce((a, i) => a && typeof i === 'string', true)) {
          response.data.weak_password = data.weak_password;
      }
      return response;
  }
  function _userResponse(data) {
      var _a;
      const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
      return { data: { user }, error: null };
  }
  function _ssoResponse(data) {
      return { data, error: null };
  }
  function _generateLinkResponse(data) {
      const { action_link, email_otp, hashed_token, redirect_to, verification_type } = data, rest = __rest(data, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]);
      const properties = {
          action_link,
          email_otp,
          hashed_token,
          redirect_to,
          verification_type,
      };
      const user = Object.assign({}, rest);
      return {
          data: {
              properties,
              user,
          },
          error: null,
      };
  }
  function _noResolveJsonResponse(data) {
      return data;
  }
  /**
   * hasSession checks if the response object contains a valid session
   * @param data A response object
   * @returns true if a session is in the response
   */
  function hasSession(data) {
      return data.access_token && data.refresh_token && data.expires_in;
  }

  const SIGN_OUT_SCOPES = ['global', 'local', 'others'];

  class GoTrueAdminApi {
      /**
       * Creates an admin API client that can be used to manage users and OAuth clients.
       *
       * @example
       * ```ts
       * import { GoTrueAdminApi } from '@supabase/auth-js'
       *
       * const admin = new GoTrueAdminApi({
       *   url: 'https://xyzcompany.supabase.co/auth/v1',
       *   headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
       * })
       * ```
       */
      constructor({ url = '', headers = {}, fetch, }) {
          this.url = url;
          this.headers = headers;
          this.fetch = resolveFetch(fetch);
          this.mfa = {
              listFactors: this._listFactors.bind(this),
              deleteFactor: this._deleteFactor.bind(this),
          };
          this.oauth = {
              listClients: this._listOAuthClients.bind(this),
              createClient: this._createOAuthClient.bind(this),
              getClient: this._getOAuthClient.bind(this),
              updateClient: this._updateOAuthClient.bind(this),
              deleteClient: this._deleteOAuthClient.bind(this),
              regenerateClientSecret: this._regenerateOAuthClientSecret.bind(this),
          };
      }
      /**
       * Removes a logged-in session.
       * @param jwt A valid, logged-in JWT.
       * @param scope The logout sope.
       */
      async signOut(jwt, scope = SIGN_OUT_SCOPES[0]) {
          if (SIGN_OUT_SCOPES.indexOf(scope) < 0) {
              throw new Error(`@supabase/auth-js: Parameter scope must be one of ${SIGN_OUT_SCOPES.join(', ')}`);
          }
          try {
              await _request(this.fetch, 'POST', `${this.url}/logout?scope=${scope}`, {
                  headers: this.headers,
                  jwt,
                  noResolveJson: true,
              });
              return { data: null, error: null };
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: null, error };
              }
              throw error;
          }
      }
      /**
       * Sends an invite link to an email address.
       * @param email The email address of the user.
       * @param options Additional options to be included when inviting.
       */
      async inviteUserByEmail(email, options = {}) {
          try {
              return await _request(this.fetch, 'POST', `${this.url}/invite`, {
                  body: { email, data: options.data },
                  headers: this.headers,
                  redirectTo: options.redirectTo,
                  xform: _userResponse,
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: { user: null }, error };
              }
              throw error;
          }
      }
      /**
       * Generates email links and OTPs to be sent via a custom email provider.
       * @param email The user's email.
       * @param options.password User password. For signup only.
       * @param options.data Optional user metadata. For signup only.
       * @param options.redirectTo The redirect url which should be appended to the generated link
       */
      async generateLink(params) {
          try {
              const { options } = params, rest = __rest(params, ["options"]);
              const body = Object.assign(Object.assign({}, rest), options);
              if ('newEmail' in rest) {
                  // replace newEmail with new_email in request body
                  body.new_email = rest === null || rest === void 0 ? void 0 : rest.newEmail;
                  delete body['newEmail'];
              }
              return await _request(this.fetch, 'POST', `${this.url}/admin/generate_link`, {
                  body: body,
                  headers: this.headers,
                  xform: _generateLinkResponse,
                  redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo,
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return {
                      data: {
                          properties: null,
                          user: null,
                      },
                      error,
                  };
              }
              throw error;
          }
      }
      // User Admin API
      /**
       * Creates a new user.
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async createUser(attributes) {
          try {
              return await _request(this.fetch, 'POST', `${this.url}/admin/users`, {
                  body: attributes,
                  headers: this.headers,
                  xform: _userResponse,
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: { user: null }, error };
              }
              throw error;
          }
      }
      /**
       * Get a list of users.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       * @param params An object which supports `page` and `perPage` as numbers, to alter the paginated results.
       */
      async listUsers(params) {
          var _a, _b, _c, _d, _e, _f, _g;
          try {
              const pagination = { nextPage: null, lastPage: 0, total: 0 };
              const response = await _request(this.fetch, 'GET', `${this.url}/admin/users`, {
                  headers: this.headers,
                  noResolveJson: true,
                  query: {
                      page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '',
                      per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '',
                  },
                  xform: _noResolveJsonResponse,
              });
              if (response.error)
                  throw response.error;
              const users = await response.json();
              const total = (_e = response.headers.get('x-total-count')) !== null && _e !== void 0 ? _e : 0;
              const links = (_g = (_f = response.headers.get('link')) === null || _f === void 0 ? void 0 : _f.split(',')) !== null && _g !== void 0 ? _g : [];
              if (links.length > 0) {
                  links.forEach((link) => {
                      const page = parseInt(link.split(';')[0].split('=')[1].substring(0, 1));
                      const rel = JSON.parse(link.split(';')[1].split('=')[1]);
                      pagination[`${rel}Page`] = page;
                  });
                  pagination.total = parseInt(total);
              }
              return { data: Object.assign(Object.assign({}, users), pagination), error: null };
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: { users: [] }, error };
              }
              throw error;
          }
      }
      /**
       * Get user by id.
       *
       * @param uid The user's unique identifier
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async getUserById(uid) {
          validateUUID(uid);
          try {
              return await _request(this.fetch, 'GET', `${this.url}/admin/users/${uid}`, {
                  headers: this.headers,
                  xform: _userResponse,
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: { user: null }, error };
              }
              throw error;
          }
      }
      /**
       * Updates the user data.
       *
       * @param attributes The data you want to update.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async updateUserById(uid, attributes) {
          validateUUID(uid);
          try {
              return await _request(this.fetch, 'PUT', `${this.url}/admin/users/${uid}`, {
                  body: attributes,
                  headers: this.headers,
                  xform: _userResponse,
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: { user: null }, error };
              }
              throw error;
          }
      }
      /**
       * Delete a user. Requires a `service_role` key.
       *
       * @param id The user id you want to remove.
       * @param shouldSoftDelete If true, then the user will be soft-deleted from the auth schema. Soft deletion allows user identification from the hashed user ID but is not reversible.
       * Defaults to false for backward compatibility.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async deleteUser(id, shouldSoftDelete = false) {
          validateUUID(id);
          try {
              return await _request(this.fetch, 'DELETE', `${this.url}/admin/users/${id}`, {
                  headers: this.headers,
                  body: {
                      should_soft_delete: shouldSoftDelete,
                  },
                  xform: _userResponse,
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: { user: null }, error };
              }
              throw error;
          }
      }
      async _listFactors(params) {
          validateUUID(params.userId);
          try {
              const { data, error } = await _request(this.fetch, 'GET', `${this.url}/admin/users/${params.userId}/factors`, {
                  headers: this.headers,
                  xform: (factors) => {
                      return { data: { factors }, error: null };
                  },
              });
              return { data, error };
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: null, error };
              }
              throw error;
          }
      }
      async _deleteFactor(params) {
          validateUUID(params.userId);
          validateUUID(params.id);
          try {
              const data = await _request(this.fetch, 'DELETE', `${this.url}/admin/users/${params.userId}/factors/${params.id}`, {
                  headers: this.headers,
              });
              return { data, error: null };
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: null, error };
              }
              throw error;
          }
      }
      /**
       * Lists all OAuth clients with optional pagination.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _listOAuthClients(params) {
          var _a, _b, _c, _d, _e, _f, _g;
          try {
              const pagination = { nextPage: null, lastPage: 0, total: 0 };
              const response = await _request(this.fetch, 'GET', `${this.url}/admin/oauth/clients`, {
                  headers: this.headers,
                  noResolveJson: true,
                  query: {
                      page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '',
                      per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '',
                  },
                  xform: _noResolveJsonResponse,
              });
              if (response.error)
                  throw response.error;
              const clients = await response.json();
              const total = (_e = response.headers.get('x-total-count')) !== null && _e !== void 0 ? _e : 0;
              const links = (_g = (_f = response.headers.get('link')) === null || _f === void 0 ? void 0 : _f.split(',')) !== null && _g !== void 0 ? _g : [];
              if (links.length > 0) {
                  links.forEach((link) => {
                      const page = parseInt(link.split(';')[0].split('=')[1].substring(0, 1));
                      const rel = JSON.parse(link.split(';')[1].split('=')[1]);
                      pagination[`${rel}Page`] = page;
                  });
                  pagination.total = parseInt(total);
              }
              return { data: Object.assign(Object.assign({}, clients), pagination), error: null };
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: { clients: [] }, error };
              }
              throw error;
          }
      }
      /**
       * Creates a new OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _createOAuthClient(params) {
          try {
              return await _request(this.fetch, 'POST', `${this.url}/admin/oauth/clients`, {
                  body: params,
                  headers: this.headers,
                  xform: (client) => {
                      return { data: client, error: null };
                  },
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: null, error };
              }
              throw error;
          }
      }
      /**
       * Gets details of a specific OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _getOAuthClient(clientId) {
          try {
              return await _request(this.fetch, 'GET', `${this.url}/admin/oauth/clients/${clientId}`, {
                  headers: this.headers,
                  xform: (client) => {
                      return { data: client, error: null };
                  },
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: null, error };
              }
              throw error;
          }
      }
      /**
       * Updates an existing OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _updateOAuthClient(clientId, params) {
          try {
              return await _request(this.fetch, 'PUT', `${this.url}/admin/oauth/clients/${clientId}`, {
                  body: params,
                  headers: this.headers,
                  xform: (client) => {
                      return { data: client, error: null };
                  },
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: null, error };
              }
              throw error;
          }
      }
      /**
       * Deletes an OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _deleteOAuthClient(clientId) {
          try {
              await _request(this.fetch, 'DELETE', `${this.url}/admin/oauth/clients/${clientId}`, {
                  headers: this.headers,
                  noResolveJson: true,
              });
              return { data: null, error: null };
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: null, error };
              }
              throw error;
          }
      }
      /**
       * Regenerates the secret for an OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _regenerateOAuthClientSecret(clientId) {
          try {
              return await _request(this.fetch, 'POST', `${this.url}/admin/oauth/clients/${clientId}/regenerate_secret`, {
                  headers: this.headers,
                  xform: (client) => {
                      return { data: client, error: null };
                  },
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: null, error };
              }
              throw error;
          }
      }
  }

  /**
   * Returns a localStorage-like object that stores the key-value pairs in
   * memory.
   */
  function memoryLocalStorageAdapter(store = {}) {
      return {
          getItem: (key) => {
              return store[key] || null;
          },
          setItem: (key, value) => {
              store[key] = value;
          },
          removeItem: (key) => {
              delete store[key];
          },
      };
  }

  /**
   * @experimental
   */
  const internals = {
      /**
       * @experimental
       */
      debug: !!(globalThis &&
          supportsLocalStorage() &&
          globalThis.localStorage &&
          globalThis.localStorage.getItem('supabase.gotrue-js.locks.debug') === 'true'),
  };
  /**
   * An error thrown when a lock cannot be acquired after some amount of time.
   *
   * Use the {@link #isAcquireTimeout} property instead of checking with `instanceof`.
   *
   * @example
   * ```ts
   * import { LockAcquireTimeoutError } from '@supabase/auth-js'
   *
   * class CustomLockError extends LockAcquireTimeoutError {
   *   constructor() {
   *     super('Lock timed out')
   *   }
   * }
   * ```
   */
  class LockAcquireTimeoutError extends Error {
      constructor(message) {
          super(message);
          this.isAcquireTimeout = true;
      }
  }
  /**
   * Error thrown when the browser Navigator Lock API fails to acquire a lock.
   *
   * @example
   * ```ts
   * import { NavigatorLockAcquireTimeoutError } from '@supabase/auth-js'
   *
   * throw new NavigatorLockAcquireTimeoutError('Lock timed out')
   * ```
   */
  class NavigatorLockAcquireTimeoutError extends LockAcquireTimeoutError {
  }
  /**
   * Error thrown when the process-level lock helper cannot acquire a lock.
   *
   * @example
   * ```ts
   * import { ProcessLockAcquireTimeoutError } from '@supabase/auth-js'
   *
   * throw new ProcessLockAcquireTimeoutError('Lock timed out')
   * ```
   */
  class ProcessLockAcquireTimeoutError extends LockAcquireTimeoutError {
  }
  /**
   * Implements a global exclusive lock using the Navigator LockManager API. It
   * is available on all browsers released after 2022-03-15 with Safari being the
   * last one to release support. If the API is not available, this function will
   * throw. Make sure you check availablility before configuring {@link
   * GoTrueClient}.
   *
   * You can turn on debugging by setting the `supabase.gotrue-js.locks.debug`
   * local storage item to `true`.
   *
   * Internals:
   *
   * Since the LockManager API does not preserve stack traces for the async
   * function passed in the `request` method, a trick is used where acquiring the
   * lock releases a previously started promise to run the operation in the `fn`
   * function. The lock waits for that promise to finish (with or without error),
   * while the function will finally wait for the result anyway.
   *
   * @param name Name of the lock to be acquired.
   * @param acquireTimeout If negative, no timeout. If 0 an error is thrown if
   *                       the lock can't be acquired without waiting. If positive, the lock acquire
   *                       will time out after so many milliseconds. An error is
   *                       a timeout if it has `isAcquireTimeout` set to true.
   * @param fn The operation to run once the lock is acquired.
   * @example
   * ```ts
   * await navigatorLock('sync-user', 1000, async () => {
   *   await refreshSession()
   * })
   * ```
   */
  async function navigatorLock(name, acquireTimeout, fn) {
      if (internals.debug) {
          console.log('@supabase/gotrue-js: navigatorLock: acquire lock', name, acquireTimeout);
      }
      const abortController = new globalThis.AbortController();
      if (acquireTimeout > 0) {
          setTimeout(() => {
              abortController.abort();
              if (internals.debug) {
                  console.log('@supabase/gotrue-js: navigatorLock acquire timed out', name);
              }
          }, acquireTimeout);
      }
      // MDN article: https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request
      // Wrapping navigator.locks.request() with a plain Promise is done as some
      // libraries like zone.js patch the Promise object to track the execution
      // context. However, it appears that most browsers use an internal promise
      // implementation when using the navigator.locks.request() API causing them
      // to lose context and emit confusing log messages or break certain features.
      // This wrapping is believed to help zone.js track the execution context
      // better.
      return await Promise.resolve().then(() => globalThis.navigator.locks.request(name, acquireTimeout === 0
          ? {
              mode: 'exclusive',
              ifAvailable: true,
          }
          : {
              mode: 'exclusive',
              signal: abortController.signal,
          }, async (lock) => {
          if (lock) {
              if (internals.debug) {
                  console.log('@supabase/gotrue-js: navigatorLock: acquired', name, lock.name);
              }
              try {
                  return await fn();
              }
              finally {
                  if (internals.debug) {
                      console.log('@supabase/gotrue-js: navigatorLock: released', name, lock.name);
                  }
              }
          }
          else {
              if (acquireTimeout === 0) {
                  if (internals.debug) {
                      console.log('@supabase/gotrue-js: navigatorLock: not immediately available', name);
                  }
                  throw new NavigatorLockAcquireTimeoutError(`Acquiring an exclusive Navigator LockManager lock "${name}" immediately failed`);
              }
              else {
                  if (internals.debug) {
                      try {
                          const result = await globalThis.navigator.locks.query();
                          console.log('@supabase/gotrue-js: Navigator LockManager state', JSON.stringify(result, null, '  '));
                      }
                      catch (e) {
                          console.warn('@supabase/gotrue-js: Error when querying Navigator LockManager state', e);
                      }
                  }
                  // Browser is not following the Navigator LockManager spec, it
                  // returned a null lock when we didn't use ifAvailable. So we can
                  // pretend the lock is acquired in the name of backward compatibility
                  // and user experience and just run the function.
                  console.warn('@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request');
                  return await fn();
              }
          }
      }));
  }
  const PROCESS_LOCKS = {};
  /**
   * Implements a global exclusive lock that works only in the current process.
   * Useful for environments like React Native or other non-browser
   * single-process (i.e. no concept of "tabs") environments.
   *
   * Use {@link #navigatorLock} in browser environments.
   *
   * @param name Name of the lock to be acquired.
   * @param acquireTimeout If negative, no timeout. If 0 an error is thrown if
   *                       the lock can't be acquired without waiting. If positive, the lock acquire
   *                       will time out after so many milliseconds. An error is
   *                       a timeout if it has `isAcquireTimeout` set to true.
   * @param fn The operation to run once the lock is acquired.
   * @example
   * ```ts
   * await processLock('migrate', 5000, async () => {
   *   await runMigration()
   * })
   * ```
   */
  async function processLock(name, acquireTimeout, fn) {
      var _a;
      const previousOperation = (_a = PROCESS_LOCKS[name]) !== null && _a !== void 0 ? _a : Promise.resolve();
      const currentOperation = Promise.race([
          previousOperation.catch(() => {
              // ignore error of previous operation that we're waiting to finish
              return null;
          }),
          acquireTimeout >= 0
              ? new Promise((_, reject) => {
                  setTimeout(() => {
                      reject(new ProcessLockAcquireTimeoutError(`Acquring process lock with name "${name}" timed out`));
                  }, acquireTimeout);
              })
              : null,
      ].filter((x) => x))
          .catch((e) => {
          if (e && e.isAcquireTimeout) {
              throw e;
          }
          return null;
      })
          .then(async () => {
          // previous operations finished and we didn't get a race on the acquire
          // timeout, so the current operation can finally start
          return await fn();
      });
      PROCESS_LOCKS[name] = currentOperation.catch(async (e) => {
          if (e && e.isAcquireTimeout) {
              // if the current operation timed out, it doesn't mean that the previous
              // operation finished, so we need contnue waiting for it to finish
              await previousOperation;
              return null;
          }
          throw e;
      });
      // finally wait for the current operation to finish successfully, with an
      // error or with an acquire timeout error
      return await currentOperation;
  }

  /**
   * https://mathiasbynens.be/notes/globalthis
   */
  function polyfillGlobalThis() {
      if (typeof globalThis === 'object')
          return;
      try {
          Object.defineProperty(Object.prototype, '__magic__', {
              get: function () {
                  return this;
              },
              configurable: true,
          });
          // @ts-expect-error 'Allow access to magic'
          __magic__.globalThis = __magic__;
          // @ts-expect-error 'Allow access to magic'
          delete Object.prototype.__magic__;
      }
      catch (e) {
          if (typeof self !== 'undefined') {
              // @ts-expect-error 'Allow access to globals'
              self.globalThis = self;
          }
      }
  }

  // types and functions copied over from viem so this library doesn't depend on it
  function getAddress(address) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
          throw new Error(`@supabase/auth-js: Address "${address}" is invalid.`);
      }
      return address.toLowerCase();
  }
  function fromHex(hex) {
      return parseInt(hex, 16);
  }
  function toHex(value) {
      const bytes = new TextEncoder().encode(value);
      const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
      return ('0x' + hex);
  }
  /**
   * Creates EIP-4361 formatted message.
   */
  function createSiweMessage(parameters) {
      var _a;
      const { chainId, domain, expirationTime, issuedAt = new Date(), nonce, notBefore, requestId, resources, scheme, uri, version, } = parameters;
      // Validate fields
      {
          if (!Number.isInteger(chainId))
              throw new Error(`@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${chainId}`);
          if (!domain)
              throw new Error(`@supabase/auth-js: Invalid SIWE message field "domain". Domain must be provided.`);
          if (nonce && nonce.length < 8)
              throw new Error(`@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${nonce}`);
          if (!uri)
              throw new Error(`@supabase/auth-js: Invalid SIWE message field "uri". URI must be provided.`);
          if (version !== '1')
              throw new Error(`@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${version}`);
          if ((_a = parameters.statement) === null || _a === void 0 ? void 0 : _a.includes('\n'))
              throw new Error(`@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${parameters.statement}`);
      }
      // Construct message
      const address = getAddress(parameters.address);
      const origin = scheme ? `${scheme}://${domain}` : domain;
      const statement = parameters.statement ? `${parameters.statement}\n` : '';
      const prefix = `${origin} wants you to sign in with your Ethereum account:\n${address}\n\n${statement}`;
      let suffix = `URI: ${uri}\nVersion: ${version}\nChain ID: ${chainId}${nonce ? `\nNonce: ${nonce}` : ''}\nIssued At: ${issuedAt.toISOString()}`;
      if (expirationTime)
          suffix += `\nExpiration Time: ${expirationTime.toISOString()}`;
      if (notBefore)
          suffix += `\nNot Before: ${notBefore.toISOString()}`;
      if (requestId)
          suffix += `\nRequest ID: ${requestId}`;
      if (resources) {
          let content = '\nResources:';
          for (const resource of resources) {
              if (!resource || typeof resource !== 'string')
                  throw new Error(`@supabase/auth-js: Invalid SIWE message field "resources". Every resource must be a valid string. Provided value: ${resource}`);
              content += `\n- ${resource}`;
          }
          suffix += content;
      }
      return `${prefix}\n${suffix}`;
  }

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  /**
   * A custom Error used to return a more nuanced error detailing _why_ one of the eight documented
   * errors in the spec was raised after calling `navigator.credentials.create()` or
   * `navigator.credentials.get()`:
   *
   * - `AbortError`
   * - `ConstraintError`
   * - `InvalidStateError`
   * - `NotAllowedError`
   * - `NotSupportedError`
   * - `SecurityError`
   * - `TypeError`
   * - `UnknownError`
   *
   * Error messages were determined through investigation of the spec to determine under which
   * scenarios a given error would be raised.
   */
  class WebAuthnError extends Error {
      constructor({ message, code, cause, name, }) {
          var _a;
          // @ts-ignore: help Rollup understand that `cause` is okay to set
          super(message, { cause });
          this.__isWebAuthnError = true;
          this.name = (_a = name !== null && name !== void 0 ? name : (cause instanceof Error ? cause.name : undefined)) !== null && _a !== void 0 ? _a : 'Unknown Error';
          this.code = code;
      }
  }
  /**
   * Error class for unknown WebAuthn errors.
   * Wraps unexpected errors that don't match known WebAuthn error conditions.
   */
  class WebAuthnUnknownError extends WebAuthnError {
      constructor(message, originalError) {
          super({
              code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
              cause: originalError,
              message,
          });
          this.name = 'WebAuthnUnknownError';
          this.originalError = originalError;
      }
  }
  /**
   * Attempt to intuit _why_ an error was raised after calling `navigator.credentials.create()`.
   * Maps browser errors to specific WebAuthn error codes for better debugging.
   * @param {Object} params - Error identification parameters
   * @param {Error} params.error - The error thrown by the browser
   * @param {CredentialCreationOptions} params.options - The options passed to credentials.create()
   * @returns {WebAuthnError} A WebAuthnError with a specific error code
   * @see {@link https://w3c.github.io/webauthn/#sctn-createCredential W3C WebAuthn Spec - Create Credential}
   */
  function identifyRegistrationError({ error, options, }) {
      var _a, _b, _c;
      const { publicKey } = options;
      if (!publicKey) {
          throw Error('options was missing required publicKey property');
      }
      if (error.name === 'AbortError') {
          if (options.signal instanceof AbortSignal) {
              // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 16)
              return new WebAuthnError({
                  message: 'Registration ceremony was sent an abort signal',
                  code: 'ERROR_CEREMONY_ABORTED',
                  cause: error,
              });
          }
      }
      else if (error.name === 'ConstraintError') {
          if (((_a = publicKey.authenticatorSelection) === null || _a === void 0 ? void 0 : _a.requireResidentKey) === true) {
              // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 4)
              return new WebAuthnError({
                  message: 'Discoverable credentials were required but no available authenticator supported it',
                  code: 'ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT',
                  cause: error,
              });
          }
          else if (
          // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
          options.mediation === 'conditional' &&
              ((_b = publicKey.authenticatorSelection) === null || _b === void 0 ? void 0 : _b.userVerification) === 'required') {
              // https://w3c.github.io/webauthn/#sctn-createCredential (Step 22.4)
              return new WebAuthnError({
                  message: 'User verification was required during automatic registration but it could not be performed',
                  code: 'ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE',
                  cause: error,
              });
          }
          else if (((_c = publicKey.authenticatorSelection) === null || _c === void 0 ? void 0 : _c.userVerification) === 'required') {
              // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 5)
              return new WebAuthnError({
                  message: 'User verification was required but no available authenticator supported it',
                  code: 'ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT',
                  cause: error,
              });
          }
      }
      else if (error.name === 'InvalidStateError') {
          // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 20)
          // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 3)
          return new WebAuthnError({
              message: 'The authenticator was previously registered',
              code: 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED',
              cause: error,
          });
      }
      else if (error.name === 'NotAllowedError') {
          /**
           * Pass the error directly through. Platforms are overloading this error beyond what the spec
           * defines and we don't want to overwrite potentially useful error messages.
           */
          return new WebAuthnError({
              message: error.message,
              code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
              cause: error,
          });
      }
      else if (error.name === 'NotSupportedError') {
          const validPubKeyCredParams = publicKey.pubKeyCredParams.filter((param) => param.type === 'public-key');
          if (validPubKeyCredParams.length === 0) {
              // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 10)
              return new WebAuthnError({
                  message: 'No entry in pubKeyCredParams was of type "public-key"',
                  code: 'ERROR_MALFORMED_PUBKEYCREDPARAMS',
                  cause: error,
              });
          }
          // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 2)
          return new WebAuthnError({
              message: 'No available authenticator supported any of the specified pubKeyCredParams algorithms',
              code: 'ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG',
              cause: error,
          });
      }
      else if (error.name === 'SecurityError') {
          const effectiveDomain = window.location.hostname;
          if (!isValidDomain(effectiveDomain)) {
              // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 7)
              return new WebAuthnError({
                  message: `${window.location.hostname} is an invalid domain`,
                  code: 'ERROR_INVALID_DOMAIN',
                  cause: error,
              });
          }
          else if (publicKey.rp.id !== effectiveDomain) {
              // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 8)
              return new WebAuthnError({
                  message: `The RP ID "${publicKey.rp.id}" is invalid for this domain`,
                  code: 'ERROR_INVALID_RP_ID',
                  cause: error,
              });
          }
      }
      else if (error.name === 'TypeError') {
          if (publicKey.user.id.byteLength < 1 || publicKey.user.id.byteLength > 64) {
              // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 5)
              return new WebAuthnError({
                  message: 'User ID was not between 1 and 64 characters',
                  code: 'ERROR_INVALID_USER_ID_LENGTH',
                  cause: error,
              });
          }
      }
      else if (error.name === 'UnknownError') {
          // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 1)
          // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 8)
          return new WebAuthnError({
              message: 'The authenticator was unable to process the specified options, or could not create a new credential',
              code: 'ERROR_AUTHENTICATOR_GENERAL_ERROR',
              cause: error,
          });
      }
      return new WebAuthnError({
          message: 'a Non-Webauthn related error has occurred',
          code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
          cause: error,
      });
  }
  /**
   * Attempt to intuit _why_ an error was raised after calling `navigator.credentials.get()`.
   * Maps browser errors to specific WebAuthn error codes for better debugging.
   * @param {Object} params - Error identification parameters
   * @param {Error} params.error - The error thrown by the browser
   * @param {CredentialRequestOptions} params.options - The options passed to credentials.get()
   * @returns {WebAuthnError} A WebAuthnError with a specific error code
   * @see {@link https://w3c.github.io/webauthn/#sctn-getAssertion W3C WebAuthn Spec - Get Assertion}
   */
  function identifyAuthenticationError({ error, options, }) {
      const { publicKey } = options;
      if (!publicKey) {
          throw Error('options was missing required publicKey property');
      }
      if (error.name === 'AbortError') {
          if (options.signal instanceof AbortSignal) {
              // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 16)
              return new WebAuthnError({
                  message: 'Authentication ceremony was sent an abort signal',
                  code: 'ERROR_CEREMONY_ABORTED',
                  cause: error,
              });
          }
      }
      else if (error.name === 'NotAllowedError') {
          /**
           * Pass the error directly through. Platforms are overloading this error beyond what the spec
           * defines and we don't want to overwrite potentially useful error messages.
           */
          return new WebAuthnError({
              message: error.message,
              code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
              cause: error,
          });
      }
      else if (error.name === 'SecurityError') {
          const effectiveDomain = window.location.hostname;
          if (!isValidDomain(effectiveDomain)) {
              // https://www.w3.org/TR/webauthn-2/#sctn-discover-from-external-source (Step 5)
              return new WebAuthnError({
                  message: `${window.location.hostname} is an invalid domain`,
                  code: 'ERROR_INVALID_DOMAIN',
                  cause: error,
              });
          }
          else if (publicKey.rpId !== effectiveDomain) {
              // https://www.w3.org/TR/webauthn-2/#sctn-discover-from-external-source (Step 6)
              return new WebAuthnError({
                  message: `The RP ID "${publicKey.rpId}" is invalid for this domain`,
                  code: 'ERROR_INVALID_RP_ID',
                  cause: error,
              });
          }
      }
      else if (error.name === 'UnknownError') {
          // https://www.w3.org/TR/webauthn-2/#sctn-op-get-assertion (Step 1)
          // https://www.w3.org/TR/webauthn-2/#sctn-op-get-assertion (Step 12)
          return new WebAuthnError({
              message: 'The authenticator was unable to process the specified options, or could not create a new assertion signature',
              code: 'ERROR_AUTHENTICATOR_GENERAL_ERROR',
              cause: error,
          });
      }
      return new WebAuthnError({
          message: 'a Non-Webauthn related error has occurred',
          code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
          cause: error,
      });
  }

  /**
   * WebAuthn abort service to manage ceremony cancellation.
   * Ensures only one WebAuthn ceremony is active at a time to prevent "operation already in progress" errors.
   *
   * @experimental This class is experimental and may change in future releases
   * @see {@link https://w3c.github.io/webauthn/#sctn-automation-webdriver-capability W3C WebAuthn Spec - Aborting Ceremonies}
   */
  class WebAuthnAbortService {
      /**
       * Create an abort signal for a new WebAuthn operation.
       * Automatically cancels any existing operation.
       *
       * @returns {AbortSignal} Signal to pass to navigator.credentials.create() or .get()
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal MDN - AbortSignal}
       */
      createNewAbortSignal() {
          // Abort any existing calls to navigator.credentials.create() or navigator.credentials.get()
          if (this.controller) {
              const abortError = new Error('Cancelling existing WebAuthn API call for new one');
              abortError.name = 'AbortError';
              this.controller.abort(abortError);
          }
          const newController = new AbortController();
          this.controller = newController;
          return newController.signal;
      }
      /**
       * Manually cancel the current WebAuthn operation.
       * Useful for cleaning up when user cancels or navigates away.
       *
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort MDN - AbortController.abort}
       */
      cancelCeremony() {
          if (this.controller) {
              const abortError = new Error('Manually cancelling existing WebAuthn API call');
              abortError.name = 'AbortError';
              this.controller.abort(abortError);
              this.controller = undefined;
          }
      }
  }
  /**
   * Singleton instance to ensure only one WebAuthn ceremony is active at a time.
   * This prevents "operation already in progress" errors when retrying WebAuthn operations.
   *
   * @experimental This instance is experimental and may change in future releases
   */
  const webAuthnAbortService = new WebAuthnAbortService();
  /**
   * Convert base64url encoded strings in WebAuthn credential creation options to ArrayBuffers
   * as required by the WebAuthn browser API.
   * Supports both native WebAuthn Level 3 parseCreationOptionsFromJSON and manual fallback.
   *
   * @param {ServerCredentialCreationOptions} options - JSON options from server with base64url encoded fields
   * @returns {PublicKeyCredentialCreationOptionsFuture} Options ready for navigator.credentials.create()
   * @see {@link https://w3c.github.io/webauthn/#sctn-parseCreationOptionsFromJSON W3C WebAuthn Spec - parseCreationOptionsFromJSON}
   */
  function deserializeCredentialCreationOptions(options) {
      if (!options) {
          throw new Error('Credential creation options are required');
      }
      // Check if the native parseCreationOptionsFromJSON method is available
      if (typeof PublicKeyCredential !== 'undefined' &&
          'parseCreationOptionsFromJSON' in PublicKeyCredential &&
          typeof PublicKeyCredential
              .parseCreationOptionsFromJSON === 'function') {
          // Use the native WebAuthn Level 3 method
          return PublicKeyCredential.parseCreationOptionsFromJSON(
          /** we assert the options here as typescript still doesn't know about future webauthn types */
          options);
      }
      // Fallback to manual parsing for browsers that don't support the native method
      // Destructure to separate fields that need transformation
      const { challenge: challengeStr, user: userOpts, excludeCredentials } = options, restOptions = __rest(options
      // Convert challenge from base64url to ArrayBuffer
      , ["challenge", "user", "excludeCredentials"]);
      // Convert challenge from base64url to ArrayBuffer
      const challenge = base64UrlToUint8Array(challengeStr).buffer;
      // Convert user.id from base64url to ArrayBuffer
      const user = Object.assign(Object.assign({}, userOpts), { id: base64UrlToUint8Array(userOpts.id).buffer });
      // Build the result object
      const result = Object.assign(Object.assign({}, restOptions), { challenge,
          user });
      // Only add excludeCredentials if it exists
      if (excludeCredentials && excludeCredentials.length > 0) {
          result.excludeCredentials = new Array(excludeCredentials.length);
          for (let i = 0; i < excludeCredentials.length; i++) {
              const cred = excludeCredentials[i];
              result.excludeCredentials[i] = Object.assign(Object.assign({}, cred), { id: base64UrlToUint8Array(cred.id).buffer, type: cred.type || 'public-key',
                  // Cast transports to handle future transport types like "cable"
                  transports: cred.transports });
          }
      }
      return result;
  }
  /**
   * Convert base64url encoded strings in WebAuthn credential request options to ArrayBuffers
   * as required by the WebAuthn browser API.
   * Supports both native WebAuthn Level 3 parseRequestOptionsFromJSON and manual fallback.
   *
   * @param {ServerCredentialRequestOptions} options - JSON options from server with base64url encoded fields
   * @returns {PublicKeyCredentialRequestOptionsFuture} Options ready for navigator.credentials.get()
   * @see {@link https://w3c.github.io/webauthn/#sctn-parseRequestOptionsFromJSON W3C WebAuthn Spec - parseRequestOptionsFromJSON}
   */
  function deserializeCredentialRequestOptions(options) {
      if (!options) {
          throw new Error('Credential request options are required');
      }
      // Check if the native parseRequestOptionsFromJSON method is available
      if (typeof PublicKeyCredential !== 'undefined' &&
          'parseRequestOptionsFromJSON' in PublicKeyCredential &&
          typeof PublicKeyCredential
              .parseRequestOptionsFromJSON === 'function') {
          // Use the native WebAuthn Level 3 method
          return PublicKeyCredential.parseRequestOptionsFromJSON(options);
      }
      // Fallback to manual parsing for browsers that don't support the native method
      // Destructure to separate fields that need transformation
      const { challenge: challengeStr, allowCredentials } = options, restOptions = __rest(options
      // Convert challenge from base64url to ArrayBuffer
      , ["challenge", "allowCredentials"]);
      // Convert challenge from base64url to ArrayBuffer
      const challenge = base64UrlToUint8Array(challengeStr).buffer;
      // Build the result object
      const result = Object.assign(Object.assign({}, restOptions), { challenge });
      // Only add allowCredentials if it exists
      if (allowCredentials && allowCredentials.length > 0) {
          result.allowCredentials = new Array(allowCredentials.length);
          for (let i = 0; i < allowCredentials.length; i++) {
              const cred = allowCredentials[i];
              result.allowCredentials[i] = Object.assign(Object.assign({}, cred), { id: base64UrlToUint8Array(cred.id).buffer, type: cred.type || 'public-key',
                  // Cast transports to handle future transport types like "cable"
                  transports: cred.transports });
          }
      }
      return result;
  }
  /**
   * Convert a registration/enrollment credential response to server format.
   * Serializes binary fields to base64url for JSON transmission.
   * Supports both native WebAuthn Level 3 toJSON and manual fallback.
   *
   * @param {RegistrationCredential} credential - Credential from navigator.credentials.create()
   * @returns {RegistrationResponseJSON} JSON-serializable credential for server
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredential-tojson W3C WebAuthn Spec - toJSON}
   */
  function serializeCredentialCreationResponse(credential) {
      var _a;
      // Check if the credential instance has the toJSON method
      if ('toJSON' in credential && typeof credential.toJSON === 'function') {
          // Use the native WebAuthn Level 3 method
          return credential.toJSON();
      }
      const credentialWithAttachment = credential;
      return {
          id: credential.id,
          rawId: credential.id,
          response: {
              attestationObject: bytesToBase64URL(new Uint8Array(credential.response.attestationObject)),
              clientDataJSON: bytesToBase64URL(new Uint8Array(credential.response.clientDataJSON)),
          },
          type: 'public-key',
          clientExtensionResults: credential.getClientExtensionResults(),
          // Convert null to undefined and cast to AuthenticatorAttachment type
          authenticatorAttachment: ((_a = credentialWithAttachment.authenticatorAttachment) !== null && _a !== void 0 ? _a : undefined),
      };
  }
  /**
   * Convert an authentication/verification credential response to server format.
   * Serializes binary fields to base64url for JSON transmission.
   * Supports both native WebAuthn Level 3 toJSON and manual fallback.
   *
   * @param {AuthenticationCredential} credential - Credential from navigator.credentials.get()
   * @returns {AuthenticationResponseJSON} JSON-serializable credential for server
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredential-tojson W3C WebAuthn Spec - toJSON}
   */
  function serializeCredentialRequestResponse(credential) {
      var _a;
      // Check if the credential instance has the toJSON method
      if ('toJSON' in credential && typeof credential.toJSON === 'function') {
          // Use the native WebAuthn Level 3 method
          return credential.toJSON();
      }
      // Fallback to manual conversion for browsers that don't support toJSON
      // Access authenticatorAttachment via type assertion to handle TypeScript version differences
      // @simplewebauthn/types includes this property but base TypeScript 4.7.4 doesn't
      const credentialWithAttachment = credential;
      const clientExtensionResults = credential.getClientExtensionResults();
      const assertionResponse = credential.response;
      return {
          id: credential.id,
          rawId: credential.id, // W3C spec expects rawId to match id for JSON format
          response: {
              authenticatorData: bytesToBase64URL(new Uint8Array(assertionResponse.authenticatorData)),
              clientDataJSON: bytesToBase64URL(new Uint8Array(assertionResponse.clientDataJSON)),
              signature: bytesToBase64URL(new Uint8Array(assertionResponse.signature)),
              userHandle: assertionResponse.userHandle
                  ? bytesToBase64URL(new Uint8Array(assertionResponse.userHandle))
                  : undefined,
          },
          type: 'public-key',
          clientExtensionResults,
          // Convert null to undefined and cast to AuthenticatorAttachment type
          authenticatorAttachment: ((_a = credentialWithAttachment.authenticatorAttachment) !== null && _a !== void 0 ? _a : undefined),
      };
  }
  /**
   * A simple test to determine if a hostname is a properly-formatted domain name.
   * Considers localhost valid for development environments.
   *
   * A "valid domain" is defined here: https://url.spec.whatwg.org/#valid-domain
   *
   * Regex sourced from here:
   * https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch08s15.html
   *
   * @param {string} hostname - The hostname to validate
   * @returns {boolean} True if valid domain or localhost
   * @see {@link https://url.spec.whatwg.org/#valid-domain WHATWG URL Spec - Valid Domain}
   */
  function isValidDomain(hostname) {
      return (
      // Consider localhost valid as well since it's okay wrt Secure Contexts
      hostname === 'localhost' || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(hostname));
  }
  /**
   * Determine if the browser is capable of WebAuthn.
   * Checks for necessary Web APIs: PublicKeyCredential and Credential Management.
   *
   * @returns {boolean} True if browser supports WebAuthn
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredential#browser_compatibility MDN - PublicKeyCredential Browser Compatibility}
   */
  function browserSupportsWebAuthn() {
      var _a, _b;
      return !!(isBrowser() &&
          'PublicKeyCredential' in window &&
          window.PublicKeyCredential &&
          'credentials' in navigator &&
          typeof ((_a = navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null || _a === void 0 ? void 0 : _a.create) === 'function' &&
          typeof ((_b = navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null || _b === void 0 ? void 0 : _b.get) === 'function');
  }
  /**
   * Create a WebAuthn credential using the browser's credentials API.
   * Wraps navigator.credentials.create() with error handling.
   *
   * @param {CredentialCreationOptions} options - Options including publicKey parameters
   * @returns {Promise<RequestResult<RegistrationCredential, WebAuthnError>>} Created credential or error
   * @see {@link https://w3c.github.io/webauthn/#sctn-createCredential W3C WebAuthn Spec - Create Credential}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/create MDN - credentials.create}
   */
  async function createCredential(options) {
      try {
          const response = await navigator.credentials.create(
          /** we assert the type here until typescript types are updated */
          options);
          if (!response) {
              return {
                  data: null,
                  error: new WebAuthnUnknownError('Empty credential response', response),
              };
          }
          if (!(response instanceof PublicKeyCredential)) {
              return {
                  data: null,
                  error: new WebAuthnUnknownError('Browser returned unexpected credential type', response),
              };
          }
          return { data: response, error: null };
      }
      catch (err) {
          return {
              data: null,
              error: identifyRegistrationError({
                  error: err,
                  options,
              }),
          };
      }
  }
  /**
   * Get a WebAuthn credential using the browser's credentials API.
   * Wraps navigator.credentials.get() with error handling.
   *
   * @param {CredentialRequestOptions} options - Options including publicKey parameters
   * @returns {Promise<RequestResult<AuthenticationCredential, WebAuthnError>>} Retrieved credential or error
   * @see {@link https://w3c.github.io/webauthn/#sctn-getAssertion W3C WebAuthn Spec - Get Assertion}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/get MDN - credentials.get}
   */
  async function getCredential(options) {
      try {
          const response = await navigator.credentials.get(
          /** we assert the type here until typescript types are updated */
          options);
          if (!response) {
              return {
                  data: null,
                  error: new WebAuthnUnknownError('Empty credential response', response),
              };
          }
          if (!(response instanceof PublicKeyCredential)) {
              return {
                  data: null,
                  error: new WebAuthnUnknownError('Browser returned unexpected credential type', response),
              };
          }
          return { data: response, error: null };
      }
      catch (err) {
          return {
              data: null,
              error: identifyAuthenticationError({
                  error: err,
                  options,
              }),
          };
      }
  }
  const DEFAULT_CREATION_OPTIONS = {
      hints: ['security-key'],
      authenticatorSelection: {
          authenticatorAttachment: 'cross-platform',
          requireResidentKey: false,
          /** set to preferred because older yubikeys don't have PIN/Biometric */
          userVerification: 'preferred',
          residentKey: 'discouraged',
      },
      attestation: 'direct',
  };
  const DEFAULT_REQUEST_OPTIONS = {
      /** set to preferred because older yubikeys don't have PIN/Biometric */
      userVerification: 'preferred',
      hints: ['security-key'],
      attestation: 'direct',
  };
  function deepMerge(...sources) {
      const isObject = (val) => val !== null && typeof val === 'object' && !Array.isArray(val);
      const isArrayBufferLike = (val) => val instanceof ArrayBuffer || ArrayBuffer.isView(val);
      const result = {};
      for (const source of sources) {
          if (!source)
              continue;
          for (const key in source) {
              const value = source[key];
              if (value === undefined)
                  continue;
              if (Array.isArray(value)) {
                  // preserve array reference, including unions like AuthenticatorTransport[]
                  result[key] = value;
              }
              else if (isArrayBufferLike(value)) {
                  result[key] = value;
              }
              else if (isObject(value)) {
                  const existing = result[key];
                  if (isObject(existing)) {
                      result[key] = deepMerge(existing, value);
                  }
                  else {
                      result[key] = deepMerge(value);
                  }
              }
              else {
                  result[key] = value;
              }
          }
      }
      return result;
  }
  /**
   * Merges WebAuthn credential creation options with overrides.
   * Sets sensible defaults for authenticator selection and extensions.
   *
   * @param {PublicKeyCredentialCreationOptionsFuture} baseOptions - The base options from the server
   * @param {PublicKeyCredentialCreationOptionsFuture} overrides - Optional overrides to apply
   * @param {string} friendlyName - Optional friendly name for the credential
   * @returns {PublicKeyCredentialCreationOptionsFuture} Merged credential creation options
   * @see {@link https://w3c.github.io/webauthn/#dictdef-authenticatorselectioncriteria W3C WebAuthn Spec - AuthenticatorSelectionCriteria}
   */
  function mergeCredentialCreationOptions(baseOptions, overrides) {
      return deepMerge(DEFAULT_CREATION_OPTIONS, baseOptions, overrides || {});
  }
  /**
   * Merges WebAuthn credential request options with overrides.
   * Sets sensible defaults for user verification and hints.
   *
   * @param {PublicKeyCredentialRequestOptionsFuture} baseOptions - The base options from the server
   * @param {PublicKeyCredentialRequestOptionsFuture} overrides - Optional overrides to apply
   * @returns {PublicKeyCredentialRequestOptionsFuture} Merged credential request options
   * @see {@link https://w3c.github.io/webauthn/#dictdef-publickeycredentialrequestoptions W3C WebAuthn Spec - PublicKeyCredentialRequestOptions}
   */
  function mergeCredentialRequestOptions(baseOptions, overrides) {
      return deepMerge(DEFAULT_REQUEST_OPTIONS, baseOptions, overrides || {});
  }
  /**
   * WebAuthn API wrapper for Supabase Auth.
   * Provides methods for enrolling, challenging, verifying, authenticating, and registering WebAuthn credentials.
   *
   * @experimental This API is experimental and may change in future releases
   * @see {@link https://w3c.github.io/webauthn/ W3C WebAuthn Specification}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API MDN - Web Authentication API}
   */
  class WebAuthnApi {
      constructor(client) {
          this.client = client;
          // Bind all methods so they can be destructured
          this.enroll = this._enroll.bind(this);
          this.challenge = this._challenge.bind(this);
          this.verify = this._verify.bind(this);
          this.authenticate = this._authenticate.bind(this);
          this.register = this._register.bind(this);
      }
      /**
       * Enroll a new WebAuthn factor.
       * Creates an unverified WebAuthn factor that must be verified with a credential.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Omit<MFAEnrollWebauthnParams, 'factorType'>} params - Enrollment parameters (friendlyName required)
       * @returns {Promise<AuthMFAEnrollWebauthnResponse>} Enrolled factor details or error
       * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registering a New Credential}
       */
      async _enroll(params) {
          return this.client.mfa.enroll(Object.assign(Object.assign({}, params), { factorType: 'webauthn' }));
      }
      /**
       * Challenge for WebAuthn credential creation or authentication.
       * Combines server challenge with browser credential operations.
       * Handles both registration (create) and authentication (request) flows.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {MFAChallengeWebauthnParams & { friendlyName?: string; signal?: AbortSignal }} params - Challenge parameters including factorId
       * @param {Object} overrides - Allows you to override the parameters passed to navigator.credentials
       * @param {PublicKeyCredentialCreationOptionsFuture} overrides.create - Override options for credential creation
       * @param {PublicKeyCredentialRequestOptionsFuture} overrides.request - Override options for credential request
       * @returns {Promise<RequestResult>} Challenge response with credential or error
       * @see {@link https://w3c.github.io/webauthn/#sctn-credential-creation W3C WebAuthn Spec - Credential Creation}
       * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying Assertion}
       */
      async _challenge({ factorId, webauthn, friendlyName, signal, }, overrides) {
          try {
              // Get challenge from server using the client's MFA methods
              const { data: challengeResponse, error: challengeError } = await this.client.mfa.challenge({
                  factorId,
                  webauthn,
              });
              if (!challengeResponse) {
                  return { data: null, error: challengeError };
              }
              const abortSignal = signal !== null && signal !== void 0 ? signal : webAuthnAbortService.createNewAbortSignal();
              /** webauthn will fail if either of the name/displayname are blank */
              if (challengeResponse.webauthn.type === 'create') {
                  const { user } = challengeResponse.webauthn.credential_options.publicKey;
                  if (!user.name) {
                      user.name = `${user.id}:${friendlyName}`;
                  }
                  if (!user.displayName) {
                      user.displayName = user.name;
                  }
              }
              switch (challengeResponse.webauthn.type) {
                  case 'create': {
                      const options = mergeCredentialCreationOptions(challengeResponse.webauthn.credential_options.publicKey, overrides === null || overrides === void 0 ? void 0 : overrides.create);
                      const { data, error } = await createCredential({
                          publicKey: options,
                          signal: abortSignal,
                      });
                      if (data) {
                          return {
                              data: {
                                  factorId,
                                  challengeId: challengeResponse.id,
                                  webauthn: {
                                      type: challengeResponse.webauthn.type,
                                      credential_response: data,
                                  },
                              },
                              error: null,
                          };
                      }
                      return { data: null, error };
                  }
                  case 'request': {
                      const options = mergeCredentialRequestOptions(challengeResponse.webauthn.credential_options.publicKey, overrides === null || overrides === void 0 ? void 0 : overrides.request);
                      const { data, error } = await getCredential(Object.assign(Object.assign({}, challengeResponse.webauthn.credential_options), { publicKey: options, signal: abortSignal }));
                      if (data) {
                          return {
                              data: {
                                  factorId,
                                  challengeId: challengeResponse.id,
                                  webauthn: {
                                      type: challengeResponse.webauthn.type,
                                      credential_response: data,
                                  },
                              },
                              error: null,
                          };
                      }
                      return { data: null, error };
                  }
              }
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: null, error };
              }
              return {
                  data: null,
                  error: new AuthUnknownError('Unexpected error in challenge', error),
              };
          }
      }
      /**
       * Verify a WebAuthn credential with the server.
       * Completes the WebAuthn ceremony by sending the credential to the server for verification.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Object} params - Verification parameters
       * @param {string} params.challengeId - ID of the challenge being verified
       * @param {string} params.factorId - ID of the WebAuthn factor
       * @param {MFAVerifyWebauthnParams<T>['webauthn']} params.webauthn - WebAuthn credential response
       * @returns {Promise<AuthMFAVerifyResponse>} Verification result with session or error
       * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying an Authentication Assertion}
       * */
      async _verify({ challengeId, factorId, webauthn, }) {
          return this.client.mfa.verify({
              factorId,
              challengeId,
              webauthn: webauthn,
          });
      }
      /**
       * Complete WebAuthn authentication flow.
       * Performs challenge and verification in a single operation for existing credentials.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Object} params - Authentication parameters
       * @param {string} params.factorId - ID of the WebAuthn factor to authenticate with
       * @param {Object} params.webauthn - WebAuthn configuration
       * @param {string} params.webauthn.rpId - Relying Party ID (defaults to current hostname)
       * @param {string[]} params.webauthn.rpOrigins - Allowed origins (defaults to current origin)
       * @param {AbortSignal} params.webauthn.signal - Optional abort signal
       * @param {PublicKeyCredentialRequestOptionsFuture} overrides - Override options for navigator.credentials.get
       * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Authentication result
       * @see {@link https://w3c.github.io/webauthn/#sctn-authentication W3C WebAuthn Spec - Authentication Ceremony}
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialRequestOptions MDN - PublicKeyCredentialRequestOptions}
       */
      async _authenticate({ factorId, webauthn: { rpId = typeof window !== 'undefined' ? window.location.hostname : undefined, rpOrigins = typeof window !== 'undefined' ? [window.location.origin] : undefined, signal, } = {}, }, overrides) {
          if (!rpId) {
              return {
                  data: null,
                  error: new AuthError('rpId is required for WebAuthn authentication'),
              };
          }
          try {
              if (!browserSupportsWebAuthn()) {
                  return {
                      data: null,
                      error: new AuthUnknownError('Browser does not support WebAuthn', null),
                  };
              }
              // Get challenge and credential
              const { data: challengeResponse, error: challengeError } = await this.challenge({
                  factorId,
                  webauthn: { rpId, rpOrigins },
                  signal,
              }, { request: overrides });
              if (!challengeResponse) {
                  return { data: null, error: challengeError };
              }
              const { webauthn } = challengeResponse;
              // Verify credential
              return this._verify({
                  factorId,
                  challengeId: challengeResponse.challengeId,
                  webauthn: {
                      type: webauthn.type,
                      rpId,
                      rpOrigins,
                      credential_response: webauthn.credential_response,
                  },
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: null, error };
              }
              return {
                  data: null,
                  error: new AuthUnknownError('Unexpected error in authenticate', error),
              };
          }
      }
      /**
       * Complete WebAuthn registration flow.
       * Performs enrollment, challenge, and verification in a single operation for new credentials.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Object} params - Registration parameters
       * @param {string} params.friendlyName - User-friendly name for the credential
       * @param {string} params.rpId - Relying Party ID (defaults to current hostname)
       * @param {string[]} params.rpOrigins - Allowed origins (defaults to current origin)
       * @param {AbortSignal} params.signal - Optional abort signal
       * @param {PublicKeyCredentialCreationOptionsFuture} overrides - Override options for navigator.credentials.create
       * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Registration result
       * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registration Ceremony}
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions MDN - PublicKeyCredentialCreationOptions}
       */
      async _register({ friendlyName, webauthn: { rpId = typeof window !== 'undefined' ? window.location.hostname : undefined, rpOrigins = typeof window !== 'undefined' ? [window.location.origin] : undefined, signal, } = {}, }, overrides) {
          if (!rpId) {
              return {
                  data: null,
                  error: new AuthError('rpId is required for WebAuthn registration'),
              };
          }
          try {
              if (!browserSupportsWebAuthn()) {
                  return {
                      data: null,
                      error: new AuthUnknownError('Browser does not support WebAuthn', null),
                  };
              }
              // Enroll factor
              const { data: factor, error: enrollError } = await this._enroll({
                  friendlyName,
              });
              if (!factor) {
                  await this.client.mfa
                      .listFactors()
                      .then((factors) => {
                      var _a;
                      return (_a = factors.data) === null || _a === void 0 ? void 0 : _a.all.find((v) => v.factor_type === 'webauthn' &&
                          v.friendly_name === friendlyName &&
                          v.status !== 'unverified');
                  })
                      .then((factor) => (factor ? this.client.mfa.unenroll({ factorId: factor === null || factor === void 0 ? void 0 : factor.id }) : void 0));
                  return { data: null, error: enrollError };
              }
              // Get challenge and create credential
              const { data: challengeResponse, error: challengeError } = await this._challenge({
                  factorId: factor.id,
                  friendlyName: factor.friendly_name,
                  webauthn: { rpId, rpOrigins },
                  signal,
              }, {
                  create: overrides,
              });
              if (!challengeResponse) {
                  return { data: null, error: challengeError };
              }
              return this._verify({
                  factorId: factor.id,
                  challengeId: challengeResponse.challengeId,
                  webauthn: {
                      rpId,
                      rpOrigins,
                      type: challengeResponse.webauthn.type,
                      credential_response: challengeResponse.webauthn.credential_response,
                  },
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return { data: null, error };
              }
              return {
                  data: null,
                  error: new AuthUnknownError('Unexpected error in register', error),
              };
          }
      }
  }

  polyfillGlobalThis(); // Make "globalThis" available
  const DEFAULT_OPTIONS = {
      url: GOTRUE_URL,
      storageKey: STORAGE_KEY,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      headers: DEFAULT_HEADERS,
      flowType: 'implicit',
      debug: false,
      hasCustomAuthorizationHeader: false,
      throwOnError: false,
  };
  async function lockNoOp(name, acquireTimeout, fn) {
      return await fn();
  }
  /**
   * Caches JWKS values for all clients created in the same environment. This is
   * especially useful for shared-memory execution environments such as Vercel's
   * Fluid Compute, AWS Lambda or Supabase's Edge Functions. Regardless of how
   * many clients are created, if they share the same storage key they will use
   * the same JWKS cache, significantly speeding up getClaims() with asymmetric
   * JWTs.
   */
  const GLOBAL_JWKS = {};
  class GoTrueClient {
      /**
       * The JWKS used for verifying asymmetric JWTs
       */
      get jwks() {
          var _a, _b;
          return (_b = (_a = GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.jwks) !== null && _b !== void 0 ? _b : { keys: [] };
      }
      set jwks(value) {
          GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, GLOBAL_JWKS[this.storageKey]), { jwks: value });
      }
      get jwks_cached_at() {
          var _a, _b;
          return (_b = (_a = GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.cachedAt) !== null && _b !== void 0 ? _b : Number.MIN_SAFE_INTEGER;
      }
      set jwks_cached_at(value) {
          GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, GLOBAL_JWKS[this.storageKey]), { cachedAt: value });
      }
      /**
       * Create a new client for use in the browser.
       *
       * @example
       * ```ts
       * import { GoTrueClient } from '@supabase/auth-js'
       *
       * const auth = new GoTrueClient({
       *   url: 'https://xyzcompany.supabase.co/auth/v1',
       *   headers: { apikey: 'public-anon-key' },
       *   storageKey: 'supabase-auth',
       * })
       * ```
       */
      constructor(options) {
          var _a, _b, _c;
          /**
           * @experimental
           */
          this.userStorage = null;
          this.memoryStorage = null;
          this.stateChangeEmitters = new Map();
          this.autoRefreshTicker = null;
          this.visibilityChangedCallback = null;
          this.refreshingDeferred = null;
          /**
           * Keeps track of the async client initialization.
           * When null or not yet resolved the auth state is `unknown`
           * Once resolved the auth state is known and it's safe to call any further client methods.
           * Keep extra care to never reject or throw uncaught errors
           */
          this.initializePromise = null;
          this.detectSessionInUrl = true;
          this.hasCustomAuthorizationHeader = false;
          this.suppressGetSessionWarning = false;
          this.lockAcquired = false;
          this.pendingInLock = [];
          /**
           * Used to broadcast state change events to other tabs listening.
           */
          this.broadcastChannel = null;
          this.logger = console.log;
          const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
          this.storageKey = settings.storageKey;
          this.instanceID = (_a = GoTrueClient.nextInstanceID[this.storageKey]) !== null && _a !== void 0 ? _a : 0;
          GoTrueClient.nextInstanceID[this.storageKey] = this.instanceID + 1;
          this.logDebugMessages = !!settings.debug;
          if (typeof settings.debug === 'function') {
              this.logger = settings.debug;
          }
          if (this.instanceID > 0 && isBrowser()) {
              const message = `${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`;
              console.warn(message);
              if (this.logDebugMessages) {
                  console.trace(message);
              }
          }
          this.persistSession = settings.persistSession;
          this.autoRefreshToken = settings.autoRefreshToken;
          this.admin = new GoTrueAdminApi({
              url: settings.url,
              headers: settings.headers,
              fetch: settings.fetch,
          });
          this.url = settings.url;
          this.headers = settings.headers;
          this.fetch = resolveFetch(settings.fetch);
          this.lock = settings.lock || lockNoOp;
          this.detectSessionInUrl = settings.detectSessionInUrl;
          this.flowType = settings.flowType;
          this.hasCustomAuthorizationHeader = settings.hasCustomAuthorizationHeader;
          this.throwOnError = settings.throwOnError;
          if (settings.lock) {
              this.lock = settings.lock;
          }
          else if (isBrowser() && ((_b = globalThis === null || globalThis === void 0 ? void 0 : globalThis.navigator) === null || _b === void 0 ? void 0 : _b.locks)) {
              this.lock = navigatorLock;
          }
          else {
              this.lock = lockNoOp;
          }
          if (!this.jwks) {
              this.jwks = { keys: [] };
              this.jwks_cached_at = Number.MIN_SAFE_INTEGER;
          }
          this.mfa = {
              verify: this._verify.bind(this),
              enroll: this._enroll.bind(this),
              unenroll: this._unenroll.bind(this),
              challenge: this._challenge.bind(this),
              listFactors: this._listFactors.bind(this),
              challengeAndVerify: this._challengeAndVerify.bind(this),
              getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
              webauthn: new WebAuthnApi(this),
          };
          this.oauth = {
              getAuthorizationDetails: this._getAuthorizationDetails.bind(this),
              approveAuthorization: this._approveAuthorization.bind(this),
              denyAuthorization: this._denyAuthorization.bind(this),
              listGrants: this._listOAuthGrants.bind(this),
              revokeGrant: this._revokeOAuthGrant.bind(this),
          };
          if (this.persistSession) {
              if (settings.storage) {
                  this.storage = settings.storage;
              }
              else {
                  if (supportsLocalStorage()) {
                      this.storage = globalThis.localStorage;
                  }
                  else {
                      this.memoryStorage = {};
                      this.storage = memoryLocalStorageAdapter(this.memoryStorage);
                  }
              }
              if (settings.userStorage) {
                  this.userStorage = settings.userStorage;
              }
          }
          else {
              this.memoryStorage = {};
              this.storage = memoryLocalStorageAdapter(this.memoryStorage);
          }
          if (isBrowser() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
              try {
                  this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
              }
              catch (e) {
                  console.error('Failed to create a new BroadcastChannel, multi-tab state changes will not be available', e);
              }
              (_c = this.broadcastChannel) === null || _c === void 0 ? void 0 : _c.addEventListener('message', async (event) => {
                  this._debug('received broadcast notification from other tab or client', event);
                  await this._notifyAllSubscribers(event.data.event, event.data.session, false); // broadcast = false so we don't get an endless loop of messages
              });
          }
          this.initialize();
      }
      /**
       * Returns whether error throwing mode is enabled for this client.
       */
      isThrowOnErrorEnabled() {
          return this.throwOnError;
      }
      /**
       * Centralizes return handling with optional error throwing. When `throwOnError` is enabled
       * and the provided result contains a non-nullish error, the error is thrown instead of
       * being returned. This ensures consistent behavior across all public API methods.
       */
      _returnResult(result) {
          if (this.throwOnError && result && result.error) {
              throw result.error;
          }
          return result;
      }
      _logPrefix() {
          return ('GoTrueClient@' +
              `${this.storageKey}:${this.instanceID} (${version}) ${new Date().toISOString()}`);
      }
      _debug(...args) {
          if (this.logDebugMessages) {
              this.logger(this._logPrefix(), ...args);
          }
          return this;
      }
      /**
       * Initializes the client session either from the url or from storage.
       * This method is automatically called when instantiating the client, but should also be called
       * manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).
       */
      async initialize() {
          if (this.initializePromise) {
              return await this.initializePromise;
          }
          this.initializePromise = (async () => {
              return await this._acquireLock(-1, async () => {
                  return await this._initialize();
              });
          })();
          return await this.initializePromise;
      }
      /**
       * IMPORTANT:
       * 1. Never throw in this method, as it is called from the constructor
       * 2. Never return a session from this method as it would be cached over
       *    the whole lifetime of the client
       */
      async _initialize() {
          var _a;
          try {
              let params = {};
              let callbackUrlType = 'none';
              if (isBrowser()) {
                  params = parseParametersFromURL(window.location.href);
                  if (this._isImplicitGrantCallback(params)) {
                      callbackUrlType = 'implicit';
                  }
                  else if (await this._isPKCECallback(params)) {
                      callbackUrlType = 'pkce';
                  }
              }
              /**
               * Attempt to get the session from the URL only if these conditions are fulfilled
               *
               * Note: If the URL isn't one of the callback url types (implicit or pkce),
               * then there could be an existing session so we don't want to prematurely remove it
               */
              if (isBrowser() && this.detectSessionInUrl && callbackUrlType !== 'none') {
                  const { data, error } = await this._getSessionFromURL(params, callbackUrlType);
                  if (error) {
                      this._debug('#_initialize()', 'error detecting session from URL', error);
                      if (isAuthImplicitGrantRedirectError(error)) {
                          const errorCode = (_a = error.details) === null || _a === void 0 ? void 0 : _a.code;
                          if (errorCode === 'identity_already_exists' ||
                              errorCode === 'identity_not_found' ||
                              errorCode === 'single_identity_not_deletable') {
                              return { error };
                          }
                      }
                      // failed login attempt via url,
                      // remove old session as in verifyOtp, signUp and signInWith*
                      await this._removeSession();
                      return { error };
                  }
                  const { session, redirectType } = data;
                  this._debug('#_initialize()', 'detected session in URL', session, 'redirect type', redirectType);
                  await this._saveSession(session);
                  setTimeout(async () => {
                      if (redirectType === 'recovery') {
                          await this._notifyAllSubscribers('PASSWORD_RECOVERY', session);
                      }
                      else {
                          await this._notifyAllSubscribers('SIGNED_IN', session);
                      }
                  }, 0);
                  return { error: null };
              }
              // no login attempt via callback url try to recover session from storage
              await this._recoverAndRefresh();
              return { error: null };
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ error });
              }
              return this._returnResult({
                  error: new AuthUnknownError('Unexpected error during initialization', error),
              });
          }
          finally {
              await this._handleVisibilityChange();
              this._debug('#_initialize()', 'end');
          }
      }
      /**
       * Creates a new anonymous user.
       *
       * @returns A session where the is_anonymous claim in the access token JWT set to true
       */
      async signInAnonymously(credentials) {
          var _a, _b, _c;
          try {
              const res = await _request(this.fetch, 'POST', `${this.url}/signup`, {
                  headers: this.headers,
                  body: {
                      data: (_b = (_a = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : {},
                      gotrue_meta_security: { captcha_token: (_c = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _c === void 0 ? void 0 : _c.captchaToken },
                  },
                  xform: _sessionResponse,
              });
              const { data, error } = res;
              if (error || !data) {
                  return this._returnResult({ data: { user: null, session: null }, error: error });
              }
              const session = data.session;
              const user = data.user;
              if (data.session) {
                  await this._saveSession(data.session);
                  await this._notifyAllSubscribers('SIGNED_IN', session);
              }
              return this._returnResult({ data: { user, session }, error: null });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              throw error;
          }
      }
      /**
       * Creates a new user.
       *
       * Be aware that if a user account exists in the system you may get back an
       * error message that attempts to hide this information from the user.
       * This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.
       *
       * @returns A logged-in session if the server has "autoconfirm" ON
       * @returns A user if the server has "autoconfirm" OFF
       */
      async signUp(credentials) {
          var _a, _b, _c;
          try {
              let res;
              if ('email' in credentials) {
                  const { email, password, options } = credentials;
                  let codeChallenge = null;
                  let codeChallengeMethod = null;
                  if (this.flowType === 'pkce') {
                      ;
                      [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
                  }
                  res = await _request(this.fetch, 'POST', `${this.url}/signup`, {
                      headers: this.headers,
                      redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                      body: {
                          email,
                          password,
                          data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
                          gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                          code_challenge: codeChallenge,
                          code_challenge_method: codeChallengeMethod,
                      },
                      xform: _sessionResponse,
                  });
              }
              else if ('phone' in credentials) {
                  const { phone, password, options } = credentials;
                  res = await _request(this.fetch, 'POST', `${this.url}/signup`, {
                      headers: this.headers,
                      body: {
                          phone,
                          password,
                          data: (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : {},
                          channel: (_c = options === null || options === void 0 ? void 0 : options.channel) !== null && _c !== void 0 ? _c : 'sms',
                          gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                      },
                      xform: _sessionResponse,
                  });
              }
              else {
                  throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a password');
              }
              const { data, error } = res;
              if (error || !data) {
                  return this._returnResult({ data: { user: null, session: null }, error: error });
              }
              const session = data.session;
              const user = data.user;
              if (data.session) {
                  await this._saveSession(data.session);
                  await this._notifyAllSubscribers('SIGNED_IN', session);
              }
              return this._returnResult({ data: { user, session }, error: null });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              throw error;
          }
      }
      /**
       * Log in an existing user with an email and password or phone and password.
       *
       * Be aware that you may get back an error message that will not distinguish
       * between the cases where the account does not exist or that the
       * email/phone and password combination is wrong or that the account can only
       * be accessed via social login.
       */
      async signInWithPassword(credentials) {
          try {
              let res;
              if ('email' in credentials) {
                  const { email, password, options } = credentials;
                  res = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=password`, {
                      headers: this.headers,
                      body: {
                          email,
                          password,
                          gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                      },
                      xform: _sessionResponsePassword,
                  });
              }
              else if ('phone' in credentials) {
                  const { phone, password, options } = credentials;
                  res = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=password`, {
                      headers: this.headers,
                      body: {
                          phone,
                          password,
                          gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                      },
                      xform: _sessionResponsePassword,
                  });
              }
              else {
                  throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a password');
              }
              const { data, error } = res;
              if (error) {
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              else if (!data || !data.session || !data.user) {
                  const invalidTokenError = new AuthInvalidTokenResponseError();
                  return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
              }
              if (data.session) {
                  await this._saveSession(data.session);
                  await this._notifyAllSubscribers('SIGNED_IN', data.session);
              }
              return this._returnResult({
                  data: Object.assign({ user: data.user, session: data.session }, (data.weak_password ? { weakPassword: data.weak_password } : null)),
                  error,
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              throw error;
          }
      }
      /**
       * Log in an existing user via a third-party provider.
       * This method supports the PKCE flow.
       */
      async signInWithOAuth(credentials) {
          var _a, _b, _c, _d;
          return await this._handleProviderSignIn(credentials.provider, {
              redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
              scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
              queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
              skipBrowserRedirect: (_d = credentials.options) === null || _d === void 0 ? void 0 : _d.skipBrowserRedirect,
          });
      }
      /**
       * Log in an existing user by exchanging an Auth Code issued during the PKCE flow.
       */
      async exchangeCodeForSession(authCode) {
          await this.initializePromise;
          return this._acquireLock(-1, async () => {
              return this._exchangeCodeForSession(authCode);
          });
      }
      /**
       * Signs in a user by verifying a message signed by the user's private key.
       * Supports Ethereum (via Sign-In-With-Ethereum) & Solana (Sign-In-With-Solana) standards,
       * both of which derive from the EIP-4361 standard
       * With slight variation on Solana's side.
       * @reference https://eips.ethereum.org/EIPS/eip-4361
       */
      async signInWithWeb3(credentials) {
          const { chain } = credentials;
          switch (chain) {
              case 'ethereum':
                  return await this.signInWithEthereum(credentials);
              case 'solana':
                  return await this.signInWithSolana(credentials);
              default:
                  throw new Error(`@supabase/auth-js: Unsupported chain "${chain}"`);
          }
      }
      async signInWithEthereum(credentials) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
          // TODO: flatten type
          let message;
          let signature;
          if ('message' in credentials) {
              message = credentials.message;
              signature = credentials.signature;
          }
          else {
              const { chain, wallet, statement, options } = credentials;
              let resolvedWallet;
              if (!isBrowser()) {
                  if (typeof wallet !== 'object' || !(options === null || options === void 0 ? void 0 : options.url)) {
                      throw new Error('@supabase/auth-js: Both wallet and url must be specified in non-browser environments.');
                  }
                  resolvedWallet = wallet;
              }
              else if (typeof wallet === 'object') {
                  resolvedWallet = wallet;
              }
              else {
                  const windowAny = window;
                  if ('ethereum' in windowAny &&
                      typeof windowAny.ethereum === 'object' &&
                      'request' in windowAny.ethereum &&
                      typeof windowAny.ethereum.request === 'function') {
                      resolvedWallet = windowAny.ethereum;
                  }
                  else {
                      throw new Error(`@supabase/auth-js: No compatible Ethereum wallet interface on the window object (window.ethereum) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'ethereum', wallet: resolvedUserWallet }) instead.`);
                  }
              }
              const url = new URL((_a = options === null || options === void 0 ? void 0 : options.url) !== null && _a !== void 0 ? _a : window.location.href);
              const accounts = await resolvedWallet
                  .request({
                  method: 'eth_requestAccounts',
              })
                  .then((accs) => accs)
                  .catch(() => {
                  throw new Error(`@supabase/auth-js: Wallet method eth_requestAccounts is missing or invalid`);
              });
              if (!accounts || accounts.length === 0) {
                  throw new Error(`@supabase/auth-js: No accounts available. Please ensure the wallet is connected.`);
              }
              const address = getAddress(accounts[0]);
              let chainId = (_b = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _b === void 0 ? void 0 : _b.chainId;
              if (!chainId) {
                  const chainIdHex = await resolvedWallet.request({
                      method: 'eth_chainId',
                  });
                  chainId = fromHex(chainIdHex);
              }
              const siweMessage = {
                  domain: url.host,
                  address: address,
                  statement: statement,
                  uri: url.href,
                  version: '1',
                  chainId: chainId,
                  nonce: (_c = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _c === void 0 ? void 0 : _c.nonce,
                  issuedAt: (_e = (_d = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _d === void 0 ? void 0 : _d.issuedAt) !== null && _e !== void 0 ? _e : new Date(),
                  expirationTime: (_f = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _f === void 0 ? void 0 : _f.expirationTime,
                  notBefore: (_g = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _g === void 0 ? void 0 : _g.notBefore,
                  requestId: (_h = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _h === void 0 ? void 0 : _h.requestId,
                  resources: (_j = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _j === void 0 ? void 0 : _j.resources,
              };
              message = createSiweMessage(siweMessage);
              // Sign message
              signature = (await resolvedWallet.request({
                  method: 'personal_sign',
                  params: [toHex(message), address],
              }));
          }
          try {
              const { data, error } = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=web3`, {
                  headers: this.headers,
                  body: Object.assign({ chain: 'ethereum', message,
                      signature }, (((_k = credentials.options) === null || _k === void 0 ? void 0 : _k.captchaToken)
                      ? { gotrue_meta_security: { captcha_token: (_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken } }
                      : null)),
                  xform: _sessionResponse,
              });
              if (error) {
                  throw error;
              }
              if (!data || !data.session || !data.user) {
                  const invalidTokenError = new AuthInvalidTokenResponseError();
                  return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
              }
              if (data.session) {
                  await this._saveSession(data.session);
                  await this._notifyAllSubscribers('SIGNED_IN', data.session);
              }
              return this._returnResult({ data: Object.assign({}, data), error });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              throw error;
          }
      }
      async signInWithSolana(credentials) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
          let message;
          let signature;
          if ('message' in credentials) {
              message = credentials.message;
              signature = credentials.signature;
          }
          else {
              const { chain, wallet, statement, options } = credentials;
              let resolvedWallet;
              if (!isBrowser()) {
                  if (typeof wallet !== 'object' || !(options === null || options === void 0 ? void 0 : options.url)) {
                      throw new Error('@supabase/auth-js: Both wallet and url must be specified in non-browser environments.');
                  }
                  resolvedWallet = wallet;
              }
              else if (typeof wallet === 'object') {
                  resolvedWallet = wallet;
              }
              else {
                  const windowAny = window;
                  if ('solana' in windowAny &&
                      typeof windowAny.solana === 'object' &&
                      (('signIn' in windowAny.solana && typeof windowAny.solana.signIn === 'function') ||
                          ('signMessage' in windowAny.solana &&
                              typeof windowAny.solana.signMessage === 'function'))) {
                      resolvedWallet = windowAny.solana;
                  }
                  else {
                      throw new Error(`@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.`);
                  }
              }
              const url = new URL((_a = options === null || options === void 0 ? void 0 : options.url) !== null && _a !== void 0 ? _a : window.location.href);
              if ('signIn' in resolvedWallet && resolvedWallet.signIn) {
                  const output = await resolvedWallet.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: new Date().toISOString() }, options === null || options === void 0 ? void 0 : options.signInWithSolana), {
                      // non-overridable properties
                      version: '1', domain: url.host, uri: url.href }), (statement ? { statement } : null)));
                  let outputToProcess;
                  if (Array.isArray(output) && output[0] && typeof output[0] === 'object') {
                      outputToProcess = output[0];
                  }
                  else if (output &&
                      typeof output === 'object' &&
                      'signedMessage' in output &&
                      'signature' in output) {
                      outputToProcess = output;
                  }
                  else {
                      throw new Error('@supabase/auth-js: Wallet method signIn() returned unrecognized value');
                  }
                  if ('signedMessage' in outputToProcess &&
                      'signature' in outputToProcess &&
                      (typeof outputToProcess.signedMessage === 'string' ||
                          outputToProcess.signedMessage instanceof Uint8Array) &&
                      outputToProcess.signature instanceof Uint8Array) {
                      message =
                          typeof outputToProcess.signedMessage === 'string'
                              ? outputToProcess.signedMessage
                              : new TextDecoder().decode(outputToProcess.signedMessage);
                      signature = outputToProcess.signature;
                  }
                  else {
                      throw new Error('@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields');
                  }
              }
              else {
                  if (!('signMessage' in resolvedWallet) ||
                      typeof resolvedWallet.signMessage !== 'function' ||
                      !('publicKey' in resolvedWallet) ||
                      typeof resolvedWallet !== 'object' ||
                      !resolvedWallet.publicKey ||
                      !('toBase58' in resolvedWallet.publicKey) ||
                      typeof resolvedWallet.publicKey.toBase58 !== 'function') {
                      throw new Error('@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API');
                  }
                  message = [
                      `${url.host} wants you to sign in with your Solana account:`,
                      resolvedWallet.publicKey.toBase58(),
                      ...(statement ? ['', statement, ''] : ['']),
                      'Version: 1',
                      `URI: ${url.href}`,
                      `Issued At: ${(_c = (_b = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _b === void 0 ? void 0 : _b.issuedAt) !== null && _c !== void 0 ? _c : new Date().toISOString()}`,
                      ...(((_d = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _d === void 0 ? void 0 : _d.notBefore)
                          ? [`Not Before: ${options.signInWithSolana.notBefore}`]
                          : []),
                      ...(((_e = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _e === void 0 ? void 0 : _e.expirationTime)
                          ? [`Expiration Time: ${options.signInWithSolana.expirationTime}`]
                          : []),
                      ...(((_f = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _f === void 0 ? void 0 : _f.chainId)
                          ? [`Chain ID: ${options.signInWithSolana.chainId}`]
                          : []),
                      ...(((_g = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _g === void 0 ? void 0 : _g.nonce) ? [`Nonce: ${options.signInWithSolana.nonce}`] : []),
                      ...(((_h = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _h === void 0 ? void 0 : _h.requestId)
                          ? [`Request ID: ${options.signInWithSolana.requestId}`]
                          : []),
                      ...(((_k = (_j = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _j === void 0 ? void 0 : _j.resources) === null || _k === void 0 ? void 0 : _k.length)
                          ? [
                              'Resources',
                              ...options.signInWithSolana.resources.map((resource) => `- ${resource}`),
                          ]
                          : []),
                  ].join('\n');
                  const maybeSignature = await resolvedWallet.signMessage(new TextEncoder().encode(message), 'utf8');
                  if (!maybeSignature || !(maybeSignature instanceof Uint8Array)) {
                      throw new Error('@supabase/auth-js: Wallet signMessage() API returned an recognized value');
                  }
                  signature = maybeSignature;
              }
          }
          try {
              const { data, error } = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=web3`, {
                  headers: this.headers,
                  body: Object.assign({ chain: 'solana', message, signature: bytesToBase64URL(signature) }, (((_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken)
                      ? { gotrue_meta_security: { captcha_token: (_m = credentials.options) === null || _m === void 0 ? void 0 : _m.captchaToken } }
                      : null)),
                  xform: _sessionResponse,
              });
              if (error) {
                  throw error;
              }
              if (!data || !data.session || !data.user) {
                  const invalidTokenError = new AuthInvalidTokenResponseError();
                  return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
              }
              if (data.session) {
                  await this._saveSession(data.session);
                  await this._notifyAllSubscribers('SIGNED_IN', data.session);
              }
              return this._returnResult({ data: Object.assign({}, data), error });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              throw error;
          }
      }
      async _exchangeCodeForSession(authCode) {
          const storageItem = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
          const [codeVerifier, redirectType] = (storageItem !== null && storageItem !== void 0 ? storageItem : '').split('/');
          try {
              const { data, error } = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=pkce`, {
                  headers: this.headers,
                  body: {
                      auth_code: authCode,
                      code_verifier: codeVerifier,
                  },
                  xform: _sessionResponse,
              });
              await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
              if (error) {
                  throw error;
              }
              if (!data || !data.session || !data.user) {
                  const invalidTokenError = new AuthInvalidTokenResponseError();
                  return this._returnResult({
                      data: { user: null, session: null, redirectType: null },
                      error: invalidTokenError,
                  });
              }
              if (data.session) {
                  await this._saveSession(data.session);
                  await this._notifyAllSubscribers('SIGNED_IN', data.session);
              }
              return this._returnResult({ data: Object.assign(Object.assign({}, data), { redirectType: redirectType !== null && redirectType !== void 0 ? redirectType : null }), error });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({
                      data: { user: null, session: null, redirectType: null },
                      error,
                  });
              }
              throw error;
          }
      }
      /**
       * Allows signing in with an OIDC ID token. The authentication provider used
       * should be enabled and configured.
       */
      async signInWithIdToken(credentials) {
          try {
              const { options, provider, token, access_token, nonce } = credentials;
              const res = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=id_token`, {
                  headers: this.headers,
                  body: {
                      provider,
                      id_token: token,
                      access_token,
                      nonce,
                      gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                  },
                  xform: _sessionResponse,
              });
              const { data, error } = res;
              if (error) {
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              else if (!data || !data.session || !data.user) {
                  const invalidTokenError = new AuthInvalidTokenResponseError();
                  return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
              }
              if (data.session) {
                  await this._saveSession(data.session);
                  await this._notifyAllSubscribers('SIGNED_IN', data.session);
              }
              return this._returnResult({ data, error });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              throw error;
          }
      }
      /**
       * Log in a user using magiclink or a one-time password (OTP).
       *
       * If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent.
       * If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent.
       * If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.
       *
       * Be aware that you may get back an error message that will not distinguish
       * between the cases where the account does not exist or, that the account
       * can only be accessed via social login.
       *
       * Do note that you will need to configure a Whatsapp sender on Twilio
       * if you are using phone sign in with the 'whatsapp' channel. The whatsapp
       * channel is not supported on other providers
       * at this time.
       * This method supports PKCE when an email is passed.
       */
      async signInWithOtp(credentials) {
          var _a, _b, _c, _d, _e;
          try {
              if ('email' in credentials) {
                  const { email, options } = credentials;
                  let codeChallenge = null;
                  let codeChallengeMethod = null;
                  if (this.flowType === 'pkce') {
                      ;
                      [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
                  }
                  const { error } = await _request(this.fetch, 'POST', `${this.url}/otp`, {
                      headers: this.headers,
                      body: {
                          email,
                          data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
                          create_user: (_b = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _b !== void 0 ? _b : true,
                          gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                          code_challenge: codeChallenge,
                          code_challenge_method: codeChallengeMethod,
                      },
                      redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                  });
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              if ('phone' in credentials) {
                  const { phone, options } = credentials;
                  const { data, error } = await _request(this.fetch, 'POST', `${this.url}/otp`, {
                      headers: this.headers,
                      body: {
                          phone,
                          data: (_c = options === null || options === void 0 ? void 0 : options.data) !== null && _c !== void 0 ? _c : {},
                          create_user: (_d = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _d !== void 0 ? _d : true,
                          gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                          channel: (_e = options === null || options === void 0 ? void 0 : options.channel) !== null && _e !== void 0 ? _e : 'sms',
                      },
                  });
                  return this._returnResult({
                      data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id },
                      error,
                  });
              }
              throw new AuthInvalidCredentialsError('You must provide either an email or phone number.');
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              throw error;
          }
      }
      /**
       * Log in a user given a User supplied OTP or TokenHash received through mobile or email.
       */
      async verifyOtp(params) {
          var _a, _b;
          try {
              let redirectTo = undefined;
              let captchaToken = undefined;
              if ('options' in params) {
                  redirectTo = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo;
                  captchaToken = (_b = params.options) === null || _b === void 0 ? void 0 : _b.captchaToken;
              }
              const { data, error } = await _request(this.fetch, 'POST', `${this.url}/verify`, {
                  headers: this.headers,
                  body: Object.assign(Object.assign({}, params), { gotrue_meta_security: { captcha_token: captchaToken } }),
                  redirectTo,
                  xform: _sessionResponse,
              });
              if (error) {
                  throw error;
              }
              if (!data) {
                  const tokenVerificationError = new Error('An error occurred on token verification.');
                  throw tokenVerificationError;
              }
              const session = data.session;
              const user = data.user;
              if (session === null || session === void 0 ? void 0 : session.access_token) {
                  await this._saveSession(session);
                  await this._notifyAllSubscribers(params.type == 'recovery' ? 'PASSWORD_RECOVERY' : 'SIGNED_IN', session);
              }
              return this._returnResult({ data: { user, session }, error: null });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              throw error;
          }
      }
      /**
       * Attempts a single-sign on using an enterprise Identity Provider. A
       * successful SSO attempt will redirect the current page to the identity
       * provider authorization page. The redirect URL is implementation and SSO
       * protocol specific.
       *
       * You can use it by providing a SSO domain. Typically you can extract this
       * domain by asking users for their email address. If this domain is
       * registered on the Auth instance the redirect will use that organization's
       * currently active SSO Identity Provider for the login.
       *
       * If you have built an organization-specific login page, you can use the
       * organization's SSO Identity Provider UUID directly instead.
       */
      async signInWithSSO(params) {
          var _a, _b, _c, _d, _e;
          try {
              let codeChallenge = null;
              let codeChallengeMethod = null;
              if (this.flowType === 'pkce') {
                  ;
                  [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
              }
              const result = await _request(this.fetch, 'POST', `${this.url}/sso`, {
                  body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, ('providerId' in params ? { provider_id: params.providerId } : null)), ('domain' in params ? { domain: params.domain } : null)), { redirect_to: (_b = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo) !== null && _b !== void 0 ? _b : undefined }), (((_c = params === null || params === void 0 ? void 0 : params.options) === null || _c === void 0 ? void 0 : _c.captchaToken)
                      ? { gotrue_meta_security: { captcha_token: params.options.captchaToken } }
                      : null)), { skip_http_redirect: true, code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
                  headers: this.headers,
                  xform: _ssoResponse,
              });
              // Automatically redirect in browser unless skipBrowserRedirect is true
              if (((_d = result.data) === null || _d === void 0 ? void 0 : _d.url) && isBrowser() && !((_e = params.options) === null || _e === void 0 ? void 0 : _e.skipBrowserRedirect)) {
                  window.location.assign(result.data.url);
              }
              return this._returnResult(result);
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: null, error });
              }
              throw error;
          }
      }
      /**
       * Sends a reauthentication OTP to the user's email or phone number.
       * Requires the user to be signed-in.
       */
      async reauthenticate() {
          await this.initializePromise;
          return await this._acquireLock(-1, async () => {
              return await this._reauthenticate();
          });
      }
      async _reauthenticate() {
          try {
              return await this._useSession(async (result) => {
                  const { data: { session }, error: sessionError, } = result;
                  if (sessionError)
                      throw sessionError;
                  if (!session)
                      throw new AuthSessionMissingError();
                  const { error } = await _request(this.fetch, 'GET', `${this.url}/reauthenticate`, {
                      headers: this.headers,
                      jwt: session.access_token,
                  });
                  return this._returnResult({ data: { user: null, session: null }, error });
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              throw error;
          }
      }
      /**
       * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
       */
      async resend(credentials) {
          try {
              const endpoint = `${this.url}/resend`;
              if ('email' in credentials) {
                  const { email, type, options } = credentials;
                  const { error } = await _request(this.fetch, 'POST', endpoint, {
                      headers: this.headers,
                      body: {
                          email,
                          type,
                          gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                      },
                      redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                  });
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              else if ('phone' in credentials) {
                  const { phone, type, options } = credentials;
                  const { data, error } = await _request(this.fetch, 'POST', endpoint, {
                      headers: this.headers,
                      body: {
                          phone,
                          type,
                          gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                      },
                  });
                  return this._returnResult({
                      data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id },
                      error,
                  });
              }
              throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a type');
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              throw error;
          }
      }
      /**
       * Returns the session, refreshing it if necessary.
       *
       * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
       *
       * **IMPORTANT:** This method loads values directly from the storage attached
       * to the client. If that storage is based on request cookies for example,
       * the values in it may not be authentic and therefore it's strongly advised
       * against using this method and its results in such circumstances. A warning
       * will be emitted if this is detected. Use {@link #getUser()} instead.
       */
      async getSession() {
          await this.initializePromise;
          const result = await this._acquireLock(-1, async () => {
              return this._useSession(async (result) => {
                  return result;
              });
          });
          return result;
      }
      /**
       * Acquires a global lock based on the storage key.
       */
      async _acquireLock(acquireTimeout, fn) {
          this._debug('#_acquireLock', 'begin', acquireTimeout);
          try {
              if (this.lockAcquired) {
                  const last = this.pendingInLock.length
                      ? this.pendingInLock[this.pendingInLock.length - 1]
                      : Promise.resolve();
                  const result = (async () => {
                      await last;
                      return await fn();
                  })();
                  this.pendingInLock.push((async () => {
                      try {
                          await result;
                      }
                      catch (e) {
                          // we just care if it finished
                      }
                  })());
                  return result;
              }
              return await this.lock(`lock:${this.storageKey}`, acquireTimeout, async () => {
                  this._debug('#_acquireLock', 'lock acquired for storage key', this.storageKey);
                  try {
                      this.lockAcquired = true;
                      const result = fn();
                      this.pendingInLock.push((async () => {
                          try {
                              await result;
                          }
                          catch (e) {
                              // we just care if it finished
                          }
                      })());
                      await result;
                      // keep draining the queue until there's nothing to wait on
                      while (this.pendingInLock.length) {
                          const waitOn = [...this.pendingInLock];
                          await Promise.all(waitOn);
                          this.pendingInLock.splice(0, waitOn.length);
                      }
                      return await result;
                  }
                  finally {
                      this._debug('#_acquireLock', 'lock released for storage key', this.storageKey);
                      this.lockAcquired = false;
                  }
              });
          }
          finally {
              this._debug('#_acquireLock', 'end');
          }
      }
      /**
       * Use instead of {@link #getSession} inside the library. It is
       * semantically usually what you want, as getting a session involves some
       * processing afterwards that requires only one client operating on the
       * session at once across multiple tabs or processes.
       */
      async _useSession(fn) {
          this._debug('#_useSession', 'begin');
          try {
              // the use of __loadSession here is the only correct use of the function!
              const result = await this.__loadSession();
              return await fn(result);
          }
          finally {
              this._debug('#_useSession', 'end');
          }
      }
      /**
       * NEVER USE DIRECTLY!
       *
       * Always use {@link #_useSession}.
       */
      async __loadSession() {
          this._debug('#__loadSession()', 'begin');
          if (!this.lockAcquired) {
              this._debug('#__loadSession()', 'used outside of an acquired lock!', new Error().stack);
          }
          try {
              let currentSession = null;
              const maybeSession = await getItemAsync(this.storage, this.storageKey);
              this._debug('#getSession()', 'session from storage', maybeSession);
              if (maybeSession !== null) {
                  if (this._isValidSession(maybeSession)) {
                      currentSession = maybeSession;
                  }
                  else {
                      this._debug('#getSession()', 'session from storage is not valid');
                      await this._removeSession();
                  }
              }
              if (!currentSession) {
                  return { data: { session: null }, error: null };
              }
              // A session is considered expired before the access token _actually_
              // expires. When the autoRefreshToken option is off (or when the tab is
              // in the background), very eager users of getSession() -- like
              // realtime-js -- might send a valid JWT which will expire by the time it
              // reaches the server.
              const hasExpired = currentSession.expires_at
                  ? currentSession.expires_at * 1000 - Date.now() < EXPIRY_MARGIN_MS
                  : false;
              this._debug('#__loadSession()', `session has${hasExpired ? '' : ' not'} expired`, 'expires_at', currentSession.expires_at);
              if (!hasExpired) {
                  if (this.userStorage) {
                      const maybeUser = (await getItemAsync(this.userStorage, this.storageKey + '-user'));
                      if (maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) {
                          currentSession.user = maybeUser.user;
                      }
                      else {
                          currentSession.user = userNotAvailableProxy();
                      }
                  }
                  // Wrap the user object with a warning proxy on the server
                  // This warns when properties of the user are accessed, not when session.user itself is accessed
                  if (this.storage.isServer &&
                      currentSession.user &&
                      !currentSession.user.__isUserNotAvailableProxy) {
                      const suppressWarningRef = { value: this.suppressGetSessionWarning };
                      currentSession.user = insecureUserWarningProxy(currentSession.user, suppressWarningRef);
                      // Update the client-level suppression flag when the proxy suppresses the warning
                      if (suppressWarningRef.value) {
                          this.suppressGetSessionWarning = true;
                      }
                  }
                  return { data: { session: currentSession }, error: null };
              }
              const { data: session, error } = await this._callRefreshToken(currentSession.refresh_token);
              if (error) {
                  return this._returnResult({ data: { session: null }, error });
              }
              return this._returnResult({ data: { session }, error: null });
          }
          finally {
              this._debug('#__loadSession()', 'end');
          }
      }
      /**
       * Gets the current user details if there is an existing session. This method
       * performs a network request to the Supabase Auth server, so the returned
       * value is authentic and can be used to base authorization rules on.
       *
       * @param jwt Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
       */
      async getUser(jwt) {
          if (jwt) {
              return await this._getUser(jwt);
          }
          await this.initializePromise;
          const result = await this._acquireLock(-1, async () => {
              return await this._getUser();
          });
          return result;
      }
      async _getUser(jwt) {
          try {
              if (jwt) {
                  return await _request(this.fetch, 'GET', `${this.url}/user`, {
                      headers: this.headers,
                      jwt: jwt,
                      xform: _userResponse,
                  });
              }
              return await this._useSession(async (result) => {
                  var _a, _b, _c;
                  const { data, error } = result;
                  if (error) {
                      throw error;
                  }
                  // returns an error if there is no access_token or custom authorization header
                  if (!((_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) && !this.hasCustomAuthorizationHeader) {
                      return { data: { user: null }, error: new AuthSessionMissingError() };
                  }
                  return await _request(this.fetch, 'GET', `${this.url}/user`, {
                      headers: this.headers,
                      jwt: (_c = (_b = data.session) === null || _b === void 0 ? void 0 : _b.access_token) !== null && _c !== void 0 ? _c : undefined,
                      xform: _userResponse,
                  });
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  if (isAuthSessionMissingError(error)) {
                      // JWT contains a `session_id` which does not correspond to an active
                      // session in the database, indicating the user is signed out.
                      await this._removeSession();
                      await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
                  }
                  return this._returnResult({ data: { user: null }, error });
              }
              throw error;
          }
      }
      /**
       * Updates user data for a logged in user.
       */
      async updateUser(attributes, options = {}) {
          await this.initializePromise;
          return await this._acquireLock(-1, async () => {
              return await this._updateUser(attributes, options);
          });
      }
      async _updateUser(attributes, options = {}) {
          try {
              return await this._useSession(async (result) => {
                  const { data: sessionData, error: sessionError } = result;
                  if (sessionError) {
                      throw sessionError;
                  }
                  if (!sessionData.session) {
                      throw new AuthSessionMissingError();
                  }
                  const session = sessionData.session;
                  let codeChallenge = null;
                  let codeChallengeMethod = null;
                  if (this.flowType === 'pkce' && attributes.email != null) {
                      ;
                      [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
                  }
                  const { data, error: userError } = await _request(this.fetch, 'PUT', `${this.url}/user`, {
                      headers: this.headers,
                      redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                      body: Object.assign(Object.assign({}, attributes), { code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
                      jwt: session.access_token,
                      xform: _userResponse,
                  });
                  if (userError) {
                      throw userError;
                  }
                  session.user = data.user;
                  await this._saveSession(session);
                  await this._notifyAllSubscribers('USER_UPDATED', session);
                  return this._returnResult({ data: { user: session.user }, error: null });
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { user: null }, error });
              }
              throw error;
          }
      }
      /**
       * Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session.
       * If the refresh token or access token in the current session is invalid, an error will be thrown.
       * @param currentSession The current session that minimally contains an access token and refresh token.
       */
      async setSession(currentSession) {
          await this.initializePromise;
          return await this._acquireLock(-1, async () => {
              return await this._setSession(currentSession);
          });
      }
      async _setSession(currentSession) {
          try {
              if (!currentSession.access_token || !currentSession.refresh_token) {
                  throw new AuthSessionMissingError();
              }
              const timeNow = Date.now() / 1000;
              let expiresAt = timeNow;
              let hasExpired = true;
              let session = null;
              const { payload } = decodeJWT(currentSession.access_token);
              if (payload.exp) {
                  expiresAt = payload.exp;
                  hasExpired = expiresAt <= timeNow;
              }
              if (hasExpired) {
                  const { data: refreshedSession, error } = await this._callRefreshToken(currentSession.refresh_token);
                  if (error) {
                      return this._returnResult({ data: { user: null, session: null }, error: error });
                  }
                  if (!refreshedSession) {
                      return { data: { user: null, session: null }, error: null };
                  }
                  session = refreshedSession;
              }
              else {
                  const { data, error } = await this._getUser(currentSession.access_token);
                  if (error) {
                      throw error;
                  }
                  session = {
                      access_token: currentSession.access_token,
                      refresh_token: currentSession.refresh_token,
                      user: data.user,
                      token_type: 'bearer',
                      expires_in: expiresAt - timeNow,
                      expires_at: expiresAt,
                  };
                  await this._saveSession(session);
                  await this._notifyAllSubscribers('SIGNED_IN', session);
              }
              return this._returnResult({ data: { user: session.user, session }, error: null });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { session: null, user: null }, error });
              }
              throw error;
          }
      }
      /**
       * Returns a new session, regardless of expiry status.
       * Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession().
       * If the current session's refresh token is invalid, an error will be thrown.
       * @param currentSession The current session. If passed in, it must contain a refresh token.
       */
      async refreshSession(currentSession) {
          await this.initializePromise;
          return await this._acquireLock(-1, async () => {
              return await this._refreshSession(currentSession);
          });
      }
      async _refreshSession(currentSession) {
          try {
              return await this._useSession(async (result) => {
                  var _a;
                  if (!currentSession) {
                      const { data, error } = result;
                      if (error) {
                          throw error;
                      }
                      currentSession = (_a = data.session) !== null && _a !== void 0 ? _a : undefined;
                  }
                  if (!(currentSession === null || currentSession === void 0 ? void 0 : currentSession.refresh_token)) {
                      throw new AuthSessionMissingError();
                  }
                  const { data: session, error } = await this._callRefreshToken(currentSession.refresh_token);
                  if (error) {
                      return this._returnResult({ data: { user: null, session: null }, error: error });
                  }
                  if (!session) {
                      return this._returnResult({ data: { user: null, session: null }, error: null });
                  }
                  return this._returnResult({ data: { user: session.user, session }, error: null });
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { user: null, session: null }, error });
              }
              throw error;
          }
      }
      /**
       * Gets the session data from a URL string
       */
      async _getSessionFromURL(params, callbackUrlType) {
          try {
              if (!isBrowser())
                  throw new AuthImplicitGrantRedirectError('No browser detected.');
              // If there's an error in the URL, it doesn't matter what flow it is, we just return the error.
              if (params.error || params.error_description || params.error_code) {
                  // The error class returned implies that the redirect is from an implicit grant flow
                  // but it could also be from a redirect error from a PKCE flow.
                  throw new AuthImplicitGrantRedirectError(params.error_description || 'Error in URL with unspecified error_description', {
                      error: params.error || 'unspecified_error',
                      code: params.error_code || 'unspecified_code',
                  });
              }
              // Checks for mismatches between the flowType initialised in the client and the URL parameters
              switch (callbackUrlType) {
                  case 'implicit':
                      if (this.flowType === 'pkce') {
                          throw new AuthPKCEGrantCodeExchangeError('Not a valid PKCE flow url.');
                      }
                      break;
                  case 'pkce':
                      if (this.flowType === 'implicit') {
                          throw new AuthImplicitGrantRedirectError('Not a valid implicit grant flow url.');
                      }
                      break;
                  default:
                  // there's no mismatch so we continue
              }
              // Since this is a redirect for PKCE, we attempt to retrieve the code from the URL for the code exchange
              if (callbackUrlType === 'pkce') {
                  this._debug('#_initialize()', 'begin', 'is PKCE flow', true);
                  if (!params.code)
                      throw new AuthPKCEGrantCodeExchangeError('No code detected.');
                  const { data, error } = await this._exchangeCodeForSession(params.code);
                  if (error)
                      throw error;
                  const url = new URL(window.location.href);
                  url.searchParams.delete('code');
                  window.history.replaceState(window.history.state, '', url.toString());
                  return { data: { session: data.session, redirectType: null }, error: null };
              }
              const { provider_token, provider_refresh_token, access_token, refresh_token, expires_in, expires_at, token_type, } = params;
              if (!access_token || !expires_in || !refresh_token || !token_type) {
                  throw new AuthImplicitGrantRedirectError('No session defined in URL');
              }
              const timeNow = Math.round(Date.now() / 1000);
              const expiresIn = parseInt(expires_in);
              let expiresAt = timeNow + expiresIn;
              if (expires_at) {
                  expiresAt = parseInt(expires_at);
              }
              const actuallyExpiresIn = expiresAt - timeNow;
              if (actuallyExpiresIn * 1000 <= AUTO_REFRESH_TICK_DURATION_MS) {
                  console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${actuallyExpiresIn}s, should have been closer to ${expiresIn}s`);
              }
              const issuedAt = expiresAt - expiresIn;
              if (timeNow - issuedAt >= 120) {
                  console.warn('@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale', issuedAt, expiresAt, timeNow);
              }
              else if (timeNow - issuedAt < 0) {
                  console.warn('@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew', issuedAt, expiresAt, timeNow);
              }
              const { data, error } = await this._getUser(access_token);
              if (error)
                  throw error;
              const session = {
                  provider_token,
                  provider_refresh_token,
                  access_token,
                  expires_in: expiresIn,
                  expires_at: expiresAt,
                  refresh_token,
                  token_type: token_type,
                  user: data.user,
              };
              // Remove tokens from URL
              window.location.hash = '';
              this._debug('#_getSessionFromURL()', 'clearing window.location.hash');
              return this._returnResult({ data: { session, redirectType: params.type }, error: null });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { session: null, redirectType: null }, error });
              }
              throw error;
          }
      }
      /**
       * Checks if the current URL contains parameters given by an implicit oauth grant flow (https://www.rfc-editor.org/rfc/rfc6749.html#section-4.2)
       */
      _isImplicitGrantCallback(params) {
          return Boolean(params.access_token || params.error_description);
      }
      /**
       * Checks if the current URL and backing storage contain parameters given by a PKCE flow
       */
      async _isPKCECallback(params) {
          const currentStorageContent = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
          return !!(params.code && currentStorageContent);
      }
      /**
       * Inside a browser context, `signOut()` will remove the logged in user from the browser session and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.
       *
       * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`.
       * There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.
       *
       * If using `others` scope, no `SIGNED_OUT` event is fired!
       */
      async signOut(options = { scope: 'global' }) {
          await this.initializePromise;
          return await this._acquireLock(-1, async () => {
              return await this._signOut(options);
          });
      }
      async _signOut({ scope } = { scope: 'global' }) {
          return await this._useSession(async (result) => {
              var _a;
              const { data, error: sessionError } = result;
              if (sessionError) {
                  return this._returnResult({ error: sessionError });
              }
              const accessToken = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token;
              if (accessToken) {
                  const { error } = await this.admin.signOut(accessToken, scope);
                  if (error) {
                      // ignore 404s since user might not exist anymore
                      // ignore 401s since an invalid or expired JWT should sign out the current session
                      if (!(isAuthApiError(error) &&
                          (error.status === 404 || error.status === 401 || error.status === 403))) {
                          return this._returnResult({ error });
                      }
                  }
              }
              if (scope !== 'others') {
                  await this._removeSession();
                  await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
              }
              return this._returnResult({ error: null });
          });
      }
      onAuthStateChange(callback) {
          const id = generateCallbackId();
          const subscription = {
              id,
              callback,
              unsubscribe: () => {
                  this._debug('#unsubscribe()', 'state change callback with id removed', id);
                  this.stateChangeEmitters.delete(id);
              },
          };
          this._debug('#onAuthStateChange()', 'registered callback with id', id);
          this.stateChangeEmitters.set(id, subscription);
          (async () => {
              await this.initializePromise;
              await this._acquireLock(-1, async () => {
                  this._emitInitialSession(id);
              });
          })();
          return { data: { subscription } };
      }
      async _emitInitialSession(id) {
          return await this._useSession(async (result) => {
              var _a, _b;
              try {
                  const { data: { session }, error, } = result;
                  if (error)
                      throw error;
                  await ((_a = this.stateChangeEmitters.get(id)) === null || _a === void 0 ? void 0 : _a.callback('INITIAL_SESSION', session));
                  this._debug('INITIAL_SESSION', 'callback id', id, 'session', session);
              }
              catch (err) {
                  await ((_b = this.stateChangeEmitters.get(id)) === null || _b === void 0 ? void 0 : _b.callback('INITIAL_SESSION', null));
                  this._debug('INITIAL_SESSION', 'callback id', id, 'error', err);
                  console.error(err);
              }
          });
      }
      /**
       * Sends a password reset request to an email address. This method supports the PKCE flow.
       *
       * @param email The email address of the user.
       * @param options.redirectTo The URL to send the user to after they click the password reset link.
       * @param options.captchaToken Verification token received when the user completes the captcha on the site.
       */
      async resetPasswordForEmail(email, options = {}) {
          let codeChallenge = null;
          let codeChallengeMethod = null;
          if (this.flowType === 'pkce') {
              [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey, true // isPasswordRecovery
              );
          }
          try {
              return await _request(this.fetch, 'POST', `${this.url}/recover`, {
                  body: {
                      email,
                      code_challenge: codeChallenge,
                      code_challenge_method: codeChallengeMethod,
                      gotrue_meta_security: { captcha_token: options.captchaToken },
                  },
                  headers: this.headers,
                  redirectTo: options.redirectTo,
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: null, error });
              }
              throw error;
          }
      }
      /**
       * Gets all the identities linked to a user.
       */
      async getUserIdentities() {
          var _a;
          try {
              const { data, error } = await this.getUser();
              if (error)
                  throw error;
              return this._returnResult({ data: { identities: (_a = data.user.identities) !== null && _a !== void 0 ? _a : [] }, error: null });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: null, error });
              }
              throw error;
          }
      }
      async linkIdentity(credentials) {
          if ('token' in credentials) {
              return this.linkIdentityIdToken(credentials);
          }
          return this.linkIdentityOAuth(credentials);
      }
      async linkIdentityOAuth(credentials) {
          var _a;
          try {
              const { data, error } = await this._useSession(async (result) => {
                  var _a, _b, _c, _d, _e;
                  const { data, error } = result;
                  if (error)
                      throw error;
                  const url = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, credentials.provider, {
                      redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
                      scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
                      queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
                      skipBrowserRedirect: true,
                  });
                  return await _request(this.fetch, 'GET', url, {
                      headers: this.headers,
                      jwt: (_e = (_d = data.session) === null || _d === void 0 ? void 0 : _d.access_token) !== null && _e !== void 0 ? _e : undefined,
                  });
              });
              if (error)
                  throw error;
              if (isBrowser() && !((_a = credentials.options) === null || _a === void 0 ? void 0 : _a.skipBrowserRedirect)) {
                  window.location.assign(data === null || data === void 0 ? void 0 : data.url);
              }
              return this._returnResult({
                  data: { provider: credentials.provider, url: data === null || data === void 0 ? void 0 : data.url },
                  error: null,
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: { provider: credentials.provider, url: null }, error });
              }
              throw error;
          }
      }
      async linkIdentityIdToken(credentials) {
          return await this._useSession(async (result) => {
              var _a;
              try {
                  const { error: sessionError, data: { session }, } = result;
                  if (sessionError)
                      throw sessionError;
                  const { options, provider, token, access_token, nonce } = credentials;
                  const res = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=id_token`, {
                      headers: this.headers,
                      jwt: (_a = session === null || session === void 0 ? void 0 : session.access_token) !== null && _a !== void 0 ? _a : undefined,
                      body: {
                          provider,
                          id_token: token,
                          access_token,
                          nonce,
                          link_identity: true,
                          gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                      },
                      xform: _sessionResponse,
                  });
                  const { data, error } = res;
                  if (error) {
                      return this._returnResult({ data: { user: null, session: null }, error });
                  }
                  else if (!data || !data.session || !data.user) {
                      return this._returnResult({
                          data: { user: null, session: null },
                          error: new AuthInvalidTokenResponseError(),
                      });
                  }
                  if (data.session) {
                      await this._saveSession(data.session);
                      await this._notifyAllSubscribers('USER_UPDATED', data.session);
                  }
                  return this._returnResult({ data, error });
              }
              catch (error) {
                  if (isAuthError(error)) {
                      return this._returnResult({ data: { user: null, session: null }, error });
                  }
                  throw error;
              }
          });
      }
      /**
       * Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.
       */
      async unlinkIdentity(identity) {
          try {
              return await this._useSession(async (result) => {
                  var _a, _b;
                  const { data, error } = result;
                  if (error) {
                      throw error;
                  }
                  return await _request(this.fetch, 'DELETE', `${this.url}/user/identities/${identity.identity_id}`, {
                      headers: this.headers,
                      jwt: (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : undefined,
                  });
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: null, error });
              }
              throw error;
          }
      }
      /**
       * Generates a new JWT.
       * @param refreshToken A valid refresh token that was returned on login.
       */
      async _refreshAccessToken(refreshToken) {
          const debugName = `#_refreshAccessToken(${refreshToken.substring(0, 5)}...)`;
          this._debug(debugName, 'begin');
          try {
              const startedAt = Date.now();
              // will attempt to refresh the token with exponential backoff
              return await retryable(async (attempt) => {
                  if (attempt > 0) {
                      await sleep(200 * Math.pow(2, attempt - 1)); // 200, 400, 800, ...
                  }
                  this._debug(debugName, 'refreshing attempt', attempt);
                  return await _request(this.fetch, 'POST', `${this.url}/token?grant_type=refresh_token`, {
                      body: { refresh_token: refreshToken },
                      headers: this.headers,
                      xform: _sessionResponse,
                  });
              }, (attempt, error) => {
                  const nextBackOffInterval = 200 * Math.pow(2, attempt);
                  return (error &&
                      isAuthRetryableFetchError(error) &&
                      // retryable only if the request can be sent before the backoff overflows the tick duration
                      Date.now() + nextBackOffInterval - startedAt < AUTO_REFRESH_TICK_DURATION_MS);
              });
          }
          catch (error) {
              this._debug(debugName, 'error', error);
              if (isAuthError(error)) {
                  return this._returnResult({ data: { session: null, user: null }, error });
              }
              throw error;
          }
          finally {
              this._debug(debugName, 'end');
          }
      }
      _isValidSession(maybeSession) {
          const isValidSession = typeof maybeSession === 'object' &&
              maybeSession !== null &&
              'access_token' in maybeSession &&
              'refresh_token' in maybeSession &&
              'expires_at' in maybeSession;
          return isValidSession;
      }
      async _handleProviderSignIn(provider, options) {
          const url = await this._getUrlForProvider(`${this.url}/authorize`, provider, {
              redirectTo: options.redirectTo,
              scopes: options.scopes,
              queryParams: options.queryParams,
          });
          this._debug('#_handleProviderSignIn()', 'provider', provider, 'options', options, 'url', url);
          // try to open on the browser
          if (isBrowser() && !options.skipBrowserRedirect) {
              window.location.assign(url);
          }
          return { data: { provider, url }, error: null };
      }
      /**
       * Recovers the session from LocalStorage and refreshes the token
       * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
       */
      async _recoverAndRefresh() {
          var _a, _b;
          const debugName = '#_recoverAndRefresh()';
          this._debug(debugName, 'begin');
          try {
              const currentSession = (await getItemAsync(this.storage, this.storageKey));
              if (currentSession && this.userStorage) {
                  let maybeUser = (await getItemAsync(this.userStorage, this.storageKey + '-user'));
                  if (!this.storage.isServer && Object.is(this.storage, this.userStorage) && !maybeUser) {
                      // storage and userStorage are the same storage medium, for example
                      // window.localStorage if userStorage does not have the user from
                      // storage stored, store it first thereby migrating the user object
                      // from storage -> userStorage
                      maybeUser = { user: currentSession.user };
                      await setItemAsync(this.userStorage, this.storageKey + '-user', maybeUser);
                  }
                  currentSession.user = (_a = maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) !== null && _a !== void 0 ? _a : userNotAvailableProxy();
              }
              else if (currentSession && !currentSession.user) {
                  // user storage is not set, let's check if it was previously enabled so
                  // we bring back the storage as it should be
                  if (!currentSession.user) {
                      // test if userStorage was previously enabled and the storage medium was the same, to move the user back under the same key
                      const separateUser = (await getItemAsync(this.storage, this.storageKey + '-user'));
                      if (separateUser && (separateUser === null || separateUser === void 0 ? void 0 : separateUser.user)) {
                          currentSession.user = separateUser.user;
                          await removeItemAsync(this.storage, this.storageKey + '-user');
                          await setItemAsync(this.storage, this.storageKey, currentSession);
                      }
                      else {
                          currentSession.user = userNotAvailableProxy();
                      }
                  }
              }
              this._debug(debugName, 'session from storage', currentSession);
              if (!this._isValidSession(currentSession)) {
                  this._debug(debugName, 'session is not valid');
                  if (currentSession !== null) {
                      await this._removeSession();
                  }
                  return;
              }
              const expiresWithMargin = ((_b = currentSession.expires_at) !== null && _b !== void 0 ? _b : Infinity) * 1000 - Date.now() < EXPIRY_MARGIN_MS;
              this._debug(debugName, `session has${expiresWithMargin ? '' : ' not'} expired with margin of ${EXPIRY_MARGIN_MS}s`);
              if (expiresWithMargin) {
                  if (this.autoRefreshToken && currentSession.refresh_token) {
                      const { error } = await this._callRefreshToken(currentSession.refresh_token);
                      if (error) {
                          console.error(error);
                          if (!isAuthRetryableFetchError(error)) {
                              this._debug(debugName, 'refresh failed with a non-retryable error, removing the session', error);
                              await this._removeSession();
                          }
                      }
                  }
              }
              else if (currentSession.user &&
                  currentSession.user.__isUserNotAvailableProxy === true) {
                  // If we have a proxy user, try to get the real user data
                  try {
                      const { data, error: userError } = await this._getUser(currentSession.access_token);
                      if (!userError && (data === null || data === void 0 ? void 0 : data.user)) {
                          currentSession.user = data.user;
                          await this._saveSession(currentSession);
                          await this._notifyAllSubscribers('SIGNED_IN', currentSession);
                      }
                      else {
                          this._debug(debugName, 'could not get user data, skipping SIGNED_IN notification');
                      }
                  }
                  catch (getUserError) {
                      console.error('Error getting user data:', getUserError);
                      this._debug(debugName, 'error getting user data, skipping SIGNED_IN notification', getUserError);
                  }
              }
              else {
                  // no need to persist currentSession again, as we just loaded it from
                  // local storage; persisting it again may overwrite a value saved by
                  // another client with access to the same local storage
                  await this._notifyAllSubscribers('SIGNED_IN', currentSession);
              }
          }
          catch (err) {
              this._debug(debugName, 'error', err);
              console.error(err);
              return;
          }
          finally {
              this._debug(debugName, 'end');
          }
      }
      async _callRefreshToken(refreshToken) {
          var _a, _b;
          if (!refreshToken) {
              throw new AuthSessionMissingError();
          }
          // refreshing is already in progress
          if (this.refreshingDeferred) {
              return this.refreshingDeferred.promise;
          }
          const debugName = `#_callRefreshToken(${refreshToken.substring(0, 5)}...)`;
          this._debug(debugName, 'begin');
          try {
              this.refreshingDeferred = new Deferred();
              const { data, error } = await this._refreshAccessToken(refreshToken);
              if (error)
                  throw error;
              if (!data.session)
                  throw new AuthSessionMissingError();
              await this._saveSession(data.session);
              await this._notifyAllSubscribers('TOKEN_REFRESHED', data.session);
              const result = { data: data.session, error: null };
              this.refreshingDeferred.resolve(result);
              return result;
          }
          catch (error) {
              this._debug(debugName, 'error', error);
              if (isAuthError(error)) {
                  const result = { data: null, error };
                  if (!isAuthRetryableFetchError(error)) {
                      await this._removeSession();
                  }
                  (_a = this.refreshingDeferred) === null || _a === void 0 ? void 0 : _a.resolve(result);
                  return result;
              }
              (_b = this.refreshingDeferred) === null || _b === void 0 ? void 0 : _b.reject(error);
              throw error;
          }
          finally {
              this.refreshingDeferred = null;
              this._debug(debugName, 'end');
          }
      }
      async _notifyAllSubscribers(event, session, broadcast = true) {
          const debugName = `#_notifyAllSubscribers(${event})`;
          this._debug(debugName, 'begin', session, `broadcast = ${broadcast}`);
          try {
              if (this.broadcastChannel && broadcast) {
                  this.broadcastChannel.postMessage({ event, session });
              }
              const errors = [];
              const promises = Array.from(this.stateChangeEmitters.values()).map(async (x) => {
                  try {
                      await x.callback(event, session);
                  }
                  catch (e) {
                      errors.push(e);
                  }
              });
              await Promise.all(promises);
              if (errors.length > 0) {
                  for (let i = 0; i < errors.length; i += 1) {
                      console.error(errors[i]);
                  }
                  throw errors[0];
              }
          }
          finally {
              this._debug(debugName, 'end');
          }
      }
      /**
       * set currentSession and currentUser
       * process to _startAutoRefreshToken if possible
       */
      async _saveSession(session) {
          this._debug('#_saveSession()', session);
          // _saveSession is always called whenever a new session has been acquired
          // so we can safely suppress the warning returned by future getSession calls
          this.suppressGetSessionWarning = true;
          // Create a shallow copy to work with, to avoid mutating the original session object if it's used elsewhere
          const sessionToProcess = Object.assign({}, session);
          const userIsProxy = sessionToProcess.user && sessionToProcess.user.__isUserNotAvailableProxy === true;
          if (this.userStorage) {
              if (!userIsProxy && sessionToProcess.user) {
                  // If it's a real user object, save it to userStorage.
                  await setItemAsync(this.userStorage, this.storageKey + '-user', {
                      user: sessionToProcess.user,
                  });
              }
              // Prepare the main session data for primary storage: remove the user property before cloning
              // This is important because the original session.user might be the proxy
              const mainSessionData = Object.assign({}, sessionToProcess);
              delete mainSessionData.user; // Remove user (real or proxy) before cloning for main storage
              const clonedMainSessionData = deepClone(mainSessionData);
              await setItemAsync(this.storage, this.storageKey, clonedMainSessionData);
          }
          else {
              // No userStorage is configured.
              // In this case, session.user should ideally not be a proxy.
              // If it were, structuredClone would fail. This implies an issue elsewhere if user is a proxy here
              const clonedSession = deepClone(sessionToProcess); // sessionToProcess still has its original user property
              await setItemAsync(this.storage, this.storageKey, clonedSession);
          }
      }
      async _removeSession() {
          this._debug('#_removeSession()');
          await removeItemAsync(this.storage, this.storageKey);
          await removeItemAsync(this.storage, this.storageKey + '-code-verifier');
          await removeItemAsync(this.storage, this.storageKey + '-user');
          if (this.userStorage) {
              await removeItemAsync(this.userStorage, this.storageKey + '-user');
          }
          await this._notifyAllSubscribers('SIGNED_OUT', null);
      }
      /**
       * Removes any registered visibilitychange callback.
       *
       * {@see #startAutoRefresh}
       * {@see #stopAutoRefresh}
       */
      _removeVisibilityChangedCallback() {
          this._debug('#_removeVisibilityChangedCallback()');
          const callback = this.visibilityChangedCallback;
          this.visibilityChangedCallback = null;
          try {
              if (callback && isBrowser() && (window === null || window === void 0 ? void 0 : window.removeEventListener)) {
                  window.removeEventListener('visibilitychange', callback);
              }
          }
          catch (e) {
              console.error('removing visibilitychange callback failed', e);
          }
      }
      /**
       * This is the private implementation of {@link #startAutoRefresh}. Use this
       * within the library.
       */
      async _startAutoRefresh() {
          await this._stopAutoRefresh();
          this._debug('#_startAutoRefresh()');
          const ticker = setInterval(() => this._autoRefreshTokenTick(), AUTO_REFRESH_TICK_DURATION_MS);
          this.autoRefreshTicker = ticker;
          if (ticker && typeof ticker === 'object' && typeof ticker.unref === 'function') {
              // ticker is a NodeJS Timeout object that has an `unref` method
              // https://nodejs.org/api/timers.html#timeoutunref
              // When auto refresh is used in NodeJS (like for testing) the
              // `setInterval` is preventing the process from being marked as
              // finished and tests run endlessly. This can be prevented by calling
              // `unref()` on the returned object.
              ticker.unref();
              // @ts-expect-error TS has no context of Deno
          }
          else if (typeof Deno !== 'undefined' && typeof Deno.unrefTimer === 'function') {
              // similar like for NodeJS, but with the Deno API
              // https://deno.land/api@latest?unstable&s=Deno.unrefTimer
              // @ts-expect-error TS has no context of Deno
              Deno.unrefTimer(ticker);
          }
          // run the tick immediately, but in the next pass of the event loop so that
          // #_initialize can be allowed to complete without recursively waiting on
          // itself
          setTimeout(async () => {
              await this.initializePromise;
              await this._autoRefreshTokenTick();
          }, 0);
      }
      /**
       * This is the private implementation of {@link #stopAutoRefresh}. Use this
       * within the library.
       */
      async _stopAutoRefresh() {
          this._debug('#_stopAutoRefresh()');
          const ticker = this.autoRefreshTicker;
          this.autoRefreshTicker = null;
          if (ticker) {
              clearInterval(ticker);
          }
      }
      /**
       * Starts an auto-refresh process in the background. The session is checked
       * every few seconds. Close to the time of expiration a process is started to
       * refresh the session. If refreshing fails it will be retried for as long as
       * necessary.
       *
       * If you set the {@link GoTrueClientOptions#autoRefreshToken} you don't need
       * to call this function, it will be called for you.
       *
       * On browsers the refresh process works only when the tab/window is in the
       * foreground to conserve resources as well as prevent race conditions and
       * flooding auth with requests. If you call this method any managed
       * visibility change callback will be removed and you must manage visibility
       * changes on your own.
       *
       * On non-browser platforms the refresh process works *continuously* in the
       * background, which may not be desirable. You should hook into your
       * platform's foreground indication mechanism and call these methods
       * appropriately to conserve resources.
       *
       * {@see #stopAutoRefresh}
       */
      async startAutoRefresh() {
          this._removeVisibilityChangedCallback();
          await this._startAutoRefresh();
      }
      /**
       * Stops an active auto refresh process running in the background (if any).
       *
       * If you call this method any managed visibility change callback will be
       * removed and you must manage visibility changes on your own.
       *
       * See {@link #startAutoRefresh} for more details.
       */
      async stopAutoRefresh() {
          this._removeVisibilityChangedCallback();
          await this._stopAutoRefresh();
      }
      /**
       * Runs the auto refresh token tick.
       */
      async _autoRefreshTokenTick() {
          this._debug('#_autoRefreshTokenTick()', 'begin');
          try {
              await this._acquireLock(0, async () => {
                  try {
                      const now = Date.now();
                      try {
                          return await this._useSession(async (result) => {
                              const { data: { session }, } = result;
                              if (!session || !session.refresh_token || !session.expires_at) {
                                  this._debug('#_autoRefreshTokenTick()', 'no session');
                                  return;
                              }
                              // session will expire in this many ticks (or has already expired if <= 0)
                              const expiresInTicks = Math.floor((session.expires_at * 1000 - now) / AUTO_REFRESH_TICK_DURATION_MS);
                              this._debug('#_autoRefreshTokenTick()', `access token expires in ${expiresInTicks} ticks, a tick lasts ${AUTO_REFRESH_TICK_DURATION_MS}ms, refresh threshold is ${AUTO_REFRESH_TICK_THRESHOLD} ticks`);
                              if (expiresInTicks <= AUTO_REFRESH_TICK_THRESHOLD) {
                                  await this._callRefreshToken(session.refresh_token);
                              }
                          });
                      }
                      catch (e) {
                          console.error('Auto refresh tick failed with error. This is likely a transient error.', e);
                      }
                  }
                  finally {
                      this._debug('#_autoRefreshTokenTick()', 'end');
                  }
              });
          }
          catch (e) {
              if (e.isAcquireTimeout || e instanceof LockAcquireTimeoutError) {
                  this._debug('auto refresh token tick lock not available');
              }
              else {
                  throw e;
              }
          }
      }
      /**
       * Registers callbacks on the browser / platform, which in-turn run
       * algorithms when the browser window/tab are in foreground. On non-browser
       * platforms it assumes always foreground.
       */
      async _handleVisibilityChange() {
          this._debug('#_handleVisibilityChange()');
          if (!isBrowser() || !(window === null || window === void 0 ? void 0 : window.addEventListener)) {
              if (this.autoRefreshToken) {
                  // in non-browser environments the refresh token ticker runs always
                  this.startAutoRefresh();
              }
              return false;
          }
          try {
              this.visibilityChangedCallback = async () => await this._onVisibilityChanged(false);
              window === null || window === void 0 ? void 0 : window.addEventListener('visibilitychange', this.visibilityChangedCallback);
              // now immediately call the visbility changed callback to setup with the
              // current visbility state
              await this._onVisibilityChanged(true); // initial call
          }
          catch (error) {
              console.error('_handleVisibilityChange', error);
          }
      }
      /**
       * Callback registered with `window.addEventListener('visibilitychange')`.
       */
      async _onVisibilityChanged(calledFromInitialize) {
          const methodName = `#_onVisibilityChanged(${calledFromInitialize})`;
          this._debug(methodName, 'visibilityState', document.visibilityState);
          if (document.visibilityState === 'visible') {
              if (this.autoRefreshToken) {
                  // in browser environments the refresh token ticker runs only on focused tabs
                  // which prevents race conditions
                  this._startAutoRefresh();
              }
              if (!calledFromInitialize) {
                  // called when the visibility has changed, i.e. the browser
                  // transitioned from hidden -> visible so we need to see if the session
                  // should be recovered immediately... but to do that we need to acquire
                  // the lock first asynchronously
                  await this.initializePromise;
                  await this._acquireLock(-1, async () => {
                      if (document.visibilityState !== 'visible') {
                          this._debug(methodName, 'acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting');
                          // visibility has changed while waiting for the lock, abort
                          return;
                      }
                      // recover the session
                      await this._recoverAndRefresh();
                  });
              }
          }
          else if (document.visibilityState === 'hidden') {
              if (this.autoRefreshToken) {
                  this._stopAutoRefresh();
              }
          }
      }
      /**
       * Generates the relevant login URL for a third-party provider.
       * @param options.redirectTo A URL or mobile address to send the user to after they are confirmed.
       * @param options.scopes A space-separated list of scopes granted to the OAuth application.
       * @param options.queryParams An object of key-value pairs containing query parameters granted to the OAuth application.
       */
      async _getUrlForProvider(url, provider, options) {
          const urlParams = [`provider=${encodeURIComponent(provider)}`];
          if (options === null || options === void 0 ? void 0 : options.redirectTo) {
              urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
          }
          if (options === null || options === void 0 ? void 0 : options.scopes) {
              urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
          }
          if (this.flowType === 'pkce') {
              const [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
              const flowParams = new URLSearchParams({
                  code_challenge: `${encodeURIComponent(codeChallenge)}`,
                  code_challenge_method: `${encodeURIComponent(codeChallengeMethod)}`,
              });
              urlParams.push(flowParams.toString());
          }
          if (options === null || options === void 0 ? void 0 : options.queryParams) {
              const query = new URLSearchParams(options.queryParams);
              urlParams.push(query.toString());
          }
          if (options === null || options === void 0 ? void 0 : options.skipBrowserRedirect) {
              urlParams.push(`skip_http_redirect=${options.skipBrowserRedirect}`);
          }
          return `${url}?${urlParams.join('&')}`;
      }
      async _unenroll(params) {
          try {
              return await this._useSession(async (result) => {
                  var _a;
                  const { data: sessionData, error: sessionError } = result;
                  if (sessionError) {
                      return this._returnResult({ data: null, error: sessionError });
                  }
                  return await _request(this.fetch, 'DELETE', `${this.url}/factors/${params.factorId}`, {
                      headers: this.headers,
                      jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                  });
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: null, error });
              }
              throw error;
          }
      }
      async _enroll(params) {
          try {
              return await this._useSession(async (result) => {
                  var _a, _b;
                  const { data: sessionData, error: sessionError } = result;
                  if (sessionError) {
                      return this._returnResult({ data: null, error: sessionError });
                  }
                  const body = Object.assign({ friendly_name: params.friendlyName, factor_type: params.factorType }, (params.factorType === 'phone'
                      ? { phone: params.phone }
                      : params.factorType === 'totp'
                          ? { issuer: params.issuer }
                          : {}));
                  const { data, error } = (await _request(this.fetch, 'POST', `${this.url}/factors`, {
                      body,
                      headers: this.headers,
                      jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                  }));
                  if (error) {
                      return this._returnResult({ data: null, error });
                  }
                  if (params.factorType === 'totp' && data.type === 'totp' && ((_b = data === null || data === void 0 ? void 0 : data.totp) === null || _b === void 0 ? void 0 : _b.qr_code)) {
                      data.totp.qr_code = `data:image/svg+xml;utf-8,${data.totp.qr_code}`;
                  }
                  return this._returnResult({ data, error: null });
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: null, error });
              }
              throw error;
          }
      }
      async _verify(params) {
          return this._acquireLock(-1, async () => {
              try {
                  return await this._useSession(async (result) => {
                      var _a;
                      const { data: sessionData, error: sessionError } = result;
                      if (sessionError) {
                          return this._returnResult({ data: null, error: sessionError });
                      }
                      const body = Object.assign({ challenge_id: params.challengeId }, ('webauthn' in params
                          ? {
                              webauthn: Object.assign(Object.assign({}, params.webauthn), { credential_response: params.webauthn.type === 'create'
                                      ? serializeCredentialCreationResponse(params.webauthn.credential_response)
                                      : serializeCredentialRequestResponse(params.webauthn.credential_response) }),
                          }
                          : { code: params.code }));
                      const { data, error } = await _request(this.fetch, 'POST', `${this.url}/factors/${params.factorId}/verify`, {
                          body,
                          headers: this.headers,
                          jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                      });
                      if (error) {
                          return this._returnResult({ data: null, error });
                      }
                      await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1000) + data.expires_in }, data));
                      await this._notifyAllSubscribers('MFA_CHALLENGE_VERIFIED', data);
                      return this._returnResult({ data, error });
                  });
              }
              catch (error) {
                  if (isAuthError(error)) {
                      return this._returnResult({ data: null, error });
                  }
                  throw error;
              }
          });
      }
      async _challenge(params) {
          return this._acquireLock(-1, async () => {
              try {
                  return await this._useSession(async (result) => {
                      var _a;
                      const { data: sessionData, error: sessionError } = result;
                      if (sessionError) {
                          return this._returnResult({ data: null, error: sessionError });
                      }
                      const response = (await _request(this.fetch, 'POST', `${this.url}/factors/${params.factorId}/challenge`, {
                          body: params,
                          headers: this.headers,
                          jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                      }));
                      if (response.error) {
                          return response;
                      }
                      const { data } = response;
                      if (data.type !== 'webauthn') {
                          return { data, error: null };
                      }
                      switch (data.webauthn.type) {
                          case 'create':
                              return {
                                  data: Object.assign(Object.assign({}, data), { webauthn: Object.assign(Object.assign({}, data.webauthn), { credential_options: Object.assign(Object.assign({}, data.webauthn.credential_options), { publicKey: deserializeCredentialCreationOptions(data.webauthn.credential_options.publicKey) }) }) }),
                                  error: null,
                              };
                          case 'request':
                              return {
                                  data: Object.assign(Object.assign({}, data), { webauthn: Object.assign(Object.assign({}, data.webauthn), { credential_options: Object.assign(Object.assign({}, data.webauthn.credential_options), { publicKey: deserializeCredentialRequestOptions(data.webauthn.credential_options.publicKey) }) }) }),
                                  error: null,
                              };
                      }
                  });
              }
              catch (error) {
                  if (isAuthError(error)) {
                      return this._returnResult({ data: null, error });
                  }
                  throw error;
              }
          });
      }
      /**
       * {@see GoTrueMFAApi#challengeAndVerify}
       */
      async _challengeAndVerify(params) {
          // both _challenge and _verify independently acquire the lock, so no need
          // to acquire it here
          const { data: challengeData, error: challengeError } = await this._challenge({
              factorId: params.factorId,
          });
          if (challengeError) {
              return this._returnResult({ data: null, error: challengeError });
          }
          return await this._verify({
              factorId: params.factorId,
              challengeId: challengeData.id,
              code: params.code,
          });
      }
      /**
       * {@see GoTrueMFAApi#listFactors}
       */
      async _listFactors() {
          var _a;
          // use #getUser instead of #_getUser as the former acquires a lock
          const { data: { user }, error: userError, } = await this.getUser();
          if (userError) {
              return { data: null, error: userError };
          }
          const data = {
              all: [],
              phone: [],
              totp: [],
              webauthn: [],
          };
          // loop over the factors ONCE
          for (const factor of (_a = user === null || user === void 0 ? void 0 : user.factors) !== null && _a !== void 0 ? _a : []) {
              data.all.push(factor);
              if (factor.status === 'verified') {
                  data[factor.factor_type].push(factor);
              }
          }
          return {
              data,
              error: null,
          };
      }
      /**
       * {@see GoTrueMFAApi#getAuthenticatorAssuranceLevel}
       */
      async _getAuthenticatorAssuranceLevel() {
          var _a, _b;
          const { data: { session }, error: sessionError, } = await this.getSession();
          if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
          }
          if (!session) {
              return {
                  data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
                  error: null,
              };
          }
          const { payload } = decodeJWT(session.access_token);
          let currentLevel = null;
          if (payload.aal) {
              currentLevel = payload.aal;
          }
          let nextLevel = currentLevel;
          const verifiedFactors = (_b = (_a = session.user.factors) === null || _a === void 0 ? void 0 : _a.filter((factor) => factor.status === 'verified')) !== null && _b !== void 0 ? _b : [];
          if (verifiedFactors.length > 0) {
              nextLevel = 'aal2';
          }
          const currentAuthenticationMethods = payload.amr || [];
          return { data: { currentLevel, nextLevel, currentAuthenticationMethods }, error: null };
      }
      /**
       * Retrieves details about an OAuth authorization request.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * Returns authorization details including client info, scopes, and user information.
       * If the API returns a redirect_uri, it means consent was already given - the caller
       * should handle the redirect manually if needed.
       */
      async _getAuthorizationDetails(authorizationId) {
          try {
              return await this._useSession(async (result) => {
                  const { data: { session }, error: sessionError, } = result;
                  if (sessionError) {
                      return this._returnResult({ data: null, error: sessionError });
                  }
                  if (!session) {
                      return this._returnResult({ data: null, error: new AuthSessionMissingError() });
                  }
                  return await _request(this.fetch, 'GET', `${this.url}/oauth/authorizations/${authorizationId}`, {
                      headers: this.headers,
                      jwt: session.access_token,
                      xform: (data) => ({ data, error: null }),
                  });
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: null, error });
              }
              throw error;
          }
      }
      /**
       * Approves an OAuth authorization request.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _approveAuthorization(authorizationId, options) {
          try {
              return await this._useSession(async (result) => {
                  const { data: { session }, error: sessionError, } = result;
                  if (sessionError) {
                      return this._returnResult({ data: null, error: sessionError });
                  }
                  if (!session) {
                      return this._returnResult({ data: null, error: new AuthSessionMissingError() });
                  }
                  const response = await _request(this.fetch, 'POST', `${this.url}/oauth/authorizations/${authorizationId}/consent`, {
                      headers: this.headers,
                      jwt: session.access_token,
                      body: { action: 'approve' },
                      xform: (data) => ({ data, error: null }),
                  });
                  if (response.data && response.data.redirect_url) {
                      // Automatically redirect in browser unless skipBrowserRedirect is true
                      if (isBrowser() && !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)) {
                          window.location.assign(response.data.redirect_url);
                      }
                  }
                  return response;
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: null, error });
              }
              throw error;
          }
      }
      /**
       * Denies an OAuth authorization request.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _denyAuthorization(authorizationId, options) {
          try {
              return await this._useSession(async (result) => {
                  const { data: { session }, error: sessionError, } = result;
                  if (sessionError) {
                      return this._returnResult({ data: null, error: sessionError });
                  }
                  if (!session) {
                      return this._returnResult({ data: null, error: new AuthSessionMissingError() });
                  }
                  const response = await _request(this.fetch, 'POST', `${this.url}/oauth/authorizations/${authorizationId}/consent`, {
                      headers: this.headers,
                      jwt: session.access_token,
                      body: { action: 'deny' },
                      xform: (data) => ({ data, error: null }),
                  });
                  if (response.data && response.data.redirect_url) {
                      // Automatically redirect in browser unless skipBrowserRedirect is true
                      if (isBrowser() && !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)) {
                          window.location.assign(response.data.redirect_url);
                      }
                  }
                  return response;
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: null, error });
              }
              throw error;
          }
      }
      /**
       * Lists all OAuth grants that the authenticated user has authorized.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _listOAuthGrants() {
          try {
              return await this._useSession(async (result) => {
                  const { data: { session }, error: sessionError, } = result;
                  if (sessionError) {
                      return this._returnResult({ data: null, error: sessionError });
                  }
                  if (!session) {
                      return this._returnResult({ data: null, error: new AuthSessionMissingError() });
                  }
                  return await _request(this.fetch, 'GET', `${this.url}/user/oauth/grants`, {
                      headers: this.headers,
                      jwt: session.access_token,
                      xform: (data) => ({ data, error: null }),
                  });
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: null, error });
              }
              throw error;
          }
      }
      /**
       * Revokes a user's OAuth grant for a specific client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _revokeOAuthGrant(options) {
          try {
              return await this._useSession(async (result) => {
                  const { data: { session }, error: sessionError, } = result;
                  if (sessionError) {
                      return this._returnResult({ data: null, error: sessionError });
                  }
                  if (!session) {
                      return this._returnResult({ data: null, error: new AuthSessionMissingError() });
                  }
                  await _request(this.fetch, 'DELETE', `${this.url}/user/oauth/grants`, {
                      headers: this.headers,
                      jwt: session.access_token,
                      query: { client_id: options.clientId },
                      noResolveJson: true,
                  });
                  return { data: {}, error: null };
              });
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: null, error });
              }
              throw error;
          }
      }
      async fetchJwk(kid, jwks = { keys: [] }) {
          // try fetching from the supplied jwks
          let jwk = jwks.keys.find((key) => key.kid === kid);
          if (jwk) {
              return jwk;
          }
          const now = Date.now();
          // try fetching from cache
          jwk = this.jwks.keys.find((key) => key.kid === kid);
          // jwk exists and jwks isn't stale
          if (jwk && this.jwks_cached_at + JWKS_TTL > now) {
              return jwk;
          }
          // jwk isn't cached in memory so we need to fetch it from the well-known endpoint
          const { data, error } = await _request(this.fetch, 'GET', `${this.url}/.well-known/jwks.json`, {
              headers: this.headers,
          });
          if (error) {
              throw error;
          }
          if (!data.keys || data.keys.length === 0) {
              return null;
          }
          this.jwks = data;
          this.jwks_cached_at = now;
          // Find the signing key
          jwk = data.keys.find((key) => key.kid === kid);
          if (!jwk) {
              return null;
          }
          return jwk;
      }
      /**
       * Extracts the JWT claims present in the access token by first verifying the
       * JWT against the server's JSON Web Key Set endpoint
       * `/.well-known/jwks.json` which is often cached, resulting in significantly
       * faster responses. Prefer this method over {@link #getUser} which always
       * sends a request to the Auth server for each JWT.
       *
       * If the project is not using an asymmetric JWT signing key (like ECC or
       * RSA) it always sends a request to the Auth server (similar to {@link
       * #getUser}) to verify the JWT.
       *
       * @param jwt An optional specific JWT you wish to verify, not the one you
       *            can obtain from {@link #getSession}.
       * @param options Various additional options that allow you to customize the
       *                behavior of this method.
       */
      async getClaims(jwt, options = {}) {
          try {
              let token = jwt;
              if (!token) {
                  const { data, error } = await this.getSession();
                  if (error || !data.session) {
                      return this._returnResult({ data: null, error });
                  }
                  token = data.session.access_token;
              }
              const { header, payload, signature, raw: { header: rawHeader, payload: rawPayload }, } = decodeJWT(token);
              if (!(options === null || options === void 0 ? void 0 : options.allowExpired)) {
                  // Reject expired JWTs should only happen if jwt argument was passed
                  validateExp(payload.exp);
              }
              const signingKey = !header.alg ||
                  header.alg.startsWith('HS') ||
                  !header.kid ||
                  !('crypto' in globalThis && 'subtle' in globalThis.crypto)
                  ? null
                  : await this.fetchJwk(header.kid, (options === null || options === void 0 ? void 0 : options.keys) ? { keys: options.keys } : options === null || options === void 0 ? void 0 : options.jwks);
              // If symmetric algorithm or WebCrypto API is unavailable, fallback to getUser()
              if (!signingKey) {
                  const { error } = await this.getUser(token);
                  if (error) {
                      throw error;
                  }
                  // getUser succeeds so the claims in the JWT can be trusted
                  return {
                      data: {
                          claims: payload,
                          header,
                          signature,
                      },
                      error: null,
                  };
              }
              const algorithm = getAlgorithm(header.alg);
              // Convert JWK to CryptoKey
              const publicKey = await crypto.subtle.importKey('jwk', signingKey, algorithm, true, [
                  'verify',
              ]);
              // Verify the signature
              const isValid = await crypto.subtle.verify(algorithm, publicKey, signature, stringToUint8Array(`${rawHeader}.${rawPayload}`));
              if (!isValid) {
                  throw new AuthInvalidJwtError('Invalid JWT signature');
              }
              // If verification succeeds, decode and return claims
              return {
                  data: {
                      claims: payload,
                      header,
                      signature,
                  },
                  error: null,
              };
          }
          catch (error) {
              if (isAuthError(error)) {
                  return this._returnResult({ data: null, error });
              }
              throw error;
          }
      }
  }
  GoTrueClient.nextInstanceID = {};

  const AuthAdminApi = GoTrueAdminApi;

  const AuthClient = GoTrueClient;

  class SupabaseAuthClient extends AuthClient {
      constructor(options) {
          super(options);
      }
  }

  /**
   * Supabase Client.
   *
   * An isomorphic Javascript client for interacting with Postgres.
   */
  class SupabaseClient {
      /**
       * Create a new client for use in the browser.
       * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
       * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
       * @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
       * @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
       * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
       * @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
       * @param options.realtime Options passed along to realtime-js constructor.
       * @param options.storage Options passed along to the storage-js constructor.
       * @param options.global.fetch A custom fetch implementation.
       * @param options.global.headers Any additional headers to send with each network request.
       * @example
       * ```ts
       * import { createClient } from '@supabase/supabase-js'
       *
       * const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
       * const { data } = await supabase.from('profiles').select('*')
       * ```
       */
      constructor(supabaseUrl, supabaseKey, options) {
          var _a, _b, _c;
          this.supabaseUrl = supabaseUrl;
          this.supabaseKey = supabaseKey;
          const baseUrl = validateSupabaseUrl(supabaseUrl);
          if (!supabaseKey)
              throw new Error('supabaseKey is required.');
          this.realtimeUrl = new URL('realtime/v1', baseUrl);
          this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace('http', 'ws');
          this.authUrl = new URL('auth/v1', baseUrl);
          this.storageUrl = new URL('storage/v1', baseUrl);
          this.functionsUrl = new URL('functions/v1', baseUrl);
          // default storage key uses the supabase project ref as a namespace
          const defaultStorageKey = `sb-${baseUrl.hostname.split('.')[0]}-auth-token`;
          const DEFAULTS = {
              db: DEFAULT_DB_OPTIONS,
              realtime: DEFAULT_REALTIME_OPTIONS,
              auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), { storageKey: defaultStorageKey }),
              global: DEFAULT_GLOBAL_OPTIONS,
          };
          const settings = applySettingDefaults(options !== null && options !== void 0 ? options : {}, DEFAULTS);
          this.storageKey = (_a = settings.auth.storageKey) !== null && _a !== void 0 ? _a : '';
          this.headers = (_b = settings.global.headers) !== null && _b !== void 0 ? _b : {};
          if (!settings.accessToken) {
              this.auth = this._initSupabaseAuthClient((_c = settings.auth) !== null && _c !== void 0 ? _c : {}, this.headers, settings.global.fetch);
          }
          else {
              this.accessToken = settings.accessToken;
              this.auth = new Proxy({}, {
                  get: (_, prop) => {
                      throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop)} is not possible`);
                  },
              });
          }
          this.fetch = fetchWithAuth(supabaseKey, this._getAccessToken.bind(this), settings.global.fetch);
          this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers, accessToken: this._getAccessToken.bind(this) }, settings.realtime));
          if (this.accessToken) {
              // Start auth immediately to avoid race condition with channel subscriptions
              this.accessToken()
                  .then((token) => this.realtime.setAuth(token))
                  .catch((e) => console.warn('Failed to set initial Realtime auth token:', e));
          }
          this.rest = new PostgrestClient(new URL('rest/v1', baseUrl).href, {
              headers: this.headers,
              schema: settings.db.schema,
              fetch: this.fetch,
          });
          this.storage = new StorageClient(this.storageUrl.href, this.headers, this.fetch, options === null || options === void 0 ? void 0 : options.storage);
          if (!settings.accessToken) {
              this._listenForAuthEvents();
          }
      }
      /**
       * Supabase Functions allows you to deploy and invoke edge functions.
       */
      get functions() {
          return new FunctionsClient(this.functionsUrl.href, {
              headers: this.headers,
              customFetch: this.fetch,
          });
      }
      /**
       * Perform a query on a table or a view.
       *
       * @param relation - The table or view name to query
       */
      from(relation) {
          return this.rest.from(relation);
      }
      // NOTE: signatures must be kept in sync with PostgrestClient.schema
      /**
       * Select a schema to query or perform an function (rpc) call.
       *
       * The schema needs to be on the list of exposed schemas inside Supabase.
       *
       * @param schema - The schema to query
       */
      schema(schema) {
          return this.rest.schema(schema);
      }
      // NOTE: signatures must be kept in sync with PostgrestClient.rpc
      /**
       * Perform a function call.
       *
       * @param fn - The function name to call
       * @param args - The arguments to pass to the function call
       * @param options - Named parameters
       * @param options.head - When set to `true`, `data` will not be returned.
       * Useful if you only need the count.
       * @param options.get - When set to `true`, the function will be called with
       * read-only access mode.
       * @param options.count - Count algorithm to use to count rows returned by the
       * function. Only applicable for [set-returning
       * functions](https://www.postgresql.org/docs/current/functions-srf.html).
       *
       * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
       * hood.
       *
       * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
       * statistics under the hood.
       *
       * `"estimated"`: Uses exact count for low numbers and planned count for high
       * numbers.
       */
      rpc(fn, args = {}, options = {
          head: false,
          get: false,
          count: undefined,
      }) {
          return this.rest.rpc(fn, args, options);
      }
      /**
       * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
       *
       * @param {string} name - The name of the Realtime channel.
       * @param {Object} opts - The options to pass to the Realtime channel.
       *
       */
      channel(name, opts = { config: {} }) {
          return this.realtime.channel(name, opts);
      }
      /**
       * Returns all Realtime channels.
       */
      getChannels() {
          return this.realtime.getChannels();
      }
      /**
       * Unsubscribes and removes Realtime channel from Realtime client.
       *
       * @param {RealtimeChannel} channel - The name of the Realtime channel.
       *
       */
      removeChannel(channel) {
          return this.realtime.removeChannel(channel);
      }
      /**
       * Unsubscribes and removes all Realtime channels from Realtime client.
       */
      removeAllChannels() {
          return this.realtime.removeAllChannels();
      }
      async _getAccessToken() {
          var _a, _b;
          if (this.accessToken) {
              return await this.accessToken();
          }
          const { data } = await this.auth.getSession();
          return (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : this.supabaseKey;
      }
      _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, storage, userStorage, storageKey, flowType, lock, debug, throwOnError, }, headers, fetch) {
          const authHeaders = {
              Authorization: `Bearer ${this.supabaseKey}`,
              apikey: `${this.supabaseKey}`,
          };
          return new SupabaseAuthClient({
              url: this.authUrl.href,
              headers: Object.assign(Object.assign({}, authHeaders), headers),
              storageKey: storageKey,
              autoRefreshToken,
              persistSession,
              detectSessionInUrl,
              storage,
              userStorage,
              flowType,
              lock,
              debug,
              throwOnError,
              fetch,
              // auth checks if there is a custom authorizaiton header using this flag
              // so it knows whether to return an error when getUser is called with no session
              hasCustomAuthorizationHeader: Object.keys(this.headers).some((key) => key.toLowerCase() === 'authorization'),
          });
      }
      _initRealtimeClient(options) {
          return new RealtimeClient(this.realtimeUrl.href, Object.assign(Object.assign({}, options), { params: Object.assign({ apikey: this.supabaseKey }, options === null || options === void 0 ? void 0 : options.params) }));
      }
      _listenForAuthEvents() {
          const data = this.auth.onAuthStateChange((event, session) => {
              this._handleTokenChanged(event, 'CLIENT', session === null || session === void 0 ? void 0 : session.access_token);
          });
          return data;
      }
      _handleTokenChanged(event, source, token) {
          if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') &&
              this.changedAccessToken !== token) {
              this.changedAccessToken = token;
              this.realtime.setAuth(token);
          }
          else if (event === 'SIGNED_OUT') {
              this.realtime.setAuth();
              if (source == 'STORAGE')
                  this.auth.signOut();
              this.changedAccessToken = undefined;
          }
      }
  }

  /**
   * Creates a new Supabase Client.
   *
   * @example
   * ```ts
   * import { createClient } from '@supabase/supabase-js'
   *
   * const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
   * const { data, error } = await supabase.from('profiles').select('*')
   * ```
   */
  const createClient = (supabaseUrl, supabaseKey, options) => {
      return new SupabaseClient(supabaseUrl, supabaseKey, options);
  };
  // Check for Node.js <= 18 deprecation
  function shouldShowDeprecationWarning() {
      // Skip in browser environments
      if (typeof window !== 'undefined') {
          return false;
      }
      // Skip if process is not available (e.g., Edge Runtime)
      if (typeof browser$1 === 'undefined') {
          return false;
      }
      // Use dynamic property access to avoid Next.js Edge Runtime static analysis warnings
      const processVersion = browser$1['version'];
      const versionMatch = processVersion.match(/^v(\d+)\./);
      if (!versionMatch) {
          return false;
      }
      const majorVersion = parseInt(versionMatch[1], 10);
      return majorVersion <= 18;
  }
  if (shouldShowDeprecationWarning()) {
      console.warn(`⚠️  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. ` +
          `Please upgrade to Node.js 20 or later. ` +
          `For more information, visit: https://github.com/orgs/supabase/discussions/37217`);
  }

  const __esModule = true ;

  exports.AuthAdminApi = AuthAdminApi;
  exports.AuthApiError = AuthApiError;
  exports.AuthClient = AuthClient;
  exports.AuthError = AuthError;
  exports.AuthImplicitGrantRedirectError = AuthImplicitGrantRedirectError;
  exports.AuthInvalidCredentialsError = AuthInvalidCredentialsError;
  exports.AuthInvalidJwtError = AuthInvalidJwtError;
  exports.AuthInvalidTokenResponseError = AuthInvalidTokenResponseError;
  exports.AuthPKCEGrantCodeExchangeError = AuthPKCEGrantCodeExchangeError;
  exports.AuthRetryableFetchError = AuthRetryableFetchError;
  exports.AuthSessionMissingError = AuthSessionMissingError;
  exports.AuthUnknownError = AuthUnknownError;
  exports.AuthWeakPasswordError = AuthWeakPasswordError;
  exports.CustomAuthError = CustomAuthError;
  exports.FunctionsError = FunctionsError;
  exports.FunctionsFetchError = FunctionsFetchError;
  exports.FunctionsHttpError = FunctionsHttpError;
  exports.FunctionsRelayError = FunctionsRelayError;
  exports.GoTrueAdminApi = GoTrueAdminApi;
  exports.GoTrueClient = GoTrueClient;
  exports.NavigatorLockAcquireTimeoutError = NavigatorLockAcquireTimeoutError;
  exports.PostgrestError = PostgrestError;
  exports.REALTIME_CHANNEL_STATES = REALTIME_CHANNEL_STATES;
  exports.RealtimeChannel = RealtimeChannel;
  exports.RealtimeClient = RealtimeClient;
  exports.RealtimePresence = RealtimePresence;
  exports.SIGN_OUT_SCOPES = SIGN_OUT_SCOPES;
  exports.SupabaseClient = SupabaseClient;
  exports.WebSocketFactory = WebSocketFactory;
  exports.__esModule = __esModule;
  exports.createClient = createClient;
  exports.isAuthApiError = isAuthApiError;
  exports.isAuthError = isAuthError;
  exports.isAuthImplicitGrantRedirectError = isAuthImplicitGrantRedirectError;
  exports.isAuthRetryableFetchError = isAuthRetryableFetchError;
  exports.isAuthSessionMissingError = isAuthSessionMissingError;
  exports.isAuthWeakPasswordError = isAuthWeakPasswordError;
  exports.lockInternals = internals;
  exports.navigatorLock = navigatorLock;
  exports.processLock = processLock;

}));
