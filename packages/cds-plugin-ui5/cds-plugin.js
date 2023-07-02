const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

const cds = require("@sap/cds");
const { Router } = require("express");

const applyUI5Middleware = require("./lib/applyUI5Middleware");

// marker that the cds-plugin-ui5 plugin is running
// to disable the ui5-middleware-cap if used in apps
process.env["cds-plugin-ui5"] = true;

/**
 * helper to log colorful messages
 * @param {string} type the type of the message
 * @param {string} message the message text
 */
function log(type, message) {
	const colors = {
		log: "\x1b[0m", // default
		info: "\x1b[32m", // green
		debug: "\x1b[34m", // blue
		warn: "\x1b[33m", // yellow
		error: "\x1b[31m", // red
	};
	if (!console[type]) {
		type = "log";
	}
	console[type](`\x1b[36m[cds-ui5-plugin]\x1b[0m %s[%s]\x1b[0m %s`, colors[type], type, message);
}

cds.on("bootstrap", async function bootstrap(app) {
	log("debug", "bootstrap");

	// lookup the app folder to determine local apps and ui5 app directories
	const localApps = new Set(),
		appDirs = [];
	fs.readdirSync(path.join(process.cwd(), "app"), { withFileTypes: true })
		.filter((f) => f.isDirectory())
		.forEach((d) => localApps.add(d.name));
	localApps.forEach((e) => {
		const d = path.join(process.cwd(), "app", e);
		if (fs.existsSync(path.join(d, "ui5.yaml"))) {
			localApps.delete(e);
			appDirs.push(d);
		}
	});

	// lookup the UI5 dependencies
	const pkgJson = require(path.join(process.cwd(), "package.json"));
	const deps = [];
	deps.push(...Object.keys(pkgJson.dependencies || {}));
	deps.push(...Object.keys(pkgJson.devDependencies || {}));
	//deps.push(...Object.keys(pkgJson.peerDependencies || {}));
	//deps.push(...Object.keys(pkgJson.optionalDependencies || {}));
	appDirs.push(
		...deps.filter((dep) => {
			try {
				require.resolve(`${dep}/ui5.yaml`, {
					paths: [process.cwd()],
				});
				return true;
			} catch (e) {
				return false;
			}
		})
	);

	// if apps are available, attach the middlewares of the UI5 apps
	// to the express of the CAP server via a express router
	if (appDirs) {
		const links = [];
		for await (const appDir of appDirs) {
			// read the ui5.yaml file to extract the configuration
			const ui5YamlPath = require.resolve(path.join(appDir, "ui5.yaml"), {
				paths: [process.cwd()],
			});
			let ui5Configs;
			try {
				const content = fs.readFileSync(ui5YamlPath, "utf-8");
				ui5Configs = yaml.loadAll(content);
			} catch (err) {
				if (err.name === "YAMLException") {
					log("error", `Failed to read ${ui5YamlPath}!`);
				}
				throw err;
			}

			// by default the mount path is derived from the metadata/name
			// and can be overridden by customConfiguration/mountPath
			const ui5Config = ui5Configs?.[0];
			let mountPath = ui5Config?.customConfiguration?.mountPath || ui5Config?.metadata?.name;
			if (!/^\//.test(mountPath)) {
				mountPath = `/${mountPath}`; // always start with /
			}

			// mounting the Router for the application to the CAP server
			log("info", `Mounting ${mountPath} to UI5 app ${appDir}`);
			const modulePath = path.dirname(ui5YamlPath);

			// create the router and get rid of the mount path
			const router = new Router();
			router.use(function (req, res, next) {
				// disable the compression when livereload is used
				// for loading html-related content (via accept header)
				const accept = req.headers["accept"]?.indexOf("html");
				if (accept && res._livereload) {
					req.headers["accept-encoding"] = "identity";
				}
				// remove the mount path from the url
				req.originalUrl = req.url;
				req.baseUrl = "/";
				next();
			});

			// apply the UI5 middlewares to the router and
			// retrieve the available HTML pages
			const pages = await applyUI5Middleware(router, {
				basePath: modulePath,
				configPath: modulePath,
			});

			// append the HTML pages to the links
			pages.forEach((page) => {
				const prefix = mountPath !== "/" ? mountPath : "";
				links.push(`${prefix}${page.getPath()}`);
			});

			// mount the router to the determined mount path
			app.use(`${mountPath}`, router);
		}

		// register the custom middleware (similar like in @sap/cds/server.js)
		app.get("/", function appendLinksToIndex(req, res, next) {
			var send = res.send;
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
					log("warn", `Failed to inject application links into CAP index page!`);
				}
				send.apply(this, arguments);
			};
			//log("debug", req.url);
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
				log("error", `Failed to determine CAP overview page middleware! You need to manually open the application pages!`);
			}
		} else {
			log("error", `Failed to inject application pages to CAP overview page! You need to manually open the application pages!`);
		}
	}
});

// return callback for plugin activation
module.exports = {
	activate: function activate(conf) {
		log("debug", "activate", conf);
	},
};
