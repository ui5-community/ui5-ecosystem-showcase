sap.ui.define(['../trace-api'], (function (traceApi) { 'use strict';

    /*
     * Copyright The OpenTelemetry Authors
     * SPDX-License-Identifier: Apache-2.0
     */
    const VALID_KEY_CHAR_RANGE = '[_0-9a-z-*/]';
    const VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
    const VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
    const VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
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
        return (VALID_VALUE_BASE_REGEX.test(value) &&
            !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value));
    }

    /*
     * Copyright The OpenTelemetry Authors
     * SPDX-License-Identifier: Apache-2.0
     */
    const MAX_TRACE_STATE_ITEMS = 32;
    const MAX_TRACE_STATE_LEN = 512;
    const LIST_MEMBERS_SEPARATOR = ',';
    const LIST_MEMBER_KEY_VALUE_SPLITTER = '=';
    /**
     * TraceState must be a class and not a simple object type because of the spec
     * requirement (https://www.w3.org/TR/trace-context/#tracestate-field).
     *
     * Here is the list of allowed mutations:
     * - New key-value pair should be added into the beginning of the list
     * - The value of any key can be updated. Modified keys MUST be moved to the
     * beginning of the list.
     */
    class TraceStateImpl {
        constructor(rawTraceState) {
            this._internalState = new Map();
            if (rawTraceState)
                this._parse(rawTraceState);
        }
        set(key, value) {
            // TODO: Benchmark the different approaches(map vs list) and
            // use the faster one.
            const traceState = this._clone();
            if (traceState._internalState.has(key)) {
                traceState._internalState.delete(key);
            }
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
            return (Array.from(this._internalState.keys())
                // Use reduceRight() because keys are stored in reverse insertion order.
                .reduceRight((agg, key) => {
                agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
                return agg;
            }, [])
                .join(LIST_MEMBERS_SEPARATOR));
        }
        _parse(rawTraceState) {
            if (rawTraceState.length > MAX_TRACE_STATE_LEN)
                return;
            this._internalState = rawTraceState
                .split(LIST_MEMBERS_SEPARATOR)
                // Use reduceRight() so new keys (.set(...)) will be placed at the beginning
                .reduceRight((agg, part) => {
                const listMember = part.trim(); // Optional Whitespace (OWS) handling
                const i = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
                if (i !== -1) {
                    const key = listMember.slice(0, i);
                    const value = listMember.slice(i + 1, part.length);
                    if (validateKey(key) && validateValue(value)) {
                        agg.set(key, value);
                    }
                }
                return agg;
            }, new Map());
            // Because of the reverse() requirement, trunc must be done after map is created
            if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
                this._internalState = new Map(Array.from(this._internalState.entries())
                    .reverse() // Use reverse same as original tracestate parse chain
                    .slice(0, MAX_TRACE_STATE_ITEMS));
            }
        }
        // @ts-expect-error TS6133 Accessed in tests only.
        _keys() {
            return Array.from(this._internalState.keys()).reverse();
        }
        _clone() {
            const traceState = new TraceStateImpl();
            traceState._internalState = new Map(this._internalState);
            return traceState;
        }
    }

    /*
     * Copyright The OpenTelemetry Authors
     * SPDX-License-Identifier: Apache-2.0
     */
    /**
     * @since 1.1.0
     */
    function createTraceState(rawTraceState) {
        return new TraceStateImpl(rawTraceState);
    }

    /*
     * Copyright The OpenTelemetry Authors
     * SPDX-License-Identifier: Apache-2.0
     */
    // Default export.
    var defExp = {
        context: traceApi.context,
        diag: traceApi.diag,
        metrics: traceApi.metrics,
        propagation: traceApi.propagation,
        trace: traceApi.trace,
    };

    var namedExports = /*#__PURE__*/Object.freeze({
        __proto__: null,
        DiagConsoleLogger: traceApi.DiagConsoleLogger,
        get DiagLogLevel () { return traceApi.DiagLogLevel; },
        INVALID_SPANID: traceApi.INVALID_SPANID,
        INVALID_SPAN_CONTEXT: traceApi.INVALID_SPAN_CONTEXT,
        INVALID_TRACEID: traceApi.INVALID_TRACEID,
        ProxyTracer: traceApi.ProxyTracer,
        ProxyTracerProvider: traceApi.ProxyTracerProvider,
        ROOT_CONTEXT: traceApi.ROOT_CONTEXT,
        get SamplingDecision () { return traceApi.SamplingDecision; },
        get SpanKind () { return traceApi.SpanKind; },
        get SpanStatusCode () { return traceApi.SpanStatusCode; },
        get TraceFlags () { return traceApi.TraceFlags; },
        get ValueType () { return traceApi.ValueType; },
        baggageEntryMetadataFromString: traceApi.baggageEntryMetadataFromString,
        context: traceApi.context,
        createContextKey: traceApi.createContextKey,
        createNoopMeter: traceApi.createNoopMeter,
        createTraceState: createTraceState,
        default: defExp,
        defaultTextMapGetter: traceApi.defaultTextMapGetter,
        defaultTextMapSetter: traceApi.defaultTextMapSetter,
        diag: traceApi.diag,
        isSpanContextValid: traceApi.isSpanContextValid,
        isValidSpanId: traceApi.isValidSpanId,
        isValidTraceId: traceApi.isValidTraceId,
        metrics: traceApi.metrics,
        propagation: traceApi.propagation,
        trace: traceApi.trace
    });

    const defaultExports = Object.isFrozen(defExp) ? Object.assign({}, defExp?.default || defExp || { __emptyModule: true }) : defExp;
    Object.keys(namedExports || {}).filter((key) => !defaultExports[key]).forEach((key) => defaultExports[key] = namedExports[key]);
    Object.defineProperty(defaultExports, "__" + "esModule", { value: true });
    var index = Object.isFrozen(defExp) ? Object.freeze(defaultExports) : defaultExports;

    return index;

}));
