sap.ui.define(['exports', 'ui5/ecosystem/demo/app/resources/index2'], (function (exports, index) { 'use strict';



	exports.AuthAdminApi = index.AuthAdminApi;
	exports.AuthApiError = index.AuthApiError;
	exports.AuthClient = index.AuthClient;
	exports.AuthError = index.AuthError;
	exports.AuthImplicitGrantRedirectError = index.AuthImplicitGrantRedirectError;
	exports.AuthInvalidCredentialsError = index.AuthInvalidCredentialsError;
	exports.AuthInvalidTokenResponseError = index.AuthInvalidTokenResponseError;
	exports.AuthPKCEGrantCodeExchangeError = index.AuthPKCEGrantCodeExchangeError;
	exports.AuthRetryableFetchError = index.AuthRetryableFetchError;
	exports.AuthSessionMissingError = index.AuthSessionMissingError;
	exports.AuthUnknownError = index.AuthUnknownError;
	exports.AuthWeakPasswordError = index.AuthWeakPasswordError;
	exports.CustomAuthError = index.CustomAuthError;
	Object.defineProperty(exports, "FunctionRegion", {
		enumerable: true,
		get: function () { return index.FunctionRegion; }
	});
	exports.FunctionsError = index.FunctionsError;
	exports.FunctionsFetchError = index.FunctionsFetchError;
	exports.FunctionsHttpError = index.FunctionsHttpError;
	exports.FunctionsRelayError = index.FunctionsRelayError;
	exports.GoTrueAdminApi = index.GoTrueAdminApi;
	exports.GoTrueClient = index.GoTrueClient;
	exports.NavigatorLockAcquireTimeoutError = index.NavigatorLockAcquireTimeoutError;
	exports.REALTIME_CHANNEL_STATES = index.REALTIME_CHANNEL_STATES;
	Object.defineProperty(exports, "REALTIME_LISTEN_TYPES", {
		enumerable: true,
		get: function () { return index.REALTIME_LISTEN_TYPES; }
	});
	Object.defineProperty(exports, "REALTIME_POSTGRES_CHANGES_LISTEN_EVENT", {
		enumerable: true,
		get: function () { return index.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT; }
	});
	Object.defineProperty(exports, "REALTIME_PRESENCE_LISTEN_EVENTS", {
		enumerable: true,
		get: function () { return index.REALTIME_PRESENCE_LISTEN_EVENTS; }
	});
	Object.defineProperty(exports, "REALTIME_SUBSCRIBE_STATES", {
		enumerable: true,
		get: function () { return index.REALTIME_SUBSCRIBE_STATES; }
	});
	exports.RealtimeChannel = index.RealtimeChannel;
	exports.RealtimeClient = index.RealtimeClient;
	exports.RealtimePresence = index.RealtimePresence;
	exports.SupabaseClient = index.SupabaseClient;
	exports.__esModule = index.__esModule;
	exports.createClient = index.createClient;
	exports.isAuthApiError = index.isAuthApiError;
	exports.isAuthError = index.isAuthError;
	exports.isAuthRetryableFetchError = index.isAuthRetryableFetchError;
	exports.isAuthSessionMissingError = index.isAuthSessionMissingError;
	exports.isAuthWeakPasswordError = index.isAuthWeakPasswordError;
	exports.lockInternals = index.internals;
	exports.navigatorLock = index.navigatorLock;

}));
