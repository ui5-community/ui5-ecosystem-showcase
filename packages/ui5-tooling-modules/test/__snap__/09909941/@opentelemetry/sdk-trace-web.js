sap.ui.define(['exports', 'ui5/ecosystem/demo/app/resources/index3'], (function (exports, index) { 'use strict';

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
    var SUPPRESS_TRACING_KEY = index.src.createContextKey('OpenTelemetry SDK Context Key SUPPRESS_TRACING');
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
    var BAGGAGE_KEY_PAIR_SEPARATOR = '=';
    var BAGGAGE_PROPERTIES_SEPARATOR = ';';
    var BAGGAGE_ITEMS_SEPARATOR = ',';
    // Name of the http header used to propagate the baggage
    var BAGGAGE_HEADER = 'baggage';
    // Maximum number of name-value pairs allowed by w3c spec
    var BAGGAGE_MAX_NAME_VALUE_PAIRS = 180;
    // Maximum number of bytes per a single name-value pair allowed by w3c spec
    var BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = 4096;
    // Maximum total length of all name-value pairs allowed by w3c spec
    var BAGGAGE_MAX_TOTAL_LENGTH = 8192;

    var __read$6 = (this && this.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    function serializeKeyPairs(keyPairs) {
        return keyPairs.reduce(function (hValue, current) {
            var value = "" + hValue + (hValue !== '' ? BAGGAGE_ITEMS_SEPARATOR : '') + current;
            return value.length > BAGGAGE_MAX_TOTAL_LENGTH ? hValue : value;
        }, '');
    }
    function getKeyPairs(baggage) {
        return baggage.getAllEntries().map(function (_a) {
            var _b = __read$6(_a, 2), key = _b[0], value = _b[1];
            var entry = encodeURIComponent(key) + "=" + encodeURIComponent(value.value);
            // include opaque metadata if provided
            // NOTE: we intentionally don't URI-encode the metadata - that responsibility falls on the metadata implementation
            if (value.metadata !== undefined) {
                entry += BAGGAGE_PROPERTIES_SEPARATOR + value.metadata.toString();
            }
            return entry;
        });
    }
    function parsePairKeyValue(entry) {
        var valueProps = entry.split(BAGGAGE_PROPERTIES_SEPARATOR);
        if (valueProps.length <= 0)
            return;
        var keyPairPart = valueProps.shift();
        if (!keyPairPart)
            return;
        var separatorIndex = keyPairPart.indexOf(BAGGAGE_KEY_PAIR_SEPARATOR);
        if (separatorIndex <= 0)
            return;
        var key = decodeURIComponent(keyPairPart.substring(0, separatorIndex).trim());
        var value = decodeURIComponent(keyPairPart.substring(separatorIndex + 1).trim());
        var metadata;
        if (valueProps.length > 0) {
            metadata = index.src.baggageEntryMetadataFromString(valueProps.join(BAGGAGE_PROPERTIES_SEPARATOR));
        }
        return { key: key, value: value, metadata: metadata };
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
    var W3CBaggagePropagator = /** @class */ (function () {
        function W3CBaggagePropagator() {
        }
        W3CBaggagePropagator.prototype.inject = function (context, carrier, setter) {
            var baggage = index.src.propagation.getBaggage(context);
            if (!baggage || isTracingSuppressed(context))
                return;
            var keyPairs = getKeyPairs(baggage)
                .filter(function (pair) {
                return pair.length <= BAGGAGE_MAX_PER_NAME_VALUE_PAIRS;
            })
                .slice(0, BAGGAGE_MAX_NAME_VALUE_PAIRS);
            var headerValue = serializeKeyPairs(keyPairs);
            if (headerValue.length > 0) {
                setter.set(carrier, BAGGAGE_HEADER, headerValue);
            }
        };
        W3CBaggagePropagator.prototype.extract = function (context, carrier, getter) {
            var headerValue = getter.get(carrier, BAGGAGE_HEADER);
            var baggageString = Array.isArray(headerValue)
                ? headerValue.join(BAGGAGE_ITEMS_SEPARATOR)
                : headerValue;
            if (!baggageString)
                return context;
            var baggage = {};
            if (baggageString.length === 0) {
                return context;
            }
            var pairs = baggageString.split(BAGGAGE_ITEMS_SEPARATOR);
            pairs.forEach(function (entry) {
                var keyPair = parsePairKeyValue(entry);
                if (keyPair) {
                    var baggageEntry = { value: keyPair.value };
                    if (keyPair.metadata) {
                        baggageEntry.metadata = keyPair.metadata;
                    }
                    baggage[keyPair.key] = baggageEntry;
                }
            });
            if (Object.entries(baggage).length === 0) {
                return context;
            }
            return index.src.propagation.setBaggage(context, index.src.propagation.createBaggage(baggage));
        };
        W3CBaggagePropagator.prototype.fields = function () {
            return [BAGGAGE_HEADER];
        };
        return W3CBaggagePropagator;
    }());

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
    var __values$4 = (this && this.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    var __read$5 = (this && this.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    function sanitizeAttributes(attributes) {
        var e_1, _a;
        var out = {};
        if (typeof attributes !== 'object' || attributes == null) {
            return out;
        }
        try {
            for (var _b = __values$4(Object.entries(attributes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read$5(_c.value, 2), key = _d[0], val = _d[1];
                if (!isAttributeKey(key)) {
                    index.src.diag.warn("Invalid attribute key: " + key);
                    continue;
                }
                if (!isAttributeValue(val)) {
                    index.src.diag.warn("Invalid attribute value set for key: " + key);
                    continue;
                }
                if (Array.isArray(val)) {
                    out[key] = val.slice();
                }
                else {
                    out[key] = val;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
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
        var e_2, _a;
        var type;
        try {
            for (var arr_1 = __values$4(arr), arr_1_1 = arr_1.next(); !arr_1_1.done; arr_1_1 = arr_1.next()) {
                var element = arr_1_1.value;
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
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (arr_1_1 && !arr_1_1.done && (_a = arr_1.return)) _a.call(arr_1);
            }
            finally { if (e_2) throw e_2.error; }
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
        return function (ex) {
            index.src.diag.error(stringifyException(ex));
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
        var result = {};
        var current = ex;
        while (current !== null) {
            Object.getOwnPropertyNames(current).forEach(function (propertyName) {
                if (result[propertyName])
                    return;
                var value = current[propertyName];
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
    var delegateHandler = loggingErrorHandler();
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

    var DEFAULT_LIST_SEPARATOR = ",";
    var ENVIRONMENT_BOOLEAN_KEYS = ["OTEL_SDK_DISABLED"];
    function isEnvVarABoolean(key) {
      return ENVIRONMENT_BOOLEAN_KEYS.indexOf(key) > -1;
    }
    var ENVIRONMENT_NUMBERS_KEYS = ["OTEL_BSP_EXPORT_TIMEOUT", "OTEL_BSP_MAX_EXPORT_BATCH_SIZE", "OTEL_BSP_MAX_QUEUE_SIZE", "OTEL_BSP_SCHEDULE_DELAY", "OTEL_BLRP_EXPORT_TIMEOUT", "OTEL_BLRP_MAX_EXPORT_BATCH_SIZE", "OTEL_BLRP_MAX_QUEUE_SIZE", "OTEL_BLRP_SCHEDULE_DELAY", "OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT", "OTEL_ATTRIBUTE_COUNT_LIMIT", "OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT", "OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT", "OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT", "OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT", "OTEL_SPAN_EVENT_COUNT_LIMIT", "OTEL_SPAN_LINK_COUNT_LIMIT", "OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT", "OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT", "OTEL_EXPORTER_OTLP_TIMEOUT", "OTEL_EXPORTER_OTLP_TRACES_TIMEOUT", "OTEL_EXPORTER_OTLP_METRICS_TIMEOUT", "OTEL_EXPORTER_OTLP_LOGS_TIMEOUT", "OTEL_EXPORTER_JAEGER_AGENT_PORT"];
    function isEnvVarANumber(key) {
      return ENVIRONMENT_NUMBERS_KEYS.indexOf(key) > -1;
    }
    var ENVIRONMENT_LISTS_KEYS = ["OTEL_NO_PATCH_MODULES", "OTEL_PROPAGATORS"];
    function isEnvVarAList(key) {
      return ENVIRONMENT_LISTS_KEYS.indexOf(key) > -1;
    }
    var DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = Infinity;
    var DEFAULT_ATTRIBUTE_COUNT_LIMIT = 128;
    var DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT = 128;
    var DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT = 128;
    var DEFAULT_ENVIRONMENT = {
      OTEL_SDK_DISABLED: false,
      CONTAINER_NAME: "",
      ECS_CONTAINER_METADATA_URI_V4: "",
      ECS_CONTAINER_METADATA_URI: "",
      HOSTNAME: "",
      KUBERNETES_SERVICE_HOST: "",
      NAMESPACE: "",
      OTEL_BSP_EXPORT_TIMEOUT: 30000,
      OTEL_BSP_MAX_EXPORT_BATCH_SIZE: 512,
      OTEL_BSP_MAX_QUEUE_SIZE: 2048,
      OTEL_BSP_SCHEDULE_DELAY: 5000,
      OTEL_BLRP_EXPORT_TIMEOUT: 30000,
      OTEL_BLRP_MAX_EXPORT_BATCH_SIZE: 512,
      OTEL_BLRP_MAX_QUEUE_SIZE: 2048,
      OTEL_BLRP_SCHEDULE_DELAY: 5000,
      OTEL_EXPORTER_JAEGER_AGENT_HOST: "",
      OTEL_EXPORTER_JAEGER_AGENT_PORT: 6832,
      OTEL_EXPORTER_JAEGER_ENDPOINT: "",
      OTEL_EXPORTER_JAEGER_PASSWORD: "",
      OTEL_EXPORTER_JAEGER_USER: "",
      OTEL_EXPORTER_OTLP_ENDPOINT: "",
      OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: "",
      OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: "",
      OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "",
      OTEL_EXPORTER_OTLP_HEADERS: "",
      OTEL_EXPORTER_OTLP_TRACES_HEADERS: "",
      OTEL_EXPORTER_OTLP_METRICS_HEADERS: "",
      OTEL_EXPORTER_OTLP_LOGS_HEADERS: "",
      OTEL_EXPORTER_OTLP_TIMEOUT: 10000,
      OTEL_EXPORTER_OTLP_TRACES_TIMEOUT: 10000,
      OTEL_EXPORTER_OTLP_METRICS_TIMEOUT: 10000,
      OTEL_EXPORTER_OTLP_LOGS_TIMEOUT: 10000,
      OTEL_EXPORTER_ZIPKIN_ENDPOINT: "http://localhost:9411/api/v2/spans",
      OTEL_LOG_LEVEL: index.src.DiagLogLevel.INFO,
      OTEL_NO_PATCH_MODULES: [],
      OTEL_PROPAGATORS: ["tracecontext", "baggage"],
      OTEL_RESOURCE_ATTRIBUTES: "",
      OTEL_SERVICE_NAME: "",
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
      OTEL_TRACES_EXPORTER: "",
      OTEL_TRACES_SAMPLER: TracesSamplerValues.ParentBasedAlwaysOn,
      OTEL_TRACES_SAMPLER_ARG: "",
      OTEL_LOGS_EXPORTER: "",
      OTEL_EXPORTER_OTLP_INSECURE: "",
      OTEL_EXPORTER_OTLP_TRACES_INSECURE: "",
      OTEL_EXPORTER_OTLP_METRICS_INSECURE: "",
      OTEL_EXPORTER_OTLP_LOGS_INSECURE: "",
      OTEL_EXPORTER_OTLP_CERTIFICATE: "",
      OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE: "",
      OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE: "",
      OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE: "",
      OTEL_EXPORTER_OTLP_COMPRESSION: "",
      OTEL_EXPORTER_OTLP_TRACES_COMPRESSION: "",
      OTEL_EXPORTER_OTLP_METRICS_COMPRESSION: "",
      OTEL_EXPORTER_OTLP_LOGS_COMPRESSION: "",
      OTEL_EXPORTER_OTLP_CLIENT_KEY: "",
      OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY: "",
      OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY: "",
      OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY: "",
      OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE: "",
      OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE: "",
      OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE: "",
      OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE: "",
      OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf",
      OTEL_EXPORTER_OTLP_TRACES_PROTOCOL: "http/protobuf",
      OTEL_EXPORTER_OTLP_METRICS_PROTOCOL: "http/protobuf",
      OTEL_EXPORTER_OTLP_LOGS_PROTOCOL: "http/protobuf",
      OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: "cumulative"
    };
    function parseBoolean(key, environment, values) {
      if (typeof values[key] === "undefined") {
        return;
      }
      var value = String(values[key]);
      environment[key] = value.toLowerCase() === "true";
    }
    function parseNumber(name, environment, values, min, max) {
      if (min === void 0) {
        min = -Infinity;
      }
      if (max === void 0) {
        max = Infinity;
      }
      if (typeof values[name] !== "undefined") {
        var value = Number(values[name]);
        if (!isNaN(value)) {
          if (value < min) {
            environment[name] = min;
          } else if (value > max) {
            environment[name] = max;
          } else {
            environment[name] = value;
          }
        }
      }
    }
    function parseStringList(name, output, input, separator) {
      if (separator === void 0) {
        separator = DEFAULT_LIST_SEPARATOR;
      }
      var givenValue = input[name];
      if (typeof givenValue === "string") {
        output[name] = givenValue.split(separator).map(function (v) {
          return v.trim();
        });
      }
    }
    var logLevelMap = {
      ALL: index.src.DiagLogLevel.ALL,
      VERBOSE: index.src.DiagLogLevel.VERBOSE,
      DEBUG: index.src.DiagLogLevel.DEBUG,
      INFO: index.src.DiagLogLevel.INFO,
      WARN: index.src.DiagLogLevel.WARN,
      ERROR: index.src.DiagLogLevel.ERROR,
      NONE: index.src.DiagLogLevel.NONE
    };
    function setLogLevelFromEnv(key, environment, values) {
      var value = values[key];
      if (typeof value === "string") {
        var theLevel = logLevelMap[value.toUpperCase()];
        if (theLevel != null) {
          environment[key] = theLevel;
        }
      }
    }
    function parseEnvironment(values) {
      var environment = {};
      for (var env in DEFAULT_ENVIRONMENT) {
        var key = env;
        switch (key) {
          case "OTEL_LOG_LEVEL":
            setLogLevelFromEnv(key, environment, values);
            break;
          default:
            if (isEnvVarABoolean(key)) {
              parseBoolean(key, environment, values);
            } else if (isEnvVarANumber(key)) {
              parseNumber(key, environment, values);
            } else if (isEnvVarAList(key)) {
              parseStringList(key, environment, values);
            } else {
              var value = values[key];
              if (typeof value !== "undefined" && value !== null) {
                environment[key] = String(value);
              }
            }
        }
      }
      return environment;
    }

    var global$1 = (typeof global !== "undefined" ? global :
      typeof self !== "undefined" ? self :
      typeof window !== "undefined" ? window : {});

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
    var _globalThis = typeof globalThis === 'object'
        ? globalThis
        : typeof self === 'object'
            ? self
            : typeof window === 'object'
                ? window
                : typeof global$1 === 'object'
                    ? global$1
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
        var globalEnv = parseEnvironment(_globalThis);
        return Object.assign({}, DEFAULT_ENVIRONMENT, globalEnv);
    }
    function getEnvWithoutDefaults() {
        return parseEnvironment(_globalThis);
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
    (this && this.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    (this && this.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };

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
    var otperformance = performance;

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
    var VERSION$1 = '1.26.0';

    var src = {};

    var trace = {};

    var SemanticAttributes = {};

    var utils = {};

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
    Object.defineProperty(utils, "__esModule", { value: true });
    utils.createConstMap = void 0;
    /**
     * Creates a const map from the given values
     * @param values - An array of values to be used as keys and values in the map.
     * @returns A populated version of the map with the values and keys derived from the values.
     */
    /*#__NO_SIDE_EFFECTS__*/
    function createConstMap(values) {
        // eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
        let res = {};
        const len = values.length;
        for (let lp = 0; lp < len; lp++) {
            const val = values[lp];
            if (val) {
                res[String(val).toUpperCase().replace(/[-.]/g, '_')] = val;
            }
        }
        return res;
    }
    utils.createConstMap = createConstMap;

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
    Object.defineProperty(SemanticAttributes, "__esModule", { value: true });
    SemanticAttributes.SEMATTRS_NET_HOST_CARRIER_ICC = SemanticAttributes.SEMATTRS_NET_HOST_CARRIER_MNC = SemanticAttributes.SEMATTRS_NET_HOST_CARRIER_MCC = SemanticAttributes.SEMATTRS_NET_HOST_CARRIER_NAME = SemanticAttributes.SEMATTRS_NET_HOST_CONNECTION_SUBTYPE = SemanticAttributes.SEMATTRS_NET_HOST_CONNECTION_TYPE = SemanticAttributes.SEMATTRS_NET_HOST_NAME = SemanticAttributes.SEMATTRS_NET_HOST_PORT = SemanticAttributes.SEMATTRS_NET_HOST_IP = SemanticAttributes.SEMATTRS_NET_PEER_NAME = SemanticAttributes.SEMATTRS_NET_PEER_PORT = SemanticAttributes.SEMATTRS_NET_PEER_IP = SemanticAttributes.SEMATTRS_NET_TRANSPORT = SemanticAttributes.SEMATTRS_FAAS_INVOKED_REGION = SemanticAttributes.SEMATTRS_FAAS_INVOKED_PROVIDER = SemanticAttributes.SEMATTRS_FAAS_INVOKED_NAME = SemanticAttributes.SEMATTRS_FAAS_COLDSTART = SemanticAttributes.SEMATTRS_FAAS_CRON = SemanticAttributes.SEMATTRS_FAAS_TIME = SemanticAttributes.SEMATTRS_FAAS_DOCUMENT_NAME = SemanticAttributes.SEMATTRS_FAAS_DOCUMENT_TIME = SemanticAttributes.SEMATTRS_FAAS_DOCUMENT_OPERATION = SemanticAttributes.SEMATTRS_FAAS_DOCUMENT_COLLECTION = SemanticAttributes.SEMATTRS_FAAS_EXECUTION = SemanticAttributes.SEMATTRS_FAAS_TRIGGER = SemanticAttributes.SEMATTRS_EXCEPTION_ESCAPED = SemanticAttributes.SEMATTRS_EXCEPTION_STACKTRACE = SemanticAttributes.SEMATTRS_EXCEPTION_MESSAGE = SemanticAttributes.SEMATTRS_EXCEPTION_TYPE = SemanticAttributes.SEMATTRS_DB_SQL_TABLE = SemanticAttributes.SEMATTRS_DB_MONGODB_COLLECTION = SemanticAttributes.SEMATTRS_DB_REDIS_DATABASE_INDEX = SemanticAttributes.SEMATTRS_DB_HBASE_NAMESPACE = SemanticAttributes.SEMATTRS_DB_CASSANDRA_COORDINATOR_DC = SemanticAttributes.SEMATTRS_DB_CASSANDRA_COORDINATOR_ID = SemanticAttributes.SEMATTRS_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT = SemanticAttributes.SEMATTRS_DB_CASSANDRA_IDEMPOTENCE = SemanticAttributes.SEMATTRS_DB_CASSANDRA_TABLE = SemanticAttributes.SEMATTRS_DB_CASSANDRA_CONSISTENCY_LEVEL = SemanticAttributes.SEMATTRS_DB_CASSANDRA_PAGE_SIZE = SemanticAttributes.SEMATTRS_DB_CASSANDRA_KEYSPACE = SemanticAttributes.SEMATTRS_DB_MSSQL_INSTANCE_NAME = SemanticAttributes.SEMATTRS_DB_OPERATION = SemanticAttributes.SEMATTRS_DB_STATEMENT = SemanticAttributes.SEMATTRS_DB_NAME = SemanticAttributes.SEMATTRS_DB_JDBC_DRIVER_CLASSNAME = SemanticAttributes.SEMATTRS_DB_USER = SemanticAttributes.SEMATTRS_DB_CONNECTION_STRING = SemanticAttributes.SEMATTRS_DB_SYSTEM = SemanticAttributes.SEMATTRS_AWS_LAMBDA_INVOKED_ARN = void 0;
    SemanticAttributes.SEMATTRS_MESSAGING_DESTINATION_KIND = SemanticAttributes.SEMATTRS_MESSAGING_DESTINATION = SemanticAttributes.SEMATTRS_MESSAGING_SYSTEM = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_SCANNED_COUNT = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_COUNT = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_TOTAL_SEGMENTS = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_SEGMENT = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_SCAN_FORWARD = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_TABLE_COUNT = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_EXCLUSIVE_START_TABLE = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_SELECT = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_INDEX_NAME = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_ATTRIBUTES_TO_GET = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_LIMIT = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_PROJECTION = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_CONSISTENT_READ = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_ITEM_COLLECTION_METRICS = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_CONSUMED_CAPACITY = SemanticAttributes.SEMATTRS_AWS_DYNAMODB_TABLE_NAMES = SemanticAttributes.SEMATTRS_HTTP_CLIENT_IP = SemanticAttributes.SEMATTRS_HTTP_ROUTE = SemanticAttributes.SEMATTRS_HTTP_SERVER_NAME = SemanticAttributes.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = SemanticAttributes.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH = SemanticAttributes.SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = SemanticAttributes.SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH = SemanticAttributes.SEMATTRS_HTTP_USER_AGENT = SemanticAttributes.SEMATTRS_HTTP_FLAVOR = SemanticAttributes.SEMATTRS_HTTP_STATUS_CODE = SemanticAttributes.SEMATTRS_HTTP_SCHEME = SemanticAttributes.SEMATTRS_HTTP_HOST = SemanticAttributes.SEMATTRS_HTTP_TARGET = SemanticAttributes.SEMATTRS_HTTP_URL = SemanticAttributes.SEMATTRS_HTTP_METHOD = SemanticAttributes.SEMATTRS_CODE_LINENO = SemanticAttributes.SEMATTRS_CODE_FILEPATH = SemanticAttributes.SEMATTRS_CODE_NAMESPACE = SemanticAttributes.SEMATTRS_CODE_FUNCTION = SemanticAttributes.SEMATTRS_THREAD_NAME = SemanticAttributes.SEMATTRS_THREAD_ID = SemanticAttributes.SEMATTRS_ENDUSER_SCOPE = SemanticAttributes.SEMATTRS_ENDUSER_ROLE = SemanticAttributes.SEMATTRS_ENDUSER_ID = SemanticAttributes.SEMATTRS_PEER_SERVICE = void 0;
    SemanticAttributes.DBSYSTEMVALUES_FILEMAKER = SemanticAttributes.DBSYSTEMVALUES_DERBY = SemanticAttributes.DBSYSTEMVALUES_FIREBIRD = SemanticAttributes.DBSYSTEMVALUES_ADABAS = SemanticAttributes.DBSYSTEMVALUES_CACHE = SemanticAttributes.DBSYSTEMVALUES_EDB = SemanticAttributes.DBSYSTEMVALUES_FIRSTSQL = SemanticAttributes.DBSYSTEMVALUES_INGRES = SemanticAttributes.DBSYSTEMVALUES_HANADB = SemanticAttributes.DBSYSTEMVALUES_MAXDB = SemanticAttributes.DBSYSTEMVALUES_PROGRESS = SemanticAttributes.DBSYSTEMVALUES_HSQLDB = SemanticAttributes.DBSYSTEMVALUES_CLOUDSCAPE = SemanticAttributes.DBSYSTEMVALUES_HIVE = SemanticAttributes.DBSYSTEMVALUES_REDSHIFT = SemanticAttributes.DBSYSTEMVALUES_POSTGRESQL = SemanticAttributes.DBSYSTEMVALUES_DB2 = SemanticAttributes.DBSYSTEMVALUES_ORACLE = SemanticAttributes.DBSYSTEMVALUES_MYSQL = SemanticAttributes.DBSYSTEMVALUES_MSSQL = SemanticAttributes.DBSYSTEMVALUES_OTHER_SQL = SemanticAttributes.SemanticAttributes = SemanticAttributes.SEMATTRS_MESSAGE_UNCOMPRESSED_SIZE = SemanticAttributes.SEMATTRS_MESSAGE_COMPRESSED_SIZE = SemanticAttributes.SEMATTRS_MESSAGE_ID = SemanticAttributes.SEMATTRS_MESSAGE_TYPE = SemanticAttributes.SEMATTRS_RPC_JSONRPC_ERROR_MESSAGE = SemanticAttributes.SEMATTRS_RPC_JSONRPC_ERROR_CODE = SemanticAttributes.SEMATTRS_RPC_JSONRPC_REQUEST_ID = SemanticAttributes.SEMATTRS_RPC_JSONRPC_VERSION = SemanticAttributes.SEMATTRS_RPC_GRPC_STATUS_CODE = SemanticAttributes.SEMATTRS_RPC_METHOD = SemanticAttributes.SEMATTRS_RPC_SERVICE = SemanticAttributes.SEMATTRS_RPC_SYSTEM = SemanticAttributes.SEMATTRS_MESSAGING_KAFKA_TOMBSTONE = SemanticAttributes.SEMATTRS_MESSAGING_KAFKA_PARTITION = SemanticAttributes.SEMATTRS_MESSAGING_KAFKA_CLIENT_ID = SemanticAttributes.SEMATTRS_MESSAGING_KAFKA_CONSUMER_GROUP = SemanticAttributes.SEMATTRS_MESSAGING_KAFKA_MESSAGE_KEY = SemanticAttributes.SEMATTRS_MESSAGING_RABBITMQ_ROUTING_KEY = SemanticAttributes.SEMATTRS_MESSAGING_CONSUMER_ID = SemanticAttributes.SEMATTRS_MESSAGING_OPERATION = SemanticAttributes.SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES = SemanticAttributes.SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES = SemanticAttributes.SEMATTRS_MESSAGING_CONVERSATION_ID = SemanticAttributes.SEMATTRS_MESSAGING_MESSAGE_ID = SemanticAttributes.SEMATTRS_MESSAGING_URL = SemanticAttributes.SEMATTRS_MESSAGING_PROTOCOL_VERSION = SemanticAttributes.SEMATTRS_MESSAGING_PROTOCOL = SemanticAttributes.SEMATTRS_MESSAGING_TEMP_DESTINATION = void 0;
    SemanticAttributes.FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD = SemanticAttributes.FaasDocumentOperationValues = SemanticAttributes.FAASDOCUMENTOPERATIONVALUES_DELETE = SemanticAttributes.FAASDOCUMENTOPERATIONVALUES_EDIT = SemanticAttributes.FAASDOCUMENTOPERATIONVALUES_INSERT = SemanticAttributes.FaasTriggerValues = SemanticAttributes.FAASTRIGGERVALUES_OTHER = SemanticAttributes.FAASTRIGGERVALUES_TIMER = SemanticAttributes.FAASTRIGGERVALUES_PUBSUB = SemanticAttributes.FAASTRIGGERVALUES_HTTP = SemanticAttributes.FAASTRIGGERVALUES_DATASOURCE = SemanticAttributes.DbCassandraConsistencyLevelValues = SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL = SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL = SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_ANY = SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE = SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_THREE = SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_TWO = SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_ONE = SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM = SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM = SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM = SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_ALL = SemanticAttributes.DbSystemValues = SemanticAttributes.DBSYSTEMVALUES_COCKROACHDB = SemanticAttributes.DBSYSTEMVALUES_MEMCACHED = SemanticAttributes.DBSYSTEMVALUES_ELASTICSEARCH = SemanticAttributes.DBSYSTEMVALUES_GEODE = SemanticAttributes.DBSYSTEMVALUES_NEO4J = SemanticAttributes.DBSYSTEMVALUES_DYNAMODB = SemanticAttributes.DBSYSTEMVALUES_COSMOSDB = SemanticAttributes.DBSYSTEMVALUES_COUCHDB = SemanticAttributes.DBSYSTEMVALUES_COUCHBASE = SemanticAttributes.DBSYSTEMVALUES_REDIS = SemanticAttributes.DBSYSTEMVALUES_MONGODB = SemanticAttributes.DBSYSTEMVALUES_HBASE = SemanticAttributes.DBSYSTEMVALUES_CASSANDRA = SemanticAttributes.DBSYSTEMVALUES_COLDFUSION = SemanticAttributes.DBSYSTEMVALUES_H2 = SemanticAttributes.DBSYSTEMVALUES_VERTICA = SemanticAttributes.DBSYSTEMVALUES_TERADATA = SemanticAttributes.DBSYSTEMVALUES_SYBASE = SemanticAttributes.DBSYSTEMVALUES_SQLITE = SemanticAttributes.DBSYSTEMVALUES_POINTBASE = SemanticAttributes.DBSYSTEMVALUES_PERVASIVE = SemanticAttributes.DBSYSTEMVALUES_NETEZZA = SemanticAttributes.DBSYSTEMVALUES_MARIADB = SemanticAttributes.DBSYSTEMVALUES_INTERBASE = SemanticAttributes.DBSYSTEMVALUES_INSTANTDB = SemanticAttributes.DBSYSTEMVALUES_INFORMIX = void 0;
    SemanticAttributes.MESSAGINGOPERATIONVALUES_RECEIVE = SemanticAttributes.MessagingDestinationKindValues = SemanticAttributes.MESSAGINGDESTINATIONKINDVALUES_TOPIC = SemanticAttributes.MESSAGINGDESTINATIONKINDVALUES_QUEUE = SemanticAttributes.HttpFlavorValues = SemanticAttributes.HTTPFLAVORVALUES_QUIC = SemanticAttributes.HTTPFLAVORVALUES_SPDY = SemanticAttributes.HTTPFLAVORVALUES_HTTP_2_0 = SemanticAttributes.HTTPFLAVORVALUES_HTTP_1_1 = SemanticAttributes.HTTPFLAVORVALUES_HTTP_1_0 = SemanticAttributes.NetHostConnectionSubtypeValues = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_NR = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_GSM = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_LTE = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_IDEN = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_HSPA = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0 = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_CDMA = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_UMTS = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_EDGE = SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_GPRS = SemanticAttributes.NetHostConnectionTypeValues = SemanticAttributes.NETHOSTCONNECTIONTYPEVALUES_UNKNOWN = SemanticAttributes.NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE = SemanticAttributes.NETHOSTCONNECTIONTYPEVALUES_CELL = SemanticAttributes.NETHOSTCONNECTIONTYPEVALUES_WIRED = SemanticAttributes.NETHOSTCONNECTIONTYPEVALUES_WIFI = SemanticAttributes.NetTransportValues = SemanticAttributes.NETTRANSPORTVALUES_OTHER = SemanticAttributes.NETTRANSPORTVALUES_INPROC = SemanticAttributes.NETTRANSPORTVALUES_PIPE = SemanticAttributes.NETTRANSPORTVALUES_UNIX = SemanticAttributes.NETTRANSPORTVALUES_IP = SemanticAttributes.NETTRANSPORTVALUES_IP_UDP = SemanticAttributes.NETTRANSPORTVALUES_IP_TCP = SemanticAttributes.FaasInvokedProviderValues = SemanticAttributes.FAASINVOKEDPROVIDERVALUES_GCP = SemanticAttributes.FAASINVOKEDPROVIDERVALUES_AZURE = SemanticAttributes.FAASINVOKEDPROVIDERVALUES_AWS = void 0;
    SemanticAttributes.MessageTypeValues = SemanticAttributes.MESSAGETYPEVALUES_RECEIVED = SemanticAttributes.MESSAGETYPEVALUES_SENT = SemanticAttributes.RpcGrpcStatusCodeValues = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_DATA_LOSS = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_UNAVAILABLE = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_INTERNAL = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_ABORTED = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_NOT_FOUND = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_UNKNOWN = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_CANCELLED = SemanticAttributes.RPCGRPCSTATUSCODEVALUES_OK = SemanticAttributes.MessagingOperationValues = SemanticAttributes.MESSAGINGOPERATIONVALUES_PROCESS = void 0;
    const utils_1$1 = utils;
    //----------------------------------------------------------------------------------------------------------
    // DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates//templates/SemanticAttributes.ts.j2
    //----------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------
    // Constant values for SemanticAttributes
    //----------------------------------------------------------------------------------------------------------
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_AWS_LAMBDA_INVOKED_ARN = 'aws.lambda.invoked_arn';
    const TMP_DB_SYSTEM = 'db.system';
    const TMP_DB_CONNECTION_STRING = 'db.connection_string';
    const TMP_DB_USER = 'db.user';
    const TMP_DB_JDBC_DRIVER_CLASSNAME = 'db.jdbc.driver_classname';
    const TMP_DB_NAME = 'db.name';
    const TMP_DB_STATEMENT = 'db.statement';
    const TMP_DB_OPERATION = 'db.operation';
    const TMP_DB_MSSQL_INSTANCE_NAME = 'db.mssql.instance_name';
    const TMP_DB_CASSANDRA_KEYSPACE = 'db.cassandra.keyspace';
    const TMP_DB_CASSANDRA_PAGE_SIZE = 'db.cassandra.page_size';
    const TMP_DB_CASSANDRA_CONSISTENCY_LEVEL = 'db.cassandra.consistency_level';
    const TMP_DB_CASSANDRA_TABLE = 'db.cassandra.table';
    const TMP_DB_CASSANDRA_IDEMPOTENCE = 'db.cassandra.idempotence';
    const TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT = 'db.cassandra.speculative_execution_count';
    const TMP_DB_CASSANDRA_COORDINATOR_ID = 'db.cassandra.coordinator.id';
    const TMP_DB_CASSANDRA_COORDINATOR_DC = 'db.cassandra.coordinator.dc';
    const TMP_DB_HBASE_NAMESPACE = 'db.hbase.namespace';
    const TMP_DB_REDIS_DATABASE_INDEX = 'db.redis.database_index';
    const TMP_DB_MONGODB_COLLECTION = 'db.mongodb.collection';
    const TMP_DB_SQL_TABLE = 'db.sql.table';
    const TMP_EXCEPTION_TYPE = 'exception.type';
    const TMP_EXCEPTION_MESSAGE = 'exception.message';
    const TMP_EXCEPTION_STACKTRACE = 'exception.stacktrace';
    const TMP_EXCEPTION_ESCAPED = 'exception.escaped';
    const TMP_FAAS_TRIGGER = 'faas.trigger';
    const TMP_FAAS_EXECUTION = 'faas.execution';
    const TMP_FAAS_DOCUMENT_COLLECTION = 'faas.document.collection';
    const TMP_FAAS_DOCUMENT_OPERATION = 'faas.document.operation';
    const TMP_FAAS_DOCUMENT_TIME = 'faas.document.time';
    const TMP_FAAS_DOCUMENT_NAME = 'faas.document.name';
    const TMP_FAAS_TIME = 'faas.time';
    const TMP_FAAS_CRON = 'faas.cron';
    const TMP_FAAS_COLDSTART = 'faas.coldstart';
    const TMP_FAAS_INVOKED_NAME = 'faas.invoked_name';
    const TMP_FAAS_INVOKED_PROVIDER = 'faas.invoked_provider';
    const TMP_FAAS_INVOKED_REGION = 'faas.invoked_region';
    const TMP_NET_TRANSPORT = 'net.transport';
    const TMP_NET_PEER_IP = 'net.peer.ip';
    const TMP_NET_PEER_PORT = 'net.peer.port';
    const TMP_NET_PEER_NAME = 'net.peer.name';
    const TMP_NET_HOST_IP = 'net.host.ip';
    const TMP_NET_HOST_PORT = 'net.host.port';
    const TMP_NET_HOST_NAME = 'net.host.name';
    const TMP_NET_HOST_CONNECTION_TYPE = 'net.host.connection.type';
    const TMP_NET_HOST_CONNECTION_SUBTYPE = 'net.host.connection.subtype';
    const TMP_NET_HOST_CARRIER_NAME = 'net.host.carrier.name';
    const TMP_NET_HOST_CARRIER_MCC = 'net.host.carrier.mcc';
    const TMP_NET_HOST_CARRIER_MNC = 'net.host.carrier.mnc';
    const TMP_NET_HOST_CARRIER_ICC = 'net.host.carrier.icc';
    const TMP_PEER_SERVICE = 'peer.service';
    const TMP_ENDUSER_ID = 'enduser.id';
    const TMP_ENDUSER_ROLE = 'enduser.role';
    const TMP_ENDUSER_SCOPE = 'enduser.scope';
    const TMP_THREAD_ID = 'thread.id';
    const TMP_THREAD_NAME = 'thread.name';
    const TMP_CODE_FUNCTION = 'code.function';
    const TMP_CODE_NAMESPACE = 'code.namespace';
    const TMP_CODE_FILEPATH = 'code.filepath';
    const TMP_CODE_LINENO = 'code.lineno';
    const TMP_HTTP_METHOD = 'http.method';
    const TMP_HTTP_URL = 'http.url';
    const TMP_HTTP_TARGET = 'http.target';
    const TMP_HTTP_HOST = 'http.host';
    const TMP_HTTP_SCHEME = 'http.scheme';
    const TMP_HTTP_STATUS_CODE = 'http.status_code';
    const TMP_HTTP_FLAVOR = 'http.flavor';
    const TMP_HTTP_USER_AGENT = 'http.user_agent';
    const TMP_HTTP_REQUEST_CONTENT_LENGTH = 'http.request_content_length';
    const TMP_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = 'http.request_content_length_uncompressed';
    const TMP_HTTP_RESPONSE_CONTENT_LENGTH = 'http.response_content_length';
    const TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = 'http.response_content_length_uncompressed';
    const TMP_HTTP_SERVER_NAME = 'http.server_name';
    const TMP_HTTP_ROUTE = 'http.route';
    const TMP_HTTP_CLIENT_IP = 'http.client_ip';
    const TMP_AWS_DYNAMODB_TABLE_NAMES = 'aws.dynamodb.table_names';
    const TMP_AWS_DYNAMODB_CONSUMED_CAPACITY = 'aws.dynamodb.consumed_capacity';
    const TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS = 'aws.dynamodb.item_collection_metrics';
    const TMP_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY = 'aws.dynamodb.provisioned_read_capacity';
    const TMP_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY = 'aws.dynamodb.provisioned_write_capacity';
    const TMP_AWS_DYNAMODB_CONSISTENT_READ = 'aws.dynamodb.consistent_read';
    const TMP_AWS_DYNAMODB_PROJECTION = 'aws.dynamodb.projection';
    const TMP_AWS_DYNAMODB_LIMIT = 'aws.dynamodb.limit';
    const TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET = 'aws.dynamodb.attributes_to_get';
    const TMP_AWS_DYNAMODB_INDEX_NAME = 'aws.dynamodb.index_name';
    const TMP_AWS_DYNAMODB_SELECT = 'aws.dynamodb.select';
    const TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES = 'aws.dynamodb.global_secondary_indexes';
    const TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES = 'aws.dynamodb.local_secondary_indexes';
    const TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE = 'aws.dynamodb.exclusive_start_table';
    const TMP_AWS_DYNAMODB_TABLE_COUNT = 'aws.dynamodb.table_count';
    const TMP_AWS_DYNAMODB_SCAN_FORWARD = 'aws.dynamodb.scan_forward';
    const TMP_AWS_DYNAMODB_SEGMENT = 'aws.dynamodb.segment';
    const TMP_AWS_DYNAMODB_TOTAL_SEGMENTS = 'aws.dynamodb.total_segments';
    const TMP_AWS_DYNAMODB_COUNT = 'aws.dynamodb.count';
    const TMP_AWS_DYNAMODB_SCANNED_COUNT = 'aws.dynamodb.scanned_count';
    const TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS = 'aws.dynamodb.attribute_definitions';
    const TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES = 'aws.dynamodb.global_secondary_index_updates';
    const TMP_MESSAGING_SYSTEM = 'messaging.system';
    const TMP_MESSAGING_DESTINATION = 'messaging.destination';
    const TMP_MESSAGING_DESTINATION_KIND = 'messaging.destination_kind';
    const TMP_MESSAGING_TEMP_DESTINATION = 'messaging.temp_destination';
    const TMP_MESSAGING_PROTOCOL = 'messaging.protocol';
    const TMP_MESSAGING_PROTOCOL_VERSION = 'messaging.protocol_version';
    const TMP_MESSAGING_URL = 'messaging.url';
    const TMP_MESSAGING_MESSAGE_ID = 'messaging.message_id';
    const TMP_MESSAGING_CONVERSATION_ID = 'messaging.conversation_id';
    const TMP_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES = 'messaging.message_payload_size_bytes';
    const TMP_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES = 'messaging.message_payload_compressed_size_bytes';
    const TMP_MESSAGING_OPERATION = 'messaging.operation';
    const TMP_MESSAGING_CONSUMER_ID = 'messaging.consumer_id';
    const TMP_MESSAGING_RABBITMQ_ROUTING_KEY = 'messaging.rabbitmq.routing_key';
    const TMP_MESSAGING_KAFKA_MESSAGE_KEY = 'messaging.kafka.message_key';
    const TMP_MESSAGING_KAFKA_CONSUMER_GROUP = 'messaging.kafka.consumer_group';
    const TMP_MESSAGING_KAFKA_CLIENT_ID = 'messaging.kafka.client_id';
    const TMP_MESSAGING_KAFKA_PARTITION = 'messaging.kafka.partition';
    const TMP_MESSAGING_KAFKA_TOMBSTONE = 'messaging.kafka.tombstone';
    const TMP_RPC_SYSTEM = 'rpc.system';
    const TMP_RPC_SERVICE = 'rpc.service';
    const TMP_RPC_METHOD = 'rpc.method';
    const TMP_RPC_GRPC_STATUS_CODE = 'rpc.grpc.status_code';
    const TMP_RPC_JSONRPC_VERSION = 'rpc.jsonrpc.version';
    const TMP_RPC_JSONRPC_REQUEST_ID = 'rpc.jsonrpc.request_id';
    const TMP_RPC_JSONRPC_ERROR_CODE = 'rpc.jsonrpc.error_code';
    const TMP_RPC_JSONRPC_ERROR_MESSAGE = 'rpc.jsonrpc.error_message';
    const TMP_MESSAGE_TYPE = 'message.type';
    const TMP_MESSAGE_ID = 'message.id';
    const TMP_MESSAGE_COMPRESSED_SIZE = 'message.compressed_size';
    const TMP_MESSAGE_UNCOMPRESSED_SIZE = 'message.uncompressed_size';
    /**
     * The full invoked ARN as provided on the `Context` passed to the function (`Lambda-Runtime-Invoked-Function-Arn` header on the `/runtime/invocation/next` applicable).
     *
     * Note: This may be different from `faas.id` if an alias is involved.
     *
     * @deprecated use ATTR_AWS_LAMBDA_INVOKED_ARN
     */
    SemanticAttributes.SEMATTRS_AWS_LAMBDA_INVOKED_ARN = TMP_AWS_LAMBDA_INVOKED_ARN;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated use ATTR_DB_SYSTEM
     */
    SemanticAttributes.SEMATTRS_DB_SYSTEM = TMP_DB_SYSTEM;
    /**
     * The connection string used to connect to the database. It is recommended to remove embedded credentials.
     *
     * @deprecated use ATTR_DB_CONNECTION_STRING
     */
    SemanticAttributes.SEMATTRS_DB_CONNECTION_STRING = TMP_DB_CONNECTION_STRING;
    /**
     * Username for accessing the database.
     *
     * @deprecated use ATTR_DB_USER
     */
    SemanticAttributes.SEMATTRS_DB_USER = TMP_DB_USER;
    /**
     * The fully-qualified class name of the [Java Database Connectivity (JDBC)](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/) driver used to connect.
     *
     * @deprecated use ATTR_DB_JDBC_DRIVER_CLASSNAME
     */
    SemanticAttributes.SEMATTRS_DB_JDBC_DRIVER_CLASSNAME = TMP_DB_JDBC_DRIVER_CLASSNAME;
    /**
     * If no [tech-specific attribute](#call-level-attributes-for-specific-technologies) is defined, this attribute is used to report the name of the database being accessed. For commands that switch the database, this should be set to the target database (even if the command fails).
     *
     * Note: In some SQL databases, the database name to be used is called &#34;schema name&#34;.
     *
     * @deprecated use ATTR_DB_NAME
     */
    SemanticAttributes.SEMATTRS_DB_NAME = TMP_DB_NAME;
    /**
     * The database statement being executed.
     *
     * Note: The value may be sanitized to exclude sensitive information.
     *
     * @deprecated use ATTR_DB_STATEMENT
     */
    SemanticAttributes.SEMATTRS_DB_STATEMENT = TMP_DB_STATEMENT;
    /**
     * The name of the operation being executed, e.g. the [MongoDB command name](https://docs.mongodb.com/manual/reference/command/#database-operations) such as `findAndModify`, or the SQL keyword.
     *
     * Note: When setting this to an SQL keyword, it is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if the operation name is provided by the library being instrumented. If the SQL statement has an ambiguous operation, or performs more than one operation, this value may be omitted.
     *
     * @deprecated use ATTR_DB_OPERATION
     */
    SemanticAttributes.SEMATTRS_DB_OPERATION = TMP_DB_OPERATION;
    /**
     * The Microsoft SQL Server [instance name](https://docs.microsoft.com/en-us/sql/connect/jdbc/building-the-connection-url?view=sql-server-ver15) connecting to. This name is used to determine the port of a named instance.
     *
     * Note: If setting a `db.mssql.instance_name`, `net.peer.port` is no longer required (but still recommended if non-standard).
     *
     * @deprecated use ATTR_DB_MSSQL_INSTANCE_NAME
     */
    SemanticAttributes.SEMATTRS_DB_MSSQL_INSTANCE_NAME = TMP_DB_MSSQL_INSTANCE_NAME;
    /**
     * The name of the keyspace being accessed. To be used instead of the generic `db.name` attribute.
     *
     * @deprecated use ATTR_DB_CASSANDRA_KEYSPACE
     */
    SemanticAttributes.SEMATTRS_DB_CASSANDRA_KEYSPACE = TMP_DB_CASSANDRA_KEYSPACE;
    /**
     * The fetch size used for paging, i.e. how many rows will be returned at once.
     *
     * @deprecated use ATTR_DB_CASSANDRA_PAGE_SIZE
     */
    SemanticAttributes.SEMATTRS_DB_CASSANDRA_PAGE_SIZE = TMP_DB_CASSANDRA_PAGE_SIZE;
    /**
     * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
     *
     * @deprecated use ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL
     */
    SemanticAttributes.SEMATTRS_DB_CASSANDRA_CONSISTENCY_LEVEL = TMP_DB_CASSANDRA_CONSISTENCY_LEVEL;
    /**
     * The name of the primary table that the operation is acting upon, including the schema name (if applicable).
     *
     * Note: This mirrors the db.sql.table attribute but references cassandra rather than sql. It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
     *
     * @deprecated use ATTR_DB_CASSANDRA_TABLE
     */
    SemanticAttributes.SEMATTRS_DB_CASSANDRA_TABLE = TMP_DB_CASSANDRA_TABLE;
    /**
     * Whether or not the query is idempotent.
     *
     * @deprecated use ATTR_DB_CASSANDRA_IDEMPOTENCE
     */
    SemanticAttributes.SEMATTRS_DB_CASSANDRA_IDEMPOTENCE = TMP_DB_CASSANDRA_IDEMPOTENCE;
    /**
     * The number of times a query was speculatively executed. Not set or `0` if the query was not executed speculatively.
     *
     * @deprecated use ATTR_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT
     */
    SemanticAttributes.SEMATTRS_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT = TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT;
    /**
     * The ID of the coordinating node for a query.
     *
     * @deprecated use ATTR_DB_CASSANDRA_COORDINATOR_ID
     */
    SemanticAttributes.SEMATTRS_DB_CASSANDRA_COORDINATOR_ID = TMP_DB_CASSANDRA_COORDINATOR_ID;
    /**
     * The data center of the coordinating node for a query.
     *
     * @deprecated use ATTR_DB_CASSANDRA_COORDINATOR_DC
     */
    SemanticAttributes.SEMATTRS_DB_CASSANDRA_COORDINATOR_DC = TMP_DB_CASSANDRA_COORDINATOR_DC;
    /**
     * The [HBase namespace](https://hbase.apache.org/book.html#_namespace) being accessed. To be used instead of the generic `db.name` attribute.
     *
     * @deprecated use ATTR_DB_HBASE_NAMESPACE
     */
    SemanticAttributes.SEMATTRS_DB_HBASE_NAMESPACE = TMP_DB_HBASE_NAMESPACE;
    /**
     * The index of the database being accessed as used in the [`SELECT` command](https://redis.io/commands/select), provided as an integer. To be used instead of the generic `db.name` attribute.
     *
     * @deprecated use ATTR_DB_REDIS_DATABASE_INDEX
     */
    SemanticAttributes.SEMATTRS_DB_REDIS_DATABASE_INDEX = TMP_DB_REDIS_DATABASE_INDEX;
    /**
     * The collection being accessed within the database stated in `db.name`.
     *
     * @deprecated use ATTR_DB_MONGODB_COLLECTION
     */
    SemanticAttributes.SEMATTRS_DB_MONGODB_COLLECTION = TMP_DB_MONGODB_COLLECTION;
    /**
     * The name of the primary table that the operation is acting upon, including the schema name (if applicable).
     *
     * Note: It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
     *
     * @deprecated use ATTR_DB_SQL_TABLE
     */
    SemanticAttributes.SEMATTRS_DB_SQL_TABLE = TMP_DB_SQL_TABLE;
    /**
     * The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
     *
     * @deprecated use ATTR_EXCEPTION_TYPE
     */
    SemanticAttributes.SEMATTRS_EXCEPTION_TYPE = TMP_EXCEPTION_TYPE;
    /**
     * The exception message.
     *
     * @deprecated use ATTR_EXCEPTION_MESSAGE
     */
    SemanticAttributes.SEMATTRS_EXCEPTION_MESSAGE = TMP_EXCEPTION_MESSAGE;
    /**
     * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
     *
     * @deprecated use ATTR_EXCEPTION_STACKTRACE
     */
    SemanticAttributes.SEMATTRS_EXCEPTION_STACKTRACE = TMP_EXCEPTION_STACKTRACE;
    /**
    * SHOULD be set to true if the exception event is recorded at a point where it is known that the exception is escaping the scope of the span.
    *
    * Note: An exception is considered to have escaped (or left) the scope of a span,
    if that span is ended while the exception is still logically &#34;in flight&#34;.
    This may be actually &#34;in flight&#34; in some languages (e.g. if the exception
    is passed to a Context manager&#39;s `__exit__` method in Python) but will
    usually be caught at the point of recording the exception in most languages.

    It is usually not possible to determine at the point where an exception is thrown
    whether it will escape the scope of a span.
    However, it is trivial to know that an exception
    will escape, if one checks for an active exception just before ending the span,
    as done in the [example above](#exception-end-example).

    It follows that an exception may still escape the scope of the span
    even if the `exception.escaped` attribute was not set or set to false,
    since the event might have been recorded at a time where it was not
    clear whether the exception will escape.
    *
    * @deprecated use ATTR_EXCEPTION_ESCAPED
    */
    SemanticAttributes.SEMATTRS_EXCEPTION_ESCAPED = TMP_EXCEPTION_ESCAPED;
    /**
     * Type of the trigger on which the function is executed.
     *
     * @deprecated use ATTR_FAAS_TRIGGER
     */
    SemanticAttributes.SEMATTRS_FAAS_TRIGGER = TMP_FAAS_TRIGGER;
    /**
     * The execution ID of the current function execution.
     *
     * @deprecated use ATTR_FAAS_EXECUTION
     */
    SemanticAttributes.SEMATTRS_FAAS_EXECUTION = TMP_FAAS_EXECUTION;
    /**
     * The name of the source on which the triggering operation was performed. For example, in Cloud Storage or S3 corresponds to the bucket name, and in Cosmos DB to the database name.
     *
     * @deprecated use ATTR_FAAS_DOCUMENT_COLLECTION
     */
    SemanticAttributes.SEMATTRS_FAAS_DOCUMENT_COLLECTION = TMP_FAAS_DOCUMENT_COLLECTION;
    /**
     * Describes the type of the operation that was performed on the data.
     *
     * @deprecated use ATTR_FAAS_DOCUMENT_OPERATION
     */
    SemanticAttributes.SEMATTRS_FAAS_DOCUMENT_OPERATION = TMP_FAAS_DOCUMENT_OPERATION;
    /**
     * A string containing the time when the data was accessed in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
     *
     * @deprecated use ATTR_FAAS_DOCUMENT_TIME
     */
    SemanticAttributes.SEMATTRS_FAAS_DOCUMENT_TIME = TMP_FAAS_DOCUMENT_TIME;
    /**
     * The document name/table subjected to the operation. For example, in Cloud Storage or S3 is the name of the file, and in Cosmos DB the table name.
     *
     * @deprecated use ATTR_FAAS_DOCUMENT_NAME
     */
    SemanticAttributes.SEMATTRS_FAAS_DOCUMENT_NAME = TMP_FAAS_DOCUMENT_NAME;
    /**
     * A string containing the function invocation time in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
     *
     * @deprecated use ATTR_FAAS_TIME
     */
    SemanticAttributes.SEMATTRS_FAAS_TIME = TMP_FAAS_TIME;
    /**
     * A string containing the schedule period as [Cron Expression](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm).
     *
     * @deprecated use ATTR_FAAS_CRON
     */
    SemanticAttributes.SEMATTRS_FAAS_CRON = TMP_FAAS_CRON;
    /**
     * A boolean that is true if the serverless function is executed for the first time (aka cold-start).
     *
     * @deprecated use ATTR_FAAS_COLDSTART
     */
    SemanticAttributes.SEMATTRS_FAAS_COLDSTART = TMP_FAAS_COLDSTART;
    /**
     * The name of the invoked function.
     *
     * Note: SHOULD be equal to the `faas.name` resource attribute of the invoked function.
     *
     * @deprecated use ATTR_FAAS_INVOKED_NAME
     */
    SemanticAttributes.SEMATTRS_FAAS_INVOKED_NAME = TMP_FAAS_INVOKED_NAME;
    /**
     * The cloud provider of the invoked function.
     *
     * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
     *
     * @deprecated use ATTR_FAAS_INVOKED_PROVIDER
     */
    SemanticAttributes.SEMATTRS_FAAS_INVOKED_PROVIDER = TMP_FAAS_INVOKED_PROVIDER;
    /**
     * The cloud region of the invoked function.
     *
     * Note: SHOULD be equal to the `cloud.region` resource attribute of the invoked function.
     *
     * @deprecated use ATTR_FAAS_INVOKED_REGION
     */
    SemanticAttributes.SEMATTRS_FAAS_INVOKED_REGION = TMP_FAAS_INVOKED_REGION;
    /**
     * Transport protocol used. See note below.
     *
     * @deprecated use ATTR_NET_TRANSPORT
     */
    SemanticAttributes.SEMATTRS_NET_TRANSPORT = TMP_NET_TRANSPORT;
    /**
     * Remote address of the peer (dotted decimal for IPv4 or [RFC5952](https://tools.ietf.org/html/rfc5952) for IPv6).
     *
     * @deprecated use ATTR_NET_PEER_IP
     */
    SemanticAttributes.SEMATTRS_NET_PEER_IP = TMP_NET_PEER_IP;
    /**
     * Remote port number.
     *
     * @deprecated use ATTR_NET_PEER_PORT
     */
    SemanticAttributes.SEMATTRS_NET_PEER_PORT = TMP_NET_PEER_PORT;
    /**
     * Remote hostname or similar, see note below.
     *
     * @deprecated use ATTR_NET_PEER_NAME
     */
    SemanticAttributes.SEMATTRS_NET_PEER_NAME = TMP_NET_PEER_NAME;
    /**
     * Like `net.peer.ip` but for the host IP. Useful in case of a multi-IP host.
     *
     * @deprecated use ATTR_NET_HOST_IP
     */
    SemanticAttributes.SEMATTRS_NET_HOST_IP = TMP_NET_HOST_IP;
    /**
     * Like `net.peer.port` but for the host port.
     *
     * @deprecated use ATTR_NET_HOST_PORT
     */
    SemanticAttributes.SEMATTRS_NET_HOST_PORT = TMP_NET_HOST_PORT;
    /**
     * Local hostname or similar, see note below.
     *
     * @deprecated use ATTR_NET_HOST_NAME
     */
    SemanticAttributes.SEMATTRS_NET_HOST_NAME = TMP_NET_HOST_NAME;
    /**
     * The internet connection type currently being used by the host.
     *
     * @deprecated use ATTR_NET_HOST_CONNECTION_TYPE
     */
    SemanticAttributes.SEMATTRS_NET_HOST_CONNECTION_TYPE = TMP_NET_HOST_CONNECTION_TYPE;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated use ATTR_NET_HOST_CONNECTION_SUBTYPE
     */
    SemanticAttributes.SEMATTRS_NET_HOST_CONNECTION_SUBTYPE = TMP_NET_HOST_CONNECTION_SUBTYPE;
    /**
     * The name of the mobile carrier.
     *
     * @deprecated use ATTR_NET_HOST_CARRIER_NAME
     */
    SemanticAttributes.SEMATTRS_NET_HOST_CARRIER_NAME = TMP_NET_HOST_CARRIER_NAME;
    /**
     * The mobile carrier country code.
     *
     * @deprecated use ATTR_NET_HOST_CARRIER_MCC
     */
    SemanticAttributes.SEMATTRS_NET_HOST_CARRIER_MCC = TMP_NET_HOST_CARRIER_MCC;
    /**
     * The mobile carrier network code.
     *
     * @deprecated use ATTR_NET_HOST_CARRIER_MNC
     */
    SemanticAttributes.SEMATTRS_NET_HOST_CARRIER_MNC = TMP_NET_HOST_CARRIER_MNC;
    /**
     * The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
     *
     * @deprecated use ATTR_NET_HOST_CARRIER_ICC
     */
    SemanticAttributes.SEMATTRS_NET_HOST_CARRIER_ICC = TMP_NET_HOST_CARRIER_ICC;
    /**
     * The [`service.name`](../../resource/semantic_conventions/README.md#service) of the remote service. SHOULD be equal to the actual `service.name` resource attribute of the remote service if any.
     *
     * @deprecated use ATTR_PEER_SERVICE
     */
    SemanticAttributes.SEMATTRS_PEER_SERVICE = TMP_PEER_SERVICE;
    /**
     * Username or client_id extracted from the access token or [Authorization](https://tools.ietf.org/html/rfc7235#section-4.2) header in the inbound request from outside the system.
     *
     * @deprecated use ATTR_ENDUSER_ID
     */
    SemanticAttributes.SEMATTRS_ENDUSER_ID = TMP_ENDUSER_ID;
    /**
     * Actual/assumed role the client is making the request under extracted from token or application security context.
     *
     * @deprecated use ATTR_ENDUSER_ROLE
     */
    SemanticAttributes.SEMATTRS_ENDUSER_ROLE = TMP_ENDUSER_ROLE;
    /**
     * Scopes or granted authorities the client currently possesses extracted from token or application security context. The value would come from the scope associated with an [OAuth 2.0 Access Token](https://tools.ietf.org/html/rfc6749#section-3.3) or an attribute value in a [SAML 2.0 Assertion](http://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html).
     *
     * @deprecated use ATTR_ENDUSER_SCOPE
     */
    SemanticAttributes.SEMATTRS_ENDUSER_SCOPE = TMP_ENDUSER_SCOPE;
    /**
     * Current &#34;managed&#34; thread ID (as opposed to OS thread ID).
     *
     * @deprecated use ATTR_THREAD_ID
     */
    SemanticAttributes.SEMATTRS_THREAD_ID = TMP_THREAD_ID;
    /**
     * Current thread name.
     *
     * @deprecated use ATTR_THREAD_NAME
     */
    SemanticAttributes.SEMATTRS_THREAD_NAME = TMP_THREAD_NAME;
    /**
     * The method or function name, or equivalent (usually rightmost part of the code unit&#39;s name).
     *
     * @deprecated use ATTR_CODE_FUNCTION
     */
    SemanticAttributes.SEMATTRS_CODE_FUNCTION = TMP_CODE_FUNCTION;
    /**
     * The &#34;namespace&#34; within which `code.function` is defined. Usually the qualified class or module name, such that `code.namespace` + some separator + `code.function` form a unique identifier for the code unit.
     *
     * @deprecated use ATTR_CODE_NAMESPACE
     */
    SemanticAttributes.SEMATTRS_CODE_NAMESPACE = TMP_CODE_NAMESPACE;
    /**
     * The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).
     *
     * @deprecated use ATTR_CODE_FILEPATH
     */
    SemanticAttributes.SEMATTRS_CODE_FILEPATH = TMP_CODE_FILEPATH;
    /**
     * The line number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
     *
     * @deprecated use ATTR_CODE_LINENO
     */
    SemanticAttributes.SEMATTRS_CODE_LINENO = TMP_CODE_LINENO;
    /**
     * HTTP request method.
     *
     * @deprecated use ATTR_HTTP_METHOD
     */
    SemanticAttributes.SEMATTRS_HTTP_METHOD = TMP_HTTP_METHOD;
    /**
     * Full HTTP request URL in the form `scheme://host[:port]/path?query[#fragment]`. Usually the fragment is not transmitted over HTTP, but if it is known, it should be included nevertheless.
     *
     * Note: `http.url` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case the attribute&#39;s value should be `https://www.example.com/`.
     *
     * @deprecated use ATTR_HTTP_URL
     */
    SemanticAttributes.SEMATTRS_HTTP_URL = TMP_HTTP_URL;
    /**
     * The full request target as passed in a HTTP request line or equivalent.
     *
     * @deprecated use ATTR_HTTP_TARGET
     */
    SemanticAttributes.SEMATTRS_HTTP_TARGET = TMP_HTTP_TARGET;
    /**
     * The value of the [HTTP host header](https://tools.ietf.org/html/rfc7230#section-5.4). An empty Host header should also be reported, see note.
     *
     * Note: When the header is present but empty the attribute SHOULD be set to the empty string. Note that this is a valid situation that is expected in certain cases, according the aforementioned [section of RFC 7230](https://tools.ietf.org/html/rfc7230#section-5.4). When the header is not set the attribute MUST NOT be set.
     *
     * @deprecated use ATTR_HTTP_HOST
     */
    SemanticAttributes.SEMATTRS_HTTP_HOST = TMP_HTTP_HOST;
    /**
     * The URI scheme identifying the used protocol.
     *
     * @deprecated use ATTR_HTTP_SCHEME
     */
    SemanticAttributes.SEMATTRS_HTTP_SCHEME = TMP_HTTP_SCHEME;
    /**
     * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
     *
     * @deprecated use ATTR_HTTP_STATUS_CODE
     */
    SemanticAttributes.SEMATTRS_HTTP_STATUS_CODE = TMP_HTTP_STATUS_CODE;
    /**
     * Kind of HTTP protocol used.
     *
     * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
     *
     * @deprecated use ATTR_HTTP_FLAVOR
     */
    SemanticAttributes.SEMATTRS_HTTP_FLAVOR = TMP_HTTP_FLAVOR;
    /**
     * Value of the [HTTP User-Agent](https://tools.ietf.org/html/rfc7231#section-5.5.3) header sent by the client.
     *
     * @deprecated use ATTR_HTTP_USER_AGENT
     */
    SemanticAttributes.SEMATTRS_HTTP_USER_AGENT = TMP_HTTP_USER_AGENT;
    /**
     * The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
     *
     * @deprecated use ATTR_HTTP_REQUEST_CONTENT_LENGTH
     */
    SemanticAttributes.SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH = TMP_HTTP_REQUEST_CONTENT_LENGTH;
    /**
     * The size of the uncompressed request payload body after transport decoding. Not set if transport encoding not used.
     *
     * @deprecated use ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED
     */
    SemanticAttributes.SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = TMP_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED;
    /**
     * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
     *
     * @deprecated use ATTR_HTTP_RESPONSE_CONTENT_LENGTH
     */
    SemanticAttributes.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH = TMP_HTTP_RESPONSE_CONTENT_LENGTH;
    /**
     * The size of the uncompressed response payload body after transport decoding. Not set if transport encoding not used.
     *
     * @deprecated use ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED
     */
    SemanticAttributes.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED;
    /**
     * The primary server name of the matched virtual host. This should be obtained via configuration. If no such configuration can be obtained, this attribute MUST NOT be set ( `net.host.name` should be used instead).
     *
     * Note: `http.url` is usually not readily available on the server side but would have to be assembled in a cumbersome and sometimes lossy process from other information (see e.g. open-telemetry/opentelemetry-python/pull/148). It is thus preferred to supply the raw data that is available.
     *
     * @deprecated use ATTR_HTTP_SERVER_NAME
     */
    SemanticAttributes.SEMATTRS_HTTP_SERVER_NAME = TMP_HTTP_SERVER_NAME;
    /**
     * The matched route (path template).
     *
     * @deprecated use ATTR_HTTP_ROUTE
     */
    SemanticAttributes.SEMATTRS_HTTP_ROUTE = TMP_HTTP_ROUTE;
    /**
    * The IP address of the original client behind all proxies, if known (e.g. from [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)).
    *
    * Note: This is not necessarily the same as `net.peer.ip`, which would
    identify the network-level peer, which may be a proxy.

    This attribute should be set when a source of information different
    from the one used for `net.peer.ip`, is available even if that other
    source just confirms the same value as `net.peer.ip`.
    Rationale: For `net.peer.ip`, one typically does not know if it
    comes from a proxy, reverse proxy, or the actual client. Setting
    `http.client_ip` when it&#39;s the same as `net.peer.ip` means that
    one is at least somewhat confident that the address is not that of
    the closest proxy.
    *
    * @deprecated use ATTR_HTTP_CLIENT_IP
    */
    SemanticAttributes.SEMATTRS_HTTP_CLIENT_IP = TMP_HTTP_CLIENT_IP;
    /**
     * The keys in the `RequestItems` object field.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_TABLE_NAMES
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_TABLE_NAMES = TMP_AWS_DYNAMODB_TABLE_NAMES;
    /**
     * The JSON-serialized value of each item in the `ConsumedCapacity` response field.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_CONSUMED_CAPACITY
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_CONSUMED_CAPACITY = TMP_AWS_DYNAMODB_CONSUMED_CAPACITY;
    /**
     * The JSON-serialized value of the `ItemCollectionMetrics` response field.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_ITEM_COLLECTION_METRICS
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_ITEM_COLLECTION_METRICS = TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS;
    /**
     * The value of the `ProvisionedThroughput.ReadCapacityUnits` request parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY = TMP_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY;
    /**
     * The value of the `ProvisionedThroughput.WriteCapacityUnits` request parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY = TMP_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY;
    /**
     * The value of the `ConsistentRead` request parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_CONSISTENT_READ
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_CONSISTENT_READ = TMP_AWS_DYNAMODB_CONSISTENT_READ;
    /**
     * The value of the `ProjectionExpression` request parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_PROJECTION
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_PROJECTION = TMP_AWS_DYNAMODB_PROJECTION;
    /**
     * The value of the `Limit` request parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_LIMIT
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_LIMIT = TMP_AWS_DYNAMODB_LIMIT;
    /**
     * The value of the `AttributesToGet` request parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_ATTRIBUTES_TO_GET
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_ATTRIBUTES_TO_GET = TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET;
    /**
     * The value of the `IndexName` request parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_INDEX_NAME
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_INDEX_NAME = TMP_AWS_DYNAMODB_INDEX_NAME;
    /**
     * The value of the `Select` request parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_SELECT
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_SELECT = TMP_AWS_DYNAMODB_SELECT;
    /**
     * The JSON-serialized value of each item of the `GlobalSecondaryIndexes` request field.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES = TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES;
    /**
     * The JSON-serialized value of each item of the `LocalSecondaryIndexes` request field.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES = TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES;
    /**
     * The value of the `ExclusiveStartTableName` request parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_EXCLUSIVE_START_TABLE
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_EXCLUSIVE_START_TABLE = TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE;
    /**
     * The the number of items in the `TableNames` response parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_TABLE_COUNT
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_TABLE_COUNT = TMP_AWS_DYNAMODB_TABLE_COUNT;
    /**
     * The value of the `ScanIndexForward` request parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_SCAN_FORWARD
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_SCAN_FORWARD = TMP_AWS_DYNAMODB_SCAN_FORWARD;
    /**
     * The value of the `Segment` request parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_SEGMENT
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_SEGMENT = TMP_AWS_DYNAMODB_SEGMENT;
    /**
     * The value of the `TotalSegments` request parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_TOTAL_SEGMENTS
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_TOTAL_SEGMENTS = TMP_AWS_DYNAMODB_TOTAL_SEGMENTS;
    /**
     * The value of the `Count` response parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_COUNT
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_COUNT = TMP_AWS_DYNAMODB_COUNT;
    /**
     * The value of the `ScannedCount` response parameter.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_SCANNED_COUNT
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_SCANNED_COUNT = TMP_AWS_DYNAMODB_SCANNED_COUNT;
    /**
     * The JSON-serialized value of each item in the `AttributeDefinitions` request field.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS = TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS;
    /**
     * The JSON-serialized value of each item in the the `GlobalSecondaryIndexUpdates` request field.
     *
     * @deprecated use ATTR_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES
     */
    SemanticAttributes.SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES = TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES;
    /**
     * A string identifying the messaging system.
     *
     * @deprecated use ATTR_MESSAGING_SYSTEM
     */
    SemanticAttributes.SEMATTRS_MESSAGING_SYSTEM = TMP_MESSAGING_SYSTEM;
    /**
     * The message destination name. This might be equal to the span name but is required nevertheless.
     *
     * @deprecated use ATTR_MESSAGING_DESTINATION
     */
    SemanticAttributes.SEMATTRS_MESSAGING_DESTINATION = TMP_MESSAGING_DESTINATION;
    /**
     * The kind of message destination.
     *
     * @deprecated use ATTR_MESSAGING_DESTINATION_KIND
     */
    SemanticAttributes.SEMATTRS_MESSAGING_DESTINATION_KIND = TMP_MESSAGING_DESTINATION_KIND;
    /**
     * A boolean that is true if the message destination is temporary.
     *
     * @deprecated use ATTR_MESSAGING_TEMP_DESTINATION
     */
    SemanticAttributes.SEMATTRS_MESSAGING_TEMP_DESTINATION = TMP_MESSAGING_TEMP_DESTINATION;
    /**
     * The name of the transport protocol.
     *
     * @deprecated use ATTR_MESSAGING_PROTOCOL
     */
    SemanticAttributes.SEMATTRS_MESSAGING_PROTOCOL = TMP_MESSAGING_PROTOCOL;
    /**
     * The version of the transport protocol.
     *
     * @deprecated use ATTR_MESSAGING_PROTOCOL_VERSION
     */
    SemanticAttributes.SEMATTRS_MESSAGING_PROTOCOL_VERSION = TMP_MESSAGING_PROTOCOL_VERSION;
    /**
     * Connection string.
     *
     * @deprecated use ATTR_MESSAGING_URL
     */
    SemanticAttributes.SEMATTRS_MESSAGING_URL = TMP_MESSAGING_URL;
    /**
     * A value used by the messaging system as an identifier for the message, represented as a string.
     *
     * @deprecated use ATTR_MESSAGING_MESSAGE_ID
     */
    SemanticAttributes.SEMATTRS_MESSAGING_MESSAGE_ID = TMP_MESSAGING_MESSAGE_ID;
    /**
     * The [conversation ID](#conversations) identifying the conversation to which the message belongs, represented as a string. Sometimes called &#34;Correlation ID&#34;.
     *
     * @deprecated use ATTR_MESSAGING_CONVERSATION_ID
     */
    SemanticAttributes.SEMATTRS_MESSAGING_CONVERSATION_ID = TMP_MESSAGING_CONVERSATION_ID;
    /**
     * The (uncompressed) size of the message payload in bytes. Also use this attribute if it is unknown whether the compressed or uncompressed payload size is reported.
     *
     * @deprecated use ATTR_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES
     */
    SemanticAttributes.SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES = TMP_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES;
    /**
     * The compressed size of the message payload in bytes.
     *
     * @deprecated use ATTR_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES
     */
    SemanticAttributes.SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES = TMP_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES;
    /**
     * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
     *
     * @deprecated use ATTR_MESSAGING_OPERATION
     */
    SemanticAttributes.SEMATTRS_MESSAGING_OPERATION = TMP_MESSAGING_OPERATION;
    /**
     * The identifier for the consumer receiving a message. For Kafka, set it to `{messaging.kafka.consumer_group} - {messaging.kafka.client_id}`, if both are present, or only `messaging.kafka.consumer_group`. For brokers, such as RabbitMQ and Artemis, set it to the `client_id` of the client consuming the message.
     *
     * @deprecated use ATTR_MESSAGING_CONSUMER_ID
     */
    SemanticAttributes.SEMATTRS_MESSAGING_CONSUMER_ID = TMP_MESSAGING_CONSUMER_ID;
    /**
     * RabbitMQ message routing key.
     *
     * @deprecated use ATTR_MESSAGING_RABBITMQ_ROUTING_KEY
     */
    SemanticAttributes.SEMATTRS_MESSAGING_RABBITMQ_ROUTING_KEY = TMP_MESSAGING_RABBITMQ_ROUTING_KEY;
    /**
     * Message keys in Kafka are used for grouping alike messages to ensure they&#39;re processed on the same partition. They differ from `messaging.message_id` in that they&#39;re not unique. If the key is `null`, the attribute MUST NOT be set.
     *
     * Note: If the key type is not string, it&#39;s string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don&#39;t include its value.
     *
     * @deprecated use ATTR_MESSAGING_KAFKA_MESSAGE_KEY
     */
    SemanticAttributes.SEMATTRS_MESSAGING_KAFKA_MESSAGE_KEY = TMP_MESSAGING_KAFKA_MESSAGE_KEY;
    /**
     * Name of the Kafka Consumer Group that is handling the message. Only applies to consumers, not producers.
     *
     * @deprecated use ATTR_MESSAGING_KAFKA_CONSUMER_GROUP
     */
    SemanticAttributes.SEMATTRS_MESSAGING_KAFKA_CONSUMER_GROUP = TMP_MESSAGING_KAFKA_CONSUMER_GROUP;
    /**
     * Client Id for the Consumer or Producer that is handling the message.
     *
     * @deprecated use ATTR_MESSAGING_KAFKA_CLIENT_ID
     */
    SemanticAttributes.SEMATTRS_MESSAGING_KAFKA_CLIENT_ID = TMP_MESSAGING_KAFKA_CLIENT_ID;
    /**
     * Partition the message is sent to.
     *
     * @deprecated use ATTR_MESSAGING_KAFKA_PARTITION
     */
    SemanticAttributes.SEMATTRS_MESSAGING_KAFKA_PARTITION = TMP_MESSAGING_KAFKA_PARTITION;
    /**
     * A boolean that is true if the message is a tombstone.
     *
     * @deprecated use ATTR_MESSAGING_KAFKA_TOMBSTONE
     */
    SemanticAttributes.SEMATTRS_MESSAGING_KAFKA_TOMBSTONE = TMP_MESSAGING_KAFKA_TOMBSTONE;
    /**
     * A string identifying the remoting system.
     *
     * @deprecated use ATTR_RPC_SYSTEM
     */
    SemanticAttributes.SEMATTRS_RPC_SYSTEM = TMP_RPC_SYSTEM;
    /**
     * The full (logical) name of the service being called, including its package name, if applicable.
     *
     * Note: This is the logical name of the service from the RPC interface perspective, which can be different from the name of any implementing class. The `code.namespace` attribute may be used to store the latter (despite the attribute name, it may include a class name; e.g., class with method actually executing the call on the server side, RPC client stub class on the client side).
     *
     * @deprecated use ATTR_RPC_SERVICE
     */
    SemanticAttributes.SEMATTRS_RPC_SERVICE = TMP_RPC_SERVICE;
    /**
     * The name of the (logical) method being called, must be equal to the $method part in the span name.
     *
     * Note: This is the logical name of the method from the RPC interface perspective, which can be different from the name of any implementing method/function. The `code.function` attribute may be used to store the latter (e.g., method actually executing the call on the server side, RPC client stub method on the client side).
     *
     * @deprecated use ATTR_RPC_METHOD
     */
    SemanticAttributes.SEMATTRS_RPC_METHOD = TMP_RPC_METHOD;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated use ATTR_RPC_GRPC_STATUS_CODE
     */
    SemanticAttributes.SEMATTRS_RPC_GRPC_STATUS_CODE = TMP_RPC_GRPC_STATUS_CODE;
    /**
     * Protocol version as in `jsonrpc` property of request/response. Since JSON-RPC 1.0 does not specify this, the value can be omitted.
     *
     * @deprecated use ATTR_RPC_JSONRPC_VERSION
     */
    SemanticAttributes.SEMATTRS_RPC_JSONRPC_VERSION = TMP_RPC_JSONRPC_VERSION;
    /**
     * `id` property of request or response. Since protocol allows id to be int, string, `null` or missing (for notifications), value is expected to be cast to string for simplicity. Use empty string in case of `null` value. Omit entirely if this is a notification.
     *
     * @deprecated use ATTR_RPC_JSONRPC_REQUEST_ID
     */
    SemanticAttributes.SEMATTRS_RPC_JSONRPC_REQUEST_ID = TMP_RPC_JSONRPC_REQUEST_ID;
    /**
     * `error.code` property of response if it is an error response.
     *
     * @deprecated use ATTR_RPC_JSONRPC_ERROR_CODE
     */
    SemanticAttributes.SEMATTRS_RPC_JSONRPC_ERROR_CODE = TMP_RPC_JSONRPC_ERROR_CODE;
    /**
     * `error.message` property of response if it is an error response.
     *
     * @deprecated use ATTR_RPC_JSONRPC_ERROR_MESSAGE
     */
    SemanticAttributes.SEMATTRS_RPC_JSONRPC_ERROR_MESSAGE = TMP_RPC_JSONRPC_ERROR_MESSAGE;
    /**
     * Whether this is a received or sent message.
     *
     * @deprecated use ATTR_MESSAGE_TYPE
     */
    SemanticAttributes.SEMATTRS_MESSAGE_TYPE = TMP_MESSAGE_TYPE;
    /**
     * MUST be calculated as two different counters starting from `1` one for sent messages and one for received message.
     *
     * Note: This way we guarantee that the values will be consistent between different implementations.
     *
     * @deprecated use ATTR_MESSAGE_ID
     */
    SemanticAttributes.SEMATTRS_MESSAGE_ID = TMP_MESSAGE_ID;
    /**
     * Compressed size of the message in bytes.
     *
     * @deprecated use ATTR_MESSAGE_COMPRESSED_SIZE
     */
    SemanticAttributes.SEMATTRS_MESSAGE_COMPRESSED_SIZE = TMP_MESSAGE_COMPRESSED_SIZE;
    /**
     * Uncompressed size of the message in bytes.
     *
     * @deprecated use ATTR_MESSAGE_UNCOMPRESSED_SIZE
     */
    SemanticAttributes.SEMATTRS_MESSAGE_UNCOMPRESSED_SIZE = TMP_MESSAGE_UNCOMPRESSED_SIZE;
    /**
     * Create exported Value Map for SemanticAttributes values
     * @deprecated Use the SEMATTRS_XXXXX constants rather than the SemanticAttributes.XXXXX for bundle minification
     */
    SemanticAttributes.SemanticAttributes = 
    /*#__PURE__*/ (0, utils_1$1.createConstMap)([
        TMP_AWS_LAMBDA_INVOKED_ARN,
        TMP_DB_SYSTEM,
        TMP_DB_CONNECTION_STRING,
        TMP_DB_USER,
        TMP_DB_JDBC_DRIVER_CLASSNAME,
        TMP_DB_NAME,
        TMP_DB_STATEMENT,
        TMP_DB_OPERATION,
        TMP_DB_MSSQL_INSTANCE_NAME,
        TMP_DB_CASSANDRA_KEYSPACE,
        TMP_DB_CASSANDRA_PAGE_SIZE,
        TMP_DB_CASSANDRA_CONSISTENCY_LEVEL,
        TMP_DB_CASSANDRA_TABLE,
        TMP_DB_CASSANDRA_IDEMPOTENCE,
        TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT,
        TMP_DB_CASSANDRA_COORDINATOR_ID,
        TMP_DB_CASSANDRA_COORDINATOR_DC,
        TMP_DB_HBASE_NAMESPACE,
        TMP_DB_REDIS_DATABASE_INDEX,
        TMP_DB_MONGODB_COLLECTION,
        TMP_DB_SQL_TABLE,
        TMP_EXCEPTION_TYPE,
        TMP_EXCEPTION_MESSAGE,
        TMP_EXCEPTION_STACKTRACE,
        TMP_EXCEPTION_ESCAPED,
        TMP_FAAS_TRIGGER,
        TMP_FAAS_EXECUTION,
        TMP_FAAS_DOCUMENT_COLLECTION,
        TMP_FAAS_DOCUMENT_OPERATION,
        TMP_FAAS_DOCUMENT_TIME,
        TMP_FAAS_DOCUMENT_NAME,
        TMP_FAAS_TIME,
        TMP_FAAS_CRON,
        TMP_FAAS_COLDSTART,
        TMP_FAAS_INVOKED_NAME,
        TMP_FAAS_INVOKED_PROVIDER,
        TMP_FAAS_INVOKED_REGION,
        TMP_NET_TRANSPORT,
        TMP_NET_PEER_IP,
        TMP_NET_PEER_PORT,
        TMP_NET_PEER_NAME,
        TMP_NET_HOST_IP,
        TMP_NET_HOST_PORT,
        TMP_NET_HOST_NAME,
        TMP_NET_HOST_CONNECTION_TYPE,
        TMP_NET_HOST_CONNECTION_SUBTYPE,
        TMP_NET_HOST_CARRIER_NAME,
        TMP_NET_HOST_CARRIER_MCC,
        TMP_NET_HOST_CARRIER_MNC,
        TMP_NET_HOST_CARRIER_ICC,
        TMP_PEER_SERVICE,
        TMP_ENDUSER_ID,
        TMP_ENDUSER_ROLE,
        TMP_ENDUSER_SCOPE,
        TMP_THREAD_ID,
        TMP_THREAD_NAME,
        TMP_CODE_FUNCTION,
        TMP_CODE_NAMESPACE,
        TMP_CODE_FILEPATH,
        TMP_CODE_LINENO,
        TMP_HTTP_METHOD,
        TMP_HTTP_URL,
        TMP_HTTP_TARGET,
        TMP_HTTP_HOST,
        TMP_HTTP_SCHEME,
        TMP_HTTP_STATUS_CODE,
        TMP_HTTP_FLAVOR,
        TMP_HTTP_USER_AGENT,
        TMP_HTTP_REQUEST_CONTENT_LENGTH,
        TMP_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
        TMP_HTTP_RESPONSE_CONTENT_LENGTH,
        TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
        TMP_HTTP_SERVER_NAME,
        TMP_HTTP_ROUTE,
        TMP_HTTP_CLIENT_IP,
        TMP_AWS_DYNAMODB_TABLE_NAMES,
        TMP_AWS_DYNAMODB_CONSUMED_CAPACITY,
        TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS,
        TMP_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY,
        TMP_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY,
        TMP_AWS_DYNAMODB_CONSISTENT_READ,
        TMP_AWS_DYNAMODB_PROJECTION,
        TMP_AWS_DYNAMODB_LIMIT,
        TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET,
        TMP_AWS_DYNAMODB_INDEX_NAME,
        TMP_AWS_DYNAMODB_SELECT,
        TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES,
        TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES,
        TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE,
        TMP_AWS_DYNAMODB_TABLE_COUNT,
        TMP_AWS_DYNAMODB_SCAN_FORWARD,
        TMP_AWS_DYNAMODB_SEGMENT,
        TMP_AWS_DYNAMODB_TOTAL_SEGMENTS,
        TMP_AWS_DYNAMODB_COUNT,
        TMP_AWS_DYNAMODB_SCANNED_COUNT,
        TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS,
        TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES,
        TMP_MESSAGING_SYSTEM,
        TMP_MESSAGING_DESTINATION,
        TMP_MESSAGING_DESTINATION_KIND,
        TMP_MESSAGING_TEMP_DESTINATION,
        TMP_MESSAGING_PROTOCOL,
        TMP_MESSAGING_PROTOCOL_VERSION,
        TMP_MESSAGING_URL,
        TMP_MESSAGING_MESSAGE_ID,
        TMP_MESSAGING_CONVERSATION_ID,
        TMP_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES,
        TMP_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES,
        TMP_MESSAGING_OPERATION,
        TMP_MESSAGING_CONSUMER_ID,
        TMP_MESSAGING_RABBITMQ_ROUTING_KEY,
        TMP_MESSAGING_KAFKA_MESSAGE_KEY,
        TMP_MESSAGING_KAFKA_CONSUMER_GROUP,
        TMP_MESSAGING_KAFKA_CLIENT_ID,
        TMP_MESSAGING_KAFKA_PARTITION,
        TMP_MESSAGING_KAFKA_TOMBSTONE,
        TMP_RPC_SYSTEM,
        TMP_RPC_SERVICE,
        TMP_RPC_METHOD,
        TMP_RPC_GRPC_STATUS_CODE,
        TMP_RPC_JSONRPC_VERSION,
        TMP_RPC_JSONRPC_REQUEST_ID,
        TMP_RPC_JSONRPC_ERROR_CODE,
        TMP_RPC_JSONRPC_ERROR_MESSAGE,
        TMP_MESSAGE_TYPE,
        TMP_MESSAGE_ID,
        TMP_MESSAGE_COMPRESSED_SIZE,
        TMP_MESSAGE_UNCOMPRESSED_SIZE,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for DbSystemValues enum definition
     *
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_DBSYSTEMVALUES_OTHER_SQL = 'other_sql';
    const TMP_DBSYSTEMVALUES_MSSQL = 'mssql';
    const TMP_DBSYSTEMVALUES_MYSQL = 'mysql';
    const TMP_DBSYSTEMVALUES_ORACLE = 'oracle';
    const TMP_DBSYSTEMVALUES_DB2 = 'db2';
    const TMP_DBSYSTEMVALUES_POSTGRESQL = 'postgresql';
    const TMP_DBSYSTEMVALUES_REDSHIFT = 'redshift';
    const TMP_DBSYSTEMVALUES_HIVE = 'hive';
    const TMP_DBSYSTEMVALUES_CLOUDSCAPE = 'cloudscape';
    const TMP_DBSYSTEMVALUES_HSQLDB = 'hsqldb';
    const TMP_DBSYSTEMVALUES_PROGRESS = 'progress';
    const TMP_DBSYSTEMVALUES_MAXDB = 'maxdb';
    const TMP_DBSYSTEMVALUES_HANADB = 'hanadb';
    const TMP_DBSYSTEMVALUES_INGRES = 'ingres';
    const TMP_DBSYSTEMVALUES_FIRSTSQL = 'firstsql';
    const TMP_DBSYSTEMVALUES_EDB = 'edb';
    const TMP_DBSYSTEMVALUES_CACHE = 'cache';
    const TMP_DBSYSTEMVALUES_ADABAS = 'adabas';
    const TMP_DBSYSTEMVALUES_FIREBIRD = 'firebird';
    const TMP_DBSYSTEMVALUES_DERBY = 'derby';
    const TMP_DBSYSTEMVALUES_FILEMAKER = 'filemaker';
    const TMP_DBSYSTEMVALUES_INFORMIX = 'informix';
    const TMP_DBSYSTEMVALUES_INSTANTDB = 'instantdb';
    const TMP_DBSYSTEMVALUES_INTERBASE = 'interbase';
    const TMP_DBSYSTEMVALUES_MARIADB = 'mariadb';
    const TMP_DBSYSTEMVALUES_NETEZZA = 'netezza';
    const TMP_DBSYSTEMVALUES_PERVASIVE = 'pervasive';
    const TMP_DBSYSTEMVALUES_POINTBASE = 'pointbase';
    const TMP_DBSYSTEMVALUES_SQLITE = 'sqlite';
    const TMP_DBSYSTEMVALUES_SYBASE = 'sybase';
    const TMP_DBSYSTEMVALUES_TERADATA = 'teradata';
    const TMP_DBSYSTEMVALUES_VERTICA = 'vertica';
    const TMP_DBSYSTEMVALUES_H2 = 'h2';
    const TMP_DBSYSTEMVALUES_COLDFUSION = 'coldfusion';
    const TMP_DBSYSTEMVALUES_CASSANDRA = 'cassandra';
    const TMP_DBSYSTEMVALUES_HBASE = 'hbase';
    const TMP_DBSYSTEMVALUES_MONGODB = 'mongodb';
    const TMP_DBSYSTEMVALUES_REDIS = 'redis';
    const TMP_DBSYSTEMVALUES_COUCHBASE = 'couchbase';
    const TMP_DBSYSTEMVALUES_COUCHDB = 'couchdb';
    const TMP_DBSYSTEMVALUES_COSMOSDB = 'cosmosdb';
    const TMP_DBSYSTEMVALUES_DYNAMODB = 'dynamodb';
    const TMP_DBSYSTEMVALUES_NEO4J = 'neo4j';
    const TMP_DBSYSTEMVALUES_GEODE = 'geode';
    const TMP_DBSYSTEMVALUES_ELASTICSEARCH = 'elasticsearch';
    const TMP_DBSYSTEMVALUES_MEMCACHED = 'memcached';
    const TMP_DBSYSTEMVALUES_COCKROACHDB = 'cockroachdb';
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_OTHER_SQL.
     */
    SemanticAttributes.DBSYSTEMVALUES_OTHER_SQL = TMP_DBSYSTEMVALUES_OTHER_SQL;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_MSSQL.
     */
    SemanticAttributes.DBSYSTEMVALUES_MSSQL = TMP_DBSYSTEMVALUES_MSSQL;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_MYSQL.
     */
    SemanticAttributes.DBSYSTEMVALUES_MYSQL = TMP_DBSYSTEMVALUES_MYSQL;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_ORACLE.
     */
    SemanticAttributes.DBSYSTEMVALUES_ORACLE = TMP_DBSYSTEMVALUES_ORACLE;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_DB2.
     */
    SemanticAttributes.DBSYSTEMVALUES_DB2 = TMP_DBSYSTEMVALUES_DB2;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_POSTGRESQL.
     */
    SemanticAttributes.DBSYSTEMVALUES_POSTGRESQL = TMP_DBSYSTEMVALUES_POSTGRESQL;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_REDSHIFT.
     */
    SemanticAttributes.DBSYSTEMVALUES_REDSHIFT = TMP_DBSYSTEMVALUES_REDSHIFT;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_HIVE.
     */
    SemanticAttributes.DBSYSTEMVALUES_HIVE = TMP_DBSYSTEMVALUES_HIVE;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_CLOUDSCAPE.
     */
    SemanticAttributes.DBSYSTEMVALUES_CLOUDSCAPE = TMP_DBSYSTEMVALUES_CLOUDSCAPE;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_HSQLDB.
     */
    SemanticAttributes.DBSYSTEMVALUES_HSQLDB = TMP_DBSYSTEMVALUES_HSQLDB;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_PROGRESS.
     */
    SemanticAttributes.DBSYSTEMVALUES_PROGRESS = TMP_DBSYSTEMVALUES_PROGRESS;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_MAXDB.
     */
    SemanticAttributes.DBSYSTEMVALUES_MAXDB = TMP_DBSYSTEMVALUES_MAXDB;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_HANADB.
     */
    SemanticAttributes.DBSYSTEMVALUES_HANADB = TMP_DBSYSTEMVALUES_HANADB;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_INGRES.
     */
    SemanticAttributes.DBSYSTEMVALUES_INGRES = TMP_DBSYSTEMVALUES_INGRES;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_FIRSTSQL.
     */
    SemanticAttributes.DBSYSTEMVALUES_FIRSTSQL = TMP_DBSYSTEMVALUES_FIRSTSQL;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_EDB.
     */
    SemanticAttributes.DBSYSTEMVALUES_EDB = TMP_DBSYSTEMVALUES_EDB;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_CACHE.
     */
    SemanticAttributes.DBSYSTEMVALUES_CACHE = TMP_DBSYSTEMVALUES_CACHE;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_ADABAS.
     */
    SemanticAttributes.DBSYSTEMVALUES_ADABAS = TMP_DBSYSTEMVALUES_ADABAS;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_FIREBIRD.
     */
    SemanticAttributes.DBSYSTEMVALUES_FIREBIRD = TMP_DBSYSTEMVALUES_FIREBIRD;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_DERBY.
     */
    SemanticAttributes.DBSYSTEMVALUES_DERBY = TMP_DBSYSTEMVALUES_DERBY;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_FILEMAKER.
     */
    SemanticAttributes.DBSYSTEMVALUES_FILEMAKER = TMP_DBSYSTEMVALUES_FILEMAKER;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_INFORMIX.
     */
    SemanticAttributes.DBSYSTEMVALUES_INFORMIX = TMP_DBSYSTEMVALUES_INFORMIX;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_INSTANTDB.
     */
    SemanticAttributes.DBSYSTEMVALUES_INSTANTDB = TMP_DBSYSTEMVALUES_INSTANTDB;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_INTERBASE.
     */
    SemanticAttributes.DBSYSTEMVALUES_INTERBASE = TMP_DBSYSTEMVALUES_INTERBASE;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_MARIADB.
     */
    SemanticAttributes.DBSYSTEMVALUES_MARIADB = TMP_DBSYSTEMVALUES_MARIADB;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_NETEZZA.
     */
    SemanticAttributes.DBSYSTEMVALUES_NETEZZA = TMP_DBSYSTEMVALUES_NETEZZA;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_PERVASIVE.
     */
    SemanticAttributes.DBSYSTEMVALUES_PERVASIVE = TMP_DBSYSTEMVALUES_PERVASIVE;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_POINTBASE.
     */
    SemanticAttributes.DBSYSTEMVALUES_POINTBASE = TMP_DBSYSTEMVALUES_POINTBASE;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_SQLITE.
     */
    SemanticAttributes.DBSYSTEMVALUES_SQLITE = TMP_DBSYSTEMVALUES_SQLITE;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_SYBASE.
     */
    SemanticAttributes.DBSYSTEMVALUES_SYBASE = TMP_DBSYSTEMVALUES_SYBASE;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_TERADATA.
     */
    SemanticAttributes.DBSYSTEMVALUES_TERADATA = TMP_DBSYSTEMVALUES_TERADATA;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_VERTICA.
     */
    SemanticAttributes.DBSYSTEMVALUES_VERTICA = TMP_DBSYSTEMVALUES_VERTICA;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_H2.
     */
    SemanticAttributes.DBSYSTEMVALUES_H2 = TMP_DBSYSTEMVALUES_H2;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_COLDFUSION.
     */
    SemanticAttributes.DBSYSTEMVALUES_COLDFUSION = TMP_DBSYSTEMVALUES_COLDFUSION;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_CASSANDRA.
     */
    SemanticAttributes.DBSYSTEMVALUES_CASSANDRA = TMP_DBSYSTEMVALUES_CASSANDRA;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_HBASE.
     */
    SemanticAttributes.DBSYSTEMVALUES_HBASE = TMP_DBSYSTEMVALUES_HBASE;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_MONGODB.
     */
    SemanticAttributes.DBSYSTEMVALUES_MONGODB = TMP_DBSYSTEMVALUES_MONGODB;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_REDIS.
     */
    SemanticAttributes.DBSYSTEMVALUES_REDIS = TMP_DBSYSTEMVALUES_REDIS;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_COUCHBASE.
     */
    SemanticAttributes.DBSYSTEMVALUES_COUCHBASE = TMP_DBSYSTEMVALUES_COUCHBASE;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_COUCHDB.
     */
    SemanticAttributes.DBSYSTEMVALUES_COUCHDB = TMP_DBSYSTEMVALUES_COUCHDB;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_COSMOSDB.
     */
    SemanticAttributes.DBSYSTEMVALUES_COSMOSDB = TMP_DBSYSTEMVALUES_COSMOSDB;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_DYNAMODB.
     */
    SemanticAttributes.DBSYSTEMVALUES_DYNAMODB = TMP_DBSYSTEMVALUES_DYNAMODB;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_NEO4J.
     */
    SemanticAttributes.DBSYSTEMVALUES_NEO4J = TMP_DBSYSTEMVALUES_NEO4J;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_GEODE.
     */
    SemanticAttributes.DBSYSTEMVALUES_GEODE = TMP_DBSYSTEMVALUES_GEODE;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_ELASTICSEARCH.
     */
    SemanticAttributes.DBSYSTEMVALUES_ELASTICSEARCH = TMP_DBSYSTEMVALUES_ELASTICSEARCH;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_MEMCACHED.
     */
    SemanticAttributes.DBSYSTEMVALUES_MEMCACHED = TMP_DBSYSTEMVALUES_MEMCACHED;
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     *
     * @deprecated Use DB_SYSTEM_VALUE_COCKROACHDB.
     */
    SemanticAttributes.DBSYSTEMVALUES_COCKROACHDB = TMP_DBSYSTEMVALUES_COCKROACHDB;
    /**
     * The constant map of values for DbSystemValues.
     * @deprecated Use the DBSYSTEMVALUES_XXXXX constants rather than the DbSystemValues.XXXXX for bundle minification.
     */
    SemanticAttributes.DbSystemValues = 
    /*#__PURE__*/ (0, utils_1$1.createConstMap)([
        TMP_DBSYSTEMVALUES_OTHER_SQL,
        TMP_DBSYSTEMVALUES_MSSQL,
        TMP_DBSYSTEMVALUES_MYSQL,
        TMP_DBSYSTEMVALUES_ORACLE,
        TMP_DBSYSTEMVALUES_DB2,
        TMP_DBSYSTEMVALUES_POSTGRESQL,
        TMP_DBSYSTEMVALUES_REDSHIFT,
        TMP_DBSYSTEMVALUES_HIVE,
        TMP_DBSYSTEMVALUES_CLOUDSCAPE,
        TMP_DBSYSTEMVALUES_HSQLDB,
        TMP_DBSYSTEMVALUES_PROGRESS,
        TMP_DBSYSTEMVALUES_MAXDB,
        TMP_DBSYSTEMVALUES_HANADB,
        TMP_DBSYSTEMVALUES_INGRES,
        TMP_DBSYSTEMVALUES_FIRSTSQL,
        TMP_DBSYSTEMVALUES_EDB,
        TMP_DBSYSTEMVALUES_CACHE,
        TMP_DBSYSTEMVALUES_ADABAS,
        TMP_DBSYSTEMVALUES_FIREBIRD,
        TMP_DBSYSTEMVALUES_DERBY,
        TMP_DBSYSTEMVALUES_FILEMAKER,
        TMP_DBSYSTEMVALUES_INFORMIX,
        TMP_DBSYSTEMVALUES_INSTANTDB,
        TMP_DBSYSTEMVALUES_INTERBASE,
        TMP_DBSYSTEMVALUES_MARIADB,
        TMP_DBSYSTEMVALUES_NETEZZA,
        TMP_DBSYSTEMVALUES_PERVASIVE,
        TMP_DBSYSTEMVALUES_POINTBASE,
        TMP_DBSYSTEMVALUES_SQLITE,
        TMP_DBSYSTEMVALUES_SYBASE,
        TMP_DBSYSTEMVALUES_TERADATA,
        TMP_DBSYSTEMVALUES_VERTICA,
        TMP_DBSYSTEMVALUES_H2,
        TMP_DBSYSTEMVALUES_COLDFUSION,
        TMP_DBSYSTEMVALUES_CASSANDRA,
        TMP_DBSYSTEMVALUES_HBASE,
        TMP_DBSYSTEMVALUES_MONGODB,
        TMP_DBSYSTEMVALUES_REDIS,
        TMP_DBSYSTEMVALUES_COUCHBASE,
        TMP_DBSYSTEMVALUES_COUCHDB,
        TMP_DBSYSTEMVALUES_COSMOSDB,
        TMP_DBSYSTEMVALUES_DYNAMODB,
        TMP_DBSYSTEMVALUES_NEO4J,
        TMP_DBSYSTEMVALUES_GEODE,
        TMP_DBSYSTEMVALUES_ELASTICSEARCH,
        TMP_DBSYSTEMVALUES_MEMCACHED,
        TMP_DBSYSTEMVALUES_COCKROACHDB,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for DbCassandraConsistencyLevelValues enum definition
     *
     * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ALL = 'all';
    const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM = 'each_quorum';
    const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM = 'quorum';
    const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM = 'local_quorum';
    const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ONE = 'one';
    const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_TWO = 'two';
    const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_THREE = 'three';
    const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE = 'local_one';
    const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ANY = 'any';
    const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL = 'serial';
    const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL = 'local_serial';
    /**
     * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
     *
     * @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_ALL.
     */
    SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_ALL = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ALL;
    /**
     * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
     *
     * @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_EACH_QUORUM.
     */
    SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM;
    /**
     * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
     *
     * @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_QUORUM.
     */
    SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM;
    /**
     * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
     *
     * @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_QUORUM.
     */
    SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM;
    /**
     * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
     *
     * @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_ONE.
     */
    SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_ONE = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ONE;
    /**
     * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
     *
     * @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_TWO.
     */
    SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_TWO = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_TWO;
    /**
     * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
     *
     * @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_THREE.
     */
    SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_THREE = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_THREE;
    /**
     * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
     *
     * @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_ONE.
     */
    SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE;
    /**
     * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
     *
     * @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_ANY.
     */
    SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_ANY = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ANY;
    /**
     * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
     *
     * @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_SERIAL.
     */
    SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL;
    /**
     * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
     *
     * @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_SERIAL.
     */
    SemanticAttributes.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL;
    /**
     * The constant map of values for DbCassandraConsistencyLevelValues.
     * @deprecated Use the DBCASSANDRACONSISTENCYLEVELVALUES_XXXXX constants rather than the DbCassandraConsistencyLevelValues.XXXXX for bundle minification.
     */
    SemanticAttributes.DbCassandraConsistencyLevelValues = 
    /*#__PURE__*/ (0, utils_1$1.createConstMap)([
        TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ALL,
        TMP_DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM,
        TMP_DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM,
        TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM,
        TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ONE,
        TMP_DBCASSANDRACONSISTENCYLEVELVALUES_TWO,
        TMP_DBCASSANDRACONSISTENCYLEVELVALUES_THREE,
        TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE,
        TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ANY,
        TMP_DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL,
        TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for FaasTriggerValues enum definition
     *
     * Type of the trigger on which the function is executed.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_FAASTRIGGERVALUES_DATASOURCE = 'datasource';
    const TMP_FAASTRIGGERVALUES_HTTP = 'http';
    const TMP_FAASTRIGGERVALUES_PUBSUB = 'pubsub';
    const TMP_FAASTRIGGERVALUES_TIMER = 'timer';
    const TMP_FAASTRIGGERVALUES_OTHER = 'other';
    /**
     * Type of the trigger on which the function is executed.
     *
     * @deprecated Use FAAS_TRIGGER_VALUE_DATASOURCE.
     */
    SemanticAttributes.FAASTRIGGERVALUES_DATASOURCE = TMP_FAASTRIGGERVALUES_DATASOURCE;
    /**
     * Type of the trigger on which the function is executed.
     *
     * @deprecated Use FAAS_TRIGGER_VALUE_HTTP.
     */
    SemanticAttributes.FAASTRIGGERVALUES_HTTP = TMP_FAASTRIGGERVALUES_HTTP;
    /**
     * Type of the trigger on which the function is executed.
     *
     * @deprecated Use FAAS_TRIGGER_VALUE_PUBSUB.
     */
    SemanticAttributes.FAASTRIGGERVALUES_PUBSUB = TMP_FAASTRIGGERVALUES_PUBSUB;
    /**
     * Type of the trigger on which the function is executed.
     *
     * @deprecated Use FAAS_TRIGGER_VALUE_TIMER.
     */
    SemanticAttributes.FAASTRIGGERVALUES_TIMER = TMP_FAASTRIGGERVALUES_TIMER;
    /**
     * Type of the trigger on which the function is executed.
     *
     * @deprecated Use FAAS_TRIGGER_VALUE_OTHER.
     */
    SemanticAttributes.FAASTRIGGERVALUES_OTHER = TMP_FAASTRIGGERVALUES_OTHER;
    /**
     * The constant map of values for FaasTriggerValues.
     * @deprecated Use the FAASTRIGGERVALUES_XXXXX constants rather than the FaasTriggerValues.XXXXX for bundle minification.
     */
    SemanticAttributes.FaasTriggerValues = 
    /*#__PURE__*/ (0, utils_1$1.createConstMap)([
        TMP_FAASTRIGGERVALUES_DATASOURCE,
        TMP_FAASTRIGGERVALUES_HTTP,
        TMP_FAASTRIGGERVALUES_PUBSUB,
        TMP_FAASTRIGGERVALUES_TIMER,
        TMP_FAASTRIGGERVALUES_OTHER,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for FaasDocumentOperationValues enum definition
     *
     * Describes the type of the operation that was performed on the data.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_FAASDOCUMENTOPERATIONVALUES_INSERT = 'insert';
    const TMP_FAASDOCUMENTOPERATIONVALUES_EDIT = 'edit';
    const TMP_FAASDOCUMENTOPERATIONVALUES_DELETE = 'delete';
    /**
     * Describes the type of the operation that was performed on the data.
     *
     * @deprecated Use FAAS_DOCUMENT_OPERATION_VALUE_INSERT.
     */
    SemanticAttributes.FAASDOCUMENTOPERATIONVALUES_INSERT = TMP_FAASDOCUMENTOPERATIONVALUES_INSERT;
    /**
     * Describes the type of the operation that was performed on the data.
     *
     * @deprecated Use FAAS_DOCUMENT_OPERATION_VALUE_EDIT.
     */
    SemanticAttributes.FAASDOCUMENTOPERATIONVALUES_EDIT = TMP_FAASDOCUMENTOPERATIONVALUES_EDIT;
    /**
     * Describes the type of the operation that was performed on the data.
     *
     * @deprecated Use FAAS_DOCUMENT_OPERATION_VALUE_DELETE.
     */
    SemanticAttributes.FAASDOCUMENTOPERATIONVALUES_DELETE = TMP_FAASDOCUMENTOPERATIONVALUES_DELETE;
    /**
     * The constant map of values for FaasDocumentOperationValues.
     * @deprecated Use the FAASDOCUMENTOPERATIONVALUES_XXXXX constants rather than the FaasDocumentOperationValues.XXXXX for bundle minification.
     */
    SemanticAttributes.FaasDocumentOperationValues = 
    /*#__PURE__*/ (0, utils_1$1.createConstMap)([
        TMP_FAASDOCUMENTOPERATIONVALUES_INSERT,
        TMP_FAASDOCUMENTOPERATIONVALUES_EDIT,
        TMP_FAASDOCUMENTOPERATIONVALUES_DELETE,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for FaasInvokedProviderValues enum definition
     *
     * The cloud provider of the invoked function.
     *
     * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD = 'alibaba_cloud';
    const TMP_FAASINVOKEDPROVIDERVALUES_AWS = 'aws';
    const TMP_FAASINVOKEDPROVIDERVALUES_AZURE = 'azure';
    const TMP_FAASINVOKEDPROVIDERVALUES_GCP = 'gcp';
    /**
     * The cloud provider of the invoked function.
     *
     * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
     *
     * @deprecated Use FAAS_INVOKED_PROVIDER_VALUE_ALIBABA_CLOUD.
     */
    SemanticAttributes.FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD = TMP_FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD;
    /**
     * The cloud provider of the invoked function.
     *
     * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
     *
     * @deprecated Use FAAS_INVOKED_PROVIDER_VALUE_AWS.
     */
    SemanticAttributes.FAASINVOKEDPROVIDERVALUES_AWS = TMP_FAASINVOKEDPROVIDERVALUES_AWS;
    /**
     * The cloud provider of the invoked function.
     *
     * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
     *
     * @deprecated Use FAAS_INVOKED_PROVIDER_VALUE_AZURE.
     */
    SemanticAttributes.FAASINVOKEDPROVIDERVALUES_AZURE = TMP_FAASINVOKEDPROVIDERVALUES_AZURE;
    /**
     * The cloud provider of the invoked function.
     *
     * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
     *
     * @deprecated Use FAAS_INVOKED_PROVIDER_VALUE_GCP.
     */
    SemanticAttributes.FAASINVOKEDPROVIDERVALUES_GCP = TMP_FAASINVOKEDPROVIDERVALUES_GCP;
    /**
     * The constant map of values for FaasInvokedProviderValues.
     * @deprecated Use the FAASINVOKEDPROVIDERVALUES_XXXXX constants rather than the FaasInvokedProviderValues.XXXXX for bundle minification.
     */
    SemanticAttributes.FaasInvokedProviderValues = 
    /*#__PURE__*/ (0, utils_1$1.createConstMap)([
        TMP_FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD,
        TMP_FAASINVOKEDPROVIDERVALUES_AWS,
        TMP_FAASINVOKEDPROVIDERVALUES_AZURE,
        TMP_FAASINVOKEDPROVIDERVALUES_GCP,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for NetTransportValues enum definition
     *
     * Transport protocol used. See note below.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_NETTRANSPORTVALUES_IP_TCP = 'ip_tcp';
    const TMP_NETTRANSPORTVALUES_IP_UDP = 'ip_udp';
    const TMP_NETTRANSPORTVALUES_IP = 'ip';
    const TMP_NETTRANSPORTVALUES_UNIX = 'unix';
    const TMP_NETTRANSPORTVALUES_PIPE = 'pipe';
    const TMP_NETTRANSPORTVALUES_INPROC = 'inproc';
    const TMP_NETTRANSPORTVALUES_OTHER = 'other';
    /**
     * Transport protocol used. See note below.
     *
     * @deprecated Use NET_TRANSPORT_VALUE_IP_TCP.
     */
    SemanticAttributes.NETTRANSPORTVALUES_IP_TCP = TMP_NETTRANSPORTVALUES_IP_TCP;
    /**
     * Transport protocol used. See note below.
     *
     * @deprecated Use NET_TRANSPORT_VALUE_IP_UDP.
     */
    SemanticAttributes.NETTRANSPORTVALUES_IP_UDP = TMP_NETTRANSPORTVALUES_IP_UDP;
    /**
     * Transport protocol used. See note below.
     *
     * @deprecated Use NET_TRANSPORT_VALUE_IP.
     */
    SemanticAttributes.NETTRANSPORTVALUES_IP = TMP_NETTRANSPORTVALUES_IP;
    /**
     * Transport protocol used. See note below.
     *
     * @deprecated Use NET_TRANSPORT_VALUE_UNIX.
     */
    SemanticAttributes.NETTRANSPORTVALUES_UNIX = TMP_NETTRANSPORTVALUES_UNIX;
    /**
     * Transport protocol used. See note below.
     *
     * @deprecated Use NET_TRANSPORT_VALUE_PIPE.
     */
    SemanticAttributes.NETTRANSPORTVALUES_PIPE = TMP_NETTRANSPORTVALUES_PIPE;
    /**
     * Transport protocol used. See note below.
     *
     * @deprecated Use NET_TRANSPORT_VALUE_INPROC.
     */
    SemanticAttributes.NETTRANSPORTVALUES_INPROC = TMP_NETTRANSPORTVALUES_INPROC;
    /**
     * Transport protocol used. See note below.
     *
     * @deprecated Use NET_TRANSPORT_VALUE_OTHER.
     */
    SemanticAttributes.NETTRANSPORTVALUES_OTHER = TMP_NETTRANSPORTVALUES_OTHER;
    /**
     * The constant map of values for NetTransportValues.
     * @deprecated Use the NETTRANSPORTVALUES_XXXXX constants rather than the NetTransportValues.XXXXX for bundle minification.
     */
    SemanticAttributes.NetTransportValues = 
    /*#__PURE__*/ (0, utils_1$1.createConstMap)([
        TMP_NETTRANSPORTVALUES_IP_TCP,
        TMP_NETTRANSPORTVALUES_IP_UDP,
        TMP_NETTRANSPORTVALUES_IP,
        TMP_NETTRANSPORTVALUES_UNIX,
        TMP_NETTRANSPORTVALUES_PIPE,
        TMP_NETTRANSPORTVALUES_INPROC,
        TMP_NETTRANSPORTVALUES_OTHER,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for NetHostConnectionTypeValues enum definition
     *
     * The internet connection type currently being used by the host.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_NETHOSTCONNECTIONTYPEVALUES_WIFI = 'wifi';
    const TMP_NETHOSTCONNECTIONTYPEVALUES_WIRED = 'wired';
    const TMP_NETHOSTCONNECTIONTYPEVALUES_CELL = 'cell';
    const TMP_NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE = 'unavailable';
    const TMP_NETHOSTCONNECTIONTYPEVALUES_UNKNOWN = 'unknown';
    /**
     * The internet connection type currently being used by the host.
     *
     * @deprecated Use NET_HOST_CONNECTION_TYPE_VALUE_WIFI.
     */
    SemanticAttributes.NETHOSTCONNECTIONTYPEVALUES_WIFI = TMP_NETHOSTCONNECTIONTYPEVALUES_WIFI;
    /**
     * The internet connection type currently being used by the host.
     *
     * @deprecated Use NET_HOST_CONNECTION_TYPE_VALUE_WIRED.
     */
    SemanticAttributes.NETHOSTCONNECTIONTYPEVALUES_WIRED = TMP_NETHOSTCONNECTIONTYPEVALUES_WIRED;
    /**
     * The internet connection type currently being used by the host.
     *
     * @deprecated Use NET_HOST_CONNECTION_TYPE_VALUE_CELL.
     */
    SemanticAttributes.NETHOSTCONNECTIONTYPEVALUES_CELL = TMP_NETHOSTCONNECTIONTYPEVALUES_CELL;
    /**
     * The internet connection type currently being used by the host.
     *
     * @deprecated Use NET_HOST_CONNECTION_TYPE_VALUE_UNAVAILABLE.
     */
    SemanticAttributes.NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE = TMP_NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE;
    /**
     * The internet connection type currently being used by the host.
     *
     * @deprecated Use NET_HOST_CONNECTION_TYPE_VALUE_UNKNOWN.
     */
    SemanticAttributes.NETHOSTCONNECTIONTYPEVALUES_UNKNOWN = TMP_NETHOSTCONNECTIONTYPEVALUES_UNKNOWN;
    /**
     * The constant map of values for NetHostConnectionTypeValues.
     * @deprecated Use the NETHOSTCONNECTIONTYPEVALUES_XXXXX constants rather than the NetHostConnectionTypeValues.XXXXX for bundle minification.
     */
    SemanticAttributes.NetHostConnectionTypeValues = 
    /*#__PURE__*/ (0, utils_1$1.createConstMap)([
        TMP_NETHOSTCONNECTIONTYPEVALUES_WIFI,
        TMP_NETHOSTCONNECTIONTYPEVALUES_WIRED,
        TMP_NETHOSTCONNECTIONTYPEVALUES_CELL,
        TMP_NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE,
        TMP_NETHOSTCONNECTIONTYPEVALUES_UNKNOWN,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for NetHostConnectionSubtypeValues enum definition
     *
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GPRS = 'gprs';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EDGE = 'edge';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_UMTS = 'umts';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA = 'cdma';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0 = 'evdo_0';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A = 'evdo_a';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT = 'cdma2000_1xrtt';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA = 'hsdpa';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA = 'hsupa';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPA = 'hspa';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IDEN = 'iden';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B = 'evdo_b';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE = 'lte';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD = 'ehrpd';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP = 'hspap';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GSM = 'gsm';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA = 'td_scdma';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN = 'iwlan';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NR = 'nr';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA = 'nrnsa';
    const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA = 'lte_ca';
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_GPRS.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_GPRS = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GPRS;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_EDGE.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_EDGE = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EDGE;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_UMTS.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_UMTS = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_UMTS;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_CDMA.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_CDMA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_EVDO_0.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0 = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_EVDO_A.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_CDMA2000_1XRTT.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_HSDPA.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_HSUPA.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_HSPA.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_HSPA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPA;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_IDEN.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_IDEN = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IDEN;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_EVDO_B.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_LTE.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_LTE = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_EHRPD.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_HSPAP.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_GSM.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_GSM = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GSM;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_TD_SCDMA.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_IWLAN.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_NR.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_NR = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NR;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_NRNSA.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA;
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     *
     * @deprecated Use NET_HOST_CONNECTION_SUBTYPE_VALUE_LTE_CA.
     */
    SemanticAttributes.NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA;
    /**
     * The constant map of values for NetHostConnectionSubtypeValues.
     * @deprecated Use the NETHOSTCONNECTIONSUBTYPEVALUES_XXXXX constants rather than the NetHostConnectionSubtypeValues.XXXXX for bundle minification.
     */
    SemanticAttributes.NetHostConnectionSubtypeValues = 
    /*#__PURE__*/ (0, utils_1$1.createConstMap)([
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GPRS,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EDGE,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_UMTS,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPA,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IDEN,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GSM,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NR,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA,
        TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for HttpFlavorValues enum definition
     *
     * Kind of HTTP protocol used.
     *
     * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_HTTPFLAVORVALUES_HTTP_1_0 = '1.0';
    const TMP_HTTPFLAVORVALUES_HTTP_1_1 = '1.1';
    const TMP_HTTPFLAVORVALUES_HTTP_2_0 = '2.0';
    const TMP_HTTPFLAVORVALUES_SPDY = 'SPDY';
    const TMP_HTTPFLAVORVALUES_QUIC = 'QUIC';
    /**
     * Kind of HTTP protocol used.
     *
     * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
     *
     * @deprecated Use HTTP_FLAVOR_VALUE_HTTP_1_0.
     */
    SemanticAttributes.HTTPFLAVORVALUES_HTTP_1_0 = TMP_HTTPFLAVORVALUES_HTTP_1_0;
    /**
     * Kind of HTTP protocol used.
     *
     * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
     *
     * @deprecated Use HTTP_FLAVOR_VALUE_HTTP_1_1.
     */
    SemanticAttributes.HTTPFLAVORVALUES_HTTP_1_1 = TMP_HTTPFLAVORVALUES_HTTP_1_1;
    /**
     * Kind of HTTP protocol used.
     *
     * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
     *
     * @deprecated Use HTTP_FLAVOR_VALUE_HTTP_2_0.
     */
    SemanticAttributes.HTTPFLAVORVALUES_HTTP_2_0 = TMP_HTTPFLAVORVALUES_HTTP_2_0;
    /**
     * Kind of HTTP protocol used.
     *
     * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
     *
     * @deprecated Use HTTP_FLAVOR_VALUE_SPDY.
     */
    SemanticAttributes.HTTPFLAVORVALUES_SPDY = TMP_HTTPFLAVORVALUES_SPDY;
    /**
     * Kind of HTTP protocol used.
     *
     * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
     *
     * @deprecated Use HTTP_FLAVOR_VALUE_QUIC.
     */
    SemanticAttributes.HTTPFLAVORVALUES_QUIC = TMP_HTTPFLAVORVALUES_QUIC;
    /**
     * The constant map of values for HttpFlavorValues.
     * @deprecated Use the HTTPFLAVORVALUES_XXXXX constants rather than the HttpFlavorValues.XXXXX for bundle minification.
     */
    SemanticAttributes.HttpFlavorValues = {
        HTTP_1_0: TMP_HTTPFLAVORVALUES_HTTP_1_0,
        HTTP_1_1: TMP_HTTPFLAVORVALUES_HTTP_1_1,
        HTTP_2_0: TMP_HTTPFLAVORVALUES_HTTP_2_0,
        SPDY: TMP_HTTPFLAVORVALUES_SPDY,
        QUIC: TMP_HTTPFLAVORVALUES_QUIC,
    };
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for MessagingDestinationKindValues enum definition
     *
     * The kind of message destination.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_MESSAGINGDESTINATIONKINDVALUES_QUEUE = 'queue';
    const TMP_MESSAGINGDESTINATIONKINDVALUES_TOPIC = 'topic';
    /**
     * The kind of message destination.
     *
     * @deprecated Use MESSAGING_DESTINATION_KIND_VALUE_QUEUE.
     */
    SemanticAttributes.MESSAGINGDESTINATIONKINDVALUES_QUEUE = TMP_MESSAGINGDESTINATIONKINDVALUES_QUEUE;
    /**
     * The kind of message destination.
     *
     * @deprecated Use MESSAGING_DESTINATION_KIND_VALUE_TOPIC.
     */
    SemanticAttributes.MESSAGINGDESTINATIONKINDVALUES_TOPIC = TMP_MESSAGINGDESTINATIONKINDVALUES_TOPIC;
    /**
     * The constant map of values for MessagingDestinationKindValues.
     * @deprecated Use the MESSAGINGDESTINATIONKINDVALUES_XXXXX constants rather than the MessagingDestinationKindValues.XXXXX for bundle minification.
     */
    SemanticAttributes.MessagingDestinationKindValues = 
    /*#__PURE__*/ (0, utils_1$1.createConstMap)([
        TMP_MESSAGINGDESTINATIONKINDVALUES_QUEUE,
        TMP_MESSAGINGDESTINATIONKINDVALUES_TOPIC,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for MessagingOperationValues enum definition
     *
     * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_MESSAGINGOPERATIONVALUES_RECEIVE = 'receive';
    const TMP_MESSAGINGOPERATIONVALUES_PROCESS = 'process';
    /**
     * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
     *
     * @deprecated Use MESSAGING_OPERATION_VALUE_RECEIVE.
     */
    SemanticAttributes.MESSAGINGOPERATIONVALUES_RECEIVE = TMP_MESSAGINGOPERATIONVALUES_RECEIVE;
    /**
     * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
     *
     * @deprecated Use MESSAGING_OPERATION_VALUE_PROCESS.
     */
    SemanticAttributes.MESSAGINGOPERATIONVALUES_PROCESS = TMP_MESSAGINGOPERATIONVALUES_PROCESS;
    /**
     * The constant map of values for MessagingOperationValues.
     * @deprecated Use the MESSAGINGOPERATIONVALUES_XXXXX constants rather than the MessagingOperationValues.XXXXX for bundle minification.
     */
    SemanticAttributes.MessagingOperationValues = 
    /*#__PURE__*/ (0, utils_1$1.createConstMap)([
        TMP_MESSAGINGOPERATIONVALUES_RECEIVE,
        TMP_MESSAGINGOPERATIONVALUES_PROCESS,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for RpcGrpcStatusCodeValues enum definition
     *
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_RPCGRPCSTATUSCODEVALUES_OK = 0;
    const TMP_RPCGRPCSTATUSCODEVALUES_CANCELLED = 1;
    const TMP_RPCGRPCSTATUSCODEVALUES_UNKNOWN = 2;
    const TMP_RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT = 3;
    const TMP_RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED = 4;
    const TMP_RPCGRPCSTATUSCODEVALUES_NOT_FOUND = 5;
    const TMP_RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS = 6;
    const TMP_RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED = 7;
    const TMP_RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED = 8;
    const TMP_RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION = 9;
    const TMP_RPCGRPCSTATUSCODEVALUES_ABORTED = 10;
    const TMP_RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE = 11;
    const TMP_RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED = 12;
    const TMP_RPCGRPCSTATUSCODEVALUES_INTERNAL = 13;
    const TMP_RPCGRPCSTATUSCODEVALUES_UNAVAILABLE = 14;
    const TMP_RPCGRPCSTATUSCODEVALUES_DATA_LOSS = 15;
    const TMP_RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED = 16;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_OK.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_OK = TMP_RPCGRPCSTATUSCODEVALUES_OK;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_CANCELLED.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_CANCELLED = TMP_RPCGRPCSTATUSCODEVALUES_CANCELLED;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_UNKNOWN.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_UNKNOWN = TMP_RPCGRPCSTATUSCODEVALUES_UNKNOWN;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_INVALID_ARGUMENT.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT = TMP_RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_DEADLINE_EXCEEDED.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED = TMP_RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_NOT_FOUND.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_NOT_FOUND = TMP_RPCGRPCSTATUSCODEVALUES_NOT_FOUND;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_ALREADY_EXISTS.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS = TMP_RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_PERMISSION_DENIED.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED = TMP_RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_RESOURCE_EXHAUSTED.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED = TMP_RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_FAILED_PRECONDITION.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION = TMP_RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_ABORTED.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_ABORTED = TMP_RPCGRPCSTATUSCODEVALUES_ABORTED;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_OUT_OF_RANGE.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE = TMP_RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_UNIMPLEMENTED.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED = TMP_RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_INTERNAL.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_INTERNAL = TMP_RPCGRPCSTATUSCODEVALUES_INTERNAL;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_UNAVAILABLE.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_UNAVAILABLE = TMP_RPCGRPCSTATUSCODEVALUES_UNAVAILABLE;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_DATA_LOSS.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_DATA_LOSS = TMP_RPCGRPCSTATUSCODEVALUES_DATA_LOSS;
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     *
     * @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_UNAUTHENTICATED.
     */
    SemanticAttributes.RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED = TMP_RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED;
    /**
     * The constant map of values for RpcGrpcStatusCodeValues.
     * @deprecated Use the RPCGRPCSTATUSCODEVALUES_XXXXX constants rather than the RpcGrpcStatusCodeValues.XXXXX for bundle minification.
     */
    SemanticAttributes.RpcGrpcStatusCodeValues = {
        OK: TMP_RPCGRPCSTATUSCODEVALUES_OK,
        CANCELLED: TMP_RPCGRPCSTATUSCODEVALUES_CANCELLED,
        UNKNOWN: TMP_RPCGRPCSTATUSCODEVALUES_UNKNOWN,
        INVALID_ARGUMENT: TMP_RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT,
        DEADLINE_EXCEEDED: TMP_RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED,
        NOT_FOUND: TMP_RPCGRPCSTATUSCODEVALUES_NOT_FOUND,
        ALREADY_EXISTS: TMP_RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS,
        PERMISSION_DENIED: TMP_RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED,
        RESOURCE_EXHAUSTED: TMP_RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED,
        FAILED_PRECONDITION: TMP_RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION,
        ABORTED: TMP_RPCGRPCSTATUSCODEVALUES_ABORTED,
        OUT_OF_RANGE: TMP_RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE,
        UNIMPLEMENTED: TMP_RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED,
        INTERNAL: TMP_RPCGRPCSTATUSCODEVALUES_INTERNAL,
        UNAVAILABLE: TMP_RPCGRPCSTATUSCODEVALUES_UNAVAILABLE,
        DATA_LOSS: TMP_RPCGRPCSTATUSCODEVALUES_DATA_LOSS,
        UNAUTHENTICATED: TMP_RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED,
    };
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for MessageTypeValues enum definition
     *
     * Whether this is a received or sent message.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_MESSAGETYPEVALUES_SENT = 'SENT';
    const TMP_MESSAGETYPEVALUES_RECEIVED = 'RECEIVED';
    /**
     * Whether this is a received or sent message.
     *
     * @deprecated Use MESSAGE_TYPE_VALUE_SENT.
     */
    SemanticAttributes.MESSAGETYPEVALUES_SENT = TMP_MESSAGETYPEVALUES_SENT;
    /**
     * Whether this is a received or sent message.
     *
     * @deprecated Use MESSAGE_TYPE_VALUE_RECEIVED.
     */
    SemanticAttributes.MESSAGETYPEVALUES_RECEIVED = TMP_MESSAGETYPEVALUES_RECEIVED;
    /**
     * The constant map of values for MessageTypeValues.
     * @deprecated Use the MESSAGETYPEVALUES_XXXXX constants rather than the MessageTypeValues.XXXXX for bundle minification.
     */
    SemanticAttributes.MessageTypeValues = 
    /*#__PURE__*/ (0, utils_1$1.createConstMap)([
        TMP_MESSAGETYPEVALUES_SENT,
        TMP_MESSAGETYPEVALUES_RECEIVED,
    ]);

    (function (exports) {
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
    	var __createBinding = (index.commonjsGlobal && index.commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    	    if (k2 === undefined) k2 = k;
    	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    	}) : (function(o, m, k, k2) {
    	    if (k2 === undefined) k2 = k;
    	    o[k2] = m[k];
    	}));
    	var __exportStar = (index.commonjsGlobal && index.commonjsGlobal.__exportStar) || function(m, exports) {
    	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    	};
    	Object.defineProperty(exports, "__esModule", { value: true });
    	/* eslint-disable no-restricted-syntax --
    	 * These re-exports are only of constants, only one-level deep at this point,
    	 * and should not cause problems for tree-shakers.
    	 */
    	__exportStar(SemanticAttributes, exports);
    	
    } (trace));

    var resource = {};

    var SemanticResourceAttributes = {};

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
    Object.defineProperty(SemanticResourceAttributes, "__esModule", { value: true });
    SemanticResourceAttributes.SEMRESATTRS_K8S_STATEFULSET_NAME = SemanticResourceAttributes.SEMRESATTRS_K8S_STATEFULSET_UID = SemanticResourceAttributes.SEMRESATTRS_K8S_DEPLOYMENT_NAME = SemanticResourceAttributes.SEMRESATTRS_K8S_DEPLOYMENT_UID = SemanticResourceAttributes.SEMRESATTRS_K8S_REPLICASET_NAME = SemanticResourceAttributes.SEMRESATTRS_K8S_REPLICASET_UID = SemanticResourceAttributes.SEMRESATTRS_K8S_CONTAINER_NAME = SemanticResourceAttributes.SEMRESATTRS_K8S_POD_NAME = SemanticResourceAttributes.SEMRESATTRS_K8S_POD_UID = SemanticResourceAttributes.SEMRESATTRS_K8S_NAMESPACE_NAME = SemanticResourceAttributes.SEMRESATTRS_K8S_NODE_UID = SemanticResourceAttributes.SEMRESATTRS_K8S_NODE_NAME = SemanticResourceAttributes.SEMRESATTRS_K8S_CLUSTER_NAME = SemanticResourceAttributes.SEMRESATTRS_HOST_IMAGE_VERSION = SemanticResourceAttributes.SEMRESATTRS_HOST_IMAGE_ID = SemanticResourceAttributes.SEMRESATTRS_HOST_IMAGE_NAME = SemanticResourceAttributes.SEMRESATTRS_HOST_ARCH = SemanticResourceAttributes.SEMRESATTRS_HOST_TYPE = SemanticResourceAttributes.SEMRESATTRS_HOST_NAME = SemanticResourceAttributes.SEMRESATTRS_HOST_ID = SemanticResourceAttributes.SEMRESATTRS_FAAS_MAX_MEMORY = SemanticResourceAttributes.SEMRESATTRS_FAAS_INSTANCE = SemanticResourceAttributes.SEMRESATTRS_FAAS_VERSION = SemanticResourceAttributes.SEMRESATTRS_FAAS_ID = SemanticResourceAttributes.SEMRESATTRS_FAAS_NAME = SemanticResourceAttributes.SEMRESATTRS_DEVICE_MODEL_NAME = SemanticResourceAttributes.SEMRESATTRS_DEVICE_MODEL_IDENTIFIER = SemanticResourceAttributes.SEMRESATTRS_DEVICE_ID = SemanticResourceAttributes.SEMRESATTRS_DEPLOYMENT_ENVIRONMENT = SemanticResourceAttributes.SEMRESATTRS_CONTAINER_IMAGE_TAG = SemanticResourceAttributes.SEMRESATTRS_CONTAINER_IMAGE_NAME = SemanticResourceAttributes.SEMRESATTRS_CONTAINER_RUNTIME = SemanticResourceAttributes.SEMRESATTRS_CONTAINER_ID = SemanticResourceAttributes.SEMRESATTRS_CONTAINER_NAME = SemanticResourceAttributes.SEMRESATTRS_AWS_LOG_STREAM_ARNS = SemanticResourceAttributes.SEMRESATTRS_AWS_LOG_STREAM_NAMES = SemanticResourceAttributes.SEMRESATTRS_AWS_LOG_GROUP_ARNS = SemanticResourceAttributes.SEMRESATTRS_AWS_LOG_GROUP_NAMES = SemanticResourceAttributes.SEMRESATTRS_AWS_EKS_CLUSTER_ARN = SemanticResourceAttributes.SEMRESATTRS_AWS_ECS_TASK_REVISION = SemanticResourceAttributes.SEMRESATTRS_AWS_ECS_TASK_FAMILY = SemanticResourceAttributes.SEMRESATTRS_AWS_ECS_TASK_ARN = SemanticResourceAttributes.SEMRESATTRS_AWS_ECS_LAUNCHTYPE = SemanticResourceAttributes.SEMRESATTRS_AWS_ECS_CLUSTER_ARN = SemanticResourceAttributes.SEMRESATTRS_AWS_ECS_CONTAINER_ARN = SemanticResourceAttributes.SEMRESATTRS_CLOUD_PLATFORM = SemanticResourceAttributes.SEMRESATTRS_CLOUD_AVAILABILITY_ZONE = SemanticResourceAttributes.SEMRESATTRS_CLOUD_REGION = SemanticResourceAttributes.SEMRESATTRS_CLOUD_ACCOUNT_ID = SemanticResourceAttributes.SEMRESATTRS_CLOUD_PROVIDER = void 0;
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE = SemanticResourceAttributes.CLOUDPLATFORMVALUES_AZURE_APP_SERVICE = SemanticResourceAttributes.CLOUDPLATFORMVALUES_AZURE_FUNCTIONS = SemanticResourceAttributes.CLOUDPLATFORMVALUES_AZURE_AKS = SemanticResourceAttributes.CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES = SemanticResourceAttributes.CLOUDPLATFORMVALUES_AZURE_VM = SemanticResourceAttributes.CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK = SemanticResourceAttributes.CLOUDPLATFORMVALUES_AWS_LAMBDA = SemanticResourceAttributes.CLOUDPLATFORMVALUES_AWS_EKS = SemanticResourceAttributes.CLOUDPLATFORMVALUES_AWS_ECS = SemanticResourceAttributes.CLOUDPLATFORMVALUES_AWS_EC2 = SemanticResourceAttributes.CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC = SemanticResourceAttributes.CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS = SemanticResourceAttributes.CloudProviderValues = SemanticResourceAttributes.CLOUDPROVIDERVALUES_GCP = SemanticResourceAttributes.CLOUDPROVIDERVALUES_AZURE = SemanticResourceAttributes.CLOUDPROVIDERVALUES_AWS = SemanticResourceAttributes.CLOUDPROVIDERVALUES_ALIBABA_CLOUD = SemanticResourceAttributes.SemanticResourceAttributes = SemanticResourceAttributes.SEMRESATTRS_WEBENGINE_DESCRIPTION = SemanticResourceAttributes.SEMRESATTRS_WEBENGINE_VERSION = SemanticResourceAttributes.SEMRESATTRS_WEBENGINE_NAME = SemanticResourceAttributes.SEMRESATTRS_TELEMETRY_AUTO_VERSION = SemanticResourceAttributes.SEMRESATTRS_TELEMETRY_SDK_VERSION = SemanticResourceAttributes.SEMRESATTRS_TELEMETRY_SDK_LANGUAGE = SemanticResourceAttributes.SEMRESATTRS_TELEMETRY_SDK_NAME = SemanticResourceAttributes.SEMRESATTRS_SERVICE_VERSION = SemanticResourceAttributes.SEMRESATTRS_SERVICE_INSTANCE_ID = SemanticResourceAttributes.SEMRESATTRS_SERVICE_NAMESPACE = SemanticResourceAttributes.SEMRESATTRS_SERVICE_NAME = SemanticResourceAttributes.SEMRESATTRS_PROCESS_RUNTIME_DESCRIPTION = SemanticResourceAttributes.SEMRESATTRS_PROCESS_RUNTIME_VERSION = SemanticResourceAttributes.SEMRESATTRS_PROCESS_RUNTIME_NAME = SemanticResourceAttributes.SEMRESATTRS_PROCESS_OWNER = SemanticResourceAttributes.SEMRESATTRS_PROCESS_COMMAND_ARGS = SemanticResourceAttributes.SEMRESATTRS_PROCESS_COMMAND_LINE = SemanticResourceAttributes.SEMRESATTRS_PROCESS_COMMAND = SemanticResourceAttributes.SEMRESATTRS_PROCESS_EXECUTABLE_PATH = SemanticResourceAttributes.SEMRESATTRS_PROCESS_EXECUTABLE_NAME = SemanticResourceAttributes.SEMRESATTRS_PROCESS_PID = SemanticResourceAttributes.SEMRESATTRS_OS_VERSION = SemanticResourceAttributes.SEMRESATTRS_OS_NAME = SemanticResourceAttributes.SEMRESATTRS_OS_DESCRIPTION = SemanticResourceAttributes.SEMRESATTRS_OS_TYPE = SemanticResourceAttributes.SEMRESATTRS_K8S_CRONJOB_NAME = SemanticResourceAttributes.SEMRESATTRS_K8S_CRONJOB_UID = SemanticResourceAttributes.SEMRESATTRS_K8S_JOB_NAME = SemanticResourceAttributes.SEMRESATTRS_K8S_JOB_UID = SemanticResourceAttributes.SEMRESATTRS_K8S_DAEMONSET_NAME = SemanticResourceAttributes.SEMRESATTRS_K8S_DAEMONSET_UID = void 0;
    SemanticResourceAttributes.TelemetrySdkLanguageValues = SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_WEBJS = SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_RUBY = SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_PYTHON = SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_PHP = SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_NODEJS = SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_JAVA = SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_GO = SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_ERLANG = SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_DOTNET = SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_CPP = SemanticResourceAttributes.OsTypeValues = SemanticResourceAttributes.OSTYPEVALUES_Z_OS = SemanticResourceAttributes.OSTYPEVALUES_SOLARIS = SemanticResourceAttributes.OSTYPEVALUES_AIX = SemanticResourceAttributes.OSTYPEVALUES_HPUX = SemanticResourceAttributes.OSTYPEVALUES_DRAGONFLYBSD = SemanticResourceAttributes.OSTYPEVALUES_OPENBSD = SemanticResourceAttributes.OSTYPEVALUES_NETBSD = SemanticResourceAttributes.OSTYPEVALUES_FREEBSD = SemanticResourceAttributes.OSTYPEVALUES_DARWIN = SemanticResourceAttributes.OSTYPEVALUES_LINUX = SemanticResourceAttributes.OSTYPEVALUES_WINDOWS = SemanticResourceAttributes.HostArchValues = SemanticResourceAttributes.HOSTARCHVALUES_X86 = SemanticResourceAttributes.HOSTARCHVALUES_PPC64 = SemanticResourceAttributes.HOSTARCHVALUES_PPC32 = SemanticResourceAttributes.HOSTARCHVALUES_IA64 = SemanticResourceAttributes.HOSTARCHVALUES_ARM64 = SemanticResourceAttributes.HOSTARCHVALUES_ARM32 = SemanticResourceAttributes.HOSTARCHVALUES_AMD64 = SemanticResourceAttributes.AwsEcsLaunchtypeValues = SemanticResourceAttributes.AWSECSLAUNCHTYPEVALUES_FARGATE = SemanticResourceAttributes.AWSECSLAUNCHTYPEVALUES_EC2 = SemanticResourceAttributes.CloudPlatformValues = SemanticResourceAttributes.CLOUDPLATFORMVALUES_GCP_APP_ENGINE = SemanticResourceAttributes.CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS = SemanticResourceAttributes.CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE = SemanticResourceAttributes.CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = void 0;
    const utils_1 = utils;
    //----------------------------------------------------------------------------------------------------------
    // DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates//templates/SemanticAttributes.ts.j2
    //----------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------
    // Constant values for SemanticResourceAttributes
    //----------------------------------------------------------------------------------------------------------
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_CLOUD_PROVIDER = 'cloud.provider';
    const TMP_CLOUD_ACCOUNT_ID = 'cloud.account.id';
    const TMP_CLOUD_REGION = 'cloud.region';
    const TMP_CLOUD_AVAILABILITY_ZONE = 'cloud.availability_zone';
    const TMP_CLOUD_PLATFORM = 'cloud.platform';
    const TMP_AWS_ECS_CONTAINER_ARN = 'aws.ecs.container.arn';
    const TMP_AWS_ECS_CLUSTER_ARN = 'aws.ecs.cluster.arn';
    const TMP_AWS_ECS_LAUNCHTYPE = 'aws.ecs.launchtype';
    const TMP_AWS_ECS_TASK_ARN = 'aws.ecs.task.arn';
    const TMP_AWS_ECS_TASK_FAMILY = 'aws.ecs.task.family';
    const TMP_AWS_ECS_TASK_REVISION = 'aws.ecs.task.revision';
    const TMP_AWS_EKS_CLUSTER_ARN = 'aws.eks.cluster.arn';
    const TMP_AWS_LOG_GROUP_NAMES = 'aws.log.group.names';
    const TMP_AWS_LOG_GROUP_ARNS = 'aws.log.group.arns';
    const TMP_AWS_LOG_STREAM_NAMES = 'aws.log.stream.names';
    const TMP_AWS_LOG_STREAM_ARNS = 'aws.log.stream.arns';
    const TMP_CONTAINER_NAME = 'container.name';
    const TMP_CONTAINER_ID = 'container.id';
    const TMP_CONTAINER_RUNTIME = 'container.runtime';
    const TMP_CONTAINER_IMAGE_NAME = 'container.image.name';
    const TMP_CONTAINER_IMAGE_TAG = 'container.image.tag';
    const TMP_DEPLOYMENT_ENVIRONMENT = 'deployment.environment';
    const TMP_DEVICE_ID = 'device.id';
    const TMP_DEVICE_MODEL_IDENTIFIER = 'device.model.identifier';
    const TMP_DEVICE_MODEL_NAME = 'device.model.name';
    const TMP_FAAS_NAME = 'faas.name';
    const TMP_FAAS_ID = 'faas.id';
    const TMP_FAAS_VERSION = 'faas.version';
    const TMP_FAAS_INSTANCE = 'faas.instance';
    const TMP_FAAS_MAX_MEMORY = 'faas.max_memory';
    const TMP_HOST_ID = 'host.id';
    const TMP_HOST_NAME = 'host.name';
    const TMP_HOST_TYPE = 'host.type';
    const TMP_HOST_ARCH = 'host.arch';
    const TMP_HOST_IMAGE_NAME = 'host.image.name';
    const TMP_HOST_IMAGE_ID = 'host.image.id';
    const TMP_HOST_IMAGE_VERSION = 'host.image.version';
    const TMP_K8S_CLUSTER_NAME = 'k8s.cluster.name';
    const TMP_K8S_NODE_NAME = 'k8s.node.name';
    const TMP_K8S_NODE_UID = 'k8s.node.uid';
    const TMP_K8S_NAMESPACE_NAME = 'k8s.namespace.name';
    const TMP_K8S_POD_UID = 'k8s.pod.uid';
    const TMP_K8S_POD_NAME = 'k8s.pod.name';
    const TMP_K8S_CONTAINER_NAME = 'k8s.container.name';
    const TMP_K8S_REPLICASET_UID = 'k8s.replicaset.uid';
    const TMP_K8S_REPLICASET_NAME = 'k8s.replicaset.name';
    const TMP_K8S_DEPLOYMENT_UID = 'k8s.deployment.uid';
    const TMP_K8S_DEPLOYMENT_NAME = 'k8s.deployment.name';
    const TMP_K8S_STATEFULSET_UID = 'k8s.statefulset.uid';
    const TMP_K8S_STATEFULSET_NAME = 'k8s.statefulset.name';
    const TMP_K8S_DAEMONSET_UID = 'k8s.daemonset.uid';
    const TMP_K8S_DAEMONSET_NAME = 'k8s.daemonset.name';
    const TMP_K8S_JOB_UID = 'k8s.job.uid';
    const TMP_K8S_JOB_NAME = 'k8s.job.name';
    const TMP_K8S_CRONJOB_UID = 'k8s.cronjob.uid';
    const TMP_K8S_CRONJOB_NAME = 'k8s.cronjob.name';
    const TMP_OS_TYPE = 'os.type';
    const TMP_OS_DESCRIPTION = 'os.description';
    const TMP_OS_NAME = 'os.name';
    const TMP_OS_VERSION = 'os.version';
    const TMP_PROCESS_PID = 'process.pid';
    const TMP_PROCESS_EXECUTABLE_NAME = 'process.executable.name';
    const TMP_PROCESS_EXECUTABLE_PATH = 'process.executable.path';
    const TMP_PROCESS_COMMAND = 'process.command';
    const TMP_PROCESS_COMMAND_LINE = 'process.command_line';
    const TMP_PROCESS_COMMAND_ARGS = 'process.command_args';
    const TMP_PROCESS_OWNER = 'process.owner';
    const TMP_PROCESS_RUNTIME_NAME = 'process.runtime.name';
    const TMP_PROCESS_RUNTIME_VERSION = 'process.runtime.version';
    const TMP_PROCESS_RUNTIME_DESCRIPTION = 'process.runtime.description';
    const TMP_SERVICE_NAME = 'service.name';
    const TMP_SERVICE_NAMESPACE = 'service.namespace';
    const TMP_SERVICE_INSTANCE_ID = 'service.instance.id';
    const TMP_SERVICE_VERSION = 'service.version';
    const TMP_TELEMETRY_SDK_NAME = 'telemetry.sdk.name';
    const TMP_TELEMETRY_SDK_LANGUAGE = 'telemetry.sdk.language';
    const TMP_TELEMETRY_SDK_VERSION = 'telemetry.sdk.version';
    const TMP_TELEMETRY_AUTO_VERSION = 'telemetry.auto.version';
    const TMP_WEBENGINE_NAME = 'webengine.name';
    const TMP_WEBENGINE_VERSION = 'webengine.version';
    const TMP_WEBENGINE_DESCRIPTION = 'webengine.description';
    /**
     * Name of the cloud provider.
     *
     * @deprecated use ATTR_CLOUD_PROVIDER
     */
    SemanticResourceAttributes.SEMRESATTRS_CLOUD_PROVIDER = TMP_CLOUD_PROVIDER;
    /**
     * The cloud account ID the resource is assigned to.
     *
     * @deprecated use ATTR_CLOUD_ACCOUNT_ID
     */
    SemanticResourceAttributes.SEMRESATTRS_CLOUD_ACCOUNT_ID = TMP_CLOUD_ACCOUNT_ID;
    /**
     * The geographical region the resource is running. Refer to your provider&#39;s docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/en-us/global-infrastructure/geographies/), or [Google Cloud regions](https://cloud.google.com/about/locations).
     *
     * @deprecated use ATTR_CLOUD_REGION
     */
    SemanticResourceAttributes.SEMRESATTRS_CLOUD_REGION = TMP_CLOUD_REGION;
    /**
     * Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
     *
     * Note: Availability zones are called &#34;zones&#34; on Alibaba Cloud and Google Cloud.
     *
     * @deprecated use ATTR_CLOUD_AVAILABILITY_ZONE
     */
    SemanticResourceAttributes.SEMRESATTRS_CLOUD_AVAILABILITY_ZONE = TMP_CLOUD_AVAILABILITY_ZONE;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated use ATTR_CLOUD_PLATFORM
     */
    SemanticResourceAttributes.SEMRESATTRS_CLOUD_PLATFORM = TMP_CLOUD_PLATFORM;
    /**
     * The Amazon Resource Name (ARN) of an [ECS container instance](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_instances.html).
     *
     * @deprecated use ATTR_AWS_ECS_CONTAINER_ARN
     */
    SemanticResourceAttributes.SEMRESATTRS_AWS_ECS_CONTAINER_ARN = TMP_AWS_ECS_CONTAINER_ARN;
    /**
     * The ARN of an [ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html).
     *
     * @deprecated use ATTR_AWS_ECS_CLUSTER_ARN
     */
    SemanticResourceAttributes.SEMRESATTRS_AWS_ECS_CLUSTER_ARN = TMP_AWS_ECS_CLUSTER_ARN;
    /**
     * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
     *
     * @deprecated use ATTR_AWS_ECS_LAUNCHTYPE
     */
    SemanticResourceAttributes.SEMRESATTRS_AWS_ECS_LAUNCHTYPE = TMP_AWS_ECS_LAUNCHTYPE;
    /**
     * The ARN of an [ECS task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html).
     *
     * @deprecated use ATTR_AWS_ECS_TASK_ARN
     */
    SemanticResourceAttributes.SEMRESATTRS_AWS_ECS_TASK_ARN = TMP_AWS_ECS_TASK_ARN;
    /**
     * The task definition family this task definition is a member of.
     *
     * @deprecated use ATTR_AWS_ECS_TASK_FAMILY
     */
    SemanticResourceAttributes.SEMRESATTRS_AWS_ECS_TASK_FAMILY = TMP_AWS_ECS_TASK_FAMILY;
    /**
     * The revision for this task definition.
     *
     * @deprecated use ATTR_AWS_ECS_TASK_REVISION
     */
    SemanticResourceAttributes.SEMRESATTRS_AWS_ECS_TASK_REVISION = TMP_AWS_ECS_TASK_REVISION;
    /**
     * The ARN of an EKS cluster.
     *
     * @deprecated use ATTR_AWS_EKS_CLUSTER_ARN
     */
    SemanticResourceAttributes.SEMRESATTRS_AWS_EKS_CLUSTER_ARN = TMP_AWS_EKS_CLUSTER_ARN;
    /**
     * The name(s) of the AWS log group(s) an application is writing to.
     *
     * Note: Multiple log groups must be supported for cases like multi-container applications, where a single application has sidecar containers, and each write to their own log group.
     *
     * @deprecated use ATTR_AWS_LOG_GROUP_NAMES
     */
    SemanticResourceAttributes.SEMRESATTRS_AWS_LOG_GROUP_NAMES = TMP_AWS_LOG_GROUP_NAMES;
    /**
     * The Amazon Resource Name(s) (ARN) of the AWS log group(s).
     *
     * Note: See the [log group ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format).
     *
     * @deprecated use ATTR_AWS_LOG_GROUP_ARNS
     */
    SemanticResourceAttributes.SEMRESATTRS_AWS_LOG_GROUP_ARNS = TMP_AWS_LOG_GROUP_ARNS;
    /**
     * The name(s) of the AWS log stream(s) an application is writing to.
     *
     * @deprecated use ATTR_AWS_LOG_STREAM_NAMES
     */
    SemanticResourceAttributes.SEMRESATTRS_AWS_LOG_STREAM_NAMES = TMP_AWS_LOG_STREAM_NAMES;
    /**
     * The ARN(s) of the AWS log stream(s).
     *
     * Note: See the [log stream ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format). One log group can contain several log streams, so these ARNs necessarily identify both a log group and a log stream.
     *
     * @deprecated use ATTR_AWS_LOG_STREAM_ARNS
     */
    SemanticResourceAttributes.SEMRESATTRS_AWS_LOG_STREAM_ARNS = TMP_AWS_LOG_STREAM_ARNS;
    /**
     * Container name.
     *
     * @deprecated use ATTR_CONTAINER_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_CONTAINER_NAME = TMP_CONTAINER_NAME;
    /**
     * Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/reference/run/#container-identification). The UUID might be abbreviated.
     *
     * @deprecated use ATTR_CONTAINER_ID
     */
    SemanticResourceAttributes.SEMRESATTRS_CONTAINER_ID = TMP_CONTAINER_ID;
    /**
     * The container runtime managing this container.
     *
     * @deprecated use ATTR_CONTAINER_RUNTIME
     */
    SemanticResourceAttributes.SEMRESATTRS_CONTAINER_RUNTIME = TMP_CONTAINER_RUNTIME;
    /**
     * Name of the image the container was built on.
     *
     * @deprecated use ATTR_CONTAINER_IMAGE_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_CONTAINER_IMAGE_NAME = TMP_CONTAINER_IMAGE_NAME;
    /**
     * Container image tag.
     *
     * @deprecated use ATTR_CONTAINER_IMAGE_TAG
     */
    SemanticResourceAttributes.SEMRESATTRS_CONTAINER_IMAGE_TAG = TMP_CONTAINER_IMAGE_TAG;
    /**
     * Name of the [deployment environment](https://en.wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
     *
     * @deprecated use ATTR_DEPLOYMENT_ENVIRONMENT
     */
    SemanticResourceAttributes.SEMRESATTRS_DEPLOYMENT_ENVIRONMENT = TMP_DEPLOYMENT_ENVIRONMENT;
    /**
     * A unique identifier representing the device.
     *
     * Note: The device identifier MUST only be defined using the values outlined below. This value is not an advertising identifier and MUST NOT be used as such. On iOS (Swift or Objective-C), this value MUST be equal to the [vendor identifier](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor). On Android (Java or Kotlin), this value MUST be equal to the Firebase Installation ID or a globally unique UUID which is persisted across sessions in your application. More information can be found [here](https://developer.android.com/training/articles/user-data-ids) on best practices and exact implementation details. Caution should be taken when storing personal data or anything which can identify a user. GDPR and data protection laws may apply, ensure you do your own due diligence.
     *
     * @deprecated use ATTR_DEVICE_ID
     */
    SemanticResourceAttributes.SEMRESATTRS_DEVICE_ID = TMP_DEVICE_ID;
    /**
     * The model identifier for the device.
     *
     * Note: It&#39;s recommended this value represents a machine readable version of the model identifier rather than the market or consumer-friendly name of the device.
     *
     * @deprecated use ATTR_DEVICE_MODEL_IDENTIFIER
     */
    SemanticResourceAttributes.SEMRESATTRS_DEVICE_MODEL_IDENTIFIER = TMP_DEVICE_MODEL_IDENTIFIER;
    /**
     * The marketing name for the device model.
     *
     * Note: It&#39;s recommended this value represents a human readable version of the device model rather than a machine readable alternative.
     *
     * @deprecated use ATTR_DEVICE_MODEL_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_DEVICE_MODEL_NAME = TMP_DEVICE_MODEL_NAME;
    /**
     * The name of the single function that this runtime instance executes.
     *
     * Note: This is the name of the function as configured/deployed on the FaaS platform and is usually different from the name of the callback function (which may be stored in the [`code.namespace`/`code.function`](../../trace/semantic_conventions/span-general.md#source-code-attributes) span attributes).
     *
     * @deprecated use ATTR_FAAS_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_FAAS_NAME = TMP_FAAS_NAME;
    /**
    * The unique ID of the single function that this runtime instance executes.
    *
    * Note: Depending on the cloud provider, use:

    * **AWS Lambda:** The function [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html).
    Take care not to use the &#34;invoked ARN&#34; directly but replace any
    [alias suffix](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html) with the resolved function version, as the same runtime instance may be invokable with multiple
    different aliases.
    * **GCP:** The [URI of the resource](https://cloud.google.com/iam/docs/full-resource-names)
    * **Azure:** The [Fully Qualified Resource ID](https://docs.microsoft.com/en-us/rest/api/resources/resources/get-by-id).

    On some providers, it may not be possible to determine the full ID at startup,
    which is why this field cannot be made required. For example, on AWS the account ID
    part of the ARN is not available without calling another AWS API
    which may be deemed too slow for a short-running lambda function.
    As an alternative, consider setting `faas.id` as a span attribute instead.
    *
    * @deprecated use ATTR_FAAS_ID
    */
    SemanticResourceAttributes.SEMRESATTRS_FAAS_ID = TMP_FAAS_ID;
    /**
    * The immutable version of the function being executed.
    *
    * Note: Depending on the cloud provider and platform, use:

    * **AWS Lambda:** The [function version](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)
      (an integer represented as a decimal string).
    * **Google Cloud Run:** The [revision](https://cloud.google.com/run/docs/managing/revisions)
      (i.e., the function name plus the revision suffix).
    * **Google Cloud Functions:** The value of the
      [`K_REVISION` environment variable](https://cloud.google.com/functions/docs/env-var#runtime_environment_variables_set_automatically).
    * **Azure Functions:** Not applicable. Do not set this attribute.
    *
    * @deprecated use ATTR_FAAS_VERSION
    */
    SemanticResourceAttributes.SEMRESATTRS_FAAS_VERSION = TMP_FAAS_VERSION;
    /**
     * The execution environment ID as a string, that will be potentially reused for other invocations to the same function/function version.
     *
     * Note: * **AWS Lambda:** Use the (full) log stream name.
     *
     * @deprecated use ATTR_FAAS_INSTANCE
     */
    SemanticResourceAttributes.SEMRESATTRS_FAAS_INSTANCE = TMP_FAAS_INSTANCE;
    /**
     * The amount of memory available to the serverless function in MiB.
     *
     * Note: It&#39;s recommended to set this attribute since e.g. too little memory can easily stop a Java AWS Lambda function from working correctly. On AWS Lambda, the environment variable `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` provides this information.
     *
     * @deprecated use ATTR_FAAS_MAX_MEMORY
     */
    SemanticResourceAttributes.SEMRESATTRS_FAAS_MAX_MEMORY = TMP_FAAS_MAX_MEMORY;
    /**
     * Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider.
     *
     * @deprecated use ATTR_HOST_ID
     */
    SemanticResourceAttributes.SEMRESATTRS_HOST_ID = TMP_HOST_ID;
    /**
     * Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
     *
     * @deprecated use ATTR_HOST_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_HOST_NAME = TMP_HOST_NAME;
    /**
     * Type of host. For Cloud, this must be the machine type.
     *
     * @deprecated use ATTR_HOST_TYPE
     */
    SemanticResourceAttributes.SEMRESATTRS_HOST_TYPE = TMP_HOST_TYPE;
    /**
     * The CPU architecture the host system is running on.
     *
     * @deprecated use ATTR_HOST_ARCH
     */
    SemanticResourceAttributes.SEMRESATTRS_HOST_ARCH = TMP_HOST_ARCH;
    /**
     * Name of the VM image or OS install the host was instantiated from.
     *
     * @deprecated use ATTR_HOST_IMAGE_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_HOST_IMAGE_NAME = TMP_HOST_IMAGE_NAME;
    /**
     * VM image ID. For Cloud, this value is from the provider.
     *
     * @deprecated use ATTR_HOST_IMAGE_ID
     */
    SemanticResourceAttributes.SEMRESATTRS_HOST_IMAGE_ID = TMP_HOST_IMAGE_ID;
    /**
     * The version string of the VM image as defined in [Version Attributes](README.md#version-attributes).
     *
     * @deprecated use ATTR_HOST_IMAGE_VERSION
     */
    SemanticResourceAttributes.SEMRESATTRS_HOST_IMAGE_VERSION = TMP_HOST_IMAGE_VERSION;
    /**
     * The name of the cluster.
     *
     * @deprecated use ATTR_K8S_CLUSTER_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_CLUSTER_NAME = TMP_K8S_CLUSTER_NAME;
    /**
     * The name of the Node.
     *
     * @deprecated use ATTR_K8S_NODE_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_NODE_NAME = TMP_K8S_NODE_NAME;
    /**
     * The UID of the Node.
     *
     * @deprecated use ATTR_K8S_NODE_UID
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_NODE_UID = TMP_K8S_NODE_UID;
    /**
     * The name of the namespace that the pod is running in.
     *
     * @deprecated use ATTR_K8S_NAMESPACE_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_NAMESPACE_NAME = TMP_K8S_NAMESPACE_NAME;
    /**
     * The UID of the Pod.
     *
     * @deprecated use ATTR_K8S_POD_UID
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_POD_UID = TMP_K8S_POD_UID;
    /**
     * The name of the Pod.
     *
     * @deprecated use ATTR_K8S_POD_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_POD_NAME = TMP_K8S_POD_NAME;
    /**
     * The name of the Container in a Pod template.
     *
     * @deprecated use ATTR_K8S_CONTAINER_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_CONTAINER_NAME = TMP_K8S_CONTAINER_NAME;
    /**
     * The UID of the ReplicaSet.
     *
     * @deprecated use ATTR_K8S_REPLICASET_UID
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_REPLICASET_UID = TMP_K8S_REPLICASET_UID;
    /**
     * The name of the ReplicaSet.
     *
     * @deprecated use ATTR_K8S_REPLICASET_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_REPLICASET_NAME = TMP_K8S_REPLICASET_NAME;
    /**
     * The UID of the Deployment.
     *
     * @deprecated use ATTR_K8S_DEPLOYMENT_UID
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_DEPLOYMENT_UID = TMP_K8S_DEPLOYMENT_UID;
    /**
     * The name of the Deployment.
     *
     * @deprecated use ATTR_K8S_DEPLOYMENT_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_DEPLOYMENT_NAME = TMP_K8S_DEPLOYMENT_NAME;
    /**
     * The UID of the StatefulSet.
     *
     * @deprecated use ATTR_K8S_STATEFULSET_UID
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_STATEFULSET_UID = TMP_K8S_STATEFULSET_UID;
    /**
     * The name of the StatefulSet.
     *
     * @deprecated use ATTR_K8S_STATEFULSET_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_STATEFULSET_NAME = TMP_K8S_STATEFULSET_NAME;
    /**
     * The UID of the DaemonSet.
     *
     * @deprecated use ATTR_K8S_DAEMONSET_UID
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_DAEMONSET_UID = TMP_K8S_DAEMONSET_UID;
    /**
     * The name of the DaemonSet.
     *
     * @deprecated use ATTR_K8S_DAEMONSET_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_DAEMONSET_NAME = TMP_K8S_DAEMONSET_NAME;
    /**
     * The UID of the Job.
     *
     * @deprecated use ATTR_K8S_JOB_UID
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_JOB_UID = TMP_K8S_JOB_UID;
    /**
     * The name of the Job.
     *
     * @deprecated use ATTR_K8S_JOB_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_JOB_NAME = TMP_K8S_JOB_NAME;
    /**
     * The UID of the CronJob.
     *
     * @deprecated use ATTR_K8S_CRONJOB_UID
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_CRONJOB_UID = TMP_K8S_CRONJOB_UID;
    /**
     * The name of the CronJob.
     *
     * @deprecated use ATTR_K8S_CRONJOB_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_K8S_CRONJOB_NAME = TMP_K8S_CRONJOB_NAME;
    /**
     * The operating system type.
     *
     * @deprecated use ATTR_OS_TYPE
     */
    SemanticResourceAttributes.SEMRESATTRS_OS_TYPE = TMP_OS_TYPE;
    /**
     * Human readable (not intended to be parsed) OS version information, like e.g. reported by `ver` or `lsb_release -a` commands.
     *
     * @deprecated use ATTR_OS_DESCRIPTION
     */
    SemanticResourceAttributes.SEMRESATTRS_OS_DESCRIPTION = TMP_OS_DESCRIPTION;
    /**
     * Human readable operating system name.
     *
     * @deprecated use ATTR_OS_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_OS_NAME = TMP_OS_NAME;
    /**
     * The version string of the operating system as defined in [Version Attributes](../../resource/semantic_conventions/README.md#version-attributes).
     *
     * @deprecated use ATTR_OS_VERSION
     */
    SemanticResourceAttributes.SEMRESATTRS_OS_VERSION = TMP_OS_VERSION;
    /**
     * Process identifier (PID).
     *
     * @deprecated use ATTR_PROCESS_PID
     */
    SemanticResourceAttributes.SEMRESATTRS_PROCESS_PID = TMP_PROCESS_PID;
    /**
     * The name of the process executable. On Linux based systems, can be set to the `Name` in `proc/[pid]/status`. On Windows, can be set to the base name of `GetProcessImageFileNameW`.
     *
     * @deprecated use ATTR_PROCESS_EXECUTABLE_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_PROCESS_EXECUTABLE_NAME = TMP_PROCESS_EXECUTABLE_NAME;
    /**
     * The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
     *
     * @deprecated use ATTR_PROCESS_EXECUTABLE_PATH
     */
    SemanticResourceAttributes.SEMRESATTRS_PROCESS_EXECUTABLE_PATH = TMP_PROCESS_EXECUTABLE_PATH;
    /**
     * The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
     *
     * @deprecated use ATTR_PROCESS_COMMAND
     */
    SemanticResourceAttributes.SEMRESATTRS_PROCESS_COMMAND = TMP_PROCESS_COMMAND;
    /**
     * The full command used to launch the process as a single string representing the full command. On Windows, can be set to the result of `GetCommandLineW`. Do not set this if you have to assemble it just for monitoring; use `process.command_args` instead.
     *
     * @deprecated use ATTR_PROCESS_COMMAND_LINE
     */
    SemanticResourceAttributes.SEMRESATTRS_PROCESS_COMMAND_LINE = TMP_PROCESS_COMMAND_LINE;
    /**
     * All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
     *
     * @deprecated use ATTR_PROCESS_COMMAND_ARGS
     */
    SemanticResourceAttributes.SEMRESATTRS_PROCESS_COMMAND_ARGS = TMP_PROCESS_COMMAND_ARGS;
    /**
     * The username of the user that owns the process.
     *
     * @deprecated use ATTR_PROCESS_OWNER
     */
    SemanticResourceAttributes.SEMRESATTRS_PROCESS_OWNER = TMP_PROCESS_OWNER;
    /**
     * The name of the runtime of this process. For compiled native binaries, this SHOULD be the name of the compiler.
     *
     * @deprecated use ATTR_PROCESS_RUNTIME_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_PROCESS_RUNTIME_NAME = TMP_PROCESS_RUNTIME_NAME;
    /**
     * The version of the runtime of this process, as returned by the runtime without modification.
     *
     * @deprecated use ATTR_PROCESS_RUNTIME_VERSION
     */
    SemanticResourceAttributes.SEMRESATTRS_PROCESS_RUNTIME_VERSION = TMP_PROCESS_RUNTIME_VERSION;
    /**
     * An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
     *
     * @deprecated use ATTR_PROCESS_RUNTIME_DESCRIPTION
     */
    SemanticResourceAttributes.SEMRESATTRS_PROCESS_RUNTIME_DESCRIPTION = TMP_PROCESS_RUNTIME_DESCRIPTION;
    /**
     * Logical name of the service.
     *
     * Note: MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs MUST fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md#process), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value MUST be set to `unknown_service`.
     *
     * @deprecated use ATTR_SERVICE_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_SERVICE_NAME = TMP_SERVICE_NAME;
    /**
     * A namespace for `service.name`.
     *
     * Note: A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
     *
     * @deprecated use ATTR_SERVICE_NAMESPACE
     */
    SemanticResourceAttributes.SEMRESATTRS_SERVICE_NAMESPACE = TMP_SERVICE_NAMESPACE;
    /**
     * The string ID of the service instance.
     *
     * Note: MUST be unique for each instance of the same `service.namespace,service.name` pair (in other words `service.namespace,service.name,service.instance.id` triplet MUST be globally unique). The ID helps to distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled service). It is preferable for the ID to be persistent and stay the same for the lifetime of the service instance, however it is acceptable that the ID is ephemeral and changes during important lifetime events for the service (e.g. service restarts). If the service has no inherent unique ID that can be used as the value of this attribute it is recommended to generate a random Version 1 or Version 4 RFC 4122 UUID (services aiming for reproducible UUIDs may also use Version 5, see RFC 4122 for more recommendations).
     *
     * @deprecated use ATTR_SERVICE_INSTANCE_ID
     */
    SemanticResourceAttributes.SEMRESATTRS_SERVICE_INSTANCE_ID = TMP_SERVICE_INSTANCE_ID;
    /**
     * The version string of the service API or implementation.
     *
     * @deprecated use ATTR_SERVICE_VERSION
     */
    SemanticResourceAttributes.SEMRESATTRS_SERVICE_VERSION = TMP_SERVICE_VERSION;
    /**
     * The name of the telemetry SDK as defined above.
     *
     * @deprecated use ATTR_TELEMETRY_SDK_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_TELEMETRY_SDK_NAME = TMP_TELEMETRY_SDK_NAME;
    /**
     * The language of the telemetry SDK.
     *
     * @deprecated use ATTR_TELEMETRY_SDK_LANGUAGE
     */
    SemanticResourceAttributes.SEMRESATTRS_TELEMETRY_SDK_LANGUAGE = TMP_TELEMETRY_SDK_LANGUAGE;
    /**
     * The version string of the telemetry SDK.
     *
     * @deprecated use ATTR_TELEMETRY_SDK_VERSION
     */
    SemanticResourceAttributes.SEMRESATTRS_TELEMETRY_SDK_VERSION = TMP_TELEMETRY_SDK_VERSION;
    /**
     * The version string of the auto instrumentation agent, if used.
     *
     * @deprecated use ATTR_TELEMETRY_AUTO_VERSION
     */
    SemanticResourceAttributes.SEMRESATTRS_TELEMETRY_AUTO_VERSION = TMP_TELEMETRY_AUTO_VERSION;
    /**
     * The name of the web engine.
     *
     * @deprecated use ATTR_WEBENGINE_NAME
     */
    SemanticResourceAttributes.SEMRESATTRS_WEBENGINE_NAME = TMP_WEBENGINE_NAME;
    /**
     * The version of the web engine.
     *
     * @deprecated use ATTR_WEBENGINE_VERSION
     */
    SemanticResourceAttributes.SEMRESATTRS_WEBENGINE_VERSION = TMP_WEBENGINE_VERSION;
    /**
     * Additional description of the web engine (e.g. detailed version and edition information).
     *
     * @deprecated use ATTR_WEBENGINE_DESCRIPTION
     */
    SemanticResourceAttributes.SEMRESATTRS_WEBENGINE_DESCRIPTION = TMP_WEBENGINE_DESCRIPTION;
    /**
     * Create exported Value Map for SemanticResourceAttributes values
     * @deprecated Use the SEMRESATTRS_XXXXX constants rather than the SemanticResourceAttributes.XXXXX for bundle minification
     */
    SemanticResourceAttributes.SemanticResourceAttributes = 
    /*#__PURE__*/ (0, utils_1.createConstMap)([
        TMP_CLOUD_PROVIDER,
        TMP_CLOUD_ACCOUNT_ID,
        TMP_CLOUD_REGION,
        TMP_CLOUD_AVAILABILITY_ZONE,
        TMP_CLOUD_PLATFORM,
        TMP_AWS_ECS_CONTAINER_ARN,
        TMP_AWS_ECS_CLUSTER_ARN,
        TMP_AWS_ECS_LAUNCHTYPE,
        TMP_AWS_ECS_TASK_ARN,
        TMP_AWS_ECS_TASK_FAMILY,
        TMP_AWS_ECS_TASK_REVISION,
        TMP_AWS_EKS_CLUSTER_ARN,
        TMP_AWS_LOG_GROUP_NAMES,
        TMP_AWS_LOG_GROUP_ARNS,
        TMP_AWS_LOG_STREAM_NAMES,
        TMP_AWS_LOG_STREAM_ARNS,
        TMP_CONTAINER_NAME,
        TMP_CONTAINER_ID,
        TMP_CONTAINER_RUNTIME,
        TMP_CONTAINER_IMAGE_NAME,
        TMP_CONTAINER_IMAGE_TAG,
        TMP_DEPLOYMENT_ENVIRONMENT,
        TMP_DEVICE_ID,
        TMP_DEVICE_MODEL_IDENTIFIER,
        TMP_DEVICE_MODEL_NAME,
        TMP_FAAS_NAME,
        TMP_FAAS_ID,
        TMP_FAAS_VERSION,
        TMP_FAAS_INSTANCE,
        TMP_FAAS_MAX_MEMORY,
        TMP_HOST_ID,
        TMP_HOST_NAME,
        TMP_HOST_TYPE,
        TMP_HOST_ARCH,
        TMP_HOST_IMAGE_NAME,
        TMP_HOST_IMAGE_ID,
        TMP_HOST_IMAGE_VERSION,
        TMP_K8S_CLUSTER_NAME,
        TMP_K8S_NODE_NAME,
        TMP_K8S_NODE_UID,
        TMP_K8S_NAMESPACE_NAME,
        TMP_K8S_POD_UID,
        TMP_K8S_POD_NAME,
        TMP_K8S_CONTAINER_NAME,
        TMP_K8S_REPLICASET_UID,
        TMP_K8S_REPLICASET_NAME,
        TMP_K8S_DEPLOYMENT_UID,
        TMP_K8S_DEPLOYMENT_NAME,
        TMP_K8S_STATEFULSET_UID,
        TMP_K8S_STATEFULSET_NAME,
        TMP_K8S_DAEMONSET_UID,
        TMP_K8S_DAEMONSET_NAME,
        TMP_K8S_JOB_UID,
        TMP_K8S_JOB_NAME,
        TMP_K8S_CRONJOB_UID,
        TMP_K8S_CRONJOB_NAME,
        TMP_OS_TYPE,
        TMP_OS_DESCRIPTION,
        TMP_OS_NAME,
        TMP_OS_VERSION,
        TMP_PROCESS_PID,
        TMP_PROCESS_EXECUTABLE_NAME,
        TMP_PROCESS_EXECUTABLE_PATH,
        TMP_PROCESS_COMMAND,
        TMP_PROCESS_COMMAND_LINE,
        TMP_PROCESS_COMMAND_ARGS,
        TMP_PROCESS_OWNER,
        TMP_PROCESS_RUNTIME_NAME,
        TMP_PROCESS_RUNTIME_VERSION,
        TMP_PROCESS_RUNTIME_DESCRIPTION,
        TMP_SERVICE_NAME,
        TMP_SERVICE_NAMESPACE,
        TMP_SERVICE_INSTANCE_ID,
        TMP_SERVICE_VERSION,
        TMP_TELEMETRY_SDK_NAME,
        TMP_TELEMETRY_SDK_LANGUAGE,
        TMP_TELEMETRY_SDK_VERSION,
        TMP_TELEMETRY_AUTO_VERSION,
        TMP_WEBENGINE_NAME,
        TMP_WEBENGINE_VERSION,
        TMP_WEBENGINE_DESCRIPTION,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for CloudProviderValues enum definition
     *
     * Name of the cloud provider.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_CLOUDPROVIDERVALUES_ALIBABA_CLOUD = 'alibaba_cloud';
    const TMP_CLOUDPROVIDERVALUES_AWS = 'aws';
    const TMP_CLOUDPROVIDERVALUES_AZURE = 'azure';
    const TMP_CLOUDPROVIDERVALUES_GCP = 'gcp';
    /**
     * Name of the cloud provider.
     *
     * @deprecated Use CLOUD_PROVIDER_VALUE_ALIBABA_CLOUD.
     */
    SemanticResourceAttributes.CLOUDPROVIDERVALUES_ALIBABA_CLOUD = TMP_CLOUDPROVIDERVALUES_ALIBABA_CLOUD;
    /**
     * Name of the cloud provider.
     *
     * @deprecated Use CLOUD_PROVIDER_VALUE_AWS.
     */
    SemanticResourceAttributes.CLOUDPROVIDERVALUES_AWS = TMP_CLOUDPROVIDERVALUES_AWS;
    /**
     * Name of the cloud provider.
     *
     * @deprecated Use CLOUD_PROVIDER_VALUE_AZURE.
     */
    SemanticResourceAttributes.CLOUDPROVIDERVALUES_AZURE = TMP_CLOUDPROVIDERVALUES_AZURE;
    /**
     * Name of the cloud provider.
     *
     * @deprecated Use CLOUD_PROVIDER_VALUE_GCP.
     */
    SemanticResourceAttributes.CLOUDPROVIDERVALUES_GCP = TMP_CLOUDPROVIDERVALUES_GCP;
    /**
     * The constant map of values for CloudProviderValues.
     * @deprecated Use the CLOUDPROVIDERVALUES_XXXXX constants rather than the CloudProviderValues.XXXXX for bundle minification.
     */
    SemanticResourceAttributes.CloudProviderValues = 
    /*#__PURE__*/ (0, utils_1.createConstMap)([
        TMP_CLOUDPROVIDERVALUES_ALIBABA_CLOUD,
        TMP_CLOUDPROVIDERVALUES_AWS,
        TMP_CLOUDPROVIDERVALUES_AZURE,
        TMP_CLOUDPROVIDERVALUES_GCP,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for CloudPlatformValues enum definition
     *
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS = 'alibaba_cloud_ecs';
    const TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC = 'alibaba_cloud_fc';
    const TMP_CLOUDPLATFORMVALUES_AWS_EC2 = 'aws_ec2';
    const TMP_CLOUDPLATFORMVALUES_AWS_ECS = 'aws_ecs';
    const TMP_CLOUDPLATFORMVALUES_AWS_EKS = 'aws_eks';
    const TMP_CLOUDPLATFORMVALUES_AWS_LAMBDA = 'aws_lambda';
    const TMP_CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK = 'aws_elastic_beanstalk';
    const TMP_CLOUDPLATFORMVALUES_AZURE_VM = 'azure_vm';
    const TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES = 'azure_container_instances';
    const TMP_CLOUDPLATFORMVALUES_AZURE_AKS = 'azure_aks';
    const TMP_CLOUDPLATFORMVALUES_AZURE_FUNCTIONS = 'azure_functions';
    const TMP_CLOUDPLATFORMVALUES_AZURE_APP_SERVICE = 'azure_app_service';
    const TMP_CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE = 'gcp_compute_engine';
    const TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = 'gcp_cloud_run';
    const TMP_CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE = 'gcp_kubernetes_engine';
    const TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS = 'gcp_cloud_functions';
    const TMP_CLOUDPLATFORMVALUES_GCP_APP_ENGINE = 'gcp_app_engine';
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_ALIBABA_CLOUD_ECS.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS = TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_ALIBABA_CLOUD_FC.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC = TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_AWS_EC2.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_AWS_EC2 = TMP_CLOUDPLATFORMVALUES_AWS_EC2;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_AWS_ECS.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_AWS_ECS = TMP_CLOUDPLATFORMVALUES_AWS_ECS;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_AWS_EKS.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_AWS_EKS = TMP_CLOUDPLATFORMVALUES_AWS_EKS;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_AWS_LAMBDA.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_AWS_LAMBDA = TMP_CLOUDPLATFORMVALUES_AWS_LAMBDA;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_AWS_ELASTIC_BEANSTALK.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK = TMP_CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_VM.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_AZURE_VM = TMP_CLOUDPLATFORMVALUES_AZURE_VM;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_CONTAINER_INSTANCES.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES = TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_AKS.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_AZURE_AKS = TMP_CLOUDPLATFORMVALUES_AZURE_AKS;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_FUNCTIONS.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_AZURE_FUNCTIONS = TMP_CLOUDPLATFORMVALUES_AZURE_FUNCTIONS;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_APP_SERVICE.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_AZURE_APP_SERVICE = TMP_CLOUDPLATFORMVALUES_AZURE_APP_SERVICE;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_GCP_COMPUTE_ENGINE.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE = TMP_CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_GCP_CLOUD_RUN.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_GCP_KUBERNETES_ENGINE.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE = TMP_CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_GCP_CLOUD_FUNCTIONS.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS = TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS;
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     *
     * @deprecated Use CLOUD_PLATFORM_VALUE_GCP_APP_ENGINE.
     */
    SemanticResourceAttributes.CLOUDPLATFORMVALUES_GCP_APP_ENGINE = TMP_CLOUDPLATFORMVALUES_GCP_APP_ENGINE;
    /**
     * The constant map of values for CloudPlatformValues.
     * @deprecated Use the CLOUDPLATFORMVALUES_XXXXX constants rather than the CloudPlatformValues.XXXXX for bundle minification.
     */
    SemanticResourceAttributes.CloudPlatformValues = 
    /*#__PURE__*/ (0, utils_1.createConstMap)([
        TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS,
        TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC,
        TMP_CLOUDPLATFORMVALUES_AWS_EC2,
        TMP_CLOUDPLATFORMVALUES_AWS_ECS,
        TMP_CLOUDPLATFORMVALUES_AWS_EKS,
        TMP_CLOUDPLATFORMVALUES_AWS_LAMBDA,
        TMP_CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK,
        TMP_CLOUDPLATFORMVALUES_AZURE_VM,
        TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES,
        TMP_CLOUDPLATFORMVALUES_AZURE_AKS,
        TMP_CLOUDPLATFORMVALUES_AZURE_FUNCTIONS,
        TMP_CLOUDPLATFORMVALUES_AZURE_APP_SERVICE,
        TMP_CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE,
        TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN,
        TMP_CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE,
        TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS,
        TMP_CLOUDPLATFORMVALUES_GCP_APP_ENGINE,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for AwsEcsLaunchtypeValues enum definition
     *
     * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_AWSECSLAUNCHTYPEVALUES_EC2 = 'ec2';
    const TMP_AWSECSLAUNCHTYPEVALUES_FARGATE = 'fargate';
    /**
     * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
     *
     * @deprecated Use AWS_ECS_LAUNCHTYPE_VALUE_EC2.
     */
    SemanticResourceAttributes.AWSECSLAUNCHTYPEVALUES_EC2 = TMP_AWSECSLAUNCHTYPEVALUES_EC2;
    /**
     * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
     *
     * @deprecated Use AWS_ECS_LAUNCHTYPE_VALUE_FARGATE.
     */
    SemanticResourceAttributes.AWSECSLAUNCHTYPEVALUES_FARGATE = TMP_AWSECSLAUNCHTYPEVALUES_FARGATE;
    /**
     * The constant map of values for AwsEcsLaunchtypeValues.
     * @deprecated Use the AWSECSLAUNCHTYPEVALUES_XXXXX constants rather than the AwsEcsLaunchtypeValues.XXXXX for bundle minification.
     */
    SemanticResourceAttributes.AwsEcsLaunchtypeValues = 
    /*#__PURE__*/ (0, utils_1.createConstMap)([
        TMP_AWSECSLAUNCHTYPEVALUES_EC2,
        TMP_AWSECSLAUNCHTYPEVALUES_FARGATE,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for HostArchValues enum definition
     *
     * The CPU architecture the host system is running on.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_HOSTARCHVALUES_AMD64 = 'amd64';
    const TMP_HOSTARCHVALUES_ARM32 = 'arm32';
    const TMP_HOSTARCHVALUES_ARM64 = 'arm64';
    const TMP_HOSTARCHVALUES_IA64 = 'ia64';
    const TMP_HOSTARCHVALUES_PPC32 = 'ppc32';
    const TMP_HOSTARCHVALUES_PPC64 = 'ppc64';
    const TMP_HOSTARCHVALUES_X86 = 'x86';
    /**
     * The CPU architecture the host system is running on.
     *
     * @deprecated Use HOST_ARCH_VALUE_AMD64.
     */
    SemanticResourceAttributes.HOSTARCHVALUES_AMD64 = TMP_HOSTARCHVALUES_AMD64;
    /**
     * The CPU architecture the host system is running on.
     *
     * @deprecated Use HOST_ARCH_VALUE_ARM32.
     */
    SemanticResourceAttributes.HOSTARCHVALUES_ARM32 = TMP_HOSTARCHVALUES_ARM32;
    /**
     * The CPU architecture the host system is running on.
     *
     * @deprecated Use HOST_ARCH_VALUE_ARM64.
     */
    SemanticResourceAttributes.HOSTARCHVALUES_ARM64 = TMP_HOSTARCHVALUES_ARM64;
    /**
     * The CPU architecture the host system is running on.
     *
     * @deprecated Use HOST_ARCH_VALUE_IA64.
     */
    SemanticResourceAttributes.HOSTARCHVALUES_IA64 = TMP_HOSTARCHVALUES_IA64;
    /**
     * The CPU architecture the host system is running on.
     *
     * @deprecated Use HOST_ARCH_VALUE_PPC32.
     */
    SemanticResourceAttributes.HOSTARCHVALUES_PPC32 = TMP_HOSTARCHVALUES_PPC32;
    /**
     * The CPU architecture the host system is running on.
     *
     * @deprecated Use HOST_ARCH_VALUE_PPC64.
     */
    SemanticResourceAttributes.HOSTARCHVALUES_PPC64 = TMP_HOSTARCHVALUES_PPC64;
    /**
     * The CPU architecture the host system is running on.
     *
     * @deprecated Use HOST_ARCH_VALUE_X86.
     */
    SemanticResourceAttributes.HOSTARCHVALUES_X86 = TMP_HOSTARCHVALUES_X86;
    /**
     * The constant map of values for HostArchValues.
     * @deprecated Use the HOSTARCHVALUES_XXXXX constants rather than the HostArchValues.XXXXX for bundle minification.
     */
    SemanticResourceAttributes.HostArchValues = 
    /*#__PURE__*/ (0, utils_1.createConstMap)([
        TMP_HOSTARCHVALUES_AMD64,
        TMP_HOSTARCHVALUES_ARM32,
        TMP_HOSTARCHVALUES_ARM64,
        TMP_HOSTARCHVALUES_IA64,
        TMP_HOSTARCHVALUES_PPC32,
        TMP_HOSTARCHVALUES_PPC64,
        TMP_HOSTARCHVALUES_X86,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for OsTypeValues enum definition
     *
     * The operating system type.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_OSTYPEVALUES_WINDOWS = 'windows';
    const TMP_OSTYPEVALUES_LINUX = 'linux';
    const TMP_OSTYPEVALUES_DARWIN = 'darwin';
    const TMP_OSTYPEVALUES_FREEBSD = 'freebsd';
    const TMP_OSTYPEVALUES_NETBSD = 'netbsd';
    const TMP_OSTYPEVALUES_OPENBSD = 'openbsd';
    const TMP_OSTYPEVALUES_DRAGONFLYBSD = 'dragonflybsd';
    const TMP_OSTYPEVALUES_HPUX = 'hpux';
    const TMP_OSTYPEVALUES_AIX = 'aix';
    const TMP_OSTYPEVALUES_SOLARIS = 'solaris';
    const TMP_OSTYPEVALUES_Z_OS = 'z_os';
    /**
     * The operating system type.
     *
     * @deprecated Use OS_TYPE_VALUE_WINDOWS.
     */
    SemanticResourceAttributes.OSTYPEVALUES_WINDOWS = TMP_OSTYPEVALUES_WINDOWS;
    /**
     * The operating system type.
     *
     * @deprecated Use OS_TYPE_VALUE_LINUX.
     */
    SemanticResourceAttributes.OSTYPEVALUES_LINUX = TMP_OSTYPEVALUES_LINUX;
    /**
     * The operating system type.
     *
     * @deprecated Use OS_TYPE_VALUE_DARWIN.
     */
    SemanticResourceAttributes.OSTYPEVALUES_DARWIN = TMP_OSTYPEVALUES_DARWIN;
    /**
     * The operating system type.
     *
     * @deprecated Use OS_TYPE_VALUE_FREEBSD.
     */
    SemanticResourceAttributes.OSTYPEVALUES_FREEBSD = TMP_OSTYPEVALUES_FREEBSD;
    /**
     * The operating system type.
     *
     * @deprecated Use OS_TYPE_VALUE_NETBSD.
     */
    SemanticResourceAttributes.OSTYPEVALUES_NETBSD = TMP_OSTYPEVALUES_NETBSD;
    /**
     * The operating system type.
     *
     * @deprecated Use OS_TYPE_VALUE_OPENBSD.
     */
    SemanticResourceAttributes.OSTYPEVALUES_OPENBSD = TMP_OSTYPEVALUES_OPENBSD;
    /**
     * The operating system type.
     *
     * @deprecated Use OS_TYPE_VALUE_DRAGONFLYBSD.
     */
    SemanticResourceAttributes.OSTYPEVALUES_DRAGONFLYBSD = TMP_OSTYPEVALUES_DRAGONFLYBSD;
    /**
     * The operating system type.
     *
     * @deprecated Use OS_TYPE_VALUE_HPUX.
     */
    SemanticResourceAttributes.OSTYPEVALUES_HPUX = TMP_OSTYPEVALUES_HPUX;
    /**
     * The operating system type.
     *
     * @deprecated Use OS_TYPE_VALUE_AIX.
     */
    SemanticResourceAttributes.OSTYPEVALUES_AIX = TMP_OSTYPEVALUES_AIX;
    /**
     * The operating system type.
     *
     * @deprecated Use OS_TYPE_VALUE_SOLARIS.
     */
    SemanticResourceAttributes.OSTYPEVALUES_SOLARIS = TMP_OSTYPEVALUES_SOLARIS;
    /**
     * The operating system type.
     *
     * @deprecated Use OS_TYPE_VALUE_Z_OS.
     */
    SemanticResourceAttributes.OSTYPEVALUES_Z_OS = TMP_OSTYPEVALUES_Z_OS;
    /**
     * The constant map of values for OsTypeValues.
     * @deprecated Use the OSTYPEVALUES_XXXXX constants rather than the OsTypeValues.XXXXX for bundle minification.
     */
    SemanticResourceAttributes.OsTypeValues = 
    /*#__PURE__*/ (0, utils_1.createConstMap)([
        TMP_OSTYPEVALUES_WINDOWS,
        TMP_OSTYPEVALUES_LINUX,
        TMP_OSTYPEVALUES_DARWIN,
        TMP_OSTYPEVALUES_FREEBSD,
        TMP_OSTYPEVALUES_NETBSD,
        TMP_OSTYPEVALUES_OPENBSD,
        TMP_OSTYPEVALUES_DRAGONFLYBSD,
        TMP_OSTYPEVALUES_HPUX,
        TMP_OSTYPEVALUES_AIX,
        TMP_OSTYPEVALUES_SOLARIS,
        TMP_OSTYPEVALUES_Z_OS,
    ]);
    /* ----------------------------------------------------------------------------------------------------------
     * Constant values for TelemetrySdkLanguageValues enum definition
     *
     * The language of the telemetry SDK.
     * ---------------------------------------------------------------------------------------------------------- */
    // Temporary local constants to assign to the individual exports and the namespaced version
    // Required to avoid the namespace exports using the unminifiable export names for some package types
    const TMP_TELEMETRYSDKLANGUAGEVALUES_CPP = 'cpp';
    const TMP_TELEMETRYSDKLANGUAGEVALUES_DOTNET = 'dotnet';
    const TMP_TELEMETRYSDKLANGUAGEVALUES_ERLANG = 'erlang';
    const TMP_TELEMETRYSDKLANGUAGEVALUES_GO = 'go';
    const TMP_TELEMETRYSDKLANGUAGEVALUES_JAVA = 'java';
    const TMP_TELEMETRYSDKLANGUAGEVALUES_NODEJS = 'nodejs';
    const TMP_TELEMETRYSDKLANGUAGEVALUES_PHP = 'php';
    const TMP_TELEMETRYSDKLANGUAGEVALUES_PYTHON = 'python';
    const TMP_TELEMETRYSDKLANGUAGEVALUES_RUBY = 'ruby';
    const TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS = 'webjs';
    /**
     * The language of the telemetry SDK.
     *
     * @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_CPP.
     */
    SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_CPP = TMP_TELEMETRYSDKLANGUAGEVALUES_CPP;
    /**
     * The language of the telemetry SDK.
     *
     * @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET.
     */
    SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_DOTNET = TMP_TELEMETRYSDKLANGUAGEVALUES_DOTNET;
    /**
     * The language of the telemetry SDK.
     *
     * @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG.
     */
    SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_ERLANG = TMP_TELEMETRYSDKLANGUAGEVALUES_ERLANG;
    /**
     * The language of the telemetry SDK.
     *
     * @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_GO.
     */
    SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_GO = TMP_TELEMETRYSDKLANGUAGEVALUES_GO;
    /**
     * The language of the telemetry SDK.
     *
     * @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_JAVA.
     */
    SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_JAVA = TMP_TELEMETRYSDKLANGUAGEVALUES_JAVA;
    /**
     * The language of the telemetry SDK.
     *
     * @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS.
     */
    SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_NODEJS = TMP_TELEMETRYSDKLANGUAGEVALUES_NODEJS;
    /**
     * The language of the telemetry SDK.
     *
     * @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_PHP.
     */
    SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_PHP = TMP_TELEMETRYSDKLANGUAGEVALUES_PHP;
    /**
     * The language of the telemetry SDK.
     *
     * @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON.
     */
    SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_PYTHON = TMP_TELEMETRYSDKLANGUAGEVALUES_PYTHON;
    /**
     * The language of the telemetry SDK.
     *
     * @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_RUBY.
     */
    SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_RUBY = TMP_TELEMETRYSDKLANGUAGEVALUES_RUBY;
    /**
     * The language of the telemetry SDK.
     *
     * @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS.
     */
    SemanticResourceAttributes.TELEMETRYSDKLANGUAGEVALUES_WEBJS = TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS;
    /**
     * The constant map of values for TelemetrySdkLanguageValues.
     * @deprecated Use the TELEMETRYSDKLANGUAGEVALUES_XXXXX constants rather than the TelemetrySdkLanguageValues.XXXXX for bundle minification.
     */
    SemanticResourceAttributes.TelemetrySdkLanguageValues = 
    /*#__PURE__*/ (0, utils_1.createConstMap)([
        TMP_TELEMETRYSDKLANGUAGEVALUES_CPP,
        TMP_TELEMETRYSDKLANGUAGEVALUES_DOTNET,
        TMP_TELEMETRYSDKLANGUAGEVALUES_ERLANG,
        TMP_TELEMETRYSDKLANGUAGEVALUES_GO,
        TMP_TELEMETRYSDKLANGUAGEVALUES_JAVA,
        TMP_TELEMETRYSDKLANGUAGEVALUES_NODEJS,
        TMP_TELEMETRYSDKLANGUAGEVALUES_PHP,
        TMP_TELEMETRYSDKLANGUAGEVALUES_PYTHON,
        TMP_TELEMETRYSDKLANGUAGEVALUES_RUBY,
        TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS,
    ]);

    (function (exports) {
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
    	var __createBinding = (index.commonjsGlobal && index.commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    	    if (k2 === undefined) k2 = k;
    	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    	}) : (function(o, m, k, k2) {
    	    if (k2 === undefined) k2 = k;
    	    o[k2] = m[k];
    	}));
    	var __exportStar = (index.commonjsGlobal && index.commonjsGlobal.__exportStar) || function(m, exports) {
    	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    	};
    	Object.defineProperty(exports, "__esModule", { value: true });
    	/* eslint-disable no-restricted-syntax --
    	 * These re-exports are only of constants, only one-level deep at this point,
    	 * and should not cause problems for tree-shakers.
    	 */
    	__exportStar(SemanticResourceAttributes, exports);
    	
    } (resource));

    var stable_attributes = {};

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
    Object.defineProperty(stable_attributes, "__esModule", { value: true });
    stable_attributes.HTTP_REQUEST_METHOD_VALUE_POST = stable_attributes.HTTP_REQUEST_METHOD_VALUE_PATCH = stable_attributes.HTTP_REQUEST_METHOD_VALUE_OPTIONS = stable_attributes.HTTP_REQUEST_METHOD_VALUE_HEAD = stable_attributes.HTTP_REQUEST_METHOD_VALUE_GET = stable_attributes.HTTP_REQUEST_METHOD_VALUE_DELETE = stable_attributes.HTTP_REQUEST_METHOD_VALUE_CONNECT = stable_attributes.HTTP_REQUEST_METHOD_VALUE_OTHER = stable_attributes.ATTR_HTTP_REQUEST_METHOD = stable_attributes.ATTR_HTTP_REQUEST_HEADER = stable_attributes.ATTR_EXCEPTION_TYPE = stable_attributes.ATTR_EXCEPTION_STACKTRACE = stable_attributes.ATTR_EXCEPTION_MESSAGE = stable_attributes.ATTR_EXCEPTION_ESCAPED = stable_attributes.ERROR_TYPE_VALUE_OTHER = stable_attributes.ATTR_ERROR_TYPE = stable_attributes.ATTR_CLIENT_PORT = stable_attributes.ATTR_CLIENT_ADDRESS = stable_attributes.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_SUCCESS = stable_attributes.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_FAILURE = stable_attributes.ATTR_ASPNETCORE_ROUTING_MATCH_STATUS = stable_attributes.ATTR_ASPNETCORE_ROUTING_IS_FALLBACK = stable_attributes.ATTR_ASPNETCORE_REQUEST_IS_UNHANDLED = stable_attributes.ATTR_ASPNETCORE_RATE_LIMITING_POLICY = stable_attributes.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_UNHANDLED = stable_attributes.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_SKIPPED = stable_attributes.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_HANDLED = stable_attributes.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_ABORTED = stable_attributes.ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT = stable_attributes.ATTR_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE = stable_attributes.ATTR_TELEMETRY_SDK_VERSION = stable_attributes.ATTR_TELEMETRY_SDK_NAME = stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS = stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_SWIFT = stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_RUST = stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_RUBY = stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON = stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_PHP = stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS = stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_JAVA = stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_GO = stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG = stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET = stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_CPP = stable_attributes.ATTR_TELEMETRY_SDK_LANGUAGE = stable_attributes.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_REQUEST_CANCELED = stable_attributes.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_GLOBAL_LIMITER = stable_attributes.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ENDPOINT_LIMITER = stable_attributes.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ACQUIRED = stable_attributes.ATTR_ASPNETCORE_RATE_LIMITING_RESULT = void 0;
    stable_attributes.SIGNALR_CONNECTION_STATUS_VALUE_TIMEOUT = stable_attributes.SIGNALR_CONNECTION_STATUS_VALUE_NORMAL_CLOSURE = stable_attributes.SIGNALR_CONNECTION_STATUS_VALUE_APP_SHUTDOWN = stable_attributes.ATTR_SIGNALR_CONNECTION_STATUS = stable_attributes.ATTR_SERVICE_VERSION = stable_attributes.ATTR_SERVICE_NAME = stable_attributes.ATTR_SERVER_PORT = stable_attributes.ATTR_SERVER_ADDRESS = stable_attributes.ATTR_OTEL_STATUS_DESCRIPTION = stable_attributes.OTEL_STATUS_CODE_VALUE_OK = stable_attributes.OTEL_STATUS_CODE_VALUE_ERROR = stable_attributes.ATTR_OTEL_STATUS_CODE = stable_attributes.ATTR_OTEL_SCOPE_VERSION = stable_attributes.ATTR_OTEL_SCOPE_NAME = stable_attributes.NETWORK_TYPE_VALUE_IPV6 = stable_attributes.NETWORK_TYPE_VALUE_IPV4 = stable_attributes.ATTR_NETWORK_TYPE = stable_attributes.NETWORK_TRANSPORT_VALUE_UNIX = stable_attributes.NETWORK_TRANSPORT_VALUE_UDP = stable_attributes.NETWORK_TRANSPORT_VALUE_TCP = stable_attributes.NETWORK_TRANSPORT_VALUE_QUIC = stable_attributes.NETWORK_TRANSPORT_VALUE_PIPE = stable_attributes.ATTR_NETWORK_TRANSPORT = stable_attributes.ATTR_NETWORK_PROTOCOL_VERSION = stable_attributes.ATTR_NETWORK_PROTOCOL_NAME = stable_attributes.ATTR_NETWORK_PEER_PORT = stable_attributes.ATTR_NETWORK_PEER_ADDRESS = stable_attributes.ATTR_NETWORK_LOCAL_PORT = stable_attributes.ATTR_NETWORK_LOCAL_ADDRESS = stable_attributes.JVM_THREAD_STATE_VALUE_WAITING = stable_attributes.JVM_THREAD_STATE_VALUE_TIMED_WAITING = stable_attributes.JVM_THREAD_STATE_VALUE_TERMINATED = stable_attributes.JVM_THREAD_STATE_VALUE_RUNNABLE = stable_attributes.JVM_THREAD_STATE_VALUE_NEW = stable_attributes.JVM_THREAD_STATE_VALUE_BLOCKED = stable_attributes.ATTR_JVM_THREAD_STATE = stable_attributes.ATTR_JVM_THREAD_DAEMON = stable_attributes.JVM_MEMORY_TYPE_VALUE_NON_HEAP = stable_attributes.JVM_MEMORY_TYPE_VALUE_HEAP = stable_attributes.ATTR_JVM_MEMORY_TYPE = stable_attributes.ATTR_JVM_MEMORY_POOL_NAME = stable_attributes.ATTR_JVM_GC_NAME = stable_attributes.ATTR_JVM_GC_ACTION = stable_attributes.ATTR_HTTP_ROUTE = stable_attributes.ATTR_HTTP_RESPONSE_STATUS_CODE = stable_attributes.ATTR_HTTP_RESPONSE_HEADER = stable_attributes.ATTR_HTTP_REQUEST_RESEND_COUNT = stable_attributes.ATTR_HTTP_REQUEST_METHOD_ORIGINAL = stable_attributes.HTTP_REQUEST_METHOD_VALUE_TRACE = stable_attributes.HTTP_REQUEST_METHOD_VALUE_PUT = void 0;
    stable_attributes.ATTR_USER_AGENT_ORIGINAL = stable_attributes.ATTR_URL_SCHEME = stable_attributes.ATTR_URL_QUERY = stable_attributes.ATTR_URL_PATH = stable_attributes.ATTR_URL_FULL = stable_attributes.ATTR_URL_FRAGMENT = stable_attributes.SIGNALR_TRANSPORT_VALUE_WEB_SOCKETS = stable_attributes.SIGNALR_TRANSPORT_VALUE_SERVER_SENT_EVENTS = stable_attributes.SIGNALR_TRANSPORT_VALUE_LONG_POLLING = stable_attributes.ATTR_SIGNALR_TRANSPORT = void 0;
    //----------------------------------------------------------------------------------------------------------
    // DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates/registry/stable/attributes.ts.j2
    //----------------------------------------------------------------------------------------------------------
    /**
     * Rate-limiting result, shows whether the lease was acquired or contains a rejection reason
     *
     * @example acquired
     *
     * @example request_canceled
     */
    stable_attributes.ATTR_ASPNETCORE_RATE_LIMITING_RESULT = 'aspnetcore.rate_limiting.result';
    /**
      * Enum value "acquired" for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
      */
    stable_attributes.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ACQUIRED = "acquired";
    /**
      * Enum value "endpoint_limiter" for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
      */
    stable_attributes.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ENDPOINT_LIMITER = "endpoint_limiter";
    /**
      * Enum value "global_limiter" for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
      */
    stable_attributes.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_GLOBAL_LIMITER = "global_limiter";
    /**
      * Enum value "request_canceled" for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
      */
    stable_attributes.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_REQUEST_CANCELED = "request_canceled";
    /**
     * The language of the telemetry SDK.
     */
    stable_attributes.ATTR_TELEMETRY_SDK_LANGUAGE = 'telemetry.sdk.language';
    /**
      * Enum value "cpp" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
      */
    stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_CPP = "cpp";
    /**
      * Enum value "dotnet" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
      */
    stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET = "dotnet";
    /**
      * Enum value "erlang" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
      */
    stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG = "erlang";
    /**
      * Enum value "go" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
      */
    stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_GO = "go";
    /**
      * Enum value "java" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
      */
    stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_JAVA = "java";
    /**
      * Enum value "nodejs" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
      */
    stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS = "nodejs";
    /**
      * Enum value "php" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
      */
    stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_PHP = "php";
    /**
      * Enum value "python" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
      */
    stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON = "python";
    /**
      * Enum value "ruby" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
      */
    stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_RUBY = "ruby";
    /**
      * Enum value "rust" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
      */
    stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_RUST = "rust";
    /**
      * Enum value "swift" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
      */
    stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_SWIFT = "swift";
    /**
      * Enum value "webjs" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
      */
    stable_attributes.TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS = "webjs";
    /**
     * The name of the telemetry SDK as defined above.
     *
     * @example opentelemetry
     *
     * @note The OpenTelemetry SDK **MUST** set the `telemetry.sdk.name` attribute to `opentelemetry`.
     * If another SDK, like a fork or a vendor-provided implementation, is used, this SDK **MUST** set the
     * `telemetry.sdk.name` attribute to the fully-qualified class or module name of this SDK's main entry point
     * or another suitable identifier depending on the language.
     * The identifier `opentelemetry` is reserved and **MUST** **NOT** be used in this case.
     * All custom identifiers **SHOULD** be stable across different versions of an implementation.
     */
    stable_attributes.ATTR_TELEMETRY_SDK_NAME = 'telemetry.sdk.name';
    /**
     * The version string of the telemetry SDK.
     *
     * @example 1.2.3
     */
    stable_attributes.ATTR_TELEMETRY_SDK_VERSION = 'telemetry.sdk.version';
    /**
     * Full type name of the [`IExceptionHandler`](https://learn.microsoft.com/dotnet/api/microsoft.aspnetcore.diagnostics.iexceptionhandler) implementation that handled the exception.
     *
     * @example Contoso.MyHandler
     */
    stable_attributes.ATTR_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE = 'aspnetcore.diagnostics.handler.type';
    /**
     * ASP.NET Core exception middleware handling result
     *
     * @example handled
     *
     * @example unhandled
     */
    stable_attributes.ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT = 'aspnetcore.diagnostics.exception.result';
    /**
      * Enum value "aborted" for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
      */
    stable_attributes.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_ABORTED = "aborted";
    /**
      * Enum value "handled" for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
      */
    stable_attributes.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_HANDLED = "handled";
    /**
      * Enum value "skipped" for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
      */
    stable_attributes.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_SKIPPED = "skipped";
    /**
      * Enum value "unhandled" for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
      */
    stable_attributes.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_UNHANDLED = "unhandled";
    /**
     * Rate limiting policy name.
     *
     * @example fixed
     *
     * @example sliding
     *
     * @example token
     */
    stable_attributes.ATTR_ASPNETCORE_RATE_LIMITING_POLICY = 'aspnetcore.rate_limiting.policy';
    /**
     * Flag indicating if request was handled by the application pipeline.
     *
     * @example true
     */
    stable_attributes.ATTR_ASPNETCORE_REQUEST_IS_UNHANDLED = 'aspnetcore.request.is_unhandled';
    /**
     * A value that indicates whether the matched route is a fallback route.
     *
     * @example true
     */
    stable_attributes.ATTR_ASPNETCORE_ROUTING_IS_FALLBACK = 'aspnetcore.routing.is_fallback';
    /**
     * Match result - success or failure
     *
     * @example success
     *
     * @example failure
     */
    stable_attributes.ATTR_ASPNETCORE_ROUTING_MATCH_STATUS = 'aspnetcore.routing.match_status';
    /**
      * Enum value "failure" for attribute {@link ATTR_ASPNETCORE_ROUTING_MATCH_STATUS}.
      */
    stable_attributes.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_FAILURE = "failure";
    /**
      * Enum value "success" for attribute {@link ATTR_ASPNETCORE_ROUTING_MATCH_STATUS}.
      */
    stable_attributes.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_SUCCESS = "success";
    /**
     * Client address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
     *
     * @example client.example.com
     *
     * @example 10.1.2.80
     *
     * @example /tmp/my.sock
     *
     * @note When observed from the server side, and when communicating through an intermediary, `client.address` **SHOULD** represent the client address behind any intermediaries,  for example proxies, if it's available.
     */
    stable_attributes.ATTR_CLIENT_ADDRESS = 'client.address';
    /**
     * Client port number.
     *
     * @example 65123
     *
     * @note When observed from the server side, and when communicating through an intermediary, `client.port` **SHOULD** represent the client port behind any intermediaries,  for example proxies, if it's available.
     */
    stable_attributes.ATTR_CLIENT_PORT = 'client.port';
    /**
     * Describes a class of error the operation ended with.
     *
     * @example timeout
     *
     * @example java.net.UnknownHostException
     *
     * @example server_certificate_invalid
     *
     * @example 500
     *
     * @note The `error.type` **SHOULD** be predictable, and **SHOULD** have low cardinality.
     *
     * When `error.type` is set to a type (e.g., an exception type), its
     * canonical class name identifying the type within the artifact **SHOULD** be used.
     *
     * Instrumentations **SHOULD** document the list of errors they report.
     *
     * The cardinality of `error.type` within one instrumentation library **SHOULD** be low.
     * Telemetry consumers that aggregate data from multiple instrumentation libraries and applications
     * should be prepared for `error.type` to have high cardinality at query time when no
     * additional filters are applied.
     *
     * If the operation has completed successfully, instrumentations **SHOULD** **NOT** set `error.type`.
     *
     * If a specific domain defines its own set of error identifiers (such as HTTP or gRPC status codes),
     * it's RECOMMENDED to:
     *
     * * Use a domain-specific attribute
     * * Set `error.type` to capture all errors, regardless of whether they are defined within the domain-specific set or not.
     */
    stable_attributes.ATTR_ERROR_TYPE = 'error.type';
    /**
      * Enum value "_OTHER" for attribute {@link ATTR_ERROR_TYPE}.
      */
    stable_attributes.ERROR_TYPE_VALUE_OTHER = "_OTHER";
    /**
     * **SHOULD** be set to true if the exception event is recorded at a point where it is known that the exception is escaping the scope of the span.
     *
     * @note An exception is considered to have escaped (or left) the scope of a span,
     * if that span is ended while the exception is still logically "in flight".
     * This may be actually "in flight" in some languages (e.g. if the exception
     * is passed to a Context manager's `__exit__` method in Python) but will
     * usually be caught at the point of recording the exception in most languages.
     *
     * It is usually not possible to determine at the point where an exception is thrown
     * whether it will escape the scope of a span.
     * However, it is trivial to know that an exception
     * will escape, if one checks for an active exception just before ending the span,
     * as done in the [example for recording span exceptions](https://opentelemetry.io/docs/specs/semconv/exceptions/exceptions-spans/#recording-an-exception).
     *
     * It follows that an exception may still escape the scope of the span
     * even if the `exception.escaped` attribute was not set or set to false,
     * since the event might have been recorded at a time where it was not
     * clear whether the exception will escape.
     */
    stable_attributes.ATTR_EXCEPTION_ESCAPED = 'exception.escaped';
    /**
     * The exception message.
     *
     * @example Division by zero
     *
     * @example Can't convert 'int' object to str implicitly
     */
    stable_attributes.ATTR_EXCEPTION_MESSAGE = 'exception.message';
    /**
     * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
     *
     * @example "Exception in thread \"main\" java.lang.RuntimeException: Test exception\\n at com.example.GenerateTrace.methodB(GenerateTrace.java:13)\\n at com.example.GenerateTrace.methodA(GenerateTrace.java:9)\\n at com.example.GenerateTrace.main(GenerateTrace.java:5)"
     */
    stable_attributes.ATTR_EXCEPTION_STACKTRACE = 'exception.stacktrace';
    /**
     * The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
     *
     * @example java.net.ConnectException
     *
     * @example OSError
     */
    stable_attributes.ATTR_EXCEPTION_TYPE = 'exception.type';
    /**
     * HTTP request headers, `<key>` being the normalized HTTP Header name (lowercase), the value being the header values.
     *
     * @example http.request.header.content-type=["application/json"]
     *
     * @example http.request.header.x-forwarded-for=["1.2.3.4", "1.2.3.5"]
     *
     * @note Instrumentations **SHOULD** require an explicit configuration of which headers are to be captured. Including all request headers can be a security risk - explicit configuration helps avoid leaking sensitive information.
     * The `User-Agent` header is already captured in the `user_agent.original` attribute. Users **MAY** explicitly configure instrumentations to capture them even though it is not recommended.
     * The attribute value **MUST** consist of either multiple header values as an array of strings or a single-item array containing a possibly comma-concatenated string, depending on the way the HTTP library provides access to headers.
     */
    const ATTR_HTTP_REQUEST_HEADER = (key) => `http.request.header.${key}`;
    stable_attributes.ATTR_HTTP_REQUEST_HEADER = ATTR_HTTP_REQUEST_HEADER;
    /**
     * HTTP request method.
     *
     * @example GET
     *
     * @example POST
     *
     * @example HEAD
     *
     * @note HTTP request method value **SHOULD** be "known" to the instrumentation.
     * By default, this convention defines "known" methods as the ones listed in [RFC9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-methods)
     * and the PATCH method defined in [RFC5789](https://www.rfc-editor.org/rfc/rfc5789.html).
     *
     * If the HTTP request method is not known to instrumentation, it **MUST** set the `http.request.method` attribute to `_OTHER`.
     *
     * If the HTTP instrumentation could end up converting valid HTTP request methods to `_OTHER`, then it **MUST** provide a way to override
     * the list of known HTTP methods. If this override is done via environment variable, then the environment variable **MUST** be named
     * OTEL_INSTRUMENTATION_HTTP_KNOWN_METHODS and support a comma-separated list of case-sensitive known HTTP methods
     * (this list **MUST** be a full override of the default known method, it is not a list of known methods in addition to the defaults).
     *
     * HTTP method names are case-sensitive and `http.request.method` attribute value **MUST** match a known HTTP method name exactly.
     * Instrumentations for specific web frameworks that consider HTTP methods to be case insensitive, **SHOULD** populate a canonical equivalent.
     * Tracing instrumentations that do so, **MUST** also set `http.request.method_original` to the original value.
     */
    stable_attributes.ATTR_HTTP_REQUEST_METHOD = 'http.request.method';
    /**
      * Enum value "_OTHER" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
      */
    stable_attributes.HTTP_REQUEST_METHOD_VALUE_OTHER = "_OTHER";
    /**
      * Enum value "CONNECT" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
      */
    stable_attributes.HTTP_REQUEST_METHOD_VALUE_CONNECT = "CONNECT";
    /**
      * Enum value "DELETE" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
      */
    stable_attributes.HTTP_REQUEST_METHOD_VALUE_DELETE = "DELETE";
    /**
      * Enum value "GET" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
      */
    stable_attributes.HTTP_REQUEST_METHOD_VALUE_GET = "GET";
    /**
      * Enum value "HEAD" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
      */
    stable_attributes.HTTP_REQUEST_METHOD_VALUE_HEAD = "HEAD";
    /**
      * Enum value "OPTIONS" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
      */
    stable_attributes.HTTP_REQUEST_METHOD_VALUE_OPTIONS = "OPTIONS";
    /**
      * Enum value "PATCH" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
      */
    stable_attributes.HTTP_REQUEST_METHOD_VALUE_PATCH = "PATCH";
    /**
      * Enum value "POST" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
      */
    stable_attributes.HTTP_REQUEST_METHOD_VALUE_POST = "POST";
    /**
      * Enum value "PUT" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
      */
    stable_attributes.HTTP_REQUEST_METHOD_VALUE_PUT = "PUT";
    /**
      * Enum value "TRACE" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
      */
    stable_attributes.HTTP_REQUEST_METHOD_VALUE_TRACE = "TRACE";
    /**
     * Original HTTP method sent by the client in the request line.
     *
     * @example GeT
     *
     * @example ACL
     *
     * @example foo
     */
    stable_attributes.ATTR_HTTP_REQUEST_METHOD_ORIGINAL = 'http.request.method_original';
    /**
     * The ordinal number of request resending attempt (for any reason, including redirects).
     *
     * @example 3
     *
     * @note The resend count **SHOULD** be updated each time an HTTP request gets resent by the client, regardless of what was the cause of the resending (e.g. redirection, authorization failure, 503 Server Unavailable, network issues, or any other).
     */
    stable_attributes.ATTR_HTTP_REQUEST_RESEND_COUNT = 'http.request.resend_count';
    /**
     * HTTP response headers, `<key>` being the normalized HTTP Header name (lowercase), the value being the header values.
     *
     * @example http.response.header.content-type=["application/json"]
     *
     * @example http.response.header.my-custom-header=["abc", "def"]
     *
     * @note Instrumentations **SHOULD** require an explicit configuration of which headers are to be captured. Including all response headers can be a security risk - explicit configuration helps avoid leaking sensitive information.
     * Users **MAY** explicitly configure instrumentations to capture them even though it is not recommended.
     * The attribute value **MUST** consist of either multiple header values as an array of strings or a single-item array containing a possibly comma-concatenated string, depending on the way the HTTP library provides access to headers.
     */
    const ATTR_HTTP_RESPONSE_HEADER = (key) => `http.response.header.${key}`;
    stable_attributes.ATTR_HTTP_RESPONSE_HEADER = ATTR_HTTP_RESPONSE_HEADER;
    /**
     * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
     *
     * @example 200
     */
    stable_attributes.ATTR_HTTP_RESPONSE_STATUS_CODE = 'http.response.status_code';
    /**
     * The matched route, that is, the path template in the format used by the respective server framework.
     *
     * @example /users/:userID?
     *
     * @example {controller}/{action}/{id?}
     *
     * @note MUST **NOT** be populated when this is not supported by the HTTP server framework as the route attribute should have low-cardinality and the URI path can **NOT** substitute it.
     * SHOULD include the [application root](/docs/http/http-spans.md#http-server-definitions) if there is one.
     */
    stable_attributes.ATTR_HTTP_ROUTE = 'http.route';
    /**
     * Name of the garbage collector action.
     *
     * @example end of minor GC
     *
     * @example end of major GC
     *
     * @note Garbage collector action is generally obtained via [GarbageCollectionNotificationInfo#getGcAction()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcAction()).
     */
    stable_attributes.ATTR_JVM_GC_ACTION = 'jvm.gc.action';
    /**
     * Name of the garbage collector.
     *
     * @example G1 Young Generation
     *
     * @example G1 Old Generation
     *
     * @note Garbage collector name is generally obtained via [GarbageCollectionNotificationInfo#getGcName()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcName()).
     */
    stable_attributes.ATTR_JVM_GC_NAME = 'jvm.gc.name';
    /**
     * Name of the memory pool.
     *
     * @example G1 Old Gen
     *
     * @example G1 Eden space
     *
     * @example G1 Survivor Space
     *
     * @note Pool names are generally obtained via [MemoryPoolMXBean#getName()](https://docs.oracle.com/en/java/javase/11/docs/api/java.management/java/lang/management/MemoryPoolMXBean.html#getName()).
     */
    stable_attributes.ATTR_JVM_MEMORY_POOL_NAME = 'jvm.memory.pool.name';
    /**
     * The type of memory.
     *
     * @example heap
     *
     * @example non_heap
     */
    stable_attributes.ATTR_JVM_MEMORY_TYPE = 'jvm.memory.type';
    /**
      * Enum value "heap" for attribute {@link ATTR_JVM_MEMORY_TYPE}.
      */
    stable_attributes.JVM_MEMORY_TYPE_VALUE_HEAP = "heap";
    /**
      * Enum value "non_heap" for attribute {@link ATTR_JVM_MEMORY_TYPE}.
      */
    stable_attributes.JVM_MEMORY_TYPE_VALUE_NON_HEAP = "non_heap";
    /**
     * Whether the thread is daemon or not.
     */
    stable_attributes.ATTR_JVM_THREAD_DAEMON = 'jvm.thread.daemon';
    /**
     * State of the thread.
     *
     * @example runnable
     *
     * @example blocked
     */
    stable_attributes.ATTR_JVM_THREAD_STATE = 'jvm.thread.state';
    /**
      * Enum value "blocked" for attribute {@link ATTR_JVM_THREAD_STATE}.
      */
    stable_attributes.JVM_THREAD_STATE_VALUE_BLOCKED = "blocked";
    /**
      * Enum value "new" for attribute {@link ATTR_JVM_THREAD_STATE}.
      */
    stable_attributes.JVM_THREAD_STATE_VALUE_NEW = "new";
    /**
      * Enum value "runnable" for attribute {@link ATTR_JVM_THREAD_STATE}.
      */
    stable_attributes.JVM_THREAD_STATE_VALUE_RUNNABLE = "runnable";
    /**
      * Enum value "terminated" for attribute {@link ATTR_JVM_THREAD_STATE}.
      */
    stable_attributes.JVM_THREAD_STATE_VALUE_TERMINATED = "terminated";
    /**
      * Enum value "timed_waiting" for attribute {@link ATTR_JVM_THREAD_STATE}.
      */
    stable_attributes.JVM_THREAD_STATE_VALUE_TIMED_WAITING = "timed_waiting";
    /**
      * Enum value "waiting" for attribute {@link ATTR_JVM_THREAD_STATE}.
      */
    stable_attributes.JVM_THREAD_STATE_VALUE_WAITING = "waiting";
    /**
     * Local address of the network connection - IP address or Unix domain socket name.
     *
     * @example 10.1.2.80
     *
     * @example /tmp/my.sock
     */
    stable_attributes.ATTR_NETWORK_LOCAL_ADDRESS = 'network.local.address';
    /**
     * Local port number of the network connection.
     *
     * @example 65123
     */
    stable_attributes.ATTR_NETWORK_LOCAL_PORT = 'network.local.port';
    /**
     * Peer address of the network connection - IP address or Unix domain socket name.
     *
     * @example 10.1.2.80
     *
     * @example /tmp/my.sock
     */
    stable_attributes.ATTR_NETWORK_PEER_ADDRESS = 'network.peer.address';
    /**
     * Peer port number of the network connection.
     *
     * @example 65123
     */
    stable_attributes.ATTR_NETWORK_PEER_PORT = 'network.peer.port';
    /**
     * [OSI application layer](https://osi-model.com/application-layer/) or non-OSI equivalent.
     *
     * @example amqp
     *
     * @example http
     *
     * @example mqtt
     *
     * @note The value **SHOULD** be normalized to lowercase.
     */
    stable_attributes.ATTR_NETWORK_PROTOCOL_NAME = 'network.protocol.name';
    /**
     * The actual version of the protocol used for network communication.
     *
     * @example 1.1
     *
     * @example 2
     *
     * @note If protocol version is subject to negotiation (for example using [ALPN](https://www.rfc-editor.org/rfc/rfc7301.html)), this attribute **SHOULD** be set to the negotiated version. If the actual protocol version is not known, this attribute **SHOULD** **NOT** be set.
     */
    stable_attributes.ATTR_NETWORK_PROTOCOL_VERSION = 'network.protocol.version';
    /**
     * [OSI transport layer](https://osi-model.com/transport-layer/) or [inter-process communication method](https://wikipedia.org/wiki/Inter-process_communication).
     *
     * @example tcp
     *
     * @example udp
     *
     * @note The value **SHOULD** be normalized to lowercase.
     *
     * Consider always setting the transport when setting a port number, since
     * a port number is ambiguous without knowing the transport. For example
     * different processes could be listening on TCP port 12345 and UDP port 12345.
     */
    stable_attributes.ATTR_NETWORK_TRANSPORT = 'network.transport';
    /**
      * Enum value "pipe" for attribute {@link ATTR_NETWORK_TRANSPORT}.
      */
    stable_attributes.NETWORK_TRANSPORT_VALUE_PIPE = "pipe";
    /**
      * Enum value "quic" for attribute {@link ATTR_NETWORK_TRANSPORT}.
      */
    stable_attributes.NETWORK_TRANSPORT_VALUE_QUIC = "quic";
    /**
      * Enum value "tcp" for attribute {@link ATTR_NETWORK_TRANSPORT}.
      */
    stable_attributes.NETWORK_TRANSPORT_VALUE_TCP = "tcp";
    /**
      * Enum value "udp" for attribute {@link ATTR_NETWORK_TRANSPORT}.
      */
    stable_attributes.NETWORK_TRANSPORT_VALUE_UDP = "udp";
    /**
      * Enum value "unix" for attribute {@link ATTR_NETWORK_TRANSPORT}.
      */
    stable_attributes.NETWORK_TRANSPORT_VALUE_UNIX = "unix";
    /**
     * [OSI network layer](https://osi-model.com/network-layer/) or non-OSI equivalent.
     *
     * @example ipv4
     *
     * @example ipv6
     *
     * @note The value **SHOULD** be normalized to lowercase.
     */
    stable_attributes.ATTR_NETWORK_TYPE = 'network.type';
    /**
      * Enum value "ipv4" for attribute {@link ATTR_NETWORK_TYPE}.
      */
    stable_attributes.NETWORK_TYPE_VALUE_IPV4 = "ipv4";
    /**
      * Enum value "ipv6" for attribute {@link ATTR_NETWORK_TYPE}.
      */
    stable_attributes.NETWORK_TYPE_VALUE_IPV6 = "ipv6";
    /**
     * The name of the instrumentation scope - (`InstrumentationScope.Name` in OTLP).
     *
     * @example io.opentelemetry.contrib.mongodb
     */
    stable_attributes.ATTR_OTEL_SCOPE_NAME = 'otel.scope.name';
    /**
     * The version of the instrumentation scope - (`InstrumentationScope.Version` in OTLP).
     *
     * @example 1.0.0
     */
    stable_attributes.ATTR_OTEL_SCOPE_VERSION = 'otel.scope.version';
    /**
     * Name of the code, either "OK" or "ERROR". **MUST** **NOT** be set if the status code is UNSET.
     */
    stable_attributes.ATTR_OTEL_STATUS_CODE = 'otel.status_code';
    /**
      * Enum value "ERROR" for attribute {@link ATTR_OTEL_STATUS_CODE}.
      */
    stable_attributes.OTEL_STATUS_CODE_VALUE_ERROR = "ERROR";
    /**
      * Enum value "OK" for attribute {@link ATTR_OTEL_STATUS_CODE}.
      */
    stable_attributes.OTEL_STATUS_CODE_VALUE_OK = "OK";
    /**
     * Description of the Status if it has a value, otherwise not set.
     *
     * @example resource not found
     */
    stable_attributes.ATTR_OTEL_STATUS_DESCRIPTION = 'otel.status_description';
    /**
     * Server domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
     *
     * @example example.com
     *
     * @example 10.1.2.80
     *
     * @example /tmp/my.sock
     *
     * @note When observed from the client side, and when communicating through an intermediary, `server.address` **SHOULD** represent the server address behind any intermediaries, for example proxies, if it's available.
     */
    stable_attributes.ATTR_SERVER_ADDRESS = 'server.address';
    /**
     * Server port number.
     *
     * @example 80
     *
     * @example 8080
     *
     * @example 443
     *
     * @note When observed from the client side, and when communicating through an intermediary, `server.port` **SHOULD** represent the server port behind any intermediaries, for example proxies, if it's available.
     */
    stable_attributes.ATTR_SERVER_PORT = 'server.port';
    /**
     * Logical name of the service.
     *
     * @example shoppingcart
     *
     * @note MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs **MUST** fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value **MUST** be set to `unknown_service`.
     */
    stable_attributes.ATTR_SERVICE_NAME = 'service.name';
    /**
     * The version string of the service API or implementation. The format is not defined by these conventions.
     *
     * @example 2.0.0
     *
     * @example a01dbef8a
     */
    stable_attributes.ATTR_SERVICE_VERSION = 'service.version';
    /**
     * SignalR HTTP connection closure status.
     *
     * @example app_shutdown
     *
     * @example timeout
     */
    stable_attributes.ATTR_SIGNALR_CONNECTION_STATUS = 'signalr.connection.status';
    /**
      * Enum value "app_shutdown" for attribute {@link ATTR_SIGNALR_CONNECTION_STATUS}.
      */
    stable_attributes.SIGNALR_CONNECTION_STATUS_VALUE_APP_SHUTDOWN = "app_shutdown";
    /**
      * Enum value "normal_closure" for attribute {@link ATTR_SIGNALR_CONNECTION_STATUS}.
      */
    stable_attributes.SIGNALR_CONNECTION_STATUS_VALUE_NORMAL_CLOSURE = "normal_closure";
    /**
      * Enum value "timeout" for attribute {@link ATTR_SIGNALR_CONNECTION_STATUS}.
      */
    stable_attributes.SIGNALR_CONNECTION_STATUS_VALUE_TIMEOUT = "timeout";
    /**
     * [SignalR transport type](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/docs/specs/TransportProtocols.md)
     *
     * @example web_sockets
     *
     * @example long_polling
     */
    stable_attributes.ATTR_SIGNALR_TRANSPORT = 'signalr.transport';
    /**
      * Enum value "long_polling" for attribute {@link ATTR_SIGNALR_TRANSPORT}.
      */
    stable_attributes.SIGNALR_TRANSPORT_VALUE_LONG_POLLING = "long_polling";
    /**
      * Enum value "server_sent_events" for attribute {@link ATTR_SIGNALR_TRANSPORT}.
      */
    stable_attributes.SIGNALR_TRANSPORT_VALUE_SERVER_SENT_EVENTS = "server_sent_events";
    /**
      * Enum value "web_sockets" for attribute {@link ATTR_SIGNALR_TRANSPORT}.
      */
    stable_attributes.SIGNALR_TRANSPORT_VALUE_WEB_SOCKETS = "web_sockets";
    /**
     * The [URI fragment](https://www.rfc-editor.org/rfc/rfc3986#section-3.5) component
     *
     * @example SemConv
     */
    stable_attributes.ATTR_URL_FRAGMENT = 'url.fragment';
    /**
     * Absolute URL describing a network resource according to [RFC3986](https://www.rfc-editor.org/rfc/rfc3986)
     *
     * @example https://www.foo.bar/search?q=OpenTelemetry#SemConv
     *
     * @example //localhost
     *
     * @note For network calls, URL usually has `scheme://host[:port][path][?query][#fragment]` format, where the fragment is not transmitted over HTTP, but if it is known, it **SHOULD** be included nevertheless.
     * `url.full` **MUST** **NOT** contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case username and password **SHOULD** be redacted and attribute's value **SHOULD** be `https://REDACTED:REDACTED@www.example.com/`.
     * `url.full` **SHOULD** capture the absolute URL when it is available (or can be reconstructed). Sensitive content provided in `url.full` **SHOULD** be scrubbed when instrumentations can identify it.
     */
    stable_attributes.ATTR_URL_FULL = 'url.full';
    /**
     * The [URI path](https://www.rfc-editor.org/rfc/rfc3986#section-3.3) component
     *
     * @example /search
     *
     * @note Sensitive content provided in `url.path` **SHOULD** be scrubbed when instrumentations can identify it.
     */
    stable_attributes.ATTR_URL_PATH = 'url.path';
    /**
     * The [URI query](https://www.rfc-editor.org/rfc/rfc3986#section-3.4) component
     *
     * @example q=OpenTelemetry
     *
     * @note Sensitive content provided in `url.query` **SHOULD** be scrubbed when instrumentations can identify it.
     */
    stable_attributes.ATTR_URL_QUERY = 'url.query';
    /**
     * The [URI scheme](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) component identifying the used protocol.
     *
     * @example https
     *
     * @example ftp
     *
     * @example telnet
     */
    stable_attributes.ATTR_URL_SCHEME = 'url.scheme';
    /**
     * Value of the [HTTP User-Agent](https://www.rfc-editor.org/rfc/rfc9110.html#field.user-agent) header sent by the client.
     *
     * @example CERN-LineMode/2.15 libwww/2.17b3
     *
     * @example Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1
     *
     * @example YourApp/1.0.0 grpc-java-okhttp/1.27.2
     */
    stable_attributes.ATTR_USER_AGENT_ORIGINAL = 'user_agent.original';

    var stable_metrics = {};

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
    Object.defineProperty(stable_metrics, "__esModule", { value: true });
    stable_metrics.METRIC_SIGNALR_SERVER_CONNECTION_DURATION = stable_metrics.METRIC_SIGNALR_SERVER_ACTIVE_CONNECTIONS = stable_metrics.METRIC_KESTREL_UPGRADED_CONNECTIONS = stable_metrics.METRIC_KESTREL_TLS_HANDSHAKE_DURATION = stable_metrics.METRIC_KESTREL_REJECTED_CONNECTIONS = stable_metrics.METRIC_KESTREL_QUEUED_REQUESTS = stable_metrics.METRIC_KESTREL_QUEUED_CONNECTIONS = stable_metrics.METRIC_KESTREL_CONNECTION_DURATION = stable_metrics.METRIC_KESTREL_ACTIVE_TLS_HANDSHAKES = stable_metrics.METRIC_KESTREL_ACTIVE_CONNECTIONS = stable_metrics.METRIC_JVM_THREAD_COUNT = stable_metrics.METRIC_JVM_MEMORY_USED_AFTER_LAST_GC = stable_metrics.METRIC_JVM_MEMORY_USED = stable_metrics.METRIC_JVM_MEMORY_LIMIT = stable_metrics.METRIC_JVM_MEMORY_COMMITTED = stable_metrics.METRIC_JVM_GC_DURATION = stable_metrics.METRIC_JVM_CPU_TIME = stable_metrics.METRIC_JVM_CPU_RECENT_UTILIZATION = stable_metrics.METRIC_JVM_CPU_COUNT = stable_metrics.METRIC_JVM_CLASS_UNLOADED = stable_metrics.METRIC_JVM_CLASS_LOADED = stable_metrics.METRIC_JVM_CLASS_COUNT = stable_metrics.METRIC_HTTP_SERVER_REQUEST_DURATION = stable_metrics.METRIC_HTTP_CLIENT_REQUEST_DURATION = stable_metrics.METRIC_ASPNETCORE_ROUTING_MATCH_ATTEMPTS = stable_metrics.METRIC_ASPNETCORE_RATE_LIMITING_REQUESTS = stable_metrics.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_LEASE_DURATION = stable_metrics.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_TIME_IN_QUEUE = stable_metrics.METRIC_ASPNETCORE_RATE_LIMITING_QUEUED_REQUESTS = stable_metrics.METRIC_ASPNETCORE_RATE_LIMITING_ACTIVE_REQUEST_LEASES = stable_metrics.METRIC_ASPNETCORE_DIAGNOSTICS_EXCEPTIONS = void 0;
    //----------------------------------------------------------------------------------------------------------
    // DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates/register/stable/metrics.ts.j2
    //----------------------------------------------------------------------------------------------------------
    /**
     * Number of exceptions caught by exception handling middleware.
     *
     * @note Meter name: `Microsoft.AspNetCore.Diagnostics`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_ASPNETCORE_DIAGNOSTICS_EXCEPTIONS = 'aspnetcore.diagnostics.exceptions';
    /**
     * Number of requests that are currently active on the server that hold a rate limiting lease.
     *
     * @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_ASPNETCORE_RATE_LIMITING_ACTIVE_REQUEST_LEASES = 'aspnetcore.rate_limiting.active_request_leases';
    /**
     * Number of requests that are currently queued, waiting to acquire a rate limiting lease.
     *
     * @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_ASPNETCORE_RATE_LIMITING_QUEUED_REQUESTS = 'aspnetcore.rate_limiting.queued_requests';
    /**
     * The time the request spent in a queue waiting to acquire a rate limiting lease.
     *
     * @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_TIME_IN_QUEUE = 'aspnetcore.rate_limiting.request.time_in_queue';
    /**
     * The duration of rate limiting lease held by requests on the server.
     *
     * @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_LEASE_DURATION = 'aspnetcore.rate_limiting.request_lease.duration';
    /**
     * Number of requests that tried to acquire a rate limiting lease.
     *
     * @note Requests could be:
     *
     * * Rejected by global or endpoint rate limiting policies
     * * Canceled while waiting for the lease.
     *
     * Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_ASPNETCORE_RATE_LIMITING_REQUESTS = 'aspnetcore.rate_limiting.requests';
    /**
     * Number of requests that were attempted to be matched to an endpoint.
     *
     * @note Meter name: `Microsoft.AspNetCore.Routing`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_ASPNETCORE_ROUTING_MATCH_ATTEMPTS = 'aspnetcore.routing.match_attempts';
    /**
     * Duration of HTTP client requests.
     */
    stable_metrics.METRIC_HTTP_CLIENT_REQUEST_DURATION = 'http.client.request.duration';
    /**
     * Duration of HTTP server requests.
     */
    stable_metrics.METRIC_HTTP_SERVER_REQUEST_DURATION = 'http.server.request.duration';
    /**
     * Number of classes currently loaded.
     */
    stable_metrics.METRIC_JVM_CLASS_COUNT = 'jvm.class.count';
    /**
     * Number of classes loaded since JVM start.
     */
    stable_metrics.METRIC_JVM_CLASS_LOADED = 'jvm.class.loaded';
    /**
     * Number of classes unloaded since JVM start.
     */
    stable_metrics.METRIC_JVM_CLASS_UNLOADED = 'jvm.class.unloaded';
    /**
     * Number of processors available to the Java virtual machine.
     */
    stable_metrics.METRIC_JVM_CPU_COUNT = 'jvm.cpu.count';
    /**
     * Recent CPU utilization for the process as reported by the JVM.
     *
     * @note The value range is [0.0,1.0]. This utilization is not defined as being for the specific interval since last measurement (unlike `system.cpu.utilization`). [Reference](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html#getProcessCpuLoad()).
     */
    stable_metrics.METRIC_JVM_CPU_RECENT_UTILIZATION = 'jvm.cpu.recent_utilization';
    /**
     * CPU time used by the process as reported by the JVM.
     */
    stable_metrics.METRIC_JVM_CPU_TIME = 'jvm.cpu.time';
    /**
     * Duration of JVM garbage collection actions.
     */
    stable_metrics.METRIC_JVM_GC_DURATION = 'jvm.gc.duration';
    /**
     * Measure of memory committed.
     */
    stable_metrics.METRIC_JVM_MEMORY_COMMITTED = 'jvm.memory.committed';
    /**
     * Measure of max obtainable memory.
     */
    stable_metrics.METRIC_JVM_MEMORY_LIMIT = 'jvm.memory.limit';
    /**
     * Measure of memory used.
     */
    stable_metrics.METRIC_JVM_MEMORY_USED = 'jvm.memory.used';
    /**
     * Measure of memory used, as measured after the most recent garbage collection event on this pool.
     */
    stable_metrics.METRIC_JVM_MEMORY_USED_AFTER_LAST_GC = 'jvm.memory.used_after_last_gc';
    /**
     * Number of executing platform threads.
     */
    stable_metrics.METRIC_JVM_THREAD_COUNT = 'jvm.thread.count';
    /**
     * Number of connections that are currently active on the server.
     *
     * @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_KESTREL_ACTIVE_CONNECTIONS = 'kestrel.active_connections';
    /**
     * Number of TLS handshakes that are currently in progress on the server.
     *
     * @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_KESTREL_ACTIVE_TLS_HANDSHAKES = 'kestrel.active_tls_handshakes';
    /**
     * The duration of connections on the server.
     *
     * @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_KESTREL_CONNECTION_DURATION = 'kestrel.connection.duration';
    /**
     * Number of connections that are currently queued and are waiting to start.
     *
     * @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_KESTREL_QUEUED_CONNECTIONS = 'kestrel.queued_connections';
    /**
     * Number of HTTP requests on multiplexed connections (HTTP/2 and HTTP/3) that are currently queued and are waiting to start.
     *
     * @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_KESTREL_QUEUED_REQUESTS = 'kestrel.queued_requests';
    /**
     * Number of connections rejected by the server.
     *
     * @note Connections are rejected when the currently active count exceeds the value configured with `MaxConcurrentConnections`.
     * Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_KESTREL_REJECTED_CONNECTIONS = 'kestrel.rejected_connections';
    /**
     * The duration of TLS handshakes on the server.
     *
     * @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_KESTREL_TLS_HANDSHAKE_DURATION = 'kestrel.tls_handshake.duration';
    /**
     * Number of connections that are currently upgraded (WebSockets). .
     *
     * @note The counter only tracks HTTP/1.1 connections.
     *
     * Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_KESTREL_UPGRADED_CONNECTIONS = 'kestrel.upgraded_connections';
    /**
     * Number of connections that are currently active on the server.
     *
     * @note Meter name: `Microsoft.AspNetCore.Http.Connections`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_SIGNALR_SERVER_ACTIVE_CONNECTIONS = 'signalr.server.active_connections';
    /**
     * The duration of connections on the server.
     *
     * @note Meter name: `Microsoft.AspNetCore.Http.Connections`; Added in: ASP.NET Core 8.0
     */
    stable_metrics.METRIC_SIGNALR_SERVER_CONNECTION_DURATION = 'signalr.server.connection.duration';

    (function (exports) {
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
    	var __createBinding = (index.commonjsGlobal && index.commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    	    if (k2 === undefined) k2 = k;
    	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    	}) : (function(o, m, k, k2) {
    	    if (k2 === undefined) k2 = k;
    	    o[k2] = m[k];
    	}));
    	var __exportStar = (index.commonjsGlobal && index.commonjsGlobal.__exportStar) || function(m, exports) {
    	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    	};
    	Object.defineProperty(exports, "__esModule", { value: true });
    	/* eslint-disable no-restricted-syntax --
    	 * These re-exports are only of constants, only two-levels deep, and
    	 * should not cause problems for tree-shakers.
    	 */
    	// Deprecated. These are kept around for compatibility purposes
    	__exportStar(trace, exports);
    	__exportStar(resource, exports);
    	// Use these instead
    	__exportStar(stable_attributes, exports);
    	__exportStar(stable_metrics, exports);
    	
    } (src));

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
    var _a;
    /** Constants describing the SDK in use */
    var SDK_INFO = (_a = {},
        _a[src.SEMRESATTRS_TELEMETRY_SDK_NAME] = 'opentelemetry',
        _a[src.SEMRESATTRS_PROCESS_RUNTIME_NAME] = 'browser',
        _a[src.SEMRESATTRS_TELEMETRY_SDK_LANGUAGE] = src.TELEMETRYSDKLANGUAGEVALUES_WEBJS,
        _a[src.SEMRESATTRS_TELEMETRY_SDK_VERSION] = VERSION$1,
        _a);

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
    var NANOSECOND_DIGITS = 9;
    var NANOSECOND_DIGITS_IN_MILLIS = 6;
    var MILLISECONDS_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS_IN_MILLIS);
    var SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
    /**
     * Converts a number of milliseconds from epoch to HrTime([seconds, remainder in nanoseconds]).
     * @param epochMillis
     */
    function millisToHrTime(epochMillis) {
        var epochSeconds = epochMillis / 1000;
        // Decimals only.
        var seconds = Math.trunc(epochSeconds);
        // Round sub-nanosecond accuracy to nanosecond.
        var nanos = Math.round((epochMillis % 1000) * MILLISECONDS_TO_NANOSECONDS);
        return [seconds, nanos];
    }
    function getTimeOrigin() {
        var timeOrigin = otperformance.timeOrigin;
        if (typeof timeOrigin !== 'number') {
            var perf = otperformance;
            timeOrigin = perf.timing && perf.timing.fetchStart;
        }
        return timeOrigin;
    }
    /**
     * Returns an hrtime calculated via performance component.
     * @param performanceNow
     */
    function hrTime(performanceNow) {
        var timeOrigin = millisToHrTime(getTimeOrigin());
        var now = millisToHrTime(typeof performanceNow === 'number' ? performanceNow : otperformance.now());
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
        var seconds = endTime[0] - startTime[0];
        var nanos = endTime[1] - startTime[1];
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
        var out = [time1[0] + time2[0], time1[1] + time2[1]];
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
    var __values$3 = (this && this.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    /** Combines multiple propagators into a single propagator. */
    var CompositePropagator = /** @class */ (function () {
        /**
         * Construct a composite propagator from a list of propagators.
         *
         * @param [config] Configuration object for composite propagator
         */
        function CompositePropagator(config) {
            if (config === void 0) { config = {}; }
            var _a;
            this._propagators = (_a = config.propagators) !== null && _a !== void 0 ? _a : [];
            this._fields = Array.from(new Set(this._propagators
                // older propagators may not have fields function, null check to be sure
                .map(function (p) { return (typeof p.fields === 'function' ? p.fields() : []); })
                .reduce(function (x, y) { return x.concat(y); }, [])));
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
        CompositePropagator.prototype.inject = function (context, carrier, setter) {
            var e_1, _a;
            try {
                for (var _b = __values$3(this._propagators), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var propagator = _c.value;
                    try {
                        propagator.inject(context, carrier, setter);
                    }
                    catch (err) {
                        index.src.diag.warn("Failed to inject with " + propagator.constructor.name + ". Err: " + err.message);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        /**
         * Run each of the configured propagators with the given context and carrier.
         * Propagators are run in the order they are configured, so if multiple
         * propagators write the same context key, the propagator later in the list
         * will "win".
         *
         * @param context Context to add values to
         * @param carrier Carrier from which to extract context
         */
        CompositePropagator.prototype.extract = function (context, carrier, getter) {
            return this._propagators.reduce(function (ctx, propagator) {
                try {
                    return propagator.extract(ctx, carrier, getter);
                }
                catch (err) {
                    index.src.diag.warn("Failed to inject with " + propagator.constructor.name + ". Err: " + err.message);
                }
                return ctx;
            }, context);
        };
        CompositePropagator.prototype.fields = function () {
            // return a new array so our fields cannot be modified
            return this._fields.slice();
        };
        return CompositePropagator;
    }());

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
    var VALID_KEY_CHAR_RANGE = '[_0-9a-z-*/]';
    var VALID_KEY = "[a-z]" + VALID_KEY_CHAR_RANGE + "{0,255}";
    var VALID_VENDOR_KEY = "[a-z0-9]" + VALID_KEY_CHAR_RANGE + "{0,240}@[a-z]" + VALID_KEY_CHAR_RANGE + "{0,13}";
    var VALID_KEY_REGEX = new RegExp("^(?:" + VALID_KEY + "|" + VALID_VENDOR_KEY + ")$");
    var VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
    var INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
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
    var MAX_TRACE_STATE_ITEMS = 32;
    var MAX_TRACE_STATE_LEN = 512;
    var LIST_MEMBERS_SEPARATOR = ',';
    var LIST_MEMBER_KEY_VALUE_SPLITTER = '=';
    /**
     * TraceState must be a class and not a simple object type because of the spec
     * requirement (https://www.w3.org/TR/trace-context/#tracestate-field).
     *
     * Here is the list of allowed mutations:
     * - New key-value pair should be added into the beginning of the list
     * - The value of any key can be updated. Modified keys MUST be moved to the
     * beginning of the list.
     */
    var TraceState = /** @class */ (function () {
        function TraceState(rawTraceState) {
            this._internalState = new Map();
            if (rawTraceState)
                this._parse(rawTraceState);
        }
        TraceState.prototype.set = function (key, value) {
            // TODO: Benchmark the different approaches(map vs list) and
            // use the faster one.
            var traceState = this._clone();
            if (traceState._internalState.has(key)) {
                traceState._internalState.delete(key);
            }
            traceState._internalState.set(key, value);
            return traceState;
        };
        TraceState.prototype.unset = function (key) {
            var traceState = this._clone();
            traceState._internalState.delete(key);
            return traceState;
        };
        TraceState.prototype.get = function (key) {
            return this._internalState.get(key);
        };
        TraceState.prototype.serialize = function () {
            var _this = this;
            return this._keys()
                .reduce(function (agg, key) {
                agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + _this.get(key));
                return agg;
            }, [])
                .join(LIST_MEMBERS_SEPARATOR);
        };
        TraceState.prototype._parse = function (rawTraceState) {
            if (rawTraceState.length > MAX_TRACE_STATE_LEN)
                return;
            this._internalState = rawTraceState
                .split(LIST_MEMBERS_SEPARATOR)
                .reverse() // Store in reverse so new keys (.set(...)) will be placed at the beginning
                .reduce(function (agg, part) {
                var listMember = part.trim(); // Optional Whitespace (OWS) handling
                var i = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
                if (i !== -1) {
                    var key = listMember.slice(0, i);
                    var value = listMember.slice(i + 1, part.length);
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
        };
        TraceState.prototype._keys = function () {
            return Array.from(this._internalState.keys()).reverse();
        };
        TraceState.prototype._clone = function () {
            var traceState = new TraceState();
            traceState._internalState = new Map(this._internalState);
            return traceState;
        };
        return TraceState;
    }());

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
    var TRACE_PARENT_HEADER = 'traceparent';
    var TRACE_STATE_HEADER = 'tracestate';
    var VERSION = '00';
    var VERSION_PART = '(?!ff)[\\da-f]{2}';
    var TRACE_ID_PART = '(?![0]{32})[\\da-f]{32}';
    var PARENT_ID_PART = '(?![0]{16})[\\da-f]{16}';
    var FLAGS_PART = '[\\da-f]{2}';
    var TRACE_PARENT_REGEX = new RegExp("^\\s?(" + VERSION_PART + ")-(" + TRACE_ID_PART + ")-(" + PARENT_ID_PART + ")-(" + FLAGS_PART + ")(-.*)?\\s?$");
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
        var match = TRACE_PARENT_REGEX.exec(traceParent);
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
    var W3CTraceContextPropagator = /** @class */ (function () {
        function W3CTraceContextPropagator() {
        }
        W3CTraceContextPropagator.prototype.inject = function (context, carrier, setter) {
            var spanContext = index.src.trace.getSpanContext(context);
            if (!spanContext ||
                isTracingSuppressed(context) ||
                !index.src.isSpanContextValid(spanContext))
                return;
            var traceParent = VERSION + "-" + spanContext.traceId + "-" + spanContext.spanId + "-0" + Number(spanContext.traceFlags || index.src.TraceFlags.NONE).toString(16);
            setter.set(carrier, TRACE_PARENT_HEADER, traceParent);
            if (spanContext.traceState) {
                setter.set(carrier, TRACE_STATE_HEADER, spanContext.traceState.serialize());
            }
        };
        W3CTraceContextPropagator.prototype.extract = function (context, carrier, getter) {
            var traceParentHeader = getter.get(carrier, TRACE_PARENT_HEADER);
            if (!traceParentHeader)
                return context;
            var traceParent = Array.isArray(traceParentHeader)
                ? traceParentHeader[0]
                : traceParentHeader;
            if (typeof traceParent !== 'string')
                return context;
            var spanContext = parseTraceParent(traceParent);
            if (!spanContext)
                return context;
            spanContext.isRemote = true;
            var traceStateHeader = getter.get(carrier, TRACE_STATE_HEADER);
            if (traceStateHeader) {
                // If more than one `tracestate` header is found, we merge them into a
                // single header.
                var state = Array.isArray(traceStateHeader)
                    ? traceStateHeader.join(',')
                    : traceStateHeader;
                spanContext.traceState = new TraceState(typeof state === 'string' ? state : undefined);
            }
            return index.src.trace.setSpanContext(context, spanContext);
        };
        W3CTraceContextPropagator.prototype.fields = function () {
            return [TRACE_PARENT_HEADER, TRACE_STATE_HEADER];
        };
        return W3CTraceContextPropagator;
    }());

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
    index.src.createContextKey('OpenTelemetry SDK Context Key RPC_METADATA');
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
    var objectTag = '[object Object]';
    var nullTag = '[object Null]';
    var undefinedTag = '[object Undefined]';
    var funcProto = Function.prototype;
    var funcToString = funcProto.toString;
    var objectCtorString = funcToString.call(Object);
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var symToStringTag = Symbol ? Symbol.toStringTag : undefined;
    var nativeObjectToString = objectProto.toString;
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
        var proto = getPrototype(value);
        if (proto === null) {
            return true;
        }
        var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
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
        var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
        var unmasked = false;
        try {
            value[symToStringTag] = undefined;
            unmasked = true;
        }
        catch (e) {
            // silence
        }
        var result = nativeObjectToString.call(value);
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
    var MAX_LEVEL = 20;
    /**
     * Merges objects together
     * @param args - objects / values to be merged
     */
    function merge() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var result = args.shift();
        var objects = new WeakMap();
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
    function mergeTwoObjects(one, two, level, objects) {
        if (level === void 0) { level = 0; }
        var result;
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
                for (var i = 0, j = two.length; i < j; i++) {
                    result.push(takeValue(two[i]));
                }
            }
            else if (isObject(two)) {
                var keys = Object.keys(two);
                for (var i = 0, j = keys.length; i < j; i++) {
                    var key = keys[i];
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
                var keys = Object.keys(two);
                for (var i = 0, j = keys.length; i < j; i++) {
                    var key = keys[i];
                    var twoValue = two[key];
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
                        var obj1 = result[key];
                        var obj2 = twoValue;
                        if (wasObjectReferenced(one, key, objects) ||
                            wasObjectReferenced(two, key, objects)) {
                            delete result[key];
                        }
                        else {
                            if (isObject(obj1) && isObject(obj2)) {
                                var arr1 = objects.get(obj1) || [];
                                var arr2 = objects.get(obj2) || [];
                                arr1.push({ obj: one, key: key });
                                arr2.push({ obj: two, key: key });
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
        var arr = objects.get(obj[key]) || [];
        for (var i = 0, j = arr.length; i < j; i++) {
            var info = arr[i];
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
    var __extends$2 = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    /**
     * Error that is thrown on timeouts.
     */
    /** @class */ ((function (_super) {
        __extends$2(TimeoutError, _super);
        function TimeoutError(message) {
            var _this = _super.call(this, message) || this;
            // manually adjust prototype to retain `instanceof` functionality when targeting ES5, see:
            // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(_this, TimeoutError.prototype);
            return _this;
        }
        return TimeoutError;
    })(Error));

    (this && this.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
    var Deferred = /** @class */ (function () {
        function Deferred() {
            var _this = this;
            this._promise = new Promise(function (resolve, reject) {
                _this._resolve = resolve;
                _this._reject = reject;
            });
        }
        Object.defineProperty(Deferred.prototype, "promise", {
            get: function () {
                return this._promise;
            },
            enumerable: false,
            configurable: true
        });
        Deferred.prototype.resolve = function (val) {
            this._resolve(val);
        };
        Deferred.prototype.reject = function (err) {
            this._reject(err);
        };
        return Deferred;
    }());

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
    var __read$4 = (this && this.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray$3 = (this && this.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    /**
     * Bind the callback and only invoke the callback once regardless how many times `BindOnceFuture.call` is invoked.
     */
    var BindOnceFuture = /** @class */ (function () {
        function BindOnceFuture(_callback, _that) {
            this._callback = _callback;
            this._that = _that;
            this._isCalled = false;
            this._deferred = new Deferred();
        }
        Object.defineProperty(BindOnceFuture.prototype, "isCalled", {
            get: function () {
                return this._isCalled;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BindOnceFuture.prototype, "promise", {
            get: function () {
                return this._deferred.promise;
            },
            enumerable: false,
            configurable: true
        });
        BindOnceFuture.prototype.call = function () {
            var _a;
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!this._isCalled) {
                this._isCalled = true;
                try {
                    Promise.resolve((_a = this._callback).call.apply(_a, __spreadArray$3([this._that], __read$4(args), false))).then(function (val) { return _this._deferred.resolve(val); }, function (err) { return _this._deferred.reject(err); });
                }
                catch (err) {
                    this._deferred.reject(err);
                }
            }
            return this._deferred.promise;
        };
        return BindOnceFuture;
    }());

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
        return new Promise(function (resolve) {
            // prevent downstream exporter calls from generating spans
            index.src.context.with(suppressTracing(index.src.context.active()), function () {
                exporter.export(arg, function (result) {
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
    var internal = {
        _export: _export,
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
    var ExceptionEventName = 'exception';

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
    var __values$2 = (this && this.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    var __read$3 = (this && this.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray$2 = (this && this.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    /**
     * This class represents a span.
     */
    var Span = /** @class */ (function () {
        /**
         * Constructs a new Span instance.
         *
         * @deprecated calling Span constructor directly is not supported. Please use tracer.startSpan.
         * */
        function Span(parentTracer, context, spanName, spanContext, kind, parentSpanId, links, startTime, _deprecatedClock, // keeping this argument even though it is unused to ensure backwards compatibility
        attributes) {
            if (links === void 0) { links = []; }
            this.attributes = {};
            this.links = [];
            this.events = [];
            this._droppedAttributesCount = 0;
            this._droppedEventsCount = 0;
            this._droppedLinksCount = 0;
            this.status = {
                code: index.src.SpanStatusCode.UNSET,
            };
            this.endTime = [0, 0];
            this._ended = false;
            this._duration = [-1, -1];
            this.name = spanName;
            this._spanContext = spanContext;
            this.parentSpanId = parentSpanId;
            this.kind = kind;
            this.links = links;
            var now = Date.now();
            this._performanceStartTime = otperformance.now();
            this._performanceOffset =
                now - (this._performanceStartTime + getTimeOrigin());
            this._startTimeProvided = startTime != null;
            this.startTime = this._getTime(startTime !== null && startTime !== void 0 ? startTime : now);
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
        Span.prototype.spanContext = function () {
            return this._spanContext;
        };
        Span.prototype.setAttribute = function (key, value) {
            if (value == null || this._isSpanEnded())
                return this;
            if (key.length === 0) {
                index.src.diag.warn("Invalid attribute key: " + key);
                return this;
            }
            if (!isAttributeValue(value)) {
                index.src.diag.warn("Invalid attribute value set for key: " + key);
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
        };
        Span.prototype.setAttributes = function (attributes) {
            var e_1, _a;
            try {
                for (var _b = __values$2(Object.entries(attributes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read$3(_c.value, 2), k = _d[0], v = _d[1];
                    this.setAttribute(k, v);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return this;
        };
        /**
         *
         * @param name Span Name
         * @param [attributesOrStartTime] Span attributes or start time
         *     if type is {@type TimeInput} and 3rd param is undefined
         * @param [timeStamp] Specified time stamp for the event
         */
        Span.prototype.addEvent = function (name, attributesOrStartTime, timeStamp) {
            if (this._isSpanEnded())
                return this;
            if (this._spanLimits.eventCountLimit === 0) {
                index.src.diag.warn('No events allowed.');
                this._droppedEventsCount++;
                return this;
            }
            if (this.events.length >= this._spanLimits.eventCountLimit) {
                if (this._droppedEventsCount === 0) {
                    index.src.diag.debug('Dropping extra events.');
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
            var attributes = sanitizeAttributes(attributesOrStartTime);
            this.events.push({
                name: name,
                attributes: attributes,
                time: this._getTime(timeStamp),
                droppedAttributesCount: 0,
            });
            return this;
        };
        Span.prototype.addLink = function (link) {
            this.links.push(link);
            return this;
        };
        Span.prototype.addLinks = function (links) {
            var _a;
            (_a = this.links).push.apply(_a, __spreadArray$2([], __read$3(links), false));
            return this;
        };
        Span.prototype.setStatus = function (status) {
            if (this._isSpanEnded())
                return this;
            this.status = status;
            return this;
        };
        Span.prototype.updateName = function (name) {
            if (this._isSpanEnded())
                return this;
            this.name = name;
            return this;
        };
        Span.prototype.end = function (endTime) {
            if (this._isSpanEnded()) {
                index.src.diag.error(this.name + " " + this._spanContext.traceId + "-" + this._spanContext.spanId + " - You can only call end() on a span once.");
                return;
            }
            this._ended = true;
            this.endTime = this._getTime(endTime);
            this._duration = hrTimeDuration(this.startTime, this.endTime);
            if (this._duration[0] < 0) {
                index.src.diag.warn('Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.', this.startTime, this.endTime);
                this.endTime = this.startTime.slice();
                this._duration = [0, 0];
            }
            if (this._droppedEventsCount > 0) {
                index.src.diag.warn("Dropped " + this._droppedEventsCount + " events because eventCountLimit reached");
            }
            this._spanProcessor.onEnd(this);
        };
        Span.prototype._getTime = function (inp) {
            if (typeof inp === 'number' && inp < otperformance.now()) {
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
            var msDuration = otperformance.now() - this._performanceStartTime;
            return addHrTimes(this.startTime, millisToHrTime(msDuration));
        };
        Span.prototype.isRecording = function () {
            return this._ended === false;
        };
        Span.prototype.recordException = function (exception, time) {
            var attributes = {};
            if (typeof exception === 'string') {
                attributes[src.SEMATTRS_EXCEPTION_MESSAGE] = exception;
            }
            else if (exception) {
                if (exception.code) {
                    attributes[src.SEMATTRS_EXCEPTION_TYPE] = exception.code.toString();
                }
                else if (exception.name) {
                    attributes[src.SEMATTRS_EXCEPTION_TYPE] = exception.name;
                }
                if (exception.message) {
                    attributes[src.SEMATTRS_EXCEPTION_MESSAGE] = exception.message;
                }
                if (exception.stack) {
                    attributes[src.SEMATTRS_EXCEPTION_STACKTRACE] = exception.stack;
                }
            }
            // these are minimum requirements from spec
            if (attributes[src.SEMATTRS_EXCEPTION_TYPE] ||
                attributes[src.SEMATTRS_EXCEPTION_MESSAGE]) {
                this.addEvent(ExceptionEventName, attributes, time);
            }
            else {
                index.src.diag.warn("Failed to record an exception " + exception);
            }
        };
        Object.defineProperty(Span.prototype, "duration", {
            get: function () {
                return this._duration;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Span.prototype, "ended", {
            get: function () {
                return this._ended;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Span.prototype, "droppedAttributesCount", {
            get: function () {
                return this._droppedAttributesCount;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Span.prototype, "droppedEventsCount", {
            get: function () {
                return this._droppedEventsCount;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Span.prototype, "droppedLinksCount", {
            get: function () {
                return this._droppedLinksCount;
            },
            enumerable: false,
            configurable: true
        });
        Span.prototype._isSpanEnded = function () {
            if (this._ended) {
                index.src.diag.warn("Can not execute the operation on ended Span {traceId: " + this._spanContext.traceId + ", spanId: " + this._spanContext.spanId + "}");
            }
            return this._ended;
        };
        // Utility function to truncate given value within size
        // for value type of string, will truncate to given limit
        // for type of non-string, will return same value
        Span.prototype._truncateToLimitUtil = function (value, limit) {
            if (value.length <= limit) {
                return value;
            }
            return value.substr(0, limit);
        };
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
        Span.prototype._truncateToSize = function (value) {
            var _this = this;
            var limit = this._attributeValueLengthLimit;
            // Check limit
            if (limit <= 0) {
                // Negative values are invalid, so do not truncate
                index.src.diag.warn("Attribute value limit must be positive, got " + limit);
                return value;
            }
            // String
            if (typeof value === 'string') {
                return this._truncateToLimitUtil(value, limit);
            }
            // Array of strings
            if (Array.isArray(value)) {
                return value.map(function (val) {
                    return typeof val === 'string' ? _this._truncateToLimitUtil(val, limit) : val;
                });
            }
            // Other types, no need to apply value length limit
            return value;
        };
        return Span;
    }());

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
    var AlwaysOffSampler = /** @class */ (function () {
        function AlwaysOffSampler() {
        }
        AlwaysOffSampler.prototype.shouldSample = function () {
            return {
                decision: exports.SamplingDecision.NOT_RECORD,
            };
        };
        AlwaysOffSampler.prototype.toString = function () {
            return 'AlwaysOffSampler';
        };
        return AlwaysOffSampler;
    }());

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
    var AlwaysOnSampler = /** @class */ (function () {
        function AlwaysOnSampler() {
        }
        AlwaysOnSampler.prototype.shouldSample = function () {
            return {
                decision: exports.SamplingDecision.RECORD_AND_SAMPLED,
            };
        };
        AlwaysOnSampler.prototype.toString = function () {
            return 'AlwaysOnSampler';
        };
        return AlwaysOnSampler;
    }());

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
    var ParentBasedSampler = /** @class */ (function () {
        function ParentBasedSampler(config) {
            var _a, _b, _c, _d;
            this._root = config.root;
            if (!this._root) {
                globalErrorHandler(new Error('ParentBasedSampler must have a root sampler configured'));
                this._root = new AlwaysOnSampler();
            }
            this._remoteParentSampled =
                (_a = config.remoteParentSampled) !== null && _a !== void 0 ? _a : new AlwaysOnSampler();
            this._remoteParentNotSampled =
                (_b = config.remoteParentNotSampled) !== null && _b !== void 0 ? _b : new AlwaysOffSampler();
            this._localParentSampled =
                (_c = config.localParentSampled) !== null && _c !== void 0 ? _c : new AlwaysOnSampler();
            this._localParentNotSampled =
                (_d = config.localParentNotSampled) !== null && _d !== void 0 ? _d : new AlwaysOffSampler();
        }
        ParentBasedSampler.prototype.shouldSample = function (context, traceId, spanName, spanKind, attributes, links) {
            var parentContext = index.src.trace.getSpanContext(context);
            if (!parentContext || !index.src.isSpanContextValid(parentContext)) {
                return this._root.shouldSample(context, traceId, spanName, spanKind, attributes, links);
            }
            if (parentContext.isRemote) {
                if (parentContext.traceFlags & index.src.TraceFlags.SAMPLED) {
                    return this._remoteParentSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
                }
                return this._remoteParentNotSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
            }
            if (parentContext.traceFlags & index.src.TraceFlags.SAMPLED) {
                return this._localParentSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
            }
            return this._localParentNotSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
        };
        ParentBasedSampler.prototype.toString = function () {
            return "ParentBased{root=" + this._root.toString() + ", remoteParentSampled=" + this._remoteParentSampled.toString() + ", remoteParentNotSampled=" + this._remoteParentNotSampled.toString() + ", localParentSampled=" + this._localParentSampled.toString() + ", localParentNotSampled=" + this._localParentNotSampled.toString() + "}";
        };
        return ParentBasedSampler;
    }());

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
    var TraceIdRatioBasedSampler = /** @class */ (function () {
        function TraceIdRatioBasedSampler(_ratio) {
            if (_ratio === void 0) { _ratio = 0; }
            this._ratio = _ratio;
            this._ratio = this._normalize(_ratio);
            this._upperBound = Math.floor(this._ratio * 0xffffffff);
        }
        TraceIdRatioBasedSampler.prototype.shouldSample = function (context, traceId) {
            return {
                decision: index.src.isValidTraceId(traceId) && this._accumulate(traceId) < this._upperBound
                    ? exports.SamplingDecision.RECORD_AND_SAMPLED
                    : exports.SamplingDecision.NOT_RECORD,
            };
        };
        TraceIdRatioBasedSampler.prototype.toString = function () {
            return "TraceIdRatioBased{" + this._ratio + "}";
        };
        TraceIdRatioBasedSampler.prototype._normalize = function (ratio) {
            if (typeof ratio !== 'number' || isNaN(ratio))
                return 0;
            return ratio >= 1 ? 1 : ratio <= 0 ? 0 : ratio;
        };
        TraceIdRatioBasedSampler.prototype._accumulate = function (traceId) {
            var accumulation = 0;
            for (var i = 0; i < traceId.length / 8; i++) {
                var pos = i * 8;
                var part = parseInt(traceId.slice(pos, pos + 8), 16);
                accumulation = (accumulation ^ part) >>> 0;
            }
            return accumulation;
        };
        return TraceIdRatioBasedSampler;
    }());

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
    var env = getEnv();
    var FALLBACK_OTEL_TRACES_SAMPLER = TracesSamplerValues.AlwaysOn;
    var DEFAULT_RATIO = 1;
    /**
     * Load default configuration. For fields with primitive values, any user-provided
     * value will override the corresponding default value. For fields with
     * non-primitive values (like `spanLimits`), the user-provided value will be
     * used to extend the default value.
     */
    // object needs to be wrapped in this function and called when needed otherwise
    // envs are parsed before tests are ran - causes tests using these envs to fail
    function loadDefaultConfig() {
        var _env = getEnv();
        return {
            sampler: buildSamplerFromEnv(env),
            forceFlushTimeoutMillis: 30000,
            generalLimits: {
                attributeValueLengthLimit: _env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT,
                attributeCountLimit: _env.OTEL_ATTRIBUTE_COUNT_LIMIT,
            },
            spanLimits: {
                attributeValueLengthLimit: _env.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT,
                attributeCountLimit: _env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT,
                linkCountLimit: _env.OTEL_SPAN_LINK_COUNT_LIMIT,
                eventCountLimit: _env.OTEL_SPAN_EVENT_COUNT_LIMIT,
                attributePerEventCountLimit: _env.OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT,
                attributePerLinkCountLimit: _env.OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT,
            },
        };
    }
    /**
     * Based on environment, builds a sampler, complies with specification.
     * @param environment optional, by default uses getEnv(), but allows passing a value to reuse parsed environment
     */
    function buildSamplerFromEnv(environment) {
        if (environment === void 0) { environment = getEnv(); }
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
                index.src.diag.error("OTEL_TRACES_SAMPLER value \"" + environment.OTEL_TRACES_SAMPLER + " invalid, defaulting to " + FALLBACK_OTEL_TRACES_SAMPLER + "\".");
                return new AlwaysOnSampler();
        }
    }
    function getSamplerProbabilityFromEnv(environment) {
        if (environment.OTEL_TRACES_SAMPLER_ARG === undefined ||
            environment.OTEL_TRACES_SAMPLER_ARG === '') {
            index.src.diag.error("OTEL_TRACES_SAMPLER_ARG is blank, defaulting to " + DEFAULT_RATIO + ".");
            return DEFAULT_RATIO;
        }
        var probability = Number(environment.OTEL_TRACES_SAMPLER_ARG);
        if (isNaN(probability)) {
            index.src.diag.error("OTEL_TRACES_SAMPLER_ARG=" + environment.OTEL_TRACES_SAMPLER_ARG + " was given, but it is invalid, defaulting to " + DEFAULT_RATIO + ".");
            return DEFAULT_RATIO;
        }
        if (probability < 0 || probability > 1) {
            index.src.diag.error("OTEL_TRACES_SAMPLER_ARG=" + environment.OTEL_TRACES_SAMPLER_ARG + " was given, but it is out of range ([0..1]), defaulting to " + DEFAULT_RATIO + ".");
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
        var perInstanceDefaults = {
            sampler: buildSamplerFromEnv(),
        };
        var DEFAULT_CONFIG = loadDefaultConfig();
        var target = Object.assign({}, DEFAULT_CONFIG, perInstanceDefaults, userConfig);
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
        var spanLimits = Object.assign({}, userConfig.spanLimits);
        var parsedEnvConfig = getEnvWithoutDefaults();
        /**
         * Reassign span attribute count limit to use first non null value defined by user or use default value
         */
        spanLimits.attributeCountLimit =
            (_f = (_e = (_d = (_b = (_a = userConfig.spanLimits) === null || _a === void 0 ? void 0 : _a.attributeCountLimit) !== null && _b !== void 0 ? _b : (_c = userConfig.generalLimits) === null || _c === void 0 ? void 0 : _c.attributeCountLimit) !== null && _d !== void 0 ? _d : parsedEnvConfig.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT) !== null && _e !== void 0 ? _e : parsedEnvConfig.OTEL_ATTRIBUTE_COUNT_LIMIT) !== null && _f !== void 0 ? _f : DEFAULT_ATTRIBUTE_COUNT_LIMIT;
        /**
         * Reassign span attribute value length limit to use first non null value defined by user or use default value
         */
        spanLimits.attributeValueLengthLimit =
            (_m = (_l = (_k = (_h = (_g = userConfig.spanLimits) === null || _g === void 0 ? void 0 : _g.attributeValueLengthLimit) !== null && _h !== void 0 ? _h : (_j = userConfig.generalLimits) === null || _j === void 0 ? void 0 : _j.attributeValueLengthLimit) !== null && _k !== void 0 ? _k : parsedEnvConfig.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null && _l !== void 0 ? _l : parsedEnvConfig.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null && _m !== void 0 ? _m : DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT;
        return Object.assign({}, userConfig, { spanLimits: spanLimits });
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
    var BatchSpanProcessorBase = /** @class */ (function () {
        function BatchSpanProcessorBase(_exporter, config) {
            this._exporter = _exporter;
            this._isExporting = false;
            this._finishedSpans = [];
            this._droppedSpansCount = 0;
            var env = getEnv();
            this._maxExportBatchSize =
                typeof (config === null || config === void 0 ? void 0 : config.maxExportBatchSize) === 'number'
                    ? config.maxExportBatchSize
                    : env.OTEL_BSP_MAX_EXPORT_BATCH_SIZE;
            this._maxQueueSize =
                typeof (config === null || config === void 0 ? void 0 : config.maxQueueSize) === 'number'
                    ? config.maxQueueSize
                    : env.OTEL_BSP_MAX_QUEUE_SIZE;
            this._scheduledDelayMillis =
                typeof (config === null || config === void 0 ? void 0 : config.scheduledDelayMillis) === 'number'
                    ? config.scheduledDelayMillis
                    : env.OTEL_BSP_SCHEDULE_DELAY;
            this._exportTimeoutMillis =
                typeof (config === null || config === void 0 ? void 0 : config.exportTimeoutMillis) === 'number'
                    ? config.exportTimeoutMillis
                    : env.OTEL_BSP_EXPORT_TIMEOUT;
            this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
            if (this._maxExportBatchSize > this._maxQueueSize) {
                index.src.diag.warn('BatchSpanProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize');
                this._maxExportBatchSize = this._maxQueueSize;
            }
        }
        BatchSpanProcessorBase.prototype.forceFlush = function () {
            if (this._shutdownOnce.isCalled) {
                return this._shutdownOnce.promise;
            }
            return this._flushAll();
        };
        // does nothing.
        BatchSpanProcessorBase.prototype.onStart = function (_span, _parentContext) { };
        BatchSpanProcessorBase.prototype.onEnd = function (span) {
            if (this._shutdownOnce.isCalled) {
                return;
            }
            if ((span.spanContext().traceFlags & index.src.TraceFlags.SAMPLED) === 0) {
                return;
            }
            this._addToBuffer(span);
        };
        BatchSpanProcessorBase.prototype.shutdown = function () {
            return this._shutdownOnce.call();
        };
        BatchSpanProcessorBase.prototype._shutdown = function () {
            var _this = this;
            return Promise.resolve()
                .then(function () {
                return _this.onShutdown();
            })
                .then(function () {
                return _this._flushAll();
            })
                .then(function () {
                return _this._exporter.shutdown();
            });
        };
        /** Add a span in the buffer. */
        BatchSpanProcessorBase.prototype._addToBuffer = function (span) {
            if (this._finishedSpans.length >= this._maxQueueSize) {
                // limit reached, drop span
                if (this._droppedSpansCount === 0) {
                    index.src.diag.debug('maxQueueSize reached, dropping spans');
                }
                this._droppedSpansCount++;
                return;
            }
            if (this._droppedSpansCount > 0) {
                // some spans were dropped, log once with count of spans dropped
                index.src.diag.warn("Dropped " + this._droppedSpansCount + " spans because maxQueueSize reached");
                this._droppedSpansCount = 0;
            }
            this._finishedSpans.push(span);
            this._maybeStartTimer();
        };
        /**
         * Send all spans to the exporter respecting the batch size limit
         * This function is used only on forceFlush or shutdown,
         * for all other cases _flush should be used
         * */
        BatchSpanProcessorBase.prototype._flushAll = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var promises = [];
                // calculate number of batches
                var count = Math.ceil(_this._finishedSpans.length / _this._maxExportBatchSize);
                for (var i = 0, j = count; i < j; i++) {
                    promises.push(_this._flushOneBatch());
                }
                Promise.all(promises)
                    .then(function () {
                    resolve();
                })
                    .catch(reject);
            });
        };
        BatchSpanProcessorBase.prototype._flushOneBatch = function () {
            var _this = this;
            this._clearTimer();
            if (this._finishedSpans.length === 0) {
                return Promise.resolve();
            }
            return new Promise(function (resolve, reject) {
                var timer = setTimeout(function () {
                    // don't wait anymore for export, this way the next batch can start
                    reject(new Error('Timeout'));
                }, _this._exportTimeoutMillis);
                // prevent downstream exporter calls from generating spans
                index.src.context.with(suppressTracing(index.src.context.active()), function () {
                    // Reset the finished spans buffer here because the next invocations of the _flush method
                    // could pass the same finished spans to the exporter if the buffer is cleared
                    // outside the execution of this callback.
                    var spans;
                    if (_this._finishedSpans.length <= _this._maxExportBatchSize) {
                        spans = _this._finishedSpans;
                        _this._finishedSpans = [];
                    }
                    else {
                        spans = _this._finishedSpans.splice(0, _this._maxExportBatchSize);
                    }
                    var doExport = function () {
                        return _this._exporter.export(spans, function (result) {
                            var _a;
                            clearTimeout(timer);
                            if (result.code === ExportResultCode.SUCCESS) {
                                resolve();
                            }
                            else {
                                reject((_a = result.error) !== null && _a !== void 0 ? _a : new Error('BatchSpanProcessor: span export failed'));
                            }
                        });
                    };
                    var pendingResources = null;
                    for (var i = 0, len = spans.length; i < len; i++) {
                        var span = spans[i];
                        if (span.resource.asyncAttributesPending &&
                            span.resource.waitForAsyncAttributes) {
                            pendingResources !== null && pendingResources !== void 0 ? pendingResources : (pendingResources = []);
                            pendingResources.push(span.resource.waitForAsyncAttributes());
                        }
                    }
                    // Avoid scheduling a promise to make the behavior more predictable and easier to test
                    if (pendingResources === null) {
                        doExport();
                    }
                    else {
                        Promise.all(pendingResources).then(doExport, function (err) {
                            globalErrorHandler(err);
                            reject(err);
                        });
                    }
                });
            });
        };
        BatchSpanProcessorBase.prototype._maybeStartTimer = function () {
            var _this = this;
            if (this._isExporting)
                return;
            var flush = function () {
                _this._isExporting = true;
                _this._flushOneBatch()
                    .finally(function () {
                    _this._isExporting = false;
                    if (_this._finishedSpans.length > 0) {
                        _this._clearTimer();
                        _this._maybeStartTimer();
                    }
                })
                    .catch(function (e) {
                    _this._isExporting = false;
                    globalErrorHandler(e);
                });
            };
            // we only wait if the queue doesn't have enough elements yet
            if (this._finishedSpans.length >= this._maxExportBatchSize) {
                return flush();
            }
            if (this._timer !== undefined)
                return;
            this._timer = setTimeout(function () { return flush(); }, this._scheduledDelayMillis);
            unrefTimer(this._timer);
        };
        BatchSpanProcessorBase.prototype._clearTimer = function () {
            if (this._timer !== undefined) {
                clearTimeout(this._timer);
                this._timer = undefined;
            }
        };
        return BatchSpanProcessorBase;
    }());

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
    var __extends$1 = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var BatchSpanProcessor = /** @class */ (function (_super) {
        __extends$1(BatchSpanProcessor, _super);
        function BatchSpanProcessor(_exporter, config) {
            var _this = _super.call(this, _exporter, config) || this;
            _this.onInit(config);
            return _this;
        }
        BatchSpanProcessor.prototype.onInit = function (config) {
            var _this = this;
            if ((config === null || config === void 0 ? void 0 : config.disableAutoFlushOnDocumentHide) !== true &&
                typeof document !== 'undefined') {
                this._visibilityChangeListener = function () {
                    if (document.visibilityState === 'hidden') {
                        void _this.forceFlush();
                    }
                };
                this._pageHideListener = function () {
                    void _this.forceFlush();
                };
                document.addEventListener('visibilitychange', this._visibilityChangeListener);
                // use 'pagehide' event as a fallback for Safari; see https://bugs.webkit.org/show_bug.cgi?id=116769
                document.addEventListener('pagehide', this._pageHideListener);
            }
        };
        BatchSpanProcessor.prototype.onShutdown = function () {
            if (typeof document !== 'undefined') {
                if (this._visibilityChangeListener) {
                    document.removeEventListener('visibilitychange', this._visibilityChangeListener);
                }
                if (this._pageHideListener) {
                    document.removeEventListener('pagehide', this._pageHideListener);
                }
            }
        };
        return BatchSpanProcessor;
    }(BatchSpanProcessorBase));

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
    var SPAN_ID_BYTES = 8;
    var TRACE_ID_BYTES = 16;
    var RandomIdGenerator = /** @class */ (function () {
        function RandomIdGenerator() {
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
        return RandomIdGenerator;
    }());
    var SHARED_CHAR_CODES_ARRAY = Array(32);
    function getIdGenerator(bytes) {
        return function generateId() {
            for (var i = 0; i < bytes * 2; i++) {
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
    var Tracer = /** @class */ (function () {
        /**
         * Constructs a new Tracer instance.
         */
        function Tracer(instrumentationLibrary, config, _tracerProvider) {
            this._tracerProvider = _tracerProvider;
            var localConfig = mergeConfig(config);
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
        Tracer.prototype.startSpan = function (name, options, context) {
            var _a, _b, _c;
            if (options === void 0) { options = {}; }
            if (context === void 0) { context = index.src.context.active(); }
            // remove span from context in case a root span is requested via options
            if (options.root) {
                context = index.src.trace.deleteSpan(context);
            }
            var parentSpan = index.src.trace.getSpan(context);
            if (isTracingSuppressed(context)) {
                index.src.diag.debug('Instrumentation suppressed, returning Noop Span');
                var nonRecordingSpan = index.src.trace.wrapSpanContext(index.src.INVALID_SPAN_CONTEXT);
                return nonRecordingSpan;
            }
            var parentSpanContext = parentSpan === null || parentSpan === void 0 ? void 0 : parentSpan.spanContext();
            var spanId = this._idGenerator.generateSpanId();
            var traceId;
            var traceState;
            var parentSpanId;
            if (!parentSpanContext ||
                !index.src.trace.isSpanContextValid(parentSpanContext)) {
                // New root span.
                traceId = this._idGenerator.generateTraceId();
            }
            else {
                // New child span.
                traceId = parentSpanContext.traceId;
                traceState = parentSpanContext.traceState;
                parentSpanId = parentSpanContext.spanId;
            }
            var spanKind = (_a = options.kind) !== null && _a !== void 0 ? _a : index.src.SpanKind.INTERNAL;
            var links = ((_b = options.links) !== null && _b !== void 0 ? _b : []).map(function (link) {
                return {
                    context: link.context,
                    attributes: sanitizeAttributes(link.attributes),
                };
            });
            var attributes = sanitizeAttributes(options.attributes);
            // make sampling decision
            var samplingResult = this._sampler.shouldSample(context, traceId, name, spanKind, attributes, links);
            traceState = (_c = samplingResult.traceState) !== null && _c !== void 0 ? _c : traceState;
            var traceFlags = samplingResult.decision === index.src.SamplingDecision.RECORD_AND_SAMPLED
                ? index.src.TraceFlags.SAMPLED
                : index.src.TraceFlags.NONE;
            var spanContext = { traceId: traceId, spanId: spanId, traceFlags: traceFlags, traceState: traceState };
            if (samplingResult.decision === index.src.SamplingDecision.NOT_RECORD) {
                index.src.diag.debug('Recording is off, propagating context in a non-recording span');
                var nonRecordingSpan = index.src.trace.wrapSpanContext(spanContext);
                return nonRecordingSpan;
            }
            // Set initial span attributes. The attributes object may have been mutated
            // by the sampler, so we sanitize the merged attributes before setting them.
            var initAttributes = sanitizeAttributes(Object.assign(attributes, samplingResult.attributes));
            var span = new Span(this, context, name, spanContext, spanKind, parentSpanId, links, options.startTime, undefined, initAttributes);
            return span;
        };
        Tracer.prototype.startActiveSpan = function (name, arg2, arg3, arg4) {
            var opts;
            var ctx;
            var fn;
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
            var parentContext = ctx !== null && ctx !== void 0 ? ctx : index.src.context.active();
            var span = this.startSpan(name, opts, parentContext);
            var contextWithSpanSet = index.src.trace.setSpan(parentContext, span);
            return index.src.context.with(contextWithSpanSet, fn, undefined, span);
        };
        /** Returns the active {@link GeneralLimits}. */
        Tracer.prototype.getGeneralLimits = function () {
            return this._generalLimits;
        };
        /** Returns the active {@link SpanLimits}. */
        Tracer.prototype.getSpanLimits = function () {
            return this._spanLimits;
        };
        Tracer.prototype.getActiveSpanProcessor = function () {
            return this._tracerProvider.getActiveSpanProcessor();
        };
        return Tracer;
    }());

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
    var __assign$1 = (this && this.__assign) || function () {
        __assign$1 = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign$1.apply(this, arguments);
    };
    var __awaiter$1 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator$1 = (this && this.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var __read$2 = (this && this.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    /**
     * A Resource describes the entity for which a signals (metrics or trace) are
     * collected.
     */
    var Resource = /** @class */ (function () {
        function Resource(
        /**
         * A dictionary of attributes with string keys and values that provide
         * information about the entity as numbers, strings or booleans
         * TODO: Consider to add check/validation on attributes.
         */
        attributes, asyncAttributesPromise) {
            var _this = this;
            var _a;
            this._attributes = attributes;
            this.asyncAttributesPending = asyncAttributesPromise != null;
            this._syncAttributes = (_a = this._attributes) !== null && _a !== void 0 ? _a : {};
            this._asyncAttributesPromise = asyncAttributesPromise === null || asyncAttributesPromise === void 0 ? void 0 : asyncAttributesPromise.then(function (asyncAttributes) {
                _this._attributes = Object.assign({}, _this._attributes, asyncAttributes);
                _this.asyncAttributesPending = false;
                return asyncAttributes;
            }, function (err) {
                index.src.diag.debug("a resource's async attributes promise rejected: %s", err);
                _this.asyncAttributesPending = false;
                return {};
            });
        }
        /**
         * Returns an empty Resource
         */
        Resource.empty = function () {
            return Resource.EMPTY;
        };
        /**
         * Returns a Resource that identifies the SDK in use.
         */
        Resource.default = function () {
            var _a;
            return new Resource((_a = {},
                _a[src.SEMRESATTRS_SERVICE_NAME] = defaultServiceName(),
                _a[src.SEMRESATTRS_TELEMETRY_SDK_LANGUAGE] = SDK_INFO[src.SEMRESATTRS_TELEMETRY_SDK_LANGUAGE],
                _a[src.SEMRESATTRS_TELEMETRY_SDK_NAME] = SDK_INFO[src.SEMRESATTRS_TELEMETRY_SDK_NAME],
                _a[src.SEMRESATTRS_TELEMETRY_SDK_VERSION] = SDK_INFO[src.SEMRESATTRS_TELEMETRY_SDK_VERSION],
                _a));
        };
        Object.defineProperty(Resource.prototype, "attributes", {
            get: function () {
                var _a;
                if (this.asyncAttributesPending) {
                    index.src.diag.error('Accessing resource attributes before async attributes settled');
                }
                return (_a = this._attributes) !== null && _a !== void 0 ? _a : {};
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Returns a promise that will never be rejected. Resolves when all async attributes have finished being added to
         * this Resource's attributes. This is useful in exporters to block until resource detection
         * has finished.
         */
        Resource.prototype.waitForAsyncAttributes = function () {
            return __awaiter$1(this, void 0, void 0, function () {
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.asyncAttributesPending) return [3 /*break*/, 2];
                            return [4 /*yield*/, this._asyncAttributesPromise];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Returns a new, merged {@link Resource} by merging the current Resource
         * with the other Resource. In case of a collision, other Resource takes
         * precedence.
         *
         * @param other the Resource that will be merged with this.
         * @returns the newly merged Resource.
         */
        Resource.prototype.merge = function (other) {
            var _this = this;
            var _a;
            if (!other)
                return this;
            // SpanAttributes from other resource overwrite attributes from this resource.
            var mergedSyncAttributes = __assign$1(__assign$1({}, this._syncAttributes), ((_a = other._syncAttributes) !== null && _a !== void 0 ? _a : other.attributes));
            if (!this._asyncAttributesPromise &&
                !other._asyncAttributesPromise) {
                return new Resource(mergedSyncAttributes);
            }
            var mergedAttributesPromise = Promise.all([
                this._asyncAttributesPromise,
                other._asyncAttributesPromise,
            ]).then(function (_a) {
                var _b;
                var _c = __read$2(_a, 2), thisAsyncAttributes = _c[0], otherAsyncAttributes = _c[1];
                return __assign$1(__assign$1(__assign$1(__assign$1({}, _this._syncAttributes), thisAsyncAttributes), ((_b = other._syncAttributes) !== null && _b !== void 0 ? _b : other.attributes)), otherAsyncAttributes);
            });
            return new Resource(mergedSyncAttributes, mergedAttributesPromise);
        };
        Resource.EMPTY = new Resource({});
        return Resource;
    }());

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
    var __assign = (this && this.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
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
    (this && this.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    (this && this.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
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
    (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    (this && this.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
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
    var __values$1 = (this && this.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    /**
     * Implementation of the {@link SpanProcessor} that simply forwards all
     * received events to a list of {@link SpanProcessor}s.
     */
    var MultiSpanProcessor = /** @class */ (function () {
        function MultiSpanProcessor(_spanProcessors) {
            this._spanProcessors = _spanProcessors;
        }
        MultiSpanProcessor.prototype.forceFlush = function () {
            var e_1, _a;
            var promises = [];
            try {
                for (var _b = __values$1(this._spanProcessors), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var spanProcessor = _c.value;
                    promises.push(spanProcessor.forceFlush());
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return new Promise(function (resolve) {
                Promise.all(promises)
                    .then(function () {
                    resolve();
                })
                    .catch(function (error) {
                    globalErrorHandler(error || new Error('MultiSpanProcessor: forceFlush failed'));
                    resolve();
                });
            });
        };
        MultiSpanProcessor.prototype.onStart = function (span, context) {
            var e_2, _a;
            try {
                for (var _b = __values$1(this._spanProcessors), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var spanProcessor = _c.value;
                    spanProcessor.onStart(span, context);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        };
        MultiSpanProcessor.prototype.onEnd = function (span) {
            var e_3, _a;
            try {
                for (var _b = __values$1(this._spanProcessors), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var spanProcessor = _c.value;
                    spanProcessor.onEnd(span);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
        };
        MultiSpanProcessor.prototype.shutdown = function () {
            var e_4, _a;
            var promises = [];
            try {
                for (var _b = __values$1(this._spanProcessors), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var spanProcessor = _c.value;
                    promises.push(spanProcessor.shutdown());
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return new Promise(function (resolve, reject) {
                Promise.all(promises).then(function () {
                    resolve();
                }, reject);
            });
        };
        return MultiSpanProcessor;
    }());

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
    var NoopSpanProcessor = /** @class */ (function () {
        function NoopSpanProcessor() {
        }
        NoopSpanProcessor.prototype.onStart = function (_span, _context) { };
        NoopSpanProcessor.prototype.onEnd = function (_span) { };
        NoopSpanProcessor.prototype.shutdown = function () {
            return Promise.resolve();
        };
        NoopSpanProcessor.prototype.forceFlush = function () {
            return Promise.resolve();
        };
        return NoopSpanProcessor;
    }());

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
    var BasicTracerProvider = /** @class */ (function () {
        function BasicTracerProvider(config) {
            if (config === void 0) { config = {}; }
            var _a;
            this._registeredSpanProcessors = [];
            this._tracers = new Map();
            var mergedConfig = merge({}, loadDefaultConfig(), reconfigureLimits(config));
            this.resource = (_a = mergedConfig.resource) !== null && _a !== void 0 ? _a : Resource.empty();
            this.resource = Resource.default().merge(this.resource);
            this._config = Object.assign({}, mergedConfig, {
                resource: this.resource,
            });
            var defaultExporter = this._buildExporterFromEnv();
            if (defaultExporter !== undefined) {
                var batchProcessor = new BatchSpanProcessor(defaultExporter);
                this.activeSpanProcessor = batchProcessor;
            }
            else {
                this.activeSpanProcessor = new NoopSpanProcessor();
            }
        }
        BasicTracerProvider.prototype.getTracer = function (name, version, options) {
            var key = name + "@" + (version || '') + ":" + ((options === null || options === void 0 ? void 0 : options.schemaUrl) || '');
            if (!this._tracers.has(key)) {
                this._tracers.set(key, new Tracer({ name: name, version: version, schemaUrl: options === null || options === void 0 ? void 0 : options.schemaUrl }, this._config, this));
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this._tracers.get(key);
        };
        /**
         * Adds a new {@link SpanProcessor} to this tracer.
         * @param spanProcessor the new SpanProcessor to be added.
         */
        BasicTracerProvider.prototype.addSpanProcessor = function (spanProcessor) {
            if (this._registeredSpanProcessors.length === 0) {
                // since we might have enabled by default a batchProcessor, we disable it
                // before adding the new one
                this.activeSpanProcessor
                    .shutdown()
                    .catch(function (err) {
                    return index.src.diag.error('Error while trying to shutdown current span processor', err);
                });
            }
            this._registeredSpanProcessors.push(spanProcessor);
            this.activeSpanProcessor = new MultiSpanProcessor(this._registeredSpanProcessors);
        };
        BasicTracerProvider.prototype.getActiveSpanProcessor = function () {
            return this.activeSpanProcessor;
        };
        /**
         * Register this TracerProvider for use with the OpenTelemetry API.
         * Undefined values may be replaced with defaults, and
         * null values will be skipped.
         *
         * @param config Configuration object for SDK registration
         */
        BasicTracerProvider.prototype.register = function (config) {
            if (config === void 0) { config = {}; }
            index.src.trace.setGlobalTracerProvider(this);
            if (config.propagator === undefined) {
                config.propagator = this._buildPropagatorFromEnv();
            }
            if (config.contextManager) {
                index.src.context.setGlobalContextManager(config.contextManager);
            }
            if (config.propagator) {
                index.src.propagation.setGlobalPropagator(config.propagator);
            }
        };
        BasicTracerProvider.prototype.forceFlush = function () {
            var timeout = this._config.forceFlushTimeoutMillis;
            var promises = this._registeredSpanProcessors.map(function (spanProcessor) {
                return new Promise(function (resolve) {
                    var state;
                    var timeoutInterval = setTimeout(function () {
                        resolve(new Error("Span processor did not completed within timeout period of " + timeout + " ms"));
                        state = exports.ForceFlushState.timeout;
                    }, timeout);
                    spanProcessor
                        .forceFlush()
                        .then(function () {
                        clearTimeout(timeoutInterval);
                        if (state !== exports.ForceFlushState.timeout) {
                            state = exports.ForceFlushState.resolved;
                            resolve(state);
                        }
                    })
                        .catch(function (error) {
                        clearTimeout(timeoutInterval);
                        state = exports.ForceFlushState.error;
                        resolve(error);
                    });
                });
            });
            return new Promise(function (resolve, reject) {
                Promise.all(promises)
                    .then(function (results) {
                    var errors = results.filter(function (result) { return result !== exports.ForceFlushState.resolved; });
                    if (errors.length > 0) {
                        reject(errors);
                    }
                    else {
                        resolve();
                    }
                })
                    .catch(function (error) { return reject([error]); });
            });
        };
        BasicTracerProvider.prototype.shutdown = function () {
            return this.activeSpanProcessor.shutdown();
        };
        /**
         * TS cannot yet infer the type of this.constructor:
         * https://github.com/Microsoft/TypeScript/issues/3841#issuecomment-337560146
         * There is no need to override either of the getters in your child class.
         * The type of the registered component maps should be the same across all
         * classes in the inheritance tree.
         */
        BasicTracerProvider.prototype._getPropagator = function (name) {
            var _a;
            return (_a = this.constructor._registeredPropagators.get(name)) === null || _a === void 0 ? void 0 : _a();
        };
        BasicTracerProvider.prototype._getSpanExporter = function (name) {
            var _a;
            return (_a = this.constructor._registeredExporters.get(name)) === null || _a === void 0 ? void 0 : _a();
        };
        BasicTracerProvider.prototype._buildPropagatorFromEnv = function () {
            var _this = this;
            // per spec, propagators from env must be deduplicated
            var uniquePropagatorNames = Array.from(new Set(getEnv().OTEL_PROPAGATORS));
            var propagators = uniquePropagatorNames.map(function (name) {
                var propagator = _this._getPropagator(name);
                if (!propagator) {
                    index.src.diag.warn("Propagator \"" + name + "\" requested through environment variable is unavailable.");
                }
                return propagator;
            });
            var validPropagators = propagators.reduce(function (list, item) {
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
        };
        BasicTracerProvider.prototype._buildExporterFromEnv = function () {
            var exporterName = getEnv().OTEL_TRACES_EXPORTER;
            if (exporterName === 'none' || exporterName === '')
                return;
            var exporter = this._getSpanExporter(exporterName);
            if (!exporter) {
                index.src.diag.error("Exporter \"" + exporterName + "\" requested through environment variable is unavailable.");
            }
            return exporter;
        };
        BasicTracerProvider._registeredPropagators = new Map([
            ['tracecontext', function () { return new W3CTraceContextPropagator(); }],
            ['baggage', function () { return new W3CBaggagePropagator(); }],
        ]);
        BasicTracerProvider._registeredExporters = new Map();
        return BasicTracerProvider;
    }());

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
    var __values = (this && this.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    /**
     * This is implementation of {@link SpanExporter} that prints spans to the
     * console. This class can be used for diagnostic purposes.
     *
     * NOTE: This {@link SpanExporter} is intended for diagnostics use only, output rendered to the console may change at any time.
     */
    /* eslint-disable no-console */
    var ConsoleSpanExporter = /** @class */ (function () {
        function ConsoleSpanExporter() {
        }
        /**
         * Export spans.
         * @param spans
         * @param resultCallback
         */
        ConsoleSpanExporter.prototype.export = function (spans, resultCallback) {
            return this._sendSpans(spans, resultCallback);
        };
        /**
         * Shutdown the exporter.
         */
        ConsoleSpanExporter.prototype.shutdown = function () {
            this._sendSpans([]);
            return this.forceFlush();
        };
        /**
         * Exports any pending spans in exporter
         */
        ConsoleSpanExporter.prototype.forceFlush = function () {
            return Promise.resolve();
        };
        /**
         * converts span info into more readable format
         * @param span
         */
        ConsoleSpanExporter.prototype._exportInfo = function (span) {
            var _a;
            return {
                resource: {
                    attributes: span.resource.attributes,
                },
                instrumentationScope: span.instrumentationLibrary,
                traceId: span.spanContext().traceId,
                parentId: span.parentSpanId,
                traceState: (_a = span.spanContext().traceState) === null || _a === void 0 ? void 0 : _a.serialize(),
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
        };
        /**
         * Showing spans in console
         * @param spans
         * @param done
         */
        ConsoleSpanExporter.prototype._sendSpans = function (spans, done) {
            var e_1, _a;
            try {
                for (var spans_1 = __values(spans), spans_1_1 = spans_1.next(); !spans_1_1.done; spans_1_1 = spans_1.next()) {
                    var span = spans_1_1.value;
                    console.dir(this._exportInfo(span), { depth: 3 });
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (spans_1_1 && !spans_1_1.done && (_a = spans_1.return)) _a.call(spans_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (done) {
                return done({ code: ExportResultCode.SUCCESS });
            }
        };
        return ConsoleSpanExporter;
    }());

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
    var __read$1 = (this && this.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray$1 = (this && this.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    /**
     * This class can be used for testing purposes. It stores the exported spans
     * in a list in memory that can be retrieved using the `getFinishedSpans()`
     * method.
     */
    var InMemorySpanExporter = /** @class */ (function () {
        function InMemorySpanExporter() {
            this._finishedSpans = [];
            /**
             * Indicates if the exporter has been "shutdown."
             * When false, exported spans will not be stored in-memory.
             */
            this._stopped = false;
        }
        InMemorySpanExporter.prototype.export = function (spans, resultCallback) {
            var _a;
            if (this._stopped)
                return resultCallback({
                    code: ExportResultCode.FAILED,
                    error: new Error('Exporter has been stopped'),
                });
            (_a = this._finishedSpans).push.apply(_a, __spreadArray$1([], __read$1(spans), false));
            setTimeout(function () { return resultCallback({ code: ExportResultCode.SUCCESS }); }, 0);
        };
        InMemorySpanExporter.prototype.shutdown = function () {
            this._stopped = true;
            this._finishedSpans = [];
            return this.forceFlush();
        };
        /**
         * Exports any pending spans in the exporter
         */
        InMemorySpanExporter.prototype.forceFlush = function () {
            return Promise.resolve();
        };
        InMemorySpanExporter.prototype.reset = function () {
            this._finishedSpans = [];
        };
        InMemorySpanExporter.prototype.getFinishedSpans = function () {
            return this._finishedSpans;
        };
        return InMemorySpanExporter;
    }());

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
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (this && this.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    /**
     * An implementation of the {@link SpanProcessor} that converts the {@link Span}
     * to {@link ReadableSpan} and passes it to the configured exporter.
     *
     * Only spans that are sampled are converted.
     *
     * NOTE: This {@link SpanProcessor} exports every ended span individually instead of batching spans together, which causes significant performance overhead with most exporters. For production use, please consider using the {@link BatchSpanProcessor} instead.
     */
    var SimpleSpanProcessor = /** @class */ (function () {
        function SimpleSpanProcessor(_exporter) {
            this._exporter = _exporter;
            this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
            this._unresolvedExports = new Set();
        }
        SimpleSpanProcessor.prototype.forceFlush = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: 
                        // await unresolved resources before resolving
                        return [4 /*yield*/, Promise.all(Array.from(this._unresolvedExports))];
                        case 1:
                            // await unresolved resources before resolving
                            _a.sent();
                            if (!this._exporter.forceFlush) return [3 /*break*/, 3];
                            return [4 /*yield*/, this._exporter.forceFlush()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        SimpleSpanProcessor.prototype.onStart = function (_span, _parentContext) { };
        SimpleSpanProcessor.prototype.onEnd = function (span) {
            var _this = this;
            var _a, _b;
            if (this._shutdownOnce.isCalled) {
                return;
            }
            if ((span.spanContext().traceFlags & index.src.TraceFlags.SAMPLED) === 0) {
                return;
            }
            var doExport = function () {
                return internal
                    ._export(_this._exporter, [span])
                    .then(function (result) {
                    var _a;
                    if (result.code !== ExportResultCode.SUCCESS) {
                        globalErrorHandler((_a = result.error) !== null && _a !== void 0 ? _a : new Error("SimpleSpanProcessor: span export failed (status " + result + ")"));
                    }
                })
                    .catch(function (error) {
                    globalErrorHandler(error);
                });
            };
            // Avoid scheduling a promise to make the behavior more predictable and easier to test
            if (span.resource.asyncAttributesPending) {
                var exportPromise_1 = (_b = (_a = span.resource).waitForAsyncAttributes) === null || _b === void 0 ? void 0 : _b.call(_a).then(function () {
                    if (exportPromise_1 != null) {
                        _this._unresolvedExports.delete(exportPromise_1);
                    }
                    return doExport();
                }, function (err) { return globalErrorHandler(err); });
                // store the unresolved exports
                if (exportPromise_1 != null) {
                    this._unresolvedExports.add(exportPromise_1);
                }
            }
            else {
                void doExport();
            }
        };
        SimpleSpanProcessor.prototype.shutdown = function () {
            return this._shutdownOnce.call();
        };
        SimpleSpanProcessor.prototype._shutdown = function () {
            return this._exporter.shutdown();
        };
        return SimpleSpanProcessor;
    }());

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
    var __read = (this && this.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    /**
     * Stack Context Manager for managing the state in web
     * it doesn't fully support the async calls though
     */
    var StackContextManager = /** @class */ (function () {
        function StackContextManager() {
            /**
             * whether the context manager is enabled or not
             */
            this._enabled = false;
            /**
             * Keeps the reference to current context
             */
            this._currentContext = index.src.ROOT_CONTEXT;
        }
        /**
         *
         * @param context
         * @param target Function to be executed within the context
         */
        // eslint-disable-next-line @typescript-eslint/ban-types
        StackContextManager.prototype._bindFunction = function (context, target) {
            if (context === void 0) { context = index.src.ROOT_CONTEXT; }
            var manager = this;
            var contextWrapper = function () {
                var _this = this;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return manager.with(context, function () { return target.apply(_this, args); });
            };
            Object.defineProperty(contextWrapper, 'length', {
                enumerable: false,
                configurable: true,
                writable: false,
                value: target.length,
            });
            return contextWrapper;
        };
        /**
         * Returns the active context
         */
        StackContextManager.prototype.active = function () {
            return this._currentContext;
        };
        /**
         * Binds a the certain context or the active one to the target function and then returns the target
         * @param context A context (span) to be bind to target
         * @param target a function or event emitter. When target or one of its callbacks is called,
         *  the provided context will be used as the active context for the duration of the call.
         */
        StackContextManager.prototype.bind = function (context, target) {
            // if no specific context to propagate is given, we use the current one
            if (context === undefined) {
                context = this.active();
            }
            if (typeof target === 'function') {
                return this._bindFunction(context, target);
            }
            return target;
        };
        /**
         * Disable the context manager (clears the current context)
         */
        StackContextManager.prototype.disable = function () {
            this._currentContext = index.src.ROOT_CONTEXT;
            this._enabled = false;
            return this;
        };
        /**
         * Enables the context manager and creates a default(root) context
         */
        StackContextManager.prototype.enable = function () {
            if (this._enabled) {
                return this;
            }
            this._enabled = true;
            this._currentContext = index.src.ROOT_CONTEXT;
            return this;
        };
        /**
         * Calls the callback function [fn] with the provided [context]. If [context] is undefined then it will use the window.
         * The context will be set as active
         * @param context
         * @param fn Callback function
         * @param thisArg optional receiver to be used for calling fn
         * @param args optional arguments forwarded to fn
         */
        StackContextManager.prototype.with = function (context, fn, thisArg) {
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            var previousContext = this._currentContext;
            this._currentContext = context || index.src.ROOT_CONTEXT;
            try {
                return fn.call.apply(fn, __spreadArray([thisArg], __read(args), false));
            }
            finally {
                this._currentContext = previousContext;
            }
        };
        return StackContextManager;
    }());

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
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    /**
     * This class represents a web tracer with {@link StackContextManager}
     */
    var WebTracerProvider = /** @class */ (function (_super) {
        __extends(WebTracerProvider, _super);
        /**
         * Constructs a new Tracer instance.
         * @param config Web Tracer config
         */
        function WebTracerProvider(config) {
            if (config === void 0) { config = {}; }
            var _this = _super.call(this, config) || this;
            if (config.contextManager) {
                throw ('contextManager should be defined in register method not in' +
                    ' constructor');
            }
            if (config.propagator) {
                throw 'propagator should be defined in register method not in constructor';
            }
            return _this;
        }
        /**
         * Register this TracerProvider for use with the OpenTelemetry API.
         * Undefined values may be replaced with defaults, and
         * null values will be skipped.
         *
         * @param config Configuration object for SDK registration
         */
        WebTracerProvider.prototype.register = function (config) {
            if (config === void 0) { config = {}; }
            if (config.contextManager === undefined) {
                config.contextManager = new StackContextManager();
            }
            if (config.contextManager) {
                config.contextManager.enable();
            }
            _super.prototype.register.call(this, config);
        };
        return WebTracerProvider;
    }(BasicTracerProvider));

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

    var urlNormalizingAnchor;
    function getUrlNormalizingAnchor() {
      if (!urlNormalizingAnchor) {
        urlNormalizingAnchor = document.createElement("a");
      }
      return urlNormalizingAnchor;
    }
    function hasKey(obj, key) {
      return (key in obj);
    }
    function addSpanNetworkEvent(span, performanceName, entries, refPerfName) {
      var perfTime = undefined;
      var refTime = undefined;
      if (hasKey(entries, performanceName) && typeof entries[performanceName] === "number") {
        perfTime = entries[performanceName];
      }
      var refName = refPerfName || exports.PerformanceTimingNames.FETCH_START;
      if (hasKey(entries, refName) && typeof entries[refName] === "number") {
        refTime = entries[refName];
      }
      if (perfTime !== undefined && refTime !== undefined && perfTime >= refTime) {
        span.addEvent(performanceName, perfTime);
        return span;
      }
      return undefined;
    }
    function addSpanNetworkEvents(span, resource) {
      addSpanNetworkEvent(span, exports.PerformanceTimingNames.FETCH_START, resource);
      addSpanNetworkEvent(span, exports.PerformanceTimingNames.DOMAIN_LOOKUP_START, resource);
      addSpanNetworkEvent(span, exports.PerformanceTimingNames.DOMAIN_LOOKUP_END, resource);
      addSpanNetworkEvent(span, exports.PerformanceTimingNames.CONNECT_START, resource);
      if (hasKey(resource, "name") && resource["name"].startsWith("https:")) {
        addSpanNetworkEvent(span, exports.PerformanceTimingNames.SECURE_CONNECTION_START, resource);
      }
      addSpanNetworkEvent(span, exports.PerformanceTimingNames.CONNECT_END, resource);
      addSpanNetworkEvent(span, exports.PerformanceTimingNames.REQUEST_START, resource);
      addSpanNetworkEvent(span, exports.PerformanceTimingNames.RESPONSE_START, resource);
      addSpanNetworkEvent(span, exports.PerformanceTimingNames.RESPONSE_END, resource);
      var encodedLength = resource[exports.PerformanceTimingNames.ENCODED_BODY_SIZE];
      if (encodedLength !== undefined) {
        span.setAttribute(src.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH, encodedLength);
      }
      var decodedLength = resource[exports.PerformanceTimingNames.DECODED_BODY_SIZE];
      if (decodedLength !== undefined && encodedLength !== decodedLength) {
        span.setAttribute(src.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED, decodedLength);
      }
    }
    function sortResources(filteredResources) {
      return filteredResources.slice().sort(function (a, b) {
        var valueA = a[exports.PerformanceTimingNames.FETCH_START];
        var valueB = b[exports.PerformanceTimingNames.FETCH_START];
        if (valueA > valueB) {
          return 1;
        } else if (valueA < valueB) {
          return -1;
        }
        return 0;
      });
    }
    function getOrigin() {
      return typeof location !== "undefined" ? location.origin : undefined;
    }
    function getResource(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType) {
      if (ignoredResources === void 0) {
        ignoredResources = new WeakSet();
      }
      var parsedSpanUrl = parseUrl(spanUrl);
      spanUrl = parsedSpanUrl.toString();
      var filteredResources = filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType);
      if (filteredResources.length === 0) {
        return {
          mainRequest: undefined
        };
      }
      if (filteredResources.length === 1) {
        return {
          mainRequest: filteredResources[0]
        };
      }
      var sorted = sortResources(filteredResources);
      if (parsedSpanUrl.origin !== getOrigin() && sorted.length > 1) {
        var corsPreFlightRequest = sorted[0];
        var mainRequest = findMainRequest(sorted, corsPreFlightRequest[exports.PerformanceTimingNames.RESPONSE_END], endTimeHR);
        var responseEnd = corsPreFlightRequest[exports.PerformanceTimingNames.RESPONSE_END];
        var fetchStart = mainRequest[exports.PerformanceTimingNames.FETCH_START];
        if (fetchStart < responseEnd) {
          mainRequest = corsPreFlightRequest;
          corsPreFlightRequest = undefined;
        }
        return {
          corsPreFlightRequest: corsPreFlightRequest,
          mainRequest: mainRequest
        };
      } else {
        return {
          mainRequest: filteredResources[0]
        };
      }
    }
    function findMainRequest(resources, corsPreFlightRequestEndTime, spanEndTimeHR) {
      var spanEndTime = hrTimeToNanoseconds(spanEndTimeHR);
      var minTime = hrTimeToNanoseconds(timeInputToHrTime(corsPreFlightRequestEndTime));
      var mainRequest = resources[1];
      var bestGap;
      var length = resources.length;
      for (var i = 1; i < length; i++) {
        var resource = resources[i];
        var resourceStartTime = hrTimeToNanoseconds(timeInputToHrTime(resource[exports.PerformanceTimingNames.FETCH_START]));
        var resourceEndTime = hrTimeToNanoseconds(timeInputToHrTime(resource[exports.PerformanceTimingNames.RESPONSE_END]));
        var currentGap = spanEndTime - resourceEndTime;
        if (resourceStartTime >= minTime && (!bestGap || currentGap < bestGap)) {
          bestGap = currentGap;
          mainRequest = resource;
        }
      }
      return mainRequest;
    }
    function filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType) {
      var startTime = hrTimeToNanoseconds(startTimeHR);
      var endTime = hrTimeToNanoseconds(endTimeHR);
      var filteredResources = resources.filter(function (resource) {
        var resourceStartTime = hrTimeToNanoseconds(timeInputToHrTime(resource[exports.PerformanceTimingNames.FETCH_START]));
        var resourceEndTime = hrTimeToNanoseconds(timeInputToHrTime(resource[exports.PerformanceTimingNames.RESPONSE_END]));
        return resource.initiatorType.toLowerCase() === (initiatorType || "xmlhttprequest") && resource.name === spanUrl && resourceStartTime >= startTime && resourceEndTime <= endTime;
      });
      if (filteredResources.length > 0) {
        filteredResources = filteredResources.filter(function (resource) {
          return !ignoredResources.has(resource);
        });
      }
      return filteredResources;
    }
    function parseUrl(url) {
      if (typeof URL === "function") {
        return new URL(url, typeof document !== "undefined" ? document.baseURI : typeof location !== "undefined" ? location.href : undefined);
      }
      var element = getUrlNormalizingAnchor();
      element.href = url;
      return element;
    }
    function normalizeUrl(url) {
      var urlLike = parseUrl(url);
      return urlLike.href;
    }
    function getElementXPath(target, optimised) {
      if (target.nodeType === Node.DOCUMENT_NODE) {
        return "/";
      }
      var targetValue = getNodeValue(target, optimised);
      if (optimised && targetValue.indexOf("@id") > 0) {
        return targetValue;
      }
      var xpath = "";
      if (target.parentNode) {
        xpath += getElementXPath(target.parentNode, false);
      }
      xpath += targetValue;
      return xpath;
    }
    function getNodeIndex(target) {
      if (!target.parentNode) {
        return 0;
      }
      var allowedTypes = [target.nodeType];
      if (target.nodeType === Node.CDATA_SECTION_NODE) {
        allowedTypes.push(Node.TEXT_NODE);
      }
      var elements = Array.from(target.parentNode.childNodes);
      elements = elements.filter(function (element) {
        var localName = element.localName;
        return allowedTypes.indexOf(element.nodeType) >= 0 && localName === target.localName;
      });
      if (elements.length >= 1) {
        return elements.indexOf(target) + 1;
      }
      return 0;
    }
    function getNodeValue(target, optimised) {
      var nodeType = target.nodeType;
      var index = getNodeIndex(target);
      var nodeValue = "";
      if (nodeType === Node.ELEMENT_NODE) {
        var id = target.getAttribute("id");
        if (optimised && id) {
          return "//*[@id=\"" + id + "\"]";
        }
        nodeValue = target.localName;
      } else if (nodeType === Node.TEXT_NODE || nodeType === Node.CDATA_SECTION_NODE) {
        nodeValue = "text()";
      } else if (nodeType === Node.COMMENT_NODE) {
        nodeValue = "comment()";
      } else {
        return "";
      }
      if (nodeValue && index > 1) {
        return "/" + nodeValue + "[" + index + "]";
      }
      return "/" + nodeValue;
    }
    function shouldPropagateTraceHeaders(spanUrl, propagateTraceHeaderCorsUrls) {
      var propagateTraceHeaderUrls = propagateTraceHeaderCorsUrls || [];
      if (typeof propagateTraceHeaderUrls === "string" || propagateTraceHeaderUrls instanceof RegExp) {
        propagateTraceHeaderUrls = [propagateTraceHeaderUrls];
      }
      var parsedSpanUrl = parseUrl(spanUrl);
      if (parsedSpanUrl.origin === getOrigin()) {
        return true;
      } else {
        return propagateTraceHeaderUrls.some(function (propagateTraceHeaderUrl) {
          return urlMatches(spanUrl, propagateTraceHeaderUrl);
        });
      }
    }

    const __esModule = true;

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
