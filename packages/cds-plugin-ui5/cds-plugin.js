// @sap/cds/lib/index.js#138: global.cds = cds // REVISIT: using global.cds seems wrong
const cds = global.cds || require("@sap/cds"); // reuse already loaded cds!

const log = require("./lib/log");
const findUI5Modules = require("./lib/findUI5Modules");
const createPatchedRouter = require("./lib/createPatchedRouter");
const applyUI5Middleware = require("./lib/applyUI5Middleware");

// marker that the cds-plugin-ui5 plugin is running
// to disable the ui5-middleware-cap if used in apps
process.env["cds-plugin-ui5"] = true;

// promise to await the bootstrap and lock the
// served event to delay the startup a bit
let bootstrapped;
const bootstrapCompleted = new Promise((r) => {
	bootstrapped = r;
});

// hook into the "served" event to delay the startup of the
// CDS server until the bootstrap is completed and the UI5
// middlewares for the UI5 applications are properly available
cds.on("served", async function served(/* cdsServices */) {
	log.debug("served");
	await bootstrapCompleted;
});

// hook into the "bootstrap" event to startup the UI5 middlewares
// for the available UI5 applications in the CDS server and its deps
cds.on("bootstrap", async function bootstrap(app) {
	log.debug("bootstrap");

	const cwd = process.cwd();
	const ui5Modules = await findUI5Modules({ cwd });
	const { localApps, config } = ui5Modules;

	const links = [];

	// register the UI5 modules via their own router/middlewares
	for await (const ui5Module of ui5Modules) {
		const { moduleId, mountPath, modulePath } = ui5Module;

		// mounting the Router for the UI5 application to the CAP server
		log.info(`Mounting ${mountPath} to UI5 app ${modulePath} (id=${moduleId})${config[moduleId] ? ` using config=${JSON.stringify(config[moduleId])}` : ""}`);

		// create a patched router
		const router = await createPatchedRouter();

		// apply the UI5 middlewares to the router and
		// retrieve the available HTML pages
		const appInfo = await applyUI5Middleware(router, {
			basePath: modulePath,
			...(config[moduleId] || {}),
		});

		// register the router to the specified mount path
		app.use(mountPath, router);

		// append the HTML pages to the links
		appInfo.pages.forEach((page) => {
			const prefix = mountPath !== "/" ? mountPath : "";
			links.push(`${prefix}${page}`);
		});
	}

	if (links.length > 0) {
		// register the custom middleware (similar like in @sap/cds/server.js)
		app.get("/", function appendLinksToIndex(req, res, next) {
			const send = res.send;
			res.send = function (content) {
				// the first <ul> element contains the links to the
				// application pages which is fully under control of
				// our plugin now and we keep all links to static
				// pages to ensure coop with classic apps
				const HTMLParser = require("node-html-parser");
				const doc = new HTMLParser.parse(content);
				const head = doc.getElementsByTagName("head")?.[0];
				if (head) {
					head.appendChild(
						HTMLParser.parse(`<style>
					a.ui5:after {
						content: "UI5";
						font-weight: bold;
						font-size: 0.5rem;
						vertical-align: super;
						margin: 0.25rem;
						color: #1873B4;
					}
					@media (prefers-color-scheme: dark) {
						a.ui5:after {
							color: #FF5A37;
						}
					}
					</style>`)
					);
				}
				const ul = doc.getElementsByTagName("ul")?.[0];
				if (ul) {
					const newLis = [];
					const lis = ul.getElementsByTagName("li");
					lis?.forEach((li) => {
						const appDir = li.firstChild?.text?.split("/")?.[1];
						if (localApps.has(appDir)) {
							newLis.push(li.toString());
						}
					});
					newLis.push(...links.map((link) => `<li><a class="ui5" href="${link}">${link}</a></li>`));
					ul.innerHTML = newLis.join("\n");
					content = doc.toString();
				} else {
					log.warn(`Failed to inject application links into CAP index page!`);
				}
				send.apply(this, arguments);
			};
			next();
		});

		// move our middleware before the CAP index serve middleware to
		// allow that we can intercept the response and modify it to
		// inject our application pages an remove the exitsing ones
		const middlewareStack = app?._router?.stack;
		if (Array.isArray(middlewareStack)) {
			const cmw = middlewareStack.pop();
			const idxOfServeStatic = middlewareStack.findIndex((layer) => layer.name === "serveStatic");
			if (idxOfServeStatic !== -1) {
				middlewareStack.splice(idxOfServeStatic, 0, cmw);
			} else {
				log.error(`Failed to determine CAP overview page middleware! You need to manually open the application pages!`);
			}
		} else {
			log.error(`Failed to inject application pages to CAP overview page! You need to manually open the application pages!`);
		}
	}
	// bootstrap completed, unlock the "served" event
	bootstrapped();
});

// return callback for plugin activation
module.exports = {
	activate: function activate(conf) {
		log.debug("activate", conf);
	},
};
