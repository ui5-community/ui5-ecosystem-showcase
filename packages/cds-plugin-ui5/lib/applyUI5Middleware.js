const path = require("path");

// inspired by https://github.com/SAP/karma-ui5/blob/main/lib/framework.js#L466-L522
module.exports = async function applyUI5Middleware(router, { basePath, configPath }) {
	const { graphFromPackageDependencies } = await import("@ui5/project/graph");
	const { createReaderCollection } = await import("@ui5/fs/resourceFactory");

	const graph = await graphFromPackageDependencies({
		workspaceName: process.env["ui5-workspace"],
		cwd: basePath,
		rootConfigPath: configPath ? path.resolve(configPath, "ui5.yaml") : undefined,
	});

	const rootProject = graph.getRoot();

	const readers = [];
	await graph.traverseBreadthFirst(async function ({ project: dep }) {
		if (dep.getName() === rootProject.getName()) {
			// Ignore root project
			return;
		}
		readers.push(dep.getReader({ style: "runtime" }));
	});

	const dependencies = createReaderCollection({
		name: `Dependency reader collection for project ${rootProject.getName()}`,
		readers,
	});

	const rootReader = rootProject.getReader({ style: "runtime" });

	// TODO change to ReaderCollection once duplicates are sorted out
	const combo = createReaderCollection({
		name: "server - prioritize workspace over dependencies",
		readers: [rootReader, dependencies],
	});
	const resources = {
		rootProject: rootReader,
		dependencies: dependencies,
		all: combo,
	};

	// TODO: rework ui5-server API and make public
	const MiddlewareManager = (await import("@ui5/server/internal/MiddlewareManager")).default;
	const middlewareManager = new MiddlewareManager({
		graph,
		rootProject,
		resources,
		options: {
			//sendSAPTargetCSP,
			//serveCSPReports,
			//simpleIndex: true
		},
	});
	await middlewareManager.applyMiddleware(router);

	return await rootReader.byGlob("**/*.html");
};
