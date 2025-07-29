const test = require("ava");
const fs = require("fs");
const path = require("path");
const os = require("os");
const yaml = require("js-yaml");

// Helper function to create a temporary directory with test files
function createTempDir() {
	return fs.mkdtempSync(path.join(os.tmpdir(), "ui5-tooling-modules-test-"));
}

// Helper function to clean up temporary directory
function cleanupTempDir(tempDir) {
	if (fs.existsSync(tempDir)) {
		fs.rmSync(tempDir, { recursive: true, force: true });
	}
}

// Helper function to create a basic UI5 YAML structure
function createBasicUI5Yaml() {
	return {
		specVersion: "3.0",
		metadata: {
			name: "test-app",
		},
		type: "application",
	};
}

// Helper function to set environment variables and run postinstall
function runPostinstall(tempDir, rteValue = "true") {
	// Set environment variables
	const originalInitCwd = process.env.INIT_CWD;
	const originalRte = process.env.npm_config_rte;

	process.env.INIT_CWD = tempDir;
	process.env.npm_config_rte = rteValue;

	// Delete the module from require cache to ensure fresh execution
	const postinstallPath = path.resolve(__dirname, "../lib/postinstall.js");
	delete require.cache[postinstallPath];

	try {
		// Run postinstall
		require(postinstallPath);
	} finally {
		// Restore environment variables
		if (originalInitCwd !== undefined) {
			process.env.INIT_CWD = originalInitCwd;
		} else {
			delete process.env.INIT_CWD;
		}

		if (originalRte !== undefined) {
			process.env.npm_config_rte = originalRte;
		} else {
			delete process.env.npm_config_rte;
		}
	}
}

test("postinstall registers in ui5.yaml when it exists", (t) => {
	const tempDir = createTempDir();

	try {
		// Create ui5.yaml
		const ui5YamlPath = path.join(tempDir, "ui5.yaml");
		const ui5Config = createBasicUI5Yaml();
		fs.writeFileSync(ui5YamlPath, yaml.dump(ui5Config));

		// Run postinstall
		runPostinstall(tempDir);

		// Check if ui5.yaml was updated
		const updatedConfig = yaml.load(fs.readFileSync(ui5YamlPath, "utf8"));

		// Verify task was added
		t.truthy(updatedConfig.builder);
		t.truthy(updatedConfig.builder.customTasks);
		t.true(updatedConfig.builder.customTasks.some((task) => task.name === "ui5-tooling-modules-task"));

		// Verify middleware was added
		t.truthy(updatedConfig.server);
		t.truthy(updatedConfig.server.customMiddleware);
		t.true(updatedConfig.server.customMiddleware.some((mw) => mw.name === "ui5-tooling-modules-middleware"));
	} finally {
		cleanupTempDir(tempDir);
	}
});

test("postinstall registers only in ui5.yaml by default, not ui5-workspace.yaml", (t) => {
	const tempDir = createTempDir();

	try {
		// Create both files
		const ui5YamlPath = path.join(tempDir, "ui5.yaml");
		const workspaceYamlPath = path.join(tempDir, "ui5-workspace.yaml");

		const ui5Config = createBasicUI5Yaml();
		const workspaceConfig = { ...createBasicUI5Yaml(), metadata: { name: "test-workspace" } };

		fs.writeFileSync(ui5YamlPath, yaml.dump(ui5Config));
		fs.writeFileSync(workspaceYamlPath, yaml.dump(workspaceConfig));

		// Run postinstall with default behavior (just "true")
		runPostinstall(tempDir);

		// Check that only ui5.yaml was updated, not ui5-workspace.yaml
		const updatedUi5Config = yaml.load(fs.readFileSync(ui5YamlPath, "utf8"));
		const originalWorkspaceConfig = yaml.load(fs.readFileSync(workspaceYamlPath, "utf8"));

		// Verify ui5.yaml was updated
		t.truthy(updatedUi5Config.builder);
		t.truthy(updatedUi5Config.builder.customTasks);
		t.true(updatedUi5Config.builder.customTasks.some((task) => task.name === "ui5-tooling-modules-task"));
		t.truthy(updatedUi5Config.server);
		t.truthy(updatedUi5Config.server.customMiddleware);
		t.true(updatedUi5Config.server.customMiddleware.some((mw) => mw.name === "ui5-tooling-modules-middleware"));

		// Verify ui5-workspace.yaml was NOT updated
		t.falsy(originalWorkspaceConfig.builder);
		t.falsy(originalWorkspaceConfig.server);
	} finally {
		cleanupTempDir(tempDir);
	}
});

