sap.ui.define(['ui5/ecosystem/demo/app/resources/index2'], (function (index$1) { 'use strict';

	function _mergeNamespaces(n, m) {
		m.forEach(function (e) {
			e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
				if (k !== 'default' && !(k in n)) {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () { return e[k]; }
					});
				}
			});
		});
		return Object.freeze(n);
	}

	var reactExports = index$1.requireReact();
	var defExp = /*@__PURE__*/index$1.getDefaultExportFromCjs(reactExports);

	var namedExports = /*#__PURE__*/_mergeNamespaces({
		__proto__: null,
		default: defExp
	}, [reactExports]);

	const defaultExports = Object.isFrozen(defExp) ? Object.assign({}, defExp?.default || defExp || { __emptyModule: true }) : defExp;
	Object.keys(namedExports || {}).filter((key) => !defaultExports[key]).forEach((key) => defaultExports[key] = namedExports[key]);
	Object.defineProperty(defaultExports, "__" + "esModule", { value: true });
	var index = Object.isFrozen(defExp) ? Object.freeze(defaultExports) : defaultExports;

	return index;

}));
