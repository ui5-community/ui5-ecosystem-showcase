/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "../../@luigi-project/container",
    "../../LuigiContainer",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "@luigi-project.container.LuigiContainer",
      {
        metadata: {
          namespace: "@luigi-project/container",
          qualifiedNamespace: "@luigi-project.container",
          tag: "luigi-container",
          interfaces: [],
          properties: {},
          aggregations: {},
          associations: {},
          events: {},
          getters: [],
          methods: [],
          designtime:
            "@luigi-project/container/designtime/LuigiContainer.designtime",
        },
      },
    )

    return WrapperClass
  },
)
