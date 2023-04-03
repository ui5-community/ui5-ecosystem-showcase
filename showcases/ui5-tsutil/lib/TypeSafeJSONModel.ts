// eslint-disable-file

/**
 * This file contains the type safe facade "TypeSafeJSONModel" for "JSONModel".
 *
 * Since TypeSafeJSONModel is only a type it has no runtime differences or overhead compared to the JSONModel.
 *
 * The JSONModel class is used to store data which has to be synchronized with the view. JSONModel mainly uses the
 * getProperty() and setProperty() methods to access the stored values. To specify which property should be
 * returned the JSONModel uses the names of the object keys and '/' as a separator to access nested properties.
 * E.g. if we have the object <code>{ foo: 'FOO', bar: { baz: 'BAZ' }}</code> we could use '/foo' to access
 * the string "FOO", '/bar' to access the object <code>{ baz: 1 }</code> or '/bar/baz' to access the string
 * "BAZ".
 *
 * The purpose of TypeSafeJSONModel is to add typechecking at compile time. This means that the returned
 * properties have the correct type, instead of the <code>any</code> type that the JSONModel returns by
 * default. Additionally, accessing non-existent properties will cause type errors at compile time.
 */

import JSONModel from "sap/ui/model/json/JSONModel";

import type Context from "sap/ui/model/Context";

//#region Configuration
/**
 * You can safely overwrite this value to configure the TypeSafeJSONModel
 */
interface TypeSafeJSONModelConfig {
	/**
	 * The maximum recursion depth used during path discovery.
	 *
	 * Only values between 0 and 20 are allowed. You can safely overwrite this value.
	 */
	maxDepth: 10;
}
//#endregion

//#region Helper types
/**
 * Alias for ease of use
 */
type RecursionMaxDepth = TypeSafeJSONModelConfig["maxDepth"];

/**
 * Array used to limit recursive calls
 *
 * This array works as a counter since for e.g. depth = 5 the value of RecursionLimiterValues[5] is 4
 */
type RecursionLimiterValues = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

/**
 * Exclude the symbol type from a given type union
 */
type NoSymbols<T> = T extends symbol ? never : T;

//#endregion

//#region JSON Types

/**
 * JSON safe value
 */
type JSONScalar = string | boolean | number | null;

/**
 * JSON safe array
 */
type JSONArray = (JSONScalar | JSONObject)[];

/**
 * JSON safe object
 */
type JSONObject = {
	[x: string]: JSONScalar | JSONObject | JSONArray;
};

/**
 * Type to represent JSONModels content
 *
 * We disallow scalar values as roots since UI5 doesn't allow it
 */
type JSON = JSONArray | JSONObject;

//#endregion

//#region Generate string literal union of all valid paths for a given object

type PathType<D extends JSON> =
	// We use this intermediary helper for convenience
	PathTypeHelper<D, NoSymbols<keyof D>, RecursionMaxDepth>;

type PathTypeHelper<D, K extends NoSymbols<keyof D>, DEPTH extends RecursionLimiterValues[number]> = {
	done: never;
	recur: D extends JSONObject // Objects
		? K extends string | number
			? `/${K}${"" | PathTypeHelper<D[K], NoSymbols<keyof D[K]>, RecursionLimiterValues[DEPTH]>}` // Recursive call
			: never // shouldn't happen
		: D extends JSONArray // Arrays
		? K extends number
			? `/${K}${"" | PathTypeHelper<D[K], NoSymbols<keyof D[K]>, RecursionLimiterValues[DEPTH]>}` // Recursive call
			: never // shouldn't happen
		: never; // JSON Scalar
}[DEPTH extends -1 ? "done" : "recur"];

//#endregion

//#region Lookup property type of given object for a given string literal

// Value Type - lookup type of data specified by the path
type ValueType<D extends JSON, P extends PathType<D>> =
	// We use this intermediary helper for convenience
	ValueTypeHelper<D, P>;

type ValueTypeHelper<D, P extends string> = D extends JSONObject | JSONArray
	? P extends `/${infer KP extends NoSymbols<keyof D>}` // Extract string
		? D[KP] // Return type if we have reached a property
		: P extends `/${infer KN extends NoSymbols<keyof D>}/${infer REST extends string}` // Nested object
		? ValueTypeHelper<D[KN], `/${REST}`> // Recursive call (we need to add a / since the template "REST" doesn't include it above)
		: never
	: never;
//#endregion

//#region Typesafe JSON Model

/**
 * Type safe facade over UI5's JSONModel
 *
 * @see JSONModel
 */
export interface TypeSafeJsonModel<D extends JSON> extends JSONModel {
	constructor: (oData: D, bObserve?: boolean | undefined) => this;
	getProperty: <P extends PathType<D>>(sPath: P, oContext?: Context | undefined) => ValueType<D, P>;
	setProperty: <P extends PathType<D>, V extends ValueType<D, P>>(sPath: P, oValue: V, oContext?: Context | undefined, bAsyncUpdate?: boolean | undefined) => boolean;
	setData: (oData: D, bMerge?: boolean | undefined) => void;
}
//#endregion
