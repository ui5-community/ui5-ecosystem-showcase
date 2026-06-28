/*!
 * ${copyright}
 */
sap.ui.define(
  ["sap/ui/core/webc/WebComponent", "../../@luigi-project/container"],
  function (WebComponentBaseClass) {
    "use strict";

    const WrapperClass = WebComponentBaseClass.extend(
      "@luigi-project.container.LuigiContainer",
      {
        metadata: {
          namespace: "@luigi-project/container",
          qualifiedNamespace: "@luigi-project.container",
          tag: "luigi-container",
          interfaces: [],
          properties: {
            activeFeatureToggleList: {
              type: "string[]",
              mapping: "property",
              defaultValue: "undefined"
            },
            allowRules: {
              type: "string[]",
              mapping: "property",
              defaultValue: "undefined"
            },
            anchor: {
              type: "string",
              mapping: "property",
              defaultValue: "undefined"
            },
            authData: {
              type: "object",
              mapping: "property",
              defaultValue: "undefined"
            },
            clientPermissions: {
              type: "object",
              mapping: "property",
              defaultValue: "undefined"
            },
            context: {
              type: "any",
              mapping: "property",
              defaultValue: "undefined"
            },
            deferInit: {
              type: "boolean",
              mapping: "property",
              defaultValue: "undefined"
            },
            dirtyStatus: {
              type: "boolean",
              mapping: "property",
              defaultValue: "undefined"
            },
            documentTitle: {
              type: "string",
              mapping: "property",
              defaultValue: "undefined"
            },
            hasBack: {
              type: "boolean",
              mapping: "property",
              defaultValue: "undefined"
            },
            label: {
              type: "string",
              mapping: "property",
              defaultValue: "undefined"
            },
            locale: {
              type: "string",
              mapping: "property",
              defaultValue: "undefined"
            },
            noShadow: {
              type: "boolean",
              mapping: "property",
              defaultValue: "undefined"
            },
            nodeParams: {
              type: "object",
              mapping: "property",
              defaultValue: "undefined"
            },
            pathParams: {
              type: "object",
              mapping: "property",
              defaultValue: "undefined"
            },
            sandboxRules: {
              type: "string[]",
              mapping: "property",
              defaultValue: "undefined"
            },
            searchParams: {
              type: "object",
              mapping: "property",
              defaultValue: "undefined"
            },
            skipCookieCheck: {
              type: "string",
              mapping: "property",
              defaultValue: "undefined"
            },
            skipInitCheck: {
              type: "boolean",
              mapping: "property",
              defaultValue: "undefined"
            },
            theme: {
              type: "string",
              mapping: "property",
              defaultValue: "undefined"
            },
            userSettings: {
              type: "object",
              mapping: "property",
              defaultValue: "undefined"
            },
            viewurl: {
              type: "string",
              mapping: "property",
              defaultValue: "undefined"
            },
            webcomponent: {
              type: "any",
              mapping: "property",
              defaultValue: "undefined"
            },
            text: {
              type: "string",
              mapping: "textContent"
            },
            width: {
              type: "sap.ui.core.CSSSize",
              mapping: "style"
            },
            height: {
              type: "sap.ui.core.CSSSize",
              mapping: "style"
            }
          },
          aggregations: {},
          associations: {},
          events: {
            customMessage: {
              parameters: {}
            },
            navigationRequest: {
              parameters: {}
            },
            showAlertRequest: {
              parameters: {}
            },
            initialized: {
              parameters: {}
            },
            addSearchParamsRequest: {
              parameters: {}
            },
            addNodeParamsRequest: {
              parameters: {}
            },
            showConfirmationModalRequest: {
              parameters: {}
            },
            showLoadingIndicatorRequest: {
              parameters: {}
            },
            hideLoadingIndicatorRequest: {
              parameters: {}
            },
            setCurrentLocaleRequest: {
              parameters: {}
            },
            setStorageRequest: {
              parameters: {}
            },
            runtimeErrorHandlingRequest: {
              parameters: {}
            },
            setAnchorRequest: {
              parameters: {}
            },
            setThirdPartyCookiesRequest: {
              parameters: {}
            },
            getCurrentRouteRequest: {
              parameters: {}
            },
            reportNavigationCompletedRequest: {
              parameters: {}
            },
            updateModalPathDataRequest: {
              parameters: {}
            },
            updateModalSettingsRequest: {
              parameters: {}
            },
            checkPathExistsRequest: {
              parameters: {}
            },
            setDirtyStatusRequest: {
              parameters: {}
            },
            setViewgroupDataRequest: {
              parameters: {}
            },
            goBackRequest: {
              parameters: {}
            },
            addBackdropRequest: {
              parameters: {}
            },
            removeBackdropRequest: {
              parameters: {}
            },
            closeCurrentModalRequest: {
              parameters: {}
            }
          },
          getters: [],
          methods: [
            "updateContext",
            "sendCustomMessage",
            "closeAlert",
            "notifyAlertClosed",
            "notifyConfirmationModalClosed",
            "updateViewUrl",
            "init"
          ],
          designtime:
            "@luigi-project/container/designtime/LuigiContainer.designtime"
        }
      }
    );

    return WrapperClass;
  }
);
