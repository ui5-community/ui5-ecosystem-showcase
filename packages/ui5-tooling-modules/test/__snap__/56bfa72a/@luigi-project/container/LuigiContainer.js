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
              type: "any",
              mapping: "property"
            },
            allowRules: {
              type: "any",
              mapping: "property"
            },
            anchor: {
              type: "any",
              mapping: "property"
            },
            authData: {
              type: "any",
              mapping: "property"
            },
            clientPermissions: {
              type: "any",
              mapping: "property"
            },
            context: {
              type: "any",
              mapping: "property"
            },
            deferInit: {
              type: "any",
              mapping: "property"
            },
            dirtyStatus: {
              type: "any",
              mapping: "property"
            },
            documentTitle: {
              type: "any",
              mapping: "property"
            },
            hasBack: {
              type: "any",
              mapping: "property"
            },
            label: {
              type: "any",
              mapping: "property"
            },
            locale: {
              type: "any",
              mapping: "property"
            },
            noShadow: {
              type: "any",
              mapping: "property"
            },
            nodeParams: {
              type: "any",
              mapping: "property"
            },
            pathParams: {
              type: "any",
              mapping: "property"
            },
            sandboxRules: {
              type: "any",
              mapping: "property"
            },
            searchParams: {
              type: "any",
              mapping: "property"
            },
            skipCookieCheck: {
              type: "any",
              mapping: "property"
            },
            skipInitCheck: {
              type: "any",
              mapping: "property"
            },
            theme: {
              type: "any",
              mapping: "property"
            },
            userSettings: {
              type: "any",
              mapping: "property"
            },
            viewurl: {
              type: "any",
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
