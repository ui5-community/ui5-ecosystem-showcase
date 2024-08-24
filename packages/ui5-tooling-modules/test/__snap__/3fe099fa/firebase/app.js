sap.ui.define(['../index.esm2017'], (function (index_esm2017) { 'use strict';

  var index_cjs = {};

  (function (exports) {

  	Object.defineProperty(exports, '__esModule', { value: true });

  	var app = index_esm2017.require$$0;

  	var name = "firebase";
  	var version = "10.13.0";

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
  	app.registerVersion(name, version, 'app');

  	Object.keys(app).forEach(function (k) {
  	  if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
  	    enumerable: true,
  	    get: function () { return app[k]; }
  	  });
  	});
  	
  } (index_cjs));

  try { Object.defineProperty(index_cjs, "__" + "esModule", { value: true }); index_cjs.default = index_cjs; } catch (ex) {}

  return index_cjs;

}));
