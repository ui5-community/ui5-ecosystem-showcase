sap.ui.define(['exports'], (function (exports) { 'use strict';

    const resolveFetch$3 = (customFetch) => {
        let _fetch;
        if (customFetch) {
            _fetch = customFetch;
        }
        else if (typeof fetch === 'undefined') {
            _fetch = (...args) => Promise.resolve().then(function () { return browser; }).then(({ default: fetch }) => fetch(...args));
        }
        else {
            _fetch = fetch;
        }
        return (...args) => _fetch(...args);
    };

    class FunctionsError extends Error {
        constructor(message, name = 'FunctionsError', context) {
            super(message);
            this.name = name;
            this.context = context;
        }
    }
    class FunctionsFetchError extends FunctionsError {
        constructor(context) {
            super('Failed to send a request to the Edge Function', 'FunctionsFetchError', context);
        }
    }
    class FunctionsRelayError extends FunctionsError {
        constructor(context) {
            super('Relay Error invoking the Edge Function', 'FunctionsRelayError', context);
        }
    }
    class FunctionsHttpError extends FunctionsError {
        constructor(context) {
            super('Edge Function returned a non-2xx status code', 'FunctionsHttpError', context);
        }
    }
    // Define the enum for the 'region' property
    exports.FunctionRegion = void 0;
    (function (FunctionRegion) {
        FunctionRegion["Any"] = "any";
        FunctionRegion["ApNortheast1"] = "ap-northeast-1";
        FunctionRegion["ApNortheast2"] = "ap-northeast-2";
        FunctionRegion["ApSouth1"] = "ap-south-1";
        FunctionRegion["ApSoutheast1"] = "ap-southeast-1";
        FunctionRegion["ApSoutheast2"] = "ap-southeast-2";
        FunctionRegion["CaCentral1"] = "ca-central-1";
        FunctionRegion["EuCentral1"] = "eu-central-1";
        FunctionRegion["EuWest1"] = "eu-west-1";
        FunctionRegion["EuWest2"] = "eu-west-2";
        FunctionRegion["EuWest3"] = "eu-west-3";
        FunctionRegion["SaEast1"] = "sa-east-1";
        FunctionRegion["UsEast1"] = "us-east-1";
        FunctionRegion["UsWest1"] = "us-west-1";
        FunctionRegion["UsWest2"] = "us-west-2";
    })(exports.FunctionRegion || (exports.FunctionRegion = {}));

    var __awaiter$7 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class FunctionsClient {
        constructor(url, { headers = {}, customFetch, region = exports.FunctionRegion.Any, } = {}) {
            this.url = url;
            this.headers = headers;
            this.region = region;
            this.fetch = resolveFetch$3(customFetch);
        }
        /**
         * Updates the authorization header
         * @param token - the new jwt token sent in the authorisation header
         */
        setAuth(token) {
            this.headers.Authorization = `Bearer ${token}`;
        }
        /**
         * Invokes a function
         * @param functionName - The name of the Function to invoke.
         * @param options - Options for invoking the Function.
         */
        invoke(functionName, options = {}) {
            var _a;
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const { headers, method, body: functionArgs } = options;
                    let _headers = {};
                    let { region } = options;
                    if (!region) {
                        region = this.region;
                    }
                    // Add region as query parameter using URL API
                    const url = new URL(`${this.url}/${functionName}`);
                    if (region && region !== 'any') {
                        _headers['x-region'] = region;
                        url.searchParams.set('forceFunctionRegion', region);
                    }
                    let body;
                    if (functionArgs &&
                        ((headers && !Object.prototype.hasOwnProperty.call(headers, 'Content-Type')) || !headers)) {
                        if ((typeof Blob !== 'undefined' && functionArgs instanceof Blob) ||
                            functionArgs instanceof ArrayBuffer) {
                            // will work for File as File inherits Blob
                            // also works for ArrayBuffer as it is the same underlying structure as a Blob
                            _headers['Content-Type'] = 'application/octet-stream';
                            body = functionArgs;
                        }
                        else if (typeof functionArgs === 'string') {
                            // plain string
                            _headers['Content-Type'] = 'text/plain';
                            body = functionArgs;
                        }
                        else if (typeof FormData !== 'undefined' && functionArgs instanceof FormData) {
                            // don't set content-type headers
                            // Request will automatically add the right boundary value
                            body = functionArgs;
                        }
                        else {
                            // default, assume this is JSON
                            _headers['Content-Type'] = 'application/json';
                            body = JSON.stringify(functionArgs);
                        }
                    }
                    const response = yield this.fetch(url.toString(), {
                        method: method || 'POST',
                        // headers priority is (high to low):
                        // 1. invoke-level headers
                        // 2. client-level headers
                        // 3. default Content-Type header
                        headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
                        body,
                    }).catch((fetchError) => {
                        throw new FunctionsFetchError(fetchError);
                    });
                    const isRelayError = response.headers.get('x-relay-error');
                    if (isRelayError && isRelayError === 'true') {
                        throw new FunctionsRelayError(response);
                    }
                    if (!response.ok) {
                        throw new FunctionsHttpError(response);
                    }
                    let responseType = ((_a = response.headers.get('Content-Type')) !== null && _a !== void 0 ? _a : 'text/plain').split(';')[0].trim();
                    let data;
                    if (responseType === 'application/json') {
                        data = yield response.json();
                    }
                    else if (responseType === 'application/octet-stream') {
                        data = yield response.blob();
                    }
                    else if (responseType === 'text/event-stream') {
                        data = response;
                    }
                    else if (responseType === 'multipart/form-data') {
                        data = yield response.formData();
                    }
                    else {
                        // default to text
                        data = yield response.text();
                    }
                    return { data, error: null, response };
                }
                catch (error) {
                    return {
                        data: null,
                        error,
                        response: error instanceof FunctionsHttpError || error instanceof FunctionsRelayError
                            ? error.context
                            : undefined,
                    };
                }
            });
        }
    }

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function getAugmentedNamespace(n) {
      if (Object.prototype.hasOwnProperty.call(n, '__esModule')) return n;
      var f = n.default;
    	if (typeof f == "function") {
    		var a = function a () {
    			var isInstance = false;
          try {
            isInstance = this instanceof a;
          } catch {}
    			if (isInstance) {
            return Reflect.construct(f, arguments, this.constructor);
    			}
    			return f.apply(this, arguments);
    		};
    		a.prototype = f.prototype;
      } else a = {};
      Object.defineProperty(a, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

    var cjs = {};

    var PostgrestClient$1 = {};

    var PostgrestQueryBuilder$1 = {};

    var PostgrestFilterBuilder$1 = {};

    var PostgrestTransformBuilder$1 = {};

    var PostgrestBuilder$1 = {};

    var global$1 = (typeof global !== "undefined" ? global :
      typeof self !== "undefined" ? self :
      typeof window !== "undefined" ? window : {});

    // ref: https://github.com/tc39/proposal-global
    var getGlobal = function() {
        // the only reliable means to get the global object is
        // `Function('return this')()`
        // However, this causes CSP violations in Chrome apps.
        if (typeof self !== 'undefined') { return self; }
        if (typeof window !== 'undefined') { return window; }
        if (typeof global$1 !== 'undefined') { return global$1; }
        throw new Error('unable to locate global object');
    };

    var globalObject = getGlobal();

    const fetch$1 = globalObject.fetch;

    var nodeFetch = globalObject.fetch.bind(globalObject);

    const Headers$1 = globalObject.Headers;
    const Request = globalObject.Request;
    const Response$1 = globalObject.Response;

    var browser = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Headers: Headers$1,
        Request: Request,
        Response: Response$1,
        default: nodeFetch,
        fetch: fetch$1
    });

    var require$$0 = /*@__PURE__*/getAugmentedNamespace(browser);

    var PostgrestError$1 = {};

    var hasRequiredPostgrestError;

    function requirePostgrestError () {
    	if (hasRequiredPostgrestError) return PostgrestError$1;
    	hasRequiredPostgrestError = 1;
    	Object.defineProperty(PostgrestError$1, "__esModule", { value: true });
    	/**
    	 * Error format
    	 *
    	 * {@link https://postgrest.org/en/stable/api.html?highlight=options#errors-and-http-status-codes}
    	 */
    	class PostgrestError extends Error {
    	    constructor(context) {
    	        super(context.message);
    	        this.name = 'PostgrestError';
    	        this.details = context.details;
    	        this.hint = context.hint;
    	        this.code = context.code;
    	    }
    	}
    	PostgrestError$1.default = PostgrestError;
    	
    	return PostgrestError$1;
    }

    var hasRequiredPostgrestBuilder;

    function requirePostgrestBuilder () {
    	if (hasRequiredPostgrestBuilder) return PostgrestBuilder$1;
    	hasRequiredPostgrestBuilder = 1;
    	var __importDefault = (PostgrestBuilder$1 && PostgrestBuilder$1.__importDefault) || function (mod) {
    	    return (mod && mod.__esModule) ? mod : { "default": mod };
    	};
    	Object.defineProperty(PostgrestBuilder$1, "__esModule", { value: true });
    	// @ts-ignore
    	const node_fetch_1 = __importDefault(require$$0);
    	const PostgrestError_1 = __importDefault(requirePostgrestError());
    	class PostgrestBuilder {
    	    constructor(builder) {
    	        this.shouldThrowOnError = false;
    	        this.method = builder.method;
    	        this.url = builder.url;
    	        this.headers = builder.headers;
    	        this.schema = builder.schema;
    	        this.body = builder.body;
    	        this.shouldThrowOnError = builder.shouldThrowOnError;
    	        this.signal = builder.signal;
    	        this.isMaybeSingle = builder.isMaybeSingle;
    	        if (builder.fetch) {
    	            this.fetch = builder.fetch;
    	        }
    	        else if (typeof fetch === 'undefined') {
    	            this.fetch = node_fetch_1.default;
    	        }
    	        else {
    	            this.fetch = fetch;
    	        }
    	    }
    	    /**
    	     * If there's an error with the query, throwOnError will reject the promise by
    	     * throwing the error instead of returning it as part of a successful response.
    	     *
    	     * {@link https://github.com/supabase/supabase-js/issues/92}
    	     */
    	    throwOnError() {
    	        this.shouldThrowOnError = true;
    	        return this;
    	    }
    	    /**
    	     * Set an HTTP header for the request.
    	     */
    	    setHeader(name, value) {
    	        this.headers = Object.assign({}, this.headers);
    	        this.headers[name] = value;
    	        return this;
    	    }
    	    then(onfulfilled, onrejected) {
    	        // https://postgrest.org/en/stable/api.html#switching-schemas
    	        if (this.schema === undefined) ;
    	        else if (['GET', 'HEAD'].includes(this.method)) {
    	            this.headers['Accept-Profile'] = this.schema;
    	        }
    	        else {
    	            this.headers['Content-Profile'] = this.schema;
    	        }
    	        if (this.method !== 'GET' && this.method !== 'HEAD') {
    	            this.headers['Content-Type'] = 'application/json';
    	        }
    	        // NOTE: Invoke w/o `this` to avoid illegal invocation error.
    	        // https://github.com/supabase/postgrest-js/pull/247
    	        const _fetch = this.fetch;
    	        let res = _fetch(this.url.toString(), {
    	            method: this.method,
    	            headers: this.headers,
    	            body: JSON.stringify(this.body),
    	            signal: this.signal,
    	        }).then(async (res) => {
    	            var _a, _b, _c;
    	            let error = null;
    	            let data = null;
    	            let count = null;
    	            let status = res.status;
    	            let statusText = res.statusText;
    	            if (res.ok) {
    	                if (this.method !== 'HEAD') {
    	                    const body = await res.text();
    	                    if (body === '') ;
    	                    else if (this.headers['Accept'] === 'text/csv') {
    	                        data = body;
    	                    }
    	                    else if (this.headers['Accept'] &&
    	                        this.headers['Accept'].includes('application/vnd.pgrst.plan+text')) {
    	                        data = body;
    	                    }
    	                    else {
    	                        data = JSON.parse(body);
    	                    }
    	                }
    	                const countHeader = (_a = this.headers['Prefer']) === null || _a === void 0 ? void 0 : _a.match(/count=(exact|planned|estimated)/);
    	                const contentRange = (_b = res.headers.get('content-range')) === null || _b === void 0 ? void 0 : _b.split('/');
    	                if (countHeader && contentRange && contentRange.length > 1) {
    	                    count = parseInt(contentRange[1]);
    	                }
    	                // Temporary partial fix for https://github.com/supabase/postgrest-js/issues/361
    	                // Issue persists e.g. for `.insert([...]).select().maybeSingle()`
    	                if (this.isMaybeSingle && this.method === 'GET' && Array.isArray(data)) {
    	                    if (data.length > 1) {
    	                        error = {
    	                            // https://github.com/PostgREST/postgrest/blob/a867d79c42419af16c18c3fb019eba8df992626f/src/PostgREST/Error.hs#L553
    	                            code: 'PGRST116',
    	                            details: `Results contain ${data.length} rows, application/vnd.pgrst.object+json requires 1 row`,
    	                            hint: null,
    	                            message: 'JSON object requested, multiple (or no) rows returned',
    	                        };
    	                        data = null;
    	                        count = null;
    	                        status = 406;
    	                        statusText = 'Not Acceptable';
    	                    }
    	                    else if (data.length === 1) {
    	                        data = data[0];
    	                    }
    	                    else {
    	                        data = null;
    	                    }
    	                }
    	            }
    	            else {
    	                const body = await res.text();
    	                try {
    	                    error = JSON.parse(body);
    	                    // Workaround for https://github.com/supabase/postgrest-js/issues/295
    	                    if (Array.isArray(error) && res.status === 404) {
    	                        data = [];
    	                        error = null;
    	                        status = 200;
    	                        statusText = 'OK';
    	                    }
    	                }
    	                catch (_d) {
    	                    // Workaround for https://github.com/supabase/postgrest-js/issues/295
    	                    if (res.status === 404 && body === '') {
    	                        status = 204;
    	                        statusText = 'No Content';
    	                    }
    	                    else {
    	                        error = {
    	                            message: body,
    	                        };
    	                    }
    	                }
    	                if (error && this.isMaybeSingle && ((_c = error === null || error === void 0 ? void 0 : error.details) === null || _c === void 0 ? void 0 : _c.includes('0 rows'))) {
    	                    error = null;
    	                    status = 200;
    	                    statusText = 'OK';
    	                }
    	                if (error && this.shouldThrowOnError) {
    	                    throw new PostgrestError_1.default(error);
    	                }
    	            }
    	            const postgrestResponse = {
    	                error,
    	                data,
    	                count,
    	                status,
    	                statusText,
    	            };
    	            return postgrestResponse;
    	        });
    	        if (!this.shouldThrowOnError) {
    	            res = res.catch((fetchError) => {
    	                var _a, _b, _c;
    	                return ({
    	                    error: {
    	                        message: `${(_a = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _a !== void 0 ? _a : 'FetchError'}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`,
    	                        details: `${(_b = fetchError === null || fetchError === void 0 ? void 0 : fetchError.stack) !== null && _b !== void 0 ? _b : ''}`,
    	                        hint: '',
    	                        code: `${(_c = fetchError === null || fetchError === void 0 ? void 0 : fetchError.code) !== null && _c !== void 0 ? _c : ''}`,
    	                    },
    	                    data: null,
    	                    count: null,
    	                    status: 0,
    	                    statusText: '',
    	                });
    	            });
    	        }
    	        return res.then(onfulfilled, onrejected);
    	    }
    	    /**
    	     * Override the type of the returned `data`.
    	     *
    	     * @typeParam NewResult - The new result type to override with
    	     * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
    	     */
    	    returns() {
    	        /* istanbul ignore next */
    	        return this;
    	    }
    	    /**
    	     * Override the type of the returned `data` field in the response.
    	     *
    	     * @typeParam NewResult - The new type to cast the response data to
    	     * @typeParam Options - Optional type configuration (defaults to { merge: true })
    	     * @typeParam Options.merge - When true, merges the new type with existing return type. When false, replaces the existing types entirely (defaults to true)
    	     * @example
    	     * ```typescript
    	     * // Merge with existing types (default behavior)
    	     * const query = supabase
    	     *   .from('users')
    	     *   .select()
    	     *   .overrideTypes<{ custom_field: string }>()
    	     *
    	     * // Replace existing types completely
    	     * const replaceQuery = supabase
    	     *   .from('users')
    	     *   .select()
    	     *   .overrideTypes<{ id: number; name: string }, { merge: false }>()
    	     * ```
    	     * @returns A PostgrestBuilder instance with the new type
    	     */
    	    overrideTypes() {
    	        return this;
    	    }
    	}
    	PostgrestBuilder$1.default = PostgrestBuilder;
    	
    	return PostgrestBuilder$1;
    }

    var hasRequiredPostgrestTransformBuilder;

    function requirePostgrestTransformBuilder () {
    	if (hasRequiredPostgrestTransformBuilder) return PostgrestTransformBuilder$1;
    	hasRequiredPostgrestTransformBuilder = 1;
    	var __importDefault = (PostgrestTransformBuilder$1 && PostgrestTransformBuilder$1.__importDefault) || function (mod) {
    	    return (mod && mod.__esModule) ? mod : { "default": mod };
    	};
    	Object.defineProperty(PostgrestTransformBuilder$1, "__esModule", { value: true });
    	const PostgrestBuilder_1 = __importDefault(requirePostgrestBuilder());
    	class PostgrestTransformBuilder extends PostgrestBuilder_1.default {
    	    /**
    	     * Perform a SELECT on the query result.
    	     *
    	     * By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
    	     * return modified rows. By calling this method, modified rows are returned in
    	     * `data`.
    	     *
    	     * @param columns - The columns to retrieve, separated by commas
    	     */
    	    select(columns) {
    	        // Remove whitespaces except when quoted
    	        let quoted = false;
    	        const cleanedColumns = (columns !== null && columns !== void 0 ? columns : '*')
    	            .split('')
    	            .map((c) => {
    	            if (/\s/.test(c) && !quoted) {
    	                return '';
    	            }
    	            if (c === '"') {
    	                quoted = !quoted;
    	            }
    	            return c;
    	        })
    	            .join('');
    	        this.url.searchParams.set('select', cleanedColumns);
    	        if (this.headers['Prefer']) {
    	            this.headers['Prefer'] += ',';
    	        }
    	        this.headers['Prefer'] += 'return=representation';
    	        return this;
    	    }
    	    /**
    	     * Order the query result by `column`.
    	     *
    	     * You can call this method multiple times to order by multiple columns.
    	     *
    	     * You can order referenced tables, but it only affects the ordering of the
    	     * parent table if you use `!inner` in the query.
    	     *
    	     * @param column - The column to order by
    	     * @param options - Named parameters
    	     * @param options.ascending - If `true`, the result will be in ascending order
    	     * @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
    	     * `null`s appear last.
    	     * @param options.referencedTable - Set this to order a referenced table by
    	     * its columns
    	     * @param options.foreignTable - Deprecated, use `options.referencedTable`
    	     * instead
    	     */
    	    order(column, { ascending = true, nullsFirst, foreignTable, referencedTable = foreignTable, } = {}) {
    	        const key = referencedTable ? `${referencedTable}.order` : 'order';
    	        const existingOrder = this.url.searchParams.get(key);
    	        this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ''}${column}.${ascending ? 'asc' : 'desc'}${nullsFirst === undefined ? '' : nullsFirst ? '.nullsfirst' : '.nullslast'}`);
    	        return this;
    	    }
    	    /**
    	     * Limit the query result by `count`.
    	     *
    	     * @param count - The maximum number of rows to return
    	     * @param options - Named parameters
    	     * @param options.referencedTable - Set this to limit rows of referenced
    	     * tables instead of the parent table
    	     * @param options.foreignTable - Deprecated, use `options.referencedTable`
    	     * instead
    	     */
    	    limit(count, { foreignTable, referencedTable = foreignTable, } = {}) {
    	        const key = typeof referencedTable === 'undefined' ? 'limit' : `${referencedTable}.limit`;
    	        this.url.searchParams.set(key, `${count}`);
    	        return this;
    	    }
    	    /**
    	     * Limit the query result by starting at an offset `from` and ending at the offset `to`.
    	     * Only records within this range are returned.
    	     * This respects the query order and if there is no order clause the range could behave unexpectedly.
    	     * The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
    	     * and fourth rows of the query.
    	     *
    	     * @param from - The starting index from which to limit the result
    	     * @param to - The last index to which to limit the result
    	     * @param options - Named parameters
    	     * @param options.referencedTable - Set this to limit rows of referenced
    	     * tables instead of the parent table
    	     * @param options.foreignTable - Deprecated, use `options.referencedTable`
    	     * instead
    	     */
    	    range(from, to, { foreignTable, referencedTable = foreignTable, } = {}) {
    	        const keyOffset = typeof referencedTable === 'undefined' ? 'offset' : `${referencedTable}.offset`;
    	        const keyLimit = typeof referencedTable === 'undefined' ? 'limit' : `${referencedTable}.limit`;
    	        this.url.searchParams.set(keyOffset, `${from}`);
    	        // Range is inclusive, so add 1
    	        this.url.searchParams.set(keyLimit, `${to - from + 1}`);
    	        return this;
    	    }
    	    /**
    	     * Set the AbortSignal for the fetch request.
    	     *
    	     * @param signal - The AbortSignal to use for the fetch request
    	     */
    	    abortSignal(signal) {
    	        this.signal = signal;
    	        return this;
    	    }
    	    /**
    	     * Return `data` as a single object instead of an array of objects.
    	     *
    	     * Query result must be one row (e.g. using `.limit(1)`), otherwise this
    	     * returns an error.
    	     */
    	    single() {
    	        this.headers['Accept'] = 'application/vnd.pgrst.object+json';
    	        return this;
    	    }
    	    /**
    	     * Return `data` as a single object instead of an array of objects.
    	     *
    	     * Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
    	     * this returns an error.
    	     */
    	    maybeSingle() {
    	        // Temporary partial fix for https://github.com/supabase/postgrest-js/issues/361
    	        // Issue persists e.g. for `.insert([...]).select().maybeSingle()`
    	        if (this.method === 'GET') {
    	            this.headers['Accept'] = 'application/json';
    	        }
    	        else {
    	            this.headers['Accept'] = 'application/vnd.pgrst.object+json';
    	        }
    	        this.isMaybeSingle = true;
    	        return this;
    	    }
    	    /**
    	     * Return `data` as a string in CSV format.
    	     */
    	    csv() {
    	        this.headers['Accept'] = 'text/csv';
    	        return this;
    	    }
    	    /**
    	     * Return `data` as an object in [GeoJSON](https://geojson.org) format.
    	     */
    	    geojson() {
    	        this.headers['Accept'] = 'application/geo+json';
    	        return this;
    	    }
    	    /**
    	     * Return `data` as the EXPLAIN plan for the query.
    	     *
    	     * You need to enable the
    	     * [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
    	     * setting before using this method.
    	     *
    	     * @param options - Named parameters
    	     *
    	     * @param options.analyze - If `true`, the query will be executed and the
    	     * actual run time will be returned
    	     *
    	     * @param options.verbose - If `true`, the query identifier will be returned
    	     * and `data` will include the output columns of the query
    	     *
    	     * @param options.settings - If `true`, include information on configuration
    	     * parameters that affect query planning
    	     *
    	     * @param options.buffers - If `true`, include information on buffer usage
    	     *
    	     * @param options.wal - If `true`, include information on WAL record generation
    	     *
    	     * @param options.format - The format of the output, can be `"text"` (default)
    	     * or `"json"`
    	     */
    	    explain({ analyze = false, verbose = false, settings = false, buffers = false, wal = false, format = 'text', } = {}) {
    	        var _a;
    	        const options = [
    	            analyze ? 'analyze' : null,
    	            verbose ? 'verbose' : null,
    	            settings ? 'settings' : null,
    	            buffers ? 'buffers' : null,
    	            wal ? 'wal' : null,
    	        ]
    	            .filter(Boolean)
    	            .join('|');
    	        // An Accept header can carry multiple media types but postgrest-js always sends one
    	        const forMediatype = (_a = this.headers['Accept']) !== null && _a !== void 0 ? _a : 'application/json';
    	        this.headers['Accept'] = `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`;
    	        if (format === 'json')
    	            return this;
    	        else
    	            return this;
    	    }
    	    /**
    	     * Rollback the query.
    	     *
    	     * `data` will still be returned, but the query is not committed.
    	     */
    	    rollback() {
    	        var _a;
    	        if (((_a = this.headers['Prefer']) !== null && _a !== void 0 ? _a : '').trim().length > 0) {
    	            this.headers['Prefer'] += ',tx=rollback';
    	        }
    	        else {
    	            this.headers['Prefer'] = 'tx=rollback';
    	        }
    	        return this;
    	    }
    	    /**
    	     * Override the type of the returned `data`.
    	     *
    	     * @typeParam NewResult - The new result type to override with
    	     * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
    	     */
    	    returns() {
    	        return this;
    	    }
    	}
    	PostgrestTransformBuilder$1.default = PostgrestTransformBuilder;
    	
    	return PostgrestTransformBuilder$1;
    }

    var hasRequiredPostgrestFilterBuilder;

    function requirePostgrestFilterBuilder () {
    	if (hasRequiredPostgrestFilterBuilder) return PostgrestFilterBuilder$1;
    	hasRequiredPostgrestFilterBuilder = 1;
    	var __importDefault = (PostgrestFilterBuilder$1 && PostgrestFilterBuilder$1.__importDefault) || function (mod) {
    	    return (mod && mod.__esModule) ? mod : { "default": mod };
    	};
    	Object.defineProperty(PostgrestFilterBuilder$1, "__esModule", { value: true });
    	const PostgrestTransformBuilder_1 = __importDefault(requirePostgrestTransformBuilder());
    	class PostgrestFilterBuilder extends PostgrestTransformBuilder_1.default {
    	    /**
    	     * Match only rows where `column` is equal to `value`.
    	     *
    	     * To check if the value of `column` is NULL, you should use `.is()` instead.
    	     *
    	     * @param column - The column to filter on
    	     * @param value - The value to filter with
    	     */
    	    eq(column, value) {
    	        this.url.searchParams.append(column, `eq.${value}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows where `column` is not equal to `value`.
    	     *
    	     * @param column - The column to filter on
    	     * @param value - The value to filter with
    	     */
    	    neq(column, value) {
    	        this.url.searchParams.append(column, `neq.${value}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows where `column` is greater than `value`.
    	     *
    	     * @param column - The column to filter on
    	     * @param value - The value to filter with
    	     */
    	    gt(column, value) {
    	        this.url.searchParams.append(column, `gt.${value}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows where `column` is greater than or equal to `value`.
    	     *
    	     * @param column - The column to filter on
    	     * @param value - The value to filter with
    	     */
    	    gte(column, value) {
    	        this.url.searchParams.append(column, `gte.${value}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows where `column` is less than `value`.
    	     *
    	     * @param column - The column to filter on
    	     * @param value - The value to filter with
    	     */
    	    lt(column, value) {
    	        this.url.searchParams.append(column, `lt.${value}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows where `column` is less than or equal to `value`.
    	     *
    	     * @param column - The column to filter on
    	     * @param value - The value to filter with
    	     */
    	    lte(column, value) {
    	        this.url.searchParams.append(column, `lte.${value}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows where `column` matches `pattern` case-sensitively.
    	     *
    	     * @param column - The column to filter on
    	     * @param pattern - The pattern to match with
    	     */
    	    like(column, pattern) {
    	        this.url.searchParams.append(column, `like.${pattern}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows where `column` matches all of `patterns` case-sensitively.
    	     *
    	     * @param column - The column to filter on
    	     * @param patterns - The patterns to match with
    	     */
    	    likeAllOf(column, patterns) {
    	        this.url.searchParams.append(column, `like(all).{${patterns.join(',')}}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows where `column` matches any of `patterns` case-sensitively.
    	     *
    	     * @param column - The column to filter on
    	     * @param patterns - The patterns to match with
    	     */
    	    likeAnyOf(column, patterns) {
    	        this.url.searchParams.append(column, `like(any).{${patterns.join(',')}}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows where `column` matches `pattern` case-insensitively.
    	     *
    	     * @param column - The column to filter on
    	     * @param pattern - The pattern to match with
    	     */
    	    ilike(column, pattern) {
    	        this.url.searchParams.append(column, `ilike.${pattern}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows where `column` matches all of `patterns` case-insensitively.
    	     *
    	     * @param column - The column to filter on
    	     * @param patterns - The patterns to match with
    	     */
    	    ilikeAllOf(column, patterns) {
    	        this.url.searchParams.append(column, `ilike(all).{${patterns.join(',')}}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows where `column` matches any of `patterns` case-insensitively.
    	     *
    	     * @param column - The column to filter on
    	     * @param patterns - The patterns to match with
    	     */
    	    ilikeAnyOf(column, patterns) {
    	        this.url.searchParams.append(column, `ilike(any).{${patterns.join(',')}}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows where `column` IS `value`.
    	     *
    	     * For non-boolean columns, this is only relevant for checking if the value of
    	     * `column` is NULL by setting `value` to `null`.
    	     *
    	     * For boolean columns, you can also set `value` to `true` or `false` and it
    	     * will behave the same way as `.eq()`.
    	     *
    	     * @param column - The column to filter on
    	     * @param value - The value to filter with
    	     */
    	    is(column, value) {
    	        this.url.searchParams.append(column, `is.${value}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows where `column` is included in the `values` array.
    	     *
    	     * @param column - The column to filter on
    	     * @param values - The values array to filter with
    	     */
    	    in(column, values) {
    	        const cleanedValues = Array.from(new Set(values))
    	            .map((s) => {
    	            // handle postgrest reserved characters
    	            // https://postgrest.org/en/v7.0.0/api.html#reserved-characters
    	            if (typeof s === 'string' && new RegExp('[,()]').test(s))
    	                return `"${s}"`;
    	            else
    	                return `${s}`;
    	        })
    	            .join(',');
    	        this.url.searchParams.append(column, `in.(${cleanedValues})`);
    	        return this;
    	    }
    	    /**
    	     * Only relevant for jsonb, array, and range columns. Match only rows where
    	     * `column` contains every element appearing in `value`.
    	     *
    	     * @param column - The jsonb, array, or range column to filter on
    	     * @param value - The jsonb, array, or range value to filter with
    	     */
    	    contains(column, value) {
    	        if (typeof value === 'string') {
    	            // range types can be inclusive '[', ']' or exclusive '(', ')' so just
    	            // keep it simple and accept a string
    	            this.url.searchParams.append(column, `cs.${value}`);
    	        }
    	        else if (Array.isArray(value)) {
    	            // array
    	            this.url.searchParams.append(column, `cs.{${value.join(',')}}`);
    	        }
    	        else {
    	            // json
    	            this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`);
    	        }
    	        return this;
    	    }
    	    /**
    	     * Only relevant for jsonb, array, and range columns. Match only rows where
    	     * every element appearing in `column` is contained by `value`.
    	     *
    	     * @param column - The jsonb, array, or range column to filter on
    	     * @param value - The jsonb, array, or range value to filter with
    	     */
    	    containedBy(column, value) {
    	        if (typeof value === 'string') {
    	            // range
    	            this.url.searchParams.append(column, `cd.${value}`);
    	        }
    	        else if (Array.isArray(value)) {
    	            // array
    	            this.url.searchParams.append(column, `cd.{${value.join(',')}}`);
    	        }
    	        else {
    	            // json
    	            this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`);
    	        }
    	        return this;
    	    }
    	    /**
    	     * Only relevant for range columns. Match only rows where every element in
    	     * `column` is greater than any element in `range`.
    	     *
    	     * @param column - The range column to filter on
    	     * @param range - The range to filter with
    	     */
    	    rangeGt(column, range) {
    	        this.url.searchParams.append(column, `sr.${range}`);
    	        return this;
    	    }
    	    /**
    	     * Only relevant for range columns. Match only rows where every element in
    	     * `column` is either contained in `range` or greater than any element in
    	     * `range`.
    	     *
    	     * @param column - The range column to filter on
    	     * @param range - The range to filter with
    	     */
    	    rangeGte(column, range) {
    	        this.url.searchParams.append(column, `nxl.${range}`);
    	        return this;
    	    }
    	    /**
    	     * Only relevant for range columns. Match only rows where every element in
    	     * `column` is less than any element in `range`.
    	     *
    	     * @param column - The range column to filter on
    	     * @param range - The range to filter with
    	     */
    	    rangeLt(column, range) {
    	        this.url.searchParams.append(column, `sl.${range}`);
    	        return this;
    	    }
    	    /**
    	     * Only relevant for range columns. Match only rows where every element in
    	     * `column` is either contained in `range` or less than any element in
    	     * `range`.
    	     *
    	     * @param column - The range column to filter on
    	     * @param range - The range to filter with
    	     */
    	    rangeLte(column, range) {
    	        this.url.searchParams.append(column, `nxr.${range}`);
    	        return this;
    	    }
    	    /**
    	     * Only relevant for range columns. Match only rows where `column` is
    	     * mutually exclusive to `range` and there can be no element between the two
    	     * ranges.
    	     *
    	     * @param column - The range column to filter on
    	     * @param range - The range to filter with
    	     */
    	    rangeAdjacent(column, range) {
    	        this.url.searchParams.append(column, `adj.${range}`);
    	        return this;
    	    }
    	    /**
    	     * Only relevant for array and range columns. Match only rows where
    	     * `column` and `value` have an element in common.
    	     *
    	     * @param column - The array or range column to filter on
    	     * @param value - The array or range value to filter with
    	     */
    	    overlaps(column, value) {
    	        if (typeof value === 'string') {
    	            // range
    	            this.url.searchParams.append(column, `ov.${value}`);
    	        }
    	        else {
    	            // array
    	            this.url.searchParams.append(column, `ov.{${value.join(',')}}`);
    	        }
    	        return this;
    	    }
    	    /**
    	     * Only relevant for text and tsvector columns. Match only rows where
    	     * `column` matches the query string in `query`.
    	     *
    	     * @param column - The text or tsvector column to filter on
    	     * @param query - The query text to match with
    	     * @param options - Named parameters
    	     * @param options.config - The text search configuration to use
    	     * @param options.type - Change how the `query` text is interpreted
    	     */
    	    textSearch(column, query, { config, type } = {}) {
    	        let typePart = '';
    	        if (type === 'plain') {
    	            typePart = 'pl';
    	        }
    	        else if (type === 'phrase') {
    	            typePart = 'ph';
    	        }
    	        else if (type === 'websearch') {
    	            typePart = 'w';
    	        }
    	        const configPart = config === undefined ? '' : `(${config})`;
    	        this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows where each column in `query` keys is equal to its
    	     * associated value. Shorthand for multiple `.eq()`s.
    	     *
    	     * @param query - The object to filter with, with column names as keys mapped
    	     * to their filter values
    	     */
    	    match(query) {
    	        Object.entries(query).forEach(([column, value]) => {
    	            this.url.searchParams.append(column, `eq.${value}`);
    	        });
    	        return this;
    	    }
    	    /**
    	     * Match only rows which doesn't satisfy the filter.
    	     *
    	     * Unlike most filters, `opearator` and `value` are used as-is and need to
    	     * follow [PostgREST
    	     * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
    	     * to make sure they are properly sanitized.
    	     *
    	     * @param column - The column to filter on
    	     * @param operator - The operator to be negated to filter with, following
    	     * PostgREST syntax
    	     * @param value - The value to filter with, following PostgREST syntax
    	     */
    	    not(column, operator, value) {
    	        this.url.searchParams.append(column, `not.${operator}.${value}`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows which satisfy at least one of the filters.
    	     *
    	     * Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
    	     * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
    	     * to make sure it's properly sanitized.
    	     *
    	     * It's currently not possible to do an `.or()` filter across multiple tables.
    	     *
    	     * @param filters - The filters to use, following PostgREST syntax
    	     * @param options - Named parameters
    	     * @param options.referencedTable - Set this to filter on referenced tables
    	     * instead of the parent table
    	     * @param options.foreignTable - Deprecated, use `referencedTable` instead
    	     */
    	    or(filters, { foreignTable, referencedTable = foreignTable, } = {}) {
    	        const key = referencedTable ? `${referencedTable}.or` : 'or';
    	        this.url.searchParams.append(key, `(${filters})`);
    	        return this;
    	    }
    	    /**
    	     * Match only rows which satisfy the filter. This is an escape hatch - you
    	     * should use the specific filter methods wherever possible.
    	     *
    	     * Unlike most filters, `opearator` and `value` are used as-is and need to
    	     * follow [PostgREST
    	     * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
    	     * to make sure they are properly sanitized.
    	     *
    	     * @param column - The column to filter on
    	     * @param operator - The operator to filter with, following PostgREST syntax
    	     * @param value - The value to filter with, following PostgREST syntax
    	     */
    	    filter(column, operator, value) {
    	        this.url.searchParams.append(column, `${operator}.${value}`);
    	        return this;
    	    }
    	}
    	PostgrestFilterBuilder$1.default = PostgrestFilterBuilder;
    	
    	return PostgrestFilterBuilder$1;
    }

    var hasRequiredPostgrestQueryBuilder;

    function requirePostgrestQueryBuilder () {
    	if (hasRequiredPostgrestQueryBuilder) return PostgrestQueryBuilder$1;
    	hasRequiredPostgrestQueryBuilder = 1;
    	var __importDefault = (PostgrestQueryBuilder$1 && PostgrestQueryBuilder$1.__importDefault) || function (mod) {
    	    return (mod && mod.__esModule) ? mod : { "default": mod };
    	};
    	Object.defineProperty(PostgrestQueryBuilder$1, "__esModule", { value: true });
    	const PostgrestFilterBuilder_1 = __importDefault(requirePostgrestFilterBuilder());
    	class PostgrestQueryBuilder {
    	    constructor(url, { headers = {}, schema, fetch, }) {
    	        this.url = url;
    	        this.headers = headers;
    	        this.schema = schema;
    	        this.fetch = fetch;
    	    }
    	    /**
    	     * Perform a SELECT query on the table or view.
    	     *
    	     * @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
    	     *
    	     * @param options - Named parameters
    	     *
    	     * @param options.head - When set to `true`, `data` will not be returned.
    	     * Useful if you only need the count.
    	     *
    	     * @param options.count - Count algorithm to use to count rows in the table or view.
    	     *
    	     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
    	     * hood.
    	     *
    	     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
    	     * statistics under the hood.
    	     *
    	     * `"estimated"`: Uses exact count for low numbers and planned count for high
    	     * numbers.
    	     */
    	    select(columns, { head = false, count, } = {}) {
    	        const method = head ? 'HEAD' : 'GET';
    	        // Remove whitespaces except when quoted
    	        let quoted = false;
    	        const cleanedColumns = (columns !== null && columns !== void 0 ? columns : '*')
    	            .split('')
    	            .map((c) => {
    	            if (/\s/.test(c) && !quoted) {
    	                return '';
    	            }
    	            if (c === '"') {
    	                quoted = !quoted;
    	            }
    	            return c;
    	        })
    	            .join('');
    	        this.url.searchParams.set('select', cleanedColumns);
    	        if (count) {
    	            this.headers['Prefer'] = `count=${count}`;
    	        }
    	        return new PostgrestFilterBuilder_1.default({
    	            method,
    	            url: this.url,
    	            headers: this.headers,
    	            schema: this.schema,
    	            fetch: this.fetch,
    	            allowEmpty: false,
    	        });
    	    }
    	    /**
    	     * Perform an INSERT into the table or view.
    	     *
    	     * By default, inserted rows are not returned. To return it, chain the call
    	     * with `.select()`.
    	     *
    	     * @param values - The values to insert. Pass an object to insert a single row
    	     * or an array to insert multiple rows.
    	     *
    	     * @param options - Named parameters
    	     *
    	     * @param options.count - Count algorithm to use to count inserted rows.
    	     *
    	     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
    	     * hood.
    	     *
    	     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
    	     * statistics under the hood.
    	     *
    	     * `"estimated"`: Uses exact count for low numbers and planned count for high
    	     * numbers.
    	     *
    	     * @param options.defaultToNull - Make missing fields default to `null`.
    	     * Otherwise, use the default value for the column. Only applies for bulk
    	     * inserts.
    	     */
    	    insert(values, { count, defaultToNull = true, } = {}) {
    	        const method = 'POST';
    	        const prefersHeaders = [];
    	        if (this.headers['Prefer']) {
    	            prefersHeaders.push(this.headers['Prefer']);
    	        }
    	        if (count) {
    	            prefersHeaders.push(`count=${count}`);
    	        }
    	        if (!defaultToNull) {
    	            prefersHeaders.push('missing=default');
    	        }
    	        this.headers['Prefer'] = prefersHeaders.join(',');
    	        if (Array.isArray(values)) {
    	            const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
    	            if (columns.length > 0) {
    	                const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
    	                this.url.searchParams.set('columns', uniqueColumns.join(','));
    	            }
    	        }
    	        return new PostgrestFilterBuilder_1.default({
    	            method,
    	            url: this.url,
    	            headers: this.headers,
    	            schema: this.schema,
    	            body: values,
    	            fetch: this.fetch,
    	            allowEmpty: false,
    	        });
    	    }
    	    /**
    	     * Perform an UPSERT on the table or view. Depending on the column(s) passed
    	     * to `onConflict`, `.upsert()` allows you to perform the equivalent of
    	     * `.insert()` if a row with the corresponding `onConflict` columns doesn't
    	     * exist, or if it does exist, perform an alternative action depending on
    	     * `ignoreDuplicates`.
    	     *
    	     * By default, upserted rows are not returned. To return it, chain the call
    	     * with `.select()`.
    	     *
    	     * @param values - The values to upsert with. Pass an object to upsert a
    	     * single row or an array to upsert multiple rows.
    	     *
    	     * @param options - Named parameters
    	     *
    	     * @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
    	     * duplicate rows are determined. Two rows are duplicates if all the
    	     * `onConflict` columns are equal.
    	     *
    	     * @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
    	     * `false`, duplicate rows are merged with existing rows.
    	     *
    	     * @param options.count - Count algorithm to use to count upserted rows.
    	     *
    	     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
    	     * hood.
    	     *
    	     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
    	     * statistics under the hood.
    	     *
    	     * `"estimated"`: Uses exact count for low numbers and planned count for high
    	     * numbers.
    	     *
    	     * @param options.defaultToNull - Make missing fields default to `null`.
    	     * Otherwise, use the default value for the column. This only applies when
    	     * inserting new rows, not when merging with existing rows under
    	     * `ignoreDuplicates: false`. This also only applies when doing bulk upserts.
    	     */
    	    upsert(values, { onConflict, ignoreDuplicates = false, count, defaultToNull = true, } = {}) {
    	        const method = 'POST';
    	        const prefersHeaders = [`resolution=${ignoreDuplicates ? 'ignore' : 'merge'}-duplicates`];
    	        if (onConflict !== undefined)
    	            this.url.searchParams.set('on_conflict', onConflict);
    	        if (this.headers['Prefer']) {
    	            prefersHeaders.push(this.headers['Prefer']);
    	        }
    	        if (count) {
    	            prefersHeaders.push(`count=${count}`);
    	        }
    	        if (!defaultToNull) {
    	            prefersHeaders.push('missing=default');
    	        }
    	        this.headers['Prefer'] = prefersHeaders.join(',');
    	        if (Array.isArray(values)) {
    	            const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
    	            if (columns.length > 0) {
    	                const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
    	                this.url.searchParams.set('columns', uniqueColumns.join(','));
    	            }
    	        }
    	        return new PostgrestFilterBuilder_1.default({
    	            method,
    	            url: this.url,
    	            headers: this.headers,
    	            schema: this.schema,
    	            body: values,
    	            fetch: this.fetch,
    	            allowEmpty: false,
    	        });
    	    }
    	    /**
    	     * Perform an UPDATE on the table or view.
    	     *
    	     * By default, updated rows are not returned. To return it, chain the call
    	     * with `.select()` after filters.
    	     *
    	     * @param values - The values to update with
    	     *
    	     * @param options - Named parameters
    	     *
    	     * @param options.count - Count algorithm to use to count updated rows.
    	     *
    	     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
    	     * hood.
    	     *
    	     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
    	     * statistics under the hood.
    	     *
    	     * `"estimated"`: Uses exact count for low numbers and planned count for high
    	     * numbers.
    	     */
    	    update(values, { count, } = {}) {
    	        const method = 'PATCH';
    	        const prefersHeaders = [];
    	        if (this.headers['Prefer']) {
    	            prefersHeaders.push(this.headers['Prefer']);
    	        }
    	        if (count) {
    	            prefersHeaders.push(`count=${count}`);
    	        }
    	        this.headers['Prefer'] = prefersHeaders.join(',');
    	        return new PostgrestFilterBuilder_1.default({
    	            method,
    	            url: this.url,
    	            headers: this.headers,
    	            schema: this.schema,
    	            body: values,
    	            fetch: this.fetch,
    	            allowEmpty: false,
    	        });
    	    }
    	    /**
    	     * Perform a DELETE on the table or view.
    	     *
    	     * By default, deleted rows are not returned. To return it, chain the call
    	     * with `.select()` after filters.
    	     *
    	     * @param options - Named parameters
    	     *
    	     * @param options.count - Count algorithm to use to count deleted rows.
    	     *
    	     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
    	     * hood.
    	     *
    	     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
    	     * statistics under the hood.
    	     *
    	     * `"estimated"`: Uses exact count for low numbers and planned count for high
    	     * numbers.
    	     */
    	    delete({ count, } = {}) {
    	        const method = 'DELETE';
    	        const prefersHeaders = [];
    	        if (count) {
    	            prefersHeaders.push(`count=${count}`);
    	        }
    	        if (this.headers['Prefer']) {
    	            prefersHeaders.unshift(this.headers['Prefer']);
    	        }
    	        this.headers['Prefer'] = prefersHeaders.join(',');
    	        return new PostgrestFilterBuilder_1.default({
    	            method,
    	            url: this.url,
    	            headers: this.headers,
    	            schema: this.schema,
    	            fetch: this.fetch,
    	            allowEmpty: false,
    	        });
    	    }
    	}
    	PostgrestQueryBuilder$1.default = PostgrestQueryBuilder;
    	
    	return PostgrestQueryBuilder$1;
    }

    var constants = {};

    var version$4 = {};

    var hasRequiredVersion;

    function requireVersion () {
    	if (hasRequiredVersion) return version$4;
    	hasRequiredVersion = 1;
    	Object.defineProperty(version$4, "__esModule", { value: true });
    	version$4.version = void 0;
    	version$4.version = '0.0.0-automated';
    	
    	return version$4;
    }

    var hasRequiredConstants;

    function requireConstants () {
    	if (hasRequiredConstants) return constants;
    	hasRequiredConstants = 1;
    	Object.defineProperty(constants, "__esModule", { value: true });
    	constants.DEFAULT_HEADERS = void 0;
    	const version_1 = requireVersion();
    	constants.DEFAULT_HEADERS = { 'X-Client-Info': `postgrest-js/${version_1.version}` };
    	
    	return constants;
    }

    var hasRequiredPostgrestClient;

    function requirePostgrestClient () {
    	if (hasRequiredPostgrestClient) return PostgrestClient$1;
    	hasRequiredPostgrestClient = 1;
    	var __importDefault = (PostgrestClient$1 && PostgrestClient$1.__importDefault) || function (mod) {
    	    return (mod && mod.__esModule) ? mod : { "default": mod };
    	};
    	Object.defineProperty(PostgrestClient$1, "__esModule", { value: true });
    	const PostgrestQueryBuilder_1 = __importDefault(requirePostgrestQueryBuilder());
    	const PostgrestFilterBuilder_1 = __importDefault(requirePostgrestFilterBuilder());
    	const constants_1 = requireConstants();
    	/**
    	 * PostgREST client.
    	 *
    	 * @typeParam Database - Types for the schema from the [type
    	 * generator](https://supabase.com/docs/reference/javascript/next/typescript-support)
    	 *
    	 * @typeParam SchemaName - Postgres schema to switch to. Must be a string
    	 * literal, the same one passed to the constructor. If the schema is not
    	 * `"public"`, this must be supplied manually.
    	 */
    	class PostgrestClient {
    	    // TODO: Add back shouldThrowOnError once we figure out the typings
    	    /**
    	     * Creates a PostgREST client.
    	     *
    	     * @param url - URL of the PostgREST endpoint
    	     * @param options - Named parameters
    	     * @param options.headers - Custom headers
    	     * @param options.schema - Postgres schema to switch to
    	     * @param options.fetch - Custom fetch
    	     */
    	    constructor(url, { headers = {}, schema, fetch, } = {}) {
    	        this.url = url;
    	        this.headers = Object.assign(Object.assign({}, constants_1.DEFAULT_HEADERS), headers);
    	        this.schemaName = schema;
    	        this.fetch = fetch;
    	    }
    	    /**
    	     * Perform a query on a table or a view.
    	     *
    	     * @param relation - The table or view name to query
    	     */
    	    from(relation) {
    	        const url = new URL(`${this.url}/${relation}`);
    	        return new PostgrestQueryBuilder_1.default(url, {
    	            headers: Object.assign({}, this.headers),
    	            schema: this.schemaName,
    	            fetch: this.fetch,
    	        });
    	    }
    	    /**
    	     * Select a schema to query or perform an function (rpc) call.
    	     *
    	     * The schema needs to be on the list of exposed schemas inside Supabase.
    	     *
    	     * @param schema - The schema to query
    	     */
    	    schema(schema) {
    	        return new PostgrestClient(this.url, {
    	            headers: this.headers,
    	            schema,
    	            fetch: this.fetch,
    	        });
    	    }
    	    /**
    	     * Perform a function call.
    	     *
    	     * @param fn - The function name to call
    	     * @param args - The arguments to pass to the function call
    	     * @param options - Named parameters
    	     * @param options.head - When set to `true`, `data` will not be returned.
    	     * Useful if you only need the count.
    	     * @param options.get - When set to `true`, the function will be called with
    	     * read-only access mode.
    	     * @param options.count - Count algorithm to use to count rows returned by the
    	     * function. Only applicable for [set-returning
    	     * functions](https://www.postgresql.org/docs/current/functions-srf.html).
    	     *
    	     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
    	     * hood.
    	     *
    	     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
    	     * statistics under the hood.
    	     *
    	     * `"estimated"`: Uses exact count for low numbers and planned count for high
    	     * numbers.
    	     */
    	    rpc(fn, args = {}, { head = false, get = false, count, } = {}) {
    	        let method;
    	        const url = new URL(`${this.url}/rpc/${fn}`);
    	        let body;
    	        if (head || get) {
    	            method = head ? 'HEAD' : 'GET';
    	            Object.entries(args)
    	                // params with undefined value needs to be filtered out, otherwise it'll
    	                // show up as `?param=undefined`
    	                .filter(([_, value]) => value !== undefined)
    	                // array values need special syntax
    	                .map(([name, value]) => [name, Array.isArray(value) ? `{${value.join(',')}}` : `${value}`])
    	                .forEach(([name, value]) => {
    	                url.searchParams.append(name, value);
    	            });
    	        }
    	        else {
    	            method = 'POST';
    	            body = args;
    	        }
    	        const headers = Object.assign({}, this.headers);
    	        if (count) {
    	            headers['Prefer'] = `count=${count}`;
    	        }
    	        return new PostgrestFilterBuilder_1.default({
    	            method,
    	            url,
    	            headers,
    	            schema: this.schemaName,
    	            body,
    	            fetch: this.fetch,
    	            allowEmpty: false,
    	        });
    	    }
    	}
    	PostgrestClient$1.default = PostgrestClient;
    	
    	return PostgrestClient$1;
    }

    var hasRequiredCjs;

    function requireCjs () {
    	if (hasRequiredCjs) return cjs;
    	hasRequiredCjs = 1;
    	var __importDefault = (cjs && cjs.__importDefault) || function (mod) {
    	    return (mod && mod.__esModule) ? mod : { "default": mod };
    	};
    	Object.defineProperty(cjs, "__esModule", { value: true });
    	cjs.PostgrestError = cjs.PostgrestBuilder = cjs.PostgrestTransformBuilder = cjs.PostgrestFilterBuilder = cjs.PostgrestQueryBuilder = cjs.PostgrestClient = void 0;
    	// Always update wrapper.mjs when updating this file.
    	const PostgrestClient_1 = __importDefault(requirePostgrestClient());
    	cjs.PostgrestClient = PostgrestClient_1.default;
    	const PostgrestQueryBuilder_1 = __importDefault(requirePostgrestQueryBuilder());
    	cjs.PostgrestQueryBuilder = PostgrestQueryBuilder_1.default;
    	const PostgrestFilterBuilder_1 = __importDefault(requirePostgrestFilterBuilder());
    	cjs.PostgrestFilterBuilder = PostgrestFilterBuilder_1.default;
    	const PostgrestTransformBuilder_1 = __importDefault(requirePostgrestTransformBuilder());
    	cjs.PostgrestTransformBuilder = PostgrestTransformBuilder_1.default;
    	const PostgrestBuilder_1 = __importDefault(requirePostgrestBuilder());
    	cjs.PostgrestBuilder = PostgrestBuilder_1.default;
    	const PostgrestError_1 = __importDefault(requirePostgrestError());
    	cjs.PostgrestError = PostgrestError_1.default;
    	cjs.default = {
    	    PostgrestClient: PostgrestClient_1.default,
    	    PostgrestQueryBuilder: PostgrestQueryBuilder_1.default,
    	    PostgrestFilterBuilder: PostgrestFilterBuilder_1.default,
    	    PostgrestTransformBuilder: PostgrestTransformBuilder_1.default,
    	    PostgrestBuilder: PostgrestBuilder_1.default,
    	    PostgrestError: PostgrestError_1.default,
    	};
    	
    	return cjs;
    }

    var cjsExports = requireCjs();
    var index = /*@__PURE__*/getDefaultExportFromCjs(cjsExports);

    const {
      PostgrestClient,
      PostgrestQueryBuilder,
      PostgrestFilterBuilder,
      PostgrestTransformBuilder,
      PostgrestBuilder,
      PostgrestError,
    } = index;

    function getNativeWebSocket() {
        if (typeof WebSocket !== "undefined")
            return WebSocket;
        if (typeof global$1.WebSocket !== "undefined")
            return global$1.WebSocket;
        if (typeof window.WebSocket !== "undefined")
            return window.WebSocket;
        if (typeof self.WebSocket !== "undefined")
            return self.WebSocket;
        throw new Error("`WebSocket` is not supported in this environment");
    }

    const WebSocket$1 = getNativeWebSocket();

    const version$3 = '2.11.15';

    const DEFAULT_VERSION = `realtime-js/${version$3}`;
    const VSN = '1.0.0';
    const DEFAULT_TIMEOUT = 10000;
    const WS_CLOSE_NORMAL = 1000;
    var SOCKET_STATES;
    (function (SOCKET_STATES) {
        SOCKET_STATES[SOCKET_STATES["connecting"] = 0] = "connecting";
        SOCKET_STATES[SOCKET_STATES["open"] = 1] = "open";
        SOCKET_STATES[SOCKET_STATES["closing"] = 2] = "closing";
        SOCKET_STATES[SOCKET_STATES["closed"] = 3] = "closed";
    })(SOCKET_STATES || (SOCKET_STATES = {}));
    var CHANNEL_STATES;
    (function (CHANNEL_STATES) {
        CHANNEL_STATES["closed"] = "closed";
        CHANNEL_STATES["errored"] = "errored";
        CHANNEL_STATES["joined"] = "joined";
        CHANNEL_STATES["joining"] = "joining";
        CHANNEL_STATES["leaving"] = "leaving";
    })(CHANNEL_STATES || (CHANNEL_STATES = {}));
    var CHANNEL_EVENTS;
    (function (CHANNEL_EVENTS) {
        CHANNEL_EVENTS["close"] = "phx_close";
        CHANNEL_EVENTS["error"] = "phx_error";
        CHANNEL_EVENTS["join"] = "phx_join";
        CHANNEL_EVENTS["reply"] = "phx_reply";
        CHANNEL_EVENTS["leave"] = "phx_leave";
        CHANNEL_EVENTS["access_token"] = "access_token";
    })(CHANNEL_EVENTS || (CHANNEL_EVENTS = {}));
    var TRANSPORTS;
    (function (TRANSPORTS) {
        TRANSPORTS["websocket"] = "websocket";
    })(TRANSPORTS || (TRANSPORTS = {}));
    var CONNECTION_STATE;
    (function (CONNECTION_STATE) {
        CONNECTION_STATE["Connecting"] = "connecting";
        CONNECTION_STATE["Open"] = "open";
        CONNECTION_STATE["Closing"] = "closing";
        CONNECTION_STATE["Closed"] = "closed";
    })(CONNECTION_STATE || (CONNECTION_STATE = {}));

    // This file draws heavily from https://github.com/phoenixframework/phoenix/commit/cf098e9cf7a44ee6479d31d911a97d3c7430c6fe
    // License: https://github.com/phoenixframework/phoenix/blob/master/LICENSE.md
    class Serializer {
        constructor() {
            this.HEADER_LENGTH = 1;
        }
        decode(rawPayload, callback) {
            if (rawPayload.constructor === ArrayBuffer) {
                return callback(this._binaryDecode(rawPayload));
            }
            if (typeof rawPayload === 'string') {
                return callback(JSON.parse(rawPayload));
            }
            return callback({});
        }
        _binaryDecode(buffer) {
            const view = new DataView(buffer);
            const decoder = new TextDecoder();
            return this._decodeBroadcast(buffer, view, decoder);
        }
        _decodeBroadcast(buffer, view, decoder) {
            const topicSize = view.getUint8(1);
            const eventSize = view.getUint8(2);
            let offset = this.HEADER_LENGTH + 2;
            const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
            offset = offset + topicSize;
            const event = decoder.decode(buffer.slice(offset, offset + eventSize));
            offset = offset + eventSize;
            const data = JSON.parse(decoder.decode(buffer.slice(offset, buffer.byteLength)));
            return { ref: null, topic: topic, event: event, payload: data };
        }
    }

    /**
     * Creates a timer that accepts a `timerCalc` function to perform calculated timeout retries, such as exponential backoff.
     *
     * @example
     *    let reconnectTimer = new Timer(() => this.connect(), function(tries){
     *      return [1000, 5000, 10000][tries - 1] || 10000
     *    })
     *    reconnectTimer.scheduleTimeout() // fires after 1000
     *    reconnectTimer.scheduleTimeout() // fires after 5000
     *    reconnectTimer.reset()
     *    reconnectTimer.scheduleTimeout() // fires after 1000
     */
    class Timer {
        constructor(callback, timerCalc) {
            this.callback = callback;
            this.timerCalc = timerCalc;
            this.timer = undefined;
            this.tries = 0;
            this.callback = callback;
            this.timerCalc = timerCalc;
        }
        reset() {
            this.tries = 0;
            clearTimeout(this.timer);
        }
        // Cancels any previous scheduleTimeout and schedules callback
        scheduleTimeout() {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.tries = this.tries + 1;
                this.callback();
            }, this.timerCalc(this.tries + 1));
        }
    }

    /**
     * Helpers to convert the change Payload into native JS types.
     */
    // Adapted from epgsql (src/epgsql_binary.erl), this module licensed under
    // 3-clause BSD found here: https://raw.githubusercontent.com/epgsql/epgsql/devel/LICENSE
    var PostgresTypes;
    (function (PostgresTypes) {
        PostgresTypes["abstime"] = "abstime";
        PostgresTypes["bool"] = "bool";
        PostgresTypes["date"] = "date";
        PostgresTypes["daterange"] = "daterange";
        PostgresTypes["float4"] = "float4";
        PostgresTypes["float8"] = "float8";
        PostgresTypes["int2"] = "int2";
        PostgresTypes["int4"] = "int4";
        PostgresTypes["int4range"] = "int4range";
        PostgresTypes["int8"] = "int8";
        PostgresTypes["int8range"] = "int8range";
        PostgresTypes["json"] = "json";
        PostgresTypes["jsonb"] = "jsonb";
        PostgresTypes["money"] = "money";
        PostgresTypes["numeric"] = "numeric";
        PostgresTypes["oid"] = "oid";
        PostgresTypes["reltime"] = "reltime";
        PostgresTypes["text"] = "text";
        PostgresTypes["time"] = "time";
        PostgresTypes["timestamp"] = "timestamp";
        PostgresTypes["timestamptz"] = "timestamptz";
        PostgresTypes["timetz"] = "timetz";
        PostgresTypes["tsrange"] = "tsrange";
        PostgresTypes["tstzrange"] = "tstzrange";
    })(PostgresTypes || (PostgresTypes = {}));
    /**
     * Takes an array of columns and an object of string values then converts each string value
     * to its mapped type.
     *
     * @param {{name: String, type: String}[]} columns
     * @param {Object} record
     * @param {Object} options The map of various options that can be applied to the mapper
     * @param {Array} options.skipTypes The array of types that should not be converted
     *
     * @example convertChangeData([{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age:'33'}, {})
     * //=>{ first_name: 'Paul', age: 33 }
     */
    const convertChangeData = (columns, record, options = {}) => {
        var _a;
        const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
        return Object.keys(record).reduce((acc, rec_key) => {
            acc[rec_key] = convertColumn(rec_key, columns, record, skipTypes);
            return acc;
        }, {});
    };
    /**
     * Converts the value of an individual column.
     *
     * @param {String} columnName The column that you want to convert
     * @param {{name: String, type: String}[]} columns All of the columns
     * @param {Object} record The map of string values
     * @param {Array} skipTypes An array of types that should not be converted
     * @return {object} Useless information
     *
     * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, [])
     * //=> 33
     * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, ['int4'])
     * //=> "33"
     */
    const convertColumn = (columnName, columns, record, skipTypes) => {
        const column = columns.find((x) => x.name === columnName);
        const colType = column === null || column === void 0 ? void 0 : column.type;
        const value = record[columnName];
        if (colType && !skipTypes.includes(colType)) {
            return convertCell(colType, value);
        }
        return noop$1(value);
    };
    /**
     * If the value of the cell is `null`, returns null.
     * Otherwise converts the string value to the correct type.
     * @param {String} type A postgres column type
     * @param {String} value The cell value
     *
     * @example convertCell('bool', 't')
     * //=> true
     * @example convertCell('int8', '10')
     * //=> 10
     * @example convertCell('_int4', '{1,2,3,4}')
     * //=> [1,2,3,4]
     */
    const convertCell = (type, value) => {
        // if data type is an array
        if (type.charAt(0) === '_') {
            const dataType = type.slice(1, type.length);
            return toArray(value, dataType);
        }
        // If not null, convert to correct type.
        switch (type) {
            case PostgresTypes.bool:
                return toBoolean(value);
            case PostgresTypes.float4:
            case PostgresTypes.float8:
            case PostgresTypes.int2:
            case PostgresTypes.int4:
            case PostgresTypes.int8:
            case PostgresTypes.numeric:
            case PostgresTypes.oid:
                return toNumber(value);
            case PostgresTypes.json:
            case PostgresTypes.jsonb:
                return toJson(value);
            case PostgresTypes.timestamp:
                return toTimestampString(value); // Format to be consistent with PostgREST
            case PostgresTypes.abstime: // To allow users to cast it based on Timezone
            case PostgresTypes.date: // To allow users to cast it based on Timezone
            case PostgresTypes.daterange:
            case PostgresTypes.int4range:
            case PostgresTypes.int8range:
            case PostgresTypes.money:
            case PostgresTypes.reltime: // To allow users to cast it based on Timezone
            case PostgresTypes.text:
            case PostgresTypes.time: // To allow users to cast it based on Timezone
            case PostgresTypes.timestamptz: // To allow users to cast it based on Timezone
            case PostgresTypes.timetz: // To allow users to cast it based on Timezone
            case PostgresTypes.tsrange:
            case PostgresTypes.tstzrange:
                return noop$1(value);
            default:
                // Return the value for remaining types
                return noop$1(value);
        }
    };
    const noop$1 = (value) => {
        return value;
    };
    const toBoolean = (value) => {
        switch (value) {
            case 't':
                return true;
            case 'f':
                return false;
            default:
                return value;
        }
    };
    const toNumber = (value) => {
        if (typeof value === 'string') {
            const parsedValue = parseFloat(value);
            if (!Number.isNaN(parsedValue)) {
                return parsedValue;
            }
        }
        return value;
    };
    const toJson = (value) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch (error) {
                console.log(`JSON parse error: ${error}`);
                return value;
            }
        }
        return value;
    };
    /**
     * Converts a Postgres Array into a native JS array
     *
     * @example toArray('{}', 'int4')
     * //=> []
     * @example toArray('{"[2021-01-01,2021-12-31)","(2021-01-01,2021-12-32]"}', 'daterange')
     * //=> ['[2021-01-01,2021-12-31)', '(2021-01-01,2021-12-32]']
     * @example toArray([1,2,3,4], 'int4')
     * //=> [1,2,3,4]
     */
    const toArray = (value, type) => {
        if (typeof value !== 'string') {
            return value;
        }
        const lastIdx = value.length - 1;
        const closeBrace = value[lastIdx];
        const openBrace = value[0];
        // Confirm value is a Postgres array by checking curly brackets
        if (openBrace === '{' && closeBrace === '}') {
            let arr;
            const valTrim = value.slice(1, lastIdx);
            // TODO: find a better solution to separate Postgres array data
            try {
                arr = JSON.parse('[' + valTrim + ']');
            }
            catch (_) {
                // WARNING: splitting on comma does not cover all edge cases
                arr = valTrim ? valTrim.split(',') : [];
            }
            return arr.map((val) => convertCell(type, val));
        }
        return value;
    };
    /**
     * Fixes timestamp to be ISO-8601. Swaps the space between the date and time for a 'T'
     * See https://github.com/supabase/supabase/issues/18
     *
     * @example toTimestampString('2019-09-10 00:00:00')
     * //=> '2019-09-10T00:00:00'
     */
    const toTimestampString = (value) => {
        if (typeof value === 'string') {
            return value.replace(' ', 'T');
        }
        return value;
    };
    const httpEndpointURL = (socketUrl) => {
        let url = socketUrl;
        url = url.replace(/^ws/i, 'http');
        url = url.replace(/(\/socket\/websocket|\/socket|\/websocket)\/?$/i, '');
        return url.replace(/\/+$/, '');
    };

    class Push {
        /**
         * Initializes the Push
         *
         * @param channel The Channel
         * @param event The event, for example `"phx_join"`
         * @param payload The payload, for example `{user_id: 123}`
         * @param timeout The push timeout in milliseconds
         */
        constructor(channel, event, payload = {}, timeout = DEFAULT_TIMEOUT) {
            this.channel = channel;
            this.event = event;
            this.payload = payload;
            this.timeout = timeout;
            this.sent = false;
            this.timeoutTimer = undefined;
            this.ref = '';
            this.receivedResp = null;
            this.recHooks = [];
            this.refEvent = null;
        }
        resend(timeout) {
            this.timeout = timeout;
            this._cancelRefEvent();
            this.ref = '';
            this.refEvent = null;
            this.receivedResp = null;
            this.sent = false;
            this.send();
        }
        send() {
            if (this._hasReceived('timeout')) {
                return;
            }
            this.startTimeout();
            this.sent = true;
            this.channel.socket.push({
                topic: this.channel.topic,
                event: this.event,
                payload: this.payload,
                ref: this.ref,
                join_ref: this.channel._joinRef(),
            });
        }
        updatePayload(payload) {
            this.payload = Object.assign(Object.assign({}, this.payload), payload);
        }
        receive(status, callback) {
            var _a;
            if (this._hasReceived(status)) {
                callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
            }
            this.recHooks.push({ status, callback });
            return this;
        }
        startTimeout() {
            if (this.timeoutTimer) {
                return;
            }
            this.ref = this.channel.socket._makeRef();
            this.refEvent = this.channel._replyEventName(this.ref);
            const callback = (payload) => {
                this._cancelRefEvent();
                this._cancelTimeout();
                this.receivedResp = payload;
                this._matchReceive(payload);
            };
            this.channel._on(this.refEvent, {}, callback);
            this.timeoutTimer = setTimeout(() => {
                this.trigger('timeout', {});
            }, this.timeout);
        }
        trigger(status, response) {
            if (this.refEvent)
                this.channel._trigger(this.refEvent, { status, response });
        }
        destroy() {
            this._cancelRefEvent();
            this._cancelTimeout();
        }
        _cancelRefEvent() {
            if (!this.refEvent) {
                return;
            }
            this.channel._off(this.refEvent, {});
        }
        _cancelTimeout() {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = undefined;
        }
        _matchReceive({ status, response, }) {
            this.recHooks
                .filter((h) => h.status === status)
                .forEach((h) => h.callback(response));
        }
        _hasReceived(status) {
            return this.receivedResp && this.receivedResp.status === status;
        }
    }

    /*
      This file draws heavily from https://github.com/phoenixframework/phoenix/blob/d344ec0a732ab4ee204215b31de69cf4be72e3bf/assets/js/phoenix/presence.js
      License: https://github.com/phoenixframework/phoenix/blob/d344ec0a732ab4ee204215b31de69cf4be72e3bf/LICENSE.md
    */
    exports.REALTIME_PRESENCE_LISTEN_EVENTS = void 0;
    (function (REALTIME_PRESENCE_LISTEN_EVENTS) {
        REALTIME_PRESENCE_LISTEN_EVENTS["SYNC"] = "sync";
        REALTIME_PRESENCE_LISTEN_EVENTS["JOIN"] = "join";
        REALTIME_PRESENCE_LISTEN_EVENTS["LEAVE"] = "leave";
    })(exports.REALTIME_PRESENCE_LISTEN_EVENTS || (exports.REALTIME_PRESENCE_LISTEN_EVENTS = {}));
    class RealtimePresence {
        /**
         * Initializes the Presence.
         *
         * @param channel - The RealtimeChannel
         * @param opts - The options,
         *        for example `{events: {state: 'state', diff: 'diff'}}`
         */
        constructor(channel, opts) {
            this.channel = channel;
            this.state = {};
            this.pendingDiffs = [];
            this.joinRef = null;
            this.caller = {
                onJoin: () => { },
                onLeave: () => { },
                onSync: () => { },
            };
            const events = (opts === null || opts === void 0 ? void 0 : opts.events) || {
                state: 'presence_state',
                diff: 'presence_diff',
            };
            this.channel._on(events.state, {}, (newState) => {
                const { onJoin, onLeave, onSync } = this.caller;
                this.joinRef = this.channel._joinRef();
                this.state = RealtimePresence.syncState(this.state, newState, onJoin, onLeave);
                this.pendingDiffs.forEach((diff) => {
                    this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
                });
                this.pendingDiffs = [];
                onSync();
            });
            this.channel._on(events.diff, {}, (diff) => {
                const { onJoin, onLeave, onSync } = this.caller;
                if (this.inPendingSyncState()) {
                    this.pendingDiffs.push(diff);
                }
                else {
                    this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
                    onSync();
                }
            });
            this.onJoin((key, currentPresences, newPresences) => {
                this.channel._trigger('presence', {
                    event: 'join',
                    key,
                    currentPresences,
                    newPresences,
                });
            });
            this.onLeave((key, currentPresences, leftPresences) => {
                this.channel._trigger('presence', {
                    event: 'leave',
                    key,
                    currentPresences,
                    leftPresences,
                });
            });
            this.onSync(() => {
                this.channel._trigger('presence', { event: 'sync' });
            });
        }
        /**
         * Used to sync the list of presences on the server with the
         * client's state.
         *
         * An optional `onJoin` and `onLeave` callback can be provided to
         * react to changes in the client's local presences across
         * disconnects and reconnects with the server.
         *
         * @internal
         */
        static syncState(currentState, newState, onJoin, onLeave) {
            const state = this.cloneDeep(currentState);
            const transformedState = this.transformState(newState);
            const joins = {};
            const leaves = {};
            this.map(state, (key, presences) => {
                if (!transformedState[key]) {
                    leaves[key] = presences;
                }
            });
            this.map(transformedState, (key, newPresences) => {
                const currentPresences = state[key];
                if (currentPresences) {
                    const newPresenceRefs = newPresences.map((m) => m.presence_ref);
                    const curPresenceRefs = currentPresences.map((m) => m.presence_ref);
                    const joinedPresences = newPresences.filter((m) => curPresenceRefs.indexOf(m.presence_ref) < 0);
                    const leftPresences = currentPresences.filter((m) => newPresenceRefs.indexOf(m.presence_ref) < 0);
                    if (joinedPresences.length > 0) {
                        joins[key] = joinedPresences;
                    }
                    if (leftPresences.length > 0) {
                        leaves[key] = leftPresences;
                    }
                }
                else {
                    joins[key] = newPresences;
                }
            });
            return this.syncDiff(state, { joins, leaves }, onJoin, onLeave);
        }
        /**
         * Used to sync a diff of presence join and leave events from the
         * server, as they happen.
         *
         * Like `syncState`, `syncDiff` accepts optional `onJoin` and
         * `onLeave` callbacks to react to a user joining or leaving from a
         * device.
         *
         * @internal
         */
        static syncDiff(state, diff, onJoin, onLeave) {
            const { joins, leaves } = {
                joins: this.transformState(diff.joins),
                leaves: this.transformState(diff.leaves),
            };
            if (!onJoin) {
                onJoin = () => { };
            }
            if (!onLeave) {
                onLeave = () => { };
            }
            this.map(joins, (key, newPresences) => {
                var _a;
                const currentPresences = (_a = state[key]) !== null && _a !== void 0 ? _a : [];
                state[key] = this.cloneDeep(newPresences);
                if (currentPresences.length > 0) {
                    const joinedPresenceRefs = state[key].map((m) => m.presence_ref);
                    const curPresences = currentPresences.filter((m) => joinedPresenceRefs.indexOf(m.presence_ref) < 0);
                    state[key].unshift(...curPresences);
                }
                onJoin(key, currentPresences, newPresences);
            });
            this.map(leaves, (key, leftPresences) => {
                let currentPresences = state[key];
                if (!currentPresences)
                    return;
                const presenceRefsToRemove = leftPresences.map((m) => m.presence_ref);
                currentPresences = currentPresences.filter((m) => presenceRefsToRemove.indexOf(m.presence_ref) < 0);
                state[key] = currentPresences;
                onLeave(key, currentPresences, leftPresences);
                if (currentPresences.length === 0)
                    delete state[key];
            });
            return state;
        }
        /** @internal */
        static map(obj, func) {
            return Object.getOwnPropertyNames(obj).map((key) => func(key, obj[key]));
        }
        /**
         * Remove 'metas' key
         * Change 'phx_ref' to 'presence_ref'
         * Remove 'phx_ref' and 'phx_ref_prev'
         *
         * @example
         * // returns {
         *  abc123: [
         *    { presence_ref: '2', user_id: 1 },
         *    { presence_ref: '3', user_id: 2 }
         *  ]
         * }
         * RealtimePresence.transformState({
         *  abc123: {
         *    metas: [
         *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
         *      { phx_ref: '3', user_id: 2 }
         *    ]
         *  }
         * })
         *
         * @internal
         */
        static transformState(state) {
            state = this.cloneDeep(state);
            return Object.getOwnPropertyNames(state).reduce((newState, key) => {
                const presences = state[key];
                if ('metas' in presences) {
                    newState[key] = presences.metas.map((presence) => {
                        presence['presence_ref'] = presence['phx_ref'];
                        delete presence['phx_ref'];
                        delete presence['phx_ref_prev'];
                        return presence;
                    });
                }
                else {
                    newState[key] = presences;
                }
                return newState;
            }, {});
        }
        /** @internal */
        static cloneDeep(obj) {
            return JSON.parse(JSON.stringify(obj));
        }
        /** @internal */
        onJoin(callback) {
            this.caller.onJoin = callback;
        }
        /** @internal */
        onLeave(callback) {
            this.caller.onLeave = callback;
        }
        /** @internal */
        onSync(callback) {
            this.caller.onSync = callback;
        }
        /** @internal */
        inPendingSyncState() {
            return !this.joinRef || this.joinRef !== this.channel._joinRef();
        }
    }

    exports.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = void 0;
    (function (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT) {
        REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["ALL"] = "*";
        REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["INSERT"] = "INSERT";
        REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["UPDATE"] = "UPDATE";
        REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["DELETE"] = "DELETE";
    })(exports.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT || (exports.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {}));
    exports.REALTIME_LISTEN_TYPES = void 0;
    (function (REALTIME_LISTEN_TYPES) {
        REALTIME_LISTEN_TYPES["BROADCAST"] = "broadcast";
        REALTIME_LISTEN_TYPES["PRESENCE"] = "presence";
        REALTIME_LISTEN_TYPES["POSTGRES_CHANGES"] = "postgres_changes";
        REALTIME_LISTEN_TYPES["SYSTEM"] = "system";
    })(exports.REALTIME_LISTEN_TYPES || (exports.REALTIME_LISTEN_TYPES = {}));
    exports.REALTIME_SUBSCRIBE_STATES = void 0;
    (function (REALTIME_SUBSCRIBE_STATES) {
        REALTIME_SUBSCRIBE_STATES["SUBSCRIBED"] = "SUBSCRIBED";
        REALTIME_SUBSCRIBE_STATES["TIMED_OUT"] = "TIMED_OUT";
        REALTIME_SUBSCRIBE_STATES["CLOSED"] = "CLOSED";
        REALTIME_SUBSCRIBE_STATES["CHANNEL_ERROR"] = "CHANNEL_ERROR";
    })(exports.REALTIME_SUBSCRIBE_STATES || (exports.REALTIME_SUBSCRIBE_STATES = {}));
    const REALTIME_CHANNEL_STATES = CHANNEL_STATES;
    /** A channel is the basic building block of Realtime
     * and narrows the scope of data flow to subscribed clients.
     * You can think of a channel as a chatroom where participants are able to see who's online
     * and send and receive messages.
     */
    class RealtimeChannel {
        constructor(
        /** Topic name can be any string. */
        topic, params = { config: {} }, socket) {
            this.topic = topic;
            this.params = params;
            this.socket = socket;
            this.bindings = {};
            this.state = CHANNEL_STATES.closed;
            this.joinedOnce = false;
            this.pushBuffer = [];
            this.subTopic = topic.replace(/^realtime:/i, '');
            this.params.config = Object.assign({
                broadcast: { ack: false, self: false },
                presence: { key: '' },
                private: false,
            }, params.config);
            this.timeout = this.socket.timeout;
            this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
            this.rejoinTimer = new Timer(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs);
            this.joinPush.receive('ok', () => {
                this.state = CHANNEL_STATES.joined;
                this.rejoinTimer.reset();
                this.pushBuffer.forEach((pushEvent) => pushEvent.send());
                this.pushBuffer = [];
            });
            this._onClose(() => {
                this.rejoinTimer.reset();
                this.socket.log('channel', `close ${this.topic} ${this._joinRef()}`);
                this.state = CHANNEL_STATES.closed;
                this.socket._remove(this);
            });
            this._onError((reason) => {
                if (this._isLeaving() || this._isClosed()) {
                    return;
                }
                this.socket.log('channel', `error ${this.topic}`, reason);
                this.state = CHANNEL_STATES.errored;
                this.rejoinTimer.scheduleTimeout();
            });
            this.joinPush.receive('timeout', () => {
                if (!this._isJoining()) {
                    return;
                }
                this.socket.log('channel', `timeout ${this.topic}`, this.joinPush.timeout);
                this.state = CHANNEL_STATES.errored;
                this.rejoinTimer.scheduleTimeout();
            });
            this._on(CHANNEL_EVENTS.reply, {}, (payload, ref) => {
                this._trigger(this._replyEventName(ref), payload);
            });
            this.presence = new RealtimePresence(this);
            this.broadcastEndpointURL =
                httpEndpointURL(this.socket.endPoint) + '/api/broadcast';
            this.private = this.params.config.private || false;
        }
        /** Subscribe registers your client with the server */
        subscribe(callback, timeout = this.timeout) {
            var _a, _b;
            if (!this.socket.isConnected()) {
                this.socket.connect();
            }
            if (this.state == CHANNEL_STATES.closed) {
                const { config: { broadcast, presence, private: isPrivate }, } = this.params;
                this._onError((e) => callback === null || callback === void 0 ? void 0 : callback(exports.REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, e));
                this._onClose(() => callback === null || callback === void 0 ? void 0 : callback(exports.REALTIME_SUBSCRIBE_STATES.CLOSED));
                const accessTokenPayload = {};
                const config = {
                    broadcast,
                    presence,
                    postgres_changes: (_b = (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.map((r) => r.filter)) !== null && _b !== void 0 ? _b : [],
                    private: isPrivate,
                };
                if (this.socket.accessTokenValue) {
                    accessTokenPayload.access_token = this.socket.accessTokenValue;
                }
                this.updateJoinPayload(Object.assign({ config }, accessTokenPayload));
                this.joinedOnce = true;
                this._rejoin(timeout);
                this.joinPush
                    .receive('ok', async ({ postgres_changes }) => {
                    var _a;
                    this.socket.setAuth();
                    if (postgres_changes === undefined) {
                        callback === null || callback === void 0 ? void 0 : callback(exports.REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
                        return;
                    }
                    else {
                        const clientPostgresBindings = this.bindings.postgres_changes;
                        const bindingsLen = (_a = clientPostgresBindings === null || clientPostgresBindings === void 0 ? void 0 : clientPostgresBindings.length) !== null && _a !== void 0 ? _a : 0;
                        const newPostgresBindings = [];
                        for (let i = 0; i < bindingsLen; i++) {
                            const clientPostgresBinding = clientPostgresBindings[i];
                            const { filter: { event, schema, table, filter }, } = clientPostgresBinding;
                            const serverPostgresFilter = postgres_changes && postgres_changes[i];
                            if (serverPostgresFilter &&
                                serverPostgresFilter.event === event &&
                                serverPostgresFilter.schema === schema &&
                                serverPostgresFilter.table === table &&
                                serverPostgresFilter.filter === filter) {
                                newPostgresBindings.push(Object.assign(Object.assign({}, clientPostgresBinding), { id: serverPostgresFilter.id }));
                            }
                            else {
                                this.unsubscribe();
                                this.state = CHANNEL_STATES.errored;
                                callback === null || callback === void 0 ? void 0 : callback(exports.REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error('mismatch between server and client bindings for postgres changes'));
                                return;
                            }
                        }
                        this.bindings.postgres_changes = newPostgresBindings;
                        callback && callback(exports.REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
                        return;
                    }
                })
                    .receive('error', (error) => {
                    this.state = CHANNEL_STATES.errored;
                    callback === null || callback === void 0 ? void 0 : callback(exports.REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error(JSON.stringify(Object.values(error).join(', ') || 'error')));
                    return;
                })
                    .receive('timeout', () => {
                    callback === null || callback === void 0 ? void 0 : callback(exports.REALTIME_SUBSCRIBE_STATES.TIMED_OUT);
                    return;
                });
            }
            return this;
        }
        presenceState() {
            return this.presence.state;
        }
        async track(payload, opts = {}) {
            return await this.send({
                type: 'presence',
                event: 'track',
                payload,
            }, opts.timeout || this.timeout);
        }
        async untrack(opts = {}) {
            return await this.send({
                type: 'presence',
                event: 'untrack',
            }, opts);
        }
        on(type, filter, callback) {
            return this._on(type, filter, callback);
        }
        /**
         * Sends a message into the channel.
         *
         * @param args Arguments to send to channel
         * @param args.type The type of event to send
         * @param args.event The name of the event being sent
         * @param args.payload Payload to be sent
         * @param opts Options to be used during the send process
         */
        async send(args, opts = {}) {
            var _a, _b;
            if (!this._canPush() && args.type === 'broadcast') {
                const { event, payload: endpoint_payload } = args;
                const authorization = this.socket.accessTokenValue
                    ? `Bearer ${this.socket.accessTokenValue}`
                    : '';
                const options = {
                    method: 'POST',
                    headers: {
                        Authorization: authorization,
                        apikey: this.socket.apiKey ? this.socket.apiKey : '',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                topic: this.subTopic,
                                event,
                                payload: endpoint_payload,
                                private: this.private,
                            },
                        ],
                    }),
                };
                try {
                    const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
                    await ((_b = response.body) === null || _b === void 0 ? void 0 : _b.cancel());
                    return response.ok ? 'ok' : 'error';
                }
                catch (error) {
                    if (error.name === 'AbortError') {
                        return 'timed out';
                    }
                    else {
                        return 'error';
                    }
                }
            }
            else {
                return new Promise((resolve) => {
                    var _a, _b, _c;
                    const push = this._push(args.type, args, opts.timeout || this.timeout);
                    if (args.type === 'broadcast' && !((_c = (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.broadcast) === null || _c === void 0 ? void 0 : _c.ack)) {
                        resolve('ok');
                    }
                    push.receive('ok', () => resolve('ok'));
                    push.receive('error', () => resolve('error'));
                    push.receive('timeout', () => resolve('timed out'));
                });
            }
        }
        updateJoinPayload(payload) {
            this.joinPush.updatePayload(payload);
        }
        /**
         * Leaves the channel.
         *
         * Unsubscribes from server events, and instructs channel to terminate on server.
         * Triggers onClose() hooks.
         *
         * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
         * channel.unsubscribe().receive("ok", () => alert("left!") )
         */
        unsubscribe(timeout = this.timeout) {
            this.state = CHANNEL_STATES.leaving;
            const onClose = () => {
                this.socket.log('channel', `leave ${this.topic}`);
                this._trigger(CHANNEL_EVENTS.close, 'leave', this._joinRef());
            };
            this.joinPush.destroy();
            let leavePush = null;
            return new Promise((resolve) => {
                leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
                leavePush
                    .receive('ok', () => {
                    onClose();
                    resolve('ok');
                })
                    .receive('timeout', () => {
                    onClose();
                    resolve('timed out');
                })
                    .receive('error', () => {
                    resolve('error');
                });
                leavePush.send();
                if (!this._canPush()) {
                    leavePush.trigger('ok', {});
                }
            }).finally(() => {
                leavePush === null || leavePush === void 0 ? void 0 : leavePush.destroy();
            });
        }
        /**
         * Teardown the channel.
         *
         * Destroys and stops related timers.
         */
        teardown() {
            this.pushBuffer.forEach((push) => push.destroy());
            this.rejoinTimer && clearTimeout(this.rejoinTimer.timer);
            this.joinPush.destroy();
        }
        /** @internal */
        async _fetchWithTimeout(url, options, timeout) {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            const response = await this.socket.fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
            clearTimeout(id);
            return response;
        }
        /** @internal */
        _push(event, payload, timeout = this.timeout) {
            if (!this.joinedOnce) {
                throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
            }
            let pushEvent = new Push(this, event, payload, timeout);
            if (this._canPush()) {
                pushEvent.send();
            }
            else {
                pushEvent.startTimeout();
                this.pushBuffer.push(pushEvent);
            }
            return pushEvent;
        }
        /**
         * Overridable message hook
         *
         * Receives all events for specialized message handling before dispatching to the channel callbacks.
         * Must return the payload, modified or unmodified.
         *
         * @internal
         */
        _onMessage(_event, payload, _ref) {
            return payload;
        }
        /** @internal */
        _isMember(topic) {
            return this.topic === topic;
        }
        /** @internal */
        _joinRef() {
            return this.joinPush.ref;
        }
        /** @internal */
        _trigger(type, payload, ref) {
            var _a, _b;
            const typeLower = type.toLocaleLowerCase();
            const { close, error, leave, join } = CHANNEL_EVENTS;
            const events = [close, error, leave, join];
            if (ref && events.indexOf(typeLower) >= 0 && ref !== this._joinRef()) {
                return;
            }
            let handledPayload = this._onMessage(typeLower, payload, ref);
            if (payload && !handledPayload) {
                throw 'channel onMessage callbacks must return the payload, modified or unmodified';
            }
            if (['insert', 'update', 'delete'].includes(typeLower)) {
                (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.filter((bind) => {
                    var _a, _b, _c;
                    return (((_a = bind.filter) === null || _a === void 0 ? void 0 : _a.event) === '*' ||
                        ((_c = (_b = bind.filter) === null || _b === void 0 ? void 0 : _b.event) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase()) === typeLower);
                }).map((bind) => bind.callback(handledPayload, ref));
            }
            else {
                (_b = this.bindings[typeLower]) === null || _b === void 0 ? void 0 : _b.filter((bind) => {
                    var _a, _b, _c, _d, _e, _f;
                    if (['broadcast', 'presence', 'postgres_changes'].includes(typeLower)) {
                        if ('id' in bind) {
                            const bindId = bind.id;
                            const bindEvent = (_a = bind.filter) === null || _a === void 0 ? void 0 : _a.event;
                            return (bindId &&
                                ((_b = payload.ids) === null || _b === void 0 ? void 0 : _b.includes(bindId)) &&
                                (bindEvent === '*' ||
                                    (bindEvent === null || bindEvent === void 0 ? void 0 : bindEvent.toLocaleLowerCase()) ===
                                        ((_c = payload.data) === null || _c === void 0 ? void 0 : _c.type.toLocaleLowerCase())));
                        }
                        else {
                            const bindEvent = (_e = (_d = bind === null || bind === void 0 ? void 0 : bind.filter) === null || _d === void 0 ? void 0 : _d.event) === null || _e === void 0 ? void 0 : _e.toLocaleLowerCase();
                            return (bindEvent === '*' ||
                                bindEvent === ((_f = payload === null || payload === void 0 ? void 0 : payload.event) === null || _f === void 0 ? void 0 : _f.toLocaleLowerCase()));
                        }
                    }
                    else {
                        return bind.type.toLocaleLowerCase() === typeLower;
                    }
                }).map((bind) => {
                    if (typeof handledPayload === 'object' && 'ids' in handledPayload) {
                        const postgresChanges = handledPayload.data;
                        const { schema, table, commit_timestamp, type, errors } = postgresChanges;
                        const enrichedPayload = {
                            schema: schema,
                            table: table,
                            commit_timestamp: commit_timestamp,
                            eventType: type,
                            new: {},
                            old: {},
                            errors: errors,
                        };
                        handledPayload = Object.assign(Object.assign({}, enrichedPayload), this._getPayloadRecords(postgresChanges));
                    }
                    bind.callback(handledPayload, ref);
                });
            }
        }
        /** @internal */
        _isClosed() {
            return this.state === CHANNEL_STATES.closed;
        }
        /** @internal */
        _isJoined() {
            return this.state === CHANNEL_STATES.joined;
        }
        /** @internal */
        _isJoining() {
            return this.state === CHANNEL_STATES.joining;
        }
        /** @internal */
        _isLeaving() {
            return this.state === CHANNEL_STATES.leaving;
        }
        /** @internal */
        _replyEventName(ref) {
            return `chan_reply_${ref}`;
        }
        /** @internal */
        _on(type, filter, callback) {
            const typeLower = type.toLocaleLowerCase();
            const binding = {
                type: typeLower,
                filter: filter,
                callback: callback,
            };
            if (this.bindings[typeLower]) {
                this.bindings[typeLower].push(binding);
            }
            else {
                this.bindings[typeLower] = [binding];
            }
            return this;
        }
        /** @internal */
        _off(type, filter) {
            const typeLower = type.toLocaleLowerCase();
            this.bindings[typeLower] = this.bindings[typeLower].filter((bind) => {
                var _a;
                return !(((_a = bind.type) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === typeLower &&
                    RealtimeChannel.isEqual(bind.filter, filter));
            });
            return this;
        }
        /** @internal */
        static isEqual(obj1, obj2) {
            if (Object.keys(obj1).length !== Object.keys(obj2).length) {
                return false;
            }
            for (const k in obj1) {
                if (obj1[k] !== obj2[k]) {
                    return false;
                }
            }
            return true;
        }
        /** @internal */
        _rejoinUntilConnected() {
            this.rejoinTimer.scheduleTimeout();
            if (this.socket.isConnected()) {
                this._rejoin();
            }
        }
        /**
         * Registers a callback that will be executed when the channel closes.
         *
         * @internal
         */
        _onClose(callback) {
            this._on(CHANNEL_EVENTS.close, {}, callback);
        }
        /**
         * Registers a callback that will be executed when the channel encounteres an error.
         *
         * @internal
         */
        _onError(callback) {
            this._on(CHANNEL_EVENTS.error, {}, (reason) => callback(reason));
        }
        /**
         * Returns `true` if the socket is connected and the channel has been joined.
         *
         * @internal
         */
        _canPush() {
            return this.socket.isConnected() && this._isJoined();
        }
        /** @internal */
        _rejoin(timeout = this.timeout) {
            if (this._isLeaving()) {
                return;
            }
            this.socket._leaveOpenTopic(this.topic);
            this.state = CHANNEL_STATES.joining;
            this.joinPush.resend(timeout);
        }
        /** @internal */
        _getPayloadRecords(payload) {
            const records = {
                new: {},
                old: {},
            };
            if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
                records.new = convertChangeData(payload.columns, payload.record);
            }
            if (payload.type === 'UPDATE' || payload.type === 'DELETE') {
                records.old = convertChangeData(payload.columns, payload.old_record);
            }
            return records;
        }
    }

    const noop = () => { };
    const WORKER_SCRIPT = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
    class RealtimeClient {
        /**
         * Initializes the Socket.
         *
         * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
         * @param httpEndpoint The string HTTP endpoint, ie, "https://example.com", "/" (inherited host & protocol)
         * @param options.transport The Websocket Transport, for example WebSocket. This can be a custom implementation
         * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
         * @param options.params The optional params to pass when connecting.
         * @param options.headers Deprecated: headers cannot be set on websocket connections and this option will be removed in the future.
         * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
         * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
         * @param options.logLevel Sets the log level for Realtime
         * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
         * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
         * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
         * @param options.worker Use Web Worker to set a side flow. Defaults to false.
         * @param options.workerUrl The URL of the worker script. Defaults to https://realtime.supabase.com/worker.js that includes a heartbeat event call to keep the connection alive.
         */
        constructor(endPoint, options) {
            var _a;
            this.accessTokenValue = null;
            this.apiKey = null;
            this.channels = new Array();
            this.endPoint = '';
            this.httpEndpoint = '';
            /** @deprecated headers cannot be set on websocket connections */
            this.headers = {};
            this.params = {};
            this.timeout = DEFAULT_TIMEOUT;
            this.heartbeatIntervalMs = 25000;
            this.heartbeatTimer = undefined;
            this.pendingHeartbeatRef = null;
            this.heartbeatCallback = noop;
            this.ref = 0;
            this.logger = noop;
            this.conn = null;
            this.sendBuffer = [];
            this.serializer = new Serializer();
            this.stateChangeCallbacks = {
                open: [],
                close: [],
                error: [],
                message: [],
            };
            this.accessToken = null;
            /**
             * Use either custom fetch, if provided, or default fetch to make HTTP requests
             *
             * @internal
             */
            this._resolveFetch = (customFetch) => {
                let _fetch;
                if (customFetch) {
                    _fetch = customFetch;
                }
                else if (typeof fetch === 'undefined') {
                    _fetch = (...args) => Promise.resolve().then(function () { return browser; }).then(({ default: fetch }) => fetch(...args));
                }
                else {
                    _fetch = fetch;
                }
                return (...args) => _fetch(...args);
            };
            this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`;
            this.httpEndpoint = httpEndpointURL(endPoint);
            if (options === null || options === void 0 ? void 0 : options.transport) {
                this.transport = options.transport;
            }
            else {
                this.transport = null;
            }
            if (options === null || options === void 0 ? void 0 : options.params)
                this.params = options.params;
            if (options === null || options === void 0 ? void 0 : options.timeout)
                this.timeout = options.timeout;
            if (options === null || options === void 0 ? void 0 : options.logger)
                this.logger = options.logger;
            if ((options === null || options === void 0 ? void 0 : options.logLevel) || (options === null || options === void 0 ? void 0 : options.log_level)) {
                this.logLevel = options.logLevel || options.log_level;
                this.params = Object.assign(Object.assign({}, this.params), { log_level: this.logLevel });
            }
            if (options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs)
                this.heartbeatIntervalMs = options.heartbeatIntervalMs;
            const accessTokenValue = (_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.apikey;
            if (accessTokenValue) {
                this.accessTokenValue = accessTokenValue;
                this.apiKey = accessTokenValue;
            }
            this.reconnectAfterMs = (options === null || options === void 0 ? void 0 : options.reconnectAfterMs)
                ? options.reconnectAfterMs
                : (tries) => {
                    return [1000, 2000, 5000, 10000][tries - 1] || 10000;
                };
            this.encode = (options === null || options === void 0 ? void 0 : options.encode)
                ? options.encode
                : (payload, callback) => {
                    return callback(JSON.stringify(payload));
                };
            this.decode = (options === null || options === void 0 ? void 0 : options.decode)
                ? options.decode
                : this.serializer.decode.bind(this.serializer);
            this.reconnectTimer = new Timer(async () => {
                this.disconnect();
                this.connect();
            }, this.reconnectAfterMs);
            this.fetch = this._resolveFetch(options === null || options === void 0 ? void 0 : options.fetch);
            if (options === null || options === void 0 ? void 0 : options.worker) {
                if (typeof window !== 'undefined' && !window.Worker) {
                    throw new Error('Web Worker is not supported');
                }
                this.worker = (options === null || options === void 0 ? void 0 : options.worker) || false;
                this.workerUrl = options === null || options === void 0 ? void 0 : options.workerUrl;
            }
            this.accessToken = (options === null || options === void 0 ? void 0 : options.accessToken) || null;
        }
        /**
         * Connects the socket, unless already connected.
         */
        connect() {
            if (this.conn) {
                return;
            }
            if (!this.transport) {
                this.transport = WebSocket$1;
            }
            if (!this.transport) {
                throw new Error('No transport provided');
            }
            this.conn = new this.transport(this.endpointURL());
            this.setupConnection();
        }
        /**
         * Returns the URL of the websocket.
         * @returns string The URL of the websocket.
         */
        endpointURL() {
            return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: VSN }));
        }
        /**
         * Disconnects the socket.
         *
         * @param code A numeric status code to send on disconnect.
         * @param reason A custom reason for the disconnect.
         */
        disconnect(code, reason) {
            if (this.conn) {
                this.conn.onclose = function () { }; // noop
                if (code) {
                    this.conn.close(code, reason !== null && reason !== void 0 ? reason : '');
                }
                else {
                    this.conn.close();
                }
                this.conn = null;
                // remove open handles
                this.heartbeatTimer && clearInterval(this.heartbeatTimer);
                this.reconnectTimer.reset();
                this.channels.forEach((channel) => channel.teardown());
            }
        }
        /**
         * Returns all created channels
         */
        getChannels() {
            return this.channels;
        }
        /**
         * Unsubscribes and removes a single channel
         * @param channel A RealtimeChannel instance
         */
        async removeChannel(channel) {
            const status = await channel.unsubscribe();
            if (this.channels.length === 0) {
                this.disconnect();
            }
            return status;
        }
        /**
         * Unsubscribes and removes all channels
         */
        async removeAllChannels() {
            const values_1 = await Promise.all(this.channels.map((channel) => channel.unsubscribe()));
            this.channels = [];
            this.disconnect();
            return values_1;
        }
        /**
         * Logs the message.
         *
         * For customized logging, `this.logger` can be overridden.
         */
        log(kind, msg, data) {
            this.logger(kind, msg, data);
        }
        /**
         * Returns the current state of the socket.
         */
        connectionState() {
            switch (this.conn && this.conn.readyState) {
                case SOCKET_STATES.connecting:
                    return CONNECTION_STATE.Connecting;
                case SOCKET_STATES.open:
                    return CONNECTION_STATE.Open;
                case SOCKET_STATES.closing:
                    return CONNECTION_STATE.Closing;
                default:
                    return CONNECTION_STATE.Closed;
            }
        }
        /**
         * Returns `true` is the connection is open.
         */
        isConnected() {
            return this.connectionState() === CONNECTION_STATE.Open;
        }
        channel(topic, params = { config: {} }) {
            const realtimeTopic = `realtime:${topic}`;
            const exists = this.getChannels().find((c) => c.topic === realtimeTopic);
            if (!exists) {
                const chan = new RealtimeChannel(`realtime:${topic}`, params, this);
                this.channels.push(chan);
                return chan;
            }
            else {
                return exists;
            }
        }
        /**
         * Push out a message if the socket is connected.
         *
         * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
         */
        push(data) {
            const { topic, event, payload, ref } = data;
            const callback = () => {
                this.encode(data, (result) => {
                    var _a;
                    (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
                });
            };
            this.log('push', `${topic} ${event} (${ref})`, payload);
            if (this.isConnected()) {
                callback();
            }
            else {
                this.sendBuffer.push(callback);
            }
        }
        /**
         * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
         *
         * If param is null it will use the `accessToken` callback function or the token set on the client.
         *
         * On callback used, it will set the value of the token internal to the client.
         *
         * @param token A JWT string to override the token set on the client.
         */
        async setAuth(token = null) {
            let tokenToSend = token ||
                (this.accessToken && (await this.accessToken())) ||
                this.accessTokenValue;
            if (this.accessTokenValue != tokenToSend) {
                this.accessTokenValue = tokenToSend;
                this.channels.forEach((channel) => {
                    const payload = {
                        access_token: tokenToSend,
                        version: DEFAULT_VERSION,
                    };
                    tokenToSend && channel.updateJoinPayload(payload);
                    if (channel.joinedOnce && channel._isJoined()) {
                        channel._push(CHANNEL_EVENTS.access_token, {
                            access_token: tokenToSend,
                        });
                    }
                });
            }
        }
        /**
         * Sends a heartbeat message if the socket is connected.
         */
        async sendHeartbeat() {
            var _a;
            if (!this.isConnected()) {
                this.heartbeatCallback('disconnected');
                return;
            }
            if (this.pendingHeartbeatRef) {
                this.pendingHeartbeatRef = null;
                this.log('transport', 'heartbeat timeout. Attempting to re-establish connection');
                this.heartbeatCallback('timeout');
                (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(WS_CLOSE_NORMAL, 'hearbeat timeout');
                return;
            }
            this.pendingHeartbeatRef = this._makeRef();
            this.push({
                topic: 'phoenix',
                event: 'heartbeat',
                payload: {},
                ref: this.pendingHeartbeatRef,
            });
            this.heartbeatCallback('sent');
            await this.setAuth();
        }
        onHeartbeat(callback) {
            this.heartbeatCallback = callback;
        }
        /**
         * Flushes send buffer
         */
        flushSendBuffer() {
            if (this.isConnected() && this.sendBuffer.length > 0) {
                this.sendBuffer.forEach((callback) => callback());
                this.sendBuffer = [];
            }
        }
        /**
         * Return the next message ref, accounting for overflows
         *
         * @internal
         */
        _makeRef() {
            let newRef = this.ref + 1;
            if (newRef === this.ref) {
                this.ref = 0;
            }
            else {
                this.ref = newRef;
            }
            return this.ref.toString();
        }
        /**
         * Unsubscribe from channels with the specified topic.
         *
         * @internal
         */
        _leaveOpenTopic(topic) {
            let dupChannel = this.channels.find((c) => c.topic === topic && (c._isJoined() || c._isJoining()));
            if (dupChannel) {
                this.log('transport', `leaving duplicate topic "${topic}"`);
                dupChannel.unsubscribe();
            }
        }
        /**
         * Removes a subscription from the socket.
         *
         * @param channel An open subscription.
         *
         * @internal
         */
        _remove(channel) {
            this.channels = this.channels.filter((c) => c.topic !== channel.topic);
        }
        /**
         * Sets up connection handlers.
         *
         * @internal
         */
        setupConnection() {
            if (this.conn) {
                this.conn.binaryType = 'arraybuffer';
                this.conn.onopen = () => this._onConnOpen();
                this.conn.onerror = (error) => this._onConnError(error);
                this.conn.onmessage = (event) => this._onConnMessage(event);
                this.conn.onclose = (event) => this._onConnClose(event);
            }
        }
        /** @internal */
        _onConnMessage(rawMessage) {
            this.decode(rawMessage.data, (msg) => {
                let { topic, event, payload, ref } = msg;
                if (topic === 'phoenix' && event === 'phx_reply') {
                    this.heartbeatCallback(msg.payload.status == 'ok' ? 'ok' : 'error');
                }
                if (ref && ref === this.pendingHeartbeatRef) {
                    this.pendingHeartbeatRef = null;
                }
                this.log('receive', `${payload.status || ''} ${topic} ${event} ${(ref && '(' + ref + ')') || ''}`, payload);
                Array.from(this.channels)
                    .filter((channel) => channel._isMember(topic))
                    .forEach((channel) => channel._trigger(event, payload, ref));
                this.stateChangeCallbacks.message.forEach((callback) => callback(msg));
            });
        }
        /** @internal */
        _onConnOpen() {
            this.log('transport', `connected to ${this.endpointURL()}`);
            this.flushSendBuffer();
            this.reconnectTimer.reset();
            if (!this.worker) {
                this._startHeartbeat();
            }
            else {
                if (!this.workerRef) {
                    this._startWorkerHeartbeat();
                }
            }
            this.stateChangeCallbacks.open.forEach((callback) => callback());
        }
        /** @internal */
        _startHeartbeat() {
            this.heartbeatTimer && clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
        }
        /** @internal */
        _startWorkerHeartbeat() {
            if (this.workerUrl) {
                this.log('worker', `starting worker for from ${this.workerUrl}`);
            }
            else {
                this.log('worker', `starting default worker`);
            }
            const objectUrl = this._workerObjectUrl(this.workerUrl);
            this.workerRef = new Worker(objectUrl);
            this.workerRef.onerror = (error) => {
                this.log('worker', 'worker error', error.message);
                this.workerRef.terminate();
            };
            this.workerRef.onmessage = (event) => {
                if (event.data.event === 'keepAlive') {
                    this.sendHeartbeat();
                }
            };
            this.workerRef.postMessage({
                event: 'start',
                interval: this.heartbeatIntervalMs,
            });
        }
        /** @internal */
        _onConnClose(event) {
            this.log('transport', 'close', event);
            this._triggerChanError();
            this.heartbeatTimer && clearInterval(this.heartbeatTimer);
            this.reconnectTimer.scheduleTimeout();
            this.stateChangeCallbacks.close.forEach((callback) => callback(event));
        }
        /** @internal */
        _onConnError(error) {
            this.log('transport', `${error}`);
            this._triggerChanError();
            this.stateChangeCallbacks.error.forEach((callback) => callback(error));
        }
        /** @internal */
        _triggerChanError() {
            this.channels.forEach((channel) => channel._trigger(CHANNEL_EVENTS.error));
        }
        /** @internal */
        _appendParams(url, params) {
            if (Object.keys(params).length === 0) {
                return url;
            }
            const prefix = url.match(/\?/) ? '&' : '?';
            const query = new URLSearchParams(params);
            return `${url}${prefix}${query}`;
        }
        _workerObjectUrl(url) {
            let result_url;
            if (url) {
                result_url = url;
            }
            else {
                const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
                result_url = URL.createObjectURL(blob);
            }
            return result_url;
        }
    }

    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
    var inited = false;
    function init () {
      inited = true;
      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }

      revLookup['-'.charCodeAt(0)] = 62;
      revLookup['_'.charCodeAt(0)] = 63;
    }

    function toByteArray (b64) {
      if (!inited) {
        init();
      }
      var i, j, l, tmp, placeHolders, arr;
      var len = b64.length;

      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }

      // the number of equal signs (place holders)
      // if there are two placeholders, than the two characters before it
      // represent one byte
      // if there is only one, then the three characters before it represent 2 bytes
      // this is just a cheap hack to not do indexOf twice
      placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

      // base64 is 4/3 + up to two characters of the original data
      arr = new Arr(len * 3 / 4 - placeHolders);

      // if there are placeholders, only get up to the last complete 4 chars
      l = placeHolders > 0 ? len - 4 : len;

      var L = 0;

      for (i = 0, j = 0; i < l; i += 4, j += 3) {
        tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
        arr[L++] = (tmp >> 16) & 0xFF;
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      if (placeHolders === 2) {
        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
        arr[L++] = tmp & 0xFF;
      } else if (placeHolders === 1) {
        tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      return arr
    }

    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
    }

    function encodeChunk (uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
        output.push(tripletToBase64(tmp));
      }
      return output.join('')
    }

    function fromByteArray (uint8) {
      if (!inited) {
        init();
      }
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
      var output = '';
      var parts = [];
      var maxChunkLength = 16383; // must be multiple of 3

      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
      }

      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1];
        output += lookup[tmp >> 2];
        output += lookup[(tmp << 4) & 0x3F];
        output += '==';
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
        output += lookup[tmp >> 10];
        output += lookup[(tmp >> 4) & 0x3F];
        output += lookup[(tmp << 2) & 0x3F];
        output += '=';
      }

      parts.push(output);

      return parts.join('')
    }

    function read (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? (nBytes - 1) : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];

      i += d;

      e = s & ((1 << (-nBits)) - 1);
      s >>= (-nBits);
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      m = e & ((1 << (-nBits)) - 1);
      e >>= (-nBits);
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }

    function write (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
      var i = isLE ? 0 : (nBytes - 1);
      var d = isLE ? 1 : -1;
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

      e = (e << mLen) | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

      buffer[offset + i - d] |= s * 128;
    }

    var toString = {}.toString;

    var isArray = Array.isArray || function (arr) {
      return toString.call(arr) == '[object Array]';
    };

    /*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
     * @license  MIT
     */
    /* eslint-disable no-proto */


    var INSPECT_MAX_BYTES = 50;

    /**
     * If `Buffer.TYPED_ARRAY_SUPPORT`:
     *   === true    Use Uint8Array implementation (fastest)
     *   === false   Use Object implementation (most compatible, even IE6)
     *
     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
     * Opera 11.6+, iOS 4.2+.
     *
     * Due to various browser bugs, sometimes the Object implementation will be used even
     * when the browser supports typed arrays.
     *
     * Note:
     *
     *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
     *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
     *
     *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
     *
     *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
     *     incorrect length in some situations.

     * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
     * get the Object implementation, which is slower but behaves correctly.
     */
    Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
      ? global$1.TYPED_ARRAY_SUPPORT
      : true;

    /*
     * Export kMaxLength after typed array support is determined.
     */
    kMaxLength();

    function kMaxLength () {
      return Buffer.TYPED_ARRAY_SUPPORT
        ? 0x7fffffff
        : 0x3fffffff
    }

    function createBuffer (that, length) {
      if (kMaxLength() < length) {
        throw new RangeError('Invalid typed array length')
      }
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = new Uint8Array(length);
        that.__proto__ = Buffer.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        if (that === null) {
          that = new Buffer(length);
        }
        that.length = length;
      }

      return that
    }

    /**
     * The Buffer constructor returns instances of `Uint8Array` that have their
     * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
     * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
     * and the `Uint8Array` methods. Square bracket notation works as expected -- it
     * returns a single octet.
     *
     * The `Uint8Array` prototype remains unmodified.
     */

    function Buffer (arg, encodingOrOffset, length) {
      if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
        return new Buffer(arg, encodingOrOffset, length)
      }

      // Common case.
      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new Error(
            'If encoding is specified then the first argument must be a string'
          )
        }
        return allocUnsafe(this, arg)
      }
      return from(this, arg, encodingOrOffset, length)
    }

    Buffer.poolSize = 8192; // not used by this implementation

    // TODO: Legacy, not needed anymore. Remove in next major version.
    Buffer._augment = function (arr) {
      arr.__proto__ = Buffer.prototype;
      return arr
    };

    function from (that, value, encodingOrOffset, length) {
      if (typeof value === 'number') {
        throw new TypeError('"value" argument must not be a number')
      }

      if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
        return fromArrayBuffer(that, value, encodingOrOffset, length)
      }

      if (typeof value === 'string') {
        return fromString(that, value, encodingOrOffset)
      }

      return fromObject(that, value)
    }

    /**
     * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
     * if value is a number.
     * Buffer.from(str[, encoding])
     * Buffer.from(array)
     * Buffer.from(buffer)
     * Buffer.from(arrayBuffer[, byteOffset[, length]])
     **/
    Buffer.from = function (value, encodingOrOffset, length) {
      return from(null, value, encodingOrOffset, length)
    };

    if (Buffer.TYPED_ARRAY_SUPPORT) {
      Buffer.prototype.__proto__ = Uint8Array.prototype;
      Buffer.__proto__ = Uint8Array;
      if (typeof Symbol !== 'undefined' && Symbol.species &&
          Buffer[Symbol.species] === Buffer) ;
    }

    function assertSize (size) {
      if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be a number')
      } else if (size < 0) {
        throw new RangeError('"size" argument must not be negative')
      }
    }

    function alloc (that, size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(that, size)
      }
      if (fill !== undefined) {
        // Only pay attention to encoding if it's a string. This
        // prevents accidentally sending in a number that would
        // be interpretted as a start offset.
        return typeof encoding === 'string'
          ? createBuffer(that, size).fill(fill, encoding)
          : createBuffer(that, size).fill(fill)
      }
      return createBuffer(that, size)
    }

    /**
     * Creates a new filled Buffer instance.
     * alloc(size[, fill[, encoding]])
     **/
    Buffer.alloc = function (size, fill, encoding) {
      return alloc(null, size, fill, encoding)
    };

    function allocUnsafe (that, size) {
      assertSize(size);
      that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
      if (!Buffer.TYPED_ARRAY_SUPPORT) {
        for (var i = 0; i < size; ++i) {
          that[i] = 0;
        }
      }
      return that
    }

    /**
     * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
     * */
    Buffer.allocUnsafe = function (size) {
      return allocUnsafe(null, size)
    };
    /**
     * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
     */
    Buffer.allocUnsafeSlow = function (size) {
      return allocUnsafe(null, size)
    };

    function fromString (that, string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8';
      }

      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding')
      }

      var length = byteLength(string, encoding) | 0;
      that = createBuffer(that, length);

      var actual = that.write(string, encoding);

      if (actual !== length) {
        // Writing a hex string, for example, that contains invalid characters will
        // cause everything after the first invalid character to be ignored. (e.g.
        // 'abxxcd' will be treated as 'ab')
        that = that.slice(0, actual);
      }

      return that
    }

    function fromArrayLike (that, array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0;
      that = createBuffer(that, length);
      for (var i = 0; i < length; i += 1) {
        that[i] = array[i] & 255;
      }
      return that
    }

    function fromArrayBuffer (that, array, byteOffset, length) {
      array.byteLength; // this throws if `array` is not a valid ArrayBuffer

      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('\'offset\' is out of bounds')
      }

      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('\'length\' is out of bounds')
      }

      if (byteOffset === undefined && length === undefined) {
        array = new Uint8Array(array);
      } else if (length === undefined) {
        array = new Uint8Array(array, byteOffset);
      } else {
        array = new Uint8Array(array, byteOffset, length);
      }

      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = array;
        that.__proto__ = Buffer.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        that = fromArrayLike(that, array);
      }
      return that
    }

    function fromObject (that, obj) {
      if (internalIsBuffer(obj)) {
        var len = checked(obj.length) | 0;
        that = createBuffer(that, len);

        if (that.length === 0) {
          return that
        }

        obj.copy(that, 0, 0, len);
        return that
      }

      if (obj) {
        if ((typeof ArrayBuffer !== 'undefined' &&
            obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
          if (typeof obj.length !== 'number' || isnan(obj.length)) {
            return createBuffer(that, 0)
          }
          return fromArrayLike(that, obj)
        }

        if (obj.type === 'Buffer' && isArray(obj.data)) {
          return fromArrayLike(that, obj.data)
        }
      }

      throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
    }

    function checked (length) {
      // Note: cannot use `length < kMaxLength()` here because that fails when
      // length is NaN (which is otherwise coerced to zero.)
      if (length >= kMaxLength()) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                             'size: 0x' + kMaxLength().toString(16) + ' bytes')
      }
      return length | 0
    }
    Buffer.isBuffer = isBuffer;
    function internalIsBuffer (b) {
      return !!(b != null && b._isBuffer)
    }

    Buffer.compare = function compare (a, b) {
      if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
        throw new TypeError('Arguments must be Buffers')
      }

      if (a === b) return 0

      var x = a.length;
      var y = b.length;

      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    Buffer.isEncoding = function isEncoding (encoding) {
      switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'latin1':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return true
        default:
          return false
      }
    };

    Buffer.concat = function concat (list, length) {
      if (!isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }

      if (list.length === 0) {
        return Buffer.alloc(0)
      }

      var i;
      if (length === undefined) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }

      var buffer = Buffer.allocUnsafe(length);
      var pos = 0;
      for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (!internalIsBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        }
        buf.copy(buffer, pos);
        pos += buf.length;
      }
      return buffer
    };

    function byteLength (string, encoding) {
      if (internalIsBuffer(string)) {
        return string.length
      }
      if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
          (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
        return string.byteLength
      }
      if (typeof string !== 'string') {
        string = '' + string;
      }

      var len = string.length;
      if (len === 0) return 0

      // Use a for loop to avoid recursion
      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'ascii':
          case 'latin1':
          case 'binary':
            return len
          case 'utf8':
          case 'utf-8':
          case undefined:
            return utf8ToBytes(string).length
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return len * 2
          case 'hex':
            return len >>> 1
          case 'base64':
            return base64ToBytes(string).length
          default:
            if (loweredCase) return utf8ToBytes(string).length // assume utf8
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer.byteLength = byteLength;

    function slowToString (encoding, start, end) {
      var loweredCase = false;

      // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
      // property of a typed array.

      // This behaves neither like String nor Uint8Array in that we set start/end
      // to their upper/lower bounds if the value passed is out of range.
      // undefined is handled specially as per ECMA-262 6th Edition,
      // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
      if (start === undefined || start < 0) {
        start = 0;
      }
      // Return early if start > this.length. Done here to prevent potential uint32
      // coercion fail below.
      if (start > this.length) {
        return ''
      }

      if (end === undefined || end > this.length) {
        end = this.length;
      }

      if (end <= 0) {
        return ''
      }

      // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
      end >>>= 0;
      start >>>= 0;

      if (end <= start) {
        return ''
      }

      if (!encoding) encoding = 'utf8';

      while (true) {
        switch (encoding) {
          case 'hex':
            return hexSlice(this, start, end)

          case 'utf8':
          case 'utf-8':
            return utf8Slice(this, start, end)

          case 'ascii':
            return asciiSlice(this, start, end)

          case 'latin1':
          case 'binary':
            return latin1Slice(this, start, end)

          case 'base64':
            return base64Slice(this, start, end)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return utf16leSlice(this, start, end)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = (encoding + '').toLowerCase();
            loweredCase = true;
        }
      }
    }

    // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
    // Buffer instances.
    Buffer.prototype._isBuffer = true;

    function swap (b, n, m) {
      var i = b[n];
      b[n] = b[m];
      b[m] = i;
    }

    Buffer.prototype.swap16 = function swap16 () {
      var len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits')
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this
    };

    Buffer.prototype.swap32 = function swap32 () {
      var len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits')
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this
    };

    Buffer.prototype.swap64 = function swap64 () {
      var len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits')
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this
    };

    Buffer.prototype.toString = function toString () {
      var length = this.length | 0;
      if (length === 0) return ''
      if (arguments.length === 0) return utf8Slice(this, 0, length)
      return slowToString.apply(this, arguments)
    };

    Buffer.prototype.equals = function equals (b) {
      if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return true
      return Buffer.compare(this, b) === 0
    };

    Buffer.prototype.inspect = function inspect () {
      var str = '';
      var max = INSPECT_MAX_BYTES;
      if (this.length > 0) {
        str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
        if (this.length > max) str += ' ... ';
      }
      return '<Buffer ' + str + '>'
    };

    Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
      if (!internalIsBuffer(target)) {
        throw new TypeError('Argument must be a Buffer')
      }

      if (start === undefined) {
        start = 0;
      }
      if (end === undefined) {
        end = target ? target.length : 0;
      }
      if (thisStart === undefined) {
        thisStart = 0;
      }
      if (thisEnd === undefined) {
        thisEnd = this.length;
      }

      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError('out of range index')
      }

      if (thisStart >= thisEnd && start >= end) {
        return 0
      }
      if (thisStart >= thisEnd) {
        return -1
      }
      if (start >= end) {
        return 1
      }

      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;

      if (this === target) return 0

      var x = thisEnd - thisStart;
      var y = end - start;
      var len = Math.min(x, y);

      var thisCopy = this.slice(thisStart, thisEnd);
      var targetCopy = target.slice(start, end);

      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
    // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
    //
    // Arguments:
    // - buffer - a Buffer to search
    // - val - a string, Buffer, or number
    // - byteOffset - an index into `buffer`; will be clamped to an int32
    // - encoding - an optional encoding, relevant is val is a string
    // - dir - true for indexOf, false for lastIndexOf
    function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
      // Empty buffer means no match
      if (buffer.length === 0) return -1

      // Normalize byteOffset
      if (typeof byteOffset === 'string') {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 0x7fffffff) {
        byteOffset = 0x7fffffff;
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
      }
      byteOffset = +byteOffset;  // Coerce to Number.
      if (isNaN(byteOffset)) {
        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
        byteOffset = dir ? 0 : (buffer.length - 1);
      }

      // Normalize byteOffset: negative offsets start from the end of the buffer
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1
      }

      // Normalize val
      if (typeof val === 'string') {
        val = Buffer.from(val, encoding);
      }

      // Finally, search either indexOf (if dir is true) or lastIndexOf
      if (internalIsBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) {
          return -1
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
      } else if (typeof val === 'number') {
        val = val & 0xFF; // Search for a byte value [0-255]
        if (Buffer.TYPED_ARRAY_SUPPORT &&
            typeof Uint8Array.prototype.indexOf === 'function') {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
          }
        }
        return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
      }

      throw new TypeError('val must be string, number or Buffer')
    }

    function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
      var indexSize = 1;
      var arrLength = arr.length;
      var valLength = val.length;

      if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === 'ucs2' || encoding === 'ucs-2' ||
            encoding === 'utf16le' || encoding === 'utf-16le') {
          if (arr.length < 2 || val.length < 2) {
            return -1
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }

      function read (buf, i) {
        if (indexSize === 1) {
          return buf[i]
        } else {
          return buf.readUInt16BE(i * indexSize)
        }
      }

      var i;
      if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          var found = true;
          for (var j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break
            }
          }
          if (found) return i
        }
      }

      return -1
    }

    Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1
    };

    Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
    };

    Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
    };

    function hexWrite (buf, string, offset, length) {
      offset = Number(offset) || 0;
      var remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }

      // must be an even number of digits
      var strLen = string.length;
      if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

      if (length > strLen / 2) {
        length = strLen / 2;
      }
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16);
        if (isNaN(parsed)) return i
        buf[offset + i] = parsed;
      }
      return i
    }

    function utf8Write (buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
    }

    function asciiWrite (buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length)
    }

    function latin1Write (buf, string, offset, length) {
      return asciiWrite(buf, string, offset, length)
    }

    function base64Write (buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length)
    }

    function ucs2Write (buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
    }

    Buffer.prototype.write = function write (string, offset, length, encoding) {
      // Buffer#write(string)
      if (offset === undefined) {
        encoding = 'utf8';
        length = this.length;
        offset = 0;
      // Buffer#write(string, encoding)
      } else if (length === undefined && typeof offset === 'string') {
        encoding = offset;
        length = this.length;
        offset = 0;
      // Buffer#write(string, offset[, length][, encoding])
      } else if (isFinite(offset)) {
        offset = offset | 0;
        if (isFinite(length)) {
          length = length | 0;
          if (encoding === undefined) encoding = 'utf8';
        } else {
          encoding = length;
          length = undefined;
        }
      // legacy write(string, encoding, offset, length) - remove in v0.13
      } else {
        throw new Error(
          'Buffer.write(string, encoding, offset[, length]) is no longer supported'
        )
      }

      var remaining = this.length - offset;
      if (length === undefined || length > remaining) length = remaining;

      if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds')
      }

      if (!encoding) encoding = 'utf8';

      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'hex':
            return hexWrite(this, string, offset, length)

          case 'utf8':
          case 'utf-8':
            return utf8Write(this, string, offset, length)

          case 'ascii':
            return asciiWrite(this, string, offset, length)

          case 'latin1':
          case 'binary':
            return latin1Write(this, string, offset, length)

          case 'base64':
            // Warning: maxLength not taken into account in base64Write
            return base64Write(this, string, offset, length)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return ucs2Write(this, string, offset, length)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };

    Buffer.prototype.toJSON = function toJSON () {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      }
    };

    function base64Slice (buf, start, end) {
      if (start === 0 && end === buf.length) {
        return fromByteArray(buf)
      } else {
        return fromByteArray(buf.slice(start, end))
      }
    }

    function utf8Slice (buf, start, end) {
      end = Math.min(buf.length, end);
      var res = [];

      var i = start;
      while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = (firstByte > 0xEF) ? 4
          : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
          : 1;

        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint;

          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte;
              }
              break
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }

        if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
          codePoint = 0xFFFD;
          bytesPerSequence = 1;
        } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
          codePoint -= 0x10000;
          res.push(codePoint >>> 10 & 0x3FF | 0xD800);
          codePoint = 0xDC00 | codePoint & 0x3FF;
        }

        res.push(codePoint);
        i += bytesPerSequence;
      }

      return decodeCodePointsArray(res)
    }

    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
    // the lowest limit is Chrome, with 0x10000 args.
    // We go 1 magnitude less, for safety
    var MAX_ARGUMENTS_LENGTH = 0x1000;

    function decodeCodePointsArray (codePoints) {
      var len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
      }

      // Decode in chunks to avoid "call stack size exceeded".
      var res = '';
      var i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res
    }

    function asciiSlice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 0x7F);
      }
      return ret
    }

    function latin1Slice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret
    }

    function hexSlice (buf, start, end) {
      var len = buf.length;

      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;

      var out = '';
      for (var i = start; i < end; ++i) {
        out += toHex(buf[i]);
      }
      return out
    }

    function utf16leSlice (buf, start, end) {
      var bytes = buf.slice(start, end);
      var res = '';
      for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res
    }

    Buffer.prototype.slice = function slice (start, end) {
      var len = this.length;
      start = ~~start;
      end = end === undefined ? len : ~~end;

      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }

      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }

      if (end < start) end = start;

      var newBuf;
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end);
        newBuf.__proto__ = Buffer.prototype;
      } else {
        var sliceLen = end - start;
        newBuf = new Buffer(sliceLen, undefined);
        for (var i = 0; i < sliceLen; ++i) {
          newBuf[i] = this[i + start];
        }
      }

      return newBuf
    };

    /*
     * Need to make sure that buffer isn't trying to write out of bounds.
     */
    function checkOffset (offset, ext, length) {
      if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }

    Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }

      return val
    };

    Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        checkOffset(offset, byteLength, this.length);
      }

      var val = this[offset + --byteLength];
      var mul = 1;
      while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul;
      }

      return val
    };

    Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset]
    };

    Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | (this[offset + 1] << 8)
    };

    Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return (this[offset] << 8) | this[offset + 1]
    };

    Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return ((this[offset]) |
          (this[offset + 1] << 8) |
          (this[offset + 2] << 16)) +
          (this[offset + 3] * 0x1000000)
    };

    Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] * 0x1000000) +
        ((this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        this[offset + 3])
    };

    Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var i = byteLength;
      var mul = 1;
      var val = this[offset + --i];
      while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 0x80)) return (this[offset])
      return ((0xff - this[offset] + 1) * -1)
    };

    Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset] | (this[offset + 1] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | (this[offset] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
    };

    Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        (this[offset + 3])
    };

    Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, true, 23, 4)
    };

    Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, false, 23, 4)
    };

    Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, true, 52, 8)
    };

    Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, false, 52, 8)
    };

    function checkInt (buf, value, offset, ext, max, min) {
      if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
    }

    Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var mul = 1;
      var i = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var i = byteLength - 1;
      var mul = 1;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      this[offset] = (value & 0xff);
      return offset + 1
    };

    function objectWriteUInt16 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
        buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
          (littleEndian ? i : 1 - i) * 8;
      }
    }

    Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    function objectWriteUInt32 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffffffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
        buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
      }
    }

    Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset + 3] = (value >>> 24);
        this[offset + 2] = (value >>> 16);
        this[offset + 1] = (value >>> 8);
        this[offset] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = 0;
      var mul = 1;
      var sub = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = byteLength - 1;
      var mul = 1;
      var sub = 0;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -128);
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      if (value < 0) value = 0xff + value + 1;
      this[offset] = (value & 0xff);
      return offset + 1
    };

    Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -32768);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -32768);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
        this[offset + 2] = (value >>> 16);
        this[offset + 3] = (value >>> 24);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
      if (value < 0) value = 0xffffffff + value + 1;
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    function checkIEEE754 (buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
      if (offset < 0) throw new RangeError('Index out of range')
    }

    function writeFloat (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4);
      }
      write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4
    }

    Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    };

    function writeDouble (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8);
      }
      write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8
    }

    Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    };

    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function copy (target, targetStart, start, end) {
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;

      // Copy 0 bytes; we're done
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0

      // Fatal error conditions
      if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds')
      }
      if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
      if (end < 0) throw new RangeError('sourceEnd out of bounds')

      // Are we oob?
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }

      var len = end - start;
      var i;

      if (this === target && start < targetStart && targetStart < end) {
        // descending copy from end
        for (i = len - 1; i >= 0; --i) {
          target[i + targetStart] = this[i + start];
        }
      } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
        // ascending copy from start
        for (i = 0; i < len; ++i) {
          target[i + targetStart] = this[i + start];
        }
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, start + len),
          targetStart
        );
      }

      return len
    };

    // Usage:
    //    buffer.fill(number[, offset[, end]])
    //    buffer.fill(buffer[, offset[, end]])
    //    buffer.fill(string[, offset[, end]][, encoding])
    Buffer.prototype.fill = function fill (val, start, end, encoding) {
      // Handle string cases:
      if (typeof val === 'string') {
        if (typeof start === 'string') {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === 'string') {
          encoding = end;
          end = this.length;
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0);
          if (code < 256) {
            val = code;
          }
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
          throw new TypeError('encoding must be a string')
        }
        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }
      } else if (typeof val === 'number') {
        val = val & 255;
      }

      // Invalid ranges are not set to a default, so can range check early.
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index')
      }

      if (end <= start) {
        return this
      }

      start = start >>> 0;
      end = end === undefined ? this.length : end >>> 0;

      if (!val) val = 0;

      var i;
      if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        var bytes = internalIsBuffer(val)
          ? val
          : utf8ToBytes(new Buffer(val, encoding).toString());
        var len = bytes.length;
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }

      return this
    };

    // HELPER FUNCTIONS
    // ================

    var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

    function base64clean (str) {
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = stringtrim(str).replace(INVALID_BASE64_RE, '');
      // Node converts strings with length < 2 to ''
      if (str.length < 2) return ''
      // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '=';
      }
      return str
    }

    function stringtrim (str) {
      if (str.trim) return str.trim()
      return str.replace(/^\s+|\s+$/g, '')
    }

    function toHex (n) {
      if (n < 16) return '0' + n.toString(16)
      return n.toString(16)
    }

    function utf8ToBytes (string, units) {
      units = units || Infinity;
      var codePoint;
      var length = string.length;
      var leadSurrogate = null;
      var bytes = [];

      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);

        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
          if (!leadSurrogate) {
            // no lead yet
            if (codePoint > 0xDBFF) {
              // unexpected trail
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            } else if (i + 1 === length) {
              // unpaired lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            }

            // valid lead
            leadSurrogate = codePoint;

            continue
          }

          // 2 leads in a row
          if (codePoint < 0xDC00) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            leadSurrogate = codePoint;
            continue
          }

          // valid surrogate pair
          codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        }

        leadSurrogate = null;

        // encode utf8
        if (codePoint < 0x80) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint);
        } else if (codePoint < 0x800) {
          if ((units -= 2) < 0) break
          bytes.push(
            codePoint >> 0x6 | 0xC0,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x10000) {
          if ((units -= 3) < 0) break
          bytes.push(
            codePoint >> 0xC | 0xE0,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x110000) {
          if ((units -= 4) < 0) break
          bytes.push(
            codePoint >> 0x12 | 0xF0,
            codePoint >> 0xC & 0x3F | 0x80,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else {
          throw new Error('Invalid code point')
        }
      }

      return bytes
    }

    function asciiToBytes (str) {
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF);
      }
      return byteArray
    }

    function utf16leToBytes (str, units) {
      var c, hi, lo;
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break

        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }

      return byteArray
    }


    function base64ToBytes (str) {
      return toByteArray(base64clean(str))
    }

    function blitBuffer (src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if ((i + offset >= dst.length) || (i >= src.length)) break
        dst[i + offset] = src[i];
      }
      return i
    }

    function isnan (val) {
      return val !== val // eslint-disable-line no-self-compare
    }


    // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
    // The _isBuffer check is for Safari 5-7 support, because it's missing
    // Object.prototype.constructor. Remove this eventually
    function isBuffer(obj) {
      return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
    }

    function isFastBuffer (obj) {
      return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
    }

    // For Node v0.10 support. Remove this eventually.
    function isSlowBuffer (obj) {
      return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
    }

    class StorageError extends Error {
        constructor(message) {
            super(message);
            this.__isStorageError = true;
            this.name = 'StorageError';
        }
    }
    function isStorageError(error) {
        return typeof error === 'object' && error !== null && '__isStorageError' in error;
    }
    class StorageApiError extends StorageError {
        constructor(message, status) {
            super(message);
            this.name = 'StorageApiError';
            this.status = status;
        }
        toJSON() {
            return {
                name: this.name,
                message: this.message,
                status: this.status,
            };
        }
    }
    class StorageUnknownError extends StorageError {
        constructor(message, originalError) {
            super(message);
            this.name = 'StorageUnknownError';
            this.originalError = originalError;
        }
    }

    var __awaiter$6 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const resolveFetch$2 = (customFetch) => {
        let _fetch;
        if (customFetch) {
            _fetch = customFetch;
        }
        else if (typeof fetch === 'undefined') {
            _fetch = (...args) => Promise.resolve().then(function () { return browser; }).then(({ default: fetch }) => fetch(...args));
        }
        else {
            _fetch = fetch;
        }
        return (...args) => _fetch(...args);
    };
    const resolveResponse = () => __awaiter$6(void 0, void 0, void 0, function* () {
        if (typeof Response === 'undefined') {
            // @ts-ignore
            return (yield Promise.resolve().then(function () { return browser; })).Response;
        }
        return Response;
    });
    const recursiveToCamel = (item) => {
        if (Array.isArray(item)) {
            return item.map((el) => recursiveToCamel(el));
        }
        else if (typeof item === 'function' || item !== Object(item)) {
            return item;
        }
        const result = {};
        Object.entries(item).forEach(([key, value]) => {
            const newKey = key.replace(/([-_][a-z])/gi, (c) => c.toUpperCase().replace(/[-_]/g, ''));
            result[newKey] = recursiveToCamel(value);
        });
        return result;
    };

    var __awaiter$5 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const _getErrorMessage$1 = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
    const handleError$1 = (error, reject, options) => __awaiter$5(void 0, void 0, void 0, function* () {
        const Res = yield resolveResponse();
        if (error instanceof Res && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) {
            error
                .json()
                .then((err) => {
                reject(new StorageApiError(_getErrorMessage$1(err), error.status || 500));
            })
                .catch((err) => {
                reject(new StorageUnknownError(_getErrorMessage$1(err), err));
            });
        }
        else {
            reject(new StorageUnknownError(_getErrorMessage$1(error), error));
        }
    });
    const _getRequestParams$1 = (method, options, parameters, body) => {
        const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
        if (method === 'GET') {
            return params;
        }
        params.headers = Object.assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers);
        if (body) {
            params.body = JSON.stringify(body);
        }
        return Object.assign(Object.assign({}, params), parameters);
    };
    function _handleRequest$1(fetcher, method, url, options, parameters, body) {
        return __awaiter$5(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fetcher(url, _getRequestParams$1(method, options, parameters, body))
                    .then((result) => {
                    if (!result.ok)
                        throw result;
                    if (options === null || options === void 0 ? void 0 : options.noResolveJson)
                        return result;
                    return result.json();
                })
                    .then((data) => resolve(data))
                    .catch((error) => handleError$1(error, reject, options));
            });
        });
    }
    function get(fetcher, url, options, parameters) {
        return __awaiter$5(this, void 0, void 0, function* () {
            return _handleRequest$1(fetcher, 'GET', url, options, parameters);
        });
    }
    function post(fetcher, url, body, options, parameters) {
        return __awaiter$5(this, void 0, void 0, function* () {
            return _handleRequest$1(fetcher, 'POST', url, options, parameters, body);
        });
    }
    function put(fetcher, url, body, options, parameters) {
        return __awaiter$5(this, void 0, void 0, function* () {
            return _handleRequest$1(fetcher, 'PUT', url, options, parameters, body);
        });
    }
    function head(fetcher, url, options, parameters) {
        return __awaiter$5(this, void 0, void 0, function* () {
            return _handleRequest$1(fetcher, 'HEAD', url, Object.assign(Object.assign({}, options), { noResolveJson: true }), parameters);
        });
    }
    function remove(fetcher, url, body, options, parameters) {
        return __awaiter$5(this, void 0, void 0, function* () {
            return _handleRequest$1(fetcher, 'DELETE', url, options, parameters, body);
        });
    }

    var __awaiter$4 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const DEFAULT_SEARCH_OPTIONS = {
        limit: 100,
        offset: 0,
        sortBy: {
            column: 'name',
            order: 'asc',
        },
    };
    const DEFAULT_FILE_OPTIONS = {
        cacheControl: '3600',
        contentType: 'text/plain;charset=UTF-8',
        upsert: false,
    };
    class StorageFileApi {
        constructor(url, headers = {}, bucketId, fetch) {
            this.url = url;
            this.headers = headers;
            this.bucketId = bucketId;
            this.fetch = resolveFetch$2(fetch);
        }
        /**
         * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
         *
         * @param method HTTP method.
         * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
         * @param fileBody The body of the file to be stored in the bucket.
         */
        uploadOrUpdate(method, path, fileBody, fileOptions) {
            return __awaiter$4(this, void 0, void 0, function* () {
                try {
                    let body;
                    const options = Object.assign(Object.assign({}, DEFAULT_FILE_OPTIONS), fileOptions);
                    let headers = Object.assign(Object.assign({}, this.headers), (method === 'POST' && { 'x-upsert': String(options.upsert) }));
                    const metadata = options.metadata;
                    if (typeof Blob !== 'undefined' && fileBody instanceof Blob) {
                        body = new FormData();
                        body.append('cacheControl', options.cacheControl);
                        if (metadata) {
                            body.append('metadata', this.encodeMetadata(metadata));
                        }
                        body.append('', fileBody);
                    }
                    else if (typeof FormData !== 'undefined' && fileBody instanceof FormData) {
                        body = fileBody;
                        body.append('cacheControl', options.cacheControl);
                        if (metadata) {
                            body.append('metadata', this.encodeMetadata(metadata));
                        }
                    }
                    else {
                        body = fileBody;
                        headers['cache-control'] = `max-age=${options.cacheControl}`;
                        headers['content-type'] = options.contentType;
                        if (metadata) {
                            headers['x-metadata'] = this.toBase64(this.encodeMetadata(metadata));
                        }
                    }
                    if (fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.headers) {
                        headers = Object.assign(Object.assign({}, headers), fileOptions.headers);
                    }
                    const cleanPath = this._removeEmptyFolders(path);
                    const _path = this._getFinalPath(cleanPath);
                    const res = yield this.fetch(`${this.url}/object/${_path}`, Object.assign({ method, body: body, headers }, ((options === null || options === void 0 ? void 0 : options.duplex) ? { duplex: options.duplex } : {})));
                    const data = yield res.json();
                    if (res.ok) {
                        return {
                            data: { path: cleanPath, id: data.Id, fullPath: data.Key },
                            error: null,
                        };
                    }
                    else {
                        const error = data;
                        return { data: null, error };
                    }
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Uploads a file to an existing bucket.
         *
         * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
         * @param fileBody The body of the file to be stored in the bucket.
         */
        upload(path, fileBody, fileOptions) {
            return __awaiter$4(this, void 0, void 0, function* () {
                return this.uploadOrUpdate('POST', path, fileBody, fileOptions);
            });
        }
        /**
         * Upload a file with a token generated from `createSignedUploadUrl`.
         * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
         * @param token The token generated from `createSignedUploadUrl`
         * @param fileBody The body of the file to be stored in the bucket.
         */
        uploadToSignedUrl(path, token, fileBody, fileOptions) {
            return __awaiter$4(this, void 0, void 0, function* () {
                const cleanPath = this._removeEmptyFolders(path);
                const _path = this._getFinalPath(cleanPath);
                const url = new URL(this.url + `/object/upload/sign/${_path}`);
                url.searchParams.set('token', token);
                try {
                    let body;
                    const options = Object.assign({ upsert: DEFAULT_FILE_OPTIONS.upsert }, fileOptions);
                    const headers = Object.assign(Object.assign({}, this.headers), { 'x-upsert': String(options.upsert) });
                    if (typeof Blob !== 'undefined' && fileBody instanceof Blob) {
                        body = new FormData();
                        body.append('cacheControl', options.cacheControl);
                        body.append('', fileBody);
                    }
                    else if (typeof FormData !== 'undefined' && fileBody instanceof FormData) {
                        body = fileBody;
                        body.append('cacheControl', options.cacheControl);
                    }
                    else {
                        body = fileBody;
                        headers['cache-control'] = `max-age=${options.cacheControl}`;
                        headers['content-type'] = options.contentType;
                    }
                    const res = yield this.fetch(url.toString(), {
                        method: 'PUT',
                        body: body,
                        headers,
                    });
                    const data = yield res.json();
                    if (res.ok) {
                        return {
                            data: { path: cleanPath, fullPath: data.Key },
                            error: null,
                        };
                    }
                    else {
                        const error = data;
                        return { data: null, error };
                    }
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Creates a signed upload URL.
         * Signed upload URLs can be used to upload files to the bucket without further authentication.
         * They are valid for 2 hours.
         * @param path The file path, including the current file name. For example `folder/image.png`.
         * @param options.upsert If set to true, allows the file to be overwritten if it already exists.
         */
        createSignedUploadUrl(path, options) {
            return __awaiter$4(this, void 0, void 0, function* () {
                try {
                    let _path = this._getFinalPath(path);
                    const headers = Object.assign({}, this.headers);
                    if (options === null || options === void 0 ? void 0 : options.upsert) {
                        headers['x-upsert'] = 'true';
                    }
                    const data = yield post(this.fetch, `${this.url}/object/upload/sign/${_path}`, {}, { headers });
                    const url = new URL(this.url + data.url);
                    const token = url.searchParams.get('token');
                    if (!token) {
                        throw new StorageError('No token returned by API');
                    }
                    return { data: { signedUrl: url.toString(), path, token }, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Replaces an existing file at the specified path with a new one.
         *
         * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
         * @param fileBody The body of the file to be stored in the bucket.
         */
        update(path, fileBody, fileOptions) {
            return __awaiter$4(this, void 0, void 0, function* () {
                return this.uploadOrUpdate('PUT', path, fileBody, fileOptions);
            });
        }
        /**
         * Moves an existing file to a new path in the same bucket.
         *
         * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
         * @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
         * @param options The destination options.
         */
        move(fromPath, toPath, options) {
            return __awaiter$4(this, void 0, void 0, function* () {
                try {
                    const data = yield post(this.fetch, `${this.url}/object/move`, {
                        bucketId: this.bucketId,
                        sourceKey: fromPath,
                        destinationKey: toPath,
                        destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket,
                    }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Copies an existing file to a new path in the same bucket.
         *
         * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
         * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
         * @param options The destination options.
         */
        copy(fromPath, toPath, options) {
            return __awaiter$4(this, void 0, void 0, function* () {
                try {
                    const data = yield post(this.fetch, `${this.url}/object/copy`, {
                        bucketId: this.bucketId,
                        sourceKey: fromPath,
                        destinationKey: toPath,
                        destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket,
                    }, { headers: this.headers });
                    return { data: { path: data.Key }, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
         *
         * @param path The file path, including the current file name. For example `folder/image.png`.
         * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
         * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
         * @param options.transform Transform the asset before serving it to the client.
         */
        createSignedUrl(path, expiresIn, options) {
            return __awaiter$4(this, void 0, void 0, function* () {
                try {
                    let _path = this._getFinalPath(path);
                    let data = yield post(this.fetch, `${this.url}/object/sign/${_path}`, Object.assign({ expiresIn }, ((options === null || options === void 0 ? void 0 : options.transform) ? { transform: options.transform } : {})), { headers: this.headers });
                    const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download)
                        ? `&download=${options.download === true ? '' : options.download}`
                        : '';
                    const signedUrl = encodeURI(`${this.url}${data.signedURL}${downloadQueryParam}`);
                    data = { signedUrl };
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
         *
         * @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
         * @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
         * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
         */
        createSignedUrls(paths, expiresIn, options) {
            return __awaiter$4(this, void 0, void 0, function* () {
                try {
                    const data = yield post(this.fetch, `${this.url}/object/sign/${this.bucketId}`, { expiresIn, paths }, { headers: this.headers });
                    const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download)
                        ? `&download=${options.download === true ? '' : options.download}`
                        : '';
                    return {
                        data: data.map((datum) => (Object.assign(Object.assign({}, datum), { signedUrl: datum.signedURL
                                ? encodeURI(`${this.url}${datum.signedURL}${downloadQueryParam}`)
                                : null }))),
                        error: null,
                    };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
         *
         * @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
         * @param options.transform Transform the asset before serving it to the client.
         */
        download(path, options) {
            return __awaiter$4(this, void 0, void 0, function* () {
                const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== 'undefined';
                const renderPath = wantsTransformation ? 'render/image/authenticated' : 'object';
                const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
                const queryString = transformationQuery ? `?${transformationQuery}` : '';
                try {
                    const _path = this._getFinalPath(path);
                    const res = yield get(this.fetch, `${this.url}/${renderPath}/${_path}${queryString}`, {
                        headers: this.headers,
                        noResolveJson: true,
                    });
                    const data = yield res.blob();
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Retrieves the details of an existing file.
         * @param path
         */
        info(path) {
            return __awaiter$4(this, void 0, void 0, function* () {
                const _path = this._getFinalPath(path);
                try {
                    const data = yield get(this.fetch, `${this.url}/object/info/${_path}`, {
                        headers: this.headers,
                    });
                    return { data: recursiveToCamel(data), error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Checks the existence of a file.
         * @param path
         */
        exists(path) {
            return __awaiter$4(this, void 0, void 0, function* () {
                const _path = this._getFinalPath(path);
                try {
                    yield head(this.fetch, `${this.url}/object/${_path}`, {
                        headers: this.headers,
                    });
                    return { data: true, error: null };
                }
                catch (error) {
                    if (isStorageError(error) && error instanceof StorageUnknownError) {
                        const originalError = error.originalError;
                        if ([400, 404].includes(originalError === null || originalError === void 0 ? void 0 : originalError.status)) {
                            return { data: false, error };
                        }
                    }
                    throw error;
                }
            });
        }
        /**
         * A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
         * This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
         *
         * @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
         * @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
         * @param options.transform Transform the asset before serving it to the client.
         */
        getPublicUrl(path, options) {
            const _path = this._getFinalPath(path);
            const _queryString = [];
            const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download)
                ? `download=${options.download === true ? '' : options.download}`
                : '';
            if (downloadQueryParam !== '') {
                _queryString.push(downloadQueryParam);
            }
            const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== 'undefined';
            const renderPath = wantsTransformation ? 'render/image' : 'object';
            const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
            if (transformationQuery !== '') {
                _queryString.push(transformationQuery);
            }
            let queryString = _queryString.join('&');
            if (queryString !== '') {
                queryString = `?${queryString}`;
            }
            return {
                data: { publicUrl: encodeURI(`${this.url}/${renderPath}/public/${_path}${queryString}`) },
            };
        }
        /**
         * Deletes files within the same bucket
         *
         * @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
         */
        remove(paths) {
            return __awaiter$4(this, void 0, void 0, function* () {
                try {
                    const data = yield remove(this.fetch, `${this.url}/object/${this.bucketId}`, { prefixes: paths }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Get file metadata
         * @param id the file id to retrieve metadata
         */
        // async getMetadata(
        //   id: string
        // ): Promise<
        //   | {
        //       data: Metadata
        //       error: null
        //     }
        //   | {
        //       data: null
        //       error: StorageError
        //     }
        // > {
        //   try {
        //     const data = await get(this.fetch, `${this.url}/metadata/${id}`, { headers: this.headers })
        //     return { data, error: null }
        //   } catch (error) {
        //     if (isStorageError(error)) {
        //       return { data: null, error }
        //     }
        //     throw error
        //   }
        // }
        /**
         * Update file metadata
         * @param id the file id to update metadata
         * @param meta the new file metadata
         */
        // async updateMetadata(
        //   id: string,
        //   meta: Metadata
        // ): Promise<
        //   | {
        //       data: Metadata
        //       error: null
        //     }
        //   | {
        //       data: null
        //       error: StorageError
        //     }
        // > {
        //   try {
        //     const data = await post(
        //       this.fetch,
        //       `${this.url}/metadata/${id}`,
        //       { ...meta },
        //       { headers: this.headers }
        //     )
        //     return { data, error: null }
        //   } catch (error) {
        //     if (isStorageError(error)) {
        //       return { data: null, error }
        //     }
        //     throw error
        //   }
        // }
        /**
         * Lists all the files within a bucket.
         * @param path The folder path.
         */
        list(path, options, parameters) {
            return __awaiter$4(this, void 0, void 0, function* () {
                try {
                    const body = Object.assign(Object.assign(Object.assign({}, DEFAULT_SEARCH_OPTIONS), options), { prefix: path || '' });
                    const data = yield post(this.fetch, `${this.url}/object/list/${this.bucketId}`, body, { headers: this.headers }, parameters);
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        encodeMetadata(metadata) {
            return JSON.stringify(metadata);
        }
        toBase64(data) {
            if (typeof Buffer !== 'undefined') {
                return Buffer.from(data).toString('base64');
            }
            return btoa(data);
        }
        _getFinalPath(path) {
            return `${this.bucketId}/${path}`;
        }
        _removeEmptyFolders(path) {
            return path.replace(/^\/|\/$/g, '').replace(/\/+/g, '/');
        }
        transformOptsToQueryString(transform) {
            const params = [];
            if (transform.width) {
                params.push(`width=${transform.width}`);
            }
            if (transform.height) {
                params.push(`height=${transform.height}`);
            }
            if (transform.resize) {
                params.push(`resize=${transform.resize}`);
            }
            if (transform.format) {
                params.push(`format=${transform.format}`);
            }
            if (transform.quality) {
                params.push(`quality=${transform.quality}`);
            }
            return params.join('&');
        }
    }

    // generated by genversion
    const version$2 = '2.7.1';

    const DEFAULT_HEADERS$2 = { 'X-Client-Info': `storage-js/${version$2}` };

    var __awaiter$3 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class StorageBucketApi {
        constructor(url, headers = {}, fetch) {
            this.url = url;
            this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$2), headers);
            this.fetch = resolveFetch$2(fetch);
        }
        /**
         * Retrieves the details of all Storage buckets within an existing project.
         */
        listBuckets() {
            return __awaiter$3(this, void 0, void 0, function* () {
                try {
                    const data = yield get(this.fetch, `${this.url}/bucket`, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Retrieves the details of an existing Storage bucket.
         *
         * @param id The unique identifier of the bucket you would like to retrieve.
         */
        getBucket(id) {
            return __awaiter$3(this, void 0, void 0, function* () {
                try {
                    const data = yield get(this.fetch, `${this.url}/bucket/${id}`, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Creates a new Storage bucket
         *
         * @param id A unique identifier for the bucket you are creating.
         * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
         * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
         * The global file size limit takes precedence over this value.
         * The default value is null, which doesn't set a per bucket file size limit.
         * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
         * The default value is null, which allows files with all mime types to be uploaded.
         * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
         * @returns newly created bucket id
         */
        createBucket(id, options = {
            public: false,
        }) {
            return __awaiter$3(this, void 0, void 0, function* () {
                try {
                    const data = yield post(this.fetch, `${this.url}/bucket`, {
                        id,
                        name: id,
                        public: options.public,
                        file_size_limit: options.fileSizeLimit,
                        allowed_mime_types: options.allowedMimeTypes,
                    }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Updates a Storage bucket
         *
         * @param id A unique identifier for the bucket you are updating.
         * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
         * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
         * The global file size limit takes precedence over this value.
         * The default value is null, which doesn't set a per bucket file size limit.
         * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
         * The default value is null, which allows files with all mime types to be uploaded.
         * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
         */
        updateBucket(id, options) {
            return __awaiter$3(this, void 0, void 0, function* () {
                try {
                    const data = yield put(this.fetch, `${this.url}/bucket/${id}`, {
                        id,
                        name: id,
                        public: options.public,
                        file_size_limit: options.fileSizeLimit,
                        allowed_mime_types: options.allowedMimeTypes,
                    }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Removes all objects inside a single bucket.
         *
         * @param id The unique identifier of the bucket you would like to empty.
         */
        emptyBucket(id) {
            return __awaiter$3(this, void 0, void 0, function* () {
                try {
                    const data = yield post(this.fetch, `${this.url}/bucket/${id}/empty`, {}, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
         * You must first `empty()` the bucket.
         *
         * @param id The unique identifier of the bucket you would like to delete.
         */
        deleteBucket(id) {
            return __awaiter$3(this, void 0, void 0, function* () {
                try {
                    const data = yield remove(this.fetch, `${this.url}/bucket/${id}`, {}, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
    }

    class StorageClient extends StorageBucketApi {
        constructor(url, headers = {}, fetch) {
            super(url, headers, fetch);
        }
        /**
         * Perform file operation in a bucket.
         *
         * @param id The bucket id to operate on.
         */
        from(id) {
            return new StorageFileApi(this.url, this.headers, id, this.fetch);
        }
    }

    const version$1 = '2.50.3';

    let JS_ENV = '';
    // @ts-ignore
    if (typeof Deno !== 'undefined') {
        JS_ENV = 'deno';
    }
    else if (typeof document !== 'undefined') {
        JS_ENV = 'web';
    }
    else if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        JS_ENV = 'react-native';
    }
    else {
        JS_ENV = 'node';
    }
    const DEFAULT_HEADERS$1 = { 'X-Client-Info': `supabase-js-${JS_ENV}/${version$1}` };
    const DEFAULT_GLOBAL_OPTIONS = {
        headers: DEFAULT_HEADERS$1,
    };
    const DEFAULT_DB_OPTIONS = {
        schema: 'public',
    };
    const DEFAULT_AUTH_OPTIONS = {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'implicit',
    };
    const DEFAULT_REALTIME_OPTIONS = {};

    var __awaiter$2 = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const resolveFetch$1 = (customFetch) => {
        let _fetch;
        if (customFetch) {
            _fetch = customFetch;
        }
        else if (typeof fetch === 'undefined') {
            _fetch = nodeFetch;
        }
        else {
            _fetch = fetch;
        }
        return (...args) => _fetch(...args);
    };
    const resolveHeadersConstructor = () => {
        if (typeof Headers === 'undefined') {
            return Headers$1;
        }
        return Headers;
    };
    const fetchWithAuth = (supabaseKey, getAccessToken, customFetch) => {
        const fetch = resolveFetch$1(customFetch);
        const HeadersConstructor = resolveHeadersConstructor();
        return (input, init) => __awaiter$2(void 0, void 0, void 0, function* () {
            var _a;
            const accessToken = (_a = (yield getAccessToken())) !== null && _a !== void 0 ? _a : supabaseKey;
            let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
            if (!headers.has('apikey')) {
                headers.set('apikey', supabaseKey);
            }
            if (!headers.has('Authorization')) {
                headers.set('Authorization', `Bearer ${accessToken}`);
            }
            return fetch(input, Object.assign(Object.assign({}, init), { headers }));
        });
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
    function ensureTrailingSlash(url) {
        return url.endsWith('/') ? url : url + '/';
    }
    function applySettingDefaults(options, defaults) {
        var _a, _b;
        const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions, } = options;
        const { db: DEFAULT_DB_OPTIONS, auth: DEFAULT_AUTH_OPTIONS, realtime: DEFAULT_REALTIME_OPTIONS, global: DEFAULT_GLOBAL_OPTIONS, } = defaults;
        const result = {
            db: Object.assign(Object.assign({}, DEFAULT_DB_OPTIONS), dbOptions),
            auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), authOptions),
            realtime: Object.assign(Object.assign({}, DEFAULT_REALTIME_OPTIONS), realtimeOptions),
            global: Object.assign(Object.assign(Object.assign({}, DEFAULT_GLOBAL_OPTIONS), globalOptions), { headers: Object.assign(Object.assign({}, ((_a = DEFAULT_GLOBAL_OPTIONS === null || DEFAULT_GLOBAL_OPTIONS === void 0 ? void 0 : DEFAULT_GLOBAL_OPTIONS.headers) !== null && _a !== void 0 ? _a : {})), ((_b = globalOptions === null || globalOptions === void 0 ? void 0 : globalOptions.headers) !== null && _b !== void 0 ? _b : {})) }),
            accessToken: () => __awaiter$1(this, void 0, void 0, function* () { return ''; }),
        };
        if (options.accessToken) {
            result.accessToken = options.accessToken;
        }
        else {
            // hack around Required<>
            delete result.accessToken;
        }
        return result;
    }

    const version = '2.70.0';

    /** Current session will be checked for refresh at this interval. */
    const AUTO_REFRESH_TICK_DURATION_MS = 30 * 1000;
    /**
     * A token refresh will be attempted this many ticks before the current session expires. */
    const AUTO_REFRESH_TICK_THRESHOLD = 3;
    /*
     * Earliest time before an access token expires that the session should be refreshed.
     */
    const EXPIRY_MARGIN_MS = AUTO_REFRESH_TICK_THRESHOLD * AUTO_REFRESH_TICK_DURATION_MS;
    const GOTRUE_URL = 'http://localhost:9999';
    const STORAGE_KEY = 'supabase.auth.token';
    const DEFAULT_HEADERS = { 'X-Client-Info': `gotrue-js/${version}` };
    const API_VERSION_HEADER_NAME = 'X-Supabase-Api-Version';
    const API_VERSIONS = {
        '2024-01-01': {
            timestamp: Date.parse('2024-01-01T00:00:00.0Z'),
            name: '2024-01-01',
        },
    };
    const BASE64URL_REGEX = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i;
    const JWKS_TTL = 600000; // 10 minutes

    class AuthError extends Error {
        constructor(message, status, code) {
            super(message);
            this.__isAuthError = true;
            this.name = 'AuthError';
            this.status = status;
            this.code = code;
        }
    }
    function isAuthError(error) {
        return typeof error === 'object' && error !== null && '__isAuthError' in error;
    }
    class AuthApiError extends AuthError {
        constructor(message, status, code) {
            super(message, status, code);
            this.name = 'AuthApiError';
            this.status = status;
            this.code = code;
        }
    }
    function isAuthApiError(error) {
        return isAuthError(error) && error.name === 'AuthApiError';
    }
    class AuthUnknownError extends AuthError {
        constructor(message, originalError) {
            super(message);
            this.name = 'AuthUnknownError';
            this.originalError = originalError;
        }
    }
    class CustomAuthError extends AuthError {
        constructor(message, name, status, code) {
            super(message, status, code);
            this.name = name;
            this.status = status;
        }
    }
    class AuthSessionMissingError extends CustomAuthError {
        constructor() {
            super('Auth session missing!', 'AuthSessionMissingError', 400, undefined);
        }
    }
    function isAuthSessionMissingError(error) {
        return isAuthError(error) && error.name === 'AuthSessionMissingError';
    }
    class AuthInvalidTokenResponseError extends CustomAuthError {
        constructor() {
            super('Auth session or user missing', 'AuthInvalidTokenResponseError', 500, undefined);
        }
    }
    class AuthInvalidCredentialsError extends CustomAuthError {
        constructor(message) {
            super(message, 'AuthInvalidCredentialsError', 400, undefined);
        }
    }
    class AuthImplicitGrantRedirectError extends CustomAuthError {
        constructor(message, details = null) {
            super(message, 'AuthImplicitGrantRedirectError', 500, undefined);
            this.details = null;
            this.details = details;
        }
        toJSON() {
            return {
                name: this.name,
                message: this.message,
                status: this.status,
                details: this.details,
            };
        }
    }
    function isAuthImplicitGrantRedirectError(error) {
        return isAuthError(error) && error.name === 'AuthImplicitGrantRedirectError';
    }
    class AuthPKCEGrantCodeExchangeError extends CustomAuthError {
        constructor(message, details = null) {
            super(message, 'AuthPKCEGrantCodeExchangeError', 500, undefined);
            this.details = null;
            this.details = details;
        }
        toJSON() {
            return {
                name: this.name,
                message: this.message,
                status: this.status,
                details: this.details,
            };
        }
    }
    class AuthRetryableFetchError extends CustomAuthError {
        constructor(message, status) {
            super(message, 'AuthRetryableFetchError', status, undefined);
        }
    }
    function isAuthRetryableFetchError(error) {
        return isAuthError(error) && error.name === 'AuthRetryableFetchError';
    }
    /**
     * This error is thrown on certain methods when the password used is deemed
     * weak. Inspect the reasons to identify what password strength rules are
     * inadequate.
     */
    class AuthWeakPasswordError extends CustomAuthError {
        constructor(message, status, reasons) {
            super(message, 'AuthWeakPasswordError', status, 'weak_password');
            this.reasons = reasons;
        }
    }
    function isAuthWeakPasswordError(error) {
        return isAuthError(error) && error.name === 'AuthWeakPasswordError';
    }
    class AuthInvalidJwtError extends CustomAuthError {
        constructor(message) {
            super(message, 'AuthInvalidJwtError', 400, 'invalid_jwt');
        }
    }

    /**
     * Avoid modifying this file. It's part of
     * https://github.com/supabase-community/base64url-js.  Submit all fixes on
     * that repo!
     */
    /**
     * An array of characters that encode 6 bits into a Base64-URL alphabet
     * character.
     */
    const TO_BASE64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split('');
    /**
     * An array of characters that can appear in a Base64-URL encoded string but
     * should be ignored.
     */
    const IGNORE_BASE64URL = ' \t\n\r='.split('');
    /**
     * An array of 128 numbers that map a Base64-URL character to 6 bits, or if -2
     * used to skip the character, or if -1 used to error out.
     */
    const FROM_BASE64URL = (() => {
        const charMap = new Array(128);
        for (let i = 0; i < charMap.length; i += 1) {
            charMap[i] = -1;
        }
        for (let i = 0; i < IGNORE_BASE64URL.length; i += 1) {
            charMap[IGNORE_BASE64URL[i].charCodeAt(0)] = -2;
        }
        for (let i = 0; i < TO_BASE64URL.length; i += 1) {
            charMap[TO_BASE64URL[i].charCodeAt(0)] = i;
        }
        return charMap;
    })();
    /**
     * Converts a byte to a Base64-URL string.
     *
     * @param byte The byte to convert, or null to flush at the end of the byte sequence.
     * @param state The Base64 conversion state. Pass an initial value of `{ queue: 0, queuedBits: 0 }`.
     * @param emit A function called with the next Base64 character when ready.
     */
    function byteToBase64URL(byte, state, emit) {
        if (byte !== null) {
            state.queue = (state.queue << 8) | byte;
            state.queuedBits += 8;
            while (state.queuedBits >= 6) {
                const pos = (state.queue >> (state.queuedBits - 6)) & 63;
                emit(TO_BASE64URL[pos]);
                state.queuedBits -= 6;
            }
        }
        else if (state.queuedBits > 0) {
            state.queue = state.queue << (6 - state.queuedBits);
            state.queuedBits = 6;
            while (state.queuedBits >= 6) {
                const pos = (state.queue >> (state.queuedBits - 6)) & 63;
                emit(TO_BASE64URL[pos]);
                state.queuedBits -= 6;
            }
        }
    }
    /**
     * Converts a String char code (extracted using `string.charCodeAt(position)`) to a sequence of Base64-URL characters.
     *
     * @param charCode The char code of the JavaScript string.
     * @param state The Base64 state. Pass an initial value of `{ queue: 0, queuedBits: 0 }`.
     * @param emit A function called with the next byte.
     */
    function byteFromBase64URL(charCode, state, emit) {
        const bits = FROM_BASE64URL[charCode];
        if (bits > -1) {
            // valid Base64-URL character
            state.queue = (state.queue << 6) | bits;
            state.queuedBits += 6;
            while (state.queuedBits >= 8) {
                emit((state.queue >> (state.queuedBits - 8)) & 0xff);
                state.queuedBits -= 8;
            }
        }
        else if (bits === -2) {
            // ignore spaces, tabs, newlines, =
            return;
        }
        else {
            throw new Error(`Invalid Base64-URL character "${String.fromCharCode(charCode)}"`);
        }
    }
    /**
     * Converts a Base64-URL encoded string into a JavaScript string. It is assumed
     * that the underlying string has been encoded as UTF-8.
     *
     * @param str The Base64-URL encoded string.
     */
    function stringFromBase64URL(str) {
        const conv = [];
        const utf8Emit = (codepoint) => {
            conv.push(String.fromCodePoint(codepoint));
        };
        const utf8State = {
            utf8seq: 0,
            codepoint: 0,
        };
        const b64State = { queue: 0, queuedBits: 0 };
        const byteEmit = (byte) => {
            stringFromUTF8(byte, utf8State, utf8Emit);
        };
        for (let i = 0; i < str.length; i += 1) {
            byteFromBase64URL(str.charCodeAt(i), b64State, byteEmit);
        }
        return conv.join('');
    }
    /**
     * Converts a Unicode codepoint to a multi-byte UTF-8 sequence.
     *
     * @param codepoint The Unicode codepoint.
     * @param emit      Function which will be called for each UTF-8 byte that represents the codepoint.
     */
    function codepointToUTF8(codepoint, emit) {
        if (codepoint <= 0x7f) {
            emit(codepoint);
            return;
        }
        else if (codepoint <= 0x7ff) {
            emit(0xc0 | (codepoint >> 6));
            emit(0x80 | (codepoint & 0x3f));
            return;
        }
        else if (codepoint <= 0xffff) {
            emit(0xe0 | (codepoint >> 12));
            emit(0x80 | ((codepoint >> 6) & 0x3f));
            emit(0x80 | (codepoint & 0x3f));
            return;
        }
        else if (codepoint <= 0x10ffff) {
            emit(0xf0 | (codepoint >> 18));
            emit(0x80 | ((codepoint >> 12) & 0x3f));
            emit(0x80 | ((codepoint >> 6) & 0x3f));
            emit(0x80 | (codepoint & 0x3f));
            return;
        }
        throw new Error(`Unrecognized Unicode codepoint: ${codepoint.toString(16)}`);
    }
    /**
     * Converts a JavaScript string to a sequence of UTF-8 bytes.
     *
     * @param str  The string to convert to UTF-8.
     * @param emit Function which will be called for each UTF-8 byte of the string.
     */
    function stringToUTF8(str, emit) {
        for (let i = 0; i < str.length; i += 1) {
            let codepoint = str.charCodeAt(i);
            if (codepoint > 0xd7ff && codepoint <= 0xdbff) {
                // most UTF-16 codepoints are Unicode codepoints, except values in this
                // range where the next UTF-16 codepoint needs to be combined with the
                // current one to get the Unicode codepoint
                const highSurrogate = ((codepoint - 0xd800) * 0x400) & 0xffff;
                const lowSurrogate = (str.charCodeAt(i + 1) - 0xdc00) & 0xffff;
                codepoint = (lowSurrogate | highSurrogate) + 0x10000;
                i += 1;
            }
            codepointToUTF8(codepoint, emit);
        }
    }
    /**
     * Converts a UTF-8 byte to a Unicode codepoint.
     *
     * @param byte  The UTF-8 byte next in the sequence.
     * @param state The shared state between consecutive UTF-8 bytes in the
     *              sequence, an object with the shape `{ utf8seq: 0, codepoint: 0 }`.
     * @param emit  Function which will be called for each codepoint.
     */
    function stringFromUTF8(byte, state, emit) {
        if (state.utf8seq === 0) {
            if (byte <= 0x7f) {
                emit(byte);
                return;
            }
            // count the number of 1 leading bits until you reach 0
            for (let leadingBit = 1; leadingBit < 6; leadingBit += 1) {
                if (((byte >> (7 - leadingBit)) & 1) === 0) {
                    state.utf8seq = leadingBit;
                    break;
                }
            }
            if (state.utf8seq === 2) {
                state.codepoint = byte & 31;
            }
            else if (state.utf8seq === 3) {
                state.codepoint = byte & 15;
            }
            else if (state.utf8seq === 4) {
                state.codepoint = byte & 7;
            }
            else {
                throw new Error('Invalid UTF-8 sequence');
            }
            state.utf8seq -= 1;
        }
        else if (state.utf8seq > 0) {
            if (byte <= 0x7f) {
                throw new Error('Invalid UTF-8 sequence');
            }
            state.codepoint = (state.codepoint << 6) | (byte & 63);
            state.utf8seq -= 1;
            if (state.utf8seq === 0) {
                emit(state.codepoint);
            }
        }
    }
    /**
     * Helper functions to convert different types of strings to Uint8Array
     */
    function base64UrlToUint8Array(str) {
        const result = [];
        const state = { queue: 0, queuedBits: 0 };
        const onByte = (byte) => {
            result.push(byte);
        };
        for (let i = 0; i < str.length; i += 1) {
            byteFromBase64URL(str.charCodeAt(i), state, onByte);
        }
        return new Uint8Array(result);
    }
    function stringToUint8Array(str) {
        const result = [];
        stringToUTF8(str, (byte) => result.push(byte));
        return new Uint8Array(result);
    }
    function bytesToBase64URL(bytes) {
        const result = [];
        const state = { queue: 0, queuedBits: 0 };
        const onChar = (char) => {
            result.push(char);
        };
        bytes.forEach((byte) => byteToBase64URL(byte, state, onChar));
        // always call with `null` after processing all bytes
        byteToBase64URL(null, state, onChar);
        return result.join('');
    }

    function expiresAt(expiresIn) {
        const timeNow = Math.round(Date.now() / 1000);
        return timeNow + expiresIn;
    }
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';
    const localStorageWriteTests = {
        tested: false,
        writable: false,
    };
    /**
     * Checks whether localStorage is supported on this browser.
     */
    const supportsLocalStorage = () => {
        if (!isBrowser()) {
            return false;
        }
        try {
            if (typeof globalThis.localStorage !== 'object') {
                return false;
            }
        }
        catch (e) {
            // DOM exception when accessing `localStorage`
            return false;
        }
        if (localStorageWriteTests.tested) {
            return localStorageWriteTests.writable;
        }
        const randomKey = `lswt-${Math.random()}${Math.random()}`;
        try {
            globalThis.localStorage.setItem(randomKey, randomKey);
            globalThis.localStorage.removeItem(randomKey);
            localStorageWriteTests.tested = true;
            localStorageWriteTests.writable = true;
        }
        catch (e) {
            // localStorage can't be written to
            // https://www.chromium.org/for-testers/bug-reporting-guidelines/uncaught-securityerror-failed-to-read-the-localstorage-property-from-window-access-is-denied-for-this-document
            localStorageWriteTests.tested = true;
            localStorageWriteTests.writable = false;
        }
        return localStorageWriteTests.writable;
    };
    /**
     * Extracts parameters encoded in the URL both in the query and fragment.
     */
    function parseParametersFromURL(href) {
        const result = {};
        const url = new URL(href);
        if (url.hash && url.hash[0] === '#') {
            try {
                const hashSearchParams = new URLSearchParams(url.hash.substring(1));
                hashSearchParams.forEach((value, key) => {
                    result[key] = value;
                });
            }
            catch (e) {
                // hash is not a query string
            }
        }
        // search parameters take precedence over hash parameters
        url.searchParams.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
    const resolveFetch = (customFetch) => {
        let _fetch;
        if (customFetch) {
            _fetch = customFetch;
        }
        else if (typeof fetch === 'undefined') {
            _fetch = (...args) => Promise.resolve().then(function () { return browser; }).then(({ default: fetch }) => fetch(...args));
        }
        else {
            _fetch = fetch;
        }
        return (...args) => _fetch(...args);
    };
    const looksLikeFetchResponse = (maybeResponse) => {
        return (typeof maybeResponse === 'object' &&
            maybeResponse !== null &&
            'status' in maybeResponse &&
            'ok' in maybeResponse &&
            'json' in maybeResponse &&
            typeof maybeResponse.json === 'function');
    };
    // Storage helpers
    const setItemAsync = async (storage, key, data) => {
        await storage.setItem(key, JSON.stringify(data));
    };
    const getItemAsync = async (storage, key) => {
        const value = await storage.getItem(key);
        if (!value) {
            return null;
        }
        try {
            return JSON.parse(value);
        }
        catch (_a) {
            return value;
        }
    };
    const removeItemAsync = async (storage, key) => {
        await storage.removeItem(key);
    };
    /**
     * A deferred represents some asynchronous work that is not yet finished, which
     * may or may not culminate in a value.
     * Taken from: https://github.com/mike-north/types/blob/master/src/async.ts
     */
    class Deferred {
        constructor() {
            this.promise = new Deferred.promiseConstructor((res, rej) => {
                this.resolve = res;
                this.reject = rej;
            });
        }
    }
    Deferred.promiseConstructor = Promise;
    function decodeJWT(token) {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new AuthInvalidJwtError('Invalid JWT structure');
        }
        // Regex checks for base64url format
        for (let i = 0; i < parts.length; i++) {
            if (!BASE64URL_REGEX.test(parts[i])) {
                throw new AuthInvalidJwtError('JWT not in base64url format');
            }
        }
        const data = {
            // using base64url lib
            header: JSON.parse(stringFromBase64URL(parts[0])),
            payload: JSON.parse(stringFromBase64URL(parts[1])),
            signature: base64UrlToUint8Array(parts[2]),
            raw: {
                header: parts[0],
                payload: parts[1],
            },
        };
        return data;
    }
    /**
     * Creates a promise that resolves to null after some time.
     */
    async function sleep(time) {
        return await new Promise((accept) => {
            setTimeout(() => accept(null), time);
        });
    }
    /**
     * Converts the provided async function into a retryable function. Each result
     * or thrown error is sent to the isRetryable function which should return true
     * if the function should run again.
     */
    function retryable(fn, isRetryable) {
        const promise = new Promise((accept, reject) => {
            (async () => {
                for (let attempt = 0; attempt < Infinity; attempt++) {
                    try {
                        const result = await fn(attempt);
                        if (!isRetryable(attempt, null, result)) {
                            accept(result);
                            return;
                        }
                    }
                    catch (e) {
                        if (!isRetryable(attempt, e)) {
                            reject(e);
                            return;
                        }
                    }
                }
            })();
        });
        return promise;
    }
    function dec2hex(dec) {
        return ('0' + dec.toString(16)).substr(-2);
    }
    // Functions below taken from: https://stackoverflow.com/questions/63309409/creating-a-code-verifier-and-challenge-for-pkce-auth-on-spotify-api-in-reactjs
    function generatePKCEVerifier() {
        const verifierLength = 56;
        const array = new Uint32Array(verifierLength);
        if (typeof crypto === 'undefined') {
            const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
            const charSetLen = charSet.length;
            let verifier = '';
            for (let i = 0; i < verifierLength; i++) {
                verifier += charSet.charAt(Math.floor(Math.random() * charSetLen));
            }
            return verifier;
        }
        crypto.getRandomValues(array);
        return Array.from(array, dec2hex).join('');
    }
    async function sha256(randomString) {
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(randomString);
        const hash = await crypto.subtle.digest('SHA-256', encodedData);
        const bytes = new Uint8Array(hash);
        return Array.from(bytes)
            .map((c) => String.fromCharCode(c))
            .join('');
    }
    async function generatePKCEChallenge(verifier) {
        const hasCryptoSupport = typeof crypto !== 'undefined' &&
            typeof crypto.subtle !== 'undefined' &&
            typeof TextEncoder !== 'undefined';
        if (!hasCryptoSupport) {
            console.warn('WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.');
            return verifier;
        }
        const hashed = await sha256(verifier);
        return btoa(hashed).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    async function getCodeChallengeAndMethod(storage, storageKey, isPasswordRecovery = false) {
        const codeVerifier = generatePKCEVerifier();
        let storedCodeVerifier = codeVerifier;
        if (isPasswordRecovery) {
            storedCodeVerifier += '/PASSWORD_RECOVERY';
        }
        await setItemAsync(storage, `${storageKey}-code-verifier`, storedCodeVerifier);
        const codeChallenge = await generatePKCEChallenge(codeVerifier);
        const codeChallengeMethod = codeVerifier === codeChallenge ? 'plain' : 's256';
        return [codeChallenge, codeChallengeMethod];
    }
    /** Parses the API version which is 2YYY-MM-DD. */
    const API_VERSION_REGEX = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
    function parseResponseAPIVersion(response) {
        const apiVersion = response.headers.get(API_VERSION_HEADER_NAME);
        if (!apiVersion) {
            return null;
        }
        if (!apiVersion.match(API_VERSION_REGEX)) {
            return null;
        }
        try {
            const date = new Date(`${apiVersion}T00:00:00.0Z`);
            return date;
        }
        catch (e) {
            return null;
        }
    }
    function validateExp(exp) {
        if (!exp) {
            throw new Error('Missing exp claim');
        }
        const timeNow = Math.floor(Date.now() / 1000);
        if (exp <= timeNow) {
            throw new Error('JWT has expired');
        }
    }
    function getAlgorithm(alg) {
        switch (alg) {
            case 'RS256':
                return {
                    name: 'RSASSA-PKCS1-v1_5',
                    hash: { name: 'SHA-256' },
                };
            case 'ES256':
                return {
                    name: 'ECDSA',
                    namedCurve: 'P-256',
                    hash: { name: 'SHA-256' },
                };
            default:
                throw new Error('Invalid alg claim');
        }
    }
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    function validateUUID(str) {
        if (!UUID_REGEX.test(str)) {
            throw new Error('@supabase/auth-js: Expected parameter to be UUID but is not');
        }
    }

    var __rest$1 = (this && this.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };
    const _getErrorMessage = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
    const NETWORK_ERROR_CODES = [502, 503, 504];
    async function handleError(error) {
        var _a;
        if (!looksLikeFetchResponse(error)) {
            throw new AuthRetryableFetchError(_getErrorMessage(error), 0);
        }
        if (NETWORK_ERROR_CODES.includes(error.status)) {
            // status in 500...599 range - server had an error, request might be retryed.
            throw new AuthRetryableFetchError(_getErrorMessage(error), error.status);
        }
        let data;
        try {
            data = await error.json();
        }
        catch (e) {
            throw new AuthUnknownError(_getErrorMessage(e), e);
        }
        let errorCode = undefined;
        const responseAPIVersion = parseResponseAPIVersion(error);
        if (responseAPIVersion &&
            responseAPIVersion.getTime() >= API_VERSIONS['2024-01-01'].timestamp &&
            typeof data === 'object' &&
            data &&
            typeof data.code === 'string') {
            errorCode = data.code;
        }
        else if (typeof data === 'object' && data && typeof data.error_code === 'string') {
            errorCode = data.error_code;
        }
        if (!errorCode) {
            // Legacy support for weak password errors, when there were no error codes
            if (typeof data === 'object' &&
                data &&
                typeof data.weak_password === 'object' &&
                data.weak_password &&
                Array.isArray(data.weak_password.reasons) &&
                data.weak_password.reasons.length &&
                data.weak_password.reasons.reduce((a, i) => a && typeof i === 'string', true)) {
                throw new AuthWeakPasswordError(_getErrorMessage(data), error.status, data.weak_password.reasons);
            }
        }
        else if (errorCode === 'weak_password') {
            throw new AuthWeakPasswordError(_getErrorMessage(data), error.status, ((_a = data.weak_password) === null || _a === void 0 ? void 0 : _a.reasons) || []);
        }
        else if (errorCode === 'session_not_found') {
            // The `session_id` inside the JWT does not correspond to a row in the
            // `sessions` table. This usually means the user has signed out, has been
            // deleted, or their session has somehow been terminated.
            throw new AuthSessionMissingError();
        }
        throw new AuthApiError(_getErrorMessage(data), error.status || 500, errorCode);
    }
    const _getRequestParams = (method, options, parameters, body) => {
        const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
        if (method === 'GET') {
            return params;
        }
        params.headers = Object.assign({ 'Content-Type': 'application/json;charset=UTF-8' }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
        return Object.assign(Object.assign({}, params), parameters);
    };
    async function _request(fetcher, method, url, options) {
        var _a;
        const headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
        if (!headers[API_VERSION_HEADER_NAME]) {
            headers[API_VERSION_HEADER_NAME] = API_VERSIONS['2024-01-01'].name;
        }
        if (options === null || options === void 0 ? void 0 : options.jwt) {
            headers['Authorization'] = `Bearer ${options.jwt}`;
        }
        const qs = (_a = options === null || options === void 0 ? void 0 : options.query) !== null && _a !== void 0 ? _a : {};
        if (options === null || options === void 0 ? void 0 : options.redirectTo) {
            qs['redirect_to'] = options.redirectTo;
        }
        const queryString = Object.keys(qs).length ? '?' + new URLSearchParams(qs).toString() : '';
        const data = await _handleRequest(fetcher, method, url + queryString, {
            headers,
            noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson,
        }, {}, options === null || options === void 0 ? void 0 : options.body);
        return (options === null || options === void 0 ? void 0 : options.xform) ? options === null || options === void 0 ? void 0 : options.xform(data) : { data: Object.assign({}, data), error: null };
    }
    async function _handleRequest(fetcher, method, url, options, parameters, body) {
        const requestParams = _getRequestParams(method, options, parameters, body);
        let result;
        try {
            result = await fetcher(url, Object.assign({}, requestParams));
        }
        catch (e) {
            console.error(e);
            // fetch failed, likely due to a network or CORS error
            throw new AuthRetryableFetchError(_getErrorMessage(e), 0);
        }
        if (!result.ok) {
            await handleError(result);
        }
        if (options === null || options === void 0 ? void 0 : options.noResolveJson) {
            return result;
        }
        try {
            return await result.json();
        }
        catch (e) {
            await handleError(e);
        }
    }
    function _sessionResponse(data) {
        var _a;
        let session = null;
        if (hasSession(data)) {
            session = Object.assign({}, data);
            if (!data.expires_at) {
                session.expires_at = expiresAt(data.expires_in);
            }
        }
        const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
        return { data: { session, user }, error: null };
    }
    function _sessionResponsePassword(data) {
        const response = _sessionResponse(data);
        if (!response.error &&
            data.weak_password &&
            typeof data.weak_password === 'object' &&
            Array.isArray(data.weak_password.reasons) &&
            data.weak_password.reasons.length &&
            data.weak_password.message &&
            typeof data.weak_password.message === 'string' &&
            data.weak_password.reasons.reduce((a, i) => a && typeof i === 'string', true)) {
            response.data.weak_password = data.weak_password;
        }
        return response;
    }
    function _userResponse(data) {
        var _a;
        const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
        return { data: { user }, error: null };
    }
    function _ssoResponse(data) {
        return { data, error: null };
    }
    function _generateLinkResponse(data) {
        const { action_link, email_otp, hashed_token, redirect_to, verification_type } = data, rest = __rest$1(data, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]);
        const properties = {
            action_link,
            email_otp,
            hashed_token,
            redirect_to,
            verification_type,
        };
        const user = Object.assign({}, rest);
        return {
            data: {
                properties,
                user,
            },
            error: null,
        };
    }
    function _noResolveJsonResponse(data) {
        return data;
    }
    /**
     * hasSession checks if the response object contains a valid session
     * @param data A response object
     * @returns true if a session is in the response
     */
    function hasSession(data) {
        return data.access_token && data.refresh_token && data.expires_in;
    }

    const SIGN_OUT_SCOPES = ['global', 'local', 'others'];

    var __rest = (this && this.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };
    class GoTrueAdminApi {
        constructor({ url = '', headers = {}, fetch, }) {
            this.url = url;
            this.headers = headers;
            this.fetch = resolveFetch(fetch);
            this.mfa = {
                listFactors: this._listFactors.bind(this),
                deleteFactor: this._deleteFactor.bind(this),
            };
        }
        /**
         * Removes a logged-in session.
         * @param jwt A valid, logged-in JWT.
         * @param scope The logout sope.
         */
        async signOut(jwt, scope = SIGN_OUT_SCOPES[0]) {
            if (SIGN_OUT_SCOPES.indexOf(scope) < 0) {
                throw new Error(`@supabase/auth-js: Parameter scope must be one of ${SIGN_OUT_SCOPES.join(', ')}`);
            }
            try {
                await _request(this.fetch, 'POST', `${this.url}/logout?scope=${scope}`, {
                    headers: this.headers,
                    jwt,
                    noResolveJson: true,
                });
                return { data: null, error: null };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        }
        /**
         * Sends an invite link to an email address.
         * @param email The email address of the user.
         * @param options Additional options to be included when inviting.
         */
        async inviteUserByEmail(email, options = {}) {
            try {
                return await _request(this.fetch, 'POST', `${this.url}/invite`, {
                    body: { email, data: options.data },
                    headers: this.headers,
                    redirectTo: options.redirectTo,
                    xform: _userResponse,
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null }, error };
                }
                throw error;
            }
        }
        /**
         * Generates email links and OTPs to be sent via a custom email provider.
         * @param email The user's email.
         * @param options.password User password. For signup only.
         * @param options.data Optional user metadata. For signup only.
         * @param options.redirectTo The redirect url which should be appended to the generated link
         */
        async generateLink(params) {
            try {
                const { options } = params, rest = __rest(params, ["options"]);
                const body = Object.assign(Object.assign({}, rest), options);
                if ('newEmail' in rest) {
                    // replace newEmail with new_email in request body
                    body.new_email = rest === null || rest === void 0 ? void 0 : rest.newEmail;
                    delete body['newEmail'];
                }
                return await _request(this.fetch, 'POST', `${this.url}/admin/generate_link`, {
                    body: body,
                    headers: this.headers,
                    xform: _generateLinkResponse,
                    redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo,
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return {
                        data: {
                            properties: null,
                            user: null,
                        },
                        error,
                    };
                }
                throw error;
            }
        }
        // User Admin API
        /**
         * Creates a new user.
         * This function should only be called on a server. Never expose your `service_role` key in the browser.
         */
        async createUser(attributes) {
            try {
                return await _request(this.fetch, 'POST', `${this.url}/admin/users`, {
                    body: attributes,
                    headers: this.headers,
                    xform: _userResponse,
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null }, error };
                }
                throw error;
            }
        }
        /**
         * Get a list of users.
         *
         * This function should only be called on a server. Never expose your `service_role` key in the browser.
         * @param params An object which supports `page` and `perPage` as numbers, to alter the paginated results.
         */
        async listUsers(params) {
            var _a, _b, _c, _d, _e, _f, _g;
            try {
                const pagination = { nextPage: null, lastPage: 0, total: 0 };
                const response = await _request(this.fetch, 'GET', `${this.url}/admin/users`, {
                    headers: this.headers,
                    noResolveJson: true,
                    query: {
                        page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '',
                        per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '',
                    },
                    xform: _noResolveJsonResponse,
                });
                if (response.error)
                    throw response.error;
                const users = await response.json();
                const total = (_e = response.headers.get('x-total-count')) !== null && _e !== void 0 ? _e : 0;
                const links = (_g = (_f = response.headers.get('link')) === null || _f === void 0 ? void 0 : _f.split(',')) !== null && _g !== void 0 ? _g : [];
                if (links.length > 0) {
                    links.forEach((link) => {
                        const page = parseInt(link.split(';')[0].split('=')[1].substring(0, 1));
                        const rel = JSON.parse(link.split(';')[1].split('=')[1]);
                        pagination[`${rel}Page`] = page;
                    });
                    pagination.total = parseInt(total);
                }
                return { data: Object.assign(Object.assign({}, users), pagination), error: null };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { users: [] }, error };
                }
                throw error;
            }
        }
        /**
         * Get user by id.
         *
         * @param uid The user's unique identifier
         *
         * This function should only be called on a server. Never expose your `service_role` key in the browser.
         */
        async getUserById(uid) {
            validateUUID(uid);
            try {
                return await _request(this.fetch, 'GET', `${this.url}/admin/users/${uid}`, {
                    headers: this.headers,
                    xform: _userResponse,
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null }, error };
                }
                throw error;
            }
        }
        /**
         * Updates the user data.
         *
         * @param attributes The data you want to update.
         *
         * This function should only be called on a server. Never expose your `service_role` key in the browser.
         */
        async updateUserById(uid, attributes) {
            validateUUID(uid);
            try {
                return await _request(this.fetch, 'PUT', `${this.url}/admin/users/${uid}`, {
                    body: attributes,
                    headers: this.headers,
                    xform: _userResponse,
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null }, error };
                }
                throw error;
            }
        }
        /**
         * Delete a user. Requires a `service_role` key.
         *
         * @param id The user id you want to remove.
         * @param shouldSoftDelete If true, then the user will be soft-deleted from the auth schema. Soft deletion allows user identification from the hashed user ID but is not reversible.
         * Defaults to false for backward compatibility.
         *
         * This function should only be called on a server. Never expose your `service_role` key in the browser.
         */
        async deleteUser(id, shouldSoftDelete = false) {
            validateUUID(id);
            try {
                return await _request(this.fetch, 'DELETE', `${this.url}/admin/users/${id}`, {
                    headers: this.headers,
                    body: {
                        should_soft_delete: shouldSoftDelete,
                    },
                    xform: _userResponse,
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null }, error };
                }
                throw error;
            }
        }
        async _listFactors(params) {
            validateUUID(params.userId);
            try {
                const { data, error } = await _request(this.fetch, 'GET', `${this.url}/admin/users/${params.userId}/factors`, {
                    headers: this.headers,
                    xform: (factors) => {
                        return { data: { factors }, error: null };
                    },
                });
                return { data, error };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        }
        async _deleteFactor(params) {
            validateUUID(params.userId);
            validateUUID(params.id);
            try {
                const data = await _request(this.fetch, 'DELETE', `${this.url}/admin/users/${params.userId}/factors/${params.id}`, {
                    headers: this.headers,
                });
                return { data, error: null };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        }
    }

    /**
     * Provides safe access to the globalThis.localStorage property.
     */
    const localStorageAdapter = {
        getItem: (key) => {
            if (!supportsLocalStorage()) {
                return null;
            }
            return globalThis.localStorage.getItem(key);
        },
        setItem: (key, value) => {
            if (!supportsLocalStorage()) {
                return;
            }
            globalThis.localStorage.setItem(key, value);
        },
        removeItem: (key) => {
            if (!supportsLocalStorage()) {
                return;
            }
            globalThis.localStorage.removeItem(key);
        },
    };
    /**
     * Returns a localStorage-like object that stores the key-value pairs in
     * memory.
     */
    function memoryLocalStorageAdapter(store = {}) {
        return {
            getItem: (key) => {
                return store[key] || null;
            },
            setItem: (key, value) => {
                store[key] = value;
            },
            removeItem: (key) => {
                delete store[key];
            },
        };
    }

    /**
     * https://mathiasbynens.be/notes/globalthis
     */
    function polyfillGlobalThis() {
        if (typeof globalThis === 'object')
            return;
        try {
            Object.defineProperty(Object.prototype, '__magic__', {
                get: function () {
                    return this;
                },
                configurable: true,
            });
            // @ts-expect-error 'Allow access to magic'
            __magic__.globalThis = __magic__;
            // @ts-expect-error 'Allow access to magic'
            delete Object.prototype.__magic__;
        }
        catch (e) {
            if (typeof self !== 'undefined') {
                // @ts-expect-error 'Allow access to globals'
                self.globalThis = self;
            }
        }
    }

    /**
     * @experimental
     */
    const internals = {
        /**
         * @experimental
         */
        debug: !!(globalThis &&
            supportsLocalStorage() &&
            globalThis.localStorage &&
            globalThis.localStorage.getItem('supabase.gotrue-js.locks.debug') === 'true'),
    };
    /**
     * An error thrown when a lock cannot be acquired after some amount of time.
     *
     * Use the {@link #isAcquireTimeout} property instead of checking with `instanceof`.
     */
    class LockAcquireTimeoutError extends Error {
        constructor(message) {
            super(message);
            this.isAcquireTimeout = true;
        }
    }
    class NavigatorLockAcquireTimeoutError extends LockAcquireTimeoutError {
    }
    class ProcessLockAcquireTimeoutError extends LockAcquireTimeoutError {
    }
    /**
     * Implements a global exclusive lock using the Navigator LockManager API. It
     * is available on all browsers released after 2022-03-15 with Safari being the
     * last one to release support. If the API is not available, this function will
     * throw. Make sure you check availablility before configuring {@link
     * GoTrueClient}.
     *
     * You can turn on debugging by setting the `supabase.gotrue-js.locks.debug`
     * local storage item to `true`.
     *
     * Internals:
     *
     * Since the LockManager API does not preserve stack traces for the async
     * function passed in the `request` method, a trick is used where acquiring the
     * lock releases a previously started promise to run the operation in the `fn`
     * function. The lock waits for that promise to finish (with or without error),
     * while the function will finally wait for the result anyway.
     *
     * @param name Name of the lock to be acquired.
     * @param acquireTimeout If negative, no timeout. If 0 an error is thrown if
     *                       the lock can't be acquired without waiting. If positive, the lock acquire
     *                       will time out after so many milliseconds. An error is
     *                       a timeout if it has `isAcquireTimeout` set to true.
     * @param fn The operation to run once the lock is acquired.
     */
    async function navigatorLock(name, acquireTimeout, fn) {
        if (internals.debug) {
            console.log('@supabase/gotrue-js: navigatorLock: acquire lock', name, acquireTimeout);
        }
        const abortController = new globalThis.AbortController();
        if (acquireTimeout > 0) {
            setTimeout(() => {
                abortController.abort();
                if (internals.debug) {
                    console.log('@supabase/gotrue-js: navigatorLock acquire timed out', name);
                }
            }, acquireTimeout);
        }
        // MDN article: https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request
        // Wrapping navigator.locks.request() with a plain Promise is done as some
        // libraries like zone.js patch the Promise object to track the execution
        // context. However, it appears that most browsers use an internal promise
        // implementation when using the navigator.locks.request() API causing them
        // to lose context and emit confusing log messages or break certain features.
        // This wrapping is believed to help zone.js track the execution context
        // better.
        return await Promise.resolve().then(() => globalThis.navigator.locks.request(name, acquireTimeout === 0
            ? {
                mode: 'exclusive',
                ifAvailable: true,
            }
            : {
                mode: 'exclusive',
                signal: abortController.signal,
            }, async (lock) => {
            if (lock) {
                if (internals.debug) {
                    console.log('@supabase/gotrue-js: navigatorLock: acquired', name, lock.name);
                }
                try {
                    return await fn();
                }
                finally {
                    if (internals.debug) {
                        console.log('@supabase/gotrue-js: navigatorLock: released', name, lock.name);
                    }
                }
            }
            else {
                if (acquireTimeout === 0) {
                    if (internals.debug) {
                        console.log('@supabase/gotrue-js: navigatorLock: not immediately available', name);
                    }
                    throw new NavigatorLockAcquireTimeoutError(`Acquiring an exclusive Navigator LockManager lock "${name}" immediately failed`);
                }
                else {
                    if (internals.debug) {
                        try {
                            const result = await globalThis.navigator.locks.query();
                            console.log('@supabase/gotrue-js: Navigator LockManager state', JSON.stringify(result, null, '  '));
                        }
                        catch (e) {
                            console.warn('@supabase/gotrue-js: Error when querying Navigator LockManager state', e);
                        }
                    }
                    // Browser is not following the Navigator LockManager spec, it
                    // returned a null lock when we didn't use ifAvailable. So we can
                    // pretend the lock is acquired in the name of backward compatibility
                    // and user experience and just run the function.
                    console.warn('@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request');
                    return await fn();
                }
            }
        }));
    }
    const PROCESS_LOCKS = {};
    /**
     * Implements a global exclusive lock that works only in the current process.
     * Useful for environments like React Native or other non-browser
     * single-process (i.e. no concept of "tabs") environments.
     *
     * Use {@link #navigatorLock} in browser environments.
     *
     * @param name Name of the lock to be acquired.
     * @param acquireTimeout If negative, no timeout. If 0 an error is thrown if
     *                       the lock can't be acquired without waiting. If positive, the lock acquire
     *                       will time out after so many milliseconds. An error is
     *                       a timeout if it has `isAcquireTimeout` set to true.
     * @param fn The operation to run once the lock is acquired.
     */
    async function processLock(name, acquireTimeout, fn) {
        var _a;
        const previousOperation = (_a = PROCESS_LOCKS[name]) !== null && _a !== void 0 ? _a : Promise.resolve();
        const currentOperation = Promise.race([
            previousOperation.catch(() => {
                // ignore error of previous operation that we're waiting to finish
                return null;
            }),
            acquireTimeout >= 0
                ? new Promise((_, reject) => {
                    setTimeout(() => {
                        reject(new ProcessLockAcquireTimeoutError(`Acquring process lock with name "${name}" timed out`));
                    }, acquireTimeout);
                })
                : null,
        ].filter((x) => x))
            .catch((e) => {
            if (e && e.isAcquireTimeout) {
                throw e;
            }
            return null;
        })
            .then(async () => {
            // previous operations finished and we didn't get a race on the acquire
            // timeout, so the current operation can finally start
            return await fn();
        });
        PROCESS_LOCKS[name] = currentOperation.catch(async (e) => {
            if (e && e.isAcquireTimeout) {
                // if the current operation timed out, it doesn't mean that the previous
                // operation finished, so we need contnue waiting for it to finish
                await previousOperation;
                return null;
            }
            throw e;
        });
        // finally wait for the current operation to finish successfully, with an
        // error or with an acquire timeout error
        return await currentOperation;
    }

    polyfillGlobalThis(); // Make "globalThis" available
    const DEFAULT_OPTIONS = {
        url: GOTRUE_URL,
        storageKey: STORAGE_KEY,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        headers: DEFAULT_HEADERS,
        flowType: 'implicit',
        debug: false,
        hasCustomAuthorizationHeader: false,
    };
    async function lockNoOp(name, acquireTimeout, fn) {
        return await fn();
    }
    class GoTrueClient {
        /**
         * Create a new client for use in the browser.
         */
        constructor(options) {
            var _a, _b;
            this.memoryStorage = null;
            this.stateChangeEmitters = new Map();
            this.autoRefreshTicker = null;
            this.visibilityChangedCallback = null;
            this.refreshingDeferred = null;
            /**
             * Keeps track of the async client initialization.
             * When null or not yet resolved the auth state is `unknown`
             * Once resolved the the auth state is known and it's save to call any further client methods.
             * Keep extra care to never reject or throw uncaught errors
             */
            this.initializePromise = null;
            this.detectSessionInUrl = true;
            this.hasCustomAuthorizationHeader = false;
            this.suppressGetSessionWarning = false;
            this.lockAcquired = false;
            this.pendingInLock = [];
            /**
             * Used to broadcast state change events to other tabs listening.
             */
            this.broadcastChannel = null;
            this.logger = console.log;
            this.instanceID = GoTrueClient.nextInstanceID;
            GoTrueClient.nextInstanceID += 1;
            if (this.instanceID > 0 && isBrowser()) {
                console.warn('Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.');
            }
            const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
            this.logDebugMessages = !!settings.debug;
            if (typeof settings.debug === 'function') {
                this.logger = settings.debug;
            }
            this.persistSession = settings.persistSession;
            this.storageKey = settings.storageKey;
            this.autoRefreshToken = settings.autoRefreshToken;
            this.admin = new GoTrueAdminApi({
                url: settings.url,
                headers: settings.headers,
                fetch: settings.fetch,
            });
            this.url = settings.url;
            this.headers = settings.headers;
            this.fetch = resolveFetch(settings.fetch);
            this.lock = settings.lock || lockNoOp;
            this.detectSessionInUrl = settings.detectSessionInUrl;
            this.flowType = settings.flowType;
            this.hasCustomAuthorizationHeader = settings.hasCustomAuthorizationHeader;
            if (settings.lock) {
                this.lock = settings.lock;
            }
            else if (isBrowser() && ((_a = globalThis === null || globalThis === void 0 ? void 0 : globalThis.navigator) === null || _a === void 0 ? void 0 : _a.locks)) {
                this.lock = navigatorLock;
            }
            else {
                this.lock = lockNoOp;
            }
            this.jwks = { keys: [] };
            this.jwks_cached_at = Number.MIN_SAFE_INTEGER;
            this.mfa = {
                verify: this._verify.bind(this),
                enroll: this._enroll.bind(this),
                unenroll: this._unenroll.bind(this),
                challenge: this._challenge.bind(this),
                listFactors: this._listFactors.bind(this),
                challengeAndVerify: this._challengeAndVerify.bind(this),
                getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
            };
            if (this.persistSession) {
                if (settings.storage) {
                    this.storage = settings.storage;
                }
                else {
                    if (supportsLocalStorage()) {
                        this.storage = localStorageAdapter;
                    }
                    else {
                        this.memoryStorage = {};
                        this.storage = memoryLocalStorageAdapter(this.memoryStorage);
                    }
                }
            }
            else {
                this.memoryStorage = {};
                this.storage = memoryLocalStorageAdapter(this.memoryStorage);
            }
            if (isBrowser() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
                try {
                    this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
                }
                catch (e) {
                    console.error('Failed to create a new BroadcastChannel, multi-tab state changes will not be available', e);
                }
                (_b = this.broadcastChannel) === null || _b === void 0 ? void 0 : _b.addEventListener('message', async (event) => {
                    this._debug('received broadcast notification from other tab or client', event);
                    await this._notifyAllSubscribers(event.data.event, event.data.session, false); // broadcast = false so we don't get an endless loop of messages
                });
            }
            this.initialize();
        }
        _debug(...args) {
            if (this.logDebugMessages) {
                this.logger(`GoTrueClient@${this.instanceID} (${version}) ${new Date().toISOString()}`, ...args);
            }
            return this;
        }
        /**
         * Initializes the client session either from the url or from storage.
         * This method is automatically called when instantiating the client, but should also be called
         * manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).
         */
        async initialize() {
            if (this.initializePromise) {
                return await this.initializePromise;
            }
            this.initializePromise = (async () => {
                return await this._acquireLock(-1, async () => {
                    return await this._initialize();
                });
            })();
            return await this.initializePromise;
        }
        /**
         * IMPORTANT:
         * 1. Never throw in this method, as it is called from the constructor
         * 2. Never return a session from this method as it would be cached over
         *    the whole lifetime of the client
         */
        async _initialize() {
            var _a;
            try {
                const params = parseParametersFromURL(window.location.href);
                let callbackUrlType = 'none';
                if (this._isImplicitGrantCallback(params)) {
                    callbackUrlType = 'implicit';
                }
                else if (await this._isPKCECallback(params)) {
                    callbackUrlType = 'pkce';
                }
                /**
                 * Attempt to get the session from the URL only if these conditions are fulfilled
                 *
                 * Note: If the URL isn't one of the callback url types (implicit or pkce),
                 * then there could be an existing session so we don't want to prematurely remove it
                 */
                if (isBrowser() && this.detectSessionInUrl && callbackUrlType !== 'none') {
                    const { data, error } = await this._getSessionFromURL(params, callbackUrlType);
                    if (error) {
                        this._debug('#_initialize()', 'error detecting session from URL', error);
                        if (isAuthImplicitGrantRedirectError(error)) {
                            const errorCode = (_a = error.details) === null || _a === void 0 ? void 0 : _a.code;
                            if (errorCode === 'identity_already_exists' ||
                                errorCode === 'identity_not_found' ||
                                errorCode === 'single_identity_not_deletable') {
                                return { error };
                            }
                        }
                        // failed login attempt via url,
                        // remove old session as in verifyOtp, signUp and signInWith*
                        await this._removeSession();
                        return { error };
                    }
                    const { session, redirectType } = data;
                    this._debug('#_initialize()', 'detected session in URL', session, 'redirect type', redirectType);
                    await this._saveSession(session);
                    setTimeout(async () => {
                        if (redirectType === 'recovery') {
                            await this._notifyAllSubscribers('PASSWORD_RECOVERY', session);
                        }
                        else {
                            await this._notifyAllSubscribers('SIGNED_IN', session);
                        }
                    }, 0);
                    return { error: null };
                }
                // no login attempt via callback url try to recover session from storage
                await this._recoverAndRefresh();
                return { error: null };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { error };
                }
                return {
                    error: new AuthUnknownError('Unexpected error during initialization', error),
                };
            }
            finally {
                await this._handleVisibilityChange();
                this._debug('#_initialize()', 'end');
            }
        }
        /**
         * Creates a new anonymous user.
         *
         * @returns A session where the is_anonymous claim in the access token JWT set to true
         */
        async signInAnonymously(credentials) {
            var _a, _b, _c;
            try {
                const res = await _request(this.fetch, 'POST', `${this.url}/signup`, {
                    headers: this.headers,
                    body: {
                        data: (_b = (_a = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : {},
                        gotrue_meta_security: { captcha_token: (_c = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _c === void 0 ? void 0 : _c.captchaToken },
                    },
                    xform: _sessionResponse,
                });
                const { data, error } = res;
                if (error || !data) {
                    return { data: { user: null, session: null }, error: error };
                }
                const session = data.session;
                const user = data.user;
                if (data.session) {
                    await this._saveSession(data.session);
                    await this._notifyAllSubscribers('SIGNED_IN', session);
                }
                return { data: { user, session }, error: null };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null, session: null }, error };
                }
                throw error;
            }
        }
        /**
         * Creates a new user.
         *
         * Be aware that if a user account exists in the system you may get back an
         * error message that attempts to hide this information from the user.
         * This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.
         *
         * @returns A logged-in session if the server has "autoconfirm" ON
         * @returns A user if the server has "autoconfirm" OFF
         */
        async signUp(credentials) {
            var _a, _b, _c;
            try {
                let res;
                if ('email' in credentials) {
                    const { email, password, options } = credentials;
                    let codeChallenge = null;
                    let codeChallengeMethod = null;
                    if (this.flowType === 'pkce') {
                        ;
                        [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
                    }
                    res = await _request(this.fetch, 'POST', `${this.url}/signup`, {
                        headers: this.headers,
                        redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                        body: {
                            email,
                            password,
                            data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
                            gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                            code_challenge: codeChallenge,
                            code_challenge_method: codeChallengeMethod,
                        },
                        xform: _sessionResponse,
                    });
                }
                else if ('phone' in credentials) {
                    const { phone, password, options } = credentials;
                    res = await _request(this.fetch, 'POST', `${this.url}/signup`, {
                        headers: this.headers,
                        body: {
                            phone,
                            password,
                            data: (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : {},
                            channel: (_c = options === null || options === void 0 ? void 0 : options.channel) !== null && _c !== void 0 ? _c : 'sms',
                            gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                        },
                        xform: _sessionResponse,
                    });
                }
                else {
                    throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a password');
                }
                const { data, error } = res;
                if (error || !data) {
                    return { data: { user: null, session: null }, error: error };
                }
                const session = data.session;
                const user = data.user;
                if (data.session) {
                    await this._saveSession(data.session);
                    await this._notifyAllSubscribers('SIGNED_IN', session);
                }
                return { data: { user, session }, error: null };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null, session: null }, error };
                }
                throw error;
            }
        }
        /**
         * Log in an existing user with an email and password or phone and password.
         *
         * Be aware that you may get back an error message that will not distinguish
         * between the cases where the account does not exist or that the
         * email/phone and password combination is wrong or that the account can only
         * be accessed via social login.
         */
        async signInWithPassword(credentials) {
            try {
                let res;
                if ('email' in credentials) {
                    const { email, password, options } = credentials;
                    res = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=password`, {
                        headers: this.headers,
                        body: {
                            email,
                            password,
                            gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                        },
                        xform: _sessionResponsePassword,
                    });
                }
                else if ('phone' in credentials) {
                    const { phone, password, options } = credentials;
                    res = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=password`, {
                        headers: this.headers,
                        body: {
                            phone,
                            password,
                            gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                        },
                        xform: _sessionResponsePassword,
                    });
                }
                else {
                    throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a password');
                }
                const { data, error } = res;
                if (error) {
                    return { data: { user: null, session: null }, error };
                }
                else if (!data || !data.session || !data.user) {
                    return { data: { user: null, session: null }, error: new AuthInvalidTokenResponseError() };
                }
                if (data.session) {
                    await this._saveSession(data.session);
                    await this._notifyAllSubscribers('SIGNED_IN', data.session);
                }
                return {
                    data: Object.assign({ user: data.user, session: data.session }, (data.weak_password ? { weakPassword: data.weak_password } : null)),
                    error,
                };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null, session: null }, error };
                }
                throw error;
            }
        }
        /**
         * Log in an existing user via a third-party provider.
         * This method supports the PKCE flow.
         */
        async signInWithOAuth(credentials) {
            var _a, _b, _c, _d;
            return await this._handleProviderSignIn(credentials.provider, {
                redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
                scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
                queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
                skipBrowserRedirect: (_d = credentials.options) === null || _d === void 0 ? void 0 : _d.skipBrowserRedirect,
            });
        }
        /**
         * Log in an existing user by exchanging an Auth Code issued during the PKCE flow.
         */
        async exchangeCodeForSession(authCode) {
            await this.initializePromise;
            return this._acquireLock(-1, async () => {
                return this._exchangeCodeForSession(authCode);
            });
        }
        /**
         * Signs in a user by verifying a message signed by the user's private key.
         * Only Solana supported at this time, using the Sign in with Solana standard.
         */
        async signInWithWeb3(credentials) {
            const { chain } = credentials;
            if (chain === 'solana') {
                return await this.signInWithSolana(credentials);
            }
            throw new Error(`@supabase/auth-js: Unsupported chain "${chain}"`);
        }
        async signInWithSolana(credentials) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            let message;
            let signature;
            if ('message' in credentials) {
                message = credentials.message;
                signature = credentials.signature;
            }
            else {
                const { chain, wallet, statement, options } = credentials;
                let resolvedWallet;
                if (!isBrowser()) {
                    if (typeof wallet !== 'object' || !(options === null || options === void 0 ? void 0 : options.url)) {
                        throw new Error('@supabase/auth-js: Both wallet and url must be specified in non-browser environments.');
                    }
                    resolvedWallet = wallet;
                }
                else if (typeof wallet === 'object') {
                    resolvedWallet = wallet;
                }
                else {
                    const windowAny = window;
                    if ('solana' in windowAny &&
                        typeof windowAny.solana === 'object' &&
                        (('signIn' in windowAny.solana && typeof windowAny.solana.signIn === 'function') ||
                            ('signMessage' in windowAny.solana &&
                                typeof windowAny.solana.signMessage === 'function'))) {
                        resolvedWallet = windowAny.solana;
                    }
                    else {
                        throw new Error(`@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.`);
                    }
                }
                const url = new URL((_a = options === null || options === void 0 ? void 0 : options.url) !== null && _a !== void 0 ? _a : window.location.href);
                if ('signIn' in resolvedWallet && resolvedWallet.signIn) {
                    const output = await resolvedWallet.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: new Date().toISOString() }, options === null || options === void 0 ? void 0 : options.signInWithSolana), { 
                        // non-overridable properties
                        version: '1', domain: url.host, uri: url.href }), (statement ? { statement } : null)));
                    let outputToProcess;
                    if (Array.isArray(output) && output[0] && typeof output[0] === 'object') {
                        outputToProcess = output[0];
                    }
                    else if (output &&
                        typeof output === 'object' &&
                        'signedMessage' in output &&
                        'signature' in output) {
                        outputToProcess = output;
                    }
                    else {
                        throw new Error('@supabase/auth-js: Wallet method signIn() returned unrecognized value');
                    }
                    if ('signedMessage' in outputToProcess &&
                        'signature' in outputToProcess &&
                        (typeof outputToProcess.signedMessage === 'string' ||
                            outputToProcess.signedMessage instanceof Uint8Array) &&
                        outputToProcess.signature instanceof Uint8Array) {
                        message =
                            typeof outputToProcess.signedMessage === 'string'
                                ? outputToProcess.signedMessage
                                : new TextDecoder().decode(outputToProcess.signedMessage);
                        signature = outputToProcess.signature;
                    }
                    else {
                        throw new Error('@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields');
                    }
                }
                else {
                    if (!('signMessage' in resolvedWallet) ||
                        typeof resolvedWallet.signMessage !== 'function' ||
                        !('publicKey' in resolvedWallet) ||
                        typeof resolvedWallet !== 'object' ||
                        !resolvedWallet.publicKey ||
                        !('toBase58' in resolvedWallet.publicKey) ||
                        typeof resolvedWallet.publicKey.toBase58 !== 'function') {
                        throw new Error('@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API');
                    }
                    message = [
                        `${url.host} wants you to sign in with your Solana account:`,
                        resolvedWallet.publicKey.toBase58(),
                        ...(statement ? ['', statement, ''] : ['']),
                        'Version: 1',
                        `URI: ${url.href}`,
                        `Issued At: ${(_c = (_b = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _b === void 0 ? void 0 : _b.issuedAt) !== null && _c !== void 0 ? _c : new Date().toISOString()}`,
                        ...(((_d = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _d === void 0 ? void 0 : _d.notBefore)
                            ? [`Not Before: ${options.signInWithSolana.notBefore}`]
                            : []),
                        ...(((_e = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _e === void 0 ? void 0 : _e.expirationTime)
                            ? [`Expiration Time: ${options.signInWithSolana.expirationTime}`]
                            : []),
                        ...(((_f = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _f === void 0 ? void 0 : _f.chainId)
                            ? [`Chain ID: ${options.signInWithSolana.chainId}`]
                            : []),
                        ...(((_g = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _g === void 0 ? void 0 : _g.nonce) ? [`Nonce: ${options.signInWithSolana.nonce}`] : []),
                        ...(((_h = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _h === void 0 ? void 0 : _h.requestId)
                            ? [`Request ID: ${options.signInWithSolana.requestId}`]
                            : []),
                        ...(((_k = (_j = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _j === void 0 ? void 0 : _j.resources) === null || _k === void 0 ? void 0 : _k.length)
                            ? [
                                'Resources',
                                ...options.signInWithSolana.resources.map((resource) => `- ${resource}`),
                            ]
                            : []),
                    ].join('\n');
                    const maybeSignature = await resolvedWallet.signMessage(new TextEncoder().encode(message), 'utf8');
                    if (!maybeSignature || !(maybeSignature instanceof Uint8Array)) {
                        throw new Error('@supabase/auth-js: Wallet signMessage() API returned an recognized value');
                    }
                    signature = maybeSignature;
                }
            }
            try {
                const { data, error } = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=web3`, {
                    headers: this.headers,
                    body: Object.assign({ chain: 'solana', message, signature: bytesToBase64URL(signature) }, (((_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken)
                        ? { gotrue_meta_security: { captcha_token: (_m = credentials.options) === null || _m === void 0 ? void 0 : _m.captchaToken } }
                        : null)),
                    xform: _sessionResponse,
                });
                if (error) {
                    throw error;
                }
                if (!data || !data.session || !data.user) {
                    return {
                        data: { user: null, session: null },
                        error: new AuthInvalidTokenResponseError(),
                    };
                }
                if (data.session) {
                    await this._saveSession(data.session);
                    await this._notifyAllSubscribers('SIGNED_IN', data.session);
                }
                return { data: Object.assign({}, data), error };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null, session: null }, error };
                }
                throw error;
            }
        }
        async _exchangeCodeForSession(authCode) {
            const storageItem = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
            const [codeVerifier, redirectType] = (storageItem !== null && storageItem !== void 0 ? storageItem : '').split('/');
            try {
                const { data, error } = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=pkce`, {
                    headers: this.headers,
                    body: {
                        auth_code: authCode,
                        code_verifier: codeVerifier,
                    },
                    xform: _sessionResponse,
                });
                await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
                if (error) {
                    throw error;
                }
                if (!data || !data.session || !data.user) {
                    return {
                        data: { user: null, session: null, redirectType: null },
                        error: new AuthInvalidTokenResponseError(),
                    };
                }
                if (data.session) {
                    await this._saveSession(data.session);
                    await this._notifyAllSubscribers('SIGNED_IN', data.session);
                }
                return { data: Object.assign(Object.assign({}, data), { redirectType: redirectType !== null && redirectType !== void 0 ? redirectType : null }), error };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null, session: null, redirectType: null }, error };
                }
                throw error;
            }
        }
        /**
         * Allows signing in with an OIDC ID token. The authentication provider used
         * should be enabled and configured.
         */
        async signInWithIdToken(credentials) {
            try {
                const { options, provider, token, access_token, nonce } = credentials;
                const res = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=id_token`, {
                    headers: this.headers,
                    body: {
                        provider,
                        id_token: token,
                        access_token,
                        nonce,
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                    },
                    xform: _sessionResponse,
                });
                const { data, error } = res;
                if (error) {
                    return { data: { user: null, session: null }, error };
                }
                else if (!data || !data.session || !data.user) {
                    return {
                        data: { user: null, session: null },
                        error: new AuthInvalidTokenResponseError(),
                    };
                }
                if (data.session) {
                    await this._saveSession(data.session);
                    await this._notifyAllSubscribers('SIGNED_IN', data.session);
                }
                return { data, error };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null, session: null }, error };
                }
                throw error;
            }
        }
        /**
         * Log in a user using magiclink or a one-time password (OTP).
         *
         * If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent.
         * If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent.
         * If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.
         *
         * Be aware that you may get back an error message that will not distinguish
         * between the cases where the account does not exist or, that the account
         * can only be accessed via social login.
         *
         * Do note that you will need to configure a Whatsapp sender on Twilio
         * if you are using phone sign in with the 'whatsapp' channel. The whatsapp
         * channel is not supported on other providers
         * at this time.
         * This method supports PKCE when an email is passed.
         */
        async signInWithOtp(credentials) {
            var _a, _b, _c, _d, _e;
            try {
                if ('email' in credentials) {
                    const { email, options } = credentials;
                    let codeChallenge = null;
                    let codeChallengeMethod = null;
                    if (this.flowType === 'pkce') {
                        ;
                        [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
                    }
                    const { error } = await _request(this.fetch, 'POST', `${this.url}/otp`, {
                        headers: this.headers,
                        body: {
                            email,
                            data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
                            create_user: (_b = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _b !== void 0 ? _b : true,
                            gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                            code_challenge: codeChallenge,
                            code_challenge_method: codeChallengeMethod,
                        },
                        redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                    });
                    return { data: { user: null, session: null }, error };
                }
                if ('phone' in credentials) {
                    const { phone, options } = credentials;
                    const { data, error } = await _request(this.fetch, 'POST', `${this.url}/otp`, {
                        headers: this.headers,
                        body: {
                            phone,
                            data: (_c = options === null || options === void 0 ? void 0 : options.data) !== null && _c !== void 0 ? _c : {},
                            create_user: (_d = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _d !== void 0 ? _d : true,
                            gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                            channel: (_e = options === null || options === void 0 ? void 0 : options.channel) !== null && _e !== void 0 ? _e : 'sms',
                        },
                    });
                    return { data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id }, error };
                }
                throw new AuthInvalidCredentialsError('You must provide either an email or phone number.');
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null, session: null }, error };
                }
                throw error;
            }
        }
        /**
         * Log in a user given a User supplied OTP or TokenHash received through mobile or email.
         */
        async verifyOtp(params) {
            var _a, _b;
            try {
                let redirectTo = undefined;
                let captchaToken = undefined;
                if ('options' in params) {
                    redirectTo = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo;
                    captchaToken = (_b = params.options) === null || _b === void 0 ? void 0 : _b.captchaToken;
                }
                const { data, error } = await _request(this.fetch, 'POST', `${this.url}/verify`, {
                    headers: this.headers,
                    body: Object.assign(Object.assign({}, params), { gotrue_meta_security: { captcha_token: captchaToken } }),
                    redirectTo,
                    xform: _sessionResponse,
                });
                if (error) {
                    throw error;
                }
                if (!data) {
                    throw new Error('An error occurred on token verification.');
                }
                const session = data.session;
                const user = data.user;
                if (session === null || session === void 0 ? void 0 : session.access_token) {
                    await this._saveSession(session);
                    await this._notifyAllSubscribers(params.type == 'recovery' ? 'PASSWORD_RECOVERY' : 'SIGNED_IN', session);
                }
                return { data: { user, session }, error: null };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null, session: null }, error };
                }
                throw error;
            }
        }
        /**
         * Attempts a single-sign on using an enterprise Identity Provider. A
         * successful SSO attempt will redirect the current page to the identity
         * provider authorization page. The redirect URL is implementation and SSO
         * protocol specific.
         *
         * You can use it by providing a SSO domain. Typically you can extract this
         * domain by asking users for their email address. If this domain is
         * registered on the Auth instance the redirect will use that organization's
         * currently active SSO Identity Provider for the login.
         *
         * If you have built an organization-specific login page, you can use the
         * organization's SSO Identity Provider UUID directly instead.
         */
        async signInWithSSO(params) {
            var _a, _b, _c;
            try {
                let codeChallenge = null;
                let codeChallengeMethod = null;
                if (this.flowType === 'pkce') {
                    ;
                    [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
                }
                return await _request(this.fetch, 'POST', `${this.url}/sso`, {
                    body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, ('providerId' in params ? { provider_id: params.providerId } : null)), ('domain' in params ? { domain: params.domain } : null)), { redirect_to: (_b = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo) !== null && _b !== void 0 ? _b : undefined }), (((_c = params === null || params === void 0 ? void 0 : params.options) === null || _c === void 0 ? void 0 : _c.captchaToken)
                        ? { gotrue_meta_security: { captcha_token: params.options.captchaToken } }
                        : null)), { skip_http_redirect: true, code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
                    headers: this.headers,
                    xform: _ssoResponse,
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        }
        /**
         * Sends a reauthentication OTP to the user's email or phone number.
         * Requires the user to be signed-in.
         */
        async reauthenticate() {
            await this.initializePromise;
            return await this._acquireLock(-1, async () => {
                return await this._reauthenticate();
            });
        }
        async _reauthenticate() {
            try {
                return await this._useSession(async (result) => {
                    const { data: { session }, error: sessionError, } = result;
                    if (sessionError)
                        throw sessionError;
                    if (!session)
                        throw new AuthSessionMissingError();
                    const { error } = await _request(this.fetch, 'GET', `${this.url}/reauthenticate`, {
                        headers: this.headers,
                        jwt: session.access_token,
                    });
                    return { data: { user: null, session: null }, error };
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null, session: null }, error };
                }
                throw error;
            }
        }
        /**
         * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
         */
        async resend(credentials) {
            try {
                const endpoint = `${this.url}/resend`;
                if ('email' in credentials) {
                    const { email, type, options } = credentials;
                    const { error } = await _request(this.fetch, 'POST', endpoint, {
                        headers: this.headers,
                        body: {
                            email,
                            type,
                            gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                        },
                        redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                    });
                    return { data: { user: null, session: null }, error };
                }
                else if ('phone' in credentials) {
                    const { phone, type, options } = credentials;
                    const { data, error } = await _request(this.fetch, 'POST', endpoint, {
                        headers: this.headers,
                        body: {
                            phone,
                            type,
                            gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                        },
                    });
                    return { data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id }, error };
                }
                throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a type');
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null, session: null }, error };
                }
                throw error;
            }
        }
        /**
         * Returns the session, refreshing it if necessary.
         *
         * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
         *
         * **IMPORTANT:** This method loads values directly from the storage attached
         * to the client. If that storage is based on request cookies for example,
         * the values in it may not be authentic and therefore it's strongly advised
         * against using this method and its results in such circumstances. A warning
         * will be emitted if this is detected. Use {@link #getUser()} instead.
         */
        async getSession() {
            await this.initializePromise;
            const result = await this._acquireLock(-1, async () => {
                return this._useSession(async (result) => {
                    return result;
                });
            });
            return result;
        }
        /**
         * Acquires a global lock based on the storage key.
         */
        async _acquireLock(acquireTimeout, fn) {
            this._debug('#_acquireLock', 'begin', acquireTimeout);
            try {
                if (this.lockAcquired) {
                    const last = this.pendingInLock.length
                        ? this.pendingInLock[this.pendingInLock.length - 1]
                        : Promise.resolve();
                    const result = (async () => {
                        await last;
                        return await fn();
                    })();
                    this.pendingInLock.push((async () => {
                        try {
                            await result;
                        }
                        catch (e) {
                            // we just care if it finished
                        }
                    })());
                    return result;
                }
                return await this.lock(`lock:${this.storageKey}`, acquireTimeout, async () => {
                    this._debug('#_acquireLock', 'lock acquired for storage key', this.storageKey);
                    try {
                        this.lockAcquired = true;
                        const result = fn();
                        this.pendingInLock.push((async () => {
                            try {
                                await result;
                            }
                            catch (e) {
                                // we just care if it finished
                            }
                        })());
                        await result;
                        // keep draining the queue until there's nothing to wait on
                        while (this.pendingInLock.length) {
                            const waitOn = [...this.pendingInLock];
                            await Promise.all(waitOn);
                            this.pendingInLock.splice(0, waitOn.length);
                        }
                        return await result;
                    }
                    finally {
                        this._debug('#_acquireLock', 'lock released for storage key', this.storageKey);
                        this.lockAcquired = false;
                    }
                });
            }
            finally {
                this._debug('#_acquireLock', 'end');
            }
        }
        /**
         * Use instead of {@link #getSession} inside the library. It is
         * semantically usually what you want, as getting a session involves some
         * processing afterwards that requires only one client operating on the
         * session at once across multiple tabs or processes.
         */
        async _useSession(fn) {
            this._debug('#_useSession', 'begin');
            try {
                // the use of __loadSession here is the only correct use of the function!
                const result = await this.__loadSession();
                return await fn(result);
            }
            finally {
                this._debug('#_useSession', 'end');
            }
        }
        /**
         * NEVER USE DIRECTLY!
         *
         * Always use {@link #_useSession}.
         */
        async __loadSession() {
            this._debug('#__loadSession()', 'begin');
            if (!this.lockAcquired) {
                this._debug('#__loadSession()', 'used outside of an acquired lock!', new Error().stack);
            }
            try {
                let currentSession = null;
                const maybeSession = await getItemAsync(this.storage, this.storageKey);
                this._debug('#getSession()', 'session from storage', maybeSession);
                if (maybeSession !== null) {
                    if (this._isValidSession(maybeSession)) {
                        currentSession = maybeSession;
                    }
                    else {
                        this._debug('#getSession()', 'session from storage is not valid');
                        await this._removeSession();
                    }
                }
                if (!currentSession) {
                    return { data: { session: null }, error: null };
                }
                // A session is considered expired before the access token _actually_
                // expires. When the autoRefreshToken option is off (or when the tab is
                // in the background), very eager users of getSession() -- like
                // realtime-js -- might send a valid JWT which will expire by the time it
                // reaches the server.
                const hasExpired = currentSession.expires_at
                    ? currentSession.expires_at * 1000 - Date.now() < EXPIRY_MARGIN_MS
                    : false;
                this._debug('#__loadSession()', `session has${hasExpired ? '' : ' not'} expired`, 'expires_at', currentSession.expires_at);
                if (!hasExpired) {
                    if (this.storage.isServer) {
                        let suppressWarning = this.suppressGetSessionWarning;
                        const proxySession = new Proxy(currentSession, {
                            get: (target, prop, receiver) => {
                                if (!suppressWarning && prop === 'user') {
                                    // only show warning when the user object is being accessed from the server
                                    console.warn('Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.');
                                    suppressWarning = true; // keeps this proxy instance from logging additional warnings
                                    this.suppressGetSessionWarning = true; // keeps this client's future proxy instances from warning
                                }
                                return Reflect.get(target, prop, receiver);
                            },
                        });
                        currentSession = proxySession;
                    }
                    return { data: { session: currentSession }, error: null };
                }
                const { session, error } = await this._callRefreshToken(currentSession.refresh_token);
                if (error) {
                    return { data: { session: null }, error };
                }
                return { data: { session }, error: null };
            }
            finally {
                this._debug('#__loadSession()', 'end');
            }
        }
        /**
         * Gets the current user details if there is an existing session. This method
         * performs a network request to the Supabase Auth server, so the returned
         * value is authentic and can be used to base authorization rules on.
         *
         * @param jwt Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
         */
        async getUser(jwt) {
            if (jwt) {
                return await this._getUser(jwt);
            }
            await this.initializePromise;
            const result = await this._acquireLock(-1, async () => {
                return await this._getUser();
            });
            return result;
        }
        async _getUser(jwt) {
            try {
                if (jwt) {
                    return await _request(this.fetch, 'GET', `${this.url}/user`, {
                        headers: this.headers,
                        jwt: jwt,
                        xform: _userResponse,
                    });
                }
                return await this._useSession(async (result) => {
                    var _a, _b, _c;
                    const { data, error } = result;
                    if (error) {
                        throw error;
                    }
                    // returns an error if there is no access_token or custom authorization header
                    if (!((_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) && !this.hasCustomAuthorizationHeader) {
                        return { data: { user: null }, error: new AuthSessionMissingError() };
                    }
                    return await _request(this.fetch, 'GET', `${this.url}/user`, {
                        headers: this.headers,
                        jwt: (_c = (_b = data.session) === null || _b === void 0 ? void 0 : _b.access_token) !== null && _c !== void 0 ? _c : undefined,
                        xform: _userResponse,
                    });
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    if (isAuthSessionMissingError(error)) {
                        // JWT contains a `session_id` which does not correspond to an active
                        // session in the database, indicating the user is signed out.
                        await this._removeSession();
                        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
                    }
                    return { data: { user: null }, error };
                }
                throw error;
            }
        }
        /**
         * Updates user data for a logged in user.
         */
        async updateUser(attributes, options = {}) {
            await this.initializePromise;
            return await this._acquireLock(-1, async () => {
                return await this._updateUser(attributes, options);
            });
        }
        async _updateUser(attributes, options = {}) {
            try {
                return await this._useSession(async (result) => {
                    const { data: sessionData, error: sessionError } = result;
                    if (sessionError) {
                        throw sessionError;
                    }
                    if (!sessionData.session) {
                        throw new AuthSessionMissingError();
                    }
                    const session = sessionData.session;
                    let codeChallenge = null;
                    let codeChallengeMethod = null;
                    if (this.flowType === 'pkce' && attributes.email != null) {
                        ;
                        [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
                    }
                    const { data, error: userError } = await _request(this.fetch, 'PUT', `${this.url}/user`, {
                        headers: this.headers,
                        redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                        body: Object.assign(Object.assign({}, attributes), { code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
                        jwt: session.access_token,
                        xform: _userResponse,
                    });
                    if (userError)
                        throw userError;
                    session.user = data.user;
                    await this._saveSession(session);
                    await this._notifyAllSubscribers('USER_UPDATED', session);
                    return { data: { user: session.user }, error: null };
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null }, error };
                }
                throw error;
            }
        }
        /**
         * Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session.
         * If the refresh token or access token in the current session is invalid, an error will be thrown.
         * @param currentSession The current session that minimally contains an access token and refresh token.
         */
        async setSession(currentSession) {
            await this.initializePromise;
            return await this._acquireLock(-1, async () => {
                return await this._setSession(currentSession);
            });
        }
        async _setSession(currentSession) {
            try {
                if (!currentSession.access_token || !currentSession.refresh_token) {
                    throw new AuthSessionMissingError();
                }
                const timeNow = Date.now() / 1000;
                let expiresAt = timeNow;
                let hasExpired = true;
                let session = null;
                const { payload } = decodeJWT(currentSession.access_token);
                if (payload.exp) {
                    expiresAt = payload.exp;
                    hasExpired = expiresAt <= timeNow;
                }
                if (hasExpired) {
                    const { session: refreshedSession, error } = await this._callRefreshToken(currentSession.refresh_token);
                    if (error) {
                        return { data: { user: null, session: null }, error: error };
                    }
                    if (!refreshedSession) {
                        return { data: { user: null, session: null }, error: null };
                    }
                    session = refreshedSession;
                }
                else {
                    const { data, error } = await this._getUser(currentSession.access_token);
                    if (error) {
                        throw error;
                    }
                    session = {
                        access_token: currentSession.access_token,
                        refresh_token: currentSession.refresh_token,
                        user: data.user,
                        token_type: 'bearer',
                        expires_in: expiresAt - timeNow,
                        expires_at: expiresAt,
                    };
                    await this._saveSession(session);
                    await this._notifyAllSubscribers('SIGNED_IN', session);
                }
                return { data: { user: session.user, session }, error: null };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { session: null, user: null }, error };
                }
                throw error;
            }
        }
        /**
         * Returns a new session, regardless of expiry status.
         * Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession().
         * If the current session's refresh token is invalid, an error will be thrown.
         * @param currentSession The current session. If passed in, it must contain a refresh token.
         */
        async refreshSession(currentSession) {
            await this.initializePromise;
            return await this._acquireLock(-1, async () => {
                return await this._refreshSession(currentSession);
            });
        }
        async _refreshSession(currentSession) {
            try {
                return await this._useSession(async (result) => {
                    var _a;
                    if (!currentSession) {
                        const { data, error } = result;
                        if (error) {
                            throw error;
                        }
                        currentSession = (_a = data.session) !== null && _a !== void 0 ? _a : undefined;
                    }
                    if (!(currentSession === null || currentSession === void 0 ? void 0 : currentSession.refresh_token)) {
                        throw new AuthSessionMissingError();
                    }
                    const { session, error } = await this._callRefreshToken(currentSession.refresh_token);
                    if (error) {
                        return { data: { user: null, session: null }, error: error };
                    }
                    if (!session) {
                        return { data: { user: null, session: null }, error: null };
                    }
                    return { data: { user: session.user, session }, error: null };
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null, session: null }, error };
                }
                throw error;
            }
        }
        /**
         * Gets the session data from a URL string
         */
        async _getSessionFromURL(params, callbackUrlType) {
            try {
                if (!isBrowser())
                    throw new AuthImplicitGrantRedirectError('No browser detected.');
                // If there's an error in the URL, it doesn't matter what flow it is, we just return the error.
                if (params.error || params.error_description || params.error_code) {
                    // The error class returned implies that the redirect is from an implicit grant flow
                    // but it could also be from a redirect error from a PKCE flow.
                    throw new AuthImplicitGrantRedirectError(params.error_description || 'Error in URL with unspecified error_description', {
                        error: params.error || 'unspecified_error',
                        code: params.error_code || 'unspecified_code',
                    });
                }
                // Checks for mismatches between the flowType initialised in the client and the URL parameters
                switch (callbackUrlType) {
                    case 'implicit':
                        if (this.flowType === 'pkce') {
                            throw new AuthPKCEGrantCodeExchangeError('Not a valid PKCE flow url.');
                        }
                        break;
                    case 'pkce':
                        if (this.flowType === 'implicit') {
                            throw new AuthImplicitGrantRedirectError('Not a valid implicit grant flow url.');
                        }
                        break;
                    default:
                    // there's no mismatch so we continue
                }
                // Since this is a redirect for PKCE, we attempt to retrieve the code from the URL for the code exchange
                if (callbackUrlType === 'pkce') {
                    this._debug('#_initialize()', 'begin', 'is PKCE flow', true);
                    if (!params.code)
                        throw new AuthPKCEGrantCodeExchangeError('No code detected.');
                    const { data, error } = await this._exchangeCodeForSession(params.code);
                    if (error)
                        throw error;
                    const url = new URL(window.location.href);
                    url.searchParams.delete('code');
                    window.history.replaceState(window.history.state, '', url.toString());
                    return { data: { session: data.session, redirectType: null }, error: null };
                }
                const { provider_token, provider_refresh_token, access_token, refresh_token, expires_in, expires_at, token_type, } = params;
                if (!access_token || !expires_in || !refresh_token || !token_type) {
                    throw new AuthImplicitGrantRedirectError('No session defined in URL');
                }
                const timeNow = Math.round(Date.now() / 1000);
                const expiresIn = parseInt(expires_in);
                let expiresAt = timeNow + expiresIn;
                if (expires_at) {
                    expiresAt = parseInt(expires_at);
                }
                const actuallyExpiresIn = expiresAt - timeNow;
                if (actuallyExpiresIn * 1000 <= AUTO_REFRESH_TICK_DURATION_MS) {
                    console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${actuallyExpiresIn}s, should have been closer to ${expiresIn}s`);
                }
                const issuedAt = expiresAt - expiresIn;
                if (timeNow - issuedAt >= 120) {
                    console.warn('@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale', issuedAt, expiresAt, timeNow);
                }
                else if (timeNow - issuedAt < 0) {
                    console.warn('@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew', issuedAt, expiresAt, timeNow);
                }
                const { data, error } = await this._getUser(access_token);
                if (error)
                    throw error;
                const session = {
                    provider_token,
                    provider_refresh_token,
                    access_token,
                    expires_in: expiresIn,
                    expires_at: expiresAt,
                    refresh_token,
                    token_type,
                    user: data.user,
                };
                // Remove tokens from URL
                window.location.hash = '';
                this._debug('#_getSessionFromURL()', 'clearing window.location.hash');
                return { data: { session, redirectType: params.type }, error: null };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { session: null, redirectType: null }, error };
                }
                throw error;
            }
        }
        /**
         * Checks if the current URL contains parameters given by an implicit oauth grant flow (https://www.rfc-editor.org/rfc/rfc6749.html#section-4.2)
         */
        _isImplicitGrantCallback(params) {
            return Boolean(params.access_token || params.error_description);
        }
        /**
         * Checks if the current URL and backing storage contain parameters given by a PKCE flow
         */
        async _isPKCECallback(params) {
            const currentStorageContent = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
            return !!(params.code && currentStorageContent);
        }
        /**
         * Inside a browser context, `signOut()` will remove the logged in user from the browser session and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.
         *
         * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`.
         * There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.
         *
         * If using `others` scope, no `SIGNED_OUT` event is fired!
         */
        async signOut(options = { scope: 'global' }) {
            await this.initializePromise;
            return await this._acquireLock(-1, async () => {
                return await this._signOut(options);
            });
        }
        async _signOut({ scope } = { scope: 'global' }) {
            return await this._useSession(async (result) => {
                var _a;
                const { data, error: sessionError } = result;
                if (sessionError) {
                    return { error: sessionError };
                }
                const accessToken = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token;
                if (accessToken) {
                    const { error } = await this.admin.signOut(accessToken, scope);
                    if (error) {
                        // ignore 404s since user might not exist anymore
                        // ignore 401s since an invalid or expired JWT should sign out the current session
                        if (!(isAuthApiError(error) &&
                            (error.status === 404 || error.status === 401 || error.status === 403))) {
                            return { error };
                        }
                    }
                }
                if (scope !== 'others') {
                    await this._removeSession();
                    await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
                }
                return { error: null };
            });
        }
        /**
         * Receive a notification every time an auth event happens.
         * @param callback A callback function to be invoked when an auth event happens.
         */
        onAuthStateChange(callback) {
            const id = uuid();
            const subscription = {
                id,
                callback,
                unsubscribe: () => {
                    this._debug('#unsubscribe()', 'state change callback with id removed', id);
                    this.stateChangeEmitters.delete(id);
                },
            };
            this._debug('#onAuthStateChange()', 'registered callback with id', id);
            this.stateChangeEmitters.set(id, subscription);
            (async () => {
                await this.initializePromise;
                await this._acquireLock(-1, async () => {
                    this._emitInitialSession(id);
                });
            })();
            return { data: { subscription } };
        }
        async _emitInitialSession(id) {
            return await this._useSession(async (result) => {
                var _a, _b;
                try {
                    const { data: { session }, error, } = result;
                    if (error)
                        throw error;
                    await ((_a = this.stateChangeEmitters.get(id)) === null || _a === void 0 ? void 0 : _a.callback('INITIAL_SESSION', session));
                    this._debug('INITIAL_SESSION', 'callback id', id, 'session', session);
                }
                catch (err) {
                    await ((_b = this.stateChangeEmitters.get(id)) === null || _b === void 0 ? void 0 : _b.callback('INITIAL_SESSION', null));
                    this._debug('INITIAL_SESSION', 'callback id', id, 'error', err);
                    console.error(err);
                }
            });
        }
        /**
         * Sends a password reset request to an email address. This method supports the PKCE flow.
         *
         * @param email The email address of the user.
         * @param options.redirectTo The URL to send the user to after they click the password reset link.
         * @param options.captchaToken Verification token received when the user completes the captcha on the site.
         */
        async resetPasswordForEmail(email, options = {}) {
            let codeChallenge = null;
            let codeChallengeMethod = null;
            if (this.flowType === 'pkce') {
                [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey, true // isPasswordRecovery
                );
            }
            try {
                return await _request(this.fetch, 'POST', `${this.url}/recover`, {
                    body: {
                        email,
                        code_challenge: codeChallenge,
                        code_challenge_method: codeChallengeMethod,
                        gotrue_meta_security: { captcha_token: options.captchaToken },
                    },
                    headers: this.headers,
                    redirectTo: options.redirectTo,
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        }
        /**
         * Gets all the identities linked to a user.
         */
        async getUserIdentities() {
            var _a;
            try {
                const { data, error } = await this.getUser();
                if (error)
                    throw error;
                return { data: { identities: (_a = data.user.identities) !== null && _a !== void 0 ? _a : [] }, error: null };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        }
        /**
         * Links an oauth identity to an existing user.
         * This method supports the PKCE flow.
         */
        async linkIdentity(credentials) {
            var _a;
            try {
                const { data, error } = await this._useSession(async (result) => {
                    var _a, _b, _c, _d, _e;
                    const { data, error } = result;
                    if (error)
                        throw error;
                    const url = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, credentials.provider, {
                        redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
                        scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
                        queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
                        skipBrowserRedirect: true,
                    });
                    return await _request(this.fetch, 'GET', url, {
                        headers: this.headers,
                        jwt: (_e = (_d = data.session) === null || _d === void 0 ? void 0 : _d.access_token) !== null && _e !== void 0 ? _e : undefined,
                    });
                });
                if (error)
                    throw error;
                if (isBrowser() && !((_a = credentials.options) === null || _a === void 0 ? void 0 : _a.skipBrowserRedirect)) {
                    window.location.assign(data === null || data === void 0 ? void 0 : data.url);
                }
                return { data: { provider: credentials.provider, url: data === null || data === void 0 ? void 0 : data.url }, error: null };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { provider: credentials.provider, url: null }, error };
                }
                throw error;
            }
        }
        /**
         * Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.
         */
        async unlinkIdentity(identity) {
            try {
                return await this._useSession(async (result) => {
                    var _a, _b;
                    const { data, error } = result;
                    if (error) {
                        throw error;
                    }
                    return await _request(this.fetch, 'DELETE', `${this.url}/user/identities/${identity.identity_id}`, {
                        headers: this.headers,
                        jwt: (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : undefined,
                    });
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        }
        /**
         * Generates a new JWT.
         * @param refreshToken A valid refresh token that was returned on login.
         */
        async _refreshAccessToken(refreshToken) {
            const debugName = `#_refreshAccessToken(${refreshToken.substring(0, 5)}...)`;
            this._debug(debugName, 'begin');
            try {
                const startedAt = Date.now();
                // will attempt to refresh the token with exponential backoff
                return await retryable(async (attempt) => {
                    if (attempt > 0) {
                        await sleep(200 * Math.pow(2, attempt - 1)); // 200, 400, 800, ...
                    }
                    this._debug(debugName, 'refreshing attempt', attempt);
                    return await _request(this.fetch, 'POST', `${this.url}/token?grant_type=refresh_token`, {
                        body: { refresh_token: refreshToken },
                        headers: this.headers,
                        xform: _sessionResponse,
                    });
                }, (attempt, error) => {
                    const nextBackOffInterval = 200 * Math.pow(2, attempt);
                    return (error &&
                        isAuthRetryableFetchError(error) &&
                        // retryable only if the request can be sent before the backoff overflows the tick duration
                        Date.now() + nextBackOffInterval - startedAt < AUTO_REFRESH_TICK_DURATION_MS);
                });
            }
            catch (error) {
                this._debug(debugName, 'error', error);
                if (isAuthError(error)) {
                    return { data: { session: null, user: null }, error };
                }
                throw error;
            }
            finally {
                this._debug(debugName, 'end');
            }
        }
        _isValidSession(maybeSession) {
            const isValidSession = typeof maybeSession === 'object' &&
                maybeSession !== null &&
                'access_token' in maybeSession &&
                'refresh_token' in maybeSession &&
                'expires_at' in maybeSession;
            return isValidSession;
        }
        async _handleProviderSignIn(provider, options) {
            const url = await this._getUrlForProvider(`${this.url}/authorize`, provider, {
                redirectTo: options.redirectTo,
                scopes: options.scopes,
                queryParams: options.queryParams,
            });
            this._debug('#_handleProviderSignIn()', 'provider', provider, 'options', options, 'url', url);
            // try to open on the browser
            if (isBrowser() && !options.skipBrowserRedirect) {
                window.location.assign(url);
            }
            return { data: { provider, url }, error: null };
        }
        /**
         * Recovers the session from LocalStorage and refreshes the token
         * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
         */
        async _recoverAndRefresh() {
            var _a;
            const debugName = '#_recoverAndRefresh()';
            this._debug(debugName, 'begin');
            try {
                const currentSession = await getItemAsync(this.storage, this.storageKey);
                this._debug(debugName, 'session from storage', currentSession);
                if (!this._isValidSession(currentSession)) {
                    this._debug(debugName, 'session is not valid');
                    if (currentSession !== null) {
                        await this._removeSession();
                    }
                    return;
                }
                const expiresWithMargin = ((_a = currentSession.expires_at) !== null && _a !== void 0 ? _a : Infinity) * 1000 - Date.now() < EXPIRY_MARGIN_MS;
                this._debug(debugName, `session has${expiresWithMargin ? '' : ' not'} expired with margin of ${EXPIRY_MARGIN_MS}s`);
                if (expiresWithMargin) {
                    if (this.autoRefreshToken && currentSession.refresh_token) {
                        const { error } = await this._callRefreshToken(currentSession.refresh_token);
                        if (error) {
                            console.error(error);
                            if (!isAuthRetryableFetchError(error)) {
                                this._debug(debugName, 'refresh failed with a non-retryable error, removing the session', error);
                                await this._removeSession();
                            }
                        }
                    }
                }
                else {
                    // no need to persist currentSession again, as we just loaded it from
                    // local storage; persisting it again may overwrite a value saved by
                    // another client with access to the same local storage
                    await this._notifyAllSubscribers('SIGNED_IN', currentSession);
                }
            }
            catch (err) {
                this._debug(debugName, 'error', err);
                console.error(err);
                return;
            }
            finally {
                this._debug(debugName, 'end');
            }
        }
        async _callRefreshToken(refreshToken) {
            var _a, _b;
            if (!refreshToken) {
                throw new AuthSessionMissingError();
            }
            // refreshing is already in progress
            if (this.refreshingDeferred) {
                return this.refreshingDeferred.promise;
            }
            const debugName = `#_callRefreshToken(${refreshToken.substring(0, 5)}...)`;
            this._debug(debugName, 'begin');
            try {
                this.refreshingDeferred = new Deferred();
                const { data, error } = await this._refreshAccessToken(refreshToken);
                if (error)
                    throw error;
                if (!data.session)
                    throw new AuthSessionMissingError();
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('TOKEN_REFRESHED', data.session);
                const result = { session: data.session, error: null };
                this.refreshingDeferred.resolve(result);
                return result;
            }
            catch (error) {
                this._debug(debugName, 'error', error);
                if (isAuthError(error)) {
                    const result = { session: null, error };
                    if (!isAuthRetryableFetchError(error)) {
                        await this._removeSession();
                    }
                    (_a = this.refreshingDeferred) === null || _a === void 0 ? void 0 : _a.resolve(result);
                    return result;
                }
                (_b = this.refreshingDeferred) === null || _b === void 0 ? void 0 : _b.reject(error);
                throw error;
            }
            finally {
                this.refreshingDeferred = null;
                this._debug(debugName, 'end');
            }
        }
        async _notifyAllSubscribers(event, session, broadcast = true) {
            const debugName = `#_notifyAllSubscribers(${event})`;
            this._debug(debugName, 'begin', session, `broadcast = ${broadcast}`);
            try {
                if (this.broadcastChannel && broadcast) {
                    this.broadcastChannel.postMessage({ event, session });
                }
                const errors = [];
                const promises = Array.from(this.stateChangeEmitters.values()).map(async (x) => {
                    try {
                        await x.callback(event, session);
                    }
                    catch (e) {
                        errors.push(e);
                    }
                });
                await Promise.all(promises);
                if (errors.length > 0) {
                    for (let i = 0; i < errors.length; i += 1) {
                        console.error(errors[i]);
                    }
                    throw errors[0];
                }
            }
            finally {
                this._debug(debugName, 'end');
            }
        }
        /**
         * set currentSession and currentUser
         * process to _startAutoRefreshToken if possible
         */
        async _saveSession(session) {
            this._debug('#_saveSession()', session);
            // _saveSession is always called whenever a new session has been acquired
            // so we can safely suppress the warning returned by future getSession calls
            this.suppressGetSessionWarning = true;
            await setItemAsync(this.storage, this.storageKey, session);
        }
        async _removeSession() {
            this._debug('#_removeSession()');
            await removeItemAsync(this.storage, this.storageKey);
            await this._notifyAllSubscribers('SIGNED_OUT', null);
        }
        /**
         * Removes any registered visibilitychange callback.
         *
         * {@see #startAutoRefresh}
         * {@see #stopAutoRefresh}
         */
        _removeVisibilityChangedCallback() {
            this._debug('#_removeVisibilityChangedCallback()');
            const callback = this.visibilityChangedCallback;
            this.visibilityChangedCallback = null;
            try {
                if (callback && isBrowser() && (window === null || window === void 0 ? void 0 : window.removeEventListener)) {
                    window.removeEventListener('visibilitychange', callback);
                }
            }
            catch (e) {
                console.error('removing visibilitychange callback failed', e);
            }
        }
        /**
         * This is the private implementation of {@link #startAutoRefresh}. Use this
         * within the library.
         */
        async _startAutoRefresh() {
            await this._stopAutoRefresh();
            this._debug('#_startAutoRefresh()');
            const ticker = setInterval(() => this._autoRefreshTokenTick(), AUTO_REFRESH_TICK_DURATION_MS);
            this.autoRefreshTicker = ticker;
            if (ticker && typeof ticker === 'object' && typeof ticker.unref === 'function') {
                // ticker is a NodeJS Timeout object that has an `unref` method
                // https://nodejs.org/api/timers.html#timeoutunref
                // When auto refresh is used in NodeJS (like for testing) the
                // `setInterval` is preventing the process from being marked as
                // finished and tests run endlessly. This can be prevented by calling
                // `unref()` on the returned object.
                ticker.unref();
                // @ts-expect-error TS has no context of Deno
            }
            else if (typeof Deno !== 'undefined' && typeof Deno.unrefTimer === 'function') {
                // similar like for NodeJS, but with the Deno API
                // https://deno.land/api@latest?unstable&s=Deno.unrefTimer
                // @ts-expect-error TS has no context of Deno
                Deno.unrefTimer(ticker);
            }
            // run the tick immediately, but in the next pass of the event loop so that
            // #_initialize can be allowed to complete without recursively waiting on
            // itself
            setTimeout(async () => {
                await this.initializePromise;
                await this._autoRefreshTokenTick();
            }, 0);
        }
        /**
         * This is the private implementation of {@link #stopAutoRefresh}. Use this
         * within the library.
         */
        async _stopAutoRefresh() {
            this._debug('#_stopAutoRefresh()');
            const ticker = this.autoRefreshTicker;
            this.autoRefreshTicker = null;
            if (ticker) {
                clearInterval(ticker);
            }
        }
        /**
         * Starts an auto-refresh process in the background. The session is checked
         * every few seconds. Close to the time of expiration a process is started to
         * refresh the session. If refreshing fails it will be retried for as long as
         * necessary.
         *
         * If you set the {@link GoTrueClientOptions#autoRefreshToken} you don't need
         * to call this function, it will be called for you.
         *
         * On browsers the refresh process works only when the tab/window is in the
         * foreground to conserve resources as well as prevent race conditions and
         * flooding auth with requests. If you call this method any managed
         * visibility change callback will be removed and you must manage visibility
         * changes on your own.
         *
         * On non-browser platforms the refresh process works *continuously* in the
         * background, which may not be desirable. You should hook into your
         * platform's foreground indication mechanism and call these methods
         * appropriately to conserve resources.
         *
         * {@see #stopAutoRefresh}
         */
        async startAutoRefresh() {
            this._removeVisibilityChangedCallback();
            await this._startAutoRefresh();
        }
        /**
         * Stops an active auto refresh process running in the background (if any).
         *
         * If you call this method any managed visibility change callback will be
         * removed and you must manage visibility changes on your own.
         *
         * See {@link #startAutoRefresh} for more details.
         */
        async stopAutoRefresh() {
            this._removeVisibilityChangedCallback();
            await this._stopAutoRefresh();
        }
        /**
         * Runs the auto refresh token tick.
         */
        async _autoRefreshTokenTick() {
            this._debug('#_autoRefreshTokenTick()', 'begin');
            try {
                await this._acquireLock(0, async () => {
                    try {
                        const now = Date.now();
                        try {
                            return await this._useSession(async (result) => {
                                const { data: { session }, } = result;
                                if (!session || !session.refresh_token || !session.expires_at) {
                                    this._debug('#_autoRefreshTokenTick()', 'no session');
                                    return;
                                }
                                // session will expire in this many ticks (or has already expired if <= 0)
                                const expiresInTicks = Math.floor((session.expires_at * 1000 - now) / AUTO_REFRESH_TICK_DURATION_MS);
                                this._debug('#_autoRefreshTokenTick()', `access token expires in ${expiresInTicks} ticks, a tick lasts ${AUTO_REFRESH_TICK_DURATION_MS}ms, refresh threshold is ${AUTO_REFRESH_TICK_THRESHOLD} ticks`);
                                if (expiresInTicks <= AUTO_REFRESH_TICK_THRESHOLD) {
                                    await this._callRefreshToken(session.refresh_token);
                                }
                            });
                        }
                        catch (e) {
                            console.error('Auto refresh tick failed with error. This is likely a transient error.', e);
                        }
                    }
                    finally {
                        this._debug('#_autoRefreshTokenTick()', 'end');
                    }
                });
            }
            catch (e) {
                if (e.isAcquireTimeout || e instanceof LockAcquireTimeoutError) {
                    this._debug('auto refresh token tick lock not available');
                }
                else {
                    throw e;
                }
            }
        }
        /**
         * Registers callbacks on the browser / platform, which in-turn run
         * algorithms when the browser window/tab are in foreground. On non-browser
         * platforms it assumes always foreground.
         */
        async _handleVisibilityChange() {
            this._debug('#_handleVisibilityChange()');
            if (!isBrowser() || !(window === null || window === void 0 ? void 0 : window.addEventListener)) {
                if (this.autoRefreshToken) {
                    // in non-browser environments the refresh token ticker runs always
                    this.startAutoRefresh();
                }
                return false;
            }
            try {
                this.visibilityChangedCallback = async () => await this._onVisibilityChanged(false);
                window === null || window === void 0 ? void 0 : window.addEventListener('visibilitychange', this.visibilityChangedCallback);
                // now immediately call the visbility changed callback to setup with the
                // current visbility state
                await this._onVisibilityChanged(true); // initial call
            }
            catch (error) {
                console.error('_handleVisibilityChange', error);
            }
        }
        /**
         * Callback registered with `window.addEventListener('visibilitychange')`.
         */
        async _onVisibilityChanged(calledFromInitialize) {
            const methodName = `#_onVisibilityChanged(${calledFromInitialize})`;
            this._debug(methodName, 'visibilityState', document.visibilityState);
            if (document.visibilityState === 'visible') {
                if (this.autoRefreshToken) {
                    // in browser environments the refresh token ticker runs only on focused tabs
                    // which prevents race conditions
                    this._startAutoRefresh();
                }
                if (!calledFromInitialize) {
                    // called when the visibility has changed, i.e. the browser
                    // transitioned from hidden -> visible so we need to see if the session
                    // should be recovered immediately... but to do that we need to acquire
                    // the lock first asynchronously
                    await this.initializePromise;
                    await this._acquireLock(-1, async () => {
                        if (document.visibilityState !== 'visible') {
                            this._debug(methodName, 'acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting');
                            // visibility has changed while waiting for the lock, abort
                            return;
                        }
                        // recover the session
                        await this._recoverAndRefresh();
                    });
                }
            }
            else if (document.visibilityState === 'hidden') {
                if (this.autoRefreshToken) {
                    this._stopAutoRefresh();
                }
            }
        }
        /**
         * Generates the relevant login URL for a third-party provider.
         * @param options.redirectTo A URL or mobile address to send the user to after they are confirmed.
         * @param options.scopes A space-separated list of scopes granted to the OAuth application.
         * @param options.queryParams An object of key-value pairs containing query parameters granted to the OAuth application.
         */
        async _getUrlForProvider(url, provider, options) {
            const urlParams = [`provider=${encodeURIComponent(provider)}`];
            if (options === null || options === void 0 ? void 0 : options.redirectTo) {
                urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
            }
            if (options === null || options === void 0 ? void 0 : options.scopes) {
                urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
            }
            if (this.flowType === 'pkce') {
                const [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
                const flowParams = new URLSearchParams({
                    code_challenge: `${encodeURIComponent(codeChallenge)}`,
                    code_challenge_method: `${encodeURIComponent(codeChallengeMethod)}`,
                });
                urlParams.push(flowParams.toString());
            }
            if (options === null || options === void 0 ? void 0 : options.queryParams) {
                const query = new URLSearchParams(options.queryParams);
                urlParams.push(query.toString());
            }
            if (options === null || options === void 0 ? void 0 : options.skipBrowserRedirect) {
                urlParams.push(`skip_http_redirect=${options.skipBrowserRedirect}`);
            }
            return `${url}?${urlParams.join('&')}`;
        }
        async _unenroll(params) {
            try {
                return await this._useSession(async (result) => {
                    var _a;
                    const { data: sessionData, error: sessionError } = result;
                    if (sessionError) {
                        return { data: null, error: sessionError };
                    }
                    return await _request(this.fetch, 'DELETE', `${this.url}/factors/${params.factorId}`, {
                        headers: this.headers,
                        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                    });
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        }
        async _enroll(params) {
            try {
                return await this._useSession(async (result) => {
                    var _a, _b;
                    const { data: sessionData, error: sessionError } = result;
                    if (sessionError) {
                        return { data: null, error: sessionError };
                    }
                    const body = Object.assign({ friendly_name: params.friendlyName, factor_type: params.factorType }, (params.factorType === 'phone' ? { phone: params.phone } : { issuer: params.issuer }));
                    const { data, error } = await _request(this.fetch, 'POST', `${this.url}/factors`, {
                        body,
                        headers: this.headers,
                        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                    });
                    if (error) {
                        return { data: null, error };
                    }
                    if (params.factorType === 'totp' && ((_b = data === null || data === void 0 ? void 0 : data.totp) === null || _b === void 0 ? void 0 : _b.qr_code)) {
                        data.totp.qr_code = `data:image/svg+xml;utf-8,${data.totp.qr_code}`;
                    }
                    return { data, error: null };
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        }
        /**
         * {@see GoTrueMFAApi#verify}
         */
        async _verify(params) {
            return this._acquireLock(-1, async () => {
                try {
                    return await this._useSession(async (result) => {
                        var _a;
                        const { data: sessionData, error: sessionError } = result;
                        if (sessionError) {
                            return { data: null, error: sessionError };
                        }
                        const { data, error } = await _request(this.fetch, 'POST', `${this.url}/factors/${params.factorId}/verify`, {
                            body: { code: params.code, challenge_id: params.challengeId },
                            headers: this.headers,
                            jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                        });
                        if (error) {
                            return { data: null, error };
                        }
                        await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1000) + data.expires_in }, data));
                        await this._notifyAllSubscribers('MFA_CHALLENGE_VERIFIED', data);
                        return { data, error };
                    });
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * {@see GoTrueMFAApi#challenge}
         */
        async _challenge(params) {
            return this._acquireLock(-1, async () => {
                try {
                    return await this._useSession(async (result) => {
                        var _a;
                        const { data: sessionData, error: sessionError } = result;
                        if (sessionError) {
                            return { data: null, error: sessionError };
                        }
                        return await _request(this.fetch, 'POST', `${this.url}/factors/${params.factorId}/challenge`, {
                            body: { channel: params.channel },
                            headers: this.headers,
                            jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                        });
                    });
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * {@see GoTrueMFAApi#challengeAndVerify}
         */
        async _challengeAndVerify(params) {
            // both _challenge and _verify independently acquire the lock, so no need
            // to acquire it here
            const { data: challengeData, error: challengeError } = await this._challenge({
                factorId: params.factorId,
            });
            if (challengeError) {
                return { data: null, error: challengeError };
            }
            return await this._verify({
                factorId: params.factorId,
                challengeId: challengeData.id,
                code: params.code,
            });
        }
        /**
         * {@see GoTrueMFAApi#listFactors}
         */
        async _listFactors() {
            // use #getUser instead of #_getUser as the former acquires a lock
            const { data: { user }, error: userError, } = await this.getUser();
            if (userError) {
                return { data: null, error: userError };
            }
            const factors = (user === null || user === void 0 ? void 0 : user.factors) || [];
            const totp = factors.filter((factor) => factor.factor_type === 'totp' && factor.status === 'verified');
            const phone = factors.filter((factor) => factor.factor_type === 'phone' && factor.status === 'verified');
            return {
                data: {
                    all: factors,
                    totp,
                    phone,
                },
                error: null,
            };
        }
        /**
         * {@see GoTrueMFAApi#getAuthenticatorAssuranceLevel}
         */
        async _getAuthenticatorAssuranceLevel() {
            return this._acquireLock(-1, async () => {
                return await this._useSession(async (result) => {
                    var _a, _b;
                    const { data: { session }, error: sessionError, } = result;
                    if (sessionError) {
                        return { data: null, error: sessionError };
                    }
                    if (!session) {
                        return {
                            data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
                            error: null,
                        };
                    }
                    const { payload } = decodeJWT(session.access_token);
                    let currentLevel = null;
                    if (payload.aal) {
                        currentLevel = payload.aal;
                    }
                    let nextLevel = currentLevel;
                    const verifiedFactors = (_b = (_a = session.user.factors) === null || _a === void 0 ? void 0 : _a.filter((factor) => factor.status === 'verified')) !== null && _b !== void 0 ? _b : [];
                    if (verifiedFactors.length > 0) {
                        nextLevel = 'aal2';
                    }
                    const currentAuthenticationMethods = payload.amr || [];
                    return { data: { currentLevel, nextLevel, currentAuthenticationMethods }, error: null };
                });
            });
        }
        async fetchJwk(kid, jwks = { keys: [] }) {
            // try fetching from the supplied jwks
            let jwk = jwks.keys.find((key) => key.kid === kid);
            if (jwk) {
                return jwk;
            }
            // try fetching from cache
            jwk = this.jwks.keys.find((key) => key.kid === kid);
            // jwk exists and jwks isn't stale
            if (jwk && this.jwks_cached_at + JWKS_TTL > Date.now()) {
                return jwk;
            }
            // jwk isn't cached in memory so we need to fetch it from the well-known endpoint
            const { data, error } = await _request(this.fetch, 'GET', `${this.url}/.well-known/jwks.json`, {
                headers: this.headers,
            });
            if (error) {
                throw error;
            }
            if (!data.keys || data.keys.length === 0) {
                throw new AuthInvalidJwtError('JWKS is empty');
            }
            this.jwks = data;
            this.jwks_cached_at = Date.now();
            // Find the signing key
            jwk = data.keys.find((key) => key.kid === kid);
            if (!jwk) {
                throw new AuthInvalidJwtError('No matching signing key found in JWKS');
            }
            return jwk;
        }
        /**
         * @experimental This method may change in future versions.
         * @description Gets the claims from a JWT. If the JWT is symmetric JWTs, it will call getUser() to verify against the server. If the JWT is asymmetric, it will be verified against the JWKS using the WebCrypto API.
         */
        async getClaims(jwt, jwks = { keys: [] }) {
            try {
                let token = jwt;
                if (!token) {
                    const { data, error } = await this.getSession();
                    if (error || !data.session) {
                        return { data: null, error };
                    }
                    token = data.session.access_token;
                }
                const { header, payload, signature, raw: { header: rawHeader, payload: rawPayload }, } = decodeJWT(token);
                // Reject expired JWTs
                validateExp(payload.exp);
                // If symmetric algorithm or WebCrypto API is unavailable, fallback to getUser()
                if (!header.kid ||
                    header.alg === 'HS256' ||
                    !('crypto' in globalThis && 'subtle' in globalThis.crypto)) {
                    const { error } = await this.getUser(token);
                    if (error) {
                        throw error;
                    }
                    // getUser succeeds so the claims in the JWT can be trusted
                    return {
                        data: {
                            claims: payload,
                            header,
                            signature,
                        },
                        error: null,
                    };
                }
                const algorithm = getAlgorithm(header.alg);
                const signingKey = await this.fetchJwk(header.kid, jwks);
                // Convert JWK to CryptoKey
                const publicKey = await crypto.subtle.importKey('jwk', signingKey, algorithm, true, [
                    'verify',
                ]);
                // Verify the signature
                const isValid = await crypto.subtle.verify(algorithm, publicKey, signature, stringToUint8Array(`${rawHeader}.${rawPayload}`));
                if (!isValid) {
                    throw new AuthInvalidJwtError('Invalid JWT signature');
                }
                // If verification succeeds, decode and return claims
                return {
                    data: {
                        claims: payload,
                        header,
                        signature,
                    },
                    error: null,
                };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        }
    }
    GoTrueClient.nextInstanceID = 0;

    const AuthAdminApi = GoTrueAdminApi;

    const AuthClient = GoTrueClient;

    class SupabaseAuthClient extends AuthClient {
        constructor(options) {
            super(options);
        }
    }

    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    /**
     * Supabase Client.
     *
     * An isomorphic Javascript client for interacting with Postgres.
     */
    class SupabaseClient {
        /**
         * Create a new client for use in the browser.
         * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
         * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
         * @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
         * @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
         * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
         * @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
         * @param options.realtime Options passed along to realtime-js constructor.
         * @param options.global.fetch A custom fetch implementation.
         * @param options.global.headers Any additional headers to send with each network request.
         */
        constructor(supabaseUrl, supabaseKey, options) {
            var _a, _b, _c;
            this.supabaseUrl = supabaseUrl;
            this.supabaseKey = supabaseKey;
            if (!supabaseUrl)
                throw new Error('supabaseUrl is required.');
            if (!supabaseKey)
                throw new Error('supabaseKey is required.');
            const _supabaseUrl = ensureTrailingSlash(supabaseUrl);
            const baseUrl = new URL(_supabaseUrl);
            this.realtimeUrl = new URL('realtime/v1', baseUrl);
            this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace('http', 'ws');
            this.authUrl = new URL('auth/v1', baseUrl);
            this.storageUrl = new URL('storage/v1', baseUrl);
            this.functionsUrl = new URL('functions/v1', baseUrl);
            // default storage key uses the supabase project ref as a namespace
            const defaultStorageKey = `sb-${baseUrl.hostname.split('.')[0]}-auth-token`;
            const DEFAULTS = {
                db: DEFAULT_DB_OPTIONS,
                realtime: DEFAULT_REALTIME_OPTIONS,
                auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), { storageKey: defaultStorageKey }),
                global: DEFAULT_GLOBAL_OPTIONS,
            };
            const settings = applySettingDefaults(options !== null && options !== void 0 ? options : {}, DEFAULTS);
            this.storageKey = (_a = settings.auth.storageKey) !== null && _a !== void 0 ? _a : '';
            this.headers = (_b = settings.global.headers) !== null && _b !== void 0 ? _b : {};
            if (!settings.accessToken) {
                this.auth = this._initSupabaseAuthClient((_c = settings.auth) !== null && _c !== void 0 ? _c : {}, this.headers, settings.global.fetch);
            }
            else {
                this.accessToken = settings.accessToken;
                this.auth = new Proxy({}, {
                    get: (_, prop) => {
                        throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop)} is not possible`);
                    },
                });
            }
            this.fetch = fetchWithAuth(supabaseKey, this._getAccessToken.bind(this), settings.global.fetch);
            this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers, accessToken: this._getAccessToken.bind(this) }, settings.realtime));
            this.rest = new PostgrestClient(new URL('rest/v1', baseUrl).href, {
                headers: this.headers,
                schema: settings.db.schema,
                fetch: this.fetch,
            });
            if (!settings.accessToken) {
                this._listenForAuthEvents();
            }
        }
        /**
         * Supabase Functions allows you to deploy and invoke edge functions.
         */
        get functions() {
            return new FunctionsClient(this.functionsUrl.href, {
                headers: this.headers,
                customFetch: this.fetch,
            });
        }
        /**
         * Supabase Storage allows you to manage user-generated content, such as photos or videos.
         */
        get storage() {
            return new StorageClient(this.storageUrl.href, this.headers, this.fetch);
        }
        /**
         * Perform a query on a table or a view.
         *
         * @param relation - The table or view name to query
         */
        from(relation) {
            return this.rest.from(relation);
        }
        // NOTE: signatures must be kept in sync with PostgrestClient.schema
        /**
         * Select a schema to query or perform an function (rpc) call.
         *
         * The schema needs to be on the list of exposed schemas inside Supabase.
         *
         * @param schema - The schema to query
         */
        schema(schema) {
            return this.rest.schema(schema);
        }
        // NOTE: signatures must be kept in sync with PostgrestClient.rpc
        /**
         * Perform a function call.
         *
         * @param fn - The function name to call
         * @param args - The arguments to pass to the function call
         * @param options - Named parameters
         * @param options.head - When set to `true`, `data` will not be returned.
         * Useful if you only need the count.
         * @param options.get - When set to `true`, the function will be called with
         * read-only access mode.
         * @param options.count - Count algorithm to use to count rows returned by the
         * function. Only applicable for [set-returning
         * functions](https://www.postgresql.org/docs/current/functions-srf.html).
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         */
        rpc(fn, args = {}, options = {}) {
            return this.rest.rpc(fn, args, options);
        }
        /**
         * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
         *
         * @param {string} name - The name of the Realtime channel.
         * @param {Object} opts - The options to pass to the Realtime channel.
         *
         */
        channel(name, opts = { config: {} }) {
            return this.realtime.channel(name, opts);
        }
        /**
         * Returns all Realtime channels.
         */
        getChannels() {
            return this.realtime.getChannels();
        }
        /**
         * Unsubscribes and removes Realtime channel from Realtime client.
         *
         * @param {RealtimeChannel} channel - The name of the Realtime channel.
         *
         */
        removeChannel(channel) {
            return this.realtime.removeChannel(channel);
        }
        /**
         * Unsubscribes and removes all Realtime channels from Realtime client.
         */
        removeAllChannels() {
            return this.realtime.removeAllChannels();
        }
        _getAccessToken() {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                if (this.accessToken) {
                    return yield this.accessToken();
                }
                const { data } = yield this.auth.getSession();
                return (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : null;
            });
        }
        _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, storage, storageKey, flowType, lock, debug, }, headers, fetch) {
            const authHeaders = {
                Authorization: `Bearer ${this.supabaseKey}`,
                apikey: `${this.supabaseKey}`,
            };
            return new SupabaseAuthClient({
                url: this.authUrl.href,
                headers: Object.assign(Object.assign({}, authHeaders), headers),
                storageKey: storageKey,
                autoRefreshToken,
                persistSession,
                detectSessionInUrl,
                storage,
                flowType,
                lock,
                debug,
                fetch,
                // auth checks if there is a custom authorizaiton header using this flag
                // so it knows whether to return an error when getUser is called with no session
                hasCustomAuthorizationHeader: 'Authorization' in this.headers,
            });
        }
        _initRealtimeClient(options) {
            return new RealtimeClient(this.realtimeUrl.href, Object.assign(Object.assign({}, options), { params: Object.assign({ apikey: this.supabaseKey }, options === null || options === void 0 ? void 0 : options.params) }));
        }
        _listenForAuthEvents() {
            let data = this.auth.onAuthStateChange((event, session) => {
                this._handleTokenChanged(event, 'CLIENT', session === null || session === void 0 ? void 0 : session.access_token);
            });
            return data;
        }
        _handleTokenChanged(event, source, token) {
            if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') &&
                this.changedAccessToken !== token) {
                this.changedAccessToken = token;
            }
            else if (event === 'SIGNED_OUT') {
                this.realtime.setAuth();
                if (source == 'STORAGE')
                    this.auth.signOut();
                this.changedAccessToken = undefined;
            }
        }
    }

    /**
     * Creates a new Supabase Client.
     */
    const createClient = (supabaseUrl, supabaseKey, options) => {
        return new SupabaseClient(supabaseUrl, supabaseKey, options);
    };

    const __esModule = true ;

    exports.AuthAdminApi = AuthAdminApi;
    exports.AuthApiError = AuthApiError;
    exports.AuthClient = AuthClient;
    exports.AuthError = AuthError;
    exports.AuthImplicitGrantRedirectError = AuthImplicitGrantRedirectError;
    exports.AuthInvalidCredentialsError = AuthInvalidCredentialsError;
    exports.AuthInvalidJwtError = AuthInvalidJwtError;
    exports.AuthInvalidTokenResponseError = AuthInvalidTokenResponseError;
    exports.AuthPKCEGrantCodeExchangeError = AuthPKCEGrantCodeExchangeError;
    exports.AuthRetryableFetchError = AuthRetryableFetchError;
    exports.AuthSessionMissingError = AuthSessionMissingError;
    exports.AuthUnknownError = AuthUnknownError;
    exports.AuthWeakPasswordError = AuthWeakPasswordError;
    exports.CustomAuthError = CustomAuthError;
    exports.FunctionsError = FunctionsError;
    exports.FunctionsFetchError = FunctionsFetchError;
    exports.FunctionsHttpError = FunctionsHttpError;
    exports.FunctionsRelayError = FunctionsRelayError;
    exports.GoTrueAdminApi = GoTrueAdminApi;
    exports.GoTrueClient = GoTrueClient;
    exports.NavigatorLockAcquireTimeoutError = NavigatorLockAcquireTimeoutError;
    exports.PostgrestError = PostgrestError;
    exports.REALTIME_CHANNEL_STATES = REALTIME_CHANNEL_STATES;
    exports.RealtimeChannel = RealtimeChannel;
    exports.RealtimeClient = RealtimeClient;
    exports.RealtimePresence = RealtimePresence;
    exports.SIGN_OUT_SCOPES = SIGN_OUT_SCOPES;
    exports.SupabaseClient = SupabaseClient;
    exports.__esModule = __esModule;
    exports.createClient = createClient;
    exports.isAuthApiError = isAuthApiError;
    exports.isAuthError = isAuthError;
    exports.isAuthImplicitGrantRedirectError = isAuthImplicitGrantRedirectError;
    exports.isAuthRetryableFetchError = isAuthRetryableFetchError;
    exports.isAuthSessionMissingError = isAuthSessionMissingError;
    exports.isAuthWeakPasswordError = isAuthWeakPasswordError;
    exports.lockInternals = internals;
    exports.navigatorLock = navigatorLock;
    exports.processLock = processLock;

}));
