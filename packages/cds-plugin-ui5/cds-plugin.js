// @sap/cds/lib/index.js#138: global.cds = cds // REVISIT: using global.cds seems wrong
const cds = global.cds || require("@sap/cds"); // reuse already loaded cds!

const log = require("./lib/log");
const findUI5Modules = require("./lib/findUI5Modules");
const createPatchedRouter = require("./lib/createPatchedRouter");
const applyUI5Middleware = require("./lib/applyUI5Middleware");
const rewriteHTML = require("./lib/rewriteHTML");

// identify whether the execution should be skipped
let skip = false;
if (process.env["ui5-middleware-cap"]) {
	log.info("Skip execution of plugin because is has been started via ui5-middleware-cap!");
	skip = true;
} else if (process.env["dev-approuter"]) {
	log.info("Skip execution of plugin because is has been started via dev-approuter!");
	skip = true;
}

// only hook into lifecycle if the plugin should not be skipped
if (!skip) {
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

			// mounting the Router for the UI5 application to the CDS server
			log.info(`Mounting ${mountPath} to UI5 app ${modulePath} (id=${moduleId})${config[moduleId] ? ` using config=${JSON.stringify(config[moduleId])}` : ""}`);

			// create a patched router
			const router = await createPatchedRouter();

			// apply the UI5 middlewares to the router and
			// retrieve the available HTML pages
			const appInfo = await applyUI5Middleware(router, {
				cwd,
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

		// identify whether the welcome page should be rewritten
		let rewrite = links.length > 0;

		// rewrite the welcome page
		if (rewrite) {
			// register the custom middleware (similar like in @sap/cds/server.js)
			app.get("/", function appendLinksToIndex(req, res, next) {
				req._cds_plugin_ui5 = true; // marker for patched router to ignore
				rewriteHTML(
					req,
					res,
					() => true,
					(doc) => {
						// the first <ul> element contains the links to the
						// application pages which is fully under control of
						// our plugin now and we keep all links to static
						// pages to ensure coop with classic apps
						const head = doc.getElementsByTagName("head")?.[0];
						head?.insertAdjacentHTML(
							"beforeend",
							`<style>
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
						</style>`
						);
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
							newLis.push(
								...links.sort().map((link) => {
									// we remove the query parameters from the link text
									const linkText = link.indexOf("?") === -1 ? link : link.substr(0, link.indexOf("?"));
									// renders a UI5 link ;-)
									return `<li><a class="ui5" href="${link}">${linkText}</a></li>`;
								})
							);
							ul.innerHTML = newLis.join("\n");
						} else {
							log.warn(`Failed to inject application links into CDS index page!`);
						}
					}
				);
				next();
			});

			// move our middleware before the CDS index serve middleware to
			// allow that we can intercept the response and modify it to
			// inject our application pages an remove the exitsing ones
			const middlewareStack = app?._router?.stack;
			if (Array.isArray(middlewareStack)) {
				const cmw = middlewareStack.pop();
				const idxOfServeStatic = middlewareStack.findIndex((layer) => layer.name === "serveStatic");
				if (idxOfServeStatic !== -1) {
					middlewareStack.splice(idxOfServeStatic, 0, cmw);
				} else {
					log.error(`Failed to determine welcome page middleware! The links of the application pages may not work properly!`);
				}
			} else {
				log.error(`Failed to inject application pages to welcome page! The links of the application pages may not work properly!`);
			}
		}
		// bootstrap completed, unlock the "served" event
		bootstrapped();
	});
}
