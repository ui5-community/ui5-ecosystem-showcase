sap.ui.define(['ui5/ecosystem/demo/app/resources/trace-api'], (function (traceApi) { 'use strict';

    /*
     * Copyright The OpenTelemetry Authors
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const consoleMap = [
        { n: 'error', c: 'error' },
        { n: 'warn', c: 'warn' },
        { n: 'info', c: 'info' },
        { n: 'debug', c: 'debug' },
        { n: 'verbose', c: 'trace' },
    ];
    /**
     * A simple Immutable Console based diagnostic logger which will output any messages to the Console.
     * If you want to limit the amount of logging to a specific level or lower use the
     * {@link createLogLevelDiagLogger}
     */
    class DiagConsoleLogger {
        constructor() {
            function _consoleFunc(funcName) {
                return function (...args) {
                    if (console) {
                        // Some environments only expose the console when the F12 developer console is open
                        // eslint-disable-next-line no-console
                        let theFunc = console[funcName];
                        if (typeof theFunc !== 'function') {
                            // Not all environments support all functions
                            // eslint-disable-next-line no-console
                            theFunc = console.log;
                        }
                        // One last final check
                        if (typeof theFunc === 'function') {
                            return theFunc.apply(console, args);
                        }
                    }
                };
            }
            for (let i = 0; i < consoleMap.length; i++) {
                this[consoleMap[i].n] = _consoleFunc(consoleMap[i].c);
            }
        }
    }

    /*
     * Copyright The OpenTelemetry Authors
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
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
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
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
            return this._keys()
                .reduce((agg, key) => {
                agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
                return agg;
            }, [])
                .join(LIST_MEMBERS_SEPARATOR);
        }
        _parse(rawTraceState) {
            if (rawTraceState.length > MAX_TRACE_STATE_LEN)
                return;
            this._internalState = rawTraceState
                .split(LIST_MEMBERS_SEPARATOR)
                .reverse() // Store in reverse so new keys (.set(...)) will be placed at the beginning
                .reduce((agg, part) => {
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
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function createTraceState(rawTraceState) {
        return new TraceStateImpl(rawTraceState);
    }

    /*
     * Copyright The OpenTelemetry Authors
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
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
        DiagConsoleLogger: DiagConsoleLogger,
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
