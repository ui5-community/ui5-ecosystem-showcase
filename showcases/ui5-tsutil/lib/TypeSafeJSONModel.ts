// eslint-disable-file

/**
 * This file contains a child class of the JSONModel with typechecking called TypeSafeJSONModel.
 * TypeSafeJSONModel has no functional difference to JSONModel at runtime and can be replaced with JSONModel
 * without any issues.
 *
 * The JSONModel class is used to store data which has to be synchronized with the view. JSONModel uses the
 * getProperty() and setProperty() methods to access the stored values. To specify which property should be
 * returned the JSONModel uses the names of the keys and '/' as a separator to access nested properties.
 * E.g. if we have the object <code>{ foo: 'FOO', bar: { baz: 'BAZ' }}</code> we could use '/foo' to access
 * the string "FOO", '/bar' to access the object <code>{ baz: 1 }</code> or '/bar/baz' to access the string
 * "BAZ".
 *
 * The purpose of TypeSafeJSONModel is to add typechecking at compile time. This means that the returned
 * properties have the correct type, instead of the <code>any</code> type that the JSONModel returns by
 * default. Additionally, accessing nonexistent properties will cause type errors at compile time.
 */

import JSONModel from "sap/ui/model/json/JSONModel";

import type Context from "sap/ui/model/Context";

//#region Helper types

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
	PathTypeHelper<D, NoSymbols<keyof D>>;

type PathTypeHelper<D, K extends NoSymbols<keyof D>> =
	//
	D extends JSONObject // Objects
		? K extends string | number
			? `/${K}${"" | PathTypeHelper<D[K], NoSymbols<keyof D[K]>>}` // Recursive call
			: never // shouldn't happen
		: D extends JSONArray // Arrays
		? K extends number
			? `/${K}${"" | PathTypeHelper<D[K], NoSymbols<keyof D[K]>>}` // Recursive call
			: never // shouldn't happen
		: never; // JSON Scalar

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

//#region Typesafe JSON Model implementation

/*
 * UI5's JSONModel's Documentation states, that it's not safe to inherit from the JSONModel class.
 * To resolve this issue we are creating a subclass of JSONModel only at compile time and using the
 * createTypeSafeJsonModel and applyTypeToJsonModel Methods to assign the instance type of
 * TypeSafeJSONModel to a JSONModel.
 */

/**
 * TypeSafe facade over UI5's JSONModel
 *
 * @see JSONModel
 */
class TypeSafeJsonModelClass<D extends JSON> extends JSONModel {
	constructor(oData: D, bObserve?: boolean | undefined) {
		super(oData, bObserve);
	}

	public getProperty<P extends PathType<D>>(sPath: P, oContext?: Context | undefined) {
		return super.getProperty(sPath, oContext) as ValueType<D, P>;
	}

	public setProperty<P extends PathType<D>, V extends ValueType<D, P>>(sPath: P, oValue: V, oContext?: Context | undefined, bAsyncUpdate?: boolean | undefined) {
		return super.setProperty(sPath, oValue, oContext, bAsyncUpdate);
	}

	public setData(oData: D, bMerge?: boolean | undefined) {
		super.setData(oData, bMerge);
	}
}

/**
 * Instance type of member of the TypeSafeJsonModelClass
 */
export type TypeSafeJsonModel<D extends JSON> = InstanceType<typeof TypeSafeJsonModelClass<D>>;
//#endregion
