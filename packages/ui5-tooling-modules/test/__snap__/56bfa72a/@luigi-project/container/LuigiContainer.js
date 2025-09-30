/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "../../@luigi-project/container",
    "../../LuigiContainer"
  ],
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
              mapping: "property"
            },
            allowRules: {
              type: "string[]",
              mapping: "property"
            },
            anchor: {
              type: "string",
              mapping: "property"
            },
            authData: {
              type: "object",
              mapping: "property"
            },
            clientPermissions: {
              type: "object",
              mapping: "property"
            },
            context: {
              type: "any",
              mapping: "property"
            },
            deferInit: {
              type: "boolean",
              mapping: "property"
            },
            dirtyStatus: {
              type: "boolean",
              mapping: "property"
            },
            documentTitle: {
              type: "string",
              mapping: "property"
            },
            hasBack: {
              type: "boolean",
              mapping: "property"
            },
            label: {
              type: "string",
              mapping: "property"
            },
            locale: {
              type: "string",
              mapping: "property"
            },
            noShadow: {
              type: "boolean",
              mapping: "property"
            },
            nodeParams: {
              type: "object",
              mapping: "property"
            },
            pathParams: {
              type: "object",
              mapping: "property"
            },
            sandboxRules: {
              type: "string[]",
              mapping: "property"
            },
            searchParams: {
              type: "object",
              mapping: "property"
            },
            skipCookieCheck: {
              type: "string",
              mapping: "property"
            },
            skipInitCheck: {
              type: "boolean",
              mapping: "property"
            },
            theme: {
              type: "string",
              mapping: "property"
            },
            userSettings: {
              type: "object",
              mapping: "property"
            },
            viewurl: {
              type: "string",
              mapping: "property"
            },
            webcomponent: {
              type: "any",
              mapping: "property"
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
            getContextRequest: {
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
            openUserSettingsRequest: {
              parameters: {}
            },
            closeUserSettingsRequest: {
              parameters: {}
            },
            collapseLeftnavRequest: {
              parameters: {}
            },
            updateTopNavigationRequest: {
              parameters: {}
            },
            goBackRequest: {
              parameters: {}
            },
            hasBackRequest: {
              parameters: {}
            },
            addBackdropRequest: {
              parameters: {}
            },
            removeBackdropRequest: {
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
