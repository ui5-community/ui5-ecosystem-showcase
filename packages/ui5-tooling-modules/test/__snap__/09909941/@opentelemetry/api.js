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
    // Default export.
    var defExp = {
        context: traceApi.context,
        diag: traceApi.diag,
        metrics: traceApi.metrics,
        propagation: traceApi.propagation,
        trace: traceApi.trace,
    };

    const defaultExports = Object.isFrozen(defExp) ? Object.assign({}, defExp?.default || defExp || { __emptyModule: true }) : defExp;
    defaultExports.default = Object.assign({}, defExp);
    Object.defineProperty(defaultExports, "__" + "esModule", { value: true });
    var index = Object.isFrozen(defExp) ? Object.freeze(defaultExports) : defaultExports;

    return index;

}));
