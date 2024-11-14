sap.ui.define(['ui5/ecosystem/demo/app/resources/webcomponents-base', 'ui5/ecosystem/demo/app/resources/@ui5/webcomponents', 'sap/ui/core/webc/WebComponent', 'sap/base/strings/hyphenate', 'sap/ui/base/DataType'], (function (_ui5_webcomponentsBase, _ui5_webcomponents, WebComponent, hyphenate, DataType) { 'use strict';

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

    let curAnimationMode;
    _ui5_webcomponentsBase.attachConfigurationReset(() => {
        curAnimationMode = undefined;
    });
    /**
     * Returns the animation mode - "full", "basic", "minimal" or "none".
     * @public
     * @returns { AnimationMode }
     */
    const getAnimationMode = () => {
        if (curAnimationMode === undefined) {
            curAnimationMode = _ui5_webcomponentsBase.getAnimationMode();
        }
        return curAnimationMode;
    };

    /**
     * Different calendar types.
     *
     * @public
     */
    var CalendarType;
    (function (CalendarType) {
        /**
         * @public
         */
        CalendarType["Gregorian"] = "Gregorian";
        /**
         * @public
         */
        CalendarType["Islamic"] = "Islamic";
        /**
         * @public
         */
        CalendarType["Japanese"] = "Japanese";
        /**
         * @public
         */
        CalendarType["Buddhist"] = "Buddhist";
        /**
         * @public
         */
        CalendarType["Persian"] = "Persian";
    })(CalendarType || (CalendarType = {}));

    _ui5_webcomponentsBase.attachConfigurationReset(() => {
    });

    let formatSettings;
    class LegacyDateFormats {
        /**
         * Returns the currently set customizing data for Islamic calendar support
         *
         * @return {object[]} Returns an array that contains the customizing data.
         * @public
         */
        static getLegacyDateCalendarCustomizing() {
            if (formatSettings === undefined) {
                formatSettings = _ui5_webcomponentsBase.getFormatSettings();
            }
            return formatSettings.legacyDateCalendarCustomizing || [];
        }
    }
    _ui5_webcomponentsBase.registerFeature("LegacyDateFormats", LegacyDateFormats);

    _ui5_webcomponentsBase.attachConfigurationReset(() => {
    });
    const legacyDateFormats = _ui5_webcomponentsBase.getFeature("LegacyDateFormats");
    legacyDateFormats ? LegacyDateFormats.getLegacyDateCalendarCustomizing : () => { return []; };

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
        const themeFamily = _ui5_webcomponentsBase.isLegacyThemeFamily() ? "legacy" : "sap_horizon";
        return iconCollections.has(collectionName) ? iconCollections.get(collectionName)[themeFamily] : collectionName;
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
        const defaultIconCollection = getDefaultIconCollection(_ui5_webcomponentsBase.getTheme());
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

    const eventProvider = new _ui5_webcomponentsBase.EventProvider();
    const LANG_CHANGE = "languageChange";
    const attachLanguageChange = (listener) => {
        eventProvider.attachEvent(LANG_CHANGE, listener);
    };

    let curLanguage;
    let fetchDefaultLanguage;
    _ui5_webcomponentsBase.attachConfigurationReset(() => {
        curLanguage = undefined;
        fetchDefaultLanguage = undefined;
    });
    /**
     * Returns the currently configured language, or the browser language as a fallback.
     * @public
     * @returns {string}
     */
    const getLanguage = () => {
        if (curLanguage === undefined) {
            curLanguage = _ui5_webcomponentsBase.getLanguage();
        }
        return curLanguage;
    };
    /**
     * Returns if the default language, that is inlined, should be fetched over the network.
     * @public
     * @returns {boolean}
     */
    const getFetchDefaultLanguage = () => {
        if (fetchDefaultLanguage === undefined) {
            fetchDefaultLanguage = _ui5_webcomponentsBase.getFetchDefaultLanguage();
        }
        return fetchDefaultLanguage;
    };

    // Fire these events even with noConflict: true
    const excludeList = [
        "value-changed",
        "click",
    ];
    let noConflict;
    _ui5_webcomponentsBase.attachConfigurationReset(() => {
        noConflict = undefined;
    });
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
            noConflict = _ui5_webcomponentsBase.getNoConflict();
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
            const { tag, languageAware, themeAware, cldr, fastNavigation, formAssociated, shadowRootOptions, features, } = tagNameOrComponentSettings;
            target.metadata.tag = tag;
            if (languageAware) {
                target.metadata.languageAware = languageAware;
            }
            if (cldr) {
                target.metadata.cldr = cldr;
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

    /**
     * Different navigation modes for ItemNavigation.
     *
     * @public
     */
    var NavigationMode;
    (function (NavigationMode) {
        /**
         * @public
         */
        NavigationMode["Auto"] = "Auto";
        /**
         * @public
         */
        NavigationMode["Vertical"] = "Vertical";
        /**
         * @public
         */
        NavigationMode["Horizontal"] = "Horizontal";
        /**
         * @public
         */
        NavigationMode["Paging"] = "Paging";
    })(NavigationMode || (NavigationMode = {}));

    /**
     * Different behavior for ItemNavigation.
     *
     * @public
     */
    var ItemNavigationBehavior;
    (function (ItemNavigationBehavior) {
        /**
         * Static behavior: navigations stops at the first or last item.
         * @public
         */
        ItemNavigationBehavior["Static"] = "Static";
        /**
         * Cycling behavior: navigating past the last item continues with the first and vice versa.
         * @public
         */
        ItemNavigationBehavior["Cyclic"] = "Cyclic";
    })(ItemNavigationBehavior || (ItemNavigationBehavior = {}));

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
            const suffix = _ui5_webcomponentsBase.getEffectiveScopingSuffixForTag(pureTag);
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
        /**
         * Determines whether this UI5 Element needs CLDR assets to be fetched to work correctly
         */
        needsCLDR() {
            return !!this.metadata.cldr;
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
        getI18n() {
            if (!this.metadata.i18n) {
                this.metadata.i18n = {};
            }
            return this.metadata.i18n;
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

    const getEventProvider = () => _ui5_webcomponentsBase.getSharedResource("CustomStyle.eventProvider", new _ui5_webcomponentsBase.EventProvider());
    const CUSTOM_CSS_CHANGE = "CustomCSSChange";
    const attachCustomCSSChange = (listener) => {
        getEventProvider().attachEvent(CUSTOM_CSS_CHANGE, listener);
    };
    const getCustomCSSFor = () => _ui5_webcomponentsBase.getSharedResource("CustomStyle.customCSSFor", {});
    attachCustomCSSChange((tag) => {
        {
            _ui5_webcomponentsBase.reRenderAllUI5Elements({ tag });
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
        const openUI5Enablement = _ui5_webcomponentsBase.getFeature("OpenUI5Enablement");
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
        const scope = _ui5_webcomponentsBase.getCustomElementsScopingSuffix();
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
        const tagsToScope = ctor.getUniqueDependencies().map((dep) => dep.getMetadata().getPureTag()).filter(_ui5_webcomponentsBase.shouldScopeCustomElement);
        if (_ui5_webcomponentsBase.shouldScopeCustomElement(componentTag)) {
            tagsToScope.push(componentTag);
        }
        return tagsToScope;
    };

    const updateFormValue = (element) => {
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

    const isSSR = typeof document === "undefined";
    const detectNavigatorLanguage = () => {
        if (isSSR) {
            return _ui5_webcomponentsBase.DEFAULT_LANGUAGE;
        }
        const browserLanguages = navigator.languages;
        const navigatorLanguage = () => {
            return navigator.language;
        };
        const rawLocale = (browserLanguages && browserLanguages[0]) || navigatorLanguage();
        return rawLocale || _ui5_webcomponentsBase.DEFAULT_LANGUAGE;
    };

    const rLocale = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;
    class Locale {
        constructor(sLocaleId) {
            const aResult = rLocale.exec(sLocaleId.replace(/_/g, "-"));
            if (aResult === null) {
                throw new Error(`The given language ${sLocaleId} does not adhere to BCP-47.`);
            }
            this.sLocaleId = sLocaleId;
            this.sLanguage = aResult[1] || _ui5_webcomponentsBase.DEFAULT_LANGUAGE;
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
        return new Locale(_ui5_webcomponentsBase.DEFAULT_LOCALE);
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
            return _ui5_webcomponentsBase.DEFAULT_LOCALE;
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
        return _ui5_webcomponentsBase.DEFAULT_LOCALE;
    };

    /**
     * Calculates the next fallback locale for the given locale.
     *
     * @param {string} locale Locale string in Java format (underscores) or null
     * @returns {string} Next fallback Locale or "en" if no fallbacks found.
     */
    const nextFallbackLocale = (locale) => {
        if (!locale) {
            return _ui5_webcomponentsBase.DEFAULT_LOCALE;
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
        return locale !== _ui5_webcomponentsBase.DEFAULT_LOCALE ? _ui5_webcomponentsBase.DEFAULT_LOCALE : "";
    };

    // contains package names for which the warning has been shown
    const warningShown$1 = new Set();
    const reportedErrors$1 = new Set();
    const bundleData = new Map();
    const bundlePromises = new Map();
    const loaders$2 = new Map();
    const _setI18nBundleData = (packageName, data) => {
        bundleData.set(packageName, data);
    };
    const getI18nBundleData = (packageName) => {
        return bundleData.get(packageName);
    };
    const _hasLoader = (packageName, localeId) => {
        const bundleKey = `${packageName}/${localeId}`;
        return loaders$2.has(bundleKey);
    };
    // load bundle over the network once
    const _loadMessageBundleOnce = (packageName, localeId) => {
        const bundleKey = `${packageName}/${localeId}`;
        const loadMessageBundle = loaders$2.get(bundleKey);
        if (loadMessageBundle && !bundlePromises.get(bundleKey)) {
            bundlePromises.set(bundleKey, loadMessageBundle(localeId));
        }
        return bundlePromises.get(bundleKey); // Investigate if i18n loader exists and this won't return undefined.
    };
    const _showAssetsWarningOnce$1 = (packageName) => {
        if (!warningShown$1.has(packageName)) {
            console.warn(`[${packageName}]: Message bundle assets are not configured. Falling back to English texts.`, /* eslint-disable-line */ ` Add \`import "${packageName}/dist/Assets.js"\` in your bundle and make sure your build tool supports dynamic imports and JSON imports. See section "Assets" in the documentation for more information.`); /* eslint-disable-line */
            warningShown$1.add(packageName);
        }
    };
    const useFallbackBundle = (packageName, localeId) => {
        return localeId !== _ui5_webcomponentsBase.DEFAULT_LANGUAGE && !_hasLoader(packageName, localeId);
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
        if (localeId === _ui5_webcomponentsBase.DEFAULT_LANGUAGE && !fetchDefaultLanguage) {
            _setI18nBundleData(packageName, null); // reset for the default language (if data was set for a previous language)
            return;
        }
        if (!_hasLoader(packageName, localeId)) {
            _showAssetsWarningOnce$1(packageName);
            return;
        }
        try {
            const data = await _loadMessageBundleOnce(packageName, localeId);
            _setI18nBundleData(packageName, data);
        }
        catch (error) {
            const e = error;
            if (!reportedErrors$1.has(e.message)) {
                reportedErrors$1.add(e.message);
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

    const localeDataMap = new Map();
    const loaders$1 = new Map();
    const cldrPromises = new Map();
    const reportedErrors = new Set();
    let warningShown = false;
    const M_ISO639_OLD_TO_NEW = {
        "iw": "he",
        "ji": "yi",
        "in": "id",
    };
    const _showAssetsWarningOnce = (localeId) => {
        if (warningShown) {
            return;
        }
        console.warn(`[LocaleData] Supported locale "${localeId}" not configured, import the "Assets.js" module from the webcomponents package you are using.`); /* eslint-disable-line */
        warningShown = true;
    };
    const calcLocale = (language, region, script) => {
        // normalize language and handle special cases
        language = (language && M_ISO639_OLD_TO_NEW[language]) || language;
        // Special case 1: in an SAP context, the inclusive language code "no" always means Norwegian Bokmal ("nb")
        if (language === "no") {
            language = "nb";
        }
        // Special case 2: for Chinese, derive a default region from the script (this behavior is inherited from Java)
        if (language === "zh" && !region) {
            if (script === "Hans") {
                region = "CN";
            }
            else if (script === "Hant") {
                region = "TW";
            }
        }
        // Special case 3: for Serbian, there are cyrillic and latin scripts, "sh" and "sr-latn" map to "latin", "sr" maps to cyrillic.
        if (language === "sh" || (language === "sr" && script === "Latn")) {
            language = "sr";
            region = "Latn";
        }
        // try language + region
        let localeId = `${language}_${region}`;
        if (_ui5_webcomponentsBase.SUPPORTED_LOCALES.includes(localeId)) {
            if (loaders$1.has(localeId)) {
                // supported and has loader
                return localeId;
            }
            // supported, no loader - fallback to default and warn
            _showAssetsWarningOnce(localeId);
            return _ui5_webcomponentsBase.DEFAULT_LOCALE;
        }
        // not supported, try language only
        localeId = language;
        if (_ui5_webcomponentsBase.SUPPORTED_LOCALES.includes(localeId)) {
            if (loaders$1.has(localeId)) {
                // supported and has loader
                return localeId;
            }
            // supported, no loader - fallback to default and warn
            _showAssetsWarningOnce(localeId);
            return _ui5_webcomponentsBase.DEFAULT_LOCALE;
        }
        // not supported - fallback to default locale
        return _ui5_webcomponentsBase.DEFAULT_LOCALE;
    };
    // internal set data
    const setLocaleData = (localeId, content) => {
        localeDataMap.set(localeId, content);
    };
    // load bundle over the network once
    const _loadCldrOnce = (localeId) => {
        if (!cldrPromises.get(localeId)) {
            const loadCldr = loaders$1.get(localeId);
            if (!loadCldr) {
                throw new Error(`CLDR data for locale ${localeId} is not loaded!`);
            }
            cldrPromises.set(localeId, loadCldr(localeId));
        }
        return cldrPromises.get(localeId);
    };
    // external getAsync
    const fetchCldr = async (language, region, script) => {
        const localeId = calcLocale(language, region, script);
        // reuse OpenUI5 CLDR if present
        const openUI5Support = _ui5_webcomponentsBase.getFeature("OpenUI5Support");
        if (openUI5Support) {
            const cldrContent = openUI5Support.getLocaleDataObject();
            if (cldrContent) {
                // only if openui5 actually returned valid content
                setLocaleData(localeId, cldrContent);
                return;
            }
        }
        // fetch it
        try {
            const cldrContent = await _loadCldrOnce(localeId);
            setLocaleData(localeId, cldrContent);
        }
        catch (error) {
            const e = error;
            if (!reportedErrors.has(e.message)) {
                reportedErrors.add(e.message);
                console.error(e.message); /* eslint-disable-line */
            }
        }
    };
    const registerLocaleDataLoader = (localeId, loader) => {
        loaders$1.set(localeId, loader);
    };
    // register default loader for "en" from ui5 CDN (dev workflow without assets)
    registerLocaleDataLoader("en", async () => {
        const cldrContent = await fetch(`https://sdk.openui5.org/1.120.17/resources/sap/ui/core/cldr/en.json`);
        return cldrContent.json();
    });
    // When the language changes dynamically (the user calls setLanguage),
    // re-fetch the required CDRD data.
    attachLanguageChange(() => {
        const locale = getLocale();
        return fetchCldr(locale.getLanguage(), locale.getRegion(), locale.getScript());
    });

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
      _ui5_webcomponentsBase.renderDeferred(this);
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
        this._invalidationEventProvider = new _ui5_webcomponentsBase.EventProvider();
        this._componentStateFinalizedEventProvider = new _ui5_webcomponentsBase.EventProvider();
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
        this._internals = this.attachInternals();
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
        if (!ctor.asyncFinished) {
          await ctor.definePromise;
        }
        _ui5_webcomponentsBase.renderImmediately(this);
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
        _ui5_webcomponentsBase.cancelRender(this);
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
        updateFormValue(this);
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
          if (typeof newValue === "string" && propData.type && propData.type !== String) {
            console.error(`[UI5-FWK] string value for property [${name}] of component [${tag}] which has a non-string type [${propData.type}] in its property decorator. Attribute conversion will stop and keep the string value in the property.`);
          }
        }
        const newAttrValue = converter.toAttribute(newValue, propData.type);
        this._doNotSyncAttributes.add(attrName);
        if (newAttrValue === null || newAttrValue === undefined) {
          this.removeAttribute(attrName);
        } else {
          this.setAttribute(attrName, newAttrValue);
        }
        this._doNotSyncAttributes.delete(attrName);
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
        try {
          this.onBeforeRendering();
          if (!this._rendered) {
            this.updateAttributes();
          }
          this._componentStateFinalizedEventProvider.fireEvent("componentStateFinalized");
        } finally {
          this._suppressInvalidation = false;
        }
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
        _ui5_webcomponentsBase.markAsRtlAware(this.constructor);
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
      static async onDefine() {
        return Promise.resolve();
      }
      static fetchI18nBundles() {
        return Promise.all(Object.entries(this.getMetadata().getI18n()).map(pair => {
          const {bundleName} = pair[1];
          return getI18nBundle(bundleName);
        }));
      }
      static fetchCLDR() {
        if (this.getMetadata().needsCLDR()) {
          return fetchCldr(getLocale().getLanguage(), getLocale().getRegion(), getLocale().getScript());
        }
        return Promise.resolve();
      }
      static define() {
        this.definePromise = Promise.all([this.fetchI18nBundles(), this.fetchCLDR(), _ui5_webcomponentsBase.boot(), this.onDefine()]).then(result => {
          const [i18nBundles] = result;
          Object.entries(this.getMetadata().getI18n()).forEach((pair, index) => {
            const propertyName = pair[0];
            const targetClass = pair[1].target;
            targetClass[propertyName] = i18nBundles[index];
          });
          this.asyncFinished = true;
        });
        const tag = this.getMetadata().getTag();
        const features = this.getMetadata().getFeatures();
        features.forEach(feature => {
          if (_ui5_webcomponentsBase.getComponentFeature(feature)) {
            this.cacheUniqueDependencies();
          }
          _ui5_webcomponentsBase.subscribeForFeatureLoad(feature, this, this.cacheUniqueDependencies.bind(this));
        });
        const definedLocally = _ui5_webcomponentsBase.isTagRegistered(tag);
        const definedGlobally = customElements.get(tag);
        if (definedGlobally && !definedLocally) {
          _ui5_webcomponentsBase.recordTagRegistrationFailure(tag);
        } else if (!definedGlobally) {
          this._generateAccessors();
          _ui5_webcomponentsBase.registerTag(tag);
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
        const mergedMetadata = _ui5_webcomponentsBase.fnMerge({}, ...metadataObjects);
        this._metadata = new UI5ElementMetadata(mergedMetadata);
        return this._metadata;
      }
      get validity() {
        return this._internals.validity;
      }
      get validationMessage() {
        return this._internals.validationMessage;
      }
      checkValidity() {
        return this._internals.checkValidity();
      }
      reportValidity() {
        return this._internals.reportValidity();
      }
    }
    UI5Element.metadata = {};
    UI5Element.styles = "";
    const instanceOfUI5Element = object => {
      return ("isUI5Element" in object);
    };

    (function() {
    /* Copyright Google Inc.
     * Licensed under the Apache Licence Version 2.0
     * Autogenerated at Tue May 22 10:18:21 PDT 2012
     * \@overrides window
     * \@provides cssSchema, CSS_PROP_BIT_QUANTITY, CSS_PROP_BIT_HASH_VALUE, CSS_PROP_BIT_NEGATIVE_QUANTITY, CSS_PROP_BIT_QSTRING_CONTENT, CSS_PROP_BIT_QSTRING_URL, CSS_PROP_BIT_HISTORY_INSENSITIVE, CSS_PROP_BIT_Z_INDEX, CSS_PROP_BIT_ALLOWED_IN_LINK */
    /**
     * @const
     * @type {number}
     */
    var CSS_PROP_BIT_QUANTITY = 1;
    /**
     * @const
     * @type {number}
     */
    var CSS_PROP_BIT_HASH_VALUE = 2;
    /**
     * @const
     * @type {number}
     */
    var CSS_PROP_BIT_NEGATIVE_QUANTITY = 4;
    /**
     * @const
     * @type {number}
     */
    var CSS_PROP_BIT_QSTRING_CONTENT = 8;
    /**
     * @const
     * @type {number}
     */
    var CSS_PROP_BIT_QSTRING_URL = 16;
    /**
     * @const
     * @type {number}
     */
    var CSS_PROP_BIT_Z_INDEX = 64;
    /**
     * @const
     * @type {number}
     */
    var CSS_PROP_BIT_ALLOWED_IN_LINK = 128;
    var cssSchema = (function () {
        var s = [
          'rgb(?:\\(\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)|a\\(\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0(?:\\.\\d+)?|\\.\\d+|1(?:\\.0+)?|0|\\d+(?:\\.\\d+)?%)) *\\)'
        ], c = [ /^ *$/i, RegExp('^ *(?:\\s*' + s[ 0 ] + '|(?:\\s*' + s[ 0 ] +
            ')?)+ *$', 'i'), RegExp('^ *\\s*' + s[ 0 ] + ' *$', 'i'),
          RegExp('^ *\\s*' + s[ 0 ] + '\\s*' + s[ 0 ] + ' *$', 'i') ], L = [ [
            'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige',
            'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown',
            'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral',
            'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue',
            'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkkhaki',
            'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred',
            'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray',
            'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray',
            'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia',
            'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green',
            'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory',
            'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon',
            'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow',
            'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen',
            'lightskyblue', 'lightslategray', 'lightsteelblue', 'lightyellow',
            'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine',
            'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen',
            'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
            'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose',
            'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab',
            'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen',
            'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru',
            'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown',
            'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen',
            'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray',
            'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato',
            'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow',
            'yellowgreen' ], [ 'all-scroll', 'col-resize', 'crosshair', 'default',
            'e-resize', 'hand', 'help', 'move', 'n-resize', 'ne-resize', 'no-drop',
            'not-allowed', 'nw-resize', 'pointer', 'progress', 'row-resize',
            's-resize', 'se-resize', 'sw-resize', 'text', 'vertical-text',
            'w-resize', 'wait' ], [ '-moz-inline-box', '-moz-inline-stack',
            'block', 'inline', 'inline-block', 'inline-table', 'list-item',
            'run-in', 'table', 'table-caption', 'table-cell', 'table-column',
            'table-column-group', 'table-footer-group', 'table-header-group',
            'table-row', 'table-row-group' ], [ 'armenian', 'circle', 'decimal',
            'decimal-leading-zero', 'disc', 'georgian', 'lower-alpha',
            'lower-greek', 'lower-latin', 'lower-roman', 'square', 'upper-alpha',
            'upper-latin', 'upper-roman' ], [ '100', '200', '300', '400', '500',
            '600', '700', '800', '900', 'bold', 'bolder', 'lighter' ], [
            'condensed', 'expanded', 'extra-condensed', 'extra-expanded',
            'narrower', 'semi-condensed', 'semi-expanded', 'ultra-condensed',
            'ultra-expanded', 'wider' ], [ 'behind', 'center-left', 'center-right',
            'far-left', 'far-right', 'left-side', 'leftwards', 'right-side',
            'rightwards' ], [ 'large', 'larger', 'small', 'smaller', 'x-large',
            'x-small', 'xx-large', 'xx-small' ], [ '-moz-pre-wrap', '-o-pre-wrap',
            '-pre-wrap', 'nowrap', 'pre', 'pre-line', 'pre-wrap' ], [ 'dashed',
            'dotted', 'double', 'groove', 'outset', 'ridge', 'solid' ], [
            'baseline', 'middle', 'sub', 'super', 'text-bottom', 'text-top' ], [
            'caption', 'icon', 'menu', 'message-box', 'small-caption', 'status-bar'
          ], [ 'fast', 'faster', 'slow', 'slower', 'x-fast', 'x-slow' ], [ 'above',
            'below', 'higher', 'level', 'lower' ], [ 'border-box', 'contain',
            'content-box', 'cover', 'padding-box' ], [ 'cursive', 'fantasy',
            'monospace', 'sans-serif', 'serif' ], [ 'loud', 'silent', 'soft',
            'x-loud', 'x-soft' ], [ 'no-repeat', 'repeat-x', 'repeat-y', 'round',
            'space' ], [ 'blink', 'line-through', 'overline', 'underline' ], [
            'high', 'low', 'x-high', 'x-low' ], [ 'absolute', 'relative', 'static'
          ], [ 'capitalize', 'lowercase', 'uppercase' ], [ 'child', 'female',
            'male' ], [ 'bidi-override', 'embed' ], [ 'bottom', 'top' ], [ 'clip',
            'ellipsis' ], [ 'continuous', 'digits' ], [ 'hide', 'show' ], [
            'inside', 'outside' ], [ 'italic', 'oblique' ], [ 'left', 'right' ], [
            'ltr', 'rtl' ], [ 'no-content', 'no-display' ], [ 'suppress',
            'unrestricted' ], [ 'thick', 'thin' ], [ ',' ], [ '/' ], [ 'always' ],
          [ 'auto' ], [ 'avoid' ], [ 'both' ], [ 'break-word' ], [ 'center' ], [
            'code' ], [ 'collapse' ], [ 'fixed' ], [ 'hidden' ], [ 'inherit' ], [
            'inset' ], [ 'invert' ], [ 'justify' ], [ 'local' ], [ 'medium' ], [
            'mix' ], [ 'none' ], [ 'normal' ], [ 'once' ], [ 'repeat' ], [ 'scroll'
          ], [ 'separate' ], [ 'small-caps' ], [ 'spell-out' ], [ 'transparent' ],
          [ 'visible' ] ];
        return {
          '-moz-border-radius': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 36 ] ]
          },
          '-moz-border-radius-bottomleft': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          '-moz-border-radius-bottomright': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          '-moz-border-radius-topleft': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          '-moz-border-radius-topright': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          '-moz-box-shadow': {
            'cssExtra': c[ 1 ],
            'cssAlternates': [ 'boxShadow' ],
            'cssPropBits': 7,
            'cssLitGroup': [ L[ 0 ], L[ 35 ], L[ 48 ], L[ 54 ] ]
          },
          '-moz-opacity': {
            'cssPropBits': 1,
            'cssLitGroup': [ L[ 47 ] ]
          },
          '-moz-outline': {
            'cssExtra': c[ 3 ],
            'cssPropBits': 7,
            'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
                49 ], L[ 52 ], L[ 54 ] ]
          },
          '-moz-outline-color': {
            'cssExtra': c[ 2 ],
            'cssPropBits': 2,
            'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 49 ] ]
          },
          '-moz-outline-style': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
          },
          '-moz-outline-width': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
          },
          '-o-text-overflow': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 25 ] ]
          },
          '-webkit-border-bottom-left-radius': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          '-webkit-border-bottom-right-radius': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          '-webkit-border-radius': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 36 ] ]
          },
          '-webkit-border-radius-bottom-left': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          '-webkit-border-radius-bottom-right': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          '-webkit-border-radius-top-left': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          '-webkit-border-radius-top-right': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          '-webkit-border-top-left-radius': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          '-webkit-border-top-right-radius': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          '-webkit-box-shadow': {
            'cssExtra': c[ 1 ],
            'cssAlternates': [ 'boxShadow' ],
            'cssPropBits': 7,
            'cssLitGroup': [ L[ 0 ], L[ 35 ], L[ 48 ], L[ 54 ] ]
          },
          'azimuth': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 6 ], L[ 30 ], L[ 42 ], L[ 47 ] ]
          },
          'background': {
            'cssExtra': RegExp('^ *(?:\\s*' + s[ 0 ] + '){0,2} *$', 'i'),
            'cssPropBits': 23,
            'cssLitGroup': [ L[ 0 ], L[ 14 ], L[ 17 ], L[ 24 ], L[ 30 ], L[ 35 ],
              L[ 36 ], L[ 38 ], L[ 42 ], L[ 45 ], L[ 47 ], L[ 51 ], L[ 54 ], L[ 57
              ], L[ 58 ], L[ 62 ] ]
          },
          'background-attachment': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 35 ], L[ 45 ], L[ 51 ], L[ 58 ] ]
          },
          'background-color': {
            'cssExtra': c[ 2 ],
            'cssPropBits': 130,
            'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
          },
          'background-image': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 16,
            'cssLitGroup': [ L[ 35 ], L[ 54 ] ]
          },
          'background-position': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 24 ], L[ 30 ], L[ 35 ], L[ 42 ] ]
          },
          'background-repeat': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 17 ], L[ 35 ], L[ 57 ] ]
          },
          'border': {
            'cssExtra': c[ 3 ],
            'cssPropBits': 7,
            'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
                52 ], L[ 54 ], L[ 62 ] ]
          },
          'border-bottom': {
            'cssExtra': c[ 3 ],
            'cssPropBits': 7,
            'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
                52 ], L[ 54 ], L[ 62 ] ]
          },
          'border-bottom-color': {
            'cssExtra': c[ 2 ],
            'cssPropBits': 2,
            'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
          },
          'border-bottom-left-radius': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          'border-bottom-right-radius': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          'border-bottom-style': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
          },
          'border-bottom-width': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
          },
          'border-collapse': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 44 ], L[ 47 ], L[ 59 ] ]
          },
          'border-color': {
            'cssExtra': RegExp('^ *(?:\\s*' + s[ 0 ] + '){1,4} *$', 'i'),
            'cssPropBits': 2,
            'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
          },
          'border-left': {
            'cssExtra': c[ 3 ],
            'cssPropBits': 7,
            'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
                52 ], L[ 54 ], L[ 62 ] ]
          },
          'border-left-color': {
            'cssExtra': c[ 2 ],
            'cssPropBits': 2,
            'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
          },
          'border-left-style': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
          },
          'border-left-width': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
          },
          'border-radius': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 36 ] ]
          },
          'border-right': {
            'cssExtra': c[ 3 ],
            'cssPropBits': 7,
            'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
                52 ], L[ 54 ], L[ 62 ] ]
          },
          'border-right-color': {
            'cssExtra': c[ 2 ],
            'cssPropBits': 2,
            'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
          },
          'border-right-style': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
          },
          'border-right-width': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
          },
          'border-spacing': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 47 ] ]
          },
          'border-style': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
          },
          'border-top': {
            'cssExtra': c[ 3 ],
            'cssPropBits': 7,
            'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
                52 ], L[ 54 ], L[ 62 ] ]
          },
          'border-top-color': {
            'cssExtra': c[ 2 ],
            'cssPropBits': 2,
            'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
          },
          'border-top-left-radius': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          'border-top-right-radius': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5
          },
          'border-top-style': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
          },
          'border-top-width': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
          },
          'border-width': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
          },
          'bottom': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'box-shadow': {
            'cssExtra': c[ 1 ],
            'cssPropBits': 7,
            'cssLitGroup': [ L[ 0 ], L[ 35 ], L[ 48 ], L[ 54 ] ]
          },
          'caption-side': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 24 ], L[ 47 ] ]
          },
          'clear': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 30 ], L[ 40 ], L[ 47 ], L[ 54 ] ]
          },
          'clip': {
            'cssExtra':
            /^ *\s*rect\(\s*(?:0|[+\-]?\d+(?:\.\d+)?(?:[cem]m|ex|in|p[ctx])|auto)\s*,\s*(?:0|[+\-]?\d+(?:\.\d+)?(?:[cem]m|ex|in|p[ctx])|auto)\s*,\s*(?:0|[+\-]?\d+(?:\.\d+)?(?:[cem]m|ex|in|p[ctx])|auto)\s*,\s*(?:0|[+\-]?\d+(?:\.\d+)?(?:[cem]m|ex|in|p[ctx])|auto) *\) *$/i,
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'color': {
            'cssExtra': c[ 2 ],
            'cssPropBits': 130,
            'cssLitGroup': [ L[ 0 ], L[ 47 ] ]
          },
          'content': { 'cssPropBits': 0 },
          'counter-increment': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
          },
          'counter-reset': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
          },
          'cue': {
            'cssPropBits': 16,
            'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
          },
          'cue-after': {
            'cssPropBits': 16,
            'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
          },
          'cue-before': {
            'cssPropBits': 16,
            'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
          },
          'cursor': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 144,
            'cssLitGroup': [ L[ 1 ], L[ 35 ], L[ 38 ], L[ 47 ] ]
          },
          'direction': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 31 ], L[ 47 ] ]
          },
          'display': {
            'cssPropBits': 32,
            'cssLitGroup': [ L[ 2 ], L[ 47 ], L[ 54 ] ]
          },
          'elevation': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 13 ], L[ 47 ] ]
          },
          'empty-cells': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 27 ], L[ 47 ] ]
          },
          'filter': {
            'cssExtra':
            /^ *(?:\s*alpha\(\s*opacity\s*=\s*(?:0|\d+(?:\.\d+)?%|[+\-]?\d+(?:\.\d+)?) *\))+ *$/i,
            'cssPropBits': 32
          },
          'float': {
            'cssAlternates': [ 'cssFloat', 'styleFloat' ],
            'cssPropBits': 32,
            'cssLitGroup': [ L[ 30 ], L[ 47 ], L[ 54 ] ]
          },
          'font': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 9,
            'cssLitGroup': [ L[ 4 ], L[ 7 ], L[ 11 ], L[ 15 ], L[ 29 ], L[ 35 ], L[
                36 ], L[ 47 ], L[ 52 ], L[ 55 ], L[ 60 ] ]
          },
          'font-family': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 8,
            'cssLitGroup': [ L[ 15 ], L[ 35 ], L[ 47 ] ]
          },
          'font-size': {
            'cssPropBits': 1,
            'cssLitGroup': [ L[ 7 ], L[ 47 ], L[ 52 ] ]
          },
          'font-stretch': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 5 ], L[ 55 ] ]
          },
          'font-style': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 29 ], L[ 47 ], L[ 55 ] ]
          },
          'font-variant': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 47 ], L[ 55 ], L[ 60 ] ]
          },
          'font-weight': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 4 ], L[ 47 ], L[ 55 ] ],
            // ##### BEGIN: MODIFIED BY SAP
            'cssLitNumeric': true
            // ##### END: MODIFIED BY SAP
          },
          'height': {
            'cssPropBits': 37,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'left': {
            'cssPropBits': 37,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'letter-spacing': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 47 ], L[ 55 ] ]
          },
          'line-height': {
            'cssPropBits': 1,
            'cssLitGroup': [ L[ 47 ], L[ 55 ] ]
          },
          'list-style': {
            'cssPropBits': 16,
            'cssLitGroup': [ L[ 3 ], L[ 28 ], L[ 47 ], L[ 54 ] ]
          },
          'list-style-image': {
            'cssPropBits': 16,
            'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
          },
          'list-style-position': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 28 ], L[ 47 ] ]
          },
          'list-style-type': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 3 ], L[ 47 ], L[ 54 ] ]
          },
          'margin': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'margin-bottom': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'margin-left': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'margin-right': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'margin-top': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'max-height': {
            'cssPropBits': 1,
            'cssLitGroup': [ L[ 38 ], L[ 47 ], L[ 54 ] ]
          },
          'max-width': {
            'cssPropBits': 1,
            'cssLitGroup': [ L[ 38 ], L[ 47 ], L[ 54 ] ]
          },
          'min-height': {
            'cssPropBits': 1,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'min-width': {
            'cssPropBits': 1,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'opacity': {
            'cssPropBits': 33,
            'cssLitGroup': [ L[ 47 ] ]
          },
          'outline': {
            'cssExtra': c[ 3 ],
            'cssPropBits': 7,
            'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
                49 ], L[ 52 ], L[ 54 ] ]
          },
          'outline-color': {
            'cssExtra': c[ 2 ],
            'cssPropBits': 2,
            'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 49 ] ]
          },
          'outline-style': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
          },
          'outline-width': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
          },
          'overflow': {
            'cssPropBits': 32,
            'cssLitGroup': [ L[ 38 ], L[ 46 ], L[ 47 ], L[ 58 ], L[ 63 ] ]
          },
          'overflow-x': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 32 ], L[ 38 ], L[ 46 ], L[ 58 ], L[ 63 ] ]
          },
          'overflow-y': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 32 ], L[ 38 ], L[ 46 ], L[ 58 ], L[ 63 ] ]
          },
          'padding': {
            'cssPropBits': 1,
            'cssLitGroup': [ L[ 47 ] ]
          },
          'padding-bottom': {
            'cssPropBits': 33,
            'cssLitGroup': [ L[ 47 ] ]
          },
          'padding-left': {
            'cssPropBits': 33,
            'cssLitGroup': [ L[ 47 ] ]
          },
          'padding-right': {
            'cssPropBits': 33,
            'cssLitGroup': [ L[ 47 ] ]
          },
          'padding-top': {
            'cssPropBits': 33,
            'cssLitGroup': [ L[ 47 ] ]
          },
          'page-break-after': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 30 ], L[ 37 ], L[ 38 ], L[ 39 ], L[ 47 ] ]
          },
          'page-break-before': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 30 ], L[ 37 ], L[ 38 ], L[ 39 ], L[ 47 ] ]
          },
          'page-break-inside': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 38 ], L[ 39 ], L[ 47 ] ]
          },
          'pause': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 47 ] ]
          },
          'pause-after': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 47 ] ]
          },
          'pause-before': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 47 ] ]
          },
          'pitch': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 19 ], L[ 47 ], L[ 52 ] ]
          },
          'pitch-range': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 47 ] ]
          },
          'play-during': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 16,
            'cssLitGroup': [ L[ 38 ], L[ 47 ], L[ 53 ], L[ 54 ], L[ 57 ] ]
          },
          'position': {
            'cssPropBits': 32,
            'cssLitGroup': [ L[ 20 ], L[ 47 ] ]
          },
          'quotes': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
          },
          'richness': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 47 ] ]
          },
          'right': {
            'cssPropBits': 37,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'speak': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 47 ], L[ 54 ], L[ 55 ], L[ 61 ] ]
          },
          'speak-header': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 37 ], L[ 47 ], L[ 56 ] ]
          },
          'speak-numeral': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 26 ], L[ 47 ] ]
          },
          'speak-punctuation': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 43 ], L[ 47 ], L[ 54 ] ]
          },
          'speech-rate': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 12 ], L[ 47 ], L[ 52 ] ]
          },
          'stress': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 47 ] ]
          },
          'table-layout': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 38 ], L[ 45 ], L[ 47 ] ]
          },
          'text-align': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 30 ], L[ 42 ], L[ 47 ], L[ 50 ] ]
          },
          'text-decoration': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 18 ], L[ 47 ], L[ 54 ] ]
          },
          'text-indent': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 47 ] ]
          },
          'text-overflow': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 25 ] ]
          },
          'text-shadow': {
            'cssExtra': c[ 1 ],
            'cssPropBits': 7,
            'cssLitGroup': [ L[ 0 ], L[ 35 ], L[ 48 ], L[ 54 ] ]
          },
          'text-transform': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 21 ], L[ 47 ], L[ 54 ] ]
          },
          'text-wrap': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 33 ], L[ 54 ], L[ 55 ] ]
          },
          'top': {
            'cssPropBits': 37,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'unicode-bidi': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 23 ], L[ 47 ], L[ 55 ] ]
          },
          'vertical-align': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 10 ], L[ 24 ], L[ 47 ] ]
          },
          'visibility': {
            'cssPropBits': 32,
            'cssLitGroup': [ L[ 44 ], L[ 46 ], L[ 47 ], L[ 63 ] ]
          },
          'voice-family': {
            'cssExtra': c[ 0 ],
            'cssPropBits': 8,
            'cssLitGroup': [ L[ 22 ], L[ 35 ], L[ 47 ] ]
          },
          'volume': {
            'cssPropBits': 1,
            'cssLitGroup': [ L[ 16 ], L[ 47 ], L[ 52 ] ]
          },
          'white-space': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 8 ], L[ 47 ], L[ 55 ] ]
          },
          'width': {
            'cssPropBits': 33,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'word-spacing': {
            'cssPropBits': 5,
            'cssLitGroup': [ L[ 47 ], L[ 55 ] ]
          },
          'word-wrap': {
            'cssPropBits': 0,
            'cssLitGroup': [ L[ 41 ], L[ 55 ] ]
          },
          'z-index': {
            'cssPropBits': 69,
            'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
          },
          'zoom': {
            'cssPropBits': 1,
            'cssLitGroup': [ L[ 55 ] ]
          }
        };
      })();
    if (typeof window !== 'undefined') {
      window['cssSchema'] = cssSchema;
    }
    // Copyright (C) 2011 Google Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.

    /**
     * A lexical scannar for CSS3 as defined at http://www.w3.org/TR/css3-syntax .
     *
     * @author Mike Samuel <mikesamuel@gmail.com>
     * \@provides lexCss, decodeCss
     * \@overrides window
     */

    var lexCss;
    var decodeCss;

    (function () {

      /**
       * Decodes an escape sequence as specified in CSS3 section 4.1.
       * http://www.w3.org/TR/css3-syntax/#characters
       * @private
       */
      function decodeCssEscape(s) {
        var i = parseInt(s.substring(1), 16);
        // If parseInt didn't find a hex diigt, it returns NaN so return the
        // escaped character.
        // Otherwise, parseInt will stop at the first non-hex digit so there's no
        // need to worry about trailing whitespace.
        if (i > 0xffff) {
          // A supplemental codepoint.
          return i -= 0x10000,
            String.fromCharCode(
                0xd800 + (i >> 10),
                0xdc00 + (i & 0x3FF));
        } else if (i == i) {
          return String.fromCharCode(i);
        } else if (s[1] < ' ') {
          // "a backslash followed by a newline is ignored".
          return '';
        } else {
          return s[1];
        }
      }

      /**
       * Returns an equivalent CSS string literal given plain text: foo -> "foo".
       * @private
       */
      function escapeCssString(s, replacer) {
        return '"' + s.replace(/[\u0000-\u001f\\\"<>]/g, replacer) + '"';
      }

      /**
       * Maps chars to CSS escaped equivalents: "\n" -> "\\a ".
       * @private
       */
      function escapeCssStrChar(ch) {
        return cssStrChars[ch]
            || (cssStrChars[ch] = '\\' + ch.charCodeAt(0).toString(16) + ' ');
      }

      /**
       * Maps chars to URI escaped equivalents: "\n" -> "%0a".
       * @private
       */
      function escapeCssUrlChar(ch) {
        return cssUrlChars[ch]
            || (cssUrlChars[ch] = (ch < '\x10' ? '%0' : '%')
                + ch.charCodeAt(0).toString(16));
      }

      /**
       * Mapping of CSS special characters to escaped equivalents.
       * @private
       */
      var cssStrChars = {
        '\\': '\\\\'
      };

      /**
       * Mapping of CSS special characters to URL-escaped equivalents.
       * @private
       */
      var cssUrlChars = {
        '\\': '%5c'
      };

      // The comments below are copied from the CSS3 module syntax at
      // http://www.w3.org/TR/css3-syntax .
      // These string constants minify out when this is run-through closure
      // compiler.
      // Rules that have been adapted have comments prefixed with "Diff:", and
      // where rules have been combined to avoid back-tracking in the regex engine
      // or to work around limitations, there is a comment prefixed with
      // "NewRule:".

      // In the below, we assume CRLF and CR have been normalize to CR.

      // wc  ::=  #x9 | #xA | #xC | #xD | #x20
      var WC = '[\\t\\n\\f ]';
      // w  ::=  wc*
      var W = WC + '*';
      // nl  ::=  #xA | #xD #xA | #xD | #xC
      var NL = '[\\n\\f]';
      // nonascii  ::=  [#x80-#xD7FF#xE000-#xFFFD#x10000-#x10FFFF]
      // NewRule: Supplemental codepoints are represented as surrogate pairs in JS.
      var SURROGATE_PAIR = '[\\ud800-\\udbff][\\udc00-\\udfff]';
      var NONASCII = '[\\u0080-\\ud7ff\\ue000-\\ufffd]|' + SURROGATE_PAIR;
      // unicode  ::=  '\' [0-9a-fA-F]{1,6} wc?
      // NewRule: No point in having ESCAPE do (\\x|\\y)
      var UNICODE_TAIL = '[0-9a-fA-F]{1,6}' + WC + '?';
      // escape  ::=  unicode
      //           | '\' [#x20-#x7E#x80-#xD7FF#xE000-#xFFFD#x10000-#x10FFFF]
      // NewRule: Below we use escape tail to efficiently match an escape or a
      // line continuation so we can decode string content.
      var ESCAPE_TAIL = '(?:' + UNICODE_TAIL
          + '|[\\u0020-\\u007e\\u0080-\\ud7ff\\ue000\\ufffd]|'
          + SURROGATE_PAIR + ')';
      var ESCAPE = '\\\\' + ESCAPE_TAIL;
      // urlchar  ::=  [#x9#x21#x23-#x26#x28-#x7E] | nonascii | escape
      var URLCHAR = '(?:[\\t\\x21\\x23-\\x26\\x28-\\x5b\\x5d-\\x7e]|'
          + NONASCII + '|' + ESCAPE + ')';
      // stringchar  ::= urlchar | #x20 | '\' nl
      // We ignore mismatched surrogate pairs inside strings, so stringchar
      // simplifies to a non-(quote|newline|backslash) or backslash any.
      // Since we normalize CRLF to a single code-unit, there is no special
      // handling needed for '\\' + CRLF.
      var STRINGCHAR = '[^\'"\\n\\f\\\\]|\\\\[\\s\\S]';
      // string  ::=  '"' (stringchar | "'")* '"' | "'" (stringchar | '"')* "'"
      var STRING = '"(?:\'|' + STRINGCHAR + ')*"'
          + '|\'(?:\"|' + STRINGCHAR + ')*\'';
      // num  ::=  [0-9]+ | [0-9]* '.' [0-9]+
      // Diff: We attach signs to num tokens.
      var NUM = '[-+]?(?:[0-9]+(?:[.][0-9]+)?|[.][0-9]+)';
      // nmstart  ::=  [a-zA-Z] | '_' | nonascii | escape
      var NMSTART = '(?:[a-zA-Z_]|' + NONASCII + '|' + ESCAPE + ')';
      // nmchar  ::=  [a-zA-Z0-9] | '-' | '_' | nonascii | escape
      var NMCHAR = '(?:[a-zA-Z0-9_-]|' + NONASCII + '|' + ESCAPE + ')';
      // ident  ::=  '-'? nmstart nmchar*
      var IDENT = '-?' + NMSTART + NMCHAR + '*';

      // NewRule: union of IDENT, ATKEYWORD, HASH, but excluding #[0-9].
      var WORD_TERM = '(?:@?-?' + NMSTART + '|#)' + NMCHAR + '*';
      var NUMERIC_VALUE = NUM + '(?:%|' + IDENT + ')?';
      // URI  ::=  "url(" w (string | urlchar* ) w ")"
      var URI = 'url[(]' + W + '(?:' + STRING + '|' + URLCHAR + '*)' + W + '[)]';
      // UNICODE-RANGE  ::=  "U+" [0-9A-F?]{1,6} ('-' [0-9A-F]{1,6})?
      var UNICODE_RANGE = 'U[+][0-9A-F?]{1,6}(?:-[0-9A-F]{1,6})?';
      // CDO  ::=  "<\!--"
      var CDO = '<\!--';
      // CDC  ::=  "-->"
      var CDC = '-->';
      // S  ::=  wc+
      var S = WC + '+';
      // COMMENT  ::=  "/*" [^*]* '*'+ ([^/] [^*]* '*'+)* "/"
      // Diff: recognizes // comments.
      var COMMENT = '/(?:[*][^*]*[*]+(?:[^/][^*]*[*]+)*/|/[^\\n\\f]*)';
      // FUNCTION  ::=  ident '('
      // Diff: We exclude url explicitly.
      // TODO: should we be tolerant of "fn ("?
      // ##### BEGIN: MODIFIED BY SAP
      // Avoid risk of 'catastrophic backtracking' when unicode escapes are used
      // var FUNCTION = '(?!url[(])' + IDENT + '[(]';
      var FUNCTION = '(?!url[(])(?=(' + IDENT + '))\\1[(]';
      // NewRule: one rule for all the comparison operators.
      var CMP_OPS = '[~|^$*]=';
      // CHAR  ::=  any character not matched by the above rules, except for " or '
      // Diff: We exclude / and \ since they are handled above to prevent
      // /* without a following */ from combining when comments are concatenated.
      var CHAR = '[^"\'\\\\/]|/(?![/*])';
      // BOM  ::=  #xFEFF
      var BOM = '\\uFEFF';

      var CSS_TOKEN = new RegExp([
          BOM, UNICODE_RANGE, URI, FUNCTION, WORD_TERM, STRING, NUMERIC_VALUE,
          CDO, CDC, S, COMMENT, CMP_OPS, CHAR].join("|"), 'gi');

      /**
       * Decodes CSS escape sequences in a CSS string body.
       */
       decodeCss = function (css) {
         return css.replace(
             new RegExp('\\\\(?:' + ESCAPE_TAIL + '|' + NL + ')', 'g'),
             decodeCssEscape);
       };

      /**
       * Given CSS Text, returns an array of normalized tokens.
       * @param {string} cssText
       * @return {Array.<string>} tokens where all ignorable token sequences have
       *    been reduced to a single {@code " "} and all strings and
       *    {@code url(...)} tokens have been normalized to use double quotes as
       *    delimiters and to not otherwise contain double quotes.
       */
      lexCss = function (cssText) {
        cssText = '' + cssText;
        var tokens = cssText.replace(/\r\n?/g, '\n')  // Normalize CRLF & CR to LF.
            .match(CSS_TOKEN) || [];
        var j = 0;
        var last = ' ';
        for (var i = 0, n = tokens.length; i < n; ++i) {
          // Normalize all escape sequences.  We will have to re-escape some
          // codepoints in string and url(...) bodies but we already know the
          // boundaries.
          // We might mistakenly treat a malformed identifier like \22\20\22 as a
          // string, but that will not break any valid stylesheets since we requote
          // and re-escape in string below.
          var tok = decodeCss(tokens[i]);
          var len = tok.length;
          var cc = tok.charCodeAt(0);
          tok =
              // All strings should be double quoted, and the body should never
              // contain a double quote.
              (cc == '"'.charCodeAt(0) || cc == '\''.charCodeAt(0))
              ? escapeCssString(tok.substring(1, len - 1), escapeCssStrChar)
              // A breaking ignorable token should is replaced with a single space.
              : (cc == '/'.charCodeAt(0) && len > 1  // Comment.
                 || tok == '\\' || tok == CDC || tok == CDO || tok == '\ufeff'
                 // Characters in W.
                 || cc <= ' '.charCodeAt(0))
              ? ' '
              // Make sure that all url(...)s are double quoted.
              : /url\(/i.test(tok)
              ? 'url(' + escapeCssString(
                tok.replace(
                    new RegExp('^url\\(' + W + '["\']?|["\']?' + W + '\\)$', 'gi'),
                    ''),
                escapeCssUrlChar)
                + ')'
              // Escapes in identifier like tokens will have been normalized above.
              : tok;
          // Merge adjacent space tokens.
          if (last != tok || tok != ' ') {
            tokens[j++] = last = tok;
          }
        }
        tokens.length = j;
        return tokens;
      };
    })();

    // Exports for closure compiler.
    if (typeof window !== 'undefined') {
      window['lexCss'] = lexCss;
      window['decodeCss'] = decodeCss;
    }
    // Copyright (C) 2011 Google Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.

    /**
     * @fileoverview
     * JavaScript support for client-side CSS sanitization.
     * The CSS property schema API is defined in CssPropertyPatterns.java which
     * is used to generate css-defs.js.
     *
     * @author mikesamuel@gmail.com
     * \@requires CSS_PROP_BIT_ALLOWED_IN_LINK
     * \@requires CSS_PROP_BIT_HASH_VALUE
     * \@requires CSS_PROP_BIT_NEGATIVE_QUANTITY
     * \@requires CSS_PROP_BIT_QSTRING_CONTENT
     * \@requires CSS_PROP_BIT_QSTRING_URL
     * \@requires CSS_PROP_BIT_QUANTITY
     * \@requires CSS_PROP_BIT_Z_INDEX
     * \@requires cssSchema
     * \@requires decodeCss
     * \@requires html4
     * \@overrides window
     * \@requires parseCssStylesheet
     * \@provides sanitizeCssProperty
     * \@provides sanitizeCssSelectors
     * \@provides sanitizeStylesheet
     */

    /**
     * Given a series of normalized CSS tokens, applies a property schema, as
     * defined in CssPropertyPatterns.java, and sanitizes the tokens in place.
     * @param property a property name.
     * @param propertySchema a property of cssSchema as defined by
     *    CssPropertyPatterns.java
     * @param tokens as parsed by lexCss.  Modified in place.
     * @param opt_naiveUriRewriter a URI rewriter; an object with a "rewrite"
     *     function that takes a URL and returns a safe URL.
     */
    var sanitizeCssProperty = (function () {
      var NOEFFECT_URL = 'url("about:blank")';
      /**
       * The set of characters that need to be normalized inside url("...").
       * We normalize newlines because they are not allowed inside quoted strings,
       * normalize quote characters, angle-brackets, and asterisks because they
       * could be used to break out of the URL or introduce targets for CSS
       * error recovery.  We normalize parentheses since they delimit unquoted
       * URLs and calls and could be a target for error recovery.
       */
      var NORM_URL_REGEXP = /[\n\f\r\"\'()*<>]/g;
      /** The replacements for NORM_URL_REGEXP. */
      var NORM_URL_REPLACEMENTS = {
        '\n': '%0a',
        '\f': '%0c',
        '\r': '%0d',
        '"':  '%22',
        '\'': '%27',
        '(':  '%28',
        ')':  '%29',
        '*':  '%2a',
        '<':  '%3c',
        '>':  '%3e'
      };


      function normalizeUrl(s) {
        if ('string' === typeof s) {
          return 'url("' + s.replace(NORM_URL_REGEXP, normalizeUrlChar) + '")';
        } else {
          return NOEFFECT_URL;
        }
      }
      function normalizeUrlChar(ch) {
        return NORM_URL_REPLACEMENTS[ch];
      }

      // From RFC3986
      var URI_SCHEME_RE = new RegExp(
          '^' +
          '(?:' +
            '([^:\/?# ]+)' +         // scheme
          ':)?'
      );

      var ALLOWED_URI_SCHEMES = /^(?:https?|mailto)$/i;

      function safeUri(uri, prop, naiveUriRewriter) {
        if (!naiveUriRewriter) { return null; }
        var parsed = ('' + uri).match(URI_SCHEME_RE);
        if (parsed && (!parsed[1] || ALLOWED_URI_SCHEMES.test(parsed[1]))) {
          return naiveUriRewriter(uri, prop);
        } else {
          return null;
        }
      }

      function unionArrays(arrs) {
        var map = {};
        for (var i = arrs.length; --i >= 0;) {
          var arr = arrs[i];
          for (var j = arr.length; --j >= 0;) {
            map[arr[j]] = ALLOWED_LITERAL;
          }
        }
        return map;
      }

      /**
       * Normalize tokens within a function call they can match against
       * cssSchema[propName].cssExtra.
       * @return the exclusive end in tokens of the function call.
       */
      function normalizeFunctionCall(tokens, start) {
        var parenDepth = 1, end = start + 1, n = tokens.length;
        while (end < n && parenDepth) {
          // TODO: Can URLs appear in functions?
          var token = tokens[end++];
          parenDepth += (token === '(' ? 1 : token === ')' ? -1 : 0);
        }
        return end;
      }

      // Used as map value to avoid hasOwnProperty checks.
      var ALLOWED_LITERAL = {};

      return function (property, propertySchema, tokens, opt_naiveUriRewriter) {
        var propBits = propertySchema.cssPropBits;
        // Used to determine whether to treat quoted strings as URLs or
        // plain text content, and whether unrecognized keywords can be quoted
        // to treate ['Arial', 'Black'] equivalently to ['"Arial Black"'].
        var qstringBits = propBits & (
            CSS_PROP_BIT_QSTRING_CONTENT | CSS_PROP_BIT_QSTRING_URL);
        // TODO(mikesamuel): Figure out what to do with props like
        // content that admit both URLs and strings.

        // Used to join unquoted keywords into a single quoted string.
        var lastQuoted = NaN;
        var i = 0, k = 0;
        for (;i < tokens.length; ++i) {
          // Has the effect of normalizing hex digits, keywords,
          // and function names.
          var token = tokens[i].toLowerCase();
          var cc = token.charCodeAt(0), cc1, cc2, isnum1, isnum2, end;
          var litGroup, litMap;
          token = (
            // Strip out spaces.  Normally cssparser.js dumps these, but we
            // strip them out in case the content doesn't come via cssparser.js.
            (cc === ' '.charCodeAt(0))
              ? ''
              : (cc === '"'.charCodeAt(0))
                  ? (  // Quoted string.
                      (qstringBits === CSS_PROP_BIT_QSTRING_URL && opt_naiveUriRewriter)
                      // Sanitize and convert to url("...") syntax.
                      // Treat url content as case-sensitive.
                      ? (normalizeUrl(
                           safeUri(
                             decodeCss(tokens[i].substring(1, token.length - 1)),
                             property,
                             opt_naiveUriRewriter
                           )
                         ))
                      // Drop if plain text content strings not allowed.
                      : (qstringBits === CSS_PROP_BIT_QSTRING_CONTENT) ? token : '')
                  // Preserve hash color literals if allowed.
                  : (cc === '#'.charCodeAt(0) && /^#(?:[0-9a-f]{3}){1,2}$/.test(token))
                      ? (propBits & CSS_PROP_BIT_HASH_VALUE ? token : '')
                      // ##### BEGIN: MODIFIED BY SAP
                      // : ('0'.charCodeAt(0) <= cc && cc <= '9'.charCodeAt(0))
                      : ('0'.charCodeAt(0) <= cc && cc <= '9'.charCodeAt(0) && !propertySchema.cssLitNumeric)
                      // ##### END: MODIFIED BY SAP
                          // A number starting with a digit.
                          ? ((propBits & CSS_PROP_BIT_QUANTITY)
                               ? ((propBits & CSS_PROP_BIT_Z_INDEX)
                                    ? (token.match(/^\d{1,7}$/) ? token : '')
                                    : token)
                               : '')
                          // Normalize quantities so they don't start with a '.' or '+' sign and
                          // make sure they all have an integer component so can't be confused
                          // with a dotted identifier.
                          // This can't be done in the lexer since ".4" is a valid rule part.
                          : (cc1 = token.charCodeAt(1),
                             cc2 = token.charCodeAt(2),
                             isnum1 = '0'.charCodeAt(0) <= cc1 && cc1 <= '9'.charCodeAt(0),
                             isnum2 = '0'.charCodeAt(0) <= cc2 && cc2 <= '9'.charCodeAt(0),
                             // +.5 -> 0.5 if allowed.
                             (cc === '+'.charCodeAt(0)
                              && (isnum1 || (cc1 === '.'.charCodeAt(0) && isnum2))))
                               ? ((propBits & CSS_PROP_BIT_QUANTITY)
                                    ? ((propBits & CSS_PROP_BIT_Z_INDEX)
                                         ? (token.match(/^\+\d{1,7}$/) ? token : '')
                                         : ((isnum1 ? '' : '0') + token.substring(1)))
                                    : '')
                               // -.5 -> -0.5 if allowed otherwise -> 0 if quantities allowed.
                               : (cc === '-'.charCodeAt(0)
                                  && (isnum1 || (cc1 === '.'.charCodeAt(0) && isnum2)))
                                    ? ((propBits & CSS_PROP_BIT_NEGATIVE_QUANTITY)
                                         ? ((propBits & CSS_PROP_BIT_Z_INDEX)
                                              ? (token.match(/^\-\d{1,7}$/) ? token : '')
                                              : ((isnum1 ? '-' : '-0') + token.substring(1)))
                                         : ((propBits & CSS_PROP_BIT_QUANTITY) ? '0' : ''))
                                    // .5 -> 0.5 if allowed.
                                    : (cc === '.'.charCodeAt(0) && isnum1)
                                         ? ((propBits & CSS_PROP_BIT_QUANTITY) ? '0' + token : '')
                                         // Handle url("...") by rewriting the body.
                                         : ('url(' === token.substring(0, 4))
                                              ? ((opt_naiveUriRewriter && (qstringBits & CSS_PROP_BIT_QSTRING_URL))
                                                   ? normalizeUrl(
                                                       safeUri(
                                                         tokens[i].substring(5, token.length - 2),
                                                         property,
                                                         opt_naiveUriRewriter
                                                       )
                                                     )
                                                   : '')
                                              // Handle func(...) and literal tokens
                                              // such as keywords and punctuation.
                                              : (
                                                 // Step 1. Combine func(...) into something that can be compared
                                                 // against propertySchema.cssExtra.
                                                 (token.charAt(token.length-1) === '(')
                                                 && (end = normalizeFunctionCall(tokens, i),
                                                   // When tokens is
                                                   //   ['x', ' ', 'rgb(', '255', ',', '0', ',', '0', ')', ' ', 'y']
                                                   // and i is the index of 'rgb(' and end is the index of ')'
                                                   // splices tokens to where i now is the index of the whole call:
                                                   //   ['x', ' ', 'rgb( 255 , 0 , 0 )', ' ', 'y']
                                                   tokens.splice(i, end - i,
                                                     token = tokens.slice(i, end).join(' '))),
                                                 litGroup = propertySchema.cssLitGroup,
                                                 litMap = (
                                                    litGroup
                                                    ? (propertySchema.cssLitMap
                                                       // Lazily compute the union from litGroup.
                                                       || (propertySchema.cssLitMap = unionArrays(litGroup)))
                                                    : ALLOWED_LITERAL),  // A convenient empty object.
                                                 (litMap[token] === ALLOWED_LITERAL
                                                  || propertySchema.cssExtra && propertySchema.cssExtra.test(token)))
                                                    // Token is in the literal map or matches extra.
                                                    ? token
                                                    : (/^\w+$/.test(token)
                                                       && (qstringBits === CSS_PROP_BIT_QSTRING_CONTENT))
                                                         // Quote unrecognized keywords so font names like
                                                          //    Arial Bold
                                                          // ->
                                                          //    "Arial Bold"
                                                          ? (lastQuoted+1 === k
                                                             // If the last token was also a keyword that was quoted, then
                                                             // combine this token into that.
                                                             ? (tokens[lastQuoted] = tokens[lastQuoted]
                                                                .substring(0, tokens[lastQuoted].length-1) + ' ' + token + '"',
                                                                token = '')
                                                             : (lastQuoted = k, '"' + token + '"'))
                                                          // Disallowed.
                                                          : '');
          if (token) {
            tokens[k++] = token;
          }
        }
        // For single URL properties, if the URL failed to pass the sanitizer,
        // then just drop it.
        if (k === 1 && tokens[0] === NOEFFECT_URL) { k = 0; }
        tokens.length = k;
      };
    })();

    /**
     * Given a series of tokens, returns two lists of sanitized selectors.
     * @param {Array.<string>} selectors In the form produces by csslexer.js.
     * @param {string} suffix a suffix that is added to all IDs and which is
     *    used as a CLASS names so that the returned selectors will only match
     *    nodes under one with suffix as a class name.
     *    If suffix is {@code "sfx"}, the selector
     *    {@code ["a", "#foo", " ", "b", ".bar"]} will be namespaced to
     *    {@code [".sfx", " ", "a", "#foo-sfx", " ", "b", ".bar"]}.
     * @return {Array.<Array.<string>>} an array of length 2 where the zeroeth
     *    element contains history-insensitive selectors and the first element
     *    contains history-sensitive selectors.
     */
    function sanitizeCssSelectors(selectors, suffix) {
      // Produce two distinct lists of selectors to sequester selectors that are
      // history sensitive (:visited), so that we can disallow properties in the
      // property groups for the history sensitive ones.
      var historySensitiveSelectors = [];
      var historyInsensitiveSelectors = [];

      // Remove any spaces that are not operators.
      var k = 0, i;
      for (i = 0; i < selectors.length; ++i) {
        if (!(selectors[i] == ' '
              && (selectors[i-1] == '>' || selectors[i+1] == '>'))) {
          selectors[k++] = selectors[i];
        }
      }
      selectors.length = k;

      // Split around commas.  If there is an error in one of the comma separated
      // bits, we throw the whole away, but the failure of one selector does not
      // affect others.
      var n = selectors.length, start = 0;
      for (i = 0; i < n; ++i) {
        if (selectors[i] == ',') {
          processSelector(start, i);
          start = i+1;
        }
      }
      processSelector(start, n);


      function processSelector(start, end) {
        var historySensitive = false;

        // Space around commas is not an operator.
        if (selectors[start] === ' ') { ++start; }
        if (end-1 !== start && selectors[end] === ' ') { --end; }

        // Split the selector into element selectors, content around
        // space (ancestor operator) and '>' (descendant operator).
        var out = [];
        var lastOperator = start;
        var elSelector = '';
        for (var i = start; i < end; ++i) {
          var tok = selectors[i];
          var isChild = (tok === '>');
          if (isChild || tok === ' ') {
            // We've found the end of a single link in the selector chain.
            // We disallow absolute positions relative to html.
            elSelector = processElementSelector(lastOperator, i, false);
            if (!elSelector || (isChild && /^html/i.test(elSelector))) {
              return;
            }
            lastOperator = i+1;
            out.push(elSelector, isChild ? ' > ' : ' ');
          }
        }
        elSelector = processElementSelector(lastOperator, end, true);
        if (!elSelector) { return; }
        out.push(elSelector);

        function processElementSelector(start, end, last) {

          // Split the element selector into three parts.
          // DIV.foo#bar:hover
          //    ^       ^
          // el classes pseudo
          var element, classId, pseudoSelector, tok, elType;
          element = '';
          if (start < end) {
            tok = selectors[start].toLowerCase();
            if (tok === '*'
                || (tok === 'body' && start+1 !== end && !last)
                || ('number' === typeof (elType = html4.ELEMENTS[tok])
                    && !(elType & html4.eflags.UNSAFE))) {
              ++start;
              element = tok;
            }
          }
          classId = '';
          while (start < end) {
            tok = selectors[start];
            if (tok.charAt(0) === '#') {
              if (/^#_|__$|[^#0-9A-Za-z:_\-]/.test(tok)) { return null; }
              // Rewrite ID elements to include the suffix.
              classId += tok + '-' + suffix;
            } else if (tok === '.') {
              if (++start < end
                  && /^[0-9A-Za-z:_\-]+$/.test(tok = selectors[start])
                  && !/^_|__$/.test(tok)) {
                classId += '.' + tok;
              } else {
                return null;
              }
            } else {
              break;
            }
            ++start;
          }
          pseudoSelector = '';
          if (start < end && selectors[start] === ':') {
            tok = selectors[++start];
            if (tok === 'visited' || tok === 'link') {
              if (!/^[a*]?$/.test(element)) {
                return null;
              }
              historySensitive = true;
              pseudoSelector = ':' + tok;
              element = 'a';
              ++start;
            }
          }
          if (start === end) {
            return element + classId + pseudoSelector;
          }
          return null;
        }


        var safeSelector = out.join('');
        if (/^body\b/.test(safeSelector)) {
          // Substitute the class that is attached to pseudo body elements for
          // the body element.
          safeSelector = '.vdoc-body___.' + suffix + safeSelector.substring(4);
        } else {
          // Namespace the selector so that it only matches under
          // a node with suffix in its CLASS attribute.
          safeSelector = '.' + suffix + ' ' + safeSelector;
        }

        (historySensitive
         ? historySensitiveSelectors
         : historyInsensitiveSelectors).push(safeSelector);
      }

      return [historyInsensitiveSelectors, historySensitiveSelectors];
    }

    var sanitizeStylesheet = (function () {
      var allowed = {};
      var cssMediaTypeWhitelist = {
        'braille': allowed,
        'embossed': allowed,
        'handheld': allowed,
        'print': allowed,
        'projection': allowed,
        'screen': allowed,
        'speech': allowed,
        'tty': allowed,
        'tv': allowed
      };

      /**
       * Given a series of sanitized tokens, removes any properties that would
       * leak user history if allowed to style links differently depending on
       * whether the linked URL is in the user's browser history.
       * @param {Array.<string>} blockOfProperties
       */
      function sanitizeHistorySensitive(blockOfProperties) {
        var elide = false;
        for (var i = 0, n = blockOfProperties.length; i < n-1; ++i) {
          var token = blockOfProperties[i];
          if (':' === blockOfProperties[i+1]) {
            elide = !(cssSchema[token].cssPropBits & CSS_PROP_BIT_ALLOWED_IN_LINK);
          }
          if (elide) { blockOfProperties[i] = ''; }
          if (';' === token) { elide = false; }
        }
        return blockOfProperties.join('');
      }

      /**
       * @param {string} cssText a string containing a CSS stylesheet.
       * @param {string} suffix a suffix that is added to all IDs and which is
       *    used as a CLASS names so that the returned selectors will only match
       *    nodes under one with suffix as a class name.
       *    If suffix is {@code "sfx"}, the selector
       *    {@code ["a", "#foo", " ", "b", ".bar"]} will be namespaced to
       *    {@code [".sfx", " ", "a", "#foo-sfx", " ", "b", ".bar"]}.
       * @param {function(string, string)} opt_naiveUriRewriter maps URLs of media
       *    (images, sounds) that appear as CSS property values to sanitized
       *    URLs or null if the URL should not be allowed as an external media
       *    file in sanitized CSS.
       */
      return function /*sanitizeStylesheet*/(
           cssText, suffix, opt_naiveUriRewriter) {
        var safeCss = void 0;
        // A stack describing the { ... } regions.
        // Null elements indicate blocks that should not be emitted.
        var blockStack = [];
        // True when the content of the current block should be left off safeCss.
        var elide = false;
        parseCssStylesheet(
            cssText,
            {
              startStylesheet: function () {
                safeCss = [];
              },
              endStylesheet: function () {
              },
              startAtrule: function (atIdent, headerArray) {
                if (elide) {
                  atIdent = null;
                } else if (atIdent === '@media') {
                  headerArray = headerArray.filter(
                    function (mediaType) {
                      return cssMediaTypeWhitelist[mediaType] == allowed;
                    });
                  if (headerArray.length) {
                    safeCss.push(atIdent, headerArray.join(','), '{');
                  } else {
                    atIdent = null;
                  }
                } else {
                  if (atIdent === '@import') {
                    // TODO: Use a logger instead.
                    if (window.console) {
                      window.console.log(
                          '@import ' + headerArray.join(' ') + ' elided');
                    }
                  }
                  atIdent = null;  // Elide the block.
                }
                elide = !atIdent;
                blockStack.push(atIdent);
              },
              endAtrule: function () {
                blockStack.pop();
                if (!elide) {
                  safeCss.push(';');
                }
                checkElide();
              },
              startBlock: function () {
                // There are no bare blocks in CSS, so we do not change the
                // block stack here, but instead in the events that bracket
                // blocks.
                if (!elide) {
                  safeCss.push('{');
                }
              },
              endBlock: function () {
                if (!elide) {
                  safeCss.push('}');
                  elide = true;  // skip any semicolon from endAtRule.
                }
              },
              startRuleset: function (selectorArray) {
                var historySensitiveSelectors = void 0;
                var removeHistoryInsensitiveSelectors = false;
                if (!elide) {
                  var selectors = sanitizeCssSelectors(selectorArray, suffix);
                  var historyInsensitiveSelectors = selectors[0];
                  historySensitiveSelectors = selectors[1];
                  if (!historyInsensitiveSelectors.length
                      && !historySensitiveSelectors.length) {
                    elide = true;
                  } else {
                    var selector = historyInsensitiveSelectors.join(', ');
                    if (!selector) {
                      // If we have only history sensitive selectors,
                      // use an impossible rule so that we can capture the content
                      // for later processing by
                      // history insenstive content for use below.
                      selector = 'head > html';
                      removeHistoryInsensitiveSelectors = true;
                    }
                    safeCss.push(selector, '{');
                  }
                }
                blockStack.push(
                    elide
                    ? null
                    // Sometimes a single list of selectors is split in two,
                    //   div, a:visited
                    // because we want to allow some properties for DIV that
                    // we don't want to allow for A:VISITED to avoid leaking
                    // user history.
                    // Store the history sensitive selectors and the position
                    // where the block starts so we can later create a copy
                    // of the permissive tokens, and filter it to handle the
                    // history sensitive case.
                    : {
                        historySensitiveSelectors: historySensitiveSelectors,
                        endOfSelectors: safeCss.length - 1,  // 1 is open curly
                        removeHistoryInsensitiveSelectors:
                           removeHistoryInsensitiveSelectors
                      });
              },
              endRuleset: function () {
                var rules = blockStack.pop();
                var propertiesEnd = safeCss.length;
                if (!elide) {
                  safeCss.push('}');
                  if (rules) {
                    var extraSelectors = rules.historySensitiveSelectors;
                    if (extraSelectors.length) {
                      var propertyGroupTokens = safeCss.slice(rules.endOfSelectors);
                      safeCss.push(extraSelectors.join(', '),
                                   sanitizeHistorySensitive(propertyGroupTokens));
                    }
                  }
                }
                if (rules && rules.removeHistoryInsensitiveSelectors) {
                  safeCss.splice(
                    // -1 and +1 account for curly braces.
                    rules.endOfSelectors - 1, propertiesEnd + 1);
                }
                checkElide();
              },
              declaration: function (property, valueArray) {
                if (!elide) {
                  var schema = cssSchema[property];
                  if (schema) {
                    sanitizeCssProperty(property, schema, valueArray, opt_naiveUriRewriter);
                    if (valueArray.length) {
                      safeCss.push(property, ':', valueArray.join(' '), ';');
                    }
                  }
                }
              }
            });
        function checkElide() {
          elide = blockStack.length !== 0
              && blockStack[blockStack.length-1] !== null;
        }
        return safeCss.join('');
      };
    })();

    // Exports for closure compiler.
    if (typeof window !== 'undefined') {
      window['sanitizeCssProperty'] = sanitizeCssProperty;
      window['sanitizeCssSelectors'] = sanitizeCssSelectors;
      window['sanitizeStylesheet'] = sanitizeStylesheet;
    }
    // Copyright (C) 2010 Google Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.

    /**
     * @fileoverview
     * Utilities for dealing with CSS source code.
     *
     * @author mikesamuel@gmail.com
     * \@requires lexCss
     * \@overrides window
     * \@provides parseCssStylesheet, parseCssDeclarations
     */

    /**
     * parseCssStylesheet takes a chunk of CSS text and a handler object with
     * methods that it calls as below:
     * <pre>
     * // At the beginning of a stylesheet.
     * handler.startStylesheet();
     *
     * // For an @foo rule ended by a semicolon: @import "foo.css";
     * handler.startAtrule('@import', ['"foo.css"']);
     * handler.endAtrule();
     *
     * // For an @foo rule ended with a block. @media print { ... }
     * handler.startAtrule('@media', ['print']);
     * handler.startBlock();
     * // Calls to contents elided.  Probably selectors and declarations as below.
     * handler.endBlock();
     * handler.endAtrule();
     *
     * // For a ruleset: p.clazz q, s { color: blue; }
     * handler.startRuleset(['p', '.', 'clazz', ' ', 'q', ',', ' ', 's']);
     * handler.declaration('color', ['blue']);
     * handler.endRuleset();
     *
     * // At the end of a stylesheet.
     * handler.endStylesheet();
     * </pre>
     * When errors are encountered, the parser drops the useless tokens and
     * attempts to resume parsing.
     *
     * @param {string} cssText CSS3 content to parse as a stylesheet.
     * @param {Object} handler An object like <pre>{
     *   startStylesheet: function () { ... },
     *   endStylesheet: function () { ... },
     *   startAtrule: function (atIdent, headerArray) { ... },
     *   endAtrule: function () { ... },
     *   startBlock: function () { ... },
     *   endBlock: function () { ... },
     *   startRuleset: function (selectorArray) { ... },
     *   endRuleset: function () { ... },
     *   declaration: function (property, valueArray) { ... },
     * }</pre>
     */
    var parseCssStylesheet;

    /**
     * parseCssDeclarations parses a run of declaration productions as seen in the
     * body of the HTML5 {@code style} attribute.
     *
     * @param {string} cssText CSS3 content to parse as a run of declarations.
     * @param {Object} handler An object like <pre>{
     *   declaration: function (property, valueArray) { ... },
     * }</pre>
     */
    var parseCssDeclarations;

    (function () {
      // stylesheet  : [ CDO | CDC | S | statement ]*;
      parseCssStylesheet = function(cssText, handler) {
        var toks = lexCss(cssText);
        if (handler.startStylesheet) { handler.startStylesheet(); }
        for (var i = 0, n = toks.length; i < n;) {
          // CDO and CDC ("<!--" and "-->") are converted to space by the lexer.
          i = toks[i] === ' ' ? i+1 : statement(toks, i, n, handler);
        }
        if (handler.endStylesheet) { handler.endStylesheet(); }
      };

      // statement   : ruleset | at-rule;
      function statement(toks, i, n, handler) {
        if (i < n) {
          var tok = toks[i];
          if (tok.charAt(0) === '@') {
            return atrule(toks, i, n, handler, true);
          } else {
            return ruleset(toks, i, n, handler);
          }
        } else {
          return i;
        }
      }

      // at-rule     : ATKEYWORD S* any* [ block | ';' S* ];
      function atrule(toks, i, n, handler, blockok) {
        var start = i++;
        while (i < n && toks[i] !== '{' && toks[i] !== ';') {
          ++i;
        }
        if (i < n && (blockok || toks[i] === ';')) {
          var s = start+1, e = i;
          if (s < n && toks[s] === ' ') { ++s; }
          if (e > s && toks[e-1] === ' ') { --e; }
          if (handler.startAtrule) {
            handler.startAtrule(toks[start].toLowerCase(), toks.slice(s, e));
          }
          i = (toks[i] === '{')
              ? block(toks, i, n, handler)
              : i+1;  // Skip over ';'
          if (handler.endAtrule) {
            handler.endAtrule();
          }
        }
        // Else we reached end of input or are missing a semicolon.
        // Drop the rule on the floor.
        return i;
      }

      // block       : '{' S* [ any | block | ATKEYWORD S* | ';' S* ]* '}' S*;
       // Assumes the leading '{' has been verified by callers.
      function block(toks, i, n, handler) {
        ++i; //  skip over '{'
        if (handler.startBlock) { handler.startBlock(); }
        while (i < n) {
          var ch = toks[i].charAt(0);
          if (ch == '}') {
            ++i;
            break;
          }
          if (ch === ' ' || ch === ';') {
            i = i+1;
          } else if (ch === '@') {
            i = atrule(toks, i, n, handler, false);
          } else if (ch === '{') {
            i = block(toks, i, n, handler);
          } else {
            // Instead of using (any* block) to subsume ruleset we allow either
            // blocks or rulesets with a non-blank selector.
            // This is more restrictive but does not require atrule specific
            // parse tree fixup to realize that the contents of the block in
            //    @media print { ... }
            // is a ruleset.  We just don't care about any block carrying at-rules
            // whose body content is not ruleset content.
            i = ruleset(toks, i, n, handler);
          }
        }
        if (handler.endBlock) { handler.endBlock(); }
        return i;
      }

      // ruleset    : selector? '{' S* declaration? [ ';' S* declaration? ]* '}' S*;
      function ruleset(toks, i, n, handler) {
        // toks[s:e] are the selector tokens including internal whitespace.
        var s = i, e = selector(toks, i, n, true);
        if (e < 0) {
          // Skip malformed content per selector calling convention.
          e = ~e;
          // Make sure we skip at least one token.
          return i === e ? e+1 : e;
        }
        i = e;
        // Don't include any trailing space in the selector slice.
        if (e > s && toks[e-1] === ' ') { --e; }
        var tok = toks[i];
        ++i;  // Skip over '{'
        if (tok !== '{') {
          // Skips past the '{' when there is a malformed input.
          return i;
        }
        if (handler.startRuleset) {
          handler.startRuleset(toks.slice(s, e));
        }
        while (i < n) {
          tok = toks[i];
          if (tok === '}') {
            ++i;
            break;
          }
          if (tok === ' ') {
            i = i+1;
          } else {
            i = declaration(toks, i, n, handler);
          }
        }
        if (handler.endRuleset) {
          handler.endRuleset();
        }
        return i < n ? i+1 : i;
      }

      // selector    : any+;
      // any         : [ IDENT | NUMBER | PERCENTAGE | DIMENSION | STRING
      //               | DELIM | URI | HASH | UNICODE-RANGE | INCLUDES
      //               | FUNCTION S* any* ')' | DASHMATCH | '(' S* any* ')'
      //               | '[' S* any* ']' ] S*;
      // A negative return value, rv, indicates the selector was malformed and
      // the index at which we stopped is ~rv.
      function selector(toks, i, n, allowSemi) {
        // The definition of any above can be summed up as
        //   "any run of token except ('[', ']', '(', ')', ':', ';', '{', '}')
        //    or nested runs of parenthesized tokens or square bracketed tokens".
        // Spaces are significant in the selector.
        // Selector is used as (selector?) so the below looks for (any*) for
        // simplicity.
        var tok;
        // Keeping a stack pointer actually causes this to minify better since
        // ".length" and ".push" are a lo of chars.
        var brackets = [], stackLast = -1;
        for (;i < n; ++i) {
          tok = toks[i].charAt(0);
          if (tok === '[' || tok === '(') {
            brackets[++stackLast] = tok;
          } else if ((tok === ']' && brackets[stackLast] === '[') ||
                     (tok === ')' && brackets[stackLast] === '(')) {
            --stackLast;
          } else if (tok === '{' || tok === '}' || tok === ';' || tok === '@'
                     || (tok === ':' && !allowSemi)) {
            break;
          }
        }
        if (stackLast >= 0) {
          // Returns the bitwise inverse of i+1 to indicate an error in the
          // token stream so that clients can ignore it.
          i = ~(i+1);
        }
        return i;
      }

      var ident = /^-?[a-z]/i;

      // declaration : property ':' S* value;
      // property    : IDENT S*;
      // value       : [ any | block | ATKEYWORD S* ]+;
      function declaration(toks, i, n, handler) {
        var property = toks[i++];
        if (!ident.test(property)) {
          return i+1;  // skip one token.
        }
        var tok;
        if (i < n && toks[i] === ' ') { ++i; }
        if (i == n || toks[i] !== ':') {
          // skip tokens to next semi or close bracket.
          while (i < n && (tok = toks[i]) !== ';' && tok !== '}') { ++i; }
          return i;
        }
        ++i;
        if (i < n && toks[i] === ' ') { ++i; }

        // None of the rules we care about want atrules or blocks in value, so
        // we look for any+ but that is the same as selector but not zero-length.
        // This gets us the benefit of not emitting any value with mismatched
        // brackets.
        var s = i, e = selector(toks, i, n, false);
        if (e < 0) {
          // Skip malformed content per selector calling convention.
          e = ~e;
        } else {
          var value = [], valuelen = 0;
          for (var j = s; j < e; ++j) {
            tok = toks[j];
            if (tok !== ' ') {
              value[valuelen++] = tok;
            }
          }
          // One of the following is now true:
          // (1) e is flush with the end of the tokens as in <... style="x:y">.
          // (2) tok[e] points to a ';' in which case we need to consume the semi.
          // (3) tok[e] points to a '}' in which case we don't consume it.
          // (4) else there is bogus unparsed value content at toks[e:].
          // Allow declaration flush with end for style attr body.
          if (e < n) {  // 2, 3, or 4
            do {
              tok = toks[e];
              if (tok === ';' || tok === '}') { break; }
              // Don't emit the property if there is questionable trailing content.
              valuelen = 0;
            } while (++e < n);
            if (tok === ';') {
              ++e;
            }
          }
          if (valuelen && handler.declaration) {
            // TODO: coerce non-keyword ident tokens to quoted strings.
            handler.declaration(property.toLowerCase(), value);
          }
        }
        return e;
      }

      parseCssDeclarations = function(cssText, handler) {
        var toks = lexCss(cssText);
        for (var i = 0, n = toks.length; i < n;) {
          i = toks[i] !== ' ' ? declaration(toks, i, n, handler) : i+1;
        }
      };
    })();

    // Exports for closure compiler.
    if (typeof window !== 'undefined') {
      window['parseCssStylesheet'] = parseCssStylesheet;
      window['parseCssDeclarations'] = parseCssDeclarations;
    }
    /*!
     * OpenUI5
     * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
     * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
     */
    // Based on coding from the HTML4 Sanitizer by Google Inc.
    // The HTML Attributes and ELements were reorganized according to the actual HTML5 specification
    // from the W3C. All types and flags were reviewed again as accurately as possible with HTML4 only
    // elements removed, you can still see them as comments. All rules which are new or changed from the
    // old HTML4 file are also marked "new" within the comment. The comments also state which attributes
    // and elements are assigned to respective types and flags. All rules which were not 100% clear were
    // analyzed in a way of similarity, so for example "audio" and "video" content behaves like images etc.
    // URIEFFECTS state if a URL is loaded inplace within a tag where the actual document is in control
    // of what type of content is loaded like "image" or if a new document is loaded like with "a href".
    // LOADERTYPES state if content is loaded as sandboxed which means it is loaded within a specific
    // surroundig player like with video content for example or if it is loaded freely without restrictions.
    // @overrides window
    // @provides html4

    var html4 = {};
    html4.atype = {
      NONE: 0,
      URI: 1, //action, cite, data, href, icon, manifest, poster, src
      URI_FRAGMENT: 11, //usemap
      SCRIPT: 2, //all event handlers
      STYLE: 3, //style
      ID: 4, //id
      IDREF: 5, //for
      IDREFS: 6, //headers
      GLOBAL_NAME: 7, //name of form, iframe, img, map, meta
      LOCAL_NAME: 8, //name of button, fieldset, input, keygen, object, output, param, select, textarea
      CLASSES: 9, //class
      FRAME_TARGET: 10 //formtarget, srcdoc, target
    };

    html4.ATTRIBS = {
    	'*::accesskey': 0, //NONE
    	'*::class': 9, //CLASSES
    	'*::contenteditable': 0, //NONE new
    	'*::contextmenu': 0, //NONE new
    	'*::dir': 0, //NONE
    	'*::draggable': 0, //NONE new
    	'*::dropzone': 0, //NONE new
    	'*::hidden': 0, //NONE new
    	'*::id': 4, //ID
    	'*::lang': 0, //NONE
    	'*::onabort': 2, //SCRIPT new
    	'*::onblur': 2, //SCRIPT new
    	'*::oncanplay': 2, //SCRIPT new
    	'*::oncanplaythrough': 2, //SCRIPT new
    	'*::onchange': 2, //SCRIPT new
    	'*::onclick': 2, //SCRIPT
    	'*::oncontextmenu': 2, //SCRIPT new
    	'*::oncuechange': 2, //SCRIPT new
    	'*::ondblclick': 2, //SCRIPT
    	'*::ondrag': 2, //SCRIPT new
    	'*::ondragend': 2, //SCRIPT new
    	'*::ondragenter': 2, //SCRIPT new
    	'*::ondragleave': 2, //SCRIPT new
    	'*::ondragover': 2, //SCRIPT new
    	'*::ondragstart': 2, //SCRIPT new
    	'*::ondrop': 2, //SCRIPT new
    	'*::ondurationchange': 2, //SCRIPT new
    	'*::onemptied': 2, //SCRIPT new
    	'*::onended': 2, //SCRIPT new
    	'*::onerror': 2, //SCRIPT new
    	'*::onfocus': 2, //SCRIPT new
    	'*::oninput': 2, //SCRIPT new
    	'*::oninvalid':	 2, //SCRIPT new
    	'*::onkeydown': 2, //SCRIPT
    	'*::onkeypress': 2, //SCRIPT
    	'*::onkeyup': 2, //SCRIPT
    	'*::onload': 2, //SCRIPT
    	'*::onloadeddata': 2, //SCRIPT new
    	'*::onloadedmetadata': 2, //SCRIPT new
    	'*::onloadstart': 2, //SCRIPT new
    	'*::onmousedown': 2, //SCRIPT
    	'*::onmousemove': 2, //SCRIPT
    	'*::onmouseout': 2, //SCRIPT
    	'*::onmouseover': 2, //SCRIPT
    	'*::onmouseup': 2, //SCRIPT
    	'*::onmousewheel': 2, //SCRIPT new
    	'*::onpause': 2, //SCRIPT new
    	'*::onplay': 2, //SCRIPT new
    	'*::onplaying': 2, //SCRIPT new
    	'*::onprogress': 2, //SCRIPT new
    	'*::onratechange': 2, //SCRIPT new
    	'*::onreadystatechange': 2, //SCRIPT new
    	'*::onreset': 2, //SCRIPT new
    	'*::onscroll': 2, //SCRIPT new
    	'*::onseeked': 2, //SCRIPT new
    	'*::onseeking': 2, //SCRIPT new
    	'*::onselect': 2, //SCRIPT new
    	'*::onshow': 2, //SCRIPT new
    	'*::onstalled': 2, //SCRIPT new
    	'*::onsubmit': 2, //SCRIPT new
    	'*::onsuspend': 2, //SCRIPT new
    	'*::ontimeupdate': 2, //SCRIPT new
    	'*::onvolumechange': 2, //SCRIPT new
    	'*::onwaiting': 2, //SCRIPT new
    	'*::spellcheck': 0, //NONE new
    	'*::style': 3, //STYLE
    	'*::tabindex': 0, //NONE
    	'*::title': 0, //NONE
    //---------------------  'a::accesskey': 0, moved to global
    //---------------------  'a::coords': 0,
    	'a::href': 1, //URI
    	'a::hreflang': 0, //NONE
    	'a::media': 0, //NONE new
    //---------------------  'a::name': 7,
    //---------------------	 'a::onblur': 2, moved to global
    //---------------------	 'a::onfocus': 2, moved to global
    	'a::rel': 0, //NONE
    //---------------------  'a::rev': 0,
    //---------------------  'a::shape': 0,
    //---------------------  'a::tabindex': 0, moved to global
    	'a::target': 0, //changed to "0" because of CSN 1918585 2013, original value was 10 FRAME_TARGET but it seems uncritical
    	'a::type': 0, //NONE
    //---------------------  'area::accesskey': 0, moved to global
    	'area::alt': 0, //NONE
    	'area::coords': 0, //NONE
    	'area::href': 1, //URI
    	'area::hreflang': 0, //NONE new
    	'area::media': 0, //NONE new
    //---------------------  'area::nohref': 0,
    //---------------------	 'area::onblur': 2, moved to global
    //---------------------	 'area::onfocus': 2, moved to global
    	'area::rel': 0, //NONE new
    	'area::shape': 0, //NONE
    //---------------------  'area::tabindex': 0, moved to global
    	'area::target': 10, //FRAME_TARGET
    	'area::type': 0, //NONE
    	'audio::autoplay': 0, //NONE new
    	'audio::controls': 0, //NONE new
    	'audio::loop': 0, //NONE new
    	'audio::mediagroup': 0, //NONE new
    	'audio::preload': 0, //NONE new
    	'audio::src': 1, //URI
    	'base::href': 1, //URI
    	'base::target': 10, //FRAME_TARGET
    //---------------------  'bdo::dir': 0,
    	'blockquote::cite': 1, //URI
    	'body::onafterprint': 2, //SCRIPT new
    	'body::onbeforeprint': 2, //SCRIPT new
    	'body::onbeforeunload': 2, //SCRIPT new
    	'body::onblur': 2, //SCRIPT new
    	'body::onerror': 2, //SCRIPT new
    	'body::onfocus': 2, //SCRIPT new
    	'body::onhashchange': 2, //SCRIPT new
    	'body::onload': 2, //SCRIPT new
    	'body::onmessage': 2, //SCRIPT new
    	'body::onoffline': 2, //SCRIPT new
    	'body::ononline': 2, //SCRIPT new
    	'body::onpagehide': 2, //SCRIPT new
    	'body::onpageshow': 2, //SCRIPT new
    	'body::onpopstate': 2, //SCRIPT new
    	'body::onredo': 2, //SCRIPT new
    	'body::onresize': 2, //SCRIPT new
    	'body::onscroll': 2, //SCRIPT new
    	'body::onstorage': 2, //SCRIPT new
    	'body::onundo': 2, //SCRIPT new
    	'body::onunload': 2, //SCRIPT new
    //---------------------  'br::clear': 0,
    //---------------------  'button::accesskey': 0, moved to global
    	'button::autofocus': 0, //NONE new
    	'button::disabled': 0, //NONE
    	'button::form': 0, //NONE new
    	'button::formaction': 1, //URI new
    	'button::formenctype': 0, //NONE new
    	'button::formmethod': 0, //NONE new
    	'button::formnovalidate': 0, //NONE new
    	'button::formtarget': 10, //FRAME_TARGET new
    	'button::name': 8, //LOCAL_NAME
    //---------------------	 'button::onblur': 2,
    //---------------------	 'button::onfocus': 2,
    //---------------------  'button::tabindex': 0, moved to global
    	'button::type': 0, //NONE
    	'button::value': 0, //NONE
    	'canvas::height': 0, //NONE
    	'canvas::width': 0, //NONE
    //---------------------	 'caption::align': 0,
    //---------------------  'col::align': 0,
    //---------------------	 'col::char': 0,
    //---------------------	 'col::charoff': 0,
    	'col::span': 0, //NONE
    //---------------------	 'col::valign': 0,
    //---------------------	 'col::width': 0,
    //---------------------	 'colgroup::align': 0,
    //---------------------	 'colgroup::char': 0,
    //---------------------	 'colgroup::charoff': 0,
    	'colgroup::span': 0, //NONE
    //---------------------	 'colgroup::valign': 0,
    //---------------------	 'colgroup::width': 0,
    	'command::checked': 0, //NONE new
    	'command::disabled': 0, //NONE new
    	'command::icon': 1, //URI new
    	'command::label': 0, //NONE new
    	'command::radiogroup': 0, //NONE new
    	'command::type': 0, //NONE new
    	'del::cite': 1, //URI
    	'del::datetime': 0, //NONE
    	'details::open': 0, //NONE new
    //---------------------	 'dir::compact': 0,
    //---------------------	 'div::align': 0,
    //---------------------	 'dl::compact': 0,
    	'embed::height': 0, //NONE new
    	'embed::src': 1, //URI new
    	'embed::type': 0, //NONE new
    	'embed::width': 0, //NONE new
    	'fieldset::disabled': 0, //NONE new
    	'fieldset::form': 0, //NONE new
    	'fieldset::name': 8, //LOCAL_NAME new
    //---------------------	 'font::color': 0,
    //---------------------	 'font::face': 0,
    //---------------------	 'font::size': 0,
    //---------------------	 'form::accept': 0,
    	'form::accept-charset': 0, //NONE
    	'form::action': 1, //URI
    	'form::autocomplete': 0, //NONE
    	'form::enctype': 0, //NONE
    	'form::method': 0, //NONE
    	'form::name': 7, //GLOBAL_NAME
    	'form::novalidate': 0, //NONE new
    //---------------------	 'form::onreset': 2,
    //---------------------	 'form::onsubmit': 2,
    	'form::target': 10, //FRAME_TARGET
    //---------------------	 'h1::align': 0,
    //---------------------	 'h2::align': 0,
    //---------------------	 'h3::align': 0,
    //---------------------	 'h4::align': 0,
    //---------------------	 'h5::align': 0,
    //---------------------	 'h6::align': 0,
    //---------------------	 'hr::align': 0,
    //---------------------	 'hr::noshade': 0,
    //---------------------	 'hr::size': 0,
    //---------------------	 'hr::width': 0,
    	'html:: manifest': 1, //URI new
    //---------------------	 'iframe::align': 0,
    //---------------------	'iframe::frameborder': 0,
    	'iframe::height': 0, //NONE
    //---------------------	 'iframe::marginheight': 0,
    //---------------------	 'iframe::marginwidth': 0,
    	'iframe::name': 7, //GLOBAL_NAME new
    	'iframe::sandbox': 0, //NONE new
    	'iframe::seamless': 0, //NONE new
    	'iframe::src': 1, //URI new
    	'iframe::srcdoc': 10, //FRAME_TARGET new
    	'iframe::width': 0, //NONE
    //---------------------	 'img::align': 0,
    	'img::alt': 0, //NONE
    //---------------------	 'img::border': 0,
    	'img::height': 0, //NONE
    //---------------------	 'img::hspace': 0,
    	'img::ismap': 0, //NONE
    	'img::name': 7, //GLOBAL_NAME
    	'img::src': 1, //URI
    	'img::usemap': 11, //URI_FRAGMENT
    //---------------------	'img::vspace': 0,
    	'img::width': 0, //NONE
    	'input::accept': 0, //NONE
    //---------------------	 'input::accesskey': 0, moved to global
    //---------------------	 'input::align': 0,
    	'input::alt': 0, //NONE
    	'input::autocomplete': 0, //NONE
    	'input::autofocus': 0, //NONE new
    	'input::checked': 0, //NONE
    	'input::dirname': 0, //NONE new
    	'input::disabled': 0, //NONE
    	'input::form': 0, //NONE new
    	'input::formaction': 1, //URI new
    	'input::formenctype': 0, //NONE new
    	'input::formmethod': 0, //NONE new
    	'input::formnovalidate': 0, //NONE new
    	'input::formtarget': 10, //FRAME_TARGET new
    	'input::height': 0, //NONE new
    //---------------------	 'input::ismap': 0,
    	'input::list': 0, //NONE new
    	'input::max': 0, //NONE new
    	'input::maxlength': 0, //NONE
    	'input::min': 0, //NONE new
    	'input::multiple': 0, //NONE new
    	'input::name': 8, //LOCAL_NAME
    //---------------------	 'input::onblur': 2,
    //---------------------	 'input::onchange': 2,
    //---------------------	 'input::onfocus': 2,
    //---------------------	 'input::onselect': 2,
    	'input::pattern': 0, //NONE new
    	'input::placeholder': 0, //NONE new
    	'input::readonly': 0, //NONE
    	'input::required': 0, //NONE new
    	'input::step': 0, //NONE new
    	'input::size': 0, //NONE
    	'input::src': 1, //URI
    //---------------------  'input::tabindex': 0, moved to global
    	'input::type': 0, //NONE
    //---------------------	 'input::usemap': 11,
    	'input::value': 0, //NONE
    	'input::width': 0, //NONE new
    	'ins::cite': 1, //URI
    	'ins::datetime': 0, //NONE
    //---------------------  'label::accesskey': 0, moved to global
    	'keygen::autofocus': 0, //NONE new
    	'keygen::challenge': 0, //NONE new
    	'keygen::disabled': 0, //NONE new
    	'keygen::form': 0, //NONE new
    	'keygen::keytype': 0, //NONE new
    	'keygen::name': 8, //LOCAL_NAME new
    	'label::for': 5, //IDREF
    	'label::form': 0, //NONE new
    //---------------------	 'label::onblur': 2,
    //---------------------	 'label::onfocus': 2,
    //---------------------  'legend::accesskey': 0, moved to global
    //---------------------  'legend::align': 0,
    //---------------------  'li::type': 0,
    	'link::href': 1, //URI new
    	'link::hreflang': 0, //NONE new
    	'link::media': 0, //NONE new
    	'link::rel': 0, //NONE new
    	'link::sizes': 0, //NONE new
    	'link::type': 0, //NONE new
    	'li::value': 0, //NONE new
    	'map::name': 7, //GLOBAL_NAME
    //---------------------  'menu::compact': 0,
    	'menu::label': 0, //NONE new
    	'menu::type': 0, //NONE new
    	'meta::charset': 0, //NONE new
    	'meta::content': 0, //NONE new
    	'meta::http-equiv': 0, //NONE new
    	'meta::name': 7, //GLOBAL_NAME new
    	'meter::form': 0, //NONE new
    	'meter::high': 0, //NONE new
    	'meter::low': 0, //NONE new
    	'meter::max': 0, //NONE new
    	'meter::min': 0, //NONE new
    	'meter::optimum': 0, //NONE new
    	'meter::value': 0, //NONE new
    	'object::data': 1, //URI new
    	'object::form': 0, //NONE new
    	'object::height': 0, //NONE new
    	'object::name': 8, //LOCAL_NAME new
    	'object::type': 0, //NONE new
    	'object::usemap': 11, //URI_FRAGMENT new
    	'object::width': 0, //NONE new
    //---------------------  'ol::compact': 0,
    	'ol::reversed': 0, //NONE new
    	'ol::start': 0, //NONE
    //---------------------  'ol::type': 0,
    	'optgroup::disabled': 0, //NONE
    	'optgroup::label': 0, //NONE
    	'option::disabled': 0, //NONE
    	'option::label': 0, //NONE
    	'option::selected': 0, //NONE
    	'option::value': 0, //NONE
    	'output::for': 5, //IDREF new
    	'output::form': 0, //NONE new
    	'output::name': 8, //LOCAL_NAME new
    //---------------------  'p::align': 0,
    	'param::name': 8, //LOCAL_NAME new
    	'param::value': 0, //NONE new
    	'progress::form': 0, //NONE new
    	'progress::max': 0, //NONE new
    	'progress::value': 0, //NONE new
    //---------------------  'pre::width': 0,
    	'q::cite': 1, //URI
    	'script::async': 0, //NONE new
    	'script::charset': 0, //NONE new
    	'script::defer': 0, //NONE new
    	'script::src': 1, //URI new
    	'script::type': 0, //NONE new
    	'select::autofocus': 0, //NONE new
    	'select::disabled': 0, //NONE
    	'select::form': 0, //NONE new
    	'select::multiple': 0, //NONE
    	'select::name': 8, //LOCAL_NAME
    //---------------------	 'select::onblur': 2,
    //---------------------	 'select::onchange': 2,
    //---------------------	 'select::onfocus': 2,
    	'select::required': 0, //NONE new
    	'select::size': 0, //NONE
    //---------------------  'select::tabindex': 0, moved to global
    	'source::media': 0, //NONE new
    	'source::src': 1, //URI new
    	'source::type': 0, //NONE new
    	'style::media': 0, //NONE new
    	'style::scoped': 0, //NONE new
    	'style::type': 0, //NONE new
    //---------------------	 'table::align': 0,
    //---------------------	 'table::bgcolor': 0,
    	'table::border': 0, //NONE
    //---------------------	 'table::cellpadding': 0,
    //---------------------	 'table::cellspacing': 0,
    //---------------------	 'table::frame': 0,
    //---------------------	 'table::rules': 0,
    //---------------------	 'table::summary': 0,
    //---------------------	 'table::width': 0,
    //---------------------	 'tbody::align': 0,
    //---------------------	 'tbody::char': 0,
    //---------------------	 'tbody::charoff': 0,
    //---------------------	 'tbody::valign': 0,
    //---------------------	 'td::abbr': 0,
    //---------------------	 'td::align': 0,
    //---------------------	 'td::axis': 0,
    //---------------------	 'td::bgcolor': 0,
    //---------------------	 'td::char': 0,
    //---------------------	 'td::charoff': 0,
    	'td::colspan': 0, //NONE
    	'td::headers': 6, //IDREFS
    //---------------------	 'td::height': 0,
    //---------------------	 'td::nowrap': 0,
    	'td::rowspan': 0, //NONE
    //---------------------	 'td::scope': 0,
    //---------------------  'td::valign': 0,
    //---------------------	 'td::width': 0,
    //---------------------  'textarea::accesskey': 0, moved to global
    	'textarea::autofocus': 0, //NONE new
    	'textarea::cols': 0, //NONE
    	'textarea::disabled': 0, //NONE
    	'textarea::form': 0, //NONE new
    	'textarea::maxlength': 0, //NONE new
    	'textarea::name': 8, //LOCAL_NAME
    //---------------------	 'textarea::onblur': 2,
    //---------------------	 'textarea::onchange': 2,
    //---------------------	 'textarea::onfocus': 2,
    //---------------------	 'textarea::onselect': 2,
    	'textarea::placeholder': 0, //NONE new
    	'textarea::readonly': 0, //NONE
    	'textarea::required': 0, //NONE new
    	'textarea::rows': 0, //NONE
    	'textarea::wrap': 0, //NONE new
    //---------------------  'textarea::tabindex': 0, moved to global
    //---------------------	 'tfoot::align': 0,
    //---------------------	 'tfoot::char': 0,
    //---------------------	 'tfoot::charoff': 0,
    //---------------------	 'tfoot::valign': 0,
    //---------------------	 'th::abbr': 0,
    //---------------------	 'th::align': 0,
    //---------------------	 'th::axis': 0,
    //---------------------	 'th::bgcolor': 0,
    //---------------------	 'th::char': 0,
    //---------------------	 'th::charoff': 0,
    	'th::colspan': 0, //NONE
    	'th::headers': 6, //IDREFS
    //---------------------	 'th::height': 0,
    //---------------------	 'th::nowrap': 0,
    	'th::rowspan': 0, //NONE
    	'th::scope': 0, //NONE
    //---------------------	 'th::valign': 0,
    //---------------------	 'th::width': 0,
    //---------------------	 'thead::align': 0,
    //---------------------	 'thead::char': 0,
    //---------------------	 'thead::charoff': 0,
    //---------------------	 'thead::valign': 0,
    	'time::datetime': 0, //NONE new
    	'time::pubdate': 0, //NONE new
    //---------------------	 'tr::align': 0,
    //---------------------	 'tr::bgcolor': 0,
    //---------------------	 'tr::char': 0,
    //---------------------	 'tr::charoff': 0,
    //---------------------	 'tr::valign': 0,
    	'track::default': 0, //NONE new
    	'track::kind': 0, //NONE new
    	'track::label': 0, //NONE new
    	'track::src': 1, //URI new
    	'track::srclang': 0, //NONE new
    //---------------------	 'ul::compact': 0,
    //---------------------	 'ul::type': 0
    	'video::autoplay': 0, //NONE new
    	'video::controls': 0, //NONE new
    	'video::height': 0, //NONE new
    	'video::loop': 0, //NONE new
    	'video::mediagroup': 0, //NONE new
    	'video::poster': 1, //URI new
    	'video::preload': 0, //NONE new
    	'video::src': 1, //URI new
    	'video::width': 0 //NONE new
    };
    html4.eflags = {
    	OPTIONAL_ENDTAG: 1,
    	EMPTY: 2,
    	CDATA: 4,
    	RCDATA: 8,
    	UNSAFE: 16,
    	FOLDABLE: 32,
    	SCRIPT: 64,
    	STYLE: 128
    };
    html4.ELEMENTS = {
    	'a': 0,
    	'abbr': 0,
    //---------------------	 'acronym': 0,
    	'address': 0,
    //---------------------	 'applet': 16,
    	'area': 2, //EMPTY
    	'article': 0, //new
    	'aside': 0, //new
    	'audio': 0, //new
    	'b': 0,
    	'base': 18, //EMPTY, UNSAFE
    //---------------------	 'basefont': 18,
    	'bdi': 0, //new
    	'bdo': 0,
    //---------------------	 'big': 0,
    	'blockquote': 0,
    	'body': 49, //OPTIONAL_ENDTAG, UNSAFE, FOLDABLE
    	'br': 2, //EMPTY
    	'button': 0,
    	'canvas': 0,
    	'caption': 0,
    //---------------------	 'center': 0,
    	'cite': 0,
    	'code': 0,
    	'col': 2, //EMPTY
    	'colgroup': 1, //OPTIONAL_ENDTAG
    	'command': 2, //EMPTY new
    	'datalist': 0, //new
    	'dd': 1, //OPTIONAL_ENDTAG
    	'del': 0,
    	'details': 0, //new
    	'dfn': 0,
    //---------------------	 'dir': 0,
    	'div': 0,
    	'dl': 0,
    	'dt': 1, //OPTIONAL_ENDTAG
    	'em': 0,
    	'embed': 18, //EMPTY, UNSAFE new
    	'fieldset': 0,
    	'figcaption': 0, //new
    	'figure': 0, //new
    //---------------------	 'font': 0,
    	'footer': 0, //new
    	'form': 0,
    //---------------------	 'frame': 18,
    //---------------------	 'frameset': 16,
    	'h1': 0,
    	'h2': 0,
    	'h3': 0,
    	'h4': 0,
    	'h5': 0,
    	'h6': 0,
    	'head': 49, //OPTIONAL_ENDTAG, UNSAFE, FOLDABLE
    	'header': 0, //new
    	'hgroup': 0, //new
    	'hr': 2, //EMPTY
    	'html': 49, //OPTIONAL_ENDTAG, UNSAFE, FOLDABLE
    	'i': 0,
    	'iframe': 0, //new
    	'img': 2,//EMPTY
    	'input': 2, //EMPTY
    	'ins': 0,
    //---------------------	 'isindex': 18,
    	'kbd': 0,
    	'keygen': 2, //EMPTY new
    	'label': 0,
    	'legend': 0,
    	'li': 1, //OPTIONAL_ENDTAG
    	'link': 18, //EMPTY, UNSAFE
    	'map': 0,
    	'mark': 0, //new
    	'menu': 0,
    	'meta': 18, //EMPTY, UNSAFE
    	'meter': 0, //new
    	'nav': 0,
    //---------------------	 'nobr': 0,
    //---------------------	 'noembed': 4,
    //---------------------	 'noframes': 20,
    	'noscript': 20, //CDATA, UNSAFE
    	'object': 16, //UNSAFE
    	'ol': 0,
    	'optgroup': 1, //OPTIONAL_ENDTAG new !!!!vorher 0
    	'option': 1, //OPTIONAL_ENDTAG
    	'output': 0, //new
    	'p': 1, //OPTIONAL_ENDTAG
    	'param': 18, //EMPTY, UNSAFE
    	'pre': 0,
    	'progress': 0, //new
    	'q': 0,
    	'rp': 1, //OPTIONAL_ENDTAG new
    	'rt': 1, //OPTIONAL_ENDTAG new
    	'ruby': 0, //new
    	's': 0,
    	'samp': 0,
    	'script': 84, //CDATA, UNSAFE, SCRIPT
    	'section': 0, //new
    	'select': 0,
    	'small': 0,
    	'source': 2, //EMPTY new
    	'span': 0,
    //---------------------	 'strike': 0,
    	'strong': 0,
    	'style': 148, //CDATA, UNSAFE, STYLE
    	'sub': 0,
    	'summary': 0, //new
    	'sup': 0,
    	'table': 0,
    	'tbody': 1, //OPTIONAL_ENDTAG
    	'td': 1, //OPTIONAL_ENDTAG
    	'textarea': 8, //RCDATA
    	'tfoot': 1, //OPTIONAL_ENDTAG
    	'th': 1, //OPTIONAL_ENDTAG
    	'thead': 1, //OPTIONAL_ENDTAG
    	'time': 0, //new
    	'title': 24, //RCDATA, UNSAFE
    	'tr': 1, //OPTIONAL_ENDTAG
    	'track': 2, //EMPTY new
    //---------------------	 'tt': 0,
    	'u': 0,
    	'ul': 0,
    	'var': 0,
    	'video': 0, //new
    	'wbr': 2 //EMPTY new
    };
    html4.ueffects = {
    	NOT_LOADED: 0,
    	SAME_DOCUMENT: 1,
    	NEW_DOCUMENT: 2
    };
    html4.URIEFFECTS = {
    	'a::href': 2, //NEW_DOCUMENT
    	'area::href': 2, //NEW_DOCUMENT
    	'audio::src': 1, //SAME_DOCUMENT new
    	'base::href':2, //NEW_DOCUMENT new
    	'blockquote::cite': 0, //NOT_LOADED
    //---------------------	 'body::background': 1,
    	'button::formaction': 2, //NEW_DOCUMENT new
    	'command::icon': 1, //SAME_DOCUMENT new
    	'del::cite': 0, //NOT_LOADED
    	'embed::src': 1, //SAME_DOCUMENT new
    	'form::action': 2, //NEW_DOCUMENT
    	'html:: manifest': 1, //SAME_DOCUMENT new
    	'iframe::src': 1, //SAME_DOCUMENT new
    	'img::src': 1, //SAME_DOCUMENT
    	'input::formaction': 2, //NEW_DOCUMENT new
    	'input::src': 1, //SAME_DOCUMENT
    	'ins::cite': 0, //NOT_LOADED
    	'link::href': 2, //NEW_DOCUMENT new
    	'object::data': 1, //SAME_DOCUMENT new
    	'q::cite': 0, //NOT_LOADED
    	'script::src': 1, //SAME_DOCUMENT new
    	'source::src': 1, //SAME_DOCUMENT new
    	'track::src': 1, //SAME_DOCUMENT new
    	'video::poster': 1, //SAME_DOCUMENT new
    	'video::src': 1 //SAME_DOCUMENT new
    };
    html4.ltypes = {
    	UNSANDBOXED: 2,
    	SANDBOXED: 1,
    	DATA: 0
    };
    html4.LOADERTYPES = {
    	'a::href': 2, //UNSANDBOXED
    	'area::href': 2, //UNSANDBOXED
    	'audio::src': 1, //SANDBOXED new
    	'base::href': 2, //UNSANDBOXED new
    	'blockquote::cite': 2, //UNSANDBOXED
    //---------------------	 'body::background': 1,
    	'button::formaction': 2, //UNSANDBOXED new
    	'command::icon': 1, //SANDBOXED new
    	'del::cite': 2, //UNSANDBOXED
    	'embed::src': 1, //SANDBOXED new
    	'form::action': 2, //UNSANDBOXED
    	'html:: manifest': 1, //SANDBOXED new
    	'iframe::src': 1, //SANDBOXED new
    	'img::src': 1, //SANDBOXED
    	'input::formaction': 2, //UNSANDBOXED new
    	'input::src': 1, //SANDBOXED
    	'ins::cite': 2, //UNSANDBOXED
    	'link::href': 2, //UNSANDBOXED new
    	'object::data': 0, //DATA new
    	'q::cite': 2, //UNSANDBOXED
    	'script::src': 1, //SANDBOXED new
    	'source::src': 1, //SANDBOXED new
    	'track::src': 1, //SANDBOXED new
    	'video::poster': 1, //SANDBOXED new
    	'video::src': 1 //SANDBOXED new
    };if (typeof window !== 'undefined') {
    	window['html4'] = html4;
    }// Copyright (C) 2006 Google Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.

    /**
     * @fileoverview
     * An HTML sanitizer that can satisfy a variety of security policies.
     *
     * <p>
     * The HTML sanitizer is built around a SAX parser and HTML element and
     * attributes schemas.
     *
     * If the cssparser is loaded, inline styles are sanitized using the
     * css property and value schemas.  Else they are remove during
     * sanitization.
     *
     * If it exists, uses parseCssDeclarations, sanitizeCssProperty,  cssSchema
     *
     * @author mikesamuel@gmail.com
     * @author jasvir@gmail.com
     * \@requires html4
     * \@overrides window
     * \@provides html, html_sanitize
     */

    /**
     * \@namespace
     */
    var html = (function(html4) {

      // For closure compiler
      var parseCssDeclarations, sanitizeCssProperty, cssSchema;
      if ('undefined' !== typeof window) {
        parseCssDeclarations = window['parseCssDeclarations'];
        sanitizeCssProperty = window['sanitizeCssProperty'];
        cssSchema = window['cssSchema'];
      }

      var lcase;
      // The below may not be true on browsers in the Turkish locale.
      if ('script' === 'SCRIPT'.toLowerCase()) {
        lcase = function(s) { return s.toLowerCase(); };
      } else {
        /**
         * {\@updoc
         * $ lcase('SCRIPT')
         * # 'script'
         * $ lcase('script')
         * # 'script'
         * }
         */
        lcase = function(s) {
          return s.replace(
              /[A-Z]/g,
              function(ch) {
                return String.fromCharCode(ch.charCodeAt(0) | 32);
              });
        };
      }

      // The keys of this object must be 'quoted' or JSCompiler will mangle them!
      var ENTITIES = {
        'lt': '<',
        'gt': '>',
        'amp': '&',
        'nbsp': '\xA0',
        'quot': '"',
        'apos': '\''
      };

      var decimalEscapeRe = /^#(\d+)$/;
      var hexEscapeRe = /^#x([0-9A-Fa-f]+)$/;
      /**
       * Decodes an HTML entity.
       *
       * {\@updoc
       * $ lookupEntity('lt')
       * # '<'
       * $ lookupEntity('GT')
       * # '>'
       * $ lookupEntity('amp')
       * # '&'
       * $ lookupEntity('nbsp')
       * # '\xA0'
       * $ lookupEntity('apos')
       * # "'"
       * $ lookupEntity('quot')
       * # '"'
       * $ lookupEntity('#xa')
       * # '\n'
       * $ lookupEntity('#10')
       * # '\n'
       * $ lookupEntity('#x0a')
       * # '\n'
       * $ lookupEntity('#010')
       * # '\n'
       * $ lookupEntity('#x00A')
       * # '\n'
       * $ lookupEntity('Pi')      // Known failure
       * # '\u03A0'
       * $ lookupEntity('pi')      // Known failure
       * # '\u03C0'
       * }
       *
       * @param {string} name the content between the '&' and the ';'.
       * @return {string} a single unicode code-point as a string.
       */
      function lookupEntity(name) {
        name = lcase(name);  // TODO: &pi; is different from &Pi;
        if (ENTITIES.hasOwnProperty(name)) { return ENTITIES[name]; }
        var m = name.match(decimalEscapeRe);
        if (m) {
          return String.fromCharCode(parseInt(m[1], 10));
        } else if (!!(m = name.match(hexEscapeRe))) {
          return String.fromCharCode(parseInt(m[1], 16));
        }
        return '';
      }

      function decodeOneEntity(_, name) {
        return lookupEntity(name);
      }

      var nulRe = /\0/g;
      function stripNULs(s) {
        return s.replace(nulRe, '');
      }

      var entityRe = /&(#\d+|#x[0-9A-Fa-f]+|\w+);/g;
      /**
       * The plain text of a chunk of HTML CDATA which possibly containing.
       *
       * {\@updoc
       * $ unescapeEntities('')
       * # ''
       * $ unescapeEntities('hello World!')
       * # 'hello World!'
       * $ unescapeEntities('1 &lt; 2 &amp;&AMP; 4 &gt; 3&#10;')
       * # '1 < 2 && 4 > 3\n'
       * $ unescapeEntities('&lt;&lt <- unfinished entity&gt;')
       * # '<&lt <- unfinished entity>'
       * $ unescapeEntities('/foo?bar=baz&copy=true')  // & often unescaped in URLS
       * # '/foo?bar=baz&copy=true'
       * $ unescapeEntities('pi=&pi;&#x3c0;, Pi=&Pi;\u03A0') // FIXME: known failure
       * # 'pi=\u03C0\u03c0, Pi=\u03A0\u03A0'
       * }
       *
       * @param {string} s a chunk of HTML CDATA.  It must not start or end inside
       *     an HTML entity.
       */
      function unescapeEntities(s) {
        return s.replace(entityRe, decodeOneEntity);
      }

      var ampRe = /&/g;
      var looseAmpRe = /&([^a-z#]|#(?:[^0-9x]|x(?:[^0-9a-f]|$)|$)|$)/gi;
      var ltRe = /[<]/g;
      var gtRe = />/g;
      var quotRe = /\"/g;

      /**
       * Escapes HTML special characters in attribute values.
       *
       * {\@updoc
       * $ escapeAttrib('')
       * # ''
       * $ escapeAttrib('"<<&==&>>"')  // Do not just escape the first occurrence.
       * # '&#34;&lt;&lt;&amp;&#61;&#61;&amp;&gt;&gt;&#34;'
       * $ escapeAttrib('Hello <World>!')
       * # 'Hello &lt;World&gt;!'
       * }
       */
      function escapeAttrib(s) {
        return ('' + s).replace(ampRe, '&amp;').replace(ltRe, '&lt;')
            .replace(gtRe, '&gt;').replace(quotRe, '&#34;');
      }

      /**
       * Escape entities in RCDATA that can be escaped without changing the meaning.
       * {\@updoc
       * $ normalizeRCData('1 < 2 &&amp; 3 > 4 &amp;& 5 &lt; 7&8')
       * # '1 &lt; 2 &amp;&amp; 3 &gt; 4 &amp;&amp; 5 &lt; 7&amp;8'
       * }
       */
      function normalizeRCData(rcdata) {
        return rcdata
            .replace(looseAmpRe, '&amp;$1')
            .replace(ltRe, '&lt;')
            .replace(gtRe, '&gt;');
      }

      // TODO(mikesamuel): validate sanitizer regexs against the HTML5 grammar at
      // http://www.whatwg.org/specs/web-apps/current-work/multipage/syntax.html
      // http://www.whatwg.org/specs/web-apps/current-work/multipage/parsing.html
      // http://www.whatwg.org/specs/web-apps/current-work/multipage/tokenization.html
      // http://www.whatwg.org/specs/web-apps/current-work/multipage/tree-construction.html

      // We initially split input so that potentially meaningful characters
      // like '<' and '>' are separate tokens, using a fast dumb process that
      // ignores quoting.  Then we walk that token stream, and when we see a
      // '<' that's the start of a tag, we use ATTR_RE to extract tag
      // attributes from the next token.  That token will never have a '>'
      // character.  However, it might have an unbalanced quote character, and
      // when we see that, we combine additional tokens to balance the quote.

      var ATTR_RE = new RegExp(
        '^\\s*' +
        '([a-z][a-z-]*)' +          // 1 = Attribute name
        '(?:' + (
          '\\s*(=)\\s*' +           // 2 = Is there a value?
          '(' + (                   // 3 = Attribute value
            // TODO(felix8a): maybe use backref to match quotes
            '(\")[^\"]*(\"|$)' +    // 4, 5 = Double-quoted string
            '|' +
            '(\')[^\']*(\'|$)' +    // 6, 7 = Single-quoted string
            '|' +
            // Positive lookahead to prevent interpretation of
            // <foo a= b=c> as <foo a='b=c'>
            // TODO(felix8a): might be able to drop this case
            '(?=[a-z][a-z-]*\\s*=)' +
            '|' +
            // Unquoted value that isn't an attribute name
            // (since we didn't match the positive lookahead above)
            '[^\"\'\\s]*' ) +
          ')' ) +
        ')?',
        'i');

      var ENTITY_RE = /^(#[0-9]+|#x[0-9a-f]+|\w+);/i;

      // false on IE<=8, true on most other browsers
      var splitWillCapture = ('a,b'.split(/(,)/).length === 3);

      // bitmask for tags with special parsing, like <script> and <textarea>
      var EFLAGS_TEXT = html4.eflags.CDATA | html4.eflags.RCDATA;

      /**
       * Given a SAX-like event handler, produce a function that feeds those
       * events and a parameter to the event handler.
       *
       * The event handler has the form:{@code
       * {
       *   // Name is an upper-case HTML tag name.  Attribs is an array of
       *   // alternating upper-case attribute names, and attribute values.  The
       *   // attribs array is reused by the parser.  Param is the value passed to
       *   // the saxParser.
       *   startTag: function (name, attribs, param) { ... },
       *   endTag:   function (name, param) { ... },
       *   pcdata:   function (text, param) { ... },
       *   rcdata:   function (text, param) { ... },
       *   cdata:    function (text, param) { ... },
       *   startDoc: function (param) { ... },
       *   endDoc:   function (param) { ... }
       * }}
       *
       * @param {Object} handler a record containing event handlers.
       * @return {function(string, Object)} A function that takes a chunk of HTML
       *     and a parameter.  The parameter is passed on to the handler methods.
       */
      function makeSaxParser(handler) {
        return function(htmlText, param) {
          return parse(htmlText, handler, param);
        };
      }

      // Parsing strategy is to split input into parts that might be lexically
      // meaningful (every ">" becomes a separate part), and then recombine
      // parts if we discover they're in a different context.

      // Note, html-sanitizer filters unknown tags here, even though they also
      // get filtered out by the sanitizer's handler.  This is back-compat
      // behavior; makeSaxParser is public.

      // TODO(felix8a): Significant performance regressions from -legacy,
      // tested on
      //    Chrome 18.0
      //    Firefox 11.0
      //    IE 6, 7, 8, 9
      //    Opera 11.61
      //    Safari 5.1.3
      // Many of these are unusual patterns that are linearly slower and still
      // pretty fast (eg 1ms to 5ms), so not necessarily worth fixing.

      // TODO(felix8a): "<script> && && && ... <\/script>" is slower on all
      // browsers.  The hotspot is htmlSplit.

      // TODO(felix8a): "<p title='>>>>...'><\/p>" is slower on all browsers.
      // This is partly htmlSplit, but the hotspot is parseTagAndAttrs.

      // TODO(felix8a): "<a><\/a><a><\/a>..." is slower on IE9.
      // "<a>1<\/a><a>1<\/a>..." is faster, "<a><\/a>2<a><\/a>2..." is faster.

      // TODO(felix8a): "<p<p<p..." is slower on IE[6-8]

      var continuationMarker = {};
      function parse(htmlText, handler, param) {
        var parts = htmlSplit(htmlText);
        var state = {
          noMoreGT: false,
          noMoreEndComments: false
        };
        parseCPS(handler, parts, 0, state, param);
      }

      function continuationMaker(h, parts, initial, state, param) {
        return function () {
          parseCPS(h, parts, initial, state, param);
        };
      }

      function parseCPS(h, parts, initial, state, param) {
        try {
          if (h.startDoc && initial == 0) { h.startDoc(param); }
          var m, p, tagName;
          for (var pos = initial, end = parts.length; pos < end;) {
            var current = parts[pos++];
            var next = parts[pos];
            switch (current) {
            case '&':
              if (ENTITY_RE.test(next)) {
                if (h.pcdata) {
                  h.pcdata('&' + next, param, continuationMarker,
                    continuationMaker(h, parts, pos, state, param));
                }
                pos++;
              } else {
                if (h.pcdata) { h.pcdata("&amp;", param, continuationMarker,
                    continuationMaker(h, parts, pos, state, param));
                }
              }
              break;
            case '<\/':
              if (m = /^(\w+)[^\'\"]*/.exec(next)) {
                if (m[0].length === next.length && parts[pos + 1] === '>') {
                  // fast case, no attribute parsing needed
                  pos += 2;
                  tagName = lcase(m[1]);
                  if (html4.ELEMENTS.hasOwnProperty(tagName)) {
                    if (h.endTag) {
                      h.endTag(tagName, param, continuationMarker,
                        continuationMaker(h, parts, pos, state, param));
                    }
                  }
                } else {
                  // slow case, need to parse attributes
                  // TODO(felix8a): do we really care about misparsing this?
                  pos = parseEndTag(
                    parts, pos, h, param, continuationMarker, state);
                }
              } else {
                if (h.pcdata) {
                  h.pcdata('&lt;/', param, continuationMarker,
                    continuationMaker(h, parts, pos, state, param));
                }
              }
              break;
            case '<':
              if (m = /^(\w+)\s*\/?/.exec(next)) {
                if (m[0].length === next.length && parts[pos + 1] === '>') {
                  // fast case, no attribute parsing needed
                  pos += 2;
                  tagName = lcase(m[1]);
                  if (html4.ELEMENTS.hasOwnProperty(tagName)) {
                    if (h.startTag) {
                      h.startTag(tagName, [], param, continuationMarker,
                        continuationMaker(h, parts, pos, state, param));
                    }
                    // tags like <script> and <textarea> have special parsing
                    var eflags = html4.ELEMENTS[tagName];
                    if (eflags & EFLAGS_TEXT) {
                      var tag = { name: tagName, next: pos, eflags: eflags };
                      pos = parseText(
                        parts, tag, h, param, continuationMarker, state);
                    }
                  }
                } else {
                  // slow case, need to parse attributes
                  pos = parseStartTag(
                    parts, pos, h, param, continuationMarker, state);
                }
              } else {
                if (h.pcdata) {
                  h.pcdata('&lt;', param, continuationMarker,
                    continuationMaker(h, parts, pos, state, param));
                }
              }
              break;
            case '<\!--':
              // The pathological case is n copies of '<\!--' without '-->', and
              // repeated failure to find '-->' is quadratic.  We avoid that by
              // remembering when search for '-->' fails.
              if (!state.noMoreEndComments) {
                // A comment <\!--x--> is split into three tokens:
                //   '<\!--', 'x--', '>'
                // We want to find the next '>' token that has a preceding '--'.
                // pos is at the 'x--'.
                for (p = pos + 1; p < end; p++) {
                  if (parts[p] === '>' && /--$/.test(parts[p - 1])) { break; }
                }
                if (p < end) {
                  pos = p + 1;
                } else {
                  state.noMoreEndComments = true;
                }
              }
              if (state.noMoreEndComments) {
                if (h.pcdata) {
                  h.pcdata('&lt;!--', param, continuationMarker,
                    continuationMaker(h, parts, pos, state, param));
                }
              }
              break;
            case '<\!':
              if (!/^\w/.test(next)) {
                if (h.pcdata) {
                  h.pcdata('&lt;!', param, continuationMarker,
                    continuationMaker(h, parts, pos, state, param));
                }
              } else {
                // similar to noMoreEndComment logic
                if (!state.noMoreGT) {
                  for (p = pos + 1; p < end; p++) {
                    if (parts[p] === '>') { break; }
                  }
                  if (p < end) {
                    pos = p + 1;
                  } else {
                    state.noMoreGT = true;
                  }
                }
                if (state.noMoreGT) {
                  if (h.pcdata) {
                    h.pcdata('&lt;!', param, continuationMarker,
                      continuationMaker(h, parts, pos, state, param));
                  }
                }
              }
              break;
            case '<?':
              // similar to noMoreEndComment logic
              if (!state.noMoreGT) {
                for (p = pos + 1; p < end; p++) {
                  if (parts[p] === '>') { break; }
                }
                if (p < end) {
                  pos = p + 1;
                } else {
                  state.noMoreGT = true;
                }
              }
              if (state.noMoreGT) {
                if (h.pcdata) {
                  h.pcdata('&lt;?', param, continuationMarker,
                    continuationMaker(h, parts, pos, state, param));
                }
              }
              break;
            case '>':
              if (h.pcdata) {
                h.pcdata("&gt;", param, continuationMarker,
                  continuationMaker(h, parts, pos, state, param));
              }
              break;
            case '':
              break;
            default:
              if (h.pcdata) {
                h.pcdata(current, param, continuationMarker,
                  continuationMaker(h, parts, pos, state, param));
              }
              break;
            }
          }
          if (h.endDoc) { h.endDoc(param); }
        } catch (e) {
          if (e !== continuationMarker) { throw e; }
        }
      }

      // Split str into parts for the html parser.
      function htmlSplit(str) {
        // can't hoist this out of the function because of the re.exec loop.
        var re = /(<\/|<\!--|<[!?]|[&<>])/g;
        str += '';
        if (splitWillCapture) {
          return str.split(re);
        } else {
          var parts = [];
          var lastPos = 0;
          var m;
          while ((m = re.exec(str)) !== null) {
            parts.push(str.substring(lastPos, m.index));
            parts.push(m[0]);
            lastPos = m.index + m[0].length;
          }
          parts.push(str.substring(lastPos));
          return parts;
        }
      }

      function parseEndTag(parts, pos, h, param, continuationMarker, state) {
        var tag = parseTagAndAttrs(parts, pos);
        // drop unclosed tags
        if (!tag) { return parts.length; }
        if (tag.eflags !== void 0) {
          if (h.endTag) {
            h.endTag(tag.name, param, continuationMarker,
              continuationMaker(h, parts, pos, state, param));
          }
        }
        return tag.next;
      }

      function parseStartTag(parts, pos, h, param, continuationMarker, state) {
        var tag = parseTagAndAttrs(parts, pos);
        // drop unclosed tags
        if (!tag) { return parts.length; }
        if (tag.eflags !== void 0) {
          if (h.startTag) {
            h.startTag(tag.name, tag.attrs, param, continuationMarker,
              continuationMaker(h, parts, tag.next, state, param));
          }
          // tags like <script> and <textarea> have special parsing
          if (tag.eflags & EFLAGS_TEXT) {
            return parseText(parts, tag, h, param, continuationMarker, state);
          }
        }
        return tag.next;
      }

      var endTagRe = {};

      // Tags like <script> and <textarea> are flagged as CDATA or RCDATA,
      // which means everything is text until we see the correct closing tag.
      function parseText(parts, tag, h, param, continuationMarker, state) {
        var end = parts.length;
        if (!endTagRe.hasOwnProperty(tag.name)) {
          endTagRe[tag.name] = new RegExp('^' + tag.name + '(?:[\\s\\/]|$)', 'i');
        }
        var re = endTagRe[tag.name];
        var first = tag.next;
        var p = tag.next + 1;
        for (; p < end; p++) {
          if (parts[p - 1] === '<\/' && re.test(parts[p])) { break; }
        }
        if (p < end) { p -= 1; }
        var buf = parts.slice(first, p).join('');
        if (tag.eflags & html4.eflags.CDATA) {
          if (h.cdata) {
            h.cdata(buf, param, continuationMarker,
              continuationMaker(h, parts, p, state, param));
          }
        } else if (tag.eflags & html4.eflags.RCDATA) {
          if (h.rcdata) {
            h.rcdata(normalizeRCData(buf), param, continuationMarker,
              continuationMaker(h, parts, p, state, param));
          }
        } else {
          throw new Error('bug');
        }
        return p;
      }

      // at this point, parts[pos-1] is either "<" or "<\/".
      function parseTagAndAttrs(parts, pos) {
        var m = /^(\w+)/.exec(parts[pos]);
        var tag = { name: lcase(m[1]) };
        if (html4.ELEMENTS.hasOwnProperty(tag.name)) {
          tag.eflags = html4.ELEMENTS[tag.name];
        } else {
          tag.eflags = void 0;
        }
        var buf = parts[pos].substr(m[0].length);
        // Find the next '>'.  We optimistically assume this '>' is not in a
        // quoted context, and further down we fix things up if it turns out to
        // be quoted.
        var p = pos + 1;
        var end = parts.length;
        for (; p < end; p++) {
          if (parts[p] === '>') { break; }
          buf += parts[p];
        }
        if (end <= p) { return void 0; }
        var attrs = [];
        while (buf !== '') {
          m = ATTR_RE.exec(buf);
          if (!m) {
            // No attribute found: skip garbage
            buf = buf.replace(/^[\s\S][^a-z\s]*/, '');

          } else if ((m[4] && !m[5]) || (m[6] && !m[7])) {
            // Unterminated quote: slurp to the next unquoted '>'
            var quote = m[4] || m[6];
            var sawQuote = false;
            var abuf = [buf, parts[p++]];
            for (; p < end; p++) {
              if (sawQuote) {
                if (parts[p] === '>') { break; }
              } else if (0 <= parts[p].indexOf(quote)) {
                sawQuote = true;
              }
              abuf.push(parts[p]);
            }
            // Slurp failed: lose the garbage
            if (end <= p) { break; }
            // Otherwise retry attribute parsing
            buf = abuf.join('');
            continue;

          } else {
            // We have an attribute
            var aName = lcase(m[1]);
            var aValue = m[2] ? decodeValue(m[3]) : aName;
            attrs.push(aName, aValue);
            buf = buf.substr(m[0].length);
          }
        }
        tag.attrs = attrs;
        tag.next = p + 1;
        return tag;
      }

      function decodeValue(v) {
        var q = v.charCodeAt(0);
        if (q === 0x22 || q === 0x27) { // " or '
          v = v.substr(1, v.length - 2);
        }
        return unescapeEntities(stripNULs(v));
      }

      /**
       * Returns a function that strips unsafe tags and attributes from html.
       * @param {function(string, Array.<string>): ?Array.<string>} tagPolicy
       *     A function that takes (tagName, attribs[]), where tagName is a key in
       *     html4.ELEMENTS and attribs is an array of alternating attribute names
       *     and values.  It should return a sanitized attribute array, or null to
       *     delete the tag.  It's okay for tagPolicy to modify the attribs array,
       *     but the same array is reused, so it should not be held between calls.
       * @return {function(string, Array)} A function that sanitizes a string of
       *     HTML and appends result strings to the second argument, an array.
       */
      function makeHtmlSanitizer(tagPolicy) {
        var stack;
        var ignoring;
        var emit = function (text, out) {
          if (!ignoring) { out.push(text); }
        };
        return makeSaxParser({
          startDoc: function(_) {
            stack = [];
            ignoring = false;
          },
          startTag: function(tagName, attribs, out) {
            if (ignoring) { return; }
            if (!html4.ELEMENTS.hasOwnProperty(tagName)) { return; }
            var eflags = html4.ELEMENTS[tagName];
            if (eflags & html4.eflags.FOLDABLE) {
              return;
            }
            attribs = tagPolicy(tagName, attribs);
            if (!attribs) {
              ignoring = !(eflags & html4.eflags.EMPTY);
              return;
            }
            // TODO(mikesamuel): relying on tagPolicy not to insert unsafe
            // attribute names.
            if (!(eflags & html4.eflags.EMPTY)) {
              stack.push(tagName);
            }

            out.push('<', tagName);
            for (var i = 0, n = attribs.length; i < n; i += 2) {
              var attribName = attribs[i],
                  value = attribs[i + 1];
              if (value !== null && value !== void 0) {
                out.push(' ', attribName, '="', escapeAttrib(value), '"');
              }
            }
            out.push('>');
          },
          endTag: function(tagName, out) {
            if (ignoring) {
              ignoring = false;
              return;
            }
            if (!html4.ELEMENTS.hasOwnProperty(tagName)) { return; }
            var eflags = html4.ELEMENTS[tagName];
            if (!(eflags & (html4.eflags.EMPTY | html4.eflags.FOLDABLE))) {
              var index;
              if (eflags & html4.eflags.OPTIONAL_ENDTAG) {
                for (index = stack.length; --index >= 0;) {
                  var stackEl = stack[index];
                  if (stackEl === tagName) { break; }
                  if (!(html4.ELEMENTS[stackEl] &
                        html4.eflags.OPTIONAL_ENDTAG)) {
                    // Don't pop non optional end tags looking for a match.
                    return;
                  }
                }
              } else {
                for (index = stack.length; --index >= 0;) {
                  if (stack[index] === tagName) { break; }
                }
              }
              if (index < 0) { return; }  // Not opened.
              for (var i = stack.length; --i > index;) {
                var stackEl = stack[i];
                if (!(html4.ELEMENTS[stackEl] &
                      html4.eflags.OPTIONAL_ENDTAG)) {
                  out.push('<\/', stackEl, '>');
                }
              }
              stack.length = index;
              out.push('<\/', tagName, '>');
            }
          },
          pcdata: emit,
          rcdata: emit,
          cdata: emit,
          endDoc: function(out) {
            for (; stack.length; stack.length--) {
              out.push('<\/', stack[stack.length - 1], '>');
            }
          }
        });
      }

      // From RFC3986
      var URI_SCHEME_RE = new RegExp(
          '^' +
          '(?:' +
            '([^:\/?# ]+)' +         // scheme
          ':)?'
      );

      var ALLOWED_URI_SCHEMES = /^(?:https?|mailto)$/i;

      function safeUri(uri, naiveUriRewriter) {
        if (!naiveUriRewriter) { return null; }
        var parsed = ('' + uri).match(URI_SCHEME_RE);
        if (parsed && (!parsed[1] || ALLOWED_URI_SCHEMES.test(parsed[1]))) {
          return naiveUriRewriter(uri);
        } else {
          return null;
        }
      }

      /**
       * Sanitizes attributes on an HTML tag.
       * @param {string} tagName An HTML tag name in lowercase.
       * @param {Array.<?string>} attribs An array of alternating names and values.
       * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
       *     apply to URI attributes; it can return a new string value, or null to
       *     delete the attribute.  If unspecified, URI attributes are deleted.
       * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
       *     to attributes containing HTML names, element IDs, and space-separated
       *     lists of classes; it can return a new string value, or null to delete
       *     the attribute.  If unspecified, these attributes are kept unchanged.
       * @return {Array.<?string>} The sanitized attributes as a list of alternating
       *     names and values, where a null value means to omit the attribute.
       */
      function sanitizeAttribs(
          tagName, attribs, opt_naiveUriRewriter, opt_nmTokenPolicy) {
        for (var i = 0; i < attribs.length; i += 2) {
          var attribName = attribs[i];
          var value = attribs[i + 1];
          var atype = null, attribKey;
          if ((attribKey = tagName + '::' + attribName,
               html4.ATTRIBS.hasOwnProperty(attribKey)) ||
              (attribKey = '*::' + attribName,
               html4.ATTRIBS.hasOwnProperty(attribKey))) {
            atype = html4.ATTRIBS[attribKey];
          }
          if (atype !== null) {
            switch (atype) {
              case html4.atype.NONE: break;
              case html4.atype.SCRIPT:
                value = null;
                break;
              case html4.atype.STYLE:
                if ('undefined' === typeof parseCssDeclarations) {
                  value = null;
                  break;
                }
                var sanitizedDeclarations = [];
                parseCssDeclarations(
                    value,
                    {
                      declaration: function (property, tokens) {
                        var normProp = property.toLowerCase();
                        var schema = cssSchema[normProp];
                        if (!schema) {
                          return;
                        }
                        sanitizeCssProperty(
                            normProp, schema, tokens,
                            opt_naiveUriRewriter);
                        sanitizedDeclarations.push(property + ': ' + tokens.join(' '));
                      }
                    });
                value = sanitizedDeclarations.length > 0 ? sanitizedDeclarations.join(' ; ') : null;
                break;
              case html4.atype.ID:
              case html4.atype.IDREF:
              case html4.atype.IDREFS:
              case html4.atype.GLOBAL_NAME:
              case html4.atype.LOCAL_NAME:
              case html4.atype.CLASSES:
                value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
                break;
              case html4.atype.URI:
                value = safeUri(value, opt_naiveUriRewriter);
                break;
              case html4.atype.URI_FRAGMENT:
                if (value && '#' === value.charAt(0)) {
                  value = value.substring(1);  // remove the leading '#'
                  value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
                  if (value !== null && value !== void 0) {
                    value = '#' + value;  // restore the leading '#'
                  }
                } else {
                  value = null;
                }
                break;
              default:
                value = null;
                break;
            }
          } else {
            value = null;
          }
          attribs[i + 1] = value;
        }
        return attribs;
      }

      /**
       * Creates a tag policy that omits all tags marked UNSAFE in html4-defs.js
       * and applies the default attribute sanitizer with the supplied policy for
       * URI attributes and NMTOKEN attributes.
       * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
       *     apply to URI attributes.  If not given, URI attributes are deleted.
       * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
       *     to attributes containing HTML names, element IDs, and space-separated
       *     lists of classes.  If not given, such attributes are left unchanged.
       * @return {function(string, Array.<?string>)} A tagPolicy suitable for
       *     passing to html.sanitize.
       */
      function makeTagPolicy(opt_naiveUriRewriter, opt_nmTokenPolicy) {
        return function(tagName, attribs) {
          if (!(html4.ELEMENTS[tagName] & html4.eflags.UNSAFE)) {
            return sanitizeAttribs(
                tagName, attribs, opt_naiveUriRewriter, opt_nmTokenPolicy);
          }
        };
      }

      /**
       * Sanitizes HTML tags and attributes according to a given policy.
       * @param {string} inputHtml The HTML to sanitize.
       * @param {function(string, Array.<?string>)} tagPolicy A function that
       *     decides which tags to accept and sanitizes their attributes (see
       *     makeHtmlSanitizer above for details).
       * @return {string} The sanitized HTML.
       */
      function sanitizeWithPolicy(inputHtml, tagPolicy) {
        var outputArray = [];
        makeHtmlSanitizer(tagPolicy)(inputHtml, outputArray);
        return outputArray.join('');
      }

      /**
       * Strips unsafe tags and attributes from HTML.
       * @param {string} inputHtml The HTML to sanitize.
       * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
       *     apply to URI attributes.  If not given, URI attributes are deleted.
       * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
       *     to attributes containing HTML names, element IDs, and space-separated
       *     lists of classes.  If not given, such attributes are left unchanged.
       */
      function sanitize(inputHtml, opt_naiveUriRewriter, opt_nmTokenPolicy) {
        var tagPolicy = makeTagPolicy(opt_naiveUriRewriter, opt_nmTokenPolicy);
        return sanitizeWithPolicy(inputHtml, tagPolicy);
      }

      return {
        escapeAttrib: escapeAttrib,
        makeHtmlSanitizer: makeHtmlSanitizer,
        makeSaxParser: makeSaxParser,
        makeTagPolicy: makeTagPolicy,
        normalizeRCData: normalizeRCData,
        sanitize: sanitize,
        sanitizeAttribs: sanitizeAttribs,
        sanitizeWithPolicy: sanitizeWithPolicy,
        unescapeEntities: unescapeEntities
      };
    })(html4);

    var html_sanitize = html.sanitize;

    // Exports for closure compiler.  Note this file is also cajoled
    // for domado and run in an environment without 'window'
    if (typeof window !== 'undefined') {
      window['html'] = html;
      window['html_sanitize'] = html_sanitize;
    }

    }());

    const DEFAULT_THEME_FAMILY = "legacy"; // includes sap_fiori_*
    const loaders = new Map();
    const registry = _ui5_webcomponentsBase.getSharedResource("SVGIcons.registry", new Map());
    const iconCollectionPromises = _ui5_webcomponentsBase.getSharedResource("SVGIcons.promises", new Map());
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

    const mediaRanges = new Map();
    const DEAFULT_RANGE_SET = new Map();
    DEAFULT_RANGE_SET.set("S", [0, 599]);
    DEAFULT_RANGE_SET.set("M", [600, 1023]);
    DEAFULT_RANGE_SET.set("L", [1024, 1439]);
    DEAFULT_RANGE_SET.set("XL", [1440, Infinity]);
    /**
     * Enumeration containing the names and settings of predefined screen width media query range sets.
     *
     * @public
     */
    var RANGESETS;
    (function (RANGESETS) {
        /**
         * A 4-step range set (S-M-L-XL).
         *
         * The ranges of this set are:
         *
         * - `"S"`: For screens smaller than 600 pixels.
         * - `"M"`: For screens greater than or equal to 600 pixels and smaller than 1024 pixels.
         * - `"L"`: For screens greater than or equal to 1024 pixels and smaller than 1440 pixels.
         * - `"XL"`: For screens greater than or equal to 1440 pixels.
         *
         *
         * @public
         */
        RANGESETS["RANGE_4STEPS"] = "4Step";
    })(RANGESETS || (RANGESETS = {}));
    /**
     * Initializes a screen width media query range set.
     *
     * This initialization step makes the range set ready to be used for one of the other functions in namespace `MediaRange`.
     *
     * A range set can be defined as shown in the following example:
     * ```
     * MediaRange.initRangeSet("MyRangeSet", [200, 400], ["Small", "Medium", "Large"]);
     * ```
     * This example defines the following named ranges:
     *
     * - `"Small"`: For screens smaller than 200 pixels.
     * - `"Medium"`: For screens greater than or equal to 200 pixels and smaller than 400 pixels.
     * - `"Large"`: For screens greater than or equal to 400 pixels.
     *
     *
     * @param name The name of the range set to be initialized.
     * The name must be a valid id and consist only of letters and numeric digits.
     * @param range The given range set.
     */
    const initRangeSet = (name, range) => {
        mediaRanges.set(name, range);
    };
    /**
     * Returns information about the current active range of the range set with the given name.
     *
     * If the optional parameter `width` is given, the active range will be determined for that width,
     * otherwise it is determined for the current window size.
     *
     * @param name The name of the range set. The range set must be initialized beforehand ({@link MediaRange.initRangeSet})
     * @param [width] An optional width, based on which the range should be determined;
     * If `width` is not provided, the window size will be used.
     * @returns The name of the current active interval of the range set.
     * @public
     */
    const getCurrentRange = (name, width = window.innerWidth) => {
        let rangeSet = mediaRanges.get(name);
        if (!rangeSet) {
            rangeSet = mediaRanges.get(RANGESETS.RANGE_4STEPS);
        }
        let currentRangeName;
        const effectiveWidth = Math.floor(width);
        rangeSet.forEach((value, key) => {
            if (effectiveWidth >= value[0] && effectiveWidth <= value[1]) {
                currentRangeName = key;
            }
        });
        return currentRangeName || [...rangeSet.keys()][0];
    };
    /**
     * API for screen width changes.
     */
    const MediaRange = {
        RANGESETS,
        initRangeSet,
        getCurrentRange,
    };
    MediaRange.initRangeSet(MediaRange.RANGESETS.RANGE_4STEPS, DEAFULT_RANGE_SET);

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
     */const {I:l$1}=_ui5_webcomponentsBase.j,r=()=>document.createComment(""),c$1=(o,i,n)=>{var t;const v=o._$AA.parentNode,d=void 0===i?o._$AB:i._$AA;if(void 0===n){const i=v.insertBefore(r(),d),t=v.insertBefore(r(),d);n=new l$1(i,t,o,o.options);}else {const l=n._$AB.nextSibling,i=n._$AM,u=i!==o;if(u){let l;null===(t=n._$AQ)||void 0===t||t.call(n,o),n._$AM=o,void 0!==n._$AP&&(l=o._$AU)!==i._$AU&&n._$AP(l);}if(l!==d||u){let o=n._$AA;for(;o!==l;){const l=o.nextSibling;v.insertBefore(o,d),o=l;}}}return n},f=(o,l,i=o)=>(o._$AI(l,i),o),s={},a=(o,l=s)=>o._$AH=l,m=o=>o._$AH,p=o=>{var l;null===(l=o._$AP)||void 0===l||l.call(o,!1,!0);let i=o._$AA;const n=o._$AB.nextSibling;for(;i!==n;){const o=i.nextSibling;i.remove(),i=o;}};

    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    const u=(e,s,t)=>{const r=new Map;for(let l=s;l<=t;l++)r.set(e[l],l);return r},c=e$1(class extends i{constructor(e){if(super(e),e.type!==t.CHILD)throw Error("repeat() can only be used in text expressions")}ct(e,s,t){let r;void 0===t?t=s:void 0!==s&&(r=s);const l=[],o=[];let i=0;for(const s of e)l[i]=r?r(s,i):i,o[i]=t(s,i),i++;return {values:o,keys:l}}render(e,s,t){return this.ct(e,s,t).values}update(s,[t,r,c]){var d;const a$1=m(s),{values:p$1,keys:v}=this.ct(t,r,c);if(!Array.isArray(a$1))return this.ut=v,p$1;const h=null!==(d=this.ut)&&void 0!==d?d:this.ut=[],m$1=[];let y,x,j=0,k=a$1.length-1,w=0,A=p$1.length-1;for(;j<=k&&w<=A;)if(null===a$1[j])j++;else if(null===a$1[k])k--;else if(h[j]===v[w])m$1[w]=f(a$1[j],p$1[w]),j++,w++;else if(h[k]===v[A])m$1[A]=f(a$1[k],p$1[A]),k--,A--;else if(h[j]===v[A])m$1[A]=f(a$1[j],p$1[A]),c$1(s,m$1[A+1],a$1[j]),j++,A--;else if(h[k]===v[w])m$1[w]=f(a$1[k],p$1[w]),c$1(s,a$1[j],a$1[k]),k--,w++;else if(void 0===y&&(y=u(v,w,A),x=u(h,j,k)),y.has(h[j]))if(y.has(h[k])){const e=x.get(v[w]),t=void 0!==e?a$1[e]:null;if(null===t){const e=c$1(s,a$1[j]);f(e,p$1[w]),m$1[w]=e;}else m$1[w]=f(t,p$1[w]),c$1(s,a$1[j],t),a$1[e]=null;w++;}else p(a$1[k]),k--;else p(a$1[j]),j++;for(;w<=A;){const e=c$1(s,m$1[A+1]);f(e,p$1[w]),m$1[w++]=e;}for(;j<=k;){const e=a$1[j++];null!==e&&p(e);}return this.ut=v,a(s,m$1),_ui5_webcomponentsBase.T}});

    /**
     * @license
     * Copyright 2018 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */const o=e$1(class extends i{constructor(t$1){var i;if(super(t$1),t$1.type!==t.ATTRIBUTE||"class"!==t$1.name||(null===(i=t$1.strings)||void 0===i?void 0:i.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return " "+Object.keys(t).filter((i=>t[i])).join(" ")+" "}update(i,[s]){var r,o;if(void 0===this.it){this.it=new Set,void 0!==i.strings&&(this.nt=new Set(i.strings.join(" ").split(/\s/).filter((t=>""!==t))));for(const t in s)s[t]&&!(null===(r=this.nt)||void 0===r?void 0:r.has(t))&&this.it.add(t);return this.render(s)}const e=i.element.classList;this.it.forEach((t=>{t in s||(e.remove(t),this.it.delete(t));}));for(const t in s){const i=!!s[t];i===this.it.has(t)||(null===(o=this.nt)||void 0===o?void 0:o.has(t))||(i?(e.add(t),this.it.add(t)):(e.remove(t),this.it.delete(t)));}return _ui5_webcomponentsBase.T}});

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
            return _ui5_webcomponentsBase.T;
        }
    }
    const styleMap = e$1(StyleMapDirective);

    /**
     * @license
     * Copyright 2018 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */const l=l=>null!=l?l:_ui5_webcomponentsBase.A;

    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */class e extends i{constructor(i){if(super(i),this.et=_ui5_webcomponentsBase.A,i.type!==t.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(r){if(r===_ui5_webcomponentsBase.A||null==r)return this.ft=void 0,this.et=r;if(r===_ui5_webcomponentsBase.T)return r;if("string"!=typeof r)throw Error(this.constructor.directiveName+"() called with a non-string value");if(r===this.et)return this.ft;this.et=r;const s=[r];return s.raw=s,this.ft={_$litType$:this.constructor.resultType,strings:s,values:[]}}}e.directiveName="unsafeHTML",e.resultType=1;

    const effectiveHtml = (strings, ...values) => {
        const litStatic = _ui5_webcomponentsBase.getFeature("LitStatic");
        const fn = litStatic ? litStatic.html : _ui5_webcomponentsBase.x;
        return fn(strings, ...values);
    };
    const effectiveSvg = (strings, ...values) => {
        const litStatic = _ui5_webcomponentsBase.getFeature("LitStatic");
        const fn = litStatic ? litStatic.svg : _ui5_webcomponentsBase.b;
        return fn(strings, ...values);
    };
    const litRender = (templateResult, container, options) => {
        const openUI5Enablement = _ui5_webcomponentsBase.getFeature("OpenUI5Enablement");
        if (openUI5Enablement) {
            templateResult = openUI5Enablement.wrapTemplateResultInBusyMarkup(effectiveHtml, options.host, templateResult);
        }
        _ui5_webcomponentsBase.D(templateResult, container, options);
    };
    const scopeTag = (tag, tags, suffix) => {
        const litStatic = _ui5_webcomponentsBase.getFeature("LitStatic");
        if (litStatic) {
            return litStatic.unsafeStatic((tags || []).includes(tag) ? `${tag}-${suffix}` : tag);
        }
    };

    /**
     * A decorator that converts a static class member into an accessor for the i18n bundle with a specified name
     *
     * @param { string } bundleName name of the i18n bundle to load
     * @returns { i18nDecorator }
     *
     * ```ts
     * class MyComponnet extends UI5Element {
     *   @i18n('@ui5/webcomponents')
     *   i18nBundle: I18nBundle;
     * }
     * ```
     */
    const i18n = (bundleName) => {
        return (target, propertyName) => {
            if (!target.metadata.i18n) {
                target.metadata.i18n = {};
            }
            target.metadata.i18n[propertyName] = {
                bundleName,
                target,
            };
        };
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

    const willShowContent = (childNodes) => {
        return Array.from(childNodes).filter(node => {
            return node.nodeType !== Node.COMMENT_NODE && (node.nodeType !== Node.TEXT_NODE || (node.nodeValue || "").trim().length !== 0);
        }).length > 0;
    };

    let _enableDefaultTooltips;
    /**
     * Returns if the "enableDefaultTooltips" configuration is set.
     * @public
     * @since 2.1.0
     * @returns { boolean }
     */
    const getEnableDefaultTooltips = () => {
        if (_enableDefaultTooltips === undefined) {
            _enableDefaultTooltips = _ui5_webcomponentsBase.getEnableDefaultTooltips();
        }
        return _enableDefaultTooltips;
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

    const styleData$3 = { packageName: "@ui5/webcomponents", fileName: "themes/sap_horizon/parameters-bundle.css.ts", content: `:root{--ui5-v2-3-0-avatar-hover-box-shadow-offset: 0px 0px 0px .0625rem;--ui5-v2-3-0-avatar-initials-color: var(--sapContent_ImagePlaceholderForegroundColor);--ui5-v2-3-0-avatar-border-radius-img-deduction: .0625rem;--_ui5-v2-3-0_avatar_outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-3-0_avatar_focus_width: .0625rem;--_ui5-v2-3-0_avatar_focus_color: var(--sapContent_FocusColor);--_ui5-v2-3-0_avatar_overflow_button_focus_offset: .0625rem;--_ui5-v2-3-0_avatar_focus_offset: .1875rem;--ui5-v2-3-0-avatar-initials-border: .0625rem solid var(--sapAvatar_1_BorderColor);--ui5-v2-3-0-avatar-border-radius: var(--sapElement_BorderCornerRadius);--_ui5-v2-3-0_avatar_fontsize_XS: 1rem;--_ui5-v2-3-0_avatar_fontsize_S: 1.125rem;--_ui5-v2-3-0_avatar_fontsize_M: 1.5rem;--_ui5-v2-3-0_avatar_fontsize_L: 2.25rem;--_ui5-v2-3-0_avatar_fontsize_XL: 3rem;--ui5-v2-3-0-avatar-accent1: var(--sapAvatar_1_Background);--ui5-v2-3-0-avatar-accent2: var(--sapAvatar_2_Background);--ui5-v2-3-0-avatar-accent3: var(--sapAvatar_3_Background);--ui5-v2-3-0-avatar-accent4: var(--sapAvatar_4_Background);--ui5-v2-3-0-avatar-accent5: var(--sapAvatar_5_Background);--ui5-v2-3-0-avatar-accent6: var(--sapAvatar_6_Background);--ui5-v2-3-0-avatar-accent7: var(--sapAvatar_7_Background);--ui5-v2-3-0-avatar-accent8: var(--sapAvatar_8_Background);--ui5-v2-3-0-avatar-accent9: var(--sapAvatar_9_Background);--ui5-v2-3-0-avatar-accent10: var(--sapAvatar_10_Background);--ui5-v2-3-0-avatar-placeholder: var(--sapContent_ImagePlaceholderBackground);--ui5-v2-3-0-avatar-accent1-color: var(--sapAvatar_1_TextColor);--ui5-v2-3-0-avatar-accent2-color: var(--sapAvatar_2_TextColor);--ui5-v2-3-0-avatar-accent3-color: var(--sapAvatar_3_TextColor);--ui5-v2-3-0-avatar-accent4-color: var(--sapAvatar_4_TextColor);--ui5-v2-3-0-avatar-accent5-color: var(--sapAvatar_5_TextColor);--ui5-v2-3-0-avatar-accent6-color: var(--sapAvatar_6_TextColor);--ui5-v2-3-0-avatar-accent7-color: var(--sapAvatar_7_TextColor);--ui5-v2-3-0-avatar-accent8-color: var(--sapAvatar_8_TextColor);--ui5-v2-3-0-avatar-accent9-color: var(--sapAvatar_9_TextColor);--ui5-v2-3-0-avatar-accent10-color: var(--sapAvatar_10_TextColor);--ui5-v2-3-0-avatar-placeholder-color: var(--sapContent_ImagePlaceholderForegroundColor);--ui5-v2-3-0-avatar-accent1-border-color: var(--sapAvatar_1_BorderColor);--ui5-v2-3-0-avatar-accent2-border-color: var(--sapAvatar_2_BorderColor);--ui5-v2-3-0-avatar-accent3-border-color: var(--sapAvatar_3_BorderColor);--ui5-v2-3-0-avatar-accent4-border-color: var(--sapAvatar_4_BorderColor);--ui5-v2-3-0-avatar-accent5-border-color: var(--sapAvatar_5_BorderColor);--ui5-v2-3-0-avatar-accent6-border-color: var(--sapAvatar_6_BorderColor);--ui5-v2-3-0-avatar-accent7-border-color: var(--sapAvatar_7_BorderColor);--ui5-v2-3-0-avatar-accent8-border-color: var(--sapAvatar_8_BorderColor);--ui5-v2-3-0-avatar-accent9-border-color: var(--sapAvatar_9_BorderColor);--ui5-v2-3-0-avatar-accent10-border-color: var(--sapAvatar_10_BorderColor);--ui5-v2-3-0-avatar-placeholder-border-color: var(--sapContent_ImagePlaceholderBackground);--_ui5-v2-3-0_avatar_icon_XS: var(--_ui5-v2-3-0_avatar_fontsize_XS);--_ui5-v2-3-0_avatar_icon_S: var(--_ui5-v2-3-0_avatar_fontsize_S);--_ui5-v2-3-0_avatar_icon_M: var(--_ui5-v2-3-0_avatar_fontsize_M);--_ui5-v2-3-0_avatar_icon_L: var(--_ui5-v2-3-0_avatar_fontsize_L);--_ui5-v2-3-0_avatar_icon_XL: var(--_ui5-v2-3-0_avatar_fontsize_XL);--_ui5-v2-3-0_avatar_group_button_focus_border: none;--_ui5-v2-3-0_avatar_group_focus_border_radius: .375rem;--_ui5-v2-3-0-tag-height: 1rem;--_ui5-v2-3-0-tag-icon-width: .75rem;--ui5-v2-3-0-tag-text-shadow: var(--sapContent_TextShadow);--ui5-v2-3-0-tag-contrast-text-shadow: var(--sapContent_ContrastTextShadow);--ui5-v2-3-0-tag-information-text-shadow: var(--ui5-v2-3-0-tag-text-shadow);--ui5-v2-3-0-tag-set2-color-scheme-1-color: var(--sapIndicationColor_1);--ui5-v2-3-0-tag-set2-color-scheme-1-background: var(--sapIndicationColor_1b);--ui5-v2-3-0-tag-set2-color-scheme-1-border: var(--sapIndicationColor_1b_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-1-hover-background: var(--sapIndicationColor_1b_Hover_Background);--ui5-v2-3-0-tag-set2-color-scheme-1-active-color: var(--sapIndicationColor_1_Active_TextColor);--ui5-v2-3-0-tag-set2-color-scheme-1-active-background: var(--sapIndicationColor_1_Active_Background);--ui5-v2-3-0-tag-set2-color-scheme-1-active-border: var(--sapIndicationColor_1_Active_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-2-color: var(--sapIndicationColor_2);--ui5-v2-3-0-tag-set2-color-scheme-2-background: var(--sapIndicationColor_2b);--ui5-v2-3-0-tag-set2-color-scheme-2-border: var(--sapIndicationColor_2b_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-2-hover-background: var(--sapIndicationColor_2b_Hover_Background);--ui5-v2-3-0-tag-set2-color-scheme-2-active-color: var(--sapIndicationColor_2_Active_TextColor);--ui5-v2-3-0-tag-set2-color-scheme-2-active-background: var(--sapIndicationColor_2_Active_Background);--ui5-v2-3-0-tag-set2-color-scheme-2-active-border: var(--sapIndicationColor_2_Active_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-3-color: var(--sapIndicationColor_3);--ui5-v2-3-0-tag-set2-color-scheme-3-background: var(--sapIndicationColor_3b);--ui5-v2-3-0-tag-set2-color-scheme-3-border: var(--sapIndicationColor_3b_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-3-hover-background: var(--sapIndicationColor_3b_Hover_Background);--ui5-v2-3-0-tag-set2-color-scheme-3-active-color: var(--sapIndicationColor_3_Active_TextColor);--ui5-v2-3-0-tag-set2-color-scheme-3-active-background: var(--sapIndicationColor_3_Active_Background);--ui5-v2-3-0-tag-set2-color-scheme-3-active-border: var(--sapIndicationColor_3_Active_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-4-color: var(--sapIndicationColor_4);--ui5-v2-3-0-tag-set2-color-scheme-4-background: var(--sapIndicationColor_4b);--ui5-v2-3-0-tag-set2-color-scheme-4-border: var(--sapIndicationColor_4b_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-4-hover-background: var(--sapIndicationColor_4b_Hover_Background);--ui5-v2-3-0-tag-set2-color-scheme-4-active-color: var(--sapIndicationColor_4_Active_TextColor);--ui5-v2-3-0-tag-set2-color-scheme-4-active-background: var(--sapIndicationColor_4_Active_Background);--ui5-v2-3-0-tag-set2-color-scheme-4-active-border: var(--sapIndicationColor_4_Active_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-5-color: var(--sapIndicationColor_5);--ui5-v2-3-0-tag-set2-color-scheme-5-background: var(--sapIndicationColor_5b);--ui5-v2-3-0-tag-set2-color-scheme-5-border: var(--sapIndicationColor_5b_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-5-hover-background: var(--sapIndicationColor_5b_Hover_Background);--ui5-v2-3-0-tag-set2-color-scheme-5-active-color: var(--sapIndicationColor_5_Active_TextColor);--ui5-v2-3-0-tag-set2-color-scheme-5-active-background: var(--sapIndicationColor_5_Active_Background);--ui5-v2-3-0-tag-set2-color-scheme-5-active-border: var(--sapIndicationColor_5_Active_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-6-color: var(--sapIndicationColor_6);--ui5-v2-3-0-tag-set2-color-scheme-6-background: var(--sapIndicationColor_6b);--ui5-v2-3-0-tag-set2-color-scheme-6-border: var(--sapIndicationColor_6b_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-6-hover-background: var(--sapIndicationColor_6b_Hover_Background);--ui5-v2-3-0-tag-set2-color-scheme-6-active-color: var(--sapIndicationColor_6_Active_TextColor);--ui5-v2-3-0-tag-set2-color-scheme-6-active-background: var(--sapIndicationColor_6_Active_Background);--ui5-v2-3-0-tag-set2-color-scheme-6-active-border: var(--sapIndicationColor_6_Active_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-7-color: var(--sapIndicationColor_7);--ui5-v2-3-0-tag-set2-color-scheme-7-background: var(--sapIndicationColor_7b);--ui5-v2-3-0-tag-set2-color-scheme-7-border: var(--sapIndicationColor_7b_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-7-hover-background: var(--sapIndicationColor_7b_Hover_Background);--ui5-v2-3-0-tag-set2-color-scheme-7-active-color: var(--sapIndicationColor_7_Active_TextColor);--ui5-v2-3-0-tag-set2-color-scheme-7-active-background: var(--sapIndicationColor_7_Active_Background);--ui5-v2-3-0-tag-set2-color-scheme-7-active-border: var(--sapIndicationColor_7_Active_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-8-color: var(--sapIndicationColor_8);--ui5-v2-3-0-tag-set2-color-scheme-8-background: var(--sapIndicationColor_8b);--ui5-v2-3-0-tag-set2-color-scheme-8-border: var(--sapIndicationColor_8b_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-8-hover-background: var(--sapIndicationColor_8b_Hover_Background);--ui5-v2-3-0-tag-set2-color-scheme-8-active-color: var(--sapIndicationColor_8_Active_TextColor);--ui5-v2-3-0-tag-set2-color-scheme-8-active-background: var(--sapIndicationColor_8_Active_Background);--ui5-v2-3-0-tag-set2-color-scheme-8-active-border: var(--sapIndicationColor_8_Active_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-9-color: var(--sapIndicationColor_9);--ui5-v2-3-0-tag-set2-color-scheme-9-background: var(--sapIndicationColor_9b);--ui5-v2-3-0-tag-set2-color-scheme-9-border: var(--sapIndicationColor_9b_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-10-color: var(--sapIndicationColor_10);--ui5-v2-3-0-tag-set2-color-scheme-10-background: var(--sapIndicationColor_10b);--ui5-v2-3-0-tag-set2-color-scheme-10-border: var(--sapIndicationColor_10b_BorderColor);--ui5-v2-3-0-tag-set2-color-scheme-10-hover-background: var(--sapIndicationColor_10b_Hover_Background);--ui5-v2-3-0-tag-set2-color-scheme-10-active-color: var(--sapIndicationColor_10_Active_TextColor);--ui5-v2-3-0-tag-set2-color-scheme-10-active-background: var(--sapIndicationColor_10_Active_Background);--ui5-v2-3-0-tag-set2-color-scheme-10-active-border: var(--sapIndicationColor_10_Active_BorderColor);--_ui5-v2-3-0-tag-height_size_l: 1.5rem;--_ui5-v2-3-0-tag-min-width_size_l: 1.75rem;--_ui5-v2-3-0-tag-font-size_size_l: 1.25rem;--_ui5-v2-3-0-tag-icon_min_width_size_l: 1.25rem;--_ui5-v2-3-0-tag-icon_min_height_size_l:1.25rem;--_ui5-v2-3-0-tag-icon_height_size_l: 1.25rem;--_ui5-v2-3-0-tag-text_padding_size_l: .125rem .25rem;--_ui5-v2-3-0-tag-text-height_size_l: 1.5rem;--_ui5-v2-3-0-tag-text-padding: .1875rem .25rem;--_ui5-v2-3-0-tag-padding-inline-icon-only: .313rem;--_ui5-v2-3-0-tag-text-transform: none;--_ui5-v2-3-0-tag-icon-gap: .25rem;--_ui5-v2-3-0-tag-font-size: var(--sapFontSize);--_ui5-v2-3-0-tag-font: var(--sapFontSemiboldDuplexFamily);--_ui5-v2-3-0-tag-font-weight: normal;--_ui5-v2-3-0-tag-letter-spacing: normal;--_ui5-v2-3-0_bar_base_height: 2.75rem;--_ui5-v2-3-0_bar_subheader_height: 3rem;--_ui5-v2-3-0_bar-start-container-padding-start: 2rem;--_ui5-v2-3-0_bar-mid-container-padding-start-end: .5rem;--_ui5-v2-3-0_bar-end-container-padding-end: 2rem;--_ui5-v2-3-0_bar-start-container-padding-start_S: 1rem;--_ui5-v2-3-0_bar-start-container-padding-start_XL: 3rem;--_ui5-v2-3-0_bar-end-container-padding-end_S: 1rem;--_ui5-v2-3-0_bar-end-container-padding-end_XL: 3rem;--_ui5-v2-3-0_bar_subheader_margin-top: -.0625rem;--_ui5-v2-3-0_breadcrumbs_margin: 0 0 .5rem 0;--_ui5-v2-3-0_busy_indicator_block_layer: color-mix(in oklch, transparent, var(--sapBlockLayer_Background) 20%);--_ui5-v2-3-0_busy_indicator_color: var(--sapContent_BusyColor);--_ui5-v2-3-0_busy_indicator_focus_outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-3-0-calendar-legend-root-padding: .75rem;--_ui5-v2-3-0-calendar-legend-root-width: 18.5rem;--_ui5-v2-3-0-calendar-legend-item-root-focus-margin: 0;--_ui5-v2-3-0-calendar-legend-item-root-width: 7.75rem;--_ui5-v2-3-0-calendar-legend-item-root-focus-border: var(--sapContent_FocusWidth) solid var(--sapContent_FocusColor);--_ui5-v2-3-0_card_box_shadow: var(--sapContent_Shadow0);--_ui5-v2-3-0_card_header_border_color: var(--sapTile_SeparatorColor);--_ui5-v2-3-0_card_header_focus_border: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-3-0_card_header_focus_bottom_radius: 0px;--_ui5-v2-3-0_card_header_title_font_weight: normal;--_ui5-v2-3-0_card_header_subtitle_margin_top: .25rem;--_ui5-v2-3-0_card_hover_box_shadow: var(--sapContent_Shadow2);--_ui5-v2-3-0_card_header_focus_offset: 0px;--_ui5-v2-3-0_card_header_focus_radius: var(--_ui5-v2-3-0_card_border-radius);--_ui5-v2-3-0_card_header_title_font_family: var(--sapFontHeaderFamily);--_ui5-v2-3-0_card_header_title_font_size: var(--sapFontHeader6Size);--_ui5-v2-3-0_card_header_hover_bg: var(--sapTile_Hover_Background);--_ui5-v2-3-0_card_header_active_bg: var(--sapTile_Active_Background);--_ui5-v2-3-0_card_header_border: none;--_ui5-v2-3-0_card_border-radius: var(--sapTile_BorderCornerRadius);--_ui5-v2-3-0_card_header_padding: 1rem 1rem .75rem 1rem;--_ui5-v2-3-0_card_border: none;--ui5-v2-3-0_carousel_background_color_solid: var(--sapGroup_ContentBackground);--ui5-v2-3-0_carousel_background_color_translucent: var(--sapBackgroundColor);--ui5-v2-3-0_carousel_button_size: 2.5rem;--ui5-v2-3-0_carousel_inactive_dot_size: .25rem;--ui5-v2-3-0_carousel_inactive_dot_margin: 0 .375rem;--ui5-v2-3-0_carousel_inactive_dot_border: 1px solid var(--sapContent_ForegroundBorderColor);--ui5-v2-3-0_carousel_inactive_dot_background: var(--sapContent_ForegroundBorderColor);--ui5-v2-3-0_carousel_active_dot_border: 1px solid var(--sapContent_Selected_ForegroundColor);--ui5-v2-3-0_carousel_active_dot_background: var(--sapContent_Selected_ForegroundColor);--ui5-v2-3-0_carousel_navigation_button_active_box_shadow: none;--_ui5-v2-3-0_checkbox_box_shadow: none;--_ui5-v2-3-0_checkbox_transition: unset;--_ui5-v2-3-0_checkbox_focus_border: none;--_ui5-v2-3-0_checkbox_border_radius: 0;--_ui5-v2-3-0_checkbox_focus_outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-3-0_checkbox_outer_hover_background: transparent;--_ui5-v2-3-0_checkbox_inner_width_height: 1.375rem;--_ui5-v2-3-0_checkbox_inner_disabled_border_color: var(--sapField_BorderColor);--_ui5-v2-3-0_checkbox_inner_information_box_shadow: none;--_ui5-v2-3-0_checkbox_inner_warning_box_shadow: none;--_ui5-v2-3-0_checkbox_inner_error_box_shadow: none;--_ui5-v2-3-0_checkbox_inner_success_box_shadow: none;--_ui5-v2-3-0_checkbox_inner_default_box_shadow: none;--_ui5-v2-3-0_checkbox_inner_background: var(--sapField_Background);--_ui5-v2-3-0_checkbox_wrapped_focus_padding: .375rem;--_ui5-v2-3-0_checkbox_wrapped_focus_inset_block: var(--_ui5-v2-3-0_checkbox_focus_position);--_ui5-v2-3-0_checkbox_compact_wrapper_padding: .5rem;--_ui5-v2-3-0_checkbox_compact_width_height: 2rem;--_ui5-v2-3-0_checkbox_compact_inner_size: 1rem;--_ui5-v2-3-0_checkbox_compact_focus_position: .375rem;--_ui5-v2-3-0_checkbox_label_offset: var(--_ui5-v2-3-0_checkbox_wrapper_padding);--_ui5-v2-3-0_checkbox_disabled_label_color: var(--sapContent_LabelColor);--_ui5-v2-3-0_checkbox_default_focus_border: none;--_ui5-v2-3-0_checkbox_focus_outline_display: block;--_ui5-v2-3-0_checkbox_wrapper_padding: .6875rem;--_ui5-v2-3-0_checkbox_width_height: 2.75rem;--_ui5-v2-3-0_checkbox_label_color: var(--sapField_TextColor);--_ui5-v2-3-0_checkbox_inner_border: solid var(--sapField_BorderWidth) var(--sapField_BorderColor);--_ui5-v2-3-0_checkbox_inner_border_radius: var(--sapField_BorderCornerRadius);--_ui5-v2-3-0_checkbox_checkmark_color: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-3-0_checkbox_hover_background: var(--sapContent_Selected_Hover_Background);--_ui5-v2-3-0_checkbox_inner_hover_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-3-0_checkbox_inner_hover_checked_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-3-0_checkbox_inner_selected_border_color: var(--sapField_BorderColor);--_ui5-v2-3-0_checkbox_inner_active_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-3-0_checkbox_active_background: var(--sapContent_Selected_Hover_Background);--_ui5-v2-3-0_checkbox_inner_readonly_border: var(--sapElement_BorderWidth) var(--sapField_ReadOnly_BorderColor) dashed;--_ui5-v2-3-0_checkbox_inner_error_border: var(--sapField_InvalidBorderWidth) solid var(--sapField_InvalidColor);--_ui5-v2-3-0_checkbox_inner_error_background_hover: var(--sapField_Hover_Background);--_ui5-v2-3-0_checkbox_inner_warning_border: var(--sapField_WarningBorderWidth) solid var(--sapField_WarningColor);--_ui5-v2-3-0_checkbox_inner_warning_color: var(--sapField_WarningColor);--_ui5-v2-3-0_checkbox_inner_warning_background_hover: var(--sapField_Hover_Background);--_ui5-v2-3-0_checkbox_checkmark_warning_color: var(--sapField_WarningColor);--_ui5-v2-3-0_checkbox_inner_success_border: var(--sapField_SuccessBorderWidth) solid var(--sapField_SuccessColor);--_ui5-v2-3-0_checkbox_inner_success_background_hover: var(--sapField_Hover_Background);--_ui5-v2-3-0_checkbox_inner_information_color: var(--sapField_InformationColor);--_ui5-v2-3-0_checkbox_inner_information_border: var(--sapField_InformationBorderWidth) solid var(--sapField_InformationColor);--_ui5-v2-3-0_checkbox_inner_information_background_hover: var(--sapField_Hover_Background);--_ui5-v2-3-0_checkbox_disabled_opacity: var(--sapContent_DisabledOpacity);--_ui5-v2-3-0_checkbox_focus_position: .3125rem;--_ui5-v2-3-0_checkbox_focus_border_radius: .5rem;--_ui5-v2-3-0_checkbox_right_focus_distance: var(--_ui5-v2-3-0_checkbox_focus_position);--_ui5-v2-3-0_color-palette-item-after-focus-inset: .0625rem;--_ui5-v2-3-0_color-palette-item-outer-border-radius: .25rem;--_ui5-v2-3-0_color-palette-item-inner-border-radius: .1875rem;--_ui5-v2-3-0_color-palette-item-after-not-focus-color: .0625rem solid var(--sapGroup_ContentBackground);--_ui5-v2-3-0_color-palette-item-container-sides-padding: .3125rem;--_ui5-v2-3-0_color-palette-item-container-rows-padding: .6875rem;--_ui5-v2-3-0_color-palette-item-focus-height: 1.5rem;--_ui5-v2-3-0_color-palette-item-container-padding: var(--_ui5-v2-3-0_color-palette-item-container-sides-padding) var(--_ui5-v2-3-0_color-palette-item-container-rows-padding);--_ui5-v2-3-0_color-palette-item-hover-margin: .0625rem;--_ui5-v2-3-0_color-palette-row-height: 9.5rem;--_ui5-v2-3-0_color-palette-button-height: 3rem;--_ui5-v2-3-0_color-palette-item-before-focus-color: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-3-0_color-palette-item-before-focus-inset: -.3125rem;--_ui5-v2-3-0_color-palette-item-before-focus-hover-inset: -.0625rem;--_ui5-v2-3-0_color-palette-item-after-focus-color: .0625rem solid var(--sapContent_ContrastFocusColor);--_ui5-v2-3-0_color-palette-item-selected-focused-border-after: none;--_ui5-v2-3-0_color-palette-item-after-focus-hover-inset: .0625rem;--_ui5-v2-3-0_color-palette-item-before-focus-border-radius: .4375rem;--_ui5-v2-3-0_color-palette-item-after-focus-border-radius: .3125rem;--_ui5-v2-3-0_color-palette-item-hover-outer-border-radius: .4375rem;--_ui5-v2-3-0_color-palette-item-hover-inner-border-radius: .375rem;--_ui5-v2-3-0_color-palette-item-selected-focused-border-before: -.0625rem;--_ui5-v2-3-0_color-palette-item-after-focus-not-selected-border: none;--_ui5-v2-3-0_color-palette-item-selected-focused-border: none;--_ui5-v2-3-0_color_picker_circle_outer_border: .0625rem solid var(--sapContent_ContrastShadowColor);--_ui5-v2-3-0_color_picker_circle_inner_border: .0625rem solid var(--sapField_BorderColor);--_ui5-v2-3-0_color_picker_circle_inner_circle_size: .5625rem;--_ui5-v2-3-0_color_picker_slider_handle_box_shadow: .125rem solid var(--sapField_BorderColor);--_ui5-v2-3-0_color_picker_slider_handle_border: .125rem solid var(--sapField_BorderColor);--_ui5-v2-3-0_color_picker_slider_handle_outline_hover: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-3-0_color_picker_slider_handle_outline_focus: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-3-0_color_picker_slider_handle_margin_top: -.1875rem;--_ui5-v2-3-0_color_picker_slider_handle_focus_margin_top: var(--_ui5-v2-3-0_color_picker_slider_handle_margin_top);--_ui5-v2-3-0_color_picker_slider_container_margin_top: -11px;--_ui5-v2-3-0_color_picker_slider_handle_inline_focus: 1px solid var(--sapContent_ContrastFocusColor);--_ui5-v2-3-0_datepicker_icon_border: none;--_ui5-v2-3-0-datepicker-hover-background: var(--sapField_Hover_Background);--_ui5-v2-3-0-datepicker_border_radius: .25rem;--_ui5-v2-3-0-datepicker_icon_border_radius: .125rem;--_ui5-v2-3-0_daypicker_item_box_shadow: inset 0 0 0 .0625rem var(--sapContent_Selected_ForegroundColor);--_ui5-v2-3-0_daypicker_item_margin: 2px;--_ui5-v2-3-0_daypicker_item_border: none;--_ui5-v2-3-0_daypicker_item_selected_border_color: var(--sapList_Background);--_ui5-v2-3-0_daypicker_daynames_container_height: 2rem;--_ui5-v2-3-0_daypicker_weeknumbers_container_padding_top: 2rem;--_ui5-v2-3-0_daypicker_item_othermonth_background_color: var(--sapList_Background);--_ui5-v2-3-0_daypicker_item_othermonth_color: var(--sapContent_LabelColor);--_ui5-v2-3-0_daypicker_item_othermonth_hover_color: var(--sapContent_LabelColor);--_ui5-v2-3-0_daypicker_item_now_inner_border_radius: 0;--_ui5-v2-3-0_daypicker_item_outline_width: 1px;--_ui5-v2-3-0_daypicker_item_outline_offset: 1px;--_ui5-v2-3-0_daypicker_item_now_focus_after_width: calc(100% - .25rem) ;--_ui5-v2-3-0_daypicker_item_now_focus_after_height: calc(100% - .25rem) ;--_ui5-v2-3-0_daypicker_item_now_selected_focus_after_width: calc(100% - .375rem) ;--_ui5-v2-3-0_daypicker_item_now_selected_focus_after_height: calc(100% - .375rem) ;--_ui5-v2-3-0_daypicker_item_selected_background: transparent;--_ui5-v2-3-0_daypicker_item_outline_focus_after: none;--_ui5-v2-3-0_daypicker_item_border_focus_after: var(--_ui5-v2-3-0_daypicker_item_outline_width) dotted var(--sapContent_FocusColor);--_ui5-v2-3-0_daypicker_item_width_focus_after: calc(100% - .25rem) ;--_ui5-v2-3-0_daypicker_item_height_focus_after: calc(100% - .25rem) ;--_ui5-v2-3-0_daypicker_item_now_outline: none;--_ui5-v2-3-0_daypicker_item_now_outline_offset: none;--_ui5-v2-3-0_daypicker_item_now_outline_offset_focus_after: var(--_ui5-v2-3-0_daypicker_item_now_outline_offset);--_ui5-v2-3-0_daypicker_item_selected_between_hover_background: var(--sapList_Hover_SelectionBackground);--_ui5-v2-3-0_daypicker_item_now_not_selected_inset: 0;--_ui5-v2-3-0_daypicker_item_now_border_color: var(--sapLegend_CurrentDateTime);--_ui5-v2-3-0_dp_two_calendar_item_secondary_text_border_radios: .25rem;--_ui5-v2-3-0_daypicker_special_day_top: 2.5rem;--_ui5-v2-3-0_daypicker_special_day_before_border_color: var(--sapList_Background);--_ui5-v2-3-0_daypicker_selected_item_now_special_day_border_bottom_radius: 0;--_ui5-v2-3-0_daypicker_twocalendar_item_special_day_after_border_width: .125rem;--_ui5-v2-3-0_daypicker_twocalendar_item_special_day_dot: .375rem;--_ui5-v2-3-0_daypicker_twocalendar_item_special_day_top: 2rem;--_ui5-v2-3-0_daypicker_twocalendar_item_special_day_right: 1.4375rem;--_ui5-v2-3-0_daypicker_item_border_radius: .4375rem;--_ui5-v2-3-0_daypicker_item_focus_border: .0625rem dotted var(--sapContent_FocusColor);--_ui5-v2-3-0_daypicker_item_selected_border: .0625rem solid var(--sapList_SelectionBorderColor);--_ui5-v2-3-0_daypicker_item_not_selected_focus_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-3-0_daypicker_item_selected_focus_color: var(--sapContent_FocusColor);--_ui5-v2-3-0_daypicker_item_selected_focus_width: .125rem;--_ui5-v2-3-0_daypicker_item_no_selected_inset: .375rem;--_ui5-v2-3-0_daypicker_item_now_border_focus_after: .125rem solid var(--sapList_SelectionBorderColor);--_ui5-v2-3-0_daypicker_item_now_border_radius_focus_after: .3125rem;--_ui5-v2-3-0_day_picker_item_selected_now_border_focus: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-3-0_day_picker_item_selected_now_border_radius_focus: .1875rem;--ui5-v2-3-0-dp-item_withsecondtype_border: .375rem;--_ui5-v2-3-0_daypicker_item_now_border: .125rem solid var(--sapLegend_CurrentDateTime);--_ui5-v2-3-0_daypicker_dayname_color: var(--sapContent_LabelColor);--_ui5-v2-3-0_daypicker_weekname_color: var(--sapContent_LabelColor);--_ui5-v2-3-0_daypicker_item_selected_box_shadow: inset 0 0 0 .0625rem var(--sapContent_Selected_ForegroundColor);--_ui5-v2-3-0_daypicker_item_selected_daytext_hover_background: transparent;--_ui5-v2-3-0_daypicker_item_border_radius_item: .5rem;--_ui5-v2-3-0_daypicker_item_border_radius_focus_after: .1875rem;--_ui5-v2-3-0_daypicker_item_selected_between_border: .5rem;--_ui5-v2-3-0_daypicker_item_selected_between_background: var(--sapList_SelectionBackgroundColor);--_ui5-v2-3-0_daypicker_item_selected_between_text_background: transparent;--_ui5-v2-3-0_daypicker_item_selected_between_text_font: var(--sapFontFamily);--_ui5-v2-3-0_daypicker_item_selected_text_font: var(--sapFontBoldFamily);--_ui5-v2-3-0_daypicker_item_now_box_shadow: inset 0 0 0 .35rem var(--sapList_Background);--_ui5-v2-3-0_daypicker_item_selected_text_outline: .0625rem solid var(--sapSelectedColor);--_ui5-v2-3-0_daypicker_item_now_selected_outline_offset: -.25rem;--_ui5-v2-3-0_daypicker_item_now_selected_between_inset: .25rem;--_ui5-v2-3-0_daypicker_item_now_selected_between_border: .0625rem solid var(--sapContent_Selected_ForegroundColor);--_ui5-v2-3-0_daypicker_item_now_selected_between_border_radius: .1875rem;--_ui5-v2-3-0_daypicker_item_select_between_border: 1px solid var(--sapContent_Selected_ForegroundColor);--_ui5-v2-3-0_daypicker_item_weeekend_filter: brightness(105%);--_ui5-v2-3-0_daypicker_item_selected_hover: var(--sapList_Hover_Background);--_ui5-v2-3-0_daypicker_item_now_inset: .3125rem;--_ui5-v2-3-0-dp-item_withsecondtype_border: .25rem;--_ui5-v2-3-0_daypicker_item_selected__secondary_type_text_outline: .0625rem solid var(--sapSelectedColor);--_ui5-v2-3-0_daypicker_two_calendar_item_now_day_text_content: "";--_ui5-v2-3-0_daypicker_two_calendar_item_now_selected_border_width: .125rem;--_ui5-v2-3-0_daypicker_two_calendar_item_border_radius: .5rem;--_ui5-v2-3-0_daypicker_two_calendar_item_border_focus_border_radius: .375rem;--_ui5-v2-3-0_daypicker_two_calendar_item_no_selected_inset: 0;--_ui5-v2-3-0_daypicker_two_calendar_item_selected_now_border_radius_focus: .1875rem;--_ui5-v2-3-0_daypicker_two_calendar_item_no_selected_focus_inset: .1875rem;--_ui5-v2-3-0_daypicker_two_calendar_item_no_select_focus_border_radius: .3125rem;--_ui5-v2-3-0_daypicker_two_calendar_item_now_inset: .3125rem;--_ui5-v2-3-0_daypicker_two_calendar_item_now_selected_border_inset: .125rem;--_ui5-v2-3-0_daypicker_selected_item_special_day_width: calc(100% - .125rem) ;--_ui5-v2-3-0_daypicker_special_day_border_bottom_radius: .5rem;--_ui5-v2-3-0-daypicker_item_selected_now_border_radius: .5rem;--_ui5-v2-3-0_daypicker_selected_item_now_special_day_width: calc(100% - .1875rem) ;--_ui5-v2-3-0_daypicker_selected_item_now_special_day_border_bottom_radius_alternate: .5rem;--_ui5-v2-3-0_daypicker_selected_item_now_special_day_top: 2.4375rem;--_ui5-v2-3-0_daypicker_two_calendar_item_margin_bottom: 0;--_ui5-v2-3-0_daypicker_twocalendar_item_special_day_now_inset: .3125rem;--_ui5-v2-3-0_daypicker_twocalendar_item_special_day_now_border_radius: .25rem;--_ui5-v2-3-0_daypicker_item_now_focus_margin: 0;--_ui5-v2-3-0_daypicker_special_day_border_top: none;--_ui5-v2-3-0_daypicker_special_day_selected_border_radius_bottom: .25rem;--_ui5-v2-3-0_daypicker_specialday_focused_top: 2.125rem;--_ui5-v2-3-0_daypicker_specialday_focused_width: calc(100% - .75rem) ;--_ui5-v2-3-0_daypicker_specialday_focused_border_bottom: 0;--_ui5-v2-3-0_daypicker_item_now_specialday_top: 2.3125rem;--_ui5-v2-3-0_daypicker_item_now_specialday_width: calc(100% - .5rem) ;--_ui5-v2-3-0_dialog_header_error_state_icon_color: var(--sapNegativeElementColor);--_ui5-v2-3-0_dialog_header_information_state_icon_color: var(--sapInformativeElementColor);--_ui5-v2-3-0_dialog_header_success_state_icon_color: var(--sapPositiveElementColor);--_ui5-v2-3-0_dialog_header_warning_state_icon_color: var(--sapCriticalElementColor);--_ui5-v2-3-0_dialog_header_state_line_height: .0625rem;--_ui5-v2-3-0_dialog_header_focus_bottom_offset: 2px;--_ui5-v2-3-0_dialog_header_focus_top_offset: 1px;--_ui5-v2-3-0_dialog_header_focus_left_offset: 1px;--_ui5-v2-3-0_dialog_header_focus_right_offset: 1px;--_ui5-v2-3-0_dialog_header_border_radius: var(--sapElement_BorderCornerRadius);--_ui5-v2-3-0_file_uploader_value_state_error_hover_background_color: var(--sapField_Hover_Background);--_ui5-v2-3-0_file_uploader_hover_border: none;--_ui5-v2-3-0_table_cell_valign: center;--_ui5-v2-3-0_table_cell_min_width: 2.75rem;--_ui5-v2-3-0_table_navigated_cell_width: .1875rem;--_ui5-v2-3-0_table_shadow_border_left: inset var(--sapContent_FocusWidth) 0 var(--sapContent_FocusColor);--_ui5-v2-3-0_table_shadow_border_right: inset calc(-1 * var(--sapContent_FocusWidth)) 0 var(--sapContent_FocusColor);--_ui5-v2-3-0_table_shadow_border_top: inset 0 var(--sapContent_FocusWidth) var(--sapContent_FocusColor);--_ui5-v2-3-0_table_shadow_border_bottom: inset 0 -1px var(--sapContent_FocusColor);--ui5-v2-3-0-form-item-layout: 1fr 2fr;--ui5-v2-3-0-form-item-layout-span1: 1fr 11fr;--ui5-v2-3-0-form-item-layout-span2: 2fr 10fr;--ui5-v2-3-0-form-item-layout-span3: 3fr 9fr;--ui5-v2-3-0-form-item-layout-span4: 4fr 8fr;--ui5-v2-3-0-form-item-layout-span5: 5fr 7fr;--ui5-v2-3-0-form-item-layout-span6: 6fr 6fr;--ui5-v2-3-0-form-item-layout-span7: 7fr 5fr;--ui5-v2-3-0-form-item-layout-span8: 8fr 4fr;--ui5-v2-3-0-form-item-layout-span9: 9fr 3fr;--ui5-v2-3-0-form-item-layout-span10: 10fr 2fr;--ui5-v2-3-0-form-item-layout-span11: 11fr 1fr;--ui5-v2-3-0-form-item-layout-span12: 1fr;--ui5-v2-3-0-form-item-label-justify: end;--ui5-v2-3-0-form-item-label-justify-span12: start;--ui5-v2-3-0-form-item-label-padding: .125rem 0;--ui5-v2-3-0-form-item-label-padding-end: .85rem;--ui5-v2-3-0-form-item-label-padding-span12: .625rem .25rem 0 .25rem;--ui5-v2-3-0-group-header-listitem-background-color: var(--sapList_GroupHeaderBackground);--ui5-v2-3-0-icon-focus-border-radius: .25rem;--_ui5-v2-3-0_input_width: 13.125rem;--_ui5-v2-3-0_input_min_width: 2.75rem;--_ui5-v2-3-0_input_height: var(--sapElement_Height);--_ui5-v2-3-0_input_compact_height: 1.625rem;--_ui5-v2-3-0_input_value_state_error_hover_background: var(--sapField_Hover_Background);--_ui5-v2-3-0_input_background_color: var(--sapField_Background);--_ui5-v2-3-0_input_border_radius: var(--sapField_BorderCornerRadius);--_ui5-v2-3-0_input_placeholder_style: italic;--_ui5-v2-3-0_input_placeholder_color: var(--sapField_PlaceholderTextColor);--_ui5-v2-3-0_input_bottom_border_height: 0;--_ui5-v2-3-0_input_bottom_border_color: transparent;--_ui5-v2-3-0_input_focused_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-3-0_input_state_border_width: .125rem;--_ui5-v2-3-0_input_information_border_width: .125rem;--_ui5-v2-3-0_input_error_font_weight: normal;--_ui5-v2-3-0_input_warning_font_weight: normal;--_ui5-v2-3-0_input_focus_border_width: 1px;--_ui5-v2-3-0_input_error_warning_font_style: inherit;--_ui5-v2-3-0_input_error_warning_text_indent: 0;--_ui5-v2-3-0_input_disabled_color: var(--sapContent_DisabledTextColor);--_ui5-v2-3-0_input_disabled_font_weight: normal;--_ui5-v2-3-0_input_disabled_border_color: var(--sapField_BorderColor);--_ui5-v2-3-0-input_disabled_background: var(--sapField_Background);--_ui5-v2-3-0_input_readonly_border_color: var(--sapField_ReadOnly_BorderColor);--_ui5-v2-3-0_input_readonly_background: var(--sapField_ReadOnly_Background);--_ui5-v2-3-0_input_disabled_opacity: var(--sapContent_DisabledOpacity);--_ui5-v2-3-0_input_icon_min_width: 2.25rem;--_ui5-v2-3-0_input_compact_min_width: 2rem;--_ui5-v2-3-0_input_transition: none;--_ui5-v2-3-0-input-value-state-icon-display: none;--_ui5-v2-3-0_input_value_state_error_border_color: var(--sapField_InvalidColor);--_ui5-v2-3-0_input_focused_value_state_error_border_color: var(--sapField_InvalidColor);--_ui5-v2-3-0_input_value_state_warning_border_color: var(--sapField_WarningColor);--_ui5-v2-3-0_input_focused_value_state_warning_border_color: var(--sapField_WarningColor);--_ui5-v2-3-0_input_value_state_success_border_color: var(--sapField_SuccessColor);--_ui5-v2-3-0_input_focused_value_state_success_border_color: var(--sapField_SuccessColor);--_ui5-v2-3-0_input_value_state_success_border_width: 1px;--_ui5-v2-3-0_input_value_state_information_border_color: var(--sapField_InformationColor);--_ui5-v2-3-0_input_focused_value_state_information_border_color: var(--sapField_InformationColor);--_ui5-v2-3-0-input-value-state-information-border-width: 1px;--_ui5-v2-3-0-input-background-image: none;--ui5-v2-3-0_input_focus_pseudo_element_content: "";--_ui5-v2-3-0_input_value_state_error_warning_placeholder_font_weight: normal;--_ui5-v2-3-0-input_error_placeholder_color: var(--sapField_PlaceholderTextColor);--_ui5-v2-3-0_input_icon_width: 2.25rem;--_ui5-v2-3-0-input-icons-count: 0;--_ui5-v2-3-0_input_margin_top_bottom: .1875rem;--_ui5-v2-3-0_input_tokenizer_min_width: 3.25rem;--_ui5-v2-3-0-input-border: none;--_ui5-v2-3-0_input_hover_border: none;--_ui5-v2-3-0_input_focus_border_radius: .25rem;--_ui5-v2-3-0_input_readonly_focus_border_radius: .125rem;--_ui5-v2-3-0_input_error_warning_border_style: none;--_ui5-v2-3-0_input_focused_value_state_error_background: var(--sapField_Hover_Background);--_ui5-v2-3-0_input_focused_value_state_warning_background: var(--sapField_Hover_Background);--_ui5-v2-3-0_input_focused_value_state_success_background: var(--sapField_Hover_Background);--_ui5-v2-3-0_input_focused_value_state_information_background: var(--sapField_Hover_Background);--_ui5-v2-3-0_input_focused_value_state_error_focus_outline_color: var(--sapField_InvalidColor);--_ui5-v2-3-0_input_focused_value_state_warning_focus_outline_color: var(--sapField_WarningColor);--_ui5-v2-3-0_input_focused_value_state_success_focus_outline_color: var(--sapField_SuccessColor);--_ui5-v2-3-0_input_focus_offset: 0;--_ui5-v2-3-0_input_readonly_focus_offset: .125rem;--_ui5-v2-3-0_input_information_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-3-0_input_information_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-3-0_input_error_warning_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-3-0_input_error_warning_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-3-0_input_custom_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-3-0_input_error_warning_custom_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-3-0_input_error_warning_custom_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-3-0_input_information_custom_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-3-0_input_information_custom_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-3-0_input_focus_outline_color: var(--sapField_Active_BorderColor);--_ui5-v2-3-0_input_icon_wrapper_height: calc(100% - 1px) ;--_ui5-v2-3-0_input_icon_wrapper_state_height: calc(100% - 2px) ;--_ui5-v2-3-0_input_icon_wrapper_success_state_height: calc(100% - var(--_ui5-v2-3-0_input_value_state_success_border_width));--_ui5-v2-3-0_input_icon_color: var(--sapContent_IconColor);--_ui5-v2-3-0_input_icon_pressed_bg: var(--sapButton_Selected_Background);--_ui5-v2-3-0_input_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-3-0_input_icon_hover_bg: var(--sapField_Focus_Background);--_ui5-v2-3-0_input_icon_pressed_color: var(--sapButton_Active_TextColor);--_ui5-v2-3-0_input_icon_border_radius: .25rem;--_ui5-v2-3-0_input_icon_box_shadow: var(--sapField_Hover_Shadow);--_ui5-v2-3-0_input_icon_border: none;--_ui5-v2-3-0_input_error_icon_box_shadow: var(--sapContent_Negative_Shadow);--_ui5-v2-3-0_input_warning_icon_box_shadow: var(--sapContent_Critical_Shadow);--_ui5-v2-3-0_input_information_icon_box_shadow: var(--sapContent_Informative_Shadow);--_ui5-v2-3-0_input_success_icon_box_shadow: var(--sapContent_Positive_Shadow);--_ui5-v2-3-0_input_icon_error_pressed_color: var(--sapButton_Reject_Selected_TextColor);--_ui5-v2-3-0_input_icon_warning_pressed_color: var(--sapButton_Attention_Selected_TextColor);--_ui5-v2-3-0_input_icon_information_pressed_color: var(--sapButton_Selected_TextColor);--_ui5-v2-3-0_input_icon_success_pressed_color: var(--sapButton_Accept_Selected_TextColor);--_ui5-v2-3-0_link_focus_text_decoration: underline;--_ui5-v2-3-0_link_text_decoration: var(--sapLink_TextDecoration);--_ui5-v2-3-0_link_hover_text_decoration: var(--sapLink_Hover_TextDecoration);--_ui5-v2-3-0_link_focused_hover_text_decoration: none;--_ui5-v2-3-0_link_focused_hover_text_color: var(--sapContent_ContrastTextColor);--_ui5-v2-3-0_link_active_text_decoration: var(--sapLink_Active_TextDecoration);--_ui5-v2-3-0_link_outline: none;--_ui5-v2-3-0_link_focus_border-radius: .125rem;--_ui5-v2-3-0_link_focus_background_color: var(--sapContent_FocusColor);--_ui5-v2-3-0_link_focus_color: var(--sapContent_ContrastTextColor);--_ui5-v2-3-0_link_subtle_text_decoration: underline;--_ui5-v2-3-0_link_subtle_text_decoration_hover: none;--ui5-v2-3-0_list_footer_text_color: var(--sapList_FooterTextColor);--ui5-v2-3-0-listitem-background-color: var(--sapList_Background);--ui5-v2-3-0-listitem-border-bottom: var(--sapList_BorderWidth) solid var(--sapList_BorderColor);--ui5-v2-3-0-listitem-selected-border-bottom: 1px solid var(--sapList_SelectionBorderColor);--ui5-v2-3-0-listitem-focused-selected-border-bottom: 1px solid var(--sapList_SelectionBorderColor);--_ui5-v2-3-0_listitembase_focus_width: 1px;--_ui5-v2-3-0-listitembase_disabled_opacity: .5;--_ui5-v2-3-0_product_switch_item_border: none;--ui5-v2-3-0-listitem-active-border-color: var(--sapContent_FocusColor);--_ui5-v2-3-0_menu_item_padding: 0 1rem 0 .75rem;--_ui5-v2-3-0_menu_item_submenu_icon_right: 1rem;--_ui5-v2-3-0_menu_item_additional_text_start_margin: 1rem;--_ui5-v2-3-0_menu_popover_border_radius: var(--sapPopover_BorderCornerRadius);--_ui5-v2-3-0_monthpicker_item_margin: .0625rem;--_ui5-v2-3-0_monthpicker_item_border: .0625rem solid var(--sapButton_Lite_BorderColor);--_ui5-v2-3-0_monthpicker_item_hover_border: .0625rem solid var(--sapButton_Lite_Hover_BorderColor);--_ui5-v2-3-0_monthpicker_item_active_border: .0625rem solid var(--sapButton_Lite_Active_BorderColor);--_ui5-v2-3-0_monthpicker_item_selected_border: .0625rem solid var(--sapButton_Selected_BorderColor);--_ui5-v2-3-0_monthpicker_item_selected_hover_border: .0625rem solid var(--sapButton_Selected_Hover_BorderColor);--_ui5-v2-3-0_monthpicker_item_border_radius: .5rem;--_ui5-v2-3-0_message_strip_icon_width: 2.5rem;--_ui5-v2-3-0_message_strip_button_border_width: 0;--_ui5-v2-3-0_message_strip_button_border_style: none;--_ui5-v2-3-0_message_strip_button_border_color: transparent;--_ui5-v2-3-0_message_strip_button_border_radius: 0;--_ui5-v2-3-0_message_strip_padding: .4375rem 2.5rem .4375rem 2.5rem;--_ui5-v2-3-0_message_strip_padding_block_no_icon: .4375rem .4375rem;--_ui5-v2-3-0_message_strip_padding_inline_no_icon: 1rem 2.5rem;--_ui5-v2-3-0_message_strip_button_height: 1.625rem;--_ui5-v2-3-0_message_strip_border_width: 1px;--_ui5-v2-3-0_message_strip_close_button_border: none;--_ui5-v2-3-0_message_strip_icon_top: .4375rem;--_ui5-v2-3-0_message_strip_focus_width: 1px;--_ui5-v2-3-0_message_strip_focus_offset: -2px;--_ui5-v2-3-0_message_strip_close_button_top: .125rem;--_ui5-v2-3-0_message_strip_close_button_color_set_1_background: #eaecee4d;--_ui5-v2-3-0_message_strip_close_button_color_set_2_background: #eaecee80;--_ui5-v2-3-0_message_strip_close_button_color_set_1_color: var(--sapButton_Emphasized_TextColor);--_ui5-v2-3-0_message_strip_close_button_color_set_1_hover_color: var(--sapButton_Emphasized_TextColor);--_ui5-v2-3-0_message_strip_scheme_1_set_2_background: var(--sapIndicationColor_1b);--_ui5-v2-3-0_message_strip_scheme_1_set_2_border_color: var(--sapIndicationColor_1b_BorderColor);--_ui5-v2-3-0_message_strip_scheme_2_set_2_background: var(--sapIndicationColor_2b);--_ui5-v2-3-0_message_strip_scheme_2_set_2_border_color: var(--sapIndicationColor_2b_BorderColor);--_ui5-v2-3-0_message_strip_scheme_3_set_2_background: var(--sapIndicationColor_3b);--_ui5-v2-3-0_message_strip_scheme_3_set_2_border_color: var(--sapIndicationColor_3b_BorderColor);--_ui5-v2-3-0_message_strip_scheme_4_set_2_background: var(--sapIndicationColor_4b);--_ui5-v2-3-0_message_strip_scheme_4_set_2_border_color: var(--sapIndicationColor_4b_BorderColor);--_ui5-v2-3-0_message_strip_scheme_5_set_2_background: var(--sapIndicationColor_5b);--_ui5-v2-3-0_message_strip_scheme_5_set_2_border_color: var(--sapIndicationColor_5b_BorderColor);--_ui5-v2-3-0_message_strip_scheme_6_set_2_background: var(--sapIndicationColor_6b);--_ui5-v2-3-0_message_strip_scheme_6_set_2_border_color: var(--sapIndicationColor_6b_BorderColor);--_ui5-v2-3-0_message_strip_scheme_7_set_2_background: var(--sapIndicationColor_7b);--_ui5-v2-3-0_message_strip_scheme_7_set_2_border_color: var(--sapIndicationColor_7b_BorderColor);--_ui5-v2-3-0_message_strip_scheme_8_set_2_background: var(--sapIndicationColor_8b);--_ui5-v2-3-0_message_strip_scheme_8_set_2_border_color: var(--sapIndicationColor_8b_BorderColor);--_ui5-v2-3-0_message_strip_scheme_9_set_2_background: var(--sapIndicationColor_9b);--_ui5-v2-3-0_message_strip_scheme_9_set_2_border_color: var(--sapIndicationColor_9b_BorderColor);--_ui5-v2-3-0_message_strip_scheme_10_set_2_background: var(--sapIndicationColor_10b);--_ui5-v2-3-0_message_strip_scheme_10_set_2_border_color: var(--sapIndicationColor_10b_BorderColor);--_ui5-v2-3-0_message_strip_close_button_right: .1875rem;--_ui5-v2-3-0_panel_focus_border: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-3-0_panel_header_height: 2.75rem;--_ui5-v2-3-0_panel_button_root_width: 2.75rem;--_ui5-v2-3-0_panel_button_root_height: 2.75rem;--_ui5-v2-3-0_panel_header_padding_right: .5rem;--_ui5-v2-3-0_panel_header_button_wrapper_padding: .25rem;--_ui5-v2-3-0_panel_border_radius: var(--sapElement_BorderCornerRadius);--_ui5-v2-3-0_panel_border_bottom: none;--_ui5-v2-3-0_panel_default_header_border: .0625rem solid var(--sapGroup_TitleBorderColor);--_ui5-v2-3-0_panel_outline_offset: -.125rem;--_ui5-v2-3-0_panel_border_radius_expanded: var(--sapElement_BorderCornerRadius) var(--sapElement_BorderCornerRadius) 0 0;--_ui5-v2-3-0_panel_icon_color: var(--sapButton_Lite_TextColor);--_ui5-v2-3-0_panel_focus_offset: 0px;--_ui5-v2-3-0_panel_focus_bottom_offset: -1px;--_ui5-v2-3-0_panel_content_padding: .625rem 1rem;--_ui5-v2-3-0_panel_header_background_color: var(--sapGroup_TitleBackground);--_ui5-v2-3-0_popover_background: var(--sapGroup_ContentBackground);--_ui5-v2-3-0_popover_box_shadow: var(--sapContent_Shadow2);--_ui5-v2-3-0_popover_no_arrow_box_shadow: var(--sapContent_Shadow1);--_ui5-v2-3-0_popup_content_padding_s: 1rem;--_ui5-v2-3-0_popup_content_padding_m_l: 2rem;--_ui5-v2-3-0_popup_content_padding_xl: 3rem;--_ui5-v2-3-0_popup_header_footer_padding_s: 1rem;--_ui5-v2-3-0_popup_header_footer_padding_m_l: 2rem;--_ui5-v2-3-0_popup_header_footer_padding_xl: 3rem;--_ui5-v2-3-0_popup_viewport_margin: 10px;--_ui5-v2-3-0_popup_header_font_weight: 400;--_ui5-v2-3-0_popup_header_prop_header_text_alignment: flex-start;--_ui5-v2-3-0_popup_header_background: var(--sapPageHeader_Background);--_ui5-v2-3-0_popup_header_shadow: var(--sapContent_HeaderShadow);--_ui5-v2-3-0_popup_header_border: none;--_ui5-v2-3-0_popup_border_radius: .5rem;--_ui5-v2-3-0_popup_block_layer_background: var(--sapBlockLayer_Background);--_ui5-v2-3-0_popup_block_layer_opacity: .2;--_ui5-v2-3-0_progress_indicator_bar_border_max: none;--_ui5-v2-3-0_progress_indicator_icon_visibility: inline-block;--_ui5-v2-3-0_progress_indicator_side_points_visibility: block;--_ui5-v2-3-0_progress_indicator_padding: 1.25rem 0 .75rem 0;--_ui5-v2-3-0_progress_indicator_padding_novalue: .3125rem;--_ui5-v2-3-0_progress_indicator_padding_end: 1.25rem;--_ui5-v2-3-0_progress_indicator_host_height: unset;--_ui5-v2-3-0_progress_indicator_host_min_height: unset;--_ui5-v2-3-0_progress_indicator_host_box_sizing: border-box;--_ui5-v2-3-0_progress_indicator_root_position: relative;--_ui5-v2-3-0_progress_indicator_root_border_radius: .25rem;--_ui5-v2-3-0_progress_indicator_root_height: .375rem;--_ui5-v2-3-0_progress_indicator_root_min_height: .375rem;--_ui5-v2-3-0_progress_indicator_root_overflow: visible;--_ui5-v2-3-0_progress_indicator_bar_height: .625rem;--_ui5-v2-3-0_progress_indicator_bar_border_radius: .5rem;--_ui5-v2-3-0_progress_indicator_remaining_bar_border_radius: .25rem;--_ui5-v2-3-0_progress_indicator_remaining_bar_position: absolute;--_ui5-v2-3-0_progress_indicator_remaining_bar_width: 100%;--_ui5-v2-3-0_progress_indicator_remaining_bar_overflow: visible;--_ui5-v2-3-0_progress_indicator_icon_position: absolute;--_ui5-v2-3-0_progress_indicator_icon_right_position: -1.25rem;--_ui5-v2-3-0_progress_indicator_value_margin: 0 0 .1875rem 0;--_ui5-v2-3-0_progress_indicator_value_position: absolute;--_ui5-v2-3-0_progress_indicator_value_top_position: -1.3125rem;--_ui5-v2-3-0_progress_indicator_value_left_position: 0;--_ui5-v2-3-0_progress_indicator_background_none: var(--sapProgress_Background);--_ui5-v2-3-0_progress_indicator_background_error: var(--sapProgress_NegativeBackground);--_ui5-v2-3-0_progress_indicator_background_warning: var(--sapProgress_CriticalBackground);--_ui5-v2-3-0_progress_indicator_background_success: var(--sapProgress_PositiveBackground);--_ui5-v2-3-0_progress_indicator_background_information: var(--sapProgress_InformationBackground);--_ui5-v2-3-0_progress_indicator_value_state_none: var(--sapProgress_Value_Background);--_ui5-v2-3-0_progress_indicator_value_state_error: var(--sapProgress_Value_NegativeBackground);--_ui5-v2-3-0_progress_indicator_value_state_warning: var(--sapProgress_Value_CriticalBackground);--_ui5-v2-3-0_progress_indicator_value_state_success: var(--sapProgress_Value_PositiveBackground);--_ui5-v2-3-0_progress_indicator_value_state_information: var(--sapProgress_Value_InformationBackground);--_ui5-v2-3-0_progress_indicator_value_state_error_icon_color: var(--sapProgress_Value_NegativeTextColor);--_ui5-v2-3-0_progress_indicator_value_state_warning_icon_color: var(--sapProgress_Value_CriticalTextColor);--_ui5-v2-3-0_progress_indicator_value_state_success_icon_color: var(--sapProgress_Value_PositiveTextColor);--_ui5-v2-3-0_progress_indicator_value_state_information_icon_color: var(--sapProgress_Value_InformationTextColor);--_ui5-v2-3-0_progress_indicator_border: none;--_ui5-v2-3-0_progress_indicator_border_color_error: var(--sapErrorBorderColor);--_ui5-v2-3-0_progress_indicator_border_color_warning: var(--sapWarningBorderColor);--_ui5-v2-3-0_progress_indicator_border_color_success: var(--sapSuccessBorderColor);--_ui5-v2-3-0_progress_indicator_border_color_information: var(--sapInformationBorderColor);--_ui5-v2-3-0_progress_indicator_color: var(--sapField_TextColor);--_ui5-v2-3-0_progress_indicator_bar_color: var(--sapProgress_TextColor);--_ui5-v2-3-0_progress_indicator_icon_size: var(--sapFontLargeSize);--_ui5-v2-3-0_rating_indicator_item_height: 1em;--_ui5-v2-3-0_rating_indicator_item_width: 1em;--_ui5-v2-3-0_rating_indicator_component_spacing: .5rem 0px;--_ui5-v2-3-0_rating_indicator_border_radius: .25rem;--_ui5-v2-3-0_rating_indicator_outline_offset: .125rem;--_ui5-v2-3-0_rating_indicator_readonly_item_height: .75em;--_ui5-v2-3-0_rating_indicator_readonly_item_width: .75em;--_ui5-v2-3-0_rating_indicator_readonly_item_spacing: .1875rem .1875rem;--_ui5-v2-3-0_segmented_btn_inner_border: .0625rem solid transparent;--_ui5-v2-3-0_segmented_btn_inner_border_odd_child: .0625rem solid transparent;--_ui5-v2-3-0_segmented_btn_inner_pressed_border_odd_child: .0625rem solid var(--sapButton_Selected_BorderColor);--_ui5-v2-3-0_segmented_btn_inner_border_radius: var(--sapButton_BorderCornerRadius);--_ui5-v2-3-0_segmented_btn_background_color: var(--sapButton_Lite_Background);--_ui5-v2-3-0_segmented_btn_border_color: var(--sapButton_Lite_BorderColor);--_ui5-v2-3-0_segmented_btn_hover_box_shadow: none;--_ui5-v2-3-0_segmented_btn_item_border_left: .0625rem;--_ui5-v2-3-0_segmented_btn_item_border_right: .0625rem;--_ui5-v2-3-0_button_base_min_compact_width: 2rem;--_ui5-v2-3-0_button_base_height: var(--sapElement_Height);--_ui5-v2-3-0_button_compact_height: 1.625rem;--_ui5-v2-3-0_button_border_radius: var(--sapButton_BorderCornerRadius);--_ui5-v2-3-0_button_compact_padding: .4375rem;--_ui5-v2-3-0_button_emphasized_outline: 1px dotted var(--sapContent_FocusColor);--_ui5-v2-3-0_button_focus_offset: 1px;--_ui5-v2-3-0_button_focus_width: 1px;--_ui5-v2-3-0_button_emphasized_focused_border_before: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-3-0_button_emphasized_focused_active_border_color: transparent;--_ui5-v2-3-0_button_focused_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-3-0_button_focused_border_radius: .375rem;--_ui5-v2-3-0_button_focused_inner_border_radius: .375rem;--_ui5-v2-3-0_button_base_min_width: 2.25rem;--_ui5-v2-3-0_button_base_padding: .5625rem;--_ui5-v2-3-0_button_base_icon_only_padding: .5625rem;--_ui5-v2-3-0_button_base_icon_margin: .375rem;--_ui5-v2-3-0_button_icon_font_size: 1rem;--_ui5-v2-3-0_button_text_shadow: none;--_ui5-v2-3-0_button_emphasized_border_width: .0625rem;--_ui5-v2-3-0_button_pressed_focused_border_color: var(--sapContent_FocusColor);--_ui5-v2-3-0_button_fontFamily: var(--sapFontSemiboldDuplexFamily);--_ui5-v2-3-0_button_emphasized_focused_border_color: var(--sapContent_ContrastFocusColor);--_ui5-v2-3-0_radio_button_min_width: 2.75rem;--_ui5-v2-3-0_radio_button_hover_fill_error: var(--sapField_Hover_Background);--_ui5-v2-3-0_radio_button_hover_fill_warning: var(--sapField_Hover_Background);--_ui5-v2-3-0_radio_button_hover_fill_success: var(--sapField_Hover_Background);--_ui5-v2-3-0_radio_button_hover_fill_information: var(--sapField_Hover_Background);--_ui5-v2-3-0_radio_button_checked_fill: var(--sapSelectedColor);--_ui5-v2-3-0_radio_button_checked_error_fill: var(--sapField_InvalidColor);--_ui5-v2-3-0_radio_button_checked_success_fill: var(--sapField_SuccessColor);--_ui5-v2-3-0_radio_button_checked_information_fill: var(--sapField_InformationColor);--_ui5-v2-3-0_radio_button_warning_error_border_dash: 0;--_ui5-v2-3-0_radio_button_outer_ring_color: var(--sapField_BorderColor);--_ui5-v2-3-0_radio_button_outer_ring_width: var(--sapField_BorderWidth);--_ui5-v2-3-0_radio_button_outer_ring_bg: var(--sapField_Background);--_ui5-v2-3-0_radio_button_outer_ring_hover_color: var(--sapField_Hover_BorderColor);--_ui5-v2-3-0_radio_button_outer_ring_active_color: var(--sapField_Hover_BorderColor);--_ui5-v2-3-0_radio_button_outer_ring_checked_hover_color: var(--sapField_Hover_BorderColor);--_ui5-v2-3-0_radio_button_outer_ring_padding_with_label: 0 .6875rem;--_ui5-v2-3-0_radio_button_border: none;--_ui5-v2-3-0_radio_button_focus_outline: block;--_ui5-v2-3-0_radio_button_color: var(--sapField_BorderColor);--_ui5-v2-3-0_radio_button_label_offset: 1px;--_ui5-v2-3-0_radio_button_items_align: unset;--_ui5-v2-3-0_radio_button_information_border_width: var(--sapField_InformationBorderWidth);--_ui5-v2-3-0_radio_button_border_width: var(--sapContent_FocusWidth);--_ui5-v2-3-0_radio_button_border_radius: .5rem;--_ui5-v2-3-0_radio_button_label_color: var(--sapField_TextColor);--_ui5-v2-3-0_radio_button_inner_ring_radius: 27.5%;--_ui5-v2-3-0_radio_button_outer_ring_padding: 0 .6875rem;--_ui5-v2-3-0_radio_button_read_only_border_type: 4,2;--_ui5-v2-3-0_radio_button_inner_ring_color: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-3-0_radio_button_checked_warning_fill: var(--sapField_WarningColor);--_ui5-v2-3-0_radio_button_read_only_inner_ring_color: var(--sapField_TextColor);--_ui5-v2-3-0_radio_button_read_only_border_width: var(--sapElement_BorderWidth);--_ui5-v2-3-0_radio_button_hover_fill: var(--sapContent_Selected_Hover_Background);--_ui5-v2-3-0_radio_button_focus_dist: .375rem;--_ui5-v2-3-0_switch_height: 2.75rem;--_ui5-v2-3-0_switch_foucs_border_size: 1px;--_ui5-v2-3-0-switch-root-border-radius: 0;--_ui5-v2-3-0-switch-root-box-shadow: none;--_ui5-v2-3-0-switch-focus: "";--_ui5-v2-3-0_switch_track_border_radius: .75rem;--_ui5-v2-3-0-switch-track-border: 1px solid;--_ui5-v2-3-0_switch_track_transition: none;--_ui5-v2-3-0_switch_handle_border_radius: 1rem;--_ui5-v2-3-0-switch-handle-icon-display: none;--_ui5-v2-3-0-switch-slider-texts-display: inline;--_ui5-v2-3-0_switch_width: 3.5rem;--_ui5-v2-3-0_switch_min_width: none;--_ui5-v2-3-0_switch_with_label_width: 3.875rem;--_ui5-v2-3-0_switch_focus_outline: none;--_ui5-v2-3-0_switch_root_after_outline: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-3-0_switch_root_after_boreder: none;--_ui5-v2-3-0_switch_root_after_boreder_radius: 1rem;--_ui5-v2-3-0_switch_root_outline_top: .5rem;--_ui5-v2-3-0_switch_root_outline_bottom: .5rem;--_ui5-v2-3-0_switch_root_outline_left: .375rem;--_ui5-v2-3-0_switch_root_outline_right: .375rem;--_ui5-v2-3-0_switch_disabled_opacity: var(--sapContent_DisabledOpacity);--_ui5-v2-3-0_switch_transform: translateX(100%) translateX(-1.625rem);--_ui5-v2-3-0_switch_transform_with_label: translateX(100%) translateX(-1.875rem);--_ui5-v2-3-0_switch_rtl_transform: translateX(-100%) translateX(1.625rem);--_ui5-v2-3-0_switch_rtl_transform_with_label: translateX(-100%) translateX(1.875rem);--_ui5-v2-3-0_switch_track_width: 2.5rem;--_ui5-v2-3-0_switch_track_height: 1.5rem;--_ui5-v2-3-0_switch_track_with_label_width: 2.875rem;--_ui5-v2-3-0_switch_track_with_label_height: 1.5rem;--_ui5-v2-3-0_switch_track_active_background_color: var(--sapButton_Track_Selected_Background);--_ui5-v2-3-0_switch_track_inactive_background_color: var(--sapButton_Track_Background);--_ui5-v2-3-0_switch_track_hover_active_background_color: var(--sapButton_Track_Selected_Hover_Background);--_ui5-v2-3-0_switch_track_hover_inactive_background_color: var(--sapButton_Track_Hover_Background);--_ui5-v2-3-0_switch_track_active_border_color: var(--sapButton_Track_Selected_BorderColor);--_ui5-v2-3-0_switch_track_inactive_border_color: var(--sapButton_Track_BorderColor);--_ui5-v2-3-0_switch_track_hover_active_border_color: var(--sapButton_Track_Selected_Hover_BorderColor);--_ui5-v2-3-0_switch_track_hover_inactive_border_color: var(--sapButton_Track_Hover_BorderColor);--_ui5-v2-3-0_switch_track_semantic_accept_background_color: var(--sapButton_Track_Positive_Background);--_ui5-v2-3-0_switch_track_semantic_reject_background_color: var(--sapButton_Track_Negative_Background);--_ui5-v2-3-0_switch_track_semantic_hover_accept_background_color: var(--sapButton_Track_Positive_Hover_Background);--_ui5-v2-3-0_switch_track_semantic_hover_reject_background_color: var(--sapButton_Track_Negative_Hover_Background);--_ui5-v2-3-0_switch_track_semantic_accept_border_color: var(--sapButton_Track_Positive_BorderColor);--_ui5-v2-3-0_switch_track_semantic_reject_border_color: var(--sapButton_Track_Negative_BorderColor);--_ui5-v2-3-0_switch_track_semantic_hover_accept_border_color: var(--sapButton_Track_Positive_Hover_BorderColor);--_ui5-v2-3-0_switch_track_semantic_hover_reject_border_color: var(--sapButton_Track_Negative_Hover_BorderColor);--_ui5-v2-3-0_switch_track_icon_display: inline-block;--_ui5-v2-3-0_switch_handle_width: 1.5rem;--_ui5-v2-3-0_switch_handle_height: 1.25rem;--_ui5-v2-3-0_switch_handle_with_label_width: 1.75rem;--_ui5-v2-3-0_switch_handle_with_label_height: 1.25rem;--_ui5-v2-3-0_switch_handle_border: var(--_ui5-v2-3-0_switch_handle_border_width) solid var(--sapButton_Handle_BorderColor);--_ui5-v2-3-0_switch_handle_border_width: .125rem;--_ui5-v2-3-0_switch_handle_active_background_color: var(--sapButton_Handle_Selected_Background);--_ui5-v2-3-0_switch_handle_inactive_background_color: var(--sapButton_Handle_Background);--_ui5-v2-3-0_switch_handle_hover_active_background_color: var(--sapButton_Handle_Selected_Hover_Background);--_ui5-v2-3-0_switch_handle_hover_inactive_background_color: var(--sapButton_Handle_Hover_Background);--_ui5-v2-3-0_switch_handle_active_border_color: var(--sapButton_Handle_Selected_BorderColor);--_ui5-v2-3-0_switch_handle_inactive_border_color: var(--sapButton_Handle_BorderColor);--_ui5-v2-3-0_switch_handle_hover_active_border_color: var(--sapButton_Handle_Selected_BorderColor);--_ui5-v2-3-0_switch_handle_hover_inactive_border_color: var(--sapButton_Handle_BorderColor);--_ui5-v2-3-0_switch_handle_semantic_accept_background_color: var(--sapButton_Handle_Positive_Background);--_ui5-v2-3-0_switch_handle_semantic_reject_background_color: var(--sapButton_Handle_Negative_Background);--_ui5-v2-3-0_switch_handle_semantic_hover_accept_background_color: var(--sapButton_Handle_Positive_Hover_Background);--_ui5-v2-3-0_switch_handle_semantic_hover_reject_background_color: var(--sapButton_Handle_Negative_Hover_Background);--_ui5-v2-3-0_switch_handle_semantic_accept_border_color: var(--sapButton_Handle_Positive_BorderColor);--_ui5-v2-3-0_switch_handle_semantic_reject_border_color: var(--sapButton_Handle_Negative_BorderColor);--_ui5-v2-3-0_switch_handle_semantic_hover_accept_border_color: var(--sapButton_Handle_Positive_BorderColor);--_ui5-v2-3-0_switch_handle_semantic_hover_reject_border_color: var(--sapButton_Handle_Negative_BorderColor);--_ui5-v2-3-0_switch_handle_on_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Selected_Hover_BorderColor);--_ui5-v2-3-0_switch_handle_off_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Hover_BorderColor);--_ui5-v2-3-0_switch_handle_semantic_on_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Positive_Hover_BorderColor);--_ui5-v2-3-0_switch_handle_semantic_off_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Negative_Hover_BorderColor);--_ui5-v2-3-0_switch_handle_left: .0625rem;--_ui5-v2-3-0_switch_text_font_family: var(--sapContent_IconFontFamily);--_ui5-v2-3-0_switch_text_font_size: var(--sapFontLargeSize);--_ui5-v2-3-0_switch_text_width: 1.25rem;--_ui5-v2-3-0_switch_text_with_label_font_family: "72-Condensed-Bold" , "72" , "72full" , Arial, Helvetica, sans-serif;--_ui5-v2-3-0_switch_text_with_label_font_size: var(--sapFontSmallSize);--_ui5-v2-3-0_switch_text_with_label_width: 1.75rem;--_ui5-v2-3-0_switch_text_inactive_left: .1875rem;--_ui5-v2-3-0_switch_text_inactive_left_alternate: .0625rem;--_ui5-v2-3-0_switch_text_inactive_right: auto;--_ui5-v2-3-0_switch_text_inactive_right_alternate: 0;--_ui5-v2-3-0_switch_text_active_left: .1875rem;--_ui5-v2-3-0_switch_text_active_left_alternate: .0625rem;--_ui5-v2-3-0_switch_text_active_right: auto;--_ui5-v2-3-0_switch_text_active_color: var(--sapButton_Handle_Selected_TextColor);--_ui5-v2-3-0_switch_text_inactive_color: var(--sapButton_Handle_TextColor);--_ui5-v2-3-0_switch_text_semantic_accept_color: var(--sapButton_Handle_Positive_TextColor);--_ui5-v2-3-0_switch_text_semantic_reject_color: var(--sapButton_Handle_Negative_TextColor);--_ui5-v2-3-0_switch_text_overflow: hidden;--_ui5-v2-3-0_switch_text_z_index: 1;--_ui5-v2-3-0_switch_text_hidden: hidden;--_ui5-v2-3-0_switch_text_min_width: none;--_ui5-v2-3-0_switch_icon_width: 1rem;--_ui5-v2-3-0_switch_icon_height: 1rem;--_ui5-v2-3-0_select_disabled_background: var(--sapField_Background);--_ui5-v2-3-0_select_disabled_border_color: var(--sapField_BorderColor);--_ui5-v2-3-0_select_state_error_warning_border_style: solid;--_ui5-v2-3-0_select_state_error_warning_border_width: .125rem;--_ui5-v2-3-0_select_focus_width: 1px;--_ui5-v2-3-0_select_label_color: var(--sapField_TextColor);--_ui5-v2-3-0_select_hover_icon_left_border: none;--_ui5-v2-3-0_select_option_focus_border_radius: var(--sapElement_BorderCornerRadius);--_ui5-v2-3-0_split_button_host_transparent_hover_background: transparent;--_ui5-v2-3-0_split_button_transparent_disabled_background: transparent;--_ui5-v2-3-0_split_button_host_default_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_BorderColor);--_ui5-v2-3-0_split_button_host_attention_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Attention_BorderColor);--_ui5-v2-3-0_split_button_host_emphasized_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Emphasized_BorderColor);--_ui5-v2-3-0_split_button_host_positive_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Accept_BorderColor);--_ui5-v2-3-0_split_button_host_negative_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Reject_BorderColor);--_ui5-v2-3-0_split_button_host_transparent_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Lite_BorderColor);--_ui5-v2-3-0_split_text_button_border_color: transparent;--_ui5-v2-3-0_split_text_button_background_color: transparent;--_ui5-v2-3-0_split_text_button_emphasized_border: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-3-0_split_text_button_emphasized_border_width: .0625rem;--_ui5-v2-3-0_split_text_button_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-3-0_split_text_button_emphasized_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-3-0_split_text_button_positive_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-3-0_split_text_button_negative_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-3-0_split_text_button_attention_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-3-0_split_text_button_transparent_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-3-0_split_arrow_button_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-3-0_split_arrow_button_emphasized_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-3-0_split_arrow_button_emphasized_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-3-0_split_arrow_button_positive_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-3-0_split_arrow_button_negative_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-3-0_split_arrow_button_attention_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-3-0_split_arrow_button_transparent_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-3-0_split_text_button_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-3-0_split_text_button_emphasized_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-3-0_split_text_button_positive_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-3-0_split_text_button_negative_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-3-0_split_text_button_attention_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-3-0_split_text_button_transparent_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-3-0_split_button_focused_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-3-0_split_button_focused_border_radius: .375rem;--_ui5-v2-3-0_split_button_hover_border_radius: var(--_ui5-v2-3-0_button_border_radius);--_ui5-v2-3-0_split_button_middle_separator_width: 0;--_ui5-v2-3-0_split_button_middle_separator_left: -.0625rem;--_ui5-v2-3-0_split_button_middle_separator_hover_display: none;--_ui5-v2-3-0_split_button_text_button_width: 2.375rem;--_ui5-v2-3-0_split_button_text_button_right_border_width: .0625rem;--_ui5-v2-3-0_split_button_transparent_hover_background: var(--sapButton_Lite_Hover_Background);--_ui5-v2-3-0_split_button_transparent_hover_color: var(--sapButton_TextColor);--_ui5-v2-3-0_split_button_host_transparent_hover_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_BorderColor);--_ui5-v2-3-0_split_button_inner_focused_border_radius_outer: .375rem;--_ui5-v2-3-0_split_button_inner_focused_border_radius_inner: .375rem;--_ui5-v2-3-0_split_button_emphasized_separator_color: transparent;--_ui5-v2-3-0_split_button_positive_separator_color: transparent;--_ui5-v2-3-0_split_button_negative_separator_color: transparent;--_ui5-v2-3-0_split_button_attention_separator_color: transparent;--_ui5-v2-3-0_split_button_attention_separator_color_default: var(--sapButton_Attention_TextColor);--_ui5-v2-3-0_split_text_button_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-3-0_split_text_button_emphasized_hover_border_right: none;--_ui5-v2-3-0_split_text_button_positive_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-3-0_split_text_button_negative_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-3-0_split_text_button_attention_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-3-0_split_text_button_transparent_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-3-0_split_button_middle_separator_hover_display_emphasized: none;--_ui5-v2-3-0_tc_header_height: var(--_ui5-v2-3-0_tc_item_height);--_ui5-v2-3-0_tc_header_height_text_only: var(--_ui5-v2-3-0_tc_item_text_only_height);--_ui5-v2-3-0_tc_header_height_text_with_additional_text: var(--_ui5-v2-3-0_tc_item_text_only_with_additional_text_height);--_ui5-v2-3-0_tc_header_box_shadow: var(--sapContent_HeaderShadow);--_ui5-v2-3-0_tc_header_background: var(--sapObjectHeader_Background);--_ui5-v2-3-0_tc_header_background_translucent: var(--sapObjectHeader_Background);--_ui5-v2-3-0_tc_content_background: var(--sapBackgroundColor);--_ui5-v2-3-0_tc_content_background_translucent: var(--sapGroup_ContentBackground);--_ui5-v2-3-0_tc_headeritem_padding: 1rem;--_ui5-v2-3-0_tc_headerItem_additional_text_color: var(--sapContent_LabelColor);--_ui5-v2-3-0_tc_headerItem_text_selected_color: var(--sapSelectedColor);--_ui5-v2-3-0_tc_headerItem_text_selected_hover_color: var(--sapSelectedColor);--_ui5-v2-3-0_tc_headerItem_additional_text_font_weight: normal;--_ui5-v2-3-0_tc_headerItem_neutral_color: var(--sapNeutralTextColor);--_ui5-v2-3-0_tc_headerItem_positive_color: var(--sapPositiveTextColor);--_ui5-v2-3-0_tc_headerItem_negative_color: var(--sapNegativeTextColor);--_ui5-v2-3-0_tc_headerItem_critical_color: var(--sapCriticalTextColor);--_ui5-v2-3-0_tc_headerItem_neutral_border_color: var(--sapNeutralElementColor);--_ui5-v2-3-0_tc_headerItem_positive_border_color: var(--sapPositiveElementColor);--_ui5-v2-3-0_tc_headerItem_negative_border_color: var(--sapNegativeElementColor);--_ui5-v2-3-0_tc_headerItem_critical_border_color: var(--sapCriticalElementColor);--_ui5-v2-3-0_tc_headerItem_neutral_selected_border_color: var(--_ui5-v2-3-0_tc_headerItem_neutral_color);--_ui5-v2-3-0_tc_headerItem_positive_selected_border_color: var(--_ui5-v2-3-0_tc_headerItem_positive_color);--_ui5-v2-3-0_tc_headerItem_negative_selected_border_color: var(--_ui5-v2-3-0_tc_headerItem_negative_color);--_ui5-v2-3-0_tc_headerItem_critical_selected_border_color: var(--_ui5-v2-3-0_tc_headerItem_critical_color);--_ui5-v2-3-0_tc_headerItem_transition: none;--_ui5-v2-3-0_tc_headerItem_hover_border_visibility: hidden;--_ui5-v2-3-0_tc_headerItemContent_border_radius: .125rem .125rem 0 0;--_ui5-v2-3-0_tc_headerItemContent_border_bg: transparent;--_ui5-v2-3-0_tc_headerItem_neutral_border_bg: transparent;--_ui5-v2-3-0_tc_headerItem_positive_border_bg: transparent;--_ui5-v2-3-0_tc_headerItem_negative_border_bg: transparent;--_ui5-v2-3-0_tc_headerItem_critical_border_bg: transparent;--_ui5-v2-3-0_tc_headerItemContent_border_height: 0;--_ui5-v2-3-0_tc_headerItemContent_focus_offset: 1rem;--_ui5-v2-3-0_tc_headerItem_text_focus_border_offset_left: 0px;--_ui5-v2-3-0_tc_headerItem_text_focus_border_offset_right: 0px;--_ui5-v2-3-0_tc_headerItem_text_focus_border_offset_top: 0px;--_ui5-v2-3-0_tc_headerItem_text_focus_border_offset_bottom: 0px;--_ui5-v2-3-0_tc_headerItem_mixed_mode_focus_border_offset_left: .75rem;--_ui5-v2-3-0_tc_headerItem_mixed_mode_focus_border_offset_right: .625rem;--_ui5-v2-3-0_tc_headerItem_mixed_mode_focus_border_offset_top: .75rem;--_ui5-v2-3-0_tc_headerItem_mixed_mode_focus_border_offset_bottom: .75rem;--_ui5-v2-3-0_tc_headerItemContent_focus_border: none;--_ui5-v2-3-0_tc_headerItemContent_default_focus_border: none;--_ui5-v2-3-0_tc_headerItemContent_focus_border_radius: 0;--_ui5-v2-3-0_tc_headerItemSemanticIcon_display: none;--_ui5-v2-3-0_tc_headerItemSemanticIcon_size: .75rem;--_ui5-v2-3-0_tc_mixedMode_itemText_font_family: var(--sapFontFamily);--_ui5-v2-3-0_tc_mixedMode_itemText_font_size: var(--sapFontSmallSize);--_ui5-v2-3-0_tc_mixedMode_itemText_font_weight: normal;--_ui5-v2-3-0_tc_overflowItem_positive_color: var(--sapPositiveColor);--_ui5-v2-3-0_tc_overflowItem_negative_color: var(--sapNegativeColor);--_ui5-v2-3-0_tc_overflowItem_critical_color: var(--sapCriticalColor);--_ui5-v2-3-0_tc_overflowItem_focus_offset: .125rem;--_ui5-v2-3-0_tc_overflowItem_extraIndent: 0rem;--_ui5-v2-3-0_tc_headerItemIcon_positive_selected_background: var(--sapPositiveColor);--_ui5-v2-3-0_tc_headerItemIcon_negative_selected_background: var(--sapNegativeColor);--_ui5-v2-3-0_tc_headerItemIcon_critical_selected_background: var(--sapCriticalColor);--_ui5-v2-3-0_tc_headerItemIcon_neutral_selected_background: var(--sapNeutralColor);--_ui5-v2-3-0_tc_headerItemIcon_semantic_selected_color: var(--sapGroup_ContentBackground);--_ui5-v2-3-0_tc_header_border_bottom: .0625rem solid var(--sapObjectHeader_Background);--_ui5-v2-3-0_tc_headerItemContent_border_bottom: .1875rem solid var(--sapSelectedColor);--_ui5-v2-3-0_tc_headerItem_color: var(--sapTextColor);--_ui5-v2-3-0_tc_overflowItem_default_color: var(--sapTextColor);--_ui5-v2-3-0_tc_overflowItem_current_color: CurrentColor;--_ui5-v2-3-0_tc_content_border_bottom: .0625rem solid var(--sapObjectHeader_BorderColor);--_ui5-v2-3-0_tc_headerItem_expand_button_margin_inline_start: 0rem;--_ui5-v2-3-0_tc_headerItem_single_click_expand_button_margin_inline_start: .25rem;--_ui5-v2-3-0_tc_headerItem_expand_button_border_radius: .25rem;--_ui5-v2-3-0_tc_headerItem_expand_button_separator_display: inline-block;--_ui5-v2-3-0_tc_headerItem_focus_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-3-0_tc_headerItem_focus_border_offset: -5px;--_ui5-v2-3-0_tc_headerItemIcon_focus_border_radius: 50%;--_ui5-v2-3-0_tc_headerItem_focus_border_radius: .375rem;--_ui5-v2-3-0_tc_headeritem_text_font_weight: bold;--_ui5-v2-3-0_tc_headerItem_focus_offset: 1px;--_ui5-v2-3-0_tc_headerItem_text_hover_color: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-3-0_tc_headerItemIcon_border: .125rem solid var(--sapContent_Selected_ForegroundColor);--_ui5-v2-3-0_tc_headerItemIcon_color: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-3-0_tc_headerItemIcon_selected_background: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-3-0_tc_headerItemIcon_background_color: var(--sapContent_Selected_Background);--_ui5-v2-3-0_tc_headerItemIcon_selected_color: var(--sapContent_ContrastIconColor);--_ui5-v2-3-0_tc_mixedMode_itemText_color: var(--sapTextColor);--_ui5-v2-3-0_tc_overflow_text_color: var(--sapTextColor);--_ui5-v2-3-0_text_max_lines: initial;--_ui5-v2-3-0_textarea_state_border_width: .125rem;--_ui5-v2-3-0_textarea_information_border_width: .125rem;--_ui5-v2-3-0_textarea_placeholder_font_style: italic;--_ui5-v2-3-0_textarea_value_state_error_warning_placeholder_font_weight: normal;--_ui5-v2-3-0_textarea_error_placeholder_font_style: italic;--_ui5-v2-3-0_textarea_error_placeholder_color: var(--sapField_PlaceholderTextColor);--_ui5-v2-3-0_textarea_error_hover_background_color: var(--sapField_Hover_Background);--_ui5-v2-3-0_textarea_disabled_opacity: .4;--_ui5-v2-3-0_textarea_focus_pseudo_element_content: "";--_ui5-v2-3-0_textarea_min_height: 2.25rem;--_ui5-v2-3-0_textarea_padding_right_and_left_readonly: .5625rem;--_ui5-v2-3-0_textarea_padding_top_readonly: .4375rem;--_ui5-v2-3-0_textarea_exceeded_text_height: 1rem;--_ui5-v2-3-0_textarea_hover_border: none;--_ui5-v2-3-0_textarea_focus_border_radius: .25rem;--_ui5-v2-3-0_textarea_error_warning_border_style: none;--_ui5-v2-3-0_textarea_line_height: 1.5;--_ui5-v2-3-0_textarea_focused_value_state_error_background: var(--sapField_Hover_Background);--_ui5-v2-3-0_textarea_focused_value_state_warning_background: var(--sapField_Hover_Background);--_ui5-v2-3-0_textarea_focused_value_state_success_background: var(--sapField_Hover_Background);--_ui5-v2-3-0_textarea_focused_value_state_information_background: var(--sapField_Hover_Background);--_ui5-v2-3-0_textarea_focused_value_state_error_focus_outline_color: var(--sapField_InvalidColor);--_ui5-v2-3-0_textarea_focused_value_state_warning_focus_outline_color: var(--sapField_WarningColor);--_ui5-v2-3-0_textarea_focused_value_state_success_focus_outline_color: var(--sapField_SuccessColor);--_ui5-v2-3-0_textarea_focus_offset: 0;--_ui5-v2-3-0_textarea_readonly_focus_offset: 1px;--_ui5-v2-3-0_textarea_focus_outline_color: var(--sapField_Active_BorderColor);--_ui5-v2-3-0_textarea_value_state_focus_offset: 1px;--_ui5-v2-3-0_textarea_wrapper_padding: .0625rem;--_ui5-v2-3-0_textarea_success_wrapper_padding: .0625rem;--_ui5-v2-3-0_textarea_warning_error_wrapper_padding: .0625rem .0625rem .125rem .0625rem;--_ui5-v2-3-0_textarea_information_wrapper_padding: .0625rem .0625rem .125rem .0625rem;--_ui5-v2-3-0_textarea_padding_bottom_readonly: .375rem;--_ui5-v2-3-0_textarea_padding_top_error_warning: .5rem;--_ui5-v2-3-0_textarea_padding_bottom_error_warning: .4375rem;--_ui5-v2-3-0_textarea_padding_top_information: .5rem;--_ui5-v2-3-0_textarea_padding_bottom_information: .4375rem;--_ui5-v2-3-0_textarea_padding_right_and_left: .625rem;--_ui5-v2-3-0_textarea_padding_right_and_left_error_warning: .625rem;--_ui5-v2-3-0_textarea_padding_right_and_left_information: .625rem;--_ui5-v2-3-0_textarea_readonly_border_style: dashed;--_ui5-v2-3-0_time_picker_border: .0625rem solid transparent;--_ui5-v2-3-0-time_picker_border_radius: .25rem;--_ui5-v2-3-0_toast_vertical_offset: 3rem;--_ui5-v2-3-0_toast_horizontal_offset: 2rem;--_ui5-v2-3-0_toast_background: var(--sapList_Background);--_ui5-v2-3-0_toast_shadow: var(--sapContent_Shadow2);--_ui5-v2-3-0_toast_offset_width: -.1875rem;--_ui5-v2-3-0_toggle_button_pressed_focussed: var(--sapButton_Selected_BorderColor);--_ui5-v2-3-0_toggle_button_pressed_focussed_hovered: var(--sapButton_Selected_BorderColor);--_ui5-v2-3-0_toggle_button_selected_positive_text_color: var(--sapButton_Selected_TextColor);--_ui5-v2-3-0_toggle_button_selected_negative_text_color: var(--sapButton_Selected_TextColor);--_ui5-v2-3-0_toggle_button_selected_attention_text_color: var(--sapButton_Selected_TextColor);--_ui5-v2-3-0_toggle_button_emphasized_pressed_focussed_hovered: var(--sapContent_FocusColor);--_ui5-v2-3-0_toggle_button_emphasized_text_shadow: none;--_ui5-v2-3-0_yearpicker_item_margin: .0625rem;--_ui5-v2-3-0_yearpicker_item_border: .0625rem solid var(--sapButton_Lite_BorderColor);--_ui5-v2-3-0_yearpicker_item_hover_border: .0625rem solid var(--sapButton_Lite_Hover_BorderColor);--_ui5-v2-3-0_yearpicker_item_active_border: .0625rem solid var(--sapButton_Lite_Active_BorderColor);--_ui5-v2-3-0_yearpicker_item_selected_border: .0625rem solid var(--sapButton_Selected_BorderColor);--_ui5-v2-3-0_yearpicker_item_selected_hover_border: .0625rem solid var(--sapButton_Selected_Hover_BorderColor);--_ui5-v2-3-0_yearpicker_item_border_radius: .5rem;--_ui5-v2-3-0_calendar_header_middle_button_width: 6.25rem;--_ui5-v2-3-0_calendar_header_middle_button_flex: 1 1 auto;--_ui5-v2-3-0_calendar_header_middle_button_focus_after_display: block;--_ui5-v2-3-0_calendar_header_middle_button_focus_after_width: calc(100% - .375rem) ;--_ui5-v2-3-0_calendar_header_middle_button_focus_after_height: calc(100% - .375rem) ;--_ui5-v2-3-0_calendar_header_middle_button_focus_after_top_offset: .125rem;--_ui5-v2-3-0_calendar_header_middle_button_focus_after_left_offset: .125rem;--_ui5-v2-3-0_calendar_header_arrow_button_border: none;--_ui5-v2-3-0_calendar_header_arrow_button_border_radius: .5rem;--_ui5-v2-3-0_calendar_header_button_background_color: var(--sapButton_Lite_Background);--_ui5-v2-3-0_calendar_header_arrow_button_box_shadow: 0 0 .125rem 0 rgb(85 107 130 / 72%);--_ui5-v2-3-0_calendar_header_middle_button_focus_border_radius: .5rem;--_ui5-v2-3-0_calendar_header_middle_button_focus_border: none;--_ui5-v2-3-0_calendar_header_middle_button_focus_after_border: none;--_ui5-v2-3-0_calendar_header_middle_button_focus_background: transparent;--_ui5-v2-3-0_calendar_header_middle_button_focus_outline: .125rem solid var(--sapSelectedColor);--_ui5-v2-3-0_calendar_header_middle_button_focus_active_outline: .0625rem solid var(--sapSelectedColor);--_ui5-v2-3-0_calendar_header_middle_button_focus_active_background: transparent;--_ui5-v2-3-0_token_background: var(--sapButton_TokenBackground);--_ui5-v2-3-0_token_readonly_background: var(--sapButton_TokenBackground);--_ui5-v2-3-0_token_readonly_color: var(--sapContent_LabelColor);--_ui5-v2-3-0_token_right_margin: .3125rem;--_ui5-v2-3-0_token_padding: .25rem 0;--_ui5-v2-3-0_token_left_padding: .3125rem;--_ui5-v2-3-0_token_focused_selected_border: 1px solid var(--sapButton_Selected_BorderColor);--_ui5-v2-3-0_token_focus_offset: -.25rem;--_ui5-v2-3-0_token_focus_outline_width: .0625rem;--_ui5-v2-3-0_token_hover_border_color: var(--sapButton_TokenBorderColor);--_ui5-v2-3-0_token_selected_focus_outline: none;--_ui5-v2-3-0_token_focus_outline: none;--_ui5-v2-3-0_token_outline_offset: .125rem;--_ui5-v2-3-0_token_selected_hover_border_color: var(--sapButton_Selected_BorderColor);--ui5-v2-3-0_token_focus_pseudo_element_content: "";--_ui5-v2-3-0_token_border_radius: .375rem;--_ui5-v2-3-0_token_focus_outline_border_radius: .5rem;--_ui5-v2-3-0_token_text_color: var(--sapTextColor);--_ui5-v2-3-0_token_selected_text_font_family: var(--sapFontSemiboldDuplexFamily);--_ui5-v2-3-0_token_selected_internal_border_bottom: .125rem solid var(--sapButton_Selected_BorderColor);--_ui5-v2-3-0_token_selected_internal_border_bottom_radius: .1875rem;--_ui5-v2-3-0_token_text_icon_top: .0625rem;--_ui5-v2-3-0_token_selected_focused_offset_bottom: -.375rem;--_ui5-v2-3-0_token_readonly_padding: .25rem .3125rem;--_ui5-v2-3-0_tokenizer-popover_offset: .3125rem;--_ui5-v2-3-0_tokenizer_n_more_text_color: var(--sapLinkColor);--_ui5-v2-3-0-multi_combobox_token_margin_top: 1px;--_ui5-v2-3-0_slider_progress_container_dot_background: var(--sapField_BorderColor);--_ui5-v2-3-0_slider_progress_border: none;--_ui5-v2-3-0_slider_padding: 1.406rem 1.0625rem;--_ui5-v2-3-0_slider_inner_height: .25rem;--_ui5-v2-3-0_slider_outer_height: 1.6875rem;--_ui5-v2-3-0_slider_progress_border_radius: .25rem;--_ui5-v2-3-0_slider_tickmark_bg: var(--sapField_BorderColor);--_ui5-v2-3-0_slider_handle_margin_left: calc(-1 * (var(--_ui5-v2-3-0_slider_handle_width) / 2));--_ui5-v2-3-0_slider_handle_outline_offset: .075rem;--_ui5-v2-3-0_slider_progress_outline: .0625rem dotted var(--sapContent_FocusColor);--_ui5-v2-3-0_slider_progress_outline_offset: -.8125rem;--_ui5-v2-3-0_slider_disabled_opacity: .4;--_ui5-v2-3-0_slider_tooltip_border_color: var(--sapField_BorderColor);--_ui5-v2-3-0_range_slider_handle_background_focus: transparent;--_ui5-v2-3-0_slider_progress_box_sizing: content-box;--_ui5-v2-3-0_range_slider_focus_outline_width: 100%;--_ui5-v2-3-0_slider_progress_outline_offset_left: 0;--_ui5-v2-3-0_range_slider_focus_outline_radius: 0;--_ui5-v2-3-0_slider_progress_container_top: 0;--_ui5-v2-3-0_slider_progress_height: 100%;--_ui5-v2-3-0_slider_active_progress_border: none;--_ui5-v2-3-0_slider_active_progress_left: 0;--_ui5-v2-3-0_slider_active_progress_top: 0;--_ui5-v2-3-0_slider_no_tickmarks_progress_container_top: var(--_ui5-v2-3-0_slider_progress_container_top);--_ui5-v2-3-0_slider_no_tickmarks_progress_height: var(--_ui5-v2-3-0_slider_progress_height);--_ui5-v2-3-0_slider_no_tickmarks_active_progress_border: var(--_ui5-v2-3-0_slider_active_progress_border);--_ui5-v2-3-0_slider_no_tickmarks_active_progress_left: var(--_ui5-v2-3-0_slider_active_progress_left);--_ui5-v2-3-0_slider_no_tickmarks_active_progress_top: var(--_ui5-v2-3-0_slider_active_progress_top);--_ui5-v2-3-0_slider_handle_focus_visibility: none;--_ui5-v2-3-0_slider_handle_icon_size: 1rem;--_ui5-v2-3-0_slider_progress_container_background: var(--sapSlider_Background);--_ui5-v2-3-0_slider_progress_container_dot_display: block;--_ui5-v2-3-0_slider_inner_min_width: 4rem;--_ui5-v2-3-0_slider_progress_background: var(--sapSlider_Selected_Background);--_ui5-v2-3-0_slider_progress_before_background: var(--sapSlider_Selected_Background);--_ui5-v2-3-0_slider_progress_after_background: var(--sapContent_MeasureIndicatorColor);--_ui5-v2-3-0_slider_handle_background: var(--sapSlider_HandleBackground);--_ui5-v2-3-0_slider_handle_icon_display: inline-block;--_ui5-v2-3-0_slider_handle_border: .0625rem solid var(--sapSlider_HandleBorderColor);--_ui5-v2-3-0_slider_handle_border_radius: .5rem;--_ui5-v2-3-0_slider_handle_height: 1.5rem;--_ui5-v2-3-0_slider_handle_width: 2rem;--_ui5-v2-3-0_slider_handle_top: -.625rem;--_ui5-v2-3-0_slider_handle_font_family: "SAP-icons";--_ui5-v2-3-0_slider_handle_hover_border: .0625rem solid var(--sapSlider_Hover_HandleBorderColor);--_ui5-v2-3-0_slider_handle_focus_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-3-0_slider_handle_background_focus: var(--sapSlider_Active_RangeHandleBackground);--_ui5-v2-3-0_slider_handle_outline: none;--_ui5-v2-3-0_slider_handle_hover_background: var(--sapSlider_Hover_HandleBackground);--_ui5-v2-3-0_slider_tooltip_background: var(--sapField_Focus_Background);--_ui5-v2-3-0_slider_tooltip_border: none;--_ui5-v2-3-0_slider_tooltip_border_radius: .5rem;--_ui5-v2-3-0_slider_tooltip_box_shadow: var(--sapContent_Shadow1);--_ui5-v2-3-0_range_slider_legacy_progress_focus_display: none;--_ui5-v2-3-0_range_slider_progress_focus_display: block;--_ui5-v2-3-0_slider_tickmark_in_range_bg: var(--sapSlider_Selected_BorderColor);--_ui5-v2-3-0_slider_label_fontsize: var(--sapFontSmallSize);--_ui5-v2-3-0_slider_label_color: var(--sapContent_LabelColor);--_ui5-v2-3-0_slider_tooltip_min_width: 2rem;--_ui5-v2-3-0_slider_tooltip_padding: .25rem;--_ui5-v2-3-0_slider_tooltip_fontsize: var(--sapFontSmallSize);--_ui5-v2-3-0_slider_tooltip_color: var(--sapContent_LabelColor);--_ui5-v2-3-0_slider_tooltip_height: 1.375rem;--_ui5-v2-3-0_slider_handle_focus_width: 1px;--_ui5-v2-3-0_slider_start_end_point_size: .5rem;--_ui5-v2-3-0_slider_start_end_point_left: -.75rem;--_ui5-v2-3-0_slider_start_end_point_top: -.125rem;--_ui5-v2-3-0_slider_handle_focused_tooltip_distance: calc(var(--_ui5-v2-3-0_slider_tooltip_bottom) - var(--_ui5-v2-3-0_slider_handle_focus_width));--_ui5-v2-3-0_slider_tooltip_border_box: border-box;--_ui5-v2-3-0_range_slider_handle_active_background: var(--sapSlider_Active_RangeHandleBackground);--_ui5-v2-3-0_range_slider_active_handle_icon_display: none;--_ui5-v2-3-0_range_slider_progress_focus_top: -15px;--_ui5-v2-3-0_range_slider_progress_focus_left: calc(-1 * (var(--_ui5-v2-3-0_slider_handle_width) / 2) - 5px);--_ui5-v2-3-0_range_slider_progress_focus_padding: 0 1rem 0 1rem;--_ui5-v2-3-0_range_slider_progress_focus_width: calc(100% + var(--_ui5-v2-3-0_slider_handle_width) + 10px);--_ui5-v2-3-0_range_slider_progress_focus_height: calc(var(--_ui5-v2-3-0_slider_handle_height) + 10px);--_ui5-v2-3-0_range_slider_root_hover_handle_icon_display: inline-block;--_ui5-v2-3-0_range_slider_root_hover_handle_bg: var(--_ui5-v2-3-0_slider_handle_hover_background);--_ui5-v2-3-0_range_slider_root_active_handle_icon_display: none;--_ui5-v2-3-0_slider_tickmark_height: .5rem;--_ui5-v2-3-0_slider_tickmark_top: -2px;--_ui5-v2-3-0_slider_handle_box_sizing: border-box;--_ui5-v2-3-0_range_slider_handle_background: var(--sapSlider_RangeHandleBackground);--_ui5-v2-3-0_slider_tooltip_bottom: 2rem;--_ui5-v2-3-0_value_state_message_border: none;--_ui5-v2-3-0_value_state_header_border: none;--_ui5-v2-3-0_input_value_state_icon_offset: .5rem;--_ui5-v2-3-0_value_state_header_box_shadow_error: inset 0 -.0625rem var(--sapField_InvalidColor);--_ui5-v2-3-0_value_state_header_box_shadow_information: inset 0 -.0625rem var(--sapField_InformationColor);--_ui5-v2-3-0_value_state_header_box_shadow_success: inset 0 -.0625rem var(--sapField_SuccessColor);--_ui5-v2-3-0_value_state_header_box_shadow_warning: inset 0 -.0625rem var(--sapField_WarningColor);--_ui5-v2-3-0_value_state_message_icon_offset_phone: 1rem;--_ui5-v2-3-0_value_state_header_border_bottom: none;--_ui5-v2-3-0_input_value_state_icon_display: inline-block;--_ui5-v2-3-0_value_state_message_padding: .5rem .5rem .5rem 1.875rem;--_ui5-v2-3-0_value_state_header_padding: .5rem .5rem .5rem 1.875rem;--_ui5-v2-3-0_value_state_message_popover_box_shadow: var(--sapContent_Shadow1);--_ui5-v2-3-0_value_state_message_icon_width: 1rem;--_ui5-v2-3-0_value_state_message_icon_height: 1rem;--_ui5-v2-3-0_value_state_header_offset: -.25rem;--_ui5-v2-3-0_value_state_message_popover_border_radius: var(--sapPopover_BorderCornerRadius);--_ui5-v2-3-0_value_state_message_padding_phone: .5rem .5rem .5rem 2.375rem;--_ui5-v2-3-0_value_state_message_line_height: 1.125rem;--_ui5-v2-3-0-toolbar-padding-left: .5rem;--_ui5-v2-3-0-toolbar-padding-right: .5rem;--_ui5-v2-3-0-toolbar-item-margin-left: 0;--_ui5-v2-3-0-toolbar-item-margin-right: .25rem;--_ui5-v2-3-0_step_input_min_width: 7.25rem;--_ui5-v2-3-0_step_input_padding: 2.5rem;--_ui5-v2-3-0_step_input_input_error_background_color: inherit;--_ui5-v2-3-0-step_input_button_state_hover_background_color: var(--sapField_Hover_Background);--_ui5-v2-3-0_step_input_border_style: none;--_ui5-v2-3-0_step_input_border_style_hover: none;--_ui5-v2-3-0_step_input_button_background_color: transparent;--_ui5-v2-3-0_step_input_input_border: none;--_ui5-v2-3-0_step_input_input_margin_top: 0;--_ui5-v2-3-0_step_input_button_display: inline-flex;--_ui5-v2-3-0_step_input_button_left: 0;--_ui5-v2-3-0_step_input_button_right: 0;--_ui5-v2-3-0_step_input_input_border_focused_after: .125rem solid #0070f2;--_ui5-v2-3-0_step_input_input_border_top_bottom_focused_after: 0;--_ui5-v2-3-0_step_input_input_border_radius_focused_after: .25rem;--_ui5-v2-3-0_step_input_input_information_border_color_focused_after: var(--sapField_InformationColor);--_ui5-v2-3-0_step_input_input_warning_border_color_focused_after: var(--sapField_WarningColor);--_ui5-v2-3-0_step_input_input_success_border_color_focused_after: var(--sapField_SuccessColor);--_ui5-v2-3-0_step_input_input_error_border_color_focused_after: var(--sapField_InvalidColor);--_ui5-v2-3-0_step_input_disabled_button_background: none;--_ui5-v2-3-0_step_input_border_color_hover: none;--_ui5-v2-3-0_step_input_border_hover: none;--_ui5-v2-3-0_input_input_background_color: transparent;--_ui5-v2-3-0_load_more_padding: 0;--_ui5-v2-3-0_load_more_border: 1px top solid transparent;--_ui5-v2-3-0_load_more_border_radius: none;--_ui5-v2-3-0_load_more_outline_width: var(--sapContent_FocusWidth);--_ui5-v2-3-0_load_more_border-bottom: var(--sapList_BorderWidth) solid var(--sapList_BorderColor);--_ui5-v2-3-0_calendar_height: 24.5rem;--_ui5-v2-3-0_calendar_width: 20rem;--_ui5-v2-3-0_calendar_padding: 1rem;--_ui5-v2-3-0_calendar_left_right_padding: .5rem;--_ui5-v2-3-0_calendar_top_bottom_padding: 1rem;--_ui5-v2-3-0_calendar_header_height: 3rem;--_ui5-v2-3-0_calendar_header_arrow_button_width: 2.5rem;--_ui5-v2-3-0_calendar_header_padding: .25rem 0;--_ui5-v2-3-0_checkbox_root_side_padding: .6875rem;--_ui5-v2-3-0_checkbox_icon_size: 1rem;--_ui5-v2-3-0_checkbox_partially_icon_size: .75rem;--_ui5-v2-3-0_custom_list_item_rb_min_width: 2.75rem;--_ui5-v2-3-0_day_picker_item_width: 2.25rem;--_ui5-v2-3-0_day_picker_item_height: 2.875rem;--_ui5-v2-3-0_day_picker_empty_height: 3rem;--_ui5-v2-3-0_day_picker_item_justify_content: space-between;--_ui5-v2-3-0_dp_two_calendar_item_now_text_padding_top: .375rem;--_ui5-v2-3-0_daypicker_item_now_selected_two_calendar_focus_special_day_top: 2rem;--_ui5-v2-3-0_daypicker_item_now_selected_two_calendar_focus_special_day_right: 1.4375rem;--_ui5-v2-3-0_dp_two_calendar_item_primary_text_height: 1.8125rem;--_ui5-v2-3-0_dp_two_calendar_item_secondary_text_height: 1rem;--_ui5-v2-3-0_dp_two_calendar_item_text_padding_top: .4375rem;--_ui5-v2-3-0_daypicker_item_now_selected_two_calendar_focus_secondary_text_padding_block: 0 .5rem;--_ui5-v2-3-0-calendar-legend-item-root-focus-offset: -.125rem;--_ui5-v2-3-0-calendar-legend-item-box-margin: .25rem;--_ui5-v2-3-0-calendar-legend-item-box-inner-margin: .5rem;--_ui5-v2-3-0_color-palette-swatch-container-padding: .3125rem .6875rem;--_ui5-v2-3-0_datetime_picker_width: 40.0625rem;--_ui5-v2-3-0_datetime_picker_height: 25rem;--_ui5-v2-3-0_datetime_timeview_width: 17rem;--_ui5-v2-3-0_datetime_timeview_phonemode_width: 19.5rem;--_ui5-v2-3-0_datetime_timeview_padding: 1rem;--_ui5-v2-3-0_datetime_timeview_phonemode_clocks_width: 24.5rem;--_ui5-v2-3-0_datetime_dateview_phonemode_margin_bottom: 0;--_ui5-v2-3-0_dialog_content_min_height: 2.75rem;--_ui5-v2-3-0_dialog_footer_height: 2.75rem;--_ui5-v2-3-0_input_inner_padding: 0 .625rem;--_ui5-v2-3-0_input_inner_padding_with_icon: 0 .25rem 0 .625rem;--_ui5-v2-3-0_input_inner_space_to_tokenizer: .125rem;--_ui5-v2-3-0_input_inner_space_to_n_more_text: .1875rem;--_ui5-v2-3-0_list_no_data_height: 3rem;--_ui5-v2-3-0_list_item_cb_margin_right: 0;--_ui5-v2-3-0_list_item_title_size: var(--sapFontLargeSize);--_ui5-v2-3-0_list_no_data_font_size: var(--sapFontLargeSize);--_ui5-v2-3-0_list_item_img_size: 3rem;--_ui5-v2-3-0_list_item_img_top_margin: .5rem;--_ui5-v2-3-0_list_item_img_bottom_margin: .5rem;--_ui5-v2-3-0_list_item_img_hn_margin: .75rem;--_ui5-v2-3-0_list_item_dropdown_base_height: 2.5rem;--_ui5-v2-3-0_list_item_base_height: var(--sapElement_LineHeight);--_ui5-v2-3-0_list_item_base_padding: 0 1rem;--_ui5-v2-3-0_list_item_icon_size: 1.125rem;--_ui5-v2-3-0_list_item_icon_padding-inline-end: .5rem;--_ui5-v2-3-0_list_item_selection_btn_margin_top: calc(-1 * var(--_ui5-v2-3-0_checkbox_wrapper_padding));--_ui5-v2-3-0_list_item_content_vertical_offset: calc((var(--_ui5-v2-3-0_list_item_base_height) - var(--_ui5-v2-3-0_list_item_title_size)) / 2);--_ui5-v2-3-0_group_header_list_item_height: 2.75rem;--_ui5-v2-3-0_list_busy_row_height: 3rem;--_ui5-v2-3-0_month_picker_item_height: 3rem;--_ui5-v2-3-0_list_buttons_left_space: .125rem;--_ui5-v2-3-0_form_item_min_height: 2.813rem;--_ui5-v2-3-0_form_item_padding: .65rem;--_ui5-v2-3-0-form-group-heading-height: 2.75rem;--_ui5-v2-3-0_popup_default_header_height: 2.75rem;--_ui5-v2-3-0_year_picker_item_height: 3rem;--_ui5-v2-3-0_tokenizer_padding: .25rem;--_ui5-v2-3-0_token_height: 1.625rem;--_ui5-v2-3-0_token_icon_size: .75rem;--_ui5-v2-3-0_token_icon_padding: .25rem .5rem;--_ui5-v2-3-0_token_wrapper_right_padding: .3125rem;--_ui5-v2-3-0_token_wrapper_left_padding: 0;--_ui5-v2-3-0_tl_bubble_padding: 1rem;--_ui5-v2-3-0_tl_indicator_before_bottom: -1.625rem;--_ui5-v2-3-0_tl_padding: 1rem 1rem 1rem .5rem;--_ui5-v2-3-0_tl_li_margin_bottom: 1.625rem;--_ui5-v2-3-0_switch_focus_width_size_horizon_exp: calc(100% + 4px) ;--_ui5-v2-3-0_switch_focus_height_size_horizon_exp: calc(100% + 4px) ;--_ui5-v2-3-0_tc_item_text: 3rem;--_ui5-v2-3-0_tc_item_height: 4.75rem;--_ui5-v2-3-0_tc_item_text_only_height: 2.75rem;--_ui5-v2-3-0_tc_item_text_only_with_additional_text_height: 3.75rem;--_ui5-v2-3-0_tc_item_text_line_height: 1.325rem;--_ui5-v2-3-0_tc_item_icon_circle_size: 2.75rem;--_ui5-v2-3-0_tc_item_icon_size: 1.25rem;--_ui5-v2-3-0_tc_item_add_text_margin_top: .375rem;--_ui5-v2-3-0_textarea_margin: .25rem 0;--_ui5-v2-3-0_radio_button_height: 2.75rem;--_ui5-v2-3-0_radio_button_label_side_padding: .875rem;--_ui5-v2-3-0_radio_button_inner_size: 2.75rem;--_ui5-v2-3-0_radio_button_svg_size: 1.375rem;--_ui5-v2-3-0-responsive_popover_header_height: 2.75rem;--ui5-v2-3-0_side_navigation_item_height: 2.75rem;--_ui5-v2-3-0-tree-indent-step: 1.5rem;--_ui5-v2-3-0-tree-toggle-box-width: 2.75rem;--_ui5-v2-3-0-tree-toggle-box-height: 2.25rem;--_ui5-v2-3-0-tree-toggle-icon-size: 1.0625rem;--_ui5-v2-3-0_timeline_tli_indicator_before_bottom: -1.5rem;--_ui5-v2-3-0_timeline_tli_indicator_before_right: -1.625rem;--_ui5-v2-3-0_timeline_tli_indicator_before_without_icon_bottom: -1.875rem;--_ui5-v2-3-0_timeline_tli_indicator_before_without_icon_right: -1.9375rem;--_ui5-v2-3-0_timeline_tli_indicator_after_top: calc(-100% - 1rem) ;--_ui5-v2-3-0_timeline_tli_indicator_after_height: calc(100% + 1rem) ;--_ui5-v2-3-0_timeline_tli_indicator_before_height: 100%;--_ui5-v2-3-0_timeline_tli_horizontal_indicator_after_width: calc(100% + .25rem) ;--_ui5-v2-3-0_timeline_tli_horizontal_indicator_after_left: 1.9375rem;--_ui5-v2-3-0_timeline_tli_horizontal_without_icon_indicator_before_width: calc(100% + .5rem) ;--_ui5-v2-3-0_timeline_tli_horizontal_indicator_before_width: calc(100% + .5rem) ;--_ui5-v2-3-0_timeline_tli_icon_horizontal_indicator_after_width: calc(100% + .25rem) ;--_ui5-v2-3-0_timeline_tli_without_icon_horizontal_indicator_before_width: calc(100% + .375rem) ;--_ui5-v2-3-0_timeline_tli_horizontal_indicator_short_after_width: 100%;--_ui5-v2-3-0_timeline_tli_last_child_vertical_indicator_before_height: calc(100% - 1.5rem) ;--_ui5-v2-3-0-toolbar-separator-height: 2rem;--_ui5-v2-3-0-toolbar-height: 2.75rem;--_ui5-v2-3-0_toolbar_overflow_padding: .25rem .5rem;--_ui5-v2-3-0_table_cell_padding: .25rem .5rem;--_ui5-v2-3-0_dynamic_page_title_actions_separator_height: var(--_ui5-v2-3-0-toolbar-separator-height);--_ui5-v2-3-0_split_button_middle_separator_top: .625rem;--_ui5-v2-3-0_split_button_middle_separator_height: 1rem;--_ui5-v2-3-0-calendar-legend-item-root-focus-border-radius: .25rem;--_ui5-v2-3-0_color-palette-item-height: 1.75rem;--_ui5-v2-3-0_color-palette-item-hover-height: 2.25rem;--_ui5-v2-3-0_color-palette-item-margin: calc(((var(--_ui5-v2-3-0_color-palette-item-hover-height) - var(--_ui5-v2-3-0_color-palette-item-height)) / 2) + .0625rem);--_ui5-v2-3-0_color-palette-row-width: 12rem;--_ui5-v2-3-0_textarea_padding_top: .5rem;--_ui5-v2-3-0_textarea_padding_bottom: .4375rem;--_ui5-v2-3-0_dp_two_calendar_item_secondary_text_padding_block: 0 .5rem;--_ui5-v2-3-0_dp_two_calendar_item_secondary_text_padding: 0 .5rem;--_ui5-v2-3-0_daypicker_two_calendar_item_selected_focus_margin_bottom: 0;--_ui5-v2-3-0_daypicker_two_calendar_item_selected_focus_padding_right: .5rem}[dir=rtl]{--_ui5-v2-3-0_table_shadow_border_left: inset calc(-1 * var(--sapContent_FocusWidth)) 0 var(--sapContent_FocusColor);--_ui5-v2-3-0_table_shadow_border_right: inset var(--sapContent_FocusWidth) 0 var(--sapContent_FocusColor);--_ui5-v2-3-0_icon_transform_scale: scale(-1, 1);--_ui5-v2-3-0_panel_toggle_btn_rotation: var(--_ui5-v2-3-0_rotation_minus_90deg);--_ui5-v2-3-0_li_notification_group_toggle_btn_rotation: var(--_ui5-v2-3-0_rotation_minus_90deg);--_ui5-v2-3-0_timeline_scroll_container_offset: -.5rem;--_ui5-v2-3-0_popover_upward_arrow_margin: .1875rem .125rem 0 0;--_ui5-v2-3-0_popover_right_arrow_margin: .1875rem .25rem 0 0;--_ui5-v2-3-0_popover_downward_arrow_margin: -.4375rem .125rem 0 0;--_ui5-v2-3-0_popover_left_arrow_margin: .1875rem -.375rem 0 0;--_ui5-v2-3-0_dialog_resize_cursor:sw-resize;--_ui5-v2-3-0_menu_submenu_margin_offset: 0 -.25rem;--_ui5-v2-3-0_menu_submenu_placement_type_left_margin_offset: 0 .25rem;--_ui5-v2-3-0-menu_item_icon_float: left;--_ui5-v2-3-0-shellbar-notification-btn-count-offset: auto;--_ui5-v2-3-0_segmented_btn_item_border_left: .0625rem;--_ui5-v2-3-0_segmented_btn_item_border_right: .0625rem;--_ui5-v2-3-0_progress_indicator_bar_border_radius: .5rem;--_ui5-v2-3-0_progress_indicator_remaining_bar_border_radius: .25rem}[data-ui5-compact-size],.ui5-content-density-compact,.sapUiSizeCompact{--_ui5-v2-3-0_input_min_width: 2rem;--_ui5-v2-3-0_input_icon_width: 2rem;--_ui5-v2-3-0_input_information_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-3-0_input_information_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-3-0_input_error_warning_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-3-0_input_error_warning_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-3-0_input_custom_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-3-0_input_error_warning_custom_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-3-0_input_error_warning_custom_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-3-0_input_information_custom_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-3-0_input_information_custom_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-3-0_input_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-3-0_panel_header_button_wrapper_padding: .1875rem .25rem;--_ui5-v2-3-0_rating_indicator_item_height: 1em;--_ui5-v2-3-0_rating_indicator_item_width: 1em;--_ui5-v2-3-0_rating_indicator_readonly_item_height: .75em;--_ui5-v2-3-0_rating_indicator_readonly_item_width: .75em;--_ui5-v2-3-0_rating_indicator_component_spacing: .5rem 0px;--_ui5-v2-3-0_radio_button_min_width: 2rem;--_ui5-v2-3-0_radio_button_outer_ring_padding_with_label: 0 .5rem;--_ui5-v2-3-0_radio_button_outer_ring_padding: 0 .5rem;--_ui5-v2-3-0_radio_button_focus_dist: .1875rem;--_ui5-v2-3-0_switch_height: 2rem;--_ui5-v2-3-0_switch_width: 3rem;--_ui5-v2-3-0_switch_min_width: none;--_ui5-v2-3-0_switch_with_label_width: 3.75rem;--_ui5-v2-3-0_switch_root_outline_top: .25rem;--_ui5-v2-3-0_switch_root_outline_bottom: .25rem;--_ui5-v2-3-0_switch_transform: translateX(100%) translateX(-1.375rem);--_ui5-v2-3-0_switch_transform_with_label: translateX(100%) translateX(-1.875rem);--_ui5-v2-3-0_switch_rtl_transform: translateX(1.375rem) translateX(-100%);--_ui5-v2-3-0_switch_rtl_transform_with_label: translateX(1.875rem) translateX(-100%);--_ui5-v2-3-0_switch_track_width: 2rem;--_ui5-v2-3-0_switch_track_height: 1.25rem;--_ui5-v2-3-0_switch_track_with_label_width: 2.75rem;--_ui5-v2-3-0_switch_track_with_label_height: 1.25rem;--_ui5-v2-3-0_switch_handle_width: 1.25rem;--_ui5-v2-3-0_switch_handle_height: 1rem;--_ui5-v2-3-0_switch_handle_with_label_width: 1.75rem;--_ui5-v2-3-0_switch_handle_with_label_height: 1rem;--_ui5-v2-3-0_switch_text_font_size: var(--sapFontSize);--_ui5-v2-3-0_switch_text_width: 1rem;--_ui5-v2-3-0_switch_text_active_left: .1875rem;--_ui5-v2-3-0_textarea_padding_right_and_left_readonly: .4375rem;--_ui5-v2-3-0_textarea_padding_top_readonly: .125rem;--_ui5-v2-3-0_textarea_exceeded_text_height: .375rem;--_ui5-v2-3-0_textarea_min_height: 1.625rem;--_ui5-v2-3-0_textarea_padding_bottom_readonly: .0625rem;--_ui5-v2-3-0_textarea_padding_top_error_warning: .1875rem;--_ui5-v2-3-0_textarea_padding_bottom_error_warning: .125rem;--_ui5-v2-3-0_textarea_padding_top_information: .1875rem;--_ui5-v2-3-0_textarea_padding_bottom_information: .125rem;--_ui5-v2-3-0_textarea_padding_right_and_left: .5rem;--_ui5-v2-3-0_textarea_padding_right_and_left_error_warning: .5rem;--_ui5-v2-3-0_textarea_padding_right_and_left_information: .5rem;--_ui5-v2-3-0_token_selected_focused_offset_bottom: -.25rem;--_ui5-v2-3-0_tokenizer-popover_offset: .1875rem;--_ui5-v2-3-0_slider_handle_icon_size: .875rem;--_ui5-v2-3-0_slider_padding: 1rem 1.0625rem;--_ui5-v2-3-0_range_slider_progress_focus_width: calc(100% + var(--_ui5-v2-3-0_slider_handle_width) + 10px);--_ui5-v2-3-0_range_slider_progress_focus_height: calc(var(--_ui5-v2-3-0_slider_handle_height) + 10px);--_ui5-v2-3-0_range_slider_progress_focus_top: -.8125rem;--_ui5-v2-3-0_slider_tooltip_bottom: 1.75rem;--_ui5-v2-3-0_slider_handle_focused_tooltip_distance: calc(var(--_ui5-v2-3-0_slider_tooltip_bottom) - var(--_ui5-v2-3-0_slider_handle_focus_width));--_ui5-v2-3-0_range_slider_progress_focus_left: calc(-1 * (var(--_ui5-v2-3-0_slider_handle_width) / 2) - 5px);--_ui5-v2-3-0_bar_base_height: 2.5rem;--_ui5-v2-3-0_bar_subheader_height: 2.25rem;--_ui5-v2-3-0_button_base_height: var(--sapElement_Compact_Height);--_ui5-v2-3-0_button_base_padding: .4375rem;--_ui5-v2-3-0_button_base_min_width: 2rem;--_ui5-v2-3-0_button_icon_font_size: 1rem;--_ui5-v2-3-0_calendar_height: 18rem;--_ui5-v2-3-0_calendar_width: 17.75rem;--_ui5-v2-3-0_calendar_left_right_padding: .25rem;--_ui5-v2-3-0_calendar_top_bottom_padding: .5rem;--_ui5-v2-3-0_calendar_header_height: 2rem;--_ui5-v2-3-0_calendar_header_arrow_button_width: 2rem;--_ui5-v2-3-0_calendar_header_padding: 0;--_ui5-v2-3-0-calendar-legend-root-padding: .5rem;--_ui5-v2-3-0-calendar-legend-root-width: 16.75rem;--_ui5-v2-3-0-calendar-legend-item-root-focus-margin: -.125rem;--_ui5-v2-3-0_checkbox_root_side_padding: var(--_ui5-v2-3-0_checkbox_wrapped_focus_padding);--_ui5-v2-3-0_checkbox_width_height: var(--_ui5-v2-3-0_checkbox_compact_width_height);--_ui5-v2-3-0_checkbox_wrapper_padding: var(--_ui5-v2-3-0_checkbox_compact_wrapper_padding);--_ui5-v2-3-0_checkbox_inner_width_height: var(--_ui5-v2-3-0_checkbox_compact_inner_size);--_ui5-v2-3-0_checkbox_icon_size: .75rem;--_ui5-v2-3-0_checkbox_partially_icon_size: .5rem;--_ui5-v2-3-0_custom_list_item_rb_min_width: 2rem;--_ui5-v2-3-0_daypicker_weeknumbers_container_padding_top: 2rem;--_ui5-v2-3-0_day_picker_item_width: 2rem;--_ui5-v2-3-0_day_picker_item_height: 2rem;--_ui5-v2-3-0_day_picker_empty_height: 2.125rem;--_ui5-v2-3-0_day_picker_item_justify_content: flex-end;--_ui5-v2-3-0_dp_two_calendar_item_now_text_padding_top: .5rem;--_ui5-v2-3-0_dp_two_calendar_item_primary_text_height: 1rem;--_ui5-v2-3-0_dp_two_calendar_item_secondary_text_height: .75rem;--_ui5-v2-3-0_dp_two_calendar_item_text_padding_top: .5rem;--_ui5-v2-3-0_daypicker_special_day_top: 1.625rem;--_ui5-v2-3-0_daypicker_twocalendar_item_special_day_top: 1.25rem;--_ui5-v2-3-0_daypicker_twocalendar_item_special_day_right: 1.25rem;--_ui5-v2-3-0_daypicker_two_calendar_item_margin_bottom: 0;--_ui5-v2-3-0_daypicker_item_now_selected_two_calendar_focus_special_day_top: 1.125rem;--_ui5-v2-3-0_daypicker_item_now_selected_two_calendar_focus_special_day_right: 1.125rem;--_ui5-v2-3-0_daypicker_item_now_selected_two_calendar_focus_secondary_text_padding_block: 0 1rem;--_ui5-v2-3-0_datetime_picker_height: 20.5rem;--_ui5-v2-3-0_datetime_picker_width: 35.5rem;--_ui5-v2-3-0_datetime_timeview_width: 17rem;--_ui5-v2-3-0_datetime_timeview_phonemode_width: 18.5rem;--_ui5-v2-3-0_datetime_timeview_padding: .5rem;--_ui5-v2-3-0_datetime_timeview_phonemode_clocks_width: 21.125rem;--_ui5-v2-3-0_datetime_dateview_phonemode_margin_bottom: 3.125rem;--_ui5-v2-3-0_dialog_content_min_height: 2.5rem;--_ui5-v2-3-0_dialog_footer_height: 2.5rem;--_ui5-v2-3-0_form_item_min_height: 2rem;--_ui5-v2-3-0_form_item_padding: .25rem;--_ui5-v2-3-0-form-group-heading-height: 2rem;--_ui5-v2-3-0_input_height: var(--sapElement_Compact_Height);--_ui5-v2-3-0_input_inner_padding: 0 .5rem;--_ui5-v2-3-0_input_inner_padding_with_icon: 0 .2rem 0 .5rem;--_ui5-v2-3-0_input_inner_space_to_tokenizer: .125rem;--_ui5-v2-3-0_input_inner_space_to_n_more_text: .125rem;--_ui5-v2-3-0_input_icon_min_width: var(--_ui5-v2-3-0_input_compact_min_width);--_ui5-v2-3-0_menu_item_padding: 0 .75rem 0 .5rem;--_ui5-v2-3-0_menu_item_submenu_icon_right: .75rem;--_ui5-v2-3-0_popup_default_header_height: 2.5rem;--_ui5-v2-3-0_textarea_margin: .1875rem 0;--_ui5-v2-3-0_list_no_data_height: 2rem;--_ui5-v2-3-0_list_item_cb_margin_right: .5rem;--_ui5-v2-3-0_list_item_title_size: var(--sapFontSize);--_ui5-v2-3-0_list_item_img_top_margin: .55rem;--_ui5-v2-3-0_list_no_data_font_size: var(--sapFontSize);--_ui5-v2-3-0_list_item_dropdown_base_height: 2rem;--_ui5-v2-3-0_list_item_base_height: 2rem;--_ui5-v2-3-0_list_item_base_padding: 0 1rem;--_ui5-v2-3-0_list_item_icon_size: 1rem;--_ui5-v2-3-0_list_item_selection_btn_margin_top: calc(-1 * var(--_ui5-v2-3-0_checkbox_wrapper_padding));--_ui5-v2-3-0_list_item_content_vertical_offset: calc((var(--_ui5-v2-3-0_list_item_base_height) - var(--_ui5-v2-3-0_list_item_title_size)) / 2);--_ui5-v2-3-0_list_busy_row_height: 2rem;--_ui5-v2-3-0_list_buttons_left_space: .125rem;--_ui5-v2-3-0_month_picker_item_height: 2rem;--_ui5-v2-3-0_year_picker_item_height: 2rem;--_ui5-v2-3-0_panel_header_height: 2rem;--_ui5-v2-3-0_panel_button_root_height: 2rem;--_ui5-v2-3-0_panel_button_root_width: 2.5rem;--_ui5-v2-3-0_token_height: 1.25rem;--_ui5-v2-3-0_token_right_margin: .25rem;--_ui5-v2-3-0_token_left_padding: .25rem;--_ui5-v2-3-0_token_readonly_padding: .125rem .25rem;--_ui5-v2-3-0_token_focus_offset: -.125rem;--_ui5-v2-3-0_token_icon_size: .75rem;--_ui5-v2-3-0_token_icon_padding: .375rem .375rem;--_ui5-v2-3-0_token_wrapper_right_padding: .25rem;--_ui5-v2-3-0_token_wrapper_left_padding: 0;--_ui5-v2-3-0_token_outline_offset: -.125rem;--_ui5-v2-3-0_tl_bubble_padding: .5rem;--_ui5-v2-3-0_tl_indicator_before_bottom: -.5rem;--_ui5-v2-3-0_tl_padding: .5rem;--_ui5-v2-3-0_tl_li_margin_bottom: .5rem;--_ui5-v2-3-0_tc_item_text: 2rem;--_ui5-v2-3-0_tc_item_text_line_height: 1.325rem;--_ui5-v2-3-0_tc_item_add_text_margin_top: .3125rem;--_ui5-v2-3-0_tc_item_height: 4rem;--_ui5-v2-3-0_tc_header_height: var(--_ui5-v2-3-0_tc_item_height);--_ui5-v2-3-0_tc_item_icon_circle_size: 2rem;--_ui5-v2-3-0_tc_item_icon_size: 1rem;--_ui5-v2-3-0_radio_button_height: 2rem;--_ui5-v2-3-0_radio_button_label_side_padding: .5rem;--_ui5-v2-3-0_radio_button_inner_size: 2rem;--_ui5-v2-3-0_radio_button_svg_size: 1rem;--_ui5-v2-3-0-responsive_popover_header_height: 2.5rem;--ui5-v2-3-0_side_navigation_item_height: 2rem;--_ui5-v2-3-0_slider_handle_height: 1.25rem;--_ui5-v2-3-0_slider_handle_width: 1.25rem;--_ui5-v2-3-0_slider_tooltip_padding: .25rem;--_ui5-v2-3-0_slider_progress_outline_offset: -.625rem;--_ui5-v2-3-0_slider_outer_height: 1.3125rem;--_ui5-v2-3-0_step_input_min_width: 6rem;--_ui5-v2-3-0_step_input_padding: 2rem;--_ui5-v2-3-0-tree-indent-step: .5rem;--_ui5-v2-3-0-tree-toggle-box-width: 2rem;--_ui5-v2-3-0-tree-toggle-box-height: 1.5rem;--_ui5-v2-3-0-tree-toggle-icon-size: .8125rem;--_ui5-v2-3-0_timeline_tli_indicator_before_bottom: -.75rem;--_ui5-v2-3-0_timeline_tli_indicator_before_right: -.5rem;--_ui5-v2-3-0_timeline_tli_indicator_before_without_icon_bottom: -1rem;--_ui5-v2-3-0_timeline_tli_indicator_before_without_icon_right: -.8125rem;--_ui5-v2-3-0_timeline_tli_indicator_before_height: calc(100% - 1.25rem) ;--_ui5-v2-3-0_timeline_tli_horizontal_without_icon_indicator_before_width: var(--_ui5-v2-3-0_timeline_tli_indicator_after_height);--_ui5-v2-3-0_timeline_tli_horizontal_indicator_after_width: var(--_ui5-v2-3-0_timeline_tli_indicator_after_height);--_ui5-v2-3-0_timeline_tli_horizontal_indicator_before_width: var(--_ui5-v2-3-0_timeline_tli_indicator_after_height);--_ui5-v2-3-0_timeline_tli_icon_horizontal_indicator_after_width: var(--_ui5-v2-3-0_timeline_tli_indicator_after_height);--_ui5-v2-3-0_timeline_tli_indicator_after_top: calc(-100% + .9375rem) ;--_ui5-v2-3-0_timeline_tli_indicator_after_height: calc(100% - .75rem) ;--_ui5-v2-3-0_timeline_tli_horizontal_indicator_after_left: 1.8625rem;--_ui5-v2-3-0_timeline_tli_horizontal_indicator_short_after_width: calc(100% - 1rem) ;--_ui5-v2-3-0_timeline_tli_without_icon_horizontal_indicator_before_width: calc(100% - .625rem) ;--_ui5-v2-3-0_timeline_tli_last_child_vertical_indicator_before_height: calc(100% - 2.5rem) ;--_ui5-v2-3-0_timeline_tlgi_compact_icon_before_height: calc(100% + 1.5rem) ;--_ui5-v2-3-0_timeline_tlgi_horizontal_line_placeholder_before_width: var(--_ui5-v2-3-0_timeline_tlgi_compact_icon_before_height);--_ui5-v2-3-0_timeline_tlgi_horizontal_compact_root_margin_left: .5rem;--_ui5-v2-3-0_timeline_tlgi_compact_root_gap: .5rem;--_ui5-v2-3-0_timeline_tlgi_root_horizontal_height: 19.375rem;--_ui5-v2-3-0_vsd_header_container: 2.5rem;--_ui5-v2-3-0_vsd_sub_header_container_height: 2rem;--_ui5-v2-3-0_vsd_header_height: 4rem;--_ui5-v2-3-0_vsd_expand_content_height: 25.4375rem;--_ui5-v2-3-0-toolbar-separator-height: 1.5rem;--_ui5-v2-3-0-toolbar-height: 2rem;--_ui5-v2-3-0_toolbar_overflow_padding: .1875rem .375rem;--_ui5-v2-3-0_dynamic_page_title_actions_separator_height: var(--_ui5-v2-3-0-toolbar-separator-height);--_ui5-v2-3-0_textarea_padding_top: .1875rem;--_ui5-v2-3-0_textarea_padding_bottom: .125rem;--_ui5-v2-3-0_checkbox_focus_position: .25rem;--_ui5-v2-3-0_split_button_middle_separator_top: .3125rem;--_ui5-v2-3-0_split_button_middle_separator_height: 1rem;--_ui5-v2-3-0_slider_handle_top: -.5rem;--_ui5-v2-3-0_slider_tooltip_height: 1.375rem;--_ui5-v2-3-0_checkbox_wrapped_focus_inset_block: .125rem;--_ui5-v2-3-0_color-palette-item-height: 1.25rem;--_ui5-v2-3-0_color-palette-item-focus-height: 1rem;--_ui5-v2-3-0_color-palette-item-container-sides-padding: .1875rem;--_ui5-v2-3-0_color-palette-item-container-rows-padding: .8125rem;--_ui5-v2-3-0_color-palette-item-hover-height: 1.625rem;--_ui5-v2-3-0_color-palette-item-margin: calc(((var(--_ui5-v2-3-0_color-palette-item-hover-height) - var(--_ui5-v2-3-0_color-palette-item-height)) / 2) + .0625rem);--_ui5-v2-3-0_color-palette-row-width: 8.75rem;--_ui5-v2-3-0_color-palette-swatch-container-padding: .1875rem .5rem;--_ui5-v2-3-0_color-palette-item-hover-margin: .0625rem;--_ui5-v2-3-0_color-palette-row-height: 7.5rem;--_ui5-v2-3-0_color-palette-button-height: 2rem;--_ui5-v2-3-0_color-palette-item-before-focus-inset: -.25rem;--_ui5-v2-3-0_color_picker_slider_container_margin_top: -9px;--_ui5-v2-3-0_daypicker_selected_item_now_special_day_top: 1.5625rem;--_ui5-v2-3-0_daypicker_specialday_focused_top: 1.3125rem;--_ui5-v2-3-0_daypicker_selected_item_now_special_day_border_bottom_radius_alternate: .5rem;--_ui5-v2-3-0_daypicker_specialday_focused_border_bottom: .25rem;--_ui5-v2-3-0_daypicker_item_now_specialday_top: 1.4375rem;--_ui5-v2-3-0_dp_two_calendar_item_secondary_text_padding_block: 0 .375rem;--_ui5-v2-3-0_dp_two_calendar_item_secondary_text_padding: 0 .375rem;--_ui5-v2-3-0_daypicker_two_calendar_item_selected_focus_margin_bottom: -.25rem;--_ui5-v2-3-0_daypicker_two_calendar_item_selected_focus_padding_right: .4375rem}:root,[dir=ltr]{--_ui5-v2-3-0_rotation_90deg: rotate(90deg);--_ui5-v2-3-0_rotation_minus_90deg: rotate(-90deg);--_ui5-v2-3-0_icon_transform_scale: none;--_ui5-v2-3-0_panel_toggle_btn_rotation: var(--_ui5-v2-3-0_rotation_90deg);--_ui5-v2-3-0_li_notification_group_toggle_btn_rotation: var(--_ui5-v2-3-0_rotation_90deg);--_ui5-v2-3-0_timeline_scroll_container_offset: .5rem;--_ui5-v2-3-0_popover_upward_arrow_margin: .1875rem 0 0 .1875rem;--_ui5-v2-3-0_popover_right_arrow_margin: .1875rem 0 0 -.375rem;--_ui5-v2-3-0_popover_downward_arrow_margin: -.375rem 0 0 .125rem;--_ui5-v2-3-0_popover_left_arrow_margin: .125rem 0 0 .25rem;--_ui5-v2-3-0_dialog_resize_cursor: se-resize;--_ui5-v2-3-0_progress_indicator_bar_border_radius: .5rem 0 0 .5rem;--_ui5-v2-3-0_progress_indicator_remaining_bar_border_radius: 0 .5rem .5rem 0;--_ui5-v2-3-0_menu_submenu_margin_offset: -.25rem 0;--_ui5-v2-3-0_menu_submenu_placement_type_left_margin_offset: .25rem 0;--_ui5-v2-3-0-menu_item_icon_float: right;--_ui5-v2-3-0-shellbar-notification-btn-count-offset: -.125rem}
` };

    _ui5_webcomponentsBase.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_horizon", async () => styleData$4);
    _ui5_webcomponentsBase.registerThemePropertiesLoader("@ui5/webcomponents", "sap_horizon", async () => styleData$3);
    const styleData$2 = { packageName: "@ui5/webcomponents", fileName: "themes/Icon.css.ts", content: `:host{-webkit-tap-highlight-color:rgba(0,0,0,0)}:host([hidden]){display:none}:host([invalid]){display:none}:host(:not([hidden]).ui5_hovered){opacity:.7}:host{display:inline-block;width:1rem;height:1rem;color:var(--sapContent_IconColor);fill:currentColor;outline:none}:host([design="Contrast"]){color:var(--sapContent_ContrastIconColor)}:host([design="Critical"]){color:var(--sapCriticalElementColor)}:host([design="Information"]){color:var(--sapInformativeElementColor)}:host([design="Negative"]){color:var(--sapNegativeElementColor)}:host([design="Neutral"]){color:var(--sapNeutralElementColor)}:host([design="NonInteractive"]){color:var(--sapContent_NonInteractiveIconColor)}:host([design="Positive"]){color:var(--sapPositiveElementColor)}:host([mode="Interactive"][desktop]) .ui5-icon-root:focus,:host([mode="Interactive"]) .ui5-icon-root:focus-visible{outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);border-radius:var(--ui5-v2-3-0-icon-focus-border-radius)}.ui5-icon-root{display:flex;height:100%;width:100%;outline:none;vertical-align:top}:host([mode="Interactive"]){cursor:pointer}.ui5-icon-root:not([dir=ltr]){transform:var(--_ui5-v2-3-0_icon_transform_scale);transform-origin:center}
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
        if (_ui5_webcomponentsBase.isDesktop()) {
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

    _ui5_webcomponentsBase.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_horizon", async () => styleData$4);
    _ui5_webcomponentsBase.registerThemePropertiesLoader("@ui5/webcomponents", "sap_horizon", async () => styleData$3);
    const styleData$1 = { packageName: "@ui5/webcomponents", fileName: "themes/Button.css.ts", content: `:host{vertical-align:middle}.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:inline-block}:host{min-width:var(--_ui5-v2-3-0_button_base_min_width);height:var(--_ui5-v2-3-0_button_base_height);line-height:normal;font-family:var(--_ui5-v2-3-0_button_fontFamily);font-size:var(--sapFontSize);text-shadow:var(--_ui5-v2-3-0_button_text_shadow);border-radius:var(--_ui5-v2-3-0_button_border_radius);cursor:pointer;background-color:var(--sapButton_Background);border:var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);color:var(--sapButton_TextColor);box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ui5-button-root{min-width:inherit;cursor:inherit;height:100%;width:100%;box-sizing:border-box;display:flex;justify-content:center;align-items:center;outline:none;padding:0 var(--_ui5-v2-3-0_button_base_padding);position:relative;background:transparent;border:none;color:inherit;text-shadow:inherit;font:inherit;white-space:inherit;overflow:inherit;text-overflow:inherit;letter-spacing:inherit;word-spacing:inherit;line-height:inherit;-webkit-user-select:none;-moz-user-select:none;user-select:none}:host(:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host(:not([hidden]):not([disabled]).ui5_hovered){background:var(--sapButton_Hover_Background);border:1px solid var(--sapButton_Hover_BorderColor);color:var(--sapButton_Hover_TextColor)}.ui5-button-icon,.ui5-button-end-icon{color:inherit;flex-shrink:0}.ui5-button-end-icon{margin-inline-start:var(--_ui5-v2-3-0_button_base_icon_margin)}:host([icon-only]:not([has-end-icon])) .ui5-button-root{min-width:auto;padding:0}:host([icon-only]) .ui5-button-text{display:none}.ui5-button-text{outline:none;position:relative;white-space:inherit;overflow:inherit;text-overflow:inherit}:host([has-icon]:not(:empty)) .ui5-button-text{margin-inline-start:var(--_ui5-v2-3-0_button_base_icon_margin)}:host([has-end-icon]:not([has-icon]):empty) .ui5-button-end-icon{margin-inline-start:0}:host([disabled]){opacity:var(--sapContent_DisabledOpacity);pointer-events:unset;cursor:default}:host([has-icon]:not([icon-only]):not([has-end-icon])) .ui5-button-text{min-width:calc(var(--_ui5-v2-3-0_button_base_min_width) - var(--_ui5-v2-3-0_button_base_icon_margin) - 1rem)}:host([disabled]:active){pointer-events:none}:host([desktop]:not([active])) .ui5-button-root:focus-within:after,:host(:not([active])) .ui5-button-root:focus-visible:after,:host([desktop][active][design="Emphasized"]) .ui5-button-root:focus-within:after,:host([active][design="Emphasized"]) .ui5-button-root:focus-visible:after,:host([desktop][active]) .ui5-button-root:focus-within:before,:host([active]) .ui5-button-root:focus-visible:before{content:"";position:absolute;box-sizing:border-box;inset:.0625rem;border:var(--_ui5-v2-3-0_button_focused_border);border-radius:var(--_ui5-v2-3-0_button_focused_border_radius)}:host([desktop][active]) .ui5-button-root:focus-within:before,:host([active]) .ui5-button-root:focus-visible:before{border-color:var(--_ui5-v2-3-0_button_pressed_focused_border_color)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:after,:host([design="Emphasized"]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-3-0_button_emphasized_focused_border_color)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:before,:host([design="Emphasized"]) .ui5-button-root:focus-visible:before{content:"";position:absolute;box-sizing:border-box;inset:.0625rem;border:var(--_ui5-v2-3-0_button_emphasized_focused_border_before);border-radius:var(--_ui5-v2-3-0_button_focused_border_radius)}.ui5-button-root::-moz-focus-inner{border:0}bdi{display:block;white-space:inherit;overflow:inherit;text-overflow:inherit}:host([ui5-button][active]:not([disabled]):not([non-interactive])){background-image:none;background-color:var(--sapButton_Active_Background);border-color:var(--sapButton_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([design="Positive"]){background-color:var(--sapButton_Accept_Background);border-color:var(--sapButton_Accept_BorderColor);color:var(--sapButton_Accept_TextColor)}:host([design="Positive"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Positive"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Accept_Hover_Background);border-color:var(--sapButton_Accept_Hover_BorderColor);color:var(--sapButton_Accept_Hover_TextColor)}:host([ui5-button][design="Positive"][active]:not([non-interactive])){background-color:var(--sapButton_Accept_Active_Background);border-color:var(--sapButton_Accept_Active_BorderColor);color:var(--sapButton_Accept_Active_TextColor)}:host([design="Negative"]){background-color:var(--sapButton_Reject_Background);border-color:var(--sapButton_Reject_BorderColor);color:var(--sapButton_Reject_TextColor)}:host([design="Negative"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Negative"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Reject_Hover_Background);border-color:var(--sapButton_Reject_Hover_BorderColor);color:var(--sapButton_Reject_Hover_TextColor)}:host([ui5-button][design="Negative"][active]:not([non-interactive])){background-color:var(--sapButton_Reject_Active_Background);border-color:var(--sapButton_Reject_Active_BorderColor);color:var(--sapButton_Reject_Active_TextColor)}:host([design="Attention"]){background-color:var(--sapButton_Attention_Background);border-color:var(--sapButton_Attention_BorderColor);color:var(--sapButton_Attention_TextColor)}:host([design="Attention"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Attention"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Attention_Hover_Background);border-color:var(--sapButton_Attention_Hover_BorderColor);color:var(--sapButton_Attention_Hover_TextColor)}:host([ui5-button][design="Attention"][active]:not([non-interactive])){background-color:var(--sapButton_Attention_Active_Background);border-color:var(--sapButton_Attention_Active_BorderColor);color:var(--sapButton_Attention_Active_TextColor)}:host([design="Emphasized"]){background-color:var(--sapButton_Emphasized_Background);border-color:var(--sapButton_Emphasized_BorderColor);border-width:var(--_ui5-v2-3-0_button_emphasized_border_width);color:var(--sapButton_Emphasized_TextColor);font-family:var(--sapFontBoldFamily )}:host([design="Emphasized"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Emphasized"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Emphasized_Hover_Background);border-color:var(--sapButton_Emphasized_Hover_BorderColor);border-width:var(--_ui5-v2-3-0_button_emphasized_border_width);color:var(--sapButton_Emphasized_Hover_TextColor)}:host([ui5-button][design="Empasized"][active]:not([non-interactive])){background-color:var(--sapButton_Emphasized_Active_Background);border-color:var(--sapButton_Emphasized_Active_BorderColor);color:var(--sapButton_Emphasized_Active_TextColor)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:after,:host([design="Emphasized"]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-3-0_button_emphasized_focused_border_color);outline:none}:host([design="Emphasized"][desktop][active]:not([non-interactive])) .ui5-button-root:focus-within:after,:host([design="Emphasized"][active]:not([non-interactive])) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-3-0_button_emphasized_focused_active_border_color)}:host([design="Transparent"]){background-color:var(--sapButton_Lite_Background);color:var(--sapButton_Lite_TextColor);border-color:var(--sapButton_Lite_BorderColor)}:host([design="Transparent"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Transparent"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Lite_Hover_Background);border-color:var(--sapButton_Lite_Hover_BorderColor);color:var(--sapButton_Lite_Hover_TextColor)}:host([ui5-button][design="Transparent"][active]:not([non-interactive])){background-color:var(--sapButton_Lite_Active_Background);border-color:var(--sapButton_Lite_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([ui5-segmented-button-item][active][desktop]) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item][active]) .ui5-button-root:focus-visible:after,:host([pressed][desktop]) .ui5-button-root:focus-within:after,:host([pressed]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-3-0_button_pressed_focused_border_color);outline:none}:host([ui5-segmented-button-item][desktop]:not(:last-child)) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item]:not(:last-child)) .ui5-button-root:focus-visible:after{border-top-right-radius:var(--_ui5-v2-3-0_button_focused_inner_border_radius);border-bottom-right-radius:var(--_ui5-v2-3-0_button_focused_inner_border_radius)}:host([ui5-segmented-button-item][desktop]:not(:first-child)) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item]:not(:first-child)) .ui5-button-root:focus-visible:after{border-top-left-radius:var(--_ui5-v2-3-0_button_focused_inner_border_radius);border-bottom-left-radius:var(--_ui5-v2-3-0_button_focused_inner_border_radius)}
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
        if (_ui5_webcomponentsBase.isDesktop()) {
          this.setAttribute("desktop", "");
        }
      }
      async onBeforeRendering() {
        this.hasIcon = !!this.icon;
        this.hasEndIcon = !!this.endIcon;
        this.iconOnly = this.isIconOnly;
        this.buttonTitle = this.tooltip || await this.getDefaultTooltip();
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
        if (_ui5_webcomponentsBase.isSafari()) {
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
      getDefaultTooltip() {
        if (!getEnableDefaultTooltips()) {
          return;
        }
        return getIconAccessibleName(this.icon);
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
        return getEnableDefaultTooltips() && this.iconOnly && !this.tooltip;
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
    __decorate$1([i18n("@ui5/webcomponents")], Button, "i18nBundle", void 0);
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

    _ui5_webcomponentsBase.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_horizon", async () => styleData$4);
    _ui5_webcomponentsBase.registerThemePropertiesLoader("@ui5/webcomponents", "sap_horizon", async () => styleData$3);
    const styleData = { packageName: "@ui5/webcomponents", fileName: "themes/Panel.css.ts", content: `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:block}:host{font-family:"72override",var(--sapFontFamily);background-color:var(--sapGroup_TitleBackground);border-radius:var(--_ui5-v2-3-0_panel_border_radius)}:host(:not([collapsed])){border-bottom:var(--_ui5-v2-3-0_panel_border_bottom)}:host([fixed]) .ui5-panel-header{padding-left:1rem}.ui5-panel-header{min-height:var(--_ui5-v2-3-0_panel_header_height);width:100%;position:relative;display:flex;justify-content:flex-start;align-items:center;outline:none;box-sizing:border-box;padding-right:var(--_ui5-v2-3-0_panel_header_padding_right);font-family:"72override",var(--sapFontHeaderFamily);font-size:var(--sapGroup_Title_FontSize);font-weight:400;color:var(--sapGroup_TitleTextColor)}.ui5-panel-header-icon{color:var(--_ui5-v2-3-0_panel_icon_color)}.ui5-panel-header-button-animated{transition:transform .4s ease-out}:host(:not([_has-header]):not([fixed])) .ui5-panel-header{cursor:pointer}:host(:not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{content:"";position:absolute;pointer-events:none;z-index:2;border:var(--_ui5-v2-3-0_panel_focus_border);border-radius:var(--_ui5-v2-3-0_panel_border_radius);top:var(--_ui5-v2-3-0_panel_focus_offset);bottom:var(--_ui5-v2-3-0_panel_focus_bottom_offset);left:var(--_ui5-v2-3-0_panel_focus_offset);right:var(--_ui5-v2-3-0_panel_focus_offset)}:host(:not([collapsed]):not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{border-radius:var(--_ui5-v2-3-0_panel_border_radius_expanded)}:host(:not([collapsed])) .ui5-panel-header-button:not(.ui5-panel-header-button-with-icon),:host(:not([collapsed])) .ui5-panel-header-icon-wrapper [ui5-icon]{transform:var(--_ui5-v2-3-0_panel_toggle_btn_rotation)}:host([fixed]) .ui5-panel-header-title{width:100%}.ui5-panel-heading-wrapper.ui5-panel-heading-wrapper-sticky{position:sticky;top:0;background-color:var(--_ui5-v2-3-0_panel_header_background_color);z-index:100;border-radius:var(--_ui5-v2-3-0_panel_border_radius)}.ui5-panel-header-title{width:calc(100% - var(--_ui5-v2-3-0_panel_button_root_width));overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ui5-panel-content{padding:var(--_ui5-v2-3-0_panel_content_padding);background-color:var(--sapGroup_ContentBackground);outline:none;border-bottom-left-radius:var(--_ui5-v2-3-0_panel_border_radius);border-bottom-right-radius:var(--_ui5-v2-3-0_panel_border_radius);overflow:auto}.ui5-panel-header-button-root{display:flex;justify-content:center;align-items:center;flex-shrink:0;width:var(--_ui5-v2-3-0_panel_button_root_width);height:var(--_ui5-v2-3-0_panel_button_root_height);padding:var(--_ui5-v2-3-0_panel_header_button_wrapper_padding);box-sizing:border-box}:host([fixed]:not([collapsed]):not([_has-header])) .ui5-panel-header,:host([collapsed]) .ui5-panel-header{border-bottom:.0625rem solid var(--sapGroup_TitleBorderColor)}:host([collapsed]) .ui5-panel-header{border-bottom-left-radius:var(--_ui5-v2-3-0_panel_border_radius);border-bottom-right-radius:var(--_ui5-v2-3-0_panel_border_radius)}:host(:not([fixed]):not([collapsed])) .ui5-panel-header{border-bottom:var(--_ui5-v2-3-0_panel_default_header_border)}[ui5-button].ui5-panel-header-button{display:flex;justify-content:center;align-items:center;min-width:initial;height:100%;width:100%}.ui5-panel-header-icon-wrapper{display:flex;justify-content:center;align-items:center}.ui5-panel-header-icon-wrapper,.ui5-panel-header-icon-wrapper .ui5-panel-header-icon{color:inherit}.ui5-panel-header-icon-wrapper,[ui5-button].ui5-panel-header-button-with-icon [ui5-icon]{pointer-events:none}.ui5-panel-root{height:100%;display:flex;flex-direction:column}
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
        return this.noAnimation || getAnimationMode() === _ui5_webcomponentsBase.AnimationMode.None;
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
    __decorate([i18n("@ui5/webcomponents")], Panel, "i18nBundle", void 0);
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

    const WrapperClass = WebComponent.extend("@ui5/webcomponents.Panel", {
      metadata: {
      "namespace": "@ui5/webcomponents",
      "tag": "ui5-panel-mYsCoPeSuFfIx",
      "interfaces": [],
      "properties": {
        "headerText": {
          "type": "string",
          "mapping": "property"
        },
        "fixed": {
          "type": "boolean",
          "mapping": "property",
          "defaultValue": false
        },
        "collapsed": {
          "type": "boolean",
          "mapping": "property",
          "defaultValue": false
        },
        "noAnimation": {
          "type": "boolean",
          "mapping": "property",
          "defaultValue": false
        },
        "accessibleRole": {
          "type": "@ui5/webcomponents.PanelAccessibleRole",
          "mapping": "property",
          "defaultValue": "Form"
        },
        "headerLevel": {
          "type": "@ui5/webcomponents.TitleLevel",
          "mapping": "property",
          "defaultValue": "H2"
        },
        "accessibleName": {
          "type": "string",
          "mapping": "property"
        },
        "stickyHeader": {
          "type": "boolean",
          "mapping": "property",
          "defaultValue": false
        },
        "text": {
          "type": "string",
          "mapping": "textContent"
        },
        "width": {
          "type": "sap.ui.core.CSSSize",
          "mapping": "style"
        },
        "height": {
          "type": "sap.ui.core.CSSSize",
          "mapping": "style"
        }
      },
      "aggregations": {
        "content": {
          "type": "sap.ui.core.Control",
          "multiple": true
        },
        "header": {
          "type": "sap.ui.core.Control",
          "multiple": true,
          "slot": "header"
        }
      },
      "associations": {},
      "events": {
        "toggle": {}
      },
      "getters": [],
      "methods": [],
      "defaultAggregation": "content",
      "library": "@ui5/webcomponents.library",
      "designtime": "@ui5/webcomponents/designtime/Panel.designtime"
    },
      // TODO: Quick solution to fix a conversion between "number" and "core.CSSSize".
      //       WebC attribute is a number and is written back to the Control wrapper via core.WebComponent base class.
      //       The control property is defined as a "sap.ui.core.CSSSize".
    	setProperty: function(sPropName, v, bSupressInvalidate) {
        if (sPropName === "width" || sPropName === "height") {
          if (!isNaN(v)) {
            v += "px";
          }
        }
        return WebComponent.prototype.setProperty.apply(this, [sPropName, v, bSupressInvalidate]);
      }
    });

    return WrapperClass;

}));
