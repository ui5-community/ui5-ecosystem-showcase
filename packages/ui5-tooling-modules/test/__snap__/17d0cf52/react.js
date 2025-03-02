sap.ui.define(['./index2'], (function (index$1) { 'use strict';

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

	var namedExports = /*#__PURE__*/_mergeNamespaces({
		__proto__: null,
		default: reactExports
	}, [reactExports]);

	const defaultExports = Object.isFrozen(reactExports) ? Object.assign({}, reactExports?.default || reactExports || { __emptyModule: true }) : reactExports;
	Object.keys(namedExports || {}).filter((key) => !defaultExports[key]).forEach((key) => defaultExports[key] = namedExports[key]);
	Object.defineProperty(defaultExports, "__" + "esModule", { value: true });
	var index = Object.isFrozen(reactExports) ? Object.freeze(defaultExports) : defaultExports;

	return index;

}));
