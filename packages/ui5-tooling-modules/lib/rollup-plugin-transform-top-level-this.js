/**
 * Rollup plugin: rewrite top-level `this.foo = ...` to `exports.foo = ...`
 * inside CommonJS-flavoured modules.
 *
 * Some UMD/CommonJS bundles ship code like:
 *
 *     this.MyLib = this.MyLib || {};
 *     this.MyLib.helper = function () { ... };
 *
 * In a browser/UI5 runtime that `this` is the AMD wrapper's `this`, which
 * is `undefined` in strict mode and produces silent breakage. This plugin
 * walks the AST, detects top-level `this`-as-MemberExpression-object usage
 * outside ESM constructs, and rewrites those occurrences to `exports`
 * (which `@rollup/plugin-commonjs` already exposes).
 *
 * ESM modules are detected by the presence of any `Import*` /
 * `Export*Declaration` and skipped entirely so genuine ES module code is
 * never touched. Function bodies are skipped too — only true top-level
 * `this` references are rewritten.
 *
 * @param {object} options plugin options
 * @param {{ info: (msg: string) => void }} [options.log] UI5 task / middleware logger
 * @param {(ast: object, visitor: object) => void} options.walk
 *        AST walker (estree-walker `walk`) injected by the caller
 * @returns {import('rollup').Plugin} configured rollup plugin
 */
const escodegen = require("@javascript-obfuscator/escodegen"); // escodegen itself isn't released anymore since 2020 => using fork

/* eslint-disable no-unused-vars */
module.exports = function ({ log, walk } = {}) {
	return {
		name: "transform-top-level-this",
		transform: function (code, id) {
			const ast = this.parse(code);
			let hasTopLevelThis = false;
			walk(ast, {
				enter(node, parent) {
					if (node.type === "FunctionExpression" || node.type === "FunctionDeclaration") {
						this.skip();
					} else if (node.type === "ImportDeclaration" || node.type === "ExportDeclaration" || node.type === "ExportDefaultDeclaration" || node.type === "ExportNamedDeclaration") {
						hasTopLevelThis = false; // for ESM we ignore top level this
						this.skip();
					}
				},
				leave: function (node, parent) {
					if (node?.type === "ThisExpression" && parent?.type === "MemberExpression") {
						hasTopLevelThis = true;
					}
				},
			});
			if (hasTopLevelThis) {
				log.info(`Transforming top-level "this" to "exports" in non ES module ${id}!`);
				walk(ast, {
					enter(node, parent) {
						if (node.type === "FunctionExpression" || node.type === "FunctionDeclaration") {
							this.skip();
						}
					},
					leave: function (node, parent) {
						if (node?.type === "ThisExpression" && parent?.type === "MemberExpression") {
							this.replace({
								name: "exports",
								type: "Identifier",
							});
						}
					},
				});
				return escodegen.generate(ast);
			}
		},
	};
};
