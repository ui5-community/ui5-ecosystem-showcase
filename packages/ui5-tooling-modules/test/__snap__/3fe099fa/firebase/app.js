sap.ui.define(['exports', '../index.esm3'], (function (exports, index_esm) { 'use strict';

	var name = "firebase";
	var version = "12.7.0";

	/**
	 * @license
	 * Copyright 2020 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	index_esm.registerVersion(name, version, 'app');

	const __esModule = true ;

	exports.FirebaseError = index_esm.FirebaseError;
	exports.SDK_VERSION = index_esm.SDK_VERSION;
	exports._DEFAULT_ENTRY_NAME = index_esm.DEFAULT_ENTRY_NAME;
	exports._addComponent = index_esm._addComponent;
	exports._addOrOverwriteComponent = index_esm._addOrOverwriteComponent;
	exports._apps = index_esm._apps;
	exports._clearComponents = index_esm._clearComponents;
	exports._components = index_esm._components;
	exports._getProvider = index_esm._getProvider;
	exports._isFirebaseApp = index_esm._isFirebaseApp;
	exports._isFirebaseServerApp = index_esm._isFirebaseServerApp;
	exports._isFirebaseServerAppSettings = index_esm._isFirebaseServerAppSettings;
	exports._registerComponent = index_esm._registerComponent;
	exports._removeServiceInstance = index_esm._removeServiceInstance;
	exports._serverApps = index_esm._serverApps;
	exports.deleteApp = index_esm.deleteApp;
	exports.getApp = index_esm.getApp;
	exports.getApps = index_esm.getApps;
	exports.initializeApp = index_esm.initializeApp;
	exports.initializeServerApp = index_esm.initializeServerApp;
	exports.onLog = index_esm.onLog;
	exports.registerVersion = index_esm.registerVersion;
	exports.setLogLevel = index_esm.setLogLevel;
	exports.__esModule = __esModule;

}));
