sap.ui.define(['exports', 'ui5/ecosystem/demo/app/resources/trace-api'], (function (exports, traceApi) { 'use strict';

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
        catch (_a) { } // eslint-disable-line no-empty
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
    var TracesSamplerValues;
    (function (TracesSamplerValues) {
        TracesSamplerValues["AlwaysOff"] = "always_off";
        TracesSamplerValues["AlwaysOn"] = "always_on";
        TracesSamplerValues["ParentBasedAlwaysOff"] = "parentbased_always_off";
        TracesSamplerValues["ParentBasedAlwaysOn"] = "parentbased_always_on";
        TracesSamplerValues["ParentBasedTraceIdRatio"] = "parentbased_traceidratio";
        TracesSamplerValues["TraceIdRatio"] = "traceidratio";
    })(TracesSamplerValues || (TracesSamplerValues = {}));

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
    const DEFAULT_LIST_SEPARATOR = ',';
    /**
     * Environment interface to define all names
     */
    const ENVIRONMENT_BOOLEAN_KEYS = ['OTEL_SDK_DISABLED'];
    function isEnvVarABoolean(key) {
        return (ENVIRONMENT_BOOLEAN_KEYS.indexOf(key) > -1);
    }
    const ENVIRONMENT_NUMBERS_KEYS = [
        'OTEL_BSP_EXPORT_TIMEOUT',
        'OTEL_BSP_MAX_EXPORT_BATCH_SIZE',
        'OTEL_BSP_MAX_QUEUE_SIZE',
        'OTEL_BSP_SCHEDULE_DELAY',
        'OTEL_BLRP_EXPORT_TIMEOUT',
        'OTEL_BLRP_MAX_EXPORT_BATCH_SIZE',
        'OTEL_BLRP_MAX_QUEUE_SIZE',
        'OTEL_BLRP_SCHEDULE_DELAY',
        'OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT',
        'OTEL_ATTRIBUTE_COUNT_LIMIT',
        'OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT',
        'OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT',
        'OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT',
        'OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT',
        'OTEL_SPAN_EVENT_COUNT_LIMIT',
        'OTEL_SPAN_LINK_COUNT_LIMIT',
        'OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT',
        'OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT',
        'OTEL_EXPORTER_OTLP_TIMEOUT',
        'OTEL_EXPORTER_OTLP_TRACES_TIMEOUT',
        'OTEL_EXPORTER_OTLP_METRICS_TIMEOUT',
        'OTEL_EXPORTER_OTLP_LOGS_TIMEOUT',
        'OTEL_EXPORTER_JAEGER_AGENT_PORT',
    ];
    function isEnvVarANumber(key) {
        return (ENVIRONMENT_NUMBERS_KEYS.indexOf(key) > -1);
    }
    const ENVIRONMENT_LISTS_KEYS = [
        'OTEL_NO_PATCH_MODULES',
        'OTEL_PROPAGATORS',
        'OTEL_SEMCONV_STABILITY_OPT_IN',
    ];
    function isEnvVarAList(key) {
        return ENVIRONMENT_LISTS_KEYS.indexOf(key) > -1;
    }
    const DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = Infinity;
    const DEFAULT_ATTRIBUTE_COUNT_LIMIT = 128;
    const DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT = 128;
    const DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT = 128;
    /**
     * Default environment variables
     */
    const DEFAULT_ENVIRONMENT = {
        OTEL_SDK_DISABLED: false,
        CONTAINER_NAME: '',
        ECS_CONTAINER_METADATA_URI_V4: '',
        ECS_CONTAINER_METADATA_URI: '',
        HOSTNAME: '',
        KUBERNETES_SERVICE_HOST: '',
        NAMESPACE: '',
        OTEL_BSP_EXPORT_TIMEOUT: 30000,
        OTEL_BSP_MAX_EXPORT_BATCH_SIZE: 512,
        OTEL_BSP_MAX_QUEUE_SIZE: 2048,
        OTEL_BSP_SCHEDULE_DELAY: 5000,
        OTEL_BLRP_EXPORT_TIMEOUT: 30000,
        OTEL_BLRP_MAX_EXPORT_BATCH_SIZE: 512,
        OTEL_BLRP_MAX_QUEUE_SIZE: 2048,
        OTEL_BLRP_SCHEDULE_DELAY: 5000,
        OTEL_EXPORTER_JAEGER_AGENT_HOST: '',
        OTEL_EXPORTER_JAEGER_AGENT_PORT: 6832,
        OTEL_EXPORTER_JAEGER_ENDPOINT: '',
        OTEL_EXPORTER_JAEGER_PASSWORD: '',
        OTEL_EXPORTER_JAEGER_USER: '',
        OTEL_EXPORTER_OTLP_ENDPOINT: '',
        OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: '',
        OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: '',
        OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: '',
        OTEL_EXPORTER_OTLP_HEADERS: '',
        OTEL_EXPORTER_OTLP_TRACES_HEADERS: '',
        OTEL_EXPORTER_OTLP_METRICS_HEADERS: '',
        OTEL_EXPORTER_OTLP_LOGS_HEADERS: '',
        OTEL_EXPORTER_OTLP_TIMEOUT: 10000,
        OTEL_EXPORTER_OTLP_TRACES_TIMEOUT: 10000,
        OTEL_EXPORTER_OTLP_METRICS_TIMEOUT: 10000,
        OTEL_EXPORTER_OTLP_LOGS_TIMEOUT: 10000,
        OTEL_EXPORTER_ZIPKIN_ENDPOINT: 'http://localhost:9411/api/v2/spans',
        OTEL_LOG_LEVEL: traceApi.DiagLogLevel.INFO,
        OTEL_NO_PATCH_MODULES: [],
        OTEL_PROPAGATORS: ['tracecontext', 'baggage'],
        OTEL_RESOURCE_ATTRIBUTES: '',
        OTEL_SERVICE_NAME: '',
        OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT: DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
        OTEL_ATTRIBUTE_COUNT_LIMIT: DEFAULT_ATTRIBUTE_COUNT_LIMIT,
        OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT: DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
        OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT: DEFAULT_ATTRIBUTE_COUNT_LIMIT,
        OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT: DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
        OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT: DEFAULT_ATTRIBUTE_COUNT_LIMIT,
        OTEL_SPAN_EVENT_COUNT_LIMIT: 128,
        OTEL_SPAN_LINK_COUNT_LIMIT: 128,
        OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT: DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT,
        OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT: DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT,
        OTEL_TRACES_EXPORTER: '',
        OTEL_TRACES_SAMPLER: TracesSamplerValues.ParentBasedAlwaysOn,
        OTEL_TRACES_SAMPLER_ARG: '',
        OTEL_LOGS_EXPORTER: '',
        OTEL_EXPORTER_OTLP_INSECURE: '',
        OTEL_EXPORTER_OTLP_TRACES_INSECURE: '',
        OTEL_EXPORTER_OTLP_METRICS_INSECURE: '',
        OTEL_EXPORTER_OTLP_LOGS_INSECURE: '',
        OTEL_EXPORTER_OTLP_CERTIFICATE: '',
        OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE: '',
        OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE: '',
        OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE: '',
        OTEL_EXPORTER_OTLP_COMPRESSION: '',
        OTEL_EXPORTER_OTLP_TRACES_COMPRESSION: '',
        OTEL_EXPORTER_OTLP_METRICS_COMPRESSION: '',
        OTEL_EXPORTER_OTLP_LOGS_COMPRESSION: '',
        OTEL_EXPORTER_OTLP_CLIENT_KEY: '',
        OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY: '',
        OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY: '',
        OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY: '',
        OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE: '',
        OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE: '',
        OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE: '',
        OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE: '',
        OTEL_EXPORTER_OTLP_PROTOCOL: 'http/protobuf',
        OTEL_EXPORTER_OTLP_TRACES_PROTOCOL: 'http/protobuf',
        OTEL_EXPORTER_OTLP_METRICS_PROTOCOL: 'http/protobuf',
        OTEL_EXPORTER_OTLP_LOGS_PROTOCOL: 'http/protobuf',
        OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: 'cumulative',
        OTEL_SEMCONV_STABILITY_OPT_IN: [],
    };
    /**
     * @param key
     * @param environment
     * @param values
     */
    function parseBoolean(key, environment, values) {
        if (typeof values[key] === 'undefined') {
            return;
        }
        const value = String(values[key]);
        // support case-insensitive "true"
        environment[key] = value.toLowerCase() === 'true';
    }
    /**
     * Parses a variable as number with number validation
     * @param name
     * @param environment
     * @param values
     * @param min
     * @param max
     */
    function parseNumber(name, environment, values, min = -Infinity, max = Infinity) {
        if (typeof values[name] !== 'undefined') {
            const value = Number(values[name]);
            if (!isNaN(value)) {
                if (value < min) {
                    environment[name] = min;
                }
                else if (value > max) {
                    environment[name] = max;
                }
                else {
                    environment[name] = value;
                }
            }
        }
    }
    /**
     * Parses list-like strings from input into output.
     * @param name
     * @param environment
     * @param values
     * @param separator
     */
    function parseStringList(name, output, input, separator = DEFAULT_LIST_SEPARATOR) {
        const givenValue = input[name];
        if (typeof givenValue === 'string') {
            output[name] = givenValue.split(separator).map(v => v.trim());
        }
    }
    // The support string -> DiagLogLevel mappings
    const logLevelMap = {
        ALL: traceApi.DiagLogLevel.ALL,
        VERBOSE: traceApi.DiagLogLevel.VERBOSE,
        DEBUG: traceApi.DiagLogLevel.DEBUG,
        INFO: traceApi.DiagLogLevel.INFO,
        WARN: traceApi.DiagLogLevel.WARN,
        ERROR: traceApi.DiagLogLevel.ERROR,
        NONE: traceApi.DiagLogLevel.NONE,
    };
    /**
     * Environmentally sets log level if valid log level string is provided
     * @param key
     * @param environment
     * @param values
     */
    function setLogLevelFromEnv(key, environment, values) {
        const value = values[key];
        if (typeof value === 'string') {
            const theLevel = logLevelMap[value.toUpperCase()];
            if (theLevel != null) {
                environment[key] = theLevel;
            }
        }
    }
    /**
     * Parses environment values
     * @param values
     */
    function parseEnvironment(values) {
        const environment = {};
        for (const env in DEFAULT_ENVIRONMENT) {
            const key = env;
            switch (key) {
                case 'OTEL_LOG_LEVEL':
                    setLogLevelFromEnv(key, environment, values);
                    break;
                default:
                    if (isEnvVarABoolean(key)) {
                        parseBoolean(key, environment, values);
                    }
                    else if (isEnvVarANumber(key)) {
                        parseNumber(key, environment, values);
                    }
                    else if (isEnvVarAList(key)) {
                        parseStringList(key, environment, values);
                    }
                    else {
                        const value = values[key];
                        if (typeof value !== 'undefined' && value !== null) {
                            environment[key] = String(value);
                        }
                    }
            }
        }
        return environment;
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
    // Updates to this file should also be replicated to @opentelemetry/api too.
    /**
     * - globalThis (New standard)
     * - self (Will return the current window instance for supported browsers)
     * - window (fallback for older browser implementations)
     * - global (NodeJS implementation)
     * - <object> (When all else fails)
     */
    /** only globals that common to node and browsers are allowed */
    // eslint-disable-next-line node/no-unsupported-features/es-builtins, no-undef
    const _globalThis = typeof globalThis === 'object'
        ? globalThis
        : typeof self === 'object'
            ? self
            : typeof window === 'object'
                ? window
                : typeof traceApi.global === 'object'
                    ? traceApi.global
                    : {};

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
     * Gets the environment variables
     */
    function getEnv() {
        const globalEnv = parseEnvironment(_globalThis);
        return Object.assign({}, DEFAULT_ENVIRONMENT, globalEnv);
    }
    function getEnvWithoutDefaults() {
        return parseEnvironment(_globalThis);
    }

    Array(32);

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
    const VERSION$1 = '1.30.1';

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
    const TMP_EXCEPTION_TYPE = 'exception.type';
    const TMP_EXCEPTION_MESSAGE = 'exception.message';
    const TMP_EXCEPTION_STACKTRACE = 'exception.stacktrace';
    const TMP_HTTP_RESPONSE_CONTENT_LENGTH = 'http.response_content_length';
    const TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = 'http.response_content_length_uncompressed';
    /**
     * The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
     *
     * @deprecated Use ATTR_EXCEPTION_TYPE.
     */
    const SEMATTRS_EXCEPTION_TYPE = TMP_EXCEPTION_TYPE;
    /**
     * The exception message.
     *
     * @deprecated Use ATTR_EXCEPTION_MESSAGE.
     */
    const SEMATTRS_EXCEPTION_MESSAGE = TMP_EXCEPTION_MESSAGE;
    /**
     * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
     *
     * @deprecated Use ATTR_EXCEPTION_STACKTRACE.
     */
    const SEMATTRS_EXCEPTION_STACKTRACE = TMP_EXCEPTION_STACKTRACE;
    /**
     * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
     *
     * @deprecated Use ATTR_HTTP_RESPONSE_CONTENT_LENGTH in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
     */
    const SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH = TMP_HTTP_RESPONSE_CONTENT_LENGTH;
    /**
     * The size of the uncompressed response payload body after transport decoding. Not set if transport encoding not used.
     *
     * @deprecated Use ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
     */
    const SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED;

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
    const TMP_PROCESS_RUNTIME_NAME = 'process.runtime.name';
    const TMP_SERVICE_NAME = 'service.name';
    const TMP_TELEMETRY_SDK_NAME = 'telemetry.sdk.name';
    const TMP_TELEMETRY_SDK_LANGUAGE = 'telemetry.sdk.language';
    const TMP_TELEMETRY_SDK_VERSION = 'telemetry.sdk.version';
    /**
     * The name of the runtime of this process. For compiled native binaries, this SHOULD be the name of the compiler.
     *
     * @deprecated Use ATTR_PROCESS_RUNTIME_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
     */
    const SEMRESATTRS_PROCESS_RUNTIME_NAME = TMP_PROCESS_RUNTIME_NAME;
    /**
     * Logical name of the service.
     *
     * Note: MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs MUST fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md#process), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value MUST be set to `unknown_service`.
     *
     * @deprecated Use ATTR_SERVICE_NAME.
     */
    const SEMRESATTRS_SERVICE_NAME = TMP_SERVICE_NAME;
    /**
     * The name of the telemetry SDK as defined above.
     *
     * @deprecated Use ATTR_TELEMETRY_SDK_NAME.
     */
    const SEMRESATTRS_TELEMETRY_SDK_NAME = TMP_TELEMETRY_SDK_NAME;
    /**
     * The language of the telemetry SDK.
     *
     * @deprecated Use ATTR_TELEMETRY_SDK_LANGUAGE.
     */
    const SEMRESATTRS_TELEMETRY_SDK_LANGUAGE = TMP_TELEMETRY_SDK_LANGUAGE;
    /**
     * The version string of the telemetry SDK.
     *
     * @deprecated Use ATTR_TELEMETRY_SDK_VERSION.
     */
    const SEMRESATTRS_TELEMETRY_SDK_VERSION = TMP_TELEMETRY_SDK_VERSION;
    const TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS = 'webjs';
    /**
     * The language of the telemetry SDK.
     *
     * @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS.
     */
    const TELEMETRYSDKLANGUAGEVALUES_WEBJS = TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS;

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
        [SEMRESATTRS_TELEMETRY_SDK_NAME]: 'opentelemetry',
        [SEMRESATTRS_PROCESS_RUNTIME_NAME]: 'browser',
        [SEMRESATTRS_TELEMETRY_SDK_LANGUAGE]: TELEMETRYSDKLANGUAGEVALUES_WEBJS,
        [SEMRESATTRS_TELEMETRY_SDK_VERSION]: VERSION$1,
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
        /**
         * Construct a composite propagator from a list of propagators.
         *
         * @param [config] Configuration object for composite propagator
         */
        constructor(config = {}) {
            var _a;
            this._propagators = (_a = config.propagators) !== null && _a !== undefined ? _a : [];
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
    const getPrototype = overArg(Object.getPrototypeOf, Object);
    const objectProto = Object.prototype;
    const hasOwnProperty = objectProto.hasOwnProperty;
    const symToStringTag = Symbol ? Symbol.toStringTag : undefined;
    const nativeObjectToString = objectProto.toString;
    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
        return function (arg) {
            return func(transform(arg));
        };
    }
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
        const proto = getPrototype(value);
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
        constructor(_callback, _that) {
            this._callback = _callback;
            this._that = _that;
            this._isCalled = false;
            this._deferred = new Deferred();
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
    class Span {
        /**
         * Constructs a new Span instance.
         *
         * @deprecated calling Span constructor directly is not supported. Please use tracer.startSpan.
         * */
        constructor(parentTracer, context, spanName, spanContext, kind, parentSpanId, links = [], startTime, _deprecatedClock, // keeping this argument even though it is unused to ensure backwards compatibility
        attributes) {
            this.attributes = {};
            this.links = [];
            this.events = [];
            this._droppedAttributesCount = 0;
            this._droppedEventsCount = 0;
            this._droppedLinksCount = 0;
            this.status = {
                code: traceApi.SpanStatusCode.UNSET,
            };
            this.endTime = [0, 0];
            this._ended = false;
            this._duration = [-1, -1];
            this.name = spanName;
            this._spanContext = spanContext;
            this.parentSpanId = parentSpanId;
            this.kind = kind;
            this.links = links;
            const now = Date.now();
            this._performanceStartTime = otperformance.now();
            this._performanceOffset =
                now - (this._performanceStartTime + getTimeOrigin());
            this._startTimeProvided = startTime != null;
            this.startTime = this._getTime(startTime !== null && startTime !== undefined ? startTime : now);
            this.resource = parentTracer.resource;
            this.instrumentationLibrary = parentTracer.instrumentationLibrary;
            this._spanLimits = parentTracer.getSpanLimits();
            this._attributeValueLengthLimit =
                this._spanLimits.attributeValueLengthLimit || 0;
            if (attributes != null) {
                this.setAttributes(attributes);
            }
            this._spanProcessor = parentTracer.getActiveSpanProcessor();
            this._spanProcessor.onStart(this, context);
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
            if (Object.keys(this.attributes).length >=
                this._spanLimits.attributeCountLimit &&
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
            if (this._spanLimits.eventCountLimit === 0) {
                traceApi.diag.warn('No events allowed.');
                this._droppedEventsCount++;
                return this;
            }
            if (this.events.length >= this._spanLimits.eventCountLimit) {
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
            this.status = Object.assign({}, status);
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
                attributes[SEMATTRS_EXCEPTION_MESSAGE] = exception;
            }
            else if (exception) {
                if (exception.code) {
                    attributes[SEMATTRS_EXCEPTION_TYPE] = exception.code.toString();
                }
                else if (exception.name) {
                    attributes[SEMATTRS_EXCEPTION_TYPE] = exception.name;
                }
                if (exception.message) {
                    attributes[SEMATTRS_EXCEPTION_MESSAGE] = exception.message;
                }
                if (exception.stack) {
                    attributes[SEMATTRS_EXCEPTION_STACKTRACE] = exception.stack;
                }
            }
            // these are minimum requirements from spec
            if (attributes[SEMATTRS_EXCEPTION_TYPE] ||
                attributes[SEMATTRS_EXCEPTION_MESSAGE]) {
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
                traceApi.diag.warn(`Can not execute the operation on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`);
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
        constructor(config) {
            var _a, _b, _c, _d;
            this._root = config.root;
            if (!this._root) {
                globalErrorHandler(new Error('ParentBasedSampler must have a root sampler configured'));
                this._root = new AlwaysOnSampler();
            }
            this._remoteParentSampled =
                (_a = config.remoteParentSampled) !== null && _a !== undefined ? _a : new AlwaysOnSampler();
            this._remoteParentNotSampled =
                (_b = config.remoteParentNotSampled) !== null && _b !== undefined ? _b : new AlwaysOffSampler();
            this._localParentSampled =
                (_c = config.localParentSampled) !== null && _c !== undefined ? _c : new AlwaysOnSampler();
            this._localParentNotSampled =
                (_d = config.localParentNotSampled) !== null && _d !== undefined ? _d : new AlwaysOffSampler();
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
    const FALLBACK_OTEL_TRACES_SAMPLER = TracesSamplerValues.AlwaysOn;
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
        const env = getEnv();
        return {
            sampler: buildSamplerFromEnv(env),
            forceFlushTimeoutMillis: 30000,
            generalLimits: {
                attributeValueLengthLimit: env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT,
                attributeCountLimit: env.OTEL_ATTRIBUTE_COUNT_LIMIT,
            },
            spanLimits: {
                attributeValueLengthLimit: env.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT,
                attributeCountLimit: env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT,
                linkCountLimit: env.OTEL_SPAN_LINK_COUNT_LIMIT,
                eventCountLimit: env.OTEL_SPAN_EVENT_COUNT_LIMIT,
                attributePerEventCountLimit: env.OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT,
                attributePerLinkCountLimit: env.OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT,
            },
            mergeResourceWithDefaults: true,
        };
    }
    /**
     * Based on environment, builds a sampler, complies with specification.
     * @param environment optional, by default uses getEnv(), but allows passing a value to reuse parsed environment
     */
    function buildSamplerFromEnv(environment = getEnv()) {
        switch (environment.OTEL_TRACES_SAMPLER) {
            case TracesSamplerValues.AlwaysOn:
                return new AlwaysOnSampler();
            case TracesSamplerValues.AlwaysOff:
                return new AlwaysOffSampler();
            case TracesSamplerValues.ParentBasedAlwaysOn:
                return new ParentBasedSampler({
                    root: new AlwaysOnSampler(),
                });
            case TracesSamplerValues.ParentBasedAlwaysOff:
                return new ParentBasedSampler({
                    root: new AlwaysOffSampler(),
                });
            case TracesSamplerValues.TraceIdRatio:
                return new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv(environment));
            case TracesSamplerValues.ParentBasedTraceIdRatio:
                return new ParentBasedSampler({
                    root: new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv(environment)),
                });
            default:
                traceApi.diag.error(`OTEL_TRACES_SAMPLER value "${environment.OTEL_TRACES_SAMPLER} invalid, defaulting to ${FALLBACK_OTEL_TRACES_SAMPLER}".`);
                return new AlwaysOnSampler();
        }
    }
    function getSamplerProbabilityFromEnv(environment) {
        if (environment.OTEL_TRACES_SAMPLER_ARG === undefined ||
            environment.OTEL_TRACES_SAMPLER_ARG === '') {
            traceApi.diag.error(`OTEL_TRACES_SAMPLER_ARG is blank, defaulting to ${DEFAULT_RATIO}.`);
            return DEFAULT_RATIO;
        }
        const probability = Number(environment.OTEL_TRACES_SAMPLER_ARG);
        if (isNaN(probability)) {
            traceApi.diag.error(`OTEL_TRACES_SAMPLER_ARG=${environment.OTEL_TRACES_SAMPLER_ARG} was given, but it is invalid, defaulting to ${DEFAULT_RATIO}.`);
            return DEFAULT_RATIO;
        }
        if (probability < 0 || probability > 1) {
            traceApi.diag.error(`OTEL_TRACES_SAMPLER_ARG=${environment.OTEL_TRACES_SAMPLER_ARG} was given, but it is out of range ([0..1]), defaulting to ${DEFAULT_RATIO}.`);
            return DEFAULT_RATIO;
        }
        return probability;
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const spanLimits = Object.assign({}, userConfig.spanLimits);
        const parsedEnvConfig = getEnvWithoutDefaults();
        /**
         * Reassign span attribute count limit to use first non null value defined by user or use default value
         */
        spanLimits.attributeCountLimit =
            (_f = (_e = (_d = (_b = (_a = userConfig.spanLimits) === null || _a === undefined ? undefined : _a.attributeCountLimit) !== null && _b !== undefined ? _b : (_c = userConfig.generalLimits) === null || _c === undefined ? undefined : _c.attributeCountLimit) !== null && _d !== undefined ? _d : parsedEnvConfig.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT) !== null && _e !== undefined ? _e : parsedEnvConfig.OTEL_ATTRIBUTE_COUNT_LIMIT) !== null && _f !== undefined ? _f : DEFAULT_ATTRIBUTE_COUNT_LIMIT;
        /**
         * Reassign span attribute value length limit to use first non null value defined by user or use default value
         */
        spanLimits.attributeValueLengthLimit =
            (_m = (_l = (_k = (_h = (_g = userConfig.spanLimits) === null || _g === undefined ? undefined : _g.attributeValueLengthLimit) !== null && _h !== undefined ? _h : (_j = userConfig.generalLimits) === null || _j === undefined ? undefined : _j.attributeValueLengthLimit) !== null && _k !== undefined ? _k : parsedEnvConfig.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null && _l !== undefined ? _l : parsedEnvConfig.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null && _m !== undefined ? _m : DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT;
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
        constructor(_exporter, config) {
            this._exporter = _exporter;
            this._isExporting = false;
            this._finishedSpans = [];
            this._droppedSpansCount = 0;
            const env = getEnv();
            this._maxExportBatchSize =
                typeof (config === null || config === undefined ? undefined : config.maxExportBatchSize) === 'number'
                    ? config.maxExportBatchSize
                    : env.OTEL_BSP_MAX_EXPORT_BATCH_SIZE;
            this._maxQueueSize =
                typeof (config === null || config === undefined ? undefined : config.maxQueueSize) === 'number'
                    ? config.maxQueueSize
                    : env.OTEL_BSP_MAX_QUEUE_SIZE;
            this._scheduledDelayMillis =
                typeof (config === null || config === undefined ? undefined : config.scheduledDelayMillis) === 'number'
                    ? config.scheduledDelayMillis
                    : env.OTEL_BSP_SCHEDULE_DELAY;
            this._exportTimeoutMillis =
                typeof (config === null || config === undefined ? undefined : config.exportTimeoutMillis) === 'number'
                    ? config.exportTimeoutMillis
                    : env.OTEL_BSP_EXPORT_TIMEOUT;
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
                        var _a;
                        clearTimeout(timer);
                        if (result.code === ExportResultCode.SUCCESS) {
                            resolve();
                        }
                        else {
                            reject((_a = result.error) !== null && _a !== undefined ? _a : new Error('BatchSpanProcessor: span export failed'));
                        }
                    });
                    let pendingResources = null;
                    for (let i = 0, len = spans.length; i < len; i++) {
                        const span = spans[i];
                        if (span.resource.asyncAttributesPending &&
                            span.resource.waitForAsyncAttributes) {
                            pendingResources !== null && pendingResources !== undefined ? pendingResources : (pendingResources = []);
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
        constructor(_exporter, config) {
            super(_exporter, config);
            this.onInit(config);
        }
        onInit(config) {
            if ((config === null || config === undefined ? undefined : config.disableAutoFlushOnDocumentHide) !== true &&
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
        constructor() {
            /**
             * Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
             * characters corresponding to 128 bits.
             */
            this.generateTraceId = getIdGenerator(TRACE_ID_BYTES);
            /**
             * Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
             * characters corresponding to 64 bits.
             */
            this.generateSpanId = getIdGenerator(SPAN_ID_BYTES);
        }
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
        /**
         * Constructs a new Tracer instance.
         */
        constructor(instrumentationLibrary, config, _tracerProvider) {
            this._tracerProvider = _tracerProvider;
            const localConfig = mergeConfig(config);
            this._sampler = localConfig.sampler;
            this._generalLimits = localConfig.generalLimits;
            this._spanLimits = localConfig.spanLimits;
            this._idGenerator = config.idGenerator || new RandomIdGenerator();
            this.resource = _tracerProvider.resource;
            this.instrumentationLibrary = instrumentationLibrary;
        }
        /**
         * Starts a new Span or returns the default NoopSpan based on the sampling
         * decision.
         */
        startSpan(name, options = {}, context = traceApi.context.active()) {
            var _a, _b, _c;
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
            const parentSpanContext = parentSpan === null || parentSpan === undefined ? undefined : parentSpan.spanContext();
            const spanId = this._idGenerator.generateSpanId();
            let traceId;
            let traceState;
            let parentSpanId;
            if (!parentSpanContext ||
                !traceApi.trace.isSpanContextValid(parentSpanContext)) {
                // New root span.
                traceId = this._idGenerator.generateTraceId();
            }
            else {
                // New child span.
                traceId = parentSpanContext.traceId;
                traceState = parentSpanContext.traceState;
                parentSpanId = parentSpanContext.spanId;
            }
            const spanKind = (_a = options.kind) !== null && _a !== undefined ? _a : traceApi.SpanKind.INTERNAL;
            const links = ((_b = options.links) !== null && _b !== undefined ? _b : []).map(link => {
                return {
                    context: link.context,
                    attributes: sanitizeAttributes(link.attributes),
                };
            });
            const attributes = sanitizeAttributes(options.attributes);
            // make sampling decision
            const samplingResult = this._sampler.shouldSample(context, traceId, name, spanKind, attributes, links);
            traceState = (_c = samplingResult.traceState) !== null && _c !== undefined ? _c : traceState;
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
            const span = new Span(this, context, name, spanContext, spanKind, parentSpanId, links, options.startTime, undefined, initAttributes);
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
            const parentContext = ctx !== null && ctx !== undefined ? ctx : traceApi.context.active();
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
        getActiveSpanProcessor() {
            return this._tracerProvider.getActiveSpanProcessor();
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
    /**
     * A Resource describes the entity for which a signals (metrics or trace) are
     * collected.
     */
    class Resource {
        constructor(
        /**
         * A dictionary of attributes with string keys and values that provide
         * information about the entity as numbers, strings or booleans
         * TODO: Consider to add check/validation on attributes.
         */
        attributes, asyncAttributesPromise) {
            var _a;
            this._attributes = attributes;
            this.asyncAttributesPending = asyncAttributesPromise != null;
            this._syncAttributes = (_a = this._attributes) !== null && _a !== undefined ? _a : {};
            this._asyncAttributesPromise = asyncAttributesPromise === null || asyncAttributesPromise === undefined ? undefined : asyncAttributesPromise.then(asyncAttributes => {
                this._attributes = Object.assign({}, this._attributes, asyncAttributes);
                this.asyncAttributesPending = false;
                return asyncAttributes;
            }, err => {
                traceApi.diag.debug("a resource's async attributes promise rejected: %s", err);
                this.asyncAttributesPending = false;
                return {};
            });
        }
        /**
         * Returns an empty Resource
         */
        static empty() {
            return Resource.EMPTY;
        }
        /**
         * Returns a Resource that identifies the SDK in use.
         */
        static default() {
            return new Resource({
                [SEMRESATTRS_SERVICE_NAME]: defaultServiceName(),
                [SEMRESATTRS_TELEMETRY_SDK_LANGUAGE]: SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_LANGUAGE],
                [SEMRESATTRS_TELEMETRY_SDK_NAME]: SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_NAME],
                [SEMRESATTRS_TELEMETRY_SDK_VERSION]: SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_VERSION],
            });
        }
        get attributes() {
            var _a;
            if (this.asyncAttributesPending) {
                traceApi.diag.error('Accessing resource attributes before async attributes settled');
            }
            return (_a = this._attributes) !== null && _a !== undefined ? _a : {};
        }
        /**
         * Returns a promise that will never be rejected. Resolves when all async attributes have finished being added to
         * this Resource's attributes. This is useful in exporters to block until resource detection
         * has finished.
         */
        async waitForAsyncAttributes() {
            if (this.asyncAttributesPending) {
                await this._asyncAttributesPromise;
            }
        }
        /**
         * Returns a new, merged {@link Resource} by merging the current Resource
         * with the other Resource. In case of a collision, other Resource takes
         * precedence.
         *
         * @param other the Resource that will be merged with this.
         * @returns the newly merged Resource.
         */
        merge(other) {
            var _a;
            if (!other)
                return this;
            // SpanAttributes from other resource overwrite attributes from this resource.
            const mergedSyncAttributes = Object.assign(Object.assign({}, this._syncAttributes), ((_a = other._syncAttributes) !== null && _a !== undefined ? _a : other.attributes));
            if (!this._asyncAttributesPromise &&
                !other._asyncAttributesPromise) {
                return new Resource(mergedSyncAttributes);
            }
            const mergedAttributesPromise = Promise.all([
                this._asyncAttributesPromise,
                other._asyncAttributesPromise,
            ]).then(([thisAsyncAttributes, otherAsyncAttributes]) => {
                var _a;
                return Object.assign(Object.assign(Object.assign(Object.assign({}, this._syncAttributes), thisAsyncAttributes), ((_a = other._syncAttributes) !== null && _a !== undefined ? _a : other.attributes)), otherAsyncAttributes);
            });
            return new Resource(mergedSyncAttributes, mergedAttributesPromise);
        }
    }
    Resource.EMPTY = new Resource({});

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
    exports.ForceFlushState = void 0;
    (function (ForceFlushState) {
        ForceFlushState[ForceFlushState["resolved"] = 0] = "resolved";
        ForceFlushState[ForceFlushState["timeout"] = 1] = "timeout";
        ForceFlushState[ForceFlushState["error"] = 2] = "error";
        ForceFlushState[ForceFlushState["unresolved"] = 3] = "unresolved";
    })(exports.ForceFlushState || (exports.ForceFlushState = {}));
    /**
     * This class represents a basic tracer provider which platform libraries can extend
     */
    class BasicTracerProvider {
        constructor(config = {}) {
            var _a, _b;
            this._registeredSpanProcessors = [];
            this._tracers = new Map();
            const mergedConfig = merge({}, loadDefaultConfig(), reconfigureLimits(config));
            this.resource = (_a = mergedConfig.resource) !== null && _a !== undefined ? _a : Resource.empty();
            if (mergedConfig.mergeResourceWithDefaults) {
                this.resource = Resource.default().merge(this.resource);
            }
            this._config = Object.assign({}, mergedConfig, {
                resource: this.resource,
            });
            if ((_b = config.spanProcessors) === null || _b === undefined ? undefined : _b.length) {
                this._registeredSpanProcessors = [...config.spanProcessors];
                this.activeSpanProcessor = new MultiSpanProcessor(this._registeredSpanProcessors);
            }
            else {
                const defaultExporter = this._buildExporterFromEnv();
                if (defaultExporter !== undefined) {
                    const batchProcessor = new BatchSpanProcessor(defaultExporter);
                    this.activeSpanProcessor = batchProcessor;
                }
                else {
                    this.activeSpanProcessor = new NoopSpanProcessor();
                }
            }
        }
        getTracer(name, version, options) {
            const key = `${name}@${version || ''}:${(options === null || options === undefined ? undefined : options.schemaUrl) || ''}`;
            if (!this._tracers.has(key)) {
                this._tracers.set(key, new Tracer({ name, version, schemaUrl: options === null || options === undefined ? undefined : options.schemaUrl }, this._config, this));
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this._tracers.get(key);
        }
        /**
         * @deprecated please use {@link TracerConfig} spanProcessors property
         * Adds a new {@link SpanProcessor} to this tracer.
         * @param spanProcessor the new SpanProcessor to be added.
         */
        addSpanProcessor(spanProcessor) {
            if (this._registeredSpanProcessors.length === 0) {
                // since we might have enabled by default a batchProcessor, we disable it
                // before adding the new one
                this.activeSpanProcessor
                    .shutdown()
                    .catch(err => traceApi.diag.error('Error while trying to shutdown current span processor', err));
            }
            this._registeredSpanProcessors.push(spanProcessor);
            this.activeSpanProcessor = new MultiSpanProcessor(this._registeredSpanProcessors);
        }
        getActiveSpanProcessor() {
            return this.activeSpanProcessor;
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
            if (config.propagator === undefined) {
                config.propagator = this._buildPropagatorFromEnv();
            }
            if (config.contextManager) {
                traceApi.context.setGlobalContextManager(config.contextManager);
            }
            if (config.propagator) {
                traceApi.propagation.setGlobalPropagator(config.propagator);
            }
        }
        forceFlush() {
            const timeout = this._config.forceFlushTimeoutMillis;
            const promises = this._registeredSpanProcessors.map((spanProcessor) => {
                return new Promise(resolve => {
                    let state;
                    const timeoutInterval = setTimeout(() => {
                        resolve(new Error(`Span processor did not completed within timeout period of ${timeout} ms`));
                        state = exports.ForceFlushState.timeout;
                    }, timeout);
                    spanProcessor
                        .forceFlush()
                        .then(() => {
                        clearTimeout(timeoutInterval);
                        if (state !== exports.ForceFlushState.timeout) {
                            state = exports.ForceFlushState.resolved;
                            resolve(state);
                        }
                    })
                        .catch(error => {
                        clearTimeout(timeoutInterval);
                        state = exports.ForceFlushState.error;
                        resolve(error);
                    });
                });
            });
            return new Promise((resolve, reject) => {
                Promise.all(promises)
                    .then(results => {
                    const errors = results.filter(result => result !== exports.ForceFlushState.resolved);
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
            return this.activeSpanProcessor.shutdown();
        }
        /**
         * TS cannot yet infer the type of this.constructor:
         * https://github.com/Microsoft/TypeScript/issues/3841#issuecomment-337560146
         * There is no need to override either of the getters in your child class.
         * The type of the registered component maps should be the same across all
         * classes in the inheritance tree.
         */
        _getPropagator(name) {
            var _a;
            return (_a = this.constructor._registeredPropagators.get(name)) === null || _a === undefined ? undefined : _a();
        }
        _getSpanExporter(name) {
            var _a;
            return (_a = this.constructor._registeredExporters.get(name)) === null || _a === undefined ? undefined : _a();
        }
        _buildPropagatorFromEnv() {
            // per spec, propagators from env must be deduplicated
            const uniquePropagatorNames = Array.from(new Set(getEnv().OTEL_PROPAGATORS));
            const propagators = uniquePropagatorNames.map(name => {
                const propagator = this._getPropagator(name);
                if (!propagator) {
                    traceApi.diag.warn(`Propagator "${name}" requested through environment variable is unavailable.`);
                }
                return propagator;
            });
            const validPropagators = propagators.reduce((list, item) => {
                if (item) {
                    list.push(item);
                }
                return list;
            }, []);
            if (validPropagators.length === 0) {
                return;
            }
            else if (uniquePropagatorNames.length === 1) {
                return validPropagators[0];
            }
            else {
                return new CompositePropagator({
                    propagators: validPropagators,
                });
            }
        }
        _buildExporterFromEnv() {
            const exporterName = getEnv().OTEL_TRACES_EXPORTER;
            if (exporterName === 'none' || exporterName === '')
                return;
            const exporter = this._getSpanExporter(exporterName);
            if (!exporter) {
                traceApi.diag.error(`Exporter "${exporterName}" requested through environment variable is unavailable.`);
            }
            return exporter;
        }
    }
    BasicTracerProvider._registeredPropagators = new Map([
        ['tracecontext', () => new W3CTraceContextPropagator()],
        ['baggage', () => new W3CBaggagePropagator()],
    ]);
    BasicTracerProvider._registeredExporters = new Map();

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
            var _a;
            return {
                resource: {
                    attributes: span.resource.attributes,
                },
                instrumentationScope: span.instrumentationLibrary,
                traceId: span.spanContext().traceId,
                parentId: span.parentSpanId,
                traceState: (_a = span.spanContext().traceState) === null || _a === undefined ? undefined : _a.serialize(),
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
        constructor() {
            this._finishedSpans = [];
            /**
             * Indicates if the exporter has been "shutdown."
             * When false, exported spans will not be stored in-memory.
             */
            this._stopped = false;
        }
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
        constructor(_exporter) {
            this._exporter = _exporter;
            this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
            this._unresolvedExports = new Set();
        }
        async forceFlush() {
            // await unresolved resources before resolving
            await Promise.all(Array.from(this._unresolvedExports));
            if (this._exporter.forceFlush) {
                await this._exporter.forceFlush();
            }
        }
        onStart(_span, _parentContext) { }
        onEnd(span) {
            var _a, _b;
            if (this._shutdownOnce.isCalled) {
                return;
            }
            if ((span.spanContext().traceFlags & traceApi.TraceFlags.SAMPLED) === 0) {
                return;
            }
            const doExport = () => internal
                ._export(this._exporter, [span])
                .then((result) => {
                var _a;
                if (result.code !== ExportResultCode.SUCCESS) {
                    globalErrorHandler((_a = result.error) !== null && _a !== undefined ? _a : new Error(`SimpleSpanProcessor: span export failed (status ${result})`));
                }
            })
                .catch(error => {
                globalErrorHandler(error);
            });
            // Avoid scheduling a promise to make the behavior more predictable and easier to test
            if (span.resource.asyncAttributesPending) {
                const exportPromise = (_b = (_a = span.resource).waitForAsyncAttributes) === null || _b === undefined ? undefined : _b.call(_a).then(() => {
                    if (exportPromise != null) {
                        this._unresolvedExports.delete(exportPromise);
                    }
                    return doExport();
                }, err => globalErrorHandler(err));
                // store the unresolved exports
                if (exportPromise != null) {
                    this._unresolvedExports.add(exportPromise);
                }
            }
            else {
                void doExport();
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
    /**
     * Stack Context Manager for managing the state in web
     * it doesn't fully support the async calls though
     */
    class StackContextManager {
        constructor() {
            /**
             * whether the context manager is enabled or not
             */
            this._enabled = false;
            /**
             * Keeps the reference to current context
             */
            this._currentContext = traceApi.ROOT_CONTEXT;
        }
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
            if (config.contextManager) {
                throw ('contextManager should be defined in register method not in' +
                    ' constructor');
            }
            if (config.propagator) {
                throw 'propagator should be defined in register method not in constructor';
            }
        }
        /**
         * Register this TracerProvider for use with the OpenTelemetry API.
         * Undefined values may be replaced with defaults, and
         * null values will be skipped.
         *
         * @param config Configuration object for SDK registration
         */
        register(config = {}) {
            if (config.contextManager === undefined) {
                config.contextManager = new StackContextManager();
            }
            if (config.contextManager) {
                config.contextManager.enable();
            }
            super.register(config);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function hasKey(obj, key) {
        return key in obj;
    }
    /**
     * Helper function for starting an event on span based on {@link PerformanceEntries}
     * @param span
     * @param performanceName name of performance entry for time start
     * @param entries
     * @param refPerfName name of performance entry to use for reference
     */
    function addSpanNetworkEvent(span, performanceName, entries, refPerfName) {
        let perfTime = undefined;
        let refTime = undefined;
        if (hasKey(entries, performanceName) &&
            typeof entries[performanceName] === 'number') {
            perfTime = entries[performanceName];
        }
        const refName = refPerfName || exports.PerformanceTimingNames.FETCH_START;
        // Use a reference time which is the earliest possible value so that the performance timings that are earlier should not be added
        // using FETCH START time in case no reference is provided
        if (hasKey(entries, refName) && typeof entries[refName] === 'number') {
            refTime = entries[refName];
        }
        if (perfTime !== undefined && refTime !== undefined && perfTime >= refTime) {
            span.addEvent(performanceName, perfTime);
            return span;
        }
        return undefined;
    }
    /**
     * Helper function for adding network events and content length attributes
     * @param span
     * @param resource
     * @param ignoreNetworkEvents
     */
    function addSpanNetworkEvents(span, resource, ignoreNetworkEvents = false) {
        if (!ignoreNetworkEvents) {
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.FETCH_START, resource);
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.DOMAIN_LOOKUP_START, resource);
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.DOMAIN_LOOKUP_END, resource);
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.CONNECT_START, resource);
            if (hasKey(resource, 'name') &&
                resource['name'].startsWith('https:')) {
                addSpanNetworkEvent(span, exports.PerformanceTimingNames.SECURE_CONNECTION_START, resource);
            }
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.CONNECT_END, resource);
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.REQUEST_START, resource);
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.RESPONSE_START, resource);
            addSpanNetworkEvent(span, exports.PerformanceTimingNames.RESPONSE_END, resource);
        }
        const encodedLength = resource[exports.PerformanceTimingNames.ENCODED_BODY_SIZE];
        if (encodedLength !== undefined) {
            span.setAttribute(SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH, encodedLength);
        }
        const decodedLength = resource[exports.PerformanceTimingNames.DECODED_BODY_SIZE];
        // Spec: Not set if transport encoding not used (in which case encoded and decoded sizes match)
        if (decodedLength !== undefined && encodedLength !== decodedLength) {
            span.setAttribute(SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED, decodedLength);
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
    exports.Span = Span;
    exports.StackContextManager = StackContextManager;
    exports.TraceIdRatioBasedSampler = TraceIdRatioBasedSampler;
    exports.Tracer = Tracer;
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
