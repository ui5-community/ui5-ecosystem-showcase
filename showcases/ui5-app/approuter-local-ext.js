/**
 * This file simulates a local @sap/approuter extension which receives arguments as 4th argument.
 * The 4th argument isn't supported for regular @sap/approuter extensions and the handler function
 * will not be called - so, you need to remove the 4th argument if you want to use it regulary.
 */
module.exports = {
	insertMiddleware: {
		beforeRequestHandler: [
			{
				path: "/",
				handler: function forwardUserInfo(req, res, next, params) {
					res.setHeader("x-user-id", process.env._USER_ID || params?.userId || "m.mustermann@ui5.com");
					next();
				},
			},
			{
				path: "/me",
				handler: function getUserInfo(req, res, next, params) {
					const data = {
						loginName: process.env._USER_ID || params?.userId || "m.mustermann@ui5.com",
						firstName: "Michael",
						lastName: "Musterman",
						email: process.env._USER_ID || params?.userId || "m.mustermann@ui5.com",
						sessionID: req.sessionID,
						attributes: [],
						roles: ["Administrator"],
						sessionTimeout: 15,
					};
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify(data));
				},
			},
			{
				path: "/featureFlags/api/v2/evaluate/maintenance-mode",
				handler: function getFeatureFlagMaintenanceMode(req, res /*, next, params*/) {
					const data = {
						httpStatus: 200,
						featureName: "maintenance-mode",
						type: "STRING",
						variation: "false",
						//"variation": "The shop is currently in maintenance mode!"
					};
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify(data));
				},
			},
		],
	},
};