test("postinstall registers in ui5-workspace.yaml when explicitly specified", (t) => {
	const tempDir = createTempDir();

	try {
		// Create ui5-workspace.yaml
		const workspaceYamlPath = path.join(tempDir, "ui5-workspace.yaml");
		const workspaceConfig = createBasicUI5Yaml();
		fs.writeFileSync(workspaceYamlPath, yaml.dump(workspaceConfig));

		// Run postinstall with explicit workspace file
		runPostinstall(tempDir, "ui5-workspace.yaml");

		// Check if ui5-workspace.yaml was updated
		const updatedConfig = yaml.load(fs.readFileSync(workspaceYamlPath, "utf8"));

		// Verify task was added
		t.truthy(updatedConfig.builder);
		t.truthy(updatedConfig.builder.customTasks);
		t.true(updatedConfig.builder.customTasks.some((task) => task.name === "ui5-tooling-modules-task"));

		// Verify middleware was added
		t.truthy(updatedConfig.server);
		t.truthy(updatedConfig.server.customMiddleware);
		t.true(updatedConfig.server.customMiddleware.some((mw) => mw.name === "ui5-tooling-modules-middleware"));
	} finally {
		cleanupTempDir(tempDir);
	}
});

test("postinstall registers in both ui5.yaml and ui5-workspace.yaml when both are explicitly specified", (t) => {
	const tempDir = createTempDir();

	try {
		// Create both files
		const ui5YamlPath = path.join(tempDir, "ui5.yaml");
		const workspaceYamlPath = path.join(tempDir, "ui5-workspace.yaml");

		const ui5Config = createBasicUI5Yaml();
		const workspaceConfig = { ...createBasicUI5Yaml(), metadata: { name: "test-workspace" } };

		fs.writeFileSync(ui5YamlPath, yaml.dump(ui5Config));
		fs.writeFileSync(workspaceYamlPath, yaml.dump(workspaceConfig));

		// Run postinstall with both files explicitly specified
		runPostinstall(tempDir, "ui5.yaml,ui5-workspace.yaml");

		// Check both files were updated
		const updatedUi5Config = yaml.load(fs.readFileSync(ui5YamlPath, "utf8"));
		const updatedWorkspaceConfig = yaml.load(fs.readFileSync(workspaceYamlPath, "utf8"));

		// Verify ui5.yaml was updated
		t.truthy(updatedUi5Config.builder);
		t.truthy(updatedUi5Config.builder.customTasks);
		t.true(updatedUi5Config.builder.customTasks.some((task) => task.name === "ui5-tooling-modules-task"));
		t.truthy(updatedUi5Config.server);
		t.truthy(updatedUi5Config.server.customMiddleware);
		t.true(updatedUi5Config.server.customMiddleware.some((mw) => mw.name === "ui5-tooling-modules-middleware"));

		// Verify ui5-workspace.yaml was updated
		t.truthy(updatedWorkspaceConfig.builder);
		t.truthy(updatedWorkspaceConfig.builder.customTasks);
		t.true(updatedWorkspaceConfig.builder.customTasks.some((task) => task.name === "ui5-tooling-modules-task"));
		t.truthy(updatedWorkspaceConfig.server);
		t.truthy(updatedWorkspaceConfig.server.customMiddleware);
		t.true(updatedWorkspaceConfig.server.customMiddleware.some((mw) => mw.name === "ui5-tooling-modules-middleware"));
	} finally {
		cleanupTempDir(tempDir);
	}
});

test("postinstall registers only in specified file when using specific filename", (t) => {
	const tempDir = createTempDir();

	try {
		// Create both files
		const ui5YamlPath = path.join(tempDir, "ui5.yaml");
		const workspaceYamlPath = path.join(tempDir, "ui5-workspace.yaml");

		const ui5Config = createBasicUI5Yaml();
		const workspaceConfig = { ...createBasicUI5Yaml(), metadata: { name: "test-workspace" } };

		fs.writeFileSync(ui5YamlPath, yaml.dump(ui5Config));
		fs.writeFileSync(workspaceYamlPath, yaml.dump(workspaceConfig));

		// Run postinstall with specific file
		runPostinstall(tempDir, "ui5.yaml");

		// Check only ui5.yaml was updated
		const updatedUi5Config = yaml.load(fs.readFileSync(ui5YamlPath, "utf8"));
		const originalWorkspaceConfig = yaml.load(fs.readFileSync(workspaceYamlPath, "utf8"));

		// Verify ui5.yaml was updated
		t.truthy(updatedUi5Config.builder);
		t.truthy(updatedUi5Config.builder.customTasks);
		t.true(updatedUi5Config.builder.customTasks.some((task) => task.name === "ui5-tooling-modules-task"));

		// Verify ui5-workspace.yaml was NOT updated
		t.falsy(originalWorkspaceConfig.builder);
		t.falsy(originalWorkspaceConfig.server);
	} finally {
		cleanupTempDir(tempDir);
	}
});

