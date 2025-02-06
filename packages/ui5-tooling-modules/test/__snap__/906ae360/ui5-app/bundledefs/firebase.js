sap.ui.define(['exports'], (function (exports) { 'use strict';

  var global$1 = (typeof global !== "undefined" ? global :
    typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window : {});

  if (typeof global$1.setTimeout === 'function') ;
  if (typeof global$1.clearTimeout === 'function') ;
  var env = {};

  // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
  var performance = global$1.performance || {};
  performance.now        ||
    performance.mozNow     ||
    performance.msNow      ||
    performance.oNow       ||
    performance.webkitNow  ||
    function(){ return (new Date()).getTime() };

  var browser$1 = {
    env: env};

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
    if (typeof browser$1 === "undefined" || typeof browser$1.env === "undefined") {
      return;
    }
    const defaultsJsonString = browser$1.env.__FIREBASE_DEFAULTS__;
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
    return (_b = (_a = getDefaults()) === null || _a === undefined ? undefined : _a.emulatorHosts) === null || _b === undefined ? undefined : _b[productName];
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
    return (_a = getDefaults()) === null || _a === undefined ? undefined : _a.config;
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
  function getModularInstance(service) {
    if (service && service._delegate) {
      return service._delegate;
    } else {
      return service;
    }
  }

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
       * @param identifier A provider can provide multiple instances of a service
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
          const normalizedIdentifier = this.normalizeInstanceIdentifier(options === null || options === undefined ? undefined : options.identifier);
          const optional = (_a = options === null || options === undefined ? undefined : options.optional) !== null && _a !== undefined ? _a : false;
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
              // In case a component is not initialized and should/cannot be auto-initialized at the moment, return null if the optional flag is set, or throw
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
          const existingCallbacks = (_a = this.onInitCallbacks.get(normalizedIdentifier)) !== null && _a !== undefined ? _a : new Set();
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

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var index_cjs = {};

  var hasRequiredIndex_cjs;

  function requireIndex_cjs () {
  	if (hasRequiredIndex_cjs) return index_cjs;
  	hasRequiredIndex_cjs = 1;
  	(function (exports) {

  		Object.defineProperty(exports, '__esModule', { value: true });

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
  		/**
  		 * A container for all of the Logger instances
  		 */
  		const instances = [];
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
  		exports.LogLevel = undefined;
  		(function (LogLevel) {
  		    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
  		    LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
  		    LogLevel[LogLevel["INFO"] = 2] = "INFO";
  		    LogLevel[LogLevel["WARN"] = 3] = "WARN";
  		    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
  		    LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
  		})(exports.LogLevel || (exports.LogLevel = {}));
  		const levelStringToEnum = {
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
  		const defaultLogLevel = exports.LogLevel.INFO;
  		/**
  		 * By default, `console.debug` is not displayed in the developer console (in
  		 * chrome). To avoid forcing users to have to opt-in to these logs twice
  		 * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
  		 * logs to the `console.log` function.
  		 */
  		const ConsoleMethod = {
  		    [exports.LogLevel.DEBUG]: 'log',
  		    [exports.LogLevel.VERBOSE]: 'log',
  		    [exports.LogLevel.INFO]: 'info',
  		    [exports.LogLevel.WARN]: 'warn',
  		    [exports.LogLevel.ERROR]: 'error'
  		};
  		/**
  		 * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
  		 * messages on to their corresponding console counterparts (if the log method
  		 * is supported by the current log level)
  		 */
  		const defaultLogHandler = (instance, logType, ...args) => {
  		    if (logType < instance.logLevel) {
  		        return;
  		    }
  		    const now = new Date().toISOString();
  		    const method = ConsoleMethod[logType];
  		    if (method) {
  		        console[method](`[${now}]  ${instance.name}:`, ...args);
  		    }
  		    else {
  		        throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
  		    }
  		};
  		class Logger {
  		    /**
  		     * Gives you an instance of a Logger to capture messages according to
  		     * Firebase's logging scheme.
  		     *
  		     * @param name The name that the logs will be associated with
  		     */
  		    constructor(name) {
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
  		    get logLevel() {
  		        return this._logLevel;
  		    }
  		    set logLevel(val) {
  		        if (!(val in exports.LogLevel)) {
  		            throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
  		        }
  		        this._logLevel = val;
  		    }
  		    // Workaround for setter/getter having to be the same type.
  		    setLogLevel(val) {
  		        this._logLevel = typeof val === 'string' ? levelStringToEnum[val] : val;
  		    }
  		    get logHandler() {
  		        return this._logHandler;
  		    }
  		    set logHandler(val) {
  		        if (typeof val !== 'function') {
  		            throw new TypeError('Value assigned to `logHandler` must be a function');
  		        }
  		        this._logHandler = val;
  		    }
  		    get userLogHandler() {
  		        return this._userLogHandler;
  		    }
  		    set userLogHandler(val) {
  		        this._userLogHandler = val;
  		    }
  		    /**
  		     * The functions below are all based on the `console` interface
  		     */
  		    debug(...args) {
  		        this._userLogHandler && this._userLogHandler(this, exports.LogLevel.DEBUG, ...args);
  		        this._logHandler(this, exports.LogLevel.DEBUG, ...args);
  		    }
  		    log(...args) {
  		        this._userLogHandler &&
  		            this._userLogHandler(this, exports.LogLevel.VERBOSE, ...args);
  		        this._logHandler(this, exports.LogLevel.VERBOSE, ...args);
  		    }
  		    info(...args) {
  		        this._userLogHandler && this._userLogHandler(this, exports.LogLevel.INFO, ...args);
  		        this._logHandler(this, exports.LogLevel.INFO, ...args);
  		    }
  		    warn(...args) {
  		        this._userLogHandler && this._userLogHandler(this, exports.LogLevel.WARN, ...args);
  		        this._logHandler(this, exports.LogLevel.WARN, ...args);
  		    }
  		    error(...args) {
  		        this._userLogHandler && this._userLogHandler(this, exports.LogLevel.ERROR, ...args);
  		        this._logHandler(this, exports.LogLevel.ERROR, ...args);
  		    }
  		}
  		function setLogLevel(level) {
  		    instances.forEach(inst => {
  		        inst.setLogLevel(level);
  		    });
  		}
  		function setUserLogHandler(logCallback, options) {
  		    for (const instance of instances) {
  		        let customLogLevel = null;
  		        if (options && options.level) {
  		            customLogLevel = levelStringToEnum[options.level];
  		        }
  		        if (logCallback === null) {
  		            instance.userLogHandler = null;
  		        }
  		        else {
  		            instance.userLogHandler = (instance, level, ...args) => {
  		                const message = args
  		                    .map(arg => {
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
  		                    .filter(arg => arg)
  		                    .join(' ');
  		                if (level >= (customLogLevel !== null && customLogLevel !== undefined ? customLogLevel : instance.logLevel)) {
  		                    logCallback({
  		                        level: exports.LogLevel[level].toLowerCase(),
  		                        message,
  		                        args,
  		                        type: instance.name
  		                    });
  		                }
  		            };
  		        }
  		    }
  		}

  		exports.Logger = Logger;
  		exports.setLogLevel = setLogLevel;
  		exports.setUserLogHandler = setUserLogHandler;
  		
  	} (index_cjs));
  	return index_cjs;
  }

  var index_cjsExports = requireIndex_cjs();

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

  /**
   * Open a database.
   *
   * @param name Name of the database.
   * @param version Schema version.
   * @param callbacks Additional callbacks.
   */
  function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
      const request = indexedDB.open(name, version);
      const openPromise = wrap(request);
      if (upgrade) {
          request.addEventListener('upgradeneeded', (event) => {
              upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
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
  replaceTraps((oldTraps) => ({
      ...oldTraps,
      get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
      has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop),
  }));

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
      return (component === null || component === undefined ? undefined : component.type) === "VERSION" /* ComponentType.VERSION */;
  }

  const name$q = "@firebase/app";
  const version$1 = "0.10.18";

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
  const logger = new index_cjsExports.Logger('@firebase/app');

  const name$p = "@firebase/app-compat";

  const name$o = "@firebase/analytics-compat";

  const name$n = "@firebase/analytics";

  const name$m = "@firebase/app-check-compat";

  const name$l = "@firebase/app-check";

  const name$k = "@firebase/auth";

  const name$j = "@firebase/auth-compat";

  const name$i = "@firebase/database";

  const name$h = "@firebase/data-connect";

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

  const name$2 = "@firebase/vertexai";

  const name$1 = "@firebase/firestore-compat";

  const name$r = "firebase";
  const version$2 = "11.2.0";

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
      [name$q]: 'fire-core',
      [name$p]: 'fire-core-compat',
      [name$n]: 'fire-analytics',
      [name$o]: 'fire-analytics-compat',
      [name$l]: 'fire-app-check',
      [name$m]: 'fire-app-check-compat',
      [name$k]: 'fire-auth',
      [name$j]: 'fire-auth-compat',
      [name$i]: 'fire-rtdb',
      [name$h]: 'fire-data-connect',
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
      'fire-js': 'fire-js', // Platform identifier for JS SDK.
      [name$r]: 'fire-js-all'
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
  const SDK_VERSION = version$2;
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
      let library = (_a = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a !== undefined ? _a : libraryKeyOrName;
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
          dbPromise = openDB(DB_NAME, DB_VERSION, {
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
                  originalErrorMessage: e === null || e === undefined ? undefined : e.message
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
                  originalErrorMessage: e === null || e === undefined ? undefined : e.message
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
              if (idbHeartbeatObject === null || idbHeartbeatObject === undefined ? undefined : idbHeartbeatObject.heartbeats) {
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
                  lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== undefined ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
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
                  lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== undefined ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
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
      registerVersion(name$q, version$1, variant);
      // BUILD_TARGET will be replaced by values like esm2017, cjs2017, etc during the compilation
      registerVersion(name$q, version$1, 'esm2017');
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

  var name = "firebase";
  var version = "11.2.0";

  /**
   * @license
   * Copyright 2020 Google LLC
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
  registerVersion(name, version, 'app');

  var bloom_blob_es2018 = {};

  /** @license
  Copyright The Closure Library Authors.
  SPDX-License-Identifier: Apache-2.0
  */

  var hasRequiredBloom_blob_es2018;

  function requireBloom_blob_es2018 () {
  	if (hasRequiredBloom_blob_es2018) return bloom_blob_es2018;
  	hasRequiredBloom_blob_es2018 = 1;
  	(function() {var h;/** @license

  	 Copyright The Closure Library Authors.
  	 SPDX-License-Identifier: Apache-2.0
  	*/
  	function k(f,a){function c(){}c.prototype=a.prototype;f.D=a.prototype;f.prototype=new c;f.prototype.constructor=f;f.C=function(d,e,g){for(var b=Array(arguments.length-2),r=2;r<arguments.length;r++)b[r-2]=arguments[r];return a.prototype[e].apply(d,b)};}function l(){this.blockSize=-1;}function m(){this.blockSize=-1;this.blockSize=64;this.g=Array(4);this.B=Array(this.blockSize);this.o=this.h=0;this.s();}k(m,l);m.prototype.s=function(){this.g[0]=1732584193;this.g[1]=4023233417;this.g[2]=2562383102;this.g[3]=271733878;this.o=this.h=0;};
  	function n(f,a,c){c||(c=0);var d=Array(16);if("string"===typeof a)for(var e=0;16>e;++e)d[e]=a.charCodeAt(c++)|a.charCodeAt(c++)<<8|a.charCodeAt(c++)<<16|a.charCodeAt(c++)<<24;else for(e=0;16>e;++e)d[e]=a[c++]|a[c++]<<8|a[c++]<<16|a[c++]<<24;a=f.g[0];c=f.g[1];e=f.g[2];var g=f.g[3];var b=a+(g^c&(e^g))+d[0]+3614090360&4294967295;a=c+(b<<7&4294967295|b>>>25);b=g+(e^a&(c^e))+d[1]+3905402710&4294967295;g=a+(b<<12&4294967295|b>>>20);b=e+(c^g&(a^c))+d[2]+606105819&4294967295;e=g+(b<<17&4294967295|b>>>15);
  	b=c+(a^e&(g^a))+d[3]+3250441966&4294967295;c=e+(b<<22&4294967295|b>>>10);b=a+(g^c&(e^g))+d[4]+4118548399&4294967295;a=c+(b<<7&4294967295|b>>>25);b=g+(e^a&(c^e))+d[5]+1200080426&4294967295;g=a+(b<<12&4294967295|b>>>20);b=e+(c^g&(a^c))+d[6]+2821735955&4294967295;e=g+(b<<17&4294967295|b>>>15);b=c+(a^e&(g^a))+d[7]+4249261313&4294967295;c=e+(b<<22&4294967295|b>>>10);b=a+(g^c&(e^g))+d[8]+1770035416&4294967295;a=c+(b<<7&4294967295|b>>>25);b=g+(e^a&(c^e))+d[9]+2336552879&4294967295;g=a+(b<<12&4294967295|
  	b>>>20);b=e+(c^g&(a^c))+d[10]+4294925233&4294967295;e=g+(b<<17&4294967295|b>>>15);b=c+(a^e&(g^a))+d[11]+2304563134&4294967295;c=e+(b<<22&4294967295|b>>>10);b=a+(g^c&(e^g))+d[12]+1804603682&4294967295;a=c+(b<<7&4294967295|b>>>25);b=g+(e^a&(c^e))+d[13]+4254626195&4294967295;g=a+(b<<12&4294967295|b>>>20);b=e+(c^g&(a^c))+d[14]+2792965006&4294967295;e=g+(b<<17&4294967295|b>>>15);b=c+(a^e&(g^a))+d[15]+1236535329&4294967295;c=e+(b<<22&4294967295|b>>>10);b=a+(e^g&(c^e))+d[1]+4129170786&4294967295;a=c+(b<<
  	5&4294967295|b>>>27);b=g+(c^e&(a^c))+d[6]+3225465664&4294967295;g=a+(b<<9&4294967295|b>>>23);b=e+(a^c&(g^a))+d[11]+643717713&4294967295;e=g+(b<<14&4294967295|b>>>18);b=c+(g^a&(e^g))+d[0]+3921069994&4294967295;c=e+(b<<20&4294967295|b>>>12);b=a+(e^g&(c^e))+d[5]+3593408605&4294967295;a=c+(b<<5&4294967295|b>>>27);b=g+(c^e&(a^c))+d[10]+38016083&4294967295;g=a+(b<<9&4294967295|b>>>23);b=e+(a^c&(g^a))+d[15]+3634488961&4294967295;e=g+(b<<14&4294967295|b>>>18);b=c+(g^a&(e^g))+d[4]+3889429448&4294967295;c=
  	e+(b<<20&4294967295|b>>>12);b=a+(e^g&(c^e))+d[9]+568446438&4294967295;a=c+(b<<5&4294967295|b>>>27);b=g+(c^e&(a^c))+d[14]+3275163606&4294967295;g=a+(b<<9&4294967295|b>>>23);b=e+(a^c&(g^a))+d[3]+4107603335&4294967295;e=g+(b<<14&4294967295|b>>>18);b=c+(g^a&(e^g))+d[8]+1163531501&4294967295;c=e+(b<<20&4294967295|b>>>12);b=a+(e^g&(c^e))+d[13]+2850285829&4294967295;a=c+(b<<5&4294967295|b>>>27);b=g+(c^e&(a^c))+d[2]+4243563512&4294967295;g=a+(b<<9&4294967295|b>>>23);b=e+(a^c&(g^a))+d[7]+1735328473&4294967295;
  	e=g+(b<<14&4294967295|b>>>18);b=c+(g^a&(e^g))+d[12]+2368359562&4294967295;c=e+(b<<20&4294967295|b>>>12);b=a+(c^e^g)+d[5]+4294588738&4294967295;a=c+(b<<4&4294967295|b>>>28);b=g+(a^c^e)+d[8]+2272392833&4294967295;g=a+(b<<11&4294967295|b>>>21);b=e+(g^a^c)+d[11]+1839030562&4294967295;e=g+(b<<16&4294967295|b>>>16);b=c+(e^g^a)+d[14]+4259657740&4294967295;c=e+(b<<23&4294967295|b>>>9);b=a+(c^e^g)+d[1]+2763975236&4294967295;a=c+(b<<4&4294967295|b>>>28);b=g+(a^c^e)+d[4]+1272893353&4294967295;g=a+(b<<11&4294967295|
  	b>>>21);b=e+(g^a^c)+d[7]+4139469664&4294967295;e=g+(b<<16&4294967295|b>>>16);b=c+(e^g^a)+d[10]+3200236656&4294967295;c=e+(b<<23&4294967295|b>>>9);b=a+(c^e^g)+d[13]+681279174&4294967295;a=c+(b<<4&4294967295|b>>>28);b=g+(a^c^e)+d[0]+3936430074&4294967295;g=a+(b<<11&4294967295|b>>>21);b=e+(g^a^c)+d[3]+3572445317&4294967295;e=g+(b<<16&4294967295|b>>>16);b=c+(e^g^a)+d[6]+76029189&4294967295;c=e+(b<<23&4294967295|b>>>9);b=a+(c^e^g)+d[9]+3654602809&4294967295;a=c+(b<<4&4294967295|b>>>28);b=g+(a^c^e)+d[12]+
  	3873151461&4294967295;g=a+(b<<11&4294967295|b>>>21);b=e+(g^a^c)+d[15]+530742520&4294967295;e=g+(b<<16&4294967295|b>>>16);b=c+(e^g^a)+d[2]+3299628645&4294967295;c=e+(b<<23&4294967295|b>>>9);b=a+(e^(c|~g))+d[0]+4096336452&4294967295;a=c+(b<<6&4294967295|b>>>26);b=g+(c^(a|~e))+d[7]+1126891415&4294967295;g=a+(b<<10&4294967295|b>>>22);b=e+(a^(g|~c))+d[14]+2878612391&4294967295;e=g+(b<<15&4294967295|b>>>17);b=c+(g^(e|~a))+d[5]+4237533241&4294967295;c=e+(b<<21&4294967295|b>>>11);b=a+(e^(c|~g))+d[12]+1700485571&
  	4294967295;a=c+(b<<6&4294967295|b>>>26);b=g+(c^(a|~e))+d[3]+2399980690&4294967295;g=a+(b<<10&4294967295|b>>>22);b=e+(a^(g|~c))+d[10]+4293915773&4294967295;e=g+(b<<15&4294967295|b>>>17);b=c+(g^(e|~a))+d[1]+2240044497&4294967295;c=e+(b<<21&4294967295|b>>>11);b=a+(e^(c|~g))+d[8]+1873313359&4294967295;a=c+(b<<6&4294967295|b>>>26);b=g+(c^(a|~e))+d[15]+4264355552&4294967295;g=a+(b<<10&4294967295|b>>>22);b=e+(a^(g|~c))+d[6]+2734768916&4294967295;e=g+(b<<15&4294967295|b>>>17);b=c+(g^(e|~a))+d[13]+1309151649&
  	4294967295;c=e+(b<<21&4294967295|b>>>11);b=a+(e^(c|~g))+d[4]+4149444226&4294967295;a=c+(b<<6&4294967295|b>>>26);b=g+(c^(a|~e))+d[11]+3174756917&4294967295;g=a+(b<<10&4294967295|b>>>22);b=e+(a^(g|~c))+d[2]+718787259&4294967295;e=g+(b<<15&4294967295|b>>>17);b=c+(g^(e|~a))+d[9]+3951481745&4294967295;f.g[0]=f.g[0]+a&4294967295;f.g[1]=f.g[1]+(e+(b<<21&4294967295|b>>>11))&4294967295;f.g[2]=f.g[2]+e&4294967295;f.g[3]=f.g[3]+g&4294967295;}
  	m.prototype.u=function(f,a){ undefined===a&&(a=f.length);for(var c=a-this.blockSize,d=this.B,e=this.h,g=0;g<a;){if(0==e)for(;g<=c;)n(this,f,g),g+=this.blockSize;if("string"===typeof f)for(;g<a;){if(d[e++]=f.charCodeAt(g++),e==this.blockSize){n(this,d);e=0;break}}else for(;g<a;)if(d[e++]=f[g++],e==this.blockSize){n(this,d);e=0;break}}this.h=e;this.o+=a;};
  	m.prototype.v=function(){var f=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);f[0]=128;for(var a=1;a<f.length-8;++a)f[a]=0;var c=8*this.o;for(a=f.length-8;a<f.length;++a)f[a]=c&255,c/=256;this.u(f);f=Array(16);for(a=c=0;4>a;++a)for(var d=0;32>d;d+=8)f[c++]=this.g[a]>>>d&255;return f};function p(f,a){var c=q;return Object.prototype.hasOwnProperty.call(c,f)?c[f]:c[f]=a(f)}function t(f,a){this.h=a;for(var c=[],d=true,e=f.length-1;0<=e;e--){var g=f[e]|0;d&&g==a||(c[e]=g,d=false);}this.g=c;}var q={};function u(f){return  -128<=f&&128>f?p(f,function(a){return new t([a|0],0>a?-1:0)}):new t([f|0],0>f?-1:0)}function v(f){if(isNaN(f)||!isFinite(f))return w;if(0>f)return x(v(-f));for(var a=[],c=1,d=0;f>=c;d++)a[d]=f/c|0,c*=4294967296;return new t(a,0)}
  	function y(f,a){if(0==f.length)throw Error("number format error: empty string");a=a||10;if(2>a||36<a)throw Error("radix out of range: "+a);if("-"==f.charAt(0))return x(y(f.substring(1),a));if(0<=f.indexOf("-"))throw Error('number format error: interior "-" character');for(var c=v(Math.pow(a,8)),d=w,e=0;e<f.length;e+=8){var g=Math.min(8,f.length-e),b=parseInt(f.substring(e,e+g),a);8>g?(g=v(Math.pow(a,g)),d=d.j(g).add(v(b))):(d=d.j(c),d=d.add(v(b)));}return d}var w=u(0),z=u(1),A=u(16777216);h=t.prototype;
  	h.m=function(){if(B(this))return -x(this).m();for(var f=0,a=1,c=0;c<this.g.length;c++){var d=this.i(c);f+=(0<=d?d:4294967296+d)*a;a*=4294967296;}return f};h.toString=function(f){f=f||10;if(2>f||36<f)throw Error("radix out of range: "+f);if(C(this))return "0";if(B(this))return "-"+x(this).toString(f);for(var a=v(Math.pow(f,6)),c=this,d="";;){var e=D(c,a).g;c=F(c,e.j(a));var g=((0<c.g.length?c.g[0]:c.h)>>>0).toString(f);c=e;if(C(c))return g+d;for(;6>g.length;)g="0"+g;d=g+d;}};
  	h.i=function(f){return 0>f?0:f<this.g.length?this.g[f]:this.h};function C(f){if(0!=f.h)return  false;for(var a=0;a<f.g.length;a++)if(0!=f.g[a])return  false;return  true}function B(f){return  -1==f.h}h.l=function(f){f=F(this,f);return B(f)?-1:C(f)?0:1};function x(f){for(var a=f.g.length,c=[],d=0;d<a;d++)c[d]=~f.g[d];return (new t(c,~f.h)).add(z)}h.abs=function(){return B(this)?x(this):this};
  	h.add=function(f){for(var a=Math.max(this.g.length,f.g.length),c=[],d=0,e=0;e<=a;e++){var g=d+(this.i(e)&65535)+(f.i(e)&65535),b=(g>>>16)+(this.i(e)>>>16)+(f.i(e)>>>16);d=b>>>16;g&=65535;b&=65535;c[e]=b<<16|g;}return new t(c,c[c.length-1]&-2147483648?-1:0)};function F(f,a){return f.add(x(a))}
  	h.j=function(f){if(C(this)||C(f))return w;if(B(this))return B(f)?x(this).j(x(f)):x(x(this).j(f));if(B(f))return x(this.j(x(f)));if(0>this.l(A)&&0>f.l(A))return v(this.m()*f.m());for(var a=this.g.length+f.g.length,c=[],d=0;d<2*a;d++)c[d]=0;for(d=0;d<this.g.length;d++)for(var e=0;e<f.g.length;e++){var g=this.i(d)>>>16,b=this.i(d)&65535,r=f.i(e)>>>16,E=f.i(e)&65535;c[2*d+2*e]+=b*E;G(c,2*d+2*e);c[2*d+2*e+1]+=g*E;G(c,2*d+2*e+1);c[2*d+2*e+1]+=b*r;G(c,2*d+2*e+1);c[2*d+2*e+2]+=g*r;G(c,2*d+2*e+2);}for(d=0;d<
  	a;d++)c[d]=c[2*d+1]<<16|c[2*d];for(d=a;d<2*a;d++)c[d]=0;return new t(c,0)};function G(f,a){for(;(f[a]&65535)!=f[a];)f[a+1]+=f[a]>>>16,f[a]&=65535,a++;}function H(f,a){this.g=f;this.h=a;}
  	function D(f,a){if(C(a))throw Error("division by zero");if(C(f))return new H(w,w);if(B(f))return a=D(x(f),a),new H(x(a.g),x(a.h));if(B(a))return a=D(f,x(a)),new H(x(a.g),a.h);if(30<f.g.length){if(B(f)||B(a))throw Error("slowDivide_ only works with positive integers.");for(var c=z,d=a;0>=d.l(f);)c=I(c),d=I(d);var e=J(c,1),g=J(d,1);d=J(d,2);for(c=J(c,2);!C(d);){var b=g.add(d);0>=b.l(f)&&(e=e.add(c),g=b);d=J(d,1);c=J(c,1);}a=F(f,e.j(a));return new H(e,a)}for(e=w;0<=f.l(a);){c=Math.max(1,Math.floor(f.m()/
  	a.m()));d=Math.ceil(Math.log(c)/Math.LN2);d=48>=d?1:Math.pow(2,d-48);g=v(c);for(b=g.j(a);B(b)||0<b.l(f);)c-=d,g=v(c),b=g.j(a);C(g)&&(g=z);e=e.add(g);f=F(f,b);}return new H(e,f)}h.A=function(f){return D(this,f).h};h.and=function(f){for(var a=Math.max(this.g.length,f.g.length),c=[],d=0;d<a;d++)c[d]=this.i(d)&f.i(d);return new t(c,this.h&f.h)};h.or=function(f){for(var a=Math.max(this.g.length,f.g.length),c=[],d=0;d<a;d++)c[d]=this.i(d)|f.i(d);return new t(c,this.h|f.h)};
  	h.xor=function(f){for(var a=Math.max(this.g.length,f.g.length),c=[],d=0;d<a;d++)c[d]=this.i(d)^f.i(d);return new t(c,this.h^f.h)};function I(f){for(var a=f.g.length+1,c=[],d=0;d<a;d++)c[d]=f.i(d)<<1|f.i(d-1)>>>31;return new t(c,f.h)}function J(f,a){var c=a>>5;a%=32;for(var d=f.g.length-c,e=[],g=0;g<d;g++)e[g]=0<a?f.i(g+c)>>>a|f.i(g+c+1)<<32-a:f.i(g+c);return new t(e,f.h)}m.prototype.digest=m.prototype.v;m.prototype.reset=m.prototype.s;m.prototype.update=m.prototype.u;bloom_blob_es2018.Md5=m;t.prototype.add=t.prototype.add;t.prototype.multiply=t.prototype.j;t.prototype.modulo=t.prototype.A;t.prototype.compare=t.prototype.l;t.prototype.toNumber=t.prototype.m;t.prototype.toString=t.prototype.toString;t.prototype.getBits=t.prototype.i;t.fromNumber=v;t.fromString=y;bloom_blob_es2018.Integer=t;}).apply( typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof self !== 'undefined' ? self  : typeof window !== 'undefined' ? window  : {});
  	return bloom_blob_es2018;
  }

  var bloom_blob_es2018Exports = requireBloom_blob_es2018();

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
  /**
   * Simple wrapper around a nullable UID. Mostly exists to make code more
   * readable.
   */
  class User {
      constructor(t) {
          this.uid = t;
      }
      isAuthenticated() {
          return null != this.uid;
      }
      /**
       * Returns a key representing this user, suitable for inclusion in a
       * dictionary.
       */    toKey() {
          return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
      }
      isEqual(t) {
          return t.uid === this.uid;
      }
  }

  /** A user with a null UID. */ User.UNAUTHENTICATED = new User(null), 
  // TODO(mikelehen): Look into getting a proper uid-equivalent for
  // non-FirebaseAuth providers.
  User.GOOGLE_CREDENTIALS = new User("google-credentials-uid"), User.FIRST_PARTY = new User("first-party-uid"), 
  User.MOCK_USER = new User("mock-user");

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
  let f = "11.2.0";

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
  const E = new index_cjsExports.Logger("@firebase/firestore");

  function __PRIVATE_logDebug(t, ...e) {
      if (E.logLevel <= index_cjsExports.LogLevel.DEBUG) {
          const r = e.map(__PRIVATE_argToString);
          E.debug(`Firestore (${f}): ${t}`, ...r);
      }
  }

  function __PRIVATE_logError(t, ...e) {
      if (E.logLevel <= index_cjsExports.LogLevel.ERROR) {
          const r = e.map(__PRIVATE_argToString);
          E.error(`Firestore (${f}): ${t}`, ...r);
      }
  }

  /**
   * @internal
   */ function __PRIVATE_logWarn(t, ...e) {
      if (E.logLevel <= index_cjsExports.LogLevel.WARN) {
          const r = e.map(__PRIVATE_argToString);
          E.warn(`Firestore (${f}): ${t}`, ...r);
      }
  }

  /**
   * Converts an additional log parameter to a string representation.
   */ function __PRIVATE_argToString(t) {
      if ("string" == typeof t) return t;
      try {
          /**
   * @license
   * Copyright 2020 Google LLC
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
          /** Formats an object as a JSON string, suitable for logging. */
          return function __PRIVATE_formatJSON(t) {
              return JSON.stringify(t);
          }(t);
      } catch (e) {
          // Converting to JSON failed, just log the object directly
          return t;
      }
  }

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
  /**
   * Unconditionally fails, throwing an Error with the given message.
   * Messages are stripped in production builds.
   *
   * Returns `never` and can be used in expressions:
   * @example
   * let futureVar = fail('not implemented yet');
   */ function fail(t = "Unexpected state") {
      // Log the failure in addition to throw an exception, just in case the
      // exception is swallowed.
      const e = `FIRESTORE (${f}) INTERNAL ASSERTION FAILED: ` + t;
      // NOTE: We don't use FirestoreError here because these are internal failures
      // that cannot be handled by the user. (Also it would create a circular
      // dependency between the error and assert modules which doesn't work.)
      throw __PRIVATE_logError(e), new Error(e);
  }

  /**
   * Fails if the given assertion condition is false, throwing an Error with the
   * given message if it did.
   *
   * Messages are stripped in production builds.
   */ function __PRIVATE_hardAssert(t, e) {
      t || fail();
  }

  /**
   * Casts `obj` to `T`. In non-production builds, verifies that `obj` is an
   * instance of `T` before casting.
   */ function __PRIVATE_debugCast(t, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  e) {
      return t;
  }

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
   */ const m = "ok", A = "cancelled", T = "unknown", P = "invalid-argument", R = "deadline-exceeded", I = "not-found", p = "permission-denied", y = "unauthenticated", w = "resource-exhausted", g = "failed-precondition", F = "aborted", v = "out-of-range", D = "unimplemented", b = "internal", C = "unavailable";

  /** An error returned by a Firestore operation. */ class FirestoreError extends FirebaseError {
      /** @hideconstructor */
      constructor(
      /**
       * The backend error code associated with this error.
       */
      t, 
      /**
       * A custom error description.
       */
      e) {
          super(t, e), this.code = t, this.message = e, 
          // HACK: We write a toString property directly because Error is not a real
          // class and so inheritance does not work correctly. We could alternatively
          // do the same "back-door inheritance" trick that FirebaseError does.
          this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
      }
  }

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
   */ class __PRIVATE_OAuthToken {
      constructor(t, e) {
          this.user = e, this.type = "OAuth", this.headers = new Map, this.headers.set("Authorization", `Bearer ${t}`);
      }
  }

  /**
   * A CredentialsProvider that always yields an empty token.
   * @internal
   */ class __PRIVATE_EmptyAuthCredentialsProvider {
      getToken() {
          return Promise.resolve(null);
      }
      invalidateToken() {}
      start(t, e) {
          // Fire with initial user.
          t.enqueueRetryable((() => e(User.UNAUTHENTICATED)));
      }
      shutdown() {}
  }

  /**
   * A CredentialsProvider that always returns a constant token. Used for
   * emulator token mocking.
   */ class __PRIVATE_EmulatorAuthCredentialsProvider {
      constructor(t) {
          this.token = t, 
          /**
           * Stores the listener registered with setChangeListener()
           * This isn't actually necessary since the UID never changes, but we use this
           * to verify the listen contract is adhered to in tests.
           */
          this.changeListener = null;
      }
      getToken() {
          return Promise.resolve(this.token);
      }
      invalidateToken() {}
      start(t, e) {
          this.changeListener = e, 
          // Fire with initial user.
          t.enqueueRetryable((() => e(this.token.user)));
      }
      shutdown() {
          this.changeListener = null;
      }
  }

  /** Credential provider for the Lite SDK. */ class __PRIVATE_LiteAuthCredentialsProvider {
      constructor(t) {
          this.auth = null, t.onInit((t => {
              this.auth = t;
          }));
      }
      getToken() {
          return this.auth ? this.auth.getToken().then((t => t ? (__PRIVATE_hardAssert("string" == typeof t.accessToken), 
          new __PRIVATE_OAuthToken(t.accessToken, new User(this.auth.getUid()))) : null)) : Promise.resolve(null);
      }
      invalidateToken() {}
      start(t, e) {}
      shutdown() {}
  }

  /*
   * FirstPartyToken provides a fresh token each time its value
   * is requested, because if the token is too old, requests will be rejected.
   * Technically this may no longer be necessary since the SDK should gracefully
   * recover from unauthenticated errors (see b/33147818 for context), but it's
   * safer to keep the implementation as-is.
   */ class __PRIVATE_FirstPartyToken {
      constructor(t, e, r) {
          this.t = t, this.i = e, this.o = r, this.type = "FirstParty", this.user = User.FIRST_PARTY, 
          this.u = new Map;
      }
      /**
       * Gets an authorization token, using a provided factory function, or return
       * null.
       */    l() {
          return this.o ? this.o() : null;
      }
      get headers() {
          this.u.set("X-Goog-AuthUser", this.t);
          // Use array notation to prevent minification
          const t = this.l();
          return t && this.u.set("Authorization", t), this.i && this.u.set("X-Goog-Iam-Authorization-Token", this.i), 
          this.u;
      }
  }

  /*
   * Provides user credentials required for the Firestore JavaScript SDK
   * to authenticate the user, using technique that is only available
   * to applications hosted by Google.
   */ class __PRIVATE_FirstPartyAuthCredentialsProvider {
      constructor(t, e, r) {
          this.t = t, this.i = e, this.o = r;
      }
      getToken() {
          return Promise.resolve(new __PRIVATE_FirstPartyToken(this.t, this.i, this.o));
      }
      start(t, e) {
          // Fire with initial uid.
          t.enqueueRetryable((() => e(User.FIRST_PARTY)));
      }
      shutdown() {}
      invalidateToken() {}
  }

  class AppCheckToken {
      constructor(t) {
          this.value = t, this.type = "AppCheck", this.headers = new Map, t && t.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
      }
  }

  /** AppCheck token provider for the Lite SDK. */ class __PRIVATE_LiteAppCheckTokenProvider {
      constructor(t) {
          this.h = t, this.appCheck = null, t.onInit((t => {
              this.appCheck = t;
          }));
      }
      getToken() {
          return this.appCheck ? this.appCheck.getToken().then((t => t ? (__PRIVATE_hardAssert("string" == typeof t.token), 
          new AppCheckToken(t.token)) : null)) : Promise.resolve(null);
      }
      invalidateToken() {}
      start(t, e) {}
      shutdown() {}
  }

  /**
   * Builds a CredentialsProvider depending on the type of
   * the credentials passed in.
   */
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
  class DatabaseInfo {
      /**
       * Constructs a DatabaseInfo using the provided host, databaseId and
       * persistenceKey.
       *
       * @param databaseId - The database to use.
       * @param appId - The Firebase App Id.
       * @param persistenceKey - A unique identifier for this Firestore's local
       * storage (used in conjunction with the databaseId).
       * @param host - The Firestore backend host to connect to.
       * @param ssl - Whether to use SSL when connecting.
       * @param forceLongPolling - Whether to use the forceLongPolling option
       * when using WebChannel as the network transport.
       * @param autoDetectLongPolling - Whether to use the detectBufferingProxy
       * option when using WebChannel as the network transport.
       * @param longPollingOptions Options that configure long-polling.
       * @param useFetchStreams Whether to use the Fetch API instead of
       * XMLHTTPRequest
       */
      constructor(t, e, r, n, i, s, o, a, u) {
          this.databaseId = t, this.appId = e, this.persistenceKey = r, this.host = n, this.ssl = i, 
          this.forceLongPolling = s, this.autoDetectLongPolling = o, this.longPollingOptions = a, 
          this.useFetchStreams = u;
      }
  }

  /** The default database name for a project. */
  /**
   * Represents the database ID a Firestore client is associated with.
   * @internal
   */
  class DatabaseId {
      constructor(t, e) {
          this.projectId = t, this.database = e || "(default)";
      }
      static empty() {
          return new DatabaseId("", "");
      }
      get isDefaultDatabase() {
          return "(default)" === this.database;
      }
      isEqual(t) {
          return t instanceof DatabaseId && t.projectId === this.projectId && t.database === this.database;
      }
  }

  /**
   * Path represents an ordered sequence of string segments.
   */
  class BasePath {
      constructor(t, e, r) {
          undefined === e ? e = 0 : e > t.length && fail(), undefined === r ? r = t.length - e : r > t.length - e && fail(), 
          this.segments = t, this.offset = e, this.len = r;
      }
      get length() {
          return this.len;
      }
      isEqual(t) {
          return 0 === BasePath.comparator(this, t);
      }
      child(t) {
          const e = this.segments.slice(this.offset, this.limit());
          return t instanceof BasePath ? t.forEach((t => {
              e.push(t);
          })) : e.push(t), this.construct(e);
      }
      /** The index of one past the last segment of the path. */    limit() {
          return this.offset + this.length;
      }
      popFirst(t) {
          return t = undefined === t ? 1 : t, this.construct(this.segments, this.offset + t, this.length - t);
      }
      popLast() {
          return this.construct(this.segments, this.offset, this.length - 1);
      }
      firstSegment() {
          return this.segments[this.offset];
      }
      lastSegment() {
          return this.get(this.length - 1);
      }
      get(t) {
          return this.segments[this.offset + t];
      }
      isEmpty() {
          return 0 === this.length;
      }
      isPrefixOf(t) {
          if (t.length < this.length) return false;
          for (let e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return false;
          return true;
      }
      isImmediateParentOf(t) {
          if (this.length + 1 !== t.length) return false;
          for (let e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return false;
          return true;
      }
      forEach(t) {
          for (let e = this.offset, r = this.limit(); e < r; e++) t(this.segments[e]);
      }
      toArray() {
          return this.segments.slice(this.offset, this.limit());
      }
      /**
       * Compare 2 paths segment by segment, prioritizing numeric IDs
       * (e.g., "__id123__") in numeric ascending order, followed by string
       * segments in lexicographical order.
       */    static comparator(t, e) {
          const r = Math.min(t.length, e.length);
          for (let n = 0; n < r; n++) {
              const r = BasePath.compareSegments(t.get(n), e.get(n));
              if (0 !== r) return r;
          }
          return Math.sign(t.length - e.length);
      }
      static compareSegments(t, e) {
          const r = BasePath.isNumericId(t), n = BasePath.isNumericId(e);
          return r && !n ? -1 : !r && n ? 1 : r && n ? BasePath.extractNumericId(t).compare(BasePath.extractNumericId(e)) : 
          // both non-numeric
          t < e ? -1 : t > e ? 1 : 0;
      }
      // Checks if a segment is a numeric ID (starts with "__id" and ends with "__").
      static isNumericId(t) {
          return t.startsWith("__id") && t.endsWith("__");
      }
      static extractNumericId(t) {
          return bloom_blob_es2018Exports.Integer.fromString(t.substring(4, t.length - 2));
      }
  }

  /**
   * A slash-separated path for navigating resources (documents and collections)
   * within Firestore.
   *
   * @internal
   */ class ResourcePath extends BasePath {
      construct(t, e, r) {
          return new ResourcePath(t, e, r);
      }
      canonicalString() {
          // NOTE: The client is ignorant of any path segments containing escape
          // sequences (e.g. __id123__) and just passes them through raw (they exist
          // for legacy reasons and should not be used frequently).
          return this.toArray().join("/");
      }
      toString() {
          return this.canonicalString();
      }
      /**
       * Returns a string representation of this path
       * where each path segment has been encoded with
       * `encodeURIComponent`.
       */    toUriEncodedString() {
          return this.toArray().map(encodeURIComponent).join("/");
      }
      /**
       * Creates a resource path from the given slash-delimited string. If multiple
       * arguments are provided, all components are combined. Leading and trailing
       * slashes from all components are ignored.
       */    static fromString(...t) {
          // NOTE: The client is ignorant of any path segments containing escape
          // sequences (e.g. __id123__) and just passes them through raw (they exist
          // for legacy reasons and should not be used frequently).
          const e = [];
          for (const r of t) {
              if (r.indexOf("//") >= 0) throw new FirestoreError(P, `Invalid segment (${r}). Paths must not contain // in them.`);
              // Strip leading and trailing slashed.
                          e.push(...r.split("/").filter((t => t.length > 0)));
          }
          return new ResourcePath(e);
      }
      static emptyPath() {
          return new ResourcePath([]);
      }
  }

  const N = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

  /**
   * A dot-separated path for navigating sub-objects within a document.
   * @internal
   */ class FieldPath$1 extends BasePath {
      construct(t, e, r) {
          return new FieldPath$1(t, e, r);
      }
      /**
       * Returns true if the string could be used as a segment in a field path
       * without escaping.
       */    static isValidIdentifier(t) {
          return N.test(t);
      }
      canonicalString() {
          return this.toArray().map((t => (t = t.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), 
          FieldPath$1.isValidIdentifier(t) || (t = "`" + t + "`"), t))).join(".");
      }
      toString() {
          return this.canonicalString();
      }
      /**
       * Returns true if this field references the key of a document.
       */    isKeyField() {
          return 1 === this.length && "__name__" === this.get(0);
      }
      /**
       * The field designating the key of a document.
       */    static keyField() {
          return new FieldPath$1([ "__name__" ]);
      }
      /**
       * Parses a field string from the given server-formatted string.
       *
       * - Splitting the empty string is not allowed (for now at least).
       * - Empty segments within the string (e.g. if there are two consecutive
       *   separators) are not allowed.
       *
       * TODO(b/37244157): we should make this more strict. Right now, it allows
       * non-identifier path components, even if they aren't escaped.
       */    static fromServerFormat(t) {
          const e = [];
          let r = "", n = 0;
          const __PRIVATE_addCurrentSegment = () => {
              if (0 === r.length) throw new FirestoreError(P, `Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
              e.push(r), r = "";
          };
          let i = false;
          for (;n < t.length; ) {
              const e = t[n];
              if ("\\" === e) {
                  if (n + 1 === t.length) throw new FirestoreError(P, "Path has trailing escape character: " + t);
                  const e = t[n + 1];
                  if ("\\" !== e && "." !== e && "`" !== e) throw new FirestoreError(P, "Path has invalid escape sequence: " + t);
                  r += e, n += 2;
              } else "`" === e ? (i = !i, n++) : "." !== e || i ? (r += e, n++) : (__PRIVATE_addCurrentSegment(), 
              n++);
          }
          if (__PRIVATE_addCurrentSegment(), i) throw new FirestoreError(P, "Unterminated ` in path: " + t);
          return new FieldPath$1(e);
      }
      static emptyPath() {
          return new FieldPath$1([]);
      }
  }

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
  /**
   * @internal
   */ class DocumentKey {
      constructor(t) {
          this.path = t;
      }
      static fromPath(t) {
          return new DocumentKey(ResourcePath.fromString(t));
      }
      static fromName(t) {
          return new DocumentKey(ResourcePath.fromString(t).popFirst(5));
      }
      static empty() {
          return new DocumentKey(ResourcePath.emptyPath());
      }
      get collectionGroup() {
          return this.path.popLast().lastSegment();
      }
      /** Returns true if the document is in the specified collectionId. */    hasCollectionId(t) {
          return this.path.length >= 2 && this.path.get(this.path.length - 2) === t;
      }
      /** Returns the collection group (i.e. the name of the parent collection) for this key. */    getCollectionGroup() {
          return this.path.get(this.path.length - 2);
      }
      /** Returns the fully qualified path to the parent collection. */    getCollectionPath() {
          return this.path.popLast();
      }
      isEqual(t) {
          return null !== t && 0 === ResourcePath.comparator(this.path, t.path);
      }
      toString() {
          return this.path.toString();
      }
      static comparator(t, e) {
          return ResourcePath.comparator(t.path, e.path);
      }
      static isDocumentKey(t) {
          return t.length % 2 == 0;
      }
      /**
       * Creates and returns a new document key with the given segments.
       *
       * @param segments - The segments of the path to the document
       * @returns A new instance of DocumentKey
       */    static fromSegments(t) {
          return new DocumentKey(new ResourcePath(t.slice()));
      }
  }

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
   */ function __PRIVATE_validateNonEmptyArgument(t, e, r) {
      if (!r) throw new FirestoreError(P, `Function ${t}() cannot be called with an empty ${e}.`);
  }

  /**
   * Validates that two boolean options are not set at the same time.
   * @internal
   */
  /**
   * Validates that `path` refers to a document (indicated by the fact it contains
   * an even numbers of segments).
   */
  function __PRIVATE_validateDocumentPath(t) {
      if (!DocumentKey.isDocumentKey(t)) throw new FirestoreError(P, `Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`);
  }

  /**
   * Returns true if it's a non-null object without a custom prototype
   * (i.e. excludes Array, Date, etc.).
   */
  /** Returns a string describing the type / value of the provided input. */
  function __PRIVATE_valueDescription(t) {
      if (undefined === t) return "undefined";
      if (null === t) return "null";
      if ("string" == typeof t) return t.length > 20 && (t = `${t.substring(0, 20)}...`), 
      JSON.stringify(t);
      if ("number" == typeof t || "boolean" == typeof t) return "" + t;
      if ("object" == typeof t) {
          if (t instanceof Array) return "an array";
          {
              const e = 
              /** try to get the constructor name for an object. */
              function __PRIVATE_tryGetCustomObjectType(t) {
                  if (t.constructor) return t.constructor.name;
                  return null;
              }
              /**
   * Casts `obj` to `T`, optionally unwrapping Compat types to expose the
   * underlying instance. Throws if  `obj` is not an instance of `T`.
   *
   * This cast is used in the Lite and Full SDK to verify instance types for
   * arguments passed to the public API.
   * @internal
   */ (t);
              return e ? `a custom ${e} object` : "an object";
          }
      }
      return "function" == typeof t ? "a function" : fail();
  }

  function __PRIVATE_cast(t, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  e) {
      if ("_delegate" in t && (
      // Unwrap Compat types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      t = t._delegate), !(t instanceof e)) {
          if (e.name === t.constructor.name) throw new FirestoreError(P, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
          {
              const r = __PRIVATE_valueDescription(t);
              throw new FirestoreError(P, `Expected type '${e.name}', but it was: ${r}`);
          }
      }
      return t;
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
  /**
   * Compares two `ExperimentalLongPollingOptions` objects for equality.
   */
  /**
   * Creates and returns a new `ExperimentalLongPollingOptions` with the same
   * option values as the given instance.
   */
  function __PRIVATE_cloneLongPollingOptions(t) {
      const e = {};
      return undefined !== t.timeoutSeconds && (e.timeoutSeconds = t.timeoutSeconds), e;
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
  /**
   * The value returned from the most recent invocation of
   * `generateUniqueDebugId()`, or null if it has never been invoked.
   */ let O = null;

  /**
   * Generates and returns an initial value for `lastUniqueDebugId`.
   *
   * The returned value is randomly selected from a range of integers that are
   * represented as 8 hexadecimal digits. This means that (within reason) any
   * numbers generated by incrementing the returned number by 1 will also be
   * represented by 8 hexadecimal digits. This leads to all "IDs" having the same
   * length when converted to a hexadecimal string, making reading logs containing
   * these IDs easier to follow. And since the return value is randomly selected
   * it will help to differentiate between logs from different executions.
   */
  /**
   * Generates and returns a unique ID as a hexadecimal string.
   *
   * The returned ID is intended to be used in debug logging messages to help
   * correlate log messages that may be spatially separated in the logs, but
   * logically related. For example, a network connection could include the same
   * "debug ID" string in all of its log messages to help trace a specific
   * connection over time.
   *
   * @return the 10-character generated ID (e.g. "0xa1b2c3d4").
   */
  function __PRIVATE_generateUniqueDebugId() {
      return null === O ? O = function __PRIVATE_generateInitialUniqueDebugId() {
          return 268435456 + Math.round(2147483648 * Math.random());
      }() : O++, "0x" + O.toString(16);
  }

  /** Returns whether the value represents -0. */ function __PRIVATE_isNegativeZero(t) {
      // Detect if the value is -0.0. Based on polyfill from
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
      return 0 === t && 1 / t == -1 / 0;
  }

  /**
   * Returns whether a value is an integer and in the safe integer range
   * @param value - The value to test for being an integer and in the safe range
   */
  /**
   * @license
   * Copyright 2020 Google LLC
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
  const q = {
      BatchGetDocuments: "batchGet",
      Commit: "commit",
      RunQuery: "runQuery",
      RunAggregationQuery: "runAggregationQuery"
  };

  /**
   * Maps RPC names to the corresponding REST endpoint name.
   *
   * We use array notation to avoid mangling.
   */
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
  /**
   * Error Codes describing the different ways GRPC can fail. These are copied
   * directly from GRPC's sources here:
   *
   * https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
   *
   * Important! The names of these identifiers matter because the string forms
   * are used for reverse lookups from the webchannel stream. Do NOT change the
   * names of these identifiers or change this into a const enum.
   */
  var B, $;

  /**
   * Converts an HTTP Status Code to the equivalent error code.
   *
   * @param status - An HTTP Status Code, like 200, 404, 503, etc.
   * @returns The equivalent Code. Unknown status codes are mapped to
   *     Code.UNKNOWN.
   */
  function __PRIVATE_mapCodeFromHttpStatus(t) {
      if (undefined === t) return __PRIVATE_logError("RPC_ERROR", "HTTP error has no status"), 
      T;
      // The canonical error codes for Google APIs [1] specify mapping onto HTTP
      // status codes but the mapping is not bijective. In each case of ambiguity
      // this function chooses a primary error.
      
      // [1]
      // https://github.com/googleapis/googleapis/blob/master/google/rpc/code.proto
          switch (t) {
        case 200:
          // OK
          return m;

        case 400:
          // Bad Request
          return g;

          // Other possibilities based on the forward mapping
          // return Code.INVALID_ARGUMENT;
          // return Code.OUT_OF_RANGE;
                case 401:
          // Unauthorized
          return y;

        case 403:
          // Forbidden
          return p;

        case 404:
          // Not Found
          return I;

        case 409:
          // Conflict
          return F;

          // Other possibilities:
          // return Code.ALREADY_EXISTS;
                case 416:
          // Range Not Satisfiable
          return v;

        case 429:
          // Too Many Requests
          return w;

        case 499:
          // Client Closed Request
          return A;

        case 500:
          // Internal Server Error
          return T;

          // Other possibilities:
          // return Code.INTERNAL;
          // return Code.DATA_LOSS;
                case 501:
          // Unimplemented
          return D;

        case 503:
          // Service Unavailable
          return C;

        case 504:
          // Gateway Timeout
          return R;

        default:
          return t >= 200 && t < 300 ? m : t >= 400 && t < 500 ? g : t >= 500 && t < 600 ? b : T;
      }
  }

  /**
   * @license
   * Copyright 2020 Google LLC
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
   * A Rest-based connection that relies on the native HTTP stack
   * (e.g. `fetch` or a polyfill).
   */ ($ = B || (B = {}))[$.OK = 0] = "OK", $[$.CANCELLED = 1] = "CANCELLED", $[$.UNKNOWN = 2] = "UNKNOWN", 
  $[$.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", $[$.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", 
  $[$.NOT_FOUND = 5] = "NOT_FOUND", $[$.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", $[$.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", 
  $[$.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", $[$.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", 
  $[$.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", $[$.ABORTED = 10] = "ABORTED", 
  $[$.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", $[$.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", 
  $[$.INTERNAL = 13] = "INTERNAL", $[$.UNAVAILABLE = 14] = "UNAVAILABLE", $[$.DATA_LOSS = 15] = "DATA_LOSS";

  class __PRIVATE_FetchConnection extends 
  /**
   * Base class for all Rest-based connections to the backend (WebChannel and
   * HTTP).
   */
  class __PRIVATE_RestConnection {
      get m() {
          // Both `invokeRPC()` and `invokeStreamingRPC()` use their `path` arguments to determine
          // where to run the query, and expect the `request` to NOT specify the "path".
          return false;
      }
      constructor(t) {
          this.databaseInfo = t, this.databaseId = t.databaseId;
          const e = t.ssl ? "https" : "http", r = encodeURIComponent(this.databaseId.projectId), n = encodeURIComponent(this.databaseId.database);
          this.A = e + "://" + t.host, this.T = `projects/${r}/databases/${n}`, this.P = "(default)" === this.databaseId.database ? `project_id=${r}` : `project_id=${r}&database_id=${n}`;
      }
      R(t, e, r, n, i) {
          const s = __PRIVATE_generateUniqueDebugId(), o = this.I(t, e.toUriEncodedString());
          __PRIVATE_logDebug("RestConnection", `Sending RPC '${t}' ${s}:`, o, r);
          const a = {
              "google-cloud-resource-prefix": this.T,
              "x-goog-request-params": this.P
          };
          return this.V(a, n, i), this.p(t, o, a, r).then((e => (__PRIVATE_logDebug("RestConnection", `Received RPC '${t}' ${s}: `, e), 
          e)), (e => {
              throw __PRIVATE_logWarn("RestConnection", `RPC '${t}' ${s} failed with error: `, e, "url: ", o, "request:", r), 
              e;
          }));
      }
      g(t, e, r, n, i, s) {
          // The REST API automatically aggregates all of the streamed results, so we
          // can just use the normal invoke() method.
          return this.R(t, e, r, n, i);
      }
      /**
       * Modifies the headers for a request, adding any authorization token if
       * present and any additional headers for the request.
       */    V(t, e, r) {
          t["X-Goog-Api-Client"] = 
          // SDK_VERSION is updated to different value at runtime depending on the entry point,
          // so we need to get its value when we need it in a function.
          function __PRIVATE_getGoogApiClientValue() {
              return "gl-js/ fire/" + f;
          }(), 
          // Content-Type: text/plain will avoid preflight requests which might
          // mess with CORS and redirects by proxies. If we add custom headers
          // we will need to change this code to potentially use the $httpOverwrite
          // parameter supported by ESF to avoid triggering preflight requests.
          t["Content-Type"] = "text/plain", this.databaseInfo.appId && (t["X-Firebase-GMPID"] = this.databaseInfo.appId), 
          e && e.headers.forEach(((e, r) => t[r] = e)), r && r.headers.forEach(((e, r) => t[r] = e));
      }
      I(t, e) {
          const r = q[t];
          return `${this.A}/v1/${e}:${r}`;
      }
      /**
       * Closes and cleans up any resources associated with the connection. This
       * implementation is a no-op because there are no resources associated
       * with the RestConnection that need to be cleaned up.
       */    terminate() {
          // No-op
      }
  } {
      F(t, e) {
          throw new Error("Not supported by FetchConnection");
      }
      async p(t, e, r, n) {
          var i;
          const s = JSON.stringify(n);
          let o;
          try {
              o = await fetch(e, {
                  method: "POST",
                  headers: r,
                  body: s
              });
          } catch (t) {
              const e = t;
              throw new FirestoreError(__PRIVATE_mapCodeFromHttpStatus(e.status), "Request failed with error: " + e.statusText);
          }
          if (!o.ok) {
              let t = await o.json();
              Array.isArray(t) && (t = t[0]);
              const e = null === (i = null == t ? undefined : t.error) || undefined === i ? undefined : i.message;
              throw new FirestoreError(__PRIVATE_mapCodeFromHttpStatus(o.status), `Request failed with error: ${null != e ? e : o.statusText}`);
          }
          return o.json();
      }
  }

  /**
   * @license
   * Copyright 2020 Google LLC
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
   * Generates `nBytes` of random bytes.
   *
   * If `nBytes < 0` , an error will be thrown.
   */ function __PRIVATE_randomBytes(t) {
      // Polyfills for IE and WebWorker by using `self` and `msCrypto` when `crypto` is not available.
      const e = 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "undefined" != typeof self && (self.crypto || self.msCrypto), r = new Uint8Array(t);
      if (e && "function" == typeof e.getRandomValues) e.getRandomValues(r); else 
      // Falls back to Math.random
      for (let e = 0; e < t; e++) r[e] = Math.floor(256 * Math.random());
      return r;
  }

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
  /**
   * A utility class for generating unique alphanumeric IDs of a specified length.
   *
   * @internal
   * Exported internally for testing purposes.
   */ class __PRIVATE_AutoId {
      static newId() {
          // Alphanumeric characters
          const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", e = Math.floor(256 / t.length) * t.length;
          // The largest byte value that is a multiple of `char.length`.
                  let r = "";
          for (;r.length < 20; ) {
              const n = __PRIVATE_randomBytes(40);
              for (let i = 0; i < n.length; ++i) 
              // Only accept values that are [0, maxMultiple), this ensures they can
              // be evenly mapped to indices of `chars` via a modulo operation.
              r.length < 20 && n[i] < e && (r += t.charAt(n[i] % t.length));
          }
          return r;
      }
  }

  function __PRIVATE_primitiveComparator(t, e) {
      return t < e ? -1 : t > e ? 1 : 0;
  }

  /** Helper to compare arrays using isEqual(). */ function __PRIVATE_arrayEquals(t, e, r) {
      return t.length === e.length && t.every(((t, n) => r(t, e[n])));
  }

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
   */ function __PRIVATE_objectSize(t) {
      let e = 0;
      for (const r in t) Object.prototype.hasOwnProperty.call(t, r) && e++;
      return e;
  }

  function forEach(t, e) {
      for (const r in t) Object.prototype.hasOwnProperty.call(t, r) && e(r, t[r]);
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
  /**
   * An error encountered while decoding base64 string.
   */
  class __PRIVATE_Base64DecodeError extends Error {
      constructor() {
          super(...arguments), this.name = "Base64DecodeError";
      }
  }

  /**
   * @license
   * Copyright 2020 Google LLC
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
  /** Converts a Base64 encoded string to a binary string. */
  /**
   * @license
   * Copyright 2020 Google LLC
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
   * Immutable class that represents a "proto" byte string.
   *
   * Proto byte strings can either be Base64-encoded strings or Uint8Arrays when
   * sent on the wire. This class abstracts away this differentiation by holding
   * the proto byte string in a common class that must be converted into a string
   * before being sent as a proto.
   * @internal
   */
  class ByteString {
      constructor(t) {
          this.binaryString = t;
      }
      static fromBase64String(t) {
          const e = function __PRIVATE_decodeBase64(t) {
              try {
                  return atob(t);
              } catch (t) {
                  // Check that `DOMException` is defined before using it to avoid
                  // "ReferenceError: Property 'DOMException' doesn't exist" in react-native.
                  // (https://github.com/firebase/firebase-js-sdk/issues/7115)
                  throw "undefined" != typeof DOMException && t instanceof DOMException ? new __PRIVATE_Base64DecodeError("Invalid base64 string: " + t) : t;
              }
          }
          /** Converts a binary string to a Base64 encoded string. */ (t);
          return new ByteString(e);
      }
      static fromUint8Array(t) {
          // TODO(indexing); Remove the copy of the byte string here as this method
          // is frequently called during indexing.
          const e = 
          /**
   * Helper function to convert an Uint8array to a binary string.
   */
          function __PRIVATE_binaryStringFromUint8Array(t) {
              let e = "";
              for (let r = 0; r < t.length; ++r) e += String.fromCharCode(t[r]);
              return e;
          }
          /**
   * Helper function to convert a binary string to an Uint8Array.
   */ (t);
          return new ByteString(e);
      }
      [Symbol.iterator]() {
          let t = 0;
          return {
              next: () => t < this.binaryString.length ? {
                  value: this.binaryString.charCodeAt(t++),
                  done: false
              } : {
                  value: undefined,
                  done: true
              }
          };
      }
      toBase64() {
          return function __PRIVATE_encodeBase64(t) {
              return btoa(t);
          }(this.binaryString);
      }
      toUint8Array() {
          return function __PRIVATE_uint8ArrayFromBinaryString(t) {
              const e = new Uint8Array(t.length);
              for (let r = 0; r < t.length; r++) e[r] = t.charCodeAt(r);
              return e;
          }
          /**
   * @license
   * Copyright 2020 Google LLC
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
          // A RegExp matching ISO 8601 UTC timestamps with optional fraction.
          (this.binaryString);
      }
      approximateByteSize() {
          return 2 * this.binaryString.length;
      }
      compareTo(t) {
          return __PRIVATE_primitiveComparator(this.binaryString, t.binaryString);
      }
      isEqual(t) {
          return this.binaryString === t.binaryString;
      }
  }

  ByteString.EMPTY_BYTE_STRING = new ByteString("");

  const Q = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);

  /**
   * Converts the possible Proto values for a timestamp value into a "seconds and
   * nanos" representation.
   */ function __PRIVATE_normalizeTimestamp(t) {
      // The json interface (for the browser) will return an iso timestamp string,
      // while the proto js library (for node) will return a
      // google.protobuf.Timestamp instance.
      if (__PRIVATE_hardAssert(!!t), "string" == typeof t) {
          // The date string can have higher precision (nanos) than the Date class
          // (millis), so we do some custom parsing here.
          // Parse the nanos right out of the string.
          let e = 0;
          const r = Q.exec(t);
          if (__PRIVATE_hardAssert(!!r), r[1]) {
              // Pad the fraction out to 9 digits (nanos).
              let t = r[1];
              t = (t + "000000000").substr(0, 9), e = Number(t);
          }
          // Parse the date to get the seconds.
                  const n = new Date(t);
          return {
              seconds: Math.floor(n.getTime() / 1e3),
              nanos: e
          };
      }
      return {
          seconds: __PRIVATE_normalizeNumber(t.seconds),
          nanos: __PRIVATE_normalizeNumber(t.nanos)
      };
  }

  /**
   * Converts the possible Proto types for numbers into a JavaScript number.
   * Returns 0 if the value is not numeric.
   */ function __PRIVATE_normalizeNumber(t) {
      // TODO(bjornick): Handle int64 greater than 53 bits.
      return "number" == typeof t ? t : "string" == typeof t ? Number(t) : 0;
  }

  /** Converts the possible Proto types for Blobs into a ByteString. */ function __PRIVATE_normalizeByteString(t) {
      return "string" == typeof t ? ByteString.fromBase64String(t) : ByteString.fromUint8Array(t);
  }

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
  // The earliest date supported by Firestore timestamps (0001-01-01T00:00:00Z).
  /**
   * A `Timestamp` represents a point in time independent of any time zone or
   * calendar, represented as seconds and fractions of seconds at nanosecond
   * resolution in UTC Epoch time.
   *
   * It is encoded using the Proleptic Gregorian Calendar which extends the
   * Gregorian calendar backwards to year one. It is encoded assuming all minutes
   * are 60 seconds long, i.e. leap seconds are "smeared" so that no leap second
   * table is needed for interpretation. Range is from 0001-01-01T00:00:00Z to
   * 9999-12-31T23:59:59.999999999Z.
   *
   * For examples and further specifications, refer to the
   * {@link https://github.com/google/protobuf/blob/master/src/google/protobuf/timestamp.proto | Timestamp definition}.
   */
  class Timestamp {
      /**
       * Creates a new timestamp with the current date, with millisecond precision.
       *
       * @returns a new timestamp representing the current date.
       */
      static now() {
          return Timestamp.fromMillis(Date.now());
      }
      /**
       * Creates a new timestamp from the given date.
       *
       * @param date - The date to initialize the `Timestamp` from.
       * @returns A new `Timestamp` representing the same point in time as the given
       *     date.
       */    static fromDate(t) {
          return Timestamp.fromMillis(t.getTime());
      }
      /**
       * Creates a new timestamp from the given number of milliseconds.
       *
       * @param milliseconds - Number of milliseconds since Unix epoch
       *     1970-01-01T00:00:00Z.
       * @returns A new `Timestamp` representing the same point in time as the given
       *     number of milliseconds.
       */    static fromMillis(t) {
          const e = Math.floor(t / 1e3), r = Math.floor(1e6 * (t - 1e3 * e));
          return new Timestamp(e, r);
      }
      /**
       * Creates a new timestamp.
       *
       * @param seconds - The number of seconds of UTC time since Unix epoch
       *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
       *     9999-12-31T23:59:59Z inclusive.
       * @param nanoseconds - The non-negative fractions of a second at nanosecond
       *     resolution. Negative second values with fractions must still have
       *     non-negative nanoseconds values that count forward in time. Must be
       *     from 0 to 999,999,999 inclusive.
       */    constructor(
      /**
       * The number of seconds of UTC time since Unix epoch 1970-01-01T00:00:00Z.
       */
      t, 
      /**
       * The fractions of a second at nanosecond resolution.*
       */
      e) {
          if (this.seconds = t, this.nanoseconds = e, e < 0) throw new FirestoreError(P, "Timestamp nanoseconds out of range: " + e);
          if (e >= 1e9) throw new FirestoreError(P, "Timestamp nanoseconds out of range: " + e);
          if (t < -62135596800) throw new FirestoreError(P, "Timestamp seconds out of range: " + t);
          // This will break in the year 10,000.
                  if (t >= 253402300800) throw new FirestoreError(P, "Timestamp seconds out of range: " + t);
      }
      /**
       * Converts a `Timestamp` to a JavaScript `Date` object. This conversion
       * causes a loss of precision since `Date` objects only support millisecond
       * precision.
       *
       * @returns JavaScript `Date` object representing the same point in time as
       *     this `Timestamp`, with millisecond precision.
       */    toDate() {
          return new Date(this.toMillis());
      }
      /**
       * Converts a `Timestamp` to a numeric timestamp (in milliseconds since
       * epoch). This operation causes a loss of precision.
       *
       * @returns The point in time corresponding to this timestamp, represented as
       *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
       */    toMillis() {
          return 1e3 * this.seconds + this.nanoseconds / 1e6;
      }
      _compareTo(t) {
          return this.seconds === t.seconds ? __PRIVATE_primitiveComparator(this.nanoseconds, t.nanoseconds) : __PRIVATE_primitiveComparator(this.seconds, t.seconds);
      }
      /**
       * Returns true if this `Timestamp` is equal to the provided one.
       *
       * @param other - The `Timestamp` to compare against.
       * @returns true if this `Timestamp` is equal to the provided one.
       */    isEqual(t) {
          return t.seconds === this.seconds && t.nanoseconds === this.nanoseconds;
      }
      /** Returns a textual representation of this `Timestamp`. */    toString() {
          return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
      }
      /** Returns a JSON-serializable representation of this `Timestamp`. */    toJSON() {
          return {
              seconds: this.seconds,
              nanoseconds: this.nanoseconds
          };
      }
      /**
       * Converts this object to a primitive string, which allows `Timestamp` objects
       * to be compared using the `>`, `<=`, `>=` and `>` operators.
       */    valueOf() {
          // This method returns a string of the form <seconds>.<nanoseconds> where
          // <seconds> is translated to have a non-negative value and both <seconds>
          // and <nanoseconds> are left-padded with zeroes to be a consistent length.
          // Strings with this format then have a lexicographical ordering that matches
          // the expected ordering. The <seconds> translation is done to avoid having
          // a leading negative sign (i.e. a leading '-' character) in its string
          // representation, which would affect its lexicographical ordering.
          const t = this.seconds - -62135596800;
          // Note: Up to 12 decimal digits are required to represent all valid
          // 'seconds' values.
                  return String(t).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
      }
  }

  /**
   * @license
   * Copyright 2020 Google LLC
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
   * Represents a locally-applied ServerTimestamp.
   *
   * Server Timestamps are backed by MapValues that contain an internal field
   * `__type__` with a value of `server_timestamp`. The previous value and local
   * write time are stored in its `__previous_value__` and `__local_write_time__`
   * fields respectively.
   *
   * Notes:
   * - ServerTimestampValue instances are created as the result of applying a
   *   transform. They can only exist in the local view of a document. Therefore
   *   they do not need to be parsed or serialized.
   * - When evaluated locally (e.g. for snapshot.data()), they by default
   *   evaluate to `null`. This behavior can be configured by passing custom
   *   FieldValueOptions to value().
   * - With respect to other ServerTimestampValues, they sort by their
   *   localWriteTime.
   */ function __PRIVATE_isServerTimestamp(t) {
      var e, r;
      return "server_timestamp" === (null === (r = ((null === (e = null == t ? undefined : t.mapValue) || undefined === e ? undefined : e.fields) || {}).__type__) || undefined === r ? undefined : r.stringValue);
  }

  /**
   * Returns the value of the field before this ServerTimestamp was set.
   *
   * Preserving the previous values allows the user to display the last resoled
   * value until the backend responds with the timestamp.
   */ function __PRIVATE_getPreviousValue(t) {
      const e = t.mapValue.fields.__previous_value__;
      return __PRIVATE_isServerTimestamp(e) ? __PRIVATE_getPreviousValue(e) : e;
  }

  /**
   * Returns the local time at which this timestamp was first set.
   */ function __PRIVATE_getLocalWriteTime(t) {
      const e = __PRIVATE_normalizeTimestamp(t.mapValue.fields.__local_write_time__.timestampValue);
      return new Timestamp(e.seconds, e.nanos);
  }

  /** Extracts the backend's type order for the provided value. */
  function __PRIVATE_typeOrder(t) {
      return "nullValue" in t ? 0 /* TypeOrder.NullValue */ : "booleanValue" in t ? 1 /* TypeOrder.BooleanValue */ : "integerValue" in t || "doubleValue" in t ? 2 /* TypeOrder.NumberValue */ : "timestampValue" in t ? 3 /* TypeOrder.TimestampValue */ : "stringValue" in t ? 5 /* TypeOrder.StringValue */ : "bytesValue" in t ? 6 /* TypeOrder.BlobValue */ : "referenceValue" in t ? 7 /* TypeOrder.RefValue */ : "geoPointValue" in t ? 8 /* TypeOrder.GeoPointValue */ : "arrayValue" in t ? 9 /* TypeOrder.ArrayValue */ : "mapValue" in t ? __PRIVATE_isServerTimestamp(t) ? 4 /* TypeOrder.ServerTimestampValue */ : 
      /** Returns true if the Value represents the canonical {@link #MAX_VALUE} . */
      function __PRIVATE_isMaxValue(t) {
          return "__max__" === (((t.mapValue || {}).fields || {}).__type__ || {}).stringValue;
      }
      /**
   * @license
   * Copyright 2022 Google LLC
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
   * Represents a bound of a query.
   *
   * The bound is specified with the given components representing a position and
   * whether it's just before or just after the position (relative to whatever the
   * query order is).
   *
   * The position represents a logical index position for a query. It's a prefix
   * of values for the (potentially implicit) order by clauses of a query.
   *
   * Bound provides a function to determine whether a document comes before or
   * after a bound. This is influenced by whether the position is just before or
   * just after the provided values.
   */ (t) ? 9007199254740991 /* TypeOrder.MaxValue */ : 
      /** Returns true if `value` is a VetorValue. */
      function __PRIVATE_isVectorValue(t) {
          var e, r;
          return "__vector__" === (null === (r = ((null === (e = null == t ? undefined : t.mapValue) || undefined === e ? undefined : e.fields) || {}).__type__) || undefined === r ? undefined : r.stringValue);
      }
      /** Creates a deep copy of `source`. */ (t) ? 10 /* TypeOrder.VectorValue */ : 11 /* TypeOrder.ObjectValue */ : fail();
  }

  /** Tests `left` and `right` for equality based on the backend semantics. */ function __PRIVATE_valueEquals(t, e) {
      if (t === e) return true;
      const r = __PRIVATE_typeOrder(t);
      if (r !== __PRIVATE_typeOrder(e)) return false;
      switch (r) {
        case 0 /* TypeOrder.NullValue */ :
        case 9007199254740991 /* TypeOrder.MaxValue */ :
          return true;

        case 1 /* TypeOrder.BooleanValue */ :
          return t.booleanValue === e.booleanValue;

        case 4 /* TypeOrder.ServerTimestampValue */ :
          return __PRIVATE_getLocalWriteTime(t).isEqual(__PRIVATE_getLocalWriteTime(e));

        case 3 /* TypeOrder.TimestampValue */ :
          return function __PRIVATE_timestampEquals(t, e) {
              if ("string" == typeof t.timestampValue && "string" == typeof e.timestampValue && t.timestampValue.length === e.timestampValue.length) 
              // Use string equality for ISO 8601 timestamps
              return t.timestampValue === e.timestampValue;
              const r = __PRIVATE_normalizeTimestamp(t.timestampValue), n = __PRIVATE_normalizeTimestamp(e.timestampValue);
              return r.seconds === n.seconds && r.nanos === n.nanos;
          }(t, e);

        case 5 /* TypeOrder.StringValue */ :
          return t.stringValue === e.stringValue;

        case 6 /* TypeOrder.BlobValue */ :
          return function __PRIVATE_blobEquals(t, e) {
              return __PRIVATE_normalizeByteString(t.bytesValue).isEqual(__PRIVATE_normalizeByteString(e.bytesValue));
          }(t, e);

        case 7 /* TypeOrder.RefValue */ :
          return t.referenceValue === e.referenceValue;

        case 8 /* TypeOrder.GeoPointValue */ :
          return function __PRIVATE_geoPointEquals(t, e) {
              return __PRIVATE_normalizeNumber(t.geoPointValue.latitude) === __PRIVATE_normalizeNumber(e.geoPointValue.latitude) && __PRIVATE_normalizeNumber(t.geoPointValue.longitude) === __PRIVATE_normalizeNumber(e.geoPointValue.longitude);
          }(t, e);

        case 2 /* TypeOrder.NumberValue */ :
          return function __PRIVATE_numberEquals(t, e) {
              if ("integerValue" in t && "integerValue" in e) return __PRIVATE_normalizeNumber(t.integerValue) === __PRIVATE_normalizeNumber(e.integerValue);
              if ("doubleValue" in t && "doubleValue" in e) {
                  const r = __PRIVATE_normalizeNumber(t.doubleValue), n = __PRIVATE_normalizeNumber(e.doubleValue);
                  return r === n ? __PRIVATE_isNegativeZero(r) === __PRIVATE_isNegativeZero(n) : isNaN(r) && isNaN(n);
              }
              return false;
          }(t, e);

        case 9 /* TypeOrder.ArrayValue */ :
          return __PRIVATE_arrayEquals(t.arrayValue.values || [], e.arrayValue.values || [], __PRIVATE_valueEquals);

        case 10 /* TypeOrder.VectorValue */ :
        case 11 /* TypeOrder.ObjectValue */ :
          return function __PRIVATE_objectEquals(t, e) {
              const r = t.mapValue.fields || {}, n = e.mapValue.fields || {};
              if (__PRIVATE_objectSize(r) !== __PRIVATE_objectSize(n)) return false;
              for (const t in r) if (r.hasOwnProperty(t) && (undefined === n[t] || !__PRIVATE_valueEquals(r[t], n[t]))) return false;
              return true;
          }
          /** Returns true if the ArrayValue contains the specified element. */ (t, e);

        default:
          return fail();
      }
  }

  /** Returns true if `value` is a MapValue. */ function __PRIVATE_isMapValue(t) {
      return !!t && "mapValue" in t;
  }

  function __PRIVATE_deepClone(t) {
      if (t.geoPointValue) return {
          geoPointValue: Object.assign({}, t.geoPointValue)
      };
      if (t.timestampValue && "object" == typeof t.timestampValue) return {
          timestampValue: Object.assign({}, t.timestampValue)
      };
      if (t.mapValue) {
          const e = {
              mapValue: {
                  fields: {}
              }
          };
          return forEach(t.mapValue.fields, ((t, r) => e.mapValue.fields[t] = __PRIVATE_deepClone(r))), 
          e;
      }
      if (t.arrayValue) {
          const e = {
              arrayValue: {
                  values: []
              }
          };
          for (let r = 0; r < (t.arrayValue.values || []).length; ++r) e.arrayValue.values[r] = __PRIVATE_deepClone(t.arrayValue.values[r]);
          return e;
      }
      return Object.assign({}, t);
  }

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
  /**
   * A version of a document in Firestore. This corresponds to the version
   * timestamp, such as update_time or read_time.
   */ class SnapshotVersion {
      static fromTimestamp(t) {
          return new SnapshotVersion(t);
      }
      static min() {
          return new SnapshotVersion(new Timestamp(0, 0));
      }
      static max() {
          return new SnapshotVersion(new Timestamp(253402300799, 999999999));
      }
      constructor(t) {
          this.timestamp = t;
      }
      compareTo(t) {
          return this.timestamp._compareTo(t.timestamp);
      }
      isEqual(t) {
          return this.timestamp.isEqual(t.timestamp);
      }
      /** Returns a number representation of the version for use in spec tests. */    toMicroseconds() {
          // Convert to microseconds.
          return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
      }
      toString() {
          return "SnapshotVersion(" + this.timestamp.toString() + ")";
      }
      toTimestamp() {
          return this.timestamp;
      }
  }

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
  /**
   * An ObjectValue represents a MapValue in the Firestore Proto and offers the
   * ability to add and remove fields (via the ObjectValueBuilder).
   */ class ObjectValue {
      constructor(t) {
          this.value = t;
      }
      static empty() {
          return new ObjectValue({
              mapValue: {}
          });
      }
      /**
       * Returns the value at the given path or null.
       *
       * @param path - the path to search
       * @returns The value at the path or null if the path is not set.
       */    field(t) {
          if (t.isEmpty()) return this.value;
          {
              let e = this.value;
              for (let r = 0; r < t.length - 1; ++r) if (e = (e.mapValue.fields || {})[t.get(r)], 
              !__PRIVATE_isMapValue(e)) return null;
              return e = (e.mapValue.fields || {})[t.lastSegment()], e || null;
          }
      }
      /**
       * Sets the field to the provided value.
       *
       * @param path - The field path to set.
       * @param value - The value to set.
       */    set(t, e) {
          this.getFieldsMap(t.popLast())[t.lastSegment()] = __PRIVATE_deepClone(e);
      }
      /**
       * Sets the provided fields to the provided values.
       *
       * @param data - A map of fields to values (or null for deletes).
       */    setAll(t) {
          let e = FieldPath$1.emptyPath(), r = {}, n = [];
          t.forEach(((t, i) => {
              if (!e.isImmediateParentOf(i)) {
                  // Insert the accumulated changes at this parent location
                  const t = this.getFieldsMap(e);
                  this.applyChanges(t, r, n), r = {}, n = [], e = i.popLast();
              }
              t ? r[i.lastSegment()] = __PRIVATE_deepClone(t) : n.push(i.lastSegment());
          }));
          const i = this.getFieldsMap(e);
          this.applyChanges(i, r, n);
      }
      /**
       * Removes the field at the specified path. If there is no field at the
       * specified path, nothing is changed.
       *
       * @param path - The field path to remove.
       */    delete(t) {
          const e = this.field(t.popLast());
          __PRIVATE_isMapValue(e) && e.mapValue.fields && delete e.mapValue.fields[t.lastSegment()];
      }
      isEqual(t) {
          return __PRIVATE_valueEquals(this.value, t.value);
      }
      /**
       * Returns the map that contains the leaf element of `path`. If the parent
       * entry does not yet exist, or if it is not a map, a new map will be created.
       */    getFieldsMap(t) {
          let e = this.value;
          e.mapValue.fields || (e.mapValue = {
              fields: {}
          });
          for (let r = 0; r < t.length; ++r) {
              let n = e.mapValue.fields[t.get(r)];
              __PRIVATE_isMapValue(n) && n.mapValue.fields || (n = {
                  mapValue: {
                      fields: {}
                  }
              }, e.mapValue.fields[t.get(r)] = n), e = n;
          }
          return e.mapValue.fields;
      }
      /**
       * Modifies `fieldsMap` by adding, replacing or deleting the specified
       * entries.
       */    applyChanges(t, e, r) {
          forEach(e, ((e, r) => t[e] = r));
          for (const e of r) delete t[e];
      }
      clone() {
          return new ObjectValue(__PRIVATE_deepClone(this.value));
      }
  }

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
  /**
   * Represents a document in Firestore with a key, version, data and whether it
   * has local mutations applied to it.
   *
   * Documents can transition between states via `convertToFoundDocument()`,
   * `convertToNoDocument()` and `convertToUnknownDocument()`. If a document does
   * not transition to one of these states even after all mutations have been
   * applied, `isValidDocument()` returns false and the document should be removed
   * from all views.
   */ class MutableDocument {
      constructor(t, e, r, n, i, s, o) {
          this.key = t, this.documentType = e, this.version = r, this.readTime = n, this.createTime = i, 
          this.data = s, this.documentState = o;
      }
      /**
       * Creates a document with no known version or data, but which can serve as
       * base document for mutations.
       */    static newInvalidDocument(t) {
          return new MutableDocument(t, 0 /* DocumentType.INVALID */ , 
          /* version */ SnapshotVersion.min(), 
          /* readTime */ SnapshotVersion.min(), 
          /* createTime */ SnapshotVersion.min(), ObjectValue.empty(), 0 /* DocumentState.SYNCED */);
      }
      /**
       * Creates a new document that is known to exist with the given data at the
       * given version.
       */    static newFoundDocument(t, e, r, n) {
          return new MutableDocument(t, 1 /* DocumentType.FOUND_DOCUMENT */ , 
          /* version */ e, 
          /* readTime */ SnapshotVersion.min(), 
          /* createTime */ r, n, 0 /* DocumentState.SYNCED */);
      }
      /** Creates a new document that is known to not exist at the given version. */    static newNoDocument(t, e) {
          return new MutableDocument(t, 2 /* DocumentType.NO_DOCUMENT */ , 
          /* version */ e, 
          /* readTime */ SnapshotVersion.min(), 
          /* createTime */ SnapshotVersion.min(), ObjectValue.empty(), 0 /* DocumentState.SYNCED */);
      }
      /**
       * Creates a new document that is known to exist at the given version but
       * whose data is not known (e.g. a document that was updated without a known
       * base document).
       */    static newUnknownDocument(t, e) {
          return new MutableDocument(t, 3 /* DocumentType.UNKNOWN_DOCUMENT */ , 
          /* version */ e, 
          /* readTime */ SnapshotVersion.min(), 
          /* createTime */ SnapshotVersion.min(), ObjectValue.empty(), 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */);
      }
      /**
       * Changes the document type to indicate that it exists and that its version
       * and data are known.
       */    convertToFoundDocument(t, e) {
          // If a document is switching state from being an invalid or deleted
          // document to a valid (FOUND_DOCUMENT) document, either due to receiving an
          // update from Watch or due to applying a local set mutation on top
          // of a deleted document, our best guess about its createTime would be the
          // version at which the document transitioned to a FOUND_DOCUMENT.
          return !this.createTime.isEqual(SnapshotVersion.min()) || 2 /* DocumentType.NO_DOCUMENT */ !== this.documentType && 0 /* DocumentType.INVALID */ !== this.documentType || (this.createTime = t), 
          this.version = t, this.documentType = 1 /* DocumentType.FOUND_DOCUMENT */ , this.data = e, 
          this.documentState = 0 /* DocumentState.SYNCED */ , this;
      }
      /**
       * Changes the document type to indicate that it doesn't exist at the given
       * version.
       */    convertToNoDocument(t) {
          return this.version = t, this.documentType = 2 /* DocumentType.NO_DOCUMENT */ , 
          this.data = ObjectValue.empty(), this.documentState = 0 /* DocumentState.SYNCED */ , 
          this;
      }
      /**
       * Changes the document type to indicate that it exists at a given version but
       * that its data is not known (e.g. a document that was updated without a known
       * base document).
       */    convertToUnknownDocument(t) {
          return this.version = t, this.documentType = 3 /* DocumentType.UNKNOWN_DOCUMENT */ , 
          this.data = ObjectValue.empty(), this.documentState = 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */ , 
          this;
      }
      setHasCommittedMutations() {
          return this.documentState = 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */ , this;
      }
      setHasLocalMutations() {
          return this.documentState = 1 /* DocumentState.HAS_LOCAL_MUTATIONS */ , this.version = SnapshotVersion.min(), 
          this;
      }
      setReadTime(t) {
          return this.readTime = t, this;
      }
      get hasLocalMutations() {
          return 1 /* DocumentState.HAS_LOCAL_MUTATIONS */ === this.documentState;
      }
      get hasCommittedMutations() {
          return 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */ === this.documentState;
      }
      get hasPendingWrites() {
          return this.hasLocalMutations || this.hasCommittedMutations;
      }
      isValidDocument() {
          return 0 /* DocumentType.INVALID */ !== this.documentType;
      }
      isFoundDocument() {
          return 1 /* DocumentType.FOUND_DOCUMENT */ === this.documentType;
      }
      isNoDocument() {
          return 2 /* DocumentType.NO_DOCUMENT */ === this.documentType;
      }
      isUnknownDocument() {
          return 3 /* DocumentType.UNKNOWN_DOCUMENT */ === this.documentType;
      }
      isEqual(t) {
          return t instanceof MutableDocument && this.key.isEqual(t.key) && this.version.isEqual(t.version) && this.documentType === t.documentType && this.documentState === t.documentState && this.data.isEqual(t.data);
      }
      mutableCopy() {
          return new MutableDocument(this.key, this.documentType, this.version, this.readTime, this.createTime, this.data.clone(), this.documentState);
      }
      toString() {
          return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
      }
  }

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
  /**
   * Query encapsulates all the query attributes we support in the SDK. It can
   * be run against the LocalStore, as well as be converted to a `Target` to
   * query the RemoteStore results.
   *
   * Visible for testing.
   */
  class __PRIVATE_QueryImpl {
      /**
       * Initializes a Query with a path and optional additional query constraints.
       * Path must currently be empty if this is a collection group query.
       */
      constructor(t, e = null, r = [], n = [], i = null, s = "F" /* LimitType.First */ , o = null, a = null) {
          this.path = t, this.collectionGroup = e, this.explicitOrderBy = r, this.filters = n, 
          this.limit = i, this.limitType = s, this.startAt = o, this.endAt = a, this.C = null, 
          // The corresponding `Target` of this `Query` instance, for use with
          // non-aggregate queries.
          this.S = null, 
          // The corresponding `Target` of this `Query` instance, for use with
          // aggregate queries. Unlike targets for non-aggregate queries,
          // aggregate query targets do not contain normalized order-bys, they only
          // contain explicit order-bys.
          this.N = null, this.startAt, this.endAt;
      }
  }

  /**
   * This class generates JsonObject values for the Datastore API suitable for
   * sending to either GRPC stub methods or via the JSON/HTTP REST API.
   *
   * The serializer supports both Protobuf.js and Proto3 JSON formats. By
   * setting `useProto3Json` to true, the serializer will use the Proto3 JSON
   * format.
   *
   * For a description of the Proto3 JSON format check
   * https://developers.google.com/protocol-buffers/docs/proto3#json
   *
   * TODO(klimt): We can remove the databaseId argument if we keep the full
   * resource name in documents.
   */
  class JsonProtoSerializer {
      constructor(t, e) {
          this.databaseId = t, this.useProto3Json = e;
      }
  }

  function __PRIVATE_fromVersion(t) {
      return __PRIVATE_hardAssert(!!t), SnapshotVersion.fromTimestamp(function fromTimestamp(t) {
          const e = __PRIVATE_normalizeTimestamp(t);
          return new Timestamp(e.seconds, e.nanos);
      }(t));
  }

  function __PRIVATE_toResourceName(t, e) {
      return __PRIVATE_toResourcePath(t, e).canonicalString();
  }

  function __PRIVATE_toResourcePath(t, e) {
      const r = function __PRIVATE_fullyQualifiedPrefixPath(t) {
          return new ResourcePath([ "projects", t.projectId, "databases", t.database ]);
      }(t).child("documents");
      return undefined === e ? r : r.child(e);
  }

  function __PRIVATE_toName(t, e) {
      return __PRIVATE_toResourceName(t.databaseId, e.path);
  }

  function fromName(t, e) {
      const r = function __PRIVATE_fromResourceName(t) {
          const e = ResourcePath.fromString(t);
          return __PRIVATE_hardAssert(__PRIVATE_isValidResourceName(e)), e;
      }(e);
      if (r.get(1) !== t.databaseId.projectId) throw new FirestoreError(P, "Tried to deserialize key from different project: " + r.get(1) + " vs " + t.databaseId.projectId);
      if (r.get(3) !== t.databaseId.database) throw new FirestoreError(P, "Tried to deserialize key from different database: " + r.get(3) + " vs " + t.databaseId.database);
      return new DocumentKey(function __PRIVATE_extractLocalPathFromResourceName(t) {
          return __PRIVATE_hardAssert(t.length > 4 && "documents" === t.get(4)), t.popFirst(5);
      }
      /** Creates a Document proto from key and fields (but no create/update time) */ (r));
  }

  function __PRIVATE_fromBatchGetDocumentsResponse(t, e) {
      return "found" in e ? function __PRIVATE_fromFound(t, e) {
          __PRIVATE_hardAssert(!!e.found), e.found.name, e.found.updateTime;
          const r = fromName(t, e.found.name), n = __PRIVATE_fromVersion(e.found.updateTime), i = e.found.createTime ? __PRIVATE_fromVersion(e.found.createTime) : SnapshotVersion.min(), s = new ObjectValue({
              mapValue: {
                  fields: e.found.fields
              }
          });
          return MutableDocument.newFoundDocument(r, n, i, s);
      }(t, e) : "missing" in e ? function __PRIVATE_fromMissing(t, e) {
          __PRIVATE_hardAssert(!!e.missing), __PRIVATE_hardAssert(!!e.readTime);
          const r = fromName(t, e.missing), n = __PRIVATE_fromVersion(e.readTime);
          return MutableDocument.newNoDocument(r, n);
      }(t, e) : fail();
  }

  function __PRIVATE_isValidResourceName(t) {
      // Resource names have at least 4 components (project ID, database ID)
      return t.length >= 4 && "projects" === t.get(0) && "databases" === t.get(2);
  }

  /**
   * @license
   * Copyright 2020 Google LLC
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
   */ function __PRIVATE_newSerializer(t) {
      return new JsonProtoSerializer(t, /* useProto3Json= */ true);
  }

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
  /**
   * Datastore and its related methods are a wrapper around the external Google
   * Cloud Datastore grpc API, which provides an interface that is more convenient
   * for the rest of the client SDK architecture to consume.
   */
  /**
   * An implementation of Datastore that exposes additional state for internal
   * consumption.
   */
  class __PRIVATE_DatastoreImpl extends class Datastore {} {
      constructor(t, e, r, n) {
          super(), this.authCredentials = t, this.appCheckCredentials = e, this.connection = r, 
          this.serializer = n, this.J = false;
      }
      Y() {
          if (this.J) throw new FirestoreError(g, "The client has already been terminated.");
      }
      /** Invokes the provided RPC with auth and AppCheck tokens. */    R(t, e, r, n) {
          return this.Y(), Promise.all([ this.authCredentials.getToken(), this.appCheckCredentials.getToken() ]).then((([i, s]) => this.connection.R(t, __PRIVATE_toResourcePath(e, r), n, i, s))).catch((t => {
              throw "FirebaseError" === t.name ? (t.code === y && (this.authCredentials.invalidateToken(), 
              this.appCheckCredentials.invalidateToken()), t) : new FirestoreError(T, t.toString());
          }));
      }
      /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */    g(t, e, r, n, i) {
          return this.Y(), Promise.all([ this.authCredentials.getToken(), this.appCheckCredentials.getToken() ]).then((([s, o]) => this.connection.g(t, __PRIVATE_toResourcePath(e, r), n, s, o, i))).catch((t => {
              throw "FirebaseError" === t.name ? (t.code === y && (this.authCredentials.invalidateToken(), 
              this.appCheckCredentials.invalidateToken()), t) : new FirestoreError(T, t.toString());
          }));
      }
      terminate() {
          this.J = true, this.connection.terminate();
      }
  }

  async function __PRIVATE_invokeBatchGetDocumentsRpc(t, e) {
      const r = __PRIVATE_debugCast(t), n = {
          documents: e.map((t => __PRIVATE_toName(r.serializer, t)))
      }, i = await r.g("BatchGetDocuments", r.serializer.databaseId, ResourcePath.emptyPath(), n, e.length), s = new Map;
      i.forEach((t => {
          const e = __PRIVATE_fromBatchGetDocumentsResponse(r.serializer, t);
          s.set(e.key.toString(), e);
      }));
      const o = [];
      return e.forEach((t => {
          const e = s.get(t.toString());
          __PRIVATE_hardAssert(!!e), o.push(e);
      })), o;
  }

  /**
   * @license
   * Copyright 2020 Google LLC
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
   */ const U = new Map;

  /**
   * An instance map that ensures only one Datastore exists per Firestore
   * instance.
   */
  /**
   * Returns an initialized and started Datastore for the given Firestore
   * instance. Callers must invoke removeComponents() when the Firestore
   * instance is terminated.
   */
  function __PRIVATE_getDatastore(t) {
      if (t._terminated) throw new FirestoreError(g, "The client has already been terminated.");
      if (!U.has(t)) {
          __PRIVATE_logDebug("ComponentProvider", "Initializing Datastore");
          const e = function __PRIVATE_newConnection(t) {
              return new __PRIVATE_FetchConnection(t);
          }(function __PRIVATE_makeDatabaseInfo(t, e, r, n) {
              return new DatabaseInfo(t, e, r, n.host, n.ssl, n.experimentalForceLongPolling, n.experimentalAutoDetectLongPolling, __PRIVATE_cloneLongPollingOptions(n.experimentalLongPollingOptions), n.useFetchStreams);
          }
          /**
   * @license
   * Copyright 2018 Google LLC
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
   */ (t._databaseId, t.app.options.appId || "", t._persistenceKey, t._freezeSettings())), r = __PRIVATE_newSerializer(t._databaseId), n = function __PRIVATE_newDatastore(t, e, r, n) {
              return new __PRIVATE_DatastoreImpl(t, e, r, n);
          }(t._authCredentials, t._appCheckCredentials, e, r);
          U.set(t, n);
      }
      return U.get(t);
  }

  /**
   * Removes all components associated with the provided instance. Must be called
   * when the `Firestore` instance is terminated.
   */
  /**
   * A concrete type describing all the values that can be applied via a
   * user-supplied `FirestoreSettings` object. This is a separate type so that
   * defaults can be supplied and the value can be checked for equality.
   */
  class FirestoreSettingsImpl {
      constructor(t) {
          var e, r;
          if (undefined === t.host) {
              if (undefined !== t.ssl) throw new FirestoreError(P, "Can't provide ssl option if host option is not set");
              this.host = "firestore.googleapis.com", this.ssl = true;
          } else this.host = t.host, this.ssl = null === (e = t.ssl) || undefined === e || e;
          if (this.credentials = t.credentials, this.ignoreUndefinedProperties = !!t.ignoreUndefinedProperties, 
          this.localCache = t.localCache, undefined === t.cacheSizeBytes) this.cacheSizeBytes = 41943040; else {
              if (-1 !== t.cacheSizeBytes && t.cacheSizeBytes < 1048576) throw new FirestoreError(P, "cacheSizeBytes must be at least 1048576");
              this.cacheSizeBytes = t.cacheSizeBytes;
          }
          !function __PRIVATE_validateIsNotUsedTogether(t, e, r, n) {
              if (true === e && true === n) throw new FirestoreError(P, `${t} and ${r} cannot be used together.`);
          }("experimentalForceLongPolling", t.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", t.experimentalAutoDetectLongPolling), 
          this.experimentalForceLongPolling = !!t.experimentalForceLongPolling, this.experimentalForceLongPolling ? this.experimentalAutoDetectLongPolling = false : undefined === t.experimentalAutoDetectLongPolling ? this.experimentalAutoDetectLongPolling = true : 
          // For backwards compatibility, coerce the value to boolean even though
          // the TypeScript compiler has narrowed the type to boolean already.
          // noinspection PointlessBooleanExpressionJS
          this.experimentalAutoDetectLongPolling = !!t.experimentalAutoDetectLongPolling, 
          this.experimentalLongPollingOptions = __PRIVATE_cloneLongPollingOptions(null !== (r = t.experimentalLongPollingOptions) && undefined !== r ? r : {}), 
          function __PRIVATE_validateLongPollingOptions(t) {
              if (undefined !== t.timeoutSeconds) {
                  if (isNaN(t.timeoutSeconds)) throw new FirestoreError(P, `invalid long polling timeout: ${t.timeoutSeconds} (must not be NaN)`);
                  if (t.timeoutSeconds < 5) throw new FirestoreError(P, `invalid long polling timeout: ${t.timeoutSeconds} (minimum allowed value is 5)`);
                  if (t.timeoutSeconds > 30) throw new FirestoreError(P, `invalid long polling timeout: ${t.timeoutSeconds} (maximum allowed value is 30)`);
              }
          }
          /**
   * @license
   * Copyright 2020 Google LLC
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
   * The Cloud Firestore service interface.
   *
   * Do not call this constructor directly. Instead, use {@link (getFirestore:1)}.
   */ (this.experimentalLongPollingOptions), this.useFetchStreams = !!t.useFetchStreams;
      }
      isEqual(t) {
          return this.host === t.host && this.ssl === t.ssl && this.credentials === t.credentials && this.cacheSizeBytes === t.cacheSizeBytes && this.experimentalForceLongPolling === t.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === t.experimentalAutoDetectLongPolling && function __PRIVATE_longPollingOptionsEqual(t, e) {
              return t.timeoutSeconds === e.timeoutSeconds;
          }(this.experimentalLongPollingOptions, t.experimentalLongPollingOptions) && this.ignoreUndefinedProperties === t.ignoreUndefinedProperties && this.useFetchStreams === t.useFetchStreams;
      }
  }

  class Firestore {
      /** @hideconstructor */
      constructor(t, e, r, n) {
          this._authCredentials = t, this._appCheckCredentials = e, this._databaseId = r, 
          this._app = n, 
          /**
           * Whether it's a Firestore or Firestore Lite instance.
           */
          this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new FirestoreSettingsImpl({}), 
          this._settingsFrozen = false, 
          // A task that is assigned when the terminate() is invoked and resolved when
          // all components have shut down. Otherwise, Firestore is not terminated,
          // which can mean either the FirestoreClient is in the process of starting,
          // or restarting.
          this._terminateTask = "notTerminated";
      }
      /**
       * The {@link @firebase/app#FirebaseApp} associated with this `Firestore` service
       * instance.
       */    get app() {
          if (!this._app) throw new FirestoreError(g, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
          return this._app;
      }
      get _initialized() {
          return this._settingsFrozen;
      }
      get _terminated() {
          return "notTerminated" !== this._terminateTask;
      }
      _setSettings(t) {
          if (this._settingsFrozen) throw new FirestoreError(g, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
          this._settings = new FirestoreSettingsImpl(t), undefined !== t.credentials && (this._authCredentials = function __PRIVATE_makeAuthCredentialsProvider(t) {
              if (!t) return new __PRIVATE_EmptyAuthCredentialsProvider;
              switch (t.type) {
                case "firstParty":
                  return new __PRIVATE_FirstPartyAuthCredentialsProvider(t.sessionIndex || "0", t.iamToken || null, t.authTokenFactory || null);

                case "provider":
                  return t.client;

                default:
                  throw new FirestoreError(P, "makeAuthCredentialsProvider failed due to invalid credential type");
              }
          }(t.credentials));
      }
      _getSettings() {
          return this._settings;
      }
      _freezeSettings() {
          return this._settingsFrozen = true, this._settings;
      }
      _delete() {
          // The `_terminateTask` must be assigned future that completes when
          // terminate is complete. The existence of this future puts SDK in state
          // that will not accept further API interaction.
          return "notTerminated" === this._terminateTask && (this._terminateTask = this._terminate()), 
          this._terminateTask;
      }
      async _restart() {
          // The `_terminateTask` must equal 'notTerminated' after restart to
          // signal that client is in a state that accepts API calls.
          "notTerminated" === this._terminateTask ? await this._terminate() : this._terminateTask = "notTerminated";
      }
      /** Returns a JSON-serializable representation of this `Firestore` instance. */    toJSON() {
          return {
              app: this._app,
              databaseId: this._databaseId,
              settings: this._settings
          };
      }
      /**
       * Terminates all components used by this client. Subclasses can override
       * this method to clean up their own dependencies, but must also call this
       * method.
       *
       * Only ever called once.
       */    _terminate() {
          return function __PRIVATE_removeComponents(t) {
              const e = U.get(t);
              e && (__PRIVATE_logDebug("ComponentProvider", "Removing Datastore"), U.delete(t), 
              e.terminate());
          }(this), Promise.resolve();
      }
  }

  function getFirestore(e, r) {
      const n = "object" == typeof e ? e : getApp(), i = "string" == typeof e ? e : r || "(default)", s = _getProvider(n, "firestore/lite").getImmediate({
          identifier: i
      });
      if (!s._initialized) {
          const t = getDefaultEmulatorHostnameAndPort("firestore");
          t && connectFirestoreEmulator(s, ...t);
      }
      return s;
  }

  /**
   * Modify this instance to communicate with the Cloud Firestore emulator.
   *
   * Note: This must be called before this instance has been used to do any
   * operations.
   *
   * @param firestore - The `Firestore` instance to configure to connect to the
   * emulator.
   * @param host - the emulator host (ex: localhost).
   * @param port - the emulator port (ex: 9000).
   * @param options.mockUserToken - the mock auth token to use for unit testing
   * Security Rules.
   */ function connectFirestoreEmulator(t, e, r, n = {}) {
      var i;
      const s = (t = __PRIVATE_cast(t, Firestore))._getSettings(), o = `${e}:${r}`;
      if ("firestore.googleapis.com" !== s.host && s.host !== o && __PRIVATE_logWarn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."), 
      t._setSettings(Object.assign(Object.assign({}, s), {
          host: o,
          ssl: false
      })), n.mockUserToken) {
          let e, r;
          if ("string" == typeof n.mockUserToken) e = n.mockUserToken, r = User.MOCK_USER; else {
              // Let createMockUserToken validate first (catches common mistakes like
              // invalid field "uid" and missing field "sub" / "user_id".)
              e = createMockUserToken(n.mockUserToken, null === (i = t._app) || undefined === i ? undefined : i.options.projectId);
              const s = n.mockUserToken.sub || n.mockUserToken.user_id;
              if (!s) throw new FirestoreError(P, "mockUserToken must contain 'sub' or 'user_id' field!");
              r = new User(s);
          }
          t._authCredentials = new __PRIVATE_EmulatorAuthCredentialsProvider(new __PRIVATE_OAuthToken(e, r));
      }
  }

  /**
   * @license
   * Copyright 2020 Google LLC
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
   * A `Query` refers to a query which you can read or listen to. You can also
   * construct refined `Query` objects by adding filters and ordering.
   */ class Query {
      // This is the lite version of the Query class in the main SDK.
      /** @hideconstructor protected */
      constructor(t, 
      /**
       * If provided, the `FirestoreDataConverter` associated with this instance.
       */
      e, r) {
          this.converter = e, this._query = r, 
          /** The type of this Firestore reference. */
          this.type = "query", this.firestore = t;
      }
      withConverter(t) {
          return new Query(this.firestore, t, this._query);
      }
  }

  /**
   * A `DocumentReference` refers to a document location in a Firestore database
   * and can be used to write, read, or listen to the location. The document at
   * the referenced location may or may not exist.
   */ class DocumentReference {
      /** @hideconstructor */
      constructor(t, 
      /**
       * If provided, the `FirestoreDataConverter` associated with this instance.
       */
      e, r) {
          this.converter = e, this._key = r, 
          /** The type of this Firestore reference. */
          this.type = "document", this.firestore = t;
      }
      get _path() {
          return this._key.path;
      }
      /**
       * The document's identifier within its collection.
       */    get id() {
          return this._key.path.lastSegment();
      }
      /**
       * A string representing the path of the referenced document (relative
       * to the root of the database).
       */    get path() {
          return this._key.path.canonicalString();
      }
      /**
       * The collection this `DocumentReference` belongs to.
       */    get parent() {
          return new CollectionReference(this.firestore, this.converter, this._key.path.popLast());
      }
      withConverter(t) {
          return new DocumentReference(this.firestore, t, this._key);
      }
  }

  /**
   * A `CollectionReference` object can be used for adding documents, getting
   * document references, and querying for documents (using {@link (query:1)}).
   */ class CollectionReference extends Query {
      /** @hideconstructor */
      constructor(t, e, r) {
          super(t, e, function __PRIVATE_newQueryForPath(t) {
              return new __PRIVATE_QueryImpl(t);
          }(r)), this._path = r, 
          /** The type of this Firestore reference. */
          this.type = "collection";
      }
      /** The collection's identifier. */    get id() {
          return this._query.path.lastSegment();
      }
      /**
       * A string representing the path of the referenced collection (relative
       * to the root of the database).
       */    get path() {
          return this._query.path.canonicalString();
      }
      /**
       * A reference to the containing `DocumentReference` if this is a
       * subcollection. If this isn't a subcollection, the reference is null.
       */    get parent() {
          const t = this._path.popLast();
          return t.isEmpty() ? null : new DocumentReference(this.firestore, 
          /* converter= */ null, new DocumentKey(t));
      }
      withConverter(t) {
          return new CollectionReference(this.firestore, t, this._path);
      }
  }

  function doc(t, e, ...r) {
      if (t = getModularInstance(t), 
      // We allow omission of 'pathString' but explicitly prohibit passing in both
      // 'undefined' and 'null'.
      1 === arguments.length && (e = __PRIVATE_AutoId.newId()), __PRIVATE_validateNonEmptyArgument("doc", "path", e), 
      t instanceof Firestore) {
          const n = ResourcePath.fromString(e, ...r);
          return __PRIVATE_validateDocumentPath(n), new DocumentReference(t, 
          /* converter= */ null, new DocumentKey(n));
      }
      {
          if (!(t instanceof DocumentReference || t instanceof CollectionReference)) throw new FirestoreError(P, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
          const n = t._path.child(ResourcePath.fromString(e, ...r));
          return __PRIVATE_validateDocumentPath(n), new DocumentReference(t.firestore, t instanceof CollectionReference ? t.converter : null, new DocumentKey(n));
      }
  }

  /**
   * @license
   * Copyright 2020 Google LLC
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
   * An immutable object representing an array of bytes.
   */ class Bytes {
      /** @hideconstructor */
      constructor(t) {
          this._byteString = t;
      }
      /**
       * Creates a new `Bytes` object from the given Base64 string, converting it to
       * bytes.
       *
       * @param base64 - The Base64 string used to create the `Bytes` object.
       */    static fromBase64String(t) {
          try {
              return new Bytes(ByteString.fromBase64String(t));
          } catch (t) {
              throw new FirestoreError(P, "Failed to construct data from Base64 string: " + t);
          }
      }
      /**
       * Creates a new `Bytes` object from the given Uint8Array.
       *
       * @param array - The Uint8Array used to create the `Bytes` object.
       */    static fromUint8Array(t) {
          return new Bytes(ByteString.fromUint8Array(t));
      }
      /**
       * Returns the underlying bytes as a Base64-encoded string.
       *
       * @returns The Base64-encoded string created from the `Bytes` object.
       */    toBase64() {
          return this._byteString.toBase64();
      }
      /**
       * Returns the underlying bytes in a new `Uint8Array`.
       *
       * @returns The Uint8Array created from the `Bytes` object.
       */    toUint8Array() {
          return this._byteString.toUint8Array();
      }
      /**
       * Returns a string representation of the `Bytes` object.
       *
       * @returns A string representation of the `Bytes` object.
       */    toString() {
          return "Bytes(base64: " + this.toBase64() + ")";
      }
      /**
       * Returns true if this `Bytes` object is equal to the provided one.
       *
       * @param other - The `Bytes` object to compare against.
       * @returns true if this `Bytes` object is equal to the provided one.
       */    isEqual(t) {
          return this._byteString.isEqual(t._byteString);
      }
  }

  /**
   * @license
   * Copyright 2020 Google LLC
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
   * A `FieldPath` refers to a field in a document. The path may consist of a
   * single field name (referring to a top-level field in the document), or a
   * list of field names (referring to a nested field in the document).
   *
   * Create a `FieldPath` by providing field names. If more than one field
   * name is provided, the path will point to a nested field in a document.
   */ class FieldPath {
      /**
       * Creates a `FieldPath` from the provided field names. If more than one field
       * name is provided, the path will point to a nested field in a document.
       *
       * @param fieldNames - A list of field names.
       */
      constructor(...t) {
          for (let e = 0; e < t.length; ++e) if (0 === t[e].length) throw new FirestoreError(P, "Invalid field name at argument $(i + 1). Field names must not be empty.");
          this._internalPath = new FieldPath$1(t);
      }
      /**
       * Returns true if this `FieldPath` is equal to the provided one.
       *
       * @param other - The `FieldPath` to compare against.
       * @returns true if this `FieldPath` is equal to the provided one.
       */    isEqual(t) {
          return this._internalPath.isEqual(t._internalPath);
      }
  }

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
  /**
   * An immutable object representing a geographic location in Firestore. The
   * location is represented as latitude/longitude pair.
   *
   * Latitude values are in the range of [-90, 90].
   * Longitude values are in the range of [-180, 180].
   */ class GeoPoint {
      /**
       * Creates a new immutable `GeoPoint` object with the provided latitude and
       * longitude values.
       * @param latitude - The latitude as number between -90 and 90.
       * @param longitude - The longitude as number between -180 and 180.
       */
      constructor(t, e) {
          if (!isFinite(t) || t < -90 || t > 90) throw new FirestoreError(P, "Latitude must be a number between -90 and 90, but was: " + t);
          if (!isFinite(e) || e < -180 || e > 180) throw new FirestoreError(P, "Longitude must be a number between -180 and 180, but was: " + e);
          this._lat = t, this._long = e;
      }
      /**
       * The latitude of this `GeoPoint` instance.
       */    get latitude() {
          return this._lat;
      }
      /**
       * The longitude of this `GeoPoint` instance.
       */    get longitude() {
          return this._long;
      }
      /**
       * Returns true if this `GeoPoint` is equal to the provided one.
       *
       * @param other - The `GeoPoint` to compare against.
       * @returns true if this `GeoPoint` is equal to the provided one.
       */    isEqual(t) {
          return this._lat === t._lat && this._long === t._long;
      }
      /** Returns a JSON-serializable representation of this GeoPoint. */    toJSON() {
          return {
              latitude: this._lat,
              longitude: this._long
          };
      }
      /**
       * Actually private to JS consumers of our API, so this function is prefixed
       * with an underscore.
       */    _compareTo(t) {
          return __PRIVATE_primitiveComparator(this._lat, t._lat) || __PRIVATE_primitiveComparator(this._long, t._long);
      }
  }

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
  /**
   * Verifies equality for an array of primitives.
   *
   * @private
   * @internal
   * @param left Array of primitives.
   * @param right Array of primitives.
   * @return True if arrays are equal.
   */
  /**
   * @license
   * Copyright 2024 Google LLC
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
   * Represents a vector type in Firestore documents.
   * Create an instance with {@link FieldValue.vector}.
   *
   * @class VectorValue
   */
  class VectorValue {
      /**
       * @private
       * @internal
       */
      constructor(t) {
          // Making a copy of the parameter.
          this._values = (t || []).map((t => t));
      }
      /**
       * Returns a copy of the raw number array form of the vector.
       */    toArray() {
          return this._values.map((t => t));
      }
      /**
       * Returns `true` if the two VectorValue has the same raw number arrays, returns `false` otherwise.
       */    isEqual(t) {
          return function __PRIVATE_isPrimitiveArrayEqual(t, e) {
              if (t.length !== e.length) return false;
              for (let r = 0; r < t.length; ++r) if (t[r] !== e[r]) return false;
              return true;
          }(this._values, t._values);
      }
  }

  /**
   * Matches any characters in a field path string that are reserved.
   */ const z = new RegExp("[~\\*/\\[\\]]");

  /**
   * Wraps fromDotSeparatedString with an error message about the method that
   * was thrown.
   * @param methodName - The publicly visible method name
   * @param path - The dot-separated string form of a field path which will be
   * split on dots.
   * @param targetDoc - The document against which the field path will be
   * evaluated.
   */ function __PRIVATE_fieldPathFromDotSeparatedString(t, e, r) {
      if (e.search(z) >= 0) throw __PRIVATE_createError(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`, t);
      try {
          return new FieldPath(...e.split("."))._internalPath;
      } catch (n) {
          throw __PRIVATE_createError(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`, t);
      }
  }

  function __PRIVATE_createError(t, e, r, n, i) {
      let a = `Function ${e}() called with invalid data`;
      a += ". ";
      let u = "";
      return new FirestoreError(P, a + t + u);
  }

  /**
   * @license
   * Copyright 2020 Google LLC
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
   * A `DocumentSnapshot` contains data read from a document in your Firestore
   * database. The data can be extracted with `.data()` or `.get(<field>)` to
   * get a specific field.
   *
   * For a `DocumentSnapshot` that points to a non-existing document, any data
   * access will return 'undefined'. You can use the `exists()` method to
   * explicitly verify a document's existence.
   */ class DocumentSnapshot {
      // Note: This class is stripped down version of the DocumentSnapshot in
      // the legacy SDK. The changes are:
      // - No support for SnapshotMetadata.
      // - No support for SnapshotOptions.
      /** @hideconstructor protected */
      constructor(t, e, r, n, i) {
          this._firestore = t, this._userDataWriter = e, this._key = r, this._document = n, 
          this._converter = i;
      }
      /** Property of the `DocumentSnapshot` that provides the document's ID. */    get id() {
          return this._key.path.lastSegment();
      }
      /**
       * The `DocumentReference` for the document included in the `DocumentSnapshot`.
       */    get ref() {
          return new DocumentReference(this._firestore, this._converter, this._key);
      }
      /**
       * Signals whether or not the document at the snapshot's location exists.
       *
       * @returns true if the document exists.
       */    exists() {
          return null !== this._document;
      }
      /**
       * Retrieves all fields in the document as an `Object`. Returns `undefined` if
       * the document doesn't exist.
       *
       * @returns An `Object` containing all fields in the document or `undefined`
       * if the document doesn't exist.
       */    data() {
          if (this._document) {
              if (this._converter) {
                  // We only want to use the converter and create a new DocumentSnapshot
                  // if a converter has been provided.
                  const t = new QueryDocumentSnapshot(this._firestore, this._userDataWriter, this._key, this._document, 
                  /* converter= */ null);
                  return this._converter.fromFirestore(t);
              }
              return this._userDataWriter.convertValue(this._document.data.value);
          }
      }
      /**
       * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
       * document or field doesn't exist.
       *
       * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
       * field.
       * @returns The data at the specified field location or undefined if no such
       * field exists in the document.
       */
      // We are using `any` here to avoid an explicit cast by our users.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get(t) {
          if (this._document) {
              const e = this._document.data.field(__PRIVATE_fieldPathFromArgument("DocumentSnapshot.get", t));
              if (null !== e) return this._userDataWriter.convertValue(e);
          }
      }
  }

  /**
   * A `QueryDocumentSnapshot` contains data read from a document in your
   * Firestore database as part of a query. The document is guaranteed to exist
   * and its data can be extracted with `.data()` or `.get(<field>)` to get a
   * specific field.
   *
   * A `QueryDocumentSnapshot` offers the same API surface as a
   * `DocumentSnapshot`. Since query results contain only existing documents, the
   * `exists` property will always be true and `data()` will never return
   * 'undefined'.
   */ class QueryDocumentSnapshot extends DocumentSnapshot {
      /**
       * Retrieves all fields in the document as an `Object`.
       *
       * @override
       * @returns An `Object` containing all fields in the document.
       */
      data() {
          return super.data();
      }
  }

  /**
   * Helper that calls `fromDotSeparatedString()` but wraps any error thrown.
   */ function __PRIVATE_fieldPathFromArgument(t, e) {
      return "string" == typeof e ? __PRIVATE_fieldPathFromDotSeparatedString(t, e) : e instanceof FieldPath ? e._internalPath : e._delegate._internalPath;
  }

  class __PRIVATE_LiteUserDataWriter extends class AbstractUserDataWriter {
      convertValue(t, e = "none") {
          switch (__PRIVATE_typeOrder(t)) {
            case 0 /* TypeOrder.NullValue */ :
              return null;

            case 1 /* TypeOrder.BooleanValue */ :
              return t.booleanValue;

            case 2 /* TypeOrder.NumberValue */ :
              return __PRIVATE_normalizeNumber(t.integerValue || t.doubleValue);

            case 3 /* TypeOrder.TimestampValue */ :
              return this.convertTimestamp(t.timestampValue);

            case 4 /* TypeOrder.ServerTimestampValue */ :
              return this.convertServerTimestamp(t, e);

            case 5 /* TypeOrder.StringValue */ :
              return t.stringValue;

            case 6 /* TypeOrder.BlobValue */ :
              return this.convertBytes(__PRIVATE_normalizeByteString(t.bytesValue));

            case 7 /* TypeOrder.RefValue */ :
              return this.convertReference(t.referenceValue);

            case 8 /* TypeOrder.GeoPointValue */ :
              return this.convertGeoPoint(t.geoPointValue);

            case 9 /* TypeOrder.ArrayValue */ :
              return this.convertArray(t.arrayValue, e);

            case 11 /* TypeOrder.ObjectValue */ :
              return this.convertObject(t.mapValue, e);

            case 10 /* TypeOrder.VectorValue */ :
              return this.convertVectorValue(t.mapValue);

            default:
              throw fail();
          }
      }
      convertObject(t, e) {
          return this.convertObjectMap(t.fields, e);
      }
      /**
       * @internal
       */    convertObjectMap(t, e = "none") {
          const r = {};
          return forEach(t, ((t, n) => {
              r[t] = this.convertValue(n, e);
          })), r;
      }
      /**
       * @internal
       */    convertVectorValue(t) {
          var e, r, n;
          const i = null === (n = null === (r = null === (e = t.fields) || undefined === e ? undefined : e.value.arrayValue) || undefined === r ? undefined : r.values) || undefined === n ? undefined : n.map((t => __PRIVATE_normalizeNumber(t.doubleValue)));
          return new VectorValue(i);
      }
      convertGeoPoint(t) {
          return new GeoPoint(__PRIVATE_normalizeNumber(t.latitude), __PRIVATE_normalizeNumber(t.longitude));
      }
      convertArray(t, e) {
          return (t.values || []).map((t => this.convertValue(t, e)));
      }
      convertServerTimestamp(t, e) {
          switch (e) {
            case "previous":
              const r = __PRIVATE_getPreviousValue(t);
              return null == r ? null : this.convertValue(r, e);

            case "estimate":
              return this.convertTimestamp(__PRIVATE_getLocalWriteTime(t));

            default:
              return null;
          }
      }
      convertTimestamp(t) {
          const e = __PRIVATE_normalizeTimestamp(t);
          return new Timestamp(e.seconds, e.nanos);
      }
      convertDocumentKey(t, e) {
          const r = ResourcePath.fromString(t);
          __PRIVATE_hardAssert(__PRIVATE_isValidResourceName(r));
          const n = new DatabaseId(r.get(1), r.get(3)), i = new DocumentKey(r.popFirst(5));
          return n.isEqual(e) || 
          // TODO(b/64130202): Somehow support foreign references.
          __PRIVATE_logError(`Document ${i} contains a document reference within a different database (${n.projectId}/${n.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`), 
          i;
      }
  } {
      constructor(t) {
          super(), this.firestore = t;
      }
      convertBytes(t) {
          return new Bytes(t);
      }
      convertReference(t) {
          const e = this.convertDocumentKey(t, this.firestore._databaseId);
          return new DocumentReference(this.firestore, /* converter= */ null, e);
      }
  }

  /**
   * Reads the document referred to by the specified document reference.
   *
   * All documents are directly fetched from the server, even if the document was
   * previously read or modified. Recent modifications are only reflected in the
   * retrieved `DocumentSnapshot` if they have already been applied by the
   * backend. If the client is offline, the read fails. If you like to use
   * caching or see local modifications, please use the full Firestore SDK.
   *
   * @param reference - The reference of the document to fetch.
   * @returns A Promise resolved with a `DocumentSnapshot` containing the current
   * document contents.
   */ function getDoc(t) {
      const e = __PRIVATE_getDatastore((t = __PRIVATE_cast(t, DocumentReference)).firestore), r = new __PRIVATE_LiteUserDataWriter(t.firestore);
      return __PRIVATE_invokeBatchGetDocumentsRpc(e, [ t._key ]).then((e => {
          __PRIVATE_hardAssert(1 === e.length);
          const n = e[0];
          return new DocumentSnapshot(t.firestore, r, t._key, n.isFoundDocument() ? n : null, t.converter);
      }));
  }

  /**
   * Firestore Lite
   *
   * @remarks Firestore Lite is a small online-only SDK that allows read
   * and write access to your Firestore database. All operations connect
   * directly to the backend, and `onSnapshot()` APIs are not supported.
   * @packageDocumentation
   */ !function __PRIVATE_registerFirestore() {
      !function __PRIVATE_setSDKVersion(t) {
          f = t;
      }(`${SDK_VERSION}_lite`), _registerComponent(new Component("firestore/lite", ((t, {instanceIdentifier: e, options: r}) => {
          const n = t.getProvider("app").getImmediate(), i = new Firestore(new __PRIVATE_LiteAuthCredentialsProvider(t.getProvider("auth-internal")), new __PRIVATE_LiteAppCheckTokenProvider(t.getProvider("app-check-internal")), function __PRIVATE_databaseIdFromApp(t, e) {
              if (!Object.prototype.hasOwnProperty.apply(t.options, [ "projectId" ])) throw new FirestoreError(P, '"projectId" not provided in firebase.initializeApp.');
              return new DatabaseId(t.options.projectId, e);
          }
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
   */ (n, e), n);
          return r && i._setSettings(r), i;
      }), "PUBLIC").setMultipleInstances(true)), 
      // RUNTIME_ENV and BUILD_TARGET are replaced by real values during the compilation
      registerVersion("firestore-lite", "4.7.6", ""), registerVersion("firestore-lite", "4.7.6", "esm2017");
  }();

  const __esModule = true ;

  exports.__esModule = __esModule;
  exports.doc = doc;
  exports.getDoc = getDoc;
  exports.getFirestore = getFirestore;
  exports.initializeApp = initializeApp;

}));
