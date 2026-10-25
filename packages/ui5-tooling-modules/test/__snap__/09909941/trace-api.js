sap.ui.define(['exports'], (function (exports) { 'use strict';

	//#region src/diag/types.ts
	/**
	* Defines the available internal logging levels for the diagnostic logger, the numeric values
	* of the levels are defined to match the original values from the initial LogLevel to avoid
	* compatibility/migration issues for any implementation that assume the numeric ordering.
	*
	* @since 1.0.0
	*/
	let DiagLogLevel = /* @__PURE__ */ function(DiagLogLevel) {
		/** Diagnostic Logging level setting to disable all logging (except and forced logs) */
		DiagLogLevel[DiagLogLevel["NONE"] = 0] = "NONE";
		/** Identifies an error scenario */
		DiagLogLevel[DiagLogLevel["ERROR"] = 30] = "ERROR";
		/** Identifies a warning scenario */
		DiagLogLevel[DiagLogLevel["WARN"] = 50] = "WARN";
		/** General informational log message */
		DiagLogLevel[DiagLogLevel["INFO"] = 60] = "INFO";
		/** General debug log message */
		DiagLogLevel[DiagLogLevel["DEBUG"] = 70] = "DEBUG";
		/**
		* Detailed trace level logging should only be used for development, should only be set
		* in a development environment.
		*/
		DiagLogLevel[DiagLogLevel["VERBOSE"] = 80] = "VERBOSE";
		/** Used to set the logging level to include all logging */
		DiagLogLevel[DiagLogLevel["ALL"] = 9999] = "ALL";
		return DiagLogLevel;
	}({});

	var global$1 = (typeof global !== "undefined" ? global :
	  typeof self !== "undefined" ? self :
	  typeof window !== "undefined" ? window : {});

	//#region src/version.ts
	const VERSION = "1.10.0";

	//#region src/internal/semver.ts
	const re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
	/**
	* Create a function to test an API version to see if it is compatible with the provided ownVersion.
	*
	* The returned function has the following semantics:
	* - Exact match is always compatible
	* - Major versions must match exactly
	*    - 1.x package cannot use global 2.x package
	*    - 2.x package cannot use global 1.x package
	* - The minor version of the API module requesting access to the global API must be less than or equal to the minor version of this API
	*    - 1.3 package may use 1.4 global because the later global contains all functions 1.3 expects
	*    - 1.4 package may NOT use 1.3 global because it may try to call functions which don't exist on 1.3
	* - If the major version is 0, the minor version is treated as the major and the patch is treated as the minor
	* - Patch and build tag differences are not considered at this time
	*
	* @param ownVersion version which should be checked against
	*/
	function _makeCompatibilityCheck(ownVersion) {
		const acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
		const rejectedVersions = /* @__PURE__ */ new Set();
		const myVersionMatch = ownVersion.match(re);
		if (!myVersionMatch) return () => false;
		const ownVersionParsed = {
			major: +myVersionMatch[1],
			minor: +myVersionMatch[2],
			patch: +myVersionMatch[3],
			prerelease: myVersionMatch[4]
		};
		if (ownVersionParsed.prerelease != null) return function isExactmatch(globalVersion) {
			return globalVersion === ownVersion;
		};
		function _reject(v) {
			rejectedVersions.add(v);
			return false;
		}
		function _accept(v) {
			acceptedVersions.add(v);
			return true;
		}
		return function isCompatible(globalVersion) {
			if (acceptedVersions.has(globalVersion)) return true;
			if (rejectedVersions.has(globalVersion)) return false;
			const globalVersionMatch = globalVersion.match(re);
			if (!globalVersionMatch) return _reject(globalVersion);
			const globalVersionParsed = {
				major: +globalVersionMatch[1],
				minor: +globalVersionMatch[2],
				patch: +globalVersionMatch[3],
				prerelease: globalVersionMatch[4]
			};
			if (globalVersionParsed.prerelease != null) return _reject(globalVersion);
			if (ownVersionParsed.major !== globalVersionParsed.major) return _reject(globalVersion);
			if (ownVersionParsed.major === 0) {
				if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) return _accept(globalVersion);
				return _reject(globalVersion);
			}
			if (ownVersionParsed.minor <= globalVersionParsed.minor) return _accept(globalVersion);
			return _reject(globalVersion);
		};
	}
	/**
	* Test an API version to see if it is compatible with this API.
	*
	* - Exact match is always compatible
	* - Major versions must match exactly
	*    - 1.x package cannot use global 2.x package
	*    - 2.x package cannot use global 1.x package
	* - The minor version of the API module requesting access to the global API must be less than or equal to the minor version of this API
	*    - 1.3 package may use 1.4 global because the later global contains all functions 1.3 expects
	*    - 1.4 package may NOT use 1.3 global because it may try to call functions which don't exist on 1.3
	* - If the major version is 0, the minor version is treated as the major and the patch is treated as the minor
	* - Patch and build tag differences are not considered at this time
	*
	* @param version version of the API requesting an instance of the global API
	*/
	const isCompatible = _makeCompatibilityCheck(VERSION);

	//#region src/internal/global-utils.ts
	const major = VERSION.split(".")[0];
	const GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for(`opentelemetry.js.api.${major}`);
	const _global = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof window === "object" ? window : typeof global$1 === "object" ? global$1 : {};
	function _makeGlobalApi() {
		return Object.defineProperty({}, "version", {
			value: VERSION,
			enumerable: true,
			writable: false,
			configurable: false
		});
	}
	function registerGlobal(type, instance, diag, allowOverride = false) {
		var _global$GLOBAL_OPENTE;
		const api = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_global$GLOBAL_OPENTE = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _global$GLOBAL_OPENTE !== void 0 ? _global$GLOBAL_OPENTE : _makeGlobalApi();
		if (!allowOverride && api[type]) {
			const err = /* @__PURE__ */ new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${type}`);
			diag.error(err.stack || err.message);
			return false;
		}
		if (api.version !== "1.10.0") {
			const err = /* @__PURE__ */ new Error(`@opentelemetry/api: Registration of version v${api.version} for ${type} does not match previously registered API v${VERSION}`);
			diag.error(err.stack || err.message);
			return false;
		}
		api[type] = instance;
		diag.debug(`@opentelemetry/api: Registered a global for ${type} v${VERSION}.`);
		return true;
	}
	let _compatibleGlobalApi;
	function getGlobal(type) {
		const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
		if (api == null) return;
		if (api !== _compatibleGlobalApi) {
			if (!api.version || !isCompatible(api.version)) return;
			_compatibleGlobalApi = api;
		}
		return api[type];
	}
	function unregisterGlobal(type, diag) {
		diag.debug(`@opentelemetry/api: Unregistering a global for ${type} v${VERSION}.`);
		const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
		if (api) delete api[type];
	}

	//#region src/diag/ComponentLogger.ts
	/**
	* Component Logger which is meant to be used as part of any component which
	* will add automatically additional namespace in front of the log message.
	* It will then forward all message to global diag logger
	* @example
	* const cLogger = diag.createComponentLogger({ namespace: '@opentelemetry/instrumentation-http' });
	* cLogger.debug('test');
	* // @opentelemetry/instrumentation-http test
	*/
	var DiagComponentLogger = class {
		constructor(props) {
			this._namespace = props.namespace || "DiagComponentLogger";
		}
		debug(...args) {
			return logProxy("debug", this._namespace, args);
		}
		error(...args) {
			return logProxy("error", this._namespace, args);
		}
		info(...args) {
			return logProxy("info", this._namespace, args);
		}
		warn(...args) {
			return logProxy("warn", this._namespace, args);
		}
		verbose(...args) {
			return logProxy("verbose", this._namespace, args);
		}
	};
	function logProxy(funcName, namespace, args) {
		const logger = getGlobal("diag");
		if (!logger) return;
		return logger[funcName](namespace, ...args);
	}

	//#region src/diag/internal/logLevelLogger.ts
	function createLogLevelDiagLogger(maxLevel, logger) {
		if (maxLevel < 0) maxLevel = 0;
		else if (maxLevel > 9999) maxLevel = 9999;
		logger = logger || {};
		function _filterFunc(funcName, theLevel) {
			const theFunc = logger[funcName];
			if (typeof theFunc === "function" && maxLevel >= theLevel) return theFunc.bind(logger);
			return function() {};
		}
		return {
			error: _filterFunc("error", 30),
			warn: _filterFunc("warn", 50),
			info: _filterFunc("info", 60),
			debug: _filterFunc("debug", 70),
			verbose: _filterFunc("verbose", 80)
		};
	}

	//#region src/api/diag.ts
	const API_NAME$5 = "diag";
	/**
	* Singleton object which represents the entry point to the OpenTelemetry internal
	* diagnostic API
	*
	* @since 1.0.0
	*/
	var DiagAPI = class DiagAPI {
		/** Get the singleton instance of the DiagAPI API */
		static instance() {
			if (!this._instance) this._instance = new DiagAPI();
			return this._instance;
		}
		/**
		* Private internal constructor
		* @private
		*/
		constructor() {
			function _logProxy(funcName) {
				return function(...args) {
					const logger = getGlobal("diag");
					if (!logger) return;
					return logger[funcName](...args);
				};
			}
			const self = this;
			const setLogger = (logger, optionsOrLogLevel = { logLevel: 60 }) => {
				var _optionsOrLogLevel$lo;
				if (logger === self) {
					var _err$stack;
					const err = /* @__PURE__ */ new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
					self.error((_err$stack = err.stack) !== null && _err$stack !== void 0 ? _err$stack : err.message);
					return false;
				}
				if (typeof optionsOrLogLevel === "number") optionsOrLogLevel = { logLevel: optionsOrLogLevel };
				const oldLogger = getGlobal("diag");
				const newLogger = createLogLevelDiagLogger((_optionsOrLogLevel$lo = optionsOrLogLevel.logLevel) !== null && _optionsOrLogLevel$lo !== void 0 ? _optionsOrLogLevel$lo : 60, logger);
				if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
					var _Error$stack;
					const stack = (_Error$stack = (/* @__PURE__ */ new Error()).stack) !== null && _Error$stack !== void 0 ? _Error$stack : "<failed to generate stacktrace>";
					oldLogger.warn(`Current logger will be overwritten from ${stack}`);
					newLogger.warn(`Current logger will overwrite one already registered from ${stack}`);
				}
				return registerGlobal("diag", newLogger, self, true);
			};
			self.setLogger = setLogger;
			self.disable = () => {
				unregisterGlobal(API_NAME$5, self);
			};
			self.createComponentLogger = (options) => {
				return new DiagComponentLogger(options);
			};
			self.verbose = _logProxy("verbose");
			self.debug = _logProxy("debug");
			self.info = _logProxy("info");
			self.warn = _logProxy("warn");
			self.error = _logProxy("error");
		}
	};

	//#region src/baggage/internal/baggage-impl.ts
	var BaggageImpl = class BaggageImpl {
		constructor(entries) {
			this._entries = entries ? new Map(entries) : /* @__PURE__ */ new Map();
		}
		getEntry(key) {
			const entry = this._entries.get(key);
			if (!entry) return;
			return Object.assign({}, entry);
		}
		getAllEntries() {
			return Array.from(this._entries.entries());
		}
		setEntry(key, entry) {
			const newBaggage = new BaggageImpl(this._entries);
			newBaggage._entries.set(key, entry);
			return newBaggage;
		}
		removeEntry(key) {
			const newBaggage = new BaggageImpl(this._entries);
			newBaggage._entries.delete(key);
			return newBaggage;
		}
		removeEntries(...keys) {
			const newBaggage = new BaggageImpl(this._entries);
			for (const key of keys) newBaggage._entries.delete(key);
			return newBaggage;
		}
		clear() {
			return new BaggageImpl();
		}
	};

	//#region src/baggage/internal/symbol.ts
	/**
	* Symbol used to make BaggageEntryMetadata an opaque type
	*/
	const baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");

	//#region src/baggage/utils.ts
	const diag$1 = DiagAPI.instance();
	/**
	* Create a new Baggage with optional entries
	*
	* @param entries An array of baggage entries the new baggage should contain
	*/
	function createBaggage(entries = {}) {
		return new BaggageImpl(new Map(Object.entries(entries)));
	}
	/**
	* Create a serializable BaggageEntryMetadata object from a string.
	*
	* @param str string metadata. Format is currently not defined by the spec and has no special meaning.
	*
	* @since 1.0.0
	*/
	function baggageEntryMetadataFromString(str) {
		if (typeof str !== "string") {
			diag$1.error(`Cannot create baggage metadata from unknown type: ${typeof str}`);
			str = "";
		}
		return {
			__TYPE__: baggageEntryMetadataSymbol,
			toString() {
				return str;
			}
		};
	}

	//#region src/context/context.ts
	/**
	* Get a key to uniquely identify a context value
	*
	* @since 1.0.0
	*/
	function createContextKey(description) {
		return Symbol.for(description);
	}
	/**
	* The root context is used as the default parent context when there is no active context
	*
	* @since 1.0.0
	*/
	const ROOT_CONTEXT = new class BaseContext {
		/**
		* Construct a new context which inherits values from an optional parent context.
		*
		* @param parentContext a context from which to inherit values
		*/
		constructor(parentContext) {
			const self = this;
			self._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
			self.getValue = (key) => self._currentContext.get(key);
			self.setValue = (key, value) => {
				const context = new BaseContext(self._currentContext);
				context._currentContext.set(key, value);
				return context;
			};
			self.deleteValue = (key) => {
				const context = new BaseContext(self._currentContext);
				context._currentContext.delete(key);
				return context;
			};
		}
	}();

	//#region src/diag/consoleLogger.ts
	const consoleMap = [
		{
			n: "error",
			c: "error"
		},
		{
			n: "warn",
			c: "warn"
		},
		{
			n: "info",
			c: "info"
		},
		{
			n: "debug",
			c: "debug"
		},
		{
			n: "verbose",
			c: "trace"
		}
	];
	const _originalConsoleMethods = {};
	if (typeof console !== "undefined") {
		for (const key of [
			"error",
			"warn",
			"info",
			"debug",
			"trace",
			"log"
		]) if (typeof console[key] === "function") _originalConsoleMethods[key] = console[key];
	}
	/**
	* A simple Immutable Console based diagnostic logger which will output any messages to the Console.
	* If you want to limit the amount of logging to a specific level or lower use the
	* {@link createLogLevelDiagLogger}
	*
	* @since 1.0.0
	*/
	var DiagConsoleLogger = class {
		constructor() {
			function _consoleFunc(funcName) {
				return function(...args) {
					let theFunc = _originalConsoleMethods[funcName];
					if (typeof theFunc !== "function") theFunc = _originalConsoleMethods["log"];
					if (typeof theFunc !== "function" && console) {
						theFunc = console[funcName];
						if (typeof theFunc !== "function") theFunc = console.log;
					}
					if (typeof theFunc === "function") return theFunc.apply(console, args);
				};
			}
			for (let i = 0; i < consoleMap.length; i++) this[consoleMap[i].n] = _consoleFunc(consoleMap[i].c);
		}
	};

	//#region src/metrics/NoopMeter.ts
	/**
	* NoopMeter is a noop implementation of the {@link Meter} interface. It reuses
	* constant NoopMetrics for all of its methods.
	*/
	var NoopMeter = class {
		constructor() {}
		/**
		* @see {@link Meter.createGauge}
		*/
		createGauge(_name, _options) {
			return NOOP_GAUGE_METRIC;
		}
		/**
		* @see {@link Meter.createHistogram}
		*/
		createHistogram(_name, _options) {
			return NOOP_HISTOGRAM_METRIC;
		}
		/**
		* @see {@link Meter.createCounter}
		*/
		createCounter(_name, _options) {
			return NOOP_COUNTER_METRIC;
		}
		/**
		* @see {@link Meter.createUpDownCounter}
		*/
		createUpDownCounter(_name, _options) {
			return NOOP_UP_DOWN_COUNTER_METRIC;
		}
		/**
		* @see {@link Meter.createObservableGauge}
		*/
		createObservableGauge(_name, _options) {
			return NOOP_OBSERVABLE_GAUGE_METRIC;
		}
		/**
		* @see {@link Meter.createObservableCounter}
		*/
		createObservableCounter(_name, _options) {
			return NOOP_OBSERVABLE_COUNTER_METRIC;
		}
		/**
		* @see {@link Meter.createObservableUpDownCounter}
		*/
		createObservableUpDownCounter(_name, _options) {
			return NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
		}
		/**
		* @see {@link Meter.addBatchObservableCallback}
		*/
		addBatchObservableCallback(_callback, _observables) {}
		/**
		* @see {@link Meter.removeBatchObservableCallback}
		*/
		removeBatchObservableCallback(_callback) {}
	};
	var NoopMetric = class {};
	var NoopCounterMetric = class extends NoopMetric {
		add(_value, _attributes) {}
	};
	var NoopUpDownCounterMetric = class extends NoopMetric {
		add(_value, _attributes) {}
	};
	var NoopGaugeMetric = class extends NoopMetric {
		record(_value, _attributes) {}
	};
	var NoopHistogramMetric = class extends NoopMetric {
		record(_value, _attributes) {}
	};
	var NoopObservableMetric = class {
		addCallback(_callback) {}
		removeCallback(_callback) {}
	};
	var NoopObservableCounterMetric = class extends NoopObservableMetric {};
	var NoopObservableGaugeMetric = class extends NoopObservableMetric {};
	var NoopObservableUpDownCounterMetric = class extends NoopObservableMetric {};
	const NOOP_METER = new NoopMeter();
	const NOOP_COUNTER_METRIC = new NoopCounterMetric();
	const NOOP_GAUGE_METRIC = new NoopGaugeMetric();
	const NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
	const NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();
	const NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
	const NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
	const NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();
	/**
	* Create a no-op Meter
	*
	* @since 1.3.0
	*/
	function createNoopMeter() {
		return NOOP_METER;
	}

	//#region src/logs/NoopLogger.ts
	var NoopLogger = class {
		emit(_logRecord) {}
		enabled() {
			return false;
		}
	};
	const NOOP_LOGGER = new NoopLogger();
	/**
	* Create a no-op Logger
	*/
	function createNoopLogger() {
		return NOOP_LOGGER;
	}

	//#region src/propagation/TextMapPropagator.ts
	/**
	* @since 1.0.0
	*/
	const defaultTextMapGetter = {
		get(carrier, key) {
			if (carrier == null) return;
			return carrier[key];
		},
		keys(carrier) {
			if (carrier == null) return [];
			return Object.keys(carrier);
		}
	};
	/**
	* @since 1.0.0
	*/
	const defaultTextMapSetter = { set(carrier, key, value) {
		if (carrier == null) return;
		carrier[key] = value;
	} };

	//#region src/trace/trace_flags.ts
	/**
	* @since 1.0.0
	*/
	let TraceFlags = /* @__PURE__ */ function(TraceFlags) {
		/** Represents no flag set. */
		TraceFlags[TraceFlags["NONE"] = 0] = "NONE";
		/** Bit to represent whether trace is sampled in trace flags. */
		TraceFlags[TraceFlags["SAMPLED"] = 1] = "SAMPLED";
		return TraceFlags;
	}({});

	//#region src/trace/invalid-span-constants.ts
	/**
	* @since 1.0.0
	*/
	const INVALID_SPANID = "0000000000000000";
	/**
	* @since 1.0.0
	*/
	const INVALID_TRACEID = "00000000000000000000000000000000";
	/**
	* @since 1.0.0
	*/
	const INVALID_SPAN_CONTEXT = {
		traceId: INVALID_TRACEID,
		spanId: INVALID_SPANID,
		traceFlags: 0
	};

	//#region src/trace/NonRecordingSpan.ts
	/**
	* The NonRecordingSpan is the default {@link Span} that is used when no Span
	* implementation is available. All operations are no-op including context
	* propagation.
	*/
	var NonRecordingSpan = class {
		constructor(spanContext = INVALID_SPAN_CONTEXT) {
			this._spanContext = spanContext;
		}
		spanContext() {
			return this._spanContext;
		}
		setAttribute(_key, _value) {
			return this;
		}
		setAttributes(_attributes) {
			return this;
		}
		addEvent(_name, _attributes) {
			return this;
		}
		addLink(_link) {
			return this;
		}
		addLinks(_links) {
			return this;
		}
		setStatus(_status) {
			return this;
		}
		updateName(_name) {
			return this;
		}
		end(_endTime) {}
		isRecording() {
			return false;
		}
		recordException(_exception, _time) {}
	};

	//#region src/trace/spancontext-utils.ts
	const isHex = new Uint8Array([
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1
	]);
	function isValidHex(id, length) {
		if (typeof id !== "string" || id.length !== length) return false;
		let r = 0;
		for (let i = 0; i < id.length; i += 4) r += (isHex[id.charCodeAt(i)] | 0) + (isHex[id.charCodeAt(i + 1)] | 0) + (isHex[id.charCodeAt(i + 2)] | 0) + (isHex[id.charCodeAt(i + 3)] | 0);
		return r === length;
	}
	/**
	* @since 1.0.0
	*/
	function isValidTraceId(traceId) {
		return isValidHex(traceId, 32) && traceId !== "00000000000000000000000000000000";
	}
	/**
	* @since 1.0.0
	*/
	function isValidSpanId(spanId) {
		return isValidHex(spanId, 16) && spanId !== "0000000000000000";
	}
	/**
	* Returns true if this {@link SpanContext} is valid.
	* @return true if this {@link SpanContext} is valid.
	*
	* @since 1.0.0
	*/
	function isSpanContextValid(spanContext) {
		return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
	}
	/**
	* Wrap the given {@link SpanContext} in a new non-recording {@link Span}
	*
	* @param spanContext span context to be wrapped
	* @returns a new non-recording {@link Span} with the provided context
	*/
	function wrapSpanContext(spanContext) {
		return new NonRecordingSpan(spanContext);
	}

	//#region src/context/NoopContextManager.ts
	var NoopContextManager = class {
		active() {
			return ROOT_CONTEXT;
		}
		with(_context, fn, thisArg, ...args) {
			return fn.call(thisArg, ...args);
		}
		bind(_context, target) {
			return target;
		}
		enable() {
			return this;
		}
		disable() {
			return this;
		}
		/** @experimental This API is experimental and may change in minor releases without prior notice. */
		attach(_context) {
			return { dispose() {} };
		}
	};

	//#region src/api/context.ts
	const API_NAME$4 = "context";
	const NOOP_CONTEXT_MANAGER = new NoopContextManager();
	const NOOP_TOKEN = Object.freeze({ dispose: () => {} });
	/**
	* Singleton object which represents the entry point to the OpenTelemetry Context API
	*
	* @since 1.0.0
	*/
	var ContextAPI = class ContextAPI {
		/** Empty private constructor prevents end users from constructing a new instance of the API */
		constructor() {
			this._attachUnsupportedWarned = false;
		}
		/** Get the singleton instance of the Context API */
		static getInstance() {
			if (!this._instance) this._instance = new ContextAPI();
			return this._instance;
		}
		/**
		* Set the current context manager.
		*
		* @returns true if the context manager was successfully registered, else false
		*/
		setGlobalContextManager(contextManager) {
			return registerGlobal(API_NAME$4, contextManager, DiagAPI.instance());
		}
		/**
		* Get the currently active context
		*/
		active() {
			return this._getContextManager().active();
		}
		/**
		* Execute a function with an active context
		*
		* @param context context to be active during function execution
		* @param fn function to execute in a context
		* @param thisArg optional receiver to be used for calling fn
		* @param args optional arguments forwarded to fn
		*/
		with(context, fn, thisArg, ...args) {
			return this._getContextManager().with(context, fn, thisArg, ...args);
		}
		/**
		* Bind a context to a target function or event emitter
		*
		* @param context context to bind to the event emitter or function. Defaults to the currently active context
		* @param target function or event emitter to bind
		*/
		bind(context, target) {
			return this._getContextManager().bind(context, target);
		}
		/**
		* Imperatively sets `context` as active, returning a {@link ContextManagementToken} whose
		* {@link ContextManagementToken.dispose} restores the previous context.
		*
		* This is a delicate, low-level API - prefer {@link with}/{@link bind}, which
		* restore context automatically. Use `attach` only to bridge callback
		* boundaries that `with` cannot wrap. Call `token.dispose()` when the
		* operation is done.
		*
		* **Caveat for async functions:** If called inside an async function before
		* the first `await`, the context change may leak into the caller's context
		* and remain active there. Prefer {@link with} for async code.
		*
		* Support is best-effort and varies by the active ContextManager (see
		* {@link ContextManager.attach}); if it does not implement `attach`, this logs
		* a warning and returns a no-op token.
		*
		* @param context The Context to attach
		* @returns A {@link ContextManagementToken} whose dispose() restores the previous Context
		* @since 1.10.0
		* @experimental This API is experimental and may change in minor releases without prior notice.
		*/
		attach(context) {
			const contextManager = this._getContextManager();
			if (contextManager.attach) return contextManager.attach(context);
			if (!this._attachUnsupportedWarned) {
				this._attachUnsupportedWarned = true;
				DiagAPI.instance().warn("The current ContextManager does not implement attach(). The context will not be attached. Use a ContextManager that supports attach() (e.g. AsyncLocalStorageContextManager) or use with()/bind() instead.");
			}
			return NOOP_TOKEN;
		}
		_getContextManager() {
			return getGlobal(API_NAME$4) || NOOP_CONTEXT_MANAGER;
		}
		/** Disable and remove the global context manager */
		disable() {
			this._getContextManager().disable();
			unregisterGlobal(API_NAME$4, DiagAPI.instance());
		}
	};

	//#region src/trace/context-utils.ts
	/**
	* span key
	*/
	const SPAN_KEY = createContextKey("OpenTelemetry Context Key SPAN");
	/**
	* Return the span if one exists
	*
	* @param context context to get span from
	*/
	function getSpan(context) {
		return context.getValue(SPAN_KEY) || void 0;
	}
	/**
	* Gets the span from the current context, if one exists.
	*/
	function getActiveSpan() {
		return getSpan(ContextAPI.getInstance().active());
	}
	/**
	* Set the span on a context
	*
	* @param context context to use as parent
	* @param span span to set active
	*/
	function setSpan(context, span) {
		return context.setValue(SPAN_KEY, span);
	}
	/**
	* Remove current span stored in the context
	*
	* @param context context to delete span from
	*/
	function deleteSpan(context) {
		return context.deleteValue(SPAN_KEY);
	}
	/**
	* Wrap span context in a NoopSpan and set as span in a new
	* context
	*
	* @param context context to set active span on
	* @param spanContext span context to be wrapped
	*/
	function setSpanContext(context, spanContext) {
		return setSpan(context, new NonRecordingSpan(spanContext));
	}
	/**
	* Get the span context of the span if it exists.
	*
	* @param context context to get values from
	*/
	function getSpanContext(context) {
		var _getSpan;
		return (_getSpan = getSpan(context)) === null || _getSpan === void 0 ? void 0 : _getSpan.spanContext();
	}

	//#region src/trace/NoopTracer.ts
	const contextApi = ContextAPI.getInstance();
	/**
	* No-op implementations of {@link Tracer}.
	*/
	var NoopTracer = class {
		startSpan(name, options, context = contextApi.active()) {
			if (Boolean(options === null || options === void 0 ? void 0 : options.root)) return new NonRecordingSpan();
			const parentFromContext = context && getSpanContext(context);
			if (isSpanContext(parentFromContext) && isSpanContextValid(parentFromContext)) return new NonRecordingSpan(parentFromContext);
			else return new NonRecordingSpan();
		}
		startActiveSpan(name, arg2, arg3, arg4) {
			var _ctx;
			let opts;
			let ctx;
			let fn;
			if (arguments.length < 2) return;
			else if (arguments.length === 2) fn = arg2;
			else if (arguments.length === 3) {
				opts = arg2;
				fn = arg3;
			} else {
				opts = arg2;
				ctx = arg3;
				fn = arg4;
			}
			const parentContext = (_ctx = ctx) !== null && _ctx !== void 0 ? _ctx : contextApi.active();
			const span = this.startSpan(name, opts, parentContext);
			const contextWithSpanSet = setSpan(parentContext, span);
			return contextApi.with(contextWithSpanSet, fn, void 0, span);
		}
	};
	function isSpanContext(spanContext) {
		return spanContext !== null && typeof spanContext === "object" && "spanId" in spanContext && typeof spanContext["spanId"] === "string" && "traceId" in spanContext && typeof spanContext["traceId"] === "string" && "traceFlags" in spanContext && typeof spanContext["traceFlags"] === "number";
	}

	//#region src/trace/ProxyTracer.ts
	const NOOP_TRACER = new NoopTracer();
	/**
	* Proxy tracer provided by the proxy tracer provider
	*
	* @since 1.0.0
	*/
	var ProxyTracer = class {
		constructor(provider, name, version, options) {
			this._provider = provider;
			this.name = name;
			this.version = version;
			this.options = options;
		}
		startSpan(name, options, context) {
			return this._getTracer().startSpan(name, options, context);
		}
		startActiveSpan(_name, _options, _context, _fn) {
			const tracer = this._getTracer();
			return Reflect.apply(tracer.startActiveSpan, tracer, arguments);
		}
		/**
		* Try to get a tracer from the proxy tracer provider.
		* If the proxy tracer provider has no delegate, return a noop tracer.
		*/
		_getTracer() {
			if (this._delegate) return this._delegate;
			const tracer = this._provider.getDelegateTracer(this.name, this.version, this.options);
			if (!tracer) return NOOP_TRACER;
			this._delegate = tracer;
			return this._delegate;
		}
	};

	//#region src/trace/span_kind.ts
	/**
	* @since 1.0.0
	*/
	let SpanKind = /* @__PURE__ */ function(SpanKind) {
		/** Default value. Indicates that the span is used internally. */
		SpanKind[SpanKind["INTERNAL"] = 0] = "INTERNAL";
		/**
		* Indicates that the span covers server-side handling of an RPC or other
		* remote request.
		*/
		SpanKind[SpanKind["SERVER"] = 1] = "SERVER";
		/**
		* Indicates that the span covers the client-side wrapper around an RPC or
		* other remote request.
		*/
		SpanKind[SpanKind["CLIENT"] = 2] = "CLIENT";
		/**
		* Indicates that the span describes producer sending a message to a
		* broker. Unlike client and server, there is no direct critical path latency
		* relationship between producer and consumer spans.
		*/
		SpanKind[SpanKind["PRODUCER"] = 3] = "PRODUCER";
		/**
		* Indicates that the span describes consumer receiving a message from a
		* broker. Unlike client and server, there is no direct critical path latency
		* relationship between producer and consumer spans.
		*/
		SpanKind[SpanKind["CONSUMER"] = 4] = "CONSUMER";
		return SpanKind;
	}({});

	//#region src/trace/status.ts
	/**
	* An enumeration of status codes.
	*
	* @since 1.0.0
	*/
	let SpanStatusCode = /* @__PURE__ */ function(SpanStatusCode) {
		/**
		* The default status.
		*/
		SpanStatusCode[SpanStatusCode["UNSET"] = 0] = "UNSET";
		/**
		* The operation has been validated by an Application developer or
		* Operator to have completed successfully.
		*/
		SpanStatusCode[SpanStatusCode["OK"] = 1] = "OK";
		/**
		* The operation contains an error.
		*/
		SpanStatusCode[SpanStatusCode["ERROR"] = 2] = "ERROR";
		return SpanStatusCode;
	}({});

	//#region src/trace/NoopTracerProvider.ts
	/**
	* An implementation of the {@link TracerProvider} which returns an impotent
	* Tracer for all calls to `getTracer`.
	*
	* All operations are no-op.
	*/
	var NoopTracerProvider = class {
		getTracer(_name, _version, _options) {
			return new NoopTracer();
		}
	};

	//#region src/trace/ProxyTracerProvider.ts
	const NOOP_TRACER_PROVIDER = new NoopTracerProvider();
	/**
	* Tracer provider which provides {@link ProxyTracer}s.
	*
	* Before a delegate is set, tracers provided are NoOp.
	*   When a delegate is set, traces are provided from the delegate.
	*   When a delegate is set after tracers have already been provided,
	*   all tracers already provided will use the provided delegate implementation.
	*
	* @deprecated This will be removed in the next major version.
	* @since 1.0.0
	*/
	var ProxyTracerProvider = class {
		/**
		* Get a {@link ProxyTracer}
		*/
		getTracer(name, version, options) {
			var _this$getDelegateTrac;
			return (_this$getDelegateTrac = this.getDelegateTracer(name, version, options)) !== null && _this$getDelegateTrac !== void 0 ? _this$getDelegateTrac : new ProxyTracer(this, name, version, options);
		}
		getDelegate() {
			var _this$_delegate;
			return (_this$_delegate = this._delegate) !== null && _this$_delegate !== void 0 ? _this$_delegate : NOOP_TRACER_PROVIDER;
		}
		/**
		* Set the delegate tracer provider
		*/
		setDelegate(delegate) {
			this._delegate = delegate;
		}
		getDelegateTracer(name, version, options) {
			var _this$_delegate2;
			return (_this$_delegate2 = this._delegate) === null || _this$_delegate2 === void 0 ? void 0 : _this$_delegate2.getTracer(name, version, options);
		}
	};

	//#region src/trace/SamplingResult.ts
	/**
	* @deprecated use the one declared in @opentelemetry/sdk-trace instead.
	* A sampling decision that determines how a {@link Span} will be recorded
	* and collected.
	*
	* @since 1.0.0
	*/
	let SamplingDecision = /* @__PURE__ */ function(SamplingDecision) {
		/**
		* `Span.isRecording() === false`, span will not be recorded and all events
		* and attributes will be dropped.
		*/
		SamplingDecision[SamplingDecision["NOT_RECORD"] = 0] = "NOT_RECORD";
		/**
		* `Span.isRecording() === true`, but `Sampled` flag in {@link TraceFlags}
		* MUST NOT be set.
		*/
		SamplingDecision[SamplingDecision["RECORD"] = 1] = "RECORD";
		/**
		* `Span.isRecording() === true` AND `Sampled` flag in {@link TraceFlags}
		* MUST be set.
		*/
		SamplingDecision[SamplingDecision["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
		return SamplingDecision;
	}({});

	//#region src/context-api.ts
	/**
	* Entrypoint for context API
	* @since 1.0.0
	*/
	const context = ContextAPI.getInstance();

	//#region src/diag-api.ts
	/**
	* Entrypoint for Diag API.
	* Defines Diagnostic handler used for internal diagnostic logging operations.
	* The default provides a Noop DiagLogger implementation which may be changed via the
	* diag.setLogger(logger: DiagLogger) function.
	*
	* @since 1.0.0
	*/
	const diag = DiagAPI.instance();

	//#region src/logs/NoopLoggerProvider.ts
	var NoopLoggerProvider = class {
		getLogger(_name, _version, _options) {
			return new NoopLogger();
		}
	};
	const NOOP_LOGGER_PROVIDER = new NoopLoggerProvider();

	//#region src/logs/ProxyLogger.ts
	var ProxyLogger = class {
		constructor(provider, name, version, options) {
			this._provider = provider;
			this.name = name;
			this.version = version;
			this.options = options;
		}
		/**
		* Emit a log record. This method should only be used by log appenders.
		*
		* @param logRecord
		*/
		emit(logRecord) {
			this._getLogger().emit(logRecord);
		}
		enabled(options) {
			return this._getLogger().enabled(options);
		}
		/**
		* Try to get a logger from the proxy logger provider.
		* If the proxy logger provider has no delegate, return a noop logger.
		*/
		_getLogger() {
			if (this._delegate) return this._delegate;
			const logger = this._provider._getDelegateLogger(this.name, this.version, this.options);
			if (!logger) return NOOP_LOGGER;
			this._delegate = logger;
			return this._delegate;
		}
	};

	//#region src/logs/ProxyLoggerProvider.ts
	var ProxyLoggerProvider = class {
		getLogger(name, version, options) {
			var _this$_getDelegateLog;
			return (_this$_getDelegateLog = this._getDelegateLogger(name, version, options)) !== null && _this$_getDelegateLog !== void 0 ? _this$_getDelegateLog : new ProxyLogger(this, name, version, options);
		}
		/**
		* Get the delegate logger provider.
		* Used by tests only.
		* @internal
		*/
		_getDelegate() {
			var _this$_delegate;
			return (_this$_delegate = this._delegate) !== null && _this$_delegate !== void 0 ? _this$_delegate : NOOP_LOGGER_PROVIDER;
		}
		/**
		* Set the delegate logger provider
		* @internal
		*/
		_setDelegate(delegate) {
			this._delegate = delegate;
		}
		/**
		* @internal
		*/
		_getDelegateLogger(name, version, options) {
			var _this$_delegate2;
			return (_this$_delegate2 = this._delegate) === null || _this$_delegate2 === void 0 ? void 0 : _this$_delegate2.getLogger(name, version, options);
		}
	};

	//#region src/api/logs.ts
	const API_NAME$3 = "logs";
	/**
	* Singleton object which represents the entry point to the OpenTelemetry Logs API
	*
	* @since 1.10.0
	*/
	var LogsAPI = class LogsAPI {
		/** Empty private constructor prevents end users from constructing a new instance of the API */
		constructor() {
			this._proxyLoggerProvider = new ProxyLoggerProvider();
		}
		/** Get the singleton instance of the Logs API */
		static getInstance() {
			if (!this._instance) this._instance = new LogsAPI();
			return this._instance;
		}
		setGlobalLoggerProvider(provider) {
			const success = registerGlobal(API_NAME$3, provider, DiagAPI.instance());
			if (success) this._proxyLoggerProvider._setDelegate(provider);
			return success;
		}
		/**
		* Returns the global logger provider.
		*
		* @returns LoggerProvider
		*/
		getLoggerProvider() {
			return getGlobal(API_NAME$3) || this._proxyLoggerProvider;
		}
		/**
		* Returns a Logger, creating one if one with the given name, version,
		* schemaUrl, and attributes is not already created.
		*
		* Getting a Logger may be expensive, especially when `attributes` are
		* provided. Reuse Logger instances where possible instead of calling
		* `getLogger()` on hot paths.
		*
		* @param name The name of the logger or instrumentation library.
		* @param version The version of the logger or instrumentation library.
		* @param options The options of the logger or instrumentation library.
		* @returns {@link Logger}
		*/
		getLogger(name, version, options) {
			return this.getLoggerProvider().getLogger(name, version, options);
		}
		/** Remove the global logger provider */
		disable() {
			unregisterGlobal(API_NAME$3, DiagAPI.instance());
			this._proxyLoggerProvider = new ProxyLoggerProvider();
		}
	};

	//#region src/logs-api.ts
	/**
	* Entrypoint for logs API
	*
	* @since 1.10.0
	*/
	const logs = LogsAPI.getInstance();

	//#region src/metrics/NoopMeterProvider.ts
	/**
	* An implementation of the {@link MeterProvider} which returns an impotent Meter
	* for all calls to `getMeter`
	*/
	var NoopMeterProvider = class {
		getMeter(_name, _version, _options) {
			return NOOP_METER;
		}
	};
	const NOOP_METER_PROVIDER = new NoopMeterProvider();

	//#region src/api/metrics.ts
	const API_NAME$2 = "metrics";
	/**
	* Singleton object which represents the entry point to the OpenTelemetry Metrics API
	*
	* @since 1.4.1
	*/
	var MetricsAPI = class MetricsAPI {
		/** Empty private constructor prevents end users from constructing a new instance of the API */
		constructor() {}
		/** Get the singleton instance of the Metrics API */
		static getInstance() {
			if (!this._instance) this._instance = new MetricsAPI();
			return this._instance;
		}
		/**
		* Set the current global meter provider.
		* Returns true if the meter provider was successfully registered, else false.
		*/
		setGlobalMeterProvider(provider) {
			return registerGlobal(API_NAME$2, provider, DiagAPI.instance());
		}
		/**
		* Returns the global meter provider.
		*/
		getMeterProvider() {
			return getGlobal(API_NAME$2) || NOOP_METER_PROVIDER;
		}
		/**
		* Returns a meter from the global meter provider.
		*/
		getMeter(name, version, options) {
			return this.getMeterProvider().getMeter(name, version, options);
		}
		/** Remove the global meter provider */
		disable() {
			unregisterGlobal(API_NAME$2, DiagAPI.instance());
		}
	};

	//#region src/metrics-api.ts
	/**
	* Entrypoint for metrics API
	*
	* @since 1.3.0
	*/
	const metrics = MetricsAPI.getInstance();

	//#region src/propagation/NoopTextMapPropagator.ts
	/**
	* No-op implementations of {@link TextMapPropagator}.
	*/
	var NoopTextMapPropagator = class {
		/** Noop inject function does nothing */
		inject(_context, _carrier) {}
		/** Noop extract function does nothing and returns the input context */
		extract(context, _carrier) {
			return context;
		}
		fields() {
			return [];
		}
	};

	//#region src/baggage/context-helpers.ts
	/**
	* Baggage key
	*/
	const BAGGAGE_KEY = createContextKey("OpenTelemetry Baggage Key");
	/**
	* Retrieve the current baggage from the given context
	*
	* @param {Context} Context that manage all context values
	* @returns {Baggage} Extracted baggage from the context
	*/
	function getBaggage(context) {
		return context.getValue(BAGGAGE_KEY) || void 0;
	}
	/**
	* Retrieve the current baggage from the active/current context
	*
	* @returns {Baggage} Extracted baggage from the context
	*/
	function getActiveBaggage() {
		return getBaggage(ContextAPI.getInstance().active());
	}
	/**
	* Store a baggage in the given context
	*
	* @param {Context} Context that manage all context values
	* @param {Baggage} baggage that will be set in the actual context
	*/
	function setBaggage(context, baggage) {
		return context.setValue(BAGGAGE_KEY, baggage);
	}
	/**
	* Delete the baggage stored in the given context
	*
	* @param {Context} Context that manage all context values
	*/
	function deleteBaggage(context) {
		return context.deleteValue(BAGGAGE_KEY);
	}

	//#region src/api/propagation.ts
	const API_NAME$1 = "propagation";
	const NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator();
	/**
	* Singleton object which represents the entry point to the OpenTelemetry Propagation API
	*
	* @since 1.0.0
	*/
	var PropagationAPI = class PropagationAPI {
		/** Empty private constructor prevents end users from constructing a new instance of the API */
		constructor() {
			this.createBaggage = createBaggage;
			this.getBaggage = getBaggage;
			this.getActiveBaggage = getActiveBaggage;
			this.setBaggage = setBaggage;
			this.deleteBaggage = deleteBaggage;
		}
		/** Get the singleton instance of the Propagator API */
		static getInstance() {
			if (!this._instance) this._instance = new PropagationAPI();
			return this._instance;
		}
		/**
		* Set the current propagator.
		*
		* @returns true if the propagator was successfully registered, else false
		*/
		setGlobalPropagator(propagator) {
			return registerGlobal(API_NAME$1, propagator, DiagAPI.instance());
		}
		/**
		* Inject context into a carrier to be propagated inter-process
		*
		* @param context Context carrying tracing data to inject
		* @param carrier carrier to inject context into
		* @param setter Function used to set values on the carrier
		*/
		inject(context, carrier, setter = defaultTextMapSetter) {
			return this._getGlobalPropagator().inject(context, carrier, setter);
		}
		/**
		* Extract context from a carrier
		*
		* @param context Context which the newly created context will inherit from
		* @param carrier Carrier to extract context from
		* @param getter Function used to extract keys from a carrier
		*/
		extract(context, carrier, getter = defaultTextMapGetter) {
			return this._getGlobalPropagator().extract(context, carrier, getter);
		}
		/**
		* Return a list of all fields which may be used by the propagator.
		*/
		fields() {
			return this._getGlobalPropagator().fields();
		}
		/** Remove the global propagator */
		disable() {
			unregisterGlobal(API_NAME$1, DiagAPI.instance());
		}
		_getGlobalPropagator() {
			return getGlobal(API_NAME$1) || NOOP_TEXT_MAP_PROPAGATOR;
		}
	};

	//#region src/propagation-api.ts
	/**
	* Entrypoint for propagation API
	*
	* @since 1.0.0
	*/
	const propagation = PropagationAPI.getInstance();

	//#region src/api/trace.ts
	const API_NAME = "trace";
	/**
	* Singleton object which represents the entry point to the OpenTelemetry Tracing API
	*
	* @since 1.0.0
	*/
	var TraceAPI = class TraceAPI {
		/** Empty private constructor prevents end users from constructing a new instance of the API */
		constructor() {
			this._proxyTracerProvider = new ProxyTracerProvider();
			this.wrapSpanContext = wrapSpanContext;
			this.isSpanContextValid = isSpanContextValid;
			this.deleteSpan = deleteSpan;
			this.getSpan = getSpan;
			this.getActiveSpan = getActiveSpan;
			this.getSpanContext = getSpanContext;
			this.setSpan = setSpan;
			this.setSpanContext = setSpanContext;
		}
		/** Get the singleton instance of the Trace API */
		static getInstance() {
			if (!this._instance) this._instance = new TraceAPI();
			return this._instance;
		}
		/**
		* Set the current global tracer.
		*
		* @returns true if the tracer provider was successfully registered, else false
		*/
		setGlobalTracerProvider(provider) {
			const success = registerGlobal(API_NAME, this._proxyTracerProvider, DiagAPI.instance());
			if (success) this._proxyTracerProvider.setDelegate(provider);
			return success;
		}
		/**
		* Returns the global tracer provider.
		*/
		getTracerProvider() {
			return getGlobal(API_NAME) || this._proxyTracerProvider;
		}
		/**
		* Returns a tracer from the global tracer provider.
		*/
		getTracer(name, version) {
			return this.getTracerProvider().getTracer(name, version);
		}
		/** Remove the global tracer provider */
		disable() {
			unregisterGlobal(API_NAME, DiagAPI.instance());
			this._proxyTracerProvider = new ProxyTracerProvider();
		}
	};

	//#region src/trace-api.ts
	/**
	* Entrypoint for trace API
	*
	* @since 1.0.0
	*/
	const trace = TraceAPI.getInstance();

	exports.DiagConsoleLogger = DiagConsoleLogger;
	exports.DiagLogLevel = DiagLogLevel;
	exports.INVALID_SPANID = INVALID_SPANID;
	exports.INVALID_SPAN_CONTEXT = INVALID_SPAN_CONTEXT;
	exports.INVALID_TRACEID = INVALID_TRACEID;
	exports.ProxyTracer = ProxyTracer;
	exports.ProxyTracerProvider = ProxyTracerProvider;
	exports.ROOT_CONTEXT = ROOT_CONTEXT;
	exports.SamplingDecision = SamplingDecision;
	exports.SpanKind = SpanKind;
	exports.SpanStatusCode = SpanStatusCode;
	exports.TraceFlags = TraceFlags;
	exports.baggageEntryMetadataFromString = baggageEntryMetadataFromString;
	exports.context = context;
	exports.createContextKey = createContextKey;
	exports.createNoopLogger = createNoopLogger;
	exports.createNoopMeter = createNoopMeter;
	exports.defaultTextMapGetter = defaultTextMapGetter;
	exports.defaultTextMapSetter = defaultTextMapSetter;
	exports.diag = diag;
	exports.isSpanContextValid = isSpanContextValid;
	exports.isValidSpanId = isValidSpanId;
	exports.isValidTraceId = isValidTraceId;
	exports.logs = logs;
	exports.metrics = metrics;
	exports.propagation = propagation;
	exports.trace = trace;

}));