test("postinstall registers in multiple specified files when using comma-separated list", (t) => {
	const tempDir = createTempDir();

	try {
		// Create multiple files
		const ui5YamlPath = path.join(tempDir, "ui5.yaml");
		const workspaceYamlPath = path.join(tempDir, "ui5-workspace.yaml");
		const customYamlPath = path.join(tempDir, "custom.yaml");

		const ui5Config = createBasicUI5Yaml();
		const workspaceConfig = { ...createBasicUI5Yaml(), metadata: { name: "test-workspace" } };
		const customConfig = { ...createBasicUI5Yaml(), metadata: { name: "test-custom" } };

		fs.writeFileSync(ui5YamlPath, yaml.dump(ui5Config));
		fs.writeFileSync(workspaceYamlPath, yaml.dump(workspaceConfig));
		fs.writeFileSync(customYamlPath, yaml.dump(customConfig));

		// Run postinstall with multiple specific files
		runPostinstall(tempDir, "ui5.yaml, ui5-workspace.yaml");

		// Check specified files were updated
		const updatedUi5Config = yaml.load(fs.readFileSync(ui5YamlPath, "utf8"));
		const updatedWorkspaceConfig = yaml.load(fs.readFileSync(workspaceYamlPath, "utf8"));
		const originalCustomConfig = yaml.load(fs.readFileSync(customYamlPath, "utf8"));

		// Verify ui5.yaml was updated
		t.truthy(updatedUi5Config.builder);
		t.true(updatedUi5Config.builder.customTasks.some((task) => task.name === "ui5-tooling-modules-task"));

		// Verify ui5-workspace.yaml was updated
		t.truthy(updatedWorkspaceConfig.builder);
		t.true(updatedWorkspaceConfig.builder.customTasks.some((task) => task.name === "ui5-tooling-modules-task"));

		// Verify custom.yaml was NOT updated
		t.falsy(originalCustomConfig.builder);
		t.falsy(originalCustomConfig.server);
	} finally {
		cleanupTempDir(tempDir);
	}
});

test("postinstall registers in custom named files", (t) => {
	const tempDir = createTempDir();

	try {
		// Create custom named files
		const customYamlPath = path.join(tempDir, "my-ui5.yaml");
		const customWorkspaceYamlPath = path.join(tempDir, "my-workspace.yaml");

		const customConfig = createBasicUI5Yaml();
		const customWorkspaceConfig = { ...createBasicUI5Yaml(), metadata: { name: "custom-workspace" } };

		fs.writeFileSync(customYamlPath, yaml.dump(customConfig));
		fs.writeFileSync(customWorkspaceYamlPath, yaml.dump(customWorkspaceConfig));

		// Run postinstall with custom file names
		runPostinstall(tempDir, "my-ui5.yaml,my-workspace.yaml");

		// Check custom files were updated
		const updatedCustomConfig = yaml.load(fs.readFileSync(customYamlPath, "utf8"));
		const updatedCustomWorkspaceConfig = yaml.load(fs.readFileSync(customWorkspaceYamlPath, "utf8"));

		// Verify both custom files were updated
		t.truthy(updatedCustomConfig.builder);
		t.true(updatedCustomConfig.builder.customTasks.some((task) => task.name === "ui5-tooling-modules-task"));

		t.truthy(updatedCustomWorkspaceConfig.builder);
		t.true(updatedCustomWorkspaceConfig.builder.customTasks.some((task) => task.name === "ui5-tooling-modules-task"));
	} finally {
		cleanupTempDir(tempDir);
	}
});

