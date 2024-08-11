sap.ui.define((function () { 'use strict';

    /**
     * @license
     * Copyright 2023 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    /**
     * Map of ARIAMixin properties to attributes
     */
    // Shim the global element internals object
    // Methods should be fine as noops and properties can generally
    // be while on the server.
    const ElementInternalsShim = class ElementInternals {
        get shadowRoot() {
            // Grab the shadow root instance from the Element shim
            // to ensure that the shadow root is always available
            // to the internals instance even if the mode is 'closed'
            return this.__host
                .__shadowRoot;
        }
        constructor(_host) {
            this.ariaAtomic = '';
            this.ariaAutoComplete = '';
            this.ariaBrailleLabel = '';
            this.ariaBrailleRoleDescription = '';
            this.ariaBusy = '';
            this.ariaChecked = '';
            this.ariaColCount = '';
            this.ariaColIndex = '';
            this.ariaColSpan = '';
            this.ariaCurrent = '';
            this.ariaDescription = '';
            this.ariaDisabled = '';
            this.ariaExpanded = '';
            this.ariaHasPopup = '';
            this.ariaHidden = '';
            this.ariaInvalid = '';
            this.ariaKeyShortcuts = '';
            this.ariaLabel = '';
            this.ariaLevel = '';
            this.ariaLive = '';
            this.ariaModal = '';
            this.ariaMultiLine = '';
            this.ariaMultiSelectable = '';
            this.ariaOrientation = '';
            this.ariaPlaceholder = '';
            this.ariaPosInSet = '';
            this.ariaPressed = '';
            this.ariaReadOnly = '';
            this.ariaRequired = '';
            this.ariaRoleDescription = '';
            this.ariaRowCount = '';
            this.ariaRowIndex = '';
            this.ariaRowSpan = '';
            this.ariaSelected = '';
            this.ariaSetSize = '';
            this.ariaSort = '';
            this.ariaValueMax = '';
            this.ariaValueMin = '';
            this.ariaValueNow = '';
            this.ariaValueText = '';
            this.role = '';
            this.form = null;
            this.labels = [];
            this.states = new Set();
            this.validationMessage = '';
            this.validity = {};
            this.willValidate = true;
            this.__host = _host;
        }
        checkValidity() {
            // TODO(augustjk) Consider actually implementing logic.
            // See https://github.com/lit/lit/issues/3740
            console.warn('`ElementInternals.checkValidity()` was called on the server.' +
                'This method always returns true.');
            return true;
        }
        reportValidity() {
            return true;
        }
        setFormValue() { }
        setValidity() { }
    };

    const attributes = new WeakMap();
    const attributesForElement = element => {
      let attrs = attributes.get(element);
      if (attrs === undefined) {
        attributes.set(element, attrs = new Map());
      }
      return attrs;
    };
    const ElementShim = class Element {
      constructor() {
        this.__shadowRootMode = null;
        this.__shadowRoot = null;
        this.__internals = null;
      }
      get attributes() {
        return Array.from(attributesForElement(this)).map(([name, value]) => ({
          name,
          value
        }));
      }
      get shadowRoot() {
        if (this.__shadowRootMode === "closed") {
          return null;
        }
        return this.__shadowRoot;
      }
      get localName() {
        return this.constructor.__localName;
      }
      get tagName() {
        return this.localName?.toUpperCase();
      }
      setAttribute(name, value) {
        attributesForElement(this).set(name, String(value));
      }
      removeAttribute(name) {
        attributesForElement(this).delete(name);
      }
      toggleAttribute(name, force) {
        if (this.hasAttribute(name)) {
          if (force === undefined || !force) {
            this.removeAttribute(name);
            return false;
          }
        } else {
          if (force === undefined || force) {
            this.setAttribute(name, "");
            return true;
          } else {
            return false;
          }
        }
        return true;
      }
      hasAttribute(name) {
        return attributesForElement(this).has(name);
      }
      attachShadow(init) {
        const shadowRoot = {
          host: this
        };
        this.__shadowRootMode = init.mode;
        if (init && init.mode === "open") {
          this.__shadowRoot = shadowRoot;
        }
        return shadowRoot;
      }
      attachInternals() {
        if (this.__internals !== null) {
          throw new Error(`Failed to execute 'attachInternals' on 'HTMLElement': ` + `ElementInternals for the specified element was already attached.`);
        }
        const internals = new ElementInternalsShim(this);
        this.__internals = internals;
        return internals;
      }
      getAttribute(name) {
        const value = attributesForElement(this).get(name);
        return value ?? null;
      }
    };
    const ElementShimWithRealType = ElementShim;
    const HTMLElementShim = class HTMLElement extends ElementShim {};
    const HTMLElementShimWithRealType = HTMLElementShim;
    const CustomElementRegistryShim = class CustomElementRegistry {
      constructor() {
        this.__definitions = new Map();
      }
      define(name, ctor) {
        if (this.__definitions.has(name)) {
          {
            throw new Error(`Failed to execute 'define' on 'CustomElementRegistry': ` + `the name "${name}" has already been used with this registry`);
          }
        }
        ctor.__localName = name;
        this.__definitions.set(name, {
          ctor,
          observedAttributes: ctor.observedAttributes ?? []
        });
      }
      get(name) {
        const definition = this.__definitions.get(name);
        return definition?.ctor;
      }
    };
    const CustomElementRegistryShimWithRealType = CustomElementRegistryShim;
    const customElements$1 = new CustomElementRegistryShimWithRealType();

    /* eslint-disable max-classes-per-file */
    globalThis.HTMLElement ??= HTMLElementShimWithRealType;
    globalThis.Element ??= ElementShimWithRealType;
    globalThis.customElements ??= customElements$1;
    class NodeShim {
    }
    globalThis.Node ??= NodeShim;
    class FileListShim {
    }
    globalThis.FileList ??= FileListShim;

    var class2type = {};
    var hasOwn = class2type.hasOwnProperty;
    var toString = class2type.toString;
    var fnToString = hasOwn.toString;
    var ObjectFunctionString = fnToString.call(Object);
    var fnIsPlainObject = function (obj) {
        var proto, Ctor;
        if (!obj || toString.call(obj) !== "[object Object]") {
            return false;
        }
        proto = Object.getPrototypeOf(obj);
        if (!proto) {
            return true;
        }
        Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
        return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
    };

    var oToken = Object.create(null);
    var fnMerge$1 = function (arg1, arg2, arg3, arg4) {
        var src, copyIsArray, copy, name, options, clone, target = arguments[2] || {}, i = 3, length = arguments.length, deep = arguments[0] || false, skipToken = arguments[1] ? undefined : oToken;
        if (typeof target !== 'object' && typeof target !== 'function') {
            target = {};
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (name === '__proto__' || target === copy) {
                        continue;
                    }
                    if (deep && copy && (fnIsPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];
                        }
                        else {
                            clone = src && fnIsPlainObject(src) ? src : {};
                        }
                        target[name] = fnMerge$1(deep, arguments[1], clone, copy);
                    }
                    else if (copy !== skipToken) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };

    const fnMerge = function (arg1, arg2) {
        return fnMerge$1(true, false, ...arguments);
    };

    const whenDOMReady = () => {
        return new Promise(resolve => {
            if (document.body) {
                resolve();
            }
            else {
                document.addEventListener("DOMContentLoaded", () => {
                    resolve();
                });
            }
        });
    };

    class EventProvider {
        constructor() {
            this._eventRegistry = new Map();
        }
        attachEvent(eventName, fnFunction) {
            const eventRegistry = this._eventRegistry;
            const eventListeners = eventRegistry.get(eventName);
            if (!Array.isArray(eventListeners)) {
                eventRegistry.set(eventName, [fnFunction]);
                return;
            }
            if (!eventListeners.includes(fnFunction)) {
                eventListeners.push(fnFunction);
            }
        }
        detachEvent(eventName, fnFunction) {
            const eventRegistry = this._eventRegistry;
            const eventListeners = eventRegistry.get(eventName);
            if (!eventListeners) {
                return;
            }
            const indexOfFnToDetach = eventListeners.indexOf(fnFunction);
            if (indexOfFnToDetach !== -1) {
                eventListeners.splice(indexOfFnToDetach, 1);
            }
            if (eventListeners.length === 0) {
                eventRegistry.delete(eventName);
            }
        }
        /**
         * Fires an event and returns the results of all event listeners as an array.
         *
         * @param eventName the event to fire
         * @param data optional data to pass to each event listener
         * @returns {Array} an array with the results of all event listeners
         */
        fireEvent(eventName, data) {
            const eventRegistry = this._eventRegistry;
            const eventListeners = eventRegistry.get(eventName);
            if (!eventListeners) {
                return [];
            }
            return eventListeners.map(fn => {
                return fn.call(this, data);
            });
        }
        /**
         * Fires an event and returns a promise that will resolve once all listeners have resolved.
         *
         * @param eventName the event to fire
         * @param data optional data to pass to each event listener
         * @returns {Promise} a promise that will resolve when all listeners have resolved
         */
        fireEventAsync(eventName, data) {
            return Promise.all(this.fireEvent(eventName, data));
        }
        isHandlerAttached(eventName, fnFunction) {
            const eventRegistry = this._eventRegistry;
            const eventListeners = eventRegistry.get(eventName);
            if (!eventListeners) {
                return false;
            }
            return eventListeners.includes(fnFunction);
        }
        hasListeners(eventName) {
            return !!this._eventRegistry.get(eventName);
        }
    }

    const VersionInfo = {
        version: "2.1.1",
        major: 2,
        minor: 1,
        patch: 1,
        suffix: "",
        isNext: false,
        buildTime: 1722611401,
    };

    /**
     * Returns a singleton HTML element, inserted in given parent element of HTML page,
     * used mostly to store and share global resources between multiple UI5 Web Components runtimes.
     *
     * @param { string } tag the element tag/selector
     * @param { HTMLElement } parentElement the parent element to insert the singleton element instance
     * @param { Function } createEl a factory function for the element instantiation, by default document.createElement is used
     * @returns { Element }
     */
    const getSingletonElementInstance = (tag, parentElement = document.body, createEl) => {
        let el = document.querySelector(tag);
        if (el) {
            return el;
        }
        el = createEl ? createEl() : document.createElement(tag);
        return parentElement.insertBefore(el, parentElement.firstChild);
    };

    const getMetaDomEl = () => {
        const el = document.createElement("meta");
        el.setAttribute("name", "ui5-shared-resources");
        el.setAttribute("content", ""); // attribute "content" should be present when "name" is set.
        return el;
    };
    const getSharedResourcesInstance = () => {
        if (typeof document === "undefined") {
            return null;
        }
        return getSingletonElementInstance(`meta[name="ui5-shared-resources"]`, document.head, getMetaDomEl);
    };
    /**
     * Use this method to initialize/get resources that you would like to be shared among UI5 Web Components runtime instances.
     * The data will be accessed via a singleton "ui5-shared-resources" HTML element in the "body" element of the page.
     *
     * @public
     * @param namespace Unique ID of the resource, may contain "." to denote hierarchy
     * @param initialValue Object or primitive that will be used as an initial value if the resource does not exist
     * @returns {*}
     */
    const getSharedResource = (namespace, initialValue) => {
        const parts = namespace.split(".");
        let current = getSharedResourcesInstance();
        if (!current) {
            return initialValue;
        }
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const lastPart = i === parts.length - 1;
            if (!Object.prototype.hasOwnProperty.call(current, part)) {
                current[part] = lastPart ? initialValue : {};
            }
            current = current[part];
        }
        return current;
    };

    let currentRuntimeIndex;
    let currentRuntimeAlias = "";
    const compareCache = new Map();
    /**
     * Central registry where all runtimes register themselves by pushing an object.
     * The index in the registry servers as an ID for the runtime.
     * @type {*}
     */
    const Runtimes = getSharedResource("Runtimes", []);
    /**
     * Registers the current runtime in the shared runtimes resource registry
     */
    const registerCurrentRuntime = () => {
        if (currentRuntimeIndex === undefined) {
            currentRuntimeIndex = Runtimes.length;
            const versionInfo = VersionInfo;
            Runtimes.push({
                ...versionInfo,
                alias: currentRuntimeAlias,
                description: `Runtime ${currentRuntimeIndex} - ver ${versionInfo.version}${""}`,
            });
        }
    };
    /**
     * Returns the index of the current runtime's object in the shared runtimes resource registry
     * @returns {*}
     */
    const getCurrentRuntimeIndex = () => {
        return currentRuntimeIndex;
    };
    /**
     * Compares two runtimes and returns 1 if the first is of a bigger version, -1 if the second is of a bigger version, and 0 if equal
     * @param index1 The index of the first runtime to compare
     * @param index2 The index of the second runtime to compare
     * @returns {number}
     */
    const compareRuntimes = (index1, index2) => {
        const cacheIndex = `${index1},${index2}`;
        if (compareCache.has(cacheIndex)) {
            return compareCache.get(cacheIndex);
        }
        const runtime1 = Runtimes[index1];
        const runtime2 = Runtimes[index2];
        if (!runtime1 || !runtime2) {
            throw new Error("Invalid runtime index supplied");
        }
        // If any of the two is a next version, bigger buildTime wins
        if (runtime1.isNext || runtime2.isNext) {
            return runtime1.buildTime - runtime2.buildTime;
        }
        // If major versions differ, bigger one wins
        const majorDiff = runtime1.major - runtime2.major;
        if (majorDiff) {
            return majorDiff;
        }
        // If minor versions differ, bigger one wins
        const minorDiff = runtime1.minor - runtime2.minor;
        if (minorDiff) {
            return minorDiff;
        }
        // If patch versions differ, bigger one wins
        const patchDiff = runtime1.patch - runtime2.patch;
        if (patchDiff) {
            return patchDiff;
        }
        // Bigger suffix wins, f.e. rc10 > rc9
        // Important: suffix is alphanumeric, must use natural compare
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
        const result = collator.compare(runtime1.suffix, runtime2.suffix);
        compareCache.set(cacheIndex, result);
        return result;
    };
    const getAllRuntimes = () => {
        return Runtimes;
    };

    const isSSR$2 = typeof document === "undefined";
    const getStyleId = (name, value) => {
        return value ? `${name}|${value}` : name;
    };
    const shouldUpdate = (runtimeIndex) => {
        if (runtimeIndex === undefined) {
            return true;
        }
        return compareRuntimes(getCurrentRuntimeIndex(), parseInt(runtimeIndex)) === 1; // 1 means the current is newer, 0 means the same, -1 means the resource's runtime is newer
    };
    const createStyle = (data, name, value = "", theme) => {
        const content = typeof data === "string" ? data : data.content;
        const currentRuntimeIndex = getCurrentRuntimeIndex();
        const stylesheet = new CSSStyleSheet();
        stylesheet.replaceSync(content);
        stylesheet._ui5StyleId = getStyleId(name, value); // set an id so that we can find the style later
        if (theme) {
            stylesheet._ui5RuntimeIndex = currentRuntimeIndex;
            stylesheet._ui5Theme = theme;
        }
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, stylesheet];
    };
    const updateStyle = (data, name, value = "", theme) => {
        const content = typeof data === "string" ? data : data.content;
        const currentRuntimeIndex = getCurrentRuntimeIndex();
        const stylesheet = document.adoptedStyleSheets.find(sh => sh._ui5StyleId === getStyleId(name, value));
        if (!stylesheet) {
            return;
        }
        if (!theme) {
            stylesheet.replaceSync(content || "");
        }
        else {
            const stylesheetRuntimeIndex = stylesheet._ui5RuntimeIndex;
            const stylesheetTheme = stylesheet._ui5Theme;
            if (stylesheetTheme !== theme || shouldUpdate(stylesheetRuntimeIndex)) {
                stylesheet.replaceSync(content || "");
                stylesheet._ui5RuntimeIndex = String(currentRuntimeIndex);
                stylesheet._ui5Theme = theme;
            }
        }
    };
    const hasStyle = (name, value = "") => {
        if (isSSR$2) {
            return true;
        }
        return !!document.adoptedStyleSheets.find(sh => sh._ui5StyleId === getStyleId(name, value));
    };
    const removeStyle = (name, value = "") => {
        document.adoptedStyleSheets = document.adoptedStyleSheets.filter(sh => sh._ui5StyleId !== getStyleId(name, value));
    };
    const createOrUpdateStyle = (data, name, value = "", theme) => {
        if (hasStyle(name, value)) {
            updateStyle(data, name, value, theme);
        }
        else {
            createStyle(data, name, value, theme);
        }
    };
    const mergeStyles = (style1, style2) => {
        if (style1 === undefined) {
            return style2;
        }
        if (style2 === undefined) {
            return style1;
        }
        const style2Content = typeof style2 === "string" ? style2 : style2.content;
        if (typeof style1 === "string") {
            return `${style1} ${style2Content}`;
        }
        return {
            content: `${style1.content} ${style2Content}`,
            packageName: style1.packageName,
            fileName: style1.fileName,
        };
    };

    const features = new Map();
    const componentFeatures = new Map();
    const subscribers = new Map();
    const EVENT_NAME = "componentFeatureLoad";
    const eventProvider$5 = new EventProvider();
    const featureLoadEventName = name => `${EVENT_NAME}_${name}`;
    const getFeature = name => {
      return features.get(name);
    };
    const getComponentFeature = name => {
      return componentFeatures.get(name);
    };
    const subscribeForFeatureLoad = (name, klass, callback) => {
      const subscriber = subscribers.get(klass);
      const isSubscribed = subscriber?.includes(name);
      if (isSubscribed) {
        return;
      }
      if (!subscriber) {
        subscribers.set(klass, [name]);
      } else {
        subscriber.push(name);
      }
      eventProvider$5.attachEvent(featureLoadEventName(name), callback);
    };

    const styleData$7 = {
        packageName: "@ui5/webcomponents-base",
        fileName: "FontFace.css",
        content: `@font-face{font-family:"72";font-style:normal;font-weight:400;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Regular.woff2?ui5-webcomponents) format("woff2"),local("72");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:"72full";font-style:normal;font-weight:400;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Regular-full.woff2?ui5-webcomponents) format("woff2"),local('72-full')}@font-face{font-family:"72";font-style:normal;font-weight:700;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Bold.woff2?ui5-webcomponents) format("woff2"),local('72-Bold');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:"72full";font-style:normal;font-weight:700;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Bold-full.woff2?ui5-webcomponents) format("woff2")}@font-face{font-family:'72-Bold';font-style:normal;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Bold.woff2?ui5-webcomponents) format("woff2"),local('72-Bold');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72-Boldfull';font-style:normal;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Bold-full.woff2?ui5-webcomponents) format("woff2")}@font-face{font-family:'72-Light';font-style:normal;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Light.woff2?ui5-webcomponents) format("woff2"),local('72-Light');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72-Lightfull';font-style:normal;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Light-full.woff2?ui5-webcomponents) format("woff2")}@font-face{font-family:'72Mono';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72Mono-Regular.woff2?ui5-webcomponents) format('woff2'),local('72Mono');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72Monofull';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72Mono-Regular-full.woff2?ui5-webcomponents) format('woff2')}@font-face{font-family:'72Mono-Bold';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72Mono-Bold.woff2?ui5-webcomponents) format('woff2'),local('72Mono-Bold');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72Mono-Boldfull';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72Mono-Bold-full.woff2?ui5-webcomponents) format('woff2')}@font-face{font-family:"72Black";font-style:bold;font-weight:900;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Black.woff2?ui5-webcomponents) format("woff2"),local('72Black');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72Blackfull';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Black-full.woff2?ui5-webcomponents) format('woff2')}@font-face{font-family:"72-SemiboldDuplex";src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-SemiboldDuplex.woff2?ui5-webcomponents) format("woff2"),local('72-SemiboldDuplex');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}`,
    };

    const styleData$6 = {
        packageName: "@ui5/webcomponents-base",
        fileName: "OverrideFontFace.css",
        content: `@font-face{font-family:'72override';unicode-range:U+0102-0103,U+01A0-01A1,U+01AF-01B0,U+1EA0-1EB7,U+1EB8-1EC7,U+1EC8-1ECB,U+1ECC-1EE3,U+1EE4-1EF1,U+1EF4-1EF7;src:local('Arial'),local('Helvetica'),local('sans-serif')}`,
    };

    const assetParameters = { "themes": { "default": "sap_horizon", "all": ["sap_fiori_3", "sap_fiori_3_dark", "sap_fiori_3_hcb", "sap_fiori_3_hcw", "sap_horizon", "sap_horizon_dark", "sap_horizon_hcb", "sap_horizon_hcw", "sap_horizon_exp", "sap_horizon_dark_exp", "sap_horizon_hcb_exp", "sap_horizon_hcw_exp"] }, "languages": { "default": "en", "all": ["ar", "bg", "ca", "cnr", "cs", "cy", "da", "de", "el", "en", "en_GB", "en_US_sappsd", "en_US_saprigi", "en_US_saptrc", "es", "es_MX", "et", "fi", "fr", "fr_CA", "hi", "hr", "hu", "in", "it", "iw", "ja", "kk", "ko", "lt", "lv", "mk", "ms", "nl", "no", "pl", "pt_PT", "pt", "ro", "ru", "sh", "sk", "sl", "sr", "sv", "th", "tr", "uk", "vi", "zh_CN", "zh_TW"] }, "locales": { "default": "en", "all": ["ar", "ar_EG", "ar_SA", "bg", "ca", "cnr", "cs", "da", "de", "de_AT", "de_CH", "el", "el_CY", "en", "en_AU", "en_GB", "en_HK", "en_IE", "en_IN", "en_NZ", "en_PG", "en_SG", "en_ZA", "es", "es_AR", "es_BO", "es_CL", "es_CO", "es_MX", "es_PE", "es_UY", "es_VE", "et", "fa", "fi", "fr", "fr_BE", "fr_CA", "fr_CH", "fr_LU", "he", "hi", "hr", "hu", "id", "it", "it_CH", "ja", "kk", "ko", "lt", "lv", "ms", "mk", "nb", "nl", "nl_BE", "pl", "pt", "pt_PT", "ro", "ru", "ru_UA", "sk", "sl", "sr", "sr_Latn", "sv", "th", "tr", "uk", "vi", "zh_CN", "zh_HK", "zh_SG", "zh_TW"] } };
    const DEFAULT_THEME = assetParameters.themes.default;
    const SUPPORTED_THEMES = assetParameters.themes.all;
    const DEFAULT_LANGUAGE = assetParameters.languages.default;
    const DEFAULT_LOCALE = assetParameters.locales.default;

    const getMetaTagValue = (metaTagName) => {
        const metaTag = document.querySelector(`META[name="${metaTagName}"]`), metaTagContent = metaTag && metaTag.getAttribute("content");
        return metaTagContent;
    };
    const validateThemeOrigin = (origin) => {
        const allowedOrigins = getMetaTagValue("sap-allowedThemeOrigins");
        return allowedOrigins && allowedOrigins.split(",").some(allowedOrigin => {
            return allowedOrigin === "*" || origin === allowedOrigin.trim();
        });
    };
    const buildCorrectUrl = (oldUrl, newOrigin) => {
        const oldUrlPath = new URL(oldUrl).pathname;
        return new URL(oldUrlPath, newOrigin).toString();
    };
    const validateThemeRoot = (themeRoot) => {
        let resultUrl;
        try {
            if (themeRoot.startsWith(".") || themeRoot.startsWith("/")) {
                // Handle relative url
                // new URL("/newExmPath", "http://example.com/exmPath") => http://example.com/newExmPath
                // new URL("./newExmPath", "http://example.com/exmPath") => http://example.com/exmPath/newExmPath
                // new URL("../newExmPath", "http://example.com/exmPath") => http://example.com/newExmPath
                resultUrl = new URL(themeRoot, window.location.href).toString();
            }
            else {
                const themeRootURL = new URL(themeRoot);
                const origin = themeRootURL.origin;
                if (origin && validateThemeOrigin(origin)) {
                    // If origin is allowed, use it
                    resultUrl = themeRootURL.toString();
                }
                else {
                    // If origin is not allow and the URL is not relative, we have to replace the origin
                    // with current location
                    resultUrl = buildCorrectUrl(themeRootURL.toString(), window.location.href);
                }
            }
            if (!resultUrl.endsWith("/")) {
                resultUrl = `${resultUrl}/`;
            }
            return `${resultUrl}UI5/`;
        }
        catch (e) {
            // Catch if URL is not correct
        }
    };

    /**
     * Different types of AnimationMode.
     *
     * @public
     */
    var AnimationMode;
    (function (AnimationMode) {
        /**
         * @public
         */
        AnimationMode["Full"] = "full";
        /**
         * @public
         */
        AnimationMode["Basic"] = "basic";
        /**
         * @public
         */
        AnimationMode["Minimal"] = "minimal";
        /**
         * @public
         */
        AnimationMode["None"] = "none";
    })(AnimationMode || (AnimationMode = {}));
    var AnimationMode$1 = AnimationMode;

    let initialized = false;
    let initialConfig = {
        animationMode: AnimationMode$1.Full,
        theme: DEFAULT_THEME,
        themeRoot: undefined,
        rtl: undefined,
        language: undefined,
        timezone: undefined,
        calendarType: undefined,
        secondaryCalendarType: undefined,
        noConflict: false,
        formatSettings: {},
        fetchDefaultLanguage: false,
        defaultFontLoading: true,
    };
    /* General settings */
    const getAnimationMode$1 = () => {
        initConfiguration();
        return initialConfig.animationMode;
    };
    const getTheme$1 = () => {
        initConfiguration();
        return initialConfig.theme;
    };
    const getThemeRoot$1 = () => {
        initConfiguration();
        return initialConfig.themeRoot;
    };
    const getLanguage$1 = () => {
        initConfiguration();
        return initialConfig.language;
    };
    /**
     * Returns if the default language, that is inlined at build time,
     * should be fetched over the network instead.
     * @returns {Boolean}
     */
    const getFetchDefaultLanguage$1 = () => {
        initConfiguration();
        return initialConfig.fetchDefaultLanguage;
    };
    const getNoConflict$1 = () => {
        initConfiguration();
        return initialConfig.noConflict;
    };
    const getDefaultFontLoading$1 = () => {
        initConfiguration();
        return initialConfig.defaultFontLoading;
    };
    const booleanMapping = new Map();
    booleanMapping.set("true", true);
    booleanMapping.set("false", false);
    const parseConfigurationScript = () => {
        const configScript = document.querySelector("[data-ui5-config]") || document.querySelector("[data-id='sap-ui-config']"); // for backward compatibility
        let configJSON;
        if (configScript) {
            try {
                configJSON = JSON.parse(configScript.innerHTML);
            }
            catch (err) {
                console.warn("Incorrect data-sap-ui-config format. Please use JSON"); /* eslint-disable-line */
            }
            if (configJSON) {
                initialConfig = fnMerge(initialConfig, configJSON);
            }
        }
    };
    const parseURLParameters = () => {
        const params = new URLSearchParams(window.location.search);
        // Process "sap-*" params first
        params.forEach((value, key) => {
            const parts = key.split("sap-").length;
            if (parts === 0 || parts === key.split("sap-ui-").length) {
                return;
            }
            applyURLParam(key, value, "sap");
        });
        // Process "sap-ui-*" params
        params.forEach((value, key) => {
            if (!key.startsWith("sap-ui")) {
                return;
            }
            applyURLParam(key, value, "sap-ui");
        });
    };
    const normalizeThemeRootParamValue = (value) => {
        const themeRoot = value.split("@")[1];
        return validateThemeRoot(themeRoot);
    };
    const normalizeThemeParamValue = (param, value) => {
        if (param === "theme" && value.includes("@")) { // the theme parameter might have @<URL-TO-THEME> in the value - strip this
            return value.split("@")[0];
        }
        return value;
    };
    const applyURLParam = (key, value, paramType) => {
        const lowerCaseValue = value.toLowerCase();
        const param = key.split(`${paramType}-`)[1];
        if (booleanMapping.has(value)) {
            value = booleanMapping.get(lowerCaseValue);
        }
        if (param === "theme") {
            initialConfig.theme = normalizeThemeParamValue(param, value);
            if (value && value.includes("@")) {
                initialConfig.themeRoot = normalizeThemeRootParamValue(value);
            }
        }
        else {
            initialConfig[param] = value;
        }
    };
    const applyOpenUI5Configuration = () => {
        const openUI5Support = getFeature("OpenUI5Support");
        if (!openUI5Support || !openUI5Support.isOpenUI5Detected()) {
            return;
        }
        const OpenUI5Config = openUI5Support.getConfigurationSettingsObject();
        initialConfig = fnMerge(initialConfig, OpenUI5Config);
    };
    const initConfiguration = () => {
        if (typeof document === "undefined" || initialized) {
            return;
        }
        // 1. Lowest priority - configuration script
        parseConfigurationScript();
        // 2. URL parameters overwrite configuration script parameters
        parseURLParameters();
        // 3. If OpenUI5 is detected, it has the highest priority
        applyOpenUI5Configuration();
        initialized = true;
    };

    let defaultFontLoading;
    /**
     * Returns if the "defaultFontLoading" configuration is set.
     * @public
     * @returns { boolean }
     */
    const getDefaultFontLoading = () => {
        if (defaultFontLoading === undefined) {
            defaultFontLoading = getDefaultFontLoading$1();
        }
        return defaultFontLoading;
    };

    const insertFontFace = () => {
        const openUI5Support = getFeature("OpenUI5Support");
        // Only set the main font if there is no OpenUI5 support, or there is, but OpenUI5 is not loaded
        if ((!openUI5Support || !openUI5Support.isOpenUI5Detected())) {
            insertMainFontFace();
        }
        // Always set the override font - OpenUI5 in CSS Vars mode does not set it, unlike the main font
        insertOverrideFontFace();
    };
    const insertMainFontFace = () => {
        const hasFontStyles = document.querySelector("head>style[data-ui5-font-face]");
        if (!getDefaultFontLoading() || hasFontStyles) {
            return;
        }
        if (!hasStyle("data-ui5-font-face")) {
            createStyle(styleData$7, "data-ui5-font-face");
        }
    };
    const insertOverrideFontFace = () => {
        if (!hasStyle("data-ui5-font-face-override")) {
            createStyle(styleData$6, "data-ui5-font-face-override");
        }
    };

    const styleData$5 = {
        packageName: "@ui5/webcomponents-base",
        fileName: "SystemCSSVars.css",
        content: `:root{--_ui5_content_density:cozy}.sapUiSizeCompact,.ui5-content-density-compact,[data-ui5-compact-size]{--_ui5_content_density:compact}`,
    };

    const insertSystemCSSVars = () => {
        if (!hasStyle("data-ui5-system-css-vars")) {
            createStyle(styleData$5, "data-ui5-system-css-vars");
        }
    };

    const MAX_PROCESS_COUNT = 10;
    class RenderQueue {
        constructor() {
            this.list = []; // Used to store the web components in order
            this.lookup = new Set(); // Used for faster search
        }
        add(webComponent) {
            if (this.lookup.has(webComponent)) {
                return;
            }
            this.list.push(webComponent);
            this.lookup.add(webComponent);
        }
        remove(webComponent) {
            if (!this.lookup.has(webComponent)) {
                return;
            }
            this.list = this.list.filter(item => item !== webComponent);
            this.lookup.delete(webComponent);
        }
        shift() {
            const webComponent = this.list.shift();
            if (webComponent) {
                this.lookup.delete(webComponent);
                return webComponent;
            }
        }
        isEmpty() {
            return this.list.length === 0;
        }
        isAdded(webComponent) {
            return this.lookup.has(webComponent);
        }
        /**
         * Processes the whole queue by executing the callback on each component,
         * while also imposing restrictions on how many times a component may be processed.
         *
         * @param callback - function with one argument (the web component to be processed)
         */
        process(callback) {
            let webComponent;
            const stats = new Map();
            webComponent = this.shift();
            while (webComponent) {
                const timesProcessed = stats.get(webComponent) || 0;
                if (timesProcessed > MAX_PROCESS_COUNT) {
                    throw new Error(`Web component processed too many times this task, max allowed is: ${MAX_PROCESS_COUNT}`);
                }
                callback(webComponent);
                stats.set(webComponent, timesProcessed + 1);
                webComponent = this.shift();
            }
        }
    }

    const Tags = getSharedResource("Tags", new Map());
    const Definitions = new Set();
    let Failures = new Map();
    let failureTimeout;
    const UNKNOWN_RUNTIME = -1;
    const registerTag = tag => {
      Definitions.add(tag);
      Tags.set(tag, getCurrentRuntimeIndex());
    };
    const isTagRegistered = tag => {
      return Definitions.has(tag);
    };
    const getAllRegisteredTags = () => {
      return [...Definitions.values()];
    };
    const recordTagRegistrationFailure = tag => {
      let tagRegRuntimeIndex = Tags.get(tag);
      if (tagRegRuntimeIndex === undefined) {
        tagRegRuntimeIndex = UNKNOWN_RUNTIME;
      }
      if (!Failures.has(tagRegRuntimeIndex)) {
        Failures.set(tagRegRuntimeIndex, new Set());
      }
      Failures.get(tagRegRuntimeIndex).add(tag);
      if (!failureTimeout) {
        failureTimeout = setTimeout(() => {
          displayFailedRegistrations();
          Failures = new Map();
          failureTimeout = undefined;
        }, 1000);
      }
    };
    const displayFailedRegistrations = () => {
      const allRuntimes = getAllRuntimes();
      const currentRuntimeIndex = getCurrentRuntimeIndex();
      const currentRuntime = allRuntimes[currentRuntimeIndex];
      let message = `Multiple UI5 Web Components instances detected.`;
      if (allRuntimes.length > 1) {
        message = `${message}\nLoading order (versions before 1.1.0 not listed): ${allRuntimes.map(runtime => `\n${runtime.description}`).join("")}`;
      }
      [...Failures.keys()].forEach(otherRuntimeIndex => {
        let comparison;
        let otherRuntime;
        if (otherRuntimeIndex === UNKNOWN_RUNTIME) {
          comparison = 1;
          otherRuntime = {
            description: `Older unknown runtime`
          };
        } else {
          comparison = compareRuntimes(currentRuntimeIndex, otherRuntimeIndex);
          otherRuntime = allRuntimes[otherRuntimeIndex];
        }
        let compareWord;
        if (comparison > 0) {
          compareWord = "an older";
        } else if (comparison < 0) {
          compareWord = "a newer";
        } else {
          compareWord = "the same";
        }
        message = `${message}\n\n"${currentRuntime.description}" failed to define ${Failures.get(otherRuntimeIndex).size} tag(s) as they were defined by a runtime of ${compareWord} version "${otherRuntime.description}": ${[...Failures.get(otherRuntimeIndex)].sort().join(", ")}.`;
        if (comparison > 0) {
          message = `${message}\nWARNING! If your code uses features of the above web components, unavailable in ${otherRuntime.description}, it might not work as expected!`;
        } else {
          message = `${message}\nSince the above web components were defined by the same or newer version runtime, they should be compatible with your code.`;
        }
      });
      message = `${message}\n\nTo prevent other runtimes from defining tags that you use, consider using scoping or have third-party libraries use scoping: https://github.com/SAP/ui5-webcomponents/blob/main/docs/2-advanced/03-scoping.md.`;
      console.warn(message);
    };

    const rtlAwareSet = new Set();
    const markAsRtlAware = (klass) => {
        rtlAwareSet.add(klass);
    };
    const isRtlAware = (klass) => {
        return rtlAwareSet.has(klass);
    };

    const registeredElements = new Set();
    const eventProvider$4 = new EventProvider();
    const invalidatedWebComponents = new RenderQueue(); // Queue for invalidated web components
    let renderTaskPromise, renderTaskPromiseResolve;
    let mutationObserverTimer;
    let queuePromise;
    /**
     * Schedules a render task (if not already scheduled) to render the component
     *
     * @param webComponent
     * @returns {Promise}
     */
    const renderDeferred = async (webComponent) => {
        // Enqueue the web component
        invalidatedWebComponents.add(webComponent);
        // Schedule a rendering task
        await scheduleRenderTask();
    };
    /**
     * Renders a component synchronously and adds it to the registry of rendered components
     *
     * @param webComponent
     */
    const renderImmediately = (webComponent) => {
        eventProvider$4.fireEvent("beforeComponentRender", webComponent);
        registeredElements.add(webComponent);
        webComponent._render();
    };
    /**
     * Cancels the rendering of a component, if awaiting to be rendered, and removes it from the registry of rendered components
     *
     * @param webComponent
     */
    const cancelRender = (webComponent) => {
        invalidatedWebComponents.remove(webComponent);
        registeredElements.delete(webComponent);
    };
    /**
     * Schedules a rendering task, if not scheduled already
     */
    const scheduleRenderTask = async () => {
        if (!queuePromise) {
            queuePromise = new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    // Render all components in the queue
                    // console.log(`--------------------RENDER TASK START------------------------------`); // eslint-disable-line
                    invalidatedWebComponents.process(renderImmediately);
                    // console.log(`--------------------RENDER TASK END------------------------------`); // eslint-disable-line
                    // Resolve the promise so that callers of renderDeferred can continue
                    queuePromise = null;
                    resolve();
                    // Wait for Mutation observer before the render task is considered finished
                    if (!mutationObserverTimer) {
                        mutationObserverTimer = setTimeout(() => {
                            mutationObserverTimer = undefined;
                            if (invalidatedWebComponents.isEmpty()) {
                                _resolveTaskPromise();
                            }
                        }, 200);
                    }
                });
            });
        }
        await queuePromise;
    };
    /**
     * return a promise that will be resolved once all invalidated web components are rendered
     */
    const whenDOMUpdated = () => {
        if (renderTaskPromise) {
            return renderTaskPromise;
        }
        renderTaskPromise = new Promise(resolve => {
            renderTaskPromiseResolve = resolve;
            window.requestAnimationFrame(() => {
                if (invalidatedWebComponents.isEmpty()) {
                    renderTaskPromise = undefined;
                    resolve();
                }
            });
        });
        return renderTaskPromise;
    };
    const whenAllCustomElementsAreDefined = () => {
        const definedPromises = getAllRegisteredTags().map(tag => customElements.whenDefined(tag));
        return Promise.all(definedPromises);
    };
    const renderFinished = async () => {
        await whenAllCustomElementsAreDefined();
        await whenDOMUpdated();
    };
    const _resolveTaskPromise = () => {
        if (!invalidatedWebComponents.isEmpty()) {
            // More updates are pending. Resolve will be called again
            return;
        }
        if (renderTaskPromiseResolve) {
            renderTaskPromiseResolve();
            renderTaskPromiseResolve = undefined;
            renderTaskPromise = undefined;
        }
    };
    /**
     * Re-renders all UI5 Elements on the page, with the option to specify filters to rerender only some components.
     *
     * Usage:
     * reRenderAllUI5Elements() -> re-renders all components
     * reRenderAllUI5Elements({tag: "ui5-button"}) -> re-renders only instances of ui5-button
     * reRenderAllUI5Elements({rtlAware: true}) -> re-renders only rtlAware components
     * reRenderAllUI5Elements({languageAware: true}) -> re-renders only languageAware components
     * reRenderAllUI5Elements({themeAware: true}) -> re-renders only themeAware components
     * reRenderAllUI5Elements({rtlAware: true, languageAware: true}) -> re-renders components that are rtlAware or languageAware
     * etc...
     *
     * @public
     * @param {object|undefined} filters - Object with keys that can be "rtlAware" or "languageAware"
     * @returns {Promise<void>}
     */
    const reRenderAllUI5Elements = async (filters) => {
        registeredElements.forEach((element) => {
            const ctor = element.constructor;
            const tag = ctor.getMetadata().getTag();
            const rtlAware = isRtlAware(ctor);
            const languageAware = ctor.getMetadata().isLanguageAware();
            const themeAware = ctor.getMetadata().isThemeAware();
            if (!filters || (filters.tag === tag) || (filters.rtlAware && rtlAware) || (filters.languageAware && languageAware) || (filters.themeAware && themeAware)) {
                renderDeferred(element);
            }
        });
        await renderFinished();
    };

    const eventProvider$3 = new EventProvider();
    const THEME_REGISTERED = "themeRegistered";
    const attachThemeRegistered = (listener) => {
        eventProvider$3.attachEvent(THEME_REGISTERED, listener);
    };
    const fireThemeRegistered = (theme) => {
        return eventProvider$3.fireEvent(THEME_REGISTERED, theme);
    };

    const themeStyles = new Map();
    const loaders$2 = new Map();
    const customLoaders = new Map();
    const registeredPackages = new Set();
    const registeredThemes = new Set();
    const registerThemePropertiesLoader = (packageName, themeName, loader) => {
        loaders$2.set(`${packageName}/${themeName}`, loader);
        registeredPackages.add(packageName);
        registeredThemes.add(themeName);
        fireThemeRegistered(themeName);
    };
    const getThemeProperties = async (packageName, themeName, externalThemeName) => {
        const cacheKey = `${packageName}_${themeName}_${externalThemeName || ""}`;
        const cachedStyleData = themeStyles.get(cacheKey);
        if (cachedStyleData !== undefined) { // it's valid for style to be an empty string
            return cachedStyleData;
        }
        if (!registeredThemes.has(themeName)) {
            const regThemesStr = [...registeredThemes.values()].join(", ");
            console.warn(`You have requested a non-registered theme ${themeName} - falling back to ${DEFAULT_THEME}. Registered themes are: ${regThemesStr}`); /* eslint-disable-line */
            return _getThemeProperties(packageName, DEFAULT_THEME);
        }
        const [style, customStyle] = await Promise.all([
            _getThemeProperties(packageName, themeName),
            externalThemeName ? _getThemeProperties(packageName, externalThemeName, true) : undefined,
        ]);
        const styleData = mergeStyles(style, customStyle);
        if (styleData) {
            themeStyles.set(cacheKey, styleData);
        }
        return styleData;
    };
    const _getThemeProperties = async (packageName, themeName, forCustomTheme = false) => {
        const loadersMap = forCustomTheme ? customLoaders : loaders$2;
        const loader = loadersMap.get(`${packageName}/${themeName}`);
        if (!loader) {
            // no themes for package
            if (!forCustomTheme) {
                console.error(`Theme [${themeName}] not registered for package [${packageName}]`); /* eslint-disable-line */
            }
            return;
        }
        let data;
        try {
            data = await loader(themeName);
        }
        catch (error) {
            const e = error;
            console.error(packageName, e.message); /* eslint-disable-line */
            return;
        }
        const themeProps = data._ || data; // Refactor: remove _ everywhere
        return themeProps;
    };
    const getRegisteredPackages = () => {
        return registeredPackages;
    };
    const isThemeRegistered = (theme) => {
        return registeredThemes.has(theme);
    };

    const warnings = new Set();
    const getThemeMetadata = () => {
        // Check if the class was already applied, most commonly to the link/style tag with the CSS Variables
        let el = document.querySelector(".sapThemeMetaData-Base-baseLib") || document.querySelector(".sapThemeMetaData-UI5-sap-ui-core");
        if (el) {
            return getComputedStyle(el).backgroundImage;
        }
        el = document.createElement("span");
        el.style.display = "none";
        // Try with sapThemeMetaData-Base-baseLib first
        el.classList.add("sapThemeMetaData-Base-baseLib");
        document.body.appendChild(el);
        let metadata = getComputedStyle(el).backgroundImage;
        // Try with sapThemeMetaData-UI5-sap-ui-core only if the previous selector was not found
        if (metadata === "none") {
            el.classList.add("sapThemeMetaData-UI5-sap-ui-core");
            metadata = getComputedStyle(el).backgroundImage;
        }
        document.body.removeChild(el);
        return metadata;
    };
    const parseThemeMetadata = (metadataString) => {
        const params = /\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(metadataString);
        if (params && params.length >= 2) {
            let paramsString = params[1];
            paramsString = paramsString.replace(/\\"/g, `"`);
            if (paramsString.charAt(0) !== "{" && paramsString.charAt(paramsString.length - 1) !== "}") {
                try {
                    paramsString = decodeURIComponent(paramsString);
                }
                catch (ex) {
                    if (!warnings.has("decode")) {
                        console.warn("Malformed theme metadata string, unable to decodeURIComponent"); // eslint-disable-line
                        warnings.add("decode");
                    }
                    return;
                }
            }
            try {
                return JSON.parse(paramsString);
            }
            catch (ex) {
                if (!warnings.has("parse")) {
                    console.warn("Malformed theme metadata string, unable to parse JSON"); // eslint-disable-line
                    warnings.add("parse");
                }
            }
        }
    };
    const processThemeMetadata = (metadata) => {
        let themeName;
        let baseThemeName;
        try {
            themeName = metadata.Path.match(/\.([^.]+)\.css_variables$/)[1];
            baseThemeName = metadata.Extends[0];
        }
        catch (ex) {
            if (!warnings.has("object")) {
                console.warn("Malformed theme metadata Object", metadata); // eslint-disable-line
                warnings.add("object");
            }
            return;
        }
        return {
            themeName,
            baseThemeName,
        };
    };
    const getThemeDesignerTheme = () => {
        const metadataString = getThemeMetadata();
        if (!metadataString || metadataString === "none") {
            return;
        }
        const metadata = parseThemeMetadata(metadataString);
        if (metadata) {
            return processThemeMetadata(metadata);
        }
    };

    const eventProvider$2 = new EventProvider();
    const THEME_LOADED = "themeLoaded";
    const fireThemeLoaded = (theme) => {
        return eventProvider$2.fireEvent(THEME_LOADED, theme);
    };

    /**
     * Creates a `<link>` tag in the `<head>` tag
     * @param href - the CSS
     * @param attributes - optional attributes to add to the tag
     */
    const createLinkInHead = (href, attributes) => {
        const link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        if (attributes) {
            Object.entries(attributes).forEach(pair => link.setAttribute(...pair));
        }
        link.href = href;
        document.head.appendChild(link);
        return new Promise(resolve => {
            link.addEventListener("load", resolve);
            link.addEventListener("error", resolve); // intended
        });
    };

    let currThemeRoot;
    /**
     * Returns the current theme root.
     *
     * @public
     * @since 1.14.0
     * @returns { string } the current theme root
     */
    const getThemeRoot = () => {
        if (currThemeRoot === undefined) {
            currThemeRoot = getThemeRoot$1();
        }
        return currThemeRoot;
    };
    const formatThemeLink = (theme) => {
        return `${getThemeRoot()}Base/baseLib/${theme}/css_variables.css`; // theme root is always set at this point.
    };
    const attachCustomThemeStylesToHead = async (theme) => {
        const link = document.querySelector(`[sap-ui-webcomponents-theme="${theme}"]`);
        if (link) {
            document.head.removeChild(link);
        }
        await createLinkInHead(formatThemeLink(theme), { "sap-ui-webcomponents-theme": theme });
    };

    const BASE_THEME_PACKAGE = "@ui5/webcomponents-theming";
    const isThemeBaseRegistered = () => {
        const registeredPackages = getRegisteredPackages();
        return registeredPackages.has(BASE_THEME_PACKAGE);
    };
    const loadThemeBase = async (theme) => {
        if (!isThemeBaseRegistered()) {
            return;
        }
        const cssData = await getThemeProperties(BASE_THEME_PACKAGE, theme);
        if (cssData) {
            createOrUpdateStyle(cssData, "data-ui5-theme-properties", BASE_THEME_PACKAGE, theme);
        }
    };
    const deleteThemeBase = () => {
        removeStyle("data-ui5-theme-properties", BASE_THEME_PACKAGE);
    };
    const loadComponentPackages = async (theme, externalThemeName) => {
        const registeredPackages = getRegisteredPackages();
        const packagesStylesPromises = [...registeredPackages].map(async (packageName) => {
            if (packageName === BASE_THEME_PACKAGE) {
                return;
            }
            const cssData = await getThemeProperties(packageName, theme, externalThemeName);
            if (cssData) {
                createOrUpdateStyle(cssData, `data-ui5-component-properties-${getCurrentRuntimeIndex()}`, packageName);
            }
        });
        return Promise.all(packagesStylesPromises);
    };
    const detectExternalTheme = async (theme) => {
        // If theme designer theme is detected, use this
        const extTheme = getThemeDesignerTheme();
        if (extTheme) {
            return extTheme;
        }
        // If OpenUI5Support is enabled, try to find out if it loaded variables
        const openUI5Support = getFeature("OpenUI5Support");
        if (openUI5Support && openUI5Support.isOpenUI5Detected()) {
            const varsLoaded = openUI5Support.cssVariablesLoaded();
            if (varsLoaded) {
                return {
                    themeName: openUI5Support.getConfigurationSettingsObject()?.theme,
                    baseThemeName: "", // baseThemeName is only relevant for custom themes
                };
            }
        }
        else if (getThemeRoot()) {
            await attachCustomThemeStylesToHead(theme);
            return getThemeDesignerTheme();
        }
    };
    const applyTheme = async (theme) => {
        const extTheme = await detectExternalTheme(theme);
        // Only load theme_base properties if there is no externally loaded theme, or there is, but it is not being loaded
        if (!extTheme || theme !== extTheme.themeName) {
            await loadThemeBase(theme);
        }
        else {
            deleteThemeBase();
        }
        // Always load component packages properties. For non-registered themes, try with the base theme, if any
        const packagesTheme = isThemeRegistered(theme) ? theme : extTheme && extTheme.baseThemeName;
        await loadComponentPackages(packagesTheme || DEFAULT_THEME, extTheme && extTheme.themeName === theme ? theme : undefined);
        fireThemeLoaded(theme);
    };

    let curTheme;
    /**
     * Returns the current theme.
     * @public
     * @returns {string} the current theme name
     */
    const getTheme = () => {
        if (curTheme === undefined) {
            curTheme = getTheme$1();
        }
        return curTheme;
    };
    /**
     * Returns if the currently set theme is part of legacy theme families ("sap_fiori_3").
     * **Note**: in addition, the method checks the base theme of a custom theme, built via the ThemeDesigner.
     *
     * @private
     * @returns { boolean }
     */
    const isLegacyThemeFamily = () => {
        const currentTheme = getTheme();
        if (!isKnownTheme(currentTheme)) {
            return !getThemeDesignerTheme()?.baseThemeName?.startsWith("sap_horizon");
        }
        return !currentTheme.startsWith("sap_horizon");
    };
    const isKnownTheme = (theme) => SUPPORTED_THEMES.includes(theme);

    let booted = false;
    let bootPromise;
    const eventProvider$1 = new EventProvider();
    const boot = async () => {
        if (bootPromise !== undefined) {
            return bootPromise;
        }
        const bootExecutor = async (resolve) => {
            registerCurrentRuntime();
            if (typeof document === "undefined") {
                resolve();
                return;
            }
            attachThemeRegistered(onThemeRegistered);
            const openUI5Support = getFeature("OpenUI5Support");
            const isOpenUI5Loaded = openUI5Support ? openUI5Support.isOpenUI5Detected() : false;
            const f6Navigation = getFeature("F6Navigation");
            if (openUI5Support) {
                await openUI5Support.init();
            }
            if (f6Navigation && !isOpenUI5Loaded) {
                f6Navigation.init();
            }
            await whenDOMReady();
            await applyTheme(getTheme());
            openUI5Support && openUI5Support.attachListeners();
            insertFontFace();
            insertSystemCSSVars();
            resolve();
            booted = true;
            await eventProvider$1.fireEventAsync("boot");
        };
        bootPromise = new Promise(bootExecutor);
        return bootPromise;
    };
    /**
     * Callback, executed after theme properties registration
     * to apply the newly registered theme.
     * @private
     * @param { string } theme
     */
    const onThemeRegistered = (theme) => {
        if (booted && theme === getTheme()) { // getTheme should only be called if "booted" is true
            applyTheme(getTheme());
        }
    };

    const kebabToCamelMap = new Map();
    const camelToKebabMap = new Map();
    const kebabToPascalMap = new Map();
    const kebabToCamelCase = (string) => {
        if (!kebabToCamelMap.has(string)) {
            const result = toCamelCase(string.split("-"));
            kebabToCamelMap.set(string, result);
        }
        return kebabToCamelMap.get(string);
    };
    const camelToKebabCase = (string) => {
        if (!camelToKebabMap.has(string)) {
            const result = string.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
            camelToKebabMap.set(string, result);
        }
        return camelToKebabMap.get(string);
    };
    const toCamelCase = (parts) => {
        return parts.map((string, index) => {
            return index === 0 ? string.toLowerCase() : string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        }).join("");
    };
    const kebabToPascalCase = (src) => {
        const cachedName = kebabToPascalMap.get(src);
        if (cachedName) {
            return cachedName;
        }
        const camelStr = kebabToCamelCase(src);
        const result = camelStr.charAt(0).toUpperCase() + camelStr.slice(1);
        kebabToPascalMap.set(src, result);
        return result;
    };

    /**
     * Determines the slot to which a node should be assigned
     * @param node Text node or HTML element
     * @returns {string}
     */
    const getSlotName = (node) => {
        // Text nodes can only go to the default slot
        if (!(node instanceof HTMLElement)) {
            return "default";
        }
        // Discover the slot based on the real slot name (f.e. footer => footer, or content-32 => content)
        const slot = node.getAttribute("slot");
        if (slot) {
            const match = slot.match(/^(.+?)-\d+$/);
            return match ? match[1] : slot;
        }
        // Use default slot as a fallback
        return "default";
    };
    const getSlottedNodes = (node) => {
        if (node instanceof HTMLSlotElement) {
            return node.assignedNodes({ flatten: true }).filter(item => item instanceof HTMLElement);
        }
        return [node];
    };
    const getSlottedNodesList = (nodeList) => {
        return nodeList.reduce((acc, curr) => acc.concat(getSlottedNodes(curr)), []);
    };

    let suf;
    let rulesObj = {
        include: [/^ui5-/],
        exclude: [],
    };
    const tagsCache = new Map(); // true/false means the tag should/should not be cached, undefined means not known yet.
    /**
     * Returns the currently set scoping suffix, or undefined if not set.
     *
     * @public
     * @returns {String|undefined}
     */
    const getCustomElementsScopingSuffix = () => {
        return suf;
    };
    /**
     * Determines whether custom elements with the given tag should be scoped or not.
     * The tag is first matched against the "include" rules and then against the "exclude" rules and the
     * result is cached until new rules are set.
     *
     * @public
     * @param tag
     */
    const shouldScopeCustomElement = (tag) => {
        if (!tagsCache.has(tag)) {
            const result = rulesObj.include.some(rule => tag.match(rule)) && !rulesObj.exclude.some(rule => tag.match(rule));
            tagsCache.set(tag, result);
        }
        return tagsCache.get(tag);
    };
    /**
     * Returns the currently set scoping suffix, if any and if the tag should be scoped, or undefined otherwise.
     *
     * @public
     * @param tag
     * @returns {String}
     */
    const getEffectiveScopingSuffixForTag = (tag) => {
        if (shouldScopeCustomElement(tag)) {
            return getCustomElementsScopingSuffix();
        }
    };

    /**
     * @class
     * @public
     */
    class UI5ElementMetadata {
        constructor(metadata) {
            this.metadata = metadata;
        }
        getInitialState() {
            if (Object.prototype.hasOwnProperty.call(this, "_initialState")) {
                return this._initialState;
            }
            const initialState = {};
            const slotsAreManaged = this.slotsAreManaged();
            // Initialize slots
            if (slotsAreManaged) {
                const slots = this.getSlots();
                for (const [slotName, slotData] of Object.entries(slots)) { // eslint-disable-line
                    const propertyName = slotData.propertyName || slotName;
                    initialState[propertyName] = [];
                    initialState[kebabToCamelCase(propertyName)] = initialState[propertyName];
                }
            }
            this._initialState = initialState;
            return initialState;
        }
        /**
         * Validates the slot's value and returns it if correct
         * or throws an exception if not.
         * **Note:** Only intended for use by UI5Element.js
         * @public
         */
        static validateSlotValue(value, slotData) {
            return validateSingleSlot(value, slotData);
        }
        /**
         * Returns the tag of the UI5 Element without the scope
         * @public
         */
        getPureTag() {
            return this.metadata.tag || "";
        }
        /**
         * Returns the tag of the UI5 Element without the scope
         * @private
         */
        getFeatures() {
            return this.metadata.features || [];
        }
        /**
         * Returns the tag of the UI5 Element
         * @public
         */
        getTag() {
            const pureTag = this.metadata.tag;
            if (!pureTag) {
                return "";
            }
            const suffix = getEffectiveScopingSuffixForTag(pureTag);
            if (!suffix) {
                return pureTag;
            }
            return `${pureTag}-${suffix}`;
        }
        /**
         * Determines whether a property should have an attribute counterpart
         * @public
         * @param propName
         */
        hasAttribute(propName) {
            const propData = this.getProperties()[propName];
            return propData.type !== Object && propData.type !== Array && !propData.noAttribute;
        }
        /**
         * Returns an array with the properties of the UI5 Element (in camelCase)
         * @public
         */
        getPropertiesList() {
            return Object.keys(this.getProperties());
        }
        /**
         * Returns an array with the attributes of the UI5 Element (in kebab-case)
         * @public
         */
        getAttributesList() {
            return this.getPropertiesList().filter(this.hasAttribute.bind(this)).map(camelToKebabCase);
        }
        /**
         * Determines whether this UI5 Element has a default slot of type Node, therefore can slot text
         */
        canSlotText() {
            return (this.getSlots().default)?.type === Node;
        }
        /**
         * Determines whether this UI5 Element supports any slots
         * @public
         */
        hasSlots() {
            return !!Object.entries(this.getSlots()).length;
        }
        /**
         * Determines whether this UI5 Element supports any slots with "individualSlots: true"
         * @public
         */
        hasIndividualSlots() {
            return this.slotsAreManaged() && Object.values(this.getSlots()).some(slotData => slotData.individualSlots);
        }
        /**
         * Determines whether this UI5 Element needs to invalidate if children are added/removed/changed
         * @public
         */
        slotsAreManaged() {
            return !!this.metadata.managedSlots;
        }
        /**
         * Determines whether this control supports F6 fast navigation
         * @public
         */
        supportsF6FastNavigation() {
            return !!this.metadata.fastNavigation;
        }
        /**
         * Returns an object with key-value pairs of properties and their metadata definitions
         * @public
         */
        getProperties() {
            if (!this.metadata.properties) {
                this.metadata.properties = {};
            }
            return this.metadata.properties;
        }
        /**
         * Returns an object with key-value pairs of events and their metadata definitions
         * @public
         */
        getEvents() {
            if (!this.metadata.events) {
                this.metadata.events = {};
            }
            return this.metadata.events;
        }
        /**
         * Returns an object with key-value pairs of slots and their metadata definitions
         * @public
         */
        getSlots() {
            if (!this.metadata.slots) {
                this.metadata.slots = {};
            }
            return this.metadata.slots;
        }
        /**
         * Determines whether this UI5 Element has any translatable texts (needs to be invalidated upon language change)
         */
        isLanguageAware() {
            return !!this.metadata.languageAware;
        }
        /**
         * Determines whether this UI5 Element has any theme dependant carachteristics.
         */
        isThemeAware() {
            return !!this.metadata.themeAware;
        }
        getShadowRootOptions() {
            return this.metadata.shadowRootOptions || {};
        }
        /**
         * Determines whether this UI5 Element has any theme dependant carachteristics.
         */
        isFormAssociated() {
            return !!this.metadata.formAssociated;
        }
        /**
         * Matches a changed entity (property/slot) with the given name against the "invalidateOnChildChange" configuration
         * and determines whether this should cause and invalidation
         *
         * @param slotName the name of the slot in which a child was changed
         * @param type the type of change in the child: "property" or "slot"
         * @param name the name of the property/slot that changed
         */
        shouldInvalidateOnChildChange(slotName, type, name) {
            const config = this.getSlots()[slotName].invalidateOnChildChange;
            // invalidateOnChildChange was not set in the slot metadata - by default child changes do not affect the component
            if (config === undefined) {
                return false;
            }
            // The simple format was used: invalidateOnChildChange: true/false;
            if (typeof config === "boolean") {
                return config;
            }
            // The complex format was used: invalidateOnChildChange: { properties, slots }
            if (typeof config === "object") {
                // A property was changed
                if (type === "property") {
                    // The config object does not have a properties field
                    if (config.properties === undefined) {
                        return false;
                    }
                    // The config object has the short format: properties: true/false
                    if (typeof config.properties === "boolean") {
                        return config.properties;
                    }
                    // The config object has the complex format: properties: [...]
                    if (Array.isArray(config.properties)) {
                        return config.properties.includes(name);
                    }
                    throw new Error("Wrong format for invalidateOnChildChange.properties: boolean or array is expected");
                }
                // A slot was changed
                if (type === "slot") {
                    // The config object does not have a slots field
                    if (config.slots === undefined) {
                        return false;
                    }
                    // The config object has the short format: slots: true/false
                    if (typeof config.slots === "boolean") {
                        return config.slots;
                    }
                    // The config object has the complex format: slots: [...]
                    if (Array.isArray(config.slots)) {
                        return config.slots.includes(name);
                    }
                    throw new Error("Wrong format for invalidateOnChildChange.slots: boolean or array is expected");
                }
            }
            throw new Error("Wrong format for invalidateOnChildChange: boolean or object is expected");
        }
    }
    const validateSingleSlot = (value, slotData) => {
        value && getSlottedNodes(value).forEach(el => {
            if (!(el instanceof slotData.type)) {
                throw new Error(`The element is not of type ${slotData.type.toString()}`);
            }
        });
        return value;
    };

    const getEventProvider = () => getSharedResource("CustomStyle.eventProvider", new EventProvider());
    const CUSTOM_CSS_CHANGE = "CustomCSSChange";
    const attachCustomCSSChange = (listener) => {
        getEventProvider().attachEvent(CUSTOM_CSS_CHANGE, listener);
    };
    const getCustomCSSFor = () => getSharedResource("CustomStyle.customCSSFor", {});
    attachCustomCSSChange((tag) => {
        {
            reRenderAllUI5Elements({ tag });
        }
    });
    const getCustomCSS = (tag) => {
        const customCSSFor = getCustomCSSFor();
        return customCSSFor[tag] ? customCSSFor[tag].join("") : "";
    };

    const MAX_DEPTH_INHERITED_CLASSES = 10; // TypeScript complains about Infinity and big numbers
    const getStylesString = (styles) => {
        if (Array.isArray(styles)) {
            return styles.filter(style => !!style).flat(MAX_DEPTH_INHERITED_CLASSES).map((style) => {
                return typeof style === "string" ? style : style.content;
            }).join(" ");
        }
        return typeof styles === "string" ? styles : styles.content;
    };

    const effectiveStyleMap = new Map();
    attachCustomCSSChange((tag) => {
        effectiveStyleMap.delete(`${tag}_normal`); // there is custom CSS only for the component itself, not for its static area part
    });
    const getEffectiveStyle = (ElementClass) => {
        const tag = ElementClass.getMetadata().getTag();
        const key = `${tag}_normal`;
        const openUI5Enablement = getFeature("OpenUI5Enablement");
        if (!effectiveStyleMap.has(key)) {
            let busyIndicatorStyles = "";
            if (openUI5Enablement) {
                busyIndicatorStyles = getStylesString(openUI5Enablement.getBusyIndicatorStyles());
            }
            const customStyle = getCustomCSS(tag) || "";
            const builtInStyles = getStylesString(ElementClass.styles);
            const effectiveStyle = `${builtInStyles} ${customStyle} ${busyIndicatorStyles}`;
            effectiveStyleMap.set(key, effectiveStyle);
        }
        return effectiveStyleMap.get(key); // The key is guaranteed to exist
    };

    const constructableStyleMap = new Map();
    attachCustomCSSChange((tag) => {
        constructableStyleMap.delete(`${tag}_normal`); // there is custom CSS only for the component itself, not for its static area part
    });
    /**
     * Returns (and caches) a constructable style sheet for a web component class
     * Note: Chrome
     * @param ElementClass
     * @returns {*}
     */
    const getConstructableStyle = (ElementClass) => {
        const tag = ElementClass.getMetadata().getTag();
        const key = `${tag}_normal`;
        if (!constructableStyleMap.has(key)) {
            const styleContent = getEffectiveStyle(ElementClass);
            const style = new CSSStyleSheet();
            style.replaceSync(styleContent);
            constructableStyleMap.set(key, [style]);
        }
        return constructableStyleMap.get(key);
    };

    /**
     * Updates the shadow root of a UI5Element or its static area item
     * @param element
     */
    const updateShadowRoot = (element) => {
        const ctor = element.constructor;
        const shadowRoot = element.shadowRoot;
        const renderResult = element.render(); // this is checked before calling updateShadowRoot
        if (!shadowRoot) {
            console.warn(`There is no shadow root to update`); // eslint-disable-line
            return;
        }
        shadowRoot.adoptedStyleSheets = getConstructableStyle(ctor);
        ctor.renderer(renderResult, shadowRoot, { host: element });
    };

    /**
     * The tag prefixes to be ignored.
     */
    const tagPrefixes = [];
    /**
     * Determines whether custom elements with the given tag should be ignored.
     *
     * @private
     * @param { string } tag
     */
    const shouldIgnoreCustomElement = (tag) => {
        return tagPrefixes.some(pref => tag.startsWith(pref));
    };

    const observers = new WeakMap();
    /**
     * @param node
     * @param callback
     * @param options
     */
    const observeDOMNode = (node, callback, options) => {
        const observer = new MutationObserver(callback);
        observers.set(node, observer);
        observer.observe(node, options);
    };
    /**
     * @param node
     */
    const unobserveDOMNode = (node) => {
        const observer = observers.get(node);
        if (observer) {
            observer.disconnect();
            observers.delete(node);
        }
    };

    // Fire these events even with noConflict: true
    const excludeList = [
        "value-changed",
        "click",
    ];
    let noConflict;
    const shouldFireOriginalEvent = (eventName) => {
        return excludeList.includes(eventName);
    };
    const shouldNotFireOriginalEvent = (eventName) => {
        const nc = getNoConflict();
        // return !(nc.events && nc.events.includes && nc.events.includes(eventName));
        return !(typeof nc !== "boolean" && nc.events && nc.events.includes && nc.events.includes(eventName));
    };
    /**
     * Returns if the "noConflict" configuration is set.
     * @public
     * @returns { NoConflictData }
     */
    const getNoConflict = () => {
        if (noConflict === undefined) {
            noConflict = getNoConflict$1();
        }
        return noConflict;
    };
    const skipOriginalEvent = (eventName) => {
        const nc = getNoConflict();
        // Always fire these events
        if (shouldFireOriginalEvent(eventName)) {
            return false;
        }
        // Read from the configuration
        if (nc === true) {
            return true;
        }
        return !shouldNotFireOriginalEvent(eventName);
    };

    const getEffectiveDir = (element) => {
        if (element.matches(":dir(rtl)")) {
            return "rtl";
        }
        return "ltr";
    };

    // Note: disabled is present in IE so we explicitly allow it here.
    // Others, such as title/hidden, we explicitly override, so valid too
    const allowList = [
        "disabled",
        "title",
        "hidden",
        "role",
        "draggable",
    ];
    /**
     * Checks whether a property name is valid (does not collide with existing DOM API properties)
     *
     * @param name
     * @returns {boolean}
     */
    const isValidPropertyName = (name) => {
        if (allowList.includes(name) || name.startsWith("aria")) {
            return true;
        }
        const classes = [
            HTMLElement,
            Element,
            Node,
        ];
        return !classes.some(klass => klass.prototype.hasOwnProperty(name)); // eslint-disable-line
    };

    const arraysAreEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    };

    /**
     * Runs a component's template with the component's current state, while also scoping HTML
     *
     * @param template - the template to execute
     * @param component - the component
     * @public
     */
    const executeTemplate = (template, component) => {
        const tagsToScope = getTagsToScope(component);
        const scope = getCustomElementsScopingSuffix();
        return template.call(component, component, tagsToScope, scope);
    };
    /**
     * Returns all tags, used inside component's template subject to scoping.
     * @param component - the component
     * @returns {Array[]}
     * @private
     */
    const getTagsToScope = (component) => {
        const ctor = component.constructor;
        const componentTag = ctor.getMetadata().getPureTag();
        const tagsToScope = ctor.getUniqueDependencies().map((dep) => dep.getMetadata().getPureTag()).filter(shouldScopeCustomElement);
        if (shouldScopeCustomElement(componentTag)) {
            tagsToScope.push(componentTag);
        }
        return tagsToScope;
    };

    const attachFormElementInternals = (element) => {
        element._internals = element.attachInternals();
        if (isInputElement(element)) {
            setFormValue(element);
        }
    };
    const setFormValue = (element) => {
        if (!element._internals?.form) {
            return;
        }
        setFormValidity(element);
        if (!element.name) {
            element._internals?.setFormValue(null);
            return;
        }
        element._internals.setFormValue(element.formFormattedValue);
    };
    const setFormValidity = async (element) => {
        if (!element._internals?.form) {
            return;
        }
        if (element.formValidity && Object.keys(element.formValidity).some(key => key)) {
            const focusRef = await element.formElementAnchor?.();
            element._internals.setValidity(element.formValidity, element.formValidityMessage, focusRef);
        }
        else {
            element._internals.setValidity({});
        }
    };
    const submitForm = (element) => {
        element._internals?.form?.requestSubmit();
    };
    const resetForm = (element) => {
        element._internals?.form?.reset();
    };
    const isInputElement = (element) => {
        return "formFormattedValue" in element && "name" in element;
    };

    let autoId = 0;
    const elementTimeouts = new Map();
    const uniqueDependenciesCache = new Map();
    const defaultConverter = {
      fromAttribute(value, type) {
        if (type === Boolean) {
          return value !== null;
        }
        if (type === Number) {
          return value === null ? undefined : parseFloat(value);
        }
        return value;
      },
      toAttribute(value, type) {
        if (type === Boolean) {
          return value ? "" : null;
        }
        if (type === Object || type === Array) {
          return null;
        }
        if (value === null || value === undefined) {
          return null;
        }
        return String(value);
      }
    };
    function _invalidate(changeInfo) {
      if (this._suppressInvalidation) {
        return;
      }
      this.onInvalidation(changeInfo);
      this._changedState.push(changeInfo);
      renderDeferred(this);
      this._invalidationEventProvider.fireEvent("invalidate", {
        ...changeInfo,
        target: this
      });
    }
    function getPropertyDescriptor(proto, name) {
      do {
        const descriptor = Object.getOwnPropertyDescriptor(proto, name);
        if (descriptor) {
          return descriptor;
        }
        proto = Object.getPrototypeOf(proto);
      } while (proto && proto !== HTMLElement.prototype);
    }
    class UI5Element extends HTMLElement {
      constructor() {
        super();
        this._rendered = false;
        const ctor = this.constructor;
        this._changedState = [];
        this._suppressInvalidation = true;
        this._inDOM = false;
        this._fullyConnected = false;
        this._childChangeListeners = new Map();
        this._slotChangeListeners = new Map();
        this._invalidationEventProvider = new EventProvider();
        this._componentStateFinalizedEventProvider = new EventProvider();
        let deferredResolve;
        this._domRefReadyPromise = new Promise(resolve => {
          deferredResolve = resolve;
        });
        this._domRefReadyPromise._deferredResolve = deferredResolve;
        this._doNotSyncAttributes = new Set();
        this._slotsAssignedNodes = new WeakMap();
        this._state = {
          ...ctor.getMetadata().getInitialState()
        };
        this.initializedProperties = new Map();
        const allProps = this.constructor.getMetadata().getPropertiesList();
        allProps.forEach(propertyName => {
          if (this.hasOwnProperty(propertyName)) {
            const value = this[propertyName];
            this.initializedProperties.set(propertyName, value);
          }
        });
        this._initShadowRoot();
      }
      _initShadowRoot() {
        const ctor = this.constructor;
        if (ctor._needsShadowDOM()) {
          const defaultOptions = {
            mode: "open"
          };
          this.attachShadow({
            ...defaultOptions,
            ...ctor.getMetadata().getShadowRootOptions()
          });
          const slotsAreManaged = ctor.getMetadata().slotsAreManaged();
          if (slotsAreManaged) {
            this.shadowRoot.addEventListener("slotchange", this._onShadowRootSlotChange.bind(this));
          }
        }
      }
      _onShadowRootSlotChange(e) {
        const targetShadowRoot = e.target?.getRootNode();
        if (targetShadowRoot === this.shadowRoot) {
          this._processChildren();
        }
      }
      get _id() {
        if (!this.__id) {
          this.__id = `ui5wc_${++autoId}`;
        }
        return this.__id;
      }
      render() {
        const template = this.constructor.template;
        return executeTemplate(template, this);
      }
      async connectedCallback() {
        {
          const rootNode = this.getRootNode();
          if (rootNode instanceof ShadowRoot && instanceOfUI5Element(rootNode.host)) {
            const klass = rootNode.host.constructor;
            const hasDependency = getTagsToScope(rootNode.host).includes(this.constructor.getMetadata().getPureTag());
            if (!hasDependency) {
              console.error(`[UI5-FWK] ${this.constructor.getMetadata().getTag()} not found in dependencies of ${klass.getMetadata().getTag()}`);
            }
          }
        }
        {
          const props = this.constructor.getMetadata().getProperties();
          for (const [prop, propData] of Object.entries(props)) {
            if (Object.hasOwn(this, prop) && !this.initializedProperties.has(prop)) {
              console.error(`[UI5-FWK] ${this.constructor.getMetadata().getTag()} has a property [${prop}] that is shadowed by the instance. Updates to this property will not invalidate the component. Possible reason is TS target ES2022 or TS useDefineForClassFields`);
            }
          }
        }
        const ctor = this.constructor;
        this.setAttribute(ctor.getMetadata().getPureTag(), "");
        if (ctor.getMetadata().supportsF6FastNavigation()) {
          this.setAttribute("data-sap-ui-fastnavgroup", "true");
        }
        const slotsAreManaged = ctor.getMetadata().slotsAreManaged();
        this._inDOM = true;
        if (slotsAreManaged) {
          this._startObservingDOMChildren();
          await this._processChildren();
        }
        if (!this._inDOM) {
          return;
        }
        renderImmediately(this);
        this._domRefReadyPromise._deferredResolve();
        this._fullyConnected = true;
        this.onEnterDOM();
      }
      disconnectedCallback() {
        const ctor = this.constructor;
        const slotsAreManaged = ctor.getMetadata().slotsAreManaged();
        this._inDOM = false;
        if (slotsAreManaged) {
          this._stopObservingDOMChildren();
        }
        if (this._fullyConnected) {
          this.onExitDOM();
          this._fullyConnected = false;
        }
        this._domRefReadyPromise._deferredResolve();
        cancelRender(this);
      }
      onBeforeRendering() {}
      onAfterRendering() {}
      onEnterDOM() {}
      onExitDOM() {}
      _startObservingDOMChildren() {
        const ctor = this.constructor;
        const metadata = ctor.getMetadata();
        const shouldObserveChildren = metadata.hasSlots();
        if (!shouldObserveChildren) {
          return;
        }
        const canSlotText = metadata.canSlotText();
        const mutationObserverOptions = {
          childList: true,
          subtree: canSlotText,
          characterData: canSlotText
        };
        observeDOMNode(this, this._processChildren.bind(this), mutationObserverOptions);
      }
      _stopObservingDOMChildren() {
        unobserveDOMNode(this);
      }
      async _processChildren() {
        const hasSlots = this.constructor.getMetadata().hasSlots();
        if (hasSlots) {
          await this._updateSlots();
        }
      }
      async _updateSlots() {
        const ctor = this.constructor;
        const slotsMap = ctor.getMetadata().getSlots();
        const canSlotText = ctor.getMetadata().canSlotText();
        const domChildren = Array.from(canSlotText ? this.childNodes : this.children);
        const slotsCachedContentMap = new Map();
        const propertyNameToSlotMap = new Map();
        for (const [slotName, slotData] of Object.entries(slotsMap)) {
          const propertyName = slotData.propertyName || slotName;
          propertyNameToSlotMap.set(propertyName, slotName);
          slotsCachedContentMap.set(propertyName, [...this._state[propertyName]]);
          this._clearSlot(slotName, slotData);
        }
        const autoIncrementMap = new Map();
        const slottedChildrenMap = new Map();
        const allChildrenUpgraded = domChildren.map(async (child, idx) => {
          const slotName = getSlotName(child);
          const slotData = slotsMap[slotName];
          if (slotData === undefined) {
            if (slotName !== "default") {
              const validValues = Object.keys(slotsMap).join(", ");
              console.warn(`Unknown slotName: ${slotName}, ignoring`, child, `Valid values are: ${validValues}`);
            }
            return;
          }
          if (slotData.individualSlots) {
            const nextIndex = (autoIncrementMap.get(slotName) || 0) + 1;
            autoIncrementMap.set(slotName, nextIndex);
            child._individualSlot = `${slotName}-${nextIndex}`;
          }
          if (child instanceof HTMLElement) {
            const localName = child.localName;
            const shouldWaitForCustomElement = localName.includes("-") && !shouldIgnoreCustomElement(localName);
            if (shouldWaitForCustomElement) {
              const isDefined = customElements.get(localName);
              if (!isDefined) {
                const whenDefinedPromise = customElements.whenDefined(localName);
                let timeoutPromise = elementTimeouts.get(localName);
                if (!timeoutPromise) {
                  timeoutPromise = new Promise(resolve => setTimeout(resolve, 1000));
                  elementTimeouts.set(localName, timeoutPromise);
                }
                await Promise.race([whenDefinedPromise, timeoutPromise]);
              }
              customElements.upgrade(child);
            }
          }
          child = ctor.getMetadata().constructor.validateSlotValue(child, slotData);
          if (instanceOfUI5Element(child) && slotData.invalidateOnChildChange) {
            const childChangeListener = this._getChildChangeListener(slotName);
            child.attachInvalidate.call(child, childChangeListener);
          }
          if (child instanceof HTMLSlotElement) {
            this._attachSlotChange(child, slotName, !!slotData.invalidateOnChildChange);
          }
          const propertyName = slotData.propertyName || slotName;
          if (slottedChildrenMap.has(propertyName)) {
            slottedChildrenMap.get(propertyName).push({
              child,
              idx
            });
          } else {
            slottedChildrenMap.set(propertyName, [{
              child,
              idx
            }]);
          }
        });
        await Promise.all(allChildrenUpgraded);
        slottedChildrenMap.forEach((children, propertyName) => {
          this._state[propertyName] = children.sort((a, b) => a.idx - b.idx).map(_ => _.child);
          this._state[kebabToCamelCase(propertyName)] = this._state[propertyName];
        });
        let invalidated = false;
        for (const [slotName, slotData] of Object.entries(slotsMap)) {
          const propertyName = slotData.propertyName || slotName;
          if (!arraysAreEqual(slotsCachedContentMap.get(propertyName), this._state[propertyName])) {
            _invalidate.call(this, {
              type: "slot",
              name: propertyNameToSlotMap.get(propertyName),
              reason: "children"
            });
            invalidated = true;
            if (ctor.getMetadata().isFormAssociated()) {
              setFormValue(this);
            }
          }
        }
        if (!invalidated) {
          _invalidate.call(this, {
            type: "slot",
            name: "default",
            reason: "textcontent"
          });
        }
      }
      _clearSlot(slotName, slotData) {
        const propertyName = slotData.propertyName || slotName;
        const children = this._state[propertyName];
        children.forEach(child => {
          if (instanceOfUI5Element(child)) {
            const childChangeListener = this._getChildChangeListener(slotName);
            child.detachInvalidate.call(child, childChangeListener);
          }
          if (child instanceof HTMLSlotElement) {
            this._detachSlotChange(child, slotName);
          }
        });
        this._state[propertyName] = [];
        this._state[kebabToCamelCase(propertyName)] = this._state[propertyName];
      }
      attachInvalidate(callback) {
        this._invalidationEventProvider.attachEvent("invalidate", callback);
      }
      detachInvalidate(callback) {
        this._invalidationEventProvider.detachEvent("invalidate", callback);
      }
      _onChildChange(slotName, childChangeInfo) {
        if (!this.constructor.getMetadata().shouldInvalidateOnChildChange(slotName, childChangeInfo.type, childChangeInfo.name)) {
          return;
        }
        _invalidate.call(this, {
          type: "slot",
          name: slotName,
          reason: "childchange",
          child: childChangeInfo.target
        });
      }
      attributeChangedCallback(name, oldValue, newValue) {
        let newPropertyValue;
        if (this._doNotSyncAttributes.has(name)) {
          return;
        }
        const properties = this.constructor.getMetadata().getProperties();
        const realName = name.replace(/^ui5-/, "");
        const nameInCamelCase = kebabToCamelCase(realName);
        if (properties.hasOwnProperty(nameInCamelCase)) {
          const propData = properties[nameInCamelCase];
          const converter = propData.converter ?? defaultConverter;
          newPropertyValue = converter.fromAttribute(newValue, propData.type);
          this[nameInCamelCase] = newPropertyValue;
        }
      }
      formAssociatedCallback() {
        const ctor = this.constructor;
        if (!ctor.getMetadata().isFormAssociated()) {
          return;
        }
        attachFormElementInternals(this);
      }
      static get formAssociated() {
        return this.getMetadata().isFormAssociated();
      }
      _updateAttribute(name, newValue) {
        const ctor = this.constructor;
        if (!ctor.getMetadata().hasAttribute(name)) {
          return;
        }
        const properties = ctor.getMetadata().getProperties();
        const propData = properties[name];
        const attrName = camelToKebabCase(name);
        const converter = propData.converter || defaultConverter;
        {
          const tag = this.constructor.getMetadata().getTag();
          if (typeof newValue === "boolean" && propData.type !== Boolean) {
            console.error(`[UI5-FWK] boolean value for property [${name}] of component [${tag}] is missing "{ type: Boolean }" in its property decorator. Attribute conversion will treat it as a string. If this is intended, pass the value converted to string, otherwise add the type to the property decorator`);
          }
          if (typeof newValue === "number" && propData.type !== Number) {
            console.error(`[UI5-FWK] numeric value for property [${name}] of component [${tag}] is missing "{ type: Number }" in its property decorator. Attribute conversion will treat it as a string. If this is intended, pass the value converted to string, otherwise add the type to the property decorator`);
          }
        }
        const newAttrValue = converter.toAttribute(newValue, propData.type);
        if (newAttrValue === null || newAttrValue === undefined) {
          this._doNotSyncAttributes.add(attrName);
          this.removeAttribute(attrName);
          this._doNotSyncAttributes.delete(attrName);
        } else {
          this.setAttribute(attrName, newAttrValue);
        }
      }
      _getChildChangeListener(slotName) {
        if (!this._childChangeListeners.has(slotName)) {
          this._childChangeListeners.set(slotName, this._onChildChange.bind(this, slotName));
        }
        return this._childChangeListeners.get(slotName);
      }
      _getSlotChangeListener(slotName) {
        if (!this._slotChangeListeners.has(slotName)) {
          this._slotChangeListeners.set(slotName, this._onSlotChange.bind(this, slotName));
        }
        return this._slotChangeListeners.get(slotName);
      }
      _attachSlotChange(slot, slotName, invalidateOnChildChange) {
        const slotChangeListener = this._getSlotChangeListener(slotName);
        slot.addEventListener("slotchange", e => {
          slotChangeListener.call(slot, e);
          if (invalidateOnChildChange) {
            const previousChildren = this._slotsAssignedNodes.get(slot);
            if (previousChildren) {
              previousChildren.forEach(child => {
                if (instanceOfUI5Element(child)) {
                  const childChangeListener = this._getChildChangeListener(slotName);
                  child.detachInvalidate.call(child, childChangeListener);
                }
              });
            }
            const newChildren = getSlottedNodesList([slot]);
            this._slotsAssignedNodes.set(slot, newChildren);
            newChildren.forEach(child => {
              if (instanceOfUI5Element(child)) {
                const childChangeListener = this._getChildChangeListener(slotName);
                child.attachInvalidate.call(child, childChangeListener);
              }
            });
          }
        });
      }
      _detachSlotChange(child, slotName) {
        child.removeEventListener("slotchange", this._getSlotChangeListener(slotName));
      }
      _onSlotChange(slotName) {
        _invalidate.call(this, {
          type: "slot",
          name: slotName,
          reason: "slotchange"
        });
      }
      onInvalidation(changeInfo) {}
      updateAttributes() {
        const ctor = this.constructor;
        const props = ctor.getMetadata().getProperties();
        for (const [prop, propData] of Object.entries(props)) {
          this._updateAttribute(prop, this[prop]);
        }
      }
      _render() {
        const ctor = this.constructor;
        const hasIndividualSlots = ctor.getMetadata().hasIndividualSlots();
        if (this.initializedProperties.size > 0) {
          Array.from(this.initializedProperties.entries()).forEach(([prop, value]) => {
            delete this[prop];
            this[prop] = value;
          });
          this.initializedProperties.clear();
        }
        this._suppressInvalidation = true;
        this.onBeforeRendering();
        if (!this._rendered) {
          this.updateAttributes();
        }
        this._componentStateFinalizedEventProvider.fireEvent("componentStateFinalized");
        this._suppressInvalidation = false;
        this._changedState = [];
        if (ctor._needsShadowDOM()) {
          updateShadowRoot(this);
        }
        this._rendered = true;
        if (hasIndividualSlots) {
          this._assignIndividualSlotsToChildren();
        }
        this.onAfterRendering();
      }
      _assignIndividualSlotsToChildren() {
        const domChildren = Array.from(this.children);
        domChildren.forEach(child => {
          if (child._individualSlot) {
            child.setAttribute("slot", child._individualSlot);
          }
        });
      }
      _waitForDomRef() {
        return this._domRefReadyPromise;
      }
      getDomRef() {
        if (typeof this._getRealDomRef === "function") {
          return this._getRealDomRef();
        }
        if (!this.shadowRoot || this.shadowRoot.children.length === 0) {
          return;
        }
        return this.shadowRoot.children[0];
      }
      getFocusDomRef() {
        const domRef = this.getDomRef();
        if (domRef) {
          const focusRef = domRef.querySelector("[data-sap-focus-ref]");
          return focusRef || domRef;
        }
      }
      async getFocusDomRefAsync() {
        await this._waitForDomRef();
        return this.getFocusDomRef();
      }
      async focus(focusOptions) {
        await this._waitForDomRef();
        const focusDomRef = this.getFocusDomRef();
        if (focusDomRef === this) {
          HTMLElement.prototype.focus.call(this, focusOptions);
        } else if (focusDomRef && typeof focusDomRef.focus === "function") {
          focusDomRef.focus(focusOptions);
        }
      }
      fireEvent(name, data, cancelable = false, bubbles = true) {
        const eventResult = this._fireEvent(name, data, cancelable, bubbles);
        const pascalCaseEventName = kebabToPascalCase(name);
        if (pascalCaseEventName !== name) {
          return eventResult && this._fireEvent(pascalCaseEventName, data, cancelable, bubbles);
        }
        return eventResult;
      }
      _fireEvent(name, data, cancelable = false, bubbles = true) {
        const noConflictEvent = new CustomEvent(`ui5-${name}`, {
          detail: data,
          composed: false,
          bubbles,
          cancelable
        });
        const noConflictEventResult = this.dispatchEvent(noConflictEvent);
        if (skipOriginalEvent(name)) {
          return noConflictEventResult;
        }
        const normalEvent = new CustomEvent(name, {
          detail: data,
          composed: false,
          bubbles,
          cancelable
        });
        const normalEventResult = this.dispatchEvent(normalEvent);
        return normalEventResult && noConflictEventResult;
      }
      getSlottedNodes(slotName) {
        return getSlottedNodesList(this[slotName]);
      }
      attachComponentStateFinalized(callback) {
        this._componentStateFinalizedEventProvider.attachEvent("componentStateFinalized", callback);
      }
      detachComponentStateFinalized(callback) {
        this._componentStateFinalizedEventProvider.detachEvent("componentStateFinalized", callback);
      }
      get effectiveDir() {
        markAsRtlAware(this.constructor);
        return getEffectiveDir(this);
      }
      get isUI5Element() {
        return true;
      }
      get classes() {
        return {};
      }
      get accessibilityInfo() {
        return {};
      }
      static get observedAttributes() {
        return this.getMetadata().getAttributesList();
      }
      static _needsShadowDOM() {
        return !!this.template || Object.prototype.hasOwnProperty.call(this.prototype, "render");
      }
      static _generateAccessors() {
        const proto = this.prototype;
        const slotsAreManaged = this.getMetadata().slotsAreManaged();
        const properties = this.getMetadata().getProperties();
        for (const [prop, propData] of Object.entries(properties)) {
          if (!isValidPropertyName(prop)) {
            console.warn(`"${prop}" is not a valid property name. Use a name that does not collide with DOM APIs`);
          }
          const descriptor = getPropertyDescriptor(proto, prop);
          let origSet;
          if (descriptor?.set) {
            origSet = descriptor.set;
          }
          let origGet;
          if (descriptor?.get) {
            origGet = descriptor.get;
          }
          Object.defineProperty(proto, prop, {
            get() {
              if (origGet) {
                return origGet.call(this);
              }
              return this._state[prop];
            },
            set(value) {
              const ctor = this.constructor;
              const oldState = origGet ? origGet.call(this) : this._state[prop];
              const isDifferent = oldState !== value;
              if (isDifferent) {
                if (origSet) {
                  origSet.call(this, value);
                } else {
                  this._state[prop] = value;
                }
                _invalidate.call(this, {
                  type: "property",
                  name: prop,
                  newValue: value,
                  oldValue: oldState
                });
                if (this._rendered) {
                  this._updateAttribute(prop, value);
                }
                if (ctor.getMetadata().isFormAssociated()) {
                  setFormValue(this);
                }
              }
            }
          });
        }
        if (slotsAreManaged) {
          const slots = this.getMetadata().getSlots();
          for (const [slotName, slotData] of Object.entries(slots)) {
            if (!isValidPropertyName(slotName)) {
              console.warn(`"${slotName}" is not a valid property name. Use a name that does not collide with DOM APIs`);
            }
            const propertyName = slotData.propertyName || slotName;
            const propertyDescriptor = {
              get() {
                if (this._state[propertyName] !== undefined) {
                  return this._state[propertyName];
                }
                return [];
              },
              set() {
                throw new Error("Cannot set slot content directly, use the DOM APIs (appendChild, removeChild, etc...)");
              }
            };
            Object.defineProperty(proto, propertyName, propertyDescriptor);
            if (propertyName !== kebabToCamelCase(propertyName)) {
              Object.defineProperty(proto, kebabToCamelCase(propertyName), propertyDescriptor);
            }
          }
        }
      }
      static get dependencies() {
        return [];
      }
      static cacheUniqueDependencies() {
        const filtered = this.dependencies.filter((dep, index, deps) => deps.indexOf(dep) === index);
        uniqueDependenciesCache.set(this, filtered);
      }
      static getUniqueDependencies() {
        if (!uniqueDependenciesCache.has(this)) {
          this.cacheUniqueDependencies();
        }
        return uniqueDependenciesCache.get(this) || [];
      }
      static whenDependenciesDefined() {
        return Promise.all(this.getUniqueDependencies().map(dep => dep.define()));
      }
      static async onDefine() {
        return Promise.resolve();
      }
      static async define() {
        await boot();
        await Promise.all([this.whenDependenciesDefined(), this.onDefine()]);
        const tag = this.getMetadata().getTag();
        const features = this.getMetadata().getFeatures();
        features.forEach(feature => {
          if (getComponentFeature(feature)) {
            this.cacheUniqueDependencies();
          }
          subscribeForFeatureLoad(feature, this, this.cacheUniqueDependencies.bind(this));
        });
        const definedLocally = isTagRegistered(tag);
        const definedGlobally = customElements.get(tag);
        if (definedGlobally && !definedLocally) {
          recordTagRegistrationFailure(tag);
        } else if (!definedGlobally) {
          this._generateAccessors();
          registerTag(tag);
          customElements.define(tag, this);
        }
        return this;
      }
      static getMetadata() {
        if (this.hasOwnProperty("_metadata")) {
          return this._metadata;
        }
        const metadataObjects = [this.metadata];
        let klass = this;
        while (klass !== UI5Element) {
          klass = Object.getPrototypeOf(klass);
          metadataObjects.unshift(klass.metadata);
        }
        const mergedMetadata = fnMerge({}, ...metadataObjects);
        this._metadata = new UI5ElementMetadata(mergedMetadata);
        return this._metadata;
      }
      get validity() {
        return this._internals?.validity;
      }
      get validationMessage() {
        return this._internals?.validationMessage;
      }
      checkValidity() {
        return this._internals?.checkValidity();
      }
      reportValidity() {
        return this._internals?.reportValidity();
      }
    }
    UI5Element.metadata = {};
    UI5Element.styles = "";
    const instanceOfUI5Element = object => {
      return ("isUI5Element" in object);
    };

    /**
     * Returns a custom element class decorator.
     *
     * @param { string | object } tagNameOrComponentSettings
     * @returns { ClassDecorator }
     */
    const customElement = (tagNameOrComponentSettings = {}) => {
        return (target) => {
            if (!Object.prototype.hasOwnProperty.call(target, "metadata")) {
                target.metadata = {};
            }
            if (typeof tagNameOrComponentSettings === "string") {
                target.metadata.tag = tagNameOrComponentSettings;
                return;
            }
            const { tag, languageAware, themeAware, fastNavigation, formAssociated, shadowRootOptions, features, } = tagNameOrComponentSettings;
            target.metadata.tag = tag;
            if (languageAware) {
                target.metadata.languageAware = languageAware;
            }
            if (features) {
                target.metadata.features = features;
            }
            if (themeAware) {
                target.metadata.themeAware = themeAware;
            }
            if (fastNavigation) {
                target.metadata.fastNavigation = fastNavigation;
            }
            if (formAssociated) {
                target.metadata.formAssociated = formAssociated;
            }
            if (shadowRootOptions) {
                target.metadata.shadowRootOptions = shadowRootOptions;
            }
            ["renderer", "template", "styles", "dependencies"].forEach((customElementEntity) => {
                const customElementEntityValue = tagNameOrComponentSettings[customElementEntity];
                customElementEntityValue && Object.defineProperty(target, customElementEntity, {
                    get: () => tagNameOrComponentSettings[customElementEntity],
                });
            });
        };
    };

    /**
     * Returns an event class decorator.
     *
     * @param { string } name the event name
     * @param { EventData } data the event data
     * @returns { ClassDecorator }
     */
    const event = (name, data = {}) => {
        return (target) => {
            if (!Object.prototype.hasOwnProperty.call(target, "metadata")) {
                target.metadata = {};
            }
            const metadata = target.metadata;
            if (!metadata.events) {
                metadata.events = {};
            }
            const eventsMetadata = metadata.events;
            if (!eventsMetadata[name]) {
                eventsMetadata[name] = data;
            }
        };
    };

    /**
     * Returns a property decorator.
     *
     * @param { Property } propData
     * @returns { PropertyDecorator }
     */
    const property = (propData) => {
        return (target, propertyKey) => {
            const ctor = target.constructor;
            if (!Object.prototype.hasOwnProperty.call(ctor, "metadata")) {
                ctor.metadata = {};
            }
            const metadata = ctor.metadata;
            if (!metadata.properties) {
                metadata.properties = {};
            }
            const propsMetadata = metadata.properties;
            if (!propsMetadata[propertyKey]) {
                propsMetadata[propertyKey] = propData ?? {};
            }
        };
    };

    /**
     * Returns a slot decorator.
     *
     * @param { Slot } slotData
     * @returns { PropertyDecorator }
     */
    const slot = (slotData) => {
        return (target, slotKey) => {
            const ctor = target.constructor;
            if (!Object.prototype.hasOwnProperty.call(ctor, "metadata")) {
                ctor.metadata = {};
            }
            const metadata = ctor.metadata;
            if (!metadata.slots) {
                metadata.slots = {};
            }
            const slotMetadata = metadata.slots;
            if (slotData && slotData.default && slotMetadata.default) {
                throw new Error("Only one slot can be the default slot.");
            }
            const key = slotData && slotData.default ? "default" : slotKey;
            slotData = slotData || { type: HTMLElement };
            if (!slotData.type) {
                slotData.type = HTMLElement;
            }
            if (!slotMetadata[key]) {
                slotMetadata[key] = slotData;
            }
            if (slotData.default) {
                delete slotMetadata.default.default;
                slotMetadata.default.propertyName = slotKey;
            }
            ctor.metadata.managedSlots = true;
        };
    };

    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    var t$1;const i$1=globalThis,s$1=i$1.trustedTypes,e$2=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,o$1="$lit$",n=`lit$${(Math.random()+"").slice(9)}$`,l$2="?"+n,h=`<${l$2}>`,r$1=void 0===i$1.document?{createTreeWalker:()=>({})}:document,u$1=()=>r$1.createComment(""),d=t=>null===t||"object"!=typeof t&&"function"!=typeof t,c$2=Array.isArray,v=t=>c$2(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),a$1="[ \t\n\f\r]",f$1=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m$1=/>/g,p$1=RegExp(`>|${a$1}(?:([^\\s"'>=/]+)(${a$1}*=${a$1}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),T=x(1),b=x(2),w=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),E=new WeakMap,C=r$1.createTreeWalker(r$1,129,null,!1);function P(t,i){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$2?e$2.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,e=[];let l,r=2===i?"<svg>":"",u=f$1;for(let i=0;i<s;i++){const s=t[i];let d,c,v=-1,a=0;for(;a<s.length&&(u.lastIndex=a,c=u.exec(s),null!==c);)a=u.lastIndex,u===f$1?"!--"===c[1]?u=_:void 0!==c[1]?u=m$1:void 0!==c[2]?(y.test(c[2])&&(l=RegExp("</"+c[2],"g")),u=p$1):void 0!==c[3]&&(u=p$1):u===p$1?">"===c[0]?(u=null!=l?l:f$1,v=-1):void 0===c[1]?v=-2:(v=u.lastIndex-c[2].length,d=c[1],u=void 0===c[3]?p$1:'"'===c[3]?$:g):u===$||u===g?u=p$1:u===_||u===m$1?u=f$1:(u=p$1,l=void 0);const x=u===p$1&&t[i+1].startsWith("/>")?" ":"";r+=u===f$1?s+h:v>=0?(e.push(d),s.slice(0,v)+o$1+s.slice(v)+n+x):s+n+(-2===v?(e.push(void 0),i):x);}return [P(t,r+(t[s]||"<?>")+(2===i?"</svg>":"")),e]};class N{constructor({strings:t,_$litType$:i},e){let h;this.parts=[];let r=0,d=0;const c=t.length-1,v=this.parts,[a,f]=V(t,i);if(this.el=N.createElement(a,e),C.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(h=C.nextNode())&&v.length<c;){if(1===h.nodeType){if(h.hasAttributes()){const t=[];for(const i of h.getAttributeNames())if(i.endsWith(o$1)||i.startsWith(n)){const s=f[d++];if(t.push(i),void 0!==s){const t=h.getAttribute(s.toLowerCase()+o$1).split(n),i=/([.?@])?(.*)/.exec(s);v.push({type:1,index:r,name:i[2],strings:t,ctor:"."===i[1]?H:"?"===i[1]?L:"@"===i[1]?z:R});}else v.push({type:6,index:r});}for(const i of t)h.removeAttribute(i);}if(y.test(h.tagName)){const t=h.textContent.split(n),i=t.length-1;if(i>0){h.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)h.append(t[s],u$1()),C.nextNode(),v.push({type:2,index:++r});h.append(t[i],u$1());}}}else if(8===h.nodeType)if(h.data===l$2)v.push({type:2,index:r});else {let t=-1;for(;-1!==(t=h.data.indexOf(n,t+1));)v.push({type:7,index:r}),t+=n.length-1;}r++;}}static createElement(t,i){const s=r$1.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){var o,n,l,h;if(i===w)return i;let r=void 0!==e?null===(o=s._$Co)||void 0===o?void 0:o[e]:s._$Cl;const u=d(i)?void 0:i._$litDirective$;return (null==r?void 0:r.constructor)!==u&&(null===(n=null==r?void 0:r._$AO)||void 0===n||n.call(r,!1),void 0===u?r=void 0:(r=new u(t),r._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Co)&&void 0!==l?l:h._$Co=[])[e]=r:s._$Cl=r),void 0!==r&&(i=S(t,r._$AS(t,i.values),r,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:r$1).importNode(s,!0);C.currentNode=o;let n=C.nextNode(),l=0,h=0,u=e[0];for(;void 0!==u;){if(l===u.index){let i;2===u.type?i=new k(n,n.nextSibling,this,t):1===u.type?i=new u.ctor(n,u.name,u.strings,this,t):6===u.type&&(i=new W(n,this,t)),this._$AV.push(i),u=e[++h];}l!==(null==u?void 0:u.index)&&(n=C.nextNode(),l++);}return C.currentNode=r$1,o}v(t){let i=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{constructor(t,i,s,e){var o;this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cp=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===(null==t?void 0:t.nodeType)&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),d(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==w&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):v(t)?this.T(t):this._(t);}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t));}_(t){this._$AH!==A&&d(this._$AH)?this._$AA.nextSibling.data=t:this.$(r$1.createTextNode(t)),this._$AH=t;}g(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=N.createElement(P(e.h,e.h[0]),this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.v(s);else {const t=new M(o,this),i=t.u(this.options);t.v(s),this.$(i),this._$AH=t;}}_$AC(t){let i=E.get(t.strings);return void 0===i&&E.set(t.strings,i=new N(t)),i}T(t){c$2(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new k(this.k(u$1()),this.k(u$1()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cp=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}}class R{constructor(t,i,s,e,o){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=S(this,t,i,0),n=!d(t)||t!==this._$AH&&t!==w,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=S(this,e[s+l],i,l),h===w&&(h=this._$AH[l]),n||(n=!d(h)||h!==this._$AH[l]),h===A?t=A:t!==A&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}}class H extends R{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}const I=s$1?s$1.emptyScript:"";class L extends R{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==A?this.element.setAttribute(this.name,I):this.element.removeAttribute(this.name);}}class z extends R{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=S(this,t,i,0))&&void 0!==s?s:A)===w)return;const e=this._$AH,o=t===A&&e!==A||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==A&&(e===A||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}}class W{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t);}}const Z={O:o$1,P:n,A:l$2,C:1,M:V,L:M,R:v,D:S,I:k,V:R,H:L,N:z,U:H,F:W},j=i$1.litHtmlPolyfillSupport;null==j||j(N,k),(null!==(t$1=i$1.litHtmlVersions)&&void 0!==t$1?t$1:i$1.litHtmlVersions=[]).push("2.8.0");const B=(t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let l=n._$litPart$;if(void 0===l){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=l=new k(i.insertBefore(u$1(),t),t,void 0,null!=s?s:{});}return l._$AI(t),l};

    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    const t={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},e$1=t=>(...e)=>({_$litDirective$:t,values:e});class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}

    /**
     * @license
     * Copyright 2020 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */const {I:l$1}=Z,r=()=>document.createComment(""),c$1=(o,i,n)=>{var t;const v=o._$AA.parentNode,d=void 0===i?o._$AB:i._$AA;if(void 0===n){const i=v.insertBefore(r(),d),t=v.insertBefore(r(),d);n=new l$1(i,t,o,o.options);}else {const l=n._$AB.nextSibling,i=n._$AM,u=i!==o;if(u){let l;null===(t=n._$AQ)||void 0===t||t.call(n,o),n._$AM=o,void 0!==n._$AP&&(l=o._$AU)!==i._$AU&&n._$AP(l);}if(l!==d||u){let o=n._$AA;for(;o!==l;){const l=o.nextSibling;v.insertBefore(o,d),o=l;}}}return n},f=(o,l,i=o)=>(o._$AI(l,i),o),s={},a=(o,l=s)=>o._$AH=l,m=o=>o._$AH,p=o=>{var l;null===(l=o._$AP)||void 0===l||l.call(o,!1,!0);let i=o._$AA;const n=o._$AB.nextSibling;for(;i!==n;){const o=i.nextSibling;i.remove(),i=o;}};

    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    const u=(e,s,t)=>{const r=new Map;for(let l=s;l<=t;l++)r.set(e[l],l);return r},c=e$1(class extends i{constructor(e){if(super(e),e.type!==t.CHILD)throw Error("repeat() can only be used in text expressions")}ct(e,s,t){let r;void 0===t?t=s:void 0!==s&&(r=s);const l=[],o=[];let i=0;for(const s of e)l[i]=r?r(s,i):i,o[i]=t(s,i),i++;return {values:o,keys:l}}render(e,s,t){return this.ct(e,s,t).values}update(s,[t,r,c]){var d;const a$1=m(s),{values:p$1,keys:v}=this.ct(t,r,c);if(!Array.isArray(a$1))return this.ut=v,p$1;const h=null!==(d=this.ut)&&void 0!==d?d:this.ut=[],m$1=[];let y,x,j=0,k=a$1.length-1,w$1=0,A=p$1.length-1;for(;j<=k&&w$1<=A;)if(null===a$1[j])j++;else if(null===a$1[k])k--;else if(h[j]===v[w$1])m$1[w$1]=f(a$1[j],p$1[w$1]),j++,w$1++;else if(h[k]===v[A])m$1[A]=f(a$1[k],p$1[A]),k--,A--;else if(h[j]===v[A])m$1[A]=f(a$1[j],p$1[A]),c$1(s,m$1[A+1],a$1[j]),j++,A--;else if(h[k]===v[w$1])m$1[w$1]=f(a$1[k],p$1[w$1]),c$1(s,a$1[j],a$1[k]),k--,w$1++;else if(void 0===y&&(y=u(v,w$1,A),x=u(h,j,k)),y.has(h[j]))if(y.has(h[k])){const e=x.get(v[w$1]),t=void 0!==e?a$1[e]:null;if(null===t){const e=c$1(s,a$1[j]);f(e,p$1[w$1]),m$1[w$1]=e;}else m$1[w$1]=f(t,p$1[w$1]),c$1(s,a$1[j],t),a$1[e]=null;w$1++;}else p(a$1[k]),k--;else p(a$1[j]),j++;for(;w$1<=A;){const e=c$1(s,m$1[A+1]);f(e,p$1[w$1]),m$1[w$1++]=e;}for(;j<=k;){const e=a$1[j++];null!==e&&p(e);}return this.ut=v,a(s,m$1),w}});

    /**
     * @license
     * Copyright 2018 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */const o=e$1(class extends i{constructor(t$1){var i;if(super(t$1),t$1.type!==t.ATTRIBUTE||"class"!==t$1.name||(null===(i=t$1.strings)||void 0===i?void 0:i.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return " "+Object.keys(t).filter((i=>t[i])).join(" ")+" "}update(i,[s]){var r,o;if(void 0===this.it){this.it=new Set,void 0!==i.strings&&(this.nt=new Set(i.strings.join(" ").split(/\s/).filter((t=>""!==t))));for(const t in s)s[t]&&!(null===(r=this.nt)||void 0===r?void 0:r.has(t))&&this.it.add(t);return this.render(s)}const e=i.element.classList;this.it.forEach((t=>{t in s||(e.remove(t),this.it.delete(t));}));for(const t in s){const i=!!s[t];i===this.it.has(t)||(null===(o=this.nt)||void 0===o?void 0:o.has(t))||(i?(e.add(t),this.it.add(t)):(e.remove(t),this.it.delete(t)));}return w}});

    // @ts-nocheck
    /* eslint-disable */
    /**
     * @license
     * Copyright 2018 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    /**
     * This is the original style-map.js directive from lit-html 2 with the only difference that "render" is not called even for the first rendering (update is used instead)
     */
    class StyleMapDirective extends i {
        constructor(partInfo) {
            var _a;
            super(partInfo);
            if (partInfo.type !== t.ATTRIBUTE ||
                partInfo.name !== 'style' ||
                ((_a = partInfo.strings) === null || _a === void 0 ? void 0 : _a.length) > 2) {
                throw new Error('The `styleMap` directive must be used in the `style` attribute ' +
                    'and must be the only part in the attribute.');
            }
        }
        render(styleInfo) {
            return "";
        }
        update(part, [styleInfo]) {
            const { style } = part.element;
            if (this._previousStyleProperties === undefined) {
                this._previousStyleProperties = new Set();
                for (const name in styleInfo) {
                    this._previousStyleProperties.add(name);
                }
                // return this.render(styleInfo);
            }
            // Remove old properties that no longer exist in styleInfo
            // We use forEach() instead of for-of so that re don't require down-level
            // iteration.
            this._previousStyleProperties.forEach((name) => {
                // If the name isn't in styleInfo or it's null/undefined
                if (styleInfo[name] == null) {
                    this._previousStyleProperties.delete(name);
                    if (name.includes('-')) {
                        style.removeProperty(name);
                    }
                    else {
                        // Note reset using empty string (vs null) as IE11 does not always
                        // reset via null (https://developer.mozilla.org/en-US/docs/Web/API/ElementCSSInlineStyle/style#setting_styles)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        style[name] = '';
                    }
                }
            });
            // Add or update properties
            for (const name in styleInfo) {
                const value = styleInfo[name];
                if (value != null) {
                    this._previousStyleProperties.add(name);
                    if (name.includes('-')) {
                        style.setProperty(name, value);
                    }
                    else {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        style[name] = value;
                    }
                }
            }
            return w;
        }
    }
    const styleMap = e$1(StyleMapDirective);

    /**
     * @license
     * Copyright 2018 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */const l=l=>null!=l?l:A;

    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */class e extends i{constructor(i){if(super(i),this.et=A,i.type!==t.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(r){if(r===A||null==r)return this.ft=void 0,this.et=r;if(r===w)return r;if("string"!=typeof r)throw Error(this.constructor.directiveName+"() called with a non-string value");if(r===this.et)return this.ft;this.et=r;const s=[r];return s.raw=s,this.ft={_$litType$:this.constructor.resultType,strings:s,values:[]}}}e.directiveName="unsafeHTML",e.resultType=1;

    const effectiveHtml = (strings, ...values) => {
        const litStatic = getFeature("LitStatic");
        const fn = litStatic ? litStatic.html : T;
        return fn(strings, ...values);
    };
    const effectiveSvg = (strings, ...values) => {
        const litStatic = getFeature("LitStatic");
        const fn = litStatic ? litStatic.svg : b;
        return fn(strings, ...values);
    };
    const litRender = (templateResult, container, options) => {
        const openUI5Enablement = getFeature("OpenUI5Enablement");
        if (openUI5Enablement) {
            templateResult = openUI5Enablement.wrapTemplateResultInBusyMarkup(effectiveHtml, options.host, templateResult);
        }
        B(templateResult, container, options);
    };
    const scopeTag = (tag, tags, suffix) => {
        const litStatic = getFeature("LitStatic");
        if (litStatic) {
            return litStatic.unsafeStatic((tags || []).includes(tag) ? `${tag}-${suffix}` : tag);
        }
    };

    const tasks = new WeakMap();
    class AnimationQueue {
        static get tasks() {
            return tasks;
        }
        static enqueue(element, task) {
            if (!tasks.has(element)) {
                tasks.set(element, []);
            }
            tasks.get(element).push(task);
        }
        static run(element, task) {
            if (!tasks.has(element)) {
                tasks.set(element, []);
            }
            return task().then(() => {
                const elementTasks = tasks.get(element);
                if (elementTasks.length > 0) {
                    return AnimationQueue.run(element, elementTasks.shift());
                }
                tasks.delete(element);
            });
        }
        static push(element, task) {
            const elementTasks = tasks.get(element);
            if (elementTasks) {
                AnimationQueue.enqueue(element, task);
            }
            else {
                AnimationQueue.run(element, task);
            }
        }
    }

    const animate = (options) => {
        let start = null;
        let stopped = false;
        let animationFrame;
        let stop;
        let advanceAnimation;
        const promise = new Promise((resolve, reject) => {
            advanceAnimation = timestamp => {
                start = start || timestamp;
                const timeElapsed = timestamp - start;
                const remaining = options.duration - timeElapsed;
                if (timeElapsed <= options.duration) {
                    const currentAdvance = 1 - remaining / options.duration; // easing formula (currently linear)
                    options.advance(currentAdvance);
                    if (!stopped) {
                        animationFrame = requestAnimationFrame(advanceAnimation);
                    }
                }
                else {
                    options.advance(1);
                    resolve();
                }
            };
            stop = () => {
                stopped = true;
                cancelAnimationFrame(animationFrame);
                reject(new Error("animation stopped"));
            };
        }).catch((reason) => reason);
        AnimationQueue.push(options.element, () => {
            if (typeof options.beforeStart === "function") {
                options.beforeStart();
            }
            requestAnimationFrame(advanceAnimation);
            return new Promise(resolve => {
                promise.then(() => resolve());
            });
        });
        return {
            promise: () => promise,
            stop: () => stop,
        };
    };
    const duration = 400;

    const slideDown = (element) => {
        let computedStyles, paddingTop, paddingBottom, marginTop, marginBottom, height;
        let storedOverflow, storedPaddingTop, storedPaddingBottom, storedMarginTop, storedMarginBottom, storedHeight;
        const animation = animate({
            beforeStart: () => {
                // Show the element to measure its properties
                element.style.display = "block";
                // Get Computed styles
                computedStyles = getComputedStyle(element);
                paddingTop = parseFloat(computedStyles.paddingTop);
                paddingBottom = parseFloat(computedStyles.paddingBottom);
                marginTop = parseFloat(computedStyles.marginTop);
                marginBottom = parseFloat(computedStyles.marginBottom);
                height = parseFloat(computedStyles.height);
                // Store inline styles
                storedOverflow = element.style.overflow;
                storedPaddingTop = element.style.paddingTop;
                storedPaddingBottom = element.style.paddingBottom;
                storedMarginTop = element.style.marginTop;
                storedMarginBottom = element.style.marginBottom;
                storedHeight = element.style.height;
                element.style.overflow = "hidden";
                element.style.paddingTop = "0";
                element.style.paddingBottom = "0";
                element.style.marginTop = "0";
                element.style.marginBottom = "0";
                element.style.height = "0";
            },
            duration,
            element,
            advance: progress => {
                // WORKAROUND
                element.style.display = "block";
                // END OF WORKAROUND
                element.style.paddingTop = `${(paddingTop * progress)}px`;
                element.style.paddingBottom = `${(paddingBottom * progress)}px`;
                element.style.marginTop = `${(marginTop * progress)}px`;
                element.style.marginBottom = `${(marginBottom * progress)}px`;
                element.style.height = `${(height * progress)}px`;
            },
        });
        animation.promise().then(() => {
            element.style.overflow = storedOverflow;
            element.style.paddingTop = storedPaddingTop;
            element.style.paddingBottom = storedPaddingBottom;
            element.style.marginTop = storedMarginTop;
            element.style.marginBottom = storedMarginBottom;
            element.style.height = storedHeight;
        });
        return animation;
    };

    const slideUp = (element) => {
        // Get Computed styles
        let computedStyles, paddingTop, paddingBottom, marginTop, marginBottom, height;
        // Store inline styles
        let storedOverflow, storedPaddingTop, storedPaddingBottom, storedMarginTop, storedMarginBottom, storedHeight;
        const animation = animate({
            beforeStart: () => {
                // Get Computed styles
                const el = element;
                computedStyles = getComputedStyle(el);
                paddingTop = parseFloat(computedStyles.paddingTop);
                paddingBottom = parseFloat(computedStyles.paddingBottom);
                marginTop = parseFloat(computedStyles.marginTop);
                marginBottom = parseFloat(computedStyles.marginBottom);
                height = parseFloat(computedStyles.height);
                // Store inline styles
                storedOverflow = el.style.overflow;
                storedPaddingTop = el.style.paddingTop;
                storedPaddingBottom = el.style.paddingBottom;
                storedMarginTop = el.style.marginTop;
                storedMarginBottom = el.style.marginBottom;
                storedHeight = el.style.height;
                el.style.overflow = "hidden";
            },
            duration,
            element,
            advance: progress => {
                element.style.paddingTop = `${paddingTop - (paddingTop * progress)}px`;
                element.style.paddingBottom = `${paddingBottom - (paddingBottom * progress)}px`;
                element.style.marginTop = `${marginTop - (marginTop * progress)}px`;
                element.style.marginBottom = `${marginBottom - (marginBottom * progress)}px`;
                element.style.height = `${height - (height * progress)}px`;
            },
        });
        animation.promise().then(reason => {
            if (!(reason instanceof Error)) {
                element.style.overflow = storedOverflow;
                element.style.paddingTop = storedPaddingTop;
                element.style.paddingBottom = storedPaddingBottom;
                element.style.marginTop = storedMarginTop;
                element.style.marginBottom = storedMarginBottom;
                element.style.height = storedHeight;
                element.style.display = "none";
            }
        });
        return animation;
    };

    const KeyCodes = {
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        SHIFT: 16,
        CONTROL: 17,
        ALT: 18,
        BREAK: 19,
        CAPS_LOCK: 20,
        ESCAPE: 27,
        SPACE: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        ARROW_LEFT: 37,
        ARROW_UP: 38,
        ARROW_RIGHT: 39,
        ARROW_DOWN: 40,
        PRINT: 44,
        INSERT: 45,
        DELETE: 46,
        DIGIT_0: 48,
        DIGIT_1: 49,
        DIGIT_2: 50,
        DIGIT_3: 51,
        DIGIT_4: 52,
        DIGIT_5: 53,
        DIGIT_6: 54,
        DIGIT_7: 55,
        DIGIT_8: 56,
        DIGIT_9: 57,
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        WINDOWS: 91,
        CONTEXT_MENU: 93,
        TURN_OFF: 94,
        SLEEP: 95,
        NUMPAD_0: 96,
        NUMPAD_1: 97,
        NUMPAD_2: 98,
        NUMPAD_3: 99,
        NUMPAD_4: 100,
        NUMPAD_5: 101,
        NUMPAD_6: 102,
        NUMPAD_7: 103,
        NUMPAD_8: 104,
        NUMPAD_9: 105,
        NUMPAD_ASTERISK: 106,
        NUMPAD_PLUS: 107,
        NUMPAD_MINUS: 109,
        NUMPAD_COMMA: 110,
        NUMPAD_SLASH: 111,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        NUM_LOCK: 144,
        SCROLL_LOCK: 145,
        COLON: 186,
        PLUS: 187,
        COMMA: 188,
        SLASH: 189,
        DOT: 190,
        PIPE: 191,
        SEMICOLON: 192,
        MINUS: 219,
        GREAT_ACCENT: 220,
        EQUALS: 221,
        SINGLE_QUOTE: 222,
        BACKSLASH: 226,
    };
    const isEnter = (event) => (event.key ? event.key === "Enter" : event.keyCode === KeyCodes.ENTER) && !hasModifierKeys(event);
    const isSpace = (event) => (event.key ? (event.key === "Spacebar" || event.key === " ") : event.keyCode === KeyCodes.SPACE) && !hasModifierKeys(event);
    const isEscape = (event) => (event.key ? event.key === "Escape" || event.key === "Esc" : event.keyCode === KeyCodes.ESCAPE) && !hasModifierKeys(event);
    const isShift = (event) => event.key === "Shift" || event.keyCode === KeyCodes.SHIFT;
    const hasModifierKeys = (event) => event.shiftKey || event.altKey || getCtrlKey(event);
    const getCtrlKey = (event) => !!(event.metaKey || event.ctrlKey); // double negation doesn't have effect on boolean but ensures null and undefined are equivalent to false.

    let curAnimationMode;
    /**
     * Returns the animation mode - "full", "basic", "minimal" or "none".
     * @public
     * @returns { AnimationMode }
     */
    const getAnimationMode = () => {
        if (curAnimationMode === undefined) {
            curAnimationMode = getAnimationMode$1();
        }
        return curAnimationMode;
    };

    const isSSR$1 = typeof document === "undefined";
    const detectNavigatorLanguage = () => {
        if (isSSR$1) {
            return DEFAULT_LANGUAGE;
        }
        const browserLanguages = navigator.languages;
        const navigatorLanguage = () => {
            return navigator.language;
        };
        const rawLocale = (browserLanguages && browserLanguages[0]) || navigatorLanguage();
        return rawLocale || DEFAULT_LANGUAGE;
    };

    const eventProvider = new EventProvider();
    const LANG_CHANGE = "languageChange";
    const attachLanguageChange = (listener) => {
        eventProvider.attachEvent(LANG_CHANGE, listener);
    };

    let curLanguage;
    let fetchDefaultLanguage;
    /**
     * Returns the currently configured language, or the browser language as a fallback.
     * @public
     * @returns {string}
     */
    const getLanguage = () => {
        if (curLanguage === undefined) {
            curLanguage = getLanguage$1();
        }
        return curLanguage;
    };
    /**
     * Defines if the default language, that is inlined, should be
     * fetched over the network instead of using the inlined one.
     * **Note:** By default the language will not be fetched.
     *
     * @public
     * @param {boolean} fetchDefaultLang
     */
    const setFetchDefaultLanguage = (fetchDefaultLang) => {
        fetchDefaultLanguage = fetchDefaultLang;
    };
    /**
     * Returns if the default language, that is inlined, should be fetched over the network.
     * @public
     * @returns {boolean}
     */
    const getFetchDefaultLanguage = () => {
        if (fetchDefaultLanguage === undefined) {
            setFetchDefaultLanguage(getFetchDefaultLanguage$1());
        }
        return fetchDefaultLanguage;
    };

    const rLocale = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;
    class Locale {
        constructor(sLocaleId) {
            const aResult = rLocale.exec(sLocaleId.replace(/_/g, "-"));
            if (aResult === null) {
                throw new Error(`The given language ${sLocaleId} does not adhere to BCP-47.`);
            }
            this.sLocaleId = sLocaleId;
            this.sLanguage = aResult[1] || DEFAULT_LANGUAGE;
            this.sScript = aResult[2] || "";
            this.sRegion = aResult[3] || "";
            this.sVariant = (aResult[4] && aResult[4].slice(1)) || null;
            this.sExtension = (aResult[5] && aResult[5].slice(1)) || null;
            this.sPrivateUse = aResult[6] || null;
            if (this.sLanguage) {
                this.sLanguage = this.sLanguage.toLowerCase();
            }
            if (this.sScript) {
                this.sScript = this.sScript.toLowerCase().replace(/^[a-z]/, s => {
                    return s.toUpperCase();
                });
            }
            if (this.sRegion) {
                this.sRegion = this.sRegion.toUpperCase();
            }
        }
        getLanguage() {
            return this.sLanguage;
        }
        getScript() {
            return this.sScript;
        }
        getRegion() {
            return this.sRegion;
        }
        getVariant() {
            return this.sVariant;
        }
        getVariantSubtags() {
            return this.sVariant ? this.sVariant.split("-") : [];
        }
        getExtension() {
            return this.sExtension;
        }
        getExtensionSubtags() {
            return this.sExtension ? this.sExtension.slice(2).split("-") : [];
        }
        getPrivateUse() {
            return this.sPrivateUse;
        }
        getPrivateUseSubtags() {
            return this.sPrivateUse ? this.sPrivateUse.slice(2).split("-") : [];
        }
        hasPrivateUseSubtag(sSubtag) {
            return this.getPrivateUseSubtags().indexOf(sSubtag) >= 0;
        }
        toString() {
            const r = [this.sLanguage];
            if (this.sScript) {
                r.push(this.sScript);
            }
            if (this.sRegion) {
                r.push(this.sRegion);
            }
            if (this.sVariant) {
                r.push(this.sVariant);
            }
            if (this.sExtension) {
                r.push(this.sExtension);
            }
            if (this.sPrivateUse) {
                r.push(this.sPrivateUse);
            }
            return r.join("-");
        }
    }

    const cache = new Map();
    const getLocaleInstance = (lang) => {
        if (!cache.has(lang)) {
            cache.set(lang, new Locale(lang));
        }
        return cache.get(lang);
    };
    const convertToLocaleOrNull = (lang) => {
        try {
            if (lang && typeof lang === "string") {
                return getLocaleInstance(lang);
            }
        }
        catch (e) {
            // ignore
        }
        return new Locale(DEFAULT_LOCALE);
    };
    /**
     * Returns the locale based on the parameter or configured language Configuration#getLanguage
     * If no language has been configured - a new locale based on browser language is returned
     */
    const getLocale = (lang) => {
        const configLanguage = getLanguage();
        if (configLanguage) {
            return getLocaleInstance(configLanguage);
        }
        return convertToLocaleOrNull(detectNavigatorLanguage());
    };

    const localeRegEX = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;
    const SAPSupportabilityLocales = /(?:^|-)(saptrc|sappsd)(?:-|$)/i;
    /* Map for old language names for a few ISO639 codes. */
    const M_ISO639_NEW_TO_OLD = {
        "he": "iw",
        "yi": "ji",
        "nb": "no",
        "sr": "sh",
    };
    /**
     * Normalizes the given locale in BCP-47 syntax.
     * @param {string} locale locale to normalize
     * @returns {string} Normalized locale, "undefined" if the locale can't be normalized or the default locale, if no locale provided.
     */
    const normalizeLocale = (locale) => {
        let m;
        if (!locale) {
            return DEFAULT_LOCALE;
        }
        if (typeof locale === "string" && (m = localeRegEX.exec(locale.replace(/_/g, "-")))) { /* eslint-disable-line */
            let language = m[1].toLowerCase();
            let region = m[3] ? m[3].toUpperCase() : undefined;
            const script = m[2] ? m[2].toLowerCase() : undefined;
            const variants = m[4] ? m[4].slice(1) : undefined;
            const isPrivate = m[6];
            language = M_ISO639_NEW_TO_OLD[language] || language;
            // recognize and convert special SAP supportability locales (overwrites m[]!)
            if ((isPrivate && (m = SAPSupportabilityLocales.exec(isPrivate))) /* eslint-disable-line */ ||
                (variants && (m = SAPSupportabilityLocales.exec(variants)))) { /* eslint-disable-line */
                return `en_US_${m[1].toLowerCase()}`; // for now enforce en_US (agreed with SAP SLS)
            }
            // Chinese: when no region but a script is specified, use default region for each script
            if (language === "zh" && !region) {
                if (script === "hans") {
                    region = "CN";
                }
                else if (script === "hant") {
                    region = "TW";
                }
            }
            return language + (region ? "_" + region + (variants ? "_" + variants.replace("-", "_") : "") : ""); /* eslint-disable-line */
        }
        return DEFAULT_LOCALE;
    };

    /**
     * Calculates the next fallback locale for the given locale.
     *
     * @param {string} locale Locale string in Java format (underscores) or null
     * @returns {string} Next fallback Locale or "en" if no fallbacks found.
     */
    const nextFallbackLocale = (locale) => {
        if (!locale) {
            return DEFAULT_LOCALE;
        }
        if (locale === "zh_HK") {
            return "zh_TW";
        }
        // if there are multiple segments (separated by underscores), remove the last one
        const p = locale.lastIndexOf("_");
        if (p >= 0) {
            return locale.slice(0, p);
        }
        // for any language but the default, fallback to the default first before falling back to the 'raw' language (empty string)
        return locale !== DEFAULT_LOCALE ? DEFAULT_LOCALE : "";
    };

    // contains package names for which the warning has been shown
    const warningShown = new Set();
    const reportedErrors = new Set();
    const bundleData = new Map();
    const bundlePromises = new Map();
    const loaders$1 = new Map();
    const _setI18nBundleData = (packageName, data) => {
        bundleData.set(packageName, data);
    };
    const getI18nBundleData = (packageName) => {
        return bundleData.get(packageName);
    };
    const _hasLoader = (packageName, localeId) => {
        const bundleKey = `${packageName}/${localeId}`;
        return loaders$1.has(bundleKey);
    };
    // load bundle over the network once
    const _loadMessageBundleOnce = (packageName, localeId) => {
        const bundleKey = `${packageName}/${localeId}`;
        const loadMessageBundle = loaders$1.get(bundleKey);
        if (loadMessageBundle && !bundlePromises.get(bundleKey)) {
            bundlePromises.set(bundleKey, loadMessageBundle(localeId));
        }
        return bundlePromises.get(bundleKey); // Investigate if i18n loader exists and this won't return undefined.
    };
    const _showAssetsWarningOnce = (packageName) => {
        if (!warningShown.has(packageName)) {
            console.warn(`[${packageName}]: Message bundle assets are not configured. Falling back to English texts.`, /* eslint-disable-line */ ` Add \`import "${packageName}/dist/Assets.js"\` in your bundle and make sure your build tool supports dynamic imports and JSON imports. See section "Assets" in the documentation for more information.`); /* eslint-disable-line */
            warningShown.add(packageName);
        }
    };
    const useFallbackBundle = (packageName, localeId) => {
        return localeId !== DEFAULT_LANGUAGE && !_hasLoader(packageName, localeId);
    };
    /**
     * This method preforms the asynchronous task of fetching the actual text resources. It will fetch
     * each text resource over the network once (even for multiple calls to the same method).
     * It should be fully finished before the i18nBundle class is created in the webcomponents.
     * This method uses the bundle URLs that are populated by the `registerI18nBundle` method.
     * To simplify the usage, the synchronization of both methods happens internally for the same `bundleId`
     * @param {packageName} packageName the NPM package name
     * @public
     */
    const fetchI18nBundle = async (packageName) => {
        const language = getLocale().getLanguage();
        const region = getLocale().getRegion();
        const variant = getLocale().getVariant();
        let localeId = language + (region ? `-${region}` : ``) + (variant ? `-${variant}` : ``);
        if (useFallbackBundle(packageName, localeId)) {
            localeId = normalizeLocale(localeId);
            while (useFallbackBundle(packageName, localeId)) {
                localeId = nextFallbackLocale(localeId);
            }
        }
        // use default language unless configured to always fetch it from the network
        const fetchDefaultLanguage = getFetchDefaultLanguage();
        if (localeId === DEFAULT_LANGUAGE && !fetchDefaultLanguage) {
            _setI18nBundleData(packageName, null); // reset for the default language (if data was set for a previous language)
            return;
        }
        if (!_hasLoader(packageName, localeId)) {
            _showAssetsWarningOnce(packageName);
            return;
        }
        try {
            const data = await _loadMessageBundleOnce(packageName, localeId);
            _setI18nBundleData(packageName, data);
        }
        catch (error) {
            const e = error;
            if (!reportedErrors.has(e.message)) {
                reportedErrors.add(e.message);
                console.error(e.message); /* eslint-disable-line */
            }
        }
    };
    // When the language changes dynamically (the user calls setLanguage), re-fetch all previously fetched bundles
    attachLanguageChange((lang /* eslint-disable-line */) => {
        const allPackages = [...bundleData.keys()];
        return Promise.all(allPackages.map(fetchI18nBundle));
    });

    const messageFormatRegEX = /('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g;
    const formatMessage = (text, values) => {
        values = values || [];
        return text.replace(messageFormatRegEX, ($0, $1, $2, $3, offset) => {
            if ($1) {
                return '\''; /* eslint-disable-line */
            }
            if ($2) {
                return $2.replace(/''/g, '\''); /* eslint-disable-line */
            }
            if ($3) {
                const ind = typeof $3 === "string" ? parseInt($3) : $3;
                return String(values[ind]);
            }
            throw new Error(`[i18n]: pattern syntax error at pos ${offset}`);
        });
    };

    const I18nBundleInstances = new Map();
    /**
     * @class
     * @public
     */
    class I18nBundle {
        constructor(packageName) {
            this.packageName = packageName;
        }
        /**
         * Returns a text in the currently loaded language
         *
         * @public
         * @param textObj key/defaultText pair or just the key
         * @param params Values for the placeholders
         */
        getText(textObj, ...params) {
            if (typeof textObj === "string") {
                textObj = { key: textObj, defaultText: textObj };
            }
            if (!textObj || !textObj.key) {
                return "";
            }
            const bundle = getI18nBundleData(this.packageName);
            if (bundle && !bundle[textObj.key]) {
                // eslint-disable-next-line no-console
                console.warn(`Key ${textObj.key} not found in the i18n bundle, the default text will be used`);
            }
            const messageText = bundle && bundle[textObj.key] ? bundle[textObj.key] : (textObj.defaultText || textObj.key);
            return formatMessage(messageText, params);
        }
    }
    /**
     * Returns the I18nBundle instance for the given package synchronously.
     *
     * @public
     * @param packageName
     */
    const getI18nBundleSync = (packageName) => {
        if (I18nBundleInstances.has(packageName)) {
            return I18nBundleInstances.get(packageName);
        }
        const i18nBundle = new I18nBundle(packageName);
        I18nBundleInstances.set(packageName, i18nBundle);
        return i18nBundle;
    };
    /**
     * Fetches and returns the I18nBundle instance for the given package.
     *
     * @public
     * @param packageName
     */
    const getI18nBundle = async (packageName) => {
        await fetchI18nBundle(packageName);
        return getI18nBundleSync(packageName);
    };

    /**
     * Supported icon collection aliases.
     *
     * Users might specify a collection, using both the key and the value in the following key-value pairs,
     * e.g the following pairs are completely exchangeable:
     *
     * - "SAP-icons/accept" and "SAP-icons-v4/accept"
     * - "horizon/accept" and "SAP-icons-v5/accept"
     * - "SAP-icons-TNT/actor" and "tnt/actor"
     * - "BusinessSuiteInAppSymbols/3d" and "business-suite/3d"
     */
    var IconCollectionsAlias;
    (function (IconCollectionsAlias) {
        IconCollectionsAlias["SAP-icons"] = "SAP-icons-v4";
        IconCollectionsAlias["horizon"] = "SAP-icons-v5";
        IconCollectionsAlias["SAP-icons-TNT"] = "tnt";
        IconCollectionsAlias["BusinessSuiteInAppSymbols"] = "business-suite";
    })(IconCollectionsAlias || (IconCollectionsAlias = {}));
    /**
     * Returns the collection name for a given alias:
     *
     * - "SAP-icons-TNT"resolves to "tnt"
     * - "BusinessSuiteInAppSymbols" resolves to "business-suite"
     * - "horizon" resolves to "SAP-icons-v5"
     *
     * @param { string } collectionName
     * @return { string } the normalized collection name
     */
    const getIconCollectionByAlias = (collectionName) => {
        if (IconCollectionsAlias[collectionName]) {
            return IconCollectionsAlias[collectionName];
        }
        return collectionName;
    };

    var RegisteredIconCollection;
    (function (RegisteredIconCollection) {
        RegisteredIconCollection["SAPIconsV4"] = "SAP-icons-v4";
        RegisteredIconCollection["SAPIconsV5"] = "SAP-icons-v5";
        RegisteredIconCollection["SAPIconsTNTV2"] = "tnt-v2";
        RegisteredIconCollection["SAPIconsTNTV3"] = "tnt-v3";
        RegisteredIconCollection["SAPBSIconsV1"] = "business-suite-v1";
        RegisteredIconCollection["SAPBSIconsV2"] = "business-suite-v2";
    })(RegisteredIconCollection || (RegisteredIconCollection = {}));
    const iconCollections = new Map();
    iconCollections.set("SAP-icons", {
        "legacy": RegisteredIconCollection.SAPIconsV4,
        "sap_horizon": RegisteredIconCollection.SAPIconsV5,
    });
    iconCollections.set("tnt", {
        "legacy": RegisteredIconCollection.SAPIconsTNTV2,
        "sap_horizon": RegisteredIconCollection.SAPIconsTNTV3,
    });
    iconCollections.set("business-suite", {
        "legacy": RegisteredIconCollection.SAPBSIconsV1,
        "sap_horizon": RegisteredIconCollection.SAPBSIconsV2,
    });
    /**
     * Registers collection version per theme.
     * **For exmaple:** registerIconCollectionForTheme("my-custom-icons", {"sap_horizon": "my-custom-icons-v5"})
     * @param { string } collectionName
     * @param { ThemeToCollectionMap } themeCollectionMap
     */
    const registerIconCollectionForTheme = (collectionName, themeCollectionMap) => {
        if (iconCollections.has(collectionName)) {
            iconCollections.set(collectionName, { ...themeCollectionMap, ...iconCollections.get(collectionName) });
            return;
        }
        iconCollections.set(collectionName, themeCollectionMap);
    };
    const getIconCollectionForTheme = (collectionName) => {
        const themeFamily = isLegacyThemeFamily() ? "legacy" : "sap_horizon";
        return iconCollections.has(collectionName) ? iconCollections.get(collectionName)[themeFamily] : collectionName;
    };

    const IconCollectionConfiguration = new Map();
    /**
     * Returns the configured default icon collection for a given theme.
     *
     * @param { string } theme
     * @public
     * @returns { string | undefined }
     */
    const getDefaultIconCollection = (theme) => {
        return IconCollectionConfiguration.get(theme);
    };

    /**
     * Returns the effective theme dependant icon collection:
     *
     * - "no collection" resolves to "SAP-icons-v4" in "Quartz" and to "SAP-icons-v5" in "Horizon"
     * - "tnt" (and its alias "SAP-icons-TNT") resolves to "tnt-v2" in "Quartz" and resolves to "tnt-v3" in "Horizon"
     * - "business-suite" (and its alias "BusinessSuiteInAppSymbols") resolves to "business-suite-v1" in "Quartz" and resolves to "business-suite-v2" in "Horizon"
     *
     * @param { IconCollection } collectionName
     * @returns { IconCollection } the effective collection name
     */
    const getEffectiveIconCollection = (collectionName) => {
        const defaultIconCollection = getDefaultIconCollection(getTheme());
        // no collection + default collection, configured via setDefaultIconCollection - return the configured icon collection.
        if (!collectionName && defaultIconCollection) {
            return getIconCollectionByAlias(defaultIconCollection);
        }
        // no collection - return "SAP-icons-v4" or  "SAP-icons-v5".
        if (!collectionName) {
            return getIconCollectionForTheme("SAP-icons");
        }
        // has collection - return "SAP-icons-v4", "SAP-icons-v5", "tnt-v1", "tnt-v2", "business-suite-v1", "business-suite-v2", or custom ones.
        return getIconCollectionForTheme(collectionName);
    };

    const DEFAULT_THEME_FAMILY = "legacy"; // includes sap_fiori_*
    const loaders = new Map();
    const registry = getSharedResource("SVGIcons.registry", new Map());
    const iconCollectionPromises = getSharedResource("SVGIcons.promises", new Map());
    const ICON_NOT_FOUND$1 = "ICON_NOT_FOUND";
    const _loadIconCollectionOnce = async (collectionName) => {
        if (!iconCollectionPromises.has(collectionName)) {
            if (!loaders.has(collectionName)) {
                throw new Error(`No loader registered for the ${collectionName} icons collection. Probably you forgot to import the "AllIcons.js" module for the respective package.`);
            }
            const loadIcons = loaders.get(collectionName);
            iconCollectionPromises.set(collectionName, loadIcons(collectionName));
        }
        return iconCollectionPromises.get(collectionName);
    };
    const _fillRegistry = (bundleData) => {
        Object.keys(bundleData.data).forEach(iconName => {
            const iconData = bundleData.data[iconName];
            registerIcon(iconName, {
                pathData: (iconData.path || iconData.paths),
                ltr: iconData.ltr,
                accData: iconData.acc,
                collection: bundleData.collection,
                packageName: bundleData.packageName,
            });
        });
    };
    // set
    const registerIcon = (name, iconData) => {
        const key = `${iconData.collection}/${name}`;
        registry.set(key, {
            pathData: iconData.pathData,
            ltr: iconData.ltr,
            accData: iconData.accData,
            packageName: iconData.packageName,
            customTemplate: iconData.customTemplate,
            viewBox: iconData.viewBox,
            collection: iconData.collection,
        });
    };
    /**
     * Processes the full icon name and splits it into - "name", "collection".
     * - removes legacy protocol ("sap-icon://")
     * - resolves aliases (f.e "SAP-icons-TNT/actor" => "tnt/actor")
     *
     * @param { string } name
     * @return { object }
     */
    const processName = (name) => {
        // silently support ui5-compatible URIs
        if (name.startsWith("sap-icon://")) {
            name = name.replace("sap-icon://", "");
        }
        let collection;
        [name, collection] = name.split("/").reverse();
        name = name.replace("icon-", "");
        if (collection) {
            collection = getIconCollectionByAlias(collection);
        }
        return { name, collection };
    };
    const getIconDataSync = (iconName) => {
        const { name, collection } = processName(iconName);
        return getRegisteredIconData(collection, name);
    };
    const getIconData = async (iconName) => {
        const { name, collection } = processName(iconName);
        let iconData = ICON_NOT_FOUND$1;
        try {
            iconData = (await _loadIconCollectionOnce(getEffectiveIconCollection(collection)));
        }
        catch (error) {
            const e = error;
            console.error(e.message); /* eslint-disable-line */
        }
        if (iconData === ICON_NOT_FOUND$1) {
            return iconData;
        }
        const registeredIconData = getRegisteredIconData(collection, name);
        if (registeredIconData) {
            return registeredIconData;
        }
        // not filled by another await. many getters will await on the same loader, but fill only once
        if (Array.isArray(iconData)) {
            iconData.forEach(data => {
                _fillRegistry(data);
                registerIconCollectionForTheme(collection, { [data.themeFamily || DEFAULT_THEME_FAMILY]: data.collection });
            });
        }
        else {
            _fillRegistry(iconData);
        }
        return getRegisteredIconData(collection, name);
    };
    const getRegisteredIconData = (collection, name) => {
        const registryKey = `${getEffectiveIconCollection(collection)}/${name}`;
        return registry.get(registryKey);
    };
    /**
     * Returns the accessible name for the given icon,
     * or undefined if accessible name is not present.
     *
     * @param { string } name
     * @return { Promise }
     */
    const getIconAccessibleName = async (name) => {
        if (!name) {
            return;
        }
        let iconData = getIconDataSync(name);
        if (!iconData) {
            iconData = await getIconData(name);
        }
        if (iconData && iconData !== ICON_NOT_FOUND$1 && iconData.accData) {
            const i18nBundle = await getI18nBundle(iconData.packageName);
            return i18nBundle.getText(iconData.accData);
        }
    };

    const name$1 = "slim-arrow-right";
    const pathData$1 = "M357.5 233q10 10 10 23t-10 23l-165 165q-6 5-12 5-5 0-11-5-5-6-5-11 0-6 5-12l160-159q3-3 3-6t-3-6l-159-159q-5-5-5-11t5-11 11-5 11 5z";
    const ltr$1 = false;
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    registerIcon(name$1, { pathData: pathData$1, ltr: ltr$1, collection: collection$1, packageName: packageName$1 });

    const name = "slim-arrow-right";
    const pathData = "M186 416q-11 0-18.5-7.5T160 390q0-10 8-18l121-116-121-116q-8-8-8-18 0-11 7.5-18.5T186 96q10 0 17 7l141 134q8 8 8 19t-8 19L203 409q-7 7-17 7z";
    const ltr = false;
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    registerIcon(name, { pathData, ltr, collection, packageName });

    const getEffectiveAriaLabelText = (el) => {
        const accessibleEl = el;
        if (!accessibleEl.accessibleNameRef) {
            if (accessibleEl.accessibleName) {
                return accessibleEl.accessibleName;
            }
            return undefined;
        }
        return getAllAccessibleNameRefTexts(el);
    };
    /**
     *
     * @param {HTMLElement} el Defines the HTMLElement, for which you need to get all related texts
     */
    const getAllAccessibleNameRefTexts = (el) => {
        const ids = el.accessibleNameRef?.split(" ") ?? [];
        const owner = el.getRootNode();
        let result = "";
        ids.forEach((elementId, index) => {
            const element = owner.querySelector(`[id='${elementId}']`);
            const text = `${element && element.textContent ? element.textContent : ""}`;
            if (text) {
                result += text;
                if (index < ids.length - 1) {
                    result += " ";
                }
            }
        });
        return result;
    };

    const markedEvents = new WeakMap();
    /**
     * Marks the given event with random marker.
     */
    const markEvent = (event, value) => {
        markedEvents.set(event, value);
    };

    const isSSR = typeof document === "undefined";
    const internals = {
        get userAgent() {
            if (isSSR) {
                return "";
            }
            return navigator.userAgent;
        },
        get touch() {
            if (isSSR) {
                return false;
            }
            return "ontouchstart" in window || navigator.maxTouchPoints > 0;
        },
        get chrome() {
            if (isSSR) {
                return false;
            }
            return /(Chrome|CriOS)/.test(internals.userAgent);
        },
        get firefox() {
            if (isSSR) {
                return false;
            }
            return /Firefox/.test(internals.userAgent);
        },
        get safari() {
            if (isSSR) {
                return false;
            }
            return !internals.chrome && /(Version|PhantomJS)\/(\d+\.\d+).*Safari/.test(internals.userAgent);
        },
        get webkit() {
            if (isSSR) {
                return false;
            }
            return /webkit/.test(internals.userAgent);
        },
        get windows() {
            if (isSSR) {
                return false;
            }
            return navigator.platform.indexOf("Win") !== -1;
        },
        get macOS() {
            if (isSSR) {
                return false;
            }
            return !!navigator.userAgent.match(/Macintosh|Mac OS X/i);
        },
        get iOS() {
            if (isSSR) {
                return false;
            }
            return !!(navigator.platform.match(/iPhone|iPad|iPod/)) || !!(internals.userAgent.match(/Mac/) && "ontouchend" in document);
        },
        get android() {
            if (isSSR) {
                return false;
            }
            return !internals.windows && /Android/.test(internals.userAgent);
        },
        get androidPhone() {
            if (isSSR) {
                return false;
            }
            return internals.android && /(?=android)(?=.*mobile)/i.test(internals.userAgent);
        },
        get ipad() {
            if (isSSR) {
                return false;
            }
            // With iOS 13 the string 'iPad' was removed from the user agent string through a browser setting, which is applied on all sites by default:
            // "Request Desktop Website -> All websites" (for more infos see: https://forums.developer.apple.com/thread/119186).
            // Therefore the OS is detected as MACINTOSH instead of iOS and the device is a tablet if the Device.support.touch is true.
            return /ipad/i.test(internals.userAgent) || (/Macintosh/i.test(internals.userAgent) && "ontouchend" in document);
        },
    };
    let windowsVersion;
    let webkitVersion;
    let tablet;
    const isWindows8OrAbove = () => {
        if (isSSR) {
            return false;
        }
        if (!internals.windows) {
            return false;
        }
        if (windowsVersion === undefined) {
            const matches = internals.userAgent.match(/Windows NT (\d+).(\d)/);
            windowsVersion = matches ? parseFloat(matches[1]) : 0;
        }
        return windowsVersion >= 8;
    };
    const isWebkit537OrAbove = () => {
        if (isSSR) {
            return false;
        }
        if (!internals.webkit) {
            return false;
        }
        if (webkitVersion === undefined) {
            const matches = internals.userAgent.match(/(webkit)[ /]([\w.]+)/);
            webkitVersion = matches ? parseFloat(matches[1]) : 0;
        }
        return webkitVersion >= 537.10;
    };
    const detectTablet = () => {
        if (isSSR) {
            return false;
        }
        if (tablet !== undefined) {
            return;
        }
        if (internals.ipad) {
            tablet = true;
            return;
        }
        if (internals.touch) {
            if (isWindows8OrAbove()) {
                tablet = true;
                return;
            }
            if (internals.chrome && internals.android) {
                tablet = !/Mobile Safari\/[.0-9]+/.test(internals.userAgent);
                return;
            }
            let densityFactor = window.devicePixelRatio ? window.devicePixelRatio : 1; // may be undefined in Windows Phone devices
            if (internals.android && isWebkit537OrAbove()) {
                densityFactor = 1;
            }
            tablet = (Math.min(window.screen.width / densityFactor, window.screen.height / densityFactor) >= 600);
            return;
        }
        tablet = internals.userAgent.indexOf("Touch") !== -1 || (internals.android && !internals.androidPhone);
    };
    const isSafari = () => internals.safari;
    const isTablet = () => {
        detectTablet();
        return (internals.touch || isWindows8OrAbove()) && tablet;
    };
    const isPhone = () => {
        detectTablet();
        return internals.touch && !tablet;
    };
    const isDesktop = () => {
        if (isSSR) {
            return false;
        }
        return (!isTablet() && !isPhone()) || isWindows8OrAbove();
    };

    const willShowContent = (childNodes) => {
        return Array.from(childNodes).filter(node => {
            return node.nodeType !== Node.COMMENT_NODE && (node.nodeType !== Node.TEXT_NODE || (node.nodeValue || "").trim().length !== 0);
        }).length > 0;
    };

    /**
     * Different Button designs.
     * @public
     */
    var ButtonDesign;
    (function (ButtonDesign) {
        /**
         * default type (no special styling)
         * @public
         */
        ButtonDesign["Default"] = "Default";
        /**
         * accept type (green button)
         * @public
         */
        ButtonDesign["Positive"] = "Positive";
        /**
         * reject style (red button)
         * @public
         */
        ButtonDesign["Negative"] = "Negative";
        /**
         * transparent type
         * @public
         */
        ButtonDesign["Transparent"] = "Transparent";
        /**
         * emphasized type
         * @public
         */
        ButtonDesign["Emphasized"] = "Emphasized";
        /**
         * attention type
         * @public
         */
        ButtonDesign["Attention"] = "Attention";
    })(ButtonDesign || (ButtonDesign = {}));
    var ButtonDesign$1 = ButtonDesign;

    /**
     * Determines if the button has special form-related functionality.
     * @public
     */
    var ButtonType;
    (function (ButtonType) {
        /**
         * The button does not do anything special when inside a form
         * @public
         */
        ButtonType["Button"] = "Button";
        /**
         * The button acts as a submit button (submits a form)
         * @public
         */
        ButtonType["Submit"] = "Submit";
        /**
         * The button acts as a reset button (resets a form)
         * @public
         */
        ButtonType["Reset"] = "Reset";
    })(ButtonType || (ButtonType = {}));
    var ButtonType$1 = ButtonType;

    /* eslint no-unused-vars: 0 */
    function block0$2(context, tags, suffix) { return effectiveHtml `<button type="button" class="ui5-button-root" ?disabled="${this.disabled}" data-sap-focus-ref  @focusout=${this._onfocusout} @focusin=${this._onfocusin} @click=${this._onclick} @mousedown=${this._onmousedown} @mouseup=${this._onmouseup} @keydown=${this._onkeydown} @keyup=${this._onkeyup} @touchstart="${this._ontouchstart}" @touchend="${this._ontouchend}" tabindex=${l(this.tabIndexValue)} aria-expanded="${l(this.accessibilityAttributes.expanded)}" aria-controls="${l(this.accessibilityAttributes.controls)}" aria-haspopup="${l(this._hasPopup)}" aria-label="${l(this.ariaLabelText)}" aria-describedby="${l(this.ariaDescribedbyText)}" title="${l(this.buttonTitle)}" part="button" role="${l(this.effectiveAccRole)}">${this.icon ? block1$2.call(this, context, tags, suffix) : undefined}<span id="${l(this._id)}-content" class="ui5-button-text"><bdi><slot></slot></bdi></span>${this.endIcon ? block2$2.call(this, context, tags, suffix) : undefined}${this.hasButtonType ? block3$2.call(this, context, tags, suffix) : undefined}</button> `; }
    function block1$2(context, tags, suffix) { return suffix ? effectiveHtml `<${scopeTag("ui5-icon", tags, suffix)} class="ui5-button-icon" name="${l(this.icon)}" mode="${l(this.iconMode)}" part="icon" ?show-tooltip=${this.showIconTooltip}></${scopeTag("ui5-icon", tags, suffix)}>` : effectiveHtml `<ui5-icon class="ui5-button-icon" name="${l(this.icon)}" mode="${l(this.iconMode)}" part="icon" ?show-tooltip=${this.showIconTooltip}></ui5-icon>`; }
    function block2$2(context, tags, suffix) { return suffix ? effectiveHtml `<${scopeTag("ui5-icon", tags, suffix)} class="ui5-button-end-icon" name="${l(this.endIcon)}" mode="${l(this.endIconMode)}" part="endIcon"></${scopeTag("ui5-icon", tags, suffix)}>` : effectiveHtml `<ui5-icon class="ui5-button-end-icon" name="${l(this.endIcon)}" mode="${l(this.endIconMode)}" part="endIcon"></ui5-icon>`; }
    function block3$2(context, tags, suffix) { return effectiveHtml `<span id="ui5-button-hiddenText-type" aria-hidden="true" class="ui5-hidden-text">${l(this.buttonTypeText)}</span>`; }

    /* eslint no-unused-vars: 0 */
    function block0$1(context, tags, suffix) { return effectiveHtml `<svg class="ui5-icon-root" part="root" tabindex="${l(this._tabIndex)}" dir="${l(this._dir)}" viewBox="${l(this.viewBox)}" role="${l(this.effectiveAccessibleRole)}" focusable="false" preserveAspectRatio="xMidYMid meet" aria-label="${l(this.effectiveAccessibleName)}" aria-hidden=${l(this.effectiveAriaHidden)} xmlns="http://www.w3.org/2000/svg" @keydown=${this._onkeydown} @keyup=${this._onkeyup}>${blockSVG1.call(this, context, tags, suffix)}</svg>`; }
    function block1$1(context, tags, suffix) { return effectiveSvg `<title id="${l(this._id)}-tooltip">${l(this.effectiveAccessibleName)}</title>`; }
    function block2$1(context, tags, suffix) { return effectiveSvg `${l(this.customSvg)}`; }
    function block3$1(context, tags, suffix, item, index) { return effectiveSvg `<path d="${l(item)}"></path>`; }
    function blockSVG1(context, tags, suffix) {
        return effectiveSvg `${this.hasIconTooltip ? block1$1.call(this, context, tags, suffix) : undefined}<g role="presentation">${this.customSvg ? block2$1.call(this, context, tags, suffix) : undefined}${c(this.pathData, (item, index) => item._id || index, (item, index) => block3$1.call(this, context, tags, suffix, item, index))}</g>`;
    }

    /**
     * Different Icon modes.
     * @public
     * @since 2.0.0
     */
    var IconMode;
    (function (IconMode) {
        /**
         * Image mode (by default).
         * Configures the component to internally render role="img".
         * @public
         */
        IconMode["Image"] = "Image";
        /**
         * Decorative mode.
         * Configures the component to internally render role="presentation" and aria-hidden="true",
         * making it purely decorative without semantic content or interactivity.
         * @public
         */
        IconMode["Decorative"] = "Decorative";
        /**
         * Interactive mode.
         * Configures the component to internally render role="button".
         * This mode also supports focus and press handling to enhance interactivity.
         * @public
        */
        IconMode["Interactive"] = "Interactive";
    })(IconMode || (IconMode = {}));
    var IconMode$1 = IconMode;

    const styleData$4 = { packageName: "@ui5/webcomponents-theming", fileName: "themes/sap_horizon/parameters-bundle.css.ts", content: `:root{--sapThemeMetaData-Base-baseLib:{"Path": "Base.baseLib.sap_horizon.css_variables","PathPattern": "/%frameworkId%/%libId%/%themeId%/%fileId%.css","Extends": ["baseTheme"],"Tags": ["Fiori_3","LightColorScheme"],"FallbackThemeId": "sap_fiori_3","Engine":{"Name": "theming-engine","Version": "14.0.2"},"Version":{"Build": "11.17.1.20240715084505","Source": "11.17.1"}};--sapBrandColor: #0070f2;--sapHighlightColor: #0064d9;--sapBaseColor: #fff;--sapShellColor: #fff;--sapBackgroundColor: #f5f6f7;--sapFontFamily: "72", "72full", Arial, Helvetica, sans-serif;--sapFontSize: .875rem;--sapTextColor: #1d2d3e;--sapLinkColor: #0064d9;--sapCompanyLogo: none;--sapBackgroundImage: none;--sapBackgroundImageOpacity: 1;--sapBackgroundImageRepeat: false;--sapSelectedColor: #0064d9;--sapHoverColor: #eaecee;--sapActiveColor: #dee2e5;--sapHighlightTextColor: #fff;--sapTitleColor: #1d2d3e;--sapNegativeColor: #aa0808;--sapCriticalColor: #e76500;--sapPositiveColor: #256f3a;--sapInformativeColor: #0070f2;--sapNeutralColor: #788fa6;--sapNegativeElementColor: #f53232;--sapCriticalElementColor: #e76500;--sapPositiveElementColor: #30914c;--sapInformativeElementColor: #0070f2;--sapNeutralElementColor: #788fa6;--sapNegativeTextColor: #aa0808;--sapCriticalTextColor: #b44f00;--sapPositiveTextColor: #256f3a;--sapInformativeTextColor: #0064d9;--sapNeutralTextColor: #1d2d3e;--sapErrorColor: #aa0808;--sapWarningColor: #e76500;--sapSuccessColor: #256f3a;--sapInformationColor: #0070f2;--sapErrorBackground: #ffeaf4;--sapWarningBackground: #fff8d6;--sapSuccessBackground: #f5fae5;--sapInformationBackground: #e1f4ff;--sapNeutralBackground: #eff1f2;--sapErrorBorderColor: #e90b0b;--sapWarningBorderColor: #dd6100;--sapSuccessBorderColor: #30914c;--sapInformationBorderColor: #0070f2;--sapNeutralBorderColor: #788fa6;--sapElement_LineHeight: 2.75rem;--sapElement_Height: 2.25rem;--sapElement_BorderWidth: .0625rem;--sapElement_BorderCornerRadius: .75rem;--sapElement_Compact_LineHeight: 2rem;--sapElement_Compact_Height: 1.625rem;--sapElement_Condensed_LineHeight: 1.5rem;--sapElement_Condensed_Height: 1.375rem;--sapContent_LineHeight: 1.5;--sapContent_IconHeight: 1rem;--sapContent_IconColor: #1d2d3e;--sapContent_ContrastIconColor: #fff;--sapContent_NonInteractiveIconColor: #758ca4;--sapContent_MarkerIconColor: #5d36ff;--sapContent_MarkerTextColor: #046c7a;--sapContent_MeasureIndicatorColor: #556b81;--sapContent_Selected_MeasureIndicatorColor: #0064d9;--sapContent_Placeholderloading_Background: #ccc;--sapContent_Placeholderloading_Gradient: linear-gradient(to right, #ccc 0%, #ccc 20%, #999 50%, #ccc 80%, #ccc 100%);--sapContent_ImagePlaceholderBackground: #eaecee;--sapContent_ImagePlaceholderForegroundColor: #5b738b;--sapContent_RatedColor: #d27700;--sapContent_UnratedColor: #758ca4;--sapContent_BusyColor: #0064d9;--sapContent_FocusColor: #0032a5;--sapContent_FocusStyle: solid;--sapContent_FocusWidth: .125rem;--sapContent_ContrastFocusColor: #fff;--sapContent_ShadowColor: #223548;--sapContent_ContrastShadowColor: #fff;--sapContent_Shadow0: 0 0 .125rem 0 rgba(34,53,72,.2), 0 .125rem .25rem 0 rgba(34,53,72,.2);--sapContent_Shadow1: 0 0 0 .0625rem rgba(34,53,72,.48), 0 .125rem .5rem 0 rgba(34,53,72,.3);--sapContent_Shadow2: 0 0 0 .0625rem rgba(34,53,72,.48), 0 .625rem 1.875rem 0 rgba(34,53,72,.25);--sapContent_Shadow3: 0 0 0 .0625rem rgba(34,53,72,.48), 0 1.25rem 5rem 0 rgba(34,53,72,.25);--sapContent_TextShadow: 0 0 .125rem #fff;--sapContent_ContrastTextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapContent_HeaderShadow: 0 .125rem .125rem 0 rgba(34,53,72,.05), inset 0 -.0625rem 0 0 #d9d9d9;--sapContent_Interaction_Shadow: inset 0 0 0 .0625rem rgba(85,107,129,.25);--sapContent_Selected_Shadow: inset 0 0 0 .0625rem rgba(79,160,255,.5);--sapContent_Negative_Shadow: inset 0 0 0 .0625rem rgba(255,142,196,.45);--sapContent_Critical_Shadow: inset 0 0 0 .0625rem rgba(255,213,10,.4);--sapContent_Positive_Shadow: inset 0 0 0 .0625rem rgba(48,145,76,.18);--sapContent_Informative_Shadow: inset 0 0 0 .0625rem rgba(104,174,255,.5);--sapContent_Neutral_Shadow: inset 0 0 0 .0625rem rgba(120,143,166,.3);--sapContent_SearchHighlightColor: #dafdf5;--sapContent_HelpColor: #188918;--sapContent_LabelColor: #556b82;--sapContent_MonospaceFontFamily: "72Mono", "72Monofull", lucida console, monospace;--sapContent_MonospaceBoldFontFamily: "72Mono-Bold", "72Mono-Boldfull", lucida console, monospace;--sapContent_IconFontFamily: "SAP-icons";--sapContent_DisabledTextColor: rgba(29,45,62,.6);--sapContent_DisabledOpacity: .4;--sapContent_ContrastTextThreshold: .65;--sapContent_ContrastTextColor: #fff;--sapContent_ForegroundColor: #efefef;--sapContent_ForegroundBorderColor: #758ca4;--sapContent_ForegroundTextColor: #1d2d3e;--sapContent_BadgeBackground: #aa0808;--sapContent_BadgeTextColor: #fff;--sapContent_DragAndDropActiveColor: #0064d9;--sapContent_Selected_TextColor: #0064d9;--sapContent_Selected_Background: #fff;--sapContent_Selected_Hover_Background: #e3f0ff;--sapContent_Selected_ForegroundColor: #0064d9;--sapContent_ForcedColorAdjust: none;--sapContent_Illustrative_Color1: #5d36ff;--sapContent_Illustrative_Color2: #0070f2;--sapContent_Illustrative_Color3: #f58b00;--sapContent_Illustrative_Color4: #00144a;--sapContent_Illustrative_Color5: #a9b4be;--sapContent_Illustrative_Color6: #d5dadd;--sapContent_Illustrative_Color7: #ebf8ff;--sapContent_Illustrative_Color8: #fff;--sapContent_Illustrative_Color9: #64edd2;--sapContent_Illustrative_Color10: #ebf8ff;--sapContent_Illustrative_Color11: #f31ded;--sapContent_Illustrative_Color12: #00a800;--sapContent_Illustrative_Color13: #005dc9;--sapContent_Illustrative_Color14: #004da5;--sapContent_Illustrative_Color15: #cc7400;--sapContent_Illustrative_Color16: #3b0ac6;--sapContent_Illustrative_Color17: #00a58a;--sapContent_Illustrative_Color18: #d1efff;--sapContent_Illustrative_Color19: #b8e6ff;--sapContent_Illustrative_Color20: #9eddff;--sapFontLightFamily: "72-Light", "72-Lightfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontBoldFamily: "72-Bold", "72-Boldfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontSemiboldFamily: "72-Semibold", "72-Semiboldfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontSemiboldDuplexFamily: "72-SemiboldDuplex", "72-SemiboldDuplexfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontBlackFamily: "72Black", "72Blackfull","72", "72full", Arial, Helvetica, sans-serif;--sapFontHeaderFamily: "72-Bold", "72-Boldfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontSmallSize: .75rem;--sapFontLargeSize: 1rem;--sapFontHeader1Size: 3rem;--sapFontHeader2Size: 2rem;--sapFontHeader3Size: 1.5rem;--sapFontHeader4Size: 1.25rem;--sapFontHeader5Size: 1rem;--sapFontHeader6Size: .875rem;--sapLink_TextDecoration: none;--sapLink_Hover_Color: #0064d9;--sapLink_Hover_TextDecoration: underline;--sapLink_Active_Color: #0064d9;--sapLink_Active_TextDecoration: none;--sapLink_Visited_Color: #0064d9;--sapLink_InvertedColor: #a6cfff;--sapLink_SubtleColor: #1d2d3e;--sapShell_Background: #eff1f2;--sapShell_BackgroundImage: linear-gradient(to bottom, #eff1f2, #eff1f2);--sapShell_BackgroundImageOpacity: 1;--sapShell_BackgroundImageRepeat: false;--sapShell_BorderColor: #fff;--sapShell_TextColor: #1d2d3e;--sapShell_InteractiveBackground: #eff1f2;--sapShell_InteractiveTextColor: #1d2d3e;--sapShell_InteractiveBorderColor: #556b81;--sapShell_GroupTitleTextColor: #1d2d3e;--sapShell_GroupTitleTextShadow: 0 0 .125rem #fff;--sapShell_Hover_Background: #fff;--sapShell_Active_Background: #fff;--sapShell_Active_TextColor: #0070f2;--sapShell_Selected_Background: #fff;--sapShell_Selected_TextColor: #0070f2;--sapShell_Selected_Hover_Background: #fff;--sapShell_Favicon: none;--sapShell_Navigation_Background: #fff;--sapShell_Navigation_Hover_Background: #fff;--sapShell_Navigation_SelectedColor: #0064d9;--sapShell_Navigation_Selected_TextColor: #0064d9;--sapShell_Navigation_TextColor: #1d2d3e;--sapShell_Navigation_Active_TextColor: #0064d9;--sapShell_Navigation_Active_Background: #fff;--sapShell_Shadow: 0 .125rem .125rem 0 rgba(34,53,72,.15), inset 0 -.0625rem 0 0 rgba(34,53,72,.2);--sapShell_NegativeColor: #aa0808;--sapShell_CriticalColor: #b44f00;--sapShell_PositiveColor: #256f3a;--sapShell_InformativeColor: #0064d9;--sapShell_NeutralColor: #1d2d3e;--sapShell_Assistant_ForegroundColor: #5d36ff;--sapShell_Category_1_Background: #0057d2;--sapShell_Category_1_BorderColor: #0057d2;--sapShell_Category_1_TextColor: #fff;--sapShell_Category_1_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_2_Background: #df1278;--sapShell_Category_2_BorderColor: #df1278;--sapShell_Category_2_TextColor: #fff;--sapShell_Category_2_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_3_Background: #e76500;--sapShell_Category_3_BorderColor: #e76500;--sapShell_Category_3_TextColor: #fff;--sapShell_Category_3_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_4_Background: #7800a4;--sapShell_Category_4_BorderColor: #7800a4;--sapShell_Category_4_TextColor: #fff;--sapShell_Category_4_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_5_Background: #aa2608;--sapShell_Category_5_BorderColor: #aa2608;--sapShell_Category_5_TextColor: #fff;--sapShell_Category_5_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_6_Background: #07838f;--sapShell_Category_6_BorderColor: #07838f;--sapShell_Category_6_TextColor: #fff;--sapShell_Category_6_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_7_Background: #f31ded;--sapShell_Category_7_BorderColor: #f31ded;--sapShell_Category_7_TextColor: #fff;--sapShell_Category_7_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_8_Background: #188918;--sapShell_Category_8_BorderColor: #188918;--sapShell_Category_8_TextColor: #fff;--sapShell_Category_8_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_9_Background: #002a86;--sapShell_Category_9_BorderColor: #002a86;--sapShell_Category_9_TextColor: #fff;--sapShell_Category_9_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_10_Background: #5b738b;--sapShell_Category_10_BorderColor: #5b738b;--sapShell_Category_10_TextColor: #fff;--sapShell_Category_10_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_11_Background: #d20a0a;--sapShell_Category_11_BorderColor: #d20a0a;--sapShell_Category_11_TextColor: #fff;--sapShell_Category_11_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_12_Background: #7858ff;--sapShell_Category_12_BorderColor: #7858ff;--sapShell_Category_12_TextColor: #fff;--sapShell_Category_12_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_13_Background: #a00875;--sapShell_Category_13_BorderColor: #a00875;--sapShell_Category_13_TextColor: #fff;--sapShell_Category_13_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_14_Background: #14565b;--sapShell_Category_14_BorderColor: #14565b;--sapShell_Category_14_TextColor: #fff;--sapShell_Category_14_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_15_Background: #223548;--sapShell_Category_15_BorderColor: #223548;--sapShell_Category_15_TextColor: #fff;--sapShell_Category_15_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_16_Background: #1e592f;--sapShell_Category_16_BorderColor: #1e592f;--sapShell_Category_16_TextColor: #fff;--sapShell_Category_16_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapAssistant_Color1: #5d36ff;--sapAssistant_Color2: #a100c2;--sapAssistant_BackgroundGradient: linear-gradient(#5d36ff, #a100c2);--sapAssistant_Background: #5d36ff;--sapAssistant_BorderColor: #5d36ff;--sapAssistant_TextColor: #fff;--sapAssistant_Hover_Background: #2800cf;--sapAssistant_Hover_BorderColor: #2800cf;--sapAssistant_Hover_TextColor: #fff;--sapAssistant_Active_Background: #fff;--sapAssistant_Active_BorderColor: #5d36ff;--sapAssistant_Active_TextColor: #5d36ff;--sapAssistant_Question_Background: #eae5ff;--sapAssistant_Question_BorderColor: #eae5ff;--sapAssistant_Question_TextColor: #1d2d3e;--sapAssistant_Answer_Background: #eff1f2;--sapAssistant_Answer_BorderColor: #eff1f2;--sapAssistant_Answer_TextColor: #1d2d3e;--sapAvatar_1_Background: #fff3b8;--sapAvatar_1_BorderColor: #fff3b8;--sapAvatar_1_TextColor: #a45d00;--sapAvatar_2_Background: #ffd0e7;--sapAvatar_2_BorderColor: #ffd0e7;--sapAvatar_2_TextColor: #aa0808;--sapAvatar_3_Background: #ffdbe7;--sapAvatar_3_BorderColor: #ffdbe7;--sapAvatar_3_TextColor: #ba066c;--sapAvatar_4_Background: #ffdcf3;--sapAvatar_4_BorderColor: #ffdcf3;--sapAvatar_4_TextColor: #a100c2;--sapAvatar_5_Background: #ded3ff;--sapAvatar_5_BorderColor: #ded3ff;--sapAvatar_5_TextColor: #552cff;--sapAvatar_6_Background: #d1efff;--sapAvatar_6_BorderColor: #d1efff;--sapAvatar_6_TextColor: #0057d2;--sapAvatar_7_Background: #c2fcee;--sapAvatar_7_BorderColor: #c2fcee;--sapAvatar_7_TextColor: #046c7a;--sapAvatar_8_Background: #ebf5cb;--sapAvatar_8_BorderColor: #ebf5cb;--sapAvatar_8_TextColor: #256f3a;--sapAvatar_9_Background: #ddccf0;--sapAvatar_9_BorderColor: #ddccf0;--sapAvatar_9_TextColor: #6c32a9;--sapAvatar_10_Background: #eaecee;--sapAvatar_10_BorderColor: #eaecee;--sapAvatar_10_TextColor: #556b82;--sapButton_Background: #fff;--sapButton_BorderColor: #bcc3ca;--sapButton_BorderWidth: .0625rem;--sapButton_BorderCornerRadius: .5rem;--sapButton_TextColor: #0064d9;--sapButton_Hover_Background: #eaecee;--sapButton_Hover_BorderColor: #bcc3ca;--sapButton_Hover_TextColor: #0064d9;--sapButton_IconColor: #0064d9;--sapButton_Active_Background: #fff;--sapButton_Active_BorderColor: #0064d9;--sapButton_Active_TextColor: #0064d9;--sapButton_Emphasized_Background: #0070f2;--sapButton_Emphasized_BorderColor: #0070f2;--sapButton_Emphasized_TextColor: #fff;--sapButton_Emphasized_Hover_Background: #0064d9;--sapButton_Emphasized_Hover_BorderColor: #0064d9;--sapButton_Emphasized_Hover_TextColor: #fff;--sapButton_Emphasized_Active_Background: #fff;--sapButton_Emphasized_Active_BorderColor: #0064d9;--sapButton_Emphasized_Active_TextColor: #0064d9;--sapButton_Emphasized_TextShadow: transparent;--sapButton_Emphasized_FontWeight: bold;--sapButton_Reject_Background: #ffd6e9;--sapButton_Reject_BorderColor: #ffc2de;--sapButton_Reject_TextColor: #aa0808;--sapButton_Reject_Hover_Background: #ffbddb;--sapButton_Reject_Hover_BorderColor: #ffbddb;--sapButton_Reject_Hover_TextColor: #aa0808;--sapButton_Reject_Active_Background: #fff;--sapButton_Reject_Active_BorderColor: #e90b0b;--sapButton_Reject_Active_TextColor: #aa0808;--sapButton_Reject_Selected_Background: #fff;--sapButton_Reject_Selected_BorderColor: #e90b0b;--sapButton_Reject_Selected_TextColor: #aa0808;--sapButton_Reject_Selected_Hover_Background: #ffbddb;--sapButton_Reject_Selected_Hover_BorderColor: #e90b0b;--sapButton_Accept_Background: #ebf5cb;--sapButton_Accept_BorderColor: #dbeda0;--sapButton_Accept_TextColor: #256f3a;--sapButton_Accept_Hover_Background: #e3f1b6;--sapButton_Accept_Hover_BorderColor: #e3f1b6;--sapButton_Accept_Hover_TextColor: #256f3a;--sapButton_Accept_Active_Background: #fff;--sapButton_Accept_Active_BorderColor: #30914c;--sapButton_Accept_Active_TextColor: #256f3a;--sapButton_Accept_Selected_Background: #fff;--sapButton_Accept_Selected_BorderColor: #30914c;--sapButton_Accept_Selected_TextColor: #256f3a;--sapButton_Accept_Selected_Hover_Background: #e3f1b6;--sapButton_Accept_Selected_Hover_BorderColor: #30914c;--sapButton_Lite_Background: transparent;--sapButton_Lite_BorderColor: transparent;--sapButton_Lite_TextColor: #0064d9;--sapButton_Lite_Hover_Background: #eaecee;--sapButton_Lite_Hover_BorderColor: #bcc3ca;--sapButton_Lite_Hover_TextColor: #0064d9;--sapButton_Lite_Active_Background: #fff;--sapButton_Lite_Active_BorderColor: #0064d9;--sapButton_Selected_Background: #edf6ff;--sapButton_Selected_BorderColor: #0064d9;--sapButton_Selected_TextColor: #0064d9;--sapButton_Selected_Hover_Background: #d9ecff;--sapButton_Selected_Hover_BorderColor: #0064d9;--sapButton_Attention_Background: #fff3b7;--sapButton_Attention_BorderColor: #ffeb84;--sapButton_Attention_TextColor: #b44f00;--sapButton_Attention_Hover_Background: #ffef9e;--sapButton_Attention_Hover_BorderColor: #ffef9e;--sapButton_Attention_Hover_TextColor: #b44f00;--sapButton_Attention_Active_Background: #fff;--sapButton_Attention_Active_BorderColor: #dd6100;--sapButton_Attention_Active_TextColor: #b44f00;--sapButton_Attention_Selected_Background: #fff;--sapButton_Attention_Selected_BorderColor: #dd6100;--sapButton_Attention_Selected_TextColor: #b44f00;--sapButton_Attention_Selected_Hover_Background: #ffef9e;--sapButton_Attention_Selected_Hover_BorderColor: #dd6100;--sapButton_Negative_Background: #f53232;--sapButton_Negative_BorderColor: #f53232;--sapButton_Negative_TextColor: #fff;--sapButton_Negative_Hover_Background: #e90b0b;--sapButton_Negative_Hover_BorderColor: #e90b0b;--sapButton_Negative_Hover_TextColor: #fff;--sapButton_Negative_Active_Background: #fff;--sapButton_Negative_Active_BorderColor: #f53232;--sapButton_Negative_Active_TextColor: #aa0808;--sapButton_Critical_Background: #e76500;--sapButton_Critical_BorderColor: #e76500;--sapButton_Critical_TextColor: #fff;--sapButton_Critical_Hover_Background: #dd6100;--sapButton_Critical_Hover_BorderColor: #dd6100;--sapButton_Critical_Hover_TextColor: #fff;--sapButton_Critical_Active_Background: #fff;--sapButton_Critical_Active_BorderColor: #dd6100;--sapButton_Critical_Active_TextColor: #b44f00;--sapButton_Success_Background: #30914c;--sapButton_Success_BorderColor: #30914c;--sapButton_Success_TextColor: #fff;--sapButton_Success_Hover_Background: #2c8646;--sapButton_Success_Hover_BorderColor: #2c8646;--sapButton_Success_Hover_TextColor: #fff;--sapButton_Success_Active_Background: #fff;--sapButton_Success_Active_BorderColor: #30914c;--sapButton_Success_Active_TextColor: #256f3a;--sapButton_Information_Background: #e8f3ff;--sapButton_Information_BorderColor: #b5d8ff;--sapButton_Information_TextColor: #0064d9;--sapButton_Information_Hover_Background: #d4e8ff;--sapButton_Information_Hover_BorderColor: #b5d8ff;--sapButton_Information_Hover_TextColor: #0064d9;--sapButton_Information_Active_Background: #fff;--sapButton_Information_Active_BorderColor: #0064d9;--sapButton_Information_Active_TextColor: #0064d9;--sapButton_Neutral_Background: #e8f3ff;--sapButton_Neutral_BorderColor: #b5d8ff;--sapButton_Neutral_TextColor: #0064d9;--sapButton_Neutral_Hover_Background: #d4e8ff;--sapButton_Neutral_Hover_BorderColor: #b5d8ff;--sapButton_Neutral_Hover_TextColor: #0064d9;--sapButton_Neutral_Active_Background: #fff;--sapButton_Neutral_Active_BorderColor: #0064d9;--sapButton_Neutral_Active_TextColor: #0064d9;--sapButton_Track_Background: #788fa6;--sapButton_Track_BorderColor: #788fa6;--sapButton_Track_TextColor: #fff;--sapButton_Track_Hover_Background: #637d97;--sapButton_Track_Hover_BorderColor: #637d97;--sapButton_Track_Selected_Background: #0064d9;--sapButton_Track_Selected_BorderColor: #0064d9;--sapButton_Track_Selected_TextColor: #fff;--sapButton_Track_Selected_Hover_Background: #0058c0;--sapButton_Track_Selected_Hover_BorderColor: #0058c0;--sapButton_Handle_Background: #fff;--sapButton_Handle_BorderColor: #fff;--sapButton_Handle_TextColor: #1d2d3e;--sapButton_Handle_Hover_Background: #fff;--sapButton_Handle_Hover_BorderColor: rgba(255,255,255,.5);--sapButton_Handle_Selected_Background: #edf6ff;--sapButton_Handle_Selected_BorderColor: #edf6ff;--sapButton_Handle_Selected_TextColor: #0064d9;--sapButton_Handle_Selected_Hover_Background: #edf6ff;--sapButton_Handle_Selected_Hover_BorderColor: rgba(237,246,255,.5);--sapButton_Track_Negative_Background: #f53232;--sapButton_Track_Negative_BorderColor: #f53232;--sapButton_Track_Negative_TextColor: #fff;--sapButton_Track_Negative_Hover_Background: #e90b0b;--sapButton_Track_Negative_Hover_BorderColor: #e90b0b;--sapButton_Handle_Negative_Background: #fff;--sapButton_Handle_Negative_BorderColor: #fff;--sapButton_Handle_Negative_TextColor: #aa0808;--sapButton_Handle_Negative_Hover_Background: #fff;--sapButton_Handle_Negative_Hover_BorderColor: rgba(255,255,255,.5);--sapButton_Track_Positive_Background: #30914c;--sapButton_Track_Positive_BorderColor: #30914c;--sapButton_Track_Positive_TextColor: #fff;--sapButton_Track_Positive_Hover_Background: #2c8646;--sapButton_Track_Positive_Hover_BorderColor: #2c8646;--sapButton_Handle_Positive_Background: #fff;--sapButton_Handle_Positive_BorderColor: #fff;--sapButton_Handle_Positive_TextColor: #256f3a;--sapButton_Handle_Positive_Hover_Background: #fff;--sapButton_Handle_Positive_Hover_BorderColor: rgba(255,255,255,.5);--sapButton_TokenBackground: #fff;--sapButton_TokenBorderColor: #bcc3ca;--sapField_Background: #fff;--sapField_BackgroundStyle: 0 100% / 100% .0625rem no-repeat linear-gradient(0deg, #556b81, #556b81) border-box;--sapField_TextColor: #131e29;--sapField_PlaceholderTextColor: #556b82;--sapField_BorderColor: #556b81;--sapField_HelpBackground: #fff;--sapField_BorderWidth: .0625rem;--sapField_BorderStyle: none;--sapField_BorderCornerRadius: .25rem;--sapField_Shadow: inset 0 0 0 .0625rem rgba(85,107,129,.25);--sapField_Hover_Background: #fff;--sapField_Hover_BackgroundStyle: 0 100% / 100% .0625rem no-repeat linear-gradient(0deg, #0064d9, #0064d9) border-box;--sapField_Hover_BorderColor: #0064d9;--sapField_Hover_HelpBackground: #fff;--sapField_Hover_Shadow: inset 0 0 0 .0625rem rgba(79,160,255,.5);--sapField_Hover_InvalidShadow: inset 0 0 0 .0625rem rgba(255,142,196,.45);--sapField_Hover_WarningShadow: inset 0 0 0 .0625rem rgba(255,213,10,.4);--sapField_Hover_SuccessShadow: inset 0 0 0 .0625rem rgba(48,145,76,.18);--sapField_Hover_InformationShadow: inset 0 0 0 .0625rem rgba(104,174,255,.5);--sapField_Active_BorderColor: #0064d9;--sapField_Focus_Background: #fff;--sapField_Focus_BorderColor: #0032a5;--sapField_Focus_HelpBackground: #fff;--sapField_ReadOnly_Background: #eaecee;--sapField_ReadOnly_BackgroundStyle: 0 100% / .375rem .0625rem repeat-x linear-gradient(90deg, #556b81 0, #556b81 .25rem, transparent .25rem) border-box;--sapField_ReadOnly_BorderColor: #556b81;--sapField_ReadOnly_BorderStyle: none;--sapField_ReadOnly_HelpBackground: #eaecee;--sapField_RequiredColor: #ba066c;--sapField_InvalidColor: #e90b0b;--sapField_InvalidBackground: #ffeaf4;--sapField_InvalidBackgroundStyle: 0 100% / 100% .125rem no-repeat linear-gradient(0deg, #e90b0b, #e90b0b) border-box;--sapField_InvalidBorderWidth: .125rem;--sapField_InvalidBorderStyle: none;--sapField_InvalidShadow: inset 0 0 0 .0625rem rgba(255,142,196,.45);--sapField_WarningColor: #dd6100;--sapField_WarningBackground: #fff8d6;--sapField_WarningBackgroundStyle: 0 100% / 100% .125rem no-repeat linear-gradient(0deg, #dd6100, #dd6100) border-box;--sapField_WarningBorderWidth: .125rem;--sapField_WarningBorderStyle: none;--sapField_WarningShadow: inset 0 0 0 .0625rem rgba(255,213,10,.4);--sapField_SuccessColor: #30914c;--sapField_SuccessBackground: #f5fae5;--sapField_SuccessBackgroundStyle: 0 100% / 100% .0625rem no-repeat linear-gradient(0deg, #30914c, #30914c) border-box;--sapField_SuccessBorderWidth: .0625rem;--sapField_SuccessBorderStyle: none;--sapField_SuccessShadow: inset 0 0 0 .0625rem rgba(48,145,76,.18);--sapField_InformationColor: #0070f2;--sapField_InformationBackground: #e1f4ff;--sapField_InformationBackgroundStyle: 0 100% / 100% .125rem no-repeat linear-gradient(0deg, #0070f2, #0070f2) border-box;--sapField_InformationBorderWidth: .125rem;--sapField_InformationBorderStyle: none;--sapField_InformationShadow: inset 0 0 0 .0625rem rgba(104,174,255,.5);--sapGroup_TitleBackground: #fff;--sapGroup_TitleBorderColor: #a8b2bd;--sapGroup_TitleTextColor: #1d2d3e;--sapGroup_Title_FontSize: 1rem;--sapGroup_ContentBackground: #fff;--sapGroup_ContentBorderColor: #d9d9d9;--sapGroup_BorderWidth: .0625rem;--sapGroup_BorderCornerRadius: .5rem;--sapGroup_FooterBackground: transparent;--sapToolbar_Background: #fff;--sapToolbar_SeparatorColor: #d9d9d9;--sapList_HeaderBackground: #fff;--sapList_HeaderBorderColor: #a8b2bd;--sapList_HeaderTextColor: #1d2d3e;--sapList_BorderColor: #e5e5e5;--sapList_BorderWidth: .0625rem;--sapList_TextColor: #1d2d3e;--sapList_Active_TextColor: #1d2d3e;--sapList_Active_Background: #dee2e5;--sapList_SelectionBackgroundColor: #ebf8ff;--sapList_SelectionBorderColor: #0064d9;--sapList_Hover_SelectionBackground: #dcf3ff;--sapList_Background: #fff;--sapList_Hover_Background: #eaecee;--sapList_AlternatingBackground: #f5f6f7;--sapList_GroupHeaderBackground: #fff;--sapList_GroupHeaderBorderColor: #a8b2bd;--sapList_GroupHeaderTextColor: #1d2d3e;--sapList_TableGroupHeaderBackground: #eff1f2;--sapList_TableGroupHeaderBorderColor: #a8b2bd;--sapList_TableGroupHeaderTextColor: #1d2d3e;--sapList_FooterBackground: #fff;--sapList_FooterTextColor: #1d2d3e;--sapList_TableFooterBorder: #a8b2bd;--sapList_TableFixedBorderColor: #8c8c8c;--sapMessage_ErrorBorderColor: #ff8ec4;--sapMessage_WarningBorderColor: #ffe770;--sapMessage_SuccessBorderColor: #cee67e;--sapMessage_InformationBorderColor: #7bcfff;--sapPopover_BorderCornerRadius: .5rem;--sapProgress_Background: #d5dadd;--sapProgress_BorderColor: #d5dadd;--sapProgress_TextColor: #1d2d3e;--sapProgress_FontSize: .875rem;--sapProgress_NegativeBackground: #ffdbec;--sapProgress_NegativeBorderColor: #ffdbec;--sapProgress_NegativeTextColor: #1d2d3e;--sapProgress_CriticalBackground: #fff4bd;--sapProgress_CriticalBorderColor: #fff4bd;--sapProgress_CriticalTextColor: #1d2d3e;--sapProgress_PositiveBackground: #e5f2ba;--sapProgress_PositiveBorderColor: #e5f2ba;--sapProgress_PositiveTextColor: #1d2d3e;--sapProgress_InformationBackground: #cdedff;--sapProgress_InformationBorderColor: #cdedff;--sapProgress_InformationTextColor: #1d2d3e;--sapProgress_Value_Background: #617b94;--sapProgress_Value_BorderColor: #617b94;--sapProgress_Value_TextColor: #788fa6;--sapProgress_Value_NegativeBackground: #f53232;--sapProgress_Value_NegativeBorderColor: #f53232;--sapProgress_Value_NegativeTextColor: #f53232;--sapProgress_Value_CriticalBackground: #e76500;--sapProgress_Value_CriticalBorderColor: #e76500;--sapProgress_Value_CriticalTextColor: #e76500;--sapProgress_Value_PositiveBackground: #30914c;--sapProgress_Value_PositiveBorderColor: #30914c;--sapProgress_Value_PositiveTextColor: #30914c;--sapProgress_Value_InformationBackground: #0070f2;--sapProgress_Value_InformationBorderColor: #0070f2;--sapProgress_Value_InformationTextColor: #0070f2;--sapScrollBar_FaceColor: #7b91a8;--sapScrollBar_TrackColor: #fff;--sapScrollBar_BorderColor: #7b91a8;--sapScrollBar_SymbolColor: #0064d9;--sapScrollBar_Dimension: .75rem;--sapScrollBar_Hover_FaceColor: #5b728b;--sapSlider_Background: #d5dadd;--sapSlider_BorderColor: #d5dadd;--sapSlider_Selected_Background: #0064d9;--sapSlider_Selected_BorderColor: #0064d9;--sapSlider_HandleBackground: #fff;--sapSlider_HandleBorderColor: #b0d5ff;--sapSlider_RangeHandleBackground: #fff;--sapSlider_Hover_HandleBackground: #d9ecff;--sapSlider_Hover_HandleBorderColor: #b0d5ff;--sapSlider_Hover_RangeHandleBackground: #d9ecff;--sapSlider_Active_HandleBackground: #fff;--sapSlider_Active_HandleBorderColor: #0064d9;--sapSlider_Active_RangeHandleBackground: transparent;--sapPageHeader_Background: #fff;--sapPageHeader_BorderColor: #d9d9d9;--sapPageHeader_TextColor: #1d2d3e;--sapPageFooter_Background: #fff;--sapPageFooter_BorderColor: #d9d9d9;--sapPageFooter_TextColor: #1d2d3e;--sapInfobar_Background: #c2fcee;--sapInfobar_Hover_Background: #fff;--sapInfobar_Active_Background: #fff;--sapInfobar_NonInteractive_Background: #f5f6f7;--sapInfobar_TextColor: #046c7a;--sapObjectHeader_Background: #fff;--sapObjectHeader_Hover_Background: #eaecee;--sapObjectHeader_BorderColor: #d9d9d9;--sapObjectHeader_Title_TextColor: #1d2d3e;--sapObjectHeader_Title_FontSize: 1.5rem;--sapObjectHeader_Title_SnappedFontSize: 1.25rem;--sapObjectHeader_Title_FontFamily: "72Black", "72Blackfull","72", "72full", Arial, Helvetica, sans-serif;--sapObjectHeader_Subtitle_TextColor: #556b82;--sapBlockLayer_Background: #000;--sapTile_Background: #fff;--sapTile_Hover_Background: #eaecee;--sapTile_Active_Background: #dee2e5;--sapTile_BorderColor: transparent;--sapTile_BorderCornerRadius: 1rem;--sapTile_TitleTextColor: #1d2d3e;--sapTile_TextColor: #556b82;--sapTile_IconColor: #556b82;--sapTile_SeparatorColor: #ccc;--sapTile_Interactive_BorderColor: #b3b3b3;--sapTile_OverlayBackground: #fff;--sapTile_OverlayForegroundColor: #1d2d3e;--sapAccentColor1: #d27700;--sapAccentColor2: #aa0808;--sapAccentColor3: #ba066c;--sapAccentColor4: #a100c2;--sapAccentColor5: #5d36ff;--sapAccentColor6: #0057d2;--sapAccentColor7: #046c7a;--sapAccentColor8: #256f3a;--sapAccentColor9: #6c32a9;--sapAccentColor10: #5b738b;--sapAccentBackgroundColor1: #fff3b8;--sapAccentBackgroundColor2: #ffd0e7;--sapAccentBackgroundColor3: #ffdbe7;--sapAccentBackgroundColor4: #ffdcf3;--sapAccentBackgroundColor5: #ded3ff;--sapAccentBackgroundColor6: #d1efff;--sapAccentBackgroundColor7: #c2fcee;--sapAccentBackgroundColor8: #ebf5cb;--sapAccentBackgroundColor9: #ddccf0;--sapAccentBackgroundColor10: #eaecee;--sapIndicationColor_1: #840606;--sapIndicationColor_1_Background: #840606;--sapIndicationColor_1_BorderColor: #840606;--sapIndicationColor_1_TextColor: #fff;--sapIndicationColor_1_Hover_Background: #6c0505;--sapIndicationColor_1_Active_Background: #fff;--sapIndicationColor_1_Active_BorderColor: #fb9d9d;--sapIndicationColor_1_Active_TextColor: #840606;--sapIndicationColor_1_Selected_Background: #fff;--sapIndicationColor_1_Selected_BorderColor: #fb9d9d;--sapIndicationColor_1_Selected_TextColor: #840606;--sapIndicationColor_1b: #fb9d9d;--sapIndicationColor_1b_BorderColor: #fb9d9d;--sapIndicationColor_1b_Hover_Background: #fa8585;--sapIndicationColor_2: #aa0808;--sapIndicationColor_2_Background: #aa0808;--sapIndicationColor_2_BorderColor: #aa0808;--sapIndicationColor_2_TextColor: #fff;--sapIndicationColor_2_Hover_Background: #920707;--sapIndicationColor_2_Active_Background: #fff;--sapIndicationColor_2_Active_BorderColor: #fcc4c4;--sapIndicationColor_2_Active_TextColor: #aa0808;--sapIndicationColor_2_Selected_Background: #fff;--sapIndicationColor_2_Selected_BorderColor: #fcc4c4;--sapIndicationColor_2_Selected_TextColor: #aa0808;--sapIndicationColor_2b: #fcc4c4;--sapIndicationColor_2b_BorderColor: #fcc4c4;--sapIndicationColor_2b_Hover_Background: #fbacac;--sapIndicationColor_3: #b95100;--sapIndicationColor_3_Background: #e76500;--sapIndicationColor_3_BorderColor: #e76500;--sapIndicationColor_3_TextColor: #fff;--sapIndicationColor_3_Hover_Background: #d85e00;--sapIndicationColor_3_Active_Background: #fff;--sapIndicationColor_3_Active_BorderColor: #fff2c0;--sapIndicationColor_3_Active_TextColor: #b95100;--sapIndicationColor_3_Selected_Background: #fff;--sapIndicationColor_3_Selected_BorderColor: #fff2c0;--sapIndicationColor_3_Selected_TextColor: #b95100;--sapIndicationColor_3b: #fff2c0;--sapIndicationColor_3b_BorderColor: #fff2c0;--sapIndicationColor_3b_Hover_Background: #ffeda6;--sapIndicationColor_4: #256f3a;--sapIndicationColor_4_Background: #256f3a;--sapIndicationColor_4_BorderColor: #256f3a;--sapIndicationColor_4_TextColor: #fff;--sapIndicationColor_4_Hover_Background: #1f5c30;--sapIndicationColor_4_Active_Background: #fff;--sapIndicationColor_4_Active_BorderColor: #bae8bc;--sapIndicationColor_4_Active_TextColor: #256f3a;--sapIndicationColor_4_Selected_Background: #fff;--sapIndicationColor_4_Selected_BorderColor: #bae8bc;--sapIndicationColor_4_Selected_TextColor: #256f3a;--sapIndicationColor_4b: #bae8bc;--sapIndicationColor_4b_BorderColor: #bae8bc;--sapIndicationColor_4b_Hover_Background: #a7e2a9;--sapIndicationColor_5: #0070f2;--sapIndicationColor_5_Background: #0070f2;--sapIndicationColor_5_BorderColor: #0070f2;--sapIndicationColor_5_TextColor: #fff;--sapIndicationColor_5_Hover_Background: #0064d9;--sapIndicationColor_5_Active_Background: #fff;--sapIndicationColor_5_Active_BorderColor: #d3effd;--sapIndicationColor_5_Active_TextColor: #0070f2;--sapIndicationColor_5_Selected_Background: #fff;--sapIndicationColor_5_Selected_BorderColor: #d3effd;--sapIndicationColor_5_Selected_TextColor: #0070f2;--sapIndicationColor_5b: #d3effd;--sapIndicationColor_5b_BorderColor: #d3effd;--sapIndicationColor_5b_Hover_Background: #bbe6fc;--sapIndicationColor_6: #046c7a;--sapIndicationColor_6_Background: #046c7a;--sapIndicationColor_6_BorderColor: #046c7a;--sapIndicationColor_6_TextColor: #fff;--sapIndicationColor_6_Hover_Background: #035661;--sapIndicationColor_6_Active_Background: #fff;--sapIndicationColor_6_Active_BorderColor: #cdf5ec;--sapIndicationColor_6_Active_TextColor: #046c7a;--sapIndicationColor_6_Selected_Background: #fff;--sapIndicationColor_6_Selected_BorderColor: #cdf5ec;--sapIndicationColor_6_Selected_TextColor: #046c7a;--sapIndicationColor_6b: #cdf5ec;--sapIndicationColor_6b_BorderColor: #cdf5ec;--sapIndicationColor_6b_Hover_Background: #b8f1e4;--sapIndicationColor_7: #5d36ff;--sapIndicationColor_7_Background: #5d36ff;--sapIndicationColor_7_BorderColor: #5d36ff;--sapIndicationColor_7_TextColor: #fff;--sapIndicationColor_7_Hover_Background: #481cff;--sapIndicationColor_7_Active_Background: #fff;--sapIndicationColor_7_Active_BorderColor: #e2dbff;--sapIndicationColor_7_Active_TextColor: #5d36ff;--sapIndicationColor_7_Selected_Background: #fff;--sapIndicationColor_7_Selected_BorderColor: #e2dbff;--sapIndicationColor_7_Selected_TextColor: #5d36ff;--sapIndicationColor_7b: #e2dbff;--sapIndicationColor_7b_BorderColor: #e2dbff;--sapIndicationColor_7b_Hover_Background: #cdc2ff;--sapIndicationColor_8: #a100c2;--sapIndicationColor_8_Background: #a100c2;--sapIndicationColor_8_BorderColor: #a100c2;--sapIndicationColor_8_TextColor: #fff;--sapIndicationColor_8_Hover_Background: #8c00a9;--sapIndicationColor_8_Active_Background: #fff;--sapIndicationColor_8_Active_BorderColor: #f8d6ff;--sapIndicationColor_8_Active_TextColor: #a100c2;--sapIndicationColor_8_Selected_Background: #fff;--sapIndicationColor_8_Selected_BorderColor: #f8d6ff;--sapIndicationColor_8_Selected_TextColor: #a100c2;--sapIndicationColor_8b: #f8d6ff;--sapIndicationColor_8b_BorderColor: #f8d6ff;--sapIndicationColor_8b_Hover_Background: #f4bdff;--sapIndicationColor_9: #1d2d3e;--sapIndicationColor_9_Background: #1d2d3e;--sapIndicationColor_9_BorderColor: #1d2d3e;--sapIndicationColor_9_TextColor: #fff;--sapIndicationColor_9_Hover_Background: #15202d;--sapIndicationColor_9_Active_Background: #fff;--sapIndicationColor_9_Active_BorderColor: #d9d9d9;--sapIndicationColor_9_Active_TextColor: #1d2d3e;--sapIndicationColor_9_Selected_Background: #fff;--sapIndicationColor_9_Selected_BorderColor: #d9d9d9;--sapIndicationColor_9_Selected_TextColor: #1d2d3e;--sapIndicationColor_9b: #fff;--sapIndicationColor_9b_BorderColor: #d9d9d9;--sapIndicationColor_9b_Hover_Background: #f2f2f2;--sapIndicationColor_10: #45484a;--sapIndicationColor_10_Background: #83888b;--sapIndicationColor_10_BorderColor: #83888b;--sapIndicationColor_10_TextColor: #fff;--sapIndicationColor_10_Hover_Background: #767b7e;--sapIndicationColor_10_Active_Background: #fff;--sapIndicationColor_10_Active_BorderColor: #eaecee;--sapIndicationColor_10_Active_TextColor: #45484a;--sapIndicationColor_10_Selected_Background: #fff;--sapIndicationColor_10_Selected_BorderColor: #eaecee;--sapIndicationColor_10_Selected_TextColor: #45484a;--sapIndicationColor_10b: #eaecee;--sapIndicationColor_10b_BorderColor: #eaecee;--sapIndicationColor_10b_Hover_Background: #dcdfe3;--sapLegend_WorkingBackground: #fff;--sapLegend_NonWorkingBackground: #ebebeb;--sapLegend_CurrentDateTime: #a100c2;--sapLegendColor1: #c35500;--sapLegendColor2: #d23a0a;--sapLegendColor3: #df1278;--sapLegendColor4: #840606;--sapLegendColor5: #cc00dc;--sapLegendColor6: #0057d2;--sapLegendColor7: #07838f;--sapLegendColor8: #188918;--sapLegendColor9: #5b738b;--sapLegendColor10: #7800a4;--sapLegendColor11: #a93e00;--sapLegendColor12: #aa2608;--sapLegendColor13: #ba066c;--sapLegendColor14: #8d2a00;--sapLegendColor15: #4e247a;--sapLegendColor16: #002a86;--sapLegendColor17: #035663;--sapLegendColor18: #1e592f;--sapLegendColor19: #1a4796;--sapLegendColor20: #470ced;--sapLegendBackgroundColor1: #ffef9f;--sapLegendBackgroundColor2: #feeae1;--sapLegendBackgroundColor3: #fbf6f8;--sapLegendBackgroundColor4: #fbebeb;--sapLegendBackgroundColor5: #ffe5fe;--sapLegendBackgroundColor6: #d1efff;--sapLegendBackgroundColor7: #c2fcee;--sapLegendBackgroundColor8: #f5fae5;--sapLegendBackgroundColor9: #f5f6f7;--sapLegendBackgroundColor10: #fff0fa;--sapLegendBackgroundColor11: #fff8d6;--sapLegendBackgroundColor12: #fff6f6;--sapLegendBackgroundColor13: #f7ebef;--sapLegendBackgroundColor14: #f1ecd5;--sapLegendBackgroundColor15: #f0e7f8;--sapLegendBackgroundColor16: #ebf8ff;--sapLegendBackgroundColor17: #dafdf5;--sapLegendBackgroundColor18: #ebf5cb;--sapLegendBackgroundColor19: #fafdff;--sapLegendBackgroundColor20: #eceeff;--sapChart_Background: #fff;--sapChart_ContrastTextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapChart_ContrastShadowColor: #fff;--sapChart_ContrastLineColor: #fff;--sapChart_LineColor_1: #e1e6eb;--sapChart_LineColor_2: #768da4;--sapChart_LineColor_3: #000001;--sapChart_Choropleth_Background: #edf0f3;--sapChart_ChoroplethRegion_Background: #758ca4;--sapChart_ChoroplethRegion_BorderColor: #edf0f3;--sapChart_Data_TextColor: #000;--sapChart_Data_ContrastTextColor: #fff;--sapChart_Data_InteractiveColor: #000001;--sapChart_Data_Active_Background: #dee2e5;--sapChart_OrderedColor_1: #3278be;--sapChart_OrderedColor_2: #c87b00;--sapChart_OrderedColor_3: #75980b;--sapChart_OrderedColor_4: #df1278;--sapChart_OrderedColor_5: #8b47d7;--sapChart_OrderedColor_6: #049f9a;--sapChart_OrderedColor_7: #0070f2;--sapChart_OrderedColor_8: #cc00dc;--sapChart_OrderedColor_9: #798c77;--sapChart_OrderedColor_10: #da6c6c;--sapChart_OrderedColor_11: #5d36ff;--sapChart_OrderedColor_12: #a68a5b;--sapChart_Bad: #f53232;--sapChart_Critical: #e26300;--sapChart_Good: #30914c;--sapChart_Neutral: #758ca4;--sapChart_Sequence_1_Plus3: #84b8eb;--sapChart_Sequence_1_Plus3_TextColor: #000;--sapChart_Sequence_1_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_1_Plus2: #468acd;--sapChart_Sequence_1_Plus2_TextColor: #000;--sapChart_Sequence_1_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_1_Plus1: #3c8cdd;--sapChart_Sequence_1_Plus1_TextColor: #000;--sapChart_Sequence_1_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_1: #3278be;--sapChart_Sequence_1_TextColor: #fff;--sapChart_Sequence_1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_1_BorderColor: #3278be;--sapChart_Sequence_1_Minus1: #31669c;--sapChart_Sequence_1_Minus1_TextColor: #fff;--sapChart_Sequence_1_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_1_Minus2: #31669c;--sapChart_Sequence_1_Minus2_TextColor: #fff;--sapChart_Sequence_1_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_1_Minus3: #204060;--sapChart_Sequence_1_Minus3_TextColor: #fff;--sapChart_Sequence_1_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_1_Minus4: #19334e;--sapChart_Sequence_1_Minus4_TextColor: #fff;--sapChart_Sequence_1_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_1_Minus5: #13263a;--sapChart_Sequence_1_Minus5_TextColor: #fff;--sapChart_Sequence_1_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Plus3: #efbf72;--sapChart_Sequence_2_Plus3_TextColor: #000;--sapChart_Sequence_2_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_2_Plus2: #eaaa44;--sapChart_Sequence_2_Plus2_TextColor: #000;--sapChart_Sequence_2_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_2_Plus1: #e29419;--sapChart_Sequence_2_Plus1_TextColor: #000;--sapChart_Sequence_2_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_2: #c87b00;--sapChart_Sequence_2_TextColor: #000;--sapChart_Sequence_2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_2_BorderColor: #9f6200;--sapChart_Sequence_2_Minus1: #9f6200;--sapChart_Sequence_2_Minus1_TextColor: #fff;--sapChart_Sequence_2_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Minus2: #7c4c00;--sapChart_Sequence_2_Minus2_TextColor: #fff;--sapChart_Sequence_2_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Minus3: #623c00;--sapChart_Sequence_2_Minus3_TextColor: #fff;--sapChart_Sequence_2_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Minus4: #623c00;--sapChart_Sequence_2_Minus4_TextColor: #fff;--sapChart_Sequence_2_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Minus5: #2f1d00;--sapChart_Sequence_2_Minus5_TextColor: #fff;--sapChart_Sequence_2_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Plus3: #b9d369;--sapChart_Sequence_3_Plus3_TextColor: #000;--sapChart_Sequence_3_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_3_Plus2: #a6c742;--sapChart_Sequence_3_Plus2_TextColor: #000;--sapChart_Sequence_3_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_3_Plus1: #8fad33;--sapChart_Sequence_3_Plus1_TextColor: #000;--sapChart_Sequence_3_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_3: #75980b;--sapChart_Sequence_3_TextColor: #000;--sapChart_Sequence_3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_3_BorderColor: #587208;--sapChart_Sequence_3_Minus1: #587208;--sapChart_Sequence_3_Minus1_TextColor: #fff;--sapChart_Sequence_3_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Minus2: #3e5106;--sapChart_Sequence_3_Minus2_TextColor: #fff;--sapChart_Sequence_3_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Minus3: #2c3904;--sapChart_Sequence_3_Minus3_TextColor: #fff;--sapChart_Sequence_3_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Minus4: #212b03;--sapChart_Sequence_3_Minus4_TextColor: #fff;--sapChart_Sequence_3_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Minus5: #161c02;--sapChart_Sequence_3_Minus5_TextColor: #fff;--sapChart_Sequence_3_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Plus3: #f473b3;--sapChart_Sequence_4_Plus3_TextColor: #000;--sapChart_Sequence_4_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_4_Plus2: #f14d9e;--sapChart_Sequence_4_Plus2_TextColor: #000;--sapChart_Sequence_4_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_4_Plus1: #ee278a;--sapChart_Sequence_4_Plus1_TextColor: #000;--sapChart_Sequence_4_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_4: #df1278;--sapChart_Sequence_4_TextColor: #fff;--sapChart_Sequence_4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_BorderColor: #df1278;--sapChart_Sequence_4_Minus1: #b90f64;--sapChart_Sequence_4_Minus1_TextColor: #fff;--sapChart_Sequence_4_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Minus2: #930c4f;--sapChart_Sequence_4_Minus2_TextColor: #fff;--sapChart_Sequence_4_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Minus3: #770a40;--sapChart_Sequence_4_Minus3_TextColor: #fff;--sapChart_Sequence_4_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Minus4: #51072c;--sapChart_Sequence_4_Minus4_TextColor: #fff;--sapChart_Sequence_4_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Minus5: #3a051f;--sapChart_Sequence_4_Minus5_TextColor: #fff;--sapChart_Sequence_4_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Plus3: #d5bcf0;--sapChart_Sequence_5_Plus3_TextColor: #000;--sapChart_Sequence_5_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_5_Plus2: #b994e0;--sapChart_Sequence_5_Plus2_TextColor: #000;--sapChart_Sequence_5_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_5_Plus1: #a679d8;--sapChart_Sequence_5_Plus1_TextColor: #000;--sapChart_Sequence_5_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_5: #8b47d7;--sapChart_Sequence_5_TextColor: #fff;--sapChart_Sequence_5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_BorderColor: #8b47d7;--sapChart_Sequence_5_Minus1: #7236b5;--sapChart_Sequence_5_Minus1_TextColor: #fff;--sapChart_Sequence_5_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Minus2: #5e2c96;--sapChart_Sequence_5_Minus2_TextColor: #fff;--sapChart_Sequence_5_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Minus3: #522682;--sapChart_Sequence_5_Minus3_TextColor: #fff;--sapChart_Sequence_5_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Minus4: #46216f;--sapChart_Sequence_5_Minus4_TextColor: #fff;--sapChart_Sequence_5_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Minus5: #341358;--sapChart_Sequence_5_Minus5_TextColor: #fff;--sapChart_Sequence_5_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Plus3: #64ede9;--sapChart_Sequence_6_Plus3_TextColor: #000;--sapChart_Sequence_6_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_6_Plus2: #2ee0da;--sapChart_Sequence_6_Plus2_TextColor: #000;--sapChart_Sequence_6_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_6_Plus1: #05c7c1;--sapChart_Sequence_6_Plus1_TextColor: #000;--sapChart_Sequence_6_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_6: #049f9a;--sapChart_Sequence_6_TextColor: #000;--sapChart_Sequence_6_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_6_BorderColor: #05c7c1;--sapChart_Sequence_6_Minus1: #02837f;--sapChart_Sequence_6_Minus1_TextColor: #fff;--sapChart_Sequence_6_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Minus2: #006663;--sapChart_Sequence_6_Minus2_TextColor: #fff;--sapChart_Sequence_6_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Minus3: #00514f;--sapChart_Sequence_6_Minus3_TextColor: #fff;--sapChart_Sequence_6_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Minus4: #003d3b;--sapChart_Sequence_6_Minus4_TextColor: #fff;--sapChart_Sequence_6_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Minus5: #002322;--sapChart_Sequence_6_Minus5_TextColor: #fff;--sapChart_Sequence_6_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Plus3: #68aeff;--sapChart_Sequence_7_Plus3_TextColor: #000;--sapChart_Sequence_7_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_7_Plus2: #4098ff;--sapChart_Sequence_7_Plus2_TextColor: #000;--sapChart_Sequence_7_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_7_Plus1: #1c85ff;--sapChart_Sequence_7_Plus1_TextColor: #000;--sapChart_Sequence_7_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_7: #0070f2;--sapChart_Sequence_7_TextColor: #fff;--sapChart_Sequence_7_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_BorderColor: #0070f2;--sapChart_Sequence_7_Minus1: #0062d3;--sapChart_Sequence_7_Minus1_TextColor: #fff;--sapChart_Sequence_7_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Minus2: #0054b5;--sapChart_Sequence_7_Minus2_TextColor: #fff;--sapChart_Sequence_7_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Minus3: #00418c;--sapChart_Sequence_7_Minus3_TextColor: #fff;--sapChart_Sequence_7_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Minus4: #00244f;--sapChart_Sequence_7_Minus4_TextColor: #fff;--sapChart_Sequence_7_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Minus5: #001b3a;--sapChart_Sequence_7_Minus5_TextColor: #fff;--sapChart_Sequence_7_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Plus3: #f462ff;--sapChart_Sequence_8_Plus3_TextColor: #000;--sapChart_Sequence_8_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_8_Plus2: #f034ff;--sapChart_Sequence_8_Plus2_TextColor: #000;--sapChart_Sequence_8_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_8_Plus1: #ed0bff;--sapChart_Sequence_8_Plus1_TextColor: #000;--sapChart_Sequence_8_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_8: #cc00dc;--sapChart_Sequence_8_TextColor: #fff;--sapChart_Sequence_8_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_BorderColor: #cc00dc;--sapChart_Sequence_8_Minus1: #a600b3;--sapChart_Sequence_8_Minus1_TextColor: #fff;--sapChart_Sequence_8_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Minus2: #80008a;--sapChart_Sequence_8_Minus2_TextColor: #fff;--sapChart_Sequence_8_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Minus3: #6d0076;--sapChart_Sequence_8_Minus3_TextColor: #fff;--sapChart_Sequence_8_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Minus4: #56005d;--sapChart_Sequence_8_Minus4_TextColor: #fff;--sapChart_Sequence_8_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Minus5: #350039;--sapChart_Sequence_8_Minus5_TextColor: #fff;--sapChart_Sequence_8_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Plus3: #bdc6bc;--sapChart_Sequence_9_Plus3_TextColor: #000;--sapChart_Sequence_9_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_9_Plus2: #b5bfb4;--sapChart_Sequence_9_Plus2_TextColor: #000;--sapChart_Sequence_9_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_9_Plus1: #97a695;--sapChart_Sequence_9_Plus1_TextColor: #000;--sapChart_Sequence_9_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_9: #798c77;--sapChart_Sequence_9_TextColor: #000;--sapChart_Sequence_9_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_9_BorderColor: #798c77;--sapChart_Sequence_9_Minus1: #667664;--sapChart_Sequence_9_Minus1_TextColor: #fff;--sapChart_Sequence_9_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Minus2: #536051;--sapChart_Sequence_9_Minus2_TextColor: #fff;--sapChart_Sequence_9_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Minus3: #404a3f;--sapChart_Sequence_9_Minus3_TextColor: #fff;--sapChart_Sequence_9_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Minus4: #2d342c;--sapChart_Sequence_9_Minus4_TextColor: #fff;--sapChart_Sequence_9_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Minus5: #1e231e;--sapChart_Sequence_9_Minus5_TextColor: #fff;--sapChart_Sequence_9_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_10_Plus3: #f1c6c6;--sapChart_Sequence_10_Plus3_TextColor: #000;--sapChart_Sequence_10_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10_Plus2: #eaadad;--sapChart_Sequence_10_Plus2_TextColor: #000;--sapChart_Sequence_10_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10_Plus1: #e28d8d;--sapChart_Sequence_10_Plus1_TextColor: #000;--sapChart_Sequence_10_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10: #da6c6c;--sapChart_Sequence_10_TextColor: #000;--sapChart_Sequence_10_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10_BorderColor: #b75757;--sapChart_Sequence_10_Minus1: #b75757;--sapChart_Sequence_10_Minus1_TextColor: #000;--sapChart_Sequence_10_Minus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10_Minus2: #9d4343;--sapChart_Sequence_10_Minus2_TextColor: #fff;--sapChart_Sequence_10_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_10_Minus3: #803737;--sapChart_Sequence_10_Minus3_TextColor: #fff;--sapChart_Sequence_10_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_10_Minus4: #672c2c;--sapChart_Sequence_10_Minus4_TextColor: #fff;--sapChart_Sequence_10_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_10_Minus5: #562424;--sapChart_Sequence_10_Minus5_TextColor: #fff;--sapChart_Sequence_10_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Plus3: #c0b0ff;--sapChart_Sequence_11_Plus3_TextColor: #000;--sapChart_Sequence_11_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_11_Plus2: #9b83ff;--sapChart_Sequence_11_Plus2_TextColor: #000;--sapChart_Sequence_11_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_11_Plus1: #8669ff;--sapChart_Sequence_11_Plus1_TextColor: #000;--sapChart_Sequence_11_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_11: #5d36ff;--sapChart_Sequence_11_TextColor: #fff;--sapChart_Sequence_11_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_BorderColor: #5d36ff;--sapChart_Sequence_11_Minus1: #4b25e7;--sapChart_Sequence_11_Minus1_TextColor: #fff;--sapChart_Sequence_11_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Minus2: #3a17cd;--sapChart_Sequence_11_Minus2_TextColor: #fff;--sapChart_Sequence_11_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Minus3: #2f13a8;--sapChart_Sequence_11_Minus3_TextColor: #fff;--sapChart_Sequence_11_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Minus4: #250f83;--sapChart_Sequence_11_Minus4_TextColor: #fff;--sapChart_Sequence_11_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Minus5: #2f13a8;--sapChart_Sequence_11_Minus5_TextColor: #fff;--sapChart_Sequence_11_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Plus3: #e4ddcf;--sapChart_Sequence_12_Plus3_TextColor: #000;--sapChart_Sequence_12_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_12_Plus2: #dacebb;--sapChart_Sequence_12_Plus2_TextColor: #000;--sapChart_Sequence_12_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_12_Plus1: #c4b293;--sapChart_Sequence_12_Plus1_TextColor: #000;--sapChart_Sequence_12_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_12: #a68a5b;--sapChart_Sequence_12_TextColor: #000;--sapChart_Sequence_12_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_12_BorderColor: #a68a5b;--sapChart_Sequence_12_Minus1: #8c744c;--sapChart_Sequence_12_Minus1_TextColor: #fff;--sapChart_Sequence_12_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Minus2: #786441;--sapChart_Sequence_12_Minus2_TextColor: #fff;--sapChart_Sequence_12_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Minus3: #5e4e33;--sapChart_Sequence_12_Minus3_TextColor: #fff;--sapChart_Sequence_12_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Minus4: #433825;--sapChart_Sequence_12_Minus4_TextColor: #fff;--sapChart_Sequence_12_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Minus5: #30271a;--sapChart_Sequence_12_Minus5_TextColor: #fff;--sapChart_Sequence_12_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Plus3: #fdcece;--sapChart_Sequence_Bad_Plus3_TextColor: #000;--sapChart_Sequence_Bad_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Bad_Plus2: #fa9d9d;--sapChart_Sequence_Bad_Plus2_TextColor: #000;--sapChart_Sequence_Bad_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Bad_Plus1: #f86c6c;--sapChart_Sequence_Bad_Plus1_TextColor: #000;--sapChart_Sequence_Bad_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Bad: #f53232;--sapChart_Sequence_Bad_TextColor: #000;--sapChart_Sequence_Bad_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Bad_BorderColor: #f53232;--sapChart_Sequence_Bad_Minus1: #d00a0a;--sapChart_Sequence_Bad_Minus1_TextColor: #fff;--sapChart_Sequence_Bad_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Minus2: #a90808;--sapChart_Sequence_Bad_Minus2_TextColor: #fff;--sapChart_Sequence_Bad_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Minus3: #830606;--sapChart_Sequence_Bad_Minus3_TextColor: #fff;--sapChart_Sequence_Bad_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Minus4: #570404;--sapChart_Sequence_Bad_Minus4_TextColor: #fff;--sapChart_Sequence_Bad_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Minus5: #320000;--sapChart_Sequence_Bad_Minus5_TextColor: #fff;--sapChart_Sequence_Bad_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Plus3: #ffb881;--sapChart_Sequence_Critical_Plus3_TextColor: #000;--sapChart_Sequence_Critical_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Critical_Plus2: #ff933f;--sapChart_Sequence_Critical_Plus2_TextColor: #000;--sapChart_Sequence_Critical_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Critical_Plus1: #ff760c;--sapChart_Sequence_Critical_Plus1_TextColor: #000;--sapChart_Sequence_Critical_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Critical: #e26300;--sapChart_Sequence_Critical_TextColor: #000;--sapChart_Sequence_Critical_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Critical_BorderColor: #e26300;--sapChart_Sequence_Critical_Minus1: #c35600;--sapChart_Sequence_Critical_Minus1_TextColor: #fff;--sapChart_Sequence_Critical_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Minus2: #aa4a00;--sapChart_Sequence_Critical_Minus2_TextColor: #fff;--sapChart_Sequence_Critical_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Minus3: #903f00;--sapChart_Sequence_Critical_Minus3_TextColor: #fff;--sapChart_Sequence_Critical_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Minus4: #6d3000;--sapChart_Sequence_Critical_Minus4_TextColor: #fff;--sapChart_Sequence_Critical_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Minus5: #492000;--sapChart_Sequence_Critical_Minus5_TextColor: #fff;--sapChart_Sequence_Critical_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Plus3: #88d79f;--sapChart_Sequence_Good_Plus3_TextColor: #000;--sapChart_Sequence_Good_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Good_Plus2: #56c776;--sapChart_Sequence_Good_Plus2_TextColor: #000;--sapChart_Sequence_Good_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Good_Plus1: #3ab05c;--sapChart_Sequence_Good_Plus1_TextColor: #000;--sapChart_Sequence_Good_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Good: #30914c;--sapChart_Sequence_Good_TextColor: #000;--sapChart_Sequence_Good_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Good_BorderColor: #30914c;--sapChart_Sequence_Good_Minus1: #287a40;--sapChart_Sequence_Good_Minus1_TextColor: #fff;--sapChart_Sequence_Good_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Minus2: #226736;--sapChart_Sequence_Good_Minus2_TextColor: #fff;--sapChart_Sequence_Good_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Minus3: #1c542c;--sapChart_Sequence_Good_Minus3_TextColor: #fff;--sapChart_Sequence_Good_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Minus4: #13391e;--sapChart_Sequence_Good_Minus4_TextColor: #fff;--sapChart_Sequence_Good_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Minus5: #0a1e10;--sapChart_Sequence_Good_Minus5_TextColor: #fff;--sapChart_Sequence_Good_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Plus3: #edf0f3;--sapChart_Sequence_Neutral_Plus3_TextColor: #000;--sapChart_Sequence_Neutral_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Neutral_Plus2: #c2ccd7;--sapChart_Sequence_Neutral_Plus2_TextColor: #000;--sapChart_Sequence_Neutral_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Neutral_Plus1: #9aabbc;--sapChart_Sequence_Neutral_Plus1_TextColor: #000;--sapChart_Sequence_Neutral_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Neutral: #758ca4;--sapChart_Sequence_Neutral_TextColor: #000;--sapChart_Sequence_Neutral_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Neutral_BorderColor: #758ca4;--sapChart_Sequence_Neutral_Minus1: #5b728b;--sapChart_Sequence_Neutral_Minus1_TextColor: #fff;--sapChart_Sequence_Neutral_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Minus2: #495e74;--sapChart_Sequence_Neutral_Minus2_TextColor: #fff;--sapChart_Sequence_Neutral_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Minus3: #364a5f;--sapChart_Sequence_Neutral_Minus3_TextColor: #fff;--sapChart_Sequence_Neutral_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Minus4: #233649;--sapChart_Sequence_Neutral_Minus4_TextColor: #fff;--sapChart_Sequence_Neutral_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Minus5: #1a2633;--sapChart_Sequence_Neutral_Minus5_TextColor: #fff;--sapChart_Sequence_Neutral_Minus5_TextShadow: 0 0 .125rem #223548;}
` };

    const styleData$3 = { packageName: "@ui5/webcomponents", fileName: "themes/sap_horizon/parameters-bundle.css.ts", content: `:root{--ui5-v2-1-1-avatar-hover-box-shadow-offset: 0px 0px 0px .0625rem;--ui5-v2-1-1-avatar-initials-color: var(--sapContent_ImagePlaceholderForegroundColor);--ui5-v2-1-1-avatar-border-radius-img-deduction: .0625rem;--_ui5-v2-1-1_avatar_outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-1-1_avatar_focus_width: .0625rem;--_ui5-v2-1-1_avatar_focus_color: var(--sapContent_FocusColor);--_ui5-v2-1-1_avatar_overflow_button_focus_offset: .0625rem;--_ui5-v2-1-1_avatar_focus_offset: .1875rem;--ui5-v2-1-1-avatar-initials-border: .0625rem solid var(--sapAvatar_1_BorderColor);--ui5-v2-1-1-avatar-border-radius: var(--sapElement_BorderCornerRadius);--_ui5-v2-1-1_avatar_fontsize_XS: 1rem;--_ui5-v2-1-1_avatar_fontsize_S: 1.125rem;--_ui5-v2-1-1_avatar_fontsize_M: 1.5rem;--_ui5-v2-1-1_avatar_fontsize_L: 2.25rem;--_ui5-v2-1-1_avatar_fontsize_XL: 3rem;--ui5-v2-1-1-avatar-accent1: var(--sapAvatar_1_Background);--ui5-v2-1-1-avatar-accent2: var(--sapAvatar_2_Background);--ui5-v2-1-1-avatar-accent3: var(--sapAvatar_3_Background);--ui5-v2-1-1-avatar-accent4: var(--sapAvatar_4_Background);--ui5-v2-1-1-avatar-accent5: var(--sapAvatar_5_Background);--ui5-v2-1-1-avatar-accent6: var(--sapAvatar_6_Background);--ui5-v2-1-1-avatar-accent7: var(--sapAvatar_7_Background);--ui5-v2-1-1-avatar-accent8: var(--sapAvatar_8_Background);--ui5-v2-1-1-avatar-accent9: var(--sapAvatar_9_Background);--ui5-v2-1-1-avatar-accent10: var(--sapAvatar_10_Background);--ui5-v2-1-1-avatar-placeholder: var(--sapContent_ImagePlaceholderBackground);--ui5-v2-1-1-avatar-accent1-color: var(--sapAvatar_1_TextColor);--ui5-v2-1-1-avatar-accent2-color: var(--sapAvatar_2_TextColor);--ui5-v2-1-1-avatar-accent3-color: var(--sapAvatar_3_TextColor);--ui5-v2-1-1-avatar-accent4-color: var(--sapAvatar_4_TextColor);--ui5-v2-1-1-avatar-accent5-color: var(--sapAvatar_5_TextColor);--ui5-v2-1-1-avatar-accent6-color: var(--sapAvatar_6_TextColor);--ui5-v2-1-1-avatar-accent7-color: var(--sapAvatar_7_TextColor);--ui5-v2-1-1-avatar-accent8-color: var(--sapAvatar_8_TextColor);--ui5-v2-1-1-avatar-accent9-color: var(--sapAvatar_9_TextColor);--ui5-v2-1-1-avatar-accent10-color: var(--sapAvatar_10_TextColor);--ui5-v2-1-1-avatar-placeholder-color: var(--sapContent_ImagePlaceholderForegroundColor);--ui5-v2-1-1-avatar-accent1-border-color: var(--sapAvatar_1_BorderColor);--ui5-v2-1-1-avatar-accent2-border-color: var(--sapAvatar_2_BorderColor);--ui5-v2-1-1-avatar-accent3-border-color: var(--sapAvatar_3_BorderColor);--ui5-v2-1-1-avatar-accent4-border-color: var(--sapAvatar_4_BorderColor);--ui5-v2-1-1-avatar-accent5-border-color: var(--sapAvatar_5_BorderColor);--ui5-v2-1-1-avatar-accent6-border-color: var(--sapAvatar_6_BorderColor);--ui5-v2-1-1-avatar-accent7-border-color: var(--sapAvatar_7_BorderColor);--ui5-v2-1-1-avatar-accent8-border-color: var(--sapAvatar_8_BorderColor);--ui5-v2-1-1-avatar-accent9-border-color: var(--sapAvatar_9_BorderColor);--ui5-v2-1-1-avatar-accent10-border-color: var(--sapAvatar_10_BorderColor);--ui5-v2-1-1-avatar-placeholder-border-color: var(--sapContent_ImagePlaceholderBackground);--_ui5-v2-1-1_avatar_icon_XS: var(--_ui5-v2-1-1_avatar_fontsize_XS);--_ui5-v2-1-1_avatar_icon_S: var(--_ui5-v2-1-1_avatar_fontsize_S);--_ui5-v2-1-1_avatar_icon_M: var(--_ui5-v2-1-1_avatar_fontsize_M);--_ui5-v2-1-1_avatar_icon_L: var(--_ui5-v2-1-1_avatar_fontsize_L);--_ui5-v2-1-1_avatar_icon_XL: var(--_ui5-v2-1-1_avatar_fontsize_XL);--_ui5-v2-1-1_avatar_group_button_focus_border: none;--_ui5-v2-1-1_avatar_group_focus_border_radius: .375rem;--_ui5-v2-1-1-tag-height: 1rem;--_ui5-v2-1-1-tag-icon-width: .75rem;--ui5-v2-1-1-tag-text-shadow: var(--sapContent_TextShadow);--ui5-v2-1-1-tag-contrast-text-shadow: var(--sapContent_ContrastTextShadow);--ui5-v2-1-1-tag-information-text-shadow: var(--ui5-v2-1-1-tag-text-shadow);--ui5-v2-1-1-tag-set2-color-scheme-1-color: var(--sapIndicationColor_1);--ui5-v2-1-1-tag-set2-color-scheme-1-background: var(--sapIndicationColor_1b);--ui5-v2-1-1-tag-set2-color-scheme-1-border: var(--sapIndicationColor_1b_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-1-hover-background: var(--sapIndicationColor_1b_Hover_Background);--ui5-v2-1-1-tag-set2-color-scheme-1-active-color: var(--sapIndicationColor_1_Active_TextColor);--ui5-v2-1-1-tag-set2-color-scheme-1-active-background: var(--sapIndicationColor_1_Active_Background);--ui5-v2-1-1-tag-set2-color-scheme-1-active-border: var(--sapIndicationColor_1_Active_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-2-color: var(--sapIndicationColor_2);--ui5-v2-1-1-tag-set2-color-scheme-2-background: var(--sapIndicationColor_2b);--ui5-v2-1-1-tag-set2-color-scheme-2-border: var(--sapIndicationColor_2b_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-2-hover-background: var(--sapIndicationColor_2b_Hover_Background);--ui5-v2-1-1-tag-set2-color-scheme-2-active-color: var(--sapIndicationColor_2_Active_TextColor);--ui5-v2-1-1-tag-set2-color-scheme-2-active-background: var(--sapIndicationColor_2_Active_Background);--ui5-v2-1-1-tag-set2-color-scheme-2-active-border: var(--sapIndicationColor_2_Active_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-3-color: var(--sapIndicationColor_3);--ui5-v2-1-1-tag-set2-color-scheme-3-background: var(--sapIndicationColor_3b);--ui5-v2-1-1-tag-set2-color-scheme-3-border: var(--sapIndicationColor_3b_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-3-hover-background: var(--sapIndicationColor_3b_Hover_Background);--ui5-v2-1-1-tag-set2-color-scheme-3-active-color: var(--sapIndicationColor_3_Active_TextColor);--ui5-v2-1-1-tag-set2-color-scheme-3-active-background: var(--sapIndicationColor_3_Active_Background);--ui5-v2-1-1-tag-set2-color-scheme-3-active-border: var(--sapIndicationColor_3_Active_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-4-color: var(--sapIndicationColor_4);--ui5-v2-1-1-tag-set2-color-scheme-4-background: var(--sapIndicationColor_4b);--ui5-v2-1-1-tag-set2-color-scheme-4-border: var(--sapIndicationColor_4b_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-4-hover-background: var(--sapIndicationColor_4b_Hover_Background);--ui5-v2-1-1-tag-set2-color-scheme-4-active-color: var(--sapIndicationColor_4_Active_TextColor);--ui5-v2-1-1-tag-set2-color-scheme-4-active-background: var(--sapIndicationColor_4_Active_Background);--ui5-v2-1-1-tag-set2-color-scheme-4-active-border: var(--sapIndicationColor_4_Active_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-5-color: var(--sapIndicationColor_5);--ui5-v2-1-1-tag-set2-color-scheme-5-background: var(--sapIndicationColor_5b);--ui5-v2-1-1-tag-set2-color-scheme-5-border: var(--sapIndicationColor_5b_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-5-hover-background: var(--sapIndicationColor_5b_Hover_Background);--ui5-v2-1-1-tag-set2-color-scheme-5-active-color: var(--sapIndicationColor_5_Active_TextColor);--ui5-v2-1-1-tag-set2-color-scheme-5-active-background: var(--sapIndicationColor_5_Active_Background);--ui5-v2-1-1-tag-set2-color-scheme-5-active-border: var(--sapIndicationColor_5_Active_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-6-color: var(--sapIndicationColor_6);--ui5-v2-1-1-tag-set2-color-scheme-6-background: var(--sapIndicationColor_6b);--ui5-v2-1-1-tag-set2-color-scheme-6-border: var(--sapIndicationColor_6b_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-6-hover-background: var(--sapIndicationColor_6b_Hover_Background);--ui5-v2-1-1-tag-set2-color-scheme-6-active-color: var(--sapIndicationColor_6_Active_TextColor);--ui5-v2-1-1-tag-set2-color-scheme-6-active-background: var(--sapIndicationColor_6_Active_Background);--ui5-v2-1-1-tag-set2-color-scheme-6-active-border: var(--sapIndicationColor_6_Active_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-7-color: var(--sapIndicationColor_7);--ui5-v2-1-1-tag-set2-color-scheme-7-background: var(--sapIndicationColor_7b);--ui5-v2-1-1-tag-set2-color-scheme-7-border: var(--sapIndicationColor_7b_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-7-hover-background: var(--sapIndicationColor_7b_Hover_Background);--ui5-v2-1-1-tag-set2-color-scheme-7-active-color: var(--sapIndicationColor_7_Active_TextColor);--ui5-v2-1-1-tag-set2-color-scheme-7-active-background: var(--sapIndicationColor_7_Active_Background);--ui5-v2-1-1-tag-set2-color-scheme-7-active-border: var(--sapIndicationColor_7_Active_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-8-color: var(--sapIndicationColor_8);--ui5-v2-1-1-tag-set2-color-scheme-8-background: var(--sapIndicationColor_8b);--ui5-v2-1-1-tag-set2-color-scheme-8-border: var(--sapIndicationColor_8b_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-8-hover-background: var(--sapIndicationColor_8b_Hover_Background);--ui5-v2-1-1-tag-set2-color-scheme-8-active-color: var(--sapIndicationColor_8_Active_TextColor);--ui5-v2-1-1-tag-set2-color-scheme-8-active-background: var(--sapIndicationColor_8_Active_Background);--ui5-v2-1-1-tag-set2-color-scheme-8-active-border: var(--sapIndicationColor_8_Active_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-9-color: var(--sapIndicationColor_9);--ui5-v2-1-1-tag-set2-color-scheme-9-background: var(--sapIndicationColor_9b);--ui5-v2-1-1-tag-set2-color-scheme-9-border: var(--sapIndicationColor_9b_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-10-color: var(--sapIndicationColor_10);--ui5-v2-1-1-tag-set2-color-scheme-10-background: var(--sapIndicationColor_10b);--ui5-v2-1-1-tag-set2-color-scheme-10-border: var(--sapIndicationColor_10b_BorderColor);--ui5-v2-1-1-tag-set2-color-scheme-10-hover-background: var(--sapIndicationColor_10b_Hover_Background);--ui5-v2-1-1-tag-set2-color-scheme-10-active-color: var(--sapIndicationColor_10_Active_TextColor);--ui5-v2-1-1-tag-set2-color-scheme-10-active-background: var(--sapIndicationColor_10_Active_Background);--ui5-v2-1-1-tag-set2-color-scheme-10-active-border: var(--sapIndicationColor_10_Active_BorderColor);--_ui5-v2-1-1-tag-height_size_l: 1.5rem;--_ui5-v2-1-1-tag-min-width_size_l: 1.75rem;--_ui5-v2-1-1-tag-font-size_size_l: 1.25rem;--_ui5-v2-1-1-tag-icon_min_width_size_l: 1.25rem;--_ui5-v2-1-1-tag-icon_min_height_size_l:1.25rem;--_ui5-v2-1-1-tag-icon_height_size_l: 1.25rem;--_ui5-v2-1-1-tag-text_padding_size_l: .125rem .25rem;--_ui5-v2-1-1-tag-text-height_size_l: 1.5rem;--_ui5-v2-1-1-tag-text-padding: .1875rem .25rem;--_ui5-v2-1-1-tag-padding-inline-icon-only: .313rem;--_ui5-v2-1-1-tag-text-transform: none;--_ui5-v2-1-1-tag-icon-gap: .25rem;--_ui5-v2-1-1-tag-font-size: var(--sapFontSize);--_ui5-v2-1-1-tag-font: var(--sapFontSemiboldDuplexFamily);--_ui5-v2-1-1-tag-font-weight: normal;--_ui5-v2-1-1-tag-letter-spacing: normal;--_ui5-v2-1-1_bar_base_height: 2.75rem;--_ui5-v2-1-1_bar_subheader_height: 3rem;--_ui5-v2-1-1_bar-start-container-padding-start: .75rem;--_ui5-v2-1-1_bar-mid-container-padding-start-end: .5rem;--_ui5-v2-1-1_bar-end-container-padding-end: .75rem;--_ui5-v2-1-1_bar_subheader_margin-top: -.0625rem;--_ui5-v2-1-1_breadcrumbs_margin: 0 0 .5rem 0;--browser_scrollbar_border_radius: var(--sapElement_BorderCornerRadius);--browser_scrollbar_border: none;--_ui5-v2-1-1_busy_indicator_block_layer: color-mix(in oklch, transparent, var(--sapBlockLayer_Background) 20%);--_ui5-v2-1-1_busy_indicator_color: var(--sapContent_BusyColor);--_ui5-v2-1-1_busy_indicator_focus_outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-1-1-calendar-legend-root-padding: .75rem;--_ui5-v2-1-1-calendar-legend-root-width: 18.5rem;--_ui5-v2-1-1-calendar-legend-item-root-focus-margin: 0;--_ui5-v2-1-1-calendar-legend-item-root-width: 7.75rem;--_ui5-v2-1-1-calendar-legend-item-root-focus-border: var(--sapContent_FocusWidth) solid var(--sapContent_FocusColor);--_ui5-v2-1-1_card_box_shadow: var(--sapContent_Shadow0);--_ui5-v2-1-1_card_header_border_color: var(--sapTile_SeparatorColor);--_ui5-v2-1-1_card_header_focus_border: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-1-1_card_header_focus_bottom_radius: 0px;--_ui5-v2-1-1_card_header_title_font_weight: normal;--_ui5-v2-1-1_card_header_subtitle_margin_top: .25rem;--_ui5-v2-1-1_card_hover_box_shadow: var(--sapContent_Shadow2);--_ui5-v2-1-1_card_header_focus_offset: 0px;--_ui5-v2-1-1_card_header_focus_radius: var(--_ui5-v2-1-1_card_border-radius);--_ui5-v2-1-1_card_header_title_font_family: var(--sapFontHeaderFamily);--_ui5-v2-1-1_card_header_title_font_size: var(--sapFontHeader6Size);--_ui5-v2-1-1_card_header_hover_bg: var(--sapTile_Hover_Background);--_ui5-v2-1-1_card_header_active_bg: var(--sapTile_Active_Background);--_ui5-v2-1-1_card_header_border: none;--_ui5-v2-1-1_card_border-radius: var(--sapTile_BorderCornerRadius);--_ui5-v2-1-1_card_header_padding: 1rem 1rem .75rem 1rem;--_ui5-v2-1-1_card_border: none;--ui5-v2-1-1_carousel_background_color_solid: var(--sapGroup_ContentBackground);--ui5-v2-1-1_carousel_background_color_translucent: var(--sapBackgroundColor);--ui5-v2-1-1_carousel_button_size: 2.5rem;--ui5-v2-1-1_carousel_inactive_dot_size: .25rem;--ui5-v2-1-1_carousel_inactive_dot_margin: 0 .375rem;--ui5-v2-1-1_carousel_inactive_dot_border: 1px solid var(--sapContent_ForegroundBorderColor);--ui5-v2-1-1_carousel_inactive_dot_background: var(--sapContent_ForegroundBorderColor);--ui5-v2-1-1_carousel_active_dot_border: 1px solid var(--sapContent_Selected_ForegroundColor);--ui5-v2-1-1_carousel_active_dot_background: var(--sapContent_Selected_ForegroundColor);--ui5-v2-1-1_carousel_navigation_button_active_box_shadow: none;--_ui5-v2-1-1_checkbox_box_shadow: none;--_ui5-v2-1-1_checkbox_transition: unset;--_ui5-v2-1-1_checkbox_focus_border: none;--_ui5-v2-1-1_checkbox_border_radius: 0;--_ui5-v2-1-1_checkbox_focus_outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-1-1_checkbox_outer_hover_background: transparent;--_ui5-v2-1-1_checkbox_inner_width_height: 1.375rem;--_ui5-v2-1-1_checkbox_inner_disabled_border_color: var(--sapField_BorderColor);--_ui5-v2-1-1_checkbox_inner_information_box_shadow: none;--_ui5-v2-1-1_checkbox_inner_warning_box_shadow: none;--_ui5-v2-1-1_checkbox_inner_error_box_shadow: none;--_ui5-v2-1-1_checkbox_inner_success_box_shadow: none;--_ui5-v2-1-1_checkbox_inner_default_box_shadow: none;--_ui5-v2-1-1_checkbox_inner_background: var(--sapField_Background);--_ui5-v2-1-1_checkbox_wrapped_focus_padding: .375rem;--_ui5-v2-1-1_checkbox_wrapped_focus_inset_block: var(--_ui5-v2-1-1_checkbox_focus_position);--_ui5-v2-1-1_checkbox_compact_wrapper_padding: .5rem;--_ui5-v2-1-1_checkbox_compact_width_height: 2rem;--_ui5-v2-1-1_checkbox_compact_inner_size: 1rem;--_ui5-v2-1-1_checkbox_compact_focus_position: .375rem;--_ui5-v2-1-1_checkbox_label_offset: var(--_ui5-v2-1-1_checkbox_wrapper_padding);--_ui5-v2-1-1_checkbox_disabled_label_color: var(--sapContent_LabelColor);--_ui5-v2-1-1_checkbox_default_focus_border: none;--_ui5-v2-1-1_checkbox_focus_outline_display: block;--_ui5-v2-1-1_checkbox_wrapper_padding: .6875rem;--_ui5-v2-1-1_checkbox_width_height: 2.75rem;--_ui5-v2-1-1_checkbox_label_color: var(--sapField_TextColor);--_ui5-v2-1-1_checkbox_inner_border: solid var(--sapField_BorderWidth) var(--sapField_BorderColor);--_ui5-v2-1-1_checkbox_inner_border_radius: var(--sapField_BorderCornerRadius);--_ui5-v2-1-1_checkbox_checkmark_color: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-1-1_checkbox_hover_background: var(--sapContent_Selected_Hover_Background);--_ui5-v2-1-1_checkbox_inner_hover_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-1-1_checkbox_inner_hover_checked_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-1-1_checkbox_inner_selected_border_color: var(--sapField_BorderColor);--_ui5-v2-1-1_checkbox_inner_active_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-1-1_checkbox_active_background: var(--sapContent_Selected_Hover_Background);--_ui5-v2-1-1_checkbox_inner_readonly_border: var(--sapElement_BorderWidth) var(--sapField_ReadOnly_BorderColor) dashed;--_ui5-v2-1-1_checkbox_inner_error_border: var(--sapField_InvalidBorderWidth) solid var(--sapField_InvalidColor);--_ui5-v2-1-1_checkbox_inner_error_background_hover: var(--sapField_Hover_Background);--_ui5-v2-1-1_checkbox_inner_warning_border: var(--sapField_WarningBorderWidth) solid var(--sapField_WarningColor);--_ui5-v2-1-1_checkbox_inner_warning_color: var(--sapField_WarningColor);--_ui5-v2-1-1_checkbox_inner_warning_background_hover: var(--sapField_Hover_Background);--_ui5-v2-1-1_checkbox_checkmark_warning_color: var(--sapField_WarningColor);--_ui5-v2-1-1_checkbox_inner_success_border: var(--sapField_SuccessBorderWidth) solid var(--sapField_SuccessColor);--_ui5-v2-1-1_checkbox_inner_success_background_hover: var(--sapField_Hover_Background);--_ui5-v2-1-1_checkbox_inner_information_color: var(--sapField_InformationColor);--_ui5-v2-1-1_checkbox_inner_information_border: var(--sapField_InformationBorderWidth) solid var(--sapField_InformationColor);--_ui5-v2-1-1_checkbox_inner_information_background_hover: var(--sapField_Hover_Background);--_ui5-v2-1-1_checkbox_disabled_opacity: var(--sapContent_DisabledOpacity);--_ui5-v2-1-1_checkbox_focus_position: .3125rem;--_ui5-v2-1-1_checkbox_focus_border_radius: .5rem;--_ui5-v2-1-1_checkbox_right_focus_distance: var(--_ui5-v2-1-1_checkbox_focus_position);--_ui5-v2-1-1_color-palette-item-after-focus-inset: .0625rem;--_ui5-v2-1-1_color-palette-item-outer-border-radius: .25rem;--_ui5-v2-1-1_color-palette-item-inner-border-radius: .1875rem;--_ui5-v2-1-1_color-palette-item-after-not-focus-color: .0625rem solid var(--sapGroup_ContentBackground);--_ui5-v2-1-1_color-palette-item-container-sides-padding: .3125rem;--_ui5-v2-1-1_color-palette-item-container-rows-padding: .6875rem;--_ui5-v2-1-1_color-palette-item-focus-height: 1.5rem;--_ui5-v2-1-1_color-palette-item-container-padding: var(--_ui5-v2-1-1_color-palette-item-container-sides-padding) var(--_ui5-v2-1-1_color-palette-item-container-rows-padding);--_ui5-v2-1-1_color-palette-item-hover-margin: .0625rem;--_ui5-v2-1-1_color-palette-row-height: 9.5rem;--_ui5-v2-1-1_color-palette-button-height: 3rem;--_ui5-v2-1-1_color-palette-item-before-focus-color: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-1-1_color-palette-item-before-focus-inset: -.3125rem;--_ui5-v2-1-1_color-palette-item-before-focus-hover-inset: -.0625rem;--_ui5-v2-1-1_color-palette-item-after-focus-color: .0625rem solid var(--sapContent_ContrastFocusColor);--_ui5-v2-1-1_color-palette-item-selected-focused-border-after: none;--_ui5-v2-1-1_color-palette-item-after-focus-hover-inset: .0625rem;--_ui5-v2-1-1_color-palette-item-before-focus-border-radius: .4375rem;--_ui5-v2-1-1_color-palette-item-after-focus-border-radius: .3125rem;--_ui5-v2-1-1_color-palette-item-hover-outer-border-radius: .4375rem;--_ui5-v2-1-1_color-palette-item-hover-inner-border-radius: .375rem;--_ui5-v2-1-1_color-palette-item-selected-focused-border-before: -.0625rem;--_ui5-v2-1-1_color-palette-item-after-focus-not-selected-border: none;--_ui5-v2-1-1_color-palette-item-selected-focused-border: none;--_ui5-v2-1-1_color_picker_circle_outer_border: .0625rem solid var(--sapContent_ContrastShadowColor);--_ui5-v2-1-1_color_picker_circle_inner_border: .0625rem solid var(--sapField_BorderColor);--_ui5-v2-1-1_color_picker_circle_inner_circle_size: .5625rem;--_ui5-v2-1-1_color_picker_slider_handle_box_shadow: .125rem solid var(--sapField_BorderColor);--_ui5-v2-1-1_color_picker_slider_handle_border: .125rem solid var(--sapField_BorderColor);--_ui5-v2-1-1_color_picker_slider_handle_outline_hover: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-1-1_color_picker_slider_handle_outline_focus: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-1-1_color_picker_slider_handle_margin_top: -.1875rem;--_ui5-v2-1-1_color_picker_slider_handle_focus_margin_top: var(--_ui5-v2-1-1_color_picker_slider_handle_margin_top);--_ui5-v2-1-1_color_picker_slider_container_margin_top: -11px;--_ui5-v2-1-1_color_picker_slider_handle_inline_focus: 1px solid var(--sapContent_ContrastFocusColor);--_ui5-v2-1-1_datepicker_icon_border: none;--_ui5-v2-1-1-datepicker-hover-background: var(--sapField_Hover_Background);--_ui5-v2-1-1-datepicker_border_radius: .25rem;--_ui5-v2-1-1-datepicker_icon_border_radius: .125rem;--_ui5-v2-1-1_daypicker_item_box_shadow: inset 0 0 0 .0625rem var(--sapContent_Selected_ForegroundColor);--_ui5-v2-1-1_daypicker_item_margin: 2px;--_ui5-v2-1-1_daypicker_item_border: none;--_ui5-v2-1-1_daypicker_item_selected_border_color: var(--sapList_Background);--_ui5-v2-1-1_daypicker_daynames_container_height: 2rem;--_ui5-v2-1-1_daypicker_weeknumbers_container_padding_top: 2rem;--_ui5-v2-1-1_daypicker_item_othermonth_background_color: var(--sapList_Background);--_ui5-v2-1-1_daypicker_item_othermonth_color: var(--sapContent_LabelColor);--_ui5-v2-1-1_daypicker_item_othermonth_hover_color: var(--sapContent_LabelColor);--_ui5-v2-1-1_daypicker_item_now_inner_border_radius: 0;--_ui5-v2-1-1_daypicker_item_outline_width: 1px;--_ui5-v2-1-1_daypicker_item_outline_offset: 1px;--_ui5-v2-1-1_daypicker_item_now_focus_after_width: calc(100% - .25rem) ;--_ui5-v2-1-1_daypicker_item_now_focus_after_height: calc(100% - .25rem) ;--_ui5-v2-1-1_daypicker_item_now_selected_focus_after_width: calc(100% - .375rem) ;--_ui5-v2-1-1_daypicker_item_now_selected_focus_after_height: calc(100% - .375rem) ;--_ui5-v2-1-1_daypicker_item_selected_background: transparent;--_ui5-v2-1-1_daypicker_item_outline_focus_after: none;--_ui5-v2-1-1_daypicker_item_border_focus_after: var(--_ui5-v2-1-1_daypicker_item_outline_width) dotted var(--sapContent_FocusColor);--_ui5-v2-1-1_daypicker_item_width_focus_after: calc(100% - .25rem) ;--_ui5-v2-1-1_daypicker_item_height_focus_after: calc(100% - .25rem) ;--_ui5-v2-1-1_daypicker_item_now_outline: none;--_ui5-v2-1-1_daypicker_item_now_outline_offset: none;--_ui5-v2-1-1_daypicker_item_now_outline_offset_focus_after: var(--_ui5-v2-1-1_daypicker_item_now_outline_offset);--_ui5-v2-1-1_daypicker_item_selected_between_hover_background: var(--sapList_Hover_SelectionBackground);--_ui5-v2-1-1_daypicker_item_now_not_selected_inset: 0;--_ui5-v2-1-1_daypicker_item_now_border_color: var(--sapLegend_CurrentDateTime);--_ui5-v2-1-1_dp_two_calendar_item_secondary_text_border_radios: .25rem;--_ui5-v2-1-1_daypicker_special_day_top: 2.5rem;--_ui5-v2-1-1_daypicker_special_day_before_border_color: var(--sapList_Background);--_ui5-v2-1-1_daypicker_selected_item_now_special_day_border_bottom_radius: 0;--_ui5-v2-1-1_daypicker_twocalendar_item_special_day_after_border_width: .125rem;--_ui5-v2-1-1_daypicker_twocalendar_item_special_day_dot: .375rem;--_ui5-v2-1-1_daypicker_twocalendar_item_special_day_top: 2rem;--_ui5-v2-1-1_daypicker_twocalendar_item_special_day_right: 1.4375rem;--_ui5-v2-1-1_daypicker_item_border_radius: .4375rem;--_ui5-v2-1-1_daypicker_item_focus_border: .0625rem dotted var(--sapContent_FocusColor);--_ui5-v2-1-1_daypicker_item_selected_border: .0625rem solid var(--sapList_SelectionBorderColor);--_ui5-v2-1-1_daypicker_item_not_selected_focus_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-1-1_daypicker_item_selected_focus_color: var(--sapContent_FocusColor);--_ui5-v2-1-1_daypicker_item_selected_focus_width: .125rem;--_ui5-v2-1-1_daypicker_item_no_selected_inset: .375rem;--_ui5-v2-1-1_daypicker_item_now_border_focus_after: .125rem solid var(--sapList_SelectionBorderColor);--_ui5-v2-1-1_daypicker_item_now_border_radius_focus_after: .3125rem;--_ui5-v2-1-1_day_picker_item_selected_now_border_focus: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-1-1_day_picker_item_selected_now_border_radius_focus: .1875rem;--ui5-v2-1-1-dp-item_withsecondtype_border: .375rem;--_ui5-v2-1-1_daypicker_item_now_border: .125rem solid var(--sapLegend_CurrentDateTime);--_ui5-v2-1-1_daypicker_dayname_color: var(--sapContent_LabelColor);--_ui5-v2-1-1_daypicker_weekname_color: var(--sapContent_LabelColor);--_ui5-v2-1-1_daypicker_item_selected_box_shadow: inset 0 0 0 .0625rem var(--sapContent_Selected_ForegroundColor);--_ui5-v2-1-1_daypicker_item_selected_daytext_hover_background: transparent;--_ui5-v2-1-1_daypicker_item_border_radius_item: .5rem;--_ui5-v2-1-1_daypicker_item_border_radius_focus_after: .1875rem;--_ui5-v2-1-1_daypicker_item_selected_between_border: .5rem;--_ui5-v2-1-1_daypicker_item_selected_between_background: var(--sapList_SelectionBackgroundColor);--_ui5-v2-1-1_daypicker_item_selected_between_text_background: transparent;--_ui5-v2-1-1_daypicker_item_selected_between_text_font: var(--sapFontFamily);--_ui5-v2-1-1_daypicker_item_selected_text_font: var(--sapFontBoldFamily);--_ui5-v2-1-1_daypicker_item_now_box_shadow: inset 0 0 0 .35rem var(--sapList_Background);--_ui5-v2-1-1_daypicker_item_selected_text_outline: .0625rem solid var(--sapSelectedColor);--_ui5-v2-1-1_daypicker_item_now_selected_outline_offset: -.25rem;--_ui5-v2-1-1_daypicker_item_now_selected_between_inset: .25rem;--_ui5-v2-1-1_daypicker_item_now_selected_between_border: .0625rem solid var(--sapContent_Selected_ForegroundColor);--_ui5-v2-1-1_daypicker_item_now_selected_between_border_radius: .1875rem;--_ui5-v2-1-1_daypicker_item_select_between_border: 1px solid var(--sapContent_Selected_ForegroundColor);--_ui5-v2-1-1_daypicker_item_weeekend_filter: brightness(105%);--_ui5-v2-1-1_daypicker_item_selected_hover: var(--sapList_Hover_Background);--_ui5-v2-1-1_daypicker_item_now_inset: .3125rem;--_ui5-v2-1-1-dp-item_withsecondtype_border: .25rem;--_ui5-v2-1-1_daypicker_item_selected__secondary_type_text_outline: .0625rem solid var(--sapSelectedColor);--_ui5-v2-1-1_daypicker_two_calendar_item_now_day_text_content: "";--_ui5-v2-1-1_daypicker_two_calendar_item_now_selected_border_width: .125rem;--_ui5-v2-1-1_daypicker_two_calendar_item_border_radius: .5rem;--_ui5-v2-1-1_daypicker_two_calendar_item_border_focus_border_radius: .375rem;--_ui5-v2-1-1_daypicker_two_calendar_item_no_selected_inset: 0;--_ui5-v2-1-1_daypicker_two_calendar_item_selected_now_border_radius_focus: .1875rem;--_ui5-v2-1-1_daypicker_two_calendar_item_no_selected_focus_inset: .1875rem;--_ui5-v2-1-1_daypicker_two_calendar_item_no_select_focus_border_radius: .3125rem;--_ui5-v2-1-1_daypicker_two_calendar_item_now_inset: .3125rem;--_ui5-v2-1-1_daypicker_two_calendar_item_now_selected_border_inset: .125rem;--_ui5-v2-1-1_daypicker_selected_item_special_day_width: calc(100% - .125rem) ;--_ui5-v2-1-1_daypicker_special_day_border_bottom_radius: .5rem;--_ui5-v2-1-1-daypicker_item_selected_now_border_radius: .5rem;--_ui5-v2-1-1_daypicker_selected_item_now_special_day_width: calc(100% - .1875rem) ;--_ui5-v2-1-1_daypicker_selected_item_now_special_day_border_bottom_radius_alternate: .5rem;--_ui5-v2-1-1_daypicker_selected_item_now_special_day_top: 2.4375rem;--_ui5-v2-1-1_daypicker_two_calendar_item_margin_bottom: 0;--_ui5-v2-1-1_daypicker_twocalendar_item_special_day_now_inset: .3125rem;--_ui5-v2-1-1_daypicker_twocalendar_item_special_day_now_border_radius: .25rem;--_ui5-v2-1-1_daypicker_item_now_focus_margin: 0;--_ui5-v2-1-1_daypicker_special_day_border_top: none;--_ui5-v2-1-1_daypicker_special_day_selected_border_radius_bottom: .25rem;--_ui5-v2-1-1_daypicker_specialday_focused_top: 2.125rem;--_ui5-v2-1-1_daypicker_specialday_focused_width: calc(100% - .75rem) ;--_ui5-v2-1-1_daypicker_specialday_focused_border_bottom: 0;--_ui5-v2-1-1_daypicker_item_now_specialday_top: 2.3125rem;--_ui5-v2-1-1_daypicker_item_now_specialday_width: calc(100% - .5rem) ;--_ui5-v2-1-1_dialog_resize_handle_color: var(--sapButton_Lite_TextColor);--_ui5-v2-1-1_dialog_header_error_state_icon_color: var(--sapNegativeElementColor);--_ui5-v2-1-1_dialog_header_information_state_icon_color: var(--sapInformativeElementColor);--_ui5-v2-1-1_dialog_header_success_state_icon_color: var(--sapPositiveElementColor);--_ui5-v2-1-1_dialog_header_warning_state_icon_color: var(--sapCriticalElementColor);--_ui5-v2-1-1_dialog_header_state_line_height: .0625rem;--_ui5-v2-1-1_dialog_header_focus_bottom_offset: 2px;--_ui5-v2-1-1_dialog_header_focus_top_offset: 1px;--_ui5-v2-1-1_dialog_header_focus_left_offset: 1px;--_ui5-v2-1-1_dialog_header_focus_right_offset: 1px;--_ui5-v2-1-1_dialog_resize_handle_right: 0;--_ui5-v2-1-1_dialog_resize_handle_bottom: 3px;--_ui5-v2-1-1_dialog_header_border_radius: var(--sapElement_BorderCornerRadius);--_ui5-v2-1-1_file_uploader_value_state_error_hover_background_color: var(--sapField_Hover_Background);--_ui5-v2-1-1_file_uploader_hover_border: none;--_ui5-v2-1-1_table_cell_valign: center;--_ui5-v2-1-1_table_cell_min_width: 2.75rem;--_ui5-v2-1-1_table_navigated_cell_width: .1875rem;--_ui5-v2-1-1_table_shadow_border_left: inset var(--sapContent_FocusWidth) 0 var(--sapContent_FocusColor);--_ui5-v2-1-1_table_shadow_border_right: inset calc(-1 * var(--sapContent_FocusWidth)) 0 var(--sapContent_FocusColor);--_ui5-v2-1-1_table_shadow_border_top: inset 0 var(--sapContent_FocusWidth) var(--sapContent_FocusColor);--_ui5-v2-1-1_table_shadow_border_bottom: inset 0 -1px var(--sapContent_FocusColor);--ui5-v2-1-1-form-item-layout: 1fr 2fr;--ui5-v2-1-1-form-item-layout-span1: 1fr 11fr;--ui5-v2-1-1-form-item-layout-span2: 2fr 10fr;--ui5-v2-1-1-form-item-layout-span3: 3fr 9fr;--ui5-v2-1-1-form-item-layout-span4: 4fr 8fr;--ui5-v2-1-1-form-item-layout-span5: 5fr 7fr;--ui5-v2-1-1-form-item-layout-span6: 6fr 6fr;--ui5-v2-1-1-form-item-layout-span7: 7fr 5fr;--ui5-v2-1-1-form-item-layout-span8: 8fr 4fr;--ui5-v2-1-1-form-item-layout-span9: 9fr 3fr;--ui5-v2-1-1-form-item-layout-span10: 10fr 2fr;--ui5-v2-1-1-form-item-layout-span11: 11fr 1fr;--ui5-v2-1-1-form-item-layout-span12: 1fr;--ui5-v2-1-1-form-item-label-justify: end;--ui5-v2-1-1-form-item-label-justify-span12: start;--ui5-v2-1-1-form-item-label-padding: .125rem 0;--ui5-v2-1-1-form-item-label-padding-end: .85rem;--ui5-v2-1-1-form-item-label-padding-span12: .625rem .25rem 0 .25rem;--ui5-v2-1-1-group-header-listitem-background-color: var(--sapList_GroupHeaderBackground);--ui5-v2-1-1-icon-focus-border-radius: .25rem;--_ui5-v2-1-1_input_width: 13.125rem;--_ui5-v2-1-1_input_min_width: 2.75rem;--_ui5-v2-1-1_input_height: var(--sapElement_Height);--_ui5-v2-1-1_input_compact_height: 1.625rem;--_ui5-v2-1-1_input_value_state_error_hover_background: var(--sapField_Hover_Background);--_ui5-v2-1-1_input_background_color: var(--sapField_Background);--_ui5-v2-1-1_input_border_radius: var(--sapField_BorderCornerRadius);--_ui5-v2-1-1_input_placeholder_style: italic;--_ui5-v2-1-1_input_placeholder_color: var(--sapField_PlaceholderTextColor);--_ui5-v2-1-1_input_bottom_border_height: 0;--_ui5-v2-1-1_input_bottom_border_color: transparent;--_ui5-v2-1-1_input_focused_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-1-1_input_state_border_width: .125rem;--_ui5-v2-1-1_input_information_border_width: .125rem;--_ui5-v2-1-1_input_error_font_weight: normal;--_ui5-v2-1-1_input_warning_font_weight: normal;--_ui5-v2-1-1_input_focus_border_width: 1px;--_ui5-v2-1-1_input_error_warning_font_style: inherit;--_ui5-v2-1-1_input_error_warning_text_indent: 0;--_ui5-v2-1-1_input_disabled_color: var(--sapContent_DisabledTextColor);--_ui5-v2-1-1_input_disabled_font_weight: normal;--_ui5-v2-1-1_input_disabled_border_color: var(--sapField_BorderColor);--_ui5-v2-1-1-input_disabled_background: var(--sapField_Background);--_ui5-v2-1-1_input_readonly_border_color: var(--sapField_ReadOnly_BorderColor);--_ui5-v2-1-1_input_readonly_background: var(--sapField_ReadOnly_Background);--_ui5-v2-1-1_input_disabled_opacity: var(--sapContent_DisabledOpacity);--_ui5-v2-1-1_input_icon_min_width: 2.25rem;--_ui5-v2-1-1_input_compact_min_width: 2rem;--_ui5-v2-1-1_input_transition: none;--_ui5-v2-1-1-input-value-state-icon-display: none;--_ui5-v2-1-1_input_value_state_error_border_color: var(--sapField_InvalidColor);--_ui5-v2-1-1_input_focused_value_state_error_border_color: var(--sapField_InvalidColor);--_ui5-v2-1-1_input_value_state_warning_border_color: var(--sapField_WarningColor);--_ui5-v2-1-1_input_focused_value_state_warning_border_color: var(--sapField_WarningColor);--_ui5-v2-1-1_input_value_state_success_border_color: var(--sapField_SuccessColor);--_ui5-v2-1-1_input_focused_value_state_success_border_color: var(--sapField_SuccessColor);--_ui5-v2-1-1_input_value_state_success_border_width: 1px;--_ui5-v2-1-1_input_value_state_information_border_color: var(--sapField_InformationColor);--_ui5-v2-1-1_input_focused_value_state_information_border_color: var(--sapField_InformationColor);--_ui5-v2-1-1-input-value-state-information-border-width: 1px;--_ui5-v2-1-1-input-background-image: none;--ui5-v2-1-1_input_focus_pseudo_element_content: "";--_ui5-v2-1-1_input_value_state_error_warning_placeholder_font_weight: normal;--_ui5-v2-1-1-input_error_placeholder_color: var(--sapField_PlaceholderTextColor);--_ui5-v2-1-1_input_icon_width: 2.25rem;--_ui5-v2-1-1-input-icons-count: 0;--_ui5-v2-1-1_input_margin_top_bottom: .1875rem;--_ui5-v2-1-1_input_tokenizer_min_width: 3.25rem;--_ui5-v2-1-1-input-border: none;--_ui5-v2-1-1_input_hover_border: none;--_ui5-v2-1-1_input_focus_border_radius: .25rem;--_ui5-v2-1-1_input_readonly_focus_border_radius: .125rem;--_ui5-v2-1-1_input_error_warning_border_style: none;--_ui5-v2-1-1_input_focused_value_state_error_background: var(--sapField_Hover_Background);--_ui5-v2-1-1_input_focused_value_state_warning_background: var(--sapField_Hover_Background);--_ui5-v2-1-1_input_focused_value_state_success_background: var(--sapField_Hover_Background);--_ui5-v2-1-1_input_focused_value_state_information_background: var(--sapField_Hover_Background);--_ui5-v2-1-1_input_focused_value_state_error_focus_outline_color: var(--sapField_InvalidColor);--_ui5-v2-1-1_input_focused_value_state_warning_focus_outline_color: var(--sapField_WarningColor);--_ui5-v2-1-1_input_focused_value_state_success_focus_outline_color: var(--sapField_SuccessColor);--_ui5-v2-1-1_input_focus_offset: 0;--_ui5-v2-1-1_input_readonly_focus_offset: .125rem;--_ui5-v2-1-1_input_information_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-1-1_input_information_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-1-1_input_error_warning_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-1-1_input_error_warning_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-1-1_input_custom_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-1-1_input_error_warning_custom_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-1-1_input_error_warning_custom_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-1-1_input_information_custom_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-1-1_input_information_custom_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-1-1_input_focus_outline_color: var(--sapField_Active_BorderColor);--_ui5-v2-1-1_input_icon_wrapper_height: calc(100% - 1px) ;--_ui5-v2-1-1_input_icon_wrapper_state_height: calc(100% - 2px) ;--_ui5-v2-1-1_input_icon_wrapper_success_state_height: calc(100% - var(--_ui5-v2-1-1_input_value_state_success_border_width));--_ui5-v2-1-1_input_icon_color: var(--sapContent_IconColor);--_ui5-v2-1-1_input_icon_pressed_bg: var(--sapButton_Selected_Background);--_ui5-v2-1-1_input_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-1-1_input_icon_hover_bg: var(--sapField_Focus_Background);--_ui5-v2-1-1_input_icon_pressed_color: var(--sapButton_Active_TextColor);--_ui5-v2-1-1_input_icon_border_radius: .25rem;--_ui5-v2-1-1_input_icon_box_shadow: var(--sapField_Hover_Shadow);--_ui5-v2-1-1_input_icon_border: none;--_ui5-v2-1-1_input_error_icon_box_shadow: var(--sapContent_Negative_Shadow);--_ui5-v2-1-1_input_warning_icon_box_shadow: var(--sapContent_Critical_Shadow);--_ui5-v2-1-1_input_information_icon_box_shadow: var(--sapContent_Informative_Shadow);--_ui5-v2-1-1_input_success_icon_box_shadow: var(--sapContent_Positive_Shadow);--_ui5-v2-1-1_input_icon_error_pressed_color: var(--sapButton_Reject_Selected_TextColor);--_ui5-v2-1-1_input_icon_warning_pressed_color: var(--sapButton_Attention_Selected_TextColor);--_ui5-v2-1-1_input_icon_information_pressed_color: var(--sapButton_Selected_TextColor);--_ui5-v2-1-1_input_icon_success_pressed_color: var(--sapButton_Accept_Selected_TextColor);--_ui5-v2-1-1_link_focus_text_decoration: underline;--_ui5-v2-1-1_link_text_decoration: var(--sapLink_TextDecoration);--_ui5-v2-1-1_link_hover_text_decoration: var(--sapLink_Hover_TextDecoration);--_ui5-v2-1-1_link_focused_hover_text_decoration: none;--_ui5-v2-1-1_link_focused_hover_text_color: var(--sapContent_ContrastTextColor);--_ui5-v2-1-1_link_active_text_decoration: var(--sapLink_Active_TextDecoration);--_ui5-v2-1-1_link_outline: none;--_ui5-v2-1-1_link_focus_border-radius: .125rem;--_ui5-v2-1-1_link_focus_background_color: var(--sapContent_FocusColor);--_ui5-v2-1-1_link_focus_color: var(--sapContent_ContrastTextColor);--_ui5-v2-1-1_link_subtle_text_decoration: underline;--_ui5-v2-1-1_link_subtle_text_decoration_hover: none;--ui5-v2-1-1_list_footer_text_color: var(--sapList_FooterTextColor);--ui5-v2-1-1-listitem-background-color: var(--sapList_Background);--ui5-v2-1-1-listitem-border-bottom: var(--sapList_BorderWidth) solid var(--sapList_BorderColor);--ui5-v2-1-1-listitem-selected-border-bottom: 1px solid var(--sapList_SelectionBorderColor);--ui5-v2-1-1-listitem-focused-selected-border-bottom: 1px solid var(--sapList_SelectionBorderColor);--_ui5-v2-1-1_listitembase_focus_width: 1px;--_ui5-v2-1-1-listitembase_disabled_opacity: .5;--_ui5-v2-1-1_product_switch_item_border: none;--ui5-v2-1-1-listitem-active-border-color: var(--sapContent_FocusColor);--_ui5-v2-1-1_menu_item_padding: 0 1rem 0 .75rem;--_ui5-v2-1-1_menu_item_submenu_icon_right: 1rem;--_ui5-v2-1-1_menu_item_additional_text_start_margin: 1rem;--_ui5-v2-1-1_menu_popover_border_radius: var(--sapPopover_BorderCornerRadius);--_ui5-v2-1-1_monthpicker_item_border: none;--_ui5-v2-1-1_monthpicker_item_margin: 1px;--_ui5-v2-1-1_monthpicker_item_border_radius: .5rem;--_ui5-v2-1-1_monthpicker_item_focus_after_border: var(--_ui5-v2-1-1_button_focused_border);--_ui5-v2-1-1_monthpicker_item_focus_after_border_radius: .5rem;--_ui5-v2-1-1_monthpicker_item_focus_after_width: calc(100% - .5rem) ;--_ui5-v2-1-1_monthpicker_item_focus_after_height: calc(100% - .5rem) ;--_ui5-v2-1-1_monthpicker_item_focus_after_offset: .25rem;--_ui5-v2-1-1_monthpicker_item_selected_text_color: var(--sapContent_Selected_TextColor);--_ui5-v2-1-1_monthpicker_item_selected_background_color:var(--sapLegend_WorkingBackground);--_ui5-v2-1-1_monthpicker_item_selected_hover_color: var(--sapList_Hover_Background);--_ui5-v2-1-1_monthpicker_item_selected_box_shadow: none;--_ui5-v2-1-1_monthpicker_item_focus_after_outline: .125rem solid var(--sapSelectedColor);--_ui5-v2-1-1_monthpicker_item_selected_font_wieght: bold;--_ui5-v2-1-1_message_strip_icon_width: 2.5rem;--_ui5-v2-1-1_message_strip_button_border_width: 0;--_ui5-v2-1-1_message_strip_button_border_style: none;--_ui5-v2-1-1_message_strip_button_border_color: transparent;--_ui5-v2-1-1_message_strip_button_border_radius: 0;--_ui5-v2-1-1_message_strip_padding: .4375rem 2.5rem .4375rem 2.5rem;--_ui5-v2-1-1_message_strip_padding_block_no_icon: .4375rem .4375rem;--_ui5-v2-1-1_message_strip_padding_inline_no_icon: 1rem 2.5rem;--_ui5-v2-1-1_message_strip_button_height: 1.625rem;--_ui5-v2-1-1_message_strip_border_width: 1px;--_ui5-v2-1-1_message_strip_close_button_border: none;--_ui5-v2-1-1_message_strip_icon_top: .4375rem;--_ui5-v2-1-1_message_strip_focus_width: 1px;--_ui5-v2-1-1_message_strip_focus_offset: -2px;--_ui5-v2-1-1_message_strip_close_button_top: .125rem;--_ui5-v2-1-1_message_strip_close_button_color_set_1_background: #eaecee4d;--_ui5-v2-1-1_message_strip_close_button_color_set_2_background: #eaecee80;--_ui5-v2-1-1_message_strip_close_button_color_set_1_color: var(--sapButton_Emphasized_TextColor);--_ui5-v2-1-1_message_strip_close_button_color_set_1_hover_color: var(--sapButton_Emphasized_TextColor);--_ui5-v2-1-1_message_strip_scheme_1_set_2_background: var(--sapIndicationColor_1b);--_ui5-v2-1-1_message_strip_scheme_1_set_2_border_color: var(--sapIndicationColor_1b_BorderColor);--_ui5-v2-1-1_message_strip_scheme_2_set_2_background: var(--sapIndicationColor_2b);--_ui5-v2-1-1_message_strip_scheme_2_set_2_border_color: var(--sapIndicationColor_2b_BorderColor);--_ui5-v2-1-1_message_strip_scheme_3_set_2_background: var(--sapIndicationColor_3b);--_ui5-v2-1-1_message_strip_scheme_3_set_2_border_color: var(--sapIndicationColor_3b_BorderColor);--_ui5-v2-1-1_message_strip_scheme_4_set_2_background: var(--sapIndicationColor_4b);--_ui5-v2-1-1_message_strip_scheme_4_set_2_border_color: var(--sapIndicationColor_4b_BorderColor);--_ui5-v2-1-1_message_strip_scheme_5_set_2_background: var(--sapIndicationColor_5b);--_ui5-v2-1-1_message_strip_scheme_5_set_2_border_color: var(--sapIndicationColor_5b_BorderColor);--_ui5-v2-1-1_message_strip_scheme_6_set_2_background: var(--sapIndicationColor_6b);--_ui5-v2-1-1_message_strip_scheme_6_set_2_border_color: var(--sapIndicationColor_6b_BorderColor);--_ui5-v2-1-1_message_strip_scheme_7_set_2_background: var(--sapIndicationColor_7b);--_ui5-v2-1-1_message_strip_scheme_7_set_2_border_color: var(--sapIndicationColor_7b_BorderColor);--_ui5-v2-1-1_message_strip_scheme_8_set_2_background: var(--sapIndicationColor_8b);--_ui5-v2-1-1_message_strip_scheme_8_set_2_border_color: var(--sapIndicationColor_8b_BorderColor);--_ui5-v2-1-1_message_strip_scheme_9_set_2_background: var(--sapIndicationColor_9b);--_ui5-v2-1-1_message_strip_scheme_9_set_2_border_color: var(--sapIndicationColor_9b_BorderColor);--_ui5-v2-1-1_message_strip_scheme_10_set_2_background: var(--sapIndicationColor_10b);--_ui5-v2-1-1_message_strip_scheme_10_set_2_border_color: var(--sapIndicationColor_10b_BorderColor);--_ui5-v2-1-1_message_strip_close_button_right: .1875rem;--_ui5-v2-1-1_panel_focus_border: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-1-1_panel_header_height: 2.75rem;--_ui5-v2-1-1_panel_button_root_width: 2.75rem;--_ui5-v2-1-1_panel_button_root_height: 2.75rem;--_ui5-v2-1-1_panel_header_padding_right: .5rem;--_ui5-v2-1-1_panel_header_button_wrapper_padding: .25rem;--_ui5-v2-1-1_panel_border_radius: var(--sapElement_BorderCornerRadius);--_ui5-v2-1-1_panel_border_bottom: none;--_ui5-v2-1-1_panel_default_header_border: .0625rem solid var(--sapGroup_TitleBorderColor);--_ui5-v2-1-1_panel_outline_offset: -.125rem;--_ui5-v2-1-1_panel_border_radius_expanded: var(--sapElement_BorderCornerRadius) var(--sapElement_BorderCornerRadius) 0 0;--_ui5-v2-1-1_panel_icon_color: var(--sapButton_Lite_TextColor);--_ui5-v2-1-1_panel_focus_offset: 0px;--_ui5-v2-1-1_panel_focus_bottom_offset: -1px;--_ui5-v2-1-1_panel_content_padding: .625rem 1rem;--_ui5-v2-1-1_panel_header_background_color: var(--sapGroup_TitleBackground);--_ui5-v2-1-1_popover_background: var(--sapGroup_ContentBackground);--_ui5-v2-1-1_popover_box_shadow: var(--sapContent_Shadow2);--_ui5-v2-1-1_popover_no_arrow_box_shadow: var(--sapContent_Shadow1);--_ui5-v2-1-1_popup_content_padding_s: 1rem;--_ui5-v2-1-1_popup_content_padding_m_l: 2rem;--_ui5-v2-1-1_popup_content_padding_xl: 3rem;--_ui5-v2-1-1_popup_header_footer_padding_s: 1rem;--_ui5-v2-1-1_popup_header_footer_padding_m_l: 2rem;--_ui5-v2-1-1_popup_header_footer_padding_xl: 3rem;--_ui5-v2-1-1_popup_viewport_margin: 10px;--_ui5-v2-1-1_popup_header_font_weight: 400;--_ui5-v2-1-1_popup_header_prop_header_text_alignment: flex-start;--_ui5-v2-1-1_popup_header_background: var(--sapPageHeader_Background);--_ui5-v2-1-1_popup_header_shadow: var(--sapContent_HeaderShadow);--_ui5-v2-1-1_popup_header_border: none;--_ui5-v2-1-1_popup_border_radius: .5rem;--_ui5-v2-1-1_popup_block_layer_background: color-mix(in oklch, transparent, var(--sapBlockLayer_Background) 60%);--_ui5-v2-1-1_progress_indicator_bar_border_max: none;--_ui5-v2-1-1_progress_indicator_icon_visibility: inline-block;--_ui5-v2-1-1_progress_indicator_side_points_visibility: block;--_ui5-v2-1-1_progress_indicator_padding: 1.25rem 0 .75rem 0;--_ui5-v2-1-1_progress_indicator_padding_novalue: .3125rem;--_ui5-v2-1-1_progress_indicator_padding_end: 1.25rem;--_ui5-v2-1-1_progress_indicator_host_height: unset;--_ui5-v2-1-1_progress_indicator_host_min_height: unset;--_ui5-v2-1-1_progress_indicator_host_box_sizing: border-box;--_ui5-v2-1-1_progress_indicator_root_position: relative;--_ui5-v2-1-1_progress_indicator_root_border_radius: .25rem;--_ui5-v2-1-1_progress_indicator_root_height: .375rem;--_ui5-v2-1-1_progress_indicator_root_min_height: .375rem;--_ui5-v2-1-1_progress_indicator_root_overflow: visible;--_ui5-v2-1-1_progress_indicator_bar_height: .625rem;--_ui5-v2-1-1_progress_indicator_bar_border_radius: .5rem;--_ui5-v2-1-1_progress_indicator_remaining_bar_border_radius: .25rem;--_ui5-v2-1-1_progress_indicator_remaining_bar_position: absolute;--_ui5-v2-1-1_progress_indicator_remaining_bar_width: 100%;--_ui5-v2-1-1_progress_indicator_remaining_bar_overflow: visible;--_ui5-v2-1-1_progress_indicator_icon_position: absolute;--_ui5-v2-1-1_progress_indicator_icon_right_position: -1.25rem;--_ui5-v2-1-1_progress_indicator_value_margin: 0 0 .1875rem 0;--_ui5-v2-1-1_progress_indicator_value_position: absolute;--_ui5-v2-1-1_progress_indicator_value_top_position: -1.3125rem;--_ui5-v2-1-1_progress_indicator_value_left_position: 0;--_ui5-v2-1-1_progress_indicator_background_none: var(--sapProgress_Background);--_ui5-v2-1-1_progress_indicator_background_error: var(--sapProgress_NegativeBackground);--_ui5-v2-1-1_progress_indicator_background_warning: var(--sapProgress_CriticalBackground);--_ui5-v2-1-1_progress_indicator_background_success: var(--sapProgress_PositiveBackground);--_ui5-v2-1-1_progress_indicator_background_information: var(--sapProgress_InformationBackground);--_ui5-v2-1-1_progress_indicator_value_state_none: var(--sapProgress_Value_Background);--_ui5-v2-1-1_progress_indicator_value_state_error: var(--sapProgress_Value_NegativeBackground);--_ui5-v2-1-1_progress_indicator_value_state_warning: var(--sapProgress_Value_CriticalBackground);--_ui5-v2-1-1_progress_indicator_value_state_success: var(--sapProgress_Value_PositiveBackground);--_ui5-v2-1-1_progress_indicator_value_state_information: var(--sapProgress_Value_InformationBackground);--_ui5-v2-1-1_progress_indicator_value_state_error_icon_color: var(--sapProgress_Value_NegativeTextColor);--_ui5-v2-1-1_progress_indicator_value_state_warning_icon_color: var(--sapProgress_Value_CriticalTextColor);--_ui5-v2-1-1_progress_indicator_value_state_success_icon_color: var(--sapProgress_Value_PositiveTextColor);--_ui5-v2-1-1_progress_indicator_value_state_information_icon_color: var(--sapProgress_Value_InformationTextColor);--_ui5-v2-1-1_progress_indicator_border: none;--_ui5-v2-1-1_progress_indicator_border_color_error: var(--sapErrorBorderColor);--_ui5-v2-1-1_progress_indicator_border_color_warning: var(--sapWarningBorderColor);--_ui5-v2-1-1_progress_indicator_border_color_success: var(--sapSuccessBorderColor);--_ui5-v2-1-1_progress_indicator_border_color_information: var(--sapInformationBorderColor);--_ui5-v2-1-1_progress_indicator_color: var(--sapField_TextColor);--_ui5-v2-1-1_progress_indicator_bar_color: var(--sapProgress_TextColor);--_ui5-v2-1-1_progress_indicator_icon_size: var(--sapFontLargeSize);--_ui5-v2-1-1_rating_indicator_item_height: 1em;--_ui5-v2-1-1_rating_indicator_item_width: 1em;--_ui5-v2-1-1_rating_indicator_component_spacing: .5rem 0px;--_ui5-v2-1-1_rating_indicator_border_radius: .25rem;--_ui5-v2-1-1_rating_indicator_outline_offset: .125rem;--_ui5-v2-1-1_rating_indicator_readonly_item_height: .75em;--_ui5-v2-1-1_rating_indicator_readonly_item_width: .75em;--_ui5-v2-1-1_rating_indicator_readonly_item_spacing: .1875rem .1875rem;--_ui5-v2-1-1_segmented_btn_inner_border: .0625rem solid transparent;--_ui5-v2-1-1_segmented_btn_inner_border_odd_child: .0625rem solid transparent;--_ui5-v2-1-1_segmented_btn_inner_pressed_border_odd_child: .0625rem solid var(--sapButton_Selected_BorderColor);--_ui5-v2-1-1_segmented_btn_inner_border_radius: var(--sapButton_BorderCornerRadius);--_ui5-v2-1-1_segmented_btn_background_color: var(--sapButton_Lite_Background);--_ui5-v2-1-1_segmented_btn_border_color: var(--sapButton_Lite_BorderColor);--_ui5-v2-1-1_segmented_btn_hover_box_shadow: none;--_ui5-v2-1-1_segmented_btn_item_border_left: .0625rem;--_ui5-v2-1-1_segmented_btn_item_border_right: .0625rem;--_ui5-v2-1-1_button_base_min_compact_width: 2rem;--_ui5-v2-1-1_button_base_height: var(--sapElement_Height);--_ui5-v2-1-1_button_compact_height: 1.625rem;--_ui5-v2-1-1_button_border_radius: var(--sapButton_BorderCornerRadius);--_ui5-v2-1-1_button_compact_padding: .4375rem;--_ui5-v2-1-1_button_emphasized_outline: 1px dotted var(--sapContent_FocusColor);--_ui5-v2-1-1_button_focus_offset: 1px;--_ui5-v2-1-1_button_focus_width: 1px;--_ui5-v2-1-1_button_emphasized_focused_border_before: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-1-1_button_emphasized_focused_active_border_color: transparent;--_ui5-v2-1-1_button_focused_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-1-1_button_focused_border_radius: .375rem;--_ui5-v2-1-1_button_focused_inner_border_radius: .375rem;--_ui5-v2-1-1_button_base_min_width: 2.25rem;--_ui5-v2-1-1_button_base_padding: .5625rem;--_ui5-v2-1-1_button_base_icon_only_padding: .5625rem;--_ui5-v2-1-1_button_base_icon_margin: .375rem;--_ui5-v2-1-1_button_icon_font_size: 1rem;--_ui5-v2-1-1_button_text_shadow: none;--_ui5-v2-1-1_button_emphasized_border_width: .0625rem;--_ui5-v2-1-1_button_pressed_focused_border_color: var(--sapContent_FocusColor);--_ui5-v2-1-1_button_fontFamily: var(--sapFontSemiboldDuplexFamily);--_ui5-v2-1-1_button_emphasized_focused_border_color: var(--sapContent_ContrastFocusColor);--_ui5-v2-1-1_radio_button_min_width: 2.75rem;--_ui5-v2-1-1_radio_button_hover_fill_error: var(--sapField_Hover_Background);--_ui5-v2-1-1_radio_button_hover_fill_warning: var(--sapField_Hover_Background);--_ui5-v2-1-1_radio_button_hover_fill_success: var(--sapField_Hover_Background);--_ui5-v2-1-1_radio_button_hover_fill_information: var(--sapField_Hover_Background);--_ui5-v2-1-1_radio_button_checked_fill: var(--sapSelectedColor);--_ui5-v2-1-1_radio_button_checked_error_fill: var(--sapField_InvalidColor);--_ui5-v2-1-1_radio_button_checked_success_fill: var(--sapField_SuccessColor);--_ui5-v2-1-1_radio_button_checked_information_fill: var(--sapField_InformationColor);--_ui5-v2-1-1_radio_button_warning_error_border_dash: 0;--_ui5-v2-1-1_radio_button_outer_ring_color: var(--sapField_BorderColor);--_ui5-v2-1-1_radio_button_outer_ring_width: var(--sapField_BorderWidth);--_ui5-v2-1-1_radio_button_outer_ring_bg: var(--sapField_Background);--_ui5-v2-1-1_radio_button_outer_ring_hover_color: var(--sapField_Hover_BorderColor);--_ui5-v2-1-1_radio_button_outer_ring_active_color: var(--sapField_Hover_BorderColor);--_ui5-v2-1-1_radio_button_outer_ring_checked_hover_color: var(--sapField_Hover_BorderColor);--_ui5-v2-1-1_radio_button_outer_ring_padding_with_label: 0 .6875rem;--_ui5-v2-1-1_radio_button_border: none;--_ui5-v2-1-1_radio_button_focus_outline: block;--_ui5-v2-1-1_radio_button_color: var(--sapField_BorderColor);--_ui5-v2-1-1_radio_button_label_offset: 1px;--_ui5-v2-1-1_radio_button_items_align: unset;--_ui5-v2-1-1_radio_button_information_border_width: var(--sapField_InformationBorderWidth);--_ui5-v2-1-1_radio_button_border_width: var(--sapContent_FocusWidth);--_ui5-v2-1-1_radio_button_border_radius: .5rem;--_ui5-v2-1-1_radio_button_label_color: var(--sapField_TextColor);--_ui5-v2-1-1_radio_button_inner_ring_radius: 27.5%;--_ui5-v2-1-1_radio_button_outer_ring_padding: 0 .6875rem;--_ui5-v2-1-1_radio_button_read_only_border_type: 4,2;--_ui5-v2-1-1_radio_button_inner_ring_color: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-1-1_radio_button_checked_warning_fill: var(--sapField_WarningColor);--_ui5-v2-1-1_radio_button_read_only_inner_ring_color: var(--sapField_TextColor);--_ui5-v2-1-1_radio_button_read_only_border_width: var(--sapElement_BorderWidth);--_ui5-v2-1-1_radio_button_hover_fill: var(--sapContent_Selected_Hover_Background);--_ui5-v2-1-1_radio_button_focus_dist: .375rem;--_ui5-v2-1-1_switch_height: 2.75rem;--_ui5-v2-1-1_switch_foucs_border_size: 1px;--_ui5-v2-1-1-switch-root-border-radius: 0;--_ui5-v2-1-1-switch-root-box-shadow: none;--_ui5-v2-1-1-switch-focus: "";--_ui5-v2-1-1_switch_track_border_radius: .75rem;--_ui5-v2-1-1-switch-track-border: 1px solid;--_ui5-v2-1-1_switch_track_transition: none;--_ui5-v2-1-1_switch_handle_border_radius: 1rem;--_ui5-v2-1-1-switch-handle-icon-display: none;--_ui5-v2-1-1-switch-slider-texts-display: inline;--_ui5-v2-1-1_switch_width: 3.5rem;--_ui5-v2-1-1_switch_min_width: none;--_ui5-v2-1-1_switch_with_label_width: 3.875rem;--_ui5-v2-1-1_switch_focus_outline: none;--_ui5-v2-1-1_switch_root_after_outline: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-1-1_switch_root_after_boreder: none;--_ui5-v2-1-1_switch_root_after_boreder_radius: 1rem;--_ui5-v2-1-1_switch_root_outline_top: .5rem;--_ui5-v2-1-1_switch_root_outline_bottom: .5rem;--_ui5-v2-1-1_switch_root_outline_left: .375rem;--_ui5-v2-1-1_switch_root_outline_right: .375rem;--_ui5-v2-1-1_switch_disabled_opacity: var(--sapContent_DisabledOpacity);--_ui5-v2-1-1_switch_transform: translateX(100%) translateX(-1.625rem);--_ui5-v2-1-1_switch_transform_with_label: translateX(100%) translateX(-1.875rem);--_ui5-v2-1-1_switch_rtl_transform: translateX(-100%) translateX(1.625rem);--_ui5-v2-1-1_switch_rtl_transform_with_label: translateX(-100%) translateX(1.875rem);--_ui5-v2-1-1_switch_track_width: 2.5rem;--_ui5-v2-1-1_switch_track_height: 1.5rem;--_ui5-v2-1-1_switch_track_with_label_width: 2.875rem;--_ui5-v2-1-1_switch_track_with_label_height: 1.5rem;--_ui5-v2-1-1_switch_track_active_background_color: var(--sapButton_Track_Selected_Background);--_ui5-v2-1-1_switch_track_inactive_background_color: var(--sapButton_Track_Background);--_ui5-v2-1-1_switch_track_hover_active_background_color: var(--sapButton_Track_Selected_Hover_Background);--_ui5-v2-1-1_switch_track_hover_inactive_background_color: var(--sapButton_Track_Hover_Background);--_ui5-v2-1-1_switch_track_active_border_color: var(--sapButton_Track_Selected_BorderColor);--_ui5-v2-1-1_switch_track_inactive_border_color: var(--sapButton_Track_BorderColor);--_ui5-v2-1-1_switch_track_hover_active_border_color: var(--sapButton_Track_Selected_Hover_BorderColor);--_ui5-v2-1-1_switch_track_hover_inactive_border_color: var(--sapButton_Track_Hover_BorderColor);--_ui5-v2-1-1_switch_track_semantic_accept_background_color: var(--sapButton_Track_Positive_Background);--_ui5-v2-1-1_switch_track_semantic_reject_background_color: var(--sapButton_Track_Negative_Background);--_ui5-v2-1-1_switch_track_semantic_hover_accept_background_color: var(--sapButton_Track_Positive_Hover_Background);--_ui5-v2-1-1_switch_track_semantic_hover_reject_background_color: var(--sapButton_Track_Negative_Hover_Background);--_ui5-v2-1-1_switch_track_semantic_accept_border_color: var(--sapButton_Track_Positive_BorderColor);--_ui5-v2-1-1_switch_track_semantic_reject_border_color: var(--sapButton_Track_Negative_BorderColor);--_ui5-v2-1-1_switch_track_semantic_hover_accept_border_color: var(--sapButton_Track_Positive_Hover_BorderColor);--_ui5-v2-1-1_switch_track_semantic_hover_reject_border_color: var(--sapButton_Track_Negative_Hover_BorderColor);--_ui5-v2-1-1_switch_track_icon_display: inline-block;--_ui5-v2-1-1_switch_handle_width: 1.5rem;--_ui5-v2-1-1_switch_handle_height: 1.25rem;--_ui5-v2-1-1_switch_handle_with_label_width: 1.75rem;--_ui5-v2-1-1_switch_handle_with_label_height: 1.25rem;--_ui5-v2-1-1_switch_handle_border: var(--_ui5-v2-1-1_switch_handle_border_width) solid var(--sapButton_Handle_BorderColor);--_ui5-v2-1-1_switch_handle_border_width: .125rem;--_ui5-v2-1-1_switch_handle_active_background_color: var(--sapButton_Handle_Selected_Background);--_ui5-v2-1-1_switch_handle_inactive_background_color: var(--sapButton_Handle_Background);--_ui5-v2-1-1_switch_handle_hover_active_background_color: var(--sapButton_Handle_Selected_Hover_Background);--_ui5-v2-1-1_switch_handle_hover_inactive_background_color: var(--sapButton_Handle_Hover_Background);--_ui5-v2-1-1_switch_handle_active_border_color: var(--sapButton_Handle_Selected_BorderColor);--_ui5-v2-1-1_switch_handle_inactive_border_color: var(--sapButton_Handle_BorderColor);--_ui5-v2-1-1_switch_handle_hover_active_border_color: var(--sapButton_Handle_Selected_BorderColor);--_ui5-v2-1-1_switch_handle_hover_inactive_border_color: var(--sapButton_Handle_BorderColor);--_ui5-v2-1-1_switch_handle_semantic_accept_background_color: var(--sapButton_Handle_Positive_Background);--_ui5-v2-1-1_switch_handle_semantic_reject_background_color: var(--sapButton_Handle_Negative_Background);--_ui5-v2-1-1_switch_handle_semantic_hover_accept_background_color: var(--sapButton_Handle_Positive_Hover_Background);--_ui5-v2-1-1_switch_handle_semantic_hover_reject_background_color: var(--sapButton_Handle_Negative_Hover_Background);--_ui5-v2-1-1_switch_handle_semantic_accept_border_color: var(--sapButton_Handle_Positive_BorderColor);--_ui5-v2-1-1_switch_handle_semantic_reject_border_color: var(--sapButton_Handle_Negative_BorderColor);--_ui5-v2-1-1_switch_handle_semantic_hover_accept_border_color: var(--sapButton_Handle_Positive_BorderColor);--_ui5-v2-1-1_switch_handle_semantic_hover_reject_border_color: var(--sapButton_Handle_Negative_BorderColor);--_ui5-v2-1-1_switch_handle_on_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Selected_Hover_BorderColor);--_ui5-v2-1-1_switch_handle_off_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Hover_BorderColor);--_ui5-v2-1-1_switch_handle_semantic_on_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Positive_Hover_BorderColor);--_ui5-v2-1-1_switch_handle_semantic_off_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Negative_Hover_BorderColor);--_ui5-v2-1-1_switch_handle_left: .0625rem;--_ui5-v2-1-1_switch_text_font_family: var(--sapContent_IconFontFamily);--_ui5-v2-1-1_switch_text_font_size: var(--sapFontLargeSize);--_ui5-v2-1-1_switch_text_width: 1.25rem;--_ui5-v2-1-1_switch_text_with_label_font_family: "72-Condensed-Bold" , "72" , "72full" , Arial, Helvetica, sans-serif;--_ui5-v2-1-1_switch_text_with_label_font_size: var(--sapFontSmallSize);--_ui5-v2-1-1_switch_text_with_label_width: 1.75rem;--_ui5-v2-1-1_switch_text_inactive_left: .1875rem;--_ui5-v2-1-1_switch_text_inactive_left_alternate: .0625rem;--_ui5-v2-1-1_switch_text_inactive_right: auto;--_ui5-v2-1-1_switch_text_inactive_right_alternate: 0;--_ui5-v2-1-1_switch_text_active_left: .1875rem;--_ui5-v2-1-1_switch_text_active_left_alternate: .0625rem;--_ui5-v2-1-1_switch_text_active_right: auto;--_ui5-v2-1-1_switch_text_active_color: var(--sapButton_Handle_Selected_TextColor);--_ui5-v2-1-1_switch_text_inactive_color: var(--sapButton_Handle_TextColor);--_ui5-v2-1-1_switch_text_semantic_accept_color: var(--sapButton_Handle_Positive_TextColor);--_ui5-v2-1-1_switch_text_semantic_reject_color: var(--sapButton_Handle_Negative_TextColor);--_ui5-v2-1-1_switch_text_overflow: hidden;--_ui5-v2-1-1_switch_text_z_index: 1;--_ui5-v2-1-1_switch_text_hidden: hidden;--_ui5-v2-1-1_switch_text_min_width: none;--_ui5-v2-1-1_switch_icon_width: 1rem;--_ui5-v2-1-1_switch_icon_height: 1rem;--_ui5-v2-1-1_select_disabled_background: var(--sapField_Background);--_ui5-v2-1-1_select_disabled_border_color: var(--sapField_BorderColor);--_ui5-v2-1-1_select_state_error_warning_border_style: solid;--_ui5-v2-1-1_select_state_error_warning_border_width: .125rem;--_ui5-v2-1-1_select_focus_width: 1px;--_ui5-v2-1-1_select_label_color: var(--sapField_TextColor);--_ui5-v2-1-1_select_hover_icon_left_border: none;--_ui5-v2-1-1_select_option_focus_border_radius: var(--sapElement_BorderCornerRadius);--_ui5-v2-1-1_split_button_host_transparent_hover_background: transparent;--_ui5-v2-1-1_split_button_transparent_disabled_background: transparent;--_ui5-v2-1-1_split_button_host_default_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_BorderColor);--_ui5-v2-1-1_split_button_host_attention_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Attention_BorderColor);--_ui5-v2-1-1_split_button_host_emphasized_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Emphasized_BorderColor);--_ui5-v2-1-1_split_button_host_positive_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Accept_BorderColor);--_ui5-v2-1-1_split_button_host_negative_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Reject_BorderColor);--_ui5-v2-1-1_split_button_host_transparent_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Lite_BorderColor);--_ui5-v2-1-1_split_text_button_border_color: transparent;--_ui5-v2-1-1_split_text_button_background_color: transparent;--_ui5-v2-1-1_split_text_button_emphasized_border: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-1-1_split_text_button_emphasized_border_width: .0625rem;--_ui5-v2-1-1_split_text_button_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-1-1_split_text_button_emphasized_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-1-1_split_text_button_positive_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-1-1_split_text_button_negative_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-1-1_split_text_button_attention_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-1-1_split_text_button_transparent_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-1-1_split_arrow_button_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-1-1_split_arrow_button_emphasized_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-1-1_split_arrow_button_emphasized_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-1-1_split_arrow_button_positive_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-1-1_split_arrow_button_negative_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-1-1_split_arrow_button_attention_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-1-1_split_arrow_button_transparent_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-1-1_split_text_button_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-1-1_split_text_button_emphasized_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-1-1_split_text_button_positive_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-1-1_split_text_button_negative_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-1-1_split_text_button_attention_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-1-1_split_text_button_transparent_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-1-1_split_button_focused_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-1-1_split_button_focused_border_radius: .375rem;--_ui5-v2-1-1_split_button_hover_border_radius: var(--_ui5-v2-1-1_button_border_radius);--_ui5-v2-1-1_split_button_middle_separator_width: 0;--_ui5-v2-1-1_split_button_middle_separator_left: -.0625rem;--_ui5-v2-1-1_split_button_middle_separator_hover_display: none;--_ui5-v2-1-1_split_button_text_button_width: 2.375rem;--_ui5-v2-1-1_split_button_text_button_right_border_width: .0625rem;--_ui5-v2-1-1_split_button_transparent_hover_background: var(--sapButton_Lite_Hover_Background);--_ui5-v2-1-1_split_button_transparent_hover_color: var(--sapButton_TextColor);--_ui5-v2-1-1_split_button_host_transparent_hover_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_BorderColor);--_ui5-v2-1-1_split_button_inner_focused_border_radius_outer: .375rem;--_ui5-v2-1-1_split_button_inner_focused_border_radius_inner: .375rem;--_ui5-v2-1-1_split_button_emphasized_separator_color: transparent;--_ui5-v2-1-1_split_button_positive_separator_color: transparent;--_ui5-v2-1-1_split_button_negative_separator_color: transparent;--_ui5-v2-1-1_split_button_attention_separator_color: transparent;--_ui5-v2-1-1_split_button_attention_separator_color_default: var(--sapButton_Attention_TextColor);--_ui5-v2-1-1_split_text_button_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-1-1_split_text_button_emphasized_hover_border_right: none;--_ui5-v2-1-1_split_text_button_positive_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-1-1_split_text_button_negative_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-1-1_split_text_button_attention_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-1-1_split_text_button_transparent_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-1-1_split_button_middle_separator_hover_display_emphasized: none;--_ui5-v2-1-1_tc_header_height: var(--_ui5-v2-1-1_tc_item_height);--_ui5-v2-1-1_tc_header_height_text_only: var(--_ui5-v2-1-1_tc_item_text_only_height);--_ui5-v2-1-1_tc_header_height_text_with_additional_text: var(--_ui5-v2-1-1_tc_item_text_only_with_additional_text_height);--_ui5-v2-1-1_tc_header_box_shadow: var(--sapContent_HeaderShadow);--_ui5-v2-1-1_tc_header_background: var(--sapObjectHeader_Background);--_ui5-v2-1-1_tc_header_background_translucent: var(--sapObjectHeader_Background);--_ui5-v2-1-1_tc_content_background: var(--sapBackgroundColor);--_ui5-v2-1-1_tc_content_background_translucent: var(--sapGroup_ContentBackground);--_ui5-v2-1-1_tc_headeritem_padding: 1rem;--_ui5-v2-1-1_tc_headerItem_additional_text_color: var(--sapContent_LabelColor);--_ui5-v2-1-1_tc_headerItem_text_selected_color: var(--sapSelectedColor);--_ui5-v2-1-1_tc_headerItem_text_selected_hover_color: var(--sapSelectedColor);--_ui5-v2-1-1_tc_headerItem_additional_text_font_weight: normal;--_ui5-v2-1-1_tc_headerItem_neutral_color: var(--sapNeutralTextColor);--_ui5-v2-1-1_tc_headerItem_positive_color: var(--sapPositiveTextColor);--_ui5-v2-1-1_tc_headerItem_negative_color: var(--sapNegativeTextColor);--_ui5-v2-1-1_tc_headerItem_critical_color: var(--sapCriticalTextColor);--_ui5-v2-1-1_tc_headerItem_neutral_border_color: var(--sapNeutralElementColor);--_ui5-v2-1-1_tc_headerItem_positive_border_color: var(--sapPositiveElementColor);--_ui5-v2-1-1_tc_headerItem_negative_border_color: var(--sapNegativeElementColor);--_ui5-v2-1-1_tc_headerItem_critical_border_color: var(--sapCriticalElementColor);--_ui5-v2-1-1_tc_headerItem_neutral_selected_border_color: var(--_ui5-v2-1-1_tc_headerItem_neutral_color);--_ui5-v2-1-1_tc_headerItem_positive_selected_border_color: var(--_ui5-v2-1-1_tc_headerItem_positive_color);--_ui5-v2-1-1_tc_headerItem_negative_selected_border_color: var(--_ui5-v2-1-1_tc_headerItem_negative_color);--_ui5-v2-1-1_tc_headerItem_critical_selected_border_color: var(--_ui5-v2-1-1_tc_headerItem_critical_color);--_ui5-v2-1-1_tc_headerItem_transition: none;--_ui5-v2-1-1_tc_headerItem_hover_border_visibility: hidden;--_ui5-v2-1-1_tc_headerItemContent_border_radius: .125rem .125rem 0 0;--_ui5-v2-1-1_tc_headerItemContent_border_bg: transparent;--_ui5-v2-1-1_tc_headerItem_neutral_border_bg: transparent;--_ui5-v2-1-1_tc_headerItem_positive_border_bg: transparent;--_ui5-v2-1-1_tc_headerItem_negative_border_bg: transparent;--_ui5-v2-1-1_tc_headerItem_critical_border_bg: transparent;--_ui5-v2-1-1_tc_headerItemContent_border_height: 0;--_ui5-v2-1-1_tc_headerItemContent_focus_offset: 1rem;--_ui5-v2-1-1_tc_headerItem_text_focus_border_offset_left: 0px;--_ui5-v2-1-1_tc_headerItem_text_focus_border_offset_right: 0px;--_ui5-v2-1-1_tc_headerItem_text_focus_border_offset_top: 0px;--_ui5-v2-1-1_tc_headerItem_text_focus_border_offset_bottom: 0px;--_ui5-v2-1-1_tc_headerItem_mixed_mode_focus_border_offset_left: .75rem;--_ui5-v2-1-1_tc_headerItem_mixed_mode_focus_border_offset_right: .625rem;--_ui5-v2-1-1_tc_headerItem_mixed_mode_focus_border_offset_top: .75rem;--_ui5-v2-1-1_tc_headerItem_mixed_mode_focus_border_offset_bottom: .75rem;--_ui5-v2-1-1_tc_headerItemContent_focus_border: none;--_ui5-v2-1-1_tc_headerItemContent_default_focus_border: none;--_ui5-v2-1-1_tc_headerItemContent_focus_border_radius: 0;--_ui5-v2-1-1_tc_headerItemSemanticIcon_display: none;--_ui5-v2-1-1_tc_headerItemSemanticIcon_size: .75rem;--_ui5-v2-1-1_tc_mixedMode_itemText_font_family: var(--sapFontFamily);--_ui5-v2-1-1_tc_mixedMode_itemText_font_size: var(--sapFontSmallSize);--_ui5-v2-1-1_tc_mixedMode_itemText_font_weight: normal;--_ui5-v2-1-1_tc_overflowItem_positive_color: var(--sapPositiveColor);--_ui5-v2-1-1_tc_overflowItem_negative_color: var(--sapNegativeColor);--_ui5-v2-1-1_tc_overflowItem_critical_color: var(--sapCriticalColor);--_ui5-v2-1-1_tc_overflowItem_focus_offset: .125rem;--_ui5-v2-1-1_tc_overflowItem_extraIndent: 0rem;--_ui5-v2-1-1_tc_headerItemIcon_positive_selected_background: var(--sapPositiveColor);--_ui5-v2-1-1_tc_headerItemIcon_negative_selected_background: var(--sapNegativeColor);--_ui5-v2-1-1_tc_headerItemIcon_critical_selected_background: var(--sapCriticalColor);--_ui5-v2-1-1_tc_headerItemIcon_neutral_selected_background: var(--sapNeutralColor);--_ui5-v2-1-1_tc_headerItemIcon_semantic_selected_color: var(--sapGroup_ContentBackground);--_ui5-v2-1-1_tc_header_border_bottom: .0625rem solid var(--sapObjectHeader_Background);--_ui5-v2-1-1_tc_headerItemContent_border_bottom: .1875rem solid var(--sapSelectedColor);--_ui5-v2-1-1_tc_headerItem_color: var(--sapTextColor);--_ui5-v2-1-1_tc_overflowItem_default_color: var(--sapTextColor);--_ui5-v2-1-1_tc_overflowItem_current_color: CurrentColor;--_ui5-v2-1-1_tc_content_border_bottom: .0625rem solid var(--sapObjectHeader_BorderColor);--_ui5-v2-1-1_tc_headerItem_expand_button_margin_inline_start: 0rem;--_ui5-v2-1-1_tc_headerItem_single_click_expand_button_margin_inline_start: .25rem;--_ui5-v2-1-1_tc_headerItem_expand_button_border_radius: .25rem;--_ui5-v2-1-1_tc_headerItem_expand_button_separator_display: inline-block;--_ui5-v2-1-1_tc_headerItem_focus_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-1-1_tc_headerItem_focus_border_offset: -5px;--_ui5-v2-1-1_tc_headerItemIcon_focus_border_radius: 50%;--_ui5-v2-1-1_tc_headerItem_focus_border_radius: .375rem;--_ui5-v2-1-1_tc_headeritem_text_font_weight: bold;--_ui5-v2-1-1_tc_headerItem_focus_offset: 1px;--_ui5-v2-1-1_tc_headerItem_text_hover_color: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-1-1_tc_headerItemIcon_border: .125rem solid var(--sapContent_Selected_ForegroundColor);--_ui5-v2-1-1_tc_headerItemIcon_color: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-1-1_tc_headerItemIcon_selected_background: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-1-1_tc_headerItemIcon_background_color: var(--sapContent_Selected_Background);--_ui5-v2-1-1_tc_headerItemIcon_selected_color: var(--sapContent_ContrastIconColor);--_ui5-v2-1-1_tc_mixedMode_itemText_color: var(--sapTextColor);--_ui5-v2-1-1_tc_overflow_text_color: var(--sapTextColor);--_ui5-v2-1-1_text_max_lines: initial;--_ui5-v2-1-1_textarea_state_border_width: .125rem;--_ui5-v2-1-1_textarea_information_border_width: .125rem;--_ui5-v2-1-1_textarea_placeholder_font_style: italic;--_ui5-v2-1-1_textarea_value_state_error_warning_placeholder_font_weight: normal;--_ui5-v2-1-1_textarea_error_placeholder_font_style: italic;--_ui5-v2-1-1_textarea_error_placeholder_color: var(--sapField_PlaceholderTextColor);--_ui5-v2-1-1_textarea_error_hover_background_color: var(--sapField_Hover_Background);--_ui5-v2-1-1_textarea_disabled_opacity: .4;--_ui5-v2-1-1_textarea_focus_pseudo_element_content: "";--_ui5-v2-1-1_textarea_min_height: 2.25rem;--_ui5-v2-1-1_textarea_padding_right_and_left_readonly: .5625rem;--_ui5-v2-1-1_textarea_padding_top_readonly: .4375rem;--_ui5-v2-1-1_textarea_exceeded_text_height: 1rem;--_ui5-v2-1-1_textarea_hover_border: none;--_ui5-v2-1-1_textarea_focus_border_radius: .25rem;--_ui5-v2-1-1_textarea_error_warning_border_style: none;--_ui5-v2-1-1_textarea_line_height: 1.5;--_ui5-v2-1-1_textarea_focused_value_state_error_background: var(--sapField_Hover_Background);--_ui5-v2-1-1_textarea_focused_value_state_warning_background: var(--sapField_Hover_Background);--_ui5-v2-1-1_textarea_focused_value_state_success_background: var(--sapField_Hover_Background);--_ui5-v2-1-1_textarea_focused_value_state_information_background: var(--sapField_Hover_Background);--_ui5-v2-1-1_textarea_focused_value_state_error_focus_outline_color: var(--sapField_InvalidColor);--_ui5-v2-1-1_textarea_focused_value_state_warning_focus_outline_color: var(--sapField_WarningColor);--_ui5-v2-1-1_textarea_focused_value_state_success_focus_outline_color: var(--sapField_SuccessColor);--_ui5-v2-1-1_textarea_focus_offset: 0;--_ui5-v2-1-1_textarea_readonly_focus_offset: 1px;--_ui5-v2-1-1_textarea_focus_outline_color: var(--sapField_Active_BorderColor);--_ui5-v2-1-1_textarea_value_state_focus_offset: 0;--_ui5-v2-1-1_textarea_wrapper_padding: .0625rem;--_ui5-v2-1-1_textarea_success_wrapper_padding: .0625rem;--_ui5-v2-1-1_textarea_warning_error_wrapper_padding: .0625rem .0625rem .125rem .0625rem;--_ui5-v2-1-1_textarea_information_wrapper_padding: .0625rem .0625rem .125rem .0625rem;--_ui5-v2-1-1_textarea_padding_bottom_readonly: .375rem;--_ui5-v2-1-1_textarea_padding_top_error_warning: .5rem;--_ui5-v2-1-1_textarea_padding_bottom_error_warning: .4375rem;--_ui5-v2-1-1_textarea_padding_top_information: .5rem;--_ui5-v2-1-1_textarea_padding_bottom_information: .4375rem;--_ui5-v2-1-1_textarea_padding_right_and_left: .625rem;--_ui5-v2-1-1_textarea_padding_right_and_left_error_warning: .625rem;--_ui5-v2-1-1_textarea_padding_right_and_left_information: .625rem;--_ui5-v2-1-1_textarea_readonly_border_style: dashed;--_ui5-v2-1-1_time_picker_border: .0625rem solid transparent;--_ui5-v2-1-1-time_picker_border_radius: .25rem;--_ui5-v2-1-1_toast_vertical_offset: 3rem;--_ui5-v2-1-1_toast_horizontal_offset: 2rem;--_ui5-v2-1-1_toast_background: var(--sapList_Background);--_ui5-v2-1-1_toast_shadow: var(--sapContent_Shadow2);--_ui5-v2-1-1_toast_offset_width: -.1875rem;--_ui5-v2-1-1_toggle_button_pressed_focussed: var(--sapButton_Selected_BorderColor);--_ui5-v2-1-1_toggle_button_pressed_focussed_hovered: var(--sapButton_Selected_BorderColor);--_ui5-v2-1-1_toggle_button_selected_positive_text_color: var(--sapButton_Selected_TextColor);--_ui5-v2-1-1_toggle_button_selected_negative_text_color: var(--sapButton_Selected_TextColor);--_ui5-v2-1-1_toggle_button_selected_attention_text_color: var(--sapButton_Selected_TextColor);--_ui5-v2-1-1_toggle_button_emphasized_pressed_focussed_hovered: var(--sapContent_FocusColor);--_ui5-v2-1-1_toggle_button_emphasized_text_shadow: none;--_ui5-v2-1-1_yearpicker_item_selected_focus: var(--sapContent_Selected_Background);--_ui5-v2-1-1_yearpicker_item_border: none;--_ui5-v2-1-1_yearpicker_item_margin: 1px;--_ui5-v2-1-1_yearpicker_item_border_radius: .5rem;--_ui5-v2-1-1_yearpicker_item_focus_after_offset: .25rem;--_ui5-v2-1-1_yearpicker_item_focus_after_border: var(--_ui5-v2-1-1_button_focused_border);--_ui5-v2-1-1_yearpicker_item_focus_after_border_radius: .5rem;--_ui5-v2-1-1_yearpicker_item_focus_after_width: calc(100% - .5rem) ;--_ui5-v2-1-1_yearpicker_item_focus_after_height: calc(100% - .5rem) ;--_ui5-v2-1-1_yearpicker_item_selected_background_color: transparent;--_ui5-v2-1-1_yearpicker_item_selected_text_color: var(--sapContent_Selected_TextColor);--_ui5-v2-1-1_yearpicker_item_selected_box_shadow: none;--_ui5-v2-1-1_yearpicker_item_selected_hover_color: var(--sapList_Hover_Background);--_ui5-v2-1-1_yearpicker_item_focus_after_outline: none;--_ui5-v2-1-1_calendar_header_middle_button_width: 6.25rem;--_ui5-v2-1-1_calendar_header_middle_button_flex: 1 1 auto;--_ui5-v2-1-1_calendar_header_middle_button_focus_after_display: block;--_ui5-v2-1-1_calendar_header_middle_button_focus_after_width: calc(100% - .375rem) ;--_ui5-v2-1-1_calendar_header_middle_button_focus_after_height: calc(100% - .375rem) ;--_ui5-v2-1-1_calendar_header_middle_button_focus_after_top_offset: .125rem;--_ui5-v2-1-1_calendar_header_middle_button_focus_after_left_offset: .125rem;--_ui5-v2-1-1_calendar_header_arrow_button_border: none;--_ui5-v2-1-1_calendar_header_arrow_button_border_radius: .5rem;--_ui5-v2-1-1_calendar_header_button_background_color: var(--sapButton_Lite_Background);--_ui5-v2-1-1_calendar_header_arrow_button_box_shadow: 0 0 .125rem 0 rgb(85 107 130 / 72%);--_ui5-v2-1-1_calendar_header_middle_button_focus_border_radius: .5rem;--_ui5-v2-1-1_calendar_header_middle_button_focus_border: none;--_ui5-v2-1-1_calendar_header_middle_button_focus_after_border: none;--_ui5-v2-1-1_calendar_header_middle_button_focus_background: transparent;--_ui5-v2-1-1_calendar_header_middle_button_focus_outline: .125rem solid var(--sapSelectedColor);--_ui5-v2-1-1_calendar_header_middle_button_focus_active_outline: .0625rem solid var(--sapSelectedColor);--_ui5-v2-1-1_calendar_header_middle_button_focus_active_background: transparent;--_ui5-v2-1-1_token_background: var(--sapButton_TokenBackground);--_ui5-v2-1-1_token_readonly_background: var(--sapButton_TokenBackground);--_ui5-v2-1-1_token_readonly_color: var(--sapContent_LabelColor);--_ui5-v2-1-1_token_right_margin: .3125rem;--_ui5-v2-1-1_token_padding: .25rem 0;--_ui5-v2-1-1_token_left_padding: .3125rem;--_ui5-v2-1-1_token_focused_selected_border: 1px solid var(--sapButton_Selected_BorderColor);--_ui5-v2-1-1_token_focus_offset: -.25rem;--_ui5-v2-1-1_token_focus_outline_width: .0625rem;--_ui5-v2-1-1_token_hover_border_color: var(--sapButton_TokenBorderColor);--_ui5-v2-1-1_token_selected_focus_outline: none;--_ui5-v2-1-1_token_focus_outline: none;--_ui5-v2-1-1_token_outline_offset: .125rem;--_ui5-v2-1-1_token_selected_hover_border_color: var(--sapButton_Selected_BorderColor);--ui5-v2-1-1_token_focus_pseudo_element_content: "";--_ui5-v2-1-1_token_border_radius: .375rem;--_ui5-v2-1-1_token_focus_outline_border_radius: .5rem;--_ui5-v2-1-1_token_text_color: var(--sapTextColor);--_ui5-v2-1-1_token_selected_text_font_family: var(--sapFontSemiboldDuplexFamily);--_ui5-v2-1-1_token_selected_internal_border_bottom: .125rem solid var(--sapButton_Selected_BorderColor);--_ui5-v2-1-1_token_selected_internal_border_bottom_radius: .1875rem;--_ui5-v2-1-1_token_text_icon_top: .0625rem;--_ui5-v2-1-1_token_selected_focused_offset_bottom: -.375rem;--_ui5-v2-1-1_token_readonly_padding: .25rem .3125rem;--_ui5-v2-1-1_tokenizer-popover_offset: .3125rem;--_ui5-v2-1-1_tokenizer_n_more_text_color: var(--sapLinkColor);--_ui5-v2-1-1-multi_combobox_token_margin_top: 1px;--_ui5-v2-1-1_slider_progress_container_dot_background: var(--sapField_BorderColor);--_ui5-v2-1-1_slider_progress_border: none;--_ui5-v2-1-1_slider_padding: 1.406rem 1.0625rem;--_ui5-v2-1-1_slider_inner_height: .25rem;--_ui5-v2-1-1_slider_outer_height: 1.6875rem;--_ui5-v2-1-1_slider_progress_border_radius: .25rem;--_ui5-v2-1-1_slider_tickmark_bg: var(--sapField_BorderColor);--_ui5-v2-1-1_slider_handle_margin_left: calc(-1 * (var(--_ui5-v2-1-1_slider_handle_width) / 2));--_ui5-v2-1-1_slider_handle_outline_offset: .075rem;--_ui5-v2-1-1_slider_progress_outline: .0625rem dotted var(--sapContent_FocusColor);--_ui5-v2-1-1_slider_progress_outline_offset: -.8125rem;--_ui5-v2-1-1_slider_disabled_opacity: .4;--_ui5-v2-1-1_slider_tooltip_border_color: var(--sapField_BorderColor);--_ui5-v2-1-1_range_slider_handle_background_focus: transparent;--_ui5-v2-1-1_slider_progress_box_sizing: content-box;--_ui5-v2-1-1_range_slider_focus_outline_width: 100%;--_ui5-v2-1-1_slider_progress_outline_offset_left: 0;--_ui5-v2-1-1_range_slider_focus_outline_radius: 0;--_ui5-v2-1-1_slider_progress_container_top: 0;--_ui5-v2-1-1_slider_progress_height: 100%;--_ui5-v2-1-1_slider_active_progress_border: none;--_ui5-v2-1-1_slider_active_progress_left: 0;--_ui5-v2-1-1_slider_active_progress_top: 0;--_ui5-v2-1-1_slider_no_tickmarks_progress_container_top: var(--_ui5-v2-1-1_slider_progress_container_top);--_ui5-v2-1-1_slider_no_tickmarks_progress_height: var(--_ui5-v2-1-1_slider_progress_height);--_ui5-v2-1-1_slider_no_tickmarks_active_progress_border: var(--_ui5-v2-1-1_slider_active_progress_border);--_ui5-v2-1-1_slider_no_tickmarks_active_progress_left: var(--_ui5-v2-1-1_slider_active_progress_left);--_ui5-v2-1-1_slider_no_tickmarks_active_progress_top: var(--_ui5-v2-1-1_slider_active_progress_top);--_ui5-v2-1-1_slider_handle_focus_visibility: none;--_ui5-v2-1-1_slider_handle_icon_size: 1rem;--_ui5-v2-1-1_slider_progress_container_background: var(--sapSlider_Background);--_ui5-v2-1-1_slider_progress_container_dot_display: block;--_ui5-v2-1-1_slider_inner_min_width: 4rem;--_ui5-v2-1-1_slider_progress_background: var(--sapSlider_Selected_Background);--_ui5-v2-1-1_slider_progress_before_background: var(--sapSlider_Selected_Background);--_ui5-v2-1-1_slider_progress_after_background: var(--sapContent_MeasureIndicatorColor);--_ui5-v2-1-1_slider_handle_background: var(--sapSlider_HandleBackground);--_ui5-v2-1-1_slider_handle_icon_display: inline-block;--_ui5-v2-1-1_slider_handle_border: .0625rem solid var(--sapSlider_HandleBorderColor);--_ui5-v2-1-1_slider_handle_border_radius: .5rem;--_ui5-v2-1-1_slider_handle_height: 1.5rem;--_ui5-v2-1-1_slider_handle_width: 2rem;--_ui5-v2-1-1_slider_handle_top: -.625rem;--_ui5-v2-1-1_slider_handle_font_family: "SAP-icons";--_ui5-v2-1-1_slider_handle_hover_border: .0625rem solid var(--sapSlider_Hover_HandleBorderColor);--_ui5-v2-1-1_slider_handle_focus_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-1-1_slider_handle_background_focus: var(--sapSlider_Active_RangeHandleBackground);--_ui5-v2-1-1_slider_handle_outline: none;--_ui5-v2-1-1_slider_handle_hover_background: var(--sapSlider_Hover_HandleBackground);--_ui5-v2-1-1_slider_tooltip_background: var(--sapField_Focus_Background);--_ui5-v2-1-1_slider_tooltip_border: none;--_ui5-v2-1-1_slider_tooltip_border_radius: .5rem;--_ui5-v2-1-1_slider_tooltip_box_shadow: var(--sapContent_Shadow1);--_ui5-v2-1-1_range_slider_legacy_progress_focus_display: none;--_ui5-v2-1-1_range_slider_progress_focus_display: block;--_ui5-v2-1-1_slider_tickmark_in_range_bg: var(--sapSlider_Selected_BorderColor);--_ui5-v2-1-1_slider_label_fontsize: var(--sapFontSmallSize);--_ui5-v2-1-1_slider_label_color: var(--sapContent_LabelColor);--_ui5-v2-1-1_slider_tooltip_min_width: 2rem;--_ui5-v2-1-1_slider_tooltip_padding: .25rem;--_ui5-v2-1-1_slider_tooltip_fontsize: var(--sapFontSmallSize);--_ui5-v2-1-1_slider_tooltip_color: var(--sapContent_LabelColor);--_ui5-v2-1-1_slider_tooltip_height: 1.375rem;--_ui5-v2-1-1_slider_handle_focus_width: 1px;--_ui5-v2-1-1_slider_start_end_point_size: .5rem;--_ui5-v2-1-1_slider_start_end_point_left: -.75rem;--_ui5-v2-1-1_slider_start_end_point_top: -.125rem;--_ui5-v2-1-1_slider_handle_focused_tooltip_distance: calc(var(--_ui5-v2-1-1_slider_tooltip_bottom) - var(--_ui5-v2-1-1_slider_handle_focus_width));--_ui5-v2-1-1_slider_tooltip_border_box: border-box;--_ui5-v2-1-1_range_slider_handle_active_background: var(--sapSlider_Active_RangeHandleBackground);--_ui5-v2-1-1_range_slider_active_handle_icon_display: none;--_ui5-v2-1-1_range_slider_progress_focus_top: -15px;--_ui5-v2-1-1_range_slider_progress_focus_left: calc(-1 * (var(--_ui5-v2-1-1_slider_handle_width) / 2) - 5px);--_ui5-v2-1-1_range_slider_progress_focus_padding: 0 1rem 0 1rem;--_ui5-v2-1-1_range_slider_progress_focus_width: calc(100% + var(--_ui5-v2-1-1_slider_handle_width) + 10px);--_ui5-v2-1-1_range_slider_progress_focus_height: calc(var(--_ui5-v2-1-1_slider_handle_height) + 10px);--_ui5-v2-1-1_range_slider_root_hover_handle_icon_display: inline-block;--_ui5-v2-1-1_range_slider_root_hover_handle_bg: var(--_ui5-v2-1-1_slider_handle_hover_background);--_ui5-v2-1-1_range_slider_root_active_handle_icon_display: none;--_ui5-v2-1-1_slider_tickmark_height: .5rem;--_ui5-v2-1-1_slider_tickmark_top: -2px;--_ui5-v2-1-1_slider_handle_box_sizing: border-box;--_ui5-v2-1-1_range_slider_handle_background: var(--sapSlider_RangeHandleBackground);--_ui5-v2-1-1_slider_tooltip_bottom: 2rem;--_ui5-v2-1-1_value_state_message_border: none;--_ui5-v2-1-1_value_state_header_border: none;--_ui5-v2-1-1_input_value_state_icon_offset: .5rem;--_ui5-v2-1-1_value_state_header_box_shadow_error: inset 0 -.0625rem var(--sapField_InvalidColor);--_ui5-v2-1-1_value_state_header_box_shadow_information: inset 0 -.0625rem var(--sapField_InformationColor);--_ui5-v2-1-1_value_state_header_box_shadow_success: inset 0 -.0625rem var(--sapField_SuccessColor);--_ui5-v2-1-1_value_state_header_box_shadow_warning: inset 0 -.0625rem var(--sapField_WarningColor);--_ui5-v2-1-1_value_state_message_icon_offset_phone: 1rem;--_ui5-v2-1-1_value_state_header_border_bottom: none;--_ui5-v2-1-1_input_value_state_icon_display: inline-block;--_ui5-v2-1-1_value_state_message_padding: .5rem .5rem .5rem 1.875rem;--_ui5-v2-1-1_value_state_header_padding: .5rem .5rem .5rem 1.875rem;--_ui5-v2-1-1_value_state_message_popover_box_shadow: var(--sapContent_Shadow1);--_ui5-v2-1-1_value_state_message_icon_width: 1rem;--_ui5-v2-1-1_value_state_message_icon_height: 1rem;--_ui5-v2-1-1_value_state_header_offset: -.25rem;--_ui5-v2-1-1_value_state_message_popover_border_radius: var(--sapPopover_BorderCornerRadius);--_ui5-v2-1-1_value_state_message_padding_phone: .5rem .5rem .5rem 2.375rem;--_ui5-v2-1-1_value_state_message_line_height: 1.125rem;--_ui5-v2-1-1-toolbar-padding-left: .5rem;--_ui5-v2-1-1-toolbar-padding-right: .5rem;--_ui5-v2-1-1-toolbar-item-margin-left: 0;--_ui5-v2-1-1-toolbar-item-margin-right: .25rem;--_ui5-v2-1-1_step_input_min_width: 7.25rem;--_ui5-v2-1-1_step_input_padding: 2.5rem;--_ui5-v2-1-1_step_input_input_error_background_color: inherit;--_ui5-v2-1-1-step_input_button_state_hover_background_color: var(--sapField_Hover_Background);--_ui5-v2-1-1_step_input_border_style: none;--_ui5-v2-1-1_step_input_border_style_hover: none;--_ui5-v2-1-1_step_input_button_background_color: transparent;--_ui5-v2-1-1_step_input_input_border: none;--_ui5-v2-1-1_step_input_input_margin_top: 0;--_ui5-v2-1-1_step_input_button_display: inline-flex;--_ui5-v2-1-1_step_input_button_left: 0;--_ui5-v2-1-1_step_input_button_right: 0;--_ui5-v2-1-1_step_input_input_border_focused_after: .125rem solid #0070f2;--_ui5-v2-1-1_step_input_input_border_top_bottom_focused_after: 0;--_ui5-v2-1-1_step_input_input_border_radius_focused_after: .25rem;--_ui5-v2-1-1_step_input_input_information_border_color_focused_after: var(--sapField_InformationColor);--_ui5-v2-1-1_step_input_input_warning_border_color_focused_after: var(--sapField_WarningColor);--_ui5-v2-1-1_step_input_input_success_border_color_focused_after: var(--sapField_SuccessColor);--_ui5-v2-1-1_step_input_input_error_border_color_focused_after: var(--sapField_InvalidColor);--_ui5-v2-1-1_step_input_disabled_button_background: none;--_ui5-v2-1-1_step_input_border_color_hover: none;--_ui5-v2-1-1_step_input_border_hover: none;--_ui5-v2-1-1_input_input_background_color: transparent;--_ui5-v2-1-1_load_more_padding: 0;--_ui5-v2-1-1_load_more_border: 1px top solid transparent;--_ui5-v2-1-1_load_more_border_radius: none;--_ui5-v2-1-1_load_more_outline_width: var(--sapContent_FocusWidth);--_ui5-v2-1-1_load_more_border-bottom: var(--sapList_BorderWidth) solid var(--sapList_BorderColor);--_ui5-v2-1-1_calendar_height: 24.5rem;--_ui5-v2-1-1_calendar_width: 20rem;--_ui5-v2-1-1_calendar_padding: 1rem;--_ui5-v2-1-1_calendar_left_right_padding: .5rem;--_ui5-v2-1-1_calendar_top_bottom_padding: 1rem;--_ui5-v2-1-1_calendar_header_height: 3rem;--_ui5-v2-1-1_calendar_header_arrow_button_width: 2.5rem;--_ui5-v2-1-1_calendar_header_padding: .25rem 0;--_ui5-v2-1-1_checkbox_root_side_padding: .6875rem;--_ui5-v2-1-1_checkbox_icon_size: 1rem;--_ui5-v2-1-1_checkbox_partially_icon_size: .75rem;--_ui5-v2-1-1_custom_list_item_rb_min_width: 2.75rem;--_ui5-v2-1-1_day_picker_item_width: 2.25rem;--_ui5-v2-1-1_day_picker_item_height: 2.875rem;--_ui5-v2-1-1_day_picker_empty_height: 3rem;--_ui5-v2-1-1_day_picker_item_justify_content: space-between;--_ui5-v2-1-1_dp_two_calendar_item_now_text_padding_top: .375rem;--_ui5-v2-1-1_daypicker_item_now_selected_two_calendar_focus_special_day_top: 2rem;--_ui5-v2-1-1_daypicker_item_now_selected_two_calendar_focus_special_day_right: 1.4375rem;--_ui5-v2-1-1_dp_two_calendar_item_primary_text_height: 1.8125rem;--_ui5-v2-1-1_dp_two_calendar_item_secondary_text_height: 1rem;--_ui5-v2-1-1_dp_two_calendar_item_text_padding_top: .4375rem;--_ui5-v2-1-1_daypicker_item_now_selected_two_calendar_focus_secondary_text_padding_block: 0 .5rem;--_ui5-v2-1-1-calendar-legend-item-root-focus-offset: -.125rem;--_ui5-v2-1-1-calendar-legend-item-box-margin: .25rem;--_ui5-v2-1-1-calendar-legend-item-box-inner-margin: .5rem;--_ui5-v2-1-1_color-palette-swatch-container-padding: .3125rem .6875rem;--_ui5-v2-1-1_datetime_picker_width: 40.0625rem;--_ui5-v2-1-1_datetime_picker_height: 25rem;--_ui5-v2-1-1_datetime_timeview_width: 17rem;--_ui5-v2-1-1_datetime_timeview_phonemode_width: 19.5rem;--_ui5-v2-1-1_datetime_timeview_padding: 1rem;--_ui5-v2-1-1_datetime_timeview_phonemode_clocks_width: 24.5rem;--_ui5-v2-1-1_datetime_dateview_phonemode_margin_bottom: 0;--_ui5-v2-1-1_dialog_content_min_height: 2.75rem;--_ui5-v2-1-1_dialog_footer_height: 2.75rem;--_ui5-v2-1-1_input_inner_padding: 0 .625rem;--_ui5-v2-1-1_input_inner_padding_with_icon: 0 .25rem 0 .625rem;--_ui5-v2-1-1_input_inner_space_to_tokenizer: .125rem;--_ui5-v2-1-1_input_inner_space_to_n_more_text: .1875rem;--_ui5-v2-1-1_list_no_data_height: 3rem;--_ui5-v2-1-1_list_item_cb_margin_right: 0;--_ui5-v2-1-1_list_item_title_size: var(--sapFontLargeSize);--_ui5-v2-1-1_list_no_data_font_size: var(--sapFontLargeSize);--_ui5-v2-1-1_list_item_img_size: 3rem;--_ui5-v2-1-1_list_item_img_top_margin: .5rem;--_ui5-v2-1-1_list_item_img_bottom_margin: .5rem;--_ui5-v2-1-1_list_item_img_hn_margin: .75rem;--_ui5-v2-1-1_list_item_dropdown_base_height: 2.5rem;--_ui5-v2-1-1_list_item_base_height: var(--sapElement_LineHeight);--_ui5-v2-1-1_list_item_base_padding: 0 1rem;--_ui5-v2-1-1_list_item_icon_size: 1.125rem;--_ui5-v2-1-1_list_item_icon_padding-inline-end: .5rem;--_ui5-v2-1-1_list_item_selection_btn_margin_top: calc(-1 * var(--_ui5-v2-1-1_checkbox_wrapper_padding));--_ui5-v2-1-1_list_item_content_vertical_offset: calc((var(--_ui5-v2-1-1_list_item_base_height) - var(--_ui5-v2-1-1_list_item_title_size)) / 2);--_ui5-v2-1-1_group_header_list_item_height: 2.75rem;--_ui5-v2-1-1_list_busy_row_height: 3rem;--_ui5-v2-1-1_month_picker_item_height: 3rem;--_ui5-v2-1-1_list_buttons_left_space: .125rem;--_ui5-v2-1-1_form_item_min_height: 2.813rem;--_ui5-v2-1-1_form_item_padding: .65rem;--_ui5-v2-1-1-form-group-heading-height: 2.75rem;--_ui5-v2-1-1_popup_default_header_height: 2.75rem;--_ui5-v2-1-1_year_picker_item_height: 3rem;--_ui5-v2-1-1_tokenizer_padding: .25rem;--_ui5-v2-1-1_token_height: 1.625rem;--_ui5-v2-1-1_token_icon_size: .75rem;--_ui5-v2-1-1_token_icon_padding: .25rem .5rem;--_ui5-v2-1-1_token_wrapper_right_padding: .3125rem;--_ui5-v2-1-1_token_wrapper_left_padding: 0;--_ui5-v2-1-1_tl_bubble_padding: 1rem;--_ui5-v2-1-1_tl_indicator_before_bottom: -1.625rem;--_ui5-v2-1-1_tl_padding: 1rem 1rem 1rem .5rem;--_ui5-v2-1-1_tl_li_margin_bottom: 1.625rem;--_ui5-v2-1-1_switch_focus_width_size_horizon_exp: calc(100% + 4px) ;--_ui5-v2-1-1_switch_focus_height_size_horizon_exp: calc(100% + 4px) ;--_ui5-v2-1-1_tc_item_text: 3rem;--_ui5-v2-1-1_tc_item_height: 4.75rem;--_ui5-v2-1-1_tc_item_text_only_height: 2.75rem;--_ui5-v2-1-1_tc_item_text_only_with_additional_text_height: 3.75rem;--_ui5-v2-1-1_tc_item_text_line_height: 1.325rem;--_ui5-v2-1-1_tc_item_icon_circle_size: 2.75rem;--_ui5-v2-1-1_tc_item_icon_size: 1.25rem;--_ui5-v2-1-1_tc_item_add_text_margin_top: .375rem;--_ui5-v2-1-1_textarea_margin: .25rem 0;--_ui5-v2-1-1_radio_button_height: 2.75rem;--_ui5-v2-1-1_radio_button_label_side_padding: .875rem;--_ui5-v2-1-1_radio_button_inner_size: 2.75rem;--_ui5-v2-1-1_radio_button_svg_size: 1.375rem;--_ui5-v2-1-1-responsive_popover_header_height: 2.75rem;--ui5-v2-1-1_side_navigation_item_height: 2.75rem;--_ui5-v2-1-1-tree-indent-step: 1.5rem;--_ui5-v2-1-1-tree-toggle-box-width: 2.75rem;--_ui5-v2-1-1-tree-toggle-box-height: 2.25rem;--_ui5-v2-1-1-tree-toggle-icon-size: 1.0625rem;--_ui5-v2-1-1_timeline_tli_indicator_before_bottom: -1.5rem;--_ui5-v2-1-1_timeline_tli_indicator_before_right: -1.625rem;--_ui5-v2-1-1_timeline_tli_indicator_before_without_icon_bottom: -1.875rem;--_ui5-v2-1-1_timeline_tli_indicator_before_without_icon_right: -1.9375rem;--_ui5-v2-1-1_timeline_tli_indicator_after_top: calc(-100% - 1rem) ;--_ui5-v2-1-1_timeline_tli_indicator_after_height: calc(100% + 1rem) ;--_ui5-v2-1-1_timeline_tli_indicator_before_height: 100%;--_ui5-v2-1-1_timeline_tli_horizontal_indicator_after_width: calc(100% + .25rem) ;--_ui5-v2-1-1_timeline_tli_horizontal_indicator_after_left: 1.9375rem;--_ui5-v2-1-1_timeline_tli_horizontal_without_icon_indicator_before_width: calc(100% + .5rem) ;--_ui5-v2-1-1_timeline_tli_horizontal_indicator_before_width: calc(100% + .5rem) ;--_ui5-v2-1-1_timeline_tli_icon_horizontal_indicator_after_width: calc(100% + .25rem) ;--_ui5-v2-1-1_timeline_tli_without_icon_horizontal_indicator_before_width: calc(100% + .375rem) ;--_ui5-v2-1-1_timeline_tli_horizontal_indicator_short_after_width: 100%;--_ui5-v2-1-1_timeline_tli_last_child_vertical_indicator_before_height: calc(100% - 1.5rem) ;--_ui5-v2-1-1-toolbar-separator-height: 2rem;--_ui5-v2-1-1-toolbar-height: 2.75rem;--_ui5-v2-1-1_toolbar_overflow_padding: .25rem .5rem;--_ui5-v2-1-1_table_cell_padding: .25rem .5rem;--_ui5-v2-1-1_dynamic_page_title_actions_separator_height: var(--_ui5-v2-1-1-toolbar-separator-height);--_ui5-v2-1-1_split_button_middle_separator_top: .625rem;--_ui5-v2-1-1_split_button_middle_separator_height: 1rem;--_ui5-v2-1-1-calendar-legend-item-root-focus-border-radius: .25rem;--_ui5-v2-1-1_color-palette-item-height: 1.75rem;--_ui5-v2-1-1_color-palette-item-hover-height: 2.25rem;--_ui5-v2-1-1_color-palette-item-margin: calc(((var(--_ui5-v2-1-1_color-palette-item-hover-height) - var(--_ui5-v2-1-1_color-palette-item-height)) / 2) + .0625rem);--_ui5-v2-1-1_color-palette-row-width: 12rem;--_ui5-v2-1-1_textarea_padding_top: .5rem;--_ui5-v2-1-1_textarea_padding_bottom: .4375rem;--_ui5-v2-1-1_dp_two_calendar_item_secondary_text_padding_block: 0 .5rem;--_ui5-v2-1-1_dp_two_calendar_item_secondary_text_padding: 0 .5rem;--_ui5-v2-1-1_daypicker_two_calendar_item_selected_focus_margin_bottom: 0;--_ui5-v2-1-1_daypicker_two_calendar_item_selected_focus_padding_right: .5rem}[dir=rtl]{--_ui5-v2-1-1_table_shadow_border_left: inset calc(-1 * var(--sapContent_FocusWidth)) 0 var(--sapContent_FocusColor);--_ui5-v2-1-1_table_shadow_border_right: inset var(--sapContent_FocusWidth) 0 var(--sapContent_FocusColor);--_ui5-v2-1-1_icon_transform_scale: scale(-1, 1);--_ui5-v2-1-1_panel_toggle_btn_rotation: var(--_ui5-v2-1-1_rotation_minus_90deg);--_ui5-v2-1-1_li_notification_group_toggle_btn_rotation: var(--_ui5-v2-1-1_rotation_minus_90deg);--_ui5-v2-1-1_timeline_scroll_container_offset: -.5rem;--_ui5-v2-1-1_popover_upward_arrow_margin: .1875rem .125rem 0 0;--_ui5-v2-1-1_popover_right_arrow_margin: .1875rem .25rem 0 0;--_ui5-v2-1-1_popover_downward_arrow_margin: -.4375rem .125rem 0 0;--_ui5-v2-1-1_popover_left_arrow_margin: .1875rem -.375rem 0 0;--_ui5-v2-1-1_dialog_resize_cursor:sw-resize;--_ui5-v2-1-1_menu_submenu_margin_offset: 0 -.25rem;--_ui5-v2-1-1_menu_submenu_placement_type_left_margin_offset: 0 .25rem;--_ui5-v2-1-1-menu_item_icon_float: left;--_ui5-v2-1-1-shellbar-notification-btn-count-offset: auto;--_ui5-v2-1-1_segmented_btn_item_border_left: .0625rem;--_ui5-v2-1-1_segmented_btn_item_border_right: .0625rem;--_ui5-v2-1-1_progress_indicator_bar_border_radius: .5rem;--_ui5-v2-1-1_progress_indicator_remaining_bar_border_radius: .25rem}[data-ui5-compact-size],.ui5-content-density-compact,.sapUiSizeCompact{--_ui5-v2-1-1_input_min_width: 2rem;--_ui5-v2-1-1_input_icon_width: 2rem;--_ui5-v2-1-1_input_information_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-1-1_input_information_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-1-1_input_error_warning_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-1-1_input_error_warning_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-1-1_input_custom_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-1-1_input_error_warning_custom_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-1-1_input_error_warning_custom_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-1-1_input_information_custom_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-1-1_input_information_custom_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-1-1_input_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-1-1_panel_header_button_wrapper_padding: .1875rem .25rem;--_ui5-v2-1-1_rating_indicator_item_height: 1em;--_ui5-v2-1-1_rating_indicator_item_width: 1em;--_ui5-v2-1-1_rating_indicator_readonly_item_height: .75em;--_ui5-v2-1-1_rating_indicator_readonly_item_width: .75em;--_ui5-v2-1-1_rating_indicator_component_spacing: .5rem 0px;--_ui5-v2-1-1_radio_button_min_width: 2rem;--_ui5-v2-1-1_radio_button_outer_ring_padding_with_label: 0 .5rem;--_ui5-v2-1-1_radio_button_outer_ring_padding: 0 .5rem;--_ui5-v2-1-1_radio_button_focus_dist: .1875rem;--_ui5-v2-1-1_switch_height: 2rem;--_ui5-v2-1-1_switch_width: 3rem;--_ui5-v2-1-1_switch_min_width: none;--_ui5-v2-1-1_switch_with_label_width: 3.75rem;--_ui5-v2-1-1_switch_root_outline_top: .25rem;--_ui5-v2-1-1_switch_root_outline_bottom: .25rem;--_ui5-v2-1-1_switch_transform: translateX(100%) translateX(-1.375rem);--_ui5-v2-1-1_switch_transform_with_label: translateX(100%) translateX(-1.875rem);--_ui5-v2-1-1_switch_rtl_transform: translateX(1.375rem) translateX(-100%);--_ui5-v2-1-1_switch_rtl_transform_with_label: translateX(1.875rem) translateX(-100%);--_ui5-v2-1-1_switch_track_width: 2rem;--_ui5-v2-1-1_switch_track_height: 1.25rem;--_ui5-v2-1-1_switch_track_with_label_width: 2.75rem;--_ui5-v2-1-1_switch_track_with_label_height: 1.25rem;--_ui5-v2-1-1_switch_handle_width: 1.25rem;--_ui5-v2-1-1_switch_handle_height: 1rem;--_ui5-v2-1-1_switch_handle_with_label_width: 1.75rem;--_ui5-v2-1-1_switch_handle_with_label_height: 1rem;--_ui5-v2-1-1_switch_text_font_size: var(--sapFontSize);--_ui5-v2-1-1_switch_text_width: 1rem;--_ui5-v2-1-1_switch_text_active_left: .1875rem;--_ui5-v2-1-1_textarea_padding_right_and_left_readonly: .4375rem;--_ui5-v2-1-1_textarea_padding_top_readonly: .125rem;--_ui5-v2-1-1_textarea_exceeded_text_height: .375rem;--_ui5-v2-1-1_textarea_min_height: 1.625rem;--_ui5-v2-1-1_textarea_padding_bottom_readonly: .0625rem;--_ui5-v2-1-1_textarea_padding_top_error_warning: .1875rem;--_ui5-v2-1-1_textarea_padding_bottom_error_warning: .125rem;--_ui5-v2-1-1_textarea_padding_top_information: .1875rem;--_ui5-v2-1-1_textarea_padding_bottom_information: .125rem;--_ui5-v2-1-1_textarea_padding_right_and_left: .5rem;--_ui5-v2-1-1_textarea_padding_right_and_left_error_warning: .5rem;--_ui5-v2-1-1_textarea_padding_right_and_left_information: .5rem;--_ui5-v2-1-1_token_selected_focused_offset_bottom: -.25rem;--_ui5-v2-1-1_tokenizer-popover_offset: .1875rem;--_ui5-v2-1-1_slider_handle_icon_size: .875rem;--_ui5-v2-1-1_slider_padding: 1rem 1.0625rem;--_ui5-v2-1-1_range_slider_progress_focus_width: calc(100% + var(--_ui5-v2-1-1_slider_handle_width) + 10px);--_ui5-v2-1-1_range_slider_progress_focus_height: calc(var(--_ui5-v2-1-1_slider_handle_height) + 10px);--_ui5-v2-1-1_range_slider_progress_focus_top: -.8125rem;--_ui5-v2-1-1_slider_tooltip_bottom: 1.75rem;--_ui5-v2-1-1_slider_handle_focused_tooltip_distance: calc(var(--_ui5-v2-1-1_slider_tooltip_bottom) - var(--_ui5-v2-1-1_slider_handle_focus_width));--_ui5-v2-1-1_range_slider_progress_focus_left: calc(-1 * (var(--_ui5-v2-1-1_slider_handle_width) / 2) - 5px);--_ui5-v2-1-1_bar_base_height: 2.5rem;--_ui5-v2-1-1_bar_subheader_height: 2.25rem;--_ui5-v2-1-1_button_base_height: var(--sapElement_Compact_Height);--_ui5-v2-1-1_button_base_padding: .4375rem;--_ui5-v2-1-1_button_base_min_width: 2rem;--_ui5-v2-1-1_button_icon_font_size: 1rem;--_ui5-v2-1-1_calendar_height: 18rem;--_ui5-v2-1-1_calendar_width: 17.75rem;--_ui5-v2-1-1_calendar_left_right_padding: .25rem;--_ui5-v2-1-1_calendar_top_bottom_padding: .5rem;--_ui5-v2-1-1_calendar_header_height: 2rem;--_ui5-v2-1-1_calendar_header_arrow_button_width: 2rem;--_ui5-v2-1-1_calendar_header_padding: 0;--_ui5-v2-1-1-calendar-legend-root-padding: .5rem;--_ui5-v2-1-1-calendar-legend-root-width: 16.75rem;--_ui5-v2-1-1-calendar-legend-item-root-focus-margin: -.125rem;--_ui5-v2-1-1_checkbox_root_side_padding: var(--_ui5-v2-1-1_checkbox_wrapped_focus_padding);--_ui5-v2-1-1_checkbox_width_height: var(--_ui5-v2-1-1_checkbox_compact_width_height);--_ui5-v2-1-1_checkbox_wrapper_padding: var(--_ui5-v2-1-1_checkbox_compact_wrapper_padding);--_ui5-v2-1-1_checkbox_inner_width_height: var(--_ui5-v2-1-1_checkbox_compact_inner_size);--_ui5-v2-1-1_checkbox_icon_size: .75rem;--_ui5-v2-1-1_checkbox_partially_icon_size: .5rem;--_ui5-v2-1-1_custom_list_item_rb_min_width: 2rem;--_ui5-v2-1-1_daypicker_weeknumbers_container_padding_top: 2rem;--_ui5-v2-1-1_day_picker_item_width: 2rem;--_ui5-v2-1-1_day_picker_item_height: 2rem;--_ui5-v2-1-1_day_picker_empty_height: 2.125rem;--_ui5-v2-1-1_day_picker_item_justify_content: flex-end;--_ui5-v2-1-1_dp_two_calendar_item_now_text_padding_top: .5rem;--_ui5-v2-1-1_dp_two_calendar_item_primary_text_height: 1rem;--_ui5-v2-1-1_dp_two_calendar_item_secondary_text_height: .75rem;--_ui5-v2-1-1_dp_two_calendar_item_text_padding_top: .5rem;--_ui5-v2-1-1_daypicker_special_day_top: 1.625rem;--_ui5-v2-1-1_daypicker_twocalendar_item_special_day_top: 1.25rem;--_ui5-v2-1-1_daypicker_twocalendar_item_special_day_right: 1.25rem;--_ui5-v2-1-1_daypicker_two_calendar_item_margin_bottom: 0;--_ui5-v2-1-1_daypicker_item_now_selected_two_calendar_focus_special_day_top: 1.125rem;--_ui5-v2-1-1_daypicker_item_now_selected_two_calendar_focus_special_day_right: 1.125rem;--_ui5-v2-1-1_daypicker_item_now_selected_two_calendar_focus_secondary_text_padding_block: 0 1rem;--_ui5-v2-1-1_datetime_picker_height: 20.5rem;--_ui5-v2-1-1_datetime_picker_width: 35.5rem;--_ui5-v2-1-1_datetime_timeview_width: 17rem;--_ui5-v2-1-1_datetime_timeview_phonemode_width: 18.5rem;--_ui5-v2-1-1_datetime_timeview_padding: .5rem;--_ui5-v2-1-1_datetime_timeview_phonemode_clocks_width: 21.125rem;--_ui5-v2-1-1_datetime_dateview_phonemode_margin_bottom: 3.125rem;--_ui5-v2-1-1_dialog_content_min_height: 2.5rem;--_ui5-v2-1-1_dialog_footer_height: 2.5rem;--_ui5-v2-1-1_form_item_min_height: 2rem;--_ui5-v2-1-1_form_item_padding: .25rem;--_ui5-v2-1-1-form-group-heading-height: 2rem;--_ui5-v2-1-1_input_height: var(--sapElement_Compact_Height);--_ui5-v2-1-1_input_inner_padding: 0 .5rem;--_ui5-v2-1-1_input_inner_padding_with_icon: 0 .2rem 0 .5rem;--_ui5-v2-1-1_input_inner_space_to_tokenizer: .125rem;--_ui5-v2-1-1_input_inner_space_to_n_more_text: .125rem;--_ui5-v2-1-1_input_icon_min_width: var(--_ui5-v2-1-1_input_compact_min_width);--_ui5-v2-1-1_menu_item_padding: 0 .75rem 0 .5rem;--_ui5-v2-1-1_menu_item_submenu_icon_right: .75rem;--_ui5-v2-1-1_popup_default_header_height: 2.5rem;--_ui5-v2-1-1_textarea_margin: .1875rem 0;--_ui5-v2-1-1_list_no_data_height: 2rem;--_ui5-v2-1-1_list_item_cb_margin_right: .5rem;--_ui5-v2-1-1_list_item_title_size: var(--sapFontSize);--_ui5-v2-1-1_list_item_img_top_margin: .55rem;--_ui5-v2-1-1_list_no_data_font_size: var(--sapFontSize);--_ui5-v2-1-1_list_item_dropdown_base_height: 2rem;--_ui5-v2-1-1_list_item_base_height: 2rem;--_ui5-v2-1-1_list_item_base_padding: 0 1rem;--_ui5-v2-1-1_list_item_icon_size: 1rem;--_ui5-v2-1-1_list_item_selection_btn_margin_top: calc(-1 * var(--_ui5-v2-1-1_checkbox_wrapper_padding));--_ui5-v2-1-1_list_item_content_vertical_offset: calc((var(--_ui5-v2-1-1_list_item_base_height) - var(--_ui5-v2-1-1_list_item_title_size)) / 2);--_ui5-v2-1-1_list_busy_row_height: 2rem;--_ui5-v2-1-1_list_buttons_left_space: .125rem;--_ui5-v2-1-1_month_picker_item_height: 2rem;--_ui5-v2-1-1_year_picker_item_height: 2rem;--_ui5-v2-1-1_panel_header_height: 2rem;--_ui5-v2-1-1_panel_button_root_height: 2rem;--_ui5-v2-1-1_panel_button_root_width: 2.5rem;--_ui5-v2-1-1_token_height: 1.25rem;--_ui5-v2-1-1_token_right_margin: .25rem;--_ui5-v2-1-1_token_left_padding: .25rem;--_ui5-v2-1-1_token_readonly_padding: .125rem .25rem;--_ui5-v2-1-1_token_focus_offset: -.125rem;--_ui5-v2-1-1_token_icon_size: .75rem;--_ui5-v2-1-1_token_icon_padding: .375rem .375rem;--_ui5-v2-1-1_token_wrapper_right_padding: .25rem;--_ui5-v2-1-1_token_wrapper_left_padding: 0;--_ui5-v2-1-1_token_outline_offset: -.125rem;--_ui5-v2-1-1_tl_bubble_padding: .5rem;--_ui5-v2-1-1_tl_indicator_before_bottom: -.5rem;--_ui5-v2-1-1_tl_padding: .5rem;--_ui5-v2-1-1_tl_li_margin_bottom: .5rem;--_ui5-v2-1-1_tc_item_text: 2rem;--_ui5-v2-1-1_tc_item_text_line_height: 1.325rem;--_ui5-v2-1-1_tc_item_add_text_margin_top: .3125rem;--_ui5-v2-1-1_tc_item_height: 4rem;--_ui5-v2-1-1_tc_header_height: var(--_ui5-v2-1-1_tc_item_height);--_ui5-v2-1-1_tc_item_icon_circle_size: 2rem;--_ui5-v2-1-1_tc_item_icon_size: 1rem;--_ui5-v2-1-1_radio_button_height: 2rem;--_ui5-v2-1-1_radio_button_label_side_padding: .5rem;--_ui5-v2-1-1_radio_button_inner_size: 2rem;--_ui5-v2-1-1_radio_button_svg_size: 1rem;--_ui5-v2-1-1-responsive_popover_header_height: 2.5rem;--ui5-v2-1-1_side_navigation_item_height: 2rem;--_ui5-v2-1-1_slider_handle_height: 1.25rem;--_ui5-v2-1-1_slider_handle_width: 1.25rem;--_ui5-v2-1-1_slider_tooltip_padding: .25rem;--_ui5-v2-1-1_slider_progress_outline_offset: -.625rem;--_ui5-v2-1-1_slider_outer_height: 1.3125rem;--_ui5-v2-1-1_step_input_min_width: 6rem;--_ui5-v2-1-1_step_input_padding: 2rem;--_ui5-v2-1-1-tree-indent-step: .5rem;--_ui5-v2-1-1-tree-toggle-box-width: 2rem;--_ui5-v2-1-1-tree-toggle-box-height: 1.5rem;--_ui5-v2-1-1-tree-toggle-icon-size: .8125rem;--_ui5-v2-1-1_timeline_tli_indicator_before_bottom: -.75rem;--_ui5-v2-1-1_timeline_tli_indicator_before_right: -.5rem;--_ui5-v2-1-1_timeline_tli_indicator_before_without_icon_bottom: -1rem;--_ui5-v2-1-1_timeline_tli_indicator_before_without_icon_right: -.8125rem;--_ui5-v2-1-1_timeline_tli_indicator_before_height: calc(100% - 1.25rem) ;--_ui5-v2-1-1_timeline_tli_horizontal_without_icon_indicator_before_width: var(--_ui5-v2-1-1_timeline_tli_indicator_after_height);--_ui5-v2-1-1_timeline_tli_horizontal_indicator_after_width: var(--_ui5-v2-1-1_timeline_tli_indicator_after_height);--_ui5-v2-1-1_timeline_tli_horizontal_indicator_before_width: var(--_ui5-v2-1-1_timeline_tli_indicator_after_height);--_ui5-v2-1-1_timeline_tli_icon_horizontal_indicator_after_width: var(--_ui5-v2-1-1_timeline_tli_indicator_after_height);--_ui5-v2-1-1_timeline_tli_indicator_after_top: calc(-100% + .9375rem) ;--_ui5-v2-1-1_timeline_tli_indicator_after_height: calc(100% - .75rem) ;--_ui5-v2-1-1_timeline_tli_horizontal_indicator_after_left: 1.8625rem;--_ui5-v2-1-1_timeline_tli_horizontal_indicator_short_after_width: calc(100% - 1rem) ;--_ui5-v2-1-1_timeline_tli_without_icon_horizontal_indicator_before_width: calc(100% - .625rem) ;--_ui5-v2-1-1_timeline_tli_last_child_vertical_indicator_before_height: calc(100% - 2.5rem) ;--_ui5-v2-1-1_timeline_tlgi_compact_icon_before_height: calc(100% + 1.5rem) ;--_ui5-v2-1-1_timeline_tlgi_horizontal_line_placeholder_before_width: var(--_ui5-v2-1-1_timeline_tlgi_compact_icon_before_height);--_ui5-v2-1-1_timeline_tlgi_horizontal_compact_root_margin_left: .5rem;--_ui5-v2-1-1_timeline_tlgi_compact_root_gap: .5rem;--_ui5-v2-1-1_timeline_tlgi_root_horizontal_height: 19.375rem;--_ui5-v2-1-1_vsd_header_container: 2.5rem;--_ui5-v2-1-1_vsd_sub_header_container_height: 2rem;--_ui5-v2-1-1_vsd_header_height: 4rem;--_ui5-v2-1-1_vsd_expand_content_height: 25.4375rem;--_ui5-v2-1-1-toolbar-separator-height: 1.5rem;--_ui5-v2-1-1-toolbar-height: 2rem;--_ui5-v2-1-1_toolbar_overflow_padding: .1875rem .375rem;--_ui5-v2-1-1_dynamic_page_title_actions_separator_height: var(--_ui5-v2-1-1-toolbar-separator-height);--_ui5-v2-1-1_textarea_padding_top: .1875rem;--_ui5-v2-1-1_textarea_padding_bottom: .125rem;--_ui5-v2-1-1_checkbox_focus_position: .25rem;--_ui5-v2-1-1_split_button_middle_separator_top: .3125rem;--_ui5-v2-1-1_split_button_middle_separator_height: 1rem;--_ui5-v2-1-1_slider_handle_top: -.5rem;--_ui5-v2-1-1_slider_tooltip_height: 1.375rem;--_ui5-v2-1-1_checkbox_wrapped_focus_inset_block: .125rem;--_ui5-v2-1-1_color-palette-item-height: 1.25rem;--_ui5-v2-1-1_color-palette-item-focus-height: 1rem;--_ui5-v2-1-1_color-palette-item-container-sides-padding: .1875rem;--_ui5-v2-1-1_color-palette-item-container-rows-padding: .8125rem;--_ui5-v2-1-1_color-palette-item-hover-height: 1.625rem;--_ui5-v2-1-1_color-palette-item-margin: calc(((var(--_ui5-v2-1-1_color-palette-item-hover-height) - var(--_ui5-v2-1-1_color-palette-item-height)) / 2) + .0625rem);--_ui5-v2-1-1_color-palette-row-width: 8.75rem;--_ui5-v2-1-1_color-palette-swatch-container-padding: .1875rem .5rem;--_ui5-v2-1-1_color-palette-item-hover-margin: .0625rem;--_ui5-v2-1-1_color-palette-row-height: 7.5rem;--_ui5-v2-1-1_color-palette-button-height: 2rem;--_ui5-v2-1-1_color-palette-item-before-focus-inset: -.25rem;--_ui5-v2-1-1_color_picker_slider_container_margin_top: -9px;--_ui5-v2-1-1_daypicker_selected_item_now_special_day_top: 1.5625rem;--_ui5-v2-1-1_daypicker_specialday_focused_top: 1.3125rem;--_ui5-v2-1-1_daypicker_selected_item_now_special_day_border_bottom_radius_alternate: .5rem;--_ui5-v2-1-1_daypicker_specialday_focused_border_bottom: .25rem;--_ui5-v2-1-1_daypicker_item_now_specialday_top: 1.4375rem;--_ui5-v2-1-1_dp_two_calendar_item_secondary_text_padding_block: 0 .375rem;--_ui5-v2-1-1_dp_two_calendar_item_secondary_text_padding: 0 .375rem;--_ui5-v2-1-1_daypicker_two_calendar_item_selected_focus_margin_bottom: -.25rem;--_ui5-v2-1-1_daypicker_two_calendar_item_selected_focus_padding_right: .4375rem}:root,[dir=ltr]{--_ui5-v2-1-1_rotation_90deg: rotate(90deg);--_ui5-v2-1-1_rotation_minus_90deg: rotate(-90deg);--_ui5-v2-1-1_icon_transform_scale: none;--_ui5-v2-1-1_panel_toggle_btn_rotation: var(--_ui5-v2-1-1_rotation_90deg);--_ui5-v2-1-1_li_notification_group_toggle_btn_rotation: var(--_ui5-v2-1-1_rotation_90deg);--_ui5-v2-1-1_timeline_scroll_container_offset: .5rem;--_ui5-v2-1-1_popover_upward_arrow_margin: .1875rem 0 0 .1875rem;--_ui5-v2-1-1_popover_right_arrow_margin: .1875rem 0 0 -.375rem;--_ui5-v2-1-1_popover_downward_arrow_margin: -.375rem 0 0 .125rem;--_ui5-v2-1-1_popover_left_arrow_margin: .125rem 0 0 .25rem;--_ui5-v2-1-1_dialog_resize_cursor: se-resize;--_ui5-v2-1-1_progress_indicator_bar_border_radius: .5rem 0 0 .5rem;--_ui5-v2-1-1_progress_indicator_remaining_bar_border_radius: 0 .5rem .5rem 0;--_ui5-v2-1-1_menu_submenu_margin_offset: -.25rem 0;--_ui5-v2-1-1_menu_submenu_placement_type_left_margin_offset: .25rem 0;--_ui5-v2-1-1-menu_item_icon_float: right;--_ui5-v2-1-1-shellbar-notification-btn-count-offset: -.125rem}
` };

    registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_horizon", async () => styleData$4);
    registerThemePropertiesLoader("@ui5/webcomponents", "sap_horizon", async () => styleData$3);
    const styleData$2 = { packageName: "@ui5/webcomponents", fileName: "themes/Icon.css.ts", content: `:host{-webkit-tap-highlight-color:rgba(0,0,0,0)}:host([hidden]){display:none}:host([invalid]){display:none}:host(:not([hidden]).ui5_hovered){opacity:.7}:host{display:inline-block;width:1rem;height:1rem;color:var(--sapContent_IconColor);fill:currentColor;outline:none}:host([design="Contrast"]){color:var(--sapContent_ContrastIconColor)}:host([design="Critical"]){color:var(--sapCriticalElementColor)}:host([design="Information"]){color:var(--sapInformativeElementColor)}:host([design="Negative"]){color:var(--sapNegativeElementColor)}:host([design="Neutral"]){color:var(--sapNeutralElementColor)}:host([design="NonInteractive"]){color:var(--sapContent_NonInteractiveIconColor)}:host([design="Positive"]){color:var(--sapPositiveElementColor)}:host([mode="Interactive"][desktop]) .ui5-icon-root:focus,:host([mode="Interactive"]) .ui5-icon-root:focus-visible{outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);border-radius:var(--ui5-v2-1-1-icon-focus-border-radius)}.ui5-icon-root{display:flex;height:100%;width:100%;outline:none;vertical-align:top}:host([mode="Interactive"]){cursor:pointer}.ui5-icon-root:not([dir=ltr]){transform:var(--_ui5-v2-1-1_icon_transform_scale);transform-origin:center}
` };

    var __decorate$2 = this && this.__decorate || (function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return (c > 3 && r && Object.defineProperty(target, key, r), r);
    });
    const ICON_NOT_FOUND = "ICON_NOT_FOUND";
    let Icon = class Icon extends UI5Element {
      constructor() {
        super(...arguments);
        this.design = "Default";
        this.showTooltip = false;
        this.mode = "Image";
        this.pathData = [];
        this.invalid = false;
      }
      _onkeydown(e) {
        if (this.mode !== IconMode$1.Interactive) {
          return;
        }
        if (isEnter(e)) {
          this.fireEvent("click");
        }
        if (isSpace(e)) {
          e.preventDefault();
        }
      }
      _onkeyup(e) {
        if (this.mode === IconMode$1.Interactive && isSpace(e)) {
          this.fireEvent("click");
        }
      }
      get _dir() {
        return this.ltr ? "ltr" : undefined;
      }
      get effectiveAriaHidden() {
        return this.mode === IconMode$1.Decorative ? "true" : undefined;
      }
      get _tabIndex() {
        return this.mode === IconMode$1.Interactive ? "0" : undefined;
      }
      get effectiveAccessibleRole() {
        switch (this.mode) {
          case IconMode$1.Interactive:
            return "button";
          case IconMode$1.Decorative:
            return "presentation";
          default:
            return "img";
        }
      }
      onEnterDOM() {
        if (isDesktop()) {
          this.setAttribute("desktop", "");
        }
      }
      async onBeforeRendering() {
        const name = this.name;
        if (!name) {
          return console.warn("Icon name property is required", this);
        }
        let iconData = getIconDataSync(name);
        if (!iconData) {
          iconData = await getIconData(name);
        }
        if (!iconData) {
          this.invalid = true;
          return console.warn(`Required icon is not registered. Invalid icon name: ${this.name}`);
        }
        if (iconData === ICON_NOT_FOUND) {
          this.invalid = true;
          return console.warn(`Required icon is not registered. You can either import the icon as a module in order to use it e.g. "@ui5/webcomponents-icons/dist/${name.replace("sap-icon://", "")}.js", or setup a JSON build step and import "@ui5/webcomponents-icons/dist/AllIcons.js".`);
        }
        this.viewBox = iconData.viewBox || "0 0 512 512";
        if (iconData.customTemplate) {
          iconData.pathData = [];
          this.customSvg = executeTemplate(iconData.customTemplate, this);
        }
        this.invalid = false;
        this.pathData = Array.isArray(iconData.pathData) ? iconData.pathData : [iconData.pathData];
        this.accData = iconData.accData;
        this.ltr = iconData.ltr;
        this.packageName = iconData.packageName;
        if (this.accessibleName) {
          this.effectiveAccessibleName = this.accessibleName;
        } else if (this.accData) {
          const i18nBundle = await getI18nBundle(this.packageName);
          this.effectiveAccessibleName = i18nBundle.getText(this.accData) || undefined;
        } else {
          this.effectiveAccessibleName = undefined;
        }
      }
      get hasIconTooltip() {
        return this.showTooltip && this.effectiveAccessibleName;
      }
    };
    __decorate$2([property()], Icon.prototype, "design", void 0);
    __decorate$2([property()], Icon.prototype, "name", void 0);
    __decorate$2([property()], Icon.prototype, "accessibleName", void 0);
    __decorate$2([property({
      type: Boolean
    })], Icon.prototype, "showTooltip", void 0);
    __decorate$2([property()], Icon.prototype, "mode", void 0);
    __decorate$2([property({
      type: Array
    })], Icon.prototype, "pathData", void 0);
    __decorate$2([property({
      type: Object,
      noAttribute: true
    })], Icon.prototype, "accData", void 0);
    __decorate$2([property({
      type: Boolean
    })], Icon.prototype, "invalid", void 0);
    __decorate$2([property({
      noAttribute: true
    })], Icon.prototype, "effectiveAccessibleName", void 0);
    Icon = __decorate$2([customElement({
      tag: "ui5-icon",
      languageAware: true,
      themeAware: true,
      renderer: litRender,
      template: block0$1,
      styles: styleData$2
    }), event("click")], Icon);
    Icon.define();
    var Icon$1 = Icon;

    const BUTTON_ARIA_TYPE_ACCEPT = { key: "BUTTON_ARIA_TYPE_ACCEPT", defaultText: "Positive Action" };
    const BUTTON_ARIA_TYPE_REJECT = { key: "BUTTON_ARIA_TYPE_REJECT", defaultText: "Negative Action" };
    const BUTTON_ARIA_TYPE_EMPHASIZED = { key: "BUTTON_ARIA_TYPE_EMPHASIZED", defaultText: "Emphasized" };
    const PANEL_ICON = { key: "PANEL_ICON", defaultText: "Expand/Collapse" };

    registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_horizon", async () => styleData$4);
    registerThemePropertiesLoader("@ui5/webcomponents", "sap_horizon", async () => styleData$3);
    const styleData$1 = { packageName: "@ui5/webcomponents", fileName: "themes/Button.css.ts", content: `:host{vertical-align:middle}.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:inline-block}:host{min-width:var(--_ui5-v2-1-1_button_base_min_width);height:var(--_ui5-v2-1-1_button_base_height);line-height:normal;font-family:var(--_ui5-v2-1-1_button_fontFamily);font-size:var(--sapFontSize);text-shadow:var(--_ui5-v2-1-1_button_text_shadow);border-radius:var(--_ui5-v2-1-1_button_border_radius);cursor:pointer;background-color:var(--sapButton_Background);border:var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);color:var(--sapButton_TextColor);box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ui5-button-root{min-width:inherit;cursor:inherit;height:100%;width:100%;box-sizing:border-box;display:flex;justify-content:center;align-items:center;outline:none;padding:0 var(--_ui5-v2-1-1_button_base_padding);position:relative;background:transparent;border:none;color:inherit;text-shadow:inherit;font:inherit;white-space:inherit;overflow:inherit;text-overflow:inherit;letter-spacing:inherit;word-spacing:inherit;line-height:inherit;-webkit-user-select:none;-moz-user-select:none;user-select:none}:host(:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host(:not([hidden]):not([disabled]).ui5_hovered){background:var(--sapButton_Hover_Background);border:1px solid var(--sapButton_Hover_BorderColor);color:var(--sapButton_Hover_TextColor)}.ui5-button-icon,.ui5-button-end-icon{color:inherit;flex-shrink:0}.ui5-button-end-icon{margin-inline-start:var(--_ui5-v2-1-1_button_base_icon_margin)}:host([icon-only]:not([has-end-icon])) .ui5-button-root{min-width:auto;padding:0}:host([icon-only]) .ui5-button-text{display:none}.ui5-button-text{outline:none;position:relative;white-space:inherit;overflow:inherit;text-overflow:inherit}:host([has-icon]:not(:empty)) .ui5-button-text{margin-inline-start:var(--_ui5-v2-1-1_button_base_icon_margin)}:host([has-end-icon]:not([has-icon]):empty) .ui5-button-end-icon{margin-inline-start:0}:host([disabled]){opacity:var(--sapContent_DisabledOpacity);pointer-events:unset;cursor:default}:host([has-icon]:not([icon-only]):not([has-end-icon])) .ui5-button-text{min-width:calc(var(--_ui5-v2-1-1_button_base_min_width) - var(--_ui5-v2-1-1_button_base_icon_margin) - 1rem)}:host([disabled]:active){pointer-events:none}:host([desktop]:not([active])) .ui5-button-root:focus-within:after,:host(:not([active])) .ui5-button-root:focus-visible:after,:host([desktop][active][design="Emphasized"]) .ui5-button-root:focus-within:after,:host([active][design="Emphasized"]) .ui5-button-root:focus-visible:after,:host([desktop][active]) .ui5-button-root:focus-within:before,:host([active]) .ui5-button-root:focus-visible:before{content:"";position:absolute;box-sizing:border-box;inset:.0625rem;border:var(--_ui5-v2-1-1_button_focused_border);border-radius:var(--_ui5-v2-1-1_button_focused_border_radius)}:host([desktop][active]) .ui5-button-root:focus-within:before,:host([active]) .ui5-button-root:focus-visible:before{border-color:var(--_ui5-v2-1-1_button_pressed_focused_border_color)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:after,:host([design="Emphasized"]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-1-1_button_emphasized_focused_border_color)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:before,:host([design="Emphasized"]) .ui5-button-root:focus-visible:before{content:"";position:absolute;box-sizing:border-box;inset:.0625rem;border:var(--_ui5-v2-1-1_button_emphasized_focused_border_before);border-radius:var(--_ui5-v2-1-1_button_focused_border_radius)}.ui5-button-root::-moz-focus-inner{border:0}bdi{display:block;white-space:inherit;overflow:inherit;text-overflow:inherit}:host([ui5-button][active]:not([disabled]):not([non-interactive])){background-image:none;background-color:var(--sapButton_Active_Background);border-color:var(--sapButton_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([design="Positive"]){background-color:var(--sapButton_Accept_Background);border-color:var(--sapButton_Accept_BorderColor);color:var(--sapButton_Accept_TextColor)}:host([design="Positive"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Positive"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Accept_Hover_Background);border-color:var(--sapButton_Accept_Hover_BorderColor);color:var(--sapButton_Accept_Hover_TextColor)}:host([ui5-button][design="Positive"][active]:not([non-interactive])){background-color:var(--sapButton_Accept_Active_Background);border-color:var(--sapButton_Accept_Active_BorderColor);color:var(--sapButton_Accept_Active_TextColor)}:host([design="Negative"]){background-color:var(--sapButton_Reject_Background);border-color:var(--sapButton_Reject_BorderColor);color:var(--sapButton_Reject_TextColor)}:host([design="Negative"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Negative"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Reject_Hover_Background);border-color:var(--sapButton_Reject_Hover_BorderColor);color:var(--sapButton_Reject_Hover_TextColor)}:host([ui5-button][design="Negative"][active]:not([non-interactive])){background-color:var(--sapButton_Reject_Active_Background);border-color:var(--sapButton_Reject_Active_BorderColor);color:var(--sapButton_Reject_Active_TextColor)}:host([design="Attention"]){background-color:var(--sapButton_Attention_Background);border-color:var(--sapButton_Attention_BorderColor);color:var(--sapButton_Attention_TextColor)}:host([design="Attention"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Attention"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Attention_Hover_Background);border-color:var(--sapButton_Attention_Hover_BorderColor);color:var(--sapButton_Attention_Hover_TextColor)}:host([ui5-button][design="Attention"][active]:not([non-interactive])){background-color:var(--sapButton_Attention_Active_Background);border-color:var(--sapButton_Attention_Active_BorderColor);color:var(--sapButton_Attention_Active_TextColor)}:host([design="Emphasized"]){background-color:var(--sapButton_Emphasized_Background);border-color:var(--sapButton_Emphasized_BorderColor);border-width:var(--_ui5-v2-1-1_button_emphasized_border_width);color:var(--sapButton_Emphasized_TextColor);font-family:var(--sapFontBoldFamily )}:host([design="Emphasized"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Emphasized"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Emphasized_Hover_Background);border-color:var(--sapButton_Emphasized_Hover_BorderColor);border-width:var(--_ui5-v2-1-1_button_emphasized_border_width);color:var(--sapButton_Emphasized_Hover_TextColor)}:host([ui5-button][design="Empasized"][active]:not([non-interactive])){background-color:var(--sapButton_Emphasized_Active_Background);border-color:var(--sapButton_Emphasized_Active_BorderColor);color:var(--sapButton_Emphasized_Active_TextColor)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:after,:host([design="Emphasized"]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-1-1_button_emphasized_focused_border_color);outline:none}:host([design="Emphasized"][desktop][active]:not([non-interactive])) .ui5-button-root:focus-within:after,:host([design="Emphasized"][active]:not([non-interactive])) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-1-1_button_emphasized_focused_active_border_color)}:host([design="Transparent"]){background-color:var(--sapButton_Lite_Background);color:var(--sapButton_Lite_TextColor);border-color:var(--sapButton_Lite_BorderColor)}:host([design="Transparent"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Transparent"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Lite_Hover_Background);border-color:var(--sapButton_Lite_Hover_BorderColor);color:var(--sapButton_Lite_Hover_TextColor)}:host([ui5-button][design="Transparent"][active]:not([non-interactive])){background-color:var(--sapButton_Lite_Active_Background);border-color:var(--sapButton_Lite_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([ui5-segmented-button-item][active][desktop]) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item][active]) .ui5-button-root:focus-visible:after,:host([pressed][desktop]) .ui5-button-root:focus-within:after,:host([pressed]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-1-1_button_pressed_focused_border_color);outline:none}:host([ui5-segmented-button-item][desktop]:not(:last-child)) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item]:not(:last-child)) .ui5-button-root:focus-visible:after{border-top-right-radius:var(--_ui5-v2-1-1_button_focused_inner_border_radius);border-bottom-right-radius:var(--_ui5-v2-1-1_button_focused_inner_border_radius)}:host([ui5-segmented-button-item][desktop]:not(:first-child)) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item]:not(:first-child)) .ui5-button-root:focus-visible:after{border-top-left-radius:var(--_ui5-v2-1-1_button_focused_inner_border_radius);border-bottom-left-radius:var(--_ui5-v2-1-1_button_focused_inner_border_radius)}
` };

    var __decorate$1 = this && this.__decorate || (function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return (c > 3 && r && Object.defineProperty(target, key, r), r);
    });
    var Button_1;
    let isGlobalHandlerAttached = false;
    let activeButton = null;
    let Button = Button_1 = class Button extends UI5Element {
      constructor() {
        super();
        this.design = "Default";
        this.disabled = false;
        this.submits = false;
        this.accessibilityAttributes = {};
        this.type = "Button";
        this.accessibleRole = "Button";
        this.active = false;
        this.iconOnly = false;
        this.hasIcon = false;
        this.hasEndIcon = false;
        this.nonInteractive = false;
        this._iconSettings = {};
        this.forcedTabIndex = "0";
        this._isTouch = false;
        this._cancelAction = false;
        this._deactivate = () => {
          if (activeButton) {
            activeButton._setActiveState(false);
          }
        };
        if (!isGlobalHandlerAttached) {
          document.addEventListener("mouseup", this._deactivate);
          isGlobalHandlerAttached = true;
        }
        const handleTouchStartEvent = e => {
          markEvent(e, "button");
          if (this.nonInteractive) {
            return;
          }
          this._setActiveState(true);
        };
        this._ontouchstart = {
          handleEvent: handleTouchStartEvent,
          passive: true
        };
      }
      onEnterDOM() {
        if (isDesktop()) {
          this.setAttribute("desktop", "");
        }
      }
      async onBeforeRendering() {
        this.hasIcon = !!this.icon;
        this.hasEndIcon = !!this.endIcon;
        this.iconOnly = this.isIconOnly;
        this.buttonTitle = this.tooltip || await getIconAccessibleName(this.icon);
      }
      _onclick(e) {
        if (this.nonInteractive) {
          return;
        }
        markEvent(e, "button");
        if (this._isSubmit) {
          submitForm(this);
        }
        if (this._isReset) {
          resetForm(this);
        }
        if (isSafari()) {
          this.getDomRef()?.focus();
        }
      }
      _onmousedown(e) {
        if (this.nonInteractive) {
          return;
        }
        markEvent(e, "button");
        this._setActiveState(true);
        activeButton = this;
      }
      _ontouchend(e) {
        if (this.disabled) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (this.active) {
          this._setActiveState(false);
        }
        if (activeButton) {
          activeButton._setActiveState(false);
        }
      }
      _onmouseup(e) {
        markEvent(e, "button");
      }
      _onkeydown(e) {
        this._cancelAction = isShift(e) || isEscape(e);
        markEvent(e, "button");
        if (isSpace(e) || isEnter(e)) {
          this._setActiveState(true);
        } else if (this._cancelAction) {
          this._setActiveState(false);
        }
      }
      _onkeyup(e) {
        if (this._cancelAction) {
          e.preventDefault();
        }
        if (isSpace(e)) {
          markEvent(e, "button");
        }
        if (isSpace(e) || isEnter(e)) {
          if (this.active) {
            this._setActiveState(false);
          }
        }
      }
      _onfocusout() {
        if (this.nonInteractive) {
          return;
        }
        if (this.active) {
          this._setActiveState(false);
        }
      }
      _onfocusin(e) {
        if (this.nonInteractive) {
          return;
        }
        markEvent(e, "button");
      }
      _setActiveState(active) {
        const eventPrevented = !this.fireEvent("_active-state-change", null, true);
        if (eventPrevented) {
          return;
        }
        this.active = active;
      }
      get _hasPopup() {
        return this.accessibilityAttributes.hasPopup;
      }
      get hasButtonType() {
        return this.design !== ButtonDesign$1.Default && this.design !== ButtonDesign$1.Transparent;
      }
      get iconMode() {
        if (!this.icon) {
          return "";
        }
        return IconMode$1.Decorative;
      }
      get endIconMode() {
        if (!this.endIcon) {
          return "";
        }
        return IconMode$1.Decorative;
      }
      get isIconOnly() {
        return !willShowContent(this.text);
      }
      static typeTextMappings() {
        return {
          "Positive": BUTTON_ARIA_TYPE_ACCEPT,
          "Negative": BUTTON_ARIA_TYPE_REJECT,
          "Emphasized": BUTTON_ARIA_TYPE_EMPHASIZED
        };
      }
      get buttonTypeText() {
        return Button_1.i18nBundle.getText(Button_1.typeTextMappings()[this.design]);
      }
      get effectiveAccRole() {
        return this.accessibleRole.toLowerCase();
      }
      get tabIndexValue() {
        if (this.disabled) {
          return;
        }
        const tabindex = this.getAttribute("tabindex");
        if (tabindex) {
          return tabindex;
        }
        return this.nonInteractive ? "-1" : this.forcedTabIndex;
      }
      get showIconTooltip() {
        return this.iconOnly && !this.tooltip;
      }
      get ariaLabelText() {
        return getEffectiveAriaLabelText(this);
      }
      get ariaDescribedbyText() {
        return this.hasButtonType ? "ui5-button-hiddenText-type" : undefined;
      }
      get _isSubmit() {
        return this.type === ButtonType$1.Submit || this.submits;
      }
      get _isReset() {
        return this.type === ButtonType$1.Reset;
      }
      static async onDefine() {
        Button_1.i18nBundle = await getI18nBundle("@ui5/webcomponents");
      }
    };
    __decorate$1([property()], Button.prototype, "design", void 0);
    __decorate$1([property({
      type: Boolean
    })], Button.prototype, "disabled", void 0);
    __decorate$1([property()], Button.prototype, "icon", void 0);
    __decorate$1([property()], Button.prototype, "endIcon", void 0);
    __decorate$1([property({
      type: Boolean
    })], Button.prototype, "submits", void 0);
    __decorate$1([property()], Button.prototype, "tooltip", void 0);
    __decorate$1([property()], Button.prototype, "accessibleName", void 0);
    __decorate$1([property()], Button.prototype, "accessibleNameRef", void 0);
    __decorate$1([property({
      type: Object
    })], Button.prototype, "accessibilityAttributes", void 0);
    __decorate$1([property()], Button.prototype, "type", void 0);
    __decorate$1([property()], Button.prototype, "accessibleRole", void 0);
    __decorate$1([property({
      type: Boolean
    })], Button.prototype, "active", void 0);
    __decorate$1([property({
      type: Boolean
    })], Button.prototype, "iconOnly", void 0);
    __decorate$1([property({
      type: Boolean
    })], Button.prototype, "hasIcon", void 0);
    __decorate$1([property({
      type: Boolean
    })], Button.prototype, "hasEndIcon", void 0);
    __decorate$1([property({
      type: Boolean
    })], Button.prototype, "nonInteractive", void 0);
    __decorate$1([property({
      noAttribute: true
    })], Button.prototype, "buttonTitle", void 0);
    __decorate$1([property({
      type: Object
    })], Button.prototype, "_iconSettings", void 0);
    __decorate$1([property({
      noAttribute: true
    })], Button.prototype, "forcedTabIndex", void 0);
    __decorate$1([property({
      type: Boolean
    })], Button.prototype, "_isTouch", void 0);
    __decorate$1([property({
      type: Boolean,
      noAttribute: true
    })], Button.prototype, "_cancelAction", void 0);
    __decorate$1([slot({
      type: Node,
      "default": true
    })], Button.prototype, "text", void 0);
    Button = Button_1 = __decorate$1([customElement({
      tag: "ui5-button",
      formAssociated: true,
      languageAware: true,
      renderer: litRender,
      template: block0$2,
      styles: styleData$1,
      dependencies: [Icon$1],
      shadowRootOptions: {
        delegatesFocus: true
      }
    }), event("click"), event("_active-state-change")], Button);
    Button.define();
    var Button$1 = Button;

    /* eslint no-unused-vars: 0 */
    function block0(context, tags, suffix) { return effectiveHtml `<div class="ui5-panel-root" role="${l(this.accRole)}" aria-label="${l(this.effectiveAccessibleName)}" aria-labelledby="${l(this.fixedPanelAriaLabelledbyReference)}">${this.hasHeaderOrHeaderText ? block1.call(this, context, tags, suffix) : undefined}<div class="ui5-panel-content" id="${l(this._id)}-content" tabindex="-1" style="${styleMap(this.styles.content)}" part="content"><slot></slot></div></div>`; }
    function block1(context, tags, suffix) { return effectiveHtml `<div class="ui5-panel-heading-wrapper${o(this.classes.stickyHeaderClass)}" role="${l(this.headingWrapperRole)}" aria-level="${l(this.headingWrapperAriaLevel)}"><div @click="${this._headerClick}" @keydown="${this._headerKeyDown}" @keyup="${this._headerKeyUp}" class="ui5-panel-header" tabindex="${l(this.headerTabIndex)}" role="${l(this.accInfo.role)}" aria-expanded="${l(this.accInfo.ariaExpanded)}" aria-controls="${l(this.accInfo.ariaControls)}" aria-labelledby="${l(this.accInfo.ariaLabelledby)}" part="header">${!this.fixed ? block2.call(this, context, tags, suffix) : undefined}${this._hasHeader ? block5.call(this, context, tags, suffix) : block6.call(this, context, tags, suffix)}</div></div>`; }
    function block2(context, tags, suffix) { return effectiveHtml `<div class="ui5-panel-header-button-root">${this._hasHeader ? block3.call(this, context, tags, suffix) : block4.call(this, context, tags, suffix)}</div>`; }
    function block3(context, tags, suffix) { return suffix ? effectiveHtml `<${scopeTag("ui5-button", tags, suffix)} design="Transparent" class="ui5-panel-header-button ui5-panel-header-button-with-icon" @click="${this._toggleButtonClick}" .accessibilityAttributes=${l(this.accInfo.button.accessibilityAttributes)} tooltip="${l(this.accInfo.button.title)}" accessible-name="${l(this.accInfo.button.ariaLabelButton)}"><div class="ui5-panel-header-icon-wrapper"><${scopeTag("ui5-icon", tags, suffix)} class="ui5-panel-header-icon ${o(this.classes.headerBtn)}" name="slim-arrow-right"></${scopeTag("ui5-icon", tags, suffix)}></div></${scopeTag("ui5-button", tags, suffix)}>` : effectiveHtml `<ui5-button design="Transparent" class="ui5-panel-header-button ui5-panel-header-button-with-icon" @click="${this._toggleButtonClick}" .accessibilityAttributes=${l(this.accInfo.button.accessibilityAttributes)} tooltip="${l(this.accInfo.button.title)}" accessible-name="${l(this.accInfo.button.ariaLabelButton)}"><div class="ui5-panel-header-icon-wrapper"><ui5-icon class="ui5-panel-header-icon ${o(this.classes.headerBtn)}" name="slim-arrow-right"></ui5-icon></div></ui5-button>`; }
    function block4(context, tags, suffix) { return suffix ? effectiveHtml `<${scopeTag("ui5-icon", tags, suffix)} class="ui5-panel-header-button ui5-panel-header-icon ${o(this.classes.headerBtn)}" name="slim-arrow-right" show-tooltip accessible-name="${l(this.toggleButtonTitle)}"></${scopeTag("ui5-icon", tags, suffix)}>` : effectiveHtml `<ui5-icon class="ui5-panel-header-button ui5-panel-header-icon ${o(this.classes.headerBtn)}" name="slim-arrow-right" show-tooltip accessible-name="${l(this.toggleButtonTitle)}"></ui5-icon>`; }
    function block5(context, tags, suffix) { return effectiveHtml `<slot name="header"></slot>`; }
    function block6(context, tags, suffix) { return effectiveHtml `<div id="${l(this._id)}-header-title" class="ui5-panel-header-title">${l(this.headerText)}</div>`; }

    registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_horizon", async () => styleData$4);
    registerThemePropertiesLoader("@ui5/webcomponents", "sap_horizon", async () => styleData$3);
    const styleData = { packageName: "@ui5/webcomponents", fileName: "themes/Panel.css.ts", content: `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:block}:host{font-family:"72override",var(--sapFontFamily);background-color:var(--sapGroup_TitleBackground);border-radius:var(--_ui5-v2-1-1_panel_border_radius)}:host(:not([collapsed])){border-bottom:var(--_ui5-v2-1-1_panel_border_bottom)}:host([fixed]) .ui5-panel-header{padding-left:1rem}.ui5-panel-header{min-height:var(--_ui5-v2-1-1_panel_header_height);width:100%;position:relative;display:flex;justify-content:flex-start;align-items:center;outline:none;box-sizing:border-box;padding-right:var(--_ui5-v2-1-1_panel_header_padding_right);font-family:"72override",var(--sapFontHeaderFamily);font-size:var(--sapGroup_Title_FontSize);font-weight:400;color:var(--sapGroup_TitleTextColor)}.ui5-panel-header-icon{color:var(--_ui5-v2-1-1_panel_icon_color)}.ui5-panel-header-button-animated{transition:transform .4s ease-out}:host(:not([_has-header]):not([fixed])) .ui5-panel-header{cursor:pointer}:host(:not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{content:"";position:absolute;pointer-events:none;z-index:2;border:var(--_ui5-v2-1-1_panel_focus_border);border-radius:var(--_ui5-v2-1-1_panel_border_radius);top:var(--_ui5-v2-1-1_panel_focus_offset);bottom:var(--_ui5-v2-1-1_panel_focus_bottom_offset);left:var(--_ui5-v2-1-1_panel_focus_offset);right:var(--_ui5-v2-1-1_panel_focus_offset)}:host(:not([collapsed]):not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{border-radius:var(--_ui5-v2-1-1_panel_border_radius_expanded)}:host(:not([collapsed])) .ui5-panel-header-button:not(.ui5-panel-header-button-with-icon),:host(:not([collapsed])) .ui5-panel-header-icon-wrapper [ui5-icon]{transform:var(--_ui5-v2-1-1_panel_toggle_btn_rotation)}:host([fixed]) .ui5-panel-header-title{width:100%}.ui5-panel-heading-wrapper.ui5-panel-heading-wrapper-sticky{position:sticky;top:0;background-color:var(--_ui5-v2-1-1_panel_header_background_color);z-index:100;border-radius:var(--_ui5-v2-1-1_panel_border_radius)}.ui5-panel-header-title{width:calc(100% - var(--_ui5-v2-1-1_panel_button_root_width));overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ui5-panel-content{padding:var(--_ui5-v2-1-1_panel_content_padding);background-color:var(--sapGroup_ContentBackground);outline:none;border-bottom-left-radius:var(--_ui5-v2-1-1_panel_border_radius);border-bottom-right-radius:var(--_ui5-v2-1-1_panel_border_radius);overflow:auto}.ui5-panel-header-button-root{display:flex;justify-content:center;align-items:center;flex-shrink:0;width:var(--_ui5-v2-1-1_panel_button_root_width);height:var(--_ui5-v2-1-1_panel_button_root_height);padding:var(--_ui5-v2-1-1_panel_header_button_wrapper_padding);box-sizing:border-box}:host([fixed]:not([collapsed]):not([_has-header])) .ui5-panel-header,:host([collapsed]) .ui5-panel-header{border-bottom:.0625rem solid var(--sapGroup_TitleBorderColor)}:host([collapsed]) .ui5-panel-header{border-bottom-left-radius:var(--_ui5-v2-1-1_panel_border_radius);border-bottom-right-radius:var(--_ui5-v2-1-1_panel_border_radius)}:host(:not([fixed]):not([collapsed])) .ui5-panel-header{border-bottom:var(--_ui5-v2-1-1_panel_default_header_border)}[ui5-button].ui5-panel-header-button{display:flex;justify-content:center;align-items:center;min-width:initial;height:100%;width:100%}.ui5-panel-header-icon-wrapper{display:flex;justify-content:center;align-items:center}.ui5-panel-header-icon-wrapper,.ui5-panel-header-icon-wrapper .ui5-panel-header-icon{color:inherit}.ui5-panel-header-icon-wrapper,[ui5-button].ui5-panel-header-button-with-icon [ui5-icon]{pointer-events:none}.ui5-panel-root{height:100%;display:flex;flex-direction:column}
` };

    var __decorate = this && this.__decorate || (function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return (c > 3 && r && Object.defineProperty(target, key, r), r);
    });
    var Panel_1;
    let Panel = Panel_1 = class Panel extends UI5Element {
      constructor() {
        super(...arguments);
        this.fixed = false;
        this.collapsed = false;
        this.noAnimation = false;
        this.accessibleRole = "Form";
        this.headerLevel = "H2";
        this.stickyHeader = false;
        this.useAccessibleNameForToggleButton = false;
        this._hasHeader = false;
        this._contentExpanded = false;
        this._animationRunning = false;
      }
      onBeforeRendering() {
        if (!this._animationRunning) {
          this._contentExpanded = !this.collapsed;
        }
        this._hasHeader = !!this.header.length;
      }
      shouldToggle(element) {
        const customContent = this.header.length;
        if (customContent) {
          return element.classList.contains("ui5-panel-header-button");
        }
        return true;
      }
      shouldNotAnimate() {
        return this.noAnimation || getAnimationMode() === AnimationMode$1.None;
      }
      _headerClick(e) {
        if (!this.shouldToggle(e.target)) {
          return;
        }
        this._toggleOpen();
      }
      _toggleButtonClick(e) {
        if (e.x === 0 && e.y === 0) {
          e.stopImmediatePropagation();
        }
      }
      _headerKeyDown(e) {
        if (!this.shouldToggle(e.target)) {
          return;
        }
        if (isEnter(e)) {
          e.preventDefault();
        }
        if (isSpace(e)) {
          e.preventDefault();
        }
      }
      _headerKeyUp(e) {
        if (!this.shouldToggle(e.target)) {
          return;
        }
        if (isEnter(e)) {
          this._toggleOpen();
        }
        if (isSpace(e)) {
          this._toggleOpen();
        }
      }
      _toggleOpen() {
        if (this.fixed) {
          return;
        }
        this.collapsed = !this.collapsed;
        if (this.shouldNotAnimate()) {
          this.fireEvent("toggle");
          return;
        }
        this._animationRunning = true;
        const elements = this.getDomRef().querySelectorAll(".ui5-panel-content");
        const animations = [];
        [].forEach.call(elements, oElement => {
          if (this.collapsed) {
            animations.push(slideUp(oElement).promise());
          } else {
            animations.push(slideDown(oElement).promise());
          }
        });
        Promise.all(animations).then(() => {
          this._animationRunning = false;
          this._contentExpanded = !this.collapsed;
          this.fireEvent("toggle");
        });
      }
      _headerOnTarget(target) {
        return target.classList.contains("sapMPanelWrappingDiv");
      }
      get classes() {
        return {
          headerBtn: {
            "ui5-panel-header-button-animated": !this.shouldNotAnimate()
          },
          stickyHeaderClass: {
            "ui5-panel-heading-wrapper-sticky": this.stickyHeader
          }
        };
      }
      get toggleButtonTitle() {
        return Panel_1.i18nBundle.getText(PANEL_ICON);
      }
      get expanded() {
        return !this.collapsed;
      }
      get accRole() {
        return this.accessibleRole.toLowerCase();
      }
      get effectiveAccessibleName() {
        return typeof this.accessibleName === "string" && this.accessibleName.length ? this.accessibleName : undefined;
      }
      get accInfo() {
        return {
          "button": {
            "accessibilityAttributes": {
              "expanded": this.expanded
            },
            "title": this.toggleButtonTitle,
            "ariaLabelButton": !this.nonFocusableButton && this.useAccessibleNameForToggleButton ? this.effectiveAccessibleName : undefined
          },
          "ariaExpanded": this.nonFixedInternalHeader ? this.expanded : undefined,
          "ariaControls": this.nonFixedInternalHeader ? `${this._id}-content` : undefined,
          "ariaLabelledby": this.nonFocusableButton ? this.ariaLabelledbyReference : undefined,
          "role": this.nonFixedInternalHeader ? "button" : undefined
        };
      }
      get ariaLabelledbyReference() {
        return this.nonFocusableButton && this.headerText && !this.fixed ? `${this._id}-header-title` : undefined;
      }
      get fixedPanelAriaLabelledbyReference() {
        return this.fixed && !this.effectiveAccessibleName ? `${this._id}-header-title` : undefined;
      }
      get headerAriaLevel() {
        return this.headerLevel.slice(1);
      }
      get headerTabIndex() {
        return this.header.length || this.fixed ? "-1" : "0";
      }
      get headingWrapperAriaLevel() {
        return !this._hasHeader ? this.headerAriaLevel : undefined;
      }
      get headingWrapperRole() {
        return !this._hasHeader ? "heading" : undefined;
      }
      get nonFixedInternalHeader() {
        return !this._hasHeader && !this.fixed;
      }
      get hasHeaderOrHeaderText() {
        return this._hasHeader || this.headerText;
      }
      get nonFocusableButton() {
        return !this.header.length;
      }
      get styles() {
        return {
          content: {
            display: this._contentExpanded ? "block" : "none"
          }
        };
      }
      static async onDefine() {
        Panel_1.i18nBundle = await getI18nBundle("@ui5/webcomponents");
      }
    };
    __decorate([property()], Panel.prototype, "headerText", void 0);
    __decorate([property({
      type: Boolean
    })], Panel.prototype, "fixed", void 0);
    __decorate([property({
      type: Boolean
    })], Panel.prototype, "collapsed", void 0);
    __decorate([property({
      type: Boolean
    })], Panel.prototype, "noAnimation", void 0);
    __decorate([property()], Panel.prototype, "accessibleRole", void 0);
    __decorate([property()], Panel.prototype, "headerLevel", void 0);
    __decorate([property()], Panel.prototype, "accessibleName", void 0);
    __decorate([property({
      type: Boolean
    })], Panel.prototype, "stickyHeader", void 0);
    __decorate([property({
      type: Boolean
    })], Panel.prototype, "useAccessibleNameForToggleButton", void 0);
    __decorate([property({
      type: Boolean
    })], Panel.prototype, "_hasHeader", void 0);
    __decorate([property({
      type: Boolean,
      noAttribute: true
    })], Panel.prototype, "_contentExpanded", void 0);
    __decorate([property({
      type: Boolean,
      noAttribute: true
    })], Panel.prototype, "_animationRunning", void 0);
    __decorate([slot()], Panel.prototype, "header", void 0);
    Panel = Panel_1 = __decorate([customElement({
      tag: "ui5-panel",
      fastNavigation: true,
      languageAware: true,
      renderer: litRender,
      template: block0,
      styles: styleData,
      dependencies: [Button$1, Icon$1]
    }), event("toggle")], Panel);
    Panel.define();
    var defaultExport = Panel;

    try { Object.defineProperty(defaultExport, "__" + "esModule", { value: true }); defaultExport.default = defaultExport; } catch (ex) {}

    return defaultExport;

}));
