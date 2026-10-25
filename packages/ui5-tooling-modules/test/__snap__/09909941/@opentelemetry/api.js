sap.ui.define(['../trace-api'], (function (traceApi) { 'use strict';

	//#region src/metrics/Metric.ts
	/**
	* The Type of value. It describes how the data is reported.
	*
	* @since 1.3.0
	*/
	let ValueType = /* @__PURE__ */ function(ValueType) {
		ValueType[ValueType["INT"] = 0] = "INT";
		ValueType[ValueType["DOUBLE"] = 1] = "DOUBLE";
		return ValueType;
	}({});

	//#region src/logs/LogRecord.ts
	let SeverityNumber = /* @__PURE__ */ function(SeverityNumber) {
		SeverityNumber[SeverityNumber["UNSPECIFIED"] = 0] = "UNSPECIFIED";
		SeverityNumber[SeverityNumber["TRACE"] = 1] = "TRACE";
		SeverityNumber[SeverityNumber["TRACE2"] = 2] = "TRACE2";
		SeverityNumber[SeverityNumber["TRACE3"] = 3] = "TRACE3";
		SeverityNumber[SeverityNumber["TRACE4"] = 4] = "TRACE4";
		SeverityNumber[SeverityNumber["DEBUG"] = 5] = "DEBUG";
		SeverityNumber[SeverityNumber["DEBUG2"] = 6] = "DEBUG2";
		SeverityNumber[SeverityNumber["DEBUG3"] = 7] = "DEBUG3";
		SeverityNumber[SeverityNumber["DEBUG4"] = 8] = "DEBUG4";
		SeverityNumber[SeverityNumber["INFO"] = 9] = "INFO";
		SeverityNumber[SeverityNumber["INFO2"] = 10] = "INFO2";
		SeverityNumber[SeverityNumber["INFO3"] = 11] = "INFO3";
		SeverityNumber[SeverityNumber["INFO4"] = 12] = "INFO4";
		SeverityNumber[SeverityNumber["WARN"] = 13] = "WARN";
		SeverityNumber[SeverityNumber["WARN2"] = 14] = "WARN2";
		SeverityNumber[SeverityNumber["WARN3"] = 15] = "WARN3";
		SeverityNumber[SeverityNumber["WARN4"] = 16] = "WARN4";
		SeverityNumber[SeverityNumber["ERROR"] = 17] = "ERROR";
		SeverityNumber[SeverityNumber["ERROR2"] = 18] = "ERROR2";
		SeverityNumber[SeverityNumber["ERROR3"] = 19] = "ERROR3";
		SeverityNumber[SeverityNumber["ERROR4"] = 20] = "ERROR4";
		SeverityNumber[SeverityNumber["FATAL"] = 21] = "FATAL";
		SeverityNumber[SeverityNumber["FATAL2"] = 22] = "FATAL2";
		SeverityNumber[SeverityNumber["FATAL3"] = 23] = "FATAL3";
		SeverityNumber[SeverityNumber["FATAL4"] = 24] = "FATAL4";
		return SeverityNumber;
	}({});

	//#region src/trace/internal/tracestate-validators.ts
	const VALID_KEY_CHAR_RANGE = "[_0-9a-z-*/]";
	const VALID_KEY_REGEX = new RegExp(`^(?:${`[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`}|${`[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`})$`);
	const VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
	const INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
	/**
	* Key is opaque string up to 256 characters printable. It MUST begin with a
	* lowercase letter, and can only contain lowercase letters a-z, digits 0-9,
	* underscores _, dashes -, asterisks *, and forward slashes /.
	* For multi-tenant vendor scenarios, an at sign (@) can be used to prefix the
	* vendor name. Vendors SHOULD set the tenant ID at the beginning of the key.
	* see https://www.w3.org/TR/trace-context/#key
	*/
	function validateKey(key) {
		return VALID_KEY_REGEX.test(key);
	}
	/**
	* Value is opaque string up to 256 characters printable ASCII RFC0020
	* characters (i.e., the range 0x20 to 0x7E) except comma , and =.
	*/
	function validateValue(value) {
		return VALID_VALUE_BASE_REGEX.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value);
	}

	//#region src/trace/internal/tracestate-impl.ts
	const MAX_TRACE_STATE_ITEMS = 32;
	const MAX_TRACE_STATE_LEN = 512;
	const LIST_MEMBERS_SEPARATOR = ",";
	const LIST_MEMBER_KEY_VALUE_SPLITTER = "=";
	/**
	* TraceState must be a class and not a simple object type because of the spec
	* requirement (https://www.w3.org/TR/trace-context/#tracestate-field).
	*
	* Here is the list of allowed mutations:
	* - New key-value pair should be added into the beginning of the list
	* - The value of any key can be updated. Modified keys MUST be moved to the
	* beginning of the list.
	*
	* @deprecated Use TraceState from "@opentelemetry/core". This will be removed in the next major version.
	*/
	var TraceStateImpl = class TraceStateImpl {
		constructor(rawTraceState) {
			this._internalState = /* @__PURE__ */ new Map();
			if (rawTraceState) this._parse(rawTraceState);
		}
		set(key, value) {
			const currValue = this._internalState.get(key);
			let newLength = this.serialize().length;
			if (typeof currValue === "string") newLength += value.length - currValue.length;
			else {
				if (this._internalState.size >= MAX_TRACE_STATE_ITEMS) return this;
				newLength += key.length + value.length + (this._internalState.size > 0 ? 2 : 1);
			}
			if (newLength > MAX_TRACE_STATE_LEN) return this;
			const traceState = this._clone();
			if (traceState._internalState.has(key)) traceState._internalState.delete(key);
			traceState._internalState.set(key, value);
			return traceState;
		}
		unset(key) {
			const traceState = this._clone();
			traceState._internalState.delete(key);
			return traceState;
		}
		get(key) {
			return this._internalState.get(key);
		}
		serialize() {
			return Array.from(this._internalState.keys()).reduceRight((agg, key) => {
				agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
				return agg;
			}, []).join(LIST_MEMBERS_SEPARATOR);
		}
		_parse(rawTraceState) {
			if (rawTraceState.length > MAX_TRACE_STATE_LEN) return;
			this._internalState = rawTraceState.split(LIST_MEMBERS_SEPARATOR).reduceRight((agg, part) => {
				const listMember = part.trim();
				const i = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
				if (i !== -1) {
					const key = listMember.slice(0, i);
					const value = listMember.slice(i + 1, part.length);
					if (validateKey(key) && validateValue(value)) agg.set(key, value);
				}
				return agg;
			}, /* @__PURE__ */ new Map());
			if (this._internalState.size > MAX_TRACE_STATE_ITEMS) this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, MAX_TRACE_STATE_ITEMS));
		}
		_keys() {
			return Array.from(this._internalState.keys()).reverse();
		}
		_clone() {
			const traceState = new TraceStateImpl();
			traceState._internalState = new Map(this._internalState);
			return traceState;
		}
	};

	//#region src/trace/internal/utils.ts
	/**
	* @deprecated Use TraceState from "@opentelemetry/core". This will be removed in the next major version.
	* @since 1.1.0
	*/
	function createTraceState(rawTraceState) {
		return new TraceStateImpl(rawTraceState);
	}

	//#region src/index.ts
	var src_default = {
		context: traceApi.context,
		diag: traceApi.diag,
		logs: traceApi.logs,
		metrics: traceApi.metrics,
		propagation: traceApi.propagation,
		trace: traceApi.trace
	};

	var namedExports = /*#__PURE__*/Object.freeze({
		__proto__: null,
		DiagConsoleLogger: traceApi.DiagConsoleLogger,
		DiagLogLevel: traceApi.DiagLogLevel,
		INVALID_SPANID: traceApi.INVALID_SPANID,
		INVALID_SPAN_CONTEXT: traceApi.INVALID_SPAN_CONTEXT,
		INVALID_TRACEID: traceApi.INVALID_TRACEID,
		ProxyTracer: traceApi.ProxyTracer,
		ProxyTracerProvider: traceApi.ProxyTracerProvider,
		ROOT_CONTEXT: traceApi.ROOT_CONTEXT,
		SamplingDecision: traceApi.SamplingDecision,
		SeverityNumber: SeverityNumber,
		SpanKind: traceApi.SpanKind,
		SpanStatusCode: traceApi.SpanStatusCode,
		TraceFlags: traceApi.TraceFlags,
		ValueType: ValueType,
		baggageEntryMetadataFromString: traceApi.baggageEntryMetadataFromString,
		context: traceApi.context,
		createContextKey: traceApi.createContextKey,
		createNoopLogger: traceApi.createNoopLogger,
		createNoopMeter: traceApi.createNoopMeter,
		createTraceState: createTraceState,
		default: src_default,
		defaultTextMapGetter: traceApi.defaultTextMapGetter,
		defaultTextMapSetter: traceApi.defaultTextMapSetter,
		diag: traceApi.diag,
		isSpanContextValid: traceApi.isSpanContextValid,
		isValidSpanId: traceApi.isValidSpanId,
		isValidTraceId: traceApi.isValidTraceId,
		logs: traceApi.logs,
		metrics: traceApi.metrics,
		propagation: traceApi.propagation,
		trace: traceApi.trace
	});

	const defaultExports = Object.isFrozen(src_default) ? Object.assign({}, src_default?.default || src_default || { __emptyModule: true }) : src_default;
	Object.keys(namedExports || {}).filter((key) => !defaultExports[key]).forEach((key) => defaultExports[key] = namedExports[key]);
	Object.defineProperty(defaultExports, "__" + "esModule", { value: true });
	var index = Object.isFrozen(src_default) ? Object.freeze(defaultExports) : defaultExports;

	return index;

}));
