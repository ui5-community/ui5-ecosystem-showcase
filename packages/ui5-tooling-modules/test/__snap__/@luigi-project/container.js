sap.ui.define(['require', 'exports'], (function (require, exports) { 'use strict';

	function e() {}
	function t(e) {
	  return e();
	}
	function n() {
	  return Object.create(null);
	}
	function o(e) {
	  e.forEach(t);
	}
	function i(e) {
	  return "function" == typeof e;
	}
	function r(e, t) {
	  return e != e ? t == t : e !== t || e && "object" == typeof e || "function" == typeof e;
	}
	let s, a;
	function c(e, t) {
	  return (s || (s = document.createElement("a")), s.href = t, e === s.href);
	}
	function u(e, t, n) {
	  e.insertBefore(t, n || null);
	}
	function l(e) {
	  e.parentNode && e.parentNode.removeChild(e);
	}
	function d(e) {
	  return document.createElement(e);
	}
	function E() {
	  return (e = "", document.createTextNode(e));
	  var e;
	}
	function m(e, t, n) {
	  null == n ? e.removeAttribute(t) : e.getAttribute(t) !== n && e.setAttribute(t, n);
	}
	function _(e) {
	  const t = {};
	  for (const n of e) t[n.name] = n.value;
	  return t;
	}
	function h(e) {
	  a = e;
	}
	function p() {
	  if (!a) throw new Error("Function called outside component initialization");
	  return a;
	}
	function T(e) {
	  p().$$.on_mount.push(e);
	}
	const g = [], C = [], R = [], f = [], A = Promise.resolve();
	let S = !1;
	function I(e) {
	  R.push(e);
	}
	const w = new Set();
	let O = 0;
	function b() {
	  const e = a;
	  do {
	    for (; O < g.length; ) {
	      const e = g[O];
	      (O++, h(e), U(e.$$));
	    }
	    for ((h(null), g.length = 0, O = 0); C.length; ) C.pop()();
	    for (let e = 0; e < R.length; e += 1) {
	      const t = R[e];
	      w.has(t) || (w.add(t), t());
	    }
	    R.length = 0;
	  } while (g.length);
	  for (; f.length; ) f.pop()();
	  (S = !1, w.clear(), h(e));
	}
	function U(e) {
	  if (null !== e.fragment) {
	    (e.update(), o(e.before_update));
	    const t = e.dirty;
	    (e.dirty = [-1], e.fragment && e.fragment.p(e.ctx, t), e.after_update.forEach(I));
	  }
	}
	const N = new Set();
	function $(e, t) {
	  (-1 === e.$$.dirty[0] && (g.push(e), S || (S = !0, A.then(b)), e.$$.dirty.fill(0)), e.$$.dirty[t / 31 | 0] |= 1 << t % 31);
	}
	function v(r, s, c, u, d, E, m, _ = [-1]) {
	  const p = a;
	  h(r);
	  const T = r.$$ = {
	    fragment: null,
	    ctx: [],
	    props: E,
	    update: e,
	    not_equal: d,
	    bound: n(),
	    on_mount: [],
	    on_destroy: [],
	    on_disconnect: [],
	    before_update: [],
	    after_update: [],
	    context: new Map(s.context || (p ? p.$$.context : [])),
	    callbacks: n(),
	    dirty: _,
	    skip_bound: !1,
	    root: s.target || p.$$.root
	  };
	  m && m(T.root);
	  let g = !1;
	  if ((T.ctx = c ? c(r, s.props || ({}), (e, t, ...n) => {
	    const o = n.length ? n[0] : t;
	    return (T.ctx && d(T.ctx[e], T.ctx[e] = o) && (!T.skip_bound && T.bound[e] && T.bound[e](o), g && $(r, e)), t);
	  }) : [], T.update(), g = !0, o(T.before_update), T.fragment = !!u && u(T.ctx), s.target)) {
	    if (s.hydrate) {
	      const e = (function (e) {
	        return Array.from(e.childNodes);
	      })(s.target);
	      (T.fragment && T.fragment.l(e), e.forEach(l));
	    } else T.fragment && T.fragment.c();
	    (s.intro && ((C = r.$$.fragment) && C.i && (N.delete(C), C.i(R))), (function (e, n, r, s) {
	      const {fragment: a, after_update: c} = e.$$;
	      (a && a.m(n, r), s || I(() => {
	        const n = e.$$.on_mount.map(t).filter(i);
	        (e.$$.on_destroy ? e.$$.on_destroy.push(...n) : o(n), e.$$.on_mount = []);
	      }), c.forEach(I));
	    })(r, s.target, s.anchor, s.customElement), b());
	  }
	  var C, R;
	  h(p);
	}
	let D;
	var L, M;
	("function" == typeof HTMLElement && (D = class extends HTMLElement {
	  constructor() {
	    (super(), this.attachShadow({
	      mode: "open"
	    }));
	  }
	  connectedCallback() {
	    const {on_mount: e} = this.$$;
	    this.$$.on_disconnect = e.map(t).filter(i);
	    for (const e in this.$$.slotted) this.appendChild(this.$$.slotted[e]);
	  }
	  attributeChangedCallback(e, t, n) {
	    this[e] = n;
	  }
	  disconnectedCallback() {
	    o(this.$$.on_disconnect);
	  }
	  $destroy() {
	    (!(function (e, t) {
	      const n = e.$$;
	      null !== n.fragment && (o(n.on_destroy), n.fragment && n.fragment.d(t), n.on_destroy = n.fragment = null, n.ctx = []);
	    })(this, 1), this.$destroy = e);
	  }
	  $on(t, n) {
	    if (!i(n)) return e;
	    const o = this.$$.callbacks[t] || (this.$$.callbacks[t] = []);
	    return (o.push(n), () => {
	      const e = o.indexOf(n);
	      -1 !== e && o.splice(e, 1);
	    });
	  }
	  $set(e) {
	    var t;
	    this.$$set && (t = e, 0 !== Object.keys(t).length) && (this.$$.skip_bound = !0, this.$$set(e), this.$$.skip_bound = !1);
	  }
	}), (function (e) {
	  (e.CUSTOM_MESSAGE = "custom-message", e.GET_CONTEXT_REQUEST = "get-context-request", e.NAVIGATION_REQUEST = "navigation-request", e.ALERT_REQUEST = "show-alert-request", e.ALERT_CLOSED = "close-alert-request", e.INITIALIZED = "initialized", e.ADD_SEARCH_PARAMS_REQUEST = "add-search-params-request", e.ADD_NODE_PARAMS_REQUEST = "add-node-params-request", e.SHOW_CONFIRMATION_MODAL_REQUEST = "show-confirmation-modal-request", e.SHOW_LOADING_INDICATOR_REQUEST = "show-loading-indicator-request", e.HIDE_LOADING_INDICATOR_REQUEST = "hide-loading-indicator-request", e.SET_CURRENT_LOCALE_REQUEST = "set-current-locale-request", e.LOCAL_STORAGE_SET_REQUEST = "set-storage-request", e.RUNTIME_ERROR_HANDLING_REQUEST = "runtime-error-handling-request", e.SET_ANCHOR_LINK_REQUEST = "set-anchor-request", e.SET_THIRD_PARTY_COOKIES_REQUEST = "set-third-party-cookies-request", e.BACK_NAVIGATION_REQUEST = "navigate-back-request", e.GET_CURRENT_ROUTE_REQUEST = "get-current-route-request", e.NAVIGATION_COMPLETED_REPORT = "report-navigation-completed-request", e.UPDATE_MODAL_PATH_DATA_REQUEST = "update-modal-path-data-requesst", e.CHECK_PATH_EXISTS_REQUEST = "check-path-exists-request", e.SET_DIRTY_STATUS_REQUEST = "set-dirty-status-request");
	})(L || (L = {})), (function (e) {
	  (e.CUSTOM_MESSAGE = "custom", e.GET_CONTEXT = "luigi.get-context", e.SEND_CONTEXT_HANDSHAKE = "luigi.init", e.CONTEXT_RECEIVED = "luigi.init.ok", e.NAVIGATION_REQUEST = "luigi.navigation.open", e.ALERT_REQUEST = "luigi.ux.alert.show", e.ALERT_CLOSED = "luigi.ux.alert.hide", e.INITIALIZED = "luigi.init.ok", e.ADD_SEARCH_PARAMS_REQUEST = "luigi.addSearchParams", e.ADD_NODE_PARAMS_REQUEST = "luigi.addNodeParams", e.SHOW_CONFIRMATION_MODAL_REQUEST = "luigi.ux.confirmationModal.show", e.SHOW_LOADING_INDICATOR_REQUEST = "luigi.show-loading-indicator", e.HIDE_LOADING_INDICATOR_REQUEST = "luigi.hide-loading-indicator", e.SET_CURRENT_LOCALE_REQUEST = "luigi.ux.set-current-locale", e.LOCAL_STORAGE_SET_REQUEST = "storage", e.RUNTIME_ERROR_HANDLING_REQUEST = "luigi-runtime-error-handling", e.SET_ANCHOR_LINK_REQUEST = "luigi.setAnchor", e.SET_THIRD_PARTY_COOKIES_REQUEST = "luigi.third-party-cookie", e.BACK_NAVIGATION_REQUEST = "luigi.navigation.back", e.GET_CURRENT_ROUTE_REQUEST = "luigi.navigation.currentRoute", e.SEND_CONTEXT_OBJECT = "luigi.navigate", e.NAVIGATION_COMPLETED_REPORT = "luigi.navigate.ok", e.UPDATE_MODAL_PATH_DATA_REQUEST = "luigi.navigation.updateModalDataPath", e.CHECK_PATH_EXISTS_REQUEST = "luigi.navigation.pathExists", e.SET_DIRTY_STATUS_REQUEST = "luigi.set-page-dirty");
	})(M || (M = {})));
	const x = new (class {
	  isFunction(e) {
	    return e && "[object Function]" === ({}).toString.call(e);
	  }
	})();
	var Q;
	!(function (e) {
	  e.SEND_CONTEXT_TO_MICROFRONTEND = "sendContextToMicrofrontend";
	})(Q || (Q = {}));
	class y {
	  constructor() {}
	  isVisible(e) {
	    return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
	  }
	  sendCustomMessageToIframe(e, t, n) {
	    const o = n || "custom";
	    if (e.iframe.contentWindow) {
	      const n = new URL(e.iframe.src);
	      "custom" === o ? e.iframe.contentWindow.postMessage({
	        msg: o,
	        data: t
	      }, n.origin) : e.iframe.contentWindow.postMessage(Object.assign({
	        msg: o
	      }, t), n.origin);
	    } else console.error("Message target could not be resolved");
	  }
	  dispatch(e, t, n, o, i) {
	    let r = new CustomEvent(e, {
	      detail: n
	    });
	    (o && x.isFunction(o) && i && (r[i] = e => {
	      o(e);
	    }), t.dispatchEvent(r));
	  }
	  getTargetContainer(e) {
	    let t;
	    return (globalThis.__luigi_container_manager.container.forEach(n => {
	      var o;
	      (null === (o = n.iframeHandle) || void 0 === o ? void 0 : o.iframe) && n.iframeHandle.iframe.contentWindow === e.source && (t = n);
	    }), t);
	  }
	  getContainerManager() {
	    return (globalThis.__luigi_container_manager || (globalThis.__luigi_container_manager = {
	      container: [],
	      messageListener: e => {
	        var t, n;
	        const o = this.getTargetContainer(e), i = null === (n = null === (t = null == o ? void 0 : o.iframeHandle) || void 0 === t ? void 0 : t.iframe) || void 0 === n ? void 0 : n.contentWindow;
	        if (i === e.source) {
	          const t = e.data.msg;
	          switch (t) {
	            case M.CUSTOM_MESSAGE:
	              this.dispatch(L.CUSTOM_MESSAGE, o, e.data.data);
	              break;
	            case M.GET_CONTEXT:
	              i.postMessage({
	                msg: M.SEND_CONTEXT_HANDSHAKE,
	                context: o.context || ({}),
	                internal: {}
	              }, "*");
	              break;
	            case M.NAVIGATION_REQUEST:
	              this.dispatch(L.NAVIGATION_REQUEST, o, e.data.params);
	              break;
	            case M.ALERT_REQUEST:
	              this.dispatch(L.ALERT_REQUEST, o, e);
	              break;
	            case M.INITIALIZED:
	              this.dispatch(L.INITIALIZED, o, e.data.params);
	              break;
	            case M.ADD_SEARCH_PARAMS_REQUEST:
	              this.dispatch(L.ADD_SEARCH_PARAMS_REQUEST, o, {
	                data: e.data.data,
	                keepBrowserHistory: e.data.keepBrowserHistory
	              });
	              break;
	            case M.ADD_NODE_PARAMS_REQUEST:
	              this.dispatch(L.ADD_NODE_PARAMS_REQUEST, o, {
	                data: e.data.data,
	                keepBrowserHistory: e.data.keepBrowserHistory
	              });
	              break;
	            case M.SHOW_CONFIRMATION_MODAL_REQUEST:
	              this.dispatch(L.SHOW_CONFIRMATION_MODAL_REQUEST, o, e.data.data);
	              break;
	            case M.SHOW_LOADING_INDICATOR_REQUEST:
	              this.dispatch(L.SHOW_LOADING_INDICATOR_REQUEST, o, e);
	              break;
	            case M.HIDE_LOADING_INDICATOR_REQUEST:
	              this.dispatch(L.HIDE_LOADING_INDICATOR_REQUEST, o, e);
	              break;
	            case M.SET_CURRENT_LOCALE_REQUEST:
	              this.dispatch(L.SET_CURRENT_LOCALE_REQUEST, o, e);
	              break;
	            case M.LOCAL_STORAGE_SET_REQUEST:
	              this.dispatch(L.LOCAL_STORAGE_SET_REQUEST, o, e);
	              break;
	            case M.RUNTIME_ERROR_HANDLING_REQUEST:
	              this.dispatch(L.RUNTIME_ERROR_HANDLING_REQUEST, o, e);
	              break;
	            case M.SET_ANCHOR_LINK_REQUEST:
	              this.dispatch(L.SET_ANCHOR_LINK_REQUEST, o, e);
	              break;
	            case M.SET_THIRD_PARTY_COOKIES_REQUEST:
	              this.dispatch(L.SET_THIRD_PARTY_COOKIES_REQUEST, o, e);
	              break;
	            case M.BACK_NAVIGATION_REQUEST:
	              this.dispatch(L.BACK_NAVIGATION_REQUEST, o, e);
	              break;
	            case M.GET_CURRENT_ROUTE_REQUEST:
	              this.dispatch(L.GET_CURRENT_ROUTE_REQUEST, o, e);
	              break;
	            case M.NAVIGATION_COMPLETED_REPORT:
	              this.dispatch(L.NAVIGATION_COMPLETED_REPORT, o, e);
	              break;
	            case M.UPDATE_MODAL_PATH_DATA_REQUEST:
	              this.dispatch(L.UPDATE_MODAL_PATH_DATA_REQUEST, o, e);
	              break;
	            case M.CHECK_PATH_EXISTS_REQUEST:
	              this.dispatch(L.CHECK_PATH_EXISTS_REQUEST, o, e);
	              break;
	            case M.SET_DIRTY_STATUS_REQUEST:
	              this.dispatch(L.SET_DIRTY_STATUS_REQUEST, o, e);
	              break;
	            case "luigi.third-party-cookie":
	              break;
	            default:
	              console.warn("Functionality not yet implemented: ", t);
	          }
	        }
	      }
	    }, window.addEventListener("message", globalThis.__luigi_container_manager.messageListener)), globalThis.__luigi_container_manager);
	  }
	  registerContainer(e) {
	    this.getContainerManager().container.push(e);
	  }
	}
	const H = new y();
	class k {
	  constructor(e) {
	    e ? (this.rendererObject = e, this.config = e.config || ({})) : this.config = {};
	  }
	  createCompoundContainer() {
	    return document.createElement("div");
	  }
	  createCompoundItemContainer(e) {
	    return document.createElement("div");
	  }
	  attachCompoundItem(e, t) {
	    e.appendChild(t);
	  }
	}
	class P extends k {
	  constructor(e) {
	    (super(e || ({
	      use: {}
	    })), e && e.use && e.use.extends && (this.superRenderer = G({
	      use: e.use.extends,
	      config: e.config
	    })));
	  }
	  createCompoundContainer() {
	    return this.rendererObject.use.createCompoundContainer ? this.rendererObject.use.createCompoundContainer(this.config, this.superRenderer) : this.superRenderer ? this.superRenderer.createCompoundContainer() : super.createCompoundContainer();
	  }
	  createCompoundItemContainer(e) {
	    return this.rendererObject.use.createCompoundItemContainer ? this.rendererObject.use.createCompoundItemContainer(e, this.config, this.superRenderer) : this.superRenderer ? this.superRenderer.createCompoundItemContainer(e) : super.createCompoundItemContainer(e);
	  }
	  attachCompoundItem(e, t) {
	    this.rendererObject.use.attachCompoundItem ? this.rendererObject.use.attachCompoundItem(e, t, this.superRenderer) : this.superRenderer ? this.superRenderer.attachCompoundItem(e, t) : super.attachCompoundItem(e, t);
	  }
	}
	class W extends k {
	  createCompoundContainer() {
	    const e = "__lui_compound_" + new Date().getTime(), t = document.createElement("div");
	    t.classList.add(e);
	    let n = "";
	    return (this.config.layouts && this.config.layouts.forEach(t => {
	      if (t.minWidth || t.maxWidth) {
	        let o = "@media only screen ";
	        (null != t.minWidth && (o += `and (min-width: ${t.minWidth}px) `), null != t.maxWidth && (o += `and (max-width: ${t.maxWidth}px) `), o += `{\n            .${e} {\n              grid-template-columns: ${t.columns || "auto"};\n              grid-template-rows: ${t.rows || "auto"};\n              grid-gap: ${t.gap || "0"};\n            }\n          }\n          `, n += o);
	      }
	    }), t.innerHTML = `\n        <style scoped>\n          .${e} {\n            display: grid;\n            grid-template-columns: ${this.config.columns || "auto"};\n            grid-template-rows: ${this.config.rows || "auto"};\n            grid-gap: ${this.config.gap || "0"};\n            min-height: ${this.config.minHeight || "auto"};\n          }\n          ${n}\n        </style>\n    `, t);
	  }
	  createCompoundItemContainer(e) {
	    const t = e || ({}), n = document.createElement("div");
	    return (n.setAttribute("style", `grid-row: ${t.row || "auto"}; grid-column: ${t.column || "auto"}`), n);
	  }
	}
	const G = e => {
	  const t = e.use;
	  return t ? "grid" === t ? new W(e) : t.createCompoundContainer || t.createCompoundItemContainer || t.attachCompoundItem ? new P(e) : new k(e) : new k(e);
	}, q = (e, t, n, o) => {
	  (null == t ? void 0 : t.eventListeners) && t.eventListeners.forEach(t => {
	    const i = t.source + "." + t.name, r = e[i], s = {
	      wcElementId: n,
	      wcElement: o,
	      action: t.action,
	      converter: t.dataConverter
	    };
	    r ? r.push(s) : e[i] = [s];
	  });
	};
	class V {
	  constructor() {
	    this.containerService = new y();
	  }
	  dynamicImport(e) {
	    return import(e);
	  }
	  processViewUrl(e, t) {
	    return e;
	  }
	  attachWC(e, t, n, o, i, r) {
	    if (n && n.contains(t)) {
	      const s = document.createElement(e);
	      (r && s.setAttribute("nodeId", r), this.initWC(s, e, n, i, o, r), n.replaceChild(s, t), n._luigi_node && (n._luigi_mfe_webcomponent = s));
	    }
	  }
	  createClientAPI(e, t, n) {
	    return {
	      linkManager: () => {},
	      uxManager: () => ({
	        showAlert: e => {},
	        showConfirmationModal: async e => new Promise((e, t) => {
	          e(!0);
	        })
	      }),
	      getCurrentLocale: () => {},
	      publishEvent: e => {}
	    };
	  }
	  initWC(e, t, n, o, i, r) {
	    const s = this.createClientAPI(n, r, t);
	    if (e.__postProcess) {
	      const t = new URL(document.baseURI).origin === new URL(o, document.baseURI).origin ? new URL("./", new URL(o, document.baseURI)) : new URL("./", o);
	      e.__postProcess(i, s, t.origin + t.pathname);
	    } else (e.context = i, e.LuigiClient = s);
	  }
	  generateWCId(e) {
	    let t = "";
	    for (let n = 0; n < e.length; n++) t += e.charCodeAt(n).toString(16);
	    return "luigi-wc-" + t;
	  }
	  registerWCFromUrl(e, t) {
	    const n = this.processViewUrl(e);
	    return new Promise((e, o) => {
	      this.checkWCUrl(n) ? this.dynamicImport(n).then(n => {
	        try {
	          if (!window.customElements.get(t)) {
	            let e = n.default;
	            if (!HTMLElement.isPrototypeOf(e)) {
	              let t = Object.keys(n);
	              for (let o = 0; o < t.length && (e = n[t[o]], !HTMLElement.isPrototypeOf(e)); o++) ;
	            }
	            window.customElements.define(t, e);
	          }
	          e(1);
	        } catch (e) {
	          o(e);
	        }
	      }).catch(e => o(e)) : (console.warn(`View URL '${n}' not allowed to be included`), o(`View URL '${n}' not allowed`));
	    });
	  }
	  includeSelfRegisteredWCFromUrl(e, t, n) {
	    if (this.checkWCUrl(t)) {
	      this.containerService.getContainerManager()._registerWebcomponent || (this.containerService.getContainerManager()._registerWebcomponent = (e, t) => {
	        window.customElements.define(this.generateWCId(e), t);
	      });
	      let o = document.createElement("script");
	      (o.setAttribute("src", t), "module" === e.webcomponent.type && o.setAttribute("type", "module"), o.setAttribute("defer", "true"), o.addEventListener("load", () => {
	        n();
	      }), document.body.appendChild(o));
	    } else console.warn(`View URL '${t}' not allowed to be included`);
	  }
	  checkWCUrl(e) {
	    return !0;
	  }
	  renderWebComponent(e, t, n, o, i) {
	    const r = this.processViewUrl(e, {
	      context: n
	    }), s = o.webcomponent && o.webcomponent.tagName ? o.webcomponent.tagName : this.generateWCId(r), a = document.createElement("div");
	    (t.appendChild(a), t._luigi_node = o, window.customElements.get(s) ? this.attachWC(s, a, t, n, r, i) : window.luigiWCFn ? window.luigiWCFn(r, s, a, () => {
	      this.attachWC(s, a, t, n, r, i);
	    }) : o.webcomponent && o.webcomponent.selfRegistered ? this.includeSelfRegisteredWCFromUrl(o, r, () => {
	      this.attachWC(s, a, t, n, r, i);
	    }) : this.registerWCFromUrl(r, s).then(() => {
	      this.attachWC(s, a, t, n, r, i);
	    }));
	  }
	  createCompoundContainerAsync(e, t) {
	    return new Promise((n, o) => {
	      if (e.viewUrl) try {
	        const o = this.generateWCId(e.viewUrl);
	        this.registerWCFromUrl(e.viewUrl, o).then(() => {
	          const i = document.createElement(o);
	          (this.initWC(i, o, i, e.viewUrl, t, "_root"), n(i));
	        });
	      } catch (e) {
	        o(e);
	      } else n(e.createCompoundContainer());
	    });
	  }
	  renderWebComponentCompound(e, t, n) {
	    var o;
	    let i;
	    return (e.webcomponent && e.viewUrl ? (i = new k(), i.viewUrl = this.processViewUrl(e.viewUrl, {
	      context: n
	    }), i.createCompoundItemContainer = e => {
	      var t = document.createElement("div");
	      return (e && e.slot && t.setAttribute("slot", e.slot), t);
	    }) : (null === (o = e.compound) || void 0 === o ? void 0 : o.renderer) && (i = G(e.compound.renderer)), i = i || new k(), new Promise(o => {
	      this.createCompoundContainerAsync(i, n).then(r => {
	        var s;
	        const a = {};
	        (r.eventBus = {
	          listeners: a,
	          onPublishEvent: (e, t, n) => {
	            const o = a[t + "." + e.type] || [];
	            (o.push(...a["*." + e.type] || []), o.forEach(t => {
	              const n = t.wcElement || r.querySelector("[nodeId=" + t.wcElementId + "]");
	              n ? n.dispatchEvent(new CustomEvent(t.action, {
	                detail: t.converter ? t.converter(e.detail) : e.detail
	              })) : console.debug("Could not find event target", t);
	            }));
	          }
	        }, null === (s = e.compound) || void 0 === s || s.children.forEach((e, t) => {
	          const o = Object.assign(Object.assign({}, n), e.context), s = i.createCompoundItemContainer(e.layoutConfig);
	          (s.eventBus = r.eventBus, i.attachCompoundItem(r, s));
	          const c = e.id || "gen_" + t;
	          (this.renderWebComponent(e.viewUrl, s, o, e, c), q(a, e, c));
	        }), t.appendChild(r), q(a, e.compound, "_root", r), o(r));
	      });
	    }));
	  }
	}
	const K = new (class {
	  constructor() {
	    (this.updateContext = (e, t, n) => {
	      if (n) {
	        const o = t || ({});
	        H.sendCustomMessageToIframe(n, {
	          context: e,
	          internal: o
	        }, M.SEND_CONTEXT_OBJECT);
	      } else console.warn("Attempting to update context on inexisting iframe");
	    }, this.sendCustomMessage = (e, t, n, o, i) => {
	      if (n && t._luigi_mfe_webcomponent) H.dispatch(e, t._luigi_mfe_webcomponent, i); else {
	        const t = Object.assign({}, i);
	        (t.id && console.warn("Property \"id\" is reserved and can not be used in custom message data"), t.id = e, H.sendCustomMessageToIframe(o, t));
	      }
	    });
	  }
	  closeAlert(e, t, n) {
	    H.sendCustomMessageToIframe(n, {
	      id: e,
	      dismissKey: t
	    }, M.ALERT_CLOSED);
	  }
	})();
	function F(e) {
	  let t, n = !e[5](), o = n && (function (e) {
	    let t, n;
	    return {
	      c() {
	        (t = d("iframe"), c(t.src, n = e[0]) || m(t, "src", n), m(t, "title", e[1]));
	      },
	      m(n, o) {
	        (u(n, t, o), e[8](t));
	      },
	      p(e, o) {
	        (1 & o && !c(t.src, n = e[0]) && m(t, "src", n), 2 & o && m(t, "title", e[1]));
	      },
	      d(n) {
	        (n && l(t), e[8](null));
	      }
	    };
	  })(e);
	  return {
	    c() {
	      (o && o.c(), t = E());
	    },
	    m(e, n) {
	      (o && o.m(e, n), u(e, t, n));
	    },
	    p(e, t) {
	      n && o.p(e, t);
	    },
	    d(e) {
	      (o && o.d(e), e && l(t));
	    }
	  };
	}
	function j(t) {
	  let n, o = !t[4] && F(t);
	  return {
	    c() {
	      (n = d("main"), o && o.c(), this.c = e, m(n, "class", t[5]() ? void 0 : "lui-isolated"));
	    },
	    m(e, i) {
	      (u(e, n, i), o && o.m(n, null), t[9](n));
	    },
	    p(e, [t]) {
	      e[4] ? o && (o.d(1), o = null) : o ? o.p(e, t) : (o = F(e), o.c(), o.m(n, null));
	    },
	    i: e,
	    o: e,
	    d(e) {
	      (e && l(n), o && o.d(), t[9](null));
	    }
	  };
	}
	function B(e, t, n) {
	  let o, {viewurl: i} = t, {context: r} = t, {label: s} = t, {webcomponent: a} = t, c = {};
	  const u = new V();
	  u.createClientAPI = (e, t, n) => ({
	    linkManager: () => ({
	      navigate: e => {
	        E("navigation-request", {
	          link: e
	        });
	      }
	    }),
	    uxManager: () => ({
	      showAlert: e => {
	        E("alert-request", e);
	      },
	      showConfirmationModal: async e => new Promise((t, n) => {
	        E("confirmation-request", e, e => {
	          e ? t(e) : n();
	        });
	      })
	    }),
	    getCurrentLocale: () => {},
	    publishEvent: e => {}
	  });
	  const l = p();
	  l.iframeHandle = c;
	  let d = !!l.attributes["defer-init"];
	  function E(e, t, n) {
	    H.dispatch(e, l, t, n);
	  }
	  function m() {
	    return !!a;
	  }
	  var _;
	  return (l.init = () => {
	    n(4, d = !1);
	  }, l.sendCustomMessage = (e, t) => {
	    K.sendCustomMessage(e, o, m(), c, t);
	  }, l.updateContext = (e, t) => {
	    K.updateContext(e, t, c);
	  }, l.closeAlert = (e, t) => {
	    K.closeAlert(e, t, c);
	  }, H.registerContainer(l), T(async () => {
	    const e = r ? JSON.parse(r) : {};
	    m() && (n(3, o.innerHTML = "", o), u.renderWebComponent(i, o, e, {}));
	  }), _ = async () => {}, p().$$.on_destroy.push(_), e.$$set = e => {
	    (("viewurl" in e) && n(0, i = e.viewurl), ("context" in e) && n(6, r = e.context), ("label" in e) && n(1, s = e.label), ("webcomponent" in e) && n(7, a = e.webcomponent));
	  }, [i, s, c, o, d, m, r, a, function (e) {
	    C[e ? "unshift" : "push"](() => {
	      (c.iframe = e, n(2, c));
	    });
	  }, function (e) {
	    C[e ? "unshift" : "push"](() => {
	      (o = e, n(3, o));
	    });
	  }]);
	}
	class X extends D {
	  constructor(e) {
	    (super(), this.shadowRoot.innerHTML = "<style>main,iframe{width:100%;height:100%;border:none}main.lui-isolated{line-height:0}</style>", v(this, {
	      target: this.shadowRoot,
	      props: _(this.attributes),
	      customElement: !0
	    }, B, j, r, {
	      viewurl: 0,
	      context: 6,
	      label: 1,
	      webcomponent: 7
	    }, null), e && (e.target && u(e.target, this, e.anchor), e.props && (this.$set(e.props), b())));
	  }
	  static get observedAttributes() {
	    return ["viewurl", "context", "label", "webcomponent"];
	  }
	  get viewurl() {
	    return this.$$.ctx[0];
	  }
	  set viewurl(e) {
	    (this.$$set({
	      viewurl: e
	    }), b());
	  }
	  get context() {
	    return this.$$.ctx[6];
	  }
	  set context(e) {
	    (this.$$set({
	      context: e
	    }), b());
	  }
	  get label() {
	    return this.$$.ctx[1];
	  }
	  set label(e) {
	    (this.$$set({
	      label: e
	    }), b());
	  }
	  get webcomponent() {
	    return this.$$.ctx[7];
	  }
	  set webcomponent(e) {
	    (this.$$set({
	      webcomponent: e
	    }), b());
	  }
	}
	function Y(t) {
	  let n;
	  return {
	    c() {
	      (n = d("main"), this.c = e);
	    },
	    m(e, o) {
	      (u(e, n, o), t[2](n));
	    },
	    p: e,
	    i: e,
	    o: e,
	    d(e) {
	      (e && l(n), t[2](null));
	    }
	  };
	}
	function J(e, t, n) {
	  let o, {context: i} = t, r = !1;
	  const s = new y(), a = new V();
	  a.createClientAPI = (e, t, n) => ({
	    linkManager: () => {},
	    uxManager: () => ({
	      showAlert: e => {
	        u("alert-request", e, {});
	      },
	      showConfirmationModal: async e => new Promise((t, n) => {
	        u("confirmation-request", e, e => {
	          e ? t(e) : n();
	        });
	      })
	    }),
	    getCurrentLocale: () => {},
	    publishEvent: o => {
	      e && e.eventBus && e.eventBus.onPublishEvent(o, t, n);
	    }
	  });
	  const c = p();
	  function u(e, t, n) {
	    s.dispatch(e, c, t, n);
	  }
	  return (c.attributes["defer-init"], c.init = () => {
	    if (!c.compoundConfig || r) return;
	    const e = {
	      compound: c.compoundConfig
	    };
	    (a.renderWebComponentCompound(e, o, i).then(e => {}), r = !0);
	  }, s.registerContainer(c), T(async () => {
	    !i || JSON.parse(i);
	  }), e.$$set = e => {
	    ("context" in e) && n(1, i = e.context);
	  }, [o, i, function (e) {
	    C[e ? "unshift" : "push"](() => {
	      (o = e, n(0, o));
	    });
	  }]);
	}
	class Z extends D {
	  constructor(e) {
	    (super(), this.shadowRoot.innerHTML = "<style>main{width:100%;height:100%;border:none}</style>", v(this, {
	      target: this.shadowRoot,
	      props: _(this.attributes),
	      customElement: !0
	    }, J, Y, r, {
	      context: 1
	    }, null), e && (e.target && u(e.target, this, e.anchor), e.props && (this.$set(e.props), b())));
	  }
	  static get observedAttributes() {
	    return ["context"];
	  }
	  get context() {
	    return this.$$.ctx[1];
	  }
	  set context(e) {
	    (this.$$set({
	      context: e
	    }), b());
	  }
	}
	var z = L;
	(customElements.get("luigi-container") || customElements.define("luigi-container", X), customElements.get("luigi-compound-container") || customElements.define("luigi-compound-container", Z));

	Object.defineProperty(z, "__" + "esModule", { value: true });

	exports.LuigiCompoundContainer = Z;
	exports.LuigiContainer = X;
	exports.default = z;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
