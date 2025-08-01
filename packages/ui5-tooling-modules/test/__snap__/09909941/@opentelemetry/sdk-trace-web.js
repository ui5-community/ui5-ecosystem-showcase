sap.ui.define(['exports', '../trace-api'], (function (exports, traceApi) { 'use strict';

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
    const SUPPRESS_TRACING_KEY = traceApi.createContextKey('OpenTelemetry SDK Context Key SUPPRESS_TRACING');
    function suppressTracing(context) {
        return context.setValue(SUPPRESS_TRACING_KEY, true);
    }
    function isTracingSuppressed(context) {
        return context.getValue(SUPPRESS_TRACING_KEY) === true;
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
    const BAGGAGE_KEY_PAIR_SEPARATOR = '=';
    const BAGGAGE_PROPERTIES_SEPARATOR = ';';
    const BAGGAGE_ITEMS_SEPARATOR = ',';
    // Name of the http header used to propagate the baggage
    const BAGGAGE_HEADER = 'baggage';
    // Maximum number of name-value pairs allowed by w3c spec
    const BAGGAGE_MAX_NAME_VALUE_PAIRS = 180;
    // Maximum number of bytes per a single name-value pair allowed by w3c spec
    const BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = 4096;
    // Maximum total length of all name-value pairs allowed by w3c spec
    const BAGGAGE_MAX_TOTAL_LENGTH = 8192;

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
    function serializeKeyPairs(keyPairs) {
        return keyPairs.reduce((hValue, current) => {
            const value = `${hValue}${hValue !== '' ? BAGGAGE_ITEMS_SEPARATOR : ''}${current}`;
            return value.length > BAGGAGE_MAX_TOTAL_LENGTH ? hValue : value;
        }, '');
    }
    function getKeyPairs(baggage) {
        return baggage.getAllEntries().map(([key, value]) => {
            let entry = `${encodeURIComponent(key)}=${encodeURIComponent(value.value)}`;
            // include opaque metadata if provided
            // NOTE: we intentionally don't URI-encode the metadata - that responsibility falls on the metadata implementation
            if (value.metadata !== undefined) {
                entry += BAGGAGE_PROPERTIES_SEPARATOR + value.metadata.toString();
            }
            return entry;
        });
    }
    function parsePairKeyValue(entry) {
        const valueProps = entry.split(BAGGAGE_PROPERTIES_SEPARATOR);
        if (valueProps.length <= 0)
            return;
        const keyPairPart = valueProps.shift();
        if (!keyPairPart)
            return;
        const separatorIndex = keyPairPart.indexOf(BAGGAGE_KEY_PAIR_SEPARATOR);
        if (separatorIndex <= 0)
            return;
        const key = decodeURIComponent(keyPairPart.substring(0, separatorIndex).trim());
        const value = decodeURIComponent(keyPairPart.substring(separatorIndex + 1).trim());
        let metadata;
        if (valueProps.length > 0) {
            metadata = traceApi.baggageEntryMetadataFromString(valueProps.join(BAGGAGE_PROPERTIES_SEPARATOR));
        }
        return { key, value, metadata };
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
    /**
     * Propagates {@link Baggage} through Context format propagation.
     *
     * Based on the Baggage specification:
     * https://w3c.github.io/baggage/
     */
    class W3CBaggagePropagator {
        inject(context, carrier, setter) {
            const baggage = traceApi.propagation.getBaggage(context);
            if (!baggage || isTracingSuppressed(context))
                return;
            const keyPairs = getKeyPairs(baggage)
                .filter((pair) => {
                return pair.length <= BAGGAGE_MAX_PER_NAME_VALUE_PAIRS;
            })
                .slice(0, BAGGAGE_MAX_NAME_VALUE_PAIRS);
            const headerValue = serializeKeyPairs(keyPairs);
            if (headerValue.length > 0) {
                setter.set(carrier, BAGGAGE_HEADER, headerValue);
            }
        }
        extract(context, carrier, getter) {
            const headerValue = getter.get(carrier, BAGGAGE_HEADER);
            const baggageString = Array.isArray(headerValue)
                ? headerValue.join(BAGGAGE_ITEMS_SEPARATOR)
                : headerValue;
            if (!baggageString)
                return context;
            const baggage = {};
            if (baggageString.length === 0) {
                return context;
            }
            const pairs = baggageString.split(BAGGAGE_ITEMS_SEPARATOR);
            pairs.forEach(entry => {
                const keyPair = parsePairKeyValue(entry);
                if (keyPair) {
                    const baggageEntry = { value: keyPair.value };
                    if (keyPair.metadata) {
                        baggageEntry.metadata = keyPair.metadata;
                    }
                    baggage[keyPair.key] = baggageEntry;
                }
            });
            if (Object.entries(baggage).length === 0) {
                return context;
            }
            return traceApi.propagation.setBaggage(context, traceApi.propagation.createBaggage(baggage));
        }
        fields() {
            return [BAGGAGE_HEADER];
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
    function sanitizeAttributes(attributes) {
        const out = {};
        if (typeof attributes !== 'object' || attributes == null) {
            return out;
        }
        for (const [key, val] of Object.entries(attributes)) {
            if (!isAttributeKey(key)) {
                traceApi.diag.warn(`Invalid attribute key: ${key}`);
                continue;
            }
            if (!isAttributeValue(val)) {
                traceApi.diag.warn(`Invalid attribute value set for key: ${key}`);
                continue;
            }
            if (Array.isArray(val)) {
                out[key] = val.slice();
            }
            else {
                out[key] = val;
            }
        }
        return out;
    }
    function isAttributeKey(key) {
        return typeof key === 'string' && key.length > 0;
    }
    function isAttributeValue(val) {
        if (val == null) {
            return true;
        }
        if (Array.isArray(val)) {
            return isHomogeneousAttributeValueArray(val);
        }
        return isValidPrimitiveAttributeValue(val);
    }
    function isHomogeneousAttributeValueArray(arr) {
        let type;
        for (const element of arr) {
            // null/undefined elements are allowed
            if (element == null)
                continue;
            if (!type) {
                if (isValidPrimitiveAttributeValue(element)) {
                    type = typeof element;
                    continue;
                }
                // encountered an invalid primitive
                return false;
            }
            if (typeof element === type) {
                continue;
            }
            return false;
        }
        return true;
    }
    function isValidPrimitiveAttributeValue(val) {
        switch (typeof val) {
            case 'number':
            case 'boolean':
            case 'string':
                return true;
        }
        return false;
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
    /**
     * Returns a function that logs an error using the provided logger, or a
     * console logger if one was not provided.
     */
    function loggingErrorHandler() {
        return (ex) => {
            traceApi.diag.error(stringifyException(ex));
        };
    }
    /**
     * Converts an exception into a string representation
     * @param {Exception} ex
     */
    function stringifyException(ex) {
        if (typeof ex === 'string') {
            return ex;
        }
        else {
            return JSON.stringify(flattenException(ex));
        }
    }
    /**
     * Flattens an exception into key-value pairs by traversing the prototype chain
     * and coercing values to strings. Duplicate properties will not be overwritten;
     * the first insert wins.
     */
    function flattenException(ex) {
        const result = {};
        let current = ex;
        while (current !== null) {
            Object.getOwnPropertyNames(current).forEach(propertyName => {
                if (result[propertyName])
                    return;
                const value = current[propertyName];
                if (value) {
                    result[propertyName] = String(value);
                }
            });
            current = Object.getPrototypeOf(current);
        }
        return result;
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
    /** The global error handler delegate */
    let delegateHandler = loggingErrorHandler();
    /**
     * Return the global error handler
     * @param {Exception} ex
     */
    function globalErrorHandler(ex) {
        try {
            delegateHandler(ex);
        }
        catch { } // eslint-disable-line no-empty
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
    function getNumberFromEnv(_) {
        return undefined;
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
    const otperformance = performance;

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
    // this is autogenerated file, see scripts/version-update.js
    const VERSION$1 = '2.0.1';

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
    //----------------------------------------------------------------------------------------------------------
    // DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates/registry/stable/attributes.ts.j2
    //----------------------------------------------------------------------------------------------------------
    /**
     * ASP.NET Core exception middleware handling result
     *
     * @example handled
     * @example unhandled
     */
    /**
     * The exception message.
     *
     * @example Division by zero
     * @example Can't convert 'int' object to str implicitly
     */
    const ATTR_EXCEPTION_MESSAGE = 'exception.message';
    /**
     * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
     *
     * @example "Exception in thread "main" java.lang.RuntimeException: Test exception\\n at com.example.GenerateTrace.methodB(GenerateTrace.java:13)\\n at com.example.GenerateTrace.methodA(GenerateTrace.java:9)\\n at com.example.GenerateTrace.main(GenerateTrace.java:5)\\n"
     */
    const ATTR_EXCEPTION_STACKTRACE = 'exception.stacktrace';
    /**
     * The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
     *
     * @example java.net.ConnectException
     * @example OSError
     */
    const ATTR_EXCEPTION_TYPE = 'exception.type';
    /**
     * Logical name of the service.
     *
     * @example shoppingcart
     *
     * @note **MUST** be the same for all instances of horizontally scaled services. If the value was not specified, SDKs **MUST** fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value **MUST** be set to `unknown_service`.
     */
    const ATTR_SERVICE_NAME = 'service.name';
    /**
     * The language of the telemetry SDK.
     */
    const ATTR_TELEMETRY_SDK_LANGUAGE = 'telemetry.sdk.language';
    /**
      * Enum value "webjs" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
      */
    const TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS = "webjs";
    /**
     * The name of the telemetry SDK as defined above.
     *
     * @example opentelemetry
     *
     * @note The OpenTelemetry SDK **MUST** set the `telemetry.sdk.name` attribute to `opentelemetry`.
     * If another SDK, like a fork or a vendor-provided implementation, is used, this SDK **MUST** set the
     * `telemetry.sdk.name` attribute to the fully-qualified class or module name of this SDK's main entry point
     * or another suitable identifier depending on the language.
     * The identifier `opentelemetry` is reserved and **MUST NOT** be used in this case.
     * All custom identifiers **SHOULD** be stable across different versions of an implementation.
     */
    const ATTR_TELEMETRY_SDK_NAME = 'telemetry.sdk.name';
    /**
     * The version string of the telemetry SDK.
     *
     * @example 1.2.3
     */
    const ATTR_TELEMETRY_SDK_VERSION = 'telemetry.sdk.version';

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
    /*
     * This file contains a copy of unstable semantic convention definitions
     * used by this package.
     * @see https://github.com/open-telemetry/opentelemetry-js/tree/main/semantic-conventions#unstable-semconv
     */
    /**
     * The name of the runtime of this process.
     *
     * @example OpenJDK Runtime Environment
     *
     * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
     */
    const ATTR_PROCESS_RUNTIME_NAME = 'process.runtime.name';

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
    /** Constants describing the SDK in use */
    const SDK_INFO = {
        [ATTR_TELEMETRY_SDK_NAME]: 'opentelemetry',
        [ATTR_PROCESS_RUNTIME_NAME]: 'browser',
        [ATTR_TELEMETRY_SDK_LANGUAGE]: TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS,
        [ATTR_TELEMETRY_SDK_VERSION]: VERSION$1,
    };

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
    function unrefTimer(_timer) { }

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
    const NANOSECOND_DIGITS = 9;
    const NANOSECOND_DIGITS_IN_MILLIS = 6;
    const MILLISECONDS_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS_IN_MILLIS);
    const SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
    /**
     * Converts a number of milliseconds from epoch to HrTime([seconds, remainder in nanoseconds]).
     * @param epochMillis
     */
    function millisToHrTime(epochMillis) {
        const epochSeconds = epochMillis / 1000;
        // Decimals only.
        const seconds = Math.trunc(epochSeconds);
        // Round sub-nanosecond accuracy to nanosecond.
        const nanos = Math.round((epochMillis % 1000) * MILLISECONDS_TO_NANOSECONDS);
        return [seconds, nanos];
    }
    function getTimeOrigin() {
        let timeOrigin = otperformance.timeOrigin;
        if (typeof timeOrigin !== 'number') {
            const perf = otperformance;
            timeOrigin = perf.timing && perf.timing.fetchStart;
        }
        return timeOrigin;
    }
    /**
     * Returns an hrtime calculated via performance component.
     * @param performanceNow
     */
    function hrTime(performanceNow) {
        const timeOrigin = millisToHrTime(getTimeOrigin());
        const now = millisToHrTime(typeof performanceNow === 'number' ? performanceNow : otperformance.now());
        return addHrTimes(timeOrigin, now);
    }
    /**
     *
     * Converts a TimeInput to an HrTime, defaults to _hrtime().
     * @param time
     */
    function timeInputToHrTime(time) {
        // process.hrtime
        if (isTimeInputHrTime(time)) {
            return time;
        }
        else if (typeof time === 'number') {
            // Must be a performance.now() if it's smaller than process start time.
            if (time < getTimeOrigin()) {
                return hrTime(time);
            }
            else {
                // epoch milliseconds or performance.timeOrigin
                return millisToHrTime(time);
            }
        }
        else if (time instanceof Date) {
            return millisToHrTime(time.getTime());
        }
        else {
            throw TypeError('Invalid input type');
        }
    }
    /**
     * Returns a duration of two hrTime.
     * @param startTime
     * @param endTime
     */
    function hrTimeDuration(startTime, endTime) {
        let seconds = endTime[0] - startTime[0];
        let nanos = endTime[1] - startTime[1];
        // overflow
        if (nanos < 0) {
            seconds -= 1;
            // negate
            nanos += SECOND_TO_NANOSECONDS;
        }
        return [seconds, nanos];
    }
    /**
     * Convert hrTime to nanoseconds.
     * @param time
     */
    function hrTimeToNanoseconds(time) {
        return time[0] * SECOND_TO_NANOSECONDS + time[1];
    }
    /**
     * Convert hrTime to microseconds.
     * @param time
     */
    function hrTimeToMicroseconds(time) {
        return time[0] * 1e6 + time[1] / 1e3;
    }
    /**
     * check if time is HrTime
     * @param value
     */
    function isTimeInputHrTime(value) {
        return (Array.isArray(value) &&
            value.length === 2 &&
            typeof value[0] === 'number' &&
            typeof value[1] === 'number');
    }
    /**
     * check if input value is a correct types.TimeInput
     * @param value
     */
    function isTimeInput(value) {
        return (isTimeInputHrTime(value) ||
            typeof value === 'number' ||
            value instanceof Date);
    }
    /**
     * Given 2 HrTime formatted times, return their sum as an HrTime.
     */
    function addHrTimes(time1, time2) {
        const out = [time1[0] + time2[0], time1[1] + time2[1]];
        // Nanoseconds
        if (out[1] >= SECOND_TO_NANOSECONDS) {
            out[1] -= SECOND_TO_NANOSECONDS;
            out[0] += 1;
        }
        return out;
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
    var ExportResultCode;
    (function (ExportResultCode) {
        ExportResultCode[ExportResultCode["SUCCESS"] = 0] = "SUCCESS";
        ExportResultCode[ExportResultCode["FAILED"] = 1] = "FAILED";
    })(ExportResultCode || (ExportResultCode = {}));

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
    /** Combines multiple propagators into a single propagator. */
    class CompositePropagator {
        _propagators;
        _fields;
        /**
         * Construct a composite propagator from a list of propagators.
         *
         * @param [config] Configuration object for composite propagator
         */
        constructor(config = {}) {
            this._propagators = config.propagators ?? [];
            this._fields = Array.from(new Set(this._propagators
                // older propagators may not have fields function, null check to be sure
                .map(p => (typeof p.fields === 'function' ? p.fields() : []))
                .reduce((x, y) => x.concat(y), [])));
        }
        /**
         * Run each of the configured propagators with the given context and carrier.
         * Propagators are run in the order they are configured, so if multiple
         * propagators write the same carrier key, the propagator later in the list
         * will "win".
         *
         * @param context Context to inject
         * @param carrier Carrier into which context will be injected
         */
        inject(context, carrier, setter) {
            for (const propagator of this._propagators) {
                try {
                    propagator.inject(context, carrier, setter);
                }
                catch (err) {
                    traceApi.diag.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
                }
            }
        }
        /**
         * Run each of the configured propagators with the given context and carrier.
         * Propagators are run in the order they are configured, so if multiple
         * propagators write the same context key, the propagator later in the list
         * will "win".
         *
         * @param context Context to add values to
         * @param carrier Carrier from which to extract context
         */
        extract(context, carrier, getter) {
            return this._propagators.reduce((ctx, propagator) => {
                try {
                    return propagator.extract(ctx, carrier, getter);
                }
                catch (err) {
                    traceApi.diag.warn(`Failed to extract with ${propagator.constructor.name}. Err: ${err.message}`);
                }
                return ctx;
            }, context);
        }
        fields() {
            // return a new array so our fields cannot be modified
            return this._fields.slice();
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
    class TraceState {
        _internalState = new Map();
        constructor(rawTraceState) {
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
            const traceState = new TraceState();
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
    const TRACE_PARENT_HEADER = 'traceparent';
    const TRACE_STATE_HEADER = 'tracestate';
    const VERSION = '00';
    const VERSION_PART = '(?!ff)[\\da-f]{2}';
    const TRACE_ID_PART = '(?![0]{32})[\\da-f]{32}';
    const PARENT_ID_PART = '(?![0]{16})[\\da-f]{16}';
    const FLAGS_PART = '[\\da-f]{2}';
    const TRACE_PARENT_REGEX = new RegExp(`^\\s?(${VERSION_PART})-(${TRACE_ID_PART})-(${PARENT_ID_PART})-(${FLAGS_PART})(-.*)?\\s?$`);
    /**
     * Parses information from the [traceparent] span tag and converts it into {@link SpanContext}
     * @param traceParent - A meta property that comes from server.
     *     It should be dynamically generated server side to have the server's request trace Id,
     *     a parent span Id that was set on the server's request span,
     *     and the trace flags to indicate the server's sampling decision
     *     (01 = sampled, 00 = not sampled).
     *     for example: '{version}-{traceId}-{spanId}-{sampleDecision}'
     *     For more information see {@link https://www.w3.org/TR/trace-context/}
     */
    function parseTraceParent(traceParent) {
        const match = TRACE_PARENT_REGEX.exec(traceParent);
        if (!match)
            return null;
        // According to the specification the implementation should be compatible
        // with future versions. If there are more parts, we only reject it if it's using version 00
        // See https://www.w3.org/TR/trace-context/#versioning-of-traceparent
        if (match[1] === '00' && match[5])
            return null;
        return {
            traceId: match[2],
            spanId: match[3],
            traceFlags: parseInt(match[4], 16),
        };
    }
    /**
     * Propagates {@link SpanContext} through Trace Context format propagation.
     *
     * Based on the Trace Context specification:
     * https://www.w3.org/TR/trace-context/
     */
    class W3CTraceContextPropagator {
        inject(context, carrier, setter) {
            const spanContext = traceApi.trace.getSpanContext(context);
            if (!spanContext ||
                isTracingSuppressed(context) ||
                !traceApi.isSpanContextValid(spanContext))
                return;
            const traceParent = `${VERSION}-${spanContext.traceId}-${spanContext.spanId}-0${Number(spanContext.traceFlags || traceApi.TraceFlags.NONE).toString(16)}`;
            setter.set(carrier, TRACE_PARENT_HEADER, traceParent);
            if (spanContext.traceState) {
                setter.set(carrier, TRACE_STATE_HEADER, spanContext.traceState.serialize());
            }
        }
        extract(context, carrier, getter) {
            const traceParentHeader = getter.get(carrier, TRACE_PARENT_HEADER);
            if (!traceParentHeader)
                return context;
            const traceParent = Array.isArray(traceParentHeader)
                ? traceParentHeader[0]
                : traceParentHeader;
            if (typeof traceParent !== 'string')
                return context;
            const spanContext = parseTraceParent(traceParent);
            if (!spanContext)
                return context;
            spanContext.isRemote = true;
            const traceStateHeader = getter.get(carrier, TRACE_STATE_HEADER);
            if (traceStateHeader) {
                // If more than one `tracestate` header is found, we merge them into a
                // single header.
                const state = Array.isArray(traceStateHeader)
                    ? traceStateHeader.join(',')
                    : traceStateHeader;
                spanContext.traceState = new TraceState(typeof state === 'string' ? state : undefined);
            }
            return traceApi.trace.setSpanContext(context, spanContext);
        }
        fields() {
            return [TRACE_PARENT_HEADER, TRACE_STATE_HEADER];
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
    var RPCType;
    (function (RPCType) {
        RPCType["HTTP"] = "http";
    })(RPCType || (RPCType = {}));

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
    /* eslint-disable @typescript-eslint/no-explicit-any */
    /**
     * based on lodash in order to support esm builds without esModuleInterop.
     * lodash is using MIT License.
     **/
    const objectTag = '[object Object]';
    const nullTag = '[object Null]';
    const undefinedTag = '[object Undefined]';
    const funcProto = Function.prototype;
    const funcToString = funcProto.toString;
    const objectCtorString = funcToString.call(Object);
    const getPrototypeOf = Object.getPrototypeOf;
    const objectProto = Object.prototype;
    const hasOwnProperty = objectProto.hasOwnProperty;
    const symToStringTag = Symbol ? Symbol.toStringTag : undefined;
    const nativeObjectToString = objectProto.toString;
    /**
     * Checks if `value` is a plain object, that is, an object created by the
     * `Object` constructor or one with a `[[Prototype]]` of `null`.
     *
     * @static
     * @memberOf _
     * @since 0.8.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * _.isPlainObject(new Foo);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     *
     * _.isPlainObject(Object.create(null));
     * // => true
     */
    function isPlainObject(value) {
        if (!isObjectLike(value) || baseGetTag(value) !== objectTag) {
            return false;
        }
        const proto = getPrototypeOf(value);
        if (proto === null) {
            return true;
        }
        const Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
        return (typeof Ctor == 'function' &&
            Ctor instanceof Ctor &&
            funcToString.call(Ctor) === objectCtorString);
    }
    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
        return value != null && typeof value == 'object';
    }
    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
        if (value == null) {
            return value === undefined ? undefinedTag : nullTag;
        }
        return symToStringTag && symToStringTag in Object(value)
            ? getRawTag(value)
            : objectToString(value);
    }
    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
        const isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
        let unmasked = false;
        try {
            value[symToStringTag] = undefined;
            unmasked = true;
        }
        catch (e) {
            // silence
        }
        const result = nativeObjectToString.call(value);
        if (unmasked) {
            if (isOwn) {
                value[symToStringTag] = tag;
            }
            else {
                delete value[symToStringTag];
            }
        }
        return result;
    }
    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
        return nativeObjectToString.call(value);
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
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const MAX_LEVEL = 20;
    /**
     * Merges objects together
     * @param args - objects / values to be merged
     */
    function merge(...args) {
        let result = args.shift();
        const objects = new WeakMap();
        while (args.length > 0) {
            result = mergeTwoObjects(result, args.shift(), 0, objects);
        }
        return result;
    }
    function takeValue(value) {
        if (isArray(value)) {
            return value.slice();
        }
        return value;
    }
    /**
     * Merges two objects
     * @param one - first object
     * @param two - second object
     * @param level - current deep level
     * @param objects - objects holder that has been already referenced - to prevent
     * cyclic dependency
     */
    function mergeTwoObjects(one, two, level = 0, objects) {
        let result;
        if (level > MAX_LEVEL) {
            return undefined;
        }
        level++;
        if (isPrimitive(one) || isPrimitive(two) || isFunction(two)) {
            result = takeValue(two);
        }
        else if (isArray(one)) {
            result = one.slice();
            if (isArray(two)) {
                for (let i = 0, j = two.length; i < j; i++) {
                    result.push(takeValue(two[i]));
                }
            }
            else if (isObject(two)) {
                const keys = Object.keys(two);
                for (let i = 0, j = keys.length; i < j; i++) {
                    const key = keys[i];
                    result[key] = takeValue(two[key]);
                }
            }
        }
        else if (isObject(one)) {
            if (isObject(two)) {
                if (!shouldMerge(one, two)) {
                    return two;
                }
                result = Object.assign({}, one);
                const keys = Object.keys(two);
                for (let i = 0, j = keys.length; i < j; i++) {
                    const key = keys[i];
                    const twoValue = two[key];
                    if (isPrimitive(twoValue)) {
                        if (typeof twoValue === 'undefined') {
                            delete result[key];
                        }
                        else {
                            // result[key] = takeValue(twoValue);
                            result[key] = twoValue;
                        }
                    }
                    else {
                        const obj1 = result[key];
                        const obj2 = twoValue;
                        if (wasObjectReferenced(one, key, objects) ||
                            wasObjectReferenced(two, key, objects)) {
                            delete result[key];
                        }
                        else {
                            if (isObject(obj1) && isObject(obj2)) {
                                const arr1 = objects.get(obj1) || [];
                                const arr2 = objects.get(obj2) || [];
                                arr1.push({ obj: one, key });
                                arr2.push({ obj: two, key });
                                objects.set(obj1, arr1);
                                objects.set(obj2, arr2);
                            }
                            result[key] = mergeTwoObjects(result[key], twoValue, level, objects);
                        }
                    }
                }
            }
            else {
                result = two;
            }
        }
        return result;
    }
    /**
     * Function to check if object has been already reference
     * @param obj
     * @param key
     * @param objects
     */
    function wasObjectReferenced(obj, key, objects) {
        const arr = objects.get(obj[key]) || [];
        for (let i = 0, j = arr.length; i < j; i++) {
            const info = arr[i];
            if (info.key === key && info.obj === obj) {
                return true;
            }
        }
        return false;
    }
    function isArray(value) {
        return Array.isArray(value);
    }
    function isFunction(value) {
        return typeof value === 'function';
    }
    function isObject(value) {
        return (!isPrimitive(value) &&
            !isArray(value) &&
            !isFunction(value) &&
            typeof value === 'object');
    }
    function isPrimitive(value) {
        return (typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            typeof value === 'undefined' ||
            value instanceof Date ||
            value instanceof RegExp ||
            value === null);
    }
    function shouldMerge(one, two) {
        if (!isPlainObject(one) || !isPlainObject(two)) {
            return false;
        }
        return true;
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
    function urlMatches(url, urlToMatch) {
        if (typeof urlToMatch === 'string') {
            return url === urlToMatch;
        }
        else {
            return !!url.match(urlToMatch);
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
    class Deferred {
        _promise;
        _resolve;
        _reject;
        constructor() {
            this._promise = new Promise((resolve, reject) => {
                this._resolve = resolve;
                this._reject = reject;
            });
        }
        get promise() {
            return this._promise;
        }
        resolve(val) {
            this._resolve(val);
        }
        reject(err) {
            this._reject(err);
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
    /**
     * Bind the callback and only invoke the callback once regardless how many times `BindOnceFuture.call` is invoked.
     */
    class BindOnceFuture {
        _callback;
        _that;
        _isCalled = false;
        _deferred = new Deferred();
        constructor(_callback, _that) {
            this._callback = _callback;
            this._that = _that;
        }
        get isCalled() {
            return this._isCalled;
        }
        get promise() {
            return this._deferred.promise;
        }
        call(...args) {
            if (!this._isCalled) {
                this._isCalled = true;
                try {
                    Promise.resolve(this._callback.call(this._that, ...args)).then(val => this._deferred.resolve(val), err => this._deferred.reject(err));
                }
                catch (err) {
                    this._deferred.reject(err);
                }
            }
            return this._deferred.promise;
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
    ({
        ALL: traceApi.DiagLogLevel.ALL,
        VERBOSE: traceApi.DiagLogLevel.VERBOSE,
        DEBUG: traceApi.DiagLogLevel.DEBUG,
        INFO: traceApi.DiagLogLevel.INFO,
        WARN: traceApi.DiagLogLevel.WARN,
        ERROR: traceApi.DiagLogLevel.ERROR,
        NONE: traceApi.DiagLogLevel.NONE,
    });

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
    /**
     * @internal
     * Shared functionality used by Exporters while exporting data, including suppression of Traces.
     */
    function _export(exporter, arg) {
        return new Promise(resolve => {
            // prevent downstream exporter calls from generating spans
            traceApi.context.with(suppressTracing(traceApi.context.active()), () => {
                exporter.export(arg, (result) => {
                    resolve(result);
                });
            });
        });
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
    const internal = {
        _export,
    };

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
    function defaultServiceName() {
        return 'unknown_service';
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
    const isPromiseLike = (val) => {
        return (val !== null &&
            typeof val === 'object' &&
            typeof val.then === 'function');
    };

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
    class ResourceImpl {
        _rawAttributes;
        _asyncAttributesPending = false;
        _memoizedAttributes;
        static FromAttributeList(attributes) {
            const res = new ResourceImpl({});
            res._rawAttributes = guardedRawAttributes(attributes);
            res._asyncAttributesPending =
                attributes.filter(([_, val]) => isPromiseLike(val)).length > 0;
            return res;
        }
        constructor(
        /**
         * A dictionary of attributes with string keys and values that provide
         * information about the entity as numbers, strings or booleans
         * TODO: Consider to add check/validation on attributes.
         */
        resource) {
            const attributes = resource.attributes ?? {};
            this._rawAttributes = Object.entries(attributes).map(([k, v]) => {
                if (isPromiseLike(v)) {
                    // side-effect
                    this._asyncAttributesPending = true;
                }
                return [k, v];
            });
            this._rawAttributes = guardedRawAttributes(this._rawAttributes);
        }
        get asyncAttributesPending() {
            return this._asyncAttributesPending;
        }
        async waitForAsyncAttributes() {
            if (!this.asyncAttributesPending) {
                return;
            }
            for (let i = 0; i < this._rawAttributes.length; i++) {
                const [k, v] = this._rawAttributes[i];
                this._rawAttributes[i] = [k, isPromiseLike(v) ? await v : v];
            }
            this._asyncAttributesPending = false;
        }
        get attributes() {
            if (this.asyncAttributesPending) {
                traceApi.diag.error('Accessing resource attributes before async attributes settled');
            }
            if (this._memoizedAttributes) {
                return this._memoizedAttributes;
            }
            const attrs = {};
            for (const [k, v] of this._rawAttributes) {
                if (isPromiseLike(v)) {
                    traceApi.diag.debug(`Unsettled resource attribute ${k} skipped`);
                    continue;
                }
                if (v != null) {
                    attrs[k] ??= v;
                }
            }
            // only memoize output if all attributes are settled
            if (!this._asyncAttributesPending) {
                this._memoizedAttributes = attrs;
            }
            return attrs;
        }
        getRawAttributes() {
            return this._rawAttributes;
        }
        merge(resource) {
            if (resource == null)
                return this;
            // Order is important
            // Spec states incoming attributes override existing attributes
            return ResourceImpl.FromAttributeList([
                ...resource.getRawAttributes(),
                ...this.getRawAttributes(),
            ]);
        }
    }
    function resourceFromAttributes(attributes) {
        return ResourceImpl.FromAttributeList(Object.entries(attributes));
    }
    function defaultResource() {
        return resourceFromAttributes({
            [ATTR_SERVICE_NAME]: defaultServiceName(),
            [ATTR_TELEMETRY_SDK_LANGUAGE]: SDK_INFO[ATTR_TELEMETRY_SDK_LANGUAGE],
            [ATTR_TELEMETRY_SDK_NAME]: SDK_INFO[ATTR_TELEMETRY_SDK_NAME],
            [ATTR_TELEMETRY_SDK_VERSION]: SDK_INFO[ATTR_TELEMETRY_SDK_VERSION],
        });
    }
    function guardedRawAttributes(attributes) {
        return attributes.map(([k, v]) => {
            if (isPromiseLike(v)) {
                return [
                    k,
                    v.catch(err => {
                        traceApi.diag.debug('promise rejection for resource attribute: %s - %s', k, err);
                        return undefined;
                    }),
                ];
            }
            return [k, v];
        });
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
    // Event name definitions
    const ExceptionEventName = 'exception';

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
    /**
     * This class represents a span.
     */
    class SpanImpl {
        // Below properties are included to implement ReadableSpan for export
        // purposes but are not intended to be written-to directly.
        _spanContext;
        kind;
        parentSpanContext;
        attributes = {};
        links = [];
        events = [];
        startTime;
        resource;
        instrumentationScope;
        _droppedAttributesCount = 0;
        _droppedEventsCount = 0;
        _droppedLinksCount = 0;
        name;
        status = {
            code: traceApi.SpanStatusCode.UNSET,
        };
        endTime = [0, 0];
        _ended = false;
        _duration = [-1, -1];
        _spanProcessor;
        _spanLimits;
        _attributeValueLengthLimit;
        _performanceStartTime;
        _performanceOffset;
        _startTimeProvided;
        /**
         * Constructs a new SpanImpl instance.
         */
        constructor(opts) {
            const now = Date.now();
            this._spanContext = opts.spanContext;
            this._performanceStartTime = otperformance.now();
            this._performanceOffset =
                now - (this._performanceStartTime + getTimeOrigin());
            this._startTimeProvided = opts.startTime != null;
            this._spanLimits = opts.spanLimits;
            this._attributeValueLengthLimit =
                this._spanLimits.attributeValueLengthLimit || 0;
            this._spanProcessor = opts.spanProcessor;
            this.name = opts.name;
            this.parentSpanContext = opts.parentSpanContext;
            this.kind = opts.kind;
            this.links = opts.links || [];
            this.startTime = this._getTime(opts.startTime ?? now);
            this.resource = opts.resource;
            this.instrumentationScope = opts.scope;
            if (opts.attributes != null) {
                this.setAttributes(opts.attributes);
            }
            this._spanProcessor.onStart(this, opts.context);
        }
        spanContext() {
            return this._spanContext;
        }
        setAttribute(key, value) {
            if (value == null || this._isSpanEnded())
                return this;
            if (key.length === 0) {
                traceApi.diag.warn(`Invalid attribute key: ${key}`);
                return this;
            }
            if (!isAttributeValue(value)) {
                traceApi.diag.warn(`Invalid attribute value set for key: ${key}`);
                return this;
            }
            const { attributeCountLimit } = this._spanLimits;
            if (attributeCountLimit !== undefined &&
                Object.keys(this.attributes).length >= attributeCountLimit &&
                !Object.prototype.hasOwnProperty.call(this.attributes, key)) {
                this._droppedAttributesCount++;
                return this;
            }
            this.attributes[key] = this._truncateToSize(value);
            return this;
        }
        setAttributes(attributes) {
            for (const [k, v] of Object.entries(attributes)) {
                this.setAttribute(k, v);
            }
            return this;
        }
        /**
         *
         * @param name Span Name
         * @param [attributesOrStartTime] Span attributes or start time
         *     if type is {@type TimeInput} and 3rd param is undefined
         * @param [timeStamp] Specified time stamp for the event
         */
        addEvent(name, attributesOrStartTime, timeStamp) {
            if (this._isSpanEnded())
                return this;
            const { eventCountLimit } = this._spanLimits;
            if (eventCountLimit === 0) {
                traceApi.diag.warn('No events allowed.');
                this._droppedEventsCount++;
                return this;
            }
            if (eventCountLimit !== undefined &&
                this.events.length >= eventCountLimit) {
                if (this._droppedEventsCount === 0) {
                    traceApi.diag.debug('Dropping extra events.');
                }
                this.events.shift();
                this._droppedEventsCount++;
            }
            if (isTimeInput(attributesOrStartTime)) {
                if (!isTimeInput(timeStamp)) {
                    timeStamp = attributesOrStartTime;
                }
                attributesOrStartTime = undefined;
            }
            const attributes = sanitizeAttributes(attributesOrStartTime);
            this.events.push({
                name,
                attributes,
                time: this._getTime(timeStamp),
                droppedAttributesCount: 0,
            });
            return this;
        }
        addLink(link) {
            this.links.push(link);
            return this;
        }
        addLinks(links) {
            this.links.push(...links);
            return this;
        }
        setStatus(status) {
            if (this._isSpanEnded())
                return this;
            this.status = { ...status };
            // When using try-catch, the caught "error" is of type `any`. When then assigning `any` to `status.message`,
            // TypeScript will not error. While this can happen during use of any API, it is more common on Span#setStatus()
            // as it's likely used in a catch-block. Therefore, we validate if `status.message` is actually a string, null, or
            // undefined to avoid an incorrect type causing issues downstream.
            if (this.status.message != null && typeof status.message !== 'string') {
                traceApi.diag.warn(`Dropping invalid status.message of type '${typeof status.message}', expected 'string'`);
                delete this.status.message;
            }
            return this;
        }
        updateName(name) {
            if (this._isSpanEnded())
                return this;
            this.name = name;
            return this;
        }
        end(endTime) {
            if (this._isSpanEnded()) {
                traceApi.diag.error(`${this.name} ${this._spanContext.traceId}-${this._spanContext.spanId} - You can only call end() on a span once.`);
                return;
            }
            this._ended = true;
            this.endTime = this._getTime(endTime);
            this._duration = hrTimeDuration(this.startTime, this.endTime);
            if (this._duration[0] < 0) {
                traceApi.diag.warn('Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.', this.startTime, this.endTime);
                this.endTime = this.startTime.slice();
                this._duration = [0, 0];
            }
            if (this._droppedEventsCount > 0) {
                traceApi.diag.warn(`Dropped ${this._droppedEventsCount} events because eventCountLimit reached`);
            }
            this._spanProcessor.onEnd(this);
        }
        _getTime(inp) {
            if (typeof inp === 'number' && inp <= otperformance.now()) {
                // must be a performance timestamp
                // apply correction and convert to hrtime
                return hrTime(inp + this._performanceOffset);
            }
            if (typeof inp === 'number') {
                return millisToHrTime(inp);
            }
            if (inp instanceof Date) {
                return millisToHrTime(inp.getTime());
            }
            if (isTimeInputHrTime(inp)) {
                return inp;
            }
            if (this._startTimeProvided) {
                // if user provided a time for the start manually
                // we can't use duration to calculate event/end times
                return millisToHrTime(Date.now());
            }
            const msDuration = otperformance.now() - this._performanceStartTime;
            return addHrTimes(this.startTime, millisToHrTime(msDuration));
        }
        isRecording() {
            return this._ended === false;
        }
        recordException(exception, time) {
            const attributes = {};
            if (typeof exception === 'string') {
                attributes[ATTR_EXCEPTION_MESSAGE] = exception;
            }
            else if (exception) {
                if (exception.code) {
                    attributes[ATTR_EXCEPTION_TYPE] = exception.code.toString();
                }
                else if (exception.name) {
                    attributes[ATTR_EXCEPTION_TYPE] = exception.name;
                }
                if (exception.message) {
                    attributes[ATTR_EXCEPTION_MESSAGE] = exception.message;
                }
                if (exception.stack) {
                    attributes[ATTR_EXCEPTION_STACKTRACE] = exception.stack;
                }
            }
            // these are minimum requirements from spec
            if (attributes[ATTR_EXCEPTION_TYPE] || attributes[ATTR_EXCEPTION_MESSAGE]) {
                this.addEvent(ExceptionEventName, attributes, time);
            }
            else {
                traceApi.diag.warn(`Failed to record an exception ${exception}`);
            }
        }
        get duration() {
            return this._duration;
        }
        get ended() {
            return this._ended;
        }
        get droppedAttributesCount() {
            return this._droppedAttributesCount;
        }
        get droppedEventsCount() {
            return this._droppedEventsCount;
        }
        get droppedLinksCount() {
            return this._droppedLinksCount;
        }
        _isSpanEnded() {
            if (this._ended) {
                const error = new Error(`Operation attempted on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`);
                traceApi.diag.warn(`Cannot execute the operation on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`, error);
            }
            return this._ended;
        }
        // Utility function to truncate given value within size
        // for value type of string, will truncate to given limit
        // for type of non-string, will return same value
        _truncateToLimitUtil(value, limit) {
            if (value.length <= limit) {
                return value;
            }
            return value.substring(0, limit);
        }
        /**
         * If the given attribute value is of type string and has more characters than given {@code attributeValueLengthLimit} then
         * return string with truncated to {@code attributeValueLengthLimit} characters
         *
         * If the given attribute value is array of strings then
         * return new array of strings with each element truncated to {@code attributeValueLengthLimit} characters
         *
         * Otherwise return same Attribute {@code value}
         *
         * @param value Attribute value
         * @returns truncated attribute value if required, otherwise same value
         */
        _truncateToSize(value) {
            const limit = this._attributeValueLengthLimit;
            // Check limit
            if (limit <= 0) {
                // Negative values are invalid, so do not truncate
                traceApi.diag.warn(`Attribute value limit must be positive, got ${limit}`);
                return value;
            }
            // String
            if (typeof value === 'string') {
                return this._truncateToLimitUtil(value, limit);
            }
            // Array of strings
            if (Array.isArray(value)) {
                return value.map(val => typeof val === 'string' ? this._truncateToLimitUtil(val, limit) : val);
            }
            // Other types, no need to apply value length limit
            return value;
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
    /**
     * A sampling decision that determines how a {@link Span} will be recorded
     * and collected.
     */
    exports.SamplingDecision = void 0;
    (function (SamplingDecision) {
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
    })(exports.SamplingDecision || (exports.SamplingDecision = {}));

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
    /** Sampler that samples no traces. */
    class AlwaysOffSampler {
        shouldSample() {
            return {
                decision: exports.SamplingDecision.NOT_RECORD,
            };
        }
        toString() {
            return 'AlwaysOffSampler';
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
    /** Sampler that samples all traces. */
    class AlwaysOnSampler {
        shouldSample() {
            return {
                decision: exports.SamplingDecision.RECORD_AND_SAMPLED,
            };
        }
        toString() {
            return 'AlwaysOnSampler';
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
    /**
     * A composite sampler that either respects the parent span's sampling decision
     * or delegates to `delegateSampler` for root spans.
     */
    class ParentBasedSampler {
        _root;
        _remoteParentSampled;
        _remoteParentNotSampled;
        _localParentSampled;
        _localParentNotSampled;
        constructor(config) {
            this._root = config.root;
            if (!this._root) {
                globalErrorHandler(new Error('ParentBasedSampler must have a root sampler configured'));
                this._root = new AlwaysOnSampler();
            }
            this._remoteParentSampled =
                config.remoteParentSampled ?? new AlwaysOnSampler();
            this._remoteParentNotSampled =
                config.remoteParentNotSampled ?? new AlwaysOffSampler();
            this._localParentSampled =
                config.localParentSampled ?? new AlwaysOnSampler();
            this._localParentNotSampled =
                config.localParentNotSampled ?? new AlwaysOffSampler();
        }
        shouldSample(context, traceId, spanName, spanKind, attributes, links) {
            const parentContext = traceApi.trace.getSpanContext(context);
            if (!parentContext || !traceApi.isSpanContextValid(parentContext)) {
                return this._root.shouldSample(context, traceId, spanName, spanKind, attributes, links);
            }
            if (parentContext.isRemote) {
                if (parentContext.traceFlags & traceApi.TraceFlags.SAMPLED) {
                    return this._remoteParentSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
                }
                return this._remoteParentNotSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
            }
            if (parentContext.traceFlags & traceApi.TraceFlags.SAMPLED) {
                return this._localParentSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
            }
            return this._localParentNotSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
        }
        toString() {
            return `ParentBased{root=${this._root.toString()}, remoteParentSampled=${this._remoteParentSampled.toString()}, remoteParentNotSampled=${this._remoteParentNotSampled.toString()}, localParentSampled=${this._localParentSampled.toString()}, localParentNotSampled=${this._localParentNotSampled.toString()}}`;
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
    /** Sampler that samples a given fraction of traces based of trace id deterministically. */
    class TraceIdRatioBasedSampler {
        _ratio;
        _upperBound;
        constructor(_ratio = 0) {
            this._ratio = _ratio;
            this._ratio = this._normalize(_ratio);
            this._upperBound = Math.floor(this._ratio * 0xffffffff);
        }
        shouldSample(context, traceId) {
            return {
                decision: traceApi.isValidTraceId(traceId) && this._accumulate(traceId) < this._upperBound
                    ? exports.SamplingDecision.RECORD_AND_SAMPLED
                    : exports.SamplingDecision.NOT_RECORD,
            };
        }
        toString() {
            return `TraceIdRatioBased{${this._ratio}}`;
        }
        _normalize(ratio) {
            if (typeof ratio !== 'number' || isNaN(ratio))
                return 0;
            return ratio >= 1 ? 1 : ratio <= 0 ? 0 : ratio;
        }
        _accumulate(traceId) {
            let accumulation = 0;
            for (let i = 0; i < traceId.length / 8; i++) {
                const pos = i * 8;
                const part = parseInt(traceId.slice(pos, pos + 8), 16);
                accumulation = (accumulation ^ part) >>> 0;
            }
            return accumulation;
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
    const DEFAULT_RATIO = 1;
    /**
     * Load default configuration. For fields with primitive values, any user-provided
     * value will override the corresponding default value. For fields with
     * non-primitive values (like `spanLimits`), the user-provided value will be
     * used to extend the default value.
     */
    // object needs to be wrapped in this function and called when needed otherwise
    // envs are parsed before tests are ran - causes tests using these envs to fail
    function loadDefaultConfig() {
        return {
            sampler: buildSamplerFromEnv(),
            forceFlushTimeoutMillis: 30000,
            generalLimits: {
                attributeValueLengthLimit: Infinity,
                attributeCountLimit: 128,
            },
            spanLimits: {
                attributeValueLengthLimit: Infinity,
                attributeCountLimit: 128,
                linkCountLimit: 128,
                eventCountLimit: 128,
                attributePerEventCountLimit: 128,
                attributePerLinkCountLimit: 128,
            },
        };
    }
    /**
     * Based on environment, builds a sampler, complies with specification.
     */
    function buildSamplerFromEnv() {
        const sampler = "parentbased_always_on" /* TracesSamplerValues.ParentBasedAlwaysOn */;
        switch (sampler) {
            case "always_on" /* TracesSamplerValues.AlwaysOn */:
                return new AlwaysOnSampler();
            case "always_off" /* TracesSamplerValues.AlwaysOff */:
                return new AlwaysOffSampler();
            case "parentbased_always_on" /* TracesSamplerValues.ParentBasedAlwaysOn */:
                return new ParentBasedSampler({
                    root: new AlwaysOnSampler(),
                });
            case "parentbased_always_off" /* TracesSamplerValues.ParentBasedAlwaysOff */:
                return new ParentBasedSampler({
                    root: new AlwaysOffSampler(),
                });
            case "traceidratio" /* TracesSamplerValues.TraceIdRatio */:
                return new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv());
            case "parentbased_traceidratio" /* TracesSamplerValues.ParentBasedTraceIdRatio */:
                return new ParentBasedSampler({
                    root: new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv()),
                });
            default:
                traceApi.diag.error(`OTEL_TRACES_SAMPLER value "${sampler}" invalid, defaulting to "${"parentbased_always_on" /* TracesSamplerValues.ParentBasedAlwaysOn */}".`);
                return new ParentBasedSampler({
                    root: new AlwaysOnSampler(),
                });
        }
    }
    function getSamplerProbabilityFromEnv() {
        {
            traceApi.diag.error(`OTEL_TRACES_SAMPLER_ARG is blank, defaulting to ${DEFAULT_RATIO}.`);
            return DEFAULT_RATIO;
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
    const DEFAULT_ATTRIBUTE_COUNT_LIMIT = 128;
    const DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = Infinity;
    /**
     * Function to merge Default configuration (as specified in './config') with
     * user provided configurations.
     */
    function mergeConfig(userConfig) {
        const perInstanceDefaults = {
            sampler: buildSamplerFromEnv(),
        };
        const DEFAULT_CONFIG = loadDefaultConfig();
        const target = Object.assign({}, DEFAULT_CONFIG, perInstanceDefaults, userConfig);
        target.generalLimits = Object.assign({}, DEFAULT_CONFIG.generalLimits, userConfig.generalLimits || {});
        target.spanLimits = Object.assign({}, DEFAULT_CONFIG.spanLimits, userConfig.spanLimits || {});
        return target;
    }
    /**
     * When general limits are provided and model specific limits are not,
     * configures the model specific limits by using the values from the general ones.
     * @param userConfig User provided tracer configuration
     */
    function reconfigureLimits(userConfig) {
        const spanLimits = Object.assign({}, userConfig.spanLimits);
        /**
         * Reassign span attribute count limit to use first non null value defined by user or use default value
         */
        spanLimits.attributeCountLimit =
            userConfig.spanLimits?.attributeCountLimit ??
                userConfig.generalLimits?.attributeCountLimit ??
                getNumberFromEnv() ??
                getNumberFromEnv() ??
                DEFAULT_ATTRIBUTE_COUNT_LIMIT;
        /**
         * Reassign span attribute value length limit to use first non null value defined by user or use default value
         */
        spanLimits.attributeValueLengthLimit =
            userConfig.spanLimits?.attributeValueLengthLimit ??
                userConfig.generalLimits?.attributeValueLengthLimit ??
                getNumberFromEnv() ??
                getNumberFromEnv() ??
                DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT;
        return Object.assign({}, userConfig, { spanLimits });
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
    /**
     * Implementation of the {@link SpanProcessor} that batches spans exported by
     * the SDK then pushes them to the exporter pipeline.
     */
    class BatchSpanProcessorBase {
        _exporter;
        _maxExportBatchSize;
        _maxQueueSize;
        _scheduledDelayMillis;
        _exportTimeoutMillis;
        _isExporting = false;
        _finishedSpans = [];
        _timer;
        _shutdownOnce;
        _droppedSpansCount = 0;
        constructor(_exporter, config) {
            this._exporter = _exporter;
            this._maxExportBatchSize =
                typeof config?.maxExportBatchSize === 'number'
                    ? config.maxExportBatchSize
                    : (512);
            this._maxQueueSize =
                typeof config?.maxQueueSize === 'number'
                    ? config.maxQueueSize
                    : (2048);
            this._scheduledDelayMillis =
                typeof config?.scheduledDelayMillis === 'number'
                    ? config.scheduledDelayMillis
                    : (5000);
            this._exportTimeoutMillis =
                typeof config?.exportTimeoutMillis === 'number'
                    ? config.exportTimeoutMillis
                    : (30000);
            this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
            if (this._maxExportBatchSize > this._maxQueueSize) {
                traceApi.diag.warn('BatchSpanProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize');
                this._maxExportBatchSize = this._maxQueueSize;
            }
        }
        forceFlush() {
            if (this._shutdownOnce.isCalled) {
                return this._shutdownOnce.promise;
            }
            return this._flushAll();
        }
        // does nothing.
        onStart(_span, _parentContext) { }
        onEnd(span) {
            if (this._shutdownOnce.isCalled) {
                return;
            }
            if ((span.spanContext().traceFlags & traceApi.TraceFlags.SAMPLED) === 0) {
                return;
            }
            this._addToBuffer(span);
        }
        shutdown() {
            return this._shutdownOnce.call();
        }
        _shutdown() {
            return Promise.resolve()
                .then(() => {
                return this.onShutdown();
            })
                .then(() => {
                return this._flushAll();
            })
                .then(() => {
                return this._exporter.shutdown();
            });
        }
        /** Add a span in the buffer. */
        _addToBuffer(span) {
            if (this._finishedSpans.length >= this._maxQueueSize) {
                // limit reached, drop span
                if (this._droppedSpansCount === 0) {
                    traceApi.diag.debug('maxQueueSize reached, dropping spans');
                }
                this._droppedSpansCount++;
                return;
            }
            if (this._droppedSpansCount > 0) {
                // some spans were dropped, log once with count of spans dropped
                traceApi.diag.warn(`Dropped ${this._droppedSpansCount} spans because maxQueueSize reached`);
                this._droppedSpansCount = 0;
            }
            this._finishedSpans.push(span);
            this._maybeStartTimer();
        }
        /**
         * Send all spans to the exporter respecting the batch size limit
         * This function is used only on forceFlush or shutdown,
         * for all other cases _flush should be used
         * */
        _flushAll() {
            return new Promise((resolve, reject) => {
                const promises = [];
                // calculate number of batches
                const count = Math.ceil(this._finishedSpans.length / this._maxExportBatchSize);
                for (let i = 0, j = count; i < j; i++) {
                    promises.push(this._flushOneBatch());
                }
                Promise.all(promises)
                    .then(() => {
                    resolve();
                })
                    .catch(reject);
            });
        }
        _flushOneBatch() {
            this._clearTimer();
            if (this._finishedSpans.length === 0) {
                return Promise.resolve();
            }
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    // don't wait anymore for export, this way the next batch can start
                    reject(new Error('Timeout'));
                }, this._exportTimeoutMillis);
                // prevent downstream exporter calls from generating spans
                traceApi.context.with(suppressTracing(traceApi.context.active()), () => {
                    // Reset the finished spans buffer here because the next invocations of the _flush method
                    // could pass the same finished spans to the exporter if the buffer is cleared
                    // outside the execution of this callback.
                    let spans;
                    if (this._finishedSpans.length <= this._maxExportBatchSize) {
                        spans = this._finishedSpans;
                        this._finishedSpans = [];
                    }
                    else {
                        spans = this._finishedSpans.splice(0, this._maxExportBatchSize);
                    }
                    const doExport = () => this._exporter.export(spans, result => {
                        clearTimeout(timer);
                        if (result.code === ExportResultCode.SUCCESS) {
                            resolve();
                        }
                        else {
                            reject(result.error ??
                                new Error('BatchSpanProcessor: span export failed'));
                        }
                    });
                    let pendingResources = null;
                    for (let i = 0, len = spans.length; i < len; i++) {
                        const span = spans[i];
                        if (span.resource.asyncAttributesPending &&
                            span.resource.waitForAsyncAttributes) {
                            pendingResources ??= [];
                            pendingResources.push(span.resource.waitForAsyncAttributes());
                        }
                    }
                    // Avoid scheduling a promise to make the behavior more predictable and easier to test
                    if (pendingResources === null) {
                        doExport();
                    }
                    else {
                        Promise.all(pendingResources).then(doExport, err => {
                            globalErrorHandler(err);
                            reject(err);
                        });
                    }
                });
            });
        }
        _maybeStartTimer() {
            if (this._isExporting)
                return;
            const flush = () => {
                this._isExporting = true;
                this._flushOneBatch()
                    .finally(() => {
                    this._isExporting = false;
                    if (this._finishedSpans.length > 0) {
                        this._clearTimer();
                        this._maybeStartTimer();
                    }
                })
                    .catch(e => {
                    this._isExporting = false;
                    globalErrorHandler(e);
                });
            };
            // we only wait if the queue doesn't have enough elements yet
            if (this._finishedSpans.length >= this._maxExportBatchSize) {
                return flush();
            }
            if (this._timer !== undefined)
                return;
            this._timer = setTimeout(() => flush(), this._scheduledDelayMillis);
            unrefTimer(this._timer);
        }
        _clearTimer() {
            if (this._timer !== undefined) {
                clearTimeout(this._timer);
                this._timer = undefined;
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
    class BatchSpanProcessor extends BatchSpanProcessorBase {
        _visibilityChangeListener;
        _pageHideListener;
        constructor(_exporter, config) {
            super(_exporter, config);
            this.onInit(config);
        }
        onInit(config) {
            if (config?.disableAutoFlushOnDocumentHide !== true &&
                typeof document !== 'undefined') {
                this._visibilityChangeListener = () => {
                    if (document.visibilityState === 'hidden') {
                        this.forceFlush().catch(error => {
                            globalErrorHandler(error);
                        });
                    }
                };
                this._pageHideListener = () => {
                    this.forceFlush().catch(error => {
                        globalErrorHandler(error);
                    });
                };
                document.addEventListener('visibilitychange', this._visibilityChangeListener);
                // use 'pagehide' event as a fallback for Safari; see https://bugs.webkit.org/show_bug.cgi?id=116769
                document.addEventListener('pagehide', this._pageHideListener);
            }
        }
        onShutdown() {
            if (typeof document !== 'undefined') {
                if (this._visibilityChangeListener) {
                    document.removeEventListener('visibilitychange', this._visibilityChangeListener);
                }
                if (this._pageHideListener) {
                    document.removeEventListener('pagehide', this._pageHideListener);
                }
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
    const SPAN_ID_BYTES = 8;
    const TRACE_ID_BYTES = 16;
    class RandomIdGenerator {
        /**
         * Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
         * characters corresponding to 128 bits.
         */
        generateTraceId = getIdGenerator(TRACE_ID_BYTES);
        /**
         * Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
         * characters corresponding to 64 bits.
         */
        generateSpanId = getIdGenerator(SPAN_ID_BYTES);
    }
    const SHARED_CHAR_CODES_ARRAY = Array(32);
    function getIdGenerator(bytes) {
        return function generateId() {
            for (let i = 0; i < bytes * 2; i++) {
                SHARED_CHAR_CODES_ARRAY[i] = Math.floor(Math.random() * 16) + 48;
                // valid hex characters in the range 48-57 and 97-102
                if (SHARED_CHAR_CODES_ARRAY[i] >= 58) {
                    SHARED_CHAR_CODES_ARRAY[i] += 39;
                }
            }
            return String.fromCharCode.apply(null, SHARED_CHAR_CODES_ARRAY.slice(0, bytes * 2));
        };
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
    /**
     * This class represents a basic tracer.
     */
    class Tracer {
        _sampler;
        _generalLimits;
        _spanLimits;
        _idGenerator;
        instrumentationScope;
        _resource;
        _spanProcessor;
        /**
         * Constructs a new Tracer instance.
         */
        constructor(instrumentationScope, config, resource, spanProcessor) {
            const localConfig = mergeConfig(config);
            this._sampler = localConfig.sampler;
            this._generalLimits = localConfig.generalLimits;
            this._spanLimits = localConfig.spanLimits;
            this._idGenerator = config.idGenerator || new RandomIdGenerator();
            this._resource = resource;
            this._spanProcessor = spanProcessor;
            this.instrumentationScope = instrumentationScope;
        }
        /**
         * Starts a new Span or returns the default NoopSpan based on the sampling
         * decision.
         */
        startSpan(name, options = {}, context = traceApi.context.active()) {
            // remove span from context in case a root span is requested via options
            if (options.root) {
                context = traceApi.trace.deleteSpan(context);
            }
            const parentSpan = traceApi.trace.getSpan(context);
            if (isTracingSuppressed(context)) {
                traceApi.diag.debug('Instrumentation suppressed, returning Noop Span');
                const nonRecordingSpan = traceApi.trace.wrapSpanContext(traceApi.INVALID_SPAN_CONTEXT);
                return nonRecordingSpan;
            }
            const parentSpanContext = parentSpan?.spanContext();
            const spanId = this._idGenerator.generateSpanId();
            let validParentSpanContext;
            let traceId;
            let traceState;
            if (!parentSpanContext ||
                !traceApi.trace.isSpanContextValid(parentSpanContext)) {
                // New root span.
                traceId = this._idGenerator.generateTraceId();
            }
            else {
                // New child span.
                traceId = parentSpanContext.traceId;
                traceState = parentSpanContext.traceState;
                validParentSpanContext = parentSpanContext;
            }
            const spanKind = options.kind ?? traceApi.SpanKind.INTERNAL;
            const links = (options.links ?? []).map(link => {
                return {
                    context: link.context,
                    attributes: sanitizeAttributes(link.attributes),
                };
            });
            const attributes = sanitizeAttributes(options.attributes);
            // make sampling decision
            const samplingResult = this._sampler.shouldSample(context, traceId, name, spanKind, attributes, links);
            traceState = samplingResult.traceState ?? traceState;
            const traceFlags = samplingResult.decision === traceApi.SamplingDecision.RECORD_AND_SAMPLED
                ? traceApi.TraceFlags.SAMPLED
                : traceApi.TraceFlags.NONE;
            const spanContext = { traceId, spanId, traceFlags, traceState };
            if (samplingResult.decision === traceApi.SamplingDecision.NOT_RECORD) {
                traceApi.diag.debug('Recording is off, propagating context in a non-recording span');
                const nonRecordingSpan = traceApi.trace.wrapSpanContext(spanContext);
                return nonRecordingSpan;
            }
            // Set initial span attributes. The attributes object may have been mutated
            // by the sampler, so we sanitize the merged attributes before setting them.
            const initAttributes = sanitizeAttributes(Object.assign(attributes, samplingResult.attributes));
            const span = new SpanImpl({
                resource: this._resource,
                scope: this.instrumentationScope,
                context,
                spanContext,
                name,
                kind: spanKind,
                links,
                parentSpanContext: validParentSpanContext,
                attributes: initAttributes,
                startTime: options.startTime,
                spanProcessor: this._spanProcessor,
                spanLimits: this._spanLimits,
            });
            return span;
        }
        startActiveSpan(name, arg2, arg3, arg4) {
            let opts;
            let ctx;
            let fn;
            if (arguments.length < 2) {
                return;
            }
            else if (arguments.length === 2) {
                fn = arg2;
            }
            else if (arguments.length === 3) {
                opts = arg2;
                fn = arg3;
            }
            else {
                opts = arg2;
                ctx = arg3;
                fn = arg4;
            }
            const parentContext = ctx ?? traceApi.context.active();
            const span = this.startSpan(name, opts, parentContext);
            const contextWithSpanSet = traceApi.trace.setSpan(parentContext, span);
            return traceApi.context.with(contextWithSpanSet, fn, undefined, span);
        }
        /** Returns the active {@link GeneralLimits}. */
        getGeneralLimits() {
            return this._generalLimits;
        }
        /** Returns the active {@link SpanLimits}. */
        getSpanLimits() {
            return this._spanLimits;
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
    /**
     * Implementation of the {@link SpanProcessor} that simply forwards all
     * received events to a list of {@link SpanProcessor}s.
     */
    class MultiSpanProcessor {
        _spanProcessors;
        constructor(_spanProcessors) {
            this._spanProcessors = _spanProcessors;
        }
        forceFlush() {
            const promises = [];
            for (const spanProcessor of this._spanProcessors) {
                promises.push(spanProcessor.forceFlush());
            }
            return new Promise(resolve => {
                Promise.all(promises)
                    .then(() => {
                    resolve();
                })
                    .catch(error => {
                    globalErrorHandler(error || new Error('MultiSpanProcessor: forceFlush failed'));
                    resolve();
                });
            });
        }
        onStart(span, context) {
            for (const spanProcessor of this._spanProcessors) {
                spanProcessor.onStart(span, context);
            }
        }
        onEnd(span) {
            for (const spanProcessor of this._spanProcessors) {
                spanProcessor.onEnd(span);
            }
        }
        shutdown() {
            const promises = [];
            for (const spanProcessor of this._spanProcessors) {
                promises.push(spanProcessor.shutdown());
            }
            return new Promise((resolve, reject) => {
                Promise.all(promises).then(() => {
                    resolve();
                }, reject);
            });
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
    var ForceFlushState;
    (function (ForceFlushState) {
        ForceFlushState[ForceFlushState["resolved"] = 0] = "resolved";
        ForceFlushState[ForceFlushState["timeout"] = 1] = "timeout";
        ForceFlushState[ForceFlushState["error"] = 2] = "error";
        ForceFlushState[ForceFlushState["unresolved"] = 3] = "unresolved";
    })(ForceFlushState || (ForceFlushState = {}));
    /**
     * This class represents a basic tracer provider which platform libraries can extend
     */
    class BasicTracerProvider {
        _config;
        _tracers = new Map();
        _resource;
        _activeSpanProcessor;
        constructor(config = {}) {
            const mergedConfig = merge({}, loadDefaultConfig(), reconfigureLimits(config));
            this._resource = mergedConfig.resource ?? defaultResource();
            this._config = Object.assign({}, mergedConfig, {
                resource: this._resource,
            });
            const spanProcessors = [];
            if (config.spanProcessors?.length) {
                spanProcessors.push(...config.spanProcessors);
            }
            this._activeSpanProcessor = new MultiSpanProcessor(spanProcessors);
        }
        getTracer(name, version, options) {
            const key = `${name}@${version || ''}:${options?.schemaUrl || ''}`;
            if (!this._tracers.has(key)) {
                this._tracers.set(key, new Tracer({ name, version, schemaUrl: options?.schemaUrl }, this._config, this._resource, this._activeSpanProcessor));
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this._tracers.get(key);
        }
        forceFlush() {
            const timeout = this._config.forceFlushTimeoutMillis;
            const promises = this._activeSpanProcessor['_spanProcessors'].map((spanProcessor) => {
                return new Promise(resolve => {
                    let state;
                    const timeoutInterval = setTimeout(() => {
                        resolve(new Error(`Span processor did not completed within timeout period of ${timeout} ms`));
                        state = ForceFlushState.timeout;
                    }, timeout);
                    spanProcessor
                        .forceFlush()
                        .then(() => {
                        clearTimeout(timeoutInterval);
                        if (state !== ForceFlushState.timeout) {
                            state = ForceFlushState.resolved;
                            resolve(state);
                        }
                    })
                        .catch(error => {
                        clearTimeout(timeoutInterval);
                        state = ForceFlushState.error;
                        resolve(error);
                    });
                });
            });
            return new Promise((resolve, reject) => {
                Promise.all(promises)
                    .then(results => {
                    const errors = results.filter(result => result !== ForceFlushState.resolved);
                    if (errors.length > 0) {
                        reject(errors);
                    }
                    else {
                        resolve();
                    }
                })
                    .catch(error => reject([error]));
            });
        }
        shutdown() {
            return this._activeSpanProcessor.shutdown();
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
    /**
     * This is implementation of {@link SpanExporter} that prints spans to the
     * console. This class can be used for diagnostic purposes.
     *
     * NOTE: This {@link SpanExporter} is intended for diagnostics use only, output rendered to the console may change at any time.
     */
    /* eslint-disable no-console */
    class ConsoleSpanExporter {
        /**
         * Export spans.
         * @param spans
         * @param resultCallback
         */
        export(spans, resultCallback) {
            return this._sendSpans(spans, resultCallback);
        }
        /**
         * Shutdown the exporter.
         */
        shutdown() {
            this._sendSpans([]);
            return this.forceFlush();
        }
        /**
         * Exports any pending spans in exporter
         */
        forceFlush() {
            return Promise.resolve();
        }
        /**
         * converts span info into more readable format
         * @param span
         */
        _exportInfo(span) {
            return {
                resource: {
                    attributes: span.resource.attributes,
                },
                instrumentationScope: span.instrumentationScope,
                traceId: span.spanContext().traceId,
                parentSpanContext: span.parentSpanContext,
                traceState: span.spanContext().traceState?.serialize(),
                name: span.name,
                id: span.spanContext().spanId,
                kind: span.kind,
                timestamp: hrTimeToMicroseconds(span.startTime),
                duration: hrTimeToMicroseconds(span.duration),
                attributes: span.attributes,
                status: span.status,
                events: span.events,
                links: span.links,
            };
        }
        /**
         * Showing spans in console
         * @param spans
         * @param done
         */
        _sendSpans(spans, done) {
            for (const span of spans) {
                console.dir(this._exportInfo(span), { depth: 3 });
            }
            if (done) {
                return done({ code: ExportResultCode.SUCCESS });
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
    /**
     * This class can be used for testing purposes. It stores the exported spans
     * in a list in memory that can be retrieved using the `getFinishedSpans()`
     * method.
     */
    class InMemorySpanExporter {
        _finishedSpans = [];
        /**
         * Indicates if the exporter has been "shutdown."
         * When false, exported spans will not be stored in-memory.
         */
        _stopped = false;
        export(spans, resultCallback) {
            if (this._stopped)
                return resultCallback({
                    code: ExportResultCode.FAILED,
                    error: new Error('Exporter has been stopped'),
                });
            this._finishedSpans.push(...spans);
            setTimeout(() => resultCallback({ code: ExportResultCode.SUCCESS }), 0);
        }
        shutdown() {
            this._stopped = true;
            this._finishedSpans = [];
            return this.forceFlush();
        }
        /**
         * Exports any pending spans in the exporter
         */
        forceFlush() {
            return Promise.resolve();
        }
        reset() {
            this._finishedSpans = [];
        }
        getFinishedSpans() {
            return this._finishedSpans;
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
    /**
     * An implementation of the {@link SpanProcessor} that converts the {@link Span}
     * to {@link ReadableSpan} and passes it to the configured exporter.
     *
     * Only spans that are sampled are converted.
     *
     * NOTE: This {@link SpanProcessor} exports every ended span individually instead of batching spans together, which causes significant performance overhead with most exporters. For production use, please consider using the {@link BatchSpanProcessor} instead.
     */
    class SimpleSpanProcessor {
        _exporter;
        _shutdownOnce;
        _pendingExports;
        constructor(_exporter) {
            this._exporter = _exporter;
            this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
            this._pendingExports = new Set();
        }
        async forceFlush() {
            await Promise.all(Array.from(this._pendingExports));
            if (this._exporter.forceFlush) {
                await this._exporter.forceFlush();
            }
        }
        onStart(_span, _parentContext) { }
        onEnd(span) {
            if (this._shutdownOnce.isCalled) {
                return;
            }
            if ((span.spanContext().traceFlags & traceApi.TraceFlags.SAMPLED) === 0) {
                return;
            }
            const pendingExport = this._doExport(span).catch(err => globalErrorHandler(err));
            // Enqueue this export to the pending list so it can be flushed by the user.
            this._pendingExports.add(pendingExport);
            pendingExport.finally(() => this._pendingExports.delete(pendingExport));
        }
        async _doExport(span) {
            if (span.resource.asyncAttributesPending) {
                // Ensure resource is fully resolved before exporting.
                await span.resource.waitForAsyncAttributes?.();
            }
            const result = await internal._export(this._exporter, [span]);
            if (result.code !== ExportResultCode.SUCCESS) {
                throw (result.error ??
                    new Error(`SimpleSpanProcessor: span export failed (status ${result})`));
            }
        }
        shutdown() {
            return this._shutdownOnce.call();
        }
        _shutdown() {
            return this._exporter.shutdown();
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
    /** No-op implementation of SpanProcessor */
    class NoopSpanProcessor {
        onStart(_span, _context) { }
        onEnd(_span) { }
        shutdown() {
            return Promise.resolve();
        }
        forceFlush() {
            return Promise.resolve();
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
    /**
     * Stack Context Manager for managing the state in web
     * it doesn't fully support the async calls though
     */
    class StackContextManager {
        /**
         * whether the context manager is enabled or not
         */
        _enabled = false;
        /**
         * Keeps the reference to current context
         */
        _currentContext = traceApi.ROOT_CONTEXT;
        /**
         *
         * @param context
         * @param target Function to be executed within the context
         */
        // eslint-disable-next-line @typescript-eslint/ban-types
        _bindFunction(context = traceApi.ROOT_CONTEXT, target) {
            const manager = this;
            const contextWrapper = function (...args) {
                return manager.with(context, () => target.apply(this, args));
            };
            Object.defineProperty(contextWrapper, 'length', {
                enumerable: false,
                configurable: true,
                writable: false,
                value: target.length,
            });
            return contextWrapper;
        }
        /**
         * Returns the active context
         */
        active() {
            return this._currentContext;
        }
        /**
         * Binds a the certain context or the active one to the target function and then returns the target
         * @param context A context (span) to be bind to target
         * @param target a function or event emitter. When target or one of its callbacks is called,
         *  the provided context will be used as the active context for the duration of the call.
         */
        bind(context, target) {
            // if no specific context to propagate is given, we use the current one
            if (context === undefined) {
                context = this.active();
            }
            if (typeof target === 'function') {
                return this._bindFunction(context, target);
            }
            return target;
        }
        /**
         * Disable the context manager (clears the current context)
         */
        disable() {
            this._currentContext = traceApi.ROOT_CONTEXT;
            this._enabled = false;
            return this;
        }
        /**
         * Enables the context manager and creates a default(root) context
         */
        enable() {
            if (this._enabled) {
                return this;
            }
            this._enabled = true;
            this._currentContext = traceApi.ROOT_CONTEXT;
            return this;
        }
        /**
         * Calls the callback function [fn] with the provided [context]. If [context] is undefined then it will use the window.
         * The context will be set as active
         * @param context
         * @param fn Callback function
         * @param thisArg optional receiver to be used for calling fn
         * @param args optional arguments forwarded to fn
         */
        with(context, fn, thisArg, ...args) {
            const previousContext = this._currentContext;
            this._currentContext = context || traceApi.ROOT_CONTEXT;
            try {
                return fn.call(thisArg, ...args);
            }
            finally {
                this._currentContext = previousContext;
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
    function setupContextManager(contextManager) {
        // null means 'do not register'
        if (contextManager === null) {
            return;
        }
        // undefined means 'register default'
        if (contextManager === undefined) {
            const defaultContextManager = new StackContextManager();
            defaultContextManager.enable();
            traceApi.context.setGlobalContextManager(defaultContextManager);
            return;
        }
        contextManager.enable();
        traceApi.context.setGlobalContextManager(contextManager);
    }
    function setupPropagator(propagator) {
        // null means 'do not register'
        if (propagator === null) {
            return;
        }
        // undefined means 'register default'
        if (propagator === undefined) {
            traceApi.propagation.setGlobalPropagator(new CompositePropagator({
                propagators: [
                    new W3CTraceContextPropagator(),
                    new W3CBaggagePropagator(),
                ],
            }));
            return;
        }
        traceApi.propagation.setGlobalPropagator(propagator);
    }
    /**
     * This class represents a web tracer with {@link StackContextManager}
     */
    class WebTracerProvider extends BasicTracerProvider {
        /**
         * Constructs a new Tracer instance.
         * @param config Web Tracer config
         */
        constructor(config = {}) {
            super(config);
        }
        /**
         * Register this TracerProvider for use with the OpenTelemetry API.
         * Undefined values may be replaced with defaults, and
         * null values will be skipped.
         *
         * @param config Configuration object for SDK registration
         */
        register(config = {}) {
            traceApi.trace.setGlobalTracerProvider(this);
            setupPropagator(config.propagator);
            setupContextManager(config.contextManager);
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
    exports.PerformanceTimingNames = void 0;
    (function (PerformanceTimingNames) {
        PerformanceTimingNames["CONNECT_END"] = "connectEnd";
        PerformanceTimingNames["CONNECT_START"] = "connectStart";
        PerformanceTimingNames["DECODED_BODY_SIZE"] = "decodedBodySize";
        PerformanceTimingNames["DOM_COMPLETE"] = "domComplete";
        PerformanceTimingNames["DOM_CONTENT_LOADED_EVENT_END"] = "domContentLoadedEventEnd";
        PerformanceTimingNames["DOM_CONTENT_LOADED_EVENT_START"] = "domContentLoadedEventStart";
        PerformanceTimingNames["DOM_INTERACTIVE"] = "domInteractive";
        PerformanceTimingNames["DOMAIN_LOOKUP_END"] = "domainLookupEnd";
        PerformanceTimingNames["DOMAIN_LOOKUP_START"] = "domainLookupStart";
        PerformanceTimingNames["ENCODED_BODY_SIZE"] = "encodedBodySize";
        PerformanceTimingNames["FETCH_START"] = "fetchStart";
        PerformanceTimingNames["LOAD_EVENT_END"] = "loadEventEnd";
        PerformanceTimingNames["LOAD_EVENT_START"] = "loadEventStart";
        PerformanceTimingNames["NAVIGATION_START"] = "navigationStart";
        PerformanceTimingNames["REDIRECT_END"] = "redirectEnd";
        PerformanceTimingNames["REDIRECT_START"] = "redirectStart";
        PerformanceTimingNames["REQUEST_START"] = "requestStart";
        PerformanceTimingNames["RESPONSE_END"] = "responseEnd";
        PerformanceTimingNames["RESPONSE_START"] = "responseStart";
        PerformanceTimingNames["SECURE_CONNECTION_START"] = "secureConnectionStart";
        PerformanceTimingNames["START_TIME"] = "startTime";
        PerformanceTimingNames["UNLOAD_EVENT_END"] = "unloadEventEnd";
        PerformanceTimingNames["UNLOAD_EVENT_START"] = "unloadEventStart";
    })(exports.PerformanceTimingNames || (exports.PerformanceTimingNames = {}));

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
    /*
     * This file contains a copy of unstable semantic convention definitions
     * used by this package.
     * @see https://github.com/open-telemetry/opentelemetry-js/tree/main/semantic-conventions#unstable-semconv
     */
    /**
     * Deprecated, use `http.response.header.<key>` instead.
     *
     * @example 3495
     *
     * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
     *
     * @deprecated Replaced by `http.response.header.<key>`.
     */
    const ATTR_HTTP_RESPONSE_CONTENT_LENGTH = 'http.response_content_length';
    /**
     * Deprecated, use `http.response.body.size` instead.
     *
     * @example 5493
     *
     * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
     *
     * @deprecated Replace by `http.response.body.size`.
     */
    const ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = 'http.response_content_length_uncompressed';

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
    // Used to normalize relative URLs
    let urlNormalizingAnchor;
    function getUrlNormalizingAnchor() {
        if (!urlNormalizingAnchor) {
            urlNormalizingAnchor = document.createElement('a');
        }
        return urlNormalizingAnchor;
    }
    /**
     * Helper function to be able to use enum as typed key in type and in interface when using forEach
     * @param obj
     * @param key
     */
    function hasKey(obj, key) {
        return key in obj;
    }
    /**
     * Helper function for starting an event on span based on {@link PerformanceEntries}
     * @param span
     * @param performanceName name of performance entry for time start
     * @param entries
     * @param ignoreZeros
     */
    function addSpanNetworkEvent(span, performanceName, entries, ignoreZeros = true) {
        if (hasKey(entries, performanceName) &&
            typeof entries[performanceName] === 'number' &&
            !(ignoreZeros && entries[performanceName] === 0)) {
            return span.addEvent(performanceName, entries[performanceName]);
        }
        return undefined;
    }
    /**
     * Helper function for adding network events and content length attributes.
     */
    function addSpanNetworkEvents(span, resource, ignoreNetworkEvents = false, ignoreZeros, skipOldSemconvContentLengthAttrs) {
        if (ignoreZeros === undefined) {
            ignoreZeros = resource[exports.PerformanceTimingNames.START_TIME] !== 0;
        }
        if (!ignoreNetworkEvents) {
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.FETCH_START, resource, ignoreZeros);
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.DOMAIN_LOOKUP_START, resource, ignoreZeros);
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.DOMAIN_LOOKUP_END, resource, ignoreZeros);
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.CONNECT_START, resource, ignoreZeros);
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.SECURE_CONNECTION_START, resource, ignoreZeros);
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.CONNECT_END, resource, ignoreZeros);
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.REQUEST_START, resource, ignoreZeros);
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.RESPONSE_START, resource, ignoreZeros);
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.RESPONSE_END, resource, ignoreZeros);
        }
        if (!skipOldSemconvContentLengthAttrs) {
            // This block adds content-length-related span attributes using the
            // *old* HTTP semconv (v1.7.0).
            const encodedLength = resource[exports.PerformanceTimingNames.ENCODED_BODY_SIZE];
            if (encodedLength !== undefined) {
                span.setAttribute(ATTR_HTTP_RESPONSE_CONTENT_LENGTH, encodedLength);
            }
            const decodedLength = resource[exports.PerformanceTimingNames.DECODED_BODY_SIZE];
            // Spec: Not set if transport encoding not used (in which case encoded and decoded sizes match)
            if (decodedLength !== undefined && encodedLength !== decodedLength) {
                span.setAttribute(ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED, decodedLength);
            }
        }
    }
    /**
     * sort resources by startTime
     * @param filteredResources
     */
    function sortResources(filteredResources) {
        return filteredResources.slice().sort((a, b) => {
            const valueA = a[exports.PerformanceTimingNames.FETCH_START];
            const valueB = b[exports.PerformanceTimingNames.FETCH_START];
            if (valueA > valueB) {
                return 1;
            }
            else if (valueA < valueB) {
                return -1;
            }
            return 0;
        });
    }
    /** Returns the origin if present (if in browser context). */
    function getOrigin() {
        return typeof location !== 'undefined' ? location.origin : undefined;
    }
    /**
     * Get closest performance resource ignoring the resources that have been
     * already used.
     * @param spanUrl
     * @param startTimeHR
     * @param endTimeHR
     * @param resources
     * @param ignoredResources
     * @param initiatorType
     */
    function getResource(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources = new WeakSet(), initiatorType) {
        // de-relativize the URL before usage (does no harm to absolute URLs)
        const parsedSpanUrl = parseUrl(spanUrl);
        spanUrl = parsedSpanUrl.toString();
        const filteredResources = filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType);
        if (filteredResources.length === 0) {
            return {
                mainRequest: undefined,
            };
        }
        if (filteredResources.length === 1) {
            return {
                mainRequest: filteredResources[0],
            };
        }
        const sorted = sortResources(filteredResources);
        if (parsedSpanUrl.origin !== getOrigin() && sorted.length > 1) {
            let corsPreFlightRequest = sorted[0];
            let mainRequest = findMainRequest(sorted, corsPreFlightRequest[exports.PerformanceTimingNames.RESPONSE_END], endTimeHR);
            const responseEnd = corsPreFlightRequest[exports.PerformanceTimingNames.RESPONSE_END];
            const fetchStart = mainRequest[exports.PerformanceTimingNames.FETCH_START];
            // no corsPreFlightRequest
            if (fetchStart < responseEnd) {
                mainRequest = corsPreFlightRequest;
                corsPreFlightRequest = undefined;
            }
            return {
                corsPreFlightRequest,
                mainRequest,
            };
        }
        else {
            return {
                mainRequest: filteredResources[0],
            };
        }
    }
    /**
     * Will find the main request skipping the cors pre flight requests
     * @param resources
     * @param corsPreFlightRequestEndTime
     * @param spanEndTimeHR
     */
    function findMainRequest(resources, corsPreFlightRequestEndTime, spanEndTimeHR) {
        const spanEndTime = hrTimeToNanoseconds(spanEndTimeHR);
        const minTime = hrTimeToNanoseconds(timeInputToHrTime(corsPreFlightRequestEndTime));
        let mainRequest = resources[1];
        let bestGap;
        const length = resources.length;
        for (let i = 1; i < length; i++) {
            const resource = resources[i];
            const resourceStartTime = hrTimeToNanoseconds(timeInputToHrTime(resource[exports.PerformanceTimingNames.FETCH_START]));
            const resourceEndTime = hrTimeToNanoseconds(timeInputToHrTime(resource[exports.PerformanceTimingNames.RESPONSE_END]));
            const currentGap = spanEndTime - resourceEndTime;
            if (resourceStartTime >= minTime && (!bestGap || currentGap < bestGap)) {
                bestGap = currentGap;
                mainRequest = resource;
            }
        }
        return mainRequest;
    }
    /**
     * Filter all resources that has started and finished according to span start time and end time.
     *     It will return the closest resource to a start time
     * @param spanUrl
     * @param startTimeHR
     * @param endTimeHR
     * @param resources
     * @param ignoredResources
     */
    function filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType) {
        const startTime = hrTimeToNanoseconds(startTimeHR);
        const endTime = hrTimeToNanoseconds(endTimeHR);
        let filteredResources = resources.filter(resource => {
            const resourceStartTime = hrTimeToNanoseconds(timeInputToHrTime(resource[exports.PerformanceTimingNames.FETCH_START]));
            const resourceEndTime = hrTimeToNanoseconds(timeInputToHrTime(resource[exports.PerformanceTimingNames.RESPONSE_END]));
            return (resource.initiatorType.toLowerCase() ===
                (initiatorType || 'xmlhttprequest') &&
                resource.name === spanUrl &&
                resourceStartTime >= startTime &&
                resourceEndTime <= endTime);
        });
        if (filteredResources.length > 0) {
            filteredResources = filteredResources.filter(resource => {
                return !ignoredResources.has(resource);
            });
        }
        return filteredResources;
    }
    /**
     * Parses url using URL constructor or fallback to anchor element.
     * @param url
     */
    function parseUrl(url) {
        if (typeof URL === 'function') {
            return new URL(url, typeof document !== 'undefined'
                ? document.baseURI
                : typeof location !== 'undefined' // Some JS runtimes (e.g. Deno) don't define this
                    ? location.href
                    : undefined);
        }
        const element = getUrlNormalizingAnchor();
        element.href = url;
        return element;
    }
    /**
     * Parses url using URL constructor or fallback to anchor element and serialize
     * it to a string.
     *
     * Performs the steps described in https://html.spec.whatwg.org/multipage/urls-and-fetching.html#parse-a-url
     *
     * @param url
     */
    function normalizeUrl(url) {
        const urlLike = parseUrl(url);
        return urlLike.href;
    }
    /**
     * Get element XPath
     * @param target - target element
     * @param optimised - when id attribute of element is present the xpath can be
     * simplified to contain id
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    function getElementXPath(target, optimised) {
        if (target.nodeType === Node.DOCUMENT_NODE) {
            return '/';
        }
        const targetValue = getNodeValue(target, optimised);
        if (optimised && targetValue.indexOf('@id') > 0) {
            return targetValue;
        }
        let xpath = '';
        if (target.parentNode) {
            xpath += getElementXPath(target.parentNode, false);
        }
        xpath += targetValue;
        return xpath;
    }
    /**
     * get node index within the siblings
     * @param target
     */
    function getNodeIndex(target) {
        if (!target.parentNode) {
            return 0;
        }
        const allowedTypes = [target.nodeType];
        if (target.nodeType === Node.CDATA_SECTION_NODE) {
            allowedTypes.push(Node.TEXT_NODE);
        }
        let elements = Array.from(target.parentNode.childNodes);
        elements = elements.filter((element) => {
            const localName = element.localName;
            return (allowedTypes.indexOf(element.nodeType) >= 0 &&
                localName === target.localName);
        });
        if (elements.length >= 1) {
            return elements.indexOf(target) + 1; // xpath starts from 1
        }
        // if there are no other similar child xpath doesn't need index
        return 0;
    }
    /**
     * get node value for xpath
     * @param target
     * @param optimised
     */
    function getNodeValue(target, optimised) {
        const nodeType = target.nodeType;
        const index = getNodeIndex(target);
        let nodeValue = '';
        if (nodeType === Node.ELEMENT_NODE) {
            const id = target.getAttribute('id');
            if (optimised && id) {
                return `//*[@id="${id}"]`;
            }
            nodeValue = target.localName;
        }
        else if (nodeType === Node.TEXT_NODE ||
            nodeType === Node.CDATA_SECTION_NODE) {
            nodeValue = 'text()';
        }
        else if (nodeType === Node.COMMENT_NODE) {
            nodeValue = 'comment()';
        }
        else {
            return '';
        }
        // if index is 1 it can be omitted in xpath
        if (nodeValue && index > 1) {
            return `/${nodeValue}[${index}]`;
        }
        return `/${nodeValue}`;
    }
    /**
     * Checks if trace headers should be propagated
     * @param spanUrl
     * @private
     */
    function shouldPropagateTraceHeaders(spanUrl, propagateTraceHeaderCorsUrls) {
        let propagateTraceHeaderUrls = propagateTraceHeaderCorsUrls || [];
        if (typeof propagateTraceHeaderUrls === 'string' ||
            propagateTraceHeaderUrls instanceof RegExp) {
            propagateTraceHeaderUrls = [propagateTraceHeaderUrls];
        }
        const parsedSpanUrl = parseUrl(spanUrl);
        if (parsedSpanUrl.origin === getOrigin()) {
            return true;
        }
        else {
            return propagateTraceHeaderUrls.some(propagateTraceHeaderUrl => urlMatches(spanUrl, propagateTraceHeaderUrl));
        }
    }

    const __esModule = true ;

    exports.AlwaysOffSampler = AlwaysOffSampler;
    exports.AlwaysOnSampler = AlwaysOnSampler;
    exports.BasicTracerProvider = BasicTracerProvider;
    exports.BatchSpanProcessor = BatchSpanProcessor;
    exports.ConsoleSpanExporter = ConsoleSpanExporter;
    exports.InMemorySpanExporter = InMemorySpanExporter;
    exports.NoopSpanProcessor = NoopSpanProcessor;
    exports.ParentBasedSampler = ParentBasedSampler;
    exports.RandomIdGenerator = RandomIdGenerator;
    exports.SimpleSpanProcessor = SimpleSpanProcessor;
    exports.StackContextManager = StackContextManager;
    exports.TraceIdRatioBasedSampler = TraceIdRatioBasedSampler;
    exports.WebTracerProvider = WebTracerProvider;
    exports.__esModule = __esModule;
    exports.addSpanNetworkEvent = addSpanNetworkEvent;
    exports.addSpanNetworkEvents = addSpanNetworkEvents;
    exports.getElementXPath = getElementXPath;
    exports.getResource = getResource;
    exports.hasKey = hasKey;
    exports.normalizeUrl = normalizeUrl;
    exports.parseUrl = parseUrl;
    exports.shouldPropagateTraceHeaders = shouldPropagateTraceHeaders;
    exports.sortResources = sortResources;

}));