test("postinstall does not duplicate entries when run multiple times", (t) => {
	const tempDir = createTempDir();

	try {
		// Create ui5.yaml
		const ui5YamlPath = path.join(tempDir, "ui5.yaml");
		const ui5Config = createBasicUI5Yaml();
		fs.writeFileSync(ui5YamlPath, yaml.dump(ui5Config));

		// Run postinstall twice
		runPostinstall(tempDir);
		runPostinstall(tempDir);

		// Check if ui5.yaml has only one entry of each
		const updatedConfig = yaml.load(fs.readFileSync(ui5YamlPath, "utf8"));

		// Count occurrences
		const taskCount = updatedConfig.builder.customTasks.filter((task) => task.name === "ui5-tooling-modules-task").length;
		const middlewareCount = updatedConfig.server.customMiddleware.filter((mw) => mw.name === "ui5-tooling-modules-middleware").length;

		t.is(taskCount, 1, "Should have exactly one ui5-tooling-modules-task");
		t.is(middlewareCount, 1, "Should have exactly one ui5-tooling-modules-middleware");
	} finally {
		cleanupTempDir(tempDir);
	}
});

test("postinstall handles existing configurations correctly", (t) => {
	const tempDir = createTempDir();

	try {
		// Create ui5.yaml with existing custom tasks and middleware
		const ui5YamlPath = path.join(tempDir, "ui5.yaml");
		const ui5Config = {
			...createBasicUI5Yaml(),
			builder: {
				customTasks: [
					{
						name: "existing-task",
						afterTask: "minify",
					},
				],
			},
			server: {
				customMiddleware: [
					{
						name: "existing-middleware",
						afterMiddleware: "compression",
					},
				],
			},
		};
		fs.writeFileSync(ui5YamlPath, yaml.dump(ui5Config));

		// Run postinstall
		runPostinstall(tempDir);

		// Check if existing entries are preserved
		const updatedConfig = yaml.load(fs.readFileSync(ui5YamlPath, "utf8"));

		// Verify existing task is still there
		t.true(updatedConfig.builder.customTasks.some((task) => task.name === "existing-task"));

		// Verify existing middleware is still there
		t.true(updatedConfig.server.customMiddleware.some((mw) => mw.name === "existing-middleware"));

		// Verify new entries were added
		t.true(updatedConfig.builder.customTasks.some((task) => task.name === "ui5-tooling-modules-task"));
		t.true(updatedConfig.server.customMiddleware.some((mw) => mw.name === "ui5-tooling-modules-middleware"));
	} finally {
		cleanupTempDir(tempDir);
	}
});

test("postinstall does nothing when RTE flag is not set", (t) => {
	const tempDir = createTempDir();

	try {
		// Create ui5.yaml
		const ui5YamlPath = path.join(tempDir, "ui5.yaml");
		const ui5Config = createBasicUI5Yaml();
		const originalContent = yaml.dump(ui5Config);
		fs.writeFileSync(ui5YamlPath, originalContent);

		// Set environment variables without RTE flag
		const originalInitCwd = process.env.INIT_CWD;
		const originalRte = process.env.npm_config_rte;

		process.env.INIT_CWD = tempDir;
		delete process.env.npm_config_rte; // Ensure RTE flag is not set

		// Delete the module from require cache
		const postinstallPath = path.resolve(__dirname, "../lib/postinstall.js");
		delete require.cache[postinstallPath];

		try {
			// Run postinstall
			require(postinstallPath);
		} finally {
			// Restore environment variables
			if (originalInitCwd !== undefined) {
				process.env.INIT_CWD = originalInitCwd;
			} else {
				delete process.env.INIT_CWD;
			}

			if (originalRte !== undefined) {
				process.env.npm_config_rte = originalRte;
			}
		}

		// Check if ui5.yaml was NOT modified
		const finalContent = fs.readFileSync(ui5YamlPath, "utf8");
		t.is(finalContent, originalContent, "File should not have been modified");
	} finally {
		cleanupTempDir(tempDir);
	}
});

test("postinstall handles non-existent files gracefully", (t) => {
	const tempDir = createTempDir();

	try {
		// Don't create any files

		// Run postinstall with non-existent files
		runPostinstall(tempDir, "non-existent.yaml,another-missing.yaml");

		// Should not throw any errors and no files should be created
		t.false(fs.existsSync(path.join(tempDir, "non-existent.yaml")));
		t.false(fs.existsSync(path.join(tempDir, "another-missing.yaml")));
	} finally {
		cleanupTempDir(tempDir);
	}
});
