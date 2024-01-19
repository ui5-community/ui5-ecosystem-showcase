const estraverse = require("estraverse");
const escodegen = require("@javascript-obfuscator/escodegen"); // escodegen itself isn't released anymore since 2020 => using fork

/* eslint-disable no-unused-vars */
module.exports = function ({ log } = {}) {
	return {
		name: "transform-top-level-this",
		transform: function (code, id) {
			const ast = this.parse(code);
			let hasTopLevelThis = false;
			estraverse.traverse(ast, {
				enter(node, parent) {
					if (node.type === "FunctionExpression" || node.type === "FunctionDeclaration") {
						this.skip();
					} else if (node.type === "ImportDeclaration" || node.type === "ExportDeclaration" || node.type === "ExportDefaultDeclaration" || node.type === "ExportNamedDeclaration") {
						hasTopLevelThis = false; // for ESM we ignore top level this
						this.break();
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
				estraverse.replace(ast, {
					enter(node, parent) {
						if (node.type === "FunctionExpression" || node.type === "FunctionDeclaration") {
							this.skip();
						}
					},
					leave: function (node, parent) {
						if (node?.type === "ThisExpression" && parent?.type === "MemberExpression") {
							return {
								name: "exports",
								type: "Identifier",
							};
						}
					},
				});
				return escodegen.generate(ast);
			}
		},
	};
};
