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

  /**
   * @license
   * Copyright 2025 Google LLC
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
  // This value is retrieved and hardcoded by the NPM postinstall script
  const getDefaultsFromPostinstall = () => undefined;

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
  const stringToByteArray$1 = function (str) {
      // TODO(user): Use native implementations if/when available
      const out = [];
      let p = 0;
      for (let i = 0; i < str.length; i++) {
          let c = str.charCodeAt(i);
          if (c < 128) {
              out[p++] = c;
          }
          else if (c < 2048) {
              out[p++] = (c >> 6) | 192;
              out[p++] = (c & 63) | 128;
          }
          else if ((c & 0xfc00) === 0xd800 &&
              i + 1 < str.length &&
              (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
              // Surrogate Pair
              c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
              out[p++] = (c >> 18) | 240;
              out[p++] = ((c >> 12) & 63) | 128;
              out[p++] = ((c >> 6) & 63) | 128;
              out[p++] = (c & 63) | 128;
          }
          else {
              out[p++] = (c >> 12) | 224;
              out[p++] = ((c >> 6) & 63) | 128;
              out[p++] = (c & 63) | 128;
          }
      }
      return out;
  };
  /**
   * Turns an array of numbers into the string given by the concatenation of the
   * characters to which the numbers correspond.
   * @param bytes Array of numbers representing characters.
   * @return Stringification of the array.
   */
  const byteArrayToString = function (bytes) {
      // TODO(user): Use native implementations if/when available
      const out = [];
      let pos = 0, c = 0;
      while (pos < bytes.length) {
          const c1 = bytes[pos++];
          if (c1 < 128) {
              out[c++] = String.fromCharCode(c1);
          }
          else if (c1 > 191 && c1 < 224) {
              const c2 = bytes[pos++];
              out[c++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
          }
          else if (c1 > 239 && c1 < 365) {
              // Surrogate Pair
              const c2 = bytes[pos++];
              const c3 = bytes[pos++];
              const c4 = bytes[pos++];
              const u = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) -
                  0x10000;
              out[c++] = String.fromCharCode(0xd800 + (u >> 10));
              out[c++] = String.fromCharCode(0xdc00 + (u & 1023));
          }
          else {
              const c2 = bytes[pos++];
              const c3 = bytes[pos++];
              out[c++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          }
      }
      return out.join('');
  };
  // We define it as an object literal instead of a class because a class compiled down to es5 can't
  // be treeshaked. https://github.com/rollup/rollup/issues/1691
  // Static lookup maps, lazily populated by init_()
  // TODO(dlarocque): Define this as a class, since we no longer target ES5.
  const base64 = {
      /**
       * Maps bytes to characters.
       */
      byteToCharMap_: null,
      /**
       * Maps characters to bytes.
       */
      charToByteMap_: null,
      /**
       * Maps bytes to websafe characters.
       * @private
       */
      byteToCharMapWebSafe_: null,
      /**
       * Maps websafe characters to bytes.
       * @private
       */
      charToByteMapWebSafe_: null,
      /**
       * Our default alphabet, shared between
       * ENCODED_VALS and ENCODED_VALS_WEBSAFE
       */
      ENCODED_VALS_BASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789',
      /**
       * Our default alphabet. Value 64 (=) is special; it means "nothing."
       */
      get ENCODED_VALS() {
          return this.ENCODED_VALS_BASE + '+/=';
      },
      /**
       * Our websafe alphabet.
       */
      get ENCODED_VALS_WEBSAFE() {
          return this.ENCODED_VALS_BASE + '-_.';
      },
      /**
       * Whether this browser supports the atob and btoa functions. This extension
       * started at Mozilla but is now implemented by many browsers. We use the
       * ASSUME_* variables to avoid pulling in the full useragent detection library
       * but still allowing the standard per-browser compilations.
       *
       */
      HAS_NATIVE_SUPPORT: typeof atob === 'function',
      /**
       * Base64-encode an array of bytes.
       *
       * @param input An array of bytes (numbers with
       *     value in [0, 255]) to encode.
       * @param webSafe Boolean indicating we should use the
       *     alternative alphabet.
       * @return The base64 encoded string.
       */
      encodeByteArray(input, webSafe) {
          if (!Array.isArray(input)) {
              throw Error('encodeByteArray takes an array as a parameter');
          }
          this.init_();
          const byteToCharMap = webSafe
              ? this.byteToCharMapWebSafe_
              : this.byteToCharMap_;
          const output = [];
          for (let i = 0; i < input.length; i += 3) {
              const byte1 = input[i];
              const haveByte2 = i + 1 < input.length;
              const byte2 = haveByte2 ? input[i + 1] : 0;
              const haveByte3 = i + 2 < input.length;
              const byte3 = haveByte3 ? input[i + 2] : 0;
              const outByte1 = byte1 >> 2;
              const outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
              let outByte3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
              let outByte4 = byte3 & 0x3f;
              if (!haveByte3) {
                  outByte4 = 64;
                  if (!haveByte2) {
                      outByte3 = 64;
                  }
              }
              output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
          }
          return output.join('');
      },
      /**
       * Base64-encode a string.
       *
       * @param input A string to encode.
       * @param webSafe If true, we should use the
       *     alternative alphabet.
       * @return The base64 encoded string.
       */
      encodeString(input, webSafe) {
          // Shortcut for Mozilla browsers that implement
          // a native base64 encoder in the form of "btoa/atob"
          if (this.HAS_NATIVE_SUPPORT && !webSafe) {
              return btoa(input);
          }
          return this.encodeByteArray(stringToByteArray$1(input), webSafe);
      },
      /**
       * Base64-decode a string.
       *
       * @param input to decode.
       * @param webSafe True if we should use the
       *     alternative alphabet.
       * @return string representing the decoded value.
       */
      decodeString(input, webSafe) {
          // Shortcut for Mozilla browsers that implement
          // a native base64 encoder in the form of "btoa/atob"
          if (this.HAS_NATIVE_SUPPORT && !webSafe) {
              return atob(input);
          }
          return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
      },
      /**
       * Base64-decode a string.
       *
       * In base-64 decoding, groups of four characters are converted into three
       * bytes.  If the encoder did not apply padding, the input length may not
       * be a multiple of 4.
       *
       * In this case, the last group will have fewer than 4 characters, and
       * padding will be inferred.  If the group has one or two characters, it decodes
       * to one byte.  If the group has three characters, it decodes to two bytes.
       *
       * @param input Input to decode.
       * @param webSafe True if we should use the web-safe alphabet.
       * @return bytes representing the decoded value.
       */
      decodeStringToByteArray(input, webSafe) {
          this.init_();
          const charToByteMap = webSafe
              ? this.charToByteMapWebSafe_
              : this.charToByteMap_;
          const output = [];
          for (let i = 0; i < input.length;) {
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
              const outByte1 = (byte1 << 2) | (byte2 >> 4);
              output.push(outByte1);
              if (byte3 !== 64) {
                  const outByte2 = ((byte2 << 4) & 0xf0) | (byte3 >> 2);
                  output.push(outByte2);
                  if (byte4 !== 64) {
                      const outByte3 = ((byte3 << 6) & 0xc0) | byte4;
                      output.push(outByte3);
                  }
              }
          }
          return output;
      },
      /**
       * Lazy static initialization function. Called before
       * accessing any of the static map variables.
       * @private
       */
      init_() {
          if (!this.byteToCharMap_) {
              this.byteToCharMap_ = {};
              this.charToByteMap_ = {};
              this.byteToCharMapWebSafe_ = {};
              this.charToByteMapWebSafe_ = {};
              // We want quick mappings back and forth, so we precompute two maps.
              for (let i = 0; i < this.ENCODED_VALS.length; i++) {
                  this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
                  this.charToByteMap_[this.byteToCharMap_[i]] = i;
                  this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
                  this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
                  // Be forgiving when decoding and correctly decode both encodings.
                  if (i >= this.ENCODED_VALS_BASE.length) {
                      this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
                      this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
                  }
              }
          }
      }
  };
  /**
   * An error encountered while decoding base64 string.
   */
  class DecodeBase64StringError extends Error {
      constructor() {
          super(...arguments);
          this.name = 'DecodeBase64StringError';
      }
  }
  /**
   * URL-safe base64 encoding
   */
  const base64Encode = function (str) {
      const utf8Bytes = stringToByteArray$1(str);
      return base64.encodeByteArray(utf8Bytes, true);
  };
  /**
   * URL-safe base64 encoding (without "." padding in the end).
   * e.g. Used in JSON Web Token (JWT) parts.
   */
  const base64urlEncodeWithoutPadding = function (str) {
      // Use base64url encoding and remove padding in the end (dot characters).
      return base64Encode(str).replace(/\./g, '');
  };
  /**
   * URL-safe base64 decoding
   *
   * NOTE: DO NOT use the global atob() function - it does NOT support the
   * base64Url variant encoding.
   *
   * @param str To be decoded
   * @return Decoded result, if possible
   */
  const base64Decode = function (str) {
      try {
          return base64.decodeString(str, true);
      }
      catch (e) {
          console.error('base64Decode failed: ', e);
      }
      return null;
  };

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
   * Polyfill for `globalThis` object.
   * @returns the `globalThis` object for the given environment.
   * @public
   */
  function getGlobal() {
      if (typeof self !== 'undefined') {
          return self;
      }
      if (typeof window !== 'undefined') {
          return window;
      }
      if (typeof global$1 !== 'undefined') {
          return global$1;
      }
      throw new Error('Unable to locate global object.');
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
  const getDefaultsFromGlobal = () => getGlobal().__FIREBASE_DEFAULTS__;
  /**
   * Attempt to read defaults from a JSON string provided to
   * process(.)env(.)__FIREBASE_DEFAULTS__ or a JSON file whose path is in
   * process(.)env(.)__FIREBASE_DEFAULTS_PATH__
   * The dots are in parens because certain compilers (Vite?) cannot
   * handle seeing that variable in comments.
   * See https://github.com/firebase/firebase-js-sdk/issues/6838
   */
  const getDefaultsFromEnvVariable = () => {
      if (typeof browser$1 === 'undefined' || typeof browser$1.env === 'undefined') {
          return;
      }
      const defaultsJsonString = browser$1.env.__FIREBASE_DEFAULTS__;
      if (defaultsJsonString) {
          return JSON.parse(defaultsJsonString);
      }
  };
  const getDefaultsFromCookie = () => {
      if (typeof document === 'undefined') {
          return;
      }
      let match;
      try {
          match = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
      }
      catch (e) {
          // Some environments such as Angular Universal SSR have a
          // `document` object but error on accessing `document.cookie`.
          return;
      }
      const decoded = match && base64Decode(match[1]);
      return decoded && JSON.parse(decoded);
  };
  /**
   * Get the __FIREBASE_DEFAULTS__ object. It checks in order:
   * (1) if such an object exists as a property of `globalThis`
   * (2) if such an object was provided on a shell environment variable
   * (3) if such an object exists in a cookie
   * @public
   */
  const getDefaults = () => {
      try {
          return (getDefaultsFromPostinstall() ||
              getDefaultsFromGlobal() ||
              getDefaultsFromEnvVariable() ||
              getDefaultsFromCookie());
      }
      catch (e) {
          /**
           * Catch-all for being unable to get __FIREBASE_DEFAULTS__ due
           * to any environment case we have not accounted for. Log to
           * info instead of swallowing so we can find these unknown cases
           * and add paths for them if needed.
           */
          console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
          return;
      }
  };
  /**
   * Returns emulator host stored in the __FIREBASE_DEFAULTS__ object
   * for the given product.
   * @returns a URL host formatted like `127.0.0.1:9999` or `[::1]:4000` if available
   * @public
   */
  const getDefaultEmulatorHost = (productName) => getDefaults()?.emulatorHosts?.[productName];
  /**
   * Returns emulator hostname and port stored in the __FIREBASE_DEFAULTS__ object
   * for the given product.
   * @returns a pair of hostname and port like `["::1", 4000]` if available
   * @public
   */
  const getDefaultEmulatorHostnameAndPort = (productName) => {
      const host = getDefaultEmulatorHost(productName);
      if (!host) {
          return undefined;
      }
      const separatorIndex = host.lastIndexOf(':'); // Finding the last since IPv6 addr also has colons.
      if (separatorIndex <= 0 || separatorIndex + 1 === host.length) {
          throw new Error(`Invalid host ${host} with no separate hostname and port!`);
      }
      // eslint-disable-next-line no-restricted-globals
      const port = parseInt(host.substring(separatorIndex + 1), 10);
      if (host[0] === '[') {
          // Bracket-quoted `[ipv6addr]:port` => return "ipv6addr" (without brackets).
          return [host.substring(1, separatorIndex - 1), port];
      }
      else {
          return [host.substring(0, separatorIndex), port];
      }
  };
  /**
   * Returns Firebase app config stored in the __FIREBASE_DEFAULTS__ object.
   * @public
   */
  const getDefaultAppConfig = () => getDefaults()?.config;

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
  class Deferred {
      constructor() {
          this.reject = () => { };
          this.resolve = () => { };
          this.promise = new Promise((resolve, reject) => {
              this.resolve = resolve;
              this.reject = reject;
          });
      }
      /**
       * Our API internals are not promisified and cannot because our callback APIs have subtle expectations around
       * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
       * and returns a node-style callback which will resolve or reject the Deferred's promise.
       */
      wrapCallback(callback) {
          return (error, value) => {
              if (error) {
                  this.reject(error);
              }
              else {
                  this.resolve(value);
              }
              if (typeof callback === 'function') {
                  // Attaching noop handler just in case developer wasn't expecting
                  // promises
                  this.promise.catch(() => { });
                  // Some of our callbacks don't expect a value and our own tests
                  // assert that the parameter length is 1
                  if (callback.length === 1) {
                      callback(error);
                  }
                  else {
                      callback(error, value);
                  }
              }
          };
      }
  }

  /**
   * @license
   * Copyright 2025 Google LLC
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
   * Checks whether host is a cloud workstation or not.
   * @public
   */
  function isCloudWorkstation(url) {
      // `isCloudWorkstation` is called without protocol in certain connect*Emulator functions
      // In HTTP request builders, it's called with the protocol.
      // If called with protocol prefix, it's a valid URL, so we extract the hostname
      // If called without, we assume the string is the hostname.
      try {
          const host = url.startsWith('http://') || url.startsWith('https://')
              ? new URL(url).hostname
              : url;
          return host.endsWith('.cloudworkstations.dev');
      }
      catch {
          return false;
      }
  }
  /**
   * Makes a fetch request to the given server.
   * Mostly used for forwarding cookies in Firebase Studio.
   * @public
   */
  async function pingServer(endpoint) {
      const result = await fetch(endpoint, {
          credentials: 'include'
      });
      return result.ok;
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
  function createMockUserToken(token, projectId) {
      if (token.uid) {
          throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');
      }
      // Unsecured JWTs use "none" as the algorithm.
      const header = {
          alg: 'none',
          type: 'JWT'
      };
      const project = projectId || 'demo-project';
      const iat = token.iat || 0;
      const sub = token.sub || token.user_id;
      if (!sub) {
          throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");
      }
      const payload = {
          // Set all required fields to decent defaults
          iss: `https://securetoken.google.com/${project}`,
          aud: project,
          iat,
          exp: iat + 3600,
          auth_time: iat,
          sub,
          user_id: sub,
          firebase: {
              sign_in_provider: 'custom',
              identities: {}
          },
          // Override with user options
          ...token
      };
      // Unsecured JWTs use the empty string as a signature.
      const signature = '';
      return [
          base64urlEncodeWithoutPadding(JSON.stringify(header)),
          base64urlEncodeWithoutPadding(JSON.stringify(payload)),
          signature
      ].join('.');
  }
  const emulatorStatus = {};
  // Checks whether any products are running on an emulator
  function getEmulatorSummary() {
      const summary = {
          prod: [],
          emulator: []
      };
      for (const key of Object.keys(emulatorStatus)) {
          if (emulatorStatus[key]) {
              summary.emulator.push(key);
          }
          else {
              summary.prod.push(key);
          }
      }
      return summary;
  }
  function getOrCreateEl(id) {
      let parentDiv = document.getElementById(id);
      let created = false;
      if (!parentDiv) {
          parentDiv = document.createElement('div');
          parentDiv.setAttribute('id', id);
          created = true;
      }
      return { created, element: parentDiv };
  }
  let previouslyDismissed = false;
  /**
   * Updates Emulator Banner. Primarily used for Firebase Studio
   * @param name
   * @param isRunningEmulator
   * @public
   */
  function updateEmulatorBanner(name, isRunningEmulator) {
      if (typeof window === 'undefined' ||
          typeof document === 'undefined' ||
          !isCloudWorkstation(window.location.host) ||
          emulatorStatus[name] === isRunningEmulator ||
          emulatorStatus[name] || // If already set to use emulator, can't go back to prod.
          previouslyDismissed) {
          return;
      }
      emulatorStatus[name] = isRunningEmulator;
      function prefixedId(id) {
          return `__firebase__banner__${id}`;
      }
      const bannerId = '__firebase__banner';
      const summary = getEmulatorSummary();
      const showError = summary.prod.length > 0;
      function tearDown() {
          const element = document.getElementById(bannerId);
          if (element) {
              element.remove();
          }
      }
      function setupBannerStyles(bannerEl) {
          bannerEl.style.display = 'flex';
          bannerEl.style.background = '#7faaf0';
          bannerEl.style.position = 'fixed';
          bannerEl.style.bottom = '5px';
          bannerEl.style.left = '5px';
          bannerEl.style.padding = '.5em';
          bannerEl.style.borderRadius = '5px';
          bannerEl.style.alignItems = 'center';
      }
      function setupIconStyles(prependIcon, iconId) {
          prependIcon.setAttribute('width', '24');
          prependIcon.setAttribute('id', iconId);
          prependIcon.setAttribute('height', '24');
          prependIcon.setAttribute('viewBox', '0 0 24 24');
          prependIcon.setAttribute('fill', 'none');
          prependIcon.style.marginLeft = '-6px';
      }
      function setupCloseBtn() {
          const closeBtn = document.createElement('span');
          closeBtn.style.cursor = 'pointer';
          closeBtn.style.marginLeft = '16px';
          closeBtn.style.fontSize = '24px';
          closeBtn.innerHTML = ' &times;';
          closeBtn.onclick = () => {
              previouslyDismissed = true;
              tearDown();
          };
          return closeBtn;
      }
      function setupLinkStyles(learnMoreLink, learnMoreId) {
          learnMoreLink.setAttribute('id', learnMoreId);
          learnMoreLink.innerText = 'Learn more';
          learnMoreLink.href =
              'https://firebase.google.com/docs/studio/preview-apps#preview-backend';
          learnMoreLink.setAttribute('target', '__blank');
          learnMoreLink.style.paddingLeft = '5px';
          learnMoreLink.style.textDecoration = 'underline';
      }
      function setupDom() {
          const banner = getOrCreateEl(bannerId);
          const firebaseTextId = prefixedId('text');
          const firebaseText = document.getElementById(firebaseTextId) || document.createElement('span');
          const learnMoreId = prefixedId('learnmore');
          const learnMoreLink = document.getElementById(learnMoreId) ||
              document.createElement('a');
          const prependIconId = prefixedId('preprendIcon');
          const prependIcon = document.getElementById(prependIconId) ||
              document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          if (banner.created) {
              // update styles
              const bannerEl = banner.element;
              setupBannerStyles(bannerEl);
              setupLinkStyles(learnMoreLink, learnMoreId);
              const closeBtn = setupCloseBtn();
              setupIconStyles(prependIcon, prependIconId);
              bannerEl.append(prependIcon, firebaseText, learnMoreLink, closeBtn);
              document.body.appendChild(bannerEl);
          }
          if (showError) {
              firebaseText.innerText = `Preview backend disconnected.`;
              prependIcon.innerHTML = `<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`;
          }
          else {
              prependIcon.innerHTML = `<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`;
              firebaseText.innerText = 'Preview backend running in this workspace.';
          }
          firebaseText.setAttribute('id', firebaseTextId);
      }
      if (document.readyState === 'loading') {
          window.addEventListener('DOMContentLoaded', setupDom);
      }
      else {
          setupDom();
      }
  }
  /**
   * This method checks if indexedDB is supported by current browser/service worker context
   * @return true if indexedDB is supported by current browser/service worker context
   */
  function isIndexedDBAvailable() {
      try {
          return typeof indexedDB === 'object';
      }
      catch (e) {
          return false;
      }
  }
  /**
   * This method validates browser/sw context for indexedDB by opening a dummy indexedDB database and reject
   * if errors occur during the database open operation.
   *
   * @throws exception if current browser/sw context can't run idb.open (ex: Safari iframe, Firefox
   * private browsing)
   */
  function validateIndexedDBOpenable() {
      return new Promise((resolve, reject) => {
          try {
              let preExist = true;
              const DB_CHECK_NAME = 'validate-browser-context-for-indexeddb-analytics-module';
              const request = self.indexedDB.open(DB_CHECK_NAME);
              request.onsuccess = () => {
                  request.result.close();
                  // delete database only when it doesn't pre-exist
                  if (!preExist) {
                      self.indexedDB.deleteDatabase(DB_CHECK_NAME);
                  }
                  resolve(true);
              };
              request.onupgradeneeded = () => {
                  preExist = false;
              };
              request.onerror = () => {
                  reject(request.error?.message || '');
              };
          }
          catch (error) {
              reject(error);
          }
      });
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
   * @fileoverview Standardized Firebase Error.
   *
   * Usage:
   *
   *   // TypeScript string literals for type-safe codes
   *   type Err =
   *     'unknown' |
   *     'object-not-found'
   *     ;
   *
   *   // Closure enum for type-safe error codes
   *   // at-enum {string}
   *   var Err = {
   *     UNKNOWN: 'unknown',
   *     OBJECT_NOT_FOUND: 'object-not-found',
   *   }
   *
   *   let errors: Map<Err, string> = {
   *     'generic-error': "Unknown error",
   *     'file-not-found': "Could not find file: {$file}",
   *   };
   *
   *   // Type-safe function - must pass a valid error code as param.
   *   let error = new ErrorFactory<Err>('service', 'Service', errors);
   *
   *   ...
   *   throw error.create(Err.GENERIC);
   *   ...
   *   throw error.create(Err.FILE_NOT_FOUND, {'file': fileName});
   *   ...
   *   // Service: Could not file file: foo.txt (service/file-not-found).
   *
   *   catch (e) {
   *     assert(e.message === "Could not find file: foo.txt.");
   *     if ((e as FirebaseError)?.code === 'service/file-not-found') {
   *       console.log("Could not read file: " + e['file']);
   *     }
   *   }
   */
  const ERROR_NAME = 'FirebaseError';
  // Based on code from:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
  class FirebaseError extends Error {
      constructor(
      /** The error code for this error. */
      code, message,
      /** Custom data for this error. */
      customData) {
          super(message);
          this.code = code;
          this.customData = customData;
          /** The custom name for all FirebaseErrors. */
          this.name = ERROR_NAME;
          // Fix For ES5
          // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
          // TODO(dlarocque): Replace this with `new.target`: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
          //                   which we can now use since we no longer target ES5.
          Object.setPrototypeOf(this, FirebaseError.prototype);
          // Maintains proper stack trace for where our error was thrown.
          // Only available on V8.
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
          const customData = data[0] || {};
          const fullCode = `${this.service}/${code}`;
          const template = this.errors[code];
          const message = template ? replaceTemplate(template, customData) : 'Error';
          // Service Name: Error message (service/code).
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
  /**
   * Deep equal two objects. Support Arrays and Objects.
   */
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
          }
          else if (aProp !== bProp) {
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
      return thing !== null && typeof thing === 'object';
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
  function getModularInstance(service) {
      if (service && service._delegate) {
          return service._delegate;
      }
      else {
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
          // if multipleInstances is not supported, use the default name
          const normalizedIdentifier = this.normalizeInstanceIdentifier(options?.identifier);
          const optional = options?.optional ?? false;
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
          const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
          const existingCallbacks = this.onInitCallbacks.get(normalizedIdentifier) ??
              new Set();
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
              catch {
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
                  catch {
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
  var LogLevel;
  (function (LogLevel) {
      LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
      LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
      LogLevel[LogLevel["INFO"] = 2] = "INFO";
      LogLevel[LogLevel["WARN"] = 3] = "WARN";
      LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
      LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
  })(LogLevel || (LogLevel = {}));
  const levelStringToEnum = {
      'debug': LogLevel.DEBUG,
      'verbose': LogLevel.VERBOSE,
      'info': LogLevel.INFO,
      'warn': LogLevel.WARN,
      'error': LogLevel.ERROR,
      'silent': LogLevel.SILENT
  };
  /**
   * The default log level
   */
  const defaultLogLevel = LogLevel.INFO;
  /**
   * By default, `console.debug` is not displayed in the developer console (in
   * chrome). To avoid forcing users to have to opt-in to these logs twice
   * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
   * logs to the `console.log` function.
   */
  const ConsoleMethod = {
      [LogLevel.DEBUG]: 'log',
      [LogLevel.VERBOSE]: 'log',
      [LogLevel.INFO]: 'info',
      [LogLevel.WARN]: 'warn',
      [LogLevel.ERROR]: 'error'
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
      }
      get logLevel() {
          return this._logLevel;
      }
      set logLevel(val) {
          if (!(val in LogLevel)) {
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
          this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
          this._logHandler(this, LogLevel.DEBUG, ...args);
      }
      log(...args) {
          this._userLogHandler &&
              this._userLogHandler(this, LogLevel.VERBOSE, ...args);
          this._logHandler(this, LogLevel.VERBOSE, ...args);
      }
      info(...args) {
          this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
          this._logHandler(this, LogLevel.INFO, ...args);
      }
      warn(...args) {
          this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
          this._logHandler(this, LogLevel.WARN, ...args);
      }
      error(...args) {
          this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
          this._logHandler(this, LogLevel.ERROR, ...args);
      }
  }

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
      return component?.type === "VERSION" /* ComponentType.VERSION */;
  }

  const name$q = "@firebase/app";
  const version$1 = "0.14.9";

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
  const logger = new Logger('@firebase/app');

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

  const name$2 = "@firebase/ai";

  const name$1 = "@firebase/firestore-compat";

  const name$r = "firebase";
  const version$2 = "12.10.0";

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
   *
   * @param obj - an object of type FirebaseApp.
   *
   * @returns true if the provided object is of type FirebaseServerAppImpl.
   *
   * @internal
   */
  function _isFirebaseServerApp(obj) {
      if (obj === null || obj === undefined) {
          return false;
      }
      return obj.settings !== undefined;
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
          this._options = { ...options };
          this._config = { ...config };
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
      const config = {
          name: DEFAULT_ENTRY_NAME,
          automaticDataCollectionEnabled: true,
          ...rawConfig
      };
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
      // TODO: We can use this check to whitelist strings when/if we set up
      // a good whitelist system.
      let library = PLATFORM_LOG_STRING[libraryKeyOrName] ?? libraryKeyOrName;
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
                  originalErrorMessage: e?.message
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
                  originalErrorMessage: e?.message
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
  const MAX_NUM_STORED_HEARTBEATS = 30;
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
          try {
              const platformLogger = this.container
                  .getProvider('platform-logger')
                  .getImmediate();
              // This is the "Firebase user agent" string from the platform logger
              // service, not the browser user agent.
              const agent = platformLogger.getPlatformInfoString();
              const date = getUTCDateString();
              if (this._heartbeatsCache?.heartbeats == null) {
                  this._heartbeatsCache = await this._heartbeatsCachePromise;
                  // If we failed to construct a heartbeats cache, then return immediately.
                  if (this._heartbeatsCache?.heartbeats == null) {
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
                  // If the number of stored heartbeats exceeds the maximum number of stored heartbeats, remove the heartbeat with the earliest date.
                  // Since this is executed each time a heartbeat is pushed, the limit can only be exceeded by one, so only one needs to be removed.
                  if (this._heartbeatsCache.heartbeats.length > MAX_NUM_STORED_HEARTBEATS) {
                      const earliestHeartbeatIdx = getEarliestHeartbeatIdx(this._heartbeatsCache.heartbeats);
                      this._heartbeatsCache.heartbeats.splice(earliestHeartbeatIdx, 1);
                  }
              }
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
          try {
              if (this._heartbeatsCache === null) {
                  await this._heartbeatsCachePromise;
              }
              // If it's still null or the array is empty, there is no data to send.
              if (this._heartbeatsCache?.heartbeats == null ||
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
              if (idbHeartbeatObject?.heartbeats) {
                  return idbHeartbeatObject;
              }
              else {
                  return { heartbeats: [] };
              }
          }
      }
      // overwrite the storage with the provided heartbeats
      async overwrite(heartbeatsObject) {
          const canUseIndexedDB = await this._canUseIndexedDBPromise;
          if (!canUseIndexedDB) {
              return;
          }
          else {
              const existingHeartbeatsObject = await this.read();
              return writeHeartbeatsToIndexedDB(this.app, {
                  lastSentHeartbeatDate: heartbeatsObject.lastSentHeartbeatDate ??
                      existingHeartbeatsObject.lastSentHeartbeatDate,
                  heartbeats: heartbeatsObject.heartbeats
              });
          }
      }
      // add heartbeats
      async add(heartbeatsObject) {
          const canUseIndexedDB = await this._canUseIndexedDBPromise;
          if (!canUseIndexedDB) {
              return;
          }
          else {
              const existingHeartbeatsObject = await this.read();
              return writeHeartbeatsToIndexedDB(this.app, {
                  lastSentHeartbeatDate: heartbeatsObject.lastSentHeartbeatDate ??
                      existingHeartbeatsObject.lastSentHeartbeatDate,
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
   * Returns the index of the heartbeat with the earliest date.
   * If the heartbeats array is empty, -1 is returned.
   */
  function getEarliestHeartbeatIdx(heartbeats) {
      if (heartbeats.length === 0) {
          return -1;
      }
      let earliestHeartbeatIdx = 0;
      let earliestHeartbeatDate = heartbeats[0].date;
      for (let i = 1; i < heartbeats.length; i++) {
          if (heartbeats[i].date < earliestHeartbeatDate) {
              earliestHeartbeatDate = heartbeats[i].date;
              earliestHeartbeatIdx = i;
          }
      }
      return earliestHeartbeatIdx;
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
      // BUILD_TARGET will be replaced by values like esm, cjs, etc during the compilation
      registerVersion(name$q, version$1, 'esm2020');
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
  var version = "12.10.0";

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

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global$1 !== 'undefined' ? global$1 : typeof self !== 'undefined' ? self : {};

  /** @license
  Copyright The Closure Library Authors.
  SPDX-License-Identifier: Apache-2.0
  */

  var Integer;
  (function() {var h;/** @license

   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */
  function k(d,a){function c(){}c.prototype=a.prototype;d.F=a.prototype;d.prototype=new c;d.prototype.constructor=d;d.D=function(f,e,g){for(var b=Array(arguments.length-2),r=2;r<arguments.length;r++)b[r-2]=arguments[r];return a.prototype[e].apply(f,b)};}function l(){this.blockSize=-1;}function m(){this.blockSize=-1;this.blockSize=64;this.g=Array(4);this.C=Array(this.blockSize);this.o=this.h=0;this.u();}k(m,l);m.prototype.u=function(){this.g[0]=1732584193;this.g[1]=4023233417;this.g[2]=2562383102;this.g[3]=271733878;this.o=this.h=0;};
  function n(d,a,c){c||(c=0);const f=Array(16);if(typeof a==="string")for(var e=0;e<16;++e)f[e]=a.charCodeAt(c++)|a.charCodeAt(c++)<<8|a.charCodeAt(c++)<<16|a.charCodeAt(c++)<<24;else for(e=0;e<16;++e)f[e]=a[c++]|a[c++]<<8|a[c++]<<16|a[c++]<<24;a=d.g[0];c=d.g[1];e=d.g[2];let g=d.g[3],b;b=a+(g^c&(e^g))+f[0]+3614090360&4294967295;a=c+(b<<7&4294967295|b>>>25);b=g+(e^a&(c^e))+f[1]+3905402710&4294967295;g=a+(b<<12&4294967295|b>>>20);b=e+(c^g&(a^c))+f[2]+606105819&4294967295;e=g+(b<<17&4294967295|b>>>15);
  b=c+(a^e&(g^a))+f[3]+3250441966&4294967295;c=e+(b<<22&4294967295|b>>>10);b=a+(g^c&(e^g))+f[4]+4118548399&4294967295;a=c+(b<<7&4294967295|b>>>25);b=g+(e^a&(c^e))+f[5]+1200080426&4294967295;g=a+(b<<12&4294967295|b>>>20);b=e+(c^g&(a^c))+f[6]+2821735955&4294967295;e=g+(b<<17&4294967295|b>>>15);b=c+(a^e&(g^a))+f[7]+4249261313&4294967295;c=e+(b<<22&4294967295|b>>>10);b=a+(g^c&(e^g))+f[8]+1770035416&4294967295;a=c+(b<<7&4294967295|b>>>25);b=g+(e^a&(c^e))+f[9]+2336552879&4294967295;g=a+(b<<12&4294967295|
  b>>>20);b=e+(c^g&(a^c))+f[10]+4294925233&4294967295;e=g+(b<<17&4294967295|b>>>15);b=c+(a^e&(g^a))+f[11]+2304563134&4294967295;c=e+(b<<22&4294967295|b>>>10);b=a+(g^c&(e^g))+f[12]+1804603682&4294967295;a=c+(b<<7&4294967295|b>>>25);b=g+(e^a&(c^e))+f[13]+4254626195&4294967295;g=a+(b<<12&4294967295|b>>>20);b=e+(c^g&(a^c))+f[14]+2792965006&4294967295;e=g+(b<<17&4294967295|b>>>15);b=c+(a^e&(g^a))+f[15]+1236535329&4294967295;c=e+(b<<22&4294967295|b>>>10);b=a+(e^g&(c^e))+f[1]+4129170786&4294967295;a=c+(b<<
  5&4294967295|b>>>27);b=g+(c^e&(a^c))+f[6]+3225465664&4294967295;g=a+(b<<9&4294967295|b>>>23);b=e+(a^c&(g^a))+f[11]+643717713&4294967295;e=g+(b<<14&4294967295|b>>>18);b=c+(g^a&(e^g))+f[0]+3921069994&4294967295;c=e+(b<<20&4294967295|b>>>12);b=a+(e^g&(c^e))+f[5]+3593408605&4294967295;a=c+(b<<5&4294967295|b>>>27);b=g+(c^e&(a^c))+f[10]+38016083&4294967295;g=a+(b<<9&4294967295|b>>>23);b=e+(a^c&(g^a))+f[15]+3634488961&4294967295;e=g+(b<<14&4294967295|b>>>18);b=c+(g^a&(e^g))+f[4]+3889429448&4294967295;c=
  e+(b<<20&4294967295|b>>>12);b=a+(e^g&(c^e))+f[9]+568446438&4294967295;a=c+(b<<5&4294967295|b>>>27);b=g+(c^e&(a^c))+f[14]+3275163606&4294967295;g=a+(b<<9&4294967295|b>>>23);b=e+(a^c&(g^a))+f[3]+4107603335&4294967295;e=g+(b<<14&4294967295|b>>>18);b=c+(g^a&(e^g))+f[8]+1163531501&4294967295;c=e+(b<<20&4294967295|b>>>12);b=a+(e^g&(c^e))+f[13]+2850285829&4294967295;a=c+(b<<5&4294967295|b>>>27);b=g+(c^e&(a^c))+f[2]+4243563512&4294967295;g=a+(b<<9&4294967295|b>>>23);b=e+(a^c&(g^a))+f[7]+1735328473&4294967295;
  e=g+(b<<14&4294967295|b>>>18);b=c+(g^a&(e^g))+f[12]+2368359562&4294967295;c=e+(b<<20&4294967295|b>>>12);b=a+(c^e^g)+f[5]+4294588738&4294967295;a=c+(b<<4&4294967295|b>>>28);b=g+(a^c^e)+f[8]+2272392833&4294967295;g=a+(b<<11&4294967295|b>>>21);b=e+(g^a^c)+f[11]+1839030562&4294967295;e=g+(b<<16&4294967295|b>>>16);b=c+(e^g^a)+f[14]+4259657740&4294967295;c=e+(b<<23&4294967295|b>>>9);b=a+(c^e^g)+f[1]+2763975236&4294967295;a=c+(b<<4&4294967295|b>>>28);b=g+(a^c^e)+f[4]+1272893353&4294967295;g=a+(b<<11&4294967295|
  b>>>21);b=e+(g^a^c)+f[7]+4139469664&4294967295;e=g+(b<<16&4294967295|b>>>16);b=c+(e^g^a)+f[10]+3200236656&4294967295;c=e+(b<<23&4294967295|b>>>9);b=a+(c^e^g)+f[13]+681279174&4294967295;a=c+(b<<4&4294967295|b>>>28);b=g+(a^c^e)+f[0]+3936430074&4294967295;g=a+(b<<11&4294967295|b>>>21);b=e+(g^a^c)+f[3]+3572445317&4294967295;e=g+(b<<16&4294967295|b>>>16);b=c+(e^g^a)+f[6]+76029189&4294967295;c=e+(b<<23&4294967295|b>>>9);b=a+(c^e^g)+f[9]+3654602809&4294967295;a=c+(b<<4&4294967295|b>>>28);b=g+(a^c^e)+f[12]+
  3873151461&4294967295;g=a+(b<<11&4294967295|b>>>21);b=e+(g^a^c)+f[15]+530742520&4294967295;e=g+(b<<16&4294967295|b>>>16);b=c+(e^g^a)+f[2]+3299628645&4294967295;c=e+(b<<23&4294967295|b>>>9);b=a+(e^(c|~g))+f[0]+4096336452&4294967295;a=c+(b<<6&4294967295|b>>>26);b=g+(c^(a|~e))+f[7]+1126891415&4294967295;g=a+(b<<10&4294967295|b>>>22);b=e+(a^(g|~c))+f[14]+2878612391&4294967295;e=g+(b<<15&4294967295|b>>>17);b=c+(g^(e|~a))+f[5]+4237533241&4294967295;c=e+(b<<21&4294967295|b>>>11);b=a+(e^(c|~g))+f[12]+1700485571&
  4294967295;a=c+(b<<6&4294967295|b>>>26);b=g+(c^(a|~e))+f[3]+2399980690&4294967295;g=a+(b<<10&4294967295|b>>>22);b=e+(a^(g|~c))+f[10]+4293915773&4294967295;e=g+(b<<15&4294967295|b>>>17);b=c+(g^(e|~a))+f[1]+2240044497&4294967295;c=e+(b<<21&4294967295|b>>>11);b=a+(e^(c|~g))+f[8]+1873313359&4294967295;a=c+(b<<6&4294967295|b>>>26);b=g+(c^(a|~e))+f[15]+4264355552&4294967295;g=a+(b<<10&4294967295|b>>>22);b=e+(a^(g|~c))+f[6]+2734768916&4294967295;e=g+(b<<15&4294967295|b>>>17);b=c+(g^(e|~a))+f[13]+1309151649&
  4294967295;c=e+(b<<21&4294967295|b>>>11);b=a+(e^(c|~g))+f[4]+4149444226&4294967295;a=c+(b<<6&4294967295|b>>>26);b=g+(c^(a|~e))+f[11]+3174756917&4294967295;g=a+(b<<10&4294967295|b>>>22);b=e+(a^(g|~c))+f[2]+718787259&4294967295;e=g+(b<<15&4294967295|b>>>17);b=c+(g^(e|~a))+f[9]+3951481745&4294967295;d.g[0]=d.g[0]+a&4294967295;d.g[1]=d.g[1]+(e+(b<<21&4294967295|b>>>11))&4294967295;d.g[2]=d.g[2]+e&4294967295;d.g[3]=d.g[3]+g&4294967295;}
  m.prototype.v=function(d,a){a===void 0&&(a=d.length);const c=a-this.blockSize,f=this.C;let e=this.h,g=0;for(;g<a;){if(e==0)for(;g<=c;)n(this,d,g),g+=this.blockSize;if(typeof d==="string")for(;g<a;){if(f[e++]=d.charCodeAt(g++),e==this.blockSize){n(this,f);e=0;break}}else for(;g<a;)if(f[e++]=d[g++],e==this.blockSize){n(this,f);e=0;break}}this.h=e;this.o+=a;};
  m.prototype.A=function(){var d=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);d[0]=128;for(var a=1;a<d.length-8;++a)d[a]=0;a=this.o*8;for(var c=d.length-8;c<d.length;++c)d[c]=a&255,a/=256;this.v(d);d=Array(16);a=0;for(c=0;c<4;++c)for(let f=0;f<32;f+=8)d[a++]=this.g[c]>>>f&255;return d};function p(d,a){var c=q;return Object.prototype.hasOwnProperty.call(c,d)?c[d]:c[d]=a(d)}function t(d,a){this.h=a;const c=[];let f=true;for(let e=d.length-1;e>=0;e--){const g=d[e]|0;f&&g==a||(c[e]=g,f=false);}this.g=c;}var q={};function u(d){return -128<=d&&d<128?p(d,function(a){return new t([a|0],a<0?-1:0)}):new t([d|0],d<0?-1:0)}function v(d){if(isNaN(d)||!isFinite(d))return w;if(d<0)return x(v(-d));const a=[];let c=1;for(let f=0;d>=c;f++)a[f]=d/c|0,c*=4294967296;return new t(a,0)}
  function y(d,a){if(d.length==0)throw Error("number format error: empty string");a=a||10;if(a<2||36<a)throw Error("radix out of range: "+a);if(d.charAt(0)=="-")return x(y(d.substring(1),a));if(d.indexOf("-")>=0)throw Error('number format error: interior "-" character');const c=v(Math.pow(a,8));let f=w;for(let g=0;g<d.length;g+=8){var e=Math.min(8,d.length-g);const b=parseInt(d.substring(g,g+e),a);e<8?(e=v(Math.pow(a,e)),f=f.j(e).add(v(b))):(f=f.j(c),f=f.add(v(b)));}return f}var w=u(0),z=u(1),A=u(16777216);
  h=t.prototype;h.m=function(){if(B(this))return -x(this).m();let d=0,a=1;for(let c=0;c<this.g.length;c++){const f=this.i(c);d+=(f>=0?f:4294967296+f)*a;a*=4294967296;}return d};
  h.toString=function(d){d=d||10;if(d<2||36<d)throw Error("radix out of range: "+d);if(C(this))return "0";if(B(this))return "-"+x(this).toString(d);const a=v(Math.pow(d,6));var c=this;let f="";for(;;){const e=D(c,a).g;c=F(c,e.j(a));let g=((c.g.length>0?c.g[0]:c.h)>>>0).toString(d);c=e;if(C(c))return g+f;for(;g.length<6;)g="0"+g;f=g+f;}};h.i=function(d){return d<0?0:d<this.g.length?this.g[d]:this.h};function C(d){if(d.h!=0)return false;for(let a=0;a<d.g.length;a++)if(d.g[a]!=0)return false;return true}
  function B(d){return d.h==-1}h.l=function(d){d=F(this,d);return B(d)?-1:C(d)?0:1};function x(d){const a=d.g.length,c=[];for(let f=0;f<a;f++)c[f]=~d.g[f];return (new t(c,~d.h)).add(z)}h.abs=function(){return B(this)?x(this):this};h.add=function(d){const a=Math.max(this.g.length,d.g.length),c=[];let f=0;for(let e=0;e<=a;e++){let g=f+(this.i(e)&65535)+(d.i(e)&65535),b=(g>>>16)+(this.i(e)>>>16)+(d.i(e)>>>16);f=b>>>16;g&=65535;b&=65535;c[e]=b<<16|g;}return new t(c,c[c.length-1]&-2147483648?-1:0)};
  function F(d,a){return d.add(x(a))}
  h.j=function(d){if(C(this)||C(d))return w;if(B(this))return B(d)?x(this).j(x(d)):x(x(this).j(d));if(B(d))return x(this.j(x(d)));if(this.l(A)<0&&d.l(A)<0)return v(this.m()*d.m());const a=this.g.length+d.g.length,c=[];for(var f=0;f<2*a;f++)c[f]=0;for(f=0;f<this.g.length;f++)for(let e=0;e<d.g.length;e++){const g=this.i(f)>>>16,b=this.i(f)&65535,r=d.i(e)>>>16,E=d.i(e)&65535;c[2*f+2*e]+=b*E;G(c,2*f+2*e);c[2*f+2*e+1]+=g*E;G(c,2*f+2*e+1);c[2*f+2*e+1]+=b*r;G(c,2*f+2*e+1);c[2*f+2*e+2]+=g*r;G(c,2*f+2*e+2);}for(d=
  0;d<a;d++)c[d]=c[2*d+1]<<16|c[2*d];for(d=a;d<2*a;d++)c[d]=0;return new t(c,0)};function G(d,a){for(;(d[a]&65535)!=d[a];)d[a+1]+=d[a]>>>16,d[a]&=65535,a++;}function H(d,a){this.g=d;this.h=a;}
  function D(d,a){if(C(a))throw Error("division by zero");if(C(d))return new H(w,w);if(B(d))return a=D(x(d),a),new H(x(a.g),x(a.h));if(B(a))return a=D(d,x(a)),new H(x(a.g),a.h);if(d.g.length>30){if(B(d)||B(a))throw Error("slowDivide_ only works with positive integers.");for(var c=z,f=a;f.l(d)<=0;)c=I(c),f=I(f);var e=J(c,1),g=J(f,1);f=J(f,2);for(c=J(c,2);!C(f);){var b=g.add(f);b.l(d)<=0&&(e=e.add(c),g=b);f=J(f,1);c=J(c,1);}a=F(d,e.j(a));return new H(e,a)}for(e=w;d.l(a)>=0;){c=Math.max(1,Math.floor(d.m()/
  a.m()));f=Math.ceil(Math.log(c)/Math.LN2);f=f<=48?1:Math.pow(2,f-48);g=v(c);for(b=g.j(a);B(b)||b.l(d)>0;)c-=f,g=v(c),b=g.j(a);C(g)&&(g=z);e=e.add(g);d=F(d,b);}return new H(e,d)}h.B=function(d){return D(this,d).h};h.and=function(d){const a=Math.max(this.g.length,d.g.length),c=[];for(let f=0;f<a;f++)c[f]=this.i(f)&d.i(f);return new t(c,this.h&d.h)};h.or=function(d){const a=Math.max(this.g.length,d.g.length),c=[];for(let f=0;f<a;f++)c[f]=this.i(f)|d.i(f);return new t(c,this.h|d.h)};
  h.xor=function(d){const a=Math.max(this.g.length,d.g.length),c=[];for(let f=0;f<a;f++)c[f]=this.i(f)^d.i(f);return new t(c,this.h^d.h)};function I(d){const a=d.g.length+1,c=[];for(let f=0;f<a;f++)c[f]=d.i(f)<<1|d.i(f-1)>>>31;return new t(c,d.h)}function J(d,a){const c=a>>5;a%=32;const f=d.g.length-c,e=[];for(let g=0;g<f;g++)e[g]=a>0?d.i(g+c)>>>a|d.i(g+c+1)<<32-a:d.i(g+c);return new t(e,d.h)}m.prototype.digest=m.prototype.A;m.prototype.reset=m.prototype.u;m.prototype.update=m.prototype.v;t.prototype.add=t.prototype.add;t.prototype.multiply=t.prototype.j;t.prototype.modulo=t.prototype.B;t.prototype.compare=t.prototype.l;t.prototype.toNumber=t.prototype.m;t.prototype.toString=t.prototype.toString;t.prototype.getBits=t.prototype.i;t.fromNumber=v;t.fromString=y;Integer = t;}).apply( typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof self !== 'undefined' ? self  : typeof window !== 'undefined' ? window  : {});

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
   */ class User {
      constructor(e) {
          this.uid = e;
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
      isEqual(e) {
          return e.uid === this.uid;
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
  let d = "12.10.0";

  function __PRIVATE_setSDKVersion(e) {
      d = e;
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
  /** Formats an object as a JSON string, suitable for logging. */
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
  const m = new Logger("@firebase/firestore");

  function __PRIVATE_logDebug(e, ...t) {
      if (m.logLevel <= LogLevel.DEBUG) {
          const r = t.map(__PRIVATE_argToString);
          m.debug(`Firestore (${d}): ${e}`, ...r);
      }
  }

  function __PRIVATE_logError(e, ...t) {
      if (m.logLevel <= LogLevel.ERROR) {
          const r = t.map(__PRIVATE_argToString);
          m.error(`Firestore (${d}): ${e}`, ...r);
      }
  }

  /**
   * @internal
   */ function __PRIVATE_logWarn(e, ...t) {
      if (m.logLevel <= LogLevel.WARN) {
          const r = t.map(__PRIVATE_argToString);
          m.warn(`Firestore (${d}): ${e}`, ...r);
      }
  }

  /**
   * Converts an additional log parameter to a string representation.
   */ function __PRIVATE_argToString(e) {
      if ("string" == typeof e) return e;
      try {
          return function __PRIVATE_formatJSON(e) {
              return JSON.stringify(e);
          }(e);
      } catch (t) {
          // Converting to JSON failed, just log the object directly
          return e;
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
   */ function fail(e, t, r) {
      let n = "Unexpected state";
      "string" == typeof t ? n = t : r = t, __PRIVATE__fail(e, n, r);
  }

  function __PRIVATE__fail(e, t, r) {
      // Log the failure in addition to throw an exception, just in case the
      // exception is swallowed.
      let n = `FIRESTORE (${d}) INTERNAL ASSERTION FAILED: ${t} (ID: ${e.toString(16)})`;
      if (void 0 !== r) try {
          n += " CONTEXT: " + JSON.stringify(r);
      } catch (e) {
          n += " CONTEXT: " + r;
      }
      // NOTE: We don't use FirestoreError here because these are internal failures
      // that cannot be handled by the user. (Also it would create a circular
      // dependency between the error and assert modules which doesn't work.)
      throw __PRIVATE_logError(n), new Error(n);
  }

  function __PRIVATE_hardAssert(e, t, r, n) {
      let i = "Unexpected state";
      "string" == typeof r ? i = r : n = r, e || __PRIVATE__fail(t, i, n);
  }

  /**
   * Casts `obj` to `T`. In non-production builds, verifies that `obj` is an
   * instance of `T` before casting.
   */ function __PRIVATE_debugCast(e,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t) {
      return e;
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
   */ const E = {
      // Causes are copied from:
      // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
      /** Not an error; returned on success. */
      OK: "ok",
      /** The operation was cancelled (typically by the caller). */
      CANCELLED: "cancelled",
      /** Unknown error or an error from a different error domain. */
      UNKNOWN: "unknown",
      /**
       * Client specified an invalid argument. Note that this differs from
       * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
       * problematic regardless of the state of the system (e.g., a malformed file
       * name).
       */
      INVALID_ARGUMENT: "invalid-argument",
      /**
       * Deadline expired before operation could complete. For operations that
       * change the state of the system, this error may be returned even if the
       * operation has completed successfully. For example, a successful response
       * from a server could have been delayed long enough for the deadline to
       * expire.
       */
      DEADLINE_EXCEEDED: "deadline-exceeded",
      /** Some requested entity (e.g., file or directory) was not found. */
      NOT_FOUND: "not-found",
      /**
       * The caller does not have permission to execute the specified operation.
       * PERMISSION_DENIED must not be used for rejections caused by exhausting
       * some resource (use RESOURCE_EXHAUSTED instead for those errors).
       * PERMISSION_DENIED must not be used if the caller cannot be identified
       * (use UNAUTHENTICATED instead for those errors).
       */
      PERMISSION_DENIED: "permission-denied",
      /**
       * The request does not have valid authentication credentials for the
       * operation.
       */
      UNAUTHENTICATED: "unauthenticated",
      /**
       * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
       * entire file system is out of space.
       */
      RESOURCE_EXHAUSTED: "resource-exhausted",
      /**
       * Operation was rejected because the system is not in a state required for
       * the operation's execution. For example, directory to be deleted may be
       * non-empty, an rmdir operation is applied to a non-directory, etc.
       *
       * A litmus test that may help a service implementor in deciding
       * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
       *  (a) Use UNAVAILABLE if the client can retry just the failing call.
       *  (b) Use ABORTED if the client should retry at a higher-level
       *      (e.g., restarting a read-modify-write sequence).
       *  (c) Use FAILED_PRECONDITION if the client should not retry until
       *      the system state has been explicitly fixed. E.g., if an "rmdir"
       *      fails because the directory is non-empty, FAILED_PRECONDITION
       *      should be returned since the client should not retry unless
       *      they have first fixed up the directory by deleting files from it.
       *  (d) Use FAILED_PRECONDITION if the client performs conditional
       *      REST Get/Update/Delete on a resource and the resource on the
       *      server does not match the condition. E.g., conflicting
       *      read-modify-write on the same resource.
       */
      FAILED_PRECONDITION: "failed-precondition",
      /**
       * The operation was aborted, typically due to a concurrency issue like
       * sequencer check failures, transaction aborts, etc.
       *
       * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
       * and UNAVAILABLE.
       */
      ABORTED: "aborted",
      /**
       * Operation was attempted past the valid range. E.g., seeking or reading
       * past end of file.
       *
       * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
       * if the system state changes. For example, a 32-bit file system will
       * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
       * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
       * an offset past the current file size.
       *
       * There is a fair bit of overlap between FAILED_PRECONDITION and
       * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
       * when it applies so that callers who are iterating through a space can
       * easily look for an OUT_OF_RANGE error to detect when they are done.
       */
      OUT_OF_RANGE: "out-of-range",
      /** Operation is not implemented or not supported/enabled in this service. */
      UNIMPLEMENTED: "unimplemented",
      /**
       * Internal errors. Means some invariants expected by underlying System has
       * been broken. If you see one of these errors, Something is very broken.
       */
      INTERNAL: "internal",
      /**
       * The service is currently unavailable. This is a most likely a transient
       * condition and may be corrected by retrying with a backoff.
       *
       * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
       * and UNAVAILABLE.
       */
      UNAVAILABLE: "unavailable"};

  /** An error returned by a Firestore operation. */ class FirestoreError extends FirebaseError {
      /** @hideconstructor */
      constructor(
      /**
       * The backend error code associated with this error.
       */
      e,
      /**
       * A custom error description.
       */
      t) {
          super(e, t), this.code = e, this.message = t,
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
      constructor(e, t) {
          this.user = t, this.type = "OAuth", this.headers = new Map, this.headers.set("Authorization", `Bearer ${e}`);
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
      start(e, t) {
          // Fire with initial user.
          e.enqueueRetryable((() => t(User.UNAUTHENTICATED)));
      }
      shutdown() {}
  }

  /**
   * A CredentialsProvider that always returns a constant token. Used for
   * emulator token mocking.
   */ class __PRIVATE_EmulatorAuthCredentialsProvider {
      constructor(e) {
          this.token = e,
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
      start(e, t) {
          this.changeListener = t,
          // Fire with initial user.
          e.enqueueRetryable((() => t(this.token.user)));
      }
      shutdown() {
          this.changeListener = null;
      }
  }

  /** Credential provider for the Lite SDK. */ class __PRIVATE_LiteAuthCredentialsProvider {
      constructor(e) {
          this.auth = null, e.onInit((e => {
              this.auth = e;
          }));
      }
      getToken() {
          return this.auth ? this.auth.getToken().then((e => e ? (__PRIVATE_hardAssert("string" == typeof e.accessToken, 42297, {
              t: e
          }), new __PRIVATE_OAuthToken(e.accessToken, new User(this.auth.getUid()))) : null)) : Promise.resolve(null);
      }
      invalidateToken() {}
      start(e, t) {}
      shutdown() {}
  }

  /*
   * FirstPartyToken provides a fresh token each time its value
   * is requested, because if the token is too old, requests will be rejected.
   * Technically this may no longer be necessary since the SDK should gracefully
   * recover from unauthenticated errors (see b/33147818 for context), but it's
   * safer to keep the implementation as-is.
   */ class __PRIVATE_FirstPartyToken {
      constructor(e, t, r) {
          this.i = e, this.o = t, this.u = r, this.type = "FirstParty", this.user = User.FIRST_PARTY,
          this.l = new Map;
      }
      /**
       * Gets an authorization token, using a provided factory function, or return
       * null.
       */    h() {
          return this.u ? this.u() : null;
      }
      get headers() {
          this.l.set("X-Goog-AuthUser", this.i);
          // Use array notation to prevent minification
          const e = this.h();
          return e && this.l.set("Authorization", e), this.o && this.l.set("X-Goog-Iam-Authorization-Token", this.o),
          this.l;
      }
  }

  /*
   * Provides user credentials required for the Firestore JavaScript SDK
   * to authenticate the user, using technique that is only available
   * to applications hosted by Google.
   */ class __PRIVATE_FirstPartyAuthCredentialsProvider {
      constructor(e, t, r) {
          this.i = e, this.o = t, this.u = r;
      }
      getToken() {
          return Promise.resolve(new __PRIVATE_FirstPartyToken(this.i, this.o, this.u));
      }
      start(e, t) {
          // Fire with initial uid.
          e.enqueueRetryable((() => t(User.FIRST_PARTY)));
      }
      shutdown() {}
      invalidateToken() {}
  }

  class AppCheckToken {
      constructor(e) {
          this.value = e, this.type = "AppCheck", this.headers = new Map, e && e.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
      }
  }

  /** AppCheck token provider for the Lite SDK. */ class __PRIVATE_LiteAppCheckTokenProvider {
      constructor(e, t) {
          this.m = t, this.appCheck = null, this.P = null, _isFirebaseServerApp(e) && e.settings.appCheckToken && (this.P = e.settings.appCheckToken),
          t.onInit((e => {
              this.appCheck = e;
          }));
      }
      getToken() {
          return this.P ? Promise.resolve(new AppCheckToken(this.P)) : this.appCheck ? this.appCheck.getToken().then((e => e ? (__PRIVATE_hardAssert("string" == typeof e.token, 3470, {
              tokenResult: e
          }), new AppCheckToken(e.token)) : null)) : Promise.resolve(null);
      }
      invalidateToken() {}
      start(e, t) {}
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
       * @param longPollingOptions - Options that configure long-polling.
       * @param useFetchStreams - Whether to use the Fetch API instead of
       * XMLHTTPRequest
       */
      constructor(e, t, r, n, i, s, o, a, u, _, c) {
          this.databaseId = e, this.appId = t, this.persistenceKey = r, this.host = n, this.ssl = i,
          this.forceLongPolling = s, this.autoDetectLongPolling = o, this.longPollingOptions = a,
          this.useFetchStreams = u, this.isUsingEmulator = _, this.apiKey = c;
      }
  }

  /** The default database name for a project. */ const P = "(default)";

  /**
   * Represents the database ID a Firestore client is associated with.
   * @internal
   */ class DatabaseId {
      constructor(e, t) {
          this.projectId = e, this.database = t || P;
      }
      static empty() {
          return new DatabaseId("", "");
      }
      get isDefaultDatabase() {
          return this.database === P;
      }
      isEqual(e) {
          return e instanceof DatabaseId && e.projectId === this.projectId && e.database === this.database;
      }
  }

  function __PRIVATE_databaseIdFromApp(e, t) {
      if (!Object.prototype.hasOwnProperty.apply(e.options, [ "projectId" ])) throw new FirestoreError(E.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
      return new DatabaseId(e.options.projectId, t);
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
   */ function __PRIVATE_randomBytes(e) {
      // Polyfills for IE and WebWorker by using `self` and `msCrypto` when `crypto` is not available.
      const t =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "undefined" != typeof self && (self.crypto || self.msCrypto), r = new Uint8Array(e);
      if (t && "function" == typeof t.getRandomValues) t.getRandomValues(r); else
      // Falls back to Math.random
      for (let t = 0; t < e; t++) r[t] = Math.floor(256 * Math.random());
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
          const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", t = 62 * Math.floor(256 / 62);
          // The largest byte value that is a multiple of `char.length`.
                  let r = "";
          for (;r.length < 20; ) {
              const n = __PRIVATE_randomBytes(40);
              for (let i = 0; i < n.length; ++i)
              // Only accept values that are [0, maxMultiple), this ensures they can
              // be evenly mapped to indices of `chars` via a modulo operation.
              r.length < 20 && n[i] < t && (r += e.charAt(n[i] % 62));
          }
          return r;
      }
  }

  function __PRIVATE_primitiveComparator(e, t) {
      return e < t ? -1 : e > t ? 1 : 0;
  }

  /** Compare strings in UTF-8 encoded byte order */ function __PRIVATE_compareUtf8Strings(e, t) {
      // Find the first differing character (a.k.a. "UTF-16 code unit") in the two strings and,
      // if found, use that character to determine the relative ordering of the two strings as a
      // whole. Comparing UTF-16 strings in UTF-8 byte order can be done simply and efficiently by
      // comparing the UTF-16 code units (chars). This serendipitously works because of the way UTF-8
      // and UTF-16 happen to represent Unicode code points.
      // After finding the first pair of differing characters, there are two cases:
      // Case 1: Both characters are non-surrogates (code points less than or equal to 0xFFFF) or
      // both are surrogates from a surrogate pair (that collectively represent code points greater
      // than 0xFFFF). In this case their numeric order as UTF-16 code units is the same as the
      // lexicographical order of their corresponding UTF-8 byte sequences. A direct comparison is
      // sufficient.
      // Case 2: One character is a surrogate and the other is not. In this case the surrogate-
      // containing string is always ordered after the non-surrogate. This is because surrogates are
      // used to represent code points greater than 0xFFFF which have 4-byte UTF-8 representations
      // and are lexicographically greater than the 1, 2, or 3-byte representations of code points
      // less than or equal to 0xFFFF.
      // An example of why Case 2 is required is comparing the following two Unicode code points:
      // |-----------------------|------------|---------------------|-----------------|
      // | Name                  | Code Point | UTF-8 Encoding      | UTF-16 Encoding |
      // |-----------------------|------------|---------------------|-----------------|
      // | Replacement Character | U+FFFD     | 0xEF 0xBF 0xBD      | 0xFFFD          |
      // | Grinning Face         | U+1F600    | 0xF0 0x9F 0x98 0x80 | 0xD83D 0xDE00   |
      // |-----------------------|------------|---------------------|-----------------|
      // A lexicographical comparison of the UTF-8 encodings of these code points would order
      // "Replacement Character" _before_ "Grinning Face" because 0xEF is less than 0xF0. However, a
      // direct comparison of the UTF-16 code units, as would be done in case 1, would erroneously
      // produce the _opposite_ ordering, because 0xFFFD is _greater than_ 0xD83D. As it turns out,
      // this relative ordering holds for all comparisons of UTF-16 code points requiring a surrogate
      // pair with those that do not.
      const r = Math.min(e.length, t.length);
      for (let n = 0; n < r; n++) {
          const r = e.charAt(n), i = t.charAt(n);
          if (r !== i) return __PRIVATE_isSurrogate(r) === __PRIVATE_isSurrogate(i) ? __PRIVATE_primitiveComparator(r, i) : __PRIVATE_isSurrogate(r) ? 1 : -1;
      }
      // Use the lengths of the strings to determine the overall comparison result since either the
      // strings were equal or one is a prefix of the other.
          return __PRIVATE_primitiveComparator(e.length, t.length);
  }

  const T = 55296, R = 57343;

  function __PRIVATE_isSurrogate(e) {
      const t = e.charCodeAt(0);
      return t >= T && t <= R;
  }

  /** Helper to compare arrays using isEqual(). */ function __PRIVATE_arrayEquals(e, t, r) {
      return e.length === t.length && e.every(((e, n) => r(e, t[n])));
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
   */ const V = "__name__";

  /**
   * Path represents an ordered sequence of string segments.
   */ class BasePath {
      constructor(e, t, r) {
          void 0 === t ? t = 0 : t > e.length && fail(637, {
              offset: t,
              range: e.length
          }), void 0 === r ? r = e.length - t : r > e.length - t && fail(1746, {
              length: r,
              range: e.length - t
          }), this.segments = e, this.offset = t, this.len = r;
      }
      get length() {
          return this.len;
      }
      isEqual(e) {
          return 0 === BasePath.comparator(this, e);
      }
      child(e) {
          const t = this.segments.slice(this.offset, this.limit());
          return e instanceof BasePath ? e.forEach((e => {
              t.push(e);
          })) : t.push(e), this.construct(t);
      }
      /** The index of one past the last segment of the path. */    limit() {
          return this.offset + this.length;
      }
      popFirst(e) {
          return e = void 0 === e ? 1 : e, this.construct(this.segments, this.offset + e, this.length - e);
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
      get(e) {
          return this.segments[this.offset + e];
      }
      isEmpty() {
          return 0 === this.length;
      }
      isPrefixOf(e) {
          if (e.length < this.length) return false;
          for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return false;
          return true;
      }
      isImmediateParentOf(e) {
          if (this.length + 1 !== e.length) return false;
          for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return false;
          return true;
      }
      forEach(e) {
          for (let t = this.offset, r = this.limit(); t < r; t++) e(this.segments[t]);
      }
      toArray() {
          return this.segments.slice(this.offset, this.limit());
      }
      /**
       * Compare 2 paths segment by segment, prioritizing numeric IDs
       * (e.g., "__id123__") in numeric ascending order, followed by string
       * segments in lexicographical order.
       */    static comparator(e, t) {
          const r = Math.min(e.length, t.length);
          for (let n = 0; n < r; n++) {
              const r = BasePath.compareSegments(e.get(n), t.get(n));
              if (0 !== r) return r;
          }
          return __PRIVATE_primitiveComparator(e.length, t.length);
      }
      static compareSegments(e, t) {
          const r = BasePath.isNumericId(e), n = BasePath.isNumericId(t);
          return r && !n ? -1 : !r && n ? 1 : r && n ? BasePath.extractNumericId(e).compare(BasePath.extractNumericId(t)) : __PRIVATE_compareUtf8Strings(e, t);
      }
      // Checks if a segment is a numeric ID (starts with "__id" and ends with "__").
      static isNumericId(e) {
          return e.startsWith("__id") && e.endsWith("__");
      }
      static extractNumericId(e) {
          return Integer.fromString(e.substring(4, e.length - 2));
      }
  }

  /**
   * A slash-separated path for navigating resources (documents and collections)
   * within Firestore.
   *
   * @internal
   */ class ResourcePath extends BasePath {
      construct(e, t, r) {
          return new ResourcePath(e, t, r);
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
       */    static fromString(...e) {
          // NOTE: The client is ignorant of any path segments containing escape
          // sequences (e.g. __id123__) and just passes them through raw (they exist
          // for legacy reasons and should not be used frequently).
          const t = [];
          for (const r of e) {
              if (r.indexOf("//") >= 0) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid segment (${r}). Paths must not contain // in them.`);
              // Strip leading and trailing slashed.
                          t.push(...r.split("/").filter((e => e.length > 0)));
          }
          return new ResourcePath(t);
      }
      static emptyPath() {
          return new ResourcePath([]);
      }
  }

  const A = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

  /**
   * A dot-separated path for navigating sub-objects within a document.
   * @internal
   */ class FieldPath$1 extends BasePath {
      construct(e, t, r) {
          return new FieldPath$1(e, t, r);
      }
      /**
       * Returns true if the string could be used as a segment in a field path
       * without escaping.
       */    static isValidIdentifier(e) {
          return A.test(e);
      }
      canonicalString() {
          return this.toArray().map((e => (e = e.replace(/\\/g, "\\\\").replace(/`/g, "\\`"),
          FieldPath$1.isValidIdentifier(e) || (e = "`" + e + "`"), e))).join(".");
      }
      toString() {
          return this.canonicalString();
      }
      /**
       * Returns true if this field references the key of a document.
       */    isKeyField() {
          return 1 === this.length && this.get(0) === V;
      }
      /**
       * The field designating the key of a document.
       */    static keyField() {
          return new FieldPath$1([ V ]);
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
       */    static fromServerFormat(e) {
          const t = [];
          let r = "", n = 0;
          const __PRIVATE_addCurrentSegment = () => {
              if (0 === r.length) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
              t.push(r), r = "";
          };
          let i = false;
          for (;n < e.length; ) {
              const t = e[n];
              if ("\\" === t) {
                  if (n + 1 === e.length) throw new FirestoreError(E.INVALID_ARGUMENT, "Path has trailing escape character: " + e);
                  const t = e[n + 1];
                  if ("\\" !== t && "." !== t && "`" !== t) throw new FirestoreError(E.INVALID_ARGUMENT, "Path has invalid escape sequence: " + e);
                  r += t, n += 2;
              } else "`" === t ? (i = !i, n++) : "." !== t || i ? (r += t, n++) : (__PRIVATE_addCurrentSegment(),
              n++);
          }
          if (__PRIVATE_addCurrentSegment(), i) throw new FirestoreError(E.INVALID_ARGUMENT, "Unterminated ` in path: " + e);
          return new FieldPath$1(t);
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
      constructor(e) {
          this.path = e;
      }
      static fromPath(e) {
          return new DocumentKey(ResourcePath.fromString(e));
      }
      static fromName(e) {
          return new DocumentKey(ResourcePath.fromString(e).popFirst(5));
      }
      static empty() {
          return new DocumentKey(ResourcePath.emptyPath());
      }
      get collectionGroup() {
          return this.path.popLast().lastSegment();
      }
      /** Returns true if the document is in the specified collectionId. */    hasCollectionId(e) {
          return this.path.length >= 2 && this.path.get(this.path.length - 2) === e;
      }
      /** Returns the collection group (i.e. the name of the parent collection) for this key. */    getCollectionGroup() {
          return this.path.get(this.path.length - 2);
      }
      /** Returns the fully qualified path to the parent collection. */    getCollectionPath() {
          return this.path.popLast();
      }
      isEqual(e) {
          return null !== e && 0 === ResourcePath.comparator(this.path, e.path);
      }
      toString() {
          return this.path.toString();
      }
      static comparator(e, t) {
          return ResourcePath.comparator(e.path, t.path);
      }
      static isDocumentKey(e) {
          return e.length % 2 == 0;
      }
      /**
       * Creates and returns a new document key with the given segments.
       *
       * @param segments - The segments of the path to the document
       * @returns A new instance of DocumentKey
       */    static fromSegments(e) {
          return new DocumentKey(new ResourcePath(e.slice()));
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
   */ function __PRIVATE_validateNonEmptyArgument(e, t, r) {
      if (!r) throw new FirestoreError(E.INVALID_ARGUMENT, `Function ${e}() cannot be called with an empty ${t}.`);
  }

  /**
   * Validates that two boolean options are not set at the same time.
   * @internal
   */
  /**
   * Validates that `path` refers to a document (indicated by the fact it contains
   * an even numbers of segments).
   */
  function __PRIVATE_validateDocumentPath(e) {
      if (!DocumentKey.isDocumentKey(e)) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`);
  }

  /**
   * Returns true if it's a non-null object without a custom prototype
   * (i.e. excludes Array, Date, etc.).
   */ function __PRIVATE_isPlainObject(e) {
      return "object" == typeof e && null !== e && (Object.getPrototypeOf(e) === Object.prototype || null === Object.getPrototypeOf(e));
  }

  /** Returns a string describing the type / value of the provided input. */ function __PRIVATE_valueDescription(e) {
      if (void 0 === e) return "undefined";
      if (null === e) return "null";
      if ("string" == typeof e) return e.length > 20 && (e = `${e.substring(0, 20)}...`),
      JSON.stringify(e);
      if ("number" == typeof e || "boolean" == typeof e) return "" + e;
      if ("object" == typeof e) {
          if (e instanceof Array) return "an array";
          {
              const t =
              /** try to get the constructor name for an object. */
              function __PRIVATE_tryGetCustomObjectType(e) {
                  if (e.constructor) return e.constructor.name;
                  return null;
              }
              /**
   * Casts `obj` to `T`, optionally unwrapping Compat types to expose the
   * underlying instance. Throws if  `obj` is not an instance of `T`.
   *
   * This cast is used in the Lite and Full SDK to verify instance types for
   * arguments passed to the public API.
   * @internal
   */ (e);
              return t ? `a custom ${t} object` : "an object";
          }
      }
      return "function" == typeof e ? "a function" : fail(12329, {
          type: typeof e
      });
  }

  function __PRIVATE_cast(e,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t) {
      if ("_delegate" in e && (
      // Unwrap Compat types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      e = e._delegate), !(e instanceof t)) {
          if (t.name === e.constructor.name) throw new FirestoreError(E.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
          {
              const r = __PRIVATE_valueDescription(e);
              throw new FirestoreError(E.INVALID_ARGUMENT, `Expected type '${t.name}', but it was: ${r}`);
          }
      }
      return e;
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
  function __PRIVATE_cloneLongPollingOptions(e) {
      const t = {};
      return void 0 !== e.timeoutSeconds && (t.timeoutSeconds = e.timeoutSeconds), t;
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
   */ let I = null;

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
   * @returns the 10-character generated ID (e.g. "0xa1b2c3d4").
   */
  function __PRIVATE_generateUniqueDebugId() {
      return null === I ? I = function __PRIVATE_generateInitialUniqueDebugId() {
          return 268435456 + Math.round(2147483648 * Math.random());
      }() : I++, "0x" + I.toString(16);
  }

  /** Returns whether the value represents -0. */ function __PRIVATE_isNegativeZero(e) {
      // Detect if the value is -0.0. Based on polyfill from
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
      return 0 === e && 1 / e == -1 / 0;
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
   */ const p = "RestConnection", y = {
      BatchGetDocuments: "batchGet",
      Commit: "commit",
      RunQuery: "runQuery",
      RunAggregationQuery: "runAggregationQuery",
      ExecutePipeline: "executePipeline"
  };

  /**
   * Maps RPC names to the corresponding REST endpoint name.
   *
   * We use array notation to avoid mangling.
   */
  /**
   * Base class for all Rest-based connections to the backend (WebChannel and
   * HTTP).
   */
  class __PRIVATE_RestConnection {
      get T() {
          // Both `invokeRPC()` and `invokeStreamingRPC()` use their `path` arguments to determine
          // where to run the query, and expect the `request` to NOT specify the "path".
          return false;
      }
      constructor(e) {
          this.databaseInfo = e, this.databaseId = e.databaseId;
          const t = e.ssl ? "https" : "http", r = encodeURIComponent(this.databaseId.projectId), n = encodeURIComponent(this.databaseId.database);
          this.R = t + "://" + e.host, this.V = `projects/${r}/databases/${n}`, this.A = this.databaseId.database === P ? `project_id=${r}` : `project_id=${r}&database_id=${n}`;
      }
      I(e, r, n, i, s) {
          const o = __PRIVATE_generateUniqueDebugId(), a = this.p(e, r.toUriEncodedString());
          __PRIVATE_logDebug(p, `Sending RPC '${e}' ${o}:`, a, n);
          const u = {
              "google-cloud-resource-prefix": this.V,
              "x-goog-request-params": this.A
          };
          this.F(u, i, s);
          const {host: _} = new URL(a), c = isCloudWorkstation(_);
          return this.v(e, a, u, n, c).then((t => (__PRIVATE_logDebug(p, `Received RPC '${e}' ${o}: `, t),
          t)), (t => {
              throw __PRIVATE_logWarn(p, `RPC '${e}' ${o} failed with error: `, t, "url: ", a, "request:", n),
              t;
          }));
      }
      D(e, t, r, n, i, s) {
          // The REST API automatically aggregates all of the streamed results, so we
          // can just use the normal invoke() method.
          return this.I(e, t, r, n, i);
      }
      /**
       * Modifies the headers for a request, adding any authorization token if
       * present and any additional headers for the request.
       */    F(e, t, r) {
          e["X-Goog-Api-Client"] =
          // SDK_VERSION is updated to different value at runtime depending on the entry point,
          // so we need to get its value when we need it in a function.
          function __PRIVATE_getGoogApiClientValue() {
              return "gl-js/ fire/" + d;
          }(),
          // Content-Type: text/plain will avoid preflight requests which might
          // mess with CORS and redirects by proxies. If we add custom headers
          // we will need to change this code to potentially use the $httpOverwrite
          // parameter supported by ESF to avoid triggering preflight requests.
          e["Content-Type"] = "text/plain", this.databaseInfo.appId && (e["X-Firebase-GMPID"] = this.databaseInfo.appId),
          t && t.headers.forEach(((t, r) => e[r] = t)), r && r.headers.forEach(((t, r) => e[r] = t));
      }
      p(e, t) {
          const r = y[e];
          let n = `${this.R}/v1/${t}:${r}`;
          return this.databaseInfo.apiKey && (n = `${n}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),
          n;
      }
      /**
       * Closes and cleans up any resources associated with the connection. This
       * implementation is a no-op because there are no resources associated
       * with the RestConnection that need to be cleaned up.
       */    terminate() {
          // No-op
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
   * Error Codes describing the different ways GRPC can fail. These are copied
   * directly from GRPC's sources here:
   *
   * https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
   *
   * Important! The names of these identifiers matter because the string forms
   * are used for reverse lookups from the webchannel stream. Do NOT change the
   * names of these identifiers or change this into a const enum.
   */ var w, g;

  /**
   * Converts an HTTP Status Code to the equivalent error code.
   *
   * @param status - An HTTP Status Code, like 200, 404, 503, etc.
   * @returns The equivalent Code. Unknown status codes are mapped to
   *     Code.UNKNOWN.
   */ function __PRIVATE_mapCodeFromHttpStatus(e) {
      if (void 0 === e) return __PRIVATE_logError("RPC_ERROR", "HTTP error has no status"),
      E.UNKNOWN;
      // The canonical error codes for Google APIs [1] specify mapping onto HTTP
      // status codes but the mapping is not bijective. In each case of ambiguity
      // this function chooses a primary error.

      // [1]
      // https://github.com/googleapis/googleapis/blob/master/google/rpc/code.proto
          switch (e) {
        case 200:
          // OK
          return E.OK;

        case 400:
          // Bad Request
          return E.FAILED_PRECONDITION;

          // Other possibilities based on the forward mapping
          // return Code.INVALID_ARGUMENT;
          // return Code.OUT_OF_RANGE;
                case 401:
          // Unauthorized
          return E.UNAUTHENTICATED;

        case 403:
          // Forbidden
          return E.PERMISSION_DENIED;

        case 404:
          // Not Found
          return E.NOT_FOUND;

        case 409:
          // Conflict
          return E.ABORTED;

          // Other possibilities:
          // return Code.ALREADY_EXISTS;
                case 416:
          // Range Not Satisfiable
          return E.OUT_OF_RANGE;

        case 429:
          // Too Many Requests
          return E.RESOURCE_EXHAUSTED;

        case 499:
          // Client Closed Request
          return E.CANCELLED;

        case 500:
          // Internal Server Error
          return E.UNKNOWN;

          // Other possibilities:
          // return Code.INTERNAL;
          // return Code.DATA_LOSS;
                case 501:
          // Unimplemented
          return E.UNIMPLEMENTED;

        case 503:
          // Service Unavailable
          return E.UNAVAILABLE;

        case 504:
          // Gateway Timeout
          return E.DEADLINE_EXCEEDED;

        default:
          return e >= 200 && e < 300 ? E.OK : e >= 400 && e < 500 ? E.FAILED_PRECONDITION : e >= 500 && e < 600 ? E.INTERNAL : E.UNKNOWN;
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
   */ (g = w || (w = {}))[g.OK = 0] = "OK", g[g.CANCELLED = 1] = "CANCELLED", g[g.UNKNOWN = 2] = "UNKNOWN",
  g[g.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", g[g.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED",
  g[g.NOT_FOUND = 5] = "NOT_FOUND", g[g.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", g[g.PERMISSION_DENIED = 7] = "PERMISSION_DENIED",
  g[g.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", g[g.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED",
  g[g.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", g[g.ABORTED = 10] = "ABORTED",
  g[g.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", g[g.UNIMPLEMENTED = 12] = "UNIMPLEMENTED",
  g[g.INTERNAL = 13] = "INTERNAL", g[g.UNAVAILABLE = 14] = "UNAVAILABLE", g[g.DATA_LOSS = 15] = "DATA_LOSS";

  class __PRIVATE_FetchConnection extends __PRIVATE_RestConnection {
      S(e, t) {
          throw new Error("Not supported by FetchConnection");
      }
      async v(e, t, r, n, i) {
          const s = JSON.stringify(n);
          let o;
          try {
              const e = {
                  method: "POST",
                  headers: r,
                  body: s
              };
              i && (e.credentials = "include"), o = await fetch(t, e);
          } catch (e) {
              const t = e;
              throw new FirestoreError(__PRIVATE_mapCodeFromHttpStatus(t.status), "Request failed with error: " + t.statusText);
          }
          if (!o.ok) {
              let e = await o.json();
              Array.isArray(e) && (e = e[0]);
              const t = e?.error?.message;
              throw new FirestoreError(__PRIVATE_mapCodeFromHttpStatus(o.status), `Request failed with error: ${t ?? o.statusText}`);
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
  /** Initializes the HTTP connection for the REST API. */
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
  function __PRIVATE_objectSize(e) {
      let t = 0;
      for (const r in e) Object.prototype.hasOwnProperty.call(e, r) && t++;
      return t;
  }

  function forEach(e, t) {
      for (const r in e) Object.prototype.hasOwnProperty.call(e, r) && t(r, e[r]);
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
      constructor(e) {
          this.binaryString = e;
      }
      static fromBase64String(e) {
          const t = function __PRIVATE_decodeBase64(e) {
              try {
                  return atob(e);
              } catch (e) {
                  // Check that `DOMException` is defined before using it to avoid
                  // "ReferenceError: Property 'DOMException' doesn't exist" in react-native.
                  // (https://github.com/firebase/firebase-js-sdk/issues/7115)
                  throw "undefined" != typeof DOMException && e instanceof DOMException ? new __PRIVATE_Base64DecodeError("Invalid base64 string: " + e) : e;
              }
          }
          /** Converts a binary string to a Base64 encoded string. */ (e);
          return new ByteString(t);
      }
      static fromUint8Array(e) {
          // TODO(indexing); Remove the copy of the byte string here as this method
          // is frequently called during indexing.
          const t =
          /**
   * Helper function to convert an Uint8array to a binary string.
   */
          function __PRIVATE_binaryStringFromUint8Array(e) {
              let t = "";
              for (let r = 0; r < e.length; ++r) t += String.fromCharCode(e[r]);
              return t;
          }
          /**
   * Helper function to convert a binary string to an Uint8Array.
   */ (e);
          return new ByteString(t);
      }
      [Symbol.iterator]() {
          let e = 0;
          return {
              next: () => e < this.binaryString.length ? {
                  value: this.binaryString.charCodeAt(e++),
                  done: false
              } : {
                  value: void 0,
                  done: true
              }
          };
      }
      toBase64() {
          return function __PRIVATE_encodeBase64(e) {
              return btoa(e);
          }(this.binaryString);
      }
      toUint8Array() {
          return function __PRIVATE_uint8ArrayFromBinaryString(e) {
              const t = new Uint8Array(e.length);
              for (let r = 0; r < e.length; r++) t[r] = e.charCodeAt(r);
              return t;
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
      compareTo(e) {
          return __PRIVATE_primitiveComparator(this.binaryString, e.binaryString);
      }
      isEqual(e) {
          return this.binaryString === e.binaryString;
      }
  }

  ByteString.EMPTY_BYTE_STRING = new ByteString("");

  const F = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);

  /**
   * Converts the possible Proto values for a timestamp value into a "seconds and
   * nanos" representation.
   */ function __PRIVATE_normalizeTimestamp(e) {
      // The json interface (for the browser) will return an iso timestamp string,
      // while the proto js library (for node) will return a
      // google.protobuf.Timestamp instance.
      if (__PRIVATE_hardAssert(!!e, 39018), "string" == typeof e) {
          // The date string can have higher precision (nanos) than the Date class
          // (millis), so we do some custom parsing here.
          // Parse the nanos right out of the string.
          let t = 0;
          const r = F.exec(e);
          if (__PRIVATE_hardAssert(!!r, 46558, {
              timestamp: e
          }), r[1]) {
              // Pad the fraction out to 9 digits (nanos).
              let e = r[1];
              e = (e + "000000000").substr(0, 9), t = Number(e);
          }
          // Parse the date to get the seconds.
                  const n = new Date(e);
          return {
              seconds: Math.floor(n.getTime() / 1e3),
              nanos: t
          };
      }
      return {
          seconds: __PRIVATE_normalizeNumber(e.seconds),
          nanos: __PRIVATE_normalizeNumber(e.nanos)
      };
  }

  /**
   * Converts the possible Proto types for numbers into a JavaScript number.
   * Returns 0 if the value is not numeric.
   */ function __PRIVATE_normalizeNumber(e) {
      // TODO(bjornick): Handle int64 greater than 53 bits.
      return "number" == typeof e ? e : "string" == typeof e ? Number(e) : 0;
  }

  /** Converts the possible Proto types for Blobs into a ByteString. */ function __PRIVATE_normalizeByteString(e) {
      return "string" == typeof e ? ByteString.fromBase64String(e) : ByteString.fromUint8Array(e);
  }

  /**
   * @license
   * Copyright 2025 Google LLC
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
   * Helper function to define a JSON schema {@link Property}.
   * @private
   * @internal
   */ function property(e, t) {
      const r = {
          typeString: e
      };
      return t && (r.value = t), r;
  }

  /**
   * Validates the JSON object based on the provided schema, and narrows the type to the provided
   * JSON schema.
   * @private
   * @internal
   *
   * @param json - A JSON object to validate.
   * @param scheme - a {@link JsonSchema} that defines the properties to validate.
   * @returns true if the JSON schema exists within the object. Throws a FirestoreError otherwise.
   */ function __PRIVATE_validateJSON(e, t) {
      if (!__PRIVATE_isPlainObject(e)) throw new FirestoreError(E.INVALID_ARGUMENT, "JSON must be an object");
      let r;
      for (const n in t) if (t[n]) {
          const i = t[n].typeString, s = "value" in t[n] ? {
              value: t[n].value
          } : void 0;
          if (!(n in e)) {
              r = `JSON missing required field: '${n}'`;
              break;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const o = e[n];
          if (i && typeof o !== i) {
              r = `JSON field '${n}' must be a ${i}.`;
              break;
          }
          if (void 0 !== s && o !== s.value) {
              r = `Expected '${n}' field to equal '${s.value}'`;
              break;
          }
      }
      if (r) throw new FirestoreError(E.INVALID_ARGUMENT, r);
      return true;
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
  const v = -62135596800, b = 1e6;

  // Number of nanoseconds in a millisecond.
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
       */    static fromDate(e) {
          return Timestamp.fromMillis(e.getTime());
      }
      /**
       * Creates a new timestamp from the given number of milliseconds.
       *
       * @param milliseconds - Number of milliseconds since Unix epoch
       *     1970-01-01T00:00:00Z.
       * @returns A new `Timestamp` representing the same point in time as the given
       *     number of milliseconds.
       */    static fromMillis(e) {
          const t = Math.floor(e / 1e3), r = Math.floor((e - 1e3 * t) * b);
          return new Timestamp(t, r);
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
      e,
      /**
       * The fractions of a second at nanosecond resolution.*
       */
      t) {
          if (this.seconds = e, this.nanoseconds = t, t < 0) throw new FirestoreError(E.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
          if (t >= 1e9) throw new FirestoreError(E.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
          if (e < v) throw new FirestoreError(E.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
          // This will break in the year 10,000.
                  if (e >= 253402300800) throw new FirestoreError(E.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
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
          return 1e3 * this.seconds + this.nanoseconds / b;
      }
      _compareTo(e) {
          return this.seconds === e.seconds ? __PRIVATE_primitiveComparator(this.nanoseconds, e.nanoseconds) : __PRIVATE_primitiveComparator(this.seconds, e.seconds);
      }
      /**
       * Returns true if this `Timestamp` is equal to the provided one.
       *
       * @param other - The `Timestamp` to compare against.
       * @returns true if this `Timestamp` is equal to the provided one.
       */    isEqual(e) {
          return e.seconds === this.seconds && e.nanoseconds === this.nanoseconds;
      }
      /** Returns a textual representation of this `Timestamp`. */    toString() {
          return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
      }
      /**
       * Returns a JSON-serializable representation of this `Timestamp`.
       */    toJSON() {
          return {
              type: Timestamp._jsonSchemaVersion,
              seconds: this.seconds,
              nanoseconds: this.nanoseconds
          };
      }
      /**
       * Builds a `Timestamp` instance from a JSON object created by {@link Timestamp.toJSON}.
       */    static fromJSON(e) {
          if (__PRIVATE_validateJSON(e, Timestamp._jsonSchema)) return new Timestamp(e.seconds, e.nanoseconds);
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
          const e = this.seconds - v;
          // Note: Up to 12 decimal digits are required to represent all valid
          // 'seconds' values.
                  return String(e).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
      }
  }

  Timestamp._jsonSchemaVersion = "firestore/timestamp/1.0", Timestamp._jsonSchema = {
      type: property("string", Timestamp._jsonSchemaVersion),
      seconds: property("number"),
      nanoseconds: property("number")
  };

  function __PRIVATE_isServerTimestamp(e) {
      const t = (e?.mapValue?.fields || {}).__type__?.stringValue;
      return "server_timestamp" === t;
  }

  /**
   * Returns the value of the field before this ServerTimestamp was set.
   *
   * Preserving the previous values allows the user to display the last resoled
   * value until the backend responds with the timestamp.
   */ function __PRIVATE_getPreviousValue(e) {
      const t = e.mapValue.fields.__previous_value__;
      return __PRIVATE_isServerTimestamp(t) ? __PRIVATE_getPreviousValue(t) : t;
  }

  /**
   * Returns the local time at which this timestamp was first set.
   */ function __PRIVATE_getLocalWriteTime(e) {
      const t = __PRIVATE_normalizeTimestamp(e.mapValue.fields.__local_write_time__.timestampValue);
      return new Timestamp(t.seconds, t.nanos);
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
   */ const D = "__type__", S = "__max__", N = "__vector__", O = "value";

  /** Extracts the backend's type order for the provided value. */
  function __PRIVATE_typeOrder(e) {
      return "nullValue" in e ? 0 /* TypeOrder.NullValue */ : "booleanValue" in e ? 1 /* TypeOrder.BooleanValue */ : "integerValue" in e || "doubleValue" in e ? 2 /* TypeOrder.NumberValue */ : "timestampValue" in e ? 3 /* TypeOrder.TimestampValue */ : "stringValue" in e ? 5 /* TypeOrder.StringValue */ : "bytesValue" in e ? 6 /* TypeOrder.BlobValue */ : "referenceValue" in e ? 7 /* TypeOrder.RefValue */ : "geoPointValue" in e ? 8 /* TypeOrder.GeoPointValue */ : "arrayValue" in e ? 9 /* TypeOrder.ArrayValue */ : "mapValue" in e ? __PRIVATE_isServerTimestamp(e) ? 4 /* TypeOrder.ServerTimestampValue */ :
      /** Returns true if the Value represents the canonical {@link #MAX_VALUE} . */
      function __PRIVATE_isMaxValue(e) {
          return (((e.mapValue || {}).fields || {}).__type__ || {}).stringValue === S;
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
   */ (e) ? 9007199254740991 /* TypeOrder.MaxValue */ :
      /** Returns true if `value` is a VetorValue. */
      function __PRIVATE_isVectorValue(e) {
          const t = (e?.mapValue?.fields || {})[D]?.stringValue;
          return t === N;
      }
      /** Creates a deep copy of `source`. */ (e) ? 10 /* TypeOrder.VectorValue */ : 11 /* TypeOrder.ObjectValue */ : fail(28295, {
          value: e
      });
  }

  /** Tests `left` and `right` for equality based on the backend semantics. */ function __PRIVATE_valueEquals(e, t) {
      if (e === t) return true;
      const r = __PRIVATE_typeOrder(e);
      if (r !== __PRIVATE_typeOrder(t)) return false;
      switch (r) {
        case 0 /* TypeOrder.NullValue */ :
        case 9007199254740991 /* TypeOrder.MaxValue */ :
          return true;

        case 1 /* TypeOrder.BooleanValue */ :
          return e.booleanValue === t.booleanValue;

        case 4 /* TypeOrder.ServerTimestampValue */ :
          return __PRIVATE_getLocalWriteTime(e).isEqual(__PRIVATE_getLocalWriteTime(t));

        case 3 /* TypeOrder.TimestampValue */ :
          return function __PRIVATE_timestampEquals(e, t) {
              if ("string" == typeof e.timestampValue && "string" == typeof t.timestampValue && e.timestampValue.length === t.timestampValue.length)
              // Use string equality for ISO 8601 timestamps
              return e.timestampValue === t.timestampValue;
              const r = __PRIVATE_normalizeTimestamp(e.timestampValue), n = __PRIVATE_normalizeTimestamp(t.timestampValue);
              return r.seconds === n.seconds && r.nanos === n.nanos;
          }(e, t);

        case 5 /* TypeOrder.StringValue */ :
          return e.stringValue === t.stringValue;

        case 6 /* TypeOrder.BlobValue */ :
          return function __PRIVATE_blobEquals(e, t) {
              return __PRIVATE_normalizeByteString(e.bytesValue).isEqual(__PRIVATE_normalizeByteString(t.bytesValue));
          }(e, t);

        case 7 /* TypeOrder.RefValue */ :
          return e.referenceValue === t.referenceValue;

        case 8 /* TypeOrder.GeoPointValue */ :
          return function __PRIVATE_geoPointEquals(e, t) {
              return __PRIVATE_normalizeNumber(e.geoPointValue.latitude) === __PRIVATE_normalizeNumber(t.geoPointValue.latitude) && __PRIVATE_normalizeNumber(e.geoPointValue.longitude) === __PRIVATE_normalizeNumber(t.geoPointValue.longitude);
          }(e, t);

        case 2 /* TypeOrder.NumberValue */ :
          return function __PRIVATE_numberEquals(e, t) {
              if ("integerValue" in e && "integerValue" in t) return __PRIVATE_normalizeNumber(e.integerValue) === __PRIVATE_normalizeNumber(t.integerValue);
              if ("doubleValue" in e && "doubleValue" in t) {
                  const r = __PRIVATE_normalizeNumber(e.doubleValue), n = __PRIVATE_normalizeNumber(t.doubleValue);
                  return r === n ? __PRIVATE_isNegativeZero(r) === __PRIVATE_isNegativeZero(n) : isNaN(r) && isNaN(n);
              }
              return false;
          }(e, t);

        case 9 /* TypeOrder.ArrayValue */ :
          return __PRIVATE_arrayEquals(e.arrayValue.values || [], t.arrayValue.values || [], __PRIVATE_valueEquals);

        case 10 /* TypeOrder.VectorValue */ :
        case 11 /* TypeOrder.ObjectValue */ :
          return function __PRIVATE_objectEquals(e, t) {
              const r = e.mapValue.fields || {}, n = t.mapValue.fields || {};
              if (__PRIVATE_objectSize(r) !== __PRIVATE_objectSize(n)) return false;
              for (const e in r) if (r.hasOwnProperty(e) && (void 0 === n[e] || !__PRIVATE_valueEquals(r[e], n[e]))) return false;
              return true;
          }
          /** Returns true if the ArrayValue contains the specified element. */ (e, t);

        default:
          return fail(52216, {
              left: e
          });
      }
  }

  /** Returns true if `value` is a MapValue. */ function __PRIVATE_isMapValue(e) {
      return !!e && "mapValue" in e;
  }

  function __PRIVATE_deepClone(e) {
      if (e.geoPointValue) return {
          geoPointValue: {
              ...e.geoPointValue
          }
      };
      if (e.timestampValue && "object" == typeof e.timestampValue) return {
          timestampValue: {
              ...e.timestampValue
          }
      };
      if (e.mapValue) {
          const t = {
              mapValue: {
                  fields: {}
              }
          };
          return forEach(e.mapValue.fields, ((e, r) => t.mapValue.fields[e] = __PRIVATE_deepClone(r))),
          t;
      }
      if (e.arrayValue) {
          const t = {
              arrayValue: {
                  values: []
              }
          };
          for (let r = 0; r < (e.arrayValue.values || []).length; ++r) t.arrayValue.values[r] = __PRIVATE_deepClone(e.arrayValue.values[r]);
          return t;
      }
      return {
          ...e
      };
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
      static fromTimestamp(e) {
          return new SnapshotVersion(e);
      }
      static min() {
          return new SnapshotVersion(new Timestamp(0, 0));
      }
      static max() {
          return new SnapshotVersion(new Timestamp(253402300799, 999999999));
      }
      constructor(e) {
          this.timestamp = e;
      }
      compareTo(e) {
          return this.timestamp._compareTo(e.timestamp);
      }
      isEqual(e) {
          return this.timestamp.isEqual(e.timestamp);
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
      constructor(e) {
          this.value = e;
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
       */    field(e) {
          if (e.isEmpty()) return this.value;
          {
              let t = this.value;
              for (let r = 0; r < e.length - 1; ++r) if (t = (t.mapValue.fields || {})[e.get(r)],
              !__PRIVATE_isMapValue(t)) return null;
              return t = (t.mapValue.fields || {})[e.lastSegment()], t || null;
          }
      }
      /**
       * Sets the field to the provided value.
       *
       * @param path - The field path to set.
       * @param value - The value to set.
       */    set(e, t) {
          this.getFieldsMap(e.popLast())[e.lastSegment()] = __PRIVATE_deepClone(t);
      }
      /**
       * Sets the provided fields to the provided values.
       *
       * @param data - A map of fields to values (or null for deletes).
       */    setAll(e) {
          let t = FieldPath$1.emptyPath(), r = {}, n = [];
          e.forEach(((e, i) => {
              if (!t.isImmediateParentOf(i)) {
                  // Insert the accumulated changes at this parent location
                  const e = this.getFieldsMap(t);
                  this.applyChanges(e, r, n), r = {}, n = [], t = i.popLast();
              }
              e ? r[i.lastSegment()] = __PRIVATE_deepClone(e) : n.push(i.lastSegment());
          }));
          const i = this.getFieldsMap(t);
          this.applyChanges(i, r, n);
      }
      /**
       * Removes the field at the specified path. If there is no field at the
       * specified path, nothing is changed.
       *
       * @param path - The field path to remove.
       */    delete(e) {
          const t = this.field(e.popLast());
          __PRIVATE_isMapValue(t) && t.mapValue.fields && delete t.mapValue.fields[e.lastSegment()];
      }
      isEqual(e) {
          return __PRIVATE_valueEquals(this.value, e.value);
      }
      /**
       * Returns the map that contains the leaf element of `path`. If the parent
       * entry does not yet exist, or if it is not a map, a new map will be created.
       */    getFieldsMap(e) {
          let t = this.value;
          t.mapValue.fields || (t.mapValue = {
              fields: {}
          });
          for (let r = 0; r < e.length; ++r) {
              let n = t.mapValue.fields[e.get(r)];
              __PRIVATE_isMapValue(n) && n.mapValue.fields || (n = {
                  mapValue: {
                      fields: {}
                  }
              }, t.mapValue.fields[e.get(r)] = n), t = n;
          }
          return t.mapValue.fields;
      }
      /**
       * Modifies `fieldsMap` by adding, replacing or deleting the specified
       * entries.
       */    applyChanges(e, t, r) {
          forEach(t, ((t, r) => e[t] = r));
          for (const t of r) delete e[t];
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
      constructor(e, t, r, n, i, s, o) {
          this.key = e, this.documentType = t, this.version = r, this.readTime = n, this.createTime = i,
          this.data = s, this.documentState = o;
      }
      /**
       * Creates a document with no known version or data, but which can serve as
       * base document for mutations.
       */    static newInvalidDocument(e) {
          return new MutableDocument(e, 0 /* DocumentType.INVALID */ ,
          /* version */ SnapshotVersion.min(),
          /* readTime */ SnapshotVersion.min(),
          /* createTime */ SnapshotVersion.min(), ObjectValue.empty(), 0 /* DocumentState.SYNCED */);
      }
      /**
       * Creates a new document that is known to exist with the given data at the
       * given version.
       */    static newFoundDocument(e, t, r, n) {
          return new MutableDocument(e, 1 /* DocumentType.FOUND_DOCUMENT */ ,
          /* version */ t,
          /* readTime */ SnapshotVersion.min(),
          /* createTime */ r, n, 0 /* DocumentState.SYNCED */);
      }
      /** Creates a new document that is known to not exist at the given version. */    static newNoDocument(e, t) {
          return new MutableDocument(e, 2 /* DocumentType.NO_DOCUMENT */ ,
          /* version */ t,
          /* readTime */ SnapshotVersion.min(),
          /* createTime */ SnapshotVersion.min(), ObjectValue.empty(), 0 /* DocumentState.SYNCED */);
      }
      /**
       * Creates a new document that is known to exist at the given version but
       * whose data is not known (e.g. a document that was updated without a known
       * base document).
       */    static newUnknownDocument(e, t) {
          return new MutableDocument(e, 3 /* DocumentType.UNKNOWN_DOCUMENT */ ,
          /* version */ t,
          /* readTime */ SnapshotVersion.min(),
          /* createTime */ SnapshotVersion.min(), ObjectValue.empty(), 2 /* DocumentState.HAS_COMMITTED_MUTATIONS */);
      }
      /**
       * Changes the document type to indicate that it exists and that its version
       * and data are known.
       */    convertToFoundDocument(e, t) {
          // If a document is switching state from being an invalid or deleted
          // document to a valid (FOUND_DOCUMENT) document, either due to receiving an
          // update from Watch or due to applying a local set mutation on top
          // of a deleted document, our best guess about its createTime would be the
          // version at which the document transitioned to a FOUND_DOCUMENT.
          return !this.createTime.isEqual(SnapshotVersion.min()) || 2 /* DocumentType.NO_DOCUMENT */ !== this.documentType && 0 /* DocumentType.INVALID */ !== this.documentType || (this.createTime = e),
          this.version = e, this.documentType = 1 /* DocumentType.FOUND_DOCUMENT */ , this.data = t,
          this.documentState = 0 /* DocumentState.SYNCED */ , this;
      }
      /**
       * Changes the document type to indicate that it doesn't exist at the given
       * version.
       */    convertToNoDocument(e) {
          return this.version = e, this.documentType = 2 /* DocumentType.NO_DOCUMENT */ ,
          this.data = ObjectValue.empty(), this.documentState = 0 /* DocumentState.SYNCED */ ,
          this;
      }
      /**
       * Changes the document type to indicate that it exists at a given version but
       * that its data is not known (e.g. a document that was updated without a known
       * base document).
       */    convertToUnknownDocument(e) {
          return this.version = e, this.documentType = 3 /* DocumentType.UNKNOWN_DOCUMENT */ ,
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
      setReadTime(e) {
          return this.readTime = e, this;
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
      isEqual(e) {
          return e instanceof MutableDocument && this.key.isEqual(e.key) && this.version.isEqual(e.version) && this.documentType === e.documentType && this.documentState === e.documentState && this.data.isEqual(e.data);
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
      constructor(e, t = null, r = [], n = [], i = null, s = "F" /* LimitType.First */ , o = null, a = null) {
          this.path = e, this.collectionGroup = t, this.explicitOrderBy = r, this.filters = n,
          this.limit = i, this.limitType = s, this.startAt = o, this.endAt = a, this.q = null,
          // The corresponding `Target` of this `Query` instance, for use with
          // non-aggregate queries.
          this.L = null,
          // The corresponding `Target` of this `Query` instance, for use with
          // aggregate queries. Unlike targets for non-aggregate queries,
          // aggregate query targets do not contain normalized order-bys, they only
          // contain explicit order-bys.
          this.B = null, this.startAt, this.endAt;
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
      constructor(e, t) {
          this.databaseId = e, this.useProto3Json = t;
      }
  }

  function __PRIVATE_fromVersion(e) {
      return __PRIVATE_hardAssert(!!e, 49232), SnapshotVersion.fromTimestamp(function fromTimestamp(e) {
          const t = __PRIVATE_normalizeTimestamp(e);
          return new Timestamp(t.seconds, t.nanos);
      }(e));
  }

  function __PRIVATE_toResourceName(e, t) {
      return __PRIVATE_toResourcePath(e, t).canonicalString();
  }

  function __PRIVATE_toResourcePath(e, t) {
      const r = function __PRIVATE_fullyQualifiedPrefixPath(e) {
          return new ResourcePath([ "projects", e.projectId, "databases", e.database ]);
      }(e).child("documents");
      return void 0 === t ? r : r.child(t);
  }

  function __PRIVATE_toName(e, t) {
      return __PRIVATE_toResourceName(e.databaseId, t.path);
  }

  function fromName(e, t) {
      const r = function __PRIVATE_fromResourceName(e) {
          const t = ResourcePath.fromString(e);
          return __PRIVATE_hardAssert(__PRIVATE_isValidResourceName(t), 10190, {
              key: t.toString()
          }), t;
      }(t);
      if (r.get(1) !== e.databaseId.projectId) throw new FirestoreError(E.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + r.get(1) + " vs " + e.databaseId.projectId);
      if (r.get(3) !== e.databaseId.database) throw new FirestoreError(E.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + r.get(3) + " vs " + e.databaseId.database);
      return new DocumentKey(function __PRIVATE_extractLocalPathFromResourceName(e) {
          return __PRIVATE_hardAssert(e.length > 4 && "documents" === e.get(4), 29091, {
              key: e.toString()
          }), e.popFirst(5);
      }
      /** Creates a Document proto from key and fields (but no create/update time) */ (r));
  }

  function __PRIVATE_fromBatchGetDocumentsResponse(e, t) {
      return "found" in t ? function __PRIVATE_fromFound(e, t) {
          __PRIVATE_hardAssert(!!t.found, 43571), t.found.name, t.found.updateTime;
          const r = fromName(e, t.found.name), n = __PRIVATE_fromVersion(t.found.updateTime), i = t.found.createTime ? __PRIVATE_fromVersion(t.found.createTime) : SnapshotVersion.min(), s = new ObjectValue({
              mapValue: {
                  fields: t.found.fields
              }
          });
          return MutableDocument.newFoundDocument(r, n, i, s);
      }(e, t) : "missing" in t ? function __PRIVATE_fromMissing(e, t) {
          __PRIVATE_hardAssert(!!t.missing, 3894), __PRIVATE_hardAssert(!!t.readTime, 22933);
          const r = fromName(e, t.missing), n = __PRIVATE_fromVersion(t.readTime);
          return MutableDocument.newNoDocument(r, n);
      }(e, t) : fail(7234, {
          result: t
      });
  }

  function __PRIVATE_isValidResourceName(e) {
      // Resource names have at least 4 components (project ID, database ID)
      return e.length >= 4 && "projects" === e.get(0) && "databases" === e.get(2);
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
   */ function __PRIVATE_newSerializer(e) {
      return new JsonProtoSerializer(e, /* useProto3Json= */ true);
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
   */ class Datastore {}

  /**
   * An implementation of Datastore that exposes additional state for internal
   * consumption.
   */ class __PRIVATE_DatastoreImpl extends Datastore {
      constructor(e, t, r, n) {
          super(), this.authCredentials = e, this.appCheckCredentials = t, this.connection = r,
          this.serializer = n, this.k = false;
      }
      j() {
          if (this.k) throw new FirestoreError(E.FAILED_PRECONDITION, "The client has already been terminated.");
      }
      /** Invokes the provided RPC with auth and AppCheck tokens. */    I(e, t, r, n) {
          return this.j(), Promise.all([ this.authCredentials.getToken(), this.appCheckCredentials.getToken() ]).then((([i, s]) => this.connection.I(e, __PRIVATE_toResourcePath(t, r), n, i, s))).catch((e => {
              throw "FirebaseError" === e.name ? (e.code === E.UNAUTHENTICATED && (this.authCredentials.invalidateToken(),
              this.appCheckCredentials.invalidateToken()), e) : new FirestoreError(E.UNKNOWN, e.toString());
          }));
      }
      /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */    D(e, t, r, n, i) {
          return this.j(), Promise.all([ this.authCredentials.getToken(), this.appCheckCredentials.getToken() ]).then((([s, o]) => this.connection.D(e, __PRIVATE_toResourcePath(t, r), n, s, o, i))).catch((e => {
              throw "FirebaseError" === e.name ? (e.code === E.UNAUTHENTICATED && (this.authCredentials.invalidateToken(),
              this.appCheckCredentials.invalidateToken()), e) : new FirestoreError(E.UNKNOWN, e.toString());
          }));
      }
      terminate() {
          this.k = true, this.connection.terminate();
      }
  }

  async function __PRIVATE_invokeBatchGetDocumentsRpc(e, t) {
      const r = __PRIVATE_debugCast(e), n = {
          documents: t.map((e => __PRIVATE_toName(r.serializer, e)))
      }, i = await r.D("BatchGetDocuments", r.serializer.databaseId, ResourcePath.emptyPath(), n, t.length), s = new Map;
      i.forEach((e => {
          const t = __PRIVATE_fromBatchGetDocumentsResponse(r.serializer, e);
          s.set(t.key.toString(), t);
      }));
      const o = [];
      return t.forEach((e => {
          const t = s.get(e.toString());
          __PRIVATE_hardAssert(!!t, 55234, {
              key: e
          }), o.push(t);
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
   */ const $ = "ComponentProvider", Q = new Map;

  /**
   * An instance map that ensures only one Datastore exists per Firestore
   * instance.
   */
  /**
   * Returns an initialized and started Datastore for the given Firestore
   * instance. Callers must invoke removeComponents() when the Firestore
   * instance is terminated.
   */
  function __PRIVATE_getDatastore(e) {
      if (e._terminated) throw new FirestoreError(E.FAILED_PRECONDITION, "The client has already been terminated.");
      if (!Q.has(e)) {
          __PRIVATE_logDebug($, "Initializing Datastore");
          const t = function __PRIVATE_newConnection(e) {
              return new __PRIVATE_FetchConnection(e);
          }(function __PRIVATE_makeDatabaseInfo(e, t, r, n, i) {
              return new DatabaseInfo(e, t, r, i.host, i.ssl, i.experimentalForceLongPolling, i.experimentalAutoDetectLongPolling, __PRIVATE_cloneLongPollingOptions(i.experimentalLongPollingOptions), i.useFetchStreams, i.isUsingEmulator, n);
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
   */ (e._databaseId, e.app.options.appId || "", e._persistenceKey, e.app.options.apiKey, e._freezeSettings())), r = __PRIVATE_newSerializer(e._databaseId), n = function __PRIVATE_newDatastore(e, t, r, n) {
              return new __PRIVATE_DatastoreImpl(e, t, r, n);
          }(e._authCredentials, e._appCheckCredentials, t, r);
          Q.set(e, n);
      }
      return Q.get(e);
  }

  /**
   * Removes all components associated with the provided instance. Must be called
   * when the `Firestore` instance is terminated.
   */ const U = 1048576, M = "firestore.googleapis.com", x = true;

  /**
   * A concrete type describing all the values that can be applied via a
   * user-supplied `FirestoreSettings` object. This is a separate type so that
   * defaults can be supplied and the value can be checked for equality.
   */
  class FirestoreSettingsImpl {
      constructor(e) {
          if (void 0 === e.host) {
              if (void 0 !== e.ssl) throw new FirestoreError(E.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
              this.host = M, this.ssl = x;
          } else this.host = e.host, this.ssl = e.ssl ?? x;
          if (this.isUsingEmulator = void 0 !== e.emulatorOptions, this.credentials = e.credentials,
          this.ignoreUndefinedProperties = !!e.ignoreUndefinedProperties, this.localCache = e.localCache,
          void 0 === e.cacheSizeBytes) this.cacheSizeBytes = 41943040; else {
              if (-1 !== e.cacheSizeBytes && e.cacheSizeBytes < U) throw new FirestoreError(E.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
              this.cacheSizeBytes = e.cacheSizeBytes;
          }
          !function __PRIVATE_validateIsNotUsedTogether(e, t, r, n) {
              if (true === t && true === n) throw new FirestoreError(E.INVALID_ARGUMENT, `${e} and ${r} cannot be used together.`);
          }("experimentalForceLongPolling", e.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", e.experimentalAutoDetectLongPolling),
          this.experimentalForceLongPolling = !!e.experimentalForceLongPolling, this.experimentalForceLongPolling ? this.experimentalAutoDetectLongPolling = false : void 0 === e.experimentalAutoDetectLongPolling ? this.experimentalAutoDetectLongPolling = true :
          // For backwards compatibility, coerce the value to boolean even though
          // the TypeScript compiler has narrowed the type to boolean already.
          // noinspection PointlessBooleanExpressionJS
          this.experimentalAutoDetectLongPolling = !!e.experimentalAutoDetectLongPolling,
          this.experimentalLongPollingOptions = __PRIVATE_cloneLongPollingOptions(e.experimentalLongPollingOptions ?? {}),
          function __PRIVATE_validateLongPollingOptions(e) {
              if (void 0 !== e.timeoutSeconds) {
                  if (isNaN(e.timeoutSeconds)) throw new FirestoreError(E.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (must not be NaN)`);
                  if (e.timeoutSeconds < 5) throw new FirestoreError(E.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (minimum allowed value is 5)`);
                  if (e.timeoutSeconds > 30) throw new FirestoreError(E.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (maximum allowed value is 30)`);
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
   */ (this.experimentalLongPollingOptions), this.useFetchStreams = !!e.useFetchStreams;
      }
      isEqual(e) {
          return this.host === e.host && this.ssl === e.ssl && this.credentials === e.credentials && this.cacheSizeBytes === e.cacheSizeBytes && this.experimentalForceLongPolling === e.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === e.experimentalAutoDetectLongPolling && function __PRIVATE_longPollingOptionsEqual(e, t) {
              return e.timeoutSeconds === t.timeoutSeconds;
          }(this.experimentalLongPollingOptions, e.experimentalLongPollingOptions) && this.ignoreUndefinedProperties === e.ignoreUndefinedProperties && this.useFetchStreams === e.useFetchStreams;
      }
  }

  class Firestore {
      /** @hideconstructor */
      constructor(e, t, r, n) {
          this._authCredentials = e, this._appCheckCredentials = t, this._databaseId = r,
          this._app = n,
          /**
           * Whether it's a Firestore or Firestore Lite instance.
           */
          this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new FirestoreSettingsImpl({}),
          this._settingsFrozen = false, this._emulatorOptions = {},
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
          if (!this._app) throw new FirestoreError(E.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
          return this._app;
      }
      get _initialized() {
          return this._settingsFrozen;
      }
      get _terminated() {
          return "notTerminated" !== this._terminateTask;
      }
      _setSettings(e) {
          if (this._settingsFrozen) throw new FirestoreError(E.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
          this._settings = new FirestoreSettingsImpl(e), this._emulatorOptions = e.emulatorOptions || {},
          void 0 !== e.credentials && (this._authCredentials = function __PRIVATE_makeAuthCredentialsProvider(e) {
              if (!e) return new __PRIVATE_EmptyAuthCredentialsProvider;
              switch (e.type) {
                case "firstParty":
                  return new __PRIVATE_FirstPartyAuthCredentialsProvider(e.sessionIndex || "0", e.iamToken || null, e.authTokenFactory || null);

                case "provider":
                  return e.client;

                default:
                  throw new FirestoreError(E.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
              }
          }(e.credentials));
      }
      _getSettings() {
          return this._settings;
      }
      _getEmulatorOptions() {
          return this._emulatorOptions;
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
          return function __PRIVATE_removeComponents(e) {
              const t = Q.get(e);
              t && (__PRIVATE_logDebug($, "Removing Datastore"), Q.delete(e), t.terminate());
          }(this), Promise.resolve();
      }
  }

  function getFirestore(e, t) {
      const n = "object" == typeof e ? e : getApp(), i = "string" == typeof e ? e : t || "(default)", s = _getProvider(n, "firestore/lite").getImmediate({
          identifier: i
      });
      if (!s._initialized) {
          const e = getDefaultEmulatorHostnameAndPort("firestore");
          e && connectFirestoreEmulator(s, ...e);
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
   */ function connectFirestoreEmulator(e, r, a, u = {}) {
      e = __PRIVATE_cast(e, Firestore);
      const _ = isCloudWorkstation(r), c = e._getSettings(), l = {
          ...c,
          emulatorOptions: e._getEmulatorOptions()
      }, h = `${r}:${a}`;
      _ && (pingServer(`https://${h}`), updateEmulatorBanner("Firestore", true)), c.host !== M && c.host !== h && __PRIVATE_logWarn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");
      const f = {
          ...c,
          host: h,
          ssl: _,
          emulatorOptions: u
      };
      // No-op if the new configuration matches the current configuration. This supports SSR
      // enviornments which might call `connectFirestoreEmulator` multiple times as a standard practice.
          if (!deepEqual(f, l) && (e._setSettings(f), u.mockUserToken)) {
          let t, r;
          if ("string" == typeof u.mockUserToken) t = u.mockUserToken, r = User.MOCK_USER; else {
              // Let createMockUserToken validate first (catches common mistakes like
              // invalid field "uid" and missing field "sub" / "user_id".)
              t = createMockUserToken(u.mockUserToken, e._app?.options.projectId);
              const n = u.mockUserToken.sub || u.mockUserToken.user_id;
              if (!n) throw new FirestoreError(E.INVALID_ARGUMENT, "mockUserToken must contain 'sub' or 'user_id' field!");
              r = new User(n);
          }
          e._authCredentials = new __PRIVATE_EmulatorAuthCredentialsProvider(new __PRIVATE_OAuthToken(t, r));
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
      constructor(e,
      /**
       * If provided, the `FirestoreDataConverter` associated with this instance.
       */
      t, r) {
          this.converter = t, this._query = r,
          /** The type of this Firestore reference. */
          this.type = "query", this.firestore = e;
      }
      withConverter(e) {
          return new Query(this.firestore, e, this._query);
      }
  }

  /**
   * A `DocumentReference` refers to a document location in a Firestore database
   * and can be used to write, read, or listen to the location. The document at
   * the referenced location may or may not exist.
   */ class DocumentReference {
      /** @hideconstructor */
      constructor(e,
      /**
       * If provided, the `FirestoreDataConverter` associated with this instance.
       */
      t, r) {
          this.converter = t, this._key = r,
          /** The type of this Firestore reference. */
          this.type = "document", this.firestore = e;
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
      withConverter(e) {
          return new DocumentReference(this.firestore, e, this._key);
      }
      /**
       * Returns a JSON-serializable representation of this `DocumentReference` instance.
       *
       * @returns a JSON representation of this object.
       */    toJSON() {
          return {
              type: DocumentReference._jsonSchemaVersion,
              referencePath: this._key.toString()
          };
      }
      static fromJSON(e, t, r) {
          if (__PRIVATE_validateJSON(t, DocumentReference._jsonSchema)) return new DocumentReference(e, r || null, new DocumentKey(ResourcePath.fromString(t.referencePath)));
      }
  }

  DocumentReference._jsonSchemaVersion = "firestore/documentReference/1.0", DocumentReference._jsonSchema = {
      type: property("string", DocumentReference._jsonSchemaVersion),
      referencePath: property("string")
  };

  /**
   * A `CollectionReference` object can be used for adding documents, getting
   * document references, and querying for documents (using {@link (query:1)}).
   */
  class CollectionReference extends Query {
      /** @hideconstructor */
      constructor(e, t, r) {
          super(e, t, function __PRIVATE_newQueryForPath(e) {
              return new __PRIVATE_QueryImpl(e);
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
          const e = this._path.popLast();
          return e.isEmpty() ? null : new DocumentReference(this.firestore,
          /* converter= */ null, new DocumentKey(e));
      }
      withConverter(e) {
          return new CollectionReference(this.firestore, e, this._path);
      }
  }

  function doc(e, t, ...r) {
      if (e = getModularInstance(e),
      // We allow omission of 'pathString' but explicitly prohibit passing in both
      // 'undefined' and 'null'.
      1 === arguments.length && (t = __PRIVATE_AutoId.newId()), __PRIVATE_validateNonEmptyArgument("doc", "path", t),
      e instanceof Firestore) {
          const n = ResourcePath.fromString(t, ...r);
          return __PRIVATE_validateDocumentPath(n), new DocumentReference(e,
          /* converter= */ null, new DocumentKey(n));
      }
      {
          if (!(e instanceof DocumentReference || e instanceof CollectionReference)) throw new FirestoreError(E.INVALID_ARGUMENT, "Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
          const n = e._path.child(ResourcePath.fromString(t, ...r));
          return __PRIVATE_validateDocumentPath(n), new DocumentReference(e.firestore, e instanceof CollectionReference ? e.converter : null, new DocumentKey(n));
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
      constructor(e) {
          this._byteString = e;
      }
      /**
       * Creates a new `Bytes` object from the given Base64 string, converting it to
       * bytes.
       *
       * @param base64 - The Base64 string used to create the `Bytes` object.
       */    static fromBase64String(e) {
          try {
              return new Bytes(ByteString.fromBase64String(e));
          } catch (e) {
              throw new FirestoreError(E.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + e);
          }
      }
      /**
       * Creates a new `Bytes` object from the given Uint8Array.
       *
       * @param array - The Uint8Array used to create the `Bytes` object.
       */    static fromUint8Array(e) {
          return new Bytes(ByteString.fromUint8Array(e));
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
       */    isEqual(e) {
          return this._byteString.isEqual(e._byteString);
      }
      /**
       * Returns a JSON-serializable representation of this `Bytes` instance.
       *
       * @returns a JSON representation of this object.
       */    toJSON() {
          return {
              type: Bytes._jsonSchemaVersion,
              bytes: this.toBase64()
          };
      }
      /**
       * Builds a `Bytes` instance from a JSON object created by {@link Bytes.toJSON}.
       *
       * @param json - a JSON object represention of a `Bytes` instance
       * @returns an instance of {@link Bytes} if the JSON object could be parsed. Throws a
       * {@link FirestoreError} if an error occurs.
       */    static fromJSON(e) {
          if (__PRIVATE_validateJSON(e, Bytes._jsonSchema)) return Bytes.fromBase64String(e.bytes);
      }
  }

  Bytes._jsonSchemaVersion = "firestore/bytes/1.0", Bytes._jsonSchema = {
      type: property("string", Bytes._jsonSchemaVersion),
      bytes: property("string")
  };

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
   */
  class FieldPath {
      /**
       * Creates a `FieldPath` from the provided field names. If more than one field
       * name is provided, the path will point to a nested field in a document.
       *
       * @param fieldNames - A list of field names.
       */
      constructor(...e) {
          for (let t = 0; t < e.length; ++t) if (0 === e[t].length) throw new FirestoreError(E.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
          this._internalPath = new FieldPath$1(e);
      }
      /**
       * Returns true if this `FieldPath` is equal to the provided one.
       *
       * @param other - The `FieldPath` to compare against.
       * @returns true if this `FieldPath` is equal to the provided one.
       */    isEqual(e) {
          return this._internalPath.isEqual(e._internalPath);
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
      constructor(e, t) {
          if (!isFinite(e) || e < -90 || e > 90) throw new FirestoreError(E.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + e);
          if (!isFinite(t) || t < -180 || t > 180) throw new FirestoreError(E.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + t);
          this._lat = e, this._long = t;
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
       */    isEqual(e) {
          return this._lat === e._lat && this._long === e._long;
      }
      /**
       * Actually private to JS consumers of our API, so this function is prefixed
       * with an underscore.
       */    _compareTo(e) {
          return __PRIVATE_primitiveComparator(this._lat, e._lat) || __PRIVATE_primitiveComparator(this._long, e._long);
      }
      /**
       * Returns a JSON-serializable representation of this `GeoPoint` instance.
       *
       * @returns a JSON representation of this object.
       */    toJSON() {
          return {
              latitude: this._lat,
              longitude: this._long,
              type: GeoPoint._jsonSchemaVersion
          };
      }
      /**
       * Builds a `GeoPoint` instance from a JSON object created by {@link GeoPoint.toJSON}.
       *
       * @param json - a JSON object represention of a `GeoPoint` instance
       * @returns an instance of {@link GeoPoint} if the JSON object could be parsed. Throws a
       * {@link FirestoreError} if an error occurs.
       */    static fromJSON(e) {
          if (__PRIVATE_validateJSON(e, GeoPoint._jsonSchema)) return new GeoPoint(e.latitude, e.longitude);
      }
  }

  GeoPoint._jsonSchemaVersion = "firestore/geoPoint/1.0", GeoPoint._jsonSchema = {
      type: property("string", GeoPoint._jsonSchemaVersion),
      latitude: property("number"),
      longitude: property("number")
  };

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
   * Create an instance with <code>{@link vector}</code>.
   */
  class VectorValue {
      /**
       * @private
       * @internal
       */
      constructor(e) {
          // Making a copy of the parameter.
          this._values = (e || []).map((e => e));
      }
      /**
       * Returns a copy of the raw number array form of the vector.
       */    toArray() {
          return this._values.map((e => e));
      }
      /**
       * Returns `true` if the two `VectorValue` values have the same raw number arrays, returns `false` otherwise.
       */    isEqual(e) {
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
   * @param left - Array of primitives.
   * @param right - Array of primitives.
   * @returns True if arrays are equal.
   */
          return function __PRIVATE_isPrimitiveArrayEqual(e, t) {
              if (e.length !== t.length) return false;
              for (let r = 0; r < e.length; ++r) if (e[r] !== t[r]) return false;
              return true;
          }(this._values, e._values);
      }
      /**
       * Returns a JSON-serializable representation of this `VectorValue` instance.
       *
       * @returns a JSON representation of this object.
       */    toJSON() {
          return {
              type: VectorValue._jsonSchemaVersion,
              vectorValues: this._values
          };
      }
      /**
       * Builds a `VectorValue` instance from a JSON object created by {@link VectorValue.toJSON}.
       *
       * @param json - a JSON object represention of a `VectorValue` instance.
       * @returns an instance of {@link VectorValue} if the JSON object could be parsed. Throws a
       * {@link FirestoreError} if an error occurs.
       */    static fromJSON(e) {
          if (__PRIVATE_validateJSON(e, VectorValue._jsonSchema)) {
              if (Array.isArray(e.vectorValues) && e.vectorValues.every((e => "number" == typeof e))) return new VectorValue(e.vectorValues);
              throw new FirestoreError(E.INVALID_ARGUMENT, "Expected 'vectorValues' field to be a number array");
          }
      }
  }

  VectorValue._jsonSchemaVersion = "firestore/vectorValue/1.0", VectorValue._jsonSchema = {
      type: property("string", VectorValue._jsonSchemaVersion),
      vectorValues: property("object")
  };

  /**
   * Helper that calls fromDotSeparatedString() but wraps any error thrown.
   */ function __PRIVATE_fieldPathFromArgument(e, t, r) {
      if ((
      // If required, replace the FieldPath Compat class with the firestore-exp
      // FieldPath.
      t = getModularInstance(t)) instanceof FieldPath) return t._internalPath;
      if ("string" == typeof t) return __PRIVATE_fieldPathFromDotSeparatedString(e, t);
      throw createError("Field path arguments must be of type string or ", e);
  }

  /**
   * Matches any characters in a field path string that are reserved.
   */ const j = new RegExp("[~\\*/\\[\\]]");

  /**
   * Wraps fromDotSeparatedString with an error message about the method that
   * was thrown.
   * @param methodName - The publicly visible method name
   * @param path - The dot-separated string form of a field path which will be
   * split on dots.
   * @param targetDoc - The document against which the field path will be
   * evaluated.
   */ function __PRIVATE_fieldPathFromDotSeparatedString(e, t, r) {
      if (t.search(j) >= 0) throw createError(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`, e);
      try {
          return new FieldPath(...t.split("."))._internalPath;
      } catch (n) {
          throw createError(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`, e);
      }
  }

  function createError(e, t, r, n, i) {
      let a = `Function ${t}() called with invalid data`;
      a += ". ";
      let u = "";
      return new FirestoreError(E.INVALID_ARGUMENT, a + e + u);
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
      constructor(e, t, r, n, i) {
          this._firestore = e, this._userDataWriter = t, this._key = r, this._document = n,
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
                  const e = new QueryDocumentSnapshot(this._firestore, this._userDataWriter, this._key, this._document,
                  /* converter= */ null);
                  return this._converter.fromFirestore(e);
              }
              return this._userDataWriter.convertValue(this._document.data.value);
          }
      }
      /**
       * @internal
       * @private
       *
       * Retrieves all fields in the document as a proto Value. Returns `undefined` if
       * the document doesn't exist.
       *
       * @returns An `Object` containing all fields in the document or `undefined`
       * if the document doesn't exist.
       */    _fieldsProto() {
          // Return a cloned value to prevent manipulation of the Snapshot's data
          return this._document?.data.clone().value.mapValue.fields ?? void 0;
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
      get(e) {
          if (this._document) {
              const t = this._document.data.field(__PRIVATE_fieldPathFromArgument("DocumentSnapshot.get", e));
              if (null !== t) return this._userDataWriter.convertValue(t);
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

  class AbstractUserDataWriter {
      convertValue(e, t = "none") {
          switch (__PRIVATE_typeOrder(e)) {
            case 0 /* TypeOrder.NullValue */ :
              return null;

            case 1 /* TypeOrder.BooleanValue */ :
              return e.booleanValue;

            case 2 /* TypeOrder.NumberValue */ :
              return __PRIVATE_normalizeNumber(e.integerValue || e.doubleValue);

            case 3 /* TypeOrder.TimestampValue */ :
              return this.convertTimestamp(e.timestampValue);

            case 4 /* TypeOrder.ServerTimestampValue */ :
              return this.convertServerTimestamp(e, t);

            case 5 /* TypeOrder.StringValue */ :
              return e.stringValue;

            case 6 /* TypeOrder.BlobValue */ :
              return this.convertBytes(__PRIVATE_normalizeByteString(e.bytesValue));

            case 7 /* TypeOrder.RefValue */ :
              return this.convertReference(e.referenceValue);

            case 8 /* TypeOrder.GeoPointValue */ :
              return this.convertGeoPoint(e.geoPointValue);

            case 9 /* TypeOrder.ArrayValue */ :
              return this.convertArray(e.arrayValue, t);

            case 11 /* TypeOrder.ObjectValue */ :
              return this.convertObject(e.mapValue, t);

            case 10 /* TypeOrder.VectorValue */ :
              return this.convertVectorValue(e.mapValue);

            default:
              throw fail(62114, {
                  value: e
              });
          }
      }
      convertObject(e, t) {
          return this.convertObjectMap(e.fields, t);
      }
      /**
       * @internal
       */    convertObjectMap(e, t = "none") {
          const r = {};
          return forEach(e, ((e, n) => {
              r[e] = this.convertValue(n, t);
          })), r;
      }
      /**
       * @internal
       */    convertVectorValue(e) {
          const t = e.fields?.[O].arrayValue?.values?.map((e => __PRIVATE_normalizeNumber(e.doubleValue)));
          return new VectorValue(t);
      }
      convertGeoPoint(e) {
          return new GeoPoint(__PRIVATE_normalizeNumber(e.latitude), __PRIVATE_normalizeNumber(e.longitude));
      }
      convertArray(e, t) {
          return (e.values || []).map((e => this.convertValue(e, t)));
      }
      convertServerTimestamp(e, t) {
          switch (t) {
            case "previous":
              const r = __PRIVATE_getPreviousValue(e);
              return null == r ? null : this.convertValue(r, t);

            case "estimate":
              return this.convertTimestamp(__PRIVATE_getLocalWriteTime(e));

            default:
              return null;
          }
      }
      convertTimestamp(e) {
          const t = __PRIVATE_normalizeTimestamp(e);
          return new Timestamp(t.seconds, t.nanos);
      }
      convertDocumentKey(e, t) {
          const r = ResourcePath.fromString(e);
          __PRIVATE_hardAssert(__PRIVATE_isValidResourceName(r), 9688, {
              name: e
          });
          const n = new DatabaseId(r.get(1), r.get(3)), i = new DocumentKey(r.popFirst(5));
          return n.isEqual(t) ||
          // TODO(b/64130202): Somehow support foreign references.
          __PRIVATE_logError(`Document ${i} contains a document reference within a different database (${n.projectId}/${n.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),
          i;
      }
  }

  class __PRIVATE_LiteUserDataWriter extends AbstractUserDataWriter {
      constructor(e) {
          super(), this.firestore = e;
      }
      convertBytes(e) {
          return new Bytes(e);
      }
      convertReference(e) {
          const t = this.convertDocumentKey(e, this.firestore._databaseId);
          return new DocumentReference(this.firestore, /* converter= */ null, t);
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
   */ function getDoc(e) {
      const t = __PRIVATE_getDatastore((e = __PRIVATE_cast(e, DocumentReference)).firestore), r = new __PRIVATE_LiteUserDataWriter(e.firestore);
      return __PRIVATE_invokeBatchGetDocumentsRpc(t, [ e._key ]).then((t => {
          __PRIVATE_hardAssert(1 === t.length, 15618);
          const n = t[0];
          return new DocumentSnapshot(e.firestore, r, e._key, n.isFoundDocument() ? n : null, e.converter);
      }));
  }

  const _t = "4.12.0";

  /**
   * Firestore Lite
   *
   * @remarks Firestore Lite is a small online-only SDK that allows read
   * and write access to your Firestore database. All operations connect
   * directly to the backend, and `onSnapshot()` APIs are not supported.
   * @packageDocumentation
   */ !function __PRIVATE_registerFirestore() {
      __PRIVATE_setSDKVersion(`${SDK_VERSION}_lite`), _registerComponent(new Component("firestore/lite", ((t, {instanceIdentifier: e, options: s}) => {
          const i = t.getProvider("app").getImmediate(), r = new Firestore(new __PRIVATE_LiteAuthCredentialsProvider(t.getProvider("auth-internal")), new __PRIVATE_LiteAppCheckTokenProvider(i, t.getProvider("app-check-internal")), __PRIVATE_databaseIdFromApp(i, e), i);
          return s && r._setSettings(s), r;
      }), "PUBLIC").setMultipleInstances(true)),
      // RUNTIME_ENV and BUILD_TARGET are replaced by real values during the compilation
      registerVersion("firestore-lite", _t, ""), registerVersion("firestore-lite", _t, "esm2020");
  }();

  const __esModule = true ;

  exports.__esModule = __esModule;
  exports.doc = doc;
  exports.getDoc = getDoc;
  exports.getFirestore = getFirestore;
  exports.initializeApp = initializeApp;

}));
