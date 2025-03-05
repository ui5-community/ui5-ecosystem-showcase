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

/**
 * @class
 * LuigiContainer
 * @extends 
 * @constructor
 * @public
 * @alias @luigi-project.container.LuigiContainer
 */
  const WrapperClass = WebComponentBaseClass.extend("@luigi-project/container.LuigiContainer", {
    metadata:
{
  "tag": "luigi-container",

  "namespace": "@luigi-project/container",

  "designtime": "@luigi-project/container/designtime/LuigiContainer.designtime",

  "interfaces": [],

  "defaultAggregation": "",

  "properties": {
<<<<<<< HEAD
    "activeFeatureToggleList": {
      "type": "string[]",
      "mapping": "property"
    },
    "allowRules": {
      "type": "string[]",
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
      "type": "string[]",
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
=======
/**
 * 
 */
    "activeFeatureToggleList": {"type":"any[]","mapping":"property"},
/**
 * 
 */
    "allowRules": {"type":"any[]","mapping":"property"},
/**
 * 
 */
    "anchor": {"type":"string","mapping":"property"},
/**
 * 
 */
    "authData": {"type":"object","mapping":"property"},
/**
 * 
 */
    "clientPermissions": {"type":"object","mapping":"property"},
/**
 * 
 */
    "context": {"type":"any","mapping":"property"},
/**
 * 
 */
    "deferInit": {"type":"boolean","mapping":"property"},
/**
 * 
 */
    "dirtyStatus": {"type":"boolean","mapping":"property"},
/**
 * 
 */
    "documentTitle": {"type":"string","mapping":"property"},
/**
 * 
 */
    "hasBack": {"type":"boolean","mapping":"property"},
/**
 * 
 */
    "label": {"type":"string","mapping":"property"},
/**
 * 
 */
    "locale": {"type":"string","mapping":"property"},
/**
 * 
 */
    "noShadow": {"type":"boolean","mapping":"property"},
/**
 * 
 */
    "nodeParams": {"type":"object","mapping":"property"},
/**
 * 
 */
    "pathParams": {"type":"object","mapping":"property"},
/**
 * 
 */
    "sandboxRules": {"type":"any[]","mapping":"property"},
/**
 * 
 */
    "searchParams": {"type":"object","mapping":"property"},
/**
 * 
 */
    "skipCookieCheck": {"type":"string","mapping":"property"},
/**
 * 
 */
    "skipInitCheck": {"type":"boolean","mapping":"property"},
/**
 * 
 */
    "theme": {"type":"string","mapping":"property"},
/**
 * 
 */
    "userSettings": {"type":"object","mapping":"property"},
/**
 * 
 */
    "viewurl": {"type":"string","mapping":"property"},
/**
 * 
 */
    "webcomponent": {"type":"any","mapping":"property"},
/**
 * The text-content of the Web Component.
 */
    "text": {"type":"string","mapping":"textContent"},
/**
 * The 'width' of the Web Component in <code>sap.ui.core.CSSSize</code>.
 */
    "width": {"type":"sap.ui.core.CSSSize","mapping":"style"},
/**
 * The 'height' of the Web Component in <code>sap.ui.core.CSSSize</code>.
 */
    "height": {"type":"sap.ui.core.CSSSize","mapping":"style"},
>>>>>>> a6c3721a (chore(ui5-tooling-modules): update test snapshots for new JSDoc content)
  },

  "aggregations": {
  },

  "associations": {
  },

  "events": {
<<<<<<< HEAD
    "customMessage": {},
    "getContextRequest": {},
    "navigationRequest": {},
    "showAlertRequest": {},
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
    "getCurrentRouteRequest": {},
    "reportNavigationCompletedRequest": {},
    "updateModalPathDataRequest": {},
    "updateModalSettingsRequest": {},
    "checkPathExistsRequest": {},
    "setDirtyStatusRequest": {},
    "setViewgroupDataRequest": {},
    "openUserSettingsRequest": {},
    "closeUserSettingsRequest": {},
    "collapseLeftnavRequest": {},
    "updateTopNavigationRequest": {},
    "goBackRequest": {},
    "hasBackRequest": {},
    "addBackdropRequest": {},
    "removeBackdropRequest": {}
=======
/**
 * Event fired when the micro frontend sends a custom message.
 */
"customMessage": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests the context data.
 */
"getContextRequest": {
    "parameters": {
    }
},
/**
 * Event fired when a navigation has been requested by the micro frontend.
 */
"navigationRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to show an alert.
 */
"showAlertRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to close an alert.
 */
"closeAlertRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend has been initialized.
 */
"initialized": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests the addition of search parameters to the URL.
 */
"addSearchParamsRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests the addition of node parameters to the URL.
 */
"addNodeParamsRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to show a confirmation modal.
 */
"showConfirmationModalRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to show a loading indicator.
 */
"showLoadingIndicatorRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to hide the loading indicator.
 */
"hideLoadingIndicatorRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to set the current locale.
 */
"setCurrentLocaleRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to modify the local storage.
 */
"setStorageRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to handle errors that might happen during the runtime of the micro frontend.
 */
"runtimeErrorHandlingRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to set the anchor of the URL.
 */
"setAnchorRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to set third-party cookies.
 */
"setThirdPartyCookiesRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to navigate back.
 */
"navigateBackRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests the current app route.
 */
"getCurrentRouteRequest": {
    "parameters": {
    }
},
/**
 * Event fired to report that the micro frontend's navigation has completed.
 */
"reportNavigationCompletedRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to update the modal path parameters.
 */
"updateModalPathDataRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to check the validity of a path.
 */
"checkPathExistsRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to set the 'dirty status' which, for example, avoids closing when there are any unsaved changes.
 */
"setDirtyStatusRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to set the view group data.
 */
"setViewgroupDataRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to set the document title.
 */
"setDocumentTitleRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to open the user settings.
 */
"openUserSettingsRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to close the user settings.
 */
"closeUserSettingsRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to collapse left side navigation.
 */
"collapseLeftnavRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to update the top navigation.
 */
"updateTopNavigationRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to check if the path exists.
 */
"pathExistsRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to navigate back.
 */
"goBackRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to check if there are any preserved views.
 */
"hasBackRequest": {
    "parameters": {
    }
},
/**
 * Event fired when the micro frontend requests to remove the backdrop.
 */
"removeBackdropRequest": {
    "parameters": {
    }
},
>>>>>>> a6c3721a (chore(ui5-tooling-modules): update test snapshots for new JSDoc content)
  },
<<<<<<< HEAD
  "getters": [],
  "methods": [
    "updateContext",
    "sendCustomMessage",
    "closeAlert",
    "notifyAlertClosed",
    "notifyConfirmationModalClosed",
    "updateViewUrl",
    "init"
=======

  "getters": [
>>>>>>> abaefd90 (chore(ui5-tooling-modules): update test snapshots for new JSDoc content)
  ],

  "methods": [
/**
 * 
 * @public
 * @name @luigi-project.container.LuigiContainer#updateContext
 * @function
 */
      "updateContext",
/**
 * 
 * @public
 * @name @luigi-project.container.LuigiContainer#sendCustomMessage
 * @function
 */
      "sendCustomMessage",
/**
 * 
 * @public
 * @name @luigi-project.container.LuigiContainer#closeAlert
 * @function
 */
      "closeAlert",
/**
 * 
 * @public
 * @name @luigi-project.container.LuigiContainer#init
 * @function
 */
      "init",
  ]
}
  });


  return WrapperClass;

});
