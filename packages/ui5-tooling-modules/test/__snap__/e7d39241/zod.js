sap.ui.define((function () { 'use strict';

    // functions
    function assertEqual(val) {
        return val;
    }
    function assertNotEqual(val) {
        return val;
    }
    function toZod() {
        return (schema) => schema;
    }
    function assertIs(_arg) { }
    function assertNever(_x) {
        throw new Error("Unexpected value in exhaustive check");
    }
    function assert(_) { }
    function getEnumValues(entries) {
        const numericValues = Object.values(entries).filter((v) => typeof v === "number");
        const values = Object.entries(entries)
            .filter(([k, _]) => numericValues.indexOf(+k) === -1)
            .map(([_, v]) => v);
        return values;
    }
    function joinValues(array, separator = "|") {
        return array.map((val) => stringifyPrimitive(val)).join(separator);
    }
    function jsonStringifyReplacer(_, value) {
        if (typeof value === "bigint")
            return value.toString();
        return value;
    }
    // the accessor lives on a shared prototype: an own accessor makes every box a dictionary-mode object (~360 B and a slow load per read against ~100 B and an inlined getter here)
    class Cached {
        constructor(getter) {
            this._getter = getter;
            this._value = undefined;
        }
        get value() {
            const getter = this._getter;
            if (getter !== undefined) {
                this._value = getter();
                this._getter = undefined;
            }
            return this._value;
        }
    }
    function cached(getter) {
        return new Cached(getter);
    }
    function nullish$1(input) {
        return input === null || input === undefined;
    }
    function cleanRegex(source) {
        const start = source.startsWith("^") ? 1 : 0;
        const end = source.endsWith("$") ? source.length - 1 : source.length;
        return source.slice(start, end);
    }
    function floatSafeRemainder(val, step) {
        const ratio = val / step;
        const roundedRatio = Math.round(ratio);
        // `val` and `step` each round to a double before the division rounds again, so a true decimal multiple's quotient can sit up to 1.5 of these scaled epsilons from the integer. A 1x tolerance therefore rejected 2.03 as a multiple of 0.07; 4x covers the worst case with margin.
        const tolerance = 4 * Number.EPSILON * Math.max(Math.abs(ratio), 1);
        if (Math.abs(ratio - roundedRatio) < tolerance)
            return 0;
        return ratio - roundedRatio;
    }
    const EVALUATING = /* @__PURE__*/ Symbol("evaluating");
    function defineLazy(object, key, getter) {
        let value = undefined;
        Object.defineProperty(object, key, {
            get() {
                if (value === EVALUATING) {
                    // Circular reference detected, return undefined to break the cycle
                    return undefined;
                }
                if (value === undefined) {
                    value = EVALUATING;
                    value = getter();
                }
                return value;
            },
            set(v) {
                Object.defineProperty(object, key, {
                    value: v,
                    // configurable: true,
                });
                // object[key] = v;
            },
            configurable: true,
        });
    }
    function objectClone(obj) {
        return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
    }
    function assignProp(target, prop, value) {
        Object.defineProperty(target, prop, {
            value,
            writable: true,
            enumerable: true,
            configurable: true,
        });
    }
    /**
     * Whichever object a def's `shape` currently answers from: the one the caller passed until the first read, the frozen copy after it.
     *
     * Its keys and descriptors read without invoking anything, which is what lets a discriminated union check its discriminator, and the cycle walk read a shape, without resolving a getter that references the schema being constructed. A def that answers `shape` from an accessor of its own has none.
     */
    function rawShape(def) {
        const desc = Object.getOwnPropertyDescriptor(def, "shape");
        return desc?.get ? desc.get.raw : desc?.value;
    }
    // where a builder reads its source's keys and descriptors, resolving only a shape a def answers for itself. A shape resolves by object spread, so only its enumerable keys are ever part of it.
    function sourceShape(schema) {
        return rawShape(schema._zod.def) ?? schema._zod.def.shape;
    }
    // a key whose value is not settled yet, self-caching so every read after the first gets the same one
    function deferProp(target, key, getter) {
        Object.defineProperty(target, key, {
            get() {
                const value = getter();
                assignProp(this, key, value);
                return value;
            },
            enumerable: true,
            configurable: true,
        });
    }
    // Writes a settled key. A plain assignment is much cheaper than `defineProperty` and produces the same descriptor, but it runs whatever setter already answers to the key — an accessor this shape deferred, or an inherited one, which `__proto__` has on every object and prototype pollution can add for any name.
    function putProp(target, key, value) {
        if (key in target)
            assignProp(target, key, value);
        else
            target[key] = value;
    }
    /**
     * Copies `keys` of `source`'s shape onto `target`, each value passed through `wrap`.
     *
     * A key the source has resolved is copied through now, so the derived shape states it outright and nothing has to resolve it to learn what it holds. A key the source still defers stays deferred, and reads back through the source's own `shape`, so it resolves once and both shapes get that one schema.
     */
    function mirrorShape(target, source, keys, wrap) {
        const raw = sourceShape(source);
        for (const key of keys) {
            const desc = Object.getOwnPropertyDescriptor(raw, key);
            if (!desc.enumerable)
                continue;
            if (desc.get) {
                deferProp(target, key, () => {
                    const value = source._zod.def.shape[key];
                    return wrap ? wrap(value, key) : value;
                });
            }
            else
                putProp(target, key, wrap ? wrap(desc.value, key) : desc.value);
        }
    }
    // same, for a plain shape a caller passed rather than a schema's
    function mirrorProps(target, source) {
        for (const key of Reflect.ownKeys(source)) {
            const desc = Object.getOwnPropertyDescriptor(source, key);
            if (!desc.enumerable)
                continue;
            if (desc.get)
                deferProp(target, key, () => source[key]);
            else
                putProp(target, key, desc.value);
        }
    }
    function mergeDefs(...defs) {
        const mergedDescriptors = {};
        for (const def of defs) {
            const descriptors = Object.getOwnPropertyDescriptors(def);
            Object.assign(mergedDescriptors, descriptors);
        }
        return Object.defineProperties({}, mergedDescriptors);
    }
    function cloneDef(schema) {
        return mergeDefs(schema._zod.def);
    }
    function getElementAtPath(obj, path) {
        if (!path)
            return obj;
        return path.reduce((acc, key) => acc?.[key], obj);
    }
    function promiseAllObject(promisesObj) {
        const keys = Object.keys(promisesObj);
        const promises = keys.map((key) => promisesObj[key]);
        return Promise.all(promises).then((results) => {
            const resolvedObj = {};
            for (let i = 0; i < keys.length; i++) {
                resolvedObj[keys[i]] = results[i];
            }
            return resolvedObj;
        });
    }
    function randomString(length = 10) {
        const chars = "abcdefghijklmnopqrstuvwxyz";
        let str = "";
        for (let i = 0; i < length; i++) {
            str += chars[Math.floor(Math.random() * chars.length)];
        }
        return str;
    }
    function esc(str) {
        return JSON.stringify(str);
    }
    function slugify(input) {
        return input
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }
    const captureStackTrace = ("captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => { });
    function isObject(data) {
        return typeof data === "object" && data !== null && !Array.isArray(data);
    }
    const allowsEval = /* @__PURE__*/ cached(() => {
        // Skip the probe under `jitless`: strict CSPs report the caught `new Function` as a `securitypolicyviolation` even though the throw is swallowed.
        if (globalConfig.jitless) {
            return false;
        }
        // @ts-ignore
        if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
            return false;
        }
        try {
            const F = Function;
            new F("");
            return true;
        }
        catch (_) {
            return false;
        }
    });
    function isPlainObject(o) {
        if (isObject(o) === false)
            return false;
        // modified constructor
        const ctor = o.constructor;
        if (ctor === undefined)
            return true;
        if (typeof ctor !== "function")
            return true;
        // modified prototype
        const prot = ctor.prototype;
        if (isObject(prot) === false)
            return false;
        // ctor doesn't have static `isPrototypeOf`
        if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
            return false;
        }
        return true;
    }
    function shallowClone(o) {
        if (isPlainObject(o))
            return { ...o };
        if (Array.isArray(o))
            return [...o];
        if (o instanceof Map)
            return new Map(o);
        if (o instanceof Set)
            return new Set(o);
        return o;
    }
    function numKeys(data) {
        let keyCount = 0;
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                keyCount++;
            }
        }
        return keyCount;
    }
    const getParsedType = (data) => {
        const t = typeof data;
        switch (t) {
            case "undefined":
                return "undefined";
            case "string":
                return "string";
            case "number":
                return Number.isNaN(data) ? "nan" : "number";
            case "boolean":
                return "boolean";
            case "function":
                return "function";
            case "bigint":
                return "bigint";
            case "symbol":
                return "symbol";
            case "object":
                if (Array.isArray(data)) {
                    return "array";
                }
                if (data === null) {
                    return "null";
                }
                if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
                    return "promise";
                }
                if (typeof Map !== "undefined" && data instanceof Map) {
                    return "map";
                }
                if (typeof Set !== "undefined" && data instanceof Set) {
                    return "set";
                }
                if (typeof Date !== "undefined" && data instanceof Date) {
                    return "date";
                }
                // @ts-ignore
                if (typeof File !== "undefined" && data instanceof File) {
                    return "file";
                }
                return "object";
            default:
                throw new Error(`Unknown data type: ${t}`);
        }
    };
    const propertyKeyTypes = /* @__PURE__*/ new Set(["string", "number", "symbol"]);
    const primitiveTypes = /* @__PURE__*/ new Set([
        "string",
        "number",
        "bigint",
        "boolean",
        "symbol",
        "undefined",
    ]);
    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    // zod-specific utils
    function clone(inst, def, params) {
        const cl = new inst._zod.constr(def ?? inst._zod.def);
        if (!def || params?.parent)
            cl._zod.parent = inst;
        return cl;
    }
    function normalizeParams(_params) {
        const params = _params;
        if (!params)
            return {};
        if (typeof params === "string")
            return { error: () => params };
        if (params?.message !== undefined) {
            if (params?.error !== undefined)
                throw new Error("Cannot specify both `message` and `error` params");
            params.error = params.message;
        }
        delete params.message;
        if (typeof params.error === "string")
            return { ...params, error: () => params.error };
        return params;
    }
    function createTransparentProxy(getter) {
        let target;
        return new Proxy({}, {
            get(_, prop, receiver) {
                target ?? (target = getter());
                return Reflect.get(target, prop, receiver);
            },
            set(_, prop, value, receiver) {
                target ?? (target = getter());
                return Reflect.set(target, prop, value, receiver);
            },
            has(_, prop) {
                target ?? (target = getter());
                return Reflect.has(target, prop);
            },
            deleteProperty(_, prop) {
                target ?? (target = getter());
                return Reflect.deleteProperty(target, prop);
            },
            ownKeys(_) {
                target ?? (target = getter());
                return Reflect.ownKeys(target);
            },
            getOwnPropertyDescriptor(_, prop) {
                target ?? (target = getter());
                return Reflect.getOwnPropertyDescriptor(target, prop);
            },
            defineProperty(_, prop, descriptor) {
                target ?? (target = getter());
                return Reflect.defineProperty(target, prop, descriptor);
            },
        });
    }
    function stringifyPrimitive(value) {
        if (typeof value === "bigint")
            return value.toString() + "n";
        if (typeof value === "string")
            return `"${value}"`;
        return `${value}`;
    }
    function optionalKeys(shape) {
        return Object.keys(shape).filter((k) => {
            return shape[k]._zod.optin !== undefined && shape[k]._zod.optout === "optional";
        });
    }

    const NUMBER_FORMAT_RANGES = /*@__PURE__*/ (() => ({
        safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
        int32: [-2147483648, 2147483647],
        uint32: [0, 4294967295],
        float32: [-34028234663852886e22, 3.4028234663852886e38],
        float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
    }))();
    const BIGINT_FORMAT_RANGES = {
        int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
        uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")],
    };
    function pick(schema, mask) {
        const currDef = schema._zod.def;
        const checks = currDef.checks;
        const hasChecks = checks && checks.length > 0;
        if (hasChecks) {
            throw new Error(".pick() cannot be used on object schemas containing refinements");
        }
        const newShape = {};
        mirrorShape(newShape, schema, maskedKeys(schema, mask));
        return clone(schema, mergeDefs(currDef, { shape: newShape, checks: [] }));
    }
    // the mask keys that select something, checked against the source's shape without resolving it
    function maskedKeys(schema, mask) {
        const raw = sourceShape(schema);
        const keys = [];
        // `for...in` skips symbols, so a symbol in the mask would select nothing
        for (const key of Reflect.ownKeys(mask)) {
            if (!Object.getOwnPropertyDescriptor(raw, key)?.enumerable) {
                throw new Error(`Unrecognized key: "${String(key)}"`);
            }
            if (mask[key])
                keys.push(key);
        }
        return keys;
    }
    function omit(schema, mask) {
        const currDef = schema._zod.def;
        const checks = currDef.checks;
        const hasChecks = checks && checks.length > 0;
        if (hasChecks) {
            throw new Error(".omit() cannot be used on object schemas containing refinements");
        }
        const omitted = new Set(maskedKeys(schema, mask));
        const newShape = {};
        mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)).filter((key) => !omitted.has(key)));
        return clone(schema, mergeDefs(currDef, { shape: newShape, checks: [] }));
    }
    function extend(schema, shape) {
        if (!isPlainObject(shape)) {
            throw new Error("Invalid input to extend: expected a plain object");
        }
        const checks = schema._zod.def.checks;
        const hasChecks = checks && checks.length > 0;
        if (hasChecks) {
            // Only throw if new shape overlaps with existing shape. Use getOwnPropertyDescriptor to check key existence without accessing values
            const existingShape = sourceShape(schema);
            for (const key of Reflect.ownKeys(shape)) {
                if (Object.getOwnPropertyDescriptor(existingShape, key) !== undefined) {
                    throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
                }
            }
        }
        return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
    }
    // the source's keys, then the caller's overlaid on top
    function extended(schema, shape) {
        const newShape = {};
        mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)));
        mirrorProps(newShape, shape);
        return newShape;
    }
    function safeExtend(schema, shape) {
        if (!isPlainObject(shape)) {
            throw new Error("Invalid input to safeExtend: expected a plain object");
        }
        return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
    }
    function merge(a, b) {
        if (!b?._zod?.def) {
            throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
        }
        if (a._zod.def.checks?.length) {
            throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
        }
        const newShape = {};
        mirrorShape(newShape, a, Reflect.ownKeys(sourceShape(a)));
        mirrorShape(newShape, b, Reflect.ownKeys(sourceShape(b)));
        const def = mergeDefs(a._zod.def, {
            shape: newShape,
            get catchall() {
                return b._zod.def.catchall;
            },
            checks: b._zod.def.checks ?? [],
        });
        return clone(a, def);
    }
    function partial(Class, schema, mask, name = "partial") {
        const currDef = schema._zod.def;
        const checks = currDef.checks;
        const hasChecks = checks && checks.length > 0;
        if (hasChecks) {
            throw new Error(`.${name}() cannot be used on object schemas containing refinements`);
        }
        const selected = mask ? new Set(maskedKeys(schema, mask)) : undefined;
        const newShape = {};
        mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), Class &&
            ((value, key) => (selected && !selected.has(key) ? value : new Class({ type: "optional", innerType: value }))));
        return clone(schema, mergeDefs(schema._zod.def, { shape: newShape, checks: [] }));
    }
    function required(Class, schema, mask) {
        const selected = mask ? new Set(maskedKeys(schema, mask)) : undefined;
        const newShape = {};
        mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), (value, key) =>
        // overwrite with non-optional
        selected && !selected.has(key) ? value : new Class({ type: "nonoptional", innerType: value }));
        return clone(schema, mergeDefs(schema._zod.def, { shape: newShape }));
    }
    // invalid_type | too_big | too_small | invalid_format | not_multiple_of | unrecognized_keys | invalid_union | invalid_key | invalid_element | invalid_value | custom
    function aborted(x, startIndex = 0) {
        if (x.aborted === true)
            return true;
        for (let i = startIndex; i < x.issues.length; i++) {
            if (x.issues[i]?.continue !== true) {
                return true;
            }
        }
        return false;
    }
    // Checks for explicit abort (continue === false), as opposed to implicit abort (continue === undefined). Used to respect `abort: true` in .refine() even for checks that have a `when` function.
    function explicitlyAborted(x, startIndex = 0) {
        if (x.aborted === true)
            return true;
        for (let i = startIndex; i < x.issues.length; i++) {
            if (x.issues[i]?.continue === false) {
                return true;
            }
        }
        return false;
    }
    function prefixIssues(path, issues) {
        return issues.map((iss) => {
            var _a;
            (_a = iss).path ?? (_a.path = []);
            iss.path.unshift(path);
            return iss;
        });
    }
    function unwrapMessage(message) {
        return typeof message === "string" ? message : message?.message;
    }
    /* A check holds no link back to the schema it is attached to — the same check instance is shared by every clone of that schema — so the owner is stamped onto the issues a check just raised, at the only point where both are in scope. Runs on the failure path only; `start` is the issue count from before the check ran. */
    /** The leading size checks of `defChecks` that set an upper bound, each paired with it. */
    function sizeCaps(defChecks) {
        const caps = [];
        for (const ch of defChecks ?? []) {
            const d = ch._zod.def;
            // a later check may rewrite the value
            if (!/_(length|size)$|_equals$/.test(d.check))
                break;
            const max = d.maximum ?? d.length ?? d.size;
            if (max >= 0)
                caps.push([max, ch]);
        }
        return caps;
    }
    function attachSchema(issues, start, inst) {
        var _a;
        for (let i = start; i < issues.length; i++) {
            (_a = issues[i]).schema ?? (_a.schema = inst);
        }
    }
    function finalizeIssue(iss, ctx, config) {
        var _a;
        // A schema that raised an issue itself owns it outright, and outranks any stamp an enclosing check left in `attachSchema`. String formats and z.custom() are schema and check at once, so when they act as a check they defer to that stamp instead.
        const traits = iss.inst?._zod?.traits;
        if (traits?.has("$ZodType")) {
            if (traits.has("$ZodCheck"))
                (_a = iss).schema ?? (_a.schema = iss.inst);
            else
                iss.schema = iss.inst;
        }
        // Decreasing specificity, first map to return a message wins. `inst` is whatever raised the issue, so a check's own map outranks the owning schema's.
        const schemaError = iss.schema !== iss.inst ? iss.schema?._zod.def?.error : undefined;
        const message = iss.message
            ? iss.message
            : (unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ??
                unwrapMessage(schemaError?.(iss)) ??
                unwrapMessage(ctx?.error?.(iss)) ??
                unwrapMessage(config.customError?.(iss)) ??
                unwrapMessage(config.localeError?.(iss)) ??
                "Invalid input");
        // an explicit own-key copy beats object rest with excluded keys, which v8 routes through a generic runtime call; Object.keys rather than for-in so an issue pushed with a prototype does not leak inherited keys, and an own __proto__ key is dropped rather than assigned through the setter
        const full = {};
        for (const k of Object.keys(iss)) {
            if (k === "inst" || k === "schema" || k === "continue" || k === "input" || k === "__proto__")
                continue;
            full[k] = iss[k];
        }
        full.path ?? (full.path = []);
        full.message = message;
        if (ctx?.reportInput) {
            full.input = iss.input;
        }
        return full;
    }
    function getSizableOrigin(input) {
        if (input instanceof Set)
            return "set";
        if (input instanceof Map)
            return "map";
        // @ts-ignore
        if (input instanceof File)
            return "file";
        return "unknown";
    }
    const highSurrogate = /[\uD800-\uDBFF]/;
    // Code points in `str`: a surrogate pair counts once, a lone surrogate as itself. Hand-rolled because the string iterator allocates and runs ~250x slower on this path; the regex probe exits ~50x quicker for a string with no astral characters.
    function codePointLength(str) {
        const units = str.length;
        if (!highSurrogate.test(str))
            return units;
        let count = units;
        for (let i = 0; i < units - 1; i++) {
            if ((str.charCodeAt(i) & 0xfc00) === 0xd800 && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
                count--;
                i++;
            }
        }
        return count;
    }
    function getLengthableOrigin(input) {
        if (Array.isArray(input))
            return "array";
        if (typeof input === "string")
            return "string";
        return "unknown";
    }
    function parsedType(data) {
        const t = typeof data;
        switch (t) {
            case "number": {
                return Number.isNaN(data) ? "nan" : "number";
            }
            case "object": {
                if (data === null) {
                    return "null";
                }
                if (Array.isArray(data)) {
                    return "array";
                }
                const obj = data;
                if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) {
                    return obj.constructor.name;
                }
            }
        }
        return t;
    }
    function issue(...args) {
        const [iss, input, inst] = args;
        if (typeof iss === "string") {
            return {
                message: iss,
                code: "custom",
                input,
                inst,
            };
        }
        return { ...iss };
    }
    function cleanEnum(obj) {
        return Object.entries(obj)
            .filter(([k, _]) => {
            // return true if NaN, meaning it's not a number, thus a string key
            return Number.isNaN(Number.parseInt(k, 10));
        })
            .map((el) => el[1]);
    }
    // Codec utility functions
    function base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }
    function uint8ArrayToBase64(bytes) {
        let binaryString = "";
        for (let i = 0; i < bytes.length; i++) {
            binaryString += String.fromCharCode(bytes[i]);
        }
        return btoa(binaryString);
    }
    function base64urlToUint8Array(base64url) {
        const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
        const padding = "=".repeat((4 - (base64.length % 4)) % 4);
        return base64ToUint8Array(base64 + padding);
    }
    function uint8ArrayToBase64url(bytes) {
        return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    }
    function hexToUint8Array(hex) {
        const cleanHex = hex.replace(/^0x/, "");
        if (cleanHex.length % 2 !== 0) {
            throw new Error("Invalid hex string length");
        }
        const bytes = new Uint8Array(cleanHex.length / 2);
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
        }
        return bytes;
    }
    function uint8ArrayToHex(bytes) {
        return Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }
    // instanceof
    class Class {
        constructor(..._args) { }
    }
    //////////    PROTOTYPE INSTALLERS     //////////
    //
    // Members live on the prototype and materialize per instance on first read, which keeps own-property count under the step where V8 stops using inline slots. Changing anything here means re-measuring runtime, memory and bundle size together — see "The three axes" in AGENTS.md.
    /**
     * Installs a trait's members on its prototype. Each value builds that member for the instance on first read; the built value shadows the accessor as an own property, so a detached `const { parse } = schema` keeps working.
     *
     * Call this from a `proto` initializer, which runs once per prototype — never per instance.
     */
    function members(proto, table) {
        for (const key in table) {
            const desc = Object.getOwnPropertyDescriptor(table, key);
            // a getter installs as written, so it stays live: `description` reads through to the registry on every access. not enumerable: an object literal's is, and a prototype member never was
            if (desc.get)
                Object.defineProperty(proto, key, { ...desc, enumerable: false });
            // a method materializes bound on first read, which is what keeps a detached member working: `const opt = schema.optional; opt()`
            else
                defineBound(proto, key, desc.value);
        }
    }
    /** Shadows a prototype member with an own value, so a getter that builds from the instance runs once. */
    function own(inst, key, value, enumerable = true) {
        Object.defineProperty(inst, key, { configurable: true, writable: true, enumerable, value });
        return value;
    }
    /** Like {@link own}, for a member that was never an own data property and has to stay out of `Object.keys`. */
    function hide(inst, key, value) {
        return own(inst, key, value, false);
    }
    /** Adds members a table derives from the instance: each builds on first read and shadows as own data, and assignment shadows the same way, as when these were own properties. */
    function derived(computes, table) {
        for (const key in computes) {
            const compute = computes[key];
            // an object literal's accessor is configurable and enumerable, and `members` copies the descriptor as written
            Object.defineProperty(table, key, {
                configurable: true,
                enumerable: true,
                get() {
                    return own(this, key, compute(this));
                },
                set(value) {
                    own(this, key, value);
                },
            });
        }
        return table;
    }
    function defineBound(proto, key, fn) {
        Object.defineProperty(proto, key, {
            configurable: true,
            get() {
                // vitest's spyOn calls a prototype getter bare to find the function it wraps, so a nullish receiver answers the raw method
                return this == null ? fn : own(this, key, fn.bind(this));
            },
            set(value) {
                own(this, key, value);
            },
        });
    }
    /** Returns the prototype to install on, or `undefined` if this group is already installed on it. */
    function claim(inst, sentinel) {
        const proto = Object.getPrototypeOf(inst);
        // Runs on every construction, so `in` rather than the costlier `hasOwnProperty.call`. Sentinels are keys the group itself defines.
        return sentinel in proto ? undefined : proto;
    }
    // The internals whose init chain is installing. A second call for the same one is a derived constructor overriding its base, so it must not construct another schema in between or the override is dropped.
    let installing;
    // Set while a getter is running, so a value that resolved through a recursion break is not memoized. One shared descriptor shadows the key for the duration, which costs no per-key allocation.
    let broke = false;
    const breaker = {
        configurable: true,
        get() {
            broke = true;
            return undefined;
        },
    };
    /**
     * Installs a lazily-derived internal on the `_zod` prototype of `inst`'s
     * constructor, computed from the internals object itself and cached there on
     * first read. One accessor per constructor rather than one per instance.
     */
    function defineLazyInternal(inst, key, compute) {
        const proto = Object.getPrototypeOf(inst._zod);
        if (key in proto && installing !== inst._zod) {
            // A repeat construction: everything is installed already. Cleared here so the reference is not held past the first construction of every type.
            installing = undefined;
            return;
        }
        installing = inst._zod;
        Object.defineProperty(proto, key, {
            configurable: true,
            get() {
                // Shadowed before computing so a re-entrant read from a recursive schema resolves to undefined instead of running the getter again.
                Object.defineProperty(this, key, breaker);
                const outer = broke;
                broke = false;
                try {
                    const value = compute(this);
                    // A result that resolved through a recursion break is recomputed once the graph is complete; everything else memoizes, undefined included.
                    if (broke)
                        delete this[key];
                    else
                        Object.defineProperty(this, key, { configurable: true, writable: true, value });
                    broke = broke || outer;
                    return value;
                }
                catch (err) {
                    // A compute that threw memoizes nothing, so a later read runs it again and fails the same way. The shadow goes with it, since leaving it installed would answer undefined for every later read.
                    delete this[key];
                    broke = broke || outer;
                    throw err;
                }
            },
            set(value) {
                Object.defineProperty(this, key, { configurable: true, writable: true, value });
            },
        });
    }
    /**
     * Installs `key` on `inst`'s prototype, computed by `make` on first read and cached there as an own
     * data property. One accessor per constructor rather than one per instance, because an own accessor
     * puts every instance after the first into v8 dictionary mode. The key doubles as the sentinel.
     */
    function installLazyProp(inst, key, make, enumerable) {
        const proto = claim(inst, key);
        if (!proto)
            return;
        Object.defineProperty(proto, key, {
            configurable: true,
            get() {
                // Shadowed before computing, so a re-entrant read from a self-referential shape resolves to undefined instead of running the getter again. A data property rather than an accessor: an own accessor is the dictionary-mode transition this exists to avoid.
                const desc = { configurable: true, writable: true, enumerable, value: undefined };
                Object.defineProperty(this, key, desc);
                // a compute that throws leaves the shadow behind, so later reads answer undefined instead of re-throwing; `defineLazy` did the same, and `defineLazyInternal`'s delete-on-catch would cost bytes in every bundle for a case only a throwing user getter reaches
                desc.value = make(this);
                Object.defineProperty(this, key, desc);
                return desc.value;
            },
            set(value) {
                Object.defineProperty(this, key, { configurable: true, writable: true, enumerable, value });
            },
        });
    }
    /** Marks the thunk `_catch` synthesises for a constant catch value. `Function.length` cannot tell that thunk from a user callback — rest and defaulted parameters both report arity 0 — and a user callback reads `ctx.error`, whose issues only finalize correctly against the caller's per-parse error map. Provenance can say what arity cannot. A plain string key rather than `Symbol.for`, whose call at module scope no bundler can prove pure — the same shape that anchored `urlCanParse` into every build. */
    const CONSTANT_CATCH = "~constantCatch";
    /** Wraps a constant catch value in a thunk tagged with {@link CONSTANT_CATCH}. */
    function constantCatch(value) {
        const fn = () => value;
        fn[CONSTANT_CATCH] = true;
        return fn;
    }

    var util = /*#__PURE__*/Object.freeze({
        __proto__: null,
        BIGINT_FORMAT_RANGES: BIGINT_FORMAT_RANGES,
        CONSTANT_CATCH: CONSTANT_CATCH,
        Class: Class,
        NUMBER_FORMAT_RANGES: NUMBER_FORMAT_RANGES,
        aborted: aborted,
        allowsEval: allowsEval,
        assert: assert,
        assertEqual: assertEqual,
        assertIs: assertIs,
        assertNever: assertNever,
        assertNotEqual: assertNotEqual,
        assignProp: assignProp,
        attachSchema: attachSchema,
        base64ToUint8Array: base64ToUint8Array,
        base64urlToUint8Array: base64urlToUint8Array,
        cached: cached,
        captureStackTrace: captureStackTrace,
        cleanEnum: cleanEnum,
        cleanRegex: cleanRegex,
        clone: clone,
        cloneDef: cloneDef,
        codePointLength: codePointLength,
        constantCatch: constantCatch,
        createTransparentProxy: createTransparentProxy,
        defineLazy: defineLazy,
        defineLazyInternal: defineLazyInternal,
        derived: derived,
        esc: esc,
        escapeRegex: escapeRegex,
        explicitlyAborted: explicitlyAborted,
        extend: extend,
        finalizeIssue: finalizeIssue,
        floatSafeRemainder: floatSafeRemainder,
        getElementAtPath: getElementAtPath,
        getEnumValues: getEnumValues,
        getLengthableOrigin: getLengthableOrigin,
        getParsedType: getParsedType,
        getSizableOrigin: getSizableOrigin,
        hexToUint8Array: hexToUint8Array,
        hide: hide,
        installLazyProp: installLazyProp,
        isObject: isObject,
        isPlainObject: isPlainObject,
        issue: issue,
        joinValues: joinValues,
        jsonStringifyReplacer: jsonStringifyReplacer,
        members: members,
        merge: merge,
        mergeDefs: mergeDefs,
        normalizeParams: normalizeParams,
        nullish: nullish$1,
        numKeys: numKeys,
        objectClone: objectClone,
        omit: omit,
        optionalKeys: optionalKeys,
        own: own,
        parsedType: parsedType,
        partial: partial,
        pick: pick,
        prefixIssues: prefixIssues,
        primitiveTypes: primitiveTypes,
        promiseAllObject: promiseAllObject,
        propertyKeyTypes: propertyKeyTypes,
        randomString: randomString,
        rawShape: rawShape,
        required: required,
        safeExtend: safeExtend,
        shallowClone: shallowClone,
        sizeCaps: sizeCaps,
        slugify: slugify,
        stringifyPrimitive: stringifyPrimitive,
        toZod: toZod,
        uint8ArrayToBase64: uint8ArrayToBase64,
        uint8ArrayToBase64url: uint8ArrayToBase64url,
        uint8ArrayToHex: uint8ArrayToHex,
        unwrapMessage: unwrapMessage
    });

    var _a$1;
    /** A special constant with type `never` */
    const NEVER = /*@__PURE__*/ Object.freeze({
        status: "aborted",
    });
    /* Shared descriptor for installing `_zod`; defineProperty reads it
     * synchronously, so reusing one object avoids a per-instance allocation. */
    const _zodDesc = { value: undefined, enumerable: false };
    // null where suppressing the capture would be unrecoverable: `parse()` puts the frames back with `captureStackTrace`, so without it the throw would lose its stack. also latched to null once `stackTraceLimit` proves unassignable, which a realm can do at any point by hardening Error
    let _E = "captureStackTrace" in Error ? Error : null;
    // v8 captures a stack trace inside the Error constructor, which dominates a failed parse; costs only the frames, and parse() restores those. the constructor must RUN: Object.create is cheaper and passes instanceof, but Error.isError and util.types.isNativeError check an internal slot
    function newError(Definition) {
        const E = _E;
        if (E) {
            const saved = E.stackTraceLimit;
            if (typeof saved === "number") {
                try {
                    E.stackTraceLimit = 0;
                }
                catch {
                    _E = null;
                    return new Definition();
                }
                try {
                    return new Definition();
                }
                finally {
                    E.stackTraceLimit = saved;
                }
            }
        }
        return new Definition();
    }
    function $constructor(name, initializer,
    /** This trait's members, installed once on every prototype that composes it. They cannot be declared in the initializer above: that runs per instance, and the prototype is shared. */
    proto, params) {
        // Prototype for this constructor's `_zod` internals. Lazily-derived fields (`values`, `pattern`, `optin`, …) install here once rather than as an accessor on every instance.
        const zodProto = {};
        // Assigning the fields in the constructor body is what gives instances in-object slots; building the object literally and reparenting it costs a second allocation and a generic property copy.
        function Internals(def) {
            this.def = def;
            this.constr = _;
            this.traits = new Set();
        }
        Internals.prototype = zodProto;
        const protoMembers = proto;
        // One trait's members land on every prototype whose chain composes it, so the answer is per prototype rather than per trait.
        const initialized = protoMembers && new WeakSet();
        function init(inst, def) {
            if (!inst._zod) {
                _zodDesc.value = new Internals(def);
                try {
                    Object.defineProperty(inst, "_zod", _zodDesc);
                }
                finally {
                    // Cleared even on throw, so the shared descriptor never leaks one instance's internals into the next.
                    _zodDesc.value = undefined;
                }
            }
            else if (inst._zod.traits.has(name)) {
                return;
            }
            inst._zod.traits.add(name);
            initializer(inst, def);
            if (initialized) {
                // `super(def)` from a user subclass gives `this` a prototype the subclass owns, and installing there would overwrite whatever the subclass declared. `constr` built the instance, so its prototype is the one below the subclass's that should carry the members. A receiver whose chain never reaches that prototype installs on its own, which for a plain object handed straight to `init` means `Object.prototype` — unchanged from before.
                const own = Object.getPrototypeOf(inst);
                const ctorProto = inst._zod.constr.prototype;
                let up = own;
                while (up && up !== ctorProto)
                    up = Object.getPrototypeOf(up);
                const target = up ?? own;
                if (!initialized.has(target)) {
                    initialized.add(target);
                    members(target, protoMembers);
                }
            }
            // support prototype modifications; for-in avoids the array allocation of Object.keys on the (usually empty) prototype
            const proto = _.prototype;
            for (const k in proto) {
                if (!Object.prototype.hasOwnProperty.call(proto, k))
                    continue;
                if (!(k in inst)) {
                    inst[k] = proto[k].bind(inst);
                }
            }
        }
        // doesn't work if Parent has a constructor with arguments
        const Parent = params?.Parent ?? Object;
        class Definition extends Parent {
        }
        Object.defineProperty(Definition, "name", { value: name });
        function _(def) {
            const inst = params?.Parent ? newError(Definition) : this;
            init(inst, def);
            const deferred = inst._zod.deferred;
            if (deferred) {
                for (const fn of deferred) {
                    fn();
                }
                // Released: initializers run once, and the list would otherwise be retained for the schema's lifetime.
                inst._zod.deferred = undefined;
            }
            // Global post-processor hook. Internal: installed by `import "zod/compile"` to enable AOT compilation for every constructed schema. Runs last, once the instance is fully built, because it hands the instance to compile(). The post-processor is expected to be reentrancy-guarded by its own implementation.
            const pp = globalThis.__zod_globalConfig?.postProcessor;
            if (pp)
                pp(inst);
            return inst;
        }
        Object.defineProperty(_, "init", { value: init });
        Object.defineProperty(_, Symbol.hasInstance, {
            value: (inst) => {
                if (params?.Parent && inst instanceof params.Parent)
                    return true;
                return inst?._zod?.traits?.has(name);
            },
        });
        Object.defineProperty(_, "name", { value: name });
        return _;
    }
    //////////////////////////////   UTILITIES   ///////////////////////////////////////
    const $brand = /*@__PURE__*/ Symbol("zod_brand");
    class $ZodAsyncError extends Error {
        constructor() {
            super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
        }
    }
    class $ZodEncodeError extends Error {
        constructor(name) {
            super(`Encountered unidirectional transform during encode: ${name}`);
            this.name = "ZodEncodeError";
        }
    }
    (_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
    const globalConfig = globalThis.__zod_globalConfig;
    function config(newConfig) {
        if (newConfig)
            Object.assign(globalConfig, newConfig);
        return globalConfig;
    }

    /* Computing the message eagerly is expensive (pretty-printed JSON of all
     * issues), so defer it until first read. The accessor functions and
     * descriptors are shared across instances to keep error construction
     * cheap; the computed message is cached on the internals object. The
     * setter preserves plain assignment semantics for consumers that
     * overwrite `message`. */
    function _getMessage() {
        const internals = this._zod;
        internals.message ?? (internals.message = JSON.stringify(internals.def, jsonStringifyReplacer, 2));
        return internals.message;
    }
    function _setMessage(value) {
        this._zod.message = value;
    }
    const _messageDesc = {
        get: _getMessage,
        set: _setMessage,
        enumerable: true,
        configurable: true,
    };
    const _issuesDesc = { value: undefined, enumerable: false };
    /* Prototypes that already carry the lazy `toString`. Seeded with the
     * intrinsics so that `init` on a foreign object — it accepts any object —
     * can never install an accessor onto a prototype we do not own. */
    const _installedToString = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
    const initializer$1 = (inst, def) => {
        inst.name = "$ZodError";
        // `_zod` is already non-enumerable: $constructor's init defined it with this same descriptor
        _issuesDesc.value = def;
        Object.defineProperty(inst, "issues", _issuesDesc);
        // Clear the shared slot; a retained `value` pins the last error's issues.
        _issuesDesc.value = undefined;
        Object.defineProperty(inst, "message", _messageDesc);
        /* `toString` lives as a non-enumerable lazy getter on the shared
         * prototype; on first access it caches a per-instance closure so
         * detached usage still works. */
        const proto = Object.getPrototypeOf(inst);
        if (!_installedToString.has(proto)) {
            _installedToString.add(proto);
            Object.defineProperty(proto, "toString", {
                configurable: true,
                enumerable: false,
                get() {
                    const value = () => this.message;
                    Object.defineProperty(this, "toString", { value, configurable: true, writable: true });
                    return value;
                },
                set(value) {
                    Object.defineProperty(this, "toString", { value, configurable: true, writable: true });
                },
            });
        }
    };
    const $ZodError = $constructor("$ZodError", initializer$1);
    const $ZodRealError = $constructor("$ZodError", initializer$1, undefined, {
        Parent: Error,
    });
    /** Get-or-create `obj[key]` as an own data property. A path segment naming an inherited member
     * ("toString", "constructor") would otherwise read through to the prototype, and assigning
     * "__proto__" would hit the setter instead of creating a key. */
    function node(obj, key, make) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
            if (key === "__proto__") {
                Object.defineProperty(obj, key, { value: make(), writable: true, enumerable: true, configurable: true });
            }
            else {
                obj[key] = make();
            }
        }
        return obj[key];
    }
    function flattenError(error, mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of error.issues) {
            if (sub.path.length > 0) {
                node(fieldErrors, sub.path[0], () => []).push(mapper(sub));
            }
            else {
                formErrors.push(mapper(sub));
            }
        }
        return { formErrors, fieldErrors };
    }
    function formatError(error, mapper = (issue) => issue.message) {
        const fieldErrors = { _errors: [] };
        const processError = (error, path = []) => {
            for (const issue of error.issues) {
                if (issue.code === "invalid_union" && issue.errors.length) {
                    issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
                }
                else if (issue.code === "invalid_key") {
                    processError({ issues: issue.issues }, [...path, ...issue.path]);
                }
                else if (issue.code === "invalid_element") {
                    processError({ issues: issue.issues }, [...path, ...issue.path]);
                }
                else {
                    const fullpath = [...path, ...issue.path];
                    if (fullpath.length === 0) {
                        fieldErrors._errors.push(mapper(issue));
                    }
                    else {
                        let curr = fieldErrors;
                        let i = 0;
                        while (i < fullpath.length) {
                            const el = fullpath[i];
                            const terminal = i === fullpath.length - 1;
                            // `_errors` is reserved by this legacy format, so merge a matching path segment into the current node instead of treating its array as a child.
                            if (el === "_errors") {
                                if (terminal)
                                    curr._errors.push(mapper(issue));
                                i++;
                                continue;
                            }
                            // A path element may collide with an inherited property name such as
                            // "__proto__" or "constructor". Truthiness checks read the prototype
                            // (so no node is created, then ._errors.push throws), and bracket
                            // assignment of "__proto__" hits the setter instead of creating an
                            // own key. Guard the read with hasOwnProperty and create the node
                            // with defineProperty so any path element becomes a real own key.
                            if (!Object.prototype.hasOwnProperty.call(curr, el)) {
                                Object.defineProperty(curr, el, {
                                    value: { _errors: [] },
                                    enumerable: true,
                                    writable: true,
                                    configurable: true,
                                });
                            }
                            const node = curr[el];
                            if (terminal) {
                                node._errors.push(mapper(issue));
                            }
                            curr = node;
                            i++;
                        }
                    }
                }
            }
        };
        processError(error);
        return fieldErrors;
    }
    function treeifyError(error, mapper = (issue) => issue.message) {
        const result = { errors: [] };
        const processError = (error, path = []) => {
            var _a;
            for (const issue of error.issues) {
                if (issue.code === "invalid_union" && issue.errors.length) {
                    // regular union error
                    issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
                }
                else if (issue.code === "invalid_key") {
                    processError({ issues: issue.issues }, [...path, ...issue.path]);
                }
                else if (issue.code === "invalid_element") {
                    processError({ issues: issue.issues }, [...path, ...issue.path]);
                }
                else {
                    const fullpath = [...path, ...issue.path];
                    if (fullpath.length === 0) {
                        result.errors.push(mapper(issue));
                        continue;
                    }
                    let curr = result;
                    let i = 0;
                    while (i < fullpath.length) {
                        const el = fullpath[i];
                        const terminal = i === fullpath.length - 1;
                        if (typeof el === "string") {
                            curr.properties ?? (curr.properties = {});
                            // el may collide with an inherited property name ("__proto__",
                            // "constructor", ...); ??= reads the prototype so the node is never
                            // created and curr.errors.push throws. Guard with hasOwnProperty and
                            // create the node with defineProperty so "__proto__" becomes a real
                            // own key rather than invoking the prototype setter.
                            if (!Object.prototype.hasOwnProperty.call(curr.properties, el)) {
                                Object.defineProperty(curr.properties, el, {
                                    value: { errors: [] },
                                    enumerable: true,
                                    writable: true,
                                    configurable: true,
                                });
                            }
                            curr = curr.properties[el];
                        }
                        else {
                            curr.items ?? (curr.items = []);
                            (_a = curr.items)[el] ?? (_a[el] = { errors: [] });
                            curr = curr.items[el];
                        }
                        if (terminal) {
                            curr.errors.push(mapper(issue));
                        }
                        i++;
                    }
                }
            }
        };
        processError(error);
        return result;
    }
    /** Format a ZodError as a human-readable string in the following form.
     *
     * From
     *
     * ```ts
     * ZodError {
     *   issues: [
     *     {
     *       expected: 'string',
     *       code: 'invalid_type',
     *       path: [ 'username' ],
     *       message: 'Invalid input: expected string'
     *     },
     *     {
     *       expected: 'number',
     *       code: 'invalid_type',
     *       path: [ 'favoriteNumbers', 1 ],
     *       message: 'Invalid input: expected number'
     *     }
     *   ];
     * }
     * ```
     *
     * to
     *
     * ```
     * username
     *   ✖ Expected number, received string at "username
     * favoriteNumbers[0]
     *   ✖ Invalid input: expected number
     * ```
     */
    function toDotPath(_path) {
        const segs = [];
        const path = _path.map((seg) => (typeof seg === "object" ? seg.key : seg));
        for (const seg of path) {
            if (typeof seg === "number")
                segs.push(`[${seg}]`);
            else if (typeof seg === "symbol")
                segs.push(`[${JSON.stringify(String(seg))}]`);
            else if (/[^\w$]/.test(seg))
                segs.push(`[${JSON.stringify(seg)}]`);
            else {
                if (segs.length)
                    segs.push(".");
                segs.push(seg);
            }
        }
        return segs.join("");
    }
    function prettifyError(error) {
        const lines = [];
        // sort by path length
        const issues = [...error.issues].sort((a, b) => (a.path ?? []).length - (b.path ?? []).length);
        // Process each issue
        for (const issue of issues) {
            lines.push(`✖ ${issue.message}`);
            if (issue.path?.length)
                lines.push(`  → at ${toDotPath(issue.path)}`);
        }
        // Convert Map to formatted string
        return lines.join("\n");
    }

    // Always both keys, so the `_params` read site in `_parse` sees one object shape rather than two.
    function finalizeParams(callee, params) {
        return { callee: params?.callee ?? callee, Err: params?.Err };
    }
    const _parse = (_Err) => {
        const fn = (schema, value, _ctx, _params) => {
            const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
            const result = schema._zod.run({ value, issues: [] }, ctx);
            if (result instanceof Promise) {
                throw new $ZodAsyncError();
            }
            if (result.issues.length) {
                const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
                captureStackTrace(e, _params?.callee ?? fn);
                throw e;
            }
            return result.value;
        };
        return fn;
    };
    const parse$1 = /* @__PURE__*/ _parse($ZodRealError);
    const _parseAsync = (_Err) => {
        const fn = async (schema, value, _ctx, params) => {
            const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
            let result = schema._zod.run({ value, issues: [] }, ctx);
            if (result instanceof Promise)
                result = await result;
            if (result.issues.length) {
                const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
                captureStackTrace(e, params?.callee ?? fn);
                throw e;
            }
            return result.value;
        };
        return fn;
    };
    const parseAsync$1 = /* @__PURE__*/ _parseAsync($ZodRealError);
    const _safeParse = (_Err) => (schema, value, _ctx) => {
        const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
        const result = schema._zod.run({ value, issues: [] }, ctx);
        if (result instanceof Promise) {
            throw new $ZodAsyncError();
        }
        return result.issues.length ? failure(_Err, result.issues, ctx) : { success: true, data: result.value };
    };
    const safeParse$1 = /* @__PURE__*/ _safeParse($ZodRealError);
    // the error is built on the first read of `error`: finalizing the issues and constructing the instance is most of a failing parse, and a caller that only branches on `success` never pays it. a getter in the literal keeps this small; the alternative, one shared accessor descriptor plus a hidden state slot, reads ~15% faster but costs ~75 B gzipped in every bundle
    function failure(Err, issues, ctx) {
        let error;
        return {
            success: false,
            get error() {
                if (!error) {
                    error = new Err(issues.map((iss) => finalizeIssue(iss, ctx, config())));
                    // finalizeIssue drops `input`, so the built error holds nothing; keeping the raw issues past this point pins the parsed value for the life of the result
                    issues = undefined;
                    ctx = undefined;
                }
                return error;
            },
            set error(e) {
                error = e;
                // a replacement makes the getter's branch unreachable, so the captures have to go here too
                issues = undefined;
                ctx = undefined;
            },
        };
    }
    const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
        const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
        let result = schema._zod.run({ value, issues: [] }, ctx);
        if (result instanceof Promise)
            result = await result;
        return result.issues.length ? failure(_Err, result.issues, ctx) : { success: true, data: result.value };
    };
    const safeParseAsync$1 = /* @__PURE__*/ _safeParseAsync($ZodRealError);
    // registry mirrors of the compiler's sentinels, so this module never imports the compiler
    const COMPILE_INVALID = /* @__PURE__ */ Symbol.for("zod.compile.invalid");
    const COMPILE_FALLBACK = /* @__PURE__ */ Symbol.for("zod.compile.fallback");
    // Deliberately tiny, because v8 will not inline a body carrying the fallback's object literals and throw. Everything that is not the compiled happy path lives in validateFallback, and that split is worth ~35% on a compiled schema.
    const validate = ((schema, value, _ctx) => {
        const validator = schema._zod.bag.validator;
        if (validator !== undefined) {
            if (validator(value) !== COMPILE_INVALID)
                return true;
            // a definite sentinel means the runtime would reject, so skip the re-parse; a ctx can still change the answer
            if (validator.definite === true && _ctx === undefined)
                return false;
        }
        return validateFallback(schema, value, _ctx);
    });
    function validateFallback(schema, value, _ctx) {
        const ctx = _ctx
            ? { ..._ctx, async: false, abortEarly: true }
            : { async: false, abortEarly: true };
        const fallbackRun = schema._zod.bag.fallbackRun;
        let result;
        if (fallbackRun) {
            // skip nested fast paths on the fallback, so user callbacks keep the at-most-twice bound
            ctx[COMPILE_FALLBACK] = true;
            result = fallbackRun({ value, issues: [] }, ctx);
        }
        else {
            result = schema._zod.run({ value, issues: [] }, ctx);
        }
        if (result instanceof Promise) {
            throw new $ZodAsyncError();
        }
        return result.issues.length === 0;
    }
    // no fast path: the compiler keeps async parses on the runtime, because a promise-returning callback that is not declared async compiles to a throw
    const validateAsync$1 = async (schema, value, _ctx) => {
        const ctx = _ctx
            ? { ..._ctx, async: true, abortEarly: true }
            : { async: true, abortEarly: true };
        let result = schema._zod.run({ value, issues: [] }, ctx);
        if (result instanceof Promise)
            result = await result;
        return result.issues.length === 0;
    };
    const _encode = (_Err) => {
        const parse = _parse(_Err);
        const fn = (schema, value, _ctx, _params) => {
            const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
            return parse(schema, value, ctx, finalizeParams(fn, _params));
        };
        return fn;
    };
    const encode$1 = /* @__PURE__*/ _encode($ZodRealError);
    const _decode = (_Err) => {
        const parse = _parse(_Err);
        const fn = (schema, value, _ctx, _params) => {
            return parse(schema, value, _ctx, finalizeParams(fn, _params));
        };
        return fn;
    };
    const decode$1 = /* @__PURE__*/ _decode($ZodRealError);
    const _encodeAsync = (_Err) => {
        const parseAsync = _parseAsync(_Err);
        const fn = async (schema, value, _ctx, _params) => {
            const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
            return (await parseAsync(schema, value, ctx, finalizeParams(fn, _params)));
        };
        return fn;
    };
    const encodeAsync$1 = /* @__PURE__*/ _encodeAsync($ZodRealError);
    const _decodeAsync = (_Err) => {
        const parseAsync = _parseAsync(_Err);
        const fn = async (schema, value, _ctx, _params) => {
            return await parseAsync(schema, value, _ctx, finalizeParams(fn, _params));
        };
        return fn;
    };
    const decodeAsync$1 = /* @__PURE__*/ _decodeAsync($ZodRealError);
    const _safeEncode = (_Err) => (schema, value, _ctx) => {
        const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
        return _safeParse(_Err)(schema, value, ctx);
    };
    const safeEncode$1 = /* @__PURE__*/ _safeEncode($ZodRealError);
    const _safeDecode = (_Err) => (schema, value, _ctx) => {
        return _safeParse(_Err)(schema, value, _ctx);
    };
    const safeDecode$1 = /* @__PURE__*/ _safeDecode($ZodRealError);
    const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
        const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
        return _safeParseAsync(_Err)(schema, value, ctx);
    };
    const safeEncodeAsync$1 = /* @__PURE__*/ _safeEncodeAsync($ZodRealError);
    const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
        return _safeParseAsync(_Err)(schema, value, _ctx);
    };
    const safeDecodeAsync$1 = /* @__PURE__*/ _safeDecodeAsync($ZodRealError);

    /**
     * @deprecated CUID v1 is deprecated by its authors due to information leakage
     * (timestamps embedded in the id). Use {@link cuid2} instead.
     * See https://github.com/paralleldrive/cuid.
     */
    const cuid$1 = /^[cC][0-9a-z]{6,}$/;
    const cuid2$1 = /^[0-9a-z]+$/;
    const ulid$1 = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/;
    const xid$1 = /^[0-9a-vA-V]{20}$/;
    const ksuid$1 = /^[A-Za-z0-9]{27}$/;
    const nanoid$1 = /^[a-zA-Z0-9_-]{21}$/;
    function nanoidOfLength(length) {
        return new RegExp(`^[a-zA-Z0-9_-]{${length}}$`);
    }
    /** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
    const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
    /** Implements ISO 8601-2 extensions like explicit +- prefixes, mixing weeks with other units, and fractional/negative components. */
    const extendedDuration = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
    /** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
    const guid$1 = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
    /** Returns a regex for validating an RFC 9562/4122 UUID.
     *
     * @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
    const uuid$1 = (version) => {
        if (!version)
            return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
        return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
    };
    const uuid4 = /*@__PURE__*/ uuid$1(4);
    const uuid6 = /*@__PURE__*/ uuid$1(6);
    const uuid7 = /*@__PURE__*/ uuid$1(7);
    /** Practical email validation */
    const email$1 = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
    /** Equivalent to the HTML5 input[type=email] validation implemented by browsers. Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email */
    const html5Email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    /** The classic emailregex.com regex for RFC 5322-compliant emails */
    const rfc5322Email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    /** A loose regex that allows Unicode characters, enforces length limits, and that's about it. */
    const unicodeEmail = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u;
    const idnEmail = unicodeEmail;
    const browserEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    // from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
    // Single character class, not an alternation: the two properties overlap (U+1F9B0-U+1F9B3), so `(A|B)+` backtracks exponentially on a failed match. The leading lookahead then demands one anchor — a pictograph, a regional indicator, or the enclosing keycap — because `\p{Emoji_Component}` on its own covers ASCII digits, `#`, `*`, ZWJ, variation selectors and skin tone modifiers, none of which is an emoji without a base.
    const _emoji$1 = `^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$`;
    function emoji$1() {
        return new RegExp(_emoji$1, "u");
    }
    const ipv4$1 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    const ipv6$1 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
    const mac$1 = (delimiter) => {
        const escapedDelim = escapeRegex(delimiter ?? ":");
        return new RegExp(`^(?:[0-9A-F]{2}${escapedDelim}){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}${escapedDelim}){5}[0-9a-f]{2}$`);
    };
    const cidrv4$1 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
    const cidrv6$1 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    // https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
    const base64$1 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
    const base64url$1 = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/;
    // based on https://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address
    // export const hostname: RegExp = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/;
    const hostname$1 = /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/;
    const domain = /^(?=.{1,253}$)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
    const httpProtocol = /^https?$/;
    // https://blog.stevenlevithan.com/archives/validate-phone-number#r4-3 (regex sans spaces) E.164: leading digit must be 1-9; total digits (excluding '+') between 7-15
    const e164$1 = /^\+[1-9]\d{6,14}$/;
    // Credit card shape: 12–19 digits, optionally separated by single spaces or single hyphens. ISO/IEC 7812 caps the PAN at 19 digits; 12 is the shortest issued length (Maestro).
    const creditCard$1 = /^\d(?:[ -]?\d){11,18}$/;
    // ISO 4217 alpha codes from the SIX list, regenerated by scripts/update-iso-4217.ts
    const currencyCode$1 = /^(?:AED|AFN|ALL|AMD|AOA|ARS|AUD|AWG|AZN|BAM|BBD|BDT|BHD|BIF|BMD|BND|BOB|BOV|BRL|BSD|BTN|BWP|BYN|BZD|CAD|CDF|CHE|CHF|CHW|CLF|CLP|CNY|COP|COU|CRC|CUP|CVE|CZK|DJF|DKK|DOP|DZD|EGP|ERN|ETB|EUR|FJD|FKP|GBP|GEL|GHS|GIP|GMD|GNF|GTQ|GYD|HKD|HNL|HTG|HUF|IDR|ILS|INR|IQD|IRR|ISK|JMD|JOD|JPY|KES|KGS|KHR|KMF|KPW|KRW|KWD|KYD|KZT|LAK|LBP|LKR|LRD|LSL|LYD|MAD|MDL|MGA|MKD|MMK|MNT|MOP|MRU|MUR|MVR|MWK|MXN|MXV|MYR|MZN|NAD|NGN|NIO|NOK|NPR|NZD|OMR|PAB|PEN|PGK|PHP|PKR|PLN|PYG|QAR|RON|RSD|RUB|RWF|SAR|SBD|SCR|SDG|SEK|SGD|SHP|SLE|SOS|SRD|SSP|STN|SVC|SYP|SZL|THB|TJS|TMT|TND|TOP|TRY|TTD|TWD|TZS|UAH|UGX|USD|USN|UYI|UYU|UYW|UZS|VED|VES|VND|VUV|WST|XAD|XAF|XAG|XAU|XBA|XBB|XBC|XBD|XCD|XCG|XDR|XOF|XPD|XPF|XPT|XSU|XTS|XUA|XXX|YER|ZAR|ZMW|ZWG)$/;
    // iban electronic format: 2-letter country, check digits 02-98 (the only values `98 - remainder` can produce), 11-30 bban characters
    const iban$1 = /^[A-Z]{2}(?!00|01|99)\d{2}[A-Z0-9]{11,30}$/;
    const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;

    function anchor(source) {
        return new RegExp(`^${source}$`);
    }
    const date$3 = /*@__PURE__*/ anchor(dateSource);
    function timeSource(args) {
        const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
        const regex = typeof args.precision === "number"
            ? args.precision === -1
                ? `${hhmm}`
                : args.precision === 0
                    ? `${hhmm}:[0-5]\\d`
                    : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}`
            : args.seconds
                ? `${hhmm}:[0-5]\\d(?:\\.\\d+)?`
                : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
        return regex;
    }
    function time$1(args) {
        return new RegExp(`^${timeSource(args)}$`);
    }
    // Adapted from https://stackoverflow.com/a/3143231
    function datetime$1(args) {
        const opts = ["Z"];
        // if (args.offset) opts.push(`([+-]\\d{2}:\\d{2})`);
        if (args.offset)
            opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
        // RFC 3339 mandates seconds wherever the time carries a `Z` or an offset, so only the unqualified form `local` adds may omit them
        const qualified = `${timeSource({ precision: args.precision, seconds: true })}(?:${opts.join("|")})`;
        const timeRegex = args.local ? `${qualified}|${timeSource({ precision: args.precision })}` : qualified;
        return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
    }
    // the unbounded form of `string()` as a literal, so every plain string shares one instance instead of building its own
    const anyString = /^[\s\S]{0,}$/;
    const string$2 = (params) => {
        const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
        return new RegExp(`^${regex}$`);
    };
    const bigint$2 = /^-?\d+n?$/;
    const integer = /^-?\d+$/;
    const number$2 = /^-?\d+(?:\.\d+)?$/;
    const boolean$2 = /^(?:true|false)$/i;
    const _null$2 = /^null$/i;
    const _undefined$2 = /^undefined$/i;
    // regex for string with no uppercase letters
    const lowercase = /^[^A-Z]*$/;
    // regex for string with no lowercase letters
    const uppercase = /^[^a-z]*$/;
    // regex for hexadecimal strings (any length)
    const hex$1 = /^[0-9a-fA-F]*$/;
    // Hash regexes for different algorithms and encodings
    // Helper function to create base64 regex with exact length and padding
    function fixedBase64(bodyLength, padding) {
        return new RegExp(`^[A-Za-z0-9+/]{${bodyLength}}${padding}$`);
    }
    // Helper function to create base64url regex with exact length (no padding)
    function fixedBase64url(length) {
        return new RegExp(`^[A-Za-z0-9_-]{${length}}$`);
    }
    // MD5 (16 bytes): base64 = 24 chars total (22 + "==")
    const md5_hex = /^[0-9a-fA-F]{32}$/;
    const md5_base64 = /*@__PURE__*/ fixedBase64(22, "==");
    const md5_base64url = /*@__PURE__*/ fixedBase64url(22);
    // SHA1 (20 bytes): base64 = 28 chars total (27 + "=")
    const sha1_hex = /^[0-9a-fA-F]{40}$/;
    const sha1_base64 = /*@__PURE__*/ fixedBase64(27, "=");
    const sha1_base64url = /*@__PURE__*/ fixedBase64url(27);
    // SHA256 (32 bytes): base64 = 44 chars total (43 + "=")
    const sha256_hex = /^[0-9a-fA-F]{64}$/;
    const sha256_base64 = /*@__PURE__*/ fixedBase64(43, "=");
    const sha256_base64url = /*@__PURE__*/ fixedBase64url(43);
    // SHA384 (48 bytes): base64 = 64 chars total (no padding)
    const sha384_hex = /^[0-9a-fA-F]{96}$/;
    const sha384_base64 = /*@__PURE__*/ fixedBase64(64, "");
    const sha384_base64url = /*@__PURE__*/ fixedBase64url(64);
    // SHA512 (64 bytes): base64 = 88 chars total (86 + "==")
    const sha512_hex = /^[0-9a-fA-F]{128}$/;
    const sha512_base64 = /*@__PURE__*/ fixedBase64(86, "==");
    const sha512_base64url = /*@__PURE__*/ fixedBase64url(86);

    var regexes = /*#__PURE__*/Object.freeze({
        __proto__: null,
        anyString: anyString,
        base64: base64$1,
        base64url: base64url$1,
        bigint: bigint$2,
        boolean: boolean$2,
        browserEmail: browserEmail,
        cidrv4: cidrv4$1,
        cidrv6: cidrv6$1,
        creditCard: creditCard$1,
        cuid: cuid$1,
        cuid2: cuid2$1,
        currencyCode: currencyCode$1,
        date: date$3,
        datetime: datetime$1,
        domain: domain,
        duration: duration$1,
        e164: e164$1,
        email: email$1,
        emoji: emoji$1,
        extendedDuration: extendedDuration,
        guid: guid$1,
        hex: hex$1,
        hostname: hostname$1,
        html5Email: html5Email,
        httpProtocol: httpProtocol,
        iban: iban$1,
        idnEmail: idnEmail,
        integer: integer,
        ipv4: ipv4$1,
        ipv6: ipv6$1,
        ksuid: ksuid$1,
        lowercase: lowercase,
        mac: mac$1,
        md5_base64: md5_base64,
        md5_base64url: md5_base64url,
        md5_hex: md5_hex,
        nanoid: nanoid$1,
        nanoidOfLength: nanoidOfLength,
        null: _null$2,
        number: number$2,
        rfc5322Email: rfc5322Email,
        sha1_base64: sha1_base64,
        sha1_base64url: sha1_base64url,
        sha1_hex: sha1_hex,
        sha256_base64: sha256_base64,
        sha256_base64url: sha256_base64url,
        sha256_hex: sha256_hex,
        sha384_base64: sha384_base64,
        sha384_base64url: sha384_base64url,
        sha384_hex: sha384_hex,
        sha512_base64: sha512_base64,
        sha512_base64url: sha512_base64url,
        sha512_hex: sha512_hex,
        string: string$2,
        time: time$1,
        ulid: ulid$1,
        undefined: _undefined$2,
        unicodeEmail: unicodeEmail,
        uppercase: uppercase,
        uuid: uuid$1,
        uuid4: uuid4,
        uuid6: uuid6,
        uuid7: uuid7,
        xid: xid$1
    });

    // import { $ZodType } from "./schemas.js";
    const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
        var _a;
        inst._zod ?? (inst._zod = {});
        inst._zod.def = def;
        (_a = inst._zod).onattach ?? (_a.onattach = []);
    });
    /** Default `when` for size-based checks: run only on non-nullish values with a `size`. */
    const _whenHasSize = (payload) => {
        const val = payload.value;
        return !nullish$1(val) && val.size !== undefined;
    };
    /** Default `when` for length-based checks: run only on non-nullish values with a `length`. */
    const _whenHasLength = (payload) => {
        const val = payload.value;
        return !nullish$1(val) && val.length !== undefined;
    };
    const numericOriginMap = {
        number: "number",
        bigint: "bigint",
        object: "date",
    };
    const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
        $ZodCheck.init(inst, def);
        const origin = numericOriginMap[typeof def.value];
        inst._zod.check = (payload) => {
            if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
                return;
            }
            payload.issues.push({
                origin: numericOriginMap[typeof payload.value] ?? origin,
                code: "too_big",
                maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
                input: payload.value,
                inclusive: def.inclusive,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
        $ZodCheck.init(inst, def);
        const origin = numericOriginMap[typeof def.value];
        inst._zod.check = (payload) => {
            if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
                return;
            }
            payload.issues.push({
                origin: numericOriginMap[typeof payload.value] ?? origin,
                code: "too_small",
                minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
                input: payload.value,
                inclusive: def.inclusive,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodCheckMultipleOf =
    /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
        $ZodCheck.init(inst, def);
        inst._zod.check = (payload) => {
            if (typeof payload.value !== typeof def.value)
                throw new Error("Cannot mix number and bigint in multiple_of check.");
            const isMultiple = typeof payload.value === "bigint"
                ? // `value % 0n` throws, and nothing is a multiple of zero — the number branch already fails this way via NaN
                    def.value !== BigInt(0) && payload.value % def.value === BigInt(0)
                : floatSafeRemainder(payload.value, def.value) === 0;
            if (isMultiple)
                return;
            payload.issues.push({
                origin: typeof payload.value,
                code: "not_multiple_of",
                divisor: def.value,
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
        $ZodCheck.init(inst, def); // no format checks
        def.format = def.format || "float64";
        const isInt = def.format?.includes("int");
        const origin = isInt ? "int" : "number";
        const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
        inst._zod.check = (payload) => {
            const input = payload.value;
            if (isInt) {
                if (!Number.isInteger(input)) {
                    // invalid_format issue
                    // payload.issues.push({
                    //   expected: def.format,
                    //   format: def.format,
                    //   code: "invalid_format",
                    //   input,
                    //   inst,
                    // });
                    // invalid_type issue
                    payload.issues.push({
                        expected: origin,
                        format: def.format,
                        code: "invalid_type",
                        continue: false,
                        input,
                        inst,
                    });
                    return;
                    // not_multiple_of issue
                    // payload.issues.push({
                    //   code: "not_multiple_of",
                    //   origin: "number",
                    //   input,
                    //   inst,
                    //   divisor: 1,
                    // });
                }
                if (!Number.isSafeInteger(input)) {
                    if (input > 0) {
                        // too_big
                        payload.issues.push({
                            input,
                            code: "too_big",
                            maximum: Number.MAX_SAFE_INTEGER,
                            note: "Integers must be within the safe integer range.",
                            inst,
                            origin,
                            inclusive: true,
                            continue: !def.abort,
                        });
                    }
                    else {
                        // too_small
                        payload.issues.push({
                            input,
                            code: "too_small",
                            minimum: Number.MIN_SAFE_INTEGER,
                            note: "Integers must be within the safe integer range.",
                            inst,
                            origin,
                            inclusive: true,
                            continue: !def.abort,
                        });
                    }
                    return;
                }
            }
            if (input < minimum) {
                payload.issues.push({
                    origin: "number",
                    input,
                    code: "too_small",
                    minimum,
                    inclusive: true,
                    inst,
                    continue: !def.abort,
                });
            }
            if (input > maximum) {
                payload.issues.push({
                    origin: "number",
                    input,
                    code: "too_big",
                    maximum,
                    inclusive: true,
                    inst,
                    continue: !def.abort,
                });
            }
        };
    });
    const $ZodCheckBigIntFormat = /*@__PURE__*/ $constructor("$ZodCheckBigIntFormat", (inst, def) => {
        $ZodCheck.init(inst, def); // no format checks
        const [minimum, maximum] = BIGINT_FORMAT_RANGES[def.format];
        inst._zod.check = (payload) => {
            const input = payload.value;
            if (input < minimum) {
                payload.issues.push({
                    origin: "bigint",
                    input,
                    code: "too_small",
                    minimum: minimum,
                    inclusive: true,
                    inst,
                    continue: !def.abort,
                });
            }
            if (input > maximum) {
                payload.issues.push({
                    origin: "bigint",
                    input,
                    code: "too_big",
                    maximum,
                    inclusive: true,
                    inst,
                    continue: !def.abort,
                });
            }
        };
    });
    const $ZodCheckMaxSize = /*@__PURE__*/ $constructor("$ZodCheckMaxSize", (inst, def) => {
        var _a;
        $ZodCheck.init(inst, def);
        (_a = inst._zod.def).when ?? (_a.when = _whenHasSize);
        inst._zod.check = (payload) => {
            const input = payload.value;
            const size = input.size;
            if (size <= def.maximum)
                return;
            payload.issues.push({
                origin: getSizableOrigin(input),
                code: "too_big",
                maximum: def.maximum,
                inclusive: true,
                input,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodCheckMinSize = /*@__PURE__*/ $constructor("$ZodCheckMinSize", (inst, def) => {
        var _a;
        $ZodCheck.init(inst, def);
        (_a = inst._zod.def).when ?? (_a.when = _whenHasSize);
        inst._zod.check = (payload) => {
            const input = payload.value;
            const size = input.size;
            if (size >= def.minimum)
                return;
            payload.issues.push({
                origin: getSizableOrigin(input),
                code: "too_small",
                minimum: def.minimum,
                inclusive: true,
                input,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodCheckSizeEquals = /*@__PURE__*/ $constructor("$ZodCheckSizeEquals", (inst, def) => {
        var _a;
        $ZodCheck.init(inst, def);
        (_a = inst._zod.def).when ?? (_a.when = _whenHasSize);
        inst._zod.check = (payload) => {
            const input = payload.value;
            const size = input.size;
            if (size === def.size)
                return;
            const tooBig = size > def.size;
            payload.issues.push({
                origin: getSizableOrigin(input),
                ...(tooBig ? { code: "too_big", maximum: def.size } : { code: "too_small", minimum: def.size }),
                inclusive: true,
                exact: true,
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
        var _a;
        $ZodCheck.init(inst, def);
        (_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
        inst._zod.check = (payload) => {
            const input = payload.value;
            const units = input.length;
            // Strings are measured in Unicode code points, not UTF-16 units. A code point is at most two units, so a string that already fits in units fits in code points; only an overflow has to be counted.
            const length = typeof input === "string" && units > def.maximum ? codePointLength(input) : units;
            if (length <= def.maximum)
                return;
            const origin = getLengthableOrigin(input);
            payload.issues.push({
                origin,
                code: "too_big",
                maximum: def.maximum,
                inclusive: true,
                input,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
        var _a;
        $ZodCheck.init(inst, def);
        (_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
        inst._zod.check = (payload) => {
            const input = payload.value;
            const units = input.length;
            // A code point is one or two UTF-16 units, so fewer units than the floor can never reach it and twice the floor always clears it. Only in between is the exact count in doubt.
            const length = typeof input === "string" && units >= def.minimum && units < def.minimum * 2
                ? codePointLength(input)
                : units;
            if (length >= def.minimum)
                return;
            const origin = getLengthableOrigin(input);
            payload.issues.push({
                origin,
                code: "too_small",
                minimum: def.minimum,
                inclusive: true,
                input,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
        var _a;
        $ZodCheck.init(inst, def);
        (_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
        inst._zod.check = (payload) => {
            const input = payload.value;
            const units = input.length;
            // A code point is one or two UTF-16 units, so outside `[length, length * 2]` units the target is missed either way — and missed in the same direction in both measures.
            const length = typeof input === "string" && units >= def.length && units <= def.length * 2
                ? codePointLength(input)
                : units;
            if (length === def.length)
                return;
            const origin = getLengthableOrigin(input);
            const tooBig = length > def.length;
            payload.issues.push({
                origin,
                ...(tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length }),
                inclusive: true,
                exact: true,
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
        var _a, _b;
        $ZodCheck.init(inst, def);
        if (def.pattern)
            (_a = inst._zod).check ?? (_a.check = (payload) => {
                def.pattern.lastIndex = 0;
                if (def.pattern.test(payload.value))
                    return;
                payload.issues.push({
                    origin: "string",
                    code: "invalid_format",
                    format: def.format,
                    input: payload.value,
                    ...(def.pattern ? { pattern: def.pattern.toString() } : {}),
                    inst,
                    continue: !def.abort,
                });
            });
        else
            (_b = inst._zod).check ?? (_b.check = () => { });
    });
    const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
        $ZodCheckStringFormat.init(inst, def);
        inst._zod.check = (payload) => {
            def.pattern.lastIndex = 0;
            if (def.pattern.test(payload.value))
                return;
            payload.issues.push({
                origin: "string",
                code: "invalid_format",
                format: "regex",
                input: payload.value,
                pattern: def.pattern.toString(),
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
        def.pattern ?? (def.pattern = lowercase);
        $ZodCheckStringFormat.init(inst, def);
    });
    const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
        def.pattern ?? (def.pattern = uppercase);
        $ZodCheckStringFormat.init(inst, def);
    });
    const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
        $ZodCheck.init(inst, def);
        const escapedRegex = escapeRegex(def.includes);
        // `String.prototype.includes(sub, position)` matches `sub` at `position`
        // OR LATER, so the pattern must allow at least `position` leading chars
        // (`{N,}`), not exactly `position` chars (`{N}`).
        const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position},}${escapedRegex}` : escapedRegex);
        def.pattern = pattern;
        inst._zod.check = (payload) => {
            if (payload.value.includes(def.includes, def.position))
                return;
            payload.issues.push({
                origin: "string",
                code: "invalid_format",
                format: "includes",
                includes: def.includes,
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
        $ZodCheck.init(inst, def);
        const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
        def.pattern ?? (def.pattern = pattern);
        inst._zod.check = (payload) => {
            if (payload.value.startsWith(def.prefix))
                return;
            payload.issues.push({
                origin: "string",
                code: "invalid_format",
                format: "starts_with",
                prefix: def.prefix,
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
        $ZodCheck.init(inst, def);
        const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
        def.pattern ?? (def.pattern = pattern);
        inst._zod.check = (payload) => {
            if (payload.value.endsWith(def.suffix))
                return;
            payload.issues.push({
                origin: "string",
                code: "invalid_format",
                format: "ends_with",
                suffix: def.suffix,
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        };
    });
    ///////////////////////////////////
    /////    $ZodCheckProperty    /////
    ///////////////////////////////////
    function handleCheckPropertyResult(result, payload, property) {
        if (result.issues.length) {
            payload.issues.push(...prefixIssues(property, result.issues));
        }
    }
    const $ZodCheckProperty = /*@__PURE__*/ $constructor("$ZodCheckProperty", (inst, def) => {
        $ZodCheck.init(inst, def);
        inst._zod.check = (payload) => {
            const result = def.schema._zod.run({
                value: payload.value[def.property],
                issues: [],
            }, {});
            if (result instanceof Promise) {
                return result.then((result) => handleCheckPropertyResult(result, payload, def.property));
            }
            handleCheckPropertyResult(result, payload, def.property);
            return;
        };
    });
    const $ZodCheckProperties = /*@__PURE__*/ $constructor("$ZodCheckProperties", (inst, def) => {
        $ZodCheck.init(inst, def);
        hide(inst, Symbol.iterator, function* () {
            yield inst;
        });
        // key and schema snapshotted together: reading one live and the other cached lets a later mutation of the caller's shape object pair a stale key with a missing schema
        let entries;
        inst._zod.check = (payload) => {
            // the base schema already typed the value, so only a nullish one is rejected here: the properties read on a primitive too, matching z.property() on a string's length
            if (payload.value == null) {
                payload.issues.push({ expected: "object", code: "invalid_type", input: payload.value, inst });
                return undefined;
            }
            entries ?? (entries = Reflect.ownKeys(def.shape).map((key) => [key, def.shape[key]]));
            const input = payload.value;
            let proms;
            for (const [key, schema] of entries) {
                const result = schema._zod.run({ value: input[key], issues: [] }, {});
                if (result instanceof Promise) {
                    proms ?? (proms = []);
                    proms.push(result.then((result) => handleCheckPropertyResult(result, payload, key)));
                }
                else {
                    handleCheckPropertyResult(result, payload, key);
                }
            }
            if (proms)
                return Promise.all(proms).then(() => undefined);
            return undefined;
        };
    });
    const $ZodCheckMimeType = /*@__PURE__*/ $constructor("$ZodCheckMimeType", (inst, def) => {
        $ZodCheck.init(inst, def);
        const mimeSet = new Set(def.mime);
        inst._zod.check = (payload) => {
            if (mimeSet.has(payload.value.type))
                return;
            payload.issues.push({
                code: "invalid_value",
                values: def.mime,
                input: payload.value.type,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
        $ZodCheck.init(inst, def);
        inst._zod.check = (payload) => {
            payload.value = def.tx(payload.value);
        };
    });

    class Doc {
        constructor(args = [], closed = {}) {
            this.content = [];
            this.indent = 0;
            this.args = args;
            this.closed = closed;
        }
        // the compiler catches a child's throw and keeps writing into this doc, so the indent has to unwind with it
        indented(fn) {
            this.indent += 1;
            try {
                fn(this);
            }
            finally {
                this.indent -= 1;
            }
        }
        write(arg) {
            if (typeof arg === "function") {
                arg(this, { execution: "sync" });
                arg(this, { execution: "async" });
                return;
            }
            const content = arg;
            const lines = content.split("\n").filter((x) => x);
            const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
            const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
            for (const line of dedented) {
                this.content.push(line);
            }
        }
        compile() {
            const F = Function;
            const content = this?.content ?? [``];
            const factory = new F(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {\n${content.join("\n")}\n};`);
            return factory(...Object.values(this.closed));
        }
    }

    const version = {
        major: 4,
        minor: 6,
        patch: 7,
    };

    const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
        var _a;
        inst ?? (inst = {});
        inst._zod.def = def; // set _def property
        inst._zod.bag = inst._zod.bag || {}; // initialize _bag object
        inst._zod.version = version;
        const defChecks = inst._zod.def.checks;
        // if inst is itself a checks.$ZodCheck, run it as a check
        const checks = inst._zod.traits.has("$ZodCheck")
            ? [inst, ...(defChecks ?? [])]
            : defChecks?.length
                ? [...defChecks]
                : [];
        for (const ch of checks) {
            for (const fn of ch._zod.onattach) {
                fn(inst);
            }
        }
        if (checks.length === 0) {
            // deferred initializer inst._zod.parse is not yet defined
            (_a = inst._zod).deferred ?? (_a.deferred = []);
            inst._zod.deferred?.push(() => {
                inst._zod.run = inst._zod.parse;
            });
        }
        else {
            const runChecks = (payload, checks, ctx) => {
                if (payload.memo)
                    return payload;
                let isAborted = aborted(payload);
                let asyncResult;
                for (const ch of checks) {
                    if (ch._zod.def.when) {
                        if (explicitlyAborted(payload))
                            continue;
                        const shouldRun = ch._zod.def.when(payload);
                        if (!shouldRun)
                            continue;
                    }
                    else if (isAborted) {
                        continue;
                    }
                    const currLen = payload.issues.length;
                    const _ = ch._zod.check(payload);
                    if (_ instanceof Promise && ctx?.async === false) {
                        throw new $ZodAsyncError();
                    }
                    if (asyncResult || _ instanceof Promise) {
                        asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
                            await _;
                            const nextLen = payload.issues.length;
                            if (nextLen === currLen)
                                return;
                            attachSchema(payload.issues, currLen, inst);
                            if (!isAborted)
                                isAborted = aborted(payload, currLen);
                        });
                    }
                    else {
                        const nextLen = payload.issues.length;
                        if (nextLen === currLen)
                            continue;
                        attachSchema(payload.issues, currLen, inst);
                        if (!isAborted)
                            isAborted = aborted(payload, currLen);
                    }
                }
                if (asyncResult) {
                    return asyncResult.then(() => {
                        return payload;
                    });
                }
                return payload;
            };
            const handleCanaryResult = (canary, payload, ctx) => {
                // abort if the canary is aborted
                if (aborted(canary)) {
                    canary.aborted = true;
                    return canary;
                }
                // run checks first, then
                const checkResult = runChecks(payload, checks, ctx);
                if (checkResult instanceof Promise) {
                    if (ctx.async === false)
                        throw new $ZodAsyncError();
                    return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
                }
                return inst._zod.parse(checkResult, ctx);
            };
            inst._zod.run = (payload, ctx) => {
                if (ctx.skipChecks) {
                    return inst._zod.parse(payload, ctx);
                }
                if (ctx.direction === "backward") {
                    // run canary initial pass (no checks)
                    const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
                    if (canary instanceof Promise) {
                        return canary.then((canary) => {
                            return handleCanaryResult(canary, payload, ctx);
                        });
                    }
                    return handleCanaryResult(canary, payload, ctx);
                }
                // forward
                const result = inst._zod.parse(payload, ctx);
                if (result instanceof Promise) {
                    if (ctx.async === false)
                        throw new $ZodAsyncError();
                    return result.then((result) => runChecks(result, checks, ctx));
                }
                return runChecks(result, checks, ctx);
            };
        }
    }, {
        // Wrappers extend this by installing a richer factory over it; reading it eagerly would defeat the laziness.
        get "~standard"() {
            return hide(this, "~standard", standardProps(this));
        },
        set "~standard"(value) {
            own(this, "~standard", value);
        },
    });
    /** The Standard Schema surface for `inst`. Shared so wrappers can extend it without forcing it. */
    // a Standard Schema result only reports issues, so a failure finalizes them straight off the raw payload: no ZodError, and no lazy result to read through
    const toStandardResult = (r, ctx) => r.issues.length ? { issues: r.issues.map((iss) => finalizeIssue(iss, ctx, config())) } : { value: r.value };
    async function validateAsync(inst, value) {
        const ctx = { async: true };
        return toStandardResult((await inst._zod.run({ value, issues: [] }, ctx)), ctx);
    }
    function standardProps(inst) {
        return {
            validate: (value) => {
                const ctx = { async: false };
                try {
                    const r = inst._zod.run({ value, issues: [] }, ctx);
                    if (!(r instanceof Promise))
                        return toStandardResult(r, ctx);
                }
                catch (_) { }
                // async function so a synchronously throwing check rejects instead of escaping validate
                return validateAsync(inst, value);
            },
            vendor: "zod",
            version: 1,
        };
    }
    const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
        $ZodType.init(inst, def);
        // a format's own pattern, else unbounded; a template literal derives the check-aware form itself
        inst._zod.pattern = def.pattern ?? anyString;
        inst._zod.parse = (payload, _) => {
            if (def.coerce)
                try {
                    payload.value = String(payload.value);
                }
                catch (_) { }
            if (typeof payload.value === "string")
                return payload;
            payload.issues.push({
                expected: "string",
                code: "invalid_type",
                input: payload.value,
                inst,
            });
            return payload;
        };
    });
    const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
        // check initialization must come first
        $ZodCheckStringFormat.init(inst, def);
        $ZodString.init(inst, def);
    });
    const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
        def.pattern ?? (def.pattern = guid$1);
        $ZodStringFormat.init(inst, def);
    });
    const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
        if (def.version) {
            const versionMap = {
                v1: 1,
                v2: 2,
                v3: 3,
                v4: 4,
                v5: 5,
                v6: 6,
                v7: 7,
                v8: 8,
            };
            const v = versionMap[def.version];
            if (v === undefined)
                throw new Error(`Invalid UUID version: "${def.version}"`);
            def.pattern ?? (def.pattern = uuid$1(v));
        }
        else
            def.pattern ?? (def.pattern = uuid$1());
        $ZodStringFormat.init(inst, def);
    });
    const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
        def.pattern ?? (def.pattern = email$1);
        $ZodStringFormat.init(inst, def);
    });
    /** The `://` guard rejected the input before the URL constructor saw it. */
    const URL_BAD_FORMAT = 1;
    /** The URL parser rejected the input. */
    const URL_UNPARSEABLE = 2;
    function canParseURL(input) {
        try {
            if (typeof URL !== "undefined" && typeof URL.canParse === "function")
                return URL.canParse(input);
            new URL(input);
            return true;
        }
        catch {
            return false;
        }
    }
    function validateURL(trimmed, def) {
        if (!("normalize" in def) && !("hostname" in def) && !("protocol" in def)) {
            return canParseURL(trimmed) || URL_UNPARSEABLE;
        }
        return parseURLObject(trimmed, def);
    }
    /** Parses a URL while preserving the non-normalizing HTTP guard. */
    function parseURLObject(trimmed, def) {
        // When normalize is off, require :// for http/https URLs. This prevents strings like "http:example.com" or "https:/path" from being silently accepted
        if (!def.normalize && def.protocol?.source === httpProtocol.source && !/^https?:\/\//i.test(trimmed)) {
            return URL_BAD_FORMAT;
        }
        try {
            if (typeof URL !== "undefined") {
                const URLStatic = URL;
                if (typeof URLStatic.parse === "function")
                    return URLStatic.parse(trimmed) ?? URL_UNPARSEABLE;
            }
            // @ts-ignore
            return new URL(trimmed);
        }
        catch {
            return URL_UNPARSEABLE;
        }
    }
    const asciiTabOrNewline = /[\t\n\r]/g;
    /** The URL parser deletes every ASCII tab, LF and CR from its input before it parses, so `new URL("https://exa\nmple.com")` reports on `example.com`. Applying the same deletion to the returned value closes the half of that divergence which can move the host; the parser's other rewrite, stripping C0 controls at the edges, cannot. */
    function stripTabAndNewline(value) {
        return value.replace(asciiTabOrNewline, "");
    }
    function urlHostnameOk(url, hostname) {
        hostname.lastIndex = 0;
        return hostname.test(url.hostname);
    }
    function urlProtocolOk(url, protocol) {
        protocol.lastIndex = 0;
        return protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol);
    }
    const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
        $ZodStringFormat.init(inst, def);
        inst._zod.check = (payload) => {
            try {
                // Trim whitespace from input
                const trimmed = payload.value.trim();
                const url = validateURL(trimmed, def);
                if (url === URL_BAD_FORMAT) {
                    payload.issues.push({
                        code: "invalid_format",
                        format: "url",
                        note: "Invalid URL format",
                        input: payload.value,
                        inst,
                        continue: !def.abort,
                    });
                    return;
                }
                if (url === URL_UNPARSEABLE) {
                    payload.issues.push({
                        code: "invalid_format",
                        format: "url",
                        input: payload.value,
                        inst,
                        continue: !def.abort,
                    });
                    return;
                }
                if (url === true) {
                    payload.value = stripTabAndNewline(trimmed);
                    return;
                }
                if (def.hostname && !urlHostnameOk(url, def.hostname)) {
                    payload.issues.push({
                        code: "invalid_format",
                        format: "url",
                        note: "Invalid hostname",
                        pattern: def.hostname.source,
                        input: payload.value,
                        inst,
                        continue: !def.abort,
                    });
                }
                if (def.protocol && !urlProtocolOk(url, def.protocol)) {
                    payload.issues.push({
                        code: "invalid_format",
                        format: "url",
                        note: "Invalid protocol",
                        pattern: def.protocol.source,
                        input: payload.value,
                        inst,
                        continue: !def.abort,
                    });
                }
                // Set the output value based on normalize flag
                payload.value = def.normalize ? url.href : stripTabAndNewline(trimmed);
                return;
            }
            catch (_) {
                payload.issues.push({
                    code: "invalid_format",
                    format: "url",
                    input: payload.value,
                    inst,
                    continue: !def.abort,
                });
            }
        };
    });
    const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
        def.pattern ?? (def.pattern = emoji$1());
        $ZodStringFormat.init(inst, def);
    });
    const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
        if (def.length !== undefined && (!Number.isInteger(def.length) || def.length < 1))
            throw new Error(`Invalid nanoid length: ${def.length}`);
        def.pattern ?? (def.pattern = def.length === undefined ? nanoid$1 : nanoidOfLength(def.length));
        $ZodStringFormat.init(inst, def);
    });
    /**
     * @deprecated CUID v1 is deprecated by its authors due to information leakage
     * (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
     * See https://github.com/paralleldrive/cuid.
     */
    const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
        def.pattern ?? (def.pattern = cuid$1);
        $ZodStringFormat.init(inst, def);
    });
    const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
        def.pattern ?? (def.pattern = cuid2$1);
        $ZodStringFormat.init(inst, def);
    });
    const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
        def.pattern ?? (def.pattern = ulid$1);
        $ZodStringFormat.init(inst, def);
    });
    const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
        def.pattern ?? (def.pattern = xid$1);
        $ZodStringFormat.init(inst, def);
    });
    const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
        def.pattern ?? (def.pattern = ksuid$1);
        $ZodStringFormat.init(inst, def);
    });
    const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
        def.pattern ?? (def.pattern = datetime$1(def));
        $ZodStringFormat.init(inst, def);
    });
    const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
        def.pattern ?? (def.pattern = date$3);
        $ZodStringFormat.init(inst, def);
    });
    const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
        def.pattern ?? (def.pattern = time$1(def));
        $ZodStringFormat.init(inst, def);
    });
    const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
        def.pattern ?? (def.pattern = duration$1);
        $ZodStringFormat.init(inst, def);
    });
    const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
        def.pattern ?? (def.pattern = ipv4$1);
        $ZodStringFormat.init(inst, def);
    });
    /** An IPv6 address is written with hex digits, colons and dots, and nothing else. The guard is what makes the check below an IPv6 check: `new URL("http://[...]")` parses an authority, not an address, so `@` and `\` re-delimit it and `"::@1\\"` validates against the host `0.0.0.1`. The URL parser also deletes ASCII tab, LF and CR rather than failing, which is how `"::1\n"` validated as `::1`. */
    const ipv6Alphabet = /^[0-9a-fA-F:.]+$/;
    function isValidIPv6(value) {
        if (!ipv6Alphabet.test(value))
            return false;
        return canParseURL(`http://[${value}]`);
    }
    const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
        def.pattern ?? (def.pattern = ipv6$1);
        $ZodStringFormat.init(inst, def);
        inst._zod.check = (payload) => {
            if (!isValidIPv6(payload.value)) {
                payload.issues.push({
                    code: "invalid_format",
                    format: "ipv6",
                    input: payload.value,
                    inst,
                    continue: !def.abort,
                });
            }
        };
    });
    const $ZodMAC = /*@__PURE__*/ $constructor("$ZodMAC", (inst, def) => {
        def.pattern ?? (def.pattern = mac$1(def.delimiter));
        $ZodStringFormat.init(inst, def);
    });
    const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
        def.pattern ?? (def.pattern = cidrv4$1);
        $ZodStringFormat.init(inst, def);
    });
    function isValidCIDRv6(value) {
        const parts = value.split("/");
        if (parts.length !== 2)
            return false;
        const [address, prefix] = parts;
        if (!prefix)
            return false;
        const prefixNum = Number(prefix);
        if (`${prefixNum}` !== prefix)
            return false;
        if (prefixNum < 0 || prefixNum > 128)
            return false;
        return isValidIPv6(address);
    }
    const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
        def.pattern ?? (def.pattern = cidrv6$1); // not used for validation
        $ZodStringFormat.init(inst, def);
        inst._zod.check = (payload) => {
            if (!isValidCIDRv6(payload.value)) {
                payload.issues.push({
                    code: "invalid_format",
                    format: "cidrv6",
                    input: payload.value,
                    inst,
                    continue: !def.abort,
                });
            }
        };
    });
    //////////////////////////////   ZodBase64   //////////////////////////////
    function isValidBase64(data) {
        if (data === "")
            return true;
        // atob ignores whitespace, so reject it up front.
        if (/\s/.test(data))
            return false;
        if (data.length % 4 !== 0)
            return false;
        try {
            // @ts-ignore
            atob(data);
            return true;
        }
        catch {
            return false;
        }
    }
    // lax on purpose: the quantified regexes.base64 overflows the regex stack on multi-MB input and its leading ^$| alternation leaks through template-literal composition; isValidBase64 enforces length and padding
    const base64Charset = /^[0-9a-zA-Z+/]*={0,2}$/;
    const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
        def.pattern ?? (def.pattern = base64Charset);
        $ZodStringFormat.init(inst, def);
        inst._zod.check = (payload) => {
            if (isValidBase64(payload.value))
                return;
            payload.issues.push({
                code: "invalid_format",
                format: "base64",
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        };
    });
    //////////////////////////////   ZodBase64URL   //////////////////////////////
    // lax on purpose: the quantified regexes.base64url overflows the regex stack on multi-MB input; isValidBase64 enforces length on the padded string
    const base64urlCharset = /^[A-Za-z0-9_-]*$/;
    function isValidBase64URL(data) {
        if (!base64urlCharset.test(data))
            return false;
        const base64 = data.replace(/[-_]/g, (c) => (c === "-" ? "+" : "/"));
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
        return isValidBase64(padded);
    }
    const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
        def.pattern ?? (def.pattern = base64urlCharset);
        $ZodStringFormat.init(inst, def);
        inst._zod.check = (payload) => {
            if (isValidBase64URL(payload.value))
                return;
            payload.issues.push({
                code: "invalid_format",
                format: "base64url",
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
        def.pattern ?? (def.pattern = e164$1);
        $ZodStringFormat.init(inst, def);
    });
    //////////////////////////////   ZodCreditCard   //////////////////////////////
    const CC_SANITIZE = /[- ]/g;
    /** Luhn checksum on a digit-only string. Adapted from valibot (MIT). */
    function isLuhnAlgo(digits) {
        let length = digits.length;
        let bit = 1;
        let sum = 0;
        while (length) {
            const value = digits.charCodeAt(--length) - 48;
            bit ^= 1;
            sum += bit ? [0, 2, 4, 6, 8, 1, 3, 5, 7, 9][value] : value;
        }
        return sum % 10 === 0;
    }
    function isValidCreditCard(input) {
        if (!creditCard$1.test(input))
            return false;
        return isLuhnAlgo(input.replace(CC_SANITIZE, ""));
    }
    const $ZodCreditCard = /*@__PURE__*/ $constructor("$ZodCreditCard", (inst, def) => {
        // Shape only — the Luhn check below is not expressible as a pattern, so consumers of `pattern` (JSON Schema, template literals) get the length and separator rules alone.
        def.pattern ?? (def.pattern = creditCard$1);
        $ZodStringFormat.init(inst, def);
        inst._zod.check = (payload) => {
            if (isValidCreditCard(payload.value))
                return;
            payload.issues.push({
                code: "invalid_format",
                format: "credit_card",
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        };
    });
    //////////////////////////////   ZodIBAN   //////////////////////////////
    // iso 7064 mod 97-10 checksum without BigInt
    function isIso7064Mod97(iban) {
        let remainder = 0;
        const len = iban.length;
        for (let i = 4; i < len; i++) {
            const code = iban.charCodeAt(i);
            remainder = (code >= 65 ? remainder * 100 + (code - 55) : remainder * 10 + (code - 48)) % 97;
        }
        for (let i = 0; i < 4; i++) {
            const code = iban.charCodeAt(i);
            remainder = (code >= 65 ? remainder * 100 + (code - 55) : remainder * 10 + (code - 48)) % 97;
        }
        return remainder === 1;
    }
    function isValidIBAN(input) {
        if (!iban$1.test(input))
            return false;
        return isIso7064Mod97(input);
    }
    const $ZodIBAN = /*@__PURE__*/ $constructor("$ZodIBAN", (inst, def) => {
        // shape only — checksum is not expressible as a pattern
        def.pattern ?? (def.pattern = iban$1);
        $ZodStringFormat.init(inst, def);
        inst._zod.check = (payload) => {
            if (isValidIBAN(payload.value))
                return;
            payload.issues.push({
                code: "invalid_format",
                format: "iban",
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        };
    });
    //////////////////////////////   ZodJWT   //////////////////////////////
    function isValidJWT(token, algorithm = null) {
        try {
            const tokensParts = token.split(".");
            if (tokensParts.length !== 3)
                return false;
            const [header] = tokensParts;
            if (!header)
                return false;
            // @ts-ignore
            const parsedHeader = JSON.parse(atob(header));
            if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
                return false;
            if (!parsedHeader.alg)
                return false;
            if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
                return false;
            return true;
        }
        catch {
            return false;
        }
    }
    const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
        $ZodStringFormat.init(inst, def);
        inst._zod.check = (payload) => {
            if (isValidJWT(payload.value, def.alg))
                return;
            payload.issues.push({
                code: "invalid_format",
                format: "jwt",
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodCustomStringFormat = /*@__PURE__*/ $constructor("$ZodCustomStringFormat", (inst, def) => {
        $ZodStringFormat.init(inst, def);
        inst._zod.check = (payload) => {
            if (def.fn(payload.value))
                return;
            payload.issues.push({
                code: "invalid_format",
                format: def.format,
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        };
    });
    const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.pattern = number$2;
        inst._zod.parse = (payload, _ctx) => {
            if (def.coerce)
                try {
                    payload.value = Number(payload.value);
                }
                catch (_) { }
            const input = payload.value;
            if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
                return payload;
            }
            const received = typeof input === "number"
                ? Number.isNaN(input)
                    ? "NaN"
                    : !Number.isFinite(input)
                        ? String(input)
                        : undefined
                : undefined;
            payload.issues.push({
                expected: "number",
                code: "invalid_type",
                input,
                inst,
                ...(received ? { received } : {}),
            });
            return payload;
        };
    });
    const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
        $ZodCheckNumberFormat.init(inst, def);
        $ZodNumber.init(inst, def); // no format checks
    });
    const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.pattern = boolean$2;
        inst._zod.parse = (payload, _ctx) => {
            if (def.coerce)
                try {
                    payload.value = Boolean(payload.value);
                }
                catch (_) { }
            const input = payload.value;
            if (typeof input === "boolean")
                return payload;
            payload.issues.push({
                expected: "boolean",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        };
    });
    const $ZodBigInt = /*@__PURE__*/ $constructor("$ZodBigInt", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.pattern = bigint$2;
        inst._zod.parse = (payload, _ctx) => {
            if (def.coerce)
                try {
                    payload.value = BigInt(payload.value);
                }
                catch (_) { }
            if (typeof payload.value === "bigint")
                return payload;
            payload.issues.push({
                expected: "bigint",
                code: "invalid_type",
                input: payload.value,
                inst,
            });
            return payload;
        };
    });
    const $ZodBigIntFormat = /*@__PURE__*/ $constructor("$ZodBigIntFormat", (inst, def) => {
        $ZodCheckBigIntFormat.init(inst, def);
        $ZodBigInt.init(inst, def); // no format checks
    });
    const $ZodSymbol = /*@__PURE__*/ $constructor("$ZodSymbol", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.parse = (payload, _ctx) => {
            const input = payload.value;
            if (typeof input === "symbol")
                return payload;
            payload.issues.push({
                expected: "symbol",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        };
    });
    const $ZodUndefined = /*@__PURE__*/ $constructor("$ZodUndefined", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.pattern = _undefined$2;
        inst._zod.values = new Set([undefined]);
        inst._zod.parse = (payload, _ctx) => {
            const input = payload.value;
            if (typeof input === "undefined")
                return payload;
            payload.issues.push({
                expected: "undefined",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        };
    });
    const $ZodNull = /*@__PURE__*/ $constructor("$ZodNull", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.pattern = _null$2;
        inst._zod.values = new Set([null]);
        inst._zod.parse = (payload, _ctx) => {
            const input = payload.value;
            if (input === null)
                return payload;
            payload.issues.push({
                expected: "null",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        };
    });
    const $ZodAny = /*@__PURE__*/ $constructor("$ZodAny", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.parse = (payload) => payload;
    });
    const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.parse = (payload) => payload;
    });
    const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.parse = (payload, _ctx) => {
            payload.issues.push({
                expected: "never",
                code: "invalid_type",
                input: payload.value,
                inst,
            });
            return payload;
        };
    });
    const $ZodVoid = /*@__PURE__*/ $constructor("$ZodVoid", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.parse = (payload, _ctx) => {
            const input = payload.value;
            if (typeof input === "undefined")
                return payload;
            payload.issues.push({
                expected: "void",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        };
    });
    const $ZodDate = /*@__PURE__*/ $constructor("$ZodDate", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.parse = (payload, _ctx) => {
            if (def.coerce) {
                try {
                    payload.value = new Date(payload.value);
                }
                catch (_err) { }
            }
            const input = payload.value;
            const isDate = input instanceof Date;
            const isValidDate = isDate && !Number.isNaN(input.getTime());
            if (isValidDate)
                return payload;
            payload.issues.push({
                expected: "date",
                code: "invalid_type",
                input,
                ...(isDate ? { received: "Invalid Date" } : {}),
                inst,
            });
            return payload;
        };
    });
    // an oversized container fails its leading size checks before any element is parsed
    function capSize(inst, size) {
        const caps = sizeCaps(inst._zod.def.checks);
        if (!caps.length)
            return;
        const cap = Math.min(...caps.map((c) => c[0]));
        const parse = inst._zod.parse;
        inst._zod.parse = (payload, ctx) => {
            const n = size(payload.value);
            if (n > cap && !ctx?.skipChecks && ctx?.direction !== "backward") {
                for (const [max, ch] of sizeCaps(inst._zod.def.checks)) {
                    if (n > max && ch._zod.def.when(payload)) {
                        const start = payload.issues.length;
                        ch._zod.check(payload);
                        // the value is still the raw input, so no later check may read it
                        payload.issues[start].continue = false;
                        attachSchema(payload.issues, start, inst);
                        return payload;
                    }
                }
            }
            return parse(payload, ctx);
        };
    }
    const arraySize = (input) => (Array.isArray(input) ? input.length : -1);
    const mapSize = (input) => (input instanceof Map ? input.size : -1);
    const setSize = (input) => (input instanceof Set ? input.size : -1);
    function handleArrayResult(result, final, index) {
        if (result.issues.length) {
            final.issues.push(...prefixIssues(index, result.issues));
        }
        final.value[index] = result.value;
    }
    const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
        $ZodType.init(inst, def);
        const memo = globalConfig.memoizer;
        memo?.attach(inst);
        inst._zod.parse = (payload, ctx) => {
            const input = payload.value;
            if (!Array.isArray(input)) {
                payload.issues.push({
                    expected: "array",
                    code: "invalid_type",
                    input,
                    inst,
                });
                return payload;
            }
            payload.value = memo ? memo.alloc(inst, payload, Array(input.length), ctx) : Array(input.length);
            const proms = [];
            const abortEarly = ctx?.abortEarly;
            for (let i = 0; i < input.length; i++) {
                const item = input[i];
                const result = def.element._zod.run({
                    value: item,
                    issues: [],
                }, ctx);
                if (result instanceof Promise) {
                    proms.push(result.then((result) => handleArrayResult(result, payload, i)));
                }
                else {
                    handleArrayResult(result, payload, i);
                    // the element's payload is authoritative here, since handleArrayResult forwards every issue; an object's is not, because it drops a failed absent optional
                    if (abortEarly && result.issues.length !== 0 && aborted(result))
                        break;
                }
            }
            if (proms.length) {
                return Promise.all(proms).then(() => payload);
            }
            return payload; //handleArrayResultsAsync(parseResults, final);
        };
        capSize(inst, arraySize);
    });
    function handlePropertyResult(result, final, key, input, optin, optout) {
        const isPresent = key in input;
        const isOptionalOut = optout === "optional";
        // The middle rung means "absence permitted, nothing supplied in its place", so an absent key contributes nothing — whatever the schema made of `undefined` is invented, not substituted. Only `optional` reaches this with a value: `defaulted` substitutes, and a schema that isn't optional-out has to keep the key.
        if (!isPresent && isOptionalOut && optin === "optional") {
            return;
        }
        if (result.issues.length) {
            // For optional-in/out schemas, ignore errors on absent keys.
            if (optin !== undefined && isOptionalOut && !isPresent) {
                return;
            }
            final.issues.push(...prefixIssues(key, result.issues));
        }
        if (!isPresent && optin === undefined) {
            if (!result.issues.length) {
                final.issues.push({
                    code: "invalid_type",
                    expected: "nonoptional",
                    input: undefined,
                    path: [key],
                });
            }
            return;
        }
        if (result.value === undefined) {
            if (isPresent || (optin === "defaulted" && !isOptionalOut)) {
                final.value[key] = undefined;
            }
        }
        else {
            final.value[key] = result.value;
        }
    }
    // one shared instance; a fresh [] per schema cost 56 bytes retained
    const NO_SYMBOL_KEYS = [];
    function normalizeDef(def) {
        const keys = Object.keys(def.shape);
        const ownSymbols = Object.getOwnPropertySymbols(def.shape);
        const symbolKeys = ownSymbols.length ? ownSymbols : NO_SYMBOL_KEYS;
        // aliases `keys` when there are no symbols, so a string-only shape keeps one array
        const allKeys = symbolKeys.length ? [...keys, ...symbolKeys] : keys;
        for (const k of allKeys) {
            if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
                throw new Error(`Invalid element at key "${String(k)}": expected a Zod schema`);
            }
        }
        const okeys = optionalKeys(def.shape);
        return {
            ...def,
            allKeys,
            symbolKeys,
            // string-only: handleCatchall matches it against `for...in`, which never yields a symbol
            keySet: new Set(keys),
            numKeys: keys.length,
            optionalKeys: new Set(okeys),
        };
    }
    function handleCatchall(proms, input, payload, ctx, def, inst, abortEarly) {
        const unrecognized = [];
        const keySet = def.keySet;
        const _catchall = def.catchall._zod;
        const t = _catchall.def.type;
        const optin = _catchall.optin;
        const optout = _catchall.optout;
        // starts at 0, not the current length: the shape phase already ran and may have aborted
        let seen = 0;
        for (const key in input) {
            if (abortEarly && payload.issues.length !== seen) {
                if (aborted(payload, seen))
                    break;
                seen = payload.issues.length;
            }
            // Must precede the __proto__ branch: a declared key is not unrecognized, even though the shape loop deliberately strips __proto__ from the parsed output.
            if (keySet.has(key))
                continue;
            // Don't copy an undeclared __proto__ into the result; assignment to a plain {} would replace the result prototype. But in strict mode it is still an unknown key, so report it before skipping.
            if (key === "__proto__") {
                if (t === "never")
                    unrecognized.push(key);
                continue;
            }
            if (t === "never") {
                unrecognized.push(key);
                continue;
            }
            const r = _catchall.run({ value: input[key], issues: [] }, ctx);
            if (r instanceof Promise) {
                proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
            }
            else {
                handlePropertyResult(r, payload, key, input, optin, optout);
            }
        }
        if (unrecognized.length) {
            payload.issues.push({
                code: "unrecognized_keys",
                keys: unrecognized,
                input,
                inst,
                // Describes the shape of the input, not the validity of the parsed value, so it never aborts. The parse still fails; the schema's own checks just get to run first, and an enclosing intersection can reconcile the key against a sibling operand.
                continue: true,
            });
        }
        if (!proms.length)
            return payload;
        return Promise.all(proms).then(() => {
            return payload;
        });
    }
    const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
        // requires cast because technically $ZodObject doesn't extend
        $ZodType.init(inst, def);
        const desc = Object.getOwnPropertyDescriptor(def, "shape");
        // a cloned def carries its source's accessor, which knows the shape it answers from; adopting that keeps the clone's keys readable without running it
        const sh = desc?.get ? desc.get.raw : (def.shape ?? {});
        if (sh) {
            // Freezes the shape on first read, so its getters resolve once and every later read sees the same schemas.
            const get = () => {
                const newSh = { ...sh };
                Object.defineProperty(def, "shape", { value: newSh });
                get.raw = newSh;
                return newSh;
            };
            get.raw = sh;
            Object.defineProperty(def, "shape", { get });
        }
        const _normalized = cached(() => normalizeDef(def));
        defineLazyInternal(inst, "propValues", (zod) => {
            const shape = zod.def.shape;
            const propValues = {};
            for (const key in shape) {
                const field = shape[key]._zod;
                if (field.values) {
                    if (!Object.prototype.hasOwnProperty.call(propValues, key)) {
                        assignProp(propValues, key, new Set());
                    }
                    for (const v of field.values)
                        propValues[key].add(v);
                    // An omittable slot reads back as undefined at a discriminator lookup, so it has to claim undefined: two options that can both omit the key are not discriminable on it.
                    if (field.optin !== undefined)
                        propValues[key].add(undefined);
                }
            }
            return propValues;
        });
        const isObject$1 = isObject;
        const catchall = def.catchall;
        let value;
        const memo = globalConfig.memoizer;
        memo?.attach(inst);
        inst._zod.parse = (payload, ctx) => {
            value ?? (value = _normalized.value);
            const input = payload.value;
            if (!isObject$1(input)) {
                payload.issues.push({
                    expected: "object",
                    code: "invalid_type",
                    input,
                    inst,
                });
                return payload;
            }
            payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
            const proms = [];
            const shape = value.shape;
            const abortEarly = ctx?.abortEarly;
            let seen = payload.issues.length;
            for (const key of value.allKeys) {
                if (abortEarly && payload.issues.length !== seen) {
                    if (aborted(payload, seen))
                        break;
                    seen = payload.issues.length;
                }
                if (key === "__proto__")
                    continue;
                const el = shape[key];
                const optin = el._zod.optin;
                const optout = el._zod.optout;
                const r = el._zod.run({ value: input[key], issues: [] }, ctx);
                if (r instanceof Promise) {
                    proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
                }
                else {
                    handlePropertyResult(r, payload, key, input, optin, optout);
                }
            }
            if (!catchall) {
                return proms.length ? Promise.all(proms).then(() => payload) : payload;
            }
            return handleCatchall(proms, input, payload, ctx, _normalized.value, inst, abortEarly === true);
        };
    });
    const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
        // requires cast because technically $ZodObject doesn't extend
        $ZodObject.init(inst, def);
        const superParse = inst._zod.parse;
        const _normalized = cached(() => normalizeDef(def));
        const memo = globalConfig.memoizer;
        const generateFastpass = (shape) => {
            const normalized = _normalized.value;
            const syms = normalized.symbolKeys;
            // a symbol has no source literal, so it is read as `syms[i]` off the closed-over scope
            const doc = new Doc(["payload", "ctx"], { shape, inst, memo, syms });
            const parseStr = (k) => `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
            // prefixes in place, like util.prefixIssues. newResult must land before the early return: a catchall runs after this and would otherwise write onto the caller's input
            const prefixStr = (id, k) => `
          let ${id}_ab = false;
          for (let i = 0; i < ${id}.issues.length; i++) {
            const iss = ${id}.issues[i];
            iss.path = iss.path ? [${k}, ...iss.path] : [${k}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${id}_ab = true;
          }
          if (${id}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
            doc.write(`const input = payload.value;`);
            const ids = Object.create(null);
            let counter = 0;
            for (const key of normalized.allKeys) {
                ids[key] = `key_${counter++}`;
            }
            // A: preserve key order {
            doc.write(memo ? `const newResult = memo.alloc(inst, payload, {}, ctx);` : `const newResult = {};`);
            for (const key of normalized.allKeys) {
                if (key === "__proto__")
                    continue;
                const id = ids[key];
                const k = typeof key === "symbol" ? `syms[${syms.indexOf(key)}]` : esc(key);
                const isPresent = `${k} in input`;
                const schema = shape[key];
                const optin = schema?._zod?.optin;
                const isOptionalIn = optin !== undefined;
                const isOptionalOut = schema?._zod?.optout === "optional";
                doc.write(`const ${id} = ${parseStr(k)};`);
                if (isOptionalIn && isOptionalOut) {
                    // For optional-in/out schemas, ignore errors on absent keys — and, like the interpreted path, drop the value produced alongside them. The middle rung goes further: it permits absence without supplying anything in its place, so an absent key contributes nothing at all.
                    const assign = optin === "optional" ? `${id}_present` : `${id}.value !== undefined || ${id}_present`;
                    doc.write(`
        const ${id}_present = ${isPresent};
        if (!${id}.issues.length || ${id}_present) {
          if (${id}.issues.length) {${prefixStr(id, k)}
          }

          if (${assign}) {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
                }
                else if (!isOptionalIn) {
                    doc.write(`
        const ${id}_present = ${isPresent};
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${id}_present) {
          newResult[${k}] = ${id}.value;
        }

      `);
                }
                else {
                    doc.write(`
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
      `);
                    if (optin === "defaulted") {
                        doc.write(`newResult[${k}] = ${id}.value;`);
                    }
                    else {
                        doc.write(`
        if (${id}.value !== undefined || ${isPresent}) {
          newResult[${k}] = ${id}.value;
        }
      `);
                    }
                }
            }
            doc.write(`payload.value = newResult;`);
            doc.write(`return payload;`);
            // closing `shape` in is what pays: turbofan specializes the parser against that one shape object, so every `shape[k]._zod.run` folds to a known callee. as a parameter it stays a generic load and measures 13% slower even with the forwarding frame gone
            return doc.compile();
        };
        let fastpass;
        const isObject$1 = isObject;
        const jit = !globalConfig.jitless;
        const allowsEval$1 = allowsEval;
        const fastEnabled = jit && allowsEval$1.value; // && !def.catchall;
        const catchall = def.catchall;
        let value;
        inst._zod.parse = (payload, ctx) => {
            value ?? (value = _normalized.value);
            const input = payload.value;
            if (!isObject$1(input)) {
                payload.issues.push({
                    expected: "object",
                    code: "invalid_type",
                    input,
                    inst,
                });
                return payload;
            }
            if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
                // always synchronous
                if (!fastpass)
                    fastpass = generateFastpass(def.shape);
                payload = fastpass(payload, ctx);
                if (!catchall)
                    return payload;
                return handleCatchall([], input, payload, ctx, value, inst, ctx?.abortEarly === true);
            }
            return superParse(payload, ctx);
        };
    });
    function handleUnionResults(results, final, inst, ctx) {
        for (const result of results) {
            if (result.issues.length === 0) {
                final.value = result.value;
                return final;
            }
        }
        const nonaborted = results.filter((r) => !aborted(r));
        if (nonaborted.length === 1) {
            final.value = nonaborted[0].value;
            return nonaborted[0];
        }
        final.issues.push({
            code: "invalid_union",
            input: final.value,
            inst,
            errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config()))),
        });
        return final;
    }
    const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
        $ZodType.init(inst, def);
        defineLazyInternal(inst, "optin", (zod) => zod.def.options.some((o) => o._zod.optin === "defaulted")
            ? "defaulted"
            : zod.def.options.some((o) => o._zod.optin !== undefined)
                ? "optional"
                : undefined);
        defineLazyInternal(inst, "optout", (zod) => zod.def.options.some((o) => o._zod.optout === "optional") ? "optional" : undefined);
        defineLazyInternal(inst, "values", (zod) => {
            if (zod.def.options.every((o) => o._zod.values)) {
                return new Set(zod.def.options.flatMap((option) => Array.from(option._zod.values)));
            }
            return undefined;
        });
        defineLazyInternal(inst, "pattern", (zod) => {
            if (zod.def.options.every((o) => o._zod.pattern)) {
                const patterns = zod.def.options.map((o) => o._zod.pattern);
                return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
            }
            return undefined;
        });
        const first = def.options.length === 1 ? def.options[0]._zod.run : null;
        inst._zod.parse = (payload, ctx) => {
            if (first) {
                return first(payload, ctx);
            }
            let async = false;
            const results = [];
            for (const option of def.options) {
                const result = option._zod.run({
                    value: payload.value,
                    issues: [],
                }, ctx);
                if (result instanceof Promise) {
                    results.push(result);
                    async = true;
                }
                else {
                    if (result.issues.length === 0)
                        return result;
                    results.push(result);
                }
            }
            if (!async)
                return handleUnionResults(results, payload, inst, ctx);
            return Promise.all(results).then((results) => {
                return handleUnionResults(results, payload, inst, ctx);
            });
        };
    });
    function handleExclusiveUnionResults(results, final, inst, ctx) {
        const matches = [];
        for (let i = 0; i < results.length; i++) {
            if (results[i].issues.length === 0)
                matches.push(i);
        }
        if (matches.length === 1) {
            final.value = results[matches[0]].value;
            return final;
        }
        if (matches.length === 0) {
            // No matches - same as regular union
            final.issues.push({
                code: "invalid_union",
                input: final.value,
                inst,
                errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config()))),
            });
        }
        else {
            // Multiple matches - exclusive union failure
            final.issues.push({
                code: "invalid_union",
                input: final.value,
                inst,
                errors: [],
                inclusive: false,
                matches,
            });
        }
        return final;
    }
    const $ZodXor = /*@__PURE__*/ $constructor("$ZodXor", (inst, def) => {
        $ZodUnion.init(inst, def);
        def.inclusive = false;
        const first = def.options.length === 1 ? def.options[0]._zod.run : null;
        inst._zod.parse = (payload, ctx) => {
            if (first) {
                return first(payload, ctx);
            }
            let async = false;
            const results = [];
            for (const option of def.options) {
                const result = option._zod.run({
                    value: payload.value,
                    issues: [],
                }, ctx);
                if (result instanceof Promise) {
                    results.push(result);
                    async = true;
                }
                else {
                    results.push(result);
                }
            }
            if (!async)
                return handleExclusiveUnionResults(results, payload, inst, ctx);
            return Promise.all(results).then((results) => {
                return handleExclusiveUnionResults(results, payload, inst, ctx);
            });
        };
    });
    /** Returns the option whose discriminator claims `value`, or throws if ambiguous. */
    function getDiscriminatedOption(union, value) {
        const internals = union._zod;
        let map = internals.bag.optionsMap;
        if (!map) {
            map = discriminatorMap(internals.def);
            internals.bag.optionsMap = map;
        }
        const option = map.get(value);
        if (option === null)
            throw new Error(`Ambiguous discriminator value "${String(value)}"`);
        return option;
    }
    function discriminatorMap(def) {
        const map = new Map();
        for (const option of def.options) {
            const values = option._zod.propValues?.[def.discriminator];
            if (!values || values.size === 0)
                throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
            for (const value of values) {
                if (map.has(value)) {
                    if (value !== undefined)
                        throw new Error(`Duplicate discriminator value "${String(value)}"`);
                    // keep the collision marked so a later member cannot reclaim it
                    map.set(value, null);
                }
                else {
                    map.set(value, option);
                }
            }
        }
        return map;
    }
    const $ZodDiscriminatedUnion =
    /*@__PURE__*/
    $constructor("$ZodDiscriminatedUnion", (inst, def) => {
        def.inclusive = false;
        $ZodUnion.init(inst, def);
        const _super = inst._zod.parse;
        defineLazyInternal(inst, "propValues", (zod) => {
            const propValues = {};
            let undefinedCount = 0;
            for (const option of zod.def.options) {
                const pv = option._zod.propValues;
                if (!pv || Object.keys(pv).length === 0)
                    throw new Error(`Invalid discriminated union option at index "${zod.def.options.indexOf(option)}"`);
                if (pv[zod.def.discriminator]?.has(undefined))
                    undefinedCount++;
                for (const [k, v] of Object.entries(pv)) {
                    if (!Object.prototype.hasOwnProperty.call(propValues, k)) {
                        assignProp(propValues, k, new Set());
                    }
                    for (const val of v) {
                        propValues[k].add(val);
                    }
                }
            }
            if (!zod.def.unionFallback && undefinedCount > 1)
                propValues[zod.def.discriminator]?.delete(undefined);
            return propValues;
        });
        // Checked now rather than in the lookup map below, so an option that lacks the discriminator fails at the `discriminatedUnion` call instead of on the first object parsed. Options whose shape cannot be enumerated without resolving it — pipes and lazies — are left to the map.
        def.options.forEach((option, i) => {
            const propShape = rawShape(option._zod.def);
            if (propShape && !Object.prototype.hasOwnProperty.call(propShape, def.discriminator)) {
                throw new Error(`Invalid discriminated union option at index "${i}"`);
            }
        });
        const disc = cached(() => discriminatorMap(def));
        inst._zod.parse = (payload, ctx) => {
            const input = payload.value;
            if (!isObject(input)) {
                payload.issues.push({
                    code: "invalid_type",
                    expected: "object",
                    input,
                    inst,
                });
                return payload;
            }
            const value = input?.[def.discriminator];
            const opt = disc.value.get(value);
            // forward metadata cannot choose an encoder for an absent tag
            if (opt && (value !== undefined || ctx.direction !== "backward")) {
                return opt._zod.run(payload, ctx);
            }
            // Fall back to union matching when the fast discriminator path fails:
            // - explicitly enabled via unionFallback, or
            // - during backward direction (encode), since codec-based discriminators have different values in forward vs backward directions
            if (def.unionFallback || ctx.direction === "backward") {
                return _super(payload, ctx);
            }
            // no matching discriminator
            payload.issues.push({
                code: "invalid_union",
                errors: [],
                note: "No matching discriminator",
                discriminator: def.discriminator,
                options: Array.from(disc.value.keys()).filter((value) => disc.value.get(value) !== null),
                input,
                path: [def.discriminator],
                inst,
            });
            return payload;
        };
    });
    const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.parse = (payload, ctx) => {
            const input = payload.value;
            const left = def.left._zod.run({ value: input, issues: [] }, ctx);
            const right = def.right._zod.run({ value: input, issues: [] }, ctx);
            const async = left instanceof Promise || right instanceof Promise;
            if (async) {
                return Promise.all([left, right]).then(([left, right]) => {
                    return handleIntersectionResults(payload, left, right);
                });
            }
            return handleIntersectionResults(payload, left, right);
        };
    });
    function mergeValues(a, b) {
        // const aType = parse.t(a);
        // const bType = parse.t(b);
        if (a === b) {
            return { valid: true, data: a };
        }
        if (a instanceof Date && b instanceof Date && +a === +b) {
            return { valid: true, data: a };
        }
        if (isPlainObject(a) && isPlainObject(b)) {
            const bKeys = Object.keys(b);
            const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
            const newObj = { ...a, ...b };
            if (Object.prototype.hasOwnProperty.call(newObj, "__proto__"))
                delete newObj.__proto__;
            for (const key of sharedKeys) {
                if (key === "__proto__")
                    continue;
                const sharedValue = mergeValues(a[key], b[key]);
                if (!sharedValue.valid) {
                    return {
                        valid: false,
                        mergeErrorPath: [key, ...sharedValue.mergeErrorPath],
                    };
                }
                newObj[key] = sharedValue.data;
            }
            return { valid: true, data: newObj };
        }
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) {
                return { valid: false, mergeErrorPath: [] };
            }
            const newArray = [];
            for (let index = 0; index < a.length; index++) {
                const itemA = a[index];
                const itemB = b[index];
                const sharedValue = mergeValues(itemA, itemB);
                if (!sharedValue.valid) {
                    return {
                        valid: false,
                        mergeErrorPath: [index, ...sharedValue.mergeErrorPath],
                    };
                }
                newArray.push(sharedValue.data);
            }
            return { valid: true, data: newArray };
        }
        return { valid: false, mergeErrorPath: [] };
    }
    function handleIntersectionResults(result, left, right) {
        // Track which side(s) reject each key. A key rejection is reported only when BOTH sides reject it, so a key owned by one branch survives the other's key schema. strictObject reports these as unrecognized_keys; a record with an open key schema reports one invalid_key per key.
        const unrecKeys = new Map();
        let unrecIssue;
        const keyIssues = new Map();
        const collect = (iss, side) => {
            let keys;
            if (iss.code === "unrecognized_keys" && !iss.path?.length) {
                unrecIssue ?? (unrecIssue = iss);
                keys = iss.keys;
            }
            else if (iss.code === "invalid_key" && iss.origin === "record" && iss.path?.length === 1) {
                const k = String(iss.path[0]);
                if (!keyIssues.has(k))
                    keyIssues.set(k, iss);
                keys = [k];
            }
            else {
                return false;
            }
            for (const k of keys) {
                if (!unrecKeys.has(k))
                    unrecKeys.set(k, {});
                unrecKeys.get(k)[side] = true;
            }
            return true;
        };
        for (const iss of left.issues) {
            if (!collect(iss, "l"))
                result.issues.push(iss);
        }
        for (const iss of right.issues) {
            if (!collect(iss, "r"))
                result.issues.push(iss);
        }
        // Report only keys rejected by BOTH sides
        const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
        if (bothKeys.length) {
            const aggregated = unrecIssue ? bothKeys.filter((k) => unrecIssue.keys.includes(k)) : [];
            if (aggregated.length)
                result.issues.push({ ...unrecIssue, keys: aggregated });
            for (const k of bothKeys) {
                if (!aggregated.includes(k) && keyIssues.has(k))
                    result.issues.push(keyIssues.get(k));
            }
        }
        const merged = mergeValues(left.value, right.value);
        if (!merged.valid) {
            if (aborted(result))
                return result;
            throw new Error(`Unmergable intersection. Error path: ` + `${JSON.stringify(merged.mergeErrorPath)}`);
        }
        result.value = merged.data;
        return result;
    }
    const $ZodTuple = /*@__PURE__*/ $constructor("$ZodTuple", (inst, def) => {
        $ZodType.init(inst, def);
        const items = def.items;
        const memo = globalConfig.memoizer;
        memo?.attach(inst);
        inst._zod.parse = (payload, ctx) => {
            const input = payload.value;
            if (!Array.isArray(input)) {
                payload.issues.push({
                    input,
                    inst,
                    expected: "tuple",
                    code: "invalid_type",
                });
                return payload;
            }
            payload.value = memo ? memo.alloc(inst, payload, [], ctx) : [];
            const proms = [];
            const optinStart = getTupleOptStart$1(items, "optin");
            const optoutStart = getTupleOptStart$1(items, "optout");
            if (!def.rest) {
                if (input.length < optinStart) {
                    payload.issues.push({
                        code: "too_small",
                        minimum: optinStart,
                        inclusive: true,
                        input,
                        inst,
                        origin: "array",
                    });
                    return payload;
                }
                if (input.length > items.length) {
                    payload.issues.push({
                        code: "too_big",
                        maximum: items.length,
                        inclusive: true,
                        input,
                        inst,
                        origin: "array",
                    });
                }
            }
            // Run every item in parallel, collecting results into an indexed array. The post-processing in `handleTupleResults` walks them in order so it can decide whether an absent optional-output error can truncate the tail or must be reported to preserve required output.
            const itemResults = new Array(items.length);
            // only tracked when there is a rest loop to skip
            const abortEarly = def.rest ? ctx?.abortEarly : undefined;
            let itemAborted = false;
            for (let i = 0; i < items.length; i++) {
                const r = items[i]._zod.run({ value: input[i], issues: [] }, ctx);
                if (r instanceof Promise) {
                    proms.push(r.then((rr) => {
                        itemResults[i] = rr;
                    }));
                }
                else {
                    itemResults[i] = r;
                    if (abortEarly && !itemAborted && r.issues.length)
                        itemAborted = aborted(r);
                }
            }
            // sound because rest is non-empty exactly when every fixed index is present, the one case handleTupleResults cannot discard an item's issues
            if (def.rest && !itemAborted) {
                let i = items.length - 1;
                const rest = input.slice(items.length);
                let seen = payload.issues.length;
                for (const el of rest) {
                    if (abortEarly && payload.issues.length !== seen) {
                        if (aborted(payload, seen))
                            break;
                        seen = payload.issues.length;
                    }
                    i++;
                    const result = def.rest._zod.run({ value: el, issues: [] }, ctx);
                    if (result instanceof Promise) {
                        proms.push(result.then((r) => handleTupleResult(r, payload, i)));
                    }
                    else {
                        handleTupleResult(result, payload, i);
                    }
                }
            }
            if (proms.length) {
                return Promise.all(proms).then(() => handleTupleResults(itemResults, payload, items, input, optoutStart));
            }
            return handleTupleResults(itemResults, payload, items, input, optoutStart);
        };
    });
    function getTupleOptStart$1(items, key) {
        for (let i = items.length - 1; i >= 0; i--) {
            // optin is a three-rung ladder so any rung above `undefined` permits an absent slot; optout stays two-valued.
            const omittable = key === "optin" ? items[i]._zod.optin !== undefined : items[i]._zod.optout === "optional";
            if (!omittable)
                return i + 1;
        }
        return 0;
    }
    function handleTupleResult(result, final, index) {
        if (result.issues.length) {
            final.issues.push(...prefixIssues(index, result.issues));
        }
        final.value[index] = result.value;
    }
    function handleTupleResults(itemResults, final, items, input, optoutStart) {
        // Walk results in order. Mirror $ZodObject's swallow-on-absent-optional rule, but only after `optoutStart`: the first index where the output tuple tail can be absent.
        for (let i = 0; i < items.length; i++) {
            const r = itemResults[i];
            const isPresent = i < input.length;
            // The array analog of `handlePropertyResult`'s absent-key early return: the middle rung permits absence without supplying anything in its place, so the tail truncates here instead of materializing whatever the item made of `undefined`.
            if (!isPresent && i >= optoutStart && items[i]._zod.optin === "optional") {
                final.value.length = i;
                break;
            }
            if (r.issues.length) {
                if (!isPresent && i >= optoutStart) {
                    final.value.length = i;
                    break;
                }
                final.issues.push(...prefixIssues(i, r.issues));
            }
            final.value[i] = r.value;
        }
        // Drop trailing slots that produced `undefined` for absent input
        // (the array analog of an absent optional key on an object). The
        // `i >= input.length` floor is critical: an explicit `undefined`
        // *inside* the input must be preserved even when the schema is
        // optional-out (e.g. `z.string().or(z.undefined())` accepting an
        // explicit undefined value).
        for (let i = final.value.length - 1; i >= input.length; i--) {
            if (items[i]._zod.optout === "optional" && final.value[i] === undefined) {
                final.value.length = i;
            }
            else {
                break;
            }
        }
        return final;
    }
    const $ZodRecord = /*@__PURE__*/ $constructor("$ZodRecord", (inst, def) => {
        $ZodType.init(inst, def);
        const memo = globalConfig.memoizer;
        memo?.attach(inst);
        inst._zod.parse = (payload, ctx) => {
            const input = payload.value;
            if (!isPlainObject(input)) {
                payload.issues.push({
                    expected: "record",
                    code: "invalid_type",
                    input,
                    inst,
                });
                return payload;
            }
            // no guard in either loop below: a record's invalid_key aborts but an enclosing intersection can reconcile it, so a stopped loop hides keys the sibling does not own and the intersection then rejects nothing
            const proms = [];
            const values = def.keyType._zod.values;
            if (values && !def.partial) {
                payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
                const recordKeys = new Set();
                for (const key of values) {
                    if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
                        recordKeys.add(typeof key === "number" ? key.toString() : key);
                        // A declared __proto__ is stripped but is not an unrecognized key.
                        if (key === "__proto__")
                            continue;
                        const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
                        if (keyResult instanceof Promise) {
                            throw new Error("Async schemas not supported in object keys currently");
                        }
                        if (keyResult.issues.length) {
                            payload.issues.push({
                                code: "invalid_key",
                                origin: "record",
                                issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                                input: key,
                                path: [key],
                                inst,
                            });
                            continue;
                        }
                        const outKey = keyResult.value;
                        if (outKey === "__proto__")
                            continue;
                        const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
                        if (result instanceof Promise) {
                            proms.push(result.then((result) => {
                                if (result.issues.length) {
                                    payload.issues.push(...prefixIssues(key, result.issues));
                                }
                                payload.value[outKey] = result.value;
                            }));
                        }
                        else {
                            if (result.issues.length) {
                                payload.issues.push(...prefixIssues(key, result.issues));
                            }
                            payload.value[outKey] = result.value;
                        }
                    }
                }
                let unrecognized;
                for (const key in input) {
                    if (!recordKeys.has(key)) {
                        if (def.mode === "loose") {
                            // skip __proto__ so it can't replace the result prototype via the assignment setter on the plain {} we build into
                            if (key === "__proto__")
                                continue;
                            payload.value[key] = input[key];
                        }
                        else {
                            unrecognized = unrecognized ?? [];
                            unrecognized.push(key);
                        }
                    }
                }
                if (unrecognized && unrecognized.length > 0) {
                    payload.issues.push({
                        code: "unrecognized_keys",
                        input,
                        inst,
                        keys: unrecognized,
                        continue: true,
                    });
                }
            }
            else {
                payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
                // An enumerable key schema declares which keys the record owns, so a key outside the set is unrecognized. A non-enumerable one (regex, refine) is a constraint every key must satisfy, so a failing key is invalid. Only the former is reconcilable against the other side of an intersection.
                let unrecognized;
                // Reflect.ownKeys for Symbol-key support; filter non-enumerable to match z.object()
                for (const key of Reflect.ownKeys(input)) {
                    if (key === "__proto__")
                        continue;
                    if (!Object.prototype.propertyIsEnumerable.call(input, key))
                        continue;
                    let keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
                    if (keyResult instanceof Promise) {
                        throw new Error("Async schemas not supported in object keys currently");
                    }
                    // Numeric string fallback: if key is a numeric string and failed, retry with Number(key). This handles z.number(), z.literal([1, 2, 3]), and unions containing numeric literals
                    const checkNumericKey = typeof key === "string" && number$2.test(key) && keyResult.issues.length;
                    if (checkNumericKey) {
                        const retryResult = def.keyType._zod.run({ value: Number(key), issues: [] }, ctx);
                        if (retryResult instanceof Promise) {
                            throw new Error("Async schemas not supported in object keys currently");
                        }
                        if (retryResult.issues.length === 0) {
                            keyResult = retryResult;
                        }
                    }
                    if (keyResult.issues.length) {
                        if (def.mode === "loose") {
                            // Pass through unchanged
                            payload.value[key] = input[key];
                        }
                        else if (values) {
                            unrecognized = unrecognized ?? [];
                            unrecognized.push(key);
                        }
                        else {
                            // Default "strict" behavior: error on invalid key
                            payload.issues.push({
                                code: "invalid_key",
                                origin: "record",
                                issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                                input: key,
                                path: [key],
                                inst,
                            });
                        }
                        continue;
                    }
                    // the guard above tests the raw input key, but the key schema can normalize an ordinary key into __proto__; re-check the key we actually write under
                    const outKey = keyResult.value;
                    if (outKey === "__proto__")
                        continue;
                    const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
                    if (result instanceof Promise) {
                        proms.push(result.then((result) => {
                            if (result.issues.length) {
                                payload.issues.push(...prefixIssues(key, result.issues));
                            }
                            payload.value[outKey] = result.value;
                        }));
                    }
                    else {
                        if (result.issues.length) {
                            payload.issues.push(...prefixIssues(key, result.issues));
                        }
                        payload.value[outKey] = result.value;
                    }
                }
                if (unrecognized && unrecognized.length > 0) {
                    payload.issues.push({
                        code: "unrecognized_keys",
                        input,
                        inst,
                        keys: unrecognized,
                        continue: true,
                    });
                }
            }
            if (proms.length) {
                return Promise.all(proms).then(() => payload);
            }
            return payload;
        };
    });
    const $ZodMap = /*@__PURE__*/ $constructor("$ZodMap", (inst, def) => {
        $ZodType.init(inst, def);
        const memo = globalConfig.memoizer;
        memo?.attach(inst);
        inst._zod.parse = (payload, ctx) => {
            const input = payload.value;
            if (!(input instanceof Map)) {
                payload.issues.push({
                    expected: "map",
                    code: "invalid_type",
                    input,
                    inst,
                });
                return payload;
            }
            const proms = [];
            payload.value = memo ? memo.alloc(inst, payload, new Map(), ctx) : new Map();
            const abortEarly = ctx?.abortEarly;
            let seen = payload.issues.length;
            for (const [key, value] of input) {
                if (abortEarly && payload.issues.length !== seen) {
                    if (aborted(payload, seen))
                        break;
                    seen = payload.issues.length;
                }
                const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
                const valueResult = def.valueType._zod.run({ value: value, issues: [] }, ctx);
                if (keyResult instanceof Promise || valueResult instanceof Promise) {
                    proms.push(Promise.all([keyResult, valueResult]).then(([keyResult, valueResult]) => {
                        handleMapResult(keyResult, valueResult, payload, key, input, inst, ctx);
                    }));
                }
                else {
                    handleMapResult(keyResult, valueResult, payload, key, input, inst, ctx);
                }
            }
            if (proms.length)
                return Promise.all(proms).then(() => payload);
            return payload;
        };
        capSize(inst, mapSize);
    });
    function handleMapResult(keyResult, valueResult, final, key, input, inst, ctx) {
        if (keyResult.issues.length) {
            if (propertyKeyTypes.has(typeof key)) {
                final.issues.push(...prefixIssues(key, keyResult.issues));
            }
            else {
                final.issues.push({
                    code: "invalid_key",
                    origin: "map",
                    input,
                    inst,
                    issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                });
            }
        }
        if (valueResult.issues.length) {
            if (propertyKeyTypes.has(typeof key)) {
                final.issues.push(...prefixIssues(key, valueResult.issues));
            }
            else {
                final.issues.push({
                    origin: "map",
                    code: "invalid_element",
                    input,
                    inst,
                    key: key,
                    issues: valueResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                });
            }
        }
        final.value.set(keyResult.value, valueResult.value);
    }
    const $ZodSet = /*@__PURE__*/ $constructor("$ZodSet", (inst, def) => {
        $ZodType.init(inst, def);
        const memo = globalConfig.memoizer;
        memo?.attach(inst);
        inst._zod.parse = (payload, ctx) => {
            const input = payload.value;
            if (!(input instanceof Set)) {
                payload.issues.push({
                    input,
                    inst,
                    expected: "set",
                    code: "invalid_type",
                });
                return payload;
            }
            const proms = [];
            payload.value = memo ? memo.alloc(inst, payload, new Set(), ctx) : new Set();
            const abortEarly = ctx?.abortEarly;
            let seen = payload.issues.length;
            for (const item of input) {
                if (abortEarly && payload.issues.length !== seen) {
                    if (aborted(payload, seen))
                        break;
                    seen = payload.issues.length;
                }
                const result = def.valueType._zod.run({ value: item, issues: [] }, ctx);
                if (result instanceof Promise) {
                    proms.push(result.then((result) => handleSetResult(result, payload)));
                }
                else
                    handleSetResult(result, payload);
            }
            if (proms.length)
                return Promise.all(proms).then(() => payload);
            return payload;
        };
        capSize(inst, setSize);
    });
    function handleSetResult(result, final) {
        if (result.issues.length) {
            final.issues.push(...result.issues);
        }
        final.value.add(result.value);
    }
    const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
        $ZodType.init(inst, def);
        const values = getEnumValues(def.entries);
        const valuesSet = new Set(values);
        inst._zod.values = valuesSet;
        defineLazyInternal(inst, "pattern", (zod) => {
            const patternValues = getEnumValues(zod.def.entries).filter((k) => propertyKeyTypes.has(typeof k));
            // unmatchable fallback, RE2-safe: an empty alternation would compile to /^()$/, which matches ""
            return new RegExp(patternValues.length ? `^(${patternValues.map((o) => escapeRegex(o.toString())).join("|")})$` : "^[^\\s\\S]$");
        });
        inst._zod.parse = (payload, _ctx) => {
            const input = payload.value;
            if (valuesSet.has(input)) {
                return payload;
            }
            payload.issues.push({
                code: "invalid_value",
                values,
                input,
                inst,
            });
            return payload;
        };
    });
    const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
        $ZodType.init(inst, def);
        const values = new Set(def.values);
        inst._zod.values = values;
        defineLazyInternal(inst, "pattern", (zod) => {
            const vals = zod.def.values;
            // unmatchable fallback, RE2-safe: an empty alternation would compile to /^()$/, which matches ""
            return new RegExp(vals.length
                ? `^(${vals
                .map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o))
                .join("|")})$`
                : "^[^\\s\\S]$");
        });
        inst._zod.parse = (payload, _ctx) => {
            const input = payload.value;
            if (values.has(input)) {
                return payload;
            }
            payload.issues.push({
                code: "invalid_value",
                values: def.values,
                input,
                inst,
            });
            return payload;
        };
    });
    const $ZodFile = /*@__PURE__*/ $constructor("$ZodFile", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.parse = (payload, _ctx) => {
            const input = payload.value;
            // @ts-ignore
            if (input instanceof File)
                return payload;
            payload.issues.push({
                expected: "file",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        };
    });
    const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.optin = "optional";
        globalConfig.memoizer?.guard(inst);
        inst._zod.parse = (payload, ctx) => {
            if (ctx.direction === "backward") {
                throw new $ZodEncodeError(inst.constructor.name);
            }
            const _out = def.transform(payload.value, payload);
            if (ctx.async) {
                const output = _out instanceof Promise ? _out : Promise.resolve(_out);
                return output.then((output) => {
                    payload.value = output;
                    return payload;
                });
            }
            if (_out instanceof Promise) {
                throw new $ZodAsyncError();
            }
            payload.value = _out;
            return payload;
        };
    });
    function handleOptionalResult(payload, result) {
        // A substituting schema that still failed has no usable answer; yield undefined. Its issues are simply dropped: it ran on a payload of its own, so there is no shared array to truncate and nothing of the caller's to lose with it.
        payload.value = result.issues.length ? undefined : result.value;
        return payload;
    }
    const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
        $ZodType.init(inst, def);
        // .optional() propagates absence rather than substituting for it, so a defaulted inner keeps its rung.
        defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
        inst._zod.optout = "optional";
        defineLazyInternal(inst, "values", (zod) => {
            const values = zod.def.innerType._zod.values;
            return values ? new Set([...values, undefined]) : undefined;
        });
        defineLazyInternal(inst, "pattern", (zod) => {
            const pattern = zod.def.innerType._zod.pattern;
            return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : undefined;
        });
        inst._zod.parse = (payload, ctx) => {
            if (payload.value === undefined) {
                // Only the top rung substitutes a value for absence; everything else leaves it intact, which is what .optional() means.
                if (def.innerType._zod.optin !== "defaulted")
                    return payload;
                // Its own payload, for the same reason $ZodCatch gets one: a pipe forwards an unrecognized key through the caller's issues array, and this must not read that as the substituting schema failing and drop it.
                const result = def.innerType._zod.run({ value: payload.value, issues: [] }, ctx);
                if (result instanceof Promise)
                    return result.then((result) => handleOptionalResult(payload, result));
                return handleOptionalResult(payload, result);
            }
            return def.innerType._zod.run(payload, ctx);
        };
    });
    const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
        // Call parent init - inherits optin/optout = "optional"
        $ZodOptional.init(inst, def);
        // Override values/pattern to NOT add undefined
        defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
        defineLazyInternal(inst, "pattern", (zod) => zod.def.innerType._zod.pattern);
        // Override parse to just delegate (no undefined handling)
        inst._zod.parse = (payload, ctx) => {
            return def.innerType._zod.run(payload, ctx);
        };
    });
    const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
        $ZodType.init(inst, def);
        defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin);
        defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
        defineLazyInternal(inst, "pattern", (zod) => {
            const pattern = zod.def.innerType._zod.pattern;
            return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : undefined;
        });
        defineLazyInternal(inst, "values", (zod) => {
            return zod.def.innerType._zod.values ? new Set([...zod.def.innerType._zod.values, null]) : undefined;
        });
        inst._zod.parse = (payload, ctx) => {
            // Forward direction (decode): allow null to pass through
            if (payload.value === null)
                return payload;
            return def.innerType._zod.run(payload, ctx);
        };
    });
    const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
        $ZodType.init(inst, def);
        // inst._zod.qin = "true";
        inst._zod.optin = "defaulted";
        defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
        inst._zod.parse = (payload, ctx) => {
            if (ctx.direction === "backward") {
                return def.innerType._zod.run(payload, ctx);
            }
            // Forward direction (decode): apply defaults for undefined input
            if (payload.value === undefined) {
                payload.value = def.defaultValue;
                /**
                 * $ZodDefault returns the default value immediately in forward direction.
                 * It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
                return payload;
            }
            // Forward direction: continue with default handling
            const result = def.innerType._zod.run(payload, ctx);
            if (result instanceof Promise) {
                return result.then((result) => handleDefaultResult(result, def));
            }
            return handleDefaultResult(result, def);
        };
    });
    function handleDefaultResult(payload, def) {
        if (payload.value === undefined) {
            payload.value = def.defaultValue;
        }
        return payload;
    }
    const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.optin = "defaulted";
        defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
        inst._zod.parse = (payload, ctx) => {
            if (ctx.direction === "backward") {
                return def.innerType._zod.run(payload, ctx);
            }
            // Forward direction (decode): apply prefault for undefined input
            if (payload.value === undefined) {
                payload.value = def.defaultValue;
            }
            return def.innerType._zod.run(payload, ctx);
        };
    });
    const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
        $ZodType.init(inst, def);
        defineLazyInternal(inst, "values", (zod) => {
            const v = zod.def.innerType._zod.values;
            return v ? new Set([...v].filter((x) => x !== undefined)) : undefined;
        });
        inst._zod.parse = (payload, ctx) => {
            const result = def.innerType._zod.run(payload, ctx);
            if (result instanceof Promise) {
                return result.then((result) => handleNonOptionalResult(result, inst));
            }
            return handleNonOptionalResult(result, inst);
        };
    });
    function handleNonOptionalResult(payload, inst) {
        if (!payload.issues.length && payload.value === undefined) {
            payload.issues.push({
                code: "invalid_type",
                expected: "nonoptional",
                input: payload.value,
                inst,
            });
        }
        return payload;
    }
    const $ZodSuccess = /*@__PURE__*/ $constructor("$ZodSuccess", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.parse = (payload, ctx) => {
            if (ctx.direction === "backward") {
                throw new $ZodEncodeError("ZodSuccess");
            }
            const result = def.innerType._zod.run(payload, ctx);
            if (result instanceof Promise) {
                return result.then((result) => {
                    payload.value = result.issues.length === 0;
                    return payload;
                });
            }
            payload.value = result.issues.length === 0;
            return payload;
        };
    });
    function handleCatchResult(payload, result, def, ctx) {
        if (!result.issues.length) {
            payload.value = result.value;
            // The value carries up, so the flag describing it has to carry with it: a back-edge into a node still being parsed must not be frozen by an enclosing readonly, and its checks belong to the node itself. Guarded so the ordinary case adds no own property.
            if (result.memo)
                payload.memo = true;
            return payload;
        }
        // Spread the inner's own payload, not ours: `value` has to stay the input the catch was handed, and the inner ran on a payload of its own so its issues are already private to this call.
        payload.value = def.catchValue({
            ...result,
            value: payload.value,
            error: {
                issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())),
            },
            input: payload.value,
        });
        return payload;
    }
    const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
        $ZodType.init(inst, def);
        defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
        defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
        defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
        inst._zod.parse = (payload, ctx) => {
            if (ctx.direction === "backward") {
                return def.innerType._zod.run(payload, ctx);
            }
            // Forward direction (decode): apply catch logic
            const result = def.innerType._zod.run({ value: payload.value, issues: [] }, ctx);
            if (result instanceof Promise) {
                return result.then((result) => handleCatchResult(payload, result, def, ctx));
            }
            return handleCatchResult(payload, result, def, ctx);
        };
    });
    const $ZodNaN = /*@__PURE__*/ $constructor("$ZodNaN", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.parse = (payload, _ctx) => {
            if (typeof payload.value !== "number" || !Number.isNaN(payload.value)) {
                payload.issues.push({
                    input: payload.value,
                    inst,
                    expected: "nan",
                    code: "invalid_type",
                });
                return payload;
            }
            return payload;
        };
    });
    const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
        $ZodType.init(inst, def);
        defineLazyInternal(inst, "values", (zod) => zod.def.in._zod.values);
        defineLazyInternal(inst, "optin", (zod) => zod.def.in._zod.optin);
        defineLazyInternal(inst, "optout", (zod) => zod.def.out._zod.optout);
        defineLazyInternal(inst, "propValues", (zod) => zod.def.in._zod.propValues);
        inst._zod.parse = (payload, ctx) => {
            if (ctx.direction === "backward") {
                const right = def.out._zod.run(payload, ctx);
                if (right instanceof Promise) {
                    return right.then((right) => handlePipeResult(right, def.in, ctx));
                }
                return handlePipeResult(right, def.in, ctx);
            }
            const left = def.in._zod.run(payload, ctx);
            if (left instanceof Promise) {
                return left.then((left) => handlePipeResult(left, def.out, ctx));
            }
            return handlePipeResult(left, def.out, ctx);
        };
    });
    function handlePipeResult(left, next, ctx) {
        // Any issue stops the pipe, so a failing refinement never feeds its transform. An unrecognized key is the exception: it describes the input's extra properties, not the value being piped, and an enclosing intersection may yet reconcile it.
        if (left.issues.some((iss) => iss.code !== "unrecognized_keys")) {
            // prevent further checks
            left.aborted = true;
            return left;
        }
        return next._zod.run({ value: left.value, issues: left.issues }, ctx);
    }
    const $ZodCodec = /*@__PURE__*/ $constructor("$ZodCodec", (inst, def) => {
        $ZodType.init(inst, def);
        defineLazyInternal(inst, "values", (zod) => zod.def.in._zod.values);
        defineLazyInternal(inst, "optin", (zod) => zod.def.in._zod.optin);
        defineLazyInternal(inst, "optout", (zod) => zod.def.out._zod.optout);
        defineLazyInternal(inst, "propValues", (zod) => zod.def.in._zod.propValues);
        inst._zod.parse = (payload, ctx) => {
            const direction = ctx.direction || "forward";
            if (direction === "forward") {
                const left = def.in._zod.run(payload, ctx);
                if (left instanceof Promise) {
                    return left.then((left) => handleCodecAResult(left, def, ctx));
                }
                return handleCodecAResult(left, def, ctx);
            }
            else {
                const right = def.out._zod.run(payload, ctx);
                if (right instanceof Promise) {
                    return right.then((right) => handleCodecAResult(right, def, ctx));
                }
                return handleCodecAResult(right, def, ctx);
            }
        };
    });
    function handleCodecAResult(result, def, ctx) {
        if (result.issues.length) {
            // prevent further checks
            result.aborted = true;
            return result;
        }
        const direction = ctx.direction || "forward";
        if (direction === "forward") {
            const transformed = def.transform(result.value, result);
            if (transformed instanceof Promise) {
                return transformed.then((value) => handleCodecTxResult(result, value, def.out, ctx));
            }
            return handleCodecTxResult(result, transformed, def.out, ctx);
        }
        else {
            const transformed = def.reverseTransform(result.value, result);
            if (transformed instanceof Promise) {
                return transformed.then((value) => handleCodecTxResult(result, value, def.in, ctx));
            }
            return handleCodecTxResult(result, transformed, def.in, ctx);
        }
    }
    function handleCodecTxResult(left, value, nextSchema, ctx) {
        // Check if transform added any issues
        if (left.issues.length) {
            left.aborted = true;
            return left;
        }
        return nextSchema._zod.run({ value, issues: left.issues }, ctx);
    }
    const $ZodPreprocess = /*@__PURE__*/ $constructor("$ZodPreprocess", (inst, def) => {
        $ZodPipe.init(inst, def);
    });
    const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
        $ZodType.init(inst, def);
        defineLazyInternal(inst, "propValues", (zod) => zod.def.innerType._zod.propValues);
        defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
        defineLazyInternal(inst, "optin", (zod) => zod.def.innerType?._zod?.optin);
        defineLazyInternal(inst, "optout", (zod) => zod.def.innerType?._zod?.optout);
        inst._zod.parse = (payload, ctx) => {
            if (ctx.direction === "backward") {
                return def.innerType._zod.run(payload, ctx);
            }
            const result = def.innerType._zod.run(payload, ctx);
            if (result instanceof Promise) {
                return result.then(handleReadonlyResult);
            }
            return handleReadonlyResult(result);
        };
    });
    function handleReadonlyResult(payload) {
        // A repeat visit hands back a node that is still being built; freezing it here would make the rest of its keys fail to assign.
        if (!payload.memo)
            payload.value = Object.freeze(payload.value);
        return payload;
    }
    // a leaf's pattern source with its own checks folded in: the last pattern-carrying check wins, else length bounds narrow the catch-all, else an integer format narrows the number form. the fold lives here instead of on `_zod.pattern` so a bundle without template literals never pays for it
    function leafPattern(schema) {
        const def = schema._zod.def;
        let pattern = def.pattern;
        let isInt = !!def.format?.includes("int");
        let minimum;
        let maximum;
        for (const ch of def.checks ?? []) {
            const d = ch._zod.def;
            if (d.pattern)
                pattern = d.pattern;
            isInt || (isInt = !!d.format?.includes("int"));
            const lo = d.minimum ?? d.length;
            const hi = d.maximum ?? d.length;
            if (lo !== undefined && (minimum === undefined || lo > minimum))
                minimum = lo;
            if (hi !== undefined && (maximum === undefined || hi < maximum))
                maximum = hi;
        }
        if (pattern)
            return pattern.source;
        // an empty range matches nothing at runtime, and `{8,5}` is not a legal quantifier
        if (minimum !== undefined && maximum !== undefined && minimum > maximum)
            return "(?!)";
        if (minimum !== undefined || maximum !== undefined)
            return string$2({ minimum, maximum }).source;
        const own = schema._zod.pattern;
        return (isInt && own === number$2 ? integer : own)?.source;
    }
    // a part's pattern source. a wrapper's pattern embeds its inner pattern's source verbatim, so the folded form is substituted in place without knowing the wrapper's own composition; a union's options are joined the way the union builds its own pattern
    function partPattern(schema) {
        const def = schema._zod.def;
        const own = schema._zod.pattern?.source;
        // lazy resolves its inner on the internals, not the def
        const inner = def.innerType ?? schema._zod.innerType;
        if (inner) {
            const before = inner._zod.pattern?.source;
            const after = partPattern(inner);
            if (own && before && after && after !== before) {
                return own.replace(cleanRegex(before), () => cleanRegex(after));
            }
            return own;
        }
        if (def.options) {
            const sources = def.options.map(partPattern);
            if (sources.every(Boolean))
                return `^(${sources.map((s) => cleanRegex(s)).join("|")})$`;
        }
        return leafPattern(schema);
    }
    const $ZodTemplateLiteral = /*@__PURE__*/ $constructor("$ZodTemplateLiteral", (inst, def) => {
        $ZodType.init(inst, def);
        const regexParts = [];
        for (const part of def.parts) {
            if (typeof part === "object" && part !== null) {
                // is Zod schema
                const source = partPattern(part);
                if (!source) {
                    throw new Error(`Invalid template literal part, no pattern found: ${[...part._zod.traits].shift()}`);
                }
                regexParts.push(cleanRegex(source));
            }
            else if (part === null || primitiveTypes.has(typeof part)) {
                regexParts.push(escapeRegex(`${part}`));
            }
            else {
                throw new Error(`Invalid template literal part: ${part}`);
            }
        }
        inst._zod.pattern = new RegExp(`^${regexParts.join("")}$`);
        inst._zod.parse = (payload, _ctx) => {
            if (typeof payload.value !== "string") {
                payload.issues.push({
                    input: payload.value,
                    inst,
                    expected: "string",
                    code: "invalid_type",
                });
                return payload;
            }
            inst._zod.pattern.lastIndex = 0;
            if (!inst._zod.pattern.test(payload.value)) {
                payload.issues.push({
                    input: payload.value,
                    inst,
                    code: "invalid_format",
                    format: def.format ?? "template_literal",
                    pattern: inst._zod.pattern.source,
                });
                return payload;
            }
            return payload;
        };
    });
    const $ZodFunction = /*@__PURE__*/ $constructor("$ZodFunction", (inst, def) => {
        $ZodType.init(inst, def);
        // Defined, not assigned: the classic prototype exposes `_def` as a getter with no setter.
        Object.defineProperty(inst, "_def", { value: def });
        inst._zod.def = def;
        inst.implement = (func) => {
            if (typeof func !== "function") {
                throw new Error("implement() must be called with a function");
            }
            // Defined inline so the closure stays anonymous: binding it to a `const` first names it, which costs 256 bytes per implemented function.
            return Object.defineProperty(function (...args) {
                const parsedArgs = inst._def.input ? parse$1(inst._def.input, args) : args;
                const result = Reflect.apply(func, this, parsedArgs);
                if (inst._def.output) {
                    return parse$1(inst._def.output, result);
                }
                return result;
            }, "_zod", { value: inst._zod, enumerable: false });
        };
        inst.implementAsync = (func) => {
            if (typeof func !== "function") {
                throw new Error("implementAsync() must be called with a function");
            }
            return Object.defineProperty(async function (...args) {
                const parsedArgs = inst._def.input ? await parseAsync$1(inst._def.input, args) : args;
                const result = await Reflect.apply(func, this, parsedArgs);
                if (inst._def.output) {
                    return await parseAsync$1(inst._def.output, result);
                }
                return result;
            }, "_zod", { value: inst._zod, enumerable: false });
        };
        inst._zod.parse = (payload, _ctx) => {
            if (typeof payload.value !== "function") {
                payload.issues.push({
                    code: "invalid_type",
                    expected: "function",
                    input: payload.value,
                    inst,
                });
                return payload;
            }
            // Check if output is a promise type to determine if we should use async implementation
            const hasPromiseOutput = inst._def.output && inst._def.output._zod.def.type === "promise";
            if (hasPromiseOutput) {
                payload.value = inst.implementAsync(payload.value);
            }
            else {
                payload.value = inst.implement(payload.value);
            }
            return payload;
        };
        inst.input = (...args) => {
            const F = inst.constructor;
            if (Array.isArray(args[0])) {
                return new F({
                    type: "function",
                    input: new $ZodTuple({
                        type: "tuple",
                        items: args[0],
                        rest: args[1],
                    }),
                    output: inst._def.output,
                });
            }
            return new F({
                type: "function",
                input: args[0],
                output: inst._def.output,
            });
        };
        inst.output = (output) => {
            const F = inst.constructor;
            return new F({
                type: "function",
                input: inst._def.input,
                output,
            });
        };
        return inst;
    });
    const $ZodPromise = /*@__PURE__*/ $constructor("$ZodPromise", (inst, def) => {
        $ZodType.init(inst, def);
        inst._zod.parse = (payload, ctx) => {
            return Promise.resolve(payload.value).then((inner) => def.innerType._zod.run({ value: inner, issues: [] }, ctx));
        };
    });
    const $ZodLazy = /*@__PURE__*/ $constructor("$ZodLazy", (inst, def) => {
        $ZodType.init(inst, def);
        // Cache the resolved inner type on the shared `def` so all clones of this lazy (e.g. via `.describe()`/`.meta()`) share the same inner instance, preserving identity for cycle detection on recursive schemas.
        defineLazy(inst._zod, "innerType", () => {
            const d = def;
            if (!d._cachedInner)
                d._cachedInner = def.getter();
            return d._cachedInner;
        });
        defineLazyInternal(inst, "pattern", (zod) => zod.innerType?._zod?.pattern);
        defineLazyInternal(inst, "propValues", (zod) => zod.innerType?._zod?.propValues);
        defineLazyInternal(inst, "optin", (zod) => zod.innerType?._zod?.optin ?? undefined);
        defineLazyInternal(inst, "optout", (zod) => zod.innerType?._zod?.optout ?? undefined);
        inst._zod.parse = (payload, ctx) => {
            const inner = inst._zod.innerType;
            return inner._zod.run(payload, ctx);
        };
    });
    const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
        $ZodCheck.init(inst, def);
        $ZodType.init(inst, def);
        inst._zod.parse = (payload, _) => {
            return payload;
        };
        inst._zod.check = (payload) => {
            const input = payload.value;
            const r = def.fn(input);
            if (r instanceof Promise) {
                return r.then((r) => handleRefineResult(r, payload, input, inst));
            }
            handleRefineResult(r, payload, input, inst);
            return;
        };
    });
    function handleRefineResult(result, payload, input, inst) {
        if (!result) {
            const _iss = {
                code: "custom",
                input,
                inst, // incorporates params.error into issue reporting
                path: [...(inst._zod.def.path ?? [])], // incorporates params.error into issue reporting
                continue: !inst._zod.def.abort,
                // params: inst._zod.def.params,
            };
            if (inst._zod.def.params)
                _iss.params = inst._zod.def.params;
            payload.issues.push(issue(_iss));
        }
    }

    class $ZodCyclicError extends Error {
        constructor() {
            super(`Cannot parse a reference cycle that closes through a transform`);
            this.name = "ZodCyclicError";
        }
    }
    /** Keyed off the context object every schema in one parse call already shares. */
    const STATE = "~memo";
    const NO_ISSUES = [];
    // a value a cycle can close through
    function isRef(value) {
        return value !== null && typeof value === "object";
    }
    // Receivers prefix paths in place, so the cache and every hand-out need their own copies.
    function cloneIssues(issues) {
        return issues.map((iss) => (iss.path ? { ...iss, path: iss.path.slice() } : { ...iss }));
    }
    const recursive = /*@__PURE__*/ new WeakMap();
    /** What the walk established, in order of certainty: ordered so the strongest answer among children wins. */
    const NONE = 0;
    const ASSUMED = 1;
    const PROVEN = 2;
    /** Whether this schema's subtree contains a cycle, so one parse can re-enter it. */
    function isRecursive(inst, stack, resolve) {
        const cached = recursive.get(inst);
        if (cached !== undefined)
            return cached ? PROVEN : NONE;
        // Relative to the walk in progress, so not cached.
        if (stack.has(inst))
            return PROVEN;
        stack.add(inst);
        let result = NONE;
        const check = (child) => {
            if (result !== PROVEN && child?._zod) {
                const answer = isRecursive(child, stack, resolve);
                if (answer > result)
                    result = answer;
            }
        };
        // `Reflect.ownKeys` rather than `Object.keys`, so a cycle through a declared symbol key is still seen
        const shape = (sh, spread) => {
            let answer = NONE;
            for (const key of Reflect.ownKeys(sh)) {
                const desc = Object.getOwnPropertyDescriptor(sh, key);
                // an object resolves its shape by spread, so a key it does not enumerate is never parsed; `z.properties` reads every own key and so keeps them all
                if (!desc.enumerable)
                    continue;
                // resolving runs user code, and a factory mints a fresh subtree per read, so an edge the walk can't follow counts as a cycle
                const child = desc.get ? ASSUMED : desc.value?._zod ? isRecursive(desc.value, stack, resolve) : NONE;
                if (child > answer)
                    answer = child;
            }
            return answer;
        };
        const merge = (answer) => {
            if (answer > result)
                result = answer;
        };
        const def = inst._zod.def;
        const kind = def.type;
        switch (kind) {
            case "object": {
                const raw = rawShape(def);
                // a def with no raw shape answers `shape` from an accessor of its own, and running that can mint a whole fresh subtree
                merge(raw ? shape(raw) : ASSUMED);
                check(def.catchall);
                break;
            }
            case "array":
                check(def.element);
                break;
            case "tuple":
                for (const el of def.items)
                    check(el);
                check(def.rest);
                break;
            case "record":
            case "map":
                check(def.keyType);
                check(def.valueType);
                break;
            case "set":
                check(def.valueType);
                break;
            case "union":
                for (const el of def.options)
                    check(el);
                break;
            case "intersection":
                check(def.left);
                check(def.right);
                break;
            case "optional":
            case "nullable":
            case "default":
            case "prefault":
            case "catch":
            case "readonly":
            case "nonoptional":
            case "promise":
            case "success":
                check(def.innerType);
                break;
            case "pipe":
                check(def.in);
                check(def.out);
                break;
            case "function":
                check(def.input);
                check(def.output);
                break;
            // `$ZodLazy` caches its inner on the def, so a resolved edge is followed exactly
            case "lazy": {
                const inner = def._cachedInner ?? (resolve ? inst._zod.innerType : undefined);
                // walked with resolution off: one hop sees past the deferral, and a lazy that yields only another unresolved lazy is generative, so it stops there
                merge(inner ? isRecursive(inner, stack, false) : ASSUMED);
                break;
            }
            // a leaf by choice: `parts` are regex fragments, not data positions
            case "template_literal":
            // leaves
            case "string":
            case "number":
            case "int":
            case "boolean":
            case "bigint":
            case "symbol":
            case "undefined":
            case "null":
            case "void":
            case "never":
            case "any":
            case "unknown":
            case "date":
            case "nan":
            case "enum":
            case "literal":
            case "file":
            case "transform":
            case "custom":
                break;
            default: {
                // a user-defined kind can still hold children, and only its author knows where, so fall back to scanning the def — skipping accessors, since reading one can run user code
                for (const key in def) {
                    const desc = Object.getOwnPropertyDescriptor(def, key);
                    if (!desc || desc.get)
                        continue;
                    const value = desc.value;
                    if (!value || typeof value !== "object")
                        continue;
                    if (value._zod)
                        check(value);
                    else if (Array.isArray(value))
                        for (const el of value)
                            check(el);
                }
            }
        }
        stack.delete(inst);
        return settle(inst, result);
    }
    /** An assumed answer must not outlive the resolution that settles it, so only a certain one is cached. */
    function settle(inst, answer) {
        if (answer !== ASSUMED)
            recursive.set(inst, answer === PROVEN);
        return answer;
    }
    /**
     * Whether one parse can re-enter this schema, i.e. its subtree contains a cycle.
     * Exported for `z.compile`, which refuses to compile such a schema: cycle
     * breaking is driven from here off state keyed on the parse context, and a
     * generated fast path has no context to key on.
     */
    function isRecursiveSchema(inst) {
        // z.compile never parses, so nothing would ever resolve a lazy for it; it runs once and already treats a throw here as recursive
        return isRecursive(inst, new Set(), true) !== NONE;
    }
    function bucketFor(state, inst) {
        let bucket = state.buckets.get(inst);
        if (!bucket) {
            bucket = new WeakMap();
            state.buckets.set(inst, bucket);
        }
        return bucket;
    }
    // Set immediately before delegating to core and cleared immediately after, so `alloc` registers only for a visit this module is driving.
    let handoff;
    // Allocated but unfinished entries. `alloc` and the matching pop both happen in the synchronous part of a parse, so they nest even when children are async, and one stack serves every schema.
    const open = [];
    const memo = {
        alloc(_inst, payload, empty) {
            const bucket = handoff;
            if (!bucket)
                return empty;
            handoff = undefined;
            const entry = { value: empty, issues: null };
            bucket.set(payload.value, entry);
            open.push(entry);
            return empty;
        },
        guard(inst) {
            var _a;
            (_a = inst._zod).deferred ?? (_a.deferred = []);
            inst._zod.deferred.push(() => {
                const base = inst._zod.parse;
                const wrapped = (payload, ctx) => {
                    // The value is a placeholder a back-edge is still waiting on, so the cycle closes through this transform. Its output can't exist in time to bind.
                    if (ctx.direction !== "backward" && isBackEdge(ctx, payload.value))
                        throw new $ZodCyclicError();
                    return base(payload, ctx);
                };
                inst._zod.parse = wrapped;
                if (inst._zod.run === base)
                    inst._zod.run = wrapped;
            });
        },
        attach(inst) {
            var _a;
            let isRecursiveInst;
            let rechecked = false;
            // a recursive schema is re-entered many times per parse and its bucket never changes
            let lastCtx;
            let lastBucket;
            // Wraps `parse` in a deferred so it sees the container's final parse. Core's own deferred copies `parse` into `run` when there are no checks, and it ran first, so `run` is patched to match; with checks, `run` reads `parse` dynamically.
            (_a = inst._zod).deferred ?? (_a.deferred = []);
            inst._zod.deferred.push(() => {
                const base = inst._zod.parse;
                const wrapped = (payload, ctx) => {
                    if (isRecursiveInst === undefined) {
                        const walked = isRecursive(inst, new Set(), false);
                        if (walked === NONE) {
                            // Nothing here can ever fire, so take it back out.
                            inst._zod.parse = base;
                            if (inst._zod.run === wrapped)
                                inst._zod.run = base;
                            return base(payload, ctx);
                        }
                        // this parse resolves the deferred edges on its own path, so ask once more before latching
                        if (walked === PROVEN || rechecked)
                            isRecursiveInst = true;
                        else
                            rechecked = true;
                    }
                    const input = payload.value;
                    if (!isRef(input))
                        return base(payload, ctx);
                    let state = ctx[STATE];
                    if (!state) {
                        state = { buckets: new WeakMap(), backEdges: undefined };
                        ctx[STATE] = state;
                    }
                    let bucket;
                    if (lastCtx === ctx) {
                        bucket = lastBucket;
                    }
                    else {
                        bucket = bucketFor(state, inst);
                        lastCtx = ctx;
                        lastBucket = bucket;
                    }
                    const hit = bucket.get(input);
                    if (hit) {
                        payload.value = hit.value;
                        if (hit.issues) {
                            if (hit.issues.length)
                                payload.issues.push(...cloneIssues(hit.issues));
                        }
                        else {
                            // Still being parsed: its own checks cover it, so skip them here.
                            payload.memo = true;
                            state.backEdges ?? (state.backEdges = new WeakSet());
                            state.backEdges.add(hit.value);
                        }
                        return payload;
                    }
                    handoff = bucket;
                    const depth = open.length;
                    const result = base(payload, ctx);
                    handoff = undefined;
                    // A container that rejected its input outright allocated nothing.
                    const entry = open.length > depth ? open.pop() : undefined;
                    // Both paths written out so the sync one allocates no closure. It runs once per node, and capturing here cost more than everything else combined.
                    if (result instanceof Promise) {
                        return result.then((r) => {
                            if (entry)
                                entry.issues = r.issues.length ? cloneIssues(r.issues) : NO_ISSUES;
                            return r;
                        });
                    }
                    if (entry)
                        entry.issues = result.issues.length ? cloneIssues(result.issues) : NO_ISSUES;
                    return result;
                };
                inst._zod.parse = wrapped;
                if (inst._zod.run === base)
                    inst._zod.run = wrapped;
            });
        },
    };
    /** The memoizer that gives containers cycle support. `zod` installs it by default; `zod/mini` opts in with `config({ memoizer: memoizer() })`. */
    function memoizer() {
        return memo;
    }
    /** Whether this value is a node a back-edge resolved to before it finished. */
    function isBackEdge(ctx, value) {
        const backEdges = ctx[STATE]?.backEdges;
        return backEdges !== undefined && isRef(value) && backEdges.has(value);
    }

    const error$Y = () => {
        const Sizable = {
            string: { unit: "حرف", verb: "أن يحوي" },
            file: { unit: "بايت", verb: "أن يحوي" },
            array: { unit: "عنصر", verb: "أن يحوي" },
            set: { unit: "عنصر", verb: "أن يحوي" },
            map: { unit: "عنصر", verb: "أن يحوي" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "مدخل",
            email: "بريد إلكتروني",
            url: "رابط",
            emoji: "إيموجي",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "تاريخ ووقت بمعيار ISO",
            date: "تاريخ بمعيار ISO",
            time: "وقت بمعيار ISO",
            duration: "مدة بمعيار ISO",
            ipv4: "عنوان IPv4",
            ipv6: "عنوان IPv6",
            mac: "عنوان MAC",
            cidrv4: "مدى عناوين بصيغة IPv4",
            cidrv6: "مدى عناوين بصيغة IPv6",
            base64: "نَص بترميز base64-encoded",
            base64url: "نَص بترميز base64url-encoded",
            json_string: "نَص على هيئة JSON",
            e164: "رقم هاتف بمعيار E.164",
            credit_card: "رقم بطاقة الائتمان",
            currency_code: "رمز العملة",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "مدخل",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `مدخلات غير مقبولة: يفترض إدخال instanceof ${issue.expected}، ولكن تم إدخال ${received}`;
                    }
                    return `مدخلات غير مقبولة: يفترض إدخال ${expected}، ولكن تم إدخال ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `مدخلات غير مقبولة: يفترض إدخال ${stringifyPrimitive(issue.values[0])}`;
                    return `اختيار غير مقبول: يتوقع انتقاء أحد هذه الخيارات: ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return ` أكبر من اللازم: يفترض أن تكون ${issue.origin ?? "القيمة"} ${adj} ${issue.maximum.toString()} ${sizing.unit ?? "عنصر"}`;
                    return `أكبر من اللازم: يفترض أن تكون ${issue.origin ?? "القيمة"} ${adj} ${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `أصغر من اللازم: يفترض لـ ${issue.origin} أن يكون ${adj} ${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `أصغر من اللازم: يفترض لـ ${issue.origin} أن يكون ${adj} ${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `نَص غير مقبول: يجب أن يبدأ بـ "${issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `نَص غير مقبول: يجب أن ينتهي بـ "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `نَص غير مقبول: يجب أن يتضمَّن "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `نَص غير مقبول: يجب أن يطابق النمط ${_issue.pattern}`;
                    return `${FormatDictionary[_issue.format] ?? issue.format} غير مقبول`;
                }
                case "not_multiple_of":
                    return `رقم غير مقبول: يجب أن يكون من مضاعفات ${issue.divisor}`;
                case "unrecognized_keys":
                    return `معرف${issue.keys.length > 1 ? "ات" : ""} غريب${issue.keys.length > 1 ? "ة" : ""}: ${joinValues(issue.keys, "، ")}`;
                case "invalid_key":
                    return `معرف غير مقبول في ${issue.origin}`;
                case "invalid_union":
                    return "مدخل غير مقبول";
                case "invalid_element":
                    return `مدخل غير مقبول في ${issue.origin}`;
                default:
                    return "مدخل غير مقبول";
            }
        };
    };
    function ar () {
        return {
            localeError: error$Y(),
        };
    }

    const error$X = () => {
        const Sizable = {
            string: { unit: "simvol", verb: "olmalıdır" },
            file: { unit: "bayt", verb: "olmalıdır" },
            array: { unit: "element", verb: "olmalıdır" },
            set: { unit: "element", verb: "olmalıdır" },
            map: { unit: "element", verb: "olmalıdır" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "input",
            email: "email address",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO datetime",
            date: "ISO date",
            time: "ISO time",
            duration: "ISO duration",
            ipv4: "IPv4 address",
            ipv6: "IPv6 address",
            mac: "MAC address",
            cidrv4: "IPv4 range",
            cidrv6: "IPv6 range",
            base64: "base64-encoded string",
            base64url: "base64url-encoded string",
            json_string: "JSON string",
            e164: "E.164 number",
            credit_card: "kredit kartı nömrəsi",
            currency_code: "valyuta kodu",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "input",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Yanlış dəyər: gözlənilən instanceof ${issue.expected}, daxil olan ${received}`;
                    }
                    return `Yanlış dəyər: gözlənilən ${expected}, daxil olan ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Yanlış dəyər: gözlənilən ${stringifyPrimitive(issue.values[0])}`;
                    return `Yanlış seçim: aşağıdakılardan biri olmalıdır: ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Çox böyük: gözlənilən ${issue.origin ?? "dəyər"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "element"}`;
                    return `Çox böyük: gözlənilən ${issue.origin ?? "dəyər"} ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Çox kiçik: gözlənilən ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    return `Çox kiçik: gözlənilən ${issue.origin} ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Yanlış mətn: "${_issue.prefix}" ilə başlamalıdır`;
                    if (_issue.format === "ends_with")
                        return `Yanlış mətn: "${_issue.suffix}" ilə bitməlidir`;
                    if (_issue.format === "includes")
                        return `Yanlış mətn: "${_issue.includes}" daxil olmalıdır`;
                    if (_issue.format === "regex")
                        return `Yanlış mətn: ${_issue.pattern} şablonuna uyğun olmalıdır`;
                    return `Yanlış ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Yanlış ədəd: ${issue.divisor} ilə bölünə bilən olmalıdır`;
                case "unrecognized_keys":
                    return `Tanınmayan açar${issue.keys.length > 1 ? "lar" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `${issue.origin} daxilində yanlış açar`;
                case "invalid_union":
                    return "Yanlış dəyər";
                case "invalid_element":
                    return `${issue.origin} daxilində yanlış dəyər`;
                default:
                    return `Yanlış dəyər`;
            }
        };
    };
    function az () {
        return {
            localeError: error$X(),
        };
    }

    function getBelarusianPlural(count, one, few, many) {
        const absCount = Math.abs(count);
        const lastDigit = absCount % 10;
        const lastTwoDigits = absCount % 100;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return many;
        }
        if (lastDigit === 1) {
            return one;
        }
        if (lastDigit >= 2 && lastDigit <= 4) {
            return few;
        }
        return many;
    }
    const error$W = () => {
        const Sizable = {
            string: {
                unit: {
                    one: "сімвал",
                    few: "сімвалы",
                    many: "сімвалаў",
                },
                verb: "мець",
            },
            array: {
                unit: {
                    one: "элемент",
                    few: "элементы",
                    many: "элементаў",
                },
                verb: "мець",
            },
            set: {
                unit: {
                    one: "элемент",
                    few: "элементы",
                    many: "элементаў",
                },
                verb: "мець",
            },
            map: {
                unit: {
                    one: "элемент",
                    few: "элементы",
                    many: "элементаў",
                },
                verb: "мець",
            },
            file: {
                unit: {
                    one: "байт",
                    few: "байты",
                    many: "байтаў",
                },
                verb: "мець",
            },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "увод",
            email: "email адрас",
            url: "URL",
            emoji: "эмодзі",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO дата і час",
            date: "ISO дата",
            time: "ISO час",
            duration: "ISO працягласць",
            ipv4: "IPv4 адрас",
            ipv6: "IPv6 адрас",
            mac: "MAC адрас",
            cidrv4: "IPv4 дыяпазон",
            cidrv6: "IPv6 дыяпазон",
            base64: "радок у фармаце base64",
            base64url: "радок у фармаце base64url",
            json_string: "JSON радок",
            e164: "нумар E.164",
            credit_card: "нумар крэдытнай карты",
            currency_code: "код валюты",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "увод",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "лік",
            array: "масіў",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Няправільны ўвод: чакаўся instanceof ${issue.expected}, атрымана ${received}`;
                    }
                    return `Няправільны ўвод: чакаўся ${expected}, атрымана ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Няправільны ўвод: чакалася ${stringifyPrimitive(issue.values[0])}`;
                    return `Няправільны варыянт: чакаўся адзін з ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        const maxValue = Number(issue.maximum);
                        const unit = getBelarusianPlural(maxValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
                        return `Занадта вялікі: чакалася, што ${issue.origin ?? "значэнне"} павінна ${sizing.verb} ${adj}${issue.maximum.toString()} ${unit}`;
                    }
                    return `Занадта вялікі: чакалася, што ${issue.origin ?? "значэнне"} павінна быць ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        const minValue = Number(issue.minimum);
                        const unit = getBelarusianPlural(minValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
                        return `Занадта малы: чакалася, што ${issue.origin} павінна ${sizing.verb} ${adj}${issue.minimum.toString()} ${unit}`;
                    }
                    return `Занадта малы: чакалася, што ${issue.origin} павінна быць ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Няправільны радок: павінен пачынацца з "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Няправільны радок: павінен заканчвацца на "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Няправільны радок: павінен змяшчаць "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Няправільны радок: павінен адпавядаць шаблону ${_issue.pattern}`;
                    return `Няправільны ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Няправільны лік: павінен быць кратным ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Нераспазнаны ${issue.keys.length > 1 ? "ключы" : "ключ"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Няправільны ключ у ${issue.origin}`;
                case "invalid_union":
                    return "Няправільны ўвод";
                case "invalid_element":
                    return `Няправільнае значэнне ў ${issue.origin}`;
                default:
                    return `Няправільны ўвод`;
            }
        };
    };
    function be () {
        return {
            localeError: error$W(),
        };
    }

    const error$V = () => {
        const Sizable = {
            string: { unit: "символа", verb: "да съдържа" },
            file: { unit: "байта", verb: "да съдържа" },
            array: { unit: "елемента", verb: "да съдържа" },
            set: { unit: "елемента", verb: "да съдържа" },
            map: { unit: "елемента", verb: "да съдържа" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "вход",
            email: "имейл адрес",
            url: "URL",
            emoji: "емоджи",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO време",
            date: "ISO дата",
            time: "ISO време",
            duration: "ISO продължителност",
            ipv4: "IPv4 адрес",
            ipv6: "IPv6 адрес",
            mac: "MAC адрес",
            cidrv4: "IPv4 диапазон",
            cidrv6: "IPv6 диапазон",
            base64: "base64-кодиран низ",
            base64url: "base64url-кодиран низ",
            json_string: "JSON низ",
            e164: "E.164 номер",
            credit_card: "номер на кредитна карта",
            currency_code: "код на валута",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "вход",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "число",
            array: "масив",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Невалиден вход: очакван instanceof ${issue.expected}, получен ${received}`;
                    }
                    return `Невалиден вход: очакван ${expected}, получен ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Невалиден вход: очакван ${stringifyPrimitive(issue.values[0])}`;
                    return `Невалидна опция: очаквано едно от ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Твърде голямо: очаква се ${issue.origin ?? "стойност"} да съдържа ${adj}${issue.maximum.toString()} ${sizing.unit ?? "елемента"}`;
                    return `Твърде голямо: очаква се ${issue.origin ?? "стойност"} да бъде ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Твърде малко: очаква се ${issue.origin} да съдържа ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Твърде малко: очаква се ${issue.origin} да бъде ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `Невалиден низ: трябва да започва с "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `Невалиден низ: трябва да завършва с "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Невалиден низ: трябва да включва "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Невалиден низ: трябва да съвпада с ${_issue.pattern}`;
                    let invalid_adj = "Невалиден";
                    if (_issue.format === "emoji")
                        invalid_adj = "Невалидно";
                    if (_issue.format === "datetime")
                        invalid_adj = "Невалидно";
                    if (_issue.format === "date")
                        invalid_adj = "Невалидна";
                    if (_issue.format === "time")
                        invalid_adj = "Невалидно";
                    if (_issue.format === "duration")
                        invalid_adj = "Невалидна";
                    return `${invalid_adj} ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Невалидно число: трябва да бъде кратно на ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Неразпознат${issue.keys.length > 1 ? "и" : ""} ключ${issue.keys.length > 1 ? "ове" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Невалиден ключ в ${issue.origin}`;
                case "invalid_union":
                    return "Невалиден вход";
                case "invalid_element":
                    return `Невалидна стойност в ${issue.origin}`;
                default:
                    return `Невалиден вход`;
            }
        };
    };
    function bg () {
        return {
            localeError: error$V(),
        };
    }

    const error$U = () => {
        const Sizable = {
            string: { unit: "অক্ষর", verb: "থাকতে হবে" },
            file: { unit: "বাইট", verb: "থাকতে হবে" },
            array: { unit: "আইটেম", verb: "থাকতে হবে" },
            set: { unit: "আইটেম", verb: "থাকতে হবে" },
            map: { unit: "এন্ট্রি", verb: "থাকতে হবে" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "ইনপুট",
            email: "ইমেইল ঠিকানা",
            url: "URL",
            emoji: "ইমোজি",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO তারিখ ও সময়",
            date: "ISO তারিখ",
            time: "ISO সময়",
            duration: "ISO সময়কাল",
            ipv4: "IPv4 ঠিকানা",
            ipv6: "IPv6 ঠিকানা",
            mac: "MAC ঠিকানা",
            cidrv4: "IPv4 রেঞ্জ",
            cidrv6: "IPv6 রেঞ্জ",
            base64: "base64-এনকোডেড স্ট্রিং",
            base64url: "base64url-এনকোডেড স্ট্রিং",
            json_string: "JSON স্ট্রিং",
            e164: "E.164 নম্বর",
            credit_card: "ক্রেডিট কার্ড নম্বর",
            currency_code: "মুদ্রা কোড",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "ইনপুট",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    return `অবৈধ ইনপুট: প্রত্যাশিত ${expected}, প্রাপ্ত ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `অবৈধ ইনপুট: প্রত্যাশিত ${stringifyPrimitive(issue.values[0])}`;
                    return `অবৈধ অপশন: ${joinValues(issue.values, " | ")} এর মধ্যে একটি প্রত্যাশিত`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `অনেক বড়: ${issue.origin ?? "মান"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "এলিমেন্ট"} হতে হবে`;
                    return `অনেক বড়: ${issue.origin ?? "মান"} ${adj}${issue.maximum.toString()} হতে হবে`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `অনেক ছোট: ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit} হতে হবে`;
                    }
                    return `অনেক ছোট: ${issue.origin} ${adj}${issue.minimum.toString()} হতে হবে`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `অবৈধ স্ট্রিং: "${_issue.prefix}" দিয়ে শুরু হতে হবে`;
                    }
                    if (_issue.format === "ends_with")
                        return `অবৈধ স্ট্রিং: "${_issue.suffix}" দিয়ে শেষ হতে হবে`;
                    if (_issue.format === "includes")
                        return `অবৈধ স্ট্রিং: "${_issue.includes}" অন্তর্ভুক্ত থাকতে হবে`;
                    if (_issue.format === "regex")
                        return `অবৈধ স্ট্রিং: ${_issue.pattern} প্যাটার্ন মিলতে হবে`;
                    return `অবৈধ ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `অবৈধ নম্বর: ${issue.divisor} এর গুণিতক হতে হবে`;
                case "unrecognized_keys":
                    return `অচেনা কী${issue.keys.length > 1 ? "গুলো" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `${issue.origin} এ অবৈধ কী`;
                case "invalid_union":
                    if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
                        const opts = issue.options.map((o) => `'${o}'`).join(" | ");
                        return `অবৈধ ডিসক্রিমিনেটর মান। প্রত্যাশিত ${opts}`;
                    }
                    return "অবৈধ ইনপুট";
                case "invalid_element":
                    return `${issue.origin} এ অবৈধ মান`;
                default:
                    return "অবৈধ ইনপুট";
            }
        };
    };
    function bn () {
        return {
            localeError: error$U(),
        };
    }

    const error$T = () => {
        const Sizable = {
            string: { unit: "caràcters", verb: "contenir" },
            file: { unit: "bytes", verb: "contenir" },
            array: { unit: "elements", verb: "contenir" },
            set: { unit: "elements", verb: "contenir" },
            map: { unit: "elements", verb: "contenir" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "entrada",
            email: "adreça electrònica",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "data i hora ISO",
            date: "data ISO",
            time: "hora ISO",
            duration: "durada ISO",
            ipv4: "adreça IPv4",
            ipv6: "adreça IPv6",
            mac: "adreça MAC",
            cidrv4: "rang IPv4",
            cidrv6: "rang IPv6",
            base64: "cadena codificada en base64",
            base64url: "cadena codificada en base64url",
            json_string: "cadena JSON",
            e164: "número E.164",
            credit_card: "número de targeta de crèdit",
            currency_code: "codi de moneda",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "entrada",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Tipus invàlid: s'esperava instanceof ${issue.expected}, s'ha rebut ${received}`;
                    }
                    return `Tipus invàlid: s'esperava ${expected}, s'ha rebut ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Valor invàlid: s'esperava ${stringifyPrimitive(issue.values[0])}`;
                    return `Opció invàlida: s'esperava una de ${joinValues(issue.values, " o ")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "com a màxim" : "menys de";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Massa gran: s'esperava que ${issue.origin ?? "el valor"} contingués ${adj} ${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
                    return `Massa gran: s'esperava que ${issue.origin ?? "el valor"} fos ${adj} ${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? "com a mínim" : "més de";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Massa petit: s'esperava que ${issue.origin} contingués ${adj} ${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Massa petit: s'esperava que ${issue.origin} fos ${adj} ${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `Format invàlid: ha de començar amb "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `Format invàlid: ha d'acabar amb "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Format invàlid: ha d'incloure "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Format invàlid: ha de coincidir amb el patró ${_issue.pattern}`;
                    return `Format invàlid per a ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Número invàlid: ha de ser múltiple de ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Clau${issue.keys.length > 1 ? "s" : ""} no reconeguda${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Clau invàlida a ${issue.origin}`;
                case "invalid_union":
                    return "Entrada invàlida"; // Could also be "Tipus d'unió invàlid" but "Entrada invàlida" is more general
                case "invalid_element":
                    return `Element invàlid a ${issue.origin}`;
                default:
                    return `Entrada invàlida`;
            }
        };
    };
    function ca () {
        return {
            localeError: error$T(),
        };
    }

    const error$S = () => {
        const Sizable = {
            string: { unit: "پیت", verb: "بێت" },
            file: { unit: "بایت", verb: "بێت" },
            array: { unit: "دانە", verb: "بێت" },
            set: { unit: "دانە", verb: "بێت" },
            map: { unit: "دانە", verb: "بێت" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "regex",
            email: "ئیمەیڵ",
            url: "بەستەر (URL)",
            emoji: "ئیمۆجی",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ڕێکەوت و کات",
            date: "ڕێکەوت",
            time: "کات",
            duration: "ماوە",
            ipv4: "ناونیشانی IPv4",
            ipv6: "ناونیشانی IPv6",
            mac: "ناونیشانی MAC",
            cidrv4: "مەودای IPv4",
            cidrv6: "مەودای IPv6",
            base64: "دەقی base64",
            base64url: "دەقی base64url",
            json_string: "دەقی JSON",
            e164: "ژمارەی E.164",
            credit_card: "ژمارەی کارتی کرێدیت",
            currency_code: "کۆدی دراو",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "تێکردە",
        };
        // type names: missing keys = do not translate (use raw value via ?? fallback)
        const TypeDictionary = {
            nan: "NaN",
            string: "نووسین",
            number: "ژمارە",
            boolean: "boolean",
            array: "array",
            object: "object",
            date: "ڕێکەوت",
            integer: "ژمارە",
            float: "ژمارە",
            null: "null",
            undefined: "undefined",
            function: "function",
            symbol: "symbol",
            unknown: "unknown",
            promise: "promise",
            void: "void",
            never: "never",
            map: "map",
            set: "set",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    const postfix = ["ا", "و", "ۆ", "وو", "ە", "ی", "ێ"].some((p) => received.endsWith(p)) ? "یە" : "ە";
                    const isEnglish = /^[a-zA-Z]+$/.test(received);
                    if (receivedType === "null" || receivedType === "undefined")
                        return `داواکراوە`;
                    return `چاوەڕوانکراوە ${expected} بێت، بەڵام ${received}${isEnglish ? "" : postfix}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `بەهاکە نادرووستە: چاوەڕوانکراوە ${stringifyPrimitive(issue.values[0])} بێت`;
                    return `هەڵبژاردەی نادروست: چاوەڕوانکراوە یەکێک بێت لە ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `پێویستە بە لایەنی زۆرەوە ${issue.maximum.toString()} ${sizing.unit} ${sizing.verb}`;
                    return `پێویستە بە لایەنی زۆرەوە ${issue.maximum.toString()} بێت`;
                }
                case "too_small": {
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `پێویستە بە لایەنی کەمەوە ${issue.minimum.toString()} ${sizing.unit} ${sizing.verb}`;
                    return `پێویستە بە لایەنی کەمەوە ${issue.minimum.toString()} بێت`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `دەقی نادروست: پێویستە دەستپێبکات بە "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `دەقی نادروست: پێویستە کۆتاییبێت بە "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `دەقی نادروست: پێویستە "${_issue.includes}" لەخۆبگرێت`;
                    if (_issue.format === "regex")
                        return `دەقی نادروست: پێویستە لەگەڵ پاتێرنی ${_issue.pattern} بگونجێت`;
                    return `بەهای ${FormatDictionary[_issue.format] ?? issue.format} نادروستە`;
                }
                case "not_multiple_of":
                    return `ژمارەی نادروست: دەبێت چەند هێندە بێت بۆ ${issue.divisor}`;
                case "unrecognized_keys":
                    return `کلیلی نەناسراو: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `کلیلی نادروست لە ${issue.origin}`;
                case "invalid_union":
                    if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
                        const opts = issue.options.map((o) => `'${o}'`).join(" | ");
                        return `بەهای نەناسراو هەیە. بەهای چاوەڕوانکراو: ${opts}`;
                    }
                    return "یەکگرتنی نادروست";
                case "invalid_element":
                    return `${issue.origin} بەهاکە نادروستە`;
                default:
                    return `تێکردەی نادروست`;
            }
        };
    };
    function ckb () {
        return {
            localeError: error$S(),
        };
    }

    const error$R = () => {
        const Sizable = {
            string: { unit: "znaků", verb: "mít" },
            file: { unit: "bajtů", verb: "mít" },
            array: { unit: "prvků", verb: "mít" },
            set: { unit: "prvků", verb: "mít" },
            map: { unit: "prvků", verb: "mít" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "regulární výraz",
            email: "e-mailová adresa",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "datum a čas ve formátu ISO",
            date: "datum ve formátu ISO",
            time: "čas ve formátu ISO",
            duration: "doba trvání ISO",
            ipv4: "IPv4 adresa",
            ipv6: "IPv6 adresa",
            mac: "MAC adresa",
            cidrv4: "rozsah IPv4",
            cidrv6: "rozsah IPv6",
            base64: "řetězec zakódovaný ve formátu base64",
            base64url: "řetězec zakódovaný ve formátu base64url",
            json_string: "řetězec ve formátu JSON",
            e164: "číslo E.164",
            credit_card: "číslo kreditní karty",
            currency_code: "kód měny",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "vstup",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "číslo",
            string: "řetězec",
            function: "funkce",
            array: "pole",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Neplatný vstup: očekáváno instanceof ${issue.expected}, obdrženo ${received}`;
                    }
                    return `Neplatný vstup: očekáváno ${expected}, obdrženo ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Neplatný vstup: očekáváno ${stringifyPrimitive(issue.values[0])}`;
                    return `Neplatná možnost: očekávána jedna z hodnot ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Hodnota je příliš velká: ${issue.origin ?? "hodnota"} musí mít ${adj}${issue.maximum.toString()} ${sizing.unit ?? "prvků"}`;
                    }
                    return `Hodnota je příliš velká: ${issue.origin ?? "hodnota"} musí být ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Hodnota je příliš malá: ${issue.origin ?? "hodnota"} musí mít ${adj}${issue.minimum.toString()} ${sizing.unit ?? "prvků"}`;
                    }
                    return `Hodnota je příliš malá: ${issue.origin ?? "hodnota"} musí být ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Neplatný řetězec: musí začínat na "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Neplatný řetězec: musí končit na "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Neplatný řetězec: musí obsahovat "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Neplatný řetězec: musí odpovídat vzoru ${_issue.pattern}`;
                    return `Neplatný formát ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Neplatné číslo: musí být násobkem ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Neznámé klíče: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Neplatný klíč v ${issue.origin}`;
                case "invalid_union":
                    return "Neplatný vstup";
                case "invalid_element":
                    return `Neplatná hodnota v ${issue.origin}`;
                default:
                    return `Neplatný vstup`;
            }
        };
    };
    function cs () {
        return {
            localeError: error$R(),
        };
    }

    const error$Q = () => {
        const Sizable = {
            string: { unit: "tegn", verb: "havde" },
            file: { unit: "bytes", verb: "havde" },
            array: { unit: "elementer", verb: "indeholdt" },
            set: { unit: "elementer", verb: "indeholdt" },
            map: { unit: "elementer", verb: "indeholdt" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "input",
            email: "e-mailadresse",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO dato- og klokkeslæt",
            date: "ISO-dato",
            time: "ISO-klokkeslæt",
            duration: "ISO-varighed",
            ipv4: "IPv4-adresse",
            ipv6: "IPv6-adresse",
            mac: "MAC-adresse",
            cidrv4: "IPv4-spektrum",
            cidrv6: "IPv6-spektrum",
            base64: "base64-kodet streng",
            base64url: "base64url-kodet streng",
            json_string: "JSON-streng",
            e164: "E.164-nummer",
            credit_card: "kreditkortnummer",
            currency_code: "valutakode",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "input",
        };
        const TypeDictionary = {
            nan: "NaN",
            string: "streng",
            number: "tal",
            boolean: "boolean",
            array: "liste",
            object: "objekt",
            set: "sæt",
            file: "fil",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Ugyldigt input: forventede instanceof ${issue.expected}, fik ${received}`;
                    }
                    return `Ugyldigt input: forventede ${expected}, fik ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Ugyldig værdi: forventede ${stringifyPrimitive(issue.values[0])}`;
                    return `Ugyldigt valg: forventede en af følgende ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    const origin = TypeDictionary[issue.origin] ?? issue.origin;
                    if (sizing)
                        return `For stor: forventede ${origin ?? "value"} ${sizing.verb} ${adj} ${issue.maximum.toString()} ${sizing.unit ?? "elementer"}`;
                    return `For stor: forventede ${origin ?? "value"} havde ${adj} ${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    const origin = TypeDictionary[issue.origin] ?? issue.origin;
                    if (sizing) {
                        return `For lille: forventede ${origin} ${sizing.verb} ${adj} ${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `For lille: forventede ${origin} havde ${adj} ${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Ugyldig streng: skal starte med "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Ugyldig streng: skal ende med "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Ugyldig streng: skal indeholde "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Ugyldig streng: skal matche mønsteret ${_issue.pattern}`;
                    return `Ugyldig ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Ugyldigt tal: skal være deleligt med ${issue.divisor}`;
                case "unrecognized_keys":
                    return `${issue.keys.length > 1 ? "Ukendte nøgler" : "Ukendt nøgle"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Ugyldig nøgle i ${issue.origin}`;
                case "invalid_union":
                    return "Ugyldigt input: matcher ingen af de tilladte typer";
                case "invalid_element":
                    return `Ugyldig værdi i ${issue.origin}`;
                default:
                    return `Ugyldigt input`;
            }
        };
    };
    function da () {
        return {
            localeError: error$Q(),
        };
    }

    const error$P = () => {
        const Sizable = {
            string: { unit: "Zeichen", verb: "zu haben" },
            file: { unit: "Bytes", verb: "zu haben" },
            array: { unit: "Elemente", verb: "zu haben" },
            set: { unit: "Elemente", verb: "zu haben" },
            map: { unit: "Elemente", verb: "zu haben" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "Eingabe",
            email: "E-Mail-Adresse",
            url: "URL",
            emoji: "Emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO-Datum und -Uhrzeit",
            date: "ISO-Datum",
            time: "ISO-Uhrzeit",
            duration: "ISO-Dauer",
            ipv4: "IPv4-Adresse",
            ipv6: "IPv6-Adresse",
            mac: "MAC-Adresse",
            cidrv4: "IPv4-Bereich",
            cidrv6: "IPv6-Bereich",
            base64: "Base64-codierter String",
            base64url: "Base64-URL-codierter String",
            json_string: "JSON-String",
            e164: "E.164-Nummer",
            credit_card: "Kreditkartennummer",
            currency_code: "Währungscode",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "Eingabe",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "Zahl",
            array: "Array",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Ungültige Eingabe: erwartet instanceof ${issue.expected}, erhalten ${received}`;
                    }
                    return `Ungültige Eingabe: erwartet ${expected}, erhalten ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Ungültige Eingabe: erwartet ${stringifyPrimitive(issue.values[0])}`;
                    return `Ungültige Option: erwartet eine von ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Zu groß: erwartet, dass ${issue.origin ?? "Wert"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "Elemente"} hat`;
                    return `Zu groß: erwartet, dass ${issue.origin ?? "Wert"} ${adj}${issue.maximum.toString()} ist`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Zu klein: erwartet, dass ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit} hat`;
                    }
                    return `Zu klein: erwartet, dass ${issue.origin} ${adj}${issue.minimum.toString()} ist`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Ungültiger String: muss mit "${_issue.prefix}" beginnen`;
                    if (_issue.format === "ends_with")
                        return `Ungültiger String: muss mit "${_issue.suffix}" enden`;
                    if (_issue.format === "includes")
                        return `Ungültiger String: muss "${_issue.includes}" enthalten`;
                    if (_issue.format === "regex")
                        return `Ungültiger String: muss dem Muster ${_issue.pattern} entsprechen`;
                    return `Ungültig: ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Ungültige Zahl: muss ein Vielfaches von ${issue.divisor} sein`;
                case "unrecognized_keys":
                    return `${issue.keys.length > 1 ? "Unbekannte Schlüssel" : "Unbekannter Schlüssel"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Ungültiger Schlüssel in ${issue.origin}`;
                case "invalid_union":
                    return "Ungültige Eingabe";
                case "invalid_element":
                    return `Ungültiger Wert in ${issue.origin}`;
                default:
                    return `Ungültige Eingabe`;
            }
        };
    };
    function de () {
        return {
            localeError: error$P(),
        };
    }

    const error$O = () => {
        const Sizable = {
            string: { unit: "χαρακτήρες", verb: "να έχει" },
            file: { unit: "bytes", verb: "να έχει" },
            array: { unit: "στοιχεία", verb: "να έχει" },
            set: { unit: "στοιχεία", verb: "να έχει" },
            map: { unit: "καταχωρήσεις", verb: "να έχει" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "είσοδος",
            email: "διεύθυνση email",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO ημερομηνία και ώρα",
            date: "ISO ημερομηνία",
            time: "ISO ώρα",
            duration: "ISO διάρκεια",
            ipv4: "διεύθυνση IPv4",
            ipv6: "διεύθυνση IPv6",
            mac: "διεύθυνση MAC",
            cidrv4: "εύρος IPv4",
            cidrv6: "εύρος IPv6",
            base64: "συμβολοσειρά κωδικοποιημένη σε base64",
            base64url: "συμβολοσειρά κωδικοποιημένη σε base64url",
            json_string: "συμβολοσειρά JSON",
            e164: "αριθμός E.164",
            credit_card: "αριθμός πιστωτικής κάρτας",
            currency_code: "κωδικός νομίσματος",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "είσοδος",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (typeof issue.expected === "string" && /^[A-Z]/.test(issue.expected)) {
                        return `Μη έγκυρη είσοδος: αναμενόταν instanceof ${issue.expected}, λήφθηκε ${received}`;
                    }
                    return `Μη έγκυρη είσοδος: αναμενόταν ${expected}, λήφθηκε ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Μη έγκυρη είσοδος: αναμενόταν ${stringifyPrimitive(issue.values[0])}`;
                    return `Μη έγκυρη επιλογή: αναμενόταν ένα από ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Πολύ μεγάλο: αναμενόταν ${issue.origin ?? "τιμή"} να έχει ${adj}${issue.maximum.toString()} ${sizing.unit ?? "στοιχεία"}`;
                    return `Πολύ μεγάλο: αναμενόταν ${issue.origin ?? "τιμή"} να είναι ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Πολύ μικρό: αναμενόταν ${issue.origin} να έχει ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Πολύ μικρό: αναμενόταν ${issue.origin} να είναι ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `Μη έγκυρη συμβολοσειρά: πρέπει να ξεκινά με "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `Μη έγκυρη συμβολοσειρά: πρέπει να τελειώνει με "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Μη έγκυρη συμβολοσειρά: πρέπει να περιέχει "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Μη έγκυρη συμβολοσειρά: πρέπει να ταιριάζει με το μοτίβο ${_issue.pattern}`;
                    return `Μη έγκυρο: ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Μη έγκυρος αριθμός: πρέπει να είναι πολλαπλάσιο του ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Άγνωστ${issue.keys.length > 1 ? "α" : "ο"} κλειδ${issue.keys.length > 1 ? "ιά" : "ί"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Μη έγκυρο κλειδί στο ${issue.origin}`;
                case "invalid_union":
                    return "Μη έγκυρη είσοδος";
                case "invalid_element":
                    return `Μη έγκυρη τιμή στο ${issue.origin}`;
                default:
                    return `Μη έγκυρη είσοδος`;
            }
        };
    };
    function el () {
        return {
            localeError: error$O(),
        };
    }

    const error$N = () => {
        const Sizable = {
            string: { unit: "characters", verb: "to have" },
            file: { unit: "bytes", verb: "to have" },
            array: { unit: "items", verb: "to have" },
            set: { unit: "items", verb: "to have" },
            map: { unit: "entries", verb: "to have" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "input",
            email: "email address",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO datetime",
            date: "ISO date",
            time: "ISO time",
            duration: "ISO duration",
            ipv4: "IPv4 address",
            ipv6: "IPv6 address",
            mac: "MAC address",
            cidrv4: "IPv4 range",
            cidrv6: "IPv6 range",
            base64: "base64-encoded string",
            base64url: "base64url-encoded string",
            json_string: "JSON string",
            e164: "E.164 number",
            currency_code: "currency code",
            credit_card: "credit card number",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "input",
        };
        // type names: missing keys = do not translate (use raw value via ?? fallback)
        const TypeDictionary = {
            // Compatibility: "nan" -> "NaN" for display
            nan: "NaN",
            // All other type names omitted - they fall back to raw values via ?? operator
        };
        function getTypeName(type, input) {
            if (type === "number" && typeof input === "number" && !Number.isFinite(input)) {
                return String(input);
            }
            return TypeDictionary[type] ?? type;
        }
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = getTypeName(issue.expected);
                    const receivedType = parsedType(issue.input);
                    const received = getTypeName(receivedType, issue.input);
                    return `Invalid input: expected ${expected}, received ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Invalid input: expected ${stringifyPrimitive(issue.values[0])}`;
                    return `Invalid option: expected one of ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.exact ? "exactly " : issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Too big: expected ${issue.origin ?? "value"} to have ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
                    return `Too big: expected ${issue.origin ?? "value"} to be ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.exact ? "exactly " : issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Too small: expected ${issue.origin} to have ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Too small: expected ${issue.origin} to be ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `Invalid string: must start with "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `Invalid string: must end with "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Invalid string: must include "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Invalid string: must match pattern ${_issue.pattern}`;
                    return `Invalid ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Invalid number: must be a multiple of ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Unrecognized key${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Invalid key in ${issue.origin}`;
                case "invalid_union":
                    if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
                        const opts = issue.options.map((o) => `'${o}'`).join(" | ");
                        return `Invalid discriminator value. Expected ${opts}`;
                    }
                    if (issue.inclusive === false) {
                        return "Invalid input: more than one option matched";
                    }
                    return "Invalid input";
                case "invalid_element":
                    return `Invalid value in ${issue.origin}`;
                default:
                    return `Invalid input`;
            }
        };
    };
    function en () {
        return {
            localeError: error$N(),
        };
    }

    const error$M = () => {
        const Sizable = {
            string: { unit: "karaktrojn", verb: "havi" },
            file: { unit: "bajtojn", verb: "havi" },
            array: { unit: "elementojn", verb: "havi" },
            set: { unit: "elementojn", verb: "havi" },
            map: { unit: "elementojn", verb: "havi" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "enigo",
            email: "retadreso",
            url: "URL",
            emoji: "emoĝio",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO-datotempo",
            date: "ISO-dato",
            time: "ISO-tempo",
            duration: "ISO-daŭro",
            ipv4: "IPv4-adreso",
            ipv6: "IPv6-adreso",
            mac: "MAC-adreso",
            cidrv4: "IPv4-rango",
            cidrv6: "IPv6-rango",
            base64: "64-ume kodita karaktraro",
            base64url: "URL-64-ume kodita karaktraro",
            json_string: "JSON-karaktraro",
            e164: "E.164-nombro",
            credit_card: "kreditkarta numero",
            currency_code: "valuta kodo",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "enigo",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "nombro",
            array: "tabelo",
            null: "senvalora",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Nevalida enigo: atendiĝis instanceof ${issue.expected}, riceviĝis ${received}`;
                    }
                    return `Nevalida enigo: atendiĝis ${expected}, riceviĝis ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Nevalida enigo: atendiĝis ${stringifyPrimitive(issue.values[0])}`;
                    return `Nevalida opcio: atendiĝis unu el ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Tro granda: atendiĝis ke ${issue.origin ?? "valoro"} havu ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementojn"}`;
                    return `Tro granda: atendiĝis ke ${issue.origin ?? "valoro"} havu ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Tro malgranda: atendiĝis ke ${issue.origin} havu ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Tro malgranda: atendiĝis ke ${issue.origin} estu ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Nevalida karaktraro: devas komenciĝi per "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Nevalida karaktraro: devas finiĝi per "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Nevalida karaktraro: devas inkluzivi "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Nevalida karaktraro: devas kongrui kun la modelo ${_issue.pattern}`;
                    return `Nevalida ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Nevalida nombro: devas esti oblo de ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Nekonata${issue.keys.length > 1 ? "j" : ""} ŝlosilo${issue.keys.length > 1 ? "j" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Nevalida ŝlosilo en ${issue.origin}`;
                case "invalid_union":
                    return "Nevalida enigo";
                case "invalid_element":
                    return `Nevalida valoro en ${issue.origin}`;
                default:
                    return `Nevalida enigo`;
            }
        };
    };
    function eo () {
        return {
            localeError: error$M(),
        };
    }

    const error$L = () => {
        const Sizable = {
            string: { unit: "caracteres", verb: "tener" },
            file: { unit: "bytes", verb: "tener" },
            array: { unit: "elementos", verb: "tener" },
            set: { unit: "elementos", verb: "tener" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "entrada",
            email: "dirección de correo electrónico",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "fecha y hora ISO",
            date: "fecha ISO",
            time: "hora ISO",
            duration: "duración ISO",
            ipv4: "dirección IPv4",
            ipv6: "dirección IPv6",
            mac: "dirección MAC",
            cidrv4: "rango IPv4",
            cidrv6: "rango IPv6",
            base64: "cadena codificada en base64",
            base64url: "URL codificada en base64",
            json_string: "cadena JSON",
            e164: "número E.164",
            credit_card: "número de tarjeta de crédito",
            currency_code: "código de moneda",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "entrada",
        };
        const TypeDictionary = {
            nan: "NaN",
            string: "texto",
            number: "número",
            boolean: "booleano",
            array: "arreglo",
            object: "objeto",
            set: "conjunto",
            file: "archivo",
            date: "fecha",
            bigint: "número grande",
            symbol: "símbolo",
            undefined: "indefinido",
            null: "nulo",
            function: "función",
            map: "mapa",
            record: "registro",
            tuple: "tupla",
            enum: "enumeración",
            union: "unión",
            literal: "literal",
            promise: "promesa",
            void: "vacío",
            never: "nunca",
            unknown: "desconocido",
            any: "cualquiera",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Entrada inválida: se esperaba instanceof ${issue.expected}, recibido ${received}`;
                    }
                    return `Entrada inválida: se esperaba ${expected}, recibido ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Entrada inválida: se esperaba ${stringifyPrimitive(issue.values[0])}`;
                    return `Opción inválida: se esperaba una de ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    const origin = TypeDictionary[issue.origin] ?? issue.origin;
                    if (sizing)
                        return `Demasiado grande: se esperaba que ${origin ?? "valor"} tuviera ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementos"}`;
                    return `Demasiado grande: se esperaba que ${origin ?? "valor"} fuera ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    const origin = TypeDictionary[issue.origin] ?? issue.origin;
                    if (sizing) {
                        return `Demasiado pequeño: se esperaba que ${origin} tuviera ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Demasiado pequeño: se esperaba que ${origin} fuera ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Cadena inválida: debe comenzar con "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Cadena inválida: debe terminar en "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Cadena inválida: debe incluir "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Cadena inválida: debe coincidir con el patrón ${_issue.pattern}`;
                    return `Inválido ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Número inválido: debe ser múltiplo de ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Llave${issue.keys.length > 1 ? "s" : ""} desconocida${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Llave inválida en ${TypeDictionary[issue.origin] ?? issue.origin}`;
                case "invalid_union":
                    return "Entrada inválida";
                case "invalid_element":
                    return `Valor inválido en ${TypeDictionary[issue.origin] ?? issue.origin}`;
                default:
                    return `Entrada inválida`;
            }
        };
    };
    function es () {
        return {
            localeError: error$L(),
        };
    }

    const error$K = () => {
        const Sizable = {
            string: { unit: "کاراکتر", verb: "داشته باشد" },
            file: { unit: "بایت", verb: "داشته باشد" },
            array: { unit: "آیتم", verb: "داشته باشد" },
            set: { unit: "آیتم", verb: "داشته باشد" },
            map: { unit: "آیتم", verb: "داشته باشد" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "ورودی",
            email: "آدرس ایمیل",
            url: "URL",
            emoji: "ایموجی",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "تاریخ و زمان ایزو",
            date: "تاریخ ایزو",
            time: "زمان ایزو",
            duration: "مدت زمان ایزو",
            ipv4: "IPv4 آدرس",
            ipv6: "IPv6 آدرس",
            mac: "MAC آدرس",
            cidrv4: "IPv4 دامنه",
            cidrv6: "IPv6 دامنه",
            base64: "base64-encoded رشته",
            base64url: "base64url-encoded رشته",
            json_string: "JSON رشته",
            e164: "E.164 عدد",
            credit_card: "شماره کارت اعتباری",
            currency_code: "کد ارز",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "ورودی",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "عدد",
            array: "آرایه",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `ورودی نامعتبر: می‌بایست instanceof ${issue.expected} می‌بود، ${received} دریافت شد`;
                    }
                    return `ورودی نامعتبر: می‌بایست ${expected} می‌بود، ${received} دریافت شد`;
                }
                case "invalid_value":
                    if (issue.values.length === 1) {
                        return `ورودی نامعتبر: می‌بایست ${stringifyPrimitive(issue.values[0])} می‌بود`;
                    }
                    return `گزینه نامعتبر: می‌بایست یکی از ${joinValues(issue.values, "|")} می‌بود`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `خیلی بزرگ: ${issue.origin ?? "مقدار"} باید ${adj}${issue.maximum.toString()} ${sizing.unit ?? "عنصر"} باشد`;
                    }
                    return `خیلی بزرگ: ${issue.origin ?? "مقدار"} باید ${adj}${issue.maximum.toString()} باشد`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `خیلی کوچک: ${issue.origin} باید ${adj}${issue.minimum.toString()} ${sizing.unit} باشد`;
                    }
                    return `خیلی کوچک: ${issue.origin} باید ${adj}${issue.minimum.toString()} باشد`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `رشته نامعتبر: باید با "${_issue.prefix}" شروع شود`;
                    }
                    if (_issue.format === "ends_with") {
                        return `رشته نامعتبر: باید با "${_issue.suffix}" تمام شود`;
                    }
                    if (_issue.format === "includes") {
                        return `رشته نامعتبر: باید شامل "${_issue.includes}" باشد`;
                    }
                    if (_issue.format === "regex") {
                        return `رشته نامعتبر: باید با الگوی ${_issue.pattern} مطابقت داشته باشد`;
                    }
                    return `${FormatDictionary[_issue.format] ?? issue.format} نامعتبر`;
                }
                case "not_multiple_of":
                    return `عدد نامعتبر: باید مضرب ${issue.divisor} باشد`;
                case "unrecognized_keys":
                    return `کلید${issue.keys.length > 1 ? "های" : ""} ناشناس: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `کلید ناشناس در ${issue.origin}`;
                case "invalid_union":
                    return `ورودی نامعتبر`;
                case "invalid_element":
                    return `مقدار نامعتبر در ${issue.origin}`;
                default:
                    return `ورودی نامعتبر`;
            }
        };
    };
    function fa () {
        return {
            localeError: error$K(),
        };
    }

    const error$J = () => {
        const Sizable = {
            string: { unit: "merkkiä", subject: "merkkijonon" },
            file: { unit: "tavua", subject: "tiedoston" },
            array: { unit: "alkiota", subject: "listan" },
            set: { unit: "alkiota", subject: "joukon" },
            map: { unit: "alkiota", subject: "kuvauksen" },
            number: { unit: "", subject: "luvun" },
            bigint: { unit: "", subject: "suuren kokonaisluvun" },
            int: { unit: "", subject: "kokonaisluvun" },
            date: { unit: "", subject: "päivämäärän" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "säännöllinen lauseke",
            email: "sähköpostiosoite",
            url: "URL-osoite",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO-aikaleima",
            date: "ISO-päivämäärä",
            time: "ISO-aika",
            duration: "ISO-kesto",
            ipv4: "IPv4-osoite",
            ipv6: "IPv6-osoite",
            mac: "MAC-osoite",
            cidrv4: "IPv4-alue",
            cidrv6: "IPv6-alue",
            base64: "base64-koodattu merkkijono",
            base64url: "base64url-koodattu merkkijono",
            json_string: "JSON-merkkijono",
            e164: "E.164-luku",
            credit_card: "luottokortin numero",
            currency_code: "valuuttakoodi",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "templaattimerkkijono",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Virheellinen tyyppi: odotettiin instanceof ${issue.expected}, oli ${received}`;
                    }
                    return `Virheellinen tyyppi: odotettiin ${expected}, oli ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Virheellinen syöte: täytyy olla ${stringifyPrimitive(issue.values[0])}`;
                    return `Virheellinen valinta: täytyy olla yksi seuraavista: ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Liian suuri: ${sizing.subject} täytyy olla ${adj}${issue.maximum.toString()} ${sizing.unit}`.trim();
                    }
                    return `Liian suuri: arvon täytyy olla ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Liian pieni: ${sizing.subject} täytyy olla ${adj}${issue.minimum.toString()} ${sizing.unit}`.trim();
                    }
                    return `Liian pieni: arvon täytyy olla ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Virheellinen syöte: täytyy alkaa "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Virheellinen syöte: täytyy loppua "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Virheellinen syöte: täytyy sisältää "${_issue.includes}"`;
                    if (_issue.format === "regex") {
                        return `Virheellinen syöte: täytyy vastata säännöllistä lauseketta ${_issue.pattern}`;
                    }
                    return `Virheellinen ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Virheellinen luku: täytyy olla luvun ${issue.divisor} monikerta`;
                case "unrecognized_keys":
                    return `${issue.keys.length > 1 ? "Tuntemattomat avaimet" : "Tuntematon avain"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return "Virheellinen avain tietueessa";
                case "invalid_union":
                    return "Virheellinen unioni";
                case "invalid_element":
                    return "Virheellinen arvo joukossa";
                default:
                    return `Virheellinen syöte`;
            }
        };
    };
    function fi () {
        return {
            localeError: error$J(),
        };
    }

    const error$I = () => {
        const Sizable = {
            string: { unit: "caractères", verb: "avoir" },
            file: { unit: "octets", verb: "avoir" },
            array: { unit: "éléments", verb: "avoir" },
            set: { unit: "éléments", verb: "avoir" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "expression régulière",
            email: "adresse e-mail",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "date et heure ISO",
            date: "date ISO",
            time: "heure ISO",
            duration: "durée ISO",
            ipv4: "adresse IPv4",
            ipv6: "adresse IPv6",
            mac: "adresse MAC",
            cidrv4: "plage IPv4",
            cidrv6: "plage IPv6",
            base64: "chaîne de caractères encodée en base64",
            base64url: "chaîne de caractères encodée en base64url",
            json_string: "chaîne de caractères JSON",
            e164: "numéro au format E.164",
            credit_card: "numéro de carte de crédit",
            currency_code: "code de devise",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "entrée",
        };
        const TypeDictionary = {
            string: "chaîne de caractères",
            number: "nombre",
            int: "entier",
            boolean: "booléen",
            bigint: "grand entier",
            symbol: "symbole",
            undefined: "indéfini",
            null: "null",
            never: "jamais",
            void: "vide",
            date: "date",
            array: "tableau",
            object: "objet",
            tuple: "tuple",
            record: "record",
            map: "map",
            set: "ensemble",
            file: "fichier",
            nonoptional: "non optionnel",
            nan: "NaN",
            function: "fonction",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Entrée invalide : instance de ${issue.expected} attendu, ${received} reçu`;
                    }
                    return `Entrée invalide : ${expected} attendu, ${received} reçu`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Entrée invalide : ${stringifyPrimitive(issue.values[0])} attendu`;
                    return `Option invalide : une valeur parmi ${joinValues(issue.values, "|")} attendue`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Trop grand : ${TypeDictionary[issue.origin] ?? "valeur"} doit ${sizing.verb} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "élément(s)"}`;
                    return `Trop grand : ${TypeDictionary[issue.origin] ?? "valeur"} doit être ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Trop petit : ${TypeDictionary[issue.origin] ?? "valeur"} doit ${sizing.verb} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    return `Trop petit : ${TypeDictionary[issue.origin] ?? "valeur"} doit être ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Chaîne de caractères invalide : doit commencer par "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Chaîne de caractères invalide : doit se terminer par "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Chaîne de caractères invalide : doit inclure "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Chaîne de caractères invalide : doit correspondre au motif ${_issue.pattern}`;
                    return `${FormatDictionary[_issue.format] ?? issue.format} invalide`;
                }
                case "not_multiple_of":
                    return `Nombre invalide : doit être un multiple de ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Clé${issue.keys.length > 1 ? "s" : ""} non reconnue${issue.keys.length > 1 ? "s" : ""} : ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Clé invalide dans ${issue.origin}`;
                case "invalid_union":
                    return "Entrée invalide";
                case "invalid_element":
                    return `Valeur invalide dans ${issue.origin}`;
                default:
                    return `Entrée invalide`;
            }
        };
    };
    function fr () {
        return {
            localeError: error$I(),
        };
    }

    const error$H = () => {
        const Sizable = {
            string: { unit: "caractères", verb: "avoir" },
            file: { unit: "octets", verb: "avoir" },
            array: { unit: "éléments", verb: "avoir" },
            set: { unit: "éléments", verb: "avoir" },
            map: { unit: "éléments", verb: "avoir" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "entrée",
            email: "adresse courriel",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "date-heure ISO",
            date: "date ISO",
            time: "heure ISO",
            duration: "durée ISO",
            ipv4: "adresse IPv4",
            ipv6: "adresse IPv6",
            mac: "adresse MAC",
            cidrv4: "plage IPv4",
            cidrv6: "plage IPv6",
            base64: "chaîne encodée en base64",
            base64url: "chaîne encodée en base64url",
            json_string: "chaîne JSON",
            e164: "numéro E.164",
            credit_card: "numéro de carte de crédit",
            currency_code: "code de devise",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "entrée",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Entrée invalide : attendu instanceof ${issue.expected}, reçu ${received}`;
                    }
                    return `Entrée invalide : attendu ${expected}, reçu ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Entrée invalide : attendu ${stringifyPrimitive(issue.values[0])}`;
                    return `Option invalide : attendu l'une des valeurs suivantes ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "≤" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Trop grand : attendu que ${issue.origin ?? "la valeur"} ait ${adj}${issue.maximum.toString()} ${sizing.unit}`;
                    return `Trop grand : attendu que ${issue.origin ?? "la valeur"} soit ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? "≥" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Trop petit : attendu que ${issue.origin} ait ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Trop petit : attendu que ${issue.origin} soit ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `Chaîne invalide : doit commencer par "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `Chaîne invalide : doit se terminer par "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Chaîne invalide : doit inclure "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Chaîne invalide : doit correspondre au motif ${_issue.pattern}`;
                    return `${FormatDictionary[_issue.format] ?? issue.format} invalide`;
                }
                case "not_multiple_of":
                    return `Nombre invalide : doit être un multiple de ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Clé${issue.keys.length > 1 ? "s" : ""} non reconnue${issue.keys.length > 1 ? "s" : ""} : ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Clé invalide dans ${issue.origin}`;
                case "invalid_union":
                    return "Entrée invalide";
                case "invalid_element":
                    return `Valeur invalide dans ${issue.origin}`;
                default:
                    return `Entrée invalide`;
            }
        };
    };
    function frCA () {
        return {
            localeError: error$H(),
        };
    }

    const error$G = () => {
        const Sizable = {
            string: { unit: "અક્ષર", verb: "હોવા જોઈએ" },
            file: { unit: "બાયટ", verb: "હોવા જોઈએ" },
            array: { unit: "આઇટમ", verb: "હોવા જોઈએ" },
            set: { unit: "આઇટમ", verb: "હોવા જોઈએ" },
            map: { unit: "એન્ટ્રી", verb: "હોવા જોઈએ" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "ઇનપુટ",
            email: "ઈમેઇલ એડ્રેસ",
            url: "URL",
            emoji: "ઇમોજી",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO તારીખ અને સમય",
            date: "ISO તારીખ",
            time: "ISO સમય",
            duration: "ISO અવધિ",
            ipv4: "IPv4 એડ્રેસ",
            ipv6: "IPv6 એડ્રેસ",
            mac: "MAC એડ્રેસ",
            cidrv4: "IPv4 શ્રેણી",
            cidrv6: "IPv6 શ્રેણી",
            base64: "base64-એન્કોડેડ સ્ટ્રિંગ",
            base64url: "base64url-એન્કોડેડ સ્ટ્રિંગ",
            json_string: "JSON સ્ટ્રિંગ",
            e164: "E.164 નંબર",
            credit_card: "ક્રેડિટ કાર્ડ નંબર",
            currency_code: "ચલણ કોડ",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "ઇનપુટ",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    return `અમાન્ય ઇનપુટ: અપેક્ષિત ${expected}, પ્રાપ્ત ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `અમાન્ય ઇનપુટ: અપેક્ષિત ${stringifyPrimitive(issue.values[0])}`;
                    return `અમાન્ય વિકલ્પ: ${joinValues(issue.values, " | ")} માધ્યમથી એક અપેક્ષિત`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `ખૂબ મોટું: ${issue.origin ?? "મૂલ્ય"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "એલિમેન્ટ"} હોવા જોઈએ`;
                    return `ખૂબ મોટું: ${issue.origin ?? "મૂલ્ય"} ${adj}${issue.maximum.toString()} હોવું જોઈએ`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `ખૂબ નાનું: ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit} હોવા જોઈએ`;
                    }
                    return `ખૂબ નાનું: ${issue.origin} ${adj}${issue.minimum.toString()} હોવું જોઈએ`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `અમાન્ય સ્ટ્રિંગ: "${_issue.prefix}" થી શરૂ થવું જોઈએ`;
                    }
                    if (_issue.format === "ends_with")
                        return `અમાન્ય સ્ટ્રિંગ: "${_issue.suffix}" પર સમાપ્ત થવું જોઈએ`;
                    if (_issue.format === "includes")
                        return `અમાન્ય સ્ટ્રિંગ: "${_issue.includes}" શામેલ હોવું જોઈએ`;
                    if (_issue.format === "regex")
                        return `અમાન્ય સ્ટ્રિંગ: પેટર્ન ${_issue.pattern} સાથે મેળ ખાવું જોઈએ`;
                    return `અમાન્ય ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `અમાન્ય નંબર: ${issue.divisor} નો ગુણાંક હોવો જોઈએ`;
                case "unrecognized_keys":
                    return `ઓળખી શકાતા નહીં તે કી${issue.keys.length > 1 ? "ઓ" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `${issue.origin} માં અમાન્ય કી`;
                case "invalid_union":
                    if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
                        const opts = issue.options.map((o) => `'${o}'`).join(" | ");
                        return `અમાન્ય ડિસ્ક્રિમિનેટર મૂલ્ય. અપેક્ષિત ${opts}`;
                    }
                    return "અમાન્ય ઇનપુટ";
                case "invalid_element":
                    return `${issue.origin} માં અમાન્ય મૂલ્ય`;
                default:
                    return "અમાન્ય ઇનપુટ";
            }
        };
    };
    function gu () {
        return {
            localeError: error$G(),
        };
    }

    const error$F = () => {
        // Hebrew labels + grammatical gender
        const TypeNames = {
            string: { label: "מחרוזת", gender: "f" },
            number: { label: "מספר", gender: "m" },
            boolean: { label: "ערך בוליאני", gender: "m" },
            bigint: { label: "BigInt", gender: "m" },
            date: { label: "תאריך", gender: "m" },
            array: { label: "מערך", gender: "m" },
            object: { label: "אובייקט", gender: "m" },
            null: { label: "ערך ריק (null)", gender: "m" },
            undefined: { label: "ערך לא מוגדר (undefined)", gender: "m" },
            symbol: { label: "סימבול (Symbol)", gender: "m" },
            function: { label: "פונקציה", gender: "f" },
            map: { label: "מפה (Map)", gender: "f" },
            set: { label: "קבוצה (Set)", gender: "f" },
            file: { label: "קובץ", gender: "m" },
            promise: { label: "Promise", gender: "m" },
            NaN: { label: "NaN", gender: "m" },
            unknown: { label: "ערך לא ידוע", gender: "m" },
            value: { label: "ערך", gender: "m" },
        };
        // Sizing units for size-related messages + localized origin labels
        const Sizable = {
            string: { unit: "תווים", shortLabel: "קצר", longLabel: "ארוך" },
            file: { unit: "בייטים", shortLabel: "קטן", longLabel: "גדול" },
            array: { unit: "פריטים", shortLabel: "קטן", longLabel: "גדול" },
            set: { unit: "פריטים", shortLabel: "קטן", longLabel: "גדול" },
            number: { unit: "", shortLabel: "קטן", longLabel: "גדול" }, // no unit
        };
        // Helpers — labels, articles, and verbs
        const typeEntry = (t) => (t ? TypeNames[t] : undefined);
        const typeLabel = (t) => {
            const e = typeEntry(t);
            if (e)
                return e.label;
            // fallback: show raw string if unknown
            return t ?? TypeNames.unknown.label;
        };
        const withDefinite = (t) => `ה${typeLabel(t)}`;
        const verbFor = (t) => {
            const e = typeEntry(t);
            const gender = e?.gender ?? "m";
            return gender === "f" ? "צריכה להיות" : "צריך להיות";
        };
        const getSizing = (origin) => {
            if (!origin)
                return null;
            return Sizable[origin] ?? null;
        };
        const FormatDictionary = {
            regex: { label: "קלט", gender: "m" },
            email: { label: "כתובת אימייל", gender: "f" },
            url: { label: "כתובת רשת", gender: "f" },
            emoji: { label: "אימוג'י", gender: "m" },
            uuid: { label: "UUID", gender: "m" },
            uuidv4: { label: "UUIDv4", gender: "m" },
            uuidv6: { label: "UUIDv6", gender: "m" },
            nanoid: { label: "nanoid", gender: "m" },
            guid: { label: "GUID", gender: "m" },
            cuid: { label: "cuid", gender: "m" },
            cuid2: { label: "cuid2", gender: "m" },
            ulid: { label: "ULID", gender: "m" },
            xid: { label: "XID", gender: "m" },
            ksuid: { label: "KSUID", gender: "m" },
            datetime: { label: "תאריך וזמן ISO", gender: "m" },
            date: { label: "תאריך ISO", gender: "m" },
            time: { label: "זמן ISO", gender: "m" },
            duration: { label: "משך זמן ISO", gender: "m" },
            ipv4: { label: "כתובת IPv4", gender: "f" },
            ipv6: { label: "כתובת IPv6", gender: "f" },
            mac: { label: "כתובת MAC", gender: "f" },
            cidrv4: { label: "טווח IPv4", gender: "m" },
            cidrv6: { label: "טווח IPv6", gender: "m" },
            base64: { label: "מחרוזת בבסיס 64", gender: "f" },
            base64url: { label: "מחרוזת בבסיס 64 לכתובות רשת", gender: "f" },
            json_string: { label: "מחרוזת JSON", gender: "f" },
            e164: { label: "מספר E.164", gender: "m" },
            credit_card: { label: "מספר כרטיס אשראי", gender: "m" },
            currency_code: { label: "קוד מטבע", gender: "m" },
            iban: { label: "IBAN", gender: "m" },
            jwt: { label: "JWT", gender: "m" },
            template_literal: { label: "קלט", gender: "m" },
            ends_with: { label: "קלט", gender: "m" },
            includes: { label: "קלט", gender: "m" },
            lowercase: { label: "קלט", gender: "m" },
            starts_with: { label: "קלט", gender: "m" },
            uppercase: { label: "קלט", gender: "m" },
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    // Expected type: show without definite article for clearer Hebrew
                    const expectedKey = issue.expected;
                    const expected = TypeDictionary[expectedKey ?? ""] ?? typeLabel(expectedKey);
                    // Received: show localized label if known, otherwise constructor/raw
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? TypeNames[receivedType]?.label ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `קלט לא תקין: צריך להיות instanceof ${issue.expected}, התקבל ${received}`;
                    }
                    return `קלט לא תקין: צריך להיות ${expected}, התקבל ${received}`;
                }
                case "invalid_value": {
                    if (issue.values.length === 1) {
                        return `ערך לא תקין: הערך חייב להיות ${stringifyPrimitive(issue.values[0])}`;
                    }
                    // Join values with proper Hebrew formatting
                    const stringified = issue.values.map((v) => stringifyPrimitive(v));
                    if (issue.values.length === 2) {
                        return `ערך לא תקין: האפשרויות המתאימות הן ${stringified[0]} או ${stringified[1]}`;
                    }
                    // For 3+ values: "a", "b" או "c"
                    const lastValue = stringified[stringified.length - 1];
                    const restValues = stringified.slice(0, -1).join(", ");
                    return `ערך לא תקין: האפשרויות המתאימות הן ${restValues} או ${lastValue}`;
                }
                case "too_big": {
                    const sizing = getSizing(issue.origin);
                    const subject = withDefinite(issue.origin ?? "value");
                    if (issue.origin === "string") {
                        // Special handling for strings - more natural Hebrew
                        return `${sizing?.longLabel ?? "ארוך"} מדי: ${subject} צריכה להכיל ${issue.maximum.toString()} ${sizing?.unit ?? ""} ${issue.inclusive ? "או פחות" : "לכל היותר"}`.trim();
                    }
                    if (issue.origin === "number") {
                        // Natural Hebrew for numbers
                        const comparison = issue.inclusive ? `קטן או שווה ל-${issue.maximum}` : `קטן מ-${issue.maximum}`;
                        return `גדול מדי: ${subject} צריך להיות ${comparison}`;
                    }
                    if (issue.origin === "array" || issue.origin === "set") {
                        // Natural Hebrew for arrays and sets
                        const verb = issue.origin === "set" ? "צריכה" : "צריך";
                        const comparison = issue.inclusive
                            ? `${issue.maximum} ${sizing?.unit ?? ""} או פחות`
                            : `פחות מ-${issue.maximum} ${sizing?.unit ?? ""}`;
                        return `גדול מדי: ${subject} ${verb} להכיל ${comparison}`.trim();
                    }
                    const adj = issue.inclusive ? "<=" : "<";
                    const be = verbFor(issue.origin ?? "value");
                    if (sizing?.unit) {
                        return `${sizing.longLabel} מדי: ${subject} ${be} ${adj}${issue.maximum.toString()} ${sizing.unit}`;
                    }
                    return `${sizing?.longLabel ?? "גדול"} מדי: ${subject} ${be} ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const sizing = getSizing(issue.origin);
                    const subject = withDefinite(issue.origin ?? "value");
                    if (issue.origin === "string") {
                        // Special handling for strings - more natural Hebrew
                        return `${sizing?.shortLabel ?? "קצר"} מדי: ${subject} צריכה להכיל ${issue.minimum.toString()} ${sizing?.unit ?? ""} ${issue.inclusive ? "או יותר" : "לפחות"}`.trim();
                    }
                    if (issue.origin === "number") {
                        // Natural Hebrew for numbers
                        const comparison = issue.inclusive ? `גדול או שווה ל-${issue.minimum}` : `גדול מ-${issue.minimum}`;
                        return `קטן מדי: ${subject} צריך להיות ${comparison}`;
                    }
                    if (issue.origin === "array" || issue.origin === "set") {
                        // Natural Hebrew for arrays and sets
                        const verb = issue.origin === "set" ? "צריכה" : "צריך";
                        // Special case for singular (minimum === 1)
                        if (issue.minimum === 1 && issue.inclusive) {
                            const singularPhrase = issue.origin === "set" ? "לפחות פריט אחד" : "לפחות פריט אחד";
                            return `קטן מדי: ${subject} ${verb} להכיל ${singularPhrase}`;
                        }
                        const comparison = issue.inclusive
                            ? `${issue.minimum} ${sizing?.unit ?? ""} או יותר`
                            : `יותר מ-${issue.minimum} ${sizing?.unit ?? ""}`;
                        return `קטן מדי: ${subject} ${verb} להכיל ${comparison}`.trim();
                    }
                    const adj = issue.inclusive ? ">=" : ">";
                    const be = verbFor(issue.origin ?? "value");
                    if (sizing?.unit) {
                        return `${sizing.shortLabel} מדי: ${subject} ${be} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `${sizing?.shortLabel ?? "קטן"} מדי: ${subject} ${be} ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    // These apply to strings — use feminine grammar + ה׳ הידיעה
                    if (_issue.format === "starts_with")
                        return `המחרוזת חייבת להתחיל ב "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `המחרוזת חייבת להסתיים ב "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `המחרוזת חייבת לכלול "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `המחרוזת חייבת להתאים לתבנית ${_issue.pattern}`;
                    // Handle gender agreement for formats
                    const nounEntry = FormatDictionary[_issue.format];
                    const noun = nounEntry?.label ?? _issue.format;
                    const gender = nounEntry?.gender ?? "m";
                    const adjective = gender === "f" ? "תקינה" : "תקין";
                    return `${noun} לא ${adjective}`;
                }
                case "not_multiple_of":
                    return `מספר לא תקין: חייב להיות מכפלה של ${issue.divisor}`;
                case "unrecognized_keys":
                    return `מפתח${issue.keys.length > 1 ? "ות" : ""} לא מזוה${issue.keys.length > 1 ? "ים" : "ה"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key": {
                    return `שדה לא תקין באובייקט`;
                }
                case "invalid_union":
                    return "קלט לא תקין";
                case "invalid_element": {
                    const place = withDefinite(issue.origin ?? "array");
                    return `ערך לא תקין ב${place}`;
                }
                default:
                    return `קלט לא תקין`;
            }
        };
    };
    function he () {
        return {
            localeError: error$F(),
        };
    }

    const error$E = () => {
        const Sizable = {
            string: { unit: "अक्षर", verb: "रखने के लिए" },
            file: { unit: "बाइट्स", verb: "रखने के लिए" },
            array: { unit: "तत्व", verb: "रखने के लिए" },
            set: { unit: "तत्व", verb: "रखने के लिए" },
            map: { unit: "प्रविष्टियाँ", verb: "रखने के लिए" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "इनपुट",
            email: "ईमेल पता",
            url: "URL",
            emoji: "इमोजी",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO तिथि और समय",
            date: "ISO तिथि",
            time: "ISO समय",
            duration: "ISO अवधि",
            ipv4: "IPv4 पता",
            ipv6: "IPv6 पता",
            mac: "MAC पता",
            cidrv4: "IPv4 श्रेणी",
            cidrv6: "IPv6 श्रेणी",
            base64: "Base64-एन्कोडेड स्ट्रिंग",
            base64url: "Base64URL-एन्कोडेड स्ट्रिंग",
            json_string: "JSON स्ट्रिंग",
            e164: "E.164 संख्या",
            credit_card: "क्रेडिट कार्ड संख्या",
            currency_code: "मुद्रा कोड",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "इनपुट",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    return `अमान्य इनपुट: अपेक्षित ${expected}, प्राप्त ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `अमान्य इनपुट: अपेक्षित ${stringifyPrimitive(issue.values[0])}`;
                    return `अमान्य विकल्प: अपेक्षित मानों में से एक ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `बहुत बड़ा: अपेक्षित था कि ${issue.origin ?? "मान"} में ${adj}${issue.maximum} ${sizing.unit} हों`;
                    return `बहुत बड़ा: अपेक्षित था कि ${issue.origin ?? "मान"} ${adj}${issue.maximum} हो`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `बहुत छोटा: अपेक्षित था कि ${issue.origin} में ${adj}${issue.minimum} ${sizing.unit} हों`;
                    return `बहुत छोटा: अपेक्षित था कि ${issue.origin} ${adj}${issue.minimum} हो`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `अमान्य स्ट्रिंग: "${_issue.prefix}" से शुरू होना चाहिए`;
                    if (_issue.format === "ends_with")
                        return `अमान्य स्ट्रिंग: "${_issue.suffix}" पर समाप्त होना चाहिए`;
                    if (_issue.format === "includes")
                        return `अमान्य स्ट्रिंग: इसमें "${_issue.includes}" शामिल होना चाहिए`;
                    if (_issue.format === "regex")
                        return `अमान्य स्ट्रिंग: पैटर्न ${_issue.pattern} से मेल खाना चाहिए`;
                    return `अमान्य ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `अमान्य संख्या: यह ${issue.divisor} का गुणज होना चाहिए`;
                case "unrecognized_keys":
                    return `अपरिचित कुंजी${issue.keys.length > 1 ? "याँ" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `अमान्य कुंजी: ${issue.origin} में`;
                case "invalid_union":
                    if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
                        const opts = issue.options.map((o) => `'${o}'`).join(" | ");
                        return `अमान्य डिस्क्रिमिनेटर मान: अपेक्षित ${opts}`;
                    }
                    return "अमान्य इनपुट";
                case "invalid_element":
                    return `अमान्य मान: ${issue.origin} में`;
                default:
                    return `अमान्य इनपुट`;
            }
        };
    };
    function hi () {
        return {
            localeError: error$E(),
        };
    }

    const error$D = () => {
        const Sizable = {
            string: { unit: "znakova", verb: "imati" },
            file: { unit: "bajtova", verb: "imati" },
            array: { unit: "stavki", verb: "imati" },
            set: { unit: "stavki", verb: "imati" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "unos",
            email: "email adresa",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO datum i vrijeme",
            date: "ISO datum",
            time: "ISO vrijeme",
            duration: "ISO trajanje",
            ipv4: "IPv4 adresa",
            ipv6: "IPv6 adresa",
            mac: "MAC adresa",
            cidrv4: "IPv4 raspon",
            cidrv6: "IPv6 raspon",
            base64: "base64 kodirani tekst",
            base64url: "base64url kodirani tekst",
            json_string: "JSON tekst",
            e164: "E.164 broj",
            credit_card: "broj kreditne kartice",
            currency_code: "kod valute",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "unos",
        };
        const TypeDictionary = {
            nan: "NaN",
            string: "tekst",
            number: "broj",
            boolean: "boolean",
            array: "niz",
            object: "objekt",
            set: "skup",
            file: "datoteka",
            date: "datum",
            bigint: "bigint",
            symbol: "simbol",
            undefined: "undefined",
            null: "null",
            function: "funkcija",
            map: "mapa",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Neispravan unos: očekuje se instanceof ${issue.expected}, a primljeno je ${received}`;
                    }
                    return `Neispravan unos: očekuje se ${expected}, a primljeno je ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Neispravna vrijednost: očekivano ${stringifyPrimitive(issue.values[0])}`;
                    return `Neispravna opcija: očekivano jedno od ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    const origin = TypeDictionary[issue.origin] ?? issue.origin;
                    if (sizing)
                        return `Preveliko: očekivano da ${origin ?? "vrijednost"} ima ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elemenata"}`;
                    return `Preveliko: očekivano da ${origin ?? "vrijednost"} bude ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    const origin = TypeDictionary[issue.origin] ?? issue.origin;
                    if (sizing) {
                        return `Premalo: očekivano da ${origin} ima ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Premalo: očekivano da ${origin} bude ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Neispravan tekst: mora započinjati s "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Neispravan tekst: mora završavati s "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Neispravan tekst: mora sadržavati "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Neispravan tekst: mora odgovarati uzorku ${_issue.pattern}`;
                    return `Neispravna ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Neispravan broj: mora biti višekratnik od ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Neprepoznat${issue.keys.length > 1 ? "i ključevi" : " ključ"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Neispravan ključ u ${TypeDictionary[issue.origin] ?? issue.origin}`;
                case "invalid_union":
                    return "Neispravan unos";
                case "invalid_element":
                    return `Neispravna vrijednost u ${TypeDictionary[issue.origin] ?? issue.origin}`;
                default:
                    return `Neispravan unos`;
            }
        };
    };
    function hr () {
        return {
            localeError: error$D(),
        };
    }

    const error$C = () => {
        const Sizable = {
            string: { unit: "karakter", verb: "legyen" },
            file: { unit: "byte", verb: "legyen" },
            array: { unit: "elem", verb: "legyen" },
            set: { unit: "elem", verb: "legyen" },
            map: { unit: "elem", verb: "legyen" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "bemenet",
            email: "email cím",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO időbélyeg",
            date: "ISO dátum",
            time: "ISO idő",
            duration: "ISO időintervallum",
            ipv4: "IPv4 cím",
            ipv6: "IPv6 cím",
            mac: "MAC cím",
            cidrv4: "IPv4 tartomány",
            cidrv6: "IPv6 tartomány",
            base64: "base64-kódolt string",
            base64url: "base64url-kódolt string",
            json_string: "JSON string",
            e164: "E.164 szám",
            credit_card: "hitelkártyaszám",
            currency_code: "pénznemkód",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "bemenet",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "szám",
            array: "tömb",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Érvénytelen bemenet: a várt érték instanceof ${issue.expected}, a kapott érték ${received}`;
                    }
                    return `Érvénytelen bemenet: a várt érték ${expected}, a kapott érték ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Érvénytelen bemenet: a várt érték ${stringifyPrimitive(issue.values[0])}`;
                    return `Érvénytelen opció: valamelyik érték várt ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Túl nagy: ${issue.origin ?? "érték"} mérete túl nagy ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elem"}`;
                    return `Túl nagy: a bemeneti érték ${issue.origin ?? "érték"} túl nagy: ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Túl kicsi: a bemeneti érték ${issue.origin} mérete túl kicsi ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Túl kicsi: a bemeneti érték ${issue.origin} túl kicsi ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Érvénytelen string: "${_issue.prefix}" értékkel kell kezdődnie`;
                    if (_issue.format === "ends_with")
                        return `Érvénytelen string: "${_issue.suffix}" értékkel kell végződnie`;
                    if (_issue.format === "includes")
                        return `Érvénytelen string: "${_issue.includes}" értéket kell tartalmaznia`;
                    if (_issue.format === "regex")
                        return `Érvénytelen string: ${_issue.pattern} mintának kell megfelelnie`;
                    return `Érvénytelen ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Érvénytelen szám: ${issue.divisor} többszörösének kell lennie`;
                case "unrecognized_keys":
                    return `Ismeretlen kulcs${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Érvénytelen kulcs ${issue.origin}`;
                case "invalid_union":
                    return "Érvénytelen bemenet";
                case "invalid_element":
                    return `Érvénytelen érték: ${issue.origin}`;
                default:
                    return `Érvénytelen bemenet`;
            }
        };
    };
    function hu () {
        return {
            localeError: error$C(),
        };
    }

    function getArmenianPlural(count, one, many) {
        return Math.abs(count) === 1 ? one : many;
    }
    function withDefiniteArticle(word) {
        if (!word)
            return "";
        const vowels = ["ա", "ե", "ը", "ի", "ո", "ու", "օ"];
        const lastChar = word[word.length - 1];
        return word + (vowels.includes(lastChar) ? "ն" : "ը");
    }
    const error$B = () => {
        const Sizable = {
            string: {
                unit: {
                    one: "նշան",
                    many: "նշաններ",
                },
                verb: "ունենալ",
            },
            file: {
                unit: {
                    one: "բայթ",
                    many: "բայթեր",
                },
                verb: "ունենալ",
            },
            array: {
                unit: {
                    one: "տարր",
                    many: "տարրեր",
                },
                verb: "ունենալ",
            },
            set: {
                unit: {
                    one: "տարր",
                    many: "տարրեր",
                },
                verb: "ունենալ",
            },
            map: {
                unit: {
                    one: "տարր",
                    many: "տարրեր",
                },
                verb: "ունենալ",
            },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "մուտք",
            email: "էլ. հասցե",
            url: "URL",
            emoji: "էմոջի",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO ամսաթիվ և ժամ",
            date: "ISO ամսաթիվ",
            time: "ISO ժամ",
            duration: "ISO տևողություն",
            ipv4: "IPv4 հասցե",
            ipv6: "IPv6 հասցե",
            mac: "MAC հասցե",
            cidrv4: "IPv4 միջակայք",
            cidrv6: "IPv6 միջակայք",
            base64: "base64 ձևաչափով տող",
            base64url: "base64url ձևաչափով տող",
            json_string: "JSON տող",
            e164: "E.164 համար",
            credit_card: "կրեդիտ քարտի համար",
            currency_code: "արժույթի կոդ",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "մուտք",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "թիվ",
            array: "զանգված",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Սխալ մուտքագրում․ սպասվում էր instanceof ${issue.expected}, ստացվել է ${received}`;
                    }
                    return `Սխալ մուտքագրում․ սպասվում էր ${expected}, ստացվել է ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Սխալ մուտքագրում․ սպասվում էր ${stringifyPrimitive(issue.values[1])}`;
                    return `Սխալ տարբերակ․ սպասվում էր հետևյալներից մեկը՝ ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        const maxValue = Number(issue.maximum);
                        const unit = getArmenianPlural(maxValue, sizing.unit.one, sizing.unit.many);
                        return `Չափազանց մեծ արժեք․ սպասվում է, որ ${withDefiniteArticle(issue.origin ?? "արժեք")} կունենա ${adj}${issue.maximum.toString()} ${unit}`;
                    }
                    return `Չափազանց մեծ արժեք․ սպասվում է, որ ${withDefiniteArticle(issue.origin ?? "արժեք")} լինի ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        const minValue = Number(issue.minimum);
                        const unit = getArmenianPlural(minValue, sizing.unit.one, sizing.unit.many);
                        return `Չափազանց փոքր արժեք․ սպասվում է, որ ${withDefiniteArticle(issue.origin)} կունենա ${adj}${issue.minimum.toString()} ${unit}`;
                    }
                    return `Չափազանց փոքր արժեք․ սպասվում է, որ ${withDefiniteArticle(issue.origin)} լինի ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Սխալ տող․ պետք է սկսվի "${_issue.prefix}"-ով`;
                    if (_issue.format === "ends_with")
                        return `Սխալ տող․ պետք է ավարտվի "${_issue.suffix}"-ով`;
                    if (_issue.format === "includes")
                        return `Սխալ տող․ պետք է պարունակի "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Սխալ տող․ պետք է համապատասխանի ${_issue.pattern} ձևաչափին`;
                    return `Սխալ ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Սխալ թիվ․ պետք է բազմապատիկ լինի ${issue.divisor}-ի`;
                case "unrecognized_keys":
                    return `Չճանաչված բանալի${issue.keys.length > 1 ? "ներ" : ""}. ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Սխալ բանալի ${withDefiniteArticle(issue.origin)}-ում`;
                case "invalid_union":
                    return "Սխալ մուտքագրում";
                case "invalid_element":
                    return `Սխալ արժեք ${withDefiniteArticle(issue.origin)}-ում`;
                default:
                    return `Սխալ մուտքագրում`;
            }
        };
    };
    function hy () {
        return {
            localeError: error$B(),
        };
    }

    const error$A = () => {
        const Sizable = {
            string: { unit: "karakter", verb: "memiliki" },
            file: { unit: "byte", verb: "memiliki" },
            array: { unit: "item", verb: "memiliki" },
            set: { unit: "item", verb: "memiliki" },
            map: { unit: "item", verb: "memiliki" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "input",
            email: "alamat email",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "tanggal dan waktu format ISO",
            date: "tanggal format ISO",
            time: "jam format ISO",
            duration: "durasi format ISO",
            ipv4: "alamat IPv4",
            ipv6: "alamat IPv6",
            mac: "alamat MAC",
            cidrv4: "rentang alamat IPv4",
            cidrv6: "rentang alamat IPv6",
            base64: "string dengan enkode base64",
            base64url: "string dengan enkode base64url",
            json_string: "string JSON",
            e164: "angka E.164",
            credit_card: "nomor kartu kredit",
            currency_code: "kode mata uang",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "input",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Input tidak valid: diharapkan instanceof ${issue.expected}, diterima ${received}`;
                    }
                    return `Input tidak valid: diharapkan ${expected}, diterima ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Input tidak valid: diharapkan ${stringifyPrimitive(issue.values[0])}`;
                    return `Pilihan tidak valid: diharapkan salah satu dari ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Terlalu besar: diharapkan ${issue.origin ?? "value"} memiliki ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elemen"}`;
                    return `Terlalu besar: diharapkan ${issue.origin ?? "value"} menjadi ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Terlalu kecil: diharapkan ${issue.origin} memiliki ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Terlalu kecil: diharapkan ${issue.origin} menjadi ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `String tidak valid: harus dimulai dengan "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `String tidak valid: harus berakhir dengan "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `String tidak valid: harus menyertakan "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `String tidak valid: harus sesuai pola ${_issue.pattern}`;
                    return `${FormatDictionary[_issue.format] ?? issue.format} tidak valid`;
                }
                case "not_multiple_of":
                    return `Angka tidak valid: harus kelipatan dari ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Kunci tidak dikenali ${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Kunci tidak valid di ${issue.origin}`;
                case "invalid_union":
                    return "Input tidak valid";
                case "invalid_element":
                    return `Nilai tidak valid di ${issue.origin}`;
                default:
                    return `Input tidak valid`;
            }
        };
    };
    function id () {
        return {
            localeError: error$A(),
        };
    }

    const error$z = () => {
        const Sizable = {
            string: { unit: "stafi", verb: "að hafa" },
            file: { unit: "bæti", verb: "að hafa" },
            array: { unit: "hluti", verb: "að hafa" },
            set: { unit: "hluti", verb: "að hafa" },
            map: { unit: "hluti", verb: "að hafa" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "gildi",
            email: "netfang",
            url: "vefslóð",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO dagsetning og tími",
            date: "ISO dagsetning",
            time: "ISO tími",
            duration: "ISO tímalengd",
            ipv4: "IPv4 address",
            ipv6: "IPv6 address",
            mac: "MAC address",
            cidrv4: "IPv4 range",
            cidrv6: "IPv6 range",
            base64: "base64-encoded strengur",
            base64url: "base64url-encoded strengur",
            json_string: "JSON strengur",
            e164: "E.164 tölugildi",
            credit_card: "kreditkortanúmer",
            currency_code: "gjaldmiðilskóði",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "gildi",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "númer",
            array: "fylki",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Rangt gildi: Þú slóst inn ${received} þar sem á að vera instanceof ${issue.expected}`;
                    }
                    return `Rangt gildi: Þú slóst inn ${received} þar sem á að vera ${expected}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Rangt gildi: gert ráð fyrir ${stringifyPrimitive(issue.values[0])}`;
                    return `Ógilt val: má vera eitt af eftirfarandi ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Of stórt: gert er ráð fyrir að ${issue.origin ?? "gildi"} hafi ${adj}${issue.maximum.toString()} ${sizing.unit ?? "hluti"}`;
                    return `Of stórt: gert er ráð fyrir að ${issue.origin ?? "gildi"} sé ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Of lítið: gert er ráð fyrir að ${issue.origin} hafi ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Of lítið: gert er ráð fyrir að ${issue.origin} sé ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `Ógildur strengur: verður að byrja á "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `Ógildur strengur: verður að enda á "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Ógildur strengur: verður að innihalda "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Ógildur strengur: verður að fylgja mynstri ${_issue.pattern}`;
                    return `Rangt ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Röng tala: verður að vera margfeldi af ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Óþekkt ${issue.keys.length > 1 ? "ir lyklar" : "ur lykill"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Rangur lykill í ${issue.origin}`;
                case "invalid_union":
                    return "Rangt gildi";
                case "invalid_element":
                    return `Rangt gildi í ${issue.origin}`;
                default:
                    return `Rangt gildi`;
            }
        };
    };
    function is () {
        return {
            localeError: error$z(),
        };
    }

    const error$y = () => {
        const Sizable = {
            string: { unit: "caratteri", verb: "avere" },
            file: { unit: "byte", verb: "avere" },
            array: { unit: "elementi", verb: "avere" },
            set: { unit: "elementi", verb: "avere" },
            map: { unit: "elementi", verb: "avere" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "input",
            email: "indirizzo email",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "data e ora ISO",
            date: "data ISO",
            time: "ora ISO",
            duration: "durata ISO",
            ipv4: "indirizzo IPv4",
            ipv6: "indirizzo IPv6",
            mac: "indirizzo MAC",
            cidrv4: "intervallo IPv4",
            cidrv6: "intervallo IPv6",
            base64: "stringa codificata in base64",
            base64url: "URL codificata in base64",
            json_string: "stringa JSON",
            e164: "numero E.164",
            credit_card: "numero di carta di credito",
            currency_code: "codice valuta",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "input",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "numero",
            array: "vettore",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Input non valido: atteso instanceof ${issue.expected}, ricevuto ${received}`;
                    }
                    return `Input non valido: atteso ${expected}, ricevuto ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Input non valido: atteso ${stringifyPrimitive(issue.values[0])}`;
                    return `Opzione non valida: atteso uno tra ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Troppo grande: ${issue.origin ?? "valore"} deve avere ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementi"}`;
                    return `Troppo grande: ${issue.origin ?? "valore"} deve essere ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Troppo piccolo: ${issue.origin} deve avere ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Troppo piccolo: ${issue.origin} deve essere ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Stringa non valida: deve iniziare con "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Stringa non valida: deve terminare con "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Stringa non valida: deve includere "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Stringa non valida: deve corrispondere al pattern ${_issue.pattern}`;
                    return `Input non valido: ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Numero non valido: deve essere un multiplo di ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Chiav${issue.keys.length > 1 ? "i" : "e"} non riconosciut${issue.keys.length > 1 ? "e" : "a"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Chiave non valida in ${issue.origin}`;
                case "invalid_union":
                    return "Input non valido";
                case "invalid_element":
                    return `Valore non valido in ${issue.origin}`;
                default:
                    return `Input non valido`;
            }
        };
    };
    function it () {
        return {
            localeError: error$y(),
        };
    }

    const error$x = () => {
        const Sizable = {
            string: { unit: "文字", verb: "である" },
            file: { unit: "バイト", verb: "である" },
            array: { unit: "要素", verb: "である" },
            set: { unit: "要素", verb: "である" },
            map: { unit: "要素", verb: "である" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "入力値",
            email: "メールアドレス",
            url: "URL",
            emoji: "絵文字",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO日時",
            date: "ISO日付",
            time: "ISO時刻",
            duration: "ISO期間",
            ipv4: "IPv4アドレス",
            ipv6: "IPv6アドレス",
            mac: "MACアドレス",
            cidrv4: "IPv4範囲",
            cidrv6: "IPv6範囲",
            base64: "base64エンコード文字列",
            base64url: "base64urlエンコード文字列",
            json_string: "JSON文字列",
            e164: "E.164番号",
            credit_card: "クレジットカード番号",
            currency_code: "通貨コード",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "入力値",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "数値",
            array: "配列",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `無効な入力: instanceof ${issue.expected}が期待されましたが、${received}が入力されました`;
                    }
                    return `無効な入力: ${expected}が期待されましたが、${received}が入力されました`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `無効な入力: ${stringifyPrimitive(issue.values[0])}が期待されました`;
                    return `無効な選択: ${joinValues(issue.values, "、")}のいずれかである必要があります`;
                case "too_big": {
                    const adj = issue.inclusive ? "以下である" : "より小さい";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `大きすぎる値: ${issue.origin ?? "値"}は${issue.maximum.toString()}${sizing.unit ?? "要素"}${adj}必要があります`;
                    return `大きすぎる値: ${issue.origin ?? "値"}は${issue.maximum.toString()}${adj}必要があります`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? "以上である" : "より大きい";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `小さすぎる値: ${issue.origin}は${issue.minimum.toString()}${sizing.unit}${adj}必要があります`;
                    return `小さすぎる値: ${issue.origin}は${issue.minimum.toString()}${adj}必要があります`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `無効な文字列: "${_issue.prefix}"で始まる必要があります`;
                    if (_issue.format === "ends_with")
                        return `無効な文字列: "${_issue.suffix}"で終わる必要があります`;
                    if (_issue.format === "includes")
                        return `無効な文字列: "${_issue.includes}"を含む必要があります`;
                    if (_issue.format === "regex")
                        return `無効な文字列: パターン${_issue.pattern}に一致する必要があります`;
                    return `無効な${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `無効な数値: ${issue.divisor}の倍数である必要があります`;
                case "unrecognized_keys":
                    return `認識されていないキー${issue.keys.length > 1 ? "群" : ""}: ${joinValues(issue.keys, "、")}`;
                case "invalid_key":
                    return `${issue.origin}内の無効なキー`;
                case "invalid_union":
                    return "無効な入力";
                case "invalid_element":
                    return `${issue.origin}内の無効な値`;
                default:
                    return `無効な入力`;
            }
        };
    };
    function ja () {
        return {
            localeError: error$x(),
        };
    }

    const error$w = () => {
        const Sizable = {
            string: { unit: "სიმბოლო", verb: "უნდა შეიცავდეს" },
            file: { unit: "ბაიტი", verb: "უნდა შეიცავდეს" },
            array: { unit: "ელემენტი", verb: "უნდა შეიცავდეს" },
            set: { unit: "ელემენტი", verb: "უნდა შეიცავდეს" },
            map: { unit: "ელემენტი", verb: "უნდა შეიცავდეს" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "შეყვანა",
            email: "ელ-ფოსტის მისამართი",
            url: "URL",
            emoji: "ემოჯი",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "თარიღი-დრო",
            date: "თარიღი",
            time: "დრო",
            duration: "ხანგრძლივობა",
            ipv4: "IPv4 მისამართი",
            ipv6: "IPv6 მისამართი",
            mac: "MAC მისამართი",
            cidrv4: "IPv4 დიაპაზონი",
            cidrv6: "IPv6 დიაპაზონი",
            base64: "base64-კოდირებული ველი",
            base64url: "base64url-კოდირებული ველი",
            json_string: "JSON ველი",
            e164: "E.164 ნომერი",
            credit_card: "საკრედიტო ბარათის ნომერი",
            currency_code: "ვალუტის კოდი",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "შეყვანა",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "რიცხვი",
            string: "ველი",
            boolean: "ბულეანი",
            function: "ფუნქცია",
            array: "მასივი",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `არასწორი შეყვანა: მოსალოდნელი instanceof ${issue.expected}, მიღებული ${received}`;
                    }
                    return `არასწორი შეყვანა: მოსალოდნელი ${expected}, მიღებული ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `არასწორი შეყვანა: მოსალოდნელი ${stringifyPrimitive(issue.values[0])}`;
                    return `არასწორი ვარიანტი: მოსალოდნელია ერთ-ერთი ${joinValues(issue.values, "|")}-დან`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `ზედმეტად დიდი: მოსალოდნელი ${issue.origin ?? "მნიშვნელობა"} ${sizing.verb} ${adj}${issue.maximum.toString()} ${sizing.unit}`;
                    return `ზედმეტად დიდი: მოსალოდნელი ${issue.origin ?? "მნიშვნელობა"} იყოს ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `ზედმეტად პატარა: მოსალოდნელი ${issue.origin} ${sizing.verb} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `ზედმეტად პატარა: მოსალოდნელი ${issue.origin} იყოს ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `არასწორი ველი: უნდა იწყებოდეს "${_issue.prefix}"-ით`;
                    }
                    if (_issue.format === "ends_with")
                        return `არასწორი ველი: უნდა მთავრდებოდეს "${_issue.suffix}"-ით`;
                    if (_issue.format === "includes")
                        return `არასწორი ველი: უნდა შეიცავდეს "${_issue.includes}"-ს`;
                    if (_issue.format === "regex")
                        return `არასწორი ველი: უნდა შეესაბამებოდეს შაბლონს ${_issue.pattern}`;
                    return `არასწორი ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `არასწორი რიცხვი: უნდა იყოს ${issue.divisor}-ის ჯერადი`;
                case "unrecognized_keys":
                    return `უცნობი გასაღებ${issue.keys.length > 1 ? "ები" : "ი"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `არასწორი გასაღები ${issue.origin}-ში`;
                case "invalid_union":
                    return "არასწორი შეყვანა";
                case "invalid_element":
                    return `არასწორი მნიშვნელობა ${issue.origin}-ში`;
                default:
                    return `არასწორი შეყვანა`;
            }
        };
    };
    function ka () {
        return {
            localeError: error$w(),
        };
    }

    const error$v = () => {
        const Sizable = {
            string: { unit: "តួអក្សរ", verb: "គួរមាន" },
            file: { unit: "បៃ", verb: "គួរមាន" },
            array: { unit: "ធាតុ", verb: "គួរមាន" },
            set: { unit: "ធាតុ", verb: "គួរមាន" },
            map: { unit: "ធាតុ", verb: "គួរមាន" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "ទិន្នន័យបញ្ចូល",
            email: "អាសយដ្ឋានអ៊ីមែល",
            url: "URL",
            emoji: "សញ្ញាអារម្មណ៍",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "កាលបរិច្ឆេទ និងម៉ោង ISO",
            date: "កាលបរិច្ឆេទ ISO",
            time: "ម៉ោង ISO",
            duration: "រយៈពេល ISO",
            ipv4: "អាសយដ្ឋាន IPv4",
            ipv6: "អាសយដ្ឋាន IPv6",
            mac: "អាសយដ្ឋាន MAC",
            cidrv4: "ដែនអាសយដ្ឋាន IPv4",
            cidrv6: "ដែនអាសយដ្ឋាន IPv6",
            base64: "ខ្សែអក្សរអ៊ិកូដ base64",
            base64url: "ខ្សែអក្សរអ៊ិកូដ base64url",
            json_string: "ខ្សែអក្សរ JSON",
            e164: "លេខ E.164",
            credit_card: "លេខប័ណ្ណឥណទាន",
            currency_code: "កូដរូបិយប័ណ្ណ",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "ទិន្នន័យបញ្ចូល",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "លេខ",
            array: "អារេ (Array)",
            null: "គ្មានតម្លៃ (null)",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `ទិន្នន័យបញ្ចូលមិនត្រឹមត្រូវ៖ ត្រូវការ instanceof ${issue.expected} ប៉ុន្តែទទួលបាន ${received}`;
                    }
                    return `ទិន្នន័យបញ្ចូលមិនត្រឹមត្រូវ៖ ត្រូវការ ${expected} ប៉ុន្តែទទួលបាន ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `ទិន្នន័យបញ្ចូលមិនត្រឹមត្រូវ៖ ត្រូវការ ${stringifyPrimitive(issue.values[0])}`;
                    return `ជម្រើសមិនត្រឹមត្រូវ៖ ត្រូវជាមួយក្នុងចំណោម ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `ធំពេក៖ ត្រូវការ ${issue.origin ?? "តម្លៃ"} ${adj} ${issue.maximum.toString()} ${sizing.unit ?? "ធាតុ"}`;
                    return `ធំពេក៖ ត្រូវការ ${issue.origin ?? "តម្លៃ"} ${adj} ${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `តូចពេក៖ ត្រូវការ ${issue.origin} ${adj} ${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `តូចពេក៖ ត្រូវការ ${issue.origin} ${adj} ${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវចាប់ផ្តើមដោយ "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវបញ្ចប់ដោយ "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវមាន "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវតែផ្គូផ្គងនឹងទម្រង់ដែលបានកំណត់ ${_issue.pattern}`;
                    return `មិនត្រឹមត្រូវ៖ ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `លេខមិនត្រឹមត្រូវ៖ ត្រូវតែជាពហុគុណនៃ ${issue.divisor}`;
                case "unrecognized_keys":
                    return `រកឃើញសោមិនស្គាល់៖ ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `សោមិនត្រឹមត្រូវនៅក្នុង ${issue.origin}`;
                case "invalid_union":
                    return `ទិន្នន័យមិនត្រឹមត្រូវ`;
                case "invalid_element":
                    return `ទិន្នន័យមិនត្រឹមត្រូវនៅក្នុង ${issue.origin}`;
                default:
                    return `ទិន្នន័យមិនត្រឹមត្រូវ`;
            }
        };
    };
    function km () {
        return {
            localeError: error$v(),
        };
    }

    /** @deprecated Use `km` instead. */
    function kh () {
        return km();
    }

    const error$u = () => {
        const Sizable = {
            string: { unit: "ಅಕ್ಷರಗಳು", verb: "ಹೊಂದಲು" },
            file: { unit: "ಬೈಟ್‌ಗಳು", verb: "ಹೊಂದಲು" },
            array: { unit: "ವಸ್ತುಗಳು", verb: "ಹೊಂದಲು" },
            set: { unit: "ವಸ್ತುಗಳು", verb: "ಹೊಂದಲು" },
            map: { unit: "entries", verb: "ಹೊಂದಲು" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "ಇನ್ಪುಟ್",
            email: "email ವಿಳಾಸ",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO ದಿನಾಂಕದ ಸಮಯ",
            date: "ISO ದಿನಾಂಕ",
            time: "ISO ಸಮಯ",
            duration: "ISO ಅವಧಿ",
            ipv4: "IPv4 ವಿಳಾಸ",
            ipv6: "IPv6 ವಿಳಾಸ",
            mac: "MAC ವಿಳಾಸ",
            cidrv4: "IPv4 ವ್ಯಾಪ್ತಿಯ",
            cidrv6: "IPv6 ವ್ಯಾಪ್ತಿಯ",
            base64: "base64-encodedಸ್ಟ್ರಿಂಗ್",
            base64url: "base64url-encodedಸ್ಟ್ರಿಂಗ್",
            json_string: "JSONಸ್ಟ್ರಿಂಗ್",
            e164: "E.164 ಸಂಖ್ಯೆ",
            credit_card: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಸಂಖ್ಯೆ",
            currency_code: "ಕರೆನ್ಸಿ ಕೋಡ್",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "ಇನ್ಪುಟ್",
        };
        // type names: missing keys = do not translate (use raw value via ?? fallback)
        const TypeDictionary = {
            // Compatibility: "nan" -> "NaN" for display
            nan: "NaN",
            // All other type names omitted - they fall back to raw values via ?? operator
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    return `ಅಮಾನ್ಯ ಇನ್‌ಪುಟ್: ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ ${expected}, ಸ್ವೀಕರಿಸಿದನು ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `ಅಮಾನ್ಯ ಇನ್‌ಪುಟ್: ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ ${stringifyPrimitive(issue.values[0])}`;
                    return `ಅಮಾನ್ಯ ಆಯ್ಕೆ: ಇವುಗಳಲ್ಲಿ ಒಂದನ್ನು ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `ತುಂಬಾ ದೊಡ್ಡದು: ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ ${issue.origin ?? "value"} ಹೊಂದಲು ${adj}${issue.maximum.toString()} ${sizing.unit ?? "ಅಂಶಗಳು"}`;
                    return `ತುಂಬಾ ದೊಡ್ಡದು: ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ ${issue.origin ?? "value"} ಎಂದು ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `ತುಂಬಾ ಚಿಕ್ಕದು: ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ ${issue.origin} ಹೊಂದಲು ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `ತುಂಬಾ ಚಿಕ್ಕದು: ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ ${issue.origin} ಎಂದು ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `ಅಮಾನ್ಯವಾದ ಸ್ಟ್ರಿಂಗ್: ಇದರೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಬೇಕು "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `ಅಮಾನ್ಯವಾದ ಸ್ಟ್ರಿಂಗ್: ಇದರೊಂದಿಗೆ ಕೊನೆಗೊಳ್ಳಬೇಕು "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `ಅಮಾನ್ಯ ಸ್ಟ್ರಿಂಗ್: ಒಳಗೊಂಡಿರಬೇಕು "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `ಅಮಾನ್ಯವಾದ ಸ್ಟ್ರಿಂಗ್: ಮಾದರಿಗೆ ಹೊಂದಿಕೆಯಾಗಬೇಕು ${_issue.pattern}`;
                    return `ಅಮಾನ್ಯ ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `ಅಮಾನ್ಯ ಸಂಖ್ಯೆ: ಬಹುಸಂಖ್ಯೆಯಾಗಿರಬೇಕು ${issue.divisor}`;
                case "unrecognized_keys":
                    return `ಗುರುತಿಸಲಾಗದ ಕೀ ${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `ಅಮಾನ್ಯವಾದ ಕೀ ಇನ್ ${issue.origin}`;
                case "invalid_union":
                    if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
                        const opts = issue.options.map((o) => `'${o}'`).join(" | ");
                        return `ಅಮಾನ್ಯ ತಾರತಮ್ಯ ಮೌಲ್ಯ. ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ ${opts}`;
                    }
                    return "ಅಮಾನ್ಯ ಇನ್‌ಪುಟ್";
                case "invalid_element":
                    return `ರಲ್ಲಿ ಅಮಾನ್ಯ ಮೌಲ್ಯ ${issue.origin}`;
                default:
                    return `ಅಮಾನ್ಯ ಇನ್‌ಪುಟ್`;
            }
        };
    };
    function kn () {
        return {
            localeError: error$u(),
        };
    }

    const error$t = () => {
        const Sizable = {
            string: { unit: "문자", verb: "to have" },
            file: { unit: "바이트", verb: "to have" },
            array: { unit: "개", verb: "to have" },
            set: { unit: "개", verb: "to have" },
            map: { unit: "개", verb: "to have" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "입력",
            email: "이메일 주소",
            url: "URL",
            emoji: "이모지",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO 날짜시간",
            date: "ISO 날짜",
            time: "ISO 시간",
            duration: "ISO 기간",
            ipv4: "IPv4 주소",
            ipv6: "IPv6 주소",
            mac: "MAC 주소",
            cidrv4: "IPv4 범위",
            cidrv6: "IPv6 범위",
            base64: "base64 인코딩 문자열",
            base64url: "base64url 인코딩 문자열",
            json_string: "JSON 문자열",
            e164: "E.164 번호",
            credit_card: "신용카드 번호",
            currency_code: "통화 코드",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "입력",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `잘못된 입력: 예상 타입은 instanceof ${issue.expected}, 받은 타입은 ${received}입니다`;
                    }
                    return `잘못된 입력: 예상 타입은 ${expected}, 받은 타입은 ${received}입니다`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `잘못된 입력: 값은 ${stringifyPrimitive(issue.values[0])} 이어야 합니다`;
                    return `잘못된 옵션: ${joinValues(issue.values, "또는 ")} 중 하나여야 합니다`;
                case "too_big": {
                    const adj = issue.inclusive ? "이하" : "미만";
                    const suffix = adj === "미만" ? "이어야 합니다" : "여야 합니다";
                    const sizing = getSizing(issue.origin);
                    const unit = sizing?.unit ?? "요소";
                    if (sizing)
                        return `${issue.origin ?? "값"}이 너무 큽니다: ${issue.maximum.toString()}${unit} ${adj}${suffix}`;
                    return `${issue.origin ?? "값"}이 너무 큽니다: ${issue.maximum.toString()} ${adj}${suffix}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? "이상" : "초과";
                    const suffix = adj === "이상" ? "이어야 합니다" : "여야 합니다";
                    const sizing = getSizing(issue.origin);
                    const unit = sizing?.unit ?? "요소";
                    if (sizing) {
                        return `${issue.origin ?? "값"}이 너무 작습니다: ${issue.minimum.toString()}${unit} ${adj}${suffix}`;
                    }
                    return `${issue.origin ?? "값"}이 너무 작습니다: ${issue.minimum.toString()} ${adj}${suffix}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `잘못된 문자열: "${_issue.prefix}"(으)로 시작해야 합니다`;
                    }
                    if (_issue.format === "ends_with")
                        return `잘못된 문자열: "${_issue.suffix}"(으)로 끝나야 합니다`;
                    if (_issue.format === "includes")
                        return `잘못된 문자열: "${_issue.includes}"을(를) 포함해야 합니다`;
                    if (_issue.format === "regex")
                        return `잘못된 문자열: 정규식 ${_issue.pattern} 패턴과 일치해야 합니다`;
                    return `잘못된 ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `잘못된 숫자: ${issue.divisor}의 배수여야 합니다`;
                case "unrecognized_keys":
                    return `인식할 수 없는 키: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `잘못된 키: ${issue.origin}`;
                case "invalid_union":
                    return `잘못된 입력`;
                case "invalid_element":
                    return `잘못된 값: ${issue.origin}`;
                default:
                    return `잘못된 입력`;
            }
        };
    };
    function ko () {
        return {
            localeError: error$t(),
        };
    }

    const capitalizeFirstCharacter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };
    function getUnitTypeFromNumber(number) {
        const abs = Math.abs(number);
        const last = abs % 10;
        const last2 = abs % 100;
        if ((last2 >= 11 && last2 <= 19) || last === 0)
            return "many";
        if (last === 1)
            return "one";
        return "few";
    }
    const error$s = () => {
        const Sizable = {
            string: {
                unit: {
                    one: "simbolis",
                    few: "simboliai",
                    many: "simbolių",
                },
                verb: {
                    smaller: {
                        inclusive: "turi būti ne ilgesnė kaip",
                        notInclusive: "turi būti trumpesnė kaip",
                    },
                    bigger: {
                        inclusive: "turi būti ne trumpesnė kaip",
                        notInclusive: "turi būti ilgesnė kaip",
                    },
                },
            },
            file: {
                unit: {
                    one: "baitas",
                    few: "baitai",
                    many: "baitų",
                },
                verb: {
                    smaller: {
                        inclusive: "turi būti ne didesnis kaip",
                        notInclusive: "turi būti mažesnis kaip",
                    },
                    bigger: {
                        inclusive: "turi būti ne mažesnis kaip",
                        notInclusive: "turi būti didesnis kaip",
                    },
                },
            },
            array: {
                unit: {
                    one: "elementą",
                    few: "elementus",
                    many: "elementų",
                },
                verb: {
                    smaller: {
                        inclusive: "turi turėti ne daugiau kaip",
                        notInclusive: "turi turėti mažiau kaip",
                    },
                    bigger: {
                        inclusive: "turi turėti ne mažiau kaip",
                        notInclusive: "turi turėti daugiau kaip",
                    },
                },
            },
            set: {
                unit: {
                    one: "elementą",
                    few: "elementus",
                    many: "elementų",
                },
                verb: {
                    smaller: {
                        inclusive: "turi turėti ne daugiau kaip",
                        notInclusive: "turi turėti mažiau kaip",
                    },
                    bigger: {
                        inclusive: "turi turėti ne mažiau kaip",
                        notInclusive: "turi turėti daugiau kaip",
                    },
                },
            },
        };
        function getSizing(origin, unitType, inclusive, targetShouldBe) {
            const result = Sizable[origin] ?? null;
            if (result === null)
                return result;
            return {
                unit: result.unit[unitType],
                verb: result.verb[targetShouldBe][inclusive ? "inclusive" : "notInclusive"],
            };
        }
        const FormatDictionary = {
            regex: "įvestis",
            email: "el. pašto adresas",
            url: "URL",
            emoji: "jaustukas",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO data ir laikas",
            date: "ISO data",
            time: "ISO laikas",
            duration: "ISO trukmė",
            ipv4: "IPv4 adresas",
            ipv6: "IPv6 adresas",
            mac: "MAC adresas",
            cidrv4: "IPv4 tinklo prefiksas (CIDR)",
            cidrv6: "IPv6 tinklo prefiksas (CIDR)",
            base64: "base64 užkoduota eilutė",
            base64url: "base64url užkoduota eilutė",
            json_string: "JSON eilutė",
            e164: "E.164 numeris",
            credit_card: "kredito kortelės numeris",
            currency_code: "valiutos kodas",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "įvestis",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "skaičius",
            bigint: "sveikasis skaičius",
            string: "eilutė",
            boolean: "loginė reikšmė",
            undefined: "neapibrėžta reikšmė",
            function: "funkcija",
            symbol: "simbolis",
            array: "masyvas",
            object: "objektas",
            null: "nulinė reikšmė",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Gautas tipas ${received}, o tikėtasi - instanceof ${issue.expected}`;
                    }
                    return `Gautas tipas ${received}, o tikėtasi - ${expected}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Privalo būti ${stringifyPrimitive(issue.values[0])}`;
                    return `Privalo būti vienas iš ${joinValues(issue.values, "|")} pasirinkimų`;
                case "too_big": {
                    const origin = TypeDictionary[issue.origin] ?? issue.origin;
                    const sizing = getSizing(issue.origin, getUnitTypeFromNumber(Number(issue.maximum)), issue.inclusive ?? false, "smaller");
                    if (sizing?.verb)
                        return `${capitalizeFirstCharacter(origin ?? issue.origin ?? "reikšmė")} ${sizing.verb} ${issue.maximum.toString()} ${sizing.unit ?? "elementų"}`;
                    const adj = issue.inclusive ? "ne didesnis kaip" : "mažesnis kaip";
                    return `${capitalizeFirstCharacter(origin ?? issue.origin ?? "reikšmė")} turi būti ${adj} ${issue.maximum.toString()} ${sizing?.unit}`;
                }
                case "too_small": {
                    const origin = TypeDictionary[issue.origin] ?? issue.origin;
                    const sizing = getSizing(issue.origin, getUnitTypeFromNumber(Number(issue.minimum)), issue.inclusive ?? false, "bigger");
                    if (sizing?.verb)
                        return `${capitalizeFirstCharacter(origin ?? issue.origin ?? "reikšmė")} ${sizing.verb} ${issue.minimum.toString()} ${sizing.unit ?? "elementų"}`;
                    const adj = issue.inclusive ? "ne mažesnis kaip" : "didesnis kaip";
                    return `${capitalizeFirstCharacter(origin ?? issue.origin ?? "reikšmė")} turi būti ${adj} ${issue.minimum.toString()} ${sizing?.unit}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `Eilutė privalo prasidėti "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `Eilutė privalo pasibaigti "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Eilutė privalo įtraukti "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Eilutė privalo atitikti ${_issue.pattern}`;
                    return `Neteisingas ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Skaičius privalo būti ${issue.divisor} kartotinis.`;
                case "unrecognized_keys":
                    return `Neatpažint${issue.keys.length > 1 ? "i" : "as"} rakt${issue.keys.length > 1 ? "ai" : "as"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return "Rastas klaidingas raktas";
                case "invalid_union":
                    return "Klaidinga įvestis";
                case "invalid_element": {
                    const origin = TypeDictionary[issue.origin] ?? issue.origin;
                    return `${capitalizeFirstCharacter(origin ?? issue.origin ?? "reikšmė")} turi klaidingą įvestį`;
                }
                default:
                    return "Klaidinga įvestis";
            }
        };
    };
    function lt () {
        return {
            localeError: error$s(),
        };
    }

    const error$r = () => {
        const Sizable = {
            string: { unit: "знаци", verb: "да имаат" },
            file: { unit: "бајти", verb: "да имаат" },
            array: { unit: "ставки", verb: "да имаат" },
            set: { unit: "ставки", verb: "да имаат" },
            map: { unit: "ставки", verb: "да имаат" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "внес",
            email: "адреса на е-пошта",
            url: "URL",
            emoji: "емоџи",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO датум и време",
            date: "ISO датум",
            time: "ISO време",
            duration: "ISO времетраење",
            ipv4: "IPv4 адреса",
            ipv6: "IPv6 адреса",
            mac: "MAC адреса",
            cidrv4: "IPv4 опсег",
            cidrv6: "IPv6 опсег",
            base64: "base64-енкодирана низа",
            base64url: "base64url-енкодирана низа",
            json_string: "JSON низа",
            e164: "E.164 број",
            credit_card: "број на кредитна картичка",
            currency_code: "код на валута",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "внес",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "број",
            array: "низа",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Грешен внес: се очекува instanceof ${issue.expected}, примено ${received}`;
                    }
                    return `Грешен внес: се очекува ${expected}, примено ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Invalid input: expected ${stringifyPrimitive(issue.values[0])}`;
                    return `Грешана опција: се очекува една ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Премногу голем: се очекува ${issue.origin ?? "вредноста"} да има ${adj}${issue.maximum.toString()} ${sizing.unit ?? "елементи"}`;
                    return `Премногу голем: се очекува ${issue.origin ?? "вредноста"} да биде ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Премногу мал: се очекува ${issue.origin} да има ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Премногу мал: се очекува ${issue.origin} да биде ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `Неважечка низа: мора да започнува со "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `Неважечка низа: мора да завршува со "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Неважечка низа: мора да вклучува "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Неважечка низа: мора да одгоара на патернот ${_issue.pattern}`;
                    return `Invalid ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Грешен број: мора да биде делив со ${issue.divisor}`;
                case "unrecognized_keys":
                    return `${issue.keys.length > 1 ? "Непрепознаени клучеви" : "Непрепознаен клуч"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Грешен клуч во ${issue.origin}`;
                case "invalid_union":
                    return "Грешен внес";
                case "invalid_element":
                    return `Грешна вредност во ${issue.origin}`;
                default:
                    return `Грешен внес`;
            }
        };
    };
    function mk () {
        return {
            localeError: error$r(),
        };
    }

    const error$q = () => {
        const Sizable = {
            string: { unit: "aksara", verb: "mempunyai" },
            file: { unit: "bait", verb: "mempunyai" },
            array: { unit: "elemen", verb: "mempunyai" },
            set: { unit: "elemen", verb: "mempunyai" },
            map: { unit: "elemen", verb: "mempunyai" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "input",
            email: "alamat e-mel",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "tarikh masa ISO",
            date: "tarikh ISO",
            time: "masa ISO",
            duration: "tempoh ISO",
            ipv4: "alamat IPv4",
            ipv6: "alamat IPv6",
            mac: "alamat MAC",
            cidrv4: "julat IPv4",
            cidrv6: "julat IPv6",
            base64: "string dikodkan base64",
            base64url: "string dikodkan base64url",
            json_string: "string JSON",
            e164: "nombor E.164",
            credit_card: "nombor kad kredit",
            currency_code: "kod mata wang",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "input",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "nombor",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Input tidak sah: dijangka instanceof ${issue.expected}, diterima ${received}`;
                    }
                    return `Input tidak sah: dijangka ${expected}, diterima ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Input tidak sah: dijangka ${stringifyPrimitive(issue.values[0])}`;
                    return `Pilihan tidak sah: dijangka salah satu daripada ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Terlalu besar: dijangka ${issue.origin ?? "nilai"} ${sizing.verb} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elemen"}`;
                    return `Terlalu besar: dijangka ${issue.origin ?? "nilai"} adalah ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Terlalu kecil: dijangka ${issue.origin} ${sizing.verb} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Terlalu kecil: dijangka ${issue.origin} adalah ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `String tidak sah: mesti bermula dengan "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `String tidak sah: mesti berakhir dengan "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `String tidak sah: mesti mengandungi "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `String tidak sah: mesti sepadan dengan corak ${_issue.pattern}`;
                    return `${FormatDictionary[_issue.format] ?? issue.format} tidak sah`;
                }
                case "not_multiple_of":
                    return `Nombor tidak sah: perlu gandaan ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Kunci tidak dikenali: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Kunci tidak sah dalam ${issue.origin}`;
                case "invalid_union":
                    return "Input tidak sah";
                case "invalid_element":
                    return `Nilai tidak sah dalam ${issue.origin}`;
                default:
                    return `Input tidak sah`;
            }
        };
    };
    function ms () {
        return {
            localeError: error$q(),
        };
    }

    const error$p = () => {
        const Sizable = {
            string: { unit: "अक्षर", verb: "हुनुपर्छ" },
            file: { unit: "बाइट", verb: "हुनुपर्छ" },
            array: { unit: "तत्व", verb: "हुनुपर्छ" },
            set: { unit: "तत्व", verb: "हुनुपर्छ" },
            map: { unit: "प्रविष्टि", verb: "हुनुपर्छ" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "इनपुट",
            email: "इमेल ठेगाना",
            url: "URL",
            emoji: "इमोजी",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO मिति र समय",
            date: "ISO मिति",
            time: "ISO समय",
            duration: "ISO अवधि",
            ipv4: "IPv4 ठेगाना",
            ipv6: "IPv6 ठेगाना",
            mac: "MAC ठेगाना",
            cidrv4: "IPv4 दायरा",
            cidrv6: "IPv6 दायरा",
            base64: "base64-इन्कोड गरिएको स्ट्रिङ",
            base64url: "base64url-इन्कोड गरिएको स्ट्रिङ",
            json_string: "JSON स्ट्रिङ",
            e164: "E.164 नम्बर",
            credit_card: "क्रेडिट कार्ड नम्बर",
            currency_code: "मुद्रा कोड",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "इनपुट",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    return `अमान्य इनपुट: अपेक्षित ${expected}, प्राप्त ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `अमान्य इनपुट: अपेक्षित ${stringifyPrimitive(issue.values[0])}`;
                    return `अमान्य विकल्प: अपेक्षित मानहरू मध्ये एक ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `धेरै ठूलो: ${issue.origin ?? "मान"} मा ${adj}${issue.maximum.toString()} ${sizing.unit} ${sizing.verb}`;
                    return `धेरै ठूलो: ${issue.origin ?? "मान"} ${adj}${issue.maximum.toString()} हुनुपर्छ`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `धेरै सानो: ${issue.origin} मा ${adj}${issue.minimum.toString()} ${sizing.unit} ${sizing.verb}`;
                    return `धेरै सानो: ${issue.origin} ${adj}${issue.minimum.toString()} हुनुपर्छ`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `अमान्य स्ट्रिङ: "${_issue.prefix}" बाट सुरु हुनुपर्छ`;
                    if (_issue.format === "ends_with")
                        return `अमान्य स्ट्रिङ: "${_issue.suffix}" मा समाप्त हुनुपर्छ`;
                    if (_issue.format === "includes")
                        return `अमान्य स्ट्रिङ: "${_issue.includes}" समावेश हुनुपर्छ`;
                    if (_issue.format === "regex")
                        return `अमान्य स्ट्रिङ: ढाँचा ${_issue.pattern} सँग मेल खानुपर्छ`;
                    return `अमान्य ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `अमान्य संख्या: ${issue.divisor} को गुणज हुनुपर्छ`;
                case "unrecognized_keys":
                    return `अपरिचित कुञ्जी${issue.keys.length > 1 ? "हरू" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `अमान्य कुञ्जी: ${issue.origin} मा`;
                case "invalid_union":
                    if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
                        const opts = issue.options.map((o) => `'${o}'`).join(" | ");
                        return `अमान्य डिस्क्रिमिनेटर मान: अपेक्षित ${opts}`;
                    }
                    return "अमान्य इनपुट";
                case "invalid_element":
                    return `अमान्य मान: ${issue.origin} मा`;
                default:
                    return `अमान्य इनपुट`;
            }
        };
    };
    function ne () {
        return {
            localeError: error$p(),
        };
    }

    const error$o = () => {
        const Sizable = {
            string: { unit: "tekens", verb: "heeft" },
            file: { unit: "bytes", verb: "heeft" },
            array: { unit: "elementen", verb: "heeft" },
            set: { unit: "elementen", verb: "heeft" },
            map: { unit: "elementen", verb: "heeft" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "invoer",
            email: "emailadres",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO datum en tijd",
            date: "ISO datum",
            time: "ISO tijd",
            duration: "ISO duur",
            ipv4: "IPv4-adres",
            ipv6: "IPv6-adres",
            mac: "MAC-adres",
            cidrv4: "IPv4-bereik",
            cidrv6: "IPv6-bereik",
            base64: "base64-gecodeerde tekst",
            base64url: "base64 URL-gecodeerde tekst",
            json_string: "JSON string",
            e164: "E.164-nummer",
            credit_card: "creditcardnummer",
            currency_code: "valutacode",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "invoer",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "getal",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Ongeldige invoer: verwacht instanceof ${issue.expected}, ontving ${received}`;
                    }
                    return `Ongeldige invoer: verwacht ${expected}, ontving ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Ongeldige invoer: verwacht ${stringifyPrimitive(issue.values[0])}`;
                    return `Ongeldige optie: verwacht één van ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    const longName = issue.origin === "date" ? "laat" : issue.origin === "string" ? "lang" : "groot";
                    if (sizing)
                        return `Te ${longName}: verwacht dat ${issue.origin ?? "waarde"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementen"} ${sizing.verb}`;
                    return `Te ${longName}: verwacht dat ${issue.origin ?? "waarde"} ${adj}${issue.maximum.toString()} is`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    const shortName = issue.origin === "date" ? "vroeg" : issue.origin === "string" ? "kort" : "klein";
                    if (sizing) {
                        return `Te ${shortName}: verwacht dat ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit} ${sizing.verb}`;
                    }
                    return `Te ${shortName}: verwacht dat ${issue.origin} ${adj}${issue.minimum.toString()} is`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `Ongeldige tekst: moet met "${_issue.prefix}" beginnen`;
                    }
                    if (_issue.format === "ends_with")
                        return `Ongeldige tekst: moet op "${_issue.suffix}" eindigen`;
                    if (_issue.format === "includes")
                        return `Ongeldige tekst: moet "${_issue.includes}" bevatten`;
                    if (_issue.format === "regex")
                        return `Ongeldige tekst: moet overeenkomen met patroon ${_issue.pattern}`;
                    return `Ongeldig: ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Ongeldig getal: moet een veelvoud van ${issue.divisor} zijn`;
                case "unrecognized_keys":
                    return `Onbekende key${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Ongeldige key in ${issue.origin}`;
                case "invalid_union":
                    return "Ongeldige invoer";
                case "invalid_element":
                    return `Ongeldige waarde in ${issue.origin}`;
                default:
                    return `Ongeldige invoer`;
            }
        };
    };
    function nl () {
        return {
            localeError: error$o(),
        };
    }

    const error$n = () => {
        const Sizable = {
            string: { unit: "teikn", verb: "å ha" },
            file: { unit: "bytes", verb: "å ha" },
            array: { unit: "element", verb: "å innehalde" },
            set: { unit: "element", verb: "å innehalde" },
            map: { unit: "element", verb: "å innehalde" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "input",
            email: "e-postadresse",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO dato- og klokkeslett",
            date: "ISO-dato",
            time: "ISO-klokkeslett",
            duration: "ISO-varigheit",
            ipv4: "IPv4-adresse",
            ipv6: "IPv6-adresse",
            mac: "MAC-adresse",
            cidrv4: "IPv4-spekter",
            cidrv6: "IPv6-spekter",
            base64: "base64-enkoda streng",
            base64url: "base64url-enkoda streng",
            json_string: "JSON-streng",
            e164: "E.164-nummer",
            credit_card: "kredittkortnummer",
            currency_code: "valutakode",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "input",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "tal",
            array: "liste",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Ugyldig input: forventa instanceof ${issue.expected}, fekk ${received}`;
                    }
                    return `Ugyldig input: forventa ${expected}, fekk ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Ugyldig verdi: forventa ${stringifyPrimitive(issue.values[0])}`;
                    return `Ugyldig val: forventa eitt av ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `For stor(t): forventa ${issue.origin ?? "value"} til å ha ${adj}${issue.maximum.toString()} ${sizing.unit ?? "element"}`;
                    return `For stor(t): forventa ${issue.origin ?? "value"} til å ha ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `For lite(n): forventa ${issue.origin} til å ha ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `For lite(n): forventa ${issue.origin} til å ha ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Ugyldig streng: må starte med "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Ugyldig streng: må slutte med "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Ugyldig streng: må innehalde "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Ugyldig streng: må matche mønsteret ${_issue.pattern}`;
                    return `Ugyldig ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Ugyldig tal: må vere eit multiplum av ${issue.divisor}`;
                case "unrecognized_keys":
                    return `${issue.keys.length > 1 ? "Ukjende nøklar" : "Ukjend nøkkel"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Ugyldig nøkkel i ${issue.origin}`;
                case "invalid_union":
                    return "Ugyldig input";
                case "invalid_element":
                    return `Ugyldig verdi i ${issue.origin}`;
                default:
                    return `Ugyldig input`;
            }
        };
    };
    function nn () {
        return {
            localeError: error$n(),
        };
    }

    const error$m = () => {
        const Sizable = {
            string: { unit: "tegn", verb: "å ha" },
            file: { unit: "bytes", verb: "å ha" },
            array: { unit: "elementer", verb: "å inneholde" },
            set: { unit: "elementer", verb: "å inneholde" },
            map: { unit: "elementer", verb: "å inneholde" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "input",
            email: "e-postadresse",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO dato- og klokkeslett",
            date: "ISO-dato",
            time: "ISO-klokkeslett",
            duration: "ISO-varighet",
            ipv4: "IPv4-adresse",
            ipv6: "IPv6-adresse",
            mac: "MAC-adresse",
            cidrv4: "IPv4-spekter",
            cidrv6: "IPv6-spekter",
            base64: "base64-enkodet streng",
            base64url: "base64url-enkodet streng",
            json_string: "JSON-streng",
            e164: "E.164-nummer",
            credit_card: "kredittkortnummer",
            currency_code: "valutakode",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "input",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "tall",
            array: "liste",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Ugyldig input: forventet instanceof ${issue.expected}, fikk ${received}`;
                    }
                    return `Ugyldig input: forventet ${expected}, fikk ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Ugyldig verdi: forventet ${stringifyPrimitive(issue.values[0])}`;
                    return `Ugyldig valg: forventet en av ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `For stor(t): forventet ${issue.origin ?? "value"} til å ha ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementer"}`;
                    return `For stor(t): forventet ${issue.origin ?? "value"} til å ha ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `For lite(n): forventet ${issue.origin} til å ha ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `For lite(n): forventet ${issue.origin} til å ha ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Ugyldig streng: må starte med "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Ugyldig streng: må ende med "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Ugyldig streng: må inneholde "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Ugyldig streng: må matche mønsteret ${_issue.pattern}`;
                    return `Ugyldig ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Ugyldig tall: må være et multiplum av ${issue.divisor}`;
                case "unrecognized_keys":
                    return `${issue.keys.length > 1 ? "Ukjente nøkler" : "Ukjent nøkkel"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Ugyldig nøkkel i ${issue.origin}`;
                case "invalid_union":
                    return "Ugyldig input";
                case "invalid_element":
                    return `Ugyldig verdi i ${issue.origin}`;
                default:
                    return `Ugyldig input`;
            }
        };
    };
    function no () {
        return {
            localeError: error$m(),
        };
    }

    const error$l = () => {
        const Sizable = {
            string: { unit: "harf", verb: "olmalıdır" },
            file: { unit: "bayt", verb: "olmalıdır" },
            array: { unit: "unsur", verb: "olmalıdır" },
            set: { unit: "unsur", verb: "olmalıdır" },
            map: { unit: "unsur", verb: "olmalıdır" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "giren",
            email: "epostagâh",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO hengâmı",
            date: "ISO tarihi",
            time: "ISO zamanı",
            duration: "ISO müddeti",
            ipv4: "IPv4 nişânı",
            ipv6: "IPv6 nişânı",
            mac: "MAC nişânı",
            cidrv4: "IPv4 menzili",
            cidrv6: "IPv6 menzili",
            base64: "base64-şifreli metin",
            base64url: "base64url-şifreli metin",
            json_string: "JSON metin",
            e164: "E.164 sayısı",
            credit_card: "i'tibâr kartı numarası",
            currency_code: "para birimi kodu",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "giren",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "numara",
            array: "saf",
            null: "gayb",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Fâsit giren: umulan instanceof ${issue.expected}, alınan ${received}`;
                    }
                    return `Fâsit giren: umulan ${expected}, alınan ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Fâsit giren: umulan ${stringifyPrimitive(issue.values[0])}`;
                    return `Fâsit tercih: mûteberler ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Fazla büyük: ${issue.origin ?? "value"}, ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"} sahip olmalıydı.`;
                    return `Fazla büyük: ${issue.origin ?? "value"}, ${adj}${issue.maximum.toString()} olmalıydı.`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Fazla küçük: ${issue.origin}, ${adj}${issue.minimum.toString()} ${sizing.unit} sahip olmalıydı.`;
                    }
                    return `Fazla küçük: ${issue.origin}, ${adj}${issue.minimum.toString()} olmalıydı.`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Fâsit metin: "${_issue.prefix}" ile başlamalı.`;
                    if (_issue.format === "ends_with")
                        return `Fâsit metin: "${_issue.suffix}" ile bitmeli.`;
                    if (_issue.format === "includes")
                        return `Fâsit metin: "${_issue.includes}" ihtivâ etmeli.`;
                    if (_issue.format === "regex")
                        return `Fâsit metin: ${_issue.pattern} nakşına uymalı.`;
                    return `Fâsit ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Fâsit sayı: ${issue.divisor} katı olmalıydı.`;
                case "unrecognized_keys":
                    return `Tanınmayan anahtar ${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `${issue.origin} için tanınmayan anahtar var.`;
                case "invalid_union":
                    return "Giren tanınamadı.";
                case "invalid_element":
                    return `${issue.origin} için tanınmayan kıymet var.`;
                default:
                    return `Kıymet tanınamadı.`;
            }
        };
    };
    function ota () {
        return {
            localeError: error$l(),
        };
    }

    const error$k = () => {
        const Sizable = {
            string: { unit: "توکي", verb: "ولري" },
            file: { unit: "بایټس", verb: "ولري" },
            array: { unit: "توکي", verb: "ولري" },
            set: { unit: "توکي", verb: "ولري" },
            map: { unit: "توکي", verb: "ولري" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "ورودي",
            email: "بریښنالیک",
            url: "یو آر ال",
            emoji: "ایموجي",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "نیټه او وخت",
            date: "نېټه",
            time: "وخت",
            duration: "موده",
            ipv4: "د IPv4 پته",
            ipv6: "د IPv6 پته",
            mac: "د MAC پته",
            cidrv4: "د IPv4 ساحه",
            cidrv6: "د IPv6 ساحه",
            base64: "base64-encoded متن",
            base64url: "base64url-encoded متن",
            json_string: "JSON متن",
            e164: "د E.164 شمېره",
            credit_card: "د کریډیټ کارت شمیره",
            currency_code: "د اسعارو کوډ",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "ورودي",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "عدد",
            array: "ارې",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `ناسم ورودي: باید instanceof ${issue.expected} وای, مګر ${received} ترلاسه شو`;
                    }
                    return `ناسم ورودي: باید ${expected} وای, مګر ${received} ترلاسه شو`;
                }
                case "invalid_value":
                    if (issue.values.length === 1) {
                        return `ناسم ورودي: باید ${stringifyPrimitive(issue.values[0])} وای`;
                    }
                    return `ناسم انتخاب: باید یو له ${joinValues(issue.values, "|")} څخه وای`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `ډیر لوی: ${issue.origin ?? "ارزښت"} باید ${adj}${issue.maximum.toString()} ${sizing.unit ?? "عنصرونه"} ولري`;
                    }
                    return `ډیر لوی: ${issue.origin ?? "ارزښت"} باید ${adj}${issue.maximum.toString()} وي`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `ډیر کوچنی: ${issue.origin} باید ${adj}${issue.minimum.toString()} ${sizing.unit} ولري`;
                    }
                    return `ډیر کوچنی: ${issue.origin} باید ${adj}${issue.minimum.toString()} وي`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `ناسم متن: باید د "${_issue.prefix}" سره پیل شي`;
                    }
                    if (_issue.format === "ends_with") {
                        return `ناسم متن: باید د "${_issue.suffix}" سره پای ته ورسيږي`;
                    }
                    if (_issue.format === "includes") {
                        return `ناسم متن: باید "${_issue.includes}" ولري`;
                    }
                    if (_issue.format === "regex") {
                        return `ناسم متن: باید د ${_issue.pattern} سره مطابقت ولري`;
                    }
                    return `${FormatDictionary[_issue.format] ?? issue.format} ناسم دی`;
                }
                case "not_multiple_of":
                    return `ناسم عدد: باید د ${issue.divisor} مضرب وي`;
                case "unrecognized_keys":
                    return `ناسم ${issue.keys.length > 1 ? "کلیډونه" : "کلیډ"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `ناسم کلیډ په ${issue.origin} کې`;
                case "invalid_union":
                    return `ناسمه ورودي`;
                case "invalid_element":
                    return `ناسم عنصر په ${issue.origin} کې`;
                default:
                    return `ناسمه ورودي`;
            }
        };
    };
    function ps () {
        return {
            localeError: error$k(),
        };
    }

    const error$j = () => {
        const Sizable = {
            string: { unit: "znaków", verb: "mieć" },
            file: { unit: "bajtów", verb: "mieć" },
            array: { unit: "elementów", verb: "mieć" },
            set: { unit: "elementów", verb: "mieć" },
            map: { unit: "elementów", verb: "mieć" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "wyrażenie",
            email: "adres email",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "data i godzina w formacie ISO",
            date: "data w formacie ISO",
            time: "godzina w formacie ISO",
            duration: "czas trwania ISO",
            ipv4: "adres IPv4",
            ipv6: "adres IPv6",
            mac: "adres MAC",
            cidrv4: "zakres IPv4",
            cidrv6: "zakres IPv6",
            base64: "ciąg znaków zakodowany w formacie base64",
            base64url: "ciąg znaków zakodowany w formacie base64url",
            json_string: "ciąg znaków w formacie JSON",
            e164: "liczba E.164",
            credit_card: "numer karty kredytowej",
            currency_code: "kod waluty",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "wejście",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "liczba",
            array: "tablica",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Nieprawidłowe dane wejściowe: oczekiwano instanceof ${issue.expected}, otrzymano ${received}`;
                    }
                    return `Nieprawidłowe dane wejściowe: oczekiwano ${expected}, otrzymano ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Nieprawidłowe dane wejściowe: oczekiwano ${stringifyPrimitive(issue.values[0])}`;
                    return `Nieprawidłowa opcja: oczekiwano jednej z wartości ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Za duża wartość: oczekiwano, że ${issue.origin ?? "wartość"} będzie mieć ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementów"}`;
                    }
                    return `Zbyt duż(y/a/e): oczekiwano, że ${issue.origin ?? "wartość"} będzie wynosić ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Za mała wartość: oczekiwano, że ${issue.origin ?? "wartość"} będzie mieć ${adj}${issue.minimum.toString()} ${sizing.unit ?? "elementów"}`;
                    }
                    return `Zbyt mał(y/a/e): oczekiwano, że ${issue.origin ?? "wartość"} będzie wynosić ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Nieprawidłowy ciąg znaków: musi zaczynać się od "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Nieprawidłowy ciąg znaków: musi kończyć się na "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Nieprawidłowy ciąg znaków: musi zawierać "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Nieprawidłowy ciąg znaków: musi odpowiadać wzorcowi ${_issue.pattern}`;
                    return `Nieprawidłow(y/a/e) ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Nieprawidłowa liczba: musi być wielokrotnością ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Nierozpoznane klucze${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Nieprawidłowy klucz w ${issue.origin}`;
                case "invalid_union":
                    return "Nieprawidłowe dane wejściowe";
                case "invalid_element":
                    return `Nieprawidłowa wartość w ${issue.origin}`;
                default:
                    return `Nieprawidłowe dane wejściowe`;
            }
        };
    };
    function pl () {
        return {
            localeError: error$j(),
        };
    }

    const error$i = () => {
        const Sizable = {
            string: { unit: "caracteres" },
            file: { unit: "bytes" },
            array: { unit: "elementos" },
            set: { unit: "elementos" },
            map: { unit: "entradas" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "a entrada",
            email: "o endereço de e-mail",
            url: "o URL",
            emoji: "o emoji",
            uuid: "o UUID",
            uuidv4: "o UUIDv4",
            uuidv6: "o UUIDv6",
            nanoid: "o nanoid",
            guid: "o GUID",
            cuid: "o cuid",
            cuid2: "o cuid2",
            ulid: "o ULID",
            xid: "o XID",
            ksuid: "o KSUID",
            datetime: "a data e hora ISO",
            date: "a data ISO",
            time: "a hora ISO",
            duration: "a duração ISO",
            ipv4: "o endereço IPv4",
            ipv6: "o endereço IPv6",
            mac: "o endereço MAC",
            cidrv4: "o intervalo de endereços IPv4",
            cidrv6: "o intervalo de endereços IPv6",
            base64: "o texto codificado em base64",
            base64url: "o texto codificado em base64url",
            json_string: "o texto JSON",
            e164: "o número E.164",
            credit_card: "o número de cartão de crédito",
            currency_code: "o código de moeda",
            iban: "o IBAN",
            jwt: "o JWT",
            template_literal: "a entrada",
        };
        const Gender = {
            masculine: { definite: "o", indefinite: "um" },
            feminine: { definite: "a", indefinite: "uma" },
        };
        const TypeDictionary = {
            string: { name: "texto", articles: Gender.masculine },
            number: { name: "número", articles: Gender.masculine },
            int: { name: "número inteiro", articles: Gender.masculine },
            boolean: { name: "valor booleano", articles: Gender.masculine },
            bigint: { name: "número bigint", articles: Gender.masculine },
            symbol: { name: "símbolo", articles: Gender.masculine },
            undefined: { name: 'valor "undefined"', articles: Gender.masculine },
            null: { name: 'valor "nulo"', articles: Gender.masculine },
            never: { name: 'valor "never"', articles: Gender.masculine },
            void: { name: 'valor "void"', articles: Gender.masculine },
            date: { name: "data", articles: Gender.feminine },
            array: { name: "vetor", articles: Gender.masculine },
            object: { name: "objeto", articles: Gender.masculine },
            tuple: { name: "tuplo", articles: Gender.masculine },
            record: { name: "registo", articles: Gender.masculine },
            map: { name: "mapa", articles: Gender.masculine },
            set: { name: "conjunto", articles: Gender.masculine },
            file: { name: "ficheiro", articles: Gender.masculine },
            nonoptional: { name: "valor não opcional", articles: Gender.masculine },
            nan: { name: 'valor "NaN"', articles: Gender.masculine }, // Compatibility: "nan" -> "NaN" for display
            function: { name: "função", articles: Gender.feminine },
        };
        function translateOriginWithArticle(type, articleType) {
            const translatedValue = TypeDictionary[type] ?? { name: `valor "${type}"`, articles: Gender.masculine };
            return `${translatedValue.articles[articleType]} ${translatedValue.name}`;
        }
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = translateOriginWithArticle(issue.expected, "indefinite");
                    const receivedType = parsedType(issue.input);
                    const received = translateOriginWithArticle(receivedType, "indefinite");
                    return `Entrada inválida: esperava ${expected}, recebeu ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Entrada inválida: esperava ${stringifyPrimitive(issue.values[0])}`;
                    return `Opção inválida: esperava uma das seguintes opções: ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Demasiado grande: esperava que ${translateOriginWithArticle(issue.origin, "definite")} tivesse ${adj} ${issue.maximum.toString()} ${sizing.unit ?? "elementos"}`;
                    return `Demasiado grande: esperava que ${translateOriginWithArticle(issue.origin, "definite")} fosse ${adj} ${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Demasiado pequeno: esperava que ${translateOriginWithArticle(issue.origin, "definite")} tivesse ${adj} ${issue.minimum.toString()} ${sizing.unit ?? "elementos"}`;
                    }
                    return `Demasiado pequeno: esperava que ${translateOriginWithArticle(issue.origin, "definite")} fosse ${adj} ${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Texto inválido: deve começar por "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Texto inválido: deve terminar em "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Texto inválido: deve incluir "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Texto inválido: deve corresponder ao padrão ${_issue.pattern}`;
                    return `Formato d${FormatDictionary[_issue.format] ?? issue.format} inválido`;
                }
                case "not_multiple_of":
                    return `Número inválido: deve ser múltiplo de ${issue.divisor}`;
                case "unrecognized_keys": {
                    const plural = issue.keys.length > 1 ? "s" : "";
                    return `Chave${plural} inválida${plural}: ${joinValues(issue.keys, ", ")}`;
                }
                case "invalid_key":
                    return `Entrada inválida n${translateOriginWithArticle(issue.origin, "definite")}`;
                case "invalid_union":
                    if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
                        const opts = issue.options.map((o) => `'${o}'`).join(" | ");
                        return `Valor de discriminação inválido. Esperava ${opts}`;
                    }
                    return "Entrada inválida";
                case "invalid_element":
                    return `Entrada inválida n${translateOriginWithArticle(issue.origin, "definite")}`;
                default:
                    return `Entrada inválida`;
            }
        };
    };
    function pt () {
        return {
            localeError: error$i(),
        };
    }

    const error$h = () => {
        const Sizable = {
            string: { unit: "caracteres" },
            file: { unit: "bytes" },
            array: { unit: "elementos" },
            set: { unit: "elementos" },
            map: { unit: "entradas" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "a entrada",
            email: "o endereço de e-mail",
            url: "o URL",
            emoji: "o emoji",
            uuid: "o UUID",
            uuidv4: "o UUIDv4",
            uuidv6: "o UUIDv6",
            nanoid: "o nanoid",
            guid: "o GUID",
            cuid: "o cuid",
            cuid2: "o cuid2",
            ulid: "o ULID",
            xid: "o XID",
            ksuid: "o KSUID",
            datetime: "a data e hora ISO",
            date: "a data ISO",
            time: "a hora ISO",
            duration: "a duração ISO",
            ipv4: "o endereço IPv4",
            ipv6: "o endereço IPv6",
            mac: "o endereço MAC",
            cidrv4: "a faixa de endereços IPv4",
            cidrv6: "a faixa de endereços IPv6",
            base64: "o texto codificado em base64",
            base64url: "o texto codificado em base64url",
            json_string: "o texto JSON",
            e164: "o número E.164",
            credit_card: "o número de cartão de crédito",
            currency_code: "o código de moeda",
            iban: "o IBAN",
            jwt: "o JWT",
            template_literal: "a entrada",
        };
        const Gender = {
            masculine: { definite: "o", indefinite: "um" },
            feminine: { definite: "a", indefinite: "uma" },
        };
        const TypeDictionary = {
            string: { name: "texto", articles: Gender.masculine },
            number: { name: "número", articles: Gender.masculine },
            int: { name: "número inteiro", articles: Gender.masculine },
            boolean: { name: "valor booleano", articles: Gender.masculine },
            bigint: { name: "número bigint", articles: Gender.masculine },
            symbol: { name: "símbolo", articles: Gender.masculine },
            undefined: { name: 'valor "undefined"', articles: Gender.masculine },
            null: { name: 'valor "nulo"', articles: Gender.masculine },
            never: { name: 'valor "never"', articles: Gender.masculine },
            void: { name: 'valor "void"', articles: Gender.masculine },
            date: { name: "data", articles: Gender.feminine },
            array: { name: "vetor", articles: Gender.masculine },
            object: { name: "objeto", articles: Gender.masculine },
            tuple: { name: "tupla", articles: Gender.feminine },
            record: { name: "registro", articles: Gender.masculine },
            map: { name: "mapa", articles: Gender.masculine },
            set: { name: "conjunto", articles: Gender.masculine },
            file: { name: "arquivo", articles: Gender.masculine },
            nonoptional: { name: "valor não opcional", articles: Gender.masculine },
            nan: { name: 'valor "NaN"', articles: Gender.masculine }, // Compatibility: "nan" -> "NaN" for display
            function: { name: "função", articles: Gender.feminine },
        };
        function translateOriginWithArticle(type, articleType) {
            const translatedValue = TypeDictionary[type] ?? { name: `valor "${type}"`, articles: Gender.masculine };
            return `${translatedValue.articles[articleType]} ${translatedValue.name}`;
        }
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = translateOriginWithArticle(issue.expected, "indefinite");
                    const receivedType = parsedType(issue.input);
                    const received = translateOriginWithArticle(receivedType, "indefinite");
                    return `Entrada inválida: esperava ${expected}, recebeu ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Entrada inválida: esperava ${stringifyPrimitive(issue.values[0])}`;
                    return `Opção inválida: esperava uma das seguintes opções: ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Grande demais: esperava que ${translateOriginWithArticle(issue.origin, "definite")} tivesse ${adj} ${issue.maximum.toString()} ${sizing.unit ?? "elementos"}`;
                    return `Grande demais: esperava que ${translateOriginWithArticle(issue.origin, "definite")} fosse ${adj} ${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Pequeno demais: esperava que ${translateOriginWithArticle(issue.origin, "definite")} tivesse ${adj} ${issue.minimum.toString()} ${sizing.unit ?? "elementos"}`;
                    }
                    return `Pequeno demais: esperava que ${translateOriginWithArticle(issue.origin, "definite")} fosse ${adj} ${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `Texto inválido: deve começar com "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `Texto inválido: deve terminar com "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Texto inválido: deve incluir "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Texto inválido: deve corresponder ao padrão ${_issue.pattern}`;
                    return `Formato d${FormatDictionary[_issue.format] ?? issue.format} inválido`;
                }
                case "not_multiple_of":
                    return `Número inválido: deve ser múltiplo de ${issue.divisor}`;
                case "unrecognized_keys": {
                    const plural = issue.keys.length > 1 ? "s" : "";
                    return `Chave${plural} inválida${plural}: ${joinValues(issue.keys, ", ")}`;
                }
                case "invalid_key":
                    return `Entrada inválida n${translateOriginWithArticle(issue.origin, "definite")}`;
                case "invalid_union":
                    if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
                        const opts = issue.options.map((o) => `'${o}'`).join(" | ");
                        return `Valor de discriminação inválido. Esperava ${opts}`;
                    }
                    return "Entrada inválida";
                case "invalid_element":
                    return `Entrada inválida n${translateOriginWithArticle(issue.origin, "definite")}`;
                default:
                    return `Entrada inválida`;
            }
        };
    };
    function ptBR () {
        return {
            localeError: error$h(),
        };
    }

    const error$g = () => {
        const Sizable = {
            string: { unit: "caractere", verb: "să aibă" },
            file: { unit: "octeți", verb: "să aibă" },
            array: { unit: "elemente", verb: "să aibă" },
            set: { unit: "elemente", verb: "să aibă" },
            map: { unit: "intrări", verb: "să aibă" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "intrare",
            email: "adresă de email",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "dată și oră ISO",
            date: "dată ISO",
            time: "oră ISO",
            duration: "durată ISO",
            ipv4: "adresă IPv4",
            ipv6: "adresă IPv6",
            mac: "adresă MAC",
            cidrv4: "interval IPv4",
            cidrv6: "interval IPv6",
            base64: "șir codat base64",
            base64url: "șir codat base64url",
            json_string: "șir JSON",
            e164: "număr E.164",
            credit_card: "număr de card de credit",
            currency_code: "cod valutar",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "intrare",
        };
        const TypeDictionary = {
            nan: "NaN",
            string: "șir",
            number: "număr",
            boolean: "boolean",
            function: "funcție",
            array: "matrice",
            object: "obiect",
            undefined: "nedefinit",
            symbol: "simbol",
            bigint: "număr mare",
            void: "void",
            never: "never",
            map: "hartă",
            set: "set",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    return `Intrare invalidă: așteptat ${expected}, primit ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Intrare invalidă: așteptat ${stringifyPrimitive(issue.values[0])}`;
                    return `Opțiune invalidă: așteptat una dintre ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Prea mare: așteptat ca ${issue.origin ?? "valoarea"} ${sizing.verb} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elemente"}`;
                    return `Prea mare: așteptat ca ${issue.origin ?? "valoarea"} să fie ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Prea mic: așteptat ca ${issue.origin} ${sizing.verb} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Prea mic: așteptat ca ${issue.origin} să fie ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `Șir invalid: trebuie să înceapă cu "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `Șir invalid: trebuie să se termine cu "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Șir invalid: trebuie să includă "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Șir invalid: trebuie să se potrivească cu modelul ${_issue.pattern}`;
                    return `Format invalid: ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Număr invalid: trebuie să fie multiplu de ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Chei nerecunoscute: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Cheie invalidă în ${issue.origin}`;
                case "invalid_union":
                    return "Intrare invalidă";
                case "invalid_element":
                    return `Valoare invalidă în ${issue.origin}`;
                default:
                    return `Intrare invalidă`;
            }
        };
    };
    function ro () {
        return {
            localeError: error$g(),
        };
    }

    function getRussianPlural(count, one, few, many) {
        const absCount = Math.abs(count);
        const lastDigit = absCount % 10;
        const lastTwoDigits = absCount % 100;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return many;
        }
        if (lastDigit === 1) {
            return one;
        }
        if (lastDigit >= 2 && lastDigit <= 4) {
            return few;
        }
        return many;
    }
    const error$f = () => {
        const Sizable = {
            string: {
                unit: {
                    one: "символ",
                    few: "символа",
                    many: "символов",
                },
                verb: "иметь",
            },
            file: {
                unit: {
                    one: "байт",
                    few: "байта",
                    many: "байт",
                },
                verb: "иметь",
            },
            array: {
                unit: {
                    one: "элемент",
                    few: "элемента",
                    many: "элементов",
                },
                verb: "иметь",
            },
            set: {
                unit: {
                    one: "элемент",
                    few: "элемента",
                    many: "элементов",
                },
                verb: "иметь",
            },
            map: {
                unit: {
                    one: "элемент",
                    few: "элемента",
                    many: "элементов",
                },
                verb: "иметь",
            },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "ввод",
            email: "email адрес",
            url: "URL",
            emoji: "эмодзи",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO дата и время",
            date: "ISO дата",
            time: "ISO время",
            duration: "ISO длительность",
            ipv4: "IPv4 адрес",
            ipv6: "IPv6 адрес",
            mac: "MAC адрес",
            cidrv4: "IPv4 диапазон",
            cidrv6: "IPv6 диапазон",
            base64: "строка в формате base64",
            base64url: "строка в формате base64url",
            json_string: "JSON строка",
            e164: "номер E.164",
            credit_card: "номер кредитной карты",
            currency_code: "код валюты",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "ввод",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "число",
            array: "массив",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Неверный ввод: ожидалось instanceof ${issue.expected}, получено ${received}`;
                    }
                    return `Неверный ввод: ожидалось ${expected}, получено ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Неверный ввод: ожидалось ${stringifyPrimitive(issue.values[0])}`;
                    return `Неверный вариант: ожидалось одно из ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        const maxValue = Number(issue.maximum);
                        const unit = getRussianPlural(maxValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
                        return `Слишком большое значение: ожидалось, что ${issue.origin ?? "значение"} будет иметь ${adj}${issue.maximum.toString()} ${unit}`;
                    }
                    return `Слишком большое значение: ожидалось, что ${issue.origin ?? "значение"} будет ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        const minValue = Number(issue.minimum);
                        const unit = getRussianPlural(minValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
                        return `Слишком маленькое значение: ожидалось, что ${issue.origin} будет иметь ${adj}${issue.minimum.toString()} ${unit}`;
                    }
                    return `Слишком маленькое значение: ожидалось, что ${issue.origin} будет ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Неверная строка: должна начинаться с "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Неверная строка: должна заканчиваться на "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Неверная строка: должна содержать "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Неверная строка: должна соответствовать шаблону ${_issue.pattern}`;
                    return `Неверный ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Неверное число: должно быть кратным ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Нераспознанн${issue.keys.length > 1 ? "ые" : "ый"} ключ${issue.keys.length > 1 ? "и" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Неверный ключ в ${issue.origin}`;
                case "invalid_union":
                    return "Неверные входные данные";
                case "invalid_element":
                    return `Неверное значение в ${issue.origin}`;
                default:
                    return `Неверные входные данные`;
            }
        };
    };
    function ru () {
        return {
            localeError: error$f(),
        };
    }

    const error$e = () => {
        const Sizable = {
            string: { unit: "znakov", verb: "mať" },
            file: { unit: "bajtov", verb: "mať" },
            array: { unit: "prvkov", verb: "mať" },
            set: { unit: "prvkov", verb: "mať" },
            map: { unit: "položiek", verb: "mať" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "regulárny výraz",
            email: "e-mailová adresa",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "dátum a čas vo formáte ISO",
            date: "dátum vo formáte ISO",
            time: "čas vo formáte ISO",
            duration: "doba trvania ISO",
            ipv4: "IPv4 adresa",
            ipv6: "IPv6 adresa",
            mac: "MAC adresa",
            cidrv4: "rozsah IPv4",
            cidrv6: "rozsah IPv6",
            base64: "reťazec zakódovaný vo formáte base64",
            base64url: "reťazec zakódovaný vo formáte base64url",
            json_string: "reťazec vo formáte JSON",
            e164: "číslo E.164",
            credit_card: "číslo kreditnej karty",
            currency_code: "kód meny",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "vstup",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "číslo",
            string: "reťazec",
            function: "funkcia",
            array: "pole",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Neplatný vstup: očakávané instanceof ${issue.expected}, obdržané ${received}`;
                    }
                    return `Neplatný vstup: očakávané ${expected}, obdržané ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Neplatný vstup: očakávané ${stringifyPrimitive(issue.values[0])}`;
                    return `Neplatný vstup: očakávaná jedna z hodnôt ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Hodnota je príliš veľká: ${issue.origin ?? "hodnota"} musí mať ${adj}${issue.maximum.toString()} ${sizing.unit ?? "prvkov"}`;
                    }
                    return `Hodnota je príliš veľká: ${issue.origin ?? "hodnota"} musí byť ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Hodnota je príliš malá: ${issue.origin ?? "hodnota"} musí mať ${adj}${issue.minimum.toString()} ${sizing.unit ?? "prvkov"}`;
                    }
                    return `Hodnota je príliš malá: ${issue.origin ?? "hodnota"} musí byť ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Neplatný reťazec: musí začínať na "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Neplatný reťazec: musí končiť na "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Neplatný reťazec: musí obsahovať "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Neplatný reťazec: musí zodpovedať vzoru ${_issue.pattern}`;
                    return `Neplatný formát ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Neplatné číslo: musí byť násobkom ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Neznáme klúče: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Neplatný klúč v ${issue.origin}`;
                case "invalid_union":
                    return "Neplatný vstup";
                case "invalid_element":
                    return `Neplatná hodnota v ${issue.origin}`;
                default:
                    return `Neplatný vstup`;
            }
        };
    };
    function sk () {
        return {
            localeError: error$e(),
        };
    }

    const error$d = () => {
        const Sizable = {
            string: { unit: "znakov", verb: "imeti" },
            file: { unit: "bajtov", verb: "imeti" },
            array: { unit: "elementov", verb: "imeti" },
            set: { unit: "elementov", verb: "imeti" },
            map: { unit: "elementov", verb: "imeti" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "vnos",
            email: "e-poštni naslov",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO datum in čas",
            date: "ISO datum",
            time: "ISO čas",
            duration: "ISO trajanje",
            ipv4: "IPv4 naslov",
            ipv6: "IPv6 naslov",
            mac: "MAC naslov",
            cidrv4: "obseg IPv4",
            cidrv6: "obseg IPv6",
            base64: "base64 kodiran niz",
            base64url: "base64url kodiran niz",
            json_string: "JSON niz",
            e164: "E.164 številka",
            credit_card: "številka kreditne kartice",
            currency_code: "koda valute",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "vnos",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "število",
            array: "tabela",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Neveljaven vnos: pričakovano instanceof ${issue.expected}, prejeto ${received}`;
                    }
                    return `Neveljaven vnos: pričakovano ${expected}, prejeto ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Neveljaven vnos: pričakovano ${stringifyPrimitive(issue.values[0])}`;
                    return `Neveljavna možnost: pričakovano eno izmed ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Preveliko: pričakovano, da bo ${issue.origin ?? "vrednost"} imelo ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementov"}`;
                    return `Preveliko: pričakovano, da bo ${issue.origin ?? "vrednost"} ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Premajhno: pričakovano, da bo ${issue.origin} imelo ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Premajhno: pričakovano, da bo ${issue.origin} ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `Neveljaven niz: mora se začeti z "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `Neveljaven niz: mora se končati z "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Neveljaven niz: mora vsebovati "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Neveljaven niz: mora ustrezati vzorcu ${_issue.pattern}`;
                    return `Neveljaven ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Neveljavno število: mora biti večkratnik ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Neprepoznan${issue.keys.length > 1 ? "i ključi" : " ključ"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Neveljaven ključ v ${issue.origin}`;
                case "invalid_union":
                    return "Neveljaven vnos";
                case "invalid_element":
                    return `Neveljavna vrednost v ${issue.origin}`;
                default:
                    return "Neveljaven vnos";
            }
        };
    };
    function sl () {
        return {
            localeError: error$d(),
        };
    }

    const error$c = () => {
        const Sizable = {
            string: { unit: "tecken", verb: "att ha" },
            file: { unit: "bytes", verb: "att ha" },
            array: { unit: "objekt", verb: "att innehålla" },
            set: { unit: "objekt", verb: "att innehålla" },
            map: { unit: "objekt", verb: "att innehålla" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "reguljärt uttryck",
            email: "e-postadress",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO-datum och tid",
            date: "ISO-datum",
            time: "ISO-tid",
            duration: "ISO-varaktighet",
            ipv4: "IPv4-adress",
            ipv6: "IPv6-adress",
            mac: "MAC-adress",
            cidrv4: "IPv4-spektrum",
            cidrv6: "IPv6-spektrum",
            base64: "base64-kodad sträng",
            base64url: "base64url-kodad sträng",
            json_string: "JSON-sträng",
            e164: "E.164-nummer",
            credit_card: "kreditkortsnummer",
            currency_code: "valutakod",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "mall-literal",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "antal",
            array: "lista",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Ogiltig inmatning: förväntat instanceof ${issue.expected}, fick ${received}`;
                    }
                    return `Ogiltig inmatning: förväntat ${expected}, fick ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Ogiltig inmatning: förväntat ${stringifyPrimitive(issue.values[0])}`;
                    return `Ogiltigt val: förväntade en av ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `För stor(t): förväntade ${issue.origin ?? "värdet"} att ha ${adj}${issue.maximum.toString()} ${sizing.unit ?? "element"}`;
                    }
                    return `För stor(t): förväntat ${issue.origin ?? "värdet"} att ha ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `För lite(t): förväntade ${issue.origin ?? "värdet"} att ha ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `För lite(t): förväntade ${issue.origin ?? "värdet"} att ha ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `Ogiltig sträng: måste börja med "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `Ogiltig sträng: måste sluta med "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Ogiltig sträng: måste innehålla "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Ogiltig sträng: måste matcha mönstret "${_issue.pattern}"`;
                    return `Ogiltig(t) ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Ogiltigt tal: måste vara en multipel av ${issue.divisor}`;
                case "unrecognized_keys":
                    return `${issue.keys.length > 1 ? "Okända nycklar" : "Okänd nyckel"}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Ogiltig nyckel i ${issue.origin ?? "värdet"}`;
                case "invalid_union":
                    return "Ogiltig input";
                case "invalid_element":
                    return `Ogiltigt värde i ${issue.origin ?? "värdet"}`;
                default:
                    return `Ogiltig input`;
            }
        };
    };
    function sv () {
        return {
            localeError: error$c(),
        };
    }

    const error$b = () => {
        const Sizable = {
            string: { unit: "எழுத்துக்கள்", verb: "கொண்டிருக்க வேண்டும்" },
            file: { unit: "பைட்டுகள்", verb: "கொண்டிருக்க வேண்டும்" },
            array: { unit: "உறுப்புகள்", verb: "கொண்டிருக்க வேண்டும்" },
            set: { unit: "உறுப்புகள்", verb: "கொண்டிருக்க வேண்டும்" },
            map: { unit: "உறுப்புகள்", verb: "கொண்டிருக்க வேண்டும்" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "உள்ளீடு",
            email: "மின்னஞ்சல் முகவரி",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO தேதி நேரம்",
            date: "ISO தேதி",
            time: "ISO நேரம்",
            duration: "ISO கால அளவு",
            ipv4: "IPv4 முகவரி",
            ipv6: "IPv6 முகவரி",
            mac: "MAC முகவரி",
            cidrv4: "IPv4 வரம்பு",
            cidrv6: "IPv6 வரம்பு",
            base64: "base64-encoded சரம்",
            base64url: "base64url-encoded சரம்",
            json_string: "JSON சரம்",
            e164: "E.164 எண்",
            credit_card: "கடன் அட்டை எண்",
            currency_code: "நாணயக் குறியீடு",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "input",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "எண்",
            array: "அணி",
            null: "வெறுமை",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `தவறான உள்ளீடு: எதிர்பார்க்கப்பட்டது instanceof ${issue.expected}, பெறப்பட்டது ${received}`;
                    }
                    return `தவறான உள்ளீடு: எதிர்பார்க்கப்பட்டது ${expected}, பெறப்பட்டது ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `தவறான உள்ளீடு: எதிர்பார்க்கப்பட்டது ${stringifyPrimitive(issue.values[0])}`;
                    return `தவறான விருப்பம்: எதிர்பார்க்கப்பட்டது ${joinValues(issue.values, "|")} இல் ஒன்று`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `மிக பெரியது: எதிர்பார்க்கப்பட்டது ${issue.origin ?? "மதிப்பு"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "உறுப்புகள்"} ஆக இருக்க வேண்டும்`;
                    }
                    return `மிக பெரியது: எதிர்பார்க்கப்பட்டது ${issue.origin ?? "மதிப்பு"} ${adj}${issue.maximum.toString()} ஆக இருக்க வேண்டும்`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `மிகச் சிறியது: எதிர்பார்க்கப்பட்டது ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit} ஆக இருக்க வேண்டும்`; //
                    }
                    return `மிகச் சிறியது: எதிர்பார்க்கப்பட்டது ${issue.origin} ${adj}${issue.minimum.toString()} ஆக இருக்க வேண்டும்`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `தவறான சரம்: "${_issue.prefix}" இல் தொடங்க வேண்டும்`;
                    if (_issue.format === "ends_with")
                        return `தவறான சரம்: "${_issue.suffix}" இல் முடிவடைய வேண்டும்`;
                    if (_issue.format === "includes")
                        return `தவறான சரம்: "${_issue.includes}" ஐ உள்ளடக்க வேண்டும்`;
                    if (_issue.format === "regex")
                        return `தவறான சரம்: ${_issue.pattern} முறைபாட்டுடன் பொருந்த வேண்டும்`;
                    return `தவறான ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `தவறான எண்: ${issue.divisor} இன் பலமாக இருக்க வேண்டும்`;
                case "unrecognized_keys":
                    return `அடையாளம் தெரியாத விசை${issue.keys.length > 1 ? "கள்" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `${issue.origin} இல் தவறான விசை`;
                case "invalid_union":
                    return "தவறான உள்ளீடு";
                case "invalid_element":
                    return `${issue.origin} இல் தவறான மதிப்பு`;
                default:
                    return `தவறான உள்ளீடு`;
            }
        };
    };
    function ta () {
        return {
            localeError: error$b(),
        };
    }

    const error$a = () => {
        // singular units after numerals in Tajik
        const Sizable = {
            string: { unit: "аломат", verb: "дошта бошад" },
            file: { unit: "байт", verb: "дошта бошад" },
            array: { unit: "унсур", verb: "дошта бошад" },
            set: { unit: "унсур", verb: "дошта бошад" },
            map: { unit: "сабт", verb: "дошта бошад" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "вуруд",
            email: "суроғаи email",
            url: "URL",
            emoji: "эмоҷи",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "санаву вақти ISO",
            date: "санаи ISO",
            time: "вақти ISO",
            duration: "давомнокии ISO",
            ipv4: "суроғаи IPv4",
            ipv6: "суроғаи IPv6",
            mac: "суроғаи MAC",
            cidrv4: "маҳдудаи IPv4",
            cidrv6: "маҳдудаи IPv6",
            base64: "сатри дар формати base64",
            base64url: "сатри дар формати base64url",
            json_string: "сатри JSON",
            e164: "рақами E.164",
            credit_card: "рақами корти кредитӣ",
            currency_code: "рамзи асъор",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "вуруд",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "рақам",
            string: "сатр",
            array: "массив",
            object: "объект",
            date: "сана",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    return `Вуруди нодуруст: ${expected} интизор мерафт, ${received} гирифта шуд`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Вуруди нодуруст: ${stringifyPrimitive(issue.values[0])} интизор мерафт`;
                    return `Интихоби нодуруст: яке аз ${joinValues(issue.values, "|")} интизор мерафт`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Хеле калон: ${issue.origin ?? "қимат"} бояд ${adj}${issue.maximum.toString()} ${sizing.unit} ${sizing.verb}`;
                    return `Хеле калон: ${issue.origin ?? "қимат"} бояд ${adj}${issue.maximum.toString()} бошад`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Хеле хурд: ${issue.origin} бояд ${adj}${issue.minimum.toString()} ${sizing.unit} ${sizing.verb}`;
                    return `Хеле хурд: ${issue.origin} бояд ${adj}${issue.minimum.toString()} бошад`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Сатри нодуруст: бояд бо "${_issue.prefix}" оғоз шавад`;
                    if (_issue.format === "ends_with")
                        return `Сатри нодуруст: бояд бо "${_issue.suffix}" анҷом ёбад`;
                    if (_issue.format === "includes")
                        return `Сатри нодуруст: бояд "${_issue.includes}"-ро дар бар гирад`;
                    if (_issue.format === "regex")
                        return `Сатри нодуруст: бояд ба намунаи ${_issue.pattern} мувофиқат кунад`;
                    return `${FormatDictionary[_issue.format] ?? issue.format}-и нодуруст`;
                }
                case "not_multiple_of":
                    return `Рақами нодуруст: бояд ба ${issue.divisor} бе бақия тақсим шавад`;
                case "unrecognized_keys":
                    return `Калид${issue.keys.length > 1 ? "ҳои" : "и"} номаълум: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Калиди нодуруст дар ${issue.origin}`;
                case "invalid_union":
                    if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
                        const opts = issue.options.map((o) => `'${o}'`).join(" | ");
                        return `Қимати нодурусти дискриминатор: ${opts} интизор мерафт`;
                    }
                    return "Вуруди нодуруст";
                case "invalid_element":
                    return `Қимати нодуруст дар ${issue.origin}`;
                default:
                    return `Вуруди нодуруст`;
            }
        };
    };
    function tg () {
        return {
            localeError: error$a(),
        };
    }

    const error$9 = () => {
        const Sizable = {
            string: { unit: "ตัวอักษร", verb: "ควรมี" },
            file: { unit: "ไบต์", verb: "ควรมี" },
            array: { unit: "รายการ", verb: "ควรมี" },
            set: { unit: "รายการ", verb: "ควรมี" },
            map: { unit: "รายการ", verb: "ควรมี" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "ข้อมูลที่ป้อน",
            email: "ที่อยู่อีเมล",
            url: "URL",
            emoji: "อิโมจิ",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "วันที่เวลาแบบ ISO",
            date: "วันที่แบบ ISO",
            time: "เวลาแบบ ISO",
            duration: "ช่วงเวลาแบบ ISO",
            ipv4: "ที่อยู่ IPv4",
            ipv6: "ที่อยู่ IPv6",
            mac: "ที่อยู่ MAC",
            cidrv4: "ช่วง IP แบบ IPv4",
            cidrv6: "ช่วง IP แบบ IPv6",
            base64: "ข้อความแบบ Base64",
            base64url: "ข้อความแบบ Base64 สำหรับ URL",
            json_string: "ข้อความแบบ JSON",
            e164: "เบอร์โทรศัพท์ระหว่างประเทศ (E.164)",
            credit_card: "หมายเลขบัตรเครดิต",
            currency_code: "รหัสสกุลเงิน",
            iban: "IBAN",
            jwt: "โทเคน JWT",
            template_literal: "ข้อมูลที่ป้อน",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "ตัวเลข",
            array: "อาร์เรย์ (Array)",
            null: "ไม่มีค่า (null)",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `ประเภทข้อมูลไม่ถูกต้อง: ควรเป็น instanceof ${issue.expected} แต่ได้รับ ${received}`;
                    }
                    return `ประเภทข้อมูลไม่ถูกต้อง: ควรเป็น ${expected} แต่ได้รับ ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `ค่าไม่ถูกต้อง: ควรเป็น ${stringifyPrimitive(issue.values[0])}`;
                    return `ตัวเลือกไม่ถูกต้อง: ควรเป็นหนึ่งใน ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "ไม่เกิน" : "น้อยกว่า";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `เกินกำหนด: ${issue.origin ?? "ค่า"} ควรมี${adj} ${issue.maximum.toString()} ${sizing.unit ?? "รายการ"}`;
                    return `เกินกำหนด: ${issue.origin ?? "ค่า"} ควรมี${adj} ${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? "อย่างน้อย" : "มากกว่า";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `น้อยกว่ากำหนด: ${issue.origin} ควรมี${adj} ${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `น้อยกว่ากำหนด: ${issue.origin} ควรมี${adj} ${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `รูปแบบไม่ถูกต้อง: ข้อความต้องขึ้นต้นด้วย "${_issue.prefix}"`;
                    }
                    if (_issue.format === "ends_with")
                        return `รูปแบบไม่ถูกต้อง: ข้อความต้องลงท้ายด้วย "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `รูปแบบไม่ถูกต้อง: ข้อความต้องมี "${_issue.includes}" อยู่ในข้อความ`;
                    if (_issue.format === "regex")
                        return `รูปแบบไม่ถูกต้อง: ต้องตรงกับรูปแบบที่กำหนด ${_issue.pattern}`;
                    return `รูปแบบไม่ถูกต้อง: ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `ตัวเลขไม่ถูกต้อง: ต้องเป็นจำนวนที่หารด้วย ${issue.divisor} ได้ลงตัว`;
                case "unrecognized_keys":
                    return `พบคีย์ที่ไม่รู้จัก: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `คีย์ไม่ถูกต้องใน ${issue.origin}`;
                case "invalid_union":
                    return "ข้อมูลไม่ถูกต้อง: ไม่ตรงกับรูปแบบยูเนียนที่กำหนดไว้";
                case "invalid_element":
                    return `ข้อมูลไม่ถูกต้องใน ${issue.origin}`;
                default:
                    return `ข้อมูลไม่ถูกต้อง`;
            }
        };
    };
    function th () {
        return {
            localeError: error$9(),
        };
    }

    const error$8 = () => {
        const Sizable = {
            string: { unit: "simwol", verb: "bolmaly" },
            file: { unit: "baýt", verb: "bolmaly" },
            array: { unit: "elementler", verb: "bolmaly" },
            set: { unit: "elementler", verb: "bolmaly" },
            map: { unit: "elementler", verb: "bolmaly" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "giriş",
            email: "e-poçta salgysy",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO sene we wagt",
            date: "ISO sene",
            time: "ISO wagt",
            duration: "ISO wagt aralygy",
            ipv4: "IPv4 salgysy",
            ipv6: "IPv6 salgysy",
            mac: "MAC salgysy",
            cidrv4: "IPv4 aralygy",
            cidrv6: "IPv6 aralygy",
            base64: "base64 bilen şifrlenen setir",
            base64url: "base64url bilen şifrlenen setir",
            json_string: "JSON setiri",
            e164: "E.164 nomeri",
            credit_card: "kredit kartynyň nomeri",
            currency_code: "walýuta kody",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "şablon",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    return `Nädogry baha: garaşylan ${expected} ýerine ${received} alyndy`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Nädogry baha: ${stringifyPrimitive(issue.values[0])} bolmaly`;
                    return `Nädogry saýlaw: aşakdakylardan biri bolmaly: ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Has uly: garaşylýan ${issue.origin ?? "baha"} ${adj} ${issue.maximum.toString()} ${sizing.unit ?? "element"}`;
                    return `Has uly: garaşylýan ${issue.origin ?? "baha"} ${adj} ${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Has kiçi: garaşylýan ${issue.origin} ${adj} ${issue.minimum.toString()} ${sizing.unit}`;
                    return `Has kiçi: garaşylýan ${issue.origin} ${adj} ${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Nädogry setir: "${_issue.prefix}" bilen başlamaly`;
                    if (_issue.format === "ends_with")
                        return `Nädogry setir: "${_issue.suffix}" bilen gutarmaly`;
                    if (_issue.format === "includes")
                        return `Nädogry setir: "${_issue.includes}" saklamaly`;
                    if (_issue.format === "regex")
                        return `Nädogry setir: ${_issue.pattern} nusga laýyk bolmaly`;
                    return `Nädogry ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Nädogry san: ${issue.divisor} bilen galyndysyz bölünmeli`;
                case "unrecognized_keys":
                    return `Tanalmaýan açar${issue.keys.length > 1 ? "lar" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `${issue.origin} içinde nädogry açar`;
                case "invalid_union":
                    return "Nädogry baha";
                case "invalid_element":
                    return `${issue.origin} içinde nädogry baha`;
                default:
                    return `Nädogry baha`;
            }
        };
    };
    function tk () {
        return {
            localeError: error$8(),
        };
    }

    const error$7 = () => {
        const Sizable = {
            string: { unit: "karakter", verb: "olmalı" },
            file: { unit: "bayt", verb: "olmalı" },
            array: { unit: "öğe", verb: "olmalı" },
            set: { unit: "öğe", verb: "olmalı" },
            map: { unit: "öğe", verb: "olmalı" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "girdi",
            email: "e-posta adresi",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO tarih ve saat",
            date: "ISO tarih",
            time: "ISO saat",
            duration: "ISO süre",
            ipv4: "IPv4 adresi",
            ipv6: "IPv6 adresi",
            mac: "MAC adresi",
            cidrv4: "IPv4 aralığı",
            cidrv6: "IPv6 aralığı",
            base64: "base64 ile şifrelenmiş metin",
            base64url: "base64url ile şifrelenmiş metin",
            json_string: "JSON dizesi",
            e164: "E.164 sayısı",
            credit_card: "kredi kartı numarası",
            currency_code: "para birimi kodu",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "Şablon dizesi",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Geçersiz değer: beklenen instanceof ${issue.expected}, alınan ${received}`;
                    }
                    return `Geçersiz değer: beklenen ${expected}, alınan ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Geçersiz değer: beklenen ${stringifyPrimitive(issue.values[0])}`;
                    return `Geçersiz seçenek: aşağıdakilerden biri olmalı: ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Çok büyük: beklenen ${issue.origin ?? "değer"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "öğe"}`;
                    return `Çok büyük: beklenen ${issue.origin ?? "değer"} ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Çok küçük: beklenen ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    return `Çok küçük: beklenen ${issue.origin} ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Geçersiz metin: "${_issue.prefix}" ile başlamalı`;
                    if (_issue.format === "ends_with")
                        return `Geçersiz metin: "${_issue.suffix}" ile bitmeli`;
                    if (_issue.format === "includes")
                        return `Geçersiz metin: "${_issue.includes}" içermeli`;
                    if (_issue.format === "regex")
                        return `Geçersiz metin: ${_issue.pattern} desenine uymalı`;
                    return `Geçersiz ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Geçersiz sayı: ${issue.divisor} ile tam bölünebilmeli`;
                case "unrecognized_keys":
                    return `Tanınmayan anahtar${issue.keys.length > 1 ? "lar" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `${issue.origin} içinde geçersiz anahtar`;
                case "invalid_union":
                    return "Geçersiz değer";
                case "invalid_element":
                    return `${issue.origin} içinde geçersiz değer`;
                default:
                    return `Geçersiz değer`;
            }
        };
    };
    function tr () {
        return {
            localeError: error$7(),
        };
    }

    const error$6 = () => {
        const Sizable = {
            string: { unit: "символів", verb: "матиме" },
            file: { unit: "байтів", verb: "матиме" },
            array: { unit: "елементів", verb: "матиме" },
            set: { unit: "елементів", verb: "матиме" },
            map: { unit: "елементів", verb: "матиме" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "вхідні дані",
            email: "адреса електронної пошти",
            url: "URL",
            emoji: "емодзі",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "дата та час ISO",
            date: "дата ISO",
            time: "час ISO",
            duration: "тривалість ISO",
            ipv4: "адреса IPv4",
            ipv6: "адреса IPv6",
            mac: "адреса MAC",
            cidrv4: "діапазон IPv4",
            cidrv6: "діапазон IPv6",
            base64: "рядок у кодуванні base64",
            base64url: "рядок у кодуванні base64url",
            json_string: "рядок JSON",
            e164: "номер E.164",
            credit_card: "номер кредитної картки",
            currency_code: "код валюти",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "вхідні дані",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "число",
            array: "масив",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Неправильні вхідні дані: очікується instanceof ${issue.expected}, отримано ${received}`;
                    }
                    return `Неправильні вхідні дані: очікується ${expected}, отримано ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Неправильні вхідні дані: очікується ${stringifyPrimitive(issue.values[0])}`;
                    return `Неправильна опція: очікується одне з ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Занадто велике: очікується, що ${issue.origin ?? "значення"} ${sizing.verb} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "елементів"}`;
                    return `Занадто велике: очікується, що ${issue.origin ?? "значення"} буде ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Занадто мале: очікується, що ${issue.origin} ${sizing.verb} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Занадто мале: очікується, що ${issue.origin} буде ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Неправильний рядок: повинен починатися з "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Неправильний рядок: повинен закінчуватися на "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Неправильний рядок: повинен містити "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Неправильний рядок: повинен відповідати шаблону ${_issue.pattern}`;
                    return `Неправильний ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Неправильне число: повинно бути кратним ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Нерозпізнаний ключ${issue.keys.length > 1 ? "і" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Неправильний ключ у ${issue.origin}`;
                case "invalid_union":
                    return "Неправильні вхідні дані";
                case "invalid_element":
                    return `Неправильне значення у ${issue.origin}`;
                default:
                    return `Неправильні вхідні дані`;
            }
        };
    };
    function uk () {
        return {
            localeError: error$6(),
        };
    }

    /** @deprecated Use `uk` instead. */
    function ua () {
        return uk();
    }

    const error$5 = () => {
        const Sizable = {
            string: { unit: "حروف", verb: "ہونا" },
            file: { unit: "بائٹس", verb: "ہونا" },
            array: { unit: "آئٹمز", verb: "ہونا" },
            set: { unit: "آئٹمز", verb: "ہونا" },
            map: { unit: "آئٹمز", verb: "ہونا" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "ان پٹ",
            email: "ای میل ایڈریس",
            url: "یو آر ایل",
            emoji: "ایموجی",
            uuid: "یو یو آئی ڈی",
            uuidv4: "یو یو آئی ڈی وی 4",
            uuidv6: "یو یو آئی ڈی وی 6",
            nanoid: "نینو آئی ڈی",
            guid: "جی یو آئی ڈی",
            cuid: "سی یو آئی ڈی",
            cuid2: "سی یو آئی ڈی 2",
            ulid: "یو ایل آئی ڈی",
            xid: "ایکس آئی ڈی",
            ksuid: "کے ایس یو آئی ڈی",
            datetime: "آئی ایس او ڈیٹ ٹائم",
            date: "آئی ایس او تاریخ",
            time: "آئی ایس او وقت",
            duration: "آئی ایس او مدت",
            ipv4: "آئی پی وی 4 ایڈریس",
            ipv6: "آئی پی وی 6 ایڈریس",
            mac: "ایم اے سی ایڈریس",
            cidrv4: "آئی پی وی 4 رینج",
            cidrv6: "آئی پی وی 6 رینج",
            base64: "بیس 64 ان کوڈڈ سٹرنگ",
            base64url: "بیس 64 یو آر ایل ان کوڈڈ سٹرنگ",
            json_string: "جے ایس او این سٹرنگ",
            e164: "ای 164 نمبر",
            credit_card: "کریڈٹ کارڈ نمبر",
            currency_code: "کرنسی کوڈ",
            iban: "IBAN",
            jwt: "جے ڈبلیو ٹی",
            template_literal: "ان پٹ",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "نمبر",
            array: "آرے",
            null: "نل",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `غلط ان پٹ: instanceof ${issue.expected} متوقع تھا، ${received} موصول ہوا`;
                    }
                    return `غلط ان پٹ: ${expected} متوقع تھا، ${received} موصول ہوا`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `غلط ان پٹ: ${stringifyPrimitive(issue.values[0])} متوقع تھا`;
                    return `غلط آپشن: ${joinValues(issue.values, "|")} میں سے ایک متوقع تھا`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `بہت بڑا: ${issue.origin ?? "ویلیو"} کے ${adj}${issue.maximum.toString()} ${sizing.unit ?? "عناصر"} ہونے متوقع تھے`;
                    return `بہت بڑا: ${issue.origin ?? "ویلیو"} کا ${adj}${issue.maximum.toString()} ہونا متوقع تھا`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `بہت چھوٹا: ${issue.origin} کے ${adj}${issue.minimum.toString()} ${sizing.unit} ہونے متوقع تھے`;
                    }
                    return `بہت چھوٹا: ${issue.origin} کا ${adj}${issue.minimum.toString()} ہونا متوقع تھا`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `غلط سٹرنگ: "${_issue.prefix}" سے شروع ہونا چاہیے`;
                    }
                    if (_issue.format === "ends_with")
                        return `غلط سٹرنگ: "${_issue.suffix}" پر ختم ہونا چاہیے`;
                    if (_issue.format === "includes")
                        return `غلط سٹرنگ: "${_issue.includes}" شامل ہونا چاہیے`;
                    if (_issue.format === "regex")
                        return `غلط سٹرنگ: پیٹرن ${_issue.pattern} سے میچ ہونا چاہیے`;
                    return `غلط ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `غلط نمبر: ${issue.divisor} کا مضاعف ہونا چاہیے`;
                case "unrecognized_keys":
                    return `غیر تسلیم شدہ کی${issue.keys.length > 1 ? "ز" : ""}: ${joinValues(issue.keys, "، ")}`;
                case "invalid_key":
                    return `${issue.origin} میں غلط کی`;
                case "invalid_union":
                    return "غلط ان پٹ";
                case "invalid_element":
                    return `${issue.origin} میں غلط ویلیو`;
                default:
                    return `غلط ان پٹ`;
            }
        };
    };
    function ur () {
        return {
            localeError: error$5(),
        };
    }

    const error$4 = () => {
        const Sizable = {
            string: { unit: "belgi", verb: "bo‘lishi kerak" },
            file: { unit: "bayt", verb: "bo‘lishi kerak" },
            array: { unit: "element", verb: "bo‘lishi kerak" },
            set: { unit: "element", verb: "bo‘lishi kerak" },
            map: { unit: "yozuv", verb: "bo‘lishi kerak" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "kirish",
            email: "elektron pochta manzili",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO sana va vaqti",
            date: "ISO sana",
            time: "ISO vaqt",
            duration: "ISO davomiylik",
            ipv4: "IPv4 manzil",
            ipv6: "IPv6 manzil",
            mac: "MAC manzil",
            cidrv4: "IPv4 diapazon",
            cidrv6: "IPv6 diapazon",
            base64: "base64 kodlangan satr",
            base64url: "base64url kodlangan satr",
            json_string: "JSON satr",
            e164: "E.164 raqam",
            credit_card: "kredit karta raqami",
            currency_code: "valyuta kodi",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "kirish",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "raqam",
            array: "massiv",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Noto‘g‘ri kirish: kutilgan instanceof ${issue.expected}, qabul qilingan ${received}`;
                    }
                    return `Noto‘g‘ri kirish: kutilgan ${expected}, qabul qilingan ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Noto‘g‘ri kirish: kutilgan ${stringifyPrimitive(issue.values[0])}`;
                    return `Noto‘g‘ri variant: quyidagilardan biri kutilgan ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Juda katta: kutilgan ${issue.origin ?? "qiymat"} ${adj}${issue.maximum.toString()} ${sizing.unit} ${sizing.verb}`;
                    return `Juda katta: kutilgan ${issue.origin ?? "qiymat"} ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Juda kichik: kutilgan ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit} ${sizing.verb}`;
                    }
                    return `Juda kichik: kutilgan ${issue.origin} ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Noto‘g‘ri satr: "${_issue.prefix}" bilan boshlanishi kerak`;
                    if (_issue.format === "ends_with")
                        return `Noto‘g‘ri satr: "${_issue.suffix}" bilan tugashi kerak`;
                    if (_issue.format === "includes")
                        return `Noto‘g‘ri satr: "${_issue.includes}" ni o‘z ichiga olishi kerak`;
                    if (_issue.format === "regex")
                        return `Noto‘g‘ri satr: ${_issue.pattern} shabloniga mos kelishi kerak`;
                    return `Noto‘g‘ri ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Noto‘g‘ri raqam: ${issue.divisor} ning karralisi bo‘lishi kerak`;
                case "unrecognized_keys":
                    return `Noma’lum kalit${issue.keys.length > 1 ? "lar" : ""}: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `${issue.origin} dagi kalit noto‘g‘ri`;
                case "invalid_union":
                    return "Noto‘g‘ri kirish";
                case "invalid_element":
                    return `${issue.origin} da noto‘g‘ri qiymat`;
                default:
                    return `Noto‘g‘ri kirish`;
            }
        };
    };
    function uz () {
        return {
            localeError: error$4(),
        };
    }

    const error$3 = () => {
        const Sizable = {
            string: { unit: "ký tự", verb: "có" },
            file: { unit: "byte", verb: "có" },
            array: { unit: "phần tử", verb: "có" },
            set: { unit: "phần tử", verb: "có" },
            map: { unit: "phần tử", verb: "có" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "đầu vào",
            email: "địa chỉ email",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ngày giờ ISO",
            date: "ngày ISO",
            time: "giờ ISO",
            duration: "khoảng thời gian ISO",
            ipv4: "địa chỉ IPv4",
            ipv6: "địa chỉ IPv6",
            mac: "địa chỉ MAC",
            cidrv4: "dải IPv4",
            cidrv6: "dải IPv6",
            base64: "chuỗi mã hóa base64",
            base64url: "chuỗi mã hóa base64url",
            json_string: "chuỗi JSON",
            e164: "số E.164",
            credit_card: "số thẻ tín dụng",
            currency_code: "mã tiền tệ",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "đầu vào",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "số",
            array: "mảng",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Đầu vào không hợp lệ: mong đợi instanceof ${issue.expected}, nhận được ${received}`;
                    }
                    return `Đầu vào không hợp lệ: mong đợi ${expected}, nhận được ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Đầu vào không hợp lệ: mong đợi ${stringifyPrimitive(issue.values[0])}`;
                    return `Tùy chọn không hợp lệ: mong đợi một trong các giá trị ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Quá lớn: mong đợi ${issue.origin ?? "giá trị"} ${sizing.verb} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "phần tử"}`;
                    return `Quá lớn: mong đợi ${issue.origin ?? "giá trị"} ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `Quá nhỏ: mong đợi ${issue.origin} ${sizing.verb} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `Quá nhỏ: mong đợi ${issue.origin} ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Chuỗi không hợp lệ: phải bắt đầu bằng "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Chuỗi không hợp lệ: phải kết thúc bằng "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Chuỗi không hợp lệ: phải bao gồm "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Chuỗi không hợp lệ: phải khớp với mẫu ${_issue.pattern}`;
                    return `${FormatDictionary[_issue.format] ?? issue.format} không hợp lệ`;
                }
                case "not_multiple_of":
                    return `Số không hợp lệ: phải là bội số của ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Khóa không được nhận dạng: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Khóa không hợp lệ trong ${issue.origin}`;
                case "invalid_union":
                    return "Đầu vào không hợp lệ";
                case "invalid_element":
                    return `Giá trị không hợp lệ trong ${issue.origin}`;
                default:
                    return `Đầu vào không hợp lệ`;
            }
        };
    };
    function vi () {
        return {
            localeError: error$3(),
        };
    }

    const error$2 = () => {
        const Sizable = {
            string: { unit: "字符", verb: "包含" },
            file: { unit: "字节", verb: "包含" },
            array: { unit: "项", verb: "包含" },
            set: { unit: "项", verb: "包含" },
            map: { unit: "项", verb: "包含" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "输入",
            email: "电子邮件",
            url: "URL",
            emoji: "表情符号",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO日期时间",
            date: "ISO日期",
            time: "ISO时间",
            duration: "ISO时长",
            ipv4: "IPv4地址",
            ipv6: "IPv6地址",
            mac: "MAC地址",
            cidrv4: "IPv4网段",
            cidrv6: "IPv6网段",
            base64: "base64编码字符串",
            base64url: "base64url编码字符串",
            json_string: "JSON字符串",
            e164: "E.164号码",
            credit_card: "信用卡号",
            currency_code: "货币代码",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "输入",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "数字",
            array: "数组",
            null: "空值(null)",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `无效输入：期望 instanceof ${issue.expected}，实际接收 ${received}`;
                    }
                    return `无效输入：期望 ${expected}，实际接收 ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `无效输入：期望 ${stringifyPrimitive(issue.values[0])}`;
                    return `无效选项：期望以下之一 ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `数值过大：期望 ${issue.origin ?? "值"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "个元素"}`;
                    return `数值过大：期望 ${issue.origin ?? "值"} ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `数值过小：期望 ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `数值过小：期望 ${issue.origin} ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `无效字符串：必须以 "${_issue.prefix}" 开头`;
                    if (_issue.format === "ends_with")
                        return `无效字符串：必须以 "${_issue.suffix}" 结尾`;
                    if (_issue.format === "includes")
                        return `无效字符串：必须包含 "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `无效字符串：必须满足正则表达式 ${_issue.pattern}`;
                    return `无效${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `无效数字：必须是 ${issue.divisor} 的倍数`;
                case "unrecognized_keys":
                    return `出现未知的键(key): ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `${issue.origin} 中的键(key)无效`;
                case "invalid_union":
                    return "无效输入";
                case "invalid_element":
                    return `${issue.origin} 中包含无效值(value)`;
                default:
                    return `无效输入`;
            }
        };
    };
    function zhCN () {
        return {
            localeError: error$2(),
        };
    }

    const error$1 = () => {
        const Sizable = {
            string: { unit: "字元", verb: "擁有" },
            file: { unit: "位元組", verb: "擁有" },
            array: { unit: "項目", verb: "擁有" },
            set: { unit: "項目", verb: "擁有" },
            map: { unit: "項目", verb: "擁有" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "輸入",
            email: "郵件地址",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "ISO 日期時間",
            date: "ISO 日期",
            time: "ISO 時間",
            duration: "ISO 期間",
            ipv4: "IPv4 位址",
            ipv6: "IPv6 位址",
            mac: "MAC 位址",
            cidrv4: "IPv4 範圍",
            cidrv6: "IPv6 範圍",
            base64: "base64 編碼字串",
            base64url: "base64url 編碼字串",
            json_string: "JSON 字串",
            e164: "E.164 數值",
            credit_card: "信用卡號",
            currency_code: "貨幣代碼",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "輸入",
        };
        const TypeDictionary = {
            nan: "NaN",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `無效的輸入值：預期為 instanceof ${issue.expected}，但收到 ${received}`;
                    }
                    return `無效的輸入值：預期為 ${expected}，但收到 ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `無效的輸入值：預期為 ${stringifyPrimitive(issue.values[0])}`;
                    return `無效的選項：預期為以下其中之一 ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `數值過大：預期 ${issue.origin ?? "值"} 應為 ${adj}${issue.maximum.toString()} ${sizing.unit ?? "個元素"}`;
                    return `數值過大：預期 ${issue.origin ?? "值"} 應為 ${adj}${issue.maximum.toString()}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing) {
                        return `數值過小：預期 ${issue.origin} 應為 ${adj}${issue.minimum.toString()} ${sizing.unit}`;
                    }
                    return `數值過小：預期 ${issue.origin} 應為 ${adj}${issue.minimum.toString()}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with") {
                        return `無效的字串：必須以 "${_issue.prefix}" 開頭`;
                    }
                    if (_issue.format === "ends_with")
                        return `無效的字串：必須以 "${_issue.suffix}" 結尾`;
                    if (_issue.format === "includes")
                        return `無效的字串：必須包含 "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `無效的字串：必須符合格式 ${_issue.pattern}`;
                    return `無效的 ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `無效的數字：必須為 ${issue.divisor} 的倍數`;
                case "unrecognized_keys":
                    return `無法識別的鍵值${issue.keys.length > 1 ? "們" : ""}：${joinValues(issue.keys, "、")}`;
                case "invalid_key":
                    return `${issue.origin} 中有無效的鍵值`;
                case "invalid_union":
                    return "無效的輸入值";
                case "invalid_element":
                    return `${issue.origin} 中有無效的值`;
                default:
                    return `無效的輸入值`;
            }
        };
    };
    function zhTW () {
        return {
            localeError: error$1(),
        };
    }

    const error = () => {
        const Sizable = {
            string: { unit: "àmi", verb: "ní" },
            file: { unit: "bytes", verb: "ní" },
            array: { unit: "nkan", verb: "ní" },
            set: { unit: "nkan", verb: "ní" },
            map: { unit: "nkan", verb: "ní" },
        };
        function getSizing(origin) {
            return Sizable[origin] ?? null;
        }
        const FormatDictionary = {
            regex: "ẹ̀rọ ìbáwọlé",
            email: "àdírẹ́sì ìmẹ́lì",
            url: "URL",
            emoji: "emoji",
            uuid: "UUID",
            uuidv4: "UUIDv4",
            uuidv6: "UUIDv6",
            nanoid: "nanoid",
            guid: "GUID",
            cuid: "cuid",
            cuid2: "cuid2",
            ulid: "ULID",
            xid: "XID",
            ksuid: "KSUID",
            datetime: "àkókò ISO",
            date: "ọjọ́ ISO",
            time: "àkókò ISO",
            duration: "àkókò tó pé ISO",
            ipv4: "àdírẹ́sì IPv4",
            ipv6: "àdírẹ́sì IPv6",
            mac: "àdírẹ́sì MAC",
            cidrv4: "àgbègbè IPv4",
            cidrv6: "àgbègbè IPv6",
            base64: "ọ̀rọ̀ tí a kọ́ ní base64",
            base64url: "ọ̀rọ̀ base64url",
            json_string: "ọ̀rọ̀ JSON",
            e164: "nọ́mbà E.164",
            credit_card: "nọmba kaadi gbese",
            currency_code: "koodu owó",
            iban: "IBAN",
            jwt: "JWT",
            template_literal: "ẹ̀rọ ìbáwọlé",
        };
        const TypeDictionary = {
            nan: "NaN",
            number: "nọ́mbà",
            array: "akopọ",
        };
        return (issue) => {
            switch (issue.code) {
                case "invalid_type": {
                    const expected = TypeDictionary[issue.expected] ?? issue.expected;
                    const receivedType = parsedType(issue.input);
                    const received = TypeDictionary[receivedType] ?? receivedType;
                    if (/^[A-Z]/.test(issue.expected)) {
                        return `Ìbáwọlé aṣìṣe: a ní láti fi instanceof ${issue.expected}, àmọ̀ a rí ${received}`;
                    }
                    return `Ìbáwọlé aṣìṣe: a ní láti fi ${expected}, àmọ̀ a rí ${received}`;
                }
                case "invalid_value":
                    if (issue.values.length === 1)
                        return `Ìbáwọlé aṣìṣe: a ní láti fi ${stringifyPrimitive(issue.values[0])}`;
                    return `Àṣàyàn aṣìṣe: yan ọ̀kan lára ${joinValues(issue.values, "|")}`;
                case "too_big": {
                    const adj = issue.inclusive ? "<=" : "<";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Tó pọ̀ jù: a ní láti jẹ́ pé ${issue.origin ?? "iye"} ${sizing.verb} ${adj}${issue.maximum} ${sizing.unit}`;
                    return `Tó pọ̀ jù: a ní láti jẹ́ ${adj}${issue.maximum}`;
                }
                case "too_small": {
                    const adj = issue.inclusive ? ">=" : ">";
                    const sizing = getSizing(issue.origin);
                    if (sizing)
                        return `Kéré ju: a ní láti jẹ́ pé ${issue.origin} ${sizing.verb} ${adj}${issue.minimum} ${sizing.unit}`;
                    return `Kéré ju: a ní láti jẹ́ ${adj}${issue.minimum}`;
                }
                case "invalid_format": {
                    const _issue = issue;
                    if (_issue.format === "starts_with")
                        return `Ọ̀rọ̀ aṣìṣe: gbọ́dọ̀ bẹ̀rẹ̀ pẹ̀lú "${_issue.prefix}"`;
                    if (_issue.format === "ends_with")
                        return `Ọ̀rọ̀ aṣìṣe: gbọ́dọ̀ parí pẹ̀lú "${_issue.suffix}"`;
                    if (_issue.format === "includes")
                        return `Ọ̀rọ̀ aṣìṣe: gbọ́dọ̀ ní "${_issue.includes}"`;
                    if (_issue.format === "regex")
                        return `Ọ̀rọ̀ aṣìṣe: gbọ́dọ̀ bá àpẹẹrẹ mu ${_issue.pattern}`;
                    return `Aṣìṣe: ${FormatDictionary[_issue.format] ?? issue.format}`;
                }
                case "not_multiple_of":
                    return `Nọ́mbà aṣìṣe: gbọ́dọ̀ jẹ́ èyà pípín ti ${issue.divisor}`;
                case "unrecognized_keys":
                    return `Bọtìnì àìmọ̀: ${joinValues(issue.keys, ", ")}`;
                case "invalid_key":
                    return `Bọtìnì aṣìṣe nínú ${issue.origin}`;
                case "invalid_union":
                    return "Ìbáwọlé aṣìṣe";
                case "invalid_element":
                    return `Iye aṣìṣe nínú ${issue.origin}`;
                default:
                    return "Ìbáwọlé aṣìṣe";
            }
        };
    };
    function yo () {
        return {
            localeError: error(),
        };
    }

    var index$2 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        ar: ar,
        az: az,
        be: be,
        bg: bg,
        bn: bn,
        ca: ca,
        ckb: ckb,
        cs: cs,
        da: da,
        de: de,
        el: el,
        en: en,
        eo: eo,
        es: es,
        fa: fa,
        fi: fi,
        fr: fr,
        frCA: frCA,
        gu: gu,
        he: he,
        hi: hi,
        hr: hr,
        hu: hu,
        hy: hy,
        id: id,
        is: is,
        it: it,
        ja: ja,
        ka: ka,
        kh: kh,
        km: km,
        kn: kn,
        ko: ko,
        lt: lt,
        mk: mk,
        ms: ms,
        ne: ne,
        nl: nl,
        nn: nn,
        no: no,
        ota: ota,
        pl: pl,
        ps: ps,
        pt: pt,
        ptBR: ptBR,
        ro: ro,
        ru: ru,
        sk: sk,
        sl: sl,
        sv: sv,
        ta: ta,
        tg: tg,
        th: th,
        tk: tk,
        tr: tr,
        ua: ua,
        uk: uk,
        ur: ur,
        uz: uz,
        vi: vi,
        yo: yo,
        zhCN: zhCN,
        zhTW: zhTW
    });

    var _a;
    const $output = /*@__PURE__*/ Symbol("ZodOutput");
    const $input = /*@__PURE__*/ Symbol("ZodInput");
    class $ZodRegistry {
        constructor() {
            this._map = new WeakMap();
            this._idmap = new Map();
        }
        add(schema, ..._meta) {
            const meta = _meta[0];
            this._map.set(schema, meta);
            if (meta && typeof meta === "object" && "id" in meta) {
                this._idmap.set(meta.id, schema);
            }
            return this;
        }
        clear() {
            this._map = new WeakMap();
            this._idmap = new Map();
            return this;
        }
        remove(schema) {
            const meta = this._map.get(schema);
            if (meta && typeof meta === "object" && "id" in meta) {
                this._idmap.delete(meta.id);
            }
            this._map.delete(schema);
            return this;
        }
        get(schema) {
            // return this._map.get(schema) as any;
            // inherit metadata
            const p = schema._zod.parent;
            if (p) {
                const pm = { ...(this.get(p) ?? {}) };
                delete pm.id; // do not inherit id
                const f = { ...pm, ...this._map.get(schema) };
                return Object.keys(f).length ? f : undefined;
            }
            return this._map.get(schema);
        }
        has(schema) {
            return this._map.has(schema);
        }
    }
    // registries
    function registry() {
        return new $ZodRegistry();
    }
    (_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
    const globalRegistry = globalThis.__zod_globalRegistry;

    /** @internal Sentinel the compiled fast path returns when validation fails. */
    const INVALID = Symbol.for("zod.compile.invalid");
    // Set on the parse ctx when a compiled wrapper falls back to the runtime, so nested compiled wrappers skip their fast paths for the rest of that parse.
    const FALLBACK_FLAG = Symbol.for("zod.compile.fallback");
    /** Raised when the schema contains async refinements or transforms. Surfaces only under `compile(schema, { strict: true })`. */
    class ZodCompileAsyncError extends Error {
        constructor(message = "z.compile does not support async refinements, transforms, or checks") {
            super(message);
            this.name = "ZodCompileAsyncError";
        }
    }
    /**
     * Raised when the schema contains a feature whose semantics the fast path
     * can't fully model. Both the shim in `zod/compile` and the default
     * `compile()` fall back to the runtime parser for that schema; only
     * `compile(schema, { strict: true })` lets it surface.
     */
    class ZodCompileUnsupportedError extends Error {
        constructor(feature, islandable = true) {
            super(`z.compile does not support ${feature}; this schema must use the runtime parser`);
            this.name = "ZodCompileUnsupportedError";
            this.islandable = islandable;
        }
    }
    /**
     * Build the validator `validate` calls: the same codegen as the parser with the output construction
     * dropped. A schema the flag cannot express reuses the parser, which still answers correctly — it
     * just builds a value nothing reads.
     */
    function compileValidator(schema, parser) {
        try {
            return compileFn(schema, { assertOnly: true });
        }
        catch {
            return parser;
        }
    }
    /**
     * AOT-compile a Zod schema. Returns a clone whose `_zod.run` calls a generated
     * fast path first and falls back to the original runtime parser on failure.
     *
     * - Forward direction only. Backward (encode), async, and `skipChecks` paths
     *   bypass the fast path and use the runtime directly.
     * - Never throws. A schema the fast path can't model is returned unchanged and
     *   keeps using the runtime parser. Pass `{ strict: true }` to get the refusal
     *   as a thrown `ZodCompileUnsupportedError` / `ZodCompileAsyncError` instead.
     * - The original schema is unchanged. The clone shares children by reference.
     */
    function compile(schema, options) {
        try {
            const parser = compileFn(schema);
            const clone = withParser(schema, parser);
            // withParser leaves the parser as its own validator; the generated assert-only variant is better when we have one
            clone._zod.bag.validator = compileValidator(schema, parser);
            return clone;
        }
        catch (err) {
            if (options?.strict)
                throw err;
            // a schema we can't compile still has to work, so hand it back untouched on the runtime parser — the same silent fallback global mode already does
            return schema;
        }
    }
    /**
     * Install an already-generated parser as a schema's fast path. Returns a clone; the original is
     * unchanged.
     *
     * The parser takes the input and returns the parsed value, or `INVALID` to hand the parse to the
     * runtime. It must be synchronous and forward-direction, and it must build fresh output rather than
     * return its input — Zod cannot check either, and a wrong *success* is returned to the caller as-is.
     *
     * `compile()` is the ordinary entry point. This is for a build-time or native compiler that produces
     * a parser where `new Function` is unavailable.
     */
    function withParser(schema, parser) {
        // generated code never receives the parse context, so only the runtime can close a reference cycle; compileFn refuses these too
        if (isRecursiveSchema(schema)) {
            throw new ZodCompileUnsupportedError("a schema whose subtree contains a reference cycle");
        }
        const clone$1 = clone(schema);
        // Capture the source-of-truth runtime eagerly. If schema._zod.run is itself a shim installed by global-mode (`__originalRun` set), unwrap past it. Otherwise capturing the live property lazily would let a later self- replacement of schema._zod.run feed our wrapper back into itself.
        const liveRun = schema._zod.run;
        const originalRun = liveRun.__originalRun ?? liveRun;
        // Delegate to the *original* schema's run on bypass/fallback, not the clone's. The original closed over its own `inst` at construction time, and issue payloads use that reference to derive things like the class name for `z.instanceof(Test)`; calling the clone's freshly-initialized run would push issues with `inst === clone` and diverge from the original schema's error messages.
        const wrapped = (payload, ctx) => {
            if (ctx?.async ||
                ctx?.direction === "backward" ||
                ctx?.skipChecks ||
                ctx?.[FALLBACK_FLAG]) {
                return originalRun(payload, ctx);
            }
            // A memoized back-edge: only the runtime can close a reference cycle, and a transform on one must raise $ZodCyclicError from its own parse.
            if (ctx && isBackEdge(ctx, payload.value)) {
                return originalRun(payload, ctx);
            }
            const out = parser(payload.value);
            if (out !== INVALID) {
                payload.value = out;
                return payload;
            }
            // Mark this parse as runtime-driven: under global mode every nested schema carries its own compiled wrapper, and without the flag the parent's runtime fallback re-enters each child's fast path, running user callbacks a third time on invalid input.
            if (ctx)
                ctx[FALLBACK_FLAG] = true;
            return originalRun(payload, ctx);
        };
        // Let later compiles of (or through) this run unwrap to the true runtime — both the global shim and repeated z.compile calls rely on this. The bag also carries the parser and the validator, so the standalone validate can skip the payload and wrapper on the happy path.
        wrapped.__originalRun = originalRun;
        clone$1._zod.bag.fallbackRun = originalRun;
        // a supplied parser answers `validate` too: one implementation means parse and validate cannot disagree, and its undefined `definite` keeps the runtime re-parse on every rejection
        clone$1._zod.bag.validator = parser;
        clone$1._zod.run = wrapped;
        // The fast parse/safeParse closures fall back through the source schema's methods. If the source is shim- or wrapper-managed, those methods route into a compiled run and would execute user callbacks a third time on invalid input — the plain method → wrapper path is exactly 2x, so skip.
        if (!liveRun.__originalRun)
            installCompiledUserMethods(clone$1, schema, parser);
        return clone$1;
    }
    function installCompiledUserMethods(target, source, parser) {
        const targetAny = target;
        const sourceAny = source;
        if (typeof sourceAny.safeParse === "function") {
            const originalSafeParse = sourceAny.safeParse;
            targetAny.safeParse = (data, params) => {
                const out = parser(data);
                if (out !== INVALID) {
                    return { success: true, data: out };
                }
                return originalSafeParse(data, params);
            };
        }
        if (typeof sourceAny.parse === "function") {
            const originalParse = sourceAny.parse;
            targetAny.parse = (data, params) => {
                const out = parser(data);
                if (out !== INVALID) {
                    return out;
                }
                return originalParse(data, params);
            };
        }
    }
    /**
     * @internal Generate the standalone compiled function: a parser by default, a validator under
     * `assertOnly`. Returns the parsed value, `true` where nothing reads the output, or `INVALID`. Consumers use `compile()`.
     */
    function compileFn(schema, options) {
        // Cycle-breaking is keyed on the parse context, which generated code never receives. `shape` can be a getter that throws (z.pick() with an unrecognized mask key), so treat "can't tell" as recursive.
        let recursive = true;
        try {
            recursive = isRecursiveSchema(schema);
        }
        catch { }
        if (recursive) {
            throw new ZodCompileUnsupportedError("a schema whose subtree contains a reference cycle");
        }
        const ctx = {
            constants: new Map(),
            constantCounter: 0,
            varCounter: 0,
            definite: true,
        };
        const doc = new Doc(["input"]);
        const outputAccessor = generateCheck(doc, ctx, schema, "input", !options?.assertOnly);
        // In assert mode a root that built nothing has already returned INVALID on every failure, so reaching the end means valid.
        doc.write(outputAccessor === null ? `return true;` : `return ${outputAccessor};`);
        // Build the function with hoisted constants Always include INVALID as the first constant
        const constantNames = ["INVALID", ...ctx.constants.keys()];
        const constantValues = [INVALID, ...ctx.constants.values()];
        const code = doc.content.join("\n");
        const fullCode = options?.debug
            ? constantNames.length > 0
                ? `// Constants: ${constantNames.join(", ")}\n${code}`
                : code
            : "";
        const F = Function;
        const factoryCode = `return (input) => {\n${code}\n}`;
        let fn;
        try {
            const factory = new F(...constantNames, factoryCode);
            fn = factory(...constantValues);
        }
        catch (err) {
            // Malformed generated code (or a CSP environment rejecting `new Function`) surfaces as a typed error so the global shim falls back to the runtime instead of crashing with a raw SyntaxError/EvalError.
            throw new ZodCompileUnsupportedError(`this schema (generated code failed to evaluate: ${err.message})`);
        }
        if (options?.debug) {
            fn.code = fullCode;
        }
        fn.definite = ctx.definite;
        return fn;
    }
    function addConstant(ctx, value) {
        // Check if we already have this constant
        for (const [name, v] of ctx.constants) {
            if (v === value)
                return name;
        }
        const name = `c${ctx.constantCounter++}`;
        ctx.constants.set(name, value);
        return name;
    }
    /** Hoists a user-supplied callback. Anything the schema's author wrote can throw, and generated code can reject an earlier sibling before ever reaching it, so this clears `definite` — a rejection is then no longer proof that the interpreter would have rejected rather than thrown. */
    function addUserConstant(ctx, fn) {
        ctx.definite = false;
        return addConstant(ctx, fn);
    }
    function newVar(ctx) {
        return `v${ctx.varCounter++}`;
    }
    // Runs a child schema as a black box: its value, or INVALID for a failure or an async run.
    function runtimeRun(schema, value) {
        const result = schema._zod.run({ value, issues: [] }, {});
        if (result && typeof result.then === "function")
            return INVALID;
        const r = result;
        return r.issues.length === 0 ? r.value : INVALID;
    }
    // `null` means the node built no value because nothing reads it. The overloads keep that case out of the 20-odd callers that always want one, so only a caller passing needsValue has to handle it.
    function compileChild(doc, ctx, schema, accessor, needsValue = true) {
        const contentLen = doc.content.length;
        const constantCount = ctx.constants.size;
        const constantCounter = ctx.constantCounter;
        const varCounter = ctx.varCounter;
        try {
            return generateCheck(doc, ctx, schema, accessor, needsValue);
        }
        catch (err) {
            if (!(err instanceof ZodCompileUnsupportedError) || !err.islandable)
                throw err;
            doc.content.length = contentLen;
            if (ctx.constants.size > constantCount) {
                const trailing = Array.from(ctx.constants.keys()).slice(constantCount);
                for (const k of trailing)
                    ctx.constants.delete(k);
            }
            ctx.constantCounter = constantCounter;
            ctx.varCounter = varCounter;
            return emitRuntimeIsland(doc, ctx, schema, accessor);
        }
    }
    function emitRuntimeIsland(doc, ctx, schema, accessor) {
        // an islanded child answers INVALID for an async run too, which the interpreter throws for
        ctx.definite = false;
        const schemaConst = addConstant(ctx, schema);
        const runConst = addConstant(ctx, runtimeRun);
        const outVar = newVar(ctx);
        doc.write(`const ${outVar} = ${runConst}(${schemaConst}, ${accessor});`);
        doc.write(`if (${outVar} === INVALID) return INVALID;`);
        return outVar;
    }
    // Check classes whose `when` is auto-defaulted at init (checks.ts `when ??=`).
    const WHEN_DEFAULTED_CHECKS = new Set([
        "max_size",
        "min_size",
        "size_equals",
        "max_length",
        "min_length",
        "length_equals",
    ]);
    function generateChecks(doc, ctx, schema, accessor) {
        const schemaChecks = schema._zod.def.checks;
        if (!schemaChecks || schemaChecks.length === 0)
            return accessor;
        // Track current accessor - may change if overwrite checks are encountered
        let currentAccessor = accessor;
        for (const check of schemaChecks) {
            const def = check._zod.def;
            // A custom `when` skips a check the fast path always runs; the one auto-defaulted on size/length classes matches its bail-on-first-failure.
            if (def.when && !WHEN_DEFAULTED_CHECKS.has(def.check)) {
                throw new ZodCompileUnsupportedError(`check with a custom "when" condition`);
            }
            switch (def.check) {
                case "greater_than":
                    generateGreaterThanCheck(doc, ctx, def, currentAccessor);
                    break;
                case "less_than":
                    generateLessThanCheck(doc, ctx, def, currentAccessor);
                    break;
                case "multiple_of":
                    generateMultipleOfCheck(doc, ctx, def, currentAccessor);
                    break;
                case "number_format":
                    generateNumberFormatCheck(doc, def, currentAccessor);
                    break;
                case "min_length": {
                    const min = numericOperand(def.minimum, "min_length");
                    const len = codePointLengthVar(doc, ctx, currentAccessor, `${currentAccessor}.length >= ${min} && ${currentAccessor}.length < ${def.minimum * 2}`);
                    doc.write(`if (${len} < ${min}) return INVALID;`);
                    break;
                }
                case "max_length": {
                    const max = numericOperand(def.maximum, "max_length");
                    const len = codePointLengthVar(doc, ctx, currentAccessor, `${currentAccessor}.length > ${max}`);
                    doc.write(`if (${len} > ${max}) return INVALID;`);
                    break;
                }
                case "length_equals": {
                    const exact = numericOperand(def.length, "length_equals");
                    const len = codePointLengthVar(doc, ctx, currentAccessor, `${currentAccessor}.length >= ${exact} && ${currentAccessor}.length <= ${def.length * 2}`);
                    doc.write(`if (${len} !== ${exact}) return INVALID;`);
                    break;
                }
                case "min_size":
                    doc.write(`if (${currentAccessor}.size < ${numericOperand(def.minimum, "min_size")}) return INVALID;`);
                    break;
                case "max_size":
                    doc.write(`if (${currentAccessor}.size > ${numericOperand(def.maximum, "max_size")}) return INVALID;`);
                    break;
                case "size_equals":
                    doc.write(`if (${currentAccessor}.size !== ${numericOperand(def.size, "size_equals")}) return INVALID;`);
                    break;
                case "string_format":
                    currentAccessor = generateStringFormatCheck(doc, ctx, def, currentAccessor);
                    break;
                case "custom":
                    currentAccessor = generateCustomRefineCheck(doc, ctx, check, currentAccessor);
                    break;
                case "bigint_format":
                    generateBigIntFormatCheck(doc, def, currentAccessor);
                    break;
                case "mime_type":
                    generateMimeTypeCheck(doc, ctx, def, currentAccessor);
                    break;
                case "property":
                    generatePropertyCheck(doc, ctx, def, currentAccessor);
                    break;
                case "properties":
                    generatePropertiesChecks(doc, ctx, def, currentAccessor);
                    break;
                case "overwrite": {
                    // Overwrite transforms the value - create new variable for transformed result
                    const newAccessor = newVar(ctx);
                    generateOverwriteCheck(doc, ctx, check, currentAccessor, newAccessor);
                    currentAccessor = newAccessor;
                    break;
                }
                default: {
                    throw new ZodCompileUnsupportedError(`check type ${def.check}`);
                }
            }
        }
        return currentAccessor;
    }
    // Emit the length operand for a length check, mirroring `$ZodCheckMinLength` and friends: strings measure in code points, everything else in `.length`. `inDoubt` is the caller's cheap UTF-16 bound test — outside it the unit count already settles the comparison, so the scan is skipped.
    function codePointLengthVar(doc, ctx, accessor, inDoubt) {
        const cpLen = addConstant(ctx, codePointLength);
        const v = newVar(ctx);
        doc.write(`const ${v} = typeof ${accessor} === "string" && ${inDoubt} ? ${cpLen}(${accessor}) : ${accessor}.length;`);
        return v;
    }
    // Emit a source operand for a gt/lt bound. Numbers inline; Dates hoist as a constant (relational operators compare via valueOf). NaN and Invalid Date bounds can't compile to a comparison that matches runtime semantics.
    /**
     * A count bound reaches generated source verbatim, so a non-number would be
     * emitted as code rather than as a value — `min('0) {} evil(); if (0')` writes an
     * arbitrary statement into the function body. TypeScript types these as `number`
     * and fromJSONSchema guards them, so this is a backstop rather than a live hole,
     * but generated source is the one place a wrong type stops being a type error.
     */
    function numericOperand(value, label) {
        if (typeof value !== "number" || !Number.isFinite(value)) {
            throw new ZodCompileUnsupportedError(`${label} bound of type ${typeof value}`);
        }
        return `${value}`;
    }
    function comparisonOperand(ctx, value) {
        if (typeof value === "bigint")
            return `${value}n`;
        if (typeof value === "number") {
            if (Number.isNaN(value))
                throw new ZodCompileUnsupportedError("comparison check with NaN bound");
            return `${value}`;
        }
        if (value instanceof Date) {
            if (Number.isNaN(value.getTime())) {
                throw new ZodCompileUnsupportedError("comparison check with Invalid Date bound");
            }
            return addConstant(ctx, value);
        }
        throw new ZodCompileUnsupportedError(`comparison check bound of type ${typeof value}`);
    }
    function generateGreaterThanCheck(doc, ctx, def, accessor) {
        const op = def.inclusive ? "<" : "<=";
        doc.write(`if (${accessor} ${op} ${comparisonOperand(ctx, def.value)}) return INVALID;`);
    }
    function generateLessThanCheck(doc, ctx, def, accessor) {
        const op = def.inclusive ? ">" : ">=";
        doc.write(`if (${accessor} ${op} ${comparisonOperand(ctx, def.value)}) return INVALID;`);
    }
    function generateMultipleOfCheck(doc, ctx, def, accessor) {
        if (typeof def.value === "bigint") {
            // a zero divisor has no compiled form: `x % 0n` throws
            if (def.value === BigInt(0))
                throw new ZodCompileUnsupportedError("multiple_of check with a zero divisor");
            doc.write(`if (${accessor} % ${def.value}n !== 0n) return INVALID;`);
        }
        else {
            // Float `%` has well-known precision issues for sub-integer steps
            // (`1.5 % 0.1`, `2.5e-7 % 1e-7`). Defer to util.floatSafeRemainder so the
            // exact tolerance logic stays in one place — single function call is fine
            // since `multipleOf` runs at most once per number.
            const remainder = addConstant(ctx, floatSafeRemainder);
            doc.write(`if (${remainder}(${accessor}, ${numericOperand(def.value, "multiple_of")}) !== 0) return INVALID;`);
        }
    }
    function generateNumberFormatCheck(doc, def, accessor) {
        const format = def.format;
        switch (format) {
            case "safeint":
                doc.write(`if (!Number.isSafeInteger(${accessor})) return INVALID;`);
                break;
            case "int32":
                doc.write(`if (!Number.isInteger(${accessor}) || ${accessor} < -2147483648 || ${accessor} > 2147483647) return INVALID;`);
                break;
            case "uint32":
                doc.write(`if (!Number.isInteger(${accessor}) || ${accessor} < 0 || ${accessor} > 4294967295) return INVALID;`);
                break;
            case "float32":
                // Float32 range per util.NUMBER_FORMAT_RANGES
                doc.write(`if (!Number.isFinite(${accessor}) || ${accessor} < -3.4028234663852886e38 || ${accessor} > 3.4028234663852886e38) return INVALID;`);
                break;
            case "float64":
                doc.write(`if (!Number.isFinite(${accessor})) return INVALID;`);
                break;
            default: {
                throw new ZodCompileUnsupportedError(`number format ${format}`);
            }
        }
    }
    function generateBigIntFormatCheck(doc, def, accessor) {
        const format = def.format;
        if (!format)
            return; // undefined format means no range check
        switch (format) {
            case "int64":
                doc.write(`if (${accessor} < -9223372036854775808n || ${accessor} > 9223372036854775807n) return INVALID;`);
                break;
            case "uint64":
                doc.write(`if (${accessor} < 0n || ${accessor} > 18446744073709551615n) return INVALID;`);
                break;
            default: {
                throw new ZodCompileUnsupportedError(`bigint format ${format}`);
            }
        }
    }
    function generateMimeTypeCheck(doc, ctx, def, accessor) {
        const mimeTypes = def.mime;
        if (mimeTypes && mimeTypes.length > 0) {
            const mimeSet = addConstant(ctx, new Set(mimeTypes));
            doc.write(`if (!${mimeSet}.has(${accessor}.type)) return INVALID;`);
        }
    }
    // asserts each named property in place; children compile assert-only because z.properties never rebuilds its input
    function generatePropertiesChecks(doc, ctx, def, accessor) {
        // a custom `when` gates the assertion at runtime; inside a union a wrongly-run branch is absorbed as a branch failure rather than falling back, so refuse at codegen
        if (def.when) {
            throw new ZodCompileUnsupportedError(`check with a custom "when" condition`);
        }
        // matches the runtime gate: the base schema already typed the value, so only a nullish one is rejected
        doc.write(`if (${accessor} == null) return INVALID;`);
        const shape = def.shape;
        for (const key of Reflect.ownKeys(shape)) {
            // a symbol has no source literal, so it is hoisted as a constant
            const keyExpr = typeof key === "symbol" ? addConstant(ctx, key) : esc(key);
            // cache the property read so a getter runs exactly once, matching the runtime
            const inputVar = newVar(ctx);
            doc.write(`const ${inputVar} = ${accessor}[${keyExpr}];`);
            compileChild(doc, ctx, shape[key], inputVar, false);
        }
    }
    function generatePropertyCheck(doc, ctx, def, accessor) {
        const propAccessor = `${accessor}[${JSON.stringify(def.property)}]`;
        generateCheck(doc, ctx, def.schema, propAccessor);
    }
    function generateOverwriteCheck(doc, ctx, check, currentAccessor, newAccessor) {
        const tx = check._zod.def.tx;
        if (!tx) {
            throw new ZodCompileUnsupportedError("overwrite check without a transform function");
        }
        // Check for async transform
        if (isAsyncFunction(tx)) {
            throw new ZodCompileAsyncError("z.compile: async overwrite transforms are not supported");
        }
        // Hoist the transform function as a constant and apply it
        const txConst = addConstant(ctx, tx);
        doc.write(`const ${newAccessor} = ${txConst}(${currentAccessor});`);
    }
    /** A predicate that hands back a thenable is an async check reached synchronously, and the interpreter throws `$ZodAsyncError` for it. Returning INVALID instead would be a bail-out, and a union reads a bail-out as a rejected branch and answers with a later one — so the throw has to survive into generated code. */
    function throwAsync() {
        throw new $ZodAsyncError();
    }
    /** Shared `addIssue` for the spoofed payloads a refine, check or transform receives. Allocating one per call — a fresh closure plus a `this`-bound method on a fresh literal — pinned every payload-allocating schema at ~2.7M ops/sec against 135M for a plain object literal. It captures nothing per call; it only reaches `this.issues`. */
    function pushIssue(issue) {
        this.issues.push(issue);
    }
    function generateCustomRefineCheck(doc, ctx, check, accessor) {
        const def = check._zod.def;
        if (def.fn) {
            // Simple predicate function (from .refine())
            if (isAsyncFunction(def.fn)) {
                throw new ZodCompileAsyncError("z.compile: async .refine() predicates are not supported");
            }
            const fnConst = addUserConstant(ctx, def.fn);
            const throwAsyncConst = addConstant(ctx, throwAsync);
            const resVar = newVar(ctx);
            doc.write(`const ${resVar} = ${fnConst}(${accessor});`);
            // A thenable is truthy, so it would otherwise read as a pass. It is not a rejection either: the interpreter throws, and INVALID inside a union would just hand the parse to the next branch.
            doc.write(`if (${resVar} instanceof Promise) ${throwAsyncConst}();`);
            doc.write(`if (!${resVar}) return INVALID;`);
            // A `.refine()` predicate only answers yes or no; it cannot rewrite the value.
            return accessor;
        }
        if (check._zod.check) {
            if (isAsyncFunction(check._zod.check)) {
                throw new ZodCompileAsyncError("z.compile: async .superRefine() / check functions are not supported");
            }
            // SuperRefine or other check function - need to spoof context Create a helper that runs the check and returns true if no issues
            const checkFn = check._zod.check;
            // `$RefinementCtx` extends the parse payload, so a check may rewrite
            // `ctx.value` as well as push issues — `.superRefine((v, ctx) => { ctx.value =
            // v.trim() })` is a value transform. Returning only a boolean discarded that
            // write and emitted the untrimmed input. Hand the value back and thread it on.
            const helperFn = (value) => {
                const fakePayload = { value, issues: [], addIssue: pushIssue };
                const result = checkFn(fakePayload);
                // Throw rather than return INVALID: the interpreter throws here, and a union would read INVALID as a rejected branch.
                if (result instanceof Promise)
                    throwAsync();
                return fakePayload.issues.length === 0 ? fakePayload.value : INVALID;
            };
            const helperConst = addUserConstant(ctx, helperFn);
            const outVar = newVar(ctx);
            doc.write(`const ${outVar} = ${helperConst}(${accessor});`);
            doc.write(`if (${outVar} === INVALID) return INVALID;`);
            return outVar;
        }
        throw new ZodCompileUnsupportedError("custom check without a predicate or check function");
    }
    /**
     * Built-in formats that validate with nothing but `def.pattern`, so compiling
     * the regex reproduces the runtime exactly. Deliberately an allowlist: a format
     * missing from it loses its fast path, while a format wrongly added to it
     * silently accepts input the runtime rejects. Formats that layer extra
     * validation over a shape-only pattern (`credit_card`, `base64`, `ipv6`, …) are
     * handled above by hoisting the runtime validator itself.
     */
    const PATTERN_IS_COMPLETE = new Set([
        "cidrv4",
        "cuid",
        "cuid2",
        "date",
        "datetime",
        "duration",
        "e164",
        "email",
        "emoji",
        "ends_with",
        "guid",
        "includes",
        "ipv4",
        "ksuid",
        "lowercase",
        "mac",
        "nanoid",
        "regex",
        "starts_with",
        "time",
        "ulid",
        "uppercase",
        "uuid",
        "xid",
    ]);
    function generateStringFormatCheck(doc, ctx, def, accessor, needsValue = true) {
        // Some string formats do runtime validation beyond their advertised pattern. For cheap pure utility checks, hoist the runtime function and call it so the fast path stays correct without cloning the utility logic into codegen.
        const fmt = def.format;
        if (fmt === "base64") {
            const validator = addConstant(ctx, isValidBase64);
            doc.write(`if (!${validator}(${accessor})) return INVALID;`);
            return accessor;
        }
        if (fmt === "base64url") {
            const validator = addConstant(ctx, isValidBase64URL);
            doc.write(`if (!${validator}(${accessor})) return INVALID;`);
            return accessor;
        }
        if (fmt === "jwt") {
            const validator = addConstant(ctx, isValidJWT);
            const alg = addConstant(ctx, def.alg ?? null);
            doc.write(`if (!${validator}(${accessor}, ${alg})) return INVALID;`);
            return accessor;
        }
        if (fmt === "ipv6") {
            const validator = addConstant(ctx, isValidIPv6);
            doc.write(`if (!${validator}(${accessor})) return INVALID;`);
            return accessor;
        }
        if (fmt === "cidrv6") {
            const validator = addConstant(ctx, isValidCIDRv6);
            doc.write(`if (!${validator}(${accessor})) return INVALID;`);
            return accessor;
        }
        if (fmt === "credit_card") {
            const validator = addConstant(ctx, isValidCreditCard);
            doc.write(`if (!${validator}(${accessor})) return INVALID;`);
            return accessor;
        }
        if (fmt === "iban") {
            const validator = addConstant(ctx, isValidIBAN);
            doc.write(`if (!${validator}(${accessor})) return INVALID;`);
            return accessor;
        }
        const formatDef = def;
        if (fmt === "url" ||
            fmt === "httpurl" ||
            formatDef.normalize ||
            formatDef.hostname !== undefined ||
            formatDef.protocol !== undefined) {
            // Same three predicates the runtime calls, in the same order, so there is no second URL implementation to drift. Which options exist is known now, so the calls the runtime makes conditionally are emitted conditionally instead.
            const parseConst = addConstant(ctx, validateURL);
            const defConst = addConstant(ctx, def);
            const trimVar = newVar(ctx);
            const urlVar = newVar(ctx);
            doc.write(`const ${trimVar} = ${accessor}.trim();`);
            doc.write(`const ${urlVar} = ${parseConst}(${trimVar}, ${defConst});`);
            doc.write(`if (typeof ${urlVar} === "number") return INVALID;`);
            if (formatDef.hostname !== undefined) {
                const hostnameConst = addConstant(ctx, urlHostnameOk);
                doc.write(`if (!${hostnameConst}(${urlVar}, ${defConst}.hostname)) return INVALID;`);
            }
            if (formatDef.protocol !== undefined) {
                const protocolConst = addConstant(ctx, urlProtocolOk);
                doc.write(`if (!${protocolConst}(${urlVar}, ${defConst}.protocol)) return INVALID;`);
            }
            if (!needsValue)
                return null;
            const outputVar = newVar(ctx);
            const outputExpr = formatDef.normalize ? `${urlVar}.href` : `${addConstant(ctx, stripTabAndNewline)}(${trimVar})`;
            doc.write(`const ${outputVar} = ${outputExpr};`);
            return outputVar;
        }
        // A custom string format carries the predicate the runtime actually calls. Hoist and call it instead of testing `def.pattern`: the two only coincide when the format was built from a RegExp, and relying on that coupling is how supplemental validation gets dropped.
        const customFn = def.fn;
        if (customFn) {
            if (isAsyncFunction(customFn))
                throw new ZodCompileUnsupportedError(`async string format ${fmt}`);
            const fnConst = addConstant(ctx, customFn);
            doc.write(`if (!${fnConst}(${accessor})) return INVALID;`);
            return accessor;
        }
        // Formats whose `pattern` IS the whole check. An allowlist rather than `if (def.pattern)`, because credit_card, base64 and ipv6 carry a shape-only pattern and validate the rest separately.
        if (PATTERN_IS_COMPLETE.has(fmt) && def.pattern) {
            const patternConst = addConstant(ctx, def.pattern);
            doc.write(`${patternConst}.lastIndex = 0;`);
            doc.write(`if (!${patternConst}.test(${accessor})) return INVALID;`);
            return accessor;
        }
        const format = def.format;
        switch (format) {
            case "regex":
                // A regex check with a pattern returned above. Reaching here means there is no pattern to test, and accepting unconditionally would pass every input, so hand the schema back to the runtime.
                throw new ZodCompileUnsupportedError("regex format without a pattern");
            case "lowercase":
                doc.write(`if (${accessor} !== ${accessor}.toLowerCase()) return INVALID;`);
                break;
            case "uppercase":
                doc.write(`if (${accessor} !== ${accessor}.toUpperCase()) return INVALID;`);
                break;
            case "includes":
                doc.write(`if (!${accessor}.includes(${esc(def.includes)})) return INVALID;`);
                break;
            case "starts_with": {
                const prefix = def.prefix;
                doc.write(`if (${accessor}.slice(0, ${prefix.length}) !== ${esc(prefix)}) return INVALID;`);
                break;
            }
            case "ends_with": {
                const suffix = def.suffix;
                doc.write(`if (${accessor}.slice(-${suffix.length}) !== ${esc(suffix)}) return INVALID;`);
                break;
            }
            default: {
                throw new ZodCompileUnsupportedError(`string format ${format}`);
            }
        }
        return accessor;
    }
    function generateCheck(doc, ctx, schema, accessor, needsValue = true) {
        const def = schema._zod.def;
        const type = def.type;
        // A coercing schema would compile to the bare type test and reject what it should convert; inside a union that reads as a rejected branch, so refuse at codegen.
        if (def.coerce) {
            throw new ZodCompileUnsupportedError(`coercion (z.coerce.${type}())`);
        }
        // A node builds its output when its caller reads one, or when it carries checks of its own, since a check reads what was built. One polarity for the whole walk: this is what the node does, and it is what its children are told they need.
        const buildsValue = needsValue || !!def.checks?.length;
        let typeAccessor;
        switch (type) {
            case "string":
                typeAccessor = generateStringCheck(doc, ctx, schema, accessor, buildsValue);
                break;
            case "number":
                typeAccessor = generateNumberCheck(doc, schema, accessor);
                break;
            case "boolean":
                typeAccessor = generateBooleanCheck(doc, accessor);
                break;
            case "bigint":
                typeAccessor = generateBigIntCheck(doc, schema, accessor);
                break;
            case "symbol":
                typeAccessor = generateSymbolCheck(doc, accessor);
                break;
            case "undefined":
                typeAccessor = generateUndefinedCheck(doc, accessor);
                break;
            case "null":
                typeAccessor = generateNullCheck(doc, accessor);
                break;
            case "any":
            case "unknown":
                // No check needed - pass through
                typeAccessor = accessor;
                break;
            case "never":
                doc.write("return INVALID;");
                typeAccessor = accessor;
                break;
            case "void":
                typeAccessor = generateVoidCheck(doc, accessor);
                break;
            case "nan":
                typeAccessor = generateNaNCheck(doc, accessor);
                break;
            case "date":
                typeAccessor = generateDateCheck(doc, accessor);
                break;
            case "object":
                typeAccessor = generateObjectCheck(doc, ctx, schema, accessor, buildsValue);
                break;
            case "optional":
                typeAccessor = generateOptionalCheck(doc, ctx, schema, accessor, buildsValue);
                break;
            case "nullable":
                typeAccessor = generateNullableCheck(doc, ctx, schema, accessor, buildsValue);
                break;
            case "array":
                typeAccessor = generateArrayCheck(doc, ctx, schema, accessor, buildsValue);
                break;
            case "literal":
                typeAccessor = generateLiteralCheck(doc, ctx, schema, accessor);
                break;
            case "enum":
                typeAccessor = generateEnumCheck(doc, ctx, schema, accessor);
                break;
            case "readonly": {
                const innerOut = generateWrapperCheck(doc, ctx, schema, accessor);
                // Runtime freezes the parsed value (schemas.ts handleReadonlyResult).
                const frozenVar = newVar(ctx);
                doc.write(`const ${frozenVar} = Object.freeze(${innerOut});`);
                typeAccessor = frozenVar;
                break;
            }
            case "success":
                // Runtime output is `issues.length === 0`. The fast path only reaches
                // here when the inner check passed (failure returns INVALID and the
                // runtime fallback reproduces the inner issues), so the output is
                // always `true`.
                generateWrapperCheck(doc, ctx, schema, accessor);
                typeAccessor = "true";
                break;
            case "default":
            case "prefault":
                typeAccessor = generateDefaultCheck(doc, ctx, schema, accessor);
                break;
            case "nonoptional":
                typeAccessor = generateNonOptionalCheck(doc, ctx, schema, accessor);
                break;
            case "tuple":
                typeAccessor = generateTupleCheck(doc, ctx, schema, accessor);
                break;
            case "union":
                typeAccessor = generateUnionCheck(doc, ctx, schema, accessor);
                break;
            case "intersection":
                typeAccessor = generateIntersectionCheck(doc, ctx, schema, accessor);
                break;
            case "record":
                typeAccessor = generateRecordCheck(doc, ctx, schema, accessor);
                break;
            case "map":
                typeAccessor = generateMapCheck(doc, ctx, schema, accessor);
                break;
            case "set":
                typeAccessor = generateSetCheck(doc, ctx, schema, accessor);
                break;
            case "file":
                typeAccessor = generateFileCheck(doc, accessor);
                break;
            case "template_literal":
                typeAccessor = generateTemplateLiteralCheck(doc, ctx, schema, accessor);
                break;
            case "lazy":
                typeAccessor = generateLazyCheck(doc, ctx, schema, accessor);
                break;
            case "pipe":
                typeAccessor = generatePipeCheck(doc, ctx, schema, accessor);
                break;
            case "custom":
                typeAccessor = generateCustomCheck(doc, ctx, schema, accessor);
                break;
            case "transform":
                typeAccessor = generateTransformCheck(doc, ctx, schema, accessor);
                break;
            case "catch":
                typeAccessor = generateCatchCheck(doc, ctx, schema, accessor);
                break;
            default: {
                throw new ZodCompileUnsupportedError(`schema type ${type}`);
            }
        }
        // a node that built nothing has no checks to run: not building requires an empty check list
        if (typeAccessor === null)
            return null;
        // Generate checks after the type-specific validation (may transform value)
        return generateChecks(doc, ctx, schema, typeAccessor);
    }
    function generateStringCheck(doc, ctx, schema, accessor, needsValue = true) {
        doc.write(`if (typeof ${accessor} !== "string") return INVALID;`);
        // z.email() carries its format on the def, z.string().email() in def.checks; both route here so the format table has no second copy to drift from.
        const def = schema._zod.def;
        if (def.format === undefined)
            return accessor;
        return generateStringFormatCheck(doc, ctx, def, accessor, needsValue);
    }
    function generateNumberCheck(doc, schema, accessor) {
        // Runtime z.number() rejects NaN and ±Infinity. Number.isFinite covers both.
        doc.write(`if (typeof ${accessor} !== "number" || !Number.isFinite(${accessor})) return INVALID;`);
        // Mini factories like z.int(), z.int32(), z.uint32(), z.float32() bake a number_format check into the schema def itself (not into def.checks). Apply the same constraint here.
        const def = schema._zod.def;
        if (def.check === "number_format" && def.format) {
            generateNumberFormatCheck(doc, { format: def.format }, accessor);
        }
        return accessor;
    }
    function generateBooleanCheck(doc, accessor) {
        doc.write(`if (typeof ${accessor} !== "boolean") return INVALID;`);
        return accessor;
    }
    function generateBigIntCheck(doc, schema, accessor) {
        doc.write(`if (typeof ${accessor} !== "bigint") return INVALID;`);
        // Handle bigint format (int64, uint64) directly on the schema def
        const def = schema._zod.def;
        if (def.format) {
            switch (def.format) {
                case "int64":
                    doc.write(`if (${accessor} < -9223372036854775808n || ${accessor} > 9223372036854775807n) return INVALID;`);
                    break;
                case "uint64":
                    doc.write(`if (${accessor} < 0n || ${accessor} > 18446744073709551615n) return INVALID;`);
                    break;
            }
        }
        return accessor;
    }
    function generateSymbolCheck(doc, accessor) {
        doc.write(`if (typeof ${accessor} !== "symbol") return INVALID;`);
        return accessor;
    }
    function generateUndefinedCheck(doc, accessor) {
        doc.write(`if (${accessor} !== undefined) return INVALID;`);
        return accessor;
    }
    function generateNullCheck(doc, accessor) {
        doc.write(`if (${accessor} !== null) return INVALID;`);
        return accessor;
    }
    function generateVoidCheck(doc, accessor) {
        doc.write(`if (${accessor} !== undefined) return INVALID;`);
        return accessor;
    }
    function generateNaNCheck(doc, accessor) {
        doc.write(`if (typeof ${accessor} !== "number" || !Number.isNaN(${accessor})) return INVALID;`);
        return accessor;
    }
    function generateDateCheck(doc, accessor) {
        doc.write(`if (!(${accessor} instanceof Date) || Number.isNaN(${accessor}.getTime())) return INVALID;`);
        return accessor;
    }
    function generateObjectCheck(doc, ctx, schema, accessor, buildsValue = true) {
        const def = schema._zod.def;
        // Check that input is a non-null, non-array object
        doc.write(`if (typeof ${accessor} !== "object" || ${accessor} === null || Array.isArray(${accessor})) return INVALID;`);
        const shape = def.shape;
        const keys = Object.keys(shape);
        const symbolKeys = Object.getOwnPropertySymbols(shape);
        // a symbol has no source literal, so it is hoisted as a constant; `keys` stays string-only where the emitted code uses `for...in`
        const allKeys = symbolKeys.length ? [...keys, ...symbolKeys] : keys;
        const keyExpr = (k) => (typeof k === "symbol" ? addConstant(ctx, k) : esc(k));
        const propKey = (k) => (typeof k === "symbol" ? `[${keyExpr(k)}]` : esc(k));
        const propShape = shape;
        // `__proto__` as an own shape key can't be expressed in an output object literal (the literal form sets the prototype instead of an own property).
        if (keys.includes("__proto__")) {
            throw new ZodCompileUnsupportedError('object shape key "__proto__"');
        }
        // Map from key to output accessor for that property
        const propOutputs = new Map();
        // Validate each property and collect output accessors
        for (const key of allKeys) {
            const propSchema = propShape[key];
            const kx = keyExpr(key);
            // Always cache the property read: the runtime reads input[key] exactly once, so a getter must not be re-read by checks or output assembly.
            const inputVar = newVar(ctx);
            doc.write(`const ${inputVar} = ${accessor}[${kx}];`);
            if (propSchema._zod.optin !== undefined) {
                // Any optin rung means the key may be omitted. The runtime runs the property anyway and ignores issues only when the key is genuinely absent, which is what makes exactOptional compositional.
                const outputVar = newVar(ctx);
                doc.write(`let ${outputVar} = (() => {`);
                doc.indented((d) => {
                    const outputAccessor = compileChild(d, ctx, propSchema, inputVar);
                    d.write(`return ${outputAccessor};`);
                });
                doc.write(`})();`);
                if (propSchema._zod.optout === "optional") {
                    doc.write(`if (${outputVar} === INVALID) {`);
                    doc.indented((d) => {
                        d.write(`if (${kx} in ${accessor}) return INVALID;`);
                        d.write(`${outputVar} = undefined;`);
                    });
                    doc.write(`}`);
                }
                else {
                    doc.write(`if (${outputVar} === INVALID) return INVALID;`);
                }
                propOutputs.set(key, outputVar);
            }
            else {
                if (requiresPresenceCheck(propSchema)) {
                    doc.write(`if (!(${kx} in ${accessor})) return INVALID;`);
                }
                // Generate check and get output accessor
                const outputAccessor = compileChild(doc, ctx, propSchema, inputVar, buildsValue);
                if (outputAccessor !== null)
                    propOutputs.set(key, outputAccessor);
            }
        }
        // Handle catchall
        const catchall = def.catchall;
        let unknownKeysMode = "none";
        if (catchall) {
            const catchallType = catchall._zod.def.type;
            if (catchallType === "never") {
                // Strict: one `for...in`, as the runtime does, so inherited enumerable keys count. An undeclared `__proto__` is reported here and excluded only from the output (#6221); an own-key count would wrongly reject a class instance.
                const condition = keys.map((k) => `k !== ${esc(k)}`).join(" && ") || "true";
                doc.write(`for (const k in ${accessor}) {`);
                doc.indented((d) => {
                    d.write(`if (${condition}) return INVALID;`);
                });
                doc.write(`}`);
            }
            else if ((catchallType === "unknown" || catchallType === "any") && !catchall._zod.def.checks?.length) {
                unknownKeysMode = "passthrough";
            }
            else {
                unknownKeysMode = "schema";
            }
        }
        // else: strip mode (no catchall) - unknown keys ignored, only include known keys
        // defaulted required outputs keep their keys even when undefined
        const outputVar = newVar(ctx);
        const hasConditionalKeys = allKeys.some((k) => mayOmitUndefined(propShape[k]) || dropsWhenAbsent(propShape[k]));
        // Assert mode: every declared key is validated above, so the output literal and the unknown-key copy are pure waste. A `never` catchall already emitted its rejection loop; a schema catchall still has to validate the values it would otherwise have stored.
        if (!buildsValue) {
            if (unknownKeysMode === "schema") {
                const knownSet = keys.length > 0 ? addConstant(ctx, new Set(keys)) : null;
                doc.write(`for (const k in ${accessor}) {`);
                doc.indented((d) => {
                    d.write(`if (k === "__proto__") continue;`);
                    if (knownSet)
                        d.write(`if (${knownSet}.has(k)) continue;`);
                    const valVar = newVar(ctx);
                    d.write(`const ${valVar} = ${accessor}[k];`);
                    compileChild(d, ctx, catchall, valVar, false);
                });
                doc.write(`}`);
            }
            return null;
        }
        if (!hasConditionalKeys) {
            const propLiterals = allKeys.map((k) => `${propKey(k)}: ${propOutputs.get(k)}`).join(", ");
            doc.write(`const ${outputVar} = { ${propLiterals} };`);
        }
        else {
            doc.write(`const ${outputVar} = {};`);
            for (const k of allKeys) {
                const kx = keyExpr(k);
                const out = propOutputs.get(k);
                if (dropsWhenAbsent(propShape[k])) {
                    doc.write(`if (${kx} in ${accessor}) ${outputVar}[${kx}] = ${out};`);
                }
                else if (mayOmitUndefined(propShape[k])) {
                    doc.write(`if (${out} !== undefined || ${kx} in ${accessor}) ${outputVar}[${kx}] = ${out};`);
                }
                else {
                    doc.write(`${outputVar}[${kx}] = ${out};`);
                }
            }
        }
        if (unknownKeysMode !== "none") {
            // Unknown keys are written directly into the output after shape keys — for...in (like the runtime) so inherited enumerables participate.
            const knownSet = keys.length > 0 ? addConstant(ctx, new Set(keys)) : null;
            doc.write(`for (const k in ${accessor}) {`);
            doc.indented((d) => {
                // Skip __proto__: assigning obj["__proto__"] on a plain {} replaces the prototype via the setter rather than adding an own property. Mirrors the runtime catchall fix (#5898).
                d.write(`if (k === "__proto__") continue;`);
                if (knownSet)
                    d.write(`if (${knownSet}.has(k)) continue;`);
                if (unknownKeysMode === "passthrough") {
                    d.write(`${outputVar}[k] = ${accessor}[k];`);
                }
                else {
                    const valVar = newVar(ctx);
                    d.write(`const ${valVar} = ${accessor}[k];`);
                    const catchallOut = compileChild(d, ctx, catchall, valVar);
                    d.write(`${outputVar}[k] = ${catchallOut};`);
                }
            });
            doc.write(`}`);
        }
        return outputVar;
    }
    function generateOptionalCheck(doc, ctx, schema, accessor, buildsValue = true) {
        const def = schema._zod.def;
        if (isExactOptional(schema)) {
            return generateCheck(doc, ctx, def.innerType, accessor, buildsValue);
        }
        // Same question $ZodOptional asks: only the top rung of the optin ladder substitutes a value for an absent input, so only it is worth running on `undefined`. Every other rung leaves the value intact, which is the skip branch below.
        if (def.innerType._zod.optin === "defaulted") {
            const outputVar = newVar(ctx);
            const branchVar = newVar(ctx);
            doc.write(`let ${outputVar};`);
            doc.write(`if (${accessor} === undefined) {`);
            doc.indented((d) => {
                d.write(`const ${branchVar} = (() => {`);
                d.indented((d2) => {
                    const innerOutput = generateCheck(d2, ctx, def.innerType, accessor);
                    d2.write(`return ${innerOutput};`);
                });
                d.write(`})();`);
                d.write(`if (${branchVar} !== INVALID) ${outputVar} = ${branchVar};`);
            });
            doc.write(`} else {`);
            doc.indented((d) => {
                const innerOutput = generateCheck(d, ctx, def.innerType, accessor);
                d.write(`${outputVar} = ${innerOutput};`);
            });
            doc.write(`}`);
            return outputVar;
        }
        const outputVar = buildsValue ? newVar(ctx) : null;
        if (outputVar)
            doc.write(`let ${outputVar};`);
        doc.write(`if (${accessor} !== undefined) {`);
        doc.indented((d) => {
            const innerOutput = generateCheck(d, ctx, def.innerType, accessor, buildsValue);
            if (outputVar && innerOutput !== null)
                d.write(`${outputVar} = ${innerOutput};`);
        });
        doc.write(`}`);
        return outputVar;
    }
    function isExactOptional(schema) {
        return schema._zod.traits?.has("$ZodExactOptional") === true;
    }
    // A value-level fast path reads an absent key as `undefined`, so z.undefined(), z.any() and unions containing undefined would accept a missing property the runtime rejects.
    function requiresPresenceCheck(schema) {
        return schema._zod.optin === undefined && fastPathAcceptsAbsence(schema);
    }
    function fastPathAcceptsAbsence(schema) {
        // An island is handed `input[key]` and cannot tell absent from explicitly undefined, so report absence-accepting and let the object emit the presence guard (#6405).
        if (schema._zod.def.coerce)
            return true;
        const def = schema._zod.def;
        switch (def.type) {
            case "any":
            case "unknown":
            case "undefined":
            case "void":
            case "default":
            case "prefault":
            case "transform":
            case "custom":
            case "lazy":
                return true;
            case "string":
            case "number":
            case "boolean":
            case "bigint":
            case "symbol":
            case "null":
            case "never":
            case "nan":
            case "date":
            case "object":
            case "array":
            case "tuple":
            case "record":
            case "map":
            case "set":
            case "file":
            case "template_literal":
                return false;
            case "nonoptional":
                // Normally rejects an absent key, but not when something inside supplies a value for it: `.default(v).optional().nonoptional()` accepts absence and yields v. Defer to the inner — over-reporting here only costs a presence check, and a fast path that wrongly rejects still falls back to the runtime.
                return def.innerType ? fastPathAcceptsAbsence(def.innerType) : false;
            case "literal":
                return !!def.values?.includes(undefined);
            case "enum":
                return !!schema._zod.values?.has(undefined);
            case "optional":
            case "nullable":
            case "readonly":
            case "success":
                return def.innerType ? fastPathAcceptsAbsence(def.innerType) : true;
            case "catch":
                // catch always produces a value (inner may fail → catchValue substitutes), so it accepts an absent key regardless of inner.
                return true;
            case "union":
                return def.options ? def.options.some(fastPathAcceptsAbsence) : true;
            case "intersection":
                if (!def.left || !def.right)
                    return true;
                return fastPathAcceptsAbsence(def.left) && fastPathAcceptsAbsence(def.right);
            case "pipe":
                return def.in ? fastPathAcceptsAbsence(def.in) : true;
            default:
                return true;
        }
    }
    /** The middle rung permits absence without supplying anything in its place, so an absent key contributes nothing — mirrors the leading gate in `handlePropertyResult`. */
    function dropsWhenAbsent(schema) {
        return schema._zod.optin === "optional" && schema._zod.optout === "optional";
    }
    function mayOmitUndefined(schema) {
        return (schema._zod.optin !== "defaulted" || schema._zod.optout === "optional") && mayOutputUndefined(schema);
    }
    // whether a schema's success-path output can be undefined
    function mayOutputUndefined(schema) {
        const def = schema._zod.def;
        switch (def.type) {
            case "string":
            case "number":
            case "boolean":
            case "bigint":
            case "symbol":
            case "null":
            case "nan":
            case "date":
            case "object":
            case "array":
            case "tuple":
            case "record":
            case "map":
            case "set":
            case "file":
            case "template_literal":
            case "never":
            case "success":
                return false;
            case "literal":
                return !!def.values?.includes(undefined);
            case "enum":
                return !!schema._zod.values?.has(undefined);
            case "optional":
                return true;
            case "nullable":
            case "readonly":
            case "nonoptional":
                return def.innerType ? mayOutputUndefined(def.innerType) : true;
            case "union":
                return def.options ? def.options.some(mayOutputUndefined) : true;
            case "intersection":
                return !def.left || !def.right || mayOutputUndefined(def.left) || mayOutputUndefined(def.right);
            case "pipe":
                return def.out ? mayOutputUndefined(def.out) : true;
            default:
                // any/unknown/undefined/void/default/prefault/transform/custom/lazy/catch
                return true;
        }
    }
    function generateNullableCheck(doc, ctx, schema, accessor, buildsValue = true) {
        const def = schema._zod.def;
        const outputVar = buildsValue ? newVar(ctx) : null;
        if (outputVar)
            doc.write(`let ${outputVar} = null;`);
        doc.write(`if (${accessor} !== null) {`);
        doc.indented((d) => {
            const innerOutput = generateCheck(d, ctx, def.innerType, accessor, buildsValue);
            if (outputVar && innerOutput !== null)
                d.write(`${outputVar} = ${innerOutput};`);
        });
        doc.write(`}`);
        return outputVar;
    }
    function generateSizeGate(doc, schema, size) {
        for (const [max, check] of sizeCaps(schema._zod.def.checks)) {
            doc.write(`if (${size} > ${numericOperand(max, check._zod.def.check)}) return INVALID;`);
        }
    }
    function generateArrayCheck(doc, ctx, schema, accessor, buildsValue = true) {
        const def = schema._zod.def;
        doc.write(`if (!Array.isArray(${accessor})) return INVALID;`);
        generateSizeGate(doc, schema, `${accessor}.length`);
        // Build a new array with validated/transformed elements.
        const outputVar = buildsValue ? newVar(ctx) : null;
        const iVar = newVar(ctx);
        const elemVar = newVar(ctx);
        if (outputVar)
            doc.write(`const ${outputVar} = new Array(${accessor}.length);`);
        doc.write(`for (let ${iVar} = 0; ${iVar} < ${accessor}.length; ${iVar}++) {`);
        doc.indented((d) => {
            d.write(`const ${elemVar} = ${accessor}[${iVar}];`);
            const elemOutput = compileChild(d, ctx, def.element, elemVar, buildsValue);
            if (outputVar && elemOutput !== null)
                d.write(`${outputVar}[${iVar}] = ${elemOutput};`);
        });
        doc.write(`}`);
        return outputVar;
    }
    function generateLiteralCheck(doc, ctx, schema, accessor) {
        const def = schema._zod.def;
        const values = def.values;
        // Anything but a single value goes through Set.has: multi-value so every value participates, empty so nothing does — values[0] would be undefined and compile to an `!== undefined` check that accepts it. Single-value stays inlined for speed.
        if (values.length !== 1) {
            const literalSet = addConstant(ctx, new Set(values));
            doc.write(`if (!${literalSet}.has(${accessor})) return INVALID;`);
            return accessor;
        }
        const value = values[0];
        // `$ZodLiteral` matches with `values.has`, i.e. SameValueZero, so NaN matches itself. `x !== NaN` is true for every input, which would reject everything — hand it to the same Set form the multi-value path uses.
        if (typeof value === "number" && Number.isNaN(value)) {
            const literalSet = addConstant(ctx, new Set(values));
            doc.write(`if (!${literalSet}.has(${accessor})) return INVALID;`);
            return accessor;
        }
        if (typeof value === "string") {
            doc.write(`if (${accessor} !== ${esc(value)}) return INVALID;`);
        }
        else if (typeof value === "number" || typeof value === "boolean") {
            doc.write(`if (${accessor} !== ${value}) return INVALID;`);
        }
        else if (value === null) {
            doc.write(`if (${accessor} !== null) return INVALID;`);
        }
        else if (value === undefined) {
            doc.write(`if (${accessor} !== undefined) return INVALID;`);
        }
        else if (typeof value === "bigint") {
            doc.write(`if (${accessor} !== ${value}n) return INVALID;`);
        }
        else {
            throw new ZodCompileUnsupportedError(`literal type ${typeof value}`);
        }
        return accessor;
    }
    function generateEnumCheck(doc, ctx, schema, accessor) {
        const values = schema._zod.values;
        // z.partialRecord and friends clear `_zod.values`, leaving no set to test membership against. Throw rather than emit INVALID so a union falls back whole instead of counting a false rejection.
        if (!values) {
            throw new ZodCompileUnsupportedError("enum schema without enumerated values");
        }
        const enumSet = addConstant(ctx, values);
        doc.write(`if (!${enumSet}.has(${accessor})) return INVALID;`);
        return accessor;
    }
    function generateWrapperCheck(doc, ctx, schema, accessor) {
        const def = schema._zod.def;
        return generateCheck(doc, ctx, def.innerType, accessor);
    }
    function generateDefaultCheck(doc, ctx, schema, accessor) {
        const def = schema._zod.def;
        // `defaultValue` is an accessor on schemas built through the classic/mini
        // factories and a plain data property on ones rebuilt programmatically
        // (deepPartial and friends). Read it off the def either way — taking only
        // `descriptor.get` silently dropped the default for the second kind, so
        // `.default(v)` compiled to `undefined` instead of `v`.
        const descriptor = Object.getOwnPropertyDescriptor(schema._zod.def, "defaultValue");
        const defaultGetter = descriptor
            ? () => schema._zod.def.defaultValue
            : undefined;
        // prefault differs from default: undefined-input is first replaced with the prefault value, then run through the inner schema.
        if (schema._zod.def.type === "prefault") {
            if (!defaultGetter) {
                return generateCheck(doc, ctx, def.innerType, accessor);
            }
            const defaultFn = addConstant(ctx, defaultGetter);
            const inputVar = newVar(ctx);
            doc.write(`let ${inputVar} = ${accessor};`);
            doc.write(`if (${accessor} === undefined) ${inputVar} = ${defaultFn}();`);
            return generateCheck(doc, ctx, def.innerType, inputVar);
        }
        const outputVar = newVar(ctx);
        // Default allows undefined (replaces with default value), otherwise validates inner type
        if (defaultGetter) {
            const defaultFn = addConstant(ctx, defaultGetter);
            const cloneFn = addConstant(ctx, shallowClone);
            doc.write(`let ${outputVar};`);
            doc.write(`if (${accessor} === undefined) {`);
            doc.indented((d) => {
                // Shallow-clone the default so callers can mutate the result without affecting subsequent parses (#5855 — also covers Map/Set).
                d.write(`${outputVar} = ${cloneFn}(${defaultFn}());`);
            });
            doc.write(`} else {`);
            doc.indented((d) => {
                const innerOutput = generateCheck(d, ctx, def.innerType, accessor);
                d.write(`${outputVar} = ${innerOutput} === undefined ? ${cloneFn}(${defaultFn}()) : ${innerOutput};`);
            });
            doc.write(`}`);
        }
        else {
            doc.write(`let ${outputVar};`);
            doc.write(`if (${accessor} !== undefined) {`);
            doc.indented((d) => {
                const innerOutput = generateCheck(d, ctx, def.innerType, accessor);
                d.write(`${outputVar} = ${innerOutput};`);
            });
            doc.write(`}`);
        }
        return outputVar;
    }
    function generateNonOptionalCheck(doc, ctx, schema, accessor) {
        const def = schema._zod.def;
        // The runtime inspects what the inner produced, not what it was given: a catch can turn a defined input into undefined, a default an absent one into a value.
        const innerOutput = generateCheck(doc, ctx, def.innerType, accessor);
        const outputVar = newVar(ctx);
        doc.write(`const ${outputVar} = ${innerOutput};`);
        doc.write(`if (${outputVar} === undefined) return INVALID;`);
        return outputVar;
    }
    function generateTupleCheck(doc, ctx, schema, accessor) {
        const def = schema._zod.def;
        const items = def.items;
        const rest = def.rest;
        doc.write(`if (!Array.isArray(${accessor})) return INVALID;`);
        // Mirror the runtime's getTupleOptStart: find the first index where every subsequent slot accepts `undefined` (i.e. is optional on input). Anything shorter than this is too_small; trailing absent slots are legal.
        const optinStart = getTupleOptStart(items, "optin");
        const optoutStart = getTupleOptStart(items, "optout");
        // Length bounds
        if (rest) {
            // With rest: minimum length is the last required input slot
            doc.write(`if (${accessor}.length < ${optinStart}) return INVALID;`);
        }
        else {
            // No rest: input must be in [optinStart, items.length]
            doc.write(`if (${accessor}.length < ${optinStart} || ${accessor}.length > ${items.length}) return INVALID;`);
        }
        // Build the output in assignment order so absent optional-output tail slots can truncate while default/prefault slots still fill missing positions.
        const outputVar = newVar(ctx);
        doc.write(`const ${outputVar} = [];`);
        // Validate and collect each fixed item
        for (let i = 0; i < items.length; i++) {
            const itemSchema = items[i];
            if (i >= optoutStart) {
                doc.write(`if (${outputVar}.length === ${i}) {`);
                doc.indented((d) => {
                    d.write(`if (${i} < ${accessor}.length) {`);
                    d.indented((d2) => {
                        const elemVar = newVar(ctx);
                        d2.write(`const ${elemVar} = ${accessor}[${i}];`);
                        const elemOutput = compileChild(d2, ctx, itemSchema, elemVar);
                        d2.write(`${outputVar}[${i}] = ${elemOutput};`);
                    });
                    d.write(`} else {`);
                    d.indented((d2) => {
                        // Middle rung: absence supplies nothing in its place, so truncate rather than running the item on `undefined` and keeping what it invents. Mirrors the leading gate in `handleTupleResults`.
                        if (dropsWhenAbsent(itemSchema)) {
                            d2.write(`${outputVar}.length = ${i};`);
                            return;
                        }
                        const elemVar = newVar(ctx);
                        const branchVar = newVar(ctx);
                        d2.write(`const ${elemVar} = undefined;`);
                        d2.write(`const ${branchVar} = (() => {`);
                        d2.indented((d3) => {
                            const elemOutput = compileChild(d3, ctx, itemSchema, elemVar);
                            d3.write(`return ${elemOutput};`);
                        });
                        d2.write(`})();`);
                        d2.write(`if (${branchVar} === INVALID || ${branchVar} === undefined) ${outputVar}.length = ${i};`);
                        d2.write(`else ${outputVar}[${i}] = ${branchVar};`);
                    });
                    d.write(`}`);
                });
                doc.write(`}`);
            }
            else {
                const elemVar = newVar(ctx);
                doc.write(`const ${elemVar} = ${accessor}[${i}];`);
                const elemOutput = compileChild(doc, ctx, itemSchema, elemVar);
                doc.write(`${outputVar}[${i}] = ${elemOutput};`);
            }
        }
        // Validate and collect rest elements if present
        if (rest) {
            const iVar = newVar(ctx);
            const elemVar = newVar(ctx);
            doc.write(`for (let ${iVar} = ${items.length}; ${iVar} < ${accessor}.length; ${iVar}++) {`);
            doc.indented((d) => {
                d.write(`const ${elemVar} = ${accessor}[${iVar}];`);
                const elemOutput = compileChild(d, ctx, rest, elemVar);
                d.write(`${outputVar}[${iVar}] = ${elemOutput};`);
            });
            doc.write(`}`);
        }
        return outputVar;
    }
    function getTupleOptStart(items, key) {
        for (let i = items.length - 1; i >= 0; i--) {
            // Mirrors the runtime: optin is a three-rung ladder so any rung above `undefined` permits an absent slot; optout stays two-valued.
            const omittable = key === "optin" ? items[i]._zod.optin !== undefined : items[i]._zod.optout === "optional";
            if (!omittable)
                return i + 1;
        }
        return 0;
    }
    function generateUnionCheck(doc, ctx, schema, accessor) {
        const def = schema._zod.def;
        const options = def.options;
        if (def.discriminator) {
            return generateDiscriminatedUnionCheck(doc, ctx, def, accessor);
        }
        // z.xor requires *exactly one* option to match. Match-counting in the fast path is only sound if every branch is exactly as strict as the runtime — any falsely-rejecting branch silently turns a multi-match rejection into an accept. Force the runtime for this rare combinator.
        if (def.inclusive === false) {
            throw new ZodCompileUnsupportedError("exclusive unions (z.xor)");
        }
        if (options.length === 0) {
            doc.write("return INVALID;");
            return accessor;
        }
        if (options.length === 1) {
            return generateCheck(doc, ctx, options[0], accessor);
        }
        // Check if all options are bare literals - use Set optimization. A literal option carrying checks (e.g. .refine) must take the general path or the Set would accept values its checks reject.
        const allLiterals = options.every((opt) => opt._zod.def.type === "literal" && !opt._zod.def.checks?.length);
        if (allLiterals) {
            const values = new Set(options.flatMap((opt) => opt._zod.def.values));
            const valuesConst = addConstant(ctx, values);
            doc.write(`if (!${valuesConst}.has(${accessor})) return INVALID;`);
            return accessor;
        }
        // General case: try each option until one succeeds Use IIFEs that return the output or INVALID
        const outputVar = newVar(ctx);
        doc.write(`let ${outputVar};`);
        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            if (i === 0) {
                doc.write(`${outputVar} = (() => {`);
            }
            else {
                doc.write(`if (${outputVar} === INVALID) ${outputVar} = (() => {`);
            }
            doc.indented((d) => {
                // Generate check inside IIFE - returns INVALID on failure
                const branchOutput = generateCheck(d, ctx, opt, accessor);
                d.write(`return ${branchOutput};`);
            });
            doc.write(`})();`);
        }
        doc.write(`if (${outputVar} === INVALID) return INVALID;`);
        return outputVar;
    }
    function generateDiscriminatedUnionCheck(doc, ctx, def, accessor) {
        if (def.unionFallback) {
            throw new ZodCompileUnsupportedError("discriminated union with unionFallback");
        }
        if (def.options.length === 0) {
            doc.write("return INVALID;");
            return accessor;
        }
        const discVar = newVar(ctx);
        const outputVar = newVar(ctx);
        doc.write(`const ${discVar} = ${accessor}?.[${esc(def.discriminator)}];`);
        doc.write(`let ${outputVar};`);
        let firstBranch = true;
        const claimed = new Set();
        for (const option of def.options) {
            const values = option._zod.propValues?.[def.discriminator];
            if (!values || values.size === 0) {
                throw new ZodCompileUnsupportedError("discriminated union option without static discriminator values");
            }
            // let the interpreter handle collisions instead of compiling first-match dispatch
            for (const value of values) {
                if (claimed.has(value)) {
                    throw new ZodCompileUnsupportedError(`duplicate discriminator value ${String(value)}`);
                }
                claimed.add(value);
            }
            const conditions = Array.from(values, (value) => literalEquality(ctx, discVar, value));
            const prefix = firstBranch ? "if" : "else if";
            doc.write(`${prefix} (${conditions.join(" || ")}) {`);
            doc.indented((d) => {
                const branchOutput = generateCheck(d, ctx, option, accessor);
                d.write(`${outputVar} = ${branchOutput};`);
            });
            doc.write(`}`);
            firstBranch = false;
        }
        doc.write(`else { return INVALID; }`);
        return outputVar;
    }
    function literalEquality(ctx, accessor, value) {
        if (typeof value === "string")
            return `${accessor} === ${esc(value)}`;
        if (typeof value === "number") {
            if (Number.isNaN(value))
                return `Number.isNaN(${accessor})`;
            return `${accessor} === ${value}`;
        }
        if (typeof value === "boolean")
            return `${accessor} === ${value}`;
        if (value === null)
            return `${accessor} === null`;
        if (value === undefined)
            return `${accessor} === undefined`;
        if (typeof value === "bigint")
            return `${accessor} === ${value}n`;
        if (typeof value === "symbol") {
            const symbolConst = addConstant(ctx, value);
            return `${accessor} === ${symbolConst}`;
        }
        throw new ZodCompileUnsupportedError(`literal discriminator value ${String(value)}`);
    }
    function generateIntersectionCheck(doc, ctx, schema, accessor) {
        const def = schema._zod.def;
        // An unmergeable merge, and a child failing before the merge is even reached, both return INVALID for a case the interpreter answers with a throw.
        ctx.definite = false;
        const leftOutput = compileChild(doc, ctx, def.left, accessor);
        const rightOutput = compileChild(doc, ctx, def.right, accessor);
        // Hoist the runtime merge helper so recursive object/array merge semantics stay in one place. If the merge is invalid, return INVALID and let the runtime fallback construct canonical errors.
        const mergeConst = addConstant(ctx, mergeValues);
        const mergedVar = newVar(ctx);
        doc.write(`const ${mergedVar} = ${mergeConst}(${leftOutput}, ${rightOutput});`);
        doc.write(`if (!${mergedVar}.valid) return INVALID;`);
        return `${mergedVar}.data`;
    }
    function generateRecordCheck(doc, ctx, schema, accessor) {
        const def = schema._zod.def;
        // Use util.isPlainObject (rejects Date, Map, Set, class instances, etc.) to match runtime behavior. Hoisted call instead of inline so this stays a single source of truth with the runtime parser.
        const isPlainObjectConst = addConstant(ctx, isPlainObject);
        doc.write(`if (!${isPlainObjectConst}(${accessor})) return INVALID;`);
        const outputVar = newVar(ctx);
        const kVar = newVar(ctx);
        const valVar = newVar(ctx);
        doc.write(`const ${outputVar} = {};`);
        // Exhaustive record. The runtime gates this on `values && !def.partial`, since z.partialRecord keeps its value set but makes every key optional; a loose record passes unrecognized keys through, which the per-key scan cannot express.
        const recordDef = def;
        const keyValues = recordDef.partial ? undefined : def.keyType._zod.values;
        if (keyValues) {
            const inputKeys = [];
            for (const key of keyValues) {
                if (!(typeof key === "string" || typeof key === "number" || typeof key === "symbol")) {
                    throw new ZodCompileUnsupportedError(`record key value ${String(key)}`);
                }
                const inputKey = typeof key === "number" ? key.toString() : key;
                if (inputKey === "__proto__") {
                    // `out["__proto__"] = v` would hit the prototype setter on the output.
                    throw new ZodCompileUnsupportedError('record key "__proto__"');
                }
                inputKeys.push(inputKey);
                const keyConst = addConstant(ctx, key);
                const outKey = generateCheck(doc, ctx, def.keyType, keyConst);
                // Read the property once. Passing the raw expression let compileChild validate one read while the output write performed a second, so a getter could hand back a value nothing had checked.
                const valueVar = newVar(ctx);
                doc.write(`const ${valueVar} = ${accessor}[${literalPropertyKey(ctx, inputKey)}];`);
                const valOutput = compileChild(doc, ctx, def.valueType, valueVar);
                doc.write(`${outputVar}[${outKey}] = ${valOutput};`);
            }
            // `mode: "loose"` changes only what happens to unrecognized keys, so it belongs here rather than the per-present-key scan. Passing them through matches the runtime, which skips `__proto__`.
            const knownKeysConst = addConstant(ctx, new Set(inputKeys));
            doc.write(`for (const ${kVar} in ${accessor}) {`);
            doc.indented((d) => {
                d.write(`if (${knownKeysConst}.has(${kVar})) continue;`);
                if (recordDef.mode === "loose") {
                    d.write(`if (${kVar} !== "__proto__") ${outputVar}[${kVar}] = ${accessor}[${kVar}];`);
                }
                else {
                    d.write(`return INVALID;`);
                }
            });
            doc.write(`}`);
            return outputVar;
        }
        // The bare-string shortcut below only tests `typeof key === "string"`, so it
        // is correct exclusively for a `z.string()` carrying nothing else. A string
        // *format* lives on the def rather than in `checks` — `z.record(z.email(), …)`
        // reads as a plain string here — and coercion rewrites the key, so both have
        // to take the general path or the shortcut accepts keys the runtime rejects.
        const keyDef = def.keyType._zod.def;
        const keyIsBareString = keyDef.type === "string" && keyDef.format === undefined && !keyDef.coerce && (keyDef.checks?.length ?? 0) === 0;
        if (!keyIsBareString) {
            // A key schema with no value set is a constraint every key must satisfy
            // (`z.email()`, `z.string().min(3)`, `z.number()`, a template literal).
            // The runtime runs it against each own enumerable key and writes the value
            // under the key it produced, so compile it once and call it per key.
            const isLoose = def.mode === "loose";
            // the key compiles in its own context, so carry its verdict out: a key schema that can answer INVALID undecidably makes this validator undecidable too
            const keyFn = compileFn(def.keyType);
            if (keyFn.definite === false)
                ctx.definite = false;
            const keyFast = addConstant(ctx, keyFn);
            const numericConst = addConstant(ctx, number$2);
            const outKeyVar = newVar(ctx);
            // the body runs once per string key and once per symbol key, since a key schema can accept symbols
            emitOwnKeys(doc, ctx, accessor, kVar, (d) => {
                d.write(`let ${outKeyVar} = ${keyFast}(${kVar});`);
                // Numeric-string retry, mirroring the runtime: a key the schema rejects as a string is tried again as a number, so z.record(z.number(), …) matches the numeric keys JavaScript stringified on the way in.
                d.write(`if (${outKeyVar} === INVALID && typeof ${kVar} === "string" && ${numericConst}.test(${kVar})) ${outKeyVar} = ${keyFast}(Number(${kVar}));`);
                if (isLoose) {
                    // A loose record keeps a key its schema rejects, copying the value across unvalidated rather than failing the parse.
                    d.write(`if (${outKeyVar} === INVALID) { ${outputVar}[${kVar}] = ${accessor}[${kVar}]; continue; }`);
                }
                else {
                    d.write(`if (${outKeyVar} === INVALID) return INVALID;`);
                }
                // The guard above tested the input key, but the schema can normalize an ordinary key into __proto__; re-check the one actually written under.
                d.write(`if (${outKeyVar} === "__proto__") continue;`);
                // Read once: the raw expression would be evaluated again by the output write below, so an accessor could return an unvalidated second value.
                const valueVar = newVar(ctx);
                d.write(`const ${valueVar} = ${accessor}[${kVar}];`);
                const valOutput = compileChild(d, ctx, def.valueType, valueVar);
                d.write(`${outputVar}[${outKeyVar}] = ${valOutput};`);
            });
            return outputVar;
        }
        // Plain z.string() keys: every own enumerable string key's value is validated, and an own enumerable symbol key fails the string key schema, as it does in the runtime's Reflect.ownKeys walk.
        emitOwnKeys(doc, ctx, accessor, kVar, (d) => {
            d.write(`const ${valVar} = ${accessor}[${kVar}];`);
            const valOutput = compileChild(d, ctx, def.valueType, valVar);
            d.write(`${outputVar}[${kVar}] = ${valOutput};`);
        }, `return INVALID;`);
        return outputVar;
    }
    // Walks the own enumerable keys of a plain object in Reflect.ownKeys order — strings from getOwnPropertyNames, then symbols — instead of Reflect.ownKeys, whose accumulator made that walk 3–6x the cost of the loop it fed. Both snapshots are taken before any value is read and every key is rechecked with propertyIsEnumerable when visited, exactly the runtime's walk, so a getter that adds, deletes, hides or reveals a key mid-walk sees the runtime's verdict; for-in and Object.keys were no faster and each lost a case (for-in enumerates the prototype chain after the own keys, Object.keys drops a key that is non-enumerable at snapshot time). `body` is written once for the string loop and once for the symbol loop unless `onSymbol` replaces the latter.
    function emitOwnKeys(doc, ctx, accessor, kVar, body, onSymbol) {
        const propIsEnumerableConst = addConstant(ctx, Object.prototype.propertyIsEnumerable);
        const symsVar = newVar(ctx);
        const keysVar = newVar(ctx);
        const iVar = newVar(ctx);
        doc.write(`const ${symsVar} = Object.getOwnPropertySymbols(${accessor});`);
        doc.write(`const ${keysVar} = Object.getOwnPropertyNames(${accessor});`);
        doc.write(`for (let ${iVar} = 0; ${iVar} < ${keysVar}.length; ${iVar}++) {`);
        doc.indented((d) => {
            d.write(`const ${kVar} = ${keysVar}[${iVar}];`);
            d.write(`if (${kVar} === "__proto__" || !${propIsEnumerableConst}.call(${accessor}, ${kVar})) continue;`);
            body(d);
        });
        doc.write(`}`);
        doc.write(`for (let ${iVar} = 0; ${iVar} < ${symsVar}.length; ${iVar}++) {`);
        doc.indented((d) => {
            d.write(`const ${kVar} = ${symsVar}[${iVar}];`);
            d.write(`if (!${propIsEnumerableConst}.call(${accessor}, ${kVar})) continue;`);
            if (onSymbol)
                d.write(onSymbol);
            else
                body(d);
        });
        doc.write(`}`);
    }
    function literalPropertyKey(ctx, key) {
        if (typeof key === "string")
            return esc(key);
        return addConstant(ctx, key);
    }
    function generateMapCheck(doc, ctx, schema, accessor) {
        const def = schema._zod.def;
        doc.write(`if (!(${accessor} instanceof Map)) return INVALID;`);
        generateSizeGate(doc, schema, `${accessor}.size`);
        const outputVar = newVar(ctx);
        const kVar = newVar(ctx);
        const valVar = newVar(ctx);
        doc.write(`const ${outputVar} = new Map();`);
        doc.write(`for (const [${kVar}, ${valVar}] of ${accessor}) {`);
        doc.indented((d) => {
            const keyOutput = generateCheck(d, ctx, def.keyType, kVar);
            const valOutput = generateCheck(d, ctx, def.valueType, valVar);
            d.write(`${outputVar}.set(${keyOutput}, ${valOutput});`);
        });
        doc.write(`}`);
        return outputVar;
    }
    function generateSetCheck(doc, ctx, schema, accessor) {
        const def = schema._zod.def;
        doc.write(`if (!(${accessor} instanceof Set)) return INVALID;`);
        generateSizeGate(doc, schema, `${accessor}.size`);
        const outputVar = newVar(ctx);
        const valVar = newVar(ctx);
        doc.write(`const ${outputVar} = new Set();`);
        doc.write(`for (const ${valVar} of ${accessor}) {`);
        doc.indented((d) => {
            const valOutput = generateCheck(d, ctx, def.valueType, valVar);
            d.write(`${outputVar}.add(${valOutput});`);
        });
        doc.write(`}`);
        return outputVar;
    }
    function generateFileCheck(doc, accessor) {
        // Runtime $ZodFile is a bare `instanceof File`, including the implicit global lookup. The previous duck-typed fallback accepted arbitrary {name, size} objects in File-less environments — behavior the runtime never had.
        doc.write(`if (!(${accessor} instanceof File)) return INVALID;`);
        return accessor;
    }
    function generateTemplateLiteralCheck(doc, ctx, schema, accessor) {
        doc.write(`if (typeof ${accessor} !== "string") return INVALID;`);
        // Template literal schemas have a pre-computed pattern in _zod.pattern
        const pattern = schema._zod.pattern;
        if (pattern) {
            const patternConst = addConstant(ctx, pattern);
            doc.write(`${patternConst}.lastIndex = 0;`);
            doc.write(`if (!${patternConst}.test(${accessor})) return INVALID;`);
        }
        return accessor;
    }
    function generateLazyCheck(doc, ctx, schema, accessor) {
        // For lazy schemas, we use a cached parser that falls back to runtime Zod parsing This handles recursive schemas correctly by avoiding infinite compilation loops
        const def = schema._zod.def;
        const getterConst = addUserConstant(ctx, def.getter);
        const cacheConst = addConstant(ctx, { parser: null });
        doc.write(`if (!${cacheConst}.parser) {`);
        doc.indented((d) => {
            d.write(`const inner = ${getterConst}();`);
            d.write(`${cacheConst}.parser = function(input) {`);
            d.indented((d2) => {
                // Use runtime Zod parsing - this correctly handles recursive schemas Pass an empty ctx like runtimeRun does — runtime parsers read ctx.skipChecks/ctx.direction unconditionally and crash on undefined.
                d2.write(`const result = inner._zod.run({ value: input, issues: [] }, {});`);
                d2.write(`return result.issues.length === 0 ? result.value : INVALID;`);
            });
            d.write(`};`);
        });
        doc.write(`}`);
        const outputVar = newVar(ctx);
        doc.write(`const ${outputVar} = ${cacheConst}.parser(${accessor});`);
        doc.write(`if (${outputVar} === INVALID) return INVALID;`);
        return outputVar;
    }
    function generatePipeCheck(doc, ctx, schema, accessor) {
        const def = schema._zod.def;
        // Validate input type first
        const inputOutput = generateCheck(doc, ctx, def.in, accessor);
        if (def.transform) {
            // Apply transform and validate output. The transform may read its second `payload` argument (codec transforms like z.stringbool() push issues there) so wrap the call in a helper that spoofs a payload. Pushed issues signal INVALID and the wrapper falls back to the runtime, and a plain function handing back a promise answers INVALID too — union parity, but not a decidable rejection at the top level.
            if (isAsyncFunction(def.transform)) {
                throw new ZodCompileAsyncError("z.compile: async transforms in pipes are not supported");
            }
            const transformFn = def.transform;
            const helperFn = (value) => {
                // `addIssue` has to be here: a transform reporting through it is reporting, not failing. Without it the call threw a TypeError that the old catch swallowed into a fallback, so every ctx.addIssue transform quietly lost its fast path and the real error was never visible.
                const fakePayload = { value, issues: [], addIssue: pushIssue };
                // A throw is deliberately not caught. The interpreter lets one propagate out of the whole parse; swallowing it into INVALID turned a thrown error into a merely-rejected union branch, so a later branch answered instead.
                const result = transformFn(value, fakePayload);
                if (result instanceof Promise)
                    return INVALID;
                return fakePayload.issues.length === 0 ? result : INVALID;
            };
            const helperConst = addUserConstant(ctx, helperFn);
            const transformedVar = newVar(ctx);
            doc.write(`const ${transformedVar} = ${helperConst}(${inputOutput});`);
            doc.write(`if (${transformedVar} === INVALID) return INVALID;`);
            return generateCheck(doc, ctx, def.out, transformedVar);
        }
        else {
            // No transform - validate output type on same value
            return generateCheck(doc, ctx, def.out, inputOutput);
        }
    }
    function isAsyncFunction(fn) {
        return (typeof fn === "function" &&
            (fn.constructor.name === "AsyncFunction" ||
                fn[Symbol.toStringTag] === "AsyncFunction"));
    }
    function generateCustomCheck(doc, ctx, schema, accessor) {
        const def = schema._zod.def;
        if (def.fn) {
            // Check for async function
            if (isAsyncFunction(def.fn)) {
                throw new ZodCompileAsyncError("z.compile: async custom predicates are not supported");
            }
            // Custom schema with a predicate function (e.g. z.instanceof). `isAsyncFunction` above is syntactic, so a plain function returning a promise reaches here, and a promise is truthy — it would read as a pass where the interpreter throws.
            const fnConst = addUserConstant(ctx, def.fn);
            const throwAsyncConst = addConstant(ctx, throwAsync);
            const resVar = newVar(ctx);
            doc.write(`const ${resVar} = ${fnConst}(${accessor});`);
            doc.write(`if (${resVar} instanceof Promise) ${throwAsyncConst}();`);
            doc.write(`if (!${resVar}) return INVALID;`);
        }
        else {
            throw new ZodCompileUnsupportedError("custom schema without a predicate function");
        }
        return accessor;
    }
    // Runtime helper for a compiled `catch`: runs the inner schema once and returns its value when it succeeded. Anything else — a failure the catch would handle, or an async inner — returns INVALID so the interpreter takes over.
    function runtimeCatch(innerSchema, catchValue, value) {
        const result = innerSchema._zod.run({ value, issues: [] }, {});
        if (result && typeof result.then === "function")
            return INVALID;
        const r = result;
        if (r.issues.length === 0)
            return r.value;
        // Only reached for a catch value that ignores the parse context — codegen refuses the rest — so there are no issues to finalize and nothing here needs the caller's error map.
        return catchValue();
    }
    function generateCatchCheck(doc, ctx, schema, accessor) {
        const def = schema._zod.def;
        // An untagged catchValue is a user callback, and one reading `ctx.error` needs the caller's per-parse error map. Catch *succeeds*, so a wrong message there is unobservable — refuse at codegen, and not islandable either, since `runtimeRun` has no context to hand it.
        if (!def.catchValue[CONSTANT_CATCH]) {
            throw new ZodCompileUnsupportedError("catch with a callback (only a constant catch value compiles)", false);
        }
        const outputVar = newVar(ctx);
        doc.write(`let ${outputVar} = (() => {`);
        doc.indented((d) => {
            const innerOut = compileChild(d, ctx, def.innerType, accessor);
            d.write(`return ${innerOut};`);
        });
        doc.write(`})();`);
        const innerConst = addConstant(ctx, def.innerType);
        const catchConst = addUserConstant(ctx, def.catchValue);
        const catchHelperConst = addConstant(ctx, runtimeCatch);
        doc.write(`if (${outputVar} === INVALID) {`);
        doc.indented((d) => {
            d.write(`${outputVar} = ${catchHelperConst}(${innerConst}, ${catchConst}, ${accessor});`);
            d.write(`if (${outputVar} === INVALID) return INVALID;`);
        });
        doc.write(`}`);
        return outputVar;
    }
    function generateTransformCheck(doc, ctx, schema, accessor) {
        const def = schema._zod.def;
        if (def.transform) {
            // Check for async transform
            if (isAsyncFunction(def.transform)) {
                throw new ZodCompileAsyncError("z.compile: async transforms are not supported");
            }
            // Create a helper that runs the transform and returns the result or INVALID on error
            const transformFn = def.transform;
            const helperFn = (value) => {
                const fakePayload = { value, issues: [], addIssue: pushIssue };
                // As in the pipe helper: a throw propagates, because the interpreter lets it out of the whole parse rather than treating it as a failed branch.
                const result = transformFn(value, fakePayload);
                if (result instanceof Promise)
                    return INVALID;
                return fakePayload.issues.length === 0 ? result : INVALID;
            };
            const helperConst = addUserConstant(ctx, helperFn);
            const outputVar = newVar(ctx);
            doc.write(`const ${outputVar} = ${helperConst}(${accessor});`);
            doc.write(`if (${outputVar} === INVALID) return INVALID;`);
            return outputVar;
        }
        return accessor;
    }

    function snapshotChecks(def) {
        if (def.checks)
            def.checks = [...def.checks];
        return def;
    }
    // @__NO_SIDE_EFFECTS__
    function _string(Class, params) {
        return new Class(snapshotChecks({ type: "string", ...normalizeParams(params) }));
    }
    // @__NO_SIDE_EFFECTS__
    function _coercedString(Class, params) {
        return new Class(snapshotChecks({ type: "string", coerce: true, ...normalizeParams(params) }));
    }
    // @__NO_SIDE_EFFECTS__
    function _email(Class, params) {
        return new Class({
            type: "string",
            format: "email",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _guid(Class, params) {
        return new Class({
            type: "string",
            format: "guid",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _uuid(Class, params) {
        return new Class({
            type: "string",
            format: "uuid",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _uuidv4(Class, params) {
        return new Class({
            type: "string",
            format: "uuid",
            check: "string_format",
            abort: false,
            version: "v4",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _uuidv6(Class, params) {
        return new Class({
            type: "string",
            format: "uuid",
            check: "string_format",
            abort: false,
            version: "v6",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _uuidv7(Class, params) {
        return new Class({
            type: "string",
            format: "uuid",
            check: "string_format",
            abort: false,
            version: "v7",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _url(Class, params) {
        return new Class({
            type: "string",
            format: "url",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _emoji(Class, params) {
        return new Class({
            type: "string",
            format: "emoji",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _nanoid(Class, params) {
        return new Class({
            type: "string",
            format: "nanoid",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    /**
     * @deprecated CUID v1 is deprecated by its authors due to information leakage
     * (timestamps embedded in the id). Use {@link _cuid2} instead.
     * See https://github.com/paralleldrive/cuid.
     */
    // @__NO_SIDE_EFFECTS__
    function _cuid(Class, params) {
        return new Class({
            type: "string",
            format: "cuid",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _cuid2(Class, params) {
        return new Class({
            type: "string",
            format: "cuid2",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _ulid(Class, params) {
        return new Class({
            type: "string",
            format: "ulid",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _xid(Class, params) {
        return new Class({
            type: "string",
            format: "xid",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _ksuid(Class, params) {
        return new Class({
            type: "string",
            format: "ksuid",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _ipv4(Class, params) {
        return new Class({
            type: "string",
            format: "ipv4",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _ipv6(Class, params) {
        return new Class({
            type: "string",
            format: "ipv6",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _mac(Class, params) {
        return new Class({
            type: "string",
            format: "mac",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _cidrv4(Class, params) {
        return new Class({
            type: "string",
            format: "cidrv4",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _cidrv6(Class, params) {
        return new Class({
            type: "string",
            format: "cidrv6",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _base64(Class, params) {
        return new Class({
            type: "string",
            format: "base64",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _base64url(Class, params) {
        return new Class({
            type: "string",
            format: "base64url",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _e164(Class, params) {
        return new Class({
            type: "string",
            format: "e164",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _creditCard(Class, params) {
        return new Class({
            type: "string",
            format: "credit_card",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _iban(Class, params) {
        return new Class({
            type: "string",
            format: "iban",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _jwt(Class, params) {
        return new Class({
            type: "string",
            format: "jwt",
            check: "string_format",
            abort: false,
            ...normalizeParams(params),
        });
    }
    const TimePrecision = {
        Any: null,
        Minute: -1,
        Second: 0,
        Millisecond: 3,
        Microsecond: 6,
    };
    // @__NO_SIDE_EFFECTS__
    function _isoDateTime(Class, params) {
        return new Class({
            type: "string",
            format: "datetime",
            check: "string_format",
            offset: false,
            local: false,
            precision: null,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _isoDate(Class, params) {
        return new Class({
            type: "string",
            format: "date",
            check: "string_format",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _isoTime(Class, params) {
        return new Class({
            type: "string",
            format: "time",
            check: "string_format",
            precision: null,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _isoDuration(Class, params) {
        return new Class({
            type: "string",
            format: "duration",
            check: "string_format",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _number(Class, params) {
        return new Class(snapshotChecks({ type: "number", checks: [], ...normalizeParams(params) }));
    }
    // @__NO_SIDE_EFFECTS__
    function _coercedNumber(Class, params) {
        return new Class(snapshotChecks({ type: "number", coerce: true, checks: [], ...normalizeParams(params) }));
    }
    // @__NO_SIDE_EFFECTS__
    function _int(Class, params) {
        return new Class({
            type: "number",
            check: "number_format",
            abort: false,
            format: "safeint",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _float32(Class, params) {
        return new Class({
            type: "number",
            check: "number_format",
            abort: false,
            format: "float32",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _float64(Class, params) {
        return new Class({
            type: "number",
            check: "number_format",
            abort: false,
            format: "float64",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _int32(Class, params) {
        return new Class({
            type: "number",
            check: "number_format",
            abort: false,
            format: "int32",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _uint32(Class, params) {
        return new Class({
            type: "number",
            check: "number_format",
            abort: false,
            format: "uint32",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _boolean(Class, params) {
        return new Class({
            type: "boolean",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _coercedBoolean(Class, params) {
        return new Class({
            type: "boolean",
            coerce: true,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _bigint(Class, params) {
        return new Class({
            type: "bigint",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _coercedBigint(Class, params) {
        return new Class({
            type: "bigint",
            coerce: true,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _int64(Class, params) {
        return new Class({
            type: "bigint",
            check: "bigint_format",
            abort: false,
            format: "int64",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _uint64(Class, params) {
        return new Class({
            type: "bigint",
            check: "bigint_format",
            abort: false,
            format: "uint64",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _symbol(Class, params) {
        return new Class({
            type: "symbol",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _undefined$1(Class, params) {
        return new Class({
            type: "undefined",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _null$1(Class, params) {
        return new Class({
            type: "null",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _any(Class) {
        return new Class({
            type: "any",
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _unknown(Class) {
        return new Class({
            type: "unknown",
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _never(Class, params) {
        return new Class({
            type: "never",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _void$1(Class, params) {
        return new Class({
            type: "void",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _date(Class, params) {
        return new Class({
            type: "date",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _coercedDate(Class, params) {
        return new Class({
            type: "date",
            coerce: true,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _nan(Class, params) {
        return new Class({
            type: "nan",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _lt(value, params) {
        return new $ZodCheckLessThan({
            check: "less_than",
            ...normalizeParams(params),
            value,
            inclusive: false,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _lte(value, params) {
        return new $ZodCheckLessThan({
            check: "less_than",
            ...normalizeParams(params),
            value,
            inclusive: true,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _gt(value, params) {
        return new $ZodCheckGreaterThan({
            check: "greater_than",
            ...normalizeParams(params),
            value,
            inclusive: false,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _gte(value, params) {
        return new $ZodCheckGreaterThan({
            check: "greater_than",
            ...normalizeParams(params),
            value,
            inclusive: true,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _positive(params) {
        return _gt(0, params);
    }
    // negative
    // @__NO_SIDE_EFFECTS__
    function _negative(params) {
        return _lt(0, params);
    }
    // nonpositive
    // @__NO_SIDE_EFFECTS__
    function _nonpositive(params) {
        return _lte(0, params);
    }
    // nonnegative
    // @__NO_SIDE_EFFECTS__
    function _nonnegative(params) {
        return _gte(0, params);
    }
    // @__NO_SIDE_EFFECTS__
    function _multipleOf(value, params) {
        return new $ZodCheckMultipleOf({
            check: "multiple_of",
            ...normalizeParams(params),
            value,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _maxSize(maximum, params) {
        return new $ZodCheckMaxSize({
            check: "max_size",
            ...normalizeParams(params),
            maximum,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _minSize(minimum, params) {
        return new $ZodCheckMinSize({
            check: "min_size",
            ...normalizeParams(params),
            minimum,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _size(size, params) {
        return new $ZodCheckSizeEquals({
            check: "size_equals",
            ...normalizeParams(params),
            size,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _maxLength(maximum, params) {
        const ch = new $ZodCheckMaxLength({
            check: "max_length",
            ...normalizeParams(params),
            maximum,
        });
        return ch;
    }
    // @__NO_SIDE_EFFECTS__
    function _minLength(minimum, params) {
        return new $ZodCheckMinLength({
            check: "min_length",
            ...normalizeParams(params),
            minimum,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _length(length, params) {
        return new $ZodCheckLengthEquals({
            check: "length_equals",
            ...normalizeParams(params),
            length,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _regex(pattern, params) {
        return new $ZodCheckRegex({
            check: "string_format",
            format: "regex",
            ...normalizeParams(params),
            pattern,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _lowercase(params) {
        return new $ZodCheckLowerCase({
            check: "string_format",
            format: "lowercase",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _uppercase(params) {
        return new $ZodCheckUpperCase({
            check: "string_format",
            format: "uppercase",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _includes(includes, params) {
        return new $ZodCheckIncludes({
            check: "string_format",
            format: "includes",
            ...normalizeParams(params),
            includes,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _startsWith(prefix, params) {
        return new $ZodCheckStartsWith({
            check: "string_format",
            format: "starts_with",
            ...normalizeParams(params),
            prefix,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _endsWith(suffix, params) {
        return new $ZodCheckEndsWith({
            check: "string_format",
            format: "ends_with",
            ...normalizeParams(params),
            suffix,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _property(property, schema, params) {
        return new $ZodCheckProperty({
            check: "property",
            property,
            schema,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _properties(shape, params) {
        return new $ZodCheckProperties({
            check: "properties",
            shape,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _mime(types, params) {
        return new $ZodCheckMimeType({
            check: "mime_type",
            mime: types,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _overwrite(tx) {
        return new $ZodCheckOverwrite({
            check: "overwrite",
            tx,
        });
    }
    // normalize
    // @__NO_SIDE_EFFECTS__
    function _normalize(form) {
        return _overwrite((input) => input.normalize(form));
    }
    // trim
    // @__NO_SIDE_EFFECTS__
    function _trim() {
        return _overwrite((input) => input.trim());
    }
    // toLowerCase
    // @__NO_SIDE_EFFECTS__
    function _toLowerCase() {
        return _overwrite((input) => input.toLowerCase());
    }
    // toUpperCase
    // @__NO_SIDE_EFFECTS__
    function _toUpperCase() {
        return _overwrite((input) => input.toUpperCase());
    }
    // slugify
    // @__NO_SIDE_EFFECTS__
    function _slugify() {
        return _overwrite((input) => slugify(input));
    }
    // @__NO_SIDE_EFFECTS__
    function _array(Class, element, params) {
        return new Class({
            type: "array",
            element,
            // get element() {
            //   return element;
            // },
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _union(Class, options, params) {
        return new Class({
            type: "union",
            options,
            ...normalizeParams(params),
        });
    }
    function _xor(Class, options, params) {
        return new Class({
            type: "union",
            options,
            inclusive: false,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _discriminatedUnion(Class, discriminator, options, params) {
        return new Class({
            type: "union",
            options: options,
            discriminator,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _intersection(Class, left, right) {
        return new Class({
            type: "intersection",
            left,
            right,
        });
    }
    // export function _tuple(
    //   Class: util.SchemaClass<schemas.$ZodTuple>,
    //   items: [],
    //   params?: string | $ZodTupleParams
    // ): schemas.$ZodTuple<[], null>;
    // @__NO_SIDE_EFFECTS__
    function _tuple(Class, items, _paramsOrRest, _params) {
        const hasRest = _paramsOrRest instanceof $ZodType;
        const params = hasRest ? _params : _paramsOrRest;
        const rest = hasRest ? _paramsOrRest : null;
        return new Class({
            type: "tuple",
            items,
            rest,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _record(Class, keyType, valueType, params) {
        return new Class({
            type: "record",
            keyType,
            valueType,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _map(Class, keyType, valueType, params) {
        return new Class({
            type: "map",
            keyType,
            valueType,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _set(Class, valueType, params) {
        return new Class({
            type: "set",
            valueType,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _enum$1(Class, values, params) {
        const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
        // if (Array.isArray(values)) {
        //   for (const value of values) {
        //     entries[value] = value;
        //   }
        // } else {
        //   Object.assign(entries, values);
        // }
        // const entries: util.EnumLike = {};
        // for (const val of values) {
        //   entries[val] = val;
        // }
        return new Class({
            type: "enum",
            entries,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    /** @deprecated This API has been merged into `z.enum()`. Use `z.enum()` instead.
     *
     * ```ts
     * enum Colors { red, green, blue }
     * z.enum(Colors);
     * ```
     */
    function _nativeEnum(Class, entries, params) {
        return new Class({
            type: "enum",
            entries,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _literal(Class, value, params) {
        return new Class({
            type: "literal",
            values: Array.isArray(value) ? value : [value],
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _file(Class, params) {
        return new Class({
            type: "file",
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _transform(Class, fn) {
        return new Class({
            type: "transform",
            transform: fn,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _optional(Class, innerType) {
        return new Class({
            type: "optional",
            innerType,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _nullable(Class, innerType) {
        return new Class({
            type: "nullable",
            innerType,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _default$1(Class, innerType, defaultValue) {
        return new Class({
            type: "default",
            innerType,
            get defaultValue() {
                return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
            },
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _nonoptional(Class, innerType, params) {
        return new Class({
            type: "nonoptional",
            innerType,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _success(Class, innerType) {
        return new Class({
            type: "success",
            innerType,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _catch$1(Class, innerType, catchValue) {
        return new Class({
            type: "catch",
            innerType,
            catchValue: (typeof catchValue === "function" ? catchValue : constantCatch(catchValue)),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _pipe(Class, in_, out) {
        return new Class({
            type: "pipe",
            in: in_,
            out,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _readonly(Class, innerType) {
        return new Class({
            type: "readonly",
            innerType,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _templateLiteral(Class, parts, params) {
        return new Class({
            type: "template_literal",
            parts,
            ...normalizeParams(params),
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _lazy(Class, getter) {
        return new Class({
            type: "lazy",
            getter,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _promise(Class, innerType) {
        return new Class({
            type: "promise",
            innerType,
        });
    }
    // @__NO_SIDE_EFFECTS__
    function _custom(Class, fn, _params) {
        const norm = normalizeParams(_params);
        norm.abort ?? (norm.abort = true); // default to abort:false
        const schema = new Class({
            type: "custom",
            check: "custom",
            fn: fn,
            ...norm,
        });
        return schema;
    }
    // same as _custom but defaults to abort:false
    // @__NO_SIDE_EFFECTS__
    function _refine(Class, fn, _params) {
        const schema = new Class({
            type: "custom",
            check: "custom",
            fn: fn,
            ...normalizeParams(_params),
        });
        return schema;
    }
    // @__NO_SIDE_EFFECTS__
    function _superRefine(fn, params) {
        const ch = _check((payload) => {
            payload.addIssue = (issue$1) => {
                if (typeof issue$1 === "string") {
                    payload.issues.push(issue(issue$1, payload.value, ch._zod.def));
                }
                else {
                    // for Zod 3 backwards compatibility
                    const _issue = issue$1;
                    if (_issue.fatal)
                        _issue.continue = false;
                    _issue.code ?? (_issue.code = "custom");
                    if (!("input" in _issue))
                        _issue.input = payload.value;
                    _issue.inst ?? (_issue.inst = ch);
                    _issue.continue ?? (_issue.continue = !ch._zod.def.abort); // abort is always undefined, so this is always true...
                    payload.issues.push(issue(_issue));
                }
            };
            return fn(payload.value, payload);
        }, params);
        return ch;
    }
    // @__NO_SIDE_EFFECTS__
    function _check(fn, params) {
        const ch = new $ZodCheck({
            check: "custom",
            ...normalizeParams(params),
        });
        ch._zod.check = fn;
        return ch;
    }
    // @__NO_SIDE_EFFECTS__
    function describe$1(description) {
        const ch = new $ZodCheck({ check: "describe" });
        ch._zod.onattach = [
            (inst) => {
                const existing = globalRegistry.get(inst) ?? {};
                globalRegistry.add(inst, { ...existing, description });
            },
        ];
        ch._zod.check = () => { }; // no-op check
        return ch;
    }
    // @__NO_SIDE_EFFECTS__
    function meta$1(metadata) {
        const ch = new $ZodCheck({ check: "meta" });
        ch._zod.onattach = [
            (inst) => {
                const existing = globalRegistry.get(inst) ?? {};
                globalRegistry.add(inst, { ...existing, ...metadata });
            },
        ];
        ch._zod.check = () => { }; // no-op check
        return ch;
    }
    // @__NO_SIDE_EFFECTS__
    function _stringbool(Classes, _params) {
        const params = normalizeParams(_params);
        let truthyArray = params.truthy ?? ["true", "1", "yes", "on", "y", "enabled"];
        let falsyArray = params.falsy ?? ["false", "0", "no", "off", "n", "disabled"];
        if (params.case !== "sensitive") {
            truthyArray = truthyArray.map((v) => (typeof v === "string" ? v.toLowerCase() : v));
            falsyArray = falsyArray.map((v) => (typeof v === "string" ? v.toLowerCase() : v));
        }
        const truthySet = new Set(truthyArray);
        const falsySet = new Set(falsyArray);
        const _Codec = Classes.Codec ?? $ZodCodec;
        const _Boolean = Classes.Boolean ?? $ZodBoolean;
        const _String = Classes.String ?? $ZodString;
        const stringSchema = new _String({ type: "string", error: params.error });
        const booleanSchema = new _Boolean({ type: "boolean", error: params.error });
        const codec = new _Codec({
            type: "pipe",
            in: stringSchema,
            out: booleanSchema,
            transform: ((input, payload) => {
                let data = input;
                if (params.case !== "sensitive")
                    data = data.toLowerCase();
                if (truthySet.has(data)) {
                    return true;
                }
                else if (falsySet.has(data)) {
                    return false;
                }
                else {
                    payload.issues.push({
                        code: "invalid_value",
                        expected: "stringbool",
                        values: [...truthySet, ...falsySet],
                        input: payload.value,
                        inst: codec,
                        continue: false,
                    });
                    return {};
                }
            }),
            reverseTransform: ((input, _payload) => {
                if (input === true) {
                    return truthyArray[0] || "true";
                }
                else {
                    return falsyArray[0] || "false";
                }
            }),
            error: params.error,
        });
        codec._zod.bag.truthy = truthyArray;
        codec._zod.bag.falsy = falsyArray;
        codec._zod.bag.case = params.case ?? "insensitive";
        return codec;
    }
    // @__NO_SIDE_EFFECTS__
    function _stringFormat(Class, format, fnOrRegex, _params = {}) {
        const params = normalizeParams(_params);
        const def = {
            check: "string_format",
            type: "string",
            format,
            fn: typeof fnOrRegex === "function" ? fnOrRegex : (val) => fnOrRegex.test(val),
            ...params,
        };
        if (fnOrRegex instanceof RegExp) {
            def.pattern = fnOrRegex;
        }
        const inst = new Class(def);
        return inst;
    }

    function assignProps(target, ...sources) {
        for (const source of sources) {
            for (const key of Reflect.ownKeys(source)) {
                if (Object.prototype.propertyIsEnumerable.call(source, key)) {
                    assignProp(target, key, source[key]);
                }
            }
        }
        return target;
    }
    // function initializeContext<T extends schemas.$ZodType>(inputs: JSONSchemaGeneratorParams<T>): ToJSONSchemaContext<T> {
    //   return {
    //     processor: inputs.processor,
    //     metadataRegistry: inputs.metadata ?? globalRegistry,
    //     target: inputs.target ?? "draft-2020-12",
    //     unrepresentable: inputs.unrepresentable ?? "throw",
    //   };
    // }
    function initializeContext(params) {
        // Normalize target: convert old non-hyphenated versions to hyphenated versions
        let target = params?.target ?? "draft-2020-12";
        if (target === "draft-4")
            target = "draft-04";
        if (target === "draft-7")
            target = "draft-07";
        return {
            processors: params.processors ?? {},
            metadataRegistry: params?.metadata ?? globalRegistry,
            target,
            unrepresentable: params?.unrepresentable ?? "throw",
            override: params?.override ?? (() => { }),
            io: params?.io ?? "output",
            counter: 0,
            seen: new Map(),
            sharedDefsExtractedFor: undefined,
            sharedEmitDoneFor: undefined,
            cycles: params?.cycles ?? "ref",
            reused: params?.reused ?? "inline",
            intersections: [],
            deferred: [],
            external: params?.external ?? undefined,
        };
    }
    /**
     * Applies the `unrepresentable` setting at a site that has no JSON Schema equivalent. Throws
     * `message` unless the setting (or the handler's return value) says otherwise. Returns `true` if a
     * custom JSON Schema was written into `json`, in which case the caller must not write its own.
     */
    function handleUnrepresentable(schema, ctx, json, params, message) {
        const result = typeof ctx.unrepresentable === "function"
            ? ctx.unrepresentable({ zodSchema: schema, path: params.path, message })
            : ctx.unrepresentable;
        if (result === "any")
            return false;
        if (result === undefined || result === "throw")
            throw new Error(message);
        Object.assign(json, result);
        return true;
    }
    // never rename this back to `process`: bundler polyfills inject a top-level `const process` that a lexical declaration of the same name collides with (#6397)
    function processSchema(schema, ctx, _params = { path: [], schemaPath: [] }) {
        var _a;
        const def = schema._zod.def;
        // check for schema in seens
        const seen = ctx.seen.get(schema);
        if (seen) {
            seen.count++;
            // check if cycle
            const isCycle = _params.schemaPath.includes(schema);
            if (isCycle) {
                seen.cycle = _params.path;
            }
            return seen.schema;
        }
        // initialize
        const result = { schema: {}, count: 1, cycle: undefined, path: _params.path };
        ctx.seen.set(schema, result);
        ctx.sharedDefsExtractedFor = undefined;
        ctx.sharedEmitDoneFor = undefined;
        // custom method overrides default behavior
        const overrideSchema = schema._zod.toJSONSchema?.();
        if (overrideSchema) {
            result.schema = overrideSchema;
        }
        else {
            const params = {
                ..._params,
                schemaPath: [..._params.schemaPath, schema],
                path: _params.path,
            };
            if (schema._zod.processJSONSchema) {
                schema._zod.processJSONSchema(ctx, result.schema, params);
            }
            else {
                const _json = result.schema;
                const processor = ctx.processors[def.type];
                if (!processor) {
                    throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
                }
                processor(schema, ctx, _json, params);
            }
            const parent = schema._zod.parent;
            if (parent) {
                // Also set ref if processor didn't (for inheritance)
                if (!result.ref)
                    result.ref = parent;
                processSchema(parent, ctx, params);
                ctx.seen.get(parent).isParent = true;
            }
        }
        // metadata
        const meta = ctx.metadataRegistry.get(schema);
        if (meta)
            assignProps(result.schema, meta);
        if (ctx.io === "input" && isTransforming(schema)) {
            // examples/defaults only apply to output type of pipe
            delete result.schema.examples;
            delete result.schema.default;
        }
        // set prefault as default
        if (ctx.io === "input" && "_prefault" in result.schema)
            (_a = result.schema).default ?? (_a.default = result.schema._prefault);
        delete result.schema._prefault;
        // pulling fresh from ctx.seen in case it was overwritten
        const _result = ctx.seen.get(schema);
        return _result.schema;
    }
    // Escape a reference token for use in a JSON Pointer fragment (RFC 6901): `~` becomes `~0` and `/` becomes `~1`. The `~` replacement must run first.
    function encodeJSONPointerSegment(segment) {
        return segment.replace(/~/g, "~0").replace(/\//g, "~1");
    }
    function extractDefs(ctx, schema
    // params: EmitParams
    ) {
        // iterate over seen map;
        const root = ctx.seen.get(schema);
        if (!root)
            throw new Error("Unprocessed schema. This is a bug in Zod.");
        // With `external` set, every registered schema resolves through the external branch of `makeURI`, so the root branch below produces the same ref the external branch would — this pass is identical whichever schema it is called with, and only needs to run once.
        if (ctx.external && ctx.sharedDefsExtractedFor === ctx.external)
            return;
        // Track ids to detect duplicates across different schemas
        const idToSchema = new Map();
        for (const entry of ctx.seen.entries()) {
            const id = ctx.metadataRegistry.get(entry[0])?.id;
            if (id) {
                const existing = idToSchema.get(id);
                if (existing && existing !== entry[0]) {
                    throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
                }
                idToSchema.set(id, entry[0]);
            }
        }
        // returns a ref to the schema defId will be empty if the ref points to an external schema (or #)
        const makeURI = (entry) => {
            // comparing the seen objects because sometimes multiple schemas map to the same seen object. e.g. lazy
            // external is configured
            const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
            if (ctx.external) {
                const externalId = ctx.external.registry.get(entry[0])?.id; // ?? "__shared";// `__schema${ctx.counter++}`;
                // check if schema is in the external registry
                const uriGenerator = ctx.external.uri ?? ((id) => id);
                if (externalId) {
                    return { ref: uriGenerator(externalId) };
                }
                // otherwise, add to __shared
                const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
                entry[1].defId = id; // set defId so it will be reused if needed
                return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${encodeJSONPointerSegment(id)}` };
            }
            const uriPrefix = `#`;
            const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
            // an id-less root has nowhere to be extracted to, so it stays inline and self-references as `#`
            if (entry[1] === root && !entry[1].schema.id) {
                return { ref: uriPrefix };
            }
            // self-contained schema
            const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
            return { defId, ref: defUriPrefix + encodeJSONPointerSegment(defId) };
        };
        // stored cached version in `def` property remove all properties, set $ref
        const extractToDef = (entry) => {
            // if the schema is already a reference, do not extract it
            if (entry[1].schema.$ref) {
                return;
            }
            const seen = entry[1];
            const { ref, defId } = makeURI(entry);
            seen.def = { ...seen.schema };
            // defId won't be set if the schema is a reference to an external schema or if the schema is the root schema
            if (defId)
                seen.defId = defId;
            // wipe away all properties except $ref
            const schema = seen.schema;
            for (const key in schema) {
                delete schema[key];
            }
            schema.$ref = ref;
        };
        // throw on cycles
        // break cycles
        if (ctx.cycles === "throw") {
            for (const entry of ctx.seen.entries()) {
                const seen = entry[1];
                if (seen.cycle) {
                    throw new Error("Cycle detected: " +
                        `#/${seen.cycle?.join("/")}/<root>` +
                        '\n\nSet the `cycles` parameter to `"ref"` to resolve cyclical schemas with defs.');
                }
            }
        }
        // extract schemas into $defs
        for (const entry of ctx.seen.entries()) {
            const seen = entry[1];
            // convert root schema to # $ref
            if (schema === entry[0]) {
                extractToDef(entry); // this has special handling for the root schema
                continue;
            }
            // extract schemas that are in the external registry
            if (ctx.external) {
                const ext = ctx.external.registry.get(entry[0])?.id;
                if (schema !== entry[0] && ext) {
                    extractToDef(entry);
                    continue;
                }
            }
            // extract schemas with `id` meta
            const id = ctx.metadataRegistry.get(entry[0])?.id;
            if (id) {
                extractToDef(entry);
                continue;
            }
            // break cycles
            if (seen.cycle) {
                // any
                extractToDef(entry);
                continue;
            }
            // extract reused schemas
            if (seen.count > 1) {
                if (ctx.reused === "ref") {
                    extractToDef(entry);
                }
            }
        }
        if (ctx.external)
            ctx.sharedDefsExtractedFor = ctx.external;
    }
    /** Rewrites `anyOf: [{type: "a"}, {type: "b"}]` to `type: ["a", "b"]`, which every JSON Schema draft treats as equivalent and most consumers render far better for the nullable case. Only branches that are a bare type assertion qualify — anything carrying a constraint, `$ref`, `const` or metadata is left alone. Runs after `flattenRef`, so a branch an override decorated or `$defs` extraction turned into a `$ref` is no longer bare and correctly stays in `anyOf`. `oneOf` is excluded: `integer` and `number` overlap, so "exactly one" and "at least one" are not the same there. OpenAPI 3.0 is excluded: its `type` must be a single string. */
    function compactTypeUnion(schema) {
        const options = schema.anyOf;
        if (!Array.isArray(options) || options.length === 0 || schema.type !== undefined)
            return;
        const types = [];
        for (const option of options) {
            if (!option || typeof option !== "object")
                return;
            // A branch that is itself a compactible union folds into this one — nested `anyOf` and a flat `type` array say the same thing. Compacting it first also makes the result independent of the order this pass walks the seen map in.
            compactTypeUnion(option);
            const keys = Object.keys(option);
            if (keys.length !== 1 || keys[0] !== "type")
                return;
            const type = option.type;
            for (const member of Array.isArray(type) ? type : [type]) {
                if (typeof member !== "string")
                    return;
                if (!types.includes(member))
                    types.push(member);
            }
        }
        delete schema.anyOf;
        // A `type` array must be non-empty and unique (metaschema); a single member is spelled as a bare string.
        schema.type = types.length === 1 ? types[0] : types;
    }
    /** Keywords `foldIntersection` knows how to combine. Anything else — `$ref`, `patternProperties`,
     * an annotation like `description` — makes a member unfoldable, so a constraint this does not
     * understand leaves the `allOf` alone instead of being silently dropped or misattributed. */
    const FOLDABLE_KEYS = new Set(["type", "properties", "required", "additionalProperties"]);
    const UNION_KEYS = ["oneOf", "anyOf"];
    /** A member's constraint on a key it does not declare itself. A `catchall` states one; `false`, an absent `additionalProperties`, and the empty schema a loose object emits state nothing. */
    function undeclaredConstraint(member) {
        const extra = member.additionalProperties;
        if (extra === undefined || extra === false || typeof extra !== "object" || extra === null)
            return null;
        return Object.keys(extra).length ? extra : null;
    }
    /** Combines object members into the single object they describe together, or returns `null` if any of them carries a keyword outside {@link FOLDABLE_KEYS}. */
    function foldObjects(members) {
        const objects = [];
        for (const member of members) {
            // A boolean subschema is legal JSON Schema and carries no keywords to fold.
            if (typeof member !== "object" || member.type !== "object")
                return null;
            for (const key in member) {
                if (!FOLDABLE_KEYS.has(key))
                    return null;
            }
            objects.push(member);
        }
        const properties = {};
        const required = new Set();
        for (const object of objects) {
            for (const key in object.properties) {
                // `in` would report a `__proto__` key as already present via the prototype chain and skip it.
                if (Object.prototype.hasOwnProperty.call(properties, key))
                    continue;
                // Every member constrains this key: the ones that declare it say how, and a `catchall` member constrains it too even though it does not name it. The key has to satisfy all of them, which is the same intersection one level down.
                const parts = [];
                for (const other of objects) {
                    const part = other.properties?.[key] ?? undeclaredConstraint(other);
                    if (part === null || part === undefined)
                        continue;
                    if (!parts.some((seen) => JSON.stringify(seen) === JSON.stringify(part)))
                        parts.push(part);
                }
                const merged = parts.length === 1
                    ? parts[0]
                    : (foldObjects(parts) ?? { allOf: parts });
                assignProp(properties, key, merged);
            }
            for (const key of object.required ?? [])
                required.add(key);
        }
        const folded = { type: "object", properties };
        if (required.size)
            folded.required = [...required];
        // A key no member declares is rejected only when every member rejects it, so the fold is closed only when every member is. Otherwise it carries whatever the `catchall` members demand of such a key.
        if (objects.every((object) => object.additionalProperties === false)) {
            folded.additionalProperties = false;
        }
        else {
            const constraints = [];
            for (const object of objects) {
                const constraint = undeclaredConstraint(object);
                if (constraint && !constraints.some((seen) => JSON.stringify(seen) === JSON.stringify(constraint)))
                    constraints.push(constraint);
            }
            if (constraints.length === 1)
                folded.additionalProperties = constraints[0];
            else if (constraints.length > 1)
                folded.additionalProperties = { allOf: constraints };
        }
        return folded;
    }
    /** `additionalProperties` in an `allOf` member sees only that member's own `properties`, so two
     * closed object members reject each other's keys and the schema validates nothing. Zod's parser
     * pools the key sets instead — `handleIntersectionResults` reports a key as unrecognized only when
     * *every* side rejects it — so the emitted schema has to pool them too, and folding the members
     * into one object is the encoding that says so on every target.
     *
     * This runs from `finalize`, after `extractDefs`, which is what keeps it clear of the `$ref`
     * machinery: a member extracted into `$defs` is already a `$ref` by now and declines to fold, so it
     * keeps its reference and its own closedness rather than being inlined as a stale copy. */
    function foldIntersection(json) {
        const allOf = json.allOf;
        if (!Array.isArray(allOf) || allOf.length < 2)
            return;
        // An `override` runs before this pass and may have written object keywords onto the intersection itself. Those are deliberate, so decline rather than overwrite them.
        for (const key of FOLDABLE_KEYS)
            if (key in json)
                return;
        // An intersection distributes over a union: `A & (X | Y)` is `(A & X) | (A & Y)`. Only the first union is distributed over; a second one stays among the members every branch folds against, where it fails the object check and declines the whole intersection rather than multiplying out.
        const unions = allOf.filter((m) => UNION_KEYS.some((k) => Array.isArray(m[k])));
        let folded = null;
        if (!unions.length) {
            folded = foldObjects(allOf);
        }
        else {
            const union = unions[0];
            const keyword = UNION_KEYS.find((k) => Array.isArray(union[k]));
            if (Object.keys(union).length !== 1)
                return;
            const rest = allOf.filter((m) => m !== union);
            const branches = union[keyword].map((branch) => foldObjects([...rest, branch]));
            if (branches.some((b) => !b))
                return;
            folded = { [keyword]: branches };
        }
        if (!folded)
            return;
        delete json.allOf;
        assignProps(json, folded);
    }
    function finalize(ctx, schema) {
        const root = ctx.seen.get(schema);
        if (!root)
            throw new Error("Unprocessed schema. This is a bug in Zod.");
        // flatten refs - inherit properties from parent schemas
        const flattenRef = (zodSchema) => {
            const seen = ctx.seen.get(zodSchema);
            // already processed
            if (seen.ref === null)
                return;
            const schema = seen.def ?? seen.schema;
            const _cached = { ...schema };
            const ref = seen.ref;
            seen.ref = null; // prevent infinite recursion
            if (ref) {
                flattenRef(ref);
                const refSeen = ctx.seen.get(ref);
                const refSchema = refSeen.schema;
                // merge referenced schema into current
                if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
                    // older drafts can't combine $ref with other properties
                    schema.allOf = schema.allOf ?? [];
                    schema.allOf.push(refSchema);
                }
                else {
                    assignProps(schema, refSchema);
                }
                // restore child's own properties (child wins)
                assignProps(schema, _cached);
                const isParentRef = zodSchema._zod.parent === ref;
                // For parent chain, child is a refinement - remove parent-only properties
                if (isParentRef) {
                    for (const key in schema) {
                        if (key === "$ref" || key === "allOf")
                            continue;
                        if (!(key in _cached)) {
                            delete schema[key];
                        }
                    }
                }
                // When ref was extracted to $defs, remove properties that match the definition
                if (refSchema.$ref && refSeen.def) {
                    for (const key in schema) {
                        if (key === "$ref" || key === "allOf")
                            continue;
                        if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) {
                            delete schema[key];
                        }
                    }
                }
            }
            // If parent was extracted (has $ref), propagate $ref to this schema. This handles cases like: readonly().meta({id}).describe() where processor sets ref to innerType but parent should be referenced
            const parent = zodSchema._zod.parent;
            if (parent && parent !== ref) {
                // Ensure parent is processed first so its def has inherited properties
                flattenRef(parent);
                const parentSeen = ctx.seen.get(parent);
                if (parentSeen?.schema.$ref) {
                    schema.$ref = parentSeen.schema.$ref;
                    // De-duplicate with parent's definition
                    if (parentSeen.def) {
                        for (const key in schema) {
                            if (key === "$ref" || key === "allOf")
                                continue;
                            if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) {
                                delete schema[key];
                            }
                        }
                    }
                }
            }
            // execute overrides
            ctx.override({
                zodSchema: zodSchema,
                jsonSchema: schema,
                path: seen.path ?? [],
            });
        };
        // Flattening walks the whole map and clears each `ref` as it goes, so a second call over the same map is a no-op scan. Skip it outright once it has run for a registry conversion.
        if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
            for (const entry of [...ctx.seen.entries()].reverse()) {
                flattenRef(entry[0]);
            }
            if (ctx.target !== "openapi-3.0") {
                for (const entry of ctx.seen.entries()) {
                    compactTypeUnion(entry[1].def ?? entry[1].schema);
                }
            }
            for (const rewrite of ctx.deferred)
                rewrite();
            // After flattening, every member that was extracted is a `$ref`, so the fold sees the final shape. A schema that inherits an intersection — through `z.lazy`, or any `ref` chain — holds the same `allOf` array, so fold by array identity to catch every copy.
            if (ctx.intersections.length) {
                const carriers = new Map();
                for (const seen of ctx.seen.values()) {
                    for (const json of [seen.schema, seen.def]) {
                        const allOf = json?.allOf;
                        if (!Array.isArray(allOf))
                            continue;
                        const existing = carriers.get(allOf);
                        if (existing)
                            existing.push(json);
                        else
                            carriers.set(allOf, [json]);
                    }
                }
                for (const allOf of ctx.intersections) {
                    for (const json of carriers.get(allOf) ?? [])
                        foldIntersection(json);
                }
            }
        }
        const result = {};
        if (ctx.target === "draft-2020-12") {
            result.$schema = "https://json-schema.org/draft/2020-12/schema";
        }
        else if (ctx.target === "draft-07") {
            result.$schema = "http://json-schema.org/draft-07/schema#";
        }
        else if (ctx.target === "draft-04") {
            result.$schema = "http://json-schema.org/draft-04/schema#";
        }
        else if (ctx.target === "openapi-3.0") ;
        else ;
        if (ctx.external?.uri) {
            const id = ctx.external.registry.get(schema)?.id;
            if (!id)
                throw new Error("Schema is missing an `id` property");
            result.$id = ctx.external.uri(id);
        }
        // when the root was extracted into $defs, `root.schema` is the `$ref` wrapper and `root.def` is the body that now lives under $defs
        assignProps(result, root.defId ? root.schema : (root.def ?? root.schema));
        // The `id` in `.meta()` is a Zod-specific registration tag used to extract schemas into $defs — it is not user-facing JSON Schema metadata. Strip it from the output body where it would otherwise leak. The id is preserved implicitly via the $defs key (and via $ref paths).
        const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
        if (rootMetaId !== undefined && result.id === rootMetaId)
            delete result.id;
        // build defs object. With `external`, `defs` is the shared object every schema writes into, so the same entries are reassigned on every call. Without it, `defs` is fresh per call and must be rebuilt.
        const defs = ctx.external?.defs ?? {};
        if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
            for (const entry of ctx.seen.entries()) {
                const seen = entry[1];
                if (seen.def && seen.defId) {
                    if (seen.def.id === seen.defId)
                        delete seen.def.id;
                    assignProp(defs, seen.defId, seen.def);
                }
            }
        }
        if (ctx.external)
            ctx.sharedEmitDoneFor = ctx.external;
        // set definitions in result
        if (ctx.external) ;
        else {
            if (Object.keys(defs).length > 0) {
                if (ctx.target === "draft-2020-12") {
                    result.$defs = defs;
                }
                else {
                    result.definitions = defs;
                }
            }
        }
        try {
            // this "finalizes" this schema and ensures all cycles are removed each call to finalize() is functionally independent though the seen map is shared
            const finalized = JSON.parse(JSON.stringify(result));
            Object.defineProperty(finalized, "~standard", {
                value: {
                    ...schema["~standard"],
                    jsonSchema: {
                        input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
                        output: createStandardJSONSchemaMethod(schema, "output", ctx.processors),
                    },
                },
                enumerable: false,
                writable: false,
            });
            return finalized;
        }
        catch (_err) {
            throw new Error("Error converting schema to JSON.");
        }
    }
    function isTransforming(_schema, _ctx) {
        const ctx = _ctx ?? { seen: new Set() };
        if (ctx.seen.has(_schema))
            return false;
        ctx.seen.add(_schema);
        const def = _schema._zod.def;
        if (def.type === "transform")
            return true;
        if (def.type === "array")
            return isTransforming(def.element, ctx);
        if (def.type === "set")
            return isTransforming(def.valueType, ctx);
        if (def.type === "lazy")
            return isTransforming(def.getter(), ctx);
        if (def.type === "promise" ||
            def.type === "optional" ||
            def.type === "nonoptional" ||
            def.type === "nullable" ||
            def.type === "readonly" ||
            def.type === "default" ||
            def.type === "prefault" ||
            def.type === "catch") {
            return isTransforming(def.innerType, ctx);
        }
        if (def.type === "intersection") {
            return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
        }
        if (def.type === "record" || def.type === "map") {
            return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
        }
        if (def.type === "pipe") {
            if (_schema._zod.traits.has("$ZodCodec"))
                return true;
            return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
        }
        if (def.type === "object") {
            for (const key in def.shape) {
                if (isTransforming(def.shape[key], ctx))
                    return true;
            }
            return false;
        }
        if (def.type === "union") {
            for (const option of def.options) {
                if (isTransforming(option, ctx))
                    return true;
            }
            return false;
        }
        if (def.type === "tuple") {
            for (const item of def.items) {
                if (isTransforming(item, ctx))
                    return true;
            }
            if (def.rest && isTransforming(def.rest, ctx))
                return true;
            return false;
        }
        return false;
    }
    /**
     * Creates a toJSONSchema method for a schema instance.
     * This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
     */
    const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
        const ctx = initializeContext({ ...params, processors });
        processSchema(schema, ctx);
        extractDefs(ctx, schema);
        return finalize(ctx, schema);
    };
    const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
        const { libraryOptions, target } = params ?? {};
        const ctx = initializeContext({ ...(libraryOptions ?? {}), target, io, processors });
        processSchema(schema, ctx);
        extractDefs(ctx, schema);
        return finalize(ctx, schema);
    };

    const narrowMin = (agg, key, value) => {
        if (agg[key] === undefined || value > agg[key])
            agg[key] = value;
    };
    const narrowMax = (agg, key, value) => {
        if (agg[key] === undefined || value < agg[key])
            agg[key] = value;
    };
    const narrowBoth = (agg, value) => {
        narrowMin(agg, "minimum", value);
        narrowMax(agg, "maximum", value);
    };
    const addDivisor = (agg, value) => {
        agg.multipleOf ?? (agg.multipleOf = []);
        if (!agg.multipleOf.includes(value))
            agg.multipleOf.push(value);
    };
    const addPattern = (agg, pattern) => {
        agg.patterns ?? (agg.patterns = new Set());
        agg.patterns.add(pattern);
    };
    const intersectMime = (agg, mime) => {
        agg.mime = agg.mime ? agg.mime.filter((m) => mime.includes(m)) : [...mime];
    };
    // last-wins, matching the bag's historical write order; the flag keeps an integer format from being lost to a later float one
    const setFormat = (agg, format) => {
        agg.format = format;
        if (format.includes("int"))
            agg.isInt = true;
    };
    const minContributor = (agg, def) => narrowMin(agg, "minimum", def.minimum);
    const maxContributor = (agg, def) => narrowMax(agg, "maximum", def.maximum);
    const formatContributor = (ranges) => (agg, def) => {
        setFormat(agg, def.format);
        const [minimum, maximum] = ranges[def.format];
        narrowMin(agg, "minimum", minimum);
        narrowMax(agg, "maximum", maximum);
    };
    const contributors = {
        greater_than: (agg, def) => narrowMin(agg, def.inclusive ? "minimum" : "exclusiveMinimum", def.value),
        less_than: (agg, def) => narrowMax(agg, def.inclusive ? "maximum" : "exclusiveMaximum", def.value),
        multiple_of: (agg, def) => addDivisor(agg, def.value),
        number_format: formatContributor(NUMBER_FORMAT_RANGES),
        bigint_format: formatContributor(BIGINT_FORMAT_RANGES),
        min_length: minContributor,
        max_length: maxContributor,
        length_equals: (agg, def) => narrowBoth(agg, def.length),
        min_size: minContributor,
        max_size: maxContributor,
        size_equals: (agg, def) => narrowBoth(agg, def.size),
        string_format: (agg, def) => {
            setFormat(agg, def.format);
            if (def.pattern)
                addPattern(agg, def.pattern);
            if (def.format === "base64" || def.format === "base64url")
                agg.contentEncoding = def.format;
            if (def.local || def.precision === -1)
                agg.laxFormat = true;
        },
        mime_type: (agg, def) => intersectMime(agg, def.mime),
    };
    function aggregateChecks(schema) {
        const agg = {};
        const def = schema._zod.def;
        // a format schema is its own first check, same rule as $ZodType init
        const list = schema._zod.traits.has("$ZodCheck")
            ? [schema, ...(def.checks ?? [])]
            : (def.checks ?? []);
        for (const ch of list)
            contributors[ch._zod.def.check]?.(agg, ch._zod.def);
        // reconcile with the bag so third-party onattach contributions still land; first-party residue is never tighter than the fold, so merging it back is idempotent for one and additive for the other
        const bag = schema._zod.bag;
        if (bag.minimum !== undefined)
            narrowMin(agg, "minimum", bag.minimum);
        if (bag.exclusiveMinimum !== undefined)
            narrowMin(agg, "exclusiveMinimum", bag.exclusiveMinimum);
        if (bag.maximum !== undefined)
            narrowMax(agg, "maximum", bag.maximum);
        if (bag.exclusiveMaximum !== undefined)
            narrowMax(agg, "exclusiveMaximum", bag.exclusiveMaximum);
        if (bag.multipleOf !== undefined)
            addDivisor(agg, bag.multipleOf);
        if (bag.format !== undefined) {
            agg.format ?? (agg.format = bag.format);
            if (bag.format.includes("int"))
                agg.isInt = true;
        }
        if (bag.mime)
            intersectMime(agg, bag.mime);
        for (const pattern of bag.patterns ?? [])
            addPattern(agg, pattern);
        return agg;
    }
    const formatMap = {
        guid: "uuid",
        url: "uri",
        datetime: "date-time",
        json_string: "json-string",
        regex: "", // do not set
    };
    // ==================== SIMPLE TYPE PROCESSORS ====================
    // the runtime patterns are lax so parse paths never overflow the regex stack; the emitted schema swaps in the exact block forms, which zod itself never executes
    const exactPatterns = new Map([
        [base64Charset, base64$1],
        [base64urlCharset, base64url$1],
    ]);
    const exactPattern = (p) => exactPatterns.get(p) ?? p;
    const stringProcessor = (schema, ctx, _json, _params) => {
        const json = _json;
        json.type = "string";
        const { minimum, maximum, format, patterns, contentEncoding, laxFormat } = aggregateChecks(schema);
        if (typeof minimum === "number")
            json.minLength = minimum;
        if (typeof maximum === "number")
            json.maxLength = maximum;
        // custom pattern overrides format
        if (format) {
            json.format = formatMap[format] ?? format;
            if (json.format === "")
                delete json.format; // empty format is not valid
            // `z.iso.time()` is never full-time, and `laxFormat` carries the datetime shapes that also accept what their keyword forbids
            if (format === "time" || laxFormat) {
                delete json.format;
            }
        }
        if (contentEncoding)
            json.contentEncoding = contentEncoding;
        if (patterns && patterns.size > 0) {
            const patternList = [...patterns].map(exactPattern);
            if (patternList.length === 1)
                json.pattern = patternList[0].source;
            else if (patternList.length > 1) {
                json.allOf = [
                    ...patternList.map((regex) => ({
                        ...(ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0"
                            ? { type: "string" }
                            : {}),
                        pattern: regex.source,
                    })),
                ];
            }
        }
    };
    const numberProcessor = (schema, ctx, _json, params) => {
        const json = _json;
        const { minimum, maximum, multipleOf, exclusiveMaximum, exclusiveMinimum, isInt } = aggregateChecks(schema);
        json.type = isInt ? "integer" : "number";
        // when both minimum and exclusiveMinimum exist, pick the more restrictive one
        const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
        const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
        const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
        if (exMin) {
            if (legacy) {
                json.minimum = exclusiveMinimum;
                json.exclusiveMinimum = true;
            }
            else {
                json.exclusiveMinimum = exclusiveMinimum;
            }
        }
        else if (typeof minimum === "number") {
            json.minimum = minimum;
        }
        if (exMax) {
            if (legacy) {
                json.maximum = exclusiveMaximum;
                json.exclusiveMaximum = true;
            }
            else {
                json.exclusiveMaximum = exclusiveMaximum;
            }
        }
        else if (typeof maximum === "number") {
            json.maximum = maximum;
        }
        if (multipleOf) {
            // JSON Schema requires a divisor strictly greater than zero, and a non-finite one does not survive JSON at all. A negative divisor accepts exactly what its absolute value accepts, so it still maps; zero, NaN and Infinity have no keyword form.
            const divisors = new Set();
            for (const divisor of multipleOf) {
                if (Number.isFinite(divisor) && divisor !== 0)
                    divisors.add(Math.abs(divisor));
                else
                    handleUnrepresentable(schema, ctx, json, params, `A multipleOf divisor of ${divisor} cannot be represented in JSON Schema`);
            }
            // chained divisors are a conjunction the keyword cannot carry alone, so extras ride an allOf, same as stacked patterns
            const [first, ...rest] = divisors;
            if (first !== undefined)
                json.multipleOf = first;
            if (rest.length)
                json.allOf = [...(json.allOf ?? []), ...rest.map((m) => ({ multipleOf: m }))];
        }
    };
    const booleanProcessor = (_schema, _ctx, json, _params) => {
        json.type = "boolean";
    };
    const bigintProcessor = (schema, ctx, json, params) => {
        handleUnrepresentable(schema, ctx, json, params, "BigInt cannot be represented in JSON Schema");
    };
    const symbolProcessor = (schema, ctx, json, params) => {
        handleUnrepresentable(schema, ctx, json, params, "Symbols cannot be represented in JSON Schema");
    };
    const nullProcessor = (_schema, ctx, json, _params) => {
        if (ctx.target === "openapi-3.0") {
            json.type = "string";
            json.nullable = true;
            json.enum = [null];
        }
        else {
            json.type = "null";
        }
    };
    const undefinedProcessor = (schema, ctx, json, params) => {
        handleUnrepresentable(schema, ctx, json, params, "Undefined cannot be represented in JSON Schema");
    };
    const voidProcessor = (schema, ctx, json, params) => {
        handleUnrepresentable(schema, ctx, json, params, "Void cannot be represented in JSON Schema");
    };
    const neverProcessor = (_schema, _ctx, json, _params) => {
        json.not = {};
    };
    const anyProcessor = (_schema, _ctx, _json, _params) => {
        // empty schema accepts anything
    };
    const unknownProcessor = (_schema, _ctx, _json, _params) => {
        // empty schema accepts anything
    };
    const dateProcessor = (schema, ctx, json, params) => {
        handleUnrepresentable(schema, ctx, json, params, "Date cannot be represented in JSON Schema");
    };
    const enumProcessor = (schema, _ctx, json, _params) => {
        const def = schema._zod.def;
        const values = getEnumValues(def.entries);
        // an empty enum accepts nothing, same as z.never()
        if (values.length === 0) {
            json.not = {};
            return;
        }
        // Number enums can have both string and number values
        if (values.every((v) => typeof v === "number"))
            json.type = "number";
        if (values.every((v) => typeof v === "string"))
            json.type = "string";
        json.enum = values;
    };
    const literalProcessor = (schema, ctx, json, params) => {
        const def = schema._zod.def;
        // a literal with no values accepts nothing, same as z.never()
        if (def.values.length === 0) {
            json.not = {};
            return;
        }
        const vals = [];
        for (const val of def.values) {
            if (val === undefined) {
                // a custom schema replaces the whole literal, so there is nothing left to accumulate
                if (handleUnrepresentable(schema, ctx, json, params, "Literal `undefined` cannot be represented in JSON Schema"))
                    return;
                // otherwise do not add to vals
            }
            else if (typeof val === "bigint") {
                if (handleUnrepresentable(schema, ctx, json, params, "BigInt literals cannot be represented in JSON Schema"))
                    return;
                vals.push(Number(val));
            }
            else {
                vals.push(val);
            }
        }
        if (vals.length === 0) ;
        else if (vals.length === 1) {
            const val = vals[0];
            json.type = val === null ? "null" : typeof val;
            if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
                json.enum = [val];
            }
            else {
                json.const = val;
            }
        }
        else {
            if (vals.every((v) => typeof v === "number"))
                json.type = "number";
            if (vals.every((v) => typeof v === "string"))
                json.type = "string";
            if (vals.every((v) => typeof v === "boolean"))
                json.type = "boolean";
            if (vals.every((v) => v === null))
                json.type = "null";
            json.enum = vals;
        }
    };
    const nanProcessor = (schema, ctx, json, params) => {
        handleUnrepresentable(schema, ctx, json, params, "NaN cannot be represented in JSON Schema");
    };
    const templateLiteralProcessor = (schema, _ctx, json, _params) => {
        const _json = json;
        const pattern = schema._zod.pattern;
        if (!pattern)
            throw new Error("Pattern not found in template literal");
        _json.type = "string";
        _json.pattern = pattern.source;
    };
    const fileProcessor = (schema, _ctx, json, _params) => {
        const _json = json;
        _json.type = "string";
        _json.format = "binary";
        _json.contentEncoding = "binary";
        const { minimum, maximum, mime } = aggregateChecks(schema);
        if (minimum !== undefined)
            _json.minLength = minimum;
        if (maximum !== undefined)
            _json.maxLength = maximum;
        if (!mime)
            return;
        // an empty intersection means the mime checks share no value, so nothing passes at runtime; `anyOf` must be non-empty, so the false schema is `not: {}`
        if (mime.length === 0)
            _json.not = {};
        else if (mime.length === 1)
            _json.contentMediaType = mime[0];
        // only contentMediaType differs, so the shared props stay at the root
        else
            _json.anyOf = mime.map((m) => ({ contentMediaType: m }));
    };
    const successProcessor = (_schema, _ctx, json, _params) => {
        json.type = "boolean";
    };
    const customProcessor = (schema, ctx, json, params) => {
        handleUnrepresentable(schema, ctx, json, params, "Custom types cannot be represented in JSON Schema");
    };
    const functionProcessor = (schema, ctx, json, params) => {
        handleUnrepresentable(schema, ctx, json, params, "Function types cannot be represented in JSON Schema");
    };
    const transformProcessor = (schema, ctx, json, params) => {
        handleUnrepresentable(schema, ctx, json, params, "Transforms cannot be represented in JSON Schema");
    };
    const mapProcessor = (schema, ctx, json, params) => {
        handleUnrepresentable(schema, ctx, json, params, "Map cannot be represented in JSON Schema");
    };
    const setProcessor = (schema, ctx, json, params) => {
        handleUnrepresentable(schema, ctx, json, params, "Set cannot be represented in JSON Schema");
    };
    // ==================== COMPOSITE TYPE PROCESSORS ====================
    const arrayProcessor = (schema, ctx, _json, params) => {
        const json = _json;
        const def = schema._zod.def;
        const { minimum, maximum } = aggregateChecks(schema);
        if (typeof minimum === "number")
            json.minItems = minimum;
        if (typeof maximum === "number")
            json.maxItems = maximum;
        json.type = "array";
        json.items = processSchema(def.element, ctx, {
            ...params,
            path: [...params.path, "items"],
        });
    };
    // Transform and catch set `optin = "optional"` at runtime so the parser lets them observe an
    // absent key, but their declared input type stays required. An input JSON Schema describes the
    // declared type, so resolve past them to the schema that actually carries the optionality.
    // Used by both `objectProcessor` (for `required`) and `tupleProcessor` (for `minItems`); see
    // wiki/optionality.md, "The JSON Schema emitter reads the *static* value".
    function inputOptin(schema) {
        const def = schema._zod.def;
        if (def.type === "pipe" && def.in._zod.traits.has("$ZodTransform")) {
            return inputOptin(def.out);
        }
        if (def.type === "catch") {
            return inputOptin(def.innerType);
        }
        return schema._zod.optin;
    }
    const objectProcessor = (schema, ctx, _json, params) => {
        const json = _json;
        const def = schema._zod.def;
        const shape = def.shape;
        // dropping it while still emitting `additionalProperties: false` would emit a schema that rejects data this one requires
        const symbolKeys = Object.getOwnPropertySymbols(shape);
        if (symbolKeys.length &&
            handleUnrepresentable(schema, ctx, json, params, "Symbol keys cannot be represented in JSON Schema")) {
            return;
        }
        json.type = "object";
        json.properties = {};
        for (const key in shape) {
            // assignProp so a __proto__ key becomes an own property instead of hitting the inherited setter on the plain {} we build into
            assignProp(json.properties, key, processSchema(shape[key], ctx, {
                ...params,
                path: [...params.path, "properties", key],
            }));
        }
        // required keys
        const requiredKeys = [];
        for (const key of Object.keys(shape)) {
            const field = def.shape[key];
            if (ctx.io === "input" ? inputOptin(field) === undefined : field._zod.optout === undefined) {
                requiredKeys.push(key);
            }
        }
        if (requiredKeys.length > 0) {
            json.required = requiredKeys;
        }
        // catchall
        if (def.catchall?._zod.def.type === "never") {
            // strict
            json.additionalProperties = false;
        }
        else if (!def.catchall) {
            // regular
            if (ctx.io === "output")
                json.additionalProperties = false;
        }
        else if (def.catchall) {
            json.additionalProperties = processSchema(def.catchall, ctx, {
                ...params,
                path: [...params.path, "additionalProperties"],
            });
        }
    };
    const unionProcessor = (schema, ctx, json, params) => {
        const def = schema._zod.def;
        // Exclusive unions (inclusive === false) use oneOf (exactly one match) instead of anyOf (one or more matches). This includes both z.xor() and discriminated unions
        const isExclusive = def.inclusive === false;
        const options = def.options.map((x, i) => processSchema(x, ctx, {
            ...params,
            path: [...params.path, isExclusive ? "oneOf" : "anyOf", i],
        }));
        if (isExclusive) {
            json.oneOf = options;
        }
        else {
            json.anyOf = options;
        }
    };
    const intersectionProcessor = (schema, ctx, json, params) => {
        const def = schema._zod.def;
        const a = processSchema(def.left, ctx, {
            ...params,
            path: [...params.path, "allOf", 0],
        });
        const b = processSchema(def.right, ctx, {
            ...params,
            path: [...params.path, "allOf", 1],
        });
        const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
        const allOf = [
            ...(isSimpleIntersection(a) ? a.allOf : [a]),
            ...(isSimpleIntersection(b) ? b.allOf : [b]),
        ];
        json.allOf = allOf;
        // Recorded innermost first, so a nested intersection has already folded by the time this one is considered. The array is the handle rather than the schema, because a wrapper that inherits this schema shares the same array; `finalize` folds every object holding it. See `foldIntersection`.
        ctx.intersections.push(allOf);
    };
    const tupleProcessor = (schema, ctx, _json, params) => {
        const json = _json;
        const def = schema._zod.def;
        json.type = "array";
        const prefixPath = ctx.target === "draft-2020-12" ? "prefixItems" : "items";
        const restPath = ctx.target === "draft-2020-12" ? "items" : ctx.target === "openapi-3.0" ? "items" : "additionalItems";
        const prefixItems = def.items.map((x, i) => processSchema(x, ctx, {
            ...params,
            path: [...params.path, prefixPath, i],
        }));
        const rest = def.rest
            ? processSchema(def.rest, ctx, {
                ...params,
                path: [...params.path, restPath, ...(ctx.target === "openapi-3.0" ? [def.items.length] : [])],
            })
            : null;
        let minItems = def.items.length;
        while (minItems > 0) {
            const item = def.items[minItems - 1];
            const optional = ctx.io === "input" ? inputOptin(item) !== undefined : item._zod.optout === "optional";
            if (!optional)
                break;
            minItems--;
        }
        const maxItems = def.items.length;
        const isClosed = !def.rest;
        if (ctx.target === "draft-2020-12") {
            json.prefixItems = prefixItems;
            if (isClosed) {
                json.items = false;
            }
            else if (rest) {
                json.items = rest;
            }
            if (minItems > 0)
                json.minItems = minItems;
            if (isClosed)
                json.maxItems = maxItems;
        }
        else if (ctx.target === "openapi-3.0") {
            json.items = {
                anyOf: prefixItems,
            };
            if (rest) {
                json.items.anyOf.push(rest);
            }
            if (minItems > 0)
                json.minItems = minItems;
            if (isClosed)
                json.maxItems = maxItems;
        }
        else {
            json.items = prefixItems;
            if (isClosed) {
                json.additionalItems = false;
            }
            else if (rest) {
                json.additionalItems = rest;
            }
            if (minItems > 0)
                json.minItems = minItems;
            if (isClosed)
                json.maxItems = maxItems;
        }
        // explicit user-defined length checks take precedence
        const { minimum, maximum } = aggregateChecks(schema);
        if (typeof minimum === "number")
            json.minItems = minimum;
        if (typeof maximum === "number")
            json.maxItems = maximum;
    };
    /** JSON object keys are always strings, so a numeric record key schema is re-expressed over the
     * numeric-string form the record parser matches. Deferred to `finalize`, after the flatten: a key
     * behind a wrapper only carries its own `type` before then, and a union key only has its branches.
     *
     * A numeric bound cannot apply to a property name, so `minimum` and its siblings are dropped rather
     * than carried over: keeping them beside `type: "string"` reproduces the match-nothing schema this
     * exists to fix. A key that carries one therefore emits wider than the record parses — `z.record(z.number().min(5), V)`
     * accepts `"3"` — which is the deliberate trade, since throwing on it would reject an ordinary schema
     * outright. */
    function stringifyKeyNames(bySchema, json, visited) {
        // an extracted key that rewrites cannot go on sharing its definition — the string form a key position needs is not the number form every other reference wants — so it inlines. One that does not rewrite keeps the `$ref`.
        if (json.$ref) {
            // a recursive key holds its own reference inside its definition, so a node already on the path is left alone rather than resolved again
            if (visited.has(json))
                return json;
            visited.add(json);
            const def = bySchema.get(json)?.def;
            if (!def)
                return json;
            const inlined = stringifyKeyNames(bySchema, def, visited);
            return inlined === def ? json : inlined;
        }
        for (const keyword of ["anyOf", "oneOf"]) {
            const branches = json[keyword];
            if (!Array.isArray(branches))
                continue;
            const mapped = branches.map((branch) => stringifyKeyNames(bySchema, branch, visited));
            // rebuilding regardless would detach a key that had nothing to re-express, dropping its `$ref` and leaking the internal `id`
            if (mapped.some((branch, i) => branch !== branches[i]))
                json = { ...json, [keyword]: mapped };
        }
        // a member that already admits a string leaves the key unconstrained, so the node's own type re-expresses only when every member is numeric
        const types = Array.isArray(json.type) ? json.type : [json.type];
        const numericType = !types.includes("string") && types.some((t) => t === "number" || t === "integer");
        // a heterogeneous key carries no type at all, so its numeric members are caught here instead
        const values = json.enum ?? (json.const !== undefined ? [json.const] : undefined);
        if (!numericType && !values?.some((v) => typeof v === "number"))
            return json;
        const { minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf, format, id, ...rest } = json;
        if (rest.enum)
            rest.enum = rest.enum.map((v) => (typeof v === "number" ? String(v) : v));
        else if (typeof rest.const === "number")
            rest.const = String(rest.const);
        // a heterogeneous key keeps its absent type: the stringified members already say what a key may be
        if (!numericType)
            return rest;
        rest.type = "string";
        if (!values)
            rest.pattern = (types.includes("number") ? number$2 : integer).source;
        return rest;
    }
    /** Every record of one conversion, so the carriers are found in a single pass rather than once per record. */
    const pendingRecords = new WeakMap();
    function rewriteKeyNames(ctx) {
        // an extracted key is resolved by the object `extractToDef` left in its place, so the map is built once rather than searched per reference. `_zod.toJSONSchema` can hand the same object to two schemas, so the first entry carrying a body wins, as a search would have found it.
        const bySchema = new Map();
        for (const entry of ctx.seen.values()) {
            if (entry.def && !bySchema.has(entry.schema))
                bySchema.set(entry.schema, entry);
        }
        const rewrites = new Map();
        for (const record of pendingRecords.get(ctx) ?? []) {
            const seen = ctx.seen.get(record);
            const names = (seen?.def ?? seen?.schema)?.propertyNames;
            if (!names || names === true || rewrites.has(names))
                continue;
            const rewritten = stringifyKeyNames(bySchema, names, new Set());
            if (rewritten !== names)
                rewrites.set(names, rewritten);
        }
        if (!rewrites.size)
            return;
        // the flatten has already copied each record's own properties onto every wrapper by reference, and an extracted body is another such copy, so every carrier holding a rewritten key is updated together
        for (const entry of ctx.seen.values()) {
            for (const carrier of [entry.schema, entry.def]) {
                const rewritten = carrier && rewrites.get(carrier.propertyNames);
                if (rewritten)
                    carrier.propertyNames = rewritten;
            }
        }
    }
    const recordProcessor = (schema, ctx, _json, params) => {
        const json = _json;
        const def = schema._zod.def;
        json.type = "object";
        // For looseRecord with regex patterns, use patternProperties. This correctly represents "only validate keys matching the pattern" semantics and composes well with allOf (intersections)
        const keyType = def.keyType;
        const patterns = aggregateChecks(keyType).patterns;
        if (def.mode === "loose" && patterns && patterns.size > 0) {
            // Use patternProperties for looseRecord with regex patterns
            const valueSchema = processSchema(def.valueType, ctx, {
                ...params,
                path: [...params.path, "patternProperties", "*"],
            });
            json.patternProperties = {};
            for (const pattern of patterns) {
                assignProp(json.patternProperties, exactPattern(pattern).source, valueSchema);
            }
        }
        else {
            // Default behavior: use propertyNames + additionalProperties
            if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
                json.propertyNames = processSchema(def.keyType, ctx, {
                    ...params,
                    path: [...params.path, "propertyNames"],
                });
                let pending = pendingRecords.get(ctx);
                if (!pending) {
                    pending = [];
                    pendingRecords.set(ctx, pending);
                    ctx.deferred.push(() => rewriteKeyNames(ctx));
                }
                pending.push(schema);
            }
            json.additionalProperties = processSchema(def.valueType, ctx, {
                ...params,
                path: [...params.path, "additionalProperties"],
            });
        }
        // Add required for keys with discrete values (enum, literal, etc.)
        const keyValues = keyType._zod.values;
        // Every key shares one value schema, so an optional-in value makes the whole key set omittable on input. Output keeps them: the exhaustive branch assigns every key, even one whose value came back undefined.
        const omittableOnInput = ctx.io === "input" && inputOptin(def.valueType) !== undefined;
        if (keyValues && !def.partial && !omittableOnInput) {
            const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
            if (validKeyValues.length > 0) {
                json.required = validKeyValues.map(String);
            }
        }
    };
    const nullableProcessor = (schema, ctx, json, params) => {
        const def = schema._zod.def;
        const inner = processSchema(def.innerType, ctx, params);
        const seen = ctx.seen.get(schema);
        if (ctx.target === "openapi-3.0") {
            seen.ref = def.innerType;
            json.nullable = true;
        }
        else {
            json.anyOf = [inner, { type: "null" }];
        }
    };
    const nonoptionalProcessor = (schema, ctx, _json, params) => {
        const def = schema._zod.def;
        processSchema(def.innerType, ctx, params);
        const seen = ctx.seen.get(schema);
        seen.ref = def.innerType;
    };
    /** Round-trips a default value through JSON so the emitted schema is guaranteed to be valid JSON.
     * A BigInt has no reliable encoding, so it goes through `unrepresentable` like any other
     * unrepresentable value. Returns a sentinel when the caller must not write a default of its own. */
    const UNREPRESENTABLE_DEFAULT = Symbol();
    function serializeDefaultValue(value, schema, ctx, json, params) {
        let unrepresentable = false;
        const serialized = JSON.stringify(value, (_, val) => {
            if (typeof val !== "bigint")
                return val;
            unrepresentable = true;
            return null;
        });
        if (!unrepresentable)
            return JSON.parse(serialized);
        handleUnrepresentable(schema, ctx, json, params, "BigInt defaults cannot be represented in JSON Schema");
        return UNREPRESENTABLE_DEFAULT;
    }
    const defaultProcessor = (schema, ctx, json, params) => {
        const def = schema._zod.def;
        processSchema(def.innerType, ctx, params);
        const seen = ctx.seen.get(schema);
        seen.ref = def.innerType;
        const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
        if (value !== UNREPRESENTABLE_DEFAULT)
            json.default = value;
    };
    const prefaultProcessor = (schema, ctx, json, params) => {
        const def = schema._zod.def;
        processSchema(def.innerType, ctx, params);
        const seen = ctx.seen.get(schema);
        seen.ref = def.innerType;
        if (ctx.io !== "input")
            return;
        const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
        if (value !== UNREPRESENTABLE_DEFAULT)
            json._prefault = value;
    };
    const catchProcessor = (schema, ctx, json, params) => {
        const def = schema._zod.def;
        processSchema(def.innerType, ctx, params);
        const seen = ctx.seen.get(schema);
        seen.ref = def.innerType;
        let catchValue;
        try {
            catchValue = def.catchValue(undefined);
        }
        catch {
            handleUnrepresentable(schema, ctx, json, params, "Dynamic catch values are not supported in JSON Schema");
            return;
        }
        json.default = catchValue;
    };
    const pipeProcessor = (schema, ctx, _json, params) => {
        const def = schema._zod.def;
        const inIsTransform = def.in._zod.traits.has("$ZodTransform");
        const innerType = ctx.io === "input" ? (inIsTransform ? def.out : def.in) : def.out;
        processSchema(innerType, ctx, params);
        const seen = ctx.seen.get(schema);
        seen.ref = innerType;
    };
    const readonlyProcessor = (schema, ctx, json, params) => {
        const def = schema._zod.def;
        processSchema(def.innerType, ctx, params);
        const seen = ctx.seen.get(schema);
        seen.ref = def.innerType;
        json.readOnly = true;
    };
    const promiseProcessor = (schema, ctx, _json, params) => {
        const def = schema._zod.def;
        processSchema(def.innerType, ctx, params);
        const seen = ctx.seen.get(schema);
        seen.ref = def.innerType;
    };
    const optionalProcessor = (schema, ctx, _json, params) => {
        const def = schema._zod.def;
        processSchema(def.innerType, ctx, params);
        const seen = ctx.seen.get(schema);
        seen.ref = def.innerType;
    };
    const lazyProcessor = (schema, ctx, _json, params) => {
        const innerType = schema._zod.innerType;
        processSchema(innerType, ctx, params);
        const seen = ctx.seen.get(schema);
        seen.ref = innerType;
    };
    // ==================== ALL PROCESSORS ====================
    const allProcessors = {
        string: stringProcessor,
        number: numberProcessor,
        boolean: booleanProcessor,
        bigint: bigintProcessor,
        symbol: symbolProcessor,
        null: nullProcessor,
        undefined: undefinedProcessor,
        void: voidProcessor,
        never: neverProcessor,
        any: anyProcessor,
        unknown: unknownProcessor,
        date: dateProcessor,
        enum: enumProcessor,
        literal: literalProcessor,
        nan: nanProcessor,
        template_literal: templateLiteralProcessor,
        file: fileProcessor,
        success: successProcessor,
        custom: customProcessor,
        function: functionProcessor,
        transform: transformProcessor,
        map: mapProcessor,
        set: setProcessor,
        array: arrayProcessor,
        object: objectProcessor,
        union: unionProcessor,
        intersection: intersectionProcessor,
        tuple: tupleProcessor,
        record: recordProcessor,
        nullable: nullableProcessor,
        nonoptional: nonoptionalProcessor,
        default: defaultProcessor,
        prefault: prefaultProcessor,
        catch: catchProcessor,
        pipe: pipeProcessor,
        readonly: readonlyProcessor,
        promise: promiseProcessor,
        optional: optionalProcessor,
        lazy: lazyProcessor,
    };
    function toJSONSchema(input, params) {
        if ("_idmap" in input) {
            // Registry case
            const registry = input;
            const ctx = initializeContext({ ...params, processors: allProcessors });
            const defs = {};
            // First pass: process all schemas to build the seen map
            for (const entry of registry._idmap.entries()) {
                const [_, schema] = entry;
                processSchema(schema, ctx);
            }
            const schemas = {};
            const external = {
                registry,
                uri: params?.uri,
                defs,
            };
            // Update the context with external configuration
            ctx.external = external;
            // Second pass: emit each schema
            for (const entry of registry._idmap.entries()) {
                const [key, schema] = entry;
                extractDefs(ctx, schema);
                assignProp(schemas, key, finalize(ctx, schema));
            }
            if (Object.keys(defs).length > 0) {
                const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
                schemas.__shared = {
                    [defsSegment]: defs,
                };
            }
            return { schemas };
        }
        // Single schema case
        const ctx = initializeContext({ ...params, processors: allProcessors });
        processSchema(input, ctx);
        extractDefs(ctx, input);
        return finalize(ctx, input);
    }

    /**
     * Legacy class-based interface for JSON Schema generation.
     * This class wraps the new functional implementation to provide backward compatibility.
     *
     * @deprecated Use the `toJSONSchema` function instead for new code.
     *
     * @example
     * ```typescript
     * // Legacy usage (still supported)
     * const gen = new JSONSchemaGenerator({ target: "draft-07" });
     * gen.process(schema);
     * const result = gen.emit(schema);
     *
     * // Preferred modern usage
     * const result = toJSONSchema(schema, { target: "draft-07" });
     * ```
     */
    class JSONSchemaGenerator {
        /** @deprecated Access via ctx instead */
        get metadataRegistry() {
            return this.ctx.metadataRegistry;
        }
        /** @deprecated Access via ctx instead */
        get target() {
            return this.ctx.target;
        }
        // annotated so the .d.cts emits an indexed access rather than an inline `import()` of an ESM path
        /** @deprecated Access via ctx instead */
        get unrepresentable() {
            return this.ctx.unrepresentable;
        }
        /** @deprecated Access via ctx instead */
        get override() {
            return this.ctx.override;
        }
        /** @deprecated Access via ctx instead */
        get io() {
            return this.ctx.io;
        }
        /** @deprecated Access via ctx instead */
        get counter() {
            return this.ctx.counter;
        }
        set counter(value) {
            this.ctx.counter = value;
        }
        /** @deprecated Access via ctx instead */
        get seen() {
            return this.ctx.seen;
        }
        constructor(params) {
            // Normalize target for internal context
            let normalizedTarget = params?.target ?? "draft-2020-12";
            if (normalizedTarget === "draft-4")
                normalizedTarget = "draft-04";
            if (normalizedTarget === "draft-7")
                normalizedTarget = "draft-07";
            this.ctx = initializeContext({
                processors: allProcessors,
                target: normalizedTarget,
                ...(params?.metadata && { metadata: params.metadata }),
                ...(params?.unrepresentable && { unrepresentable: params.unrepresentable }),
                ...(params?.override && { override: params.override }),
                ...(params?.io && { io: params.io }),
            });
        }
        /**
         * Process a schema to prepare it for JSON Schema generation.
         * This must be called before emit().
         */
        process(schema, _params = { path: [], schemaPath: [] }) {
            return processSchema(schema, this.ctx, _params);
        }
        /**
         * Emit the final JSON Schema after processing.
         * Must call process() first.
         */
        emit(schema, _params) {
            // Apply emit params to the context
            if (_params) {
                if (_params.cycles)
                    this.ctx.cycles = _params.cycles;
                if (_params.reused)
                    this.ctx.reused = _params.reused;
                if (_params.external)
                    this.ctx.external = _params.external;
            }
            // extractDefs/finalize skip their whole-map passes when they have already run for this `external`, but they also branch on `cycles`, `reused`, `seen.count` and the metadata registry — any of which can change between emits, including with no params at all. Drop the guards so the passes re-run. The registry conversion calls extractDefs/finalize directly and never routes through here, so it keeps skipping them.
            this.ctx.sharedDefsExtractedFor = undefined;
            this.ctx.sharedEmitDoneFor = undefined;
            extractDefs(this.ctx, schema);
            const result = finalize(this.ctx, schema);
            // Strip ~standard property to match old implementation's return type
            const { "~standard": _, ...plainResult } = result;
            return plainResult;
        }
    }

    var jsonSchema = /*#__PURE__*/Object.freeze({
        __proto__: null
    });

    var index$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        $ZodAny: $ZodAny,
        $ZodArray: $ZodArray,
        $ZodAsyncError: $ZodAsyncError,
        $ZodBase64: $ZodBase64,
        $ZodBase64URL: $ZodBase64URL,
        $ZodBigInt: $ZodBigInt,
        $ZodBigIntFormat: $ZodBigIntFormat,
        $ZodBoolean: $ZodBoolean,
        $ZodCIDRv4: $ZodCIDRv4,
        $ZodCIDRv6: $ZodCIDRv6,
        $ZodCUID: $ZodCUID,
        $ZodCUID2: $ZodCUID2,
        $ZodCatch: $ZodCatch,
        $ZodCheck: $ZodCheck,
        $ZodCheckBigIntFormat: $ZodCheckBigIntFormat,
        $ZodCheckEndsWith: $ZodCheckEndsWith,
        $ZodCheckGreaterThan: $ZodCheckGreaterThan,
        $ZodCheckIncludes: $ZodCheckIncludes,
        $ZodCheckLengthEquals: $ZodCheckLengthEquals,
        $ZodCheckLessThan: $ZodCheckLessThan,
        $ZodCheckLowerCase: $ZodCheckLowerCase,
        $ZodCheckMaxLength: $ZodCheckMaxLength,
        $ZodCheckMaxSize: $ZodCheckMaxSize,
        $ZodCheckMimeType: $ZodCheckMimeType,
        $ZodCheckMinLength: $ZodCheckMinLength,
        $ZodCheckMinSize: $ZodCheckMinSize,
        $ZodCheckMultipleOf: $ZodCheckMultipleOf,
        $ZodCheckNumberFormat: $ZodCheckNumberFormat,
        $ZodCheckOverwrite: $ZodCheckOverwrite,
        $ZodCheckProperties: $ZodCheckProperties,
        $ZodCheckProperty: $ZodCheckProperty,
        $ZodCheckRegex: $ZodCheckRegex,
        $ZodCheckSizeEquals: $ZodCheckSizeEquals,
        $ZodCheckStartsWith: $ZodCheckStartsWith,
        $ZodCheckStringFormat: $ZodCheckStringFormat,
        $ZodCheckUpperCase: $ZodCheckUpperCase,
        $ZodCodec: $ZodCodec,
        $ZodCreditCard: $ZodCreditCard,
        $ZodCustom: $ZodCustom,
        $ZodCustomStringFormat: $ZodCustomStringFormat,
        $ZodCyclicError: $ZodCyclicError,
        $ZodDate: $ZodDate,
        $ZodDefault: $ZodDefault,
        $ZodDiscriminatedUnion: $ZodDiscriminatedUnion,
        $ZodE164: $ZodE164,
        $ZodEmail: $ZodEmail,
        $ZodEmoji: $ZodEmoji,
        $ZodEncodeError: $ZodEncodeError,
        $ZodEnum: $ZodEnum,
        $ZodError: $ZodError,
        $ZodExactOptional: $ZodExactOptional,
        $ZodFile: $ZodFile,
        $ZodFunction: $ZodFunction,
        $ZodGUID: $ZodGUID,
        $ZodIBAN: $ZodIBAN,
        $ZodIPv4: $ZodIPv4,
        $ZodIPv6: $ZodIPv6,
        $ZodISODate: $ZodISODate,
        $ZodISODateTime: $ZodISODateTime,
        $ZodISODuration: $ZodISODuration,
        $ZodISOTime: $ZodISOTime,
        $ZodIntersection: $ZodIntersection,
        $ZodJWT: $ZodJWT,
        $ZodKSUID: $ZodKSUID,
        $ZodLazy: $ZodLazy,
        $ZodLiteral: $ZodLiteral,
        $ZodMAC: $ZodMAC,
        $ZodMap: $ZodMap,
        $ZodNaN: $ZodNaN,
        $ZodNanoID: $ZodNanoID,
        $ZodNever: $ZodNever,
        $ZodNonOptional: $ZodNonOptional,
        $ZodNull: $ZodNull,
        $ZodNullable: $ZodNullable,
        $ZodNumber: $ZodNumber,
        $ZodNumberFormat: $ZodNumberFormat,
        $ZodObject: $ZodObject,
        $ZodObjectJIT: $ZodObjectJIT,
        $ZodOptional: $ZodOptional,
        $ZodPipe: $ZodPipe,
        $ZodPrefault: $ZodPrefault,
        $ZodPreprocess: $ZodPreprocess,
        $ZodPromise: $ZodPromise,
        $ZodReadonly: $ZodReadonly,
        $ZodRealError: $ZodRealError,
        $ZodRecord: $ZodRecord,
        $ZodRegistry: $ZodRegistry,
        $ZodSet: $ZodSet,
        $ZodString: $ZodString,
        $ZodStringFormat: $ZodStringFormat,
        $ZodSuccess: $ZodSuccess,
        $ZodSymbol: $ZodSymbol,
        $ZodTemplateLiteral: $ZodTemplateLiteral,
        $ZodTransform: $ZodTransform,
        $ZodTuple: $ZodTuple,
        $ZodType: $ZodType,
        $ZodULID: $ZodULID,
        $ZodURL: $ZodURL,
        $ZodUUID: $ZodUUID,
        $ZodUndefined: $ZodUndefined,
        $ZodUnion: $ZodUnion,
        $ZodUnknown: $ZodUnknown,
        $ZodVoid: $ZodVoid,
        $ZodXID: $ZodXID,
        $ZodXor: $ZodXor,
        $brand: $brand,
        $constructor: $constructor,
        $input: $input,
        $output: $output,
        Doc: Doc,
        INVALID: INVALID,
        JSONSchema: jsonSchema,
        JSONSchemaGenerator: JSONSchemaGenerator,
        NEVER: NEVER,
        TimePrecision: TimePrecision,
        URL_BAD_FORMAT: URL_BAD_FORMAT,
        URL_UNPARSEABLE: URL_UNPARSEABLE,
        ZodCompileAsyncError: ZodCompileAsyncError,
        ZodCompileUnsupportedError: ZodCompileUnsupportedError,
        _any: _any,
        _array: _array,
        _base64: _base64,
        _base64url: _base64url,
        _bigint: _bigint,
        _boolean: _boolean,
        _catch: _catch$1,
        _check: _check,
        _cidrv4: _cidrv4,
        _cidrv6: _cidrv6,
        _coercedBigint: _coercedBigint,
        _coercedBoolean: _coercedBoolean,
        _coercedDate: _coercedDate,
        _coercedNumber: _coercedNumber,
        _coercedString: _coercedString,
        _creditCard: _creditCard,
        _cuid: _cuid,
        _cuid2: _cuid2,
        _custom: _custom,
        _date: _date,
        _decode: _decode,
        _decodeAsync: _decodeAsync,
        _default: _default$1,
        _discriminatedUnion: _discriminatedUnion,
        _e164: _e164,
        _email: _email,
        _emoji: _emoji,
        _encode: _encode,
        _encodeAsync: _encodeAsync,
        _endsWith: _endsWith,
        _enum: _enum$1,
        _file: _file,
        _float32: _float32,
        _float64: _float64,
        _gt: _gt,
        _gte: _gte,
        _guid: _guid,
        _iban: _iban,
        _includes: _includes,
        _int: _int,
        _int32: _int32,
        _int64: _int64,
        _intersection: _intersection,
        _ipv4: _ipv4,
        _ipv6: _ipv6,
        _isoDate: _isoDate,
        _isoDateTime: _isoDateTime,
        _isoDuration: _isoDuration,
        _isoTime: _isoTime,
        _jwt: _jwt,
        _ksuid: _ksuid,
        _lazy: _lazy,
        _length: _length,
        _literal: _literal,
        _lowercase: _lowercase,
        _lt: _lt,
        _lte: _lte,
        _mac: _mac,
        _map: _map,
        _max: _lte,
        _maxLength: _maxLength,
        _maxSize: _maxSize,
        _mime: _mime,
        _min: _gte,
        _minLength: _minLength,
        _minSize: _minSize,
        _multipleOf: _multipleOf,
        _nan: _nan,
        _nanoid: _nanoid,
        _nativeEnum: _nativeEnum,
        _negative: _negative,
        _never: _never,
        _nonnegative: _nonnegative,
        _nonoptional: _nonoptional,
        _nonpositive: _nonpositive,
        _normalize: _normalize,
        _null: _null$1,
        _nullable: _nullable,
        _number: _number,
        _optional: _optional,
        _overwrite: _overwrite,
        _parse: _parse,
        _parseAsync: _parseAsync,
        _pipe: _pipe,
        _positive: _positive,
        _promise: _promise,
        _properties: _properties,
        _property: _property,
        _readonly: _readonly,
        _record: _record,
        _refine: _refine,
        _regex: _regex,
        _safeDecode: _safeDecode,
        _safeDecodeAsync: _safeDecodeAsync,
        _safeEncode: _safeEncode,
        _safeEncodeAsync: _safeEncodeAsync,
        _safeParse: _safeParse,
        _safeParseAsync: _safeParseAsync,
        _set: _set,
        _size: _size,
        _slugify: _slugify,
        _startsWith: _startsWith,
        _string: _string,
        _stringFormat: _stringFormat,
        _stringbool: _stringbool,
        _success: _success,
        _superRefine: _superRefine,
        _symbol: _symbol,
        _templateLiteral: _templateLiteral,
        _toLowerCase: _toLowerCase,
        _toUpperCase: _toUpperCase,
        _transform: _transform,
        _trim: _trim,
        _tuple: _tuple,
        _uint32: _uint32,
        _uint64: _uint64,
        _ulid: _ulid,
        _undefined: _undefined$1,
        _union: _union,
        _unknown: _unknown,
        _uppercase: _uppercase,
        _url: _url,
        _uuid: _uuid,
        _uuidv4: _uuidv4,
        _uuidv6: _uuidv6,
        _uuidv7: _uuidv7,
        _void: _void$1,
        _xid: _xid,
        _xor: _xor,
        base64Charset: base64Charset,
        base64urlCharset: base64urlCharset,
        canParseURL: canParseURL,
        clone: clone,
        compile: compile,
        compileFn: compileFn,
        config: config,
        createStandardJSONSchemaMethod: createStandardJSONSchemaMethod,
        createToJSONSchemaMethod: createToJSONSchemaMethod,
        decode: decode$1,
        decodeAsync: decodeAsync$1,
        describe: describe$1,
        encode: encode$1,
        encodeAsync: encodeAsync$1,
        extractDefs: extractDefs,
        finalize: finalize,
        flattenError: flattenError,
        formatError: formatError,
        getDiscriminatedOption: getDiscriminatedOption,
        globalConfig: globalConfig,
        globalRegistry: globalRegistry,
        handleUnrepresentable: handleUnrepresentable,
        initializeContext: initializeContext,
        isBackEdge: isBackEdge,
        isRecursiveSchema: isRecursiveSchema,
        isValidBase64: isValidBase64,
        isValidBase64URL: isValidBase64URL,
        isValidCIDRv6: isValidCIDRv6,
        isValidCreditCard: isValidCreditCard,
        isValidIBAN: isValidIBAN,
        isValidIPv6: isValidIPv6,
        isValidJWT: isValidJWT,
        locales: index$2,
        memoizer: memoizer,
        mergeValues: mergeValues,
        meta: meta$1,
        parse: parse$1,
        parseAsync: parseAsync$1,
        parseURLObject: parseURLObject,
        prettifyError: prettifyError,
        process: processSchema,
        processSchema: processSchema,
        regexes: regexes,
        registry: registry,
        safeDecode: safeDecode$1,
        safeDecodeAsync: safeDecodeAsync$1,
        safeEncode: safeEncode$1,
        safeEncodeAsync: safeEncodeAsync$1,
        safeParse: safeParse$1,
        safeParseAsync: safeParseAsync$1,
        standardProps: standardProps,
        stripTabAndNewline: stripTabAndNewline,
        toDotPath: toDotPath,
        toJSONSchema: toJSONSchema,
        toZod: toZod,
        treeifyError: treeifyError,
        urlHostnameOk: urlHostnameOk,
        urlProtocolOk: urlProtocolOk,
        util: util,
        validate: validate,
        validateAsync: validateAsync$1,
        validateURL: validateURL,
        version: version,
        withParser: withParser
    });

    var _checks = /*#__PURE__*/Object.freeze({
        __proto__: null,
        endsWith: _endsWith,
        gt: _gt,
        gte: _gte,
        includes: _includes,
        length: _length,
        lowercase: _lowercase,
        lt: _lt,
        lte: _lte,
        maxLength: _maxLength,
        maxSize: _maxSize,
        mime: _mime,
        minLength: _minLength,
        minSize: _minSize,
        multipleOf: _multipleOf,
        negative: _negative,
        nonnegative: _nonnegative,
        nonpositive: _nonpositive,
        normalize: _normalize,
        overwrite: _overwrite,
        positive: _positive,
        properties: _properties,
        property: _property,
        regex: _regex,
        size: _size,
        slugify: _slugify,
        startsWith: _startsWith,
        toLowerCase: _toLowerCase,
        toUpperCase: _toUpperCase,
        trim: _trim,
        uppercase: _uppercase
    });

    /* Prototypes that already carry the lazy helper methods. Seeded with the
     * intrinsics so that `init` on a foreign object — it accepts any object —
     * can never install an accessor onto a prototype we do not own. */
    const _installedErrorProtos = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
    /* Helper methods live as non-enumerable lazy getters on the shared
     * prototype instead of own properties on every instance. On first
     * access the getter allocates the per-instance closure and caches it
     * as a non-enumerable own property, so detached usage still works and
     * the allocation only happens for methods actually touched. */
    function _lazyMethod(proto, key, make) {
        Object.defineProperty(proto, key, {
            configurable: true,
            enumerable: false,
            get() {
                const value = make(this);
                Object.defineProperty(this, key, { value, configurable: true, writable: true });
                return value;
            },
            set(value) {
                Object.defineProperty(this, key, { value, configurable: true, writable: true });
            },
        });
    }
    const initializer = (inst, issues) => {
        $ZodError.init(inst, issues);
        inst.name = "ZodError";
        const proto = Object.getPrototypeOf(inst);
        if (_installedErrorProtos.has(proto))
            return;
        _installedErrorProtos.add(proto);
        _lazyMethod(proto, "format", (self) => (mapper) => formatError(self, mapper));
        _lazyMethod(proto, "flatten", (self) => (mapper) => flattenError(self, mapper));
        _lazyMethod(proto, "addIssue", (self) => (issue) => {
            self.issues.push(issue);
            self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
        });
        _lazyMethod(proto, "addIssues", (self) => (issues) => {
            self.issues.push(...issues);
            self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
        });
        Object.defineProperty(proto, "isEmpty", {
            configurable: true,
            enumerable: false,
            get() {
                return this.issues.length === 0;
            },
        });
    };
    const ZodError = /*@__PURE__*/ $constructor("ZodError", initializer);
    const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, undefined, {
        Parent: Error,
    });
    // /** @deprecated Use `z.core.$ZodErrorMapCtx` instead. */
    // export type ErrorMapCtx = core.$ZodErrorMapCtx;

    const parse = /* @__PURE__ */ _parse(ZodRealError);
    const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
    const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
    const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
    // Codec functions
    const encode = /* @__PURE__ */ _encode(ZodRealError);
    const decode = /* @__PURE__ */ _decode(ZodRealError);
    const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
    const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
    const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
    const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
    const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
    const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

    // Register English as the default locale on first ZodType construction. Hooked into the `ZodType` `$constructor` (rather than a top-level `config(en())` in `external.ts`) so bundlers honoring `sideEffects: false` can't tree-shake it out — see #5953, #5725. An explicit `z.config(z.locales.xx())` call wins regardless of order, since this only sets the default when none is present.
    function _ensureDefaultLocale() {
        if (!globalConfig.localeError)
            config(en());
    }
    // the default memoizer is read by the core container init, which runs before `ZodType.init`, so each container calls this first
    function _ensureDefaultMemoizer() {
        if (!globalConfig.memoizer)
            config({ memoizer: memoizer() });
    }
    const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
        _ensureDefaultLocale();
        $ZodType.init(inst, def);
        inst.def = def;
        inst.type = def.type;
        return inst;
    }, {
        check(...chks) {
            const def = this.def;
            return this.clone(mergeDefs(def, {
                checks: [
                    ...(def.checks ?? []),
                    ...chks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch),
                ],
            }), { parent: true });
        },
        with(...chks) {
            return this.check(...chks);
        },
        clone(def, params) {
            return clone(this, def, params);
        },
        brand() {
            return this;
        },
        register(reg, meta) {
            reg.add(this, meta);
            return this;
        },
        refine(check, params) {
            return this.check(refine(check, params));
        },
        superRefine(refinement, params) {
            return this.check(superRefine(refinement, params));
        },
        overwrite(fn) {
            return this.check(_overwrite(fn));
        },
        optional() {
            return optional(this);
        },
        exactOptional() {
            return exactOptional(this);
        },
        nullable() {
            return nullable(this);
        },
        nullish() {
            return optional(nullable(this));
        },
        nonoptional(params) {
            return nonoptional(this, params);
        },
        array() {
            return array(this);
        },
        or(arg) {
            return union([this, arg]);
        },
        and(arg) {
            return intersection(this, arg);
        },
        transform(tx) {
            return pipe(this, transform(tx));
        },
        default(d) {
            return _default(this, d);
        },
        prefault(d) {
            return prefault(this, d);
        },
        catch(params) {
            return _catch(this, params);
        },
        pipe(target) {
            return pipe(this, target);
        },
        readonly() {
            return readonly(this);
        },
        describe(description) {
            const cl = this.clone();
            globalRegistry.add(cl, { description });
            return cl;
        },
        meta(...args) {
            // overloaded: meta() returns the registered metadata, meta(data) returns a clone with `data` registered. The mapped type picks up the second overload, so we accept variadic any-args and return `any` to satisfy both at runtime.
            if (args.length === 0)
                return globalRegistry.get(this);
            const cl = this.clone();
            globalRegistry.add(cl, args[0]);
            return cl;
        },
        isOptional() {
            return this.safeParse(undefined).success;
        },
        isNullable() {
            return this.safeParse(null).success;
        },
        apply(fn, ...args) {
            return args.length === 0 ? fn(this) : fn(this, ...args);
        },
        // Overrides core's `~standard` to add `jsonSchema`. Must stay a prototype entry: redefining it per instance demotes instances to dictionary mode.
        get "~standard"() {
            return hide(this, "~standard", {
                ...standardProps(this),
                jsonSchema: {
                    input: createStandardJSONSchemaMethod(this, "input"),
                    output: createStandardJSONSchemaMethod(this, "output"),
                },
            });
        },
        set "~standard"(value) {
            own(this, "~standard", value);
        },
        parse: function _parse(data, params) {
            return parse(this, data, params, { callee: _parse });
        },
        parseAsync: async function _parseAsync(data, params) {
            return await parseAsync(this, data, params, { callee: _parseAsync });
        },
        safeParse(data, params) {
            return safeParse(this, data, params);
        },
        async safeParseAsync(data, params) {
            return safeParseAsync(this, data, params);
        },
        // `spa` is an alias: same function object as `safeParseAsync`, as before.
        get spa() {
            return this?.safeParseAsync;
        },
        set spa(value) {
            own(this, "spa", value);
        },
        validate(data, params) {
            return validate(this, data, params);
        },
        validateAsync(data, params) {
            return validateAsync$1(this, data, params);
        },
        encode: function _encode(data, params) {
            return encode(this, data, params, { callee: _encode });
        },
        decode: function _decode(data, params) {
            return decode(this, data, params, { callee: _decode });
        },
        encodeAsync: async function _encodeAsync(data, params) {
            return await encodeAsync(this, data, params, { callee: _encodeAsync });
        },
        decodeAsync: async function _decodeAsync(data, params) {
            return await decodeAsync(this, data, params, { callee: _decodeAsync });
        },
        safeEncode(data, params) {
            return safeEncode(this, data, params);
        },
        safeDecode(data, params) {
            return safeDecode(this, data, params);
        },
        async safeEncodeAsync(data, params) {
            return safeEncodeAsync(this, data, params);
        },
        async safeDecodeAsync(data, params) {
            return safeDecodeAsync(this, data, params);
        },
        toJSONSchema(params) {
            return createToJSONSchemaMethod(this, {})(params);
        },
        // Reads through to the registry on every access, so it must not cache.
        get description() {
            return globalRegistry.get(this)?.description;
        },
        // No setter: `schema._def = x` throws, as it did when `_def` was a non-writable own property.
        get _def() {
            return this._zod.def;
        },
    });
    /** @internal */
    const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
        $ZodString.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json);
    },
    /*@__PURE__*/ derived({
        format: (inst) => aggregateChecks(inst).format ?? null,
        minLength: (inst) => aggregateChecks(inst).minimum ?? null,
        maxLength: (inst) => aggregateChecks(inst).maximum ?? null,
    }, {
        regex(...args) {
            return this.check(_regex(...args));
        },
        includes(...args) {
            return this.check(_includes(...args));
        },
        startsWith(...args) {
            return this.check(_startsWith(...args));
        },
        endsWith(...args) {
            return this.check(_endsWith(...args));
        },
        min(...args) {
            return this.check(_minLength(...args));
        },
        max(...args) {
            return this.check(_maxLength(...args));
        },
        length(...args) {
            return this.check(_length(...args));
        },
        nonempty(...args) {
            return this.check(_minLength(1, ...args));
        },
        lowercase(params) {
            return this.check(_lowercase(params));
        },
        uppercase(params) {
            return this.check(_uppercase(params));
        },
        trim() {
            return this.check(_trim());
        },
        normalize(...args) {
            return this.check(_normalize(...args));
        },
        toLowerCase() {
            return this.check(_toLowerCase());
        },
        toUpperCase() {
            return this.check(_toUpperCase());
        },
        slugify() {
            return this.check(_slugify());
        },
    }));
    const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
        $ZodString.init(inst, def);
        _ZodString.init(inst, def);
    }, {
        email(params) {
            return this.check(_email(ZodEmail, params));
        },
        url(params) {
            return this.check(_url(ZodURL, params));
        },
        jwt(params) {
            return this.check(_jwt(ZodJWT, params));
        },
        emoji(params) {
            return this.check(_emoji(ZodEmoji, params));
        },
        guid(params) {
            return this.check(_guid(ZodGUID, params));
        },
        uuid(params) {
            return this.check(_uuid(ZodUUID, params));
        },
        uuidv4(params) {
            return this.check(_uuidv4(ZodUUID, params));
        },
        uuidv6(params) {
            return this.check(_uuidv6(ZodUUID, params));
        },
        uuidv7(params) {
            return this.check(_uuidv7(ZodUUID, params));
        },
        nanoid(params) {
            return this.check(_nanoid(ZodNanoID, params));
        },
        cuid(params) {
            return this.check(_cuid(ZodCUID, params));
        },
        cuid2(params) {
            return this.check(_cuid2(ZodCUID2, params));
        },
        ulid(params) {
            return this.check(_ulid(ZodULID, params));
        },
        base64(params) {
            return this.check(_base64(ZodBase64, params));
        },
        base64url(params) {
            return this.check(_base64url(ZodBase64URL, params));
        },
        xid(params) {
            return this.check(_xid(ZodXID, params));
        },
        ksuid(params) {
            return this.check(_ksuid(ZodKSUID, params));
        },
        ipv4(params) {
            return this.check(_ipv4(ZodIPv4, params));
        },
        ipv6(params) {
            return this.check(_ipv6(ZodIPv6, params));
        },
        cidrv4(params) {
            return this.check(_cidrv4(ZodCIDRv4, params));
        },
        cidrv6(params) {
            return this.check(_cidrv6(ZodCIDRv6, params));
        },
        e164(params) {
            return this.check(_e164(ZodE164, params));
        },
        datetime(params) {
            return this.check(_isoDateTime(ZodISODateTime, params));
        },
        date(params) {
            return this.check(_isoDate(ZodISODate, params));
        },
        time(params) {
            return this.check(_isoTime(ZodISOTime, params));
        },
        duration(params) {
            return this.check(_isoDuration(ZodISODuration, params));
        },
    });
    function string$1(params) {
        return _string(ZodString, params);
    }
    const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
        $ZodStringFormat.init(inst, def);
        _ZodString.init(inst, def);
    });
    const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
        $ZodISODateTime.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
        $ZodISODate.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
        $ZodISOTime.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
        $ZodISODuration.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodEmail.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function email(params) {
        return _email(ZodEmail, params);
    }
    const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodGUID.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function guid(params) {
        return _guid(ZodGUID, params);
    }
    const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodUUID.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function uuid(params) {
        return _uuid(ZodUUID, params);
    }
    function uuidv4(params) {
        return _uuidv4(ZodUUID, params);
    }
    // ZodUUIDv6
    function uuidv6(params) {
        return _uuidv6(ZodUUID, params);
    }
    // ZodUUIDv7
    function uuidv7(params) {
        return _uuidv7(ZodUUID, params);
    }
    const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodURL.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function url(params) {
        return _url(ZodURL, params);
    }
    function httpUrl(params) {
        return _url(ZodURL, {
            protocol: httpProtocol,
            hostname: domain,
            ...normalizeParams(params),
        });
    }
    const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodEmoji.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function emoji(params) {
        return _emoji(ZodEmoji, params);
    }
    const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodNanoID.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function nanoid(params) {
        return _nanoid(ZodNanoID, params);
    }
    /**
     * @deprecated CUID v1 is deprecated by its authors due to information leakage
     * (timestamps embedded in the id). Use {@link ZodCUID2} instead.
     * See https://github.com/paralleldrive/cuid.
     */
    const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodCUID.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    /**
     * Validates a CUID v1 string.
     *
     * @deprecated CUID v1 is deprecated by its authors due to information leakage
     * (timestamps embedded in the id). Use {@link cuid2 | `z.cuid2()`} instead.
     * See https://github.com/paralleldrive/cuid.
     */
    function cuid(params) {
        return _cuid(ZodCUID, params);
    }
    const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodCUID2.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function cuid2(params) {
        return _cuid2(ZodCUID2, params);
    }
    const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodULID.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function ulid(params) {
        return _ulid(ZodULID, params);
    }
    const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodXID.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function xid(params) {
        return _xid(ZodXID, params);
    }
    const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodKSUID.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function ksuid(params) {
        return _ksuid(ZodKSUID, params);
    }
    const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodIPv4.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function ipv4(params) {
        return _ipv4(ZodIPv4, params);
    }
    const ZodMAC = /*@__PURE__*/ $constructor("ZodMAC", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodMAC.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function mac(params) {
        return _mac(ZodMAC, params);
    }
    const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodIPv6.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function ipv6(params) {
        return _ipv6(ZodIPv6, params);
    }
    const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
        $ZodCIDRv4.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function cidrv4(params) {
        return _cidrv4(ZodCIDRv4, params);
    }
    const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
        $ZodCIDRv6.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function cidrv6(params) {
        return _cidrv6(ZodCIDRv6, params);
    }
    const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodBase64.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function base64(params) {
        return _base64(ZodBase64, params);
    }
    const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodBase64URL.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function base64url(params) {
        return _base64url(ZodBase64URL, params);
    }
    const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodE164.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function e164(params) {
        return _e164(ZodE164, params);
    }
    const ZodCreditCard = /*@__PURE__*/ $constructor("ZodCreditCard", (inst, def) => {
        $ZodCreditCard.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function creditCard(params) {
        return _creditCard(ZodCreditCard, params);
    }
    const ZodIBAN = /*@__PURE__*/ $constructor("ZodIBAN", (inst, def) => {
        $ZodIBAN.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function iban(params) {
        return _iban(ZodIBAN, params);
    }
    const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodJWT.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function jwt(params) {
        return _jwt(ZodJWT, params);
    }
    const ZodCustomStringFormat = /*@__PURE__*/ $constructor("ZodCustomStringFormat", (inst, def) => {
        // ZodStringFormat.init(inst, def);
        $ZodCustomStringFormat.init(inst, def);
        ZodStringFormat.init(inst, def);
    });
    function stringFormat(format, fnOrRegex, _params = {}) {
        return _stringFormat(ZodCustomStringFormat, format, fnOrRegex, _params);
    }
    function hostname(_params) {
        return _stringFormat(ZodCustomStringFormat, "hostname", hostname$1, _params);
    }
    function hex(_params) {
        return _stringFormat(ZodCustomStringFormat, "hex", hex$1, _params);
    }
    function currencyCode(_params) {
        return _stringFormat(ZodCustomStringFormat, "currency_code", currencyCode$1, _params);
    }
    function hash(alg, params) {
        const enc = params?.enc ?? "hex";
        const format = `${alg}_${enc}`;
        const regex = regexes[format];
        if (!regex)
            throw new Error(`Unrecognized hash format: ${format}`);
        return _stringFormat(ZodCustomStringFormat, format, regex, params);
    }
    const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
        $ZodNumber.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
        inst.isFinite = true;
    },
    /*@__PURE__*/ derived({
        minValue: (inst) => {
            const { minimum, exclusiveMinimum } = aggregateChecks(inst);
            return Math.max(minimum ?? Number.NEGATIVE_INFINITY, exclusiveMinimum ?? Number.NEGATIVE_INFINITY);
        },
        maxValue: (inst) => {
            const { maximum, exclusiveMaximum } = aggregateChecks(inst);
            return Math.min(maximum ?? Number.POSITIVE_INFINITY, exclusiveMaximum ?? Number.POSITIVE_INFINITY);
        },
        isInt: (inst) => {
            const { isInt, multipleOf } = aggregateChecks(inst);
            return !!isInt || !!multipleOf?.some(Number.isSafeInteger);
        },
        format: (inst) => aggregateChecks(inst).format ?? null,
    }, {
        gt(value, params) {
            return this.check(_gt(value, params));
        },
        gte(value, params) {
            return this.check(_gte(value, params));
        },
        min(value, params) {
            return this.check(_gte(value, params));
        },
        lt(value, params) {
            return this.check(_lt(value, params));
        },
        lte(value, params) {
            return this.check(_lte(value, params));
        },
        max(value, params) {
            return this.check(_lte(value, params));
        },
        int(params) {
            return this.check(int(params));
        },
        safe(params) {
            return this.check(int(params));
        },
        positive(params) {
            return this.check(_gt(0, params));
        },
        nonnegative(params) {
            return this.check(_gte(0, params));
        },
        negative(params) {
            return this.check(_lt(0, params));
        },
        nonpositive(params) {
            return this.check(_lte(0, params));
        },
        multipleOf(value, params) {
            return this.check(_multipleOf(value, params));
        },
        step(value, params) {
            return this.check(_multipleOf(value, params));
        },
        finite() {
            return this;
        },
    }));
    function number$1(params) {
        return _number(ZodNumber, params);
    }
    const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
        $ZodNumberFormat.init(inst, def);
        ZodNumber.init(inst, def);
    });
    function int(params) {
        return _int(ZodNumberFormat, params);
    }
    function float32(params) {
        return _float32(ZodNumberFormat, params);
    }
    function float64(params) {
        return _float64(ZodNumberFormat, params);
    }
    function int32(params) {
        return _int32(ZodNumberFormat, params);
    }
    function uint32(params) {
        return _uint32(ZodNumberFormat, params);
    }
    const ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
        $ZodBoolean.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json);
    });
    function boolean$1(params) {
        return _boolean(ZodBoolean, params);
    }
    const ZodBigInt = /*@__PURE__*/ $constructor("ZodBigInt", (inst, def) => {
        $ZodBigInt.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => bigintProcessor(inst, ctx, json, params);
    },
    /*@__PURE__*/ derived({
        minValue: (inst) => aggregateChecks(inst).minimum ?? null,
        maxValue: (inst) => aggregateChecks(inst).maximum ?? null,
        format: (inst) => aggregateChecks(inst).format ?? null,
    }, {
        gte(value, params) {
            return this.check(_gte(value, params));
        },
        min(value, params) {
            return this.check(_gte(value, params));
        },
        gt(value, params) {
            return this.check(_gt(value, params));
        },
        lt(value, params) {
            return this.check(_lt(value, params));
        },
        lte(value, params) {
            return this.check(_lte(value, params));
        },
        max(value, params) {
            return this.check(_lte(value, params));
        },
        positive(params) {
            return this.check(_gt(BigInt(0), params));
        },
        negative(params) {
            return this.check(_lt(BigInt(0), params));
        },
        nonpositive(params) {
            return this.check(_lte(BigInt(0), params));
        },
        nonnegative(params) {
            return this.check(_gte(BigInt(0), params));
        },
        multipleOf(value, params) {
            return this.check(_multipleOf(value, params));
        },
    }));
    function bigint$1(params) {
        return _bigint(ZodBigInt, params);
    }
    const ZodBigIntFormat = /*@__PURE__*/ $constructor("ZodBigIntFormat", (inst, def) => {
        $ZodBigIntFormat.init(inst, def);
        ZodBigInt.init(inst, def);
    });
    function int64(params) {
        return _int64(ZodBigIntFormat, params);
    }
    function uint64(params) {
        return _uint64(ZodBigIntFormat, params);
    }
    const ZodSymbol = /*@__PURE__*/ $constructor("ZodSymbol", (inst, def) => {
        $ZodSymbol.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => symbolProcessor(inst, ctx, json, params);
    });
    function symbol(params) {
        return _symbol(ZodSymbol, params);
    }
    const ZodUndefined = /*@__PURE__*/ $constructor("ZodUndefined", (inst, def) => {
        $ZodUndefined.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => undefinedProcessor(inst, ctx, json, params);
    });
    function _undefined(params) {
        return _undefined$1(ZodUndefined, params);
    }
    const ZodNull = /*@__PURE__*/ $constructor("ZodNull", (inst, def) => {
        $ZodNull.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => nullProcessor(inst, ctx, json);
    });
    function _null(params) {
        return _null$1(ZodNull, params);
    }
    const ZodAny = /*@__PURE__*/ $constructor("ZodAny", (inst, def) => {
        $ZodAny.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => anyProcessor();
    });
    function any() {
        return _any(ZodAny);
    }
    const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
        $ZodUnknown.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => unknownProcessor();
    });
    function unknown() {
        return _unknown(ZodUnknown);
    }
    const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
        $ZodNever.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json);
    });
    function never(params) {
        return _never(ZodNever, params);
    }
    const ZodVoid = /*@__PURE__*/ $constructor("ZodVoid", (inst, def) => {
        $ZodVoid.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => voidProcessor(inst, ctx, json, params);
    });
    function _void(params) {
        return _void$1(ZodVoid, params);
    }
    const ZodDate = /*@__PURE__*/ $constructor("ZodDate", (inst, def) => {
        $ZodDate.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => dateProcessor(inst, ctx, json, params);
        inst.min = (value, params) => inst.check(_gte(value, params));
        inst.max = (value, params) => inst.check(_lte(value, params));
    },
    /*@__PURE__*/ derived({
        minDate: (inst) => {
            const { minimum } = aggregateChecks(inst);
            return minimum ? new Date(minimum) : null;
        },
        maxDate: (inst) => {
            const { maximum } = aggregateChecks(inst);
            return maximum ? new Date(maximum) : null;
        },
    }, {}));
    function date$2(params) {
        return _date(ZodDate, params);
    }
    const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
        _ensureDefaultMemoizer();
        $ZodArray.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
        inst.element = def.element;
    }, {
        min(n, params) {
            return this.check(_minLength(n, params));
        },
        nonempty(params) {
            return this.check(_minLength(1, params));
        },
        max(n, params) {
            return this.check(_maxLength(n, params));
        },
        length(n, params) {
            return this.check(_length(n, params));
        },
        unwrap() {
            return this.element;
        },
    });
    function array(element, params) {
        return _array(ZodArray, element, params);
    }
    // .keyof
    function keyof(schema) {
        const shape = schema._zod.def.shape;
        return _enum(Object.keys(shape));
    }
    const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
        _ensureDefaultMemoizer();
        $ZodObjectJIT.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
        installLazyProp(inst, "shape", (self) => self._zod.def.shape, false);
    }, {
        keyof() {
            return _enum(Object.keys(this._zod.def.shape));
        },
        catchall(catchall) {
            // `mergeDefs` rather than a spread: spreading reads `shape`, and resolving it can mint a whole fresh subtree
            return this.clone(mergeDefs(this._zod.def, { catchall: catchall }));
        },
        passthrough() {
            return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
        },
        loose() {
            return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
        },
        strict() {
            return this.clone(mergeDefs(this._zod.def, { catchall: never() }));
        },
        strip() {
            return this.clone(mergeDefs(this._zod.def, { catchall: undefined }));
        },
        extend(incoming) {
            return extend(this, incoming);
        },
        safeExtend(incoming) {
            return safeExtend(this, incoming);
        },
        merge(other) {
            return merge(this, other);
        },
        pick(mask) {
            return pick(this, mask);
        },
        omit(mask) {
            return omit(this, mask);
        },
        partial(...args) {
            return partial(ZodOptional, this, args[0]);
        },
        exactPartial(...args) {
            return partial(ZodExactOptional, this, args[0], "exactPartial");
        },
        required(...args) {
            return required(ZodNonOptional, this, args[0]);
        },
    });
    function object(shape, params) {
        const def = {
            type: "object",
            shape: shape ?? {},
            ...normalizeParams(params),
        };
        return new ZodObject(def);
    }
    // strictObject
    function strictObject(shape, params) {
        return new ZodObject({
            type: "object",
            shape,
            catchall: never(),
            ...normalizeParams(params),
        });
    }
    // looseObject
    function looseObject(shape, params) {
        return new ZodObject({
            type: "object",
            shape,
            catchall: unknown(),
            ...normalizeParams(params),
        });
    }
    const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
        $ZodUnion.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
        inst.options = def.options;
    });
    function union(options, params) {
        return new ZodUnion({
            type: "union",
            options: options,
            ...normalizeParams(params),
        });
    }
    const ZodXor = /*@__PURE__*/ $constructor("ZodXor", (inst, def) => {
        ZodUnion.init(inst, def);
        $ZodXor.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
        inst.options = def.options;
    });
    /** Creates an exclusive union (XOR) where exactly one option must match.
     * Unlike regular unions that succeed when any option matches, xor fails if
     * zero or more than one option matches the input. */
    function xor(options, params) {
        return new ZodXor({
            type: "union",
            options: options,
            inclusive: false,
            ...normalizeParams(params),
        });
    }
    const ZodDiscriminatedUnion = /*@__PURE__*/ $constructor("ZodDiscriminatedUnion", (inst, def) => {
        ZodUnion.init(inst, def);
        $ZodDiscriminatedUnion.init(inst, def);
    });
    function discriminatedUnion(discriminator, options, params) {
        // const [options, params] = args;
        return new ZodDiscriminatedUnion({
            type: "union",
            options: options,
            discriminator,
            ...normalizeParams(params),
        });
    }
    const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
        $ZodIntersection.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
    });
    function intersection(left, right) {
        return new ZodIntersection({
            type: "intersection",
            left: left,
            right: right,
        });
    }
    const ZodTuple = /*@__PURE__*/ $constructor("ZodTuple", (inst, def) => {
        _ensureDefaultMemoizer();
        $ZodTuple.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => tupleProcessor(inst, ctx, json, params);
    }, {
        rest(rest) {
            return this.clone({
                ...this._zod.def,
                rest: rest,
            });
        },
        partial() {
            const def = this._zod.def;
            // a refinement was authored against the full arity; partialing would run it on a shorter array
            if (def.checks?.length)
                throw new Error(".partial() cannot be used on tuple schemas containing refinements");
            return this.clone({
                ...def,
                items: def.items.map((item) => new ZodOptional({ type: "optional", innerType: item })),
            });
        },
    });
    function tuple(items, _paramsOrRest, _params) {
        const hasRest = _paramsOrRest instanceof $ZodType;
        const params = hasRest ? _params : _paramsOrRest;
        const rest = hasRest ? _paramsOrRest : null;
        return new ZodTuple({
            type: "tuple",
            items: items,
            rest,
            ...normalizeParams(params),
        });
    }
    const ZodRecord = /*@__PURE__*/ $constructor("ZodRecord", (inst, def) => {
        _ensureDefaultMemoizer();
        $ZodRecord.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
        inst.keyType = def.keyType;
        inst.valueType = def.valueType;
    });
    function record(keyType, valueType, params) {
        // v3-compat: z.record(valueType, params?) — defaults keyType to z.string()
        if (!valueType || !valueType._zod) {
            return new ZodRecord({
                type: "record",
                keyType: string$1(),
                valueType: keyType,
                ...normalizeParams(valueType),
            });
        }
        return new ZodRecord({
            type: "record",
            keyType,
            valueType: valueType,
            ...normalizeParams(params),
        });
    }
    // type alksjf = core.output<core.$ZodRecordKey>;
    function partialRecord(keyType, valueType, params) {
        return new ZodRecord({
            type: "record",
            keyType,
            valueType: valueType,
            ...normalizeParams(params),
            partial: true,
        });
    }
    function looseRecord(keyType, valueType, params) {
        return new ZodRecord({
            type: "record",
            keyType,
            valueType: valueType,
            mode: "loose",
            ...normalizeParams(params),
        });
    }
    const ZodMap = /*@__PURE__*/ $constructor("ZodMap", (inst, def) => {
        _ensureDefaultMemoizer();
        $ZodMap.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => mapProcessor(inst, ctx, json, params);
        inst.keyType = def.keyType;
        inst.valueType = def.valueType;
        inst.min = (...args) => inst.check(_minSize(...args));
        inst.nonempty = (params) => inst.check(_minSize(1, params));
        inst.max = (...args) => inst.check(_maxSize(...args));
        inst.size = (...args) => inst.check(_size(...args));
    });
    function map(keyType, valueType, params) {
        return new ZodMap({
            type: "map",
            keyType: keyType,
            valueType: valueType,
            ...normalizeParams(params),
        });
    }
    const ZodSet = /*@__PURE__*/ $constructor("ZodSet", (inst, def) => {
        _ensureDefaultMemoizer();
        $ZodSet.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => setProcessor(inst, ctx, json, params);
        inst.min = (...args) => inst.check(_minSize(...args));
        inst.nonempty = (params) => inst.check(_minSize(1, params));
        inst.max = (...args) => inst.check(_maxSize(...args));
        inst.size = (...args) => inst.check(_size(...args));
    });
    function set(valueType, params) {
        return new ZodSet({
            type: "set",
            valueType: valueType,
            ...normalizeParams(params),
        });
    }
    const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
        $ZodEnum.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json);
        inst.enum = def.entries;
        // reuse the parsed value set so a numeric TS enum's reverse-mapping keys stay out
        inst.options = [...inst._zod.values];
        const keys = new Set(Object.keys(def.entries));
        inst.extract = (values, params) => {
            const newEntries = {};
            for (const value of values) {
                if (keys.has(value)) {
                    newEntries[value] = def.entries[value];
                }
                else
                    throw new Error(`Key ${value} not found in enum`);
            }
            return new ZodEnum({
                ...def,
                checks: [],
                ...normalizeParams(params),
                entries: newEntries,
            });
        };
        inst.exclude = (values, params) => {
            const newEntries = { ...def.entries };
            for (const value of values) {
                if (keys.has(value)) {
                    delete newEntries[value];
                }
                else
                    throw new Error(`Key ${value} not found in enum`);
            }
            return new ZodEnum({
                ...def,
                checks: [],
                ...normalizeParams(params),
                entries: newEntries,
            });
        };
    });
    function _enum(values, params) {
        const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
        return new ZodEnum({
            type: "enum",
            entries,
            ...normalizeParams(params),
        });
    }
    /** @deprecated This API has been merged into `z.enum()`. Use `z.enum()` instead.
     *
     * ```ts
     * enum Colors { red, green, blue }
     * z.enum(Colors);
     * ```
     */
    function nativeEnum(entries, params) {
        return new ZodEnum({
            type: "enum",
            entries,
            ...normalizeParams(params),
        });
    }
    const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
        $ZodLiteral.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
        inst.values = new Set(def.values);
        Object.defineProperty(inst, "value", {
            get() {
                if (def.values.length > 1) {
                    throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
                }
                return def.values[0];
            },
        });
    });
    function literal(value, params) {
        return new ZodLiteral({
            type: "literal",
            values: Array.isArray(value) ? value : [value],
            ...normalizeParams(params),
        });
    }
    const ZodFile = /*@__PURE__*/ $constructor("ZodFile", (inst, def) => {
        $ZodFile.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => fileProcessor(inst, ctx, json);
        inst.min = (size, params) => inst.check(_minSize(size, params));
        inst.max = (size, params) => inst.check(_maxSize(size, params));
        inst.mime = (types, params) => inst.check(_mime(Array.isArray(types) ? types : [types], params));
    });
    function file(params) {
        return _file(ZodFile, params);
    }
    const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
        _ensureDefaultMemoizer();
        $ZodTransform.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
        inst._zod.parse = (payload, _ctx) => {
            if (_ctx.direction === "backward") {
                throw new $ZodEncodeError(inst.constructor.name);
            }
            payload.addIssue = (issue$1) => {
                if (typeof issue$1 === "string") {
                    payload.issues.push(issue(issue$1, payload.value, def));
                }
                else {
                    // for Zod 3 backwards compatibility
                    const _issue = issue$1;
                    if (_issue.fatal)
                        _issue.continue = false;
                    _issue.code ?? (_issue.code = "custom");
                    if (!("input" in _issue))
                        _issue.input = payload.value;
                    _issue.inst ?? (_issue.inst = inst);
                    // _issue.continue ??= true;
                    payload.issues.push(issue(_issue));
                }
            };
            const output = def.transform(payload.value, payload);
            if (output instanceof Promise) {
                return output.then((output) => {
                    payload.value = output;
                    return payload;
                });
            }
            payload.value = output;
            return payload;
        };
    });
    function transform(fn) {
        return new ZodTransform({
            type: "transform",
            transform: fn,
        });
    }
    const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
        $ZodOptional.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
        inst.unwrap = () => inst._zod.def.innerType;
    });
    function optional(innerType) {
        return new ZodOptional({
            type: "optional",
            innerType: innerType,
        });
    }
    const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
        $ZodExactOptional.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
        inst.unwrap = () => inst._zod.def.innerType;
    });
    function exactOptional(innerType) {
        return new ZodExactOptional({
            type: "optional",
            innerType: innerType,
        });
    }
    const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
        $ZodNullable.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
        inst.unwrap = () => inst._zod.def.innerType;
    });
    function nullable(innerType) {
        return new ZodNullable({
            type: "nullable",
            innerType: innerType,
        });
    }
    // nullish
    function nullish(innerType) {
        return optional(nullable(innerType));
    }
    const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
        $ZodDefault.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
        inst.unwrap = () => inst._zod.def.innerType;
        inst.removeDefault = inst.unwrap;
    });
    function _default(innerType, defaultValue) {
        return new ZodDefault({
            type: "default",
            innerType: innerType,
            get defaultValue() {
                return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
            },
        });
    }
    const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
        $ZodPrefault.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
        inst.unwrap = () => inst._zod.def.innerType;
    });
    function prefault(innerType, defaultValue) {
        return new ZodPrefault({
            type: "prefault",
            innerType: innerType,
            get defaultValue() {
                return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
            },
        });
    }
    const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
        $ZodNonOptional.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
        inst.unwrap = () => inst._zod.def.innerType;
    });
    function nonoptional(innerType, params) {
        return new ZodNonOptional({
            type: "nonoptional",
            innerType: innerType,
            ...normalizeParams(params),
        });
    }
    const ZodSuccess = /*@__PURE__*/ $constructor("ZodSuccess", (inst, def) => {
        $ZodSuccess.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => successProcessor(inst, ctx, json);
        inst.unwrap = () => inst._zod.def.innerType;
    });
    function success(innerType) {
        return new ZodSuccess({
            type: "success",
            innerType: innerType,
        });
    }
    const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
        $ZodCatch.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
        inst.unwrap = () => inst._zod.def.innerType;
        inst.removeCatch = inst.unwrap;
    });
    function _catch(innerType, catchValue) {
        return new ZodCatch({
            type: "catch",
            innerType: innerType,
            catchValue: (typeof catchValue === "function" ? catchValue : constantCatch(catchValue)),
        });
    }
    const ZodNaN = /*@__PURE__*/ $constructor("ZodNaN", (inst, def) => {
        $ZodNaN.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => nanProcessor(inst, ctx, json, params);
    });
    function nan(params) {
        return _nan(ZodNaN, params);
    }
    const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
        $ZodPipe.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
        inst.in = def.in;
        inst.out = def.out;
    });
    function pipe(in_, out) {
        return new ZodPipe({
            type: "pipe",
            in: in_,
            out: out,
            // ...util.normalizeParams(params),
        });
    }
    const ZodCodec = /*@__PURE__*/ $constructor("ZodCodec", (inst, def) => {
        ZodPipe.init(inst, def);
        $ZodCodec.init(inst, def);
    });
    function codec(in_, out, params) {
        return new ZodCodec({
            type: "pipe",
            in: in_,
            out: out,
            transform: params.decode,
            reverseTransform: params.encode,
        });
    }
    function invertCodec(codec) {
        const def = codec._zod.def;
        return new ZodCodec({
            type: "pipe",
            in: def.out,
            out: def.in,
            transform: def.reverseTransform,
            reverseTransform: def.transform,
        });
    }
    const ZodPreprocess = /*@__PURE__*/ $constructor("ZodPreprocess", (inst, def) => {
        ZodPipe.init(inst, def);
        $ZodPreprocess.init(inst, def);
    });
    const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
        $ZodReadonly.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
        inst.unwrap = () => inst._zod.def.innerType;
    });
    function readonly(innerType) {
        return new ZodReadonly({
            type: "readonly",
            innerType: innerType,
        });
    }
    const ZodTemplateLiteral = /*@__PURE__*/ $constructor("ZodTemplateLiteral", (inst, def) => {
        $ZodTemplateLiteral.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => templateLiteralProcessor(inst, ctx, json);
    });
    function templateLiteral(parts, params) {
        return new ZodTemplateLiteral({
            type: "template_literal",
            parts,
            ...normalizeParams(params),
        });
    }
    const ZodLazy = /*@__PURE__*/ $constructor("ZodLazy", (inst, def) => {
        $ZodLazy.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => lazyProcessor(inst, ctx, json, params);
        inst.unwrap = () => inst._zod.def.getter();
    });
    function lazy(getter) {
        return new ZodLazy({
            type: "lazy",
            getter: getter,
        });
    }
    const ZodPromise = /*@__PURE__*/ $constructor("ZodPromise", (inst, def) => {
        $ZodPromise.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => promiseProcessor(inst, ctx, json, params);
        inst.unwrap = () => inst._zod.def.innerType;
    });
    function promise(innerType) {
        return new ZodPromise({
            type: "promise",
            innerType: innerType,
        });
    }
    const ZodFunction = /*@__PURE__*/ $constructor("ZodFunction", (inst, def) => {
        $ZodFunction.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => functionProcessor(inst, ctx, json, params);
    });
    function _function(params) {
        return new ZodFunction({
            type: "function",
            input: Array.isArray(params?.input) ? tuple(params?.input) : (params?.input ?? array(unknown())),
            output: params?.output ?? unknown(),
        });
    }
    const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
        $ZodCustom.init(inst, def);
        ZodType.init(inst, def);
        inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
    });
    // custom checks
    function check(fn) {
        const ch = new $ZodCheck({
            check: "custom",
            // ...util.normalizeParams(params),
        });
        ch._zod.check = fn;
        return ch;
    }
    function custom(fn, _params) {
        return _custom(ZodCustom, fn ?? (() => true), _params);
    }
    function refine(fn, _params = {}) {
        return _refine(ZodCustom, fn, _params);
    }
    // superRefine
    function superRefine(fn, params) {
        return _superRefine(fn, params);
    }
    // Re-export describe and meta from core
    const describe = describe$1;
    const meta = meta$1;
    const ZodInstanceOf = /*@__PURE__*/ $constructor("ZodInstanceOf", (inst, def) => {
        ZodCustom.init(inst, def);
    }, {
        properties(shape, params) {
            // asserts in place, so the narrowed output type is truthful without a wrapper
            return this.check(_properties(shape, params));
        },
    });
    function _instanceof(cls, params = {}) {
        const inst = new ZodInstanceOf({
            type: "custom",
            check: "custom",
            fn: (data) => data instanceof cls,
            abort: true,
            ...normalizeParams(params),
        });
        inst._zod.bag.Class = cls;
        // Override check to emit invalid_type instead of custom
        inst._zod.check = (payload) => {
            if (!(payload.value instanceof cls)) {
                payload.issues.push({
                    code: "invalid_type",
                    expected: cls.name,
                    input: payload.value,
                    inst,
                    path: [...(inst._zod.def.path ?? [])],
                });
            }
        };
        return inst;
    }
    // stringbool
    const stringbool = (...args) => _stringbool({
        Codec: ZodCodec,
        Boolean: ZodBoolean,
        String: ZodString,
    }, ...args);
    function json(params) {
        const jsonSchema = lazy(() => {
            return union([string$1(params), number$1(), boolean$1(), _null(), array(jsonSchema), record(string$1(), jsonSchema)]);
        });
        return jsonSchema;
    }
    // preprocess
    function preprocess(fn, schema) {
        return new ZodPreprocess({
            type: "pipe",
            in: transform(fn),
            out: schema,
        });
    }

    var _schemas = /*#__PURE__*/Object.freeze({
        __proto__: null,
        ZodAny: ZodAny,
        ZodArray: ZodArray,
        ZodBase64: ZodBase64,
        ZodBase64URL: ZodBase64URL,
        ZodBigInt: ZodBigInt,
        ZodBigIntFormat: ZodBigIntFormat,
        ZodBoolean: ZodBoolean,
        ZodCIDRv4: ZodCIDRv4,
        ZodCIDRv6: ZodCIDRv6,
        ZodCUID: ZodCUID,
        ZodCUID2: ZodCUID2,
        ZodCatch: ZodCatch,
        ZodCodec: ZodCodec,
        ZodCreditCard: ZodCreditCard,
        ZodCustom: ZodCustom,
        ZodCustomStringFormat: ZodCustomStringFormat,
        ZodDate: ZodDate,
        ZodDefault: ZodDefault,
        ZodDiscriminatedUnion: ZodDiscriminatedUnion,
        ZodE164: ZodE164,
        ZodEmail: ZodEmail,
        ZodEmoji: ZodEmoji,
        ZodEnum: ZodEnum,
        ZodExactOptional: ZodExactOptional,
        ZodFile: ZodFile,
        ZodFunction: ZodFunction,
        ZodGUID: ZodGUID,
        ZodIBAN: ZodIBAN,
        ZodIPv4: ZodIPv4,
        ZodIPv6: ZodIPv6,
        ZodISODate: ZodISODate,
        ZodISODateTime: ZodISODateTime,
        ZodISODuration: ZodISODuration,
        ZodISOTime: ZodISOTime,
        ZodInstanceOf: ZodInstanceOf,
        ZodIntersection: ZodIntersection,
        ZodJWT: ZodJWT,
        ZodKSUID: ZodKSUID,
        ZodLazy: ZodLazy,
        ZodLiteral: ZodLiteral,
        ZodMAC: ZodMAC,
        ZodMap: ZodMap,
        ZodNaN: ZodNaN,
        ZodNanoID: ZodNanoID,
        ZodNever: ZodNever,
        ZodNonOptional: ZodNonOptional,
        ZodNull: ZodNull,
        ZodNullable: ZodNullable,
        ZodNumber: ZodNumber,
        ZodNumberFormat: ZodNumberFormat,
        ZodObject: ZodObject,
        ZodOptional: ZodOptional,
        ZodPipe: ZodPipe,
        ZodPrefault: ZodPrefault,
        ZodPreprocess: ZodPreprocess,
        ZodPromise: ZodPromise,
        ZodReadonly: ZodReadonly,
        ZodRecord: ZodRecord,
        ZodSet: ZodSet,
        ZodString: ZodString,
        ZodStringFormat: ZodStringFormat,
        ZodSuccess: ZodSuccess,
        ZodSymbol: ZodSymbol,
        ZodTemplateLiteral: ZodTemplateLiteral,
        ZodTransform: ZodTransform,
        ZodTuple: ZodTuple,
        ZodType: ZodType,
        ZodULID: ZodULID,
        ZodURL: ZodURL,
        ZodUUID: ZodUUID,
        ZodUndefined: ZodUndefined,
        ZodUnion: ZodUnion,
        ZodUnknown: ZodUnknown,
        ZodVoid: ZodVoid,
        ZodXID: ZodXID,
        ZodXor: ZodXor,
        _ZodString: _ZodString,
        _default: _default,
        _function: _function,
        any: any,
        array: array,
        base64: base64,
        base64url: base64url,
        bigint: bigint$1,
        boolean: boolean$1,
        catch: _catch,
        check: check,
        cidrv4: cidrv4,
        cidrv6: cidrv6,
        codec: codec,
        creditCard: creditCard,
        cuid: cuid,
        cuid2: cuid2,
        currencyCode: currencyCode,
        custom: custom,
        date: date$2,
        describe: describe,
        discriminatedUnion: discriminatedUnion,
        e164: e164,
        email: email,
        emoji: emoji,
        enum: _enum,
        exactOptional: exactOptional,
        file: file,
        float32: float32,
        float64: float64,
        function: _function,
        guid: guid,
        hash: hash,
        hex: hex,
        hostname: hostname,
        httpUrl: httpUrl,
        iban: iban,
        instanceof: _instanceof,
        int: int,
        int32: int32,
        int64: int64,
        intersection: intersection,
        invertCodec: invertCodec,
        ipv4: ipv4,
        ipv6: ipv6,
        json: json,
        jwt: jwt,
        keyof: keyof,
        ksuid: ksuid,
        lazy: lazy,
        literal: literal,
        looseObject: looseObject,
        looseRecord: looseRecord,
        mac: mac,
        map: map,
        meta: meta,
        nan: nan,
        nanoid: nanoid,
        nativeEnum: nativeEnum,
        never: never,
        nonoptional: nonoptional,
        null: _null,
        nullable: nullable,
        nullish: nullish,
        number: number$1,
        object: object,
        optional: optional,
        partialRecord: partialRecord,
        pipe: pipe,
        prefault: prefault,
        preprocess: preprocess,
        promise: promise,
        readonly: readonly,
        record: record,
        refine: refine,
        set: set,
        strictObject: strictObject,
        string: string$1,
        stringFormat: stringFormat,
        stringbool: stringbool,
        success: success,
        superRefine: superRefine,
        symbol: symbol,
        templateLiteral: templateLiteral,
        transform: transform,
        tuple: tuple,
        uint32: uint32,
        uint64: uint64,
        ulid: ulid,
        undefined: _undefined,
        union: union,
        unknown: unknown,
        url: url,
        uuid: uuid,
        uuidv4: uuidv4,
        uuidv6: uuidv6,
        uuidv7: uuidv7,
        void: _void,
        xid: xid,
        xor: xor
    });

    // Zod 3 compat layer
    /** @deprecated Use the raw string literal codes instead, e.g. "invalid_type". */
    const ZodIssueCode = {
        invalid_type: "invalid_type",
        too_big: "too_big",
        too_small: "too_small",
        invalid_format: "invalid_format",
        not_multiple_of: "not_multiple_of",
        unrecognized_keys: "unrecognized_keys",
        invalid_union: "invalid_union",
        invalid_key: "invalid_key",
        invalid_element: "invalid_element",
        invalid_value: "invalid_value",
        custom: "custom",
    };
    /** @deprecated Use `z.config(params)` instead. */
    function setErrorMap(map) {
        config({
            customError: map,
        });
    }
    /** @deprecated Use `z.config()` instead. */
    function getErrorMap() {
        return config().customError;
    }
    /** @deprecated Do not use. Stub definition, only included for zod-to-json-schema compatibility. */
    var ZodFirstPartyTypeKind;
    (function (ZodFirstPartyTypeKind) {
    })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));

    function datetime(params) {
        return _isoDateTime(ZodISODateTime, params);
    }
    function date$1(params) {
        return _isoDate(ZodISODate, params);
    }
    function time(params) {
        return _isoTime(ZodISOTime, params);
    }
    function duration(params) {
        return _isoDuration(ZodISODuration, params);
    }

    var _iso = /*#__PURE__*/Object.freeze({
        __proto__: null,
        ZodISODate: ZodISODate,
        ZodISODateTime: ZodISODateTime,
        ZodISODuration: ZodISODuration,
        ZodISOTime: ZodISOTime,
        date: date$1,
        datetime: datetime,
        duration: duration,
        time: time
    });

    // Local z object to avoid circular dependency with ../index.js
    const z = {
        ..._schemas,
        ..._checks,
        iso: _iso,
    };
    // Keys that are recognized and handled by the conversion logic
    const RECOGNIZED_KEYS = /*@__PURE__*/ new Set([
        // Schema identification
        "$schema",
        "$ref",
        "$defs",
        "definitions",
        // Core schema keywords
        "$id",
        "id",
        "$comment",
        "$anchor",
        "$vocabulary",
        "$dynamicRef",
        "$dynamicAnchor",
        // Type
        "type",
        "enum",
        "const",
        // Composition
        "anyOf",
        "oneOf",
        "allOf",
        "not",
        // Object
        "properties",
        "required",
        "additionalProperties",
        "patternProperties",
        "propertyNames",
        "minProperties",
        "maxProperties",
        // Array
        "items",
        "prefixItems",
        "additionalItems",
        "minItems",
        "maxItems",
        "uniqueItems",
        "contains",
        "minContains",
        "maxContains",
        // String
        "minLength",
        "maxLength",
        "pattern",
        "format",
        // Number
        "minimum",
        "maximum",
        "exclusiveMinimum",
        "exclusiveMaximum",
        "multipleOf",
        // Already handled metadata
        "description",
        "default",
        // Content
        "contentEncoding",
        "contentMediaType",
        "contentSchema",
        // Unsupported (error-throwing)
        "unevaluatedItems",
        "unevaluatedProperties",
        "if",
        "then",
        "else",
        "dependentSchemas",
        "dependentRequired",
        // OpenAPI
        "nullable",
        "readOnly",
    ]);
    function detectVersion(schema, defaultTarget) {
        const $schema = schema.$schema;
        if ($schema === "https://json-schema.org/draft/2020-12/schema") {
            return "draft-2020-12";
        }
        if ($schema === "http://json-schema.org/draft-07/schema#") {
            return "draft-7";
        }
        if ($schema === "http://json-schema.org/draft-04/schema#") {
            return "draft-4";
        }
        // Use defaultTarget if provided, otherwise default to draft-2020-12
        return defaultTarget ?? "draft-2020-12";
    }
    // Positional schemas constrain the elements that are present; only minItems makes them required.
    function applyMinItems(items, minItems) {
        return items.map((item, index) => (index < minItems ? item : item.optional()));
    }
    // Inverse of the encoding applied to $ref pointer segments in to-json-schema.ts. Per RFC 6901 the `~1` replacement must run before `~0`.
    function decodeJSONPointerSegment(segment) {
        return segment.replace(/~1/g, "/").replace(/~0/g, "~");
    }
    function resolveRef(ref, ctx) {
        if (!ref.startsWith("#")) {
            throw new Error("External $ref is not supported, only local refs (#/...) are allowed");
        }
        const path = ref.slice(1).split("/").filter(Boolean);
        // Handle root reference "#"
        if (path.length === 0) {
            return ctx.rootSchema;
        }
        const defsKey = ctx.version === "draft-2020-12" ? "$defs" : "definitions";
        if (path[0] === defsKey) {
            const key = path[1] === undefined ? undefined : decodeJSONPointerSegment(path[1]);
            if (!key || !ctx.defs[key]) {
                throw new Error(`Reference not found: ${ref}`);
            }
            return ctx.defs[key];
        }
        throw new Error(`Reference not found: ${ref}`);
    }
    /**
     * Enforces the keywords that constrain an object's own keys — `propertyNames`,
     * `minProperties`, `maxProperties` — before `objectSchema` runs. The guard has
     * to see the raw input: an object parse drops `__proto__` and can add keys from
     * a property `default`, so its output is not the set of names the instance
     * actually carried.
     */
    function checkObjectGuards(objectSchema, guards) {
        // An identity transform, not z.any(), so `toJSONSchema` reports the object on both the input and the output side of the pipe.
        const guard = z
            .transform((value) => value)
            .check((payload) => {
            const value = payload.value;
            if (typeof value !== "object" || value === null || Array.isArray(value))
                return;
            const keys = Object.getOwnPropertyNames(value);
            if (guards.minProperties !== undefined && keys.length < guards.minProperties) {
                payload.issues.push({
                    origin: "object",
                    code: "too_small",
                    minimum: guards.minProperties,
                    inclusive: true,
                    message: `Too small: expected object to have >=${guards.minProperties} properties`,
                    input: value,
                    inst: objectSchema,
                    continue: true,
                });
            }
            if (guards.maxProperties !== undefined && keys.length > guards.maxProperties) {
                payload.issues.push({
                    origin: "object",
                    code: "too_big",
                    maximum: guards.maxProperties,
                    inclusive: true,
                    message: `Too big: expected object to have <=${guards.maxProperties} properties`,
                    input: value,
                    inst: objectSchema,
                    continue: true,
                });
            }
            if (guards.keySchema) {
                for (const key of keys) {
                    const result = guards.keySchema.safeParse(key);
                    if (result.success)
                        continue;
                    payload.issues.push({
                        code: "invalid_key",
                        origin: "record",
                        issues: result.error.issues,
                        input: key,
                        path: [key],
                        continue: true,
                    });
                }
            }
        });
        return guard.pipe(objectSchema);
    }
    /**
     * An injective string for JSON data: two values share a key exactly when `uniqueItems` calls them
     * equal, so duplicate detection is a Map lookup rather than a pairwise walk. Strings and keys are
     * length-prefixed so no value can spell another one. `null` means "never equal to anything" — a
     * cycle or a NaN, neither of which JSON can express.
     */
    function canonicalKey(value, seen) {
        if (value === null)
            return "z";
        const type = typeof value;
        if (type !== "object") {
            if (type === "number" && Number.isNaN(value))
                return null;
            const raw = String(value);
            return `${type[0]}${raw.length}:${raw}`;
        }
        if (seen.has(value))
            return null;
        seen.add(value);
        try {
            if (Array.isArray(value)) {
                const parts = [];
                for (const item of value) {
                    const key = canonicalKey(item, seen);
                    if (key === null)
                        return null;
                    parts.push(key);
                }
                return `a${parts.length}:[${parts.join(",")}]`;
            }
            const keys = Object.keys(value).sort();
            const parts = [];
            for (const k of keys) {
                const key = canonicalKey(value[k], seen);
                if (key === null)
                    return null;
                parts.push(`${k.length}:${k}=${key}`);
            }
            return `o${parts.length}:{${parts.join(",")}}`;
        }
        finally {
            seen.delete(value);
        }
    }
    // keywords whose value is a schema or an array of them
    const SCHEMA_KEYWORDS = /*@__PURE__*/ new Set([
        "items",
        "prefixItems",
        "additionalItems",
        "additionalProperties",
        "contains",
        "propertyNames",
        "not",
        "if",
        "then",
        "else",
        "allOf",
        "anyOf",
        "oneOf",
        "unevaluatedItems",
        "unevaluatedProperties",
        "contentSchema",
    ]);
    // keywords whose value maps names to schemas. draft-7 `dependencies` also allows an array of property names, which holds no schema to walk
    const SCHEMA_MAP_KEYWORDS = /*@__PURE__*/ new Set([
        "properties",
        "patternProperties",
        "dependentSchemas",
        "dependencies",
        "$defs",
        "definitions",
    ]);
    /**
     * True when a subschema holds a `$ref` anywhere a schema can appear. Only those positions are
     * walked: `$ref` under `default` or an `x-` annotation is instance data with an ordinary key, and
     * reading it as a reference would drop a constraint that resolves perfectly well.
     */
    function containsRef(value) {
        if (typeof value !== "object" || value === null)
            return false;
        if (Array.isArray(value))
            return value.some(containsRef);
        if (typeof value.$ref === "string")
            return true;
        return Object.entries(value).some(([key, sub]) => {
            if (SCHEMA_KEYWORDS.has(key))
                return containsRef(sub);
            if (!SCHEMA_MAP_KEYWORDS.has(key) || typeof sub !== "object" || sub === null)
                return false;
            return Object.values(sub).some(containsRef);
        });
    }
    function plural(n) {
        return n === 1 ? "element" : "elements";
    }
    /**
     * Enforces `uniqueItems` and the `contains` family before `arraySchema` runs, for the same reason
     * `checkObjectGuards` runs pre-pipe: an item parse can apply a nested `default`, so the parsed
     * array is not the instance the keywords are defined over. A guard issue aborts the pipe, so
     * `minItems`/`maxItems` are not also reported on the same parse — instance correctness is worth
     * more than co-reporting two issues.
     */
    function checkArrayGuards(arraySchema, guards) {
        // An identity transform, not z.any(), so `toJSONSchema` reports the array on both the input and the output side of the pipe.
        const guard = z
            .transform((value) => value)
            .check((payload) => {
            const items = payload.value;
            if (!Array.isArray(items))
                return;
            if (guards.uniqueItems === true) {
                const firstSeen = new Map();
                for (let i = 0; i < items.length; i++) {
                    const key = canonicalKey(items[i], new Set());
                    if (key === null)
                        continue;
                    const first = firstSeen.get(key);
                    if (first === undefined) {
                        firstSeen.set(key, i);
                        continue;
                    }
                    payload.issues.push({
                        code: "custom",
                        message: `Array items must be unique: element at index ${i} duplicates the one at index ${first}`,
                        input: items,
                        path: [i],
                        continue: true,
                    });
                }
            }
            if (guards.containsSchema) {
                const minContains = guards.minContains ?? 1;
                // one past the ceiling already proves the failure, and nothing above it changes the verdict
                const ceiling = guards.maxContains !== undefined ? guards.maxContains + 1 : Number.POSITIVE_INFINITY;
                let matches = 0;
                for (const item of items) {
                    if (guards.containsSchema.safeParse(item).success && ++matches >= ceiling)
                        break;
                }
                if (matches < minContains) {
                    // the scan ran to the end, so this count is exact
                    payload.issues.push({
                        code: "custom",
                        message: `Array must contain at least ${minContains} matching ${plural(minContains)}; found ${matches}`,
                        input: items,
                        continue: true,
                    });
                }
                if (guards.maxContains !== undefined && matches > guards.maxContains) {
                    payload.issues.push({
                        code: "custom",
                        message: `Array must contain at most ${guards.maxContains} matching ${plural(guards.maxContains)}`,
                        input: items,
                        continue: true,
                    });
                }
            }
        });
        return guard.pipe(arraySchema);
    }
    function getTupleRest(restSchema, ctx) {
        if (restSchema === false) {
            return undefined;
        }
        if (restSchema === undefined || restSchema === true) {
            return z.any();
        }
        return convertSchema(restSchema, ctx);
    }
    // the RFC 3339 full-time keyword, narrower than `z.iso.time()`; local because sharing it via `timeSource` pins that builder into every bundle (+139 B gzipped on a mini `z.boolean()`)
    const fullTime = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;
    function convertBaseSchema(schema, ctx) {
        // Handle unsupported features
        if (schema.not !== undefined) {
            // Special case: { not: {} } represents never
            if (typeof schema.not === "object" && Object.keys(schema.not).length === 0) {
                return z.never();
            }
            throw new Error("not is not supported in Zod (except { not: {} } for never)");
        }
        if (schema.unevaluatedItems !== undefined) {
            throw new Error("unevaluatedItems is not supported");
        }
        if (schema.unevaluatedProperties !== undefined) {
            throw new Error("unevaluatedProperties is not supported");
        }
        if (schema.if !== undefined || schema.then !== undefined || schema.else !== undefined) {
            throw new Error("Conditional schemas (if/then/else) are not supported");
        }
        if (schema.dependentSchemas !== undefined || schema.dependentRequired !== undefined) {
            throw new Error("dependentSchemas and dependentRequired are not supported");
        }
        // Handle $ref
        if (schema.$ref) {
            const refPath = schema.$ref;
            if (ctx.refs.has(refPath)) {
                return ctx.refs.get(refPath);
            }
            if (ctx.processing.has(refPath)) {
                // Circular reference - use lazy
                return z.lazy(() => {
                    if (!ctx.refs.has(refPath)) {
                        throw new Error(`Circular reference not resolved: ${refPath}`);
                    }
                    return ctx.refs.get(refPath);
                });
            }
            ctx.processing.add(refPath);
            const resolved = resolveRef(refPath, ctx);
            const zodSchema = convertSchema(resolved, ctx);
            ctx.refs.set(refPath, zodSchema);
            ctx.processing.delete(refPath);
            return zodSchema;
        }
        // Handle enum
        if (schema.enum !== undefined) {
            const enumValues = schema.enum;
            // Special case: OpenAPI 3.0 null representation { type: "string", nullable: true, enum: [null] }
            if (ctx.version === "openapi-3.0" &&
                schema.nullable === true &&
                enumValues.length === 1 &&
                enumValues[0] === null) {
                return z.null();
            }
            if (enumValues.length === 0) {
                return z.never();
            }
            if (enumValues.length === 1) {
                return z.literal(enumValues[0]);
            }
            // Check if all values are strings
            if (enumValues.every((v) => typeof v === "string")) {
                return z.enum(enumValues);
            }
            // Mixed types - use union of literals
            const literalSchemas = enumValues.map((v) => z.literal(v));
            if (literalSchemas.length < 2) {
                return literalSchemas[0];
            }
            return z.union([literalSchemas[0], literalSchemas[1], ...literalSchemas.slice(2)]);
        }
        // Handle const
        if (schema.const !== undefined) {
            return z.literal(schema.const);
        }
        // Handle type
        const type = schema.type;
        if (Array.isArray(type)) {
            // Expand type array into anyOf union
            const typeSchemas = type.map((t) => {
                const typeSchema = { ...schema, type: t };
                return convertBaseSchema(typeSchema, ctx);
            });
            if (typeSchemas.length === 0) {
                return z.never();
            }
            if (typeSchemas.length === 1) {
                return typeSchemas[0];
            }
            return z.union(typeSchemas);
        }
        if (!type) {
            // No type specified - empty schema (any)
            return z.any();
        }
        let zodSchema;
        switch (type) {
            case "string": {
                let stringSchema = z.string();
                // Apply format using .check() with Zod format functions
                if (schema.format) {
                    const format = schema.format;
                    // Map common formats to Zod check functions
                    if (format === "email") {
                        stringSchema = stringSchema.check(z.email());
                    }
                    else if (format === "uri" || format === "uri-reference") {
                        stringSchema = stringSchema.check(z.url());
                    }
                    else if (format === "uuid" || format === "guid") {
                        stringSchema = stringSchema.check(z.uuid());
                    }
                    else if (format === "date-time") {
                        stringSchema = stringSchema.check(z.iso.datetime({ offset: true }));
                    }
                    else if (format === "date") {
                        stringSchema = stringSchema.check(z.iso.date());
                    }
                    else if (format === "time") {
                        stringSchema = stringSchema.check(z.regex(fullTime));
                    }
                    else if (format === "duration") {
                        stringSchema = stringSchema.check(z.iso.duration());
                    }
                    else if (format === "hostname") {
                        stringSchema = stringSchema.check(z.hostname());
                    }
                    else if (format === "ipv4") {
                        stringSchema = stringSchema.check(z.ipv4());
                    }
                    else if (format === "ipv6") {
                        stringSchema = stringSchema.check(z.ipv6());
                    }
                    else if (format === "mac") {
                        stringSchema = stringSchema.check(z.mac());
                    }
                    else if (format === "cidr") {
                        stringSchema = stringSchema.check(z.cidrv4());
                    }
                    else if (format === "cidr-v6") {
                        stringSchema = stringSchema.check(z.cidrv6());
                    }
                    else if (format === "base64") {
                        stringSchema = stringSchema.check(z.base64());
                    }
                    else if (format === "base64url") {
                        stringSchema = stringSchema.check(z.base64url());
                    }
                    else if (format === "e164") {
                        stringSchema = stringSchema.check(z.e164());
                    }
                    else if (format === "credit_card") {
                        stringSchema = stringSchema.check(z.creditCard());
                    }
                    else if (format === "iban") {
                        stringSchema = stringSchema.check(z.iban());
                    }
                    else if (format === "jwt") {
                        stringSchema = stringSchema.check(z.jwt());
                    }
                    else if (format === "emoji") {
                        stringSchema = stringSchema.check(z.emoji());
                    }
                    else if (format === "nanoid") {
                        stringSchema = stringSchema.check(z.nanoid());
                    }
                    else if (format === "cuid") {
                        stringSchema = stringSchema.check(z.cuid());
                    }
                    else if (format === "cuid2") {
                        stringSchema = stringSchema.check(z.cuid2());
                    }
                    else if (format === "ulid") {
                        stringSchema = stringSchema.check(z.ulid());
                    }
                    else if (format === "xid") {
                        stringSchema = stringSchema.check(z.xid());
                    }
                    else if (format === "ksuid") {
                        stringSchema = stringSchema.check(z.ksuid());
                    }
                    // Note: json-string format is not currently supported by Zod
                    // Custom formats are ignored - keep as plain string
                }
                // Apply constraints
                if (typeof schema.minLength === "number") {
                    stringSchema = stringSchema.min(schema.minLength);
                }
                if (typeof schema.maxLength === "number") {
                    stringSchema = stringSchema.max(schema.maxLength);
                }
                if (schema.pattern) {
                    // JSON Schema patterns are not implicitly anchored (match anywhere in string)
                    stringSchema = stringSchema.regex(new RegExp(schema.pattern));
                }
                zodSchema = stringSchema;
                break;
            }
            case "number":
            case "integer": {
                let numberSchema = type === "integer" ? z.number().int() : z.number();
                // Apply constraints
                // In draft-04, `exclusiveMinimum: true` makes the sibling `minimum` exclusive rather than an independent bound, so the inclusive `.min()` is skipped; emitting it too would be dominated by the exclusive check and report a second, weaker issue.
                if (typeof schema.minimum === "number" && schema.exclusiveMinimum !== true) {
                    numberSchema = numberSchema.min(schema.minimum);
                }
                if (typeof schema.maximum === "number" && schema.exclusiveMaximum !== true) {
                    numberSchema = numberSchema.max(schema.maximum);
                }
                if (typeof schema.exclusiveMinimum === "number") {
                    numberSchema = numberSchema.gt(schema.exclusiveMinimum);
                }
                else if (schema.exclusiveMinimum === true && typeof schema.minimum === "number") {
                    numberSchema = numberSchema.gt(schema.minimum);
                }
                if (typeof schema.exclusiveMaximum === "number") {
                    numberSchema = numberSchema.lt(schema.exclusiveMaximum);
                }
                else if (schema.exclusiveMaximum === true && typeof schema.maximum === "number") {
                    numberSchema = numberSchema.lt(schema.maximum);
                }
                if (typeof schema.multipleOf === "number") {
                    numberSchema = numberSchema.multipleOf(schema.multipleOf);
                }
                zodSchema = numberSchema;
                break;
            }
            case "boolean": {
                zodSchema = z.boolean();
                break;
            }
            case "null": {
                zodSchema = z.null();
                break;
            }
            case "object": {
                const shape = {};
                const properties = schema.properties || {};
                const requiredSet = new Set(schema.required || []);
                const additionalSchema = typeof schema.additionalProperties === "object"
                    ? convertSchema(schema.additionalProperties, ctx)
                    : undefined;
                // Convert properties - mark optional ones
                for (const [key, propSchema] of Object.entries(properties)) {
                    const propZodSchema = convertSchema(propSchema, ctx);
                    // If not in required array, make it optional. assignProp so a __proto__ key becomes an own property instead of hitting the inherited setter
                    assignProp(shape, key, requiredSet.has(key) ? propZodSchema : propZodSchema.optional());
                }
                // Handle patternProperties
                if (schema.patternProperties) {
                    // patternProperties: keys matching pattern must satisfy corresponding schema. Use loose records so non-matching keys pass through
                    const patternProps = schema.patternProperties;
                    const patternKeys = Object.keys(patternProps);
                    const looseRecords = [];
                    for (const pattern of patternKeys) {
                        const patternValue = convertSchema(patternProps[pattern], ctx);
                        const keySchema = z.string().regex(new RegExp(pattern));
                        looseRecords.push(z.looseRecord(keySchema, patternValue));
                    }
                    // Build intersection: object schema + all pattern property records
                    const schemasToIntersect = [];
                    if (Object.keys(shape).length > 0) {
                        // Use passthrough so patternProperties can validate additional keys
                        schemasToIntersect.push(z.object(shape).passthrough());
                    }
                    schemasToIntersect.push(...looseRecords);
                    if (schemasToIntersect.length === 0) {
                        zodSchema = z.object({}).passthrough();
                    }
                    else if (schemasToIntersect.length === 1) {
                        zodSchema = schemasToIntersect[0];
                    }
                    else {
                        // Chain intersections: (A & B) & C & D ...
                        let result = z.intersection(schemasToIntersect[0], schemasToIntersect[1]);
                        for (let i = 2; i < schemasToIntersect.length; i++) {
                            result = z.intersection(result, schemasToIntersect[i]);
                        }
                        zodSchema = result;
                    }
                    // When additionalProperties is false, reject keys that are neither defined in properties nor matched by any patternProperty.
                    if (schema.additionalProperties === false) {
                        const propertyKeys = Object.keys(shape);
                        const patterns = patternKeys.map((p) => new RegExp(p));
                        const basePatternSchema = zodSchema;
                        zodSchema = zodSchema.check((payload) => {
                            if (!isPlainObject(payload.value))
                                return;
                            const unrecognized = [];
                            for (const key of Object.keys(payload.value)) {
                                if (propertyKeys.includes(key))
                                    continue;
                                if (patterns.some((regex) => regex.test(key)))
                                    continue;
                                unrecognized.push(key);
                            }
                            if (unrecognized.length) {
                                payload.issues.push({
                                    code: "unrecognized_keys",
                                    keys: unrecognized,
                                    input: payload.value,
                                    inst: basePatternSchema,
                                });
                            }
                        });
                    }
                }
                else {
                    // Handle additionalProperties. In JSON Schema, additionalProperties defaults to true (allow any extra properties). In Zod, objects strip unknown keys by default, so we need to handle this explicitly
                    const objectSchema = z.object(shape);
                    if (schema.additionalProperties === false) {
                        // Strict mode - no extra properties allowed
                        zodSchema = objectSchema.strict();
                    }
                    else if (additionalSchema) {
                        // Extra properties must match the specified schema
                        zodSchema = objectSchema.catchall(additionalSchema);
                    }
                    else {
                        // additionalProperties is true or undefined - allow any extra properties (passthrough)
                        zodSchema = objectSchema.passthrough();
                    }
                }
                // propertyNames constrains key *names* only, and says nothing about which keys are required or how their values validate. Layering it on top of the result keeps properties/patternProperties/additionalProperties composing underneath. `true` allows every name, so it needs no guard.
                const hasKeyGuard = schema.propertyNames !== undefined && schema.propertyNames !== true;
                const minProperties = typeof schema.minProperties === "number" ? schema.minProperties : undefined;
                const maxProperties = typeof schema.maxProperties === "number" ? schema.maxProperties : undefined;
                if (hasKeyGuard || minProperties !== undefined || maxProperties !== undefined) {
                    let keySchema;
                    if (hasKeyGuard) {
                        // Keys are always strings, so a propertyNames subschema that omits `type` still constrains them — without this it would convert to z.any().
                        const keyJSONSchema = typeof schema.propertyNames === "object" && schema.propertyNames.type === undefined
                            ? { type: "string", ...schema.propertyNames }
                            : schema.propertyNames;
                        keySchema = convertSchema(keyJSONSchema, ctx);
                    }
                    zodSchema = checkObjectGuards(zodSchema, { keySchema, minProperties, maxProperties });
                }
                break;
            }
            case "array": {
                // Check if this is a tuple (prefixItems or items as array)
                const prefixItems = schema.prefixItems;
                const items = schema.items;
                if (prefixItems && Array.isArray(prefixItems)) {
                    // Tuple with prefixItems (draft-2020-12)
                    const minItems = typeof schema.minItems === "number" ? schema.minItems : 0;
                    const tupleItems = prefixItems.map((item) => convertSchema(item, ctx));
                    const positionalItems = applyMinItems(tupleItems, minItems);
                    const rest = !Array.isArray(items) ? getTupleRest(items, ctx) : undefined;
                    const tupleSchema = z.tuple(positionalItems);
                    zodSchema = rest ? tupleSchema.rest(rest) : tupleSchema;
                    // Apply minItems/maxItems constraints to tuples
                    if (typeof schema.minItems === "number") {
                        zodSchema = zodSchema.check(z.minLength(schema.minItems));
                    }
                    if (typeof schema.maxItems === "number") {
                        zodSchema = zodSchema.check(z.maxLength(schema.maxItems));
                    }
                }
                else if (Array.isArray(items)) {
                    // Tuple with items array (draft-7)
                    const minItems = typeof schema.minItems === "number" ? schema.minItems : 0;
                    const tupleItems = items.map((item) => convertSchema(item, ctx));
                    const positionalItems = applyMinItems(tupleItems, minItems);
                    const rest = getTupleRest(schema.additionalItems, ctx);
                    const tupleSchema = z.tuple(positionalItems);
                    zodSchema = rest ? tupleSchema.rest(rest) : tupleSchema;
                    // Apply minItems/maxItems constraints to tuples
                    if (typeof schema.minItems === "number") {
                        zodSchema = zodSchema.check(z.minLength(schema.minItems));
                    }
                    if (typeof schema.maxItems === "number") {
                        zodSchema = zodSchema.check(z.maxLength(schema.maxItems));
                    }
                }
                else if (items !== undefined) {
                    // Regular array
                    const element = convertSchema(items, ctx);
                    let arraySchema = z.array(element);
                    // Apply constraints
                    if (typeof schema.minItems === "number") {
                        arraySchema = arraySchema.min(schema.minItems);
                    }
                    if (typeof schema.maxItems === "number") {
                        arraySchema = arraySchema.max(schema.maxItems);
                    }
                    zodSchema = arraySchema;
                }
                else {
                    // No items specified - array of any
                    zodSchema = z.array(z.any());
                }
                // minContains/maxContains only constrain anything when `contains` itself is present
                if (schema.uniqueItems === true || schema.contains !== undefined) {
                    zodSchema = checkArrayGuards(zodSchema, {
                        uniqueItems: schema.uniqueItems === true,
                        containsSchema: schema.contains !== undefined ? convertSchema(schema.contains, ctx) : undefined,
                        minContains: typeof schema.minContains === "number" ? schema.minContains : undefined,
                        maxContains: typeof schema.maxContains === "number" ? schema.maxContains : undefined,
                    });
                }
                break;
            }
            default:
                throw new Error(`Unsupported type: ${type}`);
        }
        return zodSchema;
    }
    function convertSchema(schema, ctx) {
        if (typeof schema === "boolean") {
            return schema ? z.any() : z.never();
        }
        // Convert base schema first (ignoring composition keywords)
        let baseSchema = convertBaseSchema(schema, ctx);
        const hasExplicitType = schema.type || schema.enum !== undefined || schema.const !== undefined;
        // Process composition keywords LAST (they can appear together)
        // Handle anyOf - wrap base schema with union
        if (schema.anyOf && Array.isArray(schema.anyOf)) {
            const options = schema.anyOf.map((s) => convertSchema(s, ctx));
            const anyOfUnion = z.union(options);
            baseSchema = hasExplicitType ? z.intersection(baseSchema, anyOfUnion) : anyOfUnion;
        }
        // Handle oneOf - exclusive union (exactly one must match)
        if (schema.oneOf && Array.isArray(schema.oneOf)) {
            const options = schema.oneOf.map((s) => convertSchema(s, ctx));
            const oneOfUnion = z.xor(options);
            baseSchema = hasExplicitType ? z.intersection(baseSchema, oneOfUnion) : oneOfUnion;
        }
        // Handle allOf - wrap base schema with intersection
        if (schema.allOf && Array.isArray(schema.allOf)) {
            if (schema.allOf.length === 0) {
                baseSchema = hasExplicitType ? baseSchema : z.any();
            }
            else {
                let result = hasExplicitType ? baseSchema : convertSchema(schema.allOf[0], ctx);
                const startIdx = hasExplicitType ? 0 : 1;
                for (let i = startIdx; i < schema.allOf.length; i++) {
                    result = z.intersection(result, convertSchema(schema.allOf[i], ctx));
                }
                baseSchema = result;
            }
        }
        // Handle nullable (OpenAPI 3.0)
        if (schema.nullable === true && ctx.version === "openapi-3.0") {
            baseSchema = z.nullable(baseSchema);
        }
        // Handle readOnly
        if (schema.readOnly === true) {
            baseSchema = z.readonly(baseSchema);
        }
        // Apply `default` so it wraps the fully-composed schema. This ensures `parse(undefined) -> default` works regardless of which branch of `convertBaseSchema` produced the inner schema (enum/const/not/typed/etc.).
        if (schema.default !== undefined) {
            baseSchema = baseSchema.default(schema.default);
        }
        // Collect non-description annotation metadata into the user-supplied registry. Description is handled separately below via `.describe()` to preserve the contract that `schema.description` reads from globalRegistry.
        const extraMeta = {};
        const coreMetadataKeys = ["$id", "id", "$comment", "$anchor", "$vocabulary", "$dynamicRef", "$dynamicAnchor"];
        for (const key of coreMetadataKeys) {
            if (key in schema) {
                extraMeta[key] = schema[key];
            }
        }
        const contentMetadataKeys = ["contentEncoding", "contentMediaType", "contentSchema"];
        for (const key of contentMetadataKeys) {
            if (key in schema) {
                extraMeta[key] = schema[key];
            }
        }
        // `propertyNames` and `contains` are enforced by a guard, which `toJSONSchema` cannot infer, so the original keyword is carried as metadata to keep the round-trip lossless. Only where it was actually applied: on any other type it is inert, and on a `$ref` the metadata would land on the target every reference shares. A carried subschema is copied verbatim while the root `$defs` stay behind, so one holding a `$ref` is dropped rather than emitted as a dangling reference.
        if (schema.type === "object" && schema.$ref === undefined) {
            if (schema.propertyNames !== undefined && !containsRef(schema.propertyNames)) {
                extraMeta.propertyNames = schema.propertyNames;
            }
            for (const key of ["minProperties", "maxProperties"]) {
                if (schema[key] !== undefined)
                    extraMeta[key] = schema[key];
            }
        }
        if (schema.type === "array" && schema.$ref === undefined) {
            if (schema.contains !== undefined && !containsRef(schema.contains)) {
                extraMeta.contains = schema.contains;
            }
            for (const key of ["uniqueItems", "minContains", "maxContains"]) {
                if (schema[key] !== undefined)
                    extraMeta[key] = schema[key];
            }
        }
        for (const key of Object.keys(schema)) {
            if (!RECOGNIZED_KEYS.has(key)) {
                assignProp(extraMeta, key, schema[key]);
            }
        }
        if (Object.keys(extraMeta).length > 0) {
            ctx.registry.add(baseSchema, extraMeta);
        }
        // Apply description last. `.describe()` clones the schema and sets `_zod.parent` on the clone, so registry lookups on the returned reference still resolve `extraMeta` via parent inheritance.
        if (schema.description) {
            baseSchema = baseSchema.describe(schema.description);
        }
        return baseSchema;
    }
    /**
     * Converts a JSON Schema to a Zod schema. This function should be considered semi-experimental. It's behavior is liable to change. */
    function fromJSONSchema(schema, params) {
        // Handle boolean schemas
        if (typeof schema === "boolean") {
            return schema ? z.any() : z.never();
        }
        // Normalize input via a JSON round-trip. This guarantees the converter walks a plain, finite, JSON-valid object graph: cyclic inputs fail here, getter/Proxy-based properties are materialized into static values, and class instances collapse to plain objects.
        let normalized;
        try {
            normalized = JSON.parse(JSON.stringify(schema));
        }
        catch {
            throw new Error("fromJSONSchema input is not valid JSON (possibly cyclic); use $defs/$ref for recursive schemas");
        }
        const version = detectVersion(normalized, params?.defaultTarget);
        const defs = (normalized.$defs || normalized.definitions || {});
        const ctx = {
            version,
            defs,
            refs: new Map(),
            processing: new Set(),
            rootSchema: normalized,
            registry: params?.registry ?? globalRegistry,
        };
        return convertSchema(normalized, ctx);
    }

    // Traversal pattern adapted from Jaen's v3 `mapOnSchema` (Apache-2.0): https://gist.github.com/jaens/7e15ae1984bb338c86eb5e452dee3010
    const RESOLVING = Symbol("z.visit/resolving");
    function visit(schema, fnOrHandlers) {
        const fn = typeof fnOrHandlers === "function"
            ? fnOrHandlers
            : (node, rewritten) => {
                // A union of handlers isn't callable with one argument; handler `K` only ever sees kind `K`.
                const h = fnOrHandlers[node._zod.def.type];
                return h ? h(node, rewritten) : node;
            };
        const cache = new Map();
        function run(s) {
            const cached = cache.get(s);
            if (cached === RESOLVING) {
                // Non-lazy cycle. Defer to parse time, when the cache holds the finished node.
                return new $ZodLazy({
                    type: "lazy",
                    getter: () => cache.get(s),
                });
            }
            if (cached !== undefined)
                return cached;
            cache.set(s, RESOLVING);
            const inner = mapInner(s);
            const mapped = fn(inner, inner !== s);
            cache.set(s, mapped);
            return mapped;
        }
        function mapInner(s) {
            const def = s._zod.def;
            const kind = def.type;
            switch (kind) {
                case "object": {
                    const oldShape = def.shape;
                    const keys = Object.keys(oldShape);
                    let changed = false;
                    const newShape = {};
                    for (const k of keys) {
                        const mapped = run(oldShape[k]);
                        if (mapped !== oldShape[k])
                            changed = true;
                        newShape[k] = mapped;
                    }
                    let newCatchall = def.catchall;
                    if (def.catchall) {
                        newCatchall = run(def.catchall);
                        if (newCatchall !== def.catchall)
                            changed = true;
                    }
                    return changed ? clone(s, { ...def, shape: newShape, catchall: newCatchall }) : s;
                }
                case "array": {
                    const mapped = run(def.element);
                    return mapped === def.element ? s : clone(s, { ...def, element: mapped });
                }
                case "tuple": {
                    const oldItems = def.items;
                    let changed = false;
                    const newItems = [];
                    for (const item of oldItems) {
                        const mapped = run(item);
                        if (mapped !== item)
                            changed = true;
                        newItems.push(mapped);
                    }
                    let newRest = def.rest;
                    if (def.rest) {
                        newRest = run(def.rest);
                        if (newRest !== def.rest)
                            changed = true;
                    }
                    return changed ? clone(s, { ...def, items: newItems, rest: newRest }) : s;
                }
                case "record":
                case "map": {
                    const newKey = run(def.keyType);
                    const newVal = run(def.valueType);
                    return newKey === def.keyType && newVal === def.valueType
                        ? s
                        : clone(s, { ...def, keyType: newKey, valueType: newVal });
                }
                case "set": {
                    const newVal = run(def.valueType);
                    return newVal === def.valueType ? s : clone(s, { ...def, valueType: newVal });
                }
                case "union": {
                    const oldOptions = def.options;
                    let changed = false;
                    const newOptions = [];
                    for (const opt of oldOptions) {
                        const mapped = run(opt);
                        if (mapped !== opt)
                            changed = true;
                        newOptions.push(mapped);
                    }
                    return changed ? clone(s, { ...def, options: newOptions }) : s;
                }
                case "intersection": {
                    const newLeft = run(def.left);
                    const newRight = run(def.right);
                    return newLeft === def.left && newRight === def.right
                        ? s
                        : clone(s, { ...def, left: newLeft, right: newRight });
                }
                case "optional":
                case "nullable":
                case "default":
                case "prefault":
                case "catch":
                case "readonly":
                case "nonoptional":
                case "promise":
                case "success": {
                    const newInner = run(def.innerType);
                    return newInner === def.innerType ? s : clone(s, { ...def, innerType: newInner });
                }
                case "pipe": {
                    const newIn = run(def.in);
                    const newOut = run(def.out);
                    return newIn === def.in && newOut === def.out ? s : clone(s, { ...def, in: newIn, out: newOut });
                }
                case "function": {
                    const newInput = run(def.input);
                    const newOutput = run(def.output);
                    return newInput === def.input && newOutput === def.output
                        ? s
                        : clone(s, { ...def, input: newInput, output: newOutput });
                }
                case "lazy": {
                    // Invoking the getter here would trip the cycle check, so lazy nodes always re-clone.
                    const original = def.getter;
                    // Drop the memo, or it shadows the new getter forever.
                    const { _cachedInner, ...rest } = def;
                    return clone(s, { ...rest, getter: () => run(original()) });
                }
                // A leaf by choice: `parts` are regex fragments, not data positions.
                case "template_literal":
                // Leaves.
                case "string":
                case "number":
                case "int":
                case "boolean":
                case "bigint":
                case "symbol":
                case "undefined":
                case "null":
                case "void":
                case "never":
                case "any":
                case "unknown":
                case "date":
                case "nan":
                case "enum":
                case "literal":
                case "file":
                case "transform":
                case "custom":
                    return s;
                default: {
                    return s;
                }
            }
        }
        return run(schema);
    }

    /** Returns a copy of the schema with every nested object's properties made optional. */
    function deepPartial(schema) {
        return visit(schema, {
            object: (s) => s.partial(),
            // Every partialed option now admits `undefined`, which the constructor rejects as a duplicate.
            union: (s) => {
                const def = s._zod.def;
                return def.discriminator === undefined ? s : union(def.options);
            },
        });
    }

    /** Appends a pipe's own checks to the side that replaces it, mirroring how `.check()` clones. */
    function withChecks(side, checks) {
        if (!checks?.length)
            return side;
        const def = side._zod.def;
        return clone(side, mergeDefs(def, { checks: [...(def.checks ?? []), ...checks] }), { parent: true });
    }
    /** The out side, carrying the pipe's own checks: those run against the decoded value, which is what `out` produces. */
    function outSide(def) {
        return withChecks(def.out, def.checks);
    }
    /** The in side. `z.preprocess` pipes a transform into a schema, and a bare transform validates nothing, so the schema it feeds is the real input side — the resolution `toJSONSchema` already makes for this case. */
    function inSide(def) {
        return def.in._zod.traits.has("$ZodTransform") ? outSide(def) : def.in;
    }
    /** Returns a copy of the schema with every pipe replaced by its input side. A codec's checks are dropped: they constrain the decoded value the input side never produces. */
    function input(schema) {
        return visit(schema, {
            pipe: (s) => inSide(s._zod.def),
            // A default value belongs to the output side, so a rewritten inner type leaves it stranded. `.default()` widens the declared input type with `undefined`, and `optional` is what carries that across.
            default: (s, rewritten) => (rewritten ? optional(s._zod.def.innerType) : s),
            // A catch value is output-side too, but `.catch()` leaves the declared input type alone, so the inner schema stands on its own.
            catch: (s, rewritten) => (rewritten ? s._zod.def.innerType : s),
        });
    }
    /** Returns a copy of the schema with every pipe replaced by its output side, carrying over the pipe's own checks. */
    function output(schema) {
        return visit(schema, {
            pipe: (s) => outSide(s._zod.def),
            // A prefault value is fed through the schema, which makes it input-side, so a rewritten inner type leaves it stranded.
            prefault: (s, rewritten) => (rewritten ? s._zod.def.innerType : s),
        });
    }

    function string(params) {
        return _coercedString(ZodString, params);
    }
    function number(params) {
        return _coercedNumber(ZodNumber, params);
    }
    function boolean(params) {
        return _coercedBoolean(ZodBoolean, params);
    }
    function bigint(params) {
        return _coercedBigint(ZodBigInt, params);
    }
    function date(params) {
        return _coercedDate(ZodDate, params);
    }

    var coerce = /*#__PURE__*/Object.freeze({
        __proto__: null,
        bigint: bigint,
        boolean: boolean,
        date: date,
        number: number,
        string: string
    });

    var defExp = /*#__PURE__*/Object.freeze({
        __proto__: null,
        $brand: $brand,
        $input: $input,
        $output: $output,
        INVALID: INVALID,
        NEVER: NEVER,
        TimePrecision: TimePrecision,
        ZodAny: ZodAny,
        ZodArray: ZodArray,
        ZodBase64: ZodBase64,
        ZodBase64URL: ZodBase64URL,
        ZodBigInt: ZodBigInt,
        ZodBigIntFormat: ZodBigIntFormat,
        ZodBoolean: ZodBoolean,
        ZodCIDRv4: ZodCIDRv4,
        ZodCIDRv6: ZodCIDRv6,
        ZodCUID: ZodCUID,
        ZodCUID2: ZodCUID2,
        ZodCatch: ZodCatch,
        ZodCodec: ZodCodec,
        ZodCompileAsyncError: ZodCompileAsyncError,
        ZodCompileUnsupportedError: ZodCompileUnsupportedError,
        ZodCreditCard: ZodCreditCard,
        ZodCustom: ZodCustom,
        ZodCustomStringFormat: ZodCustomStringFormat,
        ZodDate: ZodDate,
        ZodDefault: ZodDefault,
        ZodDiscriminatedUnion: ZodDiscriminatedUnion,
        ZodE164: ZodE164,
        ZodEmail: ZodEmail,
        ZodEmoji: ZodEmoji,
        ZodEnum: ZodEnum,
        ZodError: ZodError,
        ZodExactOptional: ZodExactOptional,
        ZodFile: ZodFile,
        get ZodFirstPartyTypeKind () { return ZodFirstPartyTypeKind; },
        ZodFunction: ZodFunction,
        ZodGUID: ZodGUID,
        ZodIBAN: ZodIBAN,
        ZodIPv4: ZodIPv4,
        ZodIPv6: ZodIPv6,
        ZodISODate: ZodISODate,
        ZodISODateTime: ZodISODateTime,
        ZodISODuration: ZodISODuration,
        ZodISOTime: ZodISOTime,
        ZodInstanceOf: ZodInstanceOf,
        ZodIntersection: ZodIntersection,
        ZodIssueCode: ZodIssueCode,
        ZodJWT: ZodJWT,
        ZodKSUID: ZodKSUID,
        ZodLazy: ZodLazy,
        ZodLiteral: ZodLiteral,
        ZodMAC: ZodMAC,
        ZodMap: ZodMap,
        ZodNaN: ZodNaN,
        ZodNanoID: ZodNanoID,
        ZodNever: ZodNever,
        ZodNonOptional: ZodNonOptional,
        ZodNull: ZodNull,
        ZodNullable: ZodNullable,
        ZodNumber: ZodNumber,
        ZodNumberFormat: ZodNumberFormat,
        ZodObject: ZodObject,
        ZodOptional: ZodOptional,
        ZodPipe: ZodPipe,
        ZodPrefault: ZodPrefault,
        ZodPreprocess: ZodPreprocess,
        ZodPromise: ZodPromise,
        ZodReadonly: ZodReadonly,
        ZodRealError: ZodRealError,
        ZodRecord: ZodRecord,
        ZodSet: ZodSet,
        ZodString: ZodString,
        ZodStringFormat: ZodStringFormat,
        ZodSuccess: ZodSuccess,
        ZodSymbol: ZodSymbol,
        ZodTemplateLiteral: ZodTemplateLiteral,
        ZodTransform: ZodTransform,
        ZodTuple: ZodTuple,
        ZodType: ZodType,
        ZodULID: ZodULID,
        ZodURL: ZodURL,
        ZodUUID: ZodUUID,
        ZodUndefined: ZodUndefined,
        ZodUnion: ZodUnion,
        ZodUnknown: ZodUnknown,
        ZodVoid: ZodVoid,
        ZodXID: ZodXID,
        ZodXor: ZodXor,
        _ZodString: _ZodString,
        _default: _default,
        _function: _function,
        any: any,
        array: array,
        base64: base64,
        base64url: base64url,
        bigint: bigint$1,
        boolean: boolean$1,
        catch: _catch,
        check: check,
        cidrv4: cidrv4,
        cidrv6: cidrv6,
        clone: clone,
        codec: codec,
        coerce: coerce,
        compile: compile,
        config: config,
        core: index$1,
        creditCard: creditCard,
        cuid: cuid,
        cuid2: cuid2,
        currencyCode: currencyCode,
        custom: custom,
        date: date$2,
        decode: decode,
        decodeAsync: decodeAsync,
        deepPartial: deepPartial,
        describe: describe,
        discriminatedUnion: discriminatedUnion,
        e164: e164,
        email: email,
        emoji: emoji,
        encode: encode,
        encodeAsync: encodeAsync,
        endsWith: _endsWith,
        enum: _enum,
        exactOptional: exactOptional,
        file: file,
        flattenError: flattenError,
        float32: float32,
        float64: float64,
        formatError: formatError,
        fromJSONSchema: fromJSONSchema,
        function: _function,
        getDiscriminatedOption: getDiscriminatedOption,
        getErrorMap: getErrorMap,
        globalRegistry: globalRegistry,
        gt: _gt,
        gte: _gte,
        guid: guid,
        hash: hash,
        hex: hex,
        hostname: hostname,
        httpUrl: httpUrl,
        iban: iban,
        includes: _includes,
        input: input,
        instanceof: _instanceof,
        int: int,
        int32: int32,
        int64: int64,
        intersection: intersection,
        invertCodec: invertCodec,
        ipv4: ipv4,
        ipv6: ipv6,
        iso: _iso,
        json: json,
        jwt: jwt,
        keyof: keyof,
        ksuid: ksuid,
        lazy: lazy,
        length: _length,
        literal: literal,
        locales: index$2,
        looseObject: looseObject,
        looseRecord: looseRecord,
        lowercase: _lowercase,
        lt: _lt,
        lte: _lte,
        mac: mac,
        map: map,
        maxLength: _maxLength,
        maxSize: _maxSize,
        memoizer: memoizer,
        meta: meta,
        mime: _mime,
        minLength: _minLength,
        minSize: _minSize,
        multipleOf: _multipleOf,
        nan: nan,
        nanoid: nanoid,
        nativeEnum: nativeEnum,
        negative: _negative,
        never: never,
        nonnegative: _nonnegative,
        nonoptional: nonoptional,
        nonpositive: _nonpositive,
        normalize: _normalize,
        null: _null,
        nullable: nullable,
        nullish: nullish,
        number: number$1,
        object: object,
        optional: optional,
        output: output,
        overwrite: _overwrite,
        parse: parse,
        parseAsync: parseAsync,
        partialRecord: partialRecord,
        pipe: pipe,
        positive: _positive,
        prefault: prefault,
        preprocess: preprocess,
        prettifyError: prettifyError,
        promise: promise,
        properties: _properties,
        property: _property,
        readonly: readonly,
        record: record,
        refine: refine,
        regex: _regex,
        regexes: regexes,
        registry: registry,
        safeDecode: safeDecode,
        safeDecodeAsync: safeDecodeAsync,
        safeEncode: safeEncode,
        safeEncodeAsync: safeEncodeAsync,
        safeParse: safeParse,
        safeParseAsync: safeParseAsync,
        set: set,
        setErrorMap: setErrorMap,
        size: _size,
        slugify: _slugify,
        startsWith: _startsWith,
        strictObject: strictObject,
        string: string$1,
        stringFormat: stringFormat,
        stringbool: stringbool,
        success: success,
        superRefine: superRefine,
        symbol: symbol,
        templateLiteral: templateLiteral,
        toJSONSchema: toJSONSchema,
        toLowerCase: _toLowerCase,
        toUpperCase: _toUpperCase,
        toZod: toZod,
        transform: transform,
        treeifyError: treeifyError,
        trim: _trim,
        tuple: tuple,
        uint32: uint32,
        uint64: uint64,
        ulid: ulid,
        undefined: _undefined,
        union: union,
        unknown: unknown,
        uppercase: _uppercase,
        url: url,
        util: util,
        uuid: uuid,
        uuidv4: uuidv4,
        uuidv6: uuidv6,
        uuidv7: uuidv7,
        validate: validate,
        validateAsync: validateAsync$1,
        void: _void,
        withParser: withParser,
        xid: xid,
        xor: xor
    });

    var namedExports = /*#__PURE__*/Object.freeze({
        __proto__: null,
        $brand: $brand,
        $input: $input,
        $output: $output,
        INVALID: INVALID,
        NEVER: NEVER,
        TimePrecision: TimePrecision,
        ZodAny: ZodAny,
        ZodArray: ZodArray,
        ZodBase64: ZodBase64,
        ZodBase64URL: ZodBase64URL,
        ZodBigInt: ZodBigInt,
        ZodBigIntFormat: ZodBigIntFormat,
        ZodBoolean: ZodBoolean,
        ZodCIDRv4: ZodCIDRv4,
        ZodCIDRv6: ZodCIDRv6,
        ZodCUID: ZodCUID,
        ZodCUID2: ZodCUID2,
        ZodCatch: ZodCatch,
        ZodCodec: ZodCodec,
        ZodCompileAsyncError: ZodCompileAsyncError,
        ZodCompileUnsupportedError: ZodCompileUnsupportedError,
        ZodCreditCard: ZodCreditCard,
        ZodCustom: ZodCustom,
        ZodCustomStringFormat: ZodCustomStringFormat,
        ZodDate: ZodDate,
        ZodDefault: ZodDefault,
        ZodDiscriminatedUnion: ZodDiscriminatedUnion,
        ZodE164: ZodE164,
        ZodEmail: ZodEmail,
        ZodEmoji: ZodEmoji,
        ZodEnum: ZodEnum,
        ZodError: ZodError,
        ZodExactOptional: ZodExactOptional,
        ZodFile: ZodFile,
        get ZodFirstPartyTypeKind () { return ZodFirstPartyTypeKind; },
        ZodFunction: ZodFunction,
        ZodGUID: ZodGUID,
        ZodIBAN: ZodIBAN,
        ZodIPv4: ZodIPv4,
        ZodIPv6: ZodIPv6,
        ZodISODate: ZodISODate,
        ZodISODateTime: ZodISODateTime,
        ZodISODuration: ZodISODuration,
        ZodISOTime: ZodISOTime,
        ZodInstanceOf: ZodInstanceOf,
        ZodIntersection: ZodIntersection,
        ZodIssueCode: ZodIssueCode,
        ZodJWT: ZodJWT,
        ZodKSUID: ZodKSUID,
        ZodLazy: ZodLazy,
        ZodLiteral: ZodLiteral,
        ZodMAC: ZodMAC,
        ZodMap: ZodMap,
        ZodNaN: ZodNaN,
        ZodNanoID: ZodNanoID,
        ZodNever: ZodNever,
        ZodNonOptional: ZodNonOptional,
        ZodNull: ZodNull,
        ZodNullable: ZodNullable,
        ZodNumber: ZodNumber,
        ZodNumberFormat: ZodNumberFormat,
        ZodObject: ZodObject,
        ZodOptional: ZodOptional,
        ZodPipe: ZodPipe,
        ZodPrefault: ZodPrefault,
        ZodPreprocess: ZodPreprocess,
        ZodPromise: ZodPromise,
        ZodReadonly: ZodReadonly,
        ZodRealError: ZodRealError,
        ZodRecord: ZodRecord,
        ZodSet: ZodSet,
        ZodString: ZodString,
        ZodStringFormat: ZodStringFormat,
        ZodSuccess: ZodSuccess,
        ZodSymbol: ZodSymbol,
        ZodTemplateLiteral: ZodTemplateLiteral,
        ZodTransform: ZodTransform,
        ZodTuple: ZodTuple,
        ZodType: ZodType,
        ZodULID: ZodULID,
        ZodURL: ZodURL,
        ZodUUID: ZodUUID,
        ZodUndefined: ZodUndefined,
        ZodUnion: ZodUnion,
        ZodUnknown: ZodUnknown,
        ZodVoid: ZodVoid,
        ZodXID: ZodXID,
        ZodXor: ZodXor,
        _ZodString: _ZodString,
        _default: _default,
        _function: _function,
        any: any,
        array: array,
        base64: base64,
        base64url: base64url,
        bigint: bigint$1,
        boolean: boolean$1,
        catch: _catch,
        check: check,
        cidrv4: cidrv4,
        cidrv6: cidrv6,
        clone: clone,
        codec: codec,
        coerce: coerce,
        compile: compile,
        config: config,
        core: index$1,
        creditCard: creditCard,
        cuid: cuid,
        cuid2: cuid2,
        currencyCode: currencyCode,
        custom: custom,
        date: date$2,
        decode: decode,
        decodeAsync: decodeAsync,
        deepPartial: deepPartial,
        default: defExp,
        describe: describe,
        discriminatedUnion: discriminatedUnion,
        e164: e164,
        email: email,
        emoji: emoji,
        encode: encode,
        encodeAsync: encodeAsync,
        endsWith: _endsWith,
        enum: _enum,
        exactOptional: exactOptional,
        file: file,
        flattenError: flattenError,
        float32: float32,
        float64: float64,
        formatError: formatError,
        fromJSONSchema: fromJSONSchema,
        function: _function,
        getDiscriminatedOption: getDiscriminatedOption,
        getErrorMap: getErrorMap,
        globalRegistry: globalRegistry,
        gt: _gt,
        gte: _gte,
        guid: guid,
        hash: hash,
        hex: hex,
        hostname: hostname,
        httpUrl: httpUrl,
        iban: iban,
        includes: _includes,
        input: input,
        instanceof: _instanceof,
        int: int,
        int32: int32,
        int64: int64,
        intersection: intersection,
        invertCodec: invertCodec,
        ipv4: ipv4,
        ipv6: ipv6,
        iso: _iso,
        json: json,
        jwt: jwt,
        keyof: keyof,
        ksuid: ksuid,
        lazy: lazy,
        length: _length,
        literal: literal,
        locales: index$2,
        looseObject: looseObject,
        looseRecord: looseRecord,
        lowercase: _lowercase,
        lt: _lt,
        lte: _lte,
        mac: mac,
        map: map,
        maxLength: _maxLength,
        maxSize: _maxSize,
        memoizer: memoizer,
        meta: meta,
        mime: _mime,
        minLength: _minLength,
        minSize: _minSize,
        multipleOf: _multipleOf,
        nan: nan,
        nanoid: nanoid,
        nativeEnum: nativeEnum,
        negative: _negative,
        never: never,
        nonnegative: _nonnegative,
        nonoptional: nonoptional,
        nonpositive: _nonpositive,
        normalize: _normalize,
        null: _null,
        nullable: nullable,
        nullish: nullish,
        number: number$1,
        object: object,
        optional: optional,
        output: output,
        overwrite: _overwrite,
        parse: parse,
        parseAsync: parseAsync,
        partialRecord: partialRecord,
        pipe: pipe,
        positive: _positive,
        prefault: prefault,
        preprocess: preprocess,
        prettifyError: prettifyError,
        promise: promise,
        properties: _properties,
        property: _property,
        readonly: readonly,
        record: record,
        refine: refine,
        regex: _regex,
        regexes: regexes,
        registry: registry,
        safeDecode: safeDecode,
        safeDecodeAsync: safeDecodeAsync,
        safeEncode: safeEncode,
        safeEncodeAsync: safeEncodeAsync,
        safeParse: safeParse,
        safeParseAsync: safeParseAsync,
        set: set,
        setErrorMap: setErrorMap,
        size: _size,
        slugify: _slugify,
        startsWith: _startsWith,
        strictObject: strictObject,
        string: string$1,
        stringFormat: stringFormat,
        stringbool: stringbool,
        success: success,
        superRefine: superRefine,
        symbol: symbol,
        templateLiteral: templateLiteral,
        toJSONSchema: toJSONSchema,
        toLowerCase: _toLowerCase,
        toUpperCase: _toUpperCase,
        toZod: toZod,
        transform: transform,
        treeifyError: treeifyError,
        trim: _trim,
        tuple: tuple,
        uint32: uint32,
        uint64: uint64,
        ulid: ulid,
        undefined: _undefined,
        union: union,
        unknown: unknown,
        uppercase: _uppercase,
        url: url,
        util: util,
        uuid: uuid,
        uuidv4: uuidv4,
        uuidv6: uuidv6,
        uuidv7: uuidv7,
        validate: validate,
        validateAsync: validateAsync$1,
        void: _void,
        withParser: withParser,
        xid: xid,
        xor: xor,
        z: defExp
    });

    const defaultExports = Object.isFrozen(defExp) ? Object.assign({}, defExp || { __emptyModule: true }) : defExp;
    Object.keys(namedExports || {}).filter((key) => !defaultExports[key]).forEach((key) => defaultExports[key] = namedExports[key]);
    Object.defineProperty(defaultExports, "__" + "esModule", { value: true });
    var index = Object.isFrozen(defExp) ? Object.freeze(defaultExports) : defaultExports;

    return index;

}));
