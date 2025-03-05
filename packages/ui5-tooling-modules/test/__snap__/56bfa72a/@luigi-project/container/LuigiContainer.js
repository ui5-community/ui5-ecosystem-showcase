/*!
 * ${copyright}
 */
sap.ui.define([
  "sap/ui/core/webc/WebComponent",
  "ui5/ecosystem/demo/tsapp/resources/@luigi-project/container",
  "ui5/ecosystem/demo/tsapp/resources/LuigiContainer",
], function(
  WebComponentBaseClass,
) {
  "use strict";

  const WrapperClass = WebComponentBaseClass.extend("@luigi-project/container.LuigiContainer", {
    metadata:
{
  "namespace": "@luigi-project/container",
  "tag": "luigi-container",
  "interfaces": [],
  "properties": {
    "activeFeatureToggleList": {
      "type": "any[]",
      "mapping": "property"
    },
    "allowRules": {
      "type": "any[]",
      "mapping": "property"
    },
    "anchor": {
      "type": "string",
      "mapping": "property"
    },
    "authData": {
      "type": "object",
      "mapping": "property"
    },
    "clientPermissions": {
      "type": "object",
      "mapping": "property"
    },
    "context": {
      "type": "any",
      "mapping": "property"
    },
    "deferInit": {
      "type": "boolean",
      "mapping": "property"
    },
    "dirtyStatus": {
      "type": "boolean",
      "mapping": "property"
    },
    "documentTitle": {
      "type": "string",
      "mapping": "property"
    },
    "hasBack": {
      "type": "boolean",
      "mapping": "property"
    },
    "label": {
      "type": "string",
      "mapping": "property"
    },
    "locale": {
      "type": "string",
      "mapping": "property"
    },
    "noShadow": {
      "type": "boolean",
      "mapping": "property"
    },
    "nodeParams": {
      "type": "object",
      "mapping": "property"
    },
    "pathParams": {
      "type": "object",
      "mapping": "property"
    },
    "sandboxRules": {
      "type": "any[]",
      "mapping": "property"
    },
    "searchParams": {
      "type": "object",
      "mapping": "property"
    },
    "skipCookieCheck": {
      "type": "string",
      "mapping": "property"
    },
    "skipInitCheck": {
      "type": "boolean",
      "mapping": "property"
    },
    "theme": {
      "type": "string",
      "mapping": "property"
    },
    "userSettings": {
      "type": "object",
      "mapping": "property"
    },
    "viewurl": {
      "type": "string",
      "mapping": "property"
    },
    "webcomponent": {
      "type": "any",
      "mapping": "property"
    },
    "text": {
      "type": "string",
      "mapping": "textContent"
    },
    "width": {
      "type": "sap.ui.core.CSSSize",
      "mapping": "style"
    },
    "height": {
      "type": "sap.ui.core.CSSSize",
      "mapping": "style"
    }
  },
  "aggregations": {},
  "associations": {},
  "events": {
    "customMessage": {},
    "getContextRequest": {},
    "navigationRequest": {},
    "showAlertRequest": {},
    "closeAlertRequest": {},
    "initialized": {},
    "addSearchParamsRequest": {},
    "addNodeParamsRequest": {},
    "showConfirmationModalRequest": {},
    "showLoadingIndicatorRequest": {},
    "hideLoadingIndicatorRequest": {},
    "setCurrentLocaleRequest": {},
    "setStorageRequest": {},
    "runtimeErrorHandlingRequest": {},
    "setAnchorRequest": {},
    "setThirdPartyCookiesRequest": {},
    "navigateBackRequest": {},
    "getCurrentRouteRequest": {},
    "reportNavigationCompletedRequest": {},
    "updateModalPathDataRequest": {},
    "checkPathExistsRequest": {},
    "setDirtyStatusRequest": {},
    "setViewgroupDataRequest": {},
    "setDocumentTitleRequest": {},
    "openUserSettingsRequest": {},
    "closeUserSettingsRequest": {},
    "collapseLeftnavRequest": {},
    "updateTopNavigationRequest": {},
    "pathExistsRequest": {},
    "goBackRequest": {},
    "hasBackRequest": {},
    "removeBackdropRequest": {}
  },
  "getters": [],
  "methods": [
    "updateContext",
    "sendCustomMessage",
    "closeAlert",
    "notifyAlertClosed",
    "init"
  ],
  "library": "@luigi-project/container.library",
  "designtime": "@luigi-project/container/designtime/LuigiContainer.designtime"
}
  });


  return WrapperClass;

});
